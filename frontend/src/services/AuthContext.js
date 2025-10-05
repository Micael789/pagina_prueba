/**
 * Context de autenticación
 * Maneja login, logout y persistencia de sesión
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from './apiService';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('qr_units_user');
        const savedToken = localStorage.getItem('qr_units_token');
        
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          apiService.setAuthToken(savedToken);
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Iniciar sesión con credenciales mock
   */
  const login = async (userId, role) => {
    try {
      setLoading(true);
      
      // Generar token mock
      const response = await apiService.generateMockToken(userId, role);
      
      const userData = {
        user_id: userId,
        role: role,
        loginTime: new Date().toISOString()
      };

      // Guardar en localStorage
      localStorage.setItem('qr_units_user', JSON.stringify(userData));
      localStorage.setItem('qr_units_token', response.token);
      
      // Configurar token en el servicio API
      apiService.setAuthToken(response.token);
      
      setUser(userData);
      return { success: true };
      
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.message || 'Error de autenticación' 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    localStorage.removeItem('qr_units_user');
    localStorage.removeItem('qr_units_token');
    apiService.setAuthToken(null);
    setUser(null);
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === requiredRole;
  };

  /**
   * Verificar si el usuario puede realizar una acción
   */
  const canPerformAction = (eventType) => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    // Mapeo de permisos por rol
    const rolePermissions = {
      warehouse: ['disponible', 'entrada_reparacion', 'confirmar_recolectado'],
      delivery: ['salida_a_ubicacion', 'confirmar_entrega'],
      cleaner: ['iniciar_limpieza', 'limpieza_realizada'],
      collection: ['marcar_recoleccion', 'confirmar_recolectado'],
      repair: ['entrada_reparacion', 'reparacion_finalizada']
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(eventType);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    canPerformAction
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
