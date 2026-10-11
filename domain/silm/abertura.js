'use strict';
window.SILM = window.SILM || {};
/* Conteúdo visual próprio; contrato de toque/tecla, duração e fallback inspirado no SIAB congelado. */
SILM.startOpening = ctx => {
  let node = document.getElementById('silm-opening');
  if (!node) return () => {};
  const resources = [];
  let finished = false;
  const remove = ctx.scope.cleanup(() => {
    const pending = resources.splice(0);
    // No destroy, a Base já percorre e encerra esses recursos. Não recancelar o mesmo escopo.
    if (ctx.scope.active) pending.forEach(stop => stop());
    node?.remove(); node = null;
    document.documentElement.dataset.silmOpening = 'done';
  });
  const finish = event => {
    if (event?.type === 'pointerdown' || event?.type === 'click') { event.preventDefault(); event.stopPropagation(); }
    if (finished) return;
    finished = true;
    resources.splice(0).forEach(stop => stop());
    if (event?.type === 'keydown') {
      event.preventDefault();
      const target = SimCore.router.current?.id === 'manual' ? document.getElementById('manual-titulo') : SimCore.router.current?.id === 'laboratorio' ? document.getElementById('scientific-viewport') : document.querySelector('#screens-host [data-screen-focus]');
      target?.focus({preventScroll:true});
    }
    if (!node || ctx.accessibility.state.reducedMotion) { remove(); return; }
    node.classList.add('leaving');
    resources.push(ctx.scope.timeout(remove, 310));
  };
  if (ctx.storage.get('abertura', true) === false || ctx.accessibility.state.reducedMotion || document.documentElement.dataset.silmOpening !== 'on') {
    remove(); return () => {};
  }
  resources.push(ctx.scope.listen(node, 'pointerdown', finish));
  resources.push(ctx.scope.listen(node, 'click', finish));
  resources.push(ctx.scope.listen(document, 'keydown', finish, true));
  resources.push(ctx.events.on('a11y:changed', state => { if (state.reducedMotion) remove(); }));
  resources.push(ctx.scope.listen(node, 'animationend', event => { if(event.animationName === 'silm-safety') remove(); }));
  resources.push(ctx.scope.timeout(() => node?.classList.add('with-brand'), 2250));
  resources.push(ctx.scope.timeout(finish, 3300));
  return remove;
};
