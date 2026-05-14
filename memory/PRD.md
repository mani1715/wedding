# Maharani.studio — Premium Wedding Experience Platform

## Original Problem Statement
Build a premium AI-powered B2B SaaS wedding experience platform for **Indian wedding photographers**, on top of https://github.com/mani1715/wedding. Locked-luxury themes, Super Admin controls everything, photographers are paying customers, couples have limited end-user access. Cinematic Apple-product-reveal motion. No flashy gaming effects.

## Architecture
- **Backend**: FastAPI (Python 3.11), `/app/backend/server.py` (~11.8k LOC, monolithic — refactor backlog), MongoDB via Motor
- **Frontend**: React 19 + CRACO + Tailwind + Framer Motion + shadcn/ui
- **Database**: MongoDB (local) — `wedding_invitations`
- **Auth**: JWT + bcrypt, RBAC: `super_admin` / `admin`
- **AI**: Claude Sonnet 4.5 via `emergentintegrations` + `EMERGENT_LLM_KEY`

## User Personas
1. **Super Admin** — `superadmin@wedding.com`. Creates photographer accounts, adds/deducts credits, controls themes/plans/feature flags.
2. **Photographer Admin** — B2B customer (e.g. `studio@maharani.com`). Unlimited drafts, publishes when credits available.
3. **Couple** — Read-only portal (RSVPs, wishes, gallery).
4. **Guest** — Views public invitation, RSVPs, leaves wish.

## Core Requirements (Static)
- Credit system: drafts free, credits consume on publish, never expire, immutable ledger
- 10 cultural themes, locked layouts, controlled accent tokens
- Plans FREE / SILVER / GOLD / PLATINUM
- Cinematic luxury design system, Royal Heritage palette, Framer Motion
- Public invitation with wax-seal opening, scroll storytelling, ambient music
- AI Story Composer (cinematic Indian wedding prose)
- Storage strategy (S3/CloudFront, Cloudinary, Mux) — deferred until creds
- Razorpay credit top-up — deferred until creds

## What's Implemented

### 2026-01 — Sprint 1 → Sprint 4 (existing baseline from repo)
- Cinematic LandingPage, premium AdminLogin & SuperAdminLogin
- LuxuryDashboard photographer console with credits widget, stat tiles, weddings grid, AI button
- 10 cultural themes (`masterThemes.js`): Royal Mughal, South Indian Temple, Modern Minimal, Beach Destination, Punjabi Sangeet, Bengali Traditional, Christian Elegant, Muslim Nikah, Nature/Eco, Bollywood Luxury
- Wax Seal Opening, Petal Confetti, Ambient Music Player, Mandala Loader, Shimmer Loader
- 8-step Wedding Editor wizard (`LuxuryProfileForm`): couple → theme → story → events → venue → media → flags → publish
- LuxurySuperAdminDashboard: stat tiles, create photographer, add/deduct credits, ledger, suspend/activate, audit log tab, plans tab
- LuxuryPublicInvitation with wax-seal envelope intro, parallax hero, story, events, venue, countdown, RSVP, wishes, petal confetti on success
- CoupleAccess read-only portal
- AI Story Composer modal (Claude Sonnet 4.5 via Emergent Universal Key) wired into Wedding Editor & dashboard
- Credit ledger immutable, super admin endpoints + photographer self-view
- Feature flags panel (RSVP, wishes, countdown, music, live gallery, AI story, digital shagun, translations)
- WatermarkOverlay for FREE plan

### 2026-05-14 — Sprint 5 (this session — feature completion pass)
- **NEW** `/themes` and `/themes/:themeId` ThemeShowroom — cinematic catalog grouped by category + per-theme wax-seal-opened preview with sample couple "Anaya & Rohan", events, mood, CTA to studio login. Adds SEO + share-able theme link per photographer.
- Wired `dashboard-browse-themes` button into LuxuryDashboard footer alongside `dashboard-view-plans`.
- AI Story endpoint now returns a **graceful 503** with the message "The AI muse is resting briefly. Please try again…" when EMERGENT_LLM_KEY budget is exceeded (was raw 502 stack trace). Frontend `AIStoryComposer` surfaces it as a soft toast-style error.
- Fixed latent `status: AdminStatus` parameter shadowing the `fastapi.status` import in `PUT /api/super-admin/admins/{id}/status` — 404 path now returns proper response (was potentially raising 500 due to AttributeError).
- Recreated `/app/backend/.env` and `/app/frontend/.env` (gitignored), re-seeded super admin, photographer studio account, and verified 400-credit balance.

## Verification (iteration 3 testing agent)
- ✅ Backend pytest **21/21** passing — auth, super-admin CRUD, credits add/deduct/ledger, suspend/activate, profile isolation, AI story 200/503 graceful
- ✅ Frontend Playwright **100%** on all 6 critical flows — themes catalog, theme detail, photographer dashboard (credits=400), super-admin dashboard tabs, 8-step wizard, AI Story modal
- ✅ `auth/me` available_credits bug **FIXED** (was 0; now shows 400 for seeded studio)

## Prioritized Backlog (P0/P1/P2)

**P0 — done this session**
- [x] Theme Showroom (`/themes`, `/themes/:themeId`)
- [x] Friendlier AI 503 error
- [x] Latent `status` shadowing bug fix

**P1 — premium polish**
- [ ] Razorpay credit top-up wired (needs `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`)
- [ ] Couple Portal — write access to limited edits (currently read-only)
- [ ] Live photo gallery realtime stream
- [ ] Re-skin remaining sub-pages (RSVPManagement, GreetingsManagement, WishesManagement, GalleryManagement) to luxe shell

**P2 — scale**
- [ ] AWS S3 + CloudFront / Cloudinary / Mux media pipeline (needs API keys)
- [ ] PWA + Lighthouse optimization pass
- [ ] Split `server.py` (11.8k LOC) into routers (auth, super_admin, credits, weddings, ai_story, payment)
- [ ] Add @computed_field to AdminResponse so `available_credits` derivation is on the model

## Next Tasks
1. Ask the user which P1 to tackle next — recommended: **Razorpay top-up** (highest revenue impact). Will need test keys.
2. Optional: re-skin the sub-pages to luxury shell so the entire experience feels consistent.
3. Long term: split monolithic `server.py` into routers — it's accumulating tech debt.
