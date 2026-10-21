// Tarāz UI smoke tests.
(function(T){
'use strict';
function tc(id,name,fn){return{id:'ui.'+id,group:'ui',name:name,run:fn,fn:fn,expect:fn};}
T.addTests([
tc('boot','shell mounts (bench, preset slot, drawer mount)',function(){var U=T.get('ui');return!!(U&&document.querySelector('.tz-bench')&&document.getElementById('tz-preset-slot')&&document.getElementById('tz-drawer-body'))||'shell missing';}),
tc('tabs','built-in tabs registered',function(){var ids=T.get('ui').tabIds();return['preview','xray','diff','formulas','safety'].every(function(i){return ids.indexOf(i)>=0;})||ids.join();}),
tc('degrade','compute degrades without engine and on engine errors',function(){
  var U=T.get('ui'),a=U.compute('x',{},null),b=U.compute('x',{},{process:function(){throw new Error('boom');}});
  return(a.ok===false&&a.msg&&b.ok===false&&/boom/.test(b.msg))||'bad degrade';}),
tc('counts','editor counts chars, words, paragraphs',function(){var c=T.get('ui.editor').count('سلام دنیا\n\nhello');return(c.chars===16&&c.words===3&&c.paragraphs===2)||JSON.stringify(c);}),
tc('limits','empty text counts are zero',function(){var c=T.get('ui.editor').count('');return(c.chars===0&&c.words===0&&c.paragraphs===0)||JSON.stringify(c);})
]);
})(window.Taraz=window.Taraz||{});