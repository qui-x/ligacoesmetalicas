/* Portão da animação de abertura, no <head>, antes do primeiro desenho: marca <html data-opening="on|off">.
   "off" quando a pessoa desligou a abertura (Acessibilidade → Animação de abertura), pediu para reduzir animações
   ou o sistema pede menos movimento. O produto só monta a sua abertura com data-opening="on". */
(function () {
  'use strict';
  var root = document.documentElement, off = false;
  try { off = localStorage.getItem('simcore_core_v1_opening') === 'false'; } catch (e) { /* vale o padrão: ligada */ }
  try {
    if (window.A11Y && window.A11Y.estado && window.A11Y.estado.motion) off = true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) off = true;
  } catch (e) { /* navegador antigo: sem consulta de movimento */ }
  root.setAttribute('data-opening', off ? 'off' : 'on');
})();
