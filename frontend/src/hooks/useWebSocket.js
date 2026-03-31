import { useEffect, useRef, useCallback } from 'react'
import useCycleStore from '../store/cycleSlice'
import useSimulationStore from '../store/simulationSlice'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/ws/simulation'

export const useWebSocket = () => {
  const ws = useRef(null)
  const shouldReconnect = useRef(false)

  const { setCycle, setProgress } = useCycleStore()
  const { setIsRunning, simulationResult, isRunning } = useSimulationStore()

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    ws.current = new WebSocket(WS_URL)

    ws.current.onopen = () => {
      console.log('✅ WebSocket conectado')

      // Mandamos el resultado de la simulación para que el backend empiece a emitir ticks
      if (simulationResult) {
        ws.current.send(JSON.stringify(simulationResult))
      }
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // FIX 1: campos en español, igual que manda el backend
        if (data.ciclo !== undefined)    setCycle(data.ciclo)
        if (data.progreso !== undefined) setProgress(data.progreso)

        // FIX 2: sin bloque de metrics (vienen del simulationResult en el store)
        // FIX 3: sin status — el backend manda "completado"
        if (data.completado === true) {
          setIsRunning(false)
          setProgress(100)
        }
      } catch (e) {
        console.error('Error parseando mensaje WS:', e)
      }
    }

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    ws.current.onclose = () => {
      console.log('WebSocket cerrado')
      // FIX 4: sin reconexión automática — cada simulación es una conexión nueva
    }
  }, [simulationResult, setCycle, setProgress, setIsRunning])

  // FIX 5: solo conectar cuando isRunning === true
  useEffect(() => {
    if (!isRunning) return
    shouldReconnect.current = true
    connect()
    return () => {
      shouldReconnect.current = false
      ws.current?.close()
    }
  }, [isRunning])

  const sendMessage = useCallback((msg) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg))
    } else {
      console.warn('WebSocket no está abierto, no se pudo enviar:', msg)
    }
  }, [])

  const disconnect = useCallback(() => {
    shouldReconnect.current = false
    ws.current?.close()
  }, [])

  return { sendMessage, disconnect }
}