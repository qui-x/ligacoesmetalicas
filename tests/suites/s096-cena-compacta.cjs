'use strict';
/* SILM 0.9.1 — correção de homologação: texto demais na cena no celular e no tablet; esferas ovais com fonte
   simplificada. A cena mantém estrutura, controles e uma linha de retorno; as explicações ficam em "Como ler esta cena". */
module.exports={series:'0.9',async run(kit,{screenshots=false}={}){
 const {assert,state,investigate,assemble,organize,crystal,reload}=kit;const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const visibleFooterTexts=page=>page.evaluate(()=>[...document.querySelectorAll('.silm-assembly-footer p,.silm-assembly-footer .silm-assembly-kind,.silm-assembly-footer .silm-assist-badge')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>2&&r.height>2&&cs.visibility!=='hidden'&&!e.closest('details:not([open]) > :not(summary)')&&e.checkVisibility?.()!==false;}).map(e=>e.className));
 const stageSize=page=>page.evaluate(()=>Math.round(document.getElementById('silm-assembly-stage').getBoundingClientRect().width));

 await test('0.9.1-01','Tablet (768 px, fonte simplificada): cena prioritária, explicações recolhidas, sem linha de título repetida',async use=>{
  const page=await use({width:768,height:860,storage:{simcore_a11y_v1:{reading:'on',theme:'light'}}});await crystal(page,'Fe',4);await page.click('#silm-electrons-toggle');await page.waitForTimeout(300);
  const notes=page.locator('#silm-scene-notes');assert.equal(await notes.count(),1);assert.equal(await notes.evaluate(d=>d.open),false,'fechado por padrão até 900 px');
  assert.equal(await page.locator('#silm-scene-notes > summary').textContent(),'Como ler esta cena');
  const texts=await visibleFooterTexts(page);assert.deepEqual(texts,['silm-assembly-feedback'],'só a linha de retorno fica visível na cena: '+JSON.stringify(texts));
  // as explicações continuam no DOM (descrição das unidades por aria-describedby) e dentro das notas
  for(const sel of ['#silm-assembly-help','.silm-crystal-legend','#silm-electron-legend','.silm-assembly-kind','#silm-crystal-cell-status'])assert.equal(await page.locator('#silm-scene-notes '+sel).count(),1,sel);
  assert.equal(await page.locator('.silm-crystal-unit').first().getAttribute('aria-describedby'),'silm-assembly-help');
  const toolbar=await page.evaluate(()=>({status:getComputedStyle(document.getElementById('module-status')).display,height:document.getElementById('workspace-toolbar').getBoundingClientRect().height}));
  assert.equal(toolbar.status,'none');assert.ok(toolbar.height<=1,'linha "SILM — A Arquitetura dos Metais" removida no celular/tablet: '+toolbar.height);
  const size=await stageSize(page);assert.ok(size>=280,'cena com pelo menos 280 px (era 185 px): '+size);
  const status=await page.evaluate(()=>{const e=document.querySelector('.silm-electron-status');return {text:e.textContent,width:e.getBoundingClientRect().width};});assert.match(status.text,/Elétrons visíveis/);assert.ok(status.width<=1,'estado eletrônico só para leitores de tela até 900 px');
  await shot(page,'c01-tablet-cena');
  await page.click('#silm-scene-notes > summary');assert.equal(await notes.evaluate(d=>d.open),true);assert.ok(await page.locator('#silm-electron-legend').isVisible());await shot(page,'c02-tablet-notas-abertas');
  await reload(page);await page.waitForSelector('.silm-crystal');assert.equal(await page.locator('#silm-scene-notes').evaluate(d=>d.open),true,'a escolha do usuário é lembrada');
  return {stage:size,texts};
 });

 await test('0.9.1-02','Celular 360 px: notas pelo teclado; metadados em até duas linhas com texto integral no título',async use=>{
  const page=await use({width:360,height:760,mobile:true});await crystal(page,'Cu',4);
  const summary=page.locator('#silm-scene-notes > summary');await summary.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#silm-scene-notes').evaluate(d=>d.open),true);
  await page.keyboard.press('Enter');assert.equal(await page.locator('#silm-scene-notes').evaluate(d=>d.open),false);
  const meta=await page.evaluate(()=>{const m=document.getElementById('silm-assembly-meta'),lh=parseFloat(getComputedStyle(m).lineHeight)||16;return {lines:Math.round(m.getBoundingClientRect().height/lh),title:m.title,text:m.textContent};});
  assert.ok(meta.lines<=2,JSON.stringify(meta));assert.equal(meta.title,meta.text);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=0);await shot(page,'c03-celular-360');return meta;
 });

 await test('0.9.1-05','Celular 320/360 px: botões do cartão do elemento quebram só entre palavras',async use=>{
  const out={};
  for(const w of [320,360]){const page=await use({width:w,height:740,mobile:true});await kit.go(page);await page.click('.silm-periodic .periodic-element[data-symbol="Cu"]');
   const buttons=await page.evaluate(()=>[...document.querySelectorAll('.periodic-actions button')].filter(b=>!b.hidden).map(b=>{const cs=getComputedStyle(b),lines=Math.round((b.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom))/parseFloat(cs.lineHeight||'20'));return {text:b.textContent,lines,wrap:cs.overflowWrap};}));
   assert.ok(buttons.every(b=>b.wrap!=='anywhere'),JSON.stringify(buttons));assert.ok(buttons.find(b=>/Iniciar investigação/.test(b.text)).lines<=1,JSON.stringify(buttons));out[w]=buttons;}
  return out;
 });

 await test('0.9.1-03','Esferas sempre redondas; símbolo sem quebra e oculto quando não cabe (fonte simplificada + espaçamento)',async use=>{
  const page=await use({width:768,height:860,storage:{simcore_a11y_v1:{reading:'on',spacing:'on'}}});await investigate(page,'Fe');await assemble(page,30);await organize(page);
  const probe=()=>page.evaluate(()=>[...document.querySelectorAll('.silm-crystal-unit .silm-unit-core')].map(c=>{const r=c.getBoundingClientRect();return {w:r.width,h:r.height,lines:c.scrollHeight>c.clientHeight+1,font:parseFloat(getComputedStyle(c).fontSize)};}));
  const cell=await probe();assert.ok(cell.every(c=>Math.abs(c.w-c.h)<=1),'célula: esferas redondas '+JSON.stringify(cell.slice(0,3)));assert.ok(cell.every(c=>!c.lines),'símbolo sem quebra');
  await page.click('#silm-crystal-view-lattice');await page.waitForTimeout(400);
  const lattice=await probe(),symbols=await page.getAttribute('.silm-crystal','data-symbols');
  assert.ok(lattice.every(c=>Math.abs(c.w-c.h)<=1),'rede: esferas redondas '+JSON.stringify(lattice.slice(0,3)));
  const px=lattice[0].w;assert.equal(symbols,px<16?'hidden':'shown');if(symbols==='hidden')assert.ok(lattice.every(c=>c.font===0));
  assert.match(await page.locator('.silm-crystal-unit').first().getAttribute('aria-label'),/Unidade de ferro 1 de/);
  await shot(page,'c04-rede-esferas-redondas');return {cellDiameter:Math.round(cell[0].w),latticeDiameter:Math.round(px),symbols};
 });

 await test('0.9.1-04','Desktop: notas abertas por padrão na coluna lateral; montagem livre também recolhe as instruções',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,3);
  assert.equal(await page.locator('#silm-scene-notes').evaluate(d=>d.open),true);assert.equal(await page.locator('#silm-scene-notes #silm-assembly-help').count(),1);
  assert.match(await page.locator('#silm-assembly-help').textContent(),/arraste-a ou use as setas/);
  await organize(page);assert.equal(await page.locator('#silm-scene-notes').evaluate(d=>d.open),true);
  const m=await use({width:390,height:844,mobile:true});await investigate(m,'Cu');await assemble(m,3);
  assert.equal(await m.locator('#silm-scene-notes').evaluate(d=>d.open),false);assert.deepEqual(await visibleFooterTexts(m),['silm-assembly-feedback']);
  return {desktop:'aberto',mobile:'fechado'};
 });
}};
