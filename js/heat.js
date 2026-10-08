/* =============================================================================
   heat.js — o campo de ruído que gera o gradiente da marca.

   Duas coisas moram aqui:

   1. HeatField — ruído fBm com domain warping. É o mesmo campo usado no fundo
      do splash, no logo do header e na variável CSS --heat. A paleta é sorteada
      entre cinco rampas a cada carregamento, então nenhuma visita é igual.

   2. HeatChrome — o loop que mantém --heat viva (um canvas 200x60 convertido em
      data URL a ~18 fps), consumida pelos hovers do menu, da escolha de sede e
      da faixa de retorno. Também pinta o logo do header, que hoje é rosa
      chapado (--rosa) recortado pelo PNG, e não mais o gradiente animado.

   Este arquivo não depende de nenhuma página específica.
   ============================================================================= */
window.INF = window.INF || {};

(function () {
  'use strict';

  var PALETTES = [
    [[0, [30, 63, 224]], [0.28, [92, 134, 245]], [0.5, [255, 255, 255]], [0.72, [236, 75, 153]], [1, [222, 27, 84]]],
    [[0, [198, 160, 255]], [0.32, [236, 75, 153]], [0.62, [229, 32, 58]], [1, [120, 12, 22]]],
    [[0, [247, 244, 230]], [0.3, [196, 150, 255]], [0.55, [124, 58, 237]], [0.8, [46, 26, 190]], [1, [12, 8, 44]]],
    [[0, [122, 130, 240]], [0.36, [255, 112, 92]], [0.62, [240, 78, 60]], [0.85, [150, 92, 220]], [1, [92, 84, 205]]],
    [[0, [16, 7, 22]], [0.3, [233, 64, 214]], [0.6, [214, 238, 150]], [0.85, [150, 220, 210]], [1, [120, 200, 214]]]
  ];

  /* ---------------------------------------------------------------- campo */

  function HeatField(ramp) {
    this.RAMP = ramp || PALETTES[Math.floor(Math.random() * PALETTES.length)];
  }

  HeatField.prototype.hash = function (xi, yi) {
    var h = (Math.imul(xi, 374761393) + Math.imul(yi, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };

  HeatField.prototype.noise = function (x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = this.hash(xi, yi), b = this.hash(xi + 1, yi),
        c = this.hash(xi, yi + 1), d = this.hash(xi + 1, yi + 1);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  };

  HeatField.prototype.fbm = function (x, y) {
    var s = 0, a = 0.5, f = 1;
    for (var i = 0; i < 3; i++) { s += a * this.noise(x * f, y * f); f *= 2; a *= 0.5; }
    return s / 0.875;
  };

  /* recorta a faixa útil do ruído para 0..1 — é o que dá as bordas nítidas */
  HeatField.prototype.shape = function (n) {
    var v = (n - 0.30) / 0.42;
    return v < 0 ? 0 : v > 1 ? 1 : v;
  };

  /* domain warping: o campo se deforma no tempo e segue o mouse de leve */
  HeatField.prototype.field = function (x, y, t, mx, my) {
    var wx = this.fbm(x * 0.9 + t * 0.06, y * 0.9 - t * 0.045);
    var wy = this.fbm(x * 0.9 - t * 0.05 + 5.2, y * 0.9 + t * 0.05 + 1.7);
    var px = x + wx * 1.8 + (mx - 0.5) * 1.4;
    var py = y + wy * 1.8 + (my - 0.5) * 1.4;
    return this.fbm(px, py + t * 0.03);
  };

  HeatField.prototype.rampColor = function (v) {
    var R = this.RAMP;
    if (v < 0) v = 0;
    if (v > 1) v = 1;
    for (var i = 1; i < R.length; i++) {
      if (v <= R[i][0]) {
        var a = R[i - 1], b = R[i], f = (v - a[0]) / (b[0] - a[0]);
        return [
          a[1][0] + (b[1][0] - a[1][0]) * f,
          a[1][1] + (b[1][1] - a[1][1]) * f,
          a[1][2] + (b[1][2] - a[1][2]) * f
        ];
      }
    }
    return R[R.length - 1][1];
  };

  /* --------------------------------------------------------------- chrome */

  /* opts: { field, logoCanvas, flowSpeed }
     Escala fixa 2.2 x 2.2 — é a que o layout original usa para --heat em todas
     as páginas. */
  function HeatChrome(opts) {
    opts = opts || {};
    this.field = opts.field || new HeatField();
    this.flowSpeed = opts.flowSpeed == null ? 1 : opts.flowSpeed;
    this.logoCanvas = opts.logoCanvas || null;
    this.SX = 2.2;
    this.SY = 2.2;

    this.cv = document.createElement('canvas');
    this.cv.width = 200;
    this.cv.height = 60;

    this.mx = 0.5;
    this.my = 0.5;
    this.logoReady = false;
    this._lastHeat = 0;
    this._raf = null;
    this._logoDrawn = false;

    /* O logo do header é rosa chapado, não o gradiente animado. A cor vem do
       token --rosa para o CSS seguir sendo a fonte única. */
    this.logoColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--rosa').trim() || '#FF0D8C';

    var self = this;
    this._onMove = function (e) {
      self.mx = e.clientX / window.innerWidth;
      self.my = e.clientY / window.innerHeight;
    };

    if (this.logoCanvas) {
      this.logoImg = new Image();
      this.logoImg.onload = function () { self.logoReady = true; };
      this.logoImg.src = this.logoCanvas.getAttribute('data-logo') || 'assets/img/logo-white.png';
    }
  }

  HeatChrome.prototype.start = function () {
    var self = this;
    window.addEventListener('mousemove', this._onMove);
    var tick = function (now) {
      self.updateVar(now);
      self.drawLogo();
      self._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  };

  HeatChrome.prototype.stop = function () {
    if (this._raf) cancelAnimationFrame(this._raf);
    window.removeEventListener('mousemove', this._onMove);
  };

  /* Redesenha o canvas do gradiente e o publica como --heat.
     55 ms de intervalo mantém o custo baixo: toDataURL é caro. */
  HeatChrome.prototype.updateVar = function (now) {
    if (now - this._lastHeat < 55) return;
    this._lastHeat = now;

    var cv = this.cv, W = cv.width, H = cv.height;
    var ctx = cv.getContext('2d');
    var t = (now / 1000) * this.flowSpeed;
    var img = ctx.createImageData(W, H), d = img.data;

    for (var y = 0; y < H; y++) {
      var fy = (y / H) * this.SY;
      for (var x = 0; x < W; x++) {
        var n = this.field.field((x / W) * this.SX, fy, t, this.mx, this.my);
        var c = this.field.rampColor(this.field.shape(n));
        var i = (y * W + x) * 4;
        /* clareia os tons escuros: o gradiente é usado como texto e precisa
           manter contraste sobre o preto */
        var lum = (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255;
        var k = lum < 0.62 ? (0.62 - lum) : 0;
        d[i] = c[0] + (255 - c[0]) * k;
        d[i + 1] = c[1] + (255 - c[1]) * k;
        d[i + 2] = c[2] + (255 - c[2]) * k;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    document.documentElement.style.setProperty('--heat', 'url(' + cv.toDataURL() + ')');
  };

  /* logo do header = rosa chapado recortado pela silhueta do PNG.
     Como a cor não muda mais a cada quadro, desenha uma vez só. */
  HeatChrome.prototype.drawLogo = function () {
    var cv = this.logoCanvas;
    if (!cv || !this.logoReady || this._logoDrawn) return;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = this.logoColor;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this.logoImg, 0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'source-over';
    this._logoDrawn = true;
  };

  window.INF.PALETTES = PALETTES;
  window.INF.HeatField = HeatField;
  window.INF.HeatChrome = HeatChrome;
})();
