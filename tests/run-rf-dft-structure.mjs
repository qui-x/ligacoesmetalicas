// Primeira entrada de um transactinídeo no motor cristalográfico existente, sem imagens/objetos inventados.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','rutherfordium-dft',browserName);
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
   const tile=page.locator('#silm-object-entry .periodic-element[data-z="104"]');
   await tile.waitFor({state:'visible'});
   assert.equal(await tile.getAttribute('data-availability'),'available','Rf permaneceu bloqueado na Tabela Periódica');
   const locked=page.locator('#silm-object-entry .periodic-element[data-z="105"]');
   assert.notEqual(await locked.getAttribute('data-availability'),'available','Db foi indevidamente liberado');
   await tile.click();
   const dialog=page.locator('#silm-objects-dialog');
   await dialog.waitFor({state:'visible'});
   const catalog=dialog.locator('.silm-object-catalog');
   assert.equal(await catalog.locator('.silm-workshop-card').count(),0,'Inventaram objetos comerciais do Rf');
   assert.match(await catalog.innerText(),/prevista computacionalmente/i);
   await catalog.getByRole('button',{name:'Investigar estrutura cristalina de Rutherfórdio'}).click();
   await dialog.waitFor({state:'hidden'});
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===104);
   await page.waitForFunction(()=>{
    const s=window.SILMIntegration?.snapshot?.();
    return s?.structure?.mode==='crystalline'&&s?.metadata?.workshop?.scale===3;
   });
   const state=await page.evaluate(()=>window.SILMIntegration.snapshot());
   assert.equal(state.structure.crystallography.structureType,'HCP');
   assert.equal(state.structure.referenceStructureId,'rf-hcp-dft-srso-2012');
   assert.equal(state.module.active,'explorar');
   assert.ok(state.structure.units.length>=2,'Célula HC de Rf incompleta');
   const science=await page.evaluate(()=>{
    const e=SILM.data.get(104),ref=SILM.data.structure(e);
    return {status:SILM.crystal.eligibility(e).status,
     evidence:SILM.data.structureEvidence(e).type,
     method:SILM.data.structureEvidence(e).method,
     a:ref.latticeParameters.a.value,c:ref.latticeParameters.c.value,
     condition:ref.conditions.temperature.display,
     properties:Object.values(SILM.properties.eligibility(e)).map(x=>x.status)};
   });
   assert.equal(science.status,'available');
   assert.equal(science.evidence,'computed');
   assert.equal(science.method,'relativistic-dft-fplapw-pbe-srso');
   assert.equal(science.a,3.269);
   assert.equal(science.c,5.198);
   assert.match(science.condition,/0 K/);
   assert.ok(science.properties.every(s=>s==='unavailable'),'Propriedades do Rf não homologadas foram liberadas');
   await page.locator('.silm-workshop-scale[data-scale="4"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===4);
   await page.locator('.silm-workshop-scale[data-scale="3"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===3);
   await page.screenshot({path:join(dir,'rf-hcp-dft-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'});
   assert.deepEqual(errors,[],screen+': erro de execução do Rf');
  }finally{await context.close();}
 }
}finally{await browser.close();}
