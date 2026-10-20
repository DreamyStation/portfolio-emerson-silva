/* CodeHome · aula 15 (nível 2): efeitos Matrix com JavaScript de verdade (texto digitado e chuva em canvas), com variação sorteada. */
(function(){
  'use strict';
  var PA=window.PA,N2=PA.N2;
  var BASE=':root { --fundo: #020b05; --texto: #c6ffd8; --brilho: #39ff7a; }\nbody { margin: 0; padding: 24px; background: var(--fundo); color: var(--texto); font-family: monospace; }\nh1 { color: var(--brilho); text-shadow: 0 0 12px var(--brilho); }\nnav a { color: var(--brilho); margin-right: 12px; }\nmain { position: relative; z-index: 1; max-width: 640px; }\ncanvas { position: fixed; inset: 0; z-index: 0; }\nimg { width: 72px; height: 72px; }\n';
  var EXEMPLO='// Exemplo de chuva de caracteres em canvas. Leia, entenda e adapte: não precisa copiar tudo.\nconst cv = document.createElement("canvas");\ndocument.body.prepend(cv);\nconst g = cv.getContext("2d");\ncv.width = innerWidth; cv.height = innerHeight;\nconst letras = "アイウエオ0123456789";\nconst tam = 16;\nconst colunas = Math.floor(cv.width / tam);\nconst gotas = Array(colunas).fill(0);\nsetInterval(() => {\n  g.fillStyle = "rgba(2, 11, 5, 0.15)";\n  g.fillRect(0, 0, cv.width, cv.height);\n  g.fillStyle = "#39ff7a";\n  g.font = tam + "px monospace";\n  gotas.forEach((y, i) => {\n    const c = letras[Math.floor(Math.random() * letras.length)];\n    g.fillText(c, i * tam, y * tam);\n    gotas[i] = (y * tam > cv.height && Math.random() > 0.975) ? 0 : y + 1;\n  });\n}, 60);\n';
  var VARIACOES=[
    {txt:'a chuva deve usar somente os caracteres 0 e 1 (binário)',teste:function(c){return /["'`]\s*[01\s,]{2,}["'`]/.test(c)&&!/[゠-ヿ]/.test(c)},dica:'Troque a string de letras por "01" (ou "0101"). Cada caractere sorteado vem dessa string.'},
    {txt:'a chuva deve usar as letras do nome do site',teste:null,dica:'Use o nome do site como a string de letras: const letras = "NOME". Cada coluna sorteia uma delas.'},
    {txt:'a chuva deve usar só símbolos de código: < > / { } ;',teste:function(c){var m=c.match(/["'`]([^"'`\n]*)["'`]/g)||[];return m.some(function(s){var k=0;'<>/{};'.split('').forEach(function(x){if(s.indexOf(x)>=0)k++});return k>=4})},dica:'Use uma string como "<>/{};" no lugar das letras.'}
  ];
  var MS=function(n){return new Promise(function(r){setTimeout(r,n)})};
  var QUADRO="(function(){var c=document.querySelector('canvas');if(!c||!c.width||!c.height)return null;try{var g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data,n=0,h=0;for(var i=0;i<d.length;i+=4){if(d[i+3]>0){n++;h=(h*31+d[i]+d[i+1]*3+d[i+2]*7+(i>>4))|0}}return {n:n,h:h}}catch(e){return null}})()";
  var L=PA.Licao2({
    etapa:'mx2',medalha2:'efeitos',fim:'JavaScript estilo Matrix concluído',par:840,padrao:'script.js',arquivos:['script.js','exemplo-chuva.js','index.html','estilo.css'],
    brief:function(L){return [['Site',L.T.nome,'com o visual Matrix já aplicado'],['Objetivo','Dar vida','título digitado e chuva de caracteres'],['Ferramentas','JavaScript real','setInterval, canvas e DOM']]},
    inicio:function(S,site,L){
      L.var=L.sorteia(VARIACOES);
      if(!L.var.teste){var nome=L.T.nome.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');L.var.teste=function(c){return new RegExp('["\'`][^"\'`\\n]*'+nome+'[^"\'`\\n]*["\'`]','i').test(c)}}
      var sv=PA.Arm.le('n2:mx1',null);
      site.f['estilo.css']=PA.fsArq(sv&&sv['estilo.css']&&sv['estilo.css'].length>200?sv['estilo.css']:BASE);
      site.f['script.js']=PA.fsArq('// Escreva aqui o seu JavaScript. Ele roda de verdade na minitela.\n');
      site.f['exemplo-chuva.js']=PA.fsArq(EXEMPLO);
      var h=site.f['index.html'].c;if(!/estilo\.css/.test(h))h+='\n<link rel="stylesheet" href="estilo.css">';if(!/script\.js/.test(h))h+='\n<script src="script.js"></script>';site.f['index.html'].c=h;
    },
    objetivos:function(L){
      function js(){return L.arq('script.js')||''}
      function semErro(){return L.errosJS.length===0}
      return [
        {txt:'Faça o título (h1) ser digitado sozinho, letra por letra, como numa máquina de escrever.',exemplo:'code script.js',
          ok:function(L){var c=js();return semErro()&&/(setInterval|setTimeout|requestAnimationFrame)/.test(c)&&/(textContent|innerText|innerHTML)/.test(c)&&/(slice|substring|substr|charAt|\[\s*\w+\s*\])/.test(c)&&/(h1|querySelector|getElementsByTagName)/.test(c)&&/h1/.test(c)},
          dicas:['Guarde o texto: const h = document.querySelector("h1"); const texto = h.textContent; h.textContent = "";','Um contador i e um setInterval que, a cada 80 ms, faz h.textContent = texto.slice(0, i++) até chegar ao fim (clearInterval).','Se o título sumir e não voltar, o intervalo nunca chega ao fim: confira a condição que usa o tamanho do texto (texto.length).']},
        {txt:'Crie uma chuva de caracteres em um <canvas> com movimento contínuo (a conferência olha os pixels da tela).',
          ok:function(L){if(!semErro())return false;return N2.animando(L,js())},
          dicas:['Abra exemplo-chuva.js no editor: ele mostra uma chuva completa. Leia primeiro, depois escreva a sua em script.js.','Crie o canvas: const cv = document.createElement("canvas"); document.body.prepend(cv); depois pegue o contexto com cv.getContext("2d").','Sem setInterval (ou requestAnimationFrame) o desenho fica parado: a conferência exige movimento. Se a tela ficar toda preta, o rastro está apagando tudo: use fillRect com cor semitransparente (alfa 0.1 a 0.2).']},
        {txt:'Variação sorteada: '+L.var.txt+'.',
          ok:function(L){return semErro()&&L.var.teste(js())},
          dicas:[L.var.dica,'Depois de mudar, a chuva muda sozinha na minitela. Se nada mudou, confira se o script salvo é o que está ligado no index.html (a tag <script src="script.js">).','Erros de sintaxe aparecem no painel "Quando algo dá errado", com a linha.']},
        {txt:'Bônus: faça a chuva usar a cor do tema, lendo --brilho do CSS com getComputedStyle(...).getPropertyValue.',bonus:true,
          ok:function(L){return semErro()&&/getComputedStyle/.test(js())&&/getPropertyValue/.test(js())},
          dicas:['const cor = getComputedStyle(document.documentElement).getPropertyValue("--brilho").trim();','Use depois: g.fillStyle = cor;','Se vier texto vazio, o nome da variável está diferente do que foi definido no :root do CSS.']},
        {txt:'Bônus: pare a animação quando a pessoa pede menos movimento (matchMedia com prefers-reduced-motion).',bonus:true,
          ok:function(L){return semErro()&&/matchMedia/.test(js())&&/prefers-reduced-motion/.test(js())},
          dicas:['const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;','Se reduz for verdadeiro, desenhe um quadro só e não crie o setInterval.','if (!reduz) { setInterval(...) }']},
        {txt:'Bônus: de vez em quando, um glitch: um setInterval ou setTimeout que adiciona e remove uma classe (classList) no título.',bonus:true,
          ok:function(L){return semErro()&&/classList\.(add|toggle)/.test(js())&&/(setInterval|setTimeout)/.test(js())&&/classList\.(remove|toggle)/.test(js())},
          dicas:['h.classList.add("glitch"); setTimeout(() => h.classList.remove("glitch"), 300);','Crie a classe no CSS (.glitch { transform: translateX(3px); text-shadow: 3px 0 magenta, -3px 0 cyan; }).','Para ser raro, use um intervalo longo (5000 a 12000 ms) ou sorteie com Math.random().']}
      ];
    }
  });
})();
