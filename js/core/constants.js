// Tarāz constants: Unicode classes, digit maps, bidi control names, character predicates.
(function(T){
'use strict';
var C={};
// Class bodies (strings, to be placed inside [...]); use C.rx() to compile.
C.RTL_LETTER='\\u0620-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FF\\u0750-\\u077F\\u08A0-\\u08C9\\uFB50-\\uFD3D\\uFD50-\\uFDFB\\uFE70-\\uFEFC';
C.HEBREW='\\u05D0-\\u05EA\\u05EF-\\u05F2';
C.MARK='\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED';
C.DIGIT_FA='\\u06F0-\\u06F9';C.DIGIT_AR='\\u0660-\\u0669';C.DIGIT_LAT='0-9';
C.LATIN_LETTER='A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u024F';
C.PUNCT_FA='\\u060C\\u061B\\u061F\\u066A-\\u066C\\u00AB\\u00BB';
/** Compile a class body into a RegExp "[body]" (add 'g' for global; global regexes are stateful). */
C.rx=function(body,flags){return new RegExp('['+body+']',flags);};
C.RE={
  rtlLetter:C.rx(C.RTL_LETTER),rtl:C.rx(C.RTL_LETTER+C.HEBREW),mark:C.rx(C.MARK),latin:C.rx(C.LATIN_LETTER),
  digitFa:C.rx(C.DIGIT_FA),digitAr:C.rx(C.DIGIT_AR),digitLat:C.rx(C.DIGIT_LAT),
  anyDigit:C.rx(C.DIGIT_LAT+C.DIGIT_AR+C.DIGIT_FA)
};

var CH={LRM:'\u200E',RLM:'\u200F',ALM:'\u061C',LRE:'\u202A',RLE:'\u202B',PDF:'\u202C',LRO:'\u202D',RLO:'\u202E',
  LRI:'\u2066',RLI:'\u2067',FSI:'\u2068',PDI:'\u2069',ZWSP:'\u200B',BOM:'\uFEFF',NBSP:'\u00A0'},NAME={};
Object.keys(CH).forEach(function(k){NAME[CH[k]]=k;});
C.CHAR=CH;          // name -> character
C.NAME=NAME;        // character -> name
C.ZWNJ='\u200C';C.ZWJ='\u200D';
C.BIDI_CONTROLS=['LRM','RLM','ALM','LRE','RLE','PDF','LRO','RLO','LRI','RLI','FSI','PDI'];
// Must never appear in Word/PowerPoint-bound output unless the user chose them (ENGINE LAW).
C.UNSAFE_IN_OFFICE=['LRE','RLE','PDF','LRO','RLO','LRI','RLI','FSI','PDI','ZWSP','BOM'];
/** Join the characters for a list of names. */
C.chars=function(names){return names.map(function(n){return CH[n];}).join('');};
C.RE.bidi=C.rx(C.chars(C.BIDI_CONTROLS));
C.RE.invisible=C.rx(C.chars(C.BIDI_CONTROLS.concat(['ZWSP','BOM'])));
C.AR_TO_FA={'\u064A':'\u06CC','\u0649':'\u06CC','\u0643':'\u06A9'}; // Arabic yeh/alef maksura/kaf -> Persian

/** Name (LRM, RLM, ...) of a special character, or null. */
C.nameOf=function(ch){return (ch&&NAME[ch.charAt(0)])||null;};
C.isBidiControl=function(ch){return C.BIDI_CONTROLS.indexOf(C.nameOf(ch))>=0;};
/** True for a strong RTL letter (Arabic-script or Hebrew); digits are not RTL. */
C.isRtlChar=function(ch){return !!ch&&C.RE.rtl.test(ch.charAt(0));};
C.isLatinChar=function(ch){return !!ch&&C.RE.latin.test(ch.charAt(0));};
C.isDigit=function(ch){return !!ch&&C.RE.anyDigit.test(ch.charAt(0));};
/** 'fa' | 'ar' | 'lat' | null */
C.digitKind=function(ch){
  if(!ch)return null;ch=ch.charAt(0);
  return C.RE.digitFa.test(ch)?'fa':C.RE.digitAr.test(ch)?'ar':C.RE.digitLat.test(ch)?'lat':null;
};
/** Debug label like "U+200F RLM". */
C.label=function(ch){
  var cp=ch.codePointAt(0),n=C.nameOf(ch);
  return 'U+'+cp.toString(16).toUpperCase().padStart(4,'0')+(n?' '+n:'');
};

C.toLatinDigits=function(s){
  return String(s).replace(/[\u06F0-\u06F9]/g,function(c){return c.charCodeAt(0)-0x6F0;})
    .replace(/[\u0660-\u0669]/g,function(c){return c.charCodeAt(0)-0x660;});
};
function toBase(s,base,re){
  return String(s).replace(re,function(c){var n=c.charCodeAt(0);return String.fromCharCode(base+(n<=57?n-48:n>=0x6F0?n-0x6F0:n-0x660));});
}
C.toPersianDigits=function(s){return toBase(s,0x6F0,/[0-9\u0660-\u0669]/g);};
C.toArabicDigits=function(s){return toBase(s,0x660,/[0-9\u06F0-\u06F9]/g);};

T.C=C;
T.CREDIT='Built by Gholamreza Nejati Jahromi';
T.register('constants',C);
})(window.Taraz=window.Taraz||{});