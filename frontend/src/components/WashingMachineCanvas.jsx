import { useRef, useEffect } from "react";

export default function WashingMachineCanvas({ isRunning, isPaused, cycleProgress, currentCycleIdx, simResult, cycleTransitionTick, doorTrigger }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Aquí iría todo tu código del canvas que ya tenías
  // La lógica de draw(), refs, efectos, spawnBubble, etc.

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

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
      ctx.moveTo(CX - 45, CY - 55);
      ctx.quadraticCurveTo(CX - 5, CY - 82, CX + 40, CY - 60);
      ctx.moveTo(CX - 45, CY - 55);
      ctx.quadraticCurveTo(CX - 5, CY - 82, CX + 40, CY - 60);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.stroke();

      // progress arc
      if (running) {
        ctx.beginPath();
        ctx.arc(CX, CY, R + 11, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * progress / 100));
        ctx.strokeStyle = cycle ? CYCLE_COLORS[cycle] : "#5C7AEA"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
      }

      // progress arc
      if (running) {
        ctx.beginPath();
        ctx.arc(CX, CY, R + 11, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * progress / 100));
        ctx.strokeStyle = cycle ? CYCLE_COLORS[cycle] : "#5C7AEA"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
      }

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
  }, []);

  return <canvas ref={canvasRef} width={340} height={420} style={{ width: "100%", maxWidth: 320 }} />;
}