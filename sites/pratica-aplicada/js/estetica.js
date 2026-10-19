/* Prática aplicada · estética secundária "Matrix": verde, chuva de códigos, sprites com filtro verde, ruído e flutuação.
   Botão #matrix ao lado do botão de tema. A escolha fica guardada em localStorage (pa:estetica) e vale para todas as páginas. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var raiz=document.documentElement;
  var guarda={
    le:function(){try{return JSON.parse(localStorage.getItem('pa:estetica'))!=='padrao'}catch(e){return true}},
    grava:function(v){try{localStorage.setItem('pa:estetica',JSON.stringify(v?'matrix':'padrao'))}catch(e){}}
  };
  var reduz=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var botao=$('#matrix'),fav=$('link[rel=icon]');
  var favPadrao=fav&&fav.getAttribute('href'),favMatrix=fav&&fav.getAttribute('data-matrix');

  /* cada sprite flutua em um ritmo um pouco diferente */
  $$('img.spr').forEach(function(im,i){im.style.setProperty('--i',String(i%8))});

  /* ---------- filtro verde com ruído (SVG) ---------- */
  function filtro(on){
    var ex=$('#pa-filtros');
    if(!on){if(ex)ex.remove();return}
    if(ex)return;
    var NS='http://www.w3.org/2000/svg',s=document.createElementNS(NS,'svg');
    s.id='pa-filtros';s.setAttribute('width','0');s.setAttribute('height','0');s.setAttribute('aria-hidden','true');s.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML='<filter id="pa-verde" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">'+
      '<feColorMatrix in="SourceGraphic" type="matrix" values="0.04 0.08 0.02 0 0  0.38 0.74 0.14 0 0.05  0.1 0.2 0.05 0 0  0 0 0 1 0" result="v"/>'+
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="4" result="r">'+(reduz?'':'<animate attributeName="baseFrequency" calcMode="discrete" dur="0.9s" values="0.9;0.75;1;0.8;0.95" repeatCount="indefinite"/>')+'</feTurbulence>'+
      '<feColorMatrix in="r" type="matrix" values="0 0 0 0 0  1.3 0 0 0 -0.38  0 0 0 0 0  0 0 0 0 1" result="rg"/>'+
      '<feComposite in="v" in2="rg" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" result="s"/>'+
      '<feComposite in="s" in2="SourceAlpha" operator="in"/></filter>';
    document.body.appendChild(s);
  }

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
        var ch=CH[Math.floor(Math.random()*CH.length)];
        g.fillStyle='#c6ffd8';g.fillText(ch,i*c.tam,y*c.tam);
        if(y>1){g.fillStyle='#39ff7a';g.fillText(CH[Math.floor(Math.random()*CH.length)],i*c.tam,(y-1)*c.tam)}
      }
      c.gotas[i]=(y*c.tam>c.h&&Math.random()>0.975)?Math.floor(Math.random()*-20):y+1;
    }
  }
  function ligaChuva(){
    if(chuva.cv)return;
    var cv=document.createElement('canvas');cv.id='chuva';cv.setAttribute('aria-hidden','true');
    document.body.insertBefore(cv,document.body.firstChild);
    chuva.cv=cv;chuva.g=cv.getContext('2d');mede();
    if(reduz){for(var k=0;k<50;k++)passo()}else chuva.t=setInterval(passo,70);
    window.addEventListener('resize',redim);
  }
  var rt=null;function redim(){clearTimeout(rt);rt=setTimeout(function(){if(chuva.cv)mede()},200)}
  function desligaChuva(){
    if(!chuva.cv)return;
    clearInterval(chuva.t);chuva.t=null;window.removeEventListener('resize',redim);
    chuva.cv.remove();chuva.cv=null;chuva.g=null;
  }

  /* ---------- liga e desliga ---------- */
  function aplica(on){
    if(on)raiz.dataset.estetica='matrix';else delete raiz.dataset.estetica;
    if(botao){botao.setAttribute('aria-pressed',String(on));var t=$('span',botao);if(t)t.textContent='Matrix'}
    if(fav){var h=on&&favMatrix?favMatrix:favPadrao;if(h)fav.setAttribute('href',h)}
    var tc=$('meta[name=theme-color]');if(tc)tc.setAttribute('content',on?'#000d05':'#0A1A4D');
    if(bt){var esc=raiz.dataset.tema==='escuro';bt.setAttribute('aria-label',on?'Sair do Matrix e usar o tema '+(esc?'escuro':'claro'):'Alternar tema claro e escuro');bt.title=on?'Sair do Matrix':''}
    filtro(on);if(on)ligaChuva();else desligaChuva();
  }
  /* dentro do Matrix o tema claro/escuro não aparece: o botão de tema sai do Matrix e mostra o tema escolhido (sai do Matrix) */
  var bt=$('#tema');
  if(bt)bt.addEventListener('click',function(e){if(raiz.dataset.estetica==='matrix'){e.stopImmediatePropagation();e.preventDefault();guarda.grava(false);aplica(false)}},true);
  aplica(guarda.le());
  if(botao)botao.addEventListener('click',function(){var on=!guarda.le();guarda.grava(on);aplica(on)});
})();
