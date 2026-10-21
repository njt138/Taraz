// Tarāz UI: output-safety tab, invisible-character visualizer, shortcuts (?), compatibility notes, in-app self-test.
(function (T) {
  'use strict';
  const h = T.h, v = (k, a) => T.vt(k, a), CAP = 20000;
  const INV = { 0xAD: 'SHY', 0x61C: 'ALM', 0xA0: 'NBSP', 0x2009: 'THIN', 0x202F: 'NNBSP', 0x200B: 'ZWSP', 0x200C: 'ZWNJ', 0x200D: 'ZWJ', 0x200E: 'LRM', 0x200F: 'RLM',
    0x202A: 'LRE', 0x202B: 'RLE', 0x202C: 'PDF', 0x202D: 'LRO', 0x202E: 'RLO', 0x2066: 'LRI', 0x2067: 'RLI', 0x2068: 'FSI', 0x2069: 'PDI', 0xFEFF: 'BOM' };
  const BAD = /^(LRE|RLE|PDF|LRO|RLO|LRI|RLI|FSI|PDI|ZWSP|BOM)$/, OKN = /^(ZWNJ|RLM|LRM)$/;
  const btn = (l, fn) => h('button', { type: 'button', class: 'tz-btn', onclick: fn }, l), ph = s => h('p', { class: 'tz-ph' }, s);
  /** Split text into visualizer tokens: {s} or {s,name,sev:'error'|'warn'|'info'}. */
  function tokens(s) {
    const out = []; let buf = ''; s = String(s || '');
    for (let i = 0; i < s.length; i++) {
      const n = INV[s.charCodeAt(i)];
      if (!n) { buf += s[i]; continue; }
      if (buf) { out.push({ s: buf }); buf = ''; }
      out.push({ s: s[i], name: n, sev: BAD.test(n) ? 'error' : OKN.test(n) ? 'info' : 'warn' });
    }
    if (buf) out.push({ s: buf });
    return out;
  }
  /** Render text into el with invisibles shown as labeled tokens. */
  function viz(el, s) {
    el.textContent = '';
    tokens(s).forEach(t => el.appendChild(t.name ? h('span', { class: 'tz-inv', 'data-s': t.sev, title: 'U+' + t.s.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') }, '‹' + t.name + '›') : document.createTextNode(t.s)));
  }
  function dlg(title, body) {
    const d = h('dialog', { class: 'tz-dlg', 'aria-label': title },
      h('div', { class: 'tz-sh' }, h('h2', null, title), h('button', { type: 'button', class: 'tz-btn icon', 'aria-label': v('v.close'), onclick: () => d.close() }, T.icon ? T.icon('x', 18) : '×')),
      h('div', { class: 'tz-dlgb' }, body));
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    document.body.appendChild(d); if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    return d;
  }
  const KEYS = [['Ctrl+Enter', 'primary'], ['Ctrl+Shift+C', 'word'], ['Ctrl+Shift+P', 'ppt'], ['Ctrl+K', 'pal'], ['Esc', 'esc'], ['?', 'help'], ['← →', 'tabs']];
  function shortcuts() { return dlg(v('v.k.title'), h('table', { class: 'tz-keys' }, KEYS.map(k => h('tr', null, h('td', null, h('kbd', { dir: 'ltr' }, k[0])), h('td', null, v('v.k.' + k[1])))))); }
  function compat() {
    let dd;
    const keys = (p, n) => Array.from({ length: n }, (_, i) => 'v.c.' + p + (i + 1)), L = (tag, ks) => h(tag, null, ks.map(k => h('li', null, v(k))));
    const sample = key => {
      const s = v(key);
      return h('div', { class: 'tz-samp' }, h('pre', { dir: 'auto' }, s), h('div', { class: 'tz-io' },
        btn(v('v.c.load'), () => { const e = T.get('ui.editor'); if (e) { e.set(s); dd.close(); } }), btn(v('v.c.copy'), () => T.copyText(s, T.get('ui')))));
    };
    dd = dlg(v('v.c.title'), [h('p', { class: 'tz-warn' }, v('v.c.disc')), h('h3', null, v('v.c.notes')), L('ul', keys('n', 5)), h('h3', null, v('v.c.proc')), L('ol', keys('s', 6)),
      h('h4', null, v('v.c.sp')), sample('v.c.sampleP'), h('h4', null, v('v.c.sf')), sample('v.c.sampleF'), h('h3', null, v('v.c.exp')), L('ul', keys('e', 5))]);
    return dd;
  }
  function allTests() {
    let L = typeof T.getTests === 'function' ? T.getTests() : (T.tests || T._tests || []);
    if (L && !Array.isArray(L)) L = Object.values(L);
    return (L || []).filter(x => x && (typeof x.run === 'function' || typeof x.fn === 'function'));
  }
  /** Run one test -> Promise<{ok,msg}>: run() must return true (string = failure); else fn() vs expect (JSON) or true. */
  function runOne(x) {
    const useRun = typeof x.run === 'function';
    return Promise.resolve().then(() => (useRun ? x.run : x.fn).call(x)).then(r => {
      const ok = useRun || !('expect' in x) ? r === true : JSON.stringify(r) === JSON.stringify(x.expect);
      return { ok, msg: ok ? '' : typeof r === 'string' ? r : String(JSON.stringify(r)) };
    }, e => ({ ok: false, msg: String((e && e.message) || e) }));
  }
  /** Run all registered tests sequentially -> {pass,fail,results:[{t,ok,msg}]}; onStep(i,n). */
  async function runTests(onStep) {
    const L = allTests(), out = [];
    for (let i = 0; i < L.length; i++) {
      out.push(Object.assign({ t: L[i] }, await runOne(L[i])));
      if (i % 20 === 19) { if (onStep) onStep(i + 1, L.length); await new Promise(r => setTimeout(r, 0)); }
    }
    return { pass: out.filter(r => r.ok).length, fail: out.filter(r => !r.ok).length, results: out };
  }
  function selftest() {
    const st = h('p', { role: 'status' }), res = h('div'), fo = h('input', { type: 'checkbox', onchange: () => draw() }); let last = null, busy = false;
    function draw() {
      res.textContent = ''; if (!last) return; const g = {};
      last.results.forEach(r => { const k = r.t.group || '—'; (g[k] = g[k] || []).push(r); });
      Object.keys(g).forEach(k => {
        const L = g[k], f = L.filter(r => !r.ok); if (fo.checked && !f.length) return;
        const d = h('details', { class: 'tz-tg' + (f.length ? ' bad' : '') }, h('summary', null, k + ' — ' + T.fa(L.length - f.length) + '/' + T.fa(L.length)),
          (fo.checked ? f : L).map(r => h('div', { class: 'tz-tr', 'data-ok': String(r.ok) }, h('span', null, (r.ok ? '✓ ' : '✗ ') + (r.t.name || r.t.id)), r.ok ? '' : h('code', { dir: 'ltr' }, r.msg))));
        d.open = !!f.length; res.appendChild(d);
      });
    }
    function go() {
      const n = allTests().length; if (busy) return;
      if (!n) { st.textContent = v('v.t.none'); return; }
      busy = true; st.textContent = v('v.t.running', { i: 0, n });
      runTests((i, m) => { st.textContent = v('v.t.running', { i, n: m }); }).then(r => { busy = false; last = r; st.textContent = v('v.t.res', { p: r.pass, f: r.fail, n: r.pass + r.fail }); draw(); });
    }
    const d = dlg(v('v.t.title'), [h('div', { class: 'tz-io' }, btn(v('v.t.run'), go), h('label', null, fo, ' ' + v('v.t.failOnly'))), st, res]);
    go(); return d;
  }
  function plain(s) { const Z = T.get('serialize'); try { return Z && s.result ? Z.toPlain(s.result, s.settings) : ''; } catch (e) { return ''; } }
  function mount(c, ctx) {
    let src = 'out', st = null;
    const sum = h('div', { class: 'tz-sfsum', role: 'status' }), list = h('ol', { class: 'tz-sfl' }), vz = h('div', { class: 'tz-viz', dir: 'auto' }), cap = h('p', { class: 'tz-warn' });
    const seg = h('div', { class: 'tz-seg', role: 'radiogroup', 'aria-label': v('v.s.viz') }, ['out', 'in'].map(m => h('button', { type: 'button', role: 'radio', 'data-m': m, onclick: () => { src = m; update(st); } }, v('v.s.' + m))));
    c.appendChild(h('div', { class: 'tz-sf' }, h('div', { class: 'tz-sfbar' }, btn(v('v.k.title'), shortcuts), btn(v('v.c.title'), compat), btn(v('v.t.title'), selftest)),
      sum, list, h('h4', null, v('v.s.viz')), seg, cap, vz));
    function update(s) {
      st = s; sum.textContent = ''; list.textContent = ''; cap.textContent = '';
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.getAttribute('data-m') === src)));
      const r = s && s.result, Sf = T.get('engine.safety');
      if (!r) sum.appendChild(ph(v('v.empty')));
      else if (!Sf) sum.appendChild(ph(T.ut('ui.notInstalled')));
      else {
        let L = []; try { L = Sf.scanResult(r) || []; } catch (e) { }
        const m = Sf.summary(L);
        sum.append(T.level(m.errors ? 'bad' : m.warnings ? 'warn' : 'ok'), h('span', null, m.total ? v('v.s.sum', { e: m.errors, w: m.warnings }) : v('v.s.ok')));
        L.slice(0, 300).forEach(x => list.appendChild(h('li', { class: 'tz-sfi', 'data-s': x.severity }, h('span', { class: 'tz-tag' }, x.name || '?'),
          h('code', { dir: 'ltr' }, typeof x.code === 'number' ? 'U+' + x.code.toString(16).toUpperCase().padStart(4, '0') : String(x.code || '')),
          h('small', { class: 'tz-muted' }, v('v.s.pos', { l: x.line, c: x.col })), h('span', null, x.explain || ''))));
        if (L.length > 300) list.appendChild(h('li', { class: 'tz-muted' }, v('v.s.more', { n: L.length - 300 })));
      }
      let txt = src === 'out' ? plain(s) : (s && s.input) || '';
      if (txt.length > CAP) { cap.textContent = v('v.s.cap', { n: CAP }); txt = txt.slice(0, CAP); }
      viz(vz, txt);
    }
    return { update };
  }
  T.register('ui.dialogs', { tokens, viz, shortcuts, compat, selftest, runTests, runOne, allTests });
  T.register('ui.safety', { mount });
  T.viewTab('safety', mount);
})(window.Taraz = window.Taraz || {});