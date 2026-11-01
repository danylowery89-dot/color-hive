'use strict';
(function () {
  // Защита от нежелательных жестов браузера (требования модерации)
  const prevent = e => e.preventDefault();
  document.addEventListener('contextmenu', prevent);
  document.addEventListener('selectstart', prevent);
  document.addEventListener('dragstart', prevent);
  document.addEventListener('gesturestart', prevent);
  document.addEventListener('dblclick', prevent);
  document.addEventListener('touchmove', e => {
    if (!e.target.closest || !e.target.closest('.level-scroll')) e.preventDefault();
  }, { passive: false });
  document.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].indexOf(e.key) >= 0) e.preventDefault();
    if (e.key === 'Escape' && UI.current === 'hud' && !UI.modalOpen) UI.openPause();
  });

  // Звук выключается, когда вкладка скрыта
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) Sound.mute('hidden'); else Sound.unmute('hidden');
  });
  const unlock = () => Sound.unlock();
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);

  async function boot() {
    await SDK.init();
    I18N.set(SDK.lang);
    SDK.onPause = () => { Sound.mute('sdk'); SDK.gameplayStop(); };
    SDK.onResume = () => {
      Sound.unmute('sdk');
      if (UI.current === 'hud' && !UI.modalOpen && Game.state !== 'over') SDK.gameplayStart();
    };
    await Save.load();
    Sound.setSfx(Save.data.sound);
    Sound.sfxOn = Save.data.sound;
    Sound.musicOn = Save.data.music;
    UI.init();
    Game.init(document.getElementById('game'));
    UI.showMenu();
    document.getElementById('loading').classList.remove('show');
    SDK.ready();
  }
  boot();
})();
