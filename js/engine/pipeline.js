// Tarāz engine/pipeline: process(text, settings) -> Result; transform registry; bidi-control stripping; stats/health. No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),C=T.C,tf=[];
T.defineOptions([{id:'protection',group:'engine',label:'opt.protection.label',help:'opt.protection.help',type:'segmented',
 options:[{v:'conservative',label:'opt.protection.conservative'},{v:'balanced',label:'opt.protection.balanced'},{v:'aggressive',label:'opt.protection.aggressive'}],
 def:'balanced',level:'basic',affects:'engine'}]);
/** Register a transform {id,order,fn(ctx)}; same id replaces. fn mutates ctx.blocks (or returns a new array); throwing rolls back + adds a warning. */
E.addTransform=function(t){
 if(!t||!t.id||typeof t.fn!=='function'){console.warn('[Taraz] bad transform',t);return false;}
 E.removeTransform(t.id);tf.push(Object.assign({order:100},t));
 tf.sort(function(a,b){return a.order-b.order;});return true;
};
E.removeTransform=function(id){for(var i=0;i<tf.length;i++)if(tf[i].id===id){tf.splice(i,1);return true;}return false;};
E.transforms=function(){return tf.map(function(t){return {id:t.id,order:t.order};});};

function defaults(){var r={};T.options().forEach(function(o){r[o.id]=o.def;});return r;}
function warn(ctx,type,ruleId,e,bi){
 var w={id:T.uid('w'),type:type,ruleId:ruleId,message:String((e&&e.message)||e),blockIndex:bi==null?-1:bi};
 ctx.warnings.push(w);return w;
}
function fallback(src){
 return src.split(/\n{2,}/).filter(function(p){return p.trim();}).map(function(p){
  return {type:'p',dir:'rtl',inlines:[{id:T.uid('i'),k:'text',s:p.trim(),dir:'neutral'}]};
 });
}
function mkUtil(ctx){
 return {C:C,uid:T.uid,lists:E.inlineLists,dirOfText:E.dirOfText,countLetters:E.countLetters,
  mk:function(k,s,x){return Object.assign({id:T.uid('i'),k:k,s:s,dir:E.dirOfText(s)},x||null);},
  each:function(fn){ctx.blocks.forEach(function(b,bi){E.inlineLists(b).forEach(function(l){fn(l,b,bi);});});},
  change:function(type,ruleId,before,after,bi){
   var c={id:T.uid('c'),type:type,ruleId:ruleId,before:before,after:after,blockIndex:bi==null?-1:bi};ctx.changes.push(c);return c;},
  warn:function(type,ruleId,msg,bi){return warn(ctx,type,ruleId,msg,bi);}};
}
/** Logical (markdown-like) source of blocks; process(toSource(r.blocks)) reproduces r.blocks (modulo ids). */
E.toSource=function(blocks){
 var IS=E.inlineSource;
 return blocks.map(function(b,i){
  var s,p=blocks[i-1],t;
  if(b.type==='table')s=b.rows.map(function(r,ri){
   var l='| '+r.map(function(c){return IS(c);}).join(' | ')+' |';
   return ri===0?l+'\n|'+r.map(function(){return ' --- |';}).join(''):l;}).join('\n');
  else{
   t=IS(b.inlines);
   s=b.type==='h'?'######'.slice(0,b.level||1)+' '+t
    :b.type==='li'?'  '.repeat(b.level||0)+(b.marker||'-')+' '+(b.task?(b.checked?'[x] ':'[ ] '):'')+t
    :b.type==='quote'?t.split('\n').map(function(l){return '> '+l;}).join('\n')
    :b.type==='code'?'```'+(b.lang||'')+'\n'+t+'\n```':t;
  }
  return (i?(b.type==='li'&&p.type==='li'?'\n':'\n\n'):'')+s;
 }).join('');
};
function finish(ctx,src,nstrip){
 var f=[],seen={},lt=0,paras=0,txt='',errs=0,h;
 ctx.blocks.forEach(function(b,bi){
  if(/^(p|h|li|quote)$/.test(b.type))paras++;
  E.inlineLists(b).forEach(function(l){l.forEach(function(x){
   if(x.k==='math')f.push({id:x.id,tex:(x.meta&&x.meta.tex)||x.s,display:!!(x.meta&&x.meta.display),blockIndex:bi});
   if(x.k==='ltr'){var key=(x.meta&&x.meta.run)||x.id;if(!seen[key]){seen[key]=1;lt++;}}
   if(x.k!=='code'&&x.k!=='math'&&!(x.meta&&x.meta.marker))txt+=x.s;
  });txt+=' ';});
 });
 ctx.warnings.forEach(function(w){errs+=(w.type==='transform-error'||w.type==='engine-error')?1:0;});
 h=100-20*errs-5*(ctx.warnings.length-errs)-Math.min(10,nstrip);
 return {blocks:ctx.blocks,formulas:f,changes:ctx.changes,warnings:ctx.warnings,
  stats:{chars:src.length,words:(txt.match(/\S+/g)||[]).length,paragraphs:paras,ltrRuns:lt,formulas:f.length},
  health:Math.max(0,Math.min(100,h))};
}
/** text + partial settings (merged over T.options() defaults) -> Result. Never throws; original text survives any failure. */
E.process=function(text,settings){
 var S=Object.assign(defaults(),settings),ctx={blocks:[],settings:S,changes:[],warnings:[]},
  src=String(text==null?'':text),st=[],re=new RegExp(C.RE.invisible.source,'g'),blocks;
 T.uid.reset();
 src=src.replace(/\u0000/g,'').replace(/\r\n?|\u2028|\u2029/g,'\n');
 src=src.split('\n').map(function(l,i){return l.replace(re,function(c){st.push({line:i,c:c});return '';});}).join('\n');
 try{blocks=E.parse(src);E.inlineBlocks(blocks,S);}
 catch(e){blocks=fallback(src);warn(ctx,'engine-error','parse',e);}
 st.forEach(function(x){
  var bi=-1,k;
  for(k=0;k<blocks.length;k++){if(blocks[k].line==null||blocks[k].line>x.line)break;bi=k;}
  ctx.changes.push({id:T.uid('c'),type:'strip-bidi',ruleId:'strip-bidi',before:C.label(x.c),after:'',blockIndex:bi});
 });
 blocks.forEach(function(b){delete b.line;});
 try{E.assignDirections(blocks,S);}catch(e){warn(ctx,'engine-error','direction',e);blocks.forEach(function(b){b.dir=b.dir||'rtl';});}
 ctx.blocks=blocks;ctx.util=mkUtil(ctx);
 tf.slice().forEach(function(t){
  var snap=JSON.stringify(ctx.blocks),nc=ctx.changes.length,nw=ctx.warnings.length,r;
  try{r=t.fn(ctx);if(Array.isArray(r))ctx.blocks=r;}
  catch(e){ctx.blocks=JSON.parse(snap);ctx.changes.length=nc;ctx.warnings.length=nw;warn(ctx,'transform-error',t.id,e);}
 });
 return finish(ctx,src,st.length);
};
})(window.Taraz=window.Taraz||{});