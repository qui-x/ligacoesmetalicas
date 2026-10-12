'use strict';
/* Único ponto de montagem; nenhum schema de domínio é definido aqui. */
SimCore.domain=(()=>{
 const S=SimCore;let current=null,queue=Promise.resolve();
 const enqueue=fn=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
 function validate(module){if(!module||typeof module!=='object')throw new TypeError('Domínio inválido');const m=module.manifest;if(!m||!/^[a-z][a-z0-9-]{0,63}$/.test(m.id))throw new TypeError('Manifesto sem ID válido');for(const key of ['nome','nomeCurto','versao','titulo','subtitulo'])if(typeof m[key]!=='string')throw new TypeError('Campo obrigatório: '+key);for(const key of ['init','mount','activate','resize','reset','deactivate','destroy'])if(module[key]!=null&&typeof module[key]!=='function')throw new TypeError('Hook inválido: '+key);return m;}
 function neutral(){S.workspace.clear();S.viewport.neutral();S.manual.clear();S.actions?.clear();S.$('domain-actions').replaceChildren();S.identity?.apply(null);S.theme?.apply(null);S.$('module-status').textContent='Área de trabalho';}
 function errorView(){const empty=S.$('viewport-empty');empty.querySelector('h1').textContent='Não foi possível carregar esta visualização.';empty.querySelector('p').textContent='O espaço continua disponível. Tente abrir o módulo novamente.';}
 function emptyView(){const empty=S.$('viewport-empty');empty.querySelector('h1').textContent='Nenhum módulo científico carregado';empty.querySelector('p').textContent='O espaço está pronto. As ferramentas e a visualização aparecem quando um módulo é conectado.';}
 async function teardown(){const e=current;if(!e){neutral();return;}current=null;await e.ctx.experience?.destroy();e.scope.destroy();try{await e.module.deactivate?.(e.ctx);}catch(error){console.error('Falha ao desativar domínio',error);}try{await e.module.destroy?.(e.ctx);}catch(error){console.error('Falha ao destruir domínio',error);}S.modal.closeOwner(e.owner);S.notifications.clearOwner(e.owner);neutral();S.emit('domain:destroyed',{id:e.manifest.id});}
 function failure(e,error){console.error('Falha no domínio',error);if(current!==e||e.failed)return;e.failed=true;e.scope.destroy();enqueue(async()=>{if(current===e){await teardown();errorView();S.notifications.show('Não foi possível carregar esta visualização.',{type:'error'});}});}
 function contextFor(e){const active=()=>current===e&&e.scope.active;const guard=fn=>(...args)=>{if(active())return fn(...args);};
  let context=null;const store=S.storage.domain(e.manifest.id),storage=Object.freeze({prefix:store.prefix,get:(...args)=>store.get(...args),set:guard((...args)=>store.set(...args)),remove:guard((...args)=>store.remove(...args)),clear:guard(()=>store.clear())});const ctx={manifest:e.manifest,scope:e.scope,storage,events:{on:(type,fn)=>e.scope.on(type,event=>fn(event.detail)),emit:guard((type,detail)=>S.emit('domain:'+e.manifest.id+':'+type,detail))},accessibility:S.accessibility,
   viewport:{host:S.viewport.host,overlay:(node)=>S.overlays.add(node,e.scope,ctx.viewport.host),get size(){return S.viewport.size;},onInput:fn=>e.scope.on('viewport:input',event=>fn(event.detail))},
   notify:guard((message,options={})=>S.notifications.show(message,{...options,owner:e.owner})),modal:{open:guard(options=>S.modal.open({...options,owner:e.owner}))},manual:{register:guard(data=>S.manual.register(data,ctx))},
   panels:{set:guard((side,spec)=>S.workspace.set(side,wrapPanel(spec))),open:guard((side,source)=>S.workspace.open(side,document.activeElement,source||null)),close:guard(side=>S.workspace.close(side)),get source(){return S.workspace.source;}},
   setContext:guard(value=>{context=value;S.workspace.setContext(value);S.actions?.refresh(value);}),getContext:()=>context,
   reset:()=>reset(),theme:{set:guard(theme=>S.theme?.apply(theme))}
  };
  function wrapPanel(spec){if(!spec)return null;const wrap=render=>host=>{const local=S.createScope(error=>failure(e,error)),release=e.scope.cleanup(()=>local.destroy());let cleanup;try{cleanup=render?.(host,{...ctx,scope:local});}catch(error){release();throw error;}return()=>{try{if(typeof cleanup==='function')cleanup();}finally{release();}};};const wrapSpec=x=>({...x,render:wrap(x.render),sections:x.sections?.map(s=>({...s,render:wrap(s.render)}))});return {...wrapSpec(spec),sources:spec.sources?.map(wrapSpec)};}
  ctx.experience=S.createExperience(ctx);
  ctx.screens={register:guard(spec=>ctx.experience.registerScreen(spec)),navigate:guard((...args)=>S.router.navigate(...args))};
  ctx.modules=ctx.experience.modules;ctx.activity=ctx.experience.activity;ctx.references=ctx.experience.references;ctx.report=ctx.experience.reports;ctx.themes=ctx.experience.themes;ctx.notebook=ctx.experience.notebook;ctx.shell=Object.freeze({registerResource:guard(spec=>S.shell.registerResource(spec)),registerDesktop:guard(spec=>S.shell.registerDesktop(spec)),registerBottom:guard(spec=>S.shell.registerBottom(spec)),registerTour:guard(action=>S.shell.registerTour(action)),open:guard(()=>S.shell.open()),close:guard(()=>S.shell.close()),setStartup:guard(value=>S.shell.setStartup(value)),setProjector:guard(value=>S.shell.setProjector(value)),get projector(){return S.shell.projector;}});
  return Object.freeze(ctx);
 }
 async function register(module){return enqueue(async()=>{if(module===null){await teardown();emptyView();await S.router.navigate('laboratorio','',{history:false});return null;}const manifest=validate(module);await teardown();emptyView();const e={module,manifest,owner:Symbol(manifest.id),failed:false};e.scope=S.createScope(error=>failure(e,error));current=e;S.viewport.prepare(manifest.viewport?.label||manifest.titulo);e.ctx=contextFor(e);
  try{
   S.identity?.apply(manifest);S.theme?.apply(manifest.tema||null);S.$('module-status').textContent=manifest.titulo;
   await module.init?.(e.ctx);await module.mount?.(e.ctx);if(!e.scope.active)throw new Error('Montagem cancelada');
   if(manifest.painelEsquerdo)e.ctx.panels.set('left',manifest.painelEsquerdo);if(manifest.painelDireito)e.ctx.panels.set('right',manifest.painelDireito);
   if(manifest.manual)e.ctx.manual.register(manifest.manual);S.actions?.register(manifest.acoesSuperiores||[],e.ctx,e.scope);
   e.scope.on('viewport:resize',event=>module.resize?.(event.detail,e.ctx));await module.activate?.(e.ctx);await module.resize?.(S.viewport.size,e.ctx);await e.ctx.experience.ready();
   S.pwa?.cacheResources(manifest.recursos||[]).catch(error=>console.warn('Recursos offline não preparados',error));S.emit('domain:mounted',{id:manifest.id});return e.ctx;
  }catch(error){console.error('Falha ao montar domínio',error);await teardown();errorView();S.notifications.show('Não foi possível carregar esta visualização.',{type:'error'});return null;}
 });}
 async function reset(){return enqueue(async()=>{const e=current;if(!e)return;S.emit('reset:requested',{id:e.manifest.id});try{await e.module.reset?.(e.ctx);}catch(error){console.error('Falha ao reiniciar domínio',error);await teardown();errorView();}});}
 return {register,reset,unload:()=>register(null),get current(){return current?{id:current.manifest.id,active:current.scope.active}:null;}};
})();
SimCore.registerDomain=SimCore.domain.register;
Object.defineProperty(SimCore,'state',{get:()=>({workspace:{...SimCore.workspace.state},viewport:{...SimCore.viewport.size},modal:{open:!!SimCore.modal.current},manual:{open:!SimCore.$('manual-screen').hidden},accessibility:SimCore.accessibility.state,responsive:document.documentElement.dataset.workspaceSize,domain:SimCore.domain.current})});
