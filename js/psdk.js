'use strict';
// Обёртка над Pikabu Games SDK (PkbSDK). Интерфейс тот же, что у версии для Яндекса.
// Если SDK недоступен (локальный запуск, блокировщик рекламы) — работает заглушка.
const SDK = {
  sdk: null,
  lang: 'ru',              // по требованиям площадки интерфейс по умолчанию русский
  mock: false,
  gameplayOn: false,
  adShowing: false,
  onPause: null,
  onResume: null,
  _preloader: null,
  _flushTimer: 0,
  _lastFlush: 0,

  async init() {
    const inFrame = window.parent && window.parent !== window;
    if (window.PkbSDK && typeof PkbSDK.init === 'function' && inFrame) {
      try {
        // SDK ждёт ответа от страницы площадки; без неё init не завершится — ставим таймаут
        this.sdk = await Promise.race([
          PkbSDK.init(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
        ]);
        try { this.sdk.on('storageSaveError', r => console.warn('storage save error', r)); } catch (e) {}
        // реклама на экране загрузки (только мобильные, только до gameStarted)
        try {
          if (this.sdk.ads.preloader.isSupported && await this.sdk.ads.preloader.canShow()) {
            this._preloader = this.sdk.ads.preloader.show().catch(() => {});
          }
        } catch (e) {}
        document.addEventListener('visibilitychange', () => { if (document.hidden) this._flush(true); });
        window.addEventListener('pagehide', () => this._flush(true));
        return;
      } catch (e) {
        console.warn('PkbSDK init failed', e);
        this.sdk = null;
      }
    }
    this.mock = true;
  },

  // Сообщаем платформе, что игра загружена и готова
  async ready() {
    if (!this.sdk) return;
    if (this._preloader) { await this._preloader; this._preloader = null; }
    try { this.sdk.gameStarted(); } catch (e) {}
  },

  gameplayStart() { this.gameplayOn = true; },
  gameplayStop() { this.gameplayOn = false; },

  _mockAd(ms) {
    return new Promise(res => {
      const el = document.getElementById('adMock');
      el.classList.add('show');
      setTimeout(() => { el.classList.remove('show'); res(); }, ms);
    });
  },

  // Общий показ: пауза звука и геймплея на время рекламы
  async _show(kind) {
    const wasPlaying = this.gameplayOn;
    let res = null;
    try {
      if (!(await this.sdk.ads[kind].canShow())) return null;
      this.adShowing = true; Sound.mute('ad'); this.gameplayStop();
      res = await this.sdk.ads[kind].show();
    } catch (e) {
      res = null;
    }
    this.adShowing = false;
    Sound.unmute('ad');
    if (wasPlaying) this.gameplayStart();
    return res;
  },

  // Полноэкранная реклама (между уровнями). Не чаще раза в 120 с — следит сама площадка.
  async showFullscreen() {
    if (this.mock) {
      this.adShowing = true; Sound.mute('ad'); this.gameplayStop();
      await this._mockAd(700);
      this.adShowing = false; Sound.unmute('ad');
      return;
    }
    if (!this.sdk) return;
    await this._show('fullscreen');
  },

  // Реклама за вознаграждение. Возвращает true, только если награда положена.
  async showRewarded() {
    if (this.mock) {
      this.adShowing = true; Sound.mute('ad'); this.gameplayStop();
      await this._mockAd(1200);
      this.adShowing = false; Sound.unmute('ad');
      return true;
    }
    if (!this.sdk) return false;
    const res = await this._show('rewarded');
    return !!(res && res.reward);
  },

  // Облачные сохранения: данные загружаются вместе с init, get/set синхронные
  async loadData() {
    if (!this.sdk) return null;
    try { return this.sdk.storage.get('save') || null; } catch (e) { return null; }
  },
  saveData(obj) {
    if (!this.sdk) return;
    try { this.sdk.storage.set('save', obj); } catch (e) { return; }
    this._flush(false);
  },
  // Отправка на сервер: лимит площадки — 100 flush за 5 минут, поэтому не чаще раза в 5 с
  _flush(now) {
    if (!this.sdk) return;
    clearTimeout(this._flushTimer);
    const wait = now ? 0 : Math.max(0, 5000 - (Date.now() - this._lastFlush));
    const go = () => {
      this._lastFlush = Date.now();
      try { this.sdk.storage.flush().catch(() => {}); } catch (e) {}
    };
    if (wait === 0) go(); else this._flushTimer = setTimeout(go, wait);
  },

  // Лидербордов на площадке нет — рекорд хранится в сохранении
  setScore() {}
};
