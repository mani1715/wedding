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
- **Credits**: ~400 (200 initial + 200 referral bonus on creation)
- **Created via**: `POST /api/super-admin/admins` by super admin (uses `initial_credits` request field, NOT `total_credits`)

## Notes
- Passwords are bcrypt-hashed.
- JWT secret is in `/app/backend/.env` (`JWT_SECRET_KEY`).
- Mongo DB: `wedding_invitations`, collection `admins`.
- `EMERGENT_LLM_KEY` is set in `/app/backend/.env` for AI Story Composer (Claude Sonnet 4.5 via emergentintegrations). If the key budget is exceeded, the AI endpoint returns a friendly 503 with a soft message — the modal surfaces it gracefully instead of crashing.
- Status update endpoint: `PUT /api/super-admin/admins/{admin_id}/status?status=active|suspended|inactive` (query param, not body).
