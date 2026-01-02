from fastapi import APIRouter
from app.models.api import LoginRequest, AuthResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/api")

@router.post("/login", response_model=AuthResponse)
def login_handler(request: LoginRequest):
    """
    Validates user credentials and returns the associated role.
    """
    success, role = AuthService.authenticate(request)
    if success:
        return AuthResponse(success=True, role=role, message="Login successful.")
    
    return AuthResponse(success=False, message="Invalid ID, Password, or Role selection.")
