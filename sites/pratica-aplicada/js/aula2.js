/* Prática aplicada · aula 2: seu ambiente de trabalho. Qual terminal abrir, quais aplicativos ter e os comandos que você vai usar, treinados num terminal virtual. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$,Som=PA.Som;

  /* sistema operacional: o botão escolhe a lista de passos */
  var oss=$$('.cola-os button[data-os]'),listas=$$('.passos-os[data-os]');
  function mostraOS(os){oss.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.os===os))});listas.forEach(function(l){l.hidden=l.dataset.os!==os})}
  oss.forEach(function(b){b.addEventListener('click',function(){mostraOS(b.dataset.os)})});
  var ua=(navigator.userAgent||'').toLowerCase();mostraOS(/mac/.test(ua)?'mac':/linux|x11/.test(ua)&&!/android/.test(ua)?'linux':'win');

  /* terminal virtual */
  var sh=PA.Shell({inicio:function(S){var h=S.acha(['home','voce']);h.f.Downloads=PA.fsDir();h.f.Documentos=PA.fsDir()}});
  var ultimo=function(S){return (S.cmds[S.cmds.length-1]||'').trim().toLowerCase()};
  var home=function(S){return S.cwd.join('/')==='home/voce'};
  var passos=[
    {dica:'Passo 1: descubra em qual pasta você está. Digite: pwd (de "print working directory", mostrar a pasta atual).',cmd:'pwd',ok:function(S){return ultimo(S)==='pwd'},ex:'pwd mostra onde você está. Todo comando roda "dentro" de uma pasta.'},
    {dica:'Passo 2: veja o que existe nesta pasta. Digite: ls (de "list", listar).',cmd:'ls',ok:function(S){return ultimo(S)==='ls'},ex:'ls lista pastas e arquivos. As pastas aparecem com uma barra no fim.'},
    {dica:'Passo 3: crie uma pasta para o seu projeto. Digite: mkdir treino',cmd:'mkdir treino',ok:function(S){var n=S.no('~/treino');return !!n&&n.t==='d'},ex:'mkdir cria uma pasta ("make directory").'},
    {dica:'Passo 4: entre na pasta que você criou. Digite: cd treino',cmd:'cd treino',ok:function(S){return S.cwd[S.cwd.length-1]==='treino'},ex:'cd muda de pasta ("change directory"). Repare no endereço no começo da linha.'},
    {dica:'Passo 5: crie o arquivo da sua primeira página. Digite: touch index.html',cmd:'touch index.html',ok:function(S){var n=S.no('~/treino/index.html');return !!n&&n.t==='a'},ex:'touch cria um arquivo vazio. index.html é o nome que todo site usa para a página inicial. No Windows PowerShell o equivalente é ni index.html.'},
    {dica:'Passo 6: escreva um título dentro dele. Digite: echo \'<h1>Olá, mundo</h1>\' > index.html',cmd:"echo '<h1>Olá, mundo</h1>' > index.html",ok:function(S){var c=S.le('~/treino/index.html');return !!c&&/<h1>[^<]+<\/h1>/.test(c)},ex:'Olhe a minitela: é o seu primeiro site! echo escreve o texto; o > joga dentro do arquivo (apaga o que tinha) e >> acrescenta no fim.'},
    {dica:'Passo 7: leia o arquivo. Digite: cat index.html',cmd:'cat index.html',ok:function(S){return /^cat\s+index\.html$/.test(ultimo(S))},ex:'cat mostra o conteúdo de um arquivo. No Windows, type faz o mesmo.'},
    {dica:'Passo 8: volte uma pasta. Digite: cd ..',cmd:'cd ..',ok:function(S){return home(S)&&!!S.no('~/treino/index.html')},ex:'.. significa "a pasta de cima". cd sozinho também leva para a sua pasta pessoal.'},
    {dica:'Passo 9: confira se o Node.js está instalado. Digite: node -v',cmd:'node -v',ok:function(S){return ultimo(S)==='node -v'},ex:'-v mostra a versão. Se aparecer um número, o programa está instalado. Você vai usar o Node na aula de JavaScript.'}
  ];
  var term;
  function atualiza(){
    sh.desenhaArvore($('#arvore'));sh.preview('~/treino',$('#tela'),'A minitela mostra a sua página quando existir um index.html com conteúdo.');
    var c=$('#arqconteudo'),ab=sh.aberto,n=ab?sh.acha(ab.split('/')):null;
    c.textContent='';var h=document.createElement('span');h.className='k';
    if(n&&n.t==='a'){h.textContent='// '+ab.replace('home/voce','~')+'\n';c.appendChild(h);c.appendChild(document.createTextNode(n.c||'(vazio)'))}
    else{c.appendChild(document.createTextNode('O conteúdo do último arquivo que você mexer aparece aqui.'))}
    $('#pr').textContent=sh.prompt();
  }
  term=PA.Terminal({
    term:$('#term'),input:$('#cmd'),chips:$('#chips'),progresso:$('#prog'),enviar:$('#enviar'),passos:passos,shell:sh,
    prompt:function(){return sh.prompt().replace(' $','')+' $'},atualizaPrompt:atualiza,
    depois:function(txt,r,t){var p=passos[t.passo];if(p&&!r.erro&&p.ok(sh)){return t.avanca(p.ex)}},
    reiniciar:function(t){sh.reinicia();t.limpa();t.passo=0;t.atualiza();atualiza();t.lin('> Treino reiniciado.','ok');t.dica()},
    fim:function(){var f=$('#fim');f.classList.add('on');PA.Arm.grava('aula2',true);Som.selo();setTimeout(function(){f.scrollIntoView({behavior:'smooth',block:'center'})},300)}
  });
  term.lin('> Guia: bem-vinda(o)! Este é um terminal de treino: os comandos são os de verdade, mas tudo acontece numa pasta de mentira.','ok');
  term.lin('> Dica: "dica" rever o passo · "mostra" eu digito por você · "reiniciar" começa de novo.','m');
  term.dica();term.atualiza();atualiza();
  if(PA.Arm.le('aula2',false)){var j=$('#ja');if(j)j.hidden=false}
})();
