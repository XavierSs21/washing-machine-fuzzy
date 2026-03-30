import { useState, useEffect, useRef, useCallback } from "react";

const CYCLES = ["prelavado", "lavado", "enjuague", "centrifugado"];
const CYCLE_LABELS = { prelavado: "Pre-wash", lavado: "Wash", enjuague: "Rinse", centrifugado: "Spin" };
const CYCLE_COLORS = {
  prelavado: "#708ad4",
  lavado: "#64b5f6",
  enjuague: "#4fc3f7",
  centrifugado: "#9575cd"
};
const UI_COLORS = {
  surfaceLight: "#2a2a2a",
};

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
}

function roundRect(ctx, x, y, w, h, rad, fill, stroke, sw) {
  const r = typeof rad === "number" ? [rad, rad, rad, rad] : rad;

  ctx.beginPath();

  ctx.moveTo(x + r[0], y);

  // top
  ctx.lineTo(x + w - r[1], y);
  ctx.arcTo(x + w, y, x + w, y + r[1], r[1]);

  // right
  ctx.lineTo(x + w, y + h - r[2]);
  ctx.arcTo(x + w, y + h, x + w - r[2], y + h, r[2]);

  // bottom
  ctx.lineTo(x + r[3], y + h);
  ctx.arcTo(x, y + h, x, y + h - r[3], r[3]); // 🔥 AQUÍ ESTABA EL ERROR

  // left
  ctx.lineTo(x, y + r[0]);
  ctx.arcTo(x, y, x + r[0], y, r[0]);

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = sw || 1;
    ctx.stroke();
  }
}

function WashingMachineCanvas({ isRunning, isPaused, cycleProgress, currentCycleIdx, simResult, cycleTransitionTick, doorTrigger }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // mutable state kept in refs (no re-renders per frame)
  const drumAngle = useRef(0);
  const waterWave = useRef(0);
  const doorAngle = useRef(0);
  const doorTarget = useRef(0);
  const doorTimer = useRef(null);
  const bubbles = useRef([]);
  const soapDrips = useRef([]);
  const steam = useRef([]);
  const clothes = useRef([]);
  const flashAlpha = useRef(0);
  const flashDir = useRef(-1);
  const flashActive = useRef(false);
  const spinPhase = useRef(0);

  // props in refs so draw() closure always has latest
  const isRunningRef = useRef(isRunning);
  const isPausedRef = useRef(isPaused);
  const cycleProgressRef = useRef(cycleProgress);
  const currentIdxRef = useRef(currentCycleIdx);
  const simResultRef = useRef(simResult);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { cycleProgressRef.current = cycleProgress; }, [cycleProgress]);
  useEffect(() => { currentIdxRef.current = currentCycleIdx; }, [currentCycleIdx]);
  useEffect(() => { simResultRef.current = simResult; }, [simResult]);

  // init / teardown clothes when cycle starts or resets
  useEffect(() => {
    if (isRunning) {
      const colors = ["#5C7AEA", "#3DBBF0", "#8B5CF6", "#f0a030", "#e05050", "#3dc090"];
      clothes.current = Array.from({ length: 6 }, (_, i) => ({
        angle: i * 60, dist: 0.46 + Math.random() * 0.1,
        color: colors[i], rx: 9 + Math.random() * 5, ry: 4 + Math.random() * 3,
        wobble: Math.random() * Math.PI * 2, soapAmount: 1.0,
      }));
      bubbles.current = []; soapDrips.current = []; steam.current = [];
    } else {
      clothes.current = []; bubbles.current = []; soapDrips.current = []; steam.current = [];
    }
  }, [isRunning]);

  // trigger transition flash on cycle change
  useEffect(() => {
    if (cycleTransitionTick > 0) {
      flashActive.current = true; flashAlpha.current = 1; flashDir.current = -1;
    }
  }, [cycleTransitionTick]);

  // door open on masa change
  useEffect(() => {
    if (doorTrigger === 0) return;
    doorTarget.current = 38;
    clearTimeout(doorTimer.current);
    doorTimer.current = setTimeout(() => { doorTarget.current = 0; }, 1100);
  }, [doorTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function spawnBubble(cx, cy, r, big) {
      const a = Math.random() * Math.PI * 2, d = Math.random() * r * 0.8;
      bubbles.current.push({
        x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d,
        vy: -(0.3 + Math.random() * 0.7), vx: (Math.random() - 0.5) * 0.4,
        size: big ? (4 + Math.random() * 7) : (1.5 + Math.random() * 3),
        alpha: 0.55 + Math.random() * 0.35, life: 0, maxLife: 50 + Math.random() * 90,
      });
    }

    function spawnSoapDrip(px, py, colorPrefix) {
      soapDrips.current.push({
        x: px, y: py,
        vy: 0.6 + Math.random() * 1.0, vx: (Math.random() - 0.5) * 0.3,
        len: 6 + Math.random() * 14, alpha: 0.7,
        life: 0, maxLife: 40 + Math.random() * 30,
        color: colorPrefix,
      });
    }

    function spawnSteam(cx, topY) {
      steam.current.push({
        x: cx + (Math.random() - 0.5) * 28, y: topY,
        vy: -(0.7 + Math.random() * 0.5), vx: (Math.random() - 0.5) * 0.5,
        size: 7 + Math.random() * 10, alpha: 0.2,
        life: 0, maxLife: 45 + Math.random() * 35,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, 340, 420);

      const BCX = 170, BCY = 255, R = 85;
      const running = isRunningRef.current;
      const paused = isPausedRef.current;
      const idx = currentIdxRef.current;
      const result = simResultRef.current;
      const progress = cycleProgressRef.current;

      const cycle = running && idx >= 0 ? CYCLES[idx] : null;
      const metrics = cycle && result ? result[cycle] : null;
      const rpm = metrics?.velocidad_agitacion || 0;
      const temp = metrics?.temperatura_agua || 20;

      // door lerp
      doorAngle.current += (doorTarget.current - doorAngle.current) * 0.13;
      if (!doorTarget.current && doorAngle.current < 0.2) doorAngle.current = 0;

      // spin shake
      let shakeX = 0, shakeY = 0;
      if (cycle === "centrifugado" && running && !paused) {
        spinPhase.current += 0.45;
        const intensity = Math.min(rpm / 1200, 1) * 3.5;
        shakeX = Math.sin(spinPhase.current) * intensity * (0.7 + Math.random() * 0.6);
        shakeY = Math.cos(spinPhase.current * 1.3) * intensity * 0.5 * (0.7 + Math.random() * 0.6);
      }
      const CX = BCX + shakeX, CY = BCY + shakeY;

      if (running && !paused) {
        drumAngle.current += (rpm / 1200) * 4 + 0.3;
        waterWave.current += 0.04;
      }

      // transition flash
      if (flashActive.current) {
        flashAlpha.current += flashDir.current * 0.055;
        if (flashAlpha.current <= 0) { flashAlpha.current = 0; flashActive.current = false; }
        if (flashAlpha.current >= 1) flashDir.current = -1;
      }

      const da = drumAngle.current, wv = waterWave.current;

      // ---- BODY ----
      const bodyGrad = ctx.createRadialGradient(100, 140, 10, 170, 200, 260);
      bodyGrad.addColorStop(0, "#4a4a4a"); bodyGrad.addColorStop(1, "#1e1e1e");
      roundRect(ctx, 20, 50, 300, 350, 20, bodyGrad, "#555", 0.8);
      const panelGrad = ctx.createLinearGradient(0, 50, 0, 130);
      panelGrad.addColorStop(0, "#2d2d2d"); panelGrad.addColorStop(1, "#1a1a1a");
      roundRect(ctx, 20, 50, 300, 80, [20, 20, 0, 0], panelGrad, null);
      ctx.strokeStyle = "#444"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(20, 130); ctx.lineTo(320, 130); ctx.stroke();

      // display
      roundRect(ctx, 38, 65, 140, 44, 7, "#0a0f1a", "#3a3a3a", 0.8);
      ctx.textAlign = "center";
      if (cycle) {
        ctx.fillStyle = CYCLE_COLORS[cycle] || "#5C7AEA"; ctx.font = "bold 9px monospace";
        ctx.fillText(CYCLE_LABELS[cycle].toUpperCase(), 108, 84);
        ctx.fillStyle = "#e0e8ff"; ctx.font = "bold 16px monospace";
        ctx.fillText(Math.round(progress) + "%", 108, 101);
      } else {
        ctx.fillStyle = "#3a4a5a"; ctx.font = "bold 9px monospace"; ctx.fillText("FUZZY CTRL", 108, 84);
        ctx.fillStyle = "#2a3a4a"; ctx.fillText("STANDBY", 108, 101);
      }
      ctx.beginPath(); ctx.arc(230, 78, 4, 0, Math.PI * 2);
      ctx.fillStyle = running ? "#3DBBF0" : "#1a2a3a"; ctx.fill();
      ctx.fillStyle = "#555"; ctx.font = "7px monospace"; ctx.textAlign = "left"; ctx.fillText("PWR", 237, 81);
      ctx.beginPath(); ctx.arc(268, 78, 4, 0, Math.PI * 2);
      ctx.fillStyle = (running && cycle === "lavado") ? "#f0a030" : "#1a1a1a"; ctx.fill();
      ctx.fillText("HEAT", 275, 81);
      ctx.fillStyle = "#445"; ctx.fillText("TEMP", 225, 106);
      ctx.fillStyle = temp > 50 ? "#f0a030" : "#5C7AEA"; ctx.font = "bold 9px monospace";
      ctx.fillText(Math.round(temp) + "°C", 260, 106);

      // ---- DRUM CLIP ----
      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip();
      const drumGrad = ctx.createRadialGradient(CX - 20, CY - 20, 5, CX, CY, R);
      drumGrad.addColorStop(0, "#3a3a3a"); drumGrad.addColorStop(1, "#111");
      ctx.fillStyle = drumGrad; ctx.fill();

      // water
      let wl = 0;

      if (cycle === "lavado") {
        wl = 0.55;
      } else if (cycle === "prelavado") {
        wl = 0.45;
      } else if (cycle === "enjuague") {
        const start = 0.65;
        const end = 0.15;
        wl = start - ((start - end) * (progress / 100));
      } else if (cycle === "centrifugado") {
        wl = 0.08;
      }
      if (wl > 0.05) {
        const wy = CY + R - (wl * R * 2);
        ctx.beginPath();
        for (let x = CX - R; x <= CX + R; x += 4) {
          const w = Math.sin((x * 0.06) + wv) * 5 + Math.sin((x * 0.09) + wv * 1.3) * 3;
          x === CX - R ? ctx.moveTo(x, wy + w) : ctx.lineTo(x, wy + w);
        }
        ctx.lineTo(CX + R, CY + R); ctx.lineTo(CX - R, CY + R); ctx.closePath();
        ctx.fillStyle = cycle === "centrifugado" ? "rgba(80,100,160,0.2)" : "rgba(60,140,220,0.26)"; ctx.fill();
        ctx.beginPath();
        for (let x = CX - R; x <= CX + R; x += 4) {
          const w = Math.sin((x * 0.06) + wv) * 5 + Math.sin((x * 0.09) + wv * 1.3) * 3 - 2;
          x === CX - R ? ctx.moveTo(x, wy + w) : ctx.lineTo(x, wy + w);
        }
        ctx.strokeStyle = "rgba(120,180,255,0.3)"; ctx.lineWidth = 1.5; ctx.stroke();
      }

      // drum holes
      for (let i = 0; i < 8; i++) {
        const a = ((i * 45) + da * 0.3) * Math.PI / 180;
        ctx.beginPath(); ctx.arc(CX + 65 * Math.cos(a), CY + 65 * Math.sin(a), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#0d0d0d"; ctx.fill(); ctx.strokeStyle = "#333"; ctx.lineWidth = 0.5; ctx.stroke();
      }

      // clothes
      if (running) {
        clothes.current.forEach(p => {
          p.wobble += 0.05;
          const a = (p.angle + da) * Math.PI / 180;
          const px = CX + p.dist * R * Math.cos(a) + Math.sin(p.wobble) * 3;
          const py = CY + p.dist * R * Math.sin(a) + Math.cos(p.wobble * 1.3) * 2;

          ctx.save(); ctx.translate(px, py); ctx.rotate(a + p.wobble * 0.4);
          ctx.beginPath(); ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.globalAlpha = 0.78; ctx.fill();

          // WASH: foam patches on cloth
          if (cycle === "lavado") {
            for (let f = 0; f < 3; f++) {
              const fx = Math.sin(p.wobble * 1.1 + f * 2.1) * p.rx * 0.55;
              const fy = Math.cos(p.wobble * 0.9 + f * 1.7) * p.ry * 0.45;
              ctx.beginPath(); ctx.arc(fx, fy, 1.8 + Math.sin(p.wobble + f) * 0.8, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.globalAlpha = 0.55; ctx.fill();
            }
          }

          // RINSE: soap drips off cloth
          if (cycle === "enjuague" && p.soapAmount > 0) {
            p.soapAmount = Math.max(0, p.soapAmount - 0.0015);
            if (Math.random() < 0.018 && p.soapAmount > 0.05) {
              ctx.restore();
              const [r2, g2, b2] = hexToRgb(p.color);
              spawnSoapDrip(px, py, `rgba(${r2},${g2},${b2},`);
              ctx.save(); ctx.translate(px, py); ctx.rotate(a + p.wobble * 0.4);
            }
            // fading soapy sheen
            ctx.beginPath(); ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,230,255,${p.soapAmount * 0.28})`; ctx.globalAlpha = 1; ctx.fill();
          }

          ctx.globalAlpha = 1; ctx.restore();
        });
      }

      // WASH: large iridescent soap bubbles
      if (cycle === "lavado" && running && !paused) {
        bubbles.current = bubbles.current.filter(b => b.life < b.maxLife);
        if (bubbles.current.length < 28 && Math.random() < 0.5) spawnBubble(CX, CY, R, true);
        bubbles.current.forEach(b => {
          b.x += b.vx; b.y += b.vy; b.life++;
          const f = b.life / b.maxLife;
          const alpha = b.alpha * (f < 0.1 ? f * 10 : f > 0.8 ? (1 - f) * 5 : 1);
          ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200,230,255,${alpha * 0.9})`; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.fillStyle = `rgba(180,220,255,${alpha * 0.12})`; ctx.fill();
          ctx.beginPath(); ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`; ctx.fill();
        });
      }

      // PRELAVADO: small bubbles
      if (cycle === "prelavado" && running && !paused && wl > 0.1) {
        bubbles.current = bubbles.current.filter(b => b.life < b.maxLife);
        if (bubbles.current.length < 15 && Math.random() < 0.3) spawnBubble(CX, CY, R, false);
        bubbles.current.forEach(b => {
          b.x += b.vx; b.y += b.vy; b.life++;
          const alpha = b.alpha * (1 - b.life / b.maxLife);
          ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(140,200,255,${alpha})`; ctx.lineWidth = 0.8; ctx.stroke();
        });
      }

      // RINSE: soap drip streaks
      if (cycle === "enjuague" && running && !paused) {
        soapDrips.current = soapDrips.current.filter(d => d.life < d.maxLife);
        soapDrips.current.forEach(d => {
          d.x += d.vx; d.y += d.vy; d.life++;
          const alpha = d.alpha * (1 - d.life / d.maxLife);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - d.len * 0.5);
          ctx.lineTo(d.x + d.vx * 2, d.y + d.len * 0.5);
          ctx.strokeStyle = d.color + alpha + ")"; ctx.lineWidth = 1.8 + alpha; ctx.lineCap = "round"; ctx.stroke();
          ctx.beginPath(); ctx.arc(d.x + d.vx * 2, d.y + d.len * 0.5, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = d.color + (alpha * 0.8) + ")"; ctx.fill();
        });
      }

      // cycle flash overlay
      if (flashActive.current && flashAlpha.current > 0) {
        const col = cycle ? CYCLE_COLORS[cycle] : "#5C7AEA";
        const [r2, g2, b2] = hexToRgb(col);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${flashAlpha.current * 0.38})`;
        ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
      }

      ctx.restore(); // end drum clip

      // steam above door
      if (running && !paused && temp > 45) {
        if (Math.random() < 0.06) spawnSteam(CX, CY - R - 14);
        steam.current = steam.current.filter(s => s.life < s.maxLife);
        steam.current.forEach(s => {
          s.x += s.vx; s.y += s.vy; s.life++;
          const f = s.life / s.maxLife;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (0.5 + f * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,220,255,${s.alpha * (1 - f)})`; ctx.fill();
        });
      }

      // center hub
      ctx.beginPath(); ctx.arc(CX, CY, 11, 0, Math.PI * 2); ctx.fillStyle = "#1a1a1a"; ctx.fill();
      ctx.strokeStyle = "#444"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(CX, CY, 5, 0, Math.PI * 2); ctx.fillStyle = "#0d0d0d"; ctx.fill();
      ctx.beginPath(); ctx.arc(CX, CY, 2, 0, Math.PI * 2); ctx.fillStyle = "#555"; ctx.fill();

      // progress arc
      if (running) {
        ctx.beginPath();
        ctx.arc(CX, CY, R + 11, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * progress / 100));
        ctx.strokeStyle = cycle ? CYCLE_COLORS[cycle] : "#5C7AEA"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
      }

      // door open swing
      const angle = doorAngle.current * Math.PI / 60;
      const hingeX = CX - R;
      const hingeY = CY;

      ctx.save();

      // mover al pivote
      ctx.translate(hingeX, hingeY);

      // rotar puerta completa

      // efecto profundidad (opcional)
      ctx.scale(1 - Math.sin(angle) * 0.5, 1);

      // regresar coords
      ctx.translate(-hingeX, -hingeY);

      // ---- ARO ----
      ctx.beginPath();
      ctx.arc(CX, CY, R + 13, 0, Math.PI * 2);

      const ringGrad = ctx.createLinearGradient(CX - R, CY - R, CX + R, CY + R);
      ringGrad.addColorStop(0, "#555");
      ringGrad.addColorStop(0.5, "#888");
      ringGrad.addColorStop(1, "#333");

      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 7;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(CX, CY, R + 9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // ---- VIDRIO ----
      const glassGrad = ctx.createRadialGradient(CX - 25, CY - 30, 5, CX, CY, R);
      glassGrad.addColorStop(0, "rgba(180,210,255,0.14)");
      glassGrad.addColorStop(0.6, "rgba(80,120,200,0.04)");
      glassGrad.addColorStop(1, "rgba(20,40,100,0.18)");

      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = glassGrad;
      ctx.fill();

      // ---- REFLEJO ----
      ctx.beginPath();
      ctx.moveTo(CX - 50, CY - 65);
      ctx.quadraticCurveTo(CX - 5, CY - 82, CX + 45, CY - 60);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.stroke();

      // ---- HANDLE ----
      roundRect(ctx, CX + R + 5, CY - 20, 12, 36, 6, "#444", "#555", 0.5);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(CX + R + 9, CY - 16, 3, 26);

      ctx.restore();

      roundRect(ctx, 48, 398, 36, 9, 4, "#222", "#333", 0.5);
      roundRect(ctx, 256, 398, 36, 9, 4, "#222", "#333", 0.5);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []); // single RAF loop, reads from refs

  return <canvas ref={canvasRef} width={340} height={420} style={{ width: "100%", maxWidth: 320 }} />;
}

function Slider({ label, sublabel, value, min, max, step = 1, unit = "", onChange, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#777", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600 }}>{label}</span>
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

function CycleBar({ cycle, data, isActive, isDone }) {
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

export default function App() {
  const [tipoRopa, setTipoRopa] = useState(50);
  const [suciedad, setSuciedad] = useState(50);
  const [masa, setMasa] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [currentCycleIdx, setCurrentCycleIdx] = useState(-1);
  const [simResult, setSimResult] = useState(null);
  const [doneCycles, setDoneCycles] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cycleTransitionTick, setCycleTransitionTick] = useState(0);
  const [doorTrigger, setDoorTrigger] = useState(0);

  const simIntervalRef = useRef(null);
  const pausedRef = useRef(false);

  const ropaLabel = v => v < 33 ? "Delicate" : v < 66 ? "Normal" : "Heavy";
  const sucLabel = v => v < 33 ? "Low" : v < 66 ? "Medium" : "High";

  const mockSimulate = useCallback((tr, ns, mr) => {
    const h = (tr * 0.4 + ns * 0.6) / 100;
    return {
      prelavado: { tiempo_ciclo: +(8 + h * 10).toFixed(1), temperatura_agua: +(20 + h * 20).toFixed(1), cantidad_detergente: +(5 + h * 15).toFixed(1), velocidad_agitacion: Math.round(100 + h * 200), dur: 3000 },
      lavado: { tiempo_ciclo: +(20 + h * 20).toFixed(1), temperatura_agua: +(25 + h * 55).toFixed(1), cantidad_detergente: +(15 + h * 30).toFixed(1), velocidad_agitacion: Math.round(200 + h * 400), dur: 5000 },
      enjuague: { tiempo_ciclo: +(10 + h * 8).toFixed(1), temperatura_agua: +(20 + h * 10).toFixed(1), cantidad_detergente: +(2 + h * 5).toFixed(1), velocidad_agitacion: Math.round(150 + h * 250), dur: 4500 },
      centrifugado: { tiempo_ciclo: +(8 + h * 12).toFixed(1), temperatura_agua: 20, cantidad_detergente: 0, velocidad_agitacion: Math.round(400 + (mr / 10) * 800), dur: 4000 },
      tiempo_total: +(46 + h * 50 + mr * 1.5).toFixed(1),
    };
  }, []);

  const startCycle = useCallback((idx, result) => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setCycleProgress(0);
    setCycleTransitionTick(t => t + 1);

    if (idx >= CYCLES.length) {
      setIsRunning(false); setCurrentCycleIdx(-1); setCycleProgress(100); return;
    }
    setCurrentCycleIdx(idx);

    const key = CYCLES[idx];
    const dur = result[key].dur;
    let elapsed = 0;

    simIntervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      elapsed += 80;
      setElapsedTime(t => t + 0.08);
      setCycleProgress(Math.min((elapsed / dur) * 100, 100));
      if (elapsed >= dur) {
        clearInterval(simIntervalRef.current);
        setDoneCycles(d => [...d, key]);
        setCycleTransitionTick(t => t + 1);
        setTimeout(() => startCycle(idx + 1, result), 650);
      }
    }, 80);
  }, []);

  const handleStart = useCallback(() => {
    const result = mockSimulate(tipoRopa, suciedad, masa);
    setSimResult(result);
    setIsRunning(true); setIsPaused(false); pausedRef.current = false;
    setCycleProgress(0); setCurrentCycleIdx(0); setDoneCycles([]); setElapsedTime(0);
    setTimeout(() => startCycle(0, result), 0);
  }, [tipoRopa, suciedad, masa, mockSimulate, startCycle]);

  const handlePause = () => {
    setIsPaused(p => { pausedRef.current = !p; return !p; });
  };

  const handleReset = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setIsRunning(false); setIsPaused(false); pausedRef.current = false;
    setCycleProgress(0); setCurrentCycleIdx(-1); setDoneCycles([]);
    setSimResult(null); setElapsedTime(0);
  };

  const handleMasaChange = (val) => {
    setMasa(val);
    if (!isRunning) setDoorTrigger(t => t + 1);
  };

  const currentCycle = currentCycleIdx >= 0 ? CYCLES[currentCycleIdx] : null;
  const totalTime = simResult?.tiempo_total;
  const allDone = !isRunning && doneCycles.length === 4;

  return (
    <div style={{ height: "100vh", background: "#111", display: "flex", flexDirection: "column", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflow: "hidden", paddingLeft: 50, paddingRight: 50 }}>

      {/* Header */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.16em", fontFamily: "monospace", textTransform: "uppercase" }}>Fuzzy Logic Controller</div>
          <div style={{ fontSize: 19, color: "#e0e0e0", fontWeight: 600, marginTop: 4 }}>Washing Machine</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: isRunning ? "#3dc090" : "#2a2a2a", boxShadow: isRunning ? "0 0 10px rgba(61,192,144,0.7)" : "none", transition: "all 0.3s" }} />
          <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {allDone ? "COMPLETE" : isRunning ? (isPaused ? "PAUSED" : "RUNNING") : "IDLE"}
          </span>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flex: 1, padding: "20px 20px", gap: 16, overflow: "hidden" }}>

        {/* Left */}
        <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 300 }}>
          <WashingMachineCanvas
            isRunning={isRunning}
            isPaused={isPaused}
            cycleProgress={cycleProgress}
            currentCycleIdx={currentCycleIdx}
            simResult={simResult}
            cycleTransitionTick={cycleTransitionTick}
            doorTrigger={doorTrigger}
          />

          <div style={{ display: "flex", gap: 10, width: "50%" }}>
            {!isRunning ? (
              <button onClick={handleStart}
                style={{ flex: 1, padding: "12px 0", background: "rgba(92,122,234,0.15)", border: "1px solid rgba(92,122,234,0.4)", borderRadius: 10, color: "#8aa0ff", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontWeight: 600 }}>
                ▶ Start
              </button>
            ) : (
              <button onClick={handlePause}
                style={{ flex: 1, padding: "12px 0", background: isPaused ? "rgba(240,160,48,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isPaused ? "rgba(240,160,48,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: isPaused ? "#f0c070" : "#888", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.1em", cursor: "pointer", fontWeight: 600 }}>
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
            )}
            <button onClick={handleReset}
              style={{ padding: "12px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#666", fontSize: 13, fontFamily: "monospace", cursor: "pointer", fontWeight: 600 }}>
              ↺ Reset
            </button>
          </div>

          {(isRunning || allDone) && totalTime && (
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 9, color: "#666", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>Elapsed</div>
                <div style={{ fontSize: 18, color: "#5C7AEA", fontFamily: "monospace", fontWeight: 700, marginTop: 6 }}>
                  {Math.floor(elapsedTime / 60).toString().padStart(2, "0")}:{Math.floor(elapsedTime % 60).toString().padStart(2, "0")}
                </div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 9, color: "#666", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>Total Est.</div>
                <div style={{ fontSize: 18, color: "#999", fontFamily: "monospace", fontWeight: 700, marginTop: 6 }}>{totalTime} min</div>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: 12, minWidth: 280, overflow: "hidden" }}>
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: "#666", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600 }}>Configuration</div>
            <Slider label="Fabric Type" sublabel={ropaLabel} value={tipoRopa} min={0} max={100} onChange={setTipoRopa} color="#5C7AEA" unit="" />
            <Slider label="Soil Level" sublabel={sucLabel} value={suciedad} min={0} max={100} onChange={setSuciedad} color="#f0a030" unit="" />
            <Slider label="Load Mass" sublabel={_ => "kg"} value={masa} min={0} max={10} step={0.5} onChange={handleMasaChange} color="#8B5CF6" unit="" />
          </div>

          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 16px 16px 18px", flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minHeight: 0 }}>
            <div style={{ fontSize: 10, color: "#666", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600, flexShrink: 0 }}>Cycles</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflow: "auto" }}>
              {CYCLES.map(c => (
                <CycleBar key={c} cycle={c} data={simResult?.[c]} isActive={currentCycle === c} isDone={doneCycles.includes(c)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Done banner */}
      {allDone && (
        <div style={{ margin: "0 20px 16px", background: "rgba(61,192,144,0.08)", border: "1px solid rgba(61,192,144,0.25)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3dc090", boxShadow: "0 0 12px rgba(61,192,144,0.6)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, color: "#3dc090", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 600 }}>WASH CYCLE COMPLETE</div>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", marginTop: 2 }}>All {CYCLES.length} cycles finished · {totalTime} min total</div>
          </div>
        </div>
      )}
    </div>
  );
}
