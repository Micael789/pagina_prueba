/**
 * Componente principal de la aplicación
 * Maneja rutas y estado global
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ScanPage from './components/ScanPage';
import LoginPage from './components/LoginPage';
import QRCodeLandingPage from './components/QRCodeLandingPage';
import OfflineIndicator from './components/OfflineIndicator';
import { AuthProvider, useAuth } from './services/AuthContext';
import { SyncProvider } from './services/SyncContext';
import NotificationContainer from './components/NotificationContainer';
import './styles/QRCodeLandingPage.css';

/**
 * Componente wrapper para rutas protegidas
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" style={{ width: '2rem', height: '2rem' }}></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Componente principal de la aplicación
 */
function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Escuchar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <SyncProvider>
        <div className="App">
          <Routes>
            {/* Ruta de login */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/qr/:qrId" element={<QRCodeLandingPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ScanPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="*" 
              element={
                <div className="mobile-container flex items-center justify-center min-h-screen">
                  <div className="card text-center">
                    <h1 className="card-title">Página no encontrada</h1>
                    <p className="card-subtitle mb-4">
                      La página que buscas no existe.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/'}
                    >
                      Volver al inicio
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>

          {/* Indicador de estado offline */}
          <OfflineIndicator isOnline={isOnline} />
          
          {/* Container para notificaciones */}
          <NotificationContainer />
        </div>
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;
