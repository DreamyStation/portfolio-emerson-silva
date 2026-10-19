/* Prática aplicada · aula 11 (nível 2): Python, primeiros passos. Python de verdade; o aluno escolhe nomes e jeitos, e a conferência olha o que o programa fez. */
(function(){
  'use strict';
  var PA=window.PA,N2=PA.N2;
  var BUGS=[
    function(n,L){return {txt:'itens',cod:'# Objetivo: mostrar uma linha "Hoje tem ..." para cada item. Conserte os erros.\nitens = ["'+n[0]+'", "'+n[1]+'", "'+n[2]+'"]\nfor item in itens\nprint("Hoje tem " + item)\n',ok:function(h){return N2.inclui(h.texto,['Hoje tem '+n[0],'Hoje tem '+n[1],'Hoje tem '+n[2]])}}},
    function(n,L){return {txt:'site',cod:'# Objetivo: mostrar o nome do site e quantos itens ele tem. Conserte os erros.\nnome = "'+L.T.nome+'"\nquantidade = 3\nprint("Site: " + nome)\nprint("Itens: " + quantidade)\nprint("Fim"\n',ok:function(h){return N2.inclui(h.texto,['Site: '+L.T.nome,'Itens: 3','Fim'])}}},
    function(n,L){return {txt:'precos',cod:'# Objetivo: mostrar quanto custa cada item e, no fim, o total de itens. Conserte os erros.\nprecos = {"'+n[0]+'": 10, "'+n[1]+'": 12, "'+n[2]+'": 15}\nfor item in precos:\n    print(item, "custa", precos[item]\nprint("Total de itens:", len(precos)\n',ok:function(h){return N2.inclui(h.texto,[n[0],n[1],n[2],'Total de itens'])}}},
    function(n,L){var a=8+Math.floor(L.rnd()*20),b=8+Math.floor(L.rnd()*20),c=8+Math.floor(L.rnd()*20);return {txt:'soma',cod:'# Objetivo: somar os valores e mostrar o total. Conserte os erros.\nvalores = ['+a+', '+b+', '+c+']\ntotal = 0\nfor v in valores:\ntotal = total + v\nprint("Total:", totl)\n',ok:function(h){return h.texto.indexOf('Total: '+(a+b+c))>=0}}}
  ];
  var L=PA.Licao2({
    etapa:'py1',medalha2:'Python',fim:'Python: primeiros passos concluído',par:480,padrao:'ola.py',arquivos:['ola.py','quebrado.py','index.html','estilo.css'],
    brief:function(L){return [['Site',L.T.nome,'o mesmo da sua prática · caminho: '+L.T.caminho],['Objetivo','Python de verdade','escrever, rodar e consertar programas'],['Ferramenta','python arquivo.py','editor, terminal e erros reais']]},
    inicio:function(S,site,L){
      var n=L.T.itens.map(function(s){return s.split(' · ')[0]});
      L.bug=L.sorteia(BUGS)(n,L);
      site.f['ola.py']=PA.fsArq('# Seu primeiro programa em Python.\n# Apague estas linhas e escreva o seu código. Depois rode: python ola.py\n');
      site.f['quebrado.py']=PA.fsArq(L.bug.cod);
    },
    objetivos:function(L){
      var n=N2.nomes(L);
      return [
        {txt:'Rode um programa Python que escreva uma frase na tela com print.',exemplo:function(L){return /print\(/.test(L.arq('ola.py')||'')?'python ola.py':"echo 'print(\"Olá, mundo!\")' > ola.py"},
          ok:function(L){return N2.py(L,function(h){return h.texto.trim().length>0&&/print\s*\(/.test(h.codigo)})},
          dicas:['No editor, abra ola.py (clique na aba) e escreva uma linha: print("Olá!")','O texto fica entre aspas. Depois rode no terminal: python ola.py','Se aparecer um erro, leia a última linha dele: é o que o Python quer te dizer.']},
        {txt:'Guarde o nome do site ('+L.T.nome+') em uma variável e mostre-o com print.',
          ok:function(L){return N2.py(L,function(h){return h.texto.indexOf(L.T.nome)>=0&&/^\s*[A-Za-z_]\w*\s*=\s*(["'])/m.test(h.codigo)&&/print\s*\(\s*(f?["'][^)]*\{\w+\}|[A-Za-z_]\w*)/.test(h.codigo)})},
          dicas:['Uma variável é uma caixinha com nome: nome = "'+L.T.nome+'"','Depois, print(nome) mostra o que está dentro da caixinha (sem aspas no print).','Se quiser misturar texto e variável: print(f"Bem-vindo ao {nome}") — repare no f antes das aspas.']},
        {txt:'Crie uma lista com os itens do site ('+n.slice(0,3).join(', ')+') e use um laço for para mostrar um por linha.',
          ok:function(L){return N2.py(L,function(h){return N2.inclui(h.texto,n.slice(0,3))&&/\bfor\b[^\n]*\bin\b/.test(h.codigo)&&/\[/.test(h.codigo)})},
          dicas:['Uma lista usa colchetes e vírgulas: itens = ["a", "b", "c"]','O laço: for item in itens: — e na linha de baixo, com 4 espaços de recuo, print(item).','Em Python o recuo faz parte da sintaxe. Se der IndentationError, confira os espaços no começo da linha do print.']},
        {txt:'Escreva uma função com def que receba um item e devolva uma frase; use-a dentro do laço.',
          ok:function(L){return N2.py(L,function(h){return N2.inclui(h.texto,n.slice(0,3))&&/def\s+\w+\s*\(\s*\w+/.test(h.codigo)&&/\breturn\b/.test(h.codigo)&&/for\b/.test(h.codigo)})},
          dicas:['A função começa com def nome(parametro): e termina com return valor, tudo recuado.','Exemplo: def frase(item): return "Hoje tem " + item','No laço: print(frase(item)). Se faltar o return, a função devolve None e aparece "None" na tela.']},
        {txt:'Bônus: conserte o programa quebrado.py (leia o erro, ache a linha, corrija e rode de novo).',bonus:true,exemplo:'python quebrado.py',
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&h.arq==='quebrado.py'&&L.bug.ok(h)})},
          dicas:['Rode python quebrado.py. O erro mostra o arquivo, a linha e uma explicação; o painel "Quando algo dá errado" traduz.','Corrija um erro por vez e rode de novo: às vezes o primeiro esconde o segundo.','O comentário no topo do arquivo diz o que o programa deve mostrar quando estiver certo.']}
      ];
    }
  });
})();
