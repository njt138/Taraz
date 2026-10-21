// Tarāz presets: built-in and user presets, apply/export/import, visual cards with before/after, header selector.
(function(T){
'use strict';
var h=T.h,UK='taraz.presets.v1',sp=function(k,f){return T.sp?T.sp(k,f):(f!=null?f:k);};
function St(){return T.get('settings');}
function opts(){return T.options?T.options():[];}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
var BUILT=[
{id:'thesis',values:{digProse:'fa',digTech:'lat',pcMarks:'fa',pcQuotes:'guillemets',clArabic:true,clTatweel:true,clJunk:true,clSpaces:true,zwFix:true,zwRepair:true,zwConvert:'all',spMode:'zwnj',spPunct:true,fnPair:'thesis',outJustify:true,protection:'balanced'}},
{id:'report',values:{digProse:'fa',digTech:'lat',pcMarks:'fa',pcQuotes:'guillemets',clArabic:true,clJunk:true,clSpaces:true,zwFix:true,zwRepair:true,zwConvert:'all',spMode:'zwnj',fnPair:'office',outJustify:false,protection:'aggressive'}},
{id:'slide',values:{digProse:'fa',digHeading:'inherit',clArabic:true,clMarkdown:true,clJunk:true,clSpaces:true,zwFix:true,zwConvert:'all',spMode:'zwnj',pcMarks:'fa',pcEllipsis:'char',pcDashes:'smart',fnPair:'modern',outJustify:false}},
{id:'email',values:{digProse:'fa',clArabic:true,clMarkdown:true,clJunk:true,clSpaces:true,zwFix:true,zwConvert:'all',spMode:'zwnj',pcMarks:'fa',fnPair:'clean',outJustify:false,outListNum:'text'}},
{id:'chat',values:{digProse:'keep',digTech:'keep',clArabic:true,clEmoji:false,clMarkdown:false,clJunk:true,clSpaces:true,zwFix:true,zwConvert:'keep',spMode:'off',pcMarks:'keep',pcQuotes:'keep',fnPair:'none',outListNum:'text'}},
{id:'minimal',values:{clArabic:false,clTatweel:false,clMarkdown:false,clEmoji:false,clNbsp:false,clJunk:true,clSpaces:false,clJoin:false,clDiacritics:'off',clQuotes:'keep',clTabs:'keep',zwFix:true,zwRepair:false,zwConvert:'keep',spMode:'off',spPunct:false,digProse:'keep',digTech:'keep',pcMarks:'keep',pcQuotes:'keep',pcPercent:'keep',pcEllipsis:'keep',pcDashes:'keep',outJustify:false}},
{id:'max',values:{clArabic:true,clTatweel:true,clMarkdown:true,clEmoji:true,clNbsp:true,clJunk:true,clSpaces:true,clJoin:true,clDiacritics:'harakat',clQuotes:'guillemets',zwFix:true,zwRepair:true,zwConvert:'everywhere',spMode:'zwnj',spPunct:true,digProse:'fa',digTech:'lat',pcMarks:'fa',pcQuotes:'guillemets',pcEllipsis:'char',pcDashes:'spaced',protection:'aggressive'}}
].map(function(p){p.name='sp.pr.'+p.id+'.name';p.desc='sp.pr.'+p.id+'.desc';return p;});
function user(){var a=T.lsGet(UK,[]);return Array.isArray(a)?a.filter(function(p){return p&&typeof p.id==='string'&&typeof p.name==='string'&&p.values&&typeof p.values==='object';}):[];}
function put(a){T.lsSet(UK,a);T.emit('presets:changed',{});}
/** All presets: built-ins then user presets ({user:true}). */
function list(){return BUILT.concat(user().map(function(p){return{id:p.id,name:p.name,desc:'',values:p.values,user:true};}));}
function get(id){return list().filter(function(p){return p.id===id;})[0]||null;}
function title(p){return p.user?p.name:sp(p.name,p.id);}
function desc(p){return p.user?'':sp(p.desc,'');}
function clean(v){var m={},r={};opts().forEach(function(o){m[o.id]=1;});Object.keys(v||{}).forEach(function(k){if(m[k])r[k]=v[k];});return r;}
function note(ctx,m,k){var u=T.get('ui');if(ctx&&ctx.toast)ctx.toast(m,k);else if(u&&u.toast)u.toast(m,k);}
function load(vals){var S=St(),nv={};if(!S)return{ok:false};
  opts().forEach(function(o){if(o.affects==='view'&&S.isModified(o.id))nv[o.id]=S.get(o.id);});
  Object.assign(nv,clean(vals));return S.importJSON(JSON.stringify(nv));}
/** Apply a preset by id (view options such as theme are kept). */
function apply(id){var p=get(id);return p?load(p.values):{ok:false};}
function resetAll(){return load({});}
/** Id of the preset equal to the current settings, or null. */
function current(){var S=St(),ps=list(),i,v;if(!S)return null;
  function eq(o){return o.affects==='view'||same(S.get(o.id),o.id in v?v[o.id]:o.def);}
  for(i=0;i<ps.length;i++){v=clean(ps[i].values);if(opts().every(eq))return ps[i].id;}
  return null;}
function saveUser(name){var S=St(),v={},a=user(),p;name=String(name||'').trim().slice(0,60);if(!S||!name)return null;
  S.modified().forEach(function(id){var o=opts().filter(function(x){return x.id===id;})[0];if(o&&o.affects!=='view')v[id]=S.get(id);});
  p={id:'u'+Date.now().toString(36),name:name,values:v};a.push(p);put(a);return p;}
function renameUser(id,name){name=String(name||'').trim().slice(0,60);if(!name)return false;
  put(user().map(function(p){if(p.id===id)p.name=name;return p;}));return true;}
function deleteUser(id){put(user().filter(function(p){return p.id!==id;}));}
function saveFile(name,text){var C=T.get('clipboard'),a;
  if(C&&C.download)return C.download(name,text,'application/json');
  a=h('a',{href:URL.createObjectURL(new Blob([text],{type:'application/json'})),download:name});
  document.body.appendChild(a);a.click();a.remove();return Promise.resolve({ok:true});}
function exportFile(){var S=St();return S?saveFile('taraz-settings.json',S.exportJSON()):Promise.resolve({ok:false});}
/** Opens a file dialog and imports a settings JSON. */
function pickImport(ctx){var i=h('input',{type:'file',accept:'.json,application/json'});
  i.onchange=function(){var f=i.files&&i.files[0];if(!f||!St())return;
    f.text().then(function(x){var r=St().importJSON(x);
      note(ctx,r.ok?sp('sp.importOk').replace('%n',T.fa?T.fa(r.applied):r.applied):sp('sp.importBad'),r.ok?'ok':'err');});};
  i.click();}
function preview(p){var E=T.get('engine'),Z=T.get('serialize'),S=St(),v;if(!E||!Z||!S)return'';
  try{v=Object.assign(S.defaults(),clean(p.values));return Z.toPlain(E.process(sp('sp.s.preset'),v),v).replace(/[\u200e\u200f]/g,'');}catch(e){return'';}}
/** Renders preset cards, user presets, import/export/reset and the privacy note into box. */
function mountCards(box,ctx){
  var cache={};
  function card(p,cur){var on=cur===p.id,pv=cache[p.id]!=null?cache[p.id]:(cache[p.id]=preview(p));
    return h('button',{type:'button',class:'tz-card'+(on?' on':''),'data-id':p.id,'aria-pressed':String(on),onclick:function(){
        var r=apply(p.id);note(ctx,r.ok?sp('sp.pr.applied')+': '+title(p):sp('sp.importBad'),r.ok?'ok':'err');}},
      h('b',null,title(p)),h('small',null,desc(p)||(p.user?sp('sp.pr.mine'):'')),
      h('span',{class:'tz-ba'},h('span',{class:'b',dir:'rtl'},sp('sp.s.preset')),h('span',{class:'a',dir:'rtl'},pv)));}
  function render(){
    var cur=current(),us=user(),nm=h('input',{type:'text',class:'tz-txt',maxlength:'60',dir:'auto',placeholder:sp('sp.pr.name'),'aria-label':sp('sp.pr.name')});
    function add(){if(saveUser(nm.value))note(ctx,sp('sp.pr.saved'),'ok');}
    nm.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();add();}};
    box.textContent='';
    box.append(h('div',{class:'tz-cards'},BUILT.map(function(p){return card(p,cur);})));
    if(us.length)box.append(h('h4',{class:'tz-sub'},sp('sp.pr.mine')),h('div',{class:'tz-cards'},us.map(function(x){
      var p=get(x.id);if(!p)return'';
      return h('div',{class:'tz-ucard'},card(p,cur),h('div',{class:'tz-uact'},
        h('button',{type:'button',class:'tz-btn',onclick:function(){var n=prompt(sp('sp.pr.rename'),p.name);if(n)renameUser(p.id,n);}},sp('sp.pr.rename')),
        h('button',{type:'button',class:'tz-btn',onclick:function(){if(confirm(sp('sp.pr.delAsk')))deleteUser(p.id);}},sp('sp.pr.del'))));})));
    box.append(h('div',{class:'tz-io'},nm,h('button',{type:'button',class:'tz-btn',onclick:add},sp('sp.pr.save'))),
      h('div',{class:'tz-io'},
        h('button',{type:'button',class:'tz-btn',onclick:exportFile},sp('sp.export')),
        h('button',{type:'button',class:'tz-btn',onclick:function(){pickImport(ctx);}},sp('sp.import')),
        h('button',{type:'button',class:'tz-btn',onclick:function(){resetAll();note(ctx,sp('sp.resetDone'),'ok');}},sp('sp.resetAll'))),
      h('p',{class:'tz-priv'},sp('sp.privacy')));}
  function mark(){var cur=current();[].forEach.call(box.querySelectorAll('.tz-card'),function(b){var on=b.getAttribute('data-id')===cur;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});}
  render();
  T.on('presets:changed',render);
  T.on('options:changed',function(){cache={};render();});
  T.on('settings:changed',T.debounce(mark,100));
  return{update:render};
}
function mountSelector(slot,ctx){
  var lbl=h('span',{class:'l'}),menu=null,btn,wrap;
  function upd(){var c=current(),p=c&&get(c);lbl.textContent=sp('sp.pr.current')+': '+(p?title(p):sp('sp.pr.custom'));}
  function close(){if(menu){menu.remove();menu=null;btn.setAttribute('aria-expanded','false');}}
  function toggle(){
    if(T.popover&&typeof T.popover.open==='function'){
      var cur=current();
      var items=list().map(function(p){
        return {
          label: title(p),
          checked: cur===p.id,
          onSelect: function(){
            var r=apply(p.id);
            note(ctx,r.ok?sp('sp.pr.applied')+': '+title(p):sp('sp.importBad'),r.ok?'ok':'err');
          }
        };
      });
      items.push({sep:true});
      items.push({
        label: sp('sp.pr.manage'),
        onSelect: function(){
          var s=T.get('ui.settings');
          if(s)s.reveal('presets');
        }
      });
      T.popover.open({trigger:btn,items:items,preferDir:'down'});
      return;
    }
    if(menu)return close();
    menu=h('div',{class:'tz-menu',role:'menu'},list().map(function(p){return h('button',{type:'button',role:'menuitem',onclick:function(){close();
        var r=apply(p.id);note(ctx,r.ok?sp('sp.pr.applied')+': '+title(p):sp('sp.importBad'),r.ok?'ok':'err');}},title(p));}),
      h('button',{type:'button',role:'menuitem',class:'tz-mi-manage',onclick:function(){close();var s=T.get('ui.settings');if(s)s.reveal('presets');}},sp('sp.pr.manage')));
    wrap.appendChild(menu);btn.setAttribute('aria-expanded','true');
  }
  btn=h('button',{type:'button',class:'tz-btn tz-prbtn','aria-haspopup':'menu','aria-expanded':'false',onclick:toggle},T.icon('sample',18),lbl,T.icon('chev',14));
  wrap=h('div',{class:'tz-menuwrap'},btn);
  document.addEventListener('click',function(e){if(menu&&!wrap.contains(e.target))close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu){close();btn.focus();}});
  slot.textContent='';slot.appendChild(wrap);upd();
  T.on('settings:changed',T.debounce(upd,100));T.on('presets:changed',upd);
}
T.register('presets',{BUILT:BUILT,list:list,get:get,title:title,apply:apply,resetAll:resetAll,current:current,saveUser:saveUser,renameUser:renameUser,deleteUser:deleteUser,exportFile:exportFile,pickImport:pickImport,mountCards:mountCards,mountSelector:mountSelector});
})(window.Taraz=window.Taraz||{});