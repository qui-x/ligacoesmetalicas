'use strict';
/* Contratos dos Roteiros Experimentais: dados reais, elegibilidade,
   conteúdo e compatibilidade das cinco atividades históricas. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({Date,JSON,Set,Map,Number,String,Object,Array,Math,console});
ctx.window=ctx;ctx.SILM={};
for(const file of ['domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/crystal.js','domain/silm/properties.js']){
 vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
}
const S=ctx.SILM;
S.measurement={types:{distance:{},latticeParameter:{},coordination:{}},current:()=>true};
S.formulas={atoms:{quantity:'effectiveAtoms'},volume:{quantity:'cellVolume'},radius:{quantity:'radius'},packing:{quantity:'packingFactor'}};
vm.runInContext(fs.readFileSync('domain/silm/routes.js','utf8'),ctx,{filename:'routes.js'});
const scripts=S.routes.registry;
assert.equal(scripts.length,26,'Os 26 roteiros devem aparecer no catálogo');
assert.equal(S.routes.validate(scripts).ok,true);
const ids=new Set(),eligible=S.data.elements.filter(e=>e.silmEligibility.status==='available'&&e.silmEligibility.scope!=='structure-only');
const covered=new Set(scripts.flatMap(x=>x.metalSelection.atomicNumbers));
assert.equal(eligible.length,65);
assert.deepEqual(Array.from(eligible.filter(e=>!covered.has(e.atomicNumber)),e=>e.symbol),[]);
for(const route of scripts){
 assert.ok(!ids.has(route.id),'Roteiro duplicado: '+route.id);ids.add(route.id);
 assert.equal(route.version,1,'Não invalidar versões históricas');
 const study=route.study;
 assert.ok(study?.question?.length>=20,route.id+' - pergunta');
 assert.ok(study?.hypothesis?.length>=20,route.id+' - previsão');
 assert.ok(study?.tasks?.length>=4,route.id+' - passos');
 assert.ok(study?.observe?.length>=3,route.id+' - observação');
 assert.ok(study?.interpretation?.length>=2,route.id+' - interpretação');
 assert.ok(study?.limits?.length>=20,route.id+' - limites');
 assert.ok(study?.teacher?.length>=20,route.id+' - professor');
 assert.ok(route.metalSelection.atomicNumbers.length>=1,route.id);
 for(const z of route.metalSelection.atomicNumbers){
  const e=S.data.get(z);
  assert.equal(e.silmEligibility.status,'available',route.id);
  if(route.structureRequirements==='crystalline')assert.equal(S.crystal.eligibility(e).status,'available',route.id+' '+e.symbol);
  for(const name of route.allowedTools.filter(x=>S.properties.ids.includes(x)))
   assert.notEqual(S.properties.eligibility(e)[name].status,'unavailable',route.id+' '+e.symbol+' '+name);
 }
}
for(const id of ['ordem-metal','eletrons-metal','deformacao-metal','medindo-ordem','volume-celula']){
 const route=S.routes.get(id);assert.ok(route);
 assert.equal(route.version,1);
}
for(const [id,selected,mode] of [
 ['roteiro-lantanideos',16,'free'],['roteiro-objeto-centro',62,'free'],['roteiro-campo-eletrico',62,'free'],
 ['roteiro-ccc',15,'crystalline'],['roteiro-cfc',16,'crystalline'],['roteiro-hc',22,'crystalline'],
 ['roteiro-gerais',9,'crystalline'],['roteiro-empacotamento',53,'crystalline'],
 ['roteiro-comparar-cu-al',2,'crystalline'],['roteiro-cu-nd',2,'free']
]){
 const route=S.routes.get(id);assert.ok(route,id);
 assert.equal(route.metalSelection.atomicNumbers.length,selected,id);
 assert.equal(route.structureRequirements,mode,id);
}
assert.deepEqual(Array.from(S.routes.get('roteiro-cu-nd').metalSelection.atomicNumbers),[29,60]);
const rareEarth=S.routes.get('roteiro-lantanideos');
assert.deepEqual(Array.from(rareEarth.metalSelection.atomicNumbers),[21,39,57,58,59,60,62,63,64,65,66,67,68,69,70,71]);
assert.ok(rareEarth.metalSelection.atomicNumbers.includes(21),'Escândio deve fazer parte das terras raras');
assert.ok(rareEarth.metalSelection.atomicNumbers.includes(39),'Ítrio deve fazer parte das terras raras');
assert.ok(!rareEarth.metalSelection.atomicNumbers.includes(61),'Pm só está homologado para cristalografia livre, não para roteiros');
assert.equal(rareEarth.module,'explorar');
assert.equal(rareEarth.study.tasks.length,5);
assert.ok(rareEarth.study.question.includes('explorando objetos'));
assert.ok(rareEarth.allowedTools.includes('electrons'));
assert.ok(rareEarth.allowedTools.includes('electrical'));
assert.ok(!S.routes.get('roteiro-objeto-centro').metalSelection.atomicNumbers.includes(60));
assert.equal(S.crystal.eligibility(S.data.get(60)).status,'unavailable');
console.log('OK: 26 roteiros, 65 metais, 62 redes; pergunta, hipótese, passos, registros, critérios científicos e versões históricas.');
