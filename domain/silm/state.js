'use strict';
window.SILM=window.SILM||{};
/* Contrato formal. Somente este serviço escreve o estado; consumidores recebem cópias.
   Schema 1: seleção provisória (0.2.1). Schema 2: investigação (0.3.0). Schema 3: montagem metálica (0.4.0).
   Schema 4: modo livre/cristalino da montagem e cristalografia (0.5.0).
   Schema 5: modelo eletrônico qualitativo de elétrons de valência deslocalizados (0.6.0).
   Schema 6: propriedades metálicas — experiência ativa e seus parâmetros (0.7.0).
   Schema 7: medições do modelo (measurements[]) — módulo Medir (0.9.0). */
SILM.scientificSchemaVersion=8;
SILM.scientificModules=Object.freeze(['explorar','medir','calcular']);
SILM.emptyScientificState=(active='explorar')=>({
 schemaVersion:8,investigation:null,metal:null,module:{active},structure:null,electrons:null,properties:SILM.properties.fresh(),
 conditions:{temperature:null,pressure:null},observations:[],measurements:[],calculations:[],
 representation:{dimension:null,layers:[]},metadata:{}
});
/* Modelo eletrônico (0.6.x): distribuição coletiva associada à estrutura inteira, nunca a pares.
   Os marcadores desenhados não são estado: só o modelo e a configuração da representação são salvos. */
SILM.electronModel=Object.freeze({modelVersion:1,types:Object.freeze(['delocalized-electron-model']),sourceModel:'valence-electron-contribution',
 representationType:'qualitative',densityModes:Object.freeze(['qualitative']),minUnits:2,defaults:Object.freeze({visible:true,motion:true,densityMode:'qualitative',representationType:'qualitative'})});
SILM.validateElectrons=(el,structure,metal,data=SILM.data)=>{
 const M=SILM.electronModel,fail=reason=>({ok:false,reason}),plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v),keys=(o,list)=>Object.keys(o).sort().join()===[...list].sort().join();
 if(!plain(el)||!keys(el,['modelVersion','type','status','metalAtomicNumber','source','representation','createdAt']))return fail('ELECTRONS_INVALID');
 if(el.modelVersion!==M.modelVersion||!M.types.includes(el.type)||el.status!=='active'||!Number.isFinite(Date.parse(el.createdAt)))return fail('ELECTRONS_INVALID');
 if(!metal||el.metalAtomicNumber!==metal.atomicNumber)return fail('ELECTRONS_METAL_MISMATCH');
 if(!structure||structure.units.length<M.minUnits)return fail('ELECTRONS_WITHOUT_STRUCTURE');
 const e=data.get(metal.atomicNumber),src=el.source;
 if(!plain(src)||!keys(src,['model','valenceSourceId','configurationSourceId'])||src.model!==M.sourceModel)return fail('ELECTRON_SOURCE_INVALID');
 if(!e?.valenceModel||src.valenceSourceId!==e.valenceModel.sourceId||src.configurationSourceId!==e.electronConfiguration.sourceId)return fail('ELECTRON_SOURCE_MISMATCH');
 const r=el.representation;
 if(!plain(r)||!keys(r,['visible','motion','densityMode','representationType'])||typeof r.visible!=='boolean'||typeof r.motion!=='boolean'||!M.densityModes.includes(r.densityMode)||r.representationType!==M.representationType)return fail('ELECTRON_REPRESENTATION_INVALID');
 return {ok:true};
};
/* Propriedades (0.7.x): uma experiência ativa por vez; as demais ficam no estado-base. Os parâmetros são estado
   da experiência e nunca alteram structure, cristalografia ou modelo eletrônico. */
SILM.validateProperties=(pr,state,data=SILM.data)=>{
 const P=SILM.properties,L=P.limits,fail=reason=>({ok:false,reason}),plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v),keys=(o,list)=>plain(o)&&Object.keys(o).sort().join()===[...list].sort().join();
 if(!keys(pr,['modelVersion','active','startedAt',...P.ids])||pr.modelVersion!==1)return fail('PROPERTIES_INVALID');
 const shapes={electrical:o=>keys(o,['field'])&&typeof o.field==='boolean',thermal:o=>keys(o,['heating','stage'])&&typeof o.heating==='boolean'&&Number.isInteger(o.stage)&&o.stage>=0&&o.stage<=L.heatStages,
  malleability:o=>keys(o,['compression'])&&Number.isInteger(o.compression)&&o.compression>=0&&o.compression<=L.compression,ductility:o=>keys(o,['elongation'])&&Number.isInteger(o.elongation)&&o.elongation>=0&&o.elongation<=L.elongation,luster:o=>keys(o,['light'])&&typeof o.light==='boolean'};
 for(const id of P.ids)if(!shapes[id](pr[id]))return fail('PROPERTY_PARAMS_INVALID');
 if(pr.active!==null&&!P.ids.includes(pr.active))return fail('PROPERTY_UNKNOWN');
 // Só a propriedade ativa pode estar fora do estado-base: trocar ou encerrar não deixa resíduo.
 for(const id of P.ids)if(id!==pr.active&&JSON.stringify(pr[id])!==JSON.stringify(P.defaults[id]))return fail('PROPERTY_STATE_RESIDUAL');
 if(pr.active===null)return pr.startedAt===null?{ok:true}:fail('PROPERTIES_INVALID');
 if(!Number.isFinite(Date.parse(pr.startedAt)))return fail('PROPERTIES_INVALID');
 const s=state.structure;if(!state.investigation||!state.metal||!s)return fail('PROPERTY_CONTEXT_INVALID');
 const el=P.eligibility(data.get(state.metal.atomicNumber))[pr.active];if(el.status==='unavailable')return fail('PROPERTY_UNAVAILABLE');
 if(el.requires==='crystalline'&&s.mode!=='crystalline')return fail('PROPERTY_CONTEXT_INVALID');
 if(el.requires==='electrons'&&(!state.electrons||s.units.length<SILM.electronModel.minUnits))return fail('PROPERTY_CONTEXT_INVALID');
 return {ok:true};
};
SILM.crystalRepresentation=Object.freeze({views:Object.freeze(['cell','lattice']),defaults:Object.freeze({view:'cell',unitCell:true,neighbors:false,labels:false,selectedUnitId:null})});
SILM.validateStructure=(s,metal,data=SILM.data)=>{
 const A=SILM.assembly,C=A.contract,X=SILM.crystal,fail=reason=>({ok:false,reason}),plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
 const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v)),keys=(o,list)=>Object.keys(o).sort().join()===[...list].sort().join();
 if(!plain(s)||s.modelVersion!==2||s.type!==C.type)return fail('STRUCTURE_INVALID');
 if(!keys(s,['modelVersion','type','metalAtomicNumber','mode','status','units','assistance','referenceStructureId','crystallography','createdAt','updatedAt']))return fail('STRUCTURE_INVALID');
 if(!metal||s.metalAtomicNumber!==metal.atomicNumber)return fail('STRUCTURE_METAL_MISMATCH');
 if(!['free','crystalline'].includes(s.mode)||!C.statuses.includes(s.status)||!Array.isArray(s.units))return fail('STRUCTURE_INVALID');
 if(!plain(s.assistance)||typeof s.assistance.enabled!=='boolean'||!C.assistanceModes.includes(s.assistance.mode))return fail('ASSISTANCE_INVALID');
 if(!date(s.createdAt)||!date(s.updatedAt)||Date.parse(s.updatedAt)<Date.parse(s.createdAt))return fail('TIMESTAMP_INVALID');
 const mixed=u=>plain(u)&&['atomicNumber','symbol','element','metal'].some(k=>k in u);
 /* Unidades livres: posição normalizada, sem sobreposição (contrato da 0.4.x). */
 function freeUnits(list,{allowEmpty}){
  if(!Array.isArray(list)||list.length>C.maxUnits||(!allowEmpty&&!list.length))return fail(list?.length>C.maxUnits?'UNITS_LIMIT':'STRUCTURE_INVALID');
  const ids=new Set();
  for(const u of list){
   if(mixed(u))return fail('STRUCTURE_MIXED_ELEMENTS');
   if(!plain(u)||!keys(u,['createdAt','id','placement','position'])||typeof u.id!=='string'||!/^unit-[a-zA-Z0-9-]{8,80}$/.test(u.id)||ids.has(u.id))return fail('UNIT_INVALID');
   ids.add(u.id);if(!date(u.createdAt)||!C.placements.includes(u.placement))return fail('UNIT_INVALID');
   if(!plain(u.position)||!keys(u.position,['x','y'])||!A.inBounds(u.position))return fail('POSITION_INVALID');
  }
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(A.distance(list[i].position,list[j].position)<C.minDistance-1e-9)return fail('UNITS_OVERLAP');
  return {ok:true};
 }
 if(s.mode==='free'){
  if(s.referenceStructureId!==null||s.crystallography!==null)return fail('MODE_INCONSISTENT');
  if((s.status==='empty')!==(s.units.length===0)||(s.status==='assembled'&&s.units.length<2))return fail('STATUS_INCONSISTENT');
  return freeUnits(s.units,{allowEmpty:true});
 }
 /* Modo cristalino: estrutura do banco, autoria preservada e célula completa. */
 const e=data.get(metal.atomicNumber),el=X.eligibility(e);
 if(el.status!=='available')return fail('CRYSTALLOGRAPHY_UNAVAILABLE');
 const cr=s.crystallography;
 if(!plain(cr)||!keys(cr,['structureType','sourceId','coordination','representation','freeUnits','organizedAt']))return fail('CRYSTALLOGRAPHY_INVALID');
 if(!X.structureTypes.includes(cr.structureType))return fail('CRYSTAL_TYPE_INVALID');
 if(cr.structureType!==el.structureType||s.referenceStructureId!==el.referenceStructureId||cr.sourceId!==el.sourceId)return fail('CRYSTAL_REFERENCE_MISMATCH');
 if(cr.coordination!==el.coordination)return fail('COORDINATION_INVALID');
 if(!date(cr.organizedAt)||s.status==='empty')return fail('CRYSTALLOGRAPHY_INVALID');
 const r=cr.representation;
 if(!plain(r)||!keys(r,['view','unitCell','neighbors','labels','selectedUnitId'])||!SILM.crystalRepresentation.views.includes(r.view)||['unitCell','neighbors','labels'].some(k=>typeof r[k]!=='boolean'))return fail('REPRESENTATION_INVALID');
 const free=freeUnits(cr.freeUnits,{allowEmpty:false});if(!free.ok)return free;
 const g=X.geometry(e),m=g.model,ids=new Set(),sites=new Set(),byId=new Map(cr.freeUnits.map(u=>[u.id,u]));
 for(const u of s.units){
  if(mixed(u))return fail('STRUCTURE_MIXED_ELEMENTS');
  if(!plain(u)||!keys(u,['createdAt','id','placement','site'])||typeof u.id!=='string'||!/^unit-[a-zA-Z0-9-]{8,80}$/.test(u.id)||ids.has(u.id)||!date(u.createdAt))return fail('UNIT_INVALID');
  ids.add(u.id);
  if(!plain(u.site)||!keys(u.site,['basis','cell'])||!Array.isArray(u.site.cell)||u.site.cell.length!==3||!u.site.cell.every(v=>Number.isInteger(v)&&Math.abs(v)<=3)||!Number.isInteger(u.site.basis)||u.site.basis<0||u.site.basis>=m.basis.length)return fail('SITE_INVALID');
  const k=X.key(u.site);if(sites.has(k))return fail('SITE_DUPLICATED');sites.add(k);
  if(u.placement==='crystallographic'){if(byId.has(u.id))return fail('AUTHORSHIP_INVALID');}
  else{const origin=byId.get(u.id);if(!origin||origin.placement!==u.placement||origin.createdAt!==u.createdAt)return fail('AUTHORSHIP_INVALID');}
 }
 if(cr.freeUnits.some(u=>!ids.has(u.id)))return fail('AUTHORSHIP_INVALID');
 if(s.units.length!==Math.max(cr.freeUnits.length,m.cellSites)||!g.cell.every(c=>sites.has(c.key)))return fail('CELL_INCOMPLETE');
 if(r.selectedUnitId!==null&&!ids.has(r.selectedUnitId))return fail('REPRESENTATION_INVALID');
 return {ok:true};
};
SILM.validateScientificState=(value,data=SILM.data)=>{
 const fail=reason=>({ok:false,reason});
 if(!value||typeof value!=='object'||Array.isArray(value)||value.schemaVersion!==8)return fail('SCHEMA_INCOMPATIBLE');
 if(!value.module||!SILM.scientificModules.includes(value.module.active))return fail('MODULE_INVALID');
 if(!Array.isArray(value.observations)||!Array.isArray(value.measurements)||!Array.isArray(value.calculations))return fail('DATA_INVALID');
 if(value.observations.some(x=>typeof x!=='string'||x.length>12000))return fail('OBSERVATIONS_INVALID');
 if(!value.conditions||value.conditions.temperature!==null||value.conditions.pressure!==null||!value.representation||value.representation.dimension!==null||!Array.isArray(value.representation.layers)||value.representation.layers.length)return fail('CONDITIONS_INVALID');
 if(!value.metadata||typeof value.metadata!=='object'||Array.isArray(value.metadata))return fail('METADATA_INVALID');
 if(value.investigation===null){if(value.metal!==null||value.structure!==null||value.electrons!==null)return fail('ORPHAN_METAL');}
 else{
  const i=value.investigation,m=value.metal;
  if(!i||typeof i!=='object'||Array.isArray(i)||typeof i.id!=='string'||!/^inv-[a-zA-Z0-9-]{12,80}$/.test(i.id)||!['new','active','paused'].includes(i.status)||!['free','route','mission','teacher'].includes(i.type))return fail('INVESTIGATION_INVALID');
  if(!Number.isFinite(Date.parse(i.createdAt))||!Number.isFinite(Date.parse(i.updatedAt))||Date.parse(i.updatedAt)<Date.parse(i.createdAt))return fail('TIMESTAMP_INVALID');
  if(!m||typeof m!=='object'||Array.isArray(m)||!Number.isInteger(m.atomicNumber)||typeof m.symbol!=='string')return fail('METAL_INVALID');
  const element=data.get(m.atomicNumber);
  if(!element||element.silmEligibility.status!=='available'||element.symbol!==m.symbol||m.sourceId!==element.identityProvenance.atomicNumber.sourceId)return fail('METAL_UNAVAILABLE');
  if(value.structure!==null){const structure=SILM.validateStructure(value.structure,m,data);if(!structure.ok)return structure;}
  if(value.electrons!==null){const electrons=SILM.validateElectrons(value.electrons,value.structure,m,data);if(!electrons.ok)return electrons;}
 }
 const properties=SILM.validateProperties(value.properties,value,data);if(!properties.ok)return properties;
 const measurements=SILM.measurement.validate(value.measurements,value,data);if(!measurements.ok)return measurements;
 const calculations=SILM.calculation.validate(value.calculations,value,data);if(!calculations.ok)return calculations;
 return {ok:true,value:JSON.parse(JSON.stringify(value))};
};
SILM.createScientificState=()=>{
 const A=SILM.assembly,C=A.contract,X=SILM.crystal,state=SILM.emptyScientificState();let storage=null,emit=null,history=[];
 const snapshot=()=>JSON.parse(JSON.stringify(state));
 const replace=next=>{for(const key of Object.keys(state))delete state[key];Object.assign(state,next);};
 const persist=()=>storage?.set('scientific.state',snapshot());
 const publish=(name,previous,extra={})=>{persist();const current=snapshot();emit?.(name,{previous,current,...extra});emit?.('investigation:updated',{previous,current,change:name});};
 const now=()=>new Date().toISOString();
 const random=prefix=>{
  if(globalThis.crypto?.randomUUID)return prefix+crypto.randomUUID();
  if(globalThis.crypto?.getRandomValues){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return prefix+[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');}
  return prefix+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2).padEnd(12,'0');
 };
 const id=()=>random('inv-');
 const reference=z=>{const e=SILM.data.get(z);return e?.silmEligibility.status==='available'?e:null;};
 const free=()=>state.structure?.mode==='free';
 /* Histórico operacional de desfazer: somente em memória, limitado, nunca persistido nem relatado. */
 const remember=entry=>{history.push(entry);if(history.length>C.historyLimit)history.shift();};
 const touched=date=>{state.structure.updatedAt=date;state.investigation.updatedAt=date;};
 function begin(z,type='free'){
  const e=reference(z);if(!e||!['free','route','mission','teacher'].includes(type))return false;
  const previous=snapshot(),date=now(),next=SILM.emptyScientificState(state.module.active);
  next.investigation={id:id(),status:'active',type,createdAt:date,updatedAt:date};
  next.metal={atomicNumber:e.atomicNumber,symbol:e.symbol,sourceId:e.identityProvenance.atomicNumber.sourceId};
  history=[];replace(next);publish('investigation:created',previous);
  if(previous.metal?.atomicNumber!==z)emit?.('metal:changed',{previous:previous.metal,current:next.metal});return true;
 }
 function setModule(active){if(!SILM.scientificModules.includes(active))return false;if(state.module.active===active)return true;
  const previous=snapshot();state.module.active=active;if(state.investigation)state.investigation.updatedAt=now();publish('scientific:module-changed',previous);return true;
 }
 function resetInvestigation(){if(!state.investigation)return false;const previous=snapshot(),identity=state.investigation;
  const next=SILM.emptyScientificState(state.module.active);next.metal=state.metal;
  next.investigation={...identity,status:'active',updatedAt:now()};history=[];replace(next);publish('investigation:reset',previous);return true;
 }
 function close(){if(!state.investigation)return false;const previous=snapshot(),closed={...previous,investigation:{...previous.investigation,status:'closed',updatedAt:now()}};
  history=[];replace(SILM.emptyScientificState(state.module.active));publish('investigation:closed',closed);emit?.('metal:changed',{previous:previous.metal,current:null});return true;
 }
 function setStatus(status){if(!state.investigation||!['new','active','paused'].includes(status))return false;if(state.investigation.status===status)return true;
  const previous=snapshot();state.investigation.status=status;state.investigation.updatedAt=now();publish('investigation:status',previous);return true;
 }
 /* Montagem livre (0.4.x). Iniciar montagem e Adicionar unidade são ações distintas. */
 function beginAssembly(){if(!state.investigation||!state.metal||state.structure)return false;
  const previous=snapshot(),date=now();
  state.structure={modelVersion:2,type:C.type,metalAtomicNumber:state.metal.atomicNumber,mode:'free',status:'empty',units:[],assistance:{enabled:true,mode:'placement'},referenceStructureId:null,crystallography:null,createdAt:date,updatedAt:date};
  state.investigation.updatedAt=date;history=[];publish('structure:created',previous);return true;
 }
 function addUnit(target=null){
  const s=state.structure;if(!s)return {ok:false,reason:'NO_STRUCTURE'};if(!free())return {ok:false,reason:'CRYSTALLINE_MODE'};if(s.units.length>=C.maxUnits)return {ok:false,reason:'UNITS_LIMIT'};
  let position,placement='assisted',adjusted=false;
  if(target){const r=A.resolve(s.units,null,target,{assisted:s.assistance.enabled});if(!r.ok)return r;({position,placement,adjusted}=r);}
  else{position=A.spawnPosition(s.units);if(!position)return {ok:false,reason:'NO_SPACE'};}
  const previous=snapshot(),date=now(),unit={id:random('unit-'),position,createdAt:date,placement};
  s.units.push(unit);s.status=A.statusFor(s.units);touched(date);remember({type:'add',unitId:unit.id});
  publish('structure:unit-added',previous,{unitId:unit.id});return {ok:true,unit:JSON.parse(JSON.stringify(unit)),adjusted};
 }
 /* gesture agrupa repetições de teclado da mesma unidade em uma única ação desfazível. */
 function moveUnit(unitId,target,{gesture=null}={}){
  const s=state.structure;if(s&&!free())return {ok:false,reason:'CRYSTALLINE_MODE'};
  const unit=s?.units.find(u=>u.id===unitId);if(!unit)return {ok:false,reason:'UNIT_NOT_FOUND'};
  const r=A.resolve(s.units,unitId,target,{assisted:s.assistance.enabled});if(!r.ok)return r;
  if(r.position.x===unit.position.x&&r.position.y===unit.position.y)return {...r,unchanged:true};
  const previous=snapshot(),date=now(),last=history[history.length-1];
  if(!(gesture&&last?.type==='move'&&last.unitId===unitId&&last.gesture===gesture))remember({type:'move',unitId,gesture,from:{position:{...unit.position},placement:unit.placement}});
  unit.position=r.position;unit.placement=r.placement;s.status=A.statusFor(s.units);touched(date);
  publish('structure:unit-moved',previous,{unitId});return r;
 }
 function undo(){
  const s=state.structure,entry=history[history.length-1];if(!s||!free()||!entry)return {ok:false,reason:'NOTHING_TO_UNDO'};
  const unit=s.units.find(u=>u.id===entry.unitId);
  if(entry.type==='move'&&!(unit&&A.isFree(s.units,entry.from.position,unit.id)))return {ok:false,reason:'UNDO_CONFLICT'};
  const previous=snapshot();history.pop();
  if(entry.type==='add')s.units=s.units.filter(u=>u.id!==entry.unitId);
  else{unit.position={...entry.from.position};unit.placement=entry.from.placement;}
  s.status=A.statusFor(s.units);const dropped=dropElectrons();settleProperties();touched(now());publish('structure:undone',previous,{action:entry.type,unitId:entry.unitId,electronsCleared:dropped});return {ok:true,action:entry.type,unitId:entry.unitId,electronsCleared:dropped};
 }
 /* Limpar estrutura: structure → null; investigação, metal e módulo permanecem. */
 function clearStructure(){if(!state.structure)return false;const previous=snapshot();state.structure=null;state.electrons=null;state.properties=SILM.properties.fresh();state.investigation.updatedAt=now();history=[];publish('structure:cleared',previous);return true;}
 function setAssistance(enabled){const s=state.structure;if(!s||!free()||typeof enabled!=='boolean')return false;if(s.assistance.enabled===enabled)return true;
  const previous=snapshot();s.assistance.enabled=enabled;touched(now());publish('structure:assistance',previous);return true;
 }
 /* Concluída é uma marcação do usuário sobre a construção; não é estado cristalográfico. */
 function setAssemblyStatus(status){const s=state.structure;if(!s||!free()||!['assembling','assembled'].includes(status))return false;if(s.status===status)return true;
  if(status==='assembled'?s.units.length<2:!s.units.length)return false;
  const previous=snapshot();s.status=status;touched(now());publish('structure:status',previous);return true;
 }
 /* Cristalografia (0.5.x): reorganização didática segundo a estrutura de referência do banco. */
 function organize(){
  const s=state.structure;if(!s)return {ok:false,reason:'NO_STRUCTURE'};if(!free())return {ok:false,reason:'ALREADY_CRYSTALLINE'};if(!s.units.length)return {ok:false,reason:'NO_UNITS'};
  const e=SILM.data.get(state.metal.atomicNumber),el=X.eligibility(e);if(el.status!=='available')return {ok:false,reason:el.reasonCode};
  const g=X.geometry(e),{assigned,missing}=X.organize(g,s.units),previous=snapshot(),date=now();
  const site=x=>({cell:[...x.cell],basis:x.basis});
  const units=s.units.map((u,i)=>({id:u.id,createdAt:u.createdAt,placement:u.placement,site:site(assigned[i])}));
  for(const x of missing)units.push({id:random('unit-'),createdAt:date,placement:'crystallographic',site:site(x)});
  state.structure={...s,mode:'crystalline',units,referenceStructureId:el.referenceStructureId,
   crystallography:{structureType:el.structureType,sourceId:el.sourceId,coordination:el.coordination,representation:{...SILM.crystalRepresentation.defaults},freeUnits:JSON.parse(JSON.stringify(s.units)),organizedAt:date},updatedAt:date};
  state.investigation.updatedAt=date;history=[];publish('structure:organized',previous,{added:missing.length});
  return {ok:true,added:missing.length,reused:s.units.length,structureType:el.structureType};
 }
 /* Voltar à montagem livre: restaura exatamente a montagem anterior; as unidades completadas pelo SILM saem. */
 function restoreFree(){
  const s=state.structure;if(!s||free())return false;const previous=snapshot(),date=now();
  state.structure={...s,mode:'free',units:JSON.parse(JSON.stringify(s.crystallography.freeUnits)),referenceStructureId:null,crystallography:null,updatedAt:date};
  const dropped=dropElectrons();const ended=settleProperties();state.investigation.updatedAt=date;history=[];publish('structure:free',previous,{electronsCleared:dropped,propertyEnded:ended});return true;
 }
 /* Camadas e vista são estado de representação: não alteram a estrutura cristalina nem updatedAt. */
 function setCrystalRepresentation(patch){
  const s=state.structure;if(!s||free()||!patch||typeof patch!=='object')return false;const r=s.crystallography.representation,next={...r};
  for(const [k,v]of Object.entries(patch)){
   if(k==='view'){if(!SILM.crystalRepresentation.views.includes(v))return false;}
   else if(['unitCell','neighbors','labels'].includes(k)){if(typeof v!=='boolean')return false;}
   else if(k==='selectedUnitId'){if(v!==null&&!s.units.some(u=>u.id===v))return false;}
   else return false;
   next[k]=v;
  }
  if(JSON.stringify(next)===JSON.stringify(r))return true;
  const previous=snapshot();s.crystallography.representation=next;publish('structure:representation',previous,{patch});return true;
 }
 /* Modelo eletrônico (0.6.x). Ativar cria o modelo; ocultar só muda representation.visible. */
 function dropElectrons(){if(state.electrons&&(!state.structure||state.structure.units.length<SILM.electronModel.minUnits)){state.electrons=null;return true;}return false;}
 function activateElectrons(){
  const s=state.structure,M=SILM.electronModel;if(!state.investigation||!s)return {ok:false,reason:'NO_STRUCTURE'};if(s.units.length<M.minUnits)return {ok:false,reason:'TOO_FEW_UNITS'};
  if(state.electrons){if(state.electrons.representation.visible)return {ok:true,unchanged:true};setElectronRepresentation({visible:true});return {ok:true,shown:true};}
  const e=SILM.data.get(state.metal.atomicNumber),previous=snapshot(),date=now();
  state.electrons={modelVersion:M.modelVersion,type:M.types[0],status:'active',metalAtomicNumber:state.metal.atomicNumber,
   source:{model:M.sourceModel,valenceSourceId:e.valenceModel.sourceId,configurationSourceId:e.electronConfiguration.sourceId},
   representation:{...M.defaults},createdAt:date};
  state.investigation.updatedAt=date;publish('electrons:activated',previous);return {ok:true,created:true};
 }
 /* Visibilidade e movimento são representação: não alteram o modelo nem updatedAt. */
 function setElectronRepresentation(patch){
  const el=state.electrons;if(!el||!patch||typeof patch!=='object')return false;const next={...el.representation};
  for(const [k,v]of Object.entries(patch)){if(!['visible','motion'].includes(k)||typeof v!=='boolean')return false;next[k]=v;}
  if(JSON.stringify(next)===JSON.stringify(el.representation))return true;
  const previous=snapshot();el.representation=next;publish('electrons:representation',previous,{patch});return true;
 }
 /* ---------- Propriedades (0.7.x) ---------- */
 const P=SILM.properties;
 // Encerra a experiência se o contexto deixou de valer (ex.: voltou ao modo livre, ficou sem elétrons).
 function settleProperties(){const pr=state.properties;if(!pr.active)return null;const r=SILM.validateProperties(pr,state);if(r.ok)return null;const ended=pr.active;state.properties=P.fresh();return ended;}
 function propertyAvailability(id){
  if(!P.ids.includes(id))return {ok:false,reason:'PROPERTY_UNKNOWN'};const s=state.structure;if(!state.investigation||!s)return {ok:false,reason:'NO_STRUCTURE'};
  const el=P.eligibility(SILM.data.get(state.metal.atomicNumber))[id];if(el.status==='unavailable')return {ok:false,reason:el.reasonCode};
  if(el.requires==='crystalline'&&s.mode!=='crystalline')return {ok:false,reason:'NEEDS_CRYSTALLINE'};
  if(el.requires==='electrons'&&s.units.length<SILM.electronModel.minUnits)return {ok:false,reason:'TOO_FEW_UNITS'};
  return {ok:true};
 }
 /* Iniciar: o estado-base é a própria estrutura (as experiências não a alteram). Condutividade elétrica ativa
    e mostra o modelo eletrônico, se necessário. Trocar de propriedade devolve a anterior ao estado-base. */
 function startProperty(id){
  const able=propertyAvailability(id);if(!able.ok)return able;if(state.properties.active===id)return {ok:true,unchanged:true};
  const previous=snapshot(),date=now();let electrons=false;
  if(id==='electrical'){if(!state.electrons){const e=SILM.data.get(state.metal.atomicNumber),M=SILM.electronModel;state.electrons={modelVersion:M.modelVersion,type:M.types[0],status:'active',metalAtomicNumber:state.metal.atomicNumber,source:{model:M.sourceModel,valenceSourceId:e.valenceModel.sourceId,configurationSourceId:e.electronConfiguration.sourceId},representation:{...M.defaults},createdAt:date};electrons=true;}
   else if(!state.electrons.representation.visible){state.electrons.representation.visible=true;electrons=true;}}
  const switched=state.properties.active;state.properties={...P.fresh(),active:id,startedAt:date};state.investigation.updatedAt=date;
  publish('properties:started',previous,{property:id,switchedFrom:switched,electrons});return {ok:true,switchedFrom:switched,electrons};
 }
 function setPropertyParams(patch){
  const pr=state.properties,id=pr.active;if(!id||!patch||typeof patch!=='object')return false;
  const next={...pr,[id]:{...pr[id],...patch}};if(Object.keys(next[id]).length!==Object.keys(P.defaults[id]).length)return false;
  if(!SILM.validateProperties(next,{...state,properties:next}).ok)return false;if(JSON.stringify(next[id])===JSON.stringify(pr[id]))return true;
  const previous=snapshot();state.properties=next;publish('properties:changed',previous,{property:id,patch});return true;
 }
 /* Restaurar: volta ao estado-base da experiência; não reseta a investigação nem troca o metal. */
 function restoreProperty(){const pr=state.properties;if(!pr.active)return false;const previous=snapshot();state.properties={...pr,[pr.active]:JSON.parse(JSON.stringify(P.defaults[pr.active]))};publish('properties:restored',previous,{property:pr.active});return true;}
 function endProperty(){const pr=state.properties;if(!pr.active)return false;const previous=snapshot(),id=pr.active;state.properties=P.fresh();state.investigation.updatedAt=now();publish('properties:ended',previous,{property:id});return true;}
 /* ---------- Medições (0.9.x): medidas do modelo cristalográfico, com pontos em sítios científicos ---------- */
 const MS=SILM.measurement;
 function measurementAvailability(){
  const s=state.structure;if(!state.investigation||!s)return {ok:false,reason:'NO_STRUCTURE'};if(s.mode!=='crystalline')return {ok:false,reason:'NO_SCALE'};
  const pr=state.properties;if(pr.active&&((pr.active==='malleability'&&pr.malleability.compression)||(pr.active==='ductility'&&pr.ductility.elongation)))return {ok:false,reason:'DEFORMED'};
  return {ok:true};
 }
 /* Registra uma medição concluída. Os pontos chegam como IDs de unidades; o registro guarda os sítios. */
 function addMeasurement(type,unitIds){
  const able=measurementAvailability();if(!able.ok)return able;const T=MS.types[type];if(!T)return {ok:false,reason:'TYPE_INVALID'};
  if(state.measurements.length>=MS.limit)return {ok:false,reason:'MEASUREMENTS_LIMIT'};
  const s=state.structure,units=unitIds.map(id=>s.units.find(u=>u.id===id));if(units.length!==T.points||units.some(u=>!u))return {ok:false,reason:'POINTS_INVALID'};
  const e=SILM.data.get(state.metal.atomicNumber),g=SILM.crystal.geometry(e),r=MS.compute(type,g,units.map(u=>u.site));if(!r.ok)return r;
  const previous=snapshot(),date=now(),m={id:random('meas-'),type,instrument:T.instrument,value:r.value,unit:T.unit,resolution:T.resolution,
   points:units.map(u=>({unitId:u.id,site:MS.siteRef(u.site)})),parameter:r.parameter,structureContext:MS.context(s),
   source:{kind:'MODEL_MEASUREMENT',latticeSourceId:g.eligibility.sourceId},metalAtomicNumber:state.metal.atomicNumber,createdAt:date};
  state.measurements.push(m);state.investigation.updatedAt=date;publish('measurements:added',previous,{measurementId:m.id});return {ok:true,measurement:JSON.parse(JSON.stringify(m)),neighbors:r.neighbors?r.neighbors.list.length:null};
 }
 function removeMeasurement(id){const i=state.measurements.findIndex(m=>m.id===id);if(i<0)return false;const previous=snapshot();state.measurements.splice(i,1);publish('measurements:removed',previous,{measurementId:id});return true;}
 /* Limpar medições não limpa a estrutura. */
 function clearMeasurements(){if(!state.measurements.length)return false;const previous=snapshot();state.measurements=[];publish('measurements:cleared',previous);return true;}
 /* ---------- Cálculos (0.10.x): grandezas derivadas com fórmula do catálogo, entradas com origem e proveniência ---------- */
 const CA=SILM.calculation;
 function calculationAvailability(){const able=measurementAvailability();return able;}   // mesmas pré-condições das medidas: estrutura cristalina de referência
 /* Registra um cálculo concluído. As entradas chegam com valor, unidade, origem e referência; o resultado é recalculado aqui. */
 function addCalculation(formulaId,inputs){
  const able=calculationAvailability();if(!able.ok)return able;const f=SILM.formulas[formulaId];if(!f)return {ok:false,reason:'FORMULA_UNKNOWN'};
  const s=state.structure,type=s.crystallography.structureType;if(!f.applicability.includes(type))return {ok:false,reason:'FORMULA_NOT_APPLICABLE'};
  if(state.calculations.length>=CA.limit)return {ok:false,reason:'CALCULATIONS_LIMIT'};
  const constants=(f.constants||[]).map(k=>{const c=SILM.constants[k];return {key:c.key,symbol:c.symbol,name:c.name,value:c.value,unit:c.unit,origin:'CONSTANT',ref:c.sourceId?{sourceId:c.sourceId}:null};});
  const clean=inputs.map(x=>({key:x.key,symbol:x.symbol,name:x.name,value:Array.isArray(x.value)?[...x.value]:x.value,unit:x.unit,origin:x.origin,ref:x.ref?{...x.ref}:null}));
  const e=SILM.data.get(state.metal.atomicNumber),g=SILM.crystal.geometry(e),all=[...clean,...constants],r=CA.compute(formulaId,all,{geometry:g});if(!r.ok)return r;
  const previous=snapshot(),date=now();
  const references=[...new Set([...all.map(x=>x.ref?.sourceId).filter(Boolean),...(f.references||[])])],dependsOn=all.map(x=>x.ref?.calculationId||x.ref?.measurementId).filter(Boolean);
  const c={id:random('calc-'),type:f.quantity,formulaId,structureType:type,inputs:all,result:r.result,unit:f.outputUnit,
   provenance:{kind:'CALCULATED',model:f.model,references,dependsOn},structureContext:SILM.measurement.context(s),metalAtomicNumber:state.metal.atomicNumber,createdAt:date};
  if(c.structureContext.sourceId!==g.eligibility.sourceId)return {ok:false,reason:'CALCULATION_CONTEXT_INVALID'};
  state.calculations.push(c);state.investigation.updatedAt=date;publish('calculations:added',previous,{calculationId:c.id});
  return {ok:true,calculation:JSON.parse(JSON.stringify(c)),intermediates:r.intermediates};
 }
 function removeCalculation(id){const i=state.calculations.findIndex(c=>c.id===id);if(i<0)return false;const previous=snapshot();state.calculations.splice(i,1);publish('calculations:removed',previous,{calculationId:id});return true;}
 /* Limpar cálculos não limpa a estrutura nem as medições. */
 function clearCalculations(){if(!state.calculations.length)return false;const previous=snapshot();state.calculations=[];publish('calculations:cleared',previous);return true;}
 function upgradeStructure(s){return s===null?null:{...s,modelVersion:2,mode:'free',crystallography:null};}
 function migrate(value){
  const fresh=SILM.properties.fresh();
  if(value?.schemaVersion===7)return Array.isArray(value.calculations)&&!value.calculations.length?{...value,schemaVersion:8}:null;   // 0.9.x → 0.10.0: cálculos começam vazios
  if(value?.schemaVersion===6)return Array.isArray(value.measurements)&&!value.measurements.length?{...value,schemaVersion:8}:null;   // 0.8.0 → 0.9.0: medições começam vazias
  if(value?.schemaVersion===5)return 'properties' in value?null:{...value,schemaVersion:8,properties:fresh};       // 0.6.0 → 0.7.0: tudo preservado, nenhuma experiência ativa
  if(value?.schemaVersion===4)return value.electrons===null?{...value,schemaVersion:8,properties:fresh}:null;   // 0.5.0: estrutura e representação preservadas
  if(value?.schemaVersion===3)return value.electrons===null?{...value,schemaVersion:8,properties:fresh,structure:upgradeStructure(value.structure)}:null; // 0.4.0: montagem em modo livre
  if(value?.schemaVersion===2)return value.structure===null&&value.electrons===null?{...value,schemaVersion:8,properties:fresh}:null;     // 0.3.0: sem montagem automática
  if(value?.schemaVersion!==1||!['number','object'].includes(typeof value.metal))return null;
  if(value.metal===null)return SILM.emptyScientificState();
  const z=typeof value.metal==='number'?value.metal:value.metal?.atomicNumber;
  const e=reference(z);if(!e)return null;
  const next=SILM.emptyScientificState();const date=now();next.investigation={id:id(),status:'active',type:'free',createdAt:date,updatedAt:date};
  next.metal={atomicNumber:e.atomicNumber,symbol:e.symbol,sourceId:e.identityProvenance.atomicNumber.sourceId};return next;
 }
 function restore(value,{allowLegacy=true}={}){
  const legacy=allowLegacy&&[1,2,3,4,5,6,7].includes(value?.schemaVersion),candidate=legacy?migrate(value):value;
  const result=SILM.validateScientificState(candidate);
  if(!result.ok)return result;
  const previous=snapshot();history=[];replace(result.value);persist();emit?.('investigation:restored',{previous,current:snapshot(),migrated:legacy,from:legacy?value.schemaVersion:8});return {ok:true,migrated:legacy,from:legacy?value.schemaVersion:8};
 }
 function connect(options){storage=options.storage;emit=options.emit;}
 return Object.freeze({get state(){return snapshot();},snapshot,connect,begin,setModule,resetInvestigation,close,setStatus,restore,
  checkpoint:()=>({state:snapshot(),history:JSON.parse(JSON.stringify(history))}),
  rollback(value){replace(JSON.parse(JSON.stringify(value.state)));history=JSON.parse(JSON.stringify(value.history));emit?.('investigation:updated',{current:snapshot(),change:'storage:rollback'});},
  beginAssembly,addUnit,moveUnit,undo,clearStructure,setAssistance,setAssemblyStatus,organize,restoreFree,setCrystalRepresentation,activateElectrons,setElectronRepresentation,startProperty,setPropertyParams,restoreProperty,endProperty,propertyAvailability,addMeasurement,removeMeasurement,clearMeasurements,measurementAvailability,addCalculation,removeCalculation,clearCalculations,calculationAvailability,
  get canUndo(){return !!state.structure&&free()&&history.length>0;},get historySize(){return history.length;},
  get lastAction(){const last=history[history.length-1];return state.structure&&last?{type:last.type,unitId:last.unitId}:null;},
  load(){const missing={};const saved=storage?.get('scientific.state',missing);if(saved===missing)return {ok:true,empty:true};const result=restore(saved);if(!result.ok){history=[];replace(SILM.emptyScientificState());persist();return result;}return result;}
 });
};
SILM.provenance=Object.freeze({referenceTypes:Object.freeze(['conceitual','dados','tecnica']),dataKinds:Object.freeze(['TABULATED','CALCULATED','QUALITATIVE']),measurementKinds:Object.freeze(['medido-na-representacao','tabelado','calculado'])});
