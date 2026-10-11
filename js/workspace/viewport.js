'use strict';
SimCore.viewport=(()=>{
 let last={width:0,height:0,pixelRatio:1};
 const measure=()=>{const el=SimCore.$('viewport-content'),r=el.getBoundingClientRect();const next={width:r.width,height:r.height,pixelRatio:devicePixelRatio||1};if(next.width>0&&next.height>0&&(JSON.stringify(next)!==JSON.stringify(last))){last=next;SimCore.emit('viewport:resize',next);}return {...last};};
 function neutral(){const old=SimCore.$('viewport-content'),host=old.cloneNode(false);old.replaceWith(host);host.hidden=true;SimCore.$('viewport-empty').hidden=false;SimCore.$('scientific-viewport').setAttribute('aria-label','Área central');}
 return {get host(){return SimCore.$('viewport-content');},get size(){return measure();},neutral,prepare(label){SimCore.$('viewport-empty').hidden=true;const old=SimCore.$('viewport-content'),h=old.cloneNode(false);old.replaceWith(h);h.hidden=false;SimCore.$('scientific-viewport').setAttribute('aria-label',label||'Visualização do módulo');return h;},measure,
  init(){const host=SimCore.$('scientific-viewport');const resize=()=>requestAnimationFrame(measure);if(window.ResizeObserver)new ResizeObserver(resize).observe(host);window.addEventListener('resize',resize);SimCore.events.addEventListener('a11y:changed',resize);
   for(const type of ['pointerdown','pointermove','pointerup','pointercancel','keydown','keyup'])host.addEventListener(type,event=>{const r=host.getBoundingClientRect();SimCore.emit('viewport:input',{type,event,x:event.clientX==null?null:event.clientX-r.left,y:event.clientY==null?null:event.clientY-r.top,pointerType:event.pointerType||null});});neutral();}
 };
})();
