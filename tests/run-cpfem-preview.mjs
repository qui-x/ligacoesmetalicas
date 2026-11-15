// Contrato visual da prévia técnica CPFEM; não reestrutura Montagem, Ver ou Dados.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),playwright=require(process.env.PLAYWRIGHT_MODULE);
const browserName=process.env.BROWSER_NAME||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8765';
const browser=await playwright[browserName].launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const res=await page.goto(base+'/index.html?cpfem-preview=1#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(res?.ok());
 await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()&&window.SILM?.polycrystalCPFEM?.create&&
  !document.querySelector('#silm-workshop-context')?.hidden,undefined,{timeout:45000});
 const capabilities=await page.evaluate(()=>SILM.mechanicsActionContract.statusFor('mechanics.crystal.preview'));
 assert.equal(capabilities.status,'AWAITING_MENU_REVIEW');
 assert.equal(capabilities.enabled,false);
 // A main atual organiza a Tabela no palco e os objetos em catálogo/modal.
 // Reutilizar a mesma navegação validada em run-workshop-micro-main.mjs.
 await page.locator('[data-open-dock="montagem"]').click();
 await page.locator('#silm-open-periodic').click();
 await page.locator('#silm-object-entry .periodic-element[data-z="26"]').click();
 await page.locator('#silm-objects-dialog').waitFor({state:'visible'});
 await page.locator('#silm-objects-dialog .silm-workshop-card')
  .filter({hasText:'Parafuso de aço'}).getByRole('button',{name:'Iniciar montagem'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===26);
 await page.locator('.silm-workshop-scale').nth(1).click();
 const viewer=page.locator('.silm-workshop-micro-viewer');
 await viewer.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
 await page.getByRole('button',{name:'Ver',exact:true}).click();
 const prop=page.locator('[data-action="property-malleability"]');
 await prop.waitFor({state:'visible'});await prop.click();
 await page.locator('#si-dock-right [data-close-dock="right"]').click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.mechanicalStudy==='malleability');
 const before=JSON.stringify(await page.evaluate(()=>SILMIntegration.snapshot()));
 const contact=viewer.locator('.silm-micro-contact-details');
 await contact.locator('summary').first().click();
 const slip=contact.locator('.silm-micro-slip-details');
 await slip.locator('summary').first().click();
 const preview=slip.locator('.silm-micro-cpfem-preview');
 assert.equal(await preview.count(),1,'Previa opt-in nao aparece nos controles existentes.');
 await preview.locator('summary').first().click();
 const show=preview.locator('.silm-micro-cpfem-show');
 assert.equal(await show.isDisabled(),true,'Campo nao pode estar habilitado antes da convergencia.');
 await preview.locator('.silm-micro-cpfem-load').evaluate(el=>{
  el.value='10';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await preview.getByRole('button',{name:'Calcular equilíbrio dos grãos sintéticos na prévia CPFEM'}).click();
 await page.waitForFunction(()=>/Policristal hipotético|não convergiu|Prévia indisponível/.test(
  document.querySelector('.silm-micro-cpfem-status')?.textContent||''),undefined,{timeout:90000});
 assert.match(await preview.locator('.silm-micro-cpfem-status').textContent(),
  /Policristal hipotético.*sem calibração por metal|Policristal hipotético.*Sem calibração por metal/i,
  'Previa elastica nao convergiu ou apresenta resultado como medido.');
 assert.equal(await show.isEnabled(),true);
 await viewer.locator('.silm-micro-grain').nth(25).focus();
 await viewer.locator('.silm-micro-grain').nth(25).press('Enter');
 assert.match(await preview.locator('.silm-micro-cpfem-grain').textContent(),
  /Grão sintético 26.*deformação plástica equivalente.*NÃO classificada como residual/);
 assert.match(await preview.locator('.silm-micro-cpfem-residual').textContent(),
  /Sem classificação de tensão residual/);
 await show.check();
 assert.equal(await viewer.getAttribute('data-cpfem-presentation'),'synthetic-readout-opt-in');
 assert.equal(await viewer.getAttribute('data-mechanical-solver'),'cpfem-polycrystal-preview');
 assert.equal(await viewer.getAttribute('data-slip-j2-coupled'),'false');
 const mapSelect=preview.locator('.silm-micro-cpfem-map-mode');
 assert.equal(await mapSelect.isEnabled(),true);
 const materialFill=await viewer.locator('.silm-micro-grain').first()
  .evaluate(p=>p.style.getPropertyValue('--silm-grain-fill'));
 await mapSelect.selectOption('plastic-strain');
 assert.equal(await viewer.getAttribute('data-cpfem-grain-map'),'plastic-strain');
 const overlays=viewer.locator('.silm-micro-cpfem-overlay');
 assert.equal(await overlays.count(),await viewer.locator('.silm-micro-grain').count());
 const painted=await overlays.evaluateAll(nodes=>nodes.filter(n=>
  n.style.display!=='none'&&n.dataset.mapSampled==='SAMPLED_SYNTHETIC').length);
 assert.ok(painted>0,'Mapa plastico nao coloriu regioes FEM amostradas');
 assert.match(await preview.locator('.silm-micro-cpfem-map-legend').textContent(),
  /Deformação plástica equivalente.*Mínimo.*máximo.*Escala relativa ao ensaio atual/);
 const afterFill=await viewer.locator('.silm-micro-grain').first()
  .evaluate(p=>p.style.getPropertyValue('--silm-grain-fill'));
 assert.equal(afterFill,materialFill,'Mapa CPFEM substituiu a cor original do material');
 await mapSelect.selectOption('residual-von-mises');
 assert.equal(await viewer.getAttribute('data-cpfem-grain-map'),'none',
  'Mapa de tensao residual nao deve estar disponivel antes da forca zero');
 assert.match(await preview.locator('.silm-micro-cpfem-map-legend').textContent(),
  /Mapa indisponível.*topo precisa atingir equilibrio numerico/i);
 await show.uncheck();
 assert.equal(await mapSelect.isDisabled(),true);
 assert.equal(await viewer.getAttribute('data-cpfem-grain-map'),'none');
 assert.equal(await viewer.getAttribute('data-cpfem-presentation'),'j2-default');
 assert.equal(await viewer.getAttribute('data-mechanical-solver'),'incremental-j2-plane-strain');
 assert.equal(JSON.stringify(await page.evaluate(()=>SILMIntegration.snapshot())),before,
  'A previa deve ser isolada do estado cientifico e nao alterar a investigacao.');
 // Um campo calculado para outra intensidade ou contato nao pode ser exibido.
 await show.check();
 await preview.locator('.silm-micro-cpfem-load').evaluate(el=>{
  el.value='15';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 assert.equal(await show.isDisabled(),true,'Mudar deslocamento deve invalidar o CPFEM anterior.');
 assert.match(await preview.locator('.silm-micro-cpfem-status').textContent(),/Deslocamento alterado/);
 assert.equal(await viewer.getAttribute('data-cpfem-presentation'),'j2-default');
 await preview.locator('.silm-micro-cpfem-load').evaluate(el=>{
  el.value='10';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await preview.getByRole('button',{name:'Calcular equilíbrio dos grãos sintéticos na prévia CPFEM'}).click();
 await page.waitForFunction(()=>/Policristal hipotético|não convergiu|Prévia indisponível/.test(
  document.querySelector('.silm-micro-cpfem-status')?.textContent||''),undefined,{timeout:90000});
 assert.match(await preview.locator('.silm-micro-cpfem-status').textContent(),/contato 50%.*largura 30%/);
 await show.check();
 await viewer.locator('.silm-micro-contact-position').evaluate(el=>{
  el.value='20';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 assert.equal(await show.isDisabled(),true,'Mover o contato deve invalidar a previa anterior.');
 assert.equal(await viewer.getAttribute('data-cpfem-presentation'),'j2-default');
 assert.match(await preview.locator('.silm-micro-cpfem-status').textContent(),/Contato alterado/);
 // Reproduzir uma descarga controlada no mesmo componente, sem publicar menus.
 await viewer.locator('.silm-micro-contact-position').evaluate(el=>{
  el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await preview.locator('.silm-micro-cpfem-unload').check();
 await preview.getByRole('button',{name:'Calcular equilíbrio dos grãos sintéticos na prévia CPFEM'}).click();
 await page.waitForFunction(()=>/Policristal hipotético|não convergiu|Prévia indisponível/.test(
  document.querySelector('.silm-micro-cpfem-status')?.textContent||''),undefined,{timeout:90000});
 assert.match(await preview.locator('.silm-micro-cpfem-status').textContent(),
  /após descarga controlada, garra mantida/);
 const details=preview.locator('.silm-micro-cpfem-audit');
 await details.locator('summary').click();
 assert.match(await details.locator('.silm-micro-cpfem-energy').textContent(),
  /Descarga incremental controlada: trabalho de retorno .*Garra mantida em deslocamento zero/);
 assert.equal(JSON.stringify(await page.evaluate(()=>SILMIntegration.snapshot())),before,
  'Descarga controlada não deve modificar o estado científico da investigação.');
 // 84E: a reducao de forca tem outro contorno mecanico e invalida a previa 84D.
 const mode=preview.locator('.silm-micro-cpfem-unload-mode');
 await mode.selectOption('force');
 assert.equal(await show.isDisabled(),true,'Trocar de contorno deve invalidar a previa.');
 assert.match(await preview.locator('.silm-micro-cpfem-status').textContent(),/Modo de descarga alterado/);
 await preview.getByRole('button',{name:'Calcular equilíbrio dos grãos sintéticos na prévia CPFEM'}).click();
 await page.waitForFunction(()=>/Policristal hipotético|não convergiu|Prévia indisponível/.test(
  document.querySelector('.silm-micro-cpfem-status')?.textContent||''),undefined,{timeout:90000});
 assert.match(await preview.locator('.silm-micro-cpfem-status').textContent(),
  /redução gradual de forças até zero/);
 assert.match(await details.locator('.silm-micro-cpfem-energy').textContent(),
  /Descarga quase-estática de forças nodais: trabalho de retorno .*topo livre de tração prescrita/);
 assert.match(await preview.locator('.silm-micro-cpfem-residual').textContent(),
  /deformação plástica equivalente média.*tensão axial residual média.*variação εyy pico–final/);
 assert.match(await preview.locator('.silm-micro-cpfem-grain').textContent(),
  /Grão sintético 26.*tensão axial residual.*variação axial pico–final/);
 const summary=await page.evaluate(()=>document.querySelector('.silm-micro-cpfem-residual')?.textContent);
 assert.ok(!/NaN|undefined|Infinity/.test(summary),'Resumo residual contém valores inválidos');
 assert.equal(await show.isEnabled(),true);
 await show.check();
 assert.equal(await viewer.getAttribute('data-mechanical-solver'),'cpfem-polycrystal-preview');
 assert.equal(await mapSelect.isEnabled(),true);
 await mapSelect.selectOption('residual-axial');
 assert.equal(await viewer.getAttribute('data-cpfem-grain-map'),'residual-axial');
 assert.match(await preview.locator('.silm-micro-cpfem-map-legend').textContent(),
  /Tensão axial residual σyy.*Compressão.*zero.*tração/);
 const axialOverlay=await overlays.evaluateAll(nodes=>nodes.filter(n=>
  n.style.display!=='none'&&n.dataset.mapSampled==='SAMPLED_SYNTHETIC').length);
 assert.ok(axialOverlay>0,'Mapa de tensão residual não contém grãos amostrados');
 await mapSelect.selectOption('residual-von-mises');
 assert.equal(await viewer.getAttribute('data-cpfem-grain-map'),'residual-von-mises');
 assert.match(await preview.locator('.silm-micro-cpfem-map-limits').textContent(),
  /Mínimo.*máximo/);
 await show.uncheck();
 assert.equal(await viewer.getAttribute('data-cpfem-grain-map'),'none');
 assert.equal(await viewer.getAttribute('data-cpfem-presentation'),'j2-default');
 assert.equal(JSON.stringify(await page.evaluate(()=>SILMIntegration.snapshot())),before,
  'Descarga por forca nao pode alterar o estado cientifico da investigacao.');
 assert.deepEqual(errors,[],'Erros JS no ensaio CPFEM opt-in: '+errors.join('; '));
 console.log('CPFEM opt-in: '+browserName+' OK, sem menu novo e sem alterar J2.');
}finally{await browser.close();}
