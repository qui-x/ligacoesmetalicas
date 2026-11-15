'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runInNewContext}=require('node:vm');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root={SILM:{}};
runInNewContext(readFileSync(join(__dirname,'../domain/silm/mechanics-scene-bridge.js'),'utf8'),{window:root,SILM:root.SILM});
const api=root.SILM.mechanicsSceneBridge;
const field={converged:true,sample:(u,v)=>({dx:.02*u,dy:-.04*v}),
 samplePlastic:()=>.025,sampleStress:()=>[[1,0,0],[0,-1,0],[0,0,0]]};
test('recusa campo não convergido e origem não suportada',()=>{
 assert.equal(api.create({converged:false,sample:field.sample}).ok,false);
 assert.throws(()=>api.create(field,{source:'another'}),{name:'RangeError'});
});
test('mapeia coordenadas e não inventa deformação fora do plano',()=>{
 const bridge=api.create(field,{source:'j2',amplification:2});
 const p=bridge.point(1,1,.25);
 assert.ok(Math.abs(p.x-(.5+.04))<1e-12);
 assert.ok(Math.abs(p.y-(.5-.08))<1e-12);
 assert.equal(p.z,.25);assert.equal(p.read.displacement.dz,null);
 assert.equal(p.read.calibrated,false);
 assert.throws(()=>bridge.point(1.1,0),{name:'RangeError'});
});
test('grade determinística e índices válidos',()=>{
 const g=api.create(field).sampleGrid(4,3);
 assert.equal(g.positions.length,4*3*3);
 assert.equal(g.indices.length,(4-1)*(3-1)*6);
 assert.equal(Math.max(...g.indices),11);
 assert.equal(g.extrusion,'visual-only');
});
test('camadas ópticas e térmicas não alegam previsões experimentais',()=>{
 const bridge=api.create(field);
 const v=bridge.appearance(.5,.5,{temperature:.8,current:.6});
 assert.equal(v.heatOverlay,.8);assert.equal(v.chargeOverlay,.6);
 assert.equal(v.validAsMaterialPrediction,false);
 assert.ok(v.roughnessRelative>=0&&v.roughnessRelative<=1);
 assert.throws(()=>bridge.appearance(0,0,{temperature:2}),{name:'RangeError'});
});
test('interface compatível com amostras CPFEM e ausência de plástico',()=>{
 const c={converged:true,sample:(u,v)=>({dx:u*.01,dy:v*.01}),sampleMechanics:()=>({stressTensor:[[1,0,0],[0,1,0],[0,0,1]]})};
 const x=api.create(c,{source:'cpfem'});
 assert.equal(x.query(.1,.2).plasticIndicator,null);
 assert.ok(x.query(.1,.2).stress);
 assert.equal(x.source,'cpfem');assert.equal(x.calibrated,false);
});