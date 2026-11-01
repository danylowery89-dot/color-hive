'use strict';
const ICONS = {
  gear: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15.4 4.6 8 12l7.4 7.4-2.1 2.1L3.8 12l9.5-9.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><path d="M7 2l4.3 2.5v5L7 12 2.7 9.5v-5zM17 2l4.3 2.5v5L17 12l-4.3-2.5v-5zM12 11.5l4.3 2.5v5L12 21.5 7.7 19v-5z"/></svg>',
  infinity: '<svg viewBox="0 0 24 24"><path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2A5.37 5.37 0 0 0 5.4 6.62C2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12a5.39 5.39 0 0 0 3.82 1.57c2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>',
  hammer: '<svg viewBox="0 0 48 48"><g transform="rotate(-40 24 24)"><rect x="21" y="16" width="6" height="28" rx="3" fill="#c9843f"/><rect x="21" y="16" width="3" height="28" rx="1.5" fill="#e0a060"/><rect x="9" y="5" width="30" height="14" rx="4" fill="#7c8aa3"/><rect x="9" y="5" width="30" height="6" rx="3" fill="#a9b6cc"/></g></svg>',
  move: '<svg viewBox="0 0 48 48"><path d="M24 3l7 7h-4.5v10h-5V10H17zM24 45l-7-7h4.5V28h5v10H31zM3 24l7-7v4.5h10v5H10V31zM45 24l-7 7v-4.5H28v-5h10V17z" fill="#3a78ff"/><circle cx="24" cy="24" r="4" fill="#ff9524"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24"><path fill="#45cf63" d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
  ad: '<svg viewBox="0 0 24 24" class="ad-ico"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM9 8V6a3 3 0 0 1 6 0v2H9z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  sound: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05A4.47 4.47 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z"/></svg>',
  music: '<svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
  restart: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5a2 2 0 0 0-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7a2 2 0 0 0-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>',
  sad: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 13.5c2.33 0 4.31 1.46 5.11 3.5H6.89c.8-2.04 2.78-3.5 5.11-3.5z"/></svg>',
  help: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 17h-2v-2h2v2zm2.07-7.75-.9.92A3.4 3.4 0 0 0 13 15h-2v-.5a4 4 0 0 1 1.17-2.83l1.24-1.26A2 2 0 1 0 10 9H8a4 4 0 1 1 7.07 2.25z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
};

const UI = {
  $: id => document.getElementById(id),
  current: null,      // текущий экран
  modalOpen: false,

  init() {
    document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon] || ''; });
    this.applyI18n();
    const tap = (id, fn) => this.$(id).addEventListener('click', () => { Sound.unlock(); Sound.play('click'); fn(); });
    tap('btnPlay', () => this.startLevel(Save.data.level));
    tap('btnLevels', () => this.showLevels());
    tap('btnLevelsBack', () => this.showMenu());
    tap('btnEndless', () => this.startEndless());
    tap('btnDaily', () => this.startDaily());
    tap('btnSettings', () => this.openSettings());
    tap('btnPause', () => this.openPause());
    tap('btnBoosterCancel', () => Game.cancelBooster());
    document.querySelectorAll('.booster').forEach(b => b.addEventListener('click', () => { Sound.unlock(); this.onBooster(b.dataset.b); }));

    Game.hooks.hud = () => this.updateHUD();
    Game.hooks.win = () => this.onWin();
    Game.hooks.lose = () => this.onLose();
    Game.hooks.toast = (m) => this.toast(m);
    Game.hooks.boosterUsed = (b) => { Save.data.boosters[b] = Math.max(0, Save.data.boosters[b] - 1); Save.save(); this.updateBoosters(); };
    Game.hooks.boosterMode = (m) => this.setBoosterMode(m);

    this.initLogo();
  },

  applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.title = t('title');
  },

  show(id) {
    ['menu', 'levels', 'hud'].forEach(s => this.$(s).classList.toggle('show', s === id));
    this.current = id;
  },

  setCoins() {
    document.querySelectorAll('.coinsVal').forEach(el => { el.textContent = Save.data.coins; });
  },

  toast(msg, ms) {
    const el = this.$('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove('show'), ms || 1400);
  },

  // ---------- Меню ----------
  showMenu() {
    this.closeModal();
    Game.stop();
    SDK.gameplayStop();
    const d = Save.data;
    this.$('playSub').textContent = t('level', { n: d.level });
    this.$('levelsSub').textContent = t('levelsSub', { n: d.level - 1 });
    this.$('endlessSub').textContent = d.best ? t('best', { n: d.best }) : t('endlessHint');
    this.$('dailySub').textContent = d.dailyDone === U.todayKey() ? t('dailyDone') : t('dailyReward', { n: 150 });
    this.setCoins();
    this.show('menu');
  },

  showLevels() {
    const grid = this.$('levelGrid');
    grid.innerHTML = '';
    const cur = Save.data.level;
    const total = Math.max(40, Math.ceil((cur + 12) / 4) * 4);
    let curEl = null;
    for (let n = 1; n <= total; n++) {
      const el = document.createElement('button');
      el.className = 'lvl';
      const hard = n >= 5 && n % 5 === 0;
      if (hard) el.classList.add('hard');
      if (n < cur) { el.classList.add('done'); el.innerHTML = `<div class="hx">${n}</div><span class="chk">${ICONS.check}</span>`; }
      else if (n === cur) { el.classList.add('cur'); el.innerHTML = `<div class="hx">${n}</div>`; curEl = el; }
      else { el.classList.add('locked'); el.innerHTML = `<div class="hx">${ICONS.lock}<span style="font-size:14px">${n}</span></div>`; }
      el.addEventListener('click', () => {
        Sound.unlock();
        if (n > cur) { Sound.play('error'); return; }
        Sound.play('click');
        this.startLevel(n);
      });
      grid.appendChild(el);
    }
    this.setCoins();
    this.show('levels');
    if (curEl) setTimeout(() => curEl.scrollIntoView({ block: 'center' }), 30);
  },

  // ---------- Запуск режимов ----------
  startLevel(n) {
    this.closeModal();
    this.playingLevel = n;
    const intro = this.pendingIntro(n);
    const go = () => {
      const cfg = Levels.get(n);
      this.show('hud');
      Game.start(cfg);
      this.updateHUD(); this.updateBoosters();
      SDK.gameplayStart();
      if (n === 1 && !Save.data.tutorial) this.toast(t('tutorial1'), 2600);
      else if (n === 2 && !Save.data.tutorial2) { Save.data.tutorial2 = true; this.toast(t('tutorial2'), 3200); }
      else this.toast(t('goal', { n: cfg.target }), 1600);
    };
    if (intro) this.openBoosterIntro(intro, go); else go();
  },
  startEndless() {
    this.closeModal();
    this.show('hud');
    Game.start(Levels.endless());
    this.updateHUD(); this.updateBoosters();
    SDK.gameplayStart();
    this.toast(t('endlessHint'), 1600);
  },
  startDaily() {
    this.closeModal();
    const cfg = Levels.daily(U.todayKey());
    this.show('hud');
    Game.start(cfg);
    this.updateHUD(); this.updateBoosters();
    SDK.gameplayStart();
    this.toast(t('goal', { n: cfg.target }), 1600);
  },
  restart() {
    const m = Game.mode;
    if (m === 'level') this.startLevel(this.playingLevel);
    else if (m === 'daily') this.startDaily();
    else this.startEndless();
  },

  pendingIntro(n) {
    const order = ['hammer', 'shuffle', 'move'];
    for (const b of order) if (n >= Levels.boosterUnlock[b] && !Save.data.intro[b]) return b;
    return null;
  },
  boosterAvailable(b) {
    if (Game.mode !== 'level') return true;
    return (this.playingLevel || 1) >= Levels.boosterUnlock[b] || Save.data.intro[b];
  },

  // ---------- HUD ----------
  updateHUD() {
    const g = Game, title = this.$('hudTitle');
    if (g.mode === 'endless') {
      title.innerHTML = `${t('endless')}`;
      const best = Math.max(Save.data.best, g.score);
      this.$('hudProgress').textContent = `${g.score}  •  ${t('best', { n: best })}`;
      this.$('hudFill').style.width = best ? Math.min(100, g.score / best * 100) + '%' : '0%';
    } else {
      const name = g.mode === 'daily' ? t('daily') : t('level', { n: g.cfg.n });
      title.innerHTML = name + (g.cfg.hard ? ` <span class="tag">${t('hard')}</span>` : '');
      const c = Math.min(g.collected, g.target);
      this.$('hudProgress').textContent = `${c} / ${g.target}`;
      this.$('hudFill').style.width = (c / g.target * 100) + '%';
    }
    this.setCoins();
  },

  updateBoosters() {
    document.querySelectorAll('.booster').forEach(btn => {
      const b = btn.dataset.b, badge = btn.querySelector('.badge');
      const avail = this.boosterAvailable(b);
      btn.classList.toggle('locked', !avail);
      badge.classList.remove('plus');
      if (!avail) { badge.textContent = t('lvlLocked', { n: Levels.boosterUnlock[b] }); return; }
      const cnt = Save.data.boosters[b];
      if (cnt > 0) badge.textContent = cnt;
      else { badge.textContent = '+'; badge.classList.add('plus'); }
    });
  },

  onBooster(b) {
    if (Game.state !== 'play') return;
    if (!this.boosterAvailable(b)) { Sound.play('error'); this.toast(t('lvlLocked', { n: Levels.boosterUnlock[b] })); return; }
    if (Game.booster) {
      const same = Game.booster === b;
      Game.cancelBooster();
      if (same) return;
    }
    if (Save.data.boosters[b] <= 0) { Sound.play('click'); this.openBuy(b); return; }
    Sound.play('click');
    if (!Game.useBooster(b)) Sound.play('error');
  },

  setBoosterMode(m) {
    const hint = this.$('boosterHint');
    document.querySelectorAll('.booster').forEach(btn => btn.classList.toggle('active', !!m && m.indexOf(btn.dataset.b) === 0));
    if (!m) { hint.classList.remove('show'); return; }
    this.$('boosterHintText').textContent = m === 'move2' ? t('pickTarget') : t('pickStack');
    hint.classList.add('show');
  },

  // ---------- Модальные окна ----------
  modal({ icon, color, title, text, html, buttons, close }) {
    const layer = this.$('modalLayer');
    layer.innerHTML = '';
    const back = document.createElement('div');
    back.className = 'modal-back';
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `<div class="modal-icon ${color || ''}">${icon || ''}</div>` +
      (close ? `<button class="modal-close">×</button>` : '') +
      (title ? `<h2>${title}</h2>` : '') + (text ? `<p>${text}</p>` : '') + (html || '') +
      `<div class="btns"></div>`;
    const wrap = m.querySelector('.btns');
    (buttons || []).forEach(b => {
      if (b.row) {
        const row = document.createElement('div'); row.className = 'row';
        b.row.forEach(bb => row.appendChild(this.mkBtn(bb)));
        wrap.appendChild(row);
      } else wrap.appendChild(this.mkBtn(b));
    });
    if (close) m.querySelector('.modal-close').addEventListener('click', () => { Sound.play('click'); close(); });
    back.appendChild(m);
    layer.appendChild(back);
    layer.classList.add('show');
    this.modalOpen = true;
    return m;
  },
  mkBtn(b) {
    const el = document.createElement('button');
    el.className = 'btn ' + (b.cls || 'btn-green');
    el.innerHTML = (b.ad ? ICONS.ad : '') + (b.coin ? '<i class="coin"></i>' : '') + `<span>${b.text}</span>`;
    if (b.id) el.id = b.id;
    el.addEventListener('click', () => { Sound.unlock(); Sound.play('click'); b.onClick(el); });
    return el;
  },
  closeModal() {
    const layer = this.$('modalLayer');
    layer.classList.remove('show');
    layer.innerHTML = '';
    this.modalOpen = false;
  },

  togglesHTML() {
    const d = Save.data;
    return `<div class="toggles">
      <button class="toggle ${d.sound ? '' : 'off'}" id="tgSound">${ICONS.sound}${t('sound')}</button>
      <button class="toggle ${d.music ? '' : 'off'}" id="tgMusic">${ICONS.music}${t('music')}</button>
    </div>`;
  },
  bindToggles(m) {
    m.querySelector('#tgSound').addEventListener('click', e => {
      Save.data.sound = !Save.data.sound; Sound.setSfx(Save.data.sound); Save.save();
      e.currentTarget.classList.toggle('off', !Save.data.sound); Sound.play('click');
    });
    m.querySelector('#tgMusic').addEventListener('click', e => {
      Sound.unlock();
      Save.data.music = !Save.data.music; Sound.setMusic(Save.data.music); Save.save();
      e.currentTarget.classList.toggle('off', !Save.data.music); Sound.play('click');
    });
  },

  openSettings() {
    const m = this.modal({
      icon: ICONS.gear, color: 'purple', title: t('settings'), html: this.togglesHTML(),
      buttons: [{ text: t('howto'), cls: 'btn-blue', onClick: () => this.openHowto() }],
      close: () => this.closeModal()
    });
    this.bindToggles(m);
  },
  openHowto() {
    this.modal({
      icon: ICONS.help, color: 'blue', title: t('howto'),
      html: `<ul class="howto"><li>${t('howto1')}</li><li>${t('howto2')}</li><li>${t('howto3')}</li><li>${t('howto4')}</li><li>${t('howto5')}</li></ul>`,
      buttons: [{ text: t('ok'), onClick: () => this.closeModal() }],
      close: () => this.closeModal()
    });
  },

  openPause() {
    if (Game.state === 'over' || this.modalOpen) return;
    Game.cancelBooster();
    SDK.gameplayStop();
    const resume = () => { this.closeModal(); SDK.gameplayStart(); };
    const m = this.modal({
      icon: ICONS.pause, color: 'purple', title: t('pause'), html: this.togglesHTML(),
      buttons: [
        { text: t('resume'), onClick: resume },
        { row: [
          { text: t('restart'), cls: 'btn-blue', onClick: () => this.restart() },
          { text: t('menu'), cls: 'btn-orange', onClick: () => this.showMenu() }
        ] }
      ],
      close: resume
    });
    this.bindToggles(m);
  },

  openBoosterIntro(b, cb) {
    Save.data.intro[b] = true;
    Save.data.boosters[b] += 2;
    Save.save(true);
    Sound.play('unlock');
    this.modal({
      icon: `<span class="booster-big">${ICONS[b]}</span>`, color: 'green', title: t('newBooster'),
      text: `<b>${t(b)}</b> — ${t(b + 'Desc')}<br>${t('freeGift', { n: 2 })}`,
      buttons: [{ text: t('ok'), onClick: () => { this.closeModal(); cb(); } }]
    });
  },

  openBuy(b) {
    const price = Levels.boosterPrice[b];
    SDK.gameplayStop();
    const close = () => { this.closeModal(); SDK.gameplayStart(); };
    this.modal({
      icon: `<span class="booster-big">${ICONS[b]}</span>`, color: 'blue', title: t(b), text: t(b + 'Desc'),
      buttons: [
        { text: String(price), coin: true, cls: 'btn-orange', onClick: () => {
          if (Save.data.coins < price) { Sound.play('error'); this.toast(t('notEnough')); return; }
          Save.data.coins -= price; Save.data.boosters[b]++; Save.save(true);
          Sound.play('coin'); this.updateBoosters(); this.setCoins(); close();
        } },
        { text: t('free'), ad: true, cls: 'btn-green', onClick: async (el) => {
          el.disabled = true;
          const ok = await SDK.showRewarded();
          if (ok) { Save.data.boosters[b]++; Save.save(true); Sound.play('coin'); this.updateBoosters(); close(); }
          else { el.disabled = false; this.toast(t('adFail')); }
        } }
      ],
      close
    });
  },

  // ---------- Итоги ----------
  onWin() {
    SDK.gameplayStop();
    const g = Game;
    if (g.mode === 'daily') {
      const first = Save.data.dailyDone !== U.todayKey();
      const reward = first ? g.cfg.reward : 0;
      if (first) { Save.data.dailyDone = U.todayKey(); Save.data.coins += reward; Save.save(true); Sound.play('coin'); }
      this.modal({
        icon: ICONS.trophy, color: '', title: t('dailyWin'),
        html: reward ? `<div class="reward"><i class="coin"></i>+${reward}</div>` : '',
        buttons: [{ text: t('menu'), onClick: () => SDK.showFullscreen().then(() => this.showMenu()) }]
      });
      return;
    }
    const n = g.cfg.n;
    const reward = Levels.reward(n, g.cfg.hard);
    if (n >= Save.data.level) Save.data.level = n + 1;
    if (n === 1) Save.data.tutorial = true;
    Save.data.coins += reward;
    Save.save(true);
    this.setCoins();
    const m = this.modal({
      icon: ICONS.star, color: '', title: t('win'),
      html: `<div class="reward"><i class="coin"></i><span id="rewardVal">+${reward}</span></div>`,
      buttons: [
        { text: t('x2'), ad: true, cls: 'btn-purple', id: 'btnX2', onClick: async (el) => {
          el.disabled = true;
          const ok = await SDK.showRewarded();
          if (ok) {
            Save.data.coins += reward; Save.save(true); this.setCoins(); Sound.play('coin');
            m.querySelector('#rewardVal').textContent = '+' + reward * 2;
            el.style.display = 'none';
          } else { el.disabled = false; this.toast(t('adFail')); }
        } },
        { text: t('next'), onClick: () => SDK.showFullscreen().then(() => this.startLevel(n + 1)) },
        { text: t('menu'), cls: 'btn-gray', onClick: () => this.showMenu() }
      ]
    });
  },

  onLose() {
    SDK.gameplayStop();
    const g = Game;
    if (g.mode === 'endless' && g.continueUsed) return this.endlessOver();
    const buttons = [];
    if (!g.continueUsed) buttons.push({ text: t('continueAd'), ad: true, cls: 'btn-green', onClick: async (el) => {
      el.disabled = true;
      const ok = await SDK.showRewarded();
      if (ok) { this.closeModal(); SDK.gameplayStart(); await Game.continueGame(); }
      else { el.disabled = false; this.toast(t('adFail')); }
    } });
    if (g.mode === 'endless') buttons.push({ text: t('gameOver'), cls: 'btn-orange', onClick: () => this.endlessOver() });
    else buttons.push({ row: [
      { text: t('restart'), cls: 'btn-blue', onClick: () => SDK.showFullscreen().then(() => this.restart()) },
      { text: t('menu'), cls: 'btn-orange', onClick: () => this.showMenu() }
    ] });
    this.modal({ icon: ICONS.sad, color: 'red', title: t('lose'), text: t('loseText'), buttons });
  },

  endlessOver() {
    const g = Game;
    const isBest = g.score > Save.data.best;
    if (isBest) { Save.data.best = g.score; Save.save(true); }
    SDK.setScore('endless', g.score);
    const coins = Math.floor(g.score / 30);
    if (coins) { Save.data.coins += coins; Save.save(true); }
    this.modal({
      icon: ICONS.trophy, color: isBest ? '' : 'purple', title: t('gameOver'),
      html: `<div class="score-label">${t('score', { n: '' }).replace(':', '').trim()}</div><div class="big-score">${g.score}</div>` +
        (isBest ? `<div class="new-best">${t('newBest')}</div>` : `<p>${t('best', { n: Save.data.best })}</p>`) +
        (coins ? `<div class="reward"><i class="coin"></i>+${coins}</div>` : ''),
      buttons: [
        { text: t('again'), onClick: () => SDK.showFullscreen().then(() => this.startEndless()) },
        { text: t('menu'), cls: 'btn-orange', onClick: () => this.showMenu() }
      ]
    });
  },

  // ---------- Логотип ----------
  initLogo() {
    const cv = this.$('logoCanvas');
    const ctx = cv.getContext('2d');
    const stacks = [[0, 0, 1, 1, 1], [5, 5, 4, 4, 4, 4, 4], [2, 2, 2, 7, 7, 7]];
    const draw = (ts) => {
      if (this.current === 'menu') {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = cv.clientWidth, h = cv.clientHeight;
        if (w && h) {
          if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, w, h);
          const s = h * 0.27;
          const pos = [[w * 0.24, h * 0.86], [w * 0.5, h * 0.8], [w * 0.76, h * 0.86]];
          stacks.forEach((st, i) => {
            const bob = Math.sin(ts / 600 + i * 1.3) * h * 0.04;
            R.stack(ctx, pos[i][0], pos[i][1] + bob, s, st, { num: false });
          });
        }
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }
};
