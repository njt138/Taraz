// Tarāz tests: math/linear (MODE B) converter, unsafe fallbacks, transform.
(function (T) {
    'use strict';
    var A = [];
    function lin() { return T.get('math.linear'); }
    function add(name, f) { A.push({ id: 'mb-' + (A.length + 1), group: 'math-b', name: name, run: f, fn: f }); }
    function c(name, tex, exp, o) {
        add(name, function () {
            var l = lin(), r; if (!l) return 'math.linear missing';
            r = l.convert(tex, o);
            if (!r.safe) return 'unsafe: ' + r.warnings.map(function (w) { return w.code; }).join(',');
            return r.out === exp ? true : 'got ' + JSON.stringify(r.out) + ' expected ' + JSON.stringify(exp);
        });
    }
    function u(name, tex, code) {
        add(name, function () {
            var l = lin(), r; if (!l) return 'math.linear missing';
            r = l.convert(tex);
            if (r.safe !== false) return 'expected unsafe, got ' + JSON.stringify(r.out);
            if (r.out !== tex) return 'unsafe output must equal source';
            return r.warnings.some(function (w) { return w.code === code; }) ? true : 'codes: ' + r.warnings.map(function (w) { return w.code; }).join(',');
        });
    }
    function w(name, tex, code) {
        add(name, function () {
            var r = lin().convert(tex);
            return r.safe && r.warnings.some(function (x) { return x.code === code; }) ? true : 'missing warning ' + code;
        });
    }
    var UN = { lnPow: 'unicode', lnSub: 'unicode' };
    c('equation', 'x = 2y + 3', 'x = 2*y + 3');
    c('equation tight', 'x = 2y+3', 'x=2*y+3', { lnSpace: 'tight' });
    c('digits stay latin', '12+3.5', '12 + 3.5');
    c('polynomial', 'ax^2+bx+c', 'a*x^2 + b*x + c');
    c('square sum', 'x^2 + 2x + 1', 'x^2 + 2*x + 1');
    c('unary minus', '-(a+b)', '-(a + b)');
    c('minus group', 'a - (b + c)', 'a - (b + c)');
    c('relation chain', 'a \\le b \\le c', 'a ≤ b ≤ c');
    c('plus-minus lead', '\\pm 1', '±1');
    c('frac simple', '\\frac{a}{b}', 'a/b');
    c('frac sum numerator', '\\frac{a+b}{c}', '(a + b)/c');
    c('frac sum denominator', '\\frac{1}{x+1}', '1/(x + 1)');
    c('nested frac numerator', '\\frac{\\frac{a}{b}}{c}', '(a/b)/c');
    c('nested frac denominator', '\\frac{a}{\\frac{b}{c}}', 'a/(b/c)');
    c('frac product denominator', '\\frac{ab}{cd}', 'a*b/(c*d)');
    c('frac over sqrt', '\\frac{1}{\\sqrt{2}}', '1/sqrt(2)');
    c('frac paren mode', '\\frac{1}{2}', '(1)/(2)', { lnDiv: 'paren' });
    c('frac obelus', '\\frac{1}{2}', '1÷2', { lnDiv: 'obelus' });
    c('div command', 'a \\div b', 'a/b');
    c('div obelus', 'a \\div b', 'a÷b', { lnDiv: 'obelus' });
    c('derivative', '\\frac{dy}{dx}', 'dy/dx');
    c('partial derivative', '\\frac{\\partial f}{\\partial x}', '∂f/∂x');
    c('sqrt', '\\sqrt{x}', 'sqrt(x)');
    c('sqrt of sum', '\\sqrt{x^2+y^2}', 'sqrt(x^2 + y^2)');
    c('sqrt of frac', '\\sqrt{\\frac{a}{b}}', 'sqrt(a/b)');
    c('nth root', '\\sqrt[3]{x}', 'root(3, x)');
    c('radical atom', '\\sqrt{2}', '√2', { lnRoot: 'radical' });
    c('radical sum', '\\sqrt{x+1}', '√(x + 1)', { lnRoot: 'radical' });
    c('cube radical', '\\sqrt[3]{8}', '∛8', { lnRoot: 'radical' });
    c('power', 'x^2', 'x^2');
    c('power unicode', 'x^2', 'x²', UN);
    c('power sum exponent', 'x^{n+1}', 'x^(n + 1)');
    c('power sum unicode', 'x^{n+1}', 'xⁿ⁺¹', UN);
    c('negative exponent', '10^{-3}', '10^(-3)');
    c('negative exponent unicode', '10^{-3}', '10⁻³', UN);
    c('two to ten unicode', '2^{10}', '2¹⁰', UN);
    c('nested power', 'a^{b^c}', 'a^(b^c)');
    c('exp neg square', 'e^{-x^2}', 'e^(-x^2)');
    c('sub', 'x_i', 'x_i');
    c('sub unicode', 'x_i', 'xᵢ', UN);
    c('sub digit unicode', 'Z_1', 'Z₁', UN);
    c('sub multi', 'x_{ij}', 'x_(ij)');
    c('sub multi unicode', 'x_{ij}', 'xᵢⱼ', UN);
    c('sub word', 'v_{max}', 'v_(max)');
    c('sub and sup', 'x_i^2', 'x_i^2');
    c('sub and sup unicode', 'x_i^2', 'xᵢ²', UN);
    c('greek symbols', '\\alpha + \\beta', 'α + β');
    c('greek names', '\\alpha + \\beta', 'alpha + beta', { lnGreek: 'name' });
    c('greek product', '2\\alpha\\beta', '2*α*β');
    c('greek sub name', '\\alpha_1', 'alpha_1', { lnGreek: 'name' });
    c('capital greek', '\\Delta x', 'Δ*x');
    c('pi r squared', '\\pi r^2', 'π*r^2');
    c('sin', '\\sin x', 'sin(x)');
    c('sin cos identity', '\\sin^2 x + \\cos^2 x = 1', 'sin^2(x) + cos^2(x) = 1');
    c('log base', '\\log_2 n', 'log_2(n)');
    c('ln paren', '\\ln(x+1)', 'ln(x + 1)');
    c('sin product arg', '\\sin 2x + 1', 'sin(2*x) + 1');
    c('fn chain', '2\\sin x \\cos y', '2*sin(x)*cos(y)');
    c('limit', '\\lim_{x\\to 0} \\frac{\\sin x}{x}', 'lim(x → 0) (sin(x)/x)');
    c('sum limits', '\\sum_{i=1}^{n} x_i', '∑(i = 1..n) x_i');
    c('sum limits ascii', '\\sum_{i=1}^{n} x_i', 'sum(i = 1..n) x_i', { lnBig: 'ascii' });
    c('sum power body', '\\sum_{i=1}^n i^2', '∑(i = 1..n) i^2');
    c('sum product body', '\\sum_{i=1}^{n} a_i b_i', '∑(i = 1..n) (a_i*b_i)');
    c('product op', '\\prod_{k=1}^{m} k', '∏(k = 1..m) k');
    c('integral limits', '\\int_0^1 x^2 \\, dx', '∫(0..1) x^2 dx');
    c('integral plain', '\\int f(x)\\,dx', '∫ f(x) dx');
    c('pmatrix', '\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}', '(1, 2; 3, 4)');
    c('bmatrix', '\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}', '[1, 2; 3, 4]');
    c('vmatrix', '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', '|a, b; c, d|');
    c('cases', 'f(x)=\\begin{cases} x & x>0 \\\\ -x & x\\le 0 \\end{cases}', 'f(x) = cases{x, x > 0; -x, x ≤ 0}');
    c('mul star', 'a \\cdot b', 'a*b');
    c('mul times', 'a \\cdot b', 'a×b', { lnMul: 'times' });
    c('mul cdot', 'a \\times b', 'a·b', { lnMul: 'cdot' });
    c('mul implicit', 'a b', 'ab', { lnMul: 'implicit' });
    c('mul implicit number', '2x', '2x', { lnMul: 'implicit' });
    c('relation unicode', 'a \\leq b', 'a ≤ b');
    c('relation ascii', 'a \\leq b', 'a <= b', { lnOps: 'ascii' });
    c('plusminus ascii', 'a \\pm b', 'a +- b', { lnOps: 'ascii' });
    c('element of reals', 'x \\in \\mathbb{R}', 'x ∈ ℝ');
    c('hat', '\\hat{x}', 'x\u0302');
    c('hat multi', '\\hat{xy}', 'hat(x*y)');
    c('vector arrow', '\\vec{F} = m \\vec{a}', 'F\u20D7 = m*a\u20D7');
    c('overline', '\\overline{z}', 'z\u0304');
    c('text word', '\\text{if } x > 0', 'if x > 0');
    c('paren power', '(a+b)^2', '(a + b)^2');
    c('paren product', '(a+b)(c+d)', '(a + b)*(c + d)');
    c('function call', 'f(x, y)', 'f(x, y)');
    c('factorial', 'n!', 'n!');
    c('factorial paren', '(n+1)!', '(n + 1)!');
    c('binomial', '\\binom{n}{k}', 'binom(n, k)');
    c('left right power', '\\left( \\frac{a}{b} \\right)^2', '(a/b)^2');
    c('abs value', '\\left| x \\right|', '|x|');
    c('ellipsis list', '1, 2, \\ldots, n', '1, 2, …, n');
    c('ellipsis sum', 'a_1 + a_2 + \\cdots + a_n', 'a_1 + a_2 + … + a_n');
    w('warn: bold dropped', '\\mathbf{v} \\cdot \\mathbf{w}', 'style-dropped');
    w('warn: fn arg assumed', '\\sin 2x', 'fn-arg');
    u('unsafe: double script', 'x^2^3', 'double-script');
    u('unsafe: align env', '\\begin{align} a &= b \\end{align}', 'env-unsupported');
    u('unsafe: mathcal', '\\mathcal{L}', 'style-unsupported');
    u('unsafe: mathbb E', '\\mathbb{E}', 'style-unsupported');
    u('unsafe: ambiguous division', 'a / b c', 'ambiguous-div');
    u('unsafe: ambiguous fn arg', '\\sin(x)^2', 'ambiguous-fn-arg');
    u('unsafe: unbalanced left', '\\left( x', 'unbalanced-left-right');
    u('unsafe: unknown command', '\\foo x', 'unknown-command');
    u('unsafe: underbrace', '\\underbrace{a}_{b}', 'unknown-command');
    u('unsafe: stray ampersand', 'a & b', 'amp');
    u('unsafe: line break', 'a \\\\ b', 'linebreak');
    add('delimiters stripped', function () { var r = lin().convert('$$\\frac{a}{b}$$'); return r.safe && r.out === 'a/b' ? true : JSON.stringify(r); });
    add('never throws on garbage', function () { var r = lin().convert('\\frac{', {}); return r.safe === false && typeof r.out === 'string' ? true : JSON.stringify(r); });
    add('transform: mode B', function () {
        var f = T.get('engine').process('$x = 2y + 3$', { mathMode: 'B' }).formulas[0];
        return f && f.mode === 'B' && f.out === 'x = 2*y + 3' ? true : 'got ' + JSON.stringify(f);
    });
    add('transform: mode keep', function () {
        var f = T.get('engine').process('$x = 2y + 3$', { mathMode: 'keep' }).formulas[0];
        return f && f.mode === 'keep' && f.out == null ? true : 'got ' + JSON.stringify(f);
    });
    add('transform: unsafe B falls back to keep', function () {
        var r = T.get('engine').process('$\\underbrace{a}_{b}$', { mathMode: 'B' }), f = r.formulas[0];
        return f && f.mode === 'keep' && r.warnings.some(function (x) { return x.type === 'math-linear'; }) ? true : 'got ' + JSON.stringify(f);
    });
    add('serializer text helper', function () {
        var r = T.get('engine').process('$x = 2y + 3$', { mathMode: 'B' }), m = null;
        r.blocks.forEach(function (b) { T.get('engine').inlineLists(b).forEach(function (l) { l.forEach(function (x) { if (x.k === 'math') m = x; }); }); });
        return m && lin().text(m) === 'x = 2*y + 3' && m.k === 'math' && m.protected && m.meta.mode === 'B' ? true : 'inline: ' + JSON.stringify(m);
    });
    T.addTests(A);
})(window.Taraz = window.Taraz || {});