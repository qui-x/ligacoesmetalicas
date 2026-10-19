'use strict';
/* Produto SILM sobre a Base 0.9.8. A ciência continua no serviço original schema 8. */
(() => {
 const B=BaseDemoSI,S=SILM,$=id=>document.getElementById(id);
 B.manifest=Object.freeze({...B.manifest,id:'silm-base-integration',name:'SILM',shortName:'SILM',version:'0.12.0 · integração',
  routes:B.manifest.routes.map(route=>({...route,subtitle:route.id==='ambiente'?'A Arquitetura dos Metais':route.title}))});
 const model=S.createScientificState();let view=null,scope=null,viewKey='',pending=false,ready=false,selected=null,focusAfterRender=null;
 let representation=S.representation.defaults(null),storageOK=true,unavailable3D=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('si-no-motion')||document.documentElement.classList.contains('si-simple-reading')||B.currentRoute(location.hash)!=='ambiente';
 const say=(text,kind='info')=>{SimCore.notifications.announce(text);B.notify(text,kind);};
 const storage={
  get(key,fallback){try{const raw=B.storage.read(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}},
  set(key,value){storageOK=B.storage.write(key,JSON.stringify(value));if(ready)storageStatus();return storageOK;}
 };
 function storageStatus(){if($('silm-storage-status'))$('silm-storage-status').textContent=storageOK?'Investigação salva neste navegador, separada do SILM completo.':'Não foi possível salvar. Exporte a investigação antes de fechar.';}
 function schedule(){if(!ready||pending)return;pending=true;queueMicrotask(()=>{pending=false;render();});}
 model.connect({storage,emit(name){if(name==='investigation:updated')schedule();}});
 const report=r=>{if(r?.ok===false)say(S.crystal.reasons[r.reason]||'Esta operação não está disponível no contexto atual.','warning');schedule();return r;};
 function element(){return model.state.metal?S.data.get(model.state.metal.atomicNumber):null;}
 const rep={
  projection:()=>representation.projection,
  viewMode:()=>representation.viewMode,
  available3D:()=>!unavailable3D,
  camera3D:()=>({...representation.camera3D}),
  setViewMode(mode,{projection=null}={}){
   if(!S.representation.VIEW_MODES.includes(mode)||(mode==='3d'&&unavailable3D))return;
   if(projection&&S.representation.PROJECTIONS.includes(projection))representation.projection=projection;
   focusAfterRender=document.activeElement?.id||null;representation.viewMode=mode;saveView();schedule();
  },
  setCamera3D(patch,{silent=false}={}){representation.camera3D=S.representation.sanitizeCamera3D({...representation.camera3D,...patch});saveView();if(!silent)view?.update();},
  fail3D(){if(unavailable3D)return;unavailable3D=true;representation.viewMode='2d';saveView();schedule();say('A vista 3D não está disponível. A vista 2D continua com a mesma investigação.','warning');},
  setProjection(value){if(!S.representation.PROJECTIONS.includes(value))return;representation.projection=value;saveView();view?.update();},
  camera:mode=>representation.cameras[mode],
  saveCamera(mode,value){representation.cameras[mode]=S.representation.sanitizeCamera(value);saveView();}
 };
 function saveView(){storage.set('representation.view',representation);}
 const run={
  add(){if(!model.state.structure)model.beginAssembly();return report(model.addUnit());},
  move:(id,target,options)=>report(model.moveUnit(id,target,options)),
  undo:()=>report(model.undo()),
  organize:()=>report(model.organize()),
  represent:value=>model.setCrystalRepresentation(value),
  select:id=>model.setCrystalRepresentation({selectedUnitId:id}),
  toggleNeighbors(){const r=model.state.structure?.crystallography?.representation;if(r)model.setCrystalRepresentation({neighbors:!r.neighbors});}
 };
 function renderScene(){
  const state=model.state,e=element(),key=e?state.investigation.id+':'+e.atomicNumber+':'+(state.structure?.mode||'empty')+':'+(state.structure?.mode==='crystalline'?representation.viewMode:'2d'):'none';
  if(viewKey!==key){scope?.destroy();scope=null;view=null;viewKey=key;$('silm-integration-scene').replaceChildren();
   if(!e){const p=document.createElement('p');p.textContent='Abra Montagem e escolha um metal para iniciar a investigação.';$('silm-integration-scene').append(p);}
   else if(!state.structure){const p=document.createElement('p');p.textContent='Use Adicionar unidade em Montagem para começar a estrutura de '+e.name+'.';$('silm-integration-scene').append(p);}
   else if(state.structure){
    scope=SimCore.createScope();const common={scope,model,element:e,actions:run,reducedMotion:reduced,representation:rep};
    if(state.structure.mode==='crystalline')view=S.createCrystalView($('silm-integration-scene'),{...common,geometry:S.crystal.geometry(e)});
    else view=S.createAssemblyView($('silm-integration-scene'),{...common,editable:true,organize:{run:run.organize,state:()=>{
     const eligibility=S.crystal.eligibility(e);return {disabled:!model.state.structure?.units.length||eligibility.status!=='available',reason:eligibility.status!=='available'?eligibility.message:''};
    }}});
    // Contextual help uses the Base route, whose router deliberately has no nested routes.
    for(const a of view.root.querySelectorAll('a.ajuda-link'))a.href='#/manual';
   }
  }else view?.update();
 }
 function text(id,value){if($(id))$(id).textContent=value;}
 function render(){
  const state=model.state,e=element(),s=state.structure,n=s?.units.length||0;
  if(representation.investigationId!==(state.investigation?.id??null))representation=S.representation.defaults(state.investigation?.id??null);
  renderScene();if(focusAfterRender){$(focusAfterRender)?.focus({preventScroll:true});focusAfterRender=null;}
  text('silm-summary',e?e.name+' · '+n+' unidades · '+(s?.mode==='crystalline'?'estrutura cristalina':'montagem livre'):'Nenhuma investigação iniciada.');
  text('scene-count',n+' unidades');text('silm-metal-information',selected?S.data.get(Number(selected)).name:'');
  $('scene-undo').disabled=!model.canUndo;$('scene-clear').disabled=!n;
  $('si-compact-clear').disabled=!n;$('scene-count').dataset.compactCount=n+' unidades';
  $('silm-add').disabled=!e||s?.mode==='crystalline';$('silm-organize').disabled=!n||s?.mode==='crystalline'||S.crystal.eligibility(e).status!=='available';
  $('silm-free').hidden=s?.mode!=='crystalline';$('silm-export').disabled=!e;
  $('silm-electrons').disabled=n<2;
  const visible=!!state.electrons?.representation.visible;
  text('silm-electrons',visible?'Ocultar elétrons':'Mostrar elétrons');$('silm-electrons').setAttribute('aria-pressed',String(visible));
  const data=$('silm-data');data.replaceChildren();
  if(e){
   const dl=document.createElement('dl');
   const structure=S.data.structure(e);
   const rows=[['Metal',e.name+' ('+e.symbol+')'],['Estrutura de referência',structure?.type||'Não disponível'],['Unidades',String(n)],['Massa molar',e.atomicWeight.value+' '+(e.atomicWeight.unit||'g/mol')],['Medições preservadas',String(state.measurements.length)],['Cálculos preservados',String(state.calculations.length)]];
   for(const [label,value]of rows){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;dl.append(dt,dd);}data.append(dl);
   const sources=document.createElement('p');sources.className='silm-provenance';sources.textContent='Dados tabelados. Fontes do elemento: '+S.data.sourceIds(e).join(', ')+'.';data.append(sources);
  }else data.textContent='Inicie uma investigação para consultar os dados do metal.';
  const list=$('scene-overview-items');list.replaceChildren();
  for(const [index,u]of (s?.units||[]).entries()){
   const b=document.createElement('button');b.type='button';b.className='si-overview-item';b.textContent=e.symbol+' · unidade '+(index+1);
   b.addEventListener('click',()=>{document.querySelector('[data-scene-view="focus"]').click();if(s.mode==='crystalline')run.select(u.id);view?.focusUnit(u.id);});list.append(b);
  }
  if(!n)list.textContent='Ainda não há unidades nesta investigação.';
  storageStatus();
 }
 async function start(){
  const z=Number($('silm-metal').value);
  if(model.state.investigation){const accepted=await B.confirmDialog({title:'Iniciar outra investigação?',description:'A investigação atual será substituída neste ambiente. Exporte-a em Dados se desejar guardá-la.',confirmText:'Iniciar',cancelText:'Cancelar'});if(!accepted)return;}
  if(model.begin(z)){model.beginAssembly();say('Investigação iniciada com '+S.data.get(z).name+'.','success');}
 }
 async function clear(){
  if(!model.state.structure?.units.length)return;
  if(await B.confirmDialog({title:'Limpar estrutura?',description:'A estrutura será removida. O metal, as medições e os cálculos registrados serão preservados. Esta limpeza não pode ser desfeita.',confirmText:'Limpar estrutura',destructive:true})){
   model.clearStructure();model.beginAssembly();say('Estrutura limpa. Metal e registros preservados.');
  }
 }
 function exportState(){
  const blob=new Blob([JSON.stringify({format:'silm-scientific-investigation',version:1,scientificState:model.snapshot()},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='SILM-investigacao-'+model.state.metal.symbol+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 async function importState(event){
  const input=event.target,file=input.files[0];if(!file)return;
  try{
   if(file.size>5*1024*1024)throw new Error('O arquivo excede 5 MB.');
   const value=JSON.parse(await file.text()),candidate=value.scientificState??value;
   const checked=S.validateScientificState(candidate);if(!checked.ok)throw new Error('Investigação inválida ou incompatível: '+checked.reason);
   if(!checked.value.investigation)throw new Error('O arquivo não contém uma investigação ativa.');
   if(model.state.investigation&&!await B.confirmDialog({title:'Abrir investigação?',description:'O arquivo substituirá a investigação deste ambiente. A sessão do SILM completo não será alterada.',confirmText:'Abrir'}))return;
   const r=model.restore(checked.value,{allowLegacy:false});if(!r.ok)throw new Error('Não foi possível abrir a investigação.');
   selected=String(model.state.metal.atomicNumber);$('silm-metal').value=selected;
   say('Investigação aberta com dados e proveniência preservados.','success');
  }catch(error){say(error.message,'error');}finally{input.value='';}
 }
 function boot(){
  const live=document.createElement('p');live.id='silm-announcement';live.className='sr-only';live.setAttribute('role','status');live.setAttribute('aria-live','polite');document.body.append(live);
  // Only the new Base shell initializes. Demo scene, generic engine and demo extension never start.
  B.setupPreferences();B.setupComponents();B.selectModule('explorar');
  B.setupWorkspace(()=>({schemaVersion:1,entities:[],selectedId:null}),()=>{});
  B.setupNavigationDrawer();B.setupMenuReview();B.updateRoute();window.addEventListener('hashchange',B.updateRoute);
  const selector=$('silm-metal');
  for(const e of S.data.elements.filter(e=>e.silmEligibility.status==='available')){const o=document.createElement('option');o.value=e.atomicNumber;o.textContent=e.symbol+' — '+e.name;selector.append(o);}
  selected='29';selector.value=selected;selector.addEventListener('change',()=>{selected=selector.value;render();});
  const raw=B.storage.read('scientific.state');
  if(raw!==null){try{const value=JSON.parse(raw),check=S.validateScientificState(value);if(!check.ok)throw new Error();model.restore(check.value,{allowLegacy:false});if(model.state.metal){selected=String(model.state.metal.atomicNumber);selector.value=selected;}}catch{storageOK=false;say('A investigação salva é inválida. O arquivo original foi preservado; nenhuma restauração foi aplicada.','warning');}}
  representation=S.representation.sanitize(storage.get('representation.view',null),model.state.investigation?.id??null);
  $('silm-start').addEventListener('click',start);$('silm-add').addEventListener('click',run.add);$('silm-organize').addEventListener('click',run.organize);
  $('silm-free').addEventListener('click',()=>report(model.restoreFree()));
  $('scene-undo').addEventListener('click',run.undo);$('scene-clear').addEventListener('click',clear);
  B.setupActionMenu('scene-menu-toggle','scene-tools-menu',action=>{if(action==='clear')return clear();if(action==='help')location.hash='#/manual';});
  $('silm-electrons').addEventListener('click',()=>{
   if(model.state.electrons)model.setElectronRepresentation({visible:!model.state.electrons.representation.visible});else report(model.activateElectrons());
  });
  $('silm-export').addEventListener('click',exportState);$('silm-import').addEventListener('change',importState);
  window.addEventListener('si-route-changed',()=>{view?.update();});
  const appearance=new MutationObserver(()=>view?.update());appearance.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',event=>{if(!(event.ctrlKey||event.metaKey)||event.altKey||event.shiftKey||event.key.toLowerCase()!=='z'||B.isPlatformDialogOpen()||B.currentRoute(location.hash)!=='ambiente'||event.target.closest('input,select,textarea,[contenteditable]'))return;event.preventDefault();run.undo();});
  ready=true;render();
  // Read-only inspection facade: tests and debugging cannot mutate the authoritative state directly.
  window.SILMIntegration=Object.freeze({snapshot:()=>model.snapshot(),baseVersion:'0.9.8'});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
