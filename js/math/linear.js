// Tarāz math/linear: MODE B, LaTeX subset -> plain-text formula (lexer, AST parser, serializer) + per-formula transform. No DOM.
(function (T) {
    'use strict';
    var E = T.get('engine') || T.register('engine', {}), L = T.get('math.linear') || T.register('math.linear', {}), RT = /[\u0590-\u08FF]/, PO = "!'.",
        LX = /\s+|\\(?:big|Big|bigg|Bigg)[lrm]?(?![A-Za-z])|\\(text|textrm|textbf|textit|textnormal|textsf|texttt|mbox|hbox|mathrm|operatorname)\*?\s*\{([^{}]*)\}|\\([A-Za-z]+)|\\([^A-Za-z])|(\d+(?:\.\d+)?)|([A-Za-z])|([\s\S])/g;
    function tb(o) { return Object.assign(Object.create(null), o); }
    function kv(s) { var o = Object.create(null), a = s.split(' '), i; for (i = 0; i + 1 < a.length; i += 2)o[a[i]] = a[i + 1]; return o; }
    function st(s) { var o = Object.create(null); s.split(' ').forEach(function (k) { o[k] = 1; }); return o; }
    var GR = kv('alpha α beta β gamma γ delta δ epsilon ϵ varepsilon ε zeta ζ eta η theta θ vartheta ϑ iota ι kappa κ lambda λ mu μ nu ν xi ξ pi π varpi ϖ rho ρ varrho ϱ sigma σ varsigma ς tau τ upsilon υ phi ϕ varphi φ chi χ psi ψ omega ω Gamma Γ Delta Δ Theta Θ Lambda Λ Xi Ξ Pi Π Sigma Σ Upsilon Υ Phi Φ Psi Ψ Omega Ω'),
        AT = tb({ infty: ['∞', 'inf'], partial: ['∂', 'partial'], nabla: ['∇', 'nabla'], ell: ['ℓ', 'ell'], hbar: ['ħ', 'hbar'], emptyset: ['∅', 'emptyset'], varnothing: ['∅', 'emptyset'], aleph: ['ℵ', 'aleph'] }),
        OP = tb({
            leq: ['≤', '<=', 1], le: ['≤', '<=', 1], geq: ['≥', '>=', 1], ge: ['≥', '>=', 1], neq: ['≠', '!=', 1], ne: ['≠', '!=', 1], approx: ['≈', '~=', 1], equiv: ['≡', 'equiv', 1], sim: ['∼', '~', 1], simeq: ['≃', '~=', 1], cong: ['≅', '~=', 1], propto: ['∝', 'propto', 1],
            to: ['→', '->', 1], rightarrow: ['→', '->', 1], longrightarrow: ['→', '->', 1], leftarrow: ['←', '<-', 1], gets: ['←', '<-', 1], Rightarrow: ['⇒', '=>', 1], implies: ['⇒', '=>', 1], Leftarrow: ['⇐', '<==', 1], Leftrightarrow: ['⇔', '<=>', 1], iff: ['⇔', '<=>', 1], mapsto: ['↦', '|->', 1],
            'in': ['∈', 'in', 1], notin: ['∉', 'not in', 1], ni: ['∋', 'ni', 1], subset: ['⊂', 'subset', 1], supset: ['⊃', 'supset', 1], subseteq: ['⊆', 'subseteq', 1], supseteq: ['⊇', 'supseteq', 1], ll: ['≪', '<<', 1], gg: ['≫', '>>', 1], perp: ['⊥', 'perp', 1], parallel: ['∥', '||', 1],
            pm: ['±', '+-', 2], mp: ['∓', '-+', 2], cup: ['∪', 'cup', 2], cap: ['∩', 'cap', 2], setminus: ['∖', '\\', 2], oplus: ['⊕', '(+)', 2], otimes: ['⊗', '(x)', 2], wedge: ['∧', '/\\', 2], vee: ['∨', '\\/', 2]
        }),
        FN = st('sin cos tan cot sec csc arcsin arccos arctan sinh cosh tanh coth log ln lg exp det dim gcd deg hom ker arg Pr sgn Re Im lim limsup liminf max min sup inf'),
        LIM0 = st('lim limsup liminf'), LIMS = st('max min sup inf'),
        BIG = tb({ sum: ['∑', 'sum'], prod: ['∏', 'prod'], coprod: ['∐', 'coprod'], int: ['∫', 'int'], iint: ['∬', 'iint'], iiint: ['∭', 'iiint'], oint: ['∮', 'oint'], bigcup: ['⋃', 'union'], bigcap: ['⋂', 'intersect'] }),
        ACC = kv('hat \u0302 widehat \u0302 bar \u0304 overline \u0304 vec \u20D7 dot \u0307 ddot \u0308 tilde \u0303 widetilde \u0303 check \u030C breve \u0306 acute \u0301 grave \u0300'),
        SUPm = kv('0 ⁰ 1 ¹ 2 ² 3 ³ 4 ⁴ 5 ⁵ 6 ⁶ 7 ⁷ 8 ⁸ 9 ⁹ + ⁺ - ⁻ = ⁼ ( ⁽ ) ⁾ n ⁿ i ⁱ T ᵀ'),
        SUBm = kv('0 ₀ 1 ₁ 2 ₂ 3 ₃ 4 ₄ 5 ₅ 6 ₆ 7 ₇ 8 ₈ 9 ₉ + ₊ - ₋ = ₌ ( ₍ ) ₎ a ₐ e ₑ h ₕ i ᵢ j ⱼ k ₖ l ₗ m ₘ n ₙ o ₒ p ₚ r ᵣ s ₛ t ₜ u ᵤ v ᵥ x ₓ'),
        BB = kv('R ℝ N ℕ Z ℤ Q ℚ C ℂ P ℙ H ℍ'),
        DL = kv('langle ⟨ rangle ⟩ lfloor ⌊ rfloor ⌋ lceil ⌈ rceil ⌉ lvert | rvert | lVert ‖ rVert ‖ lbrace { rbrace }'),
        ENVB = tb({ matrix: ['[', ']'], bmatrix: ['[', ']'], pmatrix: ['(', ')'], Bmatrix: ['{', '}'], vmatrix: ['|', '|'], Vmatrix: ['‖', '‖'], smallmatrix: ['[', ']'] }),
        SK = st('quad qquad , ; : ! displaystyle textstyle scriptstyle scriptscriptstyle limits nolimits'),
        FA = st('num id sym grp par frac sqrt scr post acc call mat');
    SK[' '] = 1;

    function sg(id, label, def, ch, help) {
        return {
            id: id, group: 'math', label: label, help: help || '', type: 'segmented', def: def, level: 'pro', affects: 'engine',
            options: ch.map(function (c) { return { v: c[0], label: c[1] }; })
        };
    }
    var O = [
        sg('lnMul', 'ضرب (حالت B)', 'star', [['star', '*'], ['times', '×'], ['cdot', '·'], ['implicit', 'ضمنی']], 'نمایش ضرب در فرمول متنی: x*y، x×y، x·y یا xy. در زیرنویس و توان همیشه ضمنی است.'),
        sg('lnDiv', 'تقسیم و کسر', 'slash', [['slash', 'a/b'], ['obelus', 'a÷b'], ['paren', '(a)/(b)']], 'شکل نوشتن کسر. پرانتز فقط در جایی که تقدم لازم دارد اضافه می‌شود، مگر حالت (a)/(b).'),
        sg('lnPow', 'توان', 'caret', [['caret', '^'], ['unicode', 'x²']], 'توان با ^ یا نویسهٔ یونیکد. اگر نویسهٔ یونیکد موجود نباشد خودکار ^ به کار می‌رود.'),
        sg('lnSub', 'زیرنویس', 'under', [['under', '_'], ['unicode', 'Z₁']], 'زیرنویس با _ یا نویسهٔ یونیکد.'),
        sg('lnRoot', 'ریشه', 'sqrt', [['sqrt', 'sqrt()'], ['radical', '√']], 'ریشه با sqrt() یا √.'),
        sg('lnGreek', 'حروف یونانی', 'symbol', [['symbol', 'α'], ['name', 'alpha']], 'نماد یا نام حروف یونانی.'),
        sg('lnBig', 'مجموع و انتگرال', 'symbol', [['symbol', '∑ ∫'], ['ascii', 'sum int']], 'مجموع، حاصل‌ضرب و انتگرال با حدود نوشته‌شده: ∑(i = 1..n).'),
        sg('lnOps', 'عملگرها', 'unicode', [['unicode', '≤ ≠'], ['ascii', '<= !=']], 'عملگرها با نویسهٔ یونیکد یا ASCII.'),
        sg('lnSpace', 'فاصلهٔ عملگرها', 'spaced', [['spaced', 'a + b'], ['tight', 'a+b']], 'فاصله دور + - = و مانند آن.')
    ];
    T.defineOptions(O);
    /** Default linearization options {lnMul,...}. */
    L.defaults = function () { var r = {}; O.forEach(function (o) { r[o.id] = o.def; }); return r; };

    function U(c, a) { throw { u: c, arg: a }; }
    function lex(s) {
        var t = [], m, pv;
        if (RT.test(s)) U('rtl-in-math');
        LX.lastIndex = 0;
        while ((m = LX.exec(s))) {
            if (m[1] !== undefined) t.push({ k: 'text', c: m[1], v: m[2] });
            else if (m[3] !== undefined) t.push({ k: 'cmd', v: m[3] });
            else if (m[4] !== undefined) t.push({ k: 'cmd', v: m[4] });
            else if (m[5] !== undefined) {
                pv = t[t.length - 1];
                if (m[5].length > 1 && pv && pv.k === 'ch' && (pv.v === '^' || pv.v === '_')) { m[5] = m[5].charAt(0); LX.lastIndex = m.index + 1; }
                t.push({ k: 'num', v: m[5] });
            }
            else if (m[6] !== undefined) t.push({ k: 'id', v: m[6] });
            else if (m[7] !== undefined) t.push({ k: 'ch', v: m[7] });
            if (t.length > 600) U('too-long');
        }
        return t;
    }
    function op(l, u, a, k) { return { t: 'op', l: l, u: u, a: a == null ? u : a, k: k }; }
    function fd(n) { while (n && n.t === 'grp') n = n.x[0]; return !!n && (n.t === 'id' && n.v === 'd' || n.t === 'sym' && n.v === 'partial'); }
    function parse(tk, W) {
        var i = 0;
        function isCh(v) { var t = tk[i]; return !!t && t.k === 'ch' && t.v === v; }
        function isCmd(v) { var t = tk[i]; return !!t && t.k === 'cmd' && t.v === v; }
        function stopT(t) { return t.k === 'ch' && (t.v === '}' || t.v === '&') || t.k === 'cmd' && (t.v === 'right' || t.v === 'end' || t.v === '\\'); }
        function seq(stop) { var a = [], n; while (i < tk.length && !stop(tk[i])) { n = item(); if (n) a.push(n); } return a; }
        function arg() {
            var n;
            if (isCh('{')) { i++; n = seq(stopT); if (!isCh('}')) U('unbalanced-braces'); i++; return { t: 'grp', x: n }; }
            if (i >= tk.length) U('syntax', 'missing-arg');
            do { n = atom(); } while (!n && i < tk.length);
            if (!n) U('syntax', 'missing-arg');
            return n;
        }
        function pair(test, l, r, fb) {
            var s = i, x = seq(function (t) { return stopT(t) || test(t); });
            if (i < tk.length && test(tk[i])) { i++; return { t: 'par', l: l, r: r, x: x }; }
            i = s; return fb || { t: 'raw', v: l };
        }
        function fin(b, sb, sp) {
            if (b.t === 'big') { b.lo = sb; b.hi = sp; return b; }
            if (b.t === 'fn') { b.sb = sb; b.sp = sp; if (sb && LIMS[b.v]) b.lim = true; return b; }
            return { t: 'scr', b: b, sb: sb, sp: sp };
        }
        function item() {
            var b = atom(), sb = null, sp = null, t, a;
            if (!b) return null;
            for (; ;) {
                t = tk[i];
                if (!t) break;
                if (t.k === 'ch' && (t.v === '^' || t.v === '_')) {
                    i++; a = arg();
                    if (t.v === '^') { if (sp) U('double-script'); sp = a; } else { if (sb) U('double-script'); sb = a; }
                } else if (t.k === 'ch' && PO.indexOf(t.v) >= 0 || t.k === 'cmd' && t.v === '%') {
                    i++; if (sb || sp) { b = fin(b, sb, sp); sb = sp = null; }
                    b = { t: 'post', x: b, v: t.k === 'cmd' ? '%' : t.v };
                } else break;
            }
            return sb || sp ? fin(b, sb, sp) : b;
        }
        function atom() {
            var t = tk[i++];
            if (t.k === 'num') return { t: 'num', v: t.v };
            if (t.k === 'id') return { t: 'id', v: t.v };
            if (t.k === 'text') return tx(t);
            if (t.k === 'ch') return chn(t.v);
            return cmd(t.v);
        }
        function tx(t) {
            var v = t.v.trim();
            if (!v) return null;
            if (t.c === 'operatorname') return { t: 'fn', v: v, lim: false };
            if (t.c === 'mathrm' && /^[A-Za-z]$/.test(v)) return { t: 'id', v: v };
            return { t: 'word', v: v };
        }
        function chn(v) {
            switch (v) {
                case '{': i--; return arg();
                case '(': return pair(function (t) { return t.k === 'ch' && t.v === ')'; }, '(', ')');
                case '[': return pair(function (t) { return t.k === 'ch' && t.v === ']'; }, '[', ']');
                case '|': return pair(function (t) { return t.k === 'ch' && t.v === '|'; }, '|', '|', op(1, '|'));
                case '+': return op(2, '+');
                case '-': case '−': return op(2, '-');
                case '=': case '<': case '>': case ':': return op(1, v);
                case ',': case ';': return op(0, v);
                case '*': case '·': case '×': return op(3, v, v, 'mul');
                case '/': case '÷': return op(3, v, v, 'div');
                case ')': case ']': case '!': case "'": case '.': return { t: 'raw', v: v };
                case '~': return null;
                case '^': case '_': case '&': case '}': U('syntax', v);
            }
            if (/[≤≥≠≈≡∈∉⊂⊆→⇒⇔∼]/.test(v)) return op(1, v);
            if (v.charCodeAt(0) > 127) return { t: 'id', v: v };
            U('unknown-char', v);
        }
        function dlm() {
            var t = tk[i++];
            if (!t) U('syntax', 'delimiter');
            if (t.k === 'ch') return t.v === '.' ? '' : t.v;
            if (t.k === 'cmd') { if (t.v === '{' || t.v === '}') return t.v; if (t.v === '|') return '‖'; if (DL[t.v]) return DL[t.v]; }
            U('bad-delimiter');
        }
        function env() {
            var nm = '', rows = [], row = [], n2 = '';
            if (!isCh('{')) U('syntax', 'begin');
            i++; while (i < tk.length && !isCh('}')) nm += tk[i++].v || '';
            i++;
            if (!ENVB[nm] && nm !== 'cases') U('env-unsupported', nm);
            for (; ;) {
                row.push(seq(stopT));
                if (isCh('&')) { i++; continue; }
                if (isCmd('\\')) { i++; rows.push(row); row = []; continue; }
                break;
            }
            if (row.length > 1 || row[0].length) rows.push(row);
            if (!isCmd('end')) U('unbalanced-env');
            i++;
            if (!isCh('{')) U('unbalanced-env');
            i++; while (i < tk.length && !isCh('}')) n2 += tk[i++].v || '';
            i++;
            if (n2 !== nm) U('unbalanced-env');
            return { t: nm === 'cases' ? 'cases' : 'mat', env: nm, rows: rows };
        }
        function cmd(c) {
            var x, y, n;
            if (GR[c]) return { t: 'sym', v: c, g: 1 };
            if (AT[c]) return { t: 'sym', v: c };
            if (OP[c]) return op(OP[c][2], OP[c][0], OP[c][1]);
            if (FN[c]) return { t: 'fn', v: c, lim: !!LIM0[c] };
            if (BIG[c]) return { t: 'big', v: c, int: /int$/.test(c) };
            if (ACC[c]) return { t: 'acc', c: c, x: arg() };
            if (DL[c]) return { t: 'raw', v: DL[c] };
            if (SK[c]) return null;
            switch (c) {
                case 'cdot': case 'times': case 'ast': return op(3, '*', '*', 'mul');
                case 'div': return op(3, '/', '/', 'div');
                case 'frac': case 'dfrac': case 'tfrac': case 'cfrac': x = arg(); return { t: 'frac', n: x, d: arg() };
                case 'binom': case 'dbinom': case 'tbinom': x = arg(); return { t: 'call', v: 'binom', a: [x, arg()] };
                case 'sqrt':
                    n = null;
                    if (isCh('[')) { i++; n = seq(function (t) { return stopT(t) || t.k === 'ch' && t.v === ']'; }); if (!isCh(']')) U('syntax', 'root'); i++; }
                    return { t: 'sqrt', n: n, x: arg() };
                case 'left': x = dlm(); n = seq(stopT); if (!isCmd('right')) U('unbalanced-left-right'); i++; return { t: 'par', l: x, x: n, r: dlm() };
                case 'begin': return env();
                case 'mathbf': case 'boldsymbol': case 'bm': W.push({ code: 'style-dropped', arg: c, level: 'info' }); return arg();
                case 'mathit': case 'mathrm': case 'mathsf': case 'mathtt': return arg();
                case 'mathbb': x = arg(); y = x.t === 'grp' && x.x.length === 1 ? x.x[0] : x; if (y.t === 'id' && BB[y.v]) return { t: 'id', v: BB[y.v] }; U('style-unsupported', c);
                case 'mathcal': case 'mathfrak': case 'mathscr': case 'cal': U('style-unsupported', c);
                case 'ldots': case 'cdots': case 'dots': return { t: 'word', v: '…', a: '...' };
                case 'forall': return { t: 'word', v: '∀', a: 'forall' };
                case 'exists': return { t: 'word', v: '∃', a: 'exists' };
                case '{': return pair(function (t) { return t.k === 'cmd' && t.v === '}'; }, '{', '}');
                case '}': return { t: 'raw', v: '}' };
                case '|': return pair(function (t) { return t.k === 'cmd' && t.v === '|'; }, '‖', '‖');
            }
            U('unknown-command', c);
        }
        var a = seq(stopT), t;
        if (i < tk.length) { t = tk[i]; U(t.v === '&' ? 'amp' : t.v === '\\' ? 'linebreak' : t.v === '}' ? 'unbalanced-braces' : t.v === 'right' ? 'unbalanced-left-right' : 'unbalanced-env'); }
        return a;
    }

    // ---- serializer. Precedence p: 0 list, 1 relation, 2 additive, 3 product/division, 4 power/prefix, 5 atom ----
    function wr(r) { return { s: '(' + r.s + ')', p: 5 }; }
    function at(r, m) { return r.p < m ? wr(r) : r; }
    function opT(o, X) { return X.o.lnOps === 'ascii' ? o.a : o.u; }
    function sp(t, X) { return X.o.lnSpace === 'tight' && !/^[A-Za-z]/.test(t) ? t : ' ' + t + ' '; }
    function sup(e, X) {
        var s = e.s.replace(/ /g, '');
        if (X.o.lnPow === 'unicode' && /^[\d+\-=()niT]+$/.test(s)) return s.split('').map(function (c) { return SUPm[c]; }).join('');
        return '^' + (e.p >= 5 && !/\s/.test(e.s) ? e.s : '(' + e.s + ')');
    }
    function sub(e, X) {
        var s = e.s.replace(/ /g, '');
        if (X.o.lnSub === 'unicode' && /^[\d+\-=()aehijklmnoprstuvx]+$/.test(s)) return s.split('').map(function (c) { return SUBm[c]; }).join('');
        return '_' + (e.p >= 5 && (e.s.length === 1 || /^\d+$/.test(e.s)) ? e.s : '(' + e.s + ')');
    }
    function rad(a) { return a.p === 5 && (a.pr || /^[\w.]+$/.test(a.s)) ? a.s : '(' + a.s + ')'; }
    function mulT(o, X) {
        if (o.k === 'div') return X.o.lnDiv === 'obelus' ? '÷' : '/';
        var m = X.o.lnMul;
        return X.o.lnOps === 'ascii' ? '*' : m === 'times' ? '×' : m === 'cdot' || m === 'implicit' ? '·' : '*';
    }
    function jn(a, b, X) {
        var m = X.sc ? 'implicit' : X.o.lnMul;
        if (a.raw || b.raw) return '';
        if (a.word || b.word) return ' ';
        if (/\d$/.test(a.s) && /^\d/.test(b.s)) return '*';
        if (m === 'implicit') return /[A-Za-z]$/.test(a.s) && /^[A-Za-z]/.test(b.s) && (a.s.length > 1 || b.s.length > 1) ? ' ' : '';
        if (a.id && b.pr) return '';
        return X.o.lnOps === 'ascii' ? '*' : m === 'times' ? '×' : m === 'cdot' ? '·' : '*';
    }
    function ser(n, X) {
        var o = X.o, a, b, s, rows;
        switch (n.t) {
            case 'num': return { s: n.v, p: 5 };
            case 'id': return { s: n.v, p: 5, id: 1 };
            case 'sym': return n.g ? { s: o.lnGreek === 'name' ? n.v : GR[n.v], p: 5, id: 1 } : { s: AT[n.v][o.lnOps === 'ascii' ? 1 : 0], p: 5 };
            case 'word': return { s: o.lnOps === 'ascii' && n.a != null ? n.a : n.v, p: 5, word: 1 };
            case 'raw': return { s: n.v, p: 5, raw: 1 };
            case 'grp': return seqS(n.x, X);
            case 'par': a = seqS(n.x, X); return { s: n.l + a.s + n.r, p: 5, pr: n.l === '(' };
            case 'post': a = at(ser(n.x, X), 5); return { s: a.s + n.v, p: 5 };
            case 'scr':
                b = ser(n.b, X); if (b.p < 5) b = wr(b);
                X.sc++; s = b.s + (n.sb ? sub(ser(n.sb, X), X) : '') + (n.sp ? sup(ser(n.sp, X), X) : ''); X.sc--;
                return { s: s, p: n.sp ? 4 : 5, id: b.id && !n.sp };
            case 'frac':
                s = fd(n.n) && fd(n.d); if (s) X.int++;
                a = ser(n.n, X); b = ser(n.d, X);
                if (s) X.int--;
                if (o.lnDiv === 'paren') return { s: '(' + a.s + ')/(' + b.s + ')', p: 3, dv: 1 };
                if (a.p < 3 || a.dv) a = wr(a);
                if (b.p < 4) b = wr(b);
                return { s: a.s + (o.lnDiv === 'obelus' ? '÷' : '/') + b.s, p: 3, dv: 1 };
            case 'sqrt':
                a = ser(n.x, X);
                if (n.n) {
                    b = seqS(n.n, X);
                    if (o.lnRoot === 'radical' && (b.s === '3' || b.s === '4')) return { s: (b.s === '3' ? '∛' : '∜') + rad(a), p: 4 };
                    return { s: 'root(' + b.s + ', ' + a.s + ')', p: 5 };
                }
                return o.lnRoot === 'radical' ? { s: '√' + rad(a), p: 4 } : { s: 'sqrt(' + a.s + ')', p: 5 };
            case 'call': return { s: n.v + '(' + ser(n.a[0], X).s + ', ' + ser(n.a[1], X).s + ')', p: 5 };
            case 'acc':
                a = ser(n.x, X);
                if (/^[^\s]$/.test(a.s) && a.p === 5 && o.lnOps !== 'ascii') return { s: a.s + ACC[n.c], p: 5, id: a.id };
                return { s: n.c.replace(/^wide/, '').replace('overline', 'bar') + '(' + a.s + ')', p: 5 };
            case 'mat': case 'cases':
                rows = n.rows.map(function (r) { return r.map(function (c) { return at(seqS(c, X), 1).s; }).join(', '); }).join('; ');
                return n.t === 'cases' ? { s: 'cases{' + rows + '}', p: 5 } : { s: ENVB[n.env][0] + rows + ENVB[n.env][1], p: 5 };
            case 'fn': case 'big': return seqS([n], X);
        }
        U('unsupported', n.t);
    }
    function DI(n) { return n.t === 'id' || n.t === 'sym' && n.g || n.t === 'scr' && n.b.t === 'id'; }
    function seqS(a, X) {
        var Ls = [], k = 0, n, j, f, run, nm, body, hd, lo, hi, rg, bs, arg, o = X.o;
        if (!a.length) return { s: '', p: 5 };
        while (k < a.length) {
            n = a[k];
            if (n.t === 'op') { Ls.push({ o: n }); k++; continue; }
            if (n.t === 'fn' && !n.lim) {
                j = k + 1; run = [];
                if (a[j] && a[j].t === 'par' && a[j].l === '(') run = [a[j++]];
                else while (j < a.length && FA[a[j].t]) run.push(a[j++]);
                X.sc++; nm = n.v + (n.sb ? sub(ser(n.sb, X), X) : '') + (n.sp ? sup(ser(n.sp, X), X) : ''); X.sc--;
                if (!run.length) f = { s: nm, p: 5 };
                else {
                    if (run[0].t === 'scr' && run[0].b.t === 'par' && run[0].b.l === '(') U('ambiguous-fn-arg', n.v);
                    if (run.length > 1) X.w.push({ code: 'fn-arg', arg: n.v, level: 'info' });
                    arg = run.length === 1 && run[0].t === 'par' ? ser(run[0], X) : wr(seqS(run, X));
                    f = { s: nm + arg.s, p: 5 };
                }
                Ls.push({ f: f }); k = j; continue;
            }
            if (n.t === 'big' || n.t === 'fn') {
                j = k + 1; while (j < a.length && !(a[j].t === 'op' && a[j].l < 3)) j++;
                body = a.slice(k + 1, j);
                hd = n.t === 'big' ? BIG[n.v][o.lnBig === 'ascii' ? 1 : 0] : n.v;
                lo = n.t === 'big' ? n.lo : n.sb; hi = n.t === 'big' ? n.hi : n.sp;
                lo = lo ? ser(lo, X).s : ''; hi = hi ? ser(hi, X).s : '';
                rg = lo && hi ? '(' + lo + '..' + hi + ')' : lo ? '(' + lo + ')' : hi ? '(..' + hi + ')' : '';
                if (n.int) X.int++;
                bs = seqS(body, X);
                if (n.int) X.int--;
                if (body.length && !n.int && bs.p < 4) bs = wr(bs);
                Ls.push({ f: { s: hd + rg + (body.length ? ' ' + bs.s : ''), p: 3 } }); k = j; continue;
            }
            if (X.int && (n.t === 'id' && n.v === 'd' || n.t === 'sym' && n.v === 'partial') && a[k + 1] && DI(a[k + 1])) {
                hd = ser(n, X).s; f = ser(a[k + 1], X);
                Ls.push({ f: { s: hd + (hd.length > 1 && /[A-Za-z]$/.test(hd) ? ' ' : '') + f.s, p: 5, word: 1 } }); k += 2; continue;
            }
            Ls.push({ f: ser(n, X) }); k++;
        }
        return lvl(Ls, X, 0);
    }
    function lvl(Ls, X, l) {
        var ps = [[]], os = [], s = '', ld;
        if (l > 2) return prod(Ls, X);
        Ls.forEach(function (e) { if (e.o && e.o.l === l) { os.push(e.o); ps.push([]); } else ps[ps.length - 1].push(e); });
        if (!os.length) return lvl(Ls, X, l + 1);
        ld = l === 2 && !ps[0].length;
        ps.forEach(function (p, k) {
            var q;
            if (!p.length) { if (l === 0 && k === ps.length - 1) s += os[k - 1].u; else if (!(ld && k === 0)) U('syntax', 'empty-operand'); return; }
            q = lvl(p, X, l + 1);
            if (l === 0) s += (k ? os[k - 1].u + ' ' : '') + at(q, 1).s;
            else if (l === 1) s += (k ? sp(opT(os[k - 1], X), X) : '') + at(q, 2).s;
            else s += (k ? (ld && k === 1 ? opT(os[0], X) : sp(opT(os[k - 1], X), X)) : '') + at(q, 3).s;
        });
        return { s: s, p: l };
    }
    function prod(Ls, X) {
        var s = '', pf = null, po = null, nf = 0, dv = false, ex = false, fs = Ls.filter(function (e) { return !e.o; }), impl = X.o.lnMul === 'implicit', k, e, f;
        if (fs.length === 1 && Ls.length === 1) return fs[0].f;
        for (k = 0; k < Ls.length; k++) {
            e = Ls[k];
            if (e.o) {
                if (!pf || k === Ls.length - 1) U('syntax', 'operator-edge');
                if (e.o.k === 'div') { if (Ls[k + 2] && !Ls[k + 2].o) U('ambiguous-div'); dv = true; }
                s += mulT(e.o, X); pf = null; po = e.o; ex = true; continue;
            }
            f = e.f;
            if (f.p < 3 || po && po.k === 'div' && f.p < 4 || impl && fs.length > 1 && f.dv) f = wr(f);
            if (pf) s += jn(pf, f, X);
            s += f.s; if (f.dv) dv = true; pf = f; po = null; nf++;
        }
        return { s: s, p: 3, dv: dv };
    }
    function strip(s) {
        var t = s.trim(), m;
        if ((m = /^\$\$([\s\S]*)\$\$$/.exec(t)) || (m = /^\\\[([\s\S]*)\\\]$/.exec(t)) || (m = /^\\\(([\s\S]*)\\\)$/.exec(t)) || (m = /^\$([\s\S]*)\$$/.exec(t))) return m[1].trim();
        return t;
    }
    /** LaTeX (with or without $ $$ \( \[ delimiters) -> {out,safe,warnings:[{code,arg,level:'info'|'warn'}]}. Unsafe: out = src unchanged. Never throws. */
    L.convert = function (src, opts) {
        var o = Object.assign(L.defaults(), opts), w = [], X = { o: o, w: w, int: 0, sc: 0 }, raw = String(src == null ? '' : src), s = strip(raw), r;
        if (!s) return { out: raw, safe: false, warnings: [{ code: 'empty', level: 'warn' }] };
        try { r = seqS(parse(lex(s), w), X); }
        catch (e) { w.push({ code: e && e.u ? e.u : 'error', arg: e && e.u ? e.arg : String(e && e.message || e), level: 'warn' }); return { out: raw, safe: false, warnings: w }; }
        return { out: r.s, safe: true, warnings: w };
    };
    /** Effective mode-B text of a math inline (string) or null when it is not B / not safe. For toPlain/toMarkdown. */
    L.text = function (x) { var f = x && x.meta && x.meta.fx; return f && f.mode === 'B' && f.lin && f.lin.safe ? f.lin.out : null; };

    // ---- registration: transform (order 7, after math-detect 5 / math-latex 6) + HTML renderer 'B' ----
    function render(x, d) {
        var t = L.text(x);
        if (t == null) return null;
        if (d) return '<div class="tz-math tz-math-block tz-math-b" dir="ltr" style="text-align:center;margin:12pt 0;">' + T.esc(t) + '</div>';
        return '<span class="tz-math tz-math-inline tz-math-b" dir="ltr" style="unicode-bidi:isolate;">' + T.esc(t) + '</span>';
    }
    if (E.addTransform) E.addTransform({
        id: 'math-linear', order: 7, fn: function (ctx) {
            var o = L.defaults(), S = ctx.settings;
            Object.keys(o).forEach(function (k) { if (S[k] != null) o[k] = S[k]; });
            ctx.blocks.forEach(function (b, bi) {
                E.inlineLists(b).forEach(function (l) {
                    l.forEach(function (x) {
                        var f = x.k === 'math' && x.meta && x.meta.fx, r;
                        if (!f) return;
                        x.meta.mode = f.mode;
                        if (f.mode !== 'B') return;
                        r = L.convert(x.meta.tex != null ? x.meta.tex : x.s, o);
                        f.lin = { out: r.out, safe: r.safe, warnings: r.warnings };
                        f.warnings = r.warnings;
                        if (r.safe) { f.out = r.out; ctx.util.change('math-linear', 'math-linear.B', x.s, r.out, bi); }
                        else { f.mode = 'keep'; x.meta.mode = 'keep'; ctx.util.warn('math-linear', 'math-linear.unsafe', String(r.warnings[r.warnings.length - 1].code), bi); }
                    });
                });
            });
        }
    });
    var R = T.get('math.render');
    if (R && R.add) R.add('B', render);
})(window.Taraz = window.Taraz || {});