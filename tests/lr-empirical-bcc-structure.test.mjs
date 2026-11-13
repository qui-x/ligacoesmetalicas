import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const ctx=vm.createContext({console});ctx.window=ctx;
for(const path of ['data/bundle','data-api','crystal','properties']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),ctx,{filename:path+'.js'});
}
const S=ctx.SILM,Lr=S.data.get(103),ref=S.data.structure(Lr);
const huebener='src-huebener-actinide-metals-2003';
const thesis='src-ostlin-2015-thesis-sixd';

test('hipótese CCC de Lr é autossuficiente e está rotulada como empírico-geométrica, não DFT',()=>{
 assert.equal(Lr.silmEligibility.status,'available');
 assert.equal(Lr.silmEligibility.scope,'structure-only');
 assert.equal(Lr.electronConfiguration.display,'[Rn] 5f14 7s2 7p1');
 assert.equal(Lr.electronConfiguration.sourceId,'src-nist-asd-2024');
 assert.equal(ref.type,'CCC');
 assert.equal(ref.spaceGroupNumber,229);
 assert.equal(ref.kind,'CALCULATED');
 assert.equal(ref.evidenceType,'computed');
 assert.equal(ref.predictionMethod,'empirical-geometric');
 assert.equal(ref.sourceId,huebener);
 assert.equal(ref.contextSourceId,thesis);
 assert.equal(S.data.structureEvidence(Lr).method,'empirical-geometric');
 assert.match(S.data.structureEvidence(Lr).label,/modelo empírico/i);
 assert.ok(S.data.source(huebener)?.url);
 assert.ok(S.data.source(thesis)?.url);
 assert.ok(S.data.sourceIds(Lr).includes(huebener));
 assert.ok(S.data.sourceIds(Lr).includes(thesis));
});

test('a=4r/√3 corresponde ao raio ESTIMADO de 1,66 Å, sem simular precisão de medição',()=>{
 assert.equal(ref.derivation.method,'hard-sphere-bcc');
 assert.equal(ref.derivation.expression,'a = 4 * r_metallic / sqrt(3)');
 assert.equal(ref.derivation.metallicRadius.value,1.66);
 assert.equal(ref.derivation.metallicRadius.sourceId,huebener);
 assert.ok(Math.abs(ref.derivation.unroundedValue-4*1.66/Math.sqrt(3))<1e-12);
 for(const k of ['a','b','c']){
  assert.equal(ref.latticeParameters[k].value,3.834);
  assert.equal(ref.latticeParameters[k].kind,'CALCULATED');
  assert.equal(ref.latticeParameters[k].sourceId,huebener);
 }
 for(const k of ['alpha','beta','gamma'])assert.equal(ref.latticeParameters[k].value,90);
 assert.equal(ref.conditions.temperature.value,null);
 assert.equal(ref.conditions.pressure.value,null);
 assert.match(ref.conditions.temperature.display,/não equivale a 0 K ou CNTP/);
 assert.match(ref.conditions.phase.display,/hipotético/);
 assert.match(ref.notes,/não célula medida|NÃO célula medida/);
 assert.match(ref.notes,/HC/);
 assert.equal(ref.fractionalSites.representation,'conventional-cell');
 assert.equal(ref.fractionalSites.values.length,2);
 assert.equal(ref.fractionalSites.cellFormulaUnitsZ,2);
});

test('SILM.crystal utiliza CCC padrão de dois sítios, sem simulador isolado',()=>{
 const e=S.crystal.eligibility(Lr);
 assert.equal(e.status,'available',JSON.stringify(e));
 assert.equal(e.structureType,'BCC');
 assert.equal(e.databaseSites.length,2);
 const g=S.crystal.geometry(Lr);
 assert.ok(g);
 assert.equal(g.model.id,'BCC');
 assert.ok(g.cell.length>=2);
 assert.ok(g.index.size>=2);
 assert.ok(g.cell.every(site=>site.cart.every(Number.isFinite)));
});

test('configuração do átomo não implica condutividade, brilho ou ductilidade do sólido de Lr',()=>{
 assert.equal(Object.keys(Lr.properties).length,0);
 for(const id of S.properties.ids){
  const p=S.properties.eligibility(Lr)[id];
  assert.equal(p.status,'unavailable',id);
  assert.equal(p.reasonCode,'STRUCTURE_ONLY_REFERENCE',id);
 }
 const phaseCandidate=Lr.reviewedCandidates.find(x=>x.sourceId===thesis);
 assert.equal(phaseCandidate.decision,'needs-quantitative-lattice');
 assert.equal(phaseCandidate.candidatePhase,'HC');
 assert.equal(phaseCandidate.tentativeCOverA,1.58);
});

test('errata primária foi verificada: reconhece referência anterior sem corrigir parâmetros',()=>{
 const err=S.data.source('src-ostlin-vitos-2011-sixd-erratum');
 assert.ok(err);
 assert.match(err.notes,/reconhece o estudo prévio/);
 assert.match(err.notes,/NÃO corrige parâmetros/);
});

test('79 de 92 metais; Lr estrutural; Hg e superpesados remanescentes bloqueados',()=>{
 const metals=S.data.elements.filter(x=>x.classification?.metallic);
 const available=metals.filter(x=>x.silmEligibility.status==='available');
 assert.equal(metals.length,92);
 assert.equal(available.length,79);
 const structural=available.filter(x=>x.silmEligibility.scope==='structure-only');
 assert.equal(structural.length,14);
 assert.equal(S.data.get(80).silmEligibility.status,'unavailable');
 for(let z=105;z<=116;z++)assert.equal(S.data.get(z).silmEligibility.status,'unavailable');
});
