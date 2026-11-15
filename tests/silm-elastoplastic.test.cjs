'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function engine(){
 const ctx={window:{SILM:{}}};ctx.SILM=ctx.window.SILM;
 vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm/elastoplastic.js'),'utf8'),ctx);
 return ctx.SILM.elastoplastic;
}
const close=(actual,expected,tol=1e-8)=>assert.ok(Math.abs(actual-expected)<tol,
 'Esperado '+expected+', obtido '+actual);
test('material sem carga: nenhuma deformação ou tensão',()=>{
 const e=engine(),s=e.fresh();
 close(s.stress,0);close(s.plasticStrain,0);assert.equal(s.calibrated,false);
});
test('elasticidade de Hooke antes do limite: 1D retorno analítico',()=>{
 const e=engine(),p=e.DEMO;
 const r=e.strainStep(e.fresh(),.02);
 close(r.stress,p.E*.02);close(r.elasticStrain,.02);
 close(r.plasticStrain,0);assert.equal(r.yielded,false);
});
test('além do limite: a correção retorna à superfície de escoamento',()=>{
 const e=engine(),p=e.DEMO,r=e.strainStep(e.fresh(),.10);
 const trial=p.E*.10,dp=(trial-p.yieldStress)/(p.E+p.hardening);
 close(r.accumulatedPlastic,dp);close(r.plasticStrain,dp);
 close(r.stress,p.yieldStress+p.hardening*dp);
 close(r.totalStrain,.10);assert.equal(r.yielded,true);
});
test('retirar tensão não apaga deformação permanente',()=>{
 const e=engine(),p=e.DEMO;
 const loaded=e.stressStep(e.fresh(),.9),unloaded=e.stressStep(loaded,0);
 close(unloaded.stress,0);close(unloaded.elasticStrain,0);
 close(unloaded.totalStrain,loaded.plasticStrain);
 assert.ok(loaded.accumulatedPlastic>0);
 close(unloaded.plasticStrain,loaded.plasticStrain);
});
test('histerese com inversão da carga conserva esforço de encruamento',()=>{
 const e=engine();
 const first=e.stressStep(e.fresh(),.8);
 const unload=e.stressStep(first,0);
 const elasticReverse=e.stressStep(unload,-.6);
 close(elasticReverse.accumulatedPlastic,first.accumulatedPlastic);
 const reverseYield=e.stressStep(elasticReverse,-.95);
 assert.ok(reverseYield.accumulatedPlastic>first.accumulatedPlastic);
 assert.ok(reverseYield.plasticStrain<first.plasticStrain);
 close(reverseYield.yieldThreshold,e.DEMO.yieldStress+e.DEMO.hardening*reverseYield.accumulatedPlastic);
});
test('compressão e tração são equivalentes em magnitude para o modelo isotrópico',()=>{
 const e=engine(),t=e.stressStep(e.fresh(),.9),c=e.stressStep(e.fresh(),-.9);
 close(t.plasticStrain,-c.plasticStrain);
 close(t.accumulatedPlastic,c.accumulatedPlastic);
 close(t.totalStrain,-c.totalStrain);
});
test('deformação imposta: descarregar até εp retorna tensão zero',()=>{
 const e=engine();
 const loaded=e.strainStep(e.fresh(),.1);
 const unloaded=e.strainStep(loaded,loaded.plasticStrain);
 close(unloaded.stress,0);
 close(unloaded.plasticStrain,loaded.plasticStrain);
});
test('com encruamento nulo, tensão imposta satura ao limite de escoamento',()=>{
 const e=engine(),p={E:10,yieldStress:.5,hardening:0};
 const s=e.stressStep(e.fresh(),.9,p);
 close(s.stress,.5);assert.equal(s.stressLimited,true);
});
test('rejeita parâmetros incompletos e falsos valores homologados',()=>{
 const e=engine();
 assert.throws(()=>e.parameters({E:0,yieldStress:.1,hardening:.1}),{name:'RangeError'});
 assert.throws(()=>e.parameters({...e.DEMO,calibrated:true}),{name:'TypeError'});
 assert.throws(()=>e.stressStep(e.fresh(),NaN),{name:'TypeError'});
});
test('o modelo só declara índice normalizado, nunca MPa/GPa sem dados',()=>{
 const e=engine(),s=e.stressStep(e.fresh(),.85);
 assert.equal(s.calibrated,false);
 assert.equal(e.modelInfo.stressUnits,'relative');
 assert.equal(e.modelInfo.materialScope,'demo-only');
});
test('motor carregado antes do controlador e mantido offline',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
  sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),file='domain/silm/elastoplastic.js';
 assert.ok(html.indexOf(file)>=0&&html.indexOf(file)<html.indexOf('domain/silm/deformation.js'));
 assert.ok(sw.includes(file));
});
