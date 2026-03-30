import { useState, useEffect, useRef, useCallback } from "react";
import WashingMachineCanvas from "./WashingMachineCanvas"; // separa el canvas si quieres
import Slider from "./Slider"; // separa sliders si quieres
import CycleBar from "./CycleBar"; // separa ciclo visual

const CYCLES = ["prelavado", "lavado", "enjuague", "centrifugado"];
const CYCLE_LABELS = { prelavado: "Pre-wash", lavado: "Wash", enjuague: "Rinse", centrifugado: "Spin" };

export default function App() {
  const [tipoRopa, setTipoRopa] = useState(50);
  const [suciedad, setSuciedad] = useState(50);
  const [masa, setMasa] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [currentCycleIdx, setCurrentCycleIdx] = useState(-1);
  const [simResult, setSimResult] = useState(null);
  const [doneCycles, setDoneCycles] = useState([]);
  const [cycleTransitionTick, setCycleTransitionTick] = useState(0);
  const [doorTrigger, setDoorTrigger] = useState(0);

  const simIntervalRef = useRef(null);

  const ropaLabel = v => v < 33 ? "Delicate" : v < 66 ? "Normal" : "Heavy";
  const sucLabel = v => v < 33 ? "Low" : v < 66 ? "Medium" : "High";

  // --- START CYCLE RECURSIVO ---
  const startCycle = useCallback((idx) => {
    if (!simResult) return; // asegúrate de tener resultados
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    setCycleProgress(0);
    setCycleTransitionTick(t => t + 1);

    if (idx >= CYCLES.length) {
      setIsRunning(false);
      setCurrentCycleIdx(-1);
      setCycleProgress(100);
      return;
    }

    setCurrentCycleIdx(idx);
    const key = CYCLES[idx];
    const dur = simResult[key]?.duracion_animacion || 4000;
    let elapsed = 0;

    simIntervalRef.current = setInterval(() => {
      elapsed.current += 80;
      const prog = Math.min((elapsed / dur) * 100, 100);
      setCycleProgress(prog);

      if (prog >= 100) {
        clearInterval(simIntervalRef.current);
        setDoneCycles(d => [...d, key]);
        setTimeout(() => startCycle(idx + 1), 650);
      }
    }, 80);
  }, [simResult]);

  // --- HANDLER PARA INICIAR ---
  const handleStart = () => {
    const result = {};
    CYCLES.forEach(c => {
      result[c] = {
        duracion_animacion: 4000 + Math.random() * 2000,
        temperatura_agua: 20 + suciedad / 2 + Math.random() * 10,
        velocidad_agitacion: 300 + tipoRopa * 6 + Math.random() * 200,
        cantidad_detergente: 15 + masa * 2 + Math.random() * 5,
      };
    });

    setSimResult(result);
    setDoneCycles([]);
    setIsRunning(true);
    setIsPaused(false);
    setCurrentCycleIdx(-1);
    setCycleProgress(0);

    startCycle(0); // inicia el primer ciclo
    setDoorTrigger(prev => prev + 1);
  };

  const handlePause = () => {
    if (!isRunning) return;

    if (isPaused) {
      setIsPaused(false);
      startCycle(currentCycleIdx); // resume desde donde quedó
    } else {
      setIsPaused(true);
      clearInterval(simIntervalRef.current);
    }
  };

  // --- RESET ---
  const handleReset = () => {
    clearInterval(simIntervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCycleProgress(0);
    setCurrentCycleIdx(-1);
    setDoneCycles([]);
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif", maxWidth: 380, margin: "0 auto" }}>
      <h3>Fuzzy Washing Machine</h3>

      {/* Sliders */}
      <Slider label="Tipo Ropa" sublabel={ropaLabel} value={tipoRopa} min={0} max={100} onChange={setTipoRopa} color="#5C7AEA" />
      <Slider label="Suciedad" sublabel={sucLabel} value={suciedad} min={0} max={100} onChange={setSuciedad} color="#f0a030" />
      <Slider label="Masa (kg)" sublabel={v => `${v} kg`} value={masa} min={1} max={10} onChange={setMasa} color="#3DBBF0" />

      {/* Botones */}
      <div style={{ margin: "12px 0", display: "flex", gap: 8 }}>
        <button onClick={handleStart} disabled={isRunning} style={{ flex: 1 }}>Start</button>
        <button onClick={handlePause} disabled={!isRunning} style={{ flex: 1 }}>{isPaused ? "Resume" : "Pause"}</button>
        <button onClick={handleReset} style={{ flex: 1 }}>Reset</button>
      </div>

      {/* Canvas */}
      <WashingMachineCanvas
        isRunning={isRunning}
        isPaused={isPaused}
        cycleProgress={cycleProgress}
        currentCycleIdx={currentCycleIdx}
        simResult={simResult}
        cycleTransitionTick={cycleTransitionTick}
        doorTrigger={doorTrigger}
      />

      {/* Cycle Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
        {CYCLES.map((c, idx) => (
          <CycleBar
            key={c}
            cycle={c}
            data={simResult?.[c]}
            isActive={currentCycleIdx === idx}
            isDone={doneCycles.includes(c)}
          />
        ))}
      </div>
    </div>
  );
}