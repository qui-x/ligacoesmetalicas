'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
class Element{constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.hidden=false;this.className='';this._text='';}
 set textContent(x){this._text=String(x);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 append(...xs){this.children.push(...xs);}
 replaceChildren(...xs){this.children=xs;}
 walk(f){return [...(f(this)?[this]:[]),...this.children.flatMap(x=>x.walk(f))];}}
const document={createElement:t=>new Element(t)};
const box={window:{SILM:{}},document};box.SILM=box.window.SILM;const ctx=vm.createContext(box);
for(const p of ['domain/silm/data/research-batch80.js','domain/silm/data/science400-coverage.js','domain/silm/science-evidence-view.js'])vm.runInContext(read(p),ctx,{filename:p});
const S=ctx.SILM,C=S.scientific400;
test('catalogo tem 400 slots de investigação, nao 400 homologacoes',()=>{
 assert.equal(C.schema,'silm.400-investigation-slots.v1');
 assert.equal(C.slots.length,400);
 assert.equal(new Set(C.slots.map(x=>x.symbol+'-'+x.property)).size,400);
 assert.equal(C.slots.filter(x=>x.structurallyAvailable).length,395);
 assert.equal(C.motorApprovedSlots,0);
 assert.ok(C.slots.every(x=>x.calibrationApproved===false&&x.status.calibrationApproved===false));
});
test('AIEA 2008: 31 linhas de solidos + 2 referencias de Hg LIQUIDO',()=>{
 assert.equal(C.rows.length,33);
 const Hf=C.getIAEA(72,'thermal')[0];
 assert.equal(Hf.values[0].value,23);
 assert.equal(Hf.temperatureK,300);
 assert.equal(Hf.phase,'solid');
 const Nb=C.getIAEA(41,'thermal')[0];
 assert.equal(Nb.temperatureK,400);
 assert.equal(Nb.values[0].value,51.7);
 const HgThermal=C.getIAEA(80,'thermal')[0],HgElectric=C.getIAEA(80,'electrical')[0];
 assert.equal(HgThermal.temperatureK,293);
 assert.equal(HgThermal.values[0].value,8.45);
 assert.equal(HgElectric.values[0].value,95.83e-8);
 assert.equal(HgElectric.phase,'liquid');
 assert.equal(S.batch80Research.structureAvailable(80),false);
 assert.ok(C.rows.every(x=>x.referenceOnly&&!x.engineRelease&&!x.calibrationApproved));
});
test('painel existente mostra fontes AIEA, preserva precedencia do catalogo original',()=>{
 S.properties={catalog:{thermal:{title:'Térmica'},electrical:{title:'Elétrica'}}};
 S.scienceEvidenceIndex={keys:['electrical','thermal','ductility','malleability','luster'],
  getFor:(z,p)=>z===72&&p==='thermal'?[{id:'core-hf',property:p,origin:'main',status:'compiled',sourceName:'PRINCIPAL-MAIN',
  values:[{value:24,unit:'W/(m·K)',label:'k'}],sample:'material do core',temperatureK:300,sourceURL:'https://example.org',qualifier:''}]:[]};
 const v=S.createUnifiedElementEvidencePanel({mode:'data'});
 v.update({atomicNumber:80});
 assert.equal(v.root.hidden,false);
 assert.ok(v.root.textContent.includes('IAEA'));
 assert.ok(v.root.textContent.includes('Hg líquido'));
 assert.ok(v.root.textContent.includes('categorias'));
 v.update({atomicNumber:72});
 assert.ok(v.root.textContent.includes('PRINCIPAL-MAIN'));
 assert.ok(!v.root.textContent.includes('23 W/(m·K)'), 'IAEA nao deve substituir o core');
 assert.ok(v.root.walk(x=>x.className==='silm-unified-evidence-record').every(x=>x.dataset.engineRelease==='false'));
});
test('scripts antes das views e cache offline inclui fonte IAEA',()=>{
 const html=read('index.html'),sw=read('sw.js'),index='domain/silm/data/science400-coverage.js';
 assert.ok(html.indexOf(index)>0&&html.indexOf(index)<html.indexOf('domain/silm/science-evidence-view.js'));
 assert.ok(sw.includes('"'+index+'"'));
 assert.ok(sw.includes('silm400-aiea-20261115-r1'));
});
