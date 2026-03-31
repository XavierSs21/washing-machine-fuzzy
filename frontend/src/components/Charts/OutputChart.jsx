import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PANEL = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: "14px 16px",
};

const CYCLES = ["prelavado", "lavado", "enjuague", "centrifugado"];
const CYCLE_LABELS = { prelavado: "Pre-wash", lavado: "Wash", enjuague: "Rinse", centrifugado: "Spin" };

export default function OutputChart({ simulationData }) {
  if (!simulationData) return null;

  const data = CYCLES
    .filter(c => simulationData[c])
    .map(c => ({
      name:        CYCLE_LABELS[c],
      "Time (min)":    simulationData[c].tiempo_ciclo,
      "Temp (°C)":     simulationData[c].temperatura_agua,
      "Det (mL)":      simulationData[c].cantidad_detergente,
    }));

  return (
    <div style={PANEL}>
      <div style={{
        fontSize: 10, color: "#666", fontFamily: "monospace",
        letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10,
      }}>
        Cycle Output Comparison
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#444", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
            labelStyle={{ color: "#aaa" }}
            itemStyle={{ color: "#ccc" }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace", color: "#555", paddingTop: 4 }} />
          <Bar dataKey="Time (min)" fill="#5C7AEA" radius={[3,3,0,0]} />
          <Bar dataKey="Temp (°C)"  fill="#f0a030" radius={[3,3,0,0]} />
          <Bar dataKey="Det (mL)"   fill="#3DBBF0" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
