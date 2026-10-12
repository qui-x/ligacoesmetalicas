'use strict';
window.SILM = window.SILM || {};
/* Abertura oficial do SILM. O visual vem do pacote "SILM — Identidade e animação oficial":
   domain/silm/abertura/silm-opening.js e silm-opening.css são cópias íntegras (SHA-256 em docs/IDENTIDADE-VISUAL.md).
   Este adaptador cuida só do contrato da família SIAB:
   - monta antes do primeiro desenho, quando a preferência permite (o prelude decide 'on'/'off' no <head>);
   - pula com toque, clique ou tecla, e também pelo botão "Pular abertura" do pacote;
   - não aparece com Reduzir movimento nem com a preferência "Animação de abertura" desligada;
   - entrega o foco ao conteúdo quando é pulada pelo teclado. */
(() => {
  const DURATION = 6100;   // duração oficial do pacote (ms)
  const root = document.documentElement;
  let api = null, mountedAt = 0;
  if (root.dataset.silmOpening === 'on') {
    try {
      api = SILMOpening.mount(document.body, {autoStart:true, duration:DURATION, hideAfterFinish:true, removeAfterFinish:true});
      mountedAt = performance.now();
      api.root.id = 'silm-opening';
      // Camada decorativa: fora da árvore de acessibilidade, como no SIAB; qualquer tecla a encerra.
      api.root.setAttribute('aria-hidden', 'true');
      api.root.querySelector('[data-silm-skip]')?.setAttribute('tabindex', '-1');
    } catch (error) {
      api = null; root.dataset.silmOpening = 'off';
      console.warn('Abertura visual omitida.', error);
    }
  }

  SILM.startOpening = ctx => {
    const done = () => { root.dataset.silmOpening = 'done'; };
    if (!api || !api.root.isConnected) { done(); return () => {}; }
    const node = api.root, resources = [];
    let finished = false;
    const remove = ctx.scope.cleanup(() => {
      const pending = resources.splice(0);
      // No destroy, a Base já percorre e encerra esses recursos. Não recancelar o mesmo escopo.
      if (ctx.scope.active) pending.forEach(stop => stop());
      api?.destroy(); api = null;
      done();
    });
    const finish = event => {
      if (event?.type === 'pointerdown' || event?.type === 'click') { event.preventDefault(); event.stopPropagation(); }
      if (finished) return;
      finished = true;
      resources.splice(0).forEach(stop => stop());
      if (event?.type === 'keydown') {
        event.preventDefault();
        const id = SimCore.router.current?.id;
        const target = id === 'manual' ? document.getElementById('manual-titulo') : id === 'laboratorio' ? document.getElementById('scientific-viewport') : document.querySelector('#screens-host [data-screen-focus]');
        target?.focus({preventScroll:true});
      }
      if (!api || ctx.accessibility.state.reducedMotion) { remove(); return; }
      api.hide(); done();                           // transição oficial de saída (0,34 s)
      resources.push(ctx.scope.timeout(remove, 400));
    };
    if (ctx.storage.get('abertura', true) === false || ctx.accessibility.state.reducedMotion) { remove(); return () => {}; }
    resources.push(ctx.scope.listen(node, 'pointerdown', finish));
    resources.push(ctx.scope.listen(node, 'click', finish));
    resources.push(ctx.scope.listen(document, 'keydown', finish, true));
    resources.push(ctx.events.on('a11y:changed', state => { if (state.reducedMotion) remove(); }));
    resources.push(ctx.scope.listen(node, 'animationend', event => { if (event.animationName === 'silm-safety') remove(); }));
    resources.push(ctx.scope.timeout(finish, Math.max(0, DURATION - (performance.now() - mountedAt))));
    return remove;
  };
})();
