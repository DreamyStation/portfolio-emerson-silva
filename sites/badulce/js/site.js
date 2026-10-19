/* Badulce · ferramentas (sabores, preços e prazos de exemplo): cardápio com pedido, caixinha de presente e calculadora de festa */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
  var money=function(v){return BRL.format(v)};
  var INSTA='baldulce._';
  var MENU=[
    {id:'brownie',nome:'Brownie',foto:'brownie',icone:'brownie',itens:[{n:'Brownie',d:'Unidade, feito em casa com carinho.',p:8},{n:'Caixa com 4 brownies',d:'Para presentear ou dividir.',p:30}]},
    {id:'ovo',nome:'Ovo de colher',foto:'ovo_de_colher',icone:'ovo',itens:[{n:'Ovo de colher 250 g',d:'Casca de chocolate e o recheio que você escolher.',p:48,rot:'Recheio',ops:['Ninho com morango','Brigadeiro','Maracujá','Doce de leite']},{n:'Ovo de colher 350 g',d:'O tamanho para dividir (ou não).',p:62,rot:'Recheio',ops:['Ninho com morango','Brigadeiro','Maracujá','Doce de leite']}]},
    {id:'bombom',nome:'Bombom',foto:'bombom',icone:'bombom',itens:[{n:'Bombom',d:'Pequeno, artesanal e cheio de carinho.',p:5,rot:'Sabor',ops:['Ao leite','Meio amargo','Branco']},{n:'Caixa com 6 bombons',d:'Uma caixinha para dar de presente.',p:26,rot:'Sabor',ops:['Sortidos','Ao leite','Meio amargo']}]},
    {id:'bolo',nome:'Bolo',foto:'bolo',icone:'bolo',itens:[{n:'Fatia de bolo',d:'Uma fatia, do jeito caseiro.',p:12,rot:'Sabor',ops:['Chocolate','Cenoura','Brigadeiro']},{n:'Bolo inteiro 1 kg',d:'Sob encomenda, avise com antecedência.',p:90,rot:'Sabor',ops:['Chocolate','Cenoura','Brigadeiro']}]},
    {id:'brigadeiro',nome:'Brigadeiro',foto:'brigadeiro',icone:'brigadeiro',itens:[{n:'Brigadeiro',d:'O clássico, enrolado à mão.',p:3,rot:'Sabor',ops:['Tradicional','Ninho','Maracujá']},{n:'Caixa com 12 brigadeiros',d:'Para a festa ou para o café.',p:32,rot:'Sabor',ops:['Tradicional','Ninho','Sortidos']}]}
  ];
  var URLDM='https://ig.me/m/'+INSTA;
  var copia=function(t,btn,ori){
    var ok=function(){if(btn){btn.textContent='Copiado!';setTimeout(function(){btn.textContent=ori},1800)}};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){});
  };

  /* corações que surgem, sobem e somem */
  (function(){
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var svg=function(fill,stroke,w){return 'url("data:image/svg+xml,'+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='"+fill+"' stroke='"+stroke+"' stroke-width='"+w+"' stroke-linecap='round' stroke-linejoin='round'><path d='M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.6A4.5 4.5 0 0120 10c0 5.7-8 11-8 11z'/></svg>")+'")'};
    var V=[svg('none','#E9326D',1.6),svg('#FCB8C5','#E9326D',1.2),svg('#E9326D','none',0),svg('#FED6DF','#FCB8C5',1)];
    var c=document.createElement('div');c.className='coracoes';c.setAttribute('aria-hidden','true');
    for(var i=0;i<18;i++){
      var e=document.createElement('i'),t=Math.random();
      e.style.cssText='left:'+(5+Math.random()*82).toFixed(1)+'%;--s:'+(14+Math.random()*26).toFixed(0)+'px;--d:'+(11+Math.random()*13).toFixed(1)+'s;--a:-'+(Math.random()*22).toFixed(1)+'s;--x:'+((Math.random()<.5?-1:1)*(8+Math.random()*26)).toFixed(0)+'px;--o:'+(.4+Math.random()*.35).toFixed(2)+';--h:'+V[t<.35?0:t<.65?1:t<.85?3:2];
      c.appendChild(e);
    }
    document.body.appendChild(c);
  })();
  

  /* bandeirinhas de festa */
  var bd=$('.bandeirinhas');
  if(bd){var W=1200,n=24,cores=['#E9326D','#FCB8C5','#FED6DF','#B31F52'],tri='';for(var j=0;j<n;j++){var t=(j+.5)/n,x=t*W,y=6+80*t*(1-t)*.5;tri+='<polygon points="'+(x-24).toFixed(1)+','+y.toFixed(1)+' '+(x+24).toFixed(1)+','+y.toFixed(1)+' '+x.toFixed(1)+','+(y+46).toFixed(1)+'" fill="'+cores[j%4]+'" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>'}
    bd.innerHTML='<svg viewBox="0 0 1200 80" preserveAspectRatio="none" width="100%" height="70" aria-hidden="true"><path d="M0 6 Q600 46 1200 6" fill="none" stroke="#B31F52" stroke-width="2.5"/>'+tri+'</svg>'}

  /* ---------- cardápio ---------- */
  var g=$('#grade');
  if(g){
    var cart={},filtro='todos';
    var filtros=$('#filtros');
    filtros.innerHTML='<button type="button" data-f="todos" aria-pressed="true">Todos</button>'+MENU.map(function(m){return '<button type="button" data-f="'+m.id+'" aria-pressed="false"><img src="img/ic_'+m.icone+'_traco_vivo.svg" alt="">'+m.nome+'</button>'}).join('');
    var desenha=function(){
      var h='';
      MENU.forEach(function(m){if(filtro!=='todos'&&filtro!==m.id)return;
        var mn=Math.min.apply(null,m.itens.map(function(x){return x.p}));
        h+='<section class="grupo" id="g-'+m.id+'"><div class="grupo-lado"><img class="big" src="img/ic_'+m.icone+'_duotone.svg" alt=""><div><h2>'+m.nome+'</h2><p>'+m.itens.length+' opções · a partir de '+money(mn).replace(',00','')+'</p></div></div><div class="grade">';
        m.itens.forEach(function(it,k){
          h+='<article class="doce"><span class="etiq" aria-label="'+money(it.p)+'">R$ '+it.p+'</span><div class="foto"><img src="img/'+m.foto+'.jpg" alt="'+it.n+'" loading="lazy" width="160" height="160"></div><h3>'+it.n+'</h3><p>'+it.d+'</p>'+
             (it.ops?'<select aria-label="'+it.rot+' de '+it.n+'">'+it.ops.map(function(o){return '<option>'+o+'</option>'}).join('')+'</select>':'')+
             '<button type="button" class="btn" data-m="'+m.id+'" data-k="'+k+'">Adicionar</button></article>';
        });
        h+='</div></section>';
      });
      g.innerHTML=h;
    };
    var resumo=function(){
      var n=0,t=0,linhas=[];Object.keys(cart).forEach(function(k){var x=cart[k];n+=x.q;t+=x.q*x.p;linhas.push(x.q+'x '+x.n+(x.o?' ('+x.o+')':''))});
      $('#b-n').textContent=n+(n===1?' item':' itens');$('#b-total').textContent=money(t);$('#barra').classList.toggle('on',n>0);
      $('#pedido-w').hidden=n===0;
      $('#pedido').textContent='Oi, Badulce! Quero fazer um pedido (demonstração):\n'+linhas.map(function(l){return '• '+l}).join('\n')+'\nTotal: '+money(t)+'\nPode me passar a data e a forma de entrega? 💗';
    };
    var hh=location.hash.slice(1);if(MENU.some(function(m){return m.id===hh})){filtro=hh;$$('#filtros button').forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.f===hh))})}
    desenha();
    filtros.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;filtro=b.dataset.f;$$('#filtros button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});desenha()});
    g.addEventListener('click',function(e){
      var b=e.target.closest('.btn');if(!b)return;var m=MENU.filter(function(x){return x.id===b.dataset.m})[0],it=m.itens[+b.dataset.k],sel=b.parentNode.querySelector('select'),o=sel?sel.value:'',key=it.n+'|'+o;
      cart[key]=cart[key]||{n:it.n,o:o,p:it.p,q:0};cart[key].q++;resumo();
      b.textContent='Adicionado ♥';setTimeout(function(){b.textContent='Adicionar'},900);
    });
    $('#b-ver').addEventListener('click',function(){$('#pedido-w').scrollIntoView({behavior:'smooth',block:'center'})});
    $('#p-copia').addEventListener('click',function(){copia($('#pedido').textContent,$('#p-copia'),'Copiar pedido')});
    $('#p-dm').href=URLDM;
    $('#p-limpa').addEventListener('click',function(){cart={};resumo()});
  }

  /* ---------- recadinho do cartão (início e caixinha) ---------- */
  var RECADOS=['Obrigada pela sua compra!','Feito com carinho para você.','Para adoçar o seu dia.','Parabéns! Que seja doce como este presente.'];
  var txt=$('#r-texto');
  if(txt){
    var pre=$('#r-pre'),out=$('#r-prev');
    var atual=function(){out.textContent=txt.value.trim()||RECADOS[0];$('#r-cont').textContent=txt.value.length+' / 80'};
    pre.innerHTML=RECADOS.map(function(r){return '<option>'+r+'</option>'}).join('')+'<option value="">Escrever o meu</option>';
    pre.addEventListener('change',function(){if(pre.value){txt.value=pre.value}else{txt.value='';txt.focus()}atual()});
    txt.addEventListener('input',atual);txt.value=RECADOS[0];atual();
  }

  /* ---------- caixinha de presente ---------- */
  var cx=$('#caixa');
  if(cx){
    var DOCES=[{id:'brownie',n:'Brownie',p:8,foto:'brownie'},{id:'bombom',n:'Bombom',p:5,foto:'bombom'},{id:'brigadeiro',n:'Brigadeiro',p:3,foto:'brigadeiro'}];
    var TAM={4:2,6:3,9:3},EMB=4,N=6,slots=[];
    var pinta=function(){
      var cheios=slots.filter(Boolean).length,soma=slots.reduce(function(a,d){return a+(d?d.p:0)},0);
      cx.style.gridTemplateColumns='repeat('+TAM[N]+',minmax(0,1fr))';
      cx.innerHTML=Array.apply(null,Array(N)).map(function(_,i){var d=slots[i];return '<button type="button" class="espaco" data-i="'+i+'" aria-label="'+(d?'Tirar '+d.n:'Espaço vazio')+'">'+(d?'<img src="img/'+d.foto+'.jpg" alt="'+d.n+'">':'+')+'</button>'}).join('');
      $$('.tamanhos button').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.n===N))});
      $$('.escolhas button').forEach(function(b){b.disabled=cheios>=N});
      $('#c-vazios').textContent=(N-cheios)===0?'Caixinha cheia!':'Faltam '+(N-cheios)+' '+((N-cheios)===1?'doce':'doces');
      var cont={};slots.forEach(function(d){if(d)cont[d.n]=(cont[d.n]||0)+1});
      $('#c-lista').innerHTML=Object.keys(cont).map(function(k){var d=DOCES.filter(function(x){return x.n===k})[0];return '<div class="linha"><span>'+cont[k]+'x '+k+'</span><b>'+money(cont[k]*d.p)+'</b></div>'}).join('')+'<div class="linha"><span>Embalagem de presente</span><b>'+money(EMB)+'</b></div>';
      $('#c-total').textContent=money(soma+EMB);
      var msg=($('#r-texto').value.trim()||RECADOS[0]);
      $('#c-pedido').textContent='Oi, Badulce! Quero uma caixinha de presente (demonstração) com '+N+' doces:\n'+Object.keys(cont).map(function(k){return '• '+cont[k]+'x '+k}).join('\n')+(cheios<N?'\n(ainda faltam '+(N-cheios)+' doces para escolher)':'')+'\nRecadinho do cartão: “'+msg+'”\nTotal: '+money(soma+EMB)+'\nPode me passar a data e a forma de entrega? 💗';
    };
    $('.escolhas').innerHTML=DOCES.map(function(d){return '<button type="button" data-id="'+d.id+'"><img src="img/'+d.foto+'.jpg" alt=""><span>'+d.n+'<small>'+money(d.p)+' cada</small></span></button>'}).join('');
    $('.escolhas').addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;var d=DOCES.filter(function(x){return x.id===b.dataset.id})[0],i=-1;for(var k=0;k<N;k++){if(!slots[k]){i=k;break}}if(i>=0){slots[i]=d;pinta()}});
    cx.addEventListener('click',function(e){var b=e.target.closest('.espaco');if(!b)return;var i=+b.dataset.i;if(slots[i]){slots[i]=null;pinta()}});
    $$('.tamanhos button').forEach(function(b){b.addEventListener('click',function(){N=+b.dataset.n;slots=slots.slice(0,N);pinta()})});
    $('#r-texto').addEventListener('input',pinta);$('#r-pre').addEventListener('change',pinta);
    $('#c-copia').addEventListener('click',function(){copia($('#c-pedido').textContent,$('#c-copia'),'Copiar pedido')});$('#c-dm').href=URLDM;
    pinta();
  }

  /* ---------- calculadora de festa ---------- */
  var ff=$('#f-festa');
  if(ff){
    var PRECO={brigadeiro:3,bombom:5,brownie:8},FOTO={brigadeiro:'brigadeiro',bombom:'bombom',brownie:'brownie'},NOME={brigadeiro:'Brigadeiros',bombom:'Bombons',brownie:'Brownies'};
    var MIX={aniv:{brigadeiro:.45,bombom:.25,brownie:.30},cha:{brigadeiro:.30,bombom:.35,brownie:.35},cas:{brigadeiro:.40,bombom:.45,brownie:.15}};
    var calc=function(){
      var n=Math.max(1,parseInt($('#f-conv').value,10)||1),pp=+$('#f-dur').value,tipo=$('#f-tipo').value,seg=Math.ceil(n*pp*1.1);
      var m=MIX[tipo],qs={},resto=seg;['bombom','brownie'].forEach(function(k){qs[k]=Math.round(seg*m[k]);resto-=qs[k]});qs.brigadeiro=Math.max(0,resto);
      var total=0;Object.keys(qs).forEach(function(k){total+=qs[k]*PRECO[k]});
      $('#f-qtd').textContent=seg+' doces';
      $('#f-mix').innerHTML=['brigadeiro','bombom','brownie'].map(function(k){return '<div class="m"><img src="img/'+FOTO[k]+'.jpg" alt=""><div><b>'+qs[k]+' '+NOME[k].toLowerCase()+'</b><div class="barrinha"><i style="width:'+Math.round(qs[k]/seg*100)+'%"></i></div></div><span>'+money(qs[k]*PRECO[k])+'</span></div>'}).join('');
      $('#f-total').textContent=money(total);$('#f-pp').textContent=money(total/n)+' por convidado';
      var lead=seg<=60?3:seg<=150?5:7,d=new Date();d.setDate(d.getDate()+lead);
      var iso=d.toISOString().slice(0,10);$('#f-data').min=iso;
      $('#f-prazo').textContent='Para esse tamanho de encomenda, o prazo de exemplo é de '+lead+' dias. Data mais próxima: '+d.toLocaleDateString('pt-BR')+'.';
      var dv=$('#f-data').value;$('#f-ok').textContent=dv?(dv>=iso?'Essa data está dentro do prazo. ♥':'Essa data é cedo demais para esse tamanho de encomenda.'):'';
      $('#f-pedido').textContent='Oi, Badulce! Quero encomendar doces para uma festa (demonstração):\n• '+n+' convidados\n• '+qs.brigadeiro+' brigadeiros, '+qs.bombom+' bombons e '+qs.brownie+' brownies ('+seg+' doces)\n'+(dv?'• Data: '+new Date(dv+'T12:00:00').toLocaleDateString('pt-BR')+'\n':'')+'Estimativa: '+money(total)+'\nPode confirmar a data e o valor? 💗';
    };
    ff.addEventListener('input',calc);ff.addEventListener('change',calc);calc();
    $('#f-copia').addEventListener('click',function(){copia($('#f-pedido').textContent,$('#f-copia'),'Copiar pedido')});$('#f-dm').href=URLDM;
  }
})();
