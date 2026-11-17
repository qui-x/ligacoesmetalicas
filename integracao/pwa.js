/* Atualiza o cache da entrada principal sem apagar investigações.
   Etapa 12 do plano de paridade: como no SIAB, "Instalar aplicativo" fica no Menu sempre que a instalação é possível
   (manifesto, service worker e contexto seguro) e o SILM ainda não está instalado. Quando o navegador não oferece o
   pedido de instalação (Safari/iOS, ou depois de um pedido recusado), o botão abre as instruções do Manual. */
(()=>{
 const menuInstall=document.getElementById('si-drawer-install');
 const install=document.getElementById('distribution-install');
 const status=document.getElementById('distribution-status');
 const checkButton=document.getElementById('distribution-check');
 const localFile=location.protocol==='file:';
 const publishable=!localFile&&!!document.querySelector('link[rel="manifest"]')&&'serviceWorker' in navigator&&window.isSecureContext;
 let installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 let installPrompt=null, revision=0;
 const setStatus=message=>{if(status)status.textContent=message;};
 const syncInstall=()=>{
  if(menuInstall)menuInstall.hidden=!publishable||installed;
  if(install)install.hidden=!publishable||installed||!installPrompt;
 };
 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();installPrompt=event;syncInstall();
 });
 window.addEventListener('appinstalled',()=>{installed=true;installPrompt=null;syncInstall();});
 // O Menu da base já encaminha o clique ao botão de Preferências.
 install?.addEventListener('click',async()=>{
  const offer=installPrompt;
  if(!offer){if(publishable&&!installed)location.hash='#/manual?topico=offline';return;}
  installPrompt=null;syncInstall();
  try{await offer.prompt();await offer.userChoice;}
  catch{location.hash='#/manual?topico=offline';}
 });
 syncInstall();
 function readInventory(worker){
  return new Promise((resolve,reject)=>{
   const {port1,port2}=new MessageChannel();
   const finish=(fn,result)=>{clearTimeout(timer);port1.close();fn(result);};
   const timer=setTimeout(()=>finish(reject,new Error('worker timeout')),5000);
   port1.onmessage=event=>finish(resolve,event.data);
   port1.onmessageerror=()=>finish(reject,new Error('invalid response'));
   try{worker.postMessage({type:'SILM_OFFLINE_STATUS'},[port2]);}
   catch(error){finish(reject,error);}
  });
 }
 async function checkOffline(){
  const current=++revision;
  if(!publishable){
   setStatus(localFile?'Execução em arquivo local. O cache da PWA requer HTTPS ou localhost.':'O navegador precisa de HTTPS ou localhost e suporte ao modo offline.');
   return;
  }
  setStatus('Conferindo os recursos offline do SILM…');
  try{
   const registration=await navigator.serviceWorker.getRegistration('./');
   const worker=navigator.serviceWorker.controller||registration?.active;
   if(current!==revision)return;
   if(!worker){setStatus('Preparando o cache do SILM. A primeira abertura precisa de conexão.');return;}
   const result=await readInventory(worker);
   if(current!==revision)return;
   if(!result?.ok)throw new Error('cache unavailable');
   const {core,coreTotal,images,imagesTotal}=result;
   const label=core<coreTotal?'Cache essencial incompleto':images<imagesTotal?'Recursos essenciais disponíveis; algumas imagens ainda faltam':'Cache offline completo';
   setStatus(`${label}. Recursos essenciais: ${core}/${coreTotal}. Imagens: ${images}/${imagesTotal}.`);
  }catch{if(current===revision)setStatus('Não foi possível conferir o cache desta versão. Reabra o SILM com conexão e tente novamente.');}
 }
 checkButton?.addEventListener('click',checkOffline);
 void checkOffline();
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
 if(publishable){
  let controlled=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   if(controlled)updateNotice();
   controlled=true;
   void checkOffline();
  });
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>{
   // Verificar uma revisão nova ao abrir, ao voltar à aba e quando a conexão retorna.
   // Nunca recarregar automaticamente: manter intacto o estado da investigação.
   let lastCheck=0;
   const check=()=>{if(!navigator.onLine)return;const now=Date.now();
    if(now-lastCheck<60000)return;lastCheck=now;
    reg.update().catch(()=>{});
   };
   check();
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
   window.addEventListener('online',check);
  }).catch(()=>{++revision;setStatus('Falha ao preparar o cache. Confira a conexão e reabra o SILM.');BaseDemoSI.notify('Modo offline indisponível nesta sessão.','warning');});
 }
})();
