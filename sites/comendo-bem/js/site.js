/* Comendo Bem · ferramentas: monte a semana, proteína do dia, timer de preparo e validade no freezer */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
  var money=function(v){return BRL.format(v)};
  /* CONFIGURE AQUI: WhatsApp da Comendo Bem com DDI e DDD (ex.: 5547999999999). Vazio = o botão fica escondido e só existe "Copiar pedido". */
  var WHATS='';

  /* ---------- Monte a semana ---------- */
  var grade=$('#grade');
  if(grade){
    var NOMES=['—','Proteína','Leve','Veggie'],DIAS=['Seg','Ter','Qua','Qui','Sex','Sáb'],PRECO={300:22,400:26,500:30};
    var S={tam:400,cel:[0,0,0,0,0,0,0,0,0,0,0,0]};
    var PRE={
      leve:[[2,2,2,2,2,0],[0,0,0,0,0,0]],
      equilibrio:[[1,2,3,1,2,3],[2,3,1,2,3,0]],
      forca:[[1,1,1,1,1,1],[1,1,1,1,1,0]],
      veggie:[[3,3,3,3,3,0],[3,3,3,3,3,0]],
      limpar:[[0,0,0,0,0,0],[0,0,0,0,0,0]]
    };
    var monta=function(){
      var h='<span></span>'+DIAS.map(function(d){return '<span class="dia">'+d+'</span>'}).join('');
      ['Almoço','Jantar'].forEach(function(r,ri){
        h+='<span class="ref">'+r+'</span>';
        for(var d=0;d<6;d++){var i=ri*6+d;h+='<button type="button" class="cel" data-i="'+i+'" data-v="0" aria-label="'+DIAS[d]+', '+r.toLowerCase()+': nenhuma">—</button>'}
      });
      grade.innerHTML=h;
    };
    var conta=function(){
      var n=0,por=[0,0,0,0];S.cel.forEach(function(v){if(v){n++;por[v]++}});
      var base=PRECO[S.tam],sub=n*base,pct=n>=20?.15:n>=14?.10:n>=10?.05:0,desc=sub*pct,total=sub-desc;
      $$('.cel',grade).forEach(function(b){var i=+b.dataset.i,v=S.cel[i],d=i%6,r=i<6?'almoço':'jantar';b.dataset.v=v;b.textContent=v?NOMES[v]:'—';b.setAttribute('aria-label',DIAS[d]+', '+r+': '+(v?NOMES[v]:'nenhuma'))});
      $$('.tamanhos button').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.t===S.tam))});
      $('#s-n').textContent=n+(n===1?' marmita':' marmitas');
      $('#s-linhas').innerHTML=[1,2,3].map(function(k){return '<div class="l"><span>'+NOMES[k]+'</span><b>'+por[k]+'</b></div>'}).join('');
      $('#s-sub').textContent=money(sub);$('#s-desc').textContent=desc?'− '+money(desc)+' ('+Math.round(pct*100)+'%)':'—';
      $('#s-total').textContent=money(total);
      var prox=n<10?10:n<14?14:n<20?20:0;
      $('#s-eco').textContent=!n?'Toque nos círculos para escolher.':prox?'Faltam '+(prox-n)+' para o próximo desconto.':'Desconto máximo da semana!';
      $$('#s-faixa i').forEach(function(el,k){el.classList.toggle('on',n>=[10,14,20][k])});
      var linhas=[];for(var d=0;d<6;d++){var a=S.cel[d],j=S.cel[6+d];if(a||j)linhas.push(DIAS[d]+': '+(a?'almoço '+NOMES[a]:'')+(a&&j?' · ':'')+(j?'jantar '+NOMES[j]:''))}
      $('#s-texto').textContent=n?'Pedido Comendo Bem\n'+S.tam+' g · '+n+' marmitas\nProteína '+por[1]+' · Leve '+por[2]+' · Veggie '+por[3]+'\n'+linhas.join('\n')+'\nTotal: '+money(total):'Seu pedido aparece aqui.';
    };
    monta();
    grade.addEventListener('click',function(e){var b=e.target.closest('.cel');if(!b)return;var i=+b.dataset.i;S.cel[i]=(S.cel[i]+1)%4;conta()});
    $$('.tamanhos button').forEach(function(b){b.addEventListener('click',function(){S.tam=+b.dataset.t;conta()})});
    $$('.atalhos button').forEach(function(b){b.addEventListener('click',function(){var p=PRE[b.dataset.p];S.cel=p[0].concat(p[1]);conta()})});
    var zap=$('#s-zap');if(zap&&WHATS){zap.hidden=false;zap.addEventListener('click',function(){window.open('https://wa.me/'+encodeURIComponent(WHATS)+'?text='+encodeURIComponent($('#s-texto').textContent),'_blank','noopener,noreferrer')})}
    $('#s-copia').addEventListener('click',function(){
      var t=$('#s-texto').textContent,ok=function(){$('#s-copia').textContent='Copiado!';setTimeout(function(){$('#s-copia').textContent='Copiar pedido'},1800)};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){});else{var r=document.createRange();r.selectNodeContents($('#s-texto'));var s=getSelection();s.removeAllRanges();s.addRange(r)}
    });
    conta();
  }

  /* ---------- Proteína do dia ---------- */
  var fp=$('#f-prot');
  if(fp){
    var G={sed:[.8,1.0],ativo:[1.2,1.6],massa:[1.6,2.0],emag:[1.4,1.8]};
    var calcP=function(){
      var kg=Math.max(0,parseFloat($('#p-peso').value)||0),r=G[$('#p-perfil').value],q=Math.max(0,parseInt($('#p-qtd').value,10)||0);
      var min=kg*r[0],max=kg*r[1],marm=q*32;
      $('#p-faixa').textContent=Math.round(min)+' a '+Math.round(max)+' g';
      $('#p-marm').textContent=marm+' g';
      $('#p-pct').textContent=min?'Isso cobre cerca de '+Math.round(marm/min*100)+'% do mínimo da faixa. O resto vem das outras refeições do dia.':'';
    };
    fp.addEventListener('input',calcP);calcP();
  }

  /* ---------- Timer de preparo ---------- */
  var tm=$('#timer');
  if(tm){
    var TEMPOS={prot:[300,'Proteína · micro-ondas 5 min'],leve:[240,'Leve · micro-ondas 4 min'],veg:[300,'Veggie · micro-ondas 5 min'],forno:[1200,'Forno a 180 °C · 20 min']};
    var tipo='prot',rest=300,total=300,iv=null,rodando=false;
    var mmss=function(s){var m=Math.floor(s/60),x=s%60;return (m<10?'0':'')+m+':'+(x<10?'0':'')+x};
    var pinta=function(){$('#t-tempo').textContent=mmss(rest);$('.prog',tm).style.strokeDashoffset=String(565*(1-rest/total));$('#t-vapor').classList.toggle('on',rodando);$('#t-ini').textContent=rodando?'Pausar':(rest===0?'Pronto!':'Começar')};
    var escolhe=function(k){tipo=k;rest=total=TEMPOS[k][0];rodando=false;clearInterval(iv);$('#t-nome').textContent=TEMPOS[k][1];$('#t-aviso').textContent='Tampa entreaberta.';$$('.opcoes button',tm).forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.k===k))});pinta()};
    $$('.opcoes button',tm).forEach(function(b){b.addEventListener('click',function(){escolhe(b.dataset.k)})});
    $('#t-ini').addEventListener('click',function(){
      if(rest===0){escolhe(tipo);return}
      rodando=!rodando;clearInterval(iv);
      if(rodando)iv=setInterval(function(){rest--;if(rest<=0){rest=0;rodando=false;clearInterval(iv);$('#t-aviso').textContent='Pronto! Cuidado, está quente.';if(navigator.vibrate)navigator.vibrate(300)}pinta()},1000);
      pinta();
    });
    $('#t-zera').addEventListener('click',function(){escolhe(tipo)});
    escolhe('prot');
  }

  /* ---------- Validade no freezer ---------- */
  var fz=$('#f-freezer');
  if(fz){
    var calcF=function(){
      var v=$('#z-data').value;if(!v){$('#z-res').textContent='Escolha a data em que as marmitas chegaram.';return}
      var d=new Date(v+'T12:00:00');d.setDate(d.getDate()+90);
      var hoje=new Date();hoje.setHours(12,0,0,0);var dias=Math.round((d-hoje)/86400000);
      $('#z-res').textContent='Consuma até '+d.toLocaleDateString('pt-BR')+' ('+(dias>=0?'faltam '+dias+' dias':'venceu há '+(-dias)+' dias')+').';
    };
    fz.addEventListener('input',calcF);calcF();
  }
})();
