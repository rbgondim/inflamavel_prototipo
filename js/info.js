/* =============================================================================
   info.js — página Info.

   A página já teve um portal que obrigava a escolher entre Ceará e Berlin antes
   de mostrar qualquer coisa, e as duas versões eram idênticas. O portal saiu: o
   conteúdo é um só e as duas casas aparecem juntas no título. Sobrou o comum a
   todas as páginas.
   ============================================================================= */
window.INF = window.INF || {};

(function () {
  'use strict';

  var FLOW_SPEED = 1;

  document.addEventListener('DOMContentLoaded', function () {
    window.INF.initNav();
    window.INF.initChrome(FLOW_SPEED);
  });
})();
