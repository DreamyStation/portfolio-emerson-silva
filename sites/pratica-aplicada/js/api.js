/* CodeHome · servidor de mentira (back-end e API) com cadastro, login por token, banco de dados em memória e demonstrações de falhas de segurança (XSS e injeção de SQL).
   Nada sai do navegador: as "requisições" do terminal (curl) e do site da minitela (fetch) caem aqui. */
(function(){
  'use strict';
  /* SHA-256 síncrono, só para mostrar o conceito de hash na tela (sistemas reais usam bcrypt, scrypt ou argon2, que são lentos de propósito). */
  function sha256(ascii){
    function rr(v,a){return (v>>>a)|(v<<(32-a))}
    var mp=Math.pow,mx=mp(2,32),res='',words=[],bits=ascii.length*8,hash=sha256.h=sha256.h||[],k=sha256.k=sha256.k||[],pc=k.length,ic={};
    for(var c=2;pc<64;c++){if(!ic[c]){for(var i=0;i<313;i+=c)ic[i]=c;hash[pc]=(mp(c,.5)*mx)|0;k[pc++]=(mp(c,1/3)*mx)|0}}
    ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';
    for(i=0;i<ascii.length;i++){var j=ascii.charCodeAt(i);if(j>>8)return '';words[i>>2]|=j<<((3-i)%4)*8}
    words[words.length]=((bits/mx)|0);words[words.length]=(bits);
    for(j=0;j<words.length;){var w=words.slice(j,j+=16),oh=hash;hash=hash.slice(0,8);
      for(i=0;i<64;i++){var w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];
        var t1=hash[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
        var t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
        hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0}
      for(i=0;i<8;i++)hash[i]=(hash[i]+oh[i])|0}
    for(i=0;i<8;i++)for(j=3;j+1;j--){var b=(hash[i]>>(j*8))&255;res+=((b<16)?0:'')+b.toString(16)}
    return res;
  }
  function aleat(n){var s='',a='abcdefghijklmnopqrstuvwxyz0123456789';for(var i=0;i<n;i++)s+=a.charAt(Math.floor(Math.random()*a.length));return s}
  var TXT={200:'OK',201:'Created',400:'Bad Request',401:'Unauthorized',404:'Not Found',409:'Conflict',422:'Unprocessable Entity',429:'Too Many Requests'};

  function Servidor(T){
    var S={modo:'inseguro',pedidos:[],usuarios:[],tokens:{},ultimoToken:'',comentarios:[],falhas:{},seq:1,log:[]};
    S.itens=T.itens.map(function(t,i){var pt=t.split(' · '),m=/R\$\s*([\d.,]+)/.exec(t);return {id:i+1,nome:pt[0],preco:m?parseFloat(m[1].replace('.','').replace(',','.')):null,detalhe:pt[1]||''}});
    S.sha=sha256;
    function resp(status,obj,extra){var r={status:status,texto:TXT[status]||'',corpo:JSON.stringify(obj)};if(extra)for(var k in extra)r[k]=extra[k];return r}
    function parse(corpo){if(corpo==null||corpo==='')return {};try{var o=JSON.parse(corpo);return (o&&typeof o==='object')?o:null}catch(e){return null}}
    S.handle=function(metodo,url,corpo,cab){
      metodo=String(metodo||'GET').toUpperCase();cab=cab||{};
      var u;try{u=new URL(String(url),'http://local.exemplo')}catch(e){return resp(400,{erro:'endereço inválido'})}
      var rota=u.pathname.replace(/\/+$/,'')||'/',auth='';for(var h in cab){if(h.toLowerCase()==='authorization')auth=String(cab[h])}
      var tok=(/^Bearer\s+(\S+)$/i.exec(auth)||[])[1],email=tok&&S.tokens[tok];
      var b=(metodo==='POST'||metodo==='PUT')?parse(corpo):{};
      if(b===null)return resp(400,{erro:'o corpo não é um JSON válido. Confira aspas e chaves.'});
      S.log.push(metodo+' '+rota);
      if(rota==='/api/itens'&&metodo==='GET')return resp(200,S.itens);
      var m=/^\/api\/itens\/(\d+)$/.exec(rota);if(m&&metodo==='GET'){var it=S.itens.filter(function(x){return x.id===+m[1]})[0];return it?resp(200,it):resp(404,{erro:'item não encontrado'})}
      if(rota==='/api/pedidos'&&metodo==='GET')return resp(200,S.pedidos);
      if(rota==='/api/pedidos'&&metodo==='POST'){
        var qtd=parseInt(b.qtd,10),item=String(b.item||'');
        if(!item)return resp(422,{erro:'campo "item" é obrigatório'});
        if(!(qtd>=1&&qtd<=20))return resp(422,{erro:'"qtd" precisa ser um número de 1 a 20'});
        var ref=S.itens.filter(function(x){return x.nome.toLowerCase()===item.toLowerCase()})[0];
        if(!ref)return resp(404,{erro:'esse item não existe no catálogo',dica:'consulte GET /api/itens'});
        var p={id:S.seq++,item:ref.nome,qtd:qtd,total:ref.preco==null?null:Math.round(ref.preco*qtd*100)/100};S.pedidos.push(p);return resp(201,p);
      }
      if(rota==='/api/cadastro'&&metodo==='POST'){
        var em=String(b.email||'').trim().toLowerCase(),se=String(b.senha||'');
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))return resp(422,{erro:'e-mail inválido'});
        var falta=[];if(se.length<8)falta.push('pelo menos 8 caracteres');if(!/[A-Za-z]/.test(se))falta.push('uma letra');if(!/\d/.test(se))falta.push('um número');
        if(falta.length)return resp(422,{erro:'senha fraca: precisa de '+falta.join(', ')});
        if(S.usuarios.some(function(x){return x.email===em}))return resp(409,{erro:'esse e-mail já está cadastrado'});
        var sal=aleat(8),usr={email:em,sal:sal,hash:sha256(sal+se),puro:se};S.usuarios.push(usr);
        return resp(201,{mensagem:'conta criada',email:em});
      }
      if(rota==='/api/login'&&metodo==='POST'){
        var e2=String(b.email||'').trim().toLowerCase(),s2=String(b.senha||'');
        if((S.falhas[e2]||0)>=5)return resp(429,{erro:'muitas tentativas erradas. Aguarde alguns minutos.'});
        var u2=S.usuarios.filter(function(x){return x.email===e2})[0];
        if(!u2||u2.hash!==sha256(u2.sal+s2)){S.falhas[e2]=(S.falhas[e2]||0)+1;return resp(401,{erro:'e-mail ou senha incorretos'})}
        S.falhas[e2]=0;var t=aleat(24);S.tokens[t]=e2;S.ultimoToken=t;return resp(200,{token:t,expira_em:'15 minutos'});
      }
      if(rota==='/api/perfil'&&metodo==='GET'){if(!email)return resp(401,{erro:'faça login: envie o cabeçalho Authorization: Bearer SEU_TOKEN'});return resp(200,{email:email,papel:'cliente'})}
      if(rota==='/api/comentarios'&&metodo==='GET')return resp(200,S.comentarios);
      if(rota==='/api/comentarios'&&metodo==='POST'){
        var tx=String(b.texto||'');if(!tx)return resp(422,{erro:'campo "texto" é obrigatório'});if(tx.length>300)return resp(422,{erro:'máximo de 300 caracteres'});
        var c={id:S.seq++,texto:tx};S.comentarios.push(c);return resp(201,c);
      }
      if(rota==='/api/produtos'&&metodo==='GET'){
        var q=u.searchParams.get('busca')||'',ql=q.toLowerCase(),sql,linhas;
        if(S.modo==='inseguro'){
          sql="SELECT * FROM itens WHERE nome LIKE '%"+q+"%'";
          linhas=/'\s*or\s*'?\s*1\s*'?\s*=\s*'?\s*1/i.test(q)?S.itens.slice():S.itens.filter(function(x){return x.nome.toLowerCase().indexOf(ql)>=0});
          return resp(200,{sql:sql,linhas:linhas.map(function(x){return x.nome}),alerta:linhas.length===S.itens.length&&q&&/or/i.test(q)?'a busca foi reescrita pelo texto digitado: injeção de SQL':undefined});
        }
        sql='SELECT * FROM itens WHERE nome LIKE ?';linhas=S.itens.filter(function(x){return x.nome.toLowerCase().indexOf(ql)>=0});
        return resp(200,{sql:sql,parametro:q,linhas:linhas.map(function(x){return x.nome})});
      }
      return resp(404,{erro:'rota não encontrada: '+metodo+' '+rota,dica:'as rotas começam com /api/'});
    };
    S.zera=function(){S.modo='inseguro';S.pedidos=[];S.usuarios=[];S.tokens={};S.ultimoToken='';S.comentarios=[];S.falhas={};S.seq=1;S.log=[];S.hist=[];S.idxSeguro=0};
    return S;
  }

  /* comando curl do terminal virtual: curl [-X MÉTODO] [-H "Cabeçalho: valor"] [-d 'json'] ENDEREÇO */
  function curl(servidor,aoResposta){
    return function(tk,r,S){
      var met='',cab={},corpo=null,url='';
      for(var i=1;i<tk.length;i++){var v=tk[i].v;
        if(v==='-X'){met=tk[++i]&&tk[i].v;continue}
        if(v==='-H'){var h=(tk[++i]&&tk[i].v||'').replace('$TOKEN',servidor.ultimoToken),k=h.indexOf(':');if(k>0)cab[h.slice(0,k).trim()]=h.slice(k+1).trim();continue}
        if(v==='-d'||v==='--data'){corpo=tk[++i]&&tk[i].v;continue}
        if(v.charAt(0)==='-')continue;url=v}
      if(!url){r.erro=true;r.linhas.push(['> curl: falta o endereço. Exemplo: curl /api/itens','er']);return}
      if(!met)met=corpo!=null?'POST':'GET';
      var rs=servidor.handle(met,url,corpo,cab);
      (servidor.hist=servidor.hist||[]).push({met:met.toUpperCase(),url:url,status:rs.status});
      r.linhas.push(['> '+met.toUpperCase()+' '+url,'m']);
      r.linhas.push(['HTTP '+rs.status+' '+rs.texto,rs.status<300?'ok':'er']);
      if(rs.status>=400)r.erro=false;
      var obj;try{obj=JSON.parse(rs.corpo)}catch(e){obj=rs.corpo}
      JSON.stringify(obj,null,2).split('\n').forEach(function(l){r.linhas.push([l,''])});
      if(aoResposta)aoResposta(met.toUpperCase(),url,rs);
    };
  }
  Servidor.estado=function(S){return JSON.parse(JSON.stringify({modo:S.modo,pedidos:S.pedidos,usuarios:S.usuarios,tokens:S.tokens,ultimoToken:S.ultimoToken,comentarios:S.comentarios,falhas:S.falhas,seq:S.seq,log:S.log,hist:S.hist||[],idxSeguro:S.idxSeguro||0}))};
  Servidor.carrega=function(S,o){if(!o)return;Object.keys(o).forEach(function(k){S[k]=o[k]})};
  window.PA=window.PA||{};window.PA.Servidor=Servidor;window.PA.curl=curl;window.PA.sha256=sha256;
})();
