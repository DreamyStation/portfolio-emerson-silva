/* Prática aplicada · terminal virtual. Sistema de arquivos de mentira, comandos de verdade (pwd, ls, cd, mkdir, touch, cat, echo > e >>, rm, code, node -v, git --version)
   e uma "tela" que monta o site a partir do index.html e do estilo.css digitados. Nada sai do navegador. */
(function(){
  'use strict';
  var BASE=(function(){try{return new URL('.',document.currentScript?document.currentScript.src:location.href).href.replace(/js\/$/,'')}catch(e){return ''}})();
  var HOME=['home','voce'];

  var PONTE='<script>(function(){var c=0,p={};addEventListener("message",function(e){var d=e.data;if(d&&d.pa==="resp"&&p[d.id]){p[d.id](d);delete p[d.id]}});'+
   'window.fetch=function(u,o){return new Promise(function(res){var id=++c;p[id]=function(d){res({ok:d.status>=200&&d.status<300,status:d.status,json:function(){return Promise.resolve(JSON.parse(d.corpo))},text:function(){return Promise.resolve(d.corpo)}})};'+
   'parent.postMessage({pa:"req",id:id,url:String(u),metodo:(o&&o.method)||"GET",corpo:(o&&o.body)||null,cab:(o&&o.headers)||{}},"*")})};'+
   'var L=console.log;console.log=function(){parent.postMessage({pa:"log",txt:[].slice.call(arguments).join(" ")},"*");L.apply(console,arguments)};'+
   'addEventListener("error",function(e){parent.postMessage({pa:"erro",txt:String(e.message)},"*")});addEventListener("click",function(e){parent.postMessage({pa:"clique",alvo:(e.target&&e.target.id)||""},"*")},true);addEventListener("load",function(){var e=document.getElementById("mais")||document.getElementById("lista");if(e)e.scrollIntoView({block:"center"})})})()<\/script>';
  function dir(){return {t:'d',f:{}}}
  function arq(c){return {t:'a',c:c||''}}
  function img(n){return {t:'i',u:'img/'+n+'.png'}}

  function Shell(opc){
    opc=opc||{};
    var S={};
    S.reinicia=function(){
      S.raiz=dir();S.cwd=HOME.slice();S.aberto=null;S.tocados={};S.cmds=[];
      var h=S.raiz;HOME.forEach(function(n){h.f[n]=dir();h=h.f[n]});
      (opc.inicio||function(){})(S);
    };
    /* ---- caminhos ---- */
    S.partes=function(p){
      p=String(p||'');var base;
      if(p.charAt(0)==='/'){base=[];}else if(p==='~'||p.indexOf('~/')===0){base=HOME.slice();p=p.slice(1)}else base=S.cwd.slice();
      p.split('/').forEach(function(x){if(!x||x==='.')return;if(x==='..'){base.pop();return}base.push(x)});
      return base;
    };
    S.acha=function(arr){var n=S.raiz;for(var i=0;i<arr.length;i++){if(!n||n.t!=='d'||!n.f[arr[i]])return null;n=n.f[arr[i]]}return n};
    S.pai=function(arr){return S.acha(arr.slice(0,-1))};
    S.no=function(p){return S.acha(S.partes(p))};
    S.le=function(p){var n=S.no(p);return n&&n.t==='a'?n.c:null};
    S.existe=function(p){return !!S.no(p)};
    S.exibe=function(arr){var s='/'+arr.join('/');var h='/'+HOME.join('/');if(s===h)return '~';if(s.indexOf(h+'/')===0)return '~'+s.slice(h.length);return s};
    S.prompt=function(){return S.exibe(S.cwd)+' $'};
    S.cria=function(arr,no){var p=S.pai(arr);if(!p||p.t!=='d')return false;p.f[arr[arr.length-1]]=no;return true};

    /* ---- leitura da linha de comando (aspas e redirecionamento) ---- */
    function lex(s){
      var tk=[],cur='',q=null,tem=false;
      for(var i=0;i<s.length;i++){
        var c=s[i];
        if(q){if(c===q){q=null}else cur+=c;continue}
        if(c==='"'||c==="'"){q=c;tem=true;continue}
        if(c===' '||c==='\t'){if(cur||tem){tk.push({v:cur,q:tem});cur='';tem=false}continue}
        if(c==='>'){if(cur||tem){tk.push({v:cur,q:tem});cur='';tem=false}
          if(s[i+1]==='>'){tk.push({v:'>>',op:1});i++}else tk.push({v:'>',op:1});continue}
        cur+=c;
      }
      if(q)return {erro:'faltou fechar as aspas ('+q+')'};
      if(cur||tem)tk.push({v:cur,q:tem});
      return {tk:tk};
    }
    var ALIAS={dir:'ls',type:'cat',md:'mkdir',ni:'touch',cls:'clear',del:'rm',gc:'cat','get-location':'pwd'};
    function out(l,cl){return [l,cl||'']}

    S.exec=function(linha){
      var r={linhas:[],erro:false,limpar:false};
      var L=lex(linha);
      if(L.erro){r.erro=true;r.linhas.push(out('> '+L.erro,'er'));return r}
      var tk=L.tk;if(!tk.length)return r;
      var redir=null;
      for(var i=0;i<tk.length;i++){if(tk[i].op){if(i+1>=tk.length||tk[i+1].op){r.erro=true;r.linhas.push(out('> depois de '+tk[i].v+' falta o nome do arquivo.','er'));return r}redir={tipo:tk[i].v,arq:tk[i+1].v};tk=tk.slice(0,i).concat(tk.slice(i+2));break}}
      var cmd=(tk[0]?tk[0].v:'').toLowerCase();cmd=ALIAS[cmd]||cmd;
      var a=tk.slice(1).map(function(x){return x.v});
      var flags=a.filter(function(x){return x.charAt(0)==='-'}),pos=a.filter(function(x){return x.charAt(0)!=='-'});
      var falha=function(m){r.erro=true;r.linhas.push(out('> '+m,'er'))};
      S.cmds.push(linha);
      var Cs={
        pwd:function(){r.linhas.push(out('/'+S.cwd.join('/')))},
        ls:function(){
          var alvo=pos[0]?S.no(pos[0]):S.acha(S.cwd);
          if(!alvo)return falha('ls: não encontrei "'+pos[0]+'".');
          if(alvo.t!=='d'){r.linhas.push(out(pos[0]));return}
          var ns=Object.keys(alvo.f).sort();
          if(!ns.length){r.linhas.push(out('(pasta vazia)','m'));return}
          r.linhas.push(out(ns.map(function(n){return alvo.f[n].t==='d'?n+'/':n}).join('   ')));
        },
        cd:function(){
          if(!pos.length){S.cwd=HOME.slice();return}
          var arr=S.partes(pos[0]),n=S.acha(arr);
          if(!n)return falha('cd: a pasta "'+pos[0]+'" não existe. Confira o nome com ls.');
          if(n.t!=='d')return falha('cd: "'+pos[0]+'" é um arquivo, não uma pasta.');
          S.cwd=arr;
        },
        mkdir:function(){
          if(!pos.length)return falha('mkdir: diga o nome da pasta. Exemplo: mkdir padaria');
          pos.forEach(function(p){
            var arr=S.partes(p),e=S.acha(arr);
            if(e)return falha('mkdir: "'+p+'" já existe.');
            if(!S.pai(arr)&&flags.indexOf('-p')<0)return falha('mkdir: a pasta de cima não existe. Use mkdir -p para criar o caminho todo.');
            if(flags.indexOf('-p')>=0){var c=[];arr.forEach(function(x){c.push(x);if(!S.acha(c))S.cria(c,dir())})}else S.cria(arr,dir());
          });
        },
        touch:function(){
          if(!pos.length)return falha('touch: diga o nome do arquivo. Exemplo: touch index.html');
          pos.forEach(function(p){var arr=S.partes(p),e=S.acha(arr);if(e)return;if(!S.cria(arr,arq('')))falha('touch: a pasta de "'+p+'" não existe.');else S.tocados[arr.join('/')]=1});
        },
        cat:function(){
          if(!pos.length)return falha('cat: diga o arquivo. Exemplo: cat index.html');
          pos.forEach(function(p){var n=S.no(p);if(!n)return falha('cat: "'+p+'" não existe.');if(n.t==='d')return falha('cat: "'+p+'" é uma pasta.');if(n.t==='i')return r.linhas.push(out('(imagem: '+n.u+', o terminal não mostra imagens)','m'));
            if(!n.c)r.linhas.push(out('(arquivo vazio)','m'));else n.c.split('\n').forEach(function(l){r.linhas.push(out(l))})});
        },
        echo:function(){
          var txt=a.join(' ');
          if(!redir){r.linhas.push(out(txt));return}
          var arr=S.partes(redir.arq),e=S.acha(arr);
          if(e&&e.t!=='a')return falha('echo: "'+redir.arq+'" não é um arquivo de texto.');
          if(!e){if(!S.cria(arr,arq(txt)))return falha('echo: a pasta de "'+redir.arq+'" não existe. Crie com mkdir.');S.aberto=arr.join('/');return}
          e.c=redir.tipo==='>>'?(e.c?e.c+'\n'+txt:txt):txt;S.aberto=arr.join('/');
        },
        rm:function(){
          if(!pos.length)return falha('rm: diga o que apagar. Exemplo: rm teste.txt');
          pos.forEach(function(p){var arr=S.partes(p),n=S.acha(arr);if(!n)return falha('rm: "'+p+'" não existe.');
            if(n.t==='d'&&flags.indexOf('-r')<0)return falha('rm: "'+p+'" é uma pasta. Use rm -r para apagar pasta e conteúdo (com cuidado: não tem volta).');
            delete S.pai(arr).f[arr[arr.length-1]]});
        },
        clear:function(){r.limpar=true},
        code:function(){
          var p=pos[0]||'.',n=S.no(p);if(!n)return falha('code: "'+p+'" não existe.');
          S.aberto=n.t==='a'?S.partes(p).join('/'):S.aberto;
          r.linhas.push(out('> (simulação) no seu computador, isso abriria o editor de código em "'+p+'".','m'));
        },
        node:function(){if(flags.indexOf('-v')>=0||flags.indexOf('--version')>=0)r.linhas.push(out('v22.11.0'));else falha('node: neste treino só existe node -v.')},
        git:function(){if(flags.indexOf('--version')>=0||pos[0]==='version')r.linhas.push(out('git version 2.47.0'));else falha('git: neste treino só existe git --version.')},
        npm:function(){if(flags.indexOf('-v')>=0||flags.indexOf('--version')>=0)r.linhas.push(out('10.9.0'));else falha('npm: neste treino só existe npm -v.')},
        help:function(){r.linhas.push(out('Comandos: pwd · ls · cd · mkdir · touch · cat · echo · rm · code · clear · node -v · git --version','m'))},
        ajuda:null,
        reiniciar:function(){S.reinicia();r.linhas.push(out('> Pasta de treino reiniciada.','ok'))}
      };
      Cs.ajuda=Cs.help;
      var ext=opc.cmds&&opc.cmds[cmd];
      if(ext){try{ext(tk,r,S)}catch(e){falha('algo deu errado nesse comando.')}return r}
      var f=Cs[cmd];
      if(!f){falha('"'+tk[0].v+'" não é um comando que eu conheça. Digite "help" para ver a lista.');return r}
      try{f()}catch(e){falha('algo deu errado nesse comando.')}
      return r;
    };

    /* ---- árvore para o painel de arquivos ---- */
    S.arvore=function(raizArr){
      var n=S.acha(raizArr||HOME),linhas=[];
      var aqui=S.cwd.join('/');
      (function anda(no,arr,pre){
        Object.keys(no.f).sort().forEach(function(k,i,ks){
          var f=no.f[k],ult=i===ks.length-1,cam=arr.concat(k).join('/');
          linhas.push({txt:pre+(ult?'└─ ':'├─ ')+k+(f.t==='d'?'/':''),dir:f.t==='d',aqui:f.t==='d'&&cam===aqui});
          if(f.t==='d')anda(f,arr.concat(k),pre+(ult?'   ':'│  '));
        });
      })(n,raizArr||HOME,'');
      return {raiz:S.exibe(raizArr||HOME),linhas:linhas,aqui:S.exibe(S.cwd)};
    };
    S.desenhaArvore=function(el){
      var a=S.arvore();el.textContent='';
      var h=document.createElement('span');h.className='dir'+(a.aqui==='~'?' aqui':'');h.textContent=a.raiz+'/';el.appendChild(h);
      a.linhas.forEach(function(l){el.appendChild(document.createTextNode('\n'));var s=document.createElement('span');s.textContent=l.txt;if(l.dir)s.className='dir'+(l.aqui?' aqui':'');el.appendChild(s)});
    };

    /* ---- tela do site: monta index.html + estilo.css dentro de um iframe sem scripts e sem rede ---- */
    S.preview=function(raiz,frame,vazio,op){op=op||{};
      var pastaSite=S.acha(S.partes(raiz));
      if(!pastaSite||pastaSite.t!=='d'||!pastaSite.f['index.html']||!pastaSite.f['index.html'].c){
        frame.srcdoc='<body style="font:14px system-ui;color:#777;padding:18px;margin:0">'+(vazio||'A tela do site aparece aqui quando existir um index.html com conteúdo.')+'</body>';return false;
      }
      var base=S.partes(raiz),html=pastaSite.f['index.html'].c;
      var resolve=function(src){var arr=base.slice();String(src).split('/').forEach(function(x){if(!x||x==='.')return;if(x==='..')arr.pop();else arr.push(x)});return S.acha(arr)};
      var js='';
      html=html.replace(/<script[^>]*src\s*=\s*(["'])(.*?)\1[^>]*>\s*<\/script>/gi,function(m,q,src){var n=resolve(src);if(op.scripts&&n&&n.t==='a'){js+='\n;'+n.c.replace(/<\/script/gi,'<\\/script')}return ''});
      html=html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'');
      html=html.replace(/\bsrc\s*=\s*(["'])(.*?)\1/gi,function(m,q,src){var n=resolve(src);return (n&&n.t==='i')?'src="'+BASE+n.u+'"':'src="data:," data-quebrada="'+String(src).replace(/[^\w\/.-]/g,'')+'"'});
      var css='';
      html=html.replace(/<link\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>/gi,function(m,q,href){var n=resolve(href);if(n&&n.t==='a'){css+='\n'+n.c}return ''});
      html=html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,function(m,c){css+='\n'+c;return ''});
      css=css.replace(/@import[^;]*;?/gi,'').replace(/url\(\s*(['"]?)(?!data:)[^)]*\)/gi,'none');
      var origem=BASE?new URL(BASE).origin:'';
      var csp="default-src 'none'; img-src data: "+origem+"; style-src 'unsafe-inline'"+(op.scripts?"; script-src 'unsafe-inline'":'');
      var ponte=op.ponte?PONTE:'';
      var codigo=op.scripts&&js?'<script>'+js+'<\/script>':'';
      frame.srcdoc='<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+csp+'"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="about:blank"><style>img[data-quebrada]{border:2px dashed #c00;min-width:40px;min-height:24px;display:inline-block;background:#fee}img[data-quebrada]::after{content:"imagem não encontrada";color:#c00;font:12px sans-serif}img{image-rendering:pixelated}</style><style>'+css+'</style>'+ponte+html+codigo;
      return true;
    };
    S.ligaPonte=function(frame,h){
      window.addEventListener('message',function(e){
        if(e.source!==frame.contentWindow)return;var d=e.data;if(!d||!d.pa)return;
        if(d.pa==='log'&&h.log)h.log(d.txt);
        else if(d.pa==='erro'&&h.erro)h.erro(d.txt);
        else if(d.pa==='clique'&&h.clique)h.clique(d.alvo);
        else if(d.pa==='req'&&h.api){var r=h.api(d);frame.contentWindow.postMessage({pa:'resp',id:d.id,status:r.status,corpo:r.corpo},'*')}
      });
    };
    S.reinicia();
    return S;
  }
  window.PA=window.PA||{};window.PA.Shell=Shell;window.PA.fsDir=dir;window.PA.fsArq=arq;window.PA.fsImg=img;
})();
