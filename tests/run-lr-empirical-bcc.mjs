// Laurêncio: modelo geométrico CCC hipotético, sem afirmar mínimo energético ou difração.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const folder=join('reports','lr-empirical-bcc',browserName);
mkdirSync(folder,{recursive:true});
const metals=[
 {z:103,symbol:'lr',name:'Laurêncio',a:3.834}
];
const browser=await pw[browserName].launch({headless:true});
try{
 for(const metal of metals)for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina não abriu');
   const tile=page.locator('#silm-object-entry .periodic-element[data-z="'+metal.z+'"]');
   await tile.waitFor({state:'visible'});
   assert.equal(await tile.getAttribute('data-availability'),'available',metal.name+' permaneceu desabilitado');
   await tile.click();
   const dialog=page.locator('#silm-objects-dialog');
   await dialog.waitFor({state:'visible'});
   const catalog=dialog.locator('.silm-object-catalog');
   assert.equal(await catalog.locator('.silm-workshop-card').count(),0,'Objetos reais indevidos em '+metal.name);
   assert.match(await catalog.innerText(),/hipótese geométrica derivada de raios estimados/i);
   assert.match(await catalog.innerText(),/não uma estrutura medida ou otimizada por DFT/i);
   await catalog.getByRole('button',{name:'Investigar estrutura cristalina de '+metal.name}).click();
   await dialog.waitFor({state:'hidden'});
   await page.waitForFunction(z=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===z,metal.z);
   await page.waitForFunction(()=>{
    const s=window.SILMIntegration?.snapshot?.();
    return s?.structure?.mode==='crystalline'&&s?.metadata?.workshop?.scale===3;
   });
   const state=await page.evaluate(()=>window.SILMIntegration.snapshot());
   assert.equal(state.structure.crystallography.structureType,'BCC');
   assert.equal(state.structure.referenceStructureId,'lr-bcc-empirical-2003');
   assert.equal(state.module.active,'explorar');
   assert.ok(state.structure.units.length>=2,'Célula insuficiente '+metal.name);
   const info=await page.evaluate(z=>{
    const e=SILM.data.get(z),s=SILM.data.structure(e);
    return {crystal:SILM.crystal.eligibility(e).status,
     evidence:SILM.data.structureEvidence(e).type,
     method:SILM.data.structureEvidence(e).method,
     a:s.latticeParameters.a.value,
     props:Object.values(SILM.properties.eligibility(e)).map(x=>x.status)};
   },metal.z);
   assert.equal(info.crystal,'available');
   assert.equal(info.evidence,'computed');
   assert.equal(info.method,'empirical-geometric');
   assert.equal(info.a,metal.a);
   assert.notEqual(await page.locator('#silm-object-entry .periodic-element[data-z="105"]').getAttribute('data-availability'),'available','Db não deveria ser habilitado');
   assert.ok(info.props.every(s=>s==='unavailable'),'Propriedades indevidas em '+metal.name);
   await page.locator('.silm-workshop-scale[data-scale="4"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===4);
   await page.locator('.silm-workshop-scale[data-scale="3"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===3);
   await page.screenshot({path:join(folder,metal.symbol+'-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'});
   assert.deepEqual(errors,[],metal.name+' '+screen+': erros inesperados');
  }finally{await context.close();}
 }
}finally{await browser.close();}
