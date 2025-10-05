import { useState } from 'react'
import Head from 'next/head'

export default function StatusManager() {
  const [location, setLocation] = useState('Almacén')
  const [status, setStatus] = useState('')
  const [showCleaningConfirmation, setShowCleaningConfirmation] = useState(false)
  const [cleaningConfirmed, setCleaningConfirmed] = useState(false)
  const [showSubmitButton, setShowSubmitButton] = useState(false)

  const handleStatusChange = (selectedStatus) => {
    setStatus(selectedStatus)
    
    if (selectedStatus === 'Limpieza') {
      setShowCleaningConfirmation(true)
      setShowSubmitButton(false)
    } else {
      setShowCleaningConfirmation(false)
      setCleaningConfirmed(false)
      setShowSubmitButton(true)
    }
  }

  const handleCleaningConfirmation = (confirmed) => {
    setCleaningConfirmed(confirmed)
    if (confirmed) {
      setShowSubmitButton(true)
    } else {
      setShowSubmitButton(false)
    }
  }

  const handleSubmit = () => {
    const data = {
      location,
      status,
      cleaningConfirmed: status === 'Limpieza' ? cleaningConfirmed : null,
      timestamp: new Date().toISOString()
    }
    
    // Aquí se enviará la data a la base de datos cuando esté conectada
    console.log('Datos a enviar:', data)
    
    // Mostrar mensaje de confirmación
    alert('Datos registrados correctamente')
    
    // Reset form
    setStatus('')
    setShowCleaningConfirmation(false)
    setCleaningConfirmed(false)
    setShowSubmitButton(false)
  }

  return (
    <>
      <Head>
        <title>Mobilet - Gestión de Estatus</title>
        <meta name="description" content="Sistema de gestión de estatus para unidades Mobilet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-2xl p-6 container-shadow mb-6">
              <h1 className="text-3xl font-bold text-mobilet-blue mb-2">MOBILET</h1>
              <p className="text-mobilet-gray text-sm">Sistema de Gestión de Estatus</p>
            </div>
            
            {/* Disclaimer Superior */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-left">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">Aviso:</span> Mantén actualizado el estatus de tu unidad para un mejor control del inventario.
              </p>
            </div>
          </div>

          {/* Formulario Principal */}
          <div className="bg-white rounded-2xl p-6 container-shadow card-gradient">
            
            {/* Sección Ubicación */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                📍 Ubicación
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="location"
                    value="Almacén"
                    checked={location === 'Almacén'}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-4 h-4 text-mobilet-blue focus:ring-mobilet-blue"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Almacén</span>
                  <span className="ml-auto text-green-600 text-sm">📦 Default</span>
                </label>
                
                <label className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="location"
                    value="Con Cliente"
                    checked={location === 'Con Cliente'}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-4 h-4 text-mobilet-blue focus:ring-mobilet-blue"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Con Cliente</span>
                  <span className="ml-auto text-blue-600 text-sm">👤</span>
                </label>
              </div>
            </div>

            {/* Sección Estatus Actual */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                ⚡ Estatus Actual
              </h2>
              <div className="space-y-3">
                
                {/* En uso - Separada */}
                <label className="flex items-center p-3 rounded-lg border-2 border-mobilet-green bg-green-50 hover:bg-green-100 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="En uso"
                    checked={status === 'En uso'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-4 h-4 text-mobilet-green focus:ring-mobilet-green"
                  />
                  <span className="ml-3 text-green-800 font-semibold">En uso</span>
                  <span className="ml-auto text-green-700 text-sm">✅</span>
                </label>

                {/* Otras opciones */}
                <label className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="Disponible"
                    checked={status === 'Disponible'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-4 h-4 text-mobilet-blue focus:ring-mobilet-blue"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Disponible</span>
                  <span className="ml-auto text-blue-600 text-sm">🔵</span>
                </label>

                <label className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="Limpieza"
                    checked={status === 'Limpieza'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-4 h-4 text-mobilet-yellow focus:ring-mobilet-yellow"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Limpieza</span>
                  <span className="ml-auto text-yellow-600 text-sm">🧽</span>
                </label>

                <label className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="Reparación"
                    checked={status === 'Reparación'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-4 h-4 text-mobilet-red focus:ring-mobilet-red"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Reparación</span>
                  <span className="ml-auto text-red-600 text-sm">🔧</span>
                </label>
              </div>
            </div>

            {/* Confirmación de Limpieza */}
            {showCleaningConfirmation && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-800 mb-3">
                  Confirmación Requerida
                </h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cleaningConfirmed}
                    onChange={(e) => handleCleaningConfirmation(e.target.checked)}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded"
                  />
                  <span className="ml-3 text-yellow-800 font-medium">
                    ✓ Confirmo Limpieza
                  </span>
                </label>
              </div>
            )}

            {/* Botón de Envío */}
            {showSubmitButton && (
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-mobilet-blue to-mobilet-light-blue text-white font-semibold py-4 px-6 rounded-xl button-shadow hover:from-mobilet-dark-blue hover:to-mobilet-blue transition-all duration-200 transform hover:scale-105"
              >
                📤 Guardar Cambios
              </button>
            )}
          </div>

          {/* Disclaimers Inferiores */}
          <div className="mt-6 space-y-3">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Información:</span> Los cambios se registrarán automáticamente en el sistema.
              </p>
            </div>
            
            <div className="bg-gray-50 border-l-4 border-gray-400 p-3">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Soporte:</span> En caso de problemas técnicos, contacta al administrador del sistema.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              © 2024 Mobilet - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
