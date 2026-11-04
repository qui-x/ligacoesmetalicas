'use strict';
/* Adaptação do workspace pela API pública da Base SI. A ciência continua no modelo SILM. */
SILM.createWorkspaceFamily=({model,activity=()=>null})=>{
 const B=BaseDemoSI,$=id=>document.getElementById(id);
 const node=(tag,text,className)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;};
 const emptyScene=()=>({schemaVersion:1,entities:[],selectedId:null});
 const layerKey='silm-viewer-layer-state-v1';
 const layerDefaults={centers:true,property:true,labels:true,legend:true};
 const storedLayers=B.storage.read(layerKey);
 const layerState={...layerDefaults,...(storedLayers&&typeof storedLayers==='object'?storedLayers:{})};
 const definitions=[
  {id:'observacao-contextual',title:'Observação contextual',capability:'tools',family:'observar',description:'Síntese e leitura contextual da investigação.',render:output=>renderObserverContext(output)},
  {id:'camadas-estrutura',title:'Estrutura',capability:'tools',family:'camadas',description:'Centros metálicos, célula unitária, rede extensa e vizinhos.',render:output=>renderLayerStructure(output)},
  {id:'camadas-modelos',title:'Modelos',capability:'tools',family:'camadas',description:'Visibilidade e movimento dos elétrons deslocalizados.',render:output=>renderLayerModels(output)},
  {id:'camadas-indicacoes',title:'Indicações',capability:'tools',family:'camadas',description:'Respostas visuais, rótulos e legendas.',render:output=>renderLayerIndications(output)},
  {id:'comparar-livre-cristalina',title:'Montagem livre × cristalina',capability:'tools',family:'comparar',description:'Compare a preparação livre com a organização cristalográfica.',render:output=>renderComparison('free-crystal',output)},
  {id:'comparar-celula-rede',title:'Célula × rede',capability:'tools',family:'comparar',description:'Compare a célula unitária com a rede extensa.',render:output=>renderComparison('cell-lattice',output)},
  {id:'comparar-eletrons',title:'Elétrons ocultos × visíveis',capability:'tools',family:'comparar',description:'Compare a mesma estrutura com o modelo eletrônico oculto e visível.',render:output=>renderComparison('electrons',output)},
  {id:'comparar-propriedade',title:'Antes × depois da propriedade',capability:'tools',family:'comparar',description:'Consulte o estado-base e a resposta da experiência atual.',render:output=>renderComparison('property',output)},
  {id:'instrumentos',title:'Instrumentos de medição',capability:'measure',family:'medir',description:'Escolha um instrumento e selecione pontos na estrutura. Os registros ficam em Dados.'},
  {id:'calculos',title:'Cálculos cristalográficos',capability:'analyze',family:'calcular',description:'Escolha uma fórmula e a origem de cada valor. Consulte os resultados e a proveniência em Dados.'}
 ];
 let ready=false,dataPage=null;
 const names={explorar:'Explorar',medir:'Medir',calcular:'Calcular'};
 const observerFocusKey='silm-observer-focus-v1';
 const focusLabels={sintese:'Síntese',centro:'Centro',estrutura:'Célula / Montagem',eletrons:'Elétrons',propriedade:'Propriedade'};
 let observerManualFocus=B.storage.read(observerFocusKey)||null,observerAutomaticFocus='sintese',freeCenterSelection=null;
 function renderViewers(){
  const focused=document.activeElement,tab=focused?.closest('#si-viewer-families')?focused.getAttribute('aria-selected'):null;
  B.renderViewers(emptyScene());
  $('si-viewer-catalog')?.classList.toggle('silm-contextual-observer',B.currentViewerFamily()==='observar');
  if(tab)$('si-viewer-families').querySelector('[aria-selected="true"]')?.focus({preventScroll:true});
 }
 function observerContext(state=model.state){
  const structure=state.structure,element=state.metal?SILM.data.get(state.metal.atomicNumber):null;
  const crystal=structure?.mode==='crystalline',representation=crystal?structure.crystallography.representation:null;
  const crystalId=representation?.selectedUnitId||null;
  const freeId=structure?.mode==='free'&&freeCenterSelection?.investigationId===state.investigation?.id?freeCenterSelection.unitId:null;
  const selectedId=crystalId||freeId||null,selectedUnit=selectedId?structure?.units.find(unit=>unit.id===selectedId)||null:null;
  const minimum=SILM.electronModel?.minUnits||2,available=['sintese'];
  if(selectedUnit)available.push('centro');
  if(structure)available.push('estrutura');
  if(structure&&(state.electrons||structure.units.length>=minimum))available.push('eletrons');
  if(structure&&element&&state.module.active==='explorar')available.push('propriedade');
  const automatic=available.includes(observerAutomaticFocus)?observerAutomaticFocus:
   state.properties?.active&&available.includes('propriedade')?'propriedade':
   state.electrons?.representation.visible&&available.includes('eletrons')?'eletrons':
   selectedUnit?'centro':structure?'estrutura':'sintese';
  if(observerManualFocus&&!available.includes(observerManualFocus)){observerManualFocus=null;B.storage.write(observerFocusKey,null);}
  return {state,structure,element,crystal,representation,selectedId,selectedUnit,available,focus:observerManualFocus||automatic};
 }
 function observerValue(parent,label,value,note=''){
  const item=node('div',null,'silm-observer-value');
  item.append(node('span',label,'silm-observer-value-label'),node('strong',String(value),'silm-observer-value-data'));
  if(note)item.append(node('small',note,'silm-observer-value-note'));
  parent.append(item);return item;
 }
 function observerSection(parent,title,lead=''){
  const section=node('section',null,'silm-observer-section');section.append(node('h3',title,'silm-observer-section-title'));
  if(lead)section.append(node('p',lead,'silm-observer-section-lead'));parent.append(section);return section;
 }
 function observerStructureType(element,structure){
  if(!element||!structure)return 'Sem estrutura';
  return structure.mode==='crystalline'?SILM.crystal.label(structure.crystallography.structureType,element):'Montagem livre';
 }
 function renderObserverSynthesis(parent,ctx){
  const {state,structure,element}=ctx,section=observerSection(parent,'Síntese','Estado atual da investigação.');
  const grid=node('div',null,'silm-observer-values');
  observerValue(grid,'Metal',element?element.name+' ('+element.symbol+')':'Não selecionado');
  observerValue(grid,'Estrutura',observerStructureType(element,structure));
  observerValue(grid,'Unidades',String(structure?.units.length||0));
  observerValue(grid,'Módulo',{explorar:'Explorar',medir:'Medir',calcular:'Calcular'}[state.module.active]||state.module.active);
  observerValue(grid,'Elétrons',state.electrons?(state.electrons.representation.visible?'Visíveis':'Ocultos'):'Não ativados');
  observerValue(grid,'Propriedade',state.properties?.active?SILM.properties.catalog[state.properties.active]?.title:'Nenhuma em estudo');
  section.append(grid);
  if(!element)section.append(node('p','Selecione um metal em Montagem para iniciar a investigação.','silm-observer-note'));
  else if(!structure)section.append(node('p','A investigação está aberta, mas ainda não há uma montagem.','silm-observer-note'));
 }
 function renderObserverCenter(parent,ctx){
  const {structure,element,selectedUnit}=ctx;if(!selectedUnit||!structure)return;
  const index=structure.units.findIndex(unit=>unit.id===selectedUnit.id)+1;
  const section=observerSection(parent,'Centro selecionado','Unidade '+index+' de '+structure.units.length+'.');
  const grid=node('div',null,'silm-observer-values');observerValue(grid,'Elemento',element.name+' ('+element.symbol+')');
  if(structure.mode==='free'){
   observerValue(grid,'Posição X',selectedUnit.position.x.toFixed(3).replace('.',','),'Coordenada normalizada');
   observerValue(grid,'Posição Y',selectedUnit.position.y.toFixed(3).replace('.',','),'Coordenada normalizada');
   section.append(grid,node('p','Montagem livre: ainda não há sítio cristalográfico, coordenação ou escala física para esta unidade.','silm-observer-note'));return;
  }
  try{
   const geometry=SILM.crystal.geometry(element),site=geometry.site(selectedUnit.site),role=geometry.role(selectedUnit.site),neighbors=geometry.neighbors(selectedUnit.site);
   observerValue(grid,'Posição fracionária',site.frac.map(v=>v.toFixed(3).replace('.',',')).join(' · '),'Coordenadas na célula de referência');
   observerValue(grid,'Localização',role.label);
   observerValue(grid,'Vizinhos',String(neighbors.list.length),'Coordenação do modelo cristalográfico');
   observerValue(grid,'Primeira distância',neighbors.distances.length?neighbors.distances[0].toFixed(3).replace('.',',')+' Å':'Não disponível','Geometria de referência');
   section.append(grid,node('p','Leitura do modelo cristalográfico; não é uma medição experimental da amostra.','silm-observer-note'));
  }catch{section.append(grid,node('p','A geometria de referência não está disponível para detalhar este centro.','silm-observer-note'));}
 }
 function renderObserverStructure(parent,ctx){
  const {structure,element}=ctx,section=observerSection(parent,'Célula / Montagem');
  if(!structure){section.append(node('p','A estrutura será apresentada aqui depois que a montagem for iniciada.','silm-observer-note'));return;}
  const grid=node('div',null,'silm-observer-values');
  observerValue(grid,'Representação',observerStructureType(element,structure));observerValue(grid,'Unidades',String(structure.units.length));
  if(structure.mode==='free'){
   observerValue(grid,'Posicionamento',structure.assistance.enabled?'Assistido':'Livre');
   section.append(grid,node('p','As unidades estão em coordenadas normalizadas. A montagem livre ainda não possui célula unitária, parâmetro de rede ou geometria cristalográfica.','silm-observer-note'));return;
  }
  const eligibility=SILM.crystal.eligibility(element),geometry=SILM.crystal.geometry(element),reference=eligibility.reference||geometry?.reference,modelGeometry=geometry?.model;
  observerValue(grid,'Grupo espacial',reference?.spaceGroup||modelGeometry?.spaceGroup||'Não informado');
  observerValue(grid,'Coordenação',String(eligibility.coordination??modelGeometry?.coordination??'Não informada'));
  observerValue(grid,'Átomos efetivos',String(modelGeometry?.effective?.value??modelGeometry?.cellSites??'Não informado'));
  const parameters=reference?.latticeParameters,parameterText=[];
  for(const key of ['a','b','c','alpha','beta','gamma']){
   const item=parameters?.[key];if(item&&Number.isFinite(item.value))parameterText.push(key+' = '+item.value.toFixed(3).replace('.',',')+' '+(item.unit||''));
  }
  section.append(grid);
  if(parameterText.length)section.append(node('p',parameterText.join(' · '),'silm-observer-parameters'));
  section.append(node('p','A estrutura segue a referência cristalográfica cadastrada para este metal.','silm-observer-note'));
 }
 function renderObserverElectrons(parent,ctx){
  const {state,element}=ctx,section=observerSection(parent,'Elétrons deslocalizados');
  const electrons=state.electrons;
  if(!electrons){section.append(node('p','O modelo eletrônico ainda não foi ativado. Quando houver unidades suficientes, sua visibilidade e seu movimento podem ser controlados em Camadas → Modelos.','silm-observer-note'));return;}
  const grid=node('div',null,'silm-observer-values');
  observerValue(grid,'Metal',element.name+' ('+element.symbol+')');
  observerValue(grid,'Representação',electrons.representation.visible?'Visível':'Oculta');
  observerValue(grid,'Movimento',electrons.representation.motion?'Ativo':'Pausado');
  observerValue(grid,'Classificação','Qualitativa');
  section.append(grid,node('p','Os marcadores representam elétrons de valência deslocalizados. Não correspondem a posições eletrônicas calculadas nem a uma densidade eletrônica quantitativa.','silm-observer-note'));
 }
 function renderObserverProperty(parent,ctx){
  const {state}=ctx,active=state.properties?.active,section=observerSection(parent,'Propriedade em estudo');
  if(!active){section.append(node('p','Nenhuma experiência está ativa. Escolha uma propriedade nos controles abaixo para iniciar a investigação.','silm-observer-note'));return;}
  const entry=SILM.properties.catalog[active],parameters=state.properties[active],narrative=SILM.properties.narrative(active,parameters,{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,electronsVisible:!!state.electrons?.representation.visible});
  section.append(node('h4',entry.title,'silm-observer-property-title'));
  if(narrative?.action)section.append(node('p',narrative.action,'silm-observer-property-action'));
  if(narrative?.observation)section.append(node('p',narrative.observation,'silm-observer-property-observation'));
  if(narrative?.interpretation)section.append(node('p',narrative.interpretation,'silm-observer-property-interpretation'));
  if(entry.limitation)section.append(node('p',entry.limitation,'silm-observer-note'));
 }
 function renderObserverContext(output){
  const ctx=observerContext(),root=node('section',null,'silm-observer-context');
  const nav=node('div',null,'silm-observer-focus-tabs');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Focos de observação');
  const content=node('div',null,'silm-observer-focus-content');content.id='silm-observer-focus-content';content.setAttribute('role','tabpanel');
  for(const panel of document.querySelectorAll('[data-silm-viewer]'))panel.hidden=true;
  for(const id of ctx.available){
   const button=node('button',focusLabels[id],'silm-observer-focus-tab');button.type='button';button.setAttribute('role','tab');
   button.setAttribute('aria-selected',String(id===ctx.focus));button.setAttribute('aria-controls',content.id);button.tabIndex=id===ctx.focus?0:-1;
   button.addEventListener('click',()=>{observerManualFocus=id;B.storage.write(observerFocusKey,id);renderViewers();});
   button.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
    const index=ctx.available.indexOf(id),next=event.key==='Home'?ctx.available[0]:event.key==='End'?ctx.available[ctx.available.length-1]:ctx.available[(index+(event.key==='ArrowRight'?1:-1)+ctx.available.length)%ctx.available.length];
    observerManualFocus=next;B.storage.write(observerFocusKey,next);renderViewers();$('si-viewer-output').querySelector('[role=tab][aria-selected=true]')?.focus({preventScroll:true});
   });
   nav.append(button);
  }
  root.append(nav,content);output.append(root);
  if(ctx.focus==='sintese')renderObserverSynthesis(content,ctx);
  else if(ctx.focus==='centro')renderObserverCenter(content,ctx);
  else if(ctx.focus==='estrutura'){renderObserverStructure(content,ctx);const panel=document.querySelector('[data-silm-viewer="estrutura"]');if(panel)panel.hidden=false;}
  else if(ctx.focus==='eletrons')renderObserverElectrons(content,ctx);
  else if(ctx.focus==='propriedade'){renderObserverProperty(content,ctx);const panel=document.querySelector('[data-silm-viewer="propriedades"]');if(panel)panel.hidden=false;}
 }
 function observerStateChanged(name,detail){
  if(name==='structure:organized'||name==='structure:created'||name==='structure:unit-added'||name==='structure:unit-moved'||name==='structure:undone'||name==='structure:free')observerAutomaticFocus='estrutura';
  else if(name==='structure:cleared'||name==='investigation:created'||name==='investigation:closed'||name==='investigation:reset')observerAutomaticFocus='sintese';
  else if(name==='structure:representation')observerAutomaticFocus=Object.prototype.hasOwnProperty.call(detail?.patch||{},'selectedUnitId')?(detail.patch.selectedUnitId?'centro':'estrutura'):'estrutura';
  else if(name==='electrons:activated')observerAutomaticFocus='eletrons';
  else if(name==='electrons:representation')observerAutomaticFocus=detail?.patch?.visible?'eletrons':'estrutura';
  else if(name==='properties:started'||name==='properties:changed'||name==='properties:restored')observerAutomaticFocus='propriedade';
  else if(name==='properties:ended')observerAutomaticFocus='estrutura';
  renderViewers();
 }
 window.addEventListener('silm-scientific-change',event=>observerStateChanged(event.detail?.name,event.detail?.payload));
 window.addEventListener('silm-free-unit-selection',event=>{
  freeCenterSelection=event.detail?.unitId?{unitId:event.detail.unitId,investigationId:event.detail.investigationId}:null;
  observerAutomaticFocus=freeCenterSelection?'centro':'estrutura';renderViewers();
 });
 function toggleRow(output,{title,description,checked,disabled=false,onChange}){
  const row=node('label',null,'silm-layer-row'),copy=node('span',null,'silm-layer-copy');
  copy.append(node('strong',title),node('small',description));
  const input=node('input');input.type='checkbox';input.checked=!!checked;input.disabled=!!disabled;input.setAttribute('aria-label',title);
  input.addEventListener('change',()=>onChange(input.checked));row.append(copy,input);output.append(row);return input;
 }
 function persistLayerState(){B.storage.write(layerKey,{...layerState});}
 function applyLayerPresentation(){
  const scene=document.querySelector('#silm-integration-scene .silm-assembly');if(!scene)return;
  scene.dataset.layerCenters=layerState.centers?'normal':'dim';scene.dataset.layerLabels=layerState.labels?'on':'off';
  scene.dataset.layerProperty=layerState.property?'on':'off';scene.dataset.layerLegend=layerState.legend?'on':'off';
  for(const notes of document.querySelectorAll('#silm-structure-notes .silm-scene-notes'))notes.hidden=!layerState.legend;
  for(const overlay of scene.querySelectorAll('.silm-property-overlay'))overlay.hidden=!layerState.property;
 }
 function layerChanged(key,value){layerState[key]=!!value;persistLayerState();applyLayerPresentation();renderViewers();}
 function renderLayerStructure(output){
  const s=model.state.structure,crystal=s?.mode==='crystalline',rep=crystal?s.crystallography.representation:null,group=node('section',null,'silm-layer-group');
  group.append(node('h3','Vista e visibilidade'));
  const views=node('div',null,'silm-layer-segmented');views.setAttribute('role','group');views.setAttribute('aria-label','Vista da estrutura');
  for(const [id,label] of [['cell','Célula'],['lattice','Rede']]){
   const b=node('button',label,'button outline');b.type='button';b.disabled=!crystal;b.setAttribute('aria-pressed',String(crystal&&rep.view===id));
   b.addEventListener('click',()=>{if(crystal&&model.setCrystalRepresentation({view:id}))renderViewers();});views.append(b);
  }
  group.append(views);
  toggleRow(group,{title:'Célula unitária visível',description:crystal?'Mostrar ou ocultar somente o contorno e os planos da célula.':'Disponível após organizar a estrutura cristalina.',checked:crystal?rep.unitCell:false,disabled:!crystal,onChange:v=>{model.setCrystalRepresentation({unitCell:v});renderViewers();}});
  toggleRow(group,{title:'Vizinhos visíveis',description:crystal?'Realçar os vizinhos da unidade selecionada. Selecione um centro na cena.':'Disponível após organizar a estrutura cristalina.',checked:crystal?rep.neighbors:false,disabled:!crystal,onChange:v=>{model.setCrystalRepresentation({neighbors:v});renderViewers();}});
  toggleRow(group,{title:'Destacar centros metálicos',description:'Reduzir o destaque não remove as unidades.',checked:layerState.centers,onChange:v=>layerChanged('centers',v)});
  if(!crystal)group.append(node('p','Organize uma estrutura cristalina para habilitar célula, rede e vizinhos.','silm-layer-note'));
  output.append(group);
 }
 function renderLayerModels(output){
  const state=model.state,el=state.electrons,units=state.structure?.units.length||0,min=SILM.electronModel?.minUnits||2,group=node('section',null,'silm-layer-group');
  group.append(node('h3','Modelo eletrônico'));
  toggleRow(group,{title:'Elétrons visíveis',description:el?'Ocultar os marcadores não desativa o modelo.':'Mostrar inicia o modelo, quando há unidades suficientes.',checked:!!el?.representation.visible,disabled:!el&&units<min,onChange:v=>{
   if(v){const result=el?model.setElectronRepresentation({visible:true}):model.activateElectrons();if(result===false||result?.ok===false)B.notify('Não foi possível ativar o modelo eletrônico.','warning');}
   else if(el)model.setElectronRepresentation({visible:false});renderViewers();
  }});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='on'||document.documentElement.classList.contains('si-no-motion');
  toggleRow(group,{title:'Movimento eletrônico',description:reduced?'A preferência de movimento reduzido mantém os marcadores estáticos.':'Pausar a animação não desativa o modelo.',checked:!!el?.representation.motion,disabled:!el||!el.representation.visible||reduced,onChange:v=>{if(el)model.setElectronRepresentation({motion:v});renderViewers();}});
  output.append(group);
 }
 function renderLayerIndications(output){
  const group=node('section',null,'silm-layer-group');group.append(node('h3','Indicações da cena'));
  toggleRow(group,{title:'Indicações da propriedade',description:'Ocultar a sobreposição não desliga fontes nem encerra a experiência.',checked:layerState.property,onChange:v=>layerChanged('property',v)});
  toggleRow(group,{title:'Rótulos',description:'Mostra ou oculta símbolos e identificadores auxiliares.',checked:layerState.labels,onChange:v=>layerChanged('labels',v)});
  toggleRow(group,{title:'Legendas e orientação',description:'Recolhe as notas auxiliares de leitura da cena.',checked:layerState.legend,onChange:v=>layerChanged('legend',v)});
  group.append(node('p','Visibilidade altera somente a apresentação; não altera o estado científico.','silm-layer-note'));output.append(group);
 }
 function compareCard(parent,kicker,title,description,status){
  const card=node('article',null,'silm-compare-card');card.append(node('span',kicker,'silm-compare-kicker'),node('h3',title),node('p',description));if(status)card.append(node('small',status,'silm-compare-status'));parent.append(card);
 }
 function renderComparison(kind,output){
  const state=model.state,s=state.structure,props=state.properties,grid=node('div',null,'silm-compare-grid');
  if(kind==='free-crystal'){
   const free=s?.mode==='crystalline'?s.crystallography.freeUnits:s?.mode==='free'?s.units:null,organized=s?.mode==='crystalline'?s.units:null;
   compareCard(grid,'A','Montagem livre',free?free.length+' unidades preservadas na disposição anterior.':'A montagem livre ainda não foi registrada nesta investigação.',free?'Registro disponível':'Sem registro');
   compareCard(grid,'B','Estrutura cristalina',organized?organized.length+' unidades na estrutura organizada.':'Organize a montagem para obter a estrutura cristalina de referência.',organized?'Registro disponível':'Aguardando organização');
  }else if(kind==='cell-lattice'){
   const rep=s?.mode==='crystalline'?s.crystallography.representation:null;
   compareCard(grid,'A','Célula unitária','Unidade de referência cristalográfica. Use Célula/Rede na barra da cena para alternar o enquadramento.',rep?'Geometria disponível':'Requer estrutura cristalina');
   compareCard(grid,'B','Rede extensa','Repetição periódica da mesma estrutura. Use Célula/Rede na barra da cena para alternar o enquadramento.',rep?'Geometria disponível':'Requer estrutura cristalina');
  }else if(kind==='electrons'){
   const visible=!!state.electrons?.representation.visible;
   compareCard(grid,'A','Elétrons ocultos','A camada eletrônica não aparece na cena.',state.electrons?(visible?'Variante A':'Estado atual'):'Modelo não ativado');
   compareCard(grid,'B','Elétrons visíveis','Marcadores qualitativos de elétrons de valência deslocalizados.',state.electrons?(visible?'Estado atual':'Variante B'):'Ative o modelo em Camadas → Modelos');
  }else{
   const active=props?.active,entry=active?SILM.properties.catalog[active]:null,narrative=entry?SILM.properties.narrative(active,props[active],{reduced:false,electronsVisible:!!state.electrons?.representation.visible}):null;
   compareCard(grid,'A','Estado-base','Condição de referência anterior à experiência.',active?'Base conceitual':'Sem experiência ativa');
   compareCard(grid,'B','Resposta atual',entry?entry.title+' · '+(narrative?.observation||'Resposta qualitativa em andamento.'):'Nenhuma propriedade está em estudo.',entry?'Estado atual':'Sem experiência ativa');
  }
  output.append(grid,node('p','Quadro informativo, somente leitura. As cenas A/B lado a lado ainda não estão conectadas; não cria outra amostra nem produz medições.','silm-compare-note'));
 }
 function setupViewers(){
  for(const definition of definitions)B.registerViewer({...definition,render(_snapshot,_records,output){
   if(definition.id!=='observacao-contextual')output.append(node('p',definition.description,'silm-tool-description'));
   if(typeof definition.render==='function'){definition.render(output);return;}
   for(const panel of document.querySelectorAll('[data-silm-viewer]'))panel.hidden=!panel.dataset.silmViewer.split(' ').includes(definition.id);
  }});
  window.addEventListener('si-viewer-family-selected',renderViewers);window.addEventListener('si-viewer-selected',renderViewers);renderViewers();
 }
 function modules(){
  const descriptions={
   explorar:['Monte e observe','Escolha um metal, adicione unidades e organize a estrutura. Explore elétrons e propriedades qualitativas.'],
   medir:['Meça o modelo','Use distância, ângulo, parâmetro de rede e coordenação numa estrutura cristalina válida.'],
   calcular:['Relacione os dados','Calcule contagem de átomos, volume, raio, empacotamento e densidade, identificando a origem dos valores.']
  };
  const host=$('silm-module-cards');
  for(const [index,id]of Object.keys(descriptions).entries()){
   const card=node('details',null,'silm-module-card');card.dataset.module=id;
   const summary=node('summary');summary.append(node('span',String(index+1),'silm-module-number'),node('strong',names[id]));
   const badge=node('span','Ativo','silm-module-badge');badge.hidden=true;summary.append(badge);
   const body=node('div',null,'silm-module-body');body.append(node('h4',descriptions[id][0]),node('p',descriptions[id][1]));
   const activate=node('button','Ativar módulo '+names[id],'button outline');activate.type='button';activate.id='silm-module-activate-'+id;
   activate.addEventListener('click',()=>{const choice=$('silm-module');if(choice.disabled)return;choice.value=id;choice.dispatchEvent(new Event('change',{bubbles:true}));queueMicrotask(()=>$('silm-module')?.focus({preventScroll:true}));});
   body.append(activate);card.append(summary,body);host.append(card);
   card.addEventListener('toggle',()=>{if(card.open)for(const other of host.children)if(other!==card)other.open=false;});
  }
 }
 function showData(id,{focus=true}={}){
  dataPage=id;
  $('silm-data-catalog').hidden=!!id;
  for(const panel of document.querySelectorAll('[data-silm-data-panel]'))panel.hidden=panel.dataset.silmDataPanel!==id;
  const back=$('silm-data-back');back.hidden=!id;
  if(id){$('si-right-title').textContent={tabela:'Dados do metal',registros:'Medições e cálculos',arquivo:'Arquivos da investigação'}[id];if(focus)back.focus({preventScroll:true});}
  else{if($('si-workspace').dataset.rightOpen==='true'&&document.querySelector('[data-open-dock="dados"]').getAttribute('aria-expanded')==='true')$('si-right-title').textContent='Dados';}
  $('si-right-scroll').scrollTop=0;
 }
 function setupData(){
  for(const button of document.querySelectorAll('[data-silm-data-open]'))button.addEventListener('click',()=>showData(button.dataset.silmDataOpen));
  $('silm-data-back').addEventListener('click',()=>{const old=dataPage;showData(null);document.querySelector('[data-silm-data-open="'+old+'"]')?.focus({preventScroll:true});});
  document.querySelector('[data-open-dock="dados"]').addEventListener('click',()=>showData(null,{focus:false}));
  window.addEventListener('si-route-changed',()=>showData(null,{focus:false}));
 }
 function update(){
  if(!ready)return;
  renderViewers();
  applyLayerPresentation();
  const current=model.state.module.active,locked=!!activity()?.lockedModule();
  for(const card of $('silm-module-cards').children){
   const active=card.dataset.module===current;card.classList.toggle('is-active',active);card.querySelector('.silm-module-badge').hidden=!active;
   const button=card.querySelector('button');button.disabled=locked||active;button.setAttribute('aria-pressed',String(active));button.textContent=active?'Módulo '+names[current]+' em uso':'Ativar módulo '+names[card.dataset.module];
  }
  $('silm-module-context').textContent=locked?'O módulo é definido pela atividade em andamento.':'A troca de módulo preserva a investigação e seus registros.';
  {const n=model.state.structure?.units.length||0;$('silm-unit-count').textContent=n+(n===1?' unidade':' unidades')+' na montagem';}
  {const m=model.state.measurements.length,c=model.state.calculations.length;$('silm-record-count').textContent=m+(m===1?' medição':' medições')+' · '+c+(c===1?' cálculo':' cálculos');}
  const active=B.activeViewer();if(active&&document.querySelector('[data-open-dock="ver"]').getAttribute('aria-expanded')==='true'&&!$('si-viewer-detail').hidden)$('si-right-title').textContent=active.title;
  if(dataPage&&document.querySelector('[data-open-dock="dados"]').getAttribute('aria-expanded')==='true')$('si-right-title').textContent={tabela:'Dados do metal',registros:'Medições e cálculos',arquivo:'Arquivos da investigação'}[dataPage];
 }
 // Como no SIAB, os painéis abertos por Ver e Dados se chamam "Investigar" e "Dados da investigação". A Base reescreve o
 // título a cada desenho da doca; o observador troca só esses rótulos genéricos e deixa os títulos de detalhe como estão.
 function titleInvestigar(){const title=$('si-right-title');if(!title)return;const fix=()=>{const label={Ver:'Investigar',Dados:'Dados da investigação'}[title.textContent];if(label)title.textContent=label;};new MutationObserver(fix).observe(title,{childList:true,characterData:true,subtree:true});fix();}
 function init(){modules();setupViewers();setupData();titleInvestigar();ready=true;update();}
 return {init,update};
};
