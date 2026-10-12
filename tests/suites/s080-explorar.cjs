'use strict';
/* Série 0.8.x — módulo Explorar: investigação qualitativa integrada (testes obrigatórios §25 do prompt 0.8.x). */
module.exports={series:'0.8',async run(kit,{screenshots=false}={}){
 const {assert,state,go,investigate,assemble,reload,answer,openLeft,closeLeft,openRight,closeRight,switchModule,crystal,organize}=kit;
 const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const view=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('simcore_domain_silm_v1_exploration.view')||'null'));
 const startProp=async(page,id)=>{await openLeft(page,'Propriedades');if(await page.isVisible('#silm-prop-end'))await page.click('#silm-prop-end');await page.click('#silm-prop-start-'+id);await page.waitForFunction(id=>SILM.scientificState.properties.active===id,id);await closeLeft(page);};
 const focus=async page=>page.evaluate(()=>document.querySelector('#silm-focus [aria-pressed="true"]')?.dataset.focus||null);
 // Identidade da investigação (updatedAt muda, por projeto, ao trocar de módulo).
 const science=s=>({investigation:{id:s.investigation.id,status:s.investigation.status,type:s.investigation.type,createdAt:s.investigation.createdAt},metal:s.metal,structure:s.structure,electrons:s.electrons,properties:s.properties,measurements:s.measurements,calculations:s.calculations});

 await test('0.8-01','Cu: montagem → CFC → célula → rede → vizinhos → elétrons → condutividade → restaurar (fluxo integrado)',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,4);
  await openRight(page,'ver','Observar');assert.equal(await focus(page),'structure','Foco: montagem');assert.match(await page.locator('#silm-observe-body').textContent(),/Montagem/);await closeRight(page);
  await organize(page);await openRight(page,'ver','Observar');assert.equal(await focus(page),'structure');assert.match(await page.locator('#silm-observe-body').textContent(),/Número de coordenação\s*12/);await closeRight(page);
  await page.click('#silm-crystal-view-lattice');await page.click('#silm-crystal-view-cell');await page.click('#silm-crystal-neighbors');
  await openRight(page,'ver','Observar');assert.equal(await focus(page),'unit','Foco segue a unidade selecionada');assert.match(await page.locator('#silm-observe-body').textContent(),/vizinhos imediatos/i);await closeRight(page);
  await page.click('#silm-electrons-toggle');await openRight(page,'ver','Observar');assert.equal(await focus(page),'electrons');await closeRight(page);
  await startProp(page,'electrical');await page.click('#silm-stage-prop-field');await openRight(page,'ver','Observar');assert.equal(await focus(page),'property');
  assert.match(await page.locator('#silm-observe-body').textContent(),/O que você alterou[\s\S]*Como interpretar/);await shot(page,'x01-observar-propriedade');await closeRight(page);
  await page.click('#silm-stage-prop-restore');const s=await state(page);assert.equal(s.properties.electrical.field,false);assert.equal(s.structure.crystallography.structureType,'FCC');assert.equal(s.electrons.representation.visible,true);
  return {flow:'livre → CFC → célula/rede → vizinhos → elétrons → campo → restaurar'};
 });

 await test('0.8-02','Fluxo não linear: elétrons e propriedade elétrica direto na montagem livre',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,3);await startProp(page,'electrical');
  const s=await state(page);assert.equal(s.structure.mode,'free');assert.equal(s.properties.active,'electrical');assert.ok(s.electrons.representation.visible);return {nonLinear:true};
 });

 for(const [id,sym,code,type] of [['0.8-03','Mg','HC','HCP'],['0.8-04','Fe','CCC','BCC']])await test(id,sym+': '+code+' conforme o banco e a condição',async use=>{
  const page=await use();await crystal(page,sym,3);const s=await state(page),db=await page.evaluate(z=>{const e=SILM.data.get(z);return {type:SILM.crystal.eligibility(e).structureType,cond:SILM.data.structure(e).conditions.temperature.display};},s.metal.atomicNumber);
  assert.equal(s.structure.crystallography.structureType,type);assert.equal(db.type,type);await openRight(page,'ver','Observar');const t=await page.locator('#silm-observe-body').textContent();assert.ok(t.includes(db.cond),'Condição de referência');await closeRight(page);
  return {structure:code,condition:db.cond};
 });

 await test('0.8-05','Metal com cristalografia indisponível: Explorar continua útil (montagem, elétrons, propriedade elétrica)',async use=>{
  const page=await use();await investigate(page,'Mn');await assemble(page,4);assert.equal(await page.getAttribute('#silm-assembly-organize','aria-disabled'),'true');
  await openRight(page,'ver','Camadas');assert.equal(await page.isVisible('#silm-layer-cell'),false,'Sem camada de célula na montagem livre');await closeRight(page);
  await openRight(page,'ver','Comparar');assert.equal(await page.getAttribute('#silm-compare-free-crystal','aria-disabled'),'true');assert.match(await page.locator('#silm-compare-reason-free-crystal').textContent(),/Organize a estrutura/);await closeRight(page);
  await startProp(page,'electrical');assert.equal((await state(page)).properties.active,'electrical');return {metal:'Mn'};
 });

 await test('0.8-06','Propriedade indisponível: motivo visível, sem iniciar',async use=>{
  const page=await use();await investigate(page,'Sn');await assemble(page,3);await openLeft(page,'Propriedades');
  assert.equal(await page.getAttribute('#silm-prop-start-luster','aria-disabled'),'true');await page.click('#silm-prop-start-luster',{force:true});assert.equal((await state(page)).properties.active,null);await closeLeft(page);return {metal:'Sn'};
 });

 await test('0.8-07','Camadas: ativar e desativar sem duplicar estado (reusa célula, rede, vizinhos, elétrons e rótulos)',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.click('#silm-electrons-toggle');await startProp(page,'malleability');await page.click('#silm-stage-prop-compress');
  await openRight(page,'ver','Camadas');
  const pressed=id=>page.getAttribute('#silm-layer-'+id,'aria-pressed');
  for(const id of ['centers','cell','lattice','neighbors','electrons','labels','hints'])assert.ok(await page.locator('#silm-layer-'+id).count(),id);
  await page.click('#silm-layer-cell');assert.equal((await state(page)).structure.crystallography.representation.unitCell,false);assert.equal(await pressed('cell'),'false');
  await page.click('#silm-layer-lattice');assert.equal((await state(page)).structure.crystallography.representation.view,'lattice');
  await page.click('#silm-layer-electrons');assert.equal((await state(page)).electrons.representation.visible,false,'Mesmo estado da 0.6.x');assert.equal(await page.getAttribute('#silm-electrons-toggle','aria-pressed'),'false');
  await page.click('#silm-layer-labels');assert.equal((await state(page)).structure.crystallography.representation.labels,true);
  await page.click('#silm-layer-neighbors');assert.equal((await state(page)).structure.crystallography.representation.neighbors,true);
  await page.click('#silm-layer-centers');assert.equal(await page.getAttribute('#silm-view','data-centers'),'dim');
  await page.click('#silm-layer-hints');assert.equal(await page.isVisible('.silm-property-overlay'),false);assert.equal((await state(page)).properties.malleability.compression,1,'Indicação oculta não muda a experiência');
  assert.deepEqual((await view(page)).layers,{centers:false,propertyHints:false});await shot(page,'x02-camadas');
  for(const id of ['centers','hints','electrons'])await page.click('#silm-layer-'+id);assert.equal(await page.isVisible('.silm-property-overlay'),true);await closeRight(page);
  return {layers:7};
 });

 await test('0.8-08','Comparação em todos os modos (derivada, somente leitura)',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.click('#silm-electrons-toggle');await startProp(page,'thermal');await page.click('#silm-stage-prop-heat');await page.waitForFunction(()=>SILM.scientificState.properties.thermal.stage===4,null,{timeout:8000});
  const before=science(await state(page));const counts={};
  for(const mode of ['free-crystal','cell-lattice','electrons','property']){
   await openRight(page,'ver','Comparar');await page.click('#silm-compare-'+mode);await page.click('#silm-compare-open');const dlg=kit.dialog(page);await dlg.waitFor();
   const panes=await dlg.locator('.silm-snapshot-stage[role=img]').count();const labels=await dlg.locator('.silm-snapshot-stage').evaluateAll(n=>n.map(x=>x.getAttribute('aria-label')));
   assert.equal(panes,2,mode);assert.match(labels[0],/^A: /);assert.match(labels[1],/^B: /);counts[mode]=labels;
   if(mode==='free-crystal')assert.match(labels[0],/Montagem livre/);if(mode==='cell-lattice')assert.match(labels[1],/rede extensa/);
   if(mode==='electrons'){assert.match(labels[0],/elétrons ocultos/);assert.match(labels[1],/elétrons visíveis/);}
   if(mode==='property')assert.match(labels[1],/Região à esquerda aquecida/);
   assert.equal(await dlg.locator('[id]').evaluateAll(n=>n.filter(x=>x.id.startsWith('silm-assembly')).length),0,'Sem ids duplicados da cena principal');
   const running=await page.evaluate(()=>[...document.querySelectorAll('dialog .silm-electron-canvas')].map(c=>c.silmElectrons.snapshot().running));assert.ok(running.every(r=>!r),'Sem laços de animação extras');
   if(mode==='property')await shot(page,'x03-comparar-propriedade');if(mode==='free-crystal')await shot(page,'x04-comparar-livre-cristalina');
   await answer(page,'Fechar');
  }
  assert.deepEqual(science(await state(page)),before,'Comparar não altera o estado científico');assert.equal((await view(page)).compare,'property');
  return {modes:4};
 });

 await test('0.8-08m','Comparação no celular: alternância A/B',async use=>{
  const page=await use({width:390,height:844,mobile:true});await crystal(page,'Cu',4);await openRight(page,'ver','Comparar');await page.locator('#silm-compare-cell-lattice').tap();await page.locator('#silm-compare-open').tap();
  const dlg=kit.dialog(page);await dlg.waitFor();assert.equal(await dlg.locator('#silm-compare-show-a').getAttribute('aria-pressed'),'true');
  const visible=async()=>dlg.locator('.silm-snapshot').evaluateAll(n=>n.filter(x=>!x.hidden).length);assert.equal(await visible(),1,'Uma cena por vez no celular');
  await dlg.locator('#silm-compare-show-b').tap();assert.equal(await dlg.locator('#silm-compare-show-b').getAttribute('aria-pressed'),'true');assert.equal(await visible(),1);
  await shot(page,'m-390-comparar-ab');await answer(page,'Fechar');return {mobile:'A/B'};
 });

 await test('0.8-09','Explorar → Medir → Calcular → Explorar preserva o estado científico',async use=>{
  const page=await use();await crystal(page,'Fe',3);await page.click('#silm-electrons-toggle');await startProp(page,'luster');await page.click('#silm-stage-prop-light');const before=science(await state(page));
  for(const m of ['medir','calcular','explorar'])await switchModule(page,m);const after=await state(page);
  assert.deepEqual(science(after),before);assert.equal(after.module.active,'explorar');assert.equal(await page.locator('.silm-crystal-unit[data-lit]').count()>0,true);return {preserved:true};
 });

 await test('0.8-10','Ida e volta ao Manual e ao Professor preserva a investigação',async use=>{
  const page=await use();await crystal(page,'Mg',3);await startProp(page,'ductility');await page.click('#silm-stage-prop-stretch');const before=science(await state(page));
  await page.goto(kit.base+'#/manual/propriedades-metalicas');await page.waitForTimeout(300);await page.goto(kit.base+'#/professor');await page.waitForTimeout(300);await go(page);await page.waitForSelector('.silm-crystal');
  assert.deepEqual(science(await state(page)),before);assert.equal(await page.locator('.silm-force-indicator line').count(),4);return {preserved:true};
 });

 await test('0.8-11','Reload: foco, camadas e comparação restaurados; estado científico intacto',async use=>{
  const page=await use();await crystal(page,'Cu',4);await openRight(page,'ver','Camadas');await page.click('#silm-layer-centers');await closeRight(page);
  await openRight(page,'ver','Observar');await page.click('#silm-focus [data-focus="synthesis"]');await closeRight(page);await openRight(page,'ver','Comparar');await page.click('#silm-compare-cell-lattice');await closeRight(page);
  const before=science(await state(page));await reload(page);await page.waitForSelector('.silm-crystal');
  assert.deepEqual(science(await state(page)),before);assert.deepEqual(await view(page),{focus:'synthesis',layers:{centers:false,propertyHints:true},compare:'cell-lattice'});
  assert.equal(await page.getAttribute('#silm-view','data-centers'),'dim');await openRight(page,'ver','Observar');assert.equal(await focus(page),'synthesis');await closeRight(page);
  const schema=await page.evaluate(()=>SILM.scientificSchemaVersion);assert.equal(schema,6,'Reorganização de interface não incrementa o schema científico');
  return {restored:true,schema};
 });

 await test('0.8-11b','Representação de exploração corrompida não impede a investigação',async use=>{
  const page=await use({storage:{'simcore_domain_silm_v1_exploration.view':{focus:'x',layers:{centers:'sim'},compare:42}}});await crystal(page,'Cu',3);
  assert.deepEqual(await view(page),{focus:'structure',layers:{centers:true,propertyHints:true},compare:null});return {sanitized:true};
 });

 await test('0.8-12','Offline: Explorar integrado sem rede',async use=>{
  const page=await use({serviceWorkers:'allow'});await go(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await kit.ready(page);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:20000});await page.context().setOffline(true);await reload(page);
  await page.click('.silm-periodic .periodic-element[data-symbol="Au"]');await page.click('.silm-periodic [id$="-investigate"]');await page.waitForSelector('#silm-start-assembly');await assemble(page,3);await organize(page);
  await openRight(page,'ver','Comparar');await page.click('#silm-compare-free-crystal');await page.click('#silm-compare-open');await kit.dialog(page).waitFor();assert.equal(await kit.dialog(page).locator('.silm-snapshot').count(),2);await answer(page,'Fechar');
  assert.equal(await page.evaluate(()=>navigator.onLine),false);return {offline:true};
 });

 for(const [w,h,label] of [[320,740,'320'],[360,760,'360'],[390,844,'390'],[844,390,'landscape'],[768,1024,'tablet']])await test('0.8-13-'+label,'Mobile/tablet '+label+': Ver com foco e camadas',async use=>{
  const page=await use({width:w,height:h,mobile:w<900});await crystal(page,'Cu',4);await openRight(page,'ver','Camadas');await page.locator('#silm-layer-lattice').scrollIntoViewIfNeeded();await page.locator('#silm-layer-lattice').tap();
  assert.equal((await state(page)).structure.crystallography.representation.view,'lattice');const box=await page.locator('#silm-layer-lattice').boundingBox();assert.ok(box.height>=40,'Alvo de toque: '+box.height);
  if(label==='390')await shot(page,'m-390-camadas');await closeRight(page);
  const m=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,stage:Math.round(document.getElementById('silm-assembly-stage').getBoundingClientRect().width)}));
  assert.ok(m.overflow<=0&&m.stage>=(label==='landscape'?150:200),JSON.stringify(m));return m;
 });

 await test('0.8-14','Teclado: foco, camadas e comparação operáveis',async use=>{
  const page=await use();await crystal(page,'Cu',4);await openRight(page,'ver','Observar');await page.focus('#silm-focus [data-focus="synthesis"]');await page.keyboard.press('Enter');assert.equal(await focus(page),'synthesis');
  await openRight(page,'ver','Camadas');await page.focus('#silm-layer-cell');await page.keyboard.press('Space');assert.equal((await state(page)).structure.crystallography.representation.unitCell,false);
  await openRight(page,'ver','Comparar');await page.focus('#silm-compare-cell-lattice');await page.keyboard.press('Enter');await page.focus('#silm-compare-open');await page.keyboard.press('Enter');
  await kit.dialog(page).waitFor();await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog.app-dialog'));return {keyboard:true};
 });

 await test('0.8-15','Acessibilidade: região científica nomeada, estado das camadas, A/B semânticos; axe-core',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await crystal(page,'Cu',4);await page.click('#silm-electrons-toggle');
  assert.match(await page.getAttribute('#silm-assembly-stage','aria-label'),/Estrutura cristalina/);
  await openRight(page,'ver','Camadas');assert.match(await page.locator('#silm-layers-status').textContent(),/Camadas visíveis:/);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#workspace').analyze();
  const serious=scan.violations.filter(v=>['serious','critical'].includes(v.impact));assert.deepEqual(serious.map(v=>v.id+': '+v.nodes.map(n=>n.target.join(' ')).join(' | ')),[]);
  await openRight(page,'ver','Comparar');await page.click('#silm-compare-electrons');await page.click('#silm-compare-open');await kit.dialog(page).waitFor();
  const scan2=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).include('dialog.app-dialog').analyze();
  const serious2=scan2.violations.filter(v=>['serious','critical'].includes(v.impact));assert.deepEqual(serious2.map(v=>v.id),[]);await answer(page,'Fechar');
  await page.evaluate(()=>{SimCore.accessibility.set('contrast',true);SimCore.accessibility.set('colorblind','deuteranopia');});await page.waitForTimeout(200);await shot(page,'x05-alto-contraste');
  await page.evaluate(()=>SimCore.accessibility.set('colorblind','none'));return {violations:scan.violations.length,dialog:scan2.violations.length};
 });

 await test('0.8-17','Correção de origem 0.1.x: link direto para um tópico do Manual abre o tópico',async use=>{
  const page=await use();for(const id of ['explorar','propriedades-metalicas','montagem']){await page.goto(kit.base+'#/manual/'+id);await page.waitForFunction(()=>document.getElementById('manual-screen')?.dataset.manualView==='topic',null,{timeout:8000});
   assert.notEqual(await page.locator('#manual-titulo').textContent(),'Encontre seu próximo passo.');}
  await page.goto(kit.base+'#/manual');await page.waitForTimeout(300);assert.equal(await page.locator('#manual-titulo').textContent(),'Encontre seu próximo passo.','Sem tópico na rota, o índice');
  return {deepLink:true};
 });

 await test('0.8-16','Indicador de estado compacto e eventos sem registrar cada clique',async use=>{
  const page=await use();await crystal(page,'Cu',4);await startProp(page,'luster');
  assert.match(await page.locator('#silm-assembly-meta').textContent(),/CFC .*Brilho metálico em estudo/);
  await openRight(page,'ver','Camadas');for(let i=0;i<4;i++)await page.click('#silm-layer-centers');await closeRight(page);
  await openRight(page,'dados','Histórico');const h=await page.locator('#silm-history').textContent();assert.ok(!/Camada|camada/.test(h),'Camadas de apresentação não poluem o Histórico');await closeRight(page);
  return {indicator:true};
 });
}};
