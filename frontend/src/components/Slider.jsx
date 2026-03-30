import { useState } from "react";

const UI_COLORS = { surfaceLight: "#2a2a2a" };

export default function Slider({ label, sublabel, value, min, max, step = 1, unit = "", onChange, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#777", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600 }}>
          {label}
        </span>
        <span style={{ fontSize: 14, color, fontFamily: "monospace", fontWeight: 700 }}>
          {value}{unit} <span style={{ fontSize: 10, color: "#666" }}>{sublabel(value)}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 8, background: UI_COLORS.surfaceLight, borderRadius: 6, cursor: "pointer" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 6, transition: "width 0.1s" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: -8, left: 0, width: "100%", opacity: 0, cursor: "pointer", height: 20 }} />
      </div>
    </div>
  );
}