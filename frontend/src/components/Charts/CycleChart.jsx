import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CYCLES } from "../../hooks/canvasUtils";

const PANEL = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: "14px 16px",
};

const LABEL = {
  fontSize: 10, color: "#666", fontFamily: "monospace",
  letterSpacing: "0.12em", textTransform: "uppercase",
  fontWeight: 600, marginBottom: 10,
};

const DOT_STYLE = { r: 0 };

// Recibe props de App.jsx — no necesita WebSocket propio
export default function CycleChart({ currentCycleIdx, simResult, isRunning }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!isRunning || currentCycleIdx < 0 || !simResult) return;
    const key = CYCLES[currentCycleIdx];
    const cycle = simResult[key];
    if (!cycle) return;
    setData(prev => [...prev.slice(-60), {
      time:        prev.length,
      temperature: cycle.temperatura_agua,
      speed:       cycle.velocidad_agitacion,
    }]);
  }, [currentCycleIdx, isRunning]);

  useEffect(() => {
    if (!isRunning && !simResult) setData([]);
  }, [isRunning, simResult]);

  const isEmpty = data.length === 0;

  return (
    <div style={PANEL}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={LABEL}>Live Cycle Data</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: isRunning ? "#3dc090" : "#333",
            boxShadow: isRunning ? "0 0 6px rgba(61,192,144,0.7)" : "none",
          }} />
          <span style={{ fontSize: 9, color: isRunning ? "#3dc090" : "#444", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            {isRunning ? "RUNNING" : "IDLE"}
          </span>
        </div>
      </div>

      {isEmpty ? (
        <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {isRunning ? "WAITING FOR DATA..." : "START TO SEE DATA"}
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" hide />
            <YAxis tick={{ fill: "#444", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
              labelStyle={{ color: "#666" }}
              itemStyle={{ color: "#ccc" }}
            />
            <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace", color: "#555", paddingTop: 4 }} />
            <Line type="monotone" dataKey="temperature" stroke="#f0a030" strokeWidth={1.5} dot={DOT_STYLE} name="Temp °C" />
            <Line type="monotone" dataKey="speed"       stroke="#8B5CF6" strokeWidth={1.5} dot={DOT_STYLE} name="RPM" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
