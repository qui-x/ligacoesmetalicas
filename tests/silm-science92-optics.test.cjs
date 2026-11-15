'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const box={window:{SILM:{}}};box.SILM=box.window.SILM;
class E{constructor(tag){this.tagName=tag;this._text='';this.children=[];this.hidden=false;this.className='';this.dataset={};}
 set textContent(s){this._text=String(s);this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 append(...xs){this.children.push(...xs)} replaceChildren(...xs){this.children=xs;}
 walk(f){return [...(f(this)?[this]:[]),...this.children.flatMap(x=>x.walk(f))];}}
box.document={createElement:tag=>new E(tag)};
const vmctx=vm.createContext(box);
for(const file of [
 'domain/silm/data/research-batch80.js',
 'domain/silm/data/science400-optical-stage92.js',
 'domain/silm/data/science400-coverage.js',
 'domain/silm/science-evidence-view.js'
])vm.runInContext(read(file),vmctx,{filename:file});
const S=vmctx.SILM,R=S.scientificOpticalBatch,C=S.scientific400;
test('tres perfis opticos originais, mas so dois novos metais cobertos',()=>{
 assert.equal(R.rows.length,3);
 assert.equal(new Set(R.rows.map(x=>x.atomicNumber)).size,2);
 assert.equal(C.slots.length,400);
 for(const r of R.rows){
  assert.equal(r.property,'luster');assert.equal(r.wavelengthNm,550);assert.equal(r.status,'candidate');
  assert.equal(r.engineRelease,false);assert.equal(r.calibrationApproved,false);
  const [RR,n,k]=r.values.map(v=>v.value);
  assert.ok(Math.abs(RR-((n-1)**2+k*k)/((n+1)**2+k*k))<1e-12);
  assert.ok(RR>0&&RR<1);
 }
});
test('In: duas publicacoes e temperaturas separadas, sem media artificial',()=>{
 const arr=R.getFor(49,'luster');assert.equal(arr.length,2);
 const first=arr.find(x=>x.temperatureK===295),second=arr.find(x=>x.temperatureK===298);
 assert.ok(Math.abs(first.values[0].value-0.8879103282626101)<1e-9);
 assert.ok(Math.abs(second.values[0].value-0.8531395090262872)<1e-9);
 assert.ok(!first.interpolatedNK);assert.ok(second.interpolatedNK);
 assert.ok(C.sourceStatus(49,'luster').hasNumeric);
});
test('Hg: R550 somente do LIQUIDO, rede metalica solida permanece bloqueada',()=>{
 const hg=R.getFor(80,'luster')[0];
 assert.equal(hg.phase,'liquid');assert.equal(hg.temperatureK,null);assert.equal(hg.interpolatedNK,true);
 assert.ok(Math.abs(hg.values[0].value-0.7793985731557317)<1e-9);
 assert.equal(S.batch80Research.structureAvailable(80),false);
 assert.ok(C.sourceStatus(80,'luster').hasNumeric);
});
test('explorar e Dados recuperam documentos, mas nao alimentam motores',()=>{
 S.properties={catalog:{luster:{title:'Brilho'}}};
 S.scienceEvidenceIndex={keys:['electrical','thermal','ductility','malleability','luster'],getFor:()=>[]};
 for(const [z,expected]of [[49,'Golovashkin'],[80,'Inagaki']]){
  const view=S.createUnifiedElementEvidencePanel({mode:'explore'});
  view.update({atomicNumber:z,active:'luster'});
  assert.equal(view.root.hidden,false);
  assert.ok(view.root.textContent.includes(expected));
  assert.ok(view.root.walk(x=>x.className==='silm-unified-evidence-record').every(x=>x.dataset.engineRelease==='false'));
 }
});
test('ordem de scripts e cache atualizados para funcionamento offline',()=>{
 const html=read('index.html'),sw=read('sw.js'),file='domain/silm/data/science400-optical-stage92.js';
 assert.ok(html.indexOf(file)>0&&html.indexOf(file)<html.indexOf('domain/silm/data/science400-coverage.js'));
 assert.ok(sw.includes('"'+file+'"'));
 assert.ok(sw.includes('stage92-optical-in-hg-20261115-r1'));
});
