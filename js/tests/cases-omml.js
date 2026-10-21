/* Tarāz — js/tests/cases-omml.js · tests for export.omml · Built by Gholamreza Nejati Jahromi */
(function(T){
'use strict';
function O(){return T.get('export.omml');}
function ML(s){return '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow>'+s+'</mrow><annotation encoding="application/x-tex">t</annotation></semantics></math>';}
function cnt(s,n){return s.split(n).length-1;}
function xmlOk(x){return !new DOMParser().parseFromString(x,'application/xml').getElementsByTagName('parsererror').length;}
function chk(r,has,not){
  var v=O().validate(r.xml),i;
  if(!r.ok)return 'ok=false '+JSON.stringify(r.warnings);
  if(!v.ok)return 'invalid: '+v.error;
  if(!xmlOk(r.xml))return 'not well-formed XML';
  for(i=0;i<(has||[]).length;i++)if(r.xml.indexOf(has[i])<0)return 'missing '+has[i];
  for(i=0;i<(not||[]).length;i++)if(r.xml.indexOf(not[i])>=0)return 'unexpected '+not[i];
  return true;
}
function t(id,name,fn,group){
  var f=function(){
    if(!T.has('export.omml'))return 'export.omml not loaded';
    try{var r=fn();return r&&r.then?r.then(function(x){return x;},function(e){return 'rejected: '+e.message;}):r;}
    catch(e){return 'threw: '+e.message;}
  };
  return {id:'omml.'+id,group:group||'omml',name:name,run:f,fn:f,expect:true};
}
function c(id,name,ml,has,not,o,ex){
  return t(id,name,function(){var r=O().fromMathML(ML(ml),o),e=chk(r,has,not);return e===true&&ex?ex(r):e;});
}
function fake(ml,err){
  var o={seen:null};
  o.toMathML=function(s){o.seen=s;return Promise.resolve(err?{ok:false,error:err}:{ok:true,mathml:ml});};
  return o;
}
var G='<mi>sin</mi><mo>\u2061</mo>';
var LIVE=[['x^2','<m:sSup>'],['\\frac{a}{b}','<m:f>'],['\\sqrt[3]{x}','<m:rad>'],['\\sum_{i=1}^{n} x_i','<m:nary>'],['\\int_0^1 f(x)\\,dx','<m:nary>'],
['\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}','<m:m>'],['\\begin{cases}x&x>0\\\\0&\\text{otherwise}\\end{cases}','<m:d>'],['\\hat{x}','<m:acc>'],
['\\sin\\theta','<m:func>'],['\\lim_{x\\to0} f','<m:limLow>'],['\\text{units}','<m:nor/>'],['a<b\\ \\&\\ c>d','&lt;']];

T.addTests([
c('sup','x^2 → m:sSup','<msup><mi>x</mi><mn>2</mn></msup>',['<m:sSup>','<m:e><m:r>','<m:sup><m:r>','<m:t>x</m:t>','<m:t>2</m:t>']),
c('sub','x_i → m:sSub','<msub><mi>x</mi><mi>i</mi></msub>',['<m:sSub>','<m:sub><m:r>']),
c('subsup','x_i^2 → m:sSubSup','<msubsup><mi>x</mi><mi>i</mi><mn>2</mn></msubsup>',['<m:sSubSup>']),
c('frac','\\frac{a}{b} → m:f','<mfrac><mi>a</mi><mi>b</mi></mfrac>',['<m:f>','<m:num><m:r>','<m:den><m:r>'],['<m:type']),
c('frac-nested','nested fractions → 3 m:f','<mfrac><mfrac><mi>a</mi><mi>b</mi></mfrac><mfrac><mi>c</mi><mi>d</mi></mfrac></mfrac>',['<m:f>'],[],null,function(r){return cnt(r.xml,'<m:f>')===3||'m:f count '+cnt(r.xml,'<m:f>');}),
c('root-deg','\\sqrt[3]{x} → m:rad with degree','<mroot><mi>x</mi><mn>3</mn></mroot>',['<m:rad>','<m:deg><m:r>'],['degHide'],null,function(r){return r.xml.indexOf('<m:t>3</m:t>')<r.xml.indexOf('<m:t>x</m:t>')||'degree not before base';}),
c('sqrt','\\sqrt{x} → degHide','<msqrt><mi>x</mi></msqrt>',['<m:rad>','m:val="1"','<m:degHide']),
c('sum-display','sum with limits (display) → nary undOvr','<munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><msub><mi>x</mi><mi>i</mi></msub>',['<m:nary>','m:val="∑"','m:val="undOvr"','<m:sSub>'],['subHide','supHide']),
c('sum-inline','sum with limits (inline) → nary subSup','<msubsup><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></msubsup><msub><mi>x</mi><mi>i</mi></msub>',['<m:nary>','m:val="subSup"']),
c('prod-nolimits','product without limits → subHide+supHide','<mo>∏</mo><mi>a</mi>',['m:val="∏"','<m:subHide','<m:supHide']),
c('int','\\int_0^1 f(x)\\,dx → nary with body','<msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mspace width="0.1667em"></mspace><mi>d</mi><mi>x</mi>',['<m:nary>','m:val="∫"','<m:t>d</m:t>'],[],null,function(r){return /<\/m:nary><\/m:oMath>$/.test(r.xml)&&r.xml.indexOf('<m:t>d</m:t>')<r.xml.indexOf('</m:nary>')||'integrand not inside nary';}),
c('nary-stops','nary body stops at +','<munderover><mo>∑</mo><mi>i</mi><mi>n</mi></munderover><mi>a</mi><mo>+</mo><mi>b</mi>',['<m:nary>'],[],null,function(r){return r.xml.indexOf('<m:t>+</m:t>')>r.xml.indexOf('</m:nary>')||'+ swallowed';}),
c('pmatrix','pmatrix → m:d + m:m','<mrow><mo fence="true">(</mo><mtable><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd></mtr><mtr><mtd><mi>c</mi></mtd><mtd><mi>d</mi></mtd></mtr></mtable><mo fence="true">)</mo></mrow>',['<m:d>','m:begChr m:val="("','m:endChr m:val=")"','<m:m>'],[],null,function(r){return cnt(r.xml,'<m:mr>')===2&&cnt(r.xml,'<m:e>')===5||'rows/cells '+cnt(r.xml,'<m:mr>')+'/'+cnt(r.xml,'<m:e>');}),
c('cases','cases → { delimiter + matrix','<mrow><mo fence="true">{</mo><mtable columnalign="left left"><mtr><mtd><mi>x</mi></mtd><mtd><mtext>if </mtext><mi>x</mi><mo>&gt;</mo><mn>0</mn></mtd></mtr><mtr><mtd><mn>0</mn></mtd><mtd><mtext>otherwise</mtext></mtd></mtr></mtable></mrow>',['m:begChr m:val="{"','m:endChr m:val=""','<m:m>','m:mcJc m:val="left"','<m:nor/>','xml:space="preserve"','&gt;']),
c('hat','\\hat{x} → m:acc U+0302','<mover accent="true"><mi>x</mi><mo>^</mo></mover>',['<m:acc>','m:val="\u0302"']),
c('bar','\\bar{x} → acc U+0304; \\overline → m:bar','<mover accent="true"><mi>x</mi><mo>\u02C9</mo></mover><mover accent="true"><mrow><mi>a</mi><mi>b</mi></mrow><mo stretchy="true">\u203E</mo></mover>',['m:val="\u0304"','<m:bar>','m:pos m:val="top"']),
c('acc-misc','\\vec \\dot \\tilde','<mover accent="true"><mi>v</mi><mo>\u2192</mo></mover><mover accent="true"><mi>x</mi><mo>\u02D9</mo></mover><mover accent="true"><mi>y</mi><mo>~</mo></mover>',['m:val="\u20D7"','m:val="\u0307"','m:val="\u0303"']),
c('func','\\sin\\theta → m:func','<mi>sin</mi><mo>\u2061</mo><mi>\u03B8</mi>',['<m:func>','<m:fName><m:r><m:rPr><m:sty m:val="p"/></m:rPr>','<m:t>sin</m:t>','<m:t>\u03B8</m:t>']),
c('func-bare','\\sin without argument → plain run, no func','<mi>sin</mi>',['<m:t>sin</m:t>','m:val="p"'],['<m:func>']),
c('func-paren','\\sin(x+1)=0 → argument is (x+1)','<mi>sin</mi><mo>\u2061</mo><mo stretchy="false">(</mo><mi>x</mi><mo>+</mo><mn>1</mn><mo stretchy="false">)</mo><mo>=</mo><mn>0</mn>',['<m:func>'],[],null,function(r){var e=r.xml.indexOf('</m:func>');return r.xml.indexOf('<m:t>+</m:t>')<e&&r.xml.indexOf('<m:t>=</m:t>')>e||'bad func extent';}),
c('func-sq','\\sin^2 x (KaTeX mrow base) → func with sSup','<msup><mrow><mi>sin</mi><mo>\u2061</mo></mrow><mn>2</mn></msup><mi>x</mi>',['<m:func>','<m:fName><m:sSup>']),
c('lim-inline','\\lim_{x\\to0} f → func(limLow)','<msub><mrow><mi>lim</mi><mo>\u2061</mo></mrow><mrow><mi>x</mi><mo>→</mo><mn>0</mn></mrow></msub><mi>f</mi>',['<m:func>','<m:fName><m:limLow>','<m:lim>','<m:t>→</m:t>','<m:t>lim</m:t>']),
c('lim-display','\\lim (display munder) → func(limLow)','<munder><mrow><mi>lim</mi><mo>\u2061</mo></mrow><mrow><mi>x</mi><mo>→</mo><mn>0</mn></mrow></munder><mi>f</mi>',['<m:func>','<m:fName><m:limLow>']),
c('text','\\text{units} → m:nor','<mtext>units</mtext>',['<m:nor/>','<m:t>units</m:t>']),
c('greek','Greek letters kept as Unicode','<mi>\u03B1</mi><mi>\u03B2</mi><mi mathvariant="normal">\u03A9</mi><mo>\u221E</mo><mo>\u2264</mo>',['\u03B1','\u03B2','\u03A9','\u221E','\u2264']),
c('escape','< & > escaped','<mi>a</mi><mo>&lt;</mo><mi>b</mi><mo>&amp;</mo><mo>&gt;</mo><mtext>"q"</mtext>',['<m:t>&lt;</m:t>','<m:t>&amp;</m:t>','<m:t>&gt;</m:t>','&quot;q&quot;']),
c('opvars','mathbb and bold styles','<mi mathvariant="double-struck">R</mi><mi mathvariant="bold">v</mi>',['m:scr m:val="double-struck"','m:sty m:val="b"']),
c('eqarr','aligned → m:eqArr with alignment points','<mtable columnalign="right left" displaystyle="true"><mtr><mtd><mi>a</mi></mtd><mtd><mo>=</mo><mi>b</mi></mtd></mtr><mtr><mtd><mi>c</mi></mtd><mtd><mo>=</mo><mi>d</mi></mtd></mtr></mtable>',['<m:eqArr>'],['<m:m>'],null,function(r){return cnt(r.xml,'<m:aln/>')===2||'aln count '+cnt(r.xml,'<m:aln/>');}),
c('mfenced','mfenced [ ] → m:d','<mfenced open="[" close="]"><mi>x</mi></mfenced>',['m:begChr m:val="["','m:endChr m:val="]"']),
c('binom','\\binom → d + f noBar','<mrow><mo fence="true">(</mo><mfrac linethickness="0px"><mi>n</mi><mi>k</mi></mfrac><mo fence="true">)</mo></mrow>',['<m:d>','m:type m:val="noBar"']),
c('middle','\\left(a\\middle|b\\right) → sepChr','<mrow><mo fence="true">(</mo><mi>a</mi><mo fence="true">|</mo><mi>b</mi><mo fence="true">)</mo></mrow>',['m:sepChr m:val="|"'],[],null,function(r){return cnt(r.xml,'<m:e>')===2||'e count '+cnt(r.xml,'<m:e>');}),
c('brace','\\underbrace → m:groupChr','<munder accentunder="true"><mi>x</mi><mo stretchy="true">\u23DF</mo></munder>',['<m:groupChr>','m:pos m:val="bot"']),
c('overset','\\overset → m:limUpp','<mover><mi>x</mi><mi>a</mi></mover>',['<m:limUpp>','<m:lim>']),
c('space','\\quad → em space, never ZWSP','<mi>a</mi><mspace width="1em"></mspace><mi>b</mi>',['\u2003'],['\u200B']),
c('boxed','\\boxed → m:borderBox','<menclose notation="box"><mi>x</mi></menclose>',['<m:borderBox>']),
t('warn-menclose','\\cancel → warning, content kept',function(){
  var r=O().fromMathML(ML('<menclose notation="updiagonalstrike"><mi>x</mi></menclose>')),e=chk(r,['<m:t>x</m:t>']);
  return e!==true?e:(r.warnings.length===1&&r.warnings[0].code==='unsupported'&&r.warnings[0].arg==='menclose:updiagonalstrike')||'warning '+JSON.stringify(r.warnings);
}),
t('warn-partial','unsupported node → warning + text kept, ok stays true',function(){
  var r=O().fromMathML(ML('<mi>x</mi><maction><mi>y</mi></maction>')),e=chk(r,['<m:t>y</m:t>']);
  return e!==true?e:(r.warnings.length===1&&r.warnings[0].code==='unsupported'&&r.warnings[0].arg==='maction')||'warning '+JSON.stringify(r.warnings);
}),
t('warn-total','whole formula unsupported → ok=false, source text kept',function(){
  var r=O().fromMathML(ML('<maction><mi>y</mi></maction>'),{source:'\\weird{y}'});
  return !r.ok&&r.warnings.length===1&&r.xml.indexOf('<m:t>\\weird{y}</m:t>')>0&&O().validate(r.xml).ok||'got '+JSON.stringify(r);
}),
t('display','display → m:oMathPara',function(){
  var r=O().fromMathML(ML('<mi>x</mi>'),{display:true});
  return r.xml.indexOf('<m:oMathPara')===0&&r.xml.indexOf('<m:oMath>')>0?chk(r):'wrapper '+r.xml.slice(0,60);
}),
t('inline','inline → m:oMath with namespaces; ns:false omits them',function(){
  var r=O().fromMathML(ML('<mi>x</mi>')),q=O().fromMathML(ML('<mi>x</mi>'),{ns:false});
  return r.xml.indexOf('<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"')===0&&q.xml.indexOf('<m:oMath><m:r>')===0||'wrapper '+r.xml.slice(0,80)+' | '+q.xml.slice(0,30);
}),
t('font','math font: default Cambria Math, custom and escaped',function(){
  var a=O().fromMathML(ML('<mi>x</mi>')),b=O().fromMathML(ML('<mi>x</mi>'),{fontName:'A"B'});
  return a.xml.indexOf('w:ascii="Cambria Math"')>0&&b.xml.indexOf('w:ascii="A&quot;B"')>0&&O().validate(b.xml).ok||'font attr';
}),
t('run-font','every m:r carries rPr (math font)',function(){
  var r=O().fromMathML(ML('<mfrac><mi>a</mi><msqrt><mn>2</mn></msqrt></mfrac><mtext>u</mtext>'));
  return !/<m:r>(?!<m:rPr>|<w:rPr>)/.test(r.xml)&&cnt(r.xml,'<m:r>')>=3||'run without rPr';
}),
t('validate','validator rejects broken OMML',function(){
  var v=O().validate,g='<m:oMath><m:r><m:t>x</m:t></m:r></m:oMath>';
  return v(g).ok&&!v('<m:oMath><m:r></m:oMath>').ok&&!v('<m:oMath><m:foo/></m:oMath>').ok&&!v('<m:oMath><m:r><m:t>a & b</m:t></m:r></m:oMath>').ok&&!v('<m:oMath><m:t>x</m:t></m:oMath>').ok&&!v(g+g).ok&&!v('<m:oMath><m:r><m:t>a</m:t></m:r>').ok||'validator verdicts wrong';
}),
t('available','isAvailable() is boolean',function(){return typeof O().isAvailable()==='boolean'||'not boolean';}),
t('latex-inline','fromLatex: $…$ stripped, inline m:oMath',function(){
  var f=fake(ML('<msup><mi>x</mi><mn>2</mn></msup>'));
  return O().fromLatex('$x^2$',{toMathML:f.toMathML}).then(function(r){return f.seen!=='x^2'?'tex arg '+f.seen:r.xml.indexOf('<m:oMath ')!==0?'not inline':typeof r.fallbackText==='string'?chk(r,['<m:sSup>']):'no fallbackText';});
}),
t('latex-display','fromLatex: $$…$$ and opts.display → m:oMathPara',function(){
  var f=fake(ML('<mi>x</mi>'));
  return O().fromLatex('$$x$$',{toMathML:f.toMathML}).then(function(a){
    return O().fromLatex('x',{display:true,toMathML:f.toMathML}).then(function(b){return a.xml.indexOf('<m:oMathPara')===0&&b.xml.indexOf('<m:oMathPara')===0||'wrapper';});
  });
}),
t('latex-error','fromLatex: toMathML error → ok=false, warning, fallbackText',function(){
  var src='\\foo{x}',f=fake('','KaTeX parse error'),L=T.has('math.linear')?T.get('math.linear').convert(src).out:src;
  return O().fromLatex(src,{toMathML:f.toMathML}).then(function(r){
    return r.ok===false&&r.warnings[0].code==='error'&&r.fallbackText===L&&r.fallbackText.length>0&&O().validate(r.xml).ok&&r.xml.indexOf('\\foo{x}')>0||'got '+JSON.stringify(r);
  });
}),
t('latex-unsupported','fromLatex: unsupported construct → warning + fallbackText',function(){
  var f=fake(ML('<maction>z</maction>'));
  return O().fromLatex('\\weird',{toMathML:f.toMathML}).then(function(r){
    return r.ok===false&&r.warnings.some(function(w){return w.code==='unsupported';})&&typeof r.fallbackText==='string'&&r.fallbackText.length>0&&r.xml.indexOf('<m:t>\\weird</m:t>')>0||'got '+JSON.stringify(r);
  });
}),
t('latex-reject','fromLatex: rejected promise handled',function(){
  return O().fromLatex('x',{toMathML:function(){return Promise.reject(new Error('boom'));}}).then(function(r){return !r.ok&&r.warnings[0].arg==='boom'||'got '+JSON.stringify(r);});
}),
t('live','live KaTeX → OMML round-trip (needs network)',function(){
  if(!O().isAvailable())return 'math.latex not available';
  var bad=[];
  return LIVE.reduce(function(p,q){
    return p.then(function(){return O().fromLatex(q[0],{display:true}).then(function(r){
      var v=O().validate(r.xml);
      if(!r.ok||!v.ok||r.xml.indexOf(q[1])<0)bad.push(q[0]+' → '+(r.warnings[0]?r.warnings[0].code+':'+r.warnings[0].arg:v.ok?'missing '+q[1]:v.error));
    });});
  },Promise.resolve()).then(function(){return bad.length?bad.join(' | '):true;});
},'omml-live')
]);
})(window.Taraz=window.Taraz||{});