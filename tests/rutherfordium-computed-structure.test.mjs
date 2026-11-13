import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const ctx=vm.createContext({console});ctx.window=ctx;
for(const path of ['data/bundle','data-api','crystal','properties']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),ctx,{filename:path+'.js'});
}
const S=ctx.SILM,rf=S.data.get(104),ref=S.data.structure(rf);
const source='src-rf-gyanchandani-sikka-2012';

test('Rf é o único superpesado habilitado, com proveniência computacional explícita',()=>{
 assert.equal(rf.symbol,'Rf');
 assert.equal(rf.classification.metallic,true);
 assert.equal(rf.silmEligibility.status,'available');
 assert.equal(rf.silmEligibility.scope,'structure-only');
 assert.equal(ref.type,'HC');
 assert.equal(ref.spaceGroupNumber,194);
 assert.equal(ref.evidenceType,'computed');
 assert.equal(ref.kind,'CALCULATED');
 assert.equal(ref.sourceId,source);
 assert.equal(S.data.structureEvidence(rf).type,'computed');
 assert.match(S.data.structureEvidence(rf).label,/computacionalmente/);
 assert.ok(S.data.source(source)?.url);
 assert.ok(S.data.sourceIds(rf).includes(source));
 assert.equal(ref.conditions.temperature.value,0);
 assert.match(ref.conditions.temperature.display,/cálculo, não medida/);
 assert.equal(ref.conditions.pressure.value,null);
 assert.equal(ref.conditions.phase.value,'solid');
 assert.match(ref.phaseLabel,/0 K/);
});

test('Rf-HC usa a=3,269 Å, c/a=1,590 e c=5,198 Å da coluna SR+SO da tabela 1',()=>{
 assert.equal(ref.derivation.inputs.a.value,3.269);
 assert.equal(ref.derivation.inputs.cOverA.value,1.59);
 assert.equal(ref.derivation.nearestNeighborDistance.value,3.212);
 assert.ok(Math.abs(3.269*1.59-5.19771)<1e-10);
 for(const k of ['a','b'])assert.equal(ref.latticeParameters[k].value,3.269);
 assert.equal(ref.latticeParameters.c.value,5.198);
 assert.equal(ref.latticeParameters.alpha.value,90);
 assert.equal(ref.latticeParameters.beta.value,90);
 assert.equal(ref.latticeParameters.gamma.value,120);
 assert.equal(ref.fractionalSites.cellFormulaUnitsZ,2);
 assert.equal(ref.fractionalSites.values.length,2);
});

test('Rf-HC usa o motor existente de célula e rede, sem modelagem inventada',()=>{
 const elig=S.crystal.eligibility(rf);
 assert.equal(elig.status,'available',JSON.stringify(elig));
 assert.equal(elig.structureType,'HCP');
 assert.equal(elig.databaseSites.length,2);
 const geometry=S.crystal.geometry(rf);
 assert.ok(geometry);
 assert.equal(geometry.model.id,'HCP');
 assert.ok(geometry.cell.length>=2);
 assert.ok(geometry.index.size>=2);
 assert.ok(geometry.cell.every(x=>x.cart.every(Number.isFinite)));
});

test('Rf não recebe propriedades específicas a partir de estrutura calculada',()=>{
 assert.equal(Object.keys(rf.properties||{}).length,0);
 const props=S.properties.eligibility(rf);
 for(const id of S.properties.ids){
  assert.equal(props[id].status,'unavailable',id);
  assert.equal(props[id].reasonCode,'STRUCTURE_ONLY_REFERENCE',id);
 }
});

test('75 de 92 metais estão disponíveis; outros 12 superpesados e Fm–Lr permanecem bloqueados',()=>{
 assert.equal(S.data.elements.length,118);
 assert.equal(S.data.elements.filter(e=>e.classification.metallic).length,92);
 const allowed=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(allowed.length,75);
 assert.deepEqual(Array.from(allowed.filter(e=>e.silmEligibility.scope==='structure-only'),e=>e.symbol).sort(),
 ['Bk','Cf','Cm','Es','Fr','Ga','In','Pm','Rf','U']);
 for(let z=105;z<=116;z++)assert.equal(S.data.get(z).silmEligibility.status,'unavailable','Z='+z);
 for(const z of [100,101,102,103])assert.equal(S.data.get(z).silmEligibility.status,'unavailable','Z='+z);
});
