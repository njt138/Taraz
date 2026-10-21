/* Tarāz — js/output/omml.js · MathML→OMML converter (native Word equations) · Built by Gholamreza Nejati Jahromi */
(function(T){
'use strict';
var NSM='http://schemas.openxmlformats.org/officeDocument/2006/math',NSW='http://schemas.openxmlformats.org/wordprocessingml/2006/main',
FN=/^(sin|cos|tan|cot|sec|csc|sinh|cosh|tanh|coth|arcsin|arccos|arctan|arg|deg|det|dim|exp|gcd|hom|inf|ker|lg|lim|liminf|limsup|ln|log|max|min|Pr|sup|mod)$/,
LIMFN=/^(lim|liminf|limsup|max|min|sup|inf|det|gcd|Pr)$/,
NARY='∑∏∐∫∬∭∮∯∰⋃⋂⋁⋀⨁⨂⨀⨄⨆',OPEN='([{⟨⌊⌈',CLOSE=')]}⟩⌋⌉',
ALLOW=/^[()[\]{}|‖⟨⟩⌊⌋⌈⌉′″∂∇!∞∑∏∐∫∬∭∮∯∰⋃⋂⋁⋀⨁⨂⨀⨄⨆]$/,
ACC={'^':'\u0302','\u02C6':'\u0302','~':'\u0303','\u02DC':'\u0303','\u00AF':'\u0304','\u02C9':'\u0304','\u02D9':'\u0307','\u00A8':'\u0308','\u2192':'\u20D7','\u2190':'\u20D6','\u2194':'\u20E1','\u02CB':'\u0300','`':'\u0300','\u02CA':'\u0301','\u00B4':'\u0301','\u02C7':'\u030C','\u02D8':'\u0306','\u02DA':'\u030A'},
SCR={'double-struck':'double-struck',script:'script','bold-script':'script',fraktur:'fraktur','bold-fraktur':'fraktur','sans-serif':'sans-serif','bold-sans-serif':'sans-serif','sans-serif-italic':'sans-serif','sans-serif-bold-italic':'sans-serif',monospace:'monospace'};

function gv(o,k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:undefined;}
function esc(s){return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fontPr(f){var e=esc(f);return '<w:rPr><w:rFonts w:ascii="'+e+'" w:hAnsi="'+e+'" w:cs="'+e+'"/></w:rPr>';}
function rRun(t,f,rp){return '<m:r>'+(rp?'<m:rPr>'+rp+'</m:rPr>':'')+fontPr(f)+'<m:t'+(/^\s|\s$/.test(t)?' xml:space="preserve"':'')+'>'+esc(t)+'</m:t></m:r>';}
function vv(n,v){return '<m:'+n+' m:val="'+esc(v)+'"/>';}
function rprOf(mva,plain){
  var s=String(mva||'').toLowerCase(),sc=gv(SCR,s),b=/bold/.test(s),i=/italic/.test(s),
  sty=b&&i?'bi':b?'b':i?'i':(s==='normal'||plain||sc)?'p':'';
  return (sc?vv('scr',sc):'')+(sty?vv('sty',sty):'');
}

function convert(root,font,W){
  var st={good:0,bad:0},CP='<m:ctrlPr>'+fontPr(font)+'</m:ctrlPr>';
  function run(t,rp){return rRun(t,font,rp);}
  function el(n,c){return '<m:'+n+'>'+(c||'')+'</m:'+n+'>';}
  function pr(n,c){return el(n+'Pr',(c||'')+CP);}
  function warn(code,arg){var k=code+':'+arg;if(!W.seen[k]){W.seen[k]=1;W.list.push({code:code,arg:arg,level:'warn'});}}
  function kids(n){var a=[],c=n.firstChild;for(;c;c=c.nextSibling)if(c.nodeType===1)a.push(c);return a;}
  function nm(n){return String(n.localName||n.nodeName||'').toLowerCase();}
  function tx(n){return String(n.textContent||'').replace(/[\u2061-\u2064]/g,'');}
  function at(n,a){return n.getAttribute?n.getAttribute(a):null;}
  function sq(n){return n?seq([n]):'';}
  function base0(n){return /^(msub|msup|msubsup|munder|mover|munderover)$/.test(nm(n))?kids(n)[0]:n;}
  function head(n){var b=base0(n),k;while(b&&nm(b)==='mrow'){k=kids(b);if(k.length===2&&nm(k[1])==='mo'&&!tx(k[1]).trim())b=k[0];else break;}return b;}
  function tok(n){var b=base0(n);return b&&nm(b)==='mo'?tx(b).trim():null;}
  function isFence(n){return nm(n)==='mo'&&at(n,'fence')==='true';}
  function isNary(n){var t=tok(n);return !!t&&t.length===1&&NARY.indexOf(t)>=0;}
  function isFn(n){var b=head(n);return !!b&&/^m[io]$/.test(nm(b))&&FN.test(tx(b).trim());}
  function spc(n){
    var a=at(n,'width')||'0',x=parseFloat(a)||0;
    if(/mu$/.test(a))x/=18;else if(/(px|pt)$/.test(a))x/=10;
    if(x<0.02)return '';
    return run((x<0.12?'\u200A':x<0.2?'\u2009':x<0.35?'\u2005':x<0.7?'\u2002':'\u2003')+(x>1.2?new Array(Math.round(x)).join('\u2003'):''));
  }
  function opEnd(a,i){
    var j=i,d=0,t;
    while(j<a.length&&tok(a[j])==='')j++;
    if(j<a.length&&/^[+\u2212-]$/.test(tok(a[j])||''))j++;
    for(;j<a.length;j++){
      t=tok(a[j]);
      if(t===null||t==='')continue;
      if(t.length===1&&OPEN.indexOf(t)>=0)d++;
      else if(t.length===1&&CLOSE.indexOf(t)>=0){if(!d)break;d--;}
      else if(!d&&!ALLOW.test(t))break;
    }
    return j;
  }
  function fnArg(a,i){
    var s=i+1,j,d=0,t;
    while(s<a.length&&tok(a[s])==='')s++;
    if(s>=a.length)return null;
    t=tok(a[s]);
    if(t===null)return [s,s+1];
    if(t.length!==1||OPEN.indexOf(t)<0)return null;
    for(j=s;j<a.length;j++){
      t=tok(a[j]);
      if(t&&t.length===1){if(OPEN.indexOf(t)>=0)d++;else if(CLOSE.indexOf(t)>=0&&--d<=0)return [s,j+1];}
    }
    return [s,a.length];
  }
  function seq(a){
    var o='',i=0,n,r;
    while(i<a.length){
      n=a[i];
      if(isNary(n)){r=opEnd(a,i+1);o+=nary(n,seq(a.slice(i+1,r)));i=r;continue;}
      if(isFn(n)&&(r=fnArg(a,i))){st.good++;o+=el('func',pr('func')+el('fName',cv(n))+el('e',seq(a.slice(r[0],r[1]))));i=r[1];continue;}
      o+=cv(n);i++;
    }
    return o;
  }
  function nary(n,body){
    var x=nm(n),k=kids(n),bare=x==='mo',sub=null,sup=null;
    if(!bare){if(x==='msub'||x==='munder')sub=k[1];else if(x==='msup'||x==='mover')sup=k[1];else{sub=k[1];sup=k[2];}}
    st.good++;
    return el('nary',pr('nary',vv('chr',tx(bare?n:k[0]).trim())+(bare?'':vv('limLoc',/^m(under|over)/.test(x)?'undOvr':'subSup'))+(sub?'':vv('subHide','1'))+(sup?'':vv('supHide','1')))+el('sub',sq(sub))+el('sup',sq(sup))+el('e',body));
  }
  function dEl(b,e,sep,g){
    return el('d',pr('d',vv('begChr',b)+(sep?vv('sepChr',sep):'')+vv('endChr',e))+(g.length?g:['']).map(function(x){return el('e',x);}).join(''));
  }
  function fenced(k){
    var f=isFence(k[0]),l=isFence(k[k.length-1]),inner=k.slice(f?1:0,l?k.length-1:k.length),gs=[[]],seps=[];
    inner.forEach(function(c){if(isFence(c)){seps.push(tx(c).trim());gs.push([]);}else gs[gs.length-1].push(c);});
    if(seps.some(function(s){return s!==seps[0];}))warn('middle','');
    st.good++;
    return dEl(f?tx(k[0]).trim():'',l?tx(k[k.length-1]).trim():'',seps[0],gs.map(function(g){return seq(g);}));
  }
  function aln(c){
    var m='<m:r><m:rPr><m:aln/></m:rPr>'+fontPr(font)+'<m:t></m:t></m:r>';
    if(c.indexOf('<m:r><m:rPr>')===0)return c.replace('</m:rPr>','<m:aln/></m:rPr>');
    if(c.indexOf('<m:r>')===0)return c.replace('<m:r>','<m:r><m:rPr><m:aln/></m:rPr>');
    return m+c;
  }
  function table(n){
    var rows=kids(n).filter(function(r){return /^(mtr|mlabeledtr)$/.test(nm(r));}),
    ca=(at(n,'columnalign')||'').trim().split(/\s+/).filter(Boolean),cells,nc,eq,al,mcs;
    if(!rows.length){warn('unsupported','mtable');st.bad++;return '';}
    cells=rows.map(function(r){var c=kids(r);if(nm(r)==='mlabeledtr'){c=c.slice(1);warn('tag-dropped','');}return c.map(function(d){return seq(kids(d));});});
    nc=Math.max.apply(null,cells.map(function(r){return r.length;}));
    eq=(ca[0]==='right'&&ca[1]==='left')||(nc===1&&rows.length>1&&at(n,'displaystyle')==='true');
    st.good++;
    if(eq)return el('eqArr',pr('eqArr')+cells.map(function(r){return el('e',r.map(function(c,i){return i%2?aln(c):c;}).join(''));}).join(''));
    cells.forEach(function(r){while(r.length<nc)r.push('');});
    al=ca.length&&ca.every(function(c){return c===ca[0];})&&/^(left|right)$/.test(ca[0])?ca[0]:'';
    mcs=al?el('mcs',el('mc',el('mcPr',vv('count',nc)+vv('mcJc',al)))):'';
    return el('m',pr('m',mcs)+cells.map(function(r){return el('mr',r.map(function(c){return el('e',c);}).join(''));}).join(''));
  }
  function over(n,x,k){
    var b=k[0],c=k[1],ch,up=x==='mover';
    if(x==='munderover')return el('limUpp',pr('limUpp')+el('e',el('limLow',pr('limLow')+el('e',sq(b))+el('lim',sq(c))))+el('lim',sq(k[2])));
    if(c&&nm(c)==='mo'){
      ch=tx(c).trim();
      if(ch==='\u203E')return el('bar',pr('bar',vv('pos',up?'top':'bot'))+el('e',sq(b)));
      if(ch===(up?'\u23DE':'\u23DF'))return el('groupChr',pr('groupChr',vv('chr',ch)+vv('pos',up?'top':'bot')+vv('vertJc',up?'bot':'top'))+el('e',sq(b)));
      if(up&&(at(n,'accent')==='true'||(gv(ACC,ch)&&/^m[in]$/.test(nm(b)))))return el('acc',pr('acc',vv('chr',gv(ACC,ch)||ch))+el('e',sq(b)));
    }
    return up?el('limUpp',pr('limUpp')+el('e',sq(b))+el('lim',sq(c))):el('limLow',pr('limLow')+el('e',sq(b))+el('lim',sq(c)));
  }
  function cv(n){
    var x=nm(n),k=kids(n),t,a,h;
    switch(x){
    case 'math':case 'mstyle':case 'mpadded':case 'mtd':return seq(k);
    case 'semantics':return k.length?seq([k[0]]):'';
    case 'annotation':case 'annotation-xml':case 'mprescripts':case 'none':return '';
    case 'mrow':return k.length>1&&(isFence(k[0])||isFence(k[k.length-1]))?fenced(k):seq(k);
    case 'mi':t=tx(n).trim();st.good++;return t?run(t,rprOf(at(n,'mathvariant'),t.length>1)):'';
    case 'mn':t=tx(n).trim();st.good++;return t?run(t,rprOf(at(n,'mathvariant'))):'';
    case 'mo':t=tx(n).trim();st.good++;return t?run(t,/^[A-Za-z]{2,}$/.test(t)?rprOf('',true):''):'';
    case 'mtext':case 'ms':t=tx(n);st.good++;return t?run(t,'<m:nor/>'):'';
    case 'mspace':st.good++;return spc(n);
    case 'mfrac':
      st.good++;t=at(n,'linethickness');a=t!==null&&parseFloat(t)===0?'noBar':at(n,'bevelled')==='true'?'skw':'';
      return el('f',pr('f',a?vv('type',a):'')+el('num',sq(k[0]))+el('den',sq(k[1])));
    case 'msqrt':st.good++;return el('rad',pr('rad',vv('degHide','1'))+el('deg')+el('e',seq(k)));
    case 'mroot':st.good++;return el('rad',pr('rad')+el('deg',sq(k[1]))+el('e',sq(k[0])));
    case 'msub':
      st.good++;h=k[0]&&head(k[0]);
      if(h&&/^m[io]$/.test(nm(h))&&LIMFN.test(tx(h).trim()))return el('limLow',pr('limLow')+el('e',sq(k[0]))+el('lim',sq(k[1])));
      return el('sSub',pr('sSub')+el('e',sq(k[0]))+el('sub',sq(k[1])));
    case 'msup':st.good++;return el('sSup',pr('sSup')+el('e',sq(k[0]))+el('sup',sq(k[1])));
    case 'msubsup':st.good++;return el('sSubSup',pr('sSubSup')+el('e',sq(k[0]))+el('sub',sq(k[1]))+el('sup',sq(k[2])));
    case 'munder':case 'mover':case 'munderover':st.good++;return over(n,x,k);
    case 'mtable':return table(n);
    case 'mfenced':
      st.good++;a=(at(n,'separators')||',').replace(/\s/g,'');
      return dEl(at(n,'open')===null?'(':at(n,'open'),at(n,'close')===null?')':at(n,'close'),k.length>1?a.charAt(0):'',k.map(function(c){return sq(c);}));
    case 'mphantom':st.good++;return el('phant',pr('phant',vv('show','0'))+el('e',seq(k)));
    case 'menclose':
      a=at(n,'notation')||'longdiv';
      if(/^(box|roundedbox)$/.test(a)){st.good++;return el('borderBox',pr('borderBox')+el('e',seq(k)));}
      warn('unsupported','menclose:'+a);st.bad++;return seq(k);
    case 'merror':warn('error',tx(n).slice(0,80));st.bad++;t=tx(n).trim();return t?run(t):'';
    default:warn('unsupported',x);st.bad++;t=tx(n).trim();return t?run(t):'';
    }
  }
  return {xml:cv(root),good:st.good,bad:st.bad};
}

function parse(s){
  var P=new DOMParser(),r=P.parseFromString(s,'text/html').querySelector('math');
  return r||P.parseFromString('<math>'+s+'</math>','text/html').querySelector('math');
}
function wrap(inner,disp,ns){
  var d=ns===false?'':' xmlns:m="'+NSM+'" xmlns:w="'+NSW+'"';
  return disp?'<m:oMathPara'+d+'><m:oMath>'+inner+'</m:oMath></m:oMathPara>':'<m:oMath'+d+'>'+inner+'</m:oMath>';
}

/** MathML string → {xml,ok,warnings}. Sync. opts: {display,fontName,ns,source} */
function fromMathML(ml,opts){
  opts=opts||{};
  var W={list:[],seen:{}},font=opts.fontName||'Cambria Math',r=null,c=null,inner='',ok=false;
  try{
    r=parse(String(ml));
    if(r){c=convert(r,font,W);inner=c.xml;ok=!(c.bad&&!c.good)&&!!inner;}
  }catch(e){W.list.push({code:'error',arg:String(e&&e.message||e).slice(0,80),level:'warn'});}
  if(!r&&!W.list.length)W.list.push({code:'syntax',arg:'mathml',level:'warn'});
  if(!ok&&opts.source)inner=rRun(opts.source,font);
  return {xml:wrap(inner,!!opts.display,opts.ns),ok:ok,warnings:W.list};
}

function stripDelim(s){
  var d,m;
  try{
    if(T.has('math.detect')){d=T.get('math.detect').parse(s);if(d&&typeof d.tex==='string')return {tex:d.tex.trim(),display:!!d.display};}
  }catch(e){}
  m=/^\s*(?:\$\$([\s\S]*)\$\$|\\\[([\s\S]*)\\\]|\\\(([\s\S]*)\\\)|\$([\s\S]*)\$)\s*$/.exec(s);
  return m?{tex:(m[1]||m[2]||m[3]||m[4]||'').trim(),display:m[1]!==undefined||m[2]!==undefined}:{tex:s.trim(),display:false};
}
function fbText(s,tex,opts){
  try{
    var L=T.has('math.linear')&&T.get('math.linear'),r=L&&typeof L.convert==='function'&&L.convert(s,opts.linear);
    if(r&&typeof r.out==='string')return r.out;
  }catch(e){}
  return tex;
}

/** LaTeX → Promise<{xml,ok,warnings,fallbackText}>. opts: {display,fontName,ns,linear,toMathML} (toMathML = test/override hook) */
function fromLatex(src,opts){
  opts=opts||{};
  var s=src==null?'':String(src),p=stripDelim(s),disp=opts.display===undefined?p.display:!!opts.display,
  lx=T.has('math.latex')?T.get('math.latex'):null,
  fn=opts.toMathML||(lx&&typeof lx.toMathML==='function'?lx.toMathML.bind(lx):null);
  function fin(r){r.fallbackText=fbText(s,p.tex,opts);return r;}
  function fail(code,arg){
    return fin({xml:wrap(rRun(p.tex,opts.fontName||'Cambria Math'),disp,opts.ns),ok:false,warnings:[{code:code,arg:arg||'',level:'warn'}]});
  }
  if(!fn||typeof DOMParser==='undefined')return Promise.resolve(fail('unknown','math.latex.toMathML'));
  return new Promise(function(res){res(fn(p.tex));}).then(function(r){
    if(!r||!r.ok||!r.mathml)return fail('error',r&&r.error?String(r.error).slice(0,120):'toMathML');
    return fin(fromMathML(r.mathml,{display:disp,fontName:opts.fontName,ns:opts.ns,source:p.tex}));
  },function(e){return fail('error',String(e&&e.message||e).slice(0,120));});
}

var ME='r f rad sSub sSup sSubSup nary d m acc bar groupChr func limLow limUpp eqArr phant borderBox',K={};
('oMathPara=oMath;oMath=@;e=@;num=@;den=@;deg=@;sub=@;sup=@;lim=@;fName=@;r=rPr w:rPr t;rPr=nor scr sty aln;f=fPr num den;fPr=type ctrlPr;'+
'rad=radPr deg e;radPr=degHide ctrlPr;sSub=sSubPr e sub;sSup=sSupPr e sup;sSubSup=sSubSupPr e sub sup;sSubPr=ctrlPr;sSupPr=ctrlPr;sSubSupPr=ctrlPr;'+
'nary=naryPr sub sup e;naryPr=chr limLoc subHide supHide ctrlPr;d=dPr e;dPr=begChr sepChr endChr ctrlPr;m=mPr mr;mPr=mcs ctrlPr;mcs=mc;mc=mcPr;mcPr=count mcJc;mr=e;'+
'acc=accPr e;accPr=chr ctrlPr;bar=barPr e;barPr=pos ctrlPr;groupChr=groupChrPr e;groupChrPr=chr pos vertJc ctrlPr;func=funcPr fName e;funcPr=ctrlPr;'+
'limLow=limLowPr e lim;limLowPr=ctrlPr;limUpp=limUppPr e lim;limUppPr=ctrlPr;eqArr=eqArrPr e;eqArrPr=ctrlPr;phant=phantPr e;phantPr=show ctrlPr;'+
'borderBox=borderBoxPr e;borderBoxPr=ctrlPr;ctrlPr=w:rPr;w:rPr=w:rFonts').split(';').forEach(function(p){
  var q=p.split('=');K[q[0]]=q[1]==='@'?ME.split(' '):q[1].split(' ');
});
't chr type begChr endChr sepChr degHide subHide supHide limLoc count mcJc pos vertJc show nor scr sty aln w:rFonts'.split(' ').forEach(function(n){K[n]=[];});

/** Structural check of an OMML string: tokenised, balanced, escaped, only known OMML elements in allowed parents, text only in m:t. → {ok,error?} */
function validate(xml){
  var s=String(xml),pos=0,st=[],roots=0,m,n,p,j,t,
  tag=/<(\/?)([\w:.-]+)((?:\s+[\w:.-]+="[^"<]*")*)\s*(\/?)>/g,ent=/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/;
  function bad(e){return {ok:false,error:e+' (pos '+pos+')'};}
  while(pos<s.length){
    if(s.charAt(pos)!=='<'){
      j=s.indexOf('<',pos);if(j<0)j=s.length;t=s.slice(pos,j);
      if(ent.test(t)||t.indexOf('>')>=0)return bad('unescaped text');
      if(!st.length||st[st.length-1]!=='t')return bad('text outside m:t');
      pos=j;continue;
    }
    tag.lastIndex=pos;m=tag.exec(s);
    if(!m||m.index!==pos)return bad('malformed tag');
    if(ent.test(m[3]))return bad('unescaped attribute');
    n=m[2];
    if(!/^(m|w):[\w.-]+$/.test(n))return bad('bad name '+n);
    n=n.replace(/^m:/,'');
    if(!Object.prototype.hasOwnProperty.call(K,n))return bad('unknown element '+n);
    if(m[1]){if(st.pop()!==n)return bad('unbalanced </'+n+'>');}
    else{
      p=st[st.length-1];
      if(p===undefined){if(roots++||(n!=='oMath'&&n!=='oMathPara'))return bad('bad root '+n);}
      else if(K[p].indexOf(n)<0)return bad('<'+n+'> not allowed in <'+p+'>');
      if(!m[4])st.push(n);
    }
    pos=tag.lastIndex;
  }
  return st.length?bad('unclosed <'+st[st.length-1]+'>'):roots===1?{ok:true}:bad('no root');
}

function isAvailable(){
  try{var l=T.has('math.latex')&&T.get('math.latex');return !!(l&&typeof l.toMathML==='function')&&typeof DOMParser!=='undefined';}catch(e){return false;}
}

T.register('export.omml',{fromLatex:fromLatex,fromMathML:fromMathML,validate:validate,isAvailable:isAvailable});
})(window.Taraz=window.Taraz||{});