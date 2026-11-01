'use strict';
// Генерация уровней: форма поля, число цветов, цель, замки.
const Levels = {
  hex(R) {
    const out = [];
    for (let q = -R; q <= R; q++)
      for (let r = -R; r <= R; r++)
        if (Math.abs(q + r) <= R) out.push([q, r]);
    return out;
  },
  rect(w, h) {
    const out = [];
    for (let row = 0; row < h; row++) {
      const off = -Math.floor(row / 2);
      for (let col = 0; col < w; col++) out.push([col + off, row]);
    }
    return out;
  },
  without(cells, list) {
    const k = new Set(list.map(c => c[0] + ',' + c[1]));
    return cells.filter(c => !k.has(c[0] + ',' + c[1]));
  },
  dist: (q, r) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)),

  shapes: {
    small:   () => Levels.hex(2),
    square:  () => Levels.rect(5, 5),
    flower:  () => Levels.without(Levels.hex(3), [[3, 0], [3, -3], [0, -3], [-3, 0], [-3, 3], [0, 3]]),
    ring:    () => Levels.without(Levels.hex(3), [[0, 0]]),
    full:    () => Levels.hex(3),
    tall:    () => Levels.rect(5, 7),
    wide:    () => Levels.rect(6, 6),
    holes:   () => Levels.without(Levels.hex(3), [[0, 0], [2, -1], [-2, 1], [-1, -1], [1, 1]]),
    star:    () => Levels.hex(3).filter(([q, r]) => Levels.dist(q, r) <= 2 || (q === 0 || r === 0 || q + r === 0)),
    diamond: () => Levels.hex(3).filter(([q, r]) => Math.abs(q - r) <= 4 && Math.abs(q + 2 * r) <= 5),
    mid:     () => Levels.rect(5, 6)
  },
  bigShapes: ['flower', 'ring', 'full', 'tall', 'wide', 'holes', 'diamond', 'mid'],

  round10: v => Math.max(10, Math.round(v / 10) * 10),

  get(n) {
    const r = U.rng(n * 7919 + 13);
    let shapeName;
    if (n <= 2) shapeName = 'small';
    else if (n <= 4) shapeName = 'square';
    else if (n <= 7) shapeName = U.pick(r, ['mid', 'flower', 'star']);
    else shapeName = U.pick(r, this.bigShapes);
    const cells = this.shapes[shapeName]();

    const hard = n >= 5 && n % 5 === 0;
    // кривая сложности
    let colors, single, maxSeg, minH = 2, maxH, assist;
    if (n <= 2)       { colors = 3; single = 0.55; maxSeg = 2; maxH = 4; assist = 0.7; }
    else if (n <= 5)  { colors = 4; single = 0.45; maxSeg = 2; maxH = 5; assist = 0.6; }
    else if (n <= 12) { colors = 5; single = 0.35; maxSeg = 3; maxH = 5; assist = 0.5; }
    else if (n <= 25) { colors = 6; single = 0.3;  maxSeg = 3; maxH = 6; assist = 0.45; }
    else              { colors = n > 50 && n % 2 ? 7 : 6; single = 0.25; maxSeg = 3; maxH = 6; assist = 0.4; minH = n > 60 ? 3 : 2; }
    if (hard) { colors = Math.min(n >= 50 ? 7 : 6, colors + 1); single = Math.max(0.15, single - 0.08); assist -= 0.1; }

    let target = n === 1 ? 30 : this.round10(Math.min(40 + n * 9, 320) * (hard ? 1.15 : 1));
    if (cells.length <= 25 && n > 2) target = Math.min(target, 120);
    if (shapeName === 'holes') target = this.round10(target * 0.75);

    const locks = [];
    if (n >= 8 && cells.length >= 28) {
      const count = Math.min(cells.length >= 35 ? 3 : 2, 1 + (n >= 20 ? 1 : 0) + (n >= 40 ? 1 : 0));
      const cand = U.shuffle(r, cells.filter(([q, rr]) => this.dist(q, rr) >= 2).slice());
      for (let i = 0; i < cand.length && locks.length < count; i++) {
        const [q, rr] = cand[i];
        if (locks.some(l => this.dist(l[0] - q, l[1] - rr) < 2)) continue;
        locks.push([q, rr, this.round10(target * (0.18 + 0.55 * (locks.length + r()) / count))]);
      }
    }

    const palette = U.shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7]);
    return { mode: 'level', n, cells, colors, palette, target, minH, maxH, maxSeg, single, assist, locks, hard, seed: n * 104729 + 7 };
  },

  daily(key) {
    const r = U.rng(key);
    const cells = this.shapes[U.pick(r, this.bigShapes)]();
    const locks = [];
    const cand = U.shuffle(r, cells.filter(([q, rr]) => this.dist(q, rr) >= 2));
    for (let i = 0; i < cand.length && locks.length < 2; i++) {
      const [q, rr] = cand[i];
      if (locks.some(l => this.dist(l[0] - q, l[1] - rr) < 2)) continue;
      locks.push([q, rr, locks.length ? 140 : 60]);
    }
    return {
      mode: 'daily', n: 0, cells, colors: 6, palette: U.shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7]),
      target: 250, minH: 2, maxH: 6, maxSeg: 3, single: 0.25, assist: 0.4, locks, hard: false, seed: key, reward: 150
    };
  },

  endless() {
    return {
      mode: 'endless', n: 0, cells: this.hex(3), colors: 4, palette: U.shuffle(U.rng(Date.now()), [0, 1, 2, 3, 4, 5, 6, 7]),
      target: 0, minH: 2, maxH: 6, maxSeg: 3, single: 0.3, assist: 0.45, locks: [], hard: false, seed: Date.now() & 0xffffff
    };
  },

  reward(n, hard) { return Math.round((20 + Math.floor(n / 5) * 5) * (hard ? 1.5 : 1)); },

  boosterUnlock: { hammer: 3, shuffle: 5, move: 8 },
  boosterPrice: { hammer: 120, move: 90, shuffle: 60 }
};
