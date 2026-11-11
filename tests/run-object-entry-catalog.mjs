// Parte 9: Tabela na escala Objeto -> catálogo modal -> investigação real.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','catalogo-objetos',browserName);
mkdirSync(dir,{recursive:true});
const reports=[];
const browser=await playwright[browserName].launch({headless:true});
const errors=[];
let page;
const snap=()=>page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
const note=(tag,value)=>reports.push({tag,...value});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'SILM não carregou');
 await page.waitForFunction(()=>window.SILM?.workshop?.valid()&&!document.querySelector('#silm-workshop-context')?.hidden);
 assert.equal(await page.locator('#silm-object-entry .periodic-element').count(),118,
  'A escala Objeto não começa com a Tabela Periódica de 118 elementos');
 assert.equal(await page.locator('#silm-object-entry .silm-workshop-card').count(),0,
  'Objetos foram exibidos antes de escolher um metal');
 const initially=await snap();
 for(const [label,width,height] of [['mobile-320',320,568],['mobile-390',390,844],['desktop',1366,768]]){
  await page.setViewportSize({width,height});
  await page.waitForTimeout(90);
  const dims=await page.locator('#silm-object-entry').evaluate(n=>{
   const frame=n.getBoundingClientRect(),grid=n.querySelector('.periodic-scroll');
   const r=grid.getBoundingClientRect();
   return {width:frame.width,left:frame.left,right:frame.right,scrollWidth:grid.scrollWidth,
    scrollClient:grid.clientWidth,scrollHeight:grid.scrollHeight,
    gridClient:grid.clientHeight,pageWidth:document.documentElement.scrollWidth};
  });
  assert.ok(dims.left>=-4&&dims.right<=width+4,label+': a Tabela extrapola a janela');
  assert.ok(dims.pageWidth<=width+6,label+': rolagem horizontal global');
  if(width<900)assert.ok(dims.scrollWidth>dims.scrollClient,
   label+': tabela sem rolagem horizontal interna no celular');
  // Em desktop os 18 grupos podem caber integralmente: rolagem não é obrigatória.
  note('table-'+label,dims);
  if(width<=390)await page.screenshot({path:join(dir,label+'-tabela-inicial.jpg'),type:'jpeg',quality:72,animations:'disabled'});
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('#silm-object-entry .periodic-element[data-z="29"]').click();
 const modal=page.locator('#silm-objects-dialog');
 await modal.waitFor({state:'visible'});
 assert.equal(await modal.locator('.silm-workshop-card').count(),3,
  'Cobre deveria oferecer as referências do atlas, motor e latão');
 assert.equal(await modal.locator('.silm-workshop-card[data-reference-id="atlas-cu"]').count(),1);
 assert.equal(await snap(),initially,'Abrir objetos alterou investigação');
 const bounds=await modal.evaluate(n=>{
  const b=n.getBoundingClientRect();return{
   width:b.width,height:b.height,viewport:innerWidth,
   scrollWidth:document.documentElement.scrollWidth,
   cardCount:n.querySelectorAll('.silm-workshop-card').length};
 });
 assert.ok(bounds.width<=390+2&&bounds.height<=844+2,'Modal não é responsivo');
 await page.screenshot({path:join(dir,'cobre-catalogo-modal.jpg'),type:'jpeg',quality:72,animations:'disabled'});
 await page.keyboard.press('Escape');
 await modal.waitFor({state:'hidden'});
 assert.equal(await snap(),initially,'Cancelar catálogo alterou estado científico');
 await page.locator('#silm-object-entry .periodic-element[data-z="29"]').click();
 await modal.waitFor({state:'visible'});
 await modal.locator('[data-reference-id="atlas-cu"]').getByRole('button',{name:'Investigar objeto'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===29);
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId==='atlas-cu');
 assert.equal(await page.locator('#si-stage').getAttribute('data-workshop-scale'),'1');
 const scientificBefore=await page.evaluate(()=>{
  const st=SILMIntegration.snapshot();return JSON.stringify({
   atomicNumber:st.metal.atomicNumber,investigation:st.investigation.id,structure:st.structure,
   properties:st.properties,measurements:st.measurements,calculations:st.calculations
  });
 });
 await page.locator('.silm-workshop-browse-objects').click();
 await modal.waitFor({state:'visible'});
 await modal.locator('[data-reference-id="cobre-latao"]').getByRole('button',{name:'Investigar objeto'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId==='cobre-latao');
 const scientificAfter=await page.evaluate(()=>{
  const st=SILMIntegration.snapshot();return JSON.stringify({
   atomicNumber:st.metal.atomicNumber,investigation:st.investigation.id,structure:st.structure,
   properties:st.properties,measurements:st.measurements,calculations:st.calculations
  });
 });
 assert.equal(scientificAfter,scientificBefore,'Trocar aplicação do mesmo metal mudou a ciência');
 // Abrir novamente a Tabela no palco NÃO substitui a investigação.
 const prior=await snap();
 await page.locator('.silm-workshop-reference-summary').getByRole('button',{name:'Tabela Periódica'}).click();
 await page.locator('#silm-object-entry .periodic-element[data-z="26"]').waitFor({state:'visible'});
 assert.equal(await snap(),prior,'Consultar Tabela substituiu a investigação');
 await page.locator('#silm-object-entry .periodic-element[data-z="26"]').click();
 await modal.waitFor({state:'visible'});
 assert.ok(await modal.locator('[data-reference-id="atlas-fe"]').count()===1,
  'Ferro não oferece o objeto do atlas');
 assert.equal(await snap(),prior,'Inspecionar objetos de outro metal mudou a investigação');
 await modal.locator('[data-reference-id="atlas-fe"]').getByRole('button',{name:'Investigar objeto'}).click();
 await page.locator('#si-modal-confirm').waitFor({state:'visible'});
 await page.locator('#si-modal-cancel').click();
 await modal.waitFor({state:'visible'});
 assert.equal(await snap(),prior,'Cancelar troca de metal alterou a investigação');
 await modal.locator('[data-reference-id="atlas-fe"]').getByRole('button',{name:'Investigar objeto'}).click();
 await page.locator('#si-modal-confirm').click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===26);
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId==='atlas-fe');
 await modal.waitFor({state:'hidden'});
 assert.equal(await page.locator('#si-stage').getAttribute('data-workshop-scale'),'1');
 // As quatro escalas seguem disponíveis sem tabela/modal duplicados.
 assert.equal(await page.locator('.silm-workshop-scale').count(),4);
 assert.equal(await page.locator('#silm-objects-dialog').count(),1);
 assert.deepEqual(errors,[],'Erros de console: '+JSON.stringify(errors));
 note('end',{metal:26,reference:'atlas-fe',noErrors:true});
 await ctx.close();
}catch(e){
 reports.push({error:String(e),stack:e.stack});
 throw e;
}finally{
 writeFileSync(join(dir,'metricas.json'),JSON.stringify(reports,null,2));
 await browser.close();
}
