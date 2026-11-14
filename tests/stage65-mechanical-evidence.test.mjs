import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const context=vm.createContext({window:{SILM:{}}});context.SILM=context.window.SILM;
vm.runInContext(read('domain/silm/data/research-evidence-stage65.js'),context);
const e=context.SILM.stage65Evidence;
const byId=id=>e.records.find(x=>x.id===id);
test('etapa 65: 19 perfis adicionais de 230, 7 fontes condicionais e 9 sem original',()=>{
 assert.equal(e.stage,65);
 assert.equal(e.sourceTotalProfiles,230);
 assert.equal(e.previousStageProfiles,211);
 assert.equal(e.records.length,19);
 assert.equal(e.count,19);
 assert.equal(e.numericRecords,16);
 assert.equal(e.visibleConditionalNumeric,7);
 assert.equal(e.primaryConfirmed,2);
 assert.equal(e.pendingOriginalVerification,9);
 assert.equal(e.contextualRecords,3);
 assert.equal(new Set(e.records.map(x=>x.id)).size,19);
 assert.deepEqual(Array.from(e.symbols),['Bi','Co','Lu','Pu','Th']);
 assert.equal(e.exactCNTPApprovals,0);
 assert.equal(e.engineEnabled,false);
 for(const p of e.records){
  assert.equal(p.CNTPhomologated,false);
  assert.equal(p.engineRelease,false);
  assert.equal(p.referenceOnly,true);
  assert.ok(Object.isFrozen(p));assert.ok(Object.isFrozen(p.metrics));
  assert.ok(p.sourceURL.startsWith('https://'));
  assert.ok(p.studyStage>57&&p.studyStage<=65);
  assert.ok(['P1','P2','Q','S'].includes(p.classification));
 }
});
test('Bi puro: fonte primaria confirma 293 K e 423 K, sem extrapolacao CNTP',()=>{
 const a=byId('v60-bi-yu2017-pure-293K'),b=byId('v60-bi-yu2017-pure-423K');
 for(const p of [a,b]){
  assert.equal(p.verification,'primary-confirmed');
  assert.equal(p.sourceStatus,'primary-fulltext-confirmed');
  assert.equal(p.sourceURL,'https://doi.org/10.2320/matertrans.MA201605');
  assert.equal(p.sourceRatePerSecond,0.00034);
  assert.match(p.sample,/99,99%/);
 }
 assert.equal(a.testTemperatureK,293);
 assert.equal(a.metrics.yield_MPa,7.5);
 assert.equal(a.metrics.UTS_MPa,12);
 assert.equal(a.metrics.elong_break_pct,0.7);
 assert.equal(b.testTemperatureK,423);
 assert.equal(b.metrics.yield_MPa,3.8);
 assert.equal(b.metrics.UTS_MPa,4.2);
 assert.equal(b.metrics.elong_break_pct,15.4);
 assert.equal(e.numericBySymbol.Bi.length,2);
 assert.equal(e.contextBySymbol.Bi.length,2);
});
test('Pu beta: 680% é apenas valor máximo, não valor típico; Pu alfa: limite estrito',()=>{
 const p=byId('v61-pu-beta-dahlgren1969-max680');
 assert.equal(p.metrics.elong_break_reported_max_pct,680);
 assert.equal(p.metrics.elong_break_pct,undefined);
 assert.equal(p.sourceStatus,'maximum-from-primary-abstract');
 const alpha=byId('v61-pu-alpha-ianniello1964-limite-lt0p1');
 assert.equal(alpha.bound.relation,'<');
 assert.equal(alpha.bound.value,0.1);
 assert.equal(alpha.bound.exact,false);
 assert.ok(Object.isFrozen(alpha.bound));
 assert.equal(Object.keys(alpha.metrics).length,0);
 assert.ok(e.contextBySymbol.Pu.some(x=>x.id===alpha.id));
 const fine=byId('v62-pu-alpha-merz1971-extruded-finegrain-RT-elong8');
 assert.equal(fine.metrics.elong_break_pct,8);
 assert.equal(fine.sourceStatus,'secondary-laboratory-review');
});
test('Lu: compressao ≠ tracao; Th: nove transcricoes com original pendente',()=>{
 const lu=byId('v64-lu-savitskii1963-cast-compression-roomtemp');
 assert.equal(lu.metrics.compression_strain_pct,12);
 assert.equal(lu.metrics.elong_break_pct,undefined);
 assert.equal(lu.sourceStatus,'historical-table-inspected');
 assert.equal(lu.testTemperatureK,null);
 const th=e.bySymbol.Th;
 assert.equal(th.length,9);
 assert.equal(e.pendingBySymbol.Th.length,9);
 assert.equal(e.numericBySymbol.Th.length,0);
 for(const p of th){
  assert.equal(p.verification,'original-pending');
  assert.equal(p.sourceStatus,'original-source-pending');
  assert.ok(typeof p.metrics.elong_break_pct==='number');
  assert.match(p.reviewStatus,/VERIFICAR_ORIGINAL/);
 }
});
test('Co historico não tem fase HC validada e não herda ensaios Co-HC',()=>{
 const arr=e.numericBySymbol.Co;
 assert.equal(arr.length,2);
 assert.deepEqual(Array.from(arr,p=>p.metrics.elong_break_pct),[4,8]);
 assert.ok(arr.every(p=>p.sourceStatus==='historical-patent-reproduction'));
 assert.ok(arr.every(p=>p.qualifier.includes('NÃO qualificar como Co-HC')));
});
test('integracao aparece no mesmo painel de Ductilidade/Maleabilidade com status',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const data='domain/silm/data/research-evidence-stage65.js';
 assert.ok(html.includes(data));assert.ok(sw.includes(data));
 assert.ok(html.indexOf(data)<html.indexOf('domain/silm/research-evidence-panel.js'));
 const panel=read('domain/silm/research-evidence-panel.js');
 assert.match(panel,/SILM\.stage65Evidence/);
 assert.match(panel,/const approvedSupplement=supplement\?\.numericBySymbol/);
 assert.match(panel,/const pending=active==='ductility'/);
 assert.match(panel,/const rawContext=supplement\?\.contextBySymbol/);
 assert.match(panel,/Máximo de alongamento relatado/);
 assert.match(panel,/Limite estrito: alongamento <0,1%/);
 assert.match(panel,/original ainda não conferido/);
 assert.match(panel,/NÃO atribuir à fase HC automaticamente/);
 for(const path of ['domain/silm/material-engine.js','domain/silm/electrothermal.js',
   'domain/silm/thermal.js']){
  assert.equal(read(path).includes('stage65Evidence'),false);
 }
});
