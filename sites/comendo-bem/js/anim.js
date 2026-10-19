/* Comendo Bem · animações (papel e cinta). Marca elementos para entrarem ao rolar, desenha a cinta de rolagem, a passagem de página,
   o carimbo do desconto e os pequenos retornos das ferramentas. Não roda se a pessoa pediu para reduzir movimento. */
(function(){
  'use strict';
  if(!window.matchMedia||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var raiz=document.documentElement;

  /* ---------- passagem de página: a cinta atravessa a tela ---------- */
  var passa=document.createElement('div');passa.className='passa sem';passa.setAttribute('aria-hidden','true');document.body.appendChild(passa);
  var saiu=false;
  requestAnimationFrame(function(){requestAnimationFrame(function(){passa.classList.remove('sem');passa.classList.add('fora');saiu=true;setTimeout(abre,380)})});
  window.addEventListener('pageshow',function(e){if(e.persisted){passa.classList.add('sem');passa.classList.remove('entra');passa.classList.add('fora');void passa.offsetWidth;passa.classList.remove('sem')}});
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;
    var u;try{u=new URL(a.href,location.href)}catch(x){return}
    if(u.origin!==location.origin||u.pathname===location.pathname&&u.search===location.search||!/\.html?$|\/$/.test(u.pathname))return;
    e.preventDefault();
    passa.classList.add('sem');passa.classList.remove('fora');passa.classList.add('entra');void passa.offsetWidth;passa.classList.remove('sem','entra');
    setTimeout(function(){location.href=a.href},520);
  });

  /* ---------- entrada dos blocos ---------- */
  var SEL=['.hero .etq','.hero h1','.hero p.sub','.hero .acoes','.hero .foto','.selo-giro','.faixa','.cab','.selo','.passos li','.duas > *','details','.cartao','.tabela','.tabela tbody tr','.semana > *','.ferr > *','.rosa-bg .cx > h2'].join(',');
  var alvos=$$(SEL),fila=[],pronto=false;
  var HERO={'.hero .etq':0,'.hero h1':120,'.hero p.sub':320,'.hero .acoes':460,'.hero .foto':220};
  alvos.forEach(function(el){
    var d=0;
    for(var k in HERO){if(el.matches(k)){d=HERO[k]}}
    if(!el.matches('.hero *')){var irmaos=el.parentNode?Array.prototype.filter.call(el.parentNode.children,function(c){return c.tagName===el.tagName&&c.className===el.className}):[el];d=Math.min(irmaos.indexOf(el),6)*90}
    if(el.matches('.selo-giro'))d=1100;
    if(el.matches('.faixa'))d=Math.max(0,$$('.faixa').indexOf(el))*160;
    el.style.setProperty('--d',d+'ms');
    if(el.matches('.selo:nth-child(2n)'))el.style.setProperty('--r','2.2deg');
    el.classList.add('rv');
  });
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);if(pronto)mostra(e.target);else fila.push(e.target)})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  alvos.forEach(function(el){io.observe(el)});
  function mostra(el){el.classList.add('in')}
  function abre(){pronto=true;fila.forEach(mostra);fila=[]}

  /* ---------- barra de rolagem em forma de cinta e cintas que inclinam com a velocidade ---------- */
  var barra=document.createElement('div');barra.className='cinta-rolagem';barra.setAttribute('aria-hidden','true');document.body.appendChild(barra);
  var faixas=$$('.faixa'),ultimo=window.scrollY,sk=0,quadro=false;
  function rola(){
    var max=raiz.scrollHeight-innerHeight,y=window.scrollY;
    barra.style.setProperty('--p',max>0?Math.min(1,y/max).toFixed(4):0);
    var v=y-ultimo;ultimo=y;sk=sk*.85+v*.07;
    var g=Math.max(-3.5,Math.min(3.5,sk));
    faixas.forEach(function(f){f.style.setProperty('--sk',g.toFixed(2)+'deg')});
    quadro=Math.abs(sk)>.05;if(quadro)requestAnimationFrame(rola);else{faixas.forEach(function(f){f.style.setProperty('--sk','0deg')})}
  }
  window.addEventListener('scroll',function(){if(!quadro){quadro=true;requestAnimationFrame(rola)}},{passive:true});
  rola();

  /* ---------- menu lateral: pílula que acompanha o mouse ---------- */
  var nav=$('.rail nav');
  if(nav&&innerWidth>900){
    var p=document.createElement('i');p.className='pilula';nav.classList.add('com-pilula');nav.insertBefore(p,nav.firstChild);
    var mover=function(a){p.style.setProperty('--y',a.offsetTop+'px');p.style.height=a.offsetHeight+'px';p.classList.add('on')};
    $$('a',nav).forEach(function(a){a.addEventListener('mouseenter',function(){mover(a)});a.addEventListener('focus',function(){mover(a)})});
    nav.addEventListener('mouseleave',function(){p.classList.remove('on')});
  }

  /* ---------- carimbo de tinta ao clicar ---------- */
  document.addEventListener('pointerdown',function(e){
    var b=e.target.closest&&e.target.closest('.btn,.tamanhos button,.atalhos button,.opcoes button');
    if(!b||b.disabled)return;
    var r=b.getBoundingClientRect(),t=document.createElement('span');t.className='tinta';
    t.style.left=(e.clientX-r.left)+'px';t.style.top=(e.clientY-r.top)+'px';b.appendChild(t);
    setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t)},650);
  });

  /* ---------- monte a semana ---------- */
  var grade=$('#grade');
  if(grade){
    var cels=$$('.cel',grade),prev=cels.map(function(c){return c.dataset.v});
    var tot=$('#s-total'),desc=$('#s-desc'),sac=$('.sacola'),pcAnt=0;
    var selo=document.createElement('span');selo.className='selo-d';selo.setAttribute('aria-hidden','true');if(sac)sac.appendChild(selo);
    var num=function(t){return parseFloat(String(t).replace(/[^\d,]/g,'').replace(',','.'))||0};
    var BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
    var cont=0,raf=0;
    var conta=function(de,para){
      cancelAnimationFrame(raf);var t0=performance.now(),dur=520;
      (function f(t){var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);tot.textContent=BRL.format(de+(para-de)*e);if(k<1)raf=requestAnimationFrame(f)})(t0);
    };
    cont=num(tot.textContent);
    document.addEventListener('click',function(e){
      if(!e.target.closest('#grade,.tamanhos,.atalhos'))return;
      /* o site.js já recalculou: pop nas casas que mudaram e contagem do total */
      var mudou=[];cels.forEach(function(c,i){if(c.dataset.v!==prev[i]){mudou.push(c);prev[i]=c.dataset.v}});
      mudou.forEach(function(c,i){c.style.setProperty('--d',Math.min(i,14)*38+'ms');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')});
      var novo=num(tot.textContent);
      if(novo!==cont){conta(cont,novo);cont=novo}
      if(sac){sac.classList.remove('bump');void sac.offsetWidth;sac.classList.add('bump')}
      var m=/(\d+)%/.exec(desc?desc.textContent:''),pc=m?+m[1]:0;
      if(pc){selo.textContent=pc+'% OFF';if(pc!==pcAnt){selo.classList.remove('on');void selo.offsetWidth;selo.classList.add('on')}}else{selo.classList.remove('on')}
      pcAnt=pc;
    });
    grade.addEventListener('animationend',function(e){if(e.target.classList&&e.target.classList.contains('cel'))e.target.classList.remove('pop')});
  }

  /* ---------- proteína e preparo ---------- */
  var g=$('#p-faixa');
  if(g){var res=g.closest('.res');new MutationObserver(function(){if(!res)return;res.classList.remove('bump');void res.offsetWidth;res.classList.add('bump')}).observe(g,{childList:true,characterData:true,subtree:true})}
  var tt=$('#t-tempo'),anel=$('.anel');
  if(tt&&anel){
    var b=$('b',anel);
    new MutationObserver(function(){if(!b)return;b.classList.remove('tic');void b.offsetWidth;b.classList.add('tic')}).observe(tt,{childList:true,characterData:true,subtree:true});
    var av=$('#t-aviso');
    if(av)new MutationObserver(function(){var ok=/Pronto/.test(av.textContent);anel.classList.remove('fim');if(ok){void anel.offsetWidth;anel.classList.add('fim')}}).observe(av,{childList:true,characterData:true,subtree:true});
  }
})();
