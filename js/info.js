/* =============================================================================
   info.js — página Info.

   A página abre com uma escolha de sede (Ceará / Berlin) em tipo gigante; só
   depois revela o conteúdo. A escolha fica guardada na sessão, então navegar
   para outra página e voltar não obriga a escolher de novo — o botão
   "Trocar sede" limpa.

   O conteúdo em si está escrito em info.html; aqui só o comportamento.
   ============================================================================= */
window.INF = window.INF || {};

(function () {
  'use strict';

  var FLOW_SPEED = 1;
  var KEY = 'inf:office';

  function show(office) {
    var gate = document.querySelector('.office-gate');
    var body = document.querySelector('.info-body');
    if (gate) gate.hidden = !!office;
    if (body) body.hidden = !office;

    var title = document.querySelector('[data-office-name]');
    if (title && office) title.textContent = office;

    window.scrollTo({ top: 0 });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.INF.initNav();
    window.INF.initChrome(FLOW_SPEED);

    var saved = null;
    try { saved = sessionStorage.getItem(KEY); } catch (e) {}
    show(saved);

    var picks = document.querySelectorAll('[data-office]');
    for (var i = 0; i < picks.length; i++) {
      picks[i].addEventListener('click', function (e) {
        var office = e.currentTarget.getAttribute('data-office');
        try { sessionStorage.setItem(KEY, office); } catch (err) {}
        show(office);
      });
    }

    var clear = document.querySelector('[data-office-clear]');
    if (clear) {
      clear.addEventListener('click', function () {
        try { sessionStorage.removeItem(KEY); } catch (err) {}
        show(null);
      });
    }
  });
})();
