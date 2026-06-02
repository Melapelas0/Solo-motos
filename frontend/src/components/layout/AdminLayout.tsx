import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Warehouse, 
  ClipboardList, 
  Droplet, 
  LogOut, 
  Wrench,
  User
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar autenticación local y redirigir
    localStorage.removeItem('solomotos_auth');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      {/* Sidebar de Navegación */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Wrench size={28} className="text-primary" style={{ color: 'var(--color-accent)' }} />
          <h1>SoloMotos</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/inventario" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Warehouse size={20} />
            <span>Inventario</span>
          </NavLink>

          <NavLink 
            to="/admin/citas" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ClipboardList size={20} />
            <span>Citas Mecánicas</span>
          </NavLink>

          <NavLink 
            to="/admin/lavadero" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Droplet size={20} />
            <span>Lavadero</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-link" style={{ cursor: 'default', color: 'var(--text-primary)' }}>
            <User size={20} />
            <span>Administrador</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="sidebar-link btn" 
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              textAlign: 'left',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            <LogOut size={20} style={{ color: 'var(--color-danger)' }} />
            <span style={{ color: 'var(--color-danger)' }}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
