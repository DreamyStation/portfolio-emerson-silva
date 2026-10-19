/* Prática aplicada · aula 4: HTML na prática. O terminal constrói o index.html do site da partida (tipo, layout e menu diferentes a cada vez) e a tela mostra o resultado ao vivo. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$,Som=PA.Som,P=PA.Partida;
  var p=P.get();
  var semPartida=!p||!p.etapas.fluxo||!p.etapas.fluxo.fim;
  $('#sem-partida').hidden=!semPartida;$('#com-partida').hidden=semPartida;
  P.hud($('#hud'));
  if(semPartida)return;

  var T=P.TIPOS[p.tipo],L=P.LAYOUTS[p.layout],ES=P.ESTILOS[p.estilo];
  var pgs=p.fluxo.map(function(id){return T.paginas.filter(function(x){return x.id===id})[0]});
  var SITE='~/'+T.slug;
  P.inicia('html');

  /* ---------- resumo da partida ---------- */
  var br=$('#brief');br.textContent='';
  [['Site',T.nome,'cliente: '+T.cliente],['Layout',L.nome,L.desc],['Menu (do seu fluxo)',pgs.map(function(x){return x.n}).join(' · '),'estilo que vem na aula de CSS: '+ES.nome]].forEach(function(x){
    var d=document.createElement('div'),s=document.createElement('small'),b=document.createElement('b'),sp=document.createElement('span');s.textContent=x[0];b.textContent=x[1];sp.textContent=x[2];d.append(s,b,sp);br.appendChild(d)});

  /* ---------- pasta de treino: o site tem uma pasta de imagens com opções de ícones ---------- */
  var sh=PA.Shell({inicio:function(S){
    var h=S.acha(['home','voce']);h.f.Downloads=PA.fsDir();
    var site=PA.fsDir();site.f.imagens=PA.fsDir();
    T.imgs.concat(T.extras).forEach(function(n){site.f.imagens.f[n+'.png']=PA.fsImg(n)});
    h.f[T.slug]=site;
  }});
  var opc=$('#opcoes-img');opc.textContent='';
  T.imgs.concat(T.extras).forEach(function(n){var f=document.createElement('figure'),i=document.createElement('img'),c=document.createElement('figcaption');i.src='img/'+n+'.png';i.alt=n;c.textContent=n+'.png';f.append(i,c);opc.appendChild(f)});

  /* ---------- comandos prontos (o "mostra" digita estes) ---------- */
  var q=function(s){return s.replace(/'/g,"")};
  var nav='<nav>'+pgs.map(function(x){return '<a href="'+(x.id==='inicio'?'index':x.id)+'.html">'+x.n+'</a>'}).join(' ')+'</nav>';
  var lis='<ul>'+T.itens.map(function(i){return '<li>'+i+'</li>'}).join('')+'</ul>';
  var imgTag=function(i,w){return '<img src="imagens/'+T.imgs[i]+'.png" width="'+w+'" alt="'+T.alt[i]+'">'};
  var primeiro=true;
  var redir=function(){var r=primeiro?'>':'>>';primeiro=false;return r};
  /* o 1º bloco usa > (cria/zera o arquivo); os outros usam >> (acrescentam) */
  var ordem=[];
  function bloco(tag,html){return {tag:tag,html:html}}
  if(p.layout==='coluna'){ordem=[bloco('header','<header><h1>'+T.nome+'</h1><p>'+T.slogan+'</p></header>'),bloco('nav',nav),bloco('main','<main>'+imgTag(0,96)+lis+'</main>'),bloco('footer','<footer><p>'+T.contato+'</p></footer>')]}
  else if(p.layout==='cartoes'){
    ordem=[bloco('header','<header><h1>'+T.nome+'</h1><p>'+T.slogan+'</p></header>'),bloco('nav',nav)];
    T.itens.forEach(function(it,i){var pt=it.split(' · ');ordem.push(bloco('section'+i,'<section><h2>'+pt[0]+'</h2>'+imgTag(i,64)+'<p>'+(pt[1]||'')+'</p></section>'))});
    ordem.push(bloco('footer','<footer><p>'+T.contato+'</p></footer>'));
  }else{ordem=[bloco('nav',nav),bloco('main','<main><h1>'+T.nome+'</h1><p>'+T.slogan+'</p>'+imgTag(0,96)+lis+'</main>'),bloco('footer','<footer><p>'+T.contato+'</p></footer>')]}
  var cmdBloco=function(b,i){return "echo '"+b.html+"' "+(i===0?'>':'>>')+" index.html"};

  /* ---------- como conferir cada passo: lê o index.html e procura as etiquetas ---------- */
  function doc(){var c=sh.le(SITE+'/index.html');return c?new DOMParser().parseFromString(c,'text/html'):null}
  function imgOk(d){return $$('img',d).some(function(i){var s=i.getAttribute('src')||'';var n=sh.no(SITE+'/'+s);return n&&n.t==='i'})}
  var checa={
    header:function(){var d=doc();return !!d&&!!d.querySelector('header h1')},
    nav:function(){var d=doc();return !!d&&d.querySelectorAll('nav a').length>=pgs.length},
    main:function(){var d=doc();return !!d&&!!d.querySelector('main')&&imgOk(d)&&d.querySelectorAll('main li').length>=3&&(p.layout!=='lateral'||!!d.querySelector('main h1'))},
    footer:function(){var d=doc();return !!d&&!!d.querySelector('footer')&&d.querySelector('footer').textContent.trim().length>3}
  };
  var passos=[
    {dica:'Passo 1: entre na pasta do site. Digite: cd '+T.slug,cmd:'cd '+T.slug,ok:function(S){return S.cwd[S.cwd.length-1]===T.slug},ex:'Você está na pasta do projeto. Tudo que o site precisa mora aqui.'},
    {dica:'Passo 2: veja o que já existe. Digite: ls',cmd:'ls',ok:function(S,l){return l.trim().toLowerCase()==='ls'},ex:'Tem uma pasta imagens com as opções de ícone que o seu cliente aprovou.'}
  ];
  var nSec=0;
  ordem.forEach(function(b,i){
    var tit,ex;
    if(b.tag==='header'){tit='o cabeçalho, com o título (h1) e a frase do site';ex='header é o topo da página e h1 é o título principal.'}
    else if(b.tag==='nav'){tit='o menu, com um link (a) para cada página do seu fluxo';ex='nav agrupa os links do menu. Cada a leva a uma página.'}
    else if(b.tag==='main'){tit='o conteúdo principal, com uma imagem (img) e uma lista (ul com li)';ex='main é o miolo da página; img coloca a imagem; ul e li fazem a lista.'}
    else if(b.tag==='footer'){tit='o rodapé, com o contato';ex='footer é o rodapé da página.'}
    else{var k=+b.tag.replace('section','');tit='o cartão '+(k+1)+' de 3 (section), com título, imagem e preço';ex='cada section é um bloco independente da página, ótimo para cartões.'}
    var chave=b.tag.indexOf('section')===0?'section':b.tag;
    passos.push({dica:'Passo '+(passos.length+1)+': escreva '+tit+'. Aperte "Digitar por mim" se quiser ver o comando pronto (custa tempo no relógio) ou monte o seu: echo \'<'+(chave==='section'?'section':chave)+'>…\' '+(i===0?'>':'>>')+' index.html',
      cmd:function(){return cmdBloco(b,ordem.indexOf(b))},
      ok:chave==='section'?(function(k){return function(){var d=doc();return !!d&&d.querySelectorAll('section h2').length>=k+1}})(+b.tag.replace('section','')):function(){return checa[chave]()},ex:ex});
  });
  passos.push({dica:'Passo '+(passos.length+1)+': leia o código que você escreveu. Digite: cat index.html',cmd:'cat index.html',ok:function(S,l){return /^cat\s+index\.html$/.test(l.trim().toLowerCase())},ex:'Esse é o HTML da sua página: o texto que o navegador transforma na tela acima.'});

  /* ---------- aviso de etiqueta aberta e não fechada ---------- */
  function balanco(){
    var c=sh.le(SITE+'/index.html');if(!c)return null;
    var tags=['header','nav','main','section','footer','h1','h2','p','ul','li','a'];
    for(var i=0;i<tags.length;i++){var t=tags[i],ab=(c.match(new RegExp('<'+t+'(\\s[^>]*)?>','gi'))||[]).length,fe=(c.match(new RegExp('</'+t+'>','gi'))||[]).length;if(ab!==fe)return '> Atenção: a etiqueta <'+t+'> abre '+ab+'× e fecha '+fe+'×. Toda etiqueta aberta precisa de </'+t+'>.'}
    return null;
  }

  function atualiza(){sh.desenhaArvore($('#arvore'));sh.preview(SITE,$('#tela'),'A tela do site aparece quando o index.html tiver conteúdo.');
    var c=$('#arqconteudo'),n=sh.no(SITE+'/index.html');c.textContent='';var h=document.createElement('span');h.className='k';
    if(n&&n.c){h.textContent='// '+T.slug+'/index.html\n';c.appendChild(h);c.appendChild(document.createTextNode(n.c))}else c.appendChild(document.createTextNode('O código do index.html aparece aqui.'));
    $('#pr').textContent=sh.prompt()}

  var term;
  term=PA.Terminal({
    term:$('#term'),input:$('#cmd'),chips:$('#chips'),progresso:$('#prog'),enviar:$('#enviar'),passos:passos,shell:sh,
    prompt:function(){return sh.prompt().replace(' $','')+' $'},atualizaPrompt:atualiza,
    aoMostra:function(){P.penalidade(20,'pista')},aoDica:function(){P.penalidade(5,'pista')},aoErro:function(){P.penalidade(5,'erro')},
    depois:function(txt,r,t){
      var aviso=r.erro?null:balanco();if(aviso&&/index\.html/.test(txt)){t.lin(aviso,'er');P.penalidade(3,'erro')}
      var pa=passos[t.passo];if(pa&&!r.erro&&!(aviso&&/index\.html/.test(txt))&&pa.ok(sh,txt)){return t.avanca(pa.ex)}
    },
    reiniciar:function(t){sh.reinicia();primeiro=true;t.limpa();t.passo=0;t.atualiza();atualiza();t.lin('> Pasta reiniciada. O relógio continua correndo!','ok');t.dica()},
    fim:function(){conclui()}
  });
  term.lin('> Coruja: vamos construir o site da '+T.nome+' ('+L.nome.toLowerCase()+'). O relógio já está correndo!','ok');
  term.lin('> Cada passo mostra o que escrever. "Digitar por mim" digita o comando pronto, mas soma 20 s ao tempo. Erros somam 5 s.','m');
  term.dica();term.atualiza();atualiza();

  /* ---------- fim: tempo e nota ---------- */
  function conclui(){
    var e=P.termina('html'),pp=P.get(),msH=(e.ms||0)+(e.pen||0)*1000,fl=pp.etapas.fluxo,msF=(fl.ms||0)+(fl.pen||0)*1000,tot=msH+msF;
    var par=(P.par('fluxo',pp)+P.par('html',pp))*1000,n=P.nota(tot,par/1000);
    pp.etapas.html.nota=n.est;pp.fim=Date.now();P.grava(pp);
    var novo=P.salvaRecorde(pp,tot);
    var r=$('#resultado');r.classList.add('on');r.classList.toggle('boa',n.bom);r.classList.toggle('ruim',!n.bom);
    $('.tempo',r).textContent=P.fmt(tot);$('.nota',r).textContent=n.rot;$('.estr',r).textContent=P.estrelas(n.est);
    $('.msg',r).textContent=n.msg+(novo?' Novo recorde para '+T.nome+' com este layout!':'');
    $('.parts',r).innerHTML='';
    [['Fluxo',P.fmt(msF)],['HTML',P.fmt(msH)],['Pistas',String(((e.pistas||0)+(fl.pistas||0)))+' · erros '+((e.erros||0)+(fl.erros||0))],['Tempo de referência',P.fmt(par)]].forEach(function(x){var d=document.createElement('div');d.textContent=x[0];var b=document.createElement('b');b.textContent=x[1];d.appendChild(b);$('.parts',r).appendChild(d)});
    $('.partida-info',r).textContent=T.nome+' · '+L.nome+' · estilo '+ES.nome;
    Som[n.bom?'selo':'ruim']();setTimeout(function(){r.scrollIntoView({behavior:'smooth',block:'center'})},350);
  }

  /* ---------- como uma imagem é guardada: editor de 8×8 pixels e os bytes ---------- */
  var g=$('#grade8'),forma=['01100110','11111111','11111111','11111111','01111110','00111100','00011000','00000000'].join(''),bits=forma.split('').map(Number);
  for(var k=0;k<64;k++){(function(k){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','pixel '+(k+1));if(bits[k])b.className='on';b.addEventListener('click',function(){bits[k]=bits[k]?0:1;b.classList.toggle('on',!!bits[k]);Som.tec();bytes()});g.appendChild(b)})(k)}
  function bytes(){
    var l=[],ones=0;for(var r=0;r<8;r++){var s='';for(var c=0;c<8;c++){s+=bits[r*8+c];ones+=bits[r*8+c]}var v=parseInt(s,2);l.push('linha '+(r+1)+'  '+s.replace(/(.{4})/,'$1 ')+'  =  <b>'+('0'+v.toString(16)).slice(-2).toUpperCase()+'</b>')}
    $('#bytes').innerHTML=l.join('\n')+'\n\n8 linhas = 8 bytes para 64 pixels (1 bit cada: aceso ou apagado).';
  }
  bytes();
  setTimeout(function(){if(PA.Termos)PA.Termos.prepara()},0);
})();
