'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runInNewContext}=require('node:vm');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root={SILM:{}};
runInNewContext(readFileSync(join(__dirname,'../domain/silm/lab3d-core.js'),'utf8'),{window:root,SILM:root.SILM});
const m=root.SILM.lab3dCore;
test('pulso de calor difunde, sem exceder o intervalo normalizado',()=>{
 let a=Array.from(m.initialHeat(16));a=m.heatStep(a,{source:true});
 assert.equal(a[0],1);assert.equal(a[1],0);
 a=m.heatStep(a,{source:true});
 assert.ok(a[1]>0&&a[1]<1);
 for(let i=0;i<200;i++)a=m.heatStep(a,{source:false});
 assert.ok(a.every(x=>x>=0&&x<=1));
 assert.ok(a[0]<1);
});
test('estabilidade explícita limita a difusividade',()=>{
 assert.throws(()=>m.heatStep([0,1,0],{diffusivity:1}),{name:'RangeError'});
 assert.throws(()=>m.initialHeat(2),{name:'RangeError'});
});
test('colisões: parede e bancada, entrada livre',()=>{
 assert.equal(m.canWalk(0,2),true);
 assert.equal(m.canWalk(0,-1),false);
 assert.equal(m.canWalk(4,0),false);
 assert.equal(m.canWalk(2.6,-1),true);
});
test('motor J2 não convergido nunca produz deslocamento inventado',()=>{
 assert.equal(m.sampleField({converged:false,sample:()=>({dx:0,dy:0})},.5,.5),null);
 const v=m.sampleField({converged:true,sample:()=>({dx:0.2,dy:-.1})},.5,.5);
 assert.equal(v.dx,.2);assert.equal(v.dy,-.1);
 assert.equal(m.calibrated,false);
});
test('seleciona o instrumento apontado com raio 3D, não um objeto atrás da câmera',()=>{
 const targets=[{id:'press',center:[0,1.5,-1.2],radius:.3},{id:'rear',center:[0,1.5,2],radius:.3}];
 const hit=m.pickTarget([0,1.5,1],0,0,targets);
 assert.equal(hit.id,'press');
 assert.equal(m.pickTarget([0,1.5,1],Math.PI,0,targets).id,'rear');
 assert.equal(m.pickTarget([0,1.5,1],Math.PI/2,0,targets),null);
});
