// E2E do Rutherfórdio: estrutura HC DFT SR+SO, sem medições nem propriedades físicas fictícias.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','rutherfordium-computed',browserName);
mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina não carregou');
   const metal=page.locator('#silm-object-entry .periodic-element[data-z="104"]');
   await metal.waitFor({state:'visible'});
   assert.equal(await metal.getAttribute('data-availability'),'available','Rf ainda bloqueado');
   await metal.click();
   const dialog=page.locator('#silm-objects-dialog');
   await dialog.waitFor({state:'visible'});
   const catalog=dialog.locator('.silm-object-catalog');
   assert.equal(await catalog.locator('.silm-workshop-card').count(),0,'Objetos reais de Rf inventados');
   await catalog.getByRole('button',{name:'Investigar estrutura cristalina de Rutherfórdio'}).click();
   await dialog.waitFor({state:'hidden'});
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===104);
   await page.waitForFunction(()=>{
    const state=window.SILMIntegration?.snapshot?.();
    return state?.structure?.mode==='crystalline'&&state?.metadata?.workshop?.scale===3;
   });
   const state=await page.evaluate(()=>window.SILMIntegration.snapshot());
   assert.equal(state.structure.crystallography.structureType,'HCP');
   assert.equal(state.structure.referenceStructureId,'rf-hcp-srso-2012');
   assert.equal(state.module.active,'explorar');
   assert.ok(state.structure.units.length>=2,'Célula HC incompleta');
   const science=await page.evaluate(()=>{
    const element=SILM.data.get(104),ref=SILM.data.structure(element);
    return {crystal:SILM.crystal.eligibility(element).status,
     evidence:SILM.data.structureEvidence(element).type,
     a:ref.latticeParameters.a.value,c:ref.latticeParameters.c.value,
     temperature:ref.conditions.temperature.display,
     properties:Object.values(SILM.properties.eligibility(element)).map(x=>x.status)};
   });
   assert.equal(science.crystal,'available');
   assert.equal(science.evidence,'computed');
   assert.equal(science.a,3.269);
   assert.equal(science.c,5.198);
   assert.match(science.temperature,/0 K/);
   assert.ok(science.properties.every(p=>p==='unavailable'),'Propriedades foram indevidamente liberadas');
   await page.locator('.silm-workshop-scale[data-scale="4"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===4);
   await page.locator('.silm-workshop-scale[data-scale="3"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===3);
   await page.screenshot({path:join(dir,'rf-hcp-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'});
   assert.deepEqual(errors,[],screen+': erro de navegação');
  }finally{await context.close();}
 }
}finally{await browser.close();}
