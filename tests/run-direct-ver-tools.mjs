// SILM Parte 9 — Ver: módulo → ferramenta direta, sem cliques de categoria.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','ver-direto',browserName);
mkdirSync(dir,{recursive:true});
const browser=await playwright[browserName].launch({headless:true});
const evidence=[],errors=[];
let page;
const snapshot=()=>page.evaluate(()=>window.SILMIntegration.snapshot());
const chooseModule=async name=>{
 await page.locator('[data-silm-module-shortcut="'+name+'"]').click();
 await page.waitForFunction(m=>window.SILMIntegration.snapshot().module.active===m,name);
};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'Oficina indisponível');
 await page.waitForFunction(()=>window.SILM?.workshop?.valid()&&!!document.querySelector('#silm-object-entry'));
 await page.locator('#silm-object-entry .periodic-element[data-z="29"]').click();
 await page.locator('#silm-objects-dialog').waitFor({state:'visible'});
 await page.locator('#silm-objects-dialog [data-reference-id="atlas-cu"]')
  .getByRole('button',{name:'Investigar objeto'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===29);
 // A escala Rede constrói uma geometria cristalográfica pelo motor real.
 await page.locator('.silm-workshop-scale[data-scale="3"]').click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.structure?.mode==='crystalline');
 await page.locator('[data-open-dock="ver"]').click();
 await page.waitForFunction(()=>document.querySelector('#si-dock-right')?.hidden===false);
 assert.equal(await page.locator('#si-viewer-catalog').isVisible(),false,
  'A navegação de terceiro nível não pode continuar visível');
 assert.equal(await page.locator('#silm-direct-actionbar [data-action="electrons"]').count(),1,
  'Explorar não exibe diretamente o botão Elétrons');
 assert.equal(await page.locator('#silm-direct-actionbar [data-action="neighbors"]').count(),1,
  'Explorar não exibe diretamente Vizinhos');
 assert.equal(await page.locator('#silm-direct-actionbar [data-action="property-thermal"]').count(),1,
  'Explorar não exibe diretamente o Calor');
 assert.equal(await page.locator('#silm-direct-selection .silm-observer-selection-tools').count(),1,
  'Combinação de propriedades desapareceu');
 const opening=await snapshot();
 const electrons=page.locator('#silm-direct-actionbar [data-action="electrons"]');
 assert.equal(await electrons.isDisabled(),false,'Elétrons indisponíveis na rede');
 await electrons.click();
 await page.waitForFunction(()=>SILMIntegration.snapshot().electrons?.representation?.visible===true);
 assert.equal((await snapshot()).electrons.representation.motion,true,
  'O modelo eletrônico deve aparecer e se mover num único clique');
 await electrons.click();
 await page.waitForFunction(()=>SILMIntegration.snapshot().electrons?.representation?.visible===false);
 const neighbors=page.locator('#silm-direct-actionbar [data-action="neighbors"]');
 const prevNeighbors=(await snapshot()).structure.crystallography.representation.neighbors;
 await neighbors.click();
 await page.waitForFunction(old=>SILMIntegration.snapshot().structure.crystallography.representation.neighbors!==old,prevNeighbors);
 await neighbors.click();
 await page.waitForFunction(old=>SILMIntegration.snapshot().structure.crystallography.representation.neighbors===old,prevNeighbors);
 assert.equal((await snapshot()).measurements.length,opening.measurements.length,
  'A observação não pode criar uma medição');
 await chooseModule('medir');
 const instrument=page.locator('#silm-direct-actionbar [data-silm-direct-tool="medir:distance"]');
 assert.equal(await instrument.count(),1,'Distância não está na segunda faixa');
 assert.equal(await instrument.isDisabled(),false,'Distância deve estar disponível na rede');
 await instrument.click();
 await page.waitForFunction(()=>document.querySelector('#silm-instrument')?.value==='distance');
 assert.equal(await instrument.getAttribute('aria-pressed'),'true');
 assert.ok(await page.locator('#silm-tools').isVisible(),
  'As instruções de medição continuam ocultas após escolher a régua');
 assert.equal((await snapshot()).measurements.length,opening.measurements.length,
  'Preparar régua não pode registrar medição sem escolher pontos');
 await chooseModule('calcular');
 const choices=page.locator('#silm-direct-actionbar [data-silm-direct-tool^="calcular:"]');
 assert.ok(await choices.count()>=1,'Calcular não oferece fórmulas diretamente');
 const selected=await page.locator('#silm-formula').inputValue();
 const next=choices.filter({hasNot:page.locator('[aria-pressed="true"]')}).first();
 // Seleção de fórmula pelo próprio motor, sem executar cálculo.
 const options=await choices.evaluateAll(all=>all.map(n=>({
  id:n.dataset.silmDirectTool.slice('calcular:'.length),disabled:n.disabled
 })));
 const usable=options.find(o=>!o.disabled&&o.id!==selected)||options.find(o=>!o.disabled);
 assert.ok(usable,'Nenhuma fórmula utilizável');
 const formulaBtn=page.locator('[data-silm-direct-tool="calcular:'+usable.id+'"]');
 await formulaBtn.click();
 await page.waitForFunction(id=>document.querySelector('#silm-formula')?.value===id,usable.id);
 assert.equal((await snapshot()).calculations.length,opening.calculations.length,
  'Selecionar fórmula não pode salvar cálculo sem confirmação');
 await chooseModule('explorar');
 assert.equal(await page.locator('#silm-direct-actionbar [data-action="electrons"]').count(),1,
  'Explorar perdeu as ações após retornar de Calcular');
 const extras=page.locator('#silm-explore-extras details');
 assert.equal(await extras.count(),2,'Preferências e comparação conceitual não estão acessíveis');
 assert.equal(await extras.first().getAttribute('open'),null,
  'Preferências devem começar recolhidas');
 for(const [label,width,height] of [['mobile-320',320,568],['mobile-390',390,844],['desktop',1366,768]]){
  await page.setViewportSize({width,height});
  const geo=await page.locator('#silm-direct-actionbar').evaluate(node=>{
   const r=node.getBoundingClientRect(),s=getComputedStyle(node);
   const buttons=[...node.querySelectorAll('button')].map(n=>{
    const box=n.getBoundingClientRect();
    return {w:box.width,h:box.height,disabled:n.disabled};
   });
   return {x:r.left,right:r.right,scrollW:node.scrollWidth,clientW:node.clientWidth,
    overflowX:s.overflowX,buttons,pageW:document.documentElement.scrollWidth};
  });
  assert.ok(geo.buttons.length>=9&&geo.buttons.every(x=>x.w>=43.5&&x.h>=43.5),
   label+': ações diretas comprimidas '+JSON.stringify(geo));
  assert.ok(geo.right<=width+3&&geo.pageW<=width+6,
   label+': nova faixa provocou rolagem global '+JSON.stringify(geo));
  if(width<900)assert.ok(geo.scrollW>geo.clientW+50,
   label+': faltou rolagem horizontal interna');
  await page.screenshot({path:join(dir,label+'-explorar-ver.jpg'),type:'jpeg',
   quality:72,animations:'disabled'});
  evidence.push({label,...geo});
 }
 assert.deepEqual(errors,[],'Erros de execução: '+errors.join('\n'));
 await context.close();
}catch(e){evidence.push({error:String(e),stack:e.stack});throw e;}
finally{writeFileSync(join(dir,'metricas.json'),JSON.stringify({evidence,errors},null,2));await browser.close();}
