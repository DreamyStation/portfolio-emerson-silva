/* CodeHome · aula 3: planeje o fluxo. Escolha (ou sorteie) a prática e monte a ordem das páginas do site. O relógio da prática começa aqui. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$,Som=PA.Som,P=PA.Partida;

  var el={escolha:$('#escolha'),jogo:$('#jogo'),brief:$('#brief'),paleta:$('#paleta'),cadeia:$('#cadeia'),checks:$('#checks'),msg:$('#msgf'),conf:$('#conferir'),limpa:$('#limpar-fluxo'),res:$('#res-fluxo'),
          novo:$('#nova')};
  var sel={tipo:null,layout:null,estilo:null};

  /* ---------- escolha da prática ---------- */
  function botoes(alvo,dados,chave,spr){
    alvo.textContent='';
    Object.keys(dados).forEach(function(k){
      var d=dados[k],b=document.createElement('button');b.type='button';b.dataset.k=k;b.setAttribute('aria-pressed','false');
      if(spr){var im=document.createElement('img');im.className='spr';im.src='img/'+d.imgs[0]+'.png';im.alt='';im.width=40;im.height=40;b.appendChild(im)}
      var n=document.createElement('b');n.textContent=d.nome;b.appendChild(n);
      var s=document.createElement('span');s.textContent=spr?d.meta.charAt(0).toUpperCase()+d.meta.slice(1):d.desc;b.appendChild(s);
      b.addEventListener('click',function(){sel[chave]=k;$$('button',alvo).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});confere()});
      alvo.appendChild(b);
    });
  }
  botoes($('#o-tipo'),P.TIPOS,'tipo',true);botoes($('#o-layout'),P.LAYOUTS,'layout');botoes($('#o-estilo'),P.ESTILOS,'estilo');
  function marca(chave,k){var alvo=$('#o-'+chave);$$('button',alvo).forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.k===k))});sel[chave]=k}
  function confere(){$('#comeca').disabled=!(sel.tipo&&sel.layout&&sel.estilo)}
  $('#sortear').addEventListener('click',function(){
    Object.keys(sel).forEach(function(c){var d=c==='tipo'?P.TIPOS:c==='layout'?P.LAYOUTS:P.ESTILOS,ks=Object.keys(d);marca(c,ks[Math.floor(Math.random()*ks.length)])});confere();Som.ponto();
  });
  $('#comeca').addEventListener('click',function(){
    P.nova({tipo:sel.tipo,layout:sel.layout,estilo:sel.estilo});inicia();Som.acerto();
  });
  if(el.novo)el.novo.addEventListener('click',function(){P.grava(null);location.reload()});

  /* ---------- fluxo ---------- */
  var cadeia=[];
  function tipoAtual(){return P.TIPOS[P.get().tipo]}
  function desenha(){
    var t=tipoAtual();
    el.paleta.textContent='';
    t.paginas.forEach(function(pg){
      var b=document.createElement('button');b.type='button';b.dataset.id=pg.id;b.setAttribute('aria-pressed',String(cadeia.indexOf(pg.id)>=0));
      var n=document.createElement('b');n.textContent=pg.n;var s=document.createElement('span');s.textContent=pg.d;var i=document.createElement('i');i.textContent=t.essenciais.indexOf(pg.id)>=0?'essencial':'opcional';
      b.append(n,s,i);b.addEventListener('click',function(){if(cadeia.indexOf(pg.id)>=0)return;cadeia.push(pg.id);Som.ponto();desenha();checks()});
      el.paleta.appendChild(b);
    });
    el.cadeia.textContent='';
    if(!cadeia.length){var v=document.createElement('div');v.className='vazio';v.textContent='Toque nas páginas ao lado, na ordem do menu do site. A primeira é a porta de entrada.';el.cadeia.appendChild(v)}
    esboco();
    cadeia.forEach(function(id,i){
      var pg=t.paginas.filter(function(x){return x.id===id})[0];
      if(i>0){var s=document.createElement('div');s.className='seta';s.textContent='▼';s.setAttribute('aria-hidden','true');el.cadeia.appendChild(s)}
      var b=document.createElement('button');b.type='button';b.className='no';b.title='Toque para tirar do fluxo';
      b.textContent=(i+1)+'. '+pg.n;var sp=document.createElement('span');sp.textContent='tirar';b.appendChild(sp);
      b.addEventListener('click',function(){cadeia.splice(i,1);Som.clique();desenha();checks()});el.cadeia.appendChild(b);
    });
  }
  /* esboço (wireframe) do site: muda quando as páginas entram ou saem do fluxo e conforme o layout da prática */
  function esboco(){
    var p=P.get(),t=tipoAtual(),box=$('#esboco');if(!box||!p)return;box.textContent='';
    var mk=function(c,txt,pai){var d=document.createElement('div');d.className=c;if(txt)d.textContent=txt;(pai||box).appendChild(d);return d};
    var linhas=function(pai,n){for(var i=0;i<n;i++)mk('wf-l',null,pai).style.width=(90-i*14)+'%'};
    var menu=function(pai,vert){var m=mk('wf-nav'+(vert?' v':''),null,pai);if(!cadeia.length)mk('wf-ph','menu: escolha as páginas',m);cadeia.forEach(function(id){var pg=t.paginas.filter(function(x){return x.id===id})[0];mk('wf-it',pg.n,m)})};
    var cab=function(pai){var h=mk('wf-h',null,pai);mk('wf-t',t.nome,h);linhas(h,1)};
    var rod=function(pai){var f=mk('wf-f',null,pai);mk('wf-l',null,f).style.width='50%'};
    box.className='esboco lay-'+p.layout;
    if(p.layout==='lateral'){var w=mk('wf-grade',null);menu(w,true);var c=mk('wf-col',null,w);var m=mk('wf-main',null,c);mk('wf-t',t.nome,m);mk('wf-img',null,m);linhas(m,3);rod(c)}
    else if(p.layout==='cartoes'){cab(box);menu(box);var g3=mk('wf-3',null);for(var i=0;i<3;i++){var k=mk('wf-card',null,g3);mk('wf-img',null,k);linhas(k,2)}rod(box)}
    else{cab(box);menu(box);var m2=mk('wf-main',null);mk('wf-img',null,m2);linhas(m2,3);rod(box)}
  }
  function regras(){
    var t=tipoAtual(),nomes=t.essenciais.map(function(id){return t.paginas.filter(function(x){return x.id===id})[0].n});
    return [
      ['Começa pelo Início, a porta de entrada',cadeia[0]==='inicio'],
      ['Tem as páginas essenciais: '+nomes.join(', '),t.essenciais.every(function(id){return cadeia.indexOf(id)>=0})],
      ['Entre 3 e 5 páginas (cada página a mais é mais trabalho)',cadeia.length>=3&&cadeia.length<=5]
    ];
  }
  function checks(){
    (function(){var q=P.get();if(q&&!(q.etapas.fluxo&&q.etapas.fluxo.fim)){q.fluxo=cadeia.slice();P.grava(q)}})();
    el.checks.textContent='';regras().forEach(function(r){var li=document.createElement('li');li.textContent=r[0];if(r[1])li.className='ok';el.checks.appendChild(li)});
    el.msg.textContent='';el.msg.className='msgf';
  }
  el.limpa.addEventListener('click',function(){cadeia=[];Som.clique();desenha();checks()});
  el.conf.addEventListener('click',function(){
    var r=regras(),falta=r.filter(function(x){return !x[1]});
    if(falta.length){P.penalidade(10,'erro');Som.erro();el.msg.className='msgf er';var ft=PA.I18n.t(falta[0][0]);el.msg.textContent=PA.I18n.t('Ainda falta:')+' '+(PA.I18n.en?ft:ft.toLowerCase())+PA.I18n.t('. (+10 s no relógio)');return}
    var p=P.get();p.fluxo=cadeia.slice();P.grava(p);var e=P.termina('fluxo');
    var ms=(e.ms||0)+(e.pen||0)*1000,n=P.nota(ms,P.par('fluxo',p));
    P.get().etapas.fluxo.nota=n.est;var q=P.get();q.etapas.fluxo.nota=n.est;P.grava(q);
    Som[n.bom?'selo':'ruim']();
    el.res.classList.add('on');el.res.classList.toggle('boa',n.bom);el.res.classList.toggle('ruim',!n.bom);
    $('.tempo',el.res).textContent=P.fmt(ms);$('.nota',el.res).textContent=n.rot;P.pintaMedalha($('.estr',el.res),n.est,'velocidade');$('.msg',el.res).textContent=n.msg+' Pistas usadas: '+(e.pistas||0)+' · erros: '+(e.erros||0)+'.';
    el.conf.disabled=true;setTimeout(function(){el.res.scrollIntoView({behavior:'smooth',block:'center'})},250);
  });

  /* ---------- entra no jogo ---------- */
  function inicia(){
    var p=P.get();if(!p)return;
    var t=P.TIPOS[p.tipo],l=P.LAYOUTS[p.layout],es=P.ESTILOS[p.estilo];
    el.escolha.hidden=true;el.jogo.hidden=false;
    el.brief.innerHTML='';
    [['Cliente',t.cliente,'quer '+t.meta],['Layout',l.nome,l.desc],['Estilo',es.nome,es.desc]].forEach(function(x){
      var d=document.createElement('div');var s=document.createElement('small');s.textContent=x[0];var b=document.createElement('b');b.textContent=x[1];var sp=document.createElement('span');sp.textContent=x[2];d.append(s,b,sp);el.brief.appendChild(d)});
    var rec=P.recorde(p);if(rec){$('#recorde').textContent='Seu recorde neste tipo e layout: '+P.fmt(rec)}
    cadeia=(p.fluxo&&p.fluxo.length)?p.fluxo.slice():[];
    var fim=p.etapas.fluxo&&p.etapas.fluxo.fim;
    if(fim){P.inicia('fluxo');desenha();checks();el.conf.disabled=true;el.res.classList.add('on');var n=P.nota((p.etapas.fluxo.ms||0)+(p.etapas.fluxo.pen||0)*1000,P.par('fluxo',p));
      el.res.classList.toggle('boa',n.bom);el.res.classList.toggle('ruim',!n.bom);$('.tempo',el.res).textContent=P.fmt((p.etapas.fluxo.ms||0)+(p.etapas.fluxo.pen||0)*1000);$('.nota',el.res).textContent=n.rot;P.pintaMedalha($('.estr',el.res),n.est,'velocidade');$('.msg',el.res).textContent=n.msg}
    else{P.inicia('fluxo');desenha();checks()}
  }
  P.hud($('#hud'));
  var atual=P.get();
  if(atual&&!(atual.etapas.html&&atual.etapas.html.fim))inicia();
  else if(atual&&atual.etapas.html&&atual.etapas.html.fim){/* partida anterior concluída: mostra a escolha para uma nova */}
})();
