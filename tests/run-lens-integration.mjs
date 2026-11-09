// Integração real da Lente Multiescala com o motor SILM (não mock).
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const BASE_URL=process.env.BASE_URL||'http://127.0.0.1:8765';
const browser=await playwright[browserName].launch({headless:true});
const path=join('reports','lente',browserName);mkdirSync(path,{recursive:true});
const ui=()=>window.SILM?.lensController?.inspect();
try{
 const context=await browser.newContext({
  viewport:{width:390,height:844},reducedMotion:'reduce'
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto(BASE_URL+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'Aplicativo indisponível');
 await page.waitForFunction(()=>window.SILM?.lensController&&window.SILM?.workshop?.valid());
 // Estabelecer uma investigação real (Cu), pelo mesmo percurso da oficina.
 await page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'}).click();
 await page.locator('#silm-periodic-dialog [data-z="29"]').click();
 await page.locator('#silm-periodic-dialog [id$="-explore"]').click();
 await page.locator('.silm-workshop-card[data-reference-id="atlas-cu"]')
  .getByRole('button',{name:'Investigar componente'}).click();
 await page.waitForFunction(()=>SILMIntegration?.snapshot?.()?.metal?.atomicNumber===29);
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===1&&SILM.lensController.inspect().attached);
 assert.equal(await page.locator('.silm-lens-layer').count(),1,'Lente duplicada na cena');
 assert.equal(await page.locator('.silm-lens-circle:visible').count(),0,'Lente deve iniciar desativada');
 const toggle=page.locator('.silm-lens-toggle');
 assert.equal(await toggle.getAttribute('aria-pressed'),'false');
 const baseline=await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
 await toggle.click();
 await page.locator('.silm-lens-circle').waitFor({state:'visible'});
 assert.equal(await toggle.getAttribute('aria-pressed'),'true');
 assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),baseline,
  'Ativar a lente alterou o estado científico');

 // Arraste real por mouse, sem criar novas unidades, propriedades ou medições.
 const ring=page.locator('.silm-lens-circle');
 const rect=await ring.boundingBox();
 await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
 await page.mouse.down();
 await page.mouse.move(rect.x+rect.width/2+28,rect.y+rect.height/2+20,{steps:5});
 await page.mouse.up();
 let moved=await page.evaluate(()=>SILM.lensController.inspect().position);
 assert.ok(moved[0]>.52&&moved[1]>.52,'Arrastar a lente não modificou o foco visual');
 assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),baseline,
  'Arrastar a lente modificou os dados científicos');
 await ring.focus();
 await ring.press('ArrowRight');
 const afterKeyboard=await page.evaluate(()=>SILM.lensController.inspect().position);
 assert.ok(afterKeyboard[0]>moved[0],'Movimento por teclado não funcionou');
 await page.locator('.silm-lens-reset').click();
 assert.deepEqual(await page.evaluate(()=>SILM.lensController.inspect().position),[.5,.5]);
 // Marco 2: marcar uma REGIÃO VISUAL não faz amostragem do material.
 await page.locator('.silm-lens-mark').click();
 const objectMark=await page.evaluate(()=>SILM.lensController.inspect().selected);
 assert.equal(objectMark?.kind,'object','A lente não marcou a ilustração do Objeto');
 assert.match(objectMark?.label||'',/Região visual/);
 assert.ok((await page.locator('.silm-lens-selection').innerText()).includes('sem amostra medida'));
 assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),baseline,
  'Marcar imagem alterou o estado científico da investigação');
 // Mover a lente não é equivalente a remarcar o Objeto.
 await ring.focus();
 await ring.press('ArrowLeft');
 assert.deepEqual(await page.evaluate(()=>SILM.lensController.inspect().selected),objectMark,
  'Mover a lente alterou a região visual antes da confirmação');
 await page.locator('.silm-lens-reset').click();
 await page.screenshot({path:join(path,'objeto.jpg'),type:'jpeg',quality:68});

 // Os próprios botões da oficina movimentam o motor. O controller apenas
 // reaproveita o DOM ativo; não processa micrografias nem geometria atômica.
 await page.locator('.silm-lens-advance').click();
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===2&&
  SILM.lensController.inspect().targetClass.includes('micro-viewport'));
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
 const grainless=await page.locator('.silm-micro-grain').count();
 assert.ok(grainless>5,'O gerador real de grãos não foi preservado');
 const firstPath=await page.locator('.silm-micro-grain').first().getAttribute('d');
 const mapBefore=await page.locator('.silm-workshop-micro-map').getAttribute('viewBox');
 const grainScientificBefore=await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
 // Marco 2: o alvo deve corresponder ao contorno SVG real sob o centro da lente.
 await page.locator('.silm-lens-mark').click();
 const grainMark=await page.evaluate(()=>SILM.lensController.inspect().selected);
 assert.equal(grainMark?.kind,'grain','Não encontrou grão real sob a lente: '+
  await page.locator('.silm-lens-selection').innerText());
 assert.equal(grainMark.source,'schematic','Confusão entre grão D0 e experimento importado');
 assert.equal(await page.locator('.silm-micro-grain.is-selected').count(),1,
  'A marcação não acionou o seletor nativo de grãos');
 const chosenGrain=await page.locator('.silm-workshop-micro-map').getAttribute('data-selected-grain');
 assert.equal(grainMark.number,chosenGrain);
 assert.match(await page.locator('.silm-lens-selection').innerText(),/sem medição experimental/);
 assert.equal(await page.locator('.silm-workshop-micro-map').getAttribute('viewBox'),mapBefore,
  'Marcar grão mudou a câmera/microestrutura');
 assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),grainScientificBefore,
  'Destacar um grão didático alterou o snapshot científico');
 // A geometria usada para marcar precisa continuar correta com a câmera SVG
 // ampliada: não basta escolher o primeiro grão ou o mais próximo.
 await page.locator('.silm-lens-reset').click();
 await page.getByRole('button',{name:'Ampliar microestrutura'}).click();
 assert.equal(await page.locator('.silm-workshop-micro-map').getAttribute('data-zoom'),'1.25');
 const grainScientificZoomed=await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
 await page.locator('.silm-lens-mark').click();
 const zoomMark=await page.evaluate(()=>SILM.lensController.inspect().selected);
 assert.equal(zoomMark?.kind,'grain','Seleção deve funcionar com zoom SVG de 125%');
 assert.equal(zoomMark.number,await page.locator('.silm-workshop-micro-map').getAttribute('data-selected-grain'));
 assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),grainScientificZoomed,
  'Selecionar grão com zoom modificou dados científicos');
 await page.getByRole('button',{name:'Ajustar microestrutura ao quadro'}).click();
 await page.locator('.silm-lens-mark').click();
 await page.locator('.silm-lens-circle').focus();
 await page.locator('.silm-lens-circle').press('ArrowDown');
 assert.equal(await page.locator('.silm-micro-grain').first().getAttribute('d'),firstPath,
  'Mover a lente alterou a microestrutura');
 assert.equal(await page.locator('.silm-workshop-micro-map').getAttribute('data-selected-grain'),chosenGrain,
  'Mover a lente selecionou automaticamente outro grão');
 assert.equal(await page.evaluate(()=>SILM.lensController.inspect().selected?.number),chosenGrain);
 assert.equal(await page.locator('.silm-lens-layer').count(),1,'A lente foi duplicada');
 await page.screenshot({path:join(path,'graos.jpg'),type:'jpeg',quality:68});
 await page.locator('.silm-lens-toggle').click();
 assert.equal(await page.locator('.silm-lens-circle:visible').count(),0);
 await page.locator('.silm-lens-toggle').click();
 await page.locator('.silm-lens-circle').waitFor({state:'visible'});

 await page.locator('.silm-lens-advance').click();
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===3&&
  SILM.lensController.inspect().targetClass.includes('silm-assembly-stage'));
 assert.ok(await page.locator('.silm-crystal-stage').count(),
  'A lente substituiu o renderizador cristalográfico');
 await page.screenshot({path:join(path,'rede.jpg'),type:'jpeg',quality:68});
 await page.locator('.silm-lens-advance').click();
 await page.waitForTimeout(250);
 const centerDebug=await page.evaluate(()=>({
  lens:SILM.lensController.inspect(),
  stage:document.querySelector('#si-stage')?.dataset.workshopScale,
  nextButton:document.querySelector('.silm-workshop-scale[data-scale="4"]')?.outerHTML.slice(0,400),
  workshop:SILMIntegration.snapshot().metadata?.workshop,
  structure:SILMIntegration.snapshot().structure?.crystallography?.representation
 }));
 console.log('LENS_CENTER_DIAGNOSTIC',JSON.stringify(centerDebug));
 if(centerDebug.stage!=='4'){
  const native=await page.locator('.silm-workshop-scale[data-scale="4"]')
   .evaluate(button=>{const disabled=button.disabled;button.click();return disabled;});
  await page.waitForTimeout(250);
  const result=await page.evaluate(()=>({
   stage:document.querySelector('#si-stage')?.dataset.workshopScale,
   lens:SILM.lensController.inspect(),
   workshop:SILMIntegration.snapshot().metadata?.workshop,
   units:SILMIntegration.snapshot().structure?.units?.length
  }));
  console.log('NATIVE_SCALE_COMPARISON',JSON.stringify({disabled:native,result}));
 }
 assert.equal(centerDebug.stage,'4',
  'Lente não avançou para Centro; estado: '+JSON.stringify(centerDebug));
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===4&&
  SILM.lensController.inspect().attached);
 assert.equal(await page.locator('.silm-lens-advance:visible').count(),0,
  'Centro é a última escala e não deve sugerir outra etapa');
 assert.equal((await page.evaluate(()=>SILMIntegration.snapshot())).metal.atomicNumber,29);

 // Visão geral não é uma escala científica: remover a lente visualmente,
 // preservar preferências e restaurar ao voltar para o Foco.
 await page.locator('[data-scene-view="overview"]').click();
 await page.waitForFunction(()=>!document.querySelector('#workspace-overview').hidden);
 await page.waitForFunction(()=>!SILM.lensController.inspect().attached);
 await page.locator('[data-scene-view="focus"]').click();
 await page.waitForFunction(()=>SILM.lensController.inspect().attached&&
  SILM.lensController.inspect().scale===4);
 assert.equal(await page.locator('.silm-lens-circle:visible').count(),1);

 // Regressão em viewport estreito sem barra lateral extra ou overflow global.
 await page.setViewportSize({width:320,height:568});
 // WebKit pode fornecer a primeira geometria antes de recalcular clamp()
 // e o ResizeObserver. A lente deve se realinhar sem interação adicional.
 await page.waitForFunction(()=>{
  const host=document.querySelector('.silm-lens-layer'),lens=host?.querySelector('.silm-lens-circle');
  if(!host||!lens)return false;
  const h=host.getBoundingClientRect(),r=lens.getBoundingClientRect();
  return r.left>=h.left-2&&r.top>=h.top-2&&r.right<=h.right+2&&r.bottom<=h.bottom+2;
 },null,{timeout:2200}).catch(()=>{});
 const geometry=await page.evaluate(()=>{
  const layer=document.querySelector('.silm-lens-layer'),lens=document.querySelector('.silm-lens-circle');
  const h=layer.getBoundingClientRect(),r=lens.getBoundingClientRect();
  const b=[...document.querySelectorAll('.silm-lens-tool:not([hidden])')].map(x=>x.getBoundingClientRect());
  return {width:document.documentElement.scrollWidth,viewport:innerWidth,
   inside:r.left>=h.left-2&&r.top>=h.top-2&&r.right<=h.right+2&&r.bottom<=h.bottom+2,
   layer:{left:h.left,top:h.top,right:h.right,bottom:h.bottom,width:h.width,height:h.height},
   lens:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,
    cssLeft:lens.style.left,cssTop:lens.style.top},
   buttonSizes:b.map(x=>[x.width,x.height])};
 });
 assert.ok(geometry.width<=geometry.viewport+5,'Lente provocou rolagem horizontal');
 assert.ok(geometry.inside,'Lente saiu da área visual em 320px: '+JSON.stringify(geometry));
 assert.ok(geometry.buttonSizes.every(([w,h])=>w>=43&&h>=43),
  'Ações da lente menores que os alvos de toque');
 await page.screenshot({path:join(path,'centro-mobile.jpg'),type:'jpeg',quality:68});
 // Regressão do Marco 2 na largura mínima: o controle de marcação
 // precisa funcionar sem adicionar menus nem alargar o documento.
 await page.locator('.silm-workshop-scale[data-scale="2"]').click();
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===2);
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
 await page.locator('.silm-lens-reset').click();
 await page.locator('.silm-lens-mark').click();
 assert.equal(await page.evaluate(()=>SILM.lensController.inspect().selected?.kind),'grain',
  'Marcar grão didático não funciona em 320 px');
 const mobileRead=await page.evaluate(()=>{
  const stage=document.querySelector('.silm-lens-layer').getBoundingClientRect();
  const badge=document.querySelector('.silm-lens-selection').getBoundingClientRect();
  return {pageWidth:document.documentElement.scrollWidth,windowWidth:innerWidth,
   badgeVisible:badge.width>0&&badge.left>=stage.left-2&&badge.right<=stage.right+2};
 });
 assert.ok(mobileRead.pageWidth<=mobileRead.windowWidth+5,'Marcação causou overflow móvel');
 assert.ok(mobileRead.badgeVisible,'O resultado da marcação saiu do palco no celular');
 await page.screenshot({path:join(path,'graos-mobile.jpg'),type:'jpeg',quality:68});
 await page.locator('.silm-workshop-scale[data-scale="1"]').click();
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===1);
 assert.equal(await page.evaluate(()=>SILM.lensController.inspect().selected?.kind),'object',
  'Voltar ao Objeto perdeu sua região visual após a investigação das outras escalas');
 assert.deepEqual(errors,[],'Erros JavaScript: '+errors.join(' | '));
 console.log('OK '+browserName+': lente real, mouse, teclado, 4 escalas, estado científico, visões e 320px');
 await context.close();
}finally{await browser.close();}
