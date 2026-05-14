"""Backend regression tests for the review_request:
 - super-admin creates photographer with `initial_credits` (NOT total_credits)
 - super-admin credits add / deduct
 - super-admin credits ledger schema
 - super-admin admins {id}/status suspend then activate
 - photographer profile data isolation: GET /api/admin/profiles
 - AI story friendly 503 message (not raw 502 stack)
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")

BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

SUPER_ADMIN_EMAIL = "superadmin@wedding.com"
SUPER_ADMIN_PASSWORD = "SuperAdmin@123"
PHOTO_EMAIL = "studio@maharani.com"
PHOTO_PASSWORD = "Studio@123"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "User-Agent": BROWSER_UA,
        "Accept": "application/json,text/html",
        "Accept-Language": "en-US,en;q=0.9",
    })
    return s


def _login(api, email, password):
    r = api.post(f"{BASE_URL}/api/auth/login",
                 json={"email": email, "password": password})
    if r.status_code != 200:
        pytest.skip(f"login {email} failed: {r.status_code} {r.text[:200]}")
    j = r.json()
    return j.get("access_token") or j.get("token"), j.get("admin", {})


@pytest.fixture(scope="module")
def super_token(api):
    tok, _ = _login(api, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD)
    return tok


@pytest.fixture(scope="module")
def photo_token_and_admin(api):
    return _login(api, PHOTO_EMAIL, PHOTO_PASSWORD)


@pytest.fixture(scope="module")
def created_admin(api, super_token):
    """Create a fresh admin we own for credit / status testing."""
    email = f"TEST_admin_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Test Photographer",
        "email": email,
        "password": "TestPass@123",
        "initial_credits": 250,
    }
    r = api.post(f"{BASE_URL}/api/super-admin/admins",
                 headers={"Authorization": f"Bearer {super_token}"},
                 json=payload)
    assert r.status_code in (200, 201), f"create admin failed: {r.status_code} {r.text[:300]}"
    d = r.json()
    admin_obj = d.get("admin") or d
    assert admin_obj.get("id"), f"no id in response: {d}"
    return admin_obj


# ---------- Login payload regression ----------
class TestLoginPayload:
    def test_super_admin_login_returns_token_and_credits(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD})
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        d = r.json()
        assert d.get("access_token"), f"missing access_token: {d}"
        admin = d.get("admin", {})
        assert admin.get("email", "").lower() == SUPER_ADMIN_EMAIL.lower()
        assert "available_credits" in admin
        assert isinstance(admin["available_credits"], int)

    def test_photographer_login_returns_token_and_credits(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"email": PHOTO_EMAIL, "password": PHOTO_PASSWORD})
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        d = r.json()
        assert d.get("access_token")
        admin = d.get("admin", {})
        # Bug-fix: must NOT be 0; PRD says seeded 200 initial + 200 referral = 400
        assert admin["available_credits"] > 0, f"available_credits should be >0, got {admin['available_credits']}"


# ---------- /auth/me regression (server.py:646 fix) ----------
class TestAuthMe:
    def test_auth_me_photographer_credits_derived(self, api, photo_token_and_admin):
        tok, _ = photo_token_and_admin
        r = api.get(f"{BASE_URL}/api/auth/me",
                    headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        d = r.json()
        assert d["available_credits"] == d.get("total_credits", 0) - d.get("used_credits", 0)
        assert d["available_credits"] > 0


# ---------- Super-admin create admin uses initial_credits ----------
class TestCreateAdmin:
    def test_initial_credits_field_creates_ledger(self, api, super_token, created_admin):
        admin_id = created_admin["id"]
        # The freshly created admin should have available_credits >= 250
        # Via the ledger endpoint
        r = api.get(f"{BASE_URL}/api/super-admin/credits/ledger/{admin_id}",
                    headers={"Authorization": f"Bearer {super_token}"})
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        entries = r.json()
        if isinstance(entries, dict):
            entries = entries.get("entries") or entries.get("data") or []
        assert isinstance(entries, list) and len(entries) >= 1, f"no ledger entries: {entries}"


# ---------- Credit add / deduct + ledger schema ----------
class TestCreditOps:
    def test_add_credits_then_deduct(self, api, super_token, created_admin):
        admin_id = created_admin["id"]
        # ADD 50
        r1 = api.post(f"{BASE_URL}/api/super-admin/credits/add",
                      headers={"Authorization": f"Bearer {super_token}"},
                      json={"admin_id": admin_id, "amount": 50, "reason": "topup test"})
        assert r1.status_code in (200, 201), f"add failed: {r1.status_code} {r1.text[:300]}"

        # DEDUCT 20
        r2 = api.post(f"{BASE_URL}/api/super-admin/credits/deduct",
                      headers={"Authorization": f"Bearer {super_token}"},
                      json={"admin_id": admin_id, "amount": 20, "reason": "deduct test"})
        assert r2.status_code in (200, 201), f"deduct failed: {r2.status_code} {r2.text[:300]}"

        # Ledger contains both entries with schema fields
        r3 = api.get(f"{BASE_URL}/api/super-admin/credits/ledger/{admin_id}",
                     headers={"Authorization": f"Bearer {super_token}"})
        assert r3.status_code == 200
        entries = r3.json()
        if isinstance(entries, dict):
            entries = entries.get("entries") or entries.get("data") or []
        assert len(entries) >= 3, f"expected >=3 ledger entries, got {len(entries)}"
        sample = entries[0]
        # Required schema fields per review_request
        required = {"action_type", "amount", "balance_before", "balance_after", "reason", "performed_by", "created_at"}
        missing = required - set(sample.keys())
        # credit_id may be aliased as id
        has_id = "credit_id" in sample or "id" in sample
        assert not missing, f"ledger missing fields {missing}; sample={sample}"
        assert has_id, f"ledger missing credit_id/id; sample={sample}"


# ---------- Admin status suspend / activate ----------
class TestAdminStatus:
    def test_suspend_then_activate(self, api, super_token, created_admin):
        admin_id = created_admin["id"]
        # NOTE: endpoint takes `status` as query param (FastAPI signature), not body
        r1 = api.put(f"{BASE_URL}/api/super-admin/admins/{admin_id}/status",
                     headers={"Authorization": f"Bearer {super_token}"},
                     params={"status": "suspended"})
        assert r1.status_code in (200, 204), f"suspend failed: {r1.status_code} {r1.text[:300]}"

        # Activate
        r2 = api.put(f"{BASE_URL}/api/super-admin/admins/{admin_id}/status",
                     headers={"Authorization": f"Bearer {super_token}"},
                     params={"status": "active"})
        assert r2.status_code in (200, 204), f"activate failed: {r2.status_code} {r2.text[:300]}"


# ---------- Photographer data isolation ----------
class TestProfileIsolation:
    def test_admin_profiles_returns_list(self, api, photo_token_and_admin):
        tok, admin = photo_token_and_admin
        r = api.get(f"{BASE_URL}/api/admin/profiles",
                    headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        if isinstance(data, dict):
            profiles = data.get("profiles") or data.get("data") or []
        else:
            profiles = data
        assert isinstance(profiles, list)
        # Every profile must belong to the logged-in admin
        admin_id = admin.get("id")
        if admin_id and profiles:
            for p in profiles:
                owner = p.get("admin_id") or p.get("owner_id") or p.get("created_by")
                if owner is not None:
                    assert owner == admin_id, f"profile owned by different admin: {owner} != {admin_id}"


# ---------- AI Story friendly 503 message (not raw stack) ----------
class TestAIStoryFriendly:
    def test_ai_story_returns_200_or_friendly_503(self, api):
        tok, _ = _login(api, PHOTO_EMAIL, PHOTO_PASSWORD)
        payload = {
            "kind": "invitation",
            "bride": "Anaya",
            "groom": "Rohan",
            "theme": "royal_mughal",
            "tone": "cinematic_royal",
            "language": "English",
            "event_name": "Wedding",
            "notes": "Met in Mumbai",
        }
        r = requests.post(f"{BASE_URL}/api/admin/ai/story",
                          headers={
                              "Authorization": f"Bearer {tok}",
                              "Content-Type": "application/json",
                              "User-Agent": BROWSER_UA,
                          },
                          json=payload, timeout=60)
        # PASS if 200 with story, OR 503 with friendly message
        if r.status_code == 200:
            d = r.json()
            assert "story" in d and len(str(d["story"]).strip()) > 40
        elif r.status_code == 503:
            d = r.json()
            detail = str(d.get("detail", "")).lower()
            assert "ai muse" in detail or "resting" in detail or "try again" in detail, (
                f"503 detail not friendly: {d}"
            )
        else:
            pytest.fail(f"unexpected status {r.status_code}: {r.text[:400]}")
