import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const ctx=vm.createContext({console});
ctx.window=ctx;
for(const path of ['data/bundle','data-api','crystal','properties']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),ctx,{filename:path+'.js'});
}
const S=ctx.SILM;
const cases=[
 {z:31,symbol:'Ga',name:'Gálio',type:'ORTHORHOMBIC',sg:64,atoms:8,source:'src-ga-sharma-donohue-1962',params:{a:4.523,b:7.661,c:4.524}},
 {z:49,symbol:'In',name:'Índio',type:'TETRAGONAL',sg:139,atoms:2,source:'src-in-ridley-1965-webelements',params:{a:3.2523,b:3.2523,c:4.9461}},
 {z:92,symbol:'U',name:'Urânio',type:'ORTHORHOMBIC',sg:63,atoms:4,source:'src-u-sturcken-post-xray',params:{a:2.854,b:5.869,c:4.955}}
];

for(const t of cases){
 test(t.symbol+' possui ficha experimental rastreável, célula completa e centro navegável',()=>{
  const e=S.data.get(t.z),reference=S.data.structure(e);
  assert.equal(e.symbol,t.symbol);
  assert.equal(e.silmEligibility.status,'available');
  assert.equal(e.silmEligibility.scope,'structure-only');
  assert.equal(reference.type,t.type);
  assert.equal(reference.spaceGroupNumber,t.sg);
  assert.equal(reference.evidenceType,'experimental');
  assert.equal(reference.sourceId,t.source);
  assert.equal(reference.fractionalSites.values.length,t.atoms);
  assert.equal(reference.fractionalSites.cellFormulaUnitsZ,t.atoms);
  assert.equal(S.data.structureEvidence(e).type,'experimental');
  assert.ok(S.data.source(t.source)?.url);
  assert.ok(S.data.sourceIds(e).includes(t.source));
  for(const [k,value] of Object.entries(t.params))assert.equal(reference.latticeParameters[k].value,value,k);
  assert.equal(reference.conditions.phase.value,'solid');
  assert.equal(reference.conditions.temperature.value,null,'Não atribuir uma CNTP fictícia');
  assert.equal(reference.conditions.pressure.value,null,'Não atribuir pressão medida fictícia');
  assert.deepEqual(Object.keys(e.properties),[]);
  const eligible=S.crystal.eligibility(e);
  assert.equal(eligible.status,'available',JSON.stringify(eligible));
  assert.equal(eligible.general,true);
  assert.equal(eligible.structureType,t.type);
  assert.equal(eligible.atomsPerCell,t.atoms);
  const geom=S.crystal.geometry(e);
  assert.ok(geom,'Motor não construiu a estrutura de '+t.symbol);
  assert.equal(geom.model.id,t.type);
  assert.ok(geom.cell.length>=t.atoms);
  assert.ok(geom.index?.size>=t.atoms);
  assert.ok(geom.cell.every(a=>a.cart.every(Number.isFinite)));
 });
 test(t.symbol+' mantém todas as propriedades específicas bloqueadas',()=>{
  const e=S.data.get(t.z),p=S.properties.eligibility(e);
  for(const id of S.properties.ids){
   assert.equal(p[id].status,'unavailable',id);
   assert.equal(p[id].reasonCode,'STRUCTURE_ONLY_REFERENCE',id);
  }
 });
}
test('catálogo preserva Ga In U em 78 metais e 12 superpesados bloqueados',()=>{
 assert.equal(S.data.elements.length,118);
 const available=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(available.length,78);
 const structural=available.filter(e=>e.silmEligibility.scope==='structure-only');
 assert.deepEqual(Array.from(structural,e=>e.symbol).sort(),['Bk','Cf','Cm','Es','Fm','Fr','Ga','In','Md','No','Pm','Rf','U']);
 for(let z=105;z<=116;z++){
  assert.equal(S.data.get(z)?.silmEligibility?.status,'unavailable','Superpesado Z='+z);
 }
});
