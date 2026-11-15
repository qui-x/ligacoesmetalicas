'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const box={window:{SILM:{}}};box.SILM=box.window.SILM;class E{constructor(t){this.tagName=t;this._text='';this.children=[];this.hidden=false;this.className='';this.dataset={};}
set textContent(t){this._text=String(t);this.children=[];}get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}
walk(f){return [...(f(this)?[this]:[]),...this.children.flatMap(x=>x.walk(f))];}}
box.document={createElement:t=>new E(t)};
const c=vm.createContext(box);for(const p of [
 'domain/silm/data/research-batch80.js',
 'domain/silm/data/science400-compression-stage92.js',
 'domain/silm/data/science400-coverage.js',
 'domain/silm/science-evidence-view.js'])vm.runInContext(read(p),c,{filename:p});
const S=c.SILM,B=S.scientificCompressionBatch,C=S.scientific400;
test('seis observacoes de Savitskii (1963) preservadas com os valores e identidades corretas',()=>{
 assert.equal(B.rows.length,6);
 const expected={Sc:26,Sm:14,Tb:16,Dy:20,Ho:20,Tm:26};
 for(const r of B.rows){assert.equal(r.values[0].value,expected[r.symbol]);
  assert.equal(r.property,'malleability');assert.equal(r.status,'experimental-conditional');
  assert.equal(r.values[0].meaning,'reported-historical-compression-plasticity-NOT-verified-failure-strain');
  assert.equal(r.engineRelease,false);assert.equal(r.calibrationApproved,false);
  assert.ok(r.sourceURL.endsWith('.pdf'));assert.equal(r.temperatureK,null);
  assert.ok(C.sourceStatus(r.atomicNumber,'malleability').hasNumeric);
 }
});
test('nao reclassifica deformacao reportada como ruptura ou parametros de motor',()=>{
 assert.equal(C.motorApprovedSlots,0);assert.equal(C.slots.length,400);
 assert.ok(B.rows.every(r=>r.qualifier.includes('NAO calibrar motores')&&r.qualifier.includes('Definicao do ponto final')));
});
test('fontes historicas aparecem no painel sem substituir as fichas originais',()=>{
 S.properties={catalog:{malleability:{title:'Maleabilidade'}}};
 S.scienceEvidenceIndex={keys:['electrical','thermal','ductility','malleability','luster'],
  getFor:(z,p)=>z===21&&p==='malleability'?[{id:'original',property:p,origin:'core',status:'compiled',
   sourceName:'FONTE EXISTENTE',sourceURL:'https://example.org',sample:'original',
   temperatureK:300,qualifier:'',values:[{label:'valor',value:10,unit:'%'}]}]:[]};
 const panel=S.createUnifiedElementEvidencePanel({mode:'data'});panel.update({atomicNumber:21});
 assert.equal(panel.root.hidden,false);assert.ok(panel.root.textContent.includes('FONTE EXISTENTE'));
 assert.ok(panel.root.textContent.includes('Savitskii'));assert.ok(panel.root.textContent.includes('Definicao do ponto final'));
});
test('script e cache offline mantem ordem de carregamento',()=>{
 const html=read('index.html'),sw=read('sw.js'),f='domain/silm/data/science400-compression-stage92.js';
 assert.ok(html.indexOf(f)>0&&html.indexOf(f)<html.indexOf('domain/silm/data/science400-coverage.js'));
 assert.ok(sw.includes('"'+f+'"'));assert.ok(sw.includes('stage92-six-historical-compression-20261115-r1'));
});
