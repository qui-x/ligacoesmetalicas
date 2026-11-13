// Navegação end-to-end dos três metais estruturais na Tabela Periódica.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','ga-in-u',browserName);mkdirSync(dir,{recursive:true});
const metals=[
 {z:31,symbol:'ga',name:'Gálio',type:'ORTHORHOMBIC',count:8,reference:'ga-reference'},
 {z:49,symbol:'in',name:'Índio',type:'TETRAGONAL',count:2,reference:'in-reference'},
 {z:92,symbol:'u',name:'Urânio',type:'ORTHORHOMBIC',count:4,reference:'u-reference'}
];
const browser=await pw[browserName].launch({headless:true});
try{
 for(const metal of metals)for(const [viewportName,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina indisponível');
   const cell=page.locator('#silm-object-entry .periodic-element[data-z="'+metal.z+'"]');
   await cell.waitFor({state:'visible'});
   assert.equal(await cell.getAttribute('data-availability'),'available',metal.name+' ainda bloqueado');
   await cell.click();
   const dialog=page.locator('#silm-objects-dialog');
   await dialog.waitFor({state:'visible'});
   const catalog=dialog.locator('.silm-object-catalog');
   await catalog.getByRole('button',{name:'Investigar estrutura cristalina de '+metal.name}).click();
   await dialog.waitFor({state:'hidden'});
   await page.waitForFunction(z=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===z,metal.z);
   await page.waitForFunction(()=>{
    const state=window.SILMIntegration?.snapshot?.();
    return state?.structure?.mode==='crystalline'&&state?.metadata?.workshop?.scale===3;
   });
   const state=await page.evaluate(()=>window.SILMIntegration.snapshot());
   assert.equal(state.structure.crystallography.structureType,metal.type);
   assert.equal(state.structure.referenceStructureId,metal.reference);
   assert.equal(state.module.active,'explorar');
   assert.ok(state.structure.units.length>=metal.count,'Célula insuficiente: '+metal.name);
   const p=await page.evaluate(z=>{
    const e=SILM.data.get(z);
    return {crystal:SILM.crystal.eligibility(e).status,
      properties:Object.fromEntries(Object.entries(SILM.properties.eligibility(e)).map(([k,v])=>[k,v.status])),
      evidence:SILM.data.structureEvidence(e).type};
   },metal.z);
   assert.equal(p.crystal,'available');
   assert.equal(p.evidence,'experimental');
   assert.ok(Object.values(p.properties).every(value=>value==='unavailable'),'Propriedade indevida '+metal.name);
   await page.locator('.silm-workshop-scale[data-scale="4"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===4);
   await page.locator('.silm-workshop-scale[data-scale="3"]').click();
   await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metadata?.workshop?.scale===3);
   await page.screenshot({path:join(dir,metal.symbol+'-'+viewportName+'.jpg'),type:'jpeg',quality:83,animations:'disabled'});
   assert.deepEqual(errors,[],metal.name+' '+viewportName+': erros na interface');
  }finally{await context.close();}
 }
}finally{await browser.close();}
