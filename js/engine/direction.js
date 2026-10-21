// Tarāz engine/direction: block direction (auto detection with sensitivity, forced modes, per-type overrides, numbers-only lines).
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),C=T.C,
 A=[{v:'auto',label:'dir.auto'},{v:'rtl',label:'dir.rtl'},{v:'ltr',label:'dir.ltr'}],
 OV={h:'dirHeading',li:'dirList',quote:'dirQuote',table:'dirTable',code:'dirCode',math:'dirMath'},
 RR=C.rx(C.RTL_LETTER+C.HEBREW,'g'),LR=C.rx(C.LATIN_LETTER+'\\u0370-\\u03FF','g'),DR=C.rx(C.DIGIT_LAT+C.DIGIT_AR+C.DIGIT_FA,'g');
T.defineOptions([
 {id:'dirMode',group:'direction',label:'opt.dirMode.label',help:'opt.dirMode.help',type:'segmented',options:A,def:'auto',level:'basic',affects:'engine'},
 {id:'dirSensitivity',group:'direction',label:'opt.dirSensitivity.label',help:'opt.dirSensitivity.help',type:'slider',min:0,max:100,step:5,def:50,level:'pro',affects:'engine'},
 {id:'dirNumbers',group:'direction',label:'opt.dirNumbers.label',help:'opt.dirNumbers.help',type:'select',
  options:[{v:'inherit',label:'dir.inherit'},{v:'rtl',label:'dir.rtl'},{v:'ltr',label:'dir.ltr'}],def:'inherit',level:'pro',affects:'engine'}
].concat(Object.keys(OV).map(function(t){
 var id=OV[t];
 return {id:id,group:'direction',label:'opt.'+id+'.label',help:'opt.'+id+'.help',type:'select',options:A,def:(t==='code'||t==='math')?'ltr':'auto',level:'pro',affects:'engine'};
})));
function cnt(s,re){var m=String(s).match(re);return m?m.length:0;}
/** Strong-letter counts of a block: {rtl,lat,prot (Latin letters inside protected spans),dig}. Code/math/markers ignored. */
E.countLetters=function(b){
 var c={rtl:0,lat:0,prot:0,dig:0};
 E.inlineLists(b).forEach(function(l){l.forEach(function(x){
  if(x.k==='code'||x.k==='math'||(x.meta&&x.meta.marker))return;
  c.dig+=cnt(x.s,DR);
  if(x.protected&&x.rule!=='mdlink')c.prot+=cnt(x.s,LR);
  else{c.rtl+=cnt(x.s,RR);c.lat+=cnt(x.s,LR);}
 });});
 return c;
};
// RTL if RTL letters make up >= (100 - sensitivity)% of strong letters; null when the block has no letters at all.
function auto(c,sv){
 var t=c.rtl+c.lat;
 if(!t)return c.prot?'ltr':null;
 return c.rtl>0&&c.rtl*100>=t*(100-sv)?'rtl':'ltr';
}
/** Set block.dir for every block. Priority: per-type override > forced dirMode > auto. List items share one direction per list. */
E.assignDirections=function(blocks,S){
 var mode=S.dirMode||'auto',sv=Number(S.dirSensitivity),cs=blocks.map(E.countLetters),last=null,dr=0,dl=0,doc,grp,i,j,k,b,c,d,ov;
 if(!isFinite(sv))sv=50;
 cs.forEach(function(x){dr+=x.rtl;dl+=x.lat;});
 doc=dr+dl?auto({rtl:dr,lat:dl,prot:0},sv):'rtl';
 for(i=0;i<blocks.length;i++){
  b=blocks[i];c=cs[i];
  if(b.type==='li'){
   if(i===0||blocks[i-1].type!=='li'){
    grp={rtl:0,lat:0,prot:0,dig:0};
    for(j=i;j<blocks.length&&blocks[j].type==='li';j++)for(k in grp)grp[k]+=cs[j][k];
   }
   c=grp;
  }
  ov=OV[b.type]?S[OV[b.type]]:'auto';
  d=ov&&ov!=='auto'?ov:mode!=='auto'?mode:auto(c,sv);
  if(!d)d=(c.dig&&S.dirNumbers&&S.dirNumbers!=='inherit')?S.dirNumbers:(last||doc);
  b.dir=d;
  if(cs[i].rtl+cs[i].lat)last=d;
 }
 return blocks;
};
})(window.Taraz=window.Taraz||{});