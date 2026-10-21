// Tarāz engine/safety: finds characters Office renders as boxes (or that distort layout) in text bound for Word/PowerPoint.
(function(T){
'use strict';
var C=T.C,Z=C.ZWNJ,ERR={},
 W={LRE:'Left-to-right embedding',RLE:'Right-to-left embedding',PDF:'Pop directional formatting',LRO:'Left-to-right override',
  RLO:'Right-to-left override (can visually reverse text)',LRI:'Left-to-right isolate',RLI:'Right-to-left isolate',FSI:'First-strong isolate',
  PDI:'Pop directional isolate',ZWSP:'Zero-width space',BOM:'Byte-order mark / zero-width no-break space'},
 ZW={edge:'ZWNJ at the start or end of a line has no effect and may show as a stray mark.',
  space:'ZWNJ next to a space is meaningless; use a plain space or remove it.',double:'Repeated ZWNJ; one is enough.'},
 BRK=/[\n\r\u2028\u2029]/;
C.UNSAFE_IN_OFFICE.forEach(function(n){ERR[C.CHAR[n]]=n;});
var ERRRE=new RegExp('['+Object.keys(ERR).join('')+']','g');

function hex(c){return 'U+'+('0000'+c.charCodeAt(0).toString(16).toUpperCase()).slice(-4);}
function zkind(s,i){
 var p=s.charAt(i-1),q=s.charAt(i+1);
 if(!p||!q||BRK.test(p)||BRK.test(q))return 'edge';
 if(/\s/.test(p)||/\s/.test(q))return 'space';
 return p===Z||q===Z?'double':null;
}
/** scan(text) -> [{index,line,col,char,code:'U+2066',name,severity:'error'|'warn',kind,key,explain}] in text order. */
function scan(text){
 var s=typeof text==='string'?text:'',out=[],line=1,ls=0,i,c,n,k;
 for(i=0;i<s.length;i++){
  c=s.charAt(i);
  if(c==='\r'&&s.charAt(i+1)==='\n')continue;
  if(BRK.test(c)){line++;ls=i+1;continue;}
  if(ERR[c]){n=ERR[c];out.push({index:i,line:line,col:i-ls+1,char:c,code:hex(c),name:n,severity:'error',
   kind:n==='ZWSP'||n==='BOM'?'invisible':'bidi',key:'safety.'+n,explain:W[n]+': Office may draw it as a box or break layout. Remove it.'});}
  else if(c===Z&&(k=zkind(s,i)))out.push({index:i,line:line,col:i-ls+1,char:c,code:hex(c),name:'ZWNJ',severity:'warn',kind:k,key:'safety.zwnj.'+k,explain:ZW[k]});
 }
 return out;
}
/** isOfficeSafe(text, strict?) -> true when no box-causing characters (strict: also no stray ZWNJ). */
function isOfficeSafe(text,strict){
 var r=scan(text);
 return strict?!r.length:!r.some(function(x){return x.severity==='error';});
}
/** strip(text) -> text without box-causing characters (ZWNJ, RLM, LRM kept). */
function strip(text){return String(text==null?'':text).replace(ERRRE,'');}
/** summary(list) -> {total,errors,warnings,byName}. For the UI badge. */
function summary(list){
 var r={total:list.length,errors:0,warnings:0,byName:{}};
 list.forEach(function(x){r[x.severity==='error'?'errors':'warnings']++;r.byName[x.name]=(r.byName[x.name]||0)+1;});
 return r;
}
/** scanResult(result) -> scan of the logical source of a Result (needs engine.toSource). */
function scanResult(res){var E=T.get('engine');return E&&E.toSource&&res?scan(E.toSource(res.blocks)):[];}

T.register('engine.safety',{scan:scan,isOfficeSafe:isOfficeSafe,strip:strip,summary:summary,scanResult:scanResult});
})(window.Taraz=window.Taraz||{});