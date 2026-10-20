/* CodeHome · programação geral 1: depuração. Quatro programas com defeitos sorteados (Python, JavaScript no Node e uma página); o aluno investiga e conserta. */
(function(){
  'use strict';
  var PA=window.PA,N2=PA.N2;
  function emOrdem(texto,linhas){
    var ls=String(texto||'').split('\n').map(function(x){return x.trim()}),i=0;
    for(var k=0;k<linhas.length;k++){var ok=false;while(i<ls.length){if(ls[i++]===linhas[k]){ok=true;break}}if(!ok)return false}
    return true;
  }
  var ri=function(L,a,b){return a+Math.floor(L.rnd()*(b-a+1))};
  var B1=[
    function(L,n){return {dica:'NameError',cod:'# Objetivo: mostrar quantos itens o site tem e o primeiro item.\nitens = ["'+n[0]+'", "'+n[1]+'", "'+n[2]+'"]\nquantidade = len(itens)\nprint("Itens:", quantidade)\nprint("Primeiro:", item[0])\n',esp:['Itens: 3','Primeiro: '+n[0]]}},
    function(L,n){var p=ri(L,6,25),u=ri(L,2,9);return {dica:'TypeError',cod:'# Objetivo: mostrar o total pago por '+u+' unidades de R$ '+p+'.\npreco = '+p+'\nunidades = '+u+'\nprint("Total: R$ " + preco * unidades)\n',esp:['Total: R$ '+(p*u)]}},
    function(L,n){return {dica:'IndexError',cod:'# Objetivo: mostrar cada item com o seu número (1, 2, 3...).\nitens = ["'+n[0]+'", "'+n[1]+'", "'+n[2]+'"]\nfor i in range(len(itens) + 1):\n    print(i + 1, itens[i])\n',esp:['1 '+n[0],'2 '+n[1],'3 '+n[2]]}},
    function(L,n){var a=ri(L,5,12),b=ri(L,13,20),c=ri(L,21,30);return {dica:'KeyError',cod:'# Objetivo: mostrar o preço de cada item.\nprecos = {"'+n[0]+'": '+a+', "'+n[1]+'": '+b+', "'+n[2]+'": '+c+'}\nfor nome in ["'+n[0]+'", "'+n[1]+'", "'+n[2]+'"]:\n    print(nome, precos[nome.lower()])\n',esp:[n[0]+' '+a,n[1]+' '+b,n[2]+' '+c]}}
  ];
  var B2=[
    function(L,n){var v=[ri(L,3,9),ri(L,3,9),ri(L,3,9),ri(L,3,9)];return {dica:'zerar dentro do laço',cod:'# Deve imprimir a soma dos valores ('+v.join(' + ')+'), mas imprime outro número.\nvalores = ['+v.join(', ')+']\nfor valor in valores:\n    total = 0\n    total = total + valor\nprint("Soma:", total)\n',esp:['Soma: '+v.reduce(function(a,b){return a+b},0)]}},
    function(L,n){var N=ri(L,6,12);return {dica:'fim do range',cod:'# Deve imprimir a soma de 1 até '+N+' (inclusive), mas imprime menos.\nn = '+N+'\nsoma = 0\nfor i in range(1, n):\n    soma += i\nprint("Soma de 1 até", n, "=", soma)\n',esp:['Soma de 1 até '+N+' = '+(N*(N+1)/2)]}},
    function(L,n){var notas=[ri(L,3,5),6,ri(L,7,10),6,ri(L,2,5),ri(L,8,10)],ap=notas.filter(function(x){return x>=6}).length;return {dica:'comparação',cod:'# Aprovado quem tirou 6 ou mais. Deve imprimir quantos foram aprovados, mas imprime menos.\nnotas = ['+notas.join(', ')+']\naprovados = 0\nfor nota in notas:\n    if nota > 6:\n        aprovados += 1\nprint("Aprovados:", aprovados)\n',esp:['Aprovados: '+ap]}}
  ];
  var B3=[
    function(L,n){var a=ri(L,2,9),b=ri(L,10,20),c=ri(L,21,40);return {dica:'sintaxe',cod:'// Objetivo: mostrar o dobro de cada número.\nconst numeros = ['+a+', '+b+', '+c+'];\nnumeros.forEach(function(n) {\n  console.log("Dobro de " + n + ": " + n * 2)\n});\nconsole.log("Fim"\n',esp:['Dobro de '+a+': '+a*2,'Dobro de '+b+': '+b*2,'Dobro de '+c+': '+c*2,'Fim']}},
    function(L,n){return {dica:'propriedade errada',cod:'// Objetivo: mostrar o cliente e o primeiro item do pedido.\nconst pedido = { cliente: "Ana", itens: ["'+n[0]+'", "'+n[1]+'"] };\nconsole.log("Cliente: " + pedido.cliente);\nconsole.log("Primeiro: " + pedido.item[0]);\n',esp:['Cliente: Ana','Primeiro: '+n[0]]}},
    function(L,n){var v=[ri(L,3,9),ri(L,3,9),ri(L,3,9)];return {dica:'índice do laço',cod:'// Deve mostrar a soma de '+v.join(' + ')+', mas mostra NaN.\nconst valores = ['+v.join(', ')+'];\nlet total = 0;\nfor (let i = 1; i <= valores.length; i++) {\n  total += valores[i];\n}\nconsole.log("Total: " + total);\n',esp:['Total: '+v.reduce(function(a,b){return a+b},0)]}}
  ];
  var PAGINAS=[
    {n:'id errado',head:false,js:'let pedidos = 0;\nconst botao = document.getElementById("comprar");\nconst total = document.getElementById("totall");\nbotao.addEventListener("click", function () {\n  pedidos = pedidos + 1;\n  total.textContent = pedidos;\n});\n'},
    {n:'script antes do HTML',head:true,js:'let pedidos = 0;\nconst botao = document.getElementById("comprar");\nconst total = document.getElementById("total");\nbotao.addEventListener("click", function () {\n  pedidos = pedidos + 1;\n  total.textContent = pedidos;\n});\n'},
    {n:'ordem das linhas',head:false,js:'let pedidos = 0;\nconst botao = document.getElementById("comprar");\nconst total = document.getElementById("total");\nbotao.addEventListener("click", function () {\n  total.textContent = pedidos;\n  pedidos = pedidos + 1;\n});\n'}
  ];
  var L=PA.Licao2({
    etapa:'g1',scriptNoLugar:true,medalha2:'investigação',fim:'depuração concluída',par:840,padrao:'bug1.py',arquivos:['bug1.py','bug2.py','bug3.js','script.js','index.html'],
    brief:function(L){return [['Site','Contador de pedidos','a página de treino tem um defeito'],['Objetivo','Achar e consertar','4 programas com defeitos diferentes'],['Método','Ler, isolar, testar','print, console.log e o painel de erros']]},
    inicio:function(S,site,L){
      var n=L.T.itens.map(function(s){return s.split(' · ')[0]});
      L.g1={b1:L.sorteia(B1)(L,n),b2:L.sorteia(B2)(L,n),b3:L.sorteia(B3)(L,n),pag:L.sorteia(PAGINAS)};
      site.f['bug1.py']=PA.fsArq(L.g1.b1.cod);site.f['bug2.py']=PA.fsArq(L.g1.b2.cod);site.f['bug3.js']=PA.fsArq(L.g1.b3.cod);
      var corpo='<header><h1>Contador de pedidos</h1></header>\n<main><p>Total de pedidos: <span id="total">0</span></p>\n<button id="comprar" type="button">Fazer pedido</button></main>\n';
      var script='<script src="script.js"><\/script>';
      site.f['index.html']=PA.fsArq(L.g1.pag.head?script+'\n'+corpo:corpo+script+'\n');
      site.f['script.js']=PA.fsArq(L.g1.pag.js);
    },
    objetivos:function(L){
      var g=L.g1;
      var Q="(function(){var b=document.getElementById('comprar'),t=document.getElementById('total');if(!b||!t)return null;var a=parseInt(t.textContent,10)||0;b.click();b.click();return parseInt(t.textContent,10)-a})()";
      return [
        {txt:'bug1.py quebra com um erro. Leia o erro, ache a causa e conserte: o programa deve mostrar o resultado descrito no comentário do topo.',exemplo:'python bug1.py',
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&h.arq==='bug1.py'&&emOrdem(h.texto,g.b1.esp)})},
          dicas:['Rode python bug1.py. A última linha do erro diz o tipo ('+g.b1.dica+') e a penúltima, a linha do arquivo. O painel "Quando algo dá errado" explica.','Pergunte: o que o Python esperava encontrar nessa linha e o que encontrou? Use print(...) antes da linha para ver os valores.','Dica sobre o tipo de defeito: '+g.b1.dica+'. Compare a linha com as vizinhas que funcionam.']},
        {txt:'bug2.py roda sem erro, mas o resultado está errado (um bug silencioso). Descubra por quê e corrija.',exemplo:'python bug2.py',
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&h.arq==='bug2.py'&&emOrdem(h.texto,g.b2.esp)})},
          dicas:['Sem erro não há pista automática. Calcule à mão o resultado certo (está no comentário) e compare com o que o programa mostra.','Coloque print dentro do laço para ver o valor de cada variável a cada volta. O valor que foge do esperado aponta a linha.','Tipo do defeito: '+g.b2.dica+'. Releia a linha com calma: um sinal, um limite ou um valor reiniciado fora de hora.']},
        {txt:'bug3.js tem um defeito em JavaScript. Rode com node, interprete a mensagem e conserte.',exemplo:'node bug3.js',
          ok:function(L){return L.hist.some(function(h){return h.t==='js'&&h.ok&&h.arq==='bug3.js'&&emOrdem(h.texto,g.b3.esp)})},
          dicas:['Rode node bug3.js e leia a mensagem. Quando o programa nem começa, quase sempre é erro de sintaxe: falta fechar algo.','Se imprime coisas estranhas (undefined, NaN), use console.log para olhar cada valor antes da linha suspeita.','Tipo do defeito: '+g.b3.dica+'. Conte parênteses, confira nomes de propriedades e os limites do laço.']},
        {txt:'Na minitela, o botão "Fazer pedido" precisa somar 1 ao total a cada clique. Hoje não funciona: investigue o index.html e o script.js.',exemplo:'cat script.js',
          ok:function(L){if(L.errosJS.length)return false;return L.insp(Q).then(function(v){return v===2})},
          dicas:['Clique no botão da minitela e olhe o painel de erros e o terminal: o console do navegador mostra a mensagem.','Pergunte: o elemento existe quando o código o procura? O id do JavaScript é igual ao id do HTML? As linhas estão na ordem certa?','Defeito desta vez: '+g.pag.n+'. Compare ids letra por letra, onde a tag <script> está no index.html e a ordem entre mostrar o valor e somar.']},
        {txt:'Bônus: escreva um assert que prove que o bug2.py (ou uma função sua) está certo. Rode sem erro.',bonus:true,exemplo:'code teste.py',
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&/\bassert\b/.test(h.codigo)})},
          dicas:['assert condição, "mensagem" faz o programa parar com AssertionError se a condição for falsa.','Exemplo: assert 2 + 2 == 4, "a soma deve dar 4"','Teste um caso pequeno em que você já sabe a resposta.']},
        {txt:'Bônus: faça uma função validar e levantar um erro claro (raise ValueError) e capturar com try/except mostrando a mensagem.',bonus:true,
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&/raise\s+ValueError\s*\(/.test(h.codigo)&&/except\s+ValueError/.test(h.codigo)&&h.texto.trim().length>0})},
          dicas:['def raiz(n): if n < 0: raise ValueError("número negativo")','try: raiz(-1) except ValueError as erro: print("Erro:", erro)','Mensagens de erro claras economizam horas de depuração depois.']}
      ];
    }
  });
})();
