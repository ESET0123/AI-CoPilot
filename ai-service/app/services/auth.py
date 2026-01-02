from app.core.config import settings
from app.models.api import LoginRequest

class AuthService:
    @staticmethod
    def authenticate(request: LoginRequest):
        VALID_USERS = {
            settings.ADMIN_USER: {"pass": settings.ADMIN_PASS, "role": "admin"},
            settings.EMP_USER: {"pass": settings.EMP_PASS, "role": "employee"},
        }

        user_data = VALID_USERS.get(request.user_id)
        if (user_data and 
            user_data["pass"] == request.password and 
            user_data["role"] == request.role):
            return True, user_data['role']
        
        return False, None
