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
 assert.equal(r.energyBalanceStatus,'TRAPEZOIDAL_WORK_AUDIT');
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
 assert.equal(r.energyBalanceStatus,'TRAPEZOIDAL_WORK_AUDIT');
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

test('trabalho externo elastico por reacoes coincide aproximadamente com energia armazenada',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.10,increments:3});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.equal(r.workHistory.length,3);
 assert.equal(r.energyAudit.status,'TRAPEZOIDAL_ESTIMATE');
 assert.ok(r.energyAudit.externalWorkLoading>0);
 assert.ok(r.energyAudit.loadingRelativeResidual<.04,
  'Balanco elastico fora da tolerancia: '+JSON.stringify(r.energyAudit));
 assert.equal(r.energyAudit.unloadingExternalWork,null);
 assert.equal(r.energyAudit.validAsExperimentalBalance,false);
 assert.ok(r.workHistory.every((s,i)=>s.step===i+1&&
  Number.isFinite(s.relativeResidual)&&s.externalWorkCumulative>=0));
 assert.ok(Object.isFrozen(r.workHistory));
});
test('trabalho na plastificacao tem historico mas nao e chamado de balanco medido',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.83,increments:5});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.ok(r.energy.plasticDissipated>0);
 assert.equal(r.workHistory.length,5);
 assert.ok(Number.isFinite(r.energyAudit.loadingWorkEnergyResidual));
 assert.ok(Number.isFinite(r.energyAudit.loadingRelativeResidual));
 assert.equal(r.energyAudit.calibrated,false);
 assert.equal(r.energyAudit.status,'TRAPEZOIDAL_ESTIMATE');
});
test('descarregamento controlado tem 5 incrementos sem liberacao abrupta',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.8,increments:5,unload:true});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.equal(r.energyAudit.status,'CONTROLLED_UNLOADING_ESTIMATE');
 assert.ok(Number.isFinite(r.energyAudit.unloadingExternalWork));
 assert.equal(r.workHistory.length,10);
 assert.equal(r.stepsCompleted,10);
 assert.deepEqual(Array.from(r.workHistory.slice(0,5).map(x=>x.phase)),
  Array(5).fill('loading'));
 assert.deepEqual(Array.from(r.workHistory.slice(5).map(x=>x.phase)),
  Array(5).fill('unloading'));
 assert.ok(Math.abs(r.workHistory.at(-1).relativeCommand)<1e-14);
 assert.equal(r.energyAudit.contactHeldAtZero,true);
 assert.equal(r.energyAudit.contactReleased,false);
 assert.equal(r.loadCase.unloadIncrements,5);
 assert.match(r.energyAudit.limitation,/garra mantida/);
});

test('a mesma malha CST resolve patch afim nas tres resolucoes independentes',()=>{
 const {S}=setup(),engine=S.polycrystalCPFEM;
 for(const [meshNX,meshNY] of engine.meshPresets){
  const r=engine.verifyAffinePatch({meshNX,meshNY,exx:.0008,eyy:-.0004,gammaXY:.0009});
  assert.equal(r.status,'AFFINE_PATCH_PASS',meshNX+'x'+meshNY);
  assert.equal(r.triangles,2*meshNX*meshNY);
  assert.ok(r.maxStrainError<1e-12);
  assert.equal(r.meshConvergenceVerified,false);
 }
 assert.throws(()=>engine.verifyAffinePatch({meshNX:4,meshNY:4}),/Malha CPFEM indisponivel/);
});
test('malhas refinadas produzem deslocamentos e reacoes em ensaio elastico comparavel',()=>{
 const {S,synthetic}=setup(),engine=S.polycrystalCPFEM;
 const cmp=engine.compareMeshSensitivity({structure:'CFC',synthetic,
  mode:'compression',position:.5,width:.5,load:.04});
 assert.equal(cmp.status,'DIAGNOSTIC_ONLY',JSON.stringify(cmp));
 assert.equal(cmp.grids.length,3);
 assert.equal(cmp.comparisons.length,2);
 assert.deepEqual(Array.from(cmp.grids.map(x=>x.triangles)),[48,192,432]);
 assert.ok(cmp.grids.every(x=>x.status==='CONVERGED'&&
  Number.isFinite(x.contactReactionY)&&Number.isFinite(x.energyTotal)));
 assert.ok(cmp.comparisons.every(x=>Number.isFinite(x.relativeReactionDifference)&&
  x.relativeReactionDifference>=0&&Number.isFinite(x.absoluteDisplacementDifference)));
 assert.equal(cmp.meshConvergenceVerified,false);
 assert.equal(cmp.calibrated,false);
});

test('ciclo elastico controlado realiza trabalho negativo na descarga e retorna energia',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.10,increments:3,unload:true,unloadIncrements:3});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.equal(r.workHistory.length,6);
 assert.equal(r.stepsCompleted,6);
 assert.equal(r.energyAudit.unloadingIncrements,3);
 assert.equal(r.loadCase.contactHeldAtZero,true);
 assert.equal(r.energyAudit.status,'CONTROLLED_UNLOADING_ESTIMATE');
 assert.ok(r.energyAudit.externalWorkLoading>0);
 assert.ok(r.energyAudit.unloadingExternalWork<0,'Descarga elastica deve devolver trabalho');
 assert.ok(Math.abs(r.energyAudit.externalWorkTotal)<1e-5,
  'Trabalho liquido elastico deveria ser aproximadamente nulo');
 assert.ok(Math.abs(r.energy.total)<1e-5,'Energia final elastica nao e nula');
 assert.equal(r.energyAudit.validAsExperimentalBalance,false);
 assert.ok(r.workHistory.slice(3).every((x,i)=>x.phase==='unloading'&&
  Math.abs(x.relativeCommand-.10*(1-(i+1)/3))<1e-12));
});
test('ciclo plastico em passos controlados retém dissipacao e historico energetico',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.80,increments:5,unload:true,unloadIncrements:5});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.equal(r.energyAudit.contactReleased,false);
 assert.equal(r.workHistory.length,10);
 assert.ok(r.energy.plasticDissipated>0);
 assert.ok(r.energy.hardeningStored>0);
 assert.ok(r.maxAccumulatedSlip>0);
 assert.ok(Number.isFinite(r.energyAudit.finalWorkEnergyResidual));
 assert.ok(r.energyAudit.externalWorkTotal<=r.energyAudit.externalWorkLoading+1e-9);
 const dissipations=r.workHistory.map(h=>h.internalEnergyCumulative);
 assert.ok(dissipations.every(Number.isFinite));
 assert.ok(r.workHistory.every(h=>h.units==='relative'));
});
test('controle rejeita numero invalido de incrementos de descarga',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 assert.equal(m.run({unload:true,unloadIncrements:0}).status,'INVALID_LOADING');
 assert.equal(m.run({unload:true,unloadIncrements:13}).status,'INVALID_LOADING');
 assert.equal(m.run({unload:true,unloadIncrements:1.5}).status,'INVALID_LOADING');
});

test('84E: retirada de forca elastica gera equilibrio no topo livre e retorno praticamente nulo',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.10,increments:3,
  unload:true,unloadMode:'force',unloadIncrements:3});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.equal(r.stepsCompleted,6);
 assert.equal(r.energyAudit.status,'ZERO_FORCE_EQUILIBRIUM_ESTIMATE');
 assert.equal(r.energyAudit.boundaryConditionFinal,'traction-free-top');
 assert.equal(r.energyAudit.contactReleased,true);
 assert.equal(r.energyAudit.contactHeldAtZero,false);
 assert.equal(r.loadCase.unloadMode,'force');
 assert.equal(r.energyAudit.appliedContactForceNormFinal,0);
 assert.ok(r.energyAudit.peakContactForceNorm>0);
 assert.ok(r.energyAudit.topFreeResidual<8e-5);
 assert.equal(r.workHistory.filter(h=>h.phase==='force-unloading').length,3);
 assert.ok(r.workHistory.at(-1).relativeCommand===0);
 assert.ok(r.energyAudit.unloadingExternalWork<0,'A descarga elastica deve restituir trabalho');
 assert.ok(Math.abs(r.energyAudit.externalWorkTotal)<1e-5);
 assert.ok(Math.abs(r.energy.total)<1e-5);
 const p=r.sample(.5,.3);
 assert.ok(Math.hypot(p.dx,p.dy)<.0003);
 assert.equal(r.energyAudit.validAsExperimentalBalance,false);
});
test('84E: equilibrio de forca nula preserva deformacao plastica acumulada',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const r=m.run({mode:'tension',load:.80,increments:5,
  unload:true,unloadMode:'force',unloadIncrements:5});
 assert.equal(r.status,'CONVERGED',JSON.stringify(r));
 assert.ok(r.maxAccumulatedSlip>0,'O historico plastico precisa ser mantido');
 assert.ok(r.energy.plasticDissipated>0);
 assert.ok(r.energy.hardeningStored>0);
 assert.equal(r.energyAudit.appliedContactForceNormFinal,0);
 assert.ok(r.energyAudit.topFreeResidual<8e-5);
 assert.equal(r.energyAudit.contactReleased,true);
 assert.equal(r.energyAudit.unloadingIncrements,5);
 assert.equal(r.workHistory.length,10);
 assert.equal(r.workHistory.at(-1).phase,'force-unloading');
 assert.ok(r.workHistory.slice(5).every(x=>x.integration==='trapezoidal-prescribed-nodal-force'));
 assert.ok(Math.abs(r.reactions.netFy)<2e-4);
 const displaced=r.sample(.5,.3);
 assert.ok(Number.isFinite(displaced.dy)&&Number.isFinite(displaced.dx));
 assert.equal(r.calibrated,false);
 assert.equal(r.finiteDeformation,false);
});
test('84E: modos de descarga diferenciam retorno da garra de alivio de forca',()=>{
 const {S,synthetic}=setup(),m=make(S,synthetic);
 const options={mode:'tension',load:.35,increments:4,unload:true,unloadIncrements:4};
 const d=m.run({...options,unloadMode:'displacement'});
 const f=m.run({...options,unloadMode:'force'});
 assert.equal(d.status,'CONVERGED',JSON.stringify(d));
 assert.equal(f.status,'CONVERGED',JSON.stringify(f));
 assert.equal(d.loadCase.contactHeldAtZero,true);
 assert.equal(d.loadCase.contactReleased,false);
 assert.equal(f.loadCase.contactHeldAtZero,false);
 assert.equal(f.loadCase.contactReleased,true);
 assert.equal(f.loadCase.boundaryConditionFinal,'traction-free-top');
 assert.ok(f.energyAudit.topFreeResidual<8e-5);
 assert.ok(Math.abs(f.energyAudit.unloadingExternalWork)>0);
 assert.equal(m.run({unloadMode:'not-supported'}).status,'INVALID_LOADING');
});
