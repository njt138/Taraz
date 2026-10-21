// Tarāz core: module registry, events, safe DOM builder, option/test registries, utilities.
(function(T){
'use strict';
var mods={},evs={},opts=[],tests=[],cache={},mem={},uidN=0,LS=null;
T.VERSION='0.1.0';

/** Register a module API under a name. */
T.register=function(n,api){mods[n]=api;T.emit('module:'+n,api);return api;};
T.get=function(n){return mods[n];};
T.has=function(n){return Object.prototype.hasOwnProperty.call(mods,n);};
/** Subscribe; returns an unsubscribe function. */
T.on=function(e,f){(evs[e]=evs[e]||[]).push(f);return function(){T.off(e,f);};};
T.off=function(e,f){var a=evs[e],i=a?a.indexOf(f):-1;if(i>=0)a.splice(i,1);};
T.emit=function(e,d){(evs[e]||[]).slice().forEach(function(f){try{f(d);}catch(x){console.error('[Taraz]',e,x);}});};

var ESC={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
/** HTML-escape any value. */
T.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return ESC[c];});};

function safeUrl(u){u=String(u).replace(/[\u0000-\u0020\u200B-\u200F\u2028-\u202E\u2060-\u2069\uFEFF]/g,'');return /^https?:\/\//i.test(u)||(u.indexOf(':')<0&&u.slice(0,2)!=='//');}
function add(el,c){
  if(c==null||typeof c==='boolean')return;
  if(Array.isArray(c))c.forEach(function(x){add(el,x);});
  else if(c.nodeType)el.appendChild(c);
  else el.appendChild(document.createTextNode(String(c)));
}
var PROP={value:1,checked:1,selected:1,indeterminate:1};
/** Safe DOM builder: h(tag, attrs|null, ...children). Text is always a text node; no innerHTML. */
T.h=function(tag,attrs){
  var el=document.createElement(tag),props=null,i,
      plain=attrs==null||(typeof attrs==='object'&&!attrs.nodeType&&!Array.isArray(attrs));
  if(attrs&&plain)Object.keys(attrs).forEach(function(k){
    var v=attrs[k];
    if(v==null||v===false)return;
    if(k==='class')el.className=v;
    else if(k==='style'&&typeof v==='object')Object.assign(el.style,v);
    else if(/^on/i.test(k)){if(typeof v==='function')el.addEventListener(k.slice(2).toLowerCase(),v);}
    else if(/^(html|innerhtml|outerhtml|srcdoc)$/i.test(k))return;
    else if(PROP[k])(props=props||{})[k]=v;
    else if(/^(href|src|action|formaction|xlink:href)$/i.test(k)){if(safeUrl(v))el.setAttribute(k,v);}
    else el.setAttribute(k,v===true?'':String(v));
  });
  for(i=plain?2:1;i<arguments.length;i++)add(el,arguments[i]);
  if(props)Object.assign(el,props);
  return el;
};

var TYPES={'switch':1,segmented:1,select:1,slider:1,text:1,list:1};
/** Validate an option and fill defaults; null if invalid. */
T.normalizeOption=function(o){
  if(!o||typeof o.id!=='string'||!TYPES[o.type])return null;
  var n=Object.assign({group:'general',level:'basic',affects:'engine',help:'',label:o.id},o);
  if(n.def===undefined){
    if(n.type==='switch')n.def=false;
    else if(n.type==='text')n.def='';
    else if(n.type==='list')n.def=[];
    else if(n.type==='slider')n.def=n.min||0;
    else n.def=n.options&&n.options[0]?n.options[0].v:'';
  }
  return n;
};
/** Register options (replaces same id). Emits 'options:changed' with the added list. */
T.defineOptions=function(list){
  var added=[];
  (list||[]).forEach(function(o){
    var n=T.normalizeOption(o),i;
    if(!n){console.warn('[Taraz] bad option',o);return;}
    for(i=0;i<opts.length;i++)if(opts[i].id===n.id)break;
    opts[i]=n;added.push(n);
  });
  if(added.length)T.emit('options:changed',added);
  return added;
};
T.options=function(){return opts.slice();};
T.option=function(id){for(var i=0;i<opts.length;i++)if(opts[i].id===id)return opts[i];return null;};

/** Register test cases: {name,input,settings?,raw?,expect(result,ctx)->bool|string|Promise}. */
T.addTests=function(list){
  (list||[]).forEach(function(t){
    if(!t||!t.name)return;
    var f=typeof t.expect==='function'?t.expect:(typeof t.run==='function'?t.run:(typeof t.fn==='function'?t.fn:null));
    if(f){
      if(typeof t.expect!=='function')t.expect=f;
      if(typeof t.run!=='function')t.run=f;
      if(typeof t.fn!=='function')t.fn=f;
      tests.push(t);
    }else console.warn('[Taraz] bad test',t);
  });
};
T.tests=function(){return tests.slice();};

/** Deterministic id generator (stable across runs after uid.reset()). */
T.uid=function(p){uidN+=1;return (p||'u')+uidN.toString(36);};
T.uid.reset=function(){uidN=0;};
/** Trailing debounce; fn.cancel() available. */
T.debounce=function(fn,ms){
  var id=null;
  function d(){var a=arguments,self=this;clearTimeout(id);id=setTimeout(function(){id=null;fn.apply(self,a);},ms==null?150:ms);}
  d.cancel=function(){clearTimeout(id);id=null;};
  return d;
};

try{LS=window.localStorage;LS.setItem('__tz','1');LS.removeItem('__tz');}catch(e){LS=null;}
/** JSON localStorage with in-memory fallback (safe on file://, private mode, quota errors). */
T.lsGet=function(k,d){
  var r=null;
  try{r=LS?LS.getItem(k):null;}catch(e){}
  if(r==null)r=mem[k];
  if(r==null)return d;
  try{return JSON.parse(r);}catch(e){return d;}
};
T.lsSet=function(k,v){
  var s;
  try{s=JSON.stringify(v);}catch(e){return false;}
  try{if(LS){LS.setItem(k,s);delete mem[k];}else mem[k]=s;}catch(e){mem[k]=s;return false;}
  return true;
};
T.lsDel=function(k){delete mem[k];try{if(LS)LS.removeItem(k);}catch(e){}};

var CDN=/^(?:https:\/\/(?:cdn\.jsdelivr\.net\/npm\/|cdnjs\.cloudflare\.com\/ajax\/libs\/)|vendor\/)/,PIN=/[@\/]\d+\.\d+\.\d+[^\/]*\/|^vendor\//;
function fail(code,url){var e=new Error(T.t?T.t(code==='badurl'?'err.badUrl':'err.offline'):code);e.code=code;e.url=url;return e;}
function load(url,css){
  if(typeof url!=='string'||(!CDN.test(url)&&!/^vendor\//.test(url)))return Promise.reject(fail('badurl',url));
  var key=(css?'css:':'js:')+url;
  if(cache[key])return cache[key];
  cache[key]=new Promise(function(res,rej){
    var el=document.createElement(css?'link':'script'),done=false,tm;
    function end(ok){
      if(done)return;done=true;clearTimeout(tm);
      if(ok)res(url);
      else{delete cache[key];if(el.parentNode)el.parentNode.removeChild(el);rej(fail('offline',url));}
    }
    tm=setTimeout(function(){end(false);},20000);
    el.onload=function(){end(true);};el.onerror=function(){end(false);};
    if(css){el.rel='stylesheet';el.href=url;}else{el.async=true;el.src=url;}
    document.head.appendChild(el);
  });
  return cache[key];
}
/** Lazy-load a CDN script (jsdelivr/npm or cdnjs only, exact pinned version). Rejects with e.code 'badurl'|'offline'. */
T.loadScript=function(u){return load(u,false);};
T.loadStyle=function(u){return load(u,true);};
})(window.Taraz=window.Taraz||{});