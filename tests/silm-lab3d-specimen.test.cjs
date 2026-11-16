'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runInNewContext}=require('node:vm');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root={SILM:{}};
runInNewContext(readFileSync(join(__dirname,'../domain/silm/lab3d-specimen.js'),'utf8'),{window:root,SILM:root.SILM});
const specimen=root.SILM.lab3dSpecimen;
const field={converged:true,
 sample:(u,v)=>({dx:.04*(u-.5)*v,dy:-.06*v*v}),
 samplePlastic:u=>u*.03};
test('rejeita solver não convergido e não inventa campo',()=>{
 const r=specimen.create({converged:false,sample:field.sample});
 assert.equal(r.ok,false);assert.equal(r.reason,'J2_FIELD_NOT_CONVERGED');
 assert.throws(()=>specimen.create(field,{amplification:10}),{name:'RangeError'});
});
test('a superfície curva em v acompanha a malha J2, sem deformar z',()=>{
 const model=specimen.create(field,{segments:6,rows:4,amplification:2,width:1,height:.2,depth:.3});
 assert.equal(model.segmentCount,6);
 assert.equal(model.outOfPlanePredicted,false);
 const high=model.position(1,1,1),low=model.position(1,0,1);
 assert.ok(Math.abs(high[0]-(.5+.04))<1e-10);
 assert.ok(Math.abs(high[1]-(1.03+.2*(1-.12)))<1e-10);
 assert.ok(Math.abs(high[2]-(-1.35+.15))<1e-10);
 assert.ok(Math.abs(high[2]-low[2])<1e-10);
 assert.notEqual(high[1]-low[1],.2);
});
test('triângulos válidos e normais finitas por segmento',()=>{
 const result=specimen.create(field,{segments:5,rows:3});
 assert.equal(result.segments.length,5);
 for(const seg of result.segments){
  assert.equal(seg.vertices.length,seg.vertexCount*6);
  assert.equal(seg.vertices.length%18,0);
  assert.ok(seg.vertices.every(Number.isFinite));
  assert.ok(seg.vertexCount>0);
  assert.equal(seg.calibrated,false);
  assert.equal(seg.source,'j2-plane-strain');
 }
 assert.ok(result.segments[0].vertexCount>result.segments[1].vertexCount);
 assert.ok(result.segments.at(-1).vertexCount>result.segments[1].vertexCount);
});
test('geometria neutra coincide com campo sem carga, preservando a leitura',()=>{
 const neutral={converged:true,sample:()=>({dx:0,dy:0})};
 const m=specimen.create(neutral,{segments:4,rows:2});
 assert.ok(Math.abs(m.position(0,0,-1)[0]+1.03/2)<1e-10);
 assert.ok(Math.abs(m.position(1,1,1)[1]-(1.03+.22))<1e-10);
 assert.equal(m.position(.5,.5,1)[2],-1.35+.24/2);
 assert.equal(m.segments[0].plasticIndicator,null);
});
test('o modelo recusa leitura divergente em vez de ocultá-la',()=>{
 assert.throws(()=>specimen.create({converged:true,sample:()=>({dx:Infinity,dy:0})}),{name:'TypeError'});
 assert.throws(()=>specimen.create({converged:true,sample:()=>({dx:3,dy:0})}),{name:'TypeError'});
});
