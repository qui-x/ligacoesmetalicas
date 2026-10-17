'use strict';
/* Aplicativo instalável da família. "Instalar app" só aparece quando o navegador oferece a instalação e o aplicativo
   ainda não está instalado; sem oferta, o produto pode apontar um tópico do Manual (shell.install.manualTopic).
   Nova versão: aviso com "Recarregar" (nada se perde: só recarrega a pedido). */
SimCore.pwa=(()=>{
 let prompt=null,registration=null,manualTopic=null;
 const supported=()=> 'serviceWorker' in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname));
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const name=()=>SimCore.$('brand-name')?.textContent.trim()||'Aplicativo';
 const state=()=>SimCore.emit('pwa:state',{installable:!!prompt&&!standalone(),installed:standalone()});
 function init(){
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;SimCore.emit('pwa:installable',{});state();});
  window.addEventListener('appinstalled',()=>{prompt=null;SimCore.notifications.show(name()+' instalado. Abra uma vez com internet antes de usar offline.',{type:'success'});state();});
  matchMedia('(display-mode: standalone)').addEventListener?.('change',state);
  if(!supported())return;const previous=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(previous)SimCore.notifications.show('Nova versão do '+name()+' instalada.',{duration:0,action:{label:'Recarregar',run:()=>location.reload()}});});
  registration=navigator.serviceWorker.register('sw.js').catch(error=>{console.warn('Offline indisponível',error);return null;});
 }
 async function install(){
  if(prompt){const p=prompt;prompt=null;await p.prompt();await p.userChoice;state();return;}
  if(manualTopic&&SimCore.router.screens.includes('manual')!==false){await SimCore.router.navigate('manual',manualTopic);return;}
  SimCore.modal.open({title:'Instalar app',content:'Use a opção de instalar ou adicionar à tela inicial no menu do navegador. Abra uma vez com internet para preparar o uso offline.'});
 }
 async function cacheResources(resources){if(!resources.length||!supported())return;if(registration&&!await registration)return;const reg=await navigator.serviceWorker.ready;const worker=reg.active;if(!worker)return;
  await new Promise((resolve,reject)=>{const channel=new MessageChannel();const timeout=setTimeout(()=>{channel.port1.close();reject(new Error('Tempo esgotado ao preparar offline'));},15000);channel.port1.onmessage=event=>{clearTimeout(timeout);channel.port1.close();event.data.ok?resolve():reject(new Error('Recursos offline indisponíveis'));};worker.postMessage({type:'CACHE_DOMAIN',resources},[channel.port2]);});
 }
 return {init,install,cacheResources,supported,configure({manualTopic:topic=null}={}){manualTopic=topic?String(topic):null;},get installable(){return !!prompt&&!standalone();},get installed(){return standalone();}};
})();
