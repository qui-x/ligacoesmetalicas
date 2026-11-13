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

test('Rf usa previsão DFT relativística HC com fonte primária e configuração atômica avaliada',()=>{
 assert.equal(rf.symbol,'Rf');
 assert.equal(rf.silmEligibility.status,'available');
 assert.equal(rf.silmEligibility.scope,'structure-only');
 assert.equal(rf.electronConfiguration.display,'[Rn] 5f14 6d2 7s2');
 assert.equal(rf.electronConfiguration.sourceId,'src-nist-asd-2024');
 assert.ok(rf.valenceModel?.sourceId);
 assert.equal(ref.type,'HC');
 assert.equal(ref.spaceGroupNumber,194);
 assert.equal(ref.sourceId,source);
 assert.equal(ref.kind,'CALCULATED');
 assert.equal(ref.evidenceType,'computed');
 assert.equal(ref.predictionMethod,'relativistic-dft-fplapw-pbe-srso');
 assert.equal(S.data.structureEvidence(rf).type,'computed');
 assert.ok(S.data.source(source)?.url?.startsWith('https://arxiv.org/'));
 assert.ok(S.data.source(source)?.doi);
 assert.ok(S.data.sourceIds(rf).includes(source));
 assert.ok(S.data.source(ref.contextSourceId)?.url);
 assert.match(ref.conditions.notes,/Wien2k/i);
});

test('Tabela 1 contém a=3,269 Å e c/a=1,590 no modelo SR+SO, com c derivado',()=>{
 assert.equal(ref.latticeParameters.a.value,3.269);
 assert.equal(ref.latticeParameters.b.value,3.269);
 assert.equal(ref.derivation.aPublished.value,3.269);
 assert.equal(ref.derivation.cOverAPublished.value,1.590);
 assert.equal(ref.latticeParameters.c.value,5.198);
 assert.ok(Math.abs(ref.derivation.cUnrounded-3.269*1.590)<1e-12);
 assert.ok(Math.abs(ref.latticeParameters.c.value-ref.derivation.cUnrounded)<0.00051);
 for(const k of ['alpha','beta'])assert.equal(ref.latticeParameters[k].value,90);
 assert.equal(ref.latticeParameters.gamma.value,120);
 assert.equal(ref.conditions.phase.value,'solid');
 assert.equal(ref.conditions.temperature.value,null,'0 K é condição do modelo, não medida de amostra.');
 assert.equal(ref.conditions.pressure.value,null,'Pressão numérica não inferida.');
 assert.match(ref.conditions.temperature.display,/0 K/);
 assert.match(ref.notes,/não observação experimental|não estrutura experimental|experimental sólida indisponível/);
});

test('Motor compartilhado reconstrói HC de Rf, sem motor paralelo e com 2 sítios',()=>{
 const eligibility=S.crystal.eligibility(rf);
 assert.equal(eligibility.status,'available',JSON.stringify(eligibility));
 assert.equal(eligibility.structureType,'HCP');
 assert.equal(eligibility.databaseSites.length,2);
 const geometry=S.crystal.geometry(rf);
 assert.ok(geometry);
 assert.equal(geometry.model.id,'HCP');
 assert.ok(geometry.cell.length>=2);
 assert.ok(geometry.index.size>=2);
 assert.ok(geometry.cell.every(site=>site.cart.every(Number.isFinite)));
});

test('Rf não libera efeitos térmicos elétricos ópticos ou mecânicos específicos',()=>{
 assert.deepEqual(Object.keys(rf.properties),[]);
 for(const id of S.properties.ids){
  const status=S.properties.eligibility(rf)[id];
  assert.equal(status.status,'unavailable',id);
  assert.equal(status.reasonCode,'STRUCTURE_ONLY_REFERENCE',id);
 }
});

test('78 metais habilitados, 13 apenas estruturais; Lr Db Sg permanecem bloqueados',()=>{
 assert.equal(S.data.elements.length,118);
 const metals=S.data.elements.filter(e=>e.classification?.metallic);
 const available=metals.filter(e=>e.silmEligibility.status==='available');
 assert.equal(metals.length,92);
 assert.equal(available.length,78);
 assert.deepEqual(Array.from(available.filter(e=>e.silmEligibility.scope==='structure-only'),e=>e.symbol).sort(),
 ['Bk','Cf','Cm','Es','Fm','Fr','Ga','In','Md','No','Pm','Rf','U']);
 for(const z of [103,105,106])assert.equal(S.data.get(z).silmEligibility.status,'unavailable');
 for(let z=105;z<=116;z++)assert.equal(S.data.get(z).silmEligibility.status,'unavailable');
});
