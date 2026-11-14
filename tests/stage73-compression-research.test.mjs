import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ctx=vm.createContext({window:{SILM:{}}});ctx.SILM=ctx.window.SILM;
vm.runInContext(read('domain/silm/data/research-compression-stage73.js'),ctx);
const R=ctx.SILM.compressionStage73,get=id=>R.records.find(x=>x.id===id);

test('Etapa73: 8 fichas de 7 metais, fontes individuais e motores bloqueados',()=>{
 assert.equal(R.stage,73);
 assert.equal(R.count,8);assert.equal(R.metals,7);
 assert.deepEqual(Array.from(R.symbols),['Cu','Fe','Hf','Ni','Ti','U','Zr']);
 assert.equal(R.bySymbol.Hf.length,2);
 assert.equal(new Set(R.records.map(x=>x.id)).size,8);
 assert.equal(R.exactCNTPApproved,0);
 assert.equal(R.engineEnabled,false);
 assert.equal(R.sourceFullTextCheckedCount,1);
 for(const p of R.records){
  assert.equal(p.stage,73);
  assert.equal(p.studyStage,73,'o seletor de amostras requer studyStage');
  assert.equal(p.CNTPhomologated,false);
  assert.equal(p.engineRelease,false);
  assert.equal(p.numericSimulatorApproval,false);
  assert.equal(p.referenceOnly,true);
  assert.equal(p.pressurePa,null);
  assert.ok(Object.isFrozen(p));assert.ok(Object.isFrozen(p.metrics));
  assert.ok(p.sourceURL.startsWith('https://'));
  assert.match(p.test,/compress/i);
  assert.ok(Object.values(p.metrics).every(v=>Number.isFinite(v)));
  assert.match(p.qualifier,/não/i);
  assert.ok(p.sourceTitle.length>20);
 }
});

test('fontes primárias e valores explicitamente DISTINTOS de maleabilidade limite',()=>{
 const ti=R.bySymbol.Ti[0],ni=R.bySymbol.Ni[0],cu=R.bySymbol.Cu[0],
  fe=R.bySymbol.Fe[0],hf=R.bySymbol.Hf[0],zr=R.bySymbol.Zr[0],u=R.bySymbol.U[0];
 assert.equal(ti.testTemperatureK,296.15);
 assert.equal(ti.metrics.compression_reported_epsilon_tested,0.4);
 assert.deepEqual(Array.from(ti.strainRatesPerSecond),[0.001,0.01,1]);
 assert.equal(ni.metrics.compression_true_strain_tested,0.2);
 assert.equal(ni.additionalBound.relation,'≤');
 assert.equal(ni.additionalBound.value,0.009);
 assert.match(ni.sample,/99,7%/);
 assert.match(ni.sample,/NÃO confundir com espuma/);
 assert.equal(cu.metrics.compression_true_strain_tested,0.1);
 assert.deepEqual(Array.from(cu.temperatureRangeK),[300,600]);
 assert.equal(fe.metrics.compression_true_strain_tested,0.7);
 assert.equal(fe.testTemperatureK,295);
 assert.match(fe.sample,/80 ppm C/);
 assert.equal(hf.metrics.compression_yield_strength_MPa,500);
 assert.equal(hf.strainRatesPerSecond[0],300);
 assert.match(hf.sample,/99,99%/);
 assert.equal(R.bySymbol.Hf[1].metrics.compression_hardening_transition_strain_approx,0.25);
 assert.equal(zr.metrics.compression_reported_strain_pct,10);
 assert.match(zr.sample,/Zr702/);
 assert.equal(zr.testTemperatureK,null);
 assert.equal(u.metrics.compression_asymptotic_model_MPa,2900);
 assert.match(u.qualifier,/ASSINTÓTICO/);
 assert.equal(u.testTemperatureK,null);
 for(const p of R.records){
  assert.equal(p.metrics.compression_strain_pct,undefined,
   'não confundir regime estudado com deformação máxima');
  assert.equal(p.metrics.rolling_reduction_pct,undefined,
   'ensaio de compressão não é processo de laminação');
  assert.equal(p.metrics.elong_break_pct,undefined,
   'compressão não pode virar alongamento de tração');
 }
});

test('painel Malleabilidade conserva Etapa65, Cu/Tc e impede calibração do motor',()=>{
 const h=read('index.html'),sw=read('sw.js'),data='domain/silm/data/research-compression-stage73.js',
  panel=read('domain/silm/research-evidence-panel.js');
 assert.ok(h.includes(data));assert.ok(sw.includes(data));
 assert.ok(h.indexOf(data)<h.indexOf('domain/silm/research-evidence-panel.js'));
 assert.match(panel,/SILM\.compressionStage73/);
 assert.match(panel,/active==='malleability'\?primaryCompression/);
 assert.match(panel,/Deformação verdadeira avaliada \(não limite\)/);
 assert.match(panel,/Tensão assintótica AJUSTADA/);
 assert.match(panel,/valor ajustado de modelo NÃO é medição de escoamento/);
 for(const p of ['domain/silm/material-engine.js','domain/silm/thermal.js',
  'domain/silm/electrothermal.js','domain/silm/optical-observation.js']){
  assert.equal(read(p).includes('compressionStage73'),false,p);
 }
});
