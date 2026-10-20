/* CodeHome · dicionários de linguagens: abas (HTML, CSS, JavaScript, Python, SQL) e busca. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$;
  var abas=$$('.dic-abas button[data-dic]'),paineis=$$('.dic-painel'),f=$('#fdic'),r=$('#resultados-dic');
  if(!abas.length||!f)return;
  var atual=PA.Arm.le('dic','html');
  var h=(location.hash||'').replace('#','').split('-');
  if(h[0]==='g'&&h[1])atual=h[1];else if(abas.some(function(b){return b.dataset.dic===h[0]}))atual=h[0];
  if(!abas.some(function(b){return b.dataset.dic===atual}))atual='html';

  function mostra(k,guarda){
    atual=k;if(guarda!==false)PA.Arm.grava('dic',k);
    abas.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.dic===k))});
    filtra();
  }
  function filtra(){
    var q=f.value.trim().toLowerCase(),n=0;
    paineis.forEach(function(p){
      var cm=$$('.cm',p),ach=0;
      cm.forEach(function(li){var ok=!q||li.getAttribute('data-b').indexOf(q)>=0;li.hidden=!ok;if(ok)ach++});
      $$('.grp',p).forEach(function(g){var c=$$('.cm',g);g.hidden=!!q&&!c.some(function(li){return !li.hidden})});
      var mostra=q?ach>0:p.dataset.dic===atual;
      p.hidden=!mostra;n+=ach;
      var ab=abas.filter(function(b){return b.dataset.dic===p.dataset.dic})[0];
      if(ab){var base=ab.dataset.t||(ab.dataset.t=ab.textContent);ab.textContent=q?base+' ('+ach+')':base}
    });
    r.textContent=q?(n?n+(n===1?' entrada encontrada':' entradas encontradas'):'Nenhuma entrada encontrada. Tente outra palavra.'):'';
  }
  abas.forEach(function(b){b.addEventListener('click',function(){f.value='';mostra(b.dataset.dic);if(PA.Som)PA.Som.clique()})});
  f.addEventListener('input',filtra);
  mostra(atual,false);
  if(h[0]==='g'){var alvo=document.getElementById(h.join('-'));if(alvo)setTimeout(function(){alvo.scrollIntoView()},300)}
})();
