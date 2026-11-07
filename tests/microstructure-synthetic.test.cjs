'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../domain/silm/microstructure-synthetic.js'),'utf8'),sandbox);
const generator=sandbox.window.SILM.microstructureSynthetic;
const fingerprint=map=>JSON.stringify(map.polygons);
const polygonArea=poly=>Math.abs(poly.reduce((a,p,i)=>{
 const q=poly[(i+1)%poly.length];return a+p[0]*q[1]-q[0]*p[1];
},0))/2;
const median=items=>items.sort((a,b)=>a-b)[Math.floor(items.length/2)];
const aspect=map=>median(map.polygons.map(poly=>{
 const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);
 return (Math.max(...xs)-Math.min(...xs))/(Math.max(...ys)-Math.min(...ys));
}));
test('mesma semente + mesmo perfil = mesmos polígonos, inclusive após novas gerações',()=>{
 for(const profile of ['equiaxial','elongated']){
  const baseline=generator.generate({seed:139712,profile});
  generator.generate({seed:42,profile:'equiaxial'});
  assert.equal(fingerprint(generator.generate({seed:139712,profile})),fingerprint(baseline));
  assert.equal(baseline.kind,'schematic');
  assert.equal(baseline.generator,'silm-voronoi-v1');
  assert.equal(baseline.width,1000);assert.equal(baseline.height,620);
  assert.ok(baseline.polygons.length>=45);
 }
});
test('sementes diferentes produzem formações diferentes',()=>{
 const a=generator.generate({seed:139712}),b=generator.generate({seed:139713});
 assert.notEqual(fingerprint(a),fingerprint(b));
 assert.equal(generator.nextSeed(139712),generator.nextSeed(139712));
 assert.notEqual(generator.nextSeed(139712),139712);
});
test('perfis mudam a geometria, mas não representam dados reais',()=>{
 const base=generator.generate({seed:12,profile:'equiaxial'});
 const stretch=generator.generate({seed:12,profile:'elongated'});
 assert.ok(aspect(stretch)>aspect(base)*1.4,
  'O perfil alongado deve aumentar a razão horizontal/vertical dos contornos.');
 assert.notEqual(fingerprint(base),fingerprint(stretch));
 assert.ok(!Object.hasOwn(stretch,'composition'));
 assert.ok(!Object.hasOwn(stretch,'phaseFractions'));
});
test('tesselação preenche o campo fixo sem buracos ou áreas negativas',()=>{
 for(const profile of ['equiaxial','elongated']){
  for(const seed of [0,139712,4294967295]){
   const map=generator.generate({seed,profile});
   const total=map.polygons.reduce((sum,p)=>{
    assert.ok(p.length>=3);
    assert.ok(p.every(([x,y])=>x>=-1e-6&&x<=1000+1e-6&&y>=-1e-6&&y<=620+1e-6));
    const area=polygonArea(p);assert.ok(area>0);return sum+area;
   },0);
   assert.ok(Math.abs(total-map.width*map.height)<.005,'As áreas de Voronoi devem cobrir o plano.');
  }
 }
});
test('parâmetros fora do contrato são rejeitados sem geração silenciosa',()=>{
 for(const seed of [-1,4294967296,NaN,3.5,'12',null]){
  assert.equal(generator.validSeed(seed),false);
  assert.throws(()=>generator.generate({seed}),/Semente/);
 }
 for(const profile of ['fantasia','EBSD','',null]){
  assert.equal(generator.validProfile(profile),false);
  assert.throws(()=>generator.generate({profile}),/Perfil/);
 }
 assert.equal(generator.validSeed(0),true);assert.equal(generator.validSeed(4294967295),true);
});
