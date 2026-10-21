// Tarāz view-tab registry: ONE map (tab id → module/file), load-order-proof queue, fallbacks for view helpers.
(function (T) {
  'use strict';
  var ready = false, LS = {};
  /** Tab id → {mod, file}. The only place tab/module/file names are defined; app.js builds its tabs from it. */
  T.VIEW_TABS = {
    preview: { mod: 'ui.preview', file: 'js/ui/preview.js' },
    xray: { mod: 'ui.xray', file: 'js/ui/xray.js' },
    diff: { mod: 'ui.diff', file: 'js/ui/diff.js' },
    formulas: { mod: 'ui.formulas', file: 'js/ui/formulas.js' },
    safety: { mod: 'ui.safety', file: 'js/ui/dialogs.js' }
  };
  T.pendingTabs = T.pendingTabs || [];
  T.on('ui:ready', function () { ready = true; });
  /** Register a result tab from any file, before or after app.js: queued until boot, always emitted. */
  T.viewTab = function (id, mount, label) {
    if (!id || typeof mount !== 'function') return;
    var d = { id: id, mount: mount }; if (label) d.label = label;
    if (!ready) { T.pendingTabs = (T.pendingTabs || []).filter(function (x) { return x.id !== id; }); T.pendingTabs.push(d); }
    T.emit('ui:registerTab', d);
  };
  function pt(k, a) { return T.pt ? T.pt(k, a) : k + ' ' + JSON.stringify(a || {}); }
  /** Diagnostic text for a tab whose module is absent (err: mount/update exception). */
  T.tabMissing = function (id, err) {
    var d = T.VIEW_TABS[id] || { mod: 'ui.' + id, file: 'js/ui/' + id + '.js' }, nl = (window.__tzMissing || []).indexOf(d.file) >= 0;
    return pt(err ? 'tab.failed' : nl ? 'tab.notLoaded' : 'tab.missing', { m: d.mod, f: d.file, e: err ? String(err.message || err) : '' });
  };
  if (typeof T.vt !== 'function') T.vt = function (k, a) {
    var s; try { s = T.t ? T.t(k) : k; } catch (e) { s = k; } s = s == null ? k : String(s);
    return a ? s.replace(/\{(\w+)\}/g, function (m, x) { var v = a[x]; return v == null ? m : typeof v === 'number' && T.fa ? T.fa(v) : String(v); }) : s;
  };
  if (typeof T.copyText !== 'function') T.copyText = function (s, ctx) {
    var C = T.get('clipboard'), toast = ctx && ctx.toast, msg = function (k) { return T.ut ? T.ut(k) : k; };
    var p = C && C.writeText ? Promise.resolve(C.writeText(String(s))) : navigator.clipboard ? navigator.clipboard.writeText(String(s)) : Promise.reject(new Error('no clipboard'));
    return p.then(function (r) { var ok = !r || r.ok !== false; if (toast) toast(msg(ok ? 'ui.copied' : 'ui.copyFail'), ok ? 'ok' : 'err'); return ok; },
      function () { if (toast) toast(msg('ui.copyFail'), 'err'); return false; });
  };
  if (typeof T.loadScript !== 'function') T.loadScript = function (url) {
    if (!/^(https:\/\/(cdn\.jsdelivr\.net\/npm|cdnjs\.cloudflare\.com)\/|(\.\/)?vendor\/)/.test(url)) return Promise.reject(new Error('blocked url: ' + url));
    return LS[url] || (LS[url] = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = url; s.async = true; s.onload = res;
      s.onerror = function () { delete LS[url]; rej(new Error('load failed: ' + url)); }; document.head.appendChild(s);
    }));
  };
})(window.Taraz = window.Taraz || {});
