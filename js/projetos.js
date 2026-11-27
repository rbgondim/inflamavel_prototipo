/* =============================================================================
   projetos.js — listagem de filmes.

   O markup dos seis cards está escrito em projetos.html (não é gerado aqui),
   para que a página continue legível e importável no Figma. Este arquivo cuida
   só do comportamento:

   · marca como ativo o card que está na frente (amplia a imagem e abre a
     barra de acento)
   · amostra cinco cores da própria imagem para pintar essa barra de acento
   · liga as duas setas

   A rolagem em si é do navegador: o trilho é um flex com overflow-x e
   scroll-snap no css. Daqui só sai o scrollTo das setas.
   ============================================================================= */
window.INF = window.INF || {};

(function () {
  'use strict';

  var FLOW_SPEED = 1;

  /* satura e clareia a média de cada faixa — a cor crua de um still costuma ser
     lavada demais para virar acento */
  function punch(r, g, b) {
    var avg = (r + g + b) / 3, f = 1.55, br = 1.12;
    function cl(v) { return Math.max(0, Math.min(255, v)); }
    return [cl((avg + (r - avg) * f) * br), cl((avg + (g - avg) * f) * br), cl((avg + (b - avg) * f) * br)];
  }

  var sampler = null;

  function samplePalette(card) {
    if (!card || card.dataset.pal) return;
    var img = card.querySelector('.film__img');
    var accent = card.querySelector('.film__accent');
    if (!img || !accent || !img.complete || !img.naturalWidth) return;

    var W = 40, H = 24;
    var c = sampler || (sampler = document.createElement('canvas'));
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    var data;
    try {
      ctx.drawImage(img, 0, 0, W, H);
      data = ctx.getImageData(0, 0, W, H).data;
    } catch (e) {
      return; /* canvas contaminado — mantém o gradiente heat padrão */
    }

    var cols = 5, stops = [];
    for (var k = 0; k < cols; k++) {
      var x0 = Math.floor(k * W / cols), x1 = Math.floor((k + 1) * W / cols);
      var r = 0, g = 0, b = 0, n = 0;
      for (var x = x0; x < x1; x++) {
        for (var y = 0; y < H; y++) {
          var i = (y * W + x) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
      }
      var p = punch(r / n, g / n, b / n);
      stops.push('rgb(' + Math.round(p[0]) + ',' + Math.round(p[1]) + ',' + Math.round(p[2]) + ')');
    }
    accent.style.backgroundImage = 'linear-gradient(90deg,' + stops.join(',') + ')';
    card.dataset.pal = '1';
  }

  var trilho = null, cards = [];

  /* qual card ocupa o meio da tela na horizontal */
  function indiceAtual() {
    var mid = window.innerWidth / 2;
    for (var i = 0; i < cards.length; i++) {
      var r = cards[i].getBoundingClientRect();
      if (r.left < mid && r.right > mid) return i;
    }
    return 0;
  }

  function updateActive() {
    var atual = indiceAtual();
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('is-active', i === atual);
    }
    /* a seta que não tem para onde ir se apaga em vez de sumir: o par fica
       no lugar e a barra não dança a cada filme */
    var setas = document.querySelectorAll('.films__arrow');
    for (var k = 0; k < setas.length; k++) {
      var d = +setas[k].dataset.dir;
      setas[k].disabled = (d < 0 && atual === 0) || (d > 0 && atual === cards.length - 1);
    }
  }

  function irPara(n) {
    if (!trilho || !cards.length) return;
    n = Math.max(0, Math.min(cards.length - 1, n));
    trilho.scrollTo({ left: cards[n].offsetLeft, behavior: 'smooth' });
  }

  function initSetas() {
    var setas = document.querySelectorAll('.films__arrow');
    for (var i = 0; i < setas.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { irPara(indiceAtual() + (+b.dataset.dir)); });
      })(setas[i]);
    }
  }

  function initImages() {
    var imgs = document.querySelectorAll('.film__img');
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        if (img.complete && img.naturalWidth) {
          samplePalette(img.closest('.film'));
        } else {
          img.addEventListener('load', function () { samplePalette(img.closest('.film')); });
        }
      })(imgs[i]);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.INF.initNav();
    window.INF.initChrome(FLOW_SPEED);

    trilho = document.querySelector('.films');
    cards = [].slice.call(document.querySelectorAll('.film'));

    initImages();
    initSetas();
    updateActive();
    setTimeout(updateActive, 200);

    /* o scroll agora é do trilho, não da janela */
    if (trilho) trilho.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);

    /* a janela ainda rola na vertical, mas só até o rodapé — e lá as setas
       não têm o que fazer */
    var nav = document.querySelector('.films__nav');
    if (nav) {
      window.addEventListener('scroll', function () {
        nav.classList.toggle('is-off', window.scrollY > window.innerHeight * 0.4);
      }, { passive: true });
    }

    /* seta do teclado anda um filme; o Tab já anda sozinho, porque cada card
       é um link e o navegador rola o foco para dentro da vista */
    window.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') irPara(indiceAtual() + 1);
      else if (e.key === 'ArrowLeft') irPara(indiceAtual() - 1);
    });
  });
})();
