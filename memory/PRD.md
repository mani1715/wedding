# Maharani.studio — Premium Wedding Experience Platform

## Original Problem Statement
Build a premium AI-powered B2B SaaS wedding experience platform for **Indian wedding photographers**, on top of https://github.com/mani1715/wed-13. Locked-luxury themes, Super Admin controls everything, photographers are paying customers, couples have limited end-user access. Cinematic Apple-product-reveal motion. No flashy gaming effects.

## Architecture
- **Backend**: FastAPI (Python 3.11), single `/app/backend/server.py` (~11.7k LOC), MongoDB via Motor
- **Frontend**: React 19 + CRACO + Tailwind + Framer Motion + shadcn/ui
- **Database**: MongoDB (local) — `wedding_invitations`
- **Auth**: JWT + bcrypt, RBAC: `super_admin` / `admin`
- **AI**: Claude Sonnet 4.5 via `emergentintegrations` + `EMERGENT_LLM_KEY`

## User Personas
1. **Super Admin** — `superadmin@wedding.com`. Creates photographer accounts, adds/deducts credits, controls themes/plans/feature flags.
2. **Photographer Admin** — B2B customer (e.g. `studio@maharani.com`). Unlimited drafts, publishes when credits available.
3. **Couple** — RSVPs, wishes, live gallery edits.
4. **Guest** — Views invitation, RSVPs.

## Core Requirements (Static)
- Credit system: drafts free, credits consume on publish, never expire, immutable ledger
- 10 cultural themes, locked layouts, controlled accent tokens
- Plans FREE / SILVER / GOLD / PLATINUM
- Cinematic luxury design system, Royal Heritage palette, Framer Motion
- Public invitation with 3D unfolding, scroll storytelling, music
- AI Story Composer (cinematic Indian wedding prose)
- Storage strategy (S3/CloudFront, Cloudinary, Mux) — deferred until creds
- Razorpay credit top-up — deferred until creds

## What's Implemented

### 2026-01 — Sprint 1 (foundation)
- Repo cloned & cleaned (removed `APP_SUMMARY.md`, `test_result.md`, stray pip files)
- Backend running via supervisor, MongoDB connected, super admin seeded
- Cinematic LandingPage (Royal Heritage palette, Framer Motion, 10 theme cards, 4 plan cards)
- Premium AdminLogin & SuperAdminLogin pages
- `styles/luxury.css` design tokens (DM Serif Display + Fraunces + Cormorant + Manrope; gold/crimson/ivory; glass utilities; cinematic easings)

### 2026-01 — Sprint 2 (re-skin)
- `LuxuryDashboard.jsx` — new photographer console with credits widget, stat tiles, weddings grid, theme palette strips, AI button. Old dashboard preserved at `/admin/legacy-dashboard`.
- `masterThemes.js` rewritten to the **10 cultural themes**: Royal Mughal, South Indian Temple, Modern Minimal, Beach Destination, Punjabi Sangeet, Bengali Traditional, Christian Elegant, Muslim Nikah, Nature/Eco, Bollywood Luxury — with backward-compat `THEME_ID_ALIASES` for old DB records
- Auth fix #1: `/api/auth/me` now correctly derives `available_credits = total_credits - used_credits` (was returning 0)
- AuthContext fix: `login()` returns `{success, admin}` enabling role-based routing
- AdminLogin role routing fix: super-admins logging in via `/admin/login` are now redirected to `/super-admin/dashboard`

### 2026-01 — Sprint 3 (delight)
- `WaxSealOpening.jsx` — full-screen cinematic envelope with gold wax seal that cracks open on tap
- `PetalConfetti.jsx` — flower-petal burst with 3 palette presets, configurable count/duration
- `AmbientMusicPlayer.jsx` — floating gold-pill background music player with mute/hover indicator
- `LuxuryPreview.jsx` at `/preview/luxe` — public demo wrapping all three components

### 2026-01 — Sprint 4 (AI)
- Backend: `POST /api/admin/ai/story` using Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) via Emergent Universal Key. Persists to `db.ai_story_logs`. 5 story kinds × 4 tones × 7 languages.
- Frontend: `AIStoryComposer.jsx` modal (accessible from LuxuryDashboard "AI Story Composer" button and `/preview/luxe`) — generates cinematic invitation prose, vows, love stories, event intros, thank-you notes with graceful error messaging.
- `EMERGENT_LLM_KEY` added to `/app/backend/.env`

## Verification (iteration 2 testing agent)
- ✅ Backend pytest 12/13 (1 known issue now fixed)
- ✅ Frontend Playwright 100% on luxury flows (dashboard, AI modal, wax-seal, petals, music)
- ✅ AI Claude generation working — 559-char cinematic prose verified
- ✅ Photographer credits display fixed (now shows 200 not 0)

## Prioritized Backlog (P0/P1/P2)
**P0 — next**
- [ ] Re-skin public InvitationViewer with cinematic scroll storytelling + wax-seal intro auto-wired
- [ ] Re-skin Wedding Editor wizard (ProfileForm) with luxury design
- [ ] Re-skin Super Admin Dashboard with luxury design
- [ ] Wire `AIStoryComposer` into ProfileForm so photographers can insert AI prose directly into fields

**P1 — premium polish**
- [ ] Re-skin RSVPManagement + GreetingsManagement + WishesManagement + GalleryManagement
- [ ] Razorpay credit top-up (needs test keys)
- [ ] Persistent ambient music auto-loaded on PublicInvitation
- [ ] Theme preview pages (`/themes/royal-mughal`, etc.) for SEO + photographer share-links

**P2 — scale**
- [ ] AWS S3 + CloudFront / Cloudinary / Mux media pipeline
- [ ] PWA + Lighthouse optimization pass
- [ ] Split `server.py` (11.7k LOC) into routers
- [ ] EMERGENT_LLM_KEY budget top-up (currently very low — intermittent 502s)

## Next Tasks
1. Ask user which P0 to tackle next (suggest: Public Invitation Viewer re-skin — highest visibility to couples & guests)
2. Confirm if user wants AIStoryComposer wired into ProfileForm (most useful business win)
3. Note about EMERGENT_LLM_KEY budget for user awareness
