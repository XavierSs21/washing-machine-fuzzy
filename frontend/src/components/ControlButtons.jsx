export default function ControlButtons({ isRunning, isPaused, onStart, onPause, onReset }) {
  return (
    <div style={{ display: "flex", gap: 10, width: "50%" }}>
      {!isRunning ? (
        <button
          onClick={onStart}
          style={{
            flex: 1, padding: "12px 0",
            background: "rgba(92,122,234,0.15)",
            border: "1px solid rgba(92,122,234,0.4)",
            borderRadius: 10, color: "#8aa0ff",
            fontSize: 13, fontFamily: "monospace",
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: 600,
          }}
        >
          ▶ Start
        </button>
      ) : (
        <button
          onClick={onPause}
          style={{
            flex: 1, padding: "12px 0",
            background: isPaused ? "rgba(240,160,48,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isPaused ? "rgba(240,160,48,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10, color: isPaused ? "#f0c070" : "#888",
            fontSize: 13, fontFamily: "monospace",
            letterSpacing: "0.1em", cursor: "pointer", fontWeight: 600,
          }}
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      )}

      <button
        onClick={onReset}
        style={{
          padding: "12px 20px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10, color: "#666",
          fontSize: 13, fontFamily: "monospace",
          cursor: "pointer", fontWeight: 600,
        }}
      >
        ↺ Reset
      </button>
    </div>
  );
}
