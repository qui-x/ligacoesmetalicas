'use strict';
/* Contrato de continuidade: professor/metal/roteiro livre têm históricos
   independentes; backups v1 são migrados sem descartar observações. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const clone=x=>x===null?null:JSON.parse(JSON.stringify(x));
const ctx=vm.createContext({Date,JSON,Set,Map,Number,String,Object,Array,Math,console,matchMedia:()=>({matches:true})});
ctx.window=ctx;ctx.SILM={};
const S=ctx.SILM;
for(const p of ['domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/crystal.js','domain/silm/properties.js'])
 vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p});
S.measurement={types:{distance:{},latticeParameter:{},coordination:{}},current:()=>true};
S.formulas={atoms:{quantity:'effectiveAtoms'},volume:{quantity:'cellVolume'},radius:{quantity:'radius'},packing:{quantity:'packingFactor'}};
for(const p of ['domain/silm/routes.js','domain/silm/missions.js','domain/silm/themes.js','domain/silm/manual.js','domain/silm/teacher-activities.js'])
 vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p});
S.validateScientificState=()=>({ok:true});S.representation={sanitize:x=>x};
S.workshop={list:z=>[{id:'ref-'+z,atomicNumber:z}],get:id=>({atomicNumber:Number(id.slice(4))})};
S.calculation={current:()=>true};
vm.runInContext(fs.readFileSync('domain/silm/route-session.js','utf8'),ctx,{filename:'route-session.js'});
const route=S.routes.get('ordem-metal'),metals=route.metalSelection.atomicNumbers.slice(0,2);
assert.equal(metals.length,2);
const makeTeacher=(id,title,item=route)=>S.teacherActivities.validate({
 schema:1,id,type:'route',item:item.id,title,metals:item===route?metals:[item.metalSelection.atomicNumbers[0]],
 tools:[...item.allowedTools],navigation:'restrita',identification:{teacher:'Professor teste',className:'T1'}
});
const a=makeTeacher('act-professor-a11111','Atividade A');
const b=makeTeacher('act-professor-b22222','Atividade B');
function fixture(initial=null){
 let stored=clone(initial),serial=0;
 let state={schemaVersion:8,investigation:{id:'free',status:'active'},metal:{atomicNumber:metals[0]},
  structure:{mode:'free',units:[]},module:{active:'explorar'},
  properties:{active:null,thermal:{heating:false,stage:0},luster:{light:false},electrical:{field:false},ductility:{elongation:0},malleability:{compression:0}},
  electrons:{representation:{visible:false,motion:false}},measurements:[],calculations:[],metadata:{}};
 const model={
  get state(){return clone(state)},snapshot:()=>clone(state),checkpoint:()=>({state:clone(state),history:[]}),
  rollback:cp=>{state=clone(cp.state)},restore:s=>{state=clone(s);return {ok:true}},
  begin:(z,type)=>{state.investigation={id:'invest-'+(++serial),status:'active',type};state.metal={atomicNumber:z};return true},
  beginAssembly:()=>{state.structure={mode:'free',units:[]};return true},
  addUnit:()=>{state.structure.units.push({id:state.structure.units.length+1,site:'a'});return {ok:true}},
  organize:()=>{state.structure.mode='crystalline';return {ok:true}},
  setModule:m=>{state.module.active=m;return true},
  setWorkshopContext:()=>true
 };
 const storage={get:()=>clone(stored),set:(_key,v)=>{stored=clone(v);return true}};
 const create=()=>S.createRouteSession({model,storage,view:()=>({viewMode:'2d'}),onView:()=>true,say:()=>{}});
 return {create,model,storage,get:()=>clone(stored),set:x=>{stored=clone(x)}};
}
const f=fixture(),s=f.create();
function leave(teacher,z,description){
 assert.equal(s.start(route.id,z,{teacher}),true);
 assert.equal(s.edit('observations',description),true);
 assert.equal(s.close(),true);
}
leave(a,metals[0],'Aluno A no metal 1');
leave(a,metals[1],'Aluno A no metal 2');
leave(b,metals[0],'Aluno B no metal 1');
leave(null,metals[0],'Roteiro livre preservado');
const records=f.get();
assert.equal(Object.keys(records.attempts).length,4);
assert.ok(records.attempts[route.id]);
const restored=f.create();
assert.equal(restored.load(),false,'Não há sessão ativa, apenas tentativas');
for(const [teacher,z,expected]of [
 [a,metals[0],'Aluno A no metal 1'],
 [a,metals[1],'Aluno A no metal 2'],
 [b,metals[0],'Aluno B no metal 1'],
 [null,metals[0],'Roteiro livre preservado']
]){
 assert.equal(restored.resumable(route.id,z,teacher),true);
 assert.equal(restored.start(route.id,z,{teacher,resume:true}),true);
 assert.equal(restored.report().report.observations,expected);
 assert.equal(restored.close(),true);
}
assert.equal(restored.resumable(route.id,metals[0],makeTeacher(a.id,'Outra configuração')),false);
const old=fixture(),legacy=old.create();
assert.equal(legacy.start(route.id,metals[0],{teacher:a}),true);
assert.equal(legacy.edit('observations','Legado da versão anterior'),true);
assert.equal(legacy.close(),true);
const value=old.get(),legacyKey=Object.keys(value.attempts)[0];
value.attempts[route.id]=value.attempts[legacyKey];delete value.attempts[legacyKey];
old.set(value);
const migrated=old.create();
assert.equal(migrated.load(),false);
assert.ok(!Object.hasOwn(old.get().attempts,route.id),'O documento legado migrou de chave');
assert.equal(migrated.resumable(route.id,metals[0],a),true);
assert.equal(migrated.start(route.id,metals[0],{teacher:a,resume:true}),true);
assert.equal(migrated.report().report.observations,'Legado da versão anterior');
assert.equal(migrated.close(),true);
const finish=fixture(),completed=finish.create(),electrons=S.routes.get('eletrons-metal');
const teacher=makeTeacher('act-professor-c33333','Tarefa eletrônica',electrons),z=electrons.metalSelection.atomicNumbers[0];
assert.equal(completed.start(electrons.id,z,{teacher}),true);
finish.model.restore({...finish.model.snapshot(),electrons:{representation:{visible:true,motion:true}}});
assert.equal(completed.complete().ok,true);
assert.equal(finish.get().completed[electrons.id],undefined,'Conclusão docente não conclui roteiro livre');
assert.ok(Object.keys(finish.get().archives).some(k=>k.startsWith(electrons.id+'@'+teacher.id+'-')));
assert.equal(completed.close(),true);
console.log('OK: 4 tentativas independentes, retomada, migração v1, observações e conclusão por professor/metal.');
