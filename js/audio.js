'use strict';
// Все звуки и музыка синтезируются через WebAudio — внешних файлов нет.
const Sound = {
  ctx: null, master: null, sfxBus: null, musicBus: null,
  sfxOn: true, musicOn: true,
  muteReasons: new Set(),
  _noise: null, _musicTimer: 0, _nextNote: 0, _step: 0,

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = this.sfxOn ? 1 : 0;
      this.sfxBus.connect(this.master);
      this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = this.musicOn ? 0.32 : 0;
      this.musicBus.connect(this.master);
      const len = this.ctx.sampleRate;
      this._noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this._noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.startMusic();
    }
    if (this.ctx.state === 'suspended' && this.muteReasons.size === 0) this.ctx.resume().catch(() => {});
  },

  mute(reason) {
    this.muteReasons.add(reason);
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
  },
  unmute(reason) {
    this.muteReasons.delete(reason);
    if (this.ctx && this.muteReasons.size === 0 && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },

  setSfx(on) { this.sfxOn = on; if (this.sfxBus) this.sfxBus.gain.value = on ? 1 : 0; },
  setMusic(on) { this.musicOn = on; if (this.musicBus) this.musicBus.gain.setTargetAtTime(on ? 0.32 : 0, this.ctx.currentTime, 0.2); },

  _ok() { return this.ctx && this.ctx.state === 'running'; },
  mtof: m => 440 * Math.pow(2, (m - 69) / 12),

  tone(freq, dur, opts = {}) {
    const c = this.ctx, now = (opts.when || c.currentTime);
    const o = c.createOscillator(), g = c.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(freq, now);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, opts.slide), now + dur);
    const vol = opts.vol == null ? 0.2 : opts.vol, at = opts.attack || 0.005;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + at);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g);
    if (opts.filter) {
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.filter;
      g.connect(f); f.connect(opts.bus || this.sfxBus);
    } else g.connect(opts.bus || this.sfxBus);
    o.start(now); o.stop(now + dur + 0.05);
  },

  noise(dur, opts = {}) {
    const c = this.ctx, now = (opts.when || c.currentTime);
    const s = c.createBufferSource(); s.buffer = this._noise;
    const f = c.createBiquadFilter(); f.type = opts.ftype || 'bandpass'; f.frequency.value = opts.freq || 1500; f.Q.value = opts.q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(opts.vol || 0.2, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxBus);
    s.start(now, Math.random() * 0.5); s.stop(now + dur + 0.05);
  },

  play(name, arg) {
    if (!this._ok() || !this.sfxOn) return;
    const now = this.ctx.currentTime;
    const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98];
    switch (name) {
      case 'click':
        this.tone(660, 0.08, { type: 'triangle', vol: 0.18, slide: 440 }); break;
      case 'pick':
        this.tone(520, 0.1, { type: 'triangle', vol: 0.16, slide: 780 }); break;
      case 'place':
        this.tone(190, 0.16, { vol: 0.35, slide: 80 });
        this.noise(0.06, { freq: 900, vol: 0.12 }); break;
      case 'tile': {
        const m = PENTA[Math.min(PENTA.length - 1, arg || 0)];
        this.tone(this.mtof(m), 0.14, { type: 'triangle', vol: 0.12 });
        this.tone(this.mtof(m + 12), 0.08, { vol: 0.04 });
        break;
      }
      case 'clear': {
        const base = 72 + (arg || 0) * 2;
        [0, 4, 7, 12, 16].forEach((d, i) => this.tone(this.mtof(base + d), 0.25, { type: 'sine', vol: 0.12, when: now + i * 0.05 }));
        this.noise(0.4, { ftype: 'highpass', freq: 6000, vol: 0.06 });
        break;
      }
      case 'pop':
        this.tone(900 + (arg || 0) * 60, 0.06, { type: 'sine', vol: 0.07, slide: 1500 }); break;
      case 'win':
        [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => this.tone(this.mtof(m), 0.35, { type: 'triangle', vol: 0.16, when: now + i * 0.09 }));
        this.tone(this.mtof(84), 0.9, { type: 'sine', vol: 0.12, when: now + 0.65 });
        break;
      case 'lose':
        [67, 63, 60, 55].forEach((m, i) => this.tone(this.mtof(m), 0.32, { type: 'triangle', vol: 0.16, when: now + i * 0.16 }));
        break;
      case 'coin':
        this.tone(1318, 0.08, { type: 'square', vol: 0.05, filter: 3000 });
        this.tone(1760, 0.18, { type: 'square', vol: 0.05, filter: 3000, when: now + 0.07 });
        break;
      case 'hammer':
        this.tone(140, 0.25, { vol: 0.4, slide: 50 });
        this.noise(0.3, { freq: 400, q: 0.7, vol: 0.35 });
        break;
      case 'unlock':
        [76, 83, 88].forEach((m, i) => this.tone(this.mtof(m), 0.3, { vol: 0.12, when: now + i * 0.08 }));
        break;
      case 'whoosh':
        this.noise(0.25, { freq: 1200, q: 0.6, vol: 0.12 }); break;
      case 'error':
        this.tone(220, 0.15, { type: 'square', vol: 0.06, filter: 900 }); break;
    }
  },

  // Мягкий генеративный лоу-фай луп
  startMusic() {
    const bpm = 78, eighth = 60 / bpm / 2;
    const chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]];
    const arp = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2];
    this._nextNote = this.ctx.currentTime + 0.2;
    this._step = 0;
    const tick = () => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      if (!this.musicOn) { this._nextNote = this.ctx.currentTime + 0.1; return; }
      while (this._nextNote < this.ctx.currentTime + 0.4) {
        const step = this._step, when = this._nextNote;
        const bar = Math.floor(step / 16) % chords.length;
        const ch = chords[bar];
        const opt = { bus: this.musicBus, when };
        if (step % 16 === 0) {
          ch.slice(0, 3).forEach(m => this.tone(this.mtof(m), eighth * 16, Object.assign({ type: 'triangle', vol: 0.05, attack: 0.6, filter: 900 }, opt)));
          this.tone(this.mtof(ch[0] - 24), eighth * 6, Object.assign({ type: 'sine', vol: 0.12, attack: 0.02 }, opt));
        }
        if (step % 16 === 8) this.tone(this.mtof(ch[0] - 24 + 7), eighth * 6, Object.assign({ type: 'sine', vol: 0.09, attack: 0.02 }, opt));
        const note = ch[arp[step % 16]] + 12;
        if (Math.random() > 0.18) this.tone(this.mtof(note), eighth * 1.8, Object.assign({ type: 'sine', vol: 0.05 + Math.random() * 0.02, attack: 0.01 }, opt));
        this._nextNote += eighth;
        this._step++;
      }
    };
    this._musicTimer = setInterval(() => {
      if (this.ctx && this.ctx.state === 'running' && this._nextNote < this.ctx.currentTime) this._nextNote = this.ctx.currentTime + 0.05;
      tick();
    }, 120);
  }
};
