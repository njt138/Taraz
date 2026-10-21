// Tarāz UI strings (fa) for the main shell; also T.ut (safe lookup) and T.fa (Persian digits).
(function(T){
'use strict';
var S={
'ui.step1':'چسباندن','ui.step2':'بررسی','ui.step3':'تحویل','ui.stepsLabel':'مراحل',
'ui.input':'ورودی','ui.result':'نتیجه','ui.settings':'تنظیمات','ui.theme':'تغییر تم',
'ui.theme.light':'روشن','ui.theme.dark':'تیره',
'ui.undo':'واگرد','ui.redo':'ازنو','ui.clear':'پاک‌کردن','ui.samples':'نمونه','ui.auto':'پردازش خودکار',
'ui.sample.1':'استاندارد IEEE و DER','ui.sample.2':'فرمول‌های ریاضی','ui.sample.3':'سند مارک‌داون',
'ui.ph':'متن چت هوش مصنوعی را اینجا بچسبانید…','ui.drop':'فایل را اینجا رها کنید',
'ui.c.chars':'نویسه','ui.c.words':'واژه','ui.c.paras':'بند',
'ui.err.file':'فقط فایل‌های txt، md و markdown پذیرفته می‌شوند.','ui.err.big':'حجم فایل بیشتر از ۲ مگابایت است.',
'ui.err.read':'خواندن فایل ناموفق بود.','ui.err.process':'پردازش ناموفق بود: ',
'ui.tab.preview':'پیش‌نمایش','ui.tab.xray':'پرتو ایکس','ui.tab.diff':'تفاوت‌ها','ui.tab.formulas':'فرمول‌ها','ui.tab.safety':'ایمنی',
'ui.notInstalled':'این بخش هنوز نصب نشده','ui.noEngine':'موتور پردازش هنوز نصب نشده','ui.noSerialize':'بخش خروجی هنوز نصب نشده','ui.noClip':'بخش کلیپ‌بورد هنوز نصب نشده',
'ui.fontSize':'اندازه قلم','ui.lineSpacing':'فاصله خطوط','ui.hlRuns':'نمایش تکه‌های چپ‌به‌راست',
'ui.empty.title':'برای شروع، متن را بچسبانید','ui.empty.hint':'یا یکی از نمونه‌ها را امتحان کنید',
'ui.process':'پردازش','ui.primary':'پردازش و کپی','ui.done':'انجام شد',
'ui.copyWord':'کپی برای Word','ui.copyPpt':'کپی برای PowerPoint','ui.copyPlain':'کپی متن ساده','ui.copyOrig':'کپی متن اصلی',
'ui.copied':'کپی شد.','ui.copied.orig':'متن اصلی کپی شد.','ui.copyFail':'کپی انجام نشد.','ui.emptyInput':'ابتدا متنی بچسبانید.',
'ui.health':'سلامت','ui.safe':'امن برای Office','ui.unsafe':'نویسه ناامن برای Office','ui.pending':'در انتظار پردازش','ui.stale':'نتیجه قدیمی است',
'ui.privacy':'پردازش کاملاً محلی انجام می‌شود','ui.shortcuts':'Ctrl+Enter پردازش و کپی · Ctrl+Shift+C کپی Word · Ctrl+Shift+P کپی PowerPoint',
'ui.drawerEmpty':'بخش تنظیمات هنوز نصب نشده','ui.splitter':'تغییر اندازه پنل‌ها','ui.close':'بستن'};
if(typeof T.addStrings==='function')T.addStrings(S);
T.uiStrings=S;
/** Translate via T.t when it knows the key, else the built-in UI table. */
T.ut=function(k){var v;try{v=T.t?T.t(k):null;}catch(e){}return typeof v==='string'&&v&&v!==k&&v.charAt(0)!=='['?v:(S[k]||k);};
/** Latin digits to Persian digits. */
T.fa=function(n){return String(n).replace(/\d/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.charAt(d);});};
})(window.Taraz=window.Taraz||{});