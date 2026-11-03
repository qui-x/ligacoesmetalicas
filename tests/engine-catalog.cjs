'use strict';
/* F1.2: verifica o catálogo declarativo contra o código realmente exportado.
   O teste não executa simulações temporais nem promove representação a modelo físico. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const catalog=require('../domain/silm/engine-catalog.json');
const repo=path.resolve(__dirname,'..');
const S=require('../scripts/validate-scientific-state.cjs').load();

const required=['id','name','api','implementationPath','componentClass','evidenceClass','status','version','applicability','inputs','outputs','units','dependencies','state','time','capabilities','publicApi','limitations','failurePolicy'];
assert.equal(catalog.schemaVersion,1);
assert.equal(catalog.catalogId,'silm.explorar.component-catalog');
assert.equal(catalog.catalogVersion,'0.1.0');
assert.equal(catalog.baseline.fixtureVersion,1);
assert.equal(catalog.product.scientificStateSchemaVersion,8);
assert.equal(S.scientificSchemaVersion,8);
assert.equal(catalog.stateBoundary.schemaVersion,8);
assert.deepEqual(catalog.stateBoundary.modules,['explorar','medir','calcular']);
assert.equal(catalog.baseline.fixtureSet,'tests/fixtures/engine-baseline.json');

const ids=new Set();
for(const entry of catalog.entries){
 for(const key of required)assert.ok(Object.prototype.hasOwnProperty.call(entry,key),entry.id+': campo '+key);
 assert.ok(!ids.has(entry.id),'ID duplicado: '+entry.id);
 ids.add(entry.id);
 assert.ok(fs.existsSync(path.join(repo,entry.implementationPath)),entry.id+': arquivo de implementação não encontrado');
 assert.ok(entry.name.length>0);
 assert.ok(Array.isArray(entry.inputs)&&entry.inputs.length>0,entry.id+': entradas');
 assert.ok(Array.isArray(entry.outputs)&&entry.outputs.length>0,entry.id+': saídas');
 assert.ok(Array.isArray(entry.units)&&entry.units.length>0,entry.id+': unidades e limites');
 assert.ok(Array.isArray(entry.dependencies));
 assert.ok(Array.isArray(entry.capabilities));
 assert.ok(Array.isArray(entry.limitations)&&entry.limitations.length>0);
 assert.ok(entry.version&&typeof entry.version.status==='string');
 if(entry.version.status==='versioned'){
  assert.match(entry.version.value,/^\d+\.\d+\.\d+$/);
  assert.equal(entry.version.baselineFixture,'tests/fixtures/engine-baseline.json#'+entry.id.split('.')[0].replace('crystal','geometry'));
 }else{
  assert.equal(entry.version.value,null,entry.id+': componente sem versão formal deve ser explícito');
  assert.ok(entry.version.reason&&entry.version.reason.length>0,entry.id+': justificativa da lacuna de versão');
 }
}
const byId=new Map(catalog.entries.map(x=>[x.id,x]));
for(const entry of catalog.entries)for(const dependency of entry.dependencies){
 if(dependency==='stateBoundary')assert.ok(catalog.stateBoundary);
 else assert.ok(byId.has(dependency),entry.id+': dependência sem descritor '+dependency);
}

// Carrega a camada renderer no mesmo escopo isolado usado nos testes de contrato.
const box={window:{SILM:S},SILM:S,Math,Float64Array,Uint32Array};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(repo,'domain/silm/electron-view.js'),'utf8'),box,{filename:'electron-view.js'});
const roots={
 crystal:S.crystal,thermal:S.thermal,deformation:S.deformation,drive:S.drive,
 properties:S.properties,data:S.data,measurement:S.measurement,calculation:S.calculation,SILM:S
};
for(const entry of catalog.entries){
 const api=entry.publicApi;
 if(api.root==='source'){
  const source=fs.readFileSync(path.join(repo,entry.implementationPath),'utf8');
  for(const symbol of api.symbols)assert.ok(source.includes(symbol),entry.id+': símbolo não encontrado '+symbol);
  continue;
 }
 const root=roots[api.root];
 assert.ok(root,entry.id+': raiz pública desconhecida '+api.root);
 for(const name of api.functions)assert.equal(typeof root[name],'function',entry.id+': função pública '+name);
 for(const name of api.properties)assert.ok(name in root,entry.id+': propriedade pública '+name);
}

// Limites de classe e relógio não podem ser apagados pelo catálogo.
const get=id=>byId.get(id);
assert.equal(get('crystal.geometry').time.mode,'none');
assert.equal(get('thermal.qualitative-diffusion').time.mode,'own-controller-raf');
assert.equal(get('deformation.qualitative-slip').time.mode,'own-controller-raf');
assert.equal(get('drive.stimulus-controller').time.scientificClock,false);
assert.equal(get('electron-view.marker-renderer').time.mode,'visual-raf');
assert.equal(get('electron-view.marker-renderer').evidenceClass,'VISUAL_QUALITATIVE');
assert.equal(get('measurement.virtual-instrument').evidenceClass,'MODEL_MEASUREMENT');
assert.equal(get('calculation.formula-service').evidenceClass,'CALCULATED');
assert.equal(get('experience.metallic-adapter').evidenceClass,'NOT_SCIENTIFIC');
assert.equal(get('electron-view.marker-renderer').state.persistedFields.length,0);
assert.equal(get('drive.stimulus-controller').state.persistedFields.length,0);
assert.equal(catalog.product.packageVersion,'0.15.5');
assert.equal(catalog.product.persistedModelVersions.structure,2);
assert.equal(catalog.product.persistedModelVersions.electronModel,1);
assert.equal(catalog.product.persistedModelVersions.properties,1);
console.log('PASS engine-catalog: 10 descritores; IDs únicos; caminhos/API conferidos; classes, evidências, unidades, versões e fronteiras temporais/estado.');
