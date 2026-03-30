import React from "react";

const CYCLE_LABELS = { prelavado: "Pre-wash", lavado: "Wash", enjuague: "Rinse", centrifugado: "Spin" };

export default function CycleBar({ cycle, data, isActive, isDone }) {
  const fields = [
    { key: "tiempo_ciclo", label: "Time", unit: " min", color: "#5C7AEA" },
    { key: "temperatura_agua", label: "Temp", unit: "°C", color: "#f0a030" },
    { key: "velocidad_agitacion", label: "RPM", unit: "", color: "#8B5CF6" },
    { key: "cantidad_detergente", label: "Det", unit: " mL", color: "#3DBBF0" },
  ];

  return (
    <div style={{
      background: isActive ? "rgba(92,122,234,0.12)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isActive ? "rgba(92,122,234,0.4)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 12, padding: "12px 14px", transition: "all 0.3s",
      opacity: !data ? 0.4 : 1, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: isDone ? "#3dc090" : isActive ? "#5C7AEA" : "#333", boxShadow: isActive ? "0 0 8px rgba(92,122,234,0.6)" : "none", transition: "all 0.3s" }} />
        <span style={{ fontSize: 11, fontFamily: "monospace", color: isActive ? "#b0c4ff" : isDone ? "#3dc090" : "#666", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
          {CYCLE_LABELS[cycle]}
        </span>
        {isDone && <span style={{ fontSize: 9, color: "#3dc090", marginLeft: "auto", fontWeight: 600 }}>✓</span>}
      </div>
      {data ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px" }}>
          {fields.map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 8, color: "#666", fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>{f.label}</div>
              <div style={{ fontSize: 12, color: f.color, fontFamily: "monospace", fontWeight: 700, marginTop: 1 }}>
                {data[f.key] !== undefined ? (f.key === "velocidad_agitacion" ? Math.round(data[f.key]) : data[f.key].toFixed(1)) : "—"}{f.unit}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace", letterSpacing: "0.08em" }}>WAITING</div>
      )}
    </div>
  );
}