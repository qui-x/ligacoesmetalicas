'use strict';
/* SILM Parte 9 — escolha dos módulos dentro de Ver, como o painel contextual SIAB.
   A transição reutiliza o seletor científico REAL de Montagem e suas validações.
   A doca apenas apresenta o estado; nunca cria um modelo científico paralelo. */
(()=>{
 const root=document.getElementById('silm-module-shortcuts');
 const selection=document.getElementById('silm-module-choice');
 if(!root||!selection)return;
 const buttons=[...root.querySelectorAll('[data-silm-module-shortcut]')];
 const modules=new Set(['explorar','medir','calcular']);
 const summary=document.getElementById('silm-module-selection-help');
 const descriptions={
  explorar:'Observação da estrutura, elétrons e propriedades.',
  medir:'Instrumentos para medir o modelo cristalográfico.',
  calcular:'Fórmulas com dados e proveniência identificados.'
 };
 function currentSelect(){return document.getElementById('silm-module');}
 function sync(){
  const select=currentSelect();
  const chosen=modules.has(select?.value)?select.value:
   window.SILMIntegration?.snapshot?.()?.module?.active||'explorar';
  const locked=!select||select.disabled;
  root.dataset.activeModule=chosen;
  root.dataset.locked=String(locked);
  if(summary){
   const message=locked?'O módulo é definido pela atividade em andamento.':
    descriptions[chosen]||'Escolha um módulo para investigar.';
   if(summary.textContent!==message)summary.textContent=message;
  }
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
 // Atalhos no painel Ver seguem o padrão de navegação do SIAB:
 // setas percorrem os três módulos, Home/End vão aos extremos.
 // Clique/Enter/Espaço continuam passando pelo seletor científico existente.
 for(const button of buttons)button.addEventListener('keydown',event=>{
  const keys=['ArrowRight','ArrowLeft','Home','End'];
  if(!keys.includes(event.key)||button.disabled)return;
  event.preventDefault();event.stopPropagation();
  const index=buttons.indexOf(button);
  const next=event.key==='Home'?buttons[0]:
   event.key==='End'?buttons[buttons.length-1]:
   buttons[(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length];
  if(!next||next.disabled)return;
  next.focus({preventScroll:true});
  next.click();
 });
 // A ferramenta nativa reconstrói o <select> após mudanças no ensaio.
 // Observar essa região (e não a cena 3D) mantém os atalhos sincronizados.
 const observer=new MutationObserver(sync);
 observer.observe(selection,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','value']});
 window.addEventListener('si-module-change',sync);
 window.addEventListener('si-route-changed',sync);
 sync();
})();
