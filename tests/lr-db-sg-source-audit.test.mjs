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
 {z:103,symbol:'Lr',phase:'HC',spaceGroup:194,cOverA:1.58},
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

test('auditoria documental não reduz nem amplia indevidamente 78 metais homologados',()=>{
 const eligible=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(eligible.length,78);
 assert.equal(S.data.get(104).silmEligibility.status,'available','Rf permanece homologado');
 assert.equal(S.data.get(80).silmEligibility.status,'unavailable');
 for(let z=105;z<=116;z++)assert.equal(S.data.get(z).silmEligibility.status,'unavailable');
 const structural=eligible.filter(e=>e.silmEligibility.scope==='structure-only');
 assert.equal(structural.length,13);
});
