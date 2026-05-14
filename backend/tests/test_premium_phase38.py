"""
Phase 38 Premium Features - Backend Tests
Covers: AI Suite v2, Live Photo Wall, WhatsApp (mock), Digital Shagun,
Travel links, Itinerary, Smart RSVP, Analytics v2.
"""
import os
import io
import base64
import json
import csv
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Read from frontend .env directly
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"
ADMIN_EMAIL = "studio@maharani.com"
ADMIN_PASSWORD = "Studio@123"
PROFILE_ID = "10c85da2-a61c-41fd-80df-318b95545855"
PROFILE_SLUG = "aarav-riya-jvbm4g"

# Browser UA required for /api/invite/* due to BotDetectionMiddleware
BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"


# ---------- Fixtures ----------

@pytest.fixture(scope="session")
def auth_token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                      timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def admin_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def browser_headers():
    return {"User-Agent": BROWSER_UA}


@pytest.fixture(scope="session")
def small_image_b64():
    img = Image.new("RGB", (200, 200), (210, 140, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


# ---------- Regression smoke ----------

class TestRegression:
    def test_auth_login(self, auth_token):
        assert isinstance(auth_token, str) and len(auth_token) > 20

    def test_auth_me(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert isinstance(d.get("available_credits"), int)

    def test_admin_profiles_list(self, admin_headers):
        r = requests.get(f"{API}/admin/profiles", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        profs = data if isinstance(data, list) else data.get("profiles", [])
        assert any(p.get("id") == PROFILE_ID for p in profs), "seeded profile missing"


# ---------- WhatsApp (mock) ----------

class TestWhatsAppMock:
    def test_status_mock(self, admin_headers):
        r = requests.get(f"{API}/admin/whatsapp/status",
                         headers=admin_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["configured"] is False
        assert d["mode"] == "mock"

    def test_send_invitation_mock(self, admin_headers):
        payload = {
            "profile_id": PROFILE_ID,
            "recipients": [
                {"name": "TEST_Guest_A", "phone": "9999900001"},
                {"name": "TEST_Guest_B", "phone": "+919999900002"},
            ],
        }
        r = requests.post(f"{API}/admin/whatsapp/send-invitation",
                          json=payload, headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["sent"] == 2
        assert d["mode"] == "mock"
        assert all(it["status"] == "mock" for it in d["results"])
        assert all(it.get("sid", "").startswith("mock_") for it in d["results"])

    def test_send_reminder_mock(self, admin_headers):
        payload = {"profile_id": PROFILE_ID, "reminder_type": "3_days",
                   "target": "all"}
        r = requests.post(f"{API}/admin/whatsapp/send-reminder",
                          json=payload, headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "sent" in d and d["mode"] == "mock"


# ---------- AI Suite ----------

class TestAISuite:
    def test_greeting_personalize(self, admin_headers):
        payload = {"guest_name": "Aarav Sharma", "relation": "family",
                   "tone": "warm", "language": "en", "couple": "Riya & Aarav"}
        r = requests.post(f"{API}/admin/ai/greeting-personalize",
                          json=payload, headers=admin_headers, timeout=45)
        if r.status_code == 503:
            pytest.skip("AI budget exhausted (503 graceful)")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "greeting" in d and isinstance(d["greeting"], str)
        assert len(d["greeting"]) > 0
        assert "\n" not in d["greeting"].strip(), "must be single-line"

    def test_translate_bulk(self, admin_headers):
        payload = {
            "items": {"welcome": "Welcome to our wedding",
                      "bless": "Your blessings mean everything"},
            "target_language": "hi",
        }
        r = requests.post(f"{API}/admin/ai/translate-bulk",
                          json=payload, headers=admin_headers, timeout=60)
        if r.status_code in (502, 503):
            pytest.skip(f"AI {r.status_code} graceful")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["target_language"] == "hi"
        assert set(d["translations"].keys()) == {"welcome", "bless"}
        # Non-empty translations
        for v in d["translations"].values():
            assert isinstance(v, str) and len(v) > 0

    def test_story_v2(self, admin_headers):
        payload = {
            "bride": "Riya", "groom": "Aarav",
            "how_we_met": "Met at a Delhi book café in monsoon, 2019.",
            "proposal_story": "He proposed on the Jaipur city palace terrace.",
            "wedding_journey": "Two families, one love, infinite gratitude.",
            "tone": "cinematic", "language": "en",
        }
        r = requests.post(f"{API}/admin/ai/story-v2",
                          json=payload, headers=admin_headers, timeout=90)
        if r.status_code == 503:
            pytest.skip("AI muse resting (503 graceful)")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "story" in d and isinstance(d["story"], str)
        # Heuristic: should contain at least 2 paragraph breaks
        paragraphs = [p for p in d["story"].split("\n\n") if p.strip()]
        assert len(paragraphs) >= 2, f"expected multi-paragraph, got {len(paragraphs)}"

    def test_enhance_image(self, admin_headers, small_image_b64):
        payload = {"image_base64": small_image_b64,
                   "enhancements": ["lighting", "color", "skin_tone", "upscale"]}
        r = requests.post(f"{API}/admin/ai/enhance-image",
                          json=payload, headers=admin_headers, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["enhanced_image"].startswith("data:image/jpeg;base64,")
        assert d["size_bytes"] > 0
        assert d["dimensions"]["width"] >= 200
        # upscale should kick in (200 -> 400)
        assert d["dimensions"]["width"] >= 400


# ---------- Live Photo Wall ----------

class TestLiveGallery:
    uploader_token = None
    desktop_photo_id = None
    guest_photo_id = None

    def test_get_settings(self, admin_headers):
        r = requests.get(f"{API}/admin/profiles/{PROFILE_ID}/live-gallery/settings",
                         headers=admin_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "enabled" in d and "guest_upload_enabled" in d
        assert "auto_approve" in d and "moderation_required" in d

    def test_put_settings(self, admin_headers):
        payload = {"enabled": True, "guest_upload_enabled": True,
                   "auto_approve": True, "moderation_required": False,
                   "watermark_enabled": False, "max_photos_per_guest": 20}
        r = requests.put(f"{API}/admin/profiles/{PROFILE_ID}/live-gallery/settings",
                         json=payload, headers=admin_headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_create_uploader_token(self, admin_headers):
        r = requests.post(f"{API}/admin/profiles/{PROFILE_ID}/live-gallery/uploader-token",
                          headers=admin_headers, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d["token"]) >= 32
        assert d["profile_id"] == PROFILE_ID
        assert d["profile_slug"] == PROFILE_SLUG
        assert "upload_url" in d and "expires_at" in d
        TestLiveGallery.uploader_token = d["token"]

    def test_desktop_upload(self, admin_headers, small_image_b64):
        assert TestLiveGallery.uploader_token, "token not created"
        # multipart file upload
        raw = base64.b64decode(small_image_b64.split(",", 1)[1])
        files = {"file": ("test.jpg", raw, "image/jpeg")}
        data = {"caption": "TEST_desktop_upload", "event_type": "haldi"}
        headers = {"X-Uploader-Token": TestLiveGallery.uploader_token,
                   "User-Agent": BROWSER_UA}
        r = requests.post(f"{API}/live-gallery/desktop-upload",
                          files=files, data=data, headers=headers, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d and d["uploader_type"] == "desktop"
        assert d["url"].startswith("/uploads/live_gallery/")
        assert d["thumb_url"].endswith("_thumb.jpg")
        TestLiveGallery.desktop_photo_id = d["id"]

    def test_public_live_gallery(self, browser_headers):
        r = requests.get(f"{API}/invite/{PROFILE_SLUG}/live-gallery",
                         headers=browser_headers, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "photos" in d and isinstance(d["photos"], list)
        # Recently uploaded should appear
        if TestLiveGallery.desktop_photo_id:
            ids = [p["id"] for p in d["photos"]]
            assert TestLiveGallery.desktop_photo_id in ids

    def test_guest_upload(self, browser_headers, small_image_b64):
        payload = {"guest_name": "TEST_Aunty",
                   "caption": "Beautiful haldi!",
                   "image_base64": small_image_b64,
                   "event_type": "haldi"}
        r = requests.post(f"{API}/invite/{PROFILE_SLUG}/live-gallery/guest-upload",
                          json=payload, headers=browser_headers, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["uploader_type"] == "guest"
        assert d["uploader_name"] == "TEST_Aunty"
        TestLiveGallery.guest_photo_id = d["id"]

    def test_favorite_toggle(self, browser_headers):
        assert TestLiveGallery.guest_photo_id, "guest upload missing"
        payload = {"photo_id": TestLiveGallery.guest_photo_id,
                   "device_id": "TEST_DEV_001"}
        r1 = requests.post(f"{API}/invite/{PROFILE_SLUG}/live-gallery/favorite",
                           json=payload, headers=browser_headers, timeout=10)
        assert r1.status_code == 200
        assert r1.json()["favorited"] is True
        r2 = requests.post(f"{API}/invite/{PROFILE_SLUG}/live-gallery/favorite",
                           json=payload, headers=browser_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["favorited"] is False

    def test_moderate(self, admin_headers):
        assert TestLiveGallery.guest_photo_id
        r = requests.put(
            f"{API}/admin/live-gallery/{TestLiveGallery.guest_photo_id}/moderate",
            params={"approved": "false"},
            headers=admin_headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["approved"] is False
        # restore
        r2 = requests.put(
            f"{API}/admin/live-gallery/{TestLiveGallery.guest_photo_id}/moderate",
            params={"approved": "true"},
            headers=admin_headers, timeout=10)
        assert r2.status_code == 200

    def test_delete(self, admin_headers):
        # cleanup uploaded test photos
        for pid in [TestLiveGallery.desktop_photo_id,
                    TestLiveGallery.guest_photo_id]:
            if not pid:
                continue
            r = requests.delete(f"{API}/admin/live-gallery/{pid}",
                                headers=admin_headers, timeout=10)
            assert r.status_code == 200


# ---------- Digital Shagun ----------

class TestShagun:
    def test_put_shagun(self, admin_headers):
        payload = {"enabled": True, "upi_id": "riya.aarav@upi",
                   "payee_name": "Riya & Aarav",
                   "suggested_amounts": [501, 1100, 2100, 5100, 11000],
                   "blessing_message": "TEST blessings"}
        r = requests.put(f"{API}/admin/profiles/{PROFILE_ID}/shagun",
                         json=payload, headers=admin_headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_public_shagun(self, browser_headers):
        r = requests.get(f"{API}/invite/{PROFILE_SLUG}/shagun",
                         headers=browser_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["enabled"] is True
        assert d["upi_id"] == "riya.aarav@upi"
        assert len(d["suggested"]) >= 3
        for s in d["suggested"]:
            assert s["link"].startswith("upi://pay?")
            assert "pa=riya.aarav%40upi" in s["link"]

    def test_record_blessing(self, browser_headers):
        payload = {"guest_name": "TEST_WellWisher", "amount": 1100,
                   "message": "Many blessings"}
        r = requests.post(f"{API}/invite/{PROFILE_SLUG}/shagun/record",
                          json=payload, headers=browser_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["amount"] == 1100
        assert d["guest_name"] == "TEST_WellWisher"

    def test_blessings(self, browser_headers):
        r = requests.get(f"{API}/invite/{PROFILE_SLUG}/blessings",
                         headers=browser_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["blessing_count"] >= 1
        assert d["blessing_total_amount"] >= 1100
        assert isinstance(d["recent_blessings"], list)


# ---------- Travel & Itinerary ----------

class TestTravelItinerary:
    def test_travel_links(self, browser_headers):
        r = requests.get(f"{API}/invite/{PROFILE_SLUG}/travel",
                         params={"lat": 26.9124, "lng": 75.7873},
                         headers=browser_headers, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        links = d["links"]
        assert "google_maps" in links and "26.9124,75.7873" in links["google_maps"]
        assert links["ola"].startswith("https://book.olacabs.com/")
        assert links["uber"].startswith("https://m.uber.com/")
        assert "rapido" in links
        assert "hotels_nearby_query" in d

    def test_itinerary_audience_filter(self, browser_headers):
        for aud in ("family", "close", "general"):
            r = requests.get(f"{API}/invite/{PROFILE_SLUG}/itinerary",
                             params={"audience": aud},
                             headers=browser_headers, timeout=10)
            assert r.status_code == 200, r.text
            d = r.json()
            assert d["audience"] == aud
            assert isinstance(d["events"], list)


# ---------- Smart RSVP ----------

class TestSmartRSVP:
    def test_submit_smart_rsvp(self, browser_headers):
        payload = {
            "guest_name": "TEST_SmartGuest",
            "guest_phone": "9000000001",
            "guest_email": "smart@test.com",
            "attending": True,
            "attendee_count": 2,
            "meal_preference": "veg",
            "dietary_restrictions": ["nut-free", "lactose"],
            "transport_needed": True,
            "accommodation_needed": False,
            "event_rsvps": [
                {"event_type": "haldi", "attending": True},
                {"event_type": "reception", "attending": False},
            ],
            "message": "Excited!",
        }
        r = requests.post(f"{API}/invite/{PROFILE_SLUG}/rsvp-smart",
                          json=payload, headers=browser_headers, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["smart"] is True
        assert d["meal_preference"] == "veg"
        assert d["transport_needed"] is True
        assert d["attendee_count"] == 2

    def test_export_csv(self, admin_headers):
        r = requests.get(f"{API}/admin/profiles/{PROFILE_ID}/rsvps/export-smart",
                         params={"fmt": "csv"}, headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        text = r.content.decode("utf-8")
        rows = list(csv.reader(io.StringIO(text)))
        assert rows[0][0] == "guest_name"
        # At least our TEST_SmartGuest row should be present
        flat = "\n".join([",".join(r) for r in rows])
        assert "TEST_SmartGuest" in flat

    def test_export_xlsx(self, admin_headers):
        r = requests.get(f"{API}/admin/profiles/{PROFILE_ID}/rsvps/export-smart",
                         params={"fmt": "xlsx"}, headers=admin_headers, timeout=15)
        assert r.status_code == 200
        ct = r.headers.get("content-type", "")
        assert ("spreadsheetml" in ct) or ("text/csv" in ct)  # fallback acceptable
        assert len(r.content) > 100

    def test_export_json(self, admin_headers):
        r = requests.get(f"{API}/admin/profiles/{PROFILE_ID}/rsvps/export-smart",
                         params={"fmt": "json"}, headers=admin_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "rsvps" in d and isinstance(d["rsvps"], list)


# ---------- Analytics v2 ----------

class TestAnalyticsV2:
    def test_analytics_v2(self, admin_headers):
        r = requests.get(f"{API}/admin/profiles/{PROFILE_ID}/analytics/v2",
                         headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        for key in ("by_city", "by_device", "hourly_heatmap",
                    "rsvp_funnel", "engagement"):
            assert key in d, f"missing key {key}"
        assert isinstance(d["hourly_heatmap"], list)
        assert len(d["hourly_heatmap"]) == 24
        # rsvp_funnel structure
        for k in ("total_views", "rsvp_yes", "rsvp_no"):
            assert k in d["rsvp_funnel"]
        assert d["engagement"]["live_photos"] >= 0
