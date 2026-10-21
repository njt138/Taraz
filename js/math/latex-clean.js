// Tarāz math/latex-clean: MODE A, LaTeX normalized for the Word/PowerPoint equation box (Alt+=); lazy KaTeX MathML hook. No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),L=T.get('math.latex')||T.register('math.latex',{}),
 BB={C:'\u2102',H:'\u210D',N:'\u2115',P:'\u2119',Q:'\u211A',R:'\u211D',Z:'\u2124'},
 SCR={B:'\u212C',E:'\u2130',F:'\u2131',H:'\u210B',I:'\u2110',L:'\u2112',M:'\u2133',R:'\u211B',e:'\u212F',g:'\u210A',o:'\u2134'},
 FR={C:'\u212D',H:'\u210C',I:'\u2111',R:'\u211C',Z:'\u2128'},
 FN=/^(?:sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|coth|log|ln|lg|exp|lim|limsup|liminf|max|min|sup|inf|det|dim|ker|gcd|deg|arg|Pr)$/,
 SY={le:'\\leq',ge:'\\geq',ne:'\\neq',dots:'\\ldots',land:'\\wedge',lor:'\\vee',implies:'\\Rightarrow',iff:'\\Leftrightarrow',gets:'\\leftarrow',
  lbrace:'\\{',rbrace:'\\}',lbrack:'[',rbrack:']',lvert:'|',rvert:'|',lVert:'\\|',rVert:'\\|',vert:'|',Vert:'\\|'},
 UNS=/^(?:substack|overset|underset|stackrel|cancel|bcancel|xcancel|sout|hspace|vspace|rule|smash|mathop|mathbin|mathrel|xleftarrow|xrightarrow|newcommand|renewcommand|def|let|ref|eqref|cite|hline|mathstrut|intertext|DeclareMathOperator)$/,
 K={'$':['$','$'],'$$':['$$','$$'],'\\(':['\\(','\\)'],'\\[':['\\[','\\]'],bracket:['[ ',' ]'],paren:['( ',' )']};
function sw(id,label,help,lv){return {id:id,group:'math',label:label,help:help,type:'switch',def:true,level:lv||'pro',affects:'engine'};}
var OPT=[
 {id:'mxDelim',group:'math',label:'علامت‌های دور فرمول (حالت A)',type:'segmented',def:'strip',level:'basic',affects:'engine',
  options:[{v:'strip',label:'حذف'},{v:'keep',label:'نگه‌داشتن'},{v:'dollar',label:'$…$'},{v:'paren',label:'\\(…\\)'}],
  help:'برای جعبهٔ معادلهٔ Word معمولاً «حذف» مناسب است، چون Word علامت $ را فرمول نمی‌شناسد.'},
 sw('mxDfrac','\\dfrac و \\tfrac به \\frac','Word این دو دستور را معمولاً نمی‌شناسد.'),
 sw('mxLeftRight','یکسان‌سازی \\left و \\right','اندازه‌های \\big و \\Big حذف و فاصله‌های بعد از \\left و \\right برداشته می‌شود؛ Word خودش اندازه را تنظیم می‌کند.'),
 sw('mxSyn','هم‌معنی‌ها (\\le، \\dots، \\lbrace …)','دستورهای کم‌کاربرد به معادل رایج‌تر تبدیل می‌شوند.'),
 sw('mxFonts','قلم‌های ریاضی (\\mathbb، \\mathcal، \\mathbf، \\mathrm …)','تا جای ممکن به نویسه‌های یونیکد معادل تبدیل می‌شوند (مثل ℝ)؛ \\boldsymbol روی حروف یونانی قابل تبدیل نیست و ضخامت از دست می‌رود.'),
 {id:'mxText',group:'math',label:'دستور \\text',type:'segmented',def:'quote',level:'pro',affects:'engine',
  options:[{v:'quote',label:'گیومهٔ ساده'},{v:'plain',label:'متن ساده'},{v:'keep',label:'بدون تغییر'}],
  help:'در جعبهٔ معادلهٔ Word متن عادی با گیومهٔ ساده نوشته می‌شود. اگر نسخهٔ Word شما \\text را می‌فهمد «بدون تغییر» را انتخاب کنید.'},
 sw('mxOpname','\\operatorname','نام‌های شناخته‌شده مثل lim به دستور خودشان و بقیه به متن عادی تبدیل می‌شوند.'),
 sw('mxStyle','حذف \\displaystyle، \\limits، \\tag، \\label، \\color','این دستورها در Word معنا ندارند؛ شمارهٔ \\tag از دست می‌رود.'),
 {id:'mxAlign',group:'math',label:'محیط‌های align و gather و \\\\',type:'segmented',def:'rows',level:'pro',affects:'engine',
  options:[{v:'rows',label:'هر سطر جدا'},{v:'matrix',label:'ماتریس'},{v:'keep',label:'بدون تغییر'}],
  help:'Word محیط align ندارد. «هر سطر جدا»: & حذف و هر سطر در یک خط می‌آید (هر خط را جداگانه معادله کنید). «ماتریس»: ستون‌ها حفظ می‌شود ولی تراز دقیق نه.'},
 sw('mxEnv','تبدیل محیط‌های پشتیبانی‌نشده (array، Bmatrix …)','به matrix تبدیل می‌شوند؛ محیط‌های ناشناخته فقط بدنه‌شان نگه داشته می‌شود.'),
 sw('mxBinom','\\binom و \\pmod','به ماتریس و متن باز می‌شوند.'),
 sw('mxSpaces','یکسان‌سازی فاصله‌ها (\\, \\; ~)','فاصله‌های LaTeX به فاصلهٔ ساده تبدیل و فاصله‌های اضافی حذف می‌شود.'),
 sw('mxWarn','هشدار برای دستورهای تبدیل‌نشدنی','فهرست دستورهایی که Word احتمالاً تبدیل نمی‌کند. این هشدارها حدس هستند، نه تضمین.')
];
T.defineOptions(OPT);
function defs(){var r={};OPT.forEach(function(o){r[o.id]=o.def;});return r;}
function mk(){var a=[],seen={},f=function(c,g,l){var k=c+'\u0000'+(g||'');if(seen[k])return;seen[k]=1;a.push({code:c,arg:g||'',level:l||'warn'});};f.list=a;return f;}
function grp(s,i){
 var c,d=0,k,m;
 while(s.charAt(i)===' ')i++;
 c=s.charAt(i);
 if(c==='{'){for(k=i;k<s.length;k++){m=s.charAt(k);if(m==='\\'){k++;continue;}if(m==='{')d++;else if(m==='}'&&--d===0)return {b:s.slice(i+1,k),e:k+1};}return null;}
 if(c==='\\'){m=/^\\(?:[A-Za-z]+|.)/.exec(s.slice(i));return m?{b:m[0],e:i+m[0].length}:null;}
 return c?{b:c,e:i+1}:null;
}
function rep(s,names,n,fn){
 var re=new RegExp('\\\\('+names+')(?![A-Za-z])','g'),m,o='',last=0,a,j,g,r;
 while((m=re.exec(s))){
  a=[];j=re.lastIndex;
  for(g=0;g<n;g++){r=grp(s,j);if(!r){a=null;break;}a.push(r.b);j=r.e;}
  if(!a)continue;
  o+=s.slice(last,m.index)+fn(m[1],a);last=re.lastIndex=j;
 }
 return o+s.slice(last);
}
function umap(s,A,a,d,ex){
 return s.replace(/\\[A-Za-z]+|[A-Za-z0-9]/g,function(c){
  var n=c.charCodeAt(0);
  if(c.length>1)return c;
  if(ex&&ex[c])return ex[c];
  return n>=65&&n<=90?String.fromCodePoint(A+n-65):n>=97&&n<=122?String.fromCodePoint(a+n-97):n>=48&&n<=57&&d?String.fromCodePoint(d+n-48):c;
 });
}
function txt(b,o){b=b.replace(/\s+/g,' ');return o.mxText==='plain'?b:o.mxText==='keep'?'\\text{'+b+'}':'"'+b.replace(/"/g,'')+'"';}
function word(b,o){
 b=b.trim();
 return !b?'':/^[A-Za-z]$/.test(b)||/^[\d.]+$/.test(b)||b.indexOf('\\')>=0?b:FN.test(b)?'\\'+b+' ':o.mxText==='plain'?b:'"'+b+'"';
}
function fonts(s,o,w){
 var i,p;
 for(i=0;i<6;i++){
  p=s;
  s=rep(s,'mathbb|Bbb',1,function(n,a){return umap(a[0],0x1D538,0x1D552,0x1D7D8,BB);});
  s=rep(s,'mathcal|mathscr|cal',1,function(n,a){return umap(a[0],0x1D49C,0x1D4B6,0,SCR);});
  s=rep(s,'mathfrak',1,function(n,a){return umap(a[0],0x1D504,0x1D51E,0,FR);});
  s=rep(s,'mathbf|boldsymbol|bm|pmb|bf',1,function(n,a){
   if(!/^(?:mathbf|bf)$/.test(n)&&/\\[A-Za-z]/.test(a[0]))w('bold-lost',n,'info');
   return umap(a[0],0x1D400,0x1D41A,0x1D7CE);});
  s=rep(s,'mathrm|mathit|mathsf|mathtt|mathnormal|rm',1,function(n,a){return word(a[0],o);});
  s=rep(s,'textbf|textit|textrm|textsf|texttt|textnormal|emph|mbox|hbox',1,function(n,a){return txt(a[0],o);});
  if(s===p)break;
 }
 return s;
}
function style(s,w){
 s=s.replace(/\\(?:displaystyle|textstyle|scriptstyle|scriptscriptstyle|limits|nolimits|nonumber|notag)(?![A-Za-z])\s*/g,'').replace(/\\tag\*/g,'\\tag');
 s=rep(s,'tag|label',1,function(n,a){if(n==='tag')w('tag-dropped',a[0],'info');return '';});
 s=rep(s,'textcolor|colorbox',2,function(n,a){w('color-dropped','','info');return a[1];});
 return rep(s,'color',1,function(){w('color-dropped','','info');return '';});
}
function over(s,w){
 var re=/\{((?:[^{}]|\{[^{}]*\})*?)\\(over|choose)(?![A-Za-z])((?:[^{}]|\{[^{}]*\})*)\}/,i;
 for(i=0;i<9&&re.test(s);i++)s=s.replace(re,function(m,a,k,b){return (k==='over'?'\\frac{':'\\binom{')+a.trim()+'}{'+b.trim()+'}';});
 if(/\\(?:over|choose)(?![A-Za-z])/.test(s))w('over-left','','warn');
 return s;
}
function lr(s,w){
 var a,b;
 s=s.replace(/\\(?:big|Big|bigg|Bigg)[lrm]?(?![A-Za-z])\s*/g,'').replace(/\\(left|right|middle)\s+/g,'\\$1');
 a=(s.match(/\\left(?![A-Za-z])/g)||[]).length;b=(s.match(/\\right(?![A-Za-z])/g)||[]).length;
 if(a!==b)w('left-right',a+'/'+b,'warn');
 if(/\\middle(?![A-Za-z])/.test(s))w('middle','','warn');
 return s;
}
function conv(n,b,o,w,st){
 var k=n.replace('*',''),rows;
 function keep(t){st.push(t);return '\uE000'+(st.length-1)+'\uE001';}
 b=b.replace(/^\s+|\s+$/g,'');
 if(/^(?:equation|displaymath)$/.test(k))return b;
 if(/^(?:matrix|[pbvV]matrix)$/.test(k))return keep('\\begin{'+k+'}'+b+'\\end{'+k+'}');
 if(k==='cases'){w('cases','','info');return keep('\\begin{cases}'+b+'\\end{cases}');}
 if(/^(?:align|alignat|flalign|aligned|alignedat|split|eqnarray|gather|gathered|multline)$/.test(k)){
  if(o.mxAlign==='keep'){w('align-keep',k,'warn');return keep('\\begin{'+n+'}'+b+'\\end{'+n+'}');}
  rows=b.replace(/^\{\d+\}\s*/,'').split(/\\\\(?:\[[^\]]*\])?/).map(function(r){return r.trim();}).filter(Boolean);
  if(o.mxAlign==='matrix'){w('align-matrix',k,'info');return keep('\\begin{matrix}'+rows.join('\\\\')+'\\end{matrix}');}
  if(rows.length>1)w('align-rows',String(rows.length),'info');
  return rows.map(function(r){return r.replace(/(?<!\\)&/g,' ');}).join('\n');
 }
 if(o.mxEnv){
  if(k==='Bmatrix')return keep('\\left\\{\\begin{matrix}'+b+'\\end{matrix}\\right\\}');
  if(k==='smallmatrix')return keep('\\begin{matrix}'+b+'\\end{matrix}');
  if(k==='array'){b=b.replace(/^\{[^}]*\}/,'').replace(/\\hline\s*/g,'');return keep('\\begin{matrix}'+b+'\\end{matrix}');}
 }
 w('env-unsupported',n,'warn');return b;
}
function envs(s,o,w,st){
 var re=/\\begin\{([A-Za-z]+\*?)\}((?:(?!\\begin\{)[\s\S])*?)\\end\{\1\}/,i,m;
 for(i=0;i<40&&(m=re.exec(s));i++)s=s.slice(0,m.index)+conv(m[1],m[2],o,w,st)+s.slice(m.index+m[0].length);
 return s;
}
function wrap(s,p,o){
 var d=o.mxDelim,k=d==='keep'?K[p.delim]:d==='dollar'?(p.display?K.$$:K.$):d==='paren'?(p.display?K['\\[']:K['\\(']):null;
 return k?k[0]+s+k[1]:s;
}
/** Mode A: LaTeX (with or without delimiters) -> {out, warnings:[{code,arg,level:'info'|'warn'}]}. Never throws. */
L.clean=function(src,opts){
 var o=Object.assign(defs(),opts),w=mk(),st=[],Dt=T.get('math.detect'),p,s;
 src=String(src==null?'':src);
 p=Dt?Dt.parse(src):{delim:'bare',tex:src.trim(),display:false};
 try{
  s=p.tex.replace(/(?<!\\)%[^\n]*/g,'').replace(/\s*\n\s*/g,' ');
  if(o.mxStyle)s=style(s,w);
  if(o.mxSyn)s=s.replace(/\\([A-Za-z]+)(?![A-Za-z])/g,function(m,n){return SY.hasOwnProperty(n)?SY[n]:m;});
  if(o.mxDfrac)s=s.replace(/\\[dtc]frac(?![A-Za-z])/g,'\\frac');
  s=over(s,w);
  if(o.mxBinom){
   s=rep(s,'binom',2,function(n,a){return '\\left(\\begin{matrix}'+a[0]+'\\\\'+a[1]+'\\end{matrix}\\right)';});
   s=rep(s,'pmod',1,function(n,a){return '\\left('+txt('mod',o)+' '+a[0]+'\\right)';});
   s=s.replace(/\\(?:bmod|mod)(?![A-Za-z])/g,' '+txt('mod',o)+' ');
  }
  if(o.mxFonts)s=fonts(s,o,w);
  if(o.mxOpname){s=s.replace(/\\operatorname\*/g,'\\operatorname');s=rep(s,'operatorname',1,function(n,a){return word(a[0],o);});}
  if(o.mxText!=='keep')s=rep(s,'text',1,function(n,a){return txt(a[0],o);});
  if(o.mxLeftRight)s=lr(s,w);
  s=envs(s,o,w,st);
  if(o.mxAlign==='rows')s=s.replace(/\\\\(?:\[[^\]]*\])?/g,function(){w('linebreak','','info');return '\n';});
  s=s.replace(/(?<!\\)&/g,function(){w('amp-dropped','','info');return ' ';});
  if(o.mxSpaces)s=s.replace(/\\\\|\\[,:;!]|\\ |(?<!\\)~/g,function(m){return m==='\\\\'?m:m==='\\,'?'\\,':m==='\\!'?'':' ';});
  s=s.split('\n').map(function(l){return l.replace(/[ \t]+/g,' ').trim();}).filter(Boolean).join('\n');
  s=s.replace(/\uE000(\d+)\uE001/g,function(m,i){return st[+i];});
  if(o.mxWarn)(s.match(/\\[A-Za-z]+/g)||[]).forEach(function(c){
   var n=c.slice(1);
   if(UNS.test(n))w('unsupported',c,'warn');else if(!(Dt&&Dt.known(n)))w('unknown',c,'warn');
  });
  return {out:wrap(s,p,o),warnings:w.list};
 }catch(e){return {out:src,warnings:[{code:'error',arg:String((e&&e.message)||e),level:'warn'}]};}
};
// Pipeline: fill meta.fx.out for every formula whose mode is 'A' (runs right after math-detect).
E.addTransform({id:'math-latex',order:6,fn:function(ctx){
 ctx.blocks.forEach(function(b){E.inlineLists(b).forEach(function(l){l.forEach(function(x){
  var fx=x.k==='math'&&x.meta&&x.meta.fx,r;
  if(!fx||fx.mode!=='A')return;
  r=L.clean(x.s,Object.assign({},ctx.settings,fx.ov&&fx.ov.delim?{mxDelim:fx.ov.delim}:null));
  fx.out=r.out;fx.warnings=r.warnings;
 });});});
}});
// Serializer hook (through the shared dispatcher in detect.js): Mode A formulas render as cleaned LaTeX in a math font.
var MR=T.get('math.render');
if(MR)MR.add('A',function(x,d){
 var fx=x.meta&&x.meta.fx;
 if(!fx||fx.mode!=='A'||fx.out==null)return null;
 if(d)return '<div class="tz-math tz-math-block" dir="ltr" style="text-align:center;margin:12pt 0;font-family:\'Cambria Math\',Consolas,monospace">'+T.esc(fx.out).replace(/\n/g,'<br>')+'</div>';
 return '<span class="tz-math tz-math-inline" dir="ltr" style="unicode-bidi:isolate;font-family:\'Cambria Math\',Consolas,monospace">'+T.esc(fx.out).replace(/\n/g,'<br>')+'</span>';
});
var KX='https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
function load(){
 return window.katex?Promise.resolve():Promise.resolve(T.loadScript?T.loadScript(KX):Promise.reject(new Error('loader-missing')))
  .then(function(){if(!window.katex)throw new Error('katex-missing');});
}
function prep(t){
 return t.replace(/\\begin\{(?:align|alignat|flalign|eqnarray)\*?\}(?:\{\d+\})?/g,'\\begin{aligned}').replace(/\\end\{(?:align|alignat|flalign|eqnarray)\*?\}/g,'\\end{aligned}')
  .replace(/\\begin\{(?:gather|multline)\*?\}/g,'\\begin{gathered}').replace(/\\end\{(?:gather|multline)\*?\}/g,'\\end{gathered}')
  .replace(/\\(?:begin|end)\{equation\*?\}/g,'').replace(/\\(?:tag|label)\*?\{[^{}]*\}|\\nonumber|\\notag/g,'');
}
/** LaTeX (with/without delimiters) -> Promise<{ok,mathml,error}>; KaTeX 0.16.11 loaded lazily from jsDelivr. Never rejects. */
L.toMathML=function(src){
 var Dt=T.get('math.detect'),p=Dt?Dt.parse(src):{tex:String(src),display:false};
 return load().then(function(){
  var h=window.katex.renderToString(prep(p.tex),{output:'mathml',displayMode:!!p.display,throwOnError:true,strict:'ignore'}),m=/<math[\s\S]*<\/math>/.exec(h);
  return m?{ok:true,mathml:m[0],error:null}:{ok:false,mathml:null,error:'no-mathml'};
 }).catch(function(e){return {ok:false,mathml:null,error:String((e&&e.message)||e)};});
};
})(window.Taraz=window.Taraz||{});