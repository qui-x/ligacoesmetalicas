import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const context=vm.createContext({window:{SILM:{}}});
vm.runInContext(read('domain/silm/data/research-evidence-fe-nist.js'),context);
const evidence=context.window.SILM.researchEvidence;

test('fonte primaria e amostras Fe estao contextualizadas sem fingir CNTP',()=>{
 assert.equal(evidence.source.id,'nist-tn1879-bam-table6');
 assert.equal(evidence.source.url,'https://doi.org/10.6028/NIST.TN.1879');
 assert.equal(evidence.source.referenceCNTPVerified,false);
 assert.equal(evidence.source.pressurePa,null);
 assert.equal(evidence.source.temperatureLabel,'21 ± 3 °C (291,15–297,15 K)');
 assert.equal(evidence.source.temperatureRangeK[0],291.15);
 assert.equal(evidence.source.temperatureRangeK[1],297.15);
 assert.equal(evidence.profiles.length,12);
 assert.equal(new Set(evidence.profiles.map(x=>x.id)).size,12);
 for(const p of evidence.profiles){
  assert.equal(p.symbol,'Fe');assert.equal(p.atomicNumber,26);
  assert.equal(p.property,'ductility');assert.equal(p.CNTPVerified,false);
  assert.equal(p.engineRelease,false);assert.equal(p.referenceOnly,true);
  assert.equal(p.sourceId,evidence.source.id);
  assert.ok(Number.isFinite(p.yieldStrengthMPa));
  assert.ok(Number.isFinite(p.tensileStrengthMPa));
  assert.ok(Number.isFinite(p.elongationAtFracturePercent));
  assert.ok(Object.isFrozen(p));
 }
 assert.equal(evidence.byAtomicNumber(29).length,0);
 assert.equal(evidence.byAtomicNumber(26).length,12);
});

test('doze medias da Tabela 6 NIST preservadas por taxa e amostra',()=>{
 const expected={
  K05:[[1e-3,231,283,47,95],[1e-4,204,262,51,95],[1e-5,176,250,50,95]],
  K02:[[1e-3,195,245,46,88],[1e-4,169,237,47,89],[1e-5,163,232,43,91]],
  S11:[[1e-3,105,206,73,96],[1e-4,88,201,73,96],[1e-5,66,189,66,96]],
  A11:[[1e-3,68,201,71,95],[1e-4,44,188,67,95],[1e-5,28,178,58,95]]
 };
 for(const [sample,values]of Object.entries(expected)){
  const got=evidence.bySample(26,sample).map(p=>[p.strainRatePerSecond,p.yieldStrengthMPa,p.tensileStrengthMPa,p.elongationAtFracturePercent,p.reductionOfAreaPercent]);
  assert.deepEqual(got,values);
 }
 assert.deepEqual(Object.keys(evidence.samples),['K05','K02','S11','A11']);
 assert.equal(evidence.samples.A11.purityPercent,99.9999878);
});

test('visualizacao pertence ao controle existente de ductilidade, nao motor isolado',()=>{
 const html=read('index.html');
 const p=read('domain/silm/property-view.js');
 const cache=read('sw.js');
 const css=read('domain/silm/research-evidence.css');
 const source='domain/silm/data/research-evidence-fe-nist.js';
 assert.ok(html.includes(source));
 assert.ok(html.indexOf(source)<html.indexOf('domain/silm/property-view.js'));
 assert.ok(html.includes('domain/silm/research-evidence.css'));
 assert.ok(cache.includes(source));
 assert.ok(cache.includes('domain/silm/research-evidence.css'));
 assert.match(p,/researchSection\.hidden=active!=='ductility'/);
 assert.match(p,/scientificEvidence\.bySample\(26,selected\.code\)/);
 assert.match(p,/Estes números não calibram a animação/);
 assert.match(css,/overflow-x:auto/);
 assert.ok(!read('domain/silm/material-engine.js').includes('researchEvidence'), 'dados documentais nao calibram motor numerico');
});
