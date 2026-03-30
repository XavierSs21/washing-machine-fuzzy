import { useState, useRef, useCallback } from "react";
import { CYCLES } from "./canvasUtils";
import { runSimulation } from "../services/simulation";

export function useSimulation() {
  const [isRunning, setIsRunning]             = useState(false);
  const [isPaused, setIsPaused]               = useState(false);
  const [cycleProgress, setCycleProgress]     = useState(0);
  const [currentCycleIdx, setCurrentCycleIdx] = useState(-1);
  const [simResult, setSimResult]             = useState(null);
  const [doneCycles, setDoneCycles]           = useState([]);
  const [elapsedTime, setElapsedTime]         = useState(0);
  const [cycleTransitionTick, setCycleTransitionTick] = useState(0);

  const simIntervalRef = useRef(null);
  const pausedRef      = useRef(false);

  // Avanza el progreso visual de cada ciclo usando duracion_animacion del backend
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

    // duracion_animacion viene del backend en segundos — lo convertimos a ms
    const dur = (result[key].duracion_animacion ?? result[key].tiempo_ciclo ?? 5) * 1000;
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

  const start = useCallback(async (tipoRopa, suciedad, masa) => {
    try {
      // Llama al backend real
      const result = await runSimulation(tipoRopa, suciedad, masa);

      setSimResult(result);
      setIsRunning(true);
      setIsPaused(false);
      pausedRef.current = false;
      setCycleProgress(0);
      setCurrentCycleIdx(0);
      setDoneCycles([]);
      setElapsedTime(0);

      setTimeout(() => startCycle(0, result), 0);
    } catch (e) {
      console.error("Error al llamar /api/simulate:", e);
      setIsRunning(false);
    }
  }, [startCycle]);

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
    isRunning,
    isPaused,
    cycleProgress,
    currentCycleIdx,
    simResult,
    doneCycles,
    elapsedTime,
    cycleTransitionTick,
    start,
    togglePause,
    reset,
  };
}