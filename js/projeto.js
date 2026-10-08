/* =============================================================================
   projeto.js — página de detalhe de um filme.

   Esta é a única página realmente parametrizada: um template servido para os
   seis filmes, escolhido pelo parâmetro ?f=<slug>. Sem parâmetro, mostra
   motel-destino.

   O HTML já vem preenchido com motel-destino, então a página faz sentido
   mesmo antes do JS rodar (e o Figma importa uma página cheia, não vazia).
   Este arquivo substitui esse conteúdo quando o slug é outro.
   ============================================================================= */
window.INF = window.INF || {};

(function () {
  'use strict';

  var FLOW_SPEED = 1;
  var DEFAULT_SLUG = 'motel-destino';

  /* grão usado no hover da faixa "todos os projetos", por cima do gradiente */
  var GRAIN = "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22%3E%3Cfilter id=%22g%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3CfeColorMatrix type=%22saturate%22 values=%220%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23g)%22 opacity=%221%22/%3E%3C/svg%3E')";

  function currentSlug() {
    var slug = DEFAULT_SLUG;
    try {
      var q = new URLSearchParams(window.location.search).get('f');
      if (q) slug = q;
    } catch (e) {}
    return slug;
  }

  function setText(sel, value) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) els[i].textContent = value;
  }

  /* ------------------------------------------------------------- render */

  function render(film) {
    document.title = film.title + ' — Inflamável';

    setText('[data-f="title"]', film.title);
    setText('[data-f="format"]', film.format);
    setText('[data-f="year"]', film.year);
    setText('[data-f="country"]', film.country);
    setText('[data-f="duration"]', film.duration);
    setText('[data-f="director"]', film.director);
    setText('[data-f="roteiro"]', film.roteiro);
    setText('[data-f="elenco"]', film.elenco.join(', '));
    setText('[data-f="synopsis"]', film.synopsis);
    setText('[data-f="destaque"]', film.destaque);

    var stills = (film.stills && film.stills.length) ? film.stills : [film.img];
    var track = document.querySelector('.hero__track');
    if (!track) return stills;

    track.innerHTML = '';
    for (var i = 0; i < stills.length; i++) {
      var slide = document.createElement('div');
      slide.className = 'hero__slide';
      var img = document.createElement('img');
      img.src = stills[i];
      img.alt = film.title;
      slide.appendChild(img);
      track.appendChild(slide);
    }

    /* as setas só fazem sentido com mais de uma imagem */
    var multi = stills.length > 1;
    var setas = document.querySelectorAll('.hero__arrow');
    for (var c = 0; c < setas.length; c++) setas[c].hidden = !multi;

    return stills;
  }

  /* ------------------------------------------------------------- hero */

  function Hero(count) {
    this.count = count || 1;
    this.i = 0;
    this.track = document.querySelector('.hero__track');
  }

  Hero.prototype.apply = function () {
    if (this.track) this.track.style.transform = 'translateX(-' + (this.i * 100) + '%)';
  };

  Hero.prototype.go = function (n) {
    var c = this.count;
    this.i = ((n % c) + c) % c;
    this.apply();
  };

  Hero.prototype.bind = function () {
    var self = this;
    var prev = document.querySelector('.hero__arrow--prev');
    var next = document.querySelector('.hero__arrow--next');
    if (prev) prev.addEventListener('click', function () { self.go(self.i - 1); });
    if (next) next.addEventListener('click', function () { self.go(self.i + 1); });
  };

  /* --------------------------------------------------- faixa de retorno */

  function bindBackBand() {
    var band = document.querySelector('.back-band');
    if (!band) return;
    band.addEventListener('mouseenter', function () {
      band.style.color = '#fff';
      band.style.backgroundImage = GRAIN + ',var(--heat)';
      band.style.backgroundSize = '150px 150px, cover';
      band.style.backgroundRepeat = 'repeat, no-repeat';
      band.style.backgroundPosition = 'center, center';
      band.style.backgroundBlendMode = 'overlay';
    });
    band.addEventListener('mouseleave', function () {
      band.style.color = '';
      band.style.backgroundImage = 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.INF.initNav();
    window.INF.initChrome(FLOW_SPEED);

    var film = window.INF.filmBySlug(currentSlug()) || window.INF.filmBySlug(DEFAULT_SLUG);
    var stills = render(film);
    new Hero(stills.length).bind();
    bindBackBand();
  });
})();
