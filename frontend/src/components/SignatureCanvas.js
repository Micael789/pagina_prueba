/**
 * Componente de canvas para captura de firma electrónica
 * Permite dibujar y guardar firmas como base64
 */

import React, { useRef, useEffect, useState } from 'react';

function SignatureCanvas({ onSave, onCancel }) {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Configurar estilo de dibujo
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Limpiar canvas con fondo blanco
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /**
   * Obtiene coordenadas del evento (mouse o touch)
   */
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches.length > 0) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  /**
   * Inicia el dibujo
   */
  const startDrawing = (e) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Prevenir scroll en móviles
    e.preventDefault();
  };

  /**
   * Continúa el dibujo
   */
  const draw = (e) => {
    if (!isDrawing) return;
    
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    setIsEmpty(false);
    
    // Prevenir scroll en móviles
    e.preventDefault();
  };

  /**
   * Termina el dibujo
   */
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  /**
   * Limpia el canvas
   */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  /**
   * Guarda la firma como base64
   */
  const saveSignature = () => {
    if (isEmpty) {
      return;
    }
    
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-900 mb-1">
          Firma electrónica
        </div>
        <div className="text-xs text-gray-600">
          Dibuja tu firma en el área de abajo usando el dedo o mouse
        </div>
      </div>
      
      {/* Canvas para la firma */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 mb-3">
        <canvas
          ref={canvasRef}
          className="w-full h-32 touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      {/* Instrucciones para móvil */}
      <div className="text-xs text-gray-500 mb-3 text-center">
        📱 En móvil: usa tu dedo para firmar
      </div>
      
      {/* Botones */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearCanvas}
          className="btn btn-secondary text-sm px-3 py-1 flex-1"
          disabled={isEmpty}
        >
          🗑️ Limpiar
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary text-sm px-3 py-1 flex-1"
        >
          Cancelar
        </button>
        
        <button
          type="button"
          onClick={saveSignature}
          className="btn btn-primary text-sm px-3 py-1 flex-1"
          disabled={isEmpty}
        >
          ✅ Guardar
        </button>
      </div>
    </div>
  );
}

export default SignatureCanvas;
