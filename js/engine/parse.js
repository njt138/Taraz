// Tarāz engine/parse: text -> Block[] (raw text kept in block.text/line until inline.js and pipeline.js clean up). No DOM.
(function(T){
'use strict';
var E=T.get('engine')||T.register('engine',{}),DG='0-9\\u0660-\\u0669\\u06F0-\\u06F9';
var RE={
 fence:/^\s{0,3}(`{3,}|~{3,})\s*([\w+#.-]*)/,
 head:/^\s{0,3}(#{1,6})\s+(.*)$/,
 quote:/^\s{0,3}>\s?(.*)$/,
 li:new RegExp('^([ \\t]*)([-*+\\u2022]|['+DG+']{1,3}[.)\\-])\\s+(.*)$'),
 hr:/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/,
 sep:/^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)*\|?\s*$/,
 row:/^\s*\|.*\|\s*$/,
 task:/^\[([ xX])\]\s+/
};
function cells(l){
 var s=l.trim(),r=[],c='',i,ch,code=false;
 if(s.charAt(0)==='|')s=s.slice(1);
 if(s.length&&s.charAt(s.length-1)==='|'&&s.charAt(s.length-2)!=='\\')s=s.slice(0,-1);
 for(i=0;i<s.length;i++){
  ch=s.charAt(i);
  if(ch==='\\'&&i+1<s.length){c+=ch+s.charAt(++i);continue;}
  if(ch==='`')code=!code;
  if(ch==='|'&&!code){r.push(c.trim());c='';}else c+=ch;
 }
 r.push(c.trim());return r;
}
// Index of the last line of a display-math block starting at line i, or -1 (blank line / trailing text => not display math).
function mathEnd(L,i,n){
 var t=L[i].trim(),o=t.slice(0,2),cl=o==='$$'?'$$':o==='\\['?'\\]':null,k,x;
 if(!cl)return -1;
 x=t.indexOf(cl,2);
 if(x>=0)return t.slice(x+2).trim()?-1:i;
 for(k=i+1;k<n&&k<i+200;k++){
  if(!L[k].trim())return -1;
  x=L[k].indexOf(cl);
  if(x>=0)return L[k].slice(x+cl.length).trim()?-1:k;
 }
 return -1;
}
function tbl(L,j){
 var a=L[j],b=L[j+1];
 return b!=null&&a.indexOf('|')>=0&&((RE.sep.test(b)&&b.indexOf('|')>=0)||(RE.row.test(a)&&RE.row.test(b)));
}
/** Parse text into raw Blocks: {type,dir,inlines:[],text|rows,line,...}. */
E.parse=function(src){
 var L=String(src).replace(/\r\n?/g,'\n').split('\n'),n=L.length,out=[],stk=[],cur=null,i=0,m,k,e,w,ln;
 function add(b,l){b.line=l;b.dir='rtl';b.inlines=[];out.push(b);if(b.type!=='li')stk=[];return b;}
 while(i<n){
  ln=L[i];
  if(!ln.trim()){cur=null;i++;continue;}
  if((m=RE.fence.exec(ln))){
   k=new RegExp('^\\s{0,3}'+m[1].charAt(0)+'{'+m[1].length+',}\\s*$');
   for(e=i+1;e<n&&!k.test(L[e]);e++);
   add({type:'code',lang:m[2],text:L.slice(i+1,e).join('\n')},i);cur=null;i=e+1;continue;
  }
  if((e=mathEnd(L,i,n))>=0){add({type:'math',text:L.slice(i,e+1).join('\n').trim()},i);cur=null;i=e+1;continue;}
  if((m=RE.head.exec(ln))){add({type:'h',level:m[1].length,text:m[2].replace(/\s+#+\s*$/,'').trim()},i);cur=null;i++;continue;}
  if(RE.hr.test(ln)){add({type:'p',text:ln.trim()},i);cur=null;i++;continue;}
  if(RE.quote.test(ln)){
   for(e=i,k=[];e<n&&(m=RE.quote.exec(L[e]));e++)k.push(m[1]);
   add({type:'quote',text:k.join('\n')},i);cur=null;i=e;continue;
  }
  if(tbl(L,i)){
   for(e=i,k=[];e<n&&L[e].trim()&&L[e].indexOf('|')>=0;e++){
    if(e===i+1&&RE.sep.test(L[e]))continue;
    k.push(cells(L[e]));
   }
   w=Math.max.apply(null,k.map(function(r){return r.length;}));
   k.forEach(function(r){while(r.length<w)r.push('');});
   add({type:'table',rows:k},i);cur=null;i=e;continue;
  }
  if((m=RE.li.exec(ln))){
   w=m[1].replace(/\t/g,'    ').length;
   while(stk.length&&w<stk[stk.length-1])stk.pop();
   if(!stk.length||w>stk[stk.length-1])stk.push(w);
   k={type:'li',level:stk.length-1,ordered:/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(m[2]),marker:m[2],text:m[3].trim()};
   if((e=RE.task.exec(k.text))){k.task=true;k.checked=e[1].toLowerCase()==='x';k.text=k.text.slice(e[0].length);}
   cur=add(k,i);i++;continue;
  }
  if(cur&&(cur.type==='p'||cur.type==='li'))cur.text+='\n'+ln.trim();
  else cur=add({type:'p',text:ln.trim()},i);
  i++;
 }
 return out;
};
})(window.Taraz=window.Taraz||{});