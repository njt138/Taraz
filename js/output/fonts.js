/* Tarāz — fonts: lists, curated pairs, option defs, resolve(), isInstalled() */
(function(T){
var FA=['Vazirmatn','B Nazanin','B Mitra','B Zar','B Titr','B Lotus','B Yekan','IRANSans','Sahel','Shabnam','Samim','Tanha','Noto Naskh Arabic','Noto Sans Arabic','Tahoma','Segoe UI','Arial','Times New Roman'];
var EN=['Times New Roman','Calibri','Cambria','Arial','Segoe UI','Georgia','Garamond','Verdana','Consolas','Roboto','Inter','Helvetica','Cambria Math'];
var set=function(s){var o={};s.split(',').forEach(function(x){o[x]=1});return o};
var SERIF=set('Times New Roman,Cambria,Georgia,Garamond,Cambria Math,B Nazanin,B Mitra,B Zar,B Lotus,Noto Naskh Arabic'),MONO=set('Consolas,Courier New');
var PAIRS=[
{id:'thesis',fa:'B Nazanin',en:'Times New Roman',faSize:14,enSize:12},
{id:'journal',fa:'B Zar',en:'Times New Roman',faSize:13,enSize:12},
{id:'modern',fa:'Vazirmatn',en:'Calibri',faSize:11,enSize:11},
{id:'office',fa:'Tahoma',en:'Arial',faSize:11,enSize:11},
{id:'clean',fa:'Sahel',en:'Roboto',faSize:11,enSize:11},
{id:'literary',fa:'Noto Naskh Arabic',en:'Georgia',faSize:13,enSize:11}];
var FD={fnPair:'none',fnFa:'Tahoma',fnFaSize:12,fnEn:'Arial',fnEnSize:12,fnCode:'',fnCodeSize:0,fnMath:'',fnCustomFa:'',fnCustomEn:''};
var NOTE='font.note.notEmbedded',cv=null,cache=Object.create(null);
var ol=function(a){return a.map(function(n){return{v:n,label:n}})};
var op=function(id,type,x){return Object.assign({id:id,group:'fonts',label:id,help:'',type:type,def:FD[id],level:'basic',affects:'output'},x)};
var OPTS=[
op('fnPair','select',{options:[{v:'none',label:'—'}].concat(PAIRS.map(function(p){return{v:p.id,label:p.fa+' + '+p.en}}))}),
op('fnFa','select',{options:ol(FA)}),op('fnFaSize','slider',{min:8,max:40,step:0.5}),
op('fnEn','select',{options:ol(EN)}),op('fnEnSize','slider',{min:8,max:40,step:0.5}),
op('fnCode','select',{level:'pro',options:[{v:'',label:'auto'}].concat(ol(EN))}),
op('fnCodeSize','slider',{level:'pro',min:0,max:40,step:0.5}),
op('fnMath','select',{level:'pro',options:[{v:'',label:'auto'}].concat(ol(EN))}),
op('fnCustomFa','text',{level:'pro'}),op('fnCustomEn','text',{level:'pro'})];
if(T.defineOptions)T.defineOptions(OPTS);
function name(s){return String(s==null?'':s).replace(/[^\w \-.\u0600-\u06FF]/g,'').replace(/\s+/g,' ').trim().slice(0,60)}
function num(v,d,lo,hi){v=parseFloat(v);return isFinite(v)?Math.min(hi,Math.max(lo,v)):d}
function gen(n){return MONO[n]?'monospace':SERIF[n]?'serif':'sans-serif'}
/** CSS font-family stack for a font name; kind: fa|en|code|math */
function stack(n,kind){var seen={},tail=kind==='fa'?['Tahoma','Arial']:kind==='code'?['Consolas','Courier New']:kind==='math'?['Cambria Math','Cambria']:[SERIF[n]?'Times New Roman':'Arial'];
 var a=[n].concat(tail).filter(function(x){return seen[x]?false:(seen[x]=1)});
 return a.map(function(x){return"'"+x+"'"}).join(',')+','+(kind==='code'?'monospace':kind==='math'?'serif':gen(n))}
/** settings -> {fa,en,code,math,faSize,enSize,codeSize,mathSize,faStack,enStack,codeStack,mathStack,pair} */
function resolve(S){S=Object.assign({},FD,S||{});
 var p=PAIRS.filter(function(x){return x.id===S.fnPair})[0];
 var fa=name(S.fnCustomFa)||(p?p.fa:name(S.fnFa))||'Tahoma',en=name(S.fnCustomEn)||(p?p.en:name(S.fnEn))||'Arial';
 var fs=p?p.faSize:num(S.fnFaSize,12,6,96),es=p?p.enSize:num(S.fnEnSize,12,6,96);
 var code=name(S.fnCode)||'Consolas',math=name(S.fnMath)||'Cambria Math';
 return{fa:fa,en:en,code:code,math:math,faSize:fs,enSize:es,codeSize:num(S.fnCodeSize,0,0,96)||es,mathSize:es,
  faStack:stack(fa,'fa'),enStack:stack(en,'en'),codeStack:stack(code,'code'),mathStack:stack(math,'math'),pair:p?p.id:'none'}}
/** canvas width test; true|false, or null when canvas is unavailable */
function isInstalled(n){n=name(n);if(!n)return false;if(n in cache)return cache[n];
 var r=null;
 try{if(typeof document!=='undefined'){cv=cv||document.createElement('canvas');var c=cv.getContext('2d');
  if(c){var t='mmmmmmmmmmlliWW \u0633\u0644\u0627\u0645 \u0641\u0627\u0631\u0633\u06CC 0123',w;
   r=['monospace','serif','sans-serif'].some(function(b){c.font='72px '+b;w=c.measureText(t).width;c.font="72px '"+n+"',"+b;return Math.abs(c.measureText(t).width-w)>0.01})}}}catch(e){r=null}
 return(cache[n]=r)}
function check(S){var r=resolve(S);return[['fa',r.fa],['en',r.en],['code',r.code],['math',r.math]].map(function(p){return{role:p[0],name:p[1],installed:isInstalled(p[1])}})}
function note(){try{return T.t?T.t(NOTE):NOTE}catch(e){return NOTE}}
T.register('fonts',{FA:FA,EN:EN,PAIRS:PAIRS,defaults:FD,NOTE_KEY:NOTE,resolve:resolve,stack:stack,name:name,isInstalled:isInstalled,check:check,note:note});
})(window.Taraz=window.Taraz||{});