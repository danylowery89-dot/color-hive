'use strict';
const Save = {
  KEY: 'hexastack_save_v1',
  data: null,
  _timer: 0,

  defaults() {
    return {
      v: 1,
      level: 1,               // следующий непройденный уровень
      coins: 100,
      boosters: { hammer: 1, move: 1, shuffle: 1 },
      intro: {},              // какие бустеры уже представлены
      best: 0,                // рекорд бесконечного режима
      dailyDone: 0,           // ключ даты пройденного испытания
      sound: true,
      music: true,
      tutorial: false,
      tutorial2: false
    };
  },

  merge(base, src) {
    if (!src || typeof src !== 'object') return base;
    for (const k in base) {
      if (!(k in src)) continue;
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) base[k] = this.merge(base[k], src[k]);
      else if (typeof src[k] === typeof base[k]) base[k] = src[k];
    }
    if (src.intro) base.intro = Object.assign({}, src.intro);
    return base;
  },

  async load() {
    let local = null, cloud = null;
    try { local = JSON.parse(localStorage.getItem(this.KEY)); } catch (e) {}
    try { cloud = await SDK.loadData(); } catch (e) {}
    let src = local;
    if (cloud && (!local || (cloud.level || 1) >= (local.level || 1))) src = cloud;
    this.data = this.merge(this.defaults(), src);
  },

  save(immediate) {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) {}
    clearTimeout(this._timer);
    if (immediate) SDK.saveData(this.data);
    else this._timer = setTimeout(() => SDK.saveData(this.data), 1500);
  }
};
