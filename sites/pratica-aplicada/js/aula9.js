/* Prática aplicada · aula 9: login e segurança. Cadastro com e-mail e senha, hash, login por token, XSS e injeção de SQL num servidor de mentira.
   A minitela mostra a página do site e o painel mostra o "banco de dados". Tudo simulado no navegador. */
(function(){
  'use strict';
  var PA=window.PA,$=PA.$,Som=PA.Som,P=PA.Partida;
  var term,serv,feitoReq=false;
  var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var L=PA.Licao({
    etapa:'login',medalha2:'segurança',fim:'login e segurança concluídos',semPreview:true,
    brief:function(L){return [['Site',L.T.nome,'caminho: '+L.T.caminho],['Objetivo','Proteger o acesso','login com e-mail e senha, sem guardar a senha'],['Ferramenta','curl e servidor de mentira','tudo simulado no navegador']]},
    cmds:function(L){serv=PA.Servidor(L.T);
      return {curl:PA.curl(serv),
        servidor:function(tk,r){
          var a=(tk[1]&&tk[1].v||'estado').toLowerCase();
          if(a==='seguro'){serv.modo='seguro';serv.idxSeguro=(serv.hist||[]).length;r.linhas.push(['> Defesas ligadas: consultas com parâmetros e texto dos usuários escapado na página.','ok'])}
          else if(a==='inseguro'){serv.modo='inseguro';r.linhas.push(['> Defesas desligadas (só para estudo!).','er'])}
          else r.linhas.push(['> Modo atual do servidor: '+serv.modo,'m']);
        }}},
    aoAtualizar:function(L){desenha(L)},aoReiniciar:function(){if(serv)serv.zera()}
  });
  if(!L)return;
  var T=L.T;
  var h=function(met,pre,st){return (serv.hist||[]).some(function(x){return x.met===met&&x.url.indexOf(pre)===0&&(st==null||x.status===st)})};
  var inj=function(x){return x.url.indexOf("'1'='1")>=0&&x.status===200};

  /* ---------- minitela: a página do site com o estado do servidor ---------- */
  function desenha(L){
    var f=$('#tela');if(!f||!serv)return;
    var email=serv.tokens[serv.ultimoToken],pgs=L.p.fluxo.map(function(id){return T.paginas.filter(function(x){return x.id===id})[0].n});
    var perigoso=function(t){return /<\s*script|on\w+\s*=|javascript:/i.test(t)};
    var mural=serv.comentarios.map(function(c){
      if(serv.modo==='seguro')return '<div class="c">'+esc(c.texto)+'</div>';
      return '<div class="c">'+(perigoso(c.texto)?'<div class="al">⚠ Este comentário executaria código no navegador de quem abrisse a página (XSS). Aqui está bloqueado pela simulação.</div>':'')+'<code>'+esc(c.texto)+'</code></div>'}).join('')||'<div class="vz">Nenhum comentário ainda.</div>';
    f.srcdoc='<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:14px;font:14px system-ui,sans-serif;color:#1a1a1a;background:#fff}h1{font-size:1.3rem;margin:0 0 6px}nav a{display:inline-block;background:#eef3ff;color:#2563eb;padding:5px 10px;border-radius:6px;margin:0 4px 6px 0;font-size:.8rem}.cx{border:1px solid #cfd8f0;border-radius:8px;padding:10px;margin:10px 0}.st{font-weight:700}.ok{color:#0a6b48}.no{color:#b3261e}.c{border-top:1px dashed #cfd8f0;padding:6px 0;word-break:break-word}.al{background:#fde7e5;color:#b3261e;border-radius:6px;padding:6px;margin-bottom:4px;font-size:.8rem}code{background:#f1f3f9;padding:1px 4px;border-radius:4px}.vz{color:#888}.modo{font:700 .7rem monospace;padding:2px 8px;border-radius:99px;background:'+(serv.modo==='seguro'?'#d9f5e6;color:#0a6b48':'#fde7e5;color:#b3261e')+'}</style>'+
      '<h1>'+esc(T.nome)+'</h1><nav>'+pgs.map(function(n){return '<a>'+esc(n)+'</a>'}).join('')+'</nav>'+
      '<div class="cx"><div class="st">Entrar</div>'+(email?'<div class="ok">Conectada: '+esc(email)+'</div><div style="font-size:.8rem;color:#555">token: '+esc(serv.ultimoToken.slice(0,10))+'…</div>':'<div class="no">Visitante · não está conectado</div>')+'</div>'+
      '<div class="cx"><div class="st">Mural de comentários <span class="modo">servidor '+serv.modo+'</span></div>'+mural+'</div>';
    var b=$('#banco');b.textContent='';
    var t=function(tag,cl,txt,pai){var e=document.createElement(tag);if(cl)e.className=cl;if(txt!=null)e.textContent=txt;(pai||b).appendChild(e);return e};
    if(!serv.usuarios.length){t('p','vz','A tabela de usuários está vazia. Faça um cadastro com o curl para ver como a senha é guardada.')}
    serv.usuarios.forEach(function(u){
      var c=t('div','linha-bd');t('b',null,u.email,c);
      var ruim=t('div','bd-ruim',null,c);t('small',null,'Como NÃO guardar: senha em texto puro',ruim);t('code',null,u.puro,ruim);
      var bom=t('div','bd-bom',null,c);t('small',null,'Como guardar: sal + hash (impossível de reverter)',bom);t('code',null,'sal '+u.sal+' · hash '+u.hash.slice(0,24)+'…',bom);
    });
    var rodape=t('p','vz','Banco de dados: '+serv.usuarios.length+' usuário(s) · '+serv.comentarios.length+' comentário(s) · servidor '+serv.modo+'.');
  }

  var passos=[
    {dica:'Passo 1: tente criar uma conta com senha fraca. Digite: curl -X POST /api/cadastro -d \'{"email":"ana@exemplo.com","senha":"123"}\'',cmd:"curl -X POST /api/cadastro -d '{\"email\":\"ana@exemplo.com\",\"senha\":\"123\"}'",ok:function(){return h('POST','/api/cadastro',422)},ex:'O servidor recusou (422): senha curta demais. Validar a senha no servidor evita que as pessoas usem "123".'},
    {dica:'Passo 2: crie a conta com uma senha forte. Digite: curl -X POST /api/cadastro -d \'{"email":"ana@exemplo.com","senha":"Cafe-com-leite-42"}\'',cmd:"curl -X POST /api/cadastro -d '{\"email\":\"ana@exemplo.com\",\"senha\":\"Cafe-com-leite-42\"}'",ok:function(){return h('POST','/api/cadastro',201)},ex:'Olhe o painel do banco de dados: o servidor nunca guarda a senha, só o hash dela com um sal aleatório. Se o banco vazar, as senhas não vazam junto.'},
    {dica:'Passo 3: tente entrar com a senha errada. Digite: curl -X POST /api/login -d \'{"email":"ana@exemplo.com","senha":"errada123"}\'',cmd:"curl -X POST /api/login -d '{\"email\":\"ana@exemplo.com\",\"senha\":\"errada123\"}'",ok:function(){return h('POST','/api/login',401)},ex:'401 quer dizer "não autorizado". Repare que a mensagem não diz se o e-mail ou a senha estava errado: isso não ajuda quem tenta invadir.'},
    {dica:'Passo 4: entre com a senha certa. Digite: curl -X POST /api/login -d \'{"email":"ana@exemplo.com","senha":"Cafe-com-leite-42"}\'',cmd:"curl -X POST /api/login -d '{\"email\":\"ana@exemplo.com\",\"senha\":\"Cafe-com-leite-42\"}'",ok:function(){return h('POST','/api/login',200)},ex:'O servidor devolveu um token: uma senha temporária e aleatória. A pessoa envia o token nas próximas requisições, em vez de mandar a senha toda vez.'},
    {dica:'Passo 5: peça o perfil sem estar conectado. Digite: curl /api/perfil',cmd:'curl /api/perfil',ok:function(){return h('GET','/api/perfil',401)},ex:'Sem token, o servidor nega o acesso. Páginas privadas precisam dessa checagem no servidor, não só um botão escondido no site.'},
    {dica:'Passo 6: peça o perfil com o token. Digite: curl -H "Authorization: Bearer $TOKEN" /api/perfil',cmd:'curl -H "Authorization: Bearer $TOKEN" /api/perfil',ok:function(){return h('GET','/api/perfil',200)},ex:'Agora o servidor reconhece quem você é. O $TOKEN é trocado pelo token real que o login devolveu. Veja o site na minitela: conectada.'},
    {dica:'Passo 7: envie um comentário malicioso (XSS). Digite: curl -X POST /api/comentarios -d \'{"texto":"<img src=x onerror=alert(1)>"}\'',cmd:"curl -X POST /api/comentarios -d '{\"texto\":\"<img src=x onerror=alert(1)>\"}'",ok:function(){return h('POST','/api/comentarios',201)&&serv.comentarios.some(function(c){return /</.test(c.texto)})},ex:'Veja o alerta na minitela. XSS acontece quando o site mostra texto de usuários como se fosse HTML: o código de um visitante rodaria no navegador de todos os outros.'},
    {dica:'Passo 8: teste uma injeção de SQL na busca. Digite: curl "/api/produtos?busca=\' OR \'1\'=\'1"',cmd:"curl \"/api/produtos?busca=' OR '1'='1\"",ok:function(){return (serv.hist||[]).some(inj)&&(serv.idxSeguro==null)},ex:'Repare no SQL montado: o texto digitado virou parte do comando e a busca devolveu tudo. É por isso que nunca se junta texto de usuário dentro de uma consulta.'},
    {dica:'Passo 9: ligue as defesas do servidor. Digite: servidor seguro',cmd:'servidor seguro',ok:function(){return serv.modo==='seguro'},ex:'Agora o servidor usa consultas com parâmetros (o ? no SQL) e a página escapa o texto dos usuários. Veja o mural na minitela: o comentário virou texto comum.'},
    {dica:'Passo 10: repita a injeção e veja a defesa funcionando. Digite: curl "/api/produtos?busca=\' OR \'1\'=\'1"',cmd:"curl \"/api/produtos?busca=' OR '1'='1\"",ok:function(){var hs=serv.hist||[];return serv.idxSeguro!=null&&hs.slice(serv.idxSeguro).some(function(x){return x.url.indexOf("'1'='1")>=0&&x.status===200})},ex:'O texto é tratado só como texto: nenhum produto se chama "\' OR \'1\'=\'1". Parâmetros e escape são a base da segurança de qualquer site com banco de dados.'},
    {dica:'Bônus 1: simule um ataque de força bruta. Repita até o servidor bloquear (429): curl -X POST /api/login -d \'{"email":"ana@exemplo.com","senha":"x"}\'',cmd:"curl -X POST /api/login -d '{\"email\":\"ana@exemplo.com\",\"senha\":\"x\"}'",bonus:true,ok:function(){return h('POST','/api/login',429)},ex:'Depois de 5 erros seguidos o servidor trava as tentativas. Limitar tentativas impede que um robô teste milhares de senhas.'},
    {dica:'Bônus 2: tente cadastrar o mesmo e-mail de novo. Digite: curl -X POST /api/cadastro -d \'{"email":"ana@exemplo.com","senha":"Outra-senha-77"}\'',cmd:"curl -X POST /api/cadastro -d '{\"email\":\"ana@exemplo.com\",\"senha\":\"Outra-senha-77\"}'",bonus:true,ok:function(){return h('POST','/api/cadastro',409)},ex:'409 quer dizer "conflito": o e-mail já existe. Em sites reais isso também pode revelar quem tem conta, então muitos sistemas mandam um e-mail em vez de responder na tela.'}
  ];
  var REQ=passos.filter(function(x){return !x.bonus}).length;
  function depoisReq(){if(term.passo>=REQ&&!feitoReq){feitoReq=true;$('#concluir').hidden=false;term.lin('> Acesso protegido! Conclua agora ou faça os bônus para subir a medalha de segurança.','ok')}}
  term=L.terminal(passos,{
    depois:function(txt,r,t){var pa=passos[t.passo];if(pa&&!r.erro&&pa.ok(L.sh,txt)){return t.avanca(pa.ex).then(depoisReq)}},
    fim:function(){fecha()}
  });
  term.lin('> Guia: vamos proteger o acesso ao site '+T.nome+'. Tudo aqui é simulado, nada sai do seu navegador.','ok');
  term.lin('> Além do curl, existe o comando "servidor seguro" para ligar as defesas.','m');
  term.dica();term.atualiza();L.atualiza();
  $('#concluir').addEventListener('click',fecha);
  function fecha(){L.conclui({bonus:Math.max(0,term.passo-REQ),base:1})}
})();
