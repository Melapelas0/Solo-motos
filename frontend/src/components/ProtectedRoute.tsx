import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  // Verificamos las claves que configuramos en el Login.tsx
  const isAuthenticated = localStorage.getItem('solomotos_auth') === 'true';
  const token = localStorage.getItem('solomotos_token');

  // Si no está autenticado o no hay token, redirigimos al login inmediatamente
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // Si la sesión existe, renderizamos las rutas protegidas (Dashboard, Inventario, etc.)
  return <Outlet />;
};