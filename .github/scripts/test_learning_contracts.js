'use strict';
/* Teste sem dependências externas: contratos pedagógicos + estado persistido.
   Executar na raiz: node .github/scripts/test_learning_contracts.js */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const clone=o=>JSON.parse(JSON.stringify(o));
const ids=['ordem-metal','eletrons-metal','deformacao-metal','medindo-ordem','volume-celula'];
const elements=[12,26,29,60].map(z=>({
 atomicNumber:z,silmEligibility:{status:'available'},
 name:({12:'Magnésio',26:'Ferro',29:'Cobre',60:'Neodímio'})[z]
}));
const S={
 data:{elements,get:z=>elements.find(e=>e.atomicNumber===Number(z))||null,sourceIds:()=>['src-silm-conventions'],source:()=>({title:'Convenções SILM'})},
 crystal:{eligibility:()=>({status:'available',general:false}),geometry:()=>({neighbors:()=>({list:[1,2,3]})})},
 routes:{registry:ids.map(id=>({id})),get:id=>ids.includes(id)?{id}:null,validate:()=>({ok:true})},
 workshop:{list:z=>[{id:'ref-'+z,atomicNumber:Number(z)}],get:id=>id?.startsWith('ref-')?{atomicNumber:Number(id.slice(4))}:null},
 validateScientificState:()=>({ok:true}),calculation:{current:()=>true},measurement:{current:()=>true},
 representation:{sanitize:view=>view}
};
const context=vm.createContext({SILM:S,matchMedia:()=>({matches:true}),Date,JSON,Object,Array,Number,String,Set,Map});
for(const path of ['domain/silm/missions.js','domain/silm/themes.js','domain/silm/route-session.js']){
 vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
}
assert.equal(S.missions.registry.length,7);
assert.equal(S.themes.registry.length,8);
assert.deepEqual(Array.from(S.missions.get('objeto-ao-centro').metalSelection.atomicNumbers),[29,60]);
assert.deepEqual(Array.from(S.themes.get('cobre-neodimio').relatedMetals),[29,60]);
assert.equal(S.themes.validate().ok,true);
for(const mission of S.missions.registry){
 const list=mission.evidenceObjectives;
 assert.ok(list.length>=2,mission.id);
 assert.equal(new Set(list.map(x=>x.id)).size,list.length);
 assert.equal(list.filter(x=>x.mode==='criterion').length,1);
 assert.ok(mission.study?.question&&mission.study?.questions?.length>=2);
}
for(const theme of S.themes.registry){
 assert.equal(theme.investigation.actions.length,3);
}
function setup(){
 let state={investigation:{id:'sample',status:'active'},metal:{atomicNumber:29},structure:null,module:{active:'explorar'},
  properties:{active:null,malleability:{compression:0},electrical:{field:false}},
  electrons:{representation:{visible:false,motion:false}},measurements:[],calculations:[],metadata:{}};
 let stored=null;
 const model={
  get state(){return clone(state)},
  snapshot:()=>clone(state),
  checkpoint:()=>({state:clone(state),history:[]}),
  rollback:cp=>{state=clone(cp.state)},
  restore:s=>{state=clone(s);return{ok:true}},
  begin:(z,type)=>{state.investigation={id:'sample',status:'active',type};state.metal={atomicNumber:z};return true},
  beginAssembly:()=>{state.structure={mode:'free',units:[]};return true},
  addUnit:()=>{state.structure.units.push({id:state.structure.units.length+1,site:'test'});return{ok:true}},
  organize:()=>{state.structure.mode='crystalline';return{ok:true}},
  setModule:m=>{state.module.active=m;return true},
  setWorkshopContext:(referenceId,scale)=>{state.metadata.workshop={referenceId,scale};return true}
 };
 const storage={get:()=>clone(stored),set:(_key,val)=>{stored=clone(val);return true}};
 const create=()=>S.createRouteSession({model,storage,view:()=>({viewMode:'2d'}),onView:()=>true,say:()=>{}});
 return {model,storage,create,getStored:()=>clone(stored),setStored:v=>{stored=clone(v)},update:fn=>fn(state)};
}
{
 const {create,model,update}=setup(),session=create();
 assert.equal(session.start('montagem-ordem',29),true);
 update(s=>{s.structure.mode='crystalline'});
 assert.equal(session.ready(),false,'Organizar não basta: falta célula e rede');
 update(s=>{s.structure.crystallography={representation:{view:'cell'}}});
 session.observe(true);
 assert.equal(session.ready(),false);
 update(s=>{s.structure.crystallography.representation.view='lattice'});
 session.observe(true);
 assert.equal(session.ready(),true);
 assert.equal(session.complete().ok,false,'Conclusão escrita exigida');
 assert.equal(session.edit('conclusion','Comparar a célula e a rede não é medir uma amostra real.'),true);
 assert.equal(session.complete().ok,true);
}
{
 const {create,update,getStored,setStored}=setup(),session=create();
 assert.equal(session.start('objeto-ao-centro',29),true);
 assert.equal(session.missionProgress().length,5);
 for(const level of [1,2,3,4]){
  update(s=>{s.metadata.workshop={referenceId:'ref-29',scale:level}});
  session.observe(true);
 }
 assert.equal(session.missionProgress().filter(x=>x.met).length,4);
 assert.equal(session.ready(),false);
 update(s=>{
  s.structure.mode='crystalline';
  s.structure.crystallography={representation:{neighbors:true,selectedUnitId:1,view:'lattice'}};
 });
 session.observe(true);
 assert.equal(session.ready(),true);
 assert.equal(session.complete().ok,false);
 assert.equal(session.edit('conclusion','Quatro escalas não equivalem à microscopia da amostra.'),true);
 assert.equal(session.complete().ok,true);
 const saved=getStored();
 assert.equal(saved.current.evidence.mission['scale-4'],true);
 assert.equal(saved.completed['objeto-ao-centro'],1);
}
{
 const ctx=setup(),session=ctx.create();
 assert.equal(session.start('montagem-ordem',29),true);
 // Registros anteriores: flags cell/lattice/deformation existiam sem mission.
 const old=ctx.getStored();delete old.current.evidence.mission;ctx.setStored(old);
 const restored=ctx.create();
 assert.equal(restored.load(),true,'Tentativa antiga continua recuperável');
 assert.equal(restored.context().id,'montagem-ordem');
 assert.deepEqual(Object.keys(ctx.getStored().current.evidence.mission),[]);
}
console.log('OK: 7 missões, 8 temas, cinco evidências por escala, conclusão e migração sem perda.');
