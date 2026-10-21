// Tarāz i18n (fa) for the analysis views (X-ray, diff, formulas, safety, dialogs) + 3 tiny shared view helpers.
(function (T) {
  'use strict';
  var D = {
    'v.empty': 'هنوز نتیجه‌ای نیست؛ متنی بچسبانید.', 'v.close': 'بستن', 'v.copied': 'رونوشت شد.', 'v.copyFail': 'رونوشت ناموفق بود.',
    'v.d.rtl': 'راست‌به‌چپ', 'v.d.ltr': 'چپ‌به‌راست', 'v.d.neutral': 'خنثی', 'v.d.auto': 'خودکار',
    'v.b.p': 'بند', 'v.b.h': 'عنوان', 'v.b.li': 'فهرست', 'v.b.quote': 'نقل‌قول', 'v.b.table': 'جدول', 'v.b.code': 'کد', 'v.b.math': 'فرمول',
    'v.x.legend': 'راهنمای رنگ و شکل', 'v.x.k.text': 'متن', 'v.x.k.ltr': 'تکهٔ لاتین', 'v.x.k.num': 'عدد', 'v.x.k.code': 'کد', 'v.x.k.math': 'فرمول', 'v.x.k.link': 'پیوند', 'v.x.k.b': 'نشانهٔ پررنگ', 'v.x.k.i': 'نشانهٔ مورب',
    'v.x.rule': 'قاعده', 'v.x.dir': 'جهت', 'v.x.ltr': 'اجبار چپ‌به‌راست', 'v.x.rtl': 'اجبار راست‌به‌چپ', 'v.x.auto': 'به حال خود (خودکار)', 'v.x.forced': 'جهت دستی',
    'v.x.clear': 'حذف همهٔ جهت‌های دستی', 'v.x.cap': 'فقط {n} مورد نخست نمایش داده شد.', 'v.x.noov': 'این نسخهٔ هسته از تعیین دستی جهت پشتیبانی نمی‌کند.', 'v.x.block': 'بند',
    'v.df.all': 'همه', 'v.df.accept': 'پذیرفتن', 'v.df.reject': 'رد کردن', 'v.df.never': 'هرگز این قاعده', 'v.df.accepted': 'پذیرفته شد', 'v.df.none': 'هیچ تغییری انجام نشد.',
    'v.df.rejected': 'استثناهای فعال:', 'v.df.restore': 'بازگردانی', 'v.df.noRej': 'برای ایمنی خروجی قابل رد نیست', 'v.df.toF': 'تنظیم در زبانهٔ فرمول‌ها', 'v.df.before': 'پیش', 'v.df.after': 'پس',
    'v.df.t.cleanup': 'پاک‌سازی', 'v.df.t.zwnj': 'نیم‌فاصله', 'v.df.t.spacing': 'فاصله‌گذاری', 'v.df.t.digits': 'ارقام', 'v.df.t.punct': 'نشانه‌ها', 'v.df.t.strip-bidi': 'نویسهٔ کنترلی', 'v.df.t.math-linear': 'فرمول خطی', 'v.df.t.override': 'جهت دستی',
    'v.r._': 'تغییر با قاعدهٔ {r}', 'v.r.cleanup.arabic': 'حرف عربی (ي، ك، …) به حرف فارسی تبدیل شد.', 'v.r.cleanup.tatweel': 'کشیدهٔ تزئینی (ـ) حذف شد.', 'v.r.cleanup.diacritics': 'اعراب حذف شد.',
    'v.r.cleanup.markdown': 'نشانه‌گذاری اضافهٔ مارک‌داون حذف شد.', 'v.r.cleanup.emoji': 'ایموجی حذف شد.', 'v.r.cleanup.quotes': 'گیومه‌ها یکدست شدند.', 'v.r.cleanup.nbsp': 'فاصلهٔ نشکن به فاصلهٔ عادی تبدیل شد.',
    'v.r.cleanup.junk': 'نویسهٔ نامرئی زائد حذف شد.', 'v.r.cleanup.tabs': 'تب به فاصله تبدیل شد.', 'v.r.cleanup.join': 'سطرهای شکستهٔ یک بند به هم پیوستند.', 'v.r.cleanup.spaces': 'فاصله‌های تکراری یکی شدند.',
    'v.r.cleanup.edges': 'فاصلهٔ ابتدا و انتهای بند حذف شد.', 'v.r.cleanup.hr': 'خط جداکننده حذف شد.', 'v.r.cleanup.empty': 'بند خالی حذف شد.',
    'v.r.zwnj.double': 'نیم‌فاصلهٔ تکراری یکی شد.', 'v.r.zwnj.space': 'نیم‌فاصلهٔ چسبیده به فاصله حذف شد.', 'v.r.zwnj.latin': 'نیم‌فاصلهٔ کنار حرف لاتین حذف شد.', 'v.r.zwnj.edge': 'نیم‌فاصلهٔ ابتدا یا انتهای واژه حذف شد.',
    'v.r.zwnj.lexicon': 'نیم‌فاصله طبق واژه‌نامه اصلاح شد.', 'v.r.zwnj.mi-space': 'فاصلهٔ پس از «می/نمی» به نیم‌فاصله تبدیل شد.', 'v.r.zwnj.mi-glued': '«می/نمی» چسبیده با نیم‌فاصله جدا شد.',
    'v.r.zwnj.plural-space': 'فاصلهٔ پیش از «ها/های» به نیم‌فاصله تبدیل شد.', 'v.r.zwnj.plural-glued': '«ها» چسبیده با نیم‌فاصله جدا شد.', 'v.r.zwnj.ezafe': 'نشانهٔ اضافه (ـهٔ / ـه‌ی) اصلاح شد.', 'v.r.zwnj.convert': 'نیم‌فاصله طبق تنظیمات به فاصله تبدیل شد.',
    'v.r.spacing.punct-before': 'فاصلهٔ پیش از نشانهٔ نگارشی حذف شد.', 'v.r.spacing.punct-after': 'پس از نشانهٔ نگارشی فاصله افزوده شد.', 'v.r.spacing.paren-inner': 'فاصلهٔ درون پرانتز حذف شد.',
    'v.r.spacing.paren-outer': 'فاصلهٔ بیرون پرانتز تنظیم شد.', 'v.r.spacing.punct-edge': 'فاصلهٔ کنار نشانه در مرز تکه اصلاح شد.', 'v.r.spacing.inner': 'فاصلهٔ درون واژه اصلاح شد.',
    'v.r.spacing.rtl-ltr': 'میان فارسی و لاتین فاصله گذاشته شد.', 'v.r.spacing.ltr-rtl': 'میان لاتین و فارسی فاصله گذاشته شد.',
    'v.r.digits.prose': 'ارقام متن طبق تنظیمات تبدیل شدند.', 'v.r.digits.heading': 'ارقام عنوان طبق تنظیمات تبدیل شدند.', 'v.r.digits.table': 'ارقام جدول طبق تنظیمات تبدیل شدند.',
    'v.r.digits.list': 'شمارهٔ فهرست طبق تنظیمات تبدیل شد.', 'v.r.digits.tech': 'ارقام فنی (نسخه، نشانی، شناسه) طبق تنظیمات تبدیل شدند.',
    'v.r.punct.marks': 'ویرگول، نقطه‌ویرگول یا پرسش به شکل فارسی درآمد.', 'v.r.punct.quotes': 'گیومه‌ها طبق تنظیمات جایگزین شدند.', 'v.r.punct.percent': 'نشانهٔ درصد تبدیل شد.',
    'v.r.punct.ellipsis': 'سه‌نقطه یکدست شد.', 'v.r.punct.dashes': 'خط تیره یکدست شد.',
    'v.r.strip-bidi': 'نویسهٔ کنترل جهت حذف شد؛ Word و PowerPoint آن را مربع نشان می‌دهند.', 'v.r.math-linear': 'فرمول به متن سادهٔ خطی تبدیل شد.',
    'v.r.override.ltr': 'جهت این تکه به‌دست شما چپ‌به‌راست تعیین شد.', 'v.r.override.rtl': 'جهت این تکه به‌دست شما راست‌به‌چپ تعیین شد.',
    'v.f.none': 'فرمولی پیدا نشد.', 'v.f.A': 'معادلهٔ Word (LaTeX)', 'v.f.B': 'متن ساده', 'v.f.keep': 'دست‌نخورده', 'v.f.before': 'اصلی', 'v.f.mode': 'حالت خروجی',
    'v.f.inline': 'درون‌خطی', 'v.f.display': 'نمایشی', 'v.f.conf': 'اطمینان', 'v.f.delim': 'جداکننده', 'v.f.copy': 'رونوشت', 'v.f.copyAll': 'رونوشت همهٔ فرمول‌ها', 'v.f.reset': 'بازنشانی انتخاب‌ها',
    'v.f.unsafe': '(تبدیل ایمن نیست؛ LaTeX حفظ می‌شود)', 'v.f.low': 'اطمینان کمتر از حد تنظیم‌شده است؛ فرمول دست‌نخورده می‌ماند.',
    'v.f.offline': 'KaTeX بارگذاری نشد (شاید اینترنت قطع است). فرمول‌ها به‌صورت متن LaTeX نمایش داده می‌شوند.',
    'v.s.ok': 'خروجی برای Word و PowerPoint ایمن است.', 'v.s.sum': '{e} خطا و {w} هشدار', 'v.s.pos': 'خط {l}، ستون {c}', 'v.s.viz': 'نمایش نویسه‌های نامرئی', 'v.s.out': 'خروجی متن ساده',
    'v.s.in': 'ورودی', 'v.s.cap': 'فقط {n} نویسهٔ نخست نمایش داده شد.', 'v.s.more': 'و {n} مورد دیگر…',
    'v.k.title': 'میان‌برهای صفحه‌کلید', 'v.k.primary': 'پردازش و رونوشت برای Word (دکمهٔ اصلی)', 'v.k.word': 'رونوشت برای Word', 'v.k.ppt': 'رونوشت برای PowerPoint', 'v.k.pal': 'جعبهٔ فرمان',
    'v.k.esc': 'بستن کشو، منو یا پنجره', 'v.k.help': 'نمایش همین راهنما', 'v.k.tabs': 'جابه‌جایی میان زبانه‌ها (روی نوار زبانه)',
    'v.c.title': 'سازگاری و آزمون دستی', 'v.c.disc': 'این یک روند آزمون دستی است. تراز به‌طور خودکار در Word یا PowerPoint آزموده نشده و نتیجهٔ واقعی به نسخهٔ Office، فونت‌ها و تنظیمات زبان سیستم شما بستگی دارد.',
    'v.c.notes': 'نکته‌ها', 'v.c.n1': 'راهبرد پیش‌فرض متن ساده فقط RLM است؛ LRI/RLI/FSI/PDI در Office ممکن است مربع دیده شوند و جز با انتخاب خودتان به خروجی نمی‌روند.',
    'v.c.n2': 'رونوشت Word قالب HTML با dir و lang برای هر تکه دارد؛ اگر Word بدون قالب چسباند، «نگه‌داشتن قالب منبع» را برگزینید.',
    'v.c.n3': 'در خروجی PowerPoint اندازهٔ قلم عمداً حذف می‌شود تا قالب اسلاید حاکم باشد.', 'v.c.n4': 'فونت‌ها جاسازی نمی‌شوند؛ اگر فونت روی رایانهٔ مقصد نصب نباشد، Office جایگزین می‌کند.',
    'v.c.n5': 'حالت «معادلهٔ Word»: LaTeX پاک‌شده را در Word ۳۶۵ از مسیر Insert › Equation با گزینهٔ LaTeX بچسبانید و Convert را بزنید؛ نسخه‌های قدیمی‌تر این امکان را ندارند.',
    'v.c.proc': 'روند آزمون', 'v.c.s1': 'نمونهٔ بند زیر را در ویرایشگر بارگذاری کنید.', 'v.c.s2': 'دکمهٔ اصلی (رونوشت برای Word) را بزنید.', 'v.c.s3': 'در یک سند خالی Word با Ctrl+V بچسبانید.',
    'v.c.s4': 'همین کار را با «رونوشت برای PowerPoint» در یک جعبهٔ متن اسلاید تکرار کنید.', 'v.c.s5': 'نتیجه را با فهرست «نتیجهٔ مورد انتظار» مقایسه کنید.', 'v.c.s6': 'نمونهٔ فرمول را بارگذاری و هر سه حالت را در زبانهٔ فرمول‌ها بیازمایید.',
    'v.c.sp': 'نمونهٔ بند', 'v.c.sampleP': 'استاندارد IEEE 1547 در سال ۲۰۲۴ روی مجموعهٔ آزمون دقت ۸۸.۷٪ گرفت (نسخهٔ v2.1، منبع: https://example.com/report).',
    'v.c.sf': 'نمونهٔ فرمول', 'v.c.sampleF': 'انرژی از رابطهٔ $E = mc^2$ به دست می‌آید و میانگین برابر است با:\n$$\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$$',
    'v.c.exp': 'نتیجهٔ مورد انتظار', 'v.c.e1': 'بند راست‌چین است و «IEEE 1547»، «v2.1» و نشانی هر کدام یکپارچه و با ترتیب درست دیده می‌شوند.',
    'v.c.e2': 'پرانتز، ویرگول و نقطهٔ پایان بند در جای درست قرار می‌گیرند و جابه‌جا نمی‌شوند.', 'v.c.e3': 'هیچ مربع یا نویسهٔ ناشناخته‌ای دیده نمی‌شود.',
    'v.c.e4': 'نشانی همچنان پیوند است و ارقام فنی (نسخه) لاتین می‌مانند.', 'v.c.e5': 'فرمول: «متن ساده» چپ‌به‌راست و با ترتیب درست است؛ «دست‌نخورده» همان LaTeX اصلی است.',
    'v.c.load': 'بارگذاری در ویرایشگر', 'v.c.copy': 'رونوشت',
    'v.t.title': 'خودآزمایی', 'v.t.run': 'اجرای دوباره', 'v.t.res': '{p} موفق و {f} ناموفق از {n} آزمون', 'v.t.none': 'هیچ آزمونی ثبت نشده است.', 'v.t.running': 'در حال اجرا… {i} از {n}', 'v.t.failOnly': 'فقط ناموفق‌ها'
  };
  /** View string: T.t(key) when defined, else built-in table, else key; {x} placeholders filled (numbers → Persian digits). */
  T.vt = function (k, a) {
    var s; try { s = T.t && T.t(k); } catch (e) { }
    if (!s || s === k) s = D[k] != null ? D[k] : k;
    return a ? s.replace(/\{(\w+)\}/g, function (m, n) { var x = a[n]; return x == null ? m : typeof x === 'number' && T.fa ? T.fa(x) : String(x); }) : s;
  };
  /** Register a result tab now, or via T.pendingTabs when app.js is not loaded yet. */
  T.viewTab = function (id, mount) {
    var d = { id: id, label: T.ut ? T.ut('ui.tab.' + id) : id, mount: mount };
    if (T.has && T.has('ui')) T.emit('ui:registerTab', d); else (T.pendingTabs = T.pendingTabs || []).push(d);
  };
  /** Copy plain text (clipboard module, else navigator.clipboard); toasts via ctx.toast. Resolves bool. */
  T.copyText = function (s, ctx) {
    var C = T.get('clipboard'), toast = (ctx && ctx.toast) || function () { }, p;
    try { p = C && C.writeText ? C.writeText(s) : navigator.clipboard.writeText(s); } catch (e) { p = Promise.reject(e); }
    return Promise.resolve(p).then(function (r) { var ok = !r || r.ok !== false; toast(T.vt(ok ? 'v.copied' : 'v.copyFail'), ok ? 'ok' : 'err'); return ok; },
      function () { toast(T.vt('v.copyFail'), 'err'); return false; });
  };
})(window.Taraz = window.Taraz || {});
