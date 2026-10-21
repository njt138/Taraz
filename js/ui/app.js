// Tarāz UI shell: state, layout, stepper, tabs, dock, theme, shortcuts, toasts.
(function (T) {
  'use strict';
  var h = T.h, t = function (k) { return T.ut(k); }, fa = T.fa, UK = 'taraz.ui.v1', SK = 'taraz.settings.v1', NS = 'http://www.w3.org/2000/svg';
  var ST = { input: '', result: null, settings: {}, stale: false, copied: false, health: null, errs: 0, warns: 0, error: '' };
  var el = {}, tabs = [], inst = {}, cons = {}, cur = 'preview', ui = T.lsGet(UK, {}) || {}, ctx, busyT, dOpen = false, booted = false, mode = 'light', deb;
  var IC = {
    undo: 'M7 4 3 8l4 4M3 8h8a5 5 0 0 1 0 10h-3', redo: 'M13 4l4 4-4 4M17 8H9a5 5 0 0 0 0 10h3', trash: 'M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11',
    doc: 'M5 2h7l4 4v12H5zM12 2v4h4M8 11h5M8 14h5', slides: 'M3 4h14v9H3zM10 13v4M7 17h6', text: 'M4 5h12M10 5v11M7 16h6', orig: 'M4 5h12M4 10h12M4 15h8',
    sample: 'M5 3h10v14H5zM8 7h4M8 10h4M8 13h2', chev: 'M6 8l4 4 4-4', refresh: 'M16 10a6 6 0 1 1-2-4.5M16 3v4h-4',
    settings: 'M3 6h8M15 6h2M3 14h2M9 14h8M13 4v4M7 12v4',
    sun: 'M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M4.5 15.5l1.4-1.4M14.1 5.9l1.4-1.4',
    moon: 'M16 12A7 7 0 0 1 8 4a7 7 0 1 0 8 8z', contrast: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 3v14M10 3a7 7 0 0 1 0 14z',
    x: 'M5 5l10 10M15 5L5 15', check: 'M4 10l4 4 8-9', dl: 'M10 3v10M6 9l4 4 4-4M3 17h14'
  };

  /** Inline SVG icon (20px grid, 1.5px stroke). */
  T.icon = function (n, s) {
    var v = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
    [['viewBox', '0 0 20 20'], ['width', s || 20], ['height', s || 20], ['fill', 'none'], ['stroke', 'currentColor'], ['stroke-width', '1.5'], ['stroke-linecap', 'round'], ['stroke-linejoin', 'round'], ['aria-hidden', 'true']].forEach(function (a) { v.setAttribute(a[0], a[1]); });
    p.setAttribute('d', IC[n] || ''); v.appendChild(p); return v;
  };

  /** Bubble-level motif; state: idle|ok|warn|bad. */
  T.level = function (s, c) { return h('span', { class: 'tz-level' + (c ? ' ' + c : ''), 'data-s': s || 'idle', 'aria-hidden': 'true' }, h('i', { class: 'tz-lv' })); };
  function saveUI(k, v) { ui[k] = v; var u = T.lsGet(UK, {}) || {}; u[k] = v; T.lsSet(UK, u); }

  function toast(msg, type) {
    var n = h('div', { class: 'tz-toast ' + (type || 'info') }, msg); el.toasts.appendChild(n);
    while (el.toasts.children.length > 3) el.toasts.firstChild.remove();
    setTimeout(function () { n.classList.add('out'); setTimeout(function () { n.remove(); }, 260); }, type === 'err' ? 6000 : 3200);
  }

  function getSettings() {
    var S = T.get('settings'), r;
    try { if (S) r = (S.getAll && S.getAll()) || (S.all && S.all()) || (S.values && S.values()) || (typeof S.get === 'function' && S.get()); } catch (e) { }
    return r && typeof r === 'object' ? r : {};
  }

  /** Run an engine safely: {ok,result}|{ok:false,msg}. */
  function compute(text, S, E) {
    if (!E || typeof E.process !== 'function') return { ok: false, msg: t('ui.noEngine') };
    try {
      var r = E.process(text, S || {});
      if (!r || !Array.isArray(r.blocks)) throw new Error('invalid result');
      return { ok: true, result: r };
    } catch (e) {
      return { ok: false, msg: t('ui.err.process') + (e && e.message || e) };
    }
  }

  function health() {
    var r = ST.result, Sf = T.get('engine.safety');
    ST.health = typeof r.health === 'number' ? r.health : 100;
    ST.warns = (r.warnings || []).length;
    ST.errs = 0;
    try { if (Sf && Sf.scanResult) ST.errs = Sf.summary(Sf.scanResult(r)).errors || 0; } catch (e) { }
  }

  /** Process the current input; keeps the previous result on failure. */
  function process() {
    ST.settings = getSettings();
    if (!ST.input.trim()) { ST.result = null; ST.stale = false; ST.error = ''; refresh(); return false; }
    var c = compute(ST.input, ST.settings, T.get('engine'));
    if (!c.ok) { ST.error = c.msg; toast(c.msg, 'err'); refresh(); return false; }
    ST.result = c.result; ST.stale = false; ST.copied = false; ST.error = ''; health(); refresh(); return true;
  }

  function refresh() {
    var s = ST.result ? (ST.errs > 0 || ST.health < 60 ? 'bad' : (ST.stale || ST.health < 100 || ST.warns > 0 ? 'warn' : 'ok')) : 'idle',
      st = !ST.input.trim() ? 1 : ST.copied ? 3 : 2;
    [el.brandLv, el.pLv].forEach(function (n) { if (n) n.setAttribute('data-s', s); });
    el.steps.forEach(function (li, i) {
      if (i + 1 === st) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
      li.classList.toggle('done', i + 1 < st);
    });

    if (el.reviewStripInst && el.reviewStripInst.update) {
      el.reviewStripInst.update(ST);
    }

    var i = inst[cur];
    if (i && i.update) {
      try { i.update(ST); } catch (e) { }
    }
  }

  function miss(c, id, e) {
    var m = T.tabMissing ? T.tabMissing(id, e) : t('ui.notInstalled');
    c.appendChild(h('p', { class: 'tz-ph', 'data-missing': id }, m));
  }

  function find(id) {
    return tabs.filter(function (d) { return d.id === id; })[0];
  }

  var TECH_TABS = ['xray', 'diff', 'formulas', 'safety'];
  var TECH_TITLES = {
    xray: 'پرتو ایکس',
    diff: 'مقایسه تغییرات',
    formulas: 'فرمول‌ها',
    safety: 'ایمنی آفیس'
  };

  function renderTabs() {
    if (!el.tabs) return;
    el.tabs.textContent = '';

    var isPreview = cur === 'preview';
    var prevBtn = h('button', {
      type: 'button', role: 'tab', id: 'tz-tab-preview',
      class: 'tz-tab' + (isPreview ? ' active' : ''),
      'aria-selected': isPreview ? 'true' : 'false',
      'aria-controls': 'tz-pane-preview',
      onclick: function () { activate('preview'); }
    }, 'پیش‌نمایش متن');
    el.tabs.appendChild(prevBtn);

    var isTech = TECH_TABS.indexOf(cur) >= 0;
    var menuText = isTech ? ('بررسی دقیق (' + (TECH_TITLES[cur] || cur) + ')') : 'بررسی دقیق';

    var techBtn = h('button', {
      type: 'button', class: 'tz-tab tz-tab-menu-btn' + (isTech ? ' active' : ''),
      'aria-haspopup': 'menu', 'aria-expanded': 'false',
      onclick: function () {
        if (!T.popover) return;
        T.popover.open({
          trigger: techBtn,
          role: 'menu',
          preferDir: 'down',
          items: TECH_TABS.map(function (techId) {
            return {
              label: (TECH_TITLES[techId] || techId),
              role: 'menuitem',
              checked: cur === techId,
              onSelect: function () { activate(techId); renderTabs(); }
            };
          })
        });
      }
    }, h('span', null, menuText), T.icon('chev', 14));

    el.tabs.appendChild(techBtn);
  }

  function activate(id) {
    var d = find(id);
    if (!d) return;
    cur = id;
    renderTabs();
    Object.keys(cons).forEach(function (k) { cons[k].hidden = k !== id; });
    if (!cons[id]) {
      var c = h('div', { class: 'tz-pane', id: 'tz-pane-' + id, role: 'tabpanel', 'aria-labelledby': 'tz-tab-' + id, tabindex: '0' });
      cons[id] = c;
      el.panel.appendChild(c);
      try {
        inst[id] = d.mount(c, ctx) || {};
      } catch (e) {
        c.textContent = '';
        inst[id] = {};
        miss(c, id, e);
      }
    }
    cons[id].hidden = false;
    var i = inst[id];
    if (i && i.update) {
      try { i.update(ST); } catch (e) { }
    }
  }

  /** Register or replace a result tab. */
  function reg(d) {
    if (!d || !d.id || typeof d.mount !== 'function') return;
    d = Object.assign({ label: t('ui.tab.' + d.id) }, d);
    var i = tabs.findIndex(function (x) { return x.id === d.id; });
    if (i < 0) tabs.push(d); else tabs[i] = d;
    if (cons[d.id]) { cons[d.id].remove(); delete cons[d.id]; delete inst[d.id]; }
    if (el.tabs) { renderTabs(); if (cur === d.id) activate(d.id); }
  }
  T.on('ui:registerTab', reg);

  var acts = [];
  function regAction(a) {
    if (!a || !a.id || typeof a.run !== 'function') return;
    acts.push(a);
  }
  T.on('ui:registerAction', regAction);

  function busy(on, ok) {
    var p = el.primary;
    clearTimeout(busyT);
    p.classList.remove('done');
    el.label.textContent = 'پردازش و کپی';
    p.classList.toggle('busy', !!on);
    p.disabled = !!on;
    p.setAttribute('aria-busy', String(!!on));
    if (!on && ok) {
      p.classList.add('done');
      el.label.textContent = t('ui.done');
      busyT = setTimeout(function () {
        p.classList.remove('done');
        el.label.textContent = 'پردازش و کپی';
      }, 1800);
    }
  }

  function mob(m) {
    el.bench.setAttribute('data-m', m);
    el.mt.forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-m') === m)); });
  }

  /** Copy word|ppt|plain; main=true animates the primary button. */
  function copy(kind, main) {
    var C = T.get('clipboard'), fn = { word: 'copyWord', ppt: 'copyPpt', plain: 'copyPlain' }[kind], t0 = Date.now();
    if (!C || typeof C[fn] !== 'function') { toast(t('ui.noClip'), 'err'); return Promise.resolve(); }
    if ((!ST.result || ST.stale) && !process()) {
      if (!ST.input.trim()) toast(t('ui.emptyInput'), 'err');
      return Promise.resolve();
    }
    mob('out');
    if (main) busy(1);
    return Promise.resolve().then(function () {
      return C[fn](ST.result, ST.settings);
    }).catch(function (e) {
      return { ok: false, message: e && e.message };
    }).then(function (r) {
      var ok = !r || r.ok !== false;
      return new Promise(function (res) {
        setTimeout(res, main ? Math.max(0, 600 - (Date.now() - t0)) : 0);
      }).then(function () {
        if (main) busy(0, ok);
        toast((r && r.message) || t(ok ? 'ui.copied' : 'ui.copyFail'), ok ? (r && r.risky ? 'warn' : 'ok') : 'err');
        if (ok) { ST.copied = true; refresh(); }
      });
    });
  }

  function copyOrig() {
    if (!ST.input) { toast(t('ui.emptyInput'), 'err'); return; }
    var C = T.get('clipboard');
    var p = C && C.writeText ? Promise.resolve(C.writeText(ST.input)) : (navigator.clipboard ? navigator.clipboard.writeText(ST.input) : Promise.reject());
    p.then(function (r) {
      var ok = !r || r.ok !== false;
      toast(t(ok ? 'ui.copied.orig' : 'ui.copyFail'), ok ? 'ok' : 'err');
    }).catch(function () {
      toast(t('ui.copyFail'), 'err');
    });
  }

  function downloadDocx() {
    if ((!ST.result || ST.stale) && !process()) {
      if (!ST.input.trim()) toast(t('ui.emptyInput'), 'err');
      return;
    }
    var D = T.get('export.docx'), C = T.get('clipboard');
    if (D && D.build) {
      toast('در حال ساخت سند Word…', 'info');
      D.build(ST.result, ST.settings).then(function (blob) {
        if (C && C.download) return C.download('taraz-document.docx', blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        var a = h('a', { href: URL.createObjectURL(blob), download: 'taraz-document.docx' });
        document.body.appendChild(a); a.click(); a.remove();
        toast('دانلود سند آغاز شد.', 'ok');
      }).catch(function (e) {
        toast('خطا در ایجاد سند Word: ' + (e && e.message || e), 'err');
      });
    } else {
      toast('پشتیبانی از دانلود Word در دسترس نیست.', 'err');
    }
  }

  function downloadFormat(fmt) {
    if ((!ST.result || ST.stale) && !process()) {
      if (!ST.input.trim()) toast(t('ui.emptyInput'), 'err');
      return;
    }
    var C = T.get('clipboard');
    if (C && C.exportFile) {
      C.exportFile(ST.result, ST.settings, fmt).then(function (r) {
        if (r && r.message) toast(r.message, r.ok ? 'ok' : 'err');
      });
    }
  }

  function setTheme(n) {
    var d = document.documentElement, s = T.lsGet(SK, {}) || {};
    mode = n === 'dark' ? 'dark' : 'light';
    d.setAttribute('data-theme', mode);
    d.removeAttribute('data-contrast');
    s.theme = mode;
    s.highContrast = false;
    T.lsSet(SK, s);
    el.themeBtn.textContent = '';
    el.themeBtn.appendChild(T.icon(mode === 'dark' ? 'moon' : 'sun', 18));
    var l = mode === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره';
    el.themeBtn.setAttribute('aria-label', l);
    el.themeBtn.title = l;
  }

  function drawer(o) {
    if (o === dOpen) return;
    dOpen = o;
    el.drawer.toggleAttribute('data-open', o);
    el.drawer.inert = !o;
    el.scrim.hidden = !o;
    el.sBtn.setAttribute('aria-expanded', String(o));
    (o ? el.drawer.querySelector('input,button') : el.sBtn).focus();
    T.emit('ui:drawer', { open: o });
  }

  function splitter() {
    var sp = el.split, b = el.bench, r = Math.min(.75, Math.max(.25, +ui.split || .5));
    function set(v) {
      r = Math.min(.75, Math.max(.25, v));
      b.style.setProperty('--fa', r + 'fr');
      b.style.setProperty('--fb', (1 - r) + 'fr');
      sp.setAttribute('aria-valuenow', String(Math.round(r * 100)));
    }
    function rtl() { return getComputedStyle(b).direction === 'rtl'; }
    set(r);
    sp.addEventListener('pointerdown', function (e) { sp.setPointerCapture(e.pointerId); sp._d = 1; });
    sp.addEventListener('pointermove', function (e) {
      if (!sp._d) return;
      var q = b.getBoundingClientRect();
      set(rtl() ? (q.right - e.clientX) / q.width : (e.clientX - q.left) / q.width);
    });
    sp.addEventListener('pointerup', function () { sp._d = 0; saveUI('split', r); });
    sp.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (e.key === 'Home') { e.preventDefault(); set(.5); saveUI('split', r); return; }
      if (!d) return;
      e.preventDefault();
      set(r + (rtl() ? -d : d) * .03);
      saveUI('split', r);
    });
  }

  function sheet(id, title, head, body) {
    return h('section', { class: 'tz-sheet', id: id, 'aria-label': title },
      h('div', { class: 'tz-sh' }, head),
      h('div', { class: 'tz-ruler', 'aria-hidden': 'true' }),
      body
    );
  }

  function boot() {
    if (booted) return;
    var head = document.getElementById('tz-head'), app = document.getElementById('app'), ed = T.get('ui.editor'), b = document.body;
    if (!head || !app) return;
    booted = true;
    deb = T.debounce(process, 250);

    el.brandLv = T.level('idle');
    el.pLv = T.level('idle');

    el.steps = [
      { n: 1, l: 'چسباندن متن' },
      { n: 2, l: 'بررسی و تراز' },
      { n: 3, l: 'تحویل آفیس' }
    ].map(function (step) {
      return h('li', null,
        h('span', { class: 'n' }, fa(step.n)),
        h('span', { class: 'l' }, step.l)
      );
    });

    el.sBtn = h('button', {
      type: 'button', class: 'tz-btn', id: 'tz-settings-btn',
      'aria-label': t('ui.settings'), 'aria-controls': 'tz-drawer', 'aria-expanded': 'false',
      onclick: function () { drawer(!dOpen); }
    }, T.icon('settings', 18), h('span', { class: 'l2' }, t('ui.settings')));

    el.themeBtn = h('button', {
      type: 'button', class: 'tz-btn icon',
      onclick: function () { setTheme(mode === 'dark' ? 'light' : 'dark'); }
    });

    head.appendChild(h('div', { class: 'tz-bar' },
      h('div', { class: 'tz-brand' },
        el.brandLv,
        h('span', { class: 'tz-word', lang: 'fa' }, 'تراز'),
        h('span', { class: 'tz-lat', lang: 'en' }, 'Tarāz')
      ),
      h('ol', { class: 'tz-steps', 'aria-label': 'مراحل آماده‌سازی متن' }, el.steps),
      h('div', { class: 'tz-tools' },
        h('div', { id: 'tz-preset-slot' }),
        el.sBtn,
        el.themeBtn
      )
    ));

    var D = document.documentElement;
    setTheme(D.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

    ctx = {
      state: ST, t: t, h: h, icon: T.icon, toast: toast, process: process, getSettings: getSettings,
      loadSample: function (i) { var e = T.get('ui.editor'); if (e) e.loadSample(i); },
      onInput: function (txt, m) {
        ST.input = txt; ST.copied = false; ST.stale = !!txt.trim();
        if (!txt.trim()) ST.result = null;
        refresh();
        if (m && m.immediate) { deb.cancel(); process(); }
        else if (txt.trim() && (!ed || ed.auto())) deb();
      }
    };

    el.edIn = h('div', { class: 'tz-sb' });
    el.tabs = h('div', { class: 'tz-tabs', role: 'tablist', 'aria-label': t('ui.result') });

    el.panel = h('div', { id: 'tz-panel' });

    // Review strip
    el.reviewStripBox = h('div', { class: 'tz-review-strip-box' });
    var RS = T.get('ui.reviewStrip');
    if (RS && RS.mount) {
      el.reviewStripInst = RS.mount(el.reviewStripBox, ctx);
    }

    el.split = h('div', {
      class: 'tz-split', role: 'separator', 'aria-orientation': 'vertical',
      'aria-label': t('ui.splitter'), 'aria-valuemin': '25', 'aria-valuemax': '75', 'aria-valuenow': '50', tabindex: '0'
    });

    el.bench = h('div', { class: 'tz-bench', 'data-m': 'in' },
      sheet('sheet-in', t('ui.input'), h('h2', null, t('ui.input')), el.edIn),
      el.split,
      sheet('sheet-out', t('ui.result'), el.tabs, h('div', { class: 'tz-sb' }, el.reviewStripBox, el.panel))
    );

    el.mt = [['in', 'ui.input'], ['out', 'ui.result']].map(function (x) {
      return h('button', {
        type: 'button', role: 'tab', class: 'tz-tab', 'data-m': x[0],
        'aria-controls': 'sheet-' + x[0], 'aria-selected': String(x[0] === 'in'),
        onclick: function () { mob(x[0]); }
      }, t(x[1]));
    });

    app.append(h('div', { class: 'tz-mtabs', role: 'tablist' }, el.mt), el.bench);
    splitter();

    // Drawer markup
    el.drawerBody = h('div', { class: 'tz-drawer-body', id: 'tz-drawer-body', 'data-empty': t('ui.drawerEmpty') });
    el.drawer = h('aside', {
      class: 'tz-drawer', id: 'tz-drawer', 'aria-label': t('ui.settings'), inert: true
    }, el.drawerBody);

    el.scrim = h('div', { class: 'tz-scrim', hidden: true, onclick: function () { drawer(false); } });
    el.toasts = h('div', { class: 'tz-toasts', role: 'status', 'aria-live': 'polite' });

    // Primary dock button
    el.label = h('span', { class: 'lbl' }, 'پردازش و کپی');
    el.primary = h('button', {
      type: 'button', class: 'tz-primary', id: 'tz-primary-btn',
      onclick: function () { copy('word', true); }
    }, h('span', { class: 'fill' }), el.pLv, el.label);

    var primaryWrap = h('div', { class: 'tz-primary-wrap' },
      el.primary,
      h('span', { class: 'tz-dest-hint' }, 'برای مایکروسافت ورد (Word)')
    );

    function openCopyMenu() {
      if (!T.popover) return;
      T.popover.open({
        trigger: copyBtn,
        preferDir: 'up',
        role: 'menu',
        items: [
          { label: 'مایکروسافت ورد (Word)', onSelect: function () { copy('word'); } },
          { label: 'پاورپوینت (PowerPoint)', onSelect: function () { copy('ppt'); } },
          { label: 'متن ساده استاندارد', onSelect: function () { copy('plain'); } },
          { sep: true },
          { label: 'متن اصلی دست\u200cنخورده', onSelect: function () { copyOrig(); } }
        ]
      });
    }
    var copyBtn = h('button', {
      type: 'button', class: 'tz-dock-menu-btn', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
      onclick: openCopyMenu
    }, T.icon('doc', 16), h('span', null, 'کپی برای\u2026'), T.icon('chev', 12));

    function openDlMenu() {
      if (!T.popover) return;
      T.popover.open({
        trigger: dlBtn,
        preferDir: 'up',
        role: 'menu',
        items: [
          { label: 'سند ورد (.docx)', onSelect: function () { downloadDocx(); } },
          { label: 'صفحه وب (.html)', onSelect: function () { downloadFormat('html'); } },
          { label: 'مارک\u200cداون (.md)', onSelect: function () { downloadFormat('md'); } },
          { label: 'متن ساده (.txt)', onSelect: function () { downloadFormat('txt'); } }
        ]
      });
    }
    var dlBtn = h('button', {
      type: 'button', class: 'tz-dock-menu-btn', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
      onclick: openDlMenu
    }, T.icon('dl', 16), h('span', null, 'دانلود'), T.icon('chev', 12));

    var dock = h('div', { class: 'tz-dock' },
      h('div', { class: 'tz-dock-in' },
        primaryWrap,
        h('div', { class: 'tz-dock-menus' }, copyBtn, dlBtn)
      )
    );

    b.append(el.scrim, el.drawer, el.toasts, dock);

    var f = document.querySelector('.tz-foot');
    if (f) {
      f.textContent = '';
      f.append(
        h('span', { class: 'tz-credit' }, 'Built by Gholamreza Nejati Jahromi'),
        h('span', { class: 'tz-mono', dir: 'ltr' }, 'v' + T.VERSION)
      );
    }

    if (ed) ed.mount(el.edIn, ctx);

    var VT = T.VIEW_TABS || { preview: { mod: 'ui.preview', file: 'js/ui/preview.js' } };
    Object.keys(VT).forEach(function (id) {
      reg({
        id: id, label: t('ui.tab.' + id),
        mount: function (c, x) {
          var m = T.get(VT[id].mod);
          if (m && typeof m.mount === 'function') return m.mount(c, x);
          miss(c, id);
        }
      });
      T.on('module:' + VT[id].mod, function () {
        var c = cons[id];
        if (c && c.querySelector('[data-missing]')) {
          c.remove();
          delete cons[id];
          delete inst[id];
          if (cur === id) activate(id);
        }
      });
    });

    (T.pendingTabs || []).splice(0).forEach(reg);
    renderTabs();
    activate('preview');
    refresh();

    document.addEventListener('keydown', function (e) {
      var k = e.key, c = e.ctrlKey || e.metaKey;
      if (k === 'Escape') {
        drawer(false);
        if (ed) ed.closeMenu();
        return;
      }
      if (!c) return;
      if (k === 'Enter') { e.preventDefault(); copy('word', true); }
      else if (e.shiftKey && (k === 'C' || k === 'c')) { e.preventDefault(); copy('word'); }
      else if (e.shiftKey && (k === 'P' || k === 'p')) { e.preventDefault(); copy('ppt'); }
    });

    var sc = T.debounce(function () {
      ST.settings = getSettings();
      if (ST.input.trim()) process();
    }, 120), S = T.get('settings');
    if (S && typeof S.onChange === 'function') try { S.onChange(sc); } catch (e) { }
    ['settings:changed', 'settings:change'].forEach(function (n) { T.on(n, sc); });
    ['engine', 'serialize', 'clipboard', 'engine.safety'].forEach(function (m) {
      T.on('module:' + m, function () { if (ST.input.trim()) process(); else refresh(); });
    });

    var spn = T.get('ui.settings'), prs = T.get('presets');
    try { if (spn) spn.mount(document.getElementById('tz-drawer-body'), ctx); } catch (e) { }
    try { if (prs && prs.mountSelector) prs.mountSelector(document.getElementById('tz-preset-slot'), ctx); } catch (e) { }

    T.emit('ui:ready', ST);
  }

  T.register('ui', {
    state: ST, compute: compute, process: process, copy: copy, toast: toast,
    registerTab: reg, tabIds: function () { return tabs.map(function (d) { return d.id; }); },
    activate: activate, refresh: refresh, drawer: drawer, theme: setTheme, boot: boot
  });

  if (document.readyState === 'complete') boot();
  else { document.addEventListener('DOMContentLoaded', boot); window.addEventListener('load', boot); }
})(window.Taraz = window.Taraz || {});