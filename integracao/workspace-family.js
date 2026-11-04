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
  {id:'observacao',title:'Observar',capability:'tools',family:'observar',description:'Exibição da cena, modelos, experiências e comparações da mesma investigação.',render:output=>renderObserverSummary(output)},
  {id:'instrumentos',title:'Instrumentos de medição',capability:'measure',family:'medir',description:'Selecione instrumentos e registre medidas do modelo cristalográfico.'},
  {id:'calculos',title:'Cálculos cristalográficos',capability:'analyze',family:'calcular',description:'Aplique fórmulas aos dados da mesma estrutura e registre a proveniência.'}
 ];;
 let ready=false,dataPage=null;
 let comparisonSelection='cell-lattice';
 function renderViewers(){
  const focused=document.activeElement;
  const tab=focused?.closest('#si-viewer-families')?focused.getAttribute('aria-selected'):null;
  B.renderViewers(emptyScene());
  const observer=model.state.module.active==='explorar';
  $('si-viewer-catalog')?.classList.toggle('silm-unified-observer',observer);
  $('silm-observer-workspace').hidden=!observer;
  if(tab)$('si-viewer-families').querySelector('[aria-selected="true"]')?.focus({preventScroll:true});
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
  const state=model.state,s=state.structure,crystal=s?.mode==='crystalline',rep=crystal?s.crystallography.representation:null,group=node('div',null,'silm-observer-state-line');
  const view=crystal?(rep.view==='cell'?'Célula':'Rede'):'Montagem livre';
  const details=crystal?'Célula unitária '+(rep.unitCell?'visível':'oculta')+' · vizinhos '+(rep.neighbors?'visíveis':'ocultos'):'Sem célula unitária ou escala cristalográfica.';
  group.append(node('span',view,'silm-observer-state-primary'),node('span',details,'silm-observer-state-secondary'));
  output.append(group);
 }
 function renderLayerModels(output){
  const el=model.state.electrons,visible=!!el?.representation.visible,motion=!!el?.representation.motion;
  output.append(node('p',!el?'Modelo eletrônico ainda não ativado.':visible?(motion?'Elétrons visíveis · movimento ativo':'Elétrons visíveis · estáticos'):'Modelo ativo · marcadores ocultos','silm-observer-state-line'));
 }
 function iconAction(output,{id,label,path,pressed=false,disabled=false,activate}){
  const b=node('button',null,'silm-observer-icon-action');b.type='button';b.dataset.action=id;b.disabled=!!disabled;
  b.setAttribute('aria-label',label);b.title=label;b.setAttribute('aria-pressed',String(pressed));
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  for(const d of path){const shape=document.createElementNS(svg.namespaceURI,'path');shape.setAttribute('d',d);svg.append(shape);}
  b.append(svg,node('span',label,'silm-observer-icon-label'));b.addEventListener('click',activate);output.append(b);return b;
 }
 function renderLayerIndications(output){
  const group=node('div',null,'silm-observer-action-grid');group.setAttribute('role','group');group.setAttribute('aria-label','Camadas de apresentação');
  iconAction(group,{id:'centers',label:'Destacar centros',path:['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z','M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],pressed:layerState.centers,activate:()=>layerChanged('centers',!layerState.centers)});
  iconAction(group,{id:'property',label:'Indicações da propriedade',path:['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z','M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],pressed:layerState.property,activate:()=>layerChanged('property',!layerState.property)});
  iconAction(group,{id:'labels',label:'Rótulos',path:['M4 5h16','M4 12h12','M4 19h8'],pressed:layerState.labels,activate:()=>layerChanged('labels',!layerState.labels)});
  iconAction(group,{id:'legend',label:'Legendas e notas',path:['M5 4h14v16H5z','M8 8h8','M8 12h8','M8 16h5'],pressed:layerState.legend,activate:()=>layerChanged('legend',!layerState.legend)});
  output.append(group,node('p','Esses comandos alteram somente o que aparece na cena. Não ativam nem encerram experiências.','silm-layer-note'));
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
 function renderObserverComparisons(){
  const actions=$('silm-observer-comparison-actions'),content=$('silm-observer-comparison-content');
  if(!actions||!content)return;actions.replaceChildren();content.replaceChildren();
  const state=model.state,s=state.structure,hasFree=!!(s?.mode==='crystalline'&&Array.isArray(s.crystallography.freeUnits));
  const choices=[
   {id:'free-crystal',label:'Montagem × cristalina',enabled:hasFree},
   {id:'cell-lattice',label:'Célula × rede',enabled:s?.mode==='crystalline'},
   {id:'electrons',label:'Elétrons',enabled:!!state.electrons},
   {id:'property',label:'Propriedade',enabled:!!state.properties?.active}
  ];
  if(!choices.some(x=>x.id===comparisonSelection&&x.enabled))comparisonSelection=choices.find(x=>x.enabled)?.id||'cell-lattice';
  const group=node('div',null,'silm-observer-comparison-options');group.setAttribute('role','group');group.setAttribute('aria-label','Comparações disponíveis');
  for(const choice of choices){
   const b=node('button',choice.label,'silm-observer-compare-choice');b.type='button';b.disabled=!choice.enabled;b.setAttribute('aria-pressed',String(choice.id===comparisonSelection));
   b.addEventListener('click',()=>{comparisonSelection=choice.id;renderObserverComparisons();});group.append(b);
  }
  actions.append(group);
  if(choices.some(x=>x.id===comparisonSelection&&x.enabled))renderComparison(comparisonSelection,content);
  else content.append(node('p','As comparações ficam disponíveis conforme a estrutura, o modelo eletrônico e a experiência em estudo.','silm-compare-note'));
 }
 function renderObserverSummary(output){
  const state=model.state,e=state.metal?SILM.data.get(state.metal.atomicNumber):null,s=state.structure;
  const summary=node('div',null,'silm-observer-summary');
  const headline=node('p',e?e.name+' ('+e.symbol+')':'Nenhum metal selecionado','silm-observer-summary-title');
  const detail=node('p',!s?'Investigação sem montagem':s.mode==='crystalline'?SILM.crystal.label(s.crystallography.structureType,e)+' · '+s.units.length+' unidades':'Montagem livre · '+s.units.length+' unidades','silm-observer-summary-detail');
  summary.append(headline,detail);output.append(summary);
  const display=$('silm-observer-display-actions');display?.replaceChildren();
  if(display){renderLayerStructure(display);renderLayerIndications(display);}
  const electrons=$('silm-observer-electron-state');electrons?.replaceChildren();if(electrons)renderLayerModels(electrons);
  renderObserverComparisons();
 }
  function setupViewers(){
  for(const definition of definitions)B.registerViewer({...definition,render(_snapshot,_records,output){
   const observer=definition.id==='observacao';
   $('silm-observer-workspace').hidden=!observer;
   for(const panel of document.querySelectorAll('[data-silm-viewer]')){
    const ids=panel.dataset.silmViewer.split(' ');
    panel.hidden=observer?!['estrutura','eletrons','propriedades'].some(id=>ids.includes(id)):!ids.includes(definition.id);
   }
   if(!observer)output.append(node('p',definition.description,'silm-tool-description'));
   if(typeof definition.render==='function'){definition.render(output);return;}
  }});
  window.addEventListener('si-viewer-family-selected',renderViewers);window.addEventListener('si-viewer-selected',renderViewers);renderViewers();
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
  {const n=model.state.structure?.units.length||0;$('silm-unit-count').textContent=n+(n===1?' unidade':' unidades')+' na montagem';}
  {const m=model.state.measurements.length,c=model.state.calculations.length;$('silm-record-count').textContent=m+(m===1?' medição':' medições')+' · '+c+(c===1?' cálculo':' cálculos');}
  const active=B.activeViewer();if(active&&document.querySelector('[data-open-dock="ver"]').getAttribute('aria-expanded')==='true'&&!$('si-viewer-detail').hidden)$('si-right-title').textContent=active.title;
  if(dataPage&&document.querySelector('[data-open-dock="dados"]').getAttribute('aria-expanded')==='true')$('si-right-title').textContent={tabela:'Dados do metal',registros:'Medições e cálculos',arquivo:'Arquivos da investigação'}[dataPage];
 }
 // Como no SIAB, os painéis abertos por Ver e Dados se chamam "Investigar" e "Dados da investigação". A Base reescreve o
 // título a cada desenho da doca; o observador troca só esses rótulos genéricos e deixa os títulos de detalhe como estão.
 function titleInvestigar(){const title=$('si-right-title');if(!title)return;const fix=()=>{const label={Ver:'Investigar',Dados:'Dados da investigação'}[title.textContent];if(label)title.textContent=label;};new MutationObserver(fix).observe(title,{childList:true,characterData:true,subtree:true});fix();}
 function init(){setupViewers();setupData();titleInvestigar();ready=true;update();}
 return {init,update};
};
