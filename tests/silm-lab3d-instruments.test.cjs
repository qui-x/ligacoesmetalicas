'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {readFileSync}=require('node:fs'),{join}=require('node:path');
const {runInNewContext}=require('node:vm');
const root={SILM:{}};
for(const file of ['lab3d-instruments.js','lab3d-geometry.js'])
 runInNewContext(readFileSync(join(__dirname,'../domain/silm',file),'utf8'),
  {window:root,SILM:root.SILM});
const I=root.SILM.lab3dInstruments,G=root.SILM.lab3dGeometry;
test('projeção reversível identifica instrumento clicado pela posição na tela',()=>{
 const eye=[0,1.6,2.35],width=1280,height=800;
 for(const target of I.targets){
  const p=I.project(eye,0,-.06,target.center,width,height);
  assert.ok(p?.within,target.id+' fora da cena inicial');
  const hit=I.pickAt(eye,0,-.06,p.x,p.y,width,height);
  assert.equal(hit?.id,target.id,target.id+' não foi selecionado');
 }
});
test('sem clique no instrumento não dispara seleção; atrás da câmera é ignorado',()=>{
 const eye=[0,1.6,2.35];
 assert.equal(I.pickAt(eye,0,-.06,5,3,1280,800),null);
 assert.equal(I.pickRay(eye,[0,0,-1],[{id:'back',center:[0,1.6,3],radius:.2}]),null);
 assert.throws(()=>I.rayAt(eye,0,0,2000,0,1280,800),{name:'RangeError'});
 assert.throws(()=>I.rayAt(eye,0,Math.PI/2,0,0,800,800),{name:'RangeError'});
});
test('seleção prefere a superfície mais próxima, ignora objetos inválidos',()=>{
 const hit=I.pickRay([0,0,0],[0,0,-1],[
  {id:'far',center:[0,0,-2],radius:.2},
  {id:'near',center:[0,0,-1],radius:.2},
  {id:'malformed',center:[0,0,-1],radius:-1}]);
 assert.equal(hit.id,'near');
});
test('cilindros e toros têm posições, normais e índices triangulares finitos',()=>{
 for(const mesh of [G.round,G.ring,G.cylinder({segments:12}),G.torus({segments:16,tube:8})]){
  assert.ok(mesh instanceof Float32Array);
  assert.equal(mesh.length%18,0);
  assert.ok(mesh.length>0);
  for(let k=0;k<mesh.length;k+=6){
   assert.ok([...mesh.slice(k,k+6)].every(Number.isFinite));
   const n=mesh.slice(k+3,k+6);
   assert.ok(Math.abs(Math.hypot(...n)-1)<1e-6,'normal não unitária');
  }
 }
 assert.throws(()=>G.cylinder({segments:2}),{name:'RangeError'});
 assert.throws(()=>G.torus({minor:3}),{name:'RangeError'});
});
