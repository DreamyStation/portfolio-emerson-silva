/* pop.js · animações fluidas de entrada e saída (pop in / pop out) ao rolar a página.
   Uso: <script src="pop.js" defer></script>
   - marca sozinho títulos, botões, cards, ícones, imagens e itens de lista;
   - elementos entram com pop (escala com leve ressalto) e saem com pop out ao deixar a tela;
   - novos itens de listas redesenhadas (ex.: trocar de aba) também entram com pop;
   - respeita prefers-reduced-motion; sem JS a página aparece normal.
   Para marcar à mão: data-pop (entrada) · data-pop="none" (ignorar). Opções: window.POP = {selector, extra, exclude}. */
(function () {
  if (window.__pop) return; window.__pop = true;
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduz || !('IntersectionObserver' in window)) return;
  var cfg = window.POP || {};
  var SEL = cfg.selector || [
    'main h1,main h2,main h3,section h1,section h2,section h3,.hero h1,.hero p',
    '.btn,.button,.cta,button.aba,.aba,.chip,.tab',
    '.card,.item,.vit,.passo,.preco,.disco,.foto,.selo,.etiqueta,.nota',
    'main img,section img,.hero img,.thumb',
    'main li,section li,.grade>*,.itens>*,.passos>*',
    'svg.ic,.ic'
  ].join(',') + (cfg.extra ? ',' + cfg.extra : '');
  var EXCL = (cfg.exclude ? cfg.exclude + ',' : '') + '.carrinho,.modal,.folha,.topo,header,nav,footer img,[data-pop=none],.abas,.demo';
  var css = document.createElement('style');
  css.textContent =
    '[data-pop]{opacity:0;transform:scale(.55) translateY(18px);will-change:transform,opacity}' +
    '[data-pop].pop-in{animation:popIn .62s cubic-bezier(.2,1.35,.35,1) both;animation-delay:var(--pd,0ms)}' +
    '[data-pop].pop-out{animation:popOut .28s cubic-bezier(.5,0,.8,.4) both}' +
    '@keyframes popIn{0%{opacity:0;transform:scale(.55) translateY(18px)}55%{opacity:1;transform:scale(1.07) translateY(-3px)}78%{transform:scale(.98) translateY(0)}100%{opacity:1;transform:scale(1) translateY(0)}}' +
    '@keyframes popOut{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.7) translateY(14px)}}' +
    '@media (prefers-reduced-motion:reduce){[data-pop]{opacity:1!important;transform:none!important;animation:none!important}}';
  document.head.appendChild(css);

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var el = e.target;
      if (e.isIntersecting) {
        if (!el.classList.contains('pop-in') || el.classList.contains('pop-out')) {
          el.classList.remove('pop-out'); void el.offsetWidth; el.classList.add('pop-in');
        }
      } else if (el.classList.contains('pop-in')) {
        el.classList.remove('pop-in'); el.classList.add('pop-out');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  function marca(raiz, escalona) {
    var lista = [];
    try { raiz.querySelectorAll ? lista = [].slice.call(raiz.querySelectorAll(SEL)) : 0; } catch (e) {}
    if (raiz.matches && raiz.matches(SEL)) lista.unshift(raiz);
    var n = 0;
    lista.forEach(function (el) {
      if (el.hasAttribute('data-pop') || el.closest(EXCL) || el.matches(EXCL)) return;
      if (el.querySelector && el.querySelector('[data-pop]') && !el.matches('li,.card,.item')) return;
      var i = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
      el.style.setProperty('--pd', (escalona ? Math.min(n, 8) * 55 : Math.min(i, 6) * 60) + 'ms');
      el.setAttribute('data-pop', '');
      io.observe(el); n++;
    });
  }

  function iniciar() {
    marca(document.body, false);
    // listas redesenhadas: anima novos itens, exceto quando o clique veio de dentro da própria lista (ex.: botões + e −)
    var ultimoClique = { t: 0, alvo: null };
    document.addEventListener('click', function (e) { var anc = []; for (var n = e.target; n; n = n.parentNode) anc.push(n); ultimoClique = { t: Date.now(), anc: anc }; }, true);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.addedNodes.length < 1) return;
        var alvo = m.target;
        var dentro = ultimoClique.anc && ultimoClique.anc.indexOf(alvo) > -1 && Date.now() - ultimoClique.t < 500;
        if (dentro) return;
        [].forEach.call(m.addedNodes, function (nd) { if (nd.nodeType === 1) marca(nd, true); });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  window.Pop = { marca: marca };
})();
