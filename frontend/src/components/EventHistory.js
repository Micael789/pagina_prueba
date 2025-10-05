/**
 * Componente para mostrar historial de eventos de una unidad
 * Incluye información detallada de cada evento
 */

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

function EventHistory({ unitId, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, [unitId]);

  /**
   * Carga el historial de eventos
   */
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUnitEvents(unitId);
      setEvents(response.data.events);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando historial');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene el ícono para cada tipo de evento
   */
  const getEventIcon = (eventType) => {
    const icons = {
      salida_a_ubicacion: '🚚',
      confirmar_entrega: '📦',
      marcar_recoleccion: '🔄',
      confirmar_recolectado: '✅',
      disponible: '✨',
      iniciar_limpieza: '🧽',
      limpieza_realizada: '✅',
      entrada_reparacion: '🔧',
      reparacion_finalizada: '✅'
    };
    return icons[eventType] || '⚡';
  };

  /**
   * Formatea la fecha de manera legible
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `Hace ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  /**
   * Abre la foto en pantalla completa
   */
  const openPhoto = (photoPath) => {
    if (photoPath) {
      window.open(`/uploads/${photoPath}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full max-h-[90vh] rounded-t-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Historial de Eventos
              </h3>
              <p className="text-sm text-gray-600">
                Unidad {unitId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '2rem', height: '2rem' }}></div>
                <p className="text-gray-600">Cargando historial...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700 mb-3">{error}</p>
                <button
                  onClick={loadEvents}
                  className="btn btn-primary"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="p-4 text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                Sin Eventos
              </h3>
              <p className="text-sm text-gray-600">
                Esta unidad aún no tiene eventos registrados.
              </p>
            </div>
          ) : (
            <div className="p-4">
              {/* Timeline de eventos */}
              <div className="relative">
                {/* Línea de timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {events.map((event, index) => (
                  <div key={event.event_id} className="relative flex items-start mb-6">
                    {/* Ícono del evento */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full">
                      <span className="text-sm">
                        {getEventIcon(event.event_type)}
                      </span>
                    </div>

                    {/* Contenido del evento */}
                    <div className="ml-4 flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        {/* Header del evento */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {event.event_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Por {event.user_name || event.user_id}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                        </div>

                        {/* Transición de estado */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`status-badge status-${event.status_before} text-xs`}>
                            {event.state_before_info?.name}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`status-badge status-${event.status_after} text-xs`}>
                            {event.state_after_info?.name}
                          </span>
                        </div>

                        {/* Notas */}
                        {event.notes && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              💬 {event.notes}
                            </p>
                          </div>
                        )}

                        {/* Información adicional */}
                        <div className="space-y-1">
                          {/* Ubicación GPS */}
                          {(event.geo_lat && event.geo_lng) && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <span>📍</span>
                              <span>
                                GPS: {event.geo_lat.toFixed(6)}, {event.geo_lng.toFixed(6)}
                              </span>
                            </div>
                          )}

                          {/* Firma */}
                          {event.signature_data && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <span>✍️</span>
                              <span>Firmado electrónicamente</span>
                            </div>
                          )}

                          {/* Foto */}
                          {event.photo_path && (
                            <div className="mt-2">
                              <button
                                onClick={() => openPhoto(event.photo_path)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span>📸</span>
                                <span>Ver foto adjunta</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Timestamp completo */}
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Información adicional */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-800">
                  <strong>Total de eventos:</strong> {events.length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-full"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventHistory;
