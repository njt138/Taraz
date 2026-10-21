// Tarāz tests: transforms A (cleanup, zwnj, spacing). Each fn returns true or throws.
(function(T){
'use strict';
var Z='\u200C',TH='\u2009',
 OFF={spMode:'off',spPunct:false,zwFix:false,zwRepair:false,zwConvert:'keep',clArabic:false,clTatweel:false,clDiacritics:'off',clMarkdown:false,clEmoji:false,clQuotes:'keep',clNbsp:false,clJunk:false,clTabs:'keep',clJoin:false,clSpaces:false,digMode:'keep',digProse:'keep',digTech:'keep',pcQuotes:'keep',pcPunct:false},
 CLEANALL={clArabic:true,clTatweel:true,clMarkdown:true,clEmoji:true,clNbsp:true,clJunk:true,clSpaces:true},
 CASES=[
 ['sp: glued both ways','مرجعIEEE 1547را',{spMode:'space'},'مرجع IEEE 1547 را'],
 ['sp: ZWNJ before ی','فایلPDFی',{spMode:'zwnj'},'فایل PDF'+Z+'ی'],
 ['sp: ZWNJ before ها','فایلPDFها',{spMode:'zwnj'},'فایل PDF'+Z+'ها'],
 ['sp: space mode suffix','فایلPDFها',{spMode:'space'},'فایل PDF ها'],
 ['sp: thin space','فایلPDFها',{spMode:'thin'},'فایل'+TH+'PDF'+TH+'ها'],
 ['sp: off','مرجعIEEE',{spMode:'off'},'مرجعIEEE'],
 ['sp: Persian digits','سال۱۴۰۰شمسی',{spMode:'space'},'سال ۱۴۰۰ شمسی'],
 ['sp: never double space','مرجع IEEE 1547 را',{spMode:'space'},'مرجع IEEE 1547 را'],
 ['sp: URL boundary only','مرجعhttps://example.com/a/b را',{spMode:'space'},'مرجع https://example.com/a/b را'],
 ['sp: email boundary only','نشانیuser@example.com',{spMode:'space'},'نشانی user@example.com'],
 ['sp: path boundary only','مسیرC:\\Users\\Me\\file.txt',{spMode:'space'},'مسیر C:\\Users\\Me\\file.txt'],
 ['sp: inline code untouched (all on)','از `سلام ،دنیا` استفاده',{spMode:'zwnj',spPunct:true,zwFix:true,zwRepair:true,clArabic:true,clSpaces:true},'از `سلام ،دنیا` استفاده'],
 ['pu: no space before ،','سلام ،دنیا',{spPunct:true},'سلام، دنیا'],
 ['pu: colon','نکته :مهم',{spPunct:true},'نکته: مهم'],
 ['pu: exclamation','سلام !',{spPunct:true},'سلام!'],
 ['pu: space after ،','اول،دوم',{spPunct:true},'اول، دوم'],
 ['pu: space after period','سلام.دنیا',{spPunct:true},'سلام. دنیا'],
 ['pu: parentheses outside','مرجع(IEEE)را',{spPunct:true,spMode:'space'},'مرجع (IEEE) را'],
 ['pu: parentheses inside','( سلام )',{spPunct:true},'(سلام)'],
 ['pu: guillemets inside','« سلام »',{spPunct:true},'«سلام»'],
 ['pu: numbers untouched','عدد 3.14 و ۱،۲۳۴',{spPunct:true},'عدد 3.14 و ۱،۲۳۴'],
 ['zw: می glued','میخواهم',{zwRepair:true},'می'+Z+'خواهم'],
 ['zw: می space','می خواهم',{zwRepair:true},'می'+Z+'خواهم'],
 ['zw: نمی glued','نمیشود',{zwRepair:true},'نمی'+Z+'شود'],
 ['zw: plural glued','کتابها',{zwRepair:true},'کتاب'+Z+'ها'],
 ['zw: plural space','کتاب ها',{zwRepair:true},'کتاب'+Z+'ها'],
 ['zw: lexicon','بهره برداری',{zwRepair:true},'بهره'+Z+'برداری'],
 ['zw: میدان untouched','میدان',{zwRepair:true},'میدان'],
 ['zw: default exception میدانی','میدانی',{zwRepair:true},'میدانی'],
 ['zw: default exception تنها','تنها',{zwRepair:true},'تنها'],
 ['zw: user exception','کتابها',{zwRepair:true,zwExceptions:['کتابها']},'کتابها'],
 ['zw: non-joiner stem untouched','دانشجوها',{zwRepair:true},'دانشجوها'],
 ['zw: doubled','می'+Z+Z+'خواهم',{zwFix:true},'می'+Z+'خواهم'],
 ['zw: next to space','سلام'+Z+' دنیا',{zwFix:true},'سلام دنیا'],
 ['zw: at start','\u200Cسلام',{zwFix:true},'سلام'],
 ['zw: Persian-ZWNJ-Latin','کتاب'+Z+'IEEE',{zwFix:true},'کتابIEEE'],
 ['zw: Latin-ZWNJ-non-suffix','IEEE'+Z+'مرجع',{zwFix:true},'IEEEمرجع'],
 ['zw: Latin-ZWNJ-suffix kept','IEEE'+Z+'ها',{zwFix:true},'IEEE'+Z+'ها'],
 ['zw: convert all','می'+Z+'خواهم کتاب'+Z+'ها',{zwConvert:'all'},'می خواهم کتاب ها'],
 ['zw: convert mi only','می'+Z+'خواهم کتاب'+Z+'ها',{zwConvert:'mi'},'می خواهم کتاب'+Z+'ها'],
 ['zw: convert suffix only','می'+Z+'خواهم کتاب'+Z+'ها',{zwConvert:'suffix'},'می'+Z+'خواهم کتاب ها'],
 ['zw: convert headings only','# کتاب'+Z+'ها\n\nکتاب'+Z+'ها',{zwConvert:'heading'},'# کتاب ها\n\nکتاب'+Z+'ها'],
 ['zw: keep by default','کتاب'+Z+'ها',{},'کتاب'+Z+'ها'],
 ['cl: Arabic letters','كتاب يك',{clArabic:true},'کتاب یک'],
 ['cl: tatweel','كـتـاب',{clTatweel:true},'كتاب'],
 ['cl: harakat','سَلام',{clDiacritics:'harakat'},'سلام'],
 ['cl: stray ###','متن ### متن',{clMarkdown:true,clSpaces:true},'متن متن'],
 ['cl: hr block dropped','سلام\n\n---\n\nدنیا',{clMarkdown:true},'سلام\n\nدنیا'],
 ['cl: emoji middle','سلام 😀 دنیا',{clEmoji:true,clSpaces:true},'سلام دنیا'],
 ['cl: emoji trailing','عالی ✅',{clEmoji:true,clSpaces:true},'عالی'],
 ['cl: © kept with emoji removal','© 2026 ✅',{clEmoji:true,clSpaces:true},'© 2026'],
 ['cl: curly -> straight','“سلام” ‘x’',{clQuotes:'straight'},'"سلام" \'x\''],
 ['cl: curly -> guillemets','“سلام”',{clQuotes:'guillemets'},'«سلام»'],
 ['cl: NBSP','سلام\u00A0دنیا',{clNbsp:true},'سلام دنیا'],
 ['cl: zero-width junk','سلام\u2060دنیا',{clJunk:true},'سلامدنیا'],
 ['cl: collapse + trim','سلام   دنیا  ',{clSpaces:true},'سلام دنیا'],
 ['cl: tab','سلام\tدنیا',{clTabs:'space'},'سلام دنیا'],
 ['cl: join hard wrap','سلام\nدنیا',{clJoin:true},'سلام دنیا'],
 ['cl: no join by default','سلام\nدنیا',{},'سلام\nدنیا'],
 ['cl: fenced code untouched','```\nكتاب   ي\n```',CLEANALL,'```\nكتاب   ي\n```'],
 ['cl: inline code untouched','متن `كتاب` متن',CLEANALL,'متن `كتاب` متن']
 ],
 IDEM=['مرجعIEEE 1547را و کتابها و میخواهم','سلام ،دنیا (IEEE) !','# كتاب'+Z+'ها\n\n- فایلPDFی\n- نمیشود','متن ### متن\n\n---\n\nعالی ✅','از `كتاب` و https://example.com/a استفاده','| الف | ب |\n| --- | --- |\n| IEEEمرجع | ۱۲۳ام |'];
function E(){return T.get('engine');}
function src(t,st){var e=E(),r=e.process(t,Object.assign({},OFF,st));return e.toSource(r.blocks);}
function full(t){var e=E();return e.toSource(e.process(t).blocks);}
function eq(a,b){if(a!==b)throw new Error('expected '+JSON.stringify(b)+' got '+JSON.stringify(a));return true;}
function mk(id,name,f){return {id:id,name:name,fn:f,run:f};}
var tests=CASES.map(function(c,i){return mk('ta'+(i+1),c[0],function(){return eq(src(c[1],c[2]),c[3]);});});
IDEM.forEach(function(t,i){tests.push(mk('ta-idem'+(i+1),'idempotent (defaults) #'+(i+1),function(){var a=full(t);return eq(full(a),a);}));});
tests.push(
 mk('ta-default','defaults fix the reference bug',function(){return eq(full('مرجعIEEE 1547را'),'مرجع IEEE 1547 را');}),
 mk('ta-changes','changes are recorded with type/ruleId/before/after',function(){
  var r=E().process('كتاب',Object.assign({},OFF,{clArabic:true})),c=r.changes.filter(function(x){return x.ruleId==='cleanup.arabic';})[0];
  if(!c||c.type!=='cleanup'||c.before===c.after||!c.before)throw new Error('missing change');return true;}),
 mk('ta-clean','clean text yields no changes and health 100',function(){
  var r=E().process('سلام دنیا');if(r.changes.length||r.health!==100)throw new Error('unexpected changes');return true;}),
 mk('ta-spchange','spacing change recorded',function(){
  var r=E().process('مرجعIEEE',Object.assign({},OFF,{spMode:'space'}));
  if(!r.changes.some(function(c){return /^spacing\./.test(c.ruleId);}))throw new Error('no spacing change');return true;})
);
T.addTests(tests);
})(window.Taraz=window.Taraz||{});