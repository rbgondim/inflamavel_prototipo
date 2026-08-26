/* =============================================================================
   home.js — splash + carrossel da home.

   Os quatro números abaixo eram "props" ajustáveis no editor de origem. Ficam
   aqui no topo porque são os botões de sintonia fina desta página.
   ============================================================================= */
window.INF = window.INF || {};

(function () {
  'use strict';

  var FLOW_SPEED = 2.3;   /* velocidade do campo de ruído no splash */
  var LOGO_VISIBILITY = 1; /* 0 = logo recebe a cor crua do gradiente, 1 = quase branco */
  var GRAIN = 1;           /* opacidade do grão sobre o splash (0–1) */
  var START_ON_HOME = false;

  /* O splash aparece uma vez por sessão. Sem isto, clicar em "Home" vindo de
     qualquer outra página fazia a animação inteira recomeçar. Para voltar ao
     comportamento antigo (splash em todo carregamento), troque para false. */
  var SPLASH_ONCE_PER_SESSION = true;

  var SX = 3.4, SY = 2.0; /* escala do campo no splash — mais largo que o do header */

  function Home() {
    this.field = window.INF.field || (window.INF.field = new window.INF.HeatField());

    this.splash = document.querySelector('.splash');
    this.bg = document.querySelector('.splash__bg');
    this.grain = document.querySelector('.splash__grain');
    this.logoCanvas = document.querySelector('.splash__logo');

    this.track = document.querySelector('.carousel__track');
    this.dots = document.querySelector('.dots');
    this.slideCount = this.track ? this.track.children.length : 0;

    this.slide = 0;
    this.entered = START_ON_HOME || !this.splash;
    this.leaving = false;

    this.cur = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.target = { x: this.cur.x, y: this.cur.y };
    this.hoverLogo = false;
    this._hp = 0;
    this._lastBg = 0;
    this.logoReady = false;
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

    this.logoImg = new Image();
    this.logoImg.onload = function () { self.logoReady = true; };
    this.logoImg.src = 'assets/img/logo-white.png';

    /* canvas de baixa resolução onde o gradiente do logo é calculado antes de
       ser ampliado — 190x54 é suficiente porque o resultado é suave */
    this.lf = document.createElement('canvas');
    this.lf.width = 190;
    this.lf.height = 54;

    this.bindSplash();
    this.bindCarousel();
    this.setBgSize();
    window.addEventListener('resize', function () { self.setBgSize(); });

    this.applyTrack();
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

    if (this.logoCanvas) {
      this.logoCanvas.addEventListener('mouseenter', function () { self.hoverLogo = true; });
      this.logoCanvas.addEventListener('mouseleave', function () { self.hoverLogo = false; });
    }
  };

  Home.prototype.enter = function () {
    if (this.leaving || this.entered) return;
    this.leaving = true;
    this.splash.classList.add('is-leaving');
    var self = this;
    setTimeout(function () {
      self.entered = true;
      self.splash.hidden = true;
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

  /* O logo do splash é o gradiente recortado pela silhueta do PNG. No hover a
     silhueta faz crossfade para a palavra ENTRAR. */
  Home.prototype.drawLogo = function (t, mx, my) {
    var cv = this.logoCanvas;
    if (!cv || !this.logoReady) return;
    var rect = cv.getBoundingClientRect();
    if (!rect.width) return;

    var lf = this.lf, lw = lf.width, lh = lf.height;
    var lctx = lf.getContext('2d');
    var img = lctx.createImageData(lw, lh), d = img.data;
    var k = 0.14 + LOGO_VISIBILITY * 0.78;
    var iw = window.innerWidth, ih = window.innerHeight;

    /* amostra o campo nas coordenadas de tela ocupadas pelo logo, para que ele
       pareça recortado do fundo e não pintado por cima */
    for (var y = 0; y < lh; y++) {
      var sy = ((rect.top + (y / lh) * rect.height) / ih) * SY;
      for (var x = 0; x < lw; x++) {
        var sx = ((rect.left + (x / lw) * rect.width) / iw) * SX;
        var n = this.field.field(sx, sy, t, mx, my);
        var c = this.field.rampColor(this.field.shape(n));
        var i = (y * lw + x) * 4;
        d[i] = c[0] + (255 - c[0]) * k;
        d[i + 1] = c[1] + (255 - c[1]) * k;
        d[i + 2] = c[2] + (255 - c[2]) * k;
        d[i + 3] = 255;
      }
    }
    lctx.putImageData(img, 0, 0);

    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(lf, 0, 0, cv.width, cv.height);

    /* p vai de 0 (logo) a 1 (ENTRAR), com easing exponencial */
    var target = this.hoverLogo ? 1 : 0;
    this._hp += (target - this._hp) * 0.16;
    var p = this._hp;

    if (!this.mask) {
      this.mask = document.createElement('canvas');
      this.mask.width = cv.width;
      this.mask.height = cv.height;
    }
    var mc = this.mask.getContext('2d');
    mc.clearRect(0, 0, cv.width, cv.height);

    if (p < 0.995) {
      mc.globalAlpha = 1 - p;
      mc.drawImage(this.logoImg, 0, 0, cv.width, cv.height);
    }
    if (p > 0.005) {
      mc.globalAlpha = p;
      mc.font = '700 ' + Math.round(cv.height * 0.416) + 'px "Serial B", serif';
      mc.textAlign = 'center';
      mc.textBaseline = 'middle';
      mc.fillStyle = '#fff';
      var m = mc.measureText('ENTRAR');
      var asc = m.actualBoundingBoxAscent || 0, desc = m.actualBoundingBoxDescent || 0;
      mc.fillText('ENTRAR', cv.width / 2, 450 + (asc - desc) / 2);
    }
    mc.globalAlpha = 1;

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this.mask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  };

  /* ---------------------------------------------------------- carrossel */

  Home.prototype.bindCarousel = function () {
    var self = this;

    if (this.dots) {
      var dots = this.dots.querySelectorAll('.dot');
      for (var i = 0; i < dots.length; i++) {
        dots[i].addEventListener('click', function (e) {
          self.go(+e.currentTarget.getAttribute('data-i'));
        });
      }
    }

    var cue = document.querySelector('.scroll-cue');
    if (cue) {
      cue.addEventListener('click', function () {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      });
    }

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
  };

  Home.prototype.applyTrack = function () {
    if (this.track) this.track.style.transform = 'translateX(-' + (this.slide * 100) + 'vw)';
    if (!this.dots) return;
    var dots = this.dots.querySelectorAll('.dot');
    for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('is-on', i === this.slide);
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
      this.drawLogo(t, mx, my);
    }
    requestAnimationFrame(this.loop);
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.INF.initNav();
    window.INF.initChrome(FLOW_SPEED);
    new Home().init();
  });
})();
