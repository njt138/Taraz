// Tarāz review strip: live summary badges (Office safety, health, changes, formulas, fonts).
(function (T) {
  'use strict';
  var h = T.h, fa = T.fa;

  function mount(container, ctx) {
    var strip = h('div', { class: 'tz-review-strip', role: 'region', 'aria-label': 'خلاصه بررسی کیفیت' });

    var badgeSafe = h('button', {
      type: 'button', class: 'tz-rb tz-rb-safe ok',
      title: 'وضعیت سازگاری با مایکروسافت آفیس - کلیک برای مشاهده برگه ایمنی',
      onclick: function () {
        var U = T.get('ui');
        if (U && U.activate) U.activate('safety');
      }
    });

    var badgeHealth = h('button', {
      type: 'button', class: 'tz-rb tz-rb-health',
      title: 'شاخص سلامت متن - کلیک برای بررسی پرتو ایکس',
      onclick: function () {
        var U = T.get('ui');
        if (U && U.activate) U.activate('xray');
      }
    });

    var badgeChanges = h('button', {
      type: 'button', class: 'tz-rb tz-rb-changes',
      title: 'تعداد تغییرات اعمال‌شده - کلیک برای مشاهده مقایسه',
      onclick: function () {
        var U = T.get('ui');
        if (U && U.activate) U.activate('diff');
      }
    });

    var badgeMath = h('button', {
      type: 'button', class: 'tz-rb tz-rb-math',
      title: 'وضعیت فرمول‌ها و معادلات - کلیک برای تنظیمات فرمول',
      onclick: function () {
        var U = T.get('ui');
        if (U && U.activate) U.activate('formulas');
      }
    });

    var badgeFont = h('button', {
      type: 'button', class: 'tz-rb tz-rb-font',
      title: 'قلم خروجی - کلیک برای تنظیمات قلم',
      onclick: function () {
        var S = T.get('ui.settings');
        if (S && S.reveal) S.reveal('fnPair');
      }
    });

    strip.append(badgeSafe, badgeHealth, badgeChanges, badgeMath, badgeFont);
    container.appendChild(strip);

    function update(st) {
      if (!st || !st.result) {
        strip.hidden = true;
        return;
      }
      strip.hidden = false;
      var r = st.result, S = st.settings || {}, F = T.get('fonts');

      // 1. Office-safe badge
      var errs = st.errs || 0;
      if (errs === 0) {
        badgeSafe.className = 'tz-rb tz-rb-safe ok';
        badgeSafe.textContent = '✓ ایمن برای Word';
      } else {
        badgeSafe.className = 'tz-rb tz-rb-safe bad';
        badgeSafe.textContent = '⚠ ' + fa(errs) + ' نویسه ناامن';
      }

      // 2. Health badge
      var hl = typeof st.health === 'number' ? st.health : (typeof r.health === 'number' ? r.health : 100);
      badgeHealth.className = 'tz-rb tz-rb-health ' + (hl >= 90 ? 'ok' : (hl >= 60 ? 'warn' : 'bad'));
      badgeHealth.textContent = 'سلامت متن: ' + fa(hl) + '٪' + (st.stale ? ' (در انتظار)' : '');

      // 3. Changes badge
      var ch = (r.changes || []).length;
      badgeChanges.className = 'tz-rb tz-rb-changes';
      badgeChanges.textContent = ch > 0 ? (fa(ch) + ' ویرایش خودکار') : 'بدون نیاز به ویرایش';

      // 4. Formulas badge
      var forms = (r.formulas || []).length;
      if (forms > 0) {
        badgeMath.hidden = false;
        var modeLabels = { A: 'LaTeX معادله', B: 'متن ساده', keep: 'دست‌نخورده' };
        var mLabel = modeLabels[S.mathMode] || 'LaTeX';
        badgeMath.className = 'tz-rb tz-rb-math';
        badgeMath.textContent = fa(forms) + ' فرمول (' + mLabel + ')';
      } else {
        badgeMath.hidden = true;
      }

      // 5. Font badge
      var fnInfo = F && F.resolve ? F.resolve(S) : null;
      if (fnInfo) {
        badgeFont.hidden = false;
        var pName = S.fnPair && S.fnPair !== 'none' ? (T.sp ? T.sp('font.pair.' + S.fnPair, S.fnPair) : S.fnPair) : (fnInfo.fa + ' + ' + fnInfo.en);
        var uninstalled = F.check ? F.check(S).some(function (c) { return c.installed === false; }) : false;
        badgeFont.className = 'tz-rb tz-rb-font' + (uninstalled ? ' warn' : '');
        badgeFont.textContent = (uninstalled ? '⚠ ' : '') + 'قلم: ' + pName;
      } else {
        badgeFont.hidden = true;
      }
    }

    return { update: update };
  }

  T.register('ui.reviewStrip', { mount: mount });
})(window.Taraz = window.Taraz || {});
