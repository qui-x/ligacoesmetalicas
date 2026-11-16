'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('domain/silm/data/science400-reference-stage117.js');
const box={window:{SILM:{}}};box.SILM=box.window.SILM;
vm.runInNewContext(js,box,{filename:'science400-reference-stage117.js'});
const S=box.SILM,catalog=S.science400Reference;
test('lote 80×5 é completo e sem duplicatas',()=>{
 assert.equal(catalog.schema,'silm.science400.reference.v1');
 assert.equal(catalog.slots.length,400);
 assert.equal(new Set(catalog.slots.map(x=>x.symbol)).size,80);
 assert.equal(new Set(catalog.slots.map(x=>x.id)).size,400);
 for(const p of ['electrical','thermal','ductility','malleability','luster'])
  assert.equal(catalog.slots.filter(x=>x.property===p).length,80);
 assert.equal(catalog.forElement(29).length,5);
});
test('auditado: 327 valores finitos, 321 com URL; Pm-null não conta como preenchido',()=>{
 assert.equal(catalog.slots.filter(x=>x.available).length,327);
 assert.equal(catalog.slots.filter(x=>x.displayEligible).length,321);
 assert.equal(catalog.getFor(61,'malleability').available,false);
 assert.equal(catalog.getFor(61,'malleability').displayEligible,false);
 assert.equal(catalog.metadata.audit.alternatives,438);
 assert.deepEqual(Array.from(catalog.slots.filter(x=>x.available&&!x.best.sourceURL).map(x=>x.id)).sort(),
 ['Al-malleability','Cu-malleability','Tc-electrical','Tc-malleability','Th-malleability','W-malleability'].sort());
});
test('nenhum motor recebe parâmetros da matriz condicionada',()=>{
 assert.equal(catalog.calibrationApproved,false);
 assert.equal(catalog.engineRelease,false);
 assert.ok(catalog.slots.every(x=>x.engineCalibrationApproved===false));
 assert.ok(catalog.slots.every(x=>!x.displayEligible || (Number.isFinite(x.best.value)&&x.best.sourceURL.startsWith('https://'))));
 assert.equal(catalog.getFor(92,'luster').status,'PROJECAO_OPTICA_LOCAL_CONDICIONADA');
});
class Element {
 constructor(tag){this.tagName=tag;this._text='';this.children=[];this.dataset={};this.hidden=false;this.className='';this.href='';this.rel='';}
 set textContent(s){this._text=String(s);this.children=[];}
 get textContent(){return this._text+this.children.map(e=>e.textContent).join('');}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
}
box.document={createElement:tag=>new Element(tag)};
S.scienceEvidenceIndex={keys:['electrical','thermal','malleability','ductility','luster'],getFor:()=>[]};
S.properties={catalog:Object.fromEntries(S.scienceEvidenceIndex.keys.map(k=>[k,{title:k}]))};
vm.runInNewContext(read('domain/silm/science-evidence-view.js'),box,{filename:'science-evidence-view.js'});
test('Painel Dados utiliza catálogo na própria doca sem motor e sem valor sem fonte',()=>{
 const panel=S.createUnifiedElementEvidencePanel({mode:'data'});
 panel.update({atomicNumber:29});
 assert.equal(panel.root.hidden,false);
 assert.match(panel.root.textContent,/Pesquisa consolidada/);
 assert.match(panel.root.textContent,/80 metais/);
 const al=S.createUnifiedElementEvidencePanel({mode:'explore'});
 al.update({atomicNumber:13,active:'malleability'});
 assert.equal(al.root.hidden,false);
 assert.match(al.root.textContent,/Não liberado como número rastreável/);
 al.update({atomicNumber:null,active:'malleability'});
 assert.equal(al.root.hidden,true);
});
test('ordem de scripts e cache offline da matriz',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const x='domain/silm/data/science400-reference-stage117.js',idx='domain/silm/science-evidence-index.js';
 assert.ok(html.indexOf(x)>0&&html.indexOf(x)<html.indexOf(idx));
 assert.ok(sw.includes('"'+x+'"'));
});
