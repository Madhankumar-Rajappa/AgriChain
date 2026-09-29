import sys
from datetime import date, datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.crop import Crop, CropCategory, CropQuality, CropStatus
from app.models.warehouse import Warehouse

def seed_database():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Seed Demo Users
        users_data = [
            {
                "full_name": "Ramesh Patel (Farmer)",
                "email": "farmer@agrichain.com",
                "password": "Farmer123!",
                "role": UserRole.FARMER,
            },
            {
                "full_name": "Anita Sharma (Buyer)",
                "email": "buyer@agrichain.com",
                "password": "Buyer123!",
                "role": UserRole.BUYER,
            },
            {
                "full_name": "Express Agri Logistics (Transporter)",
                "email": "transporter@agrichain.com",
                "password": "Transporter123!",
                "role": UserRole.TRANSPORTER,
            },
            {
                "full_name": "Kisan Cold Storage (Warehouse)",
                "email": "warehouse@agrichain.com",
                "password": "Warehouse123!",
                "role": UserRole.WAREHOUSE_MANAGER,
            },
            {
                "full_name": "System Administrator",
                "email": "admin@agrichain.com",
                "password": "Admin123!",
                "role": UserRole.ADMIN,
            },
        ]
        
        user_map = {}
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user_obj = User(
                    full_name=u["full_name"],
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    is_active=True,
                )
                db.add(user_obj)
                db.flush()
                print(f"Created user: {u['email']} ({u['role'].value})")
                user_map[u["role"]] = user_obj
            else:
                user_map[u["role"]] = existing
                print(f"Existing user found: {u['email']}")

        farmer = user_map[UserRole.FARMER]
        wh_manager = user_map[UserRole.WAREHOUSE_MANAGER]

        # 2. Crops are created live by authentic Farmers from their dashboard.
        # Zero dummy products seeded.

        # 3. Seed Warehouses if empty
        if db.query(Warehouse).count() == 0:
            warehouses_data = [
                {
                    "manager_id": wh_manager.id,
                    "name": "Kisan Cold Storage & Distribution Hub",
                    "location": "Nashik Highway, Sector 4, Maharashtra",
                    "total_capacity_tons": 500.0,
                    "available_capacity_tons": 380.0,
                    "is_active": True,
                },
                {
                    "manager_id": wh_manager.id,
                    "name": "Northern Grain Silos & Warehousing",
                    "location": "GT Road, Karnal, Haryana",
                    "total_capacity_tons": 1200.0,
                    "available_capacity_tons": 950.0,
                    "is_active": True,
                },
                {
                    "manager_id": wh_manager.id,
                    "name": "Central Agro Logistics Warehouse",
                    "location": "Bhopal Industrial Corridor, Madhya Pradesh",
                    "total_capacity_tons": 800.0,
                    "available_capacity_tons": 640.0,
                    "is_active": True,
                },
            ]
            for w_data in warehouses_data:
                wh_obj = Warehouse(**w_data)
                db.add(wh_obj)
            db.flush()
            print("Seeded sample warehouses successfully.")

        db.commit()
        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
