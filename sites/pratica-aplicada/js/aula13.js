/* CodeHome · aula 13 (nível 2): dados em JSON e várias páginas geradas por Python. */
(function(){
  'use strict';
  var PA=window.PA,N2=PA.N2,D=PA.Diag;
  function esc(t){return String(t).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
  var L=PA.Licao2({
    etapa:'py3',medalha2:'dados',fim:'dados e páginas geradas concluído',par:720,padrao:'gerar.py',arquivos:['gerar.py','dados.json','dados_quebrado.json','index.html','estilo.css'],
    brief:function(L){return [['Site',L.T.nome,'os dados ficam em dados.json'],['Objetivo','JSON e várias páginas','um programa lê os dados e gera um site inteiro'],['Ferramentas','json, laço, arquivos','uma página por item e um índice']]},
    inicio:function(S,site,L){
      var todos=L.T.itens.map(function(s){var p=s.split(' · ');return {nome:p[0],detalhe:p[1]||''}});
      L.N=Math.min(todos.length,3+Math.floor(L.rnd()*3));
      L.dados=todos.slice(0,L.N);
      site.f['dados.json']=PA.fsArq(JSON.stringify(L.dados,null,2)+'\n');
      /* uma cópia com erros típicos de JSON, para o desafio bônus */
      var q=JSON.stringify(L.dados,null,2).replace(/\n\]$/,',\n]');
      site.f['dados_quebrado.json']=PA.fsArq(q+'\n');
      site.f['gerar.py']=PA.fsArq('# Leia dados.json, e gere uma página para cada item + um index.html com os links.\n# Comece lendo o arquivo:\n#   import json\n#   with open("dados.json", encoding="utf-8") as f:\n#       itens = json.load(f)\n#   print(len(itens))\n');
    },
    objetivos:function(L){
      var nomes=L.dados.map(function(d){return d.nome});
      function paginas(){return L.arquivos('html').filter(function(f){return f!=='index.html'})}
      function doItem(nome){return paginas().filter(function(f){return new RegExp('<h1[^>]*>[^<]*'+esc(nome),'i').test(L.arq(f))})}
      return [
        {txt:'Leia dados.json com json.load e mostre quantos itens existem ('+L.N+').',exemplo:function(L){return (L.arq('gerar.py')||'').indexOf('json.load')>=0?'python gerar.py':"python -c 'import json; print(len(json.load(open(\"dados.json\", encoding=\"utf-8\"))))'"},
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&/json\.load/.test(h.codigo)&&new RegExp('(^|\\D)'+L.N+'(\\D|$)').test(h.texto)})},
          dicas:['import json no começo; depois with open("dados.json", encoding="utf-8") as f: itens = json.load(f)','json.load devolve uma lista de dicionários: itens[0]["nome"] é o nome do primeiro.','len(itens) conta quantos são; print(len(itens)) mostra o número.']},
        {txt:'Gere uma página .html para cada item (são '+L.N+'), com o nome do item no <h1>.',
          ok:function(L){return nomes.every(function(n){return doItem(n).length>=1})&&paginas().length>=L.N},
          dicas:['Faça um laço for item in itens: e, dentro dele, abra um arquivo novo com um nome diferente a cada volta.','Para o nome do arquivo, monte com f-string: f"{numero}.html" ou use o nome do item sem acentos nem espaços.','Cuidado: se todos os arquivos tiverem o mesmo nome, um apaga o outro.']},
        {txt:'Gere o index.html com uma lista de links (<a href>) para todas as páginas dos itens.',
          ok:function(L){var t=L.arq('index.html')||'';var links=[];t.replace(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi,function(m,h){links.push(h)});
            var por=nomes.map(function(n){return doItem(n)});
            return por.every(function(arr){return arr.some(function(f){return links.indexOf(f)>=0})})&&L.hist.some(function(h){return h.t==='py'&&h.ok&&h.mudou.indexOf('index.html')>=0})},
          dicas:['Dentro do laço, guarde também um texto de link: links += f\'<li><a href="{arquivo}">{nome}</a></li>\'','Depois do laço, escreva o index.html com <ul>{links}</ul> dentro.','O href precisa ser exatamente o nome do arquivo gerado; se errar uma letra, o link aponta para nada.']},
        {txt:'Cada página de item precisa ter um link de volta para o index.html.',
          ok:function(L){return nomes.every(function(n){return doItem(n).some(function(f){return /href\s*=\s*["']index\.html["']/i.test(L.arq(f))})})},
          dicas:['Coloque <a href="index.html">Voltar</a> no modelo da página, dentro do laço.','Se você montou o HTML em uma variável, é só incluir o link nela.','Confira na minitela: troque de página no menu e clique no link de volta.']},
        {txt:'Bônus: use json.dump para salvar os itens em ordem alfabética em um novo arquivo .json (ensure_ascii=False mantém os acentos).',bonus:true,
          ok:function(L){return L.arquivos('json').some(function(f){if(/^dados(_quebrado)?\.json$/.test(f))return false;try{var a=JSON.parse(L.arq(f));if(!Array.isArray(a)||a.length!==L.N)return false;var ns=a.map(function(x){return typeof x==='string'?x:x&&x.nome});var ord=ns.slice().sort(function(x,y){return String(x).localeCompare(String(y),'pt-BR')});return ns.every(function(x,i){return x===ord[i]})}catch(e){return false}})&&L.hist.some(function(h){return h.t==='py'&&h.ok&&/json\.dump/.test(h.codigo)})},
          dicas:['sorted(itens, key=lambda d: d["nome"]) devolve a lista ordenada pelo nome.','json.dump(lista, arquivo, ensure_ascii=False, indent=2) escreve no arquivo aberto com "w".','Dê ao arquivo um nome novo, como ordenados.json, para não apagar o dados.json.']},
        {txt:'Bônus: dados_quebrado.json tem um erro típico de JSON. Conserte-o até json.load conseguir ler.',bonus:true,exemplo:"python -c 'import json; json.load(open(\"dados_quebrado.json\", encoding=\"utf-8\"))'",
          ok:function(L){try{var a=JSON.parse(L.arq('dados_quebrado.json'));return Array.isArray(a)&&a.length===L.N}catch(e){return false}},
          dicas:['Rode um programa que tente json.load("dados_quebrado.json") e leia a mensagem: ela diz a posição do erro.','JSON não aceita vírgula depois do último item, nem aspas simples, nem comentários.','Compare com o dados.json, que está certo.']}
      ];
    }
  });
})();
