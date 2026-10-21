// Tarāz engine/punct: Persian/Latin marks, nest-aware quotes, percent, ellipsis, dashes. Protected spans are opaque (never edited).
(function (T) {
    'use strict';
    var E = T.get('engine') || T.register('engine', {}), C = T.C, OP = '\uFFFC', DG = '0-9\\u06F0-\\u06F9\\u0660-\\u0669', ISD = new RegExp('[' + DG + ']'),
        MFA = { '?': '\u061F', ',': '\u060C', ';': '\u061B' }, MLA = { '\u061F': '?', '\u060C': ',', '\u061B': ';' },
        OPN = '\u201C\u00AB\u2039', CLS = '\u201D\u00BB\u203A', QC = new RegExp('["' + OPN + CLS + ']'),
        OPENP = new RegExp('^[\\s(\\[{\\-/:\u2013\u2014\u200C\u060C\u061B' + OPN + ']$'),
        OUT = { guillemets: ['\u00AB\u00BB', '\u201C\u201D', '\u2039\u203A'], curly: ['\u201C\u201D'], straight: ['""'] };

    function sel(id, def, lvl, vals) {
        return {
            id: id, group: 'punct', label: 'opt.' + id + '.label', help: 'opt.' + id + '.help', type: 'select', def: def, level: lvl, affects: 'engine',
            options: vals.map(function (v) { return { v: v, label: 'opt.pc.' + v }; })
        };
    }
    var OPTS = [sel('pcMarks', 'fa', 'basic', ['fa', 'lat', 'keep']), sel('pcQuotes', 'guillemets', 'basic', ['guillemets', 'curly', 'straight', 'keep']),
    sel('pcPercent', 'keep', 'pro', ['keep', 'fa', 'lat']), sel('pcEllipsis', 'char', 'pro', ['char', 'dots', 'keep']), sel('pcDashes', 'spaced', 'pro', ['spaced', 'smart', 'keep'])], DEF = {};
    OPTS.forEach(function (o) { DEF[o.id] = o.def; });
    T.defineOptions(OPTS);

    /** Nearest strong char from index i going d (+1/-1): 'R' | 'L' (Latin or opaque span) | null. */
    function sdir(s, i, d) {
        for (; i >= 0 && i < s.length; i += d) { var c = s.charAt(i); if (c === '\n') return null; if (c === OP || C.RE.latin.test(c)) return 'L'; if (C.RE.rtl.test(c)) return 'R'; }
        return null;
    }
    /* Rule finders: (s,S) -> edits [[pos,len,replacement]] on the flat string s. */
    function fMarks(s, S) {
        var m = S.pcMarks, ed = [], i, to;
        if (m !== 'fa' && m !== 'lat') return ed;
        for (i = 0; i < s.length; i++) {
            to = (m === 'fa' ? MFA : MLA)[s.charAt(i)];
            if (!to || (ISD.test(s.charAt(i - 1)) && ISD.test(s.charAt(i + 1)))) continue;
            if (m === 'fa' && sdir(s, i - 1, -1) !== 'R' && sdir(s, i + 1, 1) !== 'R') continue;
            ed.push([i, 1, to]);
        }
        return ed;
    }
    function fQuotes(s, S) {
        var m = S.pcQuotes, ed = [], tk = [], st = [], i, c, p, n, r;
        ed.unmatched = 0;
        if (!OUT[m]) return ed;
        for (i = 0; i < s.length; i++) {
            c = s.charAt(i); if (!QC.test(c)) continue;
            p = s.charAt(i - 1); n = s.charAt(i + 1);
            r = OPN.indexOf(c) >= 0 ? 'o' : CLS.indexOf(c) >= 0 ? 'c' : (!p || OPENP.test(p)) ? (n && !/\s/.test(n) ? 'o' : null) : 'c';
            tk.push({ i: i, r: r });
        }
        tk.forEach(function (t, k) { if (t.r === 'o') st.push(k); else if (t.r === 'c' && st.length) { t.m = st.pop(); tk[t.m].m = k; } });
        st = [];
        tk.forEach(function (t, k) {
            var q;
            if (t.m == null) { ed.unmatched++; return; }
            if (t.r === 'o') { t.d = st.length; st.push(k); } else { st.pop(); t.d = tk[t.m].d; }
            q = OUT[m][t.d % OUT[m].length].charAt(t.r === 'o' ? 0 : 1);
            if (q !== s.charAt(t.i)) ed.push([t.i, 1, q]);
        });
        return ed;
    }
    function scan(re, s, f) { var r, ed = []; while ((r = re.exec(s))) f(r, ed); return ed; }
    function fPct(s, S) {
        var m = S.pcPercent;
        return m === 'fa' ? scan(new RegExp('(?<=[' + DG + '][ \\u00A0\\u2009\\u202F]?)%', 'g'), s, function (r, e) { e.push([r.index, 1, '\u066A']); })
            : m === 'lat' ? scan(/\u066A/g, s, function (r, e) { e.push([r.index, 1, '%']); }) : [];
    }
    function fEll(s, S) {
        var m = S.pcEllipsis;
        return m === 'char' ? scan(/(?<!\.)\.{3}(?!\.)/g, s, function (r, e) { e.push([r.index, 3, '\u2026']); })
            : m === 'dots' ? scan(/\u2026/g, s, function (r, e) { e.push([r.index, 1, '...']); }) : [];
    }
    function fDash(s, S) {
        var m = S.pcDashes, ed = [];
        if (m !== 'spaced' && m !== 'smart') return ed;
        scan(/(?<!-)---(?!-)/g, s, function (r) { ed.push([r.index, 3, '\u2014']); });
        scan(/(?<!-)--(?!-)/g, s, function (r) { ed.push([r.index, 2, '\u2013']); });
        scan(/(?<=\S) -(?= \S)/g, s, function (r) { ed.push([r.index + 1, 1, '\u2013']); });
        if (m === 'smart') scan(new RegExp('[' + DG + ']+-[' + DG + ']+', 'g'), s, function (r) {
            var a = r.index, b = a + r[0].length, lr = r[0].split('-');
            if ((/[-\/.:]/.test(s.charAt(a - 1)) && ISD.test(s.charAt(a - 2))) || (/[-\/.:]/.test(s.charAt(b)) && ISD.test(s.charAt(b + 1)))) return;
            if (/^0\d/.test(lr[0]) || /^0\d/.test(lr[1])) return;
            ed.push([a + lr[0].length, 1, '\u2013']);
        });
        return ed;
    }
    var RULES = [['marks', fMarks], ['quotes', fQuotes], ['percent', fPct], ['ellipsis', fEll], ['dashes', fDash]];

    function applyEd(s, ed) {
        ed.slice().sort(function (a, b) { return b[0] - a[0]; }).forEach(function (e) { s = s.slice(0, e[0]) + e[2] + s.slice(e[0] + e[1]); });
        return s;
    }
    /** Flat view of an inline list: editable text/num inlines concatenated, everything else = one OP placeholder, markers skipped. */
    function flat(list) {
        var s = '', seg = [];
        list.forEach(function (x) {
            if (x.meta && x.meta.marker) return;
            if (!x.protected && (x.k === 'text' || x.k === 'num')) { seg.push({ x: x, a: s.length, b: s.length + x.s.length }); s += x.s; }
            else s += OP;
        });
        return { s: s, seg: seg };
    }
    /** punctDemo(sample, settings?) -> string. Pure; same rules as the transform on a single text run. */
    function demo(sample, settings) {
        var S = Object.assign({}, DEF, settings), s = String(sample == null ? '' : sample);
        RULES.forEach(function (R) { s = applyEd(s, R[1](s, S)); });
        return s;
    }
    function fn(ctx) {
        var S = ctx.settings;
        ctx.blocks.forEach(function (b, bi) {
            if (b.type === 'code' || b.type === 'math') return;
            E.inlineLists(b).forEach(function (l) {
                RULES.forEach(function (R) {
                    var F = flat(l), ed = R[1](F.s, S);
                    if (ed.unmatched) ctx.util.warn('punct-warning', 'punct.quotes', 'unbalanced quotes', bi);
                    ed.forEach(function (e) {
                        for (var k = 0; k < F.seg.length; k++) {
                            var g = F.seg[k];
                            if (e[0] >= g.a && e[0] + e[1] <= g.b) { (g.ed = g.ed || []).push([e[0] - g.a, e[1], e[2]]); return; }
                        }
                    });
                    F.seg.forEach(function (g) { if (g.ed) E.tx.set(ctx, g.x, bi, 'punct', R[0], applyEd(g.x.s, g.ed)); });
                });
            });
        });
    }

    T.register('engine.punct', { demo: demo, transform: fn, defaults: DEF, flat: flat });
    E.punctDemo = demo;
    if (E.tx) E.addTransform({ id: 'punct', order: 50, fn: fn }); else console.warn('[Taraz] punct: textedit.js missing, transform not installed');
})(window.Taraz = window.Taraz || {});