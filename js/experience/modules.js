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
  /* Cartões objetivos: nome, estado e resumo. O aprofundamento fica dentro do módulo. */
  for(const m of records.values()){
   const card=U.element('section',null,'module-card');card.dataset.module=m.id;if(m.accent)card.style.setProperty('--mod',m.accent);
   const head=U.element('button',null,'module-head');head.type='button';head.id='module-head-'+m.id;head.setAttribute('aria-controls','module-body-'+m.id);head.title=m.tooltip||m.description||m.title;
   const mark=U.element('span',null,'module-icon');mark.append(U.icon(m.icon||'module'));head.append(mark,U.element('strong',m.title,'module-name'));
   if(m.number!=null){const n=U.element('span',null,'module-number');n.append(U.element('span',', módulo ','sr-only'),document.createTextNode(String(m.number)));head.append(n);}
   const badge=U.element('span',null,'status-badge module-active');badge.dataset.moduleBadge='';badge.append(U.element('span',', ','sr-only'),document.createTextNode('Ativo'));head.append(badge,S.icons.element('dropdown','module-chevron'));
   const body=U.element('div',null,'module-body');body.id='module-body-'+m.id;body.setAttribute('role','region');body.setAttribute('aria-labelledby',head.id);
   const activate=U.button('Ativar módulo '+m.title,()=>choose(m.id),local.scope,{id:'module-select-'+m.id});activate.dataset.moduleSelect=m.id;activate.classList.add('module-activate');
   activate.replaceChildren(U.element('span',null,'module-dot'),U.element('span','Ativar módulo '+m.title,'module-activate-text'));activate.querySelector('.module-dot').setAttribute('aria-hidden','true');
   if(m.description)activate.setAttribute('aria-describedby','module-def-'+m.id);body.append(activate);
   if(m.description){const def=U.element('p',m.description,'module-def');def.id='module-def-'+m.id;body.append(def);}
   if(m.badge)body.append(U.element('p',m.badge,'eyebrow'));
   if(Array.isArray(m.facts)&&m.facts.length){const dl=U.element('dl',null,'fact-grid');for(const [label,value]of m.facts){const cell=U.element('div',null,'fact-cell');cell.append(U.element('dt',String(label),'fact-label'),U.element('dd',String(value),'fact-value'));dl.append(cell);}body.append(dl);}
   if(m.note)body.append(U.element('p',m.note,'module-note'));
   const reason=U.element('p','Indisponível neste contexto.','module-reason');body.append(reason);
   local.scope.listen(head,'click',()=>{expanded=expanded===m.id?null:m.id;update(false);});card.append(head,body);box.append(card);
  }
  async function choose(id){
   const m=records.get(id);if(!m)return;
   if(selected===id){S.notifications.announce('O módulo '+m.title+' já está em uso.');return;}
   if(await select(id)){ctx.history?.log({action:'Módulo: '+m.title+'.'});S.notifications.announce('Módulo '+m.title+' ativado.');ctx.notify('Módulo '+m.title+' ativado.',{type:'success',duration:3600});}
  }
  function update(refreshControls=true){
   for(const m of records.values()){const card=box.querySelector('[data-module="'+m.id+'"]'),active=selected===m.id,open=expanded===m.id;
    card.classList.toggle('is-active',active);card.querySelector('.module-head').setAttribute('aria-expanded',String(open));card.querySelector('.module-body').hidden=!open;card.querySelector('[data-module-badge]').hidden=!active;
    const b=card.querySelector('[data-module-select]');const can=allowed(m.id);if(can)b.removeAttribute('aria-disabled');else b.setAttribute('aria-disabled','true');b.setAttribute('aria-pressed',String(active));b.querySelector('.module-activate-text').textContent=active?'Módulo '+m.title+' em uso':'Ativar módulo '+m.title;card.querySelector('.module-reason').hidden=can;
   }
   if(!refreshControls)return;cleanup();controls.replaceChildren();const m=records.get(selected);if(m?.controls){controlScope=S.createScope();releaseControl=local.scope.cleanup(()=>controlScope?.destroy());const result=m.controls(controls,{...local,scope:controlScope});if(typeof result==='function')controlScope.cleanup(result);}
  }
  local.scope.on('module:changed',()=>update());local.scope.on('activity:changed',()=>update());update();
 }
 return {register,select,render,available:id=>allowed(id),get current(){return selected;},get list(){return [...records.values()].map(x=>({...x}));},get:id=>records.get(id),
  async destroy(){alive=false;await queue;await records.get(selected)?.deactivate?.(ctx);records.clear();selected=null;expanded=null;}
 };
};
