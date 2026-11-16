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
 const backend=await page.evaluate(()=>{const c=document.createElement('canvas');return c.getContext('webgl2')?'webgl2':c.getContext('webgl')?'webgl1':'none'});
 const available=backend!=='none';
 await entry.click();
 if(available){
  const canvas=page.locator('.silm-lab3d canvas');
  await canvas.waitFor({state:'visible',timeout:10000});
  await page.waitForFunction(()=>document.querySelector('.silm-lab3d canvas')?.width>100);
  await page.screenshot({path:join(dir,'lab3d-open.png'),fullPage:false});
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-coupled-model'),'equivalent-1d');
  await page.locator('[data-lab-action="heat"]').click();
  assert.equal(await page.locator('[data-lab-action="heat"]').getAttribute('aria-pressed'),'true');
  assert.equal(Number(await page.locator('.silm-lab3d').getAttribute('data-coupled-power')),0,
   'Calor externo isolado não pode gerar potência Joule.');
  assert.ok(Number(await page.locator('.silm-lab3d').getAttribute('data-coupled-external'))>0);
  await page.locator('[data-lab-action="current"]').click();
  assert.equal(await page.locator('[data-lab-action="current"]').getAttribute('aria-pressed'),'true');
  assert.ok(Number(await page.locator('.silm-lab3d').getAttribute('data-coupled-power'))>0,
   'Corrente precisa produzir dissipação Joule pelo motor existente.');
  assert.ok(Number(await page.locator('.silm-lab3d').getAttribute('data-coupled-joule'))>0);
  assert.match(await page.locator('.silm-lab3d-coupled-status').textContent(),/Rede eletrotérmica 1D relativa/);
  const neutralProbe=await page.locator('.silm-lab3d').getAttribute('data-specimen-probe');
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-specimen-surface'),'j2-plane-strain');
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-specimen-segments'),'18');
  await page.locator('[data-lab-action="more"]').click();
  const loadedProbe=await page.locator('.silm-lab3d').getAttribute('data-specimen-probe');
  assert.notEqual(loadedProbe,neutralProbe,'O campo J2 não alterou a malha superficial.');
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-specimen-load'),'0.2');
  const map=page.locator('#silm-lab3d-map-kind');
  await map.selectOption('vonMises');
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-field-map'),'vonMises');
  const validCount=Number(await page.locator('.silm-lab3d').getAttribute('data-map-available'));
  assert.ok(validCount>0,'Mapas mecânicos precisam ter regiões com dados do J2.');
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-map-source'),'j2-plane-strain');
  assert.ok(await page.locator('.silm-lab3d-map-legend').isVisible());
  assert.match(await page.locator('.silm-lab3d-map-legend').textContent(),/unidades relativas/);
  await page.screenshot({path:join(dir,'lab3d-von-mises.png'),fullPage:false});
  await map.selectOption('hydrostaticMean');
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-field-map'),'hydrostaticMean');
  await map.selectOption('plasticIndicator');
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-field-map'),'plasticIndicator');
  await map.selectOption('appearance');
  assert.equal(await page.locator('.silm-lab3d-map-legend').isVisible(),false);
  await map.selectOption('plasticIndicator');
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-field-map'),'plasticIndicator');
  const reading=await page.locator('.silm-lab3d-status').textContent();
  assert.ok(/J2|converg|amostra|plástica/i.test(reading),reading);
  await page.locator('[data-lab-action="inspect"]').click();
  const scale=page.locator('#silm-workshop-context .silm-workshop-scale[data-scale="2"]');
  assert.ok(await scale.count(),'A microestrutura deve estar presente no fluxo multiescala.');
  assert.equal(await scale.isDisabled(),false,'A escala de grãos precisa estar habilitada.');
  {
   await page.locator('[data-lab-action="micro"]').click();
   await page.locator('.silm-lab3d').waitFor({state:'detached'});
   const returning=page.locator('.silm-lab3d-return');
   await returning.waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('#silm-workshop-context .silm-workshop-scale[data-scale="2"]')?.getAttribute('aria-pressed')==='true');
   await returning.click();
   await page.locator('.silm-lab3d canvas').waitFor({state:'visible'});
   assert.equal(await page.locator('.silm-lab3d').getAttribute('data-specimen-load'),'0.2');
   assert.equal(await page.locator('.silm-lab3d').getAttribute('data-field-map'),'plasticIndicator');
   assert.equal(await page.locator('[data-lab-action="heat"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('[data-lab-action="current"]').getAttribute('aria-pressed'),'true');
   assert.ok(Number(await page.locator('.silm-lab3d').getAttribute('data-coupled-joule'))>0,
    'Retorno do microscópio precisa recuperar o mesmo histórico Joule.');
   assert.equal(await returning.isVisible(),false);
  }
  await page.locator('[data-lab-action="close"]').click();
  await page.locator('.silm-lab3d').waitFor({state:'detached'});
  assert.equal(await page.evaluate(()=>{
   const focused=document.activeElement,entry=document.querySelector('.silm-lab3d-entry');
   const scale=document.querySelector('#silm-workshop-context .silm-workshop-scale[aria-pressed="true"]');
   return focused===entry&&!!entry?.getClientRects().length||
    focused===scale&&!!scale?.getClientRects().length;
  }),true,'O foco deve retornar a um controle visível após fechar a sala.');
 }else{
  assert.equal(await page.locator('.silm-lab3d').count(),0);
  await page.screenshot({path:join(dir,'fallback-2d.png')});
 }
 const after=await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot()));
 // A travessia de escala registra somente metadata.workshop (estado oficial
 // da navegação de objeto/grãos); não autoriza alterar física ou propriedades.
 const scienceOnly=serialized=>{
  const state=JSON.parse(serialized);
  if(state.metadata)delete state.metadata.workshop;
  return JSON.stringify(state);
 };
 assert.equal(scienceOnly(after),scienceOnly(before),
  'A sala alterou o estado científico além do contexto legítimo de escala.');
 assert.deepEqual(pageErrors,[],'Erros JavaScript durante o fluxo: '+pageErrors.join(' | '));
 console.log(JSON.stringify({browser:name,backend,microscopeRoundTrip:available,status:available?'LAB3D_SMOKE_OK':'SAFE_FALLBACK_OK'}));
}finally{await context.close();await browser.close();}
