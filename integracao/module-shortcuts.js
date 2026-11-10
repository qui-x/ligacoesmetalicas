'use strict';
/* SILM Parte 8 — acesso direto aos módulos, sem segundo modelo científico.
   Reutiliza o seletor real de Montagem > Módulo e suas validações. */
(()=>{
 const root=document.getElementById('silm-module-shortcuts');
 const selection=document.getElementById('silm-module-choice');
 if(!root||!selection)return;
 const buttons=[...root.querySelectorAll('[data-silm-module-shortcut]')];
 const modules=new Set(['explorar','medir','calcular']);
 function currentSelect(){return document.getElementById('silm-module');}
 function sync(){
  const select=currentSelect();
  const chosen=modules.has(select?.value)?select.value:
   window.SILMIntegration?.snapshot?.()?.module?.active||'explorar';
  const locked=!select||select.disabled;
  root.dataset.activeModule=chosen;
  root.dataset.locked=String(locked);
  const workspace=document.getElementById('si-workspace');
  if(workspace)workspace.dataset.silmModule=chosen;
  for(const button of buttons){
   const active=button.dataset.silmModuleShortcut===chosen;
   button.setAttribute('aria-pressed',String(active));
   button.disabled=locked;
   button.title=locked?'Módulo definido pela atividade em andamento':
    (active?'Módulo ativo: ':'Ativar módulo: ')+button.dataset.silmModuleLabel;
  }
 }
 for(const button of buttons){
  button.addEventListener('click',()=>{
   const select=currentSelect(),target=button.dataset.silmModuleShortcut;
   if(!select||select.disabled||!modules.has(target)||select.value===target)return;
   select.value=target;
   select.dispatchEvent(new Event('change',{bubbles:true}));
   sync();
  });
 }
 // A ferramenta nativa reconstrói o <select> após mudanças no ensaio.
 // Observar essa região (e não a cena 3D) mantém os atalhos sincronizados.
 const observer=new MutationObserver(sync);
 observer.observe(selection,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','value']});
 window.addEventListener('si-module-change',sync);
 window.addEventListener('si-route-changed',sync);
 sync();
})();
