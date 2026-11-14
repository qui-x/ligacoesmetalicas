import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const ctx=vm.createContext({window:{SILM:{}}});ctx.SILM=ctx.window.SILM;
vm.runInContext(read('domain/silm/data/research-electrical-icepoint.js'),ctx);
const E=ctx.SILM.researchElectricalIcepoint;
const val=(sym,sourceId)=>E.bySymbol[sym].find(x=>x.sourceId===sourceId);
const close=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(b)),a+' != '+b);

test('29 referencias de 24 metais de NBS/Matula/Chi, com fontes e T=273,15 K',()=>{
 assert.equal(E.count,29);assert.equal(E.metalCount,24);
 assert.equal(E.records.length,29);
 assert.equal(Object.keys(E.sources).length,3);
 assert.equal(E.referenceTemperatureK,273.15);
 assert.equal(E.referencePressurePa,101325);
 assert.equal(E.measurementsAtReferenceTemperature,29);
 assert.equal(E.completeCNTPApproved,0);
 assert.equal(E.engineEnabled,false);
 assert.equal(new Set(E.records.map(x=>x.id)).size,29);
 const counts={};
 for(const p of E.records){
  counts[p.sourceId]=(counts[p.sourceId]||0)+1;
  assert.equal(p.temperatureK,273.15);
  assert.equal(p.sourceTemperatureVerified,true);
  assert.equal(p.pressurePa,null);
  assert.equal(p.CNTPhomologated,false);
  assert.equal(p.engineRelease,false);
  assert.equal(p.referenceOnly,true);
  assert.equal(p.conductivityDerived,true);
  assert.ok(p.resistivityMicroOhmCm>0);
  close(p.resistivityOhmM,p.resistivityMicroOhmCm*1e-8);
  close(p.conductivitySM,1/p.resistivityOhmM);
  assert.ok(Object.isFrozen(p));
  assert.ok(E.sources[p.sourceId].url.startsWith('https://'));
 }
 assert.deepEqual(counts,{'matula-1979':4,'chi-1979':5,'nbs-tn1053':20});
 assert.equal(E.bySymbol.Sn,undefined,'Sn a 0C exige distinguir fase beta metastavel');
 assert.equal(E.bySymbol.Ra,undefined,'Chi Ra foi estimativa de rho intrinseca, nao rho total');
 assert.equal(E.bySymbol.Mn.length,1);
 assert.match(E.bySymbol.Mn[0].note,/APENAS fase alfa/);
});

test('tabelas recomendadas Matula e Chi: valores totais sem misturar rho intrinseca',()=>{
 const expected={
  Cu:1.543,Au:2.051,Pd:9.78,Ag:1.467,
  Be:3.02,Mg:4.05,Ca:3.11,Sr:12.3,Ba:30.2
 };
 for(const [sym,rho] of Object.entries(expected)){
  const sourceId=['Cu','Au','Pd','Ag'].includes(sym)?'matula-1979':'chi-1979';
  const record=val(sym,sourceId);
  assert.ok(record,sym+' ausente');
  assert.equal(record.resistivityMicroOhmCm,rho);
  assert.equal(record.sourceType,'evaluated-total');
 }
 assert.equal(val('Cu','matula-1979').resistivityOhmM,1.543e-8);
 close(val('Cu','matula-1979').conductivitySM/1e6,100/1.543);
 assert.equal(val('Be','chi-1979').reviewStatus,'needs-comparison');
 assert.equal(val('Sr','chi-1979').reviewStatus,'needs-comparison');
 assert.equal(val('Ba','chi-1979').reviewStatus,'needs-comparison');
});

test('NBS TN 1053 Tabela 1.1: 20 valores puros, fases e fontes preservadas',()=>{
 const expected={
  Al:2.428,Be:2.7,Co:5.24,Cu:1.553,Cr:12.155,Au:2.058,
  In:8,Fe:9.07,Pb:19.2,Mg:4.12,Mn:143.5,Mo:5,
  Ni:6.23,Nb:13.96,Pt:9.6,Na:4.337,Ag:1.48,
  Ti:39.4,W:4.94,Zn:5.45
 };
 for(const [sym,rho] of Object.entries(expected)){
  const record=val(sym,'nbs-tn1053');
  assert.ok(record);
  assert.equal(record.resistivityMicroOhmCm,rho);
  assert.equal(record.sourceType,'compiled-total');
 }
 assert.equal(E.bySymbol.Cu.length,2,'duas fontes Cu devem ficar comparaveis');
 assert.equal(E.bySymbol.Be.length,2,'NBS e Chi para Be sem medias');
});

test('dados fisicos permanecem documentais no modulo Explorar, sem acionar Joule',()=>{
 const html=read('index.html'),sw=read('sw.js'),p=read('domain/silm/property-view.js');
 const registry='domain/silm/data/research-electrical-icepoint.js';
 const panel='domain/silm/research-electrical-panel.js';
 for(const name of [registry,panel]){
  assert.ok(html.includes(name));assert.ok(sw.includes(name));
  assert.ok(html.indexOf(name)<html.indexOf('domain/silm/property-view.js'));
 }
 assert.match(p,/SILM\.createElectricalEvidencePanel/);
 assert.match(p,/electricalEvidence\.update/);
 const ui=read(panel);
 assert.match(ui,/sigma|σ = 1\/ρ/);
 assert.match(ui,/NÃO homologados na CNTP/);
 assert.match(ui,/não autorizam média automática/);
 assert.ok(!read('domain/silm/electrothermal.js').includes('researchElectricalIcepoint'));
 assert.ok(!read('domain/silm/material-engine.js').includes('researchElectricalIcepoint'));
 assert.ok(!read('domain/silm/thermal.js').includes('researchElectricalIcepoint'));
});
