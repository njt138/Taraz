// Tarāz settings store: option-backed values, persistence ("taraz.settings.v1"), import/export JSON.
(function(T){
'use strict';
var KEY='taraz.settings.v1',BAD={};
T.defineOptions([
 {id:'theme',group:'view',label:'theme.label',help:'opt.theme.help',type:'segmented',
  options:[{v:'auto',label:'theme.auto'},{v:'light',label:'theme.light'},{v:'dark',label:'theme.dark'}],def:'auto',level:'basic',affects:'view'},
 {id:'highContrast',group:'view',label:'contrast.label',help:'opt.highContrast.help',type:'switch',def:false,level:'basic',affects:'view'}
]);
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function coerce(o,v){
  var i,n;
  switch(o.type){
  case 'switch':return typeof v==='boolean'?v:v==='true'?true:v==='false'?false:BAD;
  case 'segmented':case 'select':
    for(i=0;i<(o.options||[]).length;i++)if(o.options[i].v===v||String(o.options[i].v)===String(v))return o.options[i].v;
    return BAD;
  case 'slider':
    n=typeof v==='string'&&v.trim()===''?NaN:Number(v);
    if(!isFinite(n))return BAD;
    if(o.min!=null)n=Math.max(o.min,n);
    if(o.max!=null)n=Math.min(o.max,n);
    if(o.step>0){n=Math.round((n-(o.min||0))/o.step)*o.step+(o.min||0);if(o.max!=null)n=Math.min(o.max,n);}
    return parseFloat(n.toFixed(6));
  case 'text':return typeof v==='string'?v.slice(0,20000):BAD;
  case 'list':return Array.isArray(v)?v.filter(function(x){return typeof x==='string';}):BAD;
  }
  return BAD;
}
function make(getOpts,key,live){
  var values={},pending={},subs=[];
  function find(id){var a=getOpts();for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null;}
  function all(){var r={};getOpts().forEach(function(o){r[o.id]=o.id in values?values[o.id]:o.def;});return r;}
  function defaults(){var r={};getOpts().forEach(function(o){r[o.id]=o.def;});return r;}
  function persist(){if(key)T.lsSet(key,Object.assign({},pending,values));}
  function commit(nv){
    var old=all(),cur,ch=[];
    values=nv;
    getOpts().forEach(function(o){if(o.id in values&&same(values[o.id],o.def))delete values[o.id];});
    persist();cur=all();
    getOpts().forEach(function(o){if(!same(old[o.id],cur[o.id]))ch.push({id:o.id,value:cur[o.id],old:old[o.id],affects:o.affects});});
    ch.forEach(function(c){subs.slice().forEach(function(f){try{f(c);}catch(e){console.error('[Taraz]',e);}});});
    if(live&&ch.length)T.emit('settings:changed',{changes:ch,settings:cur});
    return ch;
  }
  function absorb(){ // resolve saved values for newly (re)defined options
    var nv=Object.assign({},values);
    getOpts().forEach(function(o){
      var v;
      if(o.id in pending){v=coerce(o,pending[o.id]);delete pending[o.id];if(v!==BAD)nv[o.id]=v;}
      if(o.id in nv&&coerce(o,nv[o.id])===BAD)delete nv[o.id];
    });
    commit(nv);
  }
  var api={
    /** Effective value (default if unmodified); undefined for unknown ids. */
    get:function(id){var o=find(id);return o?(id in values?values[id]:o.def):undefined;},
    all:all,defaults:defaults,
    /** set(id,value) or set({id:value}); returns array of rejected ids (empty = all applied). */
    set:function(a,b){
      var m={},nv=Object.assign({},values),bad=[];
      if(typeof a==='string')m[a]=b;else Object.assign(m,a);
      Object.keys(m).forEach(function(id){var o=find(id),v=o?coerce(o,m[id]):BAD;if(v===BAD)bad.push(id);else nv[id]=v;});
      commit(nv);return bad;
    },
    reset:function(id){var nv=Object.assign({},values);if(id)delete nv[id];else{nv={};pending={};}commit(nv);},
    /** Subscribe to per-option changes: fn({id,value,old,affects}); returns unsubscribe. */
    onChange:function(f){subs.push(f);return function(){var i=subs.indexOf(f);if(i>=0)subs.splice(i,1);};},
    isModified:function(id){return id in values;},
    modified:function(){return getOpts().filter(function(o){return o.id in values;}).map(function(o){return o.id;});},
    exportJSON:function(){return JSON.stringify({app:'taraz',version:1,credit:T.CREDIT,settings:all()},null,2);},
    /** Replaces all values (unknown/invalid entries are ignored). Returns {ok,applied,ignored[]|error}. */
    importJSON:function(text){
      var o,src,nv={},applied=0,ignored=[];
      try{o=JSON.parse(text);}catch(e){return {ok:false,error:'parse'};}
      src=o&&o.app==='taraz'?o.settings:o;
      if(!src||typeof src!=='object'||Array.isArray(src))return {ok:false,error:'shape'};
      Object.keys(src).forEach(function(id){
        var op=find(id),v=op?coerce(op,src[id]):BAD;
        if(v===BAD)ignored.push(id);else{nv[id]=v;applied++;}
      });
      commit(nv);return {ok:true,applied:applied,ignored:ignored};
    },
    /** Validate a value against an option (object or id): {ok,value}. */
    coerce:function(o,v){var op=typeof o==='string'?find(o):o,r=op?coerce(op,v):BAD;return r===BAD?{ok:false}:{ok:true,value:r};}
  };
  if(key){var raw=T.lsGet(key,null);if(raw&&typeof raw==='object'&&!Array.isArray(raw))pending=Object.assign({},raw);}
  absorb();
  if(live)T.on('options:changed',absorb);
  return api;
}
var store=make(T.options,KEY,true);
/** create(optionsArrayOrFn, storageKey?) -> isolated store (used by tests). */
store.create=function(o,key){return make(typeof o==='function'?o:function(){return o;},key||null,false);};
store.KEY=KEY;
T.register('settings',store);
})(window.Taraz=window.Taraz||{});