import { useCallback } from 'react'
import useSimulationStore from '../store/simulationSlice'
import useCycleStore from '../store/cycleSlice'
import { runSimulation } from '../services/simulation'

export const useSimulation = () => {
  const {
    tipo_ropa,
    nivel_suciedad,
    masa_ropa,
    setSimulationResult,
    setIsRunning,
    setIsPaused,
    reset: resetSimulation,
  } = useSimulationStore()

  const { reset: resetCycle } = useCycleStore()

  const start = useCallback(async () => {
    setIsRunning(true)
    setIsPaused(false)

    try {
      const result = await runSimulation(tipo_ropa, nivel_suciedad, masa_ropa)
      setSimulationResult(result)
      // El WebSocket toma el resultado y empieza a emitir el progreso
      return result
    } catch (e) {
      console.error('Error en simulación:', e)
      setIsRunning(false)
    }
  }, [tipo_ropa, nivel_suciedad, masa_ropa])

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  const reset = useCallback(() => {
    resetSimulation()
    resetCycle()
  }, [])

  return { start, pause, resume, reset }
}
