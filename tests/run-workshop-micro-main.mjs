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
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true',undefined,{timeout:15000});
 assert.equal(await page.locator('.silm-workshop-reference > :first-child').getAttribute('aria-label'),'Escalas de investigação','A navegação de escalas deve ficar no topo da área de exibição.');
 const rectangle=await viewer.locator('.silm-workshop-micro-viewport').boundingBox();
 assert.ok(rectangle&&rectangle.height>=290,'A microestrutura está pequena demais');
 if(viewport.width>800)assert.ok(rectangle.width>650,'Palco central não está ampliado');
 else assert.ok(rectangle.width>=260&&rectangle.width<=viewport.width,'A largura da microestrutura excede o celular');
 const frame=viewer.locator('.silm-workshop-micro-viewport'),map=viewer.locator('.silm-workshop-micro-map');
 const ratio=await page.evaluate(()=>{const f=document.querySelector('.silm-workshop-micro-viewport'),s=f.querySelector('svg'),r=f.getBoundingClientRect(),v=s.viewBox.baseVal;return {frame:r.width/r.height,map:v.width/v.height};});
 assert.ok(Math.abs(ratio.frame-ratio.map)<.05,'Desenho não preenche o quadro na proporção correta.');
 const nav=await page.locator('.silm-workshop-reference > .silm-workshop-scales').boundingBox();
 const toolbar=await viewer.locator('.silm-workshop-micro-toolbar').boundingBox();
 const image=await frame.boundingBox();
 assert.ok(nav&&toolbar&&image&&image.y>=nav.y+nav.height-2&&toolbar.y>=image.y+image.height-2,'Os controles devem ficar abaixo do desenho e as escalas no topo.');
 if(viewport.width>800){
  assert.ok(image.height>=390,'A área central ficou baixa no desktop.');
  assert.ok(toolbar.y+toolbar.height<=viewport.height-8,'Os controles inferiores ficaram fora da janela desktop.');
 }
 assert.equal(await viewer.getByText('Tamanho real: indisponível (sem escala em µm)').isVisible(),true,'Leitura de dimensão sem calibração ausente.');
 assert.ok(await viewer.getByRole('button',{name:'Ampliar microestrutura'}).isVisible(),'O zoom inferior não ficou acessível.');
 const grains=viewer.locator('.silm-micro-grain');
 assert.ok(await grains.count()>=45,'Faltam grãos para observação');
 await grains.nth(25).click();
 assert.equal(await viewer.locator('svg').getAttribute('data-selected-grain'),'26','Destaque de grão falhou');
 assert.equal(await viewer.locator('.silm-micro-cell.is-selected').count(),1,'Seleção não aplica padrão estrutural ao grão.');
 assert.match(await viewer.locator('.silm-workshop-micro-status').textContent(),/Grão 26 · área no desenho: .*% \(ilustrativa\)/,'Área relativa ilustrativa não foi exibida.');
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
  await page.locator('#si-nav-close').click();
 }
 await page.locator('.silm-workshop-scale').nth(0).click();
 assert.equal(await page.locator('.silm-workshop-photo img').first().isVisible(),true,'Imagem realista da escala 1 foi perdida');
 assert.equal(await page.locator('.silm-workshop-reference > :first-child').getAttribute('aria-label'),'Escalas de investigação','As quatro escalas saíram do topo na escala 1.');

 // Visão geral: o mesmo estado validado deve continuar em lista e grade.
 // Confere estilo computado, não apenas o texto do alternador.
 await page.locator('.silm-workshop-scale').nth(2).click();
 await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.structure?.units?.length>0,undefined,{timeout:15000});
 await page.locator('[data-scene-view="overview"]').click();
 const overview=page.locator('#workspace-overview');
 await overview.waitFor({state:'visible'});
 const manager=page.locator('#silm-comparison-items');
 const cards=manager.locator('.silm-structure-cards'),entries=cards.locator('.silm-structure-card');
 assert.ok(await entries.count()>0,'Nenhuma estrutura válida foi apresentada na Visão geral.');
 const preview=entries.first().locator('.silm-structure-preview svg');
 assert.equal(await preview.isVisible(),true,'A prévia da estrutura não está visível.');
 assert.ok(await preview.locator('circle').count()>0,'A prévia cristalina não desenhou unidades.');
 const computed=async()=>cards.evaluate(node=>{
  const st=getComputedStyle(node);return {layout:node.dataset.layout,columns:st.gridTemplateColumns.split(/\s+/).filter(Boolean).length,first:node.querySelector('.silm-structure-card')?.getBoundingClientRect().width,full:node.getBoundingClientRect().width};
 });
 let shown=await computed();
 assert.equal(shown.layout,'grid','O gerenciador não abriu em grade.');
 if(viewport.width>1100)assert.ok(shown.columns>=2,'Modo grade não distribui os cartões por colunas.');
 await manager.getByRole('button',{name:'Ver estruturas em lista'}).click();
 shown=await computed();
 assert.equal(shown.layout,'list','O botão não selecionou o modo lista.');
 assert.equal(shown.columns,1,'Modo lista permanece com múltiplas colunas por sobreposição de CSS.');
 assert.equal(await entries.first().locator('.silm-structure-preview svg').isVisible(),true,'Prévia desapareceu no modo lista.');
 await manager.getByRole('button',{name:'Ver estruturas em grade'}).click();
 shown=await computed();
 assert.equal(shown.layout,'grid','O botão não retornou ao modo grade.');
 if(viewport.width>1100)assert.ok(shown.columns>=2,'O modo grade não restaurou as colunas.');
 assert.equal(await entries.first().locator('.silm-structure-preview svg').isVisible(),true,'Prévia desapareceu no modo grade.');
 await page.locator('[data-scene-view="focus"]').click();
 assert.equal(await page.locator('#workspace-focus').isVisible(),true,'Trocar lista/grade quebrou o retorno ao Foco.');

 await page.getByRole('button',{name:'4 · Ambiente atômico'}).click();
 const units=page.locator('.silm-crystal-unit'),status=page.locator('.silm-lattice-status output');
 await units.first().waitFor({state:'visible'});
 const sites=()=>units.evaluateAll(nodes=>nodes.map(n=>n.dataset.site));
 const original=await sites();
 for(const [axis,letter] of ['a','b','c'].entries()){
  await page.getByRole('button',{name:'Avançar uma célula no eixo '+letter}).click();
  const expected=original.map(key=>{
   const [cell,basis]=key.split('|'),coords=cell.split(',').map(Number);
   coords[axis]++;return coords.join(',')+'|'+basis;
  });
  assert.deepEqual(await sites(),expected,'A célula inteira deve se deslocar pelo eixo '+letter);
  await page.getByRole('button',{name:'Recuar uma célula no eixo '+letter}).click();
  assert.deepEqual(await sites(),original);
 }
 assert.match(await status.textContent(),/Célula \[0, 0, 0\]/);
 assert.equal(await page.locator('#silm-scene-actionbar .silm-lattice-nav').count(),1);
 assert.deepEqual(errors,[],'Erros JavaScript: '+errors.join('; '));
 await context.close();
}
try{
 await test({width:1440,height:1000});
 await test({width:1600,height:900});
 await test({width:390,height:844});
 console.log('APROVADO — '+browserName+': microestrutura ampliada, zoom, grãos, celular, estado científico e fotos legadas.');
}finally{await browser.close();}
