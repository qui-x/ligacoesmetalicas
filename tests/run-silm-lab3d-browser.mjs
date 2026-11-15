'use strict';
/* E2E da sala na investigação verdadeira; nunca cria estado científico paralelo. */
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const name=process.env.BROWSER_NAME||'chromium';
const modulePath=process.env.PLAYWRIGHT_MODULE;
const pw=modulePath?await import(pathToFileURL(join(modulePath,'index.mjs')).href):await import('playwright');
const browserType=pw[name];
if(!browserType)throw new Error('Navegador desconhecido: '+name);
const browser=await browserType.launch({headless:true,
 args:name==='chromium'?['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[]});
const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
const page=await context.newPage(),pageErrors=[];
page.on('pageerror',error=>pageErrors.push(error.message));
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','lab3d-browser',name);
await mkdir(dir,{recursive:true});
try{
 await page.goto(base+'/#/ambiente',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof window.SILMIntegration?.snapshot==='function',{timeout:25000});
 const entry=page.locator('.silm-lab3d-entry');
 await entry.waitFor({state:'attached'});
 assert.equal(await page.evaluate(()=>window.SILMIntegration.snapshot().metal),null);
 await page.locator('[data-open-dock="montagem"]').click();
 await page.locator('#silm-metal').selectOption('29');
 await page.locator('#silm-start').click();
 await page.waitForFunction(()=>window.SILMIntegration.snapshot().metal?.atomicNumber===29);
 const closeDock=page.locator('[data-close-dock="left"]');
 if(await closeDock.isVisible())await closeDock.click();
 const before=await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot()));
 const available=await page.evaluate(()=>!!document.createElement('canvas').getContext('webgl2'));
 await entry.click();
 if(available){
  const canvas=page.locator('.silm-lab3d canvas');
  await canvas.waitFor({state:'visible',timeout:10000});
  await page.waitForFunction(()=>document.querySelector('.silm-lab3d canvas')?.width>100);
  await page.screenshot({path:join(dir,'lab3d-open.png'),fullPage:false});
  await page.locator('[data-lab-action="heat"]').click();
  assert.equal(await page.locator('[data-lab-action="heat"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-lab-action="current"]').click();
  assert.equal(await page.locator('[data-lab-action="current"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-lab-action="more"]').click();
  const reading=await page.locator('.silm-lab3d-status').textContent();
  assert.ok(/J2|converg|amostra/i.test(reading),reading);
  await page.locator('[data-lab-action="inspect"]').click();
  await page.locator('[data-lab-action="close"]').click();
  await page.locator('.silm-lab3d').waitFor({state:'detached'});
  assert.equal(await entry.evaluate(e=>document.activeElement===e),true);
 }else{
  assert.equal(await page.locator('.silm-lab3d').count(),0);
  await page.screenshot({path:join(dir,'fallback-2d.png')});
 }
 const after=await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot()));
 assert.equal(after,before,'A sala alterou o estado científico.');
 assert.deepEqual(pageErrors,[],'Erros JavaScript durante o fluxo: '+pageErrors.join(' | '));
 console.log(JSON.stringify({browser:name,webgl2:available,status:available?'LAB3D_SMOKE_OK':'SAFE_FALLBACK_OK'}));
}finally{await context.close();await browser.close();}
