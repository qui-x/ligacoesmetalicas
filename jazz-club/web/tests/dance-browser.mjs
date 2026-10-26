/** Real Babylon dance-floor browser smoke test. Run after npm run build. */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
await mkdir(resolve('qa-artifacts'),{recursive:true});
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4175','--strictPort'],
  {cwd:process.cwd(),stdio:['ignore','pipe','pipe']});
server.stdout.on('data',x=>process.stdout.write(x));
server.stderr.on('data',x=>process.stderr.write(x));
let browser;
try{
 let started=false;
 for(let i=0;i<70;i++){
   try{const r=await fetch('http://127.0.0.1:4175/dance.html');if(r.ok){started=true;break}}catch{}
   if(server.exitCode!==null)throw Error('Preview server failed');
   await new Promise(r=>setTimeout(r,300));
 }
 assert(started,'Preview server timed out');
 browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-angle=swiftshader',
   '--enable-unsafe-swiftshader','--no-sandbox']});
 const desktop=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];
 desktop.on('pageerror',e=>errors.push(e.message));
 await desktop.goto('http://127.0.0.1:4175/dance.html?qa=1');
 await desktop.waitForFunction(()=>window.__danceQa?.snapshot().ready === true,undefined,{timeout:90000});
 const first=await desktop.evaluate(()=>window.__danceQa.snapshot());
 assert.equal(first.cast,3);assert(first.meshCount>50);
 await desktop.waitForTimeout(1200);
 const after=await desktop.evaluate(()=>window.__danceQa.snapshot());
 assert(after.beat>first.beat,'Dance clock has stopped');
 assert(after.dancers.some((p,i)=>Math.hypot(p.x-first.dancers[i].x,p.z-first.dancers[i].z)>.001),'Dancers not moving');
 for(const form of ['pares','roda','linha','troca','trio']){
   await desktop.locator('#formation').selectOption(form);
   await desktop.waitForFunction(f=>window.__danceQa?.snapshot().formation===f,form,{timeout:12000});
 }
 await desktop.locator('#formation').selectOption('pares');
 await desktop.waitForTimeout(500);
 await desktop.screenshot({path:resolve('qa-artifacts','jazz-dance-desktop.png')});
 await desktop.locator('#transport').click();
 const pause=await desktop.evaluate(()=>window.__danceQa.snapshot().beat);
 await desktop.waitForTimeout(600);
 assert(Math.abs((await desktop.evaluate(()=>window.__danceQa.snapshot().beat))-pause)<.1,'Pause did not stop clock');
 // JSON music cues are local and parsed without uploading audio or connecting external APIs.
 await desktop.locator('#cues-file').setInputFiles({
   name:'cue-test.json',mimeType:'application/json',
   buffer:Buffer.from(JSON.stringify({title:'Faixa de teste',bpm:132,events:[{time:0,energy:.5}]}))
 });
 assert.equal(await desktop.locator('#bpm').inputValue(),'132');
 const mobile=await browser.newPage({viewport:{width:390,height:844},
   reducedMotion:'reduce',deviceScaleFactor:1,isMobile:true,hasTouch:true});
 mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto('http://127.0.0.1:4175/dance.html?qa=1');
 await mobile.waitForFunction(()=>window.__danceQa?.snapshot().ready===true,undefined,{timeout:90000});
 const m=await mobile.evaluate(()=>({qa:window.__danceQa.snapshot(),
   width:document.documentElement.scrollWidth,available:innerWidth}));
 assert(m.qa.reduced,'Reduced-motion default was ignored');
 assert(m.width<=m.available+5,'Mobile horizontal overflow');
 await mobile.screenshot({path:resolve('qa-artifacts','jazz-dance-mobile.png')});
 await mobile.close();
 assert.deepEqual(errors,[]);
 console.log('JAZZ_DANCE_BROWSER_PASS',JSON.stringify({first,after,form:'pares',mobile:m}));
}finally{
 if(browser)await browser.close();
 server.kill('SIGTERM');
}
