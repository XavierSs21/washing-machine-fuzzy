import { useEffect, useRef, useCallback } from 'react'
import useCycleStore from '../store/cycleSlice'
import useSimulationStore from '../store/simulationSlice'

// Cambia esto si el backend usa otra ruta para el WebSocket
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/ws/simulation'

export const useWebSocket = () => {
  const ws = useRef(null)
  const reconnectTimer = useRef(null)
  const shouldReconnect = useRef(true) // false cuando el usuario hace reset

  const { setCycle, setProgress, setMetrics} = useCycleStore()
  const { setIsRunning, setIsPaused, simulationResult } = useSimulationStore()

  const connect = useCallback(() => {
    // No abrir si ya está conectado
    if (ws.current?.readyState === WebSocket.OPEN) return

    ws.current = new WebSocket(WS_URL)

    ws.current.onopen = () => {
      console.log('✅ WebSocket conectado')
      clearTimeout(reconnectTimer.current)

      // Si hay un resultado de simulación pendiente, lo mandamos al WS
      // para que el backend empiece a emitir el progreso
      if (simulationResult) {
        ws.current.send(JSON.stringify(simulationResult))
      }
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Actualizar store con los datos del tick
        if (data.cycle !== undefined)   setCycle(data.cycle)
        if (data.progress !== undefined) setProgress(data.progress)
        if (data.metrics !== undefined)  setMetrics(data.metrics)

        // El backend manda status para indicar el estado
        if (data.status === 'completed') {
          setIsRunning(false)
          setProgress(100)
        }
        if (data.status === 'paused') {
          setIsPaused(true)
        }
        if (data.status === 'running') {
          setIsPaused(false)
        }
      } catch (e) {
        console.error('Error parseando mensaje WS:', e)
      }
    }

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    ws.current.onclose = () => {
      if (!shouldReconnect.current) return
      console.warn('⚠️ WebSocket cerrado. Reconectando en 3s...')
      reconnectTimer.current = setTimeout(connect, 3000)
    }
  }, [simulationResult])

  // Función para mandar mensajes al backend (pause, resume, etc.)
  const sendMessage = useCallback((msg) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg))
    } else {
      console.warn('WebSocket no está abierto, no se pudo enviar:', msg)
    }
  }, [])

  const disconnect = useCallback(() => {
    shouldReconnect.current = false
    clearTimeout(reconnectTimer.current)
    ws.current?.close()
  }, [])

  useEffect(() => {
    shouldReconnect.current = true
    connect()

    return () => {
      shouldReconnect.current = false
      clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])

  return { sendMessage, disconnect }
}
