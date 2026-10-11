'use strict';
SimCore.notifications=(()=>{
 let timer=null,owner=null,announceTimer=null;
 const clear=()=>{clearTimeout(timer);timer=null;SimCore.$('toast').hidden=true;SimCore.$('toast-message').textContent='';owner=null;};
 function announce(message){const el=SimCore.$('announcer');clearTimeout(announceTimer);el.textContent='';announceTimer=setTimeout(()=>{el.textContent=String(message);announceTimer=null;},30);}
 function show(message,{type='info',duration=5000,owner:who=null}={}){clear();owner=who;const el=SimCore.$('toast');el.dataset.type=['info','success','warning','error'].includes(type)?type:'info';SimCore.$('toast-message').textContent=String(message);el.hidden=false;announce(message);if(duration>0)timer=setTimeout(clear,Math.max(1000,duration));return clear;}
 return {show,announce,clear(){clear();clearTimeout(announceTimer);announceTimer=null;SimCore.$('announcer').textContent='';},init(){SimCore.$('toast-close').addEventListener('click',clear);SimCore.events.addEventListener('storage:unavailable',()=>show('O armazenamento está indisponível. As alterações ficarão apenas nesta sessão.',{type:'warning'}));},clearOwner(who){if(owner===who){clear();clearTimeout(announceTimer);SimCore.$('announcer').textContent='';}}};
})();
