'use strict';
const { test }=require('node:test'), assert=require('node:assert/strict'), path=require('node:path');
const D=require(path.join(__dirname,'../docs/science/silm-etapa76-mecanica-eu-lu.json'));
test('research stays out of quantitative engines',()=>{
 assert.equal(D.newObservationCount,3); assert.equal(D.newMeasuredTensileElongationCount,0);assert.equal(D.calibrationReleasedCount,0);
 assert.equal(new Set(D.newObservations.map(x=>x.id)).size,3);
 for(const x of D.newObservations){assert.equal(x.referenceOnly,true);assert.equal(x.engineRelease,false);assert.equal(x.CNTPValidated,false);assert.equal(x.testTemperatureK,null);assert.equal(x.testPressurePa,null);assert.equal(x.unit,'DPH_10kg')}
});
test('Ames source hardness rows, no tensile substitutions',()=>{
 const eu=D.newObservations.filter(x=>x.symbol==='Eu'),lu=D.newObservations.filter(x=>x.symbol==='Lu');
 assert.deepEqual(eu.map(x=>x.value),[17]);assert.deepEqual(lu.map(x=>x.value),[118,77]);
 for(const x of D.newObservations){assert.equal(Object.hasOwn(x,'tensile_elongation_pct'),false);}
});
test('prior compression and supplier candidate never qualify',()=>{
 const Lu=D.proceduralEvidence.find(x=>x.symbol==='Lu');
 assert.equal(Lu.existingCompressionPlasticityPct,12);assert.equal(Lu.doNotCreateDuplicate,true);
 const supplier=D.crosschecks.find(x=>x.property==='approximate_supplier_break_elongation_pct');
 assert.equal(supplier.engineRelease,false);assert.equal(supplier.value,15);
 assert.ok(D.crosschecks.filter(x=>x.property==='tensile_elongation_pct').every(x=>x.value===null));
});
test('europium processing evidence keeps air protection and no quantified ductility',()=>{
 const e=D.proceduralEvidence.find(x=>x.symbol==='Eu');
 assert.equal(e.conditions.surfaceProtectedFromAir,true);
 assert.equal(e.conditions.quantitativeDuctilityMeasured,false);
 assert.deepEqual(e.capabilities,['extrusion','swaging','cold_rolling']);
});
