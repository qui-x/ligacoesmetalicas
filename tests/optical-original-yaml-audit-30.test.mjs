import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ctx=vm.createContext({window:{SILM:{}}});ctx.SILM=ctx.window.SILM;
vm.runInContext(read('domain/silm/data/research-optical-candidates-stage65.js'),ctx);
for(let i=1;i<=4;i++)vm.runInContext(read('domain/silm/data/optical-source-audit-part'+i+'.js'),ctx);
vm.runInContext(read('domain/silm/data/optical-source-audit-registry.js'),ctx);
const A=ctx.SILM.opticalSourceYAMLAudit,O=ctx.SILM.opticalResearchCandidates;
const get=s=>A.getForSymbol(s);

test('30 YAML originais: SHA, DOI, faixa, tipo, modelos e CNTP bloqueada',()=>{
 assert.equal(A.count,30);
 assert.equal(A.verifiedMetals,30);
 assert.equal(A.sourceGroups,4);
 assert.equal(A.baselineCandidateProfiles,59);
 assert.equal(A.notAuditedCandidateProfiles,29);
 assert.equal(A.literatureStudiesFullyChecked,0);
 assert.equal(A.sourceCNTPCertifications,0);
 assert.equal(A.engineEnabled,false);
 assert.equal(A.sourceDOIs,26);
 assert.equal(A.classificationCounts['tabulated-source-dataset'],26);
 assert.equal(A.classificationCounts['fitted-optical-model'],3);
 assert.equal(A.classificationCounts['electron-loss-derived'],1);
 assert.equal(new Set(A.rows.map(x=>x.symbol)).size,30);
 for(const p of A.rows){
  assert.equal(p.validation,'YAML_DATA_AND_INTERPOLATION_VERIFIED');
  assert.equal(p.databaseYAMLVerified,true);
  assert.equal(p.fullOriginalPaperReviewed,false);
  assert.equal(p.sourceExactTemperatureCNTPSupported,false);
  assert.equal(p.sourceExactPressureCNTPSupported,false);
  assert.equal(p.engineRelease,false);
  assert.equal(p.referenceOnly,true);
  assert.equal(p.format,'tabulated nk');
  assert.equal(p.wavelengthNm,550);
  assert.ok(p.sha.length===40);
  assert.ok(p.sourceURL.startsWith('https://github.com/polyanskiy/'));
  assert.ok(p.bracketUm[0]<=.55&&p.bracketUm[1]>=.55);
  assert.ok(p.sourcePointCount>=2);
  assert.ok(p.n550>=0&&p.k550>=0);
  assert.ok(Object.isFrozen(p));
 }
 for(const s of ['Sc','Tc','Pu'])assert.equal(get(s),null);
});

test('os 30 YAML reproduzem n,k e R550 da pesquisa anterior, sem extrapolação',()=>{
 for(const p of A.rows){
  const legacy=O.bySymbol[p.symbol].find(x=>x.sourceDataset===p.dataset);
  assert.ok(legacy,p.symbol+' ausente');
  const [[na,ka],[nb,kb]]=p.bracketNK;
  const t=(.55-p.bracketUm[0])/(p.bracketUm[1]-p.bracketUm[0]);
  const n=na+t*(nb-na),k=ka+t*(kb-ka);
  const R=((n-1)**2+k**2)/((n+1)**2+k**2);
  assert.ok(Math.abs(n-p.n550)<1e-9,p.symbol+' n');
  assert.ok(Math.abs(k-p.k550)<1e-9,p.symbol+' k');
  assert.ok(Math.abs(R-p.R550)<1e-10,p.symbol+' R');
  assert.ok(Math.abs(legacy.R-p.R550)<1e-10,p.symbol+' R legado');
  assert.ok(Math.abs(legacy.n-p.n550)<1e-9,p.symbol+' n legado');
  assert.ok(Math.abs(legacy.k-p.k550)<1e-9,p.symbol+' k legado');
 }
});

test('filmes finos, 298 K, modelos LD e REELS continuam específicos',()=>{
 for(const s of ['Be','W','Pt']){
  assert.equal(get(s).sourceType,'fitted-optical-model');
  assert.match(get(s).comments,/Lorentz-Drude/);
  assert.equal(get(s).doi,'10.1364/AO.37.005271');
 }
 assert.equal(get('Ta').sourceType,'electron-loss-derived');
 assert.match(get('Ta').comments,/REELS/);
 assert.equal(get('Ta').doi,'10.1063/1.3243762');
 assert.match(get('Mg').comments,/25 nm thin film/);
 assert.match(get('Mg').comments,/vacuum annealed 2 hr 350 °C/);
 assert.match(get('Zr').comments,/200 nm thin film/);
 assert.match(get('Al').comments,/template stripped/);
 for(const s of ['Li','Ca','Pb']){
  assert.equal(get(s).conditionKind,'explicit-298K');
  assert.match(get(s).comments,/298 K/);
 }
 assert.match(get('Os').comments,/Extraordinary ray/);
 assert.match(get('Ir').comments,/polycrystalline, annealed/);
 assert.equal(get('Ag').doi,'10.1103/PhysRevB.6.4370');
 assert.equal(get('Cu').doi,'10.1103/PhysRevB.6.4370');
});

test('integração na mesma UI do Brilho, sem alterar os motores e o offline',()=>{
 const paths=[...Array.from({length:4},(_,i)=>'domain/silm/data/optical-source-audit-part'+(i+1)+'.js'),
  'domain/silm/data/optical-source-audit-registry.js'];
 const h=read('index.html'),sw=read('sw.js'),panel=read('domain/silm/research-optical-candidates-panel.js');
 for(const p of paths){
  assert.ok(h.includes(p),'HTML '+p);
  assert.ok(sw.includes(p),'offline '+p);
  assert.ok(h.indexOf(p)<h.indexOf('domain/silm/research-optical-candidates-panel.js'));
 }
 assert.match(panel,/SILM\.opticalSourceYAMLAudit/);
 assert.match(panel,/ARQUIVO YAML CONFERIDO/);
 assert.match(panel,/Artigo científico completo ainda NÃO auditado/);
 assert.match(panel,/Lorentz–Drude/);
 assert.match(panel,/REELS/);
 assert.match(panel,/não reconferida registro por registro/);
 assert.ok(!read('domain/silm/material-engine.js').includes('opticalSourceYAMLAudit'));
 assert.ok(!read('domain/silm/optical-observation.js').includes('opticalSourceYAMLAudit'));
});
