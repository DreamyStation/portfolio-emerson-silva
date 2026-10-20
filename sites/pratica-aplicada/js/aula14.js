/* CodeHome · aula 14 (nível 2): personalizar o site no estilo Matrix com CSS de verdade, com variação de cor sorteada. */
(function(){
  'use strict';
  var PA=window.PA,N2=PA.N2;
  var ALVOS=[
    {nome:'verde Matrix',ex:'#39ff7a',hmin:95,hmax:160},
    {nome:'âmbar de terminal antigo',ex:'#ffb000',hmin:28,hmax:52},
    {nome:'ciano ciberpunk',ex:'#00e5ff',hmin:170,hmax:200},
    {nome:'magenta neon',ex:'#ff2bd6',hmin:290,hmax:335}
  ];
  var BASE='body { font-family: sans-serif; margin: 24px; background: #ffffff; color: #222222; }\nh1 { font-size: 2rem; }\nnav a { margin-right: 12px; }\nmain { max-width: 640px; }\nimg { width: 72px; height: 72px; }\n';
  var L=PA.Licao2({
    etapa:'mx1',medalha2:'estilo',fim:'CSS estilo Matrix concluído',par:720,padrao:'estilo.css',arquivos:['estilo.css','index.html'],
    brief:function(L){return [['Site',L.T.nome,'o seu site, ainda sem estilo'],['Objetivo','Virar Matrix','fundo escuro, brilho, scanlines e glitch'],['Ferramentas','CSS de verdade','variáveis, text-shadow, gradientes e @keyframes']]},
    inicio:function(S,site,L){
      L.alvo=L.sorteia(ALVOS);
      site.f['estilo.css']=PA.fsArq(BASE);
      var h=site.f['index.html'].c;if(!/estilo\.css/.test(h))site.f['index.html'].c=h+'\n<link rel="stylesheet" href="estilo.css">';
    },
    objetivos:function(L){
      var al=L.alvo;
      function css(){return N2.css(L.arq('estilo.css'))}
      function ligado(){return /<link[^>]+estilo\.css/i.test(L.arq('index.html')||'')}
      return [
        {txt:'Crie variáveis de cor em :root (pelo menos 3) e use-as com var(--nome) em pelo menos 3 lugares.',exemplo:"echo ':root { --fundo: #020b05; --texto: #c6ffd8; --brilho: #39ff7a; }' >> estilo.css",
          ok:function(L){var c=css();var nv=Object.keys(c.vars).length;var usos=(L.arq('estilo.css')||'').split('var(').length-1;return c.ok&&ligado()&&nv>=3&&usos>=3},
          dicas:['No topo do CSS: :root { --fundo: #020b05; --texto: #c6ffd8; --brilho: #39ff7a; } — nomes que começam com dois hífens são suas.','Para usar: body { background: var(--fundo); color: var(--texto); }','O :root é a raiz da página: o que se define lá vale para tudo. Se a cor não mudar, confira o nome com os dois hífens.']},
        {txt:'Use a cor '+al.nome+' (matiz entre '+al.hmin+'° e '+al.hmax+'°, ex.: '+al.ex+') como cor principal: no color do texto dos títulos ou links.',
          ok:function(L){var c=css();var vals=[].concat(N2.valor(c,/(^|,|\s)(h1|h2|a|\.titulo|body|header|:root)(\s|,|$|:|\.)/i,'color'),N2.todas(c,'color'));return vals.some(function(v){return N2.noMatiz(N2.cor(v),al)})},
          dicas:['A cor principal vai em color de h1, h2 ou a. Ex.: h1 { color: '+al.ex+'; }','Matiz é a posição da cor no círculo de cores: verde fica em torno de 120°, âmbar 40°, ciano 185°, magenta 310°. Ela também precisa ser viva (saturada) e clara o suficiente para ler sobre fundo preto.','Pode usar hsl(): hsl('+Math.round((al.hmin+al.hmax)/2)+', 100%, 55%) é uma cor dentro do alvo.']},
        {txt:'Faça o fundo da página bem escuro (luminosidade abaixo de 15%) no body ou no html.',
          ok:function(L){var c=css();var v=N2.valor(c,/(^|,|\s)(body|html|:root)(\s|,|$)/i,'background').concat(N2.valor(c,/(^|,|\s)(body|html|:root)(\s|,|$)/i,'background-color'));return v.some(function(x){var k=N2.cor(x);return k&&k.l<15})},
          dicas:['body { background: #020b05; } é um verde quase preto.','Se usar variável: background: var(--fundo); e defina --fundo em :root com uma cor escura.','Se o fundo não escurecer, procure outra regra de body mais abaixo que sobrescreve esta: a última vence.']},
        {txt:'Dê brilho de neon aos títulos com text-shadow (uma sombra colorida e desfocada).',
          ok:function(L){var c=css();return N2.todas(c,'text-shadow').some(function(v){return /(-?[\d.]+)(px|em|rem)?\s+(-?[\d.]+)(px|em|rem)?\s+([\d.]+)(px|em|rem)/.test(v)&&!!N2.cor(v)})},
          dicas:['h1 { text-shadow: 0 0 12px #39ff7a; } — deslocamento x, y, desfoque e cor.','Duas sombras separadas por vírgula deixam o brilho mais forte: 0 0 6px cor, 0 0 18px cor.','O desfoque (terceiro número) é o que dá cara de neon; com 0 vira uma sombra dura.']},
        {txt:'Crie linhas de varredura (scanlines) com repeating-linear-gradient em um fundo ou em ::before/::after do body.',
          ok:function(L){var c=css();return N2.todas(c,'background-image').concat(N2.todas(c,'background')).some(function(v){return /repeating-linear-gradient/i.test(v)})},
          dicas:['Um gradiente repetido de listras finas: repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 1px, transparent 1px 3px).','Aplique em body::after { content: ""; position: fixed; inset: 0; pointer-events: none; background: …; } para ficar por cima de tudo sem bloquear cliques.','Sem content:"" o ::after não aparece. Esse é o erro mais comum com pseudo-elementos.']},
        {txt:'Faça o título tremer com glitch: um @keyframes com pelo menos 3 passos, aplicado com animation.',
          ok:function(L){var c=css();var nomes=c.keyframes.filter(function(k){return k.passos>=3}).map(function(k){return k.nome});if(!nomes.length)return false;return c.regras.some(function(r){var a=(r.decl['animation']||'')+' '+(r.decl['animation-name']||'');return nomes.some(function(nm){return a.indexOf(nm)>=0})})},
          dicas:['@keyframes tremer { 0% { transform: translate(0); } 25% { transform: translate(-3px, 1px); } 50% { transform: translate(3px, -1px); } 100% { transform: translate(0); } }','Aplique: h1 { animation: tremer 2s steps(1) infinite; } — steps(1) deixa o movimento "travado", típico de glitch.','O nome depois de @keyframes precisa ser igual ao nome em animation. Uma letra diferente e nada acontece, sem erro nenhum.']},
        {txt:'Bônus: respeite quem pede menos movimento, desligando a animação dentro de @media (prefers-reduced-motion: reduce).',bonus:true,
          ok:function(L){var c=css();return c.medias.some(function(m){return /prefers-reduced-motion/.test(m)})&&c.regras.some(function(r){return r.media&&/prefers-reduced-motion/.test(r.media)&&/none/.test((r.decl['animation']||'')+(r.decl['animation-name']||'')+(r.decl['transition']||''))})},
          dicas:['@media (prefers-reduced-motion: reduce) { h1 { animation: none; } }','Algumas pessoas passam mal com movimento na tela; o sistema delas avisa o navegador por essa regra.','Use *, *::before, *::after { animation: none !important; } se quiser desligar tudo de uma vez.']},
        {txt:'Bônus de variação: crie um tema alternativo (uma classe como .ambar ou [data-tema="ciano"]) que troque pelo menos 2 variáveis de cor.',bonus:true,
          ok:function(L){var c=css();return c.regras.some(function(r){return !r.media&&!/^(:root|html)$/.test(r.sel.trim())&&/(\.|\[data-)/.test(r.sel)&&Object.keys(r.decl).filter(function(k){return k.indexOf('--')===0}).length>=2})},
          dicas:['body.ambar { --brilho: #ffb000; --texto: #ffe3a3; } troca as cores quando a classe está no <body>.','As variáveis são herdadas: tudo que usa var(--brilho) muda junto.','Para testar, coloque class="ambar" no <body> do index.html.']}
      ];
    }
  });
})();
