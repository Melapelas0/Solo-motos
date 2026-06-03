# 🏍️ SoloMotos - Taller de Motos Management System

Sistema web para gestión de citas y inventario de un taller de motos.

**Status:** ✅ Listo para producción (después de aplicar SECURITY_CHECKLIST.md)

---

## 🚀 Inicio Rápido

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows: source venv/bin/activate en Linux/Mac

pip install -r requirements.txt

# Crear .env con valores seguros (copiar de .env.example)
cp .env.example .env
# EDITAR .env con SECRET_KEY y ADMIN_PASSWORD generados

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Crear .env
cp .env.example .env

npm run dev
```

### URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

---

## 🔒 ANTES DE DESPLEGAR A PRODUCCIÓN

**⚠️ CRÍTICO:** Leer [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) completamente

Resumen de cambios de seguridad:
- ✅ JWT Secret sin fallback (requiere .env)
- ✅ CORS restringido a métodos específicos
- ✅ Rate limiting en /login
- ✅ Migrado a PyJWT (de python-jose)
- ✅ Fallback de localStorage eliminado
- ⚠️ HTTPS debe configurarse
- ⚠️ Tokens deben migrar a HttpOnly Cookies

Ver [REMEDIATION_REPORT.md](REMEDIATION_REPORT.md) para detalle técnico completo.

---

## 🧪 Testing

```bash
cd backend
pip install pytest pytest-asyncio httpx
pytest tests/ -v
```

Ver [TESTING.md](TESTING.md) para más detalles.

---

## 📁 Estructura

```
.
├── backend/
│   ├── app/
│   │   ├── main.py           # App FastAPI principal
│   │   ├── auth.py           # JWT + autenticación
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── models/           # ORM models
│   │   ├── routers/          # API endpoints
│   │   └── schemas/          # Pydantic schemas
│   ├── requirements.txt       # Dependencias Python
│   └── tests/                # Tests pytest
├── frontend/
│   ├── src/
│   │   ├── pages/            # Rutas React
│   │   ├── components/       # Componentes reutilizables
│   │   ├── services/         # API calls
│   │   └── types/            # TypeScript types
│   ├── .env.example          # Template de variables
│   └── package.json          # Dependencias npm
├── .env.example              # Template de variables backend
├── SECURITY_CHECKLIST.md     # Guía de seguridad producción
├── REMEDIATION_REPORT.md     # Detalles técnicos de fixes
├── TESTING.md                # Guía de testing
└── QUICKSTART.md             # Checklist de 30 min
```

---

## 🔧 Configuración Variables de Entorno

Copiar [.env.example](.env.example) a `.env` y configurar:

**Backend - Críticas:**
- `SECRET_KEY` - Generar con: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `ADMIN_PASSWORD` - Contraseña fuerte (mínimo 12 caracteres)

**Frontend - Requerida:**
- `VITE_API_URL` - URL HTTPS del backend (http://localhost:8000 en desarrollo)

**Producción:**
- `FRONTEND_URL` - URL HTTPS del frontend
- `ALLOWED_HOSTS` - Dominios permitidos

---

## 📚 Documentación

| Documento | Para... |
|-----------|---------|
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) | Guía completa de seguridad para producción |
| [REMEDIATION_REPORT.md](REMEDIATION_REPORT.md) | Detalles de todos los fixes aplicados |
| [TESTING.md](TESTING.md) | Cómo ejecutar y escribir tests |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Pasos para desplegar en producción |
| [QUICKSTART.md](QUICKSTART.md) | Checklist rápido antes de desplegar |

---

## 🛠️ Tecnologías

**Backend:**
- FastAPI 0.104
- SQLAlchemy 2.0
- PyJWT (autenticación)
- slowapi (rate limiting)

**Frontend:**
- React 18 (TypeScript)
- Vite
- Fetch API

---

## 📞 API Endpoints

### Autenticación
- `POST /auth/login` - Login (rate limited 5/min)

### Citas
- `GET /appointments` - Listar citas (admin, con paginación)
- `GET /appointments/booked-slots` - Slots ocupados (público)
- `POST /appointments` - Crear cita (público)
- `PUT /appointments/{id}` - Actualizar cita (admin)
- `DELETE /appointments/{id}` - Eliminar cita (admin)

### Inventario
- `GET /items` - Listar items (admin, con paginación)
- `POST /items` - Crear item (admin)
- `PUT /items/{id}` - Actualizar item (admin)
- `DELETE /items/{id}` - Eliminar item (admin)

Ver http://localhost:8000/docs para documentación interactiva.

---

## ⚙️ Próximas Mejoras

- [ ] Más tests (>80% coverage)
- [ ] Dashboard analytics
- [ ] Reportes PDF
- [ ] Push notifications
- [ ] Backup automático
- [ ] Logs centralizados

---

## 📄 Licencia

MIT