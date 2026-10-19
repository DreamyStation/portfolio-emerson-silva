/* Prática aplicada · editor de código de verdade (CodeMirror) ligado à pasta de treino.
   O que o aluno escreve aqui é o arquivo: a minitela, o terminal (cat, python, node) e as conferências leem o mesmo texto. */
(function(){
  'use strict';
  var CM_V='5.65.16',CM_BASE='https://cdnjs.cloudflare.com/ajax/libs/codemirror/'+CM_V+'/';
  var carga=null;
  function carrega(){
    if(window.CodeMirror)return Promise.resolve(true);
    if(carga)return carga;
    function js(u){return new Promise(function(res,rej){var s=document.createElement('script');s.src=u;s.onload=res;s.onerror=function(){rej(new Error('falha '+u))};document.head.appendChild(s)})}
    var l=document.createElement('link');l.rel='stylesheet';l.href=CM_BASE+'codemirror.min.css';document.head.appendChild(l);
    carga=js(CM_BASE+'codemirror.min.js').then(function(){return Promise.all(['xml/xml','javascript/javascript','css/css','python/python'].map(function(m){return js(CM_BASE+'mode/'+m+'.min.js')}))})
      .then(function(){return js(CM_BASE+'mode/htmlmixed/htmlmixed.min.js')}).then(function(){return js(CM_BASE+'addon/edit/matchbrackets.min.js')}).then(function(){return true},function(){return false});
    return carga;
  }
  function modo(nome){var e=(/\.([a-z0-9]+)$/i.exec(nome)||[])[1];e=(e||'').toLowerCase();
    return e==='html'||e==='htm'?'htmlmixed':e==='css'?'css':e==='js'?'javascript':e==='py'?'python':e==='json'?{name:'javascript',json:true}:'text/plain'}

  function Editor(o){
    var E={},S=o.shell,pasta=o.pasta,atual=null,cm=null,ta=null,pend=null,ignora=false,sujo=false,marcas=[];
    var el=o.el;el.textContent='';el.classList.add('ed');
    var abas=document.createElement('div');abas.className='ed-abas';abas.setAttribute('role','tablist');
    var corpo=document.createElement('div');corpo.className='ed-corpo';
    var rod=document.createElement('div');rod.className='ed-rod';
    var pos=document.createElement('span');pos.className='ed-pos';var st=document.createElement('span');st.className='ed-st';rod.append(st,pos);
    el.append(abas,corpo,rod);
    var host=document.createElement('div');host.className='ed-host';corpo.appendChild(host);

    function lista(){var n=S.no(pasta);if(!n||n.t!=='d')return [];return Object.keys(n.f).filter(function(k){return n.f[k].t==='a'}).sort(function(a,b){
      var ord=function(x){return o.ordem&&o.ordem.indexOf(x)>=0?o.ordem.indexOf(x):99};return ord(a)-ord(b)||a.localeCompare(b)})}
    function texto(){return cm?cm.getValue():ta?ta.value:''}
    function grava(){
      if(!atual)return;clearTimeout(pend);pend=null;
      var n=S.no(pasta+'/'+atual);if(!n){S.cria(S.partes(pasta+'/'+atual),window.PA.fsArq(''));n=S.no(pasta+'/'+atual)}
      if(n.t==='a'&&n.c!==texto()){n.c=texto()}
      sujo=false;st.textContent='salvo';
      if(o.aoMudar)o.aoMudar(atual,texto());
    }
    function agenda(){if(ignora)return;sujo=true;st.textContent='editando…';clearTimeout(pend);pend=setTimeout(grava,o.atraso||420)}
    function monta(){
      return carrega().then(function(ok){
        host.textContent='';
        if(ok&&window.CodeMirror){
          cm=window.CodeMirror(host,{value:'',lineNumbers:true,lineWrapping:true,tabSize:2,indentUnit:2,indentWithTabs:false,matchBrackets:true,mode:'text/plain',viewportMargin:Infinity,
            extraKeys:{Tab:function(c){if(c.somethingSelected())c.indentSelection('add');else c.replaceSelection('  ','end')},'Shift-Tab':function(c){c.indentSelection('subtract')},'Ctrl-S':function(){grava()},'Cmd-S':function(){grava()}},
            inputStyle:'contenteditable',spellcheck:false,autocorrect:false,autocapitalize:false});
          cm.on('change',agenda);cm.on('cursorActivity',function(){var p=cm.getCursor();pos.textContent='linha '+(p.line+1)+', coluna '+(p.ch+1)});
        }else{
          ta=document.createElement('textarea');ta.className='ed-ta';ta.spellcheck=false;ta.setAttribute('aria-label','Editor de código');host.appendChild(ta);
          ta.addEventListener('input',agenda);
          ta.addEventListener('keydown',function(e){if(e.key==='Tab'){e.preventDefault();var s=ta.selectionStart;ta.value=ta.value.slice(0,s)+'  '+ta.value.slice(ta.selectionEnd);ta.selectionStart=ta.selectionEnd=s+2}else if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();grava()}});
          pos.textContent='editor simples (sem destaque de cores)';
        }
      });
    }
    function desenhaAbas(){
      abas.textContent='';
      lista().forEach(function(nome){
        var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=nome;b.setAttribute('aria-selected',String(nome===atual));
        b.addEventListener('click',function(){E.abre(nome)});abas.appendChild(b);
      });
      var mais=document.createElement('button');mais.type='button';mais.className='ed-novo';mais.textContent='+';mais.title='Criar um arquivo novo';mais.setAttribute('aria-label','Criar um arquivo novo');
      mais.addEventListener('click',function(){
        var inp=document.createElement('input');inp.type='text';inp.className='ed-nome';inp.placeholder='nome.ext';inp.setAttribute('aria-label','Nome do arquivo novo');inp.maxLength=40;
        abas.replaceChild(inp,mais);inp.focus();
        function fim(ok){
          var v=inp.value.trim();
          if(ok&&v){
            if(!/^[\w.-]+\.(html|css|js|py|json|txt|md)$/i.test(v)){st.textContent='nome inválido: use letras, números, ponto e uma extensão (.html, .css, .js, .py, .json)';desenhaAbas();return}
            if(!S.no(pasta+'/'+v)){S.cria(S.partes(pasta+'/'+v),window.PA.fsArq(''));if(o.aoMudar)o.aoMudar(v,'')}
            desenhaAbas();E.abre(v);
          }else desenhaAbas();
        }
        inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();fim(true)}else if(e.key==='Escape'){fim(false)}});
        inp.addEventListener('blur',function(){setTimeout(function(){if(inp.parentNode)fim(false)},120)});
      });
      abas.appendChild(mais);
    }
    E.abre=function(nome){
      if(!(cm||ta))return pronto.then(function(){E.abre(nome)});
      var n=S.no(pasta+'/'+nome);if(!n||n.t!=='a')return;
      if(atual&&sujo)grava();
      atual=nome;ignora=true;
      if(cm){cm.setOption('mode',modo(nome));cm.setValue(n.c);cm.clearHistory();cm.refresh()}else ta.value=n.c;
      ignora=false;sujo=false;st.textContent='salvo';desenhaAbas();E.marca(marcas);
      if(o.aoAbrir)o.aoAbrir(nome);
    };
    /* o terminal ou um programa mudou arquivos: traz o texto novo para cá sem atrapalhar quem está digitando */
    E.atualiza=function(){
      if(!(cm||ta))return;
      var nomes=lista();if(!atual||nomes.indexOf(atual)<0){if(nomes.length&&!(atual&&sujo)){E.abre(o.padrao&&nomes.indexOf(o.padrao)>=0?o.padrao:nomes[0])}return}
      var n=S.no(pasta+'/'+atual);
      if(n&&n.t==='a'&&n.c!==texto()&&!sujo){ignora=true;var cur=cm?cm.getCursor():null;if(cm){cm.setValue(n.c);if(cur)cm.setCursor(cur)}else ta.value=n.c;ignora=false}
      desenhaAbas();
    };
    E.vaiPara=function(arq,lin){
      if(arq&&arq!==atual&&S.no(pasta+'/'+arq))E.abre(arq);
      if(cm&&lin){cm.focus();cm.setCursor({line:lin-1,ch:0});cm.scrollIntoView({line:lin-1,ch:0},80)}
    };
    E.marca=function(itens){
      marcas=itens||[];if(!cm)return;
      cm.operation(function(){
        for(var i=0;i<cm.lineCount();i++){cm.removeLineClass(i,'background','ed-l-erro');cm.removeLineClass(i,'background','ed-l-aviso')}
        marcas.forEach(function(m){if(!m.lin||(m.arq&&m.arq!==atual))return;if(m.lin-1<cm.lineCount())cm.addLineClass(m.lin-1,'background',m.n==='erro'?'ed-l-erro':'ed-l-aviso')});
      });
    };
    E.salva=grava;E.nome=function(){return atual};E.texto=texto;E.foco=function(){if(cm)cm.focus();else if(ta)ta.focus()};
    E.limpaSujo=function(){sujo=false};
    var pronto=monta().then(function(){desenhaAbas();E.atualiza()});
    E.pronto=pronto;
    return E;
  }
  window.PA=window.PA||{};window.PA.Editor=Editor;
})();
