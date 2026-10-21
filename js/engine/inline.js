// Tarāz engine/inline: protector registry + block text -> Inline[] (protected spans, LTR runs, b/i markers). No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),C=T.C,LV={conservative:0,balanced:1,aggressive:2},reg=[];
var NOAR='\\u0590-\\u08FF\\u200B-\\u200F\\u202A-\\u202E\\u2066-\\u2069\\uFB1D-\\uFDFF\\uFE70-\\uFEFF\\u00AB\\u00BB',
 NA='[^\\s<>"\'`'+NOAR+']',PC='[^\\s\\\\\\/:*?"<>|'+NOAR+']',
 LET=C.LATIN_LETTER+'\\u0370-\\u03FF\\u00B5\\u2126',WCL=LET+'0-9\\u2070-\\u209F\\u00B2\\u00B3\\u00B9',
 RW=new RegExp('['+WCL+']'),RL=new RegExp('['+LET+']'),RD=/[0-9]/,RTL=C.RE.rtl,
 FS=new RegExp('(['+C.RTL_LETTER+C.HEBREW+'])|(['+LET+'])'),
 WD=new RegExp('['+LET+'0-9'+C.RTL_LETTER+C.DIGIT_FA+']'),
 CONN=/[._\-\/'\u2019:&@#~]/,SUF=/[%\u00B0\u2032\u2033\u2030]/,SP=/[ \u00A0]/,
 OP=/[=+*\/^<>\u2248\u2260\u2264\u2265\u00B1\u00D7\u00F7\u2192\u2208|&\u00B7\u2212\-]/,
 PNUM=/^[0-9]+(?:[.,:\/\-][0-9]+)*[%\u00B0]?$/,
 NUMFA=/[\u06F0-\u06F9\u0660-\u0669]+(?:[.,\u066B\u066C\/:][\u06F0-\u06F9\u0660-\u0669]+)*[%\u066A]?/g;

/** First-strong direction of a string: 'rtl' | 'ltr' | 'neutral'. */
E.dirOfText=function(s){var m=FS.exec(s||'');return m?(m[1]?'rtl':'ltr'):'neutral';};
/** Register a protected-span pattern: {id,order,re,kind:'ltr'|'code'|'math'|'link',min?,test?(m,text,idx),trim?(s),build?(m,s)->Inline fields}. */
E.addProtector=function(p){
 if(!p||!p.id||!(p.re instanceof RegExp)){console.warn('[Taraz] bad protector',p);return false;}
 E.removeProtector(p.id);
 reg.push(Object.assign({order:100,kind:'ltr',min:'conservative'},p));
 reg.sort(function(a,b){return a.order-b.order;});return true;
};
E.removeProtector=function(id){for(var i=0;i<reg.length;i++)if(reg[i].id===id){reg.splice(i,1);return true;}return false;};
E.protectors=function(){return reg.slice();};

function tail(s){
 var p,c,o;
 do{p=s;s=s.replace(/[.,;:!?]+$/,'');c=s.slice(-1);o={')':'(',']':'[','}':'{'}[c];
  if(o&&s.split(c).length>s.split(o).length)s=s.slice(0,-1);}while(s!==p);
 return s;
}
function rx(s,f){return new RegExp(s,f);}
[
 {id:'code',order:10,kind:'code',re:/(`+)(?!`)([\s\S]*?[^`])\1(?!`)/,build:function(m){return {s:m[2],meta:{raw:m[0],ticks:m[1]}};}},
 {id:'math',order:20,kind:'math',re:/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/,
  build:function(m){var r=m[0],d=r.slice(0,2);return {meta:{tex:r.slice(2,-2).trim(),display:d==='$$'||d==='\\['}};}},
 {id:'math1',order:22,kind:'math',re:/\$(?!\s)([^$\n]*?[^\s$\\])\$(?![\d$])/,
  test:function(m,t,a){var x=m[1];
   if(a>0&&/[\w$]/.test(t.charAt(a-1)))return false;
   if(/^\d/.test(x)&&/[A-Za-z]{2,}/.test(x.replace(/\\[A-Za-z]+/g,''))&&!/[\\^_{}=<>+*\/]/.test(x))return false;
   return !(/[\u0590-\u08FF]/.test(x)&&x.indexOf('\\')<0);},
  build:function(m){return {meta:{tex:m[1],display:false}};}},
 {id:'mdlink',order:30,kind:'link',re:/\[([^\]\n]+)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/,
  build:function(m){var o={s:m[1],meta:{raw:m[0],url:m[2]}};if(/^https?:\/\//i.test(m[2]))o.href=m[2];return o;}},
 {id:'url',order:40,kind:'link',re:rx('\\b(?:https?:\\/\\/|www\\.)'+NA+'+','i'),trim:tail,
  build:function(m,s){return {href:/^www\./i.test(s)?'https://'+s:s};}},
 {id:'email',order:50,re:rx('(?<![\\w.%+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+\\b')},
 {id:'winpath',order:60,re:rx('\\b[A-Za-z]:\\\\(?:'+PC+'+\\\\?)*|\\\\\\\\[\\w.$-]+(?:\\\\'+PC+'+)+'),trim:tail},
 {id:'unixpath',order:65,re:rx('(?<=^|[\\s("\'\\[\\u00AB\\u060C\\u061B])(?:~|\\.{1,2})?\\/(?:[\\w.@~+%-]+\\/?)+'),trim:tail,
  test:function(m){var s=m[0];return s.length>2&&(/[A-Za-z]/.test(s)||s.split('/').length>2);}},
 {id:'doi',order:70,min:'balanced',re:rx('\\b(?:doi:\\s?)?10\\.\\d{4,9}\\/'+NA+'+','i'),trim:tail},
 {id:'std',order:80,min:'balanced',trim:function(s){return s.replace(/[.\-:]+$/,'');},
  re:rx('\\b(?:IEEE|IEC|ISO|ANSI|ASTM|DIN|EN|BS|NERC|NFPA|CISPR|UL|CIGRE)(?:\\/(?:IEC|IEEE|ISO|ANSI|EN))*(?:[\\s\\u00A0]+(?:Std|Standard|TR|TS|TB|No)\\.?)?[\\s\\u00A0]+[A-Z]{0,2}\\d[\\w.\\-:]*')},
 {id:'ver',order:90,min:'balanced',re:/\b[vV]\d+(?:\.\d+){1,3}(?:[-+][0-9A-Za-z.]+)?\b/},
 {id:'cite',order:100,min:'balanced',re:/\[\d+(?:\s*[,\u2013\u2014\-]\s*\d+)*\](?!\()/},
 {id:'ident',order:110,min:'aggressive',re:/\b[A-Za-z][A-Za-z0-9]*(?:[_.][A-Za-z0-9]+)+\b|\b[a-z]+(?:[A-Z][a-z0-9]*)+\b/}
].forEach(function(p){E.addProtector(p);});

function mkInl(p,m,s){
 var o=Object.assign({id:T.uid('i'),k:p.kind,s:s,protected:true,rule:p.id},p.build?p.build(m,s):null);
 o.dir=o.k==='link'?E.dirOfText(o.s):'ltr';return o;
}
function protect(text,level){
 var mask=new Uint8Array(text.length),spans=[],lv=LV[level]==null?1:LV[level];
 reg.forEach(function(p){
  if(LV[p.min||'conservative']>lv)return;
  var re=new RegExp(p.re.source,p.re.flags.replace(/[gy]/g,'')+'g'),m,s,a,b,k,ok;
  while((m=re.exec(text))){
   s=m[0];if(!s){re.lastIndex++;continue;}
   if(p.trim){s=p.trim(s);if(!s)continue;}
   a=m.index;b=a+s.length;
   if(p.test&&!p.test(m,text,a))continue;
   for(ok=true,k=a;k<b;k++)if(mask[k]){ok=false;break;}
   if(!ok)continue;
   mask.fill(1,a,b);spans.push({a:a,b:b,inl:mkInl(p,m,s)});re.lastIndex=b;
  }
 });
 return {mask:mask,spans:spans};
}
// Paired **/__ (bold) and */_ (italic) markers outside protected spans; unpaired or intra-word ones stay literal.
function marks(t,mask){
 var n=t.length,c=[],st={},out=[],i=0,ch,len,pv,nx;
 function mk(x,on){return {a:x.a,b:x.a+x.len,inl:{id:T.uid('i'),k:x.len===2?'b':'i',s:x.ch+(x.len===2?x.ch:''),dir:'neutral',meta:{marker:true,on:on}}};}
 while(i<n){
  ch=t.charAt(i);
  if(mask[i]||(ch!=='*'&&ch!=='_')){i++;continue;}
  for(len=1;t.charAt(i+len)===ch;len++);
  if(len<3&&!mask[i+len-1]){
   pv=i?t.charAt(i-1):' ';nx=t.charAt(i+len)||' ';
   c.push({a:i,len:len,ch:ch,o:!/\s/.test(nx)&&!WD.test(pv),c:!/\s/.test(pv)&&!WD.test(nx)});
  }
  i+=len;
 }
 c.forEach(function(x){
  var k=x.ch+x.len,o;
  if(x.c&&st[k]&&st[k].length){o=st[k].pop();out.push(mk(o,true),mk(x,false));}
  else if(x.o)(st[k]=st[k]||[]).push(x);
 });
 return out;
}
function isW(c){return !!c&&RW.test(c);}
function term(s,i){
 var j=i,c;
 while(j<s.length){
  c=s.charAt(j);
  if(isW(c)||(SUF.test(c)&&j>i)){j++;continue;}
  if(j>i&&((CONN.test(c)&&isW(s.charAt(j+1)))||(c===','&&RD.test(s.charAt(j-1))&&RD.test(s.charAt(j+1))))){j++;continue;}
  break;
 }
 return j;
}
function group(s,i){
 var o=s.charAt(i),x=o==='('?')':']',d=0,k,c;
 for(k=i;k<s.length&&k<i+80;k++){
  c=s.charAt(k);
  if(c==='\n'||c==='\u0000'||RTL.test(c))return -1;
  if(c===o)d++;else if(c===x&&--d===0)return k+1;
 }
 return -1;
}
function unit(s,i){var c=s.charAt(i);return isW(c)?term(s,i):(c==='('||c==='[')?group(s,i):-1;}
function opNext(s,j,sp){
 var q=j+1,c=s.charAt(j),e;
 if(!c||!OP.test(c))return -1;
 if(sp){if(s.charAt(q)!==' ')return -1;q++;}
 if(/[-+\u2212]/.test(s.charAt(q))&&isW(s.charAt(q+1)))q++;
 e=unit(s,q);return e>q?e:-1;
}
// End of the LTR run starting at i: words joined by single spaces, connectors, operators, balanced (…) groups; no trailing punctuation.
function extend(s,i){
 var j=unit(s,i),ls=i,c,q,e;
 if(j<0)return i;
 for(;;){
  c=s.charAt(j);
  if((c==='('||c==='[')&&isW(s.charAt(j-1))&&(e=group(s,j))>0){j=e;continue;}
  if((e=opNext(s,j,false))>0){j=e;continue;}
  if(SP.test(c)&&!SP.test(s.charAt(j+1))){
   q=j+1;
   if(isW(s.charAt(q))){if(!(PNUM.test(s.slice(ls,j))&&RD.test(s.charAt(q)))&&(e=term(s,q))>q){ls=q;j=e;continue;}}
   else if(s.charAt(q)==='('&&(e=group(s,q))>0){j=e;continue;}
   else if((e=opNext(s,q,true))>0){j=e;continue;}
  }
  break;
 }
 return j;
}
function runs(s){
 var out=[],i=0,n=s.length,c,e,t;
 while(i<n){
  c=s.charAt(i);
  if((RL.test(c)||RD.test(c)||((c==='('||c==='[')&&(e=group(s,i))>0&&RL.test(s.slice(i,e))))&&(e=extend(s,i))>i){
   t=s.slice(i,e);out.push([i,e,PNUM.test(t)]);i=e;
  }else i++;
 }
 return out;
}
function txt(s,out){out.push({id:T.uid('i'),k:'text',s:s,dir:RTL.test(s)?'rtl':'neutral'});}
function gap(str,out){
 var x=0,m;NUMFA.lastIndex=0;
 while((m=NUMFA.exec(str))){
  if(m.index>x)txt(str.slice(x,m.index),out);
  out.push({id:T.uid('i'),k:'num',s:m[0],dir:'neutral'});x=m.index+m[0].length;
 }
 if(x<str.length)txt(str.slice(x),out);
}
/** Text -> Inline[]; settings.protection = conservative|balanced|aggressive. Lossless: inlineSource(result) === text. */
E.inline=function(text,S){
 text=String(text);
 var n=text.length,P,mask,atoms,clean='',map=[],i,out=[],pos=0;
 if(!n)return out;
 P=protect(text,(S&&S.protection)||'balanced');mask=P.mask;atoms=P.spans.slice();
 marks(text,mask).forEach(function(m){atoms.push(m);mask.fill(2,m.a,m.b);});
 for(i=0;i<n;i++){
  if(mask[i]===0){clean+=text.charAt(i);map.push(i);}
  else if(mask[i]===1){clean+='\u0000';map.push(-1);}
 }
 runs(clean).forEach(function(r){
  var lo=map[r[0]],hi=map[r[1]-1]+1,x=lo,j,id=T.uid('r');
  for(j=lo;j<=hi;j++)if(j===hi||mask[j]===2){
   if(j>x)atoms.push({a:x,b:j,inl:r[2]?{id:T.uid('i'),k:'num',s:text.slice(x,j),dir:'neutral'}
    :{id:T.uid('i'),k:'ltr',s:text.slice(x,j),dir:'ltr',rule:'run',meta:{run:id}}});
   x=j+1;
  }
 });
 atoms.sort(function(a,b){return a.a-b.a;});
 atoms.forEach(function(a){if(a.a>pos)gap(text.slice(pos,a.a),out);out.push(a.inl);pos=a.b;});
 if(pos<n)gap(text.slice(pos),out);
 return out;
};
/** Fill block.inlines (and table rows) from block.text; code/math blocks become one protected inline. */
E.inlineBlocks=function(blocks,S){
 blocks.forEach(function(b){
  var t=b.text==null?'':b.text;
  if(b.type==='code')b.inlines=[{id:T.uid('i'),k:'code',s:t,dir:'ltr',protected:true,rule:'codeblock'}];
  else if(b.type==='math')b.inlines=[{id:T.uid('i'),k:'math',s:t,dir:'ltr',protected:true,rule:'math',meta:{tex:t.slice(2,-2).trim(),display:true}}];
  else if(b.type==='table'){b.rows=b.rows.map(function(r){return r.map(function(c){return E.inline(c,S);});});b.inlines=[];}
  else b.inlines=E.inline(t,S);
  delete b.text;
 });
 return blocks;
};
/** All Inline[] arrays of a block (table: every cell, then block.inlines). Arrays are live references. */
E.inlineLists=function(b){
 var r=[];
 if(b.rows)b.rows.forEach(function(row){row.forEach(function(c){r.push(c);});});
 if(b.inlines)r.push(b.inlines);
 return r;
};
/** Original logical text of an Inline[] (uses meta.raw for code spans and markdown links). */
E.inlineSource=function(list){return list.map(function(x){return x.meta&&x.meta.raw!=null?x.meta.raw:x.s;}).join('');};
})(window.Taraz=window.Taraz||{});