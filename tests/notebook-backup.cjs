'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {serve,launch}=require('./support.cjs');
(async()=>{const {server,url}=await serve(),browser=await launch();try{
 const ctx=await browser.newContext(),p=await ctx.newPage();await p.goto(url+'#/ambiente');await p.waitForFunction(()=>window.SILMIntegration);
 await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-start').click();
 await p.evaluate(()=>location.hash='#/relatorios');await p.locator('#report-name').fill('Teste de transporte');await p.locator('#report-observations').fill('Relatório completo preservado em outro navegador.');await p.locator('#route-report-notebook').click();
 await p.evaluate(()=>location.hash='#/caderno');const download=p.waitForEvent('download');await p.locator('#notebook-export-json').click();const file=await download,bytes=fs.readFileSync(await file.path());assert.equal(JSON.parse(bytes).format,'silm-notebook-v2');
 const other=await browser.newContext(),q=await other.newPage();await q.goto(url+'#/caderno');await q.locator('#notebook-import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:bytes});await q.locator('#si-modal-confirm').click();await q.locator('.silm-notebook-entry a[href^="#/relatorios?arquivo="]').click();assert.equal(await q.locator('#report-name').inputValue(),'Teste de transporte');assert.equal(await q.locator('#report-observations').inputValue(),'Relatório completo preservado em outro navegador.');
 const tab=await ctx.newPage();await tab.goto(url);await tab.waitForFunction(()=>window.SILMIntegration);await tab.evaluate(()=>BaseDemoSI.storage.write('representation.view',JSON.stringify({zoom:2})));await p.locator('#si-storage-conflict').waitFor();assert.equal(await p.evaluate(()=>BaseDemoSI.storage.write('scientific.state','{}')),false);
 await other.close();await ctx.close();console.log('PASS: backup completo em navegador vazio e bloqueio de aba obsoleta.');
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
