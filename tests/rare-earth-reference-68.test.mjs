import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
class ElementStub {
 constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.textContent='';this.className='';this.href='';}
 append(...items){this.children.push(...items);}
 setAttribute(k,v){this.attributes[k]=String(v);}
}
const ctx=vm.createContext({window:{SILM:{}},document:{createElement:tag=>new ElementStub(tag)},Intl,Number,Object,Map});
ctx.SILM=ctx.window.SILM;
vm.runInContext(read('domain/silm/data/rare-earth-reference-67.js'),ctx);
const R=ctx.SILM.rareEarthReference;
const SYMBOLS=['Sc','Y','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu'];

test('17 elementos das terras-raras e proveniência numérica preservados',()=>{
 const records=Array.from(R.list());
 assert.equal(records.length,17);
 assert.deepEqual(records.map(r=>r.symbol),SYMBOLS);
 assert.equal(new Set(records.map(r=>r.z)).size,17);
 assert.equal(R.get(61).symbol,'Pm');
 assert.equal(R.get(61).thermal_temperature_K,300.15);
 assert.equal(R.get(61).thermal_uncertainty_W_mK,2);
 assert.equal(R.get(61).rho_estimate,true);
 assert.equal(R.get(61).young_estimate,true);
 assert.equal(R.get(63).thermal_estimate,true);
 for(const r of records){
  assert.ok(r.rho_uohm_cm>0&&r.thermal_W_mK>0&&r.young_GPa>0);
  assert.equal(r.data_status,'CONDITIONAL_NOT_CNTP');
  assert.ok(Math.abs(100/r.rho_uohm_cm)>0);
 }
});
test('painel já existente recebe referência; nenhum outro metal recebe',()=>{
 for(const r of R.list()){
  const host=new ElementStub('div');
  assert.equal(R.renderData(host,{atomicNumber:r.z}),true);
  assert.equal(host.children.length,1);
  const str=JSON.stringify(host);
  for(const label of ['Resistividade elétrica','Condutividade elétrica','Condutividade térmica','Módulo de Young','0 °C e 1 atm']) assert.ok(str.includes(label),label+' '+r.symbol);
  assert.ok(!str.includes('R550'));
 }
 const host=new ElementStub('div');
 assert.equal(R.renderData(host,{atomicNumber:29}),false);
 assert.equal(host.children.length,0);
 assert.equal(ctx.SILM.materialProfiles,undefined);
});
test('script e cache offline fazem referência única ao novo módulo',()=>{
 const html=read('index.html'),sw=read('sw.js'),ui=read('integracao/metallic-experience.js');
 const path='domain/silm/data/rare-earth-reference-67.js';
 assert.equal(html.split(path).length-1,1);
 assert.equal(sw.split('"'+path+'"').length-1,1);
 assert.ok(html.indexOf('material-profile-tc-experimental-1988.js')<html.indexOf(path));
 assert.ok(html.indexOf(path)<html.indexOf('integracao/metallic-experience.js'));
 assert.match(sw,/stage68-rare-earth-data-reference-r1/);
 assert.equal(ui.split('S.rareEarthReference.renderData(host,e)').length-1,1);
 assert.ok(ui.indexOf('S.rareEarthReference.renderData(host,e)')>ui.indexOf('SILM.renderIntegrationMetalData='));
});
test('sem integração direta ou atribuição falsa de CNTP aos motores',()=>{
 const code=read('domain/silm/data/rare-earth-reference-67.js');
 assert.ok(!code.includes('SILM.materialProfiles.register'));
 assert.ok(!code.includes('SILM.scientificData='));
 for(const file of ['domain/silm/material-engine.js','domain/silm/thermal.js','domain/silm/electrothermal.js']){
  assert.ok(!read(file).includes('rareEarthReference'),file);
 }
});
