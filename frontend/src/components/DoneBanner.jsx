import { CYCLES } from "../hooks/canvasUtils.js";

export default function DoneBanner({ totalTime, onClose }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
      margin: "0 20px 16px",
      borderRadius: 12, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
    }}>
      <div style={{
        flex: 1, height: "100%",
        background: "rgba(61,192,144,0.08)",
        border: "1px solid rgba(61,192,144,0.25)",
        borderRadius: 12, padding: "0 20px",
        display: "flex", alignItems: "center", gap: 14,
      }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: "#3dc090", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 600 }}>
            WASH CYCLE COMPLETE
          </div>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 2 }}>
            All {CYCLES.length} cycles finished · {totalTime} min total
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
        onClick={onClose}
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
  );
}
