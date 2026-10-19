/* Prática aplicada · aula 10: publicar. Versionar com Git, enviar ao GitHub e colocar o site no ar (simulado). No fim, o resumo do curso com todas as etapas e medalhas. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,Som=PA.Som,P=PA.Partida;
  var term,feitoReq=false;
  var G={init:false,staged:false,msg:'',remote:'',pushed:false,consultas:[]};
  var USER='voce';
  var L=PA.Licao({
    etapa:'deploy',medalha2:'publicação',fim:'site publicado',semPreview:true,manterScript:true,
    brief:function(L){return [['Site',L.T.nome,'endereço final: '+USER+'.github.io/'+L.T.slug+'/'],['Objetivo','Colocar no ar','Git, GitHub e uma hospedagem gratuita'],['Ferramentas','git, curl','todo o caminho do computador até o link público']]},
    cmds:function(L){
      var slug=L.T.slug,url='https://'+USER+'.github.io/'+slug+'/';
      var naPasta=function(S){return S.cwd[S.cwd.length-1]===slug};
      return {
        git:function(tk,r,S){
          var a=(tk[1]&&tk[1].v||'').toLowerCase(),err=function(m){r.erro=true;r.linhas.push(['> '+m,'er'])};
          if(a==='--version'){r.linhas.push(['git version 2.47.0']);return}
          if(!naPasta(S))return err('git: entre na pasta do site antes (cd '+slug+').');
          if(a==='init'){G.init=true;r.linhas.push(['Repositório Git vazio criado em ~/'+slug+'/.git','ok']);return}
          if(!G.init)return err('git: esta pasta ainda não é um repositório. Digite: git init');
          if(a==='add'){if(!tk[2])return err('git add: diga o que adicionar. Para tudo, use: git add .');G.staged=true;r.linhas.push(['Arquivos preparados para o commit (staging).','ok']);return}
          if(a==='commit'){
            var m=-1;for(var i=2;i<tk.length;i++)if(tk[i].v==='-m')m=i+1;
            if(m<0||!tk[m]||!tk[m].v)return err('git commit: falta a mensagem. Exemplo: git commit -m "primeiro site"');
            if(!G.staged)return err('git commit: não há nada preparado. Use antes: git add .');
            G.msg=tk[m].v;G.staged=false;r.linhas.push(['[main (root-commit)] '+G.msg,'ok']);r.linhas.push(['arquivos salvos no histórico do projeto']);return}
          if(a==='remote'){
            var u=tk[4]&&tk[4].v;
            if(!(tk[2]&&tk[2].v==='add'&&tk[3]&&tk[3].v==='origin'&&u))return err('git remote add origin ENDEREÇO: diga o endereço do repositório no GitHub.');
            if(!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\.git$/.test(u))return err('esse endereço não parece de um repositório do GitHub (https://github.com/usuario/nome.git).');
            G.remote=u;r.linhas.push(['Repositório remoto "origin" configurado: '+u,'ok']);return}
          if(a==='push'){
            if(!G.msg)return err('git push: ainda não há commit para enviar. Faça: git commit -m "mensagem"');
            if(!G.remote)return err('git push: falta o repositório remoto. Digite: git remote add origin ENDEREÇO');
            G.pushed=true;['Enviando objetos… 100%','Enviado para '+G.remote,'Branch main publicada. Ative o GitHub Pages em Settings > Pages e o site vai ao ar.'].forEach(function(x){r.linhas.push([x,'ok'])});return}
          if(a==='status'){r.linhas.push([G.pushed?'Tudo enviado: nada a commitar.':G.msg?'Há commits ainda não enviados ao GitHub.':G.staged?'Arquivos preparados, falta o commit.':G.init?'Repositório criado, nada preparado ainda.':'Esta pasta não é um repositório Git.']);return}
          if(a==='log'){r.linhas.push([G.msg?'commit · "'+G.msg+'"':'(nenhum commit ainda)']);return}
          err('git: neste treino existem init, add, commit, remote, push, status e log.');
        },
        curl:function(tk,r){
          var url0='',i=false;for(var k=1;k<tk.length;k++){var v=tk[k].v;if(v==='-I'||v==='--head')i=true;else if(v.charAt(0)!=='-')url0=v}
          G.consultas.push(url0);
          if(!url0){r.erro=true;r.linhas.push(['> curl -I ENDEREÇO','er']);return}
          var ok=G.pushed&&url0.replace(/\/+$/,'').toLowerCase()===url.replace(/\/+$/,'').toLowerCase();
          r.linhas.push(['> HEAD '+url0,'m']);
          if(ok){r.linhas.push(['HTTP 200 OK','ok']);['content-type: text/html; charset=utf-8','server: GitHub.com','strict-transport-security: max-age=31556952','cache-control: max-age=600'].forEach(function(x){r.linhas.push([x])})}
          else{r.linhas.push(['HTTP 404 Not Found','er']);r.linhas.push([G.pushed?'O endereço está diferente do esperado: '+url:'O site ainda não foi enviado para o GitHub.'])}
        },
        nslookup:function(tk,r,S){
          var d=(tk[1]&&tk[1].v||'').toLowerCase(),c=(S.le('~/'+slug+'/CNAME')||'').trim().toLowerCase();
          if(d===USER+'.github.io'){['Nome: '+d,'Endereços: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153'].forEach(function(x){r.linhas.push([x,'ok'])});return}
          if(d&&c===d&&G.pushed){['Nome: '+d,'canonical name = '+USER+'.github.io','(o DNS do seu domínio aponta para o GitHub Pages)'].forEach(function(x){r.linhas.push([x,'ok'])});return}
          r.erro=true;r.linhas.push(['** não encontrei "'+(d||'?')+'" **','er']);r.linhas.push(['Para usar um domínio próprio: crie o arquivo CNAME com o domínio e aponte o DNS dele para o GitHub.'])}
      };
    },
    aoAtualizar:function(L){desenha(L)},
    aoReiniciar:function(){G.init=G.staged=G.pushed=false;G.msg=G.remote='';G.consultas=[]}
  });
  if(!L)return;
  var T=L.T,slug=T.slug,site='https://'+USER+'.github.io/'+slug+'/';
  var cm=function(){return L.sh.cmds};
  /* minitela: endereço do navegador e o site (ou o 404 enquanto não foi publicado) */
  function desenha(L){
    var f=$('#tela'),e=$('#endereco'),ch=$('#estado-pub');if(!f)return;
    if(e)e.textContent=site;
    if(G.pushed){L.sh.preview(L.SITE,f,'',{scripts:false})}
    else f.srcdoc='<body style="margin:0;padding:24px;font:15px system-ui;color:#555;background:#fafafa"><h2 style="margin:0 0 8px;color:#222">404 · site não encontrado</h2><p>Este endereço ainda não existe. Envie o projeto ao GitHub e ative o Pages para ele aparecer aqui.</p></body>';
    if(ch){ch.textContent='';
      [['Código no GitHub',G.pushed],['HTTPS (cadeado)',G.pushed],['Domínio '+USER+'.github.io',G.pushed],['Domínio próprio',(L.sh.le('~/'+slug+'/CNAME')||'').trim().length>3]].forEach(function(x){var s=document.createElement('span');s.className='sel-chip'+(x[1]?' on':'');s.textContent=(x[1]?'✔ ':'○ ')+x[0];ch.appendChild(s)})}
  }
  var dom=function(){return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test((L.arq('CNAME')||'').trim())};
  var passos=[
    {dica:'Passo 1: entre na pasta do site. Digite: cd '+slug,cmd:'cd '+slug,ok:function(S){return S.cwd[S.cwd.length-1]===slug},ex:'Todo o projeto está nesta pasta: HTML, CSS, JavaScript e imagens. É ela que vai para a internet.'},
    {dica:'Passo 2: transforme a pasta em um repositório Git. Digite: git init',cmd:'git init',ok:function(){return G.init},ex:'O Git passa a observar a pasta e a guardar o histórico de cada mudança, como um caderno com todas as versões.'},
    {dica:'Passo 3: escolha o que entra no histórico. Digite: git add .',cmd:'git add .',ok:function(){return G.staged},ex:'O ponto significa "tudo desta pasta". git add prepara os arquivos para o próximo commit.'},
    {dica:'Passo 4: salve uma versão com uma mensagem. Digite: git commit -m "primeiro site"',cmd:'git commit -m "primeiro site"',ok:function(){return !!G.msg},ex:'Um commit é uma foto do projeto neste momento. A mensagem explica o que mudou: escreva pensando em quem vai ler depois.'},
    {dica:'Passo 5: aponte para o seu repositório no GitHub. Digite: git remote add origin https://github.com/'+USER+'/'+slug+'.git',cmd:'git remote add origin https://github.com/'+USER+'/'+slug+'.git',ok:function(){return !!G.remote},ex:'O GitHub é um servidor que guarda projetos Git. "origin" é o apelido do endereço onde você vai enviar.'},
    {dica:'Passo 6: envie o projeto. Digite: git push -u origin main',cmd:'git push -u origin main',ok:function(){return G.pushed},ex:'push envia os commits ao GitHub. Com o Pages ativo, ele publica a pasta como um site: veja a minitela.'},
    {dica:'Passo 7: confira se o site responde na internet. Digite: curl -I '+site,cmd:'curl -I '+site,ok:function(){return G.pushed&&G.consultas.some(function(u){return u.replace(/\/+$/,'').toLowerCase()===site.replace(/\/+$/,'').toLowerCase()})},ex:'200 OK: o servidor do GitHub respondeu. Repare no strict-transport-security: o site é servido por HTTPS, o cadeado do navegador.'},
    {dica:'Bônus 1: reserve um domínio próprio. Digite: echo \'meusite.com.br\' > CNAME',cmd:"echo 'meusite.com.br' > CNAME",bonus:true,ok:function(){return dom()},ex:'O arquivo CNAME diz ao GitHub qual domínio deve abrir este site. Falta apontar o DNS do domínio, que você faz no site onde o registrou.'},
    {dica:'Bônus 2: confira o DNS do domínio. Digite: nslookup meusite.com.br',cmd:'nslookup meusite.com.br',bonus:true,ok:function(){return G.pushed&&dom()&&G.consultas.length>=0&&(L.term&&L.term.hist2===true||false)},ex:'O DNS traduz o nome do domínio para o servidor, como na aula 1.'}
  ];
  /* o bônus 2 é cumprido pelo próprio comando: o shell guarda o último comando */
  passos[8].ok=function(S){var c=(S.cmds[S.cmds.length-1]||'').toLowerCase();return /^nslookup\s+meusite\.com\.br$/.test(c)&&dom()&&G.pushed};
  var REQ=passos.filter(function(x){return !x.bonus}).length;
  function depoisReq(){if(term.passo>=REQ&&!feitoReq){feitoReq=true;$('#concluir').hidden=false;term.lin('> Site no ar! Conclua agora ou faça os bônus para subir a medalha de publicação.','ok')}}
  term=L.terminal(passos,{
    depois:function(txt,r,t){var pa=passos[t.passo];if(pa&&!r.erro&&pa.ok(L.sh,txt)){return t.avanca(pa.ex).then(depoisReq)}},
    fim:function(){fecha()}
  });
  term.lin('> Guia: última etapa. Vamos colocar o site '+T.nome+' no ar.','ok');
  term.lin('> Aqui o Git e o GitHub são simulados, mas os comandos são os de verdade.','m');
  term.dica();term.atualiza();L.atualiza();
  $('#concluir').addEventListener('click',fecha);

  function fecha(){
    var r=L.conclui({bonus:Math.max(0,term.passo-REQ),base:1});if(!r)return;
    var pp=P.get();pp.fim=Date.now();pp.concluida=true;P.grava(pp);
    resumo(pp);
  }
  /* resumo do curso: todas as etapas, tempos e medalhas */
  function resumo(pp){
    var box=$('#curso-fim'),lista=$('#curso-lista');if(!box)return;
    var ET=[['fluxo','Fluxo'],['html','HTML'],['css','CSS'],['resp','Responsivo'],['js','JavaScript'],['api','Backend e API'],['login','Login e segurança'],['deploy','Publicar']];
    lista.textContent='';var tot=0;
    ET.forEach(function(x){
      var e=pp.etapas[x[0]],li=document.createElement('div');li.className='et';
      var n=document.createElement('b');n.textContent=x[1];li.appendChild(n);
      if(e&&e.fim){var ms=(e.ms||0)+(e.pen||0)*1000;tot+=ms;var im=document.createElement('img');im.className='spr';im.src='img/'+P.MEDALHAS[e.nota==null?0:e.nota]+'.png';im.width=im.height=40;im.alt='';im.style.display='inline-block';li.insertBefore(im,n);var t=document.createElement('span');t.textContent=P.fmt(ms);li.appendChild(t)}
      else{var t2=document.createElement('span');t2.textContent='não feita';li.appendChild(t2);li.style.opacity='.55'}
      lista.appendChild(li)});
    $('#curso-total').textContent=P.fmt(tot);box.hidden=false;box.classList.add('on');
  }
})();
