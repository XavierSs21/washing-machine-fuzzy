import { useState } from "react";
import { CYCLES, CYCLE_COLORS } from "./hooks/canvasUtils";
import { useSimulation } from "./hooks/useSimulation";
import WashingMachineCanvas from "./components/WashingMachineCanvas";
import Slider from "./components/Slider";
import CycleBar from "./components/CycleBar";
import ControlButtons from "./components/ControlButtons";
import TimerDisplay from "./components/TimerDisplay";
import StatusHeader from "./components/StatusHeader";
import CycleChart from "./components/Charts/CycleChart";
import MembershipChart from "./components/Charts/MembershipChart";
import OutputChart from "./components/Charts/OutputChart";
import LiveMetrics from "./components/Simulation/LiveMetrics";

export default function App() {
  const [tipoRopa, setTipoRopa] = useState(50);
  const [suciedad, setSuciedad] = useState(50);
  const [masa, setMasa] = useState(5);
  const [doorTrigger, setDoorTrigger] = useState(0);

  const sim = useSimulation();

  const allDone = !sim.isRunning && sim.doneCycles.length === CYCLES.length;
  const currentCycle = sim.currentCycleIdx >= 0 ? CYCLES[sim.currentCycleIdx] : null;
  const liveMetrics = currentCycle && sim.simResult ? sim.simResult[currentCycle] : null;

  const handleStart = () => sim.start(tipoRopa, suciedad, masa);
  const handleMasaChange = (val) => {
    setMasa(val);
    if (!sim.isRunning) setDoorTrigger((t) => t + 1);
  };

  return (
    <div style={{
      height: "100vh", background: "#111",
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      overflow: "hidden", paddingLeft: 50, paddingRight: 50,
    }}>
      <StatusHeader isRunning={sim.isRunning} isPaused={sim.isPaused} allDone={allDone} currentCycle={currentCycle} liveMetrics={liveMetrics} />

      <div style={{ display: "flex", flex: 1, padding: "20px 20px", gap: 16, overflow: "hidden" }}>

        {/* ── Left column : config + cycles ── */}
        <div style={{
          flex: "1 1 200px", display: "flex", flexDirection: "column",
          gap: 12, minWidth: 260, overflow: "auto",
        }}>
          {/* Sliders */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "16px 18px", flexShrink: 0,
          }}>
            <div style={{ fontSize: 10, color: "#666", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600 }}>
              Configuration
            </div>
            <Slider label="Fabric Type" sublabel={v => v < 33 ? "Delicate" : v < 66 ? "Normal" : "Heavy"}
              value={tipoRopa} min={0} max={100} onChange={setTipoRopa} color="#5C7AEA" />
            <Slider label="Soil Level" sublabel={v => v < 33 ? "Low" : v < 66 ? "Medium" : "High"}
              value={suciedad} min={0} max={100} onChange={setSuciedad} color="#f0a030" />
            <Slider label="Load Mass" sublabel={() => "kg"}
              value={masa} min={0} max={10} step={0.5} onChange={handleMasaChange} color="#8B5CF6" />
          </div>

          {/* Ciclos */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "16px 16px 16px 18px",
            flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minHeight: 0,
          }}>
            <div style={{ fontSize: 10, color: "#666", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600, flexShrink: 0 }}>
              Cycles
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflow: "auto" }}>
              {CYCLES.map((c) => (
                <CycleBar
                  key={c} cycle={c}
                  data={sim.simResult?.[c]}
                  isActive={currentCycle === c}
                  isDone={sim.doneCycles.includes(c)}
                  color={CYCLE_COLORS[c]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Center column ── */}
        <div style={{
          flex: "0 0 500px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12,
        }}>
          <WashingMachineCanvas
            isRunning={sim.isRunning}
            isPaused={sim.isPaused}
            cycleProgress={sim.cycleProgress}
            currentCycleIdx={sim.currentCycleIdx}
            simResult={sim.simResult}
            cycleTransitionTick={sim.cycleTransitionTick}
            doorTrigger={doorTrigger}
          />

          <ControlButtons
            isRunning={sim.isRunning}
            isPaused={sim.isPaused}
            onStart={handleStart}
            onPause={sim.togglePause}
            onReset={sim.reset}
          />

          {(sim.isRunning || allDone) && sim.simResult?.tiempo_total && (
            <TimerDisplay
              elapsedTime={sim.elapsedTime}
              totalTime={sim.simResult.tiempo_total}
            />
          )}
        </div>

        {/* ── Right column: charts ── */}
        <div style={{
          flex: "1 1 300px", display: "flex", flexDirection: "column",
          gap: 12, minWidth: 260, overflow: "auto",
        }}>
          {sim.isRunning && liveMetrics && (
            <LiveMetrics
              currentCycle={currentCycle}
              metrics={liveMetrics}
            />
          )}
          <CycleChart
            currentCycleIdx={sim.currentCycleIdx}
            simResult={sim.simResult}
            isRunning={sim.isRunning}
          />
          <MembershipChart />
          {sim.simResult && <OutputChart simulationData={sim.simResult} />}
        </div>
      </div>

      {/* ── Bottom: Done banner + Export button + Close ── */}
      {allDone && (
        <div style={{
          display: "flex", alignItems: "center",
          gap: 12, margin: "0 20px 16px", flexShrink: 0,
          height: 52,
        }}>
          {/* Banner */}
          <div style={{
            flex: 1, height: "100%",
            background: "rgba(61,192,144,0.08)",
            border: "1px solid rgba(61,192,144,0.25)",
            borderRadius: 12, padding: "0 20px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#3dc090", boxShadow: "0 0 12px rgba(61,192,144,0.6)",
              flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: 12, color: "#3dc090", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 600 }}>
                WASH CYCLE COMPLETE
              </div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 2 }}>
                All 4 cycles finished · {sim.simResult?.tiempo_total} min total
              </div>
            </div>
          </div>

          {/* Export button */}
          <a
            href="http://localhost:8000/api/export/fis"
            target="_blank"
            rel="noreferrer"
            style={{
              height: "100%", padding: "0 20px",
              background: "rgba(61,192,144,0.08)",
              border: "1px solid rgba(61,192,144,0.25)",
              borderRadius: 12, color: "#3dc090",
              fontSize: 11, fontFamily: "monospace",
              letterSpacing: "0.1em", textDecoration: "none",
              fontWeight: 600, whiteSpace: "nowrap",
              display: "flex", alignItems: "center",
            }}
          >
            ⬇ Export .fis
          </a>

          {/* Close button */}
          <button
            onClick={sim.reset}
            style={{
              height: "100%", aspectRatio: "1",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, color: "#555",
              fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
