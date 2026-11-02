'use strict';
SILM.createRouteSession=({model,storage,view,onView,say})=>{
 const S=SILM,registry=S.activities||S.routes,copy=x=>JSON.parse(JSON.stringify(x)),blank=()=>({name:'',className:'',date:new Date().toLocaleDateString('pt-BR'),teacher:'',group:'',observations:'',analysis:'',interpretation:'',answer:'',conclusion:''});
 let doc={schemaVersion:1,current:null,attempts:{},completed:{},archives:{}},transitioning=0;
 const route=()=>registry.get(doc.current?.activityContext.id),open=()=>!!doc.current&&doc.current.activityContext.status!=='closed';
 const save=()=>storage.set('route.session',doc);
 function atomic(fn){
  const previous=copy(doc),checkpoint=model.checkpoint(),previousView=copy(view());
  const rollback=()=>{doc=previous;model.rollback(checkpoint);onView(previousView,{persist:false});if(!storage.transaction)storage.set('scientific.state',checkpoint.state);};
  const run=()=>{const value=fn();if(value===false)throw Error('TRANSITION_REJECTED');if(!save())throw Error('STORAGE_FAILURE');return value;};
  transitioning++;
  try{
   if(storage.transaction){const result=storage.transaction(run,{onRollback:rollback});if(result.ok)return {ok:true,value:result.value};}
   else{try{return {ok:true,value:run()};}catch{rollback();}}
   say('A alteração não foi salva. A sessão anterior foi preservada.','warning');return {ok:false};
  }finally{transitioning--;}
 }
 const validScience=s=>S.validateScientificState(s).ok;
 const validReport=r=>r&&['name','date','observations','interpretation','conclusion'].every(k=>typeof r[k]==='string'&&r[k].length<=10000);
 /* Etapa 11: atividade preparada pelo professor = roteiro/missão do catálogo + restrições (título, metais e recursos dentro
    dos liberados, navegação). A sobreposição só restringe; o critério continua o do roteiro/missão. */
 const validTeacher=(t,r,z)=>{if(t===undefined)return true;const T=S.teacherActivities;if(!T||!t||typeof t!=='object')return false;
  try{const c=T.validate({schema:T.schema,id:t.id,type:r.type==='mission'?'mission':'route',item:r.id,title:t.title,metals:t.metals,tools:t.tools,navigation:t.navigation,identification:{}});return c.title===t.title&&(z===undefined||c.metals.includes(z));}catch{return false;}};
 const teacherOf=c=>({id:c.id,title:c.title,metals:[...c.metals],tools:[...c.tools],navigation:c.navigation});
 const validAttempt=a=>{const r=registry.get(a?.activityContext?.id);return r&&validTeacher(a.activityContext.teacher,r,a.checkpoint?.metal?.atomicNumber)&&a.activityContext.version===r.version&&a.activityContext.type===(r.type||'route')&&['active','completed','closed'].includes(a.activityContext.status)&&validScience(a.checkpoint)&&a.checkpoint.module.active===r.module&&r.metalSelection.atomicNumbers.includes(a.checkpoint.metal?.atomicNumber)&&validReport(a.report)&&a.evidence&&['cell','lattice','deformation'].every(k=>typeof a.evidence[k]==='boolean');};
 function load(){
  const saved=storage.get('route.session',null);if(saved===null)return false;
  try{
   if(saved.schemaVersion!==1||!saved.attempts||!saved.completed||!saved.archives)throw Error();
   for(const key of ['attempts','completed','archives'])if(Array.isArray(saved[key])||Object.keys(saved[key]).length>registry.registry.length)throw Error();
   for(const [id,a]of [...Object.entries(saved.attempts),...Object.entries(saved.archives)])if(id!==a.activityContext?.id||!validAttempt(a))throw Error();
   for(const [id,v]of Object.entries(saved.completed))if(v!==registry.get(id)?.version)throw Error();
   if(saved.current&&(!validAttempt(saved.current)||!validScience(saved.current.freeState)||!saved.current.freeView))throw Error();
   const cleanAttempt=a=>{const value={};for(const key of ['activityContext','freeState','freeView','checkpoint','evidence','report'])if(a[key]!==undefined)value[key]=copy(a[key]);if(value.freeView&&S.representation)value.freeView=S.representation.sanitize(value.freeView,value.freeState?.investigation?.id??null);value.activityContext={type:a.activityContext.type,id:a.activityContext.id,version:a.activityContext.version,status:a.activityContext.status};if(a.activityContext.teacher)value.activityContext.teacher=teacherOf(a.activityContext.teacher);value.evidence={cell:a.evidence.cell,lattice:a.evidence.lattice,deformation:a.evidence.deformation};value.report=Object.fromEntries(Object.keys(blank()).map(k=>[k,typeof a.report[k]==='string'?a.report[k]:'']));return value;};
   doc={schemaVersion:1,current:saved.current?cleanAttempt(saved.current):null,attempts:Object.fromEntries(Object.entries(saved.attempts).map(([id,a])=>[id,cleanAttempt(a)])),completed:copy(saved.completed),archives:Object.fromEntries(Object.entries(saved.archives).map(([id,a])=>[id,cleanAttempt(a)]))};if(JSON.stringify(doc)!==JSON.stringify(saved))save();if(open())model.restore(doc.current.checkpoint,{allowLegacy:false});return open();
  }catch{say('O registro de roteiros salvo é incompatível. O original foi preservado; a investigação científica permanece disponível.','warning');return false;}
 }
 function start(id,z,{resume=false,teacher=null}={}){
  const r=registry.get(id);if(open()||!r||!r.metalSelection.atomicNumbers.includes(Number(z)))return false;
  if(teacher&&(teacher.item!==r.id||!validTeacher(teacherOf(teacher),r,Number(z))))return false;
  return atomic(()=>{
   // Retomar só a tentativa do mesmo contexto: a de uma atividade do professor não vira a do roteiro livre, e vice-versa.
   const saved=doc.attempts[id],sameContext=saved&&(saved.activityContext.teacher?.id||null)===(teacher?.id||null),freeState=model.snapshot(),freeView=copy(view()),previous=resume&&sameContext?saved:null;
   if(previous){if(!model.restore(previous.checkpoint,{allowLegacy:false}).ok)return false;doc.current={...copy(previous),freeState,freeView};doc.current.activityContext.status='active';}
   else{
    if(!model.begin(Number(z),r.type==='mission'?'mission':'route')||!model.beginAssembly())return false;
    for(let i=0;i<r.initialState.units;i++)if(!model.addUnit().ok)return false;
    if(r.initialState.mode==='crystalline'&&!model.organize().ok)return false;
    if(!model.setModule(r.module))return false;
    doc.current={activityContext:{type:r.type||'route',id:r.id,version:r.version,status:'active',...(teacher?{teacher:teacherOf(teacher)}:{})},freeState,freeView,checkpoint:model.snapshot(),evidence:{cell:false,lattice:false,deformation:false},report:blank()};
    if(teacher)for(const k of ['className','teacher','date'])if(teacher.identification?.[k])doc.current.report[k]=teacher.identification[k];
   }
   delete doc.attempts[id];return true;
  }).ok;
 }
 function observe(visible){
  if(!open()||transitioning)return;const c=doc.current,s=model.state;if(s.investigation?.id!==c.checkpoint.investigation?.id)return;
  const evidence=copy(c.evidence);
  if(visible){const v=s.structure?.crystallography?.representation?.view;if(v==='cell')evidence.cell=true;if(v==='lattice')evidence.lattice=true;if(s.properties.active==='malleability'&&s.properties.malleability.compression>0)evidence.deformation=true;}
  const next=model.snapshot();if(JSON.stringify(next)===JSON.stringify(c.checkpoint)&&JSON.stringify(evidence)===JSON.stringify(c.evidence))return;
  return atomic(()=>{doc.current.checkpoint=next;doc.current.evidence=evidence;return true;}).ok;
 }
 function ready(){
  if(!open())return false;const c=doc.current,s=model.state;
  switch(route().completionCriteria){
   case 'crystalline':return s.structure?.mode==='crystalline';
   case 'neighbors':{const r=s.structure?.crystallography?.representation,u=s.structure?.units.find(u=>u.id===r?.selectedUnitId);return !!(r?.neighbors&&u&&S.crystal.geometry(S.data.get(s.metal.atomicNumber)).neighbors(u.site).list.length);}
   case 'electrons-motion':return !!s.electrons?.representation.visible&&!!s.electrons?.representation.motion;
   case 'property-field':return s.properties.active==='electrical'&&s.properties.electrical.field;
   case 'packing-factor':return s.calculations.some(c=>c.type==='packingFactor'&&S.calculation.current(c,s.structure));
   case 'cell-and-lattice':return c.evidence.cell&&c.evidence.lattice;
   case 'electrons':return !!s.electrons?.representation.visible;
   case 'deform-and-restore':return c.evidence.deformation&&s.properties.malleability.compression===0;
   case 'measure-a':return s.measurements.some(m=>m.type==='latticeParameter'&&m.parameter==='a'&&S.measurement.current(m,s.structure));
   case 'cell-volume':return s.calculations.some(c=>c.type==='cellVolume'&&S.calculation.current(c,s.structure));
  }return false;
 }
 function complete(){if(!open()||!ready())return {ok:false,message:'O critério científico ainda não foi atendido.'};const result=atomic(()=>{doc.current.activityContext.status='completed';doc.completed[route().id]=route().version;doc.archives[route().id]=copy(doc.current);return true;});return result.ok?{ok:true,message:(route().type==='mission'?'Missão concluída.':'Roteiro concluído.')+' A oficina continua aberta para revisão.'}:{ok:false,message:'Não foi possível guardar a conclusão. A atividade continua aberta.'};}
 function close(){if(!open())return false;return atomic(()=>{const c=doc.current;c.checkpoint=model.snapshot();const finished=c.activityContext.status==='completed';c.activityContext.status='closed';if(finished)doc.archives[c.activityContext.id]=copy(c);else doc.attempts[c.activityContext.id]=copy(c);if(!model.restore(c.freeState,{allowLegacy:false}).ok)return false;if(onView(c.freeView)===false)return false;doc.current=null;return true;}).ok;}
 function edit(key,value){if(!open()||!Object.hasOwn(blank(),key)||typeof value!=='string'||value.length>10000)return false;return atomic(()=>{doc.current.report[key]=value;return true;}).ok;}
 return Object.freeze({load,start,observe,ready,complete,close,edit,open,route,get inTransition(){return transitioning>0;},snapshot:()=>copy(doc),context:()=>open()?copy(doc.current.activityContext):null,allows:tool=>!open()||route().allowedTools.includes(tool)&&(!doc.current.activityContext.teacher||doc.current.activityContext.teacher.tools.includes(tool)),
  teacher:()=>open()&&doc.current.activityContext.teacher?copy(doc.current.activityContext.teacher):null,title:()=>open()?(doc.current.activityContext.teacher?.title||route().title):null,lockedModule:()=>open()?route().module:null,report:id=>open()&&(!id||id===route().id)?copy(doc.current):copy(doc.archives[id]||null)});
};
