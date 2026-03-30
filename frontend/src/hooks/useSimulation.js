import { useState, useRef, useCallback } from "react";
import { CYCLES } from "./canvasUtils";

export function useSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [currentCycleIdx, setCurrentCycleIdx] = useState(-1);
  const [simResult, setSimResult] = useState(null);
  const [doneCycles, setDoneCycles] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cycleTransitionTick, setCycleTransitionTick] = useState(0);

  const simIntervalRef = useRef(null);
  const pausedRef = useRef(false);

  const mockSimulate = useCallback((tr, ns, mr) => {
    const h = (tr * 0.4 + ns * 0.6) / 100;
    return {
      prelavado: {
        tiempo_ciclo: +(8 + h * 10).toFixed(1),
        temperatura_agua: +(20 + h * 20).toFixed(1),
        cantidad_detergente: +(5 + h * 15).toFixed(1),
        velocidad_agitacion: Math.round(100 + h * 200),
        dur: 3000,
      },
      lavado: {
        tiempo_ciclo: +(20 + h * 20).toFixed(1),
        temperatura_agua: +(25 + h * 55).toFixed(1),
        cantidad_detergente: +(15 + h * 30).toFixed(1),
        velocidad_agitacion: Math.round(200 + h * 400),
        dur: 5000,
      },
      enjuague: {
        tiempo_ciclo: +(10 + h * 8).toFixed(1),
        temperatura_agua: +(20 + h * 10).toFixed(1),
        cantidad_detergente: +(2 + h * 5).toFixed(1),
        velocidad_agitacion: Math.round(150 + h * 250),
        dur: 4500,
      },
      centrifugado: {
        tiempo_ciclo: +(8 + h * 12).toFixed(1),
        temperatura_agua: 20,
        cantidad_detergente: 0,
        velocidad_agitacion: Math.round(400 + (mr / 10) * 800),
        dur: 4000,
      },
      tiempo_total: +(46 + h * 50 + mr * 1.5).toFixed(1),
    };
  }, []);

  const startCycle = useCallback((idx, result) => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setCycleProgress(0);
    setCycleTransitionTick((t) => t + 1);

    if (idx >= CYCLES.length) {
      setIsRunning(false);
      setCurrentCycleIdx(-1);
      setCycleProgress(100);
      return;
    }

    setCurrentCycleIdx(idx);
    const key = CYCLES[idx];
    const dur = result[key].dur;
    let elapsed = 0;

    simIntervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      elapsed += 80;
      setElapsedTime((t) => t + 0.08);
      setCycleProgress(Math.min((elapsed / dur) * 100, 100));
      if (elapsed >= dur) {
        clearInterval(simIntervalRef.current);
        setDoneCycles((d) => [...d, key]);
        setCycleTransitionTick((t) => t + 1);
        setTimeout(() => startCycle(idx + 1, result), 650);
      }
    }, 80);
  }, []);

  const start = useCallback(
    (tipoRopa, suciedad, masa) => {
      const result = mockSimulate(tipoRopa, suciedad, masa);
      setSimResult(result);
      setIsRunning(true);
      setIsPaused(false);
      pausedRef.current = false;
      setCycleProgress(0);
      setCurrentCycleIdx(0);
      setDoneCycles([]);
      setElapsedTime(0);
      setTimeout(() => startCycle(0, result), 0);
    },
    [mockSimulate, startCycle]
  );

  const togglePause = useCallback(() => {
    setIsPaused((p) => {
      pausedRef.current = !p;
      return !p;
    });
  }, []);

  const reset = useCallback(() => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    pausedRef.current = false;
    setCycleProgress(0);
    setCurrentCycleIdx(-1);
    setDoneCycles([]);
    setSimResult(null);
    setElapsedTime(0);
  }, []);

  return {
    // state
    isRunning,
    isPaused,
    cycleProgress,
    currentCycleIdx,
    simResult,
    doneCycles,
    elapsedTime,
    cycleTransitionTick,
    // actions
    start,
    togglePause,
    reset,
  };
}

/*import { useCallback } from 'react'
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
  }, [tipo_ropa, nivel_suciedad, masa_ropa, setSimulationResult, setIsRunning, setIsPaused])

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [setIsPaused])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [setIsPaused])

  const reset = useCallback(() => {
    resetSimulation()
    resetCycle()
  }, [resetSimulation, resetCycle])

  return { start, pause, resume, reset }
}
*/