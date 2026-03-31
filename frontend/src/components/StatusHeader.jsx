// StatusHeader.jsx
export default function StatusHeader({ isRunning, isPaused, allDone, speed, onSpeedChange }) {
  const statusLabel = allDone
    ? "COMPLETE"
    : isRunning
      ? isPaused
        ? "PAUSED"
        : "RUNNING"
      : "IDLE";

  const SPEEDS = [0.1, 0.25, 0.5, 1, 2, 4, 8, 16];

  return (
    <div style={{
      padding: "20px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      flexShrink: 0,
    }}>
      <div>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.16em", fontFamily: "monospace", textTransform: "uppercase" }}>
          Fuzzy Logic Controller
        </div>
        <div style={{ fontSize: 19, color: "#e0e0e0", fontWeight: 600, marginTop: 4 }}>
          Washing Machine
        </div>
      </div>

      {/* Controles de velocidad */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>SPEED</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            style={{
              padding: "3px 8px",
              borderRadius: 8,
              border: speed === s
                ? "1px solid rgba(92,122,234,0.7)"
                : "1px solid rgba(255,255,255,0.08)",
              background: speed === s
                ? "rgba(92,122,234,0.15)"
                : "rgba(255,255,255,0.03)",
              color: speed === s ? "#5C7AEA" : "#555",
              fontSize: 10,
              fontFamily: "monospace",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {s}x
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Estado de la máquina */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isRunning ? "#3dc090" : "#2a2a2a",
            boxShadow: isRunning ? "0 0 10px rgba(61,192,144,0.7)" : "none",
            transition: "all 0.3s",
          }} />
          <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}