'use strict';
// Процедурная отрисовка 3D-шестиугольников
const SQRT3 = Math.sqrt(3);
const SQ = 0.76;      // вертикальное сжатие (наклон камеры)
const TH = 0.2;       // толщина плитки относительно её радиуса
const TILE = 0.86;    // радиус плитки относительно ячейки
const FONT = '"Nunito","Varela Round","Segoe UI Rounded","Trebuchet MS","Segoe UI",Arial,sans-serif';

// цвета разнесены по тону и яркости, чтобы соседние (синий/фиолетовый, зелёный/голубой) не путались
const PALETTE = ['#ff3347', '#ff8a1c', '#ffe14a', '#2fb52f', '#5ee6f2', '#1747e6', '#bb55ff', '#ffa3e0'];
const COLS = PALETTE.map(h => ({
  base: h,
  light: U.shade(h, 0.28),
  lighter: U.shade(h, 0.5),
  sideR: U.shade(h, -0.34),
  sideL: U.shade(h, -0.18),
  edge: U.shade(h, -0.55)
}));

const R = {
  hexPath(ctx, x, y, s, k) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i - 90);
      const px = x + s * Math.cos(a), py = y + s * Math.sin(a) * k;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  },

  // боковые грани плитки, верхняя грань которой центрирована в (x, ty)
  side(ctx, x, ty, s, k, t, rc, lc) {
    const cx = s * SQRT3 / 2, hy = s * 0.5 * k, by = s * k;
    ctx.fillStyle = rc;
    ctx.beginPath();
    ctx.moveTo(x + cx, ty + hy); ctx.lineTo(x, ty + by); ctx.lineTo(x, ty + by + t); ctx.lineTo(x + cx, ty + hy + t);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = lc;
    ctx.beginPath();
    ctx.moveTo(x, ty + by); ctx.lineTo(x - cx, ty + hy); ctx.lineTo(x - cx, ty + hy + t); ctx.lineTo(x, ty + by + t);
    ctx.closePath(); ctx.fill();
  },

  tileSide(ctx, x, ty, s, k, t, c) {
    this.side(ctx, x, ty, s, k, t, c.sideR, c.sideL);
    const cx = s * SQRT3 / 2, hy = s * 0.5 * k, by = s * k;
    ctx.strokeStyle = 'rgba(0,0,0,.16)';
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.beginPath();
    ctx.moveTo(x + cx, ty + hy + t); ctx.lineTo(x, ty + by + t); ctx.lineTo(x - cx, ty + hy + t);
    ctx.stroke();
  },

  tileTop(ctx, x, ty, s, k, c) {
    this.hexPath(ctx, x, ty, s, k);
    const g = ctx.createLinearGradient(x - s * 0.5, ty - s * k, x + s * 0.4, ty + s * k);
    g.addColorStop(0, c.lighter); g.addColorStop(0.55, c.light); g.addColorStop(1, c.base);
    ctx.fillStyle = g; ctx.fill();
    this.hexPath(ctx, x, ty, s * 0.74, k);
    ctx.strokeStyle = 'rgba(255,255,255,.32)';
    ctx.lineWidth = Math.max(1, s * 0.07);
    ctx.stroke();
    // блик
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.beginPath();
    ctx.ellipse(x - s * 0.28, ty - s * 0.32 * k, s * 0.26, s * 0.12 * k, -0.5, 0, Math.PI * 2);
    ctx.fill();
  },

  // одиночная плитка (для летящих)
  tile(ctx, x, ty, s, k, colIdx, alpha) {
    const c = COLS[colIdx], t = s * TH;
    if (alpha != null) ctx.globalAlpha = alpha;
    this.tileSide(ctx, x, ty, s, k, t, c);
    this.tileTop(ctx, x, ty, s, k, c);
    if (alpha != null) ctx.globalAlpha = 1;
  },

  runLen(stack) {
    const n = stack.length;
    if (!n) return 0;
    const c = stack[n - 1];
    let i = n - 1;
    while (i >= 0 && stack[i] === c) i--;
    return n - 1 - i;
  },

  // стопка с основанием в (x, y); s — радиус плитки
  stack(ctx, x, y, s, stack, opts) {
    const n = stack.length;
    if (!n) return;
    const k = SQ, t = s * TH;
    const alpha = opts && opts.alpha;
    if (alpha != null) ctx.globalAlpha = alpha;
    if (!opts || opts.shadow !== false) {
      ctx.fillStyle = 'rgba(30,10,80,.28)';
      ctx.beginPath();
      ctx.ellipse(x, y + s * 0.18, s * 1.02, s * 0.98 * k, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < n; i++) this.tileSide(ctx, x, y - (i + 1) * t, s, k, t, COLS[stack[i]]);
    const ty = y - n * t;
    const top = COLS[stack[n - 1]];
    this.tileTop(ctx, x, ty, s, k, top);
    if (!opts || opts.num !== false) {
      const run = this.runLen(stack);
      const fs = Math.round(s * 0.62);
      ctx.font = `900 ${fs}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, s * 0.13);
      ctx.strokeStyle = top.edge;
      ctx.strokeText(run, x, ty + fs * 0.06);
      ctx.fillStyle = '#fff';
      ctx.fillText(run, x, ty + fs * 0.06);
    }
    if (alpha != null) ctx.globalAlpha = 1;
  },

  stackHeight(n, s) { return n * s * TH; },

  // замок
  lock(ctx, x, y, s, text) {
    const w = s * 0.5, h = s * 0.38;
    ctx.save();
    ctx.translate(x, y - s * 0.18);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -h * 0.35, w * 0.32, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w * 0.32, -h * 0.35); ctx.lineTo(-w * 0.32, -h * 0.1); ctx.moveTo(w * 0.32, -h * 0.35); ctx.lineTo(w * 0.32, -h * 0.1); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-w / 2, -h * 0.15, w, h, s * 0.08); else ctx.rect(-w / 2, -h * 0.15, w, h);
    ctx.fill();
    ctx.fillStyle = '#6a55c8';
    ctx.beginPath(); ctx.arc(0, h * 0.3, s * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const fs = Math.round(s * 0.4);
    ctx.font = `900 ${fs}px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(text, x, y + s * 0.38);
  },

  // статичная подложка поля (рендерится в кэш)
  board(ctx, cells, s) {
    const k = SQ, pt = s * 0.34;
    const ps = s * 1.035;
    // тень
    ctx.fillStyle = 'rgba(20,6,70,.35)';
    for (const c of cells) { this.hexPath(ctx, c.x, c.y + pt + s * 0.22, ps * 1.02, k); ctx.fill(); }
    // борта
    for (const c of cells) this.side(ctx, c.x, c.y, ps, k, pt, '#9a8de6', '#b3a8f0');
    // верх
    for (const c of cells) {
      this.hexPath(ctx, c.x, c.y, ps, k);
      ctx.fillStyle = '#efeaff'; ctx.fill();
    }
    // лунки
    for (const c of cells) {
      this.hexPath(ctx, c.x, c.y, s * 0.9, k);
      ctx.fillStyle = '#cfc5f7'; ctx.fill();
      this.hexPath(ctx, c.x, c.y + s * 0.05, s * 0.82, k);
      ctx.fillStyle = '#ddd5fb'; ctx.fill();
    }
  }
};
