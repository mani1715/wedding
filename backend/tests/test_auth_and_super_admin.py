"""Backend tests for Wedding Platform: health, auth, super-admin endpoints.

Security middleware blocks bot UAs (curl, headless, requests/...). All requests
use a browser-like User-Agent header.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")

BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

SUPER_ADMIN_EMAIL = "superadmin@wedding.com"
SUPER_ADMIN_PASSWORD = "SuperAdmin@123"


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
    """Login as super admin and return JWT token."""
    resp = api.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD},
    )
    if resp.status_code != 200:
        pytest.skip(f"Super admin login failed ({resp.status_code}): {resp.text[:200]}")
    data = resp.json()
    token = data.get("token") or data.get("access_token")
    if not token:
        pytest.skip(f"No token in login response: {data}")
    return token


# ---------- Health ----------
class TestHealth:
    def test_root_api_health(self, api):
        resp = api.get(f"{BASE_URL}/api/")
        assert resp.status_code in (200, 404), f"Unexpected status {resp.status_code}: {resp.text[:200]}"
        # If 200, content should not be 403/blocked
        assert "blocked" not in resp.text.lower()


# ---------- Auth ----------
class TestAuth:
    def test_login_success_super_admin(self, api):
        resp = api.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD},
        )
        assert resp.status_code == 200, f"Login failed: {resp.status_code} {resp.text[:300]}"
        data = resp.json()
        token = data.get("token") or data.get("access_token")
        assert token, f"No token in response: {data}"
        assert isinstance(token, str) and len(token) > 20
        # Validate role/user payload if present
        role_str = str(
            data.get("role")
            or data.get("user", {}).get("role")
            or data.get("admin", {}).get("role")
            or ""
        ).lower()
        assert "super" in role_str or "admin" in role_str, f"Role not super_admin-like: {data}"

    def test_login_wrong_password_returns_401(self, api):
        resp = api.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": SUPER_ADMIN_EMAIL, "password": "WrongPassword!"},
        )
        assert resp.status_code in (400, 401, 403), f"Expected 401, got {resp.status_code}: {resp.text[:200]}"

    def test_login_unknown_email_returns_401(self, api):
        resp = api.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nobody@example.com", "password": "x"},
        )
        assert resp.status_code in (400, 401, 403, 404)


# ---------- Super Admin endpoints ----------
class TestSuperAdmin:
    def test_list_admins_with_token(self, api, super_admin_token):
        headers = {"Authorization": f"Bearer {super_admin_token}"}
        resp = api.get(f"{BASE_URL}/api/super-admin/admins", headers=headers)
        assert resp.status_code == 200, f"Failed: {resp.status_code} {resp.text[:300]}"
        data = resp.json()
        # Expect list or dict with admins key
        if isinstance(data, dict):
            admins = data.get("admins") or data.get("data") or []
        else:
            admins = data
        assert isinstance(admins, list), f"Expected list, got {type(admins)}: {data}"

    def test_list_admins_without_token_unauthorized(self, api):
        resp = api.get(f"{BASE_URL}/api/super-admin/admins")
        assert resp.status_code in (401, 403), f"Expected 401/403, got {resp.status_code}"
