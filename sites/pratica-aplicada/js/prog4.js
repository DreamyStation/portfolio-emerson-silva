/* Prática aplicada · programação geral 4: código limpo e refatoração. O aluno reorganiza um programa confuso sem mudar o que ele mostra; a conferência olha a saída e a organização do código. */
(function(){
  'use strict';
  var PA=window.PA;
  var ri=function(L,a,b){return a+Math.floor(L.rnd()*(b-a+1))};
  function monta(L,n){
    var D=ri(L,5,15),X=ri(L,3,9),p=[],usados={};usados[D]=usados[X]=usados[100]=1;
    while(p.length<3){var v=ri(L,11,60);if(!usados[v]){usados[v]=1;p.push(v)}}
    var cod='# Programa confuso: funciona, mas é difícil de ler e de mudar. Refatore sem alterar o que ele mostra.\n'+
      'a = ["'+n[0]+'", "'+n[1]+'", "'+n[2]+'"]\nb = ['+p.join(', ')+']\nx = 0\nfor i in range(3):\n    print(a[i] + ": R$ " + str(b[i]))\n    x = x + b[i]\nprint("Total: R$ " + str(x))\nd = x * '+D+' // 100\nprint("Desconto: R$ " + str(d))\ny = x - d\nprint("A pagar: R$ " + str(y))\nfor i in range(3):\n    print(a[i] + " com taxa: R$ " + str(b[i] + b[i] * '+X+' // 100))\n';
    var tot=p[0]+p[1]+p[2],d=Math.floor(tot*D/100),esp=[];
    for(var i=0;i<3;i++)esp.push(n[i]+': R$ '+p[i]);
    esp.push('Total: R$ '+tot,'Desconto: R$ '+d,'A pagar: R$ '+(tot-d));
    for(i=0;i<3;i++)esp.push(n[i]+' com taxa: R$ '+(p[i]+Math.floor(p[i]*X/100)));
    return {cod:cod,esp:esp,magicos:[D,X,100],media:Math.floor(tot/3),D:D,X:X};
  }
  function semComentarios(c){return c.replace(/#.*$/gm,'')}
  var L=PA.Licao2({
    etapa:'g4',medalha2:'organização',fim:'código limpo concluído',par:960,padrao:'confuso.py',arquivos:['confuso.py','index.html'],
    brief:function(L){return [['Programa','confuso.py','funciona, mas ninguém quer mexer nele'],['Objetivo','Refatorar','mesma saída, código claro'],['Regra de ouro','Não mude o resultado','rode a cada passo e compare a saída']]},
    inicio:function(S,site,L){
      var n=L.T.itens.map(function(s){return s.split(' · ')[0]});
      L.g4=monta(L,n);site.f['confuso.py']=PA.fsArq(L.g4.cod);
    },
    objetivos:function(L){
      var g=L.g4,esp=g.esp.join('\n');
      function mesma(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&h.arq==='confuso.py'&&h.texto.trim()===esp})}
      function cod(L){return L.arq('confuso.py')||''}
      return [
        {txt:'Rode confuso.py e guarde a saída: depois de cada mudança ela precisa continuar exatamente igual (esta é a regra da refatoração).',exemplo:'python confuso.py',ok:function(L){return mesma(L)},
          dicas:['Refatorar é melhorar o código sem mudar o que ele faz. Por isso a saída serve de prova.','Rode python confuso.py antes de mexer e depois de cada passo. Se a saída mudou, desfaça o último passo.','Dica de segurança: copie o arquivo antes (cp confuso.py original.py) para comparar quando quiser.']},
        {txt:'Nomes que explicam: nenhuma variável com nome de 1 ou 2 letras (só i, j e k valem em laços).',
          ok:function(L){if(!mesma(L))return false;var c=semComentarios(cod(L)),re=/^\s*([A-Za-z_]\w*)\s*(?:[-+*\/]|\/\/)?=(?!=)/gm,m,ok=true,achou=0;while((m=re.exec(c))){achou++;if(m[1].length<3&&!/^[ijk]$/.test(m[1]))ok=false}return ok&&achou>0},
          dicas:['a, b, x, d e y não dizem nada. Renomeie para o que elas guardam: nomes, precos, total, desconto, a_pagar.','No editor, troque um nome por vez e rode o programa a cada troca para ter certeza de que nada quebrou.','Nomes em português ou inglês, mas escolha um e mantenha; nomes longos e claros ganham de curtos e misteriosos.']},
        {txt:'Funções com uma tarefa cada: pelo menos 2 funções (def) que usem parâmetros e devolvam resultado com return, e o programa continua com a mesma saída.',
          ok:function(L){if(!mesma(L))return false;var c=semComentarios(cod(L)),defs=c.split(/^def\s+/m).slice(1);var com=defs.filter(function(d){return /\breturn\b/.test(d.split(/^\S/m)[0]||d)}).length;return defs.length>=2&&com>=2},
          dicas:['Procure blocos que fazem uma coisa só: calcular o desconto, calcular a taxa, mostrar uma linha. Cada um pode virar uma função.','def calcula_desconto(total): return total * PERCENTUAL // 100 — recebe o que precisa e devolve o resultado.','Funções que devolvem valor (return) são mais fáceis de testar e de reaproveitar do que as que só imprimem.']},
        {txt:'Sem números mágicos: os valores '+g.magicos.join(', ')+' só podem aparecer na definição de constantes em MAIÚSCULAS (ex.: DESCONTO = '+g.D+').',
          ok:function(L){if(!mesma(L))return false;var c=semComentarios(cod(L)).split('\n'),def=c.filter(function(l){return /^[A-Z][A-Z0-9_]*\s*=/.test(l)}).length,fora=c.filter(function(l){return !/^[A-Z][A-Z0-9_]*\s*=/.test(l)}).join('\n');return def>=2&&!g.magicos.some(function(m){return new RegExp('(^|[^\\w.])'+m+'([^\\w.]|$)').test(fora)})},
          dicas:['Um número solto no meio da conta (como '+g.D+' ou 100) não explica o que significa. Dê um nome: DESCONTO_PERCENTUAL = '+g.D+'.','Coloque as constantes no topo do arquivo, em MAIÚSCULAS. Se o valor mudar, você muda em um lugar só.','O 100 de "por cento" também é um número mágico: pode virar a constante PERCENTO = 100.']},
        {txt:'Documentação: um comentário ou docstring explicando cada função (a primeira linha dentro da função, entre três aspas, é a docstring).',
          ok:function(L){if(!mesma(L))return false;var c=cod(L),defs=(c.match(/^def\s+/gm)||[]).length,doc=(c.match(/"""[\s\S]*?"""|'''[\s\S]*?'''/g)||[]).length,com=(c.match(/^\s*#.*\S/gm)||[]).length-1;return defs>=1&&doc+Math.max(0,com)>=defs},
          dicas:['def total(precos): """Soma os preços da lista.""" return sum(precos)','Comente o porquê, não o óbvio: "# taxa de serviço combinada com o cliente" ajuda mais que "# soma".','O primeiro comentário do arquivo já existe; os que valem aqui são os das funções.']},
        {txt:'Bônus: ler a documentação. Use statistics.mean (digite python -c "import statistics; help(statistics.mean)") e acrescente no fim a linha "Preço médio: R$ '+g.media+'" (int(mean(precos))).',bonus:true,exemplo:'python -c "import statistics; help(statistics.mean)"',
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&h.arq==='confuso.py'&&/\bstatistics\b/.test(h.codigo)&&h.texto.split('\n').some(function(l){return l.trim()==='Preço médio: R$ '+g.media})})},
          dicas:['help(statistics.mean) mostra, no terminal, o que a função recebe e devolve. Documentação oficial: docs.python.org, buscando pelo nome do módulo.','from statistics import mean  e depois  mean(precos)  (precos é a lista de preços).','mean pode devolver um número com vírgula; int(...) tira a parte decimal, como a divisão // faria.']},
        {txt:'Bônus: troque as concatenações (+ str(...)) por f-strings, que são mais legíveis: f"{nome}: R$ {preco}".',bonus:true,
          ok:function(L){if(!mesma(L))return false;var c=semComentarios(cod(L));return !/\+\s*str\s*\(/.test(c)&&(c.match(/\bf["']/g)||[]).length>=3},
          dicas:['Em vez de a + ": R$ " + str(b), escreva f"{a}: R$ {b}". As chaves colocam o valor das variáveis no texto, e não precisa de str().','Dentro das chaves cabem contas: f"{nome} com taxa: R$ {preco + preco * TAXA // PERCENTO}".','Troque uma linha por vez e rode: a saída precisa continuar idêntica.']}
      ];
    }
  });
})();
