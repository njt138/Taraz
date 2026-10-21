// Tarāz engine/zwnj: ZWNJ fixes (doubled/edge/near Latin), rule-based repair with exceptions, optional ZWNJ->space. No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),C=T.C,tx=E.tx,Z=C.ZWNJ;
if(!tx){console.warn('[Taraz] zwnj.js needs engine/textedit.js');return;}
var G='zwnj',R=tx.R,LD=tx.LD,
 SUF='(?:ترین|های|ایم|اید|اند|مان|تان|شان|ها|ای|ام|ات|اش|تر|ی)(?!['+R+'])',
 reSuf=new RegExp('^'+SUF),
 PRES='(?:خواه|رو|کن|گو|شو|باش|دان|توان|ده|بین|آی|آور|بر|گیر|ساز|نویس|خور|ماند|رس|یاب|افت|گذار|پرداز)(?:م|ی|د|یم|ید|ند)',
 PAST='(?:رفت|کرد|گفت|شد|داد|دید|آمد|خواست|توانست|دانست|گرفت|ماند|نوشت|خورد|رسید|افتاد|بود)(?:م|ی|یم|ید|ند)?',
 LEX='بهره_برداری,بهره_وری,نقشه_برداری,نمونه_برداری,پیش_بینی,پیش_فرض,پیش_نیاز,پیش_پردازش,پس_پردازش,هم_زمان,همان_طور,همان_گونه,نرم_افزار,سخت_افزار,بیش_برازش,کم_برازش,خط_مشی'.split(',').map(function(w){
  var p=w.split('_');return {out:p.join(Z),re:new RegExp('(?<!['+R+'])'+p.join('[ '+Z+']?')+'(?!['+R+'])','g')};});
T.defineOptions([
 {id:'zwFix',group:G,label:'اصلاح نیم‌فاصلهٔ نادرست',help:'نیم‌فاصلهٔ تکراری، کنار فاصله، لبهٔ متن یا چسبیده به لاتین را اصلاح می‌کند.',type:'switch',def:true,level:'basic',affects:'engine'},
 {id:'zwRepair',group:G,label:'ترمیم و درج نیم‌فاصله',help:'نیم‌فاصله را در «می‌خواهم»، «کتاب‌ها» و ترکیب‌هایی مانند «بهره‌برداری» درج می‌کند.',type:'switch',def:true,level:'basic',affects:'engine'},
 {id:'zwConvert',group:G,label:'تبدیل نیم‌فاصله به فاصلهٔ معمولی',help:'نیم‌فاصله‌ها را در محدودهٔ انتخابی به فاصله تبدیل می‌کند (پیش‌فرض: بدون تغییر).',type:'select',
  options:[{v:'keep',label:'بدون تغییر'},{v:'all',label:'همه'},{v:'mi',label:'فقط پس از «می‌» و «نمی‌»'},{v:'suffix',label:'فقط پیش از پسوندها'},{v:'heading',label:'فقط در عنوان‌ها'},{v:'everywhere',label:'همه‌جا به‌جز بخش‌های محافظت‌شده'}],def:'keep',level:'pro',affects:'engine'},
 {id:'zwExceptions',group:G,label:'استثناهای نیم‌فاصله',help:'واژه‌هایی که ترمیم نباید لمس کند (هر واژه در یک سطر).',type:'list',def:['میدانی','تنها'],level:'pro',affects:'engine'}
]);
function key(w){return w.replace(/[\u200C\s]/g,'');}
var FIX=[
 ['double',function(s){return s.replace(/\u200C{2,}/g,Z);}],
 ['space',function(s){return s.replace(/\u200C+(?=\s)|(?<=\s)\u200C+/g,'');}],
 ['latin',function(s){
  return s.replace(new RegExp('(['+R+'])\u200C+(?=['+LD+'])','g'),'$1')
   .replace(new RegExp('(['+LD+'])\u200C+(?=['+LD+'])','g'),'$1')
   .replace(new RegExp('(['+LD+'])\u200C+(?=['+R+'])','g'),function(m,a,o,str){return reSuf.test(str.slice(o+m.length))?m:a;});}]
];
function edge(ctx){
 tx.eachText(ctx,function(x,l,i,b,bi){
  var p=tx.near(l,i,-1),n=tx.near(l,i,1),s=x.s,t;
  if(!p||(p.k==='text'&&/[\s\u200C]$/.test(p.s)))s=s.replace(/^\u200C+/,'');
  else if(p.k!=='text'&&s.charAt(0)===Z){t=s.replace(/^\u200C+/,'');s=reSuf.test(t)?Z+t:t;}
  if(!n||n.k!=='text')s=s.replace(/\u200C+$/,'');
  tx.set(ctx,x,bi,G,'edge',s);
 });
}
function repairRules(S){
 var ex={};
 tx.list(S.zwExceptions).forEach(function(w){ex[key(w)]=1;});
 function pair(re,fn){return function(s){return s.replace(re,function(m,a,b){return ex[key(a+b)]?m:fn(a,b);});};}
 function join(a,b){return a+Z+b;}
 return [
  ['lexicon',function(s){LEX.forEach(function(L){s=s.replace(L.re,function(m){return ex[key(m)]?m:L.out;});});return s;}],
  ['mi-space',pair(new RegExp('(?<!['+R+'])(ن?می) +(['+R+']{2,})','g'),join)],
  ['mi-glued',pair(new RegExp('(?<!['+R+'])(ن?می)('+PRES+'|'+PAST+')(?!['+R+'])','g'),join)],
  ['plural-space',pair(new RegExp('(?<!['+R+'])(['+R+']{2,}) (ها|های|ترین)(?!['+R+'])','g'),join)],
  ['plural-glued',pair(new RegExp('(?<!['+R+'])(['+R+']{2,})(ها|های)(?!['+R+'])','g'),function(a,b){return /[ادذرزژو]$/.test(a)?a+b:join(a,b);})],
  ['ezafe',pair(new RegExp('(['+R+'][هة]) (ی)(?!['+R+'])','g'),join)]
 ];
}
function convert(ctx,S){
 var m=S.zwConvert,f;
 if(m==='mi')f=function(s){return s.replace(new RegExp('(?<!['+R+'])(ن?می)\u200C','g'),'$1 ');};
 else if(m==='suffix')f=function(s){return s.replace(new RegExp('\u200C(?='+SUF+')','g'),' ');};
 else f=function(s,b){return (m==='heading'&&b.type!=='h')?s:s.replace(/ ?\u200C+ ?/g,' ');};
 tx.eachText(ctx,function(x,l,i,b,bi){tx.set(ctx,x,bi,G,'convert',f(x.s,b));},m==='everywhere');
}
E.addTransform({id:'zwnj',order:20,fn:function(ctx){
 var S=ctx.settings;
 if(S.zwFix){
  FIX.forEach(function(r){tx.eachText(ctx,function(x,l,i,b,bi){tx.set(ctx,x,bi,G,r[0],r[1](x.s));});});
  edge(ctx);
 }
 if(S.zwRepair)repairRules(S).forEach(function(r){tx.eachText(ctx,function(x,l,i,b,bi){tx.set(ctx,x,bi,G,r[0],r[1](x.s));});});
 if(S.zwConvert&&S.zwConvert!=='keep')convert(ctx,S);
}});
})(window.Taraz=window.Taraz||{});