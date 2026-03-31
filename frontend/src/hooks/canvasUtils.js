export const CYCLES = ["prelavado", "lavado", "enjuague", "centrifugado"];

export const CYCLE_LABELS = {
  prelavado: "Pre-wash",
  lavado: "Wash",
  enjuague: "Rinse",
  centrifugado: "Spin",
};

export const CYCLE_COLORS = {
  prelavado: "#708ad4",
  lavado: "#64b5f6",
  enjuague: "#4fc3f7",
  centrifugado: "#9575cd",
};

export const UI_COLORS = {
  surfaceLight: "#2a2a2a",
};

export function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ];
}

export function roundRect(ctx, x, y, w, h, rad, fill, stroke, sw) {
  const r = typeof rad === "number" ? [rad, rad, rad, rad] : rad;
  ctx.beginPath();
  ctx.moveTo(x + r[0], y);
  ctx.lineTo(x + w - r[1], y);
  ctx.arcTo(x + w, y, x + w, y + r[1], r[1]);
  ctx.lineTo(x + w, y + h - r[2]);
  ctx.arcTo(x + w, y + h, x + w - r[2], y + h, r[2]);
  ctx.lineTo(x + r[3], y + h);
  ctx.arcTo(x, y + h, x, y + h - r[3], r[3]);
  ctx.lineTo(x, y + r[0]);
  ctx.arcTo(x, y, x + r[0], y, r[0]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1; ctx.stroke(); }
}
