/**
 * Componente para mostrar información de una unidad
 * Incluye estado actual, ubicación y acciones disponibles
 */

import React from 'react';
import { useAuth } from '../services/AuthContext';

function UnitInfo({ unit, onActionSelect, onShowHistory }) {
  const { user } = useAuth();

  /**
   * Obtiene el ícono para cada tipo de evento
   */
  const getActionIcon = (eventType) => {
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
   * Obtiene el color del botón según el tipo de acción
   */
  const getActionButtonClass = (eventType) => {
    const classes = {
      salida_a_ubicacion: 'btn-primary',
      confirmar_entrega: 'btn-success',
      marcar_recoleccion: 'btn-warning',
      confirmar_recolectado: 'btn-success',
      disponible: 'btn-success',
      iniciar_limpieza: 'btn-info',
      limpieza_realizada: 'btn-success',
      entrada_reparacion: 'btn-warning',
      reparacion_finalizada: 'btn-success'
    };
    return `btn ${classes[eventType] || 'btn-primary'}`;
  };

  return (
    <div className="space-y-4">
      {/* Información básica de la unidad */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {unit.name}
            </h2>
            <p className="text-sm text-gray-600">
              ID: {unit.unit_id}
            </p>
          </div>
          
          <button
            onClick={onShowHistory}
            className="btn btn-secondary text-sm px-3 py-1"
          >
            📋 Historial
          </button>
        </div>

        {/* Estado actual */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: unit.state_info.color }}
            ></div>
            <div>
              <div className="font-medium text-gray-900">
                {unit.state_info.name}
              </div>
              <div className="text-sm text-gray-600">
                {unit.state_info.description}
              </div>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        {unit.location && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📍</span>
              <span className="text-sm font-medium text-gray-900">
                {unit.location}
              </span>
            </div>
          </div>
        )}

        {/* Información del usuario actual */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <div className="flex justify-between">
            <span>Usuario: {user?.user_id}</span>
            <span>Rol: {user?.role}</span>
          </div>
        </div>
      </div>

      {/* Acciones disponibles */}
      {unit.available_actions && unit.available_actions.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Acciones Disponibles</h3>
            <p className="card-subtitle">
              Selecciona la acción que deseas realizar
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {unit.available_actions.map((action) => (
              <button
                key={action.event_type}
                onClick={() => onActionSelect(action)}
                className={`${getActionButtonClass(action.event_type)} btn-full flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {getActionIcon(action.event_type)}
                  </span>
                  <div className="text-left">
                    <div className="font-medium">
                      {action.name}
                    </div>
                    {action.requires_signature && (
                      <div className="text-xs opacity-80">
                        ✍️ Requiere firma
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm opacity-80">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            Sin Acciones Disponibles
          </h3>
          <p className="text-sm text-gray-600">
            No tienes permisos para realizar acciones en esta unidad con tu rol actual ({user?.role}).
          </p>
        </div>
      )}

      {/* Información de estado extendida */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Detalles de la Unidad</h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Estado:</span>
            <span className={`status-badge status-${unit.current_status}`}>
              {unit.state_info.name}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">ID de Unidad:</span>
            <span className="font-mono text-gray-900">{unit.unit_id}</span>
          </div>

          {unit.assigned_to && (
            <div className="flex justify-between">
              <span className="text-gray-600">Asignado a:</span>
              <span className="text-gray-900">{unit.assigned_to}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Última actualización:</span>
            <span className="text-gray-900">
              {unit.updated_at ? new Date(unit.updated_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Guía rápida para el usuario */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-blue-900 mb-1">
              Guía Rápida
            </div>
            <div className="text-sm text-blue-800">
              {unit.available_actions?.length > 0 
                ? `Tienes ${unit.available_actions.length} acción(es) disponible(s) para esta unidad. Las acciones con ✍️ requieren firma electrónica.`
                : `Esta unidad está en estado "${unit.state_info.name}". Tu rol (${user?.role}) no tiene acciones disponibles para este estado.`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnitInfo;
