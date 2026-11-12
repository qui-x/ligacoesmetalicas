'use strict';
/* Produto SILM sobre a Base SI 0.9.17. O domínio científico SILM permanece no schema 8. */
(() => {
 const B=BaseDemoSI,S=SILM,$=id=>document.getElementById(id);
 // Etapa 12 (paridade SIAB): a abertura respeita "Animação de abertura" e "Reduzir animações" do Menu. Este script roda
 // antes da animação oficial, que só começa com <html data-opening> diferente de "off".
 try{const pref=JSON.parse(localStorage.getItem('silm-base-integration:family-menu-v1')||'null');if(pref&&(pref.intro===false||pref.motion===true))document.documentElement.dataset.opening='off';}catch{/* vale o padrão: ligada */}
 // Endereço com que o SILM foi aberto: a tela inicial escolhida só vale para a abertura sem destino, como no SIAB.
 const entryHash=location.hash,specificEntry=!!entryHash&&!['#','#/'].includes(entryHash);
 const startupChoice=()=>{const v=B.storage.read('startup.choice');return v==='inicio'||v==='ambiente'?v:null;};
 B.manifest=Object.freeze({...B.manifest,id:'silm-base-integration',name:'SILM',shortName:'SILM',version:'0.15.10',
  routes:[...B.manifest.routes.filter(route=>['inicio','ambiente','manual','configuracoes','sobre','roteiros','relatorios','aprender','missoes','caderno','professor'].includes(route.id)).map(route=>({...route,subtitle:route.id==='ambiente'?'Oficina dos Metais':route.title})),
   {id:'montagens',title:'Montagens prontas',subtitle:'Montagens prontas'},{id:'atividade',title:'Atividade',subtitle:'Atividade do professor'}]});
 // Etapas 9 e 11: "Montagens prontas" e "Atividade" (link do aluno) são telas do SILM que a lista fixa de rotas da Base não conhece.
 const extraRoutes=new Set(['montagens','atividade']),baseRoute=B.currentRoute;B.currentRoute=hash=>{const slug=String(hash||'').replace(/^#\/?/,'').split(/[?&]/,1)[0];return extraRoutes.has(slug)?slug:baseRoute(hash);};
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
 let workshopSelectionId=null,workshopScale=1;
 let legacyDiscovery=false,showObjectEntry=false,entryTableScope=null,catalogOpener=null,catalogNavigating=false;
 let routeUI=null;
 const allows=tool=>!routeUI||routeUI.session.allows(tool);
 let representation=S.representation.defaults(null),invalidSavedState=false,unavailable3D=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('si-no-motion')||document.documentElement.classList.contains('si-simple-reading')||B.currentRoute(location.hash)!=='ambiente';
 const units=n=>n+(n===1?' unidade':' unidades');
 /* Avisos de um mesmo passo a passo (grupo) substituem o anterior em vez de empilhar: no Medir, "Selecione 2 pontos",
    "Ponto 1 selecionado" e o resultado não cobrem mais os botões da Oficina (sobretudo no celular). */
 const say=(text,kind='info',{group=null}={})=>{SimCore.notifications.announce(text);const rail=$('si-notifications');
  if(group&&rail)for(const old of rail.querySelectorAll('[data-silm-group="'+group+'"]'))old.querySelector('button')?.click();
  B.notify(text,kind);if(group&&rail?.lastElementChild)rail.lastElementChild.dataset.silmGroup=group;};
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
 model.connect({storage,emit(name,detail){if(name==='investigation:updated'){if(detail?.change?.startsWith('properties:')&&!S.reportPropertyHistory.capture(storage,detail.change,detail.previous,detail.current))throw Error('PROPERTY_HISTORY_SAVE_FAILED');if(detail?.change!=='storage:rollback'&&routeUI?.session.open()&&!routeUI.session.inTransition)routeUI.session.observe(false);schedule();}}});
 const report=r=>{if(r?.ok===false)say(S.crystal.reasons[r.reason]||'Esta operação não está disponível no contexto atual.','warning');schedule();return r;};
 function element(){return model.state.metal?S.data.get(model.state.metal.atomicNumber):null;}
 const rep={
  latticeFocus:()=>representation.latticeFocus,
  setLatticeFocus:key=>{representation.latticeFocus=key;saveView();},
  projection:()=>representation.projection,
  viewMode:()=>workshopScale===4?representation.centerViewMode:representation.viewMode,
  available3D:()=>!unavailable3D,
  camera3D:()=>({...representation[workshopScale===4?'centerCamera3D':'camera3D']}),
  setViewMode(mode,{projection=null}={}){
   if(!S.representation.VIEW_MODES.includes(mode)||(mode==='3d'&&unavailable3D))return;
   if(projection&&S.representation.PROJECTIONS.includes(projection))representation.projection=projection;
   focusAfterRender=document.activeElement?.id||null;representation[workshopScale===4?'centerViewMode':'viewMode']=mode;saveView();schedule();
  },
  setCamera3D(patch,{silent=false}={}){
   const key=workshopScale===4?'centerCamera3D':'camera3D';
   representation[key]=S.representation.sanitizeCamera3D({...representation[key],...patch});
   saveView();if(!silent)view?.update();
  },
  fail3D(){if(unavailable3D)return;unavailable3D=true;representation[workshopScale===4?'centerViewMode':'viewMode']='2d';saveView();schedule();say('A vista 3D não está disponível. A vista 2D continua com a mesma investigação.','warning');},
  setProjection(value){if(!S.representation.PROJECTIONS.includes(value))return;representation.projection=value;saveView();view?.update();},
  camera:mode=>representation.cameras[mode],
  saveCamera(mode,value){representation.cameras[mode]=S.representation.sanitizeCamera(value);saveView();}
 };
 function saveView(){return storage.set('representation.view',representation);}
 // Navegar pela Visão geral restaura a investigação salva; não inicia outra nem pede confirmação.
 const showFocus=()=>document.querySelector('[data-scene-view="focus"]')?.click();
 async function openStructure(record){
  if(routeUI?.session.open()){say('Encerre a atividade em curso para navegar entre estruturas salvas.','info');return false;}
  const checked=S.validateScientificState(record?.snapshot);
  if(!checked.ok||checked.value.investigation?.id!==record.id){say('A estrutura salva está inválida ou incompatível.','warning');return false;}
  const activeSnapshot=model.state;
  if(JSON.stringify(activeSnapshot)!==JSON.stringify(checked.value)){
   const restored=model.restore(checked.value,{allowLegacy:false});
   if(!restored.ok){say('Não foi possível restaurar esta estrutura.','warning');return false;}
   selected=String(checked.value.metal.atomicNumber);$('silm-metal').value=selected;
   representation=S.representation.defaults(checked.value.investigation.id);unavailable3D=false;viewKey='';
  }
  showFocus();schedule();say(record.name+' exibida no Foco.','success');return true;
 }
 const comparison=S.createStructureComparison({storage,host:$('silm-comparison-items'),current:()=>model.state.structure?.units?.length?model.state.investigation?.id:null,open:openStructure,newStructure:()=>{showFocus();openLeft('preparo');},say,confirm:options=>B.confirmDialog(options)});
 const tools=S.createIntegrationTools({model,host:$('silm-tools'),moduleHost:$('silm-module-choice'),history:$('silm-history'),onChange:schedule,say,onModule:m=>B.selectModule(m),activity:()=>routeUI?.session});
 const prepareMetal=z=>{if(routeUI?.session.open()||S.data.get(z)?.silmEligibility.status!=='available')return false;legacyDiscovery=true;$('silm-metal').value=String(z);selected=String(z);schedule();return true;};
 const experience=S.createMetallicExperience({model,say,schedule,reduced,allows,prepareMetal,selectMetal:async z=>{$('silm-metal').value=String(z);selected=String(z);return await start();}});
 const workspaceFamily=S.createWorkspaceFamily({model,activity:()=>routeUI?.session,quickActions:experience.quickActions,refreshScene:()=>view?.update()});
 routeUI=S.createRouteUI({model,storage,prepareMetal,view:()=>representation,onView:(value,{persist=true}={})=>{representation=S.representation.sanitize(value,model.state.investigation?.id??null);return persist?saveView():true;},schedule,say,onModule:m=>B.selectModule(m),selectMetal:async z=>{$('silm-metal').value=String(z);selected=String(z);return await start();}});
 const run={
  add(){
   if(routeUI.session.open()&&!routeUI.canBuild())return;
   if(!model.state.structure)model.beginAssembly();
   const result=model.addUnit();
   // Reflita a inclusão no palco imediatamente; não dependa apenas do ciclo global de atualização.
   if(result?.ok){
    const current=view;
    current?.update();
    requestAnimationFrame(()=>{if(view===current&&current?.root?.isConnected)current.update();});
   }
   return report(result);
  },
  move:(id,target,options)=>(!routeUI.session.open()||routeUI.canBuild())&&report(model.moveUnit(id,target,options)),
  undo:()=>(!routeUI.session.open()||routeUI.canBuild())&&model.state.module.active==='explorar'&&report(model.undo()),
  organize:()=>(!routeUI.session.open()||routeUI.canBuild())&&report(model.organize()),
  represent:value=>model.setCrystalRepresentation(value),
  select:id=>model.setCrystalRepresentation({selectedUnitId:id}),
  toggleNeighbors(){if(!allows('neighbors'))return;const r=model.state.structure?.crystallography?.representation;if(r)model.setCrystalRepresentation({neighbors:!r.neighbors});}
 };
 // Celular (≤ 600 px): "Expandir" vai para a faixa de ferramentas da cena; dentro da cena, no canto, cobria um centro.
 const phone=window.matchMedia('(max-width:600px)');let expansionInScene=false;
 function placeExpansionButton(inCameraBar){
  expansionInScene=!!inCameraBar;
  const button=$('si-expand-structure'),toolbar=document.querySelector('.si-workspace-toolbar'),bar=$('silm-camera-bar'),tools=document.querySelector('#silm-integration-scene .silm-assembly-tools');
  if(!button||!toolbar)return;
  button.closest('.silm-camera-bar')?.classList.remove('silm-camera-bar-has-expand');
  button.classList.remove('si-tab','secondary-btn','silm-camera-btn','si-structure-expand-in-camera','si-structure-expand-in-tools');
  if(inCameraBar&&phone.matches&&tools){button.classList.add('secondary-btn','si-structure-expand-in-tools');tools.append(button);}
  else if(inCameraBar&&bar){button.classList.add('secondary-btn','silm-camera-btn','si-structure-expand-in-camera');bar.classList.add('silm-camera-bar-has-expand');
   // Tela cheia ao lado de Restaurar vista (par da grade de duas colunas), antes dos controles 3D.
   const anchor=bar.classList.contains('silm-camera-compact')?
    bar.querySelector('[id$="-camera-fit"]'):bar.querySelector('[id$="-camera-reset"]');
   if(anchor)anchor.after(button);else bar.append(button);}
  else{button.classList.add('si-tab');if(button.parentElement!==toolbar)toolbar.append(button);}
 }
 phone.addEventListener?.('change',()=>placeExpansionButton(expansionInScene));
 /* Estado vazio no padrão do SIAB ("Bancada vazia"): ilustração, título, o que fazer e ações que funcionam. */
 function emptyState({title,text,actions}){
  const box=document.createElement('div');box.className='si-empty-state';box.setAttribute('role','region');box.setAttribute('aria-label',title);
  box.insertAdjacentHTML('afterbegin','<svg class="si-empty-art" viewBox="0 0 120 96" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M30 30h44v44H30Z"/><path d="M50 14h44v44H50Z" stroke-dasharray="5 5"/><path d="m30 30 20-16M74 30l20-16M74 74l20-16M30 74l20-16" stroke-dasharray="5 5"/><circle cx="30" cy="30" r="5"/><circle cx="74" cy="30" r="5"/><circle cx="30" cy="74" r="5"/><circle cx="74" cy="74" r="5"/><circle cx="52" cy="52" r="5" class="si-empty-accent"/></svg>');
  const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');
  text.forEach((part,i)=>{if(i%2){const b=document.createElement('strong');b.textContent=part;p.append(b);}else p.append(part);});
  const row=document.createElement('div');row.className='si-empty-actions';
  for(const [label,fn,kind] of actions){const b=document.createElement('button');b.type='button';b.className='button '+(kind==='primary'?'primary':'outline');b.textContent=label;b.addEventListener('click',fn);row.append(b);}
  box.append(h,p,row);
  if(!storage.get('tour.seen',false)&&!routeUI?.session.open()){const note=document.createElement('div');note.className='silm-welcome';note.setAttribute('role','note');
   const t=document.createElement('p'),strong=document.createElement('strong');strong.textContent='Primeira vez na Oficina?';t.append(strong,' O tour mostra cada parte da oficina. Consulte o Manual e explore Roteiros e Missões.');
   const acts=document.createElement('div');acts.className='silm-welcome-actions';const tour=document.createElement('button');tour.type='button';tour.className='button primary';tour.textContent='Fazer o tour';tour.dataset.tourStart='';
   const manual=document.createElement('a');manual.className='button outline';manual.href='#/manual';manual.textContent='Abrir o manual';const later=document.createElement('button');later.type='button';later.className='button outline';later.textContent='Agora não';
   later.addEventListener('click',()=>{storage.set('tour.seen',true);note.remove();box.querySelector('.si-empty-actions .button')?.focus();});acts.append(tour,manual,later);note.append(t,acts);box.append(note);}
  $('silm-integration-scene').append(box);
 }
 /* "Organizar estrutura" indisponível: diga para qual metal, qual estrutura está registrada e o que continua possível. */
 function organizeReason(e,eligibility){const label=eligibility.registeredLabel?' ('+eligibility.registeredLabel+')':'';
  return 'Organizar indisponível para '+e.name.toLowerCase()+': '+eligibility.message.replace(/\.$/,'')+label+'. A montagem livre continua disponível.';}
 function openLeft(tab){const open=document.querySelector('[data-open-dock="montagem"]');if(open&&open.getAttribute('aria-expanded')!=='true')open.click();requestAnimationFrame(()=>document.querySelector('[data-left-tab="'+tab+'"]:not([hidden])')?.click());}
 function renderScene(){
  const state=model.state,e=element(),key=e?state.investigation.id+':'+e.atomicNumber+':'+state.module.active+':'+(state.structure?.mode||'empty')+':'+(state.structure?.mode==='crystalline'?(workshopScale===4?representation.centerViewMode:representation.viewMode):'2d')+':'+(workshopScale===4?'centro':'rede'):'none';
  if(viewKey!==key){placeExpansionButton(false);scope?.destroy();scope=null;view=null;viewKey=key;$('silm-integration-scene').replaceChildren();
   if(!e){
    // Fallback para a Oficina anterior caso o módulo de aplicações não carregue.
    if(!S.workshop)emptyState({title:'Oficina vazia',text:['Abra ','Montagem → Preparo',' para escolher um metal. Depois adicione unidades e organize a estrutura.'],actions:[['Abrir Montagem',()=>openLeft('preparo'),'primary'],['Começar com o cobre',async()=>{$('silm-metal').value='29';selected='29';await start();}],['Montagens prontas',()=>{location.hash='#/montagens';}],['Tabela periódica',()=>$('silm-open-periodic').click()]]});
   }
   else if(!state.structure)emptyState({title:'Estrutura de '+e.name+' vazia',text:state.module.active==='explorar'?['Use ','Adicionar unidade',' para montar a estrutura de '+e.name+'. Depois organize segundo a estrutura de referência.']:['A estrutura ainda não foi montada. Volte ao módulo ','Explorar',' em Ver para adicionar unidades.'],actions:state.module.active==='explorar'&&(!routeUI.session.open()||routeUI.canBuild())?[['Adicionar unidade',()=>run.add(),'primary'],['Abrir Montagem',()=>openLeft('objetos')]]:[['Abrir Ver',()=>{const button=document.querySelector('[data-open-dock="ver"]');if(button?.getAttribute('aria-expanded')!=='true')button?.click();requestAnimationFrame(()=>$('silm-module-shortcuts')?.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true}));},'primary']]});
   else if(state.structure){
    scope=SimCore.createScope();const common={scope,model,element:e,actions:run,reducedMotion:reduced,representation:rep,observer:workspaceFamily.observer,moduleTitle:{explorar:'Explorar',medir:'Medir',calcular:'Calcular'}[state.module.active],measure:tools.measure,calc:tools.calc,properties:experience.scene};
    if(state.structure.mode==='crystalline')view=S.createCrystalView($('silm-integration-scene'),{...common,geometry:S.crystal.geometry(e),localFocus:workshopScale===4&&!routeUI?.session.open()});
    else view=S.createAssemblyView($('silm-integration-scene'),{...common,editable:state.module.active==='explorar'&&(!routeUI.session.open()||routeUI.canBuild()),organize:{run:run.organize,state:()=>{
     const eligibility=S.crystal.eligibility(e);return {disabled:!model.state.structure?.units.length||eligibility.status!=='available',reason:eligibility.status!=='available'?organizeReason(e,eligibility):'',more:{label:'Por que uma opção não aparece',href:'#/manual?topico=problemas'}};
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

 function ensureWorkshopCrystal(){
  const e=element();if(!e)return {ok:false,reason:'NO_METAL'};
  const eligibility=S.crystal.eligibility(e);if(eligibility.status!=='available')return {ok:false,reason:eligibility.reasonCode||'STRUCTURE_UNAVAILABLE'};
  const structure=model.state.structure;
  const needsBuild=!structure||!structure.units?.length||structure.mode==='free';
  if(needsBuild&&model.state.module.active!=='explorar')return {ok:false,reason:'EXPLORE_REQUIRED'};
  if(needsBuild&&routeUI?.session.open()&&!routeUI.canBuild())return {ok:false,reason:'ACTIVITY_LOCKED'};
  if(!model.state.structure)model.beginAssembly();
  if(!model.state.structure?.units?.length){const added=model.addUnit();if(!added?.ok)return added||{ok:false,reason:'ADD_UNIT_FAILED'};}
  if(model.state.structure?.mode==='free'){const organized=model.organize();if(!organized?.ok)return organized;}
  return model.state.structure?.mode==='crystalline'?{ok:true}:{ok:false,reason:'CRYSTAL_NOT_READY'};
 }
 function setWorkshopScale(level){
  showObjectEntry=false;
  if(!Number.isInteger(level)||level<1||level>4||!element())return false;
  if(level>=3){
   const ready=ensureWorkshopCrystal();if(!ready.ok){const message=ready.reason==='EXPLORE_REQUIRED'?'Prepare a rede no módulo Explorar.':ready.reason==='ACTIVITY_LOCKED'?'A atividade atual não permite preparar outra estrutura cristalina.':(S.crystal.reasons[ready.reason]||'A estrutura cristalina não está disponível.');say(message,'warning');workshopScale=2;updateWorkshopContext();return false;}
   const units=model.state.structure?.units||[],first=units[0]||null,currentId=model.state.structure?.crystallography?.representation?.selectedUnitId;
   const center=level===4?(units.find(unit=>unit.id===currentId)||first):units.find(unit=>unit.id===currentId)||null;
   if(!model.setCrystalRepresentation({view:'lattice',unitCell:true,neighbors:level===4,selectedUnitId:center?.id||null}))return false;
   if(!model.setWorkshopContext(workshopSelectionId,level))return false;
   workshopScale=level;schedule();
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    ($('silm-assembly-stage')||$('silm-integration-scene'))?.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'});
    if(level===3)view?.renderer?.fit?.();if(level===4&&center)view?.focusUnit?.(center.id);
   }));
  }else{if(!model.setWorkshopContext(workshopSelectionId,level))return false;workshopScale=level;updateWorkshopContext();}
  return true;
 }
 async function investigateWorkshopReference(item){
  if(!item||!S.workshop.get(item.id))return false;
  const previousAtomicNumber=element()?.atomicNumber??null,previousWorkshopSelectionId=workshopSelectionId,previousWorkshopScale=workshopScale;
  if(item.atomicNumber===previousAtomicNumber){model.setWorkshopContext(item.id,1);schedule();return true;}
  workshopSelectionId=item.id;workshopScale=1;
  const started=await start({preserveWorkshop:true});
  if(!started){if(previousAtomicNumber!==null){selected=String(previousAtomicNumber);$('silm-metal').value=selected;}workshopSelectionId=previousWorkshopSelectionId;workshopScale=previousWorkshopScale;updateWorkshopContext();return false;}
  // A investigação começa no contexto macroscópico. A rede só é construída ao avançar para a escala 3.
  model.setWorkshopContext(item.id,1);workshopScale=1;updateWorkshopContext();schedule();return true;
 }
 function disposeEntryTable(){entryTableScope?.destroy();entryTableScope=null;}
 function openObjectCatalog(metal,origin=document.activeElement){
  if(!metal||metal.silmEligibility.status!=='available')return false;
  if(routeUI?.session.open()){say('Encerre a atividade orientada para escolher outro objeto.','info');return false;}
  const dialog=$('silm-objects-dialog'),body=$('silm-objects-body');
  if(!dialog||!body)return false;
  catalogOpener=origin;catalogNavigating=false;
  S.workshop.renderObjectCatalog(body,{element:metal,onInvestigate:chooseObjectFromCatalog});
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('#silm-objects-title')?.focus({preventScroll:true});
  return true;
 }
 async function chooseObjectFromCatalog(item){
  const dialog=$('silm-objects-dialog');
  const oldSelected=selected,oldValue=$('silm-metal').value,metal=S.data.get(item.atomicNumber);
  catalogNavigating=true;
  // A confirmação da Base usa um overlay próprio: fechar o dialog nativo
  // ANTES de perguntar evita colocar a confirmação atrás da top layer.
  if(dialog?.open)dialog.close();
  selected=String(item.atomicNumber);$('silm-metal').value=selected;
  const accepted=await investigateWorkshopReference(item);
  if(!accepted){
   selected=oldSelected;$('silm-metal').value=oldValue;
   catalogNavigating=false;
   if(metal)openObjectCatalog(metal,catalogOpener);
   return false;
  }
  legacyDiscovery=false;showObjectEntry=false;
  showFocus();schedule();
  requestAnimationFrame(()=>{
   const target=document.querySelector('#silm-workshop-context .silm-workshop-browse-objects')||
    document.querySelector('#silm-workshop-context .silm-workshop-scale[data-scale="1"]');
   target?.focus({preventScroll:true});
  });
  return true;
 }
 function renderObjectEntry(host,{active=null}={}){
  disposeEntryTable();host.replaceChildren();host.hidden=false;
  const area=document.createElement('section');area.className='silm-object-entry';area.id='silm-object-entry';
  const head=document.createElement('div');head.className='silm-object-entry-head';
  const title=document.createElement('h2');title.textContent='Objetos do cotidiano';
  const actions=document.createElement('div');actions.className='silm-object-entry-actions';
  // Mantém acesso ao diálogo histórico da tabela para apresentação e compatibilidade.
  const full=document.createElement('button');full.type='button';full.className='button outline';full.textContent='Ampliar tabela';full.title='Abrir a Tabela Periódica em janela ampliada';
  full.setAttribute('aria-label','Tabela Periódica');full.addEventListener('click',()=> $('silm-open-periodic')?.click());
  actions.append(full);
  if(active){const back=document.createElement('button');back.type='button';back.className='button outline';
   back.textContent='Voltar ao objeto';back.addEventListener('click',()=>{showObjectEntry=false;schedule();});actions.prepend(back);}
  head.append(title,actions);area.append(head);
  const tableHost=document.createElement('div');tableHost.className='silm-object-entry-table';area.append(tableHost);
  host.append(area);entryTableScope=SimCore.createScope();
  S.createPeriodicTable(tableHost,{scope:entryTableScope,state:{selection:null,query:''},entryObjects:true,
   canInvestigate:()=>!routeUI?.session.open(),
   onSelect:metal=>openObjectCatalog(metal),onInvestigate:metal=>openObjectCatalog(metal),
   onExplore:metal=>openObjectCatalog(metal),
   onSources:metal=>{const values=S.data.sourceIds(metal).map(id=>S.data.source(id)?.title||id);
    say(values.slice(0,2).join('; ')||'Consulte as fontes na ficha do elemento.','info');}});
  // A busca é o comando principal da Tabela: compartilha o cabeçalho
  // da escala Objeto, em vez de consumir uma segunda linha da grade.
  // Mover o mesmo formulário preserva eventos, rótulos e estado de busca.
  const search=tableHost.querySelector('.periodic-search');
  if(search)head.insertBefore(search,actions);
 }
 function activeWorkshopScale(saved){
  if(saved?.scale>=1&&saved.scale<=4&&(saved.scale!==1||workshopSelectionId||S.workshop.list(element().atomicNumber).length))return saved.scale;
  const structure=model.state.structure;
  return structure?.mode==='crystalline'?(structure.crystallography.representation.neighbors?4:3):0;
 }
 function updateWorkshopViewport(investigationActive){
  const showCrystal=!!investigationActive&&(workshopScale===0||workshopScale>=3);
  const stage=$('si-stage'),scene=$('silm-integration-scene'),actionbar=$('silm-scene-actionbar');
  if(stage){stage.classList.toggle('silm-workshop-context-only',!showCrystal);stage.dataset.workshopScale=String(workshopScale||'free');}
  if(scene)scene.hidden=!showCrystal;
  if(actionbar)actionbar.hidden=!showCrystal;
  if(!showCrystal&&stage?.classList.contains('si-scene-expanded'))setStageExpanded(false,{restoreFocus:false});
  if(showCrystal)requestAnimationFrame(()=>view?.update());
 }
 function updateWorkshopContext(){
  const host=$('silm-workshop-context');if(!host||!S.workshop)return;
  if(routeUI?.session.open()){
   disposeEntryTable();
   const activity=routeUI.session.context(),metal=element();
   if(activity.type==='mission'&&metal){
    const saved=model.state.metadata.workshop;
    const items=S.workshop.list(metal.atomicNumber);
    const chosen=S.workshop.get(saved?.referenceId)||items[0]||null;
    workshopSelectionId=chosen?.atomicNumber===metal.atomicNumber?chosen.id:null;
    workshopScale=activeWorkshopScale(saved);
    const displayScale=workshopScale||3;
    const key='guided:'+activity.id+':'+metal.atomicNumber+':'+(workshopSelectionId||'')+':'+displayScale;
    if(host.dataset.key!==key){
     host.dataset.key=key;
     S.workshop.renderReference(host,{element:metal,item:chosen,items,scale:displayScale,guided:true,onScale:setWorkshopScale});
    }
    updateWorkshopViewport(true);
    return;
   }
   host.hidden=true;delete host.dataset.key;updateWorkshopViewport(true);
   $('silm-integration-scene').hidden=false;$('silm-scene-actionbar').hidden=false;
   $('si-stage').classList.remove('silm-workshop-context-only');return;
  }
  const active=element(),candidate=S.data.get(Number(selected||$('silm-metal')?.value));
  if(active&&candidate&&candidate.atomicNumber!==active.atomicNumber){
   disposeEntryTable();
   const saved=model.state.metadata.workshop;
  workshopSelectionId=saved&&S.workshop.get(saved.referenceId)?.atomicNumber===active.atomicNumber?saved.referenceId:null;
  workshopScale=activeWorkshopScale(saved);
  updateWorkshopViewport(true);
   const key='pending:'+candidate.atomicNumber+':'+active.atomicNumber;
   if(host.dataset.key!==key){host.dataset.key=key;host.hidden=false;S.workshop.renderDiscovery(host,{element:candidate,notice:'A investigação atual de '+active.name+' permanece preservada. Escolher uma aplicação solicitará a troca antes de iniciar a nova investigação.',onOpenPeriodic:()=>$('silm-open-periodic')?.click(),onContinue:()=>{selected=String(active.atomicNumber);$('silm-metal').value=selected;workshopSelectionId=null;workshopScale=1;schedule();openLeft('preparo');},onInvestigate:investigateWorkshopReference,onStartDirect:()=>start()});}
   return;
  }
  if(!active){
   updateWorkshopViewport(false);
   if(!legacyDiscovery){const key='entry:initial';if(host.dataset.key!==key){host.dataset.key=key;renderObjectEntry(host);}return;}
   disposeEntryTable();
   const key='discover:'+String(candidate?.atomicNumber||'none');
   if(host.dataset.key===key)return;
   host.dataset.key=key;host.hidden=false;
   S.workshop.renderDiscovery(host,{element:candidate,onOpenPeriodic:()=>$('silm-open-periodic')?.click(),onContinue:()=>openLeft('preparo'),onInvestigate:investigateWorkshopReference,onStartDirect:()=>start()});
   return;
  }
  const saved=model.state.metadata.workshop;
  workshopSelectionId=saved&&S.workshop.get(saved.referenceId)?.atomicNumber===active.atomicNumber?saved.referenceId:null;
  workshopScale=activeWorkshopScale(saved);
  updateWorkshopViewport(true);
  if(showObjectEntry&&workshopScale===1){
   const key='entry:active:'+active.atomicNumber;
   if(host.dataset.key!==key){host.dataset.key=key;renderObjectEntry(host,{active});}
   return;
  }
  disposeEntryTable();
  if(workshopSelectionId&&S.workshop.get(workshopSelectionId)?.atomicNumber!==active.atomicNumber)workshopSelectionId=null;
  const item=S.workshop.get(workshopSelectionId);
  const chosen=item?.atomicNumber===active.atomicNumber?item:(S.workshop.list(active.atomicNumber).find(reference=>reference.atlasPath)||null);
  const key='active:'+active.atomicNumber+':'+(chosen?.id||'')+':'+workshopScale;
  if(host.dataset.key===key)return;
  host.dataset.key=key;host.hidden=false;
  S.workshop.renderReference(host,{element:active,item:chosen,items:S.workshop.list(active.atomicNumber),scale:workshopScale,
   onChoose:next=>{model.setWorkshopContext(next.id,1);schedule();},
   onScale:setWorkshopScale,
   onOpenPeriodic:()=>{if(workshopScale===1){showObjectEntry=true;schedule();}else $('silm-open-periodic')?.click();},
   onBrowseObjects:()=>openObjectCatalog(active)});
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
  tools.render();experience.update();updateWorkshopContext();renderScene();if(focusAfterRender){$(focusAfterRender)?.focus({preventScroll:true});focusAfterRender=null;}
  text('silm-summary',e?e.name+' · '+units(n)+' · '+(s?.mode==='crystalline'?'estrutura cristalina':'montagem livre'):'Nenhuma investigação iniciada.');
  // Resumo em pares rótulo/valor, como o resumo da bancada do SIAB (só leitura do estado; nada é recalculado aqui).
  const list=$('silm-summary-list');if(list){const exp=routeUI?.experiment?.();const rows=e?[...(exp&&!routeUI.session.open()?[['Roteiro',exp.title]]:[]),['Metal',e.name+' ('+e.symbol+')'],['Estrutura',s?.mode==='crystalline'?S.crystal.label(s.crystallography?.structureType,e):'Montagem livre'],['Unidades',String(n)],['Módulo',{explorar:'Explorar',medir:'Medir',calcular:'Calcular'}[state.module.active]],['Medições',String(state.measurements?.length||0)],['Cálculos',String(state.calculations?.length||0)]]:[];
   const c=routeUI.session.context();if(c)rows.unshift([c.type==='mission'?'Missão':'Roteiro',routeUI.session.route().title]);
   const key=JSON.stringify(rows);if(list.dataset.key!==key){list.dataset.key=key;list.replaceChildren(...rows.flatMap(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;return [dt,dd];}));}}
  text('scene-count',units(n));text('silm-metal-information',selected?S.data.get(Number(selected)).name:'');
  $('scene-undo').disabled=state.module.active!=='explorar'||!model.canUndo;$('scene-clear').disabled=state.module.active!=='explorar'||!n;
  $('si-compact-clear').disabled=state.module.active!=='explorar'||!n;$('scene-count').dataset.compactCount=units(n);
  $('silm-add').disabled=state.module.active!=='explorar'||!e||s?.mode==='crystalline';$('silm-organize').disabled=state.module.active!=='explorar'||!n||s?.mode==='crystalline'||S.crystal.eligibility(e).status!=='available';{const el=e?S.crystal.eligibility(e):null,why=$('silm-organize-reason');if(why){why.textContent=el&&el.status!=='available'?organizeReason(e,el):'';why.hidden=!why.textContent;}}
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
 async function start({preserveWorkshop=false}={}){
  if(routeUI.session.open())return;
  const z=Number($('silm-metal').value);
  if(model.state.investigation){const accepted=await B.confirmDialog({title:'Iniciar outra investigação?',description:'A investigação atual será substituída neste ambiente. Exporte-a em Dados se desejar guardá-la.',confirmText:'Iniciar',cancelText:'Cancelar'});if(!accepted)return;}
  if(!preserveWorkshop){workshopSelectionId=null;workshopScale=1;}
  if(model.begin(z)){legacyDiscovery=false;model.beginAssembly();say('Investigação iniciada com '+S.data.get(z).name+'.','success');return true;}return false;
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
 // Etapa 12 do plano de paridade: Menu, preferências e aplicativo como no SIAB 1.0.0.
 function shell(){
  const startup=$('silm-startup-dialog'),about=$('silm-about-dialog');
  // Janelas nativas (<dialog>): Escape fecha e o foco volta ao controle de origem.
  document.addEventListener('click',event=>{const close=event.target.closest('[data-close-dialog]');if(close)close.closest('dialog')?.close();});
  const openDialog=dialog=>{B.closeNavigationDrawer(true);if(!dialog.open)dialog.showModal();};
  // Escape fecha a janela aberta do SILM (tour, ajuda, tela inicial, Sobre) antes de a Base usar a tecla para fechar uma doca.
  window.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const open=[...document.querySelectorAll('dialog.silm-dialog[open],dialog.silm-tour[open]')].pop();if(!open)return;event.preventDefault();event.stopImmediatePropagation();open.close();},true);
  // Tela inicial: Página inicial ou Oficina dos Metais; "Redefinir preferência" volta a perguntar na próxima abertura.
  const syncStartup=()=>{const choice=startupChoice();for(const b of startup.querySelectorAll('[data-startup]:not([data-startup="reset"])'))b.setAttribute('aria-pressed',String(b.dataset.startup===choice));};
  const openStartup=()=>{syncStartup();openDialog(startup);$('silm-startup-title').focus();};
  document.addEventListener('click',event=>{
   if(event.target.closest('[data-startup-settings]')){event.preventDefault();openStartup();return;}
   const option=event.target.closest('#silm-startup-dialog [data-startup]');if(!option)return;
   if(option.dataset.startup==='reset'){B.storage.write('startup.choice','');syncStartup();startup.querySelector('[data-startup="inicio"]').focus();say('Escolha novamente sua tela inicial.');return;}
   B.storage.write('startup.choice',option.dataset.startup);startup.close();location.hash='#/'+option.dataset.startup;
  });
  // Primeira visita sem destino: o convite aparece depois da abertura e não interrompe outra navegação, janela ou atividade.
  if(!specificEntry&&!startupChoice()&&!routeUI.session.open()){
   const invite=()=>{if(B.currentRoute(location.hash)!=='inicio'||routeUI.session.open()||startupChoice()||document.querySelector('dialog[open]')||B.isPlatformDialogOpen()||document.body.classList.contains('nav-open'))return;
    if($('silm-intro-v3')){setTimeout(invite,150);return;}openStartup();};
   setTimeout(invite,250);
  }
  // Tour da oficina (Etapa 10): coachmark como no SIAB, só na oficina livre; cada passo aponta um controle real e visível.
  const TOUR=[
   {title:'Prepare a oficina',text:'Abra Montagem → Preparo para escolher o metal e usar Iniciar investigação. A Tabela periódica mostra os metais disponíveis.',left:'preparo',target:()=>$('si-dock-left'),mobile:'[data-open-dock="montagem"]'},
   {title:'Escolha um módulo',text:'Abra Ver e escolha Explorar, Medir ou Calcular. O segundo nível mostra as ferramentas permitidas pelo módulo, como no SIAB.',right:'ver',target:()=>$('silm-module-shortcuts'),mobile:'[data-open-dock="ver"]'},
   {title:'Monte a estrutura',text:'Em Explorar, use Adicionar unidade e Organizar estrutura para dispor as unidades na estrutura de referência. Desfazer recupera o estado anterior.',left:'preparo',target:()=>$('silm-group-structure')?.closest('section,.silm-dock-group')||$('silm-add'),mobile:'[data-open-dock="montagem"]'},
   {title:'Observe',text:'A cena mostra a montagem. Girar, aproximar ou trocar a vista não altera medições nem cálculos.',target:()=>$('si-stage'),mobile:'#si-stage'},
   {title:'Investigue e consulte os dados',text:'Em Ver, observe, meça e analise conforme o módulo. Em Dados, consulte os valores, as fontes e o relatório.',right:'ver',target:()=>$('si-dock-right'),mobile:'[data-open-dock="ver"]'}];
  const tourDialog=$('silm-tour'),ring=tourDialog.querySelector('.si-coach-ring'),card=tourDialog.querySelector('.si-coach-card');let step=0,opener=null;
  const sheets=()=>matchMedia('(max-width: 900px)').matches;
  const shown=el=>!!el&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
  const closeDocks=()=>{for(const side of ['left','right']){const pane=$('si-dock-'+side);if(pane&&!pane.hidden)document.querySelector('[data-close-dock="'+side+'"]')?.click();}};
  const tourTarget=()=>{const s=TOUR[step],el=sheets()?document.querySelector(s.mobile):s.target();return shown(el)?el:null;};
  const placeTour=()=>{if(!tourDialog.open)return;const el=tourTarget(),vw=innerWidth,vh=innerHeight,M=12,c=card.getBoundingClientRect();
   if(!el){ring.hidden=true;card.style.left=Math.max(M,(vw-c.width)/2)+'px';card.style.top=Math.max(M,(vh-c.height)/2)+'px';return;}
   const r=el.getBoundingClientRect(),top=Math.max(r.top-6,4),bottom=Math.min(r.bottom+6,vh-4),left=Math.max(r.left-6,4),right=Math.min(r.right+6,vw-4);ring.hidden=false;Object.assign(ring.style,{left:left+'px',top:top+'px',width:(right-left)+'px',height:(bottom-top)+'px'});
   const clampX=x=>Math.min(Math.max(x,M),vw-c.width-M),clampY=y=>Math.min(Math.max(y,M),vh-c.height-M);let x,y;
   if(bottom+M+c.height<=vh-M){x=clampX(r.left+r.width/2-c.width/2);y=bottom+M;}else if(top-M-c.height>=M){x=clampX(r.left+r.width/2-c.width/2);y=top-M-c.height;}
   else if(right+M+c.width<=vw-M){x=right+M;y=clampY(r.top);}else if(left-M-c.width>=M){x=left-M-c.width;y=clampY(r.top);}else{x=clampX((vw-c.width)/2);y=vh-c.height-M;}
   card.style.left=x+'px';card.style.top=y+'px';};
  const showStep=n=>{step=n;const s=TOUR[n];closeDocks();
   if(!sheets()){if(s.left)openLeft(s.left);if(s.right){const open=document.querySelector('[data-open-dock="'+s.right+'"]');if(open?.getAttribute('aria-expanded')!=='true')open?.click();}}
   $('silm-tour-step').textContent='PASSO '+(n+1)+' DE '+TOUR.length;$('silm-tour-title').textContent=s.title;$('silm-tour-text').textContent=s.text;
   $('silm-tour-dots').replaceChildren(...TOUR.map((_,i)=>{const d=document.createElement('span');if(i===n)d.className='current';return d;}));
   $('silm-tour-back').hidden=n===0;$('silm-tour-next').textContent=n===TOUR.length-1?'Concluir':'Próximo';
   requestAnimationFrame(()=>requestAnimationFrame(()=>{tourTarget()?.scrollIntoView({block:'nearest'});placeTour();}));$('silm-tour-next').focus({preventScroll:true});};
  const launchTour=()=>{if(tourDialog.open)return;opener=document.activeElement;tourDialog.showModal();showStep(0);};
  const startTour=()=>{B.closeNavigationDrawer(false);document.querySelector('dialog.silm-dialog[open]')?.close();
   if(routeUI.session.open()){say('O tour está disponível na oficina livre. Encerre a atividade para fazê-lo.','info');return;}
   if(B.currentRoute(location.hash)==='ambiente'){requestAnimationFrame(launchTour);return;}
   window.addEventListener('hashchange',()=>requestAnimationFrame(()=>requestAnimationFrame(launchTour)),{once:true});location.hash='#/ambiente';};
  document.addEventListener('click',event=>{if(event.target.closest('[data-tour-start]')){event.preventDefault();startTour();}});
  $('silm-tour-next').addEventListener('click',()=>{if(step<TOUR.length-1)showStep(step+1);else tourDialog.close();});
  $('silm-tour-back').addEventListener('click',()=>showStep(Math.max(0,step-1)));$('silm-tour-skip').addEventListener('click',()=>tourDialog.close());
  tourDialog.addEventListener('close',()=>{closeDocks();storage.set('tour.seen',true);document.querySelector('.silm-welcome')?.remove();
   requestAnimationFrame(()=>{const back=opener?.isConnected&&shown(opener)&&!opener.closest('#sidebar')?opener:opener?.closest('#sidebar')?$('nav-toggle'):document.querySelector('[data-open-dock="montagem"]');back?.focus({preventScroll:true});opener=null;});});
  window.addEventListener('resize',placeTour);document.addEventListener('scroll',placeTour,true);
  // Ajuda "?" das docas: o tópico do Manual que corresponde ao que o painel mostra agora (como as ajudas do SIAB).
  const VIEWER_TOPICS=[['Estrutura','vista'],['Elétrons','eletrons-deslocalizados'],['Propriedades','propriedades-metalicas'],['Instrumentos','medir'],['Medir','medir'],['Cálculos','calcular'],['Calcular','calcular']];
  const dockTopic=side=>{if(side==='left'){const tab=document.querySelector('[data-left-tab][aria-pressed="true"]')?.dataset.leftTab;return {resumo:'interface',preparo:'selecionar-metal',objetos:'montagem',missao:'atividades',modulo:{explorar:'explorar',medir:'medir',calcular:'calcular'}[model.state.module.active]||'interface'}[tab]||'montagem';}
   if(document.querySelector('[data-open-dock="ver"]')?.getAttribute('aria-expanded')==='true'&&shown($('si-dock-viewer-back'))){const title=$('si-right-title').textContent;return VIEWER_TOPICS.find(([k])=>title.includes(k))?.[1]||'vista';}
   return 'interface';};
  const helpDialog=$('silm-help-dialog');
  document.addEventListener('click',event=>{const trigger=event.target.closest('[data-dock-help]');if(!trigger)return;const topic=S.manual.topics.find(t=>t.id===dockTopic(trigger.dataset.dockHelp))||S.manual.topics.find(t=>t.id==='interface');
   $('silm-help-title').textContent=topic.title;const body=$('silm-help-content');body.replaceChildren();const lead=document.createElement('p');lead.className='silm-lead';lead.textContent=topic.summary;body.append(lead);
   if(topic.purpose||topic.content){const more=document.createElement('p');more.textContent=topic.purpose||topic.content;body.append(more);}
   if(topic.steps?.length){const ol=document.createElement('ol');for(const s of topic.steps){const li=document.createElement('li');li.textContent=s;ol.append(li);}body.append(ol);}
   $('silm-help-manual').href='#/manual?topico='+encodeURIComponent(topic.id);if(!helpDialog.open)helpDialog.showModal();});
  // Visitar o Manual também conta como "já viu" (SIAB): o aviso de primeira visita não volta.
  const manualSeen=()=>{if(B.currentRoute(location.hash)!=='manual')return;storage.set('tour.seen',true);document.querySelector('.silm-welcome')?.remove();};
  window.addEventListener('si-route-changed',manualSeen);manualSeen();
  // Sobre: a mesma informação na janela do Menu e na página #/sobre.
  $('si-about-open').addEventListener('click',()=>openDialog(about));
  const page=$('silm-about-page');if(page){const body=about.querySelector('.silm-about-body').cloneNode(true);for(const a of body.querySelectorAll('[data-close-dialog]'))a.removeAttribute('data-close-dialog');page.append(body);}
  // Acessibilidade no cabeçalho abre o Menu já no grupo de acessibilidade, com o foco nele (como no SIAB).
  $('si-header-access').addEventListener('click',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const toggle=$('si-a11y-toggle');if(!document.body.classList.contains('nav-open')||!toggle)return;toggle.focus({preventScroll:true});toggle.scrollIntoView({block:'start'});})));
  // "Agora": o contexto da tela, como no SIAB (Oficina com o módulo ou a atividade; Manual com o grupo e o tópico).
  const nowTitle=$('si-now-title'),nowText=$('si-now-description'),cont=$('si-nav-continue');
  const now=()=>{const route=B.currentRoute(location.hash),context=routeUI.session.context();let text='Seu contexto atual';
   if(route==='ambiente'){const module=($('si-module-tag')?.textContent||'').split('·').pop().trim();text=(context?routeUI.session.title()||'Atividade':routeUI.experiment()?'Roteiro Experimental':'Oficina livre')+(module?' · '+module:'');}
   else if(route==='manual'){const crumbs=(document.querySelector('#silm-manual .silm-manual-breadcrumb')?.textContent||'').split('/').map(x=>x.trim()).filter(Boolean);text=crumbs.length>1?crumbs.slice(1).join(' › '):'Guia de uso e consulta';}
   if(nowText&&nowText.textContent!==text)nowText.textContent=text;
   const label=route==='ambiente'?'Continuar na oficina':'Continuar nesta tela';if(cont&&cont.textContent!==label)cont.textContent=label;};
  const watch=new MutationObserver(now);for(const node of [nowTitle,nowText,cont])if(node)watch.observe(node,{childList:true,characterData:true,subtree:true});
  window.addEventListener('si-route-changed',now);now();
 }
 function boot(){
  const live=document.createElement('p');live.id='silm-announcement';live.className='sr-only';live.setAttribute('role','status');live.setAttribute('aria-live','polite');document.body.append(live);
  // Only the new Base shell initializes. Demo scene, generic engine and demo extension never start.
  B.setupStorageConflictProtection();B.setupPreferences();B.setupComponents();B.selectModule('explorar');
  B.setupWorkspace(()=>({schemaVersion:1,entities:[],selectedId:null}),()=>{});
  if(!specificEntry&&startupChoice()==='ambiente')history.replaceState(null,'','#/ambiente');
  B.setupNavigationDrawer();B.setupMenuReview();B.updateRoute();window.addEventListener('hashchange',B.updateRoute);
  const objectDialog=$('silm-objects-dialog');
  objectDialog?.querySelector('#silm-objects-close')?.addEventListener('click',()=>objectDialog.close());
  objectDialog?.addEventListener('click',event=>{
   if(event.target.closest('a[href^="#/manual"]'))objectDialog.close();
  });
  objectDialog?.addEventListener('close',()=>{if(catalogNavigating)return;
   const target=catalogOpener;
   requestAnimationFrame(()=>{
    if(target?.isConnected&&target.getClientRects().length)target.focus({preventScroll:true});
    else $('silm-workshop-context')?.querySelector('.silm-workshop-browse-objects')?.focus({preventScroll:true});
   });
  });
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
  routeUI.init();B.selectModule(model.state.module.active);workspaceFamily.init();shell();ready=true;render();
  // Read-only inspection facade: tests and debugging cannot mutate the authoritative state directly.
  window.SILMIntegration=Object.freeze({snapshot:()=>model.snapshot(),baseVersion:'0.9.17',activity:()=>routeUI.session.snapshot()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
