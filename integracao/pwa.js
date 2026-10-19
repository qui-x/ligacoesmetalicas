/* Atualiza o cache da entrada principal sem apagar investigações. */
if('serviceWorker' in navigator){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  BaseDemoSI.notify('Nova versão instalada. Reabra a página para usar a atualização.');
 });
 navigator.serviceWorker.register('sw.js').catch(()=>BaseDemoSI.notify('Modo offline indisponível nesta sessão.','warning'));
}
