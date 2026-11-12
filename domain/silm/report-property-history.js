'use strict';
window.SILM=window.SILM||{};
/* Registro de ações do motor Explorar, independente do estado científico.
   Observações da interface NÃO são resultados experimentais nem domínio do aluno.
   A persistência ocorre na mesma transação durável da ação científica. */
(()=>{
 const PREFIX='report.property-history:',MAX_EVENTS=160;
 const changes=Object.freeze({
  'properties:started':'iniciada','properties:changed':'alterada',
  'properties:restored':'restaurada','properties:ended':'encerrada'
 });
 const copy=o=>JSON.parse(JSON.stringify(o));
 const blank=(id,z)=>({schemaVersion:1,investigationId:id,metalAtomicNumber:z,sequence:0,discarded:0,events:[]});
 const validId=id=>typeof id==='string'&&/^inv-[a-zA-Z0-9-]{12,80}$/.test(id);
 const isParams=p=>p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length<=3&&
  Object.values(p).every(v=>typeof v==='boolean'||Number.isInteger(v)&&v>=0&&v<=10);
 function valid(doc,id,z){
  if(!doc||doc.schemaVersion!==1||!validId(doc.investigationId)||doc.investigationId!==id||
   doc.metalAtomicNumber!==z||!Number.isSafeInteger(doc.sequence)||doc.sequence<0||
   !Number.isSafeInteger(doc.discarded)||doc.discarded<0||!Array.isArray(doc.events)||
   doc.events.length>MAX_EVENTS)return false;
  let previous=0;
  for(const x of doc.events){
   if(!x||!Number.isSafeInteger(x.sequence)||x.sequence<=previous||x.sequence>doc.sequence||
    !SILM.properties.ids.includes(x.property)||!Object.values(changes).includes(x.kind)||
    typeof x.at!=='string'||!Number.isFinite(Date.parse(x.at))||
    typeof x.summary!=='string'||!x.summary||x.summary.length>180||
    !isParams(x.parameters))return false;
   previous=x.sequence;
  }
  return true;
 }
 function read(storage,id,z){
  if(!validId(id)||!Number.isInteger(z))return null;
  const saved=storage.get(PREFIX+id,null);
  if(saved===null)return blank(id,z);
  return valid(saved,id,z)?copy(saved):null;
 }
 function details(property,params,kind){
  const name=SILM.properties.catalog[property]?.title||property;
  if(kind==='iniciada')return name+' iniciada no motor do SILM';
  if(kind==='encerrada')return name+' encerrada; representação anterior não permanece ativa';
  if(kind==='restaurada')return name+': controles restaurados ao estado-base';
  const p=params||{};
  const states={
   electrical:p.field?'Campo elétrico aplicado':'Campo elétrico desligado',
   thermal:(p.heating?'Fonte de calor ligada':'Fonte de calor desligada')+'; etapa didática '+p.stage,
   malleability:'Compressão no modelo: etapa '+p.compression,
   ductility:'Tração no modelo: etapa '+p.elongation,
   luster:p.light?'Iluminação ativada na representação':'Iluminação desligada na representação'
  };
  return name+': '+states[property];
 }
 function capture(storage,change,previous,current){
  const kind=changes[change];if(!kind)return true;
  if(!current?.investigation||!previous||current.module?.active!=='explorar')return true;
  const id=current.investigation.id,z=current.metal?.atomicNumber;
  if(!validId(id)||!Number.isInteger(z)||previous.investigation?.id!==id)return true;
  const property=kind==='encerrada'?previous.properties?.active:current.properties?.active;
  if(!SILM.properties.ids.includes(property))return true;
  const p=(kind==='encerrada'?previous.properties:current.properties)?.[property];
  if(!isParams(p))return false;
  const doc=read(storage,id,z);if(!doc)return false;
  const now=new Date().toISOString(),event={
   sequence:doc.sequence+1,at:now,property,kind,
   summary:details(property,p,kind),parameters:copy(p)
  };
  // Atualizações de controles muito rápidas são agrupadas por propriedade:
  // preserva o último estado efetivamente registrado, nunca uma medida simulada.
  const last=doc.events.at(-1);
  if(kind==='alterada'&&last?.kind==='alterada'&&last.property===property&&
   Date.parse(now)-Date.parse(last.at)<350)doc.events[doc.events.length-1]=event;
  else doc.events.push(event);
  doc.sequence=event.sequence;
  if(doc.events.length>MAX_EVENTS){doc.discarded+=doc.events.length-MAX_EVENTS;doc.events=doc.events.slice(-MAX_EVENTS);}
  return storage.set(PREFIX+id,doc);
 }
 SILM.reportPropertyHistory=Object.freeze({prefix:PREFIX,limit:MAX_EVENTS,read,valid,capture});
})();
