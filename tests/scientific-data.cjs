'use strict';
/* Regressão 0.2.x do banco científico: 118 elementos, metais homologados, fontes, proveniência e busca.
   Reescrito na 0.4.0 porque a pasta tests/ não constava do pacote SILM 0.3.0 recebido. */
const assert=require('node:assert/strict');
const {validate,load}=require('../scripts/validate-scientific-data.cjs');
const {load:loadRuntime}=require('../scripts/validate-scientific-state.cjs');
const data=load(),errors=validate(data,{checkFiles:true});
assert.deepEqual(errors,[],errors.join('\n'));
assert.equal(data.elements.length,118);
const available=data.elements.filter(e=>e.silmEligibility.status==='available');
assert.equal(available.length,62,'Quantidade de metais homologados (0.15.0 + K, Th, Ac, Ra e Tc a partir de CIF local)');
assert.ok(available.every(e=>e.classification.metallic&&e.atomicNumber<104));
assert.ok(data.elements.filter(e=>e.atomicNumber>=104).every(e=>e.silmEligibility.reasonCode==='SUPERHEAVY_LIMITATION'));
// Testes negativos do validador.
const negative=[
 d=>d.elements.pop(),
 d=>{d.elements[0].symbol=d.elements[1].symbol;},
 d=>{const cu=d.elements.find(e=>e.symbol==='Cu');cu.atomicWeight.sourceId='fonte-inexistente';},
 d=>{const c=d.elements.find(e=>e.symbol==='C');c.silmEligibility={status:'available',reasonCode:null};},
 d=>{const rf=d.elements.find(e=>e.atomicNumber===104);rf.silmEligibility={status:'available',reasonCode:null};},
 d=>{const fe=d.elements.find(e=>e.symbol==='Fe');fe.structures[0].latticeParameters.a.unit='nm';}
];
for(const mutate of negative){const copy=structuredClone(data);mutate(copy);assert.ok(validate(copy).length>0,mutate.toString());}
// API de runtime: busca e resolução de fontes usadas pela Tabela.
const S=loadRuntime(),D=S.data;
assert.equal(D.search('cu')[0].symbol,'Cu');assert.equal(D.search('29')[0].name,'Cobre');assert.equal(D.search('cobre')[0].atomicNumber,29);
assert.equal(D.search('ferro')[0].symbol,'Fe');assert.equal(D.search('').length,118);assert.equal(D.search('zz-inexistente').length,0);
const cu=D.get(29);assert.equal(D.structure(cu).type,'CFC');assert.ok(D.sourceIds(cu).every(id=>D.source(id)));
assert.match(D.label(D.get(6)),/fora do escopo/);assert.match(D.label(D.get(29)),/disponível para investigação/);
console.log(JSON.stringify({elements:118,availableMetals:available.length,sources:data.sources.length,negativeCases:negative.length,search:'ok'},null,2));
