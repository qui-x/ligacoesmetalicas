/* QA visual da jukebox, em Chromium real contra HTTP local do repo.
   Rodar de jazz-club/web (onde Playwright está instalado). */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';

const root=resolve('../..');
const server=spawn('python3',['-m','http.server','4179','--bind','127.0.0.1'],
 {cwd:root,stdio:['ignore','pipe','pipe']});
server.stderr.on('data',part=>process.stderr.write(part));
const dest=resolve('qa-artifacts');
await mkdir(dest,{recursive:true});
let browser;
try{
 let started=false;
 for(let i=0;i<65;i++){
   try{const r=await fetch('http://127.0.0.1:4179/jazz-club/index.html');
     if(r.ok){started=true;break}}catch{}
   if(server.exitCode!==null)throw Error('HTTP server falhou');
   await new Promise(r=>setTimeout(r,380));
 }
 assert(started,'HTTP server indisponível');
 browser=await chromium.launch({headless:true,
   args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1380,height:870}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4179/jazz-club/index.html',
   {waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('#jukebox-toggle').click();
 await page.waitForFunction(()=>document.querySelectorAll('#jukebox-list li').length===30,
   undefined,{timeout:20000});
 assert.equal(await page.locator('#jukebox-drawer').getAttribute('hidden'),null);
 const labels=await page.locator('#jukebox-list li').allTextContents();
 assert(labels[0].includes('O Baile dos Elétrons'));
 assert(labels.at(-1).includes('Grande Orquestra'));
 await page.locator('#jukebox-filter').fill('Gadolínio');
 assert.equal(await page.locator('#jukebox-list li').count(),1);
 await page.locator('#jukebox-filter').fill('');
 await page.locator('#jukebox-list button[data-track="2"]').click();
 await page.waitForFunction(()=>document.querySelector('#jukebox-current-title').textContent.includes('Corrente no Cabaré'),
  undefined,{timeout:15000});
 assert.equal(await page.locator('#bpm-output').textContent(),'138 BPM');
 const music=await page.locator('#audio-player').evaluate(x=>x.currentSrc||x.src);
 assert(music.endsWith('02_Corrente_no_Cabare_v02.mp3'));
 await page.locator('#jukebox-volume').fill('45');
 assert.equal(await page.locator('#audio-player').evaluate(x=>x.volume),.45);
 await page.screenshot({path:resolve(dest,'jazz-jukebox-1925-desktop.png')});
 await page.locator('#jukebox-close').click();
 assert(await page.locator('#jukebox-drawer').isHidden());
 const mobile=await browser.newPage({viewport:{width:390,height:844},
   deviceScaleFactor:1,reducedMotion:'reduce',hasTouch:true,isMobile:true});
 mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto('http://127.0.0.1:4179/jazz-club/index.html',{waitUntil:'domcontentloaded'});
 await mobile.locator('#jukebox-toggle').click();
 await mobile.waitForFunction(()=>document.querySelectorAll('#jukebox-list li').length===30,
   undefined,{timeout:20000});
 const dims=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 assert(dims.scroll<=dims.width+5,'Jukebox excede a largura mobile');
 await mobile.screenshot({path:resolve(dest,'jazz-jukebox-1925-mobile.png')});
 assert.deepEqual(errors,[],'Erros JS de pagina');
 console.log('JUKEBOX_BROWSER_PASS',JSON.stringify({tracks:labels.length,music,dims}));
}finally{
 if(browser)await browser.close();
 server.kill('SIGTERM');
}
