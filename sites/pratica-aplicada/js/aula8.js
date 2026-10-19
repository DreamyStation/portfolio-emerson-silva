/* Prática aplicada · aula 8: backend e API. O terminal conversa com um servidor de mentira (curl) e a minitela busca os dados dele com fetch. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,Som=PA.Som,P=PA.Partida;
  var term,feitoReq=false,reqFront=false,serv;
  var L=PA.Licao({
    etapa:'api',medalha2:'API',fim:'backend e API concluídos',arquivo:'script.js',scripts:true,ponte:true,manterScript:true,
    brief:function(L){return [['Site',L.T.nome,'caminho: '+L.T.caminho],['Objetivo','API','pedir dados ao servidor e mostrar na página'],['Ferramentas','curl e fetch','curl no terminal, fetch no JavaScript']]},
    cmds:function(L){serv=PA.Servidor(L.T);return {curl:PA.curl(serv)}},
    aoReiniciar:function(){reqFront=false;if(serv)serv.zera()}
  });
  if(!L)return;
  var T=L.T,item=serv.itens[0].nome;
  /* o index e o script da aula anterior precisam estar ligados */
  (function(){var n=L.sh.no(L.SITE+'/index.html');if(n&&!/script\.js/.test(n.c))n.c+='\n<script src="script.js"></script>';if(!L.sh.no(L.SITE+'/script.js'))L.sh.cria(L.sh.partes(L.SITE+'/script.js'),PA.fsArq(''))})();
  var cmds={
    lista:"echo '<ul id=\"lista\"></ul>' >> index.html",
    fetch:"echo 'fetch(\"/api/itens\").then(r => r.json()).then(itens => { document.getElementById(\"lista\").innerHTML = itens.map(i => \"<li>\" + i.nome + \"</li>\").join(\"\") })' >> script.js"
  };
  var h=function(met,pre,st){return (serv.hist||[]).some(function(x){return x.met===met&&x.url.indexOf(pre)===0&&(st==null||x.status===st)})};
  var passos=[
    {dica:'Passo 1: entre na pasta do site. Digite: cd '+T.slug,cmd:'cd '+T.slug,ok:function(S){return S.cwd[S.cwd.length-1]===T.slug},ex:'O site já tem HTML, CSS e JavaScript. Agora vamos dar a ele um servidor para conversar.'},
    {dica:'Passo 2: peça ao servidor a lista de itens. Digite: curl /api/itens',cmd:'curl /api/itens',ok:function(){return h('GET','/api/itens',200)},ex:'Você fez uma requisição GET para o endereço /api/itens (um endpoint). O servidor respondeu 200 e mandou os dados em JSON, um formato de texto que o JavaScript entende.'},
    {dica:'Passo 3: peça algo que não existe, para ver um erro. Digite: curl /api/pizza',cmd:'curl /api/pizza',ok:function(){return (serv.hist||[]).some(function(x){return x.status===404})},ex:'404 de novo, mas agora vindo de uma API: a rota não existe. Toda boa API responde com o código certo e uma mensagem clara.'},
    {dica:'Passo 4: veja os pedidos já feitos. Digite: curl /api/pedidos',cmd:'curl /api/pedidos',ok:function(){return h('GET','/api/pedidos',200)},ex:'A lista veio vazia: [ ]. O servidor guarda os pedidos na memória dele, que é o que chamamos de banco de dados.'},
    {dica:'Passo 5: crie um pedido com POST. Digite: curl -X POST /api/pedidos -d \'{"item":"'+item+'","qtd":2}\'',cmd:"curl -X POST /api/pedidos -d '{\"item\":\""+item+"\",\"qtd\":2}'",ok:function(){return h('POST','/api/pedidos',201)},ex:'POST envia dados para o servidor criar algo. -d leva o corpo da requisição em JSON. O código 201 quer dizer "criado".'},
    {dica:'Passo 6: confirme que o pedido foi guardado. Digite: curl /api/pedidos',cmd:'curl /api/pedidos',ok:function(){var hs=serv.hist||[],ip=-1;hs.forEach(function(x,i){if(x.met==='POST'&&x.status===201)ip=i});return ip>=0&&hs.slice(ip+1).some(function(x){return x.met==='GET'&&x.url.indexOf('/api/pedidos')===0})},ex:'O pedido continua lá depois de uma nova consulta: o servidor lembra. É por isso que sites guardam carrinho, conta e histórico em um backend.'},
    {dica:'Passo 7: coloque na página o espaço para a lista. Digite: '+cmds.lista,cmd:cmds.lista,ok:function(){return /id=["']lista["']/.test(L.idx())},ex:'Um ul vazio com id "lista" espera o JavaScript preencher.'},
    {dica:'Passo 8: faça o JavaScript buscar os itens no servidor. Digite: '+cmds.fetch,cmd:cmds.fetch,ok:function(){var c=L.compacto('script.js');return /fetch\(["']\/api\/itens["']\)/.test(c)&&/\.json\(\)/.test(c)&&/getElementById\(["']lista["']\)/.test(c)},ex:'fetch faz a requisição de dentro da página; then espera a resposta; json() transforma o texto em dados; map monta um li para cada item.'},
    {dica:'Passo 9: olhe a minitela. A lista de itens deve aparecer, vinda do servidor.',cmd:function(){return 'dica'},ok:function(){return reqFront},ex:'A página pediu os dados e o servidor respondeu: front-end e back-end conversando por uma API. O mesmo servidor atende o terminal e o site.'},
    {dica:'Bônus 1: peça um item só, pelo número. Digite: curl /api/itens/2',cmd:'curl /api/itens/2',bonus:true,ok:function(){return h('GET','/api/itens/2',200)},ex:'/api/itens/2 usa um parâmetro na rota: o 2 identifica o item pedido.'},
    {dica:'Bônus 2: mande um pedido inválido para ver a validação. Digite: curl -X POST /api/pedidos -d \'{"item":"'+item+'","qtd":99}\'',cmd:"curl -X POST /api/pedidos -d '{\"item\":\""+item+"\",\"qtd\":99}'",bonus:true,ok:function(){return h('POST','/api/pedidos',422)},ex:'O servidor recusou (422) porque 99 passa do limite. Nunca confie nos dados que chegam: valide sempre no servidor.'}
  ];
  var REQ=passos.filter(function(x){return !x.bonus}).length,TESTE=8;
  function depoisReq(){if(term.passo>=REQ&&!feitoReq){feitoReq=true;$('#concluir').hidden=false;term.lin('> Backend funcionando! Conclua agora ou faça os bônus para subir a medalha.','ok')}}
  function checaTeste(){var pa=passos[term.passo];if(term.passo===TESTE&&pa.ok()){term.avanca(pa.ex).then(depoisReq)}}
  term=L.terminal(passos,{
    depois:function(txt,r,t){var pa=passos[t.passo];if(pa&&t.passo!==TESTE&&!r.erro&&pa.ok(L.sh,txt)){return t.avanca(pa.ex).then(function(){depoisReq();if(t.passo===TESTE)checaTeste()})}},
    fim:function(){fecha()}
  });
  L.sh.ligaPonte($('#tela'),{log:function(t){term.lin('[console] '+t,'ok')},erro:function(t){term.lin('[erro] '+t,'er');P.penalidade(3,'erro')},
    api:function(rq){var rs=serv.handle(rq.metodo,rq.url,rq.corpo,rq.cab);(serv.hist=serv.hist||[]).push({met:String(rq.metodo).toUpperCase(),url:rq.url,status:rs.status});if(rq.url.indexOf('/api/itens')===0&&rs.status===200){reqFront=true;setTimeout(checaTeste,50)}return rs}});
  term.lin('> Guia: vamos dar um servidor ao site '+T.nome+'. O relógio já está correndo.','ok');
  term.lin('> curl faz requisições à API. As respostas aparecem aqui com o código HTTP e o JSON.','m');
  term.dica();term.atualiza();L.atualiza();
  $('#concluir').addEventListener('click',fecha);
  function fecha(){L.conclui({bonus:Math.max(0,term.passo-REQ),base:1})}
  if(PA.Livre)PA.Livre.liga({sh:L.sh,site:L.SITE,term:term});
})();
