/* Prática aplicada · partida: cada prática sorteia (ou deixa escolher) um tipo de site, um layout e um estilo; o relógio mede o tempo de cada etapa
   e, ao concluir, mostra o tempo, a nota e se foi bom ou ruim. Tudo guardado no navegador. */
(function(){
  'use strict';
  var PA=window.PA,Arm=PA.Arm,$=PA.$,Som=PA.Som;

  var TIPOS={
    cardapio:{id:'cardapio',caminho:'Cardápio',nome:'Padaria do Zé',slug:'padaria',cliente:'Zé, o padeiro',meta:'mostrar o cardápio e receber pedidos',slogan:'Pão quente toda manhã.',rotuloLista:'Cardápio',
      itens:['Pão francês · R$ 0,80','Croissant · R$ 6,00','Bolo de milho · R$ 9,00'],imgs:['pao','croissant','bolo'],extras:['rosquinha','cookie','cupcake'],alt:['Pão francês','Croissant','Bolo de milho'],
      contato:'Rua das Flores, 120 · todo dia, 6h às 19h',js:{botao:'Adicionar ao pedido',unidade:'item(ns) no pedido',total:'total do pedido',preco:6},
      paginas:[{id:'inicio',n:'Início',d:'apresenta a padaria e leva às outras páginas'},{id:'cardapio',n:'Cardápio',d:'lista os produtos e os preços'},{id:'contato',n:'Contato',d:'endereço, horário e como pedir'},{id:'sobre',n:'Sobre nós',d:'a história da padaria'},{id:'blog',n:'Blog de receitas',d:'textos e receitas (dá mais trabalho para manter)'}],essenciais:['inicio','cardapio','contato']},
    catalogo:{id:'catalogo',caminho:'Catálogo',nome:'Oficina Nova',slug:'oficina',cliente:'Marta, dona da loja',meta:'mostrar os produtos e facilitar a escolha',slogan:'Peças e aparelhos para quem gosta de consertar.',rotuloLista:'Produtos',
      itens:['Rádio portátil · R$ 120','Placa de controle · R$ 85','Bateria recarregável · R$ 40'],imgs:['radio','placa','bateria'],extras:['chip','cpu','parafuso'],alt:['Rádio portátil','Placa de controle','Bateria recarregável'],
      contato:'Av. Central, 300 · seg a sex, 9h às 18h',js:{botao:'Guardar na lista',unidade:'produto(s) na lista',total:'soma da lista',preco:85},
      paginas:[{id:'inicio',n:'Início',d:'apresenta a loja e leva às outras páginas'},{id:'produtos',n:'Catálogo',d:'lista os produtos com foto e preço'},{id:'contato',n:'Contato',d:'endereço, horário e telefone'},{id:'sobre',n:'Sobre a loja',d:'quem somos e o que vendemos'},{id:'garantia',n:'Garantia e trocas',d:'regras de troca (precisa de texto jurídico)'}],essenciais:['inicio','produtos','contato']},
    marketplace:{id:'marketplace',caminho:'Marketplace',nome:'Feira Digital',slug:'feira',cliente:'Rafa, organizador da feira',meta:'reunir vendedores e receber pedidos',slogan:'Produtos de vários vendedores num lugar só.',rotuloLista:'Produtos',
      itens:['Pão artesanal · R$ 8','Caderno de capa dura · R$ 28','Rádio vintage · R$ 75'],imgs:['pao','livro','radio'],extras:['tesoura','presente','chave'],alt:['Pão artesanal','Caderno de capa dura','Rádio vintage'],
      contato:'contato@feiradigital.exemplo',js:{botao:'Adicionar ao carrinho',unidade:'item(ns) no carrinho',total:'total do carrinho',preco:28},
      paginas:[{id:'inicio',n:'Início',d:'apresenta a feira e leva às outras páginas'},{id:'produtos',n:'Produtos',d:'todos os produtos de todos os vendedores'},{id:'entrar',n:'Entrar',d:'login de comprador e vendedor (exige segurança)'},{id:'vendedores',n:'Vendedores',d:'quem vende na feira'},{id:'carrinho',n:'Carrinho',d:'o que a pessoa escolheu comprar'}],essenciais:['inicio','produtos','entrar']},
    blog:{id:'blog',caminho:'Blog',nome:'Passo a Passo',slug:'blog',cliente:'Bia, autora do blog',meta:'publicar artigos e fidelizar leitores',slogan:'Tutoriais de tecnologia em português simples.',rotuloLista:'Artigos',
      itens:['Como escolher um domínio · 5 min de leitura','O que é um servidor · 4 min de leitura','Seu primeiro CSS · 7 min de leitura'],imgs:['livro','placa','cristal'],extras:['lupa','engrenagem','tela'],alt:['Artigo sobre domínios','Artigo sobre servidores','Artigo sobre CSS'],
      contato:'bia@passoapasso.exemplo · responde em até 2 dias',js:{botao:'Curtir o artigo',unidade:'curtida(s)',total:null,preco:0},
      paginas:[{id:'inicio',n:'Início',d:'apresenta o blog e os artigos mais recentes'},{id:'artigos',n:'Artigos',d:'lista de todos os artigos'},{id:'sobre',n:'Sobre',d:'quem escreve o blog'},{id:'entrar',n:'Área da autora',d:'login para publicar (exige segurança)'},{id:'contato',n:'Contato',d:'como falar com a autora'}],essenciais:['inicio','artigos','sobre']}
  };
  var LAYOUTS={
    coluna:{id:'coluna',nome:'Coluna única',desc:'Tudo em uma coluna, de cima para baixo: cabeçalho, menu, conteúdo e rodapé.',par:240},
    cartoes:{id:'cartoes',nome:'Cabeçalho + 3 cartões',desc:'Um topo e três blocos (section), um para cada item, lado a lado.',par:330},
    lateral:{id:'lateral',nome:'Menu lateral',desc:'Um menu (nav) numa coluna ao lado e o conteúdo (main) no resto.',par:210}
  };
  var ESTILOS={
    minimalista:{id:'minimalista',nome:'Minimalista claro',desc:'Fundo branco, texto escuro, um azul de destaque e muito espaço.'},
    escuro:{id:'escuro',nome:'Minimalista escuro',desc:'Fundo quase preto, texto claro e um azul suave de destaque.'},
    editorial:{id:'editorial',nome:'Editorial',desc:'Fonte com serifa, preto e branco e títulos grandes, como uma revista.'},
    artesanal:{id:'artesanal',nome:'Artesanal',desc:'Creme e marrom, cantos arredondados, calor de comércio de bairro.'}
  };
  var PARES={fluxo:100,css:240,resp:200,js:260,api:240,login:320,deploy:200};

  function sorteia(o){var ks=Object.keys(o);return ks[Math.floor(Math.random()*ks.length)]}
  var P={TIPOS:TIPOS,LAYOUTS:LAYOUTS,ESTILOS:ESTILOS};

  /* ---------- estado ---------- */
  P.get=function(){var p=Arm.le('partida',null);return p&&TIPOS[p.tipo]&&LAYOUTS[p.layout]&&ESTILOS[p.estilo]?p:null};
  P.grava=function(p){Arm.grava('partida',p)};
  P.nova=function(o){
    o=o||{};var p={tipo:o.tipo||sorteia(TIPOS),layout:o.layout||sorteia(LAYOUTS),estilo:o.estilo||sorteia(ESTILOS),fluxo:[],etapas:{},ativa:null,inicio:null,fim:null,criada:Date.now()};
    P.grava(p);return p;
  };
  P.par=function(etapa,p){p=p||P.get();if(etapa==='fluxo')return PARES.fluxo;if(etapa==='html')return LAYOUTS[p.layout].par;return PARES[etapa]||300};

  /* ---------- relógio: conta só enquanto a página está visível ---------- */
  var rel={etapa:null,t0:0,acum:0,iv:null};
  function agora(){return Date.now()}
  P.msEtapa=function(etapa,p){p=p||P.get();var e=p&&p.etapas[etapa];if(!e)return 0;var ms=(e.ms||0)+(e.pen||0)*1000;if(rel.etapa===etapa&&rel.t0)ms+=agora()-rel.t0;return ms};
  function fecha(){var p=P.get();if(!p||!rel.etapa||!rel.t0)return;var e=p.etapas[rel.etapa];if(e&&!e.fim){e.ms=(e.ms||0)+(agora()-rel.t0)}rel.t0=0;P.grava(p)}
  function retoma(){if(rel.etapa&&!rel.t0)rel.t0=agora()}
  document.addEventListener('visibilitychange',function(){if(document.hidden)fecha();else retoma()});
  window.addEventListener('pagehide',fecha);
  P.inicia=function(etapa){
    var p=P.get();if(!p)return null;
    if(!p.inicio)p.inicio=agora();
    p.etapas[etapa]=p.etapas[etapa]||{ms:0,pen:0,fim:false,pistas:0,erros:0};
    if(p.etapas[etapa].fim){return p}
    rel.etapa=etapa;rel.t0=agora();p.ativa=etapa;P.grava(p);return p;
  };
  P.penalidade=function(seg,motivo){var p=P.get();if(!p||!rel.etapa)return;var e=p.etapas[rel.etapa];if(!e||e.fim)return;e.pen=(e.pen||0)+seg;if(motivo==='pista')e.pistas=(e.pistas||0)+1;if(motivo==='erro')e.erros=(e.erros||0)+1;P.grava(p)};
  P.termina=function(etapa){
    var p=P.get();if(!p)return null;var e=p.etapas[etapa];if(!e)return null;
    if(rel.etapa===etapa&&rel.t0){e.ms=(e.ms||0)+(agora()-rel.t0);rel.t0=0}
    e.fim=true;rel.etapa=null;p.ativa=null;P.grava(p);return e;
  };
  P.fmt=function(ms){var s=Math.round(ms/1000),m=Math.floor(s/60);return (m<10?'0':'')+m+':'+(s%60<10?'0':'')+(s%60)};

  /* ---------- nota ---------- */
  P.nota=function(ms,par){
    var r=ms/1000/par,est,rot,bom,msg;
    if(r<=.7){est=3;rot='Excelente';bom=true;msg='Rapidíssimo e limpo. Dá para contratar!'}
    else if(r<=1){est=2;rot='Bom';bom=true;msg='Dentro do tempo esperado para esse tipo de site.'}
    else if(r<=1.5){est=1;rot='Dá para melhorar';bom=false;msg='Passou um pouco do tempo. Com a prática e menos pedidos de "mostra", fica rápido.'}
    else{est=0;rot='Lento';bom=false;msg='Demorou bastante. Sem problema: tente outra prática e use a cola de comandos.'}
    return {est:est,rot:rot,bom:bom,msg:msg,razao:r};
  };
  P.MEDALHAS=['med-bronze','med-prata','med-ouro','med-diamante'];
  P.estrelas=function(n){return ['Bronze','Prata','Ouro','Diamante'][n]};
  P.pintaMedalha=function(el,est,tipo){el.textContent='';var im=document.createElement('img');im.className='spr';im.src='img/'+P.MEDALHAS[est]+'.png';im.width=im.height=72;im.alt='';el.appendChild(im);var s=document.createElement('div');s.className='med-rot';s.textContent='Medalha de '+tipo+' · '+P.estrelas(est).toLowerCase();el.appendChild(s)};

  /* ---------- recordes ---------- */
  P.recorde=function(p){var r=Arm.le('recordes',{});return r[p.tipo+'/'+p.layout]||null};
  P.salvaRecorde=function(p,ms){var r=Arm.le('recordes',{}),k=p.tipo+'/'+p.layout,novo=!r[k]||ms<r[k];if(novo){r[k]=ms;Arm.grava('recordes',r)}return novo};

  /* ---------- HUD (relógio no topo) ---------- */
  P.hud=function(el){
    if(!el)return;
    var f=function(){var p=P.get();if(!p||!p.ativa){el.hidden=true;return}el.hidden=false;
      var ms=P.msEtapa(p.ativa,p);el.querySelector('.rel').textContent=P.fmt(ms);el.querySelector('.nm').textContent=TIPOS[p.tipo].nome;
      var par=P.par(p.ativa,p)*1000;el.dataset.estado=ms>par*1.5?'lento':ms>par?'atencao':'ok'};
    f();setInterval(f,1000);
  };
  /* HTML padrão da prática (mesmos blocos da aula 4); usado se a pessoa chegar ao CSS sem ter terminado o HTML */
  P.blocos=function(p){
    var T=TIPOS[p.tipo],pgs=p.fluxo.map(function(id){return T.paginas.filter(function(x){return x.id===id})[0]});
    var nav='<nav>'+pgs.map(function(x){return '<a href="'+(x.id==='inicio'?'index':x.id)+'.html">'+x.n+'</a>'}).join(' ')+'</nav>';
    var lis='<ul>'+T.itens.map(function(i){return '<li>'+i+'</li>'}).join('')+'</ul>';
    var im=function(i,w){return '<img src="imagens/'+T.imgs[i]+'.png" width="'+w+'" alt="'+T.alt[i]+'">'};
    var cab='<header><h1>'+T.nome+'</h1><p>'+T.slogan+'</p></header>',rod='<footer><p>'+T.contato+'</p></footer>',o;
    if(p.layout==='coluna')o=[cab,nav,'<main>'+im(0,96)+lis+'</main>',rod];
    else if(p.layout==='cartoes'){o=[cab,nav];T.itens.forEach(function(it,i){var pt=it.split(' · ');o.push('<section><h2>'+pt[0]+'</h2>'+im(i,64)+'<p>'+(pt[1]||'')+'</p></section>')});o.push(rod)}
    else o=[nav,'<main><h1>'+T.nome+'</h1><p>'+T.slogan+'</p>'+im(0,96)+lis+'</main>',rod];
    return o;
  };
  P.htmlPadrao=function(p){return P.blocos(p).join('\n')};
  P.PAL={
    minimalista:{bg:'#ffffff',fg:'#1a1a1a',acc:'#2563eb',soft:'#eef3ff',line:'#e3e6ee',font:'system-ui,sans-serif'},
    escuro:{bg:'#111418',fg:'#e8eaed',acc:'#6ea8fe',soft:'#1c2330',line:'#2b3340',font:'system-ui,sans-serif'},
    editorial:{bg:'#faf8f5',fg:'#111111',acc:'#111111',soft:'#ece8e1',line:'#d8d2c8',font:'Georgia,serif'},
    artesanal:{bg:'#f6ecd9',fg:'#3b2a1a',acc:'#b4561c',soft:'#ecd9b8',line:'#d9c19a',font:'Georgia,serif'}
  };
  /* CSS da aula 5 (caso a pessoa chegue ao responsivo sem tê-lo escrito) */
  P.cssPadrao=function(p){
    var C=P.PAL[p.estilo],lat=p.layout==='lateral',car=p.layout==='cartoes',col=p.layout==='coluna';
    var lay=col?'body{max-width:680px;margin:0 auto}':car?'body{display:grid;grid-template-columns:repeat(3,1fr);gap:20px} header,nav,footer{grid-column:1/-1}':'body{display:grid;grid-template-columns:220px 1fr;gap:24px} nav{grid-row:1/3} main,footer{grid-column:2}';
    return ['body{margin:0;padding:24px;font-family:'+C.font+';background:'+C.bg+';color:'+C.fg+'}','h1{font-size:2.4rem;letter-spacing:-.02em;margin:0 0 8px}',lay,
      'nav a{display:'+(lat?'block':'inline-block')+';padding:8px 14px;margin:0 6px 6px 0;border-radius:8px;text-decoration:none;color:'+C.acc+';background:'+C.soft+'}',
      'nav a{transition:background .2s,transform .2s} nav a:hover{background:'+C.acc+';color:'+C.bg+';transform:translateY(-2px)}',
      '@keyframes entra{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}} h1{animation:entra .6s ease both}',
      car?'img{width:72px;height:72px;image-rendering:pixelated} section{padding:18px;border:1px solid '+C.line+';border-radius:12px}':'img{width:72px;height:72px;image-rendering:pixelated} li{margin:6px 0}'].join('\n');
  };
  window.PA.Partida=P;
})();
