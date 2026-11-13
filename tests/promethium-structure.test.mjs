import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

// A ficha de Pm se insere no motor cristalográfico existente, sem modelo
// DHPC avulso, fonte de valores inventados ou autorização implícita de propriedades.
const ctx=vm.createContext({console});
ctx.window=ctx;
for(const path of ['data/bundle','data-api','crystal','properties']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),ctx,{filename:path+'.js'});
}
const S=ctx.SILM,Pm=S.data.get(61);

test('Pm-61 pode ser escolhido para investigação estrutural, com fontes rastreáveis',()=>{
 assert.equal(Pm.symbol,'Pm');
 assert.equal(Pm.silmEligibility.status,'available');
 assert.equal(Pm.silmEligibility.scope,'structure-only');
 assert.equal(Pm.referenceStructure,'pm-reference');
 assert.equal(Pm.properties&&Object.keys(Pm.properties).length,0);
 assert.equal(S.data.structure(Pm)?.type,'DHCP');
 const sourceIds=S.data.sourceIds(Pm);
 for(const id of ['src-pm-pallmer-chikalla-1971','src-pm-structure-review-1972','src-pm-dhcp-positions-edinburgh-2017']){
  assert.ok(sourceIds.includes(id),'Fonte não rastreável: '+id);
  assert.ok(S.data.source(id)?.url,'Fonte sem URL: '+id);
 }
 const ref=S.data.structure(Pm);
 assert.equal(ref.conditions.phase.value,'solid');
 assert.equal(ref.conditions.temperature.value,null,'Não apresentar falsa CNTP/temperatura experimental');
 assert.equal(ref.conditions.pressure.value,null,'Não apresentar pressão medida fictícia');
 assert.equal(ref.latticeParameters.a.value,3.65);
 assert.equal(ref.latticeParameters.c.value,11.65);
 assert.equal(ref.spaceGroupNumber,194);
 assert.equal(ref.fractionalSites.cellFormulaUnitsZ,4);
});

test('DHCP de Pm usa quatro posições e geometria do motor geral',()=>{
 const cap=S.crystal.eligibility(Pm);
 assert.equal(cap.status,'available',JSON.stringify(cap));
 assert.equal(cap.structureType,'DHCP');
 assert.equal(cap.general,true);
 assert.equal(cap.atomsPerCell,4);
 assert.equal(cap.databaseSites.length,4);
 const g=S.crystal.geometry(Pm);
 assert.ok(g,'Geometria não construída');
 assert.equal(g.model.id,'DHCP');
 assert.ok(Array.isArray(g.cell)&&g.cell.length>0);
 assert.ok(Array.isArray(g.vectors)&&g.vectors.length===3);
 assert.ok(g.index?.size>=4);
 assert.ok(g.cell.every(x=>x.cart.every(Number.isFinite)));
 assert.notEqual(g.reference.latticeParameters.c.value,g.reference.latticeParameters.a.value);
});

test('Pm estrutural não recebe dados físicos estimados nem experiências sem homologação',()=>{
 const capabilities=S.properties.eligibility(Pm);
 for(const property of S.properties.ids){
  assert.equal(capabilities[property].status,'unavailable',property);
  assert.equal(capabilities[property].reasonCode,'STRUCTURE_ONLY_REFERENCE',property);
  assert.equal(capabilities[property].data,null);
 }
 assert.equal(Pm.properties.electricalConductivity,undefined);
 assert.equal(Pm.properties.thermalConductivity,undefined);
});

test('os demais metais preservam elegibilidade científica',()=>{
 const copper=S.data.get(29);
 assert.equal(copper.silmEligibility.status,'available');
 assert.equal(S.crystal.eligibility(copper).status,'available');
 assert.notEqual(S.properties.eligibility(copper).electrical.status,'unavailable');
 assert.equal(S.data.elements.filter(e=>e.silmEligibility.status==='available').length,69);
});

test('fonte computacional tem elegibilidade cristalográfica equivalente, mas proveniência distinta',()=>{
 const predicted=JSON.parse(JSON.stringify(Pm));
 predicted.atomicNumber=187; // espécime sintético de teste, não um elemento publicado
 predicted.structures[0].evidenceType='computed';
 predicted.structures[0].conditions.temperature={
  value:0,unit:'K',kind:'CALCULATED',sourceId:'src-computational-test',
  display:'0 K · condição do modelo',qualifier:'model-condition'
 };
 predicted.structures[0].sourceId='src-computational-test';
 const observed=S.crystal.eligibility(Pm),computed=S.crystal.eligibility(predicted);
 assert.equal(computed.status,observed.status);
 assert.equal(computed.structureType,observed.structureType);
 assert.equal(computed.atomsPerCell,observed.atomsPerCell);
 assert.equal(S.crystal.geometry(predicted).model.id,'DHCP');
 assert.equal(S.data.structureEvidence(Pm).type,'experimental');
 assert.equal(S.data.structureEvidence(predicted).type,'computed');
 assert.match(S.data.structureEvidence(predicted).label,/prevista computacionalmente/);
 for(const property of S.properties.ids){
  assert.equal(S.properties.eligibility(predicted)[property].reasonCode,'STRUCTURE_ONLY_REFERENCE');
 }
});

test('propriedades calculadas com fonte, unidade e condição têm o mesmo acesso a dados',()=>{
 const predicted=JSON.parse(JSON.stringify(Pm));
 predicted.atomicNumber=188; // espécime sintético para testar o contrato de dados
 delete predicted.silmEligibility.scope; // a ficha completa não é structure-only
 predicted.structures[0].evidenceType='computed';
 predicted.properties={
  electricalConductivity:{
   value:1.2e6,unit:'S/m',kind:'CALCULATED',evidenceType:'computed',
   sourceId:'src-computational-electrical-test',
   conditions:{temperature:{value:0,unit:'K',display:'0 K · cálculo'}}
  },
  thermalConductivity:{
   value:25,unit:'W/(m·K)',kind:'CALCULATED',evidenceType:'computed',
   sourceId:'src-computational-thermal-test',
   conditions:{temperature:{value:0,unit:'K',display:'0 K · cálculo'}}
  }
 };
 const properties=S.properties.eligibility(predicted);
 assert.equal(properties.electrical.status,'available');
 assert.equal(properties.thermal.status,'available');
 assert.equal(properties.electrical.data.evidenceType,'computed');
 assert.equal(properties.thermal.data.evidenceType,'computed');
 // Fichas reais ainda exigem validação da fonte e pertinência das condições.
});
