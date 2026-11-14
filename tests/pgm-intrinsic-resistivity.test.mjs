import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const context=vm.createContext({window:{SILM:{}}});
context.SILM=context.window.SILM;
vm.runInContext(read('domain/silm/data/research-electrical-intrinsic-pgm.js'),context);
const R=context.SILM.researchIntrinsicPGM;
const get=z=>R.get(z);
const byT=(z,T)=>get(z).curve.find(p=>p.temperatureK===T);

test('quatro metais inéditos no catálogo elétrico: Ru Rh Os Ir com fonte Arblaster',()=>{
 assert.equal(R.metals,4);
 assert.deepEqual(Array.from(R.profiles,x=>x.symbol),['Ru','Rh','Os','Ir']);
 assert.equal(R.sources['arblaster-II'].doi,'10.1595/205651316X689855');
 assert.equal(R.sources['arblaster-III'].doi,'10.1595/205651316X691618');
 assert.equal(R.selectedTemperatureK,273.15);
 assert.equal(R.fullCNTPApprovalCount,0);
 assert.equal(R.inputToElectricalEngine,false);
 assert.equal(R.inputToJouleEngine,false);
 assert.equal(R.allowedTemperatureMinK,230);
 assert.equal(R.allowedTemperatureMaxK,300);
 assert.equal(get(29),null,'Cobre não pode herdar resistividade de metais PGM');
 for(const p of R.profiles){
  assert.equal(p.temperatureK,273.15);
  assert.equal(p.pressurePa,null);
  assert.equal(p.CNTPhomologated,false);
  assert.equal(p.engineRelease,false);
  assert.equal(p.referenceOnly,true);
  assert.equal(p.quantity,'intrinsic-electrical-resistivity');
  assert.equal(p.residualResistivityIncluded,false);
  assert.equal(p.totalResistivityKnown,false);
  assert.equal(p.curveInterpolated,false);
  assert.equal(p.curveKind,'evaluated-published-table-points');
  assert.equal(p.curve.length,9);
  assert.deepEqual(Array.from(p.curve,x=>x.temperatureK),
   [230,240,250,260,270,273.15,280,290,300]);
  assert.ok(Object.isFrozen(p));
  assert.ok(Object.isFrozen(p.curve));
  assert.ok(p.curve.every(x=>Object.isFrozen(x)));
  assert.equal(R.sources[p.sourceId].referenceType,'literature-evaluation-of-intrinsic-resistivity');
  assert.ok(R.sources[p.sourceId].url.startsWith('https://doi.org/'));
 }
});

test('transcrever literalmente as curvas intrínsecas médias dos quatro estudos',()=>{
 const expected={
  44:[4.91,5.20,5.49,5.78,6.07,6.16,6.37,6.67,6.96],
  45:[3.51,3.71,3.90,4.10,4.29,4.35,4.48,4.68,4.87],
  76:[6.57,6.92,7.26,7.61,7.76,8.07,8.38,8.82,9.25],
  77:[3.82,4.02,4.21,4.41,4.61,4.67,4.80,5.00,5.20]
 };
 for(const [z,rows] of Object.entries(expected)){
  assert.deepEqual(Array.from(get(z).curve,x=>x.rhoIntrinsicMicroOhmCm),rows);
 }
 for(const [z,table,uncertainty,phase] of [
  [44,6.16,0.05,'HC'],[45,4.35,0.04,'CFC'],
  [76,8.07,null,'HC'],[77,4.67,0.05,'CFC']
 ]){
  assert.equal(get(z).icePoint.rhoIntrinsicMicroOhmCm,table);
  assert.equal(get(z).selectedUncertaintyMicroOhmCm,uncertainty);
  assert.ok(get(z).phase.startsWith(phase));
 }
});

test('anisotropia HC existe somente nas temperaturas publicadas',()=>{
 const ru=get(44),os=get(76);
 assert.equal(ru.sourceTable,'Tabelas I e II, pp. 180–181');
 assert.equal(os.sourceTable,'Tabelas IV e V, pp. 182–183');
 for(const p of ru.curve){
  assert.ok(Number.isFinite(p.rhoPerpendicularMicroOhmCm));
  assert.ok(Number.isFinite(p.rhoParallelMicroOhmCm));
  assert.ok(Math.abs((2*p.rhoPerpendicularMicroOhmCm+p.rhoParallelMicroOhmCm)/3-p.rhoIntrinsicMicroOhmCm)<0.015);
 }
 for(const p of os.curve){
  if(p.temperatureK<273.15){
   assert.equal(p.rhoPerpendicularMicroOhmCm,null);
   assert.equal(p.rhoParallelMicroOhmCm,null);
  }else{
   assert.ok(Number.isFinite(p.rhoPerpendicularMicroOhmCm));
   assert.ok(Number.isFinite(p.rhoParallelMicroOhmCm));
   assert.ok(Math.abs((2*p.rhoPerpendicularMicroOhmCm+p.rhoParallelMicroOhmCm)/3-p.rhoIntrinsicMicroOhmCm)<0.02);
  }
 }
 for(const z of [45,77]){
  assert.ok(get(z).curve.every(p=>p.rhoPerpendicularMicroOhmCm===null&&p.rhoParallelMicroOhmCm===null));
 }
 assert.deepEqual([
  byT(44,273.15).rhoPerpendicularMicroOhmCm,byT(44,273.15).rhoParallelMicroOhmCm,
  byT(76,273.15).rhoPerpendicularMicroOhmCm,byT(76,273.15).rhoParallelMicroOhmCm
 ],[6.67,5.14,9.35,5.53]);
});

test('sem falsas condutividades macroscópicas ou calibração Joule',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const panelPath='domain/silm/research-electrical-intrinsic-panel.js';
 const dataPath='domain/silm/data/research-electrical-intrinsic-pgm.js';
 for(const path of [panelPath,dataPath]){
  assert.ok(html.includes(path));assert.ok(sw.includes(path));
  assert.ok(html.indexOf(path)<html.indexOf('domain/silm/property-view.js'));
 }
 assert.ok(html.indexOf(dataPath)<html.indexOf(panelPath));
 const p=read(panelPath),view=read('domain/silm/property-view.js');
 assert.match(view,/SILM\.createPGMIntrinsicPanel/);
 assert.match(view,/intrinsicEvidence\.update/);
 assert.match(p,/ρtotal≈ρᵢ\+ρ₀/);
 assert.match(p,/não representa uma nova equação/);
 assert.match(p,/Pressão não registrada/);
 assert.ok(!p.includes('conductivitySM'));
 for(const f of ['domain/silm/material-engine.js','domain/silm/electrothermal.js','domain/silm/thermal.js']){
  assert.ok(!read(f).includes('researchIntrinsicPGM'));
 }
 assert.equal(R.get(29),null);
});
