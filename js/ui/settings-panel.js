// Tarāz settings panel: task-oriented drawer, presets, core choices, search, and advanced tasks.
(function (T) {
  'use strict';
  var h = T.h, UK = 'taraz.ui.v1', fa = T.fa;
  var sp = function (k, f) { return T.sp ? T.sp(k, f) : (f != null ? f : k); };

  var SEC_RULES = [
    { id: 'digits', g: /digit|punct/i, i: /^(dig|pc)[A-Z]/ },
    { id: 'spacing', g: /spac|zwnj/i, i: /^(zw|sp)[A-Z]/ },
    { id: 'direction', g: /^dir/i, i: /^dir[A-Z]/ },
    { id: 'fonts', g: /font/i, i: /^fn[A-Z]/ },
    { id: 'math', g: /math|latex|katex/i, i: /math|latex|katex/i },
    { id: 'cleanup', g: /clean/i, i: /^cl[A-Z]/ },
    { id: 'protect', g: /protect|tech/i, i: /^protect/i },
    { id: 'output', g: /output|office/i, i: /^(pt|out)[A-Z]/ }
  ];

  function secOf(o) {
    var g = String(o.group || '');
    for (var i = 0; i < SEC_RULES.length; i++) {
      if (SEC_RULES[i].g.test(g)) return SEC_RULES[i].id;
    }
    for (var j = 0; j < SEC_RULES.length; j++) {
      if (SEC_RULES[j].i.test(o.id)) return SEC_RULES[j].id;
    }
    return 'advanced';
  }

  var TASK_GROUPS = [
    { id: 'digits', title: '۱. ظاهر متن، ارقام و نشانه‌گذاری', secs: ['digits'] },
    { id: 'spacing', title: '۲. فاصله‌گذاری و نیم‌فاصله', secs: ['spacing'] },
    { id: 'cleanup', title: '۳. پاکسازی نشانه‌های اضافی چت', secs: ['cleanup'] },
    { id: 'direction', title: '۴. جهت و چیدمان متن (RTL/LTR)', secs: ['direction', 'protect'] },
    { id: 'math', title: '۵. معادلات ریاضی و LaTeX', secs: ['math'] },
    { id: 'fonts', title: '۶. قلم‌ها و اندازه‌ها', secs: ['fonts'] },
    { id: 'output', title: '۷. ایمنی خروجی و Office', secs: ['output'] },
    { id: 'advanced', title: '۸. سایر تنظیمات و پوسته', secs: ['advanced'] }
  ];

  var SYNONYMS = {
    'نیم فاصله': ['zwnj', 'نیم‌فاصله', 'فاصله'],
    'فاصله': ['spacing', 'spmode', 'فاصله‌گذاری'],
    'اعداد': ['digits', 'ارقام', 'رقم', 'fa', 'lat', 'digprose', 'digtech'],
    'فونت': ['fonts', 'قلم', 'fnpair', 'fnfa', 'fnen'],
    'لاتین': ['latin', 'english', 'انگلیسی', 'ltr'],
    'پارسی': ['persian', 'فارسی', 'fa', 'rtl'],
    'گیومه': ['quotes', 'علامت', 'نقل‌قول', 'pcquotes'],
    'حرکات': ['diacritics', 'اعراب', 'حرکه', 'cldiacritics'],
    'فرمول': ['math', 'latex', 'معادله', 'ریاضی']
  };

  var u0 = T.lsGet(UK, {}) || {}, mode = u0.sm === 'pro' ? 'pro' : 'basic', pin = !!u0.pin;
  var q = '', rows = {}, taskDetails = {}, root, bodyEl, advContainer, advDetails, noRes, qi, segs, pinBtn, modCountEl, cx;

  function S() { return T.get('settings'); }
  function put(k, v) { var u = T.lsGet(UK, {}) || {}; u[k] = v; T.lsSet(UK, u); }
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/ي/g, 'ی').replace(/ك/g, 'ک')
      .replace(/[\u200c\u0640\u064B-\u0652]/g, '')
      .replace(/\s+/g, ' ').trim();
  }
  function lab(o) { return sp(o.label || 'opt.' + o.id + '.label', o.label || o.id); }
  function hp(o) { return sp(o.help || 'opt.' + o.id + '.help', ''); }
  function oc(c) { return c.label ? sp(c.label, c.label) : String(c.v); }

  function ctl(o) {
    var t = o.type, v0 = function () { return S().get(o.id); }, set = function (v) { S().set(o.id, v); };
    if (t === 'switch') {
      var b = h('button', {
        type: 'button', class: 'tz-sw', role: 'switch', 'aria-label': lab(o),
        onclick: function () { set(!v0()); }
      }, h('i'));
      return { el: b, sync: function () { b.setAttribute('aria-checked', String(!!v0())); } };
    }
    if (t === 'segmented') {
      var bs = (o.options || []).map(function (c) {
        return h('button', {
          type: 'button', role: 'radio',
          onclick: function () { set(c.v); }
        }, oc(c));
      });
      return {
        el: h('div', { class: 'tz-seg wrap', role: 'radiogroup', 'aria-label': lab(o) }, bs),
        sync: function () {
          bs.forEach(function (x, i) { x.setAttribute('aria-checked', String(o.options[i].v === v0())); });
        }
      };
    }
    if (t === 'select') {
      var makeS = T.popover && T.popover.makeSelect;
      if (makeS) {
        var sel = makeS({
          options: (o.options || []).map(function (c) { return { v: c.v, label: oc(c) }; }),
          getValue: function () { return S().get(o.id); },
          setValue: function (v) { S().set(o.id, v); },
          ariaLabel: lab(o)
        });
        return {
          el: sel.el,
          sync: function () { sel.sync(); }
        };
      }
      var s = h('select', {
        class: 'tz-sel', 'aria-label': lab(o),
        onchange: function () { S().set(o.id, o.options[s.selectedIndex].v); }
      }, (o.options || []).map(function (c) {
        return h('option', { value: String(c.v) }, oc(c));
      }));
      return {
        el: s,
        sync: function () {
          var i = (o.options || []).findIndex(function (c) { return c.v === S().get(o.id); });
          s.selectedIndex = i < 0 ? 0 : i;
        }
      };
    }
    if (t === 'slider') {
      var out = h('output', { class: 'tz-val' });
      var r = h('input', {
        type: 'range',
        min: String(o.min != null ? o.min : 0),
        max: String(o.max != null ? o.max : 100),
        step: String(o.step || 1),
        'aria-label': lab(o),
        oninput: function () { set(+r.value); }
      });
      return {
        el: h('div', { class: 'tz-slw' }, r, out),
        sync: function () {
          r.value = v0();
          out.textContent = fa ? fa(v0()) : String(v0());
        }
      };
    }
    if (t === 'text') {
      var inp = h('input', {
        type: 'text', class: 'tz-txt', dir: 'auto', 'aria-label': lab(o),
        oninput: function () { set(inp.value); }
      });
      return {
        el: inp,
        sync: function () {
          if (document.activeElement !== inp) inp.value = v0() == null ? '' : v0();
        }
      };
    }
    if (t === 'list') {
      var chips = h('span', { class: 'tz-chips' });
      var add = h('input', {
        type: 'text', class: 'tz-txt', dir: 'auto', placeholder: sp('sp.list.add', 'افزودن و Enter'),
        'aria-label': lab(o),
        onkeydown: function (e) {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); push(); }
        },
        onblur: function () { push(); }
      });
      function push() {
        var x = add.value.trim(), a;
        if (!x) return;
        a = (v0() || []).slice();
        if (a.indexOf(x) < 0) a.push(x);
        add.value = '';
        set(a);
      }
      return {
        el: h('div', { class: 'tz-list' }, chips, add),
        sync: function () {
          chips.textContent = '';
          (v0() || []).forEach(function (x, k) {
            chips.append(h('span', { class: 'tz-chip', dir: 'auto' }, x,
              h('button', {
                type: 'button', 'aria-label': sp('sp.list.remove', 'حذف') + ' ' + x,
                onclick: function () { var a = v0().slice(); a.splice(k, 1); set(a); }
              }, '×')));
          });
        }
      };
    }
    var defSpan = h('span', null);
    return { el: defSpan, sync: function () { defSpan.textContent = String(v0()); } };
  }

  function row(o) {
    var c = ctl(o), help = hp(o);
    var dot = h('i', { class: 'tz-dot', title: sp('sp.modified', 'تغییر یافته') });
    var rs = h('button', {
      type: 'button', class: 'tz-btn icon tz-rs', title: sp('sp.reset', 'بازنشانی این گزینه'),
      'aria-label': sp('sp.reset', 'بازنشانی') + ': ' + lab(o),
      onclick: function () { S().reset(o.id); }
    }, T.icon('refresh', 14));

    var helpBtn = help ? h('button', {
      type: 'button', class: 'tz-btn icon tz-hp-btn', 'aria-label': 'توضیحات ' + lab(o),
      onclick: function () { hpBox.hidden = !hpBox.hidden; }
    }, '؟') : '';
    var hpBox = help ? h('div', { class: 'tz-hp', hidden: true }, help) : '';

    var el = h('div', { class: 'tz-opt', 'data-id': o.id, 'data-t': o.type },
      h('div', { class: 'tz-oh' },
        h('div', { class: 'tz-oh-left' }, dot, h('span', { class: 'tz-ol' }, lab(o)), helpBtn),
        rs
      ),
      hpBox,
      c.el
    );

    return {
      el: el,
      o: o,
      hay: norm(lab(o) + ' ' + help + ' ' + o.id),
      sync: function () {
        var m = S().isModified(o.id);
        el.classList.toggle('mod', m);
        rs.hidden = !m;
        c.sync();
      }
    };
  }

  function updateModCount() {
    if (!modCountEl) return;
    var mods = S() ? S().modified().length : 0;
    modCountEl.textContent = mods > 0 ? (fa(mods) + ' تنظیم تغییر کرده') : 'پیش‌فرض‌ها فعال است';
  }

  function filter() {
    var rawQ = q.trim();
    var words = norm(rawQ).split(' ').filter(Boolean);
    Object.keys(SYNONYMS).forEach(function (synKey) {
      if (rawQ.indexOf(synKey) >= 0) {
        SYNONYMS[synKey].forEach(function (w) { words.push(norm(w)); });
      }
    });

    var totalVisible = 0;
    Object.keys(rows).forEach(function (id) {
      var r = rows[id];
      var levelMatch = (mode === 'pro' || r.o.level === 'basic');
      var searchMatch = words.length === 0 || words.every(function (w) { return r.hay.indexOf(w) >= 0; });
      r.n = levelMatch && searchMatch;
      r.el.hidden = !r.n;
      if (r.n) totalVisible++;
    });

    TASK_GROUPS.forEach(function (grp) {
      var d = taskDetails[grp.id];
      if (!d) return;
      var count = 0;
      Object.keys(rows).forEach(function (id) {
        if (grp.secs.indexOf(rows[id].sec) >= 0 && rows[id].n) count++;
      });
      d.hidden = count === 0;
      if (count > 0 && words.length > 0) d.open = true;
    });

    if (words.length > 0 && advDetails) {
      advDetails.open = true;
    }
    if (noRes) noRes.hidden = totalVisible > 0;
    updateModCount();
  }

  function build() {
    var O = T.options ? T.options() : [];
    rows = {};
    taskDetails = {};
    if (!advContainer) return;
    advContainer.textContent = '';

    var bySection = {};
    O.forEach(function (o) {
      var s = secOf(o);
      (bySection[s] = bySection[s] || []).push(o);
    });

    TASK_GROUPS.forEach(function (grp) {
      var grpOpts = [];
      grp.secs.forEach(function (sId) {
        grpOpts = grpOpts.concat(bySection[sId] || []);
      });
      if (!grpOpts.length) return;

      var body = h('div', { class: 'tz-task-body' });
      grpOpts.forEach(function (o) {
        var r = row(o);
        r.sec = secOf(o);
        rows[o.id] = r;
        body.appendChild(r.el);
      });
      var d = h('details', { class: 'tz-task-group', 'data-sec': grp.id },
        h('summary', null, grp.title),
        body
      );
      taskDetails[grp.id] = d;
      advContainer.appendChild(d);
    });

    Object.keys(rows).forEach(function (k) { rows[k].sync(); });
    filter();
  }

  function setMode(m) {
    mode = m === 'pro' ? 'pro' : 'basic';
    put('sm', mode);
    if (segs) {
      segs.forEach(function (b) {
        b.setAttribute('aria-checked', String(b.getAttribute('data-m') === mode));
      });
    }
    filter();
  }

  function wide() { return innerWidth >= 1100; }
  function pinApply() {
    var d = document.getElementById('tz-drawer'), b = document.body;
    var on = d && pin && wide() && d.hasAttribute('data-open');
    if (!d) return;
    b.classList.toggle('tz-pin', !!on);
    b.style.paddingRight = on ? d.offsetWidth + 'px' : '';
    b.style.paddingLeft = '';
  }
  function togglePin() {
    pin = !pin;
    put('pin', pin);
    if (pinBtn) pinBtn.setAttribute('aria-pressed', String(pin));
    pinApply();
  }

  function reveal(id) {
    var U = T.get('ui');
    if (U && U.drawer) U.drawer(true);
    var r = rows[id];
    if (r) {
      q = '';
      if (qi) qi.value = '';
      if (mode === 'basic' && r.o.level !== 'basic') setMode('pro');
      else filter();
      var d = taskDetails[r.sec];
      if (!d) {
        TASK_GROUPS.forEach(function (grp) {
          if (grp.secs.indexOf(r.sec) >= 0) d = taskDetails[grp.id];
        });
      }
      if (d) d.open = true;
      if (advDetails) advDetails.open = true;
      setTimeout(function () {
        var f = r.el.querySelector('button,input,select');
        r.el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        r.el.classList.add('flash');
        setTimeout(function () { r.el.classList.remove('flash'); }, 1600);
        if (f) f.focus({ preventScroll: true });
      }, 100);
    }
  }

  function mount(box, ctx) {
    if (root) return;
    cx = ctx;
    if (!S()) {
      box.appendChild(h('p', { class: 'tz-ph' }, T.ut('ui.notInstalled')));
      return;
    }

    qi = h('input', {
      type: 'search', class: 'tz-q', placeholder: 'جست‌وجو در گزینه‌ها، برچسب‌ها یا واژه‌ها…',
      'aria-label': 'جست‌وجو در تنظیمات',
      oninput: function (e) { q = e.target.value; filter(); }
    });

    segs = [['basic', 'ساده'], ['pro', 'حرفه‌ای']].map(function (x) {
      return h('button', {
        type: 'button', role: 'radio', 'data-m': x[0],
        'aria-checked': String(x[0] === mode),
        onclick: function () { setMode(x[0]); }
      }, x[1]);
    });

    pinBtn = h('button', {
      type: 'button', class: 'tz-btn tz-pinbtn',
      'aria-pressed': String(pin), title: 'سنجاق‌کردن به لبه صفحه',
      onclick: togglePin
    }, 'سنجاق');

    var closeBtn = h('button', {
      type: 'button', class: 'tz-btn icon', 'aria-label': 'بستن تنظیمات',
      onclick: function () {
        var U = T.get('ui');
        if (U && U.drawer) U.drawer(false);
      }
    }, T.icon('x', 18));

    var header = h('div', { class: 'tz-drawer-head' },
      h('div', { class: 'tz-dh-top' },
        h('h2', null, 'تنظیمات تراز'),
        h('div', { class: 'tz-dh-actions' }, pinBtn, closeBtn)
      ),
      h('div', { class: 'tz-search-bar' },
        qi,
        h('div', { class: 'tz-seg', role: 'radiogroup', 'aria-label': 'سطح نمایش تنظیمات' }, segs)
      )
    );

    bodyEl = h('div', { class: 'tz-drawer-body' });

    var sc = T.get('ui.settingsCards');
    if (sc && sc.mountPresets) {
      sc.mountPresets(bodyEl, ctx);
    }
    if (sc && sc.mountSixChoices) {
      sc.mountSixChoices(bodyEl, ctx);
    }

    advContainer = h('div', { class: 'tz-adv-tasks' });
    advDetails = h('details', { class: 'tz-adv-wrapper' },
      h('summary', { class: 'tz-sec-heading' }, 'تنظیمات پیشرفته و جزئیات (تفکیک بر اساس موضوع)'),
      advContainer
    );
    advDetails.open = false;

    noRes = h('p', { class: 'tz-ph', hidden: true }, 'هیچ تنظیمی با عبارت جست‌وجوشده پیدا نشد.');
    bodyEl.append(advDetails, noRes);

    modCountEl = h('span', { class: 'tz-mod-count' });
    var resetAllBtn = h('button', {
      type: 'button', class: 'tz-reset-all-btn',
      onclick: function () {
        if (confirm('آیا مایلید تمام گزینه‌ها به حالت پیش‌فرض اولیه بازگردند؟')) {
          var P = T.get('presets');
          if (P && P.resetAll) P.resetAll();
          else S().resetAll();
          if (ctx && ctx.toast) ctx.toast('تمامی تنظیمات به حالت پیش‌فرض بازگشت.', 'ok');
          updateModCount();
        }
      }
    }, 'بازنشانی به پیش‌فرض');

    var footerCloseBtn = h('button', {
      type: 'button', class: 'tz-btn',
      onclick: function () {
        var U = T.get('ui');
        if (U && U.drawer) U.drawer(false);
      }
    }, 'بستن');

    var footer = h('div', { class: 'tz-drawer-foot' },
      modCountEl,
      h('div', { class: 'tz-df-actions' }, resetAllBtn, footerCloseBtn)
    );

    root = h('div', { class: 'tz-drawer-inner' },
      header,
      bodyEl,
      footer
    );

    box.appendChild(root);
    build();

    S().onChange(function (c) {
      var r = rows[c.id];
      if (r) r.sync();
      updateModCount();
    });

    T.on('options:changed', T.debounce(build, 50));
    T.on('ui:drawer', function () { setTimeout(pinApply, 0); });
    addEventListener('resize', pinApply);
  }

  T.register('ui.settings', {
    mount: mount,
    reveal: reveal,
    setMode: setMode,
    toggleMode: function () { setMode(mode === 'pro' ? 'basic' : 'pro'); },
    togglePin: togglePin,
    sectionOf: secOf,
    label: lab,
    help: hp,
    rowIds: function () { return Object.keys(rows); },
    refresh: build
  });
})(window.Taraz = window.Taraz || {});