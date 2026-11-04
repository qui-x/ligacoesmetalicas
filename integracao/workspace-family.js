'use strict';
/* Adaptação do workspace pela API pública da Base SI. A ciência continua no modelo SILM. */
SILM.createWorkspaceFamily=({model,activity=()=>null,quickActions=null})=>{
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
 const actionIcons={
  view:'M3 7 12 3l9 4-9 4-9-4ZM3 12l9 4 9-4M3 17l9 4 9-4',
  cell:'M4 4h16v16H4zM4 9h16M9 4v16',
  neighbors:'M6 12a2 2 0 1 0 0-.01M18 6a2 2 0 1 0 0-.01M18 18a2 2 0 1 0 0-.01M8 11l8-4M8 13l8 4',
  electrons:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM7 12h10M12 7v10M12 12l5-5',
  electrical:'M13 2 4 14h7l-1 8 10-13h-7z',
  thermal:'M14 14.8V5a2 2 0 0 0-4 0v9.8a5 5 0 1 0 4 0ZM12 11v7',
  malleability:'M4 8h16M4 16h16M8 4l-4 4 4 4M16 12l4 4-4 4',
  ductility:'M4 8h16M4 16h16M8 4 4 8l4 4M16 12l4 4-4 4',
  luster:'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0'
 };
 function actionButton(parent,{id,label,path,pressed=false,disabled=false,reason='',onClick}){
  const button=node('button',null,'silm-observer-action');
  button.type='button';button.dataset.action=id;button.disabled=!!disabled;
  button.setAttribute('aria-label',label);button.title=reason?label+' — '+reason:label;
  button.setAttribute('aria-pressed',String(!!pressed));
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
  svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  const shape=document.createElementNS('http://www.w3.org/2000/svg','path');shape.setAttribute('d',path);svg.append(shape);
  button.append(svg,node('span',label,'silm-observer-action-label'));
  button.addEventListener('click',onClick);parent.append(button);return button;
 }
 function actionGroup(parent,title){
  const section=node('section',null,'silm-observer-action-group');
  section.append(node('h3',title,'silm-observer-action-heading'));
  const grid=node('div',null,'silm-observer-action-grid');section.append(grid);parent.append(section);return grid;
 }
 function renderObserverContext(output){
  const state=model.state,structure=state.structure,crystal=structure?.mode==='crystalline';
  const rep=crystal?structure.crystallography.representation:null,element=state.metal?SILM.data.get(state.metal.atomicNumber):null;
  const root=node('section',null,'silm-observer-actions');
  const structureActions=actionGroup(root,'Estrutura');
  const canExplore=state.module.active==='explorar'&&!activity()?.lockedModule?.();
  actionButton(structureActions,{id:'view-toggle',label:crystal?(rep.view==='cell'?'Mostrar rede':'Mostrar célula'):'Célula / rede',path:actionIcons.view,pressed:crystal&&rep.view==='lattice',disabled:!crystal||!canExplore,onClick:()=>{
   if(!crystal)return;model.setCrystalRepresentation({view:rep.view==='cell'?'lattice':'cell'});renderViewers();
  }});
  actionButton(structureActions,{id:'unit-cell',label:rep?.unitCell?'Ocultar célula unitária':'Mostrar célula unitária',path:actionIcons.cell,pressed:!!rep?.unitCell,disabled:!crystal||!canExplore,onClick:()=>{
   if(rep)model.setCrystalRepresentation({unitCell:!rep.unitCell});renderViewers();
  }});
  actionButton(structureActions,{id:'neighbors',label:rep?.neighbors?'Ocultar vizinhos':'Mostrar vizinhos',path:actionIcons.neighbors,pressed:!!rep?.neighbors,disabled:!crystal||!canExplore,onClick:()=>{
   if(rep)model.setCrystalRepresentation({neighbors:!rep.neighbors});renderViewers();
  }});
  const modelActions=actionGroup(root,'Modelos');
  const electrons=state.electrons,minimum=SILM.electronModel?.minUnits||2;
  const electronsActive=!!electrons?.representation.visible&&!!electrons?.representation.motion;
  actionButton(modelActions,{id:'electrons',label:electronsActive?'Ocultar elétrons e pausar movimento':'Mostrar elétrons e ativar movimento',path:actionIcons.electrons,pressed:electronsActive,disabled:!canExplore||(!electrons&&(!structure||structure.units.length<minimum)),reason:!structure?'Monte uma estrutura primeiro':!electrons&&structure.units.length<minimum?'São necessárias '+minimum+' unidades': '',onClick:()=>{
   quickActions?.toggleElectrons?.();renderViewers();
  }});
  const propertyActions=actionGroup(root,'Propriedades metálicas');
  const propertyInfo=[
   ['electrical','Condutividade elétrica',actionIcons.electrical],
   ['thermal','Condutividade térmica',actionIcons.thermal],
   ['malleability','Maleabilidade',actionIcons.malleability],
   ['ductility','Ductilidade',actionIcons.ductility],
   ['luster','Brilho metálico',actionIcons.luster]
  ];
  for(const [id,label,path]of propertyInfo){
   const active=state.properties?.active===id,availability=element?model.propertyAvailability(id):{ok:false,reason:'NO_STRUCTURE'};
   const why=availability.ok?'':SILM.properties.reasons[availability.reason]||'Prepare a estrutura para esta experiência.';
   actionButton(propertyActions,{id:'property-'+id,label, path,pressed:active,disabled:!canExplore||(!active&&!availability.ok),reason:why,onClick:()=>{
    quickActions?.toggleProperty?.(id);renderViewers();
   }});
  }
  if(!structure)root.append(node('p','As ações ficam disponíveis conforme a estrutura é preparada.','silm-observer-action-note'));
  output.append(root);
 }
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
