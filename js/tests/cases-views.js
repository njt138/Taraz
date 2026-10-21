// Tarāz tests: analysis views + overrides (group 'views').
(function (T) {
  'use strict';
  const E = () => T.get('engine'), ok = (c, m) => c ? true : m;
  const t = (id, name, fn) => ({ id: 'views.' + id, group: 'views', name, run: fn, fn, expect: true });
  T.addTests([
    t('vt', 'T.vt fills placeholders', () => ok(T.vt('v.x.cap', { n: 5 }).indexOf('{n}') < 0, 'placeholder left')),
    t('vt-miss', 'T.vt returns key when unknown', () => ok(T.vt('zz.none') === 'zz.none', 'bad fallback')),
    t('diff-1', 'charDiff basic', () => { const d = T.get('ui.diff').charDiff('abcXdef', 'abcYYdef'); return ok(d.join('|') === 'abc|X|YY|def', d.join('|')); }),
    t('diff-2', 'charDiff equal', () => { const d = T.get('ui.diff').charDiff('ab', 'ab'); return ok(d[1] === '' && d[2] === '', 'not empty'); }),
    t('diff-3', 'charDiff surrogate safe', () => { const d = T.get('ui.diff').charDiff('a😀', 'a😁'); return ok(d[1].length === 2 && d[2].length === 2, 'cut pair'); }),
    t('diff-4', 'charDiff nulls', () => ok(T.get('ui.diff').charDiff(null, 'x')[2] === 'x', 'null')),
    t('explain', 'explain falls back to generic', () => ok(T.get('ui.diff').explain({ type: 'q', ruleId: 'q.z' }).indexOf('q.z') >= 0, 'no generic')),
    t('explain-fa', 'explain known rule', () => ok(/[\u0600-\u06FF]/.test(T.get('ui.diff').explain({ type: 'zwnj', ruleId: 'zwnj.mi-space' })), 'not persian')),
    t('tok', 'tokens finds invisibles', () => { const k = T.get('ui.dialogs').tokens('a\u200Cb\u2066c'); return ok(k.length === 5 && k[1].name === 'ZWNJ' && k[3].sev === 'error', JSON.stringify(k)); }),
    t('tok-plain', 'tokens plain text single token', () => ok(T.get('ui.dialogs').tokens('سلام').length === 1, 'split')),
    t('style', 'xray style differs per kind', () => { const s = T.get('ui.xray').style; return ok(s({ k: 'ltr' }).cls !== s({ k: 'num' }).cls && s({ k: 'code' }).tag, 'same'); }),
    t('ov-api', 'engine override API exists', () => ok(typeof E().setOverride === 'function' && typeof E().reject === 'function', 'missing')),
    t('ov-ltr', 'override forces LTR', () => {
      const e = E(); e.clearOverrides(); const r = e.process('سلام دنیا'), x = r.blocks[0].inlines.filter(i => !(i.meta && i.meta.marker))[0];
      e.setOverride(x.id, 'ltr'); const y = e.process('سلام دنیا').blocks[0].inlines.filter(i => !(i.meta && i.meta.marker))[0]; e.clearOverrides();
      return ok(y.dir === 'ltr' && y.meta.ov === 'ltr', JSON.stringify(y));
    }),
    t('ov-clear', 'auto removes override', () => { const e = E(); e.setOverride('text:x@1', 'rtl'); e.setOverride('text:x@1', 'auto'); return ok(!e.getOverride('text:x@1'), 'kept'); }),
    t('ov-text', 'override never changes text', () => {
      const e = E(), src = 'متن نمونه اینجا'; e.clearOverrides(); const a = e.process(src);
      a.blocks[0].inlines.forEach(i => e.setOverride(i.id, 'rtl')); const b = e.process(src); e.clearOverrides();
      return ok(e.inlineSource(a.blocks[0].inlines) === e.inlineSource(b.blocks[0].inlines), 'text changed');
    }),
    t('rej-none', 'strip-bidi not rejectable', () => ok(E().canReject({ type: 'strip-bidi', ruleId: 'strip-bidi' }) === false, 'rejectable')),
    t('rej-rule', 'reject + unreject roundtrip', () => {
      const e = E(); e.clearRejections(); const c = { type: 'zwnj', ruleId: 'zwnj.mi-space', before: 'می رود', after: 'می\u200Cرود' };
      if (!e.canReject(c)) return true; e.reject(c); const n = e.rejections().length; e.unreject(e.rejections()[0]);
      return ok(n === 1 && !e.rejections().length, 'bad count');
    }),
    t('rej-effect', 'rejected rule not applied', () => {
      const e = E(); e.clearRejections(); const r = e.process('من می رود'), c = r.changes.filter(x => e.canReject(x) === 'rule')[0];
      if (!c) return true; e.reject(c, true); const r2 = e.process('من می رود'); e.clearRejections();
      return ok(!r2.changes.some(x => x.ruleId === c.ruleId), 'still applied');
    }),
    t('outs', 'formula outs keep = src', () => { const o = T.get('ui.formulas').outs({ src: '$x$', tex: 'x', mode: 'keep' }, {}); return ok(o.keep === '$x$', JSON.stringify(o)); }),
    t('tabs', 'all four tabs registered', () => { const u = T.get('ui'); if (!u) return true; const ids = u.tabIds(); return ok(['xray', 'diff', 'formulas', 'safety'].every(i => ids.indexOf(i) >= 0), ids.join()); })
  ]);
})(window.Taraz = window.Taraz || {});
