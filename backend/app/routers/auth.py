from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel
import os
from ..auth import create_access_token
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest):
    # Obtenemos las credenciales correctas desde las variables de entorno
    admin_user = os.getenv("VITE_ADMIN_USER", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    # Validar que ADMIN_PASSWORD esté configurada
    if not admin_password:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de configuración del servidor",
        )
    
    # Validamos
    if credentials.username != admin_user or credentials.password != admin_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generamos el JWT
    access_token = create_access_token(data={"sub": credentials.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }