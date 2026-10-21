// Tarāz UI preview tab: serializer output with display controls, KaTeX formula renderer, mode badge, and empty state.
(function(T){
'use strict';
var h=T.h,t=function(k){return T.ut(k);},K='taraz.ui.v1',KV='0.16.11',
 CDN='https://cdn.jsdelivr.net/npm/katex@'+KV+'/dist/katex.min',VENDOR='vendor/katex/katex.min';
var kp=null;
function katex(){
  if(window.katex)return Promise.resolve(window.katex);
  if(!kp)kp=new Promise(function(res){
    if(!document.querySelector('link[data-tz-katex]')){
      document.head.appendChild(h('link',{rel:'stylesheet',href:CDN+'.css',crossorigin:'anonymous','data-tz-katex':'1'}));
    }
    var p;
    try{p=T.loadScript(CDN+'.js');}catch(e){p=Promise.reject(e);}
    Promise.resolve(p).then(function(){
      res(window.katex||null);
    },function(){
      var p2;
      try{p2=T.loadScript(VENDOR+'.js');}catch(e){p2=Promise.reject(e);}
      Promise.resolve(p2).then(function(){
        res(window.katex||null);
      },function(){
        kp=null;res(null);
      });
    });
  });
  return kp;
}

/** Mount the preview into container c; returns {update(state)}. */
function mount(c,x){
  var P=Object.assign({fs:16,lh:1.9,hl:false,fm:'rendered'},(T.lsGet(K,{})||{}).pv),pane=h('div',{class:'tz-pv',tabindex:'0',role:'document'}),lastR,lastE,lastSt;
  function save(){var u=T.lsGet(K,{})||{};u.pv=P;T.lsSet(K,u);}
  function apply(){pane.style.setProperty('--pv-fs',P.fs);pane.style.setProperty('--pv-lh',P.lh);pane.classList.toggle('hl',!!P.hl);}
  function ctl(k,key,min,max,step,fmt){
    var o=h('output',{class:'tz-mono'},fmt(P[key])),i=h('input',{type:'range',min:min,max:max,step:step,value:P[key],'aria-label':t(k),oninput:function(){P[key]=+i.value;o.textContent=fmt(P[key]);apply();save();}});
    return h('label',{class:'tz-ctl'},h('span',null,t(k)),i,o);
  }
  var chk=h('input',{type:'checkbox',checked:P.hl,onchange:function(){P.hl=chk.checked;apply();save();}});

  // Segmented control for formula display: rendered | latex | plain
  var fModes=[{id:'rendered',l:'رندر شده'},{id:'latex',l:'کد LaTeX'},{id:'plain',l:'متن ساده'}];
  var fSeg=h('div',{class:'tz-seg',role:'radiogroup','aria-label':'نمایش فرمول',title:'نمایش فرمول در پیش‌نمایش تأثیری بر متن کپی‌شده ندارد؛ خروجی کپی طبق تنظیم حالت فرمول (LaTeX یا متن ساده) عمل می‌کند.'});
  function renderFSeg(){
    fSeg.textContent='';
    fModes.forEach(function(m){
      var on=P.fm===m.id;
      fSeg.appendChild(h('button',{type:'button',role:'radio','aria-checked':String(on),onclick:function(){P.fm=m.id;save();renderFSeg();renderMath();}},m.l));
    });
  }
  renderFSeg();
  var fLabel=h('span',{class:'tz-ctl-label',style:{fontSize:'var(--fs-xs)',color:'var(--ink-2)'},title:'نمایش فرمول در پیش‌نمایش تأثیری بر متن کپی‌شده ندارد؛ خروجی کپی طبق تنظیم حالت فرمول (LaTeX یا متن ساده) عمل می‌کند.'},'نمایش فرمول:');

  // Mode badge indicating current mathMode
  var modeBadge=h('span',{class:'tz-badge',style:{marginInlineStart:'auto',fontWeight:'600'},title:'حالت فعال فرمول برای خروجی و تبدیل (تغییر از کشوی تنظیمات)'});

  var bar=h('div',{class:'tz-pvbar'},
    ctl('ui.fontSize','fs',13,26,1,String),
    ctl('ui.lineSpacing','lh',1.4,2.6,.1,function(v){return v.toFixed(1);}),
    h('label',{class:'tz-ctl'},chk,h('span',null,t('ui.hlRuns'))),
    h('div',{class:'tz-ctl',style:{gap:'var(--s1)'}},fLabel,fSeg),
    modeBadge
  );

  c.append(bar,pane);
  apply();

  function msg(k){pane.textContent='';pane.appendChild(h('p',{class:'tz-ph'},t(k)));}
  function empty(){
    pane.textContent='';
    pane.appendChild(h('div',{class:'tz-empty'},T.level('idle','lg'),h('h3',null,t('ui.empty.title')),h('p',null,t('ui.empty.hint')),
      h('div',{class:'tz-row'},[1,2,3].map(function(n){return h('button',{type:'button',class:'tz-btn',onclick:function(){x.loadSample(n-1);}},T.icon('sample',18),h('span',null,t('ui.sample.'+n)));}))));
  }

  function renderMath(){
    var els=pane.querySelectorAll('.tz-math');
    if(!els.length)return;
    if(P.fm==='latex'){
      els.forEach(function(el){
        var tx=el.getAttribute('data-tex')||el.textContent;
        el.textContent='';
        el.appendChild(h('code',{class:'tz-mono',dir:'ltr',style:{unicodeBidi:'isolate'}},tx));
      });
      return;
    }
    if(P.fm==='plain'){
      els.forEach(function(el){
        var ln=el.getAttribute('data-lin')||el.getAttribute('data-tex')||el.textContent;
        el.textContent='';
        el.appendChild(h('span',{class:'tz-math-b',dir:'ltr',style:{unicodeBidi:'isolate'}},ln));
      });
      return;
    }
    // rendered: try KaTeX, fallback to monospace LTR isolated span
    katex().then(function(k){
      els.forEach(function(el){
        var tx=el.getAttribute('data-tex')||el.textContent;
        var isDisp=el.getAttribute('data-display')==='1'||el.classList.contains('tz-math-block');
        if(!k){
          el.textContent='';
          el.appendChild(h('code',{class:'tz-mono',dir:'ltr',style:{unicodeBidi:'isolate'}},tx));
          return;
        }
        try{
          var wrap=document.createElement(isDisp?'div':'span');
          k.render(tx,wrap,{displayMode:isDisp,throwOnError:false,trust:false,strict:'ignore'});
          el.textContent='';
          el.appendChild(wrap);
        }catch(e){
          el.textContent='';
          el.appendChild(h('code',{class:'tz-mono',dir:'ltr',style:{unicodeBidi:'isolate'}},tx));
        }
      });
    });
  }

  function update(st){
    lastSt=st;
    var mm=(st.settings&&st.settings.mathMode)||'A';
    modeBadge.className='tz-badge '+(mm==='keep'?'':'ok');
    modeBadge.textContent=mm==='A'?'فرمول: حالت A (LaTeX)':mm==='B'?'فرمول: حالت B (متن ساده)':'فرمول: دست‌نخورده';

    var S=T.get('serialize'),e=!!st.input.trim();
    if(st.result===lastR&&e===lastE&&pane.firstChild){
      return;
    }
    lastR=st.result;lastE=e;
    if(!T.has('engine'))return msg('ui.noEngine');
    if(!S||typeof S.toHTML!=='function')return msg('ui.noSerialize');
    if(!st.result)return e?msg('ui.pending'):empty();
    try{
      pane.innerHTML=S.toHTML(st.result,st.settings,'preview');
      renderMath();
    }catch(err){msg('ui.noSerialize');}
  }
  return{update:update};
}
T.register('ui.preview',{mount:mount});
})(window.Taraz=window.Taraz||{});