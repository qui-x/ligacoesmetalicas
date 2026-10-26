/* Atualiza o cache da entrada principal sem apagar investigações. */
if('serviceWorker' in navigator){
 let controlled=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(controlled)BaseDemoSI.notify('Nova versão instalada. Reabra a página para usar a atualização.');
  controlled=true;
 });
 navigator.serviceWorker.register('sw.js').catch(()=>BaseDemoSI.notify('Modo offline indisponível nesta sessão.','warning'));
}
