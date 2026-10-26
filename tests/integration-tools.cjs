'use strict';
const nav=require('./integration-navigation.cjs');
const assert=require('node:assert/strict');
module.exports=async(browser,url)=>{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await context.newPage();p.setDefaultTimeout(15000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
 await p.goto(url);await p.waitForFunction(()=>window.SILMIntegration);
 const state=()=>p.evaluate(()=>SILMIntegration.snapshot());
 for(const [z,t]of [['29','fcc'],['26','bcc'],['12','hcp']]){
  console.log('Teste ferramentas:',t);
  await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-metal').selectOption(z);await p.locator('#silm-start').click();
  if(z!=='29')await p.locator('#si-modal-confirm').click();
  await p.locator('#silm-add').click();await p.locator('#silm-organize').click();await p.locator('[data-close-dock="left"]').click();
  await nav.moduleChoice(p,'medir');await nav.viewer(p,'instrumentos');
  await p.locator('#silm-instrument').selectOption('latticeParameter');await p.locator('[data-close-dock="right"]').click();
  const pair=await p.evaluate(()=>{const s=SILMIntegration.snapshot(),g=SILM.crystal.geometry(SILM.data.get(s.metal.atomicNumber));for(const a of s.structure.units)for(const b of s.structure.units){const m=SILM.measurement.compute('latticeParameter',g,[a.site,b.site]);if(m.ok&&m.parameter==='a')return[a.id,b.id];}});assert.ok(pair);
  for(const id of pair)await p.locator('[data-unit-id="'+id+'"]').press('Enter');
  await p.waitForFunction(()=>SILMIntegration.snapshot().measurements.length===1);
  const measured=(await state()).measurements[0];assert.equal(measured.source.kind,'MODEL_MEASUREMENT');assert.ok(measured.value>0);
  await nav.viewer(p,'instrumentos');await p.locator('#silm-measure-unit').selectOption('pm');assert.deepEqual((await state()).measurements[0],measured,'Unidade de exibição não muda registro');
  await nav.moduleChoice(p,'calcular');await nav.viewer(p,'calculos');await p.locator('#silm-formula').selectOption('effective-atoms-'+t);await p.getByRole('button',{name:'Calcular',exact:true}).click();
  assert.equal((await state()).calculations[0].result.value,{fcc:4,bcc:2,hcp:6}[t]);
  await p.locator('#silm-formula').selectOption(t==='hcp'?'cell-volume-hcp':'cell-volume-cubic');
  await p.locator('#silm-origin-a').selectOption(measured.id);await p.getByRole('button',{name:'Calcular',exact:true}).click();
  assert.equal((await state()).calculations[1].inputs[0].origin,'MODEL_MEASUREMENT');
  await p.locator('#silm-origin-a').selectOption('user');await p.locator('#silm-input-a').fill('-2');await p.getByRole('button',{name:'Calcular',exact:true}).click();assert.equal((await state()).calculations.length,2,'Valor negativo rejeitado');
  await p.locator('#silm-input-a').fill('3,6');await p.getByRole('button',{name:'Calcular',exact:true}).click();assert.equal((await state()).calculations[2].inputs[0].value,3.6);
  await p.locator('#silm-formula').selectOption('theoretical-density');await p.getByRole('button',{name:'Calcular',exact:true}).click();{const r=(await state()).calculations[3].result;assert.ok(r.value>0||r.interval?.every(v=>v>0),'Densidade com dependências reais, incluindo massa molar intervalar');}
  const saved=await state();await p.reload();await p.waitForFunction(()=>window.SILMIntegration);assert.deepEqual(await state(),saved,'Histórico persiste após reload');
  await nav.data(p,'registros');assert.equal(await p.locator('#silm-history details').count(),5);await p.locator('[data-close-dock="right"]').click();
  await nav.moduleChoice(p,'explorar');
 }
 assert.equal(await p.evaluate(()=>{for(const e of SILM.data.elements.filter(e=>e.silmEligibility.status==='available')){const host=document.createElement('div');SILM.renderIntegrationMetalData(host,e,SILMIntegration.snapshot());if(/undefined|NaN|g\/mol g\/mol/.test(host.textContent))return e.symbol;}return true;}),true,'Dados renderizados para todos os metais disponíveis sem valores inválidos');
 const originalUnits=(await state()).structure.units;
 await nav.viewer(p,'propriedades');
 for(const [id,action,key,value]of [['electrical','field','field',true],['thermal','heat','heating',true],['malleability','compress','compression',1],['ductility','stretch','elongation',1],['luster','light','light',true]]){
  await p.locator('#silm-panel-property-start-'+id).click();await p.locator('#silm-panel-property-'+action).click();
  assert.equal((await state()).properties[id][key],value);if(id==='thermal'){await p.locator('#silm-panel-property-advance').click();assert.equal((await state()).properties.thermal.stage,1);}assert.deepEqual((await state()).structure.units,originalUnits,'Propriedade preserva sítios científicos');
  await p.locator('#silm-panel-property-restore').click();await p.locator('#silm-panel-property-end').click();
 }
 await p.locator('[data-close-dock="right"]').click();
 const science=await state();
 const palette=await p.evaluate(()=>{const css=()=>getComputedStyle(document.documentElement).getPropertyValue('--silm-electron').trim();BaseDemoSI.applyTheme('claro');const light=css();BaseDemoSI.applyTheme('escuro');return {light,dark:css()};});assert.notEqual(palette.light,palette.dark);
 await p.evaluate(()=>document.getElementById('si-contrast').click());assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()),'#050505');
 await p.evaluate(()=>document.getElementById('si-contrast').click());assert.deepEqual(await state(),science,'Tema e contraste não alteram ciência');
 await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-open-periodic').click();
 assert.equal(await p.locator('#silm-periodic-dialog .periodic-element').count(),118);
 await p.locator('#silm-periodic-dialog [data-z="8"]').click();assert.equal(await p.locator('#silm-periodic-dialog [id$="-investigate"]').isVisible(),false);
 await p.locator('#silm-close-periodic').click();assert.deepEqual(await state(),science,'Cancelar tabela preserva investigação');
 await p.locator('[data-close-dock="left"]').click();
 await p.setViewportSize({width:390,height:844});await p.locator('[data-open-dock="ver"]').click();
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Painel científico sem overflow móvel');
 console.log('PASS: cinco propriedades, cores científicas claro/escuro, alto contraste, tabela de 118 elementos e invariância do motor.');
 const migration=await browser.newContext();
 try{
  await migration.addInitScript(value=>localStorage.setItem('simcore_domain_silm_v1_scientific.state',JSON.stringify(value)),science);
  const restored=await migration.newPage();await restored.goto(url);await restored.waitForFunction(()=>window.SILMIntegration);
  assert.deepEqual(await restored.evaluate(()=>SILMIntegration.snapshot()),science,'Sessão antiga válida copiada para interface vazia');
  assert.deepEqual(await restored.evaluate(()=>JSON.parse(localStorage.getItem('simcore_domain_silm_v1_scientific.state'))),science,'Sessão antiga original preservada');
 }finally{await migration.close();}
 assert.deepEqual(errors,[]);console.log('PASS: Medir/Calcular na nova base — FCC/BCC/HCP, teclado, fontes, unidades, entradas com vírgula, rejeição negativa, densidade derivada e persistência.');
 }finally{await context.close();}
};
