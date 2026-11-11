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
 ['celular-320',320,568],['celular-360',360,780],['celular-390',390,844],['celular-400',400,692],['celular-414',414,896],
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

async function checkSingleDock(label,width){
 const initial=await scientific();
 for(const target of ['montagem','ver','dados','montagem']){
  await page.locator('[data-open-dock="'+target+'"]').click();
  await page.waitForFunction(p=>document.querySelector('[data-open-dock="'+p+'"]')
   ?.getAttribute('aria-expanded')==='true',target);
  const observed=await page.evaluate(()=>{
   const triggers=[...document.querySelectorAll('.si-launchers [data-open-dock]')];
   const opened=triggers.filter(b=>b.getAttribute('aria-expanded')==='true').map(b=>b.dataset.openDock);
   const workspace=document.querySelector('#si-workspace');
   const focus=document.querySelector('#workspace-focus');
   return {
    opened,leftHidden:document.querySelector('#si-dock-left').hidden,
    rightHidden:document.querySelector('#si-dock-right').hidden,
    leftOpen:workspace.dataset.leftOpen,rightOpen:workspace.dataset.rightOpen,
    leftPadding:parseFloat(getComputedStyle(focus).paddingLeft),
    rightPadding:parseFloat(getComputedStyle(focus).paddingRight)
   };
  });
  assert.deepEqual(observed.opened,[target],label+': duas docas ou comando errado: '+JSON.stringify(observed));
  assert.equal(observed.leftHidden,target!=='montagem',label+': painel esquerdo incorreto');
  assert.equal(observed.rightHidden,target==='montagem',label+': painel direito incorreto');
  if(width>=901)assert.ok(observed.leftPadding<=30&&observed.rightPadding<=30,
   label+': painel comprimiu o palco: '+JSON.stringify(observed));
  assert.equal(await scientific(),initial,label+': alternância de docas alterou a ciência');
 }
 await page.locator('[data-close-dock="left"]').click();
 await page.waitForFunction(()=>document.querySelector('#si-dock-left')?.hidden);
 assert.equal(await scientific(),initial,label+': fechar doca alterou experimento');
}

// Auditoria iconográfica móvel: um SVG de 20px deve caber inteiro
// dentro do alvo acionável de >=44px. A faixa científica pode rolar,
// mas nunca pode encolher seus botões nem distorcer o desenho.
async function checkMobileIcons(label,width,scale){
 if(width>900)return;
 const results=await page.evaluate(()=>{
  const visible=e=>{
   if(!e||!e.getClientRects().length)return false;
   const c=getComputedStyle(e);
   return c.display!=='none'&&c.visibility!=='hidden';
  };
  const targets=[
   '#si-workspace .silm-module-shortcut',
   '#si-workspace .si-launchers [data-open-dock]',
   '#si-stage .silm-workshop-scales .silm-workshop-scale',
   '#si-stage .silm-workshop-scales .silm-lens-tool',
   '#silm-scene-actionbar #silm-view-quick-actions .silm-quick-icon',
   '#silm-scene-actionbar #silm-view-controls .silm-camera-btn',
   '#silm-scene-actionbar #silm-view-controls #si-expand-structure',
   '#silm-scene-actionbar #scene-undo.silm-action--icon',
   '#silm-scene-actionbar .silm-toolbar-scroll-arrow:not([hidden])',
   '#si-stage .silm-workshop-micro-control'
  ];
  const glyphs=[
   '#si-workspace .silm-module-shortcut>svg',
   '#si-workspace .si-launchers .si-launch-icon',
   '#silm-scene-actionbar .silm-action-icon',
   '#silm-scene-actionbar .silm-quick-icon svg',
   '#silm-scene-actionbar .silm-camera-btn svg',
   '#si-stage .silm-workshop-micro-control .silm-action-icon'
  ];
  const tr=targets.flatMap(q=>[...document.querySelectorAll(q)])
   .filter(visible).map(n=>{
    const b=n.getBoundingClientRect();
    return {name:n.getAttribute('aria-label')||n.id||n.className,width:b.width,height:b.height};
   });
  const gr=glyphs.flatMap(q=>[...document.querySelectorAll(q)])
   .filter(visible).map(n=>{
    const p=n.closest('button'),a=n.getBoundingClientRect(),b=p?.getBoundingClientRect();
    const name=p?.getAttribute('aria-label')||p?.id||'svg';
    return {name,width:a.width,height:a.height,within:!!b&&
     a.left>=b.left-1&&a.right<=b.right+1&&
     a.top>=b.top-1&&a.bottom<=b.bottom+1};
   });
  const nav=document.querySelector('#si-workspace .si-workspace-toolbar')?.getBoundingClientRect();
  const stageNav=document.querySelector('#si-stage .silm-workshop-scales')?.getBoundingClientRect();
  const bar=document.getElementById('silm-scene-actionbar');
  return {targets:tr,glyphs:gr,barOverflow:bar?getComputedStyle(bar).overflowX:null,
   barScrollable:bar?bar.scrollWidth>bar.clientWidth+4:false,
   pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,
   topbar:nav?{left:nav.left,right:nav.right}:null,
   nav:stageNav?{left:stageNav.left,right:stageNav.right}:null};
 });
 const where=label+'/escala '+scale;
 assert.ok(results.targets.length>=7,where+': controles móveis ausentes');
 const badTargets=results.targets.filter(t=>t.width<43.5||t.height<43.5);
 assert.deepEqual(badTargets,[],where+': alvos abaixo de 44px');
 assert.ok(results.glyphs.length>=3,where+': ícones vetoriais não renderizados');
 const badGlyphs=results.glyphs.filter(g=>g.width<15||g.height<15||
  g.width>25||g.height>25||!g.within);
 assert.deepEqual(badGlyphs,[],where+': ícones deformados, excessivos ou fora dos botões');
 if(results.barScrollable)assert.equal(results.barOverflow,'auto',
  where+': ferramentas foram cortadas sem rolagem');
 assert.ok(results.pageWidth<=width+6,where+': ícones ampliaram a página');
 for(const [name,nav]of [['barra superior',results.topbar],['Travessia',results.nav]]){
  if(!nav)continue;
  assert.ok(nav.left>=-5&&nav.right<=width+5,
   where+': '+name+' extrapola o viewport '+JSON.stringify(nav));
 }
 reports.push({label,scale,mode:'icon-mobile',...results});
}


// Parte 9: avisos devem aparecer entre a Travessia e a doca inferior,
// preservar alvos de toque e não alterar a investigação.
async function checkMobileNotices(label,width,scale,accessible=false){
 if(!['celular-320','celular-390'].includes(label))return;
 const before=await scientific();
 await page.evaluate(()=>{
  const rail=document.getElementById('si-notifications');
  [...rail.querySelectorAll('.si-notice button')].forEach(b=>b.click());
  window.BaseDemoSI.notify('Aviso de investigação: condição visual sem medição experimental.','warning');
  window.BaseDemoSI.notify('Nova escala disponível para observação.','info');
  window.BaseDemoSI.notify('Estado científico preservado.','success');
 });
 await page.waitForFunction(()=>document.querySelector('#si-notifications')?.dataset.silmPositioned==='true');
 await page.waitForTimeout(70);
 const geometry=await page.evaluate(()=>{
  const rail=document.getElementById('si-notifications');
  const nav=document.querySelector('#si-stage .silm-workshop-scales');
  const dock=document.querySelector('#si-workspace .si-launchers');
  const a=rail.getBoundingClientRect(),n=nav.getBoundingClientRect(),d=dock.getBoundingClientRect();
  const rect=r=>({top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height});
  const buttons=[...rail.querySelectorAll('.si-notice button')].map(b=>({
   ...rect(b.getBoundingClientRect()),pointerEvents:getComputedStyle(b).pointerEvents
  }));
  return {rail:rect(a),nav:rect(n),dock:rect(d),buttons,
   count:rail.querySelectorAll('.si-notice').length,
   overflow:document.documentElement.scrollWidth,
   placed:rail.dataset.silmPositioned,
   last:rail.lastElementChild?.textContent||''};
 });
 const where=label+'/escala '+scale+(accessible?'/150%':'');
 assert.equal(geometry.placed,'true',where+': avisos não posicionados');
 assert.equal(geometry.count,3,where+': avisos empilhados incorretamente');
 assert.ok(geometry.rail.top>=geometry.nav.bottom+3,
  where+': notificações invadem a Travessia '+JSON.stringify(geometry));
 assert.ok(geometry.rail.bottom<=geometry.dock.top-3,
  where+': notificações encobrem docas '+JSON.stringify(geometry));
 assert.ok(geometry.rail.left>=0&&geometry.rail.right<=width+2,
  where+': avisos extrapolam a largura');
 assert.ok(geometry.buttons.every(b=>b.width>=43.5&&b.height>=43.5&&b.pointerEvents==='auto'),
  where+': botão de dispensar inacessível');
 assert.ok(geometry.last.includes('Estado científico preservado.'),
  where+': mensagem mais recente foi perdida');
 assert.ok(geometry.overflow<=width+6,where+': rolagem global');
 if(accessible&&scale===1)
  await page.screenshot({path:join(evidenceDir,label+'-notificacoes-acessibilidade.jpg'),
   type:'jpeg',quality:70,animations:'disabled'});
 await page.evaluate(()=>[...document.querySelectorAll('#si-notifications .si-notice button')].forEach(b=>b.click()));
 assert.equal(await scientific(),before,where+': avisos alteraram estado científico');
 reports.push({label,scale,mode:accessible?'notices-a11y':'notices',...geometry});
}

async function checkModuleShortcuts(label,width){
 const launch=page.locator('[data-open-dock="ver"]');
 if(await launch.getAttribute('aria-expanded')!=='true')await launch.click();
 await page.waitForFunction(()=>document.querySelector('#si-dock-right')?.hidden===false);
 assert.equal(await page.locator('.si-workspace-toolbar #silm-module-shortcuts').count(),0,
  label+': controle de módulos ainda está na barra superior');
 assert.equal(await page.locator('#si-dock-right [data-right-panel="ver"] #silm-module-shortcuts').count(),1,
  label+': módulo científico não está em Ver');
 const close=async()=>{
  await page.locator('[data-close-dock="right"]').click();
  await page.waitForFunction(()=>document.querySelector('#si-dock-right')?.hidden===true);
 };
 const before=JSON.parse(await scientific());
 const buttons=await page.locator('#silm-module-shortcuts [data-silm-module-shortcut]')
  .evaluateAll(nodes=>nodes.map(n=>{
   const b=n.getBoundingClientRect();
   return {id:n.dataset.silmModuleShortcut,pressed:n.getAttribute('aria-pressed'),
    disabled:n.disabled,width:b.width,height:b.height,left:b.left,right:b.right};
  }));
 assert.equal(buttons.length,3,label+': atalhos de módulo ausentes');
 assert.deepEqual(buttons.map(b=>b.id),['explorar','medir','calcular'],label+': ordem dos módulos');
 const glyphs=await page.locator('#si-dock-right #silm-module-shortcuts svg').evaluateAll(nodes=>
  nodes.map(n=>{const box=n.getBoundingClientRect(),host=n.closest('button').getBoundingClientRect();
   return {width:box.width,height:box.height,inside:box.left>=host.left-1&&
    box.right<=host.right+1&&box.top>=host.top-1&&box.bottom<=host.bottom+1};
  }));
 assert.equal(glyphs.length,3,label+': faltam ícones vetoriais dos módulos');
 assert.ok(glyphs.every(g=>g.width>=15&&g.height>=15&&g.width<=25&&g.height<=25&&g.inside),
  label+': ícones de Ver deformados '+JSON.stringify(glyphs));
 assert.ok(await page.locator('#si-dock-right .silm-module-shortcut-label').first().isVisible(),
  label+': rótulos dos módulos não estão visíveis');
 if(label==='celular-390'||label==='desktop')
  await page.screenshot({path:join(evidenceDir,label+'-modulos-no-ver.jpg'),
   type:'jpeg',quality:70,animations:'disabled'});

 assert.deepEqual(buttons.filter(b=>b.pressed==='true').map(b=>b.id),[before.module],
  label+': indicador do módulo ativo incorreto');
 assert.ok(buttons.every(b=>b.width>=43.5&&b.height>=43.5&&b.left>=-2&&b.right<=width+2),
  label+': módulos invisíveis ou comprimidos '+JSON.stringify(buttons));
 const visualWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
 assert.ok(visualWidth<=width+6,label+': atalhos provocaram rolagem global '+visualWidth);
 if(!['celular-390','desktop'].includes(label)){await close();return;}
 for(const target of ['medir','calcular','explorar']){
  const button=page.locator('[data-silm-module-shortcut="'+target+'"]');
  await button.click();
  await page.waitForFunction(mode=>window.SILMIntegration?.snapshot?.()?.module?.active===mode,target);
  await page.waitForFunction(mode=>document.querySelector('#silm-module-shortcuts')?.dataset.activeModule===mode,target);
  // O menu Ver agora não utiliza famílias de catálogo como navegação.
  // O botão direto correspondente é o contrato verificável de cada módulo.
  assert.equal(await page.locator('#si-dock-right #si-viewer-catalog').isVisible(),false,
   label+': menus intermediários ainda estão visíveis em Ver');
  const direct=page.locator('#si-dock-right #silm-direct-actionbar');
  const tool=target==='explorar'?'[data-action="electrons"]':
   target==='medir'?'[data-silm-direct-tool="medir:distance"]':
   '[data-silm-direct-tool^="calcular:"]';
  assert.ok(await direct.locator(tool).count()>=1,
   label+': não há botões diretos para '+target);
  const visible=await direct.locator('button').evaluateAll(nodes=>nodes.map(n=>({
   shown:n.getClientRects().length>0,disabled:n.disabled,
   height:n.getBoundingClientRect().height,width:n.getBoundingClientRect().width
  })));
  assert.ok(visible.some(x=>x.shown&&x.height>=43.5&&x.width>=43.5),
   label+': ferramentas diretas invisíveis ou muito pequenas '+JSON.stringify(visible));
  const current=JSON.parse(await scientific());
  assert.equal(current.module,target,label+': atalho não alterou o módulo');
  assert.equal(await page.locator('#silm-module').inputValue(),target,
   label+': seletor original não sincronizado');
  assert.deepEqual(await page.locator('#silm-module-shortcuts [aria-pressed="true"]')
   .evaluateAll(nodes=>nodes.map(n=>n.dataset.silmModuleShortcut)),[target],
   label+': mais de um módulo marcado como ativo');
  assert.equal(await page.locator('[data-silm-module-shortcut="'+target+'"]').isDisabled(),false,
   label+': módulo livre ficou bloqueado');
  for(const key of ['metal','investigationId','structure','properties','electrons','measurements','calculations'])
   assert.deepEqual(current[key],before[key],label+': mudar módulo alterou '+key);
  const allowed=await page.evaluate(()=>window.BaseDemoSI?.availableViewerFamilies?.()||[]);
  assert.ok(allowed.includes(target==='explorar'?'observar':target),
   label+': ferramentas do módulo ficaram indisponíveis');
  if(target!=='explorar'){
   assert.equal(await page.locator('#scene-undo').isDisabled(),true,
    label+': editar estrutura deve continuar proibido em '+target);
  }
 }
 // Teclado: a seleção visual segue o padrão do SIAB.
 const explorar=page.locator('[data-silm-module-shortcut="explorar"]');
 await explorar.focus();
 await explorar.press('ArrowRight');
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.module?.active==='medir');
 await page.locator('[data-silm-module-shortcut="medir"]').press('End');
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.module?.active==='calcular');
 await page.locator('[data-silm-module-shortcut="calcular"]').press('Home');
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.module?.active==='explorar');
 assert.equal(await scientific(),JSON.stringify(before),label+': teclado alterou registros científicos');
 await close();
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
   await checkMobileIcons(label,width,scale);
   await checkMobileNotices(label,width,scale);
   // Condições reais do menu de acessibilidade: 150% de texto, leitura
   // simples e alto contraste. Só afetam apresentação, jamais os dados.
   if((label==='celular-320'||label==='celular-390')){
    const beforeA11y=await scientific();
    await page.evaluate(()=>{
     const root=document.documentElement;
     root.classList.add('si-font-mod','si-simple-reading','si-highcontrast');
     root.style.fontSize='24px';
     root.style.setProperty('--si-font-factor','1.5');
    });
    await page.waitForTimeout(90);
    await checkMobileIcons(label+'-acessibilidade-150',width,scale);
    await checkMobileNotices(label,width,scale,true);
    assert.equal(await scientific(),beforeA11y,
     label+': alto contraste/leitura simples alterou a investigação');
    if(scale===1||scale===4)
     await page.screenshot({path:join(evidenceDir,label+'-acessibilidade-'+scale+'.jpg'),
      type:'jpeg',quality:65,animations:'disabled'});
    await page.evaluate(()=>{
     const root=document.documentElement;
     root.classList.remove('si-font-mod','si-simple-reading','si-highcontrast');
     root.style.fontSize='';
     root.style.removeProperty('--si-font-factor');
    });
   }
  }
  if(label==='celular-390'||label==='desktop'){
   await checkDock('ver');
   await checkDock('dados');
   await checkDock('montagem');
   await checkSingleDock(label,width);
  }
  await checkModuleShortcuts(label,width);
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
