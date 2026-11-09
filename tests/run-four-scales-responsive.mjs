// Regressão das quatro escalas SILM: espaço útil, navegação, estado e foco.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir=join('reports','quatro-escalas',browserName);mkdirSync(dir,{recursive:true});
const sizes=[
 ['celular-320',320,568],['celular-390',390,844],['celular-414',414,896],
 ['paisagem-curta',844,390],['tablet-retrato',768,1024],['tablet-paisagem',1024,768],
 ['notebook',1366,768],['desktop',1440,900],['full-hd',1920,1080]
];
const metrics=[];
const browser=await playwright[browserName].launch({headless:true});
async function sample(page){
 return page.evaluate(()=>{
  const stage=document.querySelector('#si-stage');
  const ref=stage.querySelector('.silm-workshop-reference');
  const nav=ref?.querySelector('.silm-workshop-scales');
  const buttons=nav?[...nav.querySelectorAll('button')]:[];
  const traversal=ref?.querySelector('.silm-workshop-traversal');
  const arrows=traversal?[...traversal.querySelectorAll('.silm-workshop-traverse')]:[];
  const art=ref?.querySelector('.silm-workshop-reference-art');
  const image=art?.querySelector('img');
  const micro=ref?.querySelector('.silm-workshop-micro-viewport');
  const tools=ref?.querySelector('.silm-workshop-micro-toolbar');
  const scene=stage.querySelector('.silm-crystal .silm-assembly-area');
  const stageCanvas=stage.querySelector('.silm-crystal-stage');
  const action=document.querySelector('#silm-scene-actionbar');
  const q=n=>{if(!n)return null;const r=n.getBoundingClientRect();return{
   left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
  return {
   viewport:[innerWidth,innerHeight],scale:stage.dataset.workshopScale,
   documentWidth:document.documentElement.scrollWidth,
   stage:q(stage),reference:q(ref),nav:q(nav),buttons:buttons.map(q),
   traversal:q(traversal),arrows:arrows.map(b=>({disabled:b.disabled,
    visible:getComputedStyle(b).display!=='none',rect:q(b)})),
   current:buttons.filter(b=>b.getAttribute('aria-current')==='step').map(b=>b.dataset.scale),
   art:q(art),image:q(image),imageLoaded:!!image&&image.complete&&image.naturalWidth>0,
   micro:q(micro),microTools:q(tools),scene:q(scene),stageCanvas:q(stageCanvas),
   action:q(action),
   focusScroll:stage.querySelector('#workspace-focus')?.scrollHeight||0,
   focusClient:stage.querySelector('#workspace-focus')?.clientHeight||0
  };
 });
}
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'SILM não abriu');
 await page.waitForFunction(()=>window.SILM?.workshop?.valid()&&!document.querySelector('#silm-workshop-context')?.hidden);
 const table=page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'});
 await table.click();
 await page.locator('#silm-periodic-dialog [data-z="29"]').click();
 await page.locator('#silm-periodic-dialog [id$="-explore"]').click();
 await page.locator('.silm-workshop-card[data-reference-id="atlas-cu"]').getByRole('button',{name:'Investigar componente'}).click();
 await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===29);
 const scientific=await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
 // A Travessia atua no motor já existente; teclado e setas não iniciam novo ensaio.
 const signature=()=>page.evaluate(()=>{
  const s=SILMIntegration.snapshot();
  return JSON.stringify({metal:s.metal?.atomicNumber,investigation:s.investigation?.id,module:s.module?.active});
 });
 const beforeTraversal=await signature();
 await page.locator('.silm-workshop-scale[data-scale="1"]').click();
 await page.locator('.silm-workshop-scale[data-scale="1"]').focus();
 await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('#si-stage')?.dataset.workshopScale==='2');
 await page.locator('.silm-workshop-scale[data-scale="2"]').focus();
 await page.keyboard.press('End');
 await page.waitForFunction(()=>document.querySelector('#si-stage')?.dataset.workshopScale==='4');
 await page.locator('.silm-workshop-scale[data-scale="4"]').focus();
 await page.keyboard.press('Home');
 await page.waitForFunction(()=>document.querySelector('#si-stage')?.dataset.workshopScale==='1');
 assert.equal(await page.locator('.silm-workshop-traverse[data-direction="prev"]').isDisabled(),true,
  'Seta anterior deveria estar desabilitada no Objeto');
 await page.setViewportSize({width:1366,height:768});
 await page.locator('.silm-workshop-traverse[data-direction="next"]').click();
 await page.waitForFunction(()=>document.querySelector('#si-stage')?.dataset.workshopScale==='2');
 await page.locator('.silm-workshop-traverse[data-direction="prev"]').click();
 await page.waitForFunction(()=>document.querySelector('#si-stage')?.dataset.workshopScale==='1');
 assert.equal(await signature(),beforeTraversal,'Travessia alterou identidade do experimento');
 await page.setViewportSize({width:390,height:844});
 for(const [label,width,height] of sizes){
  await page.setViewportSize({width,height});
  for(const scale of [1,2,3,4]){
   const target=page.locator('.silm-workshop-scale[data-scale="'+scale+'"]');
   await target.waitFor({state:'visible'});
   await target.click();
   await page.waitForFunction(n=>document.querySelector('#si-stage')?.dataset.workshopScale===String(n),scale);
   if(scale===2)await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
   await page.waitForTimeout(90);
   const m=await sample(page);metrics.push({label,...m});
   assert.equal(m.scale,String(scale),label+': escala errada');
   assert.ok(m.documentWidth<=width+6,label+': rolagem global horizontal '+m.documentWidth+'/'+width);
   assert.ok(m.stage&&m.stage.width>=Math.min(width-36,240),label+': palco comprimido');
   assert.ok(m.nav&&m.buttons.length===4,label+': navegação de quatro escalas ausente');
   assert.ok(m.traversal&&m.arrows.length===2,label+': controles da Travessia ausentes');
   assert.deepEqual(m.current,[String(scale)],label+': escala corrente não identificada');
   if(width>=651)assert.ok(m.arrows.every(x=>x.visible&&x.rect.height>=43.5),
    label+': setas da Travessia não têm alvo adequado');
   if(width<=650)assert.ok(m.arrows.every(x=>!x.visible),
    label+': setas comprimem a navegação direta no celular');
   if(scale===1)assert.equal(m.arrows[0].disabled,true,label+': seta anterior ativa no início');
   if(scale===4)assert.equal(m.arrows[1].disabled,true,label+': seta próxima ativa no final');
   assert.ok(m.buttons.every(x=>x.height>=43.5),label+': botões de escala menores que 44 px');
   assert.ok(m.buttons.every(x=>Math.abs(x.top-m.buttons[0].top)<3),
    label+': navegação quebrou em mais de uma linha na escala '+scale);
   assert.ok(m.buttons.every(x=>x.left>=m.nav.left-3&&x.right<=m.nav.right+3),
    label+': escala fora dos limites do palco');
   assert.ok(m.nav.top<=m.stage.bottom &&m.nav.bottom<=m.stage.bottom+5,
    label+': navegação de escala saiu da região central');
   if(scale===1){
    assert.ok(m.imageLoaded,label+': imagem macro não carregou');
    assert.ok(m.art&&m.art.width>=Math.min(250,m.stage.width*.65),
     label+': imagem macro comprimida '+JSON.stringify(m.art));
    if(width>=1000&&height>=600)assert.ok(m.art.width>=m.reference.width*.58,
     label+': imagem ocupa menos de 58% da largura do cartão macro');
    if(height>=550)assert.ok(m.art.height>=Math.min(175,m.stage.height*.27),
     label+': visual macro verticalmente pequeno');
   }
   if(scale===1&&label==='celular-390'){
    const details=page.locator('.silm-workshop-materials');
    await details.locator('summary').click();
    assert.match(await details.innerText(),/Material do componente:/,
     'Resumo compacto escondeu a identificação científica do material');
    assert.match(await details.innerText(),/Composição e fonte|Fonte da aplicação/,
     'As referências da aplicação devem continuar consultáveis');
    await details.locator('summary').click();
   }
   if(scale===2){
    assert.ok(m.micro&&m.micro.width>=Math.min(260,m.stage.width*.75),
     label+': largura da microestrutura ficou pequena');
    assert.ok(m.microTools&&m.microTools.top>=m.micro.bottom-4,
     label+': controles não estão abaixo do desenho');
    if(height>=550)assert.ok(m.micro.height>=Math.min(190,m.stage.height*.36),
     label+': visualização de grãos verticalmente comprimida '+JSON.stringify(m));
   }
   if(scale>=3){
    assert.ok(m.scene&&m.stageCanvas,
     label+': rede/centro sem visualização científica');
    assert.ok(m.scene.width>=Math.min(240,m.stage.width*.50),
     label+': rede/centro usa pouca largura');
    assert.ok(m.action&&m.action.height>=40,
     label+': faixa instrumental sumiu');
   }
   // P0: em Objeto/Grãos, a CSS de altura não pode ressuscitar Foco
   // quando a Base SI troca para Visão geral. Reproduz a tela do usuário
   // com desktop largo e o mesmo fluxo nos celulares.
   if(scale<=2&&['celular-390','notebook','desktop'].includes(label)){
    await page.locator('[data-scene-view="overview"]').click();
    await page.waitForFunction(()=>document.querySelector('#si-workspace')?.dataset.viewMode==='overview');
    const views=await page.evaluate(()=>{
     const focus=document.querySelector('#workspace-focus');
     const overview=document.querySelector('#workspace-overview');
     const scene=document.querySelector('#si-stage');
     const a=focus.getBoundingClientRect(),b=overview.getBoundingClientRect(),
      s=scene.getBoundingClientRect();
     return {mode:document.querySelector('#si-workspace').dataset.viewMode,
      focusHidden:focus.hidden,focusDisplay:getComputedStyle(focus).display,
      focusWidth:a.width,overviewHidden:overview.hidden,
      overviewDisplay:getComputedStyle(overview).display,
      overviewWidth:b.width,stageWidth:s.width,
      managerWidth:document.querySelector('#silm-comparison-items').getBoundingClientRect().width};
    });
    assert.equal(views.focusHidden,true,label+': Foco não recebeu hidden');
    assert.equal(views.focusDisplay,'none',
     label+': Foco continuou desenhado atrás da Visão geral: '+JSON.stringify(views));
    assert.ok(views.focusWidth<1,label+': Foco ocupa a primeira coluna da tela');
    assert.equal(views.overviewHidden,false,label+': Visão geral continua oculta');
    assert.notEqual(views.overviewDisplay,'none',label+': Visão geral desapareceu');
    assert.ok(views.overviewWidth>=views.stageWidth*.84,
     label+': gerenciamento comprimido à direita: '+JSON.stringify(views));
    assert.ok(views.managerWidth>=views.stageWidth*.72,
     label+': cartões do gerenciamento estão espremidos: '+JSON.stringify(views));
    if(label==='notebook'||label==='celular-390')
     await page.screenshot({path:join(dir,label+'-visao-geral-escala-'+scale+'.jpg'),
      type:'jpeg',quality:72,animations:'disabled'});
    await page.locator('[data-scene-view="focus"]').click();
    await page.waitForFunction(()=>document.querySelector('#si-workspace')?.dataset.viewMode==='focus');
    const back=await page.evaluate(()=>({
     focusDisplay:getComputedStyle(document.querySelector('#workspace-focus')).display,
     overviewDisplay:getComputedStyle(document.querySelector('#workspace-overview')).display
    }));
    assert.notEqual(back.focusDisplay,'none',label+': Foco não voltou');
    assert.equal(back.overviewDisplay,'none',label+': Visão geral não foi escondida ao voltar');
   }
  }
  if(['celular-390','paisagem-curta','desktop'].includes(label)){
   await page.screenshot({path:join(dir,label+'-centro.jpg'),type:'jpeg',quality:70,animations:'disabled'});
  }
 }
 assert.deepEqual(errors,[],errors.join('; '));
 // Mudanças de escala não devem alterar a identidade e módulo científicos.
 const after=await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
 assert.equal(JSON.parse(after).metal.atomicNumber,29,'Trocar a escala mudou o metal');
 assert.equal(JSON.parse(scientific).metal.atomicNumber,29,'Metal inicial incorreto');
 console.log('OK '+browserName+': 4 escalas x '+sizes.length+' tamanhos, navegação e áreas visuais revisadas');
 await context.close();
}finally{
 writeFileSync(join(dir,'metricas.json'),JSON.stringify(metrics,null,2)+'\n');
 await browser.close();
}
