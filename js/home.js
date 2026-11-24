/* =============================================================================
   home.js — splash + carrossel da home.

   Os quatro números abaixo eram "props" ajustáveis no editor de origem. Ficam
   aqui no topo porque são os botões de sintonia fina desta página.
   ============================================================================= */
window.INF = window.INF || {};

(function () {
  'use strict';

  var FLOW_SPEED = 2.3;   /* velocidade do campo de ruído no splash */
  var GRAIN = 1;           /* opacidade do grão sobre o splash (0–1) */
  var START_ON_HOME = false;

  /* O splash aparece uma vez por sessão. Sem isto, clicar em "Home" vindo de
     qualquer outra página fazia a animação inteira recomeçar. Para voltar ao
     comportamento antigo (splash em todo carregamento), troque para false. */
  var SPLASH_ONCE_PER_SESSION = true;

  /* Quanto cada imagem fica na tela antes de passar sozinha. A transição em si
     leva .8s (css: .carousel__track). 0 desliga a passagem automática. */
  var AUTOPLAY_MS = 5500;



  var SX = 3.4, SY = 2.0; /* escala do campo no splash — mais largo que o do header */

  function Home() {
    this.field = window.INF.field || (window.INF.field = new window.INF.HeatField());

    this.splash = document.querySelector('.splash');
    this.bg = document.querySelector('.splash__bg');
    this.grain = document.querySelector('.splash__grain');
    this.stage = document.querySelector('.splash__stage');

    this.track = document.querySelector('.carousel__track');
    this.slideCount = this.track ? this.track.children.length : 0;

    this.slide = 0;
    this.entered = START_ON_HOME || !this.splash;
    this.leaving = false;

    this.cur = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.target = { x: this.cur.x, y: this.cur.y };
    this.timer = null;
    this._lastBg = 0;
  }

  Home.prototype.init = function () {
    var self = this;

    if (SPLASH_ONCE_PER_SESSION && this.splash) {
      var seen = false;
      try { seen = sessionStorage.getItem('inf:splash') === '1'; } catch (e) {}
      /* ?splash=1 força o splash mesmo já tendo sido visto — útil para revisar */
      if (location.search.indexOf('splash=1') !== -1) seen = false;
      if (seen) this.entered = true;
    }

    if (this.entered && this.splash) {
      this.splash.hidden = true;
    } else if (this.splash) {
      try { sessionStorage.setItem('inf:splash', '1'); } catch (e) {}
    }

    if (this.grain) this.grain.style.opacity = String(GRAIN);


    this.bindSplash();
    this.bindCarousel();
    this.setBgSize();
    window.addEventListener('resize', function () { self.setBgSize(); });

    this.applyTrack();
    if (this.entered) this.startAuto();

    /* em aba escondida o setInterval se acumula e o carrossel volta correndo */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) self.stopAuto();
      else if (self.entered) self.startAuto();
    });

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  };

  /* ------------------------------------------------------------- splash */

  Home.prototype.bindSplash = function () {
    if (!this.splash) return;
    var self = this;

    var move = function (e) {
      var p = (e.touches && e.touches[0]) ? e.touches[0] : e;
      self.target.x = p.clientX;
      self.target.y = p.clientY;
    };
    this.splash.addEventListener('mousemove', move);
    this.splash.addEventListener('touchmove', move);
    this.splash.addEventListener('touchstart', move);
    this.splash.addEventListener('click', function () { self.enter(); });

  };

  Home.prototype.enter = function () {
    if (this.leaving || this.entered) return;
    this.leaving = true;
    this.splash.classList.add('is-leaving');
    var self = this;
    setTimeout(function () {
      self.entered = true;
      self.splash.hidden = true;
      self.startAuto();
    }, 950);
  };

  Home.prototype.setBgSize = function () {
    if (!this.bg) return;
    /* o canvas é minúsculo de propósito: o blur do CSS faz o resto e o custo
       por quadro cai para quase nada */
    this.bg.width = Math.max(110, Math.round(window.innerWidth / 11));
    this.bg.height = Math.max(70, Math.round(window.innerHeight / 11));
  };

  Home.prototype.renderBg = function (t, mx, my) {
    var cv = this.bg;
    if (!cv) return;
    var W = cv.width, H = cv.height;
    var ctx = cv.getContext('2d');
    var img = ctx.createImageData(W, H), d = img.data;
    for (var y = 0; y < H; y++) {
      var fy = (y / H) * SY;
      for (var x = 0; x < W; x++) {
        var n = this.field.field((x / W) * SX, fy, t, mx, my);
        var c = this.field.rampColor(this.field.shape(n));
        var i = (y * W + x) * 4;
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  };


  /* ---------------------------------------------------------- carrossel */

  Home.prototype.bindCarousel = function () {
    var self = this;

    window.addEventListener('keydown', function (e) {
      if (!self.entered) {
        if (e.key === 'Enter' || e.key === ' ') self.enter();
        return;
      }
      if (e.key === 'ArrowRight') self.go(self.slide + 1);
      else if (e.key === 'ArrowLeft') self.go(self.slide - 1);
    });
  };

  Home.prototype.go = function (i) {
    var c = this.slideCount || 1;
    this.slide = ((i % c) + c) % c;
    this.applyTrack();
    /* quem passou à mão merece o tempo cheio na imagem que escolheu */
    if (this.timer) this.startAuto();
  };

  /* ------------------------------------------------- passagem automática */

  Home.prototype.startAuto = function () {
    this.stopAuto();
    if (!AUTOPLAY_MS || this.slideCount < 2) return;
    /* quem pediu menos movimento no sistema não recebe carrossel andando só */
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var self = this;
    this.timer = setInterval(function () {
      self.slide = (self.slide + 1) % self.slideCount;
      self.applyTrack();
    }, AUTOPLAY_MS);
  };

  Home.prototype.stopAuto = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  };

  Home.prototype.applyTrack = function () {
    if (this.track) this.track.style.transform = 'translateX(-' + (this.slide * 100) + 'vw)';
  };

  /* --------------------------------------------------------------- loop */

  Home.prototype.loop = function (now) {
    if (!this.entered) {
      this.cur.x += (this.target.x - this.cur.x) * 0.06;
      this.cur.y += (this.target.y - this.cur.y) * 0.06;
      var t = (now / 1000) * FLOW_SPEED;
      var mx = this.cur.x / window.innerWidth;
      var my = this.cur.y / window.innerHeight;
      if (now - this._lastBg > 32) { this.renderBg(t, mx, my); this._lastBg = now; }
    }
    requestAnimationFrame(this.loop);
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.INF.initNav();
    window.INF.initChrome(FLOW_SPEED);
    new Home().init();
  });
})();
