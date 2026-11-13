import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const c=vm.createContext({console});c.window=c;
for(const path of ['data/bundle','data-api','crystal','properties']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),c,{filename:path+'.js'});
}
const S=c.SILM;
const SOURCE='src-huebener-actinide-metals-2003';
const rows=[
 {z:100,symbol:'Fm',radius:2,a:5.657},
 {z:101,symbol:'Md',radius:1.985,a:5.614},
 {z:102,symbol:'No',radius:1.97,a:5.572}
];
for(const row of rows){
 test(row.symbol+' preserva hipótese CFC geométrica com radius estimado, não DFT nem difração',()=>{
  const e=S.data.get(row.z),ref=S.data.structure(e);
  assert.equal(e.symbol,row.symbol);
  assert.equal(e.silmEligibility.status,'available');
  assert.equal(e.silmEligibility.scope,'structure-only');
  assert.equal(ref.type,'CFC');
  assert.equal(ref.spaceGroupNumber,225);
  assert.equal(ref.evidenceType,'computed');
  assert.equal(ref.predictionMethod,'empirical-geometric');
  assert.equal(ref.sourceId,SOURCE);
  assert.equal(ref.kind,'CALCULATED');
  assert.ok(S.data.source(SOURCE)?.url);
  assert.equal(S.data.structureEvidence(e).method,'empirical-geometric');
  assert.match(S.data.structureEvidence(e).label,/modelo empírico/);
  for(const k of ['a','b','c']){
   assert.equal(ref.latticeParameters[k].value,row.a);
   assert.equal(ref.latticeParameters[k].kind,'CALCULATED');
   assert.equal(ref.latticeParameters[k].sourceId,SOURCE);
  }
  for(const k of ['alpha','beta','gamma'])assert.equal(ref.latticeParameters[k].value,90);
  assert.equal(ref.derivation.metallicRadius.value,row.radius);
  assert.equal(ref.derivation.metallicRadius.kind,'TABULATED');
  assert.ok(Math.abs(ref.derivation.unroundedValue-2*Math.SQRT2*row.radius)<1e-12);
  assert.ok(Math.abs(ref.latticeParameters.a.value-ref.derivation.unroundedValue)<.001);
  assert.equal(ref.fractionalSites.cellFormulaUnitsZ,4);
  assert.equal(ref.fractionalSites.values.length,4);
  assert.equal(ref.conditions.temperature.value,null);
  assert.equal(ref.conditions.pressure.value,null);
  assert.match(ref.conditions.temperature.display,/não equivale a 0 K nem a CNTP/);
  assert.match(ref.notes,/NÃO é uma otimização DFT/);
  assert.equal(Object.keys(e.properties).length,0);
 });
 test(row.symbol+' é navegável na Rede e Centro sem liberar propriedades específicas',()=>{
  const e=S.data.get(row.z),cap=S.crystal.eligibility(e);
  assert.equal(cap.status,'available',JSON.stringify(cap));
  assert.equal(cap.structureType,'FCC');
  assert.equal(cap.databaseSites.length,4);
  const g=S.crystal.geometry(e);
  assert.ok(g);
  assert.equal(g.model.id,'FCC');
  assert.ok(g.cell.length>=4);
  assert.ok(g.index.size>=4);
  assert.ok(g.cell.every(p=>p.cart.every(Number.isFinite)));
  for(const id of S.properties.ids){
   const prop=S.properties.eligibility(e)[id];
   assert.equal(prop.status,'unavailable',row.symbol+' / '+id);
   assert.equal(prop.reasonCode,'STRUCTURE_ONLY_REFERENCE');
  }
 });
}
test('total de 78 habilitados, 13 apenas estruturais; Lr e 12 superpesados seguem bloqueados',()=>{
 assert.equal(S.data.elements.length,118);
 const avail=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(avail.length,78);
 assert.deepEqual(Array.from(avail.filter(e=>e.silmEligibility.scope==='structure-only'),e=>e.symbol).sort(),
 ['Bk','Cf','Cm','Es','Fm','Fr','Ga','In','Md','No','Pm','Rf','U']);
 assert.equal(S.data.get(103).silmEligibility.status,'unavailable');
 assert.equal(S.data.get(80).silmEligibility.status,'unavailable');
 for(let z=105;z<=116;z++)assert.equal(S.data.get(z).silmEligibility.status,'unavailable');
});
