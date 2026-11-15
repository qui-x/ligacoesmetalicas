'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
function engine(){
 const c={window:{SILM:{}}};c.SILM=c.window.SILM;
 for(const p of ['crystal-slip.js','crystal-plasticity.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm',p),'utf8'),c);
 return c.SILM;
}
function cp(S,structure='CFC',deg=0,parameters={E:10,nu:.3,crss:.08,hardening:.7}){
 return S.crystalPlasticity.create({structure,
  orientationMatrix:S.crystalSlip.rotationZ(deg),parameters,provenance:'hypothetical'});
}
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,String(a)+' != '+String(b));
test('abaixo da CRSS, a resposta e elastica e nao acumula deslizamento',()=>{
 const S=engine(),r=cp(S).runAxial({magnitude:.001});
 assert.equal(r.status,'ELASTIC');near(r.accumulatedSlip,0);
 assert.equal(r.state.calibrated,false);
});
test('carregamento plastico e descarregamento preservam deformacao irreversivel',()=>{
 const S=engine(),m=cp(S),r=m.runAxial({magnitude:.03});
 assert.equal(r.status,'PLASTIC');assert.ok(r.activeSystems>0);
 assert.ok(r.accumulatedSlip>0);
 const u=m.step(r.state,[0,0,0,0,0,0]);
 assert.ok(u.converged);
 assert.ok(u.state.accumulatedSlip>=r.accumulatedSlip);
 assert.ok(u.plasticStrainNorm>0);
 assert.ok(r.dissipationLowerBound>=0);
});
test('carga hidrostatica nao ativa cisalhamento cristalografico',()=>{
 const S=engine(),m=cp(S);
 const q=m.step(m.initial(),[.002,.002,.002,0,0,0]);
 assert.equal(q.status,'ELASTIC');near(q.accumulatedSlip,0);
});
test('orientacao do cristal CFC altera a resposta plastica',()=>{
 const S=engine();
 const r0=cp(S,'CFC',0).runAxial({magnitude:.035});
 const r45=cp(S,'CFC',45).runAxial({magnitude:.035});
 assert.ok(Math.abs(r0.accumulatedSlip-r45.accumulatedSlip)>1e-7,
  String(r0.accumulatedSlip)+' vs '+String(r45.accumulatedSlip));
});
test('HC separa CRSS basal/prismatica e impede calibracao tacita',()=>{
 const S=engine(),parameters={E:10,nu:.3,crss:{
  'HC · basal {0001}⟨a⟩':.06,'HC · prismático {10-10}⟨a⟩':.03
 },hardening:.6};
 const m=cp(S,'HC',30,parameters),r=m.runAxial({magnitude:.03});
 assert.ok(r.converged);assert.equal(m.systemCount,6);
 assert.equal(r.calibrated,false);
 assert.equal(r.solvesGrainEquilibrium,false);
});
test('CCC nao recebe sistemas omitidos e permanece explicito como hipotese',()=>{
 const S=engine(),m=cp(S,'CCC',30),r=m.runAxial({magnitude:.025});
 assert.equal(m.systemCount,12);assert.ok(r.converged);
 assert.match(r.limitation,/nao-Schmid/);
});
test('encruamento eleva resistencia, estados anteriores sao imutaveis',()=>{
 const S=engine(),m=cp(S),before=m.initial(),r=m.runAxial({magnitude:.03});
 assert.equal(before.accumulatedSlip,0);assert.ok(Object.isFrozen(before));
 assert.ok(r.systems.every(x=>x.resistance>=.08));
 assert.ok(r.state.accumulatedSlip>=r.accumulatedSlip-1e-12);
});
test('configuracoes e deformacoes invalidas nao geram propriedades medidas',()=>{
 const S=engine();
 assert.throws(()=>cp(S,'CFC',0,{E:10,nu:.3,hardening:1}),/CRSS/);
 const m=cp(S);
 assert.throws(()=>m.step(m.initial(),[0,.09,0,0,0,0]),/5%/);
 assert.throws(()=>m.step({...m.initial(),model:'other'},[0,0,0,0,0,0]),/outra configuracao/);
 assert.equal(m.calibrated,false);assert.equal(m.couplesJ2,false);
});
test('a pagina carrega os modelos em ordem e preserva o cache offline',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const p='domain/silm/crystal-plasticity.js';
 assert.ok(html.includes(p));
 assert.ok(html.indexOf('domain/silm/crystal-slip.js')<html.indexOf(p));
 assert.ok(html.indexOf(p)<html.indexOf('domain/silm/microstructure-view.js'));
 assert.ok(sw.includes('"'+p+'"'));
});
