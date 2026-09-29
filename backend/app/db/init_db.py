from sqlalchemy import select
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.core.logging import logger
from app.core.security import get_password_hash

# Import all models so metadata knows all tables
from app.models.user import User, UserRole
from app.models.crop import Crop
from app.models.order import Order
from app.models.payment import Payment
from app.models.warehouse import Warehouse, StorageBooking
from app.models.shipment import Shipment
from app.models.shipment_location import ShipmentLocation
from app.models.notification import Notification


def init_db():
    """
    Initializes database schema and seeds initial demo users and warehouses if not present.
    """
    try:
        # Create all tables if they do not exist
        logger.info("Verifying and creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")

        # Seed initial demo users
        with SessionLocal() as db:
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
                existing = db.scalars(select(User).where(User.email == u["email"])).first()
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
                    user_map[u["role"]] = user_obj
                    logger.info(f"Seeded demo account: {u['email']} ({u['role'].value})")
                else:
                    user_map[u["role"]] = existing

            # Seed warehouses if empty
            wh_manager = user_map.get(UserRole.WAREHOUSE_MANAGER)
            if wh_manager:
                wh_count = db.scalars(select(Warehouse)).all()
                if len(wh_count) == 0:
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
                    logger.info("Seeded initial warehouse storage facilities.")

            db.commit()
            logger.info("Database initialization and initial seeding completed.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}", exc_info=True)
