'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
class Node{constructor(tag){this.tagName=tag;this.className='';this.hidden=false;this.dataset={};this._txt='';this.children=[];}
 set textContent(x){this._txt=String(x);this.children=[];}get textContent(){return this._txt+this.children.map(e=>e.textContent).join('');}
 append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}
 walk(pred){return [...(pred(this)?[this]:[]),...this.children.flatMap(e=>e.walk(pred))];}}
const box={window:{SILM:{}},document:{createElement:t=>new Node(t)}};box.SILM=box.window.SILM;
const ctx=vm.createContext(box);
for(const file of ['domain/silm/data/research-batch80.js','domain/silm/data/science400-mechanical-stage96.js',
 'domain/silm/data/science400-coverage.js','domain/silm/science-evidence-view.js'])
 vm.runInContext(read(file),ctx,{filename:file});
const S=ctx.SILM,M=S.scientificMechanicalStage96,C=S.scientific400;
test('5 metais documentados, sem nenhum motor liberado, 400 slots preservados',()=>{
 assert.equal(M.rows.length,5);assert.equal(C.slots.length,400);assert.equal(C.motorApprovedSlots,0);
 assert.deepEqual(Array.from(M.rows.map(x=>x.symbol)).sort(),['Bi','Cd','Mn','Pd','Ru']);
 assert.ok(M.rows.every(r=>r.referenceOnly&&r.engineRelease===false&&r.calibrationApproved===false));
 for(const r of M.rows){const s=C.sourceStatus(r.atomicNumber,'malleability');assert.equal(s.hasNumeric,true);assert.equal(s.calibrationApproved,false)}
});
test('Mn intervalos e micropilar, Cd janela de estudo, Pd laminacao, Bi ponto de curva',()=>{
 const vals=[[25,4,'GPa'],[48,0.6,'adimensional'],[46,0.65,'adimensional'],[83,0.05,'adimensional']];
 for(const [z,v,unit] of vals){const r=M.getFor(z,'malleability')[0];assert.equal(r.values[0].value,v);assert.equal(r.values[0].unit,unit);}
 assert.ok(M.getFor(25,'malleability')[0].qualifier.includes('4–6 GPa'));
 assert.ok(M.getFor(48,'malleability')[0].qualifier.includes('0,1 a 0,6'));
 assert.ok(M.getFor(46,'malleability')[0].qualifier.includes('laminação'));
 assert.ok(M.getFor(83,'malleability')[0].qualifier.includes('NÃO deformação de ruptura'));
});
test('Ru cita apenas fonte secundaria ainda pendente: nao homologado',()=>{
 const ru=M.getFor(44,'malleability')[0];
 assert.equal(ru.values[0].value,0.8);
 assert.equal(ru.status,'pending');
 assert.equal(ru.sourceStatus,'SECONDARY_ORIGINAL_REVIEW_PENDING');
 assert.ok(ru.qualifier.includes('CITA'));
 assert.equal(C.sourceStatus(44,'malleability').calibrationApproved,false);
 assert.equal(M.getFor(31,'malleability').length,0,'Ga sem numero permanece lacuna');
 assert.equal(M.getFor(45,'malleability').length,0,'Rh modulos de flambagem nao contam como plasticidade');
});
test('Painel de Dados documenta fonte pendente sem substituir evidencia original',()=>{
 S.properties={catalog:{malleability:{title:'Maleabilidade'}}};
 S.scienceEvidenceIndex={keys:['electrical','thermal','malleability','ductility','luster'],
  getFor:(z,p)=>z===46&&p==='malleability'?[{id:'core-pd',sourceName:'FONTE ORIGINAL',property:p,
   status:'compiled',origin:'core',sample:'amostra a',temperatureK:298,
   values:[{label:'deformacao',value:0.1,unit:'adimensional'}]}]:[]};
 const panel=S.createUnifiedElementEvidencePanel({mode:'data'});
 for(const [z,name] of [[25,'Kishida'],[48,'Sarkar'],[46,'Markmann'],[83,'Motlagh'],[44,'Snow']]){
  panel.update({atomicNumber:z});
  assert.equal(panel.root.hidden,false,'sem painel '+z);
  assert.ok(panel.root.textContent.includes(name),'sem referencia '+z);
  assert.ok(panel.root.walk(x=>x.className==='silm-unified-evidence-record').every(x=>x.dataset.engineRelease==='false'));
 }
 panel.update({atomicNumber:46});
 assert.ok(panel.root.textContent.includes('FONTE ORIGINAL'));
 panel.update({atomicNumber:44});
 assert.ok(panel.root.textContent.includes('pendente')||panel.root.textContent.includes('PENDENTE'));
});
test('Scripts e service worker registram modulo offline',()=>{
 const html=read('index.html'),sw=read('sw.js'),f='domain/silm/data/science400-mechanical-stage96.js';
 assert.ok(html.indexOf(f)>0&&html.indexOf(f)<html.indexOf('domain/silm/data/science400-coverage.js'));
 assert.ok(sw.includes('"'+f+'"'));
 assert.ok(sw.includes('stage96-five-conditional-20261115-r1'));
});
