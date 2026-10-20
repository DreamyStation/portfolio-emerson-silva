/* Prática aplicada · termos com explicação. Passe o mouse, toque ou use Tab: aparece uma dica em português simples, com uma analogia.
   Uso: <span class="termo" data-t="dns">DNS</span> ou PA.Termos.marca(elemento) para marcar sozinho a primeira ocorrência de cada termo. */
(function(){
  'use strict';
  var T={
    depuracao:{t:'Depuração (debug)',al:['depuração','depurar','depurador','debugar'],d:'O trabalho de descobrir por que um programa não faz o que deveria e corrigir a causa. Funciona melhor como investigação com hipóteses do que como tentativa e erro.',a:'Como um mecânico: ele ouve o motor, levanta uma suspeita e testa uma peça de cada vez.'},
    bug:{t:'Bug',al:['bug','bugs','defeito','defeitos'],d:'Um defeito no programa: ele roda, mas faz algo diferente do esperado, às vezes sem mostrar erro nenhum.',a:'Um erro de receita: o bolo sai, só que com sal no lugar do açúcar.'},
    assert:{t:'assert',al:['assert','AssertionError'],d:'Uma afirmação no código: "isto precisa ser verdade". Se não for, o programa para ali e conta o que esperava.',a:'O fiscal que confere cada item da lista e para a fila se algo estiver errado.'},
    teste:{t:'Teste automático',al:['teste automático','testes automáticos'],d:'Um programa pequeno que usa o seu código e confere o resultado, sempre do mesmo jeito. Se algo quebrar, ele avisa na hora.',a:'Um checklist que roda sozinho antes de cada entrega.'},
    casoborda:{t:'Caso de borda',al:['casos de borda','caso de borda'],d:'Um valor nos extremos: lista vazia, zero, o primeiro e o último item, o limite exato. É onde a maioria dos bugs mora.',a:'Os cantos da sala, onde a vassoura costuma não chegar.'},
    algoritmo:{t:'Algoritmo',al:['algoritmo','algoritmos'],d:'Uma sequência de passos que sempre leva ao resultado certo. Programar é escrever algoritmos que o computador consegue seguir.',a:'Uma receita de bolo, com passos na ordem.'},
    refatorar:{t:'Refatoração',al:['refatorar','refatoração','refatorando'],d:'Reorganizar o código por dentro sem mudar o que ele faz por fora. A saída do programa é a prova de que nada quebrou.',a:'Arrumar a oficina: as ferramentas mudam de lugar, mas o trabalho entregue é o mesmo.'},
    constante:{t:'Constante',al:['constante','constantes','números mágicos','número mágico'],d:'Um valor com nome, escrito em MAIÚSCULAS no topo do arquivo (DESCONTO = 10). Evita números soltos que ninguém entende e permite mudar o valor em um lugar só.',a:'A etiqueta de preço na prateleira, em vez de o preço escrito em cada caixa.'},
    docstring:{t:'Docstring',al:['docstring','docstrings'],d:'O texto entre três aspas logo abaixo do def que explica o que a função faz. O help() mostra esse texto.',a:'A etiqueta de instruções colada na máquina.'},
    pontoparada:{t:'Ponto de parada',al:['breakpoint','debugger'],d:'Uma marca que pausa o programa naquela linha para você olhar o valor de tudo, passo a passo.',a:'Apertar o pause no filme para examinar a cena.'},
    navegador:{t:'Navegador',al:['navegador','navegadores'],d:'O programa que você usa para abrir sites: Chrome, Edge, Firefox, Safari. Ele pede as páginas e as desenha na tela.',a:'É você, o cliente do restaurante.'},
    servidor:{t:'Servidor',al:['servidor','servidores'],d:'Um computador ligado o tempo todo que guarda os arquivos de um site e responde a quem pedir.',a:'É a cozinha do restaurante.'},
    dns:{t:'DNS',al:['DNS'],d:'O catálogo de endereços da internet. Traduz o nome do site (padaria.com) para o número do servidor (o IP).',a:'Como uma lista telefônica: você procura o nome e ela dá o número.'},
    ip:{t:'IP',al:['IP'],d:'O número que identifica um computador na internet, como 203.0.113.7.',a:'É o CEP da casa do servidor.'},
    dominio:{t:'Domínio',al:['domínio','domínios'],d:'O nome fácil de lembrar de um site, como padaria.com.br.',a:'O nome da rua, em vez do CEP.'},
    requisicao:{t:'Requisição',al:['requisição','requisições'],d:'A mensagem que o navegador manda ao servidor pedindo algo, como uma página.',a:'O pedido que o cliente faz ao garçom.'},
    resposta:{t:'Resposta',al:['resposta','respostas'],d:'O que o servidor devolve depois de um pedido: a página, um erro ou dados.',a:'O prato que volta da cozinha.'},
    http:{t:'HTTP',al:['HTTP'],d:'O idioma combinado entre navegador e servidor para pedir e responder páginas.',a:'As regras de etiqueta do restaurante.'},
    s200:{t:'200 OK',al:['200 OK','200'],d:'Código que o servidor manda quando deu tudo certo.',a:'"Aqui está o seu prato."'},
    s404:{t:'404',al:['404'],d:'Código de "não achei essa página". O servidor está funcionando, mas o endereço pedido não existe.',a:'"Esse prato não está no cardápio."'},
    html:{t:'HTML',al:['HTML'],d:'A linguagem que descreve a estrutura de uma página: títulos, textos, imagens e links.',a:'O esqueleto da casa.'},
    css:{t:'CSS',al:['CSS'],d:'A linguagem que cuida da aparência: cores, fontes, espaços e posição.',a:'A pintura e a decoração.'},
    js:{t:'JavaScript',al:['JavaScript'],d:'A linguagem que dá comportamento à página: reagir a cliques, fazer contas, buscar dados.',a:'A eletricidade da casa.'},
    tag:{t:'Tag (etiqueta)',al:['tag','tags','etiqueta','etiquetas'],d:'Uma marcação do HTML entre sinais de menor e maior, como <h1>. Quase sempre vem em par: abre <h1> e fecha </h1>.',a:'Uma etiqueta colada numa caixa dizendo o que tem dentro.'},
    terminal:{t:'Terminal',al:['terminal','Terminal'],d:'Uma janela onde você controla o computador digitando comandos, em vez de clicar.',a:'Conversar com o computador por mensagem de texto.'},
    comando:{t:'Comando',al:['comando','comandos'],d:'Uma instrução curta que você digita no terminal, como ls (listar) ou mkdir (criar pasta).',a:'Um pedido direto ao computador.'},
    pasta:{t:'Pasta',al:['pasta','pastas','diretório','diretórios'],d:'Um lugar para organizar arquivos. Também se chama diretório.',a:'Uma gaveta do armário.'},
    arquivo:{t:'Arquivo',al:['arquivo','arquivos'],d:'Um conteúdo guardado com um nome, como index.html ou foto.png.',a:'Uma folha dentro da gaveta.'},
    editor:{t:'Editor de código',al:['editor de código','editor'],d:'Um programa para escrever código com ajuda de cores e atalhos. O mais usado hoje é o VS Code, grátis.',a:'O caderno em que você escreve a receita.'},
    caminho:{t:'Caminho',al:['caminho','caminhos'],d:'O endereço de um arquivo ou pasta dentro do computador, como /home/voce/padaria/index.html.',a:'O trajeto até a gaveta certa.'},
    git:{t:'Git',al:['Git'],d:'Um programa que guarda o histórico do seu projeto, para você voltar atrás e trabalhar em equipe.',a:'Um caderno de rascunhos com todas as versões.'},
    node:{t:'Node.js',al:['Node.js','Node'],d:'Um programa que roda JavaScript fora do navegador. Muitas ferramentas de sites precisam dele.',a:'Um fogão extra para a cozinha do JavaScript.'},
    pixel:{t:'Pixel',al:['pixel','pixels'],d:'Cada quadradinho de uma imagem. Uma foto é uma grade enorme de pixels, cada um com uma cor.',a:'Uma pastilha de um mosaico.'},
    png:{t:'PNG',al:['PNG'],d:'Formato de imagem sem perda de qualidade e com fundo transparente. Ótimo para ícones e pixel art.',a:'Uma foto revelada sem retoque.'},
    jpg:{t:'JPG',al:['JPG','JPEG'],d:'Formato de imagem comprimido, bom para fotos: o arquivo fica pequeno, com uma pequena perda de qualidade.',a:'Uma foto espremida para caber na mala.'},
    svg:{t:'SVG',al:['SVG'],d:'Imagem feita de desenho em texto (linhas e formas), que não perde qualidade ao ampliar. Ótima para logos e ícones simples.',a:'Uma receita de como desenhar, em vez do desenho pronto.'},
    byte:{t:'Byte',al:['byte','bytes'],d:'A unidade em que o computador guarda tudo. Um arquivo é uma fila de bytes, cada um um número de 0 a 255.',a:'Uma letra do alfabeto do computador.'},
    api:{t:'API',al:['API'],d:'Um "cardápio" de pedidos que um servidor aceita responder por programas, não só por pessoas.',a:'O cardápio que o garçom entrega à cozinha.'},
    backend:{t:'Backend',al:['backend','back-end'],d:'A parte do sistema que roda no servidor: guarda dados e aplica as regras. Você não vê, mas depende dela.',a:'A cozinha.'},
    seletor:{t:'Seletor',al:['seletor','seletores'],d:'A parte da regra CSS que diz a quem ela se aplica, como h1 (todos os títulos) ou nav a (links dentro do menu).',a:'O endereço do destinatário numa carta.'},
    propriedade:{t:'Propriedade',al:['propriedade','propriedades'],d:'O que você quer mudar, como color (cor), padding (espaço interno) ou font-size (tamanho da letra).',a:'O botão do painel que você vai girar.'},
    valor:{t:'Valor',al:['valor','valores'],d:'Quanto ou como mudar a propriedade: color: blue, padding: 8px, font-size: 2rem.',a:'A posição do botão do painel.'},
    margin:{t:'Margin',al:['margin','margem'],d:'O espaço do lado de fora de um elemento, que o afasta dos vizinhos.',a:'A distância entre dois quadros na parede.'},
    padding:{t:'Padding',al:['padding'],d:'O espaço do lado de dentro de um elemento, entre a borda e o conteúdo.',a:'A moldura branca ao redor de uma foto.'},
    flex:{t:'Flexbox',al:['flexbox','flex'],d:'Um jeito de organizar itens em uma linha ou coluna, com espaçamento e alinhamento automáticos.',a:'Arrumar livros em uma prateleira.'},
    grid:{t:'Grid',al:['grid'],d:'Um jeito de organizar a página em linhas e colunas, como uma tabela invisível.',a:'A planta quadriculada de uma cidade.'},
    hover:{t:':hover',al:[':hover','hover'],d:'Um estado do CSS que vale enquanto o mouse está em cima do elemento. Serve para dar retorno visual a botões e links.',a:'A luz que acende quando você chega perto do interruptor.'},
    transition:{t:'transition',al:['transition','transição'],d:'Faz a mudança de um valor acontecer aos poucos, em vez de num salto. Ex.: transition: background .2s.',a:'Girar o dimmer em vez de ligar e desligar a luz.'},
    animation:{t:'animation',al:['animation','animação','animações'],d:'Faz um elemento seguir uma sequência de passos que você descreve com @keyframes.',a:'Um desenho animado: vários quadros em sequência.'},
    keyframes:{t:'@keyframes',al:['@keyframes','keyframes'],d:'Onde você descreve os quadros de uma animação: como o elemento começa (from) e como termina (to).',a:'O roteiro de cada cena.'},
    responsivo:{t:'Responsivo',al:['responsivo','responsiva','media query','@media'],d:'Um site que se adapta ao tamanho da tela. Em CSS, a regra @media muda o estilo conforme a largura.',a:'Uma roupa que se ajusta a quem veste.'},
    viewport:{t:'Viewport',al:['viewport'],d:'A área da tela em que a página aparece. A tag meta viewport avisa o celular para usar a largura real do aparelho, e não fingir que é um computador.',a:'O tamanho da janela da loja.'},
    breakpoint:{t:'Ponto de quebra',al:['ponto de quebra','pontos de quebra','breakpoint','breakpoints'],d:'A largura de tela em que o layout muda, como 900 px ou 560 px. Cada ponto de quebra é uma regra @media.',a:'O ponto em que a fila do caixa vira duas filas.'},
    clamp:{t:'clamp()',al:['clamp'],d:'Uma função do CSS que escolhe um valor entre um mínimo e um máximo: clamp(1.8rem, 5vw, 2.8rem).',a:'Um termostato com temperatura mínima e máxima.'},
    frontend:{t:'Frontend',al:['frontend','front-end'],d:'A parte do site que aparece para a pessoa: textos, cores, botões. Roda no navegador.',a:'O salão do restaurante.'},
    variavel:{t:'Variável',al:['variável','variáveis'],d:'Uma caixinha com nome que guarda um valor na memória: let n = 0. Dá para trocar o valor depois.',a:'Uma gaveta com etiqueta.'},
    funcao:{t:'Função',al:['função','funções'],d:'Um bloco de código com nome ou sem nome que roda quando é chamado. A seta => cria uma função curta.',a:'Uma receita que você pode repetir quando quiser.'},
    evento:{t:'Evento',al:['evento','eventos'],d:'Algo que acontece na página e o JavaScript pode escutar: um clique, uma tecla, o envio de um formulário.',a:'A campainha tocando.'},
    dom:{t:'DOM',al:['DOM'],d:'A página transformada em uma árvore de objetos que o JavaScript consegue encontrar e alterar.',a:'A planta da casa que dá para reformar com a casa aberta.'},
    console:{t:'Console',al:['console'],d:'A janela de recados do programador: o código escreve nela com console.log para mostrar valores e erros.',a:'O caderno de anotações do programa.'},
    condicao:{t:'Condição',al:['condição','condições'],d:'Um teste que decide se um bloco de código roda: if (n >= 5) { ... }.',a:'"Se estiver chovendo, leve o guarda-chuva".'},
    fetch:{t:'fetch',al:['fetch'],d:'O comando do JavaScript que pede dados a um servidor sem recarregar a página.',a:'O garçom que vai à cozinha e volta com o pedido.'},
    json:{t:'JSON',al:['JSON'],d:'Texto organizado em chaves e valores que servidores e JavaScript entendem: {"item": "Pão", "qtd": 2}.',a:'A comanda padronizada da cozinha.'},
    endpoint:{t:'Endpoint',al:['endpoint','endpoints','rota','rotas'],d:'O endereço de um pedido específico da API, como /api/itens.',a:'Cada item do cardápio de pedidos.'},
    curl:{t:'curl',al:['curl'],d:'Um programa do terminal que faz requisições HTTP e mostra a resposta, sem precisar de navegador.',a:'Um navegador que só fala por texto.'},
    hash:{t:'Hash',al:['hash'],d:'Uma impressão digital de um texto: sempre gera o mesmo resultado, mas é impossível voltar ao texto original.',a:'Um liquidificador: dá para fazer a vitamina, não dá para desfazer.'},
    sal:{t:'Sal (salt)',al:['sal'],d:'Um texto aleatório misturado à senha antes do hash, para que senhas iguais gerem hashes diferentes.',a:'O tempero secreto de cada usuário.'},
    token:{t:'Token',al:['token'],d:'Uma senha temporária que o servidor entrega depois do login. A pessoa a envia nos próximos pedidos em vez da senha.',a:'A pulseira de um evento: prova que você já passou pela portaria.'},
    xss:{t:'XSS',al:['XSS'],d:'Falha em que o texto digitado por um visitante vira código e roda no navegador de outras pessoas. A defesa é escapar o texto antes de mostrar.',a:'Um bilhete no mural que, ao ser lido, dá ordens ao leitor.'},
    sqli:{t:'Injeção de SQL',al:['injeção de SQL'],d:'Falha em que o texto digitado reescreve a consulta ao banco de dados. A defesa são consultas com parâmetros.',a:'Alguém reescrevendo o pedido na comanda antes de chegar à cozinha.'},
    commit:{t:'Commit',al:['commit','commits'],d:'Uma foto do projeto salva no histórico do Git, com uma mensagem dizendo o que mudou.',a:'Salvar uma versão do jogo.'},
    github:{t:'GitHub',al:['GitHub'],d:'Um site que guarda projetos Git na nuvem e permite publicá-los como sites gratuitos com o GitHub Pages.',a:'Um armário na nuvem para o seu projeto.'},
    https:{t:'HTTPS',al:['HTTPS'],d:'A versão segura do HTTP: criptografa a conversa entre o visitante e o site. É o cadeado do navegador.',a:'Falar em um envelope lacrado, não em um cartão postal.'},
    hospedagem:{t:'Hospedagem',al:['hospedagem'],d:'O serviço que mantém o seu site num servidor ligado o tempo todo.',a:'O terreno onde a casa fica.'},
    python:{t:'Python',al:['Python'],d:'Uma linguagem de programação de leitura fácil, usada para automatizar tarefas, tratar dados e gerar arquivos.',a:'Um assistente que segue receitas escritas em frases simples.'},
    lista:{t:'Lista',al:['lista','listas'],d:'Um conjunto ordenado de valores guardado em uma variável: ["pão", "bolo", "café"].',a:'Uma lista de compras.'},
    laco:{t:'Laço (for)',al:['laço','laços'],d:'Um bloco de código que se repete, uma vez para cada item de uma lista, ou até uma condição mudar.',a:'Uma esteira de fábrica: a mesma ação para cada peça.'},
    fstring:{t:'f-string',al:['f-string','f-strings'],d:'Um texto do Python com f antes das aspas, em que as chaves { } são trocadas pelo valor de variáveis: f"Olá, {nome}".',a:'Um formulário com lacunas que o programa preenche.'},
    dicionario:{t:'Dicionário',al:['dicionário','dicionários'],d:'No Python, uma coleção de pares chave: valor, como {"nome": "Pão", "preco": 2}.',a:'Uma agenda: você procura o nome e acha o telefone.'},
    traceback:{t:'Traceback',al:['traceback'],d:'O relatório completo de um erro do Python: mostra o caminho percorrido até o problema e, na última linha, o tipo do erro.',a:'O rastro de pegadas até o lugar onde o programa tropeçou.'},
    tryexcept:{t:'try / except',al:['try/except'],d:'Um jeito de tentar fazer algo e, se der erro, dizer o que fazer em vez de o programa parar.',a:'Um plano B para quando a porta estiver trancada.'},
    canvas:{t:'Canvas',al:['canvas'],d:'Uma área de desenho da página em que o JavaScript pinta formas e texto pixel a pixel.',a:'Uma tela em branco com pincéis controlados por código.'},
    scanline:{t:'Scanlines',al:['scanlines'],d:'Linhas finas e escuras que cobrem a tela, imitando monitores antigos.',a:'As listras de uma TV de tubo.'},
    glitch:{t:'Glitch',al:['glitch'],d:'Um defeito visual de mentira: partes da imagem tremem, se deslocam ou trocam de cor por um instante.',a:'A TV chiando por meio segundo.'},
    cssvar:{t:'Variável CSS',al:['variáveis CSS','variável CSS'],d:'Um valor com nome, definido com dois hífens (--brilho: #39ff7a) e usado com var(--brilho). Mudou em um lugar, muda em todos.',a:'Uma paleta de tintas: troque a tinta e tudo o que a usa muda.'}
  };
  var tip=null,alvo=null,fecha=null;
  function mk(){if(tip)return tip;tip=document.createElement('div');tip.id='dica-termo';tip.setAttribute('role','tooltip');document.body.appendChild(tip);
    tip.addEventListener('mouseenter',function(){clearTimeout(fecha)});tip.addEventListener('mouseleave',function(){esconde(200)});return tip}
  function posiciona(el){
    var r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight,sx=window.scrollX,sy=window.scrollY;
    var x=Math.min(Math.max(8,r.left),window.innerWidth-w-8)+sx,y=r.bottom+10+sy;
    if(r.bottom+h+16>window.innerHeight&&r.top>h+16)y=r.top-h-10+sy;
    tip.style.left=x+'px';tip.style.top=y+'px';
  }
  function mostra(el){
    var d=T[el.dataset.t];if(!d)return;mk();clearTimeout(fecha);
    var igual=alvo===el&&tip.classList.contains('on')&&!tip.classList.contains('sai');
    if(igual){posiciona(el);return}
    tip.classList.remove('sai');tip.textContent='';
    var b=document.createElement('b');b.textContent=d.t;var p=document.createElement('p');p.textContent=d.d;var a=document.createElement('p');a.className='an';a.textContent=d.a;tip.append(b,p,a);
    tip.classList.add('on');if(alvo&&alvo!==el)alvo.setAttribute('aria-expanded','false');alvo=el;el.setAttribute('aria-expanded','true');el.setAttribute('aria-describedby','dica-termo');
    tip.style.minHeight='';tip.style.minHeight=tip.offsetHeight+'px';posiciona(el);
    var Fx=window.PA&&window.PA.Fx;
    if(Fx&&!Fx.reduz){
      var alvoAtual=el;
      Fx.digita(p,{ms:9,maxTicks:55,cursorFim:0,fim:function(){if(alvo!==alvoAtual)return;Fx.digita(a,{ms:9,maxTicks:45,cursorFim:500,fim:function(){tip.style.minHeight=''}})}});
    }
  }
  function esconde(atraso){clearTimeout(fecha);fecha=setTimeout(function(){
    if(tip&&tip.classList.contains('on')){tip.classList.add('sai');setTimeout(function(){if(tip.classList.contains('sai'))tip.classList.remove('on','sai')},170)}
    if(alvo){alvo.setAttribute('aria-expanded','false');alvo=null}},atraso||0)}
  document.addEventListener('mouseover',function(e){var el=e.target.closest&&e.target.closest('.termo');if(el&&matchMedia('(hover:hover)').matches){mostra(el)}});
  document.addEventListener('mouseout',function(e){var el=e.target.closest&&e.target.closest('.termo');if(el)esconde(250)});
  document.addEventListener('focusin',function(e){var el=e.target.closest&&e.target.closest('.termo');if(el)mostra(el)});
  document.addEventListener('focusout',function(e){if(e.target.closest&&e.target.closest('.termo'))esconde(150)});
  document.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest('.termo');
    if(el){e.preventDefault();if(alvo===el&&tip.classList.contains('on'))esconde(0);else mostra(el);return}
    if(tip&&!e.target.closest('#dica-termo'))esconde(0);
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')esconde(0)});
  window.addEventListener('scroll',function(){if(tip&&tip.classList.contains('on')&&alvo)posiciona(alvo)},{passive:true});

  /* marca sozinho a primeira ocorrência de cada termo dentro de um elemento */
  if(window.PA&&window.PA.I18n&&window.PA.I18n.termos)window.PA.I18n.termos(T);
  var PRE='(?<![\\p{L}\\p{N}_<\\/.-])',POS='(?![\\p{L}\\p{N}_>.-]|\\.[a-z])';
  function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
  var ER=Object.keys(T).map(function(k){
    var al=T[k].al.slice().sort(function(a,b){return b.length-a.length});
    var ac=/^[A-Z0-9.]+$/.test(al[0]);
    return {k:k,re:new RegExp(PRE+'('+al.map(esc).join('|')+')'+POS,ac?'u':'iu')};
  });
  function marca(raiz,opc){
    opc=opc||{};var usados=opc.usados||{};if(!raiz)return;
    if(window.PA&&window.PA.I18n&&window.PA.I18n.en&&window.PA.I18n.aplica)window.PA.I18n.aplica(raiz);
    var w=document.createTreeWalker(raiz,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentNode;if(!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      if(p.closest&&p.closest('.termo,button,a,code,pre,input,textarea,script,style,.u,.cmd,.cad,.sel,.tag,h1,.bytes,.arvore,.conteudo'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
    var nos=[];while(w.nextNode())nos.push(w.currentNode);
    nos.forEach(function(n){
      var txt=n.nodeValue;
      for(var i=0;i<ER.length;i++){
        var e=ER[i];if(usados[e.k])continue;var m=e.re.exec(txt);if(!m)continue;
        usados[e.k]=1;var ini=m.index,fim=ini+m[0].length;
        var sp=document.createElement('span');sp.className='termo';sp.dataset.t=e.k;sp.tabIndex=0;sp.setAttribute('role','button');sp.setAttribute('aria-expanded','false');sp.textContent=m[0];
        var dep=document.createTextNode(txt.slice(fim));n.nodeValue=txt.slice(0,ini);n.parentNode.insertBefore(sp,n.nextSibling);n.parentNode.insertBefore(dep,sp.nextSibling);
        /* continua procurando outros termos no restante */
        n=dep;txt=dep.nodeValue;i=-1;
      }
    });
  }
  /* elementos manuais também ganham acessibilidade */
  function prepara(){Array.prototype.forEach.call(document.querySelectorAll('.termo:not([role])'),function(el){el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-expanded','false')})}
  window.PA=window.PA||{};window.PA.Termos={marca:marca,dict:T,prepara:prepara};
  document.addEventListener('DOMContentLoaded',function(){prepara();Array.prototype.forEach.call(document.querySelectorAll('[data-termos]'),function(el){marca(el)})});
  if(document.readyState!=='loading'){prepara();Array.prototype.forEach.call(document.querySelectorAll('[data-termos]'),function(el){marca(el)})}
})();
