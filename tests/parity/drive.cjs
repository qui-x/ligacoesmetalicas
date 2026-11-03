'use strict';
/* TEST-DRIVE — P3, P4 e deformação + corrente (docs/PLANO-PROPRIEDADES-METALICAS.md), sem barras deslizantes:
   - P3: alça na seta E muda a intensidade do campo (arraste e teclado); a deriva média dos elétrons acompanha (v ∝ E).
   - P4: lanterna na cena (toque acende e apaga, arraste e setas mudam o ângulo); normal, θᵢ e θᵣ iguais; sem feixe
     atravessando o metal.
   - Deformação + corrente: campo elétrico transitório na maleabilidade; os deslizamentos espalham mais os elétrons;
     Restaurar volta à forma de referência e desliga o campo.
   - Celular sem rolagem lateral e alças dentro da cena. */
const assert=require('node:assert/strict'),nav=require('../integration-navigation.cjs');
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async ctx=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'#/montagens');await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const prepare=async p=>{await p.locator('#preset-cobre-cfc button').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline'&&location.hash==='#/ambiente');
  await nav.viewer(p,'eletrons');await p.locator('#silm-electrons').click();};
 const electrons=p=>p.locator('.silm-electron-canvas').first().evaluate(c=>{const s=c.silmElectrons.snapshot();return {drive:s.drive,defects:s.defects,field:s.field};});
 const status=p=>p.locator('#silm-scene-property-status').innerText();
 const start=async(p,id)=>{await nav.viewer(p,'propriedades');if(await p.locator('#silm-panel-property-end').isVisible())await p.locator('#silm-panel-property-end').click();await p.locator('#silm-panel-property-start-'+id).click();};
 // Fechar a doca: cabeçalho inteiro (não espremido pelo conteúdo longo) e botão Fechar sem nada por cima.
 const closeDock=async p=>{const r=await p.evaluate(()=>{const h=document.querySelector('#si-dock-right .si-dock-header'),b=document.querySelector('[data-close-dock="right"]').getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height-2);return {clipped:h.scrollHeight-h.clientHeight,free:!!hit?.closest('[data-close-dock="right"]')};});
  assert.ok(r.clipped<=1,'Cabeçalho da doca não espremido ('+r.clipped+' px cortados)');assert.ok(r.free,'Botão Fechar livre até a borda de baixo');return p.locator('[data-close-dock="right"]').click();};
 const inStage=(p,sel)=>p.evaluate(s=>{const st=document.querySelector('.silm-crystal-stage').getBoundingClientRect(),b=document.querySelector(s).getBoundingClientRect();return b.left>=st.left-1&&b.right<=st.right+1&&b.top>=st.top-1&&b.bottom<=st.bottom+1;},sel);
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'no-preference'});
 try{
  const p=await open(ctx);await prepare(p);
  /* P3: intensidade do campo. */
  await start(p,'electrical');const knob=p.locator('.silm-field-knob');assert.equal(await knob.isVisible(),false,'Sem campo, sem alça');
  await p.locator('#silm-panel-property-field').click();await closeDock(p);await knob.waitFor();
  assert.equal(await p.locator('.silm-property-controls input[type=range]').count(),0,'Sem barras deslizantes');
  assert.equal(await knob.getAttribute('role'),'slider');assert.equal(await knob.getAttribute('aria-label'),'Intensidade do campo elétrico');assert.equal(await knob.getAttribute('aria-valuenow'),'60');
  assert.ok(await inStage(p,'.silm-field-knob'),'Alça dentro da cena');
  await knob.focus();for(let i=0;i<3;i++)await p.keyboard.press('ArrowRight');assert.equal(await knob.getAttribute('aria-valuenow'),'90');
  await p.waitForFunction(()=>document.querySelector('.silm-electron-canvas')?.silmElectrons.snapshot().drive===.9);
  assert.match(await status(p),/Intensidade do campo: 90 %; a deriva média cresce com a intensidade \(v ∝ E\)/);
  await p.keyboard.press('End');assert.equal(await knob.getAttribute('aria-valuenow'),'100');await p.keyboard.press('Home');assert.equal(await knob.getAttribute('aria-valuenow'),'5','Mínimo de 5 %');
  // Arraste para a direita aumenta.
  const kb=await knob.boundingBox(),kx=kb.x+kb.width/2,ky=kb.y+kb.height/2;await p.mouse.move(kx,ky);await p.mouse.down();for(let i=1;i<=8;i++){await p.mouse.move(kx+i*20,ky);await p.waitForTimeout(15);}await p.mouse.up();
  assert.ok(Number(await knob.getAttribute('aria-valuenow'))>=25,'Arraste aumenta a intensidade');
  assert.equal((await electrons(p)).field,true);
  assert.equal(await p.evaluate(()=>JSON.stringify(SILMIntegration.snapshot().properties.electrical)),JSON.stringify({field:true}),'Intensidade transitória (não gravada)');
  /* P4: lanterna e lei da reflexão. */
  await start(p,'luster');await closeDock(p);const lamp=p.locator('.silm-lantern');await lamp.waitFor();
  assert.equal(await lamp.getAttribute('role'),'slider');assert.equal(await lamp.getAttribute('aria-valuenow'),'35');assert.equal(await lamp.getAttribute('data-on'),'false');
  assert.match(await status(p),/Sem luz incidente\. Toque na lanterna/);
  await lamp.click();await p.waitForFunction(()=>SILMIntegration.snapshot().properties.luster.light===true);assert.equal(await lamp.getAttribute('data-on'),'true');
  let labels=await p.locator('.silm-light-beam text').allTextContents();assert.deepEqual(labels,['normal','θᵢ = 35°','θᵣ = 35°']);
  await lamp.focus();for(let i=0;i<4;i++)await p.keyboard.press('ArrowLeft');assert.equal(await lamp.getAttribute('aria-valuenow'),'55');
  labels=await p.locator('.silm-light-beam text').allTextContents();assert.deepEqual(labels,['normal','θᵢ = 55°','θᵣ = 55°'],'θr = θi');
  assert.match(await status(p),/θᵣ = θᵢ = 55° \(reflexão especular\)\. Não há feixe atravessando o metal/);
  // Geometria: incidente e refletido simétricos em relação à normal, ambos acima da superfície (nada atravessa o metal).
  const geo=await p.evaluate(()=>{const g=s=>{const l=document.querySelector('.silm-light-beam .'+s);return ['x1','y1','x2','y2'].map(k=>Number(l.getAttribute(k)));};return {n:g('silm-normal-line'),i:g('silm-light-in-line'),o:g('silm-light-out-line'),count:document.querySelectorAll('.silm-light-beam line').length};});
  assert.equal(geo.count,3,'Só normal, incidente e refletido');
  const [lx,ly,px,py]=geo.i,[,,ex,ey]=geo.o;assert.ok(ly<py&&ey<py,'Feixes do lado de fora (acima da superfície)');
  assert.ok(Math.abs((px-lx)-(ex-px))<.5&&Math.abs((py-ly)-(py-ey))<.5,'Reflexão simétrica à normal');
  const lb=await lamp.boundingBox(),lx0=lb.x+lb.width/2,ly0=lb.y+lb.height/2;await p.mouse.move(lx0,ly0);await p.mouse.down();for(let i=1;i<=8;i++){await p.mouse.move(lx0+i*12,ly0-i*4);await p.waitForTimeout(15);}await p.mouse.up();
  assert.notEqual(await lamp.getAttribute('aria-valuenow'),'55','Arraste muda o ângulo');assert.equal(await lamp.getAttribute('data-on'),'true','Arrastar não apaga');
  await lamp.focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>SILMIntegration.snapshot().properties.luster.light===false);assert.equal(await p.locator('.silm-light-beam line').count(),1,'Luz apagada: só a normal');
  /* Deformação + corrente. */
  await start(p,'malleability');const fieldBtn=p.locator('#silm-panel-property-field');
  assert.equal(await fieldBtn.innerText(),'Aplicar campo elétrico');assert.equal(await fieldBtn.getAttribute('aria-pressed'),'false');
  await fieldBtn.click();assert.equal(await fieldBtn.innerText(),'Remover campo elétrico');assert.equal(await fieldBtn.getAttribute('aria-pressed'),'true');
  await p.waitForFunction(()=>document.querySelector('.silm-electron-canvas')?.silmElectrons.snapshot().field===true);assert.equal((await electrons(p)).defects,0,'Sem deslizamentos, sem defeitos');
  for(const n of [1,2]){await p.locator('#silm-panel-property-compress').click();await p.waitForFunction(k=>SILMIntegration.snapshot().properties.malleability.compression===k,n,{timeout:6000});}
  await p.waitForFunction(()=>document.querySelector('.silm-electron-canvas')?.silmElectrons.snapshot().defects===.5);
  assert.match(await status(p),/os deslizamentos geraram defeitos na rede \(discordâncias, que esta representação não desenha\)/);
  await closeDock(p);await knob.waitFor();assert.ok(await inStage(p,'.silm-field-knob'),'Alça dentro da cena na deformação');
  await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-restore').click();
  await p.waitForFunction(()=>SILMIntegration.snapshot().properties.malleability.compression===0);
  assert.equal(await fieldBtn.innerText(),'Aplicar campo elétrico','Restaurar desliga o campo');assert.equal((await electrons(p)).field,false);
  // Ductilidade também oferece o campo; experiência nova começa com o campo desligado.
  await start(p,'ductility');assert.equal(await fieldBtn.getAttribute('aria-pressed'),'false');
  // Elétrons ocultos: aplicar o campo os mostra (como ao iniciar a condutividade elétrica).
  await nav.viewer(p,'eletrons');await p.locator('#silm-electrons').click();await p.waitForFunction(()=>SILMIntegration.snapshot().electrons?.representation.visible===false);
  await nav.viewer(p,'propriedades');await fieldBtn.click();await p.waitForFunction(()=>SILMIntegration.snapshot().electrons?.representation.visible===true);assert.equal(await fieldBtn.getAttribute('aria-pressed'),'true');
 }finally{await ctx.close();}
 /* Celular: alças dentro da cena, sem rolagem lateral; teclado na lanterna. */
 const mob=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 try{
  const p=await open(mob);await prepare(p);await start(p,'luster');await closeDock(p);const lamp=p.locator('.silm-lantern');await lamp.waitFor();
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'Sem rolagem lateral');assert.ok(await inStage(p,'.silm-lantern'),'Lanterna dentro da cena no celular');
  await lamp.focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>SILMIntegration.snapshot().properties.luster.light===true);await p.keyboard.press('ArrowRight');assert.equal(await lamp.getAttribute('aria-valuenow'),'30');
  await start(p,'electrical');await p.locator('#silm-panel-property-field').click();await closeDock(p);await p.locator('.silm-field-knob').waitFor();assert.ok(await inStage(p,'.silm-field-knob'),'Alça do campo dentro da cena no celular');
 }finally{await mob.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-DRIVE: sem barras deslizantes; alça de intensidade na seta E (arraste, setas, Home e End) com deriva proporcional e sem gravar; lanterna (toque, arraste, setas e Enter) com normal, θᵣ = θᵢ e nada atravessando o metal; deformação + corrente com defeitos que espalham os elétrons e Restaurar; celular sem rolagem lateral.');
};
