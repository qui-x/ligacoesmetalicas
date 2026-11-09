// Matriz obrigatória: escala × modo × largura, sem usar dados fictícios.
// Regressões cobertas: Foco/Visão geral ao mesmo tempo, cartões comprimidos,
// desaparecimento de botões, alteração científica ao abrir painéis e PWA.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const evidenceDir=join('reports','contratos-regressao',browserName);
mkdirSync(evidenceDir,{recursive:true});
const viewports=[
 ['celular-320',320,568],['celular-390',390,844],
 ['celular-horizontal',844,390],['tablet',768,1024],
 ['notebook',1366,768],['desktop',1440,900]
];
const reports=[];
const browser=await playwright[browserName].launch({headless:true});
let page;
const scientific=()=>page.evaluate(()=>{
 const state=window.SILMIntegration.snapshot();
 return JSON.stringify({
  metal:state.metal?.atomicNumber,investigationId:state.investigation?.id,
  module:state.module?.active,structure:state.structure,
  properties:state.properties,electrons:state.electrons,
  measurements:state.measurements,calculations:state.calculations
 });
});
const visual=()=>page.evaluate(()=>{
 const root=document.querySelector('#si-workspace'),stage=document.querySelector('#si-stage');
 const focus=document.querySelector('#workspace-focus'),overview=document.querySelector('#workspace-overview');
 const focusRect=focus.getBoundingClientRect(),overviewRect=overview.getBoundingClientRect(),
  stageRect=stage.getBoundingClientRect();
 const cards=[...overview.querySelectorAll('.silm-structure-card')];
 const visible=n=>n&&!n.hidden&&getComputedStyle(n).display!=='none';
 const overviewActions=[...overview.querySelectorAll('.silm-structure-card-actions button')]
  .filter(visible).map(b=>b.getBoundingClientRect());
 const nav=[...document.querySelectorAll('.silm-workshop-scale')];
 const scalePressed=nav.filter(b=>b.getAttribute('aria-pressed')==='true');
 const launcher=[...document.querySelectorAll('[data-open-dock]')];
 return {
  mode:root.dataset.viewMode,scale:stage.dataset.workshopScale,
  focusHidden:focus.hidden,focusDisplay:getComputedStyle(focus).display,
  overviewHidden:overview.hidden,overviewDisplay:getComputedStyle(overview).display,
  focusRect:{width:focusRect.width,height:focusRect.height},
  overviewRect:{width:overviewRect.width,height:overviewRect.height},
  stageRect:{width:stageRect.width,height:stageRect.height},
  managerWidth:document.querySelector('#silm-comparison-items').getBoundingClientRect().width,
  cards:cards.length,overviewActions:overviewActions.length,
  selectedScales:scalePressed.map(b=>b.dataset.scale),nav:nav.length,
  launcher:launcher.map(b=>({id:b.dataset.openDock,expanded:b.getAttribute('aria-expanded')})),
  bodyScrollWidth:document.documentElement.scrollWidth,
  viewportWidth:document.documentElement.clientWidth
 };
});
async function checkModes(label,scale,width,height){
 const before=await scientific();
 const overviewTab=page.locator('[data-scene-view="overview"]'),
  focusTab=page.locator('[data-scene-view="focus"]');
 await overviewTab.click();
 await page.waitForFunction(()=>document.querySelector('#si-workspace')?.dataset.viewMode==='overview');
 const ov=await visual();reports.push({label,scale,mode:'overview',...ov});
 const desc=label+' / escala '+scale;
 assert.equal(ov.mode,'overview',desc+': modo errado');
 assert.equal(ov.focusHidden,true,desc+': Foco ainda sem hidden');
 assert.equal(ov.focusDisplay,'none',desc+': Foco renderizado junto à Visão geral');
 assert.equal(ov.focusRect.width,0,desc+': Foco ocupa coluna oculta');
 assert.equal(ov.overviewHidden,false,desc+': Visão geral está escondida');
 assert.notEqual(ov.overviewDisplay,'none',desc+': Visão geral invisível');
 assert.ok(ov.overviewRect.width>=ov.stageRect.width*.84,
  desc+': Visão geral comprimida à direita: '+JSON.stringify(ov));
 assert.ok(ov.managerWidth>=ov.stageRect.width*.71,
  desc+': gerenciamento espremido: '+JSON.stringify(ov));
 assert.ok(ov.cards>=1,desc+': nenhuma estrutura salva aparece');
 assert.ok(ov.overviewActions>=1,desc+': ações do cartão desapareceram');
 assert.equal(await overviewTab.getAttribute('aria-pressed'),'true',desc+': aba geral sem estado');
 assert.equal(await focusTab.getAttribute('aria-pressed'),'false',desc+': Foco marcado como ativo');
 assert.ok(ov.bodyScrollWidth<=width+6,
  desc+': conteúdo extrapolou largura da janela: '+ov.bodyScrollWidth);
 assert.equal(await scientific(),before,desc+': mudar para Visão geral alterou ciência');

 if((label==='notebook'||label==='celular-390')&&scale===1)
  await page.screenshot({path:join(evidenceDir,label+'-overview.jpg'),type:'jpeg',quality:70,animations:'disabled'});

 await focusTab.click();
 await page.waitForFunction(()=>document.querySelector('#si-workspace')?.dataset.viewMode==='focus');
 const f=await visual();reports.push({label,scale,mode:'focus',...f});
 assert.equal(f.focusHidden,false,desc+': Foco não voltou');
 assert.notEqual(f.focusDisplay,'none',desc+': Foco não renderizado após retorno');
 assert.ok(f.focusRect.width>=f.stageRect.width*.7,desc+': palco perdeu área de visualização');
 assert.equal(f.overviewHidden,true,desc+': Visão geral continua aberta');
 assert.equal(f.overviewDisplay,'none',desc+': Visão geral visível atrás do Foco');
 assert.equal(f.overviewRect.width,0,desc+': Visão geral ocupa coluna oculta');
 assert.equal(await focusTab.getAttribute('aria-pressed'),'true',desc+': Foco sem estado');
 assert.equal(await overviewTab.getAttribute('aria-pressed'),'false',desc+': Visão geral marcada como ativa');
 assert.equal(await scientific(),before,desc+': alternância dos modos modificou ciência');
 assert.ok(f.bodyScrollWidth<=width+6,desc+': overflow global ao retornar');
 assert.equal(f.nav,4,desc+': navegação incompleta');
 assert.deepEqual(f.selectedScales,[String(scale)],desc+': escala ativa perdida');
 if(scale>=3){
  const controls=await page.locator('#silm-scene-actionbar').evaluate(n=>{
   const rect=n.getBoundingClientRect();
   return {width:rect.width,height:rect.height,
    buttons:[...n.querySelectorAll('#silm-view-controls button,#silm-view-quick-actions button')]
     .filter(b=>!b.hidden&&getComputedStyle(b).display!=='none'&&
      b.getBoundingClientRect().width>0&&b.getBoundingClientRect().height>0)
     .map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height,
      name:b.getAttribute('aria-label')||b.textContent?.trim()}))};
  });
  assert.ok(controls.width>100&&controls.height>=40,desc+': faixa de ferramentas desapareceu');
  assert.ok(controls.buttons.length>=2,desc+': faltam ferramentas científicas');
  assert.ok(controls.buttons.every(b=>b.width>=42&&b.height>=42),
   desc+': alvos menores que 44px: '+JSON.stringify(controls.buttons.filter(b=>b.width<42||b.height<42)));
 }
}
async function checkDock(panel){
 const before=await scientific();
 const trigger=page.locator('[data-open-dock="'+panel+'"]');
 await trigger.click();
 await page.waitForFunction(p=>document.querySelector('[data-open-dock="'+p+'"]')?.getAttribute('aria-expanded')==='true',panel);
 const state=await visual();
 assert.equal(state.mode,'focus',panel+': abrir painel mudou o modo de visualização');
 assert.equal(await scientific(),before,panel+': abrir painel modificou o motor científico');
 await page.locator('[data-close-dock="'+(panel==='montagem'?'left':'right')+'"]').first().click();
 await page.waitForFunction(p=>document.querySelector('[data-open-dock="'+p+'"]')?.getAttribute('aria-expanded')==='false',panel);
 assert.equal(await scientific(),before,panel+': fechar painel modificou o motor científico');
}
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 page=await ctx.newPage();
 const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'SILM não carregou');
 await page.waitForFunction(()=>window.SILM?.workshop?.valid()&&!document.querySelector('#silm-workshop-context')?.hidden);
 await page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'}).click();
 await page.locator('#silm-periodic-dialog [data-z="29"]').click();
 await page.locator('#silm-periodic-dialog [id$="-explore"]').click();
 await page.locator('.silm-workshop-card[data-reference-id="atlas-cu"]')
   .getByRole('button',{name:'Investigar componente'}).click();
 await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===29);
 // A Visão geral gerencia investigações com uma estrutura existente. O
 // Objeto isolado ainda não gera cartão: preparar Cu com o motor real antes
 // da matriz reproduz a situação de várias estruturas salvas do usuário.
 await page.locator('.silm-workshop-scale[data-scale="3"]').click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.structure?.units?.length>0);
 await page.locator('.silm-workshop-scale[data-scale="1"]').click();
 await page.waitForFunction(()=>document.querySelector('#si-stage')?.dataset.workshopScale==='1');
 const start=JSON.parse(await scientific());

 // Um teste adversarial reproduz a regra CSS que causou o incidente P0.
 // A salvaguarda de [hidden] precisa prevalecer sem depender do reload.
 const injected=await page.addStyleTag({content:
  '#si-stage.silm-workshop-context-only #workspace-focus{display:flex!important}'});
 await checkModes('sentinela-css',1,390,844);
 await injected.evaluate(node=>node.remove());

 for(const [label,width,height] of viewports){
  await page.setViewportSize({width,height});
  for(const scale of [1,2,3,4]){
   const button=page.locator('.silm-workshop-scale[data-scale="'+scale+'"]');
   await button.waitFor({state:'visible'});
   await button.click();
   await page.waitForFunction(n=>document.querySelector('#si-stage')?.dataset.workshopScale===String(n),scale);
   if(scale===2)
    await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true');
   await page.waitForTimeout(70);
   await checkModes(label,scale,width,height);
  }
  if(label==='celular-390'||label==='desktop'){
   await checkDock('ver');
   await checkDock('dados');
   await checkDock('montagem');
  }
 }
 const end=JSON.parse(await scientific());
 assert.equal(end.metal,start.metal,'Navegação trocou o metal');
 assert.equal(end.investigationId,start.investigationId,'Navegação criou outra investigação');
 assert.equal(end.module,start.module,'Navegação trocou o módulo científico');
 assert.deepEqual(pageErrors,[],'Erros JS: '+pageErrors.join(' | '));
 console.log('OK '+browserName+': 4 escalas × 6 telas × 2 modos + sentinela CSS + 3 painéis');
 await ctx.close();
}catch(error){
 if(page){
  await page.screenshot({path:join(evidenceDir,'falha.jpg'),type:'jpeg',quality:65,animations:'disabled'})
   .catch(()=>{});
 }
 throw error;
}finally{
 writeFileSync(join(evidenceDir,'metricas.json'),JSON.stringify(reports,null,2)+'\n');
 await browser.close();
}
