import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ctx=vm.createContext({window:{SILM:{}}});ctx.SILM=ctx.window.SILM;
vm.runInContext(read('domain/silm/data/research-optical-candidates-stage65.js'),ctx);
const r=ctx.SILM.opticalResearchCandidates;

test('matriz v17: 59 fichas candidatas de 58 metais, separadas de Tc e Pu-Ga',()=>{
 assert.equal(r.count,59);
 assert.equal(r.metals,58);
 assert.equal(r.records.length,59);
 assert.equal(r.symbols.length,58);
 assert.equal(r.existingPrimaryTcNotDuplicated,true);
 assert.equal(r.fullCNTPApproved,0);
 assert.equal(r.engineRelease,false);
 assert.equal(r.bySymbol.Tc,undefined,'o perfil primário de Tc foi publicado separadamente no PR 136');
 assert.equal(r.bySymbol.Pu,undefined,'Pu-Ga é liga, não fonte do metal puro');
 for(const sym of ['Ac','Pa','Np','Po','Ra'])assert.equal(r.bySymbol[sym],undefined);
 assert.equal(new Set(r.records.map(x=>x.id)).size,59);
 assert.equal(r.bySymbol.Am.length,2,'duas amostras Am com substratos diferentes');
 const classes={};
 for(const row of r.records){
  classes[row.profileKind]=(classes[row.profileKind]||0)+1;
  assert.equal(row.referenceOnly,true);
  assert.equal(row.engineRelease,false);
  assert.equal(row.sourceOriginalChecked,false);
  assert.equal(row.temperatureAtCNTPVerified,false);
  assert.equal(row.pressureAtCNTPVerified,false);
  assert.ok(row.sourceURL.startsWith('https://'));
  assert.ok(row.R>=0&&row.R<=1);
  assert.ok(Object.isFrozen(row));
  assert.equal(row.symbol.length>=1,true);
 }
 assert.deepEqual(classes,{
  'derived-fresnel-from-nk':51,
  'secondary-tabulated-reflectance':1,
  'graph-digitized-estimate':6,
  'interpolated-secondary-table':1
 });
});
test('51 pares n,k produzem exatamente R550 do inventário anterior',()=>{
 const nk=r.records.filter(x=>x.profileKind==='derived-fresnel-from-nk');
 assert.equal(nk.length,51);
 for(const row of nk){
  assert.ok(row.n>=0&&row.k>=0);
  const f=((row.n-1)**2+row.k**2)/((row.n+1)**2+row.k**2);
  assert.ok(Math.abs(f-row.R)<1e-10,row.symbol+' inconsistência de Fresnel');
  assert.equal(row.temperatureAtCNTPVerified,false);
 }
 const li=r.bySymbol.Li[0];
 assert.ok(Math.abs(li.R-0.9289327637566008)<1e-12);
 assert.equal(li.temperatureK,null,'não inferir que o título Mathewson-298K é medição da mesma ficha a 0 C');
 assert.match(li.sourceCondition,/298 K/);
 const cu=r.bySymbol.Cu[0];
 assert.equal(cu.sourceDataset,'Johnson');
 assert.ok(Math.abs(cu.R-0.6235101484078714)<1e-12);
 assert.equal(r.bySymbol.Sc[0].temperatureK,null,'registro v17 declarou condição em texto');
 assert.match(r.bySymbol.Sc[0].sourceCondition,/4\.2 K/);
});
test('6 leituras gráficas, 1 interpolada, 1 secundária sem n,k: não reconstituir dados',()=>{
 const graphs=r.records.filter(x=>x.profileKind==='graph-digitized-estimate');
 assert.equal(graphs.length,6);
 for(const p of graphs){
  assert.equal(p.n,null);assert.equal(p.k,null);
  assert.ok(p.readingLower<=p.R&&p.R<=p.readingUpper);
  assert.match(p.sourceStatus,/digitized_from_graph_approximate/);
 }
 const hf=r.bySymbol.Hf[0];
 assert.equal(hf.profileKind,'interpolated-secondary-table');
 assert.equal(hf.temperatureK,4.2);
 assert.ok(Math.abs(hf.R-0.531255)<1e-10);
 const sn=r.bySymbol.Sn[0];
 assert.equal(sn.profileKind,'secondary-tabulated-reflectance');
 assert.equal(sn.n,null);assert.equal(sn.k,null);
 assert.ok(Math.abs(sn.R-0.8815)<1e-10);
 assert.ok(Math.abs(sn.secondaryDirectionR-0.8195)<1e-10);
 assert.match(sn.warning,/α\/β/);
});
test('integração no painel do Brilho original, sem liberar ótica espectral ou brilho do motor',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const data='domain/silm/data/research-optical-candidates-stage65.js';
 const panel='domain/silm/research-optical-candidates-panel.js';
 for(const file of [data,panel]){
  assert.ok(html.includes(file));assert.ok(sw.includes(file));
  assert.ok(html.indexOf(file)<html.indexOf('domain/silm/property-view.js'));
 }
 assert.ok(html.indexOf(data)<html.indexOf(panel));
 const view=read('domain/silm/property-view.js'),code=read(panel);
 assert.match(view,/SILM\.createOpticalCandidatePanel/);
 assert.match(view,/opticalCandidate\.update/);
 assert.match(code,/REFERÊNCIA CANDIDATA, NÃO HOMOLOGADA/);
 assert.match(code,/NÃO controlam a iluminação, a cor da cena ou a simulação/);
 assert.doesNotMatch(code,/sourceOriginalChecked\s*=\s*true/);
 assert.match(code,/Faixa de leitura \(NÃO incerteza experimental\)/);
 assert.match(code,/não reconferida registro por registro/);
 assert.ok(!read('domain/silm/material-engine.js').includes('opticalResearchCandidates'));
 assert.ok(!read('domain/silm/material-profile-registry.js').includes('opticalResearchCandidates'));
 assert.ok(!read('domain/silm/optical-observation.js').includes('opticalResearchCandidates'));
});
