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
  assert.deepEqual(Array.from(sym(s),x=>x.property),categories);
 }
});
test('CNTP deixa de ser porta de consulta; amostra e temperatura continuam reportadas',()=>{
 assert.equal(data.referenceConditionsRequired,false);
 assert.equal(get('Co','electrical').temperatureK,273.15);
 assert.equal(get('Er','luster').temperatureK,4.2);
 assert.equal(get('Hf','electrical').temperatureK,295);
 assert.equal(get('Th','electrical').temperatureK,273);
 for(const row of data.records){
  assert.equal(row.pressurePa,null);
  assert.equal(row.engineRelease,false);
  assert.equal(row.calibrationApproved,false);
  assert.equal(row.canDisplayReference,true);
  assert.ok(row.temperatureText.length>4&&row.sample.length>8);
  assert.ok(['triagem-sem-homologação','transcrição-pendente','processamento-não-maleabilidade','referência-condicionada','recomendação-avaliada-fonte-institucional','recomendação-impurezas-documentadas','recomendação-provisória','cálculo-derivado-de-ajuste','medição-amostra-com-óxido','medição-amostra-histórica'].includes(row.evidencePolicy));
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
test('11 triagens antigas substituídas por fontes rastreadas SEM liberar motores',()=>{
 const original=['Co:thermal','Hf:electrical','Hf:thermal','Ta:electrical',
 'Ta:thermal','Tc:electrical','Tc:thermal','Th:electrical','Th:thermal',
 'Zr:electrical','Zr:thermal'];
 for(const key of original){
  const [symbol,property]=key.split(':'),row=get(symbol,property);
  assert.ok(row.sourceURL?.startsWith('https://'),key+' sem fonte');
  assert.notEqual(row.grade,'screening-untraced',key+' continua em triagem');
  assert.equal(row.sourceTracked,true);assert.equal(row.engineRelease,false);
 }
 assert.equal(data.records.filter(r=>r.grade==='screening-untraced').length,0);
 const thermals=symbols.filter(s=>s!=='Er').map(s=>get(s,'thermal'));
 assert.deepEqual(thermals.map(r=>r.value),[100,23,57.5,50.7,54,22.7]);
 assert.ok(thermals.every(r=>r.temperatureK===300));
 assert.equal(get('Hf','thermal').grade,'recommended-impure');
 assert.equal(get('Th','thermal').grade,'provisional-evaluated');
 assert.equal(get('Ta','electrical').value,1.4e-7);
 assert.equal(get('Tc','electrical').grade,'fit-derived');
 assert.equal(get('Tc','electrical').temperatureK,298.15);
 assert.ok(Math.abs(get('Tc','electrical').value-1.78e-7)<1e-10);
 assert.equal(get('Th','electrical').grade,'historical-impure');
 assert.equal(get('Zr','electrical').value,4.8e-7);
});
test('recomendação térmica e ajuste elétrico não viram medida individual',()=>{
 for(const row of data.records.filter(x=>['recommended-evaluated','recommended-impure',
 'provisional-evaluated','fit-derived'].includes(x.grade))){
  assert.equal(row.observationIsMeasured,false,'compilação/cálculo não é ponto medido individualmente no catálogo');
  assert.equal(row.calibrationApproved,false);
  assert.ok(row.sample.length>=20);
 }
 for(const grade of ['historical-impure','historical-specimen']){
  const r=data.records.find(x=>x.grade===grade);
  assert.ok(r?.observationIsMeasured,'medição histórica deve permanecer classificada como medida');
  assert.equal(r.engineRelease,false,'medida específica não habilita motor universal');
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
