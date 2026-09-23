from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.schemas.token import Token
from app.core.security import verify_password, create_access_token
from app.models.user import User


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register_user(self, user_in: UserCreate) -> User:
        existing_user = self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email address already exists."
            )
        return self.user_repo.create(user_in)

    def authenticate_user(self, credentials: UserLogin) -> User:
        user = self.user_repo.get_by_email(credentials.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )
        return user

    def login(self, credentials: UserLogin) -> Token:
        user = self.authenticate_user(credentials)
        access_token = create_access_token(subject=user.email)
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserOut.model_validate(user)
        )
