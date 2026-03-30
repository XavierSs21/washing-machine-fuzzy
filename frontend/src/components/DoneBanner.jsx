import { CYCLES } from "../hooks/canvasUtils.js";

export default function DoneBanner({ totalTime }) {
  return (
    <div style={{
      margin: "0 20px 16px",
      background: "rgba(61,192,144,0.08)",
      border: "1px solid rgba(61,192,144,0.25)",
      borderRadius: 12, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
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
          All {CYCLES.length} cycles finished · {totalTime} min total
        </div>
      </div>
    </div>
  );
}
