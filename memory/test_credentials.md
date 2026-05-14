# Test Credentials

## Super Admin (platform owner)
- **URL**: `/super-admin/login` (also works at `/admin/login` — auto-redirects to super-admin dashboard on role check)
- **Email**: `superadmin@wedding.com`
- **Password**: `SuperAdmin@123`
- **Role**: `super_admin`
- **Credits**: 999,999 (unlimited)

## Photographer Admin (B2B customer)
- **URL**: `/admin/login`
- **Email**: `studio@maharani.com`
- **Password**: `Studio@123`
- **Role**: `admin`
- **Credits**: 400
- **Note**: Already has a seeded wedding profile (id=`10c85da2-a61c-41fd-80df-318b95545855`, slug=`aarav-riya-jvbm4g`, couple: Aarav & Riya)

## Phase 38 Premium Features — quick links (logged-in as studio@maharani.com)
- `/admin/profile/10c85da2-a61c-41fd-80df-318b95545855/ai-studio`     — AI Studio (story / greeting / translate / image enhance)
- `/admin/profile/10c85da2-a61c-41fd-80df-318b95545855/live-gallery`  — Live Photo Wall management (settings, token, photos)
- `/admin/profile/10c85da2-a61c-41fd-80df-318b95545855/whatsapp`      — WhatsApp manager (mock mode w/o Twilio creds)
- `/admin/profile/10c85da2-a61c-41fd-80df-318b95545855/shagun`        — Digital Shagun settings + blessing counter
- `/invite/aarav-riya-jvbm4g`                                          — Public invitation (Wax-seal opening)
- `/invite/aarav-riya-jvbm4g/live-gallery`                             — Public live photo wall

## Notes
- Passwords are bcrypt-hashed.
- JWT secret in `/app/backend/.env` (`JWT_SECRET_KEY`).
- Mongo DB: `wedding_invitations`.
- `EMERGENT_LLM_KEY` set for AI features (Claude Sonnet 4.5 via emergentintegrations).
- WhatsApp Twilio creds NOT set yet → mock mode (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` placeholders in `/app/backend/.env`).
- Razorpay keys are placeholders → top-up flow disabled until real keys provided.
- Public endpoints (`/api/invite/...`) are protected by a `BotDetectionMiddleware`; requests must include a real browser User-Agent (no curl default). Test scripts should pass `-A` with a browser UA.
- Status update endpoint: `PUT /api/super-admin/admins/{admin_id}/status?status=active|suspended|inactive` (query param).
