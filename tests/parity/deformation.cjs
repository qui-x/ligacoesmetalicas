'use strict';
/* TEST-DEFORM — P1 de docs/PLANO-PROPRIEDADES-METALICAS.md: maleabilidade e ductilidade com mecânica contínua.
   Sem barras deslizantes; a força vem da prensa (ou garra) na cena: arraste (elástico volta ao soltar; acima do limiar,
   um deslizamento permanece), teclado na alça (setas, End, Home), pulso pelo botão, recarga com a experiência ativa,
   enquadramento sem cortar as placas, celular sem rolagem lateral e movimento reduzido. Fluidez: animação sem
   tarefas longas (nenhum quadro acima de 200 ms durante o arraste). */
const assert=require('node:assert/strict'),nav=require('../integration-navigation.cjs');
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const props=p=>p.evaluate(()=>SILMIntegration.snapshot().properties);
 const prepare=async(p,preset,id)=>{await p.goto(base+'#/montagens');await p.locator('#preset-'+preset+' button').click();if(await p.locator('#si-modal-confirm').isVisible().catch(()=>false))await p.locator('#si-modal-confirm').click();await p.waitForFunction(z=>SILMIntegration.snapshot().structure?.mode==='crystalline'&&location.hash==='#/ambiente',null);
  const lattice=p.locator('#silm-crystal-view-lattice');if(await lattice.getAttribute('aria-pressed')!=='true'&&await lattice.isVisible())await lattice.click();await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-start-'+id).click();await p.locator('[data-close-dock="right"]').click();await p.locator('.silm-press-handle').waitFor();await p.waitForTimeout(800);};
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'no-preference'});
 try{
  const p=await open(ctx,'#/inicio');await prepare(p,'cobre-cfc','malleability');
  assert.equal(await p.locator('.silm-property-controls input[type=range], #silm-comparison-items input[type=range]').count(),0,'Sem barras deslizantes');
  assert.equal(await p.locator('.silm-cell-edges line').count(),0,'Contorno da célula oculto durante a deformação');
  assert.equal(await p.locator('#silm-crystal-view-lattice').getAttribute('aria-pressed'),'true');assert.ok(await p.locator('.silm-lattice circle.silm-specimen').count()>20,'Amostra (fatia da rede) desenhada');
  const handle=p.locator('.silm-press-handle'),box=await handle.boundingBox();
  assert.equal(await handle.getAttribute('aria-label'),'Prensa: força de compressão');
  // Arraste curto: regime elástico; soltar não deixa deslizamento.
  await p.evaluate(()=>{window.__long=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__long.push(e.duration);}).observe({type:'longtask'});});
  const x=box.x+box.width/2,y=box.y+box.height/2;await p.mouse.move(x,y);await p.mouse.down();
  for(let i=1;i<=6;i++){await p.mouse.move(x,y+i*10);await p.waitForTimeout(25);}
  await p.waitForTimeout(250);assert.match(await p.locator('#silm-scene-property-status').innerText(),/Regime elástico/);
  await p.mouse.up();await p.waitForTimeout(1200);assert.equal((await props(p)).malleability.compression,0,'Elástico: nada permanece');
  // Arraste longo: regime plástico; deslizamentos permanecem depois de soltar.
  await p.mouse.move(x,y);await p.mouse.down();for(let i=1;i<=30;i++){await p.mouse.move(x,y+i*12);await p.waitForTimeout(15);}
  await p.waitForFunction(()=>SILMIntegration.snapshot().properties.malleability.compression>=1,'',{timeout:6000});
  assert.match(await p.locator('#silm-scene-property-status').innerText(),/Regime plástico: um plano \(111\) desliza um passo b = \d,\d\d Å na direção \[−1 0 1\]/);
  await p.mouse.up();await p.waitForTimeout(1200);const kept=(await props(p)).malleability.compression;assert.ok(kept>=1,'Plástico: o deslizamento permanece');
  assert.ok(await p.locator('.silm-slip-plane').count()===kept,'Um traço tracejado por plano deslizado');
  assert.ok((await p.evaluate(()=>window.__long)).every(d=>d<200),'Sem tarefas longas durante o arraste');
  // Placas dentro do palco (enquadramento estável).
  const inside=await p.evaluate(()=>{const s=document.querySelector('.silm-crystal-stage').getBoundingClientRect();return [...document.querySelectorAll('.silm-press-plate')].every(r=>{const b=r.getBoundingClientRect();return b.top>=s.top-1&&b.bottom<=s.bottom+1;});});
  assert.ok(inside,'Placas da prensa dentro da cena');
  // Teclado na alça: End aplica a força máxima até um novo deslizamento; Home solta.
  await handle.focus();await p.keyboard.press('End');await p.waitForFunction(n=>SILMIntegration.snapshot().properties.malleability.compression>n,kept,{timeout:6000});await p.keyboard.press('Home');
  assert.equal(await handle.getAttribute('aria-valuenow'),'0');
  // Recarga com a experiência ativa: o resultado continua, sem erro.
  const before=(await props(p)).malleability.compression;await p.reload();await p.waitForFunction(()=>window.SILMIntegration);await p.locator('.silm-press-handle').waitFor();
  assert.equal((await props(p)).malleability.compression,before,'Deslizamentos guardados');assert.equal(await p.locator('.silm-slip-plane').count(),before);
  // Restaurar volta à forma de referência.
  await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-restore').click();await p.waitForTimeout(900);assert.equal((await props(p)).malleability.compression,0);assert.equal(await p.locator('.silm-slip-plane').count(),0);
  // Tração (ferro, CCC): o pulso pelo botão registra um deslizamento.
  await prepare(p,'ferro-ccc','ductility');assert.equal(await p.locator('.silm-press-handle').getAttribute('aria-label'),'Garra: força de tração');
  await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-stretch').click();assert.equal((await props(p)).ductility.elongation,1);
  await p.waitForFunction(()=>/mais alta, em degraus/.test(document.getElementById('silm-panel-property-status').textContent),'',{timeout:5000});
 }finally{await ctx.close();}
 /* Celular e movimento reduzido. */
 const mob=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 try{
  const p=await open(mob,'#/inicio');await prepare(p,'magnesio-hc','malleability');
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'Sem rolagem lateral no celular');
  await p.locator('.silm-press-handle').focus();await p.keyboard.press('End');await p.waitForFunction(()=>SILMIntegration.snapshot().properties.malleability.compression===1,'',{timeout:4000});
  assert.equal(await p.locator('.silm-slip-plane').count(),1,'Movimento reduzido: estado final sem animação');
 }finally{await mob.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-DEFORM: sem barras deslizantes; prensa e garra na cena com regime elástico reversível e deslizamento permanente, traços dos planos, sem tarefas longas, placas no quadro, teclado na alça, recarga, Restaurar, tração no CCC, celular e movimento reduzido.');
};
