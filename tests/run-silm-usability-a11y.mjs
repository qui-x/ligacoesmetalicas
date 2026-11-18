// SILM — ensaio transversal de utilidade, acessibilidade e leitura científica.
// Usa interfaces e ações reais em contexto descartável; não escreve no repositório.
// Relatórios em reports/usability/<browser>; violações sérias são publicadas mesmo fora do gate inicial.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const runtime=process.env.PLAYWRIGHT_MODULE||'playwright';
const pw=require(runtime);
const axePackage=require(process.env.PLAYWRIGHT_MODULE?
 join(process.env.PLAYWRIGHT_MODULE,'..','@axe-core/playwright'):'@axe-core/playwright');
const AxeBuilder=axePackage.default||axePackage;
const browserName=process.env.BROWSER_NAME||'chromium';
const url=(process.env.BASE_URL||'http://127.0.0.1:8765')+'/index.html';
const root=join('reports','usability',browserName);
await mkdir(root,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
const results=[],accessibility=[],errors=[];
let context=null,page=null;
const short=e=>String(e?.message||e).replace(/\s+/g,' ').slice(0,480);
const record=async(id,fn)=>{
 const start=Date.now();
 try{const details=await fn();const item={id,status:'passed',ms:Date.now()-start,details};
  results.push(item);console.log('USABILITY_CASE '+JSON.stringify(item));}
 catch(error){const item={id,status:'failed',ms:Date.now()-start,reason:short(error)};
  results.push(item);console.log('USABILITY_CASE '+JSON.stringify(item));}
};
const visit=async name=>{
 await page.evaluate(r=>{location.hash='#/'+r;},name);
 await page.waitForFunction(r=>{const view=document.querySelector('[data-view="'+r+'"]');return !!view&&!view.hidden;},name);
};
const take=async id=>page.screenshot({path:join(root,id+'.png'),animations:'disabled'});
async function auditAxe(id){
 const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 const rows=report.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,
  count:v.nodes.length,targets:v.nodes.slice(0,5).map(n=>n.target.join(' ')),helpUrl:v.helpUrl}));
 accessibility.push({id,url:page.url(),violations:rows,incomplete:report.incomplete.length,
  checked:report.passes.length});
 const critical=rows.filter(v=>v.impact==='critical'),serious=rows.filter(v=>v.impact==='serious');
 console.log('USABILITY_AXE '+JSON.stringify({id,critical:critical.length,serious:serious.length,total:rows.length}));
 if(critical.length)throw Error('Violação crítica WCAG: '+critical.map(v=>v.id).join(', '));
 if(process.env.A11Y_STRICT==='true'&&serious.length)
  throw Error('Violações sérias WCAG (modo estrito): '+serious.map(v=>v.id).join(', '));
 return {critical:0,serious:serious.length,total:rows.length,incomplete:report.incomplete.length};
}
async function viewport(name,width,height){
 await context?.close();
 context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
 page=await context.newPage();
 page.on('pageerror',err=>errors.push({viewport:name,message:String(err.message)}));
 const response=await page.goto(url+'#/inicio',{waitUntil:'domcontentloaded',timeout:45000});
 assert.ok(response?.ok(),'Página inicial não carregou');
 await page.waitForFunction(()=>typeof window.SILMIntegration?.snapshot==='function',{},{timeout:20000});
}
async function noOverflow(name,width){
 const stats=await page.evaluate(()=>({screen:innerWidth,scroll:document.documentElement.scrollWidth,
  main:document.querySelector('#conteudo')?.getBoundingClientRect().width||0}));
 assert.ok(stats.scroll<=width+6,name+': rolagem horizontal global: '+JSON.stringify(stats));
 return stats;
}
async function selectCopper(){
 await visit('ambiente');
 await page.locator('#silm-object-entry .periodic-element[data-z="29"]').click();
 const modal=page.locator('#silm-objects-dialog');
 await modal.waitFor({state:'visible'});
 const launch=modal.locator('[data-reference-id="atlas-cu"]').getByRole('button',{name:'Iniciar montagem'});
 await launch.click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===29);
}
try{
 for(const size of [
  {id:'desktop-1440',width:1440,height:900},
  {id:'mobile-390',width:390,height:844},
  {id:'mobile-320',width:320,height:568},
  {id:'tablet-768',width:768,height:1024}
 ]){
  const {id,width,height}=size;
  await record(id+'.boot',async()=>{await viewport(id,width,height);return {width,height};});
  if(!page)continue;
  await record(id+'.home-axe',()=>auditAxe(id+'.inicio'));
  await record(id+'.home-overflow',()=>noOverflow(id,width));
  await record(id+'.manual',async()=>{
   await visit('manual');
   const host=page.locator('#silm-manual');
   assert.ok((await host.innerText()).length>100,'Manual sem explicação');
   return {chars:(await host.innerText()).length};
  });
  if(['desktop-1440','mobile-390'].includes(id))
   await record(id+'.manual-axe',()=>auditAxe(id+'.manual'));
  await record(id+'.table-and-object',async()=>{
   await selectCopper();return {metal:(await page.evaluate(()=>SILMIntegration.snapshot())).metal};
  });
  await record(id+'.data-short-and-complete',async()=>{
   await page.locator('[data-open-dock="dados"]').click();
   const preview=page.locator('#silm-data-preview');
   await preview.locator('.silm-data-reading').first().waitFor({state:'visible'});
   const readings=preview.locator('.silm-data-reading');
   assert.equal(await readings.count(),5,'Resumo deve mostrar exatamente cinco propriedades');
   for(const reading of await readings.all()){
    assert.ok((await reading.locator('h5').innerText()).trim(),'Propriedade sem título');
    assert.ok((await reading.locator('.silm-data-reading-value').innerText()).trim(),'Valor ou ausência não explicada');
    assert.ok((await reading.locator('.silm-data-reading-origin').innerText()).trim(),'Origem não indicada');
    assert.ok((await reading.locator('.silm-data-reading-condition').innerText()).trim(),'Condição não indicada');
   }
   assert.match(await preview.innerText(),/Cobre/i);
   await page.locator('[data-silm-data-open="tabela"]').click();
   const details=page.locator('#silm-data .silm-data-complete');
   assert.equal(await details.count(),1);
   assert.equal(await details.evaluate(el=>el.open),false,'A documentação deve iniciar recolhida');
   await details.locator('summary').click();
   assert.match(await details.innerText(),/estrutura/i);
   assert.match(await details.innerText(),/Fontes e condições/i);
   const capture=await take(id+'-dados');
   return {readingCount:5,sourceDetailPresent:true,screenshot:!!capture};
  });
  await record(id+'.data-axe',()=>auditAxe(id+'.dados'));
  await record(id+'.data-overflow',()=>noOverflow(id,width));
  if(['desktop-1440','mobile-390'].includes(id)){
   await record(id+'.keyboard-navigation',async()=>{
    const back=page.locator('#silm-data-back');
    await back.focus();
    assert.equal(await back.evaluate(el=>document.activeElement===el),true,'Foco não chega ao retorno de Dados');
    await back.press('Enter');
    await page.locator('#silm-data-catalog').waitFor({state:'visible'});
    const action=page.locator('[data-silm-data-open="registros"]');
    await action.focus();await action.press('Enter');
    await page.locator('[data-silm-data-panel="registros"]').waitFor({state:'visible'});
    return {status:'teclado percorre ficha, catálogo e registros'};
   });
  }
  await record(id+'.resize-structure',async()=>{
   if(await page.locator('[data-open-dock="dados"]').getAttribute('aria-expanded')==='true')
    await page.locator('[data-close-dock="right"]').click();
   for(let scale=1;scale<=4;scale++){
    await page.locator('.silm-workshop-scale[data-scale="'+scale+'"]').click();
    await page.waitForFunction(s=>document.querySelector('#si-stage')?.dataset.workshopScale===String(s),scale);
   }
   return {scales:4,...await noOverflow(id,width)};
  });
  await context.close();context=null;page=null;
 }
}finally{
 const summary={browser:browserName,sha:process.env.AUDIT_SHA||null,
  passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,
  axeScans:accessibility.length,axeViolations:accessibility.reduce((n,x)=>n+x.violations.length,0),
  serious:accessibility.reduce((n,x)=>n+x.violations.filter(v=>v.impact==='serious').length,0),
  critical:accessibility.reduce((n,x)=>n+x.violations.filter(v=>v.impact==='critical').length,0)};
 await writeFile(join(root,'report.json'),JSON.stringify({summary,results,accessibility,errors},null,2)+'\n');
 const escape=s=>String(s).replace(/\|/g,'\\|').replace(/\n/g,' ');
 const markdown=['# SILM — Usabilidade e acessibilidade ('+browserName+')','',
  '| Indicador | Resultado |','|---|---:|',
  '| Passaram | '+summary.passed+' |','| Falharam | '+summary.failed+' |',
  '| Telas examinadas pelo axe | '+summary.axeScans+' |',
  '| Regras com violações | '+summary.axeViolations+' |',
  '| Impacto crítico | '+summary.critical+' |','| Impacto sério | '+summary.serious+' |','',
  '## Casos automatizados','',
  '| Caso | Estado | Observação |','|---|---|---|',
  ...results.map(r=>'| '+escape(r.id)+' | '+r.status+' | '+escape(r.reason||'—')+' |'),'',
  '## Escopo e limites','',
  'Testes de navegador, sem pessoas reais. A ausência de violações axe não certifica WCAG nem usabilidade em leitores de tela.',
  'Violações sérias são registradas; A11Y_STRICT=true também as bloqueia. Testes de dispositivos físicos, Libras, VO/TalkBack e uso pedagógico requerem homologação humana.',
  'Ver report.json para cada alvo CSS e referência WCAG.',''];
 await writeFile(join(root,'report.md'),markdown.join('\n'));
 console.log('USABILITY_SUMMARY '+JSON.stringify(summary));
 try{await context?.close()}finally{await browser.close()}
 if(summary.failed||errors.length)process.exitCode=1;
}