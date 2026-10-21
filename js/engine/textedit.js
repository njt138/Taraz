// Tarāz engine/textedit: shared helpers (E.tx) for text transforms: snippets, Change recording, inline iteration. No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),C=T.C,tx=E.tx=E.tx||{},
 VIS={'\u200C':'‹ZWNJ›','\u2009':'‹THIN›','\u00A0':'‹NBSP›','\u200D':'‹ZWJ›','\u0640':'‹TATWEEL›','\u2060':'‹WJ›','\u00AD':'‹SHY›','\t':'‹TAB›','\n':'‹LF›'};
tx.R=C.RTL_LETTER+C.HEBREW;
tx.RM=tx.R+C.MARK;
tx.LD=C.LATIN_LETTER+'0-9';
/** Make invisible characters readable inside Change snippets. */
tx.vis=function(s){return String(s).replace(/[\u200C\u2009\u00A0\u200D\u0640\u2060\u00AD\t\n]/g,function(c){return VIS[c];});};
/** Differing window of a/b with 8 chars of context -> [beforeSnippet, afterSnippet]. */
tx.snip=function(a,b){
 var i=0,ja=a.length,jb=b.length,k;
 while(i<ja&&i<jb&&a.charAt(i)===b.charAt(i))i++;
 while(ja>i&&jb>i&&a.charAt(ja-1)===b.charAt(jb-1)){ja--;jb--;}
 k=Math.max(0,i-8);
 return [tx.vis(a.slice(k,ja+8)),tx.vis(b.slice(k,jb+8))];
};
tx.isMarker=function(x){return !!(x&&x.meta&&x.meta.marker);};
/** Nearest non-marker neighbour of l[i] in direction d (-1|1), or null. */
tx.near=function(l,i,d){for(i+=d;i>=0&&i<l.length;i+=d)if(!tx.isMarker(l[i]))return l[i];return null;};
/** Set x.s=s2 and record Change {type, ruleId:type+'.'+rule, before, after}; false when unchanged. */
tx.set=function(ctx,x,bi,type,rule,s2){
 if(s2===x.s)return false;
 var d=tx.snip(x.s,s2);
 ctx.util.change(type,type+'.'+rule,d[0],d[1],bi);x.s=s2;return true;
};
/** fn(x,list,i,block,bi) for every unprotected 'text' inline (plus ltr/num when withLtr); code/math blocks skipped. */
tx.eachText=function(ctx,fn,withLtr){
 ctx.util.each(function(l,b,bi){
  if(b.type==='code'||b.type==='math')return;
  l.forEach(function(x,i){
   if(x.protected||tx.isMarker(x))return;
   if(x.k==='text'||(withLtr&&(x.k==='ltr'||x.k==='num')))fn(x,l,i,b,bi);
  });
 });
};
/** Normalise a 'list' option value (array or newline/comma text) to a trimmed string array. */
tx.list=function(v){return (Array.isArray(v)?v:String(v==null?'':v).split(/[\n,\u060C]+/)).map(function(s){return String(s).trim();}).filter(Boolean);};
})(window.Taraz=window.Taraz||{});