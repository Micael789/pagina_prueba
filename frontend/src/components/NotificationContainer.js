/**
 * Container para mostrar notificaciones del sistema
 * Maneja notificaciones temporales de éxito/error
 */

import React, { useState, useEffect } from 'react';

let notificationHandler = null;

// API pública para mostrar notificaciones desde cualquier parte de la app
export const showNotification = (message, type = 'success', duration = 5000) => {
  if (notificationHandler) {
    notificationHandler(message, type, duration);
  }
};

function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Registrar el handler global
    notificationHandler = (message, type, duration) => {
      const id = Date.now();
      const notification = { id, message, type, duration };
      
      setNotifications(prev => [...prev, notification]);

      // Auto-remove después del tiempo especificado
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    };

    // Cleanup al desmontar
    return () => {
      notificationHandler = null;
    };
  }, []);

  /**
   * Remueve manualmente una notificación
   */
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  /**
   * Obtiene el ícono según el tipo de notificación
   */
  const getIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  /**
   * Obtiene las clases CSS según el tipo
   */
  const getNotificationClasses = (type) => {
    const baseClasses = 'notification';
    const typeClasses = {
      success: 'notification-success',
      error: 'notification-error',
      warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
      info: 'bg-blue-50 border-blue-300 text-blue-800'
    };
    
    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationClasses(notification.type)}
        >
          <div className="flex items-start gap-3">
            <div className="text-lg">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium">
                {notification.message}
              </p>
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationContainer;
