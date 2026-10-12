'use strict';
/* Regressão da série 0.4.x — montagem metálica (itens 122–148 do prompt 0.4.x), adaptada aos painéis Montagem/Ver/Dados. */
module.exports={series:'0.4',async run(kit,{screenshots=false}={}){
 const {assert,KEY}=kit,{state,stored,units,ready,go,investigate,assemble,reload,dialog,answer,openLeft,closeLeft,switchModule,point,center,drag,freeSpot,overlapFree,near,feedback}=kit;
 const base=kit.base,shot=screenshots?kit.shot:async()=>{},test=kit.test;
 await test('0.4-122','Migração schema 2 (0.3.0) → schema 3',async use=>{
  const seed={schemaVersion:2,investigation:{id:'inv-030-homologacao-cobre',status:'active',type:'free',createdAt:'2026-10-01T10:00:00.000Z',updatedAt:'2026-10-01T10:05:00.000Z'},metal:{atomicNumber:29,symbol:'Cu',sourceId:'src-iupac-periodic-table'},module:{active:'explorar'},structure:null,electrons:null,conditions:{temperature:null,pressure:null},observations:[],measurements:[],calculations:[],representation:{dimension:null,layers:[]},metadata:{}};
  // sourceId real do banco, para que o estado 0.3.0 seja válido.
  const page=await use();await go(page);seed.metal.sourceId=await page.evaluate(()=>SILM.data.get(29).identityProvenance.atomicNumber.sourceId);await page.context().close();
  const migrated=await use({seed});await go(migrated);const s=await state(migrated);
  assert.equal(s.schemaVersion,await migrated.evaluate(()=>SILM.scientificSchemaVersion));assert.equal(s.structure,null);assert.equal(s.investigation.id,seed.investigation.id);assert.equal(s.metal.symbol,'Cu');
  assert.equal((await stored(migrated)).schemaVersion,s.schemaVersion);await migrated.waitForSelector('#silm-start-assembly');
  assert.equal(await migrated.locator('.silm-unit').count(),0,'Nenhuma montagem automática');
  await shot(migrated,'01-desktop-investigacao-sem-estrutura');
  return {from:2,to:3,structure:null,investigationPreserved:true};
 });

 await test('0.4-123','Iniciar montagem cria estrutura vazia',async use=>{
  const page=await use();await investigate(page);const before=await state(page);await assemble(page);const s=await state(page);
  assert.deepEqual({type:s.structure.type,status:s.structure.status,units:s.structure.units.length,z:s.structure.metalAtomicNumber,assist:s.structure.assistance.enabled},{type:'metallic-assembly',status:'empty',units:0,z:29,assist:true});
  assert.equal(s.investigation.id,before.investigation.id);assert.equal(s.metal.symbol,'Cu');assert.equal(s.module.active,'explorar');
  assert.deepEqual((await stored(page)).structure,s.structure);assert.ok(await page.locator('.silm-assembly-empty').isVisible());
  assert.equal(await page.evaluate(()=>document.activeElement.id),'silm-assembly-add');
  await shot(page,'02-desktop-estrutura-vazia');return {status:'empty',focus:'silm-assembly-add'};
 });

 await test('0.4-124','Adicionar 1, 2, 5 e 10 unidades',async use=>{
  const page=await use();await investigate(page);await assemble(page);const counts=[];
  for(const n of [1,2,5,10]){while((await units(page)).length<n)await page.click('#silm-assembly-add');
   const list=await units(page);assert.equal(list.length,n);assert.equal(new Set(list.map(u=>u.id)).size,n);assert.ok(overlapFree(list));
   assert.equal(await page.locator('.silm-unit').count(),n);assert.deepEqual((await stored(page)).structure.units,list);
   assert.equal(await page.locator('.silm-unit').nth(n-1).getAttribute('aria-label'),'Unidade de cobre '+n+' de '+n);counts.push(n);}
  assert.equal((await state(page)).structure.status,'assembling');
  const svg=await page.evaluate(()=>({lines:document.querySelectorAll('#silm-assembly-stage line, #silm-assembly-stage path, #silm-assembly-stage polyline').length,shapes:[...document.querySelectorAll('.silm-assembly-collective g > *')].map(e=>e.tagName)}));
  assert.equal(svg.lines,0,'Nenhuma linha M—M');assert.ok(svg.shapes.every(t=>t==='circle'));
  // Desde a 0.6.x os elétrons existem como modelo opcional: sem ativação pelo usuário, nenhum é exibido.
  assert.equal((await state(page)).electrons,null,'Modelo eletrônico não é criado automaticamente');assert.equal(await page.locator('.silm-electron-canvas:visible').count(),0,'Nenhum elétron exibido');
  await page.click('#silm-assembly-add');await page.click('#silm-assembly-undo');
  await shot(page,'03-desktop-montagem-varias-unidades');return {counts,uniqueIds:true,noLines:true,noElectrons:true};
 });

 await test('0.4-125','Movimentar unidade no desktop (arrasto por Pointer Events)',async use=>{
  const page=await use();await investigate(page);await assemble(page,6);const list=await units(page),id=list[2].id;
  await page.click(`.silm-unit[data-unit-id="${id}"]`);assert.equal(await page.getAttribute(`.silm-unit[data-unit-id="${id}"]`,'aria-pressed'),'true');
  await shot(page,'04-desktop-unidade-selecionada');
  const target=await freeSpot(page);await drag(page,await center(page,id),await point(page,target.x,target.y),{shot:'05-desktop-movimentacao-arrasto'});
  const moved=(await units(page)).find(u=>u.id===id);assert.ok(near(moved.position,target),JSON.stringify(moved.position));assert.equal(moved.placement,'manual');
  assert.deepEqual((await stored(page)).structure.units.find(u=>u.id===id).position,moved.position);
  // Alternativa sem arrasto no desktop: clique no destino.
  const second=await page.evaluate(()=>{const A=SILM.assembly,u=SILM.scientificState.structure.units;for(const p of [{x:.2,y:.8},{x:.8,y:.8},{x:.8,y:.2},{x:.2,y:.2}])if(A.isFree(u,p))return p;});
  const p=await point(page,second.x,second.y);await page.mouse.click(p.x,p.y);assert.ok(near((await units(page)).find(u=>u.id===id).position,second));
  return {dragged:moved.position,clickDestination:second};
 });

 await test('0.4-126','Mobile: selecionar e tocar no destino, sem arrasto',async use=>{
  const page=await use({width:390,height:844,mobile:true});await investigate(page);await assemble(page,4);const id=(await units(page))[1].id;
  await page.locator(`.silm-unit[data-unit-id="${id}"]`).tap();assert.equal(await page.getAttribute(`.silm-unit[data-unit-id="${id}"]`,'aria-pressed'),'true');
  await shot(page,'m04-390-unidade-selecionada');
  const target=await freeSpot(page),p=await point(page,target.x,target.y);await page.touchscreen.tap(p.x,p.y);
  const moved=(await units(page)).find(u=>u.id===id);assert.ok(near(moved.position,target),JSON.stringify(moved.position));
  const b=await page.locator(`.silm-unit[data-unit-id="${id}"]`).boundingBox();assert.ok(b.width>=24&&b.height>=24,'Área de toque mínima de 24 px');
  return {moved:moved.position,touchTarget:Math.round(b.width)+'px'};
 });

 await test('0.4-127','Teclado: selecionar e reposicionar com setas',async use=>{
  const page=await use();await investigate(page);await assemble(page,5);const list=await units(page),id=list[0].id;
  const unit=page.locator(`.silm-unit[data-unit-id="${id}"]`);await page.click(`.silm-unit[data-unit-id="${id}"]`);
  const spot=await page.evaluate(()=>{const A=SILM.assembly,u=SILM.scientificState.structure.units;for(const p of [{x:.2,y:.2},{x:.2,y:.8},{x:.7,y:.15}])if(A.isFree(u,p)&&A.isFree(u,{x:p.x+.08,y:p.y}))return p;});
  const p=await point(page,spot.x,spot.y);await page.mouse.click(p.x,p.y);await unit.focus();await page.keyboard.press('Escape');
  assert.equal(await unit.getAttribute('aria-pressed'),'false');const origin=(await units(page)).find(u=>u.id===id).position;
  await page.keyboard.press('Enter');assert.equal(await unit.getAttribute('aria-pressed'),'true');
  for(let i=0;i<3;i++)await page.keyboard.press('ArrowRight');await page.keyboard.press('Shift+ArrowDown');
  const moved=(await units(page)).find(u=>u.id===id).position;
  assert.ok(Math.abs(moved.x-(origin.x+0.06))<1e-6&&Math.abs(moved.y-(origin.y+0.005))<1e-6,JSON.stringify({origin,moved}));
  // Foco fora da área de montagem: setas não movem a unidade selecionada.
  await page.focus('#silm-assembly-add');await page.keyboard.press('ArrowLeft');assert.deepEqual((await units(page)).find(u=>u.id===id).position,moved);
  // As repetições do mesmo gesto formam uma única ação desfazível.
  await page.click('#silm-assembly-undo');assert.deepEqual((await units(page)).find(u=>u.id===id).position,origin);
  await unit.focus();await page.keyboard.press('Escape');assert.equal(await unit.getAttribute('aria-pressed'),'false');
  await page.keyboard.press('ArrowRight');assert.deepEqual((await units(page)).find(u=>u.id===id).position,origin,'Sem seleção, setas só percorrem as unidades');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.unitId),list[1].id);
  return {step:0.02,fineStep:0.005,undoMergesKeyboardGesture:true,globalArrowsIntercepted:false};
 });

 await test('0.4-128','Prevenção de sobreposição',async use=>{
  const page=await use();await investigate(page);await assemble(page,4);const [a,b]=await units(page);
  await drag(page,await center(page,a.id),await center(page,b.id));let list=await units(page),moved=list.find(u=>u.id===a.id);
  assert.ok(overlapFree(list));assert.equal(moved.placement,'assisted');assert.match(await feedback(page),/ajustada/);
  await shot(page,'06-desktop-prevencao-sobreposicao');
  // Toque no destino ao lado de outra unidade (fora da área de toque dela).
  await page.click(`.silm-unit[data-unit-id="${a.id}"]`);const c=list[2].position,p=await point(page,c.x+0.07,c.y);await page.mouse.click(p.x,p.y);
  list=await units(page);assert.ok(overlapFree(list));
  // Sem assistência: destino ocupado é recusado e a posição anterior é mantida.
  await openLeft(page);await page.uncheck('#silm-panel-assist');await closeLeft(page);assert.equal((await state(page)).structure.assistance.enabled,false);
  assert.ok(!(await page.locator('.silm-assist-badge').isVisible()));
  const before=(await units(page)).find(u=>u.id===a.id).position;await drag(page,await center(page,a.id),await center(page,list[3].id));
  assert.deepEqual((await units(page)).find(u=>u.id===a.id).position,before);assert.match(await feedback(page),/Destino ocupado/);
  assert.ok(overlapFree(await units(page)));return {assisted:'ajuste discreto',free:'recusa com feedback'};
 });

 await test('0.4-129','Desfazer adição',async use=>{
  const page=await use();await investigate(page);await assemble(page,3);const ids=(await units(page)).map(u=>u.id);
  await page.click('#silm-assembly-add');assert.equal((await units(page)).length,4);assert.equal(await page.getAttribute('#silm-assembly-undo','title'),'Desfazer: adição da unidade 4');
  await page.click('#silm-assembly-undo');assert.equal(await feedback(page),'Desfeito: adição da unidade 4.');
  assert.deepEqual((await units(page)).map(u=>u.id),ids);assert.equal(await page.locator('.silm-unit').count(),3);assert.equal((await stored(page)).structure.units.length,3);
  return {after:3};
 });

 await test('0.4-130','Desfazer movimento',async use=>{
  const page=await use();await investigate(page);await assemble(page,3);const u=(await units(page))[0];
  const target=await freeSpot(page);await drag(page,await center(page,u.id),await point(page,target.x,target.y));
  assert.ok(near((await units(page))[0].position,target));await page.click('#silm-assembly-undo');
  assert.deepEqual((await units(page))[0].position,u.position);assert.equal(await page.getAttribute('#silm-assembly-undo','aria-disabled'),'false');
  return {restored:u.position};
 });

 await test('0.4-131','Limpar estrutura com 10 unidades mantém o metal',async use=>{
  const page=await use();await investigate(page);await assemble(page,10);const id=(await state(page)).investigation.id;
  await openLeft(page);await page.click('#silm-panel-clear');await dialog(page).waitFor();
  assert.match(await dialog(page).textContent(),/Remover estrutura atual\?[\s\S]*O metal selecionado será mantido/);
  await shot(page,'07-desktop-modal-limpar');await answer(page,'Limpar estrutura');
  const s=await state(page);assert.equal(s.structure,null);assert.equal(s.metal.symbol,'Cu');assert.equal(s.investigation.id,id);assert.equal(s.module.active,'explorar');
  await closeLeft(page);assert.match(await page.locator('.silm-metal-card').textContent(),/ainda não foi montada/);
  assert.equal(await page.locator('.silm-periodic').count(),0,'Não retorna à Tabela');return {structure:null,metal:'Cu'};
 });

 await test('0.4-132','Cancelar limpeza preserva a estrutura',async use=>{
  const page=await use();await investigate(page);await assemble(page,4);const before=(await state(page)).structure;
  await openLeft(page);await page.click('#silm-panel-clear');await answer(page,'Cancelar');
  assert.deepEqual((await state(page)).structure,before);assert.equal(await page.evaluate(()=>document.activeElement.id),'silm-panel-clear','Foco retorna ao controle');
  return {units:4};
 });

 await test('0.4-133','Reset remove a estrutura e preserva o metal',async use=>{
  const page=await use();await investigate(page);await assemble(page,5);const id=(await state(page)).investigation.id;
  await openLeft(page,'Metal');await page.click('#silm-panel-reset');await answer(page,'Resetar investigação');
  const s=await state(page);assert.equal(s.structure,null);assert.equal(s.metal.symbol,'Cu');assert.equal(s.investigation.id,id);return {structure:null,metal:'Cu'};
 });

 await test('0.4-134','Encerrar remove estrutura e investigação',async use=>{
  const page=await use();await investigate(page);await assemble(page,3);
  await openLeft(page,'Metal');await page.click('#silm-panel-close');await answer(page,'Encerrar investigação');
  const s=await state(page);assert.equal(s.investigation,null);assert.equal(s.metal,null);assert.equal(s.structure,null);
  await page.waitForSelector('.silm-periodic');return {returnedTo:'Tabela Periódica'};
 });

 await test('0.4-135','Reload restaura montagem idêntica',async use=>{
  const page=await use();await investigate(page);await assemble(page,5);const u=(await units(page))[0],target=await freeSpot(page);
  await drag(page,await center(page,u.id),await point(page,target.x,target.y));const before=(await state(page)).structure;
  await reload(page);await page.waitForSelector('.silm-unit');const after=(await state(page)).structure;assert.deepEqual(after,before);
  const dom=await page.evaluate(()=>[...document.querySelectorAll('.silm-unit')].map(n=>({id:n.dataset.unitId,x:parseFloat(n.style.left)/100,y:parseFloat(n.style.top)/100})));
  assert.deepEqual(dom.map(u=>u.id),before.units.map(u=>u.id));assert.ok(dom.every((u,i)=>Math.abs(u.x-before.units[i].position.x)<1e-6&&Math.abs(u.y-before.units[i].position.y)<1e-6));
  assert.equal(await page.getAttribute('#silm-assembly-undo','aria-disabled'),'true','Histórico de desfazer não é restaurado');
  await shot(page,'08-desktop-retomada-apos-reload');return {units:after.units.length,identical:true};
 });

 await test('0.4-135b','Retomada direta: recarregar não exibe "Retomar sessão?" nem muda a tela',async use=>{
  const page=await use();await investigate(page);await assemble(page,2);const before=await state(page);
  await page.goto(base+'#/inicio');await page.waitForFunction(()=>document.body.dataset.route==='inicio');await reload(page);
  assert.equal(await page.evaluate(()=>document.body.dataset.route),'inicio','Permanece na tela aberta');assert.deepEqual((await state(page)).structure,before.structure);
  await page.goto(base+'#/laboratorio');await page.waitForSelector('.silm-unit');assert.equal(await page.locator('.silm-unit').count(),2);
  return {dialog:false,route:'inicio'};
 });

 await test('0.4-136','Navegação Laboratório → Manual/Professor/Aprender → Laboratório',async use=>{
  const page=await use();await investigate(page);await assemble(page,4);const before=(await state(page)).structure;
  for(const route of ['manual','professor','aprender','inicio']){await page.goto(base+'#/'+route);await page.waitForFunction(r=>document.body.dataset.route===r,route);
   await page.goto(base+'#/laboratorio');await page.waitForSelector('.silm-unit');assert.deepEqual((await state(page)).structure,before);assert.equal(await page.locator('.silm-unit').count(),4);}
  return {routes:['manual','professor','aprender','inicio']};
 });

 await test('0.4-137','Troca de módulo preserva a montagem',async use=>{
  const page=await use();await investigate(page);await assemble(page,4);const before=(await state(page)).structure;
  await switchModule(page,'medir');assert.deepEqual((await state(page)).structure,before);
  assert.equal(await page.locator('#silm-assembly-add').count(),0,'Medir não edita a montagem');assert.match(await page.locator('.silm-assembly-help').textContent(),/edição da montagem está disponível em Explorar/);
  assert.equal(await page.locator('.silm-unit').count(),4);await shot(page,'10-desktop-medir-somente-leitura');
  await switchModule(page,'calcular');assert.deepEqual((await state(page)).structure,before);assert.equal(await page.locator('#silm-assembly-add').count(),0);
  await switchModule(page,'explorar');assert.deepEqual((await state(page)).structure,before);await page.waitForSelector('#silm-assembly-add');
  await reload(page);assert.equal((await state(page)).module.active,'explorar');return {sequence:'Explorar → Medir → Calcular → Explorar'};
 });

 await test('0.4-138','Troca de metal com estrutura exige confirmação',async use=>{
  const page=await use();await investigate(page);await assemble(page,3);const before=await state(page);
  await openLeft(page,'Metal');await page.click('#silm-select-metal');await page.waitForSelector('.silm-periodic');
  const choose=async()=>{await page.click('.silm-periodic .periodic-element[data-symbol="Fe"]');await page.click('.silm-periodic [id$="-investigate"]');await dialog(page).waitFor();};
  await choose();assert.match(await dialog(page).textContent(),/montagem atual com 3 unidades será removida; as unidades não são convertidas/);
  await answer(page,'Cancelar');let s=await state(page);assert.equal(s.metal.symbol,'Cu');assert.deepEqual(s.structure,before.structure);
  await choose();await answer(page,'Iniciar nova investigação');await page.waitForSelector('#silm-start-assembly');
  s=await state(page);assert.equal(s.metal.symbol,'Fe');assert.equal(s.structure,null);assert.notEqual(s.investigation.id,before.investigation.id);
  return {cancel:'Cu preservado',confirm:'Fe, structure = null'};
 });

 await test('0.4-139','Offline: construir e persistir sem internet',async use=>{
  const page=await use({serviceWorkers:'allow'});await go(page);
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await ready(page);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:20000});
  await page.context().setOffline(true);await reload(page);
  await page.click('.silm-periodic .periodic-element[data-symbol="Al"]');await page.click('.silm-periodic [id$="-investigate"]');await page.waitForSelector('#silm-start-assembly');
  await assemble(page,4);const before=(await state(page)).structure;await reload(page);await page.waitForSelector('.silm-unit');
  assert.deepEqual((await state(page)).structure,before);assert.equal(await page.evaluate(()=>navigator.onLine),false);
  return {metal:'Al',units:4,offline:true};
 });

 for(const width of [320,360,390])await test('0.4-140-'+width,'Mobile '+width+' px',async use=>{
  const page=await use({width,height:740,mobile:true});await investigate(page);await assemble(page,6);
  const m=await page.evaluate(()=>{const s=document.getElementById('silm-assembly-stage').getBoundingClientRect(),add=document.getElementById('silm-assembly-add').getBoundingClientRect();const unitsInside=[...document.querySelectorAll('.silm-unit')].every(n=>{const r=n.getBoundingClientRect(),c={x:r.left+r.width/2,y:r.top+r.height/2};return c.x>=s.left&&c.x<=s.right&&c.y>=s.top&&c.y<=s.bottom;});
   return {overflow:document.documentElement.scrollWidth-innerWidth,stage:Math.round(s.width),stageVisible:s.left>=0&&s.right<=innerWidth,addVisible:add.width>0&&add.bottom<=innerHeight,unitsInside};});
  assert.ok(m.overflow<=0,'Sem rolagem horizontal');assert.ok(m.stageVisible&&m.unitsInside&&m.addVisible,JSON.stringify(m));assert.ok(m.stage>=200);
  const id=(await units(page))[0].id;await page.locator(`.silm-unit[data-unit-id="${id}"]`).tap();const t=await freeSpot(page),p=await point(page,t.x,t.y);await page.touchscreen.tap(p.x,p.y);
  assert.ok(near((await units(page)).find(u=>u.id===id).position,t));
  await shot(page,{320:'m01-320-montagem',360:'m02-360-montagem',390:'m03-390-montagem'}[width]);
  if(width===390){await openLeft(page,'Estrutura');await page.waitForSelector('#controls[role=dialog]');await shot(page,'m05-390-sheet-montagem');
   assert.ok(await page.locator('#silm-panel-add').isVisible());await page.click('#close-left');}
  return m;
 });

 await test('0.4-141','Landscape mobile',async use=>{
  const page=await use({width:844,height:390,mobile:true});await investigate(page);await assemble(page,5);
  const m=await page.evaluate(()=>{const s=document.getElementById('silm-assembly-stage').getBoundingClientRect();return {stage:Math.round(s.width),overflow:document.documentElement.scrollWidth-innerWidth};});
  assert.ok(m.overflow<=0);assert.ok(m.stage>=150,JSON.stringify(m));
  await page.locator('#silm-assembly-stage').scrollIntoViewIfNeeded();const id=(await units(page))[0].id;await page.locator(`.silm-unit[data-unit-id="${id}"]`).tap();
  assert.equal(await page.getAttribute(`.silm-unit[data-unit-id="${id}"]`,'aria-pressed'),'true');await shot(page,'m06-landscape');return m;
 });

 await test('0.4-142','Texto em 150%',async use=>{
  const page=await use();await investigate(page);await assemble(page,4);await page.evaluate(()=>SimCore.accessibility.set('fontScale',1.5));await page.waitForTimeout(200);
  const m=await page.evaluate(()=>{const bar=document.querySelector('.silm-assembly-bar').getBoundingClientRect(),add=document.getElementById('silm-assembly-add').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,addHeight:Math.round(add.height),barInside:bar.right<=innerWidth};});
  assert.ok(m.overflow<=0&&m.barInside&&m.addHeight>=44,JSON.stringify(m));await page.click('#silm-assembly-add');assert.equal((await units(page)).length,5);
  await shot(page,'13-desktop-fonte-150');return m;
 });

 await test('0.4-143','Alto contraste: unidades e seleção distinguíveis',async use=>{
  const page=await use();await investigate(page);await assemble(page,5);await page.evaluate(()=>SimCore.accessibility.set('contrast',true));
  const id=(await units(page))[1].id;await page.click(`.silm-unit[data-unit-id="${id}"]`);
  const css=await page.evaluate(id=>{const sel=document.querySelector(`.silm-unit[data-unit-id="${id}"]`),other=document.querySelector(`.silm-unit:not([data-unit-id="${id}"])`);const core=n=>getComputedStyle(n.querySelector('.silm-unit-core'));
   return {selectedOutline:core(sel).outlineWidth,otherOutline:core(other).outlineStyle,ring:getComputedStyle(sel,'::after').borderStyle,border:core(other).borderTopColor};},id);
  assert.notEqual(css.selectedOutline,'0px');assert.equal(css.ring,'dashed');assert.equal(css.otherOutline,'none');
  await shot(page,'11-desktop-alto-contraste');await page.evaluate(()=>{SimCore.accessibility.set('contrast',false);SimCore.accessibility.set('theme','light');});await shot(page,'12-desktop-tema-claro');
  return css;
 });

 await test('0.4-144','Movimento reduzido sem perda funcional',async use=>{
  const page=await use({reducedMotion:'reduce'});await investigate(page);await assemble(page,3);
  const duration=await page.evaluate(()=>getComputedStyle(document.querySelector('.silm-unit')).transitionDuration);assert.match(duration,/^0s/);
  const u=(await units(page))[0],t=await freeSpot(page);await page.click(`.silm-unit[data-unit-id="${u.id}"]`);const p=await point(page,t.x,t.y);await page.mouse.click(p.x,p.y);
  assert.ok(near((await units(page))[0].position,t));
  const loop=await page.evaluate(()=>new Promise(resolve=>{let n=0;const id=setInterval(()=>n++,10);setTimeout(()=>{clearInterval(id);resolve(SimCore.scopeStats.resources);},300);}));
  return {transition:duration,resources:loop};
 });

 await test('0.4-147','Regressão 0.2.x: Tabela, banco e Área do Professor',async use=>{
  const page=await use();await go(page);await page.waitForSelector('.silm-periodic');
  assert.equal(await page.locator('.silm-periodic .periodic-element').count(),118);assert.equal(await page.locator('.silm-periodic .periodic-element[data-availability=available]').count(),43);
  await page.fill('.silm-periodic input[type=search]','Fe');await page.press('.silm-periodic input[type=search]','Enter');assert.match(await page.locator('.periodic-status').first().textContent(),/Fe|Ferro/);
  await page.click('.silm-periodic .periodic-element[data-symbol="C"]');await page.click('.silm-periodic [id$="-investigate"]').catch(()=>{});
  assert.equal((await state(page)).investigation,null,'Elemento indisponível não cria investigação');assert.match(await page.locator('.silm-periodic').textContent(),/não está disponível|indisponível|fora do escopo/i);
  await page.click('.silm-periodic .periodic-element[data-symbol="Cu"]');await page.click('.silm-periodic [id$="-investigate"]');await assemble(page,2);const before=await state(page);
  await page.goto(base+'#/professor');await page.click('#teacher-periodic-open');await page.waitForSelector('dialog.silm-presentation');
  await page.click('dialog.silm-presentation .periodic-element[data-symbol="Fe"]');
  assert.equal((await state(page)).metal.symbol,'Cu','Seleção de apresentação independente');assert.deepEqual((await state(page)).structure,before.structure);
  await page.click('dialog.silm-presentation [id$="-investigate"]');await dialog(page).waitFor();assert.match(await dialog(page).textContent(),/montagem atual/);await answer(page,'Cancelar');
  assert.deepEqual((await state(page)).structure,before.structure);return {elements:118,available:43,teacher:'presentationSelection independente'};
 });

 await test('0.4-148','Regressão 0.3.x: estado corrompido e scientificState único',async use=>{
  const page=await use();await investigate(page);await assemble(page,2);const s=await state(page);s.structure.units[1].position={...s.structure.units[0].position};
  const broken=await use({seed:s});await go(broken);await broken.waitForSelector('.silm-periodic');
  assert.equal((await state(broken)).investigation,null);assert.equal((await stored(broken)).schemaVersion,await broken.evaluate(()=>SILM.scientificSchemaVersion));
  assert.match(await broken.locator('#toast-message').textContent(),/não pôde ser restaurada/);
  const keys=await broken.evaluate(()=>Object.keys(localStorage).filter(k=>/scientific|structure|route|mission/i.test(k)));
  assert.deepEqual(keys.filter(k=>k.includes('scientific')),[KEY]);assert.ok(!keys.some(k=>/routeStructure|missionStructure/.test(k)));
  return {recovered:true,keys};
 });

 await test('0.4-A11Y','Acessibilidade automatizada (axe-core) da montagem',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await investigate(page);await assemble(page,5);await page.click('.silm-unit >> nth=1');
  await openLeft(page);const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#workspace').analyze();
  await shot(page,'09-desktop-paineis');
  const violations=scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}));assert.deepEqual(violations,[],JSON.stringify(violations));
  const names=await page.evaluate(()=>[...document.querySelectorAll('.silm-unit')].map(n=>n.getAttribute('aria-label')));assert.equal(names[2],'Unidade de cobre 3 de 5');
  return {violations:0,passes:scan.passes.length,names};
 });

}};
