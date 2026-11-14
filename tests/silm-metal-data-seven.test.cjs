'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
class Node{
 constructor(tag,text=''){this.tagName=tag;this._own=String(text);this.children=[];this.dataset={};
  this.className='';this.href=null;this.target=null;this.rel=null;}
 get textContent(){return this._own+this.children.map(c=>c.textContent).join('');}
 set textContent(v){this._own=String(v);this.children=[];}
 append(...children){this.children.push(...children);}
 findAll(pred){return [...(pred(this)?[this]:[]),...this.children.flatMap(c=>c.findAll?c.findAll(pred):[])];}
}
const document={createElement:tag=>new Node(tag),createTextNode:txt=>new Node('#text',txt)};
const silm={};
const context=vm.createContext({window:{SILM:silm},SILM:silm,document});
vm.runInContext(read('domain/silm/data/research-seven-condition-profiles.js'),context);
const propNames={electrical:'Condutividade elétrica',thermal:'Condutividade térmica',
 malleability:'Maleabilidade',ductility:'Ductilidade',luster:'Brilho metálico'};
const ids=Object.keys(propNames);
silm.engineAdapters={resolve(name){
 const data={structure:()=>({type:'CFC',latticeParameters:{},conditions:{}}),
  sourceIds:()=>[],source:()=>null};
 const props={ids,catalog:Object.fromEntries(ids.map(id=>[id,{title:propNames[id]}])),
  data:(e,id)=>e.atomicNumber===29&&id==='thermal'?{display:'450',unit:'W/(m·K)',kind:'TABULATED'}:null};
 const calculations={tabulated:()=>null};
 const map={'data.reference-catalog':data,'properties.eligibility-catalog':props,
  'calculation.formula-service':calculations};
 assert.ok(map[name],'Unexpected API '+name);
 return {ok:true,api:map[name]};
}};
vm.runInContext(read('integracao/metallic-experience.js'),context);
function display(z){
 const symbol=Object.keys(silm.sevenConditionResearch.atomicNumbers).find(k=>silm.sevenConditionResearch.atomicNumbers[k]===z)||'Cu';
 const e={name:symbol,symbol,atomicNumber:z,electronConfiguration:{display:'configuração'},
  valenceModel:{display:'elétrons',convention:'modelo'}};
 const host=new Node('section');
 silm.renderIntegrationMetalData(host,e,{structure:{units:[]}});
 return host;
}
test('seven supported metals produce 5 values in the SAME Dados renderer',()=>{
 const metals=[27,68,72,73,43,90,40];
 for(const z of metals){
  const h=display(z);
  const rows=h.findAll(x=>x.className==='silm-metal-data-observation');
  assert.equal(rows.length,5,'Metal Z='+z+' sem todas as fichas');
  assert.deepEqual(rows.map(x=>x.dataset.property),ids);
  assert.ok(rows.every(x=>x.dataset.engineRelease==='false'),'numérico indevidamente liberado');
  assert.ok(rows.every(x=>x.textContent.includes('Condição:')&&x.textContent.includes('sem calibração')),'condição não visível');
  assert.doesNotMatch(h.textContent,/Sem valor numérico homologado; experiência qualitativa conforme elegibilidade/);
  const links=h.findAll(x=>x.tagName==='a');
  assert.equal(links.length,5,'fonte específica não encontrada');
  assert.ok(links.every(x=>x.href.startsWith('https://')&&x.rel==='noopener noreferrer'));
 }
});
test('readability: Co electrical conductivity derived, Er optical stays at 4,2 K',()=>{
 const co=display(27).findAll(x=>x.className==='silm-metal-data-observation');
 const elec=co.find(x=>x.dataset.property==='electrical');
 assert.match(elec.textContent,/S\/m/);
 assert.match(elec.textContent,/σ = 1\/ρ/);
 assert.match(elec.textContent,/5,24 µΩ·cm/);
 assert.match(elec.textContent,/273,15 K/);
 const er=display(68),erOpt=er.findAll(x=>x.className==='silm-metal-data-observation').find(x=>x.dataset.property==='luster');
 assert.match(erOpt.textContent,/4,2 K/);
 assert.match(erOpt.textContent,/interface ideal/);
});
test('mechanical process and lower-bound evidence never presented as intrinsic exact limits',()=>{
 const co=display(27).findAll(x=>x.className==='silm-metal-data-observation');
 assert.match(co.find(x=>x.dataset.property==='ductility').textContent,/superior a 35 % \(limite inferior\)/);
 const er=display(68),r=er.findAll(x=>x.className==='silm-metal-data-observation').find(x=>x.dataset.property==='malleability');
 assert.match(r.textContent,/Redução aplicada em laminação a frio/);
 assert.match(r.textContent,/não limite intrínseco/);
 const th=display(90);
 assert.match(th.textContent,/transcrição secundária não conferida/);
});
test('original values remain and unrelated metal Cu is not given fabricated five profiles',()=>{
 const cu=display(29),research=cu.findAll(x=>x.className==='silm-metal-data-observation');
 assert.equal(research.length,0);
 assert.match(cu.textContent,/Condutividade térmica: 450 W\/\(m·K\)/);
 assert.match(cu.textContent,/Sem valor numérico homologado/);
});
test('real adapter routes current metal through corrected data-panel renderer',()=>{
 const adapter=read('integracao/adapter.js');
 assert.match(adapter,/S\.renderIntegrationMetalData\(data,e,state\)/);
 const index=read('index.html'),sw=read('sw.js');
 assert.ok(index.indexOf('domain/silm/data/research-seven-condition-profiles.js') <
  index.indexOf('integracao/metallic-experience.js'));
 assert.ok(sw.includes('"integracao/metallic-experience.js"')&&
  sw.includes('"domain/silm/research-evidence.css"'));
});
