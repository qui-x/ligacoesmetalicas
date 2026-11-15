'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
class NodeMock {
 constructor(tag){this.tagName=tag;this._text='';this.children=[];this.dataset={};this.className='';this.hidden=false;this.href='';}
 set textContent(t){this._text=String(t);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 walk(pred){return [...(pred(this)?[this]:[]),...this.children.flatMap(x=>x.walk(pred))];}
}
const document={createElement:tag=>new NodeMock(tag)};
const box={window:{SILM:{}},document};box.SILM=box.window.SILM;
const ctx=vm.createContext(box);
vm.runInContext(read('domain/silm/data/research-batch80.js'),ctx);
const batch=ctx.SILM.batch80Research;
test('lote documental: 79 estruturas + Hg bloqueado, sem superpesados',()=>{
 assert.equal(batch.schema,'silm.batch80.documentary.v1');
 assert.equal(batch.symbols.length,80);
 assert.equal(batch.symbols.filter(x=>x.structureAvailable).length,79);
 assert.equal(batch.rows.length,206);
 assert.equal(batch.rows.filter(x=>x.property==='thermal').length,78);
 assert.equal(batch.rows.filter(x=>x.property==='electrical').length,69);
 assert.equal(batch.rows.filter(x=>x.property==='luster').length,59);
 assert.equal(batch.structureAvailable(80),false);
 assert.equal(batch.getFor(80,'thermal').length,0);
 assert.ok(!batch.symbols.some(x=>[105,106,107,108,109,110,111,112,113,114,115,116].includes(x.atomicNumber)));
 assert.equal(batch.evidenceIsNotMotorCalibration,true);
});
test('evidencias condicionais nao liberam motores e preservam fontes ausentes',()=>{
 assert.ok(batch.rows.every(r=>r.referenceOnly&&r.engineRelease===false&&r.calibrationApproved===false));
 assert.ok(batch.rows.every(r=>r.values.length&&r.values.every(v=>Number.isFinite(v.value)&&v.unit)));
 assert.ok(batch.rows.every(r=>!r.sourceURL||r.sourceURL.startsWith('https://')));
 assert.equal(batch.rows.filter(r=>r.status==='pending').length,69);
 assert.ok(batch.rows.filter(r=>r.status==='pending').every(r=>!r.sourceURL));
 assert.ok(batch.rows.filter(r=>r.property==='electrical').every(r=>r.values.filter(v=>v.meaning==='derived-not-independent').length<=1));
 assert.equal(batch.getFor(3,'thermal',{includePending:false}).length,0);
 assert.ok(batch.getFor(3,'thermal')[0].qualifier.includes('FONTE INDIVIDUAL PENDENTE'));
 assert.ok(batch.getFor(29,'electrical')[0].values.some(v=>v.code==='sigmaDerived'));
});
vm.runInContext(read('domain/silm/science-evidence-view.js'),ctx);
test('painel Dados/Explorar mostra triagem apenas quando nao existe referencia anterior',()=>{
 const s=ctx.SILM;
 s.properties={catalog:{thermal:{title:'Térmica'},electrical:{title:'Elétrica'},luster:{title:'Brilho'}}};
 s.scienceEvidenceIndex={keys:['electrical','thermal','malleability','ductility','luster'],
 getFor:(z,p)=>z===3&&p==='thermal'?[{id:'original-source',property:'thermal',origin:'original',status:'compiled',
 sourceName:'REFERENCIA PRINCIPAL',sample:'amostra documentada',temperatureK:300,temperatureText:'',
 qualifier:'',values:[{code:'k',value:110,unit:'W/(m·K)',label:'k'}],sourceURL:'https://example.org/primary'}]:[]};
 const panel=s.createUnifiedElementEvidencePanel({mode:'data'});
 panel.update({atomicNumber:3});
 assert.equal(panel.root.hidden,false);
 assert.ok(panel.root.textContent.includes('REFERENCIA PRINCIPAL'));
 assert.ok(!panel.root.textContent.includes('84,8 W/(m·K)'),'nao pode substituir referencia anterior pelo lote');
 assert.ok(panel.root.textContent.includes('Triagem histórica'),'ficha sem fonte deve ser visivel e identificada');
 assert.ok(panel.root.walk(x=>x.className==='silm-unified-evidence-record').every(x=>x.dataset.engineRelease==='false'));
 panel.update({atomicNumber:80});assert.equal(panel.root.hidden,true,'Hg nao recebe dados fisicos inventados');
 const explore=s.createUnifiedElementEvidencePanel({mode:'explore'});
 explore.update({atomicNumber:3,active:'electrical'});
 assert.equal(explore.root.hidden,false);
 assert.ok(explore.root.textContent.includes('Triagem histórica'));
 assert.ok(explore.root.walk(x=>x.className==='silm-unified-evidence-group').every(x=>x.dataset.property==='electrical'));
});
test('cache offline e scripts ordenados antes das vistas de dados',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const batchFile='domain/silm/data/research-batch80.js',view='domain/silm/science-evidence-view.js';
 assert.ok(html.includes(batchFile)&&html.indexOf(batchFile)<html.indexOf(view));
 assert.ok(html.indexOf(view)<html.indexOf('domain/silm/property-view.js'));
 assert.ok(sw.includes('"'+batchFile+'"'));
 assert.ok(sw.includes('batch80-documentary-fallback-r1'));
});
