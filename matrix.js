/* Portfólio · tema Matrix da aba Websites. O CSS (id sites-css) cuida das cores e dos glitches de entrada e saída (pop.js decide quando).
   Este arquivo liga e desliga o que precisa de código: chuva de códigos, filtro verde nos ícones, texto digitado, glitches raros e o glitch de saída ao trocar de aba. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduz=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rnd=function(a,b){return a+Math.random()*(b-a)};
  var ligado=false,chuva={cv:null,g:null,t:null,cols:0,gotas:[],tam:16,w:0,h:0},laco=null,io=null,feitos=typeof WeakSet==='function'?new WeakSet():null;

  /* ---------- filtro verde com ruído ---------- */
  function filtro(on){
    var ex=$('#mx-filtros');
    if(!on){if(ex)ex.remove();return}
    if(ex)return;
    var NS='http://www.w3.org/2000/svg',s=document.createElementNS(NS,'svg');
    s.id='mx-filtros';s.setAttribute('width','0');s.setAttribute('height','0');s.setAttribute('aria-hidden','true');s.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML='<filter id="mx-verde" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">'+
      '<feColorMatrix in="SourceGraphic" type="matrix" values="0.04 0.08 0.02 0 0  0.38 0.74 0.14 0 0.05  0.1 0.2 0.05 0 0  0 0 0 1 0" result="v"/>'+
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="4" result="r">'+(reduz?'':'<animate attributeName="baseFrequency" calcMode="discrete" dur="0.9s" values="0.9;0.75;1;0.8;0.95" repeatCount="indefinite"/>')+'</feTurbulence>'+
      '<feColorMatrix in="r" type="matrix" values="0 0 0 0 0  1.3 0 0 0 -0.38  0 0 0 0 0  0 0 0 0 1" result="rg"/>'+
      '<feComposite in="v" in2="rg" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" result="s"/>'+
      '<feComposite in="s" in2="SourceAlpha" operator="in"/></filter>';
    document.body.appendChild(s);
  }

  /* ---------- chuva de códigos ---------- */
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
  var rt=null;function redim(){clearTimeout(rt);rt=setTimeout(function(){if(chuva.cv)mede()},200)}
  function ligaChuva(){
    if(chuva.cv)return;
    var cv=document.createElement('canvas');cv.id='chuva-aba';cv.setAttribute('aria-hidden','true');
    document.body.insertBefore(cv,document.body.firstChild);
    chuva.cv=cv;chuva.g=cv.getContext('2d');mede();
    if(reduz){for(var k=0;k<50;k++)passo()}else chuva.t=setInterval(passo,70);
    window.addEventListener('resize',redim);
  }
  function desligaChuva(){
    if(!chuva.cv)return;
    clearInterval(chuva.t);chuva.t=null;window.removeEventListener('resize',redim);
    chuva.cv.remove();chuva.cv=null;chuva.g=null;
  }

  /* ---------- texto digitado ---------- */
  function digita(el,maxTicks){
    var nos=[],w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    while(w.nextNode())nos.push(w.currentNode);
    var tx=nos.map(function(n){return n.nodeValue}),total=tx.reduce(function(a,t){return a+t.length},0);
    if(!total||reduz)return;
    var h=el.offsetHeight;if(h)el.style.minHeight=h+'px';
    nos.forEach(function(n){n.nodeValue=''});
    var cur=document.createElement('span');cur.className='cur-t';cur.setAttribute('aria-hidden','true');cur.textContent='█';
    var j=0,k=0,porTick=Math.max(1,Math.ceil(total/(maxTicks||60)));
    function poe(){var n=nos[j];if(n.nextSibling)n.parentNode.insertBefore(cur,n.nextSibling);else n.parentNode.appendChild(cur)}
    poe();
    (function tick(){
      for(var q=0;q<porTick&&j<nos.length;q++){k++;nos[j].nodeValue=tx[j].slice(0,k);if(k>=tx[j].length){j++;k=0;if(j<nos.length)poe()}}
      if(j<nos.length)setTimeout(tick,26);
      else setTimeout(function(){if(cur.parentNode)cur.parentNode.removeChild(cur);el.style.minHeight=''},260);
    })();
  }
  var ALVOS='#p-sites .cab h2, #p-sites .cab p, #p-sites .app-id h3, #p-sites .app-id .tp';
  function ligaDigitacao(){
    if(reduz||!('IntersectionObserver' in window))return;
    $$(ALVOS).forEach(function(el){if(!(feitos&&feitos.has(el))&&!el.classList.contains('tp-pre')&&!el.dataset.mxFeito)el.classList.add('tp-pre')});
    if(io)io.disconnect();
    io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;var el=e.target;io.unobserve(el);
      if(feitos){if(feitos.has(el))return;feitos.add(el)}el.dataset.mxFeito='1';
      el.classList.remove('tp-pre');digita(el,el.matches('h2,h3')?40:70);
    })},{threshold:.15});
    $$('.tp-pre').forEach(function(el){io.observe(el)});
  }
  function desligaDigitacao(){
    if(io){io.disconnect();io=null}
    $$('.tp-pre').forEach(function(el){el.classList.remove('tp-pre')});
  }

  /* ---------- glitches raros ---------- */
  function visivel(el){var r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>60&&r.top<window.innerHeight-20}
  function glitch(el,ms){el.classList.add('mx-gl');setTimeout(function(){el.classList.remove('mx-gl')},ms||460)}
  function ligaGlitches(){
    if(reduz||laco)return;
    (function volta(){
      laco=setTimeout(function(){
        if(!document.hidden&&document.body.dataset.tema==='matrix'){
          var c=$$('#p-sites h2, #p-sites h3, #p-sites .btn, #p-sites .sel-ic, #p-sites .app-ic, .marca, .aba, .sel').filter(visivel);
          if(c.length){var n=Math.random()<.3?2:1;for(var i=0;i<n;i++)glitch(c[Math.floor(Math.random()*c.length)],rnd(380,520))}
        }
        volta();
      },rnd(6000,15000));
    })();
  }
  function desligaGlitches(){clearTimeout(laco);laco=null}

  /* ---------- liga e desliga conforme a aba ---------- */
  function liga(){
    if(ligado)return;ligado=true;
    filtro(true);ligaChuva();
    $$('#p-sites .sel-ic, #p-sites .app-ic').forEach(function(im,i){im.style.setProperty('--i',String(i%8))});
    ligaDigitacao();ligaGlitches();
  }
  function desliga(){
    if(!ligado)return;ligado=false;
    filtro(false);desligaChuva();desligaDigitacao();desligaGlitches();
  }
  function confere(){if(document.body.dataset.tema==='matrix')liga();else desliga()}
  function inicia(){
    new MutationObserver(confere).observe(document.body,{attributes:true,attributeFilter:['data-tema']});
    confere();
    /* ao sair da aba Websites, a página some com glitch antes de trocar */
    var vai0=window.vai;
    if(typeof vai0==='function'&&!reduz){
      window.vai=function(id,rolar){
        var args=arguments,ctx=this;
        if(document.body.dataset.tema==='matrix'&&id!=='sites'&&!window.__mxSaindo){
          window.__mxSaindo=true;
          var alvo=$('#p-sites');if(alvo)alvo.classList.add('mx-saindo');
          setTimeout(function(){if(alvo)alvo.classList.remove('mx-saindo');window.__mxSaindo=false;vai0.apply(ctx,args)},300);
          return;
        }
        return vai0.apply(ctx,args);
      };
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inicia);else inicia();
})();
