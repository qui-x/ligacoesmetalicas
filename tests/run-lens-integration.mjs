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
 const discoveryCard=page.locator('.silm-workshop-card[data-reference-id="atlas-cu"]');
 const discoveryLink=discoveryCard.locator('.silm-workshop-manual-link');
 assert.equal(await discoveryCard.locator('details').count(),0,
  'Cartão de descoberta ainda coloca fontes dentro do palco');
 assert.match(await discoveryLink.getAttribute('href'),/topico=aplicacoes-metalicas&referencia=atlas-cu/,
  'Manual não preserva a referência do componente');
 const conciseCard=await discoveryCard.locator('.silm-workshop-card-body').innerText();
 assert.ok(conciseCard.length<125,'Cartão introdutório ficou com texto excessivo');
 await discoveryCard.getByRole('button',{name:'Investigar componente'}).click();
 await page.waitForFunction(()=>SILMIntegration?.snapshot?.()?.metal?.atomicNumber===29);
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===1&&SILM.lensController.inspect().attached);
 assert.equal(await page.locator('.silm-lens-layer').count(),1,'Lente duplicada na cena');
 assert.equal(await page.locator('.silm-lens-circle:visible').count(),0,'Lente deve iniciar desativada');
 const toggle=page.locator('.silm-lens-toggle');
 assert.equal(await toggle.getAttribute('aria-pressed'),'false');
 // Os comandos devem ocupar a Travessia, nunca a fotografia, os grãos ou a rede.
 async function checkLensDocked(label){
  const layout=await page.evaluate(()=>{
   const actions=document.querySelector('.silm-lens-actions');
   const nav=document.querySelector('.silm-workshop-scales');
   const lens=document.querySelector('.silm-lens-layer');
   const visibleButtons=[...actions.querySelectorAll('button')].filter(b=>
    !b.hidden&&getComputedStyle(b).display!=='none');
   const bounds=el=>{
    const r=el.getBoundingClientRect();
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
   };
   return {inNav:!!nav?.contains(actions),inLens:!!lens?.contains(actions),
    actions:bounds(actions),nav:bounds(nav),buttons:visibleButtons.map(bounds),
    viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  assert.equal(layout.inNav,true,label+': comandos da lente fora da Travessia');
  assert.equal(layout.inLens,false,label+': botões da lente cobrem a cena');
  assert.ok(layout.actions.left>=layout.nav.left-2&&layout.actions.right<=layout.nav.right+2,
   label+': comandos não cabem na navegação '+JSON.stringify(layout));
  assert.ok(layout.buttons.length>=1&&layout.buttons.every(b=>b.width>=43.5&&b.height>=43.5),
   label+': alvos da lente inferiores a 44 px');
  assert.ok(layout.scrollWidth<=layout.viewport+5,
   label+': comandos causaram overflow global '+JSON.stringify(layout));
 }
 await checkLensDocked('objeto-390');
 // O palco não é um capítulo do Manual: há somente o atalho contextual.
 assert.equal(await page.locator('.silm-workshop-science-details').count(),0,
  'Fontes e limitações permanecem no palco do Objeto');
 const objectManual=page.locator('.silm-workshop-reference-summary .silm-workshop-manual-link');
 assert.match(await objectManual.getAttribute('href'),/topico=aplicacoes-metalicas&referencia=atlas-cu/);
 const objectImage=page.locator('.silm-workshop-reference-art');
 const imageArea=await objectImage.boundingBox();
 assert.ok(imageArea?.height>=215,'Objeto: fotografia perdeu espaço no celular');
 assert.ok(imageArea.height>=470,'Objeto: enquadramento alto não ocupou o espaço disponível em 390×844');
 const imageGeometry=await page.evaluate(()=>{
  const img=document.querySelector('.silm-workshop-reference-art img');
  const layer=document.querySelector('.silm-workshop-reference-art>.silm-lens-layer');
  if(!img||!layer||!img.naturalWidth||!img.naturalHeight)return null;
  const i=img.getBoundingClientRect(),l=layer.getBoundingClientRect();
  const scale=Math.min(i.width/img.naturalWidth,i.height/img.naturalHeight);
  const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  const fitted={left:i.left+(i.width-w)/2,top:i.top+(i.height-h)/2,width:w,height:h};
  return {fitted,layer:{left:l.left,top:l.top,width:l.width,height:l.height}};
 });
 assert.ok(imageGeometry,'Objeto: não foi possível aferir fotografia e lente');
 const decorative=await page.evaluate(()=>{
  const art=document.querySelector('.silm-workshop-reference-art');
  const pseudo=getComputedStyle(art,'::before');
  return {background:pseudo.backgroundImage,pointerEvents:pseudo.pointerEvents,
   imageVar:art.style.getPropertyValue('--silm-object-ambient-image'),
   original:art.querySelector('img')?.getAttribute('src')};
 });
 assert.ok(decorative.original&&decorative.imageVar.includes(decorative.original),
  'Fundo decorativo não usa a mesma foto da investigação');
 assert.notEqual(decorative.background,'none','Enquadramento alto ainda tem faixas vazias');
 assert.equal(decorative.pointerEvents,'none',
  'Fundo decorativo capturou eventos reservados à lente e à fotografia');

 const {fitted,layer}=imageGeometry;
 for(const key of ['left','top','width','height'])
  assert.ok(Math.abs(fitted[key]-layer[key])<=3,
   'Lente está sobre uma faixa vazia da fotografia ('+key+'): '+JSON.stringify(imageGeometry));

 const objectHeading=await page.locator('.silm-workshop-reference-summary h2').boundingBox();
 assert.ok(objectHeading&&objectHeading.y>=imageArea.y+imageArea.height-2,
  'Objeto: título sobreposto à imagem no celular: '+JSON.stringify({imageArea,objectHeading}));
 assert.match(await page.locator('.silm-workshop-reference-art figcaption').textContent(),
  /Ilustração gerada por IA/,'Proveniência semântica da figura foi descartada');
 const manualTopics=await page.evaluate(()=>SILM.manual.topics.map(t=>t.id));
 for(const topic of ['aplicacoes-metalicas','graos-microestrutura','travessia-escalas'])
  assert.ok(manualTopics.includes(topic),'Manual sem tópico '+topic);
 // A troca de componente não deve se converter num segundo painel abaixo da foto.
 const alternatives=page.locator('.silm-workshop-reference-summary>.silm-workshop-alternatives');
 assert.equal(await alternatives.count(),1,'Lista de outros objetos ausente no contexto do Objeto');
 assert.equal(await alternatives.getAttribute('open'),null,'Lista de aplicações não inicia recolhida');
 assert.equal(await page.locator('.silm-workshop-reference>.silm-workshop-alternatives').count(),0,
  'Aplicações ainda ocupam uma faixa permanente sob a fotografia');
 const available=await page.evaluate(()=>SILM.workshop.list(29).length-1);
 assert.equal(Number(await alternatives.getAttribute('data-alternative-count')),available,
  'Contagem de outras aplicações diferente do catálogo');
 const alternativeBefore=JSON.parse(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())));
 const initialRef=alternativeBefore.metadata.workshop.referenceId;
 const imageBeforeAlternatives=await objectImage.boundingBox();
 await alternatives.locator('summary').click();
 const altItems=alternatives.locator('button[data-reference-id]');
 assert.equal(await altItems.count(),available,'Alternativas não correspondem ao catálogo');
 assert.ok(await altItems.first().isVisible(),'Alternativas não podem ser acessadas');
 const alternativeLayout=await page.evaluate(()=>{
  const image=document.querySelector('.silm-workshop-reference-art').getBoundingClientRect();
  const panel=document.querySelector('.silm-workshop-alternatives').getBoundingClientRect();
  const b=[...document.querySelectorAll('.silm-workshop-alternative')]
   .filter(n=>n.getBoundingClientRect().height>0)
   .map(n=>n.getBoundingClientRect().height);
  return {imageHeight:image.height,panelLeft:panel.left,panelRight:panel.right,
   viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,heights:b};
 });
 assert.ok(Math.abs(alternativeLayout.imageHeight-imageBeforeAlternatives.height)<2,
  'Abrir aplicações diminuiu o espaço da fotografia');
 assert.ok(alternativeLayout.panelRight<=alternativeLayout.viewport+2&&
  alternativeLayout.documentWidth<=alternativeLayout.viewport+5,
  'Aplicações provocaram overflow horizontal no celular');
 assert.ok(alternativeLayout.heights.every(h=>h>=43.5),
  'Botões de troca de aplicação menores que 44 px');
 await page.screenshot({path:join(path,'objeto-outras-aplicacoes.jpg'),type:'jpeg',quality:68});
 const nextRef=await altItems.first().getAttribute('data-reference-id');
 assert.notEqual(nextRef,initialRef,'A troca não pode escolher a mesma aplicação');
 await altItems.first().click();
 await page.waitForFunction(ref=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId===ref,nextRef);
 await page.waitForFunction(()=>SILM.lensController.inspect().attached&&SILM.lensController.inspect().scale===1);
 assert.equal(await page.locator('.silm-workshop-selected-title').textContent(),
  await page.evaluate(ref=>SILM.workshop.get(ref).title,nextRef),
  'Objeto não atualizou a referência visual');
 assert.equal((await page.evaluate(()=>SILMIntegration.snapshot())).metal.atomicNumber,29,
  'Trocar aplicação modificou o elemento metálico investigado');
 const returnList=page.locator('.silm-workshop-alternatives');
 await returnList.locator('summary').click();
 await returnList.locator('button[data-reference-id="'+initialRef+'"]').click();
 await page.waitForFunction(ref=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId===ref,initialRef);
 await page.waitForFunction(()=>SILM.lensController.inspect().attached&&SILM.lensController.inspect().scale===1);
 const alternativeAfter=JSON.parse(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())));
 for(const key of ['metal','structure','module','properties','measurements','calculations']){
  assert.deepEqual(alternativeAfter[key],alternativeBefore[key],
   'Trocar e retornar de aplicação modificou '+key);
 }
 assert.equal(alternativeAfter.metadata.workshop.referenceId,initialRef,
  'Objeto original não foi restaurado');
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
 await ring.focus();
 await ring.press('Home');
 assert.deepEqual(await page.evaluate(()=>SILM.lensController.inspect().position),[.5,.5]);
 // Marco 2: marcar uma REGIÃO VISUAL não faz amostragem do material.
 await page.locator('.silm-lens-mark').click();
 const objectMark=await page.evaluate(()=>SILM.lensController.inspect().selected);
 assert.equal(objectMark?.kind,'object','A lente não marcou a ilustração do Objeto');
 assert.match(objectMark?.label||'',/Região visual/);
 assert.ok((await page.locator('.silm-lens-selection').innerText()).includes('sem amostra medida'));
 const liveStatus=page.locator('.silm-lens-selection');
 assert.equal(await liveStatus.getAttribute('role'),'status');
 assert.equal(await liveStatus.getAttribute('aria-live'),'polite');
 const overlaySize=await liveStatus.boundingBox();
 assert.ok(overlaySize?.width<=2&&overlaySize?.height<=2,
  'Texto explicativo da lente ainda cobre a imagem');

 assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),baseline,
  'Marcar imagem alterou o estado científico da investigação');
 // Mover a lente não é equivalente a remarcar o Objeto.
 await ring.focus();
 await ring.press('ArrowLeft');
 assert.deepEqual(await page.evaluate(()=>SILM.lensController.inspect().selected),objectMark,
  'Mover a lente alterou a região visual antes da confirmação');
 await ring.focus();
 await ring.press('Home');
 await page.screenshot({path:join(path,'objeto.jpg'),type:'jpeg',quality:68});

 // Os próprios botões da oficina movimentam o motor. O controller apenas
 // reaproveita o DOM ativo; não processa micrografias nem geometria atômica.
 await page.locator('.silm-workshop-scale[data-scale="2"]').click();
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===2&&
  SILM.lensController.inspect().targetClass.includes('micro-viewport'));
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
 await checkLensDocked('graos-390');
 assert.equal(await page.locator('.silm-workshop-micro-info').count(),0,
  'Limitações e fontes ainda ocupam a área de Grãos');
 assert.equal(await page.locator('.silm-workshop-micro-atlas-reference').count(),0,
  'Imagem do atlas ainda ocupa uma segunda área da investigação');
 const grainManual=page.locator('.silm-workshop-micro-heading .silm-workshop-manual-link');
 assert.match(await grainManual.getAttribute('href'),/topico=graos-microestrutura&referencia=atlas-cu/);
 assert.equal(await page.locator('.silm-workshop-micro-dimension').isVisible(),true,
  'Aviso físico obrigatório foi removido junto com as explicações');
 const grainless=await page.locator('.silm-micro-grain').count();
 assert.ok(grainless>5,'O gerador real de grãos não foi preservado');
 const firstPath=await page.locator('.silm-micro-grain').first().getAttribute('d');
 // O ResizeObserver pode readaptar a câmera ao fechar o disclosure.
 // Só comparar viewBox após a estabilização do enquadramento com o quadro.
 await page.waitForFunction(()=>{
  const svg=document.querySelector('.silm-workshop-micro-map');
  const frame=svg?.closest('.silm-workshop-micro-viewport')?.getBoundingClientRect();
  const box=svg?.viewBox?.baseVal;
  return frame?.height>5&&box?.height>5&&
   Math.abs(frame.width/frame.height-box.width/box.height)<.04;
 },null,{timeout:3000});
 const readMicroCamera=()=>page.locator('.silm-workshop-micro-map').evaluate(svg=>{
  const rect=svg.closest('.silm-workshop-micro-viewport').getBoundingClientRect();
  return {viewBox:svg.getAttribute('viewBox'),frameWidth:rect.width,
   frameHeight:rect.height,zoom:svg.dataset.zoom};
 });
 const mapBefore=await readMicroCamera();
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
 const mapAfter=await readMicroCamera();
 assert.equal(mapAfter.zoom,mapBefore.zoom,'Marcar grão mudou o zoom');
 const frameStable=Math.abs(mapAfter.frameWidth-mapBefore.frameWidth)<1&&
  Math.abs(mapAfter.frameHeight-mapBefore.frameHeight)<1;
 if(frameStable){
  assert.equal(mapAfter.viewBox,mapBefore.viewBox,
   'Marcar grão moveu a câmera com quadro geométrico constante');
 }else{
  const ratio=mapAfter.viewBox.split(' ').map(Number);
  assert.ok(Math.abs(ratio[2]/ratio[3]-mapAfter.frameWidth/mapAfter.frameHeight)<.05,
   'ResizeObserver não ajustou o mapa após redimensionar o quadro');
 }
 assert.equal(await page.locator('.silm-micro-grain').first().getAttribute('d'),firstPath,
  'Marcar grão alterou o contorno geométrico');
 assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),grainScientificBefore,
  'Destacar um grão didático alterou o snapshot científico');
 // A geometria usada para marcar precisa continuar correta com a câmera SVG
 // ampliada: não basta escolher o primeiro grão ou o mais próximo.
 await ring.focus();
 await ring.press('Home');
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

 await page.locator('.silm-workshop-scale[data-scale="3"]').click();
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===3&&
  SILM.lensController.inspect().attached);
 const stageContext=page.locator('.silm-workshop-reference-summary--stage');
 assert.equal(await stageContext.count(),1,'Rede não tem cabeçalho de metal compacto');
 assert.equal(await stageContext.locator('.silm-workshop-selected-title').count(),0,
  'Referência do objeto repetida dentro da Rede');
 assert.ok((await stageContext.innerText()).trim().length<48,
  'Cabeçalho da Rede tem explicações repetidas: '+await stageContext.innerText());
 assert.equal(await page.locator('#silm-integration-scene .silm-scene-caption:visible').count(),0,
  'Etiqueta duplicada ocupa a representação científica');
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===3&&
  SILM.lensController.inspect().targetClass.includes('silm-assembly-stage'));
 assert.ok(await page.locator('.silm-crystal-stage').count(),
  'A lente substituiu o renderizador cristalográfico');
 await page.screenshot({path:join(path,'rede.jpg'),type:'jpeg',quality:68});
 await page.setViewportSize({width:1366,height:768});
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

 // Parte 8: a lente acompanha a Oficina unificada e nunca cria outro motor.
 // As mudanças de módulo usam o seletor científico original do SILM.
 await page.setViewportSize({width:1366,height:768});
 const stableBeforeModules=await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
 const shortcuts=page.locator('#silm-module-shortcuts [data-silm-module-shortcut]');
 assert.equal(await shortcuts.count(),3,'Travessia integrada perdeu os três módulos');
 for(const module of ['medir','calcular','explorar']){
  const button=page.locator('[data-silm-module-shortcut="'+module+'"]');
  await button.click();
  await page.waitForFunction(n=>SILMIntegration.snapshot()?.module?.active===n,module);
  await page.waitForFunction(()=>SILM.lensController.inspect().attached&&SILM.lensController.inspect().scale===4);
  assert.equal(await page.locator('#silm-module').inputValue(),module,
   'Atalho de módulo não usa o seletor científico original');
  assert.deepEqual(await shortcuts.evaluateAll(nodes=>nodes.filter(n=>
   n.getAttribute('aria-pressed')==='true').map(n=>n.dataset.silmModuleShortcut)),[module],
   'Estado visual do módulo ativo inconsistente com o motor');
  assert.equal(await page.locator('.silm-lens-layer').count(),1,
   'Troca de módulo duplicou o DOM da lente');
 }
 // A troca de módulo atualiza legitimamente o carimbo updatedAt do ensaio.
 // Isso não é mutação física: comparar o snapshot COMPLETO salvo esse carimbo.
 const stableAfterModules=await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
 const scientificWithoutAuditTime=value=>{
  const data=JSON.parse(value);
  if(data.investigation)delete data.investigation.updatedAt;
  return data;
 };
 assert.deepEqual(scientificWithoutAuditTime(stableAfterModules),
  scientificWithoutAuditTime(stableBeforeModules),
  'Módulos alteraram estrutura, metal, propriedades, medições ou contexto');
 // Abrir os painéis originais não pode instanciar outras lentes nem docas extras.
 for(const section of ['montagem','ver','dados']){
  await page.locator('[data-open-dock="'+section+'"]').click();
  await page.waitForFunction(n=>document.querySelector('[data-open-dock="'+n+'"]')
   ?.getAttribute('aria-expanded')==='true',section);
  const opened=await page.locator('.si-launchers [data-open-dock][aria-expanded="true"]')
   .evaluateAll(nodes=>nodes.map(b=>b.dataset.openDock));
  assert.deepEqual(opened,[section],'Duas docas simultâneas ao usar a lente');
  assert.equal(await page.evaluate(()=>SILM.lensController.inspect().attached),true,
   'Abrir painel removeu lente do Foco');
  assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),stableAfterModules,
   'Abrir Montagem/Ver/Dados alterou o experimento');
 }
 await page.locator('[data-close-dock="right"]').click();
 await page.screenshot({path:join(path,'lente-travessia-modulos.jpg'),type:'jpeg',quality:70});

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
  const b=[...document.querySelectorAll('.silm-lens-tool:not([hidden])')]
   .filter(x=>getComputedStyle(x).display!=='none')
   .map(x=>x.getBoundingClientRect());
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
 await checkLensDocked('centro-320');
 await page.screenshot({path:join(path,'centro-mobile.jpg'),type:'jpeg',quality:68});
 // Regressão do Marco 2 na largura mínima: o controle de marcação
 // precisa funcionar sem adicionar menus nem alargar o documento.
 await page.locator('.silm-workshop-scale[data-scale="2"]').click();
 await page.waitForFunction(()=>SILM.lensController.inspect().scale===2);
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
 await checkLensDocked('graos-320');
 await ring.focus();
 await ring.press('Home');
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
