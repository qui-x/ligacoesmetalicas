'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
class N{constructor(t){this.tagName=t;this.className='';this.dataset={};this.children=[];this.hidden=false;this._txt='';}
 set textContent(t){this._txt=String(t);this.children=[];}get textContent(){return this._txt+this.children.map(x=>x.textContent).join('');}
 append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}
 walk(p){return [...(p(this)?[this]:[]),...this.children.flatMap(x=>x.walk(p))];}}
const box={window:{SILM:{}},document:{createElement:t=>new N(t)}};box.SILM=box.window.SILM;const ctx=vm.createContext(box);
for(const p of ['domain/silm/data/research-batch80.js','domain/silm/data/science400-compression-stage94.js',
 'domain/silm/data/science400-coverage.js','domain/silm/science-evidence-view.js'])vm.runInContext(read(p),ctx,{filename:p});
const S=ctx.SILM,B=S.scientificMechanicalStage94,C=S.scientific400;
test('6 metais, 15 registros, 400 campos somente documentais',()=>{
 assert.equal(B.rows.length,15);assert.equal(B.newNumericSlots.length,6);
 assert.equal(C.slots.length,400);assert.equal(C.motorApprovedSlots,0);
 assert.equal(new Set(B.rows.map(x=>x.symbol)).size,6);
 for(const sym of ['Li','Na','Ca','V','Hf','Pt']){
  assert.ok(B.rows.some(r=>r.symbol===sym&&r.primaryFor400));
 }
 assert.ok(B.rows.every(r=>r.referenceOnly&&!r.engineRelease&&!r.calibrationApproved));
});
test('Na e Ca: deformacao aplicada nao e falha; inconsistencias de taxa permanecem',()=>{
 const na=B.getFor(11,'malleability'),ca=B.getFor(20,'malleability');
 assert.equal(na.length,3);assert.equal(ca.length,4);
 assert.equal(na.find(x=>x.primaryFor400).values[0].value,0.08);
 assert.equal(ca.find(x=>x.primaryFor400).values[0].value,0.30);
 assert.ok(ca[0].qualifier.includes('Conflito interno'));
 assert.ok(ca.slice(1).every(x=>x.qualifier.includes('divergem')));
 assert.ok(ca.every(x=>!x.values.some(v=>v.meaning==='fracture-strain')));
 assert.ok(B.getFor(72,'malleability').some(r=>r.values[0].unit==='MPa'));
});
test('V Pt: deformacoes adimensionais e Hf tensao, modelos diferenciados',()=>{
 const v=B.getFor(23,'malleability'),pt=B.getFor(78,'malleability'),hf=B.getFor(72,'malleability');
 assert.equal(v.find(x=>x.primaryFor400).values[0].value,0.6);
 assert.equal(pt.find(x=>x.primaryFor400).values[0].value,0.9);
 assert.equal(hf.find(x=>x.primaryFor400).values[0].value,500);
 assert.equal(hf.find(x=>x.primaryFor400).values[0].unit,'MPa');
 assert.equal(hf.find(x=>x.values[0].code==='hardness-2800').values[0].unit,'HV');
 assert.equal(v.find(x=>x.values[0].code==='activation-energy').status,'candidate');
 for(const [z,p] of [[3,'malleability'],[11,'malleability'],[20,'malleability'],[23,'malleability'],[72,'malleability'],[78,'malleability']]){
  assert.equal(C.sourceStatus(z,p).hasNumeric,true);
  assert.equal(C.sourceStatus(z,p).calibrationApproved,false);
 }
});
test('Dados e Explorar mostram fontes no painel principal sem acionar motores',()=>{
 S.properties={catalog:{malleability:{title:'Maleabilidade'}}};
 S.scienceEvidenceIndex={keys:['electrical','thermal','malleability','ductility','luster'],
 getFor:(z,p)=>z===20&&p==='malleability'?[{id:'old-ca',origin:'main',property:p,status:'compiled',
  sourceName:'PESQUISA LEGADA',sample:'amostra legada',temperatureK:293,
  values:[{label:'Deformação',value:0.1,unit:'adimensional'}],qualifier:'',sourceURL:'https://example.org'}]:[]};
 const panel=S.createUnifiedElementEvidencePanel({mode:'data'});
 for(const [z,what] of [[3,'Darnbrough'],[11,'Fincher'],[20,'Shin'],[23,'Behera'],[72,'Yu'],[78,'Tang']]){
  panel.update({atomicNumber:z});
  assert.equal(panel.root.hidden,false);
  assert.ok(panel.root.textContent.includes(what),'faltou '+what);
  assert.ok(panel.root.walk(e=>e.className==='silm-unified-evidence-record').every(e=>e.dataset.engineRelease==='false'));
 }
 panel.update({atomicNumber:20});assert.ok(panel.root.textContent.includes('PESQUISA LEGADA'));
});
test('inclusao offline, ordem e renovacao de cache',()=>{
 const html=read('index.html'),sw=read('sw.js'),f='domain/silm/data/science400-compression-stage94.js';
 assert.ok(html.indexOf(f)>0&&html.indexOf(f)<html.indexOf('domain/silm/data/science400-coverage.js'));
 assert.ok(sw.includes('"'+f+'"'));assert.ok(sw.includes('stage94-six-pure-compression-20261115-r1'));
});
