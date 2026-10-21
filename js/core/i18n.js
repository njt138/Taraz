// Tarāz i18n: all Persian UI strings live here. T.t(key, vars) replaces {name} placeholders.
(function(T){
'use strict';
var S={
'app.title':'تراز — درست‌سازی متن فارسی–انگلیسی برای ورد و پاورپوینت',
'app.name':'تراز',
'app.tagline':'متن‌های فارسی–انگلیسی و فرمول‌های چت هوش مصنوعی را برای ورد و پاورپوینت تراز می‌کند.',
'app.input':'متن ورودی',
'app.inputPh':'متن چت را اینجا جای‌گذاری کنید…',
'app.output':'خروجی',
'app.outputPh':'خروجی اینجا نمایش داده می‌شود',
'app.engineMissing':'موتور تراز هنوز نصب نشده است؛ فعلاً همان متن ورودی نمایش داده می‌شود.',
'app.chars':'{n} نویسه',
'module.missing':'این بخش هنوز نصب نشده',
'dev.missingFiles':'فایل‌های نصب‌نشده ({n})',
'theme.label':'پوسته',
'theme.auto':'خودکار',
'theme.light':'روشن',
'theme.dark':'تیره',
'contrast.label':'کنتراست بالا',
'opt.theme.help':'ظاهر برنامه؛ حالت خودکار از تنظیم سیستم پیروی می‌کند.',
'opt.highContrast.help':'رنگ‌ها و خطوط را برای خوانایی بیشتر پررنگ می‌کند.',
'group.view':'نمایش',
'group.general':'عمومی',
'err.offline':'بارگذاری کتابخانهٔ خارجی ممکن نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.',
'err.badUrl':'نشانی کتابخانه مجاز نیست.',
'settings.importOk':'تنظیمات وارد شد ({n} مورد).',
'settings.importBad':'فایل تنظیمات معتبر نیست.',
'tests.title':'آزمون‌های تراز',
'tests.run':'اجرای دوباره',
'tests.filter':'فیلتر بر اساس نام',
'tests.summary':'{pass} موفق · {fail} ناموفق · {skip} ردشده · {total} کل',
'tests.none':'آزمونی ثبت نشده است.',
'tests.skipNoEngine':'ردشد: موتور نصب نیست',
'tests.returnedFalse':'تابع expect مقدار false برگرداند',
'tests.threw':'استثنا: {msg}',
'tests.back':'بازگشت به برنامه',
'tests.running':'در حال اجرا…',
'tests.ms':'{n} م‌ث',
'tests.input':'ورودی'
};
/** Translate a key; unknown keys return the key itself (and are recorded in t.missing). */
function t(k,v){
  var s=S[k];
  if(s==null){t.missing[k]=1;return k;}
  return v?s.replace(/\{(\w+)\}/g,function(m,n){return v[n]!=null?String(v[n]):m;}):s;
}
t.missing={};
T.t=t;
T.register('i18n',{t:t,has:function(k){return k in S;},addStrings:function(d){Object.assign(S,d);}});
})(window.Taraz=window.Taraz||{});