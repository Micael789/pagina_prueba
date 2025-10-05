/**
 * Componente de escáner de códigos QR
 * Usa la cámara del dispositivo para escanear QR
 */

import React, { useEffect, useRef, useState } from 'react';

function QRScanner({ onResult, onClose }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' para frontal, 'environment' para trasera

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  /**
   * Inicia la cámara
   */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      setError('No se puede acceder a la cámara. Verifica los permisos.');
    }
  };

  /**
   * Detiene la cámara
   */
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  /**
   * Alterna entre cámara frontal y trasera
   */
  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  /**
   * Inicia el proceso de escaneo
   */
  const startScanning = () => {
    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Ajustar tamaño del canvas al video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Capturar frame actual
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simular detección de QR (en producción usar una librería como jsQR)
        // Por ahora solo detectamos patrones básicos
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrResult = detectQRPattern(imageData);

        if (qrResult) {
          clearInterval(scanInterval);
          onResult(qrResult);
        }
      }
    }, 500); // Escanear cada 500ms

    // Limpiar interval después de 30 segundos
    setTimeout(() => {
      clearInterval(scanInterval);
    }, 30000);
  };

  /**
   * Función simulada de detección de QR
   * En producción, usar una librería como jsQR o ZXing
   */
  const detectQRPattern = (imageData) => {
    // Esta es una implementación simulada
    // En la aplicación real, integrar con jsQR o similar
    
    // Por ahora, retornar null (no detectado)
    return null;
  };

  /**
   * Manejo manual de entrada de QR para testing
   */
  const handleManualInput = () => {
    const qrText = prompt('Ingresa el contenido del QR (para pruebas):');
    if (qrText) {
      onResult(qrText);
    }
  };

  /**
   * Simular QR válido para testing
   */
  const simulateValidQR = (unitId) => {
    const mockQR = `https://scan.miapp.com/scan?unit_id=${unitId}&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`;
    onResult(mockQR);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <button onClick={onClose} className="text-white text-lg">
          ← Cancelar
        </button>
        <h3 className="text-lg font-medium">Escanear QR</h3>
        <button onClick={switchCamera} className="text-white text-lg">
          🔄
        </button>
      </div>

      {/* Área de escaneo */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white p-4">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="btn btn-primary"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Video de la cámara */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Canvas oculto para procesamiento */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* Overlay de escaneo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Marco de escaneo */}
                <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                  {/* Esquinas del marco */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400"></div>
                  
                  {/* Línea de escaneo animada */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 animate-pulse"></div>
                </div>

                {/* Instrucciones */}
                <div className="mt-4 text-center text-white">
                  <p className="text-sm">
                    Apunta la cámara hacia el código QR
                  </p>
                  {isScanning && (
                    <p className="text-xs text-blue-300 mt-1">
                      Escaneando...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer con opciones */}
      <div className="p-4 bg-black">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handleManualInput}
            className="btn btn-secondary text-sm py-2"
          >
            ⌨️ Entrada Manual
          </button>
          <button
            onClick={() => setError('')}
            className="btn btn-secondary text-sm py-2"
          >
            💡 Consejos
          </button>
        </div>

        {/* QRs de prueba */}
        <div className="text-center">
          <p className="text-white text-xs mb-2">QRs de prueba:</p>
          <div className="grid grid-cols-3 gap-2">
            {['UN001', 'UN002', 'UN003'].map(unitId => (
              <button
                key={unitId}
                onClick={() => simulateValidQR(unitId)}
                className="btn btn-primary text-xs py-1"
              >
                {unitId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de consejos */}
      {error === '' && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h4 className="font-bold mb-3">Consejos para escanear</h4>
            <ul className="text-sm space-y-2 mb-4">
              <li>• Mantén el QR dentro del marco</li>
              <li>• Asegúrate de tener buena iluminación</li>
              <li>• Mantén la cámara estable</li>
              <li>• No acerques demasiado la cámara</li>
            </ul>
            <button
              onClick={() => setError('fake')}
              className="btn btn-primary btn-full"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
