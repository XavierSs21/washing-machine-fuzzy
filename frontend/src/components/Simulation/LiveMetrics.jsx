import { CYCLE_COLORS } from "../../hooks/canvasUtils";

const CYCLE_LABELS = {
  prelavado:    "Pre-wash",
  lavado:       "Wash",
  enjuague:     "Rinse",
  centrifugado: "Spin",
};

function MetricCard({ label, value, unit, color }) {
  const formatted = value !== undefined && value !== null
    ? Number(value).toFixed(1)
    : "—";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 10, padding: "10px 12px",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ fontSize: 8, color: "#555", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 20, color, fontFamily: "monospace", fontWeight: 700, lineHeight: 1 }}>
        {formatted}
      </div>
      <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace" }}>
        {unit}
      </div>
    </div>
  );
}

export default function LiveMetrics({ currentCycle, metrics }) {
  const m = metrics ?? {};
  const cycleColor = currentCycle ? (CYCLE_COLORS[currentCycle] ?? "#5C7AEA") : "#333";
  const cycleLabel = currentCycle ? CYCLE_LABELS[currentCycle] : null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: "14px 16px", width: "100%",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: cycleColor,
          boxShadow: currentCycle ? `0 0 8px ${cycleColor}99` : "none",
          transition: "all 0.3s",
        }} />
        <span style={{ fontSize: 10, color: "#666", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
          Live Metrics
        </span>
        {cycleLabel && (
          <span style={{ marginLeft: "auto", fontSize: 10, color: cycleColor, fontFamily: "monospace", letterSpacing: "0.08em", fontWeight: 700 }}>
            {cycleLabel.toUpperCase()}
          </span>
        )}
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <MetricCard label="Temperature" value={m.temperatura_agua}     unit="°C"  color="#f0a030" />
        <MetricCard label="Speed"       value={m.velocidad_agitacion}  unit="RPM" color="#8B5CF6" />
        <MetricCard label="Detergent"   value={m.cantidad_detergente}  unit="mL"  color="#3DBBF0" />
      </div>
    </div>
  );
}
