/* Prática aplicada · estética Matrix (a única do site): chuva de códigos, sprites com filtro verde e ruído, texto digitado como num
   terminal antigo, glitch de entrada e de saída, glitches raros em títulos, botões e ícones. Expõe PA.Fx para o resto dos scripts. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var raiz=document.documentElement;
  raiz.dataset.estetica='matrix';
  var reduz=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rnd=function(a,b){return a+Math.random()*(b-a)};

  /* cada sprite flutua em um ritmo um pouco diferente */
  $$('img.spr').forEach(function(im,i){im.style.setProperty('--i',String(i%8))});

  /* ---------- filtro verde com ruído (SVG) ---------- */
  (function(){
    var NS='http://www.w3.org/2000/svg',s=document.createElementNS(NS,'svg');
    s.id='pa-filtros';s.setAttribute('width','0');s.setAttribute('height','0');s.setAttribute('aria-hidden','true');s.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML='<filter id="pa-verde" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">'+
      '<feColorMatrix in="SourceGraphic" type="matrix" values="0.04 0.08 0.02 0 0  0.38 0.74 0.14 0 0.05  0.1 0.2 0.05 0 0  0 0 0 1 0" result="v"/>'+
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="4" result="r">'+(reduz?'':'<animate attributeName="baseFrequency" calcMode="discrete" dur="0.9s" values="0.9;0.75;1;0.8;0.95" repeatCount="indefinite"/>')+'</feTurbulence>'+
      '<feColorMatrix in="r" type="matrix" values="0 0 0 0 0  1.3 0 0 0 -0.38  0 0 0 0 0  0 0 0 0 1" result="rg"/>'+
      '<feComposite in="v" in2="rg" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" result="s"/>'+
      '<feComposite in="s" in2="SourceAlpha" operator="in"/></filter>';
    document.body.appendChild(s);
  })();

  /* ---------- chuva de códigos ---------- */
  var chuva={cv:null,t:null,g:null,cols:0,gotas:[],tam:16,w:0,h:0};
  var CH='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン01234567890{}[]<>/;=()$#&*+-_'.split('');
  function mede(){
    var c=chuva;c.tam=window.innerWidth<640?14:16;c.w=window.innerWidth;c.h=window.innerHeight;
    c.cv.width=c.w;c.cv.height=c.h;c.cols=Math.ceil(c.w/c.tam);
    c.gotas=[];for(var i=0;i<c.cols;i++)c.gotas.push(Math.floor(Math.random()*-c.h/c.tam));
    c.g.fillStyle='#000d05';c.g.fillRect(0,0,c.w,c.h);
  }
  function passo(){
    var c=chuva,g=c.g;if(!g||document.hidden)return;
    g.fillStyle='rgba(0,13,5,0.12)';g.fillRect(0,0,c.w,c.h);
    g.font=c.tam+'px "Space Mono",monospace';
    for(var i=0;i<c.cols;i++){
      var y=c.gotas[i];if(y>=0){
        g.fillStyle='#c6ffd8';g.fillText(CH[Math.floor(Math.random()*CH.length)],i*c.tam,y*c.tam);
        if(y>1){g.fillStyle='#39ff7a';g.fillText(CH[Math.floor(Math.random()*CH.length)],i*c.tam,(y-1)*c.tam)}
      }
      c.gotas[i]=(y*c.tam>c.h&&Math.random()>0.975)?Math.floor(Math.random()*-20):y+1;
    }
  }
  (function(){
    var cv=document.createElement('canvas');cv.id='chuva';cv.setAttribute('aria-hidden','true');
    document.body.insertBefore(cv,document.body.firstChild);
    chuva.cv=cv;chuva.g=cv.getContext('2d');mede();
    if(reduz){for(var k=0;k<50;k++)passo()}else chuva.t=setInterval(passo,70);
    var rt=null;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(mede,200)});
  })();

  /* ---------- texto digitado, como num terminal antigo ---------- */
  function digita(el,opc){
    opc=opc||{};var nos=[],w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    while(w.nextNode())nos.push(w.currentNode);
    var tx=nos.map(function(n){return n.nodeValue}),total=tx.reduce(function(a,t){return a+t.length},0);
    if(!total||reduz){if(opc.fim)opc.fim();return}
    var h=el.offsetHeight;if(h)el.style.minHeight=h+'px';
    el.setAttribute('aria-busy','true');
    nos.forEach(function(n){n.nodeValue=''});
    var cur=document.createElement('span');cur.className='cur-t';cur.setAttribute('aria-hidden','true');cur.textContent='█';
    var j=0,k=0,porTick=Math.max(1,Math.ceil(total/(opc.maxTicks||70))),ms=opc.ms||26;
    function poe(){var n=nos[j];if(n.nextSibling)n.parentNode.insertBefore(cur,n.nextSibling);else n.parentNode.appendChild(cur)}
    poe();
    (function tick(){
      for(var q=0;q<porTick&&j<nos.length;q++){
        k++;nos[j].nodeValue=tx[j].slice(0,k);
        if(k>=tx[j].length){j++;k=0;if(j<nos.length)poe()}
      }
      if(j<nos.length){setTimeout(tick,ms)}
      else{setTimeout(function(){if(cur.parentNode)cur.parentNode.removeChild(cur);el.style.minHeight='';el.removeAttribute('aria-busy');if(opc.fim)opc.fim()},opc.cursorFim==null?260:opc.cursorFim)}
    })();
  }

  /* títulos e textos de abertura são digitados na primeira vez que aparecem */
  if(!reduz&&'IntersectionObserver' in window){
    var feitos=typeof WeakSet==='function'?new WeakSet():null;
    $$('main h1, main h2, main .lead, main .cab > p').forEach(function(el){if(!el.querySelector('input,textarea,select'))el.classList.add('tp-pre')});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;var el=e.target;io.unobserve(el);
      if(feitos&&feitos.has(el))return;if(feitos)feitos.add(el);
      el.classList.remove('tp-pre');digita(el,{maxTicks:el.matches('h1,h2')?40:70});
    })},{threshold:.15});
    $$('.tp-pre').forEach(function(el){io.observe(el)});
  }

  /* ---------- glitch ---------- */
  function visivel(el){var r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>60&&r.top<window.innerHeight-20&&getComputedStyle(el).visibility!=='hidden'}
  function glitch(el,classe,ms){var c=classe||'gl';el.classList.add(c);setTimeout(function(){el.classList.remove(c)},ms||460)}
  /* glitches raros: um a cada 6 a 15 segundos, em um item visível por vez (às vezes dois) */
  if(!reduz){
    (function laco(){
      setTimeout(function(){
        if(!document.hidden){
          var c=$$('main h1, main h2, .marca b, .marca .logo, .btn, img.spr, .rot, .topo .menu a').filter(visivel);
          if(c.length){var n=Math.random()<.3?2:1;for(var i=0;i<n;i++)glitch(c[Math.floor(Math.random()*c.length)],'gl',rnd(380,520))}
        }
        laco();
      },rnd(6000,15000));
    })();
  }
  /* botões e blocos que passam a existir (deixam de ficar escondidos) entram com glitch */
  if('MutationObserver' in window&&!reduz){
    new MutationObserver(function(ms){ms.forEach(function(m){
      var el=m.target;if(m.attributeName==='hidden'&&!el.hidden&&el.matches&&el.matches('.btn,.chips button,.resultado,.fim'))glitch(el,'gl-in',560)
    })}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
  }
  /* saída: ao ir para outra página, o conteúdo some com glitch antes de trocar */
  document.addEventListener('click',function(e){
    if(reduz||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
    var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(mailto:|tel:|javascript:)/i.test(h))return;
    var u;try{u=new URL(a.href,location.href)}catch(x){return}
    if(u.origin!==location.origin||(u.pathname===location.pathname&&u.search===location.search))return;
    e.preventDefault();raiz.classList.add('gl-saindo');glitch(a,'gl-out',340);
    setTimeout(function(){location.href=a.href},340);
  });
  window.addEventListener('pageshow',function(e){if(e.persisted)raiz.classList.remove('gl-saindo')});

  window.PA=window.PA||{};
  window.PA.Fx={digita:digita,glitch:glitch,reduz:reduz};
})();
