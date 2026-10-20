/* Prática aplicada · base: sons sintetizados, mudo, progresso guardado no navegador, entrada dos blocos e o terminal de treino (falso).
   O Terminal tem dois modos: "passos" (comandos fixos, aula 1) e "shell" (terminal virtual com arquivos, aulas 2 em diante). */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  /* ---------- armazenamento (nunca quebra se o navegador bloquear) ---------- */
  var Arm={
    le:function(k,pad){try{var v=localStorage.getItem('pa:'+k);return v===null?pad:JSON.parse(v)}catch(e){return pad}},
    grava:function(k,v){try{localStorage.setItem('pa:'+k,JSON.stringify(v))}catch(e){}}
  };

  /* ---------- sons (Web Audio, sem arquivos) ---------- */
  var ctx=null,mudo=Arm.le('mudo',false);
  function ac(){if(!ctx){var C=window.AudioContext||window.webkitAudioContext;if(C){try{ctx=new C()}catch(e){}}}if(ctx&&ctx.state==='suspended')ctx.resume();return ctx}
  function tom(f,d,tipo,v,atraso,f2){
    if(mudo)return;var c=ac();if(!c)return;var t=c.currentTime+(atraso||0);
    var o=c.createOscillator(),g=c.createGain();o.type=tipo||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(v||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03);
  }
  var Som={
    tec:function(){tom(1100+Math.random()*350,.035,'square',.025)},
    clique:function(){tom(480,.07,'triangle',.07);tom(760,.09,'triangle',.05,.045)},
    envia:function(){tom(300,.28,'square',.04,0,1300)},
    recebe:function(){tom(990,.1,'triangle',.06);tom(1320,.16,'triangle',.06,.09)},
    acerto:function(){tom(660,.1,'square',.055);tom(880,.1,'square',.055,.09);tom(1175,.2,'square',.055,.18)},
    erro:function(){tom(190,.2,'sawtooth',.05);tom(150,.22,'sawtooth',.05,.12)},
    carta:function(){tom(520,.08,'triangle',.06);tom(780,.08,'triangle',.06,.07);tom(1040,.14,'triangle',.06,.14)},
    selo:function(){[523,659,784,1047,784,1047,1319].forEach(function(f,i){tom(f,.16,'square',.05,i*.11)})},
    ponto:function(){tom(880,.06,'square',.04);tom(1320,.08,'square',.04,.05)},
    relogio:function(){tom(1500,.03,'square',.03)},
    ruim:function(){[392,330,262].forEach(function(f,i){tom(f,.22,'triangle',.06,i*.18)})}
  };
  window.PA=Object.assign(window.PA||{},{Som:Som,Arm:Arm,$:$,$$:$$,mudo:function(){return mudo}});

  var bm=$('#mudo');
  if(bm){
    var pinta=function(){bm.setAttribute('aria-pressed',String(mudo));bm.setAttribute('aria-label',mudo?'Ligar os sons':'Desligar os sons');var t=$('span',bm);if(t)t.textContent=mudo?'Sem som':'Som'};
    pinta();
    bm.addEventListener('click',function(){mudo=!mudo;Arm.grava('mudo',mudo);pinta();if(!mudo)Som.clique()});
  }
  document.addEventListener('pointerdown',function(e){var a=e.target.closest&&e.target.closest('.btn,.chips button,a.est,.topo nav a,.entrada button,.fluxo button,.escolha button,.cola-os button');if(a&&a.id!=='mudo'&&a.id!=='tema'&&!a.disabled)Som.clique()});

  /* ---------- entrada dos blocos ---------- */
  if(window.matchMedia&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
    var alvos=$$('.rv');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);e.target.classList.add('in')}})},{threshold:.1});
    alvos.forEach(function(el,i){if(!el.style.getPropertyValue('--d'))el.style.setProperty('--d',Math.min(i%4,3)*70+'ms');io.observe(el)});
  }else{$$('.rv').forEach(function(el){el.classList.add('in')})}

  /* ---------- terminal de treino ---------- */
  function Terminal(o){
    var t={},hist=[],hi=0;
    t.passo=0;t.ocupado=false;t.o=o;
    t.lin=function(txt,cl){var p=document.createElement('p');if(cl)p.className=cl;if(!cl||cl==='u'||/^\[console/.test(txt))p.setAttribute('data-i18n','skip');p.textContent=(!p.hasAttribute('data-i18n')&&window.PA&&PA.I18n?PA.I18n.t(txt):txt);o.term.appendChild(p);if(window.PA.Termos&&cl&&cl!=='u')window.PA.Termos.marca(p);o.term.scrollTop=o.term.scrollHeight;return p};
    t.espera=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
    t.digita=function(texto){return new Promise(function(res){var i=0;o.input.value='';(function f(){if(i<texto.length){o.input.value+=texto[i++];Som.tec();setTimeout(f,34+Math.random()*28)}else res()})()})};
    var cmdDe=function(p){return p?(typeof p.cmd==='function'?p.cmd():p.cmd):''};
    var dicaDe=function(p){return p?(typeof p.dica==='function'?p.dica():p.dica):''};
    t.dica=function(){var p=o.passos[t.passo];if(p)t.lin('> '+dicaDe(p),'d');else t.lin('> Etapa concluída.','ok')};
    t.atualiza=function(){
      $$('i',o.progresso).forEach(function(x,i){x.className=i<t.passo?'on':'';x.style.display=i>=o.passos.length?'none':''});
      var s=$('small',o.progresso);if(s)s.textContent=Math.min(t.passo,o.passos.length)+' de '+o.passos.length;
      var p=o.passos[t.passo];if(o.chips){var c=$('[data-acao=cmd]',o.chips);if(c){c.textContent=p?cmdDe(p):'Etapa concluída';c.disabled=!p}}
    };
    t.avanca=function(msg){t.passo++;t.atualiza();Som.acerto();t.lin('> Passo concluído!'+(msg?' '+msg:''),'ok');return t.espera(380).then(function(){t.dica();if(t.passo>=o.passos.length&&o.fim)o.fim(t)})};
    t.limpa=function(){o.term.textContent=''};
    function mostra(){var p=o.passos[t.passo];if(!p)return;if(o.aoMostra)o.aoMostra(t);t.ocupado=true;t.digita(cmdDe(p)).then(function(){t.ocupado=false;t.envia(cmdDe(p))})}
    t.envia=function(txt){
      txt=(txt==null?o.input.value:txt).trim();
      if(t.ocupado)return;
      if(!txt){t.lin('> Digite o comando do passo (ou toque em "Digitar por mim").','d');Som.erro();return}
      o.input.value='';hist.push(txt);hi=hist.length;
      t.lin((o.prompt?o.prompt():'$')+' '+txt,'u');
      var n=txt.toLowerCase();
      if(n==='dica'||n==='hint'||n==='ajuda'||n==='help'){if(o.aoDica)o.aoDica(t);t.lin('> Comandos do treino: dica · mostra (eu digito para você) · limpar'+(o.shell?' · reiniciar':''),'m');t.dica();return}
      if(n==='mostra'||n==='show'){mostra();return}
      if((n==='reiniciar'||n==='restart')&&o.reiniciar){o.reiniciar(t);return}
      if(n==='limpar'||n==='clear'||n==='cls'){t.limpa();if(!o.shell){t.dica();return}}
      if(o.shell){
        var r=o.shell.exec(txt);
        if(r.limpar)t.limpa();
        r.linhas.forEach(function(l){t.lin(l[0],l[1])});
        if(r.erro&&o.aoErro)o.aoErro(t);
        if(r.erro)Som.erro();
        if(o.atualizaPrompt)o.atualizaPrompt();
        var ass=r.assinc?r.assinc(t):null;
        if(ass){
          t.ocupado=true;
          Promise.resolve(ass).catch(function(){t.lin('> Algo deu errado ao rodar o comando.','er')}).then(function(){t.ocupado=false;if(o.atualizaPrompt)o.atualizaPrompt();return o.depois?o.depois(txt,r,t):null}).then(function(){if(o.chips&&matchMedia('(pointer:fine)').matches)o.input.focus()});
          return;
        }
        var depois=o.depois?o.depois(txt,r,t):null;
        Promise.resolve(depois).then(function(){if(o.chips&&matchMedia('(pointer:fine)').matches)o.input.focus()});
        return;
      }
      var p=o.passos[t.passo],m=p&&txt.match(p.aceita);
      t.ocupado=true;
      var r2=o.extra?o.extra(txt,t,!!m):null;
      Promise.resolve(r2).then(function(tratado){
        if(m){return Promise.resolve(p.roda(m,t)).then(function(){return t.avanca()})}
        if(!tratado){if(o.aoErro)o.aoErro(t);Som.erro();t.lin('> Esse comando não é o do passo. Digite "dica" para rever, ou "mostra" para eu digitar.','er')}
      }).then(function(){t.ocupado=false;if(o.chips&&matchMedia('(pointer:fine)').matches)o.input.focus()},function(){t.ocupado=false;t.lin('> Algo deu errado. Tente de novo.','er')});
    };
    o.input.addEventListener('keydown',function(e){
      if(e.key==='Enter'){e.preventDefault();t.envia()}
      else if(e.key==='ArrowUp'){if(hi>0){hi--;o.input.value=hist[hi]}e.preventDefault()}
      else if(e.key==='ArrowDown'){if(hi<hist.length-1){hi++;o.input.value=hist[hi]}else{hi=hist.length;o.input.value=''}e.preventDefault()}
      else if(e.key.length===1)Som.tec();
    });
    if(o.chips)o.chips.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b||t.ocupado)return;var a=b.dataset.acao;
      if(a==='cmd')mostra();
      else if(a==='dica'){if(o.aoDica)o.aoDica(t);t.dica()}
      else if(a==='limpar'){t.limpa();t.dica()}
      else if(a==='reiniciar'&&o.reiniciar){o.reiniciar(t)}
    });
    if(o.enviar)o.enviar.addEventListener('click',function(){t.envia()});
    return t;
  }
  window.PA.Terminal=Terminal;
})();
