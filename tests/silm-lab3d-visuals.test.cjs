'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {runInNewContext}=require('node:vm');
const {readFileSync}=require('node:fs'),{join}=require('node:path');
const root={SILM:{}};
runInNewContext(readFileSync(join(__dirname,'../domain/silm/lab3d-visuals.js'),'utf8'),
 {window:root,SILM:root.SILM});
const V=root.SILM.lab3dVisuals;
test('sombra analítica é projetada para o lado contrário à luz e aumenta com a altura',()=>{
 const p=V.footprint({point:[0,1.25,-1.35]});
 assert.ok(p.x<0);assert.ok(p.z< -1.35);
 assert.ok(p.radiusX>.2);
 const low=V.footprint({point:[0,1.1,-1.35]});
 const high=V.footprint({point:[0,1.6,-1.35]});
 assert.ok(high.radiusX>low.radiusX);
 assert.ok(Math.abs(high.x)>Math.abs(low.x));
 assert.equal(p.calibrated,false);
});
test('deslocamento do cabeçote muda apenas sua sombra, preserva instrumentos fixos',()=>{
 const a=V.shadows({upperY:1.2}),b=V.shadows({upperY:1.4});
 assert.equal(a.length,5);
 assert.notDeepEqual([...a[0]],[...b[0]]);
 for(let i=1;i<4;i++)assert.deepEqual([...a[i]],[...b[i]]);
 const probeA=V.shadows({probe:[.26,1.195,-1.23]});
 const probeB=V.shadows({probe:[.38,1.18,-1.23]});
 assert.notDeepEqual([...probeA[4]],[...probeB[4]],
  'A sombra da amostra deve se mover com o campo J2.');
 assert.deepEqual([...probeA[0]],[...probeB[0]],
  'A sombra do cabeçote não deve mudar se só o interior deformou.');
 for(const row of a)assert.ok(row.every(Number.isFinite));
});
test('projeção no plano de recepção não altera posição nem escala no contato',()=>{
 const p=V.footprint({point:[.25,.91,-.5]});
 assert.ok(Math.abs(p.x-.25)<1e-10);
 assert.ok(Math.abs(p.z+.5)<1e-10);
 assert.ok(Math.abs(p.radiusX-.2)<1e-10);
});
test('dados impossíveis não geram sombras numéricas inventadas',()=>{
 assert.throws(()=>V.footprint({point:[0,.7,0]}),{name:'RangeError'});
 assert.throws(()=>V.footprint({point:[0,5,0]}),{name:'RangeError'});
 assert.throws(()=>V.shadows({upperY:5}),{name:'RangeError'});
});
test('aparência ótica é explicitamente não calibrada',()=>{
 const polished=V.appearance({roughness:.1}),matte=V.appearance({roughness:.9});
 assert.ok(polished.shininess>matte.shininess);
 assert.equal(polished.calibrated,false);
 assert.throws(()=>V.appearance({metalness:8}),{name:'RangeError'});
});
