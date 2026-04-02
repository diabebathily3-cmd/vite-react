#!/usr/bin/env python3
"""Seed script to create admin user for MaliRide"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_admin():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    admin_email = "admin@maliride.ml"
    admin_password = "Admin123!"
    
    # Check if admin exists
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"Admin user already exists: {admin_email}")
        client.close()
        return
    
    # Create admin
    hashed_password = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
    
    admin_doc = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": admin_email,
        "name": "Admin MaliRide",
        "phone": "+223 00 00 00 00",
        "password": hashed_password,
        "role": "admin",
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
        "is_online": False,
        "vehicle_info": None,
        "current_location": None,
        "rating": 5.0,
        "total_rides": 0,
        "earnings": 0
    }
    
    await db.users.insert_one(admin_doc)
    print(f"Admin user created successfully!")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
