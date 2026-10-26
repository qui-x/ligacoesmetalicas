'use strict';
/* Liga os componentes científicos SILM à plataforma, sem criar outro estado ou motor. */
SILM.createMetallicExperience=({model,say,schedule,reduced,selectMetal,prepareMetal,allows=()=>true})=>{
 const S=SILM,P=S.properties,U=SimCore.ExperienceUI,scope=SimCore.createScope();
 const editable=()=>model.state.module.active==='explorar';
 const change=patch=>{if(!editable())return;const ok=model.setPropertyParams(patch);if(ok)schedule();return ok;};
 const actions={
  start(id){if(!allows(id)||!editable())return;const r=model.startProperty(id);if(!r.ok)say(P.reasons[r.reason]||'Organize uma estrutura cristalina para esta experiência.','warning');schedule();},
  field:()=>change({field:!model.state.properties.electrical.field}),
  heat:()=>change({heating:!model.state.properties.thermal.heating}),
  advance(){const p=model.state.properties.thermal;if(p.heating&&p.stage<P.limits.heatStages)return change({stage:p.stage+1});},
  compress(){const p=model.state.properties.malleability;if(p.compression<P.limits.compression)return change({compression:p.compression+1});},
  stretch(){const p=model.state.properties.ductility;if(p.elongation<P.limits.elongation)return change({elongation:p.elongation+1});},
  light:()=>change({light:!model.state.properties.luster.light}),
  restore(){model.restoreProperty();schedule();},end(){model.endProperty();schedule();}
 };
 const info=()=>({state:model.state,eligibility:P.eligibility(model.state.metal?S.data.get(model.state.metal.atomicNumber):null),editable:editable(),reduced:reduced(),availability(id){const r=model.propertyAvailability(id);return {ok:r.ok&&allows(id),message:P.reasons[r.reason]||'Prepare a estrutura para esta experiência.'};}});
 const controls=S.createPropertyControls(document.getElementById('silm-properties'),{scope,info,actions,prefix:'silm-panel-property'});
 const scene={advanceHeat:actions.advance,controls:(host,viewScope)=>S.createPropertyControls(host,{scope:viewScope,info,actions,prefix:'silm-scene-property',compact:true})};
 const dialog=document.getElementById('silm-periodic-dialog'),body=document.getElementById('silm-periodic-body'),trigger=document.getElementById('silm-open-periodic');let tableScope;
 trigger.addEventListener('click',()=>{
  tableScope?.destroy();tableScope=SimCore.createScope();body.replaceChildren();
  S.createPeriodicTable(body,{scope:tableScope,state:{selection:Number(document.getElementById('silm-metal').value)||29,query:''},onSelect:e=>prepareMetal(e.atomicNumber),onInvestigate:async e=>{dialog.close();await selectMetal(e.atomicNumber);},onSources:e=>{const text=S.data.sourceIds(e).map(id=>{const s=S.data.source(id);return s?s.institution+' — '+s.title:id;}).join('\n');document.getElementById('silm-periodic-sources').textContent=text;}});
  document.getElementById('silm-periodic-sources').textContent='';dialog.showModal();
 });
 document.getElementById('silm-close-periodic').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{tableScope?.destroy();trigger.focus({preventScroll:true});});
 return {scene,update(){controls.update();for(const id of P.ids){const b=document.getElementById('silm-panel-property-start-'+id);b.parentElement.hidden=!allows(id);}document.getElementById('silm-properties').hidden=!model.state.metal;document.getElementById('silm-property-caption').textContent=model.state.properties.active?P.catalog[model.state.properties.active].limitation:'As experiências qualitativas são distintas dos dados tabelados do metal.';}};
};
SILM.renderIntegrationMetalData=(host,e,state)=>{
 const S=SILM,el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const row=(dl,label,text)=>{dl.append(el('dt',label),el('dd',text));};
 const structure=S.data.structure(e),dl=el('dl');
 row(dl,'Metal',e.name+' ('+e.symbol+') · Z = '+e.atomicNumber);
 row(dl,'Estrutura de referência',structure?.label||structure?.type||'Não homologada');
 row(dl,'Massa molar',(S.calculation.tabulated(e,'M')?.display||'Sem massa molar homologada'));
 row(dl,'Configuração eletrônica do átomo isolado',e.electronConfiguration.display+' · Dado tabelado');
 row(dl,'Modelo de valência',e.valenceModel.display+' · '+e.valenceModel.convention);
 row(dl,'Unidades na cena',String(state.structure?.units.length||0));
 for(const [key,p]of Object.entries(structure?.latticeParameters||{}))if(p&&p.value!==null)row(dl,'Parâmetro '+key,(p.display??p.value)+' '+(p.unit||'')+' · Dado tabelado');
 const condition=structure?.conditions;
 for(const [key,label]of [['temperature','Temperatura de referência'],['pressure','Pressão de referência'],['phase','Fase de referência']]){const d=condition?.[key];if(d)row(dl,label,d.display||String(d.value)+' '+(d.unit||''));}
 host.append(dl);
 const heading=el('h3','Propriedades do metal');host.append(heading);
 for(const id of S.properties.ids){const ref=S.properties.data(e,id),p=el('p');p.textContent=S.properties.catalog[id].title+': '+(ref?(ref.display??ref.value)+' '+ref.unit+' · '+(ref.kind==='CALCULATED'?'Calculado pelo SILM':'Dado tabelado'):(['electrical','thermal'].includes(id)?'Sem valor numérico homologado; experiência qualitativa conforme elegibilidade.':'Experiência qualitativa; não representa uma medida numérica da amostra.'));host.append(p);}
 const sources=el('details');sources.append(el('summary','Fontes e condições'));
 for(const id of S.data.sourceIds(e)){const s=S.data.source(id);if(!s)continue;const p=el('p',s.institution+' — '+s.title+(s.year?' ('+s.year+')':''));if(s.url){const a=el('a','Consultar fonte');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';p.append(document.createTextNode(' · '),a);}sources.append(p);}
 if(condition?.notes)sources.append(el('p',condition.notes));host.append(sources);
};
