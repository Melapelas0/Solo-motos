const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Recuperamos el token almacenado (asegúrate de usar el mismo nombre al guardarlo en el Login)
  const token = localStorage.getItem('solomotos_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Si el servidor rechaza el token (401), cerramos la sesión en el frontend
      if (response.status === 401) {
        localStorage.removeItem('solomotos_token');
        localStorage.removeItem('solomotos_auth');
        window.location.href = '/login';
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error en la petición: ${response.statusText}`);
    }
    
    // Si la respuesta es vacía (ej. 204 No Content), retornar un objeto vacío
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Request Error on ${endpoint}:`, error);
    throw error;
  }
}
