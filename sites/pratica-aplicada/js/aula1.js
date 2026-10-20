/* CodeHome · aula 1: como um site funciona. O terminal é de mentira; o simulador mostra o caminho de um pedido: navegador → catálogo de endereços (DNS) → servidor → resposta. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,$$=PA.$$,Som=PA.Som;
  var estado={aberto:false};

  /* ---------- a "padaria.com" de mentira ---------- */
  var PAGINAS={
    '/':{t:'Padaria do Zé',p:['Pão quente toda manhã, do forno para a sua mesa.'],bytes:412},
    '/cardapio':{t:'Cardápio',l:['Pão francês · R$ 0,80','Pão de queijo · R$ 4,00','Bolo de milho · R$ 9,00'],bytes:538},
    '/contato':{t:'Contato',p:['Rua das Flores, 120','Todos os dias, das 6h às 19h'],bytes:476}
  };
  var els={
    nos:{nav:$('#no-nav'),dns:$('#no-dns'),srv:$('#no-srv')},pacote:$('#pacote'),legenda:$('#legenda'),end:$('#end'),status:$('#status'),pagina:$('#pagina'),resp:$('#resp')
  };
  var POS={nav:'16.67%',dns:'50%',srv:'83.33%'};
  function espera(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function ativa(){Object.keys(els.nos).forEach(function(k){els.nos[k].classList.remove('ativo')});Array.prototype.slice.call(arguments).forEach(function(k){els.nos[k].classList.add('ativo')})}
  function mover(de,para,cl){
    var p=els.pacote;p.className='pacote'+(cl?' '+cl:'');p.style.transition='none';p.style.left='calc('+POS[de]+' - 20px)';void p.offsetWidth;p.classList.add('ver');
    p.style.transition='';p.style.left='calc('+POS[para]+' - 20px)';return espera(580);
  }
  function leg(txt){els.legenda.textContent=txt}
  function resp(partes){ /* partes: [[classe,texto],...] sem HTML do usuário */
    els.resp.textContent='';partes.forEach(function(x){var s=document.createElement('span');if(x[0])s.className=x[0];s.textContent=x[1];els.resp.appendChild(s)});
  }
  function desenha(caminho,achou,def){
    var d=els.pagina;d.textContent='';
    var pg=PAGINAS[caminho];
    if(achou&&pg){var h=document.createElement('h4');h.textContent=pg.t;d.appendChild(h);
      (pg.p||[]).forEach(function(x){var p=document.createElement('p');p.textContent=x;d.appendChild(p)});
      if(pg.l){var u=document.createElement('ul');pg.l.forEach(function(x){var li=document.createElement('li');li.textContent=x;u.appendChild(li)});d.appendChild(u)}}
    else{var h4=document.createElement('h4');h4.textContent='Página não encontrada';d.appendChild(h4);var p2=document.createElement('p');p2.textContent='O servidor não tem nada em "'+caminho+'".';d.appendChild(p2)}
    els.end.textContent='padaria.com'+(caminho==='/'?'':caminho);
    els.status.textContent=achou?'200 OK':'404 não encontrada';els.status.className=achou?'em200':'em404';
  }
  function norm(c){c=String(c||'').trim().toLowerCase().replace(/[^a-z0-9\/_-]/g,'');if(c.charAt(0)!=='/')c='/'+c;if(c.length>1&&c.charAt(c.length-1)==='/')c=c.slice(0,-1);return c.slice(0,40)}

  /* ---------- os dois trechos da viagem ---------- */
  function procuraEndereco(t,nome,existe){
    t.lin('> procurando "'+nome+'" no catálogo de endereços…','m');
    ativa('nav','dns');leg('1) Seu navegador não sabe onde "'+nome+'" fica. Ele pergunta ao catálogo de endereços da internet (o DNS).');
    resp([['k','PERGUNTA\n'],['','  onde mora '+nome+'?']]);Som.envia();
    return mover('nav','dns').then(function(){
      if(!existe){Som.erro();els.pacote.classList.add('erro');resp([['k','RESPOSTA\n'],['e','  não conheço esse endereço']]);leg('O catálogo não conhece esse endereço. Por isso a página não abre: confira se digitou certo.');t.lin('> endereço não encontrado','er');ativa('nav');return false}
      Som.recebe();ativa('dns','nav');return mover('dns','nav','volta').then(function(){
        resp([['k','RESPOSTA\n'],['t','  '+nome+' mora em 203.0.113.7']]);leg('2) O catálogo responde com um número: o endereço do servidor, chamado de IP. É como o CEP da casa.');t.lin('> endereço encontrado: 203.0.113.7','ok');return espera(700).then(function(){return true})
      });
    });
  }
  function pede(t,caminho,passoTxt){
    var c=norm(caminho),pg=PAGINAS[c],achou=!!pg;
    t.lin('> pedindo '+c+' ao servidor…','m');
    ativa('nav','srv');leg(passoTxt+' O navegador bate na porta do servidor e pede a página "'+c+'".');
    resp([['k','PEDIDO\n'],['','  GET '+c+' HTTP/1.1\n  Host: padaria.com']]);Som.envia();
    return mover('nav','srv').then(function(){
      ativa('srv');leg('O servidor procura a página e monta a resposta…');return espera(500);
    }).then(function(){
      Som.recebe();if(!achou)Som.erro();ativa('srv','nav');
      resp(achou?[['k','RESPOSTA\n'],['t','  200 OK'],['','  ('+pg.bytes+' bytes de HTML)\n  <h1>'+pg.t+'</h1> …']]:[['k','RESPOSTA\n'],['e','  404 Não encontrada'],['','\n  o servidor não tem essa página']]);
      return mover('srv','nav',achou?'volta':'erro');
    }).then(function(){
      desenha(c,achou);ativa('nav');
      leg(achou?'O navegador recebeu o HTML e desenhou a página. "200 OK" quer dizer: deu certo.':'"404" quer dizer: o servidor respondeu, mas essa página não existe. O site está de pé; só o caminho está errado.');
      t.lin(achou?'> 200 OK · '+pg.bytes+' bytes · página desenhada':'> 404 · o servidor não tem '+c,achou?'ok':'er');
      return achou;
    });
  }

  /* ---------- glossário que vai se abrindo ---------- */
  function abre(){Array.prototype.slice.call(arguments).forEach(function(k,i){var c=$('.carta[data-k="'+k+'"]');if(c&&!c.classList.contains('aberta')){setTimeout(function(){c.classList.remove('trava');c.classList.add('aberta','nova');Som.carta()},i*260)}})}

  /* ---------- passos ---------- */
  var passos=[
    {dica:'Passo 1: digite o endereço de um site, como faz no navegador. Digite: abrir padaria.com',cmd:PA.I18n.t('abrir padaria.com'),aceita:/^(?:abrir|open)\s+(https?:\/\/)?(www\.)?padaria\.com(\.br)?\/?$/i,
     roda:function(m,t){return procuraEndereco(t,'padaria.com',true).then(function(){return pede(t,'/','3)')}).then(function(){estado.aberto=true;abre('navegador','servidor','endereco')})}},
    {dica:'Passo 2: agora peça outra página do mesmo site. Digite: pedir /cardapio',cmd:PA.I18n.t('pedir /cardapio'),aceita:/^(?:pedir|get)\s+\/?cardapio\/?$/i,
     roda:function(m,t){return pede(t,'/cardapio','Agora o navegador já sabe o endereço, então vai direto ao servidor.').then(function(){abre('pedido')})}},
    {dica:'Passo 3: peça uma página que o servidor NÃO tem, para ver um erro de verdade. Digite: pedir /pizza',cmd:PA.I18n.t('pedir /pizza'),aceita:/^(?:pedir|get)\s+\/?(?!(?:cardapio|contato)\/?$)[a-z0-9_-]+\/?$/i,
     roda:function(m,t){return pede(t,m[0].replace(/^(?:pedir|get)\s+/i,''),'Vamos testar o erro.').then(function(){abre('status')})}},
    {dica:'Desafio: sem exemplo desta vez. Peça a página de contato da padaria.',cmd:PA.I18n.t('pedir /contato'),aceita:/^(?:pedir|get)\s+\/?contato\/?$/i,
     roda:function(m,t){return pede(t,'/contato','Você sabe o caminho!').then(function(){abre('html')})}}
  ];

  var term=PA.Terminal({
    term:$('#term'),input:$('#cmd'),chips:$('#chips'),progresso:$('#prog'),enviar:$('#enviar'),passos:passos,
    persist:{id:'aula1',pid:'1',extra:{salva:function(){return {aberto:estado.aberto,cartas:$$('.carta.aberta').map(function(c){return c.dataset.k})}},
      carrega:function(o){estado.aberto=!!o.aberto;(o.cartas||[]).forEach(function(k){var c=$('.carta[data-k="'+k+'"]');if(c){c.classList.remove('trava');c.classList.add('aberta')}})}},
      depois:function(t){if(t.passo>=passos.length){var f=$('#fim');if(f)f.classList.add('on')}}},
    /* explorar: comandos fora do passo também funcionam, como num terminal de verdade */
    extra:function(txt,t,casou){
      if(casou)return false;
      var a=txt.match(/^(?:abrir|open)\s+(\S+)/i),p=txt.match(/^(?:pedir|get)\s+(\S+)/i);
      if(a){var nome=a[1].toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');return procuraEndereco(t,nome.slice(0,30),false).then(function(){return true})}
      if(p){if(!estado.aberto){t.lin('> Primeiro abra o endereço, como no navegador: abrir padaria.com','d');Som.erro();return true}return pede(t,p[1],'Explorando!').then(function(){return true})}
      return false;
    },
    fim:function(t){
      var f=$('#fim');f.classList.add('on');PA.Arm.grava('aula1',true);Som.selo();setTimeout(function(){f.scrollIntoView({behavior:'smooth',block:'center'})},300);
    }
  });
  term.lin('> Guia: bem-vinda(o) ao laboratório! Aqui você digita e vê o caminho que um pedido faz até um site.','ok');
  term.lin('> Dica: "dica" rever o passo · "mostra" eu digito por você · setas ↑ ↓ repetem comandos.','m');
  term.dica();term.atualiza();
  desenha('/',true);els.status.textContent='—';els.status.className='';els.end.textContent='digite um endereço';els.pagina.innerHTML='<p class="vazio">A página aparece aqui quando o servidor responder.</p>';
  if(PA.Arm.le('aula1',false)){$('#ja').hidden=false}
})();
