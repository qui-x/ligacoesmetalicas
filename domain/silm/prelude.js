'use strict';
/* Preferência lida pela API da Base, antes do primeiro desenho. Sem escrita paralela. */
(() => {
  const enabled = SimCore.storage.domain('silm').get('abertura', true) !== false;
  const reduced = A11Y.estado.motion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.dataset.silmOpening = enabled && !reduced ? 'on' : 'off';
})();
