'use strict';
window.SILM=window.SILM||{};
/* Contrato formal. Somente este serviço escreve o estado; consumidores recebem cópias.
   Schema 1: seleção provisória da 0.2.1. Schema 2: investigação da 0.3.0 (structure sempre null).
   Schema 3: montagem metálica da 0.4.0 (structure null ou objeto formal). */
SILM.scientificSchemaVersion=3;
SILM.scientificModules=Object.freeze(['explorar','medir','calcular']);
SILM.emptyScientificState=(active='explorar')=>({
 schemaVersion:3,investigation:null,metal:null,module:{active},structure:null,electrons:null,
 conditions:{temperature:null,pressure:null},observations:[],measurements:[],calculations:[],
 representation:{dimension:null,layers:[]},metadata:{}
});
SILM.validateStructure=(s,metal)=>{
 const A=SILM.assembly,C=A.contract,fail=reason=>({ok:false,reason}),plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
 const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
 if(!plain(s)||s.modelVersion!==C.modelVersion||s.type!==C.type)return fail('STRUCTURE_INVALID');
 if(!metal||s.metalAtomicNumber!==metal.atomicNumber)return fail('STRUCTURE_METAL_MISMATCH');
 if(!C.statuses.includes(s.status)||!Array.isArray(s.units))return fail('STRUCTURE_INVALID');
 if(!plain(s.assistance)||typeof s.assistance.enabled!=='boolean'||!C.assistanceModes.includes(s.assistance.mode))return fail('ASSISTANCE_INVALID');
 if(s.referenceStructureId!==null)return fail('FUTURE_DATA_UNSUPPORTED');
 if(!date(s.createdAt)||!date(s.updatedAt)||Date.parse(s.updatedAt)<Date.parse(s.createdAt))return fail('TIMESTAMP_INVALID');
 if(s.units.length>C.maxUnits)return fail('UNITS_LIMIT');
 if((s.status==='empty')!==(s.units.length===0)||(s.status==='assembled'&&s.units.length<2))return fail('STATUS_INCONSISTENT');
 const ids=new Set(),keys='createdAt,id,placement,position';
 for(const u of s.units){
  // A unidade não carrega elemento próprio: sua identidade química é sempre scientificState.metal.
  if(plain(u)&&['atomicNumber','symbol','element','metal'].some(k=>k in u))return fail('STRUCTURE_MIXED_ELEMENTS');
  if(!plain(u)||Object.keys(u).sort().join()!==keys||typeof u.id!=='string'||!/^unit-[a-zA-Z0-9-]{8,80}$/.test(u.id)||ids.has(u.id))return fail('UNIT_INVALID');
  ids.add(u.id);
  if(!date(u.createdAt)||!C.placements.includes(u.placement))return fail('UNIT_INVALID');
  if(!plain(u.position)||Object.keys(u.position).sort().join()!=='x,y'||!A.inBounds(u.position))return fail('POSITION_INVALID');
 }
 for(let i=0;i<s.units.length;i++)for(let j=i+1;j<s.units.length;j++)if(A.distance(s.units[i].position,s.units[j].position)<C.minDistance-1e-9)return fail('UNITS_OVERLAP');
 return {ok:true};
};
SILM.validateScientificState=(value,data=SILM.data)=>{
 const fail=reason=>({ok:false,reason});
 if(!value||typeof value!=='object'||Array.isArray(value)||value.schemaVersion!==3)return fail('SCHEMA_INCOMPATIBLE');
 if(!value.module||!SILM.scientificModules.includes(value.module.active))return fail('MODULE_INVALID');
 if(value.electrons!==null)return fail('FUTURE_DATA_UNSUPPORTED');
 if(!Array.isArray(value.observations)||!Array.isArray(value.measurements)||!Array.isArray(value.calculations)||value.measurements.length||value.calculations.length)return fail('DATA_INVALID');
 if(value.observations.some(x=>typeof x!=='string'||x.length>12000))return fail('OBSERVATIONS_INVALID');
 if(!value.conditions||value.conditions.temperature!==null||value.conditions.pressure!==null||!value.representation||value.representation.dimension!==null||!Array.isArray(value.representation.layers)||value.representation.layers.length)return fail('CONDITIONS_INVALID');
 if(!value.metadata||typeof value.metadata!=='object'||Array.isArray(value.metadata))return fail('METADATA_INVALID');
 if(value.investigation===null){if(value.metal!==null||value.structure!==null)return fail('ORPHAN_METAL');}
 else{
  const i=value.investigation,m=value.metal;
  if(!i||typeof i!=='object'||Array.isArray(i)||typeof i.id!=='string'||!/^inv-[a-zA-Z0-9-]{12,80}$/.test(i.id)||!['new','active','paused'].includes(i.status)||!['free','route','mission','teacher'].includes(i.type))return fail('INVESTIGATION_INVALID');
  if(!Number.isFinite(Date.parse(i.createdAt))||!Number.isFinite(Date.parse(i.updatedAt))||Date.parse(i.updatedAt)<Date.parse(i.createdAt))return fail('TIMESTAMP_INVALID');
  if(!m||typeof m!=='object'||Array.isArray(m)||!Number.isInteger(m.atomicNumber)||typeof m.symbol!=='string')return fail('METAL_INVALID');
  const element=data.get(m.atomicNumber);
  if(!element||element.silmEligibility.status!=='available'||element.symbol!==m.symbol||m.sourceId!==element.identityProvenance.atomicNumber.sourceId)return fail('METAL_UNAVAILABLE');
  if(value.structure!==null){const structure=SILM.validateStructure(value.structure,m);if(!structure.ok)return structure;}
 }
 return {ok:true,value:JSON.parse(JSON.stringify(value))};
};
SILM.createScientificState=()=>{
 const A=SILM.assembly,C=A.contract,state=SILM.emptyScientificState();let storage=null,emit=null,history=[];
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
 /* Montagem: Iniciar montagem e Adicionar unidade são ações distintas. */
 function beginAssembly(){if(!state.investigation||!state.metal||state.structure)return false;
  const previous=snapshot(),date=now();
  state.structure={modelVersion:C.modelVersion,type:C.type,metalAtomicNumber:state.metal.atomicNumber,status:'empty',units:[],assistance:{enabled:true,mode:'placement'},referenceStructureId:null,createdAt:date,updatedAt:date};
  state.investigation.updatedAt=date;history=[];publish('structure:created',previous);return true;
 }
 function addUnit(target=null){
  const s=state.structure;if(!s)return {ok:false,reason:'NO_STRUCTURE'};if(s.units.length>=C.maxUnits)return {ok:false,reason:'UNITS_LIMIT'};
  let position,placement='assisted',adjusted=false;
  if(target){const r=A.resolve(s.units,null,target,{assisted:s.assistance.enabled});if(!r.ok)return r;({position,placement,adjusted}=r);}
  else{position=A.spawnPosition(s.units);if(!position)return {ok:false,reason:'NO_SPACE'};}
  const previous=snapshot(),date=now(),unit={id:random('unit-'),position,createdAt:date,placement};
  s.units.push(unit);s.status=A.statusFor(s.units);touched(date);remember({type:'add',unitId:unit.id});
  publish('structure:unit-added',previous,{unitId:unit.id});return {ok:true,unit:JSON.parse(JSON.stringify(unit)),adjusted};
 }
 /* gesture agrupa repetições de teclado da mesma unidade em uma única ação desfazível. */
 function moveUnit(unitId,target,{gesture=null}={}){
  const s=state.structure,unit=s?.units.find(u=>u.id===unitId);if(!unit)return {ok:false,reason:'UNIT_NOT_FOUND'};
  const r=A.resolve(s.units,unitId,target,{assisted:s.assistance.enabled});if(!r.ok)return r;
  if(r.position.x===unit.position.x&&r.position.y===unit.position.y)return {...r,unchanged:true};
  const previous=snapshot(),date=now(),last=history[history.length-1];
  if(!(gesture&&last?.type==='move'&&last.unitId===unitId&&last.gesture===gesture))remember({type:'move',unitId,gesture,from:{position:{...unit.position},placement:unit.placement}});
  unit.position=r.position;unit.placement=r.placement;s.status=A.statusFor(s.units);touched(date);
  publish('structure:unit-moved',previous,{unitId});return r;
 }
 function undo(){
  const s=state.structure,entry=history[history.length-1];if(!s||!entry)return {ok:false,reason:'NOTHING_TO_UNDO'};
  const unit=s.units.find(u=>u.id===entry.unitId);
  if(entry.type==='move'&&!(unit&&A.isFree(s.units,entry.from.position,unit.id)))return {ok:false,reason:'UNDO_CONFLICT'};
  const previous=snapshot();history.pop();
  if(entry.type==='add')s.units=s.units.filter(u=>u.id!==entry.unitId);
  else{unit.position={...entry.from.position};unit.placement=entry.from.placement;}
  s.status=A.statusFor(s.units);touched(now());publish('structure:undone',previous,{action:entry.type,unitId:entry.unitId});return {ok:true,action:entry.type,unitId:entry.unitId};
 }
 /* Limpar estrutura: structure → null; investigação, metal e módulo permanecem. */
 function clearStructure(){if(!state.structure)return false;const previous=snapshot();state.structure=null;state.investigation.updatedAt=now();history=[];publish('structure:cleared',previous);return true;}
 function setAssistance(enabled){const s=state.structure;if(!s||typeof enabled!=='boolean')return false;if(s.assistance.enabled===enabled)return true;
  const previous=snapshot();s.assistance.enabled=enabled;touched(now());publish('structure:assistance',previous);return true;
 }
 /* Concluída é uma marcação do usuário sobre a construção; não é estado cristalográfico. */
 function setAssemblyStatus(status){const s=state.structure;if(!s||!['assembling','assembled'].includes(status))return false;if(s.status===status)return true;
  if(status==='assembled'?s.units.length<2:!s.units.length)return false;
  const previous=snapshot();s.status=status;touched(now());publish('structure:status',previous);return true;
 }
 function migrate(value){
  if(value?.schemaVersion===2)return value.structure===null?{...value,schemaVersion:3}:null; // 0.3.0 → 0.4.0: sem montagem automática
  if(value?.schemaVersion!==1||!['number','object'].includes(typeof value.metal))return null;
  if(value.metal===null)return SILM.emptyScientificState();
  const z=typeof value.metal==='number'?value.metal:value.metal?.atomicNumber;
  const e=reference(z);if(!e)return null;
  const next=SILM.emptyScientificState();const date=now();next.investigation={id:id(),status:'active',type:'free',createdAt:date,updatedAt:date};
  next.metal={atomicNumber:e.atomicNumber,symbol:e.symbol,sourceId:e.identityProvenance.atomicNumber.sourceId};return next;
 }
 function restore(value,{allowLegacy=true}={}){
  const legacy=allowLegacy&&[1,2].includes(value?.schemaVersion),candidate=legacy?migrate(value):value;
  const result=SILM.validateScientificState(candidate);
  if(!result.ok)return result;
  const previous=snapshot();history=[];replace(result.value);persist();emit?.('investigation:restored',{previous,current:snapshot(),migrated:legacy,from:legacy?value.schemaVersion:3});return {ok:true,migrated:legacy,from:legacy?value.schemaVersion:3};
 }
 function connect(options){storage=options.storage;emit=options.emit;}
 return Object.freeze({get state(){return snapshot();},snapshot,connect,begin,setModule,resetInvestigation,close,setStatus,restore,
  beginAssembly,addUnit,moveUnit,undo,clearStructure,setAssistance,setAssemblyStatus,
  get canUndo(){return !!state.structure&&history.length>0;},get historySize(){return history.length;},
  get lastAction(){const last=history[history.length-1];return state.structure&&last?{type:last.type,unitId:last.unitId}:null;},
  load(){const missing={};const saved=storage?.get('scientific.state',missing);if(saved===missing)return {ok:true,empty:true};const result=restore(saved);if(!result.ok){history=[];replace(SILM.emptyScientificState());persist();return result;}return result;}
 });
};
SILM.provenance=Object.freeze({referenceTypes:Object.freeze(['conceitual','dados','tecnica']),dataKinds:Object.freeze(['TABULATED','CALCULATED','QUALITATIVE']),measurementKinds:Object.freeze(['medido-na-representacao','tabelado','calculado'])});
