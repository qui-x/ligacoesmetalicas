'use strict';
/* Produto SILM sobre a Base SI 0.9.17. O domínio científico SILM permanece no schema 8. */
(() => {
 const B=BaseDemoSI,S=SILM,$=id=>document.getElementById(id);
 B.manifest=Object.freeze({...B.manifest,id:'silm-base-integration',name:'SILM',shortName:'SILM',version:'0.15.5',
  routes:B.manifest.routes.filter(route=>['inicio','ambiente','manual','configuracoes','sobre','roteiros','relatorios','aprender','missoes','caderno','professor'].includes(route.id)).map(route=>({...route,subtitle:route.id==='ambiente'?'Oficina dos Metais':route.title}))});
 // A cena cristalina também usa data-view; o roteamento só pode atingir páginas do produto.
 B.updateRoute=()=>{
  if(location.hash.startsWith('#/manual/')){location.replace('#/manual?topico='+encodeURIComponent(location.hash.slice(9)));return;}
  const selected=B.currentRoute(location.hash);
  if(!B.manifest.routes.some(r=>r.id===selected)){location.replace('#/inicio');return;}
  for(const page of document.querySelectorAll('#conteudo > [data-view]'))page.hidden=page.dataset.view!==selected;
  for(const link of document.querySelectorAll('a[data-route]')){if(link.dataset.route===selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
  const route=B.manifest.routes.find(r=>r.id===selected);document.title=route.title+' · SILM';$('current-section').textContent=route.subtitle;
  document.body.classList.toggle('route-ambiente',selected==='ambiente');document.body.dataset.silmRoute=selected;window.dispatchEvent(new CustomEvent('si-route-changed',{detail:selected}));B.closeNavigationDrawer(false);
  // Como no SIAB: na primeira abertura o foco fica no início do documento (o link "Ir para o conteúdo" é o primeiro Tab);
  // ao trocar de tela, a página volta ao topo e o foco vai para o título da nova tela.
  const previous=lastRoute;lastRoute=selected;if(previous===null)return;
  if(previous!==selected)window.scrollTo(0,0);
  requestAnimationFrame(()=>{const page=document.querySelector('#conteudo > [data-view="'+selected+'"]');if(!page||page.contains(document.activeElement))return;const heading=[...page.querySelectorAll('h1,h2')].find(h=>h.getClientRects().length);if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}});
 };
 let lastRoute=null;
 let view=null,scope=null,viewKey='',pending=false,ready=false,selected=null,focusAfterRender=null;
 let routeUI=null;
 const allows=tool=>!routeUI||routeUI.session.allows(tool);
 let representation=S.representation.defaults(null),invalidSavedState=false,unavailable3D=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('si-no-motion')||document.documentElement.classList.contains('si-simple-reading')||B.currentRoute(location.hash)!=='ambiente';
 const say=(text,kind='info')=>{SimCore.notifications.announce(text);B.notify(text,kind);};
 const storage=S.createDurableStorage({backend:{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),key:i=>localStorage.key(i),get length(){return localStorage.length;}},onStatus(){if(ready)storageStatus();},onConflict(){queueMicrotask(()=>{
  if($('si-storage-conflict'))return;
  const overlay=document.createElement('div');overlay.id='si-storage-conflict';overlay.setAttribute('role','alertdialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','silm-conflict-title');
  const panel=document.createElement('div');panel.className='si-storage-conflict-panel';const title=document.createElement('h2');title.id='silm-conflict-title';title.textContent='Os dados desta aba precisam ser recarregados';
  const text=document.createElement('p');text.textContent='Foi detectada outra versão dos documentos salvos. A edição foi bloqueada para preservar a investigação e os relatórios.';
  const reload=document.createElement('button');reload.textContent='Recarregar dados';reload.onclick=()=>location.reload();panel.append(title,text,reload);overlay.append(panel);document.body.append(overlay);document.querySelector('.app-shell').inert=true;reload.focus();
 });}});
 B.storage={...B.storage,read:storage.read,write:storage.write};
 const model=S.protectScientificModel(S.createScientificState(),storage,{onFailure:()=>say('Não foi possível salvar a alteração. O estado anterior foi preservado.','warning')});
 function storageStatus(){const status=storage.status();if($('silm-storage-status'))$('silm-storage-status').textContent=status.conflict?'Edição bloqueada. Recarregue os dados antes de continuar.':status.ok&&!invalidSavedState?'Investigação salva neste navegador. Exporte em JSON para guardar uma cópia.':'Não foi possível salvar todos os documentos. Estado anterior preservado. Documentos: '+(status.documents.join(', ')||'investigação inválida')+'.';}
 function schedule(){if(!ready||pending)return;pending=true;queueMicrotask(()=>{pending=false;render();});}
 model.connect({storage,emit(name,detail){if(name==='investigation:updated'){if(detail?.change!=='storage:rollback'&&routeUI?.session.open()&&!routeUI.session.inTransition)routeUI.session.observe(false);schedule();}}});
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
 function saveView(){return storage.set('representation.view',representation);}
 const comparison=S.createStructureComparison({storage,host:$('silm-comparison-items')});
 const tools=S.createIntegrationTools({model,host:$('silm-tools'),moduleHost:$('silm-module-choice'),history:$('silm-history'),onChange:schedule,say,onModule:m=>B.selectModule(m),activity:()=>routeUI?.session});
 const workspaceFamily=S.createWorkspaceFamily({model,activity:()=>routeUI?.session});
 const prepareMetal=z=>{if(routeUI?.session.open()||S.data.get(z)?.silmEligibility.status!=='available')return false;$('silm-metal').value=String(z);selected=String(z);schedule();return true;};
 const experience=S.createMetallicExperience({model,say,schedule,reduced,allows,prepareMetal,selectMetal:async z=>{$('silm-metal').value=String(z);selected=String(z);return await start();}});
 routeUI=S.createRouteUI({model,storage,prepareMetal,view:()=>representation,onView:(value,{persist=true}={})=>{representation=S.representation.sanitize(value,model.state.investigation?.id??null);return persist?saveView():true;},schedule,say,onModule:m=>B.selectModule(m),selectMetal:async z=>{$('silm-metal').value=String(z);selected=String(z);return await start();}});
 const run={
  add(){if(routeUI.session.open()&&!routeUI.canBuild())return;if(!model.state.structure)model.beginAssembly();return report(model.addUnit());},
  move:(id,target,options)=>(!routeUI.session.open()||routeUI.canBuild())&&report(model.moveUnit(id,target,options)),
  undo:()=>(!routeUI.session.open()||routeUI.canBuild())&&model.state.module.active==='explorar'&&report(model.undo()),
  organize:()=>(!routeUI.session.open()||routeUI.canBuild())&&report(model.organize()),
  represent:value=>model.setCrystalRepresentation(value),
  select:id=>model.setCrystalRepresentation({selectedUnitId:id}),
  toggleNeighbors(){if(!allows('neighbors'))return;const r=model.state.structure?.crystallography?.representation;if(r)model.setCrystalRepresentation({neighbors:!r.neighbors});}
 };
 function placeExpansionButton(inCameraBar){
  const button=$('si-expand-structure'),toolbar=document.querySelector('.si-workspace-toolbar'),bar=$('silm-camera-bar');
  if(!button||!toolbar)return;
  if(inCameraBar&&bar){
   button.classList.remove('si-tab');button.classList.add('secondary-btn','silm-camera-btn','si-structure-expand-in-camera');
   bar.classList.add('silm-camera-bar-has-expand');bar.append(button);
  }else{
   button.closest('.silm-camera-bar')?.classList.remove('silm-camera-bar-has-expand');
   button.classList.remove('secondary-btn','silm-camera-btn','si-structure-expand-in-camera');button.classList.add('si-tab');
   if(button.parentElement!==toolbar)toolbar.append(button);
  }
 }
 /* Estado vazio no padrão do SIAB ("Bancada vazia"): ilustração, título, o que fazer e ações que funcionam. */
 function emptyState({title,text,actions}){
  const box=document.createElement('div');box.className='si-empty-state';box.setAttribute('role','region');box.setAttribute('aria-label',title);
  box.insertAdjacentHTML('afterbegin','<svg class="si-empty-art" viewBox="0 0 120 96" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M30 30h44v44H30Z"/><path d="M50 14h44v44H50Z" stroke-dasharray="5 5"/><path d="m30 30 20-16M74 30l20-16M74 74l20-16M30 74l20-16" stroke-dasharray="5 5"/><circle cx="30" cy="30" r="5"/><circle cx="74" cy="30" r="5"/><circle cx="30" cy="74" r="5"/><circle cx="74" cy="74" r="5"/><circle cx="52" cy="52" r="5" class="si-empty-accent"/></svg>');
  const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');
  text.forEach((part,i)=>{if(i%2){const b=document.createElement('strong');b.textContent=part;p.append(b);}else p.append(part);});
  const row=document.createElement('div');row.className='si-empty-actions';
  for(const [label,fn,kind] of actions){const b=document.createElement('button');b.type='button';b.className='button '+(kind==='primary'?'primary':'outline');b.textContent=label;b.addEventListener('click',fn);row.append(b);}
  box.append(h,p,row);$('silm-integration-scene').append(box);
 }
 function openLeft(tab){const open=document.querySelector('[data-open-dock="montagem"]');if(open&&open.getAttribute('aria-expanded')!=='true')open.click();requestAnimationFrame(()=>document.querySelector('[data-left-tab="'+tab+'"]:not([hidden])')?.click());}
 function renderScene(){
  const state=model.state,e=element(),key=e?state.investigation.id+':'+e.atomicNumber+':'+state.module.active+':'+(state.structure?.mode||'empty')+':'+(state.structure?.mode==='crystalline'?representation.viewMode:'2d'):'none';
  if(viewKey!==key){placeExpansionButton(false);scope?.destroy();scope=null;view=null;viewKey=key;$('silm-integration-scene').replaceChildren();
   if(!e)emptyState({title:'Oficina vazia',text:['Abra ','Montagem → Preparo',' para escolher um metal. Depois adicione unidades e organize a estrutura.'],actions:[['Abrir Montagem',()=>openLeft('preparo'),'primary'],['Começar com o cobre',async()=>{$('silm-metal').value='29';selected='29';await start();}],['Tabela periódica',()=>$('silm-open-periodic').click()]]});
   else if(!state.structure)emptyState({title:'Estrutura de '+e.name+' vazia',text:state.module.active==='explorar'?['Use ','Adicionar unidade',' para montar a estrutura de '+e.name+'. Depois organize segundo a estrutura de referência.']:['A estrutura ainda não foi montada. Volte ao módulo ','Explorar',' para adicionar unidades.'],actions:state.module.active==='explorar'&&(!routeUI.session.open()||routeUI.canBuild())?[['Adicionar unidade',()=>run.add(),'primary'],['Abrir Montagem',()=>openLeft('objetos')]]:[['Abrir Montagem',()=>openLeft('modulo'),'primary']]});
   else if(state.structure){
    scope=SimCore.createScope();const common={scope,model,element:e,actions:run,reducedMotion:reduced,representation:rep,moduleTitle:{explorar:'Explorar',medir:'Medir',calcular:'Calcular'}[state.module.active],measure:tools.measure,calc:tools.calc,properties:experience.scene};
    if(state.structure.mode==='crystalline')view=S.createCrystalView($('silm-integration-scene'),{...common,geometry:S.crystal.geometry(e)});
    else view=S.createAssemblyView($('silm-integration-scene'),{...common,editable:state.module.active==='explorar'&&(!routeUI.session.open()||routeUI.canBuild()),organize:{run:run.organize,state:()=>{
     const eligibility=S.crystal.eligibility(e);return {disabled:!model.state.structure?.units.length||eligibility.status!=='available',reason:eligibility.status!=='available'?eligibility.message:''};
    }}});
    // Contextual help uses the Base route, whose router deliberately has no nested routes.
    for(const link of view.root.querySelectorAll('a.ajuda-link'))link.href='#/manual';
    placeExpansionButton(state.structure?.mode==='crystalline'&&!!state.structure.units?.length);
   }
  }else{view?.update();placeExpansionButton(state.structure?.mode==='crystalline'&&!!state.structure.units?.length);}
 }
 let previousExpandFocus=null;
 function syncExpansionButton(expanded){
  const button=$('si-expand-structure'),label=button?.querySelector('span'),path=button?.querySelector('svg path');
  if(!button)return;
  if(label)label.textContent=expanded?'Recolher':'Expandir';
  if(path)path.setAttribute('d',expanded?'M8 8H3V3M16 8h5V3M3 16h5v5M21 16h-5v5':'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3');
  button.setAttribute('aria-pressed',String(expanded));
  button.setAttribute('aria-label',expanded?'Recolher visualização expandida da estrutura':'Expandir estrutura metálica configurada');
  button.title=expanded?'Recolher estrutura (Escape)':'Expandir a estrutura cristalina configurada';
 }
 function setStageExpanded(expanded,{restoreFocus=true}={}){
  const stage=$('si-stage'),button=$('si-expand-structure');
  if(!stage||!button)return;
  if(stage.classList.contains('si-scene-expanded')===expanded)return;
  if(expanded){
   const current=model.state.structure;
   if(current?.mode!=='crystalline'||!current.units?.length){say('Organize a estrutura cristalina antes de expandir a visualização.','info');return;}
   if(B.currentRoute(location.hash)!=='ambiente')return;
   previousExpandFocus=document.activeElement;
   if(document.querySelector('#workspace-overview:not([hidden])'))document.querySelector('[data-scene-view="focus"]')?.click();
   for(const id of ['si-dock-left','si-dock-right']){
    const dock=$(id);if(dock&&!dock.hidden)dock.querySelector('[data-close-dock]')?.click();
   }
   stage.classList.add('si-scene-expanded');document.body.classList.add('si-structure-expanded');
   syncExpansionButton(true);
   requestAnimationFrame(()=>{view?.update();if(restoreFocus)button.focus({preventScroll:true});});
  }else{
   stage.classList.remove('si-scene-expanded');document.body.classList.remove('si-structure-expanded');
   syncExpansionButton(false);
   requestAnimationFrame(()=>{
    view?.update();
    if(!restoreFocus)return;
    const target=B.currentRoute(location.hash)==='ambiente'?button:previousExpandFocus;
    if(target?.isConnected&&!target.closest('[hidden]'))target.focus({preventScroll:true});
    previousExpandFocus=null;
   });
  }
 }

 function text(id,value){if($(id))$(id).textContent=value;}
 function render(){
  const focused=document.activeElement,restoreControl=focused?.closest('#silm-tools,#silm-module-choice,#silm-history')?focused.id:null;
  const state=model.state,e=element(),s=state.structure,n=s?.units.length||0;
  const tag=$('si-module-tag');if(tag){const c=routeUI.session.context();tag.textContent=(c?(c.type==='mission'?'Missão':'Roteiro'):'Módulo')+' · '+({explorar:'Explorar',medir:'Medir',calcular:'Calcular'})[state.module.active];}
  const expandButton=$('si-expand-structure'),expandable=!!(e&&s?.mode==='crystalline'&&n>0);
  expandButton.disabled=!expandable;
  expandButton.title=$('si-stage').classList.contains('si-scene-expanded')?'Recolher estrutura (Escape)':expandable?'Expandir a estrutura cristalina configurada':'Organize uma estrutura cristalina para habilitar a visualização expandida.';
  if(!expandable&&$('si-stage').classList.contains('si-scene-expanded'))setStageExpanded(false);
  if(representation.investigationId!==(state.investigation?.id??null))representation=S.representation.defaults(state.investigation?.id??null);
  tools.render();experience.update();renderScene();if(focusAfterRender){$(focusAfterRender)?.focus({preventScroll:true});focusAfterRender=null;}
  text('silm-summary',e?e.name+' · '+n+' unidades · '+(s?.mode==='crystalline'?'estrutura cristalina':'montagem livre'):'Nenhuma investigação iniciada.');
  text('scene-count',n+' unidades');text('silm-metal-information',selected?S.data.get(Number(selected)).name:'');
  $('scene-undo').disabled=state.module.active!=='explorar'||!model.canUndo;$('scene-clear').disabled=state.module.active!=='explorar'||!n;
  $('si-compact-clear').disabled=state.module.active!=='explorar'||!n;$('scene-count').dataset.compactCount=n+' unidades';
  $('silm-add').disabled=state.module.active!=='explorar'||!e||s?.mode==='crystalline';$('silm-organize').disabled=state.module.active!=='explorar'||!n||s?.mode==='crystalline'||S.crystal.eligibility(e).status!=='available';
  $('silm-free').hidden=s?.mode!=='crystalline';$('silm-free').disabled=state.module.active!=='explorar';$('silm-export').disabled=!e;
  $('silm-electrons').disabled=n<2;
  const visible=!!state.electrons?.representation.visible;
  $('silm-motion').disabled=!visible||reduced();$('silm-motion').setAttribute('aria-pressed',String(visible&&!!state.electrons?.representation.motion&&!reduced()));
  text('silm-electrons',visible?'Ocultar elétrons':'Mostrar elétrons');$('silm-electrons').setAttribute('aria-pressed',String(visible));
  $('silm-export-legacy').hidden=!legacyState();
  const data=$('silm-data');data.replaceChildren();
  if(e){
   S.renderIntegrationMetalData(data,e,state);
  }else data.textContent='Inicie uma investigação para consultar os dados do metal.';
  comparison.update(state);
  routeUI.render();workspaceFamily.update();storageStatus();
  const replacement=restoreControl?$(restoreControl):null;if(focused&&!focused.isConnected&&replacement?.getClientRects().length)replacement.focus({preventScroll:true});
 }
 async function start(){
  if(routeUI.session.open())return;
  const z=Number($('silm-metal').value);
  if(model.state.investigation){const accepted=await B.confirmDialog({title:'Iniciar outra investigação?',description:'A investigação atual será substituída neste ambiente. Exporte-a em Dados se desejar guardá-la.',confirmText:'Iniciar',cancelText:'Cancelar'});if(!accepted)return;}
  if(model.begin(z)){model.beginAssembly();say('Investigação iniciada com '+S.data.get(z).name+'.','success');return true;}return false;
 }
 async function clear(){
  if(routeUI.session.open()&&!routeUI.canBuild())return;
  if(!model.state.structure?.units.length)return;
  if(await B.confirmDialog({title:'Limpar estrutura?',description:'A estrutura será removida. O metal, as medições e os cálculos registrados serão preservados. Esta limpeza não pode ser desfeita.',confirmText:'Limpar estrutura',destructive:true})){
   model.clearStructure();model.beginAssembly();say('Estrutura limpa. Metal e registros preservados.');
  }
 }
 function legacyState(){try{const raw=localStorage.getItem('simcore_domain_silm_v1_scientific.state');if(!raw)return null;const r=S.validateScientificState(JSON.parse(raw));return r.ok&&r.value.investigation?r.value:null;}catch{return null;}}
 function exportState(){downloadState(model.snapshot());}
 function downloadState(snapshot){
  const blob=new Blob([JSON.stringify({format:'silm-scientific-investigation',version:1,scientificState:snapshot},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='SILM-investigacao-'+snapshot.metal.symbol+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 async function importState(event){
  if(routeUI.session.open()){event.target.value='';return;}
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
  B.setupStorageConflictProtection();B.setupPreferences();B.setupComponents();B.selectModule('explorar');
  B.setupWorkspace(()=>({schemaVersion:1,entities:[],selectedId:null}),()=>{});
  B.setupNavigationDrawer();B.setupMenuReview();B.updateRoute();window.addEventListener('hashchange',B.updateRoute);
  const selector=$('silm-metal');
  for(const e of S.data.elements.filter(e=>e.silmEligibility.status==='available')){const o=document.createElement('option');o.value=e.atomicNumber;o.textContent=e.symbol+' — '+e.name;selector.append(o);}
  selected='29';selector.value=selected;selector.addEventListener('change',()=>{selected=selector.value;render();});
  let raw=B.storage.read('scientific.state');
  // Copia somente uma sessão antiga válida quando a nova interface ainda está vazia.
  if(raw===null){try{const legacy=localStorage.getItem('simcore_domain_silm_v1_scientific.state');
   if(legacy){const checked=S.validateScientificState(JSON.parse(legacy));if(checked.ok&&checked.value.investigation){raw=JSON.stringify(checked.value);B.storage.write('scientific.state',raw);}}
  }catch{/* O original permanece intacto; exportação/importação continua disponível. */}}

  if(raw!==null){try{const value=JSON.parse(raw),check=S.validateScientificState(value);if(!check.ok)throw new Error();model.restore(check.value,{allowLegacy:false});if(model.state.metal){selected=String(model.state.metal.atomicNumber);selector.value=selected;}}catch{invalidSavedState=true;say('A investigação salva é inválida. O arquivo original foi preservado; nenhuma restauração foi aplicada.','warning');}}
  representation=S.representation.sanitize(storage.get('representation.view',null),model.state.investigation?.id??null);
  $('si-expand-structure').addEventListener('click',()=>setStageExpanded(!$('si-stage').classList.contains('si-scene-expanded')));
  document.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&$('si-stage').classList.contains('si-scene-expanded')){
    event.preventDefault();event.stopImmediatePropagation();setStageExpanded(false);
   }
  },true);
  $('silm-start').addEventListener('click',start);$('silm-add').addEventListener('click',run.add);$('silm-organize').addEventListener('click',run.organize);
  $('silm-free').addEventListener('click',()=>(!routeUI.session.open()||routeUI.canBuild())&&report(model.restoreFree()));
  $('scene-undo').addEventListener('click',run.undo);$('scene-clear').addEventListener('click',clear);
  B.setupActionMenu('scene-menu-toggle','scene-tools-menu',action=>{if(action==='clear')return clear();if(action==='help')location.hash='#/manual';});
  $('silm-electrons').addEventListener('click',()=>{
   if(model.state.electrons)model.setElectronRepresentation({visible:!model.state.electrons.representation.visible});else report(model.activateElectrons());
  });
  $('silm-motion').addEventListener('click',()=>{if(model.state.electrons)model.setElectronRepresentation({motion:!model.state.electrons.representation.motion});});
  $('silm-export-legacy').addEventListener('click',()=>{const value=legacyState();if(value&&!routeUI.session.open())downloadState(value);});
  $('silm-export').addEventListener('click',exportState);$('silm-import').addEventListener('change',importState);
  window.addEventListener('si-route-changed',()=>{if(B.currentRoute(location.hash)!=='ambiente')setStageExpanded(false,{restoreFocus:false});view?.update();});
  const appearance=new MutationObserver(()=>{document.documentElement.dataset.contrast=document.documentElement.classList.contains('si-highcontrast')?'on':'off';view?.update();window.dispatchEvent(new CustomEvent('silm:theme:changed'));});appearance.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',event=>{if(!(event.ctrlKey||event.metaKey)||event.altKey||event.shiftKey||event.key.toLowerCase()!=='z'||B.isPlatformDialogOpen()||B.currentRoute(location.hash)!=='ambiente'||event.target.closest('input,select,textarea,[contenteditable]'))return;event.preventDefault();run.undo();});
  routeUI.init();B.selectModule(model.state.module.active);workspaceFamily.init();ready=true;render();
  // Read-only inspection facade: tests and debugging cannot mutate the authoritative state directly.
  window.SILMIntegration=Object.freeze({snapshot:()=>model.snapshot(),baseVersion:'0.9.17',activity:()=>routeUI.session.snapshot()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
