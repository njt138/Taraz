// Tarāz engine: per-token direction overrides + rejected-change exceptions (no DOM). Load right after textedit.js.
(function (T) {
  'use strict';
  var E = T.get('engine') || T.register('engine', {}), ov = {}, ids = {}, nIds = 0, rej = [], tx = E.tx;
  /** Force a token's direction. id = Inline.id (any recent result) or Inline.meta.ok key; mode 'ltr'|'rtl'; 'auto'/null removes. */
  E.setOverride = function (id, mode) { var k = ids[id] || id; if (!k) return false; if (mode === 'ltr' || mode === 'rtl') ov[k] = mode; else delete ov[k]; return true; };
  E.getOverride = function (id) { return ov[ids[id] || id] || null; };
  E.overrides = function () { return Object.assign({}, ov); };
  E.clearOverrides = function () { ov = {}; };
  if (E.addTransform) E.addTransform({
    id: 'override', order: 95, fn: function (ctx) {
      var seen = {}, u = ctx.util || {}, uid = u.uid || function () { return 'ov' + Math.random().toString(36).slice(2); };
      var each = u.each || function (fn) { ctx.blocks.forEach(function (b, bi) { (E.inlineLists ? E.inlineLists(b) : [b.inlines || []]).forEach(function (L) { fn(L, b, bi); }); }); };
      if (nIds > 50000) { ids = {}; nIds = 0; }
      each(function (list, block, bi) {
        list.forEach(function (x) {
          if (!x || (x.meta && x.meta.marker)) return;
          var b = x.k + ':' + x.s, k = b + '@' + (seen[b] = (seen[b] || 0) + 1), m = ov[k];
          ids[x.id] = k; nIds++; x.meta = x.meta || {}; x.meta.ok = k;
          if (!m) return;
          x.meta.ov = m; x.dir = m;
          if (!x.protected) { if (m === 'ltr' && x.k === 'text') x.k = 'ltr'; else if (m === 'rtl' && x.k === 'ltr') x.k = 'text'; }
          ctx.changes.push({ id: uid(), type: 'override', ruleId: 'override.' + m, before: x.s, after: x.s, blockIndex: bi, key: k });
        });
      });
    }
  });
  function rk(r) { return r.ruleId + '\u0001' + (r.before == null ? '*' : r.before + '\u0001' + r.after); }
  function hit(id, sn) { return rej.some(function (r) { return r.ruleId === id && (r.before == null || (r.before === sn[0] && r.after === sn[1])); }); }
  if (tx && typeof tx.set === 'function' && !tx.set._rej) {
    var set0 = tx.set;
    tx.set = function (ctx, x, bi, type, rule, s2) {
      if (rej.length && x && s2 !== x.s) {
        var sn; try { sn = tx.snip ? tx.snip(x.s, s2) : [x.s, s2]; } catch (e) { sn = [x.s, s2]; }
        if (hit(type + '.' + rule, sn)) return false;
      }
      return set0.apply(this, arguments);
    };
    tx.set._rej = 1;
  }
  /** 'override' | 'rule' | false — how a Change can be rejected. */
  E.canReject = function (c) {
    if (!c) return false;
    if (c.type === 'override') return c.key ? 'override' : false;
    if (/^(strip-bidi|math-linear)$/.test(c.type) || !tx || !tx.set || !tx.set._rej || !/^[a-z-]+\.[a-z0-9-]+$/.test(c.ruleId || '')) return false;
    return 'rule';
  };
  /** Add an exception from a Change (all=true: whole rule); caller re-processes. Returns bool. */
  E.reject = function (c, all) {
    var w = E.canReject(c); if (!w) return false;
    if (w === 'override') return E.setOverride(c.key, 'auto');
    var r = all ? { ruleId: c.ruleId, before: null, after: null } : { ruleId: c.ruleId, before: String(c.before), after: String(c.after) };
    if (!rej.some(function (q) { return rk(q) === rk(r); })) rej.push(r);
    return true;
  };
  E.unreject = function (r) { rej = rej.filter(function (q) { return rk(q) !== rk(r); }); };
  E.rejections = function () { return rej.map(function (r) { return Object.assign({}, r); }); };
  E.clearRejections = function () { rej = []; };
  /** true when (ruleId, before, after) matches a rejection; for rules that record Changes without tx.set. */
  E.isRejected = function (ruleId, before, after) { return rej.length > 0 && hit(ruleId, [String(before), String(after)]); };
})(window.Taraz = window.Taraz || {});
