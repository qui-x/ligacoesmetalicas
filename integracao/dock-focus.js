'use strict';
// SILM Parte 8: uma superfície auxiliar aberta por vez.
// O mecanismo original da Base SI continua controlando o estado e o foco.
// Este adaptador só fecha a doca oposta ANTES de abrir a nova doca,
// inclusive no desktop largo, sem criar menu ou painel científico.
(()=>{
 const launchers='.si-launchers [data-open-dock]';
 document.addEventListener('click',event=>{
  if(!document.body.classList.contains('route-ambiente'))return;
  const target=event.target;
  const launcher=target instanceof Element?target.closest(launchers):null;
  if(!launcher||launcher.disabled)return;
  const opposite=launcher.dataset.openDock==='montagem'?'right':'left';
  const panel=document.getElementById('si-dock-'+opposite);
  if(!panel||panel.hidden)return;
  // A Base SI já devolve foco e sincroniza aria-expanded/painéis.
  // Nunca alterar diretamente hidden, inert ou dataset da interface.
  panel.querySelector('[data-close-dock="'+opposite+'"]')?.click();
 },true);
})();
