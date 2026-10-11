'use strict';
SimCore.scopeStats={scopes:0,resources:0};
SimCore.createScope=(onError=error=>console.error(error))=>{
 const controller=new AbortController(),cleanups=new Set();let active=true;SimCore.scopeStats.scopes++;
 const call=(fn,...args)=>{if(!active)return;try{const result=fn(...args);if(result?.catch)result.catch(onError);return result;}catch(error){onError(error);}};
 const add=fn=>{if(!active){fn();return()=>{};}if(!cleanups.has(fn)){cleanups.add(fn);SimCore.scopeStats.resources++;}return()=>{if(cleanups.delete(fn)){SimCore.scopeStats.resources--;fn();}};};
 return Object.freeze({get active(){return active;},get size(){return cleanups.size;},signal:controller.signal,cleanup:add,
  listen(target,type,fn,options){if(!active)return()=>{};const handler=event=>call(fn,event);target.addEventListener(type,handler,options);return add(()=>target.removeEventListener(type,handler,options));},
  on(type,fn){return this.listen(SimCore.events,type,fn);},
  timeout(fn,delay){if(!active)return()=>{};let stop;const id=setTimeout(()=>{stop();call(fn);},delay);stop=add(()=>clearTimeout(id));return stop;},
  interval(fn,delay){if(!active)return()=>{};const id=setInterval(()=>call(fn),delay);return add(()=>clearInterval(id));},
  animation(fn){if(!active)return()=>{};let frame;const tick=t=>{if(!active)return;call(fn,t);if(active)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return add(()=>cancelAnimationFrame(frame));},
  observe(observer,target,options){if(!active){observer.disconnect();return()=>{};}observer.observe(target,options);return add(()=>observer.disconnect());},
  webgl(context){return add(()=>context?.getExtension('WEBGL_lose_context')?.loseContext());},
  destroy(){if(!active)return;active=false;controller.abort();for(const fn of [...cleanups]){cleanups.delete(fn);SimCore.scopeStats.resources--;try{fn();}catch(error){onError(error);}}SimCore.scopeStats.scopes--;}
 });
};
