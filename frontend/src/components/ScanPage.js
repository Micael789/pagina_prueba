/**
 * Página principal de escaneo de QR
 * Muestra información de unidad y acciones disponibles
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useSync } from '../services/SyncContext';
import { apiService } from '../services/apiService';
import UnitInfo from './UnitInfo';
import ActionModal from './ActionModal';
import QRScanner from './QRScanner';
import EventHistory from './EventHistory';
import confetti from 'canvas-confetti';

function ScanPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { getSyncStats, syncPendingEvents } = useSync();
  
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const unitId = searchParams.get('unit_id');
  const syncStats = getSyncStats();

  // Cargar unidad al cambiar el unit_id
  useEffect(() => {
    if (unitId) {
      loadUnit(unitId);
    }
  }, [unitId]);

  /**
   * Carga información de la unidad
   */
  const loadUnit = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getUnit(id);
      setUnit(response.data);
      
      // Efecto de confetti para unidades importantes
      if (response.data.current_status === 'reparacion') {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando la unidad');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el resultado del escaneo QR
   */
  const handleQRResult = (result) => {
    try {
      // Parsear URL del QR
      const url = new URL(result);
      const scannedUnitId = url.searchParams.get('unit_id');
      
      if (scannedUnitId) {
        setSearchParams({ unit_id: scannedUnitId });
        setShowScanner(false);
      } else {
        setError('QR inválido: no contiene unit_id');
      }
    } catch (err) {
      setError('QR inválido: formato incorrecto');
    }
  };

  /**
   * Maneja la ejecución de una acción
   */
  const handleActionComplete = async () => {
    setSelectedAction(null);
    // Recargar unidad para ver cambios
    if (unitId) {
      await loadUnit(unitId);
    }
    
    // Efecto visual de éxito
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  /**
   * Simula escaneo de QR con unidades de prueba
   */
  const simulateQR = (testUnitId) => {
    setSearchParams({ unit_id: testUnitId });
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '2rem', height: '2rem' }}></div>
            <p className="text-gray-600">Cargando unidad...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">QR Units</h1>
          <p className="text-sm text-gray-600">
            {user?.role === 'admin' ? 'Administrador' :
             user?.role === 'warehouse' ? 'Almacén' :
             user?.role === 'delivery' ? 'Entrega' :
             user?.role === 'cleaner' ? 'Limpieza' :
             user?.role === 'collection' ? 'Recolección' :
             user?.role === 'repair' ? 'Reparación' : user?.role}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicador de eventos pendientes */}
          {syncStats.pending > 0 && (
            <button
              onClick={syncPendingEvents}
              className="relative"
              disabled={syncStats.syncing}
            >
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {syncStats.pending}
              </div>
              {syncStats.syncing && (
                <div className="absolute inset-0 loading-spinner"></div>
              )}
            </button>
          )}
          
          <button
            onClick={logout}
            className="btn btn-secondary text-xs px-3 py-1"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      {!unitId ? (
        <div className="text-center">
          <div className="card mb-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4m-4 0v3m0 0h.01M20 8v.01"></path>
                </svg>
              </div>
              <h2 className="card-title mb-2">Escanear Código QR</h2>
              <p className="card-subtitle mb-6">
                Escanea el código QR de una unidad para ver su información y acciones disponibles
              </p>
              
              <button
                onClick={() => setShowScanner(true)}
                className="btn btn-primary btn-lg mb-4"
              >
                📱 Abrir Escáner QR
              </button>
            </div>
          </div>

          {/* Unidades de prueba */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Unidades de Prueba</h3>
              <p className="card-subtitle">
                Selecciona una unidad para simular escaneo QR
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {['UN001', 'UN002', 'UN003', 'UN004', 'UN005', 'UN006'].map(id => (
                <button
                  key={id}
                  onClick={() => simulateQR(id)}
                  className="btn btn-secondary"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {unit && (
            <>
              {/* Información de la unidad */}
              <UnitInfo 
                unit={unit}
                onActionSelect={setSelectedAction}
                onShowHistory={() => setShowHistory(true)}
              />
              
              {/* Botones de navegación */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSearchParams({})}
                  className="btn btn-secondary flex-1"
                >
                  🔍 Escanear Otro QR
                </button>
                
                <button
                  onClick={() => loadUnit(unitId)}
                  className="btn btn-primary"
                >
                  🔄
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modales */}
      {showScanner && (
        <QRScanner
          onResult={handleQRResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {selectedAction && unit && (
        <ActionModal
          unit={unit}
          action={selectedAction}
          onComplete={handleActionComplete}
          onCancel={() => setSelectedAction(null)}
        />
      )}

      {showHistory && unit && (
        <EventHistory
          unitId={unit.unit_id}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default ScanPage;
