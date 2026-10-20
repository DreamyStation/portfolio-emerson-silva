/* CodeHome · aula 16 (nível 2): desafio final. Um programa Python que gera um site temático Matrix inteiro, com variações. */
(function(){
  'use strict';
  var PA=window.PA,N2=PA.N2,D=PA.Diag,P=PA.Partida,$=PA.$;
  var ALVOS=[
    {nome:'verde Matrix',ex:'#39ff7a',hmin:95,hmax:160},
    {nome:'âmbar de terminal antigo',ex:'#ffb000',hmin:28,hmax:52},
    {nome:'ciano ciberpunk',ex:'#00e5ff',hmin:170,hmax:200},
    {nome:'magenta neon',ex:'#ff2bd6',hmin:290,hmax:335}
  ];
  var EFEITOS=[
    {id:'chuva',txt:'chuva de caracteres em canvas, animada'},
    {id:'digitacao',txt:'título digitado letra por letra'},
    {id:'glitch',txt:'título com glitch (@keyframes aplicado com animation)'}
  ];
  var MS=function(n){return new Promise(function(r){setTimeout(r,n)})};
  var QUADRO="(function(){var c=document.querySelector('canvas');if(!c||!c.width||!c.height)return null;try{var g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data,n=0,h=0;for(var i=0;i<d.length;i+=4){if(d[i+3]>0){n++;h=(h*31+d[i]+d[i+1]*3+d[i+2]*7+(i>>4))|0}}return {n:n,h:h}}catch(e){return null}})()";
  var L=PA.Licao2({
    etapa:'final',medalha2:'projeto',fim:'desafio final do nível 2 concluído',par:1500,padrao:'tema.py',arquivos:['tema.py','index.html','estilo.css','script.js'],base:1,
    brief:function(L){return [['Site',L.T.nome,'o título vem do CONFIG'],['Objetivo','Gerador temático','Python que escreve um site Matrix completo'],['Ferramentas','Tudo do nível 2','Python, HTML, CSS e JavaScript juntos']]},
    inicio:function(S,site,L){
      L.alvo=L.sorteia(ALVOS);L.efeito=L.sorteia(EFEITOS);
      site.f['tema.py']=PA.fsArq('# Desafio final: um programa que GERA o site inteiro a partir de um dicionário de configuração.\n# Comece pelo CONFIG e vá construindo, rodando a cada passo: python tema.py\n');
    },
    objetivos:function(L){
      var al=L.alvo,ef=L.efeito;
      function geradas(){var s={};L.hist.forEach(function(h){if(h.t==='py'&&h.ok)(h.mudou||[]).forEach(function(f){s[f]=1})});return Object.keys(s)}
      function htmls(){return geradas().filter(function(f){return /\.html$/i.test(f)&&L.arq(f)!=null})}
      function csss(){return geradas().filter(function(f){return /\.css$/i.test(f)&&L.arq(f)!=null})}
      function jss(){return geradas().filter(function(f){return /\.js$/i.test(f)&&L.arq(f)!=null})}
      function cssOk(c){var s=N2.css(L.arq(c));return s}
      function semErroEstatico(){return !L.itens().some(function(i){return i.n==='erro'})}
      function escuro(s){var v=N2.valor(s,/(^|,|\s)(body|html|:root)(\s|,|$)/i,'background-color').concat(N2.valor(s,/(^|,|\s)(body|html|:root)(\s|,|$)/i,'background-image')).concat(N2.valor(s,/(^|,|\s)(body|html|:root)(\s|,|$)/i,'background'));return v.some(function(x){var k=N2.cor(x);return k&&k.l<15})}
      return [
        {txt:'Escreva um programa Python que comece com um dicionário CONFIG (cor, titulo e efeito) e rode sem erros.',exemplo:function(L){return (L.arq('tema.py')||'').indexOf('CONFIG')>=0?'python tema.py':"echo 'CONFIG = {\"titulo\": \""+L.T.nome+"\", \"cor\": \""+al.ex+"\", \"efeito\": \""+ef.id+"\"}' > tema.py"},
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&/CONFIG\s*=\s*\{/.test(h.codigo)&&/["']titulo["']/.test(h.codigo)&&/["']cor["']/.test(h.codigo)})},
          dicas:['Um dicionário guarda pares chave: valor: CONFIG = {"titulo": "'+L.T.nome+'", "cor": "'+al.ex+'", "efeito": "'+ef.id+'"}','Depois acesse com CONFIG["titulo"]. Mantenha o CONFIG no topo: é o que você muda para criar variações.','Rode com python tema.py. Nesta etapa pode só imprimir o CONFIG para ver se está certo.']},
        {txt:'O programa deve gerar o index.html e mais 2 páginas (3 ou mais .html), todas com o título do CONFIG ('+L.T.nome+') e links entre elas.',
          ok:function(L){var hs=htmls();if(hs.length<3)return false;var nm=L.T.nome.toLowerCase();if(!hs.every(function(f){return (L.arq(f)||'').toLowerCase().indexOf(nm)>=0}))return false;
            var idx=L.arq('index.html')||'';var ls=[];idx.replace(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi,function(m,h){ls.push(h)});return ls.filter(function(x){return x!=='index.html'&&L.existe(x)}).length>=2},
          dicas:['Crie uma função gerar_pagina(nome_arquivo, conteudo) que escreve um arquivo; use-a três vezes.','O menu pode ser um texto comum com três <a href="..."> que você coloca em todas as páginas.','Cada página precisa mostrar o título: coloque CONFIG["titulo"] num <h1> com f-string.']},
        {txt:'O CSS gerado deve ter variáveis em :root (3 ou mais), fundo escuro e a cor '+al.nome+' (matiz '+al.hmin+'° a '+al.hmax+'°).',
          ok:function(L){return csss().some(function(f){var s=cssOk(f);if(!s.ok||Object.keys(s.vars).length<3)return false;if(!escuro(s))return false;
            var vals=N2.todas(s,'color').concat(N2.todas(s,'text-shadow')).concat(Object.keys(s.vars).map(function(k){return s.vars[k]}));return vals.some(function(v){return N2.noMatiz(N2.cor(v),al)})})},
          dicas:['Use CONFIG["cor"] dentro de uma f-string do CSS: f":root {{ --brilho: {cor}; --fundo: #020b05; --texto: #c6ffd8; }}"','Lembre de dobrar as chaves do CSS em f-strings: {{ e }}. Só as chaves do Python ficam simples.','A cor sorteada para você está no objetivo: um exemplo dentro do alvo é '+al.ex+'.']},
        {txt:'Gere um script.js com o efeito sorteado: '+ef.txt+'. Ele precisa funcionar na minitela sem erros.',
          ok:function(L){if(L.errosJS.length)return false;var js=jss().map(function(f){return L.arq(f)}).join('\n');if(!js.trim()&&ef.id!=='glitch')return false;
            if(ef.id==='digitacao')return /(setInterval|setTimeout)/.test(js)&&/(slice|substring|charAt)/.test(js)&&/(textContent|innerText)/.test(js);
            if(ef.id==='glitch')return csss().some(function(f){var s=cssOk(f);var nomes=s.keyframes.filter(function(k){return k.passos>=3}).map(function(k){return k.nome});return nomes.length&&s.regras.some(function(r){var a=(r.decl['animation']||'')+' '+(r.decl['animation-name']||'');return nomes.some(function(n){return a.indexOf(n)>=0})})});
            return N2.animando(L,js)},
          dicas:[ef.id==='chuva'?'Escreva o JavaScript da chuva (como na aula 15) dentro de um texto de Python e grave em script.js. Use """ (três aspas) para textos longos com várias linhas.':ef.id==='digitacao'?'Grave em script.js o código do título digitado (aula 15). Textos longos ficam mais fáceis com """ (três aspas).':'Grave no CSS um @keyframes com 3 passos e aplique no h1 com animation, como na aula 14.','Cada página precisa ligar o script com <script src="script.js"></script> no fim do <body>.','Atenção: JavaScript usa chaves { } também; dentro de f-strings elas precisam ser dobradas. Mais fácil: escreva o JS num texto comum (sem f) e grave.']},
        {txt:'Nenhum erro de HTML, CSS ou JavaScript no painel "Quando algo dá errado".',
          ok:function(L){return htmls().length>=3&&semErroEstatico()&&L.errosJS.length===0},
          dicas:['Abra o painel e leia cada erro: ele diz o arquivo e a linha.','Como o Python gera os arquivos, o erro está no código Python que monta o texto, não no arquivo gerado: corrija no tema.py e rode de novo.','Erros típicos: tag sem fechar dentro de um laço, chave } sobrando no CSS, aspas misturadas no JS.']},
        {txt:'Variação: mude um valor do CONFIG (um tom diferente da mesma cor, ou outro título) e rode de novo. O resultado gerado precisa ser diferente do anterior.',
          ok:function(L){var porArq={};L.hist.forEach(function(h){if(h.t==='py'&&h.ok&&h.css){(porArq[h.arq]=porArq[h.arq]||{})[h.css+'|'+(h.pag||'')]=1}});return Object.keys(porArq).some(function(a){return Object.keys(porArq[a]).length>=2})},
          dicas:['Altere um valor do CONFIG e salve: um tom mais claro ou mais escuro da mesma cor, ou outro título. A cor continua precisando estar dentro do alvo do objetivo 3.','Rode python tema.py de novo: os arquivos antigos são sobrescritos pelos novos.','Se nada mudou, o programa não está usando o CONFIG ao montar os arquivos: procure onde o valor está fixo no texto.']},
        {txt:'Bônus: deixe o site responsivo: <meta name="viewport"> em alguma página e uma regra @media no CSS gerado.',bonus:true,
          ok:function(L){return htmls().some(function(f){return /<meta[^>]+viewport/i.test(L.arq(f))})&&csss().some(function(f){return cssOk(f).medias.length>0})},
          dicas:['Na <head>: <meta name="viewport" content="width=device-width, initial-scale=1">','No CSS: @media (max-width: 600px) { body { padding: 12px; } }','Com f-strings, as chaves do @media também precisam ser dobradas.']},
        {txt:'Bônus: organize o programa com pelo menos 2 funções (def) que cada uma cuide de uma parte.',bonus:true,
          ok:function(L){return L.hist.some(function(h){return h.t==='py'&&h.ok&&(h.codigo.match(/^\s*def\s+\w+\s*\(/gm)||[]).length>=2})},
          dicas:['Sugestão: gerar_css(config), gerar_js(config) e gerar_pagina(nome, titulo, config).','Cada função devolve um texto; o programa principal só junta e grava.','Funções pequenas deixam os erros mais fáceis de achar.']}
      ];
    },
    aoConcluir:function(L,r){
      var box=$('#curso2-fim'),lista=$('#curso2-lista');if(!box)return;
      var ET=[['py1','Python básico'],['py2','Python escreve o HTML'],['py3','JSON e páginas'],['mx1','CSS Matrix'],['mx2','JavaScript Matrix'],['final','Desafio final']];
      var p=P.get(),tot=0;lista.textContent='';
      ET.forEach(function(x){
        var e=p.etapas[x[0]],li=document.createElement('div');li.className='et';var n=document.createElement('b');n.textContent=x[1];li.appendChild(n);
        if(e&&e.fim){var ms=(e.ms||0)+(e.pen||0)*1000;tot+=ms;var im=document.createElement('img');im.className='spr';im.src='img/'+P.MEDALHAS[e.nota==null?0:e.nota]+'.png';im.width=im.height=40;im.alt='';li.insertBefore(im,n);var t=document.createElement('span');t.textContent=P.fmt(ms);li.appendChild(t)}
        else{var t2=document.createElement('span');t2.textContent='não feita';li.appendChild(t2);li.style.opacity='.55'}
        lista.appendChild(li);
      });
      $('#curso2-total').textContent=P.fmt(tot);box.hidden=false;box.classList.add('on');
    }
  });
})();
