/* Tarāz — clipboard: copyWord/copyPpt/copyPlain, rich-copy fallbacks, safe download */
(function(T){
var K={ok:'clip.ok.rich',okFallback:'clip.ok.fallback',okPlain:'clip.ok.plain',empty:'clip.err.empty',missing:'clip.err.missing',denied:'clip.err.denied',failed:'clip.err.failed',dlOk:'clip.dl.ok',dlFallback:'clip.dl.fallback',dlFailed:'clip.dl.failed'},denied=false;
function get(n){return T.has&&T.has(n)?T.get(n):null}
function tt(k){try{return T.t?T.t(k):k}catch(e){return k}}
function R(ok,code,x){var r=Object.assign({ok:ok,code:code,message:tt(K[code])},x||{});
 if(r.risky)r.message+=' '+tt('clip.warn.risky');
 try{if(T.emit)T.emit('clipboard',r)}catch(e){}
 return r}
/** engine.safety summary when risky (error-level) characters exist, else null */
function risk(text){var S=get('engine.safety');if(!S||!text)return null;
 try{var m=S.summary(S.scan(text));return m&&m.errors?m:null}catch(e){return null}}
function wrapDoc(f){return'<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><!--StartFragment-->'+f+'<!--EndFragment--></body></html>'}
function legacyText(t){try{var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;left:-9999px;opacity:0';
 document.body.appendChild(a);a.select();var ok=document.execCommand('copy');a.parentNode.removeChild(a);return ok?'selection':null}catch(e){return null}}
function legacyRich(html){var div=null,ok=false;
 try{var doc=new DOMParser().parseFromString(html,'text/html'),sel=window.getSelection(),old=[],i,rg;
  div=document.createElement('div');div.style.cssText='position:fixed;top:0;left:-9999px;white-space:pre-wrap';
  Array.prototype.slice.call(doc.body.childNodes).forEach(function(n){div.appendChild(document.importNode(n,true))});
  document.body.appendChild(div);
  for(i=0;i<sel.rangeCount;i++)old.push(sel.getRangeAt(i));
  rg=document.createRange();rg.selectNodeContents(div);sel.removeAllRanges();sel.addRange(rg);
  ok=document.execCommand('copy');sel.removeAllRanges();old.forEach(function(r){sel.addRange(r)})}catch(e){ok=false}
 if(div&&div.parentNode)div.parentNode.removeChild(div);
 return ok?'selection':null}
function writeText(t){var cb=typeof navigator!=='undefined'&&navigator.clipboard;
 if(cb&&cb.writeText)return cb.writeText(t).then(function(){return'async'},function(e){if(e&&e.name==='NotAllowedError')denied=true;return legacyText(t)});
 return Promise.resolve(legacyText(t))}
function writeRich(html,plain){var cb=typeof navigator!=='undefined'&&navigator.clipboard,CI=typeof ClipboardItem!=='undefined'?ClipboardItem:null;
 var fb=function(){return Promise.resolve(legacyRich(html))};
 if(cb&&cb.write&&CI){
  try{return cb.write([new CI({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([plain],{type:'text/plain'})})])
   .then(function(){return'async'},function(e){if(e&&e.name==='NotAllowedError')denied=true;return fb()})}catch(e){return fb()}}
 return fb()}
function rich(r,s,target){
 return Promise.resolve().then(function(){var Z=get('serialize');
  if(!Z)return R(false,'missing');
  if(!r||!r.blocks||!r.blocks.length)return R(false,'empty');
  var html=wrapDoc(Z.toHTML(r,s,target)),plain=Z.toPlain(r,s),rk=risk(plain)||risk(html);
  denied=false;
  return writeRich(html,plain).then(function(m){
   return m?R(true,m==='async'?'ok':'okFallback',{method:m,target:target,risky:rk}):R(false,denied?'denied':'failed',{risky:rk,fallbackText:plain})})
 }).catch(function(e){return R(false,'failed',{error:String(e)})})}
/** Each copy* returns Promise<{ok,code,message,method?,risky?,fallbackText?}>; never rejects */
function copyWord(r,s){return rich(r,s,'word')}
function copyPpt(r,s){return rich(r,s,'ppt')}
function copyPlain(r,s){
 return Promise.resolve().then(function(){var Z=get('serialize');
  if(!Z)return R(false,'missing');
  if(!r||!r.blocks||!r.blocks.length)return R(false,'empty');
  var plain=Z.toPlain(r,s),rk=risk(plain);denied=false;
  return writeText(plain).then(function(m){return m?R(true,'okPlain',{method:m,risky:rk}):R(false,denied?'denied':'failed',{risky:rk,fallbackText:plain})})
 }).catch(function(e){return R(false,'failed',{error:String(e)})})}
/** Save text/Blob as a file; in sandboxed hosts (no downloads) falls back to copying the text */
function download(name,content,mime){
 name=String(name||'taraz.txt').replace(/[\\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,80)||'taraz.txt';
 var text=typeof content==='string'?content:null,sandbox=false;
 try{sandbox=window.self!==window.top&&window.location.origin==='null'}catch(e){sandbox=true}
 try{if(sandbox)throw new Error('sandbox');
  var blob=content instanceof Blob?content:new Blob([content],{type:(mime||'text/plain')+';charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();
  setTimeout(function(){if(a.parentNode)a.parentNode.removeChild(a);URL.revokeObjectURL(url)},1500);
  return Promise.resolve(R(true,'dlOk',{name:name}))}
 catch(e){if(text==null)return Promise.resolve(R(false,'dlFailed'));
  return writeText(text).then(function(m){return m?R(true,'dlFallback',{method:m,fallback:'copy',name:name}):R(false,'dlFailed',{fallbackText:text})})}}
/** kind: 'html' (standalone page) | 'md' | 'txt' */
function exportFile(r,s,kind){var Z=get('serialize');
 if(!Z||!r||!r.blocks)return Promise.resolve(R(false,Z?'empty':'missing'));
 try{if(kind==='md')return download('taraz.md',Z.toMarkdown(r,s),'text/markdown');
  if(kind==='txt'){var p=Z.toPlain(r,s);return download('taraz.txt',p,'text/plain').then(function(x){x.risky=risk(p);return x})}
  return download('taraz.html',Z.toHTML(r,s,'page'),'text/html')}catch(e){return Promise.resolve(R(false,'failed',{error:String(e)}))}}
T.register('clipboard',{copyWord:copyWord,copyPpt:copyPpt,copyPlain:copyPlain,download:download,exportFile:exportFile,wrapDoc:wrapDoc,risk:risk,writeText:writeText});
})(window.Taraz=window.Taraz||{});