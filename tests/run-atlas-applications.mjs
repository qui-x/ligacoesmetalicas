import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),playwright=require(process.env.PLAYWRIGHT_MODULE);
const name=process.env.BROWSER_NAME||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8765';
const browser=await playwright[name].launch({headless:true});
const cases=[
 {z:79,symbol:'au',name:'Ouro',micro:false},
 {z:3,symbol:'li',name:'Lítio',micro:true},
 {z:26,symbol:'fe',name:'Ferro',micro:true},
 {z:95,symbol:'am',name:'Amerício',micro:false}
];
async function check(v){
 for(const item of cases){
  const context=await browser.newContext({viewport:v});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Página inicial não abriu');
   await page.waitForFunction(()=>!!window.SILM?.metalAtlas?.validate() && !!window.SILM?.workshop?.valid() && !document.querySelector('#silm-workshop-context')?.hidden,undefined,{timeout:45000});
   assert.equal(await page.evaluate(()=>window.SILM.metalAtlas.entries.length),65);
   await page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'}).click();
   await page.locator('#silm-periodic-dialog').waitFor({state:'visible'});
   await page.locator('#silm-periodic-dialog [data-z="'+item.z+'"]').click();
   await page.locator('#silm-periodic-dialog [id$="-explore"]').click();
   const card=page.locator('.silm-workshop-card[data-reference-id="atlas-'+item.symbol+'"]');
   await card.waitFor({state:'visible',timeout:20000});
   const preview=card.locator('img');
   await preview.scrollIntoViewIfNeeded();
   assert.match(await preview.getAttribute('src'),new RegExp('assets/metal-atlas/cotidiano/'+item.symbol+'-cotidiano\\.webp$'));
   await page.waitForFunction(sym=>{const i=document.querySelector('[data-reference-id="atlas-'+sym+'"] img');return i?.complete&&i.naturalWidth===960;},item.symbol,{timeout:15000});
   await card.getByRole('button',{name:'Investigar componente'}).click();
   await page.waitForFunction(z=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===z,item.z,{timeout:30000});
   const figure=page.locator('.silm-workshop-reference .silm-workshop-atlas-photo img');
   await figure.waitFor({state:'visible',timeout:20000});
   await figure.scrollIntoViewIfNeeded();
   assert.equal(await figure.evaluate(i=>i.naturalWidth),960,item.symbol+' não carrega após investigação');
   assert.match(await figure.getAttribute('alt'),/Ilustração tecnológica/);
   assert.match(await page.locator('.silm-workshop-reference').textContent(),/Ilustração gerada por IA/);
   if(item.micro){
    await page.locator('.silm-workshop-scale').nth(1).click();
    const model=page.locator('.silm-workshop-micro-atlas-reference');
    await model.waitFor({state:'attached'});
    await model.locator('summary').click();
    const image=model.locator('img');
    await image.waitFor({state:'visible'});
    assert.match(await image.getAttribute('alt'),/sem escala/);
    await page.waitForFunction(sym=>{const i=document.querySelector('.silm-workshop-micro-atlas-reference img');return i?.complete&&i.naturalWidth>0;},item.symbol,{timeout:15000});
   }
   assert.deepEqual(errors,[],'Erro de execução: '+item.symbol);
   console.log('ATLAS_OK',name,v.width+'x'+v.height,item.symbol,'imagem carregada');
  }finally{await context.close();}
 }
}
try{await check({width:1280,height:850});await check({width:390,height:844});}
finally{await browser.close();}
