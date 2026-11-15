'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
class E{constructor(t){this.tagName=t;this.className='';this.hidden=false;this.dataset={};this._t='';this.children=[];}
 set textContent(t){this._t=String(t);this.children=[];}
 get textContent(){return this._t+this.children.map(x=>x.textContent).join('');}
 append(...xs){this.children.push(...xs);}replaceChildren(...xs){this.children=xs;}
 walk(f){return [...(f(this)?[this]:[]),...this.children.flatMap(x=>x.walk(f))];}}
const box={window:{SILM:{}},document:{createElement:tag=>new E(tag)}};box.SILM=box.window.SILM;
const ctx=vm.createContext(box);
const scripts=['domain/silm/data/research-batch80.js',
'domain/silm/data/science400-mechanical-stage93.js',
'domain/silm/data/science400-coverage.js',
'domain/silm/science-evidence-view.js'];
for(const f of scripts)vm.runInContext(read(f),ctx,{filename:f});
const S=ctx.SILM,M=S.scientificMechanicalStage93,C=S.scientific400;
test('11 registros em sete metais e cinco novos campos condicionados',()=>{
 assert.equal(M.rows.length,11);
 assert.equal(C.slots.length,400);
 assert.equal(M.newNumericSlots.length,5);
 assert.deepEqual(Array.from(new Set(M.rows.map(r=>r.symbol))).sort(),['Ga','In','Nb','Pb','Sn','Ti','Y']);
 for(const [z,p] of [[31,'ductility'],[41,'malleability'],[22,'malleability'],[82,'malleability'],[50,'malleability']]){
  assert.ok(M.getFor(z,p).length);
  assert.equal(C.sourceStatus(z,p).hasNumeric,true);
 }
 assert.ok(M.rows.every(r=>r.referenceOnly===true&&r.engineRelease===false&&r.calibrationApproved===false));
 assert.equal(C.motorApprovedSlots,0);
});
test('Ga tres amostras; solidificacao nao e temperatura de ensaio; nunca media universal',()=>{
 const rs=M.getFor(31,'ductility');
 assert.equal(rs.length,3);
 assert.deepEqual(rs.map(r=>r.values[0].value),[55,80,110]);
 assert.ok(rs.every(r=>r.temperatureK===null&&r.temperatureText.includes('SOLIDIFICAÇÃO')));
 assert.equal(rs.find(r=>r.values[0].value===110).values[0].meaning,'maximum-reported-not-typical');
});
test('deformacao aplicada nao e ruptura; taxas, purezas e unidades separadas',()=>{
 for(const z of [50,82]){
  const r=M.getFor(z,'malleability');assert.equal(r.length,2);
  assert.ok(r.every(x=>x.values[0].value===0.69&&x.values[0].unit==='adimensional'));
  assert.equal(new Set(r.map(x=>x.sample)).size,2);
  assert.ok(r.every(x=>x.values[0].meaning.includes('NOT-failure-strain')));
 }
 assert.equal(M.getFor(41,'malleability')[0].values[0].value,0.9);
 const ti=M.getFor(22,'malleability')[0];
 assert.equal(ti.values[0].value,9);
 assert.equal(ti.values[0].meaning,'processing-prestrain-NOT-failure');
});
test('Y tem fonte tabulada; In faixa de 5 a 15 nao substitui 70',()=>{
 const y=M.getFor(39,'malleability')[0];
 assert.equal(y.values[0].value,17);
 assert.match(y.sourceName,/Savitskii/);
 assert.equal(M.getFor(49,'ductility')[0].values[0].value,5);
 assert.equal(M.getFor(49,'ductility')[0].values[1].value,15);
 assert.equal(M.getFor(49,'ductility')[0].values[1].meaning,'range-maximum-NOT-typical');
});
test('painel existente agrega fontes complementares sem alterar referencia anterior',()=>{
 S.properties={catalog:{ductility:{title:'Ductilidade'},malleability:{title:'Maleabilidade'}}};
 S.scienceEvidenceIndex={keys:['electrical','thermal','malleability','ductility','luster'],
 getFor:(z,p)=>z===49&&p==='ductility'?[{id:'ref1958',property:p,origin:'core',status:'compiled',
  sourceName:'REFERENCIA HISTORICA 70%',sample:'In historico',temperatureK:null,temperatureText:'nao especificada',
  values:[{label:'Alongamento',value:70,unit:'%'}],sourceURL:'https://doi.org/10.1038/182862a0'}]:[]};
 const v=S.createUnifiedElementEvidencePanel({mode:'data'});
 v.update({atomicNumber:49});
 assert.equal(v.root.hidden,false);
 assert.ok(v.root.textContent.includes('REFERENCIA HISTORICA 70%'));
 assert.ok(v.root.textContent.includes('Iliev'));
 assert.ok(v.root.walk(x=>x.className==='silm-unified-evidence-record').every(x=>x.dataset.engineRelease==='false'));
 v.update({atomicNumber:31});
 assert.ok(v.root.textContent.includes('Wang'));
 v.update({atomicNumber:82});
 assert.ok(v.root.textContent.includes('Hotta'));
});
test('script carregado antes do catalogo de cobertura e cache offline coerente',()=>{
 const h=read('index.html'),sw=read('sw.js'),f='domain/silm/data/science400-mechanical-stage93.js';
 assert.ok(h.indexOf(f)>0&&h.indexOf(f)<h.indexOf('domain/silm/data/science400-coverage.js'));
 assert.ok(sw.includes('"'+f+'"'));
 assert.ok(sw.includes('stage93-conditional-five-slots-20261115-r1'));
});
