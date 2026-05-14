# Test Credentials

## Super Admin (platform owner)
- **URL**: `/super-admin/login` (also works at `/admin/login` — redirects)
- **Email**: `superadmin@wedding.com`
- **Password**: `SuperAdmin@123`
- **Role**: `super_admin`

## Sample Profile
- **Profile ID**: `1ea6ba16-ea40-4fca-8086-24a0c32bafab`
- **Slug**: `aarav-riya-tlogpf`
- **Public URL**: `/invite/aarav-riya-tlogpf`
- **Gift Editor**: `/admin/profile/1ea6ba16-ea40-4fca-8086-24a0c32bafab/gifts`
- **AI Gallery Manager**: `/admin/profile/1ea6ba16-ea40-4fca-8086-24a0c32bafab/gallery`
- Gallery enabled with 3 sample photos indexed in Rekognition.

## Sprint 10 — AWS endpoints (browser UA required)
- `GET  /api/admin/gallery/aws/health` (JWT) — confirms S3 + Rekognition + CF signer
- `POST /api/admin/profiles/{id}/gallery/enable` (JWT)
- `POST /api/admin/profiles/{id}/gallery/bulk-upload` (JWT, multipart `files=`)
- `POST /api/live-upload/{id}?token=...` (token, multipart `files=`)
- `POST /api/public/gallery/{slug}/face-search` (multipart `selfie=`)
- `GET  /api/public/gallery/{slug}/download-zip?session_id=...`

## Auth
- localStorage key: `admin_token`
- JWT via `POST /api/auth/login`

## Environment
- `EMERGENT_LLM_KEY` configured (Claude / Gemini Nano Banana etc.)
- `WHAT3WORDS_API_KEY=XO9LJ5F7` — free plan, returns "quota exceeded" for convert-to-3wa; backend soft-fails.
- **AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION=ap-south-1** configured
- `AWS_S3_BUCKET=wedding-gallery-maneesh-1715`
- `AWS_CLOUDFRONT_DOMAIN=dwm1yql2srdse.cloudfront.net`, `KEY_PAIR_ID=KAJY57101JEM9`
- CloudFront private key at `/app/backend/secrets/cf_private_key.pem` (chmod 600, git-ignored)
- WhatsApp Twilio & Razorpay keys are placeholders.

## Public endpoints
- Protected by `BotDetectionMiddleware` — pass real browser UA in curl.

## Notes
- All AWS resources auto-cleaned 1 day after `link_expiry_date` via daily 3am IST cron.
- Selfies auto-purged hourly when > 24h old.
- `.env` and `secrets/` are git-ignored — your AWS creds NEVER reach GitHub.
