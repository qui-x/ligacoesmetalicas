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
 await page.waitForFunction(()=>window.SILMActionIcons?.audit&&document.querySelector('#scene-undo > svg.silm-action-icon'),undefined,{timeout:15000});
 const iconAudit=await page.evaluate(()=>SILMActionIcons.audit());
 assert.ok(iconAudit.mapped>=12,'Ícones não foram aplicados aos controles existentes.');
 assert.equal(await page.locator('#scene-undo').getAttribute('aria-label'),'Desfazer','Desfazer perdeu o nome acessível.');
 assert.equal(await page.locator('#scene-undo > svg.silm-action-icon').getAttribute('aria-hidden'),'true','SVG de ação deve ser decorativo.');

 await page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'}).click();
 await page.locator('#silm-periodic-dialog').waitFor({state:'visible'});
 await page.waitForFunction(()=>!!document.querySelector('#silm-close-periodic > svg.silm-action-icon'),undefined,{timeout:15000});
 assert.equal(await page.locator('#silm-close-periodic').getAttribute('aria-label'),'Fechar tabela','Fechar tabela perdeu nome acessível.');

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
 assert.equal(await viewer.locator('svg.silm-workshop-micro-map').getAttribute('data-selected-grain'),'26','Destaque de grão falhou');
 assert.equal(await viewer.locator('.silm-micro-cell.is-selected').count(),1,'Seleção não aplica padrão estrutural ao grão.');
 assert.match(await viewer.locator('.silm-workshop-micro-status').textContent(),/Grão 26 selecionado · modelo esquemático/,'Seleção não identifica o grão sem medições inventadas.');
 assert.equal(await viewer.getAttribute('data-microstructure-source'),'schematic','Proveniência geométrica do mapa não declarada.');
 assert.equal(await viewer.getAttribute('data-measurement-status'),'unavailable','Medidas experimentais não devem estar disponíveis para esquema gerado.');
 assert.doesNotMatch(await viewer.locator('.silm-workshop-micro-status').textContent(),/\d+[,.]?\d*\s*%/,'O grão não deve exibir porcentagem de composição ou fração sem dados experimentais.');
 assert.match(await viewer.locator('.silm-workshop-micro-caveat').textContent(),/sem composição, fração de fase ou tamanho medidos/,'Aviso científico ausente para mapa esquemático.');
 const before=await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot()));
 await viewer.getByRole('button',{name:'Ampliar microestrutura'}).click();
 assert.equal(await viewer.locator('svg.silm-workshop-micro-map').getAttribute('data-zoom'),'1.25','Zoom não funciona');
 await viewer.getByRole('button',{name:'Ajustar microestrutura ao quadro'}).click();
 assert.equal(await viewer.locator('svg.silm-workshop-micro-map').getAttribute('data-zoom'),'1','Ajuste ao quadro não funciona');
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
 // Faixa de ferramentas científicas: dimensões constantes e mesma linha
 // nos estados normal e expandido; barra móvel preserva alvos e rolagem.
 const sceneTools=page.locator('#silm-scene-actionbar');
 await sceneTools.waitFor({state:'visible'});
 const sampleSceneButtons=async()=>sceneTools.evaluate(bar=>{
  const items=[...bar.querySelectorAll('#silm-view-quick-actions .silm-quick-icon,#silm-view-controls .silm-camera-btn,#silm-view-controls #si-expand-structure.si-structure-expand-in-camera')]
   .filter(b=>!b.hidden&&getComputedStyle(b).display!=='none'&&b.getBoundingClientRect().width>0)
   .map(b=>{const x=b.getBoundingClientRect();return {id:b.id,width:x.width,height:x.height,cy:x.y+x.height/2,aria:b.getAttribute('aria-label')};});
  const rect=bar.getBoundingClientRect();
  return {items,barHeight:rect.height,barBottom:rect.bottom,scrollable:bar.scrollWidth>bar.clientWidth};
 });
 let toolbarState=await sampleSceneButtons();
 assert.ok(toolbarState.items.length>=6,'Faltam botões da câmera na faixa instrumental.');
 assert.ok(toolbarState.items.every(b=>Math.abs(b.width-44)<1&&Math.abs(b.height-44)<1),'Botões instrumentais ficaram menores ou maiores do que 44 px.');
 assert.ok(toolbarState.items.every(b=>Math.abs(b.cy-toolbarState.items[0].cy)<2),'Ícones de câmera perderam o alinhamento vertical.');
 assert.ok(Math.abs(toolbarState.barHeight-60)<2,'A faixa científica não conservou uma altura fixa.');
 if(viewport.width>900){
  const expand=page.locator('#si-expand-structure');
  assert.ok(await expand.isVisible(),'Botão expandir/recolher não aparece na faixa científica.');
  assert.equal(await expand.isEnabled(),true,'A estrutura construída deveria permitir expansão.');
  const before=await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot()));
  await expand.click();
  await page.waitForFunction(()=>document.body.classList.contains('si-structure-expanded'));
  assert.equal(await expand.getAttribute('aria-pressed'),'true','Estado expandido não está indicado.');
  const expandedTools=await sampleSceneButtons();
  assert.ok(expandedTools.items.every(b=>Math.abs(b.width-44)<1&&Math.abs(b.height-44)<1),'Expandir alterou o tamanho dos ícones.');
  assert.ok(Math.abs(expandedTools.barHeight-toolbarState.barHeight)<1,'Expandir alterou a altura da faixa científica.');
  assert.ok(expandedTools.barBottom<=viewport.height+2,'Barra inferior ultrapassou a janela.');
  await expand.click();
  await page.waitForFunction(()=>!document.body.classList.contains('si-structure-expanded'));
  assert.equal(await expand.getAttribute('aria-pressed'),'false','O botão não voltou ao estado recolhido.');
  assert.equal(await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot())),before,'A expansão alterou dados científicos.');
 }else{
  assert.ok(toolbarState.scrollable,'Faixa móvel precisa rolar, nunca comprimir controles instrumentais.');
 }

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
 await page.waitForFunction(()=>document.querySelector('.silm-structure-layout')?.dataset.silmAction==='grid',undefined,{timeout:10000});
 assert.equal(await manager.locator('.silm-structure-layout').getAttribute('aria-label'),'Ver estruturas em grade','Botão não atualiza o nome ao trocar modo.');

 assert.equal(shown.columns,1,'Modo lista permanece com múltiplas colunas por sobreposição de CSS.');
 assert.equal(await entries.first().locator('.silm-structure-preview svg').isVisible(),true,'Prévia desapareceu no modo lista.');
 const currentCard=cards.locator('.silm-structure-card[data-current="true"]');
 assert.equal(await currentCard.count(),1,'A estrutura atualmente em foco não está identificada na lista.');
 assert.equal(await currentCard.locator('.silm-structure-status').textContent(),'Em foco','O estado de foco não está indicado.');
 const layoutGeometry=await currentCard.evaluate(card=>{
  const f=card.querySelector('.silm-structure-preview').getBoundingClientRect(),c=card.getBoundingClientRect();
  const h=card.querySelector('.silm-structure-card-head').getBoundingClientRect();
  const a=card.querySelector('.silm-structure-card-actions').getBoundingClientRect();
  const svg=card.querySelector('.silm-structure-preview svg'),box=svg.viewBox.baseVal;
  const dots=[...svg.querySelectorAll('circle')].map(n=>({
   x:Number(n.getAttribute('cx')),y:Number(n.getAttribute('cy')),r:Number(n.getAttribute('r'))
  })).filter(n=>[n.x,n.y,n.r].every(Number.isFinite));
  const minX=Math.min(...dots.map(q=>q.x-q.r)),maxX=Math.max(...dots.map(q=>q.x+q.r));
  const minY=Math.min(...dots.map(q=>q.y-q.r)),maxY=Math.max(...dots.map(q=>q.y+q.r));
  return {fraction:f.width*f.height/(c.width*c.height),widthFraction:f.width/c.width,previewRight:f.right,
   previewTop:f.top,headLeft:h.left,headTop:h.top,actionsTop:a.top,contentExtent:Math.max((maxX-minX)/box.width,(maxY-minY)/box.height)};
 });
 if(viewport.width>1100){
  assert.ok(layoutGeometry.widthFraction>=.72,'A prévia na lista precisa ocupar pelo menos 72% da largura.');
  assert.ok(layoutGeometry.fraction>=.68,'A prévia na lista precisa ocupar pelo menos 68% da área.');
  assert.ok(layoutGeometry.headLeft>=layoutGeometry.previewRight-2&&layoutGeometry.actionsTop>=layoutGeometry.headTop,
   'Informações e ações devem permanecer ao lado da prévia em desktop.');
 }else{
  assert.ok(layoutGeometry.fraction>=.50,'A prévia deve ser dominante também no modo lista do celular.');
  assert.ok(layoutGeometry.previewTop>=layoutGeometry.headTop,'A identificação deve ficar acima da prévia em celular.');
 }
 assert.ok(layoutGeometry.contentExtent>=.75,'A estrutura desenhada está demasiadamente pequena dentro do SVG.');

 await manager.getByRole('button',{name:'Ver estruturas em grade'}).click();
 shown=await computed();
 assert.equal(shown.layout,'grid','O botão não retornou ao modo grade.');
 await page.waitForFunction(()=>document.querySelector('.silm-structure-layout')?.dataset.silmAction==='list',undefined,{timeout:10000});
 assert.equal(await manager.locator('.silm-structure-layout').getAttribute('aria-label'),'Ver estruturas em lista','Botão não atualiza nome na grade.');
 const actions=manager.locator('.silm-structure-card-actions button');
 assert.equal(await actions.nth(1).getAttribute('data-silm-action'),'edit','Renomear sem ícone.');
 assert.equal(await actions.nth(2).getAttribute('data-silm-action'),'trash','Remover sem ícone.');
 assert.equal(await actions.nth(2).textContent(),'Remover','Remover perdeu o rótulo de segurança.');

 if(viewport.width>1100)assert.ok(shown.columns>=2,'O modo grade não restaurou as colunas.');
 assert.equal(await entries.first().locator('.silm-structure-preview svg').isVisible(),true,'Prévia desapareceu no modo grade.');
 await page.locator('[data-scene-view="focus"]').click();
 assert.equal(await page.locator('#workspace-focus').isVisible(),true,'Trocar lista/grade quebrou o retorno ao Foco.');

 await page.locator('.silm-workshop-scale[data-scale="4"]').click();
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
 await page.getByLabel('Aplicar estímulo na rede').selectOption('joule');
 const step=page.getByRole('button',{name:'Avançar meio intervalo no efeito Joule'}),conditions=page.getByLabel('Condições do efeito Joule');
 const reading=page.locator('.silm-lattice-status span');
 await step.locator('svg.silm-action-icon').waitFor({state:'visible'});
 const stepBox=await step.boundingBox();
 assert.ok(Math.abs(stepBox.width-44)<1&&Math.abs(stepBox.height-44)<1,'Avançar Joule deve manter o alvo de 44 px.');
 await step.click();
 await page.waitForFunction(()=>document.querySelector('.silm-lattice-status span').textContent.includes(' · t 0,5 · '));
 const value=async label=>Number((await reading.textContent()).split(' · '+label+' ')[1].split(' · ')[0].replace(',','.'));
 const timeBeforeNavigation=await value('t');
 await page.getByRole('button',{name:'Avançar uma célula no eixo a'}).click();
 assert.equal(await value('t'),timeBeforeNavigation,'Navegar não deve avançar o ensaio.');
 await page.getByRole('button',{name:'Recuar uma célula no eixo a'}).click();
 await conditions.selectOption('potential');
 assert.match(await reading.textContent(),/Mapa: Potencial elétrico/);
 await conditions.selectOption('current');
 const currentBefore=await value('I');
 const electronFlow=()=>page.locator('.silm-electron-canvas').evaluate(n=>n.silmElectrons.snapshot().currentFactor);
 const flowBefore=await electronFlow();
 await step.click();
 assert.equal(await value('I'),currentBefore,'A corrente imposta mudou com a temperatura.');
 assert.equal(await electronFlow(),flowBefore,'A pista visual aplicou o efeito térmico duas vezes sob corrente imposta.');
 const warm=await value('T média');
 await conditions.selectOption('supply');
 await step.click();
 assert.match(await reading.textContent(),/corrente imposta.* · t 1,5 · U 0 · I 0 · R [\d,]+ · P Joule 0/);
 assert.ok(await value('T média')<warm,'Desligar a fonte com terminais ao ambiente precisa permitir resfriamento.');
 assert.equal(await electronFlow(),0);
 await conditions.selectOption('readings');
 const results=page.getByRole('dialog',{name:'Leituras do efeito Joule'});
 await results.waitFor({state:'visible'});
 const quantity=async key=>Number((await results.locator('[data-quantity="'+key+'"]').textContent()).replace(',','.'));
 assert.equal(await quantity('power'),0);
 const balance=await quantity('jouleEnergy')+await quantity('externalEnergy')-await quantity('removedEnergy')-await quantity('storedEnergy');
 assert.ok(Math.abs(balance)<.00005,'Leituras de energia não fecham o balanço.');
 await results.getByRole('button',{name:'Fechar leituras do efeito Joule'}).click();
 // O evento close do dialog é enfileirado; aguardar o retorno do foco em ambos os motores.
 await page.waitForFunction(()=>document.activeElement===document.querySelector('.silm-joule-controls select'),undefined,{timeout:5000});
 await conditions.selectOption('restore');
 await page.waitForFunction(()=>document.querySelector('.silm-lattice-status span').textContent.includes(' · t 0 · '));
 assert.equal(await value('T média'),0);
 assert.equal(await value('I'),0);
 assert.match(await reading.textContent(),/corrente imposta/,'Reiniciar mudou a condição elétrica.');
 await conditions.selectOption('end');
 assert.equal(await step.isVisible(),false);
 assert.equal(await page.locator('.silm-crystal').getAttribute('data-field-map'),null,'Encerrar deixou o mapa acoplado na cena.');
 if(viewport.width>1100){
  await page.getByRole('button',{name:'Ver',exact:true}).click();
  await page.getByRole('button',{name:'Ações de observação',exact:true}).click();
  await page.keyboard.down('Control');
  await page.locator('.silm-observer-action[data-action="property-electrical"]').click();
  await page.locator('.silm-observer-action[data-action="property-thermal"]').click();
  await page.keyboard.up('Control');
  await step.waitFor({state:'visible'});
  for(const id of ['electrical','thermal'])assert.equal(await page.locator('.silm-observer-action[data-action="property-'+id+'"]').getAttribute('aria-pressed'),'true','Soltar Ctrl desativou uma propriedade do par.');
  await page.getByRole('button',{name:'Fechar painel',exact:true}).click();
  assert.match(await reading.textContent(),/Efeito Joule.* · t 0 · /,'Ctrl + E + T não iniciou o mesmo ensaio.');
  await conditions.selectOption('end');
 }
 assert.deepEqual(errors,[],'Erros JavaScript: '+errors.join('; '));
 await context.close();
}
try{
 await test({width:1440,height:1000});
 await test({width:1600,height:900});
 await test({width:390,height:844});
 console.log('APROVADO — '+browserName+': escalas, microestrutura, barra inferior, navegação da célula, Joule, seleção conjunta e resfriamento.');
}finally{await browser.close();}
