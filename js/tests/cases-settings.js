// Tarāz tests: presets vs registry, section mapping, palette, settings JSON round-trip.
(function(T){
'use strict';
function C(id,name,fn){return{id:'settings.'+id,group:'settings-ui',name:name,run:fn,fn:fn,expect:true};}
T.addTests([
 C('preset-ids','built-in presets reference only registered option ids',function(){
  var P=T.get('presets'),m={},bad=[];if(!P)return'presets missing';
  T.options().forEach(function(o){m[o.id]=1;});
  P.BUILT.forEach(function(p){Object.keys(p.values).forEach(function(k){if(!m[k])bad.push(p.id+'.'+k);});});
  return bad.length?'unknown ids: '+bad.join(', '):true;}),
 C('preset-values','built-in preset values pass option validation',function(){
  var P=T.get('presets'),st,bad=[];if(!P)return'presets missing';st=T.get('settings').create(T.options);
  P.BUILT.forEach(function(p){Object.keys(p.values).forEach(function(k){var r=st.coerce(k,p.values[k]);if(r.ok===false&&T.options().some(function(o){return o.id===k;}))bad.push(p.id+'.'+k+'='+p.values[k]);});});
  return bad.length?'invalid: '+bad.join(', '):true;}),
 C('roundtrip','settings export/import round-trip',function(){
  var S=T.get('settings'),a=S.create(T.options),b=S.create(T.options),o=T.options().filter(function(x){return x.type==='segmented'&&x.options&&x.options.length>1;})[0],v;
  if(!o)return true;v=o.options.filter(function(c){return c.v!==o.def;})[0].v;a.set(o.id,v);
  return b.importJSON(a.exportJSON()).ok&&b.get(o.id)===v?true:'value lost for '+o.id;}),
 C('sections','sectionOf maps known option ids',function(){
  var X=T.get('ui.settings'),e={digProse:'digits',pcMarks:'digits',zwFix:'spacing',spMode:'spacing',dirMode:'direction',fnPair:'fonts',clArabic:'cleanup',protection:'protect',ptStrategy:'output',theme:'advanced'},bad=[];
  if(!X)return'ui.settings missing';
  Object.keys(e).forEach(function(k){var g=X.sectionOf({id:k,group:''});if(g!==e[k])bad.push(k+'->'+g);});
  return bad.length?bad.join(', '):true;}),
 C('rows','every registered option has a panel row',function(){
  var X=T.get('ui.settings'),ids,bad;if(!X)return'ui.settings missing';ids=X.rowIds();if(!ids.length)return'panel not mounted';
  bad=T.options().filter(function(o){return ids.indexOf(o.id)<0;}).map(function(o){return o.id;});return bad.length?'missing rows: '+bad.join(', '):true;}),
 C('palette','palette finds options by id',function(){
  var P=T.get('palette'),r;if(!P)return'palette missing';r=P.find('digProse');
  return r.some(function(x){return x.kind==='opt';})?true:'no option hit';})
]);
})(window.Taraz=window.Taraz||{});