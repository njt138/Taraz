// Tarāz tests: digits, punct, safety. Each test: {id,group,name,run()} -> true | error string.
(function (T) {
    'use strict';
    var DEC = '\u066B', TH = '\u066C', AC = '\u060C', L = [];
    function add(g, name, run) { L.push({ id: 'tb.' + g + '.' + (L.length + 1), group: 'transforms-b.' + g, name: name, run: run, fn: run }); }
    function eq(a, b) { return a === b || 'expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a); }
    function need(n, f) { return function () { return T.has(n) ? f(T.get(n)) : 'module ' + n + ' not loaded'; }; }
    function mk(blocks, st) {
        var S = Object.assign({}, T.get('engine.digits').defaults, T.get('engine.punct').defaults, st), c = { blocks: blocks, settings: S, changes: [], warnings: [] };
        c.util = {
            change: function (t, r, b, a, bi) { c.changes.push({ type: t, ruleId: r, before: b, after: a, blockIndex: bi }); return {}; },
            warn: function (t, r, m, bi) { c.warnings.push({ type: t, ruleId: r, message: m, blockIndex: bi }); }
        };
        return c;
    }
    function tx(s) { return { id: 't' + s.length, k: 'text', s: s, dir: 'neutral' }; }
    function P(inl, type, x) { return Object.assign({ type: type || 'p', dir: 'rtl', inlines: inl }, x); }
    function plain(r) {
        var E = T.get('engine');
        return r.blocks.map(function (b) { return E.inlineLists(b).map(function (l) { return l.filter(function (x) { return !(x.meta && x.meta.marker); }).map(function (x) { return x.s; }).join(''); }).join(' | '); }).join('\n');
    }

    // ---- digits (pure) ----
    [['prose -> Persian', '123', 'prose', { digProse: 'fa' }, '۱۲۳'],
    ['prose -> Latin', '۱۲۳', 'prose', { digProse: 'lat' }, '123'],
    ['prose -> Arabic-Indic', '123', 'prose', { digProse: 'ar' }, '١٢٣'],
    ['prose keep leaves mixed scripts', '1۲٣', 'prose', { digProse: 'keep' }, '1۲٣'],
    ['tech defaults to Latin', '۱۲۳', 'tech', {}, '123'],
    ['tech Persian when chosen', 'IEEE 1547', 'tech', { digTech: 'fa' }, 'IEEE ۱۵۴۷'],
    ['IEEE id stays Latin', 'IEEE ۱۵۴۷-۲۰۱۸', 'tech', { digProse: 'fa' }, 'IEEE 1547-2018'],
    ['URL digits stay Latin', 'https://x.org/a۱/۲', 'tech', {}, 'https://x.org/a1/2'],
    ['tech inherit follows prose', '12', 'tech', { digTech: 'inherit', digProse: 'ar' }, '١٢'],
    ['list numbering Persian', '1.', 'list', { digList: 'fa' }, '۱.'],
    ['list inherits prose', '2)', 'list', { digList: 'inherit', digProse: 'ar' }, '٢)'],
    ['list default keeps', '3.', 'list', {}, '3.'],
    ['table own policy', '12', 'table', { digProse: 'fa', digTable: 'ar' }, '١٢'],
    ['table inherits prose', '12', 'table', { digProse: 'fa' }, '۱۲'],
    ['heading own policy', '12', 'heading', { digProse: 'fa', digHeading: 'ar' }, '١٢'],
    ['heading inherits prose', '12', 'heading', { digProse: 'lat' }, '12'],
    ['date own policy Y/M/D', 'سال 1404/07/26 و 5', 'prose', { digProse: 'fa', digDate: 'lat' }, 'سال 1404/07/26 و ۵'],
    ['date own policy D/M/Y', '26/07/1404', 'prose', { digProse: 'fa', digDate: 'lat' }, '26/07/1404'],
    ['date inherits prose', '1404-07-26', 'prose', { digProse: 'fa' }, '۱۴۰۴-۰۷-۲۶'],
    ['date Persian, prose Latin', '2026.10.18 و 5', 'prose', { digProse: 'lat', digDate: 'fa' }, '۲۰۲۶.۱۰.۱۸ و 5'],
    ['1.2.3 is not a date; separators kept', '1.2.3', 'prose', { digProse: 'fa' }, '۱.۲.۳'],
    ['default keeps separators', '1.5', 'prose', { digProse: 'fa' }, '۱.۵'],
    ['follow: point -> ٫', '1.5', 'prose', { digProse: 'fa', digSep: 'follow' }, '۱' + DEC + '۵'],
    ['follow: ٫ -> point for Latin', '۱' + DEC + '۵', 'prose', { digProse: 'lat', digSep: 'follow' }, '1.5'],
    ['follow: thousands -> ٬', '1,234,567', 'prose', { digProse: 'fa', digSep: 'follow' }, '۱' + TH + '۲۳۴' + TH + '۵۶۷'],
    ['follow: thousands + decimal', '1,234.5', 'prose', { digProse: 'fa', digSep: 'follow' }, '۱' + TH + '۲۳۴' + DEC + '۵'],
    ['follow: decimal comma', '3,5', 'prose', { digProse: 'fa', digSep: 'follow' }, '۳' + DEC + '۵'],
    ['forced Latin separators', '1' + DEC + '5', 'prose', { digProse: 'fa', digSep: 'lat' }, '۱.۵'],
    ['forced Persian separators', '1.5', 'prose', { digProse: 'lat', digSep: 'fa' }, '1' + DEC + '5'],
    ['Arabic comma as thousands', '٣٤٥' + AC + '٦٧٨', 'prose', { digProse: 'lat', digSep: 'follow' }, '345,678'],
    ['grouping off by default', '12345', 'prose', { digProse: 'fa' }, '۱۲۳۴۵'],
    ['grouping on', '12345', 'prose', { digProse: 'fa', digGroup: true }, '۱۲' + TH + '۳۴۵'],
    ['grouping spares years', '2026', 'prose', { digProse: 'lat', digGroup: true }, '2026'],
    ['grouping min slider', '2026', 'prose', { digProse: 'lat', digGroup: true, digGroupMin: 4 }, '2,026'],
    ['grouping skips leading zero', '0123456', 'prose', { digProse: 'lat', digGroup: true }, '0123456'],
    ['grouping integer part of decimal', '12345.67', 'prose', { digProse: 'lat', digGroup: true }, '12,345.67'],
    ['grouping skips dates', '1404/07/26', 'prose', { digProse: 'lat', digGroup: true }, '1404/07/26']
    ].forEach(function (c) { add('digits', c[0], need('engine.digits', function (D) { return eq(D.conv(c[1], c[2], c[3]), c[4]); })); });

    add('digits', 'conv idempotent over samples x settings', need('engine.digits', function (D) {
        var smp = ['1404/07/26 و 12345.67', '1,234,567 3,5 1,234.5', '۱' + DEC + '۵ 0,500', 'IEEE 1547-2018 1.2.3', '٣٤٥' + AC + '٦٧٨ 1234,567'],
            st = [{}, { digProse: 'lat', digSep: 'follow', digGroup: true }, { digProse: 'ar', digSep: 'fa' }, { digProse: 'fa', digSep: 'follow', digGroup: true, digGroupMin: 4 }], i, j, a, b;
        for (i = 0; i < smp.length; i++)for (j = 0; j < st.length; j++) { a = D.conv(smp[i], 'prose', st[j]); b = D.conv(a, 'prose', st[j]); if (a !== b) return 'not idempotent: ' + JSON.stringify([smp[i], a, b]); }
        return true;
    }));
    add('digits', 'digitsDemo returns all contexts; single context by name', need('engine.digits', function (D) {
        var r = D.digitsDemo('12', { digProse: 'fa', digHeading: 'ar' });
        return eq(r.prose + '|' + r.heading + '|' + r.tech + '|' + D.digitsDemo('12', { digProse: 'fa' }, 'list'), '۱۲|١٢|12|12');
    }));

    // ---- digits (transform on hand-made blocks) ----
    function runD(blocks, st) { var D = T.get('engine.digits'), c = mk(blocks, st); D.transform(c); return c; }
    add('digits', 'math inline never touched', need('engine.digits', function () {
        var m = { id: 'm', k: 'math', s: '$x_1=۱$', protected: true, rule: 'math', dir: 'ltr' }; runD([P([tx('عدد 1'), m])]); return eq(m.s, '$x_1=۱$');
    }));
    add('digits', 'code inline and code block never touched', need('engine.digits', function () {
        var c = { id: 'c', k: 'code', s: 'a=1', protected: true, rule: 'code', dir: 'ltr' }, b = P([{ id: 'b', k: 'code', s: 'x=2', dir: 'ltr' }], 'code');
        runD([P([c]), b]); return eq(c.s + b.inlines[0].s, 'a=1x=2');
    }));
    add('digits', 'URL: text and href converted to Latin', need('engine.digits', function () {
        var u = { id: 'u', k: 'link', s: 'https://a.com/p۱۲', href: 'https://a.com/p۱۲', protected: true, rule: 'url', dir: 'ltr' }; runD([P([u])], { digProse: 'fa' });
        return eq(u.s + ' ' + u.href, 'https://a.com/p12 https://a.com/p12');
    }));
    add('digits', 'ltr run uses technical policy', need('engine.digits', function () {
        var r = { id: 'r', k: 'ltr', s: 'IEEE-۴', dir: 'ltr', rule: 'run' }; runD([P([r])], { digProse: 'fa' }); return eq(r.s, 'IEEE-4');
    }));
    add('digits', 'num inline follows prose; change recorded', need('engine.digits', function () {
        var n = { id: 'n', k: 'num', s: '12', dir: 'neutral' }, c = runD([P([n])], { digProse: 'fa' });
        return eq(n.s + ' ' + c.changes.some(function (x) { return x.ruleId === 'digits.prose'; }), '۱۲ true');
    }));
    add('digits', 'ordered list marker converted, bullet kept', need('engine.digits', function () {
        var a = P([tx('x')], 'li', { ordered: true, marker: '1.', level: 0 }), b = P([tx('y')], 'li', { ordered: false, marker: '-', level: 0 });
        runD([a, b], { digList: 'fa' }); return eq(a.marker + b.marker, '۱.-');
    }));
    add('digits', 'heading and table blocks use own policies', need('engine.digits', function () {
        var h = P([{ id: 'h', k: 'num', s: '12', dir: 'neutral' }], 'h', { level: 1 }), t = P([], 'table', { rows: [[[{ id: 'c', k: 'num', s: '12', dir: 'neutral' }]]] });
        runD([h, t], { digProse: 'fa', digHeading: 'ar', digTable: 'lat' }); return eq(h.inlines[0].s + t.rows[0][0][0].s, '١٢12');
    }));
    add('digits', 'style markers skipped', need('engine.digits', function () {
        var m = { id: 'k', k: 'b', s: '**', dir: 'neutral', meta: { marker: true, on: true } }; runD([P([m])]); return eq(m.s, '**');
    }));

    // ---- punct (pure) ----
    [['? , ; -> Persian marks', 'سلام, چطوری? بله; نه', {}, 'سلام، چطوری؟ بله؛ نه'],
    ['Persian marks -> Latin', 'سلام، چطوری؟ بله؛', { pcMarks: 'lat' }, 'سلام, چطوری? بله;'],
    ['marks keep', 'سلام, چطوری?', { pcMarks: 'keep' }, 'سلام, چطوری?'],
    ['comma inside numbers untouched', '1,234 و 3,5', {}, '1,234 و 3,5'],
    ['Arabic comma inside number untouched', '۱' + AC + '۲', { pcMarks: 'lat' }, '۱' + AC + '۲'],
    ['Latin sentence keeps Latin marks', 'Hello, world?', {}, 'Hello, world?'],
    ['comma after Persian, before Latin', 'سلام, world', {}, 'سلام' + AC + ' world'],
    ['quotes: straight -> guillemets', '"سلام"', {}, '«سلام»'],
    ['quotes: curly -> guillemets', '“سلام”', {}, '«سلام»'],
    ['quotes: nested', '"او گفت "سلام" و رفت"', {}, '«او گفت “سلام” و رفت»'],
    ['quotes: three levels', '"الف "ب "ج" د" ه"', {}, '«الف “ب ‹ج› د” ه»'],
    ['quotes: curly mode', '"سلام"', { pcQuotes: 'curly' }, '“سلام”'],
    ['quotes: straight mode', '«سلام»', { pcQuotes: 'straight' }, '"سلام"'],
    ['quotes: keep', '"سلام"', { pcQuotes: 'keep' }, '"سلام"'],
    ['quotes: unbalanced untouched', '"سلام', {}, '"سلام'],
    ['quotes: inch mark untouched', '5" صفحه', {}, '5" صفحه'],
    ['percent -> ٪', '5% و 10 %', { pcPercent: 'fa' }, '5٪ و 10 ٪'],
    ['٪ -> %', '۵٪', { pcPercent: 'lat' }, '۵%'],
    ['percent without number untouched', 'نماد % چیست', { pcPercent: 'fa' }, 'نماد % چیست'],
    ['percent keep (default)', '5%', {}, '5%'],
    ['ellipsis -> …', 'صبر...', {}, 'صبر…'],
    ['four dots untouched', 'صبر....', {}, 'صبر....'],
    ['ellipsis -> dots', 'صبر…', { pcEllipsis: 'dots' }, 'صبر...'],
    ['spaced hyphen -> en dash', 'الف - ب', {}, 'الف – ب'],
    ['-- -> en dash', 'الف -- ب', {}, 'الف – ب'],
    ['--- -> em dash', 'الف --- ب', {}, 'الف — ب'],
    ['glued hyphen untouched', 'الف-ب', {}, 'الف-ب'],
    ['numeric range untouched by default', '10-20', {}, '10-20'],
    ['numeric range in smart mode', '10-20', { pcDashes: 'smart' }, '10–20'],
    ['date untouched in smart mode', '2026-10-18', { pcDashes: 'smart' }, '2026-10-18'],
    ['phone untouched in smart mode', '021-1234', { pcDashes: 'smart' }, '021-1234'],
    ['dashes keep', 'الف - ب', { pcDashes: 'keep' }, 'الف - ب']
    ].forEach(function (c) {
        add('punct', c[0], need('engine.punct', function (P) { return eq(P.demo(c[1], c[2]), c[3]); }));
        add('punct', 'idempotent: ' + c[0], need('engine.punct', function (P) { var a = P.demo(c[1], c[2]); return eq(P.demo(a, c[2]), a); }));
    });

    // ---- punct (transform on hand-made blocks) ----
    function runP(blocks, st) { var c = mk(blocks, st); T.get('engine.punct').transform(c); return c; }
    add('punct', 'quote pair spans a protected inline; code untouched', need('engine.punct', function () {
        var a = tx('"a '), c = { id: 'c', k: 'code', s: '"x"', protected: true, rule: 'code', dir: 'ltr' }, b = tx(' b"'); runP([P([a, c, b])]); return eq(a.s + c.s + b.s, '«a "x" b»');
    }));
    add('punct', '% after a num inline', need('engine.punct', function () {
        var n = { id: 'n', k: 'num', s: '5', dir: 'neutral' }, t = tx('%'); runP([P([n, t])], { pcPercent: 'fa' }); return eq(t.s, '٪');
    }));
    add('punct', 'URL and ltr run untouched', need('engine.punct', function () {
        var u = { id: 'u', k: 'link', s: 'https://a.com/x--y?q=1,2', href: 'https://a.com/x--y?q=1,2', protected: true, rule: 'url', dir: 'ltr' }, t = tx(' و ...'); runP([P([u, t])]);
        return eq(u.s + '|' + t.s, 'https://a.com/x--y?q=1,2| و …');
    }));
    add('punct', 'unbalanced quote -> one warning', need('engine.punct', function () { return eq(runP([P([tx('"سلام')])]).warnings.length, 1); }));
    add('punct', 'change recorded with ruleId punct.quotes', need('engine.punct', function () {
        return eq(runP([P([tx('"سلام"')])]).changes.some(function (c) { return c.ruleId === 'punct.quotes'; }), true);
    }));
    add('punct', 'code/math blocks skipped', need('engine.punct', function () {
        var b = P([{ id: 'c', k: 'code', s: '"x",1...', dir: 'ltr' }], 'code'); runP([b]); return eq(b.inlines[0].s, '"x",1...');
    }));

    // ---- safety ----
    function U(n) { return T.C.CHAR[n]; }
    add('safety', 'LRI flagged with position', need('engine.safety', function (S) {
        var r = S.scan('ab\u2066c'); return eq(r.length + r[0].name + r[0].index + r[0].line + r[0].col + r[0].severity, '1LRI213error');
    }));
    add('safety', 'all 11 unsafe characters flagged as errors', need('engine.safety', function (S) {
        var r = S.scan(T.C.UNSAFE_IN_OFFICE.map(U).join('a')); return eq(r.length + ' ' + r.every(function (x) { return x.severity === 'error' && x.explain; }), '11 true');
    }));
    add('safety', 'RLM/LRM are safe', need('engine.safety', function (S) { return eq(S.isOfficeSafe('a\u200Fb\u200Ec'), true); }));
    add('safety', 'ZWNJ inside a word is fine', need('engine.safety', function (S) { return eq(S.scan('می\u200Cروم').length, 0); }));
    add('safety', 'stray ZWNJ at line end / start', need('engine.safety', function (S) {
        var a = S.scan('کتاب\u200C\nبعد'), b = S.scan('x\n\u200Cمی'); return eq(a.length + a[0].kind + b.length + b[0].line, '1edge12');
    }));
    add('safety', 'ZWNJ next to space / doubled', need('engine.safety', function (S) {
        return eq(S.scan('الف\u200C ب')[0].kind + S.scan('می\u200C\u200Cروم')[0].kind, 'spacedouble');
    }));
    add('safety', 'isOfficeSafe: BOM unsafe, clean safe, strict counts ZWNJ warnings', need('engine.safety', function (S) {
        return eq([S.isOfficeSafe('\uFEFFx'), S.isOfficeSafe('سلام'), S.isOfficeSafe('الف\u200C\n'), S.isOfficeSafe('الف\u200C\n', true)].join(), 'false,true,true,false');
    }));
    add('safety', 'line/col across CRLF and LF', need('engine.safety', function (S) {
        var r = S.scan('a\r\nb\u200B'); return eq(r[0].line + ':' + r[0].col, '2:2');
    }));
    add('safety', 'non-string input -> empty, safe', need('engine.safety', function (S) { return eq(S.scan(null).length + String(S.isOfficeSafe(undefined)), '0true'); }));
    add('safety', 'strip removes errors only', need('engine.safety', function (S) { return eq(S.strip('a\u2066b\u200Cc\uFEFF\u200F'), 'ab\u200Cc\u200F'); }));
    add('safety', 'summary counts', need('engine.safety', function (S) {
        var m = S.summary(S.scan('\u2066\u2066x\u200B\n\u200C')); return eq(m.total + ' ' + m.errors + ' ' + m.warnings + ' ' + m.byName.LRI, '4 3 1 2');
    }));

    // ---- integration through E.process (depends on earlier steps' files) ----
    function proc(t, st) { return plain(T.get('engine').process(t, st)); }
    function ig(name, f) { add('integration', name, function () { return T.has('engine') && T.get('engine').tx ? f() : 'engine/textedit not loaded'; }); }
    ig('digits and punct registered in pipeline', function () {
        var ids = T.get('engine').transforms().map(function (t) { return t.id; }); return eq(ids.indexOf('digits') >= 0 && ids.indexOf('punct') > ids.indexOf('digits'), true);
    });
    ig('prose digits -> Persian by default', function () { return eq(proc('سال 2026').indexOf('۲۰۲۶') >= 0, true); });
    ig('digProse keep leaves digits', function () { return eq(proc('سال 2026', { digProse: 'keep' }).indexOf('2026') >= 0, true); });
    ig('IEEE id and URL stay Latin', function () {
        var o = proc('طبق IEEE 1547-2018 و https://example.com/a1 عمل کن'); return eq(o.indexOf('IEEE 1547-2018') >= 0 && o.indexOf('https://example.com/a1') >= 0, true);
    });
    ig('math untouched', function () {
        var r = T.get('engine').process('مقدار $x_1=1$ است'), m = null;
        r.blocks.forEach(function (b) { b.inlines.forEach(function (x) { if (x.k === 'math') m = x; }); }); return m ? eq(m.s, '$x_1=1$') : 'no math inline produced';
    });
    ig('quotes/marks converted', function () { var o = proc('او گفت "سلام", بله?'); return eq(o.indexOf('«سلام»') >= 0 && o.indexOf('؟') >= 0, true); });
    ig('heading policy', function () { return eq(proc('# عنوان 12', { digHeading: 'lat' }).indexOf('12') >= 0, true); });
    ig('ordered list marker converted', function () {
        var b = T.get('engine').process('1. الف\n2. ب', { digList: 'fa' }).blocks[0]; return eq(b.type === 'li' && /[۰-۹]/.test(b.marker || ''), true);
    });
    ig('end-to-end idempotent', function () {
        var x = 'در سال 1404/07/26 مقدار 12345.5 و "نمونه" با IEEE 1547 - ok... 5%؟', a = proc(x); return eq(proc(a), a);
    });
    ig('output is Office-safe after pipeline', function () { return eq(T.get('engine.safety').isOfficeSafe(proc('الف\u2066ب\u2069 ج')), true); });

    T.addTests(L);
})(window.Taraz = window.Taraz || {});