/* Tarāz DOCX export: Result.blocks -> .docx (lazy docx@8.5.0; formulas as native OMML via export.omml). T.get('export.docx'). */
(function(T){
'use strict';
var DOCX_URLS=['https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js','https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.js'],
 ZIP_URL='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
 MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 CREDIT='Built by Gholamreza Nejati Jahromi',
 BAD=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u200B\u202A-\u202E\u2066-\u2069\uFEFF\uFFFE\uFFFF]/g,
 RTL=/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]/, PDIG=/[\u06F0-\u06F9\u0660-\u0669]/, LAT=/[A-Za-z]/,
 NS_W='http://schemas.openxmlformats.org/wordprocessingml/2006/main', NS_M='http://schemas.openxmlformats.org/officeDocument/2006/math',
 HS=[2,1.6,1.35,1.2,1.1,1];
var FA={'docx.err.lib':'اتصال اینترنت لازم است برای بارگذاری کتابخانهٔ DOCX','docx.err.build':'ساخت فایل DOCX ناموفق بود','docx.err.empty':'ابتدا متن را پردازش کنید',
 'docx.ok':'فایل DOCX ساخته شد','docx.alt':'متن با قالب Word کپی شد؛ در Word جایگذاری کنید','docx.act':'دانلود DOCX','clip.dl.failed':'دانلود ناموفق بود',
 'docx.w.eq':'فرمول به‌صورت متن ساده درج شد: {n}','docx.w.omml':'مبدل فرمول (OMML) در دسترس نیست؛ فرمول‌ها متن ساده شدند','docx.w.risky':'{n} نویسهٔ کنترلی خطرناک حذف شد',
 'docx.w.listnum':'شماره‌گذاری فارسی لیست‌ها به‌صورت متن درج شد','docx.w.xml':'درج فرمول در سند ناموفق بود؛ متن ساده درج شد','docx.rep':'{a} فرمول بومی، {b} فرمول متنی',
 'docx.err.invalid':'ساختار فایل DOCX نامعتبر است'};
function tt(k,v){var s=T.t&&T.t(k);s=(s&&s!==k)?s:(FA[k]||k);return String(s).replace(/\{(\w+)\}/g,function(m,x){return v&&typeof v==='object'?v[x]:v})}
function clamp(n,a,b){n=+n||0;return n<a?a:n>b?b:n}
var libs={};
function loadLib(key,urls,get){
 if(libs[key])return libs[key];var i=0;
 function next(err){var g=get();if(g)return Promise.resolve(g);if(i>=urls.length)return Promise.reject(err||new Error('load failed'));
  var u=urls[i++];return Promise.resolve().then(function(){return T.loadScript(u)}).then(function(){return get()||next(new Error('global missing: '+u))},next)}
 var p=next();p.catch(function(){libs[key]=null});return (libs[key]=p)}
function getDocx(){var d=window.docx;return d&&d.Document&&d.Packer?d:null}
function fileName(d){d=d||new Date();var p=function(n){return(n<10?'0':'')+n};return 'taraz-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+'.docx'}
function fonts(S){var f=T.get('fonts'),r=null;try{r=f&&f.resolve(S)}catch(e){}r=r||{};
 return {fa:r.fa||'B Nazanin',en:r.en||'Times New Roman',code:r.code||'Consolas',math:r.math||'Cambria Math',faSize:+r.faSize||12,enSize:+r.enSize||12,codeSize:+r.codeSize||0,mathSize:+r.mathSize||0}}
function sideOf(s,b){return RTL.test(s)?'fa':LAT.test(s)?'en':(b&&b.dir==='rtl')?'fa':'en'}
function mkCtx(S,mm){var st={n:0,w:[],eq:{native:0,fallback:0,text:0}},SAF=T.get('engine.safety');
 return {S:S,st:st,mm:mm||{},clean:function(s,q){s=String(s==null?'':s).replace(/\r\n?/g,'\n');var m=s.match(BAD);
  if(m){if(!q){var sc=[];try{sc=SAF.scan(s).filter(function(e){return e.severity==='error'})}catch(e){}st.n+=Math.max(sc.length,m.length)}s=s.replace(BAD,'')}return s}}}
function plainOf(inls,c,q){return (inls||[]).map(function(x){return x&&!(x.meta&&x.meta.marker)&&x.k!=='math'?c.clean(x.s,q):''}).join('')}
function mathRuns(x,c){var m=c.mm[x.id],st=c.st;
 if(!m){st.eq.text++;return [{t:'t',s:c.clean(x.s),f:'math',rtl:false}]}
 (m.warns||[]).forEach(function(w){if(st.w.indexOf(w)<0)st.w.push(w)});
 if(m.kind==='xml'){st.eq.native++;return [{t:'x',xml:m.xml,alt:c.clean(m.alt||x.s)}]}
 st.eq[m.kind==='fb'?'fallback':'text']++;return [{t:'t',s:c.clean(m.s),f:'math',rtl:false}]}
function runsOf(inls,blk,c,fb){var out=[],B=false,It=false;
 (inls||[]).forEach(function(x){
  if(!x)return;var m=x.meta||{},k=x.k;
  if(m.marker&&(k==='b'||k==='i')){if(k==='b')B=!!m.on;else It=!!m.on;return}
  if(k==='math'){out.push.apply(out,mathRuns(x,c));return}
  var s=c.clean(x.s),f,rtl;
  if(k==='code'){f='code';rtl=false}
  else if(k==='ltr'||k==='num'){if(k==='num'&&PDIG.test(s)){f='fa';rtl=true}else{f='en';rtl=false}}
  else{f=sideOf(s,blk);rtl=f==='fa'}
  var base={t:'t',f:f,rtl:rtl,b:!!(B||fb||k==='b'),i:!!(It||k==='i'),code:k==='code'};
  if(k==='link'&&x.href&&/^https?:\/\//i.test(x.href))base.href=String(x.href);
  s.split('\n').forEach(function(seg,j){if(j)out.push({t:'br'});if(seg!=='')out.push(Object.assign({},base,{s:seg}))})});
 return out}
/** Pure: Result -> intermediate plan {title,blocks,st}. mm = prepMath() map. */
function plan(res,S,mm){
 S=S||{};var c=mkCtx(S,mm),P={title:'',blocks:[],st:c.st},ol=0,last=null,J=S.outJustify&&S.outJustify!=='off'&&S.outJustify!==false;
 function push(o){P.blocks.push(o);last=o}
 (res&&res.blocks||[]).forEach(function(b,bi){
  if(!b)return;var rtl=b.dir==='rtl',t=b.type,h=function(j){return {bidi:rtl,jc:j&&J?'both':(rtl?'start':'left'),dir:b.dir||'ltr'}};
  try{
   if(t==='h'){var lv=clamp(b.level||1,1,6);if(!P.title)P.title=plainOf(b.inlines,c,1).trim().slice(0,120);push(Object.assign(h(0),{kind:'h',level:lv,runs:runsOf(b.inlines,b,c,true)}))}
   else if(t==='code'){var ls=(b.inlines||[]).map(function(x){return c.clean(x.s)}).join('\n').replace(/\n$/,'').split('\n');
    ls.forEach(function(l,j){push({kind:'code',bidi:false,jc:'left',dir:'ltr',last:j===ls.length-1,runs:[{t:'t',s:l.replace(/\t/g,'    '),f:'code',rtl:false}]})})}
   else if(t==='math')push({kind:'math',bidi:false,jc:'center',dir:'ltr',runs:runsOf(b.inlines,b,c)});
   else if(t==='table'){var rows=b.rows||[],hd=rows.length>1,nc=0;rows.forEach(function(r){nc=Math.max(nc,r.length)});
    push({kind:'table',rtl:rtl,nc:nc,header:hd,rows:rows.map(function(r,ri){return r.map(function(cell){var tx=plainOf(cell,c,1),rt=rtl&&!(LAT.test(tx)&&!RTL.test(tx));
     return {bidi:rt,jc:rt?'start':'left',runs:runsOf(cell,{dir:rt?'rtl':'ltr'},c,hd&&ri===0)}})})})}
   else if(t==='li'){var ord=!!b.ordered,mk=b.marker?c.clean(b.marker,1):'',txt=S.outListNum==='text'?(!ord||!!mk):(ord&&PDIG.test(mk)),pre=[];
    if(ord&&PDIG.test(mk)&&S.outListNum!=='text'&&!c.st.lw){c.st.lw=1;c.st.w.push(tt('docx.w.listnum'))}
    if(ord&&!(last&&last.kind==='li'&&last.ordered))ol++;
    if(txt){var m2=ord?mk:'\u2022',sd=sideOf(m2,b);pre.push({t:'t',s:m2,f:sd,rtl:sd==='fa'},{t:'tab'})}
    if(b.task)pre.push({t:'t',s:b.checked?'\u2611 ':'\u2610 ',f:'en',rtl:false});
    push(Object.assign(h(1),{kind:'li',level:clamp(b.level||0,0,5),ordered:ord,text:txt,inst:ol,runs:pre.concat(runsOf(b.inlines,b,c))}))}
   else push(Object.assign(h(1),{kind:t==='quote'?'quote':'p',runs:runsOf(b.inlines,b,c)}))
  }catch(e){c.st.w.push('block '+bi+': '+(e&&e.message))}});
 if(!P.title)P.title='Taraz';return P}
/** Async: resolves every k:'math' inline (by Inline.id) to {kind:'xml'|'fb'|'lin'|'keep',...} using export.omml. opts.omml overrides. */
function prepMath(blocks,S,opts){
 opts=opts||{};var om=opts.omml||T.get('export.omml'),LIN=T.get('math.linear'),cache={},map={},jobs=[];
 function fb(tex){var s='';try{s=LIN&&LIN.convert?LIN.convert(tex).out:''}catch(e){}return s||String(tex).replace(/^\s*(?:\$\$|\$|\\\(|\\\[)\s*|\s*(?:\$\$|\$|\\\)|\\\])\s*$/g,'')}
 function wm(ws){return (ws||[]).map(function(w){var k='math.w.'+w.code,v=T.t&&T.t(k);return (v&&v!==k?v:w.code)+(w.arg?' ('+w.arg+')':'')})}
 function one(x,disp){var m=x.meta||{},fx=m.fx||{},mode=m.mode||fx.mode||'A',pl=null;
  try{pl=LIN&&LIN.text?LIN.text(x):null}catch(e){}
  if(typeof pl==='string')return Promise.resolve({kind:'lin',s:pl});
  if(mode==='keep'||mode==='B')return Promise.resolve({kind:'keep',s:x.s});
  var tex=fx.out||m.tex||x.s,key=(disp?'D':'I')+tex,sh=String(tex).slice(0,40);
  if(cache[key])return cache[key];
  if(!om||(om.isAvailable&&!om.isAvailable()))return (cache[key]=Promise.resolve({kind:'fb',s:fb(tex),warns:[tt('docx.w.omml')]}));
  return (cache[key]=Promise.resolve().then(function(){return om.fromLatex(tex,{display:!!disp})}).then(function(r){r=r||{};var ws=wm(r.warnings),v=r.ok&&r.xml?(om.validate?om.validate(r.xml):{ok:true}):{ok:false};
   return v&&v.ok?{kind:'xml',xml:r.xml,alt:r.fallbackText||fb(tex),warns:ws}:{kind:'fb',s:r.fallbackText||fb(tex),warns:ws.concat(tt('docx.w.eq',sh))}},
   function(){return {kind:'fb',s:fb(tex),warns:[tt('docx.w.eq',sh)]}}))}
 (blocks||[]).forEach(function(b){var ls=[b.inlines||[]];(b.rows||[]).forEach(function(r){(r||[]).forEach(function(cl){ls.push(cl||[])})});
  ls.forEach(function(l){l.forEach(function(x){if(x&&x.k==='math')jobs.push(one(x,b.type==='math').then(function(e){map[x.id]=e}))})})});
 return Promise.all(jobs).then(function(){return map})}
function render(D,P,S,R){
 var AT=D.AlignmentType,AL={start:AT.START||AT.LEFT,left:AT.LEFT,center:AT.CENTER,both:AT.BOTH},hp=function(pt){return Math.max(2,Math.round(pt*2))},out=[],st=P.st;
 function size(f,sc){var pt=f==='fa'?R.faSize:f==='en'?R.enSize:f==='code'?(R.codeSize||R.enSize*0.9):(R.mathSize||R.enSize);return hp(pt*(sc||1))}
 function font(f){var n=R[f];return {ascii:n,hAnsi:n,cs:n,eastAsia:n}}
 function tr(r,sc){var fa=r.f==='fa',sz=size(r.f,sc),o={text:r.s,font:font(r.f),size:sz,sizeComplexScript:sz,language:{value:fa?'fa-IR':'en-US',bidirectional:'fa-IR'}};
  if(r.rtl)o.rightToLeft=true;if(r.b){o.bold=true;o.boldComplexScript=true}if(r.i){o.italics=true;o.italicsComplexScript=true}
  if(r.code)o.shading={type:D.ShadingType.CLEAR,fill:'EDEDED',color:'auto'};
  if(r.href){o.color='0563C1';o.underline={type:D.UnderlineType.SINGLE}}
  return new D.TextRun(o)}
 function kid(r,sc){try{
  if(r.t==='x'){
   var comp=D.ImportedXmlComponent.fromXmlString(r.xml);
   return (comp&&comp.root&&comp.root[0])?comp.root[0]:comp;
  }
  if(r.t==='br')return new D.TextRun({break:1});
  if(r.t==='tab')return new D.TextRun({children:[new D.Tab()]});
  var t=tr(r,sc);return r.href?new D.ExternalHyperlink({children:[t],link:r.href}):t
 }catch(e){if(r.t!=='x')throw e;st.eq.native--;st.eq.fallback++;st.w.push(tt('docx.w.xml'));return tr({s:r.alt||'',f:'math',rtl:false})}}
 function pp(b,kids,x){var o={children:kids,alignment:AL[b.jc]||AT.LEFT,spacing:{after:120,line:300}};if(b.bidi)o.bidirectional=true;return new D.Paragraph(Object.assign(o,x))}
 var shade={type:D.ShadingType.CLEAR,fill:'F2F2F2',color:'auto'};
 P.blocks.forEach(function(b){var sc=b.kind==='h'?HS[b.level-1]:1,kids=b.runs?b.runs.map(function(r){return kid(r,sc)}):[];
  switch(b.kind){
  case 'h':out.push(pp(b,kids,{heading:D.HeadingLevel['HEADING_'+b.level],keepNext:true,spacing:{before:240,after:120}}));break;
  case 'li':out.push(pp(b,kids,Object.assign({spacing:{after:60,line:300}},b.text?{indent:{left:720+360*b.level,hanging:360}}:
   {numbering:Object.assign({reference:b.ordered?'tz-ol':'tz-ul',level:b.level},b.ordered?{instance:b.inst}:{})})));break;
  case 'quote':out.push(pp(b,kids,{indent:{left:567},border:{left:{style:D.BorderStyle.SINGLE,size:12,color:'999999',space:8}}}));break;
  case 'code':out.push(pp(b,kids,{shading:shade,spacing:{after:b.last?120:0,line:240}}));break;
  case 'math':out.push(pp(b,kids));break;
  case 'table':{var W=9638,nc=Math.max(1,b.nc),cw=Math.floor(W/nc),bd={style:D.BorderStyle.SINGLE,size:4,color:'808080'};
   var rows=b.rows.map(function(r,ri){var cells=[];
    for(var j=0;j<nc;j++){var cl=r[j]||{bidi:b.rtl,jc:b.rtl?'start':'left',runs:[]},hd=b.header&&ri===0;
     cells.push(new D.TableCell({width:{size:cw,type:D.WidthType.DXA},margins:{top:40,bottom:40,left:80,right:80},shading:hd?shade:undefined,
      children:[pp(cl,cl.runs.map(function(r){return kid(r,1)}),{spacing:{after:0,line:276}})]}))}
    return new D.TableRow({tableHeader:b.header&&ri===0?true:undefined,cantSplit:true,children:cells})});
   out.push(new D.Table({width:{size:cw*nc,type:D.WidthType.DXA},columnWidths:Array(nc).fill(cw),visuallyRightToLeft:b.rtl||undefined,
    borders:{top:bd,bottom:bd,left:bd,right:bd,insideHorizontal:bd,insideVertical:bd},rows:rows}));
   out.push(new D.Paragraph({spacing:{after:120},children:[]}));break}
  default:out.push(pp(b,kids))}});
 if(!out.length)out.push(new D.Paragraph({children:[]}));
 function levels(bul){var a=[];for(var i=0;i<6;i++)a.push({level:i,format:bul?D.LevelFormat.BULLET:D.LevelFormat.DECIMAL,text:bul?'\u2022':'%'+(i+1)+'.',alignment:AT.LEFT,style:{paragraph:{indent:{left:720+i*360,hanging:360}}}});return a}
 var def={document:{run:{font:{ascii:R.en,hAnsi:R.en,cs:R.fa,eastAsia:R.en},size:size('fa'),sizeComplexScript:size('fa'),language:{value:'en-US',bidirectional:'fa-IR'}}}};
 HS.forEach(function(m,i){def['heading'+(i+1)]={run:{font:font('fa'),size:size('fa',m),sizeComplexScript:size('fa',m),bold:true,color:'000000'},paragraph:{spacing:{before:240,after:120}}}});
 var foot=new D.Footer({children:[new D.Paragraph({alignment:AT.CENTER,children:[new D.TextRun({text:CREDIT,font:font('en'),size:18,sizeComplexScript:18,color:'666666',language:{value:'en-US'}})]})]});
 return new D.Document({creator:CREDIT,lastModifiedBy:CREDIT,title:P.title,description:'Taraz export',styles:{default:def},
  numbering:{config:[{reference:'tz-ol',levels:levels(0)},{reference:'tz-ul',levels:levels(1)}]},
  sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},footers:{default:foot},children:out}]})}
var last=null;
/** build + report: Promise<{blob,report,plan}>. opts (tests): lib, libLoader, omml. Rejects with err.code 'lib'|'build'. */
function buildReport(res,S,opts){opts=opts||{};S=S||{};
 var lib=opts.lib?Promise.resolve(opts.lib):(opts.libLoader?Promise.resolve().then(opts.libLoader):loadLib('docx',DOCX_URLS,getDocx));
 return lib.then(null,function(e){var x=new Error(tt('docx.err.lib'));x.code='lib';x.cause=e;throw x}).then(function(D){
  return prepMath(res&&res.blocks,S,opts).then(function(mm){var P=plan(res,S,mm);
   return D.Packer.toBlob(render(D,P,S,fonts(S))).then(function(b){var st=P.st,w=st.w.slice();if(st.n)w.push(tt('docx.w.risky',st.n));
    return {blob:new Blob([b],{type:MIME}),plan:P,report:{equationsNative:st.eq.native,equationsFallback:st.eq.fallback,equationsText:st.eq.text,stripped:st.n,warnings:w}}})})})
 .catch(function(e){if(!e.code){var x=new Error(tt('docx.err.build')+': '+(e&&e.message));x.code='build';x.cause=e;throw x}throw e})}
/** @returns {Promise<Blob>} */
function build(res,S,opts){return buildReport(res,S,opts).then(function(r){last=r.report;return r.blob})}
function anchorDl(name,blob){return new Promise(function(ok){try{var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);ok({ok:true})}catch(e){ok({ok:false,code:'dlFailed'})}})}
/** Build + download taraz-YYYYMMDD-HHMM.docx; on lib/download failure copies Word HTML instead. Never rejects. o: {clipboard,toast,now,+build opts} */
function downloadDocx(res,S,o){o=o||{};var U=T.get('ui'),CB=o.clipboard||T.get('clipboard'),toast=o.toast||function(m,k){try{U&&U.toast&&U.toast(m,k)}catch(e){}};
 S=S||(U&&U.state&&U.state.settings)||{};
 if(!res||!res.blocks||!res.blocks.length){toast(tt('docx.err.empty'),'warn');return Promise.resolve({ok:false,code:'empty'})}
 function alt(why,k,code,rep){return (CB&&CB.copyWord?Promise.resolve().then(function(){return CB.copyWord(res,S)}).catch(function(){return {ok:false}}):Promise.resolve({ok:false})).then(function(a){
  toast(why+(a&&a.ok?' — '+tt('docx.alt'):''),k);return {ok:false,code:code,alt:!!(a&&a.ok),report:rep}})}
 return buildReport(res,S,o).then(function(r){last=r.report;var rp=r.report,name=fileName(o.now),eq=rp.equationsNative+rp.equationsFallback+rp.equationsText;T.emit('ui:report',rp);
  return validateDocx(r.blob).catch(function(){return {ok:true}}).then(function(v){
   if(v&&v.ok===false){
    return alt(tt('docx.err.invalid')+' ('+(v.errors||[]).join(', ')+')','err','validate',rp);
   }
   var dl=CB&&CB.download?Promise.resolve().then(function(){return CB.download(name,r.blob,MIME)}):anchorDl(name,r.blob);
   return dl.catch(function(){return {ok:false}}).then(function(d){d=d||{};
    if(d.ok&&d.code!=='dlFallback'){toast(tt('docx.ok')+' · '+name+(eq?' · '+tt('docx.rep',{a:rp.equationsNative,b:rp.equationsFallback+rp.equationsText}):'')+(rp.warnings.length?' ⚠'+rp.warnings.length:''),rp.warnings.length?'warn':'ok');
     return {ok:true,name:name,blob:r.blob,report:rp}}
    return alt(d.message||tt('clip.dl.failed'),'warn','dlFallback',rp)})
  });
 }).catch(function(e){var code=e&&e.code||'build';return alt(code==='lib'?tt('docx.err.lib'):(e&&e.message)||tt('docx.err.build'),'err',code)})}
function unzip(blob){return loadLib('zip',[ZIP_URL],function(){return window.JSZip}).then(function(Z){return blob.arrayBuffer().then(function(b){return Z.loadAsync(b)})})}
/** Text of one part of the .docx zip (e.g. 'word/document.xml') or null. */
function readPart(blob,name){return unzip(blob).then(function(z){var f=z.file(name);return f?f.async('string'):null})}
/** Unzip + check structure. exp: {rtl,minBidi,fonts[],math,oMath,credit(default true)}. -> Promise<{ok,errors[],info}> */
function validateDocx(blob,exp){exp=exp||{};
 return unzip(blob).then(function(z){var E=[],I={files:Object.keys(z.files).length},names=Object.keys(z.files),rd=function(n){var f=z.file(n);return f?f.async('string'):Promise.resolve(null)};
  return Promise.all([rd('[Content_Types].xml'),rd('word/document.xml'),rd('docProps/core.xml'),Promise.all(names.filter(function(n){return /^word\/footer\d*\.xml$/.test(n)}).map(rd))]).then(function(a){
   if(!a[0])E.push('[Content_Types].xml missing');
   if(!a[1]){E.push('word/document.xml missing');return {ok:false,errors:E,info:I}}
   var dx=a[1];
   if(/<\/?undefined[ >]/i.test(dx))E.push('illegal <undefined> element in document.xml');
   var doc=new DOMParser().parseFromString(dx,'application/xml'),NW=function(n){return doc.getElementsByTagNameNS(NS_W,n)};
   if(doc.getElementsByTagName('parsererror').length){E.push('document.xml not well-formed');return {ok:false,errors:E,info:I}}
   var root=doc.documentElement,rootAttrs=root.attributes,prefixes={};
   for(var pi=0;pi<rootAttrs.length;pi++){var at=rootAttrs[pi];if(at.name==='xmlns')prefixes['']=at.value;else if(at.name.indexOf('xmlns:')===0)prefixes[at.name.slice(6)]=at.value}
   if(dx.indexOf('<m:')>=0&&!prefixes['m'])E.push('missing xmlns:m namespace for OMML');
   if(dx.indexOf('<w:')>=0&&!prefixes['w'])E.push('missing xmlns:w namespace');
   I.bidi=NW('bidi').length;I.bidiVisual=NW('bidiVisual').length;I.tables=NW('tbl').length;I.oMath=doc.getElementsByTagNameNS(NS_M,'oMath').length;I.oMathPara=doc.getElementsByTagNameNS(NS_M,'oMathPara').length;
   var set={};Array.prototype.forEach.call(NW('rFonts'),function(e){['ascii','hAnsi','cs','eastAsia'].forEach(function(k){var v=e.getAttributeNS(NS_W,k);if(v)set[v]=1})});I.fonts=Object.keys(set);
   if(exp.rtl&&!I.bidi)E.push('no w:bidi paragraph');
   if(exp.minBidi&&I.bidi<exp.minBidi)E.push('w:bidi count '+I.bidi+' < '+exp.minBidi);
   (exp.fonts||[]).forEach(function(f){if(!set[f])E.push('font not in w:rFonts: '+f)});
   if(exp.math&&!I.oMath)E.push('no m:oMath');
   if(typeof exp.oMath==='number'&&I.oMath!==exp.oMath)E.push('m:oMath '+I.oMath+' != '+exp.oMath);
   if(dx.search(BAD)>=0)E.push('risky control characters in document.xml');
   if(exp.credit!==false){if(a[3].join('').indexOf(CREDIT)<0)E.push('footer credit missing');if(!a[2]||a[2].indexOf(CREDIT)<0)E.push('creator credit missing in core.xml')}
   return {ok:!E.length,errors:E,info:I}})})}
function act(){var U=T.get('ui');if(!U||!U.state)return;if(U.state.stale&&U.process)U.process();return downloadDocx(U.state.result,U.state.settings)}
T.register('export.docx',{build:build,buildReport:buildReport,isAvailable:function(){return !!getDocx()||(typeof navigator==='undefined'||navigator.onLine!==false)},download:downloadDocx,
 validate:validateDocx,readPart:readPart,lastReport:function(){return last},version:'8.5.0',urls:DOCX_URLS.slice(),
 _:{plan:plan,prepMath:prepMath,clean:function(s){return mkCtx({}).clean(s,1)},fonts:fonts,fileName:fileName,NS_W:NS_W,NS_M:NS_M,CREDIT:CREDIT}});
if(T.on){var def={id:'docx',label:tt('docx.act'),run:act};T.on('ui:ready',function(){T.emit('ui:registerAction',def)})}
})(window.Taraz=window.Taraz||{});
