// Tarāz UI: Bidi X-ray — every Inline as a labeled, shaped chip; click to force LTR / RTL / auto.
(function (T) {
  'use strict';
  const h = T.h, v = (k, a) => T.vt(k, a), MAX = 2500, ARW = { rtl: '←', ltr: '→', neutral: '↔' };
  const KS = { text: ['t', ''], ltr: ['l', 'A'], num: ['n', '#'], code: ['c', '</>'], math: ['m', '∑'], link: ['u', '@'], b: ['k', 'B'], i: ['k', 'I'] };
  /** Chip look for an Inline: {cls, tag} (hue + underline/border shape + text tag; never color alone). */
  function style(x) { const k = KS[x && x.k] || KS.text; return { cls: 'tz-xc k-' + k[0], tag: k[1] }; }
  function vis(s) {
    const E = T.get('engine'); s = String(s || '').replace(/\n/g, '↵');
    if (E && E.tx && E.tx.vis) try { s = E.tx.vis(s); } catch (e) { }
    return s.length > 80 ? s.slice(0, 77) + '…' : s;
  }
  function mount(c, ctx) {
    const E = T.get('engine');
    if (!E || !E.process) { c.appendChild(h('p', { class: 'tz-ph' }, T.ut('ui.notInstalled'))); return {}; }
    let pop = null, can = false;
    const clr = h('button', { type: 'button', class: 'tz-btn', hidden: true, onclick: () => { E.clearOverrides(); ctx.process(); } }, v('v.x.clear'));
    const lg = h('div', { class: 'tz-xlg', role: 'note', 'aria-label': v('v.x.legend') },
      Object.keys(KS).filter(k => k !== 'i').map(k => { const s = style({ k }); return h('span', { class: s.cls }, h('b', { class: 'tz-xt' }, s.tag || '¶'), h('span', null, v('v.x.k.' + k))); }), clr);
    const body = h('div', { class: 'tz-xb' }), root = h('div', { class: 'tz-xr' }, lg, body);
    c.appendChild(root);
    function close(f) { if (!pop) return; const o = pop._o; pop.remove(); pop = null; if (f && o) o.focus(); }
    function open(el, x) {
      close(); const key = (x.meta && x.meta.ok) || x.id, cur = E.getOverride(key) || 'auto';
      pop = h('div', { class: 'tz-pop', role: 'dialog', 'aria-label': v('v.x.dir'), onkeydown: e => { if (e.key === 'Escape') { e.stopPropagation(); close(1); } } },
        h('div', { class: 'tz-pt', dir: 'auto' }, vis(x.s)), h('small', { class: 'tz-muted' }, v('v.x.rule') + ': ' + (x.rule || '—') + ' · ' + v('v.d.' + x.dir)),
        ['ltr', 'rtl', 'auto'].map(m => h('button', { type: 'button', class: 'tz-btn', 'aria-pressed': String(cur === m), onclick: () => { E.setOverride(key, m); close(); ctx.process(); } }, v('v.x.' + m))));
      pop._o = el; root.appendChild(pop);
      const r = el.getBoundingClientRect(), q = root.getBoundingClientRect();
      pop.style.top = (r.bottom - q.top + 6) + 'px';
      pop.style.left = Math.max(0, Math.min(r.left - q.left, q.width - pop.offsetWidth)) + 'px';
      pop.querySelector('button').focus();
    }
    document.addEventListener('pointerdown', e => { if (pop && !pop.contains(e.target) && !pop._o.contains(e.target)) close(); });
    function chip(x) {
      const s = style(x), mk = x.meta && x.meta.marker, o = x.meta && x.meta.ov;
      const tip = [v('v.x.k.' + x.k), v('v.x.rule') + ': ' + (x.rule || '—'), v('v.x.dir') + ': ' + v('v.d.' + x.dir)].concat(o ? [v('v.x.forced')] : []).join(' · ');
      const a = { class: s.cls + (o ? ' ov' : ''), title: tip, dir: x.dir === 'neutral' ? 'auto' : x.dir };
      if (can && !mk) { a.type = 'button'; a['aria-label'] = vis(x.s) + ' — ' + tip; a.onclick = e => open(e.currentTarget, x); }
      return h(a.type ? 'button' : 'span', a, h('b', { class: 'tz-xt', 'aria-hidden': 'true' }, s.tag + (mk ? (x.meta.on ? '▸' : '◂') : ARW[x.dir] || '')), mk ? '' : h('span', null, vis(x.s)));
    }
    function update(s) {
      close(); body.textContent = ''; const r = s && s.result; let n = 0;
      can = typeof E.setOverride === 'function'; clr.hidden = !can || !Object.keys(E.overrides()).length;
      if (!r || !r.blocks.length) { body.appendChild(h('p', { class: 'tz-ph' }, v('v.empty'))); return; }
      if (!can) body.appendChild(h('p', { class: 'tz-warn' }, v('v.x.noov')));
      r.blocks.some((b, bi) => {
        const row = h('div', { class: 'tz-xrow', dir: b.dir === 'ltr' ? 'ltr' : 'rtl' }, h('span', { class: 'tz-xbt' }, T.fa(bi + 1) + ' · ' + v('v.b.' + b.type) + ' · ' + v('v.d.' + b.dir)));
        (E.inlineLists ? E.inlineLists(b) : [b.inlines || []]).forEach((L, li) => {
          if (li) row.appendChild(h('span', { class: 'tz-xsep', 'aria-hidden': 'true' }, '¦'));
          L.forEach(x => { if (n++ < MAX) row.appendChild(chip(x)); });
        });
        body.appendChild(row); return n >= MAX;
      });
      if (n >= MAX) body.appendChild(h('p', { class: 'tz-ph' }, v('v.x.cap', { n: MAX })));
    }
    return { update };
  }
  T.register('ui.xray', { mount, style });
  T.viewTab('xray', mount);
})(window.Taraz = window.Taraz || {});
