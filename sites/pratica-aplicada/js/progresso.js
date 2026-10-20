/* CodeHome · progresso guardado no navegador, "continue de onde parou", escolha por dificuldade e assunto e pular direto para uma aula.
   O terminal de cada aula guarda o próprio instantâneo (ver Terminal em app.js); aqui ficam o resumo por aula e a tela inicial. */
(function(){
  'use strict';
  var PA=window.PA=window.PA||{};
  var Arm=PA.Arm,$=PA.$,$$=PA.$$;

  /* enquanto a aula é restaurada, rolagens automáticas ficam desligadas (a pessoa volta para onde estava) */
  var sv=Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView=function(){if(PA.restaurando)return;return sv.apply(this,arguments)};

  var NIVEIS={iniciante:'Iniciante',intermediario:'Intermediário',avancado:'Avançado'};
  var TEMAS={terminal:'Terminal',html:'HTML',css:'CSS',js:'JavaScript',python:'Python',web:'Servidores e segurança',git:'Git e publicação',depur:'Lógica, testes e depuração'};
  /* id = chave do progresso (e da etapa da prática); n1 = precisa da prática montada na aula 3 */
  var AULAS=[
    {id:'aula1',href:'aula-1.html',n:'Aula 1',t:'Como um site funciona',nivel:'iniciante',temas:['web']},
    {id:'aula2',href:'aula-2.html',n:'Aula 2',t:'Seu ambiente de trabalho',nivel:'iniciante',temas:['terminal']},
    {id:'fluxo',href:'aula-3.html',n:'Aula 3',t:'Planeje o fluxo',nivel:'iniciante',temas:['html']},
    {id:'html',href:'aula-4.html',n:'Aula 4',t:'HTML na prática',nivel:'iniciante',temas:['html','terminal'],n1:1},
    {id:'css',href:'aula-5.html',n:'Aula 5',t:'CSS, a aparência',nivel:'iniciante',temas:['css'],n1:1},
    {id:'resp',href:'aula-6.html',n:'Aula 6',t:'CSS responsivo',nivel:'iniciante',temas:['css'],n1:1},
    {id:'js',href:'aula-7.html',n:'Aula 7',t:'JavaScript',nivel:'iniciante',temas:['js'],n1:1},
    {id:'api',href:'aula-8.html',n:'Aula 8',t:'Backend e API',nivel:'intermediario',temas:['web','js'],n1:1},
    {id:'login',href:'aula-9.html',n:'Aula 9',t:'Login e segurança',nivel:'intermediario',temas:['web'],n1:1},
    {id:'deploy',href:'aula-10.html',n:'Aula 10',t:'Publicar',nivel:'intermediario',temas:['git','terminal'],n1:1},
    {id:'py1',href:'aula-11.html',n:'Aula 11',t:'Python, primeiros passos',nivel:'iniciante',temas:['python']},
    {id:'py2',href:'aula-12.html',n:'Aula 12',t:'Python escreve o HTML',nivel:'intermediario',temas:['python','html']},
    {id:'py3',href:'aula-13.html',n:'Aula 13',t:'Dados em JSON e várias páginas',nivel:'intermediario',temas:['python','web']},
    {id:'mx1',href:'aula-14.html',n:'Aula 14',t:'Visual Matrix com CSS',nivel:'intermediario',temas:['css']},
    {id:'mx2',href:'aula-15.html',n:'Aula 15',t:'Efeitos Matrix com JavaScript',nivel:'avancado',temas:['js']},
    {id:'final',href:'aula-16.html',n:'Aula 16',t:'Desafio final',nivel:'avancado',temas:['python','css','js']},
    {id:'g1',href:'prog-1.html',n:'Programação 1',t:'Depuração: achar o bug',nivel:'intermediario',temas:['depur','python','js']},
    {id:'g2',href:'prog-2.html',n:'Programação 2',t:'Lógica de programação',nivel:'intermediario',temas:['depur','python']},
    {id:'g3',href:'prog-3.html',n:'Programação 3',t:'Testes: provar que funciona',nivel:'avancado',temas:['depur','python']},
    {id:'g4',href:'prog-4.html',n:'Programação 4',t:'Código limpo e refatoração',nivel:'intermediario',temas:['depur','python']}
  ];
  var ORDEM1=['fluxo','html','css','resp','js','api','login','deploy'];

  var Prog={AULAS:AULAS,NIVEIS:NIVEIS,TEMAS:TEMAS};
  Prog.todos=function(){return Arm.le('prog',{})};
  Prog.get=function(id){return Prog.todos()[id]||null};
  Prog.set=function(id,o){var t=Prog.todos(),a=t[id]||{};Object.keys(o).forEach(function(k){a[k]=o[k]});a.ts=Date.now();t[id]=a;Arm.grava('prog',t)};
  Prog.concluida=function(id){
    if(id==='aula1')return !!Arm.le('aula1',false);
    if(id==='aula2')return !!Arm.le('aula2',false);
    var p=PA.Partida&&PA.Partida.get();return !!(p&&p.etapas&&p.etapas[id]&&p.etapas[id].fim);
  };
  /* resumo de uma aula para mostrar na tela: {fim, txt, ts} */
  var T=function(x){return PA.I18n?PA.I18n.t(x):x};
  Prog.estado=function(a){
    var g=Prog.get(a.id)||{},fim=Prog.concluida(a.id);
    var p=PA.Partida&&PA.Partida.get(),pulada=!!(p&&p.etapas&&p.etapas[a.id]&&p.etapas[a.id].pulada);
    if(fim)return {fim:true,txt:T('Concluída'),curto:'',ts:g.ts||0,pulada:pulada};
    var curto='';
    if(g.total&&g.passo>0)curto=T('passo')+' '+g.passo+' '+T('de')+' '+g.total;
    else if(g.total2&&g.feitos>0)curto=g.feitos+' '+T('de')+' '+g.total2+' '+T('objetivos');
    return {fim:false,txt:curto?T('Em andamento')+' · '+curto:'',curto:curto,ts:curto?(g.ts||0):0};
  };
  Prog.ultima=function(){
    var m=null;AULAS.forEach(function(a){var e=Prog.estado(a);if(!e.fim&&e.ts&&(!m||e.ts>m.e.ts))m={a:a,e:e}});return m;
  };

  /* ---------- pular direto para uma aula: monta uma prática com as etapas anteriores marcadas como puladas ---------- */
  Prog.pular=function(etapa){
    var P=PA.Partida,p=P.nova({}),T=P.TIPOS[p.tipo],i=ORDEM1.indexOf(etapa);
    p.fluxo=(T.essenciais||T.paginas.slice(0,3).map(function(x){return x.id})).slice();
    ORDEM1.slice(0,Math.max(0,i)).forEach(function(e){p.etapas[e]={ms:0,pen:0,fim:true,pistas:0,erros:0,pulada:true,nota:2,med2:2}});
    if(etapa!=='html'&&i>1)p.html=P.htmlPadrao(p);
    if(i>2)p.css=P.cssPadrao(p);
    p.pulou=etapa;P.grava(p);
    ORDEM1.slice(0,Math.max(0,i)).forEach(function(e){Arm.grava('term:'+e,null)});
    return p;
  };
  /* botão "Começar direto aqui" nas aulas que dependem da prática montada nas aulas anteriores */
  function botaoPular(){
    var caixa=$('#sem-partida'),pg=location.pathname.split('/').pop(),a=AULAS.filter(function(x){return x.href===pg})[0];
    if(!caixa||!a||!a.n1)return;
    var ac=$('.acoes',caixa);if(!ac||$('#pular-aqui',ac))return;
    var b=document.createElement('button');b.type='button';b.id='pular-aqui';b.className='btn cl';b.textContent='Começar direto nesta aula';
    var n=document.createElement('p');n.className='nota-pular';n.style.cssText='margin:14px 0 0;max-width:60ch;font-size:.9rem;opacity:.85';
    n.textContent='Monta uma prática pronta e pula as aulas anteriores. As etapas puladas não entram no ranking nem no tempo do curso.';
    b.addEventListener('click',function(){Prog.pular(a.id);location.reload()});
    ac.appendChild(b);ac.parentNode.insertBefore(n,ac.nextSibling);
  }

  /* ---------- tela inicial: continuar, status nas aulas e escolha por dificuldade/assunto ---------- */
  function el(tag,cl,txt){var e=document.createElement(tag);if(cl)e.className=cl;if(txt!=null)e.textContent=txt;return e}
  function emblema(a){
    var e=Prog.estado(a),b=el('span','pg'+(e.fim?' ok':e.txt?' em':''),e.fim?(e.pulada?'Etapa pulada':'✔ Concluída'):(e.txt||''));return e.fim||e.txt?b:null;
  }
  function marcaCartoes(){
    $$('a.est[href^="aula-"],a.est[href^="prog-"]').forEach(function(c){
      if($('.pg',c))return;var a=AULAS.filter(function(x){return x.href===c.getAttribute('href')})[0];if(!a)return;
      var b=emblema(a);if(b)c.appendChild(b);
    });
  }
  function continuar(){
    var box=$('#continuar');if(!box)return;var u=Prog.ultima();
    if(!u){box.hidden=true;return}
    box.hidden=false;box.textContent='';
    box.appendChild(el('span','rot','Continue de onde parou'));
    var l=el('p','cont-l');l.appendChild(el('b',null,u.a.n+' · '+u.a.t));l.appendChild(document.createTextNode(' — '+u.e.curto));box.appendChild(l);
    var a=el('a','btn jg','Continuar');a.href=u.a.href;box.appendChild(a);
  }
  function explorador(){
    var raiz=$('#exp');if(!raiz)return;
    var f={nivel:'',tema:''};
    var barra=el('div','exp-filtros'),lista=el('div','exp-lista');
    function grupo(titulo,chave,opcoes){
      var g=el('div','exp-grupo');g.appendChild(el('b','exp-tit',titulo));var cs=el('div','chips-f');
      [['','Todos']].concat(Object.keys(opcoes).map(function(k){return [k,opcoes[k]]})).forEach(function(o){
        var b=el('button',null,o[1]);b.type='button';b.dataset.v=o[0];b.setAttribute('aria-pressed',String(f[chave]===o[0]));
        b.addEventListener('click',function(){f[chave]=o[0];$$('button',cs).forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.v===f[chave]))});desenha();if(PA.Som)PA.Som.clique()});cs.appendChild(b);
      });g.appendChild(cs);barra.appendChild(g);
    }
    grupo('Dificuldade','nivel',NIVEIS);grupo('Assunto','tema',TEMAS);
    function desenha(){
      lista.textContent='';
      var ach=AULAS.filter(function(a){return (!f.nivel||a.nivel===f.nivel)&&(!f.tema||a.temas.indexOf(f.tema)>=0)});
      if(!ach.length){lista.appendChild(el('p','vazio','Nenhuma aula com essa combinação.'));return}
      ach.forEach(function(a){
        var li=el('a','exp-item');li.href=a.href;
        li.appendChild(el('span','exp-n',a.n));li.appendChild(el('b',null,a.t));
        li.appendChild(el('span','exp-nv nv-'+a.nivel,NIVEIS[a.nivel]));
        var tm=el('span','exp-tm',a.temas.map(function(k){return TEMAS[k]}).join(' · '));li.appendChild(tm);
        var b=emblema(a);if(b)li.appendChild(b);
        lista.appendChild(li);
      });
      if(PA.Termos&&PA.I18n&&PA.I18n.en)PA.I18n.aplica(lista);
    }
    raiz.appendChild(barra);raiz.appendChild(lista);desenha();
  }
  function inicio(){botaoPular();marcaCartoes();continuar();explorador()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inicio);else inicio();

  PA.Prog=Prog;
})();
