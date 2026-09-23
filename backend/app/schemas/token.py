from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserOut


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
