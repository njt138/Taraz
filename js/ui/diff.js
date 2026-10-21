// Tarāz UI: change review — before/after highlights, Persian explanations, type filters, accept/reject.
(function (T) {
  'use strict';
  const h = T.h, v = (k, a) => T.vt(k, a), MAX = 500;
  /** Split two strings into [prefix, removed, added, suffix]; never cuts a surrogate pair. */
  function charDiff(a, b) {
    a = a == null ? '' : String(a); b = b == null ? '' : String(b);
    let i = 0, j = 0; const la = a.length, lb = b.length;
    while (i < la && i < lb && a[i] === b[i]) i++;
    if (i && /[\uD800-\uDBFF]/.test(a[i - 1])) i--;
    while (j < la - i && j < lb - i && a[la - 1 - j] === b[lb - 1 - j]) j++;
    if (j && /[\uDC00-\uDFFF]/.test(a[la - j])) j--;
    return [a.slice(0, i), a.slice(i, la - j), b.slice(i, lb - j), a.slice(la - j)];
  }
  function vis(s) { const E = T.get('engine'); s = String(s || ''); try { if (E && E.tx && E.tx.vis) s = E.tx.vis(s); } catch (e) { } return s.replace(/\n/g, '↵'); }
  /** Persian explanation for a Change (rule → type → generic). */
  function explain(c) {
    let k = 'v.r.' + c.ruleId, s = v(k); if (s !== k) return s;
    k = 'v.r.' + c.type; s = v(k); return s !== k ? s : v('v.r._', { r: c.ruleId || c.type });
  }
  function tname(t) { const k = 'v.df.t.' + t, s = v(k); return s === k ? t : s; }
  const akey = c => [c.ruleId, c.before, c.after, c.blockIndex].join('\u0001');
  const btn = (l, fn, cls) => h('button', { type: 'button', class: 'tz-btn' + (cls ? ' ' + cls : ''), onclick: fn }, l);
  function mount(c, ctx) {
    const E = T.get('engine'), acc = {}; let filt = 'all', cur = null;
    const bar = h('div', { class: 'tz-dfbar', role: 'group', 'aria-label': v('v.df.all') }), rj = h('div', { class: 'tz-dfr' }), list = h('div', { class: 'tz-dfl' });
    c.appendChild(h('div', { class: 'tz-df' }, bar, rj, list));
    const rerun = () => ctx.process();
    function row(x) {
      const d = charDiff(x.before, x.after), can = E && E.canReject ? E.canReject(x) : false, act = h('div', { class: 'tz-dact' });
      if (acc[akey(x)]) act.appendChild(h('span', { class: 'tz-badge ok' }, v('v.df.accepted')));
      else {
        act.appendChild(btn(v('v.df.accept'), () => { acc[akey(x)] = 1; update(cur); }));
        if (can) {
          act.appendChild(btn(v('v.df.reject'), () => { if (E.reject(x)) rerun(); }));
          if (can === 'rule') act.appendChild(btn(v('v.df.never'), () => { if (E.reject(x, true)) rerun(); }));
        } else if (x.type === 'math-linear') act.appendChild(btn(v('v.df.toF'), () => { const u = T.get('ui'); if (u) u.activate('formulas'); }));
        else act.appendChild(h('small', { class: 'tz-muted' }, v('v.df.noRej')));
      }
      const head = h('div', { class: 'tz-dh' }, h('span', { class: 'tz-tag' }, tname(x.type)), h('span', { class: 'tz-dx' }, explain(x)),
        h('small', { class: 'tz-muted' }, v('v.x.block') + ' ' + T.fa((x.blockIndex | 0) + 1)));
      if (x.type === 'override') return h('div', { class: 'tz-drow', 'data-t': x.type }, head, h('div', { class: 'tz-dv' }, h('i', null, '«»'), h('span', { dir: 'auto' }, vis(x.before))), act);
      return h('div', { class: 'tz-drow', 'data-t': x.type }, head,
        h('div', { class: 'tz-dv' }, h('i', null, v('v.df.before')), h('span', { dir: 'auto' }, vis(d[0]), h('del', null, vis(d[1]) || '∅'), vis(d[3]))),
        h('div', { class: 'tz-dv' }, h('i', null, v('v.df.after')), h('span', { dir: 'auto' }, vis(d[0]), h('ins', null, vis(d[2]) || '∅'), vis(d[3]))), act);
    }
    function update(s) {
      cur = s; bar.textContent = ''; list.textContent = ''; rj.textContent = '';
      const r = s && s.result, ch = (r && r.changes) || [], R = E && E.rejections ? E.rejections() : [];
      if (R.length) rj.append(h('h4', null, v('v.df.rejected')), ...R.map(q => h('span', { class: 'tz-chip', dir: 'auto' },
        q.ruleId + (q.before == null ? ' (' + v('v.df.never') + ')' : ': ' + vis(q.before) + ' → ' + vis(q.after)),
        h('button', { type: 'button', title: v('v.df.restore'), 'aria-label': v('v.df.restore'), onclick: () => { E.unreject(q); rerun(); } }, '×'))));
      if (!r) { list.appendChild(h('p', { class: 'tz-ph' }, v('v.empty'))); return; }
      if (!ch.length) { list.appendChild(h('p', { class: 'tz-ph' }, v('v.df.none'))); return; }
      const cnt = {}; ch.forEach(x => { cnt[x.type] = (cnt[x.type] || 0) + 1; });
      if (filt !== 'all' && !cnt[filt]) filt = 'all';
      ['all'].concat(Object.keys(cnt)).forEach(tp => bar.appendChild(h('button', { type: 'button', class: 'tz-fchip', 'aria-pressed': String(filt === tp), onclick: () => { filt = tp; update(cur); } },
        (tp === 'all' ? v('v.df.all') : tname(tp)) + ' ' + T.fa(tp === 'all' ? ch.length : cnt[tp]))));
      const shown = ch.filter(x => filt === 'all' || x.type === filt);
      shown.slice(0, MAX).forEach(x => list.appendChild(row(x)));
      if (shown.length > MAX) list.appendChild(h('p', { class: 'tz-ph' }, v('v.x.cap', { n: MAX })));
    }
    return { update };
  }
  T.register('ui.diff', { mount, charDiff, explain });
  T.viewTab('diff', mount);
})(window.Taraz = window.Taraz || {});
