'use strict';
window.SILM=window.SILM||{};
/* Contrato formal. Somente este serviço escreve o estado; consumidores recebem cópias. */
SILM.scientificSchemaVersion=2; // schema 1 era a seleção provisória da 0.2.1
SILM.scientificModules=Object.freeze(['explorar','medir','calcular']);
SILM.emptyScientificState=(active='explorar')=>({
 schemaVersion:2,investigation:null,metal:null,module:{active},structure:null,electrons:null,
 conditions:{temperature:null,pressure:null},observations:[],measurements:[],calculations:[],
 representation:{dimension:null,layers:[]},metadata:{}
});
SILM.validateScientificState=(value,data=SILM.data)=>{
 const fail=reason=>({ok:false,reason});
 if(!value||typeof value!=='object'||Array.isArray(value)||value.schemaVersion!==2)return fail('SCHEMA_INCOMPATIBLE');
 if(!value.module||!SILM.scientificModules.includes(value.module.active))return fail('MODULE_INVALID');
 if(value.structure!==null||value.electrons!==null)return fail('FUTURE_DATA_UNSUPPORTED');
 if(!Array.isArray(value.observations)||!Array.isArray(value.measurements)||!Array.isArray(value.calculations)||value.measurements.length||value.calculations.length)return fail('DATA_INVALID');
 if(value.observations.some(x=>typeof x!=='string'||x.length>12000))return fail('OBSERVATIONS_INVALID');
 if(!value.conditions||value.conditions.temperature!==null||value.conditions.pressure!==null||!value.representation||value.representation.dimension!==null||!Array.isArray(value.representation.layers)||value.representation.layers.length)return fail('CONDITIONS_INVALID');
 if(!value.metadata||typeof value.metadata!=='object'||Array.isArray(value.metadata))return fail('METADATA_INVALID');
 if(value.investigation===null){if(value.metal!==null)return fail('ORPHAN_METAL');}
 else{
  const i=value.investigation,m=value.metal;
  if(!i||typeof i!=='object'||Array.isArray(i)||typeof i.id!=='string'||!/^inv-[a-zA-Z0-9-]{12,80}$/.test(i.id)||!['new','active','paused'].includes(i.status)||!['free','route','mission','teacher'].includes(i.type))return fail('INVESTIGATION_INVALID');
  if(!Number.isFinite(Date.parse(i.createdAt))||!Number.isFinite(Date.parse(i.updatedAt))||Date.parse(i.updatedAt)<Date.parse(i.createdAt))return fail('TIMESTAMP_INVALID');
  if(!m||typeof m!=='object'||Array.isArray(m)||!Number.isInteger(m.atomicNumber)||typeof m.symbol!=='string')return fail('METAL_INVALID');
  const element=data.get(m.atomicNumber);
  if(!element||element.silmEligibility.status!=='available'||element.symbol!==m.symbol||m.sourceId!==element.identityProvenance.atomicNumber.sourceId)return fail('METAL_UNAVAILABLE');
 }
 return {ok:true,value:JSON.parse(JSON.stringify(value))};
};
SILM.createScientificState=()=>{
 const state=SILM.emptyScientificState();let storage=null,emit=null;
 const snapshot=()=>JSON.parse(JSON.stringify(state));
 const replace=next=>{for(const key of Object.keys(state))delete state[key];Object.assign(state,next);};
 const persist=()=>storage?.set('scientific.state',snapshot());
 const publish=(name,previous)=>{persist();const current=snapshot();emit?.(name,{previous,current});emit?.('investigation:updated',{previous,current,change:name});};
 const now=()=>new Date().toISOString();
 const id=()=>{
  if(globalThis.crypto?.randomUUID)return 'inv-'+crypto.randomUUID();
  if(globalThis.crypto?.getRandomValues){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return 'inv-'+[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');}
  return 'inv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2).padEnd(12,'0');
 };
 const reference=z=>{const e=SILM.data.get(z);return e?.silmEligibility.status==='available'?e:null;};
 function begin(z,type='free'){
  const e=reference(z);if(!e||!['free','route','mission','teacher'].includes(type))return false;
  const previous=snapshot(),date=now(),next=SILM.emptyScientificState(state.module.active);
  next.investigation={id:id(),status:'active',type,createdAt:date,updatedAt:date};
  next.metal={atomicNumber:e.atomicNumber,symbol:e.symbol,sourceId:e.identityProvenance.atomicNumber.sourceId};
  replace(next);publish('investigation:created',previous);
  if(previous.metal?.atomicNumber!==z)emit?.('metal:changed',{previous:previous.metal,current:next.metal});return true;
 }
 function setModule(active){if(!SILM.scientificModules.includes(active))return false;if(state.module.active===active)return true;
  const previous=snapshot();state.module.active=active;if(state.investigation)state.investigation.updatedAt=now();publish('scientific:module-changed',previous);return true;
 }
 function resetInvestigation(){if(!state.investigation)return false;const previous=snapshot(),identity=state.investigation;
  const next=SILM.emptyScientificState(state.module.active);next.metal=state.metal;
  next.investigation={...identity,status:'active',updatedAt:now()};replace(next);publish('investigation:reset',previous);return true;
 }
 function close(){if(!state.investigation)return false;const previous=snapshot(),closed={...previous,investigation:{...previous.investigation,status:'closed',updatedAt:now()}};
  replace(SILM.emptyScientificState(state.module.active));publish('investigation:closed',closed);emit?.('metal:changed',{previous:previous.metal,current:null});return true;
 }
 function setStatus(status){if(!state.investigation||!['new','active','paused'].includes(status))return false;if(state.investigation.status===status)return true;
  const previous=snapshot();state.investigation.status=status;state.investigation.updatedAt=now();publish('investigation:status',previous);return true;
 }
 function migrate(value){
  if(value?.schemaVersion!==1||!['number','object'].includes(typeof value.metal))return null;
  if(value.metal===null)return SILM.emptyScientificState();
  const z=typeof value.metal==='number'?value.metal:value.metal?.atomicNumber;
  const e=reference(z);if(!e)return null;
  const next=SILM.emptyScientificState();const date=now();next.investigation={id:id(),status:'active',type:'free',createdAt:date,updatedAt:date};
  next.metal={atomicNumber:e.atomicNumber,symbol:e.symbol,sourceId:e.identityProvenance.atomicNumber.sourceId};return next;
 }
 function restore(value,{allowLegacy=true}={}){
  const candidate=allowLegacy&&value?.schemaVersion===1?migrate(value):value;
  const result=SILM.validateScientificState(candidate);
  if(!result.ok)return result;
  const previous=snapshot();replace(result.value);persist();emit?.('investigation:restored',{previous,current:snapshot(),migrated:value?.schemaVersion===1});return {ok:true,migrated:value?.schemaVersion===1};
 }
 function connect(options){storage=options.storage;emit=options.emit;}
 return Object.freeze({get state(){return snapshot();},snapshot,connect,begin,setModule,resetInvestigation,close,setStatus,restore,
  load(){const missing={};const saved=storage?.get('scientific.state',missing);if(saved===missing)return {ok:true,empty:true};const result=restore(saved);if(!result.ok){replace(SILM.emptyScientificState());persist();return result;}return result;}
 });
};
SILM.provenance=Object.freeze({referenceTypes:Object.freeze(['conceitual','dados','tecnica']),dataKinds:Object.freeze(['TABULATED','CALCULATED','QUALITATIVE']),measurementKinds:Object.freeze(['medido-na-representacao','tabelado','calculado'])});
