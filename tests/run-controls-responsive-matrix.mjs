// SILM Parte 9 — auditoria multirresolução das ações do palco e da Oficina.
// Navega pelo motor real: seleção, câmera, vista, módulos, rede, centro e
// permanência científica. Não basta verificar a presença dos controles.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','controle-matriz',browserName);
mkdirSync(dir,{recursive:true});
const browser=await playwright[browserName].launch({headless:true});
let page;
const evidence=[],errors=[];
const scientific=()=>page.evaluate(()=>{
 const s=SILMIntegration.snapshot();
 return JSON.stringify({metal:s.metal,properties:s.properties,electrons:s.electrons,
  measurements:s.measurements,calculations:s.calculations,unitCount:s.structure.units.length});
});
const scale=async n=>{
 await page.locator('.silm-workshop-scale[data-scale="'+n+'"]').click();
 await page.waitForFunction(n=>document.querySelector('#si-stage')?.dataset.workshopScale===String(n),n);
};
const camera=()=>page.locator('#silm-assembly-stage').evaluate(e=>e.silmRenderer.snapshot().camera);
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const res=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(res?.ok(),'Oficina indisponível');
 await page.waitForFunction(()=>window.SILM?.workshop?.valid()&&
  document.querySelector('#silm-object-entry .periodic-element[data-z="29"]'));
 await page.locator('#silm-object-entry .periodic-element[data-z="29"]').click();
 await page.locator('#silm-objects-dialog').waitFor({state:'visible'});
 await page.locator('#silm-objects-dialog [data-reference-id="atlas-cu"]')
  .getByRole('button',{name:'Investigar objeto'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===29);
 await scale(2);
 await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
 // Estilo calculado e mecanismos reais da microestrutura, incluindo diálogos.
 const microButtons=page.locator('.silm-workshop-micro-zoom-tools .silm-workshop-micro-control');
 const microAppearance=await microButtons.evaluateAll(all=>all.map(b=>{
  const css=getComputedStyle(b),rect=b.getBoundingClientRect();
  return{label:b.getAttribute('aria-label'),icon:!!b.querySelector('svg[aria-hidden="true"]'),
   width:rect.width,height:rect.height,borderRadius:css.borderRadius,
   background:css.backgroundColor,cursor:css.cursor};
 }));
 assert.ok(microAppearance.length>=6&&microAppearance.every(x=>
  x.icon&&x.width>=43.5&&x.height>=43.5&&x.borderRadius!=='0px'&&x.background!=='rgba(0, 0, 0, 0)'),
  'Controles da microestrutura sem estilo/ícones ou muito pequenos: '+JSON.stringify(microAppearance));
 const gen=page.getByRole('button',{name:'Abrir gerador de formações de grãos'});
 await gen.click();
 const formationDialog=page.locator('.silm-micro-generator-dialog');
 await formationDialog.waitFor({state:'visible'});
 const generated=await formationDialog.locator('.silm-workshop-micro-control').evaluateAll(all=>all.map(b=>({
  aria:b.getAttribute('aria-label'),icon:!!b.querySelector('svg'),height:b.getBoundingClientRect().height,
  css:getComputedStyle(b).borderRadius
 })));
 assert.ok(generated.length===4&&generated.every(x=>x.icon&&x.height>=43.5&&x.css!=='0px'),
  'Botões do gerador de formações permanecem sem estilo '+JSON.stringify(generated));
 await formationDialog.getByRole('button',{name:'Fechar configurações de formação'}).click();
 const data=page.getByRole('button',{name:'Abrir dados segmentados'});
 await data.click();
 const dataDialog=page.locator('.silm-micro-data-dialog');
 await dataDialog.waitFor({state:'visible'});
 assert.equal(await dataDialog.locator('.silm-workshop-micro-control svg').count(),2,
  'A importação de microestrutura mantém botões sem ícones');
 await dataDialog.getByRole('button',{name:'Fechar importação de dados'}).click();
 evidence.push({name:'microestutura-estilos',buttons:microAppearance,modalButtons:generated});
 await scale(3);
 await page.waitForFunction(()=>document.querySelector('.silm-crystal[data-local-focus="false"]'));
 // A construção da primeira geometria é uma mudança científica esperada.
 // A partir dela, apenas câmera/navegação podem mudar, nunca os resultados.
 const initial=await scientific();
 // Ações da câmera existem, mas só Enquadrar e um disclosure são primários.
 const bar=page.locator('#silm-view-controls .silm-camera-compact');
 assert.equal(await bar.count(),1,'A barra compacta não foi montada');
 const advanced=bar.locator('details.silm-camera-advanced');
 assert.equal(await advanced.count(),1,'Controles assistivos não estão acessíveis');
 assert.equal(await advanced.getAttribute('open'),null,'Câmera avançada deveria começar recolhida');
 assert.equal(await bar.locator('[id$="-camera-fit"]').isVisible(),true,'Enquadrar deveria estar acessível em um clique');
 assert.equal(await bar.locator('[id$="-camera-in"]').isVisible(),false,'Zoom redundante está exposto na faixa principal');
 const before=await camera();
 await advanced.locator('summary').click();
 assert.equal(await bar.locator('[id$="-camera-in"]').isVisible(),true,'Zoom não abriu no painel avançado');
 await bar.locator('[id$="-camera-in"]').click();
 const zoomed=await camera();
 assert.ok(zoomed.zoom>before.zoom,'Aproximar não modifica câmera');
 assert.equal(await scientific(),initial,'O zoom alterou a ciência');
 await advanced.locator('summary').click();
 assert.equal(await bar.locator('[id$="-camera-in"]').isVisible(),false);

 // Navegar por eixos não é pan: desloca a referência cristalográfica sem
 // redesenhar o metal nem eliminar os comandos de acessibilidade.
 const nav=page.locator('#silm-scene-actionbar .silm-lattice-nav');
 const axes=nav.locator('details.silm-lattice-more');
 assert.equal(await axes.count(),1,'Navegação avançada não existe');
 assert.equal(await axes.getAttribute('open'),null,'Eixos ocupam espaço sem necessidade');
 const neighborSelect=nav.locator('select.silm-lattice-neighbors');
 assert.equal(await neighborSelect.isVisible(),true,'Rede perdeu escolha direta de vizinhos');
 await axes.locator('summary').click();
 const next=axes.locator('button[aria-label="Avançar uma célula no eixo a"]');
 assert.equal(await next.isVisible(),true,'Translação científica por eixo deixou de ser acessível');
 if(!await next.isDisabled()){
  const prev=await page.locator('.silm-lattice-status output').textContent();
  await next.click();
  await page.waitForFunction(old=>document.querySelector('.silm-lattice-status output')?.textContent!==old,prev);
  assert.equal(await scientific(),initial,'Mover referência pela rede mudou propriedades/medições');
 }
 await axes.locator('summary').click();
 assert.equal(await next.isVisible(),false,'Eixos permaneceram expostos ao fechar');

 // O Centro mantém vizinhos e coordenação científica sem símbolos repetidos.
 await scale(4);
 await page.waitForFunction(()=>document.querySelector('.silm-crystal[data-local-focus="true"]'));
 const center=page.locator('.silm-crystal[data-local-focus="true"]');
 const centerNav=page.locator('#silm-scene-actionbar .silm-center-navigation');
 assert.equal(await centerNav.locator('details.silm-lattice-more').count(),1);
 assert.equal(await centerNav.locator('select.silm-lattice-neighbors').isVisible(),false,
  'O Centro continua com seletor duplicado permanente');
 const metrics=await center.evaluate(el=>{
  const nodes=[...el.querySelectorAll('.silm-center-neighbor')];
  return{focus:el.dataset.centerSite,coordination:Number(el.dataset.coordination),
   neighbors:nodes.length,
   nodes:nodes.map(n=>({label:n.getAttribute('aria-label'),text:n.textContent.trim(),
    w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height,disabled:n.disabled})),
   overlay:getComputedStyle(el.querySelector('.silm-cell-layer')).display};
 });
 assert.equal(metrics.neighbors,metrics.coordination,'Vizinhança não coincide com a coordenação');
 assert.ok(metrics.nodes.length>=8,'Centro perdeu a vizinhança');
 assert.ok(metrics.nodes.every(n=>!n.text&&n.label?.includes('Cu')&&n.w>=43.5&&n.h>=43.5),
  'Esferas redundantes ou alvos de toque pequenos '+JSON.stringify(metrics.nodes));
 assert.equal(metrics.overlay,'none','Centro reintroduziu a célula');
 // A seleção acessível faz exatamente a mesma navegação que tocar um vizinho.
 await centerNav.locator('summary').click();
 const select=centerNav.locator('select.silm-lattice-neighbors');
 assert.equal(await select.isVisible(),true,'Alternativa acessível a tocar um vizinho indisponível');
 const eligible=await select.locator('option:not(:disabled)[value]:not([value=""])').first().getAttribute('value');
 assert.ok(eligible,'Centro sem vizinhos elegíveis');
 await select.selectOption(eligible);
 await page.waitForFunction(previous=>document.querySelector('.silm-crystal[data-local-focus="true"]')?.dataset.centerSite!==previous,metrics.focus);
 assert.equal(await scientific(),initial,'Navegar entre centros alterou o motor científico');
 // A troca de escala também atualiza as ferramentas de Ver.
 await page.locator('[data-open-dock="ver"]').click();
 await page.waitForFunction(()=>document.querySelector('#si-dock-right')?.hidden===false);
 const direct=page.locator('#silm-direct-actionbar');
 assert.equal(await direct.locator('[data-action="unit-cell"]').count(),0,
  'Centro oferece ação sem efeito: ocultar célula');
 assert.equal(await direct.locator('[data-action="view-toggle"]').count(),0,
  'Centro oferece alternância de rede como camada local');
 assert.equal(await direct.locator('[data-action="neighbors"]').count(),0,
  'Centro oferece ocultar vizinhos embora a camada seja obrigatória');
 assert.equal(await direct.locator('[data-action="electrons"]').count(),1,
  'Centro perdeu exploração eletrônica');
 assert.equal(await direct.locator('[data-action="joule"]').count(),0,
  'Joule reapareceu como simulador independente no menu Ver');
 assert.equal(await direct.locator('[data-action="property-electrical"]').count(),1);
 assert.equal(await direct.locator('[data-action="property-thermal"]').count(),1);
 assert.match(await page.locator('.silm-observer-selection-status').first().textContent(),
  /Elétrica \+ Térmica/,'A combinação Joule não está explicada na navegação');
 await page.locator('[data-silm-module-shortcut="medir"]').click();
 assert.ok(await direct.locator('[data-silm-direct-tool="medir:distance"]').count()===1,
  'Medir deixou de oferecer instrumento direto');
 const guide=page.locator('#silm-tools .silm-module-guide');
 assert.equal(await guide.getAttribute('data-module'),'medir','Medir perdeu instrução contextual');
 await direct.locator('[data-silm-direct-tool="medir:angle"]').click();
 await page.waitForFunction(()=>document.querySelector('#silm-tools .silm-module-guide')?.textContent.includes('B será o vértice'));
 assert.match(await guide.textContent(),/Próximo ponto A de 3/,'Medir não indica o ponto da cena');
 await page.locator('[data-silm-module-shortcut="calcular"]').click();
 assert.ok(await direct.locator('[data-silm-direct-tool^="calcular:"]').count()>=1,
  'Calcular deixou de oferecer fórmulas');
 assert.equal(await guide.getAttribute('data-module'),'calcular','Calcular perdeu a relação geométrica');
 assert.match(await guide.textContent(),/Relação geométrica/,'A fórmula não explica a ação mecânica');
 await page.waitForFunction(()=>document.querySelector('.silm-crystal')?.dataset.calc==='fractions',undefined,{timeout:10000});
 assert.equal(await page.locator('.silm-crystal').getAttribute('data-calc'),'fractions',
  'Contagem geométrica não realçou as frações dos sítios');
 await page.locator('[data-silm-module-shortcut="medir"]').click();
 await page.waitForFunction(()=>document.querySelector('#silm-tools .silm-module-guide')?.textContent.includes('Selecione o instrumento acima'));
 assert.equal(await direct.locator('[data-silm-direct-tool="medir:angle"]').getAttribute('aria-pressed'),'false',
  'Trocar de módulo deixou instrumento antigo ativo');
 await page.locator('[data-silm-module-shortcut="explorar"]').click();
 // O painel Ver no mobile usa uma folha modal. Fechar a folha antes da
 // travessia evita clicar através do backdrop (bloqueio correto do produto).
 await page.locator('[data-open-dock="ver"]').click();
 await page.waitForFunction(()=>document.querySelector('#si-sheet-backdrop')?.hidden||
  getComputedStyle(document.querySelector('#si-sheet-backdrop')).display==='none');
 await scale(3);
 await page.waitForFunction(()=>document.querySelector('.silm-crystal[data-local-focus="false"]'));
 assert.equal(await direct.locator('[data-action="neighbors"]').count(),1,
  'Rede perdeu comando de vizinhos');
 assert.equal(await direct.locator('[data-action="unit-cell"]').count(),1,
  'Rede perdeu comando da célula');
 assert.equal(await page.locator('.silm-lattice-stimulus').count(),0,
  'Um segundo seletor de estímulos ainda duplica o menu Ver');
 await scale(4);
 await page.waitForFunction(()=>document.querySelector('.silm-crystal[data-local-focus="true"]'));

 // Cada largura usa a Oficina em execução, com cena, botões e Ver reais.
 const sizes=[
  ['pequeno-320',320,568],['telefone-360',360,640],
  ['telefone-390',390,844],['telefone-paisagem',844,390],
  ['tablet-retrato',768,1024],['tablet-paisagem',1024,768],
  ['notebook',1280,720],['desktop',1440,900],['monitor',1920,1080]
 ];
 for(const [name,width,height] of sizes){
  await page.setViewportSize({width,height});
  await page.waitForTimeout(80);
  const data=await page.evaluate(()=>{
   const q=sel=>document.querySelector(sel),box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
   const c=q('.silm-crystal[data-local-focus="true"]'),bar=q('#silm-view-controls .silm-camera-compact');
   const nav=q('.silm-center-navigation'),summary=q('#silm-view-controls .silm-camera-advanced-summary');
   return{width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,
    center:box(c),toolbar:box(bar),nav:box(nav),summary:box(summary),
    core:box(c?.querySelector('.silm-crystal-unit[data-local-center]')),
    coord:Number(c?.dataset.coordination||0),
    cameraButtons:[...bar.querySelectorAll('.silm-camera-btn')].filter(b=>b.getClientRects().length).length,
    moreClosed:!q('#silm-view-controls .silm-camera-advanced')?.open,
    navigationClosed:!q('.silm-center-navigation .silm-lattice-more')?.open};
  });
  assert.ok(data.documentWidth<=width+7,
   name+': conteúdo cria barra de rolagem horizontal global '+JSON.stringify(data));
  assert.ok(data.coord>=8&&data.core?.w>0,'Centro desapareceu em '+name);
  assert.ok(data.toolbar?.w>0&&data.summary?.w>=43.5&&data.summary?.h>=43.5,
   name+': câmera compacta inacessível '+JSON.stringify(data));
  assert.ok(data.cameraButtons<=2&&data.moreClosed,
   name+': barra repetida não está recolhida '+JSON.stringify(data));
  assert.equal(data.navigationClosed,true,name+': navegação avançada ocupa a cena por padrão');
  if(width<=390)assert.ok(data.toolbar.right<=width+7,
   name+': ações de câmera ultrapassam o viewport');
  evidence.push({name,...data});
  if(['pequeno-320','telefone-390','tablet-paisagem','desktop','monitor'].includes(name))
   await page.screenshot({path:join(dir,name+'.jpg'),type:'jpeg',quality:67,animations:'disabled'});
 }
 // Tipografia ampliada em tela pequena: mesmo conteúdo e comandos usáveis.
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>document.documentElement.style.fontSize='150%');
 await page.waitForTimeout(100);
 const zoomedFont=await page.evaluate(()=>({width:innerWidth,pageWidth:document.documentElement.scrollWidth,
  camera:document.querySelector('.silm-camera-advanced-summary')?.getBoundingClientRect().width,
  nav:document.querySelector('.silm-center-navigation summary')?.getBoundingClientRect().height}));
 assert.ok(zoomedFont.pageWidth<=397,'Texto ampliado gerou overflow global '+JSON.stringify(zoomedFont));
 evidence.push({name:'texto-150-390',...zoomedFont});
 assert.ok(zoomedFont.camera>=43.5&&zoomedFont.nav>=43.5,
  'Alvos comprimidos em 150% '+JSON.stringify(zoomedFont));
 // Demonstração óptica: a Oficina carrega apenas o perfil experimental de Cu.
 // O painel distingue dado de referência de aparência macroscópica real.
 await page.evaluate(()=>document.documentElement.style.fontSize='');
 await page.locator('[data-open-dock="ver"]').click();
 await direct.locator('[data-action="property-luster"]').click();
 await page.waitForFunction(()=>document.querySelector('#silm-properties .silm-optical-sample')?.dataset.evidence==='tabulated');
 const optical=await page.locator('#silm-properties .silm-optical-sample').evaluate(node=>({
  text:node.textContent,bands:[...node.querySelectorAll('meter')].map(m=>m.value),
  shown:getComputedStyle(node).display!=='none'
 }));
 assert.ok(optical.shown&&optical.bands.length===3&&optical.bands.every(n=>n>0&&n<1),
  'Perfil óptico Cu não foi exposto sem inventar refletâncias: '+JSON.stringify(optical));
 assert.match(optical.text,/Johnson|Christy/,'Falta procedência do Cu');
 assert.match(optical.text,/óxido, rugosidade|não a cor de uma peça real/,'Falta limite da referência');
 evidence.push({name:'cobre-optica-referencia',bands:optical.bands});
 // PR102 reconstruído: um experimento de superfície, sem átomos fluorescentes,
 // sem raios obrigatórios e sem copiar dados de Cu para outros metais.
 const bench=page.locator('#silm-assembly-stage .silm-optical-bench');
 await bench.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('#silm-assembly-stage .silm-optical-bench')?.dataset.appearance==='aligned');
 assert.equal(await page.locator('#silm-assembly-stage .silm-crystal-unit[data-lit]').count(),0,
  'Brilho voltou a pintar centros metálicos individualmente.');
 const eyeHandle=bench.locator('.silm-optical-bench-eye');
 const eye=bench.locator('.silm-optical-bench-angle-eye');
 const rect=await eyeHandle.boundingBox(),rangeRect=await eye.boundingBox();
 assert.ok(rect?.width>=43.5&&rect.height>=43.5,'Observador direto perdeu alvo de toque de 44 px');
 assert.ok(rangeRect?.height>=43.5,'A escala angular nativa não tem alvo de toque adequado.');
 const beforeKey=await eye.evaluate(node=>{
  window.__silmKeyProbe={events:[],before:node.value};
  node.addEventListener('keydown',e=>window.__silmKeyProbe.events.push('target-keydown:'+e.key),true);
  node.addEventListener('input',()=>window.__silmKeyProbe.events.push('target-input:'+node.value),true);
  document.addEventListener('keydown',e=>window.__silmKeyProbe.events.push('document-keydown:'+e.key),true);
  return {connected:node.isConnected,value:node.value};
 });
 // A cena pode ser remontada após trocar a propriedade ativa. Um foco colocado
 // no controle anterior não deve ser confundido com falha do teclado nativo.
 // Reobter o alvo e repetir a tecla real somente se ocorreu substituição do nó.
 let keyboardAttempts=0;
 for(;keyboardAttempts<3;keyboardAttempts++){
  const target=await eye.elementHandle();
  await eye.focus();
  await eye.press('End');
  if(await eye.inputValue()==='80')break;
  const stillSame=await eye.evaluate((node,original)=>node===original,target).catch(()=>false);
  if(stillSame)break; // Se o nó permaneceu, é defeito funcional, não corrida de montagem.
 }
 const keyProbe=await eye.evaluate(node=>({
  ...window.__silmKeyProbe,after:node.value,focused:document.activeElement===node,
  connected:node.isConnected,bench:node.closest('.silm-optical-bench')?.dataset.appearance,
  selectorCount:document.querySelectorAll('#silm-assembly-stage .silm-optical-bench-angle-eye').length
 }));
 assert.equal(await eye.inputValue(),'80','O controle angular nativo não respondeu à tecla End: '+JSON.stringify({beforeKey,keyProbe}));
 await page.waitForFunction(()=>document.querySelector('#silm-assembly-stage .silm-optical-bench')?.dataset.appearance==='away');
 // Alinhar a visão por gesto real no controle de faixa.
 await page.mouse.click(rangeRect.x+rangeRect.width*.43,rangeRect.y+rangeRect.height/2);
 await page.waitForFunction(()=>document.querySelector('#silm-assembly-stage .silm-optical-bench')?.dataset.appearance==='aligned');
 const finish=bench.locator('.silm-optical-bench-finish');
 await finish.click();
 await page.waitForFunction(()=>document.querySelector('#silm-assembly-stage .silm-optical-bench')?.dataset.appearance==='diffuse');
 assert.equal(await page.locator('#silm-properties .silm-optical-bands').isVisible(),false,
  'Dados de superfície ideal lisa apareceram como previsão para acabamento fosco.');
 await finish.click();
 await page.waitForFunction(()=>document.querySelector('#silm-assembly-stage .silm-optical-bench')?.dataset.appearance==='aligned');
 assert.equal(await page.locator('#silm-properties .silm-optical-bands').isVisible(),true);
 const incident=bench.locator('.silm-optical-bench-incident');
 assert.equal(await incident.isVisible(),false,'Raios não devem ser obrigatórios.');
 await bench.locator('.silm-optical-bench-rays').click();
 assert.equal(await incident.isVisible(),true,'Esquema de raios não foi exibido a pedido.');
 await bench.locator('.silm-optical-bench-rays').click();
 assert.equal(await incident.isVisible(),false,'O aluno não conseguiu ocultar o esquema.');
 await bench.locator('.silm-optical-bench-source').click();
 await page.waitForFunction(()=>document.querySelector('#silm-assembly-stage .silm-optical-bench')?.dataset.appearance==='off');
 await bench.locator('.silm-optical-bench-source').click();
 await page.waitForFunction(()=>document.querySelector('#silm-assembly-stage .silm-optical-bench')?.dataset.appearance==='aligned');
 evidence.push({name:'brilho-refeito',observer:80,finish:'polished/matte',raysOptional:true,unlit:true});
 assert.deepEqual(errors,[],errors.join(' | '));
 await context.close();
}catch(e){evidence.push({error:String(e),stack:e.stack});throw e;}
finally{writeFileSync(join(dir,'auditoria.json'),JSON.stringify({evidence,errors},null,2));await browser.close();}
