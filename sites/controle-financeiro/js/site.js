/* Controle Financeiro Privado · site: demonstrações (valores e regras simplificados do app) */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
  var num=function(el){var v=parseFloat(String(el.value).replace(',','.'));return isFinite(v)?v:0};
  var money=function(v){return BRL.format(v)};

  /* ---------- baixar: o botão só libera depois do aceite do termo ---------- */
  var ac=$('#aceite');
  if(ac){
    var apk=$('#apk'),av=$('#aviso');
    var sync=function(){var ok=ac.checked;apk.setAttribute('aria-disabled',ok?'false':'true');if(ok){apk.href=apk.dataset.href;av.hidden=true}else{apk.href='#termo'}};
    ac.addEventListener('change',sync);sync();
    apk.addEventListener('click',function(e){if(apk.getAttribute('aria-disabled')==='true'){e.preventDefault();av.hidden=false;ac.focus()}});
  }

  /* ---------- sete visuais ---------- */
  var mock=$('#mock');
  if(mock){
    var nomes={tecnico:'Técnico',cute:'Cute',y2k:'Y2K',pc:'PC antigo',min:'Minimalista',bpx:'Blackpixel RPG',px:'Pixel art'};
    $$('.visuais button').forEach(function(b){b.addEventListener('click',function(){
      $$('.visuais button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
      mock.dataset.v=b.dataset.v;$('#mock-nome').textContent=nomes[b.dataset.v];
      $('#mock-so').hidden=(b.dataset.v!=='px');
    })});
  }

  /* ---------- abas das ferramentas ---------- */
  var abas=$$('.abas [role=tab]');
  abas.forEach(function(b){b.addEventListener('click',function(){
    abas.forEach(function(x){x.setAttribute('aria-selected',x===b);$('#'+x.getAttribute('aria-controls')).hidden=(x!==b)});
    history.replaceState(null,'','#'+b.dataset.id);
  })});
  if(abas.length){var h=location.hash.slice(1),alvo=abas.filter(function(b){return b.dataset.id===h})[0];if(alvo)alvo.click()}

  /* ---------- E se eu comprar? ---------- */
  var fc=$('#f-compra');
  if(fc){
    var calcCompra=function(){
      var S=num($('#c-saldo')),R=num($('#c-renda')),G=num($('#c-fixos')),V=num($('#c-valor')),N=Math.max(1,Math.round(num($('#c-parc'))||1)),i=num($('#c-juros'))/100;
      var P=N===1?V:(i>0?V*i/(1-Math.pow(1+i,-N)):V/N);
      var total=N===1?V:P*N,meses=Math.max(6,N+1),mi=0,menor=Infinity,negMes=null,linhas=[];
      for(var m=0;m<=meses;m++){
        var base=S+m*(R-G),com=base;
        if(N===1)com-=V;else com-=P*Math.min(m,N);
        linhas.push({m:m,base:base,com:com});
        if(com<menor){menor=com;mi=m}
        if(com<0&&negMes===null)negMes=m;
      }
      var max=Math.max.apply(null,linhas.map(function(l){return Math.max(Math.abs(l.com),1)}));
      $('#c-parcela').textContent=N===1?'à vista':N+'x de '+money(P);
      $('#c-total').textContent=money(total);
      $('#c-juroscusto').textContent=money(total-V);
      $('#c-menor').textContent=money(menor)+' (mês '+mi+')';
      $('#c-meses').innerHTML=linhas.map(function(l){var h=Math.max(3,Math.round(Math.abs(l.com)/max*118));return '<div title="mês '+l.m+': '+money(l.com)+'"><i class="'+(l.com<0?'neg':'')+'" style="height:'+h+'px"></i>'+l.m+'</div>'}).join('');
      var v=$('#c-veredito');
      if(negMes!==null){v.className='veredito ruim';v.textContent='Cuidado: com essa compra o seu saldo fica negativo no mês '+negMes+'. Dá para diminuir o valor, aumentar as parcelas ou esperar juntar mais.'}
      else if(menor<S*0.2){v.className='veredito meh';v.textContent='Dá, mas o saldo chega a ficar bem baixo ('+money(menor)+'). Vale esperar um mês e comparar de novo.'}
      else{v.className='veredito ok';v.textContent='Cabe no seu mês: o saldo mais baixo seria '+money(menor)+'. Mesmo assim, espere um dia antes de decidir.'}
    };
    fc.addEventListener('input',calcCompra);calcCompra();
  }

  /* ---------- Vale a pena esta corrida? ---------- */
  var fr=$('#f-corrida');
  if(fr){
    var calcCorrida=function(){
      var val=num($('#r-valor')),km=num($('#r-km')),min=num($('#r-min')),cons=num($('#r-cons')),lit=num($('#r-lit')),des=num($('#r-des')),meta=num($('#r-meta'));
      var comb=cons>0?km/cons*lit:0,desg=km*des,lucro=val-comb-desg,porKm=km>0?lucro/km:0,porH=min>0?lucro/(min/60):0;
      $('#r-comb').textContent=money(comb);$('#r-desg').textContent=money(desg);$('#r-lucro').textContent=money(lucro);
      $('#r-km2').textContent=money(porKm);$('#r-h').textContent=money(porH);
      var v=$('#r-veredito');
      if(porH>=meta){v.className='veredito ok';v.textContent='Vale a pena: rende '+money(porH)+' por hora, acima da sua meta de '+money(meta)+'.'}
      else if(porH>=meta*0.7){v.className='veredito meh';v.textContent='Quase: rende '+money(porH)+' por hora. Só aceite se não tiver nada melhor por perto.'}
      else{v.className='veredito ruim';v.textContent='Não compensa: '+money(porH)+' por hora, bem abaixo da meta de '+money(meta)+'.'}
    };
    fr.addEventListener('input',calcCorrida);calcCorrida();
  }

  /* ---------- Quanto cobrar pela hora? ---------- */
  var fh=$('#f-hora');
  if(fh){
    var calcHora=function(){
      var renda=num($('#h-renda')),custos=num($('#h-custos')),horas=Math.max(1,num($('#h-horas'))),imp=Math.min(60,num($('#h-imp')))/100,proj=num($('#h-proj')),marg=num($('#h-marg'))/100;
      var hora=(renda+custos)/(1-imp)/horas,preco=hora*proj*(1+marg);
      $('#h-hora').textContent=money(hora);$('#h-dia').textContent=money(hora*8);$('#h-proj2').textContent=money(preco);
      $('#h-ent').textContent=money(preco/2);
    };
    fh.addEventListener('input',calcHora);calcHora();
  }

  /* ---------- aventura de RPG (regras do modo educativo) ---------- */
  var J=$('#jogo');
  if(J){
    var LIM=[0,30,80,150,250,400,600,850,1150,1500];
    var TIT=['Aprendiz de Moedas','Escudeiro Poupador','Cavaleiro da Paciência','Mago do Orçamento','Guardião do Cofre','Caçador de Ofertas Espertas','Estrategista do Reino','Mestre das Metas','Sábio do Tesouro','Lenda do Reino das Moedas'];
    var BIXOS={'onca-pintada':'Onça-pintada','capivara':'Capivara','mico-leao-dourado':'Mico-leão-dourado','arara-azul':'Arara-azul','coruja':'Coruja','sabia':'Sabiá','tatu':'Tatu','lobo-guara':'Lobo-guará'};
    var CASAS=[['Cabeça','chapeu',2,1,4],['Mão','mao',1,1,2],['Escudo','escudo',2,3,3],['Amuleto','amuleto',3,10,6],['Corpo','corpo',2,6,5],['Bolsa','bolsa',2,3,7]];
    var CHEFES=[['Duende da Árvore de Dinheiro','acha que dinheiro nasce em árvore'],['Hidra dos Três Potinhos','mistura gastar, guardar e doar'],['Goblin do Quero-Já','quer tudo agora'],['Dragão da Pressa','compra sem pensar'],['Golem do Cofre Parado','esquece o dinheiro parado'],['Mercador Esperto Demais','só fala do desconto'],['Fantasma do Gasto Esquecido','gasta e não anota'],['Raposa Golpista','promete lucro fácil'],['Esfinge do Plano','pergunta pelo seu plano']];
    var PERG=[
      ['Você ganhou R$ 50 de mesada. O que o Oráculo recomenda?','Separar uma parte para guardar e outra para gastar',['Gastar tudo hoje','Esconder e nunca usar'],'Dividir em potinhos (gastar, guardar, doar) é o começo de todo plano.'],
      ['Um tênis custa R$ 200 e você tem R$ 80. Qual a melhor ideia?','Guardar um pouco por semana até juntar',['Pedir emprestado e esquecer de pagar','Comprar outro bem mais caro'],'Juntar pouco a pouco realiza sonhos grandes, e esperar deixa você escolher melhor.'],
      ['Por que esperar uma semana antes de comprar algo caro?','Para ter certeza de que ainda quero',['Porque o preço sempre cai','Porque a loja vai fechar'],'Muita vontade passa. Quem espera compra só o que realmente quer.'],
      ['Doar um pouco do que você tem é…','Também uma forma de usar bem o dinheiro',['Perder dinheiro à toa','Coisa só de adulto'],'Dividir com quem precisa também faz parte de cuidar do dinheiro.'],
      ['De onde vem o dinheiro?','Do esforço e do trabalho de alguém',['Das árvores','De máquinas que nunca acabam'],'Dinheiro vem de trabalho. Por isso a tarefa aprovada rende XP.']
    ];
    var FEITOS=[
      {id:'tarefa',nome:'Tarefa aprovada pelos pais',xp:20,dia:1,txt:'Dinheiro vem do esforço.'},
      {id:'meta',nome:'Meta realizada',xp:40,dia:0,txt:'Juntar pouco a pouco realiza sonhos grandes.'},
      {id:'doa',nome:'Doação (1 vez por dia)',xp:15,dia:1,txt:'Dividir também é usar bem o dinheiro.'},
      {id:'colecao',nome:'Coleção completa',xp:60,dia:0,txt:'Paciência rende.'}
    ];
    var LOJA=[['Chapéu de explorador','chapeu'],['Escudo de madeira','escudo'],['Anel dourado','amuleto']];
    var S={xp:0,bixo:'onca-pintada',feitos:{},dia:0,diaF:{},orac:null,log:[]};
    var nivel=function(){var n=1;for(var i=0;i<LIM.length;i++)if(S.xp>=LIM[i])n=i+1;return n};
    var poder=function(){var n=nivel(),p=n*2;CASAS.forEach(function(c){if(n>=c[4])p+=c[3]});return p};
    var diario=function(t,xp){S.log.unshift({t:t,xp:xp});S.log=S.log.slice(0,40)};
    var ganha=function(xp,t){var antes=nivel();S.xp+=xp;diario(t,xp);if(nivel()>antes)diario('Subiu para o nível '+nivel()+': '+TIT[nivel()-1]+'!',0);desenha()};
    var chave=function(f){return f.dia?f.id+':'+S.dia:f.id};
    function desenha(){
      var n=nivel(),ini=LIM[n-1],fim=n<10?LIM[n]:LIM[9],pct=n<10?(S.xp-ini)/(fim-ini)*100:100;
      $('#j-nome').textContent=BIXOS[S.bixo];$('#j-av').src='img/'+S.bixo+'.png';
      $('#j-nivel').textContent='Nível '+n+' · '+TIT[n-1];
      $('#j-xp').textContent=S.xp+' XP'+(n<10?' · faltam '+(fim-S.xp)+' para o nível '+(n+1):' · nível máximo');
      $('#j-barra').style.width=pct+'%';$('#j-poder').textContent='Poder '+poder();
      $$('#j-escolha button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.b===S.bixo)});
      $('#j-casas').innerHTML=CASAS.map(function(c){var on=n>=c[4];return '<div class="casa'+(on?'':' trava')+'" title="'+c[0]+(on?'':' (nível '+c[4]+')')+'"><img src="img/item_'+c[1]+'.png" alt="'+c[0]+'"><small>'+c[0]+'</small></div>'}).join('');
      $$('#j-feitos .feito').forEach(function(b){var f=FEITOS.filter(function(x){return x.id===b.dataset.id})[0];b.disabled=!!S.feitos[chave(f)]});
      $$('#j-chefes button').forEach(function(b){b.disabled=!!S.feitos['chefe:'+b.dataset.i]});
      $$('#j-loja button').forEach(function(b){b.disabled=!!S.feitos['loja:'+b.dataset.i]});
      $('#j-diario').innerHTML=S.log.length?S.log.map(function(l){return '<li>'+(l.xp?'<b>+'+l.xp+' XP</b> ':'')+l.t+'</li>'}).join(''):'<li>Nada ainda. Faça um feito para começar a aventura.</li>';
      $('#j-dia').textContent='Dia '+(S.dia+1);
    }
    function oraculo(){
      var q=PERG[S.dia%PERG.length],pos=(S.dia*2+1)%3,ord=[],outros=q[2].slice();
      for(var i=0;i<3;i++)ord[i]=(i===pos)?q[1]:outros.shift();   // a resposta certa muda de lugar a cada dia
      $('#o-q').textContent=q[0];$('#o-exp').textContent='';
      $('#o-op').innerHTML=ord.map(function(o){return '<button type="button" data-ok="'+(o===q[1])+'"'+(S.diaF['oraculo:'+S.dia]?' disabled':'')+'>'+o+'</button>'}).join('');
      $$('#o-op button').forEach(function(b){b.addEventListener('click',function(){
        if(S.diaF['oraculo:'+S.dia])return;S.diaF['oraculo:'+S.dia]=1;
        var ok=b.dataset.ok==='true';$('#o-exp').textContent=(ok?'Acertou! ':'Quase! ')+q[3];
        $$('#o-op button').forEach(function(x){x.disabled=true});
        ganha(ok?5:1,'Oráculo: '+(ok?'acertou':'errou, e aprendeu mesmo assim')+'.');
      })});
    }
    $('#j-feitos').innerHTML=FEITOS.map(function(f){return '<button type="button" class="feito" data-id="'+f.id+'"><span>'+f.nome+'<small>'+f.txt+(f.dia?' Rende 1 vez por dia.':' Rende 1 vez só.')+'</small></span><b>+'+f.xp+' XP</b></button>'}).join('');
    $('#j-feitos').addEventListener('click',function(e){var b=e.target.closest('.feito');if(!b||b.disabled)return;var f=FEITOS.filter(function(x){return x.id===b.dataset.id})[0];S.feitos[chave(f)]=1;ganha(f.xp,f.nome+'. '+f.txt)});
    $('#j-chefes').innerHTML=CHEFES.map(function(c,i){return '<li><button type="button" class="feito" data-i="'+i+'"><span>'+c[0]+'<small>'+c[1]+'</small></span><b>+15 XP</b></button></li>'}).join('');
    $('#j-chefes').addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;S.feitos['chefe:'+b.dataset.i]=1;ganha(15,'Derrotou '+CHEFES[b.dataset.i][0]+' no duelo da lição.')});
    $('#j-loja').innerHTML=LOJA.map(function(it,i){return '<div class="pnl" style="padding:14px"><img src="img/item_'+it[1]+'.png" alt="" width="48" height="48" style="image-rendering:pixelated;margin-bottom:8px"><h3 style="font-size:1.05rem;margin-bottom:10px">'+it[0]+'</h3><div style="display:grid;gap:8px"><button type="button" class="feito" data-i="'+i+'" data-k="plan"><span>Estava na lista de desejos</span><b>+25 XP</b></button><button type="button" class="feito" data-i="'+i+'" data-k="hora"><span>Comprei na hora</span><b>+5 XP</b></button></div></div>'}).join('');
    $('#j-loja').addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;var i=b.dataset.i;if(S.feitos['loja:'+i])return;S.feitos['loja:'+i]=1;
      if(b.dataset.k==='plan')ganha(25,'Comprou '+LOJA[i][0]+' depois de esperar e planejar. O jogo premia quem espera.');else ganha(5,'Comprou '+LOJA[i][0]+' na hora. Toda compra é uma escolha.')});
    $('#j-escolha').innerHTML=Object.keys(BIXOS).map(function(k){return '<button type="button" data-b="'+k+'" aria-label="'+BIXOS[k]+'" title="'+BIXOS[k]+'"><img src="img/'+k+'.png" alt=""></button>'}).join('');
    $('#j-escolha').addEventListener('click',function(e){var b=e.target.closest('button');if(b){S.bixo=b.dataset.b;desenha()}});
    $('#j-novo').addEventListener('click',function(){S.dia++;diario('Amanhecer: um novo dia começa. Tarefa, doação e Oráculo voltam a render.',0);desenha();oraculo()});
    $('#j-zera').addEventListener('click',function(){var b=S.bixo;S={xp:0,bixo:b,feitos:{},dia:0,diaF:{},orac:null,log:[]};desenha();oraculo()});
    desenha();oraculo();
  }
})();
