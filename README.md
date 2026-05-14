# Wedding Invitation Platform 💍

A comprehensive full-stack wedding invitation management platform with Super Admin controls, credit system, and feature gating.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- MongoDB (local instance running)

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Install Frontend Dependencies**
```bash
cd frontend
yarn install
```

3. **Initialize Super Admin**
```bash
cd backend
python init_super_admin.py
```

4. **Start Services**
```bash
sudo supervisorctl restart all
```

### Default Super Admin Credentials
- **Email**: `superadmin@wedding.com`
- **Password**: `SuperAdmin@123`

## 🏗️ Architecture

- **Backend**: FastAPI (Python 3.11)
- **Frontend**: React with Tailwind CSS
- **Database**: MongoDB
- **Authentication**: JWT with RBAC

## 👥 User Roles

### Super Admin
- Platform owner with full control
- Manage Admin accounts
- Credit management (add/deduct)
- View audit trails

### Admin (Photographer)
- Create wedding profiles
- Manage invitations
- View credit balance
- Limited to own data

## 💳 Credit System

- **Global per Admin**: Credits shared across all weddings
- **Non-Expiring**: Credits persist until used
- **Immutable Ledger**: Complete audit trail
- **Balance Validation**: Prevents overdraft

## 📊 Feature Plans

| Feature | FREE | SILVER | GOLD | PLATINUM |
|---------|------|--------|------|----------|
| Galleries | 0 | 10 | 50 | Unlimited |
| Watermark | Yes | No | No | No |
| Analytics | Basic | Full | Full | Full |
| Support | Email | Priority | Priority | Dedicated |

## 🎨 Core Features

- ✅ Multi-event wedding management
- ✅ RSVP tracking & analytics
- ✅ Customizable themes & designs
- ✅ Photo galleries
- ✅ Google Maps integration
- ✅ QR code generation
- ✅ PDF invitations
- ✅ Calendar integration (.ics)
- ✅ Multi-language support

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Bcrypt password hashing
- Protected API endpoints
- CORS configuration

## 📁 Project Structure

```
/app/
├── backend/              # FastAPI backend
│   ├── server.py        # Main application
│   ├── models.py        # Data models
│   ├── auth.py          # Authentication
│   └── ...
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   └── context/    # State management
│   └── ...
└── test_result.md      # Testing protocol
```

## 🔧 Configuration

### Backend Environment (.env)
```env
MONGO_URL=mongodb://localhost:27017/wedding_invitations
DB_NAME=wedding_invitations
JWT_SECRET_KEY=<your-secret-key>
FRONTEND_URL=http://localhost:3000
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Frontend Environment (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🛠️ Service Management

```bash
# Restart all services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log
```

## 📡 Key API Endpoints

### Super Admin
- `POST /api/super-admin/admins` - Create Admin
- `POST /api/super-admin/credits/add` - Add credits
- `GET /api/super-admin/admins` - List Admins

### Admin
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/admin/profiles` - List profiles
- `POST /api/admin/profiles` - Create profile

### Public
- `GET /api/profiles/{share_link}` - View invitation
- `POST /api/rsvp` - Submit RSVP

## 🧪 Testing

Testing protocol is documented in `test_result.md`. The platform uses:
- Backend testing via `deep_testing_backend_v2`
- Frontend testing via `auto_frontend_testing_agent`

## 📝 Documentation

- **APP_SUMMARY.md**: Comprehensive application overview
- **test_result.md**: Testing data and protocol
- **PHASE35_NEW_SUPER_ADMIN_SYSTEM.md**: Super Admin implementation details

## 🔮 Future Enhancements

- [ ] Razorpay payment integration
- [ ] AI-powered content suggestions
- [ ] Email/SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Template marketplace
- [ ] Referral program expansion

## 🤝 Contributing

This is a production-ready platform. For feature additions or bug fixes, please follow the testing protocol outlined in `test_result.md`.

## 📄 License

All rights reserved.

---

**Status**: ✅ Fully operational and ready for production use.

**Last Updated**: February 2024
