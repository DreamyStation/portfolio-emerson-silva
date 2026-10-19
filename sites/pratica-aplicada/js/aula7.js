/* Prática aplicada · aula 7: JavaScript. O terminal escreve script.js e a minitela passa a reagir a cliques: contador, soma e limite. O console do navegador aparece no terminal. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,Som=PA.Som,P=PA.Partida;
  var cliques=0,feitoReq=false,term;
  var L=PA.Licao({
    etapa:'js',medalha2:'interatividade',fim:'JavaScript concluído',arquivo:'script.js',scripts:true,ponte:true,manterScript:true,
    brief:function(L){return [['Site',L.T.nome,'caminho: '+L.T.caminho+' · layout: '+L.LY.nome],['Objetivo','Interatividade','um botão que conta e calcula na minitela'],['Ferramenta','JavaScript','o arquivo script.js, ligado ao index.html']]},
    aoReiniciar:function(){cliques=0}
  });
  if(!L)return;
  var T=L.T,J=T.js,tot=J.total!==null;
  var cmds={
    html:"echo '<button id=\"mais\">"+J.botao+"</button> <span id=\"qtd\">0</span> "+J.unidade+(tot?" · "+J.total+": <b id=\"total\">R$ 0</b>":"")+"' >> index.html",
    link:"echo '<script src=\"script.js\"></script>' >> index.html",
    log:"echo 'console.log(\"script carregado\")' > script.js",
    variavel:"echo 'let n = 0' >> script.js",
    preco:"echo 'const preco = "+J.preco+"' >> script.js",
    handler:tot?"echo 'document.getElementById(\"mais\").onclick = () => { n = n + 1; document.getElementById(\"qtd\").textContent = n; document.getElementById(\"total\").textContent = \"R$ \" + n * preco }' >> script.js":"echo 'document.getElementById(\"mais\").onclick = () => { n = n + 1; document.getElementById(\"qtd\").textContent = n }' >> script.js",
    limite:"echo 'document.getElementById(\"mais\").addEventListener(\"click\", () => { if (n >= 5) { document.getElementById(\"mais\").disabled = true } })' >> script.js"
  };
  var sc=function(){return L.compacto('script.js')};
  var passos=[
    {dica:'Passo 1: entre na pasta do site. Digite: cd '+T.slug,cmd:'cd '+T.slug,ok:function(S){return S.cwd[S.cwd.length-1]===T.slug},ex:'O site da prática, com HTML e CSS, está aqui. Falta o comportamento.'},
    {dica:'Passo 2: coloque um botão e um contador na página. Digite: '+cmds.html,cmd:cmds.html,ok:function(){var i=L.idx();return /id=["']mais["']/.test(i)&&/id=["']qtd["']/.test(i)&&(!tot||/id=["']total["']/.test(i))},ex:'Cada elemento ganha um id para o JavaScript conseguir encontrá-lo na página. Olhe a minitela: o botão já existe, mas ainda não faz nada.'},
    {dica:'Passo 3: ligue o arquivo script.js à página. Digite: '+cmds.link,cmd:cmds.link,ok:function(){return /<script[^>]*src=["']?script\.js/i.test(L.idx())},ex:'A tag script carrega o JavaScript. Aqui o treino roda o código ao fim da página, quando todo o HTML já existe.'},
    {dica:'Passo 4: escreva a primeira linha de JavaScript. Digite: '+cmds.log,cmd:cmds.log,ok:function(){return /console\.log\(/.test(L.arq('script.js'))},ex:'console.log escreve no console, a janela de recados do programador. Repare na linha [console] que apareceu aqui no terminal.'},
    {dica:'Passo 5: crie uma variável para contar. Digite: '+cmds.variavel,cmd:cmds.variavel,ok:function(){return /\blet\s+n\b/.test(L.arq('script.js'))},ex:'let cria uma variável: uma caixinha com nome (n) que guarda um valor (0) e pode mudar.'}
  ];
  if(tot)passos.push({dica:'Passo 6: guarde o preço de cada item. Digite: '+cmds.preco,cmd:cmds.preco,ok:function(){return /\bconst\s+preco\b/.test(L.arq('script.js'))},ex:'const cria um valor que não muda. Se o preço mudar um dia, você altera só esta linha.'});
  passos.push({dica:'Passo '+(passos.length+1)+': faça o botão reagir ao clique. Digite: '+cmds.handler,cmd:cmds.handler,ok:function(){var c=sc();return /getElementById\(["']mais["']\)\.(onclick|addEventListener)/.test(c)&&/textContent/.test(c)&&/n=n\+1|n\+\+|n\+=1/.test(c)},ex:'getElementById acha o elemento; onclick diz o que fazer quando clicarem; textContent troca o texto na tela. A seta => cria uma função.'});
  passos.push({dica:'Passo '+(passos.length+1)+': teste! Clique no botão da minitela pelo menos 3 vezes e veja a contagem'+(tot?' e o total':'')+' mudarem.',cmd:function(){return 'dica'},ok:function(){return cliques>=3},ex:'Funcionou: cada clique executa a função e atualiza a página, sem recarregar nada. É isso que chamamos de interatividade.'});
  var TESTE=passos.length-1;
  passos.push({dica:'Bônus 1: bloqueie o botão depois de 5 cliques. Digite: '+cmds.limite,cmd:cmds.limite,bonus:true,ok:function(){return /if\(n>=5\)/.test(sc())&&/disabled=true/.test(sc())},ex:'if testa uma condição. Quando n chega a 5, o botão é desativado. Toda validação de formulário funciona nessa lógica.'});
  var REQ=passos.filter(function(x){return !x.bonus}).length;

  function depoisReq(){if(term.passo>=REQ&&!feitoReq){feitoReq=true;$('#concluir').hidden=false;term.lin('> Interatividade pronta! Conclua agora ou faça o bônus para subir a medalha.','ok')}}
  term=L.terminal(passos,{
    depois:function(txt,r,t){var pa=passos[t.passo];if(pa&&t.passo!==TESTE&&!r.erro&&pa.ok(L.sh,txt)){return t.avanca(pa.ex).then(function(){depoisReq();if(t.passo===TESTE)checaTeste()})}},
    fim:function(){fecha()}
  });
  function checaTeste(){var pa=passos[term.passo];if(term.passo===TESTE&&pa.ok()){term.avanca(pa.ex).then(depoisReq)}}
  L.sh.ligaPonte($('#tela'),{log:function(t){term.lin('[console] '+t,'ok')},erro:function(t){term.lin('[erro] '+t+' · confira a ortografia e as aspas do código.','er');P.penalidade(3,'erro')},clique:function(id){if(id==='mais'){cliques++;if(term.passo===TESTE)checaTeste()}}});
  term.lin('> Guia: vamos dar comportamento ao site '+T.nome+'. O relógio já está correndo.','ok');
  term.lin('> O que o seu JavaScript escrever no console aparece aqui como [console].','m');
  term.dica();term.atualiza();L.atualiza();
  $('#concluir').addEventListener('click',fecha);
  function fecha(){var bonus=Math.max(0,term.passo-REQ);L.conclui({bonus:bonus,base:1})}
  if(PA.Livre)PA.Livre.liga({sh:L.sh,site:L.SITE,term:term});
})();
