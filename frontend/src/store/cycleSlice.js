import { create } from 'zustand'

const useCycleStore = create((set) => ({
  // Ciclo activo: 'prelavado' | 'lavado' | 'enjuague' | 'centrifugado' | null
  currentCycle: null,
  // Progreso 0-100 que manda el WebSocket cada 500ms
  progress: 0,
  // { temperatura_agua, velocidad_agitacion, cantidad_detergente }
  metrics: {},

  setCycle: (cycle) => set({ currentCycle: cycle }),
  setProgress: (progress) => set({ progress }),
  setMetrics: (metrics) => set({ metrics }),

  reset: () => set({ currentCycle: null, progress: 0, metrics: {} }),
}))

export default useCycleStore
