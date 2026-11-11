'use strict';
/* Liga os componentes científicos SILM à plataforma, sem criar outro estado ou motor. */
SILM.createMetallicExperience=({model,say,schedule,reduced,selectMetal,prepareMetal,allows=()=>true})=>{
 const S=SILM,registry=S.engineAdapters;
 const api=id=>{const binding=registry?.resolve(id);if(!binding?.ok)throw new Error('API SILM indisponível: '+id+' ('+(binding?.reason||'adapter ausente')+').');return binding.api;};
 const P=api('properties.eligibility-catalog'),D=api('deformation.qualitative-slip'),T=api('thermal.qualitative-diffusion'),V=api('drive.stimulus-controller'),Data=api('data.reference-catalog');
 const U=SimCore.ExperienceUI,scope=SimCore.createScope();
 const editable=()=>model.state.module.active==='explorar';
 // 0.17.x: deformação contínua — o mesmo controlador da cena (um por modelo).
 const deform=()=>D?.controller(model,{reducedMotion:reduced})||null;
 const thermal=()=>T?.controller(model,{reducedMotion:reduced})||null;
 const drive=()=>V?.controller(model)||null;
 const change=patch=>{if(!editable())return;const ok=model.setPropertyParams(patch);if(ok)schedule();return ok;};
 // A simulação por intervalos pertence à investigação em Explorar. A câmera só lê o último campo calculado.
 let coupled=null;
 function stopJouleClock(session=coupled){
  if(!session)return;
  if(session.timer){clearTimeout(session.timer);session.timer=null;}
  session.playing=false;
 }
 function discardJoule(){stopJouleClock();coupled=null;}
 function startJouleClock(session){
  if(!session?.playing||session.timer)return;
  // A evolução usa o mesmo avanço .5 do motor eletrotérmico, sem inventar
  // um segundo relógio. Aba oculta não avança tempo silenciosamente.
  session.timer=setTimeout(()=>{
   session.timer=null;
   if(currentCoupling()!==session||!editable()){stopJouleClock(session);schedule();return;}
   if(!document.hidden&&!jouleAction('step')){stopJouleClock(session);schedule();return;}
   startJouleClock(session);
  },850);
 }
 function currentCoupling(state=model.state){
  if(!coupled)return null;
  if(state.properties.active!=='electrical'||coupled.id!==state.investigation?.id||coupled.start!==state.properties.startedAt){
   discardJoule();return null;
  }
  return coupled;
 }
 function jouleReading(state=model.state){
  const session=currentCoupling(state);if(!session||state.module.active!=='explorar')return null;
  const on=state.properties.electrical.field,level=on?drive().intensity:0;
  const key=[session.mode,session.boundary,level,session.external,session.layer].join('|');
  if(session.cache?.key===key)return session.cache;
  const input={mode:session.mode,boundary:session.boundary,level,external:session.external},values=session.run.observe(input,true);
  if(!values)return null;
  session.cache={key,input,values,layer:session.layer,field:values.profiles.temperature,playing:session.playing};
  return session.cache;
 }
 function beginJoule(){
  const st=model.state;
  if(!editable()||!allows('electrical')||!allows('thermal')||!model.propertyAvailability('electrical').ok||!model.propertyAvailability('thermal').ok)return false;
  if(currentCoupling(st))return true;
  const element=Data.get(st.metal.atomicNumber),net=S.electrothermal.buildNetwork(S.crystal.geometry(element)),run=S.electrothermal.createRun(net);
  if(!run){say('Esta geometria ainda não tem uma malha de ensaio validada para o efeito Joule.','warning');return false;}
  if(st.properties.active!=='electrical'&&!toggleProperty('electrical',{skipCombination:true}))return false;
  const t=thermal();t?.sync();t?.setHeating(false);t?.reset();
  if(!model.state.properties.electrical.field&&!change({field:true}))return false;
  coupled={id:st.investigation.id,start:model.state.properties.startedAt,mode:'voltage',boundary:'ambient',external:false,layer:'temperature',run,net,playing:!reduced(),timer:null};
  // A corrente começa a dissipar calor no mesmo instante em que a combinação
  // é ativada. Preferência de movimento reduzido inicia pausada.
  if(coupled.playing)startJouleClock(coupled);
  schedule();return true;
 }
 function jouleAction(command,origin=null){
  const session=currentCoupling();if(!session||!editable())return false;
  if(command==='readings')return showJouleReadings(origin);
  if(command==='restore'){actions.restore();return true;}
  if(command==='end'){discardJoule();schedule();return true;}
  if(command==='play'||command==='pause'){
   session.playing=command==='play';session.cache=null;
   if(session.playing)startJouleClock(session);else stopJouleClock(session);
   schedule();return true;
  }
  if(command==='step'){
   const frame=jouleReading();
   if(!frame||!session.run.advance(frame.input,.5)){say('Intervalo recusado pelo limite do modelo didático. Reduza o estímulo ou altere o contorno térmico.','warning');return false;}
   session.cache=null;
  }else if(command==='external')session.external=!session.external;
  else if(command==='supply')return change({field:!model.state.properties.electrical.field});
  else if(['voltage','current'].includes(command))session.mode=command;
  else if(['ambient','insulated'].includes(command))session.boundary=command;
  else if(['temperature','potential','dissipation'].includes(command))session.layer=command;
  else return false;
  schedule();return true;
 }
 function showJouleReadings(origin){
  const frame=jouleReading();if(!frame)return false;
  const {input,values}=frame,format=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:5});
  const previous=origin||document.activeElement,dialog=U.element('dialog',null,'silm-dialog silm-about-dialog silm-joule-dialog');
  dialog.setAttribute('aria-labelledby','silm-joule-results-title');
  const heading=U.element('div',null,'silm-dialog-heading'),title=U.element('h2','Leituras do efeito Joule');title.id='silm-joule-results-title';
  const close=U.element('button','Fechar leituras','silm-dialog-close');close.type='button';close.setAttribute('aria-label','Fechar leituras do efeito Joule');
  close.addEventListener('click',()=>dialog.close());heading.append(title,close);
  const conditions=U.element('p',(input.mode==='voltage'?'Tensão imposta':'Corrente imposta')+' · '+(input.boundary==='ambient'?'terminais à temperatura ambiente':'amostra isolada'));
  const data=U.element('dl',null,'silm-joule-readings');
  for(const [key,label]of [['time','Tempo'],['voltage','Tensão'],['current','Corrente'],['resistance','Resistência equivalente'],['power','Potência Joule'],['external','Potência externa'],['mean','Temperatura média'],['maximum','Temperatura máxima'],['jouleEnergy','Energia gerada por Joule'],['externalEnergy','Energia da fonte externa'],['storedEnergy','Energia armazenada'],['removedEnergy','Energia removida']]){
   const value=U.element('dd',format(values[key]));value.dataset.quantity=key;data.append(U.element('dt',label),value);
  }
  const note=U.element('p','Grandezas relativas · ensaio temporário. Parâmetros didáticos iguais entre metais; sem comparação quantitativa.');
  dialog.append(heading,conditions,data,note);document.body.append(dialog);
  dialog.addEventListener('close',()=>{dialog.remove();if(previous?.isConnected)previous.focus({preventScroll:true});},{once:true});
  dialog.showModal();return true;
 }
 const actions={
  start(id){if(!allows(id)||!editable())return;const r=model.startProperty(id);if(!r.ok)say(P.reasons[r.reason]||'Organize uma estrutura cristalina para esta experiência.','warning');schedule();},
  // Deformação + corrente: na maleabilidade e na ductilidade, o campo é transitório (SILM.drive), sem gravar.
  // Ligar o campo mostra os elétrons, se estiverem ocultos (como ao iniciar a condutividade elétrica).
  field(){const st=model.state,id=st.properties.active;if(id==='malleability'||id==='ductility'){const d=drive();if(d&&editable()){const on=!d.deformField;if(on&&!st.electrons?.representation.visible)model.activateElectrons?.();d.setDeformField(on);schedule();}return;}return change({field:!model.state.properties.electrical.field});},
  // Calor + corrente: na condutividade elétrica, a fonte de calor é transitória (controlador térmico, sem gravar).
  heat(){if(currentCoupling())return jouleAction('external');if(model.state.properties.active==='electrical'){const t=thermal();if(t&&editable()){t.setHeating(!t.reading().on);schedule();}return;}return change({heating:!model.state.properties.thermal.heating});},
  advance(){if(currentCoupling())return jouleAction('step');const p=model.state.properties.thermal;if(p.heating&&p.stage<P.limits.heatStages)return change({stage:p.stage+1});},
  compress(){if(!editable())return;const c=deform();if(c){const ok=c.pulse();schedule();return ok;}const p=model.state.properties.malleability;if(p.compression<P.limits.compression)return change({compression:p.compression+1});},
  stretch(){if(!editable())return;const c=deform();if(c){const ok=c.pulse();schedule();return ok;}const p=model.state.properties.ductility;if(p.elongation<P.limits.elongation)return change({elongation:p.elongation+1});},

  light:()=>change({light:!model.state.properties.luster.light}),
  restore(){const session=currentCoupling();if(session){stopJouleClock(session);session.run=S.electrothermal.createRun(session.net);session.external=false;session.cache=null;model.restoreProperty();schedule();return;}discardJoule();deform()?.setLoad(0);drive()?.setDeformField(false);model.restoreProperty();const t=thermal();if(t){t.setHeating(false);t.reset();}schedule();},end(){discardJoule();deform()?.setLoad(0);model.endProperty();schedule();}
 };
 function propertyState(id){
  const st=model.state,primary=st.properties.active;
  if(primary===id)return {active:true,combined:false};
  if(id==='electrical'&&(primary==='malleability'||primary==='ductility')){
   const active=!!drive()?.reading()?.deformField;
   return {active,combined:active};
  }
  if(id==='thermal'&&primary==='electrical'){
   const active=!!currentCoupling(st)||!!thermal()?.reading()?.on;
   return {active,combined:active};
  }
  return {active:false,combined:false};
 }
 function toggleElectrons(){
  if(!editable())return false;
  const current=model.state.electrons;
  if(current?.representation.visible&&current.representation.motion){
   model.setElectronRepresentation({visible:false,motion:false});
  }else{
   const activated=current?{ok:true}:model.activateElectrons();
   if(activated===false||activated?.ok===false){say('Não foi possível ativar o modelo eletrônico.','warning');return false;}
   model.setElectronRepresentation({visible:true,motion:true});
  }
  schedule();return true;
 }
 function toggleProperty(id,{skipCombination=false}={}){
  if(!editable()||!allows(id))return false;
  const current=model.state.properties.active;
  // Joule não é uma propriedade extra: surge ao combinar elétrica+térmica
  // na mesma investigação, por clique comum, multisseleção ou toque.
  if(!skipCombination&&((current==='electrical'&&id==='thermal')||(current==='thermal'&&id==='electrical'))){
   if(currentCoupling()&&id==='thermal'){discardJoule();schedule();return true;}
   return beginJoule();
  }
  if(current===id){actions.restore();actions.end();return true;}
  const availability=model.propertyAvailability(id);
  if(!availability.ok){say(P.reasons[availability.reason]||'Esta experiência não está disponível nesta estrutura.','warning');return false;}
  if(current){actions.restore();actions.end();}
  const started=model.startProperty(id);
  if(!started.ok){say(P.reasons[started.reason]||'Não foi possível iniciar esta experiência.','warning');schedule();return false;}
  if(id==='electrical'){
   if(model.state.electrons)model.setElectronRepresentation({visible:true,motion:true});
   actions.field();
  }else if(id==='thermal')actions.heat();
  else if(id==='luster')actions.light();
  // Maleabilidade e ductilidade ativam o atuador correspondente na cena; a carga é aplicada pelo gesto do usuário.
  schedule();return true;
 }
 function activateCombination(kind){
  if(!editable())return false;
  if(kind==='joule')return beginJoule();
  const target={heatElectrical:'electrical',malleabilityElectrical:'malleability',ductilityElectrical:'ductility'}[kind];
  if(!target||!allows(target))return false;
  if(currentCoupling())discardJoule();
  const state=model.state,starting=state.properties.active!==target;
  const alreadyCombined=!starting&&(kind==='heatElectrical'
   ?!!state.properties.electrical.field&&!!thermal()?.reading().on
   :!!drive()?.reading().deformField);
  if(starting&&!toggleProperty(target))return false;
  // Ao trocar a experiência, sincroniza primeiro a chave transitória dos controladores.
  // Só depois liga o efeito complementar, para que o primeiro render não o interprete como resíduo antigo.
  if(starting){
   if(kind==='heatElectrical')thermal()?.sync();
   else drive()?.sync();
  }
  // P7: calor + corrente (fonte transitória) ou deformação + corrente (campo transitório).
  if(kind==='heatElectrical'){
   if(model.state.structure?.mode!=='crystalline')return false;
   if(alreadyCombined)actions.heat();
   else{
    if(!model.state.properties.electrical.field)actions.field();
    if(!thermal()?.reading().on)actions.heat();
   }
  }else{
   const able=model.propertyAvailability(target);
   if(!able.ok||model.state.structure?.mode!=='crystalline')return false;
   if(alreadyCombined)actions.field();
   else if(!drive()?.reading().deformField)actions.field();
  }
  schedule();return true;
 }
 const quickActions=Object.freeze({beginJoule,jouleAction,toggleElectrons,toggleProperty,activateCombination,propertyState});
 // Uma leitura do estado por atualização (model.state devolve uma cópia completa).
 const info=()=>{const st=model.state;return {joule:jouleReading(st),deformation:deform()?.reading()||null,thermal:thermal()?.reading()||null,drive:drive()?.reading()||null,state:st,eligibility:P.eligibility(st.metal?Data.get(st.metal.atomicNumber):null),editable:st.module.active==='explorar',reduced:reduced(),availability(id){const r=model.propertyAvailability(id);return {ok:r.ok&&allows(id),message:P.reasons[r.reason]||'Prepare a estrutura para esta experiência.'};}};};
 const controls=S.createPropertyControls(document.getElementById('silm-properties'),{scope,info,actions,prefix:'silm-panel-property'});
 // Painel: até 10 atualizações por segundo durante a animação (a cena atualiza a cada quadro).
 {const c=deform();let lastPanel=0,pending=0;const run=()=>{pending=0;lastPanel=performance.now();controls.update();};
  const tick=()=>{if(performance.now()-lastPanel>=100)run();else if(!pending)pending=setTimeout(run,100);};
  if(c)scope.cleanup(c.subscribe(tick));const t=thermal();if(t)scope.cleanup(t.subscribe(tick));const dv=drive();if(dv)scope.cleanup(dv.subscribe(tick));}
 const scene={quickActions,jouleReading,
  canStudy:id=>editable()&&allows(id)&&model.propertyAvailability(id).ok,
  advanceHeat:actions.advance,toggleHeat:()=>actions.heat(),toggleLight:()=>actions.light(),controls:(host,viewScope)=>S.createPropertyControls(host,{scope:viewScope,info,actions,prefix:'silm-scene-property',compact:true})};
 const dialog=document.getElementById('silm-periodic-dialog'),body=document.getElementById('silm-periodic-body'),trigger=document.getElementById('silm-open-periodic');let tableScope;
 trigger.addEventListener('click',()=>{
  tableScope?.destroy();tableScope=SimCore.createScope();body.replaceChildren();
  const periodicTable=S.createPeriodicTable(body,{scope:tableScope,state:{selection:Number(document.getElementById('silm-metal').value)||29,query:''},onSelect:e=>prepareMetal(e.atomicNumber),onInvestigate:async e=>{dialog.close();await selectMetal(e.atomicNumber);},onExplore:e=>{prepareMetal(e.atomicNumber);dialog.close();},onSources:e=>{const text=Data.sourceIds(e).map(id=>{const s=Data.source(id);return s?s.institution+' — '+s.title:id;}).join('\n');document.getElementById('silm-periodic-sources').textContent=text;}});
  document.getElementById('silm-periodic-sources').textContent='';dialog.showModal();
  // No WebKit, a medida do conteúdo modal estabiliza após sua abertura.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(dialog.open)periodicTable.resize();}));
 });
 document.getElementById('silm-close-periodic').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{tableScope?.destroy();trigger.focus({preventScroll:true});});
 return {scene,quickActions,info,update(){controls.update();for(const id of P.ids){const b=document.getElementById('silm-panel-property-start-'+id);b.parentElement.hidden=!allows(id);}document.getElementById('silm-properties').hidden=!model.state.metal;document.getElementById('silm-property-caption').textContent=currentCoupling()?'Modelo didático em unidades relativas; parâmetros iguais entre metais, sem comparação quantitativa.':model.state.properties.active?P.catalog[model.state.properties.active].limitation:'As experiências qualitativas são distintas dos dados tabelados do metal.';}};
};
SILM.renderIntegrationMetalData=(host,e,state)=>{
 const S=SILM,el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const row=(dl,label,text)=>{dl.append(el('dt',label),el('dd',text));};
 const registry=S.engineAdapters,Data=registry.resolve('data.reference-catalog').api,Calculations=registry.resolve('calculation.formula-service').api,Properties=registry.resolve('properties.eligibility-catalog').api;
 const structure=Data.structure(e),dl=el('dl');
 row(dl,'Metal',e.name+' ('+e.symbol+') · Z = '+e.atomicNumber);
 row(dl,'Estrutura de referência',structure?.label||structure?.type||'Não homologada');
 row(dl,'Massa molar',(Calculations.tabulated(e,'M')?.display||'Sem massa molar homologada'));
 row(dl,'Configuração eletrônica do átomo isolado',e.electronConfiguration.display+' · Dado tabelado');
 row(dl,'Modelo de valência',e.valenceModel.display+' · '+e.valenceModel.convention);
 row(dl,'Unidades na cena',String(state.structure?.units.length||0));
 for(const [key,p]of Object.entries(structure?.latticeParameters||{}))if(p&&p.value!==null)row(dl,'Parâmetro '+key,(p.display??p.value)+' '+(p.unit||'')+' · Dado tabelado');
 const condition=structure?.conditions;
 for(const [key,label]of [['temperature','Temperatura de referência'],['pressure','Pressão de referência'],['phase','Fase de referência']]){const d=condition?.[key];if(d)row(dl,label,d.display||String(d.value)+' '+(d.unit||''));}
 host.append(dl);
 const heading=el('h3','Propriedades do metal');host.append(heading);
 for(const id of Properties.ids){const ref=Properties.data(e,id),p=el('p');p.textContent=Properties.catalog[id].title+': '+(ref?(ref.display??ref.value)+' '+ref.unit+' · '+(ref.kind==='CALCULATED'?'Calculado pelo SILM':'Dado tabelado'):(['electrical','thermal'].includes(id)?'Sem valor numérico homologado; experiência qualitativa conforme elegibilidade.':'Experiência qualitativa; não representa uma medida numérica da amostra.'));host.append(p);}
 const sources=el('details');sources.append(el('summary','Fontes e condições'));
 for(const id of Data.sourceIds(e)){const s=Data.source(id);if(!s)continue;const p=el('p',s.institution+' — '+s.title+(s.year?' ('+s.year+')':''));if(s.url){const a=el('a','Consultar fonte');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';p.append(document.createTextNode(' · '),a);}sources.append(p);}
 if(condition?.notes)sources.append(el('p',condition.notes));host.append(sources);
};
