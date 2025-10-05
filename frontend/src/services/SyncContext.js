/**
 * Context para manejo de sincronización offline
 * Gestiona eventos pendientes y sincronización automática
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';
import { apiService } from './apiService';
import { v4 as uuidv4 } from 'uuid';

const SyncContext = createContext(null);

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync debe usarse dentro de un SyncProvider');
  }
  return context;
}

export function SyncProvider({ children }) {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Cargar eventos pendientes al iniciar
  useEffect(() => {
    loadPendingEvents();
    loadLastSync();
  }, []);

  // Sincronizar automáticamente cuando se conecta
  useEffect(() => {
    const handleOnline = () => {
      if (pendingEvents.length > 0) {
        syncPendingEvents();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingEvents]);

  /**
   * Carga eventos pendientes desde almacenamiento local
   */
  const loadPendingEvents = async () => {
    try {
      const events = await localforage.getItem('pending_events') || [];
      setPendingEvents(events);
    } catch (error) {
      console.error('Error cargando eventos pendientes:', error);
    }
  };

  /**
   * Carga timestamp del último sync
   */
  const loadLastSync = async () => {
    try {
      const timestamp = await localforage.getItem('last_sync');
      setLastSync(timestamp);
    } catch (error) {
      console.error('Error cargando último sync:', error);
    }
  };

  /**
   * Guarda evento offline para sincronizar después
   */
  const saveEventOffline = async (unitId, eventData, photo = null) => {
    try {
      const event = {
        id: uuidv4(),
        unit_id: unitId,
        eventData: {
          ...eventData,
          idempotency_key: eventData.idempotency_key || uuidv4()
        },
        photo: photo,
        timestamp: new Date().toISOString(),
        synced: false
      };

      // Guardar foto en almacenamiento local si existe
      if (photo) {
        const photoKey = `photo_${event.id}`;
        await localforage.setItem(photoKey, photo);
        event.photoKey = photoKey;
      }

      const currentEvents = await localforage.getItem('pending_events') || [];
      const updatedEvents = [...currentEvents, event];
      
      await localforage.setItem('pending_events', updatedEvents);
      setPendingEvents(updatedEvents);

      return { success: true, event };
    } catch (error) {
      console.error('Error guardando evento offline:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Sincroniza eventos pendientes con el servidor
   */
  const syncPendingEvents = async () => {
    if (syncing || !navigator.onLine || pendingEvents.length === 0) {
      return;
    }

    setSyncing(true);

    try {
      const eventsToSync = [...pendingEvents];
      const syncResults = [];

      for (const event of eventsToSync) {
        try {
          let photo = null;
          
          // Recuperar foto si existe
          if (event.photoKey) {
            photo = await localforage.getItem(event.photoKey);
          }

          // Intentar sincronizar con el servidor
          const result = await apiService.createEvent(
            event.unit_id,
            event.eventData,
            photo
          );

          syncResults.push({
            ...event,
            synced: true,
            syncResult: result
          });

          // Limpiar foto del almacenamiento local
          if (event.photoKey) {
            await localforage.removeItem(event.photoKey);
          }

        } catch (error) {
          console.error('Error sincronizando evento:', error);
          
          // Si el error es por evento duplicado, marcarlo como sincronizado
          if (error.response?.data?.code === 'DUPLICATE_EVENT') {
            syncResults.push({
              ...event,
              synced: true,
              syncResult: { duplicate: true }
            });
          } else {
            // Mantener el evento para reintentar después
            syncResults.push({
              ...event,
              synced: false,
              lastError: error.response?.data?.message || error.message
            });
          }
        }
      }

      // Filtrar eventos que no se han sincronizado
      const remainingEvents = syncResults.filter(event => !event.synced);
      
      // Actualizar almacenamiento local
      await localforage.setItem('pending_events', remainingEvents);
      setPendingEvents(remainingEvents);

      // Actualizar timestamp del último sync
      const now = new Date().toISOString();
      await localforage.setItem('last_sync', now);
      setLastSync(now);

      return {
        success: true,
        synced: syncResults.filter(e => e.synced).length,
        failed: remainingEvents.length
      };

    } catch (error) {
      console.error('Error en sincronización:', error);
      return { success: false, error: error.message };
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Registra evento - online o offline según conectividad
   */
  const registerEvent = async (unitId, eventData, photo = null) => {
    // Generar clave de idempotencia si no existe
    if (!eventData.idempotency_key) {
      eventData.idempotency_key = uuidv4();
    }

    if (navigator.onLine) {
      try {
        // Intentar enviar directamente
        const result = await apiService.createEvent(unitId, eventData, photo);
        return { success: true, result, offline: false };
      } catch (error) {
        // Si falla, guardar offline
        console.warn('Error enviando evento, guardando offline:', error);
        const offlineResult = await saveEventOffline(unitId, eventData, photo);
        return { ...offlineResult, offline: true };
      }
    } else {
      // Sin conexión, guardar offline
      const offlineResult = await saveEventOffline(unitId, eventData, photo);
      return { ...offlineResult, offline: true };
    }
  };

  /**
   * Limpia todos los eventos pendientes
   */
  const clearPendingEvents = async () => {
    try {
      await localforage.removeItem('pending_events');
      setPendingEvents([]);
    } catch (error) {
      console.error('Error limpiando eventos pendientes:', error);
    }
  };

  /**
   * Obtiene estadísticas de sincronización
   */
  const getSyncStats = () => {
    return {
      pending: pendingEvents.length,
      syncing,
      lastSync,
      hasConnection: navigator.onLine
    };
  };

  const value = {
    pendingEvents,
    syncing,
    lastSync,
    registerEvent,
    syncPendingEvents,
    clearPendingEvents,
    getSyncStats
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}
