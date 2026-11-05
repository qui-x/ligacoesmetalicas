// Regressão isolada da apresentação da microestrutura no SILM main.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),playwright=require(process.env.PLAYWRIGHT_MODULE);
const browserName=process.env.BROWSER_NAME||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8765';
const browser=await playwright[browserName].launch({headless:true});
async function test(viewport){
 const context=await browser.newContext({viewport});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const res=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(res?.ok(),'SILM não carregou');
 await page.waitForFunction(()=>window.SILMIntegration&&window.SILM?.microstructure?.create&&!document.querySelector('#silm-workshop-context')?.hidden,undefined,{timeout:45000});
 await page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'}).click();
 await page.locator('#silm-periodic-dialog').waitFor({state:'visible'});
 await page.locator('#silm-periodic-dialog [data-z="26"]').click();
 await page.locator('#silm-periodic-dialog [id$="-explore"]').click();
 await page.locator('.silm-workshop-card').filter({hasText:'Parafuso de aço'}).getByRole('button',{name:'Investigar componente'}).click();
 await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===26,undefined,{timeout:30000});
 await page.locator('.silm-workshop-scale').nth(1).click();
 const viewer=page.locator('.silm-workshop-micro-viewer');
 await viewer.waitFor({state:'visible'});
 assert.equal(await page.locator('.silm-workshop-reference > :first-child').getAttribute('aria-label'),'Escalas de investigação','A navegação de escalas deve ficar no topo da área de exibição.');
 const rectangle=await viewer.locator('.silm-workshop-micro-viewport').boundingBox();
 assert.ok(rectangle&&rectangle.height>=290,'A microestrutura está pequena demais');
 if(viewport.width>800)assert.ok(rectangle.width>650,'Palco central não está ampliado');
 else assert.ok(rectangle.width>=260&&rectangle.width<=viewport.width,'A largura da microestrutura excede o celular');
 const grains=viewer.locator('.silm-micro-grain');
 assert.ok(await grains.count()>=45,'Faltam grãos para observação');
 await grains.nth(25).click();
 assert.equal(await viewer.locator('svg').getAttribute('data-selected-grain'),'26','Destaque de grão falhou');
 assert.equal(await viewer.locator('.silm-micro-cell.is-selected').count(),1,'Seleção não aplica padrão estrutural ao grão.');
 const before=await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot()));
 await viewer.getByRole('button',{name:'Ampliar microestrutura'}).click();
 assert.equal(await viewer.locator('svg').getAttribute('data-zoom'),'1.25','Zoom não funciona');
 await viewer.getByRole('button',{name:'Ajustar microestrutura ao quadro'}).click();
 assert.equal(await viewer.locator('svg').getAttribute('data-zoom'),'1','Ajuste ao quadro não funciona');
 assert.equal(await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot())),before,'Zoom modificou o estado científico');
 assert.equal(await page.locator('#silm-integration-scene').isVisible(),false,'Rede cristalina apareceu na escala 2');
 if(viewport.width>800){
  const frame=viewer.locator('.silm-workshop-micro-viewport'),grain=viewer.locator('.silm-micro-grain.is-selected');
  await page.locator('#nav-toggle').click();
  await page.locator('#si-a11y-toggle').click();
  await page.locator('#si-dark').uncheck({force:true});
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='claro');
  const light=await frame.evaluate(n=>getComputedStyle(n).backgroundColor);
  await page.locator('#si-dark').check({force:true});
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='escuro');
  const dark=await frame.evaluate(n=>getComputedStyle(n).backgroundColor);
  assert.notEqual(light,dark,'O fundo da microestrutura não acompanha os temas claro e escuro.');
  await page.locator('#si-contrast').check({force:true});
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('si-highcontrast')),true,'Alto contraste não aplicado.');
  const outline=await grain.evaluate(n=>getComputedStyle(n).strokeDasharray);
  assert.notEqual(outline,'none','O destaque do grão depende apenas de cor.');
  await page.locator('#si-vision-select').selectOption('deuteranopia');
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('si-color-deuteranopia')),true,'Preferência de visão de cores não aplicada.');
  await page.locator('#si-vision-select').selectOption('acromatopsia');
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('si-color-acromatopsia')),true,'Simulação acromática não aplicada.');
  await page.locator('#si-font-plus').click();
  assert.ok(await page.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize)>16),'Ampliação de texto não refletida.');
  await page.locator('#si-motion').check({force:true});
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('si-no-motion')),true,'Redução de movimentos não aplicada.');
  assert.equal(await viewer.isVisible(),true,'A microestrutura sumiu após mudança das preferências.');
  assert.equal(await page.locator('.silm-workshop-reference > :first-child').getAttribute('aria-label'),'Escalas de investigação','Os controles de escala mudaram de lugar ao aplicar acessibilidade.');
  await page.locator('#si-a11y-reset').click();
  await page.locator('#nav-toggle').click();
 }
 await page.locator('.silm-workshop-scale').nth(0).click();
 assert.equal(await page.locator('.silm-workshop-photo img').first().isVisible(),true,'Imagem realista da escala 1 foi perdida');
 assert.equal(await page.locator('.silm-workshop-reference > :first-child').getAttribute('aria-label'),'Escalas de investigação','As quatro escalas saíram do topo na escala 1.');
 assert.deepEqual(errors,[],'Erros JavaScript: '+errors.join('; '));
 await context.close();
}
try{
 await test({width:1440,height:1000});
 await test({width:390,height:844});
 console.log('APROVADO — '+browserName+': microestrutura ampliada, zoom, grãos, celular, estado científico e fotos legadas.');
}finally{await browser.close();}
