'use strict';
/* Kit compartilhado dos testes de navegador do SILM: abre contextos, opera a interface e registra resultados.
   Cada série acrescenta sua suíte em tests/suites/; o executor (tests/browser.cjs) roda todas como regressão. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {serve,launch,root}=require('./support.cjs');
const KEY='simcore_domain_silm_v1_scientific.state';
function createKit({version,only=null}){
 const evidence=path.join(root,'docs/evidence-'+version),shots=path.join(evidence,'capturas');fs.mkdirSync(shots,{recursive:true});
 const results=[],consoleErrors=[];let browser=null,server=null,base='',current='';
 const kit={assert,KEY,version,results,consoleErrors,get base(){return base;},evidence,shots};
 kit.start=async()=>{server=await serve();base=server.url;browser=await launch();};
 kit.stop=async()=>{await browser?.close();server?.server.close();};
 kit.open=async({width=1366,height=800,mobile=false,reducedMotion='no-preference',seed=null,serviceWorkers='block',storage=null}={})=>{
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,reducedMotion,serviceWorkers,locale:'pt-BR'});
  await context.addInitScript(([seed,key,extra])=>{try{localStorage.setItem('simcore_domain_silm_v1_abertura','false');if(!sessionStorage.getItem('silm-seeded')){if(seed)localStorage.setItem(key,JSON.stringify(seed));for(const [k,v]of Object.entries(extra||{}))localStorage.setItem(k,JSON.stringify(v));sessionStorage.setItem('silm-seeded','1');}}catch(_){}},[seed,KEY,storage]);
  const page=await context.newPage();
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push({test:current,text:m.text()});});page.on('pageerror',e=>consoleErrors.push({test:current,text:e.message}));
  return {context,page};
 };
 kit.test=async(id,name,fn)=>{
  if(only&&!only.some(prefix=>id.startsWith(prefix)))return;
  current=id;const start=Date.now(),contexts=[];
  const use=async options=>{const c=await kit.open(options);contexts.push(c.context);return c.page;};
  try{const details=await fn(use);results.push({id,name,status:'PASS',details:details||null,durationMs:Date.now()-start});console.log('PASS',id,name);}
  catch(error){results.push({id,name,status:'FAIL',details:String(error.stack||error).slice(0,1800),durationMs:Date.now()-start});console.log('FAIL',id,name,'\n',error);}
  finally{for(const c of contexts)await c.close().catch(()=>{});}
 };
 /* ---------- auxiliares da interface ---------- */
 const h=kit;
 h.state=page=>page.evaluate(()=>SILM.scientificState);
 h.stored=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 h.units=async page=>(await h.state(page)).structure?.units||[];
 h.shot=async(page,name,options={})=>{await page.waitForTimeout(300);return page.screenshot({path:path.join(shots,name+'.png'),...options});};
 h.ready=page=>page.waitForFunction(()=>window.SILM?.scientificState!==undefined&&SimCore.domain.current?.active);
 h.go=async(page,route='laboratorio')=>{await page.goto(base+'#/'+route);await h.ready(page);};
 h.investigate=async(page,symbol='Cu')=>{await h.go(page);await page.click(`.silm-periodic .periodic-element[data-symbol="${symbol}"]`);await page.click('.silm-periodic [id$="-investigate"]');await page.waitForSelector('#silm-start-assembly');};
 h.assemble=async(page,n=0)=>{await page.click('#silm-start-assembly');await page.waitForSelector('#silm-assembly-add');for(let i=0;i<n;i++)await page.click('#silm-assembly-add');};
 h.reload=async page=>{await page.reload();await h.ready(page);await page.waitForTimeout(400);assert.equal(await page.locator('dialog.app-dialog').count(),0,'Nenhum diálogo de retomada');};
 h.dialog=page=>page.locator('dialog.app-dialog[open]');
 h.answer=async(page,label)=>{const d=h.dialog(page);await d.waitFor();await d.locator('.dialog-actions button',{hasText:label}).click();await page.waitForFunction(()=>!document.querySelector('dialog.app-dialog'));await page.evaluate(()=>new Promise(r=>setTimeout(r,50)));};
 h.openLeft=async(page,tab='Estrutura')=>{
  if(await page.locator('#controls').getAttribute('aria-hidden')==='true')await page.click('#workspace-left');
  const t=page.locator('#dock-left-tabs button',{hasText:tab});if(await t.count()&&await t.getAttribute('aria-pressed')!=='true')await t.click();
 };
 h.closeLeft=async page=>{if(await page.locator('#controls').getAttribute('aria-hidden')!=='true')await page.click('#close-left');};
 h.openRight=async(page,source='ver',tab=null)=>{
  const launcher=source==='dados'?'#workspace-right-alt':'#workspace-right';
  const open=await page.locator('#context-panel').getAttribute('aria-hidden')!=='true',current=await page.evaluate(()=>SimCore.workspace.source);
  if(!open||current!==source)await page.click(launcher);
  if(tab){const t=page.locator('#dock-right-tabs button',{hasText:tab});if(await t.count()&&await t.getAttribute('aria-pressed')!=='true')await t.click();}
 };
 h.closeRight=async page=>{if(await page.locator('#context-panel').getAttribute('aria-hidden')!=='true')await page.click('#close-right');};
 h.switchModule=async(page,id)=>{
  await h.openLeft(page,'Módulo');const head=page.locator('#module-head-'+id);if(await head.getAttribute('aria-expanded')!=='true')await head.click();
  await page.click('#module-select-'+id);await page.waitForFunction(id=>SILM.scientificState.module.active===id,id);await h.closeLeft(page);
 };
 h.point=async(page,x,y)=>{const b=await page.locator('#silm-assembly-stage').boundingBox();return {x:b.x+x*b.width,y:b.y+y*b.height};};
 h.center=async(page,id)=>{const b=await page.locator(`.silm-unit[data-unit-id="${id}"]`).boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2};};
 h.drag=async(page,from,to,{shot:name}={})=>{await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move((from.x+to.x)/2,(from.y+to.y)/2,{steps:6});await page.mouse.move(to.x,to.y,{steps:6});if(name)await h.shot(page,name);await page.mouse.up();};
 h.freeSpot=page=>page.evaluate(()=>{const A=SILM.assembly,u=SILM.scientificState.structure.units;for(const p of [{x:.15,y:.15},{x:.85,y:.15},{x:.15,y:.85},{x:.85,y:.85},{x:.5,y:.12},{x:.12,y:.5}])if(A.isFree(u,p))return p;return null;});
 h.overlapFree=list=>list.every((a,i)=>list.slice(i+1).every(b=>Math.hypot(a.position.x-b.position.x,a.position.y-b.position.y)>=0.1-1e-9));
 h.near=(a,b,tolerance=0.02)=>Math.abs(a.x-b.x)<=tolerance&&Math.abs(a.y-b.y)<=tolerance;
 h.feedback=page=>page.locator('#silm-assembly-feedback').textContent();
 /* Organiza a montagem atual (confirma o diálogo explicativo). */
 h.organize=async page=>{await page.click('#silm-assembly-organize');await h.answer(page,'Organizar estrutura');await page.waitForSelector('.silm-crystal');};
 h.crystal=async(page,symbol='Cu',n=4)=>{await h.investigate(page,symbol);await h.assemble(page,n);await h.organize(page);};
 kit.finish=()=>{
  const report={product:'SILM',version,date:new Date().toISOString(),browser:'Chromium (Playwright '+require('playwright/package.json').version+')',passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,results,consoleErrors};
  fs.writeFileSync(path.join(evidence,'RESULTADOS-NAVEGADOR-'+version+'.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`\n${report.passed} aprovados · ${report.failed} reprovados`);return report;
 };
 return kit;
}
module.exports={createKit};
