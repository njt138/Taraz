// Tarāz settings cards: Presets and Six Core Choices with live engine feedback.
(function (T) {
  'use strict';
  var h = T.h, fa = T.fa;
  function S() { return T.get('settings'); }
  function E() { return T.get('engine'); }
  function Z() { return T.get('serialize'); }

  function runSample(text, customOpts) {
    var eng = E(), ser = Z(), st = S();
    if (!eng || !ser || !st) return text;
    try {
      var current = Object.assign({}, st.all ? st.all() : (st.getAll ? st.getAll() : {}));
      if (customOpts) Object.assign(current, customOpts);
      var r = eng.process(text, current);
      return ser.toPlain(r, current).replace(/[\u200e\u200f]/g, '');
    } catch (e) {
      return text;
    }
  }

  function mountPresets(container, ctx) {
    var P = T.get('presets');
    if (!P || !P.list) return;

    var wrap = h('div', { class: 'tz-preset-section' });
    var title = h('h3', { class: 'tz-sec-heading' }, 'برای کجا می‌خواهید؟ (پیش‌تنظیم‌های استاندارد)');
    var cardsBox = h('div', { class: 'tz-preset-cards' });

    var BUILT_INFO = {
      thesis: { title: 'پایان‌نامه و دانشگاهی', desc: 'ارقام فارسی، جفت‌قلم آکادمیک، نیم‌فاصله کامل و تراز دوطرفه' },
      report: { title: 'گزارش اداری و فنی', desc: 'محافظت فنی از شناسه‌ها، ارقام هماهنگ و سازگار با آفیس' },
      slide: { title: 'اسلاید و پاورپوینت', desc: 'متن خوانا و تمیز برای ارائه‌ها بدون تراز دوطرفه' },
      email: { title: 'ایمیل و وب', desc: 'ساده، بدون نویسه‌های کنترلی، سازگار با انواع نرم‌افزارها' },
      chat: { title: 'متن چت', desc: 'کمترین تغییر در علائم و ارقام، حفظ ایموجی‌ها' },
      minimal: { title: 'حداقل تغییر', desc: 'فقط رفع مشکلات جهتی و نویسه‌های نامرئی خطرناک' }
    };

    function render() {
      cardsBox.textContent = '';
      var cur = P.current ? P.current() : null;
      var allPresets = P.list ? P.list() : [];

      allPresets.forEach(function (p) {
        var info = BUILT_INFO[p.id] || { title: P.title(p), desc: p.desc || '' };
        var isSelected = cur === p.id;
        var card = h('button', {
          type: 'button',
          class: 'tz-preset-card' + (isSelected ? ' active' : ''),
          'aria-pressed': String(isSelected),
          onclick: function () {
            P.apply(p.id);
            if (ctx && ctx.toast) ctx.toast('پیش‌تنظیم «' + info.title + '» اعمال شد.', 'ok');
            render();
          }
        },
          h('div', { class: 'tz-pc-top' },
            h('span', { class: 'tz-pc-name' }, info.title),
            isSelected ? h('span', { class: 'tz-pc-badge' }, 'فعال') : ''
          ),
          h('p', { class: 'tz-pc-desc' }, info.desc)
        );
        cardsBox.appendChild(card);
      });
    }

    render();
    T.on('settings:changed', render);
    T.on('presets:changed', render);

    wrap.append(title, cardsBox);
    container.appendChild(wrap);
  }

  function mountSixChoices(container, ctx) {
    var wrap = h('div', { class: 'tz-six-choices' });
    var secTitle = h('h3', { class: 'tz-sec-heading' }, 'شش انتخاب مهم و کاربردی');
    var list = h('div', { class: 'tz-choice-list' });

    var debouncedUpdates = [];
    function scheduleUpdates() {
      debouncedUpdates.forEach(function (fn) { fn(); });
    }
    var triggerLive = T.debounce(scheduleUpdates, 80);

    // 1. اعداد (Digits)
    (function () {
      var card = h('div', { class: 'tz-choice-card', 'data-choice': 'digits' });
      var head = h('div', { class: 'tz-cc-head' },
        h('h4', null, '۱. تبدیل اعداد و ارقام'),
        h('span', { class: 'tz-cc-sub' }, 'تنظیم شیوه نگارش اعداد متن اصلی و عبارت‌های فنی')
      );

      var proseBtns = [
        { v: 'fa', l: 'فارسی (۱۲۳)' },
        { v: 'lat', l: 'انگلیسی (123)' },
        { v: 'keep', l: 'مثل متن ورودی' }
      ];
      var proseGroup = h('div', { class: 'tz-choice-group' },
        h('span', { class: 'tz-cg-label' }, 'اعداد متن اصلی:'),
        h('div', { class: 'tz-seg', role: 'radiogroup' }, proseBtns.map(function (b) {
          return h('button', {
            type: 'button', role: 'radio',
            'data-v': b.v,
            onclick: function () { S().set('digProse', b.v); sync(); }
          }, b.l);
        }))
      );

      var techBtns = [
        { v: 'lat', l: 'انگلیسی (IEEE 1547)' },
        { v: 'keep', l: 'دست‌نخورده' },
        { v: 'fa', l: 'فارسی' }
      ];
      var techGroup = h('div', { class: 'tz-choice-group' },
        h('span', { class: 'tz-cg-label' }, 'اعداد داخل عبارت‌های فنی:'),
        h('div', { class: 'tz-seg', role: 'radiogroup' }, techBtns.map(function (b) {
          return h('button', {
            type: 'button', role: 'radio',
            'data-v': b.v,
            onclick: function () { S().set('digTech', b.v); sync(); }
          }, b.l);
        }))
      );

      var demoBox = h('div', { class: 'tz-live-demo' },
        h('span', { class: 'tz-ld-lbl' }, 'پیش‌نمایش زنده:'),
        h('span', { class: 'tz-ld-val', dir: 'rtl' })
      );

      function sync() {
        var pVal = S().get('digProse'), tVal = S().get('digTech');
        proseGroup.querySelectorAll('button').forEach(function (btn) {
          btn.setAttribute('aria-checked', String(btn.getAttribute('data-v') === pVal));
        });
        techGroup.querySelectorAll('button').forEach(function (btn) {
          btn.setAttribute('aria-checked', String(btn.getAttribute('data-v') === tVal));
        });
        var sample = 'در سال 2024 مطابق استاندارد IEEE 1547 نسخه v3.11 اجرا شد.';
        demoBox.querySelector('.tz-ld-val').textContent = runSample(sample);
      }

      debouncedUpdates.push(sync);
      card.append(head, proseGroup, techGroup, demoBox);
      list.appendChild(card);
    })();

    // 2. نیم‌فاصله (ZWNJ)
    (function () {
      var card = h('div', { class: 'tz-choice-card', 'data-choice': 'zwnj' });
      var head = h('div', { class: 'tz-cc-head' },
        h('h4', null, '۲. اصلاح و تنظیم نیم‌فاصله'),
        h('span', { class: 'tz-cc-sub' }, 'تعیین رفتار با پیشوندها و پسوندهای چسبیده یا جدا')
      );

      var zwnjBtns = [
        { v: 'keep', l: 'نگه‌دار' },
        { v: 'all', l: 'استانداردسازی کامل' },
        { v: 'mi', l: 'فقط «می» و «نمی»' },
        { v: 'suffix', l: 'فقط پسوندها (ها، تر، ترين)' }
      ];
      var group = h('div', { class: 'tz-seg wrap', role: 'radiogroup' }, zwnjBtns.map(function (b) {
        return h('button', {
          type: 'button', role: 'radio',
          'data-v': b.v,
          onclick: function () { S().set('zwConvert', b.v); sync(); }
        }, b.l);
      }));

      var demoBox = h('div', { class: 'tz-live-demo' },
        h('span', { class: 'tz-ld-lbl' }, 'پیش‌نمایش زنده:'),
        h('span', { class: 'tz-ld-val', dir: 'rtl' })
      );

      function sync() {
        var val = S().get('zwConvert');
        group.querySelectorAll('button').forEach(function (btn) {
          btn.setAttribute('aria-checked', String(btn.getAttribute('data-v') === val));
        });
        var sample = 'می روم و کتاب ها و دست نیافتنی ترين ها را می خوانم.';
        demoBox.querySelector('.tz-ld-val').textContent = runSample(sample);
      }

      debouncedUpdates.push(sync);
      card.append(head, group, demoBox);
      list.appendChild(card);
    })();

    // 3. فاصله فارسی و انگلیسی
    (function () {
      var card = h('div', { class: 'tz-choice-card', 'data-choice': 'spacing' });
      var head = h('div', { class: 'tz-cc-head' },
        h('h4', null, '۳. فاصلهٔ بین کلمات فارسی و انگلیسی'),
        h('span', { class: 'tz-cc-sub' }, 'جلوگیری از چسبیدن متن لاتین به متن فارسی در آفیس')
      );

      var spBtns = [
        { v: 'zwnj', l: 'نیم‌فاصله هوشمند' },
        { v: 'space', l: 'فاصله معمولی' },
        { v: 'off', l: 'دست‌نخورده' }
      ];
      var group = h('div', { class: 'tz-seg', role: 'radiogroup' }, spBtns.map(function (b) {
        return h('button', {
          type: 'button', role: 'radio',
          'data-v': b.v,
          onclick: function () { S().set('spMode', b.v); sync(); }
        }, b.l);
      }));

      var demoBox = h('div', { class: 'tz-live-demo' },
        h('span', { class: 'tz-ld-lbl' }, 'پیش‌نمایش زنده:'),
        h('span', { class: 'tz-ld-val', dir: 'rtl' })
      );

      function sync() {
        var val = S().get('spMode');
        group.querySelectorAll('button').forEach(function (btn) {
          btn.setAttribute('aria-checked', String(btn.getAttribute('data-v') === val));
        });
        var sample = 'نرم‌افزارWordرا باز کرده و فایلExcelرا ببینید.';
        demoBox.querySelector('.tz-ld-val').textContent = runSample(sample);
      }

      debouncedUpdates.push(sync);
      card.append(head, group, demoBox);
      list.appendChild(card);
    })();

    // 4. فرمول‌ها (Formulas)
    (function () {
      var card = h('div', { class: 'tz-choice-card', 'data-choice': 'math' });
      var head = h('div', { class: 'tz-cc-head' },
        h('h4', null, '۴. فرمول‌ها و عبارات ریاضی'),
        h('span', { class: 'tz-cc-sub' }, 'قالب‌بندی فرمول‌ها برای معادلات آفیس، متن یا لاتک')
      );

      var mathBtns = [
        { v: 'A', l: 'LaTeX استاندارد (معادله Word)' },
        { v: 'B', l: 'متن ساده خطی' },
        { v: 'keep', l: 'دست‌نخورده' }
      ];
      var group = h('div', { class: 'tz-seg', role: 'radiogroup' }, mathBtns.map(function (b) {
        return h('button', {
          type: 'button', role: 'radio',
          'data-v': b.v,
          onclick: function () { S().set('mathMode', b.v); sync(); }
        }, b.l);
      }));

      var demoBox = h('div', { class: 'tz-live-demo' },
        h('span', { class: 'tz-ld-lbl' }, 'نمونه تبدیل فرمول:'),
        h('span', { class: 'tz-ld-val tz-mono', dir: 'ltr' })
      );

      function sync() {
        var val = S().get('mathMode');
        group.querySelectorAll('button').forEach(function (btn) {
          btn.setAttribute('aria-checked', String(btn.getAttribute('data-v') === val));
        });
        var sample = 'انرژی خازن $E=\\frac{1}{2}CV^2$ است.';
        demoBox.querySelector('.tz-ld-val').textContent = runSample(sample);
      }

      debouncedUpdates.push(sync);
      card.append(head, group, demoBox);
      list.appendChild(card);
    })();

    // 5. فونت (Fonts)
    (function () {
      var card = h('div', { class: 'tz-choice-card', 'data-choice': 'fonts' });
      var head = h('div', { class: 'tz-cc-head' },
        h('h4', null, '۵. جفت‌قلم‌های پیشنهادی متن و خروجی'),
        h('span', { class: 'tz-cc-sub' }, 'هماهنگی قلم فارسی و انگلیسی برای ظاهر حرفه‌ای')
      );

      var pairBtns = [
        { v: 'thesis', l: 'B Nazanin + Times' },
        { v: 'journal', l: 'B Zar + Garamond' },
        { v: 'modern', l: 'Vazirmatn + Inter' },
        { v: 'office', l: 'B Mitra + Calibri' },
        { v: 'clean', l: 'Tahoma + Arial' },
        { v: 'none', l: 'انتخاب دستی' }
      ];
      var group = h('div', { class: 'tz-seg wrap', role: 'radiogroup' }, pairBtns.map(function (b) {
        return h('button', {
          type: 'button', role: 'radio',
          'data-v': b.v,
          onclick: function () { S().set('fnPair', b.v); sync(); }
        }, b.l);
      }));

      var warn = h('div', { class: 'tz-font-warn', hidden: true });
      var specimen = h('div', { class: 'tz-live-demo' },
        h('span', { class: 'tz-ld-lbl' }, 'نمونه قلم:'),
        h('div', { class: 'tz-specimen-text', dir: 'rtl' }, 'سلام دنیا؛ این یک متن نمونه برای ارزیابی قلم فارسی و English است.')
      );

      function sync() {
        var F = T.get('fonts');
        var val = S().get('fnPair');
        group.querySelectorAll('button').forEach(function (btn) {
          btn.setAttribute('aria-checked', String(btn.getAttribute('data-v') === val));
        });

        if (F && F.resolve) {
          var r = F.resolve(S().all());
          specimen.querySelector('.tz-specimen-text').style.fontFamily = r.faStack;
          var missing = F.check ? F.check(S().all()).filter(function (c) { return c.installed === false; }) : [];
          if (missing.length > 0) {
            warn.hidden = false;
            warn.textContent = 'توجه: قلم «' + missing.map(function (x) { return x.name; }).join('، ') + '» روی این رایانه نصب نیست؛ در Word جایگزین خواهد شد.';
          } else {
            warn.hidden = true;
          }
        }
      }

      debouncedUpdates.push(sync);
      card.append(head, group, warn, specimen);
      list.appendChild(card);
    })();

    // 6. مقصد خروجی (Destination)
    (function () {
      var card = h('div', { class: 'tz-choice-card', 'data-choice': 'dest' });
      var head = h('div', { class: 'tz-cc-head' },
        h('h4', null, '۶. استراتژی ایمنی خروجی'),
        h('span', { class: 'tz-cc-sub' }, 'روش جهت‌دهی و نویسه‌های نامرئی برای مایکروسافت آفیس')
      );

      var stratBtns = [
        { v: 'rlm', l: 'علامت RLM (بهترین برای Word)' },
        { v: 'none', l: 'بدون نویسه اضافی (متن ساده)' },
        { v: 'isolates', l: 'جداسازهای یونیکد (ایزوله)' }
      ];
      var group = h('div', { class: 'tz-seg wrap', role: 'radiogroup' }, stratBtns.map(function (b) {
        return h('button', {
          type: 'button', role: 'radio',
          'data-v': b.v,
          onclick: function () { S().set('ptStrategy', b.v); sync(); }
        }, b.l);
      }));

      var demoBox = h('div', { class: 'tz-live-demo' },
        h('span', { class: 'tz-ld-lbl' }, 'توضیح فنی:'),
        h('span', { class: 'tz-ld-val', dir: 'rtl' })
      );

      var STRAT_DESC = {
        rlm: 'نویسه نامرئی جهت‌دهی راست‌به‌چپ (RLM) اضافه می‌شود تا در Word بدون نمایش مربع نامعتبر باقی بماند.',
        none: 'هیچ نویسه نامرئی تزریق نمی‌شود؛ سبک‌ترین و خالص‌ترین حالت برای کپی متن ساده.',
        isolates: 'از جداکننده‌های دایرکشن یونیکد استفاده می‌شود؛ مناسب وب و سیستم‌های لینوکسی.'
      };

      function sync() {
        var val = S().get('ptStrategy');
        group.querySelectorAll('button').forEach(function (btn) {
          btn.setAttribute('aria-checked', String(btn.getAttribute('data-v') === val));
        });
        demoBox.querySelector('.tz-ld-val').textContent = STRAT_DESC[val] || STRAT_DESC.rlm;
      }

      debouncedUpdates.push(sync);
      card.append(head, group, demoBox);
      list.appendChild(card);
    })();

    triggerLive();
    T.on('settings:changed', triggerLive);

    wrap.append(secTitle, list);
    container.appendChild(wrap);
  }

  T.register('ui.settingsCards', {
    mountPresets: mountPresets,
    mountSixChoices: mountSixChoices
  });
})(window.Taraz = window.Taraz || {});
