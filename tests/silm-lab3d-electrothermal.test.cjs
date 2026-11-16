'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runInNewContext}=require('node:vm');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root={SILM:{}};
for(const file of ['electrothermal.js','lab3d-electrothermal.js']){
 const code=readFileSync(join(__dirname,'../domain/silm/',file),'utf8');
 runInNewContext(code,{window:root,SILM:root.SILM});
}
const api=root.SILM.lab3dElectrothermal;
const approx=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*(1+Math.max(Math.abs(a),Math.abs(b))),a+' != '+b);
test('rede equivalente tem terminais, conectividade e fonte declaradas',()=>{
 const net=api.equivalentNetwork(18);
 assert.equal(net.sites.length,18);assert.equal(net.edges.length,17);
 assert.equal(net.terminal[0],1);assert.equal(net.terminal[17],0);
 assert.equal(net.inside.length,16);assert.equal(net.source,1);
 assert.equal(net.calibrated,false);
 assert.throws(()=>api.equivalentNetwork(2),{name:'RangeError'});
});
test('aquecimento sem corrente: aporte externo, Joule igual a zero',()=>{
 const model=api.create({segments:18});
 assert.equal(model.ok,true);
 model.setSources({heat:true,current:false});
 const r=model.advance(.5);
 assert.ok(r.ok&&r.externalEnergy>0&&r.temperature[1]>0);
 approx(r.power,0);approx(r.jouleEnergy,0);
 assert.equal(r.potential.every(v=>v===0),true);
 assert.equal(r.validAsMeasuredMaterialProperty,false);
});
test('corrente: Kirchhoff, balanço elétrico e geração Joule',()=>{
 const model=api.create({segments:18});
 model.setSources({heat:false,current:true,intensity:.6});
 const r=model.advance(.6);
 assert.ok(r.ok&&r.power>0&&r.jouleEnergy>0&&r.current>0);
 approx(r.power,r.current*r.voltage);
 assert.ok(r.temperature.some(v=>v>0));
 assert.ok(r.visiblePotential[0]>r.visiblePotential.at(-1));
 assert.ok(r.terminalError<1e-7);
});
test('fontes simultâneas: histórico cumulativo; desalimentação corta Joule',()=>{
 const model=api.create();
 model.setSources({heat:true,current:true,intensity:.6});
 const a=model.advance(1);
 assert.ok(a.ok&&a.externalEnergy>0&&a.jouleEnergy>0);
 model.setSources({heat:false,current:false});
 const b=model.advance(.5);
 assert.ok(b.ok&&b.time>a.time&&b.jouleEnergy>=a.jouleEnergy);
 assert.equal(b.externalEnergy,a.externalEnergy);
 approx(b.power,0);
 approx(b.storedEnergy+b.removedEnergy,a.storedEnergy+a.removedEnergy);
});
test('input inválido é rejeitado; falta do motor não gera dados inventados',()=>{
 assert.equal(api.create({engine:null}).ok,false);
 const model=api.create();
 assert.throws(()=>model.setSources({heat:'sim'}),{name:'RangeError'});
 assert.throws(()=>model.setSources({current:true,intensity:3}),{name:'RangeError'});
 assert.throws(()=>model.advance(4),{name:'RangeError'});
 const base=model.reading();
 assert.equal(base.maximum,0);assert.equal(base.units,'relative');
});
