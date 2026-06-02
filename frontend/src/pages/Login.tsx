import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Lock, Mail, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../services/api';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Llamada real al backend
      const response = await apiRequest<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });

      // Guardamos el token para que api.ts lo use en los headers
      localStorage.setItem('solomotos_token', response.access_token);
      localStorage.setItem('solomotos_auth', 'true');
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-logo">
          <Wrench size={36} style={{ color: 'var(--color-accent)' }} />
          <h1>SoloMotos</h1>
        </div>
        
        <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
          Panel de Control
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
          Ingresa tus credenciales para administrar el taller
        </p>

        {error && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--color-danger-bg)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--color-danger)',
              fontSize: '14px',
              textAlign: 'left',
              marginBottom: '20px'
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="username">Usuario</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)' 
                }} 
              />
              <input 
                id="username"
                type="text" 
                className="form-control" 
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '46px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '28px' }}>
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)' 
                }} 
              />
              <input 
                id="password"
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '46px' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
