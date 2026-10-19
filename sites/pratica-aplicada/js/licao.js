/* Prática aplicada · base das aulas práticas 7 a 10: prepara a pasta do site da prática, a minitela, o terminal, o relógio e o resultado com medalhas. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$,Som=PA.Som,P=PA.Partida;

  PA.Licao=function(cfg){
    var p=P.get();
    var tem=!!(p&&p.etapas&&p.etapas.fluxo&&p.etapas.fluxo.fim);
    $('#sem-partida').hidden=tem;$('#com-partida').hidden=!tem;
    P.hud($('#hud'));
    if(!tem)return null;
    var L={p:p,T:P.TIPOS[p.tipo],LY:P.LAYOUTS[p.layout],ES:P.ESTILOS[p.estilo],C:P.PAL[p.estilo]};
    L.SITE='~/'+L.T.slug;
    P.inicia(cfg.etapa);

    /* resumo no topo */
    var br=$('#brief');br.textContent='';
    cfg.brief(L).forEach(function(x){var d=document.createElement('div'),s=document.createElement('small'),b=document.createElement('b'),sp=document.createElement('span');s.textContent=x[0];b.textContent=x[1];sp.textContent=x[2];d.append(s,b,sp);br.appendChild(d)});

    /* pasta do site: o que as aulas anteriores deixaram (ou o padrão da prática) */
    var inicio=function(S){
      var h=S.acha(['home','voce']);h.f.Downloads=PA.fsDir();
      var site=PA.fsDir();site.f.imagens=PA.fsDir();
      L.T.imgs.concat(L.T.extras).forEach(function(n){site.f.imagens.f[n+'.png']=PA.fsImg(n)});
      site.f['index.html']=PA.fsArq(p.html||P.htmlPadrao(p));
      site.f['estilo.css']=PA.fsArq(p.css||P.cssPadrao(p));
      if(cfg.manterScript&&p.js)site.f['script.js']=PA.fsArq(p.js);
      h.f[L.T.slug]=site;
      if(cfg.inicio)cfg.inicio(S,site,L);
    };
    var opShell={inicio:inicio};if(cfg.cmds)opShell.cmds=cfg.cmds(L);
    L.sh=PA.Shell(opShell);
    L.garante=function(){var n=L.sh.no(L.SITE+'/index.html');if(n&&!/estilo\.css/.test(n.c))n.c+='\n<link rel="stylesheet" href="estilo.css">'};
    L.garante();
    L.idx=function(){return L.sh.le(L.SITE+'/index.html')||''};
    L.arq=function(nome){return L.sh.le(L.SITE+'/'+nome)||''};
    L.compacto=function(nome){return L.arq(nome).replace(/\s+/g,'')};
    L.salva=function(){var q=P.get();q.html=L.idx()||q.html;q.css=L.arq('estilo.css')||q.css;var j=L.arq('script.js');if(j||cfg.manterScript)q.js=j;P.grava(q)};

    L.atualiza=function(){
      var ar=$('#arvore');if(ar)L.sh.desenhaArvore(ar);
      if(!cfg.semPreview&&$('#tela'))L.sh.preview(L.SITE,$('#tela'),cfg.vazio||'A minitela mostra o site quando existir um index.html.',{scripts:!!cfg.scripts,ponte:!!cfg.ponte});
      var c=$('#arqconteudo');
      if(c&&cfg.arquivo){var n=L.sh.no(L.SITE+'/'+cfg.arquivo);c.textContent='';var h=document.createElement('span');h.className='k';
        if(n&&n.c){h.textContent='// '+L.T.slug+'/'+cfg.arquivo+'\n';c.appendChild(h);c.appendChild(document.createTextNode(n.c.replace(/\}\s*/g,'}\n').replace(/\n+$/,'')))}else c.appendChild(document.createTextNode('O código de '+cfg.arquivo+' aparece aqui.'))}
      if(cfg.aoAtualizar)cfg.aoAtualizar(L);
      var pr=$('#pr');if(pr)pr.textContent=L.sh.prompt();
    };

    L.terminal=function(passos,extra){
      var o={term:$('#term'),input:$('#cmd'),chips:$('#chips'),progresso:$('#prog'),enviar:$('#enviar'),passos:passos,shell:L.sh,
        prompt:function(){return L.sh.prompt().replace(' $','')+' $'},atualizaPrompt:function(){L.atualiza();L.salva()},
        aoMostra:function(){P.penalidade(20,'pista')},aoDica:function(){P.penalidade(5,'pista')},aoErro:function(){P.penalidade(5,'erro')},
        reiniciar:function(t){L.sh.reinicia();L.garante();if(cfg.aoReiniciar)cfg.aoReiniciar(L);t.limpa();t.passo=0;t.atualiza();L.atualiza();t.lin('> Pasta reiniciada. O relógio continua correndo.','ok');t.dica()}};
      for(var k in extra)o[k]=extra[k];
      L.term=PA.Terminal(o);return L.term;
    };

    /* resultado da etapa: tempo, medalha de velocidade e uma segunda medalha (qualidade) */
    L.conclui=function(c){
      var R=$('#resultado');if(R.classList.contains('on'))return;
      var e=P.termina(cfg.etapa),pp=P.get(),ms=(e.ms||0)+(e.pen||0)*1000,nv=P.nota(ms,P.par(cfg.etapa,pp));
      var bonus=Math.max(0,c.bonus||0),q2=Math.min(3,(c.base==null?1:c.base)+bonus);
      pp.etapas[cfg.etapa].nota=nv.est;pp.etapas[cfg.etapa].med2=q2;P.grava(pp);L.salva();
      R.classList.add('on');R.classList.toggle('boa',nv.bom);R.classList.toggle('ruim',!nv.bom);
      $('.tempo',R).textContent=P.fmt(ms);$('.nota',R).textContent=nv.rot;
      P.pintaMedalha($('.estr',R),nv.est,'velocidade');P.pintaMedalha($('.estr2',R),q2,cfg.medalha2);
      $('.msg',R).textContent=nv.msg+' Medalha de '+cfg.medalha2+': '+['bronze','prata','ouro','diamante'][q2]+(bonus?' (com '+bonus+' bônus)':'')+'.';
      var pa=$('.parts',R);pa.textContent='';
      [['Esta etapa',P.fmt(ms)],['Pistas',String(e.pistas||0)+' · erros '+(e.erros||0)],['Referência',P.fmt(P.par(cfg.etapa,pp)*1000)]].forEach(function(x){var d=document.createElement('div');d.textContent=x[0];var b=document.createElement('b');b.textContent=x[1];d.appendChild(b);pa.appendChild(d)});
      $('.partida-info',R).textContent=L.T.nome+' · '+L.LY.nome+' · '+L.ES.nome+' · '+cfg.fim;
      var cb=$('#concluir');if(cb)cb.hidden=true;
      Som[nv.bom?'selo':'ruim']();setTimeout(function(){R.scrollIntoView({behavior:'smooth',block:'center'})},350);
      return {ms:ms,nota:nv,q2:q2};
    };
    return L;
  };
})();
