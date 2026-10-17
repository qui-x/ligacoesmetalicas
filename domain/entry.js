'use strict';
/* Produto independente: registro pelo único ponto de integração da Base. */
(async () => {
  try {
    if (!window.SILM?.create) throw new Error('Domínio SILM indisponível.');
    const context = await SimCore.registerDomain(SILM.create());
    if (!context) throw new Error('Não foi possível montar o SILM.');
  } catch (error) {
    SimCore.opening?.playing && document.getElementById('app-opening')?.remove();
    console.error('Falha ao iniciar o SILM', error);
    SimCore.notifications.show('Não foi possível iniciar o SILM. Recarregue a página.', {type:'error'});
  }
})();
