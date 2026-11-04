'use strict';
/* F1.3 — valida a camada de compatibilidade contra o catálogo e as APIs reais.
   O adapter devolve referências às APIs originais; não mantém estado nem substitui os módulos. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const catalog=require('../domain/silm/engine-catalog.json');
const S=require('../scripts/validate-scientific-state.cjs').load();
const box={window:{SILM:S},SILM:S,Math,Float64Array,Uint32Array,console};
vm.createContext(box);
for(const file of [
 '../domain/silm/electron-view.js',
 '../integracao/metallic-experience.js',
 '../domain/silm/engine-catalog.js',
 '../domain/silm/engine-adapters.js'
])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),box,{filename:file});
const registry=S.engineAdapters;
assert.ok(registry);
assert.deepEqual(Array.from(registry.ids),catalog.entries.map(entry=>entry.id));
assert.ok(Object.isFrozen(S.engineCatalog));
assert.ok(Object.isFrozen(S.engineCatalog.entries[0]));

for(const entry of catalog.entries){
 const resolved=registry.resolve(entry.id);
 assert.equal(resolved.ok,true,entry.id+': resolve');
 assert.strictEqual(resolved.descriptor,S.engineCatalog.entries.find(item=>item.id===entry.id));
 if(entry.publicApi.root==='source'){
  for(const symbol of entry.publicApi.symbols){
   const name=symbol.split('.').at(-1);
   assert.strictEqual(resolved.api[name],S[name],entry.id+': referência direta '+name);
  }
 }else{
  const direct=entry.publicApi.root==='SILM'?S:S[entry.publicApi.root];
  assert.strictEqual(resolved.api,direct,entry.id+': não criar cópia da API');
  for(const name of entry.publicApi.functions)assert.equal(typeof resolved.api[name],'function',entry.id+'.'+name);
 }
}
const reflect=registry.invoke('drive.stimulus-controller','reflect',35);
assert.equal(reflect.ok,true);
assert.deepEqual({...reflect.value},{incidence:35,reflection:35});
assert.equal(registry.resolve('component.inexistente').reason,'ENGINE_UNKNOWN');
assert.equal(registry.invoke('drive.stimulus-controller','solveTransport').reason,'ENGINE_API_NOT_DECLARED');

const broken=Object.create(S);
broken.thermal={...S.thermal,step:undefined};
const brokenRegistry=S.createEngineAdapters(S.engineCatalog,broken);
const unavailable=brokenRegistry.resolve('thermal.qualitative-diffusion');
assert.equal(unavailable.ok,false);
assert.equal(unavailable.reason,'ENGINE_API_MISSING');
assert.ok(unavailable.missingFunctions.includes('step'));

const model={get state(){return S.emptyScientificState();},dispatch(){throw new Error('O adapter não pode escrever no estado.');}};
const before=JSON.stringify(model.state);
const controller=registry.invoke('drive.stimulus-controller','controller',model);
assert.equal(controller.ok,true);
assert.equal(typeof controller.value.setIntensity,'function');
assert.equal(JSON.stringify(model.state),before);
assert.equal(S.createScientificState().state.schemaVersion,8);
console.log('PASS engine-adapters: 10 componentes resolvidos; APIs originais preservadas; chamadas declaradas; ausência e erro estruturados; estado científico sem escrita duplicada.');
