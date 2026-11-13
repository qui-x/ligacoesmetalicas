// E2E do Frâncio com uma estrutura CFC prevista computacionalmente, sem referência experimental falsa.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','francium-computed',browserName);
mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina SILM não abriu');
   const tile=page.locator('#silm-object-entry .periodic-element[data-z="87"]');
   await tile.waitFor({state:'visible'});
   assert.equal(await tile.getAttribute('data-availability'),'available','Fr permaneceu bloqueado');
   await tile.click();
   const dialog=page.locator('#silm-objects-dialog');
   await dialog.waitFor({state:'visible'});
   const catalog=dialog.locator('.silm-object-catalog');
   assert.equal(await catalog.locator('.silm-workshop-card').count(),0,'Aplicações reais de Fr foram inventadas');
   await catalog.getByRole('button',{name:'Investigar estrutura cristalina de Frâncio'}).click();
   await dialog.waitFor({state:'hidden'});
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===87);
   await page.waitForFunction(()=>{
    const state=window.SILMIntegration?.snapshot?.();
    return state?.structure?.mode==='crystalline'&&state?.metadata?.workshop?.scale===3;
   });
   const state=await page.evaluate(()=>window.SILMIntegration.snapshot());
   assert.equal(state.structure.crystallography.structureType,'FCC');
   assert.equal(state.structure.referenceStructureId,'fr-fcc-pbe-d3-2024');
   assert.equal(state.module.active,'explorar');
   assert.ok(state.structure.units.length>=4,'Célula Fr CFC incompleta');
   const science=await page.evaluate(()=>{
    const e=SILM.data.get(87),ref=SILM.data.structure(e);
    return {eligibility:SILM.crystal.eligibility(e).status,
     evidence:SILM.data.structureEvidence(e).type,
     a:ref.latticeParameters.a.value,temperature:ref.conditions.temperature.display,
     props:Object.values(SILM.properties.eligibility(e)).map(p=>p.status)};
   });
   assert.equal(science.eligibility,'available');
   assert.equal(science.evidence,'computed');
   assert.equal(science.a,7.59);
   assert.match(science.temperature,/0 K/);
   assert.ok(science.props.every(s=>s==='unavailable'),'Propriedades físicas indevidamente liberadas');
   await page.locator('.silm-workshop-scale[data-scale="4"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===4);
   await page.locator('.silm-workshop-scale[data-scale="3"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===3);
   await page.screenshot({path:join(dir,'fr-fcc-computed-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'});
   assert.deepEqual(errors,[],screen+': erros de navegação');
  }finally{await context.close();}
 }
}finally{await browser.close();}
