from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import os
from ..auth import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(credentials: LoginRequest):
    # Obtenemos las credenciales correctas desde las variables de entorno
    admin_user = os.getenv("VITE_ADMIN_USER", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    
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