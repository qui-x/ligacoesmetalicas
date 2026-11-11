// SILM Parte 9: gestos na lente real, sem bypass das escalas científicas.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','lente-gestos',browserName);
mkdirSync(dir,{recursive:true});
const metrics=[];
const browser=await playwright[browserName].launch({headless:true});
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'Oficina indisponível');
 await page.waitForFunction(()=>!!window.SILM?.lensController?.inspect&&
  !!document.querySelector('#silm-object-entry .silm-family-picker'));
 await page.locator('#silm-object-entry .silm-family-picker').selectOption('11');
 await page.locator('#silm-object-entry .silm-family-element[data-z="29"]').click();
 await page.locator('#silm-objects-dialog').waitFor({state:'visible'});
 await page.locator('#silm-objects-dialog [data-reference-id="atlas-cu"]')
  .getByRole('button',{name:'Investigar objeto'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId==='atlas-cu');
 await page.waitForFunction(()=>SILM.lensController.inspect().attached&&SILM.lensController.inspect().scale===1);
 const read=()=>page.evaluate(()=>SILM.lensController.inspect());
 const scientific=()=>page.evaluate(()=>{
  const s=SILMIntegration.snapshot();
  return JSON.stringify({metal:s.metal,properties:s.properties,
   measurements:s.measurements,calculations:s.calculations,module:s.module.active});
 });
 const original=await scientific();
 const toggle=page.locator('.silm-lens-toggle');
 await toggle.click();
 const ring=page.locator('.silm-lens-circle');
 await ring.waitFor({state:'visible'});
 await ring.click();
 assert.equal((await read()).scale,1,'Clique simples não deve aprofundar');
 const a=await read();
 await ring.focus();
 await ring.press('ArrowRight');
 await ring.press('ArrowDown');
 const p=(await read()).position;
 assert.ok(p[0]>a.position[0]&&p[1]>a.position[1],
  'A lupa não se moveu pelo teclado');
 // Ctrl+clique aprofunda Objeto → Grãos; não é Ctrl+seleção de propriedades.
 await ring.click({modifiers:['Control']});
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===2);
 const grains=await read();
 for(let i=0;i<2;i++)
  assert.ok(Math.abs(grains.position[i]-p[i])<.0001,
   'A posição visual não acompanhou a passagem para Grãos');
 assert.equal(await scientific(),original,
  'Ctrl+clique alterou propriedades ou instrumentos científicos');
 await page.screenshot({path:join(dir,'graos-apos-ctrl-clique.jpg'),type:'jpeg',quality:72,animations:'disabled'});
 // Duplo clique aprofunda Grãos → Rede com o mesmo botão científico existente.
 await ring.dblclick();
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===3,{timeout:12000});
 assert.equal(await scientific(),original,
  'Duplo clique alterou propriedades ou instrumentos científicos');
 const crystal=await page.evaluate(()=>SILMIntegration.snapshot().structure?.mode);
 assert.equal(crystal,'crystalline',
  'Travessia não aplicou sua validação original de estrutura');
 // Alternativa por teclado: Ctrl+Enter aprofunda Rede → Centro.
 await ring.focus();
 await ring.press('Control+Enter');
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===4);
 const current=await read();
 assert.ok(current.attached,'Lupa foi removida da escala Centro');
 assert.equal(await scientific(),original,
  'Ctrl+Enter alterou módulos/propriedades/medições/cálculos');
 await ring.dblclick();
 assert.equal((await read()).scale,4,
  'Duplo clique avançou além da quarta escala');
 await page.screenshot({path:join(dir,'centro-apos-zoom.jpg'),type:'jpeg',quality:72,animations:'disabled'});
 // Fechar lente não pode mudar a escala e continua reversível.
 await toggle.click();
 assert.equal(await toggle.getAttribute('aria-pressed'),'false');
 assert.equal((await read()).scale,4);
 assert.deepEqual(errors,[],'Erros JavaScript: '+errors.join('\n'));
 metrics.push({browser:browserName,object:1,grains:2,network:3,center:4,
  gestures:['normal-click-stable','ctrl-click','double-click','ctrl-enter','terminal-depth','disable'],
  scientificStatePreserved:true});
 await context.close();
}finally{
 writeFileSync(join(dir,'resultados.json'),JSON.stringify({metrics,errors},null,2));
 await browser.close();
}
