'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const source=[
 'domain/silm/data/bundle.js','domain/silm/data-api.js',
 'domain/silm/data/research-evidence-multistage.js','domain/silm/data/research-evidence-stage65.js',
 'domain/silm/data/research-evidence-fe-nist.js','domain/silm/data/research-compression-stage73.js',
 'domain/silm/data/research-electrical-icepoint.js','domain/silm/data/research-electrical-intrinsic-pgm.js',
 'domain/silm/data/research-thermal-nist-295k.js',
 'domain/silm/data/research-optical-candidates-stage65.js','domain/silm/data/research-seven-condition-profiles.js',
 'domain/silm/data/research-stage81-matrix92.js','domain/silm/science-evidence-index.js'
];
const scope=vm.createContext({window:{SILM:{}}});scope.SILM=scope.window.SILM;
for(const f of source)vm.runInContext(read(f),scope,{filename:f});
const S=scope.SILM,A=S.stage81Reconciliation,D=S.scienceEvidenceIndex;
test('universo canônico de 92 metais reconciliado com 79 habilitados e 13 bloqueados',()=>{
 assert.equal(A.universe.length,92);assert.equal(new Set(A.universe).size,92);
 assert.equal(A.audit.length,92);assert.equal(A.notIndexedStage80.length,30);
 assert.equal(A.audit.filter(x=>x.stage72Eligibility==='available').length,79);
 assert.equal(A.audit.filter(x=>x.stage72Eligibility==='blocked').length,13);
 assert.equal(A.audit.filter(x=>x.stage81Status==='already-indexed-stage80').length,62);
 assert.equal(A.audit.filter(x=>x.stage81Status==='new-sourced-reference').length,2);
 assert.equal(A.audit.filter(x=>x.stage81Status==='estimates-only').length,15);
 assert.equal(A.audit.filter(x=>x.stage81Status==='blocked-structural').length,13);
 assert.equal(A.getAudit('Hg').blockedFromStructuralUse,true);
 assert.equal(A.getAudit('Rf').stage81Status,'estimates-only');
});
test('índice publicado anterior preservado: 315 + 23 registros e 79 elementos distintos',()=>{
 assert.equal(D.rows.length,338);
 assert.equal(D.rows.filter(x=>x.origin!=='stage81-matrix92').length,315);
 assert.equal(D.rows.filter(x=>x.origin==='stage81-matrix92').length,23);
 assert.equal(D.elementCount,79);assert.equal(D.sourceCatalogCount,10);
 assert.equal(A.records.length,23);
 assert.equal(A.records.filter(x=>x.evidenceIsModelEstimate).length,15);
 assert.equal(A.records.filter(x=>x.status==='candidate').length,17);
 assert.ok(A.records.every(x=>x.sourceURL?.startsWith('https://')));
 assert.ok(D.rows.every(x=>x.engineRelease===false&&x.calibrationApproved===false));
 assert.ok(D.rows.every(x=>x.values.every(v=>Number.isFinite(v.value))));
});
test('cada metal habilitado tem ao menos referência condicionada; bloqueados não são habilitados',()=>{
 for(const v of A.audit){
  const z=S.data.search(v.symbol).find(x=>x.symbol===v.symbol)?.atomicNumber;
  assert.ok(Number.isInteger(z),v.symbol);
  const amount=D.keys.reduce((n,p)=>n+D.getFor(z,p).length,0);
  if(v.stage72Eligibility==='blocked')assert.equal(amount,0,v.symbol+' bloqueado com dado');
  else assert.ok(amount>=1,v.symbol+' sem referência');
 }
});
test('Ga mostra eixo a de 41 W/(m K) e 17,4 µΩ cm de ficha, sem isotropia presumida',()=>{
 const thermal=D.getFor(31,'thermal').find(x=>x.origin==='stage81-matrix92');
 const el=D.getFor(31,'electrical').find(x=>x.origin==='stage81-matrix92');
 assert.equal(thermal.values[0].value,41);assert.equal(thermal.temperatureK,273.2);
 assert.match(thermal.qualifier,/eixo a/);
 assert.match(thermal.qualifier,/NÃO/);
 assert.equal(thermal.status,'evaluated');
 assert.equal(el.temperatureK,293.15);
 assert.equal(el.status,'candidate');
 assert.equal(el.values[0].value,17.4);
 assert.ok(Math.abs(el.values[1].value-1/(17.4e-8))<1);
 assert.match(el.qualifier,/não medição adicional/i);
});
test('Pm preserva ±2 de BNWL e separa resistividade ESTIMADA sem temperatura inventada',()=>{
 const th=D.getFor(61,'thermal').find(x=>x.origin==='stage81-matrix92');
 const el=D.getFor(61,'electrical').find(x=>x.origin==='stage81-matrix92');
 assert.equal(th.values[0].value,18);assert.equal(th.temperatureK,300.15);
 assert.match(th.qualifier,/18 ± 2/);
 assert.equal(th.status,'compiled');
 assert.equal(el.temperatureK,null);assert.equal(el.status,'candidate');
 assert.equal(el.values[0].value,75);assert.equal(el.values.length,1);
 assert.match(el.qualifier,/ESTIMATIVA/);
});
test('In preserva referências antigas e mostra fornecedor a 273,15 e 293,15 K separadamente',()=>{
 const thermal=D.getFor(49,'thermal');
 const electrical=D.getFor(49,'electrical');
 assert.equal(thermal.length,2);assert.equal(electrical.length,2);
 assert.equal(thermal.find(x=>x.origin==='stage81-matrix92').values[0].value,83.7);
 assert.equal(electrical.find(x=>x.origin==='stage81-matrix92').values[0].value,84);
 assert.ok(electrical.find(x=>x.origin==='stage81-matrix92').values[1].meaning.includes('derived'));
 assert.ok(electrical.some(x=>x.temperatureK===273.15));
});
test('U preserva α-U na correlação térmica 293 K; ρ IAEA compilada a 298 K e 0,1 MPa',()=>{
 const t=D.getFor(92,'thermal').find(x=>x.origin==='stage81-matrix92');
 const e=D.getFor(92,'electrical').find(x=>x.origin==='stage81-matrix92');
 assert.equal(t.values[0].value,22.5);assert.equal(t.temperatureK,293);
 assert.match(t.qualifier,/correlaç/);assert.match(t.phase,/α-U/);
 assert.equal(e.temperatureK,298);assert.equal(e.pressurePa,100000);
 assert.equal(e.values[0].value,21.8e-8);
 assert.ok(Math.abs(e.values[1].value-1/(21.8e-8))<1);
 assert.equal(D.getFor(92,'ductility').filter(v=>v.origin==='stage81-matrix92').length,0,'UTS não equivale a ductilidade');
});
test('NBS 1972: Fr 15 (não 14,5), Ra 18,6 a 293,2 K; Np 6,3; Rf 23 hipotético',()=>{
 const cases=[['Fr',87,15,300],['Ra',88,18.6,293.2],['Np',93,6.3,300],
  ['Ac',89,12,300],['Pa',91,47,300],['Po',84,20,300],['Rf',104,23,300]];
 for(const [sym,z,k,T] of cases){
  const x=D.getFor(z,'thermal').find(x=>x.origin==='stage81-matrix92');
  assert.ok(x,sym);assert.equal(x.values[0].value,k,sym);
  assert.equal(x.temperatureK,T);assert.equal(x.evidenceIsModelEstimate,true);
  assert.equal(x.status,'candidate');assert.match(x.qualifier,/não é medição direta|NÃO medição/i);
 }
 assert.match(D.getFor(87,'thermal')[0].qualifier,/14,5/,'correção versus matriz anterior preservada');
});
test('15 estimativas não são tratadas como medições nem ligam motores',()=>{
 const symbols='Fr Cm Bk Cf Es Fm Md No Lr Ac Np Pa Po Ra Rf'.split(' ');
 for(const symbol of symbols){
  const row=A.bySymbol[symbol].find(r=>r.evidenceIsModelEstimate);
  assert.ok(row,symbol);
  assert.equal(row.status,'candidate');
  assert.equal(row.engineRelease,false);
  assert.ok(row.sourceURL.includes('jpcrdreprint/1.3253100.pdf'));
  assert.match(row.qualifier,/ESTIMATIVA|estimada|estimativa|provisório|provisória/i);
 }
 const blocked='Hg Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv'.split(' ');
 for(const symbol of blocked)assert.equal(A.bySymbol[symbol].length,0);
});
test('documentação e interface usam o mesmo índice, sem alterar arquivos do motor',()=>{
 const html=read('index.html'),sw=read('sw.js'),index=read('domain/silm/science-evidence-index.js');
 const stage='domain/silm/data/research-stage81-matrix92.js';
 const ix='domain/silm/science-evidence-index.js';
 assert.ok(html.indexOf(stage)>0&&html.indexOf(stage)<html.indexOf(ix));
 assert.ok(sw.includes('"'+stage+'"')&&sw.includes('stage81-matrix92-reconciled-r1'));
 assert.ok(index.includes('S.stage81Reconciliation?.records'));
 const data=read('integracao/metallic-experience.js'),view=read('domain/silm/science-evidence-view.js');
 assert.match(data,/ESTIMATIVA por analogia; não medido nem homologado/);
 assert.match(view,/ESTIMATIVA HISTÓRICA \/ NÃO medida/);
});
