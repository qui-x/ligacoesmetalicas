'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function setup(){
 const c={window:{SILM:{}}};c.SILM=c.window.SILM;
 for(const file of ['crystal-slip.js','crystal-plasticity.js','microstructure-synthetic.js','polycrystal-cpfem.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm',file),'utf8'),c);
 const S=c.SILM,synthetic=S.microstructureSynthetic.generate({seed:139712,profile:'equiaxial'});
 return {S,synthetic};
}
const make=(S,synthetic,structure='CFC',parameters)=>S.polycrystalCPFEM.create({
 structure,synthetic,...(parameters?{parameters}:{})
});
test('a malha policristalina usa orientacoes reproduziveis e nao simula EBSD',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 assert.equal(m.structure,'FCC');assert.equal(m.calibrated,false);
 assert.equal(m.grainCount,synthetic.polygons.length);
 assert.equal(m.triangles,2*S.polycrystalCPFEM.NX*S.polycrystalCPFEM.NY);
 const a=m.run({load:0,increments:1});
 assert.equal(a.status,'CONVERGED');
 assert.ok(a.sampledGrains>1);
 assert.ok(a.grains.some(g=>g.integrationPoints>0));
 assert.equal(a.grains.length,synthetic.polygons.length);
 assert.ok(a.grains.every(g=>!g.calibrated));
 assert.equal(a.canFeedJ2,false);
 assert.equal(a.canClaimMeasuredGrainResponse,false);
});
test('carga elastica pequena satisfaz equilibrio sem inventar plasticidade',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.10,increments:1});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.ok(r.residual<8e-5,'residuo FEM '+r.residual);
 assert.equal(r.maxAccumulatedSlip,0);
 const p=r.sample(.5,.15);assert.ok(Number.isFinite(p.dx)&&Number.isFinite(p.dy));
 const s=r.sampleStress(.5,.2);assert.ok(Number.isFinite(s[2][2]));
});
test('a resposta muda conforme a orientacao dos graos e se deforma em conjunto',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.83,increments:5});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.ok(r.maxAccumulatedSlip>0,'Nao houve plasticidade cristalografica');
 assert.ok(r.plasticTriangles>0);
 const active=r.grains.filter(g=>g.maxAccumulatedSlip>0);
 assert.ok(active.length>0);
 assert.ok(active.some(g=>g.integrationPoints>0));
 const distinct=new Set(r.grains.filter(g=>g.integrationPoints>0).map(g=>g.meanAccumulatedSlip.toFixed(7)));
 assert.ok(distinct.size>2,'Orientacao nao alterou resposta por grao');
 assert.ok(r.sample(.5,0).dy<0,'Tracao deve puxar a borda superior');
});
test('descarregamento conserva plasticidade e respeita falta de topografia medida',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.8,increments:5,unload:true});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.equal(r.unloaded,true);
 assert.ok(r.maxAccumulatedSlip>0);
 assert.ok(r.sample(.5,.2).dy!==0||r.sample(.5,.2).dx!==0);
 assert.equal(r.finiteDeformation,false);
 assert.equal(r.units,'relative');
});
test('modo compressao e blocos CCC e HC nao recebem propriedades por metal',()=>{
 const {S,synthetic}=setup();
 for(const structure of ['CCC','HC']){
  const m=make(S,synthetic,structure);
  const r=m.run({mode:'compression',load:.25,increments:2});
  assert.equal(r.status,'CONVERGED',structure+': '+JSON.stringify(r));
  assert.equal(r.calibrated,false);
  assert.equal(m.requiresMenuReview,true);
 }
});
test('rejeita maps importados, ausencia de validacao e carga invalida',()=>{
 const {S,synthetic}=setup();
 assert.throws(()=>make(S,{...synthetic,kind:'imported'}),/Somente/);
 assert.throws(()=>make(S,{...synthetic,generator:'ebsd'}),/Somente/);
 assert.throws(()=>make(S,synthetic,'DHCP'),/Somente/);
 const m=make(S,synthetic);
 assert.equal(m.run({load:2}).status,'INVALID_LOADING');
 assert.equal(m.run({mode:'shear'}).converged,false);
});
test('o modulo carrega antes da microestrutura e participa do cache offline',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
  sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const p='domain/silm/polycrystal-cpfem.js';
 assert.ok(html.includes(p)&&sw.includes('"'+p+'"'));
 assert.ok(html.indexOf('domain/silm/crystal-plasticity.js')<html.indexOf(p));
 assert.ok(html.indexOf(p)<html.indexOf('domain/silm/microstructure-view.js'));
});
