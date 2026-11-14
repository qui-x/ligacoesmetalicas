// Regressão isolada da apresentação da microestrutura no SILM main.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
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
 if(viewport.width<=560){
  const inspect=await viewer.locator('.silm-workshop-micro-zoom-tools').evaluate(row=>{
   const parent=row.closest('.silm-workshop-micro-toolbar').getBoundingClientRect();
   const buttons=[...row.querySelectorAll('button')].map(btn=>{
    const r=btn.getBoundingClientRect();
    return {name:btn.getAttribute('aria-label'),left:r.left,right:r.right,width:r.width,
     clipped:r.left<parent.left-2||r.right>parent.right+2};
   });
   return {width:parent.width,buttons};
  });
  assert.ok(inspect.buttons.length>=6,'Formações e Dados precisam continuar acessíveis.');
  assert.ok(inspect.buttons.every(x=>!x.clipped&&x.width>=43.5),
   'Controles da microestrutura recortados ou menores que 44 px: '+JSON.stringify(inspect));
 }

 if(viewport.width>800){
  assert.ok(image.height>=390,'A área central ficou baixa no desktop.');
  assert.ok(toolbar.y+toolbar.height<=viewport.height-8,'Os controles inferiores ficaram fora da janela desktop.');
 }
 assert.equal(await viewer.getByText('Tamanho real: indisponível (sem escala em µm)').isVisible(),true,'Leitura de dimensão sem calibração ausente.');
 assert.ok(await viewer.getByRole('button',{name:'Ampliar microestrutura'}).isVisible(),'O zoom inferior não ficou acessível.');
 const grains=viewer.locator('.silm-micro-grain');
 assert.ok(await grains.count()>=45,'Faltam grãos para observação');
 await grains.nth(25).focus();
 await grains.nth(25).press('Enter');
 assert.equal(await viewer.locator('svg.silm-workshop-micro-map').getAttribute('data-selected-grain'),'26','Destaque de grão falhou');
 assert.equal(await viewer.locator('.silm-micro-cell.is-selected').count(),1,'Seleção não aplica padrão estrutural ao grão.');
 assert.match(await viewer.locator('.silm-workshop-micro-status').textContent(),/Grão 26 selecionado · modelo esquemático/,'Seleção não identifica o grão sem medições inventadas.');
 assert.equal(await viewer.getAttribute('data-microstructure-source'),'schematic','Proveniência geométrica do mapa não declarada.');
 assert.equal(await viewer.getAttribute('data-appearance-palette'),'iron-ore',
  'Ferro deve utilizar a paleta mineral simbólica explicitamente declarada.');
 assert.equal(await viewer.getAttribute('data-appearance-basis'),'symbolic-mineral',
  'O tom do ferro não deve ser classificado como cor experimental de metal puro.');
 assert.ok(await viewer.locator('svg linearGradient[id*="material"]').count()>=4,
  'Relevo didático deve usar gradientes SVG e manter o desenho vetorial.');
 assert.equal(await page.getByText(/Não é bem assim/).count(),0,
  'A metáfora de contexto da conversa não deve ser uma frase pública.');

 assert.equal(await viewer.getAttribute('data-measurement-status'),'unavailable','Medidas experimentais não devem estar disponíveis para esquema gerado.');
 assert.doesNotMatch(await viewer.locator('.silm-workshop-micro-status').textContent(),/\d+[,.]?\d*\s*%/,'O grão não deve exibir porcentagem de composição ou fração sem dados experimentais.');
 assert.match(await viewer.locator('.silm-workshop-micro-caveat').textContent(),/sem composição, fração de fase ou tamanho medidos/,'Aviso científico ausente para mapa esquemático.');
 // Propriedades mecânicas agora atuam diretamente na escala de grãos,
 // ANTES de organizar a rede, sem substituir polígonos ou criar minipalco.
 assert.equal(await page.evaluate(()=>SILMIntegration.snapshot().structure?.mode),'free',
  'A microestrutura deveria permitir deformação antes da rede cristalina.');
 const initialGrainShapes=await viewer.locator('.silm-micro-grain').evaluateAll(nodes=>
  nodes.slice(0,10).map(n=>n.getAttribute('d')).join('|'));
 const initialSeed=await viewer.getAttribute('data-synthetic-seed');
 const activeGrain=await viewer.locator('.silm-micro-cell.is-selected').count();
 const openProperty=async id=>{
  await page.getByRole('button',{name:'Ver',exact:true}).click();
  const item=page.locator('[data-action="property-'+id+'"]');
  await item.waitFor({state:'visible'});
  assert.notEqual(await item.getAttribute('aria-disabled'),'true',
   id+' indisponível na escala de microestrutura antes da rede.');
  await item.click();
  await page.locator('#si-dock-right [data-close-dock="right"]').click();
  await page.waitForFunction(()=>!document.querySelector('#si-stage')?.inert&&
   document.querySelector('#si-dock-right')?.hidden===true);
  await page.waitForFunction(id=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.mechanicalStudy===id,id);
 };
 await openProperty('malleability');
 const mech=viewer.locator('.silm-micro-mechanical-tools');
 await mech.waitFor({state:'visible'});
 const grip=viewer.locator('.silm-micro-mechanical-top');
 const mechanicalDir=join('reports','micro-deformation',browserName);
 mkdirSync(mechanicalDir,{recursive:true});
 assert.ok((await grip.boundingBox())?.height>=44,'Alça da prensa não alcança 44 px.');
 const pulse=mech.locator('.silm-micro-mechanical-pulse');
 assert.equal(await pulse.getAttribute('aria-label'),'Aplicar compressão',
  'Botão de compressão não recebeu o nome acessível: '+await pulse.evaluate(n=>n.outerHTML));
 await pulse.click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.mechanicalStep==='1');
 assert.match(await viewer.locator('.silm-micro-mechanical-field').getAttribute('transform'),/scale\(/,
  'Compressão não modifica a representação no mesmo mapa.');
 await viewer.screenshot({path:join(mechanicalDir,'compressao-'+viewport.width+'.png'),animations:'disabled'});
 assert.equal(await viewer.locator('.silm-micro-cell.is-selected').count(),activeGrain,
  'Comprimir apagou o grão selecionado.');
 await grip.focus();await grip.press('Enter');
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.mechanicalStep==='2');
 await mech.getByRole('button',{name:'Restaurar deformação'}).click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.mechanicalStep==='0');
 assert.equal(await viewer.locator('.silm-micro-mechanical-field').getAttribute('transform'),null,
  'Restaurar deixou grãos ainda deformados.');
 assert.equal(await viewer.locator('.silm-micro-grain').evaluateAll(nodes=>
  nodes.slice(0,10).map(n=>n.getAttribute('d')).join('|')),initialGrainShapes,
  'A operação alterou os contornos originais.');
 await openProperty('ductility');
 assert.equal(await pulse.getAttribute('aria-label'),'Aplicar tração',
  'Botão de tração não recebeu o nome acessível.');
 await pulse.click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.mechanicalStep==='1');
 assert.match(await mech.locator('.silm-micro-mechanical-reading').textContent(),
  /Tração.*passo ilustrativo 1\/4.*não representa deformação medida/);
 await viewer.screenshot({path:join(mechanicalDir,'tracao-'+viewport.width+'.png'),animations:'disabled'});
 await mech.getByRole('button',{name:'Restaurar deformação'}).click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.mechanicalStep==='0');
 await page.getByRole('button',{name:'Ver',exact:true}).click();
 await page.locator('[data-action="property-ductility"]').click();
 await page.locator('#si-dock-right [data-close-dock="right"]').click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.mechanicalStudy==='inactive');
 assert.equal(await viewer.locator('.silm-micro-mechanical-tools').isVisible(),false,
  'A deformação ficou na interface depois de encerrar a propriedade.');
 assert.equal(await viewer.getAttribute('data-synthetic-seed'),initialSeed,'A ação mecânica alterou a semente.');
 assert.equal(await viewer.locator('.silm-micro-grain').evaluateAll(nodes=>
  nodes.slice(0,10).map(n=>n.getAttribute('d')).join('|')),initialGrainShapes);
 assert.equal(await viewer.locator('.silm-micro-cell.is-selected').count(),activeGrain);
 assert.equal(await page.locator('.silm-optical-bench').count(),0,
  'A mecânica recriou um palco paralelo na microestrutura.');

 // Superfície: brilho na escala 2 sem obrigar organização da rede.
 await page.getByRole('button',{name:'Ver',exact:true}).click();
 const luster=page.locator('[data-action="property-luster"]');
 await luster.waitFor({state:'visible'});
 assert.notEqual(await luster.getAttribute('aria-disabled'),'true',
  'Brilho não deveria exigir rede organizada na escala de grãos.');
 await luster.click();
 await page.locator('#si-dock-right [data-close-dock="right"]').click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.surfaceOptical==='active');
 const opticalTools=viewer.locator('.silm-micro-surface-tools');
 await opticalTools.waitFor({state:'visible'});
 assert.ok(await viewer.locator('.silm-micro-surface-field rect').count()>=300,
  'Campo óptico não está integrado ao SVG da microestrutura.');
 const previousLight=await page.evaluate(()=>SILMIntegration.snapshot().metadata.surface.light);
 await opticalTools.getByRole('button',{name:'Alternar luz sobre a superfície'}).click();
 assert.equal(await page.evaluate(()=>SILMIntegration.snapshot().metadata.surface.light),!previousLight,
  'A luz não alternou ou não persistiu no estado da investigação.');
 await opticalTools.getByRole('combobox',{name:'Ferramenta superficial'}).selectOption('brush');
 const surfaceArea=await viewer.locator('svg.silm-workshop-micro-map').boundingBox();
 const x=surfaceArea.x+surfaceArea.width*.33,y=surfaceArea.y+surfaceArea.height*.45;
 await page.mouse.move(x,y);await page.mouse.down();
 await page.mouse.move(x+Math.min(surfaceArea.width*.25,80),y,{steps:6});await page.mouse.up();
 await page.waitForFunction(()=>SILMIntegration.snapshot().metadata.surface?.strokes?.length===1);
 assert.equal(await viewer.getAttribute('data-surface-strokes'),'1');
 assert.equal(await viewer.locator('.silm-micro-grain').evaluateAll(nodes=>
  nodes.slice(0,10).map(n=>n.getAttribute('d')).join('|')),initialGrainShapes,
  'Preparação de superfície alterou os polígonos gerados.');
 await opticalTools.getByRole('combobox',{name:'Ferramenta superficial'}).selectOption('observe');
 await page.getByRole('button',{name:'Ver',exact:true}).click();
 await page.locator('[data-action="property-luster"]').click();
 await page.locator('#si-dock-right [data-close-dock="right"]').click();
 assert.equal(await page.evaluate(()=>SILMIntegration.snapshot().metadata.surface.strokes.length),1,
  'Encerrar a ferramenta não deve apagar tratamento da amostra.');
 await page.getByRole('button',{name:'Ver',exact:true}).click();
 await page.locator('[data-action="property-luster"]').click();
 await page.locator('#si-dock-right [data-close-dock="right"]').click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.surfaceOptical==='active');
 assert.equal(await viewer.getAttribute('data-surface-strokes'),'1',
  'Reativar o brilho perdeu acabamento persistente.');

 // A escova também funciona sem arrastar o mouse: seleciona-se o grão
 // e usa-se o botão acessível, que atualiza a mesma amostra.
 await opticalTools.getByRole('combobox',{name:'Ferramenta superficial'}).selectOption('brush');
 await opticalTools.getByRole('button',{name:'Aplicar ferramenta ao grão selecionado'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot().metadata.surface.strokes.length===2);
 await opticalTools.getByRole('combobox',{name:'Ferramenta superficial'}).selectOption('observe');
 await openProperty('malleability');
 assert.equal(await viewer.getAttribute('data-surface-coobservation'),'active',
  'A iluminação não permaneceu acessível durante a compressão.');
 assert.equal(await opticalTools.getByRole('combobox',{name:'Ferramenta superficial'}).isDisabled(),true,
  'A ferramenta abrasiva não deve competir com a prensa.');
 await mech.locator('.silm-micro-mechanical-pulse').click();
 await page.waitForFunction(()=>SILMIntegration.snapshot().metadata.surface?.compressionSteps===1);
 assert.equal(await viewer.getAttribute('data-mechanical-permanent'),'active',
  'A compressão plástica não produziu geometria residual na amostra.');
 await openProperty('ductility');
 assert.equal(await viewer.getAttribute('data-mechanical-permanent'),'active',
  'Trocar de compressão para tração apagou a deformação plástica.');
 await mech.locator('.silm-micro-mechanical-pulse').click();
 await page.waitForFunction(()=>SILMIntegration.snapshot().metadata.surface?.tensionSteps===1);
 await page.getByRole('button',{name:'Ver',exact:true}).click();
 await page.locator('[data-action="property-luster"]').click();
 await page.locator('#si-dock-right [data-close-dock="right"]').click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.surfaceOptical==='active');
 assert.equal(await viewer.getAttribute('data-mechanical-permanent'),'active',
  'A deformação residual desapareceu ao investigar o brilho da superfície.');
 assert.ok((await viewer.locator('.silm-micro-mechanical-field').getAttribute('transform'))?.includes('scale('),
  'Grãos e superfície não acompanharam a deformação da mesma amostra.');
 assert.equal(await page.evaluate(()=>SILMIntegration.snapshot().metadata.surface.strokes.length),2,
  'Força aplicada não deve apagar a preparação óptica.');
 // Reposição virtual explícita é diferente de soltar a força.
 await openProperty('malleability');
 await mech.getByRole('button',{name:'Restaurar deformação'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot().metadata.surface?.plasticSteps===0);
 assert.equal(await viewer.getAttribute('data-mechanical-permanent'),'inactive');
 assert.equal(await viewer.locator('.silm-micro-mechanical-field').getAttribute('transform'),null,
  'Restaurar a amostra não removeu a deformação residual.');
 await page.getByRole('button',{name:'Ver',exact:true}).click();
 await page.locator('[data-action="property-luster"]').click();
 await page.locator('#si-dock-right [data-close-dock="right"]').click();
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.surfaceOptical==='active');



 const before=await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot()));
 await viewer.getByRole('button',{name:'Ampliar microestrutura'}).click();
 assert.equal(await viewer.locator('svg.silm-workshop-micro-map').getAttribute('data-zoom'),'1.25','Zoom não funciona');
 await viewer.getByRole('button',{name:'Ajustar microestrutura ao quadro'}).click();
 assert.equal(await viewer.locator('svg.silm-workshop-micro-map').getAttribute('data-zoom'),'1','Ajuste ao quadro não funciona');
 assert.equal(await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot())),before,'Zoom modificou o estado científico');
 assert.equal(await page.locator('#silm-integration-scene').isVisible(),false,'Rede cristalina apareceu na escala 2');

 // Gerador esquemático: a semente e o perfil controlam o desenho,
 // mas a tela e a câmera não podem mudar os polígonos.
 assert.equal(await viewer.getAttribute('data-synthetic-seed'),'139712','Semente inicial incorreta.');
 assert.equal(await viewer.getAttribute('data-synthetic-profile'),'equiaxial','Perfil inicial incorreto.');
 const signature=async()=>viewer.locator('.silm-micro-grain').evaluateAll(nodes=>
  nodes.slice(0,12).map(n=>n.getAttribute('d')).join('|'));
 const originalField=await signature();
 await viewer.getByRole('button',{name:'Abrir gerador de formações de grãos'}).click();
 const formations=viewer.locator('dialog.silm-micro-generator-dialog');
 await formations.waitFor({state:'visible'});
 await formations.getByLabel('Forma dos grãos').selectOption('elongated');
 await formations.getByLabel('Semente reproduzível').fill('424242');
 await formations.getByRole('button',{name:'Gerar formação com a semente informada'}).click();
 assert.equal(await viewer.getAttribute('data-synthetic-seed'),'424242');
 assert.equal(await viewer.getAttribute('data-synthetic-profile'),'elongated');
 const elongatedField=await signature();
 assert.notEqual(elongatedField,originalField,'Perfil e semente não alteraram a formação.');
 await formations.getByRole('button',{name:'Fechar configurações de formação'}).click();
 const resized={width:Math.max(320,viewport.width-71),height:viewport.height};
 await page.setViewportSize(resized);
 await page.waitForFunction(()=>{
  const n=document.querySelector('.silm-workshop-micro-map');
  const r=n?.getBoundingClientRect(),v=n?.viewBox.baseVal;
  return !!r&&!!v&&r.height>0&&Math.abs(v.width/v.height-r.width/r.height)<.02;
 },undefined,{timeout:10000});
 assert.equal(await signature(),elongatedField,'Redimensionamento alterou os grãos esquemáticos.');
 assert.equal(await viewer.getAttribute('data-synthetic-seed'),'424242','Redimensionamento alterou a semente.');
 await page.setViewportSize(viewport);
 await viewer.getByRole('button',{name:'Abrir gerador de formações de grãos'}).click();
 await formations.getByRole('button',{name:'Gerar formação com a semente informada'}).click();
 assert.equal(await signature(),elongatedField,'Mesma semente e perfil não reproduzem a formação.');
 await formations.getByRole('button',{name:'Gerar nova variação reproduzível'}).click();
 assert.notEqual(await viewer.getAttribute('data-synthetic-seed'),'424242','Nova variação não altera semente.');
 assert.notEqual(await signature(),elongatedField,'Nova variação não altera a geometria.');
 await formations.getByRole('button',{name:'Restaurar formação padrão'}).click();
 assert.equal(await signature(),originalField,'Restaurar padrão não reproduz o primeiro desenho.');
 await formations.getByRole('button',{name:'Fechar configurações de formação'}).click();
 assert.equal(await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot())),before,'Formações alteraram propriedades ou estado científico.');


 // Mapa importado: contornos e calibração declarados, SEM fração de fase ou composição.
 assert.ok(await page.evaluate(()=>!!SILM.microstructureData?.validate),'Validador de microestruturas não foi carregado.');
 const sample={
  schema:'silm.microstructure-map.v1',id:'teste-geometrico',title:'Teste sintético, não é amostra',
  materialAtomicNumber:26,material:'Ferro fictício do teste',sourceKind:'literature-image',
  source:{citation:'Fixture fictício, apenas para regressão',url:'https://example.org/fixture',
   acquisitionMethod:'Contornos gerados manualmente para teste'},
  image:{widthPx:100,heightPx:80,micrometersPerPixel:.5,
   calibrationReference:'Calibração fictícia para verificação matemática'},
  segmentation:{method:'Contorno manual fictício'},
  grains:[{id:'g1',vertices:[[10,10],[30,10],[30,20],[10,20]]}]
 };
 await viewer.getByRole('button',{name:'Abrir dados segmentados'}).click();
 const importDialog=viewer.locator('.silm-micro-data-dialog');
 await importDialog.waitFor({state:'visible'});
 const evidencePanel=importDialog.locator('.silm-micro-didactic-evidence');
 assert.match(await evidencePanel.innerText(),/Cores e relevo:/,
  'A leitura cromática deve informar que a cor é ilustrativa.');
 assert.match(await evidencePanel.innerText(),/não é a cor intrínseca do ferro metálico|não é a cor intrínseca/,
  'Paleta Fe não pode ser confundida com a cor real de toda amostra.');

 assert.equal(await evidencePanel.getAttribute('data-evidence-level'),'D0-schematic-conceptual',
  'A geometria didática não deve parecer uma amostra experimental.');
 assert.match(await evidencePanel.innerText(),/Rede de referência:/,
  'A evidência deve apresentar a cristalografia, separadamente do grão ilustrativo.');
 assert.match(await evidencePanel.innerText(),/Contexto de aplicação no atlas:/,
  'A aplicação tecnológica deve ser contextualizada, sem confundir liga com metal puro.');
 assert.match(await evidencePanel.innerText(),/Estudos candidatos não são parâmetros do gerador/,
  'Não se deve inferir forma de grão a partir de fonte bibliográfica não homologada.');
 const crystalURL=await evidencePanel.getByRole('link',{name:'Consultar fonte cristalográfica'}).getAttribute('href');
 assert.match(crystalURL,/^https:\/\//,'Falta URL rastreável da estrutura de referência.');
 assert.equal(await viewer.getAttribute('data-didactic-evidence-level'),'D0-schematic-conceptual');
 const studiesContext=evidencePanel.locator('details.silm-micro-study-context');
 const relatedCount=await page.evaluate(()=>SILM.microstructureStudies.forElement(26).length);
 assert.ok(relatedCount>=1,'Ferro não recebeu as referências relacionadas já catalogadas.');
 assert.equal(await evidencePanel.getAttribute('data-catalogued-studies'),String(relatedCount),
  'O número de estudos apresentados deve coincidir com o catálogo offline.');
 assert.equal(await studiesContext.locator('.silm-micro-study-entry').count(),relatedCount,
  'Os estudos do Fe precisam ser individuais, sem inventar material de amostra.');
 assert.equal(await studiesContext.getAttribute('open'),null,
  'Estudos devem iniciar recolhidos para preservar a organização da interface.');
 const visualBeforeStudies=await signature();
 await studiesContext.locator('summary').click();
 assert.equal(await studiesContext.getAttribute('open'),'',
  'A lista de estudos não expandiu via teclado ou clique.');
 assert.match(await studiesContext.innerText(),/Estudos sobre materiais que contêm o elemento/,
  'O texto deve explicar o vínculo indireto com o elemento.');
 assert.match(await studiesContext.innerText(),/Nenhum deles define os grãos deste desenho/,
  'Estudos candidatos não podem validar visualmente os polígonos.');
 assert.ok(await studiesContext.getByText(/Aspectos investigados na fonte:/).count()>=1,
  'O catálogo deve traduzir conceitos científicos documentados na fonte.');

 assert.equal(await studiesContext.locator('.silm-micro-study-entry a[href]').count(),relatedCount,
  'Toda referência deve manter uma URL para consulta independente.');
 assert.equal(await signature(),visualBeforeStudies,
  'Abrir o catálogo não pode alterar os contornos de grãos.');
 assert.equal(await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot())),before,
  'Abrir estudos não pode modificar o estado científico.');
 await studiesContext.locator('summary').click();
 await importDialog.locator('input[type=file]').setInputFiles({
  name:'amostra-de-teste.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(sample))
 });
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-viewer')?.dataset.measurementStatus==='provided-unverified');
 assert.equal(await viewer.getAttribute('data-didactic-evidence-level'),'imported-unverified',
  'Importação não pode herdar a classificação D0 do gerador.');
 assert.match(await evidencePanel.innerText(),/informações declaradas pelo arquivo, ainda não homologadas/,
  'A revisão dos contornos importados não pode ser pressuposta.');
 assert.equal(await viewer.getByRole('button',{name:'Abrir gerador de formações de grãos'}).isDisabled(),true,'Um mapa importado não pode ser trocado silenciosamente por um esquema.');
 assert.equal(await viewer.locator('.silm-micro-grain').count(),1,'O mapa importado não alterou a segmentação.');
 await importDialog.getByRole('button',{name:'Fechar importação de dados'}).click();
 await viewer.locator('.silm-micro-grain').first().click();
 assert.match(await viewer.locator('.silm-workshop-micro-status').textContent(),/área segmentada 50 µm².*não homologados/,'Área calibrada de teste ou aviso de procedência não aparece.');
 assert.doesNotMatch(await viewer.locator('.silm-workshop-micro-status').textContent(),/%/,'Mapas importados não autorizam porcentagens de composição.');
 assert.equal(await page.evaluate(()=>JSON.stringify(window.SILMIntegration.snapshot())),before,'Importar mapa modificou o estado científico.');
 await viewer.getByRole('button',{name:'Abrir dados segmentados'}).click();
 await importDialog.getByRole('button',{name:'Retornar ao mapa didático'}).click();
 await importDialog.getByRole('button',{name:'Fechar importação de dados'}).click();
 assert.equal(await viewer.getAttribute('data-didactic-evidence-level'),'D0-schematic-conceptual',
  'Ao restaurar o gerador, a classificação D0 deve ser recuperada.');
 assert.equal(await viewer.getAttribute('data-microstructure-source'),'schematic','Mapa esquemático não foi restaurado.');
 assert.equal(await viewer.getByRole('button',{name:'Abrir gerador de formações de grãos'}).isEnabled(),true,'Restauração não reativou o gerador esquemático.');
 assert.ok(await viewer.locator('.silm-micro-grain').count()>=45,'Grãos ilustrativos não foram restaurados.');
 await viewer.locator('.silm-micro-grain').nth(25).focus();
 await viewer.locator('.silm-micro-grain').nth(25).press('Enter');
 // A formação criada também persiste ao sair da escala 2 e voltar à mesma
 // investigação, sem se confundir com dados experimentais ou alterar ensaios.
 await viewer.getByRole('button',{name:'Abrir gerador de formações de grãos'}).click();
 await formations.getByLabel('Forma dos grãos').selectOption('elongated');
 await formations.getByLabel('Semente reproduzível').fill('123456');
 await formations.getByRole('button',{name:'Gerar formação com a semente informada'}).click();
 const persistentGeometry=await signature();
 await formations.getByRole('button',{name:'Fechar configurações de formação'}).click();
 await page.locator('.silm-workshop-scale').nth(2).click();
 await page.locator('.silm-workshop-scale').nth(1).click();
 await viewer.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
 assert.equal(await viewer.getAttribute('data-synthetic-seed'),'123456','Semente perdida após navegar entre escalas.');
 assert.equal(await viewer.getAttribute('data-synthetic-profile'),'elongated','Perfil perdido após navegar entre escalas.');
 assert.equal(await signature(),persistentGeometry,'A formação mudou ao retornar à microestrutura.');
 await viewer.getByRole('button',{name:'Abrir gerador de formações de grãos'}).click();
 await formations.getByRole('button',{name:'Restaurar formação padrão'}).click();
 await formations.getByRole('button',{name:'Fechar configurações de formação'}).click();
 await viewer.locator('.silm-micro-grain').nth(25).focus();
 await viewer.locator('.silm-micro-grain').nth(25).press('Enter');

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
 assert.ok(toolbarState.items.length>=1&&toolbarState.items.length<=4,
  'A câmera precisa manter Enquadrar e recolher os controles redundantes: '+JSON.stringify(toolbarState.items));
 assert.equal(await page.locator('#silm-view-controls .silm-camera-advanced').getAttribute('open'),null,
  'A câmera avançada deve iniciar recolhida.');
 assert.ok(toolbarState.items.every(b=>Math.abs(b.width-44)<1&&Math.abs(b.height-44)<1),'Botões instrumentais ficaram menores ou maiores do que 44 px.');
 assert.ok(toolbarState.items.every(b=>Math.abs(b.cy-toolbarState.items[0].cy)<2),'Ícones de câmera perderam o alinhamento vertical.');
 assert.ok(Math.abs(toolbarState.barHeight-60)<2,'A faixa científica não conservou uma altura fixa.');
 if(viewport.width<=900){
  const previousSize=page.viewportSize();
  await page.setViewportSize({width:343,height:768});
  const toolbarNav=page.locator('#silm-scene-actionbar');
  await toolbarNav.waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('#silm-scene-actionbar')?.dataset.toolbarNavigation==='ready');
  const overflow=await toolbarNav.evaluate(n=>n.scrollWidth>n.clientWidth+2);
  if(overflow){
   const nextTool=toolbarNav.getByRole('button',{name:'Mostrar próximas ferramentas'});
   await nextTool.waitFor({state:'visible'});
   await nextTool.click();
   await page.waitForFunction(()=>document.querySelector('#silm-scene-actionbar').scrollLeft>10);
   const prevTool=toolbarNav.getByRole('button',{name:'Mostrar ferramentas anteriores'});
   await prevTool.waitFor({state:'visible'});
   await prevTool.click();
   await page.waitForFunction(()=>document.querySelector('#silm-scene-actionbar').scrollLeft<10);
  }else{
   assert.equal(await toolbarNav.locator('#silm-view-controls [id$="-camera-fit"]').isVisible(),true,
    'Sem rolagem, Enquadrar precisa continuar visível e acessível.');
  }
  const barBox=await toolbarNav.boundingBox();
  assert.ok(barBox.height<=62,'A barra instrumental aumentou de altura no celular.');
  await page.setViewportSize(previousSize);
 }
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
  assert.ok(toolbarState.items.length>=1,'Ações essenciais da câmera ficaram indisponíveis.');
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
  assert.ok(layoutGeometry.fraction>=.38,'A prévia do celular não pode desaparecer para mostrar as ações: '+JSON.stringify(layoutGeometry));
  assert.ok(layoutGeometry.previewTop>=layoutGeometry.headTop,'A identificação deve ficar acima da prévia em celular.');
 }
 assert.ok(layoutGeometry.contentExtent>=.75,'A estrutura desenhada está demasiadamente pequena dentro do SVG.');
 if(viewport.width<=900){
  const previousSize=page.viewportSize();
  await page.setViewportSize({width:343,height:768});
  await page.waitForTimeout(60);
  // Clonar cartão só no teste visual; nenhuma alteração na coleção salva.
  await cards.evaluate(grid=>{
   const card=grid.querySelector('.silm-structure-card');
   const copy=card.cloneNode(true);copy.dataset.visualTestClone='true';grid.append(copy);
  });
  const sizes=await overview.evaluate(root=>{
   const list=[...root.querySelectorAll('.silm-structure-card')];
   const preview=list[0].querySelector('.silm-structure-preview').getBoundingClientRect();
   return {preview:preview.height,scrollHeight:root.scrollHeight,clientHeight:root.clientHeight};
  });
  assert.ok(sizes.preview<=256,'Prévia excessiva no celular: '+JSON.stringify(sizes));
  assert.ok(sizes.scrollHeight>sizes.clientHeight+30,'Painel não reconheceu segunda estrutura: '+JSON.stringify(sizes));
  await overview.evaluate(root=>{root.scrollTop=root.scrollHeight;});
  await page.waitForTimeout(80);
  const last=await overview.evaluate(root=>{
   const actions=root.querySelector('.silm-structure-card:last-child .silm-structure-card-actions');
   const r=actions.getBoundingClientRect(),v=root.getBoundingClientRect();
   return {bottom:r.bottom,viewBottom:v.bottom,top:r.top,viewTop:v.top,scrollTop:root.scrollTop};
  });
  assert.ok(last.scrollTop>0,'Visão geral não rola verticalmente.');
  assert.ok(last.bottom<=last.viewBottom+3&&last.top>=last.viewTop-3,
   'Comandos da segunda estrutura inacessíveis: '+JSON.stringify(last));
  await cards.evaluate(grid=>grid.querySelector('[data-visual-test-clone]')?.remove());
  await overview.evaluate(root=>{root.scrollTop=0;});
  await page.setViewportSize(previousSize);
 }


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
 // Translação por eixos é ação avançada na escala Centro.
 const details=page.locator('#silm-scene-actionbar .silm-lattice-more');
 await details.locator('summary').click();
 assert.equal(await details.getAttribute('open'),'','Navegação acessível não abriu.');
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
 // Joule é uma combinação direta: sem iniciar um simulador separado.
 await page.locator('[data-open-dock="ver"]').click();
 await page.waitForFunction(()=>document.querySelector('#si-dock-right')?.hidden===false);
 const direct=page.locator('#silm-direct-actionbar');
 assert.equal(await direct.locator('[data-action="joule"]').count(),0,'Joule voltou a ser uma ação duplicada em Ver');
 await direct.locator('[data-action="property-electrical"]').click();
 await direct.locator('[data-action="property-thermal"]').click();
 await page.locator('[data-open-dock="ver"]').click();
 const step=page.getByRole('button',{name:'Avançar meio intervalo no efeito Joule'});
 const controls=page.locator('#silm-scene-actionbar .silm-joule-controls');
 const playback=controls.locator('.silm-joule-play');
 const advanced=controls.locator('details.silm-joule-advanced');
 const panel=page.locator('#silm-joule-popover');
 const openAdvanced=async()=>{
  if(await advanced.getAttribute('open')===null)await advanced.locator('summary').click();
  await panel.waitFor({state:'visible'});
 };
 const reading=page.locator('.silm-lattice-status span');
 const causal=page.locator('#silm-assembly-stage .silm-joule-story');
 const hotspots=page.locator('#silm-assembly-stage .silm-crystal-unit[data-joule-peak]');
 await step.waitFor({state:'visible'});
 await causal.waitFor({state:'visible'});
 assert.equal(await step.evaluate(b=>!!b.closest('#silm-scene-actionbar')),true,
  'Joule não acompanha os controles do palco nas escalas da rede e do centro');
 const stepBox=await step.boundingBox();
 assert.ok(stepBox.width>=43.5&&stepBox.height>=43.5,'Avançar Joule precisa manter alvo tátil de 44 px.');
 // O modo contínuo aquece por padrão; congelamos o relógio para testar
 // valores, balanço e o avanço único sem corridas com o timer.
 if(await playback.getAttribute('aria-pressed')==='true')await playback.click();
 await openAdvanced();
 await panel.getByRole('button',{name:'Reiniciar evolução'}).click();
 await page.waitForFunction(()=>document.querySelector('.silm-lattice-status span')?.textContent.includes(' · t 0 · '));
 const supply=controls.locator('.silm-joule-supply');
 assert.equal(await supply.getAttribute('aria-pressed'),'false','Reiniciar deve desligar alimentação');
 await supply.click();
 await page.waitForFunction(()=>document.querySelector('.silm-joule-supply')?.getAttribute('aria-pressed')==='true');
 assert.equal(await causal.getAttribute('data-phase'),'generating','Corrente no instante inicial ainda não deve ser descrita como calor acumulado.');
 await step.click();
 await page.waitForFunction(()=>document.querySelector('.silm-lattice-status span')?.textContent.includes(' · t 0,5 · '));
 assert.equal(await causal.getAttribute('data-phase'),'heating','A potência Joule não foi conectada ao aquecimento na cena.');
 assert.match(await causal.textContent(),/Corrente.*Joule.*aquecimento/);
 assert.ok(await hotspots.count()>0,'A dissipação local calculada não destacou nenhum centro no palco.');
 assert.match(await reading.textContent(),/P local [\d,]+/,'Falta potência Joule no centro em evidência.');
 const value=async label=>Number((await reading.textContent()).split(' · '+label+' ')[1].split(' · ')[0].replace(',','.'));
 const timeBeforeNavigation=await value('t');
 // A translação do cristal não pode afetar o avanço da malha térmica.
 if(await details.getAttribute('open')===null)await details.locator('summary').click();
 await page.getByRole('button',{name:'Avançar uma célula no eixo a'}).click();
 assert.equal(await value('t'),timeBeforeNavigation,'Navegar não deve avançar o ensaio.');
 await page.getByRole('button',{name:'Recuar uma célula no eixo a'}).click();
 await openAdvanced();
 const jouleMap=panel.getByLabel('Mapa no metal');
 await jouleMap.selectOption('potential');
 assert.match(await reading.textContent(),/Mapa: Potencial elétrico/);
 await panel.getByLabel('Fonte elétrica').selectOption('current');
 const currentBefore=await value('I');
 const electronFlow=()=>page.locator('.silm-electron-canvas').evaluate(n=>n.silmElectrons.snapshot().currentFactor);
 const flowBefore=await electronFlow();
 await step.click();
 await page.waitForFunction(()=>document.querySelector('.silm-lattice-status span')?.textContent.includes(' · t 1 · '),undefined,{timeout:8000});
 assert.equal(await value('I'),currentBefore,'A corrente imposta mudou com a temperatura.');
 assert.equal(await electronFlow(),flowBefore,'A pista visual aplicou o efeito térmico duas vezes sob corrente imposta.');
 const warm=await value('T média');
 await supply.click();
 await page.waitForFunction(()=>document.querySelector('.silm-lattice-status span')?.textContent.includes(' · U 0 · I 0 · '),undefined,{timeout:10000});
 assert.equal(await causal.getAttribute('data-phase'),'residual','Desligar a alimentação não distinguiu calor remanescente da dissipação.');
 assert.match(await causal.textContent(),/calor residual/);
 assert.equal(await hotspots.count(),0,'A dissipação Joule visual continua ativa com corrente zero.');
 // A câmera está no Centro: ele pode coincidir com um terminal frio,
 // embora a malha completa contenha calor. Não forçar brilho em um átomo
 // localmente frio apenas para satisfazer um teste visual.
 assert.ok(await value('T média')>0,'O motor perdeu o calor armazenado ao desligar a corrente.');
 await openAdvanced();
 const residualEnergy=Number((await panel.locator('[data-quantity="storedEnergy"]').textContent()).replace(',','.'));
 assert.ok(residualEnergy>0,'O balanço não preservou o calor remanescente da malha.');
 assert.match(await panel.textContent(),/calor já acumulado continua a se redistribuir/,
  'Falta explicação de por que o calor pode persistir fora do centro visível.');
 await step.click();
 await page.waitForFunction(()=>document.querySelector('.silm-lattice-status span')?.textContent.includes(' · t 1,5 · '),undefined,{timeout:10000});
 assert.match(await reading.textContent(),/corrente imposta.* · t 1,5 · U 0 · I 0 · R [\d,]+ · P Joule 0/);
 assert.ok(await value('T média')<warm,'Desligar a fonte com terminais ao ambiente precisa permitir resfriamento.');
 assert.equal(await electronFlow(),0);
 await openAdvanced();
 const quantity=async key=>Number((await panel.locator('[data-quantity="'+key+'"]').textContent()).replace(',','.'));
 assert.equal(await quantity('power'),0);
 const balance=await quantity('jouleEnergy')+await quantity('externalEnergy')-await quantity('removedEnergy')-await quantity('storedEnergy');
 assert.ok(Math.abs(balance)<.00005,'Leituras de energia não fecham o balanço.');
 assert.match(await panel.textContent(),/energia elétrica \+ calor externo = energia armazenada \+ energia removida/i);
 await panel.getByRole('button',{name:'Reiniciar evolução'}).click();
 await page.waitForFunction(()=>document.querySelector('.silm-lattice-status span')?.textContent.includes(' · t 0 · '));
 assert.equal(await value('T média'),0);
 assert.equal(await value('I'),0);
 assert.match(await reading.textContent(),/corrente imposta/,'Reiniciar mudou a condição elétrica.');
 await panel.getByRole('button',{name:'Voltar à elétrica simples'}).click();
 assert.equal(await step.isVisible(),false);
 assert.equal(await causal.isVisible(),false,'A pista Joule permaneceu na cena após retirar o acoplamento.');
 assert.equal(await hotspots.count(),0,'Sobraram anéis de dissipação da experiência anterior.');
 assert.equal(await page.locator('.silm-crystal').getAttribute('data-field-map'),null,
  'Encerrar o acoplamento deixou o mapa Joule na cena.');
 if(viewport.width>1100){
  await page.getByRole('button',{name:'Ver',exact:true}).click();
  await direct.locator('[data-action="property-electrical"]').waitFor({state:'visible'});
  await page.keyboard.down('Control');
  await direct.locator('[data-action="property-electrical"]').click();
  await direct.locator('[data-action="property-thermal"]').click();
  await page.keyboard.up('Control');
  await step.waitFor({state:'visible'});
  for(const id of ['electrical','thermal'])assert.equal(
   await direct.locator('[data-action="property-'+id+'"]').getAttribute('aria-pressed'),
   'true','Soltar Ctrl desativou uma propriedade do par.');
  await page.getByRole('button',{name:'Fechar painel',exact:true}).click();
  assert.match(await reading.textContent(),/Efeito Joule/,'Ctrl + elétrica + térmica não ativou o mesmo motor.');
  // Clicar em Térmica novamente retira apenas o acoplamento, mantendo Elétrica.
  await page.getByRole('button',{name:'Ver',exact:true}).click();
  await direct.locator('[data-action="property-thermal"]').click();
  assert.equal(await step.isVisible(),false,'Retirar Térmica não desligou o acoplamento.');
  assert.equal(await direct.locator('[data-action="property-electrical"]').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Fechar painel',exact:true}).click();
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
