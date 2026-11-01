'use strict';
const CLEAR_N = 10;
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

const Game = {
  canvas: null, ctx: null, dpr: 1, W: 0, H: 0,
  active: false, state: 'idle', cfg: null, mode: 'level',
  cells: [], map: new Map(), sorted: [],
  tray: [null, null, null], trayOff: [0, 0, 0],
  collected: 0, target: 0, score: 0, colorsNow: 3,
  rng: Math.random, L: null, cache: null,
  drag: null, booster: null, selected: null, hoverCell: null,
  fx: [], particles: [], floaters: [], tweens: [],
  shake: 0, time: 0, last: 0,
  tutorial: false, continueUsed: false,
  ambient: [],
  hooks: {},

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointerdown', e => this.onDown(e));
    window.addEventListener('pointermove', e => this.onMove(e));
    window.addEventListener('pointerup', e => this.onUp(e));
    window.addEventListener('pointercancel', e => this.onUp(e));
    this.resize();
    for (let i = 0; i < 14; i++) this.ambient.push(this.newAmbient(true));
    requestAnimationFrame(ts => this.loop(ts));
  },

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth; this.H = window.innerHeight;
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    if (this.active) this.layout();
  },

  // ---------- Твины ----------
  tween(dur, fn, ease) {
    return new Promise(res => this.tweens.push({ t: 0, dur: Math.max(1, dur), fn, ease: ease || U.ease.linear, res }));
  },
  wait(ms) { return this.tween(ms, () => {}); },
  updateTweens(dt) {
    const list = this.tweens; this.tweens = [];
    const keep = [];
    for (const tw of list) {
      tw.t += dt;
      const p = Math.min(1, tw.t / tw.dur);
      tw.fn(tw.ease(p), p);
      if (p >= 1) tw.res(); else keep.push(tw);
    }
    this.tweens = keep.concat(this.tweens);
  },

  // ---------- Старт ----------
  start(cfg) {
    this.cfg = cfg;
    this.mode = cfg.mode;
    this.rng = U.rng(cfg.seed + (cfg.mode === 'level' ? 0 : Math.floor(Math.random() * 1e6)));
    this.cells = []; this.map.clear();
    for (const [q, r] of cfg.cells) {
      const c = { q, r, stack: [], lock: 0, x: 0, y: 0, bump: 0, incoming: 0 };
      this.cells.push(c); this.map.set(q + ',' + r, c);
    }
    for (const [q, r, at] of cfg.locks) { const c = this.map.get(q + ',' + r); if (c) c.lock = at; }
    this.collected = 0; this.score = 0; this.target = cfg.target;
    this.colorsNow = cfg.colors;
    this.fx = []; this.particles = []; this.floaters = []; this.tweens = [];
    this.drag = null; this.booster = null; this.selected = null;
    this.continueUsed = false;
    this.tutorial = cfg.mode === 'level' && cfg.n === 1 && !Save.data.tutorial;
    this.active = true;
    this.layout();
    this.tray = [null, null, null];
    this.refillTray();
    this.state = 'play';
    this.emit('hud');
  },

  stop() { this.active = false; this.state = 'idle'; this.drag = null; this.booster = null; },

  emit(name, a) { if (this.hooks[name]) this.hooks[name](a); },

  neighbors(c) {
    const out = [];
    for (const [dq, dr] of DIRS) { const n = this.map.get((c.q + dq) + ',' + (c.r + dr)); if (n) out.push(n); }
    return out;
  },
  top: c => c.stack[c.stack.length - 1],
  isOpen(c) { return !c.lock; },
  emptyCells() { return this.cells.filter(c => !c.lock && !c.stack.length && !c.incoming); },

  // ---------- Раскладка ----------
  layout() {
    const W = this.W, H = this.H;
    const top = 96, bottom = 104;
    const availH = Math.max(200, H - top - bottom);
    const trayH = U.clamp(availH * 0.27, 110, 175);
    const boardH = availH - trayH;
    const boardW = Math.min(W - 20, 700);
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (const c of this.cells) {
      const ux = SQRT3 * (c.q + c.r / 2), uy = 1.5 * c.r * SQ;
      c.ux = ux; c.uy = uy;
      minX = Math.min(minX, ux); maxX = Math.max(maxX, ux);
      minY = Math.min(minY, uy); maxY = Math.max(maxY, uy);
    }
    const head = TILE * TH * 6;      // запас по высоте под стопки
    const wU = (maxX - minX) + SQRT3 * 1.08;
    const hU = (maxY - minY) + 2 * SQ * 1.04 + 0.34 + 0.25 + head;
    const s = Math.min(boardW / wU, boardH / hU, 56);
    const cx = W / 2;
    // поле и лоток центрируются вместе по вертикали
    const used = hU * s;
    const off = Math.max(0, (availH - used - trayH) / 2);
    const boardTop = top + off;
    const oy = boardTop + (head + SQ * 1.04) * s;
    for (const c of this.cells) {
      c.x = cx + (c.ux - (minX + maxX) / 2) * s;
      c.y = oy + (c.uy - minY) * s;
    }
    this.sorted = this.cells.slice().sort((a, b) => a.y - b.y || a.x - b.x);
    const spacing = Math.min(W * 0.31, s * 3.6, 150);
    const ts = Math.min(s * TILE * 1.3, spacing * 0.38);
    const trayY = boardTop + used + trayH * 0.5;
    this.L = {
      s, ts, top, boardH, trayH, trayY, spacing,
      slots: [0, 1, 2].map(i => ({ x: cx + (i - 1) * spacing, y: trayY }))
    };
    this.buildCache();
  },

  buildCache() {
    const cv = this.cache || document.createElement('canvas');
    cv.width = this.canvas.width; cv.height = this.canvas.height;
    const c = cv.getContext('2d');
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.W, this.H);
    R.board(c, this.sorted, this.L.s);
    // подставки под лоток
    for (const sl of this.L.slots) {
      c.fillStyle = 'rgba(255,255,255,.13)';
      R.hexPath(c, sl.x, sl.y, this.L.ts * 1.25, SQ); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2;
      c.stroke();
    }
    this.cache = cv;
  },

  // ---------- Генерация стопок ----------
  topColors() {
    const out = [];
    for (const c of this.cells) if (c.stack.length) out.push(this.top(c));
    return out;
  },
  genStack() {
    const cf = this.cfg, r = this.rng;
    const pal = cf.palette.slice(0, this.colorsNow);
    const h = U.randInt(r, cf.minH, cf.maxH);
    const segs = r() < cf.single ? 1 : U.randInt(r, Math.min(2, h), Math.min(cf.maxSeg, h));
    const sizes = []; let rem = h;
    for (let i = 0; i < segs; i++) {
      const left = segs - i - 1;
      const sz = i === segs - 1 ? rem : U.randInt(r, 1, rem - left);
      sizes.push(sz); rem -= sz;
    }
    const tops = this.topColors().filter(c => pal.indexOf(c) >= 0);
    const st = []; let prev = -1;
    for (let i = 0; i < segs; i++) {
      let col;
      if (i === segs - 1 && tops.length && r() < cf.assist) col = U.pick(r, tops.filter(x => x !== prev));
      if (col === undefined) { do { col = U.pick(r, pal); } while (col === prev && pal.length > 1); }
      for (let j = 0; j < sizes[i]; j++) st.push(col);
      prev = col;
    }
    return st;
  },
  refillTray() {
    for (let i = 0; i < 3; i++) {
      this.tray[i] = this.genStack();
      this.trayOff[i] = this.W * 0.6;
      const d = i;
      this.wait(d * 70).then(() => this.tween(320, e => { this.trayOff[d] = (1 - e) * this.W * 0.6; }, U.ease.outCubic));
    }
    Sound.play('whoosh');
  },

  // ---------- Ввод ----------
  pos(e) { return { x: e.clientX, y: e.clientY }; },
  cellAt(x, y, maxD) {
    let best = null, bd = maxD;
    for (const c of this.cells) {
      const d = Math.hypot(c.x - x, (c.y - y) / SQ);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  },
  dragBase(p) {
    const s = this.L.s;
    return this.drag.touch ? { x: p.x, y: p.y - s * 1.7 } : { x: p.x, y: p.y + s * 0.35 };
  },

  onDown(e) {
    Sound.unlock();
    if (!this.active || this.state !== 'play') return;
    const p = this.pos(e);
    if (this.booster) { this.onBoardTap(this.cellAt(p.x, p.y, this.L.s * 1.1)); return; }
    const L = this.L;
    for (let i = 0; i < 3; i++) {
      const sl = L.slots[i];
      if (!this.tray[i]) continue;
      if (Math.abs(p.x - sl.x) < L.spacing / 2 && p.y > sl.y - L.trayH * 0.75 && p.y < sl.y + L.trayH * 0.45) {
        this.drag = { i, stack: this.tray[i], x: p.x, y: p.y, touch: e.pointerType === 'touch', target: null, id: e.pointerId };
        const b = this.dragBase(p); this.drag.bx = b.x; this.drag.by = b.y;
        Sound.play('pick');
        U.vibrate(10);
        this.tutorial = false;
        return;
      }
    }
  },
  onMove(e) {
    const p = this.pos(e);
    if (this.active && this.booster && this.state === 'play') this.hoverCell = this.cellAt(p.x, p.y, this.L.s * 1.1);
    if (!this.drag || this.drag.returning || e.pointerId !== this.drag.id) return;
    this.drag.x = p.x; this.drag.y = p.y;
    const b = this.dragBase(p); this.drag.bx = b.x; this.drag.by = b.y;
    const c = this.cellAt(b.x, b.y, this.L.s * 1.25);
    this.drag.target = c && !c.lock && !c.stack.length && !c.incoming ? c : null;
  },
  async onUp(e) {
    const d = this.drag;
    if (!d || d.returning || e.pointerId !== d.id) return;
    if (d.target && this.state === 'play') {
      const c = d.target;
      this.drag = null;
      this.tray[d.i] = null;
      this.state = 'busy';
      await this.flyStack(d.stack, d.bx, d.by, c, 110);
      Sound.play('place');
      U.vibrate(15);
      await this.resolve(c);
      await this.afterTurn();
    } else {
      d.returning = true;
      const sx = d.bx, sy = d.by, sl = this.L.slots[d.i];
      await this.tween(160, e2 => { d.bx = U.lerp(sx, sl.x, e2); d.by = U.lerp(sy, sl.y, e2); }, U.ease.outCubic);
      this.drag = null;
    }
  },

  // ---------- Бустеры ----------
  useBooster(type) {
    if (!this.active || this.state !== 'play' || this.drag) return false;
    if (type === 'shuffle') {
      this.emit('boosterUsed', type);
      this.tray = [null, null, null];
      this.refillTray();
      return true;
    }
    if (type === 'hammer' && !this.cells.some(c => c.stack.length)) return false;
    if (type === 'move' && (!this.cells.some(c => c.stack.length) || !this.emptyCells().length)) return false;
    this.booster = type; this.selected = null;
    this.emit('boosterMode', type);
    return true;
  },
  cancelBooster() {
    this.booster = null; this.selected = null; this.hoverCell = null;
    this.emit('boosterMode', null);
  },
  async onBoardTap(c) {
    if (this.booster === 'hammer') {
      if (!c || !c.stack.length) return;
      this.state = 'busy';
      this.emit('boosterUsed', 'hammer');
      this.cancelBooster();
      await this.smash(c);
      this.state = 'play';
      await this.afterTurn();
    } else if (this.booster === 'move') {
      if (!this.selected) {
        if (c && c.stack.length) { this.selected = c; Sound.play('pick'); this.emit('boosterMode', 'move2'); }
        return;
      }
      if (c && c.stack.length) { this.selected = c; Sound.play('pick'); return; }
      if (!c || c.lock) return;
      const src = this.selected;
      this.state = 'busy';
      this.emit('boosterUsed', 'move');
      this.cancelBooster();
      const st = src.stack; src.stack = [];
      await this.flyStack(st, src.x, src.y, c, 280, true);
      Sound.play('place');
      await this.resolve(c);
      await this.afterTurn();
    }
  },

  // ---------- Анимации и логика ----------
  flyStack(stack, x0, y0, cell, dur, arc) {
    const f = { kind: 'stack', stack, x: x0, y: y0, s: this.L.s * TILE };
    this.fx.push(f);
    cell.incoming++;
    const s0 = this.drag ? this.L.s * TILE : this.L.s * TILE;
    return this.tween(dur, e => {
      f.x = U.lerp(x0, cell.x, e);
      f.y = U.lerp(y0, cell.y, e) - (arc ? Math.sin(Math.PI * e) * this.L.s * 1.5 : 0);
      f.s = s0;
    }, U.ease.outQuad).then(() => {
      this.fx.splice(this.fx.indexOf(f), 1);
      cell.incoming--;
      cell.stack = stack;
      cell.bump = 1;
    });
  },

  tilePos(cell, idx) {
    const s = this.L.s * TILE;
    return { x: cell.x, y: cell.y - (idx + 1) * s * TH };
  },

  async transfer(from, to) {
    const n = R.runLen(from.stack);
    const s = this.L.s * TILE;
    const jobs = [];
    for (let i = 0; i < n; i++) {
      const col = from.stack.pop();
      const p0 = this.tilePos(from, from.stack.length);
      const p1 = this.tilePos(to, to.stack.length + to.incoming);
      to.incoming++;
      const f = { kind: 'tile', col, x: p0.x, y: p0.y, flip: 1, s };
      this.fx.push(f);
      const idx = i;
      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      jobs.push(this.tween(230, e => {
        f.x = U.lerp(p0.x, p1.x, e);
        f.y = U.lerp(p0.y, p1.y, e) - Math.sin(Math.PI * e) * (s * 0.9 + dist * 0.25);
        f.flip = Math.cos(Math.PI * e);
      }, U.ease.inOutQuad).then(() => {
        this.fx.splice(this.fx.indexOf(f), 1);
        to.incoming--;
        to.stack.push(col);
        to.bump = 0.6;
        Sound.play('tile', idx);
      }));
      await this.wait(45);
    }
    await Promise.all(jobs);
  },

  async clearRun(cell, combo) {
    const n = R.runLen(cell.stack);
    const s = this.L.s * TILE;
    const col = this.top(cell);
    const jobs = [];
    Sound.play('clear', combo);
    U.vibrate(30);
    for (let i = 0; i < n; i++) {
      cell.stack.pop();
      const p = this.tilePos(cell, cell.stack.length);
      const f = { kind: 'tile', col, x: p.x, y: p.y, flip: 1, s, alpha: 1 };
      this.fx.push(f);
      jobs.push(this.tween(260, e => {
        f.y = p.y - e * s * 1.2;
        f.s = s * (1 + 0.3 * Math.sin(Math.PI * e)) * (1 - e * 0.6);
        f.alpha = 1 - e;
      }, U.ease.outQuad).then(() => this.fx.splice(this.fx.indexOf(f), 1)));
      this.burst(p.x, p.y, col, 5);
      this.collected++;
      if (this.mode === 'endless') this.score += combo;
      this.emit('hud');
      Sound.play('pop', i);
      await this.wait(30);
    }
    await Promise.all(jobs);
    const pts = this.mode === 'endless' ? n * combo : n;
    this.floater('+' + pts, cell.x, cell.y - s * 1.2, COLS[col].lighter, s * 0.9);
    this.shake = Math.max(this.shake, 4);
  },

  isPure(c) { return c.stack.length > 0 && R.runLen(c.stack) === c.stack.length; },

  async resolve(start) {
    const queue = [start];
    let combo = 0, guard = 0;
    while (queue.length && guard++ < 300) {
      const c = queue.shift();
      if (!c.stack.length) continue;
      const col = this.top(c);
      const matches = this.neighbors(c).filter(n => n.stack.length && this.top(n) === col);
      if (!matches.length) continue;
      let dest = c, sources = matches;
      if (matches.length === 1) {
        const n = matches[0];
        const nOther = this.neighbors(n).filter(m => m !== c && m.stack.length && this.top(m) === col).length;
        if (nOther > 0 || (this.isPure(n) && !this.isPure(c))) { dest = n; sources = [c]; }
      }
      for (const src of sources) await this.transfer(src, dest);
      await this.wait(60);
      if (R.runLen(dest.stack) >= CLEAR_N) {
        combo++;
        await this.clearRun(dest, combo);
        this.checkUnlocks();
        if (combo >= 2) {
          const words = ['', '', t('great'), t('awesome'), t('amazing')];
          this.floater(t('combo', { n: combo }), this.W / 2, this.L.top + this.L.boardH * 0.15, '#ffe36b', Math.min(46, this.L.s * 1.1), true);
          if (words[Math.min(4, combo)]) this.emit('toast', words[Math.min(4, combo)]);
        }
        await this.wait(60);
      }
      queue.unshift(dest);
      for (const src of sources) if (src !== dest) queue.push(src);
    }
    if (this.mode === 'endless') this.growColors();
  },

  growColors() {
    const steps = [0, 80, 200, 400, 700];
    let add = 0;
    for (const v of steps) if (this.score >= v) add++;
    this.colorsNow = Math.min(7, this.cfg.colors + add - 1);
    // дальше растёт сложность самих стопок
    const hardness = U.clamp((this.score - 700) / 1500, 0, 1);
    this.cfg.single = U.lerp(0.3, 0.12, hardness);
    this.cfg.assist = U.lerp(0.45, 0.15, hardness);
    this.cfg.minH = hardness > 0.5 ? 3 : 2;
  },

  checkUnlocks() {
    for (const c of this.cells) {
      if (c.lock && this.collected >= c.lock) {
        c.lock = 0;
        this.burst(c.x, c.y, -1, 18);
        Sound.play('unlock');
        this.emit('toast', t('unlocked'));
      }
    }
  },

  async afterTurn() {
    this.checkUnlocks();
    if (this.mode !== 'endless' && this.collected >= this.target) { await this.win(); return; }
    if (this.tray.every(x => !x)) this.refillTray();
    if (!this.emptyCells().length) { await this.lose(); return; }
    this.state = 'play';
  },

  async win() {
    this.state = 'over';
    Sound.play('win');
    for (let i = 0; i < 4; i++) setTimeout(() => this.confetti(), i * 220);
    await this.wait(1100);
    this.emit('win');
  },
  async lose() {
    this.state = 'over';
    Sound.play('lose');
    await this.wait(600);
    this.emit('lose');
  },

  async smash(c) {
    Sound.play('hammer');
    U.vibrate(40);
    const s = this.L.s * TILE;
    c.stack.forEach((col, i) => { const p = this.tilePos(c, i); this.burst(p.x, p.y, col, 6); });
    c.stack = [];
    this.shake = 10;
    await this.wait(200);
  },

  // реклама «продолжить»: убрать часть стопок
  async continueGame() {
    this.continueUsed = true;
    const filled = U.shuffle(Math.random, this.cells.filter(c => c.stack.length));
    filled.sort((a, b) => b.stack.length - a.stack.length);
    const n = Math.max(4, Math.ceil(filled.length * 0.35));
    const pick = U.shuffle(Math.random, filled.slice(0, Math.min(filled.length, n + 3))).slice(0, n);
    this.state = 'busy';
    for (const c of pick) { await this.smash(c); await this.wait(60); }
    this.state = 'play';
  },

  // ---------- Эффекты ----------
  burst(x, y, col, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, life: 0, max: 600 + Math.random() * 500,
        col: col < 0 ? '#ffffff' : (Math.random() < 0.5 ? COLS[col].base : COLS[col].lighter),
        size: (this.L ? this.L.s : 30) * (0.12 + Math.random() * 0.14), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, hex: Math.random() < 0.7
      });
    }
  },
  confetti() {
    for (let i = 0; i < 60; i++) {
      const col = Math.floor(Math.random() * 8);
      this.particles.push({
        x: this.W * Math.random(), y: -20, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, life: 0, max: 2200,
        col: COLS[col].base, size: 5 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, hex: false, conf: true
      });
    }
  },
  floater(text, x, y, color, size, big) {
    this.floaters.push({ text, x, y, color, size, life: 0, max: big ? 1300 : 900, big });
  },

  newAmbient(init) {
    return {
      x: Math.random() * (this.W || 400), y: init ? Math.random() * (this.H || 800) : (this.H || 800) + 60,
      s: 10 + Math.random() * 22, v: 0.15 + Math.random() * 0.35, col: Math.floor(Math.random() * 8),
      h: 1 + Math.floor(Math.random() * 4), ph: Math.random() * 6, a: 0.25 + Math.random() * 0.35
    };
  },

  // ---------- Цикл ----------
  loop(ts) {
    const dt = Math.min(50, ts - (this.last || ts));
    this.last = ts; this.time += dt;
    this.updateTweens(dt);
    this.update(dt);
    this.render();
    requestAnimationFrame(t2 => this.loop(t2));
  },

  update(dt) {
    const k = dt / 16.67;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * k; p.y += p.vy * k;
      p.vy += (p.conf ? 0.05 : 0.22) * k;
      if (p.conf) p.vx += Math.sin(p.life / 200 + p.rot) * 0.05;
      p.rot += p.vr * k;
      if (p.life > p.max) this.particles.splice(i, 1);
    }
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i]; f.life += dt;
      if (f.life > f.max) this.floaters.splice(i, 1);
    }
    for (const c of this.cells) if (c.bump > 0) c.bump = Math.max(0, c.bump - dt / 220);
    this.shake = Math.max(0, this.shake - dt / 30);
    if (!this.active) {
      for (let i = 0; i < this.ambient.length; i++) {
        const a = this.ambient[i];
        a.y -= a.v * k; a.ph += 0.01 * k;
        if (a.y < -80) this.ambient[i] = this.newAmbient(false);
      }
    }
  },

  render() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!this.active) { this.renderAmbient(ctx); this.renderParticles(ctx); return; }
    const L = this.L, s = L.s, ts = s * TILE;
    let sx = 0, sy = 0;
    if (this.shake > 0) { sx = (Math.random() - 0.5) * this.shake; sy = (Math.random() - 0.5) * this.shake; }
    ctx.save();
    ctx.translate(sx, sy);
    ctx.drawImage(this.cache, 0, 0, this.W, this.H);

    // подсветки ячеек
    const pulse = 0.5 + 0.5 * Math.sin(this.time / 180);
    for (const c of this.sorted) {
      if (c.lock) {
        R.hexPath(ctx, c.x, c.y, s * 0.9, SQ);
        ctx.fillStyle = 'rgba(70,45,150,.78)'; ctx.fill();
        R.lock(ctx, c.x, c.y, s, Math.max(0, c.lock - this.collected));
        continue;
      }
      if (this.drag && !c.stack.length && !c.incoming) {
        R.hexPath(ctx, c.x, c.y, s * 0.82, SQ);
        ctx.fillStyle = c === this.drag.target ? `rgba(255,255,255,${0.55 + pulse * 0.3})` : 'rgba(255,255,255,.22)';
        ctx.fill();
      }
      if (this.booster === 'move' && this.selected && !c.stack.length && !c.incoming) {
        R.hexPath(ctx, c.x, c.y, s * 0.82, SQ);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + pulse * 0.25})`; ctx.fill();
      }
    }

    // стопки
    for (const c of this.sorted) {
      if (!c.stack.length) continue;
      let y = c.y;
      let sc = ts * (1 + c.bump * 0.06);
      if (this.selected === c) y -= s * 0.5 + pulse * s * 0.1;
      const hl = this.booster && (this.booster === 'hammer' || !this.selected) && this.hoverCell === c;
      R.stack(ctx, c.x, y, sc, c.stack);
      if (hl || this.selected === c) {
        R.hexPath(ctx, c.x, y - c.stack.length * ts * TH, sc * 1.05, SQ);
        ctx.strokeStyle = this.booster === 'hammer' ? '#ff4d63' : '#ffe36b';
        ctx.lineWidth = 4; ctx.stroke();
      }
    }

    // летящие объекты
    for (const f of this.fx) {
      if (f.kind === 'tile') {
        const k = SQ * (0.25 + 0.75 * Math.abs(f.flip));
        R.tile(ctx, f.x, f.y, f.s, k, f.col, f.alpha);
      } else if (f.kind === 'stack') {
        R.stack(ctx, f.x, f.y, f.s, f.stack);
      }
    }

    ctx.restore();

    // лоток
    for (let i = 0; i < 3; i++) {
      const st = this.tray[i];
      if (!st || (this.drag && this.drag.i === i)) continue;
      const sl = L.slots[i];
      const bob = Math.sin(this.time / 500 + i) * 2;
      R.stack(ctx, sl.x + this.trayOff[i], sl.y + bob, L.ts, st);
    }
    if (this.drag) {
      const d = this.drag;
      const sc = d.returning ? L.ts : ts;
      R.stack(ctx, d.bx, d.by, sc, d.stack, { alpha: 0.97 });
    }

    if (this.tutorial && this.state === 'play' && !this.drag) this.renderTutorial(ctx);
    this.renderParticles(ctx);
    this.renderFloaters(ctx);
  },

  renderTutorial(ctx) {
    const L = this.L;
    const sl = L.slots[1];
    if (!this.tray[1]) return;
    const target = this.cellAt(this.W / 2, this.sorted.length ? (this.sorted[0].y + this.sorted[this.sorted.length - 1].y) / 2 : 0, 1e9);
    if (!target || target.stack.length) { this.tutorial = false; return; }
    const ph = (this.time % 2200) / 2200;
    const e = U.ease.inOutQuad(U.clamp((ph - 0.15) / 0.6, 0, 1));
    const x = U.lerp(sl.x, target.x, e), y = U.lerp(sl.y, target.y, e);
    const a = ph < 0.85 ? 1 : 1 - (ph - 0.85) / 0.15;
    R.stack(ctx, x, y, L.s * TILE, this.tray[1], { alpha: 0.45 * a, num: false, shadow: false });
    ctx.globalAlpha = a;
    const press = ph < 0.15 ? ph / 0.15 : 1;
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.beginPath(); ctx.arc(x + L.s * 0.3, y + L.s * 0.4, L.s * (0.32 - 0.06 * press), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x + L.s * 0.3, y + L.s * 0.4, L.s * (0.5 + 0.2 * press), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  },

  renderAmbient(ctx) {
    for (const a of this.ambient) {
      const st = new Array(a.h).fill(a.col);
      R.stack(ctx, a.x + Math.sin(a.ph) * 14, a.y, a.s, st, { alpha: a.a, num: false, shadow: false });
    }
  },

  renderParticles(ctx) {
    for (const p of this.particles) {
      const a = 1 - p.life / p.max;
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.col;
      if (p.hex) {
        R.hexPath(ctx, p.x, p.y, p.size, 1); ctx.fill();
      } else {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  },

  renderFloaters(ctx) {
    for (const f of this.floaters) {
      const p = f.life / f.max;
      const a = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
      const sc = f.big ? (p < 0.15 ? U.ease.outBack(p / 0.15) : 1) : 1;
      const y = f.y - (f.big ? p * 20 : p * 50);
      ctx.globalAlpha = Math.max(0, a);
      ctx.font = `900 ${Math.round(f.size * sc)}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(3, f.size * 0.16);
      ctx.strokeStyle = 'rgba(40,15,110,.85)';
      ctx.strokeText(f.text, f.x, y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, y);
    }
    ctx.globalAlpha = 1;
  }
};
