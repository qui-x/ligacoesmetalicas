'use strict';
/* Série 0.10.1 — correção de origem: o SILM adota a gramática da família (Base Estrutural 0.3.0) e o pedido R06 do autor
   (Tabela Periódica cabendo na tela em qualquer dimensão). Nenhum dado ou cálculo científico muda. */
module.exports={series:'0.10',async run(kit,{screenshots=false}={}){
 const {assert,go,state,openLeft,closeLeft,openRight}=kit;const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const text=(page,sel)=>page.locator(sel).first().evaluate(e=>e.textContent.trim());

 await test('0.10.1-HOME','Página inicial editorial: "A Arquitetura dos Metais", lema, Laboratório em destaque e metas vivas',async use=>{
  const page=await use();await go(page,'inicio');await page.waitForSelector('#home-title');
  assert.equal(await text(page,'#home-title'),'A Arquitetura dos Metais');assert.equal(await text(page,'#home-title .home-accent'),'dos Metais');
  assert.equal(await text(page,'.home-motto'),'Observe. Monte. Meça. Interprete.');assert.equal(await text(page,'.home-eyebrow'),'SIMULADOR INTERATIVO DE LIGAÇÕES METÁLICAS');
  assert.equal(await page.locator('#path-laboratorio.is-featured').count(),1);assert.equal(await text(page,'#path-laboratorio .path-cta'),'Entrar no laboratório');
  assert.equal(await text(page,'#path-aprender-meta'),'4 temas para explorar');assert.deepEqual(await page.locator('.home-support-links a').allTextContents(),['Manual de uso','Área do Professor']);
  await shot(page,'f01-inicio');return {};
 });

 await test('0.10.1-START','Como deseja iniciar?: convite na primeira visita com cartões; um toque salva e leva ao destino',async use=>{
  const page=await use({invite:true});await page.goto(kit.base);await kit.ready(page);await page.waitForSelector('#startup-dialog[open]');
  assert.deepEqual(await page.locator('.startup-option strong').allTextContents(),['Página inicial','Aprender','Laboratório']);
  assert.equal(await text(page,'.startup-brand span'),'A Arquitetura dos Metais');assert.match(await text(page,'#startup-description'),/ao abrir o SILM\.$/);
  await shot(page,'f02-inicializacao');await page.click('.startup-option[data-startup=laboratorio]');await page.waitForFunction(()=>SimCore.router.current.id==='laboratorio');
  assert.equal(await page.evaluate(()=>SimCore.storage.core.get('startup')),'laboratorio');return {};
 });

 await test('0.10.1-MENU','Menu: Agora com metal e módulo; Montagens prontas; abertura em Acessibilidade, não em Recursos',async use=>{
  const page=await use();await kit.investigate(page,'Cu');await page.click('#core-menu');
  assert.equal(await text(page,'.drawer-now-detail'),'Cobre · Explorar');assert.equal(await text(page,'#drawer-continue'),'Continuar no laboratório');
  assert.equal(await page.locator('#drawer-resources a[data-nav=montagens]').count(),1);assert.equal(await page.locator('[data-shell-resource=abertura]').count(),0);
  await page.click('#shell-accessibility');await page.waitForSelector('#drawer-opening-check');assert.equal(await page.locator('#drawer-opening-check').count(),1);
  assert.match(await text(page,'#shell-a11y-controls .a11y-dica'),/Camadas, estados e medidas também são descritos em texto\./);
  await shot(page,'f03-menu-acessibilidade');return {};
 });

 await test('0.10.1-MONT','Montagem por grupos (Resumo, Metal, Estrutura, Propriedades, Módulo) e cartões de módulo numerados',async use=>{
  const page=await use();await kit.investigate(page,'Cu');await page.click('#workspace-left');
  assert.deepEqual(await page.locator('#dock-left-tabs button').allTextContents(),['Resumo','Metal','Estrutura','Propriedades','Módulo']);
  assert.equal(await page.locator('#dock-left-tabs [aria-pressed=true]').evaluate(e=>e.dataset.dockGroup),'estrutura');
  await openLeft(page,'Módulo');const cards=await page.evaluate(()=>[...document.querySelectorAll('[id^=module-head-]')].map(h=>h.textContent.replace(/\s+/g,' ').trim()));
  assert.ok(cards[0].includes('Explorar')&&cards[0].includes('1'),cards[0]);assert.ok(cards[2].includes('Calcular')&&cards[2].includes('3'),cards[2]);
  await shot(page,'f04-montagem-modulos');await closeLeft(page);return {cards};
 });

 await test('0.10.1-VER','Ver em famílias (Observar, Medir, Analisar) e Dados como ponto de partida, com "Dados do metal"',async use=>{
  const page=await use();await kit.crystal(page,'Cu',4);await page.click('#workspace-right');
  const tabs=(await page.locator('#dock-right-tabs button, [role=tab]').allTextContents()).map(x=>x.trim().toUpperCase());for(const f of ['OBSERVAR','MEDIR','ANALISAR'])assert.ok(tabs.includes(f),f+' em '+tabs.join(','));
  await openRight(page,'ver','Calcular');assert.equal(await page.evaluate(()=>SimCore.workspace.tool),'calcular');
  await page.click('#workspace-right-alt');assert.deepEqual(await page.locator('#dock-data-menu > button').allTextContents(),['Medições','Cálculos','Histórico','Dados do metal']);
  assert.equal(await text(page,'#dock-data-report h3'),'Relatório');await shot(page,'f05-dados');return {};
 });

 await test('0.10.1-PRESET','Montagens prontas: Cobre · CFC, Ferro · CCC e Magnésio · HC com a célula completa do banco',async use=>{
  const page=await use();const out={};
  for(const [id,z,type] of [['cobre-cfc',29,'FCC'],['ferro-ccc',26,'BCC'],['magnesio-hc',12,'HCP']]){
   await go(page,'montagens');await page.waitForSelector('#preset-apply-'+id);await page.click('#preset-apply-'+id);
   const dialog=page.locator('dialog.app-dialog[open]');if(await dialog.count())await dialog.locator('.dialog-actions button.primary-btn').click();
   await page.waitForFunction(z=>SILM.scientificState.metal?.atomicNumber===z&&SILM.scientificState.structure?.mode==='crystalline',z);
   const s=await state(page);out[id]={type:s.structure.structureType||s.structure.crystal?.type||null,units:s.structure.units.length};
   assert.equal(await page.evaluate(()=>SimCore.router.current.id),'laboratorio');
  }
  assert.equal(out['cobre-cfc'].units>=4,true);await shot(page,'f06-montagem-pronta');return out;
 });

 await test('0.10.1-APRENDER','Aprender em lista; Investigar no Laboratório seleciona o metal do tema (Estrutura → Fe)',async use=>{
  const page=await use();await go(page,'aprender');await page.waitForSelector('.theme-list');
  assert.deepEqual(await page.locator('.theme-list strong').allTextContents(),['Ligação metálica','Estrutura','Elétrons','Propriedades']);
  assert.deepEqual(await page.locator('.theme-list .status-text').allTextContents(),Array(4).fill('Não revisado'));
  await page.click('#theme-estrutura');await page.click('#theme-investigate');await page.waitForFunction(()=>SimCore.router.current.id==='laboratorio');
  await page.waitForSelector('.periodic-element.is-selected');assert.equal(await page.locator('.periodic-element.is-selected').getAttribute('data-symbol'),'Fe');
  assert.equal((await state(page)).investigation,null,'a investigação começa pelo gesto da pessoa');return {};
 });

 await test('0.10.1-R06','R06: a Tabela Periódica cabe na cena em várias telas; no celular, rola com dica',async use=>{
  const sizes={};
  for(const [w,h] of [[1920,1080],[1366,800],[1024,768],[768,1024],[390,844]]){
   const page=await use({width:w,height:h,mobile:w<600});await go(page);await page.waitForSelector('.periodic-grid');await page.waitForTimeout(300);
   const m=await page.evaluate(()=>{const s=document.querySelector('.periodic-scroll'),r=document.querySelector('.silm-periodic');return {cell:parseFloat(getComputedStyle(r).getPropertyValue('--periodic-cell')),x:s.scrollWidth-s.clientWidth,y:s.scrollHeight-s.clientHeight,hint:!document.querySelector('.periodic-scroll-hint').hidden,page:document.documentElement.scrollWidth-innerWidth};});
   sizes[w+'x'+h]=m;assert.ok(m.cell>=26,'célula ≥ 26 px em '+w);assert.ok(m.page<=1,'sem rolagem lateral da página em '+w);
   if(w>=768){assert.ok(m.x<=1,'cabe na largura em '+w+': '+m.x);assert.ok(m.y<=2,'cabe na altura em '+w+': '+m.y);assert.equal(m.hint,false);}else assert.equal(m.hint,true,'dica de rolagem no celular');
   await shot(page,'f07-tabela-'+w);
  }
  return sizes;
 });
 await test('0.10.1-TOUR','Tour do laboratório com nota de boas-vindas; cena diz MONTAGEM LIVRE / ESTRUTURA CRISTALINA',async use=>{
  const page=await use({welcome:true});await go(page);await page.waitForSelector('#workspace-welcome:not([hidden])');assert.match(await text(page,'#workspace-welcome'),/Primeira vez no laboratório\?/);
  await page.click('#workspace-welcome-tour');await page.waitForSelector('dialog#tour[open]');assert.equal(await text(page,'#tour-passo'),'PASSO 1 DE 5');await page.keyboard.press('Escape');
  const c=await use();await kit.investigate(c,'Cu');await kit.assemble(c,2);assert.equal(await text(c,'.silm-assembly-eyebrow'),'MONTAGEM LIVRE');
  await kit.organize(c);assert.equal(await text(c,'.silm-assembly-eyebrow'),'ESTRUTURA CRISTALINA');return {};
 });

 await test('0.10.1-SOM','Som e toque: linhas em Acessibilidade, desligadas por padrão; medição com a preferência ligada toca e vibra',async use=>{
  const page=await use();await page.addInitScript(()=>{window.__tones=[];const P=AudioContext.prototype,c=P.createOscillator;P.createOscillator=function(){const o=c.call(this),s=o.start.bind(o);o.start=(...a)=>{window.__tones.push(Math.round(o.frequency.value));return s(...a);};return o;};window.__vib=[];Object.defineProperty(navigator,'vibrate',{configurable:true,value:p=>{window.__vib.push(p);return true;}});});
  await page.reload();await kit.ready(page);await page.click('#access-btn');await page.waitForSelector('#drawer-sound-check');
  assert.equal(await page.evaluate(()=>document.getElementById('drawer-sound-check-label').textContent),'Som das medições');assert.equal(await page.isChecked('#drawer-sound-check'),false);
  await page.check('#drawer-sound-check');await page.check('#drawer-vibrate-check');await page.keyboard.press('Escape');
  await kit.crystal(page,'Cu',4);await kit.switchModule(page,'medir');await openRight(page,'ver','Medir');await page.click('#silm-tool-coordination');await kit.closeRight(page);
  const id=await page.evaluate(()=>SILM.scientificState.structure.units[0].id);await page.click(`.silm-crystal-unit[data-unit-id="${id}"]`);
  await page.waitForFunction(()=>SILM.scientificState.measurements.length===1);const tones=await page.evaluate(()=>window.__tones),vib=await page.evaluate(()=>window.__vib);
  assert.ok(tones.length>=2,'amostra + medição: '+tones);assert.deepEqual(vib.at(-1),[40]);return {tones};
 });
}};
