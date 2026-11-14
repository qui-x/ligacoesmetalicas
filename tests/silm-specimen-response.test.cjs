'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function engine(){
 const box={window:{SILM:{}}};
 box.SILM=box.window.SILM;
 vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm/deformation.js'),'utf8'),box);
 return box.window.SILM.deformation;
}
test('corpo de prova sem carga e sem história mantém geometria-base',()=>{
 const r=engine().specimenResponse({},{});
 assert.equal(r.scaleX,1);assert.equal(r.scaleY,1);
 assert.equal(r.hasResidual,false);assert.equal(r.hasTransient,false);
});
test('carga elástica compressiva é temporária, com resposta transversal consistente',()=>{
 const d=engine(),loaded=d.specimenResponse({},{strain:-.045,load:.3,regime:'elastic'});
 const released=d.specimenResponse({},{strain:0,load:0,regime:'rest'});
 assert.ok(loaded.scaleY<1);assert.ok(loaded.scaleX>1);
 assert.ok(loaded.hasTransient);assert.equal(loaded.hasResidual,false);
 assert.equal(released.scaleX,1);assert.equal(released.scaleY,1);
 assert.equal(released.hasTransient,false);
});
test('carga elástica de tração alonga, mas não cria plasticidade',()=>{
 const r=engine().specimenResponse({compressionSteps:0,tensionSteps:0},{strain:.035,load:.35,regime:'elastic'});
 assert.ok(r.scaleY>1&&r.scaleX<1);assert.equal(r.hasResidual,false);
});
test('compressão plástica permanece ao remover a força',()=>{
 const d=engine(),surface={compressionSteps:2,tensionSteps:0,plasticSteps:2};
 const r=d.specimenResponse(surface,{strain:0,load:0,regime:'rest'});
 assert.ok(r.scaleY<1&&r.scaleX>1);
 assert.equal(r.hasResidual,true);assert.equal(r.elasticAxial,0);
 assert.equal(d.specimenResponse(surface,{}).scaleY,r.scaleY);
});
test('tração plástica permanece mesmo quando o usuário muda de propriedade',()=>{
 const d=engine(),surface={compressionSteps:0,tensionSteps:2,plasticSteps:2};
 const r=d.specimenResponse(surface,{});
 assert.ok(r.scaleY>1&&r.scaleX<1);assert.equal(r.hasResidual,true);
});
test('reações combinadas não usam módulo de Young, tensão nem dados inventados',()=>{
 const d=engine();
 const r=d.specimenResponse({compressionSteps:2,tensionSteps:1},{strain:-.02,load:.7,regime:'plastic'});
 assert.ok(Number.isFinite(r.scaleX)&&Number.isFinite(r.scaleY));
 assert.equal(r.hasTransient,true);assert.equal(r.hasResidual,true);
 for(const name of ['stress','stressMPa','youngModulus','strainPercent'])assert.equal(name in r,false);
});
test('limites e entradas antigas não geram escala não finita',()=>{
 const d=engine();
 const r=d.specimenResponse({compressionSteps:NaN,tensionSteps:9000},{strain:Infinity,load:NaN});
 assert.ok(Number.isFinite(r.scaleX)&&Number.isFinite(r.scaleY));
 assert.equal(r.tensionSteps,d.LIMIT);assert.equal(r.compressionSteps,0);
 const old=d.specimenResponse({plasticSteps:2},{});
 assert.equal(old.hasResidual,false);
});
