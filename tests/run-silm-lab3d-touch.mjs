'use strict';
/*
 * Smoke com toque em dispositivo móvel emulado Chromium.
 * Não substitui teste físico em Android/iOS: valida a sequência
 * de eventos touch e a ausência de ativação falsa após arrasto.
 */
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.PLAYWRIGHT_MODULE;
const pw=modulePath?await import(pathToFileURL(join(modulePath,'index.mjs')).href):await import('playwright');
const browser=await pw.chromium.launch({headless:true,
 args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await browser.newContext({viewport:{width:390,height:844},
 hasTouch:true,isMobile:true,deviceScaleFactor:1,reducedMotion:'reduce'});
const page=await ctx.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','lab3d-browser','chromium','touch');
await mkdir(dir,{recursive:true});
try{
 await page.goto(base+'/#/ambiente',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof window.SILMIntegration?.snapshot==='function',{timeout:25000});
 await page.locator('[data-open-dock="montagem"]').click();
 await page.locator("#silm-manual-start > summary").click();
 assert.equal(await page.locator("#silm-manual-start").evaluate(el=>el.open),true);
 await page.locator('#silm-metal').selectOption('29');
 await page.locator('#silm-start').click();
 await page.waitForFunction(()=>window.SILMIntegration.snapshot().metal?.atomicNumber===29);
 const dock=page.locator('[data-close-dock="left"]');
 if(await dock.isVisible())await dock.click();
 const before=JSON.stringify(await page.evaluate(()=>window.SILMIntegration.snapshot()));
 const entry=page.locator('.silm-lab3d-entry');
 await entry.click();
 const canvas=page.locator('.silm-lab3d canvas');
 await canvas.waitFor({state:'visible',timeout:15000});
 assert.equal(await page.locator('.silm-lab3d').getAttribute('data-specimen-surface'),'j2-plane-strain');
 const coordinate=async id=>page.evaluate(id=>{
  const c=document.querySelector('.silm-lab3d canvas'),r=c.getBoundingClientRect(),
    I=window.SILM.lab3dInstruments,t=I.targets.find(x=>x.id===id);
  const p=I.project([0,1.6,2.35],0,-.06,t.center,r.width,r.height);
  return {x:r.left+p.x,y:r.top+p.y,within:p.within};
 },id);
 const hit=async id=>{
  const p=await coordinate(id);
  assert.equal(p.within,true,'Instrumento fora da câmera: '+id);
  await page.touchscreen.tap(p.x,p.y);
  assert.equal(await page.locator('.silm-lab3d').getAttribute('data-selected-instrument'),id,
   'Toque não selecionou '+id);
  assert.equal(await page.locator('.silm-lab3d-instrument-panel').isVisible(),true);
 };
 await hit('press');
 const precise=page.locator('[data-control="load"]');
 assert.equal(await precise.getAttribute('type'),'number','Ajuste fino deve ser numérico, não slider.');
 const dev=await ctx.newCDPSession(page);
 const pressPoint=await coordinate('press');
 await dev.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pressPoint.x,y:pressPoint.y,id:11}]});
 for(let i=1;i<=4;i++)await dev.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:pressPoint.x,y:pressPoint.y-i*15,id:11}]});
 await dev.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForFunction(()=>Number(document.querySelector('.silm-lab3d')?.dataset.specimenLoad)>0,undefined,{timeout:10000});
 const solvedLoad=Number(await page.locator('.silm-lab3d').getAttribute('data-specimen-load'));
 assert.ok(solvedLoad>0,'Arrastar a prensa por toque deve atualizar o solver J2.');
 await precise.fill('0.2');
 assert.equal(await page.locator('.silm-lab3d').getAttribute('data-specimen-load'),'0.2',
  'A entrada numérica alternativa não alterou a resposta J2.');
 await page.locator('[data-lab-action="instrument-close"]').tap();
 assert.equal(await page.locator('.silm-lab3d-instrument-panel').isVisible(),false);
 await hit('heater');
 await page.locator('[data-lab-action="heater-toggle"]').tap();
 assert.equal(await page.locator('[data-lab-action="heat"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-lab-action="instrument-close"]').tap();
 await page.screenshot({path:join(dir,'touch-instruments.png')});
 const snapshot=await page.screenshot();
 const c=await canvas.boundingBox(),x=c.x+c.width*.62,y=c.y+c.height*.49;
 await dev.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 for(let i=1;i<=4;i++){
  await dev.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[
   {x:x+i*17,y:y-i*4,id:1}]});
 }
 await dev.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForTimeout(180);
 const rotated=await page.screenshot({path:join(dir,'touch-camera-rotated.png')});
 assert.ok(!snapshot.equals(rotated),
  'Arrastar em toque precisa mover a câmera, sem exigir mouse.');
 assert.equal(await page.locator('.silm-lab3d-instrument-panel').isVisible(),false,
  'Arrasto de câmera não pode ser confundido com toque em instrumento.');
 await page.locator('[data-lab-action="close"]').tap();
 await page.locator('.silm-lab3d').waitFor({state:'detached'});
 const after=JSON.stringify(await page.evaluate(()=>window.SILMIntegration.snapshot()));
 assert.equal(after,before,'Toques alteraram o estado científico original.');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'LAB3D_TOUCH_EMULATED_OK',viewport:'390x844',
  pressed:'press',heater:true,drag:'camera-only',backend:'webgl'}));
}finally{await ctx.close();await browser.close();}
