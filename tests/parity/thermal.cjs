'use strict';
/* TEST-THERMAL — P2 de docs/PLANO-PROPRIEDADES-METALICAS.md: condução térmica contínua.
   Fonte de calor arrastável na cena (toque liga e desliga; teclado: Enter e setas), calor que avança sozinho a partir da
   fonte (centros próximos mais quentes que os distantes), equilíbrio uniforme depois de desligar, Restaurar volta ao
   ambiente, sem "Avançar propagação", recarga, celular e movimento reduzido. */
const assert=require('node:assert/strict'),nav=require('../integration-navigation.cjs');
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async ctx=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'#/montagens');await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const prepare=async p=>{await p.locator('#preset-cobre-cfc button').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline'&&location.hash==='#/ambiente');
  await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-start-thermal').click();assert.equal(await p.locator('#silm-panel-property-advance').isVisible(),false,'Sem Avançar propagação');
  await p.locator('[data-close-dock="right"]').click();await p.locator('.silm-heat-handle').waitFor();};
 // Distância de cada unidade à fonte (na tela) e nível de calor.
 const profile=p=>p.evaluate(()=>{const h=document.querySelector('.silm-heat-handle').getBoundingClientRect(),hx=h.x+h.width/2,hy=h.y+h.height/2;
  return [...document.querySelectorAll('.silm-crystal-unit')].map(n=>{const b=n.getBoundingClientRect();return {d:Math.hypot(b.x+b.width/2-hx,b.y+b.height/2-hy),heat:Number(n.dataset.heat||0),t:parseFloat(n.style.getPropertyValue('--heat'))||0};}).sort((a,b)=>a.d-b.d);});
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'no-preference'});
 try{
  const p=await open(ctx);await prepare(p);const heater=p.locator('.silm-heat-handle');
  assert.equal(await heater.getAttribute('aria-label'),'Fonte de calor: desligada');
  // Toque liga: os centros perto da fonte esquentam antes dos distantes.
  await heater.click();await p.waitForFunction(()=>SILMIntegration.snapshot().properties.thermal.heating===true);assert.equal(await heater.getAttribute('aria-pressed'),'true');
  await p.waitForTimeout(900);let prof=await profile(p);
  assert.ok(prof[0].t>prof[prof.length-1].t+.1,'Perto da fonte mais quente que longe: '+JSON.stringify([prof[0],prof[prof.length-1]]));
  assert.match(await p.locator('#silm-scene-property-status').innerText(),/região perto da fonte esquenta primeiro/);
  // Arrastar move a fonte (sem desligar).
  const b=await heater.boundingBox(),start={x:b.x+b.width/2,y:b.y+b.height/2};await p.mouse.move(start.x,start.y);await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(start.x+i*30,start.y-i*20);await p.waitForTimeout(15);}await p.mouse.up();
  const moved=await heater.boundingBox();assert.ok(Math.hypot(moved.x-b.x,moved.y-b.y)>150,'Fonte movida');assert.equal((await p.evaluate(()=>SILMIntegration.snapshot().properties.thermal.heating)),true,'Arrastar não desliga');
  // Teclado: Enter desliga; sem fonte, a temperatura fica uniforme (equilíbrio) e a energia continua na estrutura.
  await heater.focus();await p.keyboard.press('ArrowLeft');await p.keyboard.press('Enter');await p.waitForFunction(()=>SILMIntegration.snapshot().properties.thermal.heating===false);
  await p.waitForFunction(()=>/Temperatura uniforme/.test(document.getElementById('silm-scene-property-status')?.textContent||''),'',{timeout:15000});
  prof=await profile(p);assert.ok(prof.every(x=>Math.abs(x.t-prof[0].t)<.03)&&prof[0].t>.05,'Equilíbrio uniforme e aquecido: '+prof.map(x=>x.t.toFixed(2)).join(' '));
  // Recarga: a experiência continua (fonte desligada); Restaurar volta ao ambiente.
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);await p.locator('.silm-heat-handle').waitFor();
  await heater.click();await p.waitForTimeout(600);await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-restore').click();
  await p.waitForFunction(()=>[...document.querySelectorAll('.silm-crystal-unit')].every(n=>!n.dataset.heat||n.dataset.heat==='0'),'',{timeout:4000});
  assert.equal((await p.evaluate(()=>SILMIntegration.snapshot().properties.thermal.heating)),false,'Restaurar desliga a fonte');
 }finally{await ctx.close();}
 /* Calor + corrente (regra de Matthiessen): na condutividade elétrica, a mesma fonte aquece (transitória, sem gravar) e a
    camada de elétrons recebe a temperatura local; o texto explica o aumento da resistividade; Restaurar volta ao ambiente. */
 const combo=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'no-preference'});
 try{
  const p=await open(combo);await p.locator('#preset-cobre-cfc button').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline'&&location.hash==='#/ambiente');
  await nav.viewer(p,'eletrons');await p.locator('#silm-electrons').click();
  await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-start-electrical').click();await p.locator('#silm-panel-property-field').click();
  assert.equal(await p.locator('#silm-panel-property-heat').innerText(),'Ligar fonte de calor','Fonte de calor na condutividade elétrica');
  await p.locator('#silm-panel-property-heat').click();await p.locator('[data-close-dock="right"]').click();
  assert.equal(await p.locator('.silm-heat-handle').getAttribute('aria-pressed'),'true');
  assert.equal(await p.evaluate(()=>SILMIntegration.snapshot().properties.thermal.heating),false,'Calor da combinação é transitório (não gravado)');
  await p.waitForFunction(()=>document.querySelector('.silm-electron-canvas')?.silmElectrons.snapshot().heat===true,'',{timeout:4000});
  assert.match(await p.locator('#silm-scene-property-status').innerText(),/deriva média .* fica menor: a resistividade aumenta com a temperatura/);
  await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-restore').click();
  await p.waitForFunction(()=>document.querySelector('.silm-electron-canvas')?.silmElectrons.snapshot().heat===false,'',{timeout:4000});
  assert.equal(await p.locator('#silm-panel-property-heat').innerText(),'Ligar fonte de calor','Restaurar desliga a fonte');
 }finally{await combo.close();}
 /* Celular com movimento reduzido: sem animação, cada ação mostra o estado depois de 2 s de propagação. */
 const mob=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 try{
  const p=await open(mob);await prepare(p);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'Sem rolagem lateral');
  await p.locator('.silm-heat-handle').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>SILMIntegration.snapshot().properties.thermal.heating===true);
  await p.waitForFunction(()=>[...document.querySelectorAll('.silm-crystal-unit')].some(n=>Number(n.dataset.heat)>=2),'',{timeout:4000});
 }finally{await mob.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-THERMAL: fonte de calor na cena (toque, arraste e teclado), calor que avança sozinho a partir da fonte, equilíbrio uniforme depois de desligar, recarga, Restaurar, sem "Avançar propagação", celular e movimento reduzido; calor + corrente (fonte transitória, temperatura nos elétrons, resistividade maior, Restaurar).');
};
