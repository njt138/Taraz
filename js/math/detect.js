// Tarāz math/detect: stronger math protectors, confidence scoring, per-formula overrides, enriched Result.formulas. No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),D=T.get('math.detect')||T.register('math.detect',{}),
 R=T.get('math.render')||T.register('math.render',{fns:[]}),cur={},ov={},KN={},ENVS={},RT=/[\u0590-\u08FF]/,TX=/\\[A-Za-z]+|[\^_=<>]/,
 K0='alpha beta gamma delta epsilon varepsilon zeta eta theta vartheta iota kappa lambda mu nu xi pi varpi rho varrho sigma varsigma tau upsilon phi varphi chi psi omega Gamma Delta Theta Lambda Xi Pi Sigma Upsilon Phi Psi Omega frac dfrac tfrac cfrac sqrt sum prod int iint iiint oint lim limsup liminf sup inf max min arg det dim exp ln log lg sin cos tan cot sec csc arcsin arccos arctan sinh cosh tanh coth Pr gcd deg hom ker left right middle big Big bigg Bigg bigl bigr Bigl Bigr biggl biggr Biggl Biggr cdot cdots ldots dots vdots ddots times div pm mp leq geq le ge neq ne approx equiv sim simeq cong propto infty partial nabla forall exists nexists in notin ni subset supset subseteq supseteq cup cap setminus emptyset varnothing to rightarrow leftarrow leftrightarrow Rightarrow Leftarrow Leftrightarrow mapsto longrightarrow longleftarrow implies iff gets hat widehat bar overline underline vec dot ddot tilde widetilde check breve acute grave mathbf mathrm mathit mathbb mathcal mathscr mathfrak mathsf mathtt boldsymbol bm text textbf textit textrm textsf texttt textnormal textcolor color colorbox operatorname displaystyle textstyle scriptstyle scriptscriptstyle limits nolimits binom choose over atop begin end quad qquad hspace hbox mbox emph overbrace underbrace overset underset stackrel substack not neg land lor wedge vee oplus otimes angle perp parallel circ bullet star prime ell hbar Re Im aleph langle rangle lfloor rfloor lceil rceil lvert rvert lVert rVert vert Vert lbrace rbrace lbrack rbrack tag label nonumber notag phantom vphantom hphantom boxed cancel bcancel xcancel mod bmod pmod mathstrut smash mathop mathbin mathrel Bbb cal bf rm sgn degree hline xleftarrow xrightarrow rule sout ref eqref';
K0.split(' ').forEach(function(k){KN[k]=1;});
'equation align alignat flalign gather multline eqnarray aligned alignedat gathered split cases matrix pmatrix bmatrix Bmatrix vmatrix Vmatrix smallmatrix array displaymath'.split(' ').forEach(function(k){ENVS[k]=1;});
/** Is `n` (command name without backslash) a command we recognise? */
D.known=function(n){return KN[n]===1;};
function sw(id,label,help,def,lv){return {id:id,group:'math',label:label,help:help,type:'switch',def:def,level:lv||'pro',affects:'engine'};}
T.defineOptions([
 {id:'mathMode',group:'math',label:'حالت پیش‌فرض فرمول‌ها',type:'segmented',def:'A',level:'basic',affects:'engine',
  options:[{v:'A',label:'A: LaTeX برای Word'},{v:'B',label:'B: معادلهٔ Word'},{v:'keep',label:'بدون تغییر'}],
  help:'A: فرمول به LaTeX تمیز تبدیل می‌شود تا هنگام چسباندن در جعبهٔ معادلهٔ Word (Alt+=) و زدن Space یا Enter تبدیل شود. تبدیل نهایی کار خود Word است و بعضی دستورها تبدیل نمی‌شوند. B: تبدیل مستقیم به معادله (در مرحلهٔ بعد). بدون تغییر: فرمول دست‌نخورده می‌ماند.'},
 {id:'mathMinConf',group:'math',label:'حداقل اطمینان تشخیص',type:'slider',min:0,max:100,step:5,def:40,level:'pro',affects:'engine',
  help:'فرمول‌هایی که اطمینان تشخیصشان کمتر از این عدد باشد دست‌نخورده می‌مانند. تشخیص خودکار همیشه حدس است و ممکن است اشتباه کند.'},
 sw('mathBare','تشخیص دستورهای LaTeX بدون علامت','دستورهایی مثل \\frac یا x_i را بدون $ هم فرمول در نظر می‌گیرد.',true),
 sw('mathBracket','فرمول‌های [ … ] و ( … ) متن چت','فرمول‌هایی که با کروشه یا پرانتز و فاصله نوشته شده‌اند را فقط اگر نشانهٔ LaTeX داشته باشند تشخیص می‌دهد.',true),
 sw('mathMoney','جلوگیری از اشتباه با قیمت دلاری','متنی مثل «$5 و $10» فرمول حساب نمی‌شود.',true)
]);
/** Split raw math text into {delim,tex,display,base}. delim: $ $$ \( \[ env bracket paren bare. */
D.parse=function(raw){
 var s=String(raw),h=s.slice(0,2);
 if(h==='$$'&&s.length>3)return {delim:'$$',tex:s.slice(2,-2).trim(),display:true,base:95};
 if(h==='\\[')return {delim:'\\[',tex:s.slice(2,-2).trim(),display:true,base:95};
 if(h==='\\(')return {delim:'\\(',tex:s.slice(2,-2).trim(),display:false,base:92};
 if(s.charAt(0)==='$'&&s.length>1)return {delim:'$',tex:s.slice(1,-1).trim(),display:false,base:78};
 if(/^\\begin\{/.test(s))return {delim:'env',tex:s,display:true,base:92};
 if(/^\[\s/.test(s)&&/\s\]$/.test(s))return {delim:'bracket',tex:s.slice(1,-1).trim(),display:true,base:62};
 if(/^\(\s/.test(s)&&/\s\)$/.test(s))return {delim:'paren',tex:s.slice(1,-1).trim(),display:false,base:60};
 return {delim:'bare',tex:s.trim(),display:false,base:50};
};
function bal(t){var d=0,i,c;for(i=0;i<t.length;i++){c=t.charAt(i);if(c==='\\'){i++;continue;}if(c==='{')d++;else if(c==='}'&&--d<0)return false;}return d===0;}
function cnt(t,re){return (t.match(re)||[]).length;}
/** Raw math text -> {src,delim,tex,display,confidence 0-100,issues[]}. */
D.analyze=function(raw){
 var p=D.parse(raw),t=p.tex,is=[],c=p.base,seen={},cm=t.match(/\\[A-Za-z]+/g)||[],
  pl=t.replace(/\\(?:text|textrm|textbf|textit|mathrm|operatorname|mbox)\s*\{[^{}]*\}/g,'');
 if(!t){is.push('empty');c=0;}
 if(!bal(t)){is.push('unbalanced-braces');c-=30;}
 cm.forEach(function(x){var n=x.slice(1);if(seen[n])return;seen[n]=1;if(KN[n]!==1){is.push('unknown-command:'+x);c-=15;}});
 if(cnt(t,/\\left(?![A-Za-z])/g)!==cnt(t,/\\right(?![A-Za-z])/g)){is.push('unbalanced-left-right');c-=15;}
 if(cnt(t,/\\begin\{/g)!==cnt(t,/\\end\{/g)){is.push('unbalanced-env');c-=25;}
 if(RT.test(pl)){is.push('rtl-in-math');c-=20;}
 if(/[A-Za-z]{3,}(?:\s+[A-Za-z]{3,}){2,}/.test(pl.replace(/\\[A-Za-z]+/g,''))){is.push('prose-like');c-=20;}
 if(/[\^_=]|\\[A-Za-z]/.test(t))c+=Math.min(10,2+cm.length*2);
 return {src:String(raw),delim:p.delim,tex:t,display:p.display,confidence:Math.max(0,Math.min(100,c)),issues:is};
};
/** Per-formula override by formula id (stable for identical input): {mode:'A'|'B'|'keep', delim?:'strip'|'keep'|'dollar'|'paren'}. */
D.setOverride=function(id,o){ov[id]=Object.assign({},ov[id],o);};
D.overrides=function(){return Object.assign({},ov);};
D.clearOverrides=function(id){if(id==null)ov={};else delete ov[id];};

var G='\\{(?:[^{}\\n]|\\{(?:[^{}\\n]|\\{[^{}\\n]*\\})*\\})*\\}',
 SC='(?:[_^](?:'+G+'|\\\\[A-Za-z]+|[A-Za-z0-9]|[+\\-]))',
 CM='\\\\[A-Za-z]+\\*?(?:[ ]?(?:'+G+'|\\[[^\\]\\n]{0,30}\\]))*',
 UN='(?:'+CM+'|[A-Za-z0-9]+(?:\\.\\d+)?|'+G+'|\\((?:[^()\\n]|\\([^()\\n]*\\))*\\))'+SC+'*',
 BARE=new RegExp('(?<![\\w\\\\])(?:'+CM+SC+'*|[A-Za-z0-9]'+SC+'+)(?:(?:[ ]?[=+\\-*/<>][ ]?|[ ]?(?=\\\\)|(?=[({]))'+UN+')*');
function bd(m,s){var p=D.parse(s);return {meta:{tex:p.tex,display:p.display}};}
[
 {id:'math',order:20,kind:'math',re:/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/,build:bd},
 {id:'mathenv',order:21,kind:'math',re:/\\begin\{([A-Za-z]+\*?)\}[\s\S]*?\\end\{\1\}/,build:bd,
  test:function(m){return ENVS[m[1].replace('*','')]===1;}},
 {id:'math1',order:22,kind:'math',re:/\$(?!\s)([^$\n]*?[^\s$\\])\$(?![\d$])/,build:bd,
  test:function(m,t,a){var x=m[1],y=x.replace(/\\[A-Za-z]+/g,''),sym=/[\\^_{}=<>+*\/]/.test(x);
   if(a>0&&/[\w$]/.test(t.charAt(a-1)))return false;
   if(/^\d/.test(x)&&/[A-Za-z]{2,}/.test(y)&&!sym)return false;
   if(cur.mathMoney!==false&&/^\d[\d,]*(?:\.\d+)?\s*(?:[A-Za-z]{3,}|[\u0590-\u08FF])/.test(x)&&!sym)return false;
   if(/[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(y)&&!sym)return false;
   return !(RT.test(x)&&x.indexOf('\\')<0);}},
 {id:'mathbr',order:24,kind:'math',min:'balanced',build:bd,
  re:/(?<![\w\]\\])\[\s([^\[\]\n]*?[^\s\[\]])\s\](?![\w(\[])|^\[\n([^\[\]]*?[^\s\[\]])\n\]$/,
  test:function(m){var x=m[1]||m[2];return cur.mathBracket!==false&&TX.test(x)&&!(RT.test(x)&&x.indexOf('\\')<0);}},
 {id:'mathpar',order:25,kind:'math',min:'balanced',build:bd,re:/(?<![\w)\]\\])\(\s([^()\n]*?[^\s()])\s\)(?![\w(\[])/,
  test:function(m){var x=m[1];return cur.mathBracket!==false&&/\\[A-Za-z]+|[\^_]\{/.test(x)&&!(RT.test(x)&&x.indexOf('\\')<0);}},
 {id:'mathbare',order:95,kind:'math',min:'balanced',re:BARE,build:bd,
  test:function(m){var c=/^\\([A-Za-z]+)/.exec(m[0]);return cur.mathBare!==false&&m[0].length>1&&(c?KN[c[1]]===1:true);}}
].forEach(function(p){E.addProtector(p);});

E.addTransform({id:'math-detect',order:5,fn:function(ctx){
 var S=ctx.settings,mm=S.mathMode||'A',mn=S.mathMinConf==null?40:+S.mathMinConf;
 ctx.blocks.forEach(function(b){E.inlineLists(b).forEach(function(l){
  var sole=l.filter(function(x){return !(x.meta&&x.meta.marker)&&String(x.s).trim();}).length===1;
  l.forEach(function(x){
   if(x.k!=='math')return;
   var a=D.analyze(x.s),o=ov[x.id]||null,md=o&&/^(A|B|keep)$/.test(o.mode)?o.mode:(a.confidence<mn?'keep':mm);
   if(a.delim==='bracket'&&!sole)a.display=false;
   if(b.type==='math')a.display=true;
   x.meta=Object.assign(x.meta||{},{tex:a.tex,display:a.display,
    fx:{src:x.s,delim:a.delim,display:a.display,confidence:a.confidence,mode:md,issues:a.issues,ov:o}});
  });
 });});
}});

var I0=E.inline.orig||E.inline,P0=E.process.orig||E.process;
function inl(t,S){var p=cur;cur=S||{};try{return I0.call(E,t,S);}finally{cur=p;}}
inl.orig=I0;E.inline=inl;
function proc(text,settings){
 var r=P0.call(E,text,settings),m={};
 try{
  r.blocks.forEach(function(b){E.inlineLists(b).forEach(function(l){l.forEach(function(x){
   if(x.k==='math'&&x.meta&&x.meta.fx)m[x.id]=x.meta.fx;});});});
  r.formulas.forEach(function(f){
   var fx=m[f.id];if(!fx)return;
   f.src=fx.src;f.delim=fx.delim;f.display=fx.display;f.confidence=fx.confidence;f.mode=fx.mode;f.issues=fx.issues.slice();
   if(fx.out!=null)f.out=fx.out;
   if(fx.warnings)f.warnings=fx.warnings.slice();
  });
 }catch(e){}
 return r;
}
proc.orig=P0;E.process=proc;

// Shared math renderer dispatcher: serialize.setMathRenderer holds ONE hook, so modes A/B register here.
R.add=function(id,fn){R.fns=R.fns.filter(function(f){return f.id!==id;});R.fns.push({id:id,fn:fn});D.hook();};
R.run=function(x,d,t){var i,h;for(i=0;i<R.fns.length;i++){try{h=R.fns[i].fn(x,d,t);}catch(e){h=null;}if(h!=null)return h;}return null;};
D.hook=function(){var S=T.get('serialize');if(S&&S.setMathRenderer)S.setMathRenderer(R.run);};
D.hook();
})(window.Taraz=window.Taraz||{});