'use strict';
/* Migração única da preferência "Animação de abertura": até a 0.10.0 ela ficava no armazenamento do SILM; desde a
   0.10.1 vive em Acessibilidade (preferência da família, core 'opening'). Roda no <head>, depois do portão da Base. */
(() => {
  try {
    const old = SimCore.storage.domain('silm').get('abertura', null);
    if (old === false && SimCore.storage.core.get('opening', null) === null) {
      SimCore.storage.core.set('opening', false);
      document.documentElement.dataset.opening = 'off';
    }
    if (old !== null) SimCore.storage.domain('silm').remove('abertura');
  } catch (error) { console.warn('Migração da preferência de abertura omitida.', error); }
})();
