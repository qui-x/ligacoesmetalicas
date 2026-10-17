'use strict';
/* Abertura oficial do SILM sobre a camada de abertura da família (SimCore.opening).
   O visual vem do pacote "SILM — Identidade e animação oficial": domain/silm/abertura/silm-opening.js e .css são cópias
   íntegras (SHA-256 em docs/IDENTIDADE-VISUAL.md). A Base cuida do resto: portão antes do desenho, preferência em
   Acessibilidade → Animação de abertura, pular com toque, clique ou tecla, foco no conteúdo e Reduzir animações. */
(() => {
  const DURATION = 6100;   // duração oficial do pacote (ms)
  SimCore.opening.define({
    duration: DURATION, safety: 7000, brandAt: DURATION, tagline: 'A Arquitetura dos Metais',
    mount(stage) {
      const api = SILMOpening.mount(stage, {autoStart:true, duration:DURATION, hideAfterFinish:false, removeAfterFinish:false});
      api.root.id = 'silm-opening';
      // Camada decorativa: fora da árvore de acessibilidade, como na família; qualquer tecla a encerra.
      api.root.setAttribute('aria-hidden', 'true');
      api.root.querySelector('[data-silm-skip]')?.setAttribute('tabindex', '-1');
      return {hide: () => api.hide(), destroy: () => api.destroy()};
    }
  });
})();
