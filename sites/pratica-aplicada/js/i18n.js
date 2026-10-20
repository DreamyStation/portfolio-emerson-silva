/* Prática aplicada · idioma (PT/EN). Este arquivo é pequeno e fica em todas as páginas: guarda a escolha, liga o botão PT | EN e, só em inglês,
   carrega o motor de tradução (i18n_en.js, gerado por Sites_Maiores/_ferramentas/pa_i18n_build.py). Trocar de idioma recarrega a página;
   o progresso das aulas fica salvo no navegador. */
(function(){
  'use strict';
  var P=window.PA=window.PA||{},KEY='pa:idioma',id='pt',extrai=false;
  try{id=localStorage.getItem(KEY)||localStorage.getItem('portfolio-lang')||'pt'}catch(e){}
  if(id!=='en')id='pt';
  try{extrai=localStorage.getItem('pa:i18n_extrai')==='1'}catch(e){}
  P.I18n={id:id,en:id==='en',t:function(s){return s},termos:null,loc:id==='en'?'en-US':'pt-BR'};
  document.documentElement.lang=id==='en'?'en':'pt-BR';
  var cur=document.currentScript,src=cur&&cur.src||'',base=src.replace(/i18n\.js.*$/,''),v=(/[?&]v=([\w.]+)/.exec(src)||[])[1]||'';
  if(id==='en'||extrai){document.write('<script src="'+base+'i18n_en.js'+(v?'?v='+v:'')+'"><\/script>')}
  function liga(){
    var bs=document.querySelectorAll('[data-lang]');
    for(var i=0;i<bs.length;i++)(function(b){
      b.setAttribute('aria-pressed',String(b.getAttribute('data-lang')===id));
      b.addEventListener('click',function(){
        var novo=b.getAttribute('data-lang');if(novo===id)return;
        try{localStorage.setItem(KEY,novo)}catch(e){}
        location.reload();
      });
    })(bs[i]);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',liga);else liga();
})();
