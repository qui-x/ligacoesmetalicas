'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx=vm.createContext({window:{SILM:{}}});ctx.SILM=ctx.window.SILM;
vm.runInContext(load('domain/silm/data/research-seven-condition-profiles.js'),ctx);
const data=ctx.SILM.sevenConditionResearch;
const symbols=['Co','Er','Hf','Ta','Tc','Th','Zr'];
const categories=['electrical','thermal','malleability','ductility','luster'];
const sym=s=>data.records.filter(x=>x.symbol===s);
const get=(s,k)=>sym(s).find(x=>x.property===k);
test('sete metais, cinco categorias, 35 registros únicos e íntegros',()=>{
 assert.equal(data.records.length,35);
 assert.equal(new Set(data.records.map(x=>x.id)).size,35);
 assert.deepEqual(Object.keys(data.bySymbol).sort(),symbols.slice().sort());
 for(const s of symbols){
  assert.equal(sym(s).length,5,s);
  assert.deepEqual(sym(s).map(x=>x.property),categories);
 }
});
test('CNTP deixa de ser porta de consulta; amostra e temperatura continuam reportadas',()=>{
 assert.equal(data.referenceConditionsRequired,false);
 assert.equal(get('Co','electrical').temperatureK,273.15);
 assert.equal(get('Er','luster').temperatureK,4.2);
 assert.equal(get('Hf','electrical').temperatureK,293);
 assert.equal(get('Th','electrical').temperatureK,273);
 for(const row of data.records){
  assert.equal(row.pressurePa,null);
  assert.equal(row.engineRelease,false);
  assert.equal(row.calibrationApproved,false);
  assert.equal(row.canDisplayReference,true);
  assert.ok(row.temperatureText.length>4&&row.sample.length>8);
  assert.ok(['triagem-sem-homologação','transcrição-pendente','processamento-não-maleabilidade','referência-condicionada'].includes(row.evidencePolicy));
 }
});
test('casos especiais Co / Tc / Er / Zr não são confundidos',()=>{
 assert.equal(get('Co','malleability').value,25);
 assert.match(get('Co','ductility').quantity,/inferior/i);
 assert.match(get('Co','ductility').sample,/>35%/);
 assert.equal(get('Er','malleability').grade,'processing-only');
 assert.equal(get('Tc','ductility').value,30);
 assert.equal(get('Tc','malleability').value,45.6);
 assert.match(get('Tc','ductility').sample,/recozido/i);
 assert.match(get('Zr','ductility').sample,/Zr702/);
 assert.equal(get('Th','ductility').grade,'secondary-pending');
 assert.equal(get('Th','malleability').grade,'secondary-pending');
});
test('triagens não ganham fonte inventada nem homologação física',()=>{
 const lows=data.records.filter(x=>x.grade==='screening-untraced');
 assert.ok(lows.length>=7);
 for(const row of lows){
  assert.equal(row.sourceTracked,false);
  assert.equal(row.sourceURL,null);
  assert.equal(row.observationIsMeasured,false);
 }
 for(const row of data.records.filter(x=>x.grade==='processing-only')){
  assert.equal(row.observationIsMeasured,false);
  assert.equal(row.evidencePolicy,'processamento-não-maleabilidade');
 }
});
test('dados ópticos são de interface ideal e não brilho real',()=>{
 const optical=data.records.filter(x=>x.property==='luster');
 assert.equal(optical.length,7);
 for(const r of optical){
  assert.equal(r.grade,'optical-derived');
  assert.equal(r.unit,'fração');
  assert.ok(r.value>=0&&r.value<=1);
  assert.ok(r.sourceURL?.startsWith('https://'));
  assert.equal(r.observationIsMeasured,false,'R550 derivada não é refletância medida na peça');
 }
});
test('painel integrado à UI nativa e disponível no cache offline',()=>{
 const html=load('index.html'),sw=load('sw.js'),view=load('domain/silm/property-view.js');
 const d='domain/silm/data/research-seven-condition-profiles.js',p='domain/silm/research-seven-conditions-panel.js';
 assert.ok(html.indexOf(d)>=0);
 assert.ok(html.indexOf(d)<html.indexOf(p));
 assert.ok(html.indexOf(p)<html.indexOf('domain/silm/property-view.js'));
 assert.ok(sw.includes('"'+d+'"')&&sw.includes('"'+p+'"'));
 assert.match(view,/SILM\.createSevenConditionPanel/);
 assert.match(view,/sevenEvidence\.update/);
 assert.match(view,/sevenEvidence\.root/);
 const panel=load(p);
 assert.match(panel,/sourceConditions='reported-not-normalized'/);
 assert.match(panel,/engineRelease='false'/);
});
