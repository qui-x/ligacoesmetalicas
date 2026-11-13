import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context=vm.createContext({console});
context.window=context;
for(const path of ['data/bundle','data-api','crystal','properties']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),context,{filename:path+'.js'});
}
const S=context.SILM,Fr=S.data.get(87),ref=S.data.structure(Fr);
const science2024='src-fr-robles-navarro-jerabek-schwerdtfeger-2024';
const science2026='src-fr-robles-navarro-schwerdtfeger-2026';

test('Fr é habilitado exclusivamente para explorar uma estrutura prevista, com evidências verificáveis',()=>{
 assert.equal(Fr.symbol,'Fr');
 assert.equal(Fr.silmEligibility.status,'available');
 assert.equal(Fr.silmEligibility.scope,'structure-only');
 assert.equal(ref.evidenceType,'computed');
 assert.equal(ref.kind,'CALCULATED');
 assert.equal(ref.sourceId,science2024);
 assert.equal(ref.contextSourceId,science2026);
 assert.equal(S.data.structureEvidence(Fr).type,'computed');
 assert.match(S.data.structureEvidence(Fr).label,/computacionalmente/);
 assert.ok(S.data.source(science2024)?.url?.startsWith('https://'));
 assert.ok(S.data.source(science2026)?.url?.startsWith('https://'));
 assert.ok(S.data.sourceIds(Fr).includes(science2024));
 assert.ok(S.data.sourceIds(Fr).includes(science2026));
 assert.equal(ref.spaceGroupNumber,225);
 assert.equal(ref.type,'CFC');
 assert.equal(ref.fractionalSites.cellFormulaUnitsZ,4);
 assert.equal(ref.fractionalSites.values.length,4);
});

test('parâmetros da CFC correspondem a R=5,367 Å do modelo PBE-D3, sem atribuir medida experimental',()=>{
 const R=ref.derivation.nearestNeighborDistance.value;
 assert.equal(R,5.367);
 assert.equal(ref.derivation.expression,'a = sqrt(2) * R_fcc');
 assert.ok(Math.abs(R*Math.SQRT2-7.5900841892)<1e-8);
 for(const key of ['a','b','c']){
  assert.equal(ref.latticeParameters[key].value,7.59);
  assert.equal(ref.latticeParameters[key].kind,'CALCULATED');
  assert.equal(ref.latticeParameters[key].sourceId,science2024);
 }
 for(const angle of ['alpha','beta','gamma'])
  assert.equal(ref.latticeParameters[angle].value,90);
 assert.equal(ref.conditions.phase.value,'solid');
 assert.equal(ref.conditions.temperature.value,null,'Não fixar temperatura numérica experimental.');
 assert.equal(ref.conditions.pressure.value,null,'Não inventar pressão observada.');
 assert.match(ref.conditions.temperature.display,/0 K/);
 assert.match(ref.notes,/não estrutura experimental/);
 assert.ok(Fr.reviewedCandidates.some(x=>x.sourceId===science2026));
});

test('motor geral monta célula CFC prevista sem exigir medição experimental',()=>{
 const c=S.crystal.eligibility(Fr);
 assert.equal(c.status,'available',JSON.stringify(c));
 assert.equal(c.structureType,'FCC');
 assert.equal(c.databaseSites.length,4);
 const g=S.crystal.geometry(Fr);
 assert.ok(g);
 assert.equal(g.model.id,'FCC');
 assert.ok(g.cell.length>=4);
 assert.ok(g.index.size>=4);
 assert.ok(g.cell.every(site=>site.cart.every(Number.isFinite)));
});

test('Fr mantém propriedades elétricas térmicas ópticas e mecânicas bloqueadas',()=>{
 assert.deepEqual(Object.keys(Fr.properties),[]);
 const statuses=S.properties.eligibility(Fr);
 for(const id of S.properties.ids){
  assert.equal(statuses[id].status,'unavailable',id);
  assert.equal(statuses[id].reasonCode,'STRUCTURE_ONLY_REFERENCE',id);
 }
});

test('79 metais habilitados; Hg e 12 superpesados continuam indisponíveis',()=>{
 assert.equal(S.data.elements.length,118);
 const available=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(available.length,79);
 assert.deepEqual(Array.from(available.filter(e=>e.silmEligibility.scope==='structure-only'),e=>e.symbol).sort(),
 ['Bk','Cf','Cm','Es','Fm','Fr','Ga','In','Lr','Md','No','Pm','Rf','U']);
 assert.equal(S.data.get(103).silmEligibility.status,'available');
 for(let z=105;z<=116;z++)assert.equal(S.data.get(z).silmEligibility.status,'unavailable');
});
