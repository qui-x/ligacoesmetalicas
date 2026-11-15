'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=x=>fs.readFileSync(path.join(root,x),'utf8');
const sources=[
 'domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/properties.js',
 'domain/silm/data/research-evidence-multistage.js','domain/silm/data/research-evidence-stage65.js',
 'domain/silm/data/research-evidence-fe-nist.js','domain/silm/data/research-compression-stage73.js',
 'domain/silm/data/research-electrical-icepoint.js','domain/silm/data/research-electrical-intrinsic-pgm.js',
 'domain/silm/data/research-thermal-nist-295k.js',
 'domain/silm/data/research-optical-candidates-stage65.js',
 'domain/silm/data/research-seven-condition-profiles.js','domain/silm/science-evidence-index.js'
];
class Element{
 constructor(tag){this.tagName=tag;this._text='';this.children=[];this.dataset={};this.hidden=false;this.className='';this.href='';}
 set textContent(str){this._text=String(str);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 append(...xs){this.children.push(...xs);}
 replaceChildren(...xs){this.children=xs;}
 walk(predicate){return [...(predicate(this)?[this]:[]),...this.children.flatMap(x=>x.walk(predicate))];}
}
const document={createElement:tag=>new Element(tag),createTextNode:text=>{const x=new Element('#text');x.textContent=text;return x}};
const box={window:{SILM:{}},document};box.SILM=box.window.SILM;
const context=vm.createContext(box);
for(const source of sources)vm.runInContext(read(source),context,{filename:source});
vm.runInContext(read('domain/silm/science-evidence-view.js'),context);
const S=context.SILM,D=S.scienceEvidenceIndex;
test('nove catálogos de pesquisa unidos sem perder estudos e sem criar propriedades universais',()=>{
 assert.equal(D.schema,'silm.science.evidence-index.v1');
 assert.equal(D.sourceCatalogCount,10);
 assert.equal(D.elementCount,73);
 assert.equal(D.rows.length,332);
 assert.equal(D.rows.filter(x=>x.origin!=='stage81-matrix92').length,315,'Etapa80 preserva 315 fichas originais');
 assert.equal(new Set(D.rows.map(x=>x.id)).size,D.rows.length);
 assert.deepEqual(Array.from(D.keys),['electrical','thermal','malleability','ductility','luster']);
 assert.ok(D.rows.every(x=>x.referenceOnly===true&&x.engineRelease===false&&x.calibrationApproved===false));
 assert.ok(D.rows.every(x=>x.sourceURL?.startsWith('https://')&&x.values.length>0));
 assert.ok(D.rows.every(x=>x.values.every(v=>Number.isFinite(v.value))));
});
test('Fe NIST em Dados possui 12 amostras/taxas, sem declarar CNTP e sem homogeneizar amostras',()=>{
 const iron=D.getFor(26,'ductility').filter(x=>x.origin==='fe-nist-tn1879');
 assert.equal(iron.length,12);
 assert.ok(iron.every(x=>x.status==='experimental-conditional'));
 assert.ok(iron.every(x=>x.temperatureK===null&&x.temperatureText.includes('21')));
 assert.equal(new Set(iron.map(x=>x.sample)).size,12);
});
test('catálogo térmico institucional de 295 K aparece nos seis metais; Cu e Al preservados',()=>{
 for(const [z,value] of [[13,235],[48,97],[29,400],[79,317],[49,87],[82,35]]){
  const rows=D.getFor(z,'thermal').filter(x=>x.origin==='nist-thermal295');
  assert.equal(rows.length,1);
  assert.equal(rows[0].temperatureK,295);
  assert.equal(rows[0].values[0].value,value);
  assert.equal(rows[0].status,'compiled');
 }
});
test('total vs intrínseca e condutividade derivada nunca se confundem',()=>{
 for(const z of [44,45,76,77]){
  const p=D.getFor(z,'electrical').find(x=>x.origin==='pgm-intrinsic');
  assert.ok(p,'PGM não indexado: Z='+z);
  assert.equal(p.values[0].code,'rhoIntrinsic');
  assert.match(p.qualifier,/N[aã]o aplicar σ=1\/ρ/i);
  assert.ok(!p.values.some(x=>x.code==='sigmaDerived'));
 }
 const copper=D.getFor(29,'electrical').find(x=>x.origin==='electrical-icepoint');
 assert.ok(copper);
 assert.equal(copper.values[0].code,'rhoTotal');
 assert.equal(copper.values[1].code,'sigmaDerived');
 assert.equal(copper.values[0].unit,'µΩ·cm');
});
test('estudos de tração e compressão separados; deformação aplicada não é falha',()=>{
 const ti=D.getFor(22,'malleability').find(x=>x.origin==='compression-stage73');
 assert.ok(ti);assert.equal(ti.values[0].meaning,'reported-applied-strain-not-failure-limit');
 const th=D.getFor(90,'ductility');
 assert.ok(th.some(x=>x.status==='pending'));
 assert.ok(D.getFor(90,'ductility',{includePending:false}).every(x=>x.status!=='pending'));
 const er=D.getFor(68,'malleability').find(x=>x.origin==='seven-stage78');
 assert.equal(er.values[0].meaning,'processing-not-intrinsic-limit');
});
test('órfãos informacionais ficam explicitamente sem dado, nunca com valores inventados',()=>{
 for(const z of [1,2,10,118]){
  const total=D.keys.reduce((sum,p)=>sum+D.getFor(z,p).length,0);
  assert.equal(total,0);
 }
});
test('interface da fonte compartilhada mostra elementos além dos 7 iniciais',()=>{
 const panel=S.createUnifiedElementEvidencePanel({mode:'data'});
 for(const z of [26,29,13,44,22]){
  panel.update({atomicNumber:z});
  assert.equal(panel.root.hidden,false,'Painel sem referência para '+z);
  assert.ok(panel.root.walk(e=>e.className==='silm-unified-evidence-record').length>=1);
  assert.ok(panel.root.textContent.includes('fontes')||panel.root.textContent.includes('fichas'));
 }
 panel.update({atomicNumber:1});assert.equal(panel.root.hidden,true);
 const exp=S.createUnifiedElementEvidencePanel({mode:'explore'});
 exp.update({atomicNumber:29,active:'thermal'});
 assert.equal(exp.root.hidden,false);
 assert.equal(exp.root.walk(e=>e.className==='silm-unified-evidence-group').length,1);
 exp.update({atomicNumber:26,active:'luster'});
 assert.equal(exp.root.hidden,false);
 exp.update({atomicNumber:null,active:'thermal'});assert.equal(exp.root.hidden,true);
});
test('Dados e Explorar usam MESMO índice, scripts ordenados e cache offline',()=>{
 const data=read('integracao/metallic-experience.js'),props=read('domain/silm/property-view.js');
 assert.ok(data.includes('S.scienceEvidenceIndex?.getFor'));
 assert.ok(data.includes('S.createUnifiedElementEvidencePanel?.({mode:\'data\'})'));
 assert.ok(props.includes('SILM.createUnifiedElementEvidencePanel?.({mode:\'explore\'})'));
 assert.ok(props.includes('unifiedEvidence.update'));
 const html=read('index.html'),sw=read('sw.js');
 const idx='domain/silm/science-evidence-index.js',view='domain/silm/science-evidence-view.js';
 assert.ok(html.indexOf(idx)>0&&html.indexOf(idx)<html.indexOf(view));
 assert.ok(html.indexOf(view)<html.indexOf('domain/silm/property-view.js'));
 assert.ok(html.indexOf(view)<html.indexOf('integracao/metallic-experience.js'));
 assert.ok(sw.includes('"'+idx+'"')&&sw.includes('"'+view+'"'));
});
