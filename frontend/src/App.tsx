import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import { AdminLayout } from './components/layout/AdminLayout';

// Páginas Públicas
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Agendar } from './pages/Agendar';

// Páginas Administrativas
import { Dashboard } from './pages/admin/Dashboard';
import { Inventario } from './pages/admin/Inventario';
import { Citas } from './pages/admin/Citas';
import { Lavadero } from './pages/admin/Lavadero';
import { Historial } from './pages/admin/Historial';

// Componente para Proteger Rutas Administrativas
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('solomotos_auth') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas del Administrador */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/inventario" 
          element={
            <ProtectedRoute>
              <Inventario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/citas" 
          element={
            <ProtectedRoute>
              <Citas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/lavadero" 
          element={
            <ProtectedRoute>
              <Lavadero />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/historial" 
          element={
            <ProtectedRoute>
              <Historial />
            </ProtectedRoute>
          } 
        />

        {/* Ruta Comodín para Redirigir Errores 404 */}
        <Route path="*" element={<Navigate to="/agendar" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
