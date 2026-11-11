'use strict';
/* Audita o catálogo científico e o motor de Missões usando os dados locais reais.
   Executar: node .github/scripts/test_learning_contracts.js */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const clone=o=>o===null?null:JSON.parse(JSON.stringify(o));
const context=vm.createContext({Date,JSON,Set,Map,Number,String,Object,Array,Math,console,matchMedia:()=>({matches:true})});
context.window=context;context.SILM={};
const scientific=[
 'domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/crystal.js',
 'domain/silm/properties.js'
];
for(const path of scientific)vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
const S=context.SILM;
// Ferramentas de nome validado: os testes de operações matemáticas pertencem às suas próprias suítes.
S.measurement={types:{distance:{},latticeParameter:{},coordination:{}},current:()=>true};
S.formulas={atoms:{quantity:'effectiveAtoms'},volume:{quantity:'cellVolume'},radius:{quantity:'radius'},packing:{quantity:'packingFactor'}};
for(const path of ['domain/silm/routes.js','domain/silm/missions.js','domain/silm/themes.js']){
 vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
}
const missions=S.missions.registry,themes=S.themes.registry;
assert.ok(missions.length>=27,'O catálogo deve preservar pelo menos 27 missões');
assert.ok(themes.length>=24,'O catálogo deve preservar pelo menos 24 temas');
assert.equal(S.missions.validate(missions).ok,true);
assert.equal(S.themes.validate().ok,true);
const eligible=S.data.elements.filter(e=>e.silmEligibility.status==='available');
const crystals=eligible.filter(e=>S.crystal.eligibility(e).status==='available');
assert.equal(eligible.length,65);
assert.equal(crystals.length,62);
const covered=new Set(missions.flatMap(m=>m.metalSelection.atomicNumbers));
assert.deepEqual([...new Set(eligible.map(e=>e.atomicNumber).filter(z=>!covered.has(z)))],[]);
for(const mission of missions){
 assert.ok(mission.study?.question?.length>20&&mission.study.questions?.length>=2,mission.id);
 assert.ok(mission.evidenceObjectives.length>=2,mission.id);
 assert.equal(mission.evidenceObjectives.filter(o=>o.mode==='criterion').length,1,mission.id);
 assert.equal(new Set(mission.evidenceObjectives.map(x=>x.id)).size,mission.evidenceObjectives.length);
 assert.ok(mission.metalSelection.atomicNumbers.length>=1,mission.id);
 for(const z of mission.metalSelection.atomicNumbers){
  const metal=S.data.get(z);
  assert.equal(metal.silmEligibility.status,'available',mission.id);
  if(mission.structureRequirements==='crystalline')
   assert.equal(S.crystal.eligibility(metal).status,'available',mission.id+' '+metal.symbol);
  for(const property of mission.allowedTools.filter(id=>S.properties.ids.includes(id))){
   assert.notEqual(S.properties.eligibility(metal)[property].status,'unavailable',mission.id+' '+metal.symbol+' '+property);
  }
 }
}
for(const theme of themes){
 assert.ok(theme.investigation?.problem?.length>=20);
 assert.equal(theme.investigation.actions.length,3,theme.id);
 assert.ok(theme.relatedMetals.length>=1);
 for(const id of theme.relatedMissions)assert.ok(S.missions.get(id),theme.id+' -> '+id);
}
assert.deepEqual(Array.from(S.missions.get('objeto-ao-centro').metalSelection.atomicNumbers),[29]);
assert.ok(!S.missions.get('travessia-metais').metalSelection.atomicNumbers.includes(60));
assert.ok(S.missions.get('lantanideos-eletrons').metalSelection.atomicNumbers.includes(60));
assert.deepEqual(Array.from(S.themes.get('cobre-neodimio').relatedMetals),[29,60]);
assert.ok(S.themes.get('cobre-neodimio').investigation.actions[1].includes('rede do neodímio ainda não está homologada'));
assert.equal(S.missions.get('estruturas-gerais').metalSelection.atomicNumbers.length,9);
assert.equal(S.missions.get('empacotamento-referencias').metalSelection.atomicNumbers.length,53);
assert.equal(S.missions.get('bloco-d-diversidade').metalSelection.atomicNumbers.length,28);
// Quinze percursos adicionais com seleção verificável e vínculo bidirecional:
const curatedPairs=[
 ['cobre-prata-ouro','metais-nobres-conducao',[29,47,79]],
 ['ferro-cobalto-niquel','ferro-cobalto-niquel-estruturas',[26,27,28]],
 ['aluminio-cobre','aluminio-cobre-componentes',[13,29]],
 ['titanio-zirconio-hafnio','trio-titanio-zirconio-hafnio',[22,40,72]],
 ['cromo-molibdenio-tungstenio','refratarios-ccc-rede',[24,42,74]],
 ['niobio-tantalo','niobio-tantalo-ccc',[41,73]],
 ['platinoides-cfc','grupo-platina-cfc',[45,46,77,78]],
 ['zinco-cadmio','zinco-cadmio-hc',[30,48]],
 ['estanho-bismuto','estanho-bismuto-nao-canonicos',[50,83]],
 ['lantanideos-dhcp','lantanideos-dhcp',[57,59,60]],
 ['lantanideos-diversos','diversidade-lantanideos',[58,62,64,65,66,70]],
 ['actinideos-estruturas','actinideos-diversidade',[90,91,93,94]],
 ['manganes-polonio','formas-incomuns-metalicas',[25,84]],
 ['cfc-diferentes-familias','cfc-familias-diferentes',[13,20,38,82]],
 ['magnesio-aluminio','magnesio-aluminio-estruturas',[12,13]]
];
for(const [id,themeId,selectedMetals] of curatedPairs){
 const mission=S.missions.get(id),theme=S.themes.get(themeId);
 assert.ok(mission&&theme,id);
 assert.deepEqual(Array.from(mission.metalSelection.atomicNumbers),selectedMetals,id+' metais');
 assert.deepEqual(Array.from(theme.relatedMetals),selectedMetals,themeId+' metais');
 assert.ok(mission.relatedThemes.includes(themeId),id+' tema');
 assert.ok(theme.relatedMissions.includes(id),themeId+' missão');
}
assert.equal(S.missions.registry.length,42);
assert.equal(S.themes.registry.length,39);
assert.equal(S.missions.get('lantanideos-dhcp').structureRequirements,'free');
assert.equal(S.missions.get('lantanideos-dhcp').completionCriteria,'electrons-motion');
for(const z of [57,59,60])assert.notEqual(S.crystal.eligibility(S.data.get(z)).status,'available');

// A execução de sessões abaixo usa um modelo isolado; não altera estado científico real.
S.validateScientificState=()=>({ok:true});
S.workshop={list:z=>[{id:'ref-'+z,atomicNumber:z}],get:id=>({atomicNumber:Number(String(id).slice(4))})};
S.representation={sanitize:val=>val};
S.calculation={current:()=>true};
function setup(){
 let state={schemaVersion:8,investigation:{id:'sample',status:'active'},metal:{atomicNumber:29},
  structure:{mode:'free',units:[]},module:{active:'explorar'},
  properties:{active:null,thermal:{heating:false,stage:0},luster:{light:false},electrical:{field:false},ductility:{elongation:0},malleability:{compression:0}},
  electrons:{representation:{visible:false,motion:false}},measurements:[],calculations:[],metadata:{}};
 let stored=null;
 const model={
  get state(){return clone(state)},snapshot:()=>clone(state),checkpoint:()=>({state:clone(state),history:[]}),
  rollback:cp=>{state=clone(cp.state)},restore:s=>{state=clone(s);return {ok:true}},
  begin:(z,type)=>{state.investigation={id:'sample',status:'active',type};state.metal={atomicNumber:z};return true},
  beginAssembly:()=>{state.structure={mode:'free',units:[]};return true},
  addUnit:()=>{state.structure.units.push({id:state.structure.units.length+1,site:'test'});return{ok:true}},
  organize:()=>{state.structure.mode='crystalline';return{ok:true}},
  setModule:m=>{state.module.active=m;return true},
  setWorkshopContext:(referenceId,scale)=>{state.metadata.workshop={referenceId,scale};return true}
 };
 const storage={get:()=>clone(stored),set:(_key,val)=>{stored=clone(val);return true}};
 const create=()=>S.createRouteSession({model,storage,view:()=>({viewMode:'2d'}),onView:()=>true,say:()=>{}});
 return {model,create,update:fn=>fn(state),getStored:()=>clone(stored),setStored:v=>{stored=clone(v)}};
}
vm.runInContext(fs.readFileSync('domain/silm/route-session.js','utf8'),context,{filename:'route-session.js'});
{
 const {create,update}=setup(),session=create();
 assert.equal(session.start('montagem-ordem',29),true);
 update(s=>{s.structure.mode='crystalline';s.structure.crystallography={representation:{view:'cell'}}});
 session.observe(true);assert.equal(session.ready(),false);
 update(s=>{s.structure.crystallography.representation.view='lattice'});
 session.observe(true);assert.equal(session.ready(),true);
 assert.equal(session.complete().ok,false);
 assert.equal(session.edit('conclusion','A célula descreve repetição, não uma amostra real.'),true);
 assert.equal(session.complete().ok,true);
}
{
 const {create,update,getStored}=setup(),session=create();
 assert.equal(session.start('travessia-metais',29),true);
 for(let scale=1;scale<=4;scale++){update(s=>{s.metadata.workshop={referenceId:'ref-29',scale}});session.observe(true)}
 assert.equal(session.missionProgress().filter(s=>s.met).length,4);
 assert.equal(session.ready(),false);
 // A quinta evidência tem de vir de uma geometria com vizinhança real.
 assert.equal(session.missionProgress()[4].id,'neighbors');
 assert.ok(getStored().current.evidence.mission['scale-4']);
}
{
 const {create,update}=setup(),session=create();
 assert.equal(session.start('lantanideos-eletrons',60),true);
 update(s=>{s.electrons.representation.visible=true});
 session.observe(true);
 update(s=>{s.electrons.representation.visible=false});
 session.observe(true);
 assert.equal(session.missionProgress().filter(x=>x.met).length,2);
 update(s=>{s.electrons.representation.visible=true;s.electrons.representation.motion=true});
 session.observe(true);assert.equal(session.ready(),true);
}
for(const [id,property,patch] of [
 ['calor-metalico','thermal',{heating:true,stage:1}],
 ['brilho-com-luz','luster',{light:true}],
 ['fios-ductilidade','ductility',{elongation:1}]
]){
 const {create,update}=setup(),session=create();
 assert.equal(session.start(id,29),true,id);
 update(s=>{s.structure.crystallography={representation:{view:'cell'}}});
 session.observe(true);update(s=>{s.structure.crystallography.representation.view='lattice'});
 session.observe(true);assert.equal(session.ready(),false,id);
 update(s=>{s.properties.active=property;Object.assign(s.properties[property],patch)});
 session.observe(true);assert.equal(session.ready(),true,id);
}
{
 const ctx=setup(),session=ctx.create();
 assert.equal(session.start('montagem-ordem',29),true);
 const older=ctx.getStored();delete older.current.evidence.mission;ctx.setStored(older);
 const restored=ctx.create();assert.equal(restored.load(),true);
 assert.equal(restored.context().id,'montagem-ordem');
}
console.log('OK: '+missions.length+' missões, '+themes.length+' temas, 65 metais cobertos, 62 redes, critérios e migração de sessões.');
