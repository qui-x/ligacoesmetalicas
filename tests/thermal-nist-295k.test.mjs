import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const load=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ctx=vm.createContext({window:{SILM:{}}});
ctx.SILM=ctx.window.SILM;
vm.runInContext(load('domain/silm/data/research-thermal-nist-295k.js'),ctx);
const table=ctx.SILM.researchThermalNIST;

test('NIST: seis metais e condutividades em 295 K, sem trocar para a CNTP',()=>{
 const data=[[13,'Al',235],[48,'Cd',97],[29,'Cu',400],[79,'Au',317],[49,'In',87],[82,'Pb',35]];
 assert.equal(table.records.length,6);
 assert.equal(table.source.temperatureK,295);
 assert.equal(table.source.pressurePa,null);
 assert.equal(table.source.conditionMatchCNTP,false);
 assert.equal(table.approvedCNTPCases,0);
 assert.equal(table.simulationEngineChanged,false);
 assert.equal(table.source.url,'https://www.nist.gov/ncnr/neutron-instruments/sample-environment/sample-mounting/reference-tables');
 assert.equal(table.source.classification,'institutional-reference-compilation');
 for(const [z,symbol,value] of data){
  const row=table.get(z);
  assert.equal(row.symbol,symbol);
  assert.equal(row.conductivity,value);
  assert.equal(row.unit,'W/(m·K)');
  assert.equal(row.temperatureK,295);
  assert.equal(row.pressurePa,null);
  assert.equal(row.CNTPhomologated,false);
  assert.equal(row.engineRelease,false);
  assert.equal(row.referenceOnly,true);
  assert.ok(Object.isFrozen(row));
 }
 assert.equal(table.get(26),null,'Fe nao consta dessa tabela, nao deve herdar Cu');
 assert.equal(table.get(1),null,'H nao consta da tabela');
 assert.equal(table.get(0),null);
});

test('referencia de calor aparece no painel existente e nao calibra o solver',()=>{
 const view=load('domain/silm/property-view.js');
 const html=load('index.html');
 const cache=load('sw.js');
 const path='domain/silm/data/research-thermal-nist-295k.js';
 assert.ok(html.includes(path));
 assert.ok(html.indexOf(path)<html.indexOf('domain/silm/property-view.js'));
 assert.ok(cache.includes(path));
 assert.match(view,/SILM\.researchThermalNIST\?\.get/);
 assert.match(view,/thermalSection\.hidden=!thermalReference/);
 assert.match(view,/NÃO calibra a animação de calor/);
 assert.ok(!load('domain/silm/thermal.js').includes('researchThermalNIST'));
 assert.ok(!load('domain/silm/material-engine.js').includes('researchThermalNIST'));
});
