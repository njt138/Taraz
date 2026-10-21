// Tarāz Persian strings for the settings panel, presets and command palette; T.sp(key,fallback) resolves them.
(function(T){
'use strict';
var SP={
'sp.search':'جست‌وجو در تنظیمات…','sp.simple':'ساده','sp.pro':'حرفه‌ای','sp.mode':'سطح نمایش','sp.pinShort':'سنجاق','sp.pin':'سنجاق‌کردن پنل کنار صفحه',
'sp.default':'پیش‌فرض','sp.modified':'تغییر کرده','sp.reset':'بازنشانی این گزینه','sp.none':'نتیجه‌ای پیدا نشد.',
'sp.sec.presets':'پیش‌تنظیم‌ها','sp.sec.digits':'ارقام و نشانه‌گذاری','sp.sec.spacing':'فاصله‌گذاری و نیم‌فاصله','sp.sec.direction':'جهت متن','sp.sec.fonts':'قلم‌ها',
'sp.sec.math':'ریاضی و LaTeX','sp.sec.cleanup':'پاک‌سازی','sp.sec.protect':'محافظت فنی','sp.sec.output':'خروجی آفیس','sp.sec.advanced':'پیشرفته',
'sp.demo.before':'قبل','sp.demo.after':'بعد','sp.demo.digits':'نمونهٔ زنده: ارقام','sp.demo.spacing':'نمونهٔ زنده: چسبیدگی فارسی و لاتین','sp.demo.zwnj':'نمونهٔ زنده: نیم‌فاصله','sp.demo.fonts':'نمونهٔ قلم',
'sp.s.digits':'در سال 2024 مبلغ 12500 تومان و نسخهٔ v3.11 در https://example.com',
'sp.s.spacing':'فایلExcelرا باز کنید و(Word)را ببندید.',
'sp.s.zwnj':'می روم و کتاب ها را می خوانم.',
'sp.s.fa':'سلام دنیا؛ این یک نمونهٔ متن فارسی ۱۲۳ است.','sp.s.en':'The quick brown fox — Tarāz 123',
'sp.s.preset':'او گفت: "سلام" و فایل Word را با 12 فصل باز كرد... مي روم.',
'sp.font.missing':'قلم «%s» روی این دستگاه نصب نیست؛ Word جایگزین می‌کند.','sp.font.pairs':'جفت‌قلم‌های پیشنهادی',
'sp.list.add':'افزودن و Enter','sp.list.remove':'حذف',
'sp.pr.current':'پیش‌تنظیم','sp.pr.custom':'سفارشی','sp.pr.manage':'مدیریت پیش‌تنظیم‌ها…','sp.pr.applied':'پیش‌تنظیم اعمال شد','sp.pr.mine':'پیش‌تنظیم‌های من',
'sp.pr.name':'نام پیش‌تنظیم تازه','sp.pr.save':'ذخیرهٔ تنظیمات فعلی','sp.pr.saved':'پیش‌تنظیم ذخیره شد','sp.pr.rename':'تغییر نام','sp.pr.del':'حذف','sp.pr.delAsk':'این پیش‌تنظیم حذف شود؟',
'sp.export':'برون‌ریزی تنظیمات (JSON)','sp.import':'درون‌ریزی تنظیمات (JSON)','sp.resetAll':'بازنشانی همه به پیش‌فرض','sp.resetDone':'همه تنظیمات به پیش‌فرض برگشت',
'sp.importOk':'تنظیمات درون‌ریزی شد (%n مورد)','sp.importBad':'فایل تنظیمات معتبر نیست',
'sp.privacy':'تنظیمات و پیش‌تنظیم‌های شما فقط در همین مرورگر ذخیره می‌شوند و هرگز به جایی ارسال نمی‌شوند.',
'sp.pr.thesis.name':'پایان‌نامه','sp.pr.thesis.desc':'نیم‌فاصله و ارقام فارسی، علائم فارسی، جفت‌قلم آکادمیک و تراز دوطرفه',
'sp.pr.report.name':'گزارش فنی','sp.pr.report.desc':'ارقام فارسی با محافظت کامل از کد، نشانی و نسخه‌ها',
'sp.pr.slide.name':'اسلاید پاورپوینت','sp.pr.slide.desc':'متن خوانا، بدون نشانه‌های مارک‌داون و بدون تراز دوطرفه',
'sp.pr.email.name':'ایمیل','sp.pr.email.desc':'ساده و سازگار با نرم‌افزارهای ایمیل؛ شماره‌گذاری متنی',
'sp.pr.chat.name':'پیام چت','sp.pr.chat.desc':'کمترین دخالت؛ ایموجی و ارقام دست‌نخورده',
'sp.pr.minimal.name':'کمترین تغییر','sp.pr.minimal.desc':'فقط رفع نویسه‌های مخرب و مشکل جهت',
'sp.pr.max.name':'پاک‌سازی کامل','sp.pr.max.desc':'همهٔ پاک‌سازی‌ها و استانداردسازی‌ها فعال',
'sp.pal.ph':'جست‌وجوی تنظیم، پیش‌تنظیم یا عمل…','sp.pal.none':'چیزی پیدا نشد','sp.pal.opt':'تنظیم','sp.pal.preset':'پیش‌تنظیم','sp.pal.act':'عمل',
'sp.act.settings':'باز کردن تنظیمات','sp.act.mode':'جابه‌جایی ساده / حرفه‌ای','sp.act.pin':'سنجاق‌کردن پنل تنظیمات','sp.act.theme':'تغییر پوسته',
'sp.act.copyWord':'کپی برای Word','sp.act.copyPpt':'کپی برای پاورپوینت','sp.act.copyPlain':'کپی متن ساده',
'sp.act.export':'برون‌ریزی تنظیمات','sp.act.import':'درون‌ریزی تنظیمات','sp.act.reset':'بازنشانی همه تنظیمات'
};
/** T.sp(key, fallback): panel strings first, then T.t, else fallback (or key). */
T.sp=function(k,fb){var v;if(SP[k]!=null)return SP[k];try{v=T.t&&T.t(k);}catch(e){}return v&&String(v).indexOf(k)<0?v:(fb!=null?fb:k);};
T.register('sp.fa',SP);
})(window.Taraz=window.Taraz||{});