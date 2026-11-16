// Complemento da auditoria: integridade adversa, Caderno e ciclos de Professor.
// Rodar em Chromium com contexto isolado e registrar PASS/FAIL por contrato.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const pw=process.env.PLAYWRIGHT_MODULE?
 await import(pathToFileURL(join(process.env.PLAYWRIGHT_MODULE,'index.mjs')).href):
 await import('playwright');
const browser=await pw.chromium.launch({headless:true});
const base=process.env.BASE_URL||'http://127.0.0.1:8765',
 dest=join('reports','full-audit','chromium','adversarial');
await mkdir(dest,{recursive:true});
const results=[];
const record=async(id,fn)=>{try{const detail=await fn();results.push({id,status:'passed',detail});
 console.log('AUDIT_STRESS '+JSON.stringify(results.at(-1)));}
 catch(e){results.push({id,status:'failed',reason:String(e.message||e).slice(0,360)});
 console.log('AUDIT_STRESS '+JSON.stringify(results.at(-1)));}};
const open=async(p,route='ambiente')=>{
 await p.goto(base+'/index.html#/'+route,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>typeof SILMIntegration?.snapshot==='function',undefined,{timeout:25000});
};
const startFreeCu=async p=>{
 await p.locator('[data-open-dock="montagem"]').click();
 const details=p.locator('#silm-manual-start');
 if(!await details.evaluate(e=>e.open))await details.locator('summary').click();
 await p.locator('#silm-metal').selectOption('29');
 await p.locator('#silm-start').click();
 await p.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===29);
};
const go=async(p,route)=>{await p.evaluate(r=>{location.hash='#/'+r},route);
 await p.waitForFunction(r=>{const el=document.querySelector('[data-view="'+r+'"]');return !!el&&!el.hidden;},route)};
try{
 await record('storage.failed-scientific-write-rolls-back',async()=>{
  const ctx=await browser.newContext({viewport:{width:1280,height:800}}),p=await ctx.newPage();
  try{
   await open(p);await startFreeCu(p);
   const add=p.locator('#silm-add');await add.waitFor({state:'visible'});
   await add.click();
   const before=await p.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
   const n=JSON.parse(before).structure.units.length;
   const persisted=await p.evaluate(()=>localStorage.getItem('silm-base-integration:documents-v1'));
   assert.ok(persisted?.length>100);
   await p.evaluate(()=>{
    window.__silmOriginalStorageSetItem=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){
     if(k==='silm-base-integration:documents-v1')throw new DOMException('Quota exceeded','QuotaExceededError');
     return window.__silmOriginalStorageSetItem.call(this,k,v);
    };
   });
   await add.click();await p.waitForTimeout(150);
   const after=await p.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
   const storedAfter=await p.evaluate(()=>localStorage.getItem('silm-base-integration:documents-v1'));
   await p.evaluate(()=>{Storage.prototype.setItem=window.__silmOriginalStorageSetItem});
   assert.equal(after,before,'O modelo em memória ficou divergente após escrita recusada');
   assert.equal(storedAfter,persisted,'Uma tentativa recusada modificou documento persistido');
   return {units:n,rollback:true,persistedDocumentsUnchanged:true};
  }finally{await ctx.close();}
 });
 await record('storage.two-tabs-detect-conflict',async()=>{
  const ctx=await browser.newContext({viewport:{width:1280,height:800}});
  const a=await ctx.newPage(),b=await ctx.newPage();
  try{
   await open(a);await open(b);
   const early=await b.locator('#si-storage-conflict').count();
   if(!early){await startFreeCu(a);}
   await b.waitForSelector('#si-storage-conflict',{state:'visible',timeout:10000});
   const conflict=await b.locator('#si-storage-conflict').innerText();
   const inert=await b.locator('.app-shell').evaluate(el=>el.inert);
   assert.equal(inert,true,'A aba antiga permaneceu editável');
   assert.match(conflict,/recarregados|bloqueada/i);
   return {lockedStaleTab:inert,text:conflict.slice(0,180)};
  }finally{await ctx.close();}
 });
 await record('notebook.real-add-export-import',async()=>{
  const origin=await browser.newContext({acceptDownloads:true}),a=await origin.newPage();
  let exportData;
  try{
   await open(a,'caderno');
   await a.locator('.silm-notebook-compose > summary').click();
   await a.locator('#notebook-title').fill('Auditoria SILM 2026');
   await a.locator('#notebook-text').fill('Registro de teste de preservação de dados do Caderno.');
   await a.locator('#notebook-add').click();
   assert.match(await a.locator('.silm-notebook-entries').innerText(),/Auditoria SILM 2026/);
   const dlPromise=a.waitForEvent('download');
   await a.locator('#notebook-export-json').click();
   const dl=await dlPromise;
   const path=await dl.path();exportData=await (await import('node:fs/promises')).readFile(path,'utf8');
   const doc=JSON.parse(exportData);
   assert.equal(doc.format,'silm-notebook-v2');
   assert.equal(doc.document.notes.length,1);
   assert.ok(Object.hasOwn(doc,'reports'));
  }finally{await origin.close();}
  const destCtx=await browser.newContext({acceptDownloads:true}),b=await destCtx.newPage();
  try{
   await open(b,'caderno');
   await b.locator('#notebook-import').setInputFiles({
    name:'SILM-caderno.json',mimeType:'application/json',buffer:Buffer.from(exportData)
   });
   const confirm=b.getByRole('button',{name:'Restaurar',exact:true});
   await confirm.waitFor({state:'visible',timeout:10000});
   await confirm.click();
   await b.waitForFunction(()=>document.querySelector('.silm-notebook-entries')?.textContent?.includes('Auditoria SILM 2026'),undefined,{timeout:10000});
   return {format:'silm-notebook-v2',restored:true,size:exportData.length};
  }finally{await destCtx.close();}
 });
 await record('teacher.generate-and-library',async()=>{
  const ctx=await browser.newContext({viewport:{width:1280,height:820}}),p=await ctx.newPage();
  try{
   await open(p,'professor');
   await p.locator('#silm-teacher-form').waitFor({state:'visible'});
   const type=await p.locator('#teacher-type').inputValue();
   const items=await p.locator('#teacher-item option').count();
   assert.ok(items>=1,'Professor sem atividades');
   await p.locator('#teacher-title-input').fill('Auditoria da atividade docente');
   await p.locator('#teacher-submit').click();
   await p.waitForTimeout(150);
   const link=await p.locator('#teacher-link').inputValue().catch(()=>null);
   const library=await p.locator('#teacher-library').innerText();
   const err=await p.locator('#teacher-error').innerText().catch(()=>null);
   assert.ok(library.includes('Auditoria da atividade docente'),
    'Atividade não entrou na biblioteca; '+String(err).slice(0,160));
   return {type,items,libraryChars:library.length,studentLink:link?.slice(0,150)||null};
  }finally{await ctx.close();}
 });
 await record('report.modes-and-print-controls',async()=>{
  const ctx=await browser.newContext({viewport:{width:1280,height:800}}),p=await ctx.newPage();
  try{
   await open(p);await startFreeCu(p);await go(p,'relatorios');
   const result=await p.evaluate(()=>{
    const section=document.querySelector('[data-view="relatorios"]');
    return {text:section?.innerText.slice(0,1500),
     actions:[...section.querySelectorAll('button')].filter(e=>e.getClientRects().length).map(e=>e.textContent.trim()),
     inputs:[...section.querySelectorAll('input,textarea,select')].map(e=>({id:e.id,type:e.type}))};
   });
   assert.ok(result.text?.length>100);
   return result;
  }finally{await ctx.close();}
 });
 await record('offline.real-reload-after-sw',async()=>{
  const ctx=await browser.newContext({serviceWorkers:'allow'}),p=await ctx.newPage();
  try{
   await open(p,'inicio');
   await p.evaluate(()=>navigator.serviceWorker?.ready);
   await p.waitForFunction(()=>navigator.serviceWorker?.controller!==null,undefined,{timeout:15000});
   await ctx.setOffline(true);
   await p.reload({waitUntil:'domcontentloaded',timeout:18000});
   await p.waitForFunction(()=>typeof SILMIntegration?.snapshot==='function',undefined,{timeout:20000});
   assert.ok(await p.locator('h1').count());
   return {offlineReload:true,title:await p.title()};
  }finally{await ctx.close();}
 });
}finally{
 const summary={passed:results.filter(x=>x.status==='passed').length,
 failed:results.filter(x=>x.status==='failed').length,total:results.length};
 await writeFile(join(dest,'adversarial.json'),JSON.stringify({summary,results},null,2)+'\n');
 console.log('AUDIT_STRESS_SUMMARY '+JSON.stringify(summary));
 await browser.close();
 if(summary.failed)process.exitCode=1;
}
