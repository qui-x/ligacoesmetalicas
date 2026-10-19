'use strict';
/* Porta mínima dos renderizadores SILM. Não inicializa nem carrega o shell antigo. */
window.SimCore={
 ExperienceUI:{element(tag,text=null,className=''){
  const node=document.createElement(tag);if(text!==null)node.textContent=text;
  if(className)node.className=className;return node;
 }},
 notifications:{announce(text){const node=document.getElementById('silm-announcement');if(node)node.textContent=text;}},
 storage:{domain(){return {
  get(key,fallback){try{const raw=BaseDemoSI.storage.read('silm-view:'+key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}},
  set(key,value){return BaseDemoSI.storage.write('silm-view:'+key,JSON.stringify(value));}
 };}},
 createScope(){
  const cleanups=new Set();let active=true;
  const cleanup=fn=>{let pending=true;const release=()=>{if(!pending)return;pending=false;cleanups.delete(release);fn();};if(active)cleanups.add(release);else release();return release;};
  return {
   get active(){return active;},cleanup,
   listen(target,type,handler,options){target.addEventListener(type,handler,options);return cleanup(()=>target.removeEventListener(type,handler,options));},
   timeout(fn,ms){let release;const id=setTimeout(()=>{release();if(active)fn();},ms);release=cleanup(()=>clearTimeout(id));return release;},
   observe(observer,target,options){observer.observe(target,options);return cleanup(()=>observer.disconnect());},
   destroy(){if(!active)return;active=false;for(const release of [...cleanups].reverse())release();}
  };
 }
};
