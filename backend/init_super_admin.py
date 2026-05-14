"""
PHASE 35: Initialize Super Admin Account
Creates a default Super Admin account for platform management
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from auth import get_password_hash
from models import Admin, AdminRole, AdminStatus
from datetime import datetime, timezone


async def init_super_admin():
    """Create or update the Super Admin account"""
    
    # MongoDB connection
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/wedding_invitations')
    db_name = os.environ.get('DB_NAME', 'wedding_invitations')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    admins_collection = db['admins']
    
    # Super Admin credentials from environment variables
    SUPER_ADMIN_EMAIL = os.environ.get('SUPER_ADMIN_EMAIL', 'superadmin@wedding.com')
    SUPER_ADMIN_PASSWORD = os.environ.get('SUPER_ADMIN_PASSWORD', 'SuperAdmin@123')
    SUPER_ADMIN_NAME = os.environ.get('SUPER_ADMIN_NAME', 'Platform Owner')
    
    # Check if Super Admin already exists
    existing_super_admin = await admins_collection.find_one({
        'email': SUPER_ADMIN_EMAIL,
        'role': AdminRole.SUPER_ADMIN.value
    })
    
    if existing_super_admin:
        print(f"✅ Super Admin already exists: {SUPER_ADMIN_EMAIL}")
        print(f"   Name: {existing_super_admin.get('name', 'N/A')}")
        print(f"   ID: {existing_super_admin['id']}")
        return existing_super_admin['id']
    
    # Create Super Admin
    super_admin = Admin(
        email=SUPER_ADMIN_EMAIL,
        password_hash=get_password_hash(SUPER_ADMIN_PASSWORD),
        name=SUPER_ADMIN_NAME,
        role=AdminRole.SUPER_ADMIN,
        status=AdminStatus.ACTIVE,
        total_credits=999999,  # Unlimited credits for Super Admin
        used_credits=0,
        created_by=None  # Self-created
    )
    
    await admins_collection.insert_one(super_admin.model_dump())
    
    print("✅ Super Admin created successfully!")
    print(f"   Email: {SUPER_ADMIN_EMAIL}")
    print(f"   Password: {SUPER_ADMIN_PASSWORD}")
    print(f"   Name: {SUPER_ADMIN_NAME}")
    print(f"   ID: {super_admin.id}")
    print(f"   Role: {super_admin.role}")
    print("\n⚠️  IMPORTANT: Change the Super Admin password after first login!")
    
    client.close()
    return super_admin.id


if __name__ == "__main__":
    asyncio.run(init_super_admin())
