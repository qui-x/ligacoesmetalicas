// Exploração de actinídeos pesados habilitados somente para investigação estrutural.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const folder=join('reports','cm-bk-cf-es',browserName);
mkdirSync(folder,{recursive:true});
const metals=[
 {z:96,symbol:'cm',name:'Cúrio',type:'DHCP',ref:'cm-reference',count:4},
 {z:97,symbol:'bk',name:'Berquélio',type:'DHCP',ref:'bk-reference',count:4},
 {z:98,symbol:'cf',name:'Califórnio',type:'DHCP',ref:'cf-reference',count:4},
 {z:99,symbol:'es',name:'Einstênio',type:'FCC',ref:'es-reference',count:4}
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
   assert.equal(await tile.getAttribute('data-availability'),'available',metal.name+' está bloqueado');
   await tile.click();
   const dialog=page.locator('#silm-objects-dialog');
   await dialog.waitFor({state:'visible'});
   const catalog=dialog.locator('.silm-object-catalog');
   assert.equal(await catalog.locator('.silm-workshop-card').count(),0,'Objetos cotidianos falsos para '+metal.name);
   await catalog.getByRole('button',{name:'Investigar estrutura cristalina de '+metal.name}).click();
   await dialog.waitFor({state:'hidden'});
   await page.waitForFunction(z=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===z,metal.z);
   await page.waitForFunction(()=>{
    const s=window.SILMIntegration?.snapshot?.();
    return s?.structure?.mode==='crystalline'&&s?.metadata?.workshop?.scale===3;
   });
   const state=await page.evaluate(()=>window.SILMIntegration.snapshot());
   assert.equal(state.structure.crystallography.structureType,metal.type);
   assert.equal(state.structure.referenceStructureId,metal.ref);
   assert.equal(state.module.active,'explorar');
   assert.ok(state.structure.units.length>=metal.count,'Sítios insuficientes: '+metal.name);
   const info=await page.evaluate(z=>{
    const e=SILM.data.get(z);
    return {crystal:SILM.crystal.eligibility(e).status,
      evidence:SILM.data.structureEvidence(e).type,
      statuses:Object.values(SILM.properties.eligibility(e)).map(p=>p.status)};
   },metal.z);
   assert.equal(info.crystal,'available');
   assert.equal(info.evidence,'experimental');
   assert.ok(info.statuses.every(s=>s==='unavailable'),'Propriedade indevida em '+metal.name);
   await page.locator('.silm-workshop-scale[data-scale="4"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===4);
   await page.locator('.silm-workshop-scale[data-scale="3"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===3);
   await page.screenshot({path:join(folder,metal.symbol+'-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'});
   assert.deepEqual(errors,[],metal.name+' '+screen+': erros no browser');
  }finally{await context.close();}
 }
}finally{await browser.close();}
