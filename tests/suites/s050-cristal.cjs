'use strict';
/* Série 0.5.x — estruturas cristalinas, célula, rede e vizinhança (itens 121–143 do prompt 0.5.x),
   mais a paridade de workspace com o SIAB 1.0.0 (Montagem / Ver / Dados, Histórico). */
module.exports={series:'0.5',async run(kit,{screenshots=false}={}){
 const {assert,state,stored,units,go,investigate,assemble,reload,dialog,answer,openLeft,closeLeft,openRight,closeRight,switchModule,organize,crystal}=kit;
 const shot=screenshots?kit.shot:async()=>{},test=kit.test,base=kit.base;
 const rep=async page=>(await state(page)).structure.crystallography.representation;
 const science=s=>({units:s.units,type:s.crystallography.structureType,ref:s.referenceStructureId,updatedAt:s.updatedAt});

 await test('0.5-121','Migração da 0.4.x (schema 3) sem perda da montagem',async use=>{
  const page=await use();await investigate(page);await assemble(page,4);const s4=await state(page);
  const v040=JSON.parse(JSON.stringify(s4));v040.schemaVersion=3;v040.structure.modelVersion=1;delete v040.structure.mode;delete v040.structure.crystallography;
  const migrated=await use({seed:v040});await go(migrated);await migrated.waitForSelector('.silm-unit');const s=await state(migrated);
  assert.equal(s.schemaVersion,await migrated.evaluate(()=>SILM.scientificSchemaVersion));assert.equal(s.structure.mode,'free');assert.deepEqual(s.structure.units,s4.structure.units);assert.equal(s.structure.status,'assembling');
  assert.equal(await migrated.locator('.silm-unit').count(),4);return {from:3,mode:'free',units:4};
 });

 await test('0.5-122','Cu: montagem livre → Organizar estrutura → CFC do banco',async use=>{
  const page=await use();await investigate(page);await assemble(page,5);const free=await units(page);
  await page.click('#silm-assembly-organize');await dialog(page).waitFor();const text=await dialog(page).textContent();
  assert.match(text,/As unidades serão organizadas segundo a estrutura cristalina de referência deste metal/);assert.match(text,/CFC \(FCC\)/);assert.match(text,/completará 9 unidades/);
  await shot(page,'01-cfc-modal-organizar');await answer(page,'Organizar estrutura');await page.waitForSelector('.silm-crystal');
  const s=(await state(page)).structure,db=await page.evaluate(()=>{const e=SILM.data.get(29);return {type:SILM.data.structure(e).type,ref:e.referenceStructure};});
  assert.equal(db.type,'CFC');assert.equal(s.crystallography.structureType,'FCC');assert.equal(s.referenceStructureId,db.ref);assert.equal(s.units.length,14);assert.equal(s.crystallography.coordination,12);
  for(const u of free){const now=s.units.find(x=>x.id===u.id);assert.ok(now,'Unidade reaproveitada');assert.equal(now.placement,u.placement,'Autoria preservada');}
  assert.equal(s.units.filter(u=>u.placement==='crystallographic').length,9);assert.equal((await state(page)).metal.symbol,'Cu');
  assert.equal(await page.locator('.silm-crystal .silm-unit').count(),14);
  const roles=await page.evaluate(()=>[...document.querySelectorAll('.silm-crystal-unit')].map(n=>n.dataset.role).sort().join());assert.equal(roles,[...Array(6).fill('face'),...Array(8).fill('corner')].sort().join(),'Vértices + centros das faces');
  const lines=await page.evaluate(()=>({all:document.querySelectorAll('#silm-assembly-stage line').length,cell:document.querySelectorAll('.silm-cell-edges line').length}));assert.equal(lines.all,lines.cell,'Só arestas da célula');assert.equal(lines.cell,12);
  await shot(page,'02-cfc-celula');return {structure:'CFC',units:14,reused:5,completed:9};
 });

 await test('0.5-123','Fe: estrutura definida pela referência registrada (não pelo símbolo)',async use=>{
  const page=await use();await crystal(page,'Fe',3);const s=(await state(page)).structure;
  const expected=await page.evaluate(()=>{const e=SILM.data.get(26),el=SILM.crystal.eligibility(e);return {db:SILM.data.structure(e).type,type:el.structureType,cond:SILM.data.structure(e).conditions.temperature.display};});
  assert.equal(s.crystallography.structureType,expected.type);assert.equal(expected.db,'CCC');assert.equal(s.units.length,9);assert.equal(s.crystallography.coordination,8);
  const roles=await page.evaluate(()=>[...document.querySelectorAll('.silm-crystal-unit')].map(n=>n.dataset.role));assert.equal(roles.filter(r=>r==='corner').length,8);assert.equal(roles.filter(r=>r==='body').length,1);
  await shot(page,'03-ccc-celula');return {structure:'CCC',condition:expected.cond};
 });

 await test('0.5-124','Mg: HC quando corresponde ao registro homologado',async use=>{
  const page=await use();await crystal(page,'Mg',6);const s=(await state(page)).structure;assert.equal(s.crystallography.structureType,'HCP');assert.equal(s.units.length,17);
  const layers=await page.evaluate(()=>[...document.querySelectorAll('.silm-crystal-unit')].reduce((a,n)=>{a[n.dataset.layer]=(a[n.dataset.layer]||0)+1;return a;},{}));assert.deepEqual(layers,{A:14,B:3});
  assert.equal(await page.locator('.silm-cell-edges line').count(),18,'Prisma hexagonal: 2 hexágonos + 6 arestas verticais');assert.equal(await page.locator('.silm-cell-planes polygon').count(),2);
  await shot(page,'04-hc-celula');return {structure:'HC',layers};
 });

 await test('0.5-125','Metal sem estrutura suportada (Mn): investigação e montagem seguem; motivo informado',async use=>{
  const page=await use();await investigate(page,'Mn');assert.match(await page.locator('#silm-card-crystal').textContent(),/Cristalografia indisponível/);
  await assemble(page,3);assert.equal((await units(page)).length,3);
  assert.equal(await page.getAttribute('#silm-assembly-organize','aria-disabled'),'true');assert.match(await page.locator('#silm-assembly-crystal-reason').textContent(),/registrada, mas ainda não disponível para visualização no SILM/);
  await page.click('#silm-assembly-organize',{force:true});assert.equal((await state(page)).structure.mode,'free');assert.equal(await page.locator('dialog.app-dialog').count(),0);
  await openLeft(page,'Estrutura');assert.equal(await page.getAttribute('#silm-panel-organize','aria-disabled'),'true');assert.match(await page.locator('#silm-panel-crystal-reason').textContent(),/não disponível para visualização/);
  await openLeft(page,'Resumo');assert.match(await page.locator('#dock-left-content').textContent(),/Indisponível/);await closeLeft(page);
  await shot(page,'05-metal-sem-suporte');return {metal:'Mn',reason:'CRYSTAL_STRUCTURE_UNSUPPORTED'};
 });

 await test('0.5-126','Mostrar/ocultar célula repetidamente sem alterar o estado científico',async use=>{
  const page=await use();await crystal(page,'Cu',4);const before=science((await state(page)).structure);
  await openLeft(page,'Estrutura');
  for(let i=0;i<5;i++){await page.click('#silm-panel-cell');const r=await rep(page);assert.equal(r.unitCell,i%2===1);assert.equal(await page.getAttribute('#silm-panel-cell','aria-pressed'),String(r.unitCell));
   assert.equal(await page.locator('#silm-crystal-cell-status').textContent(),'Célula unitária '+(r.unitCell?'visível':'oculta'));assert.equal(await page.locator('.silm-cell-edges line').count(),r.unitCell?12:0);}
  assert.deepEqual(science((await state(page)).structure),before);
  assert.match(await page.getAttribute('#silm-assembly-stage','aria-label'),/célula unitária oculta/);await closeLeft(page);await shot(page,'06-cfc-celula-oculta');
  return {toggles:5,scienceChanged:false};
 });

 await test('0.5-127','Alternar célula ↔ rede sem erro; rede extensa eficiente',async use=>{
  const page=await use();await crystal(page,'Cu',4);const before=science((await state(page)).structure);
  for(let i=0;i<4;i++){await page.click('#silm-crystal-view-lattice');assert.equal((await rep(page)).view,'lattice');await page.click('#silm-crystal-view-cell');assert.equal((await rep(page)).view,'cell');}
  await page.click('#silm-crystal-view-lattice');const m=await page.evaluate(()=>({lattice:document.querySelectorAll('.silm-lattice circle').length,dom:document.querySelectorAll('#silm-assembly-stage *').length}));
  assert.ok(m.lattice>60,'Rede comunica continuidade');assert.ok(m.dom<600,'Sem milhares de nós');assert.deepEqual(science((await state(page)).structure),before);
  await shot(page,'07-cfc-rede-extensa');return m;
 });

 await test('0.5-128','Vizinhança: selecionar unidade e destacar vizinhos (sem ligações)',async use=>{
  const page=await use();await crystal(page,'Cu',4);
  const central=await page.evaluate(()=>{const s=SILM.scientificState.structure,g=SILM.crystal.geometry(SILM.data.get(29));return s.units.find(u=>SILM.crystal.key(u.site)===g.cell[0].key).id;});
  await page.click(`.silm-unit[data-unit-id="${central}"]`);assert.equal((await rep(page)).selectedUnitId,central);assert.match(await page.getAttribute(`.silm-unit[data-unit-id="${central}"]`,'aria-label'),/centro de face/);
  await page.click('#silm-crystal-neighbors');assert.equal((await rep(page)).neighbors,true);
  const count=await page.evaluate(()=>document.querySelectorAll('.silm-crystal-unit[data-neighbor]').length+document.querySelectorAll('.silm-neighbor-ghosts circle').length);assert.equal(count,12);
  assert.match(await page.locator('#silm-assembly-feedback').textContent(),/12 vizinhos imediatos destacados/);
  const style=await page.evaluate(()=>getComputedStyle(document.querySelector('.silm-crystal-unit[data-neighbor]'),'::before').borderStyle);assert.equal(style,'dotted','Destaque não depende só de cor');
  assert.equal(await page.locator('#silm-assembly-stage line').count(),12,'Vizinhança sem barras de ligação');
  const inside=async pg=>pg.evaluate(()=>{const st=document.querySelector('#silm-assembly-stage').getBoundingClientRect(),els=[...document.querySelectorAll('.silm-crystal-unit[data-neighbor],.silm-neighbor-ghosts circle')];
   return els.every(e=>{const r=e.getBoundingClientRect();return r.left>=st.left-1&&r.top>=st.top-1&&r.right<=st.right+1&&r.bottom<=st.bottom+1;});});
  assert.ok(await inside(page),'Todos os vizinhos inteiros dentro da cena');
  await shot(page,'08-cfc-vizinhos');
  const bcc=await use();await crystal(bcc,'Fe',2);await bcc.click('#silm-crystal-neighbors');const n=await bcc.evaluate(()=>document.querySelectorAll('.silm-crystal-unit[data-neighbor]').length+document.querySelectorAll('.silm-neighbor-ghosts circle').length);assert.equal(n,8);assert.ok(await inside(bcc),'CCC: vizinhos dentro da cena');await shot(bcc,'09-ccc-vizinhos');
  const hcp=await use();await crystal(hcp,'Mg',2);await hcp.click('#silm-crystal-neighbors');const k=await hcp.evaluate(()=>document.querySelectorAll('.silm-crystal-unit[data-neighbor]').length+document.querySelectorAll('.silm-neighbor-ghosts circle').length);assert.equal(k,12);assert.ok(await inside(hcp),'HC: vizinhos dentro da cena');await shot(hcp,'10-hc-vizinhos');
  return {CFC:12,CCC:8,HC:12};
 });

 await test('0.5-129','Voltar à montagem livre: metal permanece e posições anteriores voltam',async use=>{
  const page=await use();await investigate(page);await assemble(page,5);const free=(await state(page)).structure.units;await organize(page);const id=(await state(page)).investigation.id;
  await openLeft(page,'Estrutura');await page.click('#silm-panel-free');await page.waitForSelector('#silm-assembly-add');
  const s=await state(page);assert.equal(s.structure.mode,'free');assert.deepEqual(s.structure.units,free);assert.equal(s.metal.symbol,'Cu');assert.equal(s.investigation.id,id);
  assert.equal(await page.locator('.silm-unit').count(),5);return {mode:'free',units:5};
 });

 await test('0.5-130','Retornar ao cristalino: estado volta corretamente',async use=>{
  const page=await use();await crystal(page,'Cu',5);const first=(await state(page)).structure.units.filter(u=>u.placement!=='crystallographic').map(u=>[u.id,JSON.stringify(u.site)]);
  await openLeft(page,'Estrutura');await page.click('#silm-panel-free');await closeLeft(page);await page.waitForSelector('#silm-assembly-organize');await organize(page);
  const again=(await state(page)).structure.units.filter(u=>u.placement!=='crystallographic').map(u=>[u.id,JSON.stringify(u.site)]);assert.deepEqual(again,first);return {deterministic:true};
 });

 await test('0.5-131','Reload restaura a estrutura cristalina e a representação',async use=>{
  const page=await use();await crystal(page,'Mg',4);await page.click('#silm-crystal-view-lattice');await page.click('#silm-crystal-neighbors');const before=(await state(page)).structure;
  await reload(page);await page.waitForSelector('.silm-crystal');const after=(await state(page)).structure;assert.deepEqual(after,before);
  assert.equal(await page.getAttribute('#silm-crystal-view-lattice','aria-pressed'),'true');assert.equal(await page.locator('.silm-crystal-unit[data-neighbor]').count()+await page.locator('.silm-neighbor-ghosts circle').count(),12);
  await shot(page,'11-hc-rede-apos-reload');return {restored:true};
 });

 await test('0.5-132','Limpar estrutura cristalina: structure = null, metal permanece',async use=>{
  const page=await use();await crystal(page,'Cu',3);await openLeft(page,'Estrutura');await page.click('#silm-panel-clear');await answer(page,'Limpar estrutura');
  const s=await state(page);assert.equal(s.structure,null);assert.equal(s.metal.symbol,'Cu');await closeLeft(page);await page.waitForSelector('#silm-start-assembly');return {structure:null};
 });

 await test('0.5-133','Troca de metal nunca reaproveita a estrutura anterior',async use=>{
  const page=await use();await crystal(page,'Cu',3);await openLeft(page,'Metal');await page.click('#silm-select-metal');await page.waitForSelector('.silm-periodic');
  await page.click('.silm-periodic .periodic-element[data-symbol="Fe"]');await page.click('.silm-periodic [id$="-investigate"]');await dialog(page).waitFor();
  assert.match(await dialog(page).textContent(),/estrutura cristalina atual com 14 unidades será removida/);await answer(page,'Iniciar nova investigação');
  const s=await state(page);assert.equal(s.metal.symbol,'Fe');assert.equal(s.structure,null);return {metal:'Fe',structure:null};
 });

 await test('0.5-134','Offline: organizar e restaurar a estrutura sem rede',async use=>{
  const page=await use({serviceWorkers:'allow'});await go(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await kit.ready(page);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:20000});await page.context().setOffline(true);await reload(page);
  await page.click('.silm-periodic .periodic-element[data-symbol="Ag"]');await page.click('.silm-periodic [id$="-investigate"]');await page.waitForSelector('#silm-start-assembly');
  await assemble(page,3);await organize(page);const before=(await state(page)).structure;await reload(page);await page.waitForSelector('.silm-crystal');
  assert.deepEqual((await state(page)).structure,before);assert.equal(await page.evaluate(()=>navigator.onLine),false);return {metal:'Ag',structure:'CFC',offline:true};
 });

 for(const [w,h,label] of [[320,740,'320'],[360,760,'360'],[390,844,'390'],[844,390,'landscape'],[768,1024,'tablet']])await test('0.5-135-'+label,'Mobile/tablet '+label,async use=>{
  const page=await use({width:w,height:h,mobile:w<900});await crystal(page,'Cu',4);
  const m=await page.evaluate(()=>{const s=document.getElementById('silm-assembly-stage').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,stage:Math.round(s.width),visible:s.left>=0&&s.right<=innerWidth};});
  assert.ok(m.overflow<=0&&m.visible,JSON.stringify(m));assert.ok(m.stage>=(label==='landscape'?150:200),JSON.stringify(m));
  const id=(await units(page))[0].id;if(w<900)await page.locator(`.silm-unit[data-unit-id="${id}"]`).tap();else await page.click(`.silm-unit[data-unit-id="${id}"]`);assert.equal((await rep(page)).selectedUnitId,id);
  await shot(page,'m-'+label+'-cfc');if(label==='390'){await openRight(page,'ver');await page.waitForSelector('#context-panel[role=dialog]');await shot(page,'m-390-ver-observar');await closeRight(page);}
  return m;
 });

 await test('0.5-136','Texto em 150% não cobre a rede',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.evaluate(()=>SimCore.accessibility.set('fontScale',1.5));await page.waitForTimeout(250);
  const m=await page.evaluate(()=>{const s=document.getElementById('silm-assembly-stage').getBoundingClientRect(),bar=document.querySelector('.silm-assembly-bar').getBoundingClientRect();return {stage:Math.round(s.width),overlap:bar.bottom>s.top+4,overflow:document.documentElement.scrollWidth-innerWidth};});
  assert.ok(m.stage>=240&&!m.overlap&&m.overflow<=0,JSON.stringify(m));await page.click('#silm-crystal-view-lattice');assert.equal((await rep(page)).view,'lattice');await shot(page,'12-fonte-150');return m;
 });

 await test('0.5-137','Alto contraste: célula, unidades e vizinhos distinguíveis',async use=>{
  const page=await use();await crystal(page,'Fe',3);await page.evaluate(()=>SimCore.accessibility.set('contrast',true));await page.click('#silm-crystal-neighbors');
  const css=await page.evaluate(()=>({edge:getComputedStyle(document.querySelector('.silm-cell-edges line')).stroke,neighbor:getComputedStyle(document.querySelector('.silm-crystal-unit[data-neighbor]'),'::before').borderStyle,core:getComputedStyle(document.querySelector('.silm-crystal-unit .silm-unit-core')).borderTopWidth}));
  assert.equal(css.neighbor,'dotted');assert.notEqual(css.core,'0px');await shot(page,'13-alto-contraste');return css;
 });

 await test('0.5-138','Movimento reduzido: organização instantânea e funcional',async use=>{
  const page=await use({reducedMotion:'reduce'});await investigate(page);await assemble(page,3);await organize(page);
  const m=await page.evaluate(()=>({organizing:document.querySelector('.silm-crystal').hasAttribute('data-organizing'),animating:document.querySelectorAll('[data-animating],[data-appearing]').length,transition:getComputedStyle(document.querySelector('.silm-crystal-unit')).transitionDuration}));
  assert.equal(m.organizing,false);assert.equal(m.animating,0);assert.equal((await state(page)).structure.mode,'crystalline');return m;
 });

 await test('0.5-PAR','Paridade SIAB: Montagem / Ver / Dados e Histórico',async use=>{
  const page=await use();await crystal(page,'Cu',3);
  const labels=await page.evaluate(()=>['workspace-left','workspace-right','workspace-right-alt'].map(id=>document.getElementById(id).textContent));assert.deepEqual(labels,['Montagem','Ver','Dados']);
  await openLeft(page,'Resumo');const tabs=await page.locator('#dock-left-tabs button').allTextContents();// Paridade 0.5: Resumo, Metal, Estrutura … Módulo, nesta ordem; séries seguintes podem inserir abas antes de Módulo (0.7: Propriedades).
  assert.deepEqual(tabs.slice(0,3),['Resumo','Metal','Estrutura']);assert.equal(tabs.at(-1),'Módulo');await shot(page,'14-montagem-resumo');await closeLeft(page);
  await openRight(page,'ver');assert.match(await page.locator('#dock-right-content').textContent(),/Número de coordenação\s*12[\s\S]*Resultado do modelo cristalográfico/);assert.match(await page.locator('#dock-right-content').textContent(),/Estrutura de referência\s*CFC \(FCC\)[\s\S]*Dado tabelado/);
  assert.equal(await page.getAttribute('#workspace-right','aria-expanded'),'true');await shot(page,'15-ver-observar');
  await openRight(page,'dados','Histórico');assert.equal(await page.getAttribute('#workspace-right-alt','aria-expanded'),'true');
  const history=await page.locator('#silm-history li').allTextContents();assert.ok(history.some(t=>/Investigação iniciada com Cobre/.test(t))&&history.some(t=>/Estrutura organizada como CFC/.test(t)),JSON.stringify(history));
  await shot(page,'16-dados-historico');await openRight(page,'ver');assert.equal(await page.evaluate(()=>SimCore.workspace.source),'ver');
  return {launchers:labels,history:history.length};
 });

 await test('0.5-KBD','Teclado na estrutura cristalina: percorrer, selecionar e soltar',async use=>{
  const page=await use();await crystal(page,'Fe',2);const list=await units(page);
  await page.locator(`.silm-unit[data-unit-id="${list[0].id}"]`).focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.dataset.unitId),list[1].id);
  await page.keyboard.press('Enter');assert.equal((await rep(page)).selectedUnitId,list[1].id);await page.keyboard.press('Escape');assert.equal((await rep(page)).selectedUnitId,null);
  const sites=(await state(page)).structure.units.map(u=>JSON.stringify(u.site));await page.keyboard.press('ArrowLeft');assert.deepEqual((await state(page)).structure.units.map(u=>JSON.stringify(u.site)),sites,'Setas não movem unidades cristalinas');
  return {ok:true};
 });

 await test('0.5-A11Y','Acessibilidade automatizada (axe-core) da estrutura cristalina',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await crystal(page,'Mg',3);await page.click('#silm-crystal-neighbors');await openRight(page,'ver');
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#workspace').analyze();
  const violations=scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}));assert.deepEqual(violations,[],JSON.stringify(violations));
  assert.match(await page.getAttribute('#silm-assembly-stage','aria-label'),/Estrutura cristalina hexagonal compacta de magnésio/);return {violations:0};
 });
}};
