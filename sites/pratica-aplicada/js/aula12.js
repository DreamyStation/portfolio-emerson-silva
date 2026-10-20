/* CodeHome · aula 12 (nível 2): Python escreve o HTML e o CSS. */
(function(){
  'use strict';
  var PA=window.PA,N2=PA.N2,D=PA.Diag;
  var CORES=[['âmbar','#ffb000'],['ciano','#00e5ff'],['magenta','#ff2bd6'],['limão','#c6ff00'],['coral','#ff6b5e'],['violeta','#b388ff']];
  var L=PA.Licao2({
    etapa:'py2',medalha2:'automação',fim:'Python escrevendo o site concluído',par:600,padrao:'gerar.py',arquivos:['gerar.py','index.html','estilo.css'],
    brief:function(L){return [['Site',L.T.nome,'o Python vai escrever as páginas deste site'],['Objetivo','Gerar HTML e CSS','um programa que cria os arquivos do site'],['Ferramentas','open, laço, f-string','arquivos de texto escritos por código']]},
    inicio:function(S,site,L){
      L.cor=L.sorteia(CORES);
      site.f['gerar.py']=PA.fsArq('# Escreva aqui um programa que GERA uma página HTML.\n# Um começo possível:\n#\n#   pagina = "<h1>Olá</h1>"\n#   with open("pagina.html", "w", encoding="utf-8") as f:\n#       f.write(pagina)\n#\n# Depois rode no terminal: python gerar.py\n');
    },
    objetivos:function(L){
      var n=N2.nomes(L);
      function geradas(){var s={};L.hist.forEach(function(h){if(h.t==='py'&&h.ok)(h.mudou||[]).forEach(function(f){s[f]=1})});return Object.keys(s)}
      function htmls(){return geradas().filter(function(f){return /\.html$/i.test(f)&&L.arq(f)!=null})}
      return [
        {txt:'Escreva um programa Python que crie um arquivo .html com um título <h1> (sem erros de HTML).',exemplo:function(L){return (L.arq('gerar.py')||'').indexOf('open(')>=0?'python gerar.py':"echo 'open(\"pagina.html\", \"w\").write(\"<h1>Olá</h1>\")' > gerar.py"},
          ok:function(L){return htmls().some(function(f){var t=L.arq(f);return /<h1[\s>]/i.test(t)&&!D.html(t,{arq:f}).some(function(i){return i.n==='erro'})})},
          dicas:['No Python, open("pagina.html", "w") abre (e cria) um arquivo para escrita; .write(texto) coloca o texto dentro.','Use with open(...) as f: e escreva f.write("<h1>Olá</h1>") recuado. O with fecha o arquivo sozinho.','Depois de rodar, o arquivo aparece na árvore de pastas e no menu de páginas da minitela.']},
        {txt:'Use um laço para criar uma <li> para cada item do site ('+n.slice(0,3).join(', ')+'…), dentro de uma <ul>.',
          ok:function(L){return htmls().some(function(f){var t=L.arq(f);return n.every(function(x){return new RegExp('<li[^>]*>\\s*[^<]*'+x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(t)})&&/<ul/i.test(t)})&&L.hist.some(function(h){return h.t==='py'&&h.ok&&/\bfor\b/.test(h.codigo)})},
          dicas:['Monte o HTML em uma variável de texto: itens = "" e, no laço, itens += "<li>" + nome + "</li>".','A lista com os nomes pode ser escrita no próprio programa: nomes = ["'+n[0]+'", "'+n[1]+'", …] (todos os '+n.length+').','Depois, coloque "<ul>" + itens + "</ul>" dentro do arquivo.']},
        {txt:'Use f-strings para colocar o nome do site ('+L.T.nome+') no <title> e no <h1>.',
          ok:function(L){return htmls().some(function(f){var t=L.arq(f);return new RegExp('<title[^>]*>[^<]*'+L.T.nome.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(t)&&new RegExp('<h1[^>]*>[^<]*'+L.T.nome.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(t)})&&L.hist.some(function(h){return h.t==='py'&&h.ok&&/\bf["']/.test(h.codigo)})},
          dicas:['Uma f-string começa com f antes das aspas e usa chaves para colocar variáveis: f"<h1>{nome}</h1>"','Faça o mesmo no <title>…</title>, que fica no <head> de um documento completo (<!doctype html> … ).','Cuidado: se o HTML tiver chaves de CSS dentro de uma f-string, dobre-as: {{ e }}.']},
        {txt:'O próprio Python deve criar um arquivo CSS que use a cor '+L.cor[0]+' ('+L.cor[1]+') e a página precisa ligar esse CSS com <link>.',
          ok:function(L){var cssGerados=geradas().filter(function(f){return /\.css$/i.test(f)&&L.arq(f)!=null});
            return cssGerados.some(function(c){return (L.arq(c)||'').toLowerCase().indexOf(L.cor[1])>=0&&htmls().some(function(f){return (L.arq(f)||'').indexOf(c)>=0})})},
          dicas:['Faça um segundo open("estilo.css", "w") e escreva regras como body { color: '+L.cor[1]+'; } dentro do arquivo.','Em f-string, a chave do CSS precisa ser dobrada: f"body {{ color: {cor}; }}". Sem isso aparece SyntaxError ou NameError.','No HTML, acrescente <link rel="stylesheet" href="estilo.css"> dentro do <head>.']},
        {txt:'Bônus: tente abrir o arquivo dados.txt (que não existe) dentro de try/except FileNotFoundError e mostre uma mensagem amigável em vez do erro.',bonus:true,
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&/\btry\s*:/.test(h.codigo)&&/except\s+FileNotFoundError/.test(h.codigo)&&/open\s*\(\s*["']dados\.txt/.test(h.codigo)&&h.texto.trim().length>0})},
          dicas:['try: tenta fazer algo; except FileNotFoundError: diz o que fazer se o arquivo não existir.','Dentro do try: open("dados.txt").read(). Dentro do except: print("não achei o arquivo, vou usar valores padrão").','Todo o bloco try/except precisa de recuo correto, como um if.']}
      ];
    }
  });
})();
