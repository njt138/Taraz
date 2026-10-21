/* Tarāz — tests for fonts, serialize, clipboard */
(function(T){
var n=0,I=function(k,s,d,x){return Object.assign({id:'t'+(++n),k:k,s:s,dir:d||'neutral'},x||{})};
var P=function(l,d){return{type:'p',dir:d||'rtl',inlines:l}};
var RS=function(b){return{blocks:b,formulas:[],changes:[],warnings:[],stats:{},health:100}};
var Z=function(){return T.get('serialize')},F=function(){return T.get('fonts')};
var BAD=/[\u202A-\u202E\u2066-\u2069\u200B\uFEFF]/,RLM='\u200F';
var S1=function(){return RS([P([I('text','\u0633\u0644\u0627\u0645 ','rtl'),I('ltr','Hello','ltr',{rule:'run'}),I('text',' \u062F\u0646\u06CC\u0627.','rtl')])])};
var H=function(r,s,t){return Z().toHTML(r,s||{},t||'word')};
var ok=function(c,m){return c?true:m};
var mk=function(on){return I(on[0],'**','neutral',{meta:{marker:true,on:on[1]}})};
var li=function(t,lv,o,m){return{type:'li',dir:'rtl',level:lv,ordered:!!o,marker:m||'-',inlines:[I('text',t,'rtl')]}};
function t(id,name,f){return{id:'output.'+id,group:'output',name:name,run:f,fn:f}}
T.addTests([
t('fonts-lists','font lists complete',function(){var f=F(),a=['Vazirmatn','B Nazanin','B Mitra','B Zar','B Titr','B Lotus','B Yekan','IRANSans','Sahel','Shabnam','Samim','Tanha','Noto Naskh Arabic','Noto Sans Arabic','Tahoma','Segoe UI','Arial','Times New Roman'].filter(function(x){return f.FA.indexOf(x)<0}),
 b=['Times New Roman','Calibri','Cambria','Arial','Segoe UI','Georgia','Garamond','Verdana','Consolas','Roboto','Inter','Helvetica','Cambria Math'].filter(function(x){return f.EN.indexOf(x)<0});return ok(!a.length&&!b.length,'missing '+a.concat(b))}),
t('fonts-pair','thesis pair = B Nazanin + Times New Roman',function(){var r=F().resolve({fnPair:'thesis'});return ok(r.fa==='B Nazanin'&&r.en==='Times New Roman'&&r.faSize===14,JSON.stringify(r))}),
t('fonts-stack','stacks quoted with generic tail',function(){var r=F().resolve({fnFa:'B Nazanin',fnEn:'Georgia'});return ok(/^'B Nazanin'/.test(r.faStack)&&/serif$/.test(r.enStack)&&/monospace$/.test(r.codeStack),r.faStack+'|'+r.enStack)}),
t('fonts-custom','custom font name overrides list',function(){return ok(F().resolve({fnFa:'Tahoma',fnCustomFa:'My Font'}).fa==='My Font','custom ignored')}),
t('fonts-sanitize','font name injection removed',function(){var r=F().resolve({fnCustomFa:"x';}</style><script>alert(1)</script>"});return ok(!/[<>';{}()]/.test(r.fa+r.faStack.replace(/'/g,'').replace(/,/g,'')),r.fa)}),
t('fonts-installed','isInstalled boolean|null and false for fake',function(){var v=F().isInstalled('Zzz Not A Real Font 91'),w=F().isInstalled('Arial');return ok((v===false||v===null)&&(w===true||w===false||w===null),String(v))}),
t('fonts-note','not-embedded note available',function(){return ok(typeof F().note()==='string'&&F().note().length>0&&F().NOTE_KEY,'no note')}),
t('html-fonts','chosen fonts appear in word HTML',function(){var h=H(S1(),{fnFa:'B Nazanin',fnEn:'Times New Roman'});return ok(h.indexOf("'B Nazanin'")>0&&h.indexOf("'Times New Roman'")>0,h.slice(0,200))}),
t('html-pair','pair sizes applied',function(){return ok(/font-size:14pt/.test(H(S1(),{fnPair:'thesis'})),'no 14pt')}),
t('html-custom','custom font in HTML',function(){return ok(H(S1(),{fnCustomEn:'My Latin'}).indexOf("'My Latin'")>0,'missing')}),
t('word-dirlang','paragraph has dir+lang',function(){return ok(/<p dir="rtl" lang="fa-IR" style=/.test(H(S1())),'no dir/lang')}),
t('word-ltr','LTR run span has dir+lang',function(){return ok(/<span dir="ltr" lang="en-US"[^>]*>Hello<\/span>/.test(H(S1())),'no ltr span')}),
t('word-mso','mso font props present',function(){var h=H(S1());return ok(['mso-ascii-font-family','mso-hansi-font-family','mso-bidi-font-family','mso-bidi-font-size'].every(function(x){return h.indexOf(x)>0}),'mso missing')}),
t('word-align','explicit alignment per dir',function(){var h=H(RS([P([I('text','a','ltr')],'ltr'),P([I('text','\u0628','rtl')])]));return ok(/dir="ltr"[^>]*text-align:left/.test(h)&&/dir="rtl"[^>]*text-align:right/.test(h),'align')}),
t('word-justify','outJustify',function(){return ok(/text-align:justify/.test(H(S1(),{outJustify:true})),'no justify')}),
t('html-heading','real h tags',function(){return ok(/<h2 dir="rtl"/.test(H(RS([{type:'h',dir:'rtl',level:2,inlines:[I('text','\u0639','rtl')]}]))),'no h2')}),
t('html-lists','real ul/ol',function(){var h=H(RS([li('a',0),li('b',0,1,'1.')]));return ok(/<ul/.test(h)&&/<ol/.test(h),h)}),
t('html-nested','nested list',function(){var h=H(RS([li('a',0),li('b',1)]));return ok((h.match(/<ul/g)||[]).length===2&&h.split('</ul>').length===3,h)}),
t('html-listtext','ordered as text',function(){var h=H(RS([li('a',0,1,'\u06F1.')]),{outListNum:'text'});return ok(!/<ol/.test(h)&&h.indexOf('\u06F1.')>0,h)}),
t('html-table','rtl table with th',function(){var c=function(s){return[I('text',s,'rtl')]};return ok(/<table dir="rtl"/.test(H(RS([{type:'table',dir:'rtl',rows:[[c('a'),c('b')],[c('1'),c('2')]],inlines:[]}])))&&/<th /.test(H(RS([{type:'table',dir:'rtl',rows:[[c('a')],[c('1')]],inlines:[]}]))),'table')}),
t('html-escape','text escaped',function(){var h=H(RS([P([I('text','<script>alert(1)</script> & "q"','rtl')])]));return ok(h.indexOf('<script')<0&&h.indexOf('&lt;script&gt;')>0&&h.indexOf('&amp;')>0&&h.indexOf('&quot;q&quot;')>0,h)}),
t('html-links','only http(s) hrefs',function(){var a=H(RS([P([I('link','x','ltr',{href:'javascript:alert(1)'}),I('link','y','ltr',{href:'ftp://a.b'})])])),b=H(RS([P([I('link','z','ltr',{href:'https://e.com/a?b=1&c=2'})])]));return ok(a.indexOf('href=')<0&&b.indexOf('href="https://e.com/a?b=1&amp;c=2"')>0,a+b)}),
t('html-bold','markers become b, no asterisks',function(){var h=H(RS([P([mk(['b',true]),I('text','\u0645\u0647\u0645','rtl'),mk(['b',false])])]));return ok(h.indexOf('<b>')>0&&h.indexOf('**')<0,h)}),
t('html-br','soft break',function(){return ok(H(RS([P([I('text','\u0627\u0644\u0641\n\u0628','rtl')])])).indexOf('<br>')>0,'no br')}),
t('ppt','compact, no mso, bullets',function(){var h=H(RS([li('a',0),P([I('text','\u0628','rtl')])]),{},'ppt');return ok(!/mso-/.test(h)&&!/font-size/.test(h)&&/<ul/.test(h),h)}),
t('page','standalone page with credit',function(){var h=H(S1(),{},'page');return ok(/^<!doctype html>/.test(h)&&h.indexOf('charset="utf-8"')>0&&h.indexOf('<footer dir="ltr" lang="en">Built by Gholamreza Nejati Jahromi</footer>')>0&&h.indexOf('name="author" content="Gholamreza Nejati Jahromi"')>0,'page')}),
t('preview','preview wrapper',function(){return ok(/^<div class="tz-out"/.test(H(S1(),{},'preview')),'wrapper')}),
t('plain-rlm','default plain = RLM only',function(){var p=Z().toPlain(S1());return ok(p[0]===RLM&&p.indexOf('Hello'+RLM)>0&&!BAD.test(p),JSON.stringify(p))}),
t('plain-none','strategy none',function(){return ok(Z().toPlain(S1(),{ptStrategy:'none'})==='\u0633\u0644\u0627\u0645 Hello \u062F\u0646\u06CC\u0627.','none')}),
t('plain-lre','strategy LRE/PDF',function(){return ok(Z().toPlain(S1(),{ptStrategy:'lre'}).indexOf('\u202AHello\u202C')>0,'lre')}),
t('plain-iso','strategy isolates',function(){return ok(Z().toPlain(S1(),{ptStrategy:'isolates'}).indexOf('\u2066Hello\u2069')>0,'iso')}),
t('plain-table','table as tabs',function(){var c=function(s){return[I('text',s,'ltr')]};return ok(Z().toPlain(RS([{type:'table',dir:'rtl',rows:[[c('a'),c('b')],[c('1'),c('2')]],inlines:[]}]),{ptStrategy:'none'})==='a\tb\n1\t2','tsv')}),
t('plain-list','ordered marker kept',function(){return ok(Z().toPlain(RS([li('a',0,1,'\u06F1.'),li('b',0,1,'\u06F2.')]),{ptStrategy:'none'})==='\u06F1. a\n\u06F2. b','list')}),
t('no-risky','no risky chars in any default output',function(){var r=RS([P([I('text','a\u202Eb\u200Bc\uFEFFd\u2066','rtl'),I('ltr','x\u202Ay','ltr')])]),z=Z();
 var all=[z.toPlain(r),z.toPlain(r,{ptStrategy:'none'}),z.toMarkdown(r)].concat(['word','ppt','page','preview'].map(function(x){return z.toHTML(r,{},x)}));return ok(all.every(function(x){return!BAD.test(x)}),'risky found')}),
t('safety','default plain passes engine.safety',function(){if(!T.has('engine.safety'))return true;return ok(T.get('engine.safety').isOfficeSafe(Z().toPlain(S1())),'unsafe')}),
t('md','markdown output',function(){var c=function(s){return[I('text',s,'ltr')]},m=Z().toMarkdown(RS([{type:'h',dir:'rtl',level:2,inlines:[I('text','\u0639','rtl')]},li('a',0),{type:'code',dir:'ltr',lang:'js',inlines:[I('code','x=1','ltr')]},{type:'table',dir:'rtl',rows:[[c('a'),c('b')],[c('1'),c('2')]],inlines:[]},P([mk(['b',true]),I('text','z','rtl'),mk(['b',false])])]));
 return ok(m.indexOf('## \u0639')===0&&m.indexOf('\n- a')>0&&m.indexOf('```js\nx=1\n```')>0&&m.indexOf('| a | b |\n| --- | --- |\n| 1 | 2 |')>0&&m.indexOf('**z**')>0,m)}),
t('pure','serializers do not mutate result',function(){var r=S1(),a=JSON.stringify(r);H(r);Z().toPlain(r);Z().toMarkdown(r);H(r,{},'page');return ok(JSON.stringify(r)===a,'mutated')}),
t('robust','garbage input never throws',function(){var z=Z();return ok(typeof z.toHTML(null,null,'word')==='string'&&typeof z.toHTML({},{},'bogus')==='string'&&z.toPlain()===''&&z.toMarkdown(null)==='','robust')}),
t('engine','engine result serializes with lang',function(){if(!T.has('engine'))return true;var E=T.get('engine'),r=E.process('\u0633\u0644\u0627\u0645 hello **world**');return ok(/lang="en-US"/.test(H(r))&&!BAD.test(Z().toPlain(r)),'engine')}),
t('clip-api','clipboard API present',function(){var c=T.get('clipboard');return ok(['copyWord','copyPpt','copyPlain','download','exportFile'].every(function(k){return typeof c[k]==='function'}),'api')}),
t('clip-wrap','wrapDoc fragment markers',function(){var w=T.get('clipboard').wrapDoc('<p>x</p>');return ok(w.indexOf('charset="utf-8"')>0&&w.indexOf('<!--StartFragment--><p>x</p><!--EndFragment-->')>0,w)})
]);
})(window.Taraz=window.Taraz||{});