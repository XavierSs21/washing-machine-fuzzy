import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PANEL = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: "14px 16px",
};

const LABEL_STYLE = {
  fontSize: 10, color: "#666", fontFamily: "monospace",
  letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600,
};

const LINE_COLORS = ["#5C7AEA", "#f0a030", "#3dc090", "#8B5CF6", "#3DBBF0", "#e05050"];
const DOT_STYLE   = { r: 0 };

export default function MembershipChart() {
  const [data, setData]            = useState({});
  const [selectedVar, setSelected] = useState("");
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/membership")
      .then(r => {
        if (!r.ok) throw new Error("404");
        return r.json();
      })
      .then(json => {
        if (json && typeof json === "object") {
          setData(json);
          setSelected(Object.keys(json)[0] ?? "");
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const variable  = data[selectedVar];
  const chartData = variable
    ? variable.universe.map((x, i) => {
        const obj = { x };
        Object.keys(variable.terms).forEach(t => { obj[t] = variable.terms[t][i]; });
        return obj;
      })
    : [];

  const terms = variable ? Object.keys(variable.terms) : [];

  return (
    <div style={PANEL}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={LABEL_STYLE}>Membership Functions</div>

        {!loading && !error && Object.keys(data).length > 0 && (
          <select
            value={selectedVar}
            onChange={e => setSelected(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, color: "#999",
              fontSize: 10, fontFamily: "monospace",
              padding: "3px 8px", cursor: "pointer",
              letterSpacing: "0.06em", outline: "none",
            }}
          >
            {Object.keys(data).map(k => (
              <option key={k} value={k} style={{ background: "#1a1a1a" }}>{k}</option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace", letterSpacing: "0.1em" }}>LOADING...</span>
        </div>
      )}

      {/* Muestra unavailable si Aaly aún no implementa el endpoint — no truena la app */}
      {error && (
        <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: "#3a2020", fontFamily: "monospace", letterSpacing: "0.1em" }}>API UNAVAILABLE</span>
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="x" tick={{ fill: "#444", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 1]} tick={{ fill: "#444", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
              labelStyle={{ color: "#666" }}
              itemStyle={{ color: "#ccc" }}
              formatter={v => v.toFixed(3)}
            />
            <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace", color: "#555", paddingTop: 4 }} />
            {terms.map((t, i) => (
              <Line key={t} type="monotone" dataKey={t} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={1.5} dot={DOT_STYLE} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
