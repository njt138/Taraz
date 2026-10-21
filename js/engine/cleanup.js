// Tarāz engine/cleanup: Arabic->Persian letters, tatweel, diacritics, AI-chat artifacts, quotes, whitespace. No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),C=T.C,tx=E.tx;
if(!tx){console.warn('[Taraz] cleanup.js needs engine/textedit.js');return;}
var G='cleanup',PIC='\\p{Extended_Pictographic}',MD='(?:\\uFE0F|\\p{Emoji_Modifier})*',
 EMO=new RegExp('(?![\\u00A9\\u00AE\\u2122\\u2139\\u2194-\\u2199\\u21A9\\u21AA])'+PIC+MD+'(?:\\u200D'+PIC+MD+')*|\\p{Regional_Indicator}{2}|\\uFE0F|\\u20E3','gu'),
 ZWJ=new RegExp('(?<!'+PIC+'\\uFE0F?)\\u200D(?!'+PIC+')','gu'),
 HARAKAT=/[\u064B-\u0652\u0670]/g,ALLMARK=C.rx(C.MARK,'g'),
 QS={straight:[[/[\u201C\u201D\u201E\u201F]/g,'"'],[/[\u2018\u2019\u201A\u201B]/g,"'"]],
     guillemets:[[/[\u201C\u201E]/g,'\u00AB'],[/[\u201D\u201F]/g,'\u00BB'],[/[\u2018\u2019\u201A\u201B]/g,"'"]]};
function sw(id,label,help,def,lv){return {id:id,group:G,label:label,help:help,type:'switch',def:def,level:lv||'basic',affects:'engine'};}
function sel(id,label,help,o,def,lv){return {id:id,group:G,label:label,help:help,type:'select',options:o.map(function(p){return {v:p[0],label:p[1]};}),def:def,level:lv||'pro',affects:'engine'};}
T.defineOptions([
 sw('clArabic','تبدیل «ي» و «ك» عربی به «ی» و «ک» فارسی','حروف عربی ي، ى و ك را با معادل فارسی جایگزین می‌کند.',true),
 sw('clTatweel','حذف کشیده (ـ)','کشیدهٔ تزئینی میان حروف را برمی‌دارد.',true),
 sel('clDiacritics','حذف اعراب','علائم اعراب را حذف می‌کند؛ «فقط حرکات» علائم همزه را نگه می‌دارد.',[['off','نگه‌دار'],['harakat','فقط حرکات'],['all','همهٔ علائم']],'off'),
 sw('clMarkdown','پاک‌سازی نشانه‌های رهاشدهٔ مارک‌داون','** و ### تنها و خط‌های --- بازمانده از چت هوش مصنوعی را حذف می‌کند.',true),
 sw('clEmoji','حذف ایموجی','ایموجی‌ها را از متن عادی حذف می‌کند.',false),
 sel('clQuotes','گیومهٔ خمیده (curly)','گیومه‌های خمیدهٔ “ ” ‘ ’ را یکدست می‌کند.',[['keep','بدون تغییر'],['straight','مستقیم'],['guillemets','گیومهٔ فارسی «»']],'keep','basic'),
 sw('clNbsp','تبدیل فاصلهٔ ناشکن به فاصلهٔ معمولی','NBSP و فاصله‌های ویژهٔ یونیکد را به فاصلهٔ ساده تبدیل می‌کند.',true),
 sw('clJunk','حذف نویسه‌های نامرئی مزاحم','نویسه‌های بی‌عرض و کنترلی ناخواسته را برمی‌دارد.',true),
 sel('clTabs','نمایش تب‌ها','تب‌ها را به یک فاصله تبدیل می‌کند یا نگه می‌دارد.',[['space','تبدیل به فاصله'],['keep','نگه‌دار']],'space'),
 sw('clJoin','اتصال سطرهای شکسته','سطرهای شکسته‌شدهٔ یک پاراگراف را به هم می‌چسباند.',false,'pro'),
 sw('clSpaces','مرتب‌سازی فاصله‌ها','فاصلهٔ تکراری، فاصلهٔ انتهای سطر و سطرهای خالی تکراری را حذف می‌کند.',true)
]);
function rules(S){
 var r=[];
 if(S.clArabic)r.push(['arabic',function(s){return s.replace(/[\u064A\u0649\u0643]/g,function(c){return C.AR_TO_FA[c];});}]);
 if(S.clTatweel)r.push(['tatweel',function(s){return s.replace(/\u0640+/g,'');}]);
 if(S.clDiacritics==='harakat')r.push(['diacritics',function(s){return s.replace(HARAKAT,'');}]);
 if(S.clDiacritics==='all')r.push(['diacritics',function(s){return s.replace(ALLMARK,'');}]);
 if(S.clMarkdown)r.push(['markdown',function(s){return s.replace(/\*{2,}/g,'').replace(/(^|\s)#{1,6}(?=\s|$)/g,'$1');}]);
 if(S.clEmoji)r.push(['emoji',function(s){return s.replace(EMO,'');}]);
 if(QS[S.clQuotes])r.push(['quotes',function(s){QS[S.clQuotes].forEach(function(p){s=s.replace(p[0],p[1]);});return s;}]);
 if(S.clNbsp)r.push(['nbsp',function(s){return s.replace(/[\u00A0\u2002-\u2008\u200A\u202F\u205F\u3000]/g,' ');}]);
 if(S.clJunk)r.push(['junk',function(s){return s.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u2060\u00AD\u180E\uFFFC\u200B\uFEFF]/g,'').replace(ZWJ,'');}]);
 if(S.clTabs==='space')r.push(['tabs',function(s){return s.replace(/\t+/g,' ');}]);
 if(S.clJoin)r.push(['join',function(s,b){return /^(p|li|quote)$/.test(b.type)?s.replace(/[ \t]*\n[ \t]*/g,' '):s;}]);
 if(S.clSpaces)r.push(['spaces',function(s){return s.replace(/[ \t]+(?=\n)/g,'').replace(/\n[ \t]+/g,'\n').replace(/\n{2,}/g,'\n').replace(/ {2,}/g,' ');}]);
 return r;
}
function edges(ctx){
 tx.eachText(ctx,function(x,l,i,b,bi){
  var p=tx.near(l,i,-1),n=tx.near(l,i,1),s=x.s;
  if(!p)s=s.replace(/^\s+/,'');else if(p.k==='text'&&/\s$/.test(p.s))s=s.replace(/^[ \t]+/,'');
  if(!n)s=s.replace(/\s+$/,'');
  tx.set(ctx,x,bi,G,'edges',s);
 });
}
function prune(ctx){
 ctx.util.each(function(l,b){
  if(b.type==='code'||b.type==='math')return;
  for(var i=l.length-1;i>=0;i--)if(l[i].k==='text'&&!l[i].protected&&l[i].s==='')l.splice(i,1);
 });
}
function drop(ctx,bi,rule,before){
 if(E.isRejected&&E.isRejected(G+'.'+rule,before,''))return;
 ctx.blocks.splice(bi,1);
 ctx.changes.forEach(function(c){if(c.blockIndex>bi)c.blockIndex--;});
 ctx.warnings.forEach(function(w){if(w.blockIndex>bi)w.blockIndex--;});
 ctx.util.change(G,G+'.'+rule,before,'',bi);
}
function blocks(ctx,S){
 var i,b,t;
 for(i=ctx.blocks.length-1;i>=0;i--){
  b=ctx.blocks[i];
  if(!/^(p|h|li|quote)$/.test(b.type))continue;
  t=b.inlines.filter(function(x){return !tx.isMarker(x);}).map(function(x){return x.s;}).join('');
  if(S.clMarkdown&&b.type==='p'&&/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(t))drop(ctx,i,'hr',t.trim());
  else if(!t.trim()&&!b.inlines.some(function(x){return x.k!=='text';}))drop(ctx,i,'empty','');
 }
}
E.addTransform({id:'cleanup',order:10,fn:function(ctx){
 var S=ctx.settings;
 rules(S).forEach(function(r){tx.eachText(ctx,function(x,l,i,b,bi){tx.set(ctx,x,bi,G,r[0],r[1](x.s,b));});});
 if(S.clSpaces)edges(ctx);
 prune(ctx);blocks(ctx,S);
}});
})(window.Taraz=window.Taraz||{});