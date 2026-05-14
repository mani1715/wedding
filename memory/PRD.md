# Maja Creations — Premium AI-Powered Indian Wedding Platform

## Original Problem Statement
Build the premium AI-powered Indian wedding photographer SaaS from https://github.com/mani1715/wedding. Add the 8 priority feature groups: AI features, Live Photo Wall, Smart RSVP, WhatsApp, Analytics, Viral Growth, Digital Heritage, Advanced Experience. Apple + Netflix + Indian-royal-wedding feel. Designs/colors locked to be styled by the user later.

> **Brand rename 2026-05-14:** Maharani.studio → **MAJA Creations**. New MJ-monogram logo generated via Gemini Nano Banana (Mughal-arch M with calligraphic J descender) and applied to nav, dashboard, public invitation, favicon, manifest, WhatsApp signatures.

## Architecture
- **Backend**: FastAPI (Python 3.11). Core monolith `server.py` (~11.8 kLOC, untouched core) + **new Phase 38 router `premium_features.py`** (~960 LOC) mounted via `build_premium_router()`.
- **Frontend**: React 19 + CRACO + Tailwind + Framer Motion + shadcn/ui + lucide-react + recharts.
- **Database**: MongoDB local — `wedding_invitations`.
- **Auth**: JWT + bcrypt, RBAC (`super_admin` / `admin`).
- **AI**: Claude Sonnet 4.5 via `emergentintegrations` + `EMERGENT_LLM_KEY`.
- **WhatsApp**: Twilio (mock-mode fallback when creds absent).
- **Payments**: Razorpay (placeholder keys; UPI deep links work without creds).
- **Live Photo Sync**: Custom desktop uploader Python script (`/app/uploader/maharani_uploader.py`) + REST API at `POST /api/live-gallery/desktop-upload` with `X-Uploader-Token` auth.

## User Personas
1. **Super Admin** — Platform owner. Creates photographer accounts, manages credits, controls plans.
2. **Photographer Admin (B2B customer)** — Composes weddings, uses AI Studio, configures Live Wall, sends WhatsApp invites, monetizes via plans.
3. **Couple** — Read-only portal (RSVPs, wishes, gallery).
4. **Guest** — Public invitation, RSVP, wish, live gallery upload, digital shagun.

## What's Implemented

### 2026-05-14 — Sprint 9 (Multi-Venue Maps integration + Gift Registry)

**Backend**
- `/app/backend/map_features.py` (pre-existing): Full per-event maps router. Endpoints `/api/admin/map/expand`, `/api/admin/map/search`, `/api/admin/map/what3words`, `/api/admin/map/from-3wa`, `/api/invite/{slug}/eta`, `/api/invite/{slug}/venues`, `/api/admin/profiles/{id}/main-venue`, `/api/admin/profiles/{id}/events/{event_id}/venue`. Uses Nominatim (geocoding) + OSRM (routing) + What3Words API (key `XO9LJ5F7` in .env). W3W upstream is on free plan w/ limited access to `convert-to-3wa`; backend soft-fails (`mode=error`, no 5xx) so the UI gracefully continues with manual W3W entry.
- **NEW** `/app/backend/gift_registry.py` (~250 LOC): `build_gift_router(db, get_current_admin)`. Endpoints:
  - `GET /api/gifts/presets` — 8 built-in idea cards (blessing, shagun, cash, home, experience, jewellery, charity, pooja)
  - `GET /api/admin/profiles/{id}/gifts` — fetch (returns defaults for new profile)
  - `PUT /api/admin/profiles/{id}/gifts` — upsert (couple controls enabled/disabled, headline, message, UPI, bank details, external registry, suggestions list)
  - `GET /api/invite/{slug}/gifts` — public view: returns enabled-state with masked bank account; returns disabled-state with polite "no gifts please" note when off
  - Storage: dedicated `gift_registry` collection keyed by `profile_id`. Bank account numbers are masked on the public payload. UI temp IDs (`tmp-...`) are stripped server-side and replaced with UUIDs.
- Router included in `server.py` next to `map_router` near line 11820.

**Frontend**
- `/app/frontend/src/components/luxury/VenuePicker.jsx` (pre-existing): combo 4-tab picker (Paste link / Drop pin / Search / Type only) using react-leaflet + Nominatim + W3W auto-lookup. Saves lat/lng/map_link/venue_name/venue_address/what3words/parking_info.
- **NEW** `/app/frontend/src/components/luxury/VenuesSection.jsx`: public multi-venue display. Renders main venue + per-event venues as cards. Each card has: event-type badge, name, address, click-to-copy What3Words pill (`/// filled.count.soap`), parking info card, and a 6-button deep-link grid (Google Maps / Apple Maps / Uber / Ola / Rapido / WhatsApp Share — green). On-demand "Show ETA" button uses browser geolocation + `/api/invite/{slug}/eta` (OSRM) to return `~25 min · 12.4 km`.
- **NEW** `/app/frontend/src/components/luxury/GiftRegistrySection.jsx`: public gift display. Two modes:
  - **Enabled**: shows headline + message + UPI/Bank/External cards (with copy-to-clipboard for UPI ID and IFSC) + grid of curated gift suggestion cards (icon, title, description, price hint, optional image + external link with `rel='noopener noreferrer'`).
  - **Disabled**: shows polite "No gifts, please" note (toggleable). Hidden completely when both are off.
- **NEW** `/app/frontend/src/pages/GiftRegistryEditor.jsx`: admin editor at `/admin/profile/:profileId/gifts`. Toggle cards (Gifts allowed / No gifts please), headline + message with character counter, payment toggle rows (UPI / Bank / External registry), preset chips (add from 8 built-in ideas), custom suggestion cards with reorder (up/down arrows), inline edit (icon, title, price hint, description, link, image URL), trash to remove.
- Wired into `LuxuryPublicInvitation.jsx`: `<VenuesSection slug={slug} />` and `<GiftRegistrySection slug={slug} />` replace/complement the older `TravelLinksSection`. Order: hero → events → travel/venues → **gifts (new)** → shagun → photographer-referral CTA.
- `LuxuryDashboard.jsx`: new **Gifts** action button next to **Shagun** on each wedding card.
- `App.js`: route `/admin/profile/:profileId/gifts` → `GiftRegistryEditor`.

### Verification (iteration 5 testing agent)
- ✅ **10/10 backend pytest pass** on Sprint 9 router (`/api/gifts/presets`, GET/PUT registry, public enabled+disabled, maps search, venues, ETA, main-venue upsert, W3W soft-fail).
- ✅ Frontend Playwright: super-admin login → gift editor loads → toggle enabled → add preset → save → "Saved successfully" toast.
- ✅ Public `/invite/aarav-riya-tlogpf`: `VenuesSection` renders with all 6 deep-link buttons, W3W copy pill, parking pill. `GiftRegistrySection` renders with UPI card (clickable copy), 2 suggestion cards.

### Pre-existing baseline (untouched in Sprint 9)
- See Sprint 6 (Phase 38 Premium AI / Live Wall / WhatsApp / Monetization), Sprint 7 (Brand rename to MAJA Creations + Viral CTA), and all earlier sprints below. All 30/30 prior backend tests still pass.

### Sprint 1–5 (pre-existing baseline from repo)
- Cinematic landing page, AdminLogin + SuperAdminLogin
- LuxuryDashboard (photographer console), LuxurySuperAdminDashboard
- 10 cultural themes (Royal Mughal, South Indian Temple, Modern Minimal, Beach, Punjabi Sangeet, Bengali Traditional, Christian Elegant, Muslim Nikah, Nature/Eco, Bollywood Luxury)
- Wax-seal opening, ambient music player, petal confetti, mandala loaders
- 8-step Wedding Editor wizard
- Public invitation with parallax hero, story, events, venue, countdown, RSVP, wishes
- Theme Showroom (`/themes`, `/themes/:themeId`)
- Credit system: drafts free, credits consume on publish, immutable ledger, super-admin add/deduct + ledger
- Feature flags (RSVP, wishes, countdown, music, gallery, AI story, digital shagun, translations)
- Couple read-only portal
- Watermark overlay for FREE plan

### 2026-05-14 — Sprint 7 (Brand rename + Viral CTA)

- **Global rename Maharani.studio → MAJA Creations**: nav (LuxuryShell, LandingPage, LuxuryDashboard, ThemeShowroom), WatermarkOverlay, public invitation footer, AI Studio header, manifest.json, index.html `<title>`/description, backend AI system prompts, WhatsApp message signatures, desktop uploader file renamed `maja_uploader.py` (state dir `~/.maja_uploader/`).
- **Logo generated via Gemini Nano Banana** (`generate_logo.py`): MJ monogram with Mughal-arch M and calligraphic J descender, gold-on-ink + light variants + standalone icon. Multiple favicons (16/32/64/128/192/512) + ICO. Mounted at `/brand/maja-*.png`.
- **MajaReferralCTA component** (`/app/frontend/src/components/luxury/MajaReferralCTA.jsx`) — luxe "Crafted on MAJA · Sign up with code XXXXX · 50 FREE CREDITS · See how this was made" CTA inside public invitation. Uses new slug-based public endpoint `GET /api/public/referral-code-by-slug/{slug}` (added to premium_features.py) which lazy-creates referral code on first view. Fixed a pre-existing bug in `/api/public/referral-code/{profile_id}` (was querying by wrong `profile_id` field — now uses `id`).
- All regressions pass: login, /auth/me, profiles list, AI story V2, live gallery, referral code generation.

### 2026-05-14 — Sprint 6 (Phase 38 — Premium AI / Live Wall / Communication / Monetization)

**Backend (`/app/backend/premium_features.py`)** — single new router, 22 new endpoints:

- **AI Studio**
  - `POST /api/admin/ai/story-v2` — cinematic love-story composer, 6 tones × 7 languages × cultural region
  - `POST /api/admin/ai/greeting-personalize` — per-guest cinematic greetings (Dear Sharma Ji…)
  - `POST /api/admin/ai/translate-bulk` — JSON-structured bulk translation to 7 Indian languages
  - `POST /api/admin/ai/enhance-image` — Pillow-based auto-enhance: lighting / color / skin-tone / 2× upscale
- **Live Photo Wall**
  - `GET/PUT /api/admin/profiles/{id}/live-gallery/settings`
  - `POST /api/admin/profiles/{id}/live-gallery/uploader-token` (72h, revocable)
  - `POST /api/live-gallery/desktop-upload` (X-Uploader-Token auth, multipart) — **whitelisted in BotDetectionMiddleware**
  - `GET /api/invite/{slug}/live-gallery` (polling with `since` timestamp for real-time)
  - `POST /api/invite/{slug}/live-gallery/guest-upload`
  - `POST /api/invite/{slug}/live-gallery/favorite`
  - `GET /api/admin/profiles/{id}/live-gallery` (admin moderation view)
  - `PUT /api/admin/live-gallery/{photo_id}/moderate?approved=…`
  - `DELETE /api/admin/live-gallery/{photo_id}`
- **WhatsApp (Twilio + mock fallback)**
  - `GET /api/admin/whatsapp/status`
  - `POST /api/admin/whatsapp/send-invitation` (bulk, custom `{name}` `{link}` substitution)
  - `POST /api/admin/whatsapp/send-reminder` (7/3/1 day templates, target all/confirmed/pending)
  - `GET /api/admin/profiles/{id}/whatsapp/logs`
- **Digital Shagun + Wall of Love + Blessing Counter**
  - `GET/PUT /api/admin/profiles/{id}/shagun`
  - `GET /api/invite/{slug}/shagun` — returns UPI deep links (`upi://pay?…`) + GPay/PhonePe/Paytm handles
  - `POST /api/invite/{slug}/shagun/record` — record blessing for counter
  - `GET /api/invite/{slug}/blessings` — counter, total amount, wishes count, recent
- **Travel & Navigation**
  - `GET /api/invite/{slug}/travel?lat&lng` — Google Maps / Ola / Uber / Rapido / Hotels-nearby deep links
- **Personalized Itinerary**
  - `GET /api/invite/{slug}/itinerary?audience=family|close|general` — audience-filtered events
- **Smart RSVP**
  - `POST /api/invite/{slug}/rsvp-smart` — meal preference, dietary restrictions, transport, accommodation, per-event RSVP
  - `GET /api/admin/profiles/{id}/rsvps/export-smart?fmt=csv|xlsx|json` — caterer/venue exports
- **Analytics v2**
  - `GET /api/admin/profiles/{id}/analytics/v2` — by_city, by_device, by_language, 24h hourly heatmap, RSVP funnel, engagement (live photo favorites)

**Frontend (5 new admin pages + 3 public-invitation sections)**:
- `/admin/profile/:id/ai-studio` — 4-tab AI Studio (story / greeting / translate / enhance) with cinematic Cardrian output
- `/admin/profile/:id/live-gallery` — settings + token generator + photo moderation grid
- `/admin/profile/:id/whatsapp` — recipient list + custom message + reminder scheduling (mock badge when not configured)
- `/admin/profile/:id/shagun` — UPI configuration + blessing counter stats
- `/invite/:slug/live-gallery` — public masonry live wall with real-time polling, lightbox, favorites, guest upload modal
- `LivePhotoWallTeaser` + `TravelLinksSection` + `DigitalShagunSection` mounted inside `LuxuryPublicInvitation`
- LuxuryDashboard wedding-card actions extended with AI Studio / Live Wall / WhatsApp / Shagun deep links
- PWA `manifest.json` configured

**Desktop Uploader (`/app/uploader/`)** — Python script + README:
- `watchdog`-based folder watcher
- Retry queue (`~/.maharani_uploader/*_queue.json`)
- Seen-file dedupe
- Per-wedding state via `--name` flag

## Verification (iteration 4 testing agent)
- ✅ **30/30 backend pytest pass** on Phase 38 router
- ✅ All 8 feature groups verified end-to-end via curl + pytest
- ✅ AI Story V2 returns 3-paragraph cinematic prose in <30s
- ✅ AI Image Enhancement: Pillow-based, 2× upscale verified
- ✅ Live Photo Wall: desktop upload, guest upload, favorite toggle, moderation, deletion — all green
- ✅ Digital Shagun UPI deep links validated against `upi://pay?pa=…&am=…&cu=INR&tn=…`
- ✅ WhatsApp mock mode returns sent count + mock SIDs (Twilio creds not provided yet → expected)
- ✅ Smart RSVP exports CSV / XLSX / JSON
- ✅ Analytics v2 returns city/device/language/heatmap/funnel/engagement
- ✅ Frontend pages all render — manual screenshot validation confirmed
- ✅ **BotDetectionMiddleware patched** to whitelist `/api/live-gallery/desktop-upload` when `X-Uploader-Token` is present (so desktop clients don't need a fake browser UA)
- ✅ Regression: existing routes (login, /auth/me, /admin/profiles, legacy AI story) still pass

## Prioritized Backlog

### P1 — needs user-provided keys to go live
- [ ] **Twilio WhatsApp creds** — provide `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` to flip mock → live mode
- [ ] **Razorpay test keys** — provide `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` to enable credit top-up flow

### P2 — premium polish & nice-to-haves
- [ ] Auto-WhatsApp scheduling (cron/job runner for 7d/3d/1d reminders — currently manual trigger)
- [ ] AI credit-deduction wiring (story-v2 / greeting / translate currently free for admins; legacy `/admin/ai/story` did deduct)
- [ ] Mongo TTL index on `uploader_tokens.expires_at`
- [ ] Itinerary audience-rank logic refactor to explicit allow-list (current implementation works, just inverted-looking)
- [ ] Service worker for offline mode (PWA manifest is in place)
- [ ] AWS S3 + Cloudinary media pipeline (currently local `/app/uploads`)

### P3 — scale & tech debt
- [ ] Continue splitting `server.py` (11.8 kLOC) into routers — Phase 38 set the pattern with `premium_features.py`
- [ ] Pre-computed analytics aggregates (current `analytics/v2` does per-request `to_list(10000)`)
- [ ] AWS S3 + CloudFront / Mux media pipeline

## Next Tasks
1. Ask user for Twilio creds to flip WhatsApp from mock → live.
2. Ask user for Razorpay test keys (or Stripe sandbox) to enable credit top-up & in-app purchases.
3. Once user provides color/theme preferences, restyle global tokens — design system is centralized in `/app/frontend/src/styles/luxury.css`.

## Future / Backlog (P3+)
- Razorpay credit top-up flow
- Couple-portal write access (currently read-only)
- AWS S3 + CloudFront / Cloudinary / Mux media pipeline
- Lighthouse / PWA optimization pass
- Split `server.py` (~11.8k LOC) into routers (auth, super_admin, credits, weddings, ai_story, payment)
