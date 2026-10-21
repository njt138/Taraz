// Tarāz help center: راهنما dialog with tabs, shortcut sheet, troubleshooting, tour trigger.
(function (T) {
  'use strict';
  var h = T.h;
  var dlgEl = null;

  var KEYS = [
    ['Ctrl+Enter', 'پردازش و کپی برای Word (دکمه اصلی)'],
    ['Ctrl+Shift+C', 'کپی برای Word'],
    ['Ctrl+Shift+P', 'کپی برای PowerPoint'],
    ['Ctrl+K', 'جعبه فرمان (جست‌وجوی سریع)'],
    ['Esc', 'بستن کشو، منو یا پنجره'],
    ['?', 'نمایش این راهنما']
  ];

  function kbd(s) {
    return h('kbd', { dir: 'ltr', style: 'white-space:nowrap' }, s);
  }

  function section(title, body) {
    return h('div', { class: 'tz-help-sec' },
      h('h3', { class: 'tz-help-sh' }, title),
      body
    );
  }

  function buildContent() {
    var tabData = [
      { id: 'start', label: 'شروع سریع' },
      { id: 'word', label: 'چسباندن در Word' },
      { id: 'ppt', label: 'چسباندن در PowerPoint' },
      { id: 'formulas', label: 'فرمول‌ها' },
      { id: 'keys', label: 'میان‌برها' },
      { id: 'trouble', label: 'عیب‌یابی' }
    ];

    var panes = {};

    panes.start = h('div', { class: 'tz-help-pane' },
      h('ol', { class: 'tz-help-steps-list' },
        h('li', null,
          h('strong', null, '۱. متن را بچسبانید'),
          h('p', null, 'متن را از چت‌بات، ایمیل یا هر منبع دیگری در کادر ورودی بچسبانید. فایل txt. یا md. هم با درگ‌اندراپ قابل بارگذاری است.')
        ),
        h('li', null,
          h('strong', null, '۲. پیش‌تنظیم را انتخاب کنید'),
          h('p', null, 'از دکمه پیش‌تنظیم در نوار بالا یا تنظیمات، نوع سند را انتخاب کنید (پایان‌نامه، گزارش، اسلاید…).')
        ),
        h('li', null,
          h('strong', null, '۳. کپی کنید'),
          h('p', null, 'دکمه «پردازش و کپی» را بزنید، سپس در Word با Ctrl+V بچسبانید.')
        )
      )
    );

    panes.word = h('div', { class: 'tz-help-pane' },
      h('p', null, 'پس از کپی در تراز، Word را باز کنید:'),
      h('ol', { class: 'tz-help-steps-list' },
        h('li', null, 'Ctrl+V را بزنید.'),
        h('li', null, 'اگر متن بدون قالب چسبید، گزینه «Keep Source Formatting» یا «نگه‌داشتن قالب منبع» را انتخاب کنید.'),
        h('li', null, 'اگر جهت متن اشتباه بود، راست‌کلیک و «Paragraph» ← «Right-to-Left» را انتخاب کنید.')
      ),
      h('p', { class: 'tz-help-note' }, 'نکته: تراز نویسه‌های کنترلی که Word آن‌ها را مربع نشان می‌دهد حذف می‌کند.')
    );

    panes.ppt = h('div', { class: 'tz-help-pane' },
      h('p', null, 'برای PowerPoint از «کپی برای…» ← «پاورپوینت (PowerPoint)» استفاده کنید:'),
      h('ol', { class: 'tz-help-steps-list' },
        h('li', null, 'یک کادر متن در اسلاید انتخاب کنید.'),
        h('li', null, 'Ctrl+V را بزنید.'),
        h('li', null, 'اگر قلم تغییر کرد، آن را دستی به قلم دلخواه تغییر دهید.')
      ),
      h('p', { class: 'tz-help-note' }, 'نکته: اندازه قلم در خروجی پاورپوینت حذف می‌شود تا قالب اسلاید حاکم باشد.')
    );

    panes.formulas = h('div', { class: 'tz-help-pane' },
      h('p', null, 'سه حالت پردازش فرمول وجود دارد:'),
      h('dl', { class: 'tz-help-dl' },
        h('dt', null, 'LaTeX استاندارد (معادله Word)'),
        h('dd', null, 'در Word از Insert ← Equation ← LaTeX بچسبانید و «Convert» را بزنید. نیاز به Word 365 دارد.'),
        h('dt', null, 'متن ساده خطی'),
        h('dd', null, 'فرمول به شکل متنی خطی تبدیل می‌شود؛ برای پاورپوینت مناسب است.'),
        h('dt', null, 'دست‌نخورده'),
        h('dd', null, 'فرمول LaTeX بدون تغییر نگه داشته می‌شود.')
      )
    );

    panes.keys = h('div', { class: 'tz-help-pane' },
      h('table', { class: 'tz-help-keys' },
        h('tbody', null, KEYS.map(function (k) {
          return h('tr', null,
            h('td', { class: 'tz-help-kd' }, kbd(k[0])),
            h('td', null, k[1])
          );
        }))
      )
    );

    panes.trouble = h('div', { class: 'tz-help-pane' },
      h('dl', { class: 'tz-help-dl' },
        h('dt', null, 'مربع در Word'),
        h('dd', null, 'معمولاً نویسه کنترلی LRI/PDI است. تراز آن‌ها را حذف می‌کند؛ از پیش‌تنظیم «گزارش اداری» استفاده کنید.'),
        h('dt', null, 'کلمات فارسی و انگلیسی چسبیده'),
        h('dd', null, 'در تنظیمات → انتخاب ۳ → «نیم‌فاصله هوشمند» را انتخاب کنید.'),
        h('dt', null, 'ارقام اشتباه'),
        h('dd', null, 'در تنظیمات → انتخاب ۱ → نوع ارقام را تغییر دهید.'),
        h('dt', null, 'نیم‌فاصله خراب'),
        h('dd', null, 'در تنظیمات → انتخاب ۲ → «استانداردسازی کامل» را انتخاب کنید.')
      ),
      h('div', { class: 'tz-help-actions' },
        h('button', {
          type: 'button', class: 'tz-btn',
          onclick: function () {
            var tour = T.get('tour');
            if (tour) { closeDlg(); tour.reset(); setTimeout(function () { tour.start(); }, 100); }
          }
        }, 'تور راهنما را دوباره ببین')
      )
    );

    var curTab = 'start';
    var tabBtns = {};
    var tabList = h('div', { class: 'tz-help-tabs', role: 'tablist' });
    var paneBox = h('div', { class: 'tz-help-panes' });

    tabData.forEach(function (td) {
      var btn = h('button', {
        type: 'button', class: 'tz-help-tab',
        role: 'tab', id: 'tz-ht-' + td.id,
        'aria-controls': 'tz-hp-' + td.id,
        'aria-selected': td.id === curTab ? 'true' : 'false',
        onclick: function () { activateTab(td.id); }
      }, td.label);
      tabBtns[td.id] = btn;
      tabList.appendChild(btn);

      var pane = h('div', {
        class: 'tz-help-pane-wrap',
        id: 'tz-hp-' + td.id,
        role: 'tabpanel',
        'aria-labelledby': 'tz-ht-' + td.id
      }, panes[td.id]);
      pane.hidden = td.id !== curTab;
      paneBox.appendChild(pane);
    });

    function activateTab(id) {
      curTab = id;
      Object.keys(tabBtns).forEach(function (k) {
        tabBtns[k].setAttribute('aria-selected', String(k === id));
      });
      paneBox.querySelectorAll('.tz-help-pane-wrap').forEach(function (p) {
        p.hidden = p.id !== 'tz-hp-' + id;
      });
    }

    return h('div', { class: 'tz-help-body' }, tabList, paneBox);
  }

  function closeDlg() {
    if (dlgEl && dlgEl.close) dlgEl.close();
    dlgEl = null;
  }

  function open() {
    if (dlgEl) { dlgEl.focus(); return; }
    var body = buildContent();
    var closeBtn = h('button', {
      type: 'button', class: 'tz-btn icon', 'aria-label': 'بستن راهنما',
      onclick: closeDlg
    }, T.icon ? T.icon('x', 18) : '×');

    dlgEl = h('dialog', { class: 'tz-dlg tz-help-dlg', 'aria-label': 'راهنمای تراز' },
      h('div', { class: 'tz-sh' },
        h('h2', null, 'راهنمای تراز'),
        closeBtn
      ),
      body
    );

    dlgEl.addEventListener('close', function () { dlgEl = null; });
    dlgEl.addEventListener('click', function (e) { if (e.target === dlgEl) dlgEl.close(); });
    document.body.appendChild(dlgEl);
    if (dlgEl.showModal) dlgEl.showModal(); else dlgEl.setAttribute('open', '');
    dlgEl.focus();
  }

  function mountBtn(tools) {
    if (document.getElementById('tz-help-btn')) return;
    var btn = h('button', {
      type: 'button', class: 'tz-btn', id: 'tz-help-btn',
      'aria-label': 'راهنما',
      onclick: open
    }, T.icon ? T.icon('sample', 18) : '', h('span', { class: 'l2' }, 'راهنما'));
    tools.insertBefore(btn, tools.firstChild);
  }

  function init() {
    var tools = document.querySelector('.tz-tools');
    if (tools) mountBtn(tools);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return;
    var a = document.activeElement, tg = a && a.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || (a && a.isContentEditable)) return;
    if (document.querySelector('dialog[open]')) return;
    e.preventDefault(); open();
  });

  T.register('ui.help', { open: open, close: closeDlg });
  if (document.querySelector('.tz-tools')) init(); else T.on('ui:ready', init);
})(window.Taraz = window.Taraz || {});
