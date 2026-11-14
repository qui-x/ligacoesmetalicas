'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const SCRIPT='domain/silm/deformation-constitutive.js';
function create(profile=null,match=true){
 const silm={materialProfiles:{get:z=>Number(z)===29?profile:null},
  referenceConditions:{compare:conditions=>{
   if(!match||conditions?.temperatureK!==273.15||conditions?.pressurePa!==101325)
    return {ok:false,reasonCode:'CONDITIONS_UNVERIFIED'};
   return {ok:true};
  }}};
 const box={window:{SILM:silm}};vm.runInNewContext(fs.readFileSync(path.join(root,SCRIPT),'utf8'),box);
 return box.window.SILM.mechanicalConstitutive;
}
const P={youngModulusPa:2e11,yieldStressPa:2e8,hardeningModulusPa:1e9};
function approved(){
 const m={atomicNumber:29,mode:'ductility',model:'uniaxial-bilinear-small-strain',
  evidence:'EXPERIMENTAL_CALIBRATED',engineRelease:true,calibrationApproved:true,
  sourceOriginalChecked:true,CNTPValidated:true,verifiedModes:['ductility'],
  calibrationDataRefs:['hypothetical-test-curve'],
  specimen:{phase:'solid',form:'bar',purityDescription:'synthetic benchmark',processingHistory:'none',
    orientation:'isotropic',batchId:'synthetic-only'},
  source:{title:'TEST ONLY — not measured Cu',authors:'SILM tests',year:2026,
    sampleId:'synthetic-benchmark',url:'https://example.org/synthetic-test-not-real-data'},
  conditions:{basis:'SOURCE_REPORTED',temperatureK:273.15,pressurePa:101325,
    description:'synthetic mock for code test, not evidence of copper'},parameters:P};
 return {atomicNumber:29,element:'Cu',mechanical:{ductility:m}};
}
test('no material data means qualitative only and no fake numerical stress',()=>{
 const c=create();const g=c.capability(29,'ductility');assert.equal(g.ok,false);
 assert.equal(g.mode,'qualitative');assert.equal(g.calibrationReleased,false);
 assert.equal(c.calculate(29,'ductility',.01).ok,false);
 assert.equal(c.capability(29,'malleability').reasonCode,'NO_CALIBRATED_STRESS_STRAIN_CURVE');
});
test('one missing approval or provenance field blocks numerical release',()=>{
 for(const [path,replacement] of [['engineRelease',false],['CNTPValidated',false],
 ['calibrationApproved',false],['sourceOriginalChecked',false],
 ['calibrationDataRefs',[]]]){
  const obj=approved();obj.mechanical.ductility[path]=replacement;
  assert.equal(create(obj).capability(29,'ductility').ok,false,path);
 }
 const obj=approved();assert.equal(create(obj,false).capability(29,'ductility').ok,false);
 obj.mechanical.ductility.conditions.pressurePa=null;
 assert.equal(create(obj).capability(29,'ductility').ok,false);
});
test('benchmark uniaxial below yield purely elastic',()=>{
 const c=create(),s=c.solveUniaxial(P,c.initialState(),.0005);
 assert.equal(s.regime,'elastic');assert.equal(s.plasticStrain,0);
 assert.equal(s.stressPa,1e8);assert.equal(s.failurePrediction,null);
});
test('benchmark yield, hardening, unloading and load reversal',()=>{
 const c=create(),first=c.solveUniaxial(P,c.initialState(),.002);
 assert.equal(first.regime,'plastic');assert.ok(first.accumulatedPlasticStrain>0);
 const expected=P.yieldStressPa+P.hardeningModulusPa*first.accumulatedPlasticStrain;
 assert.ok(Math.abs(first.stressPa-expected)<1e-4);
 const unloaded=c.solveUniaxial(P,first,first.plasticStrain);
 assert.ok(Math.abs(unloaded.stressPa)<1e-4);
 assert.equal(unloaded.accumulatedPlasticStrain,first.accumulatedPlasticStrain);
 const reversed=c.solveUniaxial(P,unloaded,-.004);
 assert.ok(reversed.stressPa<0);assert.ok(reversed.accumulatedPlasticStrain>=first.accumulatedPlasticStrain);
});
test('uniaxial tension and compression are symmetric in isotropic benchmark',()=>{
 const c=create();const a=c.solveUniaxial(P,c.initialState(),.006),
 b=c.solveUniaxial(P,c.initialState(),-.006);
 assert.ok(Math.abs(a.stressPa+b.stressPa)<1e-4);
 assert.ok(Math.abs(a.plasticStrain+b.plasticStrain)<1e-9);
});
test('no numerical overflow or implicit rupture predicted',()=>{
 const c=create();assert.equal(c.solveUniaxial(P,c.initialState(),NaN),null);
 assert.equal(c.solveUniaxial(P,c.initialState(),.11),null);
 assert.equal(c.solveUniaxial({...P,youngModulusPa:NaN},c.initialState(),.01),null);
 assert.equal(c.solveUniaxial(P,{...c.initialState(),plasticStrain:1},.01),null);
});
test('visual envelope retains volume in three dimensions without measured strain',()=>{
 const c=create();
 for(const mode of ['malleability','ductility'])for(let step=0;step<=4;step++){
  const s=c.visualEnvelope({mode,step,maxSteps:4,load:.5});
  assert.ok(Math.abs(s.volumeRatio-1)<1e-12);
  assert.equal(s.measuredStrain,false);assert.equal(s.metalSpecific,false);
  if(mode==='malleability')assert.ok(s.scaleY<=1&&s.scaleX>=1);
  if(mode==='ductility')assert.ok(s.scaleY>=1&&s.scaleX<=1);
 }
 assert.equal(c.visualEnvelope({mode:'ductility',step:9,maxSteps:4}),null);
});
test('synthetic gate proves API routing, not material validation',()=>{
 const mock=approved(),c=create(mock);
 const a=c.capability(29,'ductility');
 assert.equal(a.mode,'quantitative');assert.equal(a.calibrationReleased,true);
 const v=c.calculate(29,'ductility',.004);
 assert.equal(v.ok,true);assert.equal(v.model,'uniaxial-bilinear-small-strain');
 assert.equal(c.capability(29,'malleability').ok,false);
});
test('HTML loads contract before deformation, cached for offline and connected to microstructure',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
  sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),
  def=fs.readFileSync(path.join(root,'domain/silm/deformation.js'),'utf8'),
  micro=fs.readFileSync(path.join(root,'domain/silm/microstructure-view.js'),'utf8');
 assert.ok(html.indexOf(SCRIPT)>=0);
 assert.ok(html.indexOf(SCRIPT)<html.indexOf('domain/silm/deformation.js'));
 assert.ok(sw.includes('"'+SCRIPT+'"'));
 assert.ok(def.includes('mechanicalConstitutive?.capability'));
 assert.ok(micro.includes('mechanicalConstitutive?.visualEnvelope'));
});
