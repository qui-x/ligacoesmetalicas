'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const files=fs.readFileSync(path.join(root,'index.html'),'utf8');
function engine(){
 const box={window:{SILM:{}}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm/surface-physics.js'),'utf8'),box);
 return box.window.SILM.surfacePhysics;
}
test('motor no HTML, na ordem de carregamento anterior ao estado e à microestrutura',()=>{
 const physics=files.indexOf('domain/silm/surface-physics.js');
 const state=files.indexOf('domain/silm/state.js');
 const micro=files.indexOf('domain/silm/surface-micro.js');
 const view=files.indexOf('domain/silm/microstructure-view.js');
 assert.ok(physics>=0&&physics<state&&micro>=0&&micro<view);
});
test('Fresnel normal devolve valor no intervalo físico e não aceita dados faltantes',()=>{
 const e=engine(),r=e.fresnelNormal(1.02,2.577);
 assert.ok(r>0&&r<1);
 assert.equal(e.fresnelNormal(NaN,2),null);
 assert.equal(e.fresnelNormal(0,0),null);
});
test('GGX distingue superfície polida e rugosa na direção especular',()=>{
 const e=engine();
 const a=e.ggx({roughness:.08,incidence:35,observer:35});
 const b=e.ggx({roughness:.7,incidence:35,observer:35});
 assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&a>b);
});
test('traçado local altera apenas a região trabalhada',()=>{
 const e=engine(),s=e.base();
 const next=e.applyStroke(s,{tool:'polish',x0:.2,y0:.2,x1:.4,y1:.2,radius:.05});
 assert.ok(e.sample(next,.3,.2).roughness<e.sample(s,.3,.2).roughness);
 assert.equal(e.sample(next,.91,.91).roughness,e.sample(s,.91,.91).roughness);
 assert.equal(s.strokes.length,0);assert.equal(next.strokes.length,1);
});
test('escova produz anisotropia; lixa fina e polimento a reduzem',()=>{
 const e=engine(),s=e.base(),brush=e.applyStroke(s,{tool:'brush',x0:.1,y0:.5,x1:.8,y1:.5,radius:.08});
 const brushed=e.sample(brush,.4,.5);
 assert.ok(brushed.anisotropy>.1);assert.ok(brushed.roughness>.43);
 const smooth=e.applyStroke(brush,{tool:'polish',x0:.1,y0:.5,x1:.8,y1:.5,radius:.08});
 assert.ok(e.sample(smooth,.4,.5).roughness<brushed.roughness);
});
test('acúmulo plástico muda rugosidade sem alterar grãos ou gerar Ra',()=>{
 const e=engine(),s=e.base();
 const previous=e.sample(s,.5,.5).roughness;
 s.plasticSteps=2;assert.ok(e.validState(s));
 const result=e.sample(s,.5,.5);assert.ok(result.roughness>previous);
 assert.equal('Ra' in result,false);
});
test('sem n,k homologados a saída é qualitativa',()=>{
 const e=engine(),s=e.base(),state={metadata:{surface:s}};
 const q=e.response(state,{u:.5,v:.5});
 assert.equal(q.calibration,'qualitative');
 assert.ok(q.specularRelative>=0&&q.specularRelative<=1);
});
test('limita histórico e rejeita traçados inválidos',()=>{
 const e=engine(),s=e.base(),stroke={tool:'polish',x0:0,y0:0,x1:1,y1:1,radius:.05};
 assert.equal(e.validStroke({...stroke,radius:1}),false);
 assert.equal(e.applyStroke(s,{...stroke,radius:.05}).strokes.length,1);
 s.strokes=Array.from({length:160},()=>stroke);
 assert.equal(e.applyStroke(s,stroke),null);
});
