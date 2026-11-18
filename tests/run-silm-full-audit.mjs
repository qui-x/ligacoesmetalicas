// AUDITORIA transversal do SILM — navega na build de main em navegador REAL.
// Uso: BASE_URL=http://127.0.0.1:8765 BROWSER_NAME=chromium node tests/run-silm-full-audit.mjs
// Não modifica estado do repositório; usa um contexto de navegador descartável.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const browserName=process.env.BROWSER_NAME||'chromium';
const modulePath=process.env.PLAYWRIGHT_MODULE;
const pw=modulePath?await import(pathToFileURL(join(modulePath,'index.mjs')).href):
 await import('playwright');
const browser=await pw[browserName].launch({headless:true,
 ...(browserName==='chromium'?{args:['--enable-webgl','--use-gl=angle',
  '--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});
const reportDir=join('reports','full-audit',browserName);
await mkdir(reportDir,{recursive:true});
const ctx=await browser.newContext({viewport:{width:1365,height:850},
 reducedMotion:'reduce',acceptDownloads:true});
const page=await ctx.newPage();
const cases=[],runtimeErrors=[],consoleErrors=[],failedRequests=[];
page.on('pageerror',e=>runtimeErrors.push(String(e.message)));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text().slice(0,260));});
page.on('requestfailed',r=>failedRequests.push({url:r.url().slice(-170),reason:r.failure()?.errorText}));
function short(e){return String(e?.message||e).slice(0,360).replace(/\s+/g,' ');}
async function check(id,fn){
 const started=Date.now();
 try{const details=await fn();const item={id,status:'passed',ms:Date.now()-started,
  ...(details===undefined?{}:{details})};cases.push(item);console.log('AUDIT_CASE '+JSON.stringify(item));}
 catch(e){const item={id,status:'failed',ms:Date.now()-started,reason:short(e)};
  cases.push(item);console.log('AUDIT_CASE '+JSON.stringify(item));}
}
async function go(route){
 await page.evaluate(r=>{location.hash='#/'+r},route);
 await page.waitForFunction(r=>{const view=document.querySelector('[data-view="'+r+'"]');
  return !!view&&!view.hidden;},route,{timeout:14000});
 await page.waitForTimeout(90);
}
async function visible(selector){return await page.locator(selector).first().isVisible();}
async function screenshot(name){await page.screenshot({path:join(reportDir,name+'.png'),fullPage:false});}
async function snapshot(){return await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));}
function countFailed(){return cases.filter(x=>x.status==='failed').length;}
const mainRoutes=['inicio','aprender','missoes','roteiros','montagens','manual',
 'caderno','professor','relatorios','configuracoes','sobre','ambiente'];
const name=browserName;
try{
 await check('boot.initialization',async()=>{
  const response=await page.goto((process.env.BASE_URL||'http://127.0.0.1:8765')+
   '/index.html#/inicio',{waitUntil:'domcontentloaded',timeout:45000});
  assert.ok(response?.ok(),'HTTP de inicialização inválido');
  await page.waitForFunction(()=>typeof window.SILMIntegration?.snapshot==='function'&&
   Array.isArray(window.SILM?.data?.elements),undefined,{timeout:30000});
  assert.equal(await page.locator('html').getAttribute('lang'),'pt-BR');
  return {title:await page.title(),url:page.url()};
 });
 await check('catalog.metals-and-research',async()=>{
  return await page.evaluate(()=>{
   const D=SILM.data,rows=D.elements,metals=rows.filter(e=>e.classification.metallic);
   const active=rows.filter(e=>e.silmEligibility.status==='available');
   const index=SILM.scienceEvidenceIndex,keys=index?.keys||[];
   const coverage=Object.fromEntries(keys.map(k=>[k,{
    traceableMetals:metals.filter(m=>index.summary(m.atomicNumber)[k]?.traceable>0).length,
    anyEvidenceMetals:metals.filter(m=>index.summary(m.atomicNumber)[k]?.total>0).length,
    pendingMetals:metals.filter(m=>index.summary(m.atomicNumber)[k]?.pending>0).length}]));
   const allFive=metals.filter(m=>keys.length===5&&keys.every(k=>
    index.summary(m.atomicNumber)[k]?.traceable>0));
   const newCatalog=SILM.science400Reference;
   const catalogStage117=newCatalog?{
    schema:newCatalog.schema,
    metals:newCatalog.metadata.audit.metals,
    slots:newCatalog.slots.length,
    numeric:newCatalog.metadata.audit.numeric,
    withURL:newCatalog.metadata.audit.withURL,
    displayed:newCatalog.slots.filter(x=>x.displayEligible).length,
    alternatives:newCatalog.metadata.audit.alternatives,
    engineRelease:newCatalog.engineRelease,
    calibrationApproved:newCatalog.calibrationApproved
   }:null;
   const structures=Object.fromEntries([...new Set(metals.map(e=>
    D.structure(e)?.type||'sem estrutura'))].map(k=>[k,metals.filter(e=>
    (D.structure(e)?.type||'sem estrutura')===k).length]));
   return {periodicElements:rows.length,metallic:metals.length,active:active.length,
    nonInvestigable:rows.length-active.length,atlas:SILM.metalAtlas.entries.length,
    manualTopics:SILM.manual.topics.length,
    themes:SILM.themes.registry.length,missions:SILM.missions.registry.length,
    routes:SILM.routes.registry.length,presets:SILM.readyAssemblies?.catalog?.length??null,
    structureOnlyActive:active.filter(e=>e.silmEligibility.scope==='structure-only').length,
    fiveEvidenceCategories:keys,coverage,allFiveTraceable:allFive.length,
    catalogStage117,
    evidenceRows:index?.rows?.length||0,evidenceIsNotMotorCalibration:index?.evidenceIsNotMotorCalibration,
    structures};
  });
 });
 for(const route of mainRoutes)await check('route.'+route,async()=>{
  await go(route);
  const info=await page.evaluate(r=>{
   const el=document.querySelector('[data-view="'+r+'"]');
   const hs=[...el.querySelectorAll('h1,h2')].filter(n=>n.getClientRects().length)
    .map(n=>n.textContent.trim()).filter(Boolean);
   const imgs=[...el.querySelectorAll('img')].filter(x=>x.getClientRects().length);
   return {heading:hs.slice(0,5),chars:el.innerText.length,
    buttons:[...el.querySelectorAll('button')].filter(x=>x.getClientRects().length).length,
    links:[...el.querySelectorAll('a')].filter(x=>x.getClientRects().length).length,
    images:imgs.length,brokenImages:imgs.filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src).slice(0,5)};
  },route);
  assert.ok(info.chars>18,'Tela vazia ou sem conteúdo');
  assert.equal(info.brokenImages.length,0,'Há imagens visíveis quebradas');
  await screenshot('route-'+route);
  return info;
 });
 await check('manual.search-and-help',async()=>{
  await go('manual');
  const state=await page.evaluate(()=>{
   const host=document.querySelector('#silm-manual');
   return {content:host?.innerText?.length||0,
    search:[...host.querySelectorAll('input')].map(x=>({id:x.id,type:x.type,placeholder:x.placeholder})),
    topics:SILM.manual.topics.length,
    links:[...host.querySelectorAll('a')].length};
  });
  assert.ok(state.content>50,'Manual sem conteúdo');
  assert.ok(state.topics>15,'Manual sem tópicos');
  return state;
 });
 await check('settings.theme-and-offline-controls',async()=>{
  await go('configuracoes');
  const t=page.locator('#theme-choice');
  await t.selectOption('escuro');
  assert.equal(await t.inputValue(),'escuro');
  await t.selectOption('claro');
  assert.equal(await t.inputValue(),'claro');
  await t.selectOption('sistema');
  const d=page.locator('#distribution-check');
  assert.ok(await d.isVisible());
  await d.click();
  await page.waitForTimeout(350);
  return {offlineStatus:(await page.locator('#distribution-status').innerText()).slice(0,270),
   theme:await t.inputValue(),
   serviceWorker:await page.evaluate(()=>!!navigator.serviceWorker?.controller)};
 });
 await check('home.accessibility-and-menu',async()=>{
  await go('inicio');
  const x=page.locator('#si-header-access');
  assert.ok(await x.isVisible());
  await x.click();
  const details=await page.evaluate(()=>({
   accessPanel:!!document.querySelector('#si-a11y-panel'),
   panelVisible:!!document.querySelector('#si-a11y-panel')?.getClientRects().length,
   skip:!!document.querySelector('a.skip[href="#conteudo"]'),
   menuLinks:document.querySelectorAll('#si-nav-main [data-route]').length
  }));
  await page.keyboard.press('Escape');
  if(await page.locator('#si-nav-close').isVisible())await page.locator('#si-nav-close').click();
  return details;
 });
 await check('assets.atlas-65-files',async()=>{
  return await page.evaluate(async()=>{
   const items=SILM.metalAtlas.entries;
   const checks=await Promise.all(items.map(async e=>{
    try{const r=await fetch(e.path,{method:'HEAD',cache:'no-store'});
     return {z:e.atomicNumber,code:r.status,ok:r.ok,path:e.path};}
    catch(err){return{z:e.atomicNumber,ok:false,error:String(err),path:e.path};}
   }));
   return {total:checks.length,ok:checks.filter(x=>x.ok).length,
    failed:checks.filter(x=>!x.ok)};
  });
 });
 await check('workshop.table-first-and-initial-state',async()=>{
  await go('ambiente');assert.equal(JSON.parse(await snapshot()).metal,null);
  await page.locator('[data-open-dock="montagem"]').click();
  assert.ok(await visible('#silm-open-periodic'));
  assert.equal(await page.locator('#silm-manual-start').evaluate(el=>el.open),false);
  await page.locator('#silm-open-periodic').click();
  const periodic=page.locator('#silm-object-entry [data-z]');
  const count=await periodic.count();
  assert.ok(count>=60,'Tabela de entrada sem elementos esperados');
  await page.locator('#silm-object-entry [data-z="29"]').click();
  const dialog=page.locator('#silm-objects-dialog');
  await dialog.waitFor({state:'visible'});
  const card=page.locator('.silm-workshop-card[data-reference-id="atlas-cu"]');
  assert.ok(await card.count());
  await screenshot('catalogo-cobre');
  await card.getByRole('button',{name:'Iniciar montagem'}).click();
  await page.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===29);
  const state=JSON.parse(await snapshot());
  assert.equal(state.metal.atomicNumber,29);
  assert.ok(state.structure?.units?.length>0);
  return {periodicButtons:count,metal:state.metal,mode:state.structure?.mode,
   units:state.structure?.units?.length,scale:await page.locator('#si-stage').getAttribute('data-workshop-scale')};
 });
 await check('workshop.multiscale-1-to-4',async()=>{
  const stages=[];
  for(let scale=1;scale<=4;scale++){
   const p=page.locator('.silm-workshop-scale').nth(scale-1);
   if(!await p.count())throw Error('Botão de escala '+scale+' ausente');
   await p.click();
   await page.waitForFunction(n=>document.querySelector('#si-stage')?.dataset.workshopScale===String(n),scale,{timeout:12000});
   const actual=await page.locator('#si-stage').getAttribute('data-workshop-scale');
   stages.push({scale,actual,sceneText:(await page.locator('#si-stage').innerText()).slice(0,160)});
   await screenshot('escala-'+scale);
  }
  return {stages};
 });
 await check('workshop.focus-overview-and-back',async()=>{
  await page.locator('[data-scene-view="overview"]').click();
  await page.waitForFunction(()=>document.querySelector('#si-workspace')?.dataset.viewMode==='overview');
  const overview=await page.locator('#silm-comparison-items').innerText();
  await screenshot('visao-geral');
  await page.locator('[data-scene-view="focus"]').click();
  assert.equal(await page.locator('#si-workspace').getAttribute('data-view-mode'),'focus');
  return {comparisonChars:overview.length};
 });
 await check('workshop.montagem-ver-dados',async()=>{
  // As três docas devem usar as duas áreas originais, não criar painéis paralelos.
  await page.locator('[data-open-dock="montagem"]').click();
  const montage=await page.locator('#si-dock-left').isVisible();
  await page.locator('[data-left-tab="modulo"]').click();
  const cards=await page.locator('#silm-module-cards').locator('details').count();
  await page.locator('[data-close-dock="left"]').click();
  await page.locator('[data-open-dock="ver"]').click();
  const ver=await page.locator('#si-dock-right').isVisible();
  const actions=await page.locator('#silm-direct-actionbar button').count();
  await page.locator('[data-close-dock="right"]').click();
  await page.locator('[data-open-dock="dados"]').click();
  const dados=await page.locator('#si-dock-right').isVisible();
  const menu=await page.locator('[data-silm-data-open]').allTextContents();
  await page.locator('[data-silm-data-open="tabela"]').click();
  const scientific=await page.locator('#silm-data').innerText();
  await screenshot('dados-cobre');
  assert.ok(scientific.includes('Estrutura')||scientific.includes('estrutura'));
  await page.locator('#silm-data-back').click();
  await page.locator('[data-silm-data-open="registros"]').click();
  const records=await page.locator('#silm-history').innerText();
  await page.locator('#silm-data-back').click();
  await page.locator('[data-silm-data-open="arquivo"]').click();
  const exportPresent=await page.locator('#silm-export').count();
  assert.equal(exportPresent,1);
  await page.locator('[data-close-dock="right"]').click();
  return {montage,ver,dados,moduleCards:cards,directActions:actions,
   dataMenu:menu,scientificChars:scientific.length,recordChars:records.length,exportPresent};
 });
 await check('workshop.module-explorar-medir-calcular',async()=>{
  const modules=['medir','calcular','explorar'];const results=[];
  await page.locator('[data-open-dock="montagem"]').click();
  await page.locator('[data-left-tab="modulo"]').click();
  for(const module of modules){
   const trigger=page.locator('#silm-module-cards details').filter({has:page.locator('summary')});
   const button=page.locator('#silm-module-activate-'+module);
   if(!await button.isVisible()){
    const d=button.locator('xpath=ancestor::details');
    if(await d.count())await d.locator('summary').click();
   }
   await button.click();
   await page.waitForFunction(mod=>SILMIntegration.snapshot().module.active===mod,module,{timeout:10000});
   results.push({module,active:await page.locator('#si-workspace').getAttribute('data-silm-module')});
  }
  await page.locator('[data-close-dock="left"]').click();
  return results;
 });
 await check('workshop.measure-calculate-and-data-history',async()=>{
  // Paridade SIAB: ação real → registro → módulo seguinte → consulta em Dados.
  const chooseModule=async name=>{
   await page.locator('[data-open-dock="montagem"]').click();
   await page.locator('[data-left-tab="modulo"]').click();
   const card=page.locator('.silm-module-card[data-module="'+name+'"]');
   if(!await card.evaluate(el=>el.open))await card.locator('summary').click();
   await page.locator('#silm-module-activate-'+name).click();
   await page.waitForFunction(n=>SILMIntegration.snapshot().module.active===n,name);
   await page.locator('[data-close-dock="left"]').click();
  };
  await page.locator('.silm-workshop-scale[data-scale="3"]').click();
  await page.waitForFunction(()=>document.querySelector('#si-stage')?.dataset.workshopScale==='3');
  const before=JSON.parse(await snapshot());
  await chooseModule('medir');
  await page.locator('[data-open-dock="ver"]').click();
  await page.locator('[data-silm-direct-tool="medir:coordination"]').click();
  const center=page.locator('#si-stage .silm-crystal-unit').first();
  assert.ok(await center.count(),'Cena da rede não oferece centros selecionáveis');
  await center.focus();await center.press('Enter');
  await page.waitForFunction(n=>SILMIntegration.snapshot().measurements.length===n+1,
   before.measurements.length,{timeout:10000});
  const measured=JSON.parse(await snapshot()).measurements.at(-1);
  assert.equal(measured.type,'coordination');
  assert.equal(measured.source.kind,'MODEL_MEASUREMENT');
  await page.locator('[data-close-dock="right"]').click();
  await chooseModule('calcular');
  await page.locator('[data-open-dock="ver"]').click();
  const formula=page.locator('[data-silm-direct-tool="calcular:effective-atoms-fcc"]');
  assert.equal(await formula.count(),1,'Fórmula geométrica CFC ausente do Calcular');
  await formula.click();
  await page.locator('#silm-tools').getByRole('button',{name:'Calcular',exact:true}).click();
  await page.waitForFunction(n=>SILMIntegration.snapshot().calculations.length===n+1,
   before.calculations.length,{timeout:10000});
  const calculated=JSON.parse(await snapshot()).calculations.at(-1);
  assert.equal(calculated.formulaId,'effective-atoms-fcc');
  assert.equal(calculated.provenance.kind,'CALCULATED');
  assert.equal(calculated.result.value,4,'Célula CFC deve conter 4 átomos efetivos');
  await page.locator('[data-close-dock="right"]').click();
  await page.locator('[data-open-dock="dados"]').click();
  await page.locator('[data-silm-data-open="registros"]').click();
  const history=await page.locator('#silm-history').innerText();
  assert.match(history,/coordenação/i,'Doca Dados não mostra a medição');
  assert.match(history,/número efetivo/i,'Doca Dados não mostra o cálculo');
  await screenshot('medir-calcular-dados-cobre');
  await page.locator('[data-close-dock="right"]').click();
  await chooseModule('explorar');
  return {measurement:{type:measured.type,value:measured.value,unit:measured.unit},
   calculation:{id:calculated.formulaId,value:calculated.result.value},historyChars:history.length};
 });
 await check('workshop.3d-option-and-probe',async()=>{
  const entry=page.locator('.silm-lab3d-entry');
  assert.ok(await entry.count(),'Entrada 3D ausente');
  const before=await snapshot();
  const canvasSupported=await page.evaluate(()=>{
   const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));
  });
  await entry.click();
  const scene=page.locator('.silm-lab3d');
  if(canvasSupported){
   await scene.waitFor({state:'visible',timeout:12000});
   const count=await page.locator('.silm-lab3d canvas').count();
   const model=await scene.getAttribute('data-coupled-model');
   await screenshot('sala-3d');
   await page.locator('[data-lab-action="close"]').click();
   const after=await snapshot();
   assert.equal(after,before,'Sala 3D alterou dados científicos ao abrir/fechar');
   return {backend:'webgl',canvas:count,model,savedStateEqual:after===before};
  }
  return {backend:'fallback',sceneText:(await page.locator('#si-stage').innerText()).slice(-130)};
 });
 await check('persist.reopen-same-tab',async()=>{
  const before=JSON.parse(await snapshot());
  await page.reload({waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>typeof window.SILMIntegration?.snapshot==='function',undefined,{timeout:25000});
  const after=JSON.parse(await snapshot());
  assert.equal(after.metal?.atomicNumber,before.metal?.atomicNumber,'Metal perdido ao atualizar');
  assert.deepEqual(after.structure,before.structure,'Estrutura mudou após atualização');
  assert.deepEqual(after.measurements,before.measurements,'Medições desapareceram após atualização');
  assert.deepEqual(after.calculations,before.calculations,'Cálculos desapareceram após atualização');
  return {metal:after.metal?.atomicNumber,units:after.structure?.units.length,
   measurements:after.measurements.length,calculations:after.calculations.length};
 });
 await check('mobile.390-layout-and-navigation',async()=>{
  await page.setViewportSize({width:390,height:844});
  await go('ambiente');
  const geometry=await page.evaluate(()=>({
   screen:innerWidth,scrollWidth:document.documentElement.scrollWidth,
   scene:document.querySelector('#si-stage')?.getBoundingClientRect().toJSON(),
   buttons:[...document.querySelectorAll('[data-open-dock]')].filter(x=>x.getClientRects().length)
    .map(x=>({label:x.textContent.trim(),width:x.getBoundingClientRect().width,
     height:x.getBoundingClientRect().height}))
  }));
  await screenshot('mobile-workshop');
  assert.ok(geometry.scrollWidth<=geometry.screen+5,'Overflow horizontal em 390 px');
  return geometry;
 });
 await check('output.full-pwa-manifest',async()=>{
  return await page.evaluate(async()=>{
   const link=document.querySelector('link[rel="manifest"]');
   if(!link)return {found:false};
   const response=await fetch(link.href);
   const manifest=await response.json();
   return {found:true,ok:response.ok,name:manifest.name,shortName:manifest.short_name,
    icons:manifest.icons?.length||0,display:manifest.display,
    serviceWorker:!!navigator.serviceWorker,controlling:!!navigator.serviceWorker?.controller};
  });
 });
 await check('errors.browser-observation',async()=>{
  const relevant=consoleErrors.filter(x=>!/(favicon|AudioContext|WebGL|unsupported)/i.test(x));
  return {pageErrors:runtimeErrors,consoleErrors:relevant.slice(0,25),
    requestFailures:failedRequests.slice(0,35)};
 });
}finally{
 const payload={schema:'silm.audit.functional.v1',
  browser:browserName,baseSha:process.env.AUDIT_SHA||null,
  date:new Date().toISOString(),summary:{checked:cases.length,
   passed:cases.filter(x=>x.status==='passed').length,
   failed:countFailed(),runtimeErrors:runtimeErrors.length},
  results:cases,errors:{runtimeErrors,consoleErrors:consoleErrors.slice(0,25),
   failedRequests:failedRequests.slice(0,35)}};
 await writeFile(join(reportDir,'audit.json'),JSON.stringify(payload,null,2)+'\n');
 console.log('AUDIT_SUMMARY '+JSON.stringify(payload.summary));
 try{await ctx.close();}finally{await browser.close();}
 if(payload.summary.failed>0)process.exitCode=1;
}
