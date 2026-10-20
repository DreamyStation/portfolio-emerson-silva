/* CodeHome · execução de código de verdade.
   PA.Python: Python real (Pyodide) dentro de um Web Worker, com limite de tempo; os arquivos da pasta de treino são copiados para lá e os que o programa criar ou mudar voltam.
   PA.Node: JavaScript real em um iframe isolado (sem acesso à página), com console capturado e limite de tempo. */
(function(){
  'use strict';
  var PYV='0.26.4',PYURL='https://cdn.jsdelivr.net/pyodide/v'+PYV+'/full/';
  var HOME='/home/voce';

  /* ---------------------------------------------------------------- Python */
  var WORKER=[
   "var py=null,enviados={};",
   "async function iniciar(){importScripts('"+PYURL+"pyodide.js');py=await loadPyodide({indexURL:'"+PYURL+"'});",
   " py.runPython(['import sys, os, traceback, builtins, json, shutil',",
   "'def _input(*a, **k):',",
   "'    raise EOFError(\"input() não funciona aqui: o navegador não tem teclado de terminal. Coloque o valor direto no código.\")',",
   "'builtins.input = _input',",
   "'def _rodar(caminho):',",
   "'    os.chdir(os.path.dirname(caminho) or \"/\")',",
   "'    if os.getcwd() not in sys.path: sys.path.insert(0, os.getcwd())',",
   "'    nome = os.path.basename(caminho)',",
   "'    try:',",
   "'        src = open(caminho, encoding=\"utf-8\").read()',",
   "'        exec(compile(src, nome, \"exec\"), {\"__name__\": \"__main__\", \"__file__\": nome})',",
   "'    except SystemExit:',",
   "'        pass',",
   "'    except BaseException as e:',",
   "'        tb = e.__traceback__.tb_next if e.__traceback__ else None',",
   "'        sys.stderr.write(\"\".join(traceback.format_exception(type(e), e, tb)))',",
   "'def _limpa():',",
   "'    import importlib',",
   "'    for m in list(sys.modules):',",
   "'        f = getattr(sys.modules[m], \"__file__\", None)',",
   "'        if f and str(f).startswith(\"/home/voce\"):',",
   "'            del sys.modules[m]',",
   "'    importlib.invalidate_caches()',",
   "'def _listar():',",
   "'    res = {}',",
   "'    for dp, dn, fn in os.walk(\"/home/voce\"):',",
   "'        for f in fn:',",
   "'            p = os.path.join(dp, f)',",
   "'            try:',",
   "'                if os.path.getsize(p) > 400000: continue',",
   "'                res[p] = open(p, encoding=\"utf-8\").read()',",
   "'            except Exception:',",
   "'                pass',",
   "'    return json.dumps(res)'].join('\\n'));}",
   "function mk(p){var a=p.split('/').filter(Boolean),c='';for(var i=0;i<a.length;i++){c+='/'+a[i];try{py.FS.mkdir(c)}catch(e){}}}",
   "onmessage=async function(e){var m=e.data;",
   " if(m.tipo==='iniciar'){try{await iniciar();postMessage({tipo:'pronto',versao:py.runPython('sys.version.split()[0]')})}catch(x){postMessage({tipo:'falha',msg:String(x&&x.message||x)})}return}",
   " if(m.tipo==='rodar'){var saida=[];",
   "  try{",
   "   py.setStdout({batched:function(s){saida.push(['o',s])}});py.setStderr({batched:function(s){saida.push(['e',s])}});",
   "   py.runPython('shutil.rmtree(\"/home/voce\", ignore_errors=True)');mk('/home/voce');enviados={};",
   "   (m.dirs||[]).forEach(mk);",
   "   Object.keys(m.arquivos).forEach(function(p){mk(p.replace(/\\/[^\\/]*$/,''));py.FS.writeFile(p,m.arquivos[p]);enviados[p]=m.arquivos[p]});",
   "   py.globals.set('_caminho',m.caminho);py.runPython('_limpa()');py.runPython('_rodar(_caminho)');",
   "   var atual=JSON.parse(py.runPython('_listar()')),mud={},rem=[];",
   "   Object.keys(atual).forEach(function(p){if(enviados[p]!==atual[p])mud[p]=atual[p]});",
   "   Object.keys(enviados).forEach(function(p){if(!(p in atual))rem.push(p)});",
   "   postMessage({tipo:'fim',id:m.id,saida:saida,mudados:mud,removidos:rem});",
   "  }catch(x){postMessage({tipo:'fim',id:m.id,saida:saida.concat([['e',String(x&&x.message||x)]]),mudados:{},removidos:[]})}}",
   "};"
  ].join('\n');

  var Py={w:null,estado:'parado',espera:[],seq:0,versao:''};
  function sobe(aviso){
    return new Promise(function(res,rej){
      if(Py.estado==='pronto')return res();
      Py.espera.push([res,rej]);
      if(Py.estado==='carregando')return;
      Py.estado='carregando';
      if(aviso)aviso('> Carregando o Python de verdade (cerca de 10 MB, só na primeira vez). Aguarde alguns segundos…');
      var url=URL.createObjectURL(new Blob([WORKER],{type:'text/javascript'}));
      Py.w=new Worker(url);
      var t0=setTimeout(function(){falha('o Python demorou demais para carregar. Confira a internet e tente de novo.')},90000);
      function falha(msg){clearTimeout(t0);Py.estado='parado';try{Py.w.terminate()}catch(x){}Py.w=null;var l=Py.espera;Py.espera=[];l.forEach(function(p){p[1](new Error(msg))})}
      Py.w.onmessage=function(e){var m=e.data;
        if(m.tipo==='pronto'){clearTimeout(t0);Py.estado='pronto';Py.versao=m.versao;var l=Py.espera;Py.espera=[];l.forEach(function(p){p[0]()})}
        else if(m.tipo==='falha')falha(m.msg);
      };
      Py.w.onerror=function(e){falha('não foi possível iniciar o Python neste navegador ('+(e&&e.message||'erro desconhecido')+').')};
      Py.w.postMessage({tipo:'iniciar'});
    });
  }
  function reinicia(){try{Py.w&&Py.w.terminate()}catch(x){}Py.w=null;Py.estado='parado'}

  /* percorre a pasta de treino e junta o que o Python precisa receber */
  function coleta(S){
    var arquivos={},dirs=[];
    (function anda(no,arr){
      Object.keys(no.f).forEach(function(n){
        var f=no.f[n],c=arr.concat(n),p='/'+c.join('/');
        if(f.t==='d'){dirs.push(p);anda(f,c)}
        else if(f.t==='a')arquivos[p]=f.c;
        else if(f.t==='i')arquivos[p]='PNG';
      });
    })(S.raiz,[]);
    return {arquivos:arquivos,dirs:dirs};
  }
  function aplica(S,r){
    var mudou=[];
    Object.keys(r.mudados||{}).forEach(function(p){
      var arr=p.split('/').filter(Boolean),pai=S.raiz,ok=true;
      for(var i=0;i<arr.length-1;i++){if(!pai.f[arr[i]])pai.f[arr[i]]=window.PA.fsDir();pai=pai.f[arr[i]];if(pai.t!=='d'){ok=false;break}}
      if(!ok)return;var nome=arr[arr.length-1],ex=pai.f[nome];
      if(ex&&ex.t==='i')return;
      if(ex&&ex.t==='a'){if(ex.c!==r.mudados[p]){ex.c=r.mudados[p];mudou.push(p)}}
      else if(!ex){pai.f[nome]=window.PA.fsArq(r.mudados[p]);mudou.push(p)}
    });
    (r.removidos||[]).forEach(function(p){
      var arr=p.split('/').filter(Boolean),pai=S.raiz;
      for(var i=0;i<arr.length-1&&pai;i++)pai=pai.f&&pai.f[arr[i]];
      if(pai&&pai.f&&pai.f[arr[arr.length-1]]&&pai.f[arr[arr.length-1]].t==='a'){delete pai.f[arr[arr.length-1]];mudou.push(p)}
    });
    return mudou;
  }
  /* roda um arquivo .py da pasta atual. Devolve {saida:[[tipo,texto]], erro:bool, tempo:bool, mudou:[caminhos], texto:'tudo que saiu', erroTexto:'só o erro'} */
  Py.roda=function(S,caminho,aviso,limite){
    return sobe(aviso).then(function(){
      return new Promise(function(res){
        var id=++Py.seq,c=coleta(S),fim=false;
        var t=setTimeout(function(){if(fim)return;fim=true;reinicia();res({saida:[['e','O programa demorou mais de '+(limite||10)+' segundos e foi interrompido. Costuma ser um laço infinito (while True sem parada) ou uma conta enorme.']],erro:true,tempo:true,mudou:[],texto:'',erroTexto:'timeout'})},(limite||10)*1000);
        Py.w.onmessage=function(e){var m=e.data;if(m.tipo!=='fim'||m.id!==id||fim)return;fim=true;clearTimeout(t);
          var mudou=aplica(S,m),txt=m.saida.filter(function(l){return l[0]==='o'}).map(function(l){return l[1]}).join('\n'),et=m.saida.filter(function(l){return l[0]==='e'}).map(function(l){return l[1]}).join('\n');
          res({saida:m.saida,erro:!!et&&/Error|Exception|Traceback/.test(et),tempo:false,mudou:mudou,texto:txt,erroTexto:et});
        };
        Py.w.postMessage({tipo:'rodar',id:id,arquivos:c.arquivos,dirs:c.dirs,caminho:caminho});
      });
    },function(err){return {saida:[['e','> '+err.message]],erro:true,tempo:false,mudou:[],texto:'',erroTexto:err.message,falhaCarga:true}});
  };
  Py.pronto=function(){return Py.estado==='pronto'};

  /* ---------------------------------------------------------------- JavaScript (Node simulado por um iframe isolado) */
  var NodeRun={};
  var PRE='(function(){function env(o){try{parent.postMessage(o,"*")}catch(x){}}function fm(a){return [].slice.call(a).map(function(x){try{return typeof x==="object"&&x!==null?JSON.stringify(x):String(x)}catch(y){return String(x)}}).join(" ")}'+
    'console.log=function(){env({pn:"log",nv:"o",txt:fm(arguments)})};console.info=console.log;console.warn=function(){env({pn:"log",nv:"w",txt:fm(arguments)})};console.error=function(){env({pn:"log",nv:"e",txt:fm(arguments)})};'+
    'window.onerror=function(m,u,l,c){env({pn:"erro",msg:String(m),lin:l,col:c});return true};window.addEventListener("unhandledrejection",function(e){env({pn:"erro",msg:String(e.reason&&e.reason.message||e.reason)})});'+
    'window.process={argv:["node","script"],env:{},exit:function(){},stdout:{write:function(s){env({pn:"log",nv:"o",txt:String(s).replace(/\\n$/,"")})}}};})()';
  /* linha do código do aluno: 1ª linha do documento = PRE; a do código vem na 3ª */
  NodeRun.roda=function(codigo,limite){
    if(/\bwhile\s*\(\s*(true|1)\s*\)|\bfor\s*\(\s*;\s*;\s*\)/.test(codigo)&&!/\bbreak\b/.test(codigo))return Promise.resolve({saida:[],erro:{msg:'laço infinito detectado: o código tem while(true) ou for(;;) sem break, e foi bloqueado para não travar a página',lin:null},tempo:false,texto:''});
    return new Promise(function(res){
      var f=document.createElement('iframe');f.setAttribute('sandbox','allow-scripts');f.style.cssText='position:fixed;left:-9999px;width:1px;height:1px;border:0';f.setAttribute('aria-hidden','true');
      var saida=[],erro=null,fim=false,ocioso=null,duro=null;
      function fecha(tempo){if(fim)return;fim=true;clearTimeout(ocioso);clearTimeout(duro);window.removeEventListener('message',om);try{f.remove()}catch(x){}
        res({saida:saida,erro:erro,tempo:!!tempo,texto:saida.filter(function(l){return l[0]!=='e'}).map(function(l){return l[1]}).join('\n')})}
      function rearma(){clearTimeout(ocioso);ocioso=setTimeout(function(){fecha(false)},900)}
      function om(e){if(e.source!==f.contentWindow)return;var d=e.data;if(!d||!d.pn)return;
        if(d.pn==='log'){saida.push([d.nv,d.txt]);rearma()}
        else if(d.pn==='erro'){erro={msg:d.msg,lin:d.lin?Math.max(1,d.lin-2):null,col:d.col};rearma()}
        else if(d.pn==='fim')rearma();
      }
      window.addEventListener('message',om);
      duro=setTimeout(function(){fecha(true)},(limite||5)*1000);
      f.srcdoc='<script>'+PRE+'<\/script>\n<script>\n'+String(codigo).replace(/<\/script/gi,'<\\/script')+'\n<\/script>\n<script>parent.postMessage({pn:"fim"},"*")<\/script>';
      document.body.appendChild(f);rearma();
    });
  };

  window.PA=window.PA||{};window.PA.Python=Py;window.PA.Node=NodeRun;
})();
