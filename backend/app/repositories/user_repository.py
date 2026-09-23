from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.scalar(select(User).where(User.id == user_id))

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.scalar(select(User).where(User.email == email.lower()))

    def create(self, user_in: UserCreate) -> User:
        user = User(
            full_name=user_in.full_name,
            email=user_in.email.lower(),
            password_hash=get_password_hash(user_in.password),
            role=user_in.role,
            is_active=True
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, user_in: UserUpdate) -> User:
        if user_in.full_name is not None:
            user.full_name = user_in.full_name
        if user_in.email is not None:
            user.email = user_in.email.lower()
        if user_in.is_active is not None:
            user.is_active = user_in.is_active
        self.db.commit()
        self.db.refresh(user)
        return user

    def list_users(self, skip: int = 0, limit: int = 100, role: Optional[UserRole] = None) -> List[User]:
        stmt = select(User)
        if role:
            stmt = stmt.where(User.role == role)
        stmt = stmt.offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())
