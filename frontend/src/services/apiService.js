/**
 * Servicio para comunicación con la API
 * Maneja requests HTTP y gestión de tokens
 */

import axios from 'axios';

class ApiService {
  constructor() {
    // Configurar instancia de axios
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('qr_units_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar respuestas
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Configura el token de autenticación
   */
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.Authorization;
    }
  }

  /**
   * Limpia autenticación
   */
  clearAuth() {
    localStorage.removeItem('qr_units_token');
    localStorage.removeItem('qr_units_user');
    delete this.api.defaults.headers.Authorization;
  }

  /**
   * Genera token mock para desarrollo
   */
  async generateMockToken(userId, role) {
    const response = await axios.post('/api/v1/auth/mock-token', {
      user_id: userId,
      role: role
    });
    return response.data;
  }

  /**
   * Obtiene información de una unidad
   */
  async getUnit(unitId) {
    const response = await this.api.get(`/units/${unitId}`);
    return response.data;
  }

  /**
   * Obtiene historial de eventos de una unidad
   */
  async getUnitEvents(unitId, limit = 50) {
    const response = await this.api.get(`/units/${unitId}/events`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Registra un nuevo evento
   */
  async createEvent(unitId, eventData, photo = null) {
    const formData = new FormData();
    
    // Agregar datos del evento
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined) {
        formData.append(key, eventData[key]);
      }
    });

    // Agregar foto si existe
    if (photo) {
      formData.append('photo', photo);
    }

    const response = await this.api.post(`/units/${unitId}/events`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  /**
   * Obtiene lista de unidades
   */
  async getUnits(filters = {}) {
    const response = await this.api.get('/units', { params: filters });
    return response.data;
  }

  /**
   * Verifica estado de sincronización
   */
  async getSyncStatus(unitId) {
    const response = await this.api.get(`/units/${unitId}/sync-status`);
    return response.data;
  }

  /**
   * Health check del servidor
   */
  async healthCheck() {
    const response = await axios.get('/health');
    return response.data;
  }

  /**
   * Sube múltiples eventos (para sincronización offline)
   */
  async syncEvents(events) {
    const results = [];
    
    for (const event of events) {
      try {
        const result = await this.createEvent(
          event.unit_id, 
          event.eventData, 
          event.photo
        );
        results.push({ success: true, event_id: event.id, result });
      } catch (error) {
        results.push({ 
          success: false, 
          event_id: event.id, 
          error: error.response?.data || error.message 
        });
      }
    }
    
    return results;
  }
}

// Instancia singleton del servicio
export const apiService = new ApiService();
export default apiService;
