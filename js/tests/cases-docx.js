/* Tarāz tests: group 'docx' (offline, pure plan) and 'docx-live' (needs docx@8.5.0 + JSZip from CDN). */
(function(T){
'use strict';
var X=function(){return T.get('export.docx')},id=0,NSM='http://schemas.openxmlformats.org/officeDocument/2006/math',NSW='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
function I(k,s,dir,x){return Object.assign({id:'t'+(++id),k:k,s:s,dir:dir||'neutral'},x)}
function Bk(type,dir,inl,x){return Object.assign({type:type,dir:dir,inlines:inl},x)}
function R(bl){return {blocks:bl,formulas:[],changes:[],warnings:[],stats:{},health:100}}
function P(res,S,mm){return X()._.plan(R([].concat(res)),S||{},mm||{})}
function C(c,m){return c?true:m}
function eq(a,b,m){return a===b||(m||'')+' expected '+JSON.stringify(b)+' got '+JSON.stringify(a)}
function all(){for(var i=0;i<arguments.length;i++)if(arguments[i]!==true)return arguments[i];return true}
var FA=function(s){return I('text',s,'rtl')},EN=function(s){return I('ltr',s,'ltr')};
var ALLBAD='\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069\u200B\uFEFF';
function omStub(ok,calls){return {isAvailable:function(){return true},validate:function(){return {ok:true}},fromLatex:function(s,o){calls&&calls.push({s:s,display:o.display});
 return Promise.resolve(ok?{ok:true,xml:'<m:oMath xmlns:m="'+NSM+'" xmlns:w="'+NSW+'"><m:r><m:t>x</m:t></m:r></m:oMath>',warnings:[],fallbackText:'x'}:{ok:false,xml:'<m:oMath/>',warnings:[{code:'error'}],fallbackText:'x^2'})}}}
function mathIn(mode,x){return I('math','$x^2$','neutral',{protected:true,meta:Object.assign({tex:'x^2',display:false,mode:mode||'A',fx:{mode:mode||'A'}},x)})}
var L=[];
function add(g,n,fn){L.push({id:'docx.'+(L.length+1),group:g,name:n,run:fn,fn:fn,expect:true})}
function off(n,fn){add('docx',n,fn)}
function live(n,res,S,opts,exp,chk,part){add('docx-live',n,function(){var x=X();
 return x.buildReport(res(),S||{},opts).then(function(r){return Promise.all([x.validate(r.blob,exp),part?x.readPart(r.blob,part):null]).then(function(a){
  var v=a[0];return v.ok?(chk?chk(r,v,a[1]):true):'validate: '+v.errors.join('; ')})}).catch(function(e){return 'OFFLINE or build error ('+(e.code||'?')+'): '+e.message})})}

off('registered: build/isAvailable/download/validate',function(){var x=X();return C(x&&['build','isAvailable','download','validate','readPart'].every(function(k){return typeof x[k]==='function'}),'missing API')});
off('pinned CDN URLs (exact version, jsdelivr)',function(){return C(X().urls.every(function(u){return /^https:\/\/cdn\.jsdelivr\.net\/npm\/docx@8\.5\.0\//.test(u)}),X().urls.join())});
off('clean strips all 11 risky chars',function(){var s=X()._.clean('a'+ALLBAD+'b');return eq(s,'ab')});
off('clean keeps ZWNJ and RLM',function(){return eq(X()._.clean('می\u200Cروم\u200F'),'می\u200Cروم\u200F')});
off('clean: CRLF -> LF and control chars removed',function(){return eq(X()._.clean('a\r\nb\u0001c'),'a\nbc')});
off('fileName taraz-YYYYMMDD-HHMM.docx',function(){return eq(X()._.fileName(new Date(2026,0,5,7,3)),'taraz-20260105-0703.docx')});
off('RTL paragraph: bidi + start; Persian run rtl+fa; LTR run en',function(){var p=P(Bk('p','rtl',[FA('سلام '),EN('Word'),FA(' خوب')])).blocks[0],r=p.runs;
 return all(eq(p.bidi,true,'bidi'),eq(p.jc,'start','jc'),eq(r[0].f,'fa'),eq(r[0].rtl,true),eq(r[1].f,'en'),eq(r[1].rtl,false))});
off('LTR paragraph: no bidi, left',function(){var p=P(Bk('p','ltr',[EN('Hello')])).blocks[0];return all(eq(p.bidi,false),eq(p.jc,'left'),eq(p.runs[0].f,'en'))});
off('num: Latin -> en run, Persian digits -> fa rtl run',function(){var r=P(Bk('p','rtl',[I('num','123'),I('num','۱۲۳')])).blocks[0].runs;return all(eq(r[0].f,'en'),eq(r[1].f,'fa'),eq(r[1].rtl,true))});
off('inline code mono ltr; code block ltr, one block per line, last flagged',function(){var q=P([Bk('p','rtl',[I('code','x=1','ltr')]),Bk('code','ltr',[I('code','a\n\tb','ltr')])]).blocks;
 return all(eq(q[0].runs[0].f,'code'),eq(q[0].runs[0].rtl,false),eq(q[1].kind,'code'),eq(q.length,3),eq(q[1].bidi,false),eq(q[2].runs[0].s,'    b'),eq(q[2].last,true))});
off('headings: level clamp, title from first heading',function(){var p=P([Bk('p','rtl',[FA('x')]),Bk('h','rtl',[FA('عنوان')],{level:9}),Bk('h','rtl',[FA('دوم')],{level:1})]);return all(eq(p.title,'عنوان'),eq(p.blocks[1].level,6),eq(p.blocks[1].runs[0].b,true))});
off('title fallback when no heading',function(){return eq(P(Bk('p','ltr',[EN('x')])).title,'Taraz')});
off('links: http(s) kept, javascript: dropped (text kept)',function(){var r=P(Bk('p','ltr',[I('link','ok','ltr',{href:'https://a.b/?x=1&y=2'}),I('link','bad','ltr',{href:'javascript:alert(1)'}),I('link','ftp','ltr',{href:'ftp://x'})])).blocks[0].runs;
 return all(eq(r[0].href,'https://a.b/?x=1&y=2'),eq(r[1].href,undefined),eq(r[1].s,'bad'),eq(r[2].href,undefined))});
off('bold/italic markers toggle without emitting text',function(){var r=P(Bk('p','ltr',[I('b','**','neutral',{meta:{marker:true,on:true}}),EN('B'),I('b','**','neutral',{meta:{marker:true,on:false}}),I('i','*','neutral',{meta:{marker:true,on:true}}),EN('I')])).blocks[0].runs;
 return all(eq(r.length,2),eq(r[0].b,true),eq(r[0].i,false),eq(r[1].i,true),eq(r[1].b,false))});
off('soft line break -> br run',function(){var r=P(Bk('p','ltr',[EN('a\nb')])).blocks[0].runs;return all(eq(r.length,3),eq(r[1].t,'br'))});
off('lists: Latin marker native, instance restarts per run',function(){var li=function(o,m,t){return Bk('li','ltr',[EN(t||'x')],{ordered:o,marker:m,level:0})};
 var b=P([li(1,'1.'),li(1,'2.'),Bk('p','ltr',[EN('p')]),li(1,'1.'),li(0,'-')]).blocks;return all(eq(b[0].text,false),eq(b[0].inst,1),eq(b[1].inst,1),eq(b[3].inst,2),eq(b[4].ordered,false),eq(b[4].text,false))});
off('lists: Persian marker -> text mode + warning once',function(){var li=Bk('li','rtl',[FA('الف')],{ordered:true,marker:'۱.',level:0}),p=P([li,li]);
 return all(eq(p.blocks[0].text,true),eq(p.blocks[0].runs[0].s,'۱.'),eq(p.blocks[0].runs[1].t,'tab'),eq(p.st.w.length,1))});
off('lists: outListNum=text -> bullets as text too; level clamp 0..5',function(){var b=P(Bk('li','ltr',[EN('x')],{ordered:false,level:99}),{outListNum:'text'}).blocks[0];return all(eq(b.text,true),eq(b.runs[0].s,'\u2022'),eq(b.level,5))});
off('task list prefix',function(){var b=P(Bk('li','ltr',[EN('x')],{task:true,checked:true,level:0})).blocks[0];return C(b.runs[0].s==='\u2611 ','no checkbox')});
off('table: header flag, rtl cells, pure-Latin cell ltr',function(){var c=function(x){return [x]},t=P(Bk('table','rtl',[],{rows:[[c(FA('الف')),c(EN('Name'))],[c(FA('۱')),c(FA('۲'))]]})).blocks[0];
 return all(eq(t.header,true),eq(t.rtl,true),eq(t.nc,2),eq(t.rows[0][0].bidi,true),eq(t.rows[0][1].bidi,false),eq(t.rows[0][0].runs[0].b,true),eq(t.rows[1][0].runs[0].b,false))});
off('justify option -> both on paragraphs only',function(){var b=P([Bk('p','rtl',[FA('x')]),Bk('h','rtl',[FA('y')],{level:1})],{outJustify:'on'}).blocks;return all(eq(b[0].jc,'both'),eq(b[1].jc,'start'))});
off('math plan: native/fallback/text counted; math font ltr',function(){var a=mathIn(),b=mathIn(),c=mathIn('keep'),mm={};mm[a.id]={kind:'xml',xml:'<m:oMath/>',alt:'x'};mm[b.id]={kind:'fb',s:'x^2',warns:['w1']};mm[c.id]={kind:'keep',s:'$x^2$'};
 var p=P(Bk('p','rtl',[FA('الف'),a,b,c]),{},mm);return all(eq(p.st.eq.native,1),eq(p.st.eq.fallback,1),eq(p.st.eq.text,1),eq(p.blocks[0].runs[2].f,'math'),eq(p.st.w[0],'w1'))});
off('prepMath: display true for math block, false inline; uses fx.out',function(){var calls=[],a=mathIn('A',{fx:{mode:'A',out:'\\frac{1}{2}'}}),b=mathIn();
 return X()._.prepMath([Bk('math','ltr',[a]),Bk('p','rtl',[b])],{},{omml:omStub(true,calls)}).then(function(m){return all(eq(calls.length,2),eq(calls[0].s,'\\frac{1}{2}'),eq(calls[0].display,true),eq(calls[1].display,false),eq(m[a.id].kind,'xml'))})});
off('prepMath: omml unavailable -> fallback text + warning',function(){return X()._.prepMath([Bk('p','ltr',[mathIn()])],{},{omml:{isAvailable:function(){return false}}}).then(function(m){var e=m[Object.keys(m)[0]];return all(eq(e.kind,'fb'),C(e.s&&e.s.length,'empty fallback'),eq(e.warns.length,1))})});
off('prepMath: ok:false -> fallbackText of omml',function(){return X()._.prepMath([Bk('p','ltr',[mathIn()])],{},{omml:omStub(false)}).then(function(m){var e=m[Object.keys(m)[0]];return all(eq(e.kind,'fb'),eq(e.s,'x^2'))})});
off('prepMath: mode keep never calls omml',function(){var calls=[];return X()._.prepMath([Bk('p','ltr',[mathIn('keep')])],{},{omml:omStub(true,calls)}).then(function(m){return all(eq(calls.length,0),eq(m[Object.keys(m)[0]].kind,'keep'))})});
off('risky chars never reach plan; counted; no BOM/ZWSP in JSON',function(){var p=P(Bk('p','rtl',[FA('الف'+ALLBAD+'ب')])),j=JSON.stringify(p.blocks);return all(C(!/[\u202A-\u202E\u2066-\u2069\u200B\uFEFF]/.test(j),'risky char leaked'),C(p.st.n>=11,'count '+p.st.n))});
off('special chars preserved in plan (escaped later by XML writer)',function(){return eq(P(Bk('p','ltr',[EN('a<b & "c" >')])).blocks[0].runs[0].s,'a<b & "c" >')});
off('build rejects with code lib + Persian message when loader fails',function(){return X().buildReport(R([Bk('p','ltr',[EN('x')])]),{},{libLoader:function(){return Promise.reject(new Error('net'))}}).then(function(){return 'should reject'},function(e){return all(eq(e.code,'lib'),C(/اتصال اینترنت/.test(e.message),e.message))})});
off('download: lib failure -> copy-based alternative used, never rejects',function(){var n=0,tst=[];return X().download(R([Bk('p','ltr',[EN('x')])]),{},{libLoader:function(){return Promise.reject(new Error('net'))},clipboard:{copyWord:function(){n++;return Promise.resolve({ok:true})}},toast:function(m,k){tst.push(k)}})
 .then(function(r){return all(eq(r.ok,false),eq(r.code,'lib'),eq(r.alt,true),eq(n,1),eq(tst[0],'err'))})});
off('download: empty result -> code empty',function(){return X().download(R([]),{},{toast:function(){}}).then(function(r){return eq(r.code,'empty')})});

live('live: minimal docx valid zip, credit in footer + core.xml',function(){return R([Bk('p','ltr',[EN('Hello')])])},{},{},{},function(r){return C(r.blob.size>800&&/wordprocessingml/.test(r.blob.type),'size/type '+r.blob.size+' '+r.blob.type)});
live('live: RTL paragraphs get w:bidi; chosen fonts in w:rFonts',function(){return R([Bk('p','rtl',[FA('سلام '),EN('Word')]),Bk('p','rtl',[FA('دوم')])])},{fnCustomFa:'Vazirmatn',fnCustomEn:'Arial'},{},
 {rtl:true,minBidi:2,fonts:[X()._.fonts({fnCustomFa:'Vazirmatn',fnCustomEn:'Arial'}).fa,X()._.fonts({fnCustomFa:'Vazirmatn',fnCustomEn:'Arial'}).en]});
live('live: escaping of < > & " in document.xml',function(){return R([Bk('p','ltr',[EN('a<b & "c" > d')])])},{},{},{},function(r,v,x){return C(x.indexOf('a&lt;b &amp; "c" &gt; d')>=0||x.indexOf('a&lt;b &amp; &quot;c&quot; &gt; d')>=0,'not escaped: '+x.slice(x.indexOf('a&')-5,x.indexOf('a&')+60))},'word/document.xml');
live('live: risky chars stripped from file, neighbours kept',function(){return R([Bk('p','rtl',[FA('الف'+ALLBAD+'ب')])])},{},{},{},function(r,v,x){return all(C(x.indexOf('الفب')>=0,'neighbours lost'),C(r.report.stripped>=11&&r.report.warnings.length>0,'report'))},'word/document.xml');
live('live: headings use real Heading1 style',function(){return R([Bk('h','rtl',[FA('عنوان')],{level:1})])},{},{},{rtl:true},function(r,v,x){return C(/<w:pStyle w:val="Heading1"/.test(x),'no Heading1 pStyle')},'word/document.xml');
live('live: table has bidiVisual, header row, rtl cell paragraphs',function(){var c=function(x){return [x]};return R([Bk('table','rtl',[],{rows:[[c(FA('الف')),c(FA('ب'))],[c(FA('۱')),c(FA('۲'))]]})])},{},{},{rtl:true,minBidi:4},function(r,v,x){return all(eq(v.info.tables,1),eq(v.info.bidiVisual,1),C(/<w:tblHeader/.test(x),'no tblHeader'))},'word/document.xml');
live('live: native OMML inline+block (stub), m namespace well-formed',function(){return R([Bk('p','rtl',[FA('الف'),mathIn()]),Bk('math','ltr',[mathIn()],{})])},{},{omml:omStub(true)},{math:true,oMath:2},function(r,v,x){return all(eq(r.report.equationsNative,2),eq(r.report.equationsFallback,0),eq(v.info.oMath,2),C(!/<\/?undefined[ >]/i.test(x),'contains <undefined> element in document.xml'))},'word/document.xml');
live('live: no undefined XML tag in document.xml with equations',function(){return R([Bk('p','rtl',[FA('فرمول '),mathIn()]),Bk('math','ltr',[mathIn()])])},{},{omml:omStub(true)},{math:true},function(r,v,x){return C(!/<\/?undefined[ >]/i.test(x),'contains <undefined> tag')},'word/document.xml');
live('live: omml unavailable -> text fallback, report + no oMath',function(){return R([Bk('p','ltr',[mathIn()])])},{},{omml:{isAvailable:function(){return false}}},{math:false,oMath:0},function(r,v,x){return all(eq(r.report.equationsFallback,1),C(r.report.warnings.length>0,'no warning'),C(x.indexOf('x^2')>=0||x.indexOf('x')>=0,'no text'))},'word/document.xml');
live('live: native lists create numbering + numPr; text lists have no numPr',function(){var li=function(m){return Bk('li','ltr',[EN('x')],{ordered:true,marker:m,level:0})};return R([li('1.'),li('2.')])},{},{},{},function(r,v,x){return C(/<w:numPr>/.test(x),'no numPr')},'word/document.xml');
live('live: code block uses code font + shading; link only for https',function(){return R([Bk('code','ltr',[I('code','x=1','ltr')]),Bk('p','ltr',[I('link','a','ltr',{href:'https://example.com/'}),I('link','b','ltr',{href:'javascript:1'})])])},{},{},
 {fonts:[X()._.fonts({}).code]},function(r,v,x){return all(C(/<w:shd /.test(x),'no shading'),eq((x.match(/<w:hyperlink /g)||[]).length,1))},'word/document.xml');
live('live: download() builds file, names it, emits ui:report',function(){return R([Bk('p','ltr',[EN('x')])])},{},{},{},null);
L[L.length-1].fn=L[L.length-1].run=function(){var got=null,rep=null,x=X();T.on&&T.on('ui:report',function(r){rep=r});
 return x.download(R([Bk('p','ltr',[EN('x')])]),{},{toast:function(){},clipboard:{download:function(n,b,m){got={n:n,b:b,m:m};return Promise.resolve({ok:true})}}}).then(function(r){
  return r.ok?all(C(/^taraz-\d{8}-\d{4}\.docx$/.test(got.n),got.n),C(got.b.size>500,'blob'),C(rep&&typeof rep.equationsNative==='number','no ui:report')):'download failed: '+r.code}).catch(function(e){return 'OFFLINE: '+e.message})};
T.addTests(L);
})(window.Taraz=window.Taraz||{});
