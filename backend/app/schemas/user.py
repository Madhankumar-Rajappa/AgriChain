from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, examples=["John Farmer"])
    email: EmailStr = Field(..., examples=["farmer@example.com"])
    role: UserRole = Field(default=UserRole.BUYER, examples=["FARMER"])


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, examples=["SecurePassword123"])


class UserLogin(BaseModel):
    email: EmailStr = Field(..., examples=["farmer@example.com"])
    password: str = Field(..., min_length=1, examples=["SecurePassword123"])


class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
