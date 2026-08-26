/* =============================================================================
   nav.js — comportamento do cabeçalho, comum a todas as páginas.

   · esconde o header ao rolar para baixo, revela ao rolar para cima
   · abre/fecha o menu em tela cheia
   · alterna o par PT / EN

   Nota sobre o menu: no bundle original o overlay existia mas nenhum botão o
   abria — era código morto. Aqui o botão hambúrguer está no header e funciona,
   o que também dá navegação no mobile (onde a nav horizontal é escondida).

   Nota sobre PT / EN: continua sendo só um estado visual, como no original.
   Nenhum conteúdo é traduzido ainda. Quando houver tradução, o gancho é o
   evento 'inf:lang' disparado abaixo.
   ============================================================================= */
window.INF = window.INF || {};

(function () {
  'use strict';

  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header || header.classList.contains('site-header--static')) return;

    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      var menuOpen = document.body.classList.contains('menu-is-open');
      var hide = y > lastY && y > 90 && !menuOpen;
      header.classList.toggle('is-hidden', hide);
      lastY = y;
    }, { passive: true });
  }

  function initMenu() {
    var menu = document.querySelector('.menu');
    var toggles = document.querySelectorAll('[data-menu-toggle]');
    if (!menu || !toggles.length) return;

    function setOpen(open) {
      menu.hidden = !open;
      document.body.classList.toggle('menu-is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      for (var i = 0; i < toggles.length; i++) {
        toggles[i].classList.toggle('is-open', open);
        toggles[i].setAttribute('aria-expanded', open ? 'true' : 'false');
        var label = toggles[i].querySelector('[data-menu-label]');
        if (label) label.textContent = open ? 'Fechar' : 'Menu';
      }
      if (open) document.querySelector('.site-header').classList.remove('is-hidden');
    }

    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', function () {
        setOpen(menu.hidden);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) setOpen(false);
    });

    setOpen(false);
  }

  function initLang() {
    var groups = document.querySelectorAll('.lang');
    for (var g = 0; g < groups.length; g++) {
      (function (group) {
        var btns = group.querySelectorAll('[data-lang]');
        for (var i = 0; i < btns.length; i++) {
          btns[i].addEventListener('click', function (e) {
            var lang = e.currentTarget.getAttribute('data-lang');
            for (var j = 0; j < btns.length; j++) {
              btns[j].classList.toggle('is-on', btns[j].getAttribute('data-lang') === lang);
            }
            document.documentElement.setAttribute('lang', lang === 'EN' ? 'en' : 'pt-BR');
            document.dispatchEvent(new CustomEvent('inf:lang', { detail: { lang: lang } }));
          });
        }
      })(groups[g]);
    }
  }

  /* Liga o logo animado do header. Cada página chama isto passando a própria
     velocidade de fluxo. */
  window.INF.initChrome = function (flowSpeed) {
    var canvas = document.querySelector('[data-header-logo]');
    var chrome = new window.INF.HeatChrome({
      field: window.INF.field || (window.INF.field = new window.INF.HeatField()),
      logoCanvas: canvas,
      flowSpeed: flowSpeed == null ? 1 : flowSpeed
    });
    chrome.start();
    return chrome;
  };

  window.INF.initNav = function () {
    initHeaderScroll();
    initMenu();
    initLang();
  };
})();
