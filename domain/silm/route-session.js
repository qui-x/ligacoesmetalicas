'use strict';
SILM.createRouteSession=({model,storage,view,onView,say})=>{
 const S=SILM,copy=x=>JSON.parse(JSON.stringify(x)),blank=()=>({name:'',date:new Date().toLocaleDateString('pt-BR'),observations:'',interpretation:'',conclusion:''});
 let doc={schemaVersion:1,current:null,attempts:{},completed:{},archives:{}};
 const route=()=>S.routes.get(doc.current?.activityContext.id),open=()=>!!doc.current&&doc.current.activityContext.status!=='closed';
 const save=()=>storage.set('route.session',doc);
 const validScience=s=>S.validateScientificState(s).ok;
 const validReport=r=>r&&['name','date','observations','interpretation','conclusion'].every(k=>typeof r[k]==='string'&&r[k].length<=10000);
 const validAttempt=a=>{const r=S.routes.get(a?.activityContext?.id);return r&&a.activityContext.version===r.version&&a.activityContext.type==='route'&&['active','completed','closed'].includes(a.activityContext.status)&&validScience(a.checkpoint)&&a.checkpoint.module.active===r.module&&r.metalSelection.atomicNumbers.includes(a.checkpoint.metal?.atomicNumber)&&validReport(a.report)&&a.evidence&&['cell','lattice','deformation'].every(k=>typeof a.evidence[k]==='boolean');};
 function load(){
  const saved=storage.get('route.session',null);if(saved===null)return false;
  try{
   if(saved.schemaVersion!==1||!saved.attempts||!saved.completed||!saved.archives)throw Error();
   for(const key of ['attempts','completed','archives'])if(Array.isArray(saved[key])||Object.keys(saved[key]).length>S.routes.registry.length)throw Error();
   for(const [id,a]of [...Object.entries(saved.attempts),...Object.entries(saved.archives)])if(id!==a.activityContext?.id||!validAttempt(a))throw Error();
   for(const [id,v]of Object.entries(saved.completed))if(v!==S.routes.get(id)?.version)throw Error();
   if(saved.current&&(!validAttempt(saved.current)||!validScience(saved.current.freeState)||!saved.current.freeView))throw Error();
   doc=copy(saved);if(open())model.restore(doc.current.checkpoint,{allowLegacy:false});return open();
  }catch{say('O registro de roteiros salvo é incompatível. O original foi preservado; a investigação científica permanece disponível.','warning');return false;}
 }
 function start(id,z,{resume=false}={}){
  const r=S.routes.get(id);if(open()||!r||!r.metalSelection.atomicNumbers.includes(Number(z)))return false;
  const freeState=model.snapshot(),freeView=copy(view());
  const previous=resume?doc.attempts[id]:null;
  if(previous){model.restore(previous.checkpoint,{allowLegacy:false});doc.current={...copy(previous),freeState,freeView};doc.current.activityContext.status='active';}
  else{
   model.begin(Number(z));model.beginAssembly();for(let i=0;i<r.initialState.units;i++)model.addUnit();if(r.initialState.mode==='crystalline'){const result=model.organize();if(!result.ok){model.restore(freeState,{allowLegacy:false});return false;}}
   model.setModule(r.module);doc.current={activityContext:{type:'route',id:r.id,version:r.version,status:'active'},freeState,freeView,checkpoint:model.snapshot(),evidence:{cell:false,lattice:false,deformation:false},report:blank()};
  }
  delete doc.attempts[id];save();return true;
 }
 function observe(visible){
  if(!open())return;const c=doc.current,s=model.state;if(s.investigation?.id!==c.checkpoint.investigation?.id)return;
  if(visible){const v=s.structure?.crystallography?.representation?.view;if(v==='cell')c.evidence.cell=true;if(v==='lattice')c.evidence.lattice=true;if(s.properties.active==='malleability'&&s.properties.malleability.compression>0)c.evidence.deformation=true;}
  const next=model.snapshot();if(JSON.stringify(next)!==JSON.stringify(c.checkpoint)){c.checkpoint=next;save();}else save();
 }
 function ready(){
  if(!open())return false;const c=doc.current,s=model.state;
  switch(route().completionCriteria){
   case 'cell-and-lattice':return c.evidence.cell&&c.evidence.lattice;
   case 'electrons':return !!s.electrons?.representation.visible;
   case 'deform-and-restore':return c.evidence.deformation&&s.properties.malleability.compression===0;
   case 'measure-a':return s.measurements.some(m=>m.type==='latticeParameter'&&m.parameter==='a'&&S.measurement.current(m,s.structure));
   case 'cell-volume':return s.calculations.some(c=>c.type==='cellVolume'&&S.calculation.current(c,s.structure));
  }return false;
 }
 function complete(){if(!open()||!ready())return {ok:false,message:'O critério científico ainda não foi atendido.'};doc.current.activityContext.status='completed';doc.completed[route().id]=route().version;doc.archives[route().id]=copy(doc.current);save();return {ok:true,message:'Roteiro concluído. A bancada continua aberta para revisão.'};}
 function close(){if(!open())return false;const c=doc.current;c.checkpoint=model.snapshot();const finished=c.activityContext.status==='completed';c.activityContext.status='closed';if(finished)doc.archives[c.activityContext.id]=copy(c);else doc.attempts[c.activityContext.id]=copy(c);model.restore(c.freeState,{allowLegacy:false});onView(c.freeView);doc.current=null;save();return true;}
 function edit(key,value){if(!open()||!Object.hasOwn(blank(),key)||typeof value!=='string'||value.length>10000)return false;doc.current.report[key]=value;save();return true;}
 return Object.freeze({load,start,observe,ready,complete,close,edit,open,route,snapshot:()=>copy(doc),context:()=>open()?copy(doc.current.activityContext):null,allows:tool=>!open()||route().allowedTools.includes(tool),lockedModule:()=>open()?route().module:null,report:id=>open()&&(!id||id===route().id)?copy(doc.current):copy(doc.archives[id]||null)});
};
