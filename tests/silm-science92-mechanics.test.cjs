'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
class Element{constructor(tag){this.tagName=tag;this.children=[];this.className='';this.hidden=false;this.dataset={};this._t='';}
 set textContent(t){this._t=String(t);this.children=[];}get textContent(){return this._t+this.children.map(c=>c.textContent).join('');}
 append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x;}
 walk(f){return [...(f(this)?[this]:[]),...this.children.flatMap(x=>x.walk(f))];}}
const box={window:{SILM:{}},document:{createElement:t=>new Element(t)}};box.SILM=box.window.SILM;
const ctx=vm.createContext(box);
for(const p of ['domain/silm/data/research-batch80.js','domain/silm/data/science400-mechanical-stage92.js','domain/silm/data/science400-coverage.js','domain/silm/science-evidence-view.js'])vm.runInContext(read(p),ctx,{filename:p});
const S=ctx.SILM,M=S.scientificMechanicalBatch,C=S.scientific400;
test('In 70% historico; Cr >20 e >40% com limites inferiores e amostras diferentes',()=>{
 assert.equal(M.rows.length,3);
 assert.equal(M.getFor(49,'ductility').length,1);assert.equal(M.getFor(49,'ductility')[0].values[0].value,70);
 const c=M.getFor(24,'ductility');assert.equal(c.length,2);assert.deepEqual(c.map(x=>x.values[0].value).sort((a,b)=>a-b),[20,40]);
 assert.ok(c.every(x=>x.values[0].meaning==='lower-bound-not-point'));
 assert.ok(c.every(x=>x.qualifier.includes('>')&&x.sourceURL.startsWith('https://')));
 assert.ok(M.rows.every(r=>r.referenceOnly&&!r.engineRelease&&!r.calibrationApproved));
});
test('400 campos: ductilidade de In e Cr numerica mas pesquisa condicionada',()=>{
 assert.equal(C.slots.length,400);
 for(const z of [24,49]){const r=C.sourceStatus(z,'ductility');assert.equal(r.hasNumeric,true);assert.equal(r.calibrationApproved,false)}
});
test('painel nao sobrescreve referencias principais; Cr continua como estudo especifico',()=>{
 S.properties={catalog:{ductility:{title:'Ductilidade'}}};
 S.scienceEvidenceIndex={keys:['electrical','thermal','ductility','malleability','luster'],
 getFor:(z,p)=>z===24&&p==='ductility'?[{id:'core',property:p,sourceName:'DADO PRINCIPAL',origin:'main',status:'compiled',
 values:[{value:10,label:'Alongamento',unit:'%'}],temperatureK:293,qualifier:'',sample:'a',sourceURL:'https://example.org'}]:[]};
 const panel=S.createUnifiedElementEvidencePanel({mode:'data'});panel.update({atomicNumber:24});
 assert.ok(panel.root.textContent.includes('DADO PRINCIPAL'));assert.ok(panel.root.textContent.includes('Kanamori'));
 assert.ok(panel.root.textContent.includes('Yoshida'));assert.equal(panel.root.hidden,false);
 assert.ok(panel.root.walk(x=>x.className==='silm-unified-evidence-record').every(x=>x.dataset.engineRelease==='false'));
 panel.update({atomicNumber:49});assert.ok(panel.root.textContent.includes('Fullman'));
});
test('offline publica novo modulo antes da consulta',()=>{
 const h=read('index.html'),sw=read('sw.js'),p='domain/silm/data/science400-mechanical-stage92.js';
 assert.ok(h.indexOf(p)>0&&h.indexOf(p)<h.indexOf('domain/silm/data/science400-coverage.js'));
 assert.ok(sw.includes('"'+p+'"'));assert.ok(sw.includes('stage92-mechanical-in-cr-20261115-r1'));
});
