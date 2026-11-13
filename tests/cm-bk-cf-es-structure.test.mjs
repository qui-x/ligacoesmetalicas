import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const context=vm.createContext({console});context.window=context;
for(const path of ['data/bundle','data-api','crystal','properties']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),context,{filename:path+'.js'});
}
const S=context.SILM;
const records=[
 {z:96,symbol:'Cm',type:'DHCP',sg:194,count:4,a:3.496,c:11.331,source:'src-cm-cunningham-wallmann-1964'},
 {z:97,symbol:'Bk',type:'DHCP',sg:194,count:4,a:3.416,c:11.069,source:'src-bk-baybarz-haire-fahey-1971'},
 {z:98,symbol:'Cf',type:'DHCP',sg:194,count:4,a:3.384,c:11.04,source:'src-cf-xray-pressure-1983'},
 {z:99,symbol:'Es',type:'FCC',sg:225,count:4,a:5.75,c:5.75,source:'src-es-haire-baybarz-1979'}
];
for(const row of records){
 test(row.symbol+' preserva a estrutura experimental e condições sem falsear CNTP',()=>{
  const e=S.data.get(row.z),ref=S.data.structure(e);
  assert.equal(e.symbol,row.symbol);
  assert.equal(e.silmEligibility.status,'available');
  assert.equal(e.silmEligibility.scope,'structure-only');
  assert.equal(ref.evidenceType,'experimental');
  assert.equal(ref.sourceId,row.source);
  assert.equal(ref.spaceGroupNumber,row.sg);
  assert.equal(ref.type,row.type==='FCC'?'CFC':row.type);
  assert.equal(ref.conditions.phase.value,'solid');
  assert.equal(ref.conditions.temperature.value,null);
  assert.equal(ref.conditions.pressure.value,null);
  assert.equal(ref.fractionalSites.representation,'conventional-cell');
  assert.equal(ref.fractionalSites.values.length,row.count);
  assert.equal(ref.fractionalSites.cellFormulaUnitsZ,row.count);
  assert.equal(ref.latticeParameters.a.value,row.a);
  assert.equal(ref.latticeParameters.c.value,row.c);
  assert.ok(S.data.source(row.source)?.url);
  assert.ok(S.data.source(ref.latticeParameters.a.sourceId)?.url);
  assert.ok(S.data.source(ref.fractionalSites.sourceId)?.url);
  assert.equal(S.data.structureEvidence(e).type,'experimental');
  assert.equal(Object.keys(e.properties||{}).length,0);
 });
 test(row.symbol+' constrói vizinhanças e preserva propriedades não homologadas',()=>{
  const e=S.data.get(row.z),status=S.crystal.eligibility(e);
  assert.equal(status.status,'available',JSON.stringify(status));
  assert.equal(status.structureType,row.type,JSON.stringify(status));
  assert.equal(status.databaseSites.length,row.count);
  const g=S.crystal.geometry(e);
  assert.ok(g,'Geometria ausente de '+row.symbol);
  assert.equal(g.model.id,row.type);
  assert.ok(g.cell.length>=row.count);
  assert.ok(g.index?.size>=row.count);
  assert.ok(g.cell.every(s=>s.cart.every(Number.isFinite)));
  const properties=S.properties.eligibility(e);
  for(const id of S.properties.ids){
   assert.equal(properties[id].status,'unavailable',row.symbol+' '+id);
   assert.equal(properties[id].reasonCode,'STRUCTURE_ONLY_REFERENCE');
  }
 });
}
test('lote 2 eleva cobertura estrutural a 73 mantendo 13 superpesados indisponíveis',()=>{
 assert.equal(S.data.elements.length,118);
 const available=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(available.length,73);
 assert.deepEqual(Array.from(available.filter(e=>e.silmEligibility.scope==='structure-only'),e=>e.symbol).sort(),
 ['Bk','Cf','Cm','Es','Ga','In','Pm','U']);
 for(let z=104;z<=116;z++)
  assert.equal(S.data.get(z).silmEligibility.status,'unavailable','Superpesado Z='+z);
});
test('a fase documentada de Es não representa material macroscópico nem fase ambiente universal',()=>{
 const es=S.data.get(99),ref=S.data.structure(es);
 assert.match(ref.phaseLabel,/depositado por vapor/);
 assert.match(ref.notes,/película/);
 assert.match(ref.conditions.temperature.display,/não tabulada/);
});
test('Cf distingue a fase DHCP trivalente das interpretações controversas de película',()=>{
 const cf=S.data.get(98),ref=S.data.structure(cf);
 assert.match(ref.phaseLabel,/trivalente/);
 assert.match(ref.notes,/compostos/);
 assert.ok(S.data.source('src-cf-actinide-review-1986'));
});
