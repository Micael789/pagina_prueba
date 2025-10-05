/**
 * Modal para ejecutar acciones en unidades
 * Incluye captura de firma, foto y notas
 */

import React, { useState, useRef } from 'react';
import { useSync } from '../services/SyncContext';
import { useAuth } from '../services/AuthContext';
import SignatureCanvas from './SignatureCanvas';
import { v4 as uuidv4 } from 'uuid';

function ActionModal({ unit, action, onComplete, onCancel }) {
  const { registerEvent } = useSync();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    notes: '',
    location: unit.location || '',
    geo_lat: null,
    geo_lng: null
  });
  
  const [signature, setSignature] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  
  const fileInputRef = useRef();

  /**
   * Obtiene geolocalización del usuario
   */
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no disponible en este dispositivo');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          geo_lat: position.coords.latitude,
          geo_lng: position.coords.longitude
        }));
      },
      (error) => {
        console.warn('Error obteniendo ubicación:', error);
        setError('No se pudo obtener la ubicación');
      },
      { timeout: 10000 }
    );
  };

  /**
   * Maneja la selección de foto
   */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La foto es muy grande. Máximo 5MB.');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }

    setPhoto(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  /**
   * Elimina la foto seleccionada
   */
  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Envía el formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar firma si es requerida
      if (action.requires_signature && !signature) {
        setError('Esta acción requiere firma electrónica');
        setLoading(false);
        return;
      }

      // Preparar datos del evento
      const eventData = {
        event_type: action.event_type,
        signature_data: signature || null,
        geo_lat: formData.geo_lat,
        geo_lng: formData.geo_lng,
        notes: formData.notes.trim() || null,
        location: formData.location.trim() || null,
        idempotency_key: uuidv4()
      };

      // Registrar evento (online u offline)
      const result = await registerEvent(unit.unit_id, eventData, photo);

      if (result.success) {
        onComplete();
      } else {
        setError(result.error || 'Error registrando el evento');
      }
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
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
                {action.name}
              </h3>
              <p className="text-sm text-gray-600">
                {unit.name} • {unit.unit_id}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Ubicación (si aplica) */}
            {(['salida_a_ubicacion', 'confirmar_entrega'].includes(action.event_type)) && (
              <div className="form-group">
                <label className="form-label">
                  Ubicación de destino
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ej: Obra Norte - Sector A"
                />
              </div>
            )}

            {/* Notas */}
            <div className="form-group">
              <label className="form-label">
                Notas adicionales (opcional)
              </label>
              <textarea
                className="form-input form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Escribe cualquier observación relevante..."
                rows="3"
              />
            </div>

            {/* Geolocalización */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">
                  Ubicación GPS (opcional)
                </label>
                <button
                  type="button"
                  onClick={getLocation}
                  className="btn btn-secondary text-sm px-3 py-1"
                >
                  📍 Obtener
                </button>
              </div>
              {formData.geo_lat && formData.geo_lng && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✅ Ubicación obtenida: {formData.geo_lat.toFixed(6)}, {formData.geo_lng.toFixed(6)}
                </div>
              )}
            </div>

            {/* Foto */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">
                  Foto (opcional)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary text-sm px-3 py-1"
                >
                  📸 Tomar Foto
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="camera"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photoPreview && (
                <div className="relative mt-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full max-w-xs rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Firma */}
            {action.requires_signature && (
              <div className="form-group">
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label mb-0">
                    Firma electrónica *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSignature(!showSignature)}
                    className={`btn text-sm px-3 py-1 ${signature ? 'btn-success' : 'btn-primary'}`}
                  >
                    {signature ? '✅ Firmado' : '✍️ Firmar'}
                  </button>
                </div>

                {showSignature && (
                  <SignatureCanvas
                    onSave={setSignature}
                    onCancel={() => setShowSignature(false)}
                  />
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Información sobre offline */}
            {!navigator.onLine && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <div>
                    <strong>Sin conexión:</strong> El evento se guardará localmente 
                    y se sincronizará cuando recuperes la conexión.
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer con botones */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSubmit}
            className="btn btn-primary flex-1"
            disabled={loading || (action.requires_signature && !signature)}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              `Ejecutar ${action.name}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionModal;
