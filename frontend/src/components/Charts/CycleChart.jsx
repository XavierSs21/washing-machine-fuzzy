import { useEffect, useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

export default function CycleChart() {
  const [data, setData]     = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    try {
      const ws = new WebSocket("ws://localhost:5000/ws");
      socketRef.current = ws;

      ws.onopen  = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);

      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          setData(prev => [...prev.slice(-60), d]); // keep last 60 points
        } catch {}
      };
    } catch {}

    return () => socketRef.current?.close();
  }, []);

  const isEmpty = data.length === 0;

  return (
    <div style={PANEL}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={LABEL}>Live Cycle Data</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: connected ? "#3dc090" : "#333",
            boxShadow: connected ? "0 0 6px rgba(61,192,144,0.7)" : "none",
          }} />
          <span style={{ fontSize: 9, color: connected ? "#3dc090" : "#444", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            {connected ? "WS LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {isEmpty ? (
        <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {connected ? "WAITING FOR DATA..." : "NO CONNECTION"}
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
