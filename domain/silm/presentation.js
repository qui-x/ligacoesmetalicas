'use strict';
SILM.createPresentation=(ctx,{onInvestigate,onSources,canInvestigate})=>{
 const U=SimCore.ExperienceUI,state={query:'',selection:null};let current=null;
 function open({expanded=false,opener:providedOpener=null}={}){
  if(current)return;
  const scope=SimCore.createScope(),previousProjector=SimCore.shell.projector,body=U.element('div'),toolbar=U.element('div',null,'presentation-toolbar'),focusOrigin=providedOpener||document.activeElement;
  body.style.cssText='display:flex;flex-direction:column;height:100%;min-height:0';let handle,table,wasNative=false,closing=false,expandedMode=expanded||previousProjector,preferenceCleanup=null;
  const sourcesBox=U.element('div',null,'silm-inline-sources'),prefs=U.element('div',null,'presentation-preferences');sourcesBox.hidden=true;prefs.hidden=true;body.append(prefs,sourcesBox);
  const expand=U.button('Expandir em tela cheia',()=>{expandedMode=true;sync();SimCore.notifications.announce('Tabela Periódica aberta em modo de apresentação.');table.title.focus();},scope,{id:'periodic-expand'});
  const native=U.button('Apresentar em tela cheia',async()=>{
   expandedMode=true;sync();
   try{if(typeof handle.element.requestFullscreen!=='function'){announceFallback('Tela cheia do dispositivo indisponível. O modo ampliado continua ativo.');return;}await handle.element.requestFullscreen();wasNative=document.fullscreenElement===handle.element;sync();}
   catch(_){announceFallback('O navegador não permitiu tela cheia. O modo ampliado continua ativo.');}
  },scope,{id:'periodic-native'});
  const accessibility=U.button('Acessibilidade',()=>{prefs.hidden=!prefs.hidden;accessibility.setAttribute('aria-expanded',String(!prefs.hidden));if(!prefs.hidden&&!preferenceCleanup)preferenceCleanup=SimCore.accessibility.renderControls(prefs,{prefix:'presentation-'});table.resize();},scope,{id:'periodic-accessibility'});accessibility.setAttribute('aria-expanded','false');
  const back=U.button('Voltar ao Professor',()=>close(),scope,{id:'periodic-exit'});toolbar.append(expand,native,accessibility,back);
  table=SILM.createPeriodicTable(body,{scope,state,teacher:true,toolbar,canInvestigate,onInvestigate:async e=>{if(!canInvestigate())return;await close({restoreFocus:false});await onInvestigate(e);},onSources:e=>{sourcesBox.hidden=false;sourcesBox.replaceChildren();const closeSources=U.button('Fechar fontes',()=>{sourcesBox.hidden=true;table.root.querySelector('[id$="-sources"]').focus();},scope);sourcesBox.append(closeSources);onSources(e,sourcesBox);closeSources.focus();}});
  const contextual=U.element('p','','sr-only');contextual.setAttribute('role','status');body.append(contextual);
  handle=ctx.modal.open({title:'Tabela Periódica · Área do Professor',content:body,size:'wide'});handle.element.classList.add('silm-presentation');handle.element.setAttribute('aria-labelledby',table.title.id);
  const announceFallback=message=>{contextual.textContent=message;native.title=message;};
  function sync(){handle.element.classList.toggle('is-expanded',expandedMode);expand.hidden=expandedMode;native.hidden=!expandedMode||document.fullscreenElement===handle.element;back.textContent=expandedMode?'Sair da apresentação':'Voltar ao Professor';if(expandedMode&&!SimCore.shell.projector)SimCore.shell.setProjector(true);table.resize();}
  async function close({restoreFocus=true}={}){if(closing)return;closing=true;try{if(document.fullscreenElement===handle.element&&typeof document.exitFullscreen==='function')await document.exitFullscreen();}catch(_){}handle.close();await handle.result;if(restoreFocus&&focusOrigin?.isConnected&&!focusOrigin.closest('[inert],[hidden]'))focusOrigin.focus({preventScroll:true});}
  scope.listen(document,'fullscreenchange',()=>{if(document.fullscreenElement===handle.element){wasNative=true;sync();}else if(wasNative&&!closing){close();}});
  scope.listen(handle.element,'cancel',e=>{e.preventDefault();close();});
  const release=ctx.scope.cleanup(()=>{closing=true;preferenceCleanup?.();if(document.fullscreenElement===handle.element)document.exitFullscreen?.().catch(()=>{});handle.close();scope.destroy();if(ctx.scope.active)SimCore.shell.setProjector(previousProjector);current=null;});
  handle.result.then(()=>{release();SimCore.notifications.announce('Modo de apresentação encerrado.');});
  current={close,state};sync();table.title.focus({preventScroll:true});contextual.textContent=expandedMode?'Tabela Periódica aberta em modo de apresentação.':'Tabela Periódica aberta para apresentação pedagógica.';
 }
 return {open,state,close:()=>current?.close()};
};
