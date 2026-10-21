// Tarāz UI editor: textarea, live counters, empty state with samples & paste button, undo/redo history.
(function (T) {
  'use strict';
  var h = T.h, t = function (k) { return T.ut(k); }, K = 'taraz.ui.v1', MAX = 2097152, HMAX = 100, F = '```';

  var SAMPLES = [
    {
      k: 'ui.sample.1',
      title: 'نمونه مهندسی (IEEE/DER)',
      text: [
        'بررسی هماهنگی حفاظتی در شبکه توزیع دارای منابع تولید پراکنده(DER)',
        '',
        'بر اساس مرجعIEEE 1547را در نظر می‌گیریم که منابعDER با ظرفیت 5MW به فیدر 20kV متصل میشوند. جریان اتصال کوتاه برابر 3.2kA است(مطابق IEEE Std 1547-2018)و زمان قطع رله باید کمتر از 0.5s باشد.',
        '',
        'نتایج در https://example.com/report.pdf و فایل C:\\Data\\case14.pfd ذخیره شد، تنها 12% خطاها شناسایی نشد.'
      ].join('\n')
    },
    {
      k: 'ui.sample.2',
      title: 'معادلات ریاضی (LaTeX)',
      text: [
        'انرژی ذخیره‌شده در خازن از رابطه $E=\\frac{1}{2}CV^2$ به دست می‌آید و ولتاژ مؤثر برابر $V_{rms}=\\frac{V_m}{\\sqrt{2}}$ است.',
        '',
        '\\[ I_{rms}^2 T=\\int_0^T i^2(t)\\,dt \\]',
        '',
        'با فرض \\(Z_{th}=R+jX\\) مقدار $I_{sc}$ را محاسبه کنید.'
      ].join('\n')
    },
    {
      k: 'ui.sample.3',
      title: 'گزارش و جدول (Markdown)',
      text: [
        '# گزارش آزمایش حفاظت',
        '',
        '## مراحل',
        '',
        '1. مدل‌سازی شبکه در PowerFactory',
        '   - اتصال DER به باس 5',
        '   - تنظیم رله‌های overcurrent',
        '2. اجرای شبیه‌سازی مونت‌کارلو',
        '',
        '| فیدر | جریان (kA) | وضعیت |',
        '|---|---|---|',
        '| F1 | 3.2 | سالم |',
        '| F2 | 1.8 | خطا |',
        '',
        F + 'python',
        'print("fault current", 3.2)',
        F,
        '',
        '> نتیجه: هماهنگی رله‌ها حفظ شد.'
      ].join('\n')
    }
  ];

  var ta, ctx, cnt, bu, br, menu, mbtn, drop, hist = [''], hi = 0, ext = false, auto = (T.lsGet(K, {}) || {}).auto !== false;

  function count(s) {
    s = String(s || '');
    return {
      chars: s.replace(/[\uDC00-\uDFFF]/g, '').length,
      words: s.split(/\s+/).filter(Boolean).length,
      paragraphs: s.split(/\n\s*\n/).filter(function (x) { return x.trim(); }).length
    };
  }

  function upd() {
    var c = count(ta.value);
    cnt.textContent = [
      T.fa(c.chars) + ' ' + t('ui.c.chars'),
      T.fa(c.words) + ' ' + t('ui.c.words'),
      T.fa(c.paragraphs) + ' ' + t('ui.c.paras')
    ].join(' · ');
    bu.disabled = hi <= 0 && ta.value === hist[0];
    br.disabled = hi >= hist.length - 1;
  }

  function push(s) {
    if (s === hist[hi]) return;
    hist.length = hi + 1;
    hist.push(s);
    if (hist.length > HMAX) hist.shift();
    hi = hist.length - 1;
  }

  var snap = T.debounce(function () { push(ta.value); upd(); }, 400);

  function emit(m) {
    upd();
    ctx.onInput(ta.value, m || {});
  }

  function set(s, m) {
    snap.cancel();
    ta.value = s;
    ext = true;
    push(s);
    emit(m || { immediate: true });
    checkEmpty();
  }

  function undo() {
    snap.cancel();
    push(ta.value);
    if (hi > 0) {
      hi--;
      ta.value = hist[hi];
      ext = true;
      emit({ immediate: true });
    }
  }

  function redo() {
    snap.cancel();
    if (hi < hist.length - 1) {
      hi++;
      ta.value = hist[hi];
      ext = true;
      emit({ immediate: true });
    }
  }

  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    mbtn.setAttribute('aria-expanded', 'false');
  }

  function loadSample(i) {
    if (!SAMPLES[i] || !ta) return;
    set(SAMPLES[i].text);
    closeMenu();
    ta.focus();
  }

  function pasteFromClip() {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (clipText) {
        if (clipText) {
          set(clipText);
          ta.focus();
        } else {
          ta.focus();
        }
      }).catch(function () {
        ta.focus();
      });
    } else {
      ta.focus();
    }
  }

  function file(f) {
    if (!f) return;
    if (!/\.(txt|md|markdown)$/i.test(f.name) || (f.type && !/^text\/|markdown/.test(f.type))) {
      ctx.toast(t('ui.err.file'), 'err');
      return;
    }
    if (f.size > MAX) {
      ctx.toast(t('ui.err.big'), 'err');
      return;
    }
    var r = new FileReader();
    r.onload = function () { set(String(r.result || '').replace(/^\uFEFF/, '')); };
    r.onerror = function () { ctx.toast(t('ui.err.read'), 'err'); };
    r.readAsText(f, 'utf-8');
  }

  function btn(ic, k, fn) {
    return h('button', {
      type: 'button', class: 'tz-btn icon',
      title: t(k), 'aria-label': t(k), onclick: fn
    }, T.icon(ic, 18));
  }

  function mount(el, c) {
    ctx = c;
    ta = h('textarea', {
      class: 'tz-ta', dir: 'rtl', spellcheck: 'false', autocomplete: 'off',
      'aria-label': t('ui.input'), placeholder: t('ui.ph')
    });

    bu = btn('undo', 'ui.undo', undo);
    br = btn('redo', 'ui.redo', redo);
    var bc = btn('trash', 'ui.clear', function () { set(''); ta.focus(); });

    mbtn = h('button', {
      type: 'button', class: 'tz-btn', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
      onclick: function () {
        var o = menu.hidden;
        menu.hidden = !o;
        mbtn.setAttribute('aria-expanded', String(o));
        if (o) menu.firstChild.focus();
      }
    }, T.icon('sample', 18), h('span', null, t('ui.samples')), T.icon('chev', 14));

    menu = h('div', {
      class: 'tz-menu', role: 'menu', hidden: true,
      onkeydown: function (e) {
        var b = [].slice.call(menu.children), i = b.indexOf(document.activeElement);
        var d = { ArrowDown: 1, ArrowUp: -1 }[e.key];
        if (d) { e.preventDefault(); b[(i + d + b.length) % b.length].focus(); }
      }
    }, SAMPLES.map(function (s, i) {
      return h('button', {
        type: 'button', role: 'menuitem',
        onclick: function () { loadSample(i); }
      }, s.title || t(s.k));
    }));

    var chk = h('input', {
      type: 'checkbox', checked: auto,
      onchange: function () {
        auto = chk.checked;
        var u = T.lsGet(K, {}) || {};
        u.auto = auto;
        T.lsSet(K, u);
      }
    });

    cnt = h('div', { class: 'tz-count' });

    drop = h('div', { class: 'tz-ed', 'data-drop': t('ui.drop') }, ta);

    el.append(
      h('div', { class: 'tz-etools' },
        bu, br, bc,
        h('div', { class: 'tz-menuwrap' }, mbtn, menu),
        h('label', { class: 'tz-chk' }, chk, h('span', null, t('ui.auto')))
      ),
      drop,
      cnt
    );

    ta.addEventListener('input', function () { ext = false; snap(); emit(); });
    ta.addEventListener('paste', function () {
      setTimeout(function () { snap.cancel(); push(ta.value); emit({ paste: true, immediate: auto }); }, 0);
    });
    ta.addEventListener('keydown', function (e) {
      var k = e.key.toLowerCase();
      if (!(e.ctrlKey || e.metaKey) || !ext) return;
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    });

    ['dragenter', 'dragover'].forEach(function (n) {
      drop.addEventListener(n, function (e) { e.preventDefault(); drop.classList.add('drag'); });
    });
    drop.addEventListener('dragleave', function (e) {
      if (!drop.contains(e.relatedTarget)) drop.classList.remove('drag');
    });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      drop.classList.remove('drag');
      file(e.dataTransfer && e.dataTransfer.files[0]);
    });

    document.addEventListener('click', function (e) {
      if (menu && !mbtn.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });

    upd();
  }

  T.register('ui.editor', {
    mount: mount,
    get: function () { return ta ? ta.value : ''; },
    set: set,
    undo: undo,
    redo: redo,
    clear: function () { set(''); },
    count: count,
    samples: SAMPLES,
    loadSample: loadSample,
    auto: function () { return auto; },
    closeMenu: closeMenu,
    focus: function () { if (ta) ta.focus(); }
  });
})(window.Taraz = window.Taraz || {});