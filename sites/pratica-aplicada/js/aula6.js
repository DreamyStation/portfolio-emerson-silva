/* CodeHome · aula 6: CSS responsivo. Simulador de larguras de tela e prática no terminal: o site da prática passa a se adaptar a celular, tablet e computador. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$,Som=PA.Som,P=PA.Partida;

  /* ---------- simulador de largura (funciona sem prática): uma página de exemplo com @media dentro de um iframe redimensionável ---------- */
  var DEMO='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+
   'body{margin:0;padding:16px;font-family:system-ui,sans-serif;background:#fff;color:#1a1a1a}h1{font-size:clamp(1.3rem,5vw,2rem);margin:0 0 12px}'+
   '.g{display:grid;gap:12px;grid-template-columns:repeat(3,1fr)}.c{background:#eef3ff;border:1px solid #cfd8f0;border-radius:10px;padding:14px;font-size:14px}'+
   '.m{margin-top:14px;padding:10px;border-radius:8px;background:#1a1a1a;color:#fff;font-size:13px}.m:before{content:"Regra ativa: computador (largura acima de 900px)"}'+
   '@media (max-width:900px){.g{grid-template-columns:repeat(2,1fr)}.m:before{content:"Regra ativa: tablet (até 900px)"}}'+
   '@media (max-width:560px){.g{grid-template-columns:1fr}.m:before{content:"Regra ativa: celular (até 560px)"}}'+
   '</style><h1>Mesmo HTML, três telas</h1><div class="g"><div class="c">Cartão 1</div><div class="c">Cartão 2</div><div class="c">Cartão 3</div></div><div class="m"></div>';
  var vpD=$('#vp-demo'),fD=$('#demo-frame'),sl=$('#demo-larg'),lb=$('#demo-rotulo');
  function escala(vp,fr,w,alt){
    var cw=vp.clientWidth||600,s=Math.min(1,cw/w);
    fr.style.width=w+'px';fr.style.height=(alt/s)+'px';fr.style.transform='scale('+s+')';fr.style.transformOrigin='0 0';
  }
  if(vpD&&fD){
    fD.srcdoc=DEMO;
    var mudaDemo=function(w){w=+w;lb.textContent=w+' px · '+(w<=560?'celular':w<=900?'tablet':'computador');escala(vpD,fD,w,300)};
    sl.addEventListener('input',function(){mudaDemo(sl.value)});
    $$('.larg button[data-w]',$('#demo-botoes')).forEach(function(b){b.addEventListener('click',function(){sl.value=b.dataset.w;mudaDemo(b.dataset.w);Som.ponto()})});
    window.addEventListener('resize',function(){mudaDemo(sl.value)});
    mudaDemo(sl.value);
  }

  /* ---------- prática ---------- */
  var p=P.get();
  var tem=!!(p&&p.etapas&&p.etapas.fluxo&&p.etapas.fluxo.fim);
  $('#sem-partida').hidden=tem;$('#com-partida').hidden=!tem;
  P.hud($('#hud'));
  if(!tem)return;

  var T=P.TIPOS[p.tipo],L=P.LAYOUTS[p.layout],ES=P.ESTILOS[p.estilo];
  var SITE='~/'+T.slug,lat=p.layout==='lateral',car=p.layout==='cartoes',col=p.layout==='coluna';
  P.inicia('resp');

  var br=$('#brief');br.textContent='';
  [['Site',T.nome,'layout: '+L.nome],['Estilo',ES.nome,ES.desc],['Objetivo','Responsivo','o mesmo site em celular, tablet e computador']].forEach(function(x){
    var d=document.createElement('div'),s=document.createElement('small'),b=document.createElement('b'),sp=document.createElement('span');s.textContent=x[0];b.textContent=x[1];sp.textContent=x[2];d.append(s,b,sp);br.appendChild(d)});

  var sh=PA.Shell({inicio:function(S){
    var h=S.acha(['home','voce']);h.f.Downloads=PA.fsDir();
    var site=PA.fsDir();site.f.imagens=PA.fsDir();
    T.imgs.concat(T.extras).forEach(function(n){site.f.imagens.f[n+'.png']=PA.fsImg(n)});
    site.f['index.html']=PA.fsArq(p.html||P.htmlPadrao(p));
    site.f['estilo.css']=PA.fsArq(p.css||P.cssPadrao(p));
    h.f[T.slug]=site;
  }});
  /* o html do index não tem <link> se a pessoa pulou etapas: garante o estilo ligado */
  (function(){var n=sh.no(SITE+'/index.html');if(n&&!/estilo\.css/.test(n.c))n.c+='\n<link rel="stylesheet" href="estilo.css">'})();
  var salva=function(){var q=P.get();q.css=sh.le(SITE+'/estilo.css')||q.css;q.html=sh.le(SITE+'/index.html')||q.html;P.grava(q)};

  var cmds={
    viewport:"echo '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">' >> index.html",
    img:"echo 'img{max-width:100%;height:auto}' >> estilo.css",
    clamp:"echo 'h1{font-size:clamp(1.8rem,5vw,2.8rem)}' >> estilo.css",
    layout:car?"echo '@media (max-width:900px){body{grid-template-columns:repeat(2,1fr)}} @media (max-width:560px){body{grid-template-columns:1fr}}' >> estilo.css":lat?"echo '@media (max-width:760px){body{grid-template-columns:1fr} nav{grid-row:auto} main,footer{grid-column:1}}' >> estilo.css":"echo '@media (max-width:600px){body{padding:16px} nav a{display:block;margin:0 0 8px}}' >> estilo.css",
    toque:"echo 'nav a{min-height:44px;display:inline-flex;align-items:center}' >> estilo.css",
    escuro:"echo '@media (prefers-color-scheme:dark){body{background:#111418;color:#e8eaed}}' >> estilo.css",
    mov:"echo '@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}' >> estilo.css"
  };
  var css=function(){return (sh.le(SITE+'/estilo.css')||'').replace(/\s+/g,'')};
  var idx=function(){return sh.le(SITE+'/index.html')||''};
  var tem_=function(re){return re.test(css())};
  var vistas={};
  var passos=[
    {dica:'Passo 1: entre na pasta do site. Digite: cd '+T.slug,cmd:'cd '+T.slug,ok:function(S){return S.cwd[S.cwd.length-1]===T.slug},ex:'O site da prática, com o estilo da aula anterior, está aqui.'},
    {dica:'Passo 2: avise o celular que a página é feita para telas pequenas. Digite: '+cmds.viewport,cmd:cmds.viewport,ok:function(){return /<meta[^>]*name=["']?viewport/i.test(idx())},ex:'Sem o viewport, o celular finge que a tela tem uns 980 px e encolhe tudo. Ele vai no head de um site de verdade.'},
    {dica:'Passo 3: faça as imagens nunca passarem da largura da tela. Digite: '+cmds.img,cmd:cmds.img,ok:function(){return tem_(/img\{[^}]*max-width:100%/)},ex:'max-width: 100% deixa a imagem encolher junto com o espaço; height: auto mantém a proporção.'},
    {dica:'Passo 4: deixe o título proporcional à tela. Digite: '+cmds.clamp,cmd:cmds.clamp,ok:function(){return tem_(/h1\{[^}]*clamp\(/)},ex:'clamp(mínimo, ideal, máximo): o título cresce com a tela (5vw) sem ficar menor que 1.8rem nem maior que 2.8rem.'},
    {dica:'Passo 5: reorganize o layout em telas menores com @media. Digite: '+cmds.layout,cmd:cmds.layout,ok:function(){var c=css();return (c.match(/@media\(max-width/g)||[]).length>=(car?2:1)&&(col?/nava\{[^}]*display:block/.test(c):/grid-template-columns:1fr/.test(c))},ex:car?'Duas regras @media criam dois pontos de quebra: abaixo de 900 px são 2 colunas e abaixo de 560 px, 1 coluna.':lat?'Abaixo de 760 px o menu lateral vai para cima do conteúdo: uma coluna só.':'Abaixo de 600 px os links do menu ficam um embaixo do outro e a margem diminui.'},
    {dica:'Passo 6: facilite o toque no celular. Digite: '+cmds.toque,cmd:cmds.toque,ok:function(){return tem_(/min-height:44px/)},ex:'Dedos são maiores que cursores: alvos de toque com pelo menos 44 px de altura evitam cliques errados.'},
    {dica:'Passo 7: teste o site nas três larguras (botões Celular, Tablet e Computador logo abaixo da tela).',cmd:function(){return 'dica'},ok:function(){return vistas[360]&&vistas[768]&&vistas[1200]},ex:'Testar é parte do trabalho: conferir celular, tablet e computador antes de publicar evita surpresas.'},
    {dica:'Bônus 1: adapte-se ao tema escuro do aparelho. Digite: '+cmds.escuro,cmd:cmds.escuro,bonus:true,ok:function(){return tem_(/prefers-color-scheme:dark/)},ex:'prefers-color-scheme lê a preferência do sistema da pessoa. Nada de impor um tema.'},
    {dica:'Bônus 2: respeite quem pede menos movimento. Digite: '+cmds.mov,cmd:cmds.mov,bonus:true,ok:function(){return tem_(/prefers-reduced-motion:reduce/)},ex:'Quem sente tontura com animações ativa "reduzir movimento" no sistema. Esta regra desliga as suas animações para essas pessoas.'}
  ];
  var REQ=passos.filter(function(x){return !x.bonus}).length;

  /* ---------- tela com largura ajustável ---------- */
  var vp=$('#vp-site'),fr=$('#tela'),larg=1200;
  function aplicaLargura(w){larg=w;escala(vp,fr,w,360);$('#larg-rotulo').textContent=w+' px';$('#larg-slider').value=w}
  function ve(w){vistas[w]=true;aplicaLargura(w);term&&term.atualiza&&checaTeste()}
  var term;
  function checaTeste(){var pa=passos[term.passo];if(pa&&pa.ok(sh,'')&&term.passo===6){term.avanca(pa.ex).then(depoisReq)}}
  var feitoReq=false;
  function depoisReq(){if(term.passo>=REQ&&!feitoReq){feitoReq=true;$('#concluir').hidden=false;term.lin('> Site responsivo! Conclua agora ou faça os dois bônus para subir a medalha de design.','ok')}}
  $$('#larg-botoes button[data-w]').forEach(function(b){b.addEventListener('click',function(){ve(+b.dataset.w);Som.ponto()})});
  $('#larg-slider').addEventListener('input',function(){aplicaLargura(+this.value)});
  window.addEventListener('resize',function(){aplicaLargura(larg)});

  function atualiza(){
    sh.desenhaArvore($('#arvore'));sh.preview(SITE,fr,'A tela do site aparece quando existir um index.html.');aplicaLargura(larg);
    var c=$('#arqconteudo'),n=sh.no(SITE+'/estilo.css');c.textContent='';var h=document.createElement('span');h.className='k';
    if(n&&n.c){h.textContent='/* '+T.slug+'/estilo.css */\n';c.appendChild(h);c.appendChild(document.createTextNode(n.c.replace(/\}\s*/g,'}\n').replace(/\n+$/,'')))}else c.appendChild(document.createTextNode('O estilo.css aparece aqui.'));
    $('#pr').textContent=sh.prompt();
  }
  function balanceado(){var c=sh.le(SITE+'/estilo.css')||'';return (c.match(/\{/g)||[]).length===(c.match(/\}/g)||[]).length}
  term=PA.Terminal({
    term:$('#term'),input:$('#cmd'),chips:$('#chips'),progresso:$('#prog'),enviar:$('#enviar'),passos:passos,shell:sh,
    persist:{id:'resp',pid:p.criada,depois:function(t){if(t.passo>=REQ){feitoReq=true;$('#concluir').hidden=false}var e=P.get().etapas.resp;if(e&&e.fim)conclui()}},
    prompt:function(){return sh.prompt().replace(' $','')+' $'},atualizaPrompt:function(){atualiza();salva()},
    aoMostra:function(){P.penalidade(20,'pista')},aoDica:function(){P.penalidade(5,'pista')},aoErro:function(){P.penalidade(5,'erro')},
    depois:function(txt,r,t){
      if(/estilo\.css/.test(txt)&&!r.erro&&!balanceado()){t.lin('> Atenção: faltou fechar uma chave. Cada { precisa de um } no fim da regra.','er');P.penalidade(3,'erro');return}
      var pa=passos[t.passo];
      if(pa&&t.passo!==6&&!r.erro&&pa.ok(sh,txt)){return t.avanca(pa.ex).then(function(){depoisReq();if(t.passo===6)checaTeste()})}
    },
    reiniciar:function(t){sh.reinicia();(function(){var n=sh.no(SITE+'/index.html');if(n&&!/estilo\.css/.test(n.c))n.c+='\n<link rel="stylesheet" href="estilo.css">'})();vistas={};t.limpa();t.passo=0;t.atualiza();atualiza();t.lin('> Pasta reiniciada. O relógio continua correndo.','ok');t.dica()},
    fim:function(){conclui()}
  });
  term.lin('> Guia: vamos tornar o site '+T.nome+' responsivo. O relógio já está correndo.','ok');
  term.lin('> Cada passo mostra o comando. Use os botões de largura abaixo da tela para ver o resultado.','m');
  term.dica();term.atualiza();atualiza();
  $('#concluir').addEventListener('click',function(){conclui()});

  function conclui(){
    var R=$('#resultado');if(R.classList.contains('on'))return;
    var e=P.termina('resp'),pp=P.get();
    var ms=(e.ms||0)+(e.pen||0)*1000,nv=P.nota(ms,P.par('resp',pp));
    var bonus=Math.max(0,term.passo-REQ),dEst=!balanceado()?0:Math.min(3,1+bonus);
    pp.etapas.resp.nota=nv.est;pp.respConcluida=true;pp.css=sh.le(SITE+'/estilo.css')||'';pp.html=sh.le(SITE+'/index.html')||pp.html;P.grava(pp);
    R.classList.add('on');R.classList.toggle('boa',nv.bom);R.classList.toggle('ruim',!nv.bom);
    $('.tempo',R).textContent=P.fmt(ms);$('.nota',R).textContent=nv.rot;
    P.pintaMedalha($('.estr',R),nv.est,'velocidade');P.pintaMedalha($('.estr2',R),dEst,'responsivo');
    $('.msg',R).textContent=PA.I18n.t(nv.msg)+' '+PA.I18n.t('Medalha de')+' '+PA.I18n.t('responsivo')+': '+PA.I18n.t(['bronze','prata','ouro','diamante'][dEst])+(bonus?' ('+PA.I18n.t('com')+' '+bonus+' '+PA.I18n.t('bônus')+')':'')+'.';
    var pa=$('.parts',R);pa.textContent='';
    [['Esta etapa',P.fmt(ms)],['Pistas',String(e.pistas||0)+' · erros '+(e.erros||0)],['Referência',P.fmt(P.par('resp',pp)*1000)]].forEach(function(x){var d=document.createElement('div');d.textContent=x[0];var b=document.createElement('b');b.textContent=x[1];d.appendChild(b);pa.appendChild(d)});
    $('.partida-info',R).textContent=T.nome+' · '+L.nome+' · '+ES.nome+' · responsivo concluído';
    $('#concluir').hidden=true;Som[nv.bom?'selo':'ruim']();setTimeout(function(){R.scrollIntoView({behavior:'smooth',block:'center'})},350);
  }
  if(PA.Livre)PA.Livre.liga({sh:sh,site:SITE,term:term});
})();
