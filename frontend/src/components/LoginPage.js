/**
 * Página de login para seleccionar usuario y rol
 * Simula autenticación con diferentes roles
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const AVAILABLE_USERS = [
  { id: 'admin001', name: 'Administrador', role: 'admin' },
  { id: 'warehouse001', name: 'Juan Almacén', role: 'warehouse' },
  { id: 'delivery001', name: 'María Entrega', role: 'delivery' },
  { id: 'cleaner001', name: 'Pedro Limpieza', role: 'cleaner' },
  { id: 'collection001', name: 'Ana Recolección', role: 'collection' },
  { id: 'repair001', name: 'Luis Reparación', role: 'repair' }
];

function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja el submit del formulario de login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Por favor selecciona un usuario');
      return;
    }

    setLoading(true);
    setError('');

    const user = AVAILABLE_USERS.find(u => u.id === selectedUser);
    
    try {
      const result = await login(user.id, user.role);
      
      if (result.success) {
        navigate('/scan');
      } else {
        setError(result.error || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene color del rol para la UI
   */
  const getRoleColor = (role) => {
    const colors = {
      admin: '#ef4444',
      warehouse: '#22c55e', 
      delivery: '#3b82f6',
      cleaner: '#8b5cf6',
      collection: '#f59e0b',
      repair: '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  return (
    <div className="mobile-container">
      <div className="flex items-center justify-center min-h-screen">
        <div className="card w-full max-w-md">
          {/* Header */}
          <div className="card-header text-center">
            <div className="mb-4">
              <div 
                className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: '#3b82f6' }}
              >
                QR
              </div>
            </div>
            <h1 className="card-title">QR Units</h1>
            <p className="card-subtitle">
              Sistema de Gestión de Unidades
            </p>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Selecciona tu usuario:
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {AVAILABLE_USERS.map((user) => (
                  <label 
                    key={user.id}
                    className={`
                      flex items-center p-3 border rounded-lg cursor-pointer transition-all
                      ${selectedUser === user.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="user"
                      value={user.id}
                      checked={selectedUser === user.id}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {user.role === 'admin' ? 'Administrador' :
                         user.role === 'warehouse' ? 'Almacén' :
                         user.role === 'delivery' ? 'Entrega' :
                         user.role === 'cleaner' ? 'Limpieza' :
                         user.role === 'collection' ? 'Recolección' :
                         user.role === 'repair' ? 'Reparación' : user.role}
                      </div>
                    </div>
                    
                    {selectedUser === user.id && (
                      <div className="w-5 h-5 text-blue-500">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading || !selectedUser}
              className="btn btn-primary btn-full btn-lg"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Info adicional */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> Esta es una aplicación de prueba. 
              Selecciona cualquier usuario para simular diferentes roles y permisos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
