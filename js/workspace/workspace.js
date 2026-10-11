'use strict';
/* Apresentação e geometria adaptadas do workspace da baseline.
   Conteúdo, disponibilidade e relevância são fornecidos pelo domínio. */
SimCore.workspace=(()=>{
 const S=SimCore,$=S.$,root=document.documentElement,mobile=matchMedia('(max-width:'+S.breakpoints.mobile+'px)');
 const state={left:'collapsed',right:'collapsed',presentation:'standard'},specs={left:null,right:null},origins={},selected={},cleanups={};
 let ready=false,lastDock='right',raf=0,suspended=false;let context=null;
 const panel=side=>$(side==='left'?'controls':'context-panel');
 const save=()=>S.storage.core.set('panels',{left:state.left!=='collapsed',right:state.right!=='collapsed'});
 const allowed=spec=>spec&&(!spec.visible||spec.visible(context));
 function release(side){for(const fn of cleanups[side]||[])try{fn();}catch(error){console.error('Falha ao limpar painel',error);}cleanups[side]=[];}
 function render(side){
  release(side);const spec=specs[side],host=$('dock-'+side+'-content'),tabs=$('dock-'+side+'-tabs');host.replaceChildren();tabs.replaceChildren();tabs.hidden=true;
  $('title-'+side).textContent=spec?.title||(side==='left'?'Ferramentas':'Informações');$('workspace-'+side).textContent=$('title-'+side).textContent;$('close-'+side).setAttribute('aria-label','Fechar '+$('title-'+side).textContent);
  const mount=fn=>{const cleanup=fn?.(host);if(typeof cleanup==='function')cleanups[side].push(cleanup);};
  if(!spec){const p=document.createElement('p');p.className='panel-empty';p.textContent='Nenhum conteúdo disponível neste contexto.';host.append(p);return;}
  if(spec.sections?.length){const available=spec.sections.filter(allowed);const active=available.find(x=>x.id===selected[side])||available[0];selected[side]=active?.id;tabs.hidden=available.length<2;
   for(const section of available){const b=document.createElement('button');b.type='button';b.className='secondary-btn';b.textContent=section.title;b.setAttribute('aria-pressed',String(section===active));b.setAttribute('aria-controls',host.id);b.addEventListener('click',()=>{selected[side]=section.id;render(side);tabs.querySelector('[aria-pressed=true]')?.focus();});tabs.append(b);}mount(active?.render);
  }else mount(spec.render);
 }
 function geometry(){
  if(!ready)return;const vv=window.visualViewport,height=vv?.height||innerHeight,top=vv?.offsetTop||0;
  root.style.setProperty('--workspace-visible-height',height+'px');root.style.setProperty('--sheet-top',Math.round(top+Math.max(8,height*.1))+'px');root.style.setProperty('--sheet-height',Math.round(height-Math.max(8,height*.1)-8)+'px');
  for(const side of ['left','right'])$('workspace').style.setProperty('--dock-'+side+'-inset',(!mobile.matches&&state[side]!=='collapsed'&&state.presentation!=='fullscreen'?panel(side).getBoundingClientRect().width+24:0)+'px');
 }
 function apply(){
  if(!ready)return;const visible=!$('workspace').hidden&&!suspended;
  root.dataset.workspaceSize=mobile.matches?'compact':innerWidth<S.breakpoints.dualPanels?'medium':'expanded';
  for(const side of ['left','right']){
   const el=panel(side),open=visible&&state[side]!=='collapsed';el.classList.toggle('dock-collapsed',!open);el.inert=!open;el.setAttribute('aria-hidden',String(!open));el.setAttribute('role',mobile.matches&&open?'dialog':'region');
   if(mobile.matches&&open)el.setAttribute('aria-modal','true');else el.removeAttribute('aria-modal');
   $('workspace-'+side).setAttribute('aria-expanded',String(open));
  }
  panel('right').dataset.presentation=state.presentation;
  const sheet=visible&&mobile.matches&&(state.left!=='collapsed'||state.right!=='collapsed'),full=visible&&!mobile.matches&&state.right!=='collapsed'&&state.presentation==='fullscreen';
  $('sheet-backdrop').hidden=!sheet;document.body.classList.toggle('sheet-open',sheet);$('scientific-stage').inert=sheet||full;$('workspace-launchers').inert=sheet||full;document.querySelector('.app-header').inert=sheet;$('workspace').classList.toggle('dock-fullscreen',full);panel('left').inert=panel('left').inert||full;
  $('bottom-nav').inert=sheet;$('activity-banner').inert=sheet;
  $('dock-expand').textContent=full?'Restaurar':'Expandir';$('dock-expand').setAttribute('aria-expanded',String(full));geometry();
 }
 function close(side=lastDock,restore=true){if(!['left','right'].includes(side))return;const was=state[side]!=='collapsed';state[side]='collapsed';apply();save();if(restore){const target=origins[side];(target?.isConnected&&target.getClientRects().length&&!target.closest('[inert],[hidden]')?target:$('workspace-'+side)).focus({preventScroll:true});}if(was)S.emit('panel:closed',{side});}
 function open(side,trigger=document.activeElement){if(!ready||!['left','right'].includes(side)||$('workspace').hidden||suspended)return;if(specs[side]&&!allowed(specs[side]))return;
  origins[side]=trigger;lastDock=side;if(mobile.matches||innerWidth<S.breakpoints.dualPanels||(side==='right'&&['wide','fullscreen'].includes(state.presentation)))close(side==='left'?'right':'left',false);
  if(side==='left'&&state.presentation==='fullscreen')state.presentation=specs.right?.presentation||'standard';state[side]='open';apply();save();$('close-'+side).focus({preventScroll:true});S.notifications.announce($('title-'+side).textContent+': painel aberto.');S.emit('panel:opened',{side});
 }
 function refresh(){if(!ready||raf)return;raf=requestAnimationFrame(()=>{raf=0;if(mobile.matches||innerWidth<S.breakpoints.dualPanels){if(state.left!=='collapsed'&&state.right!=='collapsed')close(lastDock==='left'?'right':'left',false);}apply();if(mobile.matches&&document.activeElement?.matches('input,textarea,select')&&document.activeElement.closest('.dock'))document.activeElement.scrollIntoView({block:'nearest'});if(mobile.matches&&state[lastDock]!=='collapsed'&&!panel(lastDock).contains(document.activeElement)&&!document.querySelector('dialog[open]'))$('close-'+lastDock).focus();});}
 function set(side,spec){if(!['left','right'].includes(side))throw new TypeError('Painel inválido');if(spec?.presentation&&!['compact','standard','wide'].includes(spec.presentation))throw new TypeError('Apresentação inválida');specs[side]=spec;delete selected[side];if(side==='right')state.presentation=spec?.presentation||'standard';render(side);$('workspace-'+side).hidden=!!spec&&!allowed(spec);if(spec&&!allowed(spec))close(side,false);apply();}
 function init(){if(ready)return;ready=true;root.dataset.workspace='core';for(const side of ['left','right']){render(side);$('workspace-'+side).addEventListener('click',e=>state[side]==='collapsed'?open(side,e.currentTarget):close(side));$('close-'+side).addEventListener('click',()=>close(side));}
  $('dock-expand').addEventListener('click',()=>{state.presentation=state.presentation==='fullscreen'?(specs.right?.presentation||'standard'):'fullscreen';close('left',false);apply();$('dock-expand').focus();});
  $('sheet-backdrop').addEventListener('click',()=>close());document.addEventListener('keydown',e=>{if($('workspace').hidden||document.querySelector('dialog[open]'))return;const side=state[lastDock]!=='collapsed'?lastDock:lastDock==='left'?'right':'left';if(state[side]==='collapsed')return;if(e.key==='Escape'){e.preventDefault();close(side);}if(mobile.matches||(side==='right'&&state.presentation==='fullscreen'))S.trap(e,panel(side));});
  window.addEventListener('resize',refresh);window.visualViewport?.addEventListener('resize',refresh);window.visualViewport?.addEventListener('scroll',refresh);
  const saved=S.storage.core.get('panels',{}),pref=saved&&typeof saved==='object'?saved:{};if(!mobile.matches){state.left=pref.left?'open':'collapsed';state.right=pref.right?'open':'collapsed';if(innerWidth<S.breakpoints.dualPanels&&pref.left&&pref.right)state.left='collapsed';}
  apply();S.emit('workspace:ready',{});
 }
 return {init,open,close,set,refresh,geometry,state,get ready(){return ready;},setContext(value){context=value;for(const side of ['left','right']){render(side);$('workspace-'+side).hidden=!!specs[side]&&!allowed(specs[side]);if(specs[side]&&!allowed(specs[side]))close(side,false);}apply();},clear(){for(const side of ['left','right']){set(side,null);close(side,false);delete origins[side];}context=null;},suspend(){suspended=true;apply();},resume(){suspended=false;apply();}};
})();
