'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function qualification(records={}){
 const ctx={window:{SILM:{}}};ctx.SILM=ctx.window.SILM;
 ctx.SILM.scienceEvidenceIndex={
  getFor:(z,property)=>records[z]?.[property]||[]
 };
 vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm/mechanical-qualification.js'),'utf8'),ctx);
 return ctx.SILM.mechanicalQualification;
}
const row=(id,status,code,value,{sample='Fe-001',temperatureK=293.15,sourceURL='https://example.org/assay'}={})=>({
 id,property:'ductility',status,engineRelease:false,calibrationApproved:false,
 values:[{code,value,unit:'MPa'}],sample,temperatureK,
 temperatureText:'293,15 K, amostra documentada',sourceURL,sourceName:'Estudo de exemplo',origin:'test'
});
test('sem conjunto E ν σe H nenhum elemento recebe calibração',()=>{
 const q=qualification().inspect(26);
 assert.equal(q.status,'NOT_CALIBRATED');
 assert.equal(q.engineMode,'normalized-j2');
 assert.equal(q.canFeedEngine,false);
 assert.equal(q.missing.length,4);
 assert.equal(q.grainOrientation,'NOT_MEASURED');
});
test('escore documental não é autorização para parametrizar o J2',()=>{
 const q=qualification({26:{ductility:[row('r1','experimental-conditional','yield_MPa',320)]}}).inspect(26);
 assert.equal(q.yieldedSourceCount,1);
 assert.equal(q.hasConditionalYield,true);
 assert.equal(q.canFeedEngine,false);
 assert.equal(q.sameSpecimenBundle,false);
 assert.equal(q.missing.some(x=>x.includes('Young')),true);
 assert.equal(q.missing.some(x=>x.includes('escoamento')),false);
 assert.equal(q.candidates[0].value,320);
 assert.equal(q.candidates[0].calibratesEngine,false);
});
test('recusa candidatos de fontes pendentes, valores de ruptura e números sem fonte',()=>{
 const q=qualification({26:{ductility:[
  row('r1','pending','yield_MPa',400),
  row('r2','experimental-conditional','UTS_MPa',650),
  row('r3','experimental-conditional','yield_MPa',300,{sourceURL:null}),
  row('r4','candidate','yield_MPa',800)
 ]}}).inspect(26);
 assert.equal(q.yieldedSourceCount,0);
 assert.equal(q.missing.length,4);
});
test('observações de compressão não são confundidas com tração de outra amostra',()=>{
 const q=qualification({26:{
  ductility:[row('r1','compiled','yield_MPa',250,{sample:'Fe-A'})],
  malleability:[row('r2','experimental-conditional','compression_yield_strength_MPa',310,{sample:'Fe-B'})]
 }}).inspect(26);
 assert.equal(q.candidates.length,2);
 assert.notEqual(q.candidates[0].sample,q.candidates[1].sample);
 assert.equal(q.canFeedEngine,false);
});
const p=(sampleId='sample-A',temperatureK=293.15)=>({
 value:12,sampleId,temperatureK,sourceURL:'https://example.org/study'
});
test('não confia em flags autoatribuídas de aprovação',()=>{
 const q=qualification(),bundle={
  E:{...p(),value:210000,unit:'MPa'},
  nu:{...p(),value:.3,unit:'ratio'},
  yieldStress:{...p(),value:250,unit:'MPa'},
  hardening:{...p(),value:900,unit:'MPa'},
  calibrationApproved:true,engineRelease:true
 };
 const r=q.assessBundle(bundle);
 assert.equal(r.ready,false);
 assert.equal(r.reason,'BUNDLE_REQUIRES_INDEPENDENT_REVIEW');
});
test('rejeita unidades incompatíveis, material incompleto e mistura de amostras',()=>{
 const q=qualification(),bundle={
  E:{...p(),value:210000,unit:'MPa'},
  nu:{...p(),value:.3,unit:'ratio'},
  yieldStress:{...p('different'),value:250,unit:'MPa'},
  hardening:{...p(),value:900,unit:'MPa'}
 };
 assert.equal(q.assessBundle(bundle).reason,'BUNDLE_SAMPLE_MISMATCH');
 assert.equal(q.assessBundle({...bundle,yieldStress:{...p(),value:250,unit:'MPa'},E:{...p(),unit:'GPa'}}).reason,'BUNDLE_PARAMETER_MISSING');
 assert.equal(q.assessBundle({...bundle,hardening:undefined}).reason,'BUNDLE_PARAMETER_MISSING');
});
test('referências variam com seleção atômica, sem herdar o cobre ou o ferro',()=>{
 const q=qualification({26:{ductility:[row('iron','compiled','yield_MPa',230)]}});
 assert.equal(q.inspect(26).yieldedSourceCount,1);
 assert.equal(q.inspect(29).yieldedSourceCount,0);
 assert.equal(q.inspect('NaN').atomicNumber,null);
});
test('auditoria roda após índice documental e antes da microestrutura, inclusive offline',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
  sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),
  name='domain/silm/mechanical-qualification.js';
 assert.ok(html.indexOf('science-evidence-index.js')<html.indexOf(name));
 assert.ok(html.indexOf(name)<html.indexOf('domain/silm/microstructure-view.js'));
 assert.ok(sw.includes('"'+name+'"'));
});
