// Tarāz command palette (Ctrl+K): searches every option, preset and action.
(function(T){
'use strict';
var h=T.h,sp=function(k,f){return T.sp?T.sp(k,f):(f!=null?f:k);},pal=null,inp,ul,res=[],all=[],sel=0,prev=null;
function norm(s){return String(s||'').toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u0640\u064B-\u0652]/g,'').replace(/\s+/g,' ').trim();}
function items(){
  var out=[],U=T.get('ui'),X=T.get('ui.settings'),P=T.get('presets'),S=T.get('settings'),de=document.documentElement;
  function add(kind,label,sub,run){out.push({kind:kind,label:label,sub:sub||'',hay:norm(label+' '+(sub||'')),run:run});}
  [['sp.act.settings',function(){if(U)U.drawer(true);},U],
   ['sp.act.mode',function(){X.toggleMode();},X],['sp.act.pin',function(){X.togglePin();},X],
   ['sp.act.theme',function(){U.theme(de.getAttribute('data-theme')==='dark'?'light':'dark');},U],
   ['sp.act.help',function(){var H=T.get('ui.help');if(H&&H.open)H.open();},U],
   ['sp.act.copyWord',function(){U.copy('word',true);},U],['sp.act.copyPpt',function(){U.copy('ppt');},U],['sp.act.copyPlain',function(){U.copy('plain');},U],
   ['sp.act.export',function(){P.exportFile();},P],['sp.act.import',function(){P.pickImport();},P],
   ['sp.act.reset',function(){P.resetAll();if(U)U.toast(sp('sp.resetDone'),'ok');},P]
  ].forEach(function(a){if(a[2])add('act',sp(a[0]),'',a[1]);});
  if(P)P.list().forEach(function(p){add('preset',P.title(p),p.user?'':sp(p.desc,''),function(){var r=P.apply(p.id);if(U)U.toast(r.ok?sp('sp.pr.applied')+': '+P.title(p):sp('sp.importBad'),r.ok?'ok':'err');});});
  if(S)(T.options?T.options():[]).forEach(function(o){add('opt',X&&X.label?X.label(o):o.id,(X&&X.help?X.help(o):'')+' '+o.id,function(){if(X)X.reveal(o.id);});});
  return out;
}
/** find(q, list?) -> up to 40 items {kind,label,sub,run}; empty query lists actions and presets. */
function find(qs,list){
  var ws=norm(qs).split(' ').filter(Boolean),rk={act:0,preset:1,opt:2},r;
  r=(list||all).filter(function(x){return ws.length?ws.every(function(w){return x.hay.indexOf(w)>=0;}):x.kind!=='opt';});
  if(ws.length)r.sort(function(a,b){var sa=norm(a.label).indexOf(ws[0])===0?0:norm(a.label).indexOf(ws[0])>0?1:2,sb=norm(b.label).indexOf(ws[0])===0?0:norm(b.label).indexOf(ws[0])>0?1:2;return sa-sb||rk[a.kind]-rk[b.kind];});
  return r.slice(0,40);
}
function mark(){[].forEach.call(ul.children,function(li,i){li.setAttribute('aria-selected',String(i===sel));if(i===sel){inp.setAttribute('aria-activedescendant',li.id);li.scrollIntoView({block:'nearest'});}});}
function render(){
  res=find(inp.value);sel=Math.min(sel,Math.max(0,res.length-1));ul.textContent='';
  if(!res.length){ul.append(h('li',{class:'none'},sp('sp.pal.none')));return;}
  res.forEach(function(r,i){ul.append(h('li',{role:'option',id:'tz-pal-'+i,'aria-selected':'false',onclick:function(){go(i);},onmousemove:function(){if(sel!==i){sel=i;mark();}}},
    h('span',{class:'tz-pl'},r.label),h('small',null,r.sub),h('span',{class:'tz-k'},sp('sp.pal.'+r.kind))));});
  mark();
}
function go(i){var r=res[i];if(!r)return;close();try{r.run();}catch(e){console.error('[Taraz]',e);}}
function close(){if(!pal)return;pal.remove();pal=null;if(prev&&prev.focus)prev.focus();}
function key(e){var k=e.key;
  if(k==='Escape'){e.preventDefault();e.stopPropagation();close();}
  else if(k==='ArrowDown'||k==='ArrowUp'){e.preventDefault();if(res.length){sel=(sel+(k==='ArrowDown'?1:-1)+res.length)%res.length;mark();}}
  else if(k==='Enter'){e.preventDefault();go(sel);}}
function open(){
  if(pal)return;prev=document.activeElement;all=items();sel=0;
  inp=h('input',{type:'text',role:'combobox','aria-expanded':'true','aria-controls':'tz-pal-list','aria-label':sp('sp.pal.ph'),placeholder:sp('sp.pal.ph'),dir:'auto',autocomplete:'off',oninput:function(){sel=0;render();},onkeydown:key});
  ul=h('ul',{id:'tz-pal-list',role:'listbox'});
  pal=h('div',{class:'tz-pal',role:'dialog','aria-modal':'true','aria-label':sp('sp.pal.ph'),onclick:function(e){if(e.target===pal)close();}},h('div',{class:'tz-pal-box'},inp,ul));
  document.body.appendChild(pal);render();inp.focus();
}
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&(e.key==='k'||e.key==='K')){e.preventDefault();if(pal)close();else open();}});
T.register('palette',{open:open,close:close,find:function(qs){return find(qs,items());}});
})(window.Taraz=window.Taraz||{});