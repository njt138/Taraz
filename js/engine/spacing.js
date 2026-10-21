// Tarāz engine/spacing: Persian<->LTR/number separators (space/ZWNJ/thin) and Persian punctuation spacing. No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),C=T.C,tx=E.tx,Z=C.ZWNJ,TH='\u2009';
if(!tx){console.warn('[Taraz] spacing.js needs engine/textedit.js');return;}
var G='spacing',R=tx.R,RM=tx.RM,LD=tx.LD+C.DIGIT_FA+C.DIGIT_AR,
 reSuf=new RegExp('^(?:ترین|های|مین|ها|ای|ام|ات|اش|تر|ی)(?!['+R+'])'),
 endR=new RegExp('['+RM+']$'),startR=new RegExp('^['+R+']'),
 endL=new RegExp('['+LD+']$'),startL=new RegExp('^['+LD+']'),
 NONTXT={ltr:1,num:1,code:1,math:1,link:1};
T.defineOptions([
 {id:'spMode',group:G,label:'جداکنندهٔ فارسی و لاتین/عدد',help:'میان متن فارسی و واژه یا عدد چسبیدهٔ لاتین جداکنندهٔ لازم را درج می‌کند.',type:'select',
  options:[{v:'space',label:'فاصلهٔ معمولی'},{v:'zwnj',label:'فاصله؛ نیم‌فاصله برای پسوندها'},{v:'thin',label:'فاصلهٔ نازک'},{v:'off',label:'خاموش'}],def:'zwnj',level:'basic',affects:'engine'},
 {id:'spPunct',group:G,label:'فاصله‌گذاری نشانه‌گذاری فارسی',help:'فاصلهٔ پیش و پس از ، ؛ : ؟ ! و پرانتز و گیومه را درست می‌کند.',type:'switch',def:true,level:'basic',affects:'engine'}
]);
function zwOff(S,b){var m=S.zwConvert;return m==='all'||m==='suffix'||m==='everywhere'||(m==='heading'&&b.type==='h');}
function sep(S,b,suffix){return S.spMode==='thin'?TH:(S.spMode==='zwnj'&&suffix&&!zwOff(S,b))?Z:' ';}
function inner(s,S,b){
 return s.replace(new RegExp('(['+RM+'])(?=['+LD+'])','g'),'$1'+sep(S,b,false))
  .replace(new RegExp('(['+LD+'])(?=['+R+'])','g'),function(m,a,o,str){return a+sep(S,b,reSuf.test(str.slice(o+1)));});
}
function ltrSide(x,end){return x.k==='text'?(!x.protected&&(end?endL:startL).test(x.s)):(!!NONTXT[x.k]&&x.s!=='');}
function ins(ctx,bi,rule,x,y,sp,atEnd){
 var a=x.s.slice(-8),c=y.s.slice(0,8),b4=tx.vis(a+c),af=tx.vis(a+sp+c);
 if(E.isRejected&&E.isRejected(G+'.'+rule,b4,af))return;
 ctx.util.change(G,G+'.'+rule,b4,af,bi);
 if(atEnd)x.s+=sp;else y.s=sp+y.s;
}
function boundary(ctx,S){
 ctx.util.each(function(l,b,bi){
  var i,j,x,y;
  if(b.type==='code'||b.type==='math')return;
  for(i=0;i<l.length;i++){
   x=l[i];if(tx.isMarker(x))continue;
   j=i+1;while(j<l.length&&tx.isMarker(l[j]))j++;
   y=l[j];if(!y)break;
   if(x.k==='text'&&!x.protected&&endR.test(x.s)&&ltrSide(y,false))ins(ctx,bi,'rtl-ltr',x,y,sep(S,b,false),true);
   else if(ltrSide(x,true)&&y.k==='text'&&!y.protected&&startR.test(y.s))ins(ctx,bi,'ltr-rtl',x,y,sep(S,b,reSuf.test(y.s)),false);
  }
 });
}
var PR=[
 ['punct-before',function(s){
  return s.replace(/(\S)[ \t]+(?=[\u060C\u061B\u061F])/g,'$1').replace(new RegExp('(['+RM+'])[ \\t]+(?=[:!;]|\\.(?!\\.))','g'),'$1');}],
 ['punct-after',function(s){
  return s.replace(new RegExp('([\u060C\u061B\u061F])(?=['+R+C.LATIN_LETTER+'])','g'),function(m,p1,offset,str){
   if(p1==='\u060C'&&offset>0&&new RegExp('['+LD+']$').test(str.slice(0,offset))&&new RegExp('^['+LD+']').test(str.slice(offset+1)))return p1;
   return p1+' ';
  })
   .replace(new RegExp('(['+RM+'])([:!;]|(?<=['+R+']{2})\\.)(?=['+R+'])','g'),'$1$2 ');}],
 ['paren-inner',function(s){return s.replace(/([(\u00AB])[ \t]+/g,'$1').replace(/[ \t]+([)\u00BB])/g,'$1');}],
 ['paren-outer',function(s){
  return s.replace(new RegExp('(['+R+'])(?=[(\u00AB])','g'),'$1 ').replace(new RegExp('([)\u00BB])(?=['+R+'])','g'),'$1 ');}]
];
function edgePunct(ctx){
 tx.eachText(ctx,function(x,l,i,b,bi){
  var p=tx.near(l,i,-1),n=tx.near(l,i,1),s=x.s;
  if(p&&p.k!=='text'&&/\S$/.test(p.s))s=s.replace(/^[ \t]+(?=[\u060C\u061B\u061F])/,'');
  if(n&&n.k!=='text'&&n.s!==''&&!/^\s/.test(n.s)&&/[\u060C\u061B\u061F]$/.test(s)&&!(s==='\u060C'&&p&&p.k==='num'&&n.k==='num'))s+=' ';
  tx.set(ctx,x,bi,G,'punct-edge',s);
 });
}
E.addTransform({id:'spacing',order:30,fn:function(ctx){
 var S=ctx.settings;
 if(S.spPunct)PR.forEach(function(r){tx.eachText(ctx,function(x,l,i,b,bi){tx.set(ctx,x,bi,G,r[0],r[1](x.s));});});
 if(S.spMode&&S.spMode!=='off'){
  tx.eachText(ctx,function(x,l,i,b,bi){tx.set(ctx,x,bi,G,'inner',inner(x.s,S,b));});
  boundary(ctx,S);
 }
 if(S.spPunct)edgePunct(ctx);
}});
})(window.Taraz=window.Taraz||{});