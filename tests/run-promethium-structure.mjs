// Regressão real de entrada do Pm: sem objetos fictícios nem segundo motor.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','promethium',browserName);mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [name,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
  assert.ok(response?.ok(),'Oficina não abriu');
  await page.locator('#silm-object-entry .periodic-element[data-z="61"]').waitFor({state:'visible'});
  const availability=await page.locator('#silm-object-entry .periodic-element[data-z="61"]').getAttribute('data-availability');
  assert.equal(availability,'available',name+': Pm permaneceu indisponível na tabela.');
  await page.locator('#silm-object-entry .periodic-element[data-z="61"]').click();
  const dialog=page.locator('#silm-objects-dialog');
  await dialog.waitFor({state:'visible'});
  const catalog=dialog.locator('.silm-object-catalog');
  assert.equal(await catalog.locator('.silm-workshop-card').count(),0,
   'O SILM inventou aplicações do Pm para habilitar sua estrutura.');
  await catalog.getByRole('button',{name:'Investigar estrutura cristalina de Promécio'}).click();
  await dialog.waitFor({state:'hidden'});
  await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===61);
  await page.waitForFunction(()=>{
   const s=window.SILMIntegration?.snapshot?.();
   return s?.structure?.mode==='crystalline'&&s?.metadata?.workshop?.scale===3;
  });
  const state=await page.evaluate(()=>SILMIntegration.snapshot());
  assert.equal(state.structure.crystallography.structureType,'DHCP');
  assert.equal(state.structure.referenceStructureId,'pm-reference');
  assert.equal(state.module.active,'explorar');
  assert.ok(state.structure.units.length>=4,'Célula DHCP não foi construída');
  const props=await page.evaluate(()=>{
   const e=SILM.data.get(61);
   return {geometry:SILM.crystal.eligibility(e),
    properties:Object.fromEntries(Object.entries(SILM.properties.eligibility(e)).map(([k,v])=>[k,v.status])),
    sourceIds:SILM.data.sourceIds(e)};
  });
  assert.equal(props.geometry.status,'available',JSON.stringify(props.geometry));
  assert.equal(props.geometry.atomsPerCell,4);
  assert.ok(Object.values(props.properties).every(v=>v==='unavailable'),
   'Pm foi liberado para uma propriedade não homologada: '+JSON.stringify(props.properties));
  assert.ok(props.sourceIds.includes('src-pm-pallmer-chikalla-1971'));
  await page.locator('.silm-workshop-scale[data-scale="4"]').click();
  await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===4);
  await page.locator('.silm-workshop-scale[data-scale="3"]').click();
  await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===3);
  await page.screenshot({path:join(dir,'pm-dhcp-'+name+'.jpg'),type:'jpeg',quality:83,animations:'disabled'});
  assert.deepEqual(errors,[],name+': erro de execução do Pm');
  await context.close();
 }
}finally{await browser.close();}
