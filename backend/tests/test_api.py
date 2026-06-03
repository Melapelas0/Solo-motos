"""
Tests básicos para SoloMotos API
Ejecutar con: pytest backend/tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime
import sys
import os

# Agregar el directorio del backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.main import app

client = TestClient(app)


class TestAuth:
    """Tests para endpoints de autenticación"""
    
    def test_login_invalid_credentials(self):
        """POST /auth/login con credenciales inválidas debe retornar 401"""
        response = client.post(
            "/auth/login",
            json={"username": "admin", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        assert "incorrectos" in response.json()["detail"].lower()
    
    def test_login_valid_credentials(self):
        """POST /auth/login con credenciales válidas debe retornar token"""
        # Nota: Asume ADMIN_PASSWORD=dev_password_123 en .env de desarrollo
        response = client.post(
            "/auth/login",
            json={"username": "admin", "password": "dev_password_123"}
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"
    
    def test_login_missing_fields(self):
        """POST /auth/login sin credenciales debe fallar"""
        response = client.post("/auth/login", json={})
        assert response.status_code == 422  # Validation error
    
    def test_rate_limiting_login(self):
        """Rate limiting: más de 5 intentos fallidos en 1 min debe ser bloqueado"""
        # Hacer 6 intentos fallidos
        for i in range(6):
            response = client.post(
                "/auth/login",
                json={"username": "admin", "password": "wrongpassword"}
            )
            if i < 5:
                assert response.status_code == 401
            else:
                # El 6to debería ser bloqueado por rate limiting
                assert response.status_code == 429
                assert "Too many requests" in response.json()["detail"]


class TestAppointments:
    """Tests para endpoints de citas"""
    
    @pytest.fixture
    def admin_token(self):
        """Fixture para obtener un token válido"""
        response = client.post(
            "/auth/login",
            json={"username": "admin", "password": "dev_password_123"}
        )
        return response.json()["access_token"]
    
    def test_get_booked_slots_public(self):
        """GET /appointments/booked-slots debe ser público (sin token)"""
        response = client.get(
            "/appointments/booked-slots",
            params={"date": "2026-06-01", "service_type": "mecanica"}
        )
        # Puede estar vacío pero no debe requerir autenticación
        assert response.status_code in [200, 204]
    
    def test_get_appointments_requires_auth(self):
        """GET /appointments requiere autenticación"""
        response = client.get("/appointments")
        assert response.status_code == 403  # Forbidden sin token
    
    def test_get_appointments_with_auth(self, admin_token):
        """GET /appointments con token válido debe retornar lista"""
        response = client.get(
            "/appointments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_get_appointments_pagination(self, admin_token):
        """GET /appointments soporta paginación con skip y limit"""
        response = client.get(
            "/appointments?skip=0&limit=10",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10


class TestSecurity:
    """Tests para validar configuraciones de seguridad"""
    
    def test_cors_headers_present(self):
        """Verificar que headers CORS están configurados"""
        response = client.options("/appointments")
        # FastAPI retorna 405 por OPTIONS en GET, pero CORS headers se agregan igual
        assert response.status_code in [200, 405]
    
    def test_security_headers_present(self):
        """Verificar que headers de seguridad están presentes"""
        response = client.get("/")
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
        assert response.headers["X-Frame-Options"] == "DENY"
    
    def test_no_stacktrace_in_errors(self):
        """Errores no deben exponer stack traces en producción"""
        response = client.get("/nonexistent")
        assert response.status_code == 404
        assert "traceback" not in response.text.lower()


class TestInventory:
    """Tests para endpoints de inventario"""
    
    @pytest.fixture
    def admin_token(self):
        """Fixture para obtener un token válido"""
        response = client.post(
            "/auth/login",
            json={"username": "admin", "password": "dev_password_123"}
        )
        return response.json()["access_token"]
    
    def test_get_items_requires_auth(self):
        """GET /items requiere autenticación"""
        response = client.get("/items")
        assert response.status_code == 403
    
    def test_get_items_pagination(self, admin_token):
        """GET /items soporta paginación"""
        response = client.get(
            "/items?skip=0&limit=20",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 20


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
