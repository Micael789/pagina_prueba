/**
 * Punto de entrada principal de la aplicación React
 * Configura el router y proveedores globales
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Configurar localforage para almacenamiento offline
import localforage from 'localforage';

localforage.config({
  driver: [
    localforage.INDEXEDDB,
    localforage.WEBSQL,
    localforage.LOCALSTORAGE
  ],
  name: 'QRUnitsApp',
  version: 1.0,
  storeName: 'qr_units_store',
  description: 'Almacenamiento offline para eventos de unidades'
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Registrar Service Worker para funcionalidad offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrado:', registration);
      })
      .catch(registrationError => {
        console.log('SW no registrado:', registrationError);
      });
  });
}
