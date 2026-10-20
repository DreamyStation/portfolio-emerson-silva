/* CodeHome · programação geral 3: testes. O aluno escreve testes com assert; a conferência roda esses testes contra uma versão com defeitos (precisam falhar) e contra uma versão correta (precisam passar). */
(function(){
  'use strict';
  var PA=window.PA;
  var ri=function(L,a,b){return a+Math.floor(L.rnd()*(b-a+1))};
  function codigo(bugs){
    var c='def desconto(preco, pct):\n    """Devolve o preço com pct% de desconto, arredondado para 2 casas.\n    pct deve estar entre 0 e 100 e o preço não pode ser negativo; senão levanta ValueError."""\n';
    c+=bugs.indexOf('limite')>=0?'    if pct < 0:\n        raise ValueError("pct deve estar entre 0 e 100")\n':'    if pct < 0 or pct > 100:\n        raise ValueError("pct deve estar entre 0 e 100")\n';
    if(bugs.indexOf('negativo')<0)c+='    if preco < 0:\n        raise ValueError("preco não pode ser negativo")\n';
    if(bugs.indexOf('zero')>=0)c+='    if not pct:\n        return 0\n';
    c+=bugs.indexOf('arredonda')>=0?'    return preco * (100 - pct) / 100\n':'    return round(preco * (100 - pct) / 100, 2)\n';
    return c;
  }
  var TODOS=['limite','negativo','zero','arredonda'];
  function sorteiaBugs(L){var a=TODOS.slice(),r=[];while(r.length<2){r.push(a.splice(Math.floor(L.rnd()*a.length),1)[0])}return r}
  var DESCRICAO={limite:'aceita desconto maior que 100%',negativo:'aceita preço negativo',zero:'devolve 0 quando o desconto é 0%',arredonda:'não arredonda para 2 casas'};
  function confTexto(L){
    var casos=[[100,10],[19.99,0],[50,100],[33.33,15],[0,50],[ri(L,20,90)+0.5,ri(L,1,40)]];
    return 'import json, io, contextlib\nbuf = io.StringIO()\ndef referencia(preco, pct):\n    return round(preco * (100 - pct) / 100, 2)\ntry:\n    with contextlib.redirect_stdout(buf):\n        import desconto as d\n    ok = True\n    for p, c in '+JSON.stringify(casos)+':\n        if d.desconto(p, c) != referencia(p, c):\n            ok = False\n    for p, c in [(10, -1), (10, 101), (-5, 10)]:\n        try:\n            d.desconto(p, c)\n            ok = False\n        except ValueError:\n            pass\n    print(json.dumps({"ok": ok}))\nexcept BaseException as e:\n    print(json.dumps({"ok": False, "erro": str(e)}))\n';
  }
  var RODA='exec(compile(open("test_desconto.py", encoding="utf-8").read(), "test_desconto.py", "exec"), {"__name__": "__main__"})\n';
  var L=PA.Licao2({
    etapa:'g3',medalha2:'testes',fim:'testes automáticos concluídos',par:900,padrao:'test_desconto.py',arquivos:['test_desconto.py','desconto.py','teste.js','index.html'],
    brief:function(L){return [['Código sob teste','desconto.py','uma função com defeitos escondidos'],['Objetivo','Provar com assert','testes que pegam bugs e aprovam a versão certa'],['Conferência','Dois ensaios','contra a versão com bugs e contra uma versão correta']]},
    inicio:function(S,site,L){
      L.g3={bugs:sorteiaBugs(L)};L.g3.orig=codigo(L.g3.bugs);L.g3.ref=codigo([]);
      site.f['desconto.py']=PA.fsArq(L.g3.orig);
      site.f['test_desconto.py']=PA.fsArq('# Escreva testes com assert para a função desconto(preco, pct) do arquivo desconto.py.\n# Leia a função: ela tem defeitos. Seus testes precisam descobri-los!\n#\n# Formato de um teste:\n#   from desconto import desconto\n#   assert desconto(100, 10) == 90, "10% de 100 deve dar 90"\n#\n# Pense em: valor comum, 0%, 100%, arredondamento e erros (ValueError).\n');
      site.f['teste.js']=PA.fsArq('// Bônus: escreva uma função e dois console.assert; no fim, imprima "testes ok".\n');
    },
    aoPython:function(L,arq,res,t){
      var f=L.arq('test_desconto.py');if(!f||!/assert/.test(f))return;
      var g=L.g3t=L.g3t||PA.Arm.le('n2t:g3',{})||{};
      return L.confere(RODA,{'desconto.py':L.g3.orig}).then(function(a){
        g.pegou=!!(a.erro&&/AssertionError/.test(a.erroTexto));
        if(a.erro&&!/AssertionError/.test(a.erroTexto))t.lin('> Seus testes falharam por outro motivo (não por um assert): '+String(a.erroTexto).trim().split('\n').pop()+'.','er');
        else t.lin(g.pegou?'✔ Seus testes FALHAM no desconto.py original, como devem: eles descobriram um defeito.':'✘ Seus testes passaram no desconto.py original, então não descobrem os defeitos. Escreva casos mais exigentes.',g.pegou?'ok':'er');
        return L.confere(RODA,{'desconto.py':L.g3.ref});
      }).then(function(b){
        g.passa=!b.erro;
        t.lin(g.passa?'✔ Seus testes PASSAM em uma versão correta da função.':'✘ Seus testes falham até na versão correta ('+String(b.erroTexto).trim().split('\n').pop()+'). O erro pode estar no teste.',g.passa?'ok':'er');
        return L.confere(confTexto(L));
      }).then(function(c){
        var j=L.json(c);g.corrigida=!!(j&&j.ok);
        if(/def\s+desconto/.test(L.arq('desconto.py')||'')&&L.arq('desconto.py')!==L.g3.orig)t.lin(g.corrigida?'✔ Seu desconto.py passa na conferência escondida.':'✘ O seu desconto.py ainda falha na conferência escondida (veja o enunciado na docstring).',g.corrigida?'ok':'er');
        PA.Arm.grava('n2t:g3',g);
      });
    },
    objetivos:function(L){
      var d=L.g3.bugs.map(function(b){return DESCRICAO[b]}).join(' e ');
      L.g3t=PA.Arm.le('n2t:g3',{})||{};
      return [
        {txt:'Escreva testes (assert) em test_desconto.py que FALHEM no desconto.py original: ele tem dois defeitos escondidos. Rode python test_desconto.py.',exemplo:'python test_desconto.py',
          ok:function(L){return !!(L.g3t&&L.g3t.pegou)},
          dicas:['Leia a docstring de desconto: ela é a especificação. Cada frase dela vira um teste.','Casos clássicos: um valor comum (100 com 10% = 90), 0% (devolve o mesmo preço), 100% (devolve 0), arredondamento (19.99 com 15%).','Erros também se testam: coloque a chamada dentro de try e confirme que ValueError acontece (assert False, "deveria ter dado erro" depois da chamada). Os defeitos desta prática: '+d+'.']},
        {txt:'Seus testes também precisam PASSAR em uma versão correta da função (se falharem em tudo, não ajudam).',ok:function(L){return !!(L.g3t&&L.g3t.passa)},
          dicas:['A conferência troca o desconto.py por uma versão correta e roda o seu arquivo. Se falhar, o erro está no teste (um valor esperado errado, por exemplo).','Calcule o valor esperado à mão antes de escrever o assert: 19.99 com 10% = 17.99 (arredondado).','Valores com vírgula flutuante: compare com round(...) ou escolha números que dão resultados exatos.']},
        {txt:'Cubra pelo menos 4 casos com assert, incluindo um teste de erro com try/except ValueError.',
          ok:function(L){var c=(L.arq('test_desconto.py')||'').replace(/#.*$/gm,'');return (c.match(/\bassert\b/g)||[]).length>=4&&/except\s+ValueError/.test(c)},
          dicas:['Cada assert é um caso: valor comum, 0%, 100% e o arredondamento já são quatro.','Para o erro: try: desconto(10, 150) except ValueError: pass else: assert False, "150% deveria dar erro".','O assert recebe uma mensagem depois da vírgula: ela aparece quando o teste falha e ajuda a entender o motivo.']},
        {txt:'Bônus: conserte o desconto.py até os seus testes e a conferência escondida passarem.',bonus:true,exemplo:'python test_desconto.py',
          ok:function(L){return !!(L.g3t&&L.g3t.corrigida)&&L.hist.some(function(h){return h.t==='py'&&h.ok&&h.arq==='test_desconto.py'})},
          dicas:['Rode python test_desconto.py: o assert que falhou mostra qual regra está quebrada.','Compare a função com a docstring, regra por regra: limite do desconto, preço negativo, o caso de 0% e o arredondamento.','Corrija um defeito por vez e rode de novo: os testes viram sua rede de segurança.']},
        {txt:'Bônus: no teste.js, escreva uma função e dois console.assert, e imprima "testes ok" no fim (rode com node teste.js).',bonus:true,exemplo:'node teste.js',
          ok:function(L){return L.hist.some(function(h){return h.t==='js'&&h.ok&&h.arq==='teste.js'&&/console\.assert[\s\S]*console\.assert/.test(h.codigo)&&/testes ok/.test(h.texto)})},
          dicas:['console.assert(condição, "mensagem") escreve um aviso se a condição for falsa e não faz nada se for verdadeira.','function dobro(n) { return n * 2 } e depois console.assert(dobro(4) === 8, "dobro de 4")','Se algum console.assert falhar o aviso aparece no console; só imprima "testes ok" quando todos passarem.']}
      ];
    }
  });
})();
