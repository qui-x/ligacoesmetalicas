'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {runInNewContext}=require('node:vm');
const {join}=require('node:path');
const host={SILM:{}};
runInNewContext(readFileSync(join(__dirname,'../domain/silm/mechanics-swift-tension.js'),'utf8'),
 {window:host,SILM:host.SILM});
const s=host.SILM.mechanicsSwiftTension;
const approx=(x,y,tol=1e-10)=>assert.ok(Math.abs(x-y)<tol,x+' difere de '+y);
test('Swift + Considère: força nominal atinge máximo em epsilon = n-epsilon0',()=>{
 const m=s.setup({K:500,n:.2,epsilon0:.01,stressUnit:'relative'});
 approx(m.onset,.19);
 const peak=m.evaluate(.19);assert.equal(peak.status,'NECKING_ONSET_IDEALIZED');
 approx(peak.hardeningSlope,peak.trueStress,1e-8);
 const before=m.evaluate(.14);assert.ok(before.engineeringStress<peak.engineeringStress);
 assert.equal(m.evaluate(.2).status,'POST_NECKING_UNRESOLVED');
 assert.equal(m.evaluate(.2).ok,false);
});
test('converter true/engineering com incompressibilidade: A*L constante',()=>{
 const m=s.setup({K:200,n:.33,epsilon0:.001});
 const x=m.evaluate(.22);
 approx(x.areaRatio*x.lengthRatio,1);
 approx(x.engineeringStrain,Math.exp(.22)-1);
 approx(x.engineeringStress,x.trueStress/Math.exp(.22));
 assert.equal(x.calibrated,false);assert.equal(m.postNecking,false);
});
test('condições originais obrigatórias para grandezas dimensionais',()=>{
 assert.throws(()=>s.setup({K:400,n:.3,stressUnit:'MPa'}),{name:'TypeError'});
 const m=s.setup({K:400,n:.3,stressUnit:'MPa',conditions:{T:{value:393,unit:'K'},phase:'solid'}});
 assert.equal(m.conditions.T.value,393);
 assert.throws(()=>s.setup({K:400,n:.3,epsilon0:.4}),{name:'RangeError'});
});
test('calibração algébrica recupera K e n do conjunto sintético sem declarar validação',()=>{
 const K=520,n=.25,offset=.008;
 const samples=[.025,.045,.08,.12,.15].map(ep=>({epsilonPlastic:ep,sigmaTrue:K*(offset+ep)**n}));
 const conditions={temperature:{value:300,unit:'K'},source:'ensaio original'};
 const f=s.fit({samples,epsilon0:offset,conditions,sourceId:'fonte-test-1',origin:'computational',stressUnit:'MPa'});
 assert.equal(f.ok,true);approx(f.K,K,1e-8);approx(f.n,n,1e-10);
 assert.ok(f.r2>.999999);
 assert.equal(f.status,'FIT_ONLY_UNVALIDATED');
 assert.equal(f.model.conditions.temperature.value,300);
 assert.equal(f.model.evaluate(.3).status,'POST_NECKING_UNRESOLVED');
});
test('fit não inventa valores com pontos inconsistentes',()=>{
 assert.throws(()=>s.fit({samples:[{epsilonPlastic:.2,sigmaTrue:100}],conditions:{T:300},sourceId:'x'}),{name:'RangeError'});
 const samples=[.02,.04,.07,.09].map(ep=>({epsilonPlastic:ep,sigmaTrue:200/(ep+.01)}));
 const f=s.fit({samples,epsilon0:.01,conditions:{T:300},sourceId:'x'});
 assert.equal(f.ok,false);assert.equal(f.calibrated,false);
});
