import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const context=vm.createContext({window:{SILM:{}}});
context.SILM=context.window.SILM;
vm.runInContext(read('domain/silm/data/research-evidence-multistage.js'),context);
const cat=context.SILM.multistageResearch;
test('consolidacao segura de 18 etapas: 138 novos perfis sem duplicar os 12 de Fe',()=>{
 assert.equal(cat.stage,57);
 assert.equal(cat.sourceProfileCount,211);
 assert.equal(cat.records.length,138);
 assert.equal(cat.count,138);
 assert.equal(cat.symbols.length,46);
 assert.equal(cat.validatedAtReferenceCount,0);
 assert.equal(cat.engineEnabled,false);
 assert.equal(cat.bySymbol.Fe,undefined,'Fe foi duplicado em outro registro');
 assert.equal(new Set(cat.records.map(x=>x.id)).size,138);
 assert.deepEqual([...new Set(cat.records.map(x=>x.studyStage))].sort((a,b)=>a-b),
  [10,12,17,18,19,21,23,24,25,26,27,28,29,37,38,52,53,57]);
 for(const p of cat.records){
  assert.ok(['P1','P2','S'].includes(p.classification));
  assert.ok(p.sourceURL.startsWith('http'));
  assert.equal(p.CNTPhomologated,false);
  assert.equal(p.engineRelease,false);
  assert.equal(p.referenceOnly,true);
  assert.ok(Object.keys(p.metrics).length);
  assert.ok(Object.values(p.metrics).every(Number.isFinite));
  assert.ok(Object.isFrozen(p));
  assert.ok(Object.isFrozen(p.metrics));
 }
});
test('fontes e numeros de Ti etapa 52, Zr/Ta/Pb etapa 57, Li/Zn anteriores',()=>{
 const pick=(sym,id)=>cat.bySymbol[sym].find(x=>x.id===id);
 assert.deepEqual([pick('Ti','v52-ti-grade2-rs').metrics.yield_MPa,
    pick('Ti','v52-ti-grade2-rs').metrics.UTS_MPa,
    pick('Ti','v52-ti-grade2-rs').metrics.elong_break_pct],[998,1040,6]);
 assert.deepEqual([pick('Zr','v57-zr-zr702-original').metrics.yield_MPa,
    pick('Zr','v57-zr-zr702-original').metrics.elong_break_pct],[361,22.2]);
 assert.equal(pick('Ta','v57-ta-slm-190').metrics.elong_break_pct,16);
 assert.match(pick('Ta','v57-ta-slm-190').qualifier,/16%.*18%/);
 assert.deepEqual([pick('Pb','v57-pb-casting-A-1').metrics.UTS_MPa,
    pick('Pb','v57-pb-casting-A-1').metrics.elong_break_pct],[17,43]);
 assert.equal(pick('Zn','Zn-pure-2022-UTS-EL').metrics.elong_break_pct,10);
 assert.equal(pick('Li','v19-li-01').metrics.elong_break_pct,28);
 const co=cat.bySymbol.Co.filter(x=>x.studyStage===53);
 assert.equal(co.length,19);
 assert.ok(co.every(x=>x.test.toLowerCase().includes('compress')));
});
test('novos perfis nao alteram o motor nem a elegibilidade: painel original',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const panel=read('domain/silm/research-evidence-panel.js');
 const view=read('domain/silm/property-view.js');
 for(const path of ['domain/silm/data/research-evidence-multistage.js','domain/silm/research-evidence-panel.js']){
  assert.ok(html.includes(path));assert.ok(sw.includes(path));
  assert.ok(html.indexOf(path)<html.indexOf('domain/silm/property-view.js'));
 }
 assert.match(view,/const multistageEvidence=SILM\.createMultistageResearchPanel/);
 assert.match(view,/multistageEvidence\.update\(/);
 assert.match(panel,/A animação não utiliza estes números/);
 assert.ok(!read('domain/silm/material-engine.js').includes('multistageResearch'));
 assert.ok(!read('domain/silm/material-profile-registry.js').includes('multistageResearch'));
});
