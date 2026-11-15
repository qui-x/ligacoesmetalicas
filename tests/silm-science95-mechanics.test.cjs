'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
class N{constructor(t){this.tagName=t;this.children=[];this.className='';this.dataset={};this.hidden=false;this._text='';}
 set textContent(s){this._text=String(s);this.children=[];}get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}
 walk(p){return [...(p(this)?[this]:[]),...this.children.flatMap(x=>x.walk(p))];}}
const ctxObj={window:{SILM:{}},document:{createElement:t=>new N(t)}};ctxObj.SILM=ctxObj.window.SILM;
const ctx=vm.createContext(ctxObj);
for(const p of ['domain/silm/data/research-batch80.js','domain/silm/data/science400-mechanical-stage95.js',
'domain/silm/data/science400-coverage.js','domain/silm/science-evidence-view.js'])vm.runInContext(read(p),ctx,{filename:p});
const S=ctx.SILM,R=S.scientificMechanicalStage95,C=S.scientific400;
test('7 novas amostras documentais, 400 campos e nenhum motor calibrado',()=>{
 assert.equal(R.rows.length,7);assert.equal(C.slots.length,400);assert.equal(C.motorApprovedSlots,0);
 assert.deepEqual(Array.from(R.rows.map(x=>x.symbol)).sort(),['Au','Be','In','Ir','Re','U','Zr']);
 assert.ok(R.rows.every(x=>x.referenceOnly===true&&x.engineRelease===false&&x.calibrationApproved===false));
 for(const r of R.rows)assert.equal(C.sourceStatus(r.atomicNumber,'malleability').hasNumeric,true);
});
test('U a 109 GPa nunca equivale a fase de ambiente; Au micropilar diferente de metal massivo',()=>{
 const U=R.getFor(92,'malleability')[0],Au=R.getFor(79,'malleability')[0];
 assert.equal(U.values[0].value,19.8);assert.equal(U.values[0].unit,'GPa');
 assert.ok(U.qualifier.includes('109 GPa')&&U.qualifier.includes('α-U'));
 assert.equal(Au.values[0].value,2);assert.ok(Au.qualifier.includes('micrométrica')||Au.qualifier.includes('submicrométrica'));
 assert.ok(Au.values.some(x=>x.code==='strain_range_upper'));
});
test('Be, Zr, In, Re tem deformacao de estudo, nao deformacao de fratura',()=>{
 for(const [z,val] of [[4,0.92],[40,0.16],[49,0.30],[75,0.28]]){
  const r=R.getFor(z,'malleability')[0];assert.equal(r.values[0].value,val);
  assert.match(r.values[0].meaning,/not-fracture|not-failure|not-rupture/);
  assert.ok(r.values.length>=2);
 }
 assert.equal(R.getFor(77,'malleability')[0].values[0].value,208.6);
 assert.equal(R.getFor(77,'malleability')[0].values[1].value,72.1);
});
test('consulta dentro de Dados preserva o indice cientifico principal',()=>{
 S.properties={catalog:{malleability:{title:'Maleabilidade'}}};
 S.scienceEvidenceIndex={keys:['electrical','thermal','malleability','ductility','luster'],
 getFor:(z,p)=>z===77&&p==='malleability'?[{id:'orig',sourceName:'PRINCIPAL ANTERIOR',origin:'main',property:p,status:'compiled',
 values:[{label:'Escoamento',value:99,unit:'MPa'}],sample:'estudo original',temperatureK:300,sourceURL:'https://example.org'}]:[]};
 const panel=S.createUnifiedElementEvidencePanel({mode:'data'});
 for(const [z,name] of [[4,'Xu'],[40,'Liu'],[49,'Iliev'],[92,'Weir'],[77,'Zhou'],[79,'Greer'],[75,'Sabisch']]){
  panel.update({atomicNumber:z});assert.equal(panel.root.hidden,false,'painel oculto '+z);
  assert.ok(panel.root.textContent.includes(name),'fonte ausente '+name);
  assert.ok(panel.root.walk(x=>x.className==='silm-unified-evidence-record').every(x=>x.dataset.engineRelease==='false'));
 }
 panel.update({atomicNumber:77});assert.ok(panel.root.textContent.includes('PRINCIPAL ANTERIOR'));
});
test('arquivo aparece no HTML antes da view e no cache offline com revisao nova',()=>{
 const html=read('index.html'),sw=read('sw.js'),file='domain/silm/data/science400-mechanical-stage95.js';
 assert.ok(html.indexOf(file)>0&&html.indexOf(file)<html.indexOf('domain/silm/data/science400-coverage.js'));
 assert.ok(sw.includes('"'+file+'"'));assert.ok(sw.includes('stage95-seven-mechanical-20261115-r1'));
});
