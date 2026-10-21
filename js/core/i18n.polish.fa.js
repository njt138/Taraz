// Tarāz i18n (fa): tour + tab-diagnostic strings; T.pt(key, args) = T.t → this table → key.
(function (T) {
  'use strict';
  var FA = {
    'tab.missing': 'ماژول {m} ثبت نشده است · فایل {f}',
    'tab.notLoaded': 'فایل {f} بارگذاری نشد (وجود ندارد یا خطا دارد) · ماژول {m}',
    'tab.failed': 'ماژول {m} هنگام نمایش خطا داد: {e} · فایل {f}',
    'tour.open': 'راهنما', 'tour.step': 'گام {i} از {n}', 'tour.next': 'بعدی', 'tour.back': 'قبلی', 'tour.skip': 'رد کردن راهنما', 'tour.done': 'شروع کار',
    'tour.s1.t': 'متن را بچسبانید',
    'tour.s1.b': 'متن کپی‌شده از چت را اینجا بچسبانید (Ctrl+V) یا فایل ‎.txt/.md‎ را رها کنید. برای آزمایش از منوی «نمونه‌ها» استفاده کنید.',
    'tour.s2.t': 'پیش‌تنظیم را انتخاب کنید',
    'tour.s2.b': 'برای Word یا PowerPoint پیش‌تنظیم مناسب را انتخاب کنید. همهٔ گزینه‌ها بعداً در «تنظیمات» (Ctrl+K برای جست‌وجو) قابل تغییرند.',
    'tour.s3.t': 'نتیجه را بررسی کنید',
    'tour.s3.b': 'پیش‌نمایش، پرتو ایکس (جهت هر تکه)، تفاوت‌ها (با امکان رد هر تغییر)، فرمول‌ها و ایمنی را ببینید. تراز سبز یعنی خروجی برای Office امن است.',
    'tour.s4.t': 'کپی کنید',
    'tour.s4.b': 'این دکمه متن را برای Word کپی می‌کند (Ctrl+Enter). دکمه‌های کنار آن برای PowerPoint، متن ساده و متن اصلی‌اند. سپس در Word با Ctrl+V بچسبانید.',
    'sp.act.settings': 'تنظیمات تراز',
    'sp.act.mode': 'تغییر حالت تنظیمات (ساده / پیشرفته)',
    'sp.act.pin': 'سنجاق‌کردن / شناورکردن کشوی تنظیمات',
    'sp.act.theme': 'تغییر حالت تم (روشن / تیره)',
    'sp.act.help': 'راهنما و کلیدهای میان‌بر',
    'sp.act.copyWord': 'کپی برای Word',
    'sp.act.copyPpt': 'کپی برای PowerPoint',
    'sp.act.copyPlain': 'کپی متن ساده',
    'sp.act.export': 'برون‌بری تنظیمات به فایل JSON',
    'sp.act.import': 'درون‌ریزی تنظیمات از فایل JSON',
    'sp.act.reset': 'بازنشانی همه تنظیمات به حالت پیش‌فرض',
    'sp.resetDone': 'تنظیمات با موفقیت بازنشانی شد.',
    'sp.pr.applied': 'پیش‌تنظیم اعمال شد',
    'sp.importBad': 'خطا در بارگذاری تنظیمات',
    'sp.pal.none': 'نتیجه‌ای برای جست‌وجو یافت نشد',
    'sp.pr.current': 'پیش‌تنظیم',
    'sp.pr.custom': 'سفارشی',
    'sp.pr.manage': 'مدیریت پیش‌تنظیم‌ها…',
    'sp.privacy': 'پردازش کاملاً محلی در مرورگر انجام می‌شود',
    'sp.pr.thesis.name': 'پایان‌نامه و مقاله',
    'sp.pr.thesis.desc': 'قالب‌بندی دانشگاهی با ارقام فارسی، گیومه و تنظیمات دقیق',
    'sp.pr.report.name': 'گزارش رسمی و اداری',
    'sp.pr.report.desc': 'مناسب مکاتبات اداری، بدون کشیدگی و با نشانه‌گذاری استاندارد',
    'sp.pr.slide.name': 'اسلاید و ارائه (PowerPoint)',
    'sp.pr.slide.desc': 'بهینه‌شده برای اسلایدهای پاورپوینت',
    'sp.pr.email.name': 'نامه و رایانامه (Email)',
    'sp.pr.email.desc': 'فرمت ساده و خوانا برای ارسال در پیام‌رسان‌ها و ایمیل',
    'sp.pr.chat.name': 'پیام‌رسان و چت',
    'sp.pr.chat.desc': 'حفظ ساختار متن بدون تغییر در ارقام و نشانه‌ها',
    'sp.pr.minimal.name': 'حداقل ویرایش',
    'sp.pr.minimal.desc': 'فقط اصلاح نیم‌فاصله‌های بحرانی',
    'sp.pr.max.name': 'حداکثر استانداردسازی',
    'sp.pr.max.desc': 'اعمال تمام قوانین ویراستاری فارسی، اعراب و نشانه‌گذاری'
  };
  T.register('i18n.polish', FA);
  /** Polish strings with {name} interpolation (numbers → Persian digits when T.fa exists). */
  T.pt = function (k, a) {
    var s; try { s = T.t && T.t(k); } catch (e) { }
    if (!s || s === k) s = FA[k] != null ? FA[k] : k;
    return a ? String(s).replace(/\{(\w+)\}/g, function (m, x) { var v = a[x]; return v == null ? m : typeof v === 'number' && T.fa ? T.fa(v) : String(v); }) : s;
  };
  /** Palette string lookup with fallback */
  T.sp = function (k, f) {
    if (FA[k] != null) return FA[k];
    try { var s = T.t && T.t(k); if (s && s !== k) return s; } catch (e) { }
    return f != null ? f : k;
  };
})(window.Taraz = window.Taraz || {});
