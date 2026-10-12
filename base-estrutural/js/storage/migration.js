/* Migração explícita da baseline: somente preferências estruturais.
   Chaves siab_* são lidas aqui uma única vez; nunca são escritas/apagadas. */
(function(){
 'use strict';
 try {
  if(localStorage.getItem('simcore_migration_v1'))return;
  const source=JSON.parse(localStorage.getItem('siab_a11y_prefs')||'null');
  if(source&&typeof source==='object'&&!localStorage.getItem('simcore_a11y_v1')){
   const prefs={};
   for(const key of ['theme','contrast','fontScale','spacing','motion','reading','colorblind'])if(Object.hasOwn(source,key))prefs[key]=source[key];
   localStorage.setItem('simcore_a11y_v1',JSON.stringify(prefs));
  }
  const workspace=JSON.parse(localStorage.getItem('siab_workspace_v1')||'null');
  if(workspace&&typeof workspace==='object'&&!localStorage.getItem('simcore_core_v1_panels')){
   localStorage.setItem('simcore_core_v1_panels',JSON.stringify({left:['compact','expanded'].includes(workspace.left),right:workspace.right==='open'}));
  }
  localStorage.setItem('simcore_migration_v1','1');
 }catch(error){console.warn('Migração de preferências indisponível; usando padrões.',error);}
})();
