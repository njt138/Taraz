// Tarāz UI: formula cards — lazy KaTeX preview, badges, confidence meter, issues, A/B/keep switch, copy.
(function (T) {
  'use strict';
  const h = T.h, v = (k, a) => T.vt(k, a), KV = '0.16.11', CDN = 'https://cdn.jsdelivr.net/npm/katex@' + KV + '/dist/katex.min';
  const DL = { '$': '$…$', '$$': '$$…$$', '\\(': '\\(…\\)', '\\[': '\\[…\\]', env: '\\begin{…}', bracket: '[…]', paren: '(…)', bare: '—' };
  let kp = null;
  /** Lazy-load pinned KaTeX once; resolves window.katex or null (offline). */
  function katex() {
    if (window.katex) return Promise.resolve(window.katex);
    if (!kp) kp = new Promise(res => {
      if (!document.querySelector('link[data-tz-katex]')) document.head.appendChild(h('link', { rel: 'stylesheet', href: CDN + '.css', crossorigin: 'anonymous', 'data-tz-katex': '1' }));
      let p; try { p = T.loadScript(CDN + '.js'); } catch (e) { p = Promise.reject(e); }
      Promise.resolve(p).then(() => res(window.katex || null), () => { kp = null; res(null); });
    });
    return kp;
  }
  function tt(k) { let s; try { s = T.t && T.t(k); } catch (e) { } return s && s !== k ? s : k.split('.').pop(); }
  function render(el, f) {
    katex().then(k => {
      if (!k) { el.classList.add('off'); return; }
      try { const d = h('div'); k.render(f.tex || '', d, { displayMode: !!f.display, throwOnError: false, trust: false, strict: 'ignore' }); el.textContent = ''; el.appendChild(d); }
      catch (e) { el.classList.add('off'); }
    });
  }
  /** Output text of a formula for each mode: {A, B (null if unsafe), keep}. */
  function outs(f, S) {
    const L = T.get('math.latex'), N = T.get('math.linear'), o = { A: f.src, B: null, keep: f.src };
    try { o.A = f.mode === 'A' && f.out != null ? f.out : L ? L.clean(f.src, S).out : f.src; } catch (e) { }
    try { if (f.mode === 'B' && f.out != null) o.B = f.out; else if (N) { const r = N.convert(f.src, S); o.B = r.safe ? r.out : null; } } catch (e) { }
    return o;
  }
  const curOut = (f, o) => o[f.mode || 'keep'] != null ? o[f.mode || 'keep'] : f.src;
  const btn = (l, fn) => h('button', { type: 'button', class: 'tz-btn', onclick: fn }, l);
  function card(f, o, S, ctx) {
    const D = T.get('math.detect'), mode = f.mode || 'keep', conf = Math.round(+f.confidence || 0), low = conf < (+S.mathMinConf || 0);
    const pv = h('div', { class: 'tz-fpv', dir: 'ltr' }, h('code', null, f.tex || f.src || '')); render(pv, f);
    const seg = h('div', { class: 'tz-seg', role: 'radiogroup', 'aria-label': v('v.f.mode') });
    ['A', 'B', 'keep'].forEach(m => {
      const b = h('button', { type: 'button', role: 'radio', 'aria-checked': String(mode === m), onclick: () => { D.setOverride(f.id, { mode: m }); ctx.process(); } }, v('v.f.' + m));
      b.disabled = !D || (m === 'B' && o.B == null); seg.appendChild(b);
    });
    const rows = h('div', { class: 'tz-fo' }, h('div', { class: 'tz-fr' }, h('i', null, v('v.f.before')), h('code', { dir: 'ltr' }, f.src || '')),
      ['A', 'B', 'keep'].map(m => h('div', { class: 'tz-fr' + (m === mode ? ' on' : '') }, h('i', null, v('v.f.' + m)), h('code', { dir: 'ltr' }, o[m] == null ? v('v.f.unsafe') : o[m]))));
    const iss = (f.issues || []).map(x => { const p = String(x).split(':'); return tt('math.i.' + p[0]) + (p.length > 1 ? ' ' + p.slice(1).join(':') : ''); })
      .concat((f.warnings || []).map(w => tt('math.w.' + (w.code || w)) + (w.arg ? ' ' + w.arg : '')));
    return h('article', { class: 'tz-fcard' + (low ? ' low' : '') },
      h('div', { class: 'tz-fh' }, h('span', { class: 'tz-tag' }, v('v.f.delim') + ' ', h('bdi', { dir: 'ltr' }, DL[f.delim] || f.delim || '?')),
        h('span', { class: 'tz-tag' }, v(f.display ? 'v.f.display' : 'v.f.inline')),
        h('span', { class: 'tz-conf' }, v('v.f.conf'), h('meter', { min: 0, max: 100, low: 40, high: 75, optimum: 100, value: conf }), T.fa(conf) + '٪'),
        btn(v('v.f.copy'), () => T.copyText(curOut(f, o), ctx))),
      pv, low ? h('p', { class: 'tz-warn' }, v('v.f.low')) : '', seg, rows,
      iss.length ? h('ul', { class: 'tz-iss' }, iss.map(s => h('li', { dir: 'auto' }, s))) : '');
  }
  function mount(c, ctx) {
    let all = [];
    const top = h('div', { class: 'tz-fxbar' }, btn(v('v.f.copyAll'), () => T.copyText(all.join('\n'), ctx)),
      btn(v('v.f.reset'), () => { const D = T.get('math.detect'); if (D) { D.clearOverrides(); ctx.process(); } }));
    const note = h('p', { class: 'tz-warn', role: 'status' }), list = h('div', { class: 'tz-fxl' });
    c.appendChild(h('div', { class: 'tz-fx' }, top, note, list));
    function update(s) {
      list.textContent = ''; all = [];
      const r = s && s.result, F = (r && r.formulas) || [], S = ctx.getSettings() || {};
      top.hidden = !F.length;
      if (!r || !F.length) { list.appendChild(h('p', { class: 'tz-ph' }, v(r ? 'v.f.none' : 'v.empty'))); return; }
      if (!T.has('math.detect')) list.appendChild(h('p', { class: 'tz-ph' }, T.ut('ui.notInstalled')));
      F.forEach(f => { const o = outs(f, S); all.push(curOut(f, o)); list.appendChild(card(f, o, S, ctx)); });
      katex().then(k => { note.textContent = k ? '' : v('v.f.offline'); });
    }
    return { update };
  }
  T.register('ui.formulas', { mount, katex, outs });
  T.viewTab('formulas', mount);
})(window.Taraz = window.Taraz || {});
