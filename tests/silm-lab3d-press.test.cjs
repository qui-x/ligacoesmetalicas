'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {runInNewContext}=require('node:vm');
const {readFileSync}=require('node:fs'),{join}=require('node:path');
const root={SILM:{}};
runInNewContext(readFileSync(join(__dirname,'../domain/silm/lab3d-press.js'),'utf8'),{window:root,SILM:root.SILM});
const P=root.SILM.lab3dPress;
const surface=(lower=1.03,upper=1.25)=>({ok:true,position(u,v,side){
 return [0,lower+(upper-lower)*v,-1.35+.12*side];
}});
test('garra móvel segue a borda carregada; apoio acompanha borda apoiada',()=>{
 const a=P.pose(surface(1.03)),b=P.pose(surface(1.06)),c=P.pose(surface(.99));
 assert.ok(a.ok&&b.ok&&c.ok);
 assert.equal(b.movingGripY-a.movingGripY,.03);
 assert.equal(c.fixedGripY,a.fixedGripY);
 assert.equal(a.source,'j2-plane-strain-surface');
 assert.equal(a.calibrated,false);
 assert.equal(P.transitionsAreEquilibriumSolutions,false);
});
test('animação suaviza somente poses convergidas, sem extrapolação',()=>{
 const a=P.pose(surface(1.03)),b=P.pose(surface(1.06));
 assert.equal(P.ease(-2),0);assert.equal(P.ease(3),1);
 assert.equal(P.ease(.5),.5);
 const midpoint=P.blendPose(a,b,P.ease(.5));
 assert.ok(Math.abs(midpoint.loadedY-1.045)<1e-10);
 assert.equal(midpoint.interpolated,true);
 assert.throws(()=>P.blendPose(a,b,2),{name:'RangeError'});
});
test('interpolação da malha preserva a correspondência dos vértices e normais unitárias',()=>{
 const a=new Float32Array([0,1,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,1]);
 const b=new Float32Array([0,1.2,0,0,.6,.8,1,-.3,0,0,.6,.8,0,.2,0,0,.6,.8]);
 const blended=P.blendMesh(a,b,.5);
 assert.ok(Math.abs(blended[1]-1.1)<1e-6);
 for(let i=0;i<blended.length;i+=6)
  assert.ok(Math.abs(Math.hypot(...blended.slice(i+3,i+6))-1)<1e-6);
 assert.strictEqual(P.blendMesh(a,b,0),a);
 assert.strictEqual(P.blendMesh(a,b,1),b);
 assert.throws(()=>P.blendMesh(a,new Float32Array(6),.5),{name:'RangeError'});
});
test('sombras acompanham a mesma transição visual da prensa',()=>{
 const a=[[0,1,.3,.4]],b=[[1,2,.5,.6]];
 const m=P.blendShadows(a,b,.5);
 assert.ok(Math.abs(m[0][0]-.5)<1e-9);
 assert.ok(Math.abs(m[0][2]-.4)<1e-9);
 assert.throws(()=>P.blendShadows(a,[],.5),{name:'RangeError'});
});
test('não inventa movimento quando a geometria J2 falha',()=>{
 assert.equal(P.pose(null).ok,false);
 assert.equal(P.pose(surface(1.3,1.2)).ok,false);
 assert.throws(()=>P.ease(NaN),{name:'RangeError'});
});
