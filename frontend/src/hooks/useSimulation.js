import { useState, useRef, useCallback, useEffect } from "react";
import { CYCLES } from "./canvasUtils";
import { runSimulation } from "../services/simulation";

export function useSimulation(speed = 1) {
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
  const speedRef = useRef(speed); // <--- ref para velocidad dinámica

  // Mantener speed actualizado en tiempo real
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

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
    const dur = (result[key].duracion_animacion ?? result[key].tiempo_ciclo ?? 5) * 1000;
    let elapsed = 0;
    const TICK_BASE_MS = 80; // base interval en ms

    simIntervalRef.current = setInterval(() => {
      if (pausedRef.current) return;

      // Avanzar elapsed según speed actual
      const currentSpeed = speedRef.current;
      elapsed += TICK_BASE_MS * currentSpeed;
      setElapsedTime((t) => t + (TICK_BASE_MS * currentSpeed) / 1000);
      setCycleProgress(Math.min((elapsed / dur) * 100, 100));

      if (elapsed >= dur) {
        clearInterval(simIntervalRef.current);
        setDoneCycles((d) => [...d, key]);
        setCycleTransitionTick((t) => t + 1);
        setTimeout(() => startCycle(idx + 1, result), 650);
      }
    }, TICK_BASE_MS);
  }, []);

  const start = useCallback(async (tipoRopa, suciedad, masa) => {
    try {
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