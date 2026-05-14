# Test Credentials

## Super Admin (platform owner)
- **URL**: `/super-admin/login` (also works at `/admin/login` — auto-redirects to super-admin dashboard on role check)
- **Email**: `superadmin@wedding.com`
- **Password**: `SuperAdmin@123`
- **Role**: `super_admin`
- **Credits**: 999,999 (unlimited)

## Photographer Admin
- **URL**: `/admin/login`
- **Note**: `init_admin.py` is broken (missing `name` field in seed). Create photographers via the Super Admin dashboard, or use the Super Admin login above (works for all admin endpoints).

## Sample Profile (Sprint 9 demo)
- **Profile ID**: `1ea6ba16-ea40-4fca-8086-24a0c32bafab`
- **Slug**: `aarav-riya-tlogpf`
- **Couple**: Aarav & Riya
- **Public URL**: `/invite/aarav-riya-tlogpf`
- **Gift Editor**: `/admin/profile/1ea6ba16-ea40-4fca-8086-24a0c32bafab/gifts`
- **Gifts enabled with**: UPI `aarav@okhdfcbank`, 2 suggestions (Home essentials + Donate in our name)

## Token storage
- `localStorage` key: `admin_token`
- JWT-based auth via `POST /api/auth/login`

## Environment notes
- WHAT3WORDS_API_KEY: `XO9LJ5F7` (configured in `/app/backend/.env`). NB: the API currently returns "Quota exceeded or plan does not have access" for `convert-to-3wa` — the field gracefully degrades (frontend allows manual entry).
- EMERGENT_LLM_KEY configured for AI features (Claude Sonnet 4.5).
- WhatsApp Twilio creds NOT set → mock mode.
- Razorpay keys are placeholders.

## Public endpoints
Protected by `BotDetectionMiddleware` — use a real browser User-Agent (no curl default). Test scripts must pass `-A "Mozilla/5.0 ..."`.

## New (Sprint 9) endpoints
- `GET  /api/gifts/presets` — public preset library
- `GET  /api/admin/profiles/{id}/gifts` — fetch registry
- `PUT  /api/admin/profiles/{id}/gifts` — upsert registry
- `GET  /api/invite/{slug}/gifts` — public view (returns disabled-state when off)

## New (Sprint 8 maps) endpoints — already in repo
- `POST /api/admin/map/expand` — expand maps.app.goo.gl short URLs → lat/lng
- `GET  /api/admin/map/search?q=...` — Nominatim geocoding
- `POST /api/admin/map/what3words` — convert lat/lng → /// words
- `POST /api/admin/map/from-3wa` — /// words → lat/lng
- `GET  /api/invite/{slug}/venues` — multi-venue public payload (main + events) with deep links + WhatsApp share
- `GET  /api/invite/{slug}/eta` — live ETA via OSRM
- `PUT  /api/admin/profiles/{profile_id}/main-venue` — set main venue pin
- `PUT  /api/admin/profiles/{profile_id}/events/{event_id}/venue` — set per-event venue pin
