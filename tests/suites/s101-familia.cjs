'use strict';
/* Série 0.10.1 — correção de origem: o SILM adota a gramática da família (Base Estrutural 0.3.1) e o pedido R06 do autor
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
  await go(page);await page.click('#access-btn');await page.waitForSelector('#drawer-sound-check');
  assert.equal(await page.evaluate(()=>document.getElementById('drawer-sound-check-label').textContent),'Som das medições');assert.equal(await page.isChecked('#drawer-sound-check'),false);
  assert.match(await page.evaluate(()=>document.getElementById('drawer-sound-check').closest('.a11y-row').textContent),/tom grave para 8 \(CCC\), agudo para 12 \(CFC e HC\)/);
  await page.check('#drawer-sound-check');await page.check('#drawer-vibrate-check');assert.deepEqual(await page.evaluate(()=>window.__tones),[440],'amostra ao ligar');await page.keyboard.press('Escape');
  await kit.crystal(page,'Cu',4);await kit.switchModule(page,'medir');await openRight(page,'ver','Medir');await page.click('#silm-tool-coordination');await kit.closeRight(page);
  const id=await page.evaluate(()=>SILM.scientificState.structure.units[0].id);await page.click(`.silm-crystal-unit[data-unit-id="${id}"]`);
  await page.waitForFunction(()=>SILM.scientificState.measurements.length===1);const tones=await page.evaluate(()=>window.__tones),vib=await page.evaluate(()=>window.__vib);
  /* Cobre (CFC): coordenação 12 → tom agudo da faixa 8–12, 880 Hz. */assert.equal(tones.at(-1),880,'tom da coordenação: '+tones);assert.deepEqual(vib.at(-1),[40]);
  /* As outras medidas só vibram: a distância não toca tom. */
  await openRight(page,'ver','Medir');await page.click('#silm-tool-distance');await kit.closeRight(page);const ids=await page.evaluate(()=>SILM.scientificState.structure.units.slice(0,2).map(u=>u.id));
  for(const u of ids)await page.click(`.silm-crystal-unit[data-unit-id="${u}"]`);await page.waitForFunction(()=>SILM.scientificState.measurements.length===2);
  assert.equal((await page.evaluate(()=>window.__tones)).length,tones.length,'distância sem tom');assert.equal((await page.evaluate(()=>window.__vib)).length,vib.length+1,'distância vibra');return {tones};
 });

 await test('0.10.1-REV','Revisão: Dados do metal, tema que redesenha, montagem pronta com confirmação verdadeira e Calcular limpo; roteiro com os grupos do SILM e Agora com a atividade; missão por Concluir missão',async use=>{
  const page=await use();
  await kit.investigate(page,'Cu');await page.click('#silm-info');await page.waitForFunction(()=>SimCore.workspace.tool==='tabela');await kit.closeRight(page);
  /* Tema de outro metal mostra a Tabela; tema do metal da investigação volta à cena da investigação. */
  const theme=async id=>{await page.evaluate(()=>SimCore.router.navigate('aprender'));await page.click('#theme-'+id);await page.click('#theme-investigate');await page.waitForFunction(()=>SimCore.router.current.id==='laboratorio');};
  await theme('estrutura');await page.waitForSelector('.periodic-element.is-selected[data-symbol="Fe"]');
  await theme('ligacao-metalica');await page.waitForSelector('#silm-start-assembly');assert.equal(await page.locator('.periodic-grid').count(),0,'a Tabela não fica velha na cena');
  /* Montagem pronta sobre uma investigação: confirmação do SILM; a fórmula escolhida antes não sobrevive. */
  await kit.assemble(page,4);await kit.organize(page);await kit.switchModule(page,'calcular');await openRight(page,'ver','Calcular');
  await page.click('#silm-calc-packing-factor');await page.waitForSelector('#silm-calc-run');await kit.closeRight(page);
  await page.evaluate(()=>SimCore.router.navigate('montagens'));await page.waitForSelector('#preset-apply-ferro-ccc');await page.click('#preset-apply-ferro-ccc');
  const d=kit.dialog(page);await d.waitFor();const msg=await d.textContent();
  assert.match(msg,/Iniciar uma nova investigação\?/);assert.match(msg,/estrutura, medições e cálculos/);assert.doesNotMatch(msg,/Desfazer/);
  await d.locator('.dialog-actions button.primary-btn').click();await page.waitForFunction(()=>SILM.scientificState.metal?.atomicNumber===26&&SILM.scientificState.structure?.mode==='crystalline');
  await kit.switchModule(page,'calcular');await openRight(page,'ver','Calcular');assert.equal(await page.locator('#silm-calc-run').count(),0,'nenhuma fórmula da estrutura anterior');await kit.closeRight(page);
  /* Roteiro: a Montagem continua com os grupos do SILM e o cartão Agora diz qual atividade está aberta. */
  const r=await use();await go(r,'roteiros/percurso-interface');await r.click('#activity-start');await r.waitForFunction(()=>SimCore.experience.current.activity.current?.type==='route');
  assert.ok((await r.evaluate(()=>SimCore.experience.current.activity.getDefinition().procedure.join(' '))).includes('Em Montagem → Módulo'));
  await r.evaluate(()=>SimCore.router.navigate('laboratorio'));await r.waitForFunction(()=>SimCore.router.current.id==='laboratorio');await r.click('#workspace-left');
  assert.deepEqual(await r.locator('#dock-left-tabs button').allTextContents(),['Resumo','Metal','Estrutura','Propriedades','Módulo']);await kit.closeLeft(r);
  await r.click('#core-menu');assert.equal(await text(r,'.drawer-now-detail'),'Um percurso pelo SILM · Explorar');await r.keyboard.press('Escape');
  /* Missão: a ajuda cita um rótulo que existe no Menu da atividade, que leva aos dois campos. */
  const m=await use();await go(m,'missoes/revisar-registro');await m.click('#activity-start');await m.waitForFunction(()=>SimCore.experience.current.activity.current?.type==='mission');
  assert.match(await m.evaluate(()=>SimCore.experience.current.activity.getDefinition().help.instructions),/Concluir missão no Menu da atividade/);
  await m.evaluate(()=>SimCore.router.navigate('laboratorio'));await m.waitForFunction(()=>SimCore.router.current.id==='laboratorio');await m.click('#core-menu');
  await m.waitForSelector('#shell-activity-finish');assert.equal(await text(m,'#shell-activity-finish'),'Concluir missão');await m.click('#shell-activity-finish');
  await m.waitForSelector('#mission-evidence');await m.fill('#mission-evidence','Abri Montagem, Ver e Dados.');await m.fill('#mission-conclusion','Concluir guarda a atividade; Encerrar volta ao Laboratório Livre.');
  await m.click('#mission-finish');await m.waitForFunction(()=>SimCore.experience.current.activity.current?.status==='completed');
  return {};
 });
}};
