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

test('energia do modelo elastico e positiva e reacoes preservam equilibrio global',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.10,increments:2});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.ok(Object.isFrozen(r.energy)&&Object.isFrozen(r.reactions));
 assert.ok(r.energy.elasticStored>0);
 assert.equal(r.energy.hardeningStored,0);
 assert.equal(r.energy.plasticDissipated,0);
 assert.ok(Math.abs(r.energy.total-r.energy.elasticStored)<1e-12);
 assert.ok(Math.abs(r.reactions.netFx)<1e-9,'Forca global x sem equilibrio');
 assert.ok(Math.abs(r.reactions.netFy)<1e-9,'Forca global y sem equilibrio');
 assert.ok(r.reactions.topY<0,'Carga superior de tracao orientada incorretamente');
 assert.ok(r.reactions.bottomY>0,'Reacao inferior de tracao incorreta');
 assert.ok(Math.abs(r.reactions.topY+r.reactions.bottomY)<2e-4);
 assert.ok(r.maxAbsLocalStrain>0&&r.maxAbsLocalStrain<.05);
 assert.equal(r.energyBalanceStatus,'NOT_EVALUATED_EXTERNAL_WORK');
});
test('dissipacao cristaloplastica e encruamento permanecem nao negativos',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const loading=m.run({mode:'tension',load:.83,increments:5});
 assert.equal(loading.status,'CONVERGED',JSON.stringify(loading));
 const unloading=m.run({mode:'tension',load:.83,increments:5,unload:true});
 assert.equal(unloading.status,'CONVERGED',JSON.stringify(unloading));
 assert.ok(loading.energy.elasticStored>=0&&loading.energy.hardeningStored>0);
 assert.ok(loading.energy.plasticDissipated>0);
 assert.ok(loading.energy.total>=loading.energy.elasticStored);
 assert.ok(unloading.energy.plasticDissipated+1e-10>=loading.energy.plasticDissipated);
 assert.ok(unloading.energy.hardeningStored+1e-10>=loading.energy.hardeningStored);
 assert.ok(unloading.maxAbsLocalStrain<.05);
 assert.ok(Math.abs(unloading.reactions.netFy)<1e-9);
 assert.equal(unloading.reactions.units,'relative');
});
test('energia nula em carga nula e ausencia de propriedades calorimetricas',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'compression',load:0,increments:1});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.ok(Math.abs(r.energy.total)<1e-12);
 assert.ok(Math.abs(r.reactions.netFy)<1e-12);
 assert.ok(r.maxAbsLocalStrain<1e-12);
 assert.equal(r.energyBalanceStatus,'NOT_EVALUATED_EXTERNAL_WORK');
 assert.equal(r.units,'relative');
});

test('contato deslocado altera campo e preserva metadados do carregamento',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const a=m.run({mode:'compression',position:.2,width:.2,load:.10,increments:2});
 const b=m.run({mode:'compression',position:.8,width:.2,load:.10,increments:2});
 assert.equal(a.status,'CONVERGED',JSON.stringify(a));
 assert.equal(b.status,'CONVERGED',JSON.stringify(b));
 assert.equal(a.loadCase.position,.2);
 assert.equal(b.loadCase.position,.8);
 assert.equal(a.loadCase.width,.2);
 assert.equal(a.loadCase.kind,'prescribed-displacement');
 assert.equal(a.loadCase.units,'relative');
 assert.equal(a.loadCase.unload,false);
 assert.equal(a.calibrated,false);
 assert.ok(Math.abs(a.sample(.2,0).dy-b.sample(.2,0).dy)>1e-5,
  'Contato deslocado precisa alterar o campo de deslocamento');
});

test('patch afim reproduz deformacao constante e cisalhamento de engenharia na malha CST',()=>{
 const {S}=setup(),engine=S.polycrystalCPFEM;
 for(const prescribed of [{exx:.001,eyy:-.0005,gammaXY:.0004},
  {exx:0,eyy:0,gammaXY:.001},{exx:.003,eyy:.002,gammaXY:0}]){
  const r=engine.verifyAffinePatch(prescribed);
  assert.equal(r.status,'AFFINE_PATCH_PASS');
  assert.ok(r.maxStrainError<1e-12,'Patch CST '+JSON.stringify(r));
  assert.ok(r.areaError<1e-12);
  assert.equal(r.engineeringShear,true);
  assert.equal(r.meshConvergenceVerified,false);
 }
 assert.throws(()=>engine.verifyAffinePatch({exx:.1}),/pequenas deformacoes/);
});
