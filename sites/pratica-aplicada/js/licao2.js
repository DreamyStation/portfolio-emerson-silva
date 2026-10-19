/* Prática aplicada · base das aulas do nível 2. Aqui o código é de verdade: o aluno escreve no editor ou pelo terminal, o navegador (HTML, CSS, JavaScript) e o Python real executam,
   e as conferências olham o resultado, não o texto exato do comando. Os objetivos podem ser cumpridos em qualquer ordem e de jeitos diferentes. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$,Som=PA.Som,P=PA.Partida,D=PA.Diag;
  function semente(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  var el=function(tag,cl,txt){var e=document.createElement(tag);if(cl)e.className=cl;if(txt!=null)e.textContent=txt;return e};

  PA.Licao2=function(cfg){
    var p=P.get()||P.nova({});
    if(!p.fluxo||!p.fluxo.length){p.fluxo=P.TIPOS[p.tipo].paginas.slice(0,3).map(function(x){return x.id})}
    if(!p.html)p.html=P.htmlPadrao(p);
    if(!p.css)p.css=P.cssPadrao(p);
    P.grava(p);
    var L={p:p,T:P.TIPOS[p.tipo],LY:P.LAYOUTS[p.layout],ES:P.ESTILOS[p.estilo],C:P.PAL[p.estilo],cfg:cfg,logs:[],errosJS:[],saida:'',erroPy:'',rodou:{},feitos:{},pagina:'index.html',hist:(PA.Arm.le('n2h:'+cfg.etapa,[])||[])};
    L.SITE='~/'+L.T.slug;
    L.guardaHist=function(){try{PA.Arm.grava('n2h:'+cfg.etapa,L.hist.slice(-10).map(function(h){return {t:h.t,arq:h.arq,ok:h.ok,texto:String(h.texto||'').slice(0,3000),erro:String(h.erro||'').slice(0,800),codigo:String(h.codigo||'').slice(0,6000),mudou:h.mudou||[],css:String(h.css||'').slice(0,6000),pag:String(h.pag||'').slice(0,3000),quando:h.quando}}))}catch(e){}};
    var rnd=rng(semente(String(p.criada)+cfg.etapa));
    L.rnd=rnd;L.sorteia=function(l){return l[Math.floor(rnd()*l.length)]};
    P.inicia(cfg.etapa);
    P.hud($('#hud'));

    /* resumo no topo */
    var br=$('#brief');br.textContent='';
    cfg.brief(L).forEach(function(x){var d=el('div'),s=el('small',null,x[0]),b=el('b',null,x[1]),sp=el('span',null,x[2]);d.append(s,b,sp);br.appendChild(d)});

    /* ---------- pasta de treino ---------- */
    var CHAVE='n2:'+cfg.etapa;
    var inicio=function(S){
      var h=S.acha(['home','voce']);h.f.Downloads=PA.fsDir();
      var site=PA.fsDir();site.f.imagens=PA.fsDir();
      L.T.imgs.concat(L.T.extras).forEach(function(n){site.f.imagens.f[n+'.png']=PA.fsImg(n)});
      site.f['index.html']=PA.fsArq(p.html);site.f['estilo.css']=PA.fsArq(p.css);
      if(p.js)site.f['script.js']=PA.fsArq(p.js);
      h.f[L.T.slug]=site;
      S.cwd=['home','voce',L.T.slug];
      if(cfg.inicio)cfg.inicio(S,site,L);
      var sv=PA.Arm.le(CHAVE,null);
      if(sv)Object.keys(sv).forEach(function(k){site.f[k]=PA.fsArq(sv[k])});
      if(sv&&sv.__apagados)sv.__apagados.forEach(function(k){delete site.f[k]});
    };
    var opShell={inicio:inicio};
    opShell.cmds=comandos(L);
    L.sh=PA.Shell(opShell);
    L.pasta=function(){return L.sh.no(L.SITE)};
    L.arq=function(nome){var n=L.sh.no(L.SITE+'/'+nome);return n&&n.t==='a'?n.c:null};
    L.existe=function(nome){return !!L.sh.no(L.SITE+'/'+nome)};
    L.arquivos=function(ext){var n=L.pasta();if(!n)return [];return Object.keys(n.f).filter(function(k){return n.f[k].t==='a'&&(!ext||new RegExp('\\.'+ext+'$','i').test(k))})};
    L.compacto=function(nome){return (L.arq(nome)||'').replace(/\s+/g,'')};
    L.insp=function(codigo){return L.sh.inspeciona($('#tela'),codigo)};
    L.persiste=function(){
      var n=L.pasta();if(!n)return;var o={},base={'index.html':1,'estilo.css':1};
      Object.keys(n.f).forEach(function(k){if(n.f[k].t==='a')o[k]=n.f[k].c});
      var apagados=[];['index.html','estilo.css','script.js'].forEach(function(k){if(!n.f[k]&&(k!=='script.js'||p.js))apagados.push(k)});
      o.__apagados=apagados;PA.Arm.grava(CHAVE,o);
    };

    /* ---------- editor real ---------- */
    L.ed=PA.Editor({el:$('#editor'),shell:L.sh,pasta:L.SITE,padrao:cfg.padrao||'index.html',ordem:cfg.arquivos||['index.html','estilo.css','script.js'],aoMudar:function(){L.mudou()}});

    /* ---------- minitela de verdade ---------- */
    var seletor=$('#pagina');
    L.desenha=function(){
      var f=$('#tela');if(!f)return;
      L.logs=[];L.errosJS=[];
      var htmls=L.arquivos('html');
      if(htmls.indexOf(L.pagina)<0)L.pagina=htmls.indexOf('index.html')>=0?'index.html':(htmls[0]||'index.html');
      if(seletor){var antes=seletor.value,k=htmls.join('|');if(seletor.dataset.k!==k){seletor.textContent='';htmls.forEach(function(n){var o=el('option',null,n);o.value=n;seletor.appendChild(o)});seletor.dataset.k=k}seletor.value=L.pagina;seletor.hidden=htmls.length<2}
      L.sh.preview(L.SITE,f,cfg.vazio||'A minitela mostra o site quando existir um index.html.',{scripts:true,ponte:true,arquivo:L.pagina});
      if(L.sh.laco)L.errosJS.push({n:'erro',arq:L.arquivos('js')[0]||'script.js',lin:0,t:'Laço infinito bloqueado',x:'O código tem while(true) ou for(;;) sem break. Rodar isso travaria a minitela (e a página), então ele não foi executado.',c:'Todo laço precisa de uma condição que um dia fique falsa, ou de um break. Para repetir de tempos em tempos, use setInterval em vez de while.'});
    };
    if(seletor)seletor.addEventListener('change',function(){L.pagina=seletor.value;L.desenha();L.avalia()});

    /* ---------- diagnóstico ao vivo ---------- */
    L.itens=function(){
      var it=[],ex=function(c){return L.existe(c)};
      L.arquivos('html').forEach(function(n){it=it.concat(D.html(L.arq(n),{arq:n,existe:ex}))});
      L.arquivos('css').forEach(function(n){it=it.concat(D.css(L.arq(n),{arq:n}))});
      L.errosJS.forEach(function(e){it.push(e)});
      if(L.itemPy)it.push(L.itemPy);
      if(L.itemNode)it.push(L.itemNode);
      return it;
    };
    L.diagnostica=function(){
      var d=$('#diag');if(!d)return [];
      var it=L.itens();D.painel(d,it,function(i){L.ed.vaiPara(i.arq,i.lin)},'Nenhum problema encontrado. Quando algo der errado, a explicação aparece aqui.');
      var er=it.filter(function(i){return i.n==='erro'}).length,av=it.length-er,r=$('#diag-resumo');
      if(r){r.textContent=it.length?(er?er+(er===1?' erro':' erros'):'')+(er&&av?' · ':'')+(av?av+(av===1?' atenção':' atenções'):''):'tudo certo';r.className='diag-resumo '+(er?'erro':av?'aviso':'ok')}
      L.ed.marca(it);return it;
    };

    /* ---------- objetivos ---------- */
    var objs=cfg.objetivos(L),ul=$('#objetivos'),nivel={},gen=0;
    L.objs=objs;
    objs.forEach(function(o,i){
      var li=el('li'),mk=el('span','mk'),txt=el('span','tx'),bt=el('button','dica-btn','Dica'),box=el('div','dica-box');
      bt.type='button';box.hidden=true;txt.textContent=o.txt;if(o.bonus){var b=el('em','bn','bônus');txt.appendChild(document.createTextNode(' '));txt.appendChild(b)}
      li.append(mk,txt,bt,box);ul.appendChild(li);o.li=li;nivel[i]=0;
      bt.addEventListener('click',function(){
        var ds=o.dicas||[];if(!ds.length)return;
        if(nivel[i]<ds.length){P.penalidade(nivel[i]===0?5:10,'pista');nivel[i]++}
        box.hidden=false;box.textContent='';
        ds.slice(0,nivel[i]).forEach(function(d,k){var q=el('p',null,(k+1)+'. '+d);box.appendChild(q);if(PA.Termos)PA.Termos.marca(q)});
        bt.textContent=nivel[i]<ds.length?'Mais uma dica':'Sem mais dicas';Som.clique();
      });
    });
    var pend=null,rodando=false,denovo=false;
    L.avalia=function(){clearTimeout(pend);pend=setTimeout(avaliaJa,380)};
    function avaliaJa(){
      if(rodando){denovo=true;return}
      rodando=true;var meu=++gen,res=[];
      var seq=Promise.resolve();
      objs.forEach(function(o,i){seq=seq.then(function(){return Promise.resolve().then(function(){return o.ok(L)}).then(function(v){res[i]=!!v},function(){res[i]=false})})});
      seq.then(function(){
        rodando=false;if(meu!==gen&&denovo){denovo=false;return avaliaJa()}
        var req=0,reqFeitos=0,bonus=0;
        objs.forEach(function(o,i){
          var f=!!res[i];o.li.classList.toggle('feito',f);
          if(f&&!L.feitos[i]){L.feitos[i]=true;if(L.term){L.term.lin('> Objetivo cumprido: '+o.txt,'ok');Som.acerto()}if(PA.Fx&&!PA.Fx.reduz)PA.Fx.glitch(o.li,'gl-in',560)}
          if(!f&&L.feitos[i])L.feitos[i]=false;
          if(o.bonus){if(f)bonus++}else{req++;if(f)reqFeitos++}
        });
        L.nReq=req;L.nFeitos=reqFeitos;L.nBonus=bonus;
        if(L.term){L.term.passo=reqFeitos;L.term.atualiza()}
        var cb=$('#concluir');if(cb)cb.hidden=!(reqFeitos===req&&!$('#resultado').classList.contains('on'));
        if(cfg.aoAvaliar)cfg.aoAvaliar(L,res);
        if(denovo){denovo=false;avaliaJa()}
      });
    }

    /* ---------- atualização geral ---------- */
    L.mudou=function(){L.persiste();L.atualiza(true)};
    var rp=null;
    L.atualiza=function(doEditor){
      L.sh.desenhaArvore($('#arvore'));
      clearTimeout(rp);rp=setTimeout(function(){L.desenha()},doEditor?120:0);
      if(!doEditor)L.ed.atualiza();
      L.diagnostica();
      var pr=$('#pr');if(pr)pr.textContent=L.sh.prompt();
      if(cfg.aoAtualizar)cfg.aoAtualizar(L);
      L.avalia();
    };

    /* ---------- ponte com a minitela: console e erros de verdade ---------- */
    L.sh.ligaPonte($('#tela'),{
      log:function(t,d){L.logs.push(t);if(L.term)L.term.lin('[console'+(d&&d.nv==='e'?' erro':d&&d.nv==='w'?' aviso':'')+'] '+t,d&&d.nv==='e'?'er':'ok');L.avalia()},
      erro:function(t,d){
        var lin=d&&d.lin?Math.max(1,d.lin-(L.sh.jsOffset||0)):0;
        var arqJs=L.arquivos('js')[0]||'script.js';
        var it=D.jsErro(t,lin,arqJs);L.errosJS.push(it);
        if(L.term){L.term.lin('[erro] '+t+(lin?' (linha '+lin+' de '+arqJs+')':''),'er')}
        L.diagnostica();L.avalia();
      }
    });

    /* ---------- terminal livre ---------- */
    var passos=objs.map(function(o){return {dica:function(){return L.dicaAtual()},cmd:function(){return L.cmdAtual()}}});
    L.dicaAtual=function(){for(var i=0;i<objs.length;i++){if(!objs[i].bonus&&!L.feitos[i])return 'Próximo objetivo: '+objs[i].txt+' (use o botão Dica no objetivo se precisar)'}return 'Todos os objetivos obrigatórios estão cumpridos. Conclua a etapa ou tente os bônus.'};
    L.cmdAtual=function(){for(var i=0;i<objs.length;i++){if(!objs[i].bonus&&!L.feitos[i]){var ex=objs[i].exemplo;return (typeof ex==='function'?ex(L):ex)||'ls'}}return 'ls'};
    var o={term:$('#term'),input:$('#cmd'),chips:$('#chips'),progresso:$('#prog'),enviar:$('#enviar'),passos:passos,shell:L.sh,
      prompt:function(){return L.sh.prompt().replace(' $','')+' $'},
      atualizaPrompt:function(){L.atualiza(false);L.persiste()},
      aoMostra:function(){P.penalidade(20,'pista')},aoDica:function(){P.penalidade(5,'pista')},
      reiniciar:function(t){PA.Arm.grava(CHAVE,null);L.hist=[];PA.Arm.grava('n2h:'+cfg.etapa,[]);L.sh.reinicia();t.limpa();L.feitos={};L.logs=[];L.errosJS=[];L.itemPy=null;L.itemNode=null;L.atualiza(false);L.ed.atualiza();t.lin('> Pasta reiniciada. O relógio continua correndo.','ok');t.dica()}};
    L.term=PA.Terminal(o);
    L.term.passo=0;L.term.atualiza();

    /* ---------- resultado ---------- */
    L.conclui=function(){
      var R=$('#resultado');if(R.classList.contains('on'))return;
      var e=P.termina(cfg.etapa),pp=P.get(),ms=(e.ms||0)+(e.pen||0)*1000,nv=P.nota(ms,cfg.par||P.par(cfg.etapa,pp));
      var q2=Math.min(3,(cfg.base==null?1:cfg.base)+(L.nBonus||0));
      pp.etapas[cfg.etapa].nota=nv.est;pp.etapas[cfg.etapa].med2=q2;P.grava(pp);
      R.classList.add('on');R.classList.toggle('boa',nv.bom);R.classList.toggle('ruim',!nv.bom);
      $('.tempo',R).textContent=P.fmt(ms);$('.nota',R).textContent=nv.rot;
      P.pintaMedalha($('.estr',R),nv.est,'velocidade');P.pintaMedalha($('.estr2',R),q2,cfg.medalha2);
      $('.msg',R).textContent=nv.msg+' Medalha de '+cfg.medalha2+': '+['bronze','prata','ouro','diamante'][q2]+(L.nBonus?' (com '+L.nBonus+' bônus)':'')+'.';
      var pa=$('.parts',R);pa.textContent='';
      [['Esta etapa',P.fmt(ms)],['Pistas',String(e.pistas||0)],['Referência',P.fmt((cfg.par||P.par(cfg.etapa,pp))*1000)]].forEach(function(x){var d=el('div',null,x[0]);d.appendChild(el('b',null,x[1]));pa.appendChild(d)});
      $('.partida-info',R).textContent=L.T.nome+' · '+cfg.fim;
      var cb=$('#concluir');if(cb)cb.hidden=true;
      Som[nv.bom?'selo':'ruim']();setTimeout(function(){R.scrollIntoView({behavior:'smooth',block:'center'})},350);
      if(cfg.aoConcluir)cfg.aoConcluir(L,{ms:ms,nota:nv,q2:q2});
    };
    var cb=$('#concluir');
    if(cb)cb.addEventListener('click',function(){
      avaliaTudo().then(function(ok){
        if(ok)L.conclui();
        else{L.term.lin('> Ainda há objetivos obrigatórios sem cumprir. Veja a lista ao lado do terminal.','er');Som.erro()}
      });
    });
    function avaliaTudo(){var r=[];var seq=Promise.resolve();objs.forEach(function(ob,i){seq=seq.then(function(){return Promise.resolve().then(function(){return ob.ok(L)}).then(function(v){r[i]=!!v},function(){r[i]=false})})});return seq.then(function(){return objs.every(function(ob,i){return ob.bonus||r[i]})})}

    /* começa */
    L.term.lin('> Guia: aqui o código é de verdade. Escreva no editor ou pelo terminal; erros fazem parte, e o painel "Quando algo dá errado" explica cada um.','ok');
    L.term.lin('> Os objetivos podem ser cumpridos em qualquer ordem. Comandos: ls, cat, code arquivo, python arquivo.py, node arquivo.js, dica.','m');
    L.term.dica();
    PA.licaoAtual=L;
    L.ed.pronto.then(function(){L.atualiza(false)});
    L.atualiza(false);
    return L;
  };

  /* ---------- comandos extras do terminal: python, node, code ---------- */
  function comandos(L){
    function linhas(t,saida){
      saida.forEach(function(l){String(l[1]).split('\n').forEach(function(x){t.lin(x,l[0]==='e'?'er':'')})});
    }
    function roda(tk,r,S,nome,tipo){
      var args=tk.slice(1).map(function(x){return x.v});
      if(args[0]==='-V'||args[0]==='--version'||args[0]==='-v'){r.linhas.push([tipo==='py'?'Python 3.12 (executando de verdade no navegador, pelo Pyodide)':'v20 (JavaScript de verdade no navegador)','']);return}
      if(!args.length){r.erro=true;r.linhas.push(['> Use: '+nome+' arquivo'+(tipo==='py'?'.py':'.js')+'. No navegador não existe o modo interativo.','er']);return}
      var codigoDireto=null,arq=args[0];
      if(args[0]==='-c'||args[0]==='-e'){codigoDireto=args[1]||'';arq=null}
      var no=arq?S.no(arq):null;
      if(arq&&(!no||no.t!=='a')){
        r.erro=true;
        r.linhas.push([tipo==='py'?'python: can\'t open file \''+S.exibe(S.partes(arq)).replace('~','/home/voce')+'\': [Errno 2] No such file or directory':'Error: Cannot find module \''+arq+'\'','er']);
        r.linhas.push(['> Dica: o arquivo não está nesta pasta. Rode ls para ver o que existe e confira o nome (maiúsculas contam).','d']);
        return;
      }
      r.assinc=function(t){
        var codigo=codigoDireto!=null?codigoDireto:no.c;
        if(tipo==='py'){
          var tmp=null,caminho;
          if(codigoDireto!=null){tmp='_c.py';S.cria(S.cwd.concat(tmp),PA.fsArq(codigoDireto));caminho='/'+S.cwd.concat(tmp).join('/')}
          else caminho='/'+S.partes(arq).join('/');
          return PA.Python.roda(S,caminho,function(m){t.lin(m,'m')}).then(function(res){
            if(tmp){var pai=S.acha(S.cwd);if(pai&&pai.f)delete pai.f[tmp]}
            linhas(t,res.saida);
            L.saida=res.texto;L.erroPy=res.erroTexto;L.rodou[arq||'-c']={ok:!res.erro,texto:res.texto,quando:Date.now()};L.ultPy={arq:arq,ok:!res.erro,texto:res.texto};
            L.hist.push({t:'py',arq:arq||'-c',ok:!res.erro,texto:res.texto,erro:res.erroTexto,codigo:codigo,mudou:(res.mudou||[]).map(function(c){return c.split('/').pop()}),css:L.arq('estilo.css'),pag:L.arq('index.html'),quando:Date.now()});L.guardaHist();
            var novoHtml=(res.mudou||[]).map(function(c){return c.split('/').pop()}).filter(function(n){return /\.html$/i.test(n)});if(novoHtml.length)L.pagina=novoHtml.indexOf('index.html')>=0?'index.html':novoHtml[0];
            if(res.erro&&!res.tempo&&!res.falhaCarga){var it=D.pyErro(res.erroTexto);L.itemPy=it;t.lin('> '+it.t+'. '+it.x,'d');t.lin('> '+it.c,'d');PA.Som.erro()}
            else if(!res.erro){L.itemPy=null}
            if(res.tempo){L.itemPy={n:'erro',arq:arq||'',lin:0,t:'Programa interrompido por demorar demais',x:'Ele rodou mais de 10 segundos sem terminar, provavelmente um laço infinito.',c:'Todo while precisa de uma condição que um dia fique falsa; confira o contador.'}}
            if(res.mudou&&res.mudou.length){t.lin('> O programa criou ou alterou: '+res.mudou.map(function(c){return c.split('/').pop()}).join(', '),'m')}
          });
        }
        return PA.Node.roda(codigo).then(function(res){
          linhas(t,res.saida);
          L.saida=res.texto;L.rodou[arq||'-e']={ok:!res.erro,texto:res.texto,quando:Date.now()};L.ultNode={arq:arq,ok:!res.erro,texto:res.texto};
          L.hist.push({t:'js',arq:arq||'-e',ok:!res.erro,texto:res.texto,erro:res.erro?res.erro.msg:'',codigo:codigo,mudou:[],quando:Date.now()});L.guardaHist();
          if(res.erro){var it=D.jsErro(res.erro.msg,res.erro.lin,arq||'');L.itemNode=it;t.lin((/^Uncaught/.test(res.erro.msg)?'':'Uncaught ')+res.erro.msg+(res.erro.lin?' (linha '+res.erro.lin+')':''),'er');t.lin('> '+it.t+'. '+it.x,'d');t.lin('> '+it.c,'d');PA.Som.erro()}
          else L.itemNode=null;
          if(res.tempo)t.lin('> O programa foi interrompido por demorar mais de 5 segundos (laço infinito?).','er');
        });
      };
    }
    return {
      python:function(tk,r,S){roda(tk,r,S,'python','py')},python3:function(tk,r,S){roda(tk,r,S,'python3','py')},py:function(tk,r,S){roda(tk,r,S,'py','py')},
      node:function(tk,r,S){roda(tk,r,S,'node','js')},
      pip:function(tk,r){r.linhas.push(['> Este Python do navegador já traz a biblioteca padrão (json, os, random, datetime, re, math…). Instalar pacotes extras não é possível aqui.','m'])},
      code:function(tk,r,S){
        var a=tk[1]&&tk[1].v;
        if(!a||a==='.'){r.linhas.push(['> O editor já está aberto ao lado. Use code arquivo para abrir um arquivo nele.','ok']);return}
        var n=S.no(a);
        if(!n){S.cria(S.partes(a),PA.fsArq(''));r.linhas.push(['> Arquivo novo criado e aberto no editor: '+a,'ok'])}
        else if(n.t==='a')r.linhas.push(['> Aberto no editor: '+a,'ok']);
        else{r.erro=true;r.linhas.push(['code: "'+a+'" não é um arquivo de texto.','er']);return}
        setTimeout(function(){L.ed.atualiza();L.ed.abre(S.partes(a).pop())},0);
      }
    };
  }
})();

/* ---------- utilitários de conferência do nível 2 ---------- */
(function(){
  'use strict';
  var PA=window.PA,N2={};
  N2.nomes=function(L){return L.T.itens.map(function(s){return s.split(' · ')[0]})};
  /* alguma execução de Python deu certo e atende à condição? */
  N2.py=function(L,cond){return L.hist.some(function(h){return h.t==='py'&&h.ok&&(!cond||cond(h))})};
  N2.js=function(L,cond){return L.hist.some(function(h){return h.t==='js'&&h.ok&&(!cond||cond(h))})};
  N2.inclui=function(texto,lista){texto=String(texto||'').toLowerCase();return lista.every(function(n){return texto.indexOf(String(n).toLowerCase())>=0})};
  /* declarações de um bloco, pelo texto serializado: mantém atalhos (background, animation) e var() */
  N2.decls=function(st){
    var d={},t=String(st.cssText||''),cur='',pr=0,q=null,partes=[];
    for(var i=0;i<t.length;i++){var ch=t[i];
      if(q){cur+=ch;if(ch===q)q=null;continue}
      if(ch==='"'||ch==="'"){q=ch;cur+=ch;continue}
      if(ch==='(')pr++;if(ch===')')pr--;
      if(ch===';'&&pr<=0){partes.push(cur);cur='';continue}
      cur+=ch;
    }
    if(cur.trim())partes.push(cur);
    partes.forEach(function(x){var k=x.indexOf(':');if(k>0)d[x.slice(0,k).trim().toLowerCase()]=x.slice(k+1).trim()});
    return d;
  };
  /* CSS: usa o próprio navegador para ler as regras */
  N2.css=function(texto){
    var r={regras:[],keyframes:[],medias:[],vars:{},ok:true};
    try{
      var sh=new CSSStyleSheet();sh.replaceSync(String(texto||''));
      (function anda(lista,media){
        for(var i=0;i<lista.length;i++){
          var x=lista[i];
          if(x.type===1){var d=N2.decls(x.style);
            r.regras.push({sel:x.selectorText,decl:d,media:media});
            if(/(^|,)\s*(:root|html)\s*(,|$)/.test(x.selectorText)&&!media)Object.keys(d).forEach(function(pn){if(pn.indexOf('--')===0)r.vars[pn]=d[pn]})}
          else if(x.type===7)r.keyframes.push({nome:x.name,passos:x.cssRules.length});
          else if(x.type===4){r.medias.push(x.conditionText||x.media.mediaText);anda(x.cssRules,x.conditionText||x.media.mediaText)}
        }
      })(sh.cssRules,null);
    }catch(e){r.ok=false}
    return r;
  };
  N2.resolve=function(v,vars,n){n=n||0;if(n>4)return v;return String(v||'').replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g,function(m,nome,fb){return vars[nome]!=null?N2.resolve(vars[nome],vars,n+1):(fb||'')})};
  var NOMES={black:'#000000',white:'#ffffff',lime:'#00ff00',green:'#008000',red:'#ff0000',blue:'#0000ff',cyan:'#00ffff',aqua:'#00ffff',magenta:'#ff00ff',fuchsia:'#ff00ff',orange:'#ffa500',yellow:'#ffff00',gold:'#ffd700',amber:'#ffbf00',teal:'#008080',purple:'#800080',pink:'#ffc0cb'};
  /* primeira cor encontrada no texto → {h,s,l} (h 0-360, s e l 0-100) */
  N2.cor=function(txt){
    txt=String(txt||'').toLowerCase();var m,r,g,b;
    if((m=/#([0-9a-f]{3,8})\b/.exec(txt))){var h=m[1];if(h.length===3||h.length===4){r=parseInt(h[0]+h[0],16);g=parseInt(h[1]+h[1],16);b=parseInt(h[2]+h[2],16)}else if(h.length===6||h.length===8){r=parseInt(h.slice(0,2),16);g=parseInt(h.slice(2,4),16);b=parseInt(h.slice(4,6),16)}else return null}
    else if((m=/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(txt))){r=+m[1];g=+m[2];b=+m[3]}
    else if((m=/hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/.exec(txt))){return {h:+m[1]%360,s:+m[2],l:+m[3]}}
    else{var nm=/\b(black|white|lime|green|red|blue|cyan|aqua|magenta|fuchsia|orange|yellow|gold|amber|teal|purple|pink)\b/.exec(txt);if(!nm)return null;return N2.cor(NOMES[nm[1]])}
    r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0,hh=0;
    if(mx!==mn){var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;hh*=60}
    return {h:hh,s:s*100,l:l*100};
  };
  N2.noMatiz=function(c,alvo){return !!c&&c.s>=35&&c.l>=35&&c.l<=85&&c.h>=alvo.hmin&&c.h<=alvo.hmax};
  /* valor final de uma propriedade em um seletor, resolvendo var() */
  N2.valor=function(css,seletorRe,prop){
    var out=[];css.regras.forEach(function(r){if(!r.media&&seletorRe.test(r.sel)&&r.decl[prop]!=null)out.push(N2.resolve(r.decl[prop],css.vars))});return out;
  };
  N2.todas=function(css,prop){var out=[];css.regras.forEach(function(r){if(r.decl[prop]!=null)out.push(N2.resolve(r.decl[prop],css.vars))});return out};
  /* há um <canvas> desenhando e o desenho muda com o tempo? (olha os pixels; tenta de novo enquanto a página carrega) */
  var QUADRO="(function(){var c=document.querySelector('canvas');if(!c||!c.width||!c.height)return null;try{var g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data,n=0,h=0;for(var i=0;i<d.length;i+=4){if(d[i+3]>0){n++;h=(h*31+d[i]+d[i+1]*3+d[i+2]*7+(i>>4))|0}}return {n:n,h:h}}catch(e){return null}})()";
  var MS=function(n){return new Promise(function(r){setTimeout(r,n)})};
  N2.animando=function(L,codigo){
    var rep=/(setInterval|requestAnimationFrame|setTimeout)/.test(codigo||''),des=/(fillText|fillRect|drawImage|strokeText|lineTo|\.arc\()/.test(codigo||'');
    function tenta(k){
      return L.insp(QUADRO).then(function(a){
        if(!a||a.__erro)return false;
        if(!a.n){if(k>=4)return false;return MS(450).then(function(){return tenta(k+1)})}
        var h0=a.h;
        return MS(500).then(function(){return L.insp(QUADRO)}).then(function(b){
          if(b&&!b.__erro&&b.h!==h0)return true;
          return MS(700).then(function(){return L.insp(QUADRO)}).then(function(c){return (!!c&&!c.__erro&&c.h!==h0)||(rep&&des)});
        });
      });
    }
    return tenta(0);
  };
  window.PA.N2=N2;
})();
