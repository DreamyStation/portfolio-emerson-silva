/* Prática aplicada · programação geral 2: lógica (decisões, repetições e funções). O aluno escreve funções em logica.py; testes escondidos, com valores sorteados, rodam em Python de verdade. */
(function(){
  'use strict';
  var PA=window.PA,N2=PA.N2;
  var ri=function(L,a,b){return a+Math.floor(L.rnd()*(b-a+1))};
  var PALAVRAS=[['tic','tac'],['pim','pam'],['cara','coroa'],['ping','pong'],['sol','lua']];
  function inicioStub(){
    return '# Escreva as funções pedidas nos objetivos. Depois rode: python logica.py\n# O terminal mostra o resultado de testes escondidos, com valores diferentes a cada prática.\n\n'+
      'def classifica(nota):\n    """Devolve a letra da nota."""\n    pass\n\n\ndef soma_pares(numeros):\n    """Soma só os números pares da lista."""\n    pass\n\n\ndef maior(numeros):\n    """Devolve o maior número da lista, sem usar max()."""\n    pass\n\n\ndef contar_vogais(texto):\n    """Conta as vogais a, e, i, o, u (maiúsculas ou minúsculas). Letras acentuadas não contam."""\n    pass\n\n\ndef rotulos(n):\n    """Lista de 1 até n com palavras no lugar dos múltiplos."""\n    pass\n';
  }
  function casos(L){
    var c=L.g2,tA=c.tA,tB=c.tB,tC=c.tC;
    function letra(n){return n>=tA?'A':n>=tB?'B':n>=tC?'C':'D'}
    var notas=[tA,tA-1,tB,tB-1,tC,tC-1,0,100,ri(L,0,100),ri(L,0,100)];
    var listas=[[],[ri(L,1,9)*2],[ri(L,1,9),ri(L,1,9)*2,-4,7,10],[1,3,5,7],[ri(L,10,40),ri(L,10,40),ri(L,10,40),ri(L,10,40)]];
    function par(l){return l.filter(function(x){return x%2===0}).reduce(function(a,b){return a+b},0)}
    var ml=[[5],[-3,-9,-1],[ri(L,1,50),ri(L,1,50),ri(L,1,50),ri(L,51,99),ri(L,1,50)],[ri(L,1,9),ri(L,1,9)]];
    var textos=['','Python','AEIOU','Programação','rhythm','Aprender é Divertido'];
    function vog(t){return (t.match(/[aeiouAEIOU]/g)||[]).length}
    function rot(n){var o=[];for(var i=1;i<=n;i++){o.push(i%c.a===0&&i%c.b===0?c.pa+c.pb:i%c.a===0?c.pa:i%c.b===0?c.pb:String(i))}return o}
    return {
      classifica:notas.map(function(n){return [[n],letra(n)]}),
      soma_pares:listas.map(function(l){return [[l],par(l)]}),
      maior:ml.map(function(l){return [[l],Math.max.apply(null,l)]}),
      contar_vogais:textos.map(function(t){return [[t],vog(t)]}),
      rotulos:[1,c.a*c.b,c.a*c.b+2,20].map(function(n){return [[n],rot(n)]})
    };
  }
  var TESTE_PY=function(casosJson){return 'import json, io, contextlib\nsaida = {}\ndetalhe = {}\nbuf = io.StringIO()\ntry:\n    with contextlib.redirect_stdout(buf):\n        import logica\nexcept BaseException as e:\n    print(json.dumps({"__erro": type(e).__name__ + ": " + str(e)}))\n    raise SystemExit\nCASOS = json.loads(r\'\'\''+casosJson+'\'\'\')\n'+
    'for nome, lista in CASOS.items():\n    f = getattr(logica, nome, None)\n    if f is None:\n        saida[nome] = False\n        detalhe[nome] = "a função " + nome + " não existe"\n        continue\n    falhou = None\n    for entrada, esperado in lista:\n        try:\n            obtido = f(*entrada)\n        except BaseException as e:\n            falhou = nome + repr(tuple(entrada)) + " deu erro: " + type(e).__name__\n            break\n        if obtido != esperado:\n            falhou = nome + repr(tuple(entrada)) + " devolveu " + repr(obtido) + " e deveria devolver " + repr(esperado)\n            break\n    saida[nome] = falhou is None\n    detalhe[nome] = ("passou em " + str(len(lista)) + " casos") if falhou is None else falhou\nprint(json.dumps({"ok": saida, "detalhe": detalhe}, ensure_ascii=False))\n'};
  var L=PA.Licao2({
    etapa:'g2',medalha2:'lógica',fim:'lógica de programação concluída',par:900,padrao:'logica.py',arquivos:['logica.py','index.html'],
    brief:function(L){return [['Objetivo','Pensar em passos','decisões, repetições e funções'],['Como confere','Testes escondidos','valores sorteados, rodando em Python de verdade'],['Dica de ouro','Um caso de cada vez','rode, leia o teste que falhou e corrija']]},
    inicio:function(S,site,L){
      var pa=L.sorteia(PALAVRAS),a=ri(L,2,4),b=ri(L,5,7);
      L.g2={tA:ri(L,85,95),tB:ri(L,70,80),tC:ri(L,50,60),a:a,b:b,pa:pa[0],pb:pa[1]};
      site.f['logica.py']=PA.fsArq(inicioStub());
    },
    aoPython:function(L,arq,res,t){
      var f=L.arq('logica.py');if(!f||!/def\s+classifica/.test(f))return;
      return L.confere(TESTE_PY(JSON.stringify(casos(L)))).then(function(r){
        var j=L.json(r);if(!j){t.lin('> Não consegui rodar a conferência: confira se o logica.py roda sem erros.','er');return}
        if(j.__erro){L.testes={};t.lin('> Conferência: não consegui importar o logica.py ('+j.__erro+').','er');return}
        L.testes=j.ok;PA.Arm.grava('n2t:g2',j.ok);
        Object.keys(j.detalhe).forEach(function(k){t.lin((j.ok[k]?'✔ ':'✘ ')+j.detalhe[k],j.ok[k]?'ok':'er')});
      });
    },
    objetivos:function(L){
      var g=L.g2;L.testes=PA.Arm.le('n2t:g2',{})||{};
      function t(n){return function(L){return !!(L.testes&&L.testes[n])}}
      var semMax=function(L){return !/\bmax\s*\(/.test((L.arq('logica.py')||'').replace(/#.*$/gm,''))};
      return [
        {txt:'classifica(nota): devolve "A" se a nota é '+g.tA+' ou mais, "B" a partir de '+g.tB+', "C" a partir de '+g.tC+' e "D" abaixo disso.',exemplo:'python logica.py',ok:t('classifica'),
          dicas:['Use if / elif / else, do limite mais alto para o mais baixo: se nota >= '+g.tA+': return "A".','O primeiro if verdadeiro vence; por isso a ordem importa. elif só é olhado se o anterior falhou.','Rode python logica.py: o terminal mostra, por exemplo, classifica(…) devolveu "B" e deveria devolver "C". Os valores de teste incluem os limites exatos.']},
        {txt:'soma_pares(numeros): soma só os números pares da lista (lista vazia dá 0; negativos pares também contam).',ok:t('soma_pares'),
          dicas:['Comece com total = 0 e percorra a lista com for numero in numeros.','Um número é par quando numero % 2 == 0 (o resto da divisão por 2 é zero). Isso vale também para negativos.','Só some dentro do if. Devolva total no fim, fora do laço (um return recuado demais para depois da primeira volta).']},
        {txt:'maior(numeros): devolve o maior número da lista SEM usar max() (a lista nunca vem vazia).',ok:function(L){return t('maior')(L)&&semMax(L)},
          dicas:['Comece achando que o maior é o primeiro: maior_atual = numeros[0].','Percorra os outros: se numero > maior_atual, troque. No fim devolva maior_atual.','Atenção a listas só com negativos: não comece com 0, ou o 0 vence sem estar na lista. A conferência também olha se você usou max().']},
        {txt:'contar_vogais(texto): conta a, e, i, o, u (maiúsculas ou minúsculas). Letras acentuadas não contam.',ok:t('contar_vogais'),
          dicas:['Percorra o texto letra por letra e compare com uma string de vogais: if letra in "aeiouAEIOU".','Use texto.lower() para tratar maiúsculas e minúsculas de uma vez.','Letras como ã e é não estão na string "aeiou": por isso não são contadas, como pede o objetivo.']},
        {txt:'Bônus: rotulos(n) devolve a lista de 1 até n, trocando por "'+g.pa+'" os múltiplos de '+g.a+', por "'+g.pb+'" os de '+g.b+' e por "'+g.pa+g.pb+'" os de ambos (os outros viram texto: "1", "2"…).',bonus:true,ok:t('rotulos'),
          dicas:['range(1, n + 1) vai de 1 até n, inclusive.','Teste primeiro o caso mais específico (múltiplo de '+g.a+' E de '+g.b+'), depois cada um separado.','Os números comuns viram texto com str(i); a conferência compara listas de textos.']},
        {txt:'Bônus: coloque no fim do arquivo um if __name__ == "__main__": que mostre um exemplo de cada função com print.',bonus:true,
          ok:function(L){return /if\s+__name__\s*==\s*["']__main__["']\s*:/.test(L.arq('logica.py')||'')&&L.hist.some(function(h){return h.t==='py'&&h.ok&&h.texto.trim().length>0&&/__main__/.test(h.codigo)})},
          dicas:['O bloco if __name__ == "__main__": só roda quando o arquivo é executado direto, não quando é importado por outro (como na conferência).','Dentro dele: print(classifica(80)), print(soma_pares([1, 2, 3, 4]))…','Rode python logica.py e veja os exemplos aparecerem.']}
      ];
    }
  });
})();
