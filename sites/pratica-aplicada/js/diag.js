/* Prática aplicada · diagnóstico de erros. Lê o que o aluno escreveu (HTML, CSS, JavaScript, Python) e explica, em português simples,
   o que está errado, onde e como resolver. Nada aqui é roteiro fixo: as regras olham o código de verdade. */
(function(){
  'use strict';
  var TAGS='a abbr address article aside audio b bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script section select slot small source span strong style sub summary sup svg table tbody td template textarea tfoot th thead time title tr track u ul var video wbr path rect circle line polyline polygon g defs'.split(' ');
  var VOID=/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
  var PROPS=null;

  function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++){d[i]=[i]}for(j=1;j<=n;j++)d[0][j]=j;
    for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
  function parecido(x,lista,max){var melhor=null,mv=99;lista.forEach(function(y){var v=lev(x,y);if(v<mv){mv=v;melhor=y}});return mv<=(max||2)&&melhor!==x?melhor:null}
  function linhaDe(src,idx){return src.slice(0,idx).split('\n').length}
  function item(n,arq,lin,t,x,c){return {n:n,arq:arq||'',lin:lin||0,t:t,x:x||'',c:c||''}}

  /* ---------------------------------------------------------------- HTML */
  function html(src,op){
    op=op||{};var it=[],arq=op.arq||'index.html',pilha=[],ids={};
    var re=/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g,m;
    var semTags=src.replace(/<!--[\s\S]*?-->/g,function(x){return x.replace(/[^\n]/g,' ')});
    while((m=re.exec(semTags))){
      if(m[0].indexOf('<!--')===0)continue;
      var fecha=m[1]==='/',tag=m[2].toLowerCase(),at=m[3]||'',lin=linhaDe(src,m.index);
      if(!fecha&&(at.split('"').length-1)%2===1)it.push(item('erro',arq,lin,'Aspas sem fechar em <'+tag+'>','Um atributo abriu aspas e não fechou. O navegador engole o resto da página dentro do valor.','Confira se todo atributo tem aspas dos dois lados: href="pagina.html".'));
      if(!fecha&&TAGS.indexOf(tag)<0&&tag.indexOf('-')<0){var s=parecido(tag,TAGS,2);it.push(item('aviso',arq,lin,'A etiqueta <'+tag+'> não existe no HTML',s?'Você quis escrever <'+s+'>?':'O navegador não sabe o que fazer com ela e a trata como um bloco qualquer.','Troque pelo nome certo ou use <div> ou <span>.'))}
      if(fecha){
        var k=pilha.length-1;while(k>=0&&pilha[k].tag!==tag)k--;
        if(k<0)it.push(item('erro',arq,lin,'</'+tag+'> fecha algo que não foi aberto','Existe um fechamento sobrando (ou o de abertura tem erro de digitação).','Apague este </'+tag+'> ou confira a etiqueta de abertura.'));
        else{while(pilha.length-1>k){var o=pilha.pop();it.push(item('erro',arq,o.lin,'<'+o.tag+'> da linha '+o.lin+' não foi fechada antes de </'+tag+'>','Quando uma etiqueta fica aberta, as seguintes viram "filhas" dela sem querer, e o layout quebra.','Feche com </'+o.tag+'> no lugar certo.'))}pilha.pop()}
      }else{
        if(!VOID.test(tag)&&!/\/\s*$/.test(at))pilha.push({tag:tag,lin:lin});
        var ida=/\bid\s*=\s*("([^"]*)"|'([^']*)')/i.exec(at);if(ida){var id=ida[2]||ida[3];if(ids[id])it.push(item('erro',arq,lin,'id "'+id+'" repetido (também na linha '+ids[id]+')','O id precisa ser único. Com dois iguais o JavaScript e o CSS pegam só o primeiro.','Troque um deles, ou use class se for um estilo repetido.'));else ids[id]=lin}
        if(tag==='img'){
          if(!/\balt\s*=/.test(at))it.push(item('aviso',arq,lin,'Imagem sem alt','O alt descreve a imagem para quem usa leitor de tela e aparece se ela não carregar.','Acrescente alt="descrição curta".'));
          var sr=/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(at);if(sr&&op.existe){var cam=sr[1]||sr[2];if(!/^(https?:|data:|#|\/\/)/.test(cam)&&cam&&!op.existe(cam))it.push(item('erro',arq,lin,'Imagem não encontrada: '+cam,'O caminho não leva a nenhum arquivo da sua pasta. Maiúsculas, pastas e a extensão (.png) contam.','Rode ls imagens e copie o nome exato.'))}
        }
        if(tag==='a'&&!/\bhref\s*=/.test(at))it.push(item('aviso',arq,lin,'Link <a> sem href','Sem href o link não leva a lugar nenhum.','Acrescente href="pagina.html".'));
        if(tag==='link'&&/rel\s*=\s*["']stylesheet/i.test(at)&&op.existe){var hr=/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(at);if(hr){var ch=hr[1]||hr[2];if(!/^(https?:|\/\/)/.test(ch)&&!op.existe(ch))it.push(item('erro',arq,lin,'Arquivo de estilo não encontrado: '+ch,'A página pede um CSS que não existe nessa pasta, então fica sem estilo.','Confira o nome do arquivo com ls.'))}}
        if(tag==='script'&&op.existe){var sc=/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(at);if(sc){var cs=sc[1]||sc[2];if(!/^(https?:|\/\/)/.test(cs)&&!op.existe(cs))it.push(item('erro',arq,lin,'Script não encontrado: '+cs,'A página pede um JavaScript que não existe nessa pasta.','Confira o nome do arquivo com ls.'))}}
      }
    }
    pilha.forEach(function(o){it.push(item('erro',arq,o.lin,'<'+o.tag+'> nunca foi fechada','Falta o </'+o.tag+'> correspondente. O navegador tenta adivinhar, mas o resultado costuma sair errado.','Acrescente </'+o.tag+'> onde o bloco termina.'))});
    var aberta=/<[a-zA-Z][^<>]*$/.exec(semTags);if(aberta)it.push(item('erro',arq,linhaDe(src,aberta.index),'Etiqueta sem o sinal ">"','Uma etiqueta começou e o texto acabou sem fechar o ">".','Feche com > a etiqueta desta linha.'));
    if(/<html/i.test(src)){
      if(!/<!doctype/i.test(src))it.push(item('aviso',arq,1,'Falta <!doctype html>','Sem ele o navegador entra em modo antigo e alguns estilos mudam.','Coloque <!doctype html> na primeira linha.'));
      if(!/<meta[^>]+charset/i.test(src))it.push(item('aviso',arq,1,'Falta <meta charset="utf-8">','Sem isso acentos podem aparecer quebrados (Ã§Ã£).','Acrescente dentro do <head>.'));
      if(!/<meta[^>]+viewport/i.test(src))it.push(item('aviso',arq,1,'Falta a meta viewport','No celular a página aparece minúscula, como a versão de computador.','Acrescente <meta name="viewport" content="width=device-width, initial-scale=1">.'));
    }
    return it.sort(function(a,b){return a.lin-b.lin});
  }

  /* ---------------------------------------------------------------- CSS */
  function propsConhecidas(){if(PROPS)return PROPS;var s=document.documentElement.style,l=[];for(var k in s){if(typeof s[k]==='string'&&/^[a-z]/.test(k)&&!/^(webkit|moz)/.test(k))l.push(k.replace(/[A-Z]/g,function(c){return '-'+c.toLowerCase()}))}PROPS=l;return l}
  function semComentarios(src){return src.replace(/\/\*[\s\S]*?\*\//g,function(x){return x.replace(/[^\n]/g,' ')})}
  function css(src,op){
    op=op||{};var it=[],arq=op.arq||'estilo.css',c=semComentarios(src),pilha=[],buf='',bufLin=1,lin=1,q=null;
    function declaracoes(txt,lin0){
      var partes=[],cur='',pr=0,qq=null,l=lin0,ini=lin0;
      for(var i=0;i<txt.length;i++){var ch=txt[i];
        if(qq){cur+=ch;if(ch===qq)qq=null;if(ch==='\n')l++;continue}
        if(ch==='"'||ch==="'"){qq=ch;cur+=ch;continue}
        if(ch==='(')pr++;if(ch===')')pr--;
        if(ch===';'&&pr<=0){partes.push([cur,ini]);cur='';ini=l;continue}
        if(ch==='\n')l++;cur+=ch;
      }
      if(cur.trim())partes.push([cur,ini]);
      partes.forEach(function(pt){
        var t=pt[0],lead=t.length-t.replace(/^\s+/,'').length,ln=pt[1]+(lead?t.slice(0,lead).split('\n').length-1:0),d=t.trim();if(!d)return;
        var ix=d.indexOf(':');
        if(ix<0){it.push(item('erro',arq,ln,'Declaração sem ":" — "'+d.slice(0,28)+'"','Toda declaração CSS é propriedade: valor;','Escreva assim: color: red;'));return}
        var prop=d.slice(0,ix).trim().toLowerCase(),val=d.slice(ix+1).trim().replace(/\s*!important\s*$/i,'');
        if(/\n\s*[a-z-]+\s*:/i.test(val))it.push(item('erro',arq,ln,'Faltou ";" depois de "'+prop+': '+val.split('\n')[0].trim()+'"','Duas declarações ficaram coladas e o navegador descarta as duas.','Coloque ponto e vírgula no fim da primeira.'));
        if(prop.indexOf('--')===0)return;
        if(window.CSS&&CSS.supports){
          if(!CSS.supports(prop,'initial')&&!CSS.supports(prop,'inherit')){var s=parecido(prop,propsConhecidas(),2);it.push(item('erro',arq,ln,'Propriedade desconhecida: '+prop,s?'Você quis escrever "'+s+'"?':'O navegador ignora propriedades que não conhece, sem avisar.','Confira a grafia (CSS usa hífen: background-color, não backgroundColor).'));return}
          if(val&&val.indexOf('\n')<0&&!CSS.supports(prop,val)){
            var dica='Confira o valor: cor (#39ff7a), medida com unidade (12px, 2rem) ou uma palavra válida.';
            if(/^-?\d+(\.\d+)?$/.test(val)&&val!=='0')dica='Faltou a unidade: 12px, 2rem, 50%…';
            if(/^#[0-9a-f]+$/i.test(val)&&!/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(val))dica='Cor hexadecimal precisa de 3, 4, 6 ou 8 dígitos.';
            it.push(item('erro',arq,ln,'Valor inválido em '+prop+': '+val.slice(0,30),'O navegador descarta a declaração inteira quando o valor não é aceito.',dica));
          }
        }
      });
    }
    function abre(pre,l){
      pre=pre.trim();
      var tipo=/^@(media|supports|layer|container|document)/i.test(pre)?'grupo':/^@(-webkit-)?keyframes/i.test(pre)?'quadros':'regra';
      if(tipo==='regra'&&pre&&pre.charAt(0)!=='@'&&!/^(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*$/i.test(pre)){
        try{document.createDocumentFragment().querySelector(pre)}catch(e){it.push(item('erro',arq,l,'Seletor inválido: '+pre.slice(0,40),'O navegador não entendeu este seletor e ignora o bloco inteiro.','Seletores: nome-da-tag, .classe, #id, e combinações com espaço, > ou vírgula.'))}
      }
      if(tipo==='regra'&&!pre)it.push(item('erro',arq,l,'Bloco { sem seletor','As chaves precisam vir depois de um seletor (body, .caixa, h1…).','Escreva o seletor antes da chave.'));
      pilha.push({tipo:tipo,lin:l,corpo:tipo==='regra',txt:''});
    }
    for(var i=0;i<c.length;i++){
      var ch=c[i],t=pilha[pilha.length-1],acc=(t&&t.corpo);
      if(q){if(ch===q&&c[i-1]!=='\\')q=null;if(acc)t.txt+=ch;else buf+=ch;if(ch==='\n')lin++;continue}
      if(ch==='"'||ch==="'"){q=ch;if(acc)t.txt+=ch;else buf+=ch;continue}
      if(ch==='{'){
        var pre=buf,pl=bufLin;
        if(acc){
          var k=t.txt.lastIndexOf(';');pre=t.txt.slice(k+1);pl=lin;
          declaracoes(t.txt.slice(0,k+1),t.lin);pilha.pop();
          it.push(item('erro',arq,t.lin,'O bloco da linha '+t.lin+' não foi fechado','Outra { começou antes de o bloco anterior terminar. Provavelmente faltou um } depois da última declaração.','Feche o bloco anterior com }.'));
        }
        abre(pre,pl);buf='';
      }else if(ch==='}'){
        if(!t)it.push(item('erro',arq,lin,'Chave } sobrando','Existe um fechamento sem abertura correspondente (uma { faltando antes).','Apague este } ou procure a { que sumiu.'));
        else{pilha.pop();if(t.corpo)declaracoes(t.txt,t.lin)}
        buf='';bufLin=lin;
      }else{
        if(acc)t.txt+=ch;else{if(!buf.trim()&&!/\s/.test(ch))bufLin=lin;buf+=ch}
        if(ch==='\n')lin++;
      }
    }
    pilha.forEach(function(o){it.push(item('erro',arq,o.lin,'Chave { da linha '+o.lin+' nunca foi fechada','Faltou o } correspondente. Tudo o que vem depois fica dentro desse bloco e para de funcionar.','Feche com } no fim do bloco.'))});
    return it.sort(function(a,b){return a.lin-b.lin});
  }

  /* ---------------------------------------------------------------- JavaScript */
  function jsErro(msg,lin,arq){
    var m,t='',x='',c='';arq=arq||'script.js';msg=String(msg||'');
    if((m=/(\w+) is not defined/.exec(msg))){t='O nome "'+m[1]+'" não existe';x='O JavaScript não conhece "'+m[1]+'": pode ser erro de digitação, falta de let/const, ou maiúscula/minúscula diferente (ele diferencia).';c='Confira a grafia, declare com let ou const antes de usar e veja se o nome está no mesmo escopo.'}
    else if((m=/Cannot read propert(?:y|ies) of (null|undefined) \(reading '([^']*)'\)/.exec(msg))){t='Usando algo que ainda não existe ('+m[1]+')';x='O código tentou ler ".'+m[2]+'" de um valor '+m[1]+'. Quase sempre o getElementById/querySelector não achou o elemento: o id está diferente do HTML, ou o script roda antes de a página existir.';c='Confira o id no HTML, e deixe o script no fim da página (ou use DOMContentLoaded).'}
    else if((m=/Cannot set propert(?:y|ies) of (null|undefined) \(setting '([^']*)'\)/.exec(msg))){t='Mudando algo que não existe ('+m[1]+')';x='O código tentou escrever em ".'+m[2]+'" de um elemento que não foi encontrado.';c='Confira se o id existe no HTML e se o script roda depois dele.'}
    else if((m=/(.+) is not a function/.exec(msg))){t='"'+m[1].slice(0,40)+'" não é uma função';x='Você usou parênteses () em algo que não é função, ou o nome da função está errado (ex.: getElementByID em vez de getElementById).';c='Confira a grafia exata e as maiúsculas do nome.'}
    else if(/Assignment to constant variable/.test(msg)){t='Mudando uma const';x='Variáveis criadas com const não podem receber outro valor.';c='Troque const por let se o valor precisa mudar.'}
    else if(/Unexpected end of input/.test(msg)){t='O código acabou antes da hora';x='Faltou fechar alguma chave }, parêntese ) ou colchete ].';c='Conte as aberturas e fechamentos; um editor com destaque de pares ajuda.'}
    else if(/Unexpected token|Unexpected identifier|Invalid or unexpected token|missing \)/.test(msg)){t='Erro de sintaxe: '+msg.slice(0,60);x='Tem algo fora do lugar perto desta linha: vírgula, ponto e vírgula, aspas ou parêntese esquecidos ou sobrando.';c='Olhe a linha indicada e a anterior; muitas vezes o erro real está na linha de cima.'}
    else if(/is not iterable/.test(msg)){t='Valor que não dá para percorrer';x='O for…of ou o spread esperava uma lista, mas recebeu outra coisa.';c='Use console.log para ver o que a variável realmente contém.'}
    else if(/laço infinito detectado/.test(msg)){t='Laço infinito bloqueado';x='O código tem while(true) ou for(;;) sem break. Rodar isso travaria a página, então não foi executado.';c='Todo laço precisa de uma condição que um dia fique falsa, ou de um break. Para repetir de tempos em tempos, use setInterval.'}
    else if(/require is not defined/.test(msg)){t='"require" não existe neste ambiente';x='Aqui o JavaScript roda como no navegador, sem módulos do Node.';c='Escreva o código sem require/import.'}
    else if(/Maximum call stack/.test(msg)){t='Função que chama a si mesma sem parar';x='Uma recursão sem condição de parada estourou a pilha.';c='Acrescente uma condição que encerre a chamada.'}
    else{t='Erro: '+msg.slice(0,70);x='O JavaScript parou neste ponto com a mensagem acima.';c='Copie a mensagem, procure a linha indicada e use console.log para ver os valores antes dela.'}
    return item('erro',arq,lin||0,t,x,c);
  }

  /* ---------------------------------------------------------------- Python */
  function pyErro(txt){
    txt=String(txt||'');var linhas=txt.trim().split('\n'),ult=linhas[linhas.length-1]||'',m=/^(\w+(?:\.\w+)*)(?::\s*(.*))?$/.exec(ult)||[],tipo=m[1]||'Erro',msg=m[2]||'';
    var lin=0,arq='',re=/File "([^"]+)", line (\d+)/g,mm;while((mm=re.exec(txt))){if(mm[1].charAt(0)!=='<'&&mm[1].indexOf('/lib/')<0){arq=mm[1];lin=+mm[2]}}
    var t='',x='',c='',w;
    if(tipo==='SyntaxError'){
      t='Erro de sintaxe: '+(msg||'o Python não entendeu a linha');
      if(/expected ':'/.test(msg)){x='Faltou os dois pontos (:) no fim de if, for, while, def ou class.';c='Acrescente : no fim da linha indicada.'}
      else if(/was never closed/.test(msg)){x='Um parêntese, colchete ou chave foi aberto e não foi fechado.';c='Procure o símbolo citado e feche-o.'}
      else if(/unterminated string|EOL while/.test(msg)){x='Um texto começou com aspas e não terminou na mesma linha.';c='Feche as aspas ou use três aspas (""") para textos longos.'}
      else if(/invalid syntax/.test(msg)){x='Tem algo fora do lugar: operador sobrando, vírgula faltando ou palavra reservada usada como nome.';c='Olhe a linha indicada e a de cima; o erro real costuma estar um pouco antes.'}
      else if(/f-string/.test(msg)){x='Dentro de uma f-string, chaves { } valem como código. Para escrever uma chave de CSS, dobre: {{ }}.';c='Troque { por {{ e } por }} nas partes que são CSS.'}
      else{x='O Python não conseguiu ler esta linha.';c='Compare com um exemplo que funciona, símbolo por símbolo.'}
    }else if(tipo==='IndentationError'||tipo==='TabError'){t='Recuo (indentação) errado';x='Em Python o recuo faz parte da sintaxe: o bloco depois de : precisa estar mais para dentro, e todas as linhas do bloco com o mesmo recuo.';c='Use 4 espaços por nível, sem misturar com Tab.'}
    else if(tipo==='NameError'){w=/name '([^']+)'/.exec(msg);t='O nome "'+(w?w[1]:'?')+'" não existe';x='Uma variável ou função foi usada antes de ser criada, ou o nome foi escrito diferente (Python diferencia maiúsculas).';c='Confira a grafia e se a linha que cria o nome vem antes.'}
    else if(tipo==='TypeError'){t='Tipos que não combinam';x=/concatenate|unsupported operand/.test(msg)?'Você misturou tipos, como texto + número.':/not callable/.test(msg)?'Você usou () em algo que não é função.':/argument/.test(msg)?'A função recebeu mais ou menos argumentos do que espera.':'Uma operação foi feita com um tipo de dado que não aceita isso.';c='Converta com str() ou int() quando precisar, e confira a lista de argumentos da função.'}
    else if(tipo==='KeyError'){t='Chave inexistente no dicionário: '+msg;x='Você pediu uma chave que não está no dicionário.';c='Veja as chaves com print(dados.keys()) ou use dados.get("chave").'}
    else if(tipo==='IndexError'){t='Posição fora da lista';x='A lista tem menos itens do que o índice pedido (a contagem começa em 0).';c='Confira len(lista) e o índice usado.'}
    else if(tipo==='ValueError'){t='Valor inadequado: '+msg;x='A função recebeu o tipo certo, mas um valor que ela não consegue usar (ex.: int("abc")).';c='Imprima o valor antes da linha para ver o que ele é de fato.'}
    else if(tipo==='FileNotFoundError'){w=/'([^']+)'/.exec(msg);t='Arquivo não encontrado: '+(w?w[1]:'');x='O Python procurou esse arquivo a partir da pasta onde o script está e não achou. Pasta errada, nome diferente ou o arquivo ainda não foi criado.';c='Rode ls para ver o que existe, confira o nome (maiúsculas contam) e crie o arquivo antes de ler.'}
    else if(tipo==='ZeroDivisionError'){t='Divisão por zero';x='Alguma conta dividiu por 0.';c='Teste o divisor antes de dividir (if x != 0).'}
    else if(tipo==='AttributeError'){t='Atributo inexistente: '+msg;x='O objeto não tem esse método ou propriedade (nome errado, ou o valor é de outro tipo, como None).';c='Use print(type(valor)) e dir(valor) para ver o que ele oferece.'}
    else if(tipo==='ModuleNotFoundError'||tipo==='ImportError'){t='Módulo não encontrado: '+msg;x='Este Python do navegador tem a biblioteca padrão (json, os, random, datetime…), mas não bibliotecas extras.';c='Use só módulos da biblioteca padrão, ou veja se o nome do módulo está certo.'}
    else if(/JSONDecodeError/.test(tipo)){t='JSON mal formado: '+msg;x='O texto não é um JSON válido: aspas simples, vírgula sobrando no fim ou chave sem fechar são os culpados mais comuns.';c='JSON só aceita aspas duplas e não aceita vírgula depois do último item.'}
    else if(tipo==='UnicodeDecodeError'||tipo==='UnicodeEncodeError'){t='Problema com acentos';x='O arquivo foi lido ou escrito com uma codificação diferente.';c='Use open(arquivo, encoding="utf-8").'}
    else if(tipo==='EOFError'){t='input() não funciona aqui';x='O navegador não tem teclado de terminal para o Python.';c='Coloque o valor direto no código, numa variável.'}
    else{t=tipo+(msg?': '+msg:'');x='O Python parou neste ponto com a mensagem acima.';c='Leia a última linha do erro, ache a linha do seu arquivo na penúltima e use print() antes dela para ver os valores.'}
    return item('erro',arq,lin,t,x,c);
  }

  /* ---------------------------------------------------------------- painel */
  function painel(el,itens,aoClicar,vazio){
    el.textContent='';
    if(!itens||!itens.length){var p=document.createElement('p');p.className='diag-ok';p.textContent=vazio||'Nada de errado encontrado por aqui.';el.appendChild(p);return}
    itens.slice(0,12).forEach(function(i){
      var d=document.createElement('div');d.className='diag-item '+i.n;
      var h=document.createElement('b');h.textContent=(i.n==='erro'?'Erro':i.n==='aviso'?'Atenção':'Dica')+(i.arq?' · '+i.arq:'')+(i.lin?(window.PA&&PA.I18n&&PA.I18n.en?' · line ':' · linha ')+i.lin:'')+' — '+i.t;
      d.appendChild(h);
      if(i.x){var x=document.createElement('p');x.textContent=i.x;d.appendChild(x)}
      if(i.c){var c=document.createElement('p');c.className='como';c.textContent='Como resolver: '+i.c;d.appendChild(c)}
      if(aoClicar&&i.lin){d.tabIndex=0;d.setAttribute('role','button');d.addEventListener('click',function(){aoClicar(i)});d.addEventListener('keydown',function(e){if(e.key==='Enter')aoClicar(i)})}
      el.appendChild(d);
    });
    if(itens.length>12){var r=document.createElement('p');r.className='diag-ok';r.textContent='… e mais '+(itens.length-12)+'. Resolva os primeiros e olhe de novo.';el.appendChild(r)}
  }

  window.PA=window.PA||{};
  window.PA.Diag={html:html,css:css,jsErro:jsErro,pyErro:pyErro,painel:painel,parecido:parecido,lev:lev};
})();
