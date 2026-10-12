'use strict';
SimCore.pwa=(()=>{
 let prompt=null,registration=null;
 const supported=()=> 'serviceWorker' in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname));
 function init(){
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;SimCore.emit('pwa:installable',{});});window.addEventListener('appinstalled',()=>{prompt=null;SimCore.notifications.show('Aplicativo instalado.',{type:'success'});});
  if(!supported())return;const previous=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(previous)SimCore.notifications.show('Uma atualização está disponível. Recarregue quando terminar.',{duration:0});});
  registration=navigator.serviceWorker.register('sw.js').catch(error=>{console.warn('Offline indisponível',error);return null;});
 }
 async function install(){if(prompt){await prompt.prompt();await prompt.userChoice;prompt=null;}else SimCore.modal.open({title:'Instalar aplicativo',content:'Use a opção de instalar ou adicionar à tela inicial no menu do navegador. Abra uma vez com internet para preparar o uso offline.'});}
 async function cacheResources(resources){if(!resources.length||!supported())return;if(registration&&!await registration)return;const reg=await navigator.serviceWorker.ready;const worker=reg.active;if(!worker)return;
  await new Promise((resolve,reject)=>{const channel=new MessageChannel();const timeout=setTimeout(()=>{channel.port1.close();reject(new Error('Tempo esgotado ao preparar offline'));},15000);channel.port1.onmessage=event=>{clearTimeout(timeout);channel.port1.close();event.data.ok?resolve():reject(new Error('Recursos offline indisponíveis'));};worker.postMessage({type:'CACHE_DOMAIN',resources},[channel.port2]);});
 }
 return {init,install,cacheResources,supported};
})();
