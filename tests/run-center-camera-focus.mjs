// SILM Parte 9: câmera focal do Centro e foco de grãos, usando motor científico real.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const folder=join('reports','camera-focal',browserName);
mkdirSync(folder,{recursive:true});
const browser=await playwright[browserName].launch({headless:true});
let page;
const errors=[],evidence=[];
const snapshot=()=>page.evaluate(()=>SILMIntegration.snapshot());
const scientific=()=>page.evaluate(()=>{
 const s=SILMIntegration.snapshot();
 return JSON.stringify({metal:s.metal,properties:s.properties,electrons:s.electrons,
  measurements:s.measurements,calculations:s.calculations});
});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'SILM indisponível');
 await page.waitForFunction(()=>!!window.SILM?.lensController?.inspect&&
  !!document.querySelector('#silm-object-entry .periodic-element[data-z="29"]'));
 await page.locator('#silm-object-entry .periodic-element[data-z="29"]').click();
 await page.locator('#silm-objects-dialog').waitFor({state:'visible'});
 await page.locator('#silm-objects-dialog [data-reference-id="atlas-cu"]')
  .getByRole('button',{name:'Investigar objeto'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===29);
 const source=await scientific();

 // Objeto preserva a lupa existente, sem atribuir uma câmera 3D a uma fotografia.
 assert.equal(await page.locator('.silm-lens-layer').count(),1,
  'Objeto perdeu sua lente multiescala');

 await page.locator('.silm-workshop-scale[data-scale="2"]').click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
 const seed=await page.locator('.silm-workshop-micro-viewer').getAttribute('data-synthetic-seed');
 const grain=page.locator('.silm-micro-grain').first();
 await grain.focus();await grain.press('Enter');
 const selected=await page.locator('.silm-workshop-micro-map').getAttribute('data-selected-grain');
 await page.getByRole('button',{name:'Aproximar grão selecionado'}).click();
 assert.equal(await page.locator('.silm-workshop-micro-map').getAttribute('data-focused-grain'),selected,
  'Botão Focar não acompanhou o grão selecionado');
 assert.ok(Number(await page.locator('.silm-workshop-micro-map').getAttribute('data-zoom'))>=2,
  'Zoom do grão selecionado não ativou');
 assert.equal(await scientific(),source,'Foco do grão alterou o modelo científico');
 assert.equal(await page.locator('.silm-workshop-micro-viewer').getAttribute('data-synthetic-seed'),seed,
  'Focalizar grão gerou outra microestrutura');
 await page.screenshot({path:join(folder,'graos-foco.jpg'),type:'jpeg',quality:75,animations:'disabled'});
 await page.getByRole('button',{name:'Ajustar microestrutura ao quadro'}).click();
 assert.equal(await page.locator('.silm-workshop-micro-map').getAttribute('data-zoom'),'1');

 await page.locator('.silm-workshop-scale[data-scale="3"]').click();
 await page.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline');
 await page.waitForFunction(()=>document.querySelector('#silm-integration-scene .silm-crystal[data-local-focus="false"]'));
 assert.equal(await page.locator('#silm-integration-scene .silm-center-neighbor').count(),0,
  'Rede exibiu os botões dedicados ao centro metálico');
 const network=await page.locator('.silm-crystal-stage').evaluate(n=>n.silmRenderer.snapshot());
 await page.screenshot({path:join(folder,'rede-referencia.jpg'),type:'jpeg',quality:75,animations:'disabled'});

 await page.locator('.silm-workshop-scale[data-scale="4"]').click();
 await page.waitForFunction(()=>document.querySelector('#silm-integration-scene .silm-crystal[data-local-focus="true"]'));
 const center=page.locator('#silm-integration-scene .silm-crystal[data-local-focus="true"]');
 assert.equal(await center.locator('.silm-center-focus-summary').count(),1,
  'Centro não apresenta contexto focal');
 const metrics=await center.evaluate(n=>{
  const s=SILMIntegration.snapshot(),z=n.dataset.centerSite;
  const shell=document.querySelector('.silm-center-shell-layer');
  const nodes=[...n.querySelectorAll('.silm-center-neighbor')];
  const active=n.querySelector('.silm-crystal-unit[data-local-center]');
  const opts=[...nodes].map(el=>({key:el.dataset.siteKey,disabled:el.disabled,
   w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
  return {site:z,coordination:Number(n.dataset.coordination),neighbors:nodes.length,
   active:!!active,cellHidden:getComputedStyle(n.querySelector('.silm-cell-layer')).display==='none',
   worldHidden:getComputedStyle(n.querySelector('.silm-lattice-layer')).display==='none',
   status:n.querySelector('.silm-center-focus-summary').textContent,
   options:opts,stageW:document.documentElement.scrollWidth,viewport:innerWidth,
   material:s.metal.atomicNumber};
 });
 assert.ok(metrics.site&&metrics.active,'Centro em foco não corresponde à unidade selecionada');
 assert.ok(metrics.neighbors>=8&&metrics.neighbors===metrics.coordination,
  'Os vizinhos não vêm da primeira camada cristalográfica '+JSON.stringify(metrics));
 assert.ok(metrics.cellHidden&&metrics.worldHidden,
  'A escala Centro ainda mostra célula ou rede inteira');
 assert.ok(metrics.options.some(n=>!n.disabled),'Centros vizinhos sem navegação disponível');
 assert.ok(metrics.stageW<=metrics.viewport+6,
  'A câmera de centro criou barra horizontal na página '+JSON.stringify(metrics));
 evidence.push({type:'center',...metrics});
 const first=center.locator('.silm-center-neighbor:not(:disabled)').first();
 await first.click();
 await page.waitForFunction(previous=>{
  const n=document.querySelector('.silm-crystal[data-local-focus="true"]');
  return n?.dataset.centerSite!==previous;
 },metrics.site);
 assert.equal(await scientific(),source,'Focalizar vizinho alterou propriedades ou dados científicos');
 const updated=await center.getAttribute('data-center-site');
 assert.notEqual(updated,metrics.site,'A câmera permaneceu no centro antigo');
 const cameraCenter=await page.locator('.silm-crystal-stage').evaluate(n=>n.silmRenderer.snapshot());
 assert.ok(Number.isFinite(cameraCenter.camera.zoom),
  'Foco local invalida o enquadramento da câmera');
 await page.screenshot({path:join(folder,'centro-vizinho.jpg'),type:'jpeg',quality:75,animations:'disabled'});

 // Câmeras são independentes: voltar à rede não restaura o enquadramento local.
 await page.locator('.silm-workshop-scale[data-scale="3"]').click();
 await page.waitForFunction(()=>document.querySelector('#silm-integration-scene .silm-crystal[data-local-focus="false"]'));
 const networkAfter=await page.locator('.silm-crystal-stage').evaluate(n=>n.silmRenderer.snapshot());
 assert.equal(networkAfter.camera.mode,network.camera.mode,
  'Vista local contaminou a câmera da rede');
 assert.equal(await page.locator('.silm-center-neighbor').count(),0,
  'Camada de Centro permaneceu na Rede');

 // A adaptação funciona em resoluções de toque e mantém alvos adequados.
 await page.locator('.silm-workshop-scale[data-scale="4"]').click();
 await page.waitForFunction(()=>document.querySelector('.silm-crystal[data-local-focus="true"]'));
 for(const [name,width,height]of [['mobile-320',320,568],['mobile-390',390,844],['desktop',1366,768]]){
  await page.setViewportSize({width,height});
  const geo=await page.locator('.silm-crystal[data-local-focus="true"]').evaluate(node=>{
   const buttons=[...node.querySelectorAll('.silm-center-neighbor')];
   return {viewport:innerWidth,pageW:document.documentElement.scrollWidth,
    count:buttons.length,buttons:buttons.map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))};
  });
  assert.ok(geo.pageW<=width+6,name+': o foco causou rolagem horizontal '+JSON.stringify(geo));
  assert.ok(geo.buttons.every(x=>x.w>=31&&x.h>=31),
   name+': vizinhos ilegíveis '+JSON.stringify(geo));
  evidence.push({name,...geo});
  await page.screenshot({path:join(folder,name+'-centro.jpg'),type:'jpeg',quality:75,animations:'disabled'});
 }
 assert.deepEqual(errors,[],'Falhas de execução: '+errors.join(' | '));
 await context.close();
}catch(e){evidence.push({failure:String(e),stack:e.stack});throw e;}
finally{writeFileSync(join(folder,'resultados.json'),JSON.stringify({evidence,errors},null,2));await browser.close();}
