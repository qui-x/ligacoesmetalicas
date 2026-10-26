'use strict';
const assert=require('node:assert/strict'),nav=require('./integration-navigation.cjs');
module.exports=async(browser,url)=>{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];
 p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 const state=()=>p.evaluate(()=>SILMIntegration.snapshot());
 try{
  await p.goto(url);await p.waitForFunction(()=>window.SILMIntegration);
  await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-start').click();await p.locator('#silm-add').click();await p.locator('#silm-organize').click();
  await p.locator('[data-left-tab="modulo"]').click();
  assert.equal(await p.locator('#silm-module').isVisible(),true,'O módulo é escolhido em Montagem.');
  assert.equal(await p.locator('#silm-tools #silm-module').count(),0,'O seletor não se duplica em Ver.');
  const geometry=(await state()).structure;
  const card=p.locator('.silm-module-card[data-module="medir"]');await card.locator('summary').click();await p.locator('#silm-module-activate-medir').click();
  await p.waitForFunction(()=>SILMIntegration.snapshot().module.active==='medir');
  await p.waitForFunction(()=>document.activeElement?.id==='silm-module');
  assert.deepEqual((await state()).structure,geometry,'Ativar Medir preserva a estrutura.');
  assert.equal(await card.locator('.silm-module-badge').isVisible(),true);
  await p.locator('[data-close-dock="left"]').click();
  await p.locator('[data-open-dock="ver"]').click();
  const families=p.locator('#si-viewer-families');assert.deepEqual(await families.getByRole('tab').allTextContents(),['Observar','Medir']);
  await families.getByRole('tab',{name:'Observar',exact:true}).press('ArrowRight');
  assert.equal(await families.getByRole('tab',{name:'Medir',exact:true}).getAttribute('aria-selected'),'true');
  assert.equal(await families.getByRole('tab',{name:'Medir',exact:true}).evaluate(n=>n===document.activeElement),true,'Setas preservam o foco na aba selecionada.');
  await p.locator('#si-viewer-buttons').getByRole('button',{name:'Instrumentos de medição',exact:true}).click();
  assert.equal(await p.locator('#silm-instrument').isVisible(),true);
  await p.locator('#silm-instrument').focus();await p.locator('#silm-instrument').selectOption('distance');await p.waitForFunction(()=>document.activeElement?.id==='silm-instrument'&&document.activeElement.value==='distance');
  assert.equal(await p.locator('#silm-properties').isVisible(),false,'Propriedades não se misturam aos instrumentos.');
  await p.locator('#si-dock-viewer-back').click();
  assert.equal(await p.locator('#si-viewer-buttons button[aria-pressed="true"]').evaluate(n=>n===document.activeElement),true,'Voltar recupera o foco da ferramenta.');
  await p.keyboard.press('Escape');assert.equal(await p.locator('[data-open-dock="ver"]').evaluate(n=>n===document.activeElement),true);
  await nav.moduleChoice(p,'calcular');await nav.viewer(p,'calculos');assert.equal(await p.locator('#silm-formula').isVisible(),true);
  assert.deepEqual(await families.getByRole('tab',{includeHidden:true}).allTextContents(),['Observar','Analisar']);
  await p.locator('[data-close-dock="right"]').click();
  const stable=await state();
  for(const [width,height]of [[320,640],[390,844],[844,390],[1024,768],[1440,1000]]){
   await p.setViewportSize({width,height});
   await nav.data(p,'tabela');assert.equal(await p.locator('#silm-data').isVisible(),true);assert.equal(await p.locator('#silm-history').isVisible(),false);
   await p.locator('#silm-data-back').click();assert.equal(await p.locator('[data-silm-data-open="tabela"]').evaluate(n=>n===document.activeElement),true);
   await nav.data(p,'registros');assert.equal(await p.locator('#silm-history').isVisible(),true);
   await nav.data(p,'arquivo');assert.equal(await p.locator('#silm-import').isVisible(),true);
   assert.equal(await p.locator('#si-dock-right').getAttribute('role'),width<=900?'dialog':'region');
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Sem overflow em '+width+'×'+height);
   if(width<=900){
    await p.locator('[data-close-dock="right"]').focus();await p.keyboard.press('Shift+Tab');
    assert.equal(await p.locator('#si-dock-right').evaluate(n=>n.contains(document.activeElement)),true,'Foco permanece na folha mobile.');
   }
   await p.keyboard.press('Escape');
   const bounds=await p.locator('#silm-assembly-stage').boundingBox();await nav.viewer(p,'calculos');
   const after=await p.locator('#silm-assembly-stage').boundingBox();assert.ok(Math.abs(bounds.width-after.width)<=2&&Math.abs(bounds.height-after.height)<=2,'Abrir Ver preserva a cena em '+width);
   await p.keyboard.press('Escape');assert.deepEqual(await state(),stable,'Navegar nas docas preserva a investigação em '+width);
  }
  await p.setViewportSize({width:1440,height:1000});await nav.viewer(p,'calculos');await p.locator('#si-expand').click();
  assert.equal(await p.locator('#si-workspace').evaluate(n=>n.classList.contains('si-workspace-fullscreen')),true,'Expandir painel utiliza o mecanismo da Base.');
  await p.locator('#si-expand').click();await p.keyboard.press('Escape');
  assert.deepEqual(await state(),stable);assert.deepEqual(errors,[]);
  console.log('PASS: workspace da família — módulos em Montagem, catálogos Ver/Dados, permissões, retorno/foco/teclado, expansão e cena estável em cinco tamanhos.');
 }finally{await context.close();}
};
