/* Prática aplicada · ranking de velocidade. Lê as tentativas guardadas no navegador (pa:ranking) e mostra, do melhor ao pior tempo, com data e hora. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,P=PA.Partida,Som=PA.Som;
  var sel=$('#rk-qual'),tab=$('#rk-tabela'),res=$('#rk-resumo'),vazio=$('#rk-vazio');
  var el=function(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  var lang=function(){return (PA.I18n&&PA.I18n.loc)||'pt-BR'};
  var T=function(s){return PA.I18n&&PA.I18n.t?PA.I18n.t(s):s};

  function parDe(k,layout){
    if(P.CURSOS[k])return P.CURSOS[k].reduce(function(a,e){return a+P.par(e,{layout:layout})},0);
    return P.par(k,{layout:layout});
  }
  function rotuloSite(s){
    var a=String(s||'').split('|');if(a.length<3||!P.TIPOS[a[0]])return '—';
    return P.TIPOS[a[0]].caminho+' · '+P.LAYOUTS[a[1]].nome+' · '+P.ESTILOS[a[2]].nome;
  }
  function monta(){
    var todos=P.rankingTodos(),cont={};todos.forEach(function(x){cont[x.k]=(cont[x.k]||0)+1});
    var atual=sel.value;sel.textContent='';
    function grupo(nome,chaves){
      var g=document.createElement('optgroup');g.label=T(nome);
      chaves.forEach(function(k){var o=el('option',null,T(P.ETAPAS[k])+' ('+(cont[k]||0)+')');o.value=k;g.appendChild(o)});sel.appendChild(g);
    }
    grupo('Cursos completos',['curso1','curso2','curso3']);
    grupo('Nível 1',P.CURSOS.curso1);grupo('Nível 2',P.CURSOS.curso2);grupo('Programação geral',P.CURSOS.curso3);
    sel.value=atual&&P.ETAPAS[atual]?atual:'curso1';
  }
  function desenha(){
    var k=sel.value,lista=P.rankingDe(k);
    tab.textContent='';res.textContent='';
    vazio.hidden=lista.length>0;$('#rk-conteudo').hidden=lista.length===0;
    if(!lista.length)return;
    var ultimo=lista.slice().sort(function(a,b){return b.em-a.em})[0],melhor=lista[0],media=Math.round(lista.reduce(function(a,x){return a+x.ms},0)/lista.length);
    [[T('Melhor tempo'),P.fmt(melhor.ms)],[T('Tentativas'),String(lista.length)],[T('Tempo médio'),P.fmt(media)],[T('Última tentativa'),new Date(ultimo.em).toLocaleDateString(lang())]].forEach(function(x){
      var d=el('div','rk-card');d.appendChild(el('small',null,x[0]));d.appendChild(el('b',null,x[1]));res.appendChild(d)});
    var th=el('thead'),tr=el('tr');
    [T('Posição'),T('Tempo'),T('Data e hora'),T('Site da tentativa'),T('Medalha'),T('Dicas')].forEach(function(h){tr.appendChild(el('th',null,h))});th.appendChild(tr);tab.appendChild(th);
    var tb=el('tbody');
    lista.forEach(function(x,i){
      var r=el('tr',(i===0?'melhor ':'')+(x.id===(P.ultimo&&P.ultimo.id)?'nova':''));
      var pos=el('td',null,(PA.I18n&&PA.I18n.en?(function(n){var d=n%100,u=n%10;return n+((d>=11&&d<=13)?'th':u===1?'st':u===2?'nd':u===3?'rd':'th')})(i+1):(i+1)+'º'));if(i===0)pos.title=T('Melhor tempo');r.appendChild(pos);
      r.appendChild(el('td','tempo',P.fmt(x.ms)));
      r.appendChild(el('td',null,new Date(x.em).toLocaleString(lang(),{dateStyle:'short',timeStyle:'short'})));
      r.appendChild(el('td',null,rotuloSite(x.site)));
      var lay=String(x.site||'').split('|')[1]||'coluna',nv=P.nota(x.ms,parDe(k,lay)),tdm=el('td','medalha'),im=document.createElement('img');
      im.src='img/'+P.MEDALHAS[nv.est]+'.png';im.width=im.height=28;im.alt=P.estrelas(nv.est);im.className='spr';tdm.appendChild(im);r.appendChild(tdm);
      r.appendChild(el('td',null,k.indexOf('curso')===0?'—':String(x.pistas||0)));
      tb.appendChild(r);
    });
    tab.appendChild(tb);
  }
  monta();desenha();
  sel.addEventListener('change',function(){desenha();Som.clique()});
  var limpa=$('#rk-limpa'),conf=$('#rk-confirma');
  limpa.addEventListener('click',function(){limpa.hidden=true;conf.hidden=false});
  $('#rk-nao').addEventListener('click',function(){conf.hidden=true;limpa.hidden=false});
  $('#rk-sim').addEventListener('click',function(){PA.Arm.grava('ranking',[]);conf.hidden=true;limpa.hidden=false;monta();desenha();Som.clique()});
  $('#rk-baixa').addEventListener('click',function(){
    var linhas=[['posicao','etapa','tempo_ms','tempo','data_hora','site','dicas']];
    P.rankingDe(sel.value).forEach(function(x,i){linhas.push([i+1,x.k,x.ms,P.fmt(x.ms),new Date(x.em).toISOString(),rotuloSite(x.site),x.pistas||0])});
    var csv=linhas.map(function(l){return l.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"'}).join(',')}).join('\n');
    var b=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='ranking-'+sel.value+'.csv';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
  });
  PA.rankingRender=function(){monta();desenha()};
})();
