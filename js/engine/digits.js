// Tarāz engine/digits: per-context digit-script policy, decimal/thousands separators, optional grouping. Code/math never touched.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),C=T.C,
 DG='0-9\\u06F0-\\u06F9\\u0660-\\u0669',SP='.,\\u066B\\u066C\\u060C',KINDS=['keep','fa','lat','ar'],
 MAP={fa:C.toPersianDigits,lat:C.toLatinDigits,ar:C.toArabicDigits},FA={dec:'\u066B',th:'\u066C'},LA={dec:'.',th:','},
 SPL=new RegExp('['+SP+']'),SPG=new RegExp('['+SP+']','g'),THC=/^[,\u066C\u060C]$/,DCC=/^[.\u066B]$/,
 D4='(?<!['+DG+'])['+DG+']{4}[/.\\-]['+DG+']{1,2}[/.\\-]['+DG+']{1,2}(?!['+DG+'])',
 D4b='(?<!['+DG+'])['+DG+']{1,2}[/.\\-]['+DG+']{1,2}[/.\\-]['+DG+']{4}(?!['+DG+'])',
 RE=new RegExp(D4+'|'+D4b+'|['+DG+']+(?:['+SP+']['+DG+']+)*','g'),DT=new RegExp('^(?:'+D4+'|'+D4b+')$'),
 TECH={url:1,email:1,winpath:1,unixpath:1,doi:1,std:1,ver:1,cite:1,ident:1},
 SAMPLE='\u06F1\u06F4\u06F0\u06F4/\u06F0\u06F7/\u06F2\u06F6 \u2014 12345.67 \u2014 3,5 \u2014 1,234,567';

function sel(id,def,lvl,opts){return {id:id,group:'digits',label:'opt.'+id+'.label',help:'opt.'+id+'.help',type:'select',options:opts,def:def,level:lvl,affects:'engine'};}
function kinds(inh){var o=['fa','lat','ar','keep'].map(function(v){return {v:v,label:'opt.dig.'+v};});if(inh)o.unshift({v:'inherit',label:'opt.dig.inherit'});return o;}
var OPTS=[sel('digProse','fa','basic',kinds()),sel('digTech','lat','pro',kinds(1)),sel('digList','keep','pro',kinds(1)),
 sel('digTable','inherit','pro',kinds(1)),sel('digDate','inherit','pro',kinds(1)),sel('digHeading','inherit','pro',kinds(1)),
 sel('digSep','keep','pro',['keep','follow','fa','lat'].map(function(v){return {v:v,label:'opt.digSep.'+v};})),
 {id:'digGroup',group:'digits',label:'opt.digGroup.label',help:'opt.digGroup.help',type:'switch',def:false,level:'pro',affects:'engine'},
 {id:'digGroupMin',group:'digits',label:'opt.digGroupMin.label',help:'opt.digGroupMin.help',type:'slider',min:4,max:9,step:1,def:5,level:'pro',affects:'engine'}],
 DEF={};
OPTS.forEach(function(o){DEF[o.id]=o.def;});
T.defineOptions(OPTS);

function dg(s,k){return MAP[k]?MAP[k](s):s;}
function pick(v,base){return KINDS.indexOf(v)>=0?v:base;}   // 'inherit'/garbage -> base
function plan(S,name){
 var p=pick(S.digProse,'keep'),
  n=name==='heading'?pick(S.digHeading,p):name==='table'?pick(S.digTable,p):name==='list'?pick(S.digList,p):p;
 return {num:name==='tech'?pick(S.digTech,p):n,date:pick(S.digDate,n)};
}
function seps(S,k){var m=S.digSep,fa=k==='fa'||k==='ar';return m==='fa'?FA:m==='lat'?LA:m==='follow'?(fa?FA:k==='lat'?LA:null):null;}
function thou(g){return g.length>1&&g[0].length<=3&&g[0].charAt(0)!=='0'&&g.slice(1).every(function(x){return x.length===3;});}
function chunk(s,th){var r=[],i;for(i=s.length;i>0;i-=3)r.unshift(s.slice(Math.max(0,i-3),i));return r.join(th);}

/* One numeric token: classify (int|dec|th|thdec|unk), convert digits, optionally separators/grouping. */
function num(t,o,pre,post){
 var g=C.toLatinDigits(t).split(SPL),sp=t.match(SPG)||[],n=sp.length,kind='unk',gs,out,i,th;
 if(!n)kind='int';
 else if(n===1)kind=DCC.test(sp[0])?'dec':thou(g)?'th':'dec';
 else if(sp.every(function(c){return THC.test(c);})&&thou(g))kind='th';
 else if(DCC.test(sp[n-1])&&sp.slice(0,n-1).every(function(c){return THC.test(c);})&&thou(g.slice(0,n)))kind='thdec';
 gs=o.num==='keep'?t.split(SPL):g.map(function(x){return dg(x,o.num);});
 th=o.sep?o.sep.th:(o.num==='fa'||o.num==='ar'?FA.th:',');
 if(o.group&&(kind==='int'||kind==='dec')&&g[0].charAt(0)!=='0'&&g[0].length>=o.min&&!/[\-\/:+@#_.,]/.test(pre)&&!/[\-\/:+@#_]/.test(post))gs[0]=chunk(gs[0],th);
 out=gs[0];
 for(i=0;i<n;i++)out+=(o.sep&&kind!=='unk'?(kind==='dec'||(kind==='thdec'&&i===n-1)?o.sep.dec:o.sep.th):sp[i])+gs[i+1];
 return out;
}
function fmt(s,o){
 return s.replace(RE,function(m,off,str){
  return DT.test(m)?dg(m,o.date):num(m,o,str.charAt(off-1),str.charAt(off+m.length));
 });
}
/** conv(s, name, settings?) name: 'prose'|'heading'|'table'|'list'|'tech'. Pure; settings merged over defaults. */
function conv(s,name,S){
 var p;S=Object.assign({},DEF,S);p=plan(S,name);s=String(s);
 if(name==='tech'||name==='list')return dg(s,p.num);
 return fmt(s,{num:p.num,date:p.date,sep:seps(S,p.num),group:!!S.digGroup,min:+S.digGroupMin||5});
}
/** digitsDemo(sample?, settings?, name?) -> string for one context, or {prose,heading,table,list,tech}. Pure (UI mini-demo). */
function digitsDemo(sample,settings,name){
 var r={};sample=sample==null?SAMPLE:String(sample);
 if(name)return conv(sample,name,settings);
 ['prose','heading','table','list','tech'].forEach(function(n){r[n]=conv(sample,n,settings);});
 return r;
}

function tech(ctx,x,bi,S){
 var s2=conv(x.s,'tech',S),m=x.meta;
 if(s2===x.s||!E.tx.set(ctx,x,bi,'digits','tech',s2))return;
 if(typeof x.href==='string')x.href=C.toLatinDigits(x.href);
 if(m)['url','raw'].forEach(function(k){if(typeof m[k]==='string')m[k]=conv(m[k],'tech',S);});
}
function fn(ctx){
 var S=ctx.settings;
 ctx.blocks.forEach(function(b,bi){
  var name=b.type==='h'?'heading':b.type==='table'?'table':'prose',s2;
  if(b.type==='code'||b.type==='math')return;
  if(b.type==='li'&&b.ordered&&b.marker){
   s2=conv(b.marker,'list',S);
   if(s2!==b.marker&&!(E.isRejected&&E.isRejected('digits.list',b.marker,s2))){ctx.util.change('digits','digits.list',b.marker,s2,bi);b.marker=s2;}
  }
  E.inlineLists(b).forEach(function(l){l.forEach(function(x){
   if(x.meta&&x.meta.marker)return;
   if(x.protected){if(TECH[x.rule])tech(ctx,x,bi,S);}
   else if(x.k==='ltr')tech(ctx,x,bi,S);
   else if(x.k==='text'||x.k==='num'){s2=conv(x.s,name,S);if(s2!==x.s)E.tx.set(ctx,x,bi,'digits',name,s2);}
  });});
 });
}

T.register('engine.digits',{conv:conv,fmt:fmt,digitsDemo:digitsDemo,transform:fn,defaults:DEF});
E.digitsDemo=digitsDemo;
if(E.tx)E.addTransform({id:'digits',order:40,fn:fn});else console.warn('[Taraz] digits: textedit.js missing, transform not installed');
})(window.Taraz=window.Taraz||{});