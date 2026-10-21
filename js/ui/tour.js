// Tarāz first-run tour: 4 skippable, reopenable steps (paste → preset → check → copy); spotlight + focus trap.
(function (T) {
  'use strict';
  var h = T.h, UK = 'taraz.ui.v1', p = function (k, a) { return T.pt ? T.pt(k, a) : k; };
  var STEPS = [{ k: 's1', m: 'in', sel: ['#sheet-in .tz-ta', '#sheet-in'] }, { k: 's2', sel: ['#tz-preset-slot', '#tz-settings-btn'], full: true },
    { k: 's3', m: 'out', sel: ['#sheet-out'] }, { k: 's4', sel: ['.tz-primary'] }];
  var root, spot, card, ttl, txt, cnt, bBack, bNext, i = 0, prev = null, inerted = [], raf = 0, inited = false;
  function rm() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function seen() { return (T.lsGet(UK, {}) || {}).tour === 'done'; }
  function mark() { var u = T.lsGet(UK, {}) || {}; u.tour = 'done'; T.lsSet(UK, u); }
  function vis(n) { if (!n) return false; var r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function target(s) {
    for (var j = 0; j < s.sel.length; j++) { var n = document.querySelector(s.sel[j]); if (vis(n) && (!s.full || j > 0 || n.children.length)) return n; }
    return null;
  }
  function mob(m) { var b = m && document.querySelector('.tz-mtabs [data-m="' + m + '"]'); if (vis(b)) b.click(); }
  function place() {
    raf = 0; if (!root) return;
    var n = target(STEPS[i]), W = innerWidth, H = innerHeight, cw = card.offsetWidth, ch = card.offsetHeight, x, y, r, t, l, b, rr;
    root.classList.toggle('dim', !n); spot.hidden = !n;
    if (!n) { x = (W - cw) / 2; y = (H - ch) / 2; }
    else {
      r = n.getBoundingClientRect(); t = Math.max(4, r.top - 6); l = Math.max(4, r.left - 6); b = Math.min(H - 4, r.bottom + 6); rr = Math.min(W - 4, r.right + 6);
      Object.assign(spot.style, { top: t + 'px', left: l + 'px', width: Math.max(0, rr - l) + 'px', height: Math.max(0, b - t) + 'px' });
      y = b + 12 + ch <= H ? b + 12 : t - 12 - ch >= 0 ? t - 12 - ch : H - ch - 8;
      x = Math.min((l + rr) / 2 - cw / 2, W - cw - 8);
    }
    card.style.top = Math.max(8, y) + 'px'; card.style.left = Math.max(8, x) + 'px';
  }
  function sched() { if (!raf) raf = requestAnimationFrame(place); }
  function show(k) {
    i = Math.max(0, Math.min(STEPS.length - 1, k)); var s = STEPS[i], n;
    mob(s.m);
    ttl.textContent = p('tour.' + s.k + '.t'); txt.textContent = p('tour.' + s.k + '.b'); cnt.textContent = p('tour.step', { i: i + 1, n: STEPS.length });
    bBack.disabled = i === 0; bNext.textContent = p(i === STEPS.length - 1 ? 'tour.done' : 'tour.next');
    n = target(s); if (n) n.scrollIntoView({ block: 'nearest', behavior: rm() ? 'auto' : 'smooth' });
    place(); setTimeout(place, rm() ? 0 : 320); bNext.focus();
  }
  function key(e) {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); stop(); return; }
    if (e.key !== 'Tab') return;
    var f = [].slice.call(card.querySelectorAll('button:not([disabled])')), a = f.indexOf(document.activeElement);
    if (!f.length) return; e.preventDefault(); f[(a + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
  }
  function inertAll(on) {
    if (on) { inerted = [].slice.call(document.body.children).filter(function (n) { return n !== root && n.tagName !== 'SCRIPT' && !n.inert; }); inerted.forEach(function (n) { n.inert = true; }); }
    else { inerted.forEach(function (n) { n.inert = false; }); inerted = []; }
  }
  function btn(k, fn, c) { return h('button', { type: 'button', class: 'tz-btn' + (c ? ' ' + c : ''), onclick: fn }, p(k)); }
  /** Open the tour; false when already open or the UI has not booted. */
  function start() {
    if (root || !document.querySelector('.tz-dock')) return false;
    var U = T.get('ui'); if (U && U.drawer) U.drawer(false);
    prev = document.activeElement;
    ttl = h('h2', { id: 'tz-tour-t', class: 'tz-tour-h' }); txt = h('p', { id: 'tz-tour-b' }); cnt = h('span', { class: 'tz-tour-n', 'aria-live': 'polite' });
    bBack = btn('tour.back', function () { show(i - 1); });
    bNext = h('button', { type: 'button', class: 'tz-btn tz-tour-next', onclick: function () { if (i >= STEPS.length - 1) stop(); else show(i + 1); } });
    card = h('div', { class: 'tz-tour-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tz-tour-t', 'aria-describedby': 'tz-tour-b' },
      cnt, ttl, txt, h('div', { class: 'tz-tour-row' }, btn('tour.skip', stop), h('span', { class: 'tz-tour-gap' }), bBack, bNext));
    spot = h('div', { class: 'tz-tour-spot', 'aria-hidden': 'true' });
    root = h('div', { class: 'tz-tour', onkeydown: key }, spot, card);
    document.body.appendChild(root); inertAll(true);
    addEventListener('resize', sched); addEventListener('scroll', sched, true);
    show(0); return true;
  }
  /** Close the tour (marks it seen) and restore focus. */
  function stop() {
    if (!root) return; mark(); inertAll(false);
    removeEventListener('resize', sched); removeEventListener('scroll', sched, true);
    root.remove(); root = null; mob('in');
    var f = prev && document.contains(prev) && prev !== document.body ? prev : document.getElementById('tz-tour-btn'); if (f && f.focus) f.focus();
  }
  function init() {
    if (inited) return; inited = true;
    var tools = document.querySelector('.tz-tools');
    if (tools && !document.getElementById('tz-tour-btn') && !document.getElementById('tz-help-btn')) {
      tools.insertBefore(h('button', { type: 'button', class: 'tz-btn', id: 'tz-tour-btn', 'aria-label': p('tour.open'), title: p('tour.open'), onclick: start },
        T.icon ? T.icon('sample', 18) : '', h('span', { class: 'l2' }, p('tour.open'))), tools.lastChild);
    }
    if (!seen() && !/[?&]notour\b/.test(location.search)) setTimeout(function () { if (!document.querySelector('dialog[open],.tz-pal')) start(); }, 500);
  }
  T.register('tour', { start: start, stop: stop, isOpen: function () { return !!root; }, steps: function () { return STEPS.map(function (s) { return s.k; }); },
    reset: function () { var u = T.lsGet(UK, {}) || {}; delete u.tour; T.lsSet(UK, u); } });
  if (document.querySelector('.tz-dock')) init(); else T.on('ui:ready', init);
})(window.Taraz = window.Taraz || {});
