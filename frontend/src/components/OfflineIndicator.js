/**
 * Indicador de estado offline/online
 * Muestra cuando la app no tiene conexión
 */

import React from 'react';
import { useSync } from '../services/SyncContext';

function OfflineIndicator({ isOnline }) {
  const { getSyncStats, syncPendingEvents } = useSync();
  const syncStats = getSyncStats();

  // No mostrar nada si está online y no hay eventos pendientes
  if (isOnline && syncStats.pending === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40">
      {!isOnline ? (
        // Indicador de offline
        <div className="offline-indicator">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">
              Sin conexión a internet
            </span>
          </div>
          <div className="text-xs mt-1 opacity-90">
            Los eventos se guardarán localmente
          </div>
        </div>
      ) : syncStats.pending > 0 ? (
        // Indicador de eventos pendientes de sincronización
        <div 
          className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer transition-all"
          onClick={syncPendingEvents}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncStats.syncing ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                  {syncStats.pending}
                </div>
              )}
              <div>
                <div className="font-medium text-sm">
                  {syncStats.syncing ? 'Sincronizando...' : `${syncStats.pending} evento(s) pendiente(s)`}
                </div>
                <div className="text-xs opacity-90">
                  {syncStats.syncing ? 'Por favor espera' : 'Toca para sincronizar'}
                </div>
              </div>
            </div>
            
            {!syncStats.syncing && (
              <div className="text-white opacity-75">
                ↗️
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OfflineIndicator;
