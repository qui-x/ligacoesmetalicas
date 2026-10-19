'use strict';
const assert=require('node:assert/strict');
module.exports=async(browser,url)=>{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),p=await context.newPage();p.setDefaultTimeout(8000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
 await p.goto(url);await p.waitForFunction(()=>window.SILMIntegration);
 const state=()=>p.evaluate(()=>SILMIntegration.snapshot());
 for(const [z,t]of [['29','fcc'],['26','bcc'],['12','hcp']]){
  console.log('Teste ferramentas:',t);
  await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-metal').selectOption(z);await p.locator('#silm-start').click();
  if(z!=='29')await p.locator('#si-modal-confirm').click();
  await p.locator('#silm-add').click();await p.locator('#silm-organize').click();await p.locator('[data-close-dock="left"]').click();
  await p.locator('[data-open-dock="ver"]').click();await p.locator('#silm-module').selectOption('medir');
  await p.locator('#silm-instrument').selectOption('latticeParameter');await p.locator('[data-close-dock="right"]').click();
  const pair=await p.evaluate(()=>{const s=SILMIntegration.snapshot(),g=SILM.crystal.geometry(SILM.data.get(s.metal.atomicNumber));for(const a of s.structure.units)for(const b of s.structure.units){const m=SILM.measurement.compute('latticeParameter',g,[a.site,b.site]);if(m.ok&&m.parameter==='a')return[a.id,b.id];}});assert.ok(pair);
  for(const id of pair)await p.locator('[data-unit-id="'+id+'"]').press('Enter');
  await p.waitForFunction(()=>SILMIntegration.snapshot().measurements.length===1);
  const measured=(await state()).measurements[0];assert.equal(measured.source.kind,'MODEL_MEASUREMENT');assert.ok(measured.value>0);
  await p.locator('[data-open-dock="ver"]').click();await p.locator('#silm-measure-unit').selectOption('pm');assert.deepEqual((await state()).measurements[0],measured,'Unidade de exibição não muda registro');
  await p.locator('#silm-module').selectOption('calcular');await p.locator('#silm-formula').selectOption('effective-atoms-'+t);await p.getByRole('button',{name:'Calcular',exact:true}).click();
  assert.equal((await state()).calculations[0].result.value,{fcc:4,bcc:2,hcp:6}[t]);
  await p.locator('#silm-formula').selectOption(t==='hcp'?'cell-volume-hcp':'cell-volume-cubic');
  await p.locator('#silm-origin-a').selectOption(measured.id);await p.getByRole('button',{name:'Calcular',exact:true}).click();
  assert.equal((await state()).calculations[1].inputs[0].origin,'MODEL_MEASUREMENT');
  await p.locator('#silm-origin-a').selectOption('user');await p.locator('#silm-input-a').fill('-2');await p.getByRole('button',{name:'Calcular',exact:true}).click();assert.equal((await state()).calculations.length,2,'Valor negativo rejeitado');
  await p.locator('#silm-input-a').fill('3,6');await p.getByRole('button',{name:'Calcular',exact:true}).click();assert.equal((await state()).calculations[2].inputs[0].value,3.6);
  await p.locator('#silm-formula').selectOption('theoretical-density');await p.getByRole('button',{name:'Calcular',exact:true}).click();{const r=(await state()).calculations[3].result;assert.ok(r.value>0||r.interval?.every(v=>v>0),'Densidade com dependências reais, incluindo massa molar intervalar');}
  const saved=await state();await p.reload();await p.waitForFunction(()=>window.SILMIntegration);assert.deepEqual(await state(),saved,'Histórico persiste após reload');
  await p.locator('[data-open-dock="dados"]').click();assert.equal(await p.locator('#silm-history details').count(),5);await p.locator('[data-close-dock="right"]').click();
  await p.locator('[data-open-dock="ver"]').click();await p.locator('#silm-module').selectOption('explorar');await p.locator('[data-close-dock="right"]').click();
 }
 assert.deepEqual(errors,[]);console.log('PASS: Medir/Calcular na nova base — FCC/BCC/HCP, teclado, fontes, unidades, entradas com vírgula, rejeição negativa, densidade derivada e persistência.');
 }finally{await context.close();}
};
