/* Atualiza o cache da entrada principal sem apagar investigações.
   Etapa 12 do plano de paridade: como no SIAB, "Instalar aplicativo" fica no Menu sempre que a instalação é possível
   (manifesto, service worker e contexto seguro) e o SILM ainda não está instalado. Quando o navegador não oferece o
   pedido de instalação (Safari/iOS, ou depois de um pedido recusado), o botão abre as instruções do Manual. */
(()=>{
 const button=document.getElementById('si-drawer-install');
 const publishable=!!document.querySelector('link[rel="manifest"]')&&'serviceWorker' in navigator&&window.isSecureContext;
 let installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,offered=false;
 const sync=()=>{if(button)button.hidden=!publishable||installed;};
 window.addEventListener('beforeinstallprompt',()=>{offered=true;sync();});
 window.addEventListener('appinstalled',()=>{installed=true;offered=false;sync();});
 button?.addEventListener('click',()=>{if(!offered)location.hash='#/manual?topico=offline';offered=false;setTimeout(sync,0);});
 sync();
 if('serviceWorker' in navigator){
  let controlled=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   if(controlled)BaseDemoSI.notify('Nova versão instalada. Reabra a página para usar a atualização.');
   controlled=true;
  });
  navigator.serviceWorker.register('sw.js').catch(()=>BaseDemoSI.notify('Modo offline indisponível nesta sessão.','warning'));
 }
})();
