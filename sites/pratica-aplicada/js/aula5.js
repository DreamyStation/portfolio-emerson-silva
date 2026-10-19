/* Prática aplicada · aula 5: CSS, a aparência. Laboratório de efeitos de botão e prática no terminal: o estilo da prática (minimalista claro ou escuro, editorial, artesanal)
   é escrito em estilo.css e a tela do site muda a cada comando. Ao concluir: tempo total, medalha de velocidade e medalha de design. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$,Som=PA.Som,P=PA.Partida;

  /* ---------- laboratório de efeitos de botão (funciona sem prática) ---------- */
  var FX={
    elevar:{n:'Elevar',css:'.botao {\n  transition: transform .2s, box-shadow .2s;\n}\n.botao:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 8px 16px rgba(0,0,0,.18);\n}',ex:'No hover, o botão sobe 3 px e ganha sombra. O transition faz isso acontecer em 0,2 s em vez de num salto.'},
    cor:{n:'Mudar de cor',css:'.botao {\n  transition: background .25s;\n}\n.botao:hover {\n  background: #1637c7;\n}',ex:'Só a cor de fundo muda. É o efeito mais discreto e funciona em qualquer estilo.'},
    crescer:{n:'Crescer e apertar',css:'.botao {\n  transition: transform .15s;\n}\n.botao:hover  { transform: scale(1.06); }\n.botao:active { transform: scale(.96); }',ex:'scale aumenta ou diminui. :active vale enquanto o botão está sendo apertado e dá a sensação de clique.'},
    pulsar:{n:'Pulsar (animação)',css:'@keyframes pulsa {\n  0%, 100% { transform: scale(1); }\n  50%      { transform: scale(1.07); }\n}\n.botao {\n  animation: pulsa 1.6s ease-in-out infinite;\n}',ex:'@keyframes descreve os quadros; animation aplica: nome, duração, curva e quantas vezes (infinite = sempre). Use com moderação: chama atenção para uma ação importante.'},
    balancar:{n:'Balançar ao passar o mouse',css:'@keyframes balanca {\n  25% { transform: rotate(-4deg); }\n  75% { transform: rotate(4deg); }\n}\n.botao:hover {\n  animation: balanca .4s ease;\n}',ex:'A animação só roda enquanto o mouse está em cima. Bom para chamar atenção sem ficar tocando o tempo todo.'},
    aparecer:{n:'Aparecer (entrada)',css:'@keyframes entra {\n  from { opacity: 0; transform: translateY(14px); }\n  to   { opacity: 1; transform: none; }\n}\n.botao {\n  animation: entra .6s ease both;\n}',ex:'from é como começa e to é como termina. both mantém o estado final. Ótimo para títulos e blocos que entram na tela.'}
  };
  var bt=$('#demoBtn'),cod=$('#fx-codigo'),exp=$('#fx-explica'),lista=$('#fx-lista');
  if(bt&&lista){
    Object.keys(FX).forEach(function(k,i){
      var b=document.createElement('button');b.type='button';b.textContent=FX[k].n;b.dataset.k=k;b.setAttribute('aria-pressed',String(i===0));
      b.addEventListener('click',function(){escolhe(k)});lista.appendChild(b)});
    var replay=$('#fx-replay');
    function escolhe(k){
      $$('button',lista).forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.k===k))});
      bt.className='dbtn fx-'+k;cod.textContent=FX[k].css;exp.textContent=FX[k].ex;
      bt.style.animation='none';void bt.offsetWidth;bt.style.animation='';
      Som.ponto();
    }
    if(replay)replay.addEventListener('click',function(){var c=bt.className;bt.className='dbtn';void bt.offsetWidth;bt.className=c;Som.clique()});
    escolhe('elevar');
  }

  /* ---------- prática ---------- */
  var p=P.get();
  var tem=!!(p&&p.etapas&&p.etapas.fluxo&&p.etapas.fluxo.fim);
  $('#sem-partida').hidden=tem;$('#com-partida').hidden=!tem;
  P.hud($('#hud'));
  if(!tem)return;

  var T=P.TIPOS[p.tipo],L=P.LAYOUTS[p.layout],ES=P.ESTILOS[p.estilo],C=P.PAL[p.estilo];
  var SITE='~/'+T.slug,lat=p.layout==='lateral',car=p.layout==='cartoes',col=p.layout==='coluna';
  P.inicia('css');

  var br=$('#brief');br.textContent='';
  [['Site',T.nome,'layout: '+L.nome],['Estilo',ES.nome,ES.desc],['Cores do estilo','',C.bg+' · '+C.fg+' · '+C.acc]].forEach(function(x,i){
    var d=document.createElement('div'),s=document.createElement('small'),b=document.createElement('b'),sp=document.createElement('span');s.textContent=x[0];b.textContent=x[1];sp.textContent=x[2];
    if(i===2){[C.bg,C.fg,C.acc,C.soft,C.line].forEach(function(cor){var q=document.createElement('i');q.style.cssText='display:inline-block;width:22px;height:22px;border:2px solid #0A1A4D;background:'+cor+';margin-right:4px;vertical-align:middle';b.appendChild(q)})}
    d.append(s,b,sp);br.appendChild(d)});

  /* pasta do site: o HTML da aula 4 (ou o padrão da prática) mais as imagens; estilo.css começa vazio */
  var sh=PA.Shell({inicio:function(S){
    var h=S.acha(['home','voce']);h.f.Downloads=PA.fsDir();
    var site=PA.fsDir();site.f.imagens=PA.fsDir();
    T.imgs.concat(T.extras).forEach(function(n){site.f.imagens.f[n+'.png']=PA.fsImg(n)});
    site.f['index.html']=PA.fsArq(p.html||P.htmlPadrao(p));
    if(p.css)site.f['estilo.css']=PA.fsArq(p.css);
    h.f[T.slug]=site;
  }});
  if(p.css){sh.cwd=['home','voce',T.slug]}
  var salvaEstado=function(){var q=P.get();q.css=sh.le(SITE+'/estilo.css')||'';q.html=sh.le(SITE+'/index.html')||q.html;P.grava(q)};

  var q=function(s){return s};
  var cmds={
    link:"echo '<link rel=\"stylesheet\" href=\"estilo.css\">' >> index.html",
    base:"echo 'body{margin:0;padding:24px;font-family:"+C.font+";background:"+C.bg+";color:"+C.fg+"}' > estilo.css",
    h1:"echo 'h1{font-size:2.4rem;letter-spacing:-.02em;margin:0 0 8px}' >> estilo.css",
    layout:col?"echo 'body{max-width:680px;margin:0 auto}' >> estilo.css":car?"echo 'body{display:grid;grid-template-columns:repeat(3,1fr);gap:20px} header,nav,footer{grid-column:1/-1}' >> estilo.css":"echo 'body{display:grid;grid-template-columns:220px 1fr;gap:24px} nav{grid-row:1/3} main,footer{grid-column:2}' >> estilo.css",
    nav:"echo 'nav a{display:"+(lat?'block':'inline-block')+";padding:8px 14px;margin:0 6px 6px 0;border-radius:8px;text-decoration:none;color:"+C.acc+";background:"+C.soft+"}' >> estilo.css",
    hover:"echo 'nav a{transition:background .2s,transform .2s} nav a:hover{background:"+C.acc+";color:"+C.bg+";transform:translateY(-2px)}' >> estilo.css",
    anim:"echo '@keyframes entra{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}} h1{animation:entra .6s ease both}' >> estilo.css",
    blocos:car?"echo 'img{width:72px;height:72px;image-rendering:pixelated} section{padding:18px;border:1px solid "+C.line+";border-radius:12px}' >> estilo.css":"echo 'img{width:72px;height:72px;image-rendering:pixelated} li{margin:6px 0}' >> estilo.css",
    media:(col?"echo '@media (max-width:600px){body{padding:16px} h1{font-size:1.9rem}}' >> estilo.css":"echo '@media (max-width:600px){body{grid-template-columns:1fr}}' >> estilo.css"),
    foco:"echo 'nav a:focus-visible{outline:3px solid "+C.acc+";outline-offset:3px}' >> estilo.css"
  };
  var css=function(){return (sh.le(SITE+'/estilo.css')||'').replace(/\s+/g,'')};
  var idx=function(){return sh.le(SITE+'/index.html')||''};
  var tem_=function(re){return re.test(css())};
  var passos=[
    {dica:'Passo 1: entre na pasta do site. Digite: cd '+T.slug,cmd:'cd '+T.slug,ok:function(S){return S.cwd[S.cwd.length-1]===T.slug},ex:'Seu index.html e a pasta imagens estão aqui. Falta o estilo.'},
    {dica:'Passo 2: ligue o arquivo de estilo à página. Digite: '+cmds.link,cmd:cmds.link,ok:function(){return /<link[^>]*href=["']?estilo\.css/i.test(idx())},ex:'O link diz ao navegador onde está o CSS. Em sites de verdade ele fica dentro do head; aqui vai no fim para simplificar.'},
    {dica:'Passo 3: crie o estilo base (margens, fonte, fundo e cor do texto). Digite: '+cmds.base,cmd:cmds.base,ok:function(){return tem_(/body\{[^}]*font-family[^}]*\}/)&&tem_(/body\{[^}]*background:[^}]*\}/)&&tem_(/body\{[^}]*[;{]color:[^}]*\}/)},ex:'Cada regra tem seletor (body), propriedades (background, color) e valores. O > criou o arquivo estilo.css.'},
    {dica:'Passo 4: dê tamanho ao título. Digite: '+cmds.h1,cmd:cmds.h1,ok:function(){return tem_(/h1\{[^}]*font-size/)},ex:'rem é uma unidade relativa ao tamanho da letra padrão: 2.4rem é 2,4 vezes ela.'},
    {dica:'Passo 5: aplique o layout do seu site ('+L.nome.toLowerCase()+'). Digite: '+cmds.layout,cmd:cmds.layout,ok:function(){return col?(tem_(/max-width/)&&tem_(/margin:0auto/)):(tem_(/display:grid/)&&tem_(/grid-template-columns/))},ex:col?'max-width limita a largura e margin: 0 auto centraliza a coluna.':'display: grid transforma o body em uma grade; grid-template-columns define as colunas e gap o espaço entre elas.'},
    {dica:'Passo 6: transforme os links do menu em botões. Digite: '+cmds.nav,cmd:cmds.nav,ok:function(){return tem_(/nava\{[^}]*padding/)},ex:'padding é o espaço interno, border-radius arredonda os cantos e text-decoration: none tira o sublinhado.'},
    {dica:'Passo 7: faça o botão reagir ao mouse com :hover e transition. Digite: '+cmds.hover,cmd:cmds.hover,ok:function(){return tem_(/nava:hover/)&&tem_(/transition/)},ex:':hover vale enquanto o mouse está em cima; transition suaviza a mudança. Passe o mouse no menu da tela para ver.'},
    {dica:'Passo 8: anime a entrada do título com @keyframes. Digite: '+cmds.anim,cmd:cmds.anim,ok:function(){return tem_(/@keyframes/)&&tem_(/animation:/)},ex:'@keyframes descreve o começo (from) e o fim (to); animation aplica com nome, duração e curva.'},
    {dica:'Passo 9: ajuste imagens e blocos. Digite: '+cmds.blocos,cmd:cmds.blocos,ok:function(){return tem_(/img\{[^}]*width/)},ex:'image-rendering: pixelated mantém os sprites nítidos quando ampliados.'},
    {dica:'Bônus 1: deixe o site responsivo com @media. Digite: '+cmds.media,cmd:cmds.media,bonus:true,ok:function(){return tem_(/@media/)},ex:'@media aplica as regras de dentro só quando a tela é estreita (celular). Redimensione a janela para testar.'},
    {dica:'Bônus 2: deixe o foco do teclado visível. Digite: '+cmds.foco,cmd:cmds.foco,bonus:true,ok:function(){return tem_(/:focus-visible/)},ex:':focus-visible mostra um contorno em quem navega com Tab. É acessibilidade, e vale pontos de design.'}
  ];
  var REQ=passos.filter(function(x){return !x.bonus}).length;

  function balanceado(){var c=sh.le(SITE+'/estilo.css')||'';return (c.match(/\{/g)||[]).length===(c.match(/\}/g)||[]).length}
  function atualiza(){
    sh.desenhaArvore($('#arvore'));sh.preview(SITE,$('#tela'),'A tela do site aparece quando existir um index.html.');
    var c=$('#arqconteudo'),n=sh.no(SITE+'/estilo.css');c.textContent='';var h=document.createElement('span');h.className='k';
    if(n&&n.c){h.textContent='/* '+T.slug+'/estilo.css */\n';c.appendChild(h);c.appendChild(document.createTextNode(n.c.replace(/\}\s*/g,'}\n').replace(/\n+$/,'')))}else c.appendChild(document.createTextNode('O código do estilo.css aparece aqui.'));
    $('#pr').textContent=sh.prompt();
  }
  var feitoReq=false,term;
  term=PA.Terminal({
    term:$('#term'),input:$('#cmd'),chips:$('#chips'),progresso:$('#prog'),enviar:$('#enviar'),passos:passos,shell:sh,
    prompt:function(){return sh.prompt().replace(' $','')+' $'},atualizaPrompt:function(){atualiza();salvaEstado()},
    aoMostra:function(){P.penalidade(20,'pista')},aoDica:function(){P.penalidade(5,'pista')},aoErro:function(){P.penalidade(5,'erro')},
    depois:function(txt,r,t){
      var tocouCss=/estilo\.css/.test(txt);
      if(tocouCss&&!r.erro&&!balanceado()){t.lin('> Atenção: faltou fechar uma chave. Cada { precisa de um } no fim da regra.','er');P.penalidade(3,'erro');return}
      var pa=passos[t.passo];
      if(pa&&!r.erro&&pa.ok(sh,txt)){return t.avanca(pa.ex).then(function(){if(t.passo>=REQ&&!feitoReq){feitoReq=true;$('#concluir').hidden=false;t.lin('> Site completo! Conclua agora ou faça os dois bônus para subir a medalha de design.','ok')}})}
    },
    reiniciar:function(t){var q2=P.get();q2.css='';P.grava(q2);p.css='';sh.reinicia();t.limpa();t.passo=0;t.atualiza();atualiza();t.lin('> Pasta reiniciada. O relógio continua correndo.','ok');t.dica()},
    fim:function(t){conclui()}
  });
  term.lin('> Guia: vamos aplicar o estilo "'+ES.nome+'" ao site '+T.nome+'. O relógio já está correndo.','ok');
  term.lin('> Cada passo mostra o comando. Passe o mouse nas palavras sublinhadas para ver o que significam.','m');
  /* retomada: se já havia CSS, avança os passos que já estão cumpridos */
  while(term.passo<passos.length&&passos[term.passo].ok(sh,'')){term.passo++}
  if(term.passo>=REQ){feitoReq=true;$('#concluir').hidden=false}
  term.dica();term.atualiza();atualiza();

  $('#concluir').addEventListener('click',function(){conclui()});

  function conclui(){
    if($('#resultado').classList.contains('on'))return;
    var e=P.termina('css'),pp=P.get(),fl=pp.etapas.fluxo,ht=pp.etapas.html||{ms:0,pen:0,pistas:0,erros:0};
    var ms=function(x){return (x.ms||0)+(x.pen||0)*1000},msF=ms(fl),msH=ms(ht),msC=ms(e),tot=msF+msH+msC;
    var par=P.par('fluxo',pp)+P.par('html',pp)+P.par('css',pp),nv=P.nota(tot,par);
    var bonus=term.passo-REQ;if(bonus<0)bonus=0;
    var dEst=!balanceado()?0:Math.min(3,1+bonus);
    pp.etapas.css.nota=nv.est;pp.fim=Date.now();pp.concluida=true;pp.css=sh.le(SITE+'/estilo.css')||'';pp.html=sh.le(SITE+'/index.html')||pp.html;P.grava(pp);
    var novo=P.salvaRecorde(pp,tot);
    var r=$('#resultado');r.classList.add('on');r.classList.toggle('boa',nv.bom);r.classList.toggle('ruim',!nv.bom);
    $('.tempo',r).textContent=P.fmt(tot);$('.nota',r).textContent=nv.rot;
    P.pintaMedalha($('.estr',r),nv.est,'velocidade');
    P.pintaMedalha($('.estr2',r),dEst,'design');
    var rot=['Bronze','Prata','Ouro','Diamante'];
    $('.msg',r).textContent=nv.msg+' Design: '+rot[dEst].toLowerCase()+(bonus?' (com '+bonus+' bônus)':'')+'.'+(novo?' Novo recorde para '+T.nome+' com este layout!':'');
    var pa=$('.parts',r);pa.textContent='';
    [['Fluxo',P.fmt(msF)],['HTML',P.fmt(msH)],['CSS',P.fmt(msC)],['Pistas',String((e.pistas||0)+(ht.pistas||0)+(fl.pistas||0))+' · erros '+((e.erros||0)+(ht.erros||0)+(fl.erros||0))],['Referência',P.fmt(par*1000)]].forEach(function(x){var d=document.createElement('div');d.textContent=x[0];var b=document.createElement('b');b.textContent=x[1];d.appendChild(b);pa.appendChild(d)});
    $('.partida-info',r).textContent=T.nome+' · '+L.nome+' · '+ES.nome+' · site concluído';
    $('#concluir').hidden=true;
    Som[nv.bom?'selo':'ruim']();setTimeout(function(){r.scrollIntoView({behavior:'smooth',block:'center'})},350);
  }
})();
