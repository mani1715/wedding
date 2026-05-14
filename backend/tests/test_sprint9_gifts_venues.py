"""
Sprint 9 — Gift Registry + Multi-Venue / Maps backend tests.

Covers:
- /api/gifts/presets
- /api/admin/profiles/{id}/gifts (GET/PUT)
- /api/invite/{slug}/gifts public (enabled + masked bank, disabled state)
- /api/admin/map/search (Nominatim)
- /api/invite/{slug}/venues (deep links + events)
- /api/invite/{slug}/eta (OSRM)
- /api/admin/profiles/{id}/main-venue (PUT)
- What3Words soft-fail when quota exceeded
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://event-pinpoint.preview.emergentagent.com").rstrip("/")
PROFILE_ID = "1ea6ba16-ea40-4fca-8086-24a0c32bafab"
SLUG = "aarav-riya-tlogpf"

BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "superadmin@wedding.com", "password": "SuperAdmin@123"},
        timeout=20,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok, f"no token in {r.json()}"
    return tok


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def browser_headers():
    return {"User-Agent": BROWSER_UA, "Accept": "application/json"}


# ============================================================
#  Gift Registry
# ============================================================
class TestGiftPresets:
    def test_presets_returns_eight(self):
        r = requests.get(f"{BASE_URL}/api/gifts/presets",
                         headers={"User-Agent": BROWSER_UA}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 8
        assert isinstance(body["presets"], list)
        assert len(body["presets"]) == 8
        # check shape of first preset
        p = body["presets"][0]
        for k in ("id", "title", "description", "category", "icon"):
            assert k in p


class TestAdminGiftRegistry:
    def test_get_gifts_returns_registry_doc(self, admin_headers):
        r = requests.get(
            f"{BASE_URL}/api/admin/profiles/{PROFILE_ID}/gifts",
            headers=admin_headers, timeout=15,
        )
        assert r.status_code == 200, r.text
        doc = r.json()
        assert doc["profile_id"] == PROFILE_ID
        assert "enabled" in doc
        assert "suggestions" in doc
        assert isinstance(doc["suggestions"], list)

    def test_put_gifts_upserts(self, admin_headers):
        # Read current
        cur = requests.get(
            f"{BASE_URL}/api/admin/profiles/{PROFILE_ID}/gifts",
            headers=admin_headers, timeout=15,
        ).json()

        payload = {
            "enabled": True,
            "accept_upi": True,
            "upi_id": "aarav@okhdfcbank",
            "upi_name": "Aarav",
            "suggestions": [
                {"title": "TEST_Home essentials", "category": "home",
                 "description": "Kitchenware for new home", "order": 1, "icon": "🏠"},
                {"title": "TEST_Donate in our name", "category": "charity",
                 "description": "Donate to a cause", "order": 2, "icon": "💞"},
            ],
        }
        r = requests.put(
            f"{BASE_URL}/api/admin/profiles/{PROFILE_ID}/gifts",
            headers=admin_headers, json=payload, timeout=20,
        )
        assert r.status_code == 200, r.text
        updated = r.json()
        assert updated["enabled"] is True
        assert updated["upi_id"] == "aarav@okhdfcbank"
        titles = [s["title"] for s in updated["suggestions"]]
        assert "TEST_Home essentials" in titles
        assert "TEST_Donate in our name" in titles

        # Restore original-ish state (keep enabled=True, restore suggestions if existed)
        restore_payload = {
            "enabled": cur.get("enabled", True),
            "accept_upi": cur.get("accept_upi", True),
            "upi_id": cur.get("upi_id", "aarav@okhdfcbank"),
            "upi_name": cur.get("upi_name"),
            "suggestions": cur.get("suggestions", []),
        }
        requests.put(
            f"{BASE_URL}/api/admin/profiles/{PROFILE_ID}/gifts",
            headers=admin_headers, json=restore_payload, timeout=20,
        )


class TestPublicGifts:
    def test_public_gifts_enabled(self, browser_headers):
        r = requests.get(
            f"{BASE_URL}/api/invite/{SLUG}/gifts",
            headers=browser_headers, timeout=15,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["enabled"] is True
        # suggestions sorted by order
        sugs = body.get("suggestions", [])
        if len(sugs) >= 2:
            orders = [s.get("order", 0) for s in sugs]
            assert orders == sorted(orders), f"suggestions not sorted: {orders}"
        # bank account masked OR not exposed if accept_bank false
        if body.get("accept_bank"):
            masked = body.get("bank_account_number_masked")
            assert masked is None or "•" in masked or len(masked) <= 4

    def test_public_gifts_disabled_path(self, admin_headers, browser_headers):
        # Temporarily disable a unique throwaway slug; but easier: flip flag for
        # PROFILE_ID, fetch, then flip back.
        cur = requests.get(
            f"{BASE_URL}/api/admin/profiles/{PROFILE_ID}/gifts",
            headers=admin_headers, timeout=15,
        ).json()
        original_enabled = cur.get("enabled", False)

        try:
            requests.put(
                f"{BASE_URL}/api/admin/profiles/{PROFILE_ID}/gifts",
                headers=admin_headers, json={"enabled": False}, timeout=15,
            )
            r = requests.get(
                f"{BASE_URL}/api/invite/{SLUG}/gifts",
                headers=browser_headers, timeout=15,
            )
            assert r.status_code == 200
            body = r.json()
            assert body["enabled"] is False
            assert "show_disabled_note" in body
            assert isinstance(body["show_disabled_note"], bool)
        finally:
            requests.put(
                f"{BASE_URL}/api/admin/profiles/{PROFILE_ID}/gifts",
                headers=admin_headers, json={"enabled": original_enabled}, timeout=15,
            )


# ============================================================
#  Maps / Multi-Venue
# ============================================================
class TestAdminMapSearch:
    def test_map_search_taj_falaknuma(self, admin_headers):
        r = requests.get(
            f"{BASE_URL}/api/admin/map/search",
            params={"q": "Taj Falaknuma"},
            headers=admin_headers, timeout=20,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        # Accept either {"results":[...]} or top-level list
        results = body.get("results", body) if isinstance(body, dict) else body
        assert isinstance(results, list), f"expected list, got {type(results)}"
        # Nominatim may rate-limit — allow empty but log
        if len(results) > 0:
            first = results[0]
            assert "lat" in first or "latitude" in first or "display_name" in first


class TestPublicVenues:
    def test_public_venues_returns_main_and_events(self, browser_headers):
        r = requests.get(
            f"{BASE_URL}/api/invite/{SLUG}/venues",
            headers=browser_headers, timeout=20,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "main_venue" in body or "events" in body, f"unexpected shape: {list(body.keys())}"
        main = body.get("main_venue") or {}
        if main:
            links = main.get("links") or {}
            for key in ("google_maps", "apple_maps", "uber", "ola", "rapido", "whatsapp_share"):
                assert key in links, f"missing link {key} in {list(links.keys())}"
        assert isinstance(body.get("events", []), list)


class TestPublicETA:
    def test_eta_returns_duration_and_distance(self, browser_headers):
        # from Hyderabad to a nearby coord
        r = requests.get(
            f"{BASE_URL}/api/invite/{SLUG}/eta",
            params={
                "from_lat": 17.3850, "from_lng": 78.4867,
                "to_lat": 17.4239,  "to_lng": 78.4738,
            },
            headers=browser_headers, timeout=25,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        # OSRM may fail in network-restricted env — allow soft-fail body shape
        if body.get("mode") == "error" or body.get("error"):
            pytest.skip(f"OSRM unavailable: {body}")
        assert "duration_minutes" in body
        assert "distance_km" in body
        assert isinstance(body["duration_minutes"], (int, float))
        assert isinstance(body["distance_km"], (int, float))


class TestAdminMainVenue:
    def test_put_main_venue_persists(self, admin_headers):
        payload = {
            "lat": 17.3318,
            "lng": 78.4030,
            "map_link": "https://maps.google.com/?q=17.3318,78.4030",
            "what3words": "filled.count.soap",
            "parking_info": "Valet parking available near west gate",
            "name": "Taj Falaknuma Palace (TEST)",
        }
        r = requests.put(
            f"{BASE_URL}/api/admin/profiles/{PROFILE_ID}/main-venue",
            headers=admin_headers, json=payload, timeout=20,
        )
        assert r.status_code in (200, 201), r.text

        # Re-read via /venues public (or admin if available)
        v = requests.get(
            f"{BASE_URL}/api/invite/{SLUG}/venues",
            headers={"User-Agent": BROWSER_UA}, timeout=15,
        )
        if v.status_code == 200:
            main = (v.json() or {}).get("main_venue") or {}
            # parking + w3w should round-trip
            if main:
                assert main.get("parking_info") == payload["parking_info"] or \
                       payload["parking_info"] in str(main)
                assert main.get("what3words") == payload["what3words"] or \
                       payload["what3words"] in str(main)


class TestWhat3WordsSoftFail:
    def test_what3words_soft_fails_on_quota(self, admin_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/map/what3words",
            headers=admin_headers,
            json={"lat": 17.3318, "lng": 78.4030},
            timeout=20,
        )
        # Must NOT 5xx — soft fail with mode=error or words=null
        assert r.status_code < 500, f"hard-failed: {r.status_code} {r.text}"
        body = r.json()
        # Accept either success ({"words":"x.y.z"}) or soft-error
        if "words" in body and body["words"]:
            assert isinstance(body["words"], str)
        else:
            assert body.get("mode") == "error" or "error" in body or body.get("words") in (None, "")
