'use strict';
/* F1.1: fixtures do comportamento de referência do SILM. Não são medições nem parâmetros físicos dos metais. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const f=require('./fixtures/engine-baseline.json');
const S=require('../scripts/validate-scientific-state.cjs').load();
const box={window:{SILM:S},SILM:S,Math,Float64Array,Uint32Array};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../domain/silm/electron-view.js'),'utf8'),box);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,String(a)+' != '+String(b));
assert.equal(f.fixtureVersion,1);
assert.equal(S.scientificSchemaVersion,f.schemaVersion);
for(const [symbol,e] of Object.entries(f.geometry)){
 const el=S.data.get(({Cu:29,Fe:26,Mg:12,Mn:25})[symbol]);
 const g=S.crystal.geometry(el);
 assert.ok(g,symbol+': geometria');
 assert.equal(g.model.id,e.model,symbol+': modelo');
 if(e.general)assert.equal(g.model.general,true);
 else{
  assert.equal(g.cell.length,e.sites);
  assert.equal(g.model.coordination,e.coordination);
  const site=symbol==='Mg'?g.cell.find(x=>g.role(x).role==='base-center'):g.cell[0];
  near(g.neighbors(site).distances[0]/g.reference.latticeParameters.a.value,e.nearestOverA);
 }
}
assert.equal(S.thermal.D,f.thermal.D);
assert.equal(S.thermal.DT,f.thermal.dt);
assert.equal(S.thermal.SETTLE,f.thermal.settle);
const h=f.thermal.chain,step=S.thermal.step(Float64Array.from(h.initial),h.edges,null);
h.result.forEach((v,i)=>near(step[i],v));
near(S.thermal.sum(step),h.sum);
near(S.thermal.spread(step),h.spread);
assert.equal(S.deformation.LIMIT,f.deformation.limit);
assert.equal(S.deformation.YIELD,f.deformation.yield);
assert.equal(S.deformation.EPS_YIELD,f.deformation.epsYield);
for(const [family,e] of Object.entries(f.deformation.systems)){
 const z=family==='FCC'?29:family==='BCC'?26:12;
 const sys=S.deformation.system(S.crystal.geometry(S.data.get(z)));
 assert.ok(sys,family+': sistema');
 for(const k of ['family','planeLabel','directionLabel','count'])assert.equal(sys[k],e[k],family+'.'+k);
}
const d=f.drive,model={get state(){return {investigation:{id:'fixture'},properties:{active:'electrical',startedAt:'fixture'}};}};
const ctrl=S.drive.controller(model);
near(ctrl.intensity,d.initialIntensity);
assert.equal(ctrl.angle,d.initialAngle);
assert.equal(S.drive.MIN_INTENSITY,d.minIntensity);
assert.equal(S.drive.MIN_ANGLE,d.minAngle);
assert.equal(S.drive.MAX_ANGLE,d.maxAngle);
ctrl.setIntensity(2);assert.equal(ctrl.intensity,d.maxIntensity);
ctrl.setIntensity(0);assert.equal(ctrl.intensity,d.minIntensity);
ctrl.setAngle(0);assert.equal(ctrl.angle,d.minAngle);
ctrl.setAngle(90);assert.equal(ctrl.angle,d.maxAngle);
for(const a of [5,35,80]){
 const r=S.drive.reflect(a);
 assert.equal(r.incidence,a);
 assert.equal(r.reflection,a);
}
assert.deepEqual({...S.electronLayerLimits},f.electrons.limits);
const actual={
 scatter0:S.electronTransport.scatter(0),drift0:S.electronTransport.drift(0),
 scatterHalf:S.electronTransport.scatter(.5),driftHalf:S.electronTransport.drift(.5),
 defectScatter:S.electronTransport.defectScatter(.5),defectDrift:S.electronTransport.defectDrift(.5),
 fieldHalf:S.electronTransport.drive(.5)
};
for(const [name,value] of Object.entries(actual))near(value,f.electrons[name]);
assert.deepEqual(Array.from(S.properties.ids),f.properties.ids);
assert.deepEqual(JSON.parse(JSON.stringify(S.properties.defaults)),f.properties.defaults);
for(const [k,v] of Object.entries(f.properties.limits))assert.equal(S.properties.limits[k],v);
console.log('PASS engine-fixtures: geometria Cu/Fe/Mg/Mn; passo térmico; deslizamento FCC/BCC/HCP; estímulos; representação eletrônica qualitativa; catálogo.');
