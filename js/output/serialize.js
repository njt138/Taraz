/* Tarāz — serializers: toHTML(preview|word|ppt|page), toPlain, toMarkdown */
(function(T){
var RLM='\u200F',CREDIT='Built by Gholamreza Nejati Jahromi',MR=null;
var BAD=/[\u202A-\u202E\u2066-\u2069\u200B\uFEFF]/g,RTLCH=/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
var EM={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
var OPTS=[
{id:'ptStrategy',group:'output',label:'ptStrategy',help:'',type:'select',options:[{v:'rlm',label:'RLM only'},{v:'none',label:'None'},{v:'lre',label:'LRE/PDF'},{v:'isolates',label:'Isolates'}],def:'rlm',level:'basic',affects:'output'},
{id:'outJustify',group:'output',label:'outJustify',help:'',type:'switch',def:false,level:'pro',affects:'output'},
{id:'outListNum',group:'output',label:'outListNum',help:'',type:'segmented',options:[{v:'native',label:'Native'},{v:'text',label:'As text'}],def:'native',level:'pro',affects:'output'}];
if(T.defineOptions)T.defineOptions(OPTS);
function get(n){return T.has&&T.has(n)?T.get(n):null}
function clean(s){return String(s==null?'':s).replace(BAD,'')}
function esc(s){return clean(s).replace(/[&<>"']/g,function(c){return EM[c]})}
function href(u){u=String(u||'').trim();return/^https?:\/\/[^\s<>"'\u0000-\u001f]+$/i.test(u)?u:''}
function pt(n){return Math.round(n*2)/2}
function q(n){return"'"+n+"'"}
function lat(m){return String(m==null?'':m).replace(/[\u06F0-\u06F9\u0660-\u0669]/g,function(c){var n=c.charCodeAt(0);return n-(n>=0x6F0?0x6F0:0x660)})}
function cfg(s){var o={},F=get('fonts'),t=typeof T.options==='function'?T.options():null;
 OPTS.forEach(function(x){o[x.id]=x.def});if(F&&F.defaults)Object.assign(o,F.defaults);
 if(Array.isArray(t))t.forEach(function(x){if(x&&x.id&&x.def!==undefined)o[x.id]=x.def});else if(t&&typeof t==='object')Object.assign(o,t);
 return Object.assign(o,s||{})}
function FX(S){var F=get('fonts');if(F)return F.resolve(S);
 return{fa:'Tahoma',en:'Arial',code:'Consolas',math:'Cambria Math',faSize:12,enSize:12,codeSize:12,mathSize:12,faStack:"'Tahoma','Arial',sans-serif",enStack:"'Arial',sans-serif",codeStack:"'Consolas',monospace",mathStack:"'Cambria Math',serif"}}
function ltrSt(k,kind,sc,x){var f=k.f,fam=kind==='code'?f.codeStack:kind==='math'?f.mathStack:f.enStack,nm=kind==='code'?f.code:kind==='math'?f.math:f.en,sz=kind==='code'?f.codeSize:f.enSize;
 var s='direction:ltr;unicode-bidi:embed;font-family:'+fam+';';
 if(k.mso)s+='mso-ascii-font-family:'+q(nm)+';mso-hansi-font-family:'+q(nm)+';';
 if(k.size){var p=pt(sz*sc);s+='font-size:'+p+'pt;'+(k.mso?'mso-bidi-font-size:'+p+'pt;':'')}
 return s+(x||'')}
function pst(k,d,sc,x,noj){var f=k.f,r=d==='rtl',j=k.S.outJustify&&!noj,s='direction:'+d+';unicode-bidi:embed;text-align:'+(j?'justify':r?'right':'left')+';font-family:'+(r?f.faStack:f.enStack)+';';
 if(k.mso)s+='mso-ascii-font-family:'+q(f.en)+';mso-hansi-font-family:'+q(f.en)+';mso-bidi-font-family:'+q(f.fa)+';';
 if(k.size){var p=pt((r?f.faSize:f.enSize)*sc);s+='font-size:'+p+'pt;'+(k.mso?'mso-bidi-font-size:'+p+'pt;':'')}
 return s+(x||'')}
function rtlSpan(k,t,sc){var f=k.f,s='direction:rtl;unicode-bidi:embed;font-family:'+f.faStack+';';
 if(k.mso)s+='mso-bidi-font-family:'+q(f.fa)+';';if(k.size)s+='font-size:'+pt(f.faSize*sc)+'pt;';
 return'<span dir="rtl" lang="fa-IR" style="'+s+'">'+t+'</span>'}
function mathText(x){
 if(!x)return'';
 var L=get('math.linear'),t=null;
 try{t=L&&typeof L.text==='function'?L.text(x):null}catch(e){t=null}
 if(typeof t==='string')return t;
 var fx=x.meta&&x.meta.fx;
 if(fx&&fx.mode==='A'&&fx.out!=null)return fx.out;
 return x.s!=null?x.s:'';
}
function piece(k,x,bd,sc){var t=esc(x.s).replace(/\n/g,'<br>'),m,h,a;
 var L=function(kind,c){return'<span dir="ltr" lang="en-US" style="'+ltrSt(k,kind,sc)+'">'+c+'</span>'};
 switch(x.k){
 case'ltr':return L('en',t);
 case'code':return L('code',t);
 case'num':return t;
 case'math':
  if(k.target==='preview'){
    var fx=x.meta&&x.meta.fx,tx=(fx&&(fx.out||x.meta.tex))||x.meta.tex||x.s,raw=x.s,ln=(fx&&fx.lin&&fx.lin.out)||'';
    return'<span class="tz-math tz-math-inline" dir="ltr" data-tex="'+esc(tx)+'" data-src="'+esc(raw)+'" data-lin="'+esc(ln)+'" style="unicode-bidi:isolate;"><code class="tz-mono">'+esc(mathText(x))+'</code></span>';
  }
  try{m=MR&&MR(x,false,k.target)}catch(e){m=null}
  if(m)return m;
  return'<span class="tz-math tz-math-inline" dir="ltr" lang="en-US" style="unicode-bidi:isolate;'+ltrSt(k,'math',sc)+'">'+esc(mathText(x))+'</span>';
 case'link':h=href(x.href);a=h?'<a href="'+esc(h)+'">'+t+'</a>':t;return x.dir==='ltr'?L('en',a):a;
 default:if(x.k==='text'&&x.dir==='ltr'&&bd==='rtl')return L('en',t);
  return bd==='ltr'&&RTLCH.test(x.s)?rtlSpan(k,t,sc):t}}
function rin(k,l,bd,sc){var o='',b=0,i=0;
 (l||[]).forEach(function(x){if(!x)return;var m=x.meta;
  if(m&&m.marker&&(x.k==='b'||x.k==='i')){if(x.k==='b')b=m.on?1:0;else i=m.on?1:0;return}
  var h=piece(k,x,bd,sc);if(b||x.k==='b')h='<b>'+h+'</b>';if(i||x.k==='i')h='<i>'+h+'</i>';o+=h});
 return o}
function atr(d){return' dir="'+d+'" lang="'+(d==='rtl'?'fa-IR':'en-US')+'"'}
function rtable(k,b,d){var rows=b.rows||[],h='<table'+atr(d)+' border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;direction:'+d+';border:1px solid #999;margin:0 0 8pt;">';
 rows.forEach(function(r,ri){var hd=ri===0&&rows.length>1,tg=hd?'th':'td';h+='<tr>';
  (r||[]).forEach(function(c){h+='<'+tg+atr(d)+' style="'+pst(k,d,1,'border:1px solid #999;padding:3pt 5pt;vertical-align:top;'+(hd?'background:#f0f0f0;font-weight:bold;':''),1)+'">'+rin(k,c,d,1)+'</'+tg+'>'});h+='</tr>'});
 return h+'</table>'}
function rblock(k,b){var d=b.dir==='ltr'?'ltr':'rtl',at=atr(d),l=b.inlines||[],mg=k.target==='ppt'?'margin:0;':'margin:0 0 8pt;',n,sc,x,m;
 switch(b.type){
 case'h':n=Math.min(6,Math.max(1,b.level|0||1));sc=[1.6,1.4,1.2,1.1,1,1][n-1];
  if(k.target==='ppt')return'<p'+at+' style="'+pst(k,d,1,'font-weight:bold;margin:0;',1)+'">'+rin(k,l,d,1)+'</p>';
  return'<h'+n+at+' style="'+pst(k,d,sc,'font-weight:bold;margin:12pt 0 6pt;',1)+'">'+rin(k,l,d,sc)+'</h'+n+'>';
 case'quote':return'<blockquote'+at+' style="'+pst(k,d,1,'margin:6pt 0;padding:0 10pt;border-'+(d==='rtl'?'right':'left')+':3px solid #999;color:#444;')+'">'+rin(k,l,d,1)+'</blockquote>';
 case'code':return'<pre dir="ltr" lang="en-US" style="'+ltrSt(k,'code',1,'text-align:left;white-space:pre-wrap;background:#f4f4f4;padding:6pt;'+mg)+'">'+esc(l[0]?l[0].s:'')+'</pre>';
 case'math':x=l[0];
  if(k.target==='preview'){
    var fx=x&&x.meta&&x.meta.fx,tx=(fx&&(fx.out||x.meta.tex))||(x&&x.meta&&x.meta.tex)||(x?x.s:''),raw=x?x.s:'',ln=(fx&&fx.lin&&fx.lin.out)||'';
    return'<div class="tz-math tz-math-block" dir="ltr" data-tex="'+esc(tx)+'" data-src="'+esc(raw)+'" data-lin="'+esc(ln)+'" data-display="1" style="text-align:center;margin:12pt 0;"><code class="tz-mono">'+esc(mathText(x))+'</code></div>';
  }
  try{m=x&&MR&&MR(x,true,k.target)}catch(e){m=null}
  if(m)return m;
  return'<div class="tz-math tz-math-block" dir="ltr" lang="en-US" style="text-align:center;'+ltrSt(k,'math',1,'text-align:center;'+mg)+'">'+esc(mathText(x))+'</div>';
 case'table':return rtable(k,b,d);
 default:return'<p'+at+' style="'+pst(k,d,1,mg)+'">'+rin(k,l,d,1)+'</p>'}}
function rlist(k,items){var base=items[0].level|0,st=[],h='';
 items.forEach(function(b){var d=b.dir==='ltr'?'ltr':'rtl',at=atr(d),dp=Math.max(0,(b.level|0)-base),o=!!b.ordered,nat=o&&k.S.outListNum!=='text',tg=nat?'ol':'ul',pre='',sn;
  dp=Math.min(dp,st.length);
  if(dp<st.length){while(st.length>dp+1)h+='</li></'+st.pop()+'>';h+='</li>';if(st[dp]!==tg)h+='</'+st.pop()+'>'}
  if(dp===st.length){sn=nat?(parseInt(lat(b.marker),10)||0):0;
   h+='<'+tg+at+(sn>1?' start="'+sn+'"':'')+' style="margin-top:0;margin-bottom:'+(k.target==='ppt'?'0':'6pt')+';'+(o&&!nat?'list-style-type:none;':'')+'">';st.push(tg)}
  if(o&&!nat)pre=esc(b.marker||'')+' ';
  if(b.task)pre+=b.checked?'\u2611 ':'\u2610 ';
  h+='<li'+at+' style="'+pst(k,d,1,'',1)+'">'+pre+rin(k,b.inlines,d,1)});
 while(st.length)h+='</li></'+st.pop()+'>';
 return h}
function render(result,S,target){var k={S:S,f:FX(S),target:target,mso:target==='word',size:target!=='ppt'},bl=(result&&result.blocks)||[],out=[],i=0,j;
 while(i<bl.length){if(!bl[i]){i++;continue}
  if(bl[i].type==='li'){j=i;while(j<bl.length&&bl[j]&&bl[j].type==='li')j++;out.push(rlist(k,bl.slice(i,j)));i=j}
  else{out.push(rblock(k,bl[i]));i++}}
 return out.join('\n')}
function page(body,S){var f=FX(S);
 return'<!doctype html>\n<html lang="fa" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="author" content="Gholamreza Nejati Jahromi">\n<meta name="generator" content="Tar\u0101z">\n<title>Tar\u0101z</title>\n<style>body{max-width:46rem;margin:2rem auto;padding:0 1rem;font-family:'+f.faStack+';font-size:'+pt(f.faSize)+'pt;line-height:1.8}footer{margin-top:3rem;border-top:1px solid #ccc;padding-top:.75rem;font:13px Arial,sans-serif;color:#555;text-align:left}pre{overflow:auto}table{border-collapse:collapse}</style>\n</head>\n<body>\n'+body+'\n<footer dir="ltr" lang="en">'+CREDIT+'</footer>\n</body>\n</html>'}
/** target: 'preview'|'word'|'ppt'|'page' -> HTML string (fragment, except 'page') */
function toHTML(result,settings,target){
 try{if(['preview','word','ppt','page'].indexOf(target)<0)target='preview';
  var S=cfg(settings),body=render(result,S,target);
  if(target==='preview')return'<div class="tz-out" dir="rtl" lang="fa-IR">'+body+'</div>';
  return target==='page'?page(body,S):body}catch(e){return''}}
function pin(l,st,bd){var a=(l||[]).filter(function(x){return x&&!(x.meta&&x.meta.marker)}),last=a.length-1,o='';
 a.forEach(function(x,i){var t=clean(x.k==='math'?mathText(x):x.s),h;
  if(x.k==='link'){h=href(x.href);if(h&&h!==x.s)t+=' ('+h+')'}
  if(bd==='rtl'&&(x.k==='ltr'||x.k==='code'||x.k==='math'||(x.k==='link'&&x.dir==='ltr'))){
   if(st==='lre')t='\u202A'+t+'\u202C';else if(st==='isolates')t='\u2066'+t+'\u2069';else if(st==='rlm'&&i<last)t+=RLM}
  o+=t});
 return o}
function wrap(s,d,st){if(d!=='rtl'||st==='none')return s;
 var p=st==='rlm'?RLM:st==='lre'?'\u202B':'\u2067',e=st==='rlm'?'':st==='lre'?'\u202C':'\u2069';
 return s.split('\n').map(function(l){return l?p+l+e:l}).join('\n')}
/** strategy (ptStrategy): none | rlm (default) | lre | isolates */
function toPlain(result,settings){
 try{var S=cfg(settings),st=/^(none|rlm|lre|isolates)$/.test(S.ptStrategy)?S.ptStrategy:'rlm',out='',pl=false,base=0;
  ((result&&result.blocks)||[]).forEach(function(b){if(!b)return;var d=b.dir==='ltr'?'ltr':'rtl',li=b.type==='li',s;
   if(li){if(!pl)base=b.level|0;s='  '.repeat(Math.max(0,(b.level|0)-base))+(b.ordered?(b.marker||'1.'):'\u2022')+' '+(b.task?(b.checked?'[x] ':'[ ] '):'')+pin(b.inlines,st,d)}
   else if(b.type==='table')s=(b.rows||[]).map(function(r){return(r||[]).map(function(c){return pin(c,st,d).replace(/\s*\n\s*/g,' ')}).join('\t')}).join('\n');
   else if(b.type==='code')s=clean((b.inlines&&b.inlines[0]||{}).s);
   else if(b.type==='math')s=clean(mathText(b.inlines&&b.inlines[0]));
   else s=pin(b.inlines,st,d);
   if(out)out+=(li&&pl)?'\n':'\n\n';out+=wrap(s,d,st);pl=li});
  return out}catch(e){return''}}
function mdi(l){return(l||[]).map(function(x){if(!x)return'';var s=clean(x.s),m,t,h;
 if(x.meta&&x.meta.marker)return s;
 if(x.k==='math')return clean(mathText(x));
 if(x.k==='code'){m=(s.match(/`+/g)||[]).reduce(function(a,c){return Math.max(a,c.length)},0);t='`'.repeat(m+1);return t+(m?' '+s+' ':s)+t}
 if(x.k==='link'){h=href(x.href);return h&&h!==s?'['+s+']('+h+')':s}
 return s}).join('')}
function toMarkdown(result,settings){
 try{var o='',pl=false,base=0;
  ((result&&result.blocks)||[]).forEach(function(b){if(!b)return;var s,li=b.type==='li',l=b.inlines,rows,nc;
   switch(b.type){
   case'h':s='#'.repeat(Math.min(6,Math.max(1,b.level|0||1)))+' '+mdi(l);break;
   case'quote':s=mdi(l).split('\n').map(function(x){return'> '+x}).join('\n');break;
   case'li':if(!pl)base=b.level|0;s='  '.repeat(Math.max(0,(b.level|0)-base))+(b.ordered?lat(b.marker||'1.'):'-')+' '+(b.task?(b.checked?'[x] ':'[ ] '):'')+mdi(l);break;
   case'code':s='```'+(b.lang||'')+'\n'+clean(l&&l[0]?l[0].s:'')+'\n```';break;
   case'math':s=clean(mathText(l&&l[0]));break;
   case'table':rows=(b.rows||[]).map(function(r){return'| '+(r||[]).map(function(c){return mdi(c).replace(/\|/g,'\\|').replace(/\n/g,' ')}).join(' | ')+' |'});
    nc=((b.rows&&b.rows[0])||[]).length||1;if(rows.length)rows.splice(1,0,'|'+' --- |'.repeat(nc));s=rows.join('\n');break;
   default:s=mdi(l)}
   if(o)o+=(li&&pl)?'\n':'\n\n';o+=s;pl=li});
  return o}catch(e){return''}}
T.register('serialize',{toHTML:toHTML,toPlain:toPlain,toMarkdown:toMarkdown,esc:esc,safeHref:href,setMathRenderer:function(fn){MR=typeof fn==='function'?fn:null}});
})(window.Taraz=window.Taraz||{});