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
 /* Como no SIAB: quando uma versão nova assume, a página aberta ainda é a antiga. O aviso fica na tela (não some sozinho)
    e só recarrega quando a pessoa pedir, para nada se perder no meio de uma atividade. Os dados salvos continuam. */
 function updateNotice(){
  const rail=document.getElementById('si-notifications');if(!rail||document.getElementById('silm-update-notice'))return;
  const item=document.createElement('div');item.className='si-notice si-notice-info silm-update-notice';item.id='silm-update-notice';item.setAttribute('role','status');
  const text=document.createElement('span');text.textContent='Nova versão do SILM instalada. Recarregue para usar a atualização; seus dados salvos continuam.';
  const reload=document.createElement('button');reload.type='button';reload.className='button primary';reload.id='silm-update-reload';reload.textContent='Recarregar';reload.addEventListener('click',()=>location.reload());
  const later=document.createElement('button');later.type='button';later.textContent='×';later.setAttribute('aria-label','Dispensar aviso de atualização');later.addEventListener('click',()=>item.remove());
  item.append(text,reload,later);rail.append(item);
 }
 if('serviceWorker' in navigator){
  let controlled=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   if(controlled)updateNotice();
   controlled=true;
  });
  navigator.serviceWorker.register('sw.js').catch(()=>BaseDemoSI.notify('Modo offline indisponível nesta sessão.','warning'));
 }
})();
