from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user, require_roles
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED, summary="Register New User Account")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user (Farmer, Buyer, Transporter, Warehouse Manager, or Admin).
    Checks for duplicate email addresses and returns created user profile.
    """
    service = AuthService(db)
    user = service.register_user(user_in)
    return user


@router.post("/login", response_model=Token, summary="User Login (Returns JWT Access Token)")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and returns a signed JWT access token.
    """
    service = AuthService(db)
    token = service.login(credentials)
    return token


@router.post("/login/form", response_model=Token, summary="User Login via OAuth2 Form Data", include_in_schema=False)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Standard OAuth2 password flow form handler for Swagger UI interactivity.
    """
    service = AuthService(db)
    credentials = UserLogin(email=form_data.username, password=form_data.password)
    return service.login(credentials)


@router.get("/me", response_model=UserOut, summary="Get Current Authenticated User Profile")
def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Returns profile information for currently authenticated user.
    """
    return current_user


# Role Verification Test Endpoints
@router.get("/test/farmer", summary="Test Farmer Role Access")
def test_farmer_role(user: User = Depends(require_roles(UserRole.FARMER))):
    return {"message": f"Hello Farmer {user.full_name}, access granted!", "role": user.role}


@router.get("/test/buyer", summary="Test Buyer Role Access")
def test_buyer_role(user: User = Depends(require_roles(UserRole.BUYER))):
    return {"message": f"Hello Buyer {user.full_name}, access granted!", "role": user.role}


@router.get("/test/transporter", summary="Test Transporter Role Access")
def test_transporter_role(user: User = Depends(require_roles(UserRole.TRANSPORTER))):
    return {"message": f"Hello Transporter {user.full_name}, access granted!", "role": user.role}


@router.get("/test/warehouse", summary="Test Warehouse Manager Role Access")
def test_warehouse_role(user: User = Depends(require_roles(UserRole.WAREHOUSE_MANAGER))):
    return {"message": f"Hello Warehouse Manager {user.full_name}, access granted!", "role": user.role}


@router.get("/test/admin", summary="Test Admin Role Access")
def test_admin_role(user: User = Depends(require_roles(UserRole.ADMIN))):
    return {"message": f"Hello Admin {user.full_name}, access granted!", "role": user.role}
