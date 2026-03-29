import { create } from 'zustand'

// Zustand v5: la API es idéntica a v4 para create básico
const useSimulationStore = create((set) => ({
  // Inputs del usuario
  tipo_ropa: 50,
  nivel_suciedad: 50,
  masa_ropa: 5,

  setInputs: (tipo_ropa, nivel_suciedad, masa_ropa) =>
    set({ tipo_ropa, nivel_suciedad, masa_ropa }),

  // Resultado del POST /api/simulate
  // Estructura: { prelavado, lavado, enjuague, centrifugado, tiempo_total }
  simulationResult: null,
  setSimulationResult: (result) => set({ simulationResult: result }),

  // Control de ejecución
  isRunning: false,
  isPaused: false,
  setIsRunning: (v) => set({ isRunning: v }),
  setIsPaused: (v) => set({ isPaused: v }),

  reset: () => set({
    simulationResult: null,
    isRunning: false,
    isPaused: false,
  }),
}))

export default useSimulationStore
