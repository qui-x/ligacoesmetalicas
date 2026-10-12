'use strict';
/* Telas reutilizáveis; o roteador não monta nem desmonta o domínio. */
SimCore.router=(()=>{
 const S=SimCore, entries=new Map(),positions=new Map();let current=null,queue=Promise.resolve(),started=false,manualOrigin=null;
 const parse=value=>{const [id,...rest]=String(value||'').replace(/^#\/?/,'').split('/');let param='';try{param=decodeURIComponent(rest.join('/'));}catch(_){S.notifications.show('O endereço está incompleto.',{type:'warning'});}return{id:id==='workspace'?'laboratorio':id||defaultRoute(),param};};
 const key=r=>r.id+'/'+r.param,href=(id,param='')=>'#/'+id+(param?'/'+encodeURIComponent(param):'');
 const defaultRoute=()=>entries.has('inicio')?'inicio':'laboratorio';
 const valid=id=>/^[a-z][a-z0-9-]{0,63}$/.test(id);
 const focus=el=>{if(el?.isConnected&&!el.closest('[hidden],[inert]'))el.focus({preventScroll:true});};
 function register(spec,ctx){
  if(!valid(spec.id)||entries.has(spec.id)||['laboratorio','manual'].includes(spec.id))throw new TypeError('Tela inválida ou duplicada: '+spec.id);
  for(const hook of ['render','activate','deactivate','destroy'])if(spec[hook]!=null&&typeof spec[hook]!=='function')throw new TypeError('Hook de tela inválido');
  const entry={...spec,ctx};entries.set(spec.id,entry);
  return ()=>{if(entries.get(spec.id)!==entry)return;entries.delete(spec.id);if(current?.entry===entry){current.scope?.destroy();current=null;S.$('screens-host').replaceChildren();}positions.delete(spec.id+'/');};
 }
 async function leave(){
  if(!current)return;const old=current;
  positions.set(key(old),{id:document.activeElement?.id||'',scroll:window.scrollY});
  old.scope?.destroy();current=null;
  try{await old.entry?.deactivate?.(old.local);}catch(error){console.error('Falha ao desativar tela',error);}
  try{await old.entry?.destroy?.(old.local);}catch(error){console.error('Falha ao liberar tela',error);}
 }
 async function display(target,{restore=false,quiet=false}={}){
  let next=parse(target);const exp=S.experience?.current;
  if(exp&&!exp.allowsRoute(next.id,next.param)){
   S.notifications.show('Navegação limitada à atividade. Ajuda da atividade, acessibilidade e saída continuam disponíveis.',{type:'warning'});
   next=current?{id:current.id,param:current.param}:{id:'laboratorio',param:''};
  }
  if(!['laboratorio','manual'].includes(next.id)&&!entries.has(next.id)){
   if(!quiet)S.notifications.show('Tela não encontrada. A navegação foi recuperada.',{type:'warning'});next={id:defaultRoute(),param:''};
  }
  const canonical=href(next.id,next.param);if(location.hash!==canonical)history.replaceState(history.state,'',canonical);
  if(current&&key(current)===key(next))return current;
  if(next.id==='manual'&&current?.id!=='manual')manualOrigin=current?{id:current.id,param:current.param}:null;
  await leave();
  S.workspace.suspend();S.$('workspace').hidden=next.id!=='laboratorio';S.$('manual-screen').hidden=next.id!=='manual';
  const host=S.$('screens-host');host.hidden=['laboratorio','manual'].includes(next.id);host.replaceChildren();
  const entry=entries.get(next.id),scope=entry?S.createScope(error=>{console.error('Falha na tela',error);S.notifications.show('Não foi possível concluir esta ação.',{type:'error'});}):null;
  const local=entry?{...entry.ctx,scope,params:next.param,router:api}:null;current={...next,entry,scope,local};const thisView=current;
  if(entry){const release=entry.ctx.scope.cleanup(()=>scope.destroy());scope.cleanup(()=>{if(entry.ctx.scope.active)release();});}
  document.body.dataset.route=next.id;
  try{
   if(next.id==='laboratorio'){S.workspace.resume();S.viewport.measure();}
   else if(next.id==='manual')S.manual.render(next.param);
   else{const cleanup=await entry.render?.(host,local);if(typeof cleanup==='function')scope.cleanup(cleanup);if(!scope.active)return;await entry.activate?.(local);}
  }catch(error){console.error('Falha ao abrir tela',error);scope?.destroy();host.textContent='Não foi possível abrir esta tela. Utilize o Menu para continuar.';}
  if(current!==thisView)return;
  document.title=(entry?.title||({laboratorio:'Laboratório',manual:'Manual'}[next.id]))+' · '+S.$('brand-name').textContent;
  document.querySelectorAll('[data-nav]').forEach(el=>{if(el.dataset.nav===next.id)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  const saved=positions.get(key(next));const preferred=next.id==='laboratorio'?S.$('scientific-viewport'):next.id==='manual'?S.$('manual-titulo'):host.querySelector('[data-screen-focus],h1');
  if(preferred&&!preferred.hasAttribute('tabindex'))preferred.tabIndex=-1;
  focus(restore&&saved?.id?S.$(saved.id)||preferred:preferred);window.scrollTo(0,restore?saved?.scroll||0:0);
  S.emit('screen:changed',{id:next.id,param:next.param});return current;
 }
 function navigate(id,param='',options={}){
  const target=href(id,param);const operation=async()=>{
   if(options.history!==false&&location.hash!==target)history.pushState(null,'',target);
   return display(target,options);
  };const result=queue.then(operation);queue=result.catch(error=>console.error('Falha na navegação',error));return result;
 }
 function init(){if(started)return;started=true;
  window.addEventListener('hashchange',()=>navigate(parse(location.hash).id,parse(location.hash).param,{history:false,restore:true}));
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#/"]');if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;e.preventDefault();const r=parse(a.getAttribute('href'));S.modal.close();navigate(r.id,r.param);});
 }
 const api={init,register,navigate,href,parse,
  openManual:id=>navigate('manual',id||''),
  back:()=>{const r=current?.id==='manual'&&manualOrigin?manualOrigin:{id:defaultRoute(),param:''};return navigate(r.id,r.param,{restore:true});},
  refresh:async()=>{const r=current?{id:current.id,param:current.param}:parse(location.hash);await leave();return navigate(r.id,r.param,{history:false,restore:true});},
  release:leave,
  get current(){return current?{id:current.id,param:current.param}:null;},get screens(){return [...entries.keys()];}
 };return api;
})();
