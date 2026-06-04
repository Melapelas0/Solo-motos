from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv
import os
from pathlib import Path

# ⚠️ IMPORTANTE: Cargar .env ANTES de importar otros módulos
# Buscar .env en la raíz del proyecto (padre del directorio backend)
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

from .database import Base, engine
from .routers import inventory, appointments, auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Rate limiting global
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda req, exc: JSONResponse(
    status_code=429, 
    content={"detail": "Too many requests. Please try again later."}
))

# Trusted Host Middleware (protege contra Host Header Injection)
# ⚠️ EN PRODUCCIÓN (Railway, Render, Vercel, etc):
#    Configurar ALLOWED_HOSTS con tu dominio real:
#    ALLOWED_HOSTS=tuapp.railway.app,tudominio.com
# Si no lo haces, todas las peticiones serán rechazadas con 400
allowed_hosts = ["localhost", "127.0.0.1", "*.railway.app", "*.render.com", "*.vercel.app"]
allowed_hosts_env = os.getenv("ALLOWED_HOSTS", "").strip()
if allowed_hosts_env:
    # Agregar hosts configurados en .env (sobrescribe los defaults)
    allowed_hosts = allowed_hosts_env.split(",")

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=allowed_hosts
)

# CORS Middleware - Restringido a métodos y headers específicos
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
frontend_url_env = os.getenv("FRONTEND_URL", "")
if frontend_url_env:
    origins.extend([url.strip() for url in frontend_url_env.split(",") if url.strip()])
else:
    origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Permite previsualizaciones dinámicas de Vercel
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# Agregar headers de seguridad
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.include_router(inventory.router)
app.include_router(appointments.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "API funcionando"}