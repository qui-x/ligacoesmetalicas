'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runInNewContext}=require('node:vm');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root={SILM:{}};
for(const path of ['mechanics-scene-bridge.js','lab3d-specimen.js','lab3d-field-overlay.js']){
 runInNewContext(readFileSync(join(__dirname,'../domain/silm/',path),'utf8'),
 {window:root,SILM:root.SILM});
}
const field={converged:true,
 sample:(u,v)=>({dx:.015*u*v,dy:-.035*v}),
 samplePlastic:(u,v)=>.06*u*v,
 sampleStress:(u,v)=>[[2*u,0,0],[0,-v,0],[0,0,.3]]};
const bridge=root.SILM.mechanicsSceneBridge.create(field);
const surface=root.SILM.lab3dSpecimen.create(field,{segments:6,rows:3});
const overlay=root.SILM.lab3dFieldOverlay;
test('mapa da superfície é local e preserva ausência de dados',()=>{
 const map=overlay.create(bridge,surface,{kind:'vonMises'});
 assert.equal(map.ok,true);assert.equal(map.source,'j2-plane-strain');
 assert.equal(map.available,18);assert.equal(map.missing,0);
 assert.ok(map.max>map.min);
 assert.equal(map.validAsMeasuredStress,false);
 assert.equal(map.validAsPhysical3D,false);
 assert.equal(map.nodesAvailable,28);
 for(const patch of map.patches){
  assert.equal(patch.vertices.length%6,0);
  assert.ok(patch.vertices.every(Number.isFinite));
  assert.ok(patch.color.every(x=>x>=0&&x<=1));
 }
});
test('gradação por célula usa campos também na direção v',()=>{
 const map=overlay.create(bridge,surface,{kind:'plasticIndicator'});
 const a=map.patches.find(x=>x.index===4&&x.row===0);
 const b=map.patches.find(x=>x.index===4&&x.row===2);
 assert.ok(b.value>a.value);
 assert.notDeepEqual([...a.color],[...b.color]);
 assert.ok(map.available===18);
});
test('mapa hidrostático distingue compressão e tração, zero neutro',()=>{
 const n=overlay.color(-1,'hydrostaticMean',-1,1),
  z=overlay.color(0,'hydrostaticMean',-1,1),
  p=overlay.color(1,'hydrostaticMean',-1,1);
 assert.ok(n[2]>n[0]);assert.ok(p[0]>p[2]);
 assert.ok(z[0]>n[0]);assert.ok(z[1]>p[1]);
});
test('sem leitura de tensão: null e cinza, sem zero inventado',()=>{
 const empty={converged:true,sample:field.sample};
 const b=root.SILM.mechanicsSceneBridge.create(empty);
 const s=root.SILM.lab3dSpecimen.create(empty,{segments:6,rows:3});
 const m=overlay.create(b,s,{kind:'vonMises'});
 assert.equal(m.available,0);assert.equal(m.missing,18);
 assert.equal(m.min,null);assert.equal(m.max,null);
 for(const patch of m.patches.filter(x=>!x.neutral))
  assert.equal(patch.value,null);
});
test('mapas inválidos e campo sem convergência ficam bloqueados',()=>{
 assert.throws(()=>overlay.create(bridge,surface,{kind:'MPa'}),{name:'RangeError'});
 assert.equal(overlay.create({ok:false},surface).ok,false);
 assert.equal(overlay.create(bridge,{ok:false}).ok,false);
});
