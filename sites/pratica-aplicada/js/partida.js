/* Prática aplicada · partida: cada partida sorteia (ou deixa escolher) um tipo de site, um layout e um estilo; o relógio mede o tempo de cada etapa
   e, ao concluir, mostra o tempo, a nota e se foi bom ou ruim. Tudo guardado no navegador. */
(function(){
  'use strict';
  var PA=window.PA,Arm=PA.Arm,$=PA.$,Som=PA.Som;

  var TIPOS={
    padaria:{id:'padaria',nome:'Padaria do Zé',slug:'padaria',cliente:'Zé, o padeiro',meta:'mostrar o cardápio e receber pedidos',slogan:'Pão quente toda manhã.',rotuloLista:'Cardápio',
      itens:['Pão francês · R$ 0,80','Pão de queijo · R$ 4,00','Bolo de milho · R$ 9,00'],imgs:['pao','queijo','bolo'],extras:['capivara','jabuti','item_coracao'],alt:['Pão francês','Pão de queijo','Bolo de milho'],
      contato:'Rua das Flores, 120 · todo dia, 6h às 19h',
      paginas:[{id:'inicio',n:'Início',d:'apresenta a padaria e leva às outras páginas'},{id:'cardapio',n:'Cardápio',d:'lista os produtos e os preços'},{id:'contato',n:'Contato',d:'endereço, horário e como pedir'},{id:'sobre',n:'Sobre nós',d:'a história da padaria'},{id:'blog',n:'Blog de receitas',d:'textos e receitas (dá mais trabalho para manter)'}],essenciais:['inicio','cardapio','contato']},
    barbearia:{id:'barbearia',nome:'Barbearia do Léo',slug:'barbearia',cliente:'Léo, o barbeiro',meta:'mostrar os serviços e receber agendamentos',slogan:'Corte na régua, todo dia.',rotuloLista:'Serviços',
      itens:['Corte · R$ 35','Barba · R$ 25','Pezinho · R$ 15'],imgs:['onca-pintada','item_escudo','item_medalha'],extras:['tatu','quati','estrela'],alt:['Corte','Barba','Pezinho'],
      contato:'Rua do Centro, 45 · seg a sáb, 9h às 20h',
      paginas:[{id:'inicio',n:'Início',d:'apresenta a barbearia e leva às outras páginas'},{id:'servicos',n:'Serviços',d:'lista o que a barbearia faz e os preços'},{id:'agendar',n:'Agendar',d:'como marcar um horário'},{id:'galeria',n:'Galeria',d:'fotos de cortes (precisa de várias fotos)'},{id:'sobre',n:'Sobre',d:'a equipe e a história'}],essenciais:['inicio','servicos','agendar']},
    portfolio:{id:'portfolio',nome:'Portfólio da Ana',slug:'portfolio',cliente:'Ana, a designer',meta:'mostrar os trabalhos e receber contatos',slogan:'Design que conta histórias.',rotuloLista:'Projetos',
      itens:['Logo da Padaria do Zé','Embalagem do Café Sol','Cartaz da Feira Verde'],imgs:['coruja','notebook','estrela'],extras:['mico-leao-dourado','lobo-guara','nuvem'],alt:['Logo','Embalagem','Cartaz'],
      contato:'ana@exemplo.com · responde em até 1 dia útil',
      paginas:[{id:'inicio',n:'Início',d:'apresenta a Ana e leva às outras páginas'},{id:'projetos',n:'Projetos',d:'mostra os trabalhos com imagens'},{id:'contato',n:'Contato',d:'e-mail e redes para falar com ela'},{id:'sobre',n:'Sobre',d:'quem é a Ana'},{id:'curriculo',n:'Currículo',d:'experiências e cursos'}],essenciais:['inicio','projetos','contato']}
  };
  var LAYOUTS={
    coluna:{id:'coluna',nome:'Coluna única',desc:'Tudo em uma coluna, de cima para baixo: cabeçalho, menu, conteúdo e rodapé.',par:240},
    cartoes:{id:'cartoes',nome:'Cabeçalho + 3 cartões',desc:'Um topo e três blocos (section), um para cada item, lado a lado.',par:330},
    lateral:{id:'lateral',nome:'Menu lateral',desc:'Um menu (nav) numa coluna ao lado e o conteúdo (main) no resto.',par:210}
  };
  var ESTILOS={
    artesanal:{id:'artesanal',nome:'Artesanal',desc:'Creme, marrom e fonte com serifa. Calor de padaria de bairro.'},
    pixel:{id:'pixel',nome:'Pixel de game',desc:'Fundo noite, ouro e bordas de pixel.'},
    editorial:{id:'editorial',nome:'Editorial',desc:'Preto, branco, muito respiro e títulos grandes.'},
    neon:{id:'neon',nome:'Neon',desc:'Noite com azul e rosa vivos, bordas brilhantes.'}
  };
  var PARES={fluxo:100};

  function sorteia(o){var ks=Object.keys(o);return ks[Math.floor(Math.random()*ks.length)]}
  var P={TIPOS:TIPOS,LAYOUTS:LAYOUTS,ESTILOS:ESTILOS};

  /* ---------- estado ---------- */
  P.get=function(){return Arm.le('partida',null)};
  P.grava=function(p){Arm.grava('partida',p)};
  P.nova=function(o){
    o=o||{};var p={tipo:o.tipo||sorteia(TIPOS),layout:o.layout||sorteia(LAYOUTS),estilo:o.estilo||sorteia(ESTILOS),fluxo:[],etapas:{},ativa:null,inicio:null,fim:null,criada:Date.now()};
    P.grava(p);return p;
  };
  P.par=function(etapa,p){p=p||P.get();if(etapa==='fluxo')return PARES.fluxo;if(etapa==='html')return LAYOUTS[p.layout].par;return 300};

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
    else{est=0;rot='Lento';bom=false;msg='Demorou bastante. Sem problema: tente outra partida e use a cola de comandos.'}
    return {est:est,rot:rot,bom:bom,msg:msg,razao:r};
  };
  P.estrelas=function(n){return '★'.repeat(n)+'☆'.repeat(3-n)};

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
  window.PA.Partida=P;
})();
