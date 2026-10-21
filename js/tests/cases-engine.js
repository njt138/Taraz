// Tarāz tests: engine core (parse, inline, direction, pipeline). expect() returns true on pass; failures log a reason to console.
(function(T){
'use strict';
var L=[];
function E(){return T.get('engine');}
function P(x,s){return E().process(x,s);}
function I(r,i){return r.blocks[i||0].inlines;}
function S(r,i){return E().inlineSource(I(r,i));}
function F(r,f,i){return I(r,i).filter(f);}
function R(r,i){return F(r,function(x){return x.k==='ltr'&&!x.protected;},i).map(function(x){return x.s;});}
function U(r,id){return F(r,function(x){return x.rule===id;});}
function J(o){return JSON.stringify(o,function(k,v){return k==='id'||k==='run'?undefined:v;});}
function t(name,input,fn,settings){
 L.push({name:'engine: '+name,input:input,settings:settings,expect:function(r){
  var v;try{v=fn(r);}catch(e){v='threw '+e.message;}
  if(v!==true)console.warn('[Taraz test]',name,v);return v===true;}});
}
function idem(x){var a=P(x),s=E().toSource(a.blocks),b=P(s);return J(a.blocks)===J(b.blocks)&&E().toSource(b.blocks)===s;}
function eq(a,b){return JSON.stringify(a)===JSON.stringify(b);}

t('pure Persian','این یک متن فارسی است.',function(r){return r.blocks[0].dir==='rtl'&&!R(r).length;});
t('pure English','This is plain English text.',function(r){return r.blocks[0].dir==='ltr';});
t('mixed words','شبکه توزیع فعال با ADN و DER مدل می‌شود',function(r){return eq(R(r),['ADN','DER']);});
t('IEEE standard protected','استاندارد IEEE 1547.9-2022 را ببینید.',function(r){return U(r,'std')[0].s==='IEEE 1547.9-2022';});
t('IEEE Std form','طبق IEEE Std 1547-2018 عمل شد',function(r){return U(r,'std')[0].s==='IEEE Std 1547-2018';});
t('parenthesised run','منابع تولید پراکنده (DER) رشد کرده است',function(r){return R(r).indexOf('(DER)')>=0;});
t('trailing period excluded','مدل Active Distribution Network.',function(r){
 var a=I(r);return eq(R(r),['Active Distribution Network'])&&a[a.length-1].s==='.'&&S(r)==='مدل Active Distribution Network.';});
t('equation run','امپدانس Z₁ = 0.18 pu است',function(r){return eq(R(r),['Z₁ = 0.18 pu']);});
t('units with slash','توان 120 MW / 150 MVA است',function(r){return eq(R(r),['120 MW / 150 MVA']);});
t('exponent','مقدار 10^-3 است',function(r){return eq(R(r),['10^-3']);});
t('star is not italic','رابطه x = 2*Y برقرار است',function(r){return eq(R(r),['x = 2*Y'])&&!F(r,function(x){return x.k==='i';}).length;});
t('bold does not break run','**IEEE** 1547 مهم است',function(r){
 var a=F(r,function(x){return x.k==='ltr';});
 return a.length===2&&a[0].meta.run===a[1].meta.run&&a[0].s+a[1].s==='IEEE 1547'&&F(r,function(x){return x.k==='b';}).length===2&&S(r)==='**IEEE** 1547 مهم است';});
t('underscore italic','_ratio_ مهم است',function(r){return F(r,function(x){return x.k==='i';}).length===2&&eq(R(r),['ratio']);});
t('URL trailing dot','سایت https://example.com/a?b=1. را ببینید',function(r){var u=U(r,'url')[0];return u.k==='link'&&u.href==='https://example.com/a?b=1';});
t('email','ایمیل a.b@x.org بفرستید',function(r){return U(r,'email')[0].s==='a.b@x.org';});
t('Windows path','فایل C:\\Users\\Ali\\data.csv را باز کنید',function(r){return U(r,'winpath')[0].s==='C:\\Users\\Ali\\data.csv';});
t('Unix path','مسیر /usr/local/bin را ببینید',function(r){return U(r,'unixpath')[0].s==='/usr/local/bin';});
t('DOI','شناسه DOI 10.1109/TPWRD.2020.1234. را ببینید',function(r){return U(r,'doi')[0].s==='10.1109/TPWRD.2020.1234';});
t('version','نسخه v2.1.3 منتشر شد',function(r){return U(r,'ver')[0].s==='v2.1.3';});
t('citations','طبق [1] و [2–4] انجام شد',function(r){return U(r,'cite').length===2;});
t('code span untouched','تابع `foo(x)=$5$` را',function(r){return U(r,'code')[0].s==='foo(x)=$5$'&&!F(r,function(x){return x.k==='math';}).length&&S(r)==='تابع `foo(x)=$5$` را';});
t('$5 and $10 is not math','قیمت $5 and $10 است',function(r){return !F(r,function(x){return x.k==='math';}).length&&S(r)==='قیمت $5 and $10 است';},{digProse:'keep'});
t('inline $math$','رابطه $Z_1=0.18$ برقرار است',function(r){return U(r,'math1')[0].meta.tex==='Z_1=0.18';});
t('inline \\(math\\)','مقدار \\(a+b\\) برقرار است',function(r){return U(r,'math')[0].s==='\\(a+b\\)';});
t('display $$ block','$$\nE = mc^2\n$$',function(r){var b=r.blocks[0];return b.type==='math'&&b.inlines[0].meta.tex==='E = mc^2'&&b.dir==='ltr';});
t('display \\[ \\] block','\\[ x^2 \\]',function(r){return r.blocks[0].type==='math';});
t('heading','## عنوان Heading',function(r){return r.blocks[0].type==='h'&&r.blocks[0].level===2;});
t('Persian-digit ordered list','۱. نخست\n۲. دوم',function(r){return r.blocks.length===2&&r.blocks[0].type==='li'&&r.blocks[0].ordered&&r.blocks[0].marker==='۱.';});
t('nested list','- a\n  - b',function(r){return r.blocks[0].level===0&&r.blocks[1].level===1&&!r.blocks[0].ordered;});
t('task list','- [x] done',function(r){return r.blocks[0].task===true&&r.blocks[0].checked===true&&S(r)==='done';});
t('table','| a | b |\n|---|---|\n| ۱ | 2 |',function(r){
 var b=r.blocks[0];return b.type==='table'&&b.rows.length===2&&b.rows[1][0][0].k==='num'&&b.rows[1][1][0].k==='num';});
t('fenced code untouched',"```python\nx = 'سلام'\n```",function(r){var b=r.blocks[0];return b.type==='code'&&b.lang==='python'&&b.inlines[0].s==="x = 'سلام'"&&b.dir==='ltr';});
t('block quote','> نقل قول',function(r){return r.blocks[0].type==='quote'&&S(r)==='نقل قول';});
t('bidi controls stripped','\u2066سلام\u2069 ok\u200F',function(r){
 return S(r)==='سلام ok'&&r.changes.filter(function(c){return c.type==='strip-bidi';}).length===3&&r.changes[0].before==='U+2066 LRI';});
t('idempotent rich document','# عنوان IEEE 1547\n\nمتن با **bold** و `code` و [لینک](https://a.org) و $x^2$.\n\n- مورد یک (DER)\n  - زیر مورد\n- [x] انجام شد\n\n| a | b |\n|---|---|\n| ۱ | 2 |\n\n> نقل قول v2.1.3\n\n```\ncode here\n```\n\n$$\nE=mc^2\n$$',function(){
 return idem('# عنوان IEEE 1547\n\nمتن با **bold** و `code` و [لینک](https://a.org) و $x^2$.\n\n- مورد یک (DER)\n  - زیر مورد\n- [x] انجام شد\n\n| a | b |\n|---|---|\n| ۱ | 2 |\n\n> نقل قول v2.1.3\n\n```\ncode here\n```\n\n$$\nE=mc^2\n$$');});
t('idempotent with control chars','\u202Bسلام\u202C IEEE 1547\u200F',function(){return idem('\u202Bسلام\u202C IEEE 1547\u200F');});
t('numbers-only line inherits / override','این فارسی است\n\n۱۴۰۳',function(r){
 return r.blocks[1].dir==='rtl'&&P('English text here\n\n1403').blocks[1].dir==='ltr'&&P('English text here\n\n1403',{dirNumbers:'rtl'}).blocks[1].dir==='rtl';});
t('forced modes','این فارسی است',function(r){return r.blocks[0].dir==='ltr'&&P('Plain English',{dirMode:'rtl'}).blocks[0].dir==='rtl';},{dirMode:'ltr'});
t('sensitivity','سلام hello world foo bar',function(r){return r.blocks[0].dir==='ltr'&&P('سلام hello world foo bar',{dirSensitivity:90}).blocks[0].dir==='rtl';});
t('per-type override','# عنوان',function(r){return r.blocks[0].dir==='ltr';},{dirHeading:'ltr'});
t('list shares one direction','- سلام دنیا\n- English item here',function(r){return r.blocks[0].dir===r.blocks[1].dir;});
t('failing transform rolls back','سلام',function(){
 var r;E().addTransform({id:'t.boom',order:9999,fn:function(c){c.blocks.length=0;throw new Error('boom');}});
 try{r=P('سلام');}finally{E().removeTransform('t.boom');}
 return r.warnings.length===1&&r.warnings[0].ruleId==='t.boom'&&r.warnings[0].type==='transform-error'&&r.blocks.length===1&&S(r)==='سلام'&&r.health<100;});
t('transform order','x',function(){
 var r;
 E().addTransform({id:'t.b',order:20,fn:function(c){c.util.change('x','t.b','','');}});
 E().addTransform({id:'t.a',order:10,fn:function(c){c.util.change('x','t.a','','');}});
 try{r=P('x');}finally{E().removeTransform('t.a');E().removeTransform('t.b');}
 return eq(r.changes.map(function(c){return c.ruleId;}),['t.a','t.b']);});
t('conservative leaves standards unprotected','طبق IEEE 1547.9-2022 است',function(r){return !U(r,'std').length&&R(r)[0]==='IEEE 1547.9-2022';},{protection:'conservative'});
t('aggressive protects identifiers','فایل results_final.csv مهم',function(r){
 var b=P('فایل results_final.csv مهم');return U(r,'ident')[0].s==='results_final.csv'&&!F(b,function(x){return x.rule==='ident';}).length&&R(b)[0]==='results_final.csv';},{protection:'aggressive'});
t('formulas and stats','الف $a$ ب\n\n$$\nb\n$$',function(r){return r.formulas.length===2&&r.formulas[1].display&&!r.formulas[0].display&&r.stats.formulas===2;});
t('empty input','',function(r){return r.blocks.length===0&&r.health===100&&r.stats.chars===0;});
t('CRLF and soft breaks','a\r\nb',function(r){return r.blocks.length===1&&S(r)==='a\nb';});
t('blank-line paragraphs','خط یک\nخط دو\n\nبند دوم',function(r){return r.blocks.length===2&&S(r,0)==='خط یک\nخط دو';});
t('markdown link and unsafe href','[سایت](https://x.org) و [x](javascript:alert1)',function(r){
 var l=U(r,'mdlink');return l.length===2&&l[0].href==='https://x.org'&&l[0].dir==='rtl'&&l[1].href===undefined;});
t('lossless on mixed text','در شبکه IEEE 33-bus، مقدار V₁ = 1.05 pu (واحد) و [1] طبق https://a.org/x ثبت شد.',function(r){
 return S(r)==='در شبکه IEEE 33-bus، مقدار V₁ = 1.05 pu (واحد) و [1] طبق https://a.org/x ثبت شد.';});
t('Persian digits and ZWNJ','۱۲۰ مگاوات و ADN‌ها',function(r){
 return I(r)[0].k==='num'&&eq(R(r),['ADN'])&&S(r)==='۱۲۰ مگاوات و ADN‌ها';});
t('date-like line is not a list','۱۴۰۳-۰۵-۱۰ تاریخ',function(r){return r.blocks[0].type==='p';});
T.addTests(L);
})(window.Taraz=window.Taraz||{});