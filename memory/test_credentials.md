# Test Credentials

## Super Admin (platform owner)
- **URL**: `/super-admin/login` (also works at `/admin/login` — auto-redirects)
- **Email**: `superadmin@wedding.com`
- **Password**: `SuperAdmin@123`
- **Role**: `super_admin`
- **Credits**: 999,999 (unlimited)

## Photographer Admin (B2B customer)
- **URL**: `/admin/login`
- **Email**: `studio@maharani.com`
- **Password**: `Studio@123`
- **Role**: `admin`
- **Credits**: 200 (initial 100 + referral 100)
- **Created via**: POST /api/super-admin/admins by super admin

## Notes
- All passwords are bcrypt-hashed.
- JWT secret is in `/app/backend/.env` (`JWT_SECRET_KEY`).
- Mongo DB: `wedding_invitations`, collection `admin_users`.
- Add `EMERGENT_LLM_KEY` to backend `.env` (already set) for AI Story Composer.
