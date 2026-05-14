"""Backend tests for AI Story Composer and regression: /api/auth/me, photographer admin.

Security middleware blocks bot UAs — use a browser User-Agent.
"""
import os
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "wedding_invitations")

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


@pytest.fixture(scope="module")
def super_admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login",
                 json={"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"super admin login failed: {r.status_code} {r.text[:200]}")
    return r.json().get("access_token") or r.json().get("token")


@pytest.fixture(scope="module")
def photo_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login",
                 json={"email": PHOTO_EMAIL, "password": PHOTO_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"photographer login failed: {r.status_code} {r.text[:200]}")
    return r.json().get("access_token") or r.json().get("token")


@pytest.fixture(scope="module")
def mongo():
    c = MongoClient(MONGO_URL)
    return c[DB_NAME]


# ---------- Regression: /api/auth/me available_credits backfill ----------
class TestAuthMeRegression:
    def test_auth_me_super_admin_returns_200(self, api, super_admin_token):
        r = api.get(f"{BASE_URL}/api/auth/me",
                    headers={"Authorization": f"Bearer {super_admin_token}"})
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert "available_credits" in data, f"missing available_credits: {data}"
        assert data["email"].lower() == SUPER_ADMIN_EMAIL.lower()

    def test_auth_me_photographer_returns_200(self, api, photo_token):
        r = api.get(f"{BASE_URL}/api/auth/me",
                    headers={"Authorization": f"Bearer {photo_token}"})
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert "available_credits" in data
        assert isinstance(data["available_credits"], int)
        assert data["available_credits"] >= 100, f"expected >=100 credits, got {data['available_credits']}"


# ---------- AI Story Composer ----------
class TestAIStory:
    def test_ai_story_no_auth_returns_401_or_403(self, api):
        r = api.post(f"{BASE_URL}/api/admin/ai/story",
                     json={"kind": "invitation", "bride": "A", "groom": "B"})
        assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}"

    def test_ai_story_missing_bride_returns_400_or_422(self, api, photo_token):
        r = api.post(f"{BASE_URL}/api/admin/ai/story",
                     headers={"Authorization": f"Bearer {photo_token}"},
                     json={"kind": "invitation", "groom": "Rohan"})
        assert r.status_code in (400, 422), f"expected 400/422, got {r.status_code}: {r.text[:300]}"

    def test_ai_story_empty_bride_returns_400(self, api, photo_token):
        r = api.post(f"{BASE_URL}/api/admin/ai/story",
                     headers={"Authorization": f"Bearer {photo_token}"},
                     json={"kind": "invitation", "bride": "", "groom": "Rohan"})
        assert r.status_code in (400, 422), f"expected 400/422, got {r.status_code}: {r.text[:300]}"

    def test_ai_story_valid_returns_prose_and_persists(self, api, photo_token, mongo):
        before = mongo.ai_story_logs.count_documents({})
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
        r = api.post(f"{BASE_URL}/api/admin/ai/story",
                     headers={"Authorization": f"Bearer {photo_token}"},
                     json=payload,
                     timeout=60)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:400]}"
        data = r.json()
        assert "story" in data, f"missing story key: {data}"
        story = data["story"]
        assert isinstance(story, str) and len(story.strip()) > 80, (
            f"story too short / empty: {story[:200]}"
        )
        # bride/groom names should be referenced
        assert "Anaya" in story or "Rohan" in story, f"names not in story: {story[:200]}"

        # Persistence check
        after = mongo.ai_story_logs.count_documents({})
        assert after >= before + 1, f"ai_story_logs did not grow: before={before}, after={after}"


# ---------- Super Admin can still create admins ----------
class TestSuperAdminCreateAdminRegression:
    def test_create_admin_via_super_admin(self, api, super_admin_token):
        # Use unique email so we don't conflict with seeded photographer
        import uuid
        email = f"TEST_admin_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Test Photographer",
            "email": email,
            "password": "TestPass@123",
            "studio_name": "TestStudio",
            "role": "photographer",
        }
        r = api.post(f"{BASE_URL}/api/super-admin/admins",
                     headers={"Authorization": f"Bearer {super_admin_token}"},
                     json=payload)
        # Some implementations return 200, others 201
        assert r.status_code in (200, 201), f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        # Look for id or email echoed back
        admin_obj = data.get("admin") or data
        assert (admin_obj.get("email") or "").lower() == email.lower() or "id" in admin_obj, (
            f"unexpected response shape: {data}"
        )
