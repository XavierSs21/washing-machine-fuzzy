import { useState, useEffect, useRef, useCallback } from "react";

const CYCLES = ["prelavado", "lavado", "enjuague", "centrifugado"];
const CYCLE_LABELS = { prelavado: "Pre-wash", lavado: "Wash", enjuague: "Rinse", centrifugado: "Spin" };
// const CYCLE_COLORS = { prelavado: "#5C7AEA", lavado: "#3DBBF0", enjuague: "#3DBBF0", centrifugado: "#8B5CF6" };
const CYCLE_COLORS = { 
  prelavado: "#708ad4",    // Azul acero suave
  lavado: "#64b5f6",       // Celeste aire
  enjuague: "#4fc3f7",     // Cian suave
  centrifugado: "#9575cd"  // Violeta pastel
};

const UI_COLORS = {
  bg: "#121212",           // Fondo neutro profundo
  surface: "#1e1e1e",      // Tarjetas
  surfaceLight: "#2a2a2a", // Inputs
  border: "#333333",       // Bordes sutiles
  textPrimary: "#e0e0e0", 
  textSecondary: "#9e9e9e",
  accent: "#708ad4",       // Color principal de acción
  success: "#81c784",      // Verde suave para "Done"
  warning: "#ffd54f"       // Amarillo suave para "Heat"
};

function WashingMachineSVG({ isRunning, progress, currentCycle, metrics }) {
  const drumRotation = useRef(0);
  const animRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const rpm = metrics?.velocidad_agitacion || 0;
  const temp = metrics?.temperatura_agua || 0;
  const waterLevel = currentCycle === "lavado" ? 0.55 : currentCycle === "enjuague" ? 0.6 : currentCycle === "prelavado" ? 0.45 : 0.1;

  useEffect(() => {
    if (!isRunning) return;
    const speed = (rpm / 1200) * 6 + 0.5;
    const animate = () => {
      drumRotation.current += speed;
      setAngle(drumRotation.current % 360);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, rpm]);

  const cx = 200, cy = 275, r = 90;
  const waterY = cy + r - (waterLevel * r * 2);
  const waterPath = `M ${cx - r} ${waterY} Q ${cx} ${waterY - 12} ${cx + r} ${waterY} L ${cx + r} ${cy + r} Q ${cx} ${cy + r + 4} ${cx - r} ${cy + r} Z`;

  const clothesPieces = [0, 60, 120, 180, 240, 300].map((baseAngle, i) => {
    const a = ((baseAngle + angle) * Math.PI) / 180;
    const dist = r * 0.52;
    const px = cx + dist * Math.cos(a);
    const py = cy + dist * Math.sin(a);
    return { px, py, key: i };
  });

  const holeAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg viewBox="0 0 400 460" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 360 }}>
      <defs>
        <radialGradient id="bodyGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#1e1e1e" />
        </radialGradient>
        <radialGradient id="drumGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#111" />
        </radialGradient>
        <radialGradient id="glassGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(180,210,255,0.18)" />
          <stop offset="60%" stopColor="rgba(80,120,200,0.06)" />
          <stop offset="100%" stopColor="rgba(20,40,100,0.22)" />
        </radialGradient>
        <clipPath id="drumClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <filter id="soft">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="doorRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="50%" stopColor="#888" />
          <stop offset="100%" stopColor="#333" />
        </linearGradient>
      </defs>

      {/* Body */}
      <rect x="30" y="60" width="340" height="370" rx="22" fill="url(#bodyGrad)" />
      <rect x="30" y="60" width="340" height="370" rx="22" fill="none" stroke="#555" strokeWidth="1" />
      {/* Highlight on top-left edge */}
      <rect x="31" y="61" width="180" height="2" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="31" y="61" width="2" height="200" rx="2" fill="rgba(255,255,255,0.06)" />

      {/* Top panel */}
      <rect x="30" y="60" width="340" height="80" rx="22" fill="url(#panelGrad)" />
      <rect x="30" y="100" width="340" height="40" fill="url(#panelGrad)" />
      {/* Panel divider line */}
      <line x1="30" y1="140" x2="370" y2="140" stroke="#444" strokeWidth="0.5" />

      {/* Display screen */}
      <rect x="50" y="75" width="160" height="50" rx="8" fill="#111" stroke="#3a3a3a" strokeWidth="1" />
      <rect x="52" y="77" width="156" height="46" rx="7" fill="#0a0f1a" />
      {/* Display content */}
      {currentCycle ? (
        <>
          <text x="130" y="98" textAnchor="middle" fontSize="10" fill="#5C7AEA" fontFamily="monospace" letterSpacing="2">
            {CYCLE_LABELS[currentCycle]?.toUpperCase()}
          </text>
          <text x="130" y="115" textAnchor="middle" fontSize="18" fill="#e0e8ff" fontFamily="monospace" fontWeight="600">
            {Math.round(progress)}%
          </text>
        </>
      ) : (
        <>
          <text x="130" y="98" textAnchor="middle" fontSize="9" fill="#3a4a5a" fontFamily="monospace" letterSpacing="3">FUZZY CTRL</text>
          <text x="130" y="115" textAnchor="middle" fontSize="11" fill="#2a3a4a" fontFamily="monospace">STANDBY</text>
        </>
      )}

      {/* Indicators - top right panel */}
      <circle cx="270" cy="88" r="5" fill={isRunning ? "#3DBBF0" : "#1a2a3a"} />
      <circle cx="270" cy="88" r="5" fill="none" stroke="#444" strokeWidth="0.5" />
      <text x="280" y="92" fontSize="8" fill="#555" fontFamily="monospace">PWR</text>

      <circle cx="320" cy="88" r="5" fill={isRunning && currentCycle === "lavado" ? "#f0a030" : "#1a1a1a"} />
      <circle cx="320" cy="88" r="5" fill="none" stroke="#444" strokeWidth="0.5" />
      <text x="330" y="92" fontSize="8" fill="#555" fontFamily="monospace">HEAT</text>

      {/* Temp indicator */}
      <text x="270" y="118" fontSize="8" fill="#445" fontFamily="monospace">TEMP</text>
      <text x="310" y="118" fontSize="10" fill={temp > 50 ? "#f0a030" : "#5C7AEA"} fontFamily="monospace" fontWeight="600">
        {Math.round(temp)}°C
      </text>

      {/* Door ring - outer chrome */}
      <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="url(#doorRingGrad)" strokeWidth="8" />
      {/* Door ring inner shadow */}
      <circle cx={cx} cy={cy} r={r + 9} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#222" strokeWidth="3" />

      {/* Drum background */}
      <circle cx={cx} cy={cy} r={r} fill="url(#drumGrad)" />

      {/* Water effect */}
      {waterLevel > 0.15 && (
        <g clipPath="url(#drumClip)">
          <path d={waterPath} fill={currentCycle === "centrifugado" ? "rgba(80,100,160,0.15)" : "rgba(60,140,220,0.22)"} />
          {/* water shimmer */}
          <path d={`M ${cx - r} ${waterY - 2} Q ${cx - 20} ${waterY + 6} ${cx} ${waterY - 2} Q ${cx + 20} ${waterY - 8} ${cx + r} ${waterY - 2}`}
            fill="none" stroke="rgba(120,180,255,0.3)" strokeWidth="1" />
        </g>
      )}

      {/* Drum holes */}
      {holeAngles.map((ha, i) => {
        const a = ((ha + angle * 0.3) * Math.PI) / 180;
        const hx = cx + 65 * Math.cos(a);
        const hy = cy + 65 * Math.sin(a);
        return <circle key={i} cx={hx} cy={hy} r="4" fill="#0d0d0d" stroke="#333" strokeWidth="0.5" />;
      })}

      {/* Clothes pieces */}
      {isRunning && clothesPieces.map(({ px, py, key }) => (
        <ellipse key={key} cx={px} cy={py} rx="10" ry="5"
          transform={`rotate(${angle + key * 60}, ${px}, ${py})`}
          fill={["#5C7AEA", "#3DBBF0", "#8B5CF6", "#f0a030", "#e05050", "#3dc090"][key]}
          opacity="0.7" />
      ))}

      {/* Center drum circle */}
      <circle cx={cx} cy={cy} r="12" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="6" fill="#0d0d0d" stroke="#333" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r="2" fill="#555" />

      {/* Glass reflection overlay */}
      <circle cx={cx} cy={cy} r={r} fill="url(#glassGrad)" />
      {/* Glass reflection arc */}
      <path d={`M ${cx - 55} ${cy - 70} Q ${cx - 10} ${cy - 90} ${cx + 50} ${cy - 65}`}
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" strokeLinecap="round" />

      {/* Door handle */}
      <rect x="302" y="260" width="14" height="40" rx="7" fill="#444" stroke="#555" strokeWidth="0.5" />
      <rect x="309" y="264" width="4" height="30" rx="2" fill="rgba(255,255,255,0.1)" />

      {/* Bottom feet */}
      <rect x="60" y="425" width="40" height="10" rx="5" fill="#222" stroke="#333" strokeWidth="0.5" />
      <rect x="300" y="425" width="40" height="10" rx="5" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Progress bar on door ring */}
      {isRunning && (
        <circle cx={cx} cy={cy} r={r + 11}
          fill="none"
          stroke="#5C7AEA"
          strokeWidth="3"
          strokeDasharray={`${(2 * Math.PI * (r + 11) * progress) / 100} ${2 * Math.PI * (r + 11)}`}
          strokeDashoffset={2 * Math.PI * (r + 11) * 0.25}
          strokeLinecap="round"
          opacity="0.8"
        />
      )}
    </svg>
  );
}

function Slider({ label, sublabel, value, min, max, step = 1, unit = "", onChange, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 13, color, fontFamily: "monospace", fontWeight: 600 }}>
          {value}{unit} <span style={{ fontSize: 10, color: "#555" }}>{sublabel(value)}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 6, background: UI_COLORS.surfaceLight, borderRadius: 4, boxShadow: `inset 0 0 3px ${UI_COLORS.border}`, cursor: "pointer" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.1s" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: -6, left: 0, width: "100%", opacity: 0, cursor: "pointer", height: 16 }} />
      </div>
    </div>
  );
}

function CycleBar({ cycle, data, isActive, isDone }) {
  const fields = [
    { key: "tiempo_ciclo", label: "Time", unit: " min", color: "#5C7AEA" },
    { key: "temperatura_agua", label: "Temp", unit: "°C", color: "#f0a030" },
    { key: "velocidad_agitacion", label: "RPM", unit: "", color: "#8B5CF6" },
    { key: "cantidad_detergente", label: "Det", unit: " mL", color: "#3DBBF0" },
  ];
  return (
    <div style={{
      background: isActive ? "rgba(92,122,234,0.08)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isActive ? "rgba(92,122,234,0.35)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 12, padding: "12px 14px", transition: "all 0.3s",
      opacity: !data ? 0.35 : 1
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: isDone ? "#3dc090" : isActive ? "#5C7AEA" : "#333",
          boxShadow: isActive ? "0 0 8px rgba(92,122,234,0.6)" : "none",
          transition: "all 0.3s"
        }} />
        <span style={{ fontSize: 11, fontFamily: "monospace", color: isActive ? "#a0b4ff" : isDone ? "#3dc090" : "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {CYCLE_LABELS[cycle]}
        </span>
        {isDone && <span style={{ fontSize: 9, color: "#3dc090", marginLeft: "auto", letterSpacing: "0.08em" }}>DONE</span>}
      </div>
      {data ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          {fields.map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace", letterSpacing: "0.06em" }}>{f.label}</div>
              <div style={{ fontSize: 13, color: f.color, fontFamily: "monospace", fontWeight: 600 }}>
                {data[f.key] !== undefined ? (f.key === "velocidad_agitacion" ? Math.round(data[f.key]) : data[f.key].toFixed(1)) : "—"}{f.unit}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace", letterSpacing: "0.08em" }}>WAITING</div>
      )}
    </div>
  );
}

export default function App() {
  const [tipoRopa, setTipoRopa] = useState(50);
  const [suciedad, setSuciedad] = useState(50);
  const [masa, setMasa] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCycleIdx, setCurrentCycleIdx] = useState(-1);
  const [simResult, setSimResult] = useState(null);
  const [doneCycles, setDoneCycles] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const simRef = useRef(null);
  const pausedRef = useRef(false);

  const ropaLabel = v => v < 33 ? "Delicate" : v < 66 ? "Normal" : "Heavy";
  const sucLabel = v => v < 33 ? "Low" : v < 66 ? "Medium" : "High";

  const mockSimulate = useCallback((tr, ns, mr) => {
    const heaviness = (tr * 0.4 + ns * 0.6) / 100;
    return {
      prelavado: {
        tiempo_ciclo: +(8 + heaviness * 10).toFixed(1),
        temperatura_agua: +(20 + heaviness * 20).toFixed(1),
        cantidad_detergente: +(5 + heaviness * 15).toFixed(1),
        velocidad_agitacion: Math.round(100 + heaviness * 200),
        duracion_animacion: 3
      },
      lavado: {
        tiempo_ciclo: +(20 + heaviness * 20).toFixed(1),
        temperatura_agua: +(25 + heaviness * 55).toFixed(1),
        cantidad_detergente: +(15 + heaviness * 30).toFixed(1),
        velocidad_agitacion: Math.round(200 + heaviness * 400),
        duracion_animacion: 5
      },
      enjuague: {
        tiempo_ciclo: +(10 + heaviness * 8).toFixed(1),
        temperatura_agua: +(20 + heaviness * 10).toFixed(1),
        cantidad_detergente: +(2 + heaviness * 5).toFixed(1),
        velocidad_agitacion: Math.round(150 + heaviness * 250),
        duracion_animacion: 4
      },
      centrifugado: {
        tiempo_ciclo: +(8 + heaviness * 12).toFixed(1),
        temperatura_agua: 20,
        cantidad_detergente: 0,
        velocidad_agitacion: Math.round(400 + (mr / 10) * 800),
        duracion_animacion: 4
      },
      tiempo_total: +(46 + heaviness * 50 + mr * 1.5).toFixed(1)
    };
  }, []);

  const handleStart = useCallback(() => {
    const result = mockSimulate(tipoRopa, suciedad, masa);
    setSimResult(result);
    setIsRunning(true);
    setIsPaused(false);
    setProgress(0);
    setCurrentCycleIdx(0);
    setDoneCycles([]);
    setElapsedTime(0);
    pausedRef.current = false;
  }, [tipoRopa, suciedad, masa, mockSimulate]);

  const handlePause = () => {
    setIsPaused(p => {
      pausedRef.current = !p;
      return !p;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentCycleIdx(-1);
    setDoneCycles([]);
    setSimResult(null);
    setElapsedTime(0);
    pausedRef.current = false;
    if (simRef.current) clearInterval(simRef.current);
  };

  useEffect(() => {
    if (!isRunning || currentCycleIdx < 0) return;
    if (currentCycleIdx >= CYCLES.length) { setTimeout(() => { setIsRunning(false); setCurrentCycleIdx(-1); }, 0); return; }
    const cycleKey = CYCLES[currentCycleIdx];
    const duration = simResult?.[cycleKey]?.duracion_animacion * 1000 || 4000;
    let elapsed = 0;
    const interval = 80;
    simRef.current = setInterval(() => {
      if (pausedRef.current) return;
      elapsed += interval;
      setElapsedTime(t => t + interval / 1000);
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);
      if (elapsed >= duration) {
        clearInterval(simRef.current);
        setDoneCycles(d => [...d, cycleKey]);
        const next = currentCycleIdx + 1;
        if (next >= CYCLES.length) {
          setIsRunning(false);
          setCurrentCycleIdx(-1);
          setProgress(100);
        } else {
          setCurrentCycleIdx(next);
          setProgress(0);
        }
      }
    }, interval);
    return () => clearInterval(simRef.current);
  }, [isRunning, currentCycleIdx, simResult]);

  const currentCycle = currentCycleIdx >= 0 ? CYCLES[currentCycleIdx] : null;
  const currentMetrics = currentCycle && simResult ? simResult[currentCycle] : null;
  const totalTime = simResult?.tiempo_total;
  const allDone = !isRunning && doneCycles.length === 4;

  return (
    <div style={{ minHeight: "100vh", background: "#111", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "18px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.16em", fontFamily: "monospace", textTransform: "uppercase" }}>Fuzzy Logic Controller</div>
          <div style={{ fontSize: 17, color: "#ccc", fontWeight: 500, marginTop: 2, letterSpacing: "-0.01em" }}>Washing Machine</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: isRunning ? "#3dc090" : "#2a2a2a", boxShadow: isRunning ? "0 0 10px rgba(61,192,144,0.7)" : "none", transition: "all 0.3s" }} />
          <span style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {allDone ? "COMPLETE" : isRunning ? (isPaused ? "PAUSED" : "RUNNING") : "IDLE"}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", flex: 1, padding: "8px 14px 16px", gap: 14, flexWrap: "wrap" }}>

        {/* Left: Machine + controls */}
        <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <WashingMachineSVG isRunning={isRunning && !isPaused} progress={progress} currentCycle={currentCycle} metrics={currentMetrics} />

          {/* Control buttons */}
          <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 300 }}>
            {!isRunning ? (
              <button onClick={handleStart}
                style={{ flex: 1, padding: "10px 0", background: "rgba(92,122,234,0.15)", border: "1px solid rgba(92,122,234,0.4)", borderRadius: 10, color: "#8aa0ff", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={e => e.target.style.background = "rgba(92,122,234,0.25)"}
                onMouseOut={e => e.target.style.background = "rgba(92,122,234,0.15)"}>
                ▶ Start
              </button>
            ) : (
              <button onClick={handlePause}
                style={{ flex: 1, padding: "10px 0", background: isPaused ? "rgba(240,160,48,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isPaused ? "rgba(240,160,48,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: isPaused ? "#f0c070" : "#888", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em", cursor: "pointer" }}>
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
            )}
            <button onClick={handleReset}
              style={{ padding: "10px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#555", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em", cursor: "pointer" }}>
              ↺
            </button>
          </div>

          {/* Time info */}
          {(isRunning || allDone) && totalTime && (
            <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 300 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace", letterSpacing: "0.08em" }}>ELAPSED</div>
                <div style={{ fontSize: 15, color: "#5C7AEA", fontFamily: "monospace", fontWeight: 600, marginTop: 3 }}>
                  {Math.floor(elapsedTime / 60).toString().padStart(2, "0")}:{Math.floor(elapsedTime % 60).toString().padStart(2, "0")}
                </div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace", letterSpacing: "0.08em" }}>TOTAL EST.</div>
                <div style={{ fontSize: 15, color: "#888", fontFamily: "monospace", fontWeight: 600, marginTop: 3 }}>{totalTime} min</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sliders + cycle results */}
        <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Input config panel */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Configuration</div>
            <Slider label="Fabric Type" sublabel={ropaLabel} value={tipoRopa} min={0} max={100} onChange={setTipoRopa} color="#5C7AEA" unit="" />
            <Slider label="Soil Level" sublabel={sucLabel} value={suciedad} min={0} max={100} onChange={setSuciedad} color="#f0a030" unit="" />
            <Slider label="Load Mass" sublabel={_ => `kg`} value={masa} min={0} max={10} step={0.5} onChange={setMasa} color="#8B5CF6" unit=" kg" />
          </div>

          {/* Cycle results */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", flex: 1 }}>
            <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Cycles</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CYCLES.map((c) => (
                <CycleBar key={c} cycle={c} data={simResult?.[c]} isActive={currentCycle === c} isDone={doneCycles.includes(c)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Completed banner */}
      {allDone && (
        <div style={{ margin: "0 14px 16px", background: "rgba(61,192,144,0.08)", border: "1px solid rgba(61,192,144,0.25)", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3dc090", boxShadow: "0 0 12px rgba(61,192,144,0.6)" }} />
          <div>
            <div style={{ fontSize: 11, color: "#3dc090", fontFamily: "monospace", letterSpacing: "0.1em" }}>WASH CYCLE COMPLETE</div>
            <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", marginTop: 2 }}>All {CYCLES.length} cycles finished · {totalTime} min total</div>
          </div>
        </div>
      )}
    </div>
  );
}
