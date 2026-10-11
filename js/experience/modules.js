'use strict';
SimCore.createModules=(ctx,experience)=>{
 const S=SimCore,U=S.ExperienceUI,records=new Map();let selected=null,expanded=null,queue=Promise.resolve(),alive=true;
 const available=m=>m&&(typeof m.enabled==='function'?m.enabled(ctx)!==false:m.enabled!==false);
 const allowed=id=>available(records.get(id))&&experience.allowsModule(id);
 function register(spec){if(!U.id(spec.id)||records.has(spec.id)||!spec.title)throw new TypeError('Módulo inválido ou duplicado');if(spec.controls!=null&&typeof spec.controls!=='function')throw new TypeError('controls deve ser um renderer');records.set(spec.id,{...spec});}
 function select(id){const run=async()=>{
  if(!alive||!ctx.scope.active)return false;
  const next=records.get(id);if(!allowed(id)){ctx.notify('Módulo indisponível nesta atividade.',{type:'warning'});return false;}
  if(selected===id)return true;const previous=records.get(selected);
  await previous?.deactivate?.(ctx);try{await next.activate?.(ctx);}catch(error){await previous?.activate?.(ctx);throw error;}
  if(!alive||!ctx.scope.active)return false;if(!allowed(id)){await next.deactivate?.(ctx);if(previous&&allowed(previous.id))await previous.activate?.(ctx);return false;}selected=id;experience.moduleChanged(id);S.emit('module:changed',{id,title:next.title});return true;
 };const result=queue.then(run);queue=result.catch(()=>{});return result;}
 function render(host,local){
  const box=U.element('div',null,'module-selector');let controlScope=null,releaseControl=null;
  const controls=U.element('div',null,'module-controls');host.append(box,controls);
  const cleanup=()=>{if(releaseControl){const release=releaseControl;releaseControl=null;release();}controlScope=null;};
  local.scope.cleanup(()=>{controlScope?.destroy();controlScope=null;});
  for(const m of records.values()){
   const card=U.element('section',null,'module-card');card.dataset.module=m.id;
   const head=U.element('button',null,'module-head');head.type='button';head.id='module-head-'+m.id;head.setAttribute('aria-controls','module-body-'+m.id);head.title=m.tooltip||m.description||m.title;
   head.append(U.icon(m.icon),U.element('strong',m.title));const badge=U.element('span','Ativo','status-badge');badge.dataset.moduleBadge='';head.append(badge);
   const body=U.element('div',null,'module-body');body.id='module-body-'+m.id;body.setAttribute('role','region');body.setAttribute('aria-labelledby',head.id);
   body.append(U.element('p',m.description||''));if(m.badge)body.append(U.element('p',m.badge,'eyebrow'));
   const activate=U.button('Ativar '+m.title,()=>select(m.id),local.scope,{id:'module-select-'+m.id});activate.dataset.moduleSelect=m.id;body.append(activate);
   const reason=U.element('p','Indisponível neste contexto.','module-reason');body.append(reason);
   local.scope.listen(head,'click',()=>{expanded=expanded===m.id?null:m.id;update(false);});card.append(head,body);box.append(card);
  }
  function update(refreshControls=true){
   for(const m of records.values()){const card=box.querySelector('[data-module="'+m.id+'"]'),active=selected===m.id,open=expanded===m.id;
    card.classList.toggle('is-active',active);card.querySelector('.module-head').setAttribute('aria-expanded',String(open));card.querySelector('.module-body').hidden=!open;card.querySelector('[data-module-badge]').hidden=!active;
    const b=card.querySelector('[data-module-select]');b.disabled=!allowed(m.id);b.setAttribute('aria-pressed',String(active));b.textContent=active?m.title+' em uso':'Ativar '+m.title;card.querySelector('.module-reason').hidden=allowed(m.id);
   }
   if(!refreshControls)return;cleanup();controls.replaceChildren();const m=records.get(selected);if(m?.controls){controlScope=S.createScope();releaseControl=local.scope.cleanup(()=>controlScope?.destroy());const result=m.controls(controls,{...local,scope:controlScope});if(typeof result==='function')controlScope.cleanup(result);}
  }
  local.scope.on('module:changed',()=>update());local.scope.on('activity:changed',()=>update());update();
 }
 return {register,select,render,available:id=>allowed(id),get current(){return selected;},get list(){return [...records.values()].map(x=>({...x}));},get:id=>records.get(id),
  async destroy(){alive=false;await queue;await records.get(selected)?.deactivate?.(ctx);records.clear();selected=null;expanded=null;}
 };
};
