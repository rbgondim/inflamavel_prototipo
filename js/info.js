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

  /* A página é unificada, mas o impressum não se funde: registro de empresa é
     por jurisdição. O seletor troca só os dois painéis de dados. */
  function initSede() {
    var botoes = document.querySelectorAll('[data-sede]');
    if (!botoes.length) return;

    function mostrar(sede) {
      for (var i = 0; i < botoes.length; i++) {
        var ativo = botoes[i].getAttribute('data-sede') === sede;
        botoes[i].classList.toggle('is-on', ativo);
        botoes[i].setAttribute('aria-selected', ativo ? 'true' : 'false');
      }
      var paineis = document.querySelectorAll('[data-sede-painel]');
      for (var j = 0; j < paineis.length; j++) {
        paineis[j].hidden = paineis[j].getAttribute('data-sede-painel') !== sede;
      }
    }

    for (var k = 0; k < botoes.length; k++) {
      botoes[k].addEventListener('click', function (e) {
        mostrar(e.currentTarget.getAttribute('data-sede'));
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.INF.initNav();
    window.INF.initChrome(FLOW_SPEED);
    initSede();
  });
})();
