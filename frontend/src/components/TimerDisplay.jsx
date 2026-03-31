export default function TimerDisplay({ elapsedTime, totalTime }) {
  const mm = Math.floor(elapsedTime / 60).toString().padStart(2, "0");
  const ss = Math.floor(elapsedTime % 60).toString().padStart(2, "0");

  const cardStyle = {
    flex: 1,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10, padding: "12px 16px",
  };

  const labelStyle = {
    fontSize: 9, color: "#666", fontFamily: "monospace",
    letterSpacing: "0.08em", textTransform: "uppercase",
  };

  const valueStyle = {
    fontSize: 18, fontFamily: "monospace", fontWeight: 700, marginTop: 6,
  };

  return (
    <div style={{ display: "flex", gap: 10, width: "100%" }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Elapsed</div>
        <div style={{ ...valueStyle, color: "#5C7AEA" }}>{mm}:{ss}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Total Est.</div>
        <div style={{ ...valueStyle, color: "#999" }}>{totalTime} min</div>
      </div>
    </div>
  );
}
