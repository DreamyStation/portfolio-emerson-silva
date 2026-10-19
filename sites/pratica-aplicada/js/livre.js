/* Prática aplicada · editor livre das aulas do nível 1 (opcional). Acrescenta, embaixo do laboratório, um editor de código de verdade e o painel de erros.
   O que for escrito aqui vale como se tivesse sido digitado no terminal: a minitela muda na hora e os passos são conferidos pelo resultado. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$;
  PA.Livre={liga:function(o){
    var lab=document.querySelector('#lab .lab2');if(!lab||!PA.Editor||!o||!o.term||!o.term.o)return;
    var det=document.createElement('details');det.className='px livre';
    var sum=document.createElement('summary');sum.textContent='Editor de código (opcional): escreva do seu jeito';det.appendChild(sum);
    var corpo=document.createElement('div');corpo.className='livre-corpo';
    corpo.innerHTML='<p class="livre-dica">Tudo o que você escrever aqui vale como se tivesse digitado no terminal: a minitela muda na hora e os passos são conferidos pelo resultado, não pelo texto exato. O painel de baixo explica erros de HTML e de CSS.</p>'+
      '<div id="editor"></div><div class="px"><div class="bar"><b>quando algo dá errado</b><span id="diag-resumo" class="diag-resumo ok">tudo certo</span></div><div id="diag" class="diag"></div></div>';
    det.appendChild(corpo);lab.parentNode.insertBefore(det,lab.nextSibling);
    var ed=null,t=o.term,ex=function(c){return !!o.sh.no(o.site+'/'+c)};
    function itens(){
      var pasta=o.sh.no(o.site),it=[];if(!pasta||pasta.t!=='d')return it;
      Object.keys(pasta.f).forEach(function(k){var f=pasta.f[k];if(f.t!=='a')return;
        if(/\.html$/i.test(k))it=it.concat(PA.Diag.html(f.c,{arq:k,existe:ex}));else if(/\.css$/i.test(k))it=it.concat(PA.Diag.css(f.c,{arq:k}))});
      return it;
    }
    function diag(){
      var d=$('#diag');if(!d)return;var it=itens();
      PA.Diag.painel(d,it,function(i){if(ed)ed.vaiPara(i.arq,i.lin)},'Nenhum problema encontrado.');
      var er=it.filter(function(i){return i.n==='erro'}).length,av=it.length-er,r=$('#diag-resumo');
      if(r){r.textContent=it.length?(er?er+(er===1?' erro':' erros'):'')+(er&&av?' · ':'')+(av?av+(av===1?' atenção':' atenções'):''):'tudo certo';r.className='diag-resumo '+(er?'erro':av?'aviso':'ok')}
      if(ed)ed.marca(it);
    }
    /* quando o terminal mexe nos arquivos, o editor acompanha */
    var orig=t.o.atualizaPrompt;
    t.o.atualizaPrompt=function(){if(orig)orig.apply(this,arguments);if(ed)ed.atualiza();if(det.open)diag()};
    /* quando o editor muda um arquivo, o laboratório reage como se fosse um comando */
    function mudou(){
      try{if(t.o.atualizaPrompt)t.o.atualizaPrompt()}catch(e){}
      try{if(t.o.depois)t.o.depois('code',{erro:false,linhas:[]},t)}catch(e){}
      diag();
    }
    det.addEventListener('toggle',function(){
      if(det.open&&!ed){
        ed=PA.Editor({el:$('#editor'),shell:o.sh,pasta:o.site,padrao:'index.html',ordem:['index.html','estilo.css','script.js'],aoMudar:mudou});
        ed.pronto.then(function(){diag()});
      }else if(det.open)diag();
    });
  }};
})();
