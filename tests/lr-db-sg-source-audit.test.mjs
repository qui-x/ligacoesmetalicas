import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const context=vm.createContext({console});
context.window=context;
for(const path of ['data/bundle','data-api','crystal','properties']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),context,{filename:path+'.js'});
}
const S=context.SILM;
const auditSource='src-ostlin-2015-thesis-sixd';
const expected=[
 {z:105,symbol:'Db',phase:'CCC',spaceGroup:229,cOverA:null},
 {z:106,symbol:'Sg',phase:'CCC',spaceGroup:229,cOverA:null}
];

for(const info of expected){
 test(info.symbol+' tem candidatura computacional rastreada, mas não é liberado com célula incompleta',()=>{
  const element=S.data.get(info.z);
  assert.equal(element.symbol,info.symbol);
  assert.equal(element.silmEligibility.status,'unavailable');
  assert.equal(element.referenceStructure,null);
  assert.equal(element.structures.length,0);
  const entry=element.reviewedCandidates.find(x=>x.sourceId===auditSource);
  assert.ok(entry,'Auditoria não encontrada: '+info.symbol);
  assert.equal(entry.decision,'needs-quantitative-lattice');
  assert.equal(entry.evidenceType,'computed');
  assert.equal(entry.candidatePhase,info.phase);
  assert.equal(entry.candidateSpaceGroupNumber,info.spaceGroup);
  assert.equal(entry.tentativeCOverA,info.cOverA);
  assert.match(entry.note,/não homologada/);
  const crystal=S.crystal.eligibility(element);
  assert.equal(crystal.status,'unavailable');
  assert.equal(crystal.reasonCode,'REFERENCE_STRUCTURE_MISSING');
  assert.equal(S.data.sourceIds(element).includes(auditSource),false,
   'Fonte em investigação apareceu indevidamente como fonte usada num relatório');
 });
}

test('Lr mantém HC-EMTO apenas em investigação e não combina c/a HC com o raio CCC',()=>{
 const l=S.data.get(103),c=S.data.structure(l);
 const alternative=l.reviewedCandidates.find(x=>x.sourceId===auditSource);
 assert.equal(l.silmEligibility.status,'available');
 assert.equal(l.silmEligibility.scope,'structure-only');
 assert.equal(c.type,'CCC');
 assert.equal(c.predictionMethod,'empirical-geometric');
 assert.equal(c.derivation.metallicRadius.sourceId,'src-huebener-actinide-metals-2003');
 assert.equal(alternative.decision,'needs-quantitative-lattice');
 assert.equal(alternative.candidatePhase,'HC');
 assert.equal(alternative.tentativeCOverA,1.58);
 assert.ok(!('cOverAPublished' in c.derivation));
 assert.ok(S.data.sourceIds(l).includes(auditSource),'A tese HC citada como contexto deve aparecer nas referências do modelo');
});

test('as referências computacionais de Lr–Sg incluem estudo principal, errata e estudo independente',()=>{
 const names=[
  auditSource,'src-ostlin-vitos-2011-sixd-stability',
  'src-ostlin-vitos-2011-sixd-erratum',
  'src-atta-fynn-ray-2015-sixd-solid',
  'src-gyanchandani-sikka-2011-sixd'
 ];
 for(const id of names){
  const source=S.data.source(id);
  assert.ok(source?.url?.startsWith('https://'),'Fonte inválida '+id);
 }
 assert.equal(S.data.source('src-ostlin-vitos-2011-sixd-erratum').doi,
  '10.1103/PhysRevB.84.239905');
});

test('auditoria documental preserva 79 metais com Lr hipotético, sem liberar Db Sg',()=>{
 const eligible=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(eligible.length,79);
 assert.equal(S.data.get(104).silmEligibility.status,'available','Rf permanece homologado');
 assert.equal(S.data.get(80).silmEligibility.status,'unavailable');
 for(let z=105;z<=116;z++)assert.equal(S.data.get(z).silmEligibility.status,'unavailable');
 const structural=eligible.filter(e=>e.silmEligibility.scope==='structure-only');
 assert.equal(structural.length,14);
});
