'use strict';
/* Avisos curtos da família: no topo, logo abaixo do cabeçalho (3,6 s por padrão), com um botão de ação opcional
   ({action:{label, run}}) e "Fechar". Todo aviso também é anunciado; announce() é a narração sem aviso visual. */
SimCore.notifications=(()=>{
 let timer=null,owner=null,announceTimer=null,action=null;
 const clear=()=>{clearTimeout(timer);timer=null;SimCore.$('toast').hidden=true;SimCore.$('toast-message').textContent='';const b=SimCore.$('toast-action');if(b){b.hidden=true;b.textContent='';}action=null;owner=null;};
 function announce(message){const el=SimCore.$('announcer');clearTimeout(announceTimer);el.textContent='';announceTimer=setTimeout(()=>{el.textContent=String(message);announceTimer=null;},30);}
 function show(message,{type='info',duration=3600,owner:who=null,action:act=null}={}){
  clear();owner=who;const el=SimCore.$('toast');el.dataset.type=['info','success','warning','error'].includes(type)?type:'info';SimCore.$('toast-message').textContent=String(message);
  const b=SimCore.$('toast-action');if(act&&b){if(!act.label||typeof act.run!=='function')throw new TypeError('Ação do aviso inválida');action=act;b.textContent=String(act.label);b.hidden=false;}
  el.hidden=false;announce(message);if(duration>0)timer=setTimeout(clear,Math.max(1000,duration));return clear;
 }
 return {show,announce,clear(){clear();clearTimeout(announceTimer);announceTimer=null;SimCore.$('announcer').textContent='';},
  init(){SimCore.$('toast-close').addEventListener('click',clear);SimCore.$('toast-action')?.addEventListener('click',()=>{const run=action?.run;clear();Promise.resolve().then(()=>run?.()).catch(error=>console.error('Falha na ação do aviso',error));});SimCore.events.addEventListener('storage:unavailable',()=>show('O armazenamento está indisponível. As alterações ficarão apenas nesta sessão.',{type:'warning',duration:6000}));},
  clearOwner(who){if(owner===who){clear();clearTimeout(announceTimer);SimCore.$('announcer').textContent='';}}};
})();
