'use strict';
/* Série 0.9.x — módulo Medir: instrumentos, grandezas e registro de medições (§20 do prompt 0.9.x). */
module.exports={series:'0.9',async run(kit,{screenshots=false}={}){
 const {assert,state,go,investigate,assemble,reload,answer,openLeft,closeLeft,openRight,closeRight,switchModule,crystal,organize}=kit;
 const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const measurements=async page=>(await state(page)).measurements;
 /* Ids das unidades por papel científico (a partir da geometria do banco, não da tela). */
 const pick=(page,spec)=>page.evaluate(spec=>{const s=SILM.scientificState.structure,g=SILM.crystal.geometry(SILM.data.get(SILM.scientificState.metal.atomicNumber)),K=SILM.crystal.key;
  const byKey=new Map(s.units.map(u=>[K(u.site),u.id])),corner=g.cell.find(c=>c.frac.every(v=>Math.abs(v)<1e-9))||g.cell[0];
  const near=g.neighbors(corner).list.filter(n=>byKey.has(n.key));
  const out={corner:byKey.get(corner.key),nn:near.map(n=>byKey.get(n.key))};
  const same=g.cell.filter(c=>c.basis===corner.basis&&c.key!==corner.key).map(c=>({c,d:Math.hypot(...c.cart.map((v,i)=>v-corner.cart[i]))})).sort((a,b)=>a.d-b.d);
  const A=Math.hypot(...g.vectors[0]),Cz=Math.hypot(...g.vectors[2]);out.edge=byKey.get(same[0].c.key);out.diagonal=byKey.get(same.find(x=>Math.abs(x.d-A)>1e-3&&Math.abs(x.d-Cz)>1e-3).c.key);   // par que não é aresta (nem a, nem c)
  if(g.model.system==='hexagonal'){const up=g.cell.find(c=>c.basis===corner.basis&&Math.abs(c.cart[0]-corner.cart[0])<1e-6&&Math.abs(c.cart[1]-corner.cart[1])<1e-6&&c.cart[2]>corner.cart[2]+1e-6);out.up=byKey.get(up.key);}
  return out;},spec);
 const tool=async(page,id)=>{await openRight(page,'ver','Medir');await page.click('#silm-tool-'+id);await closeRight(page);};
 const unit=(page,id)=>page.click(`.silm-crystal-unit[data-unit-id="${id}"]`);
 const status=page=>page.locator('#silm-assembly-feedback').textContent();
 const toMedir=async page=>{await switchModule(page,'medir');await page.waitForSelector('.silm-crystal');};

 await test('0.9-MIG','Migração da 0.8.x (schema 6) sem perda',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.click('#silm-electrons-toggle');const s=await state(page),v=JSON.parse(JSON.stringify(s));v.schemaVersion=6;
  const m=await use({seed:v});await go(m);await m.waitForSelector('.silm-crystal');const t=await state(m);
  // Migra até o schema atual (7 na 0.9.x; 8 desde a 0.10.0), sem perder estrutura nem elétrons e sem inventar medições.
  const current=await m.evaluate(()=>SILM.scientificSchemaVersion);assert.ok(current>=7);
  assert.equal(t.schemaVersion,current);assert.deepEqual(t.structure,s.structure);assert.deepEqual(t.electrons,s.electrons);assert.deepEqual(t.measurements,[]);return {from:6,to:current};
 });

 await test('0.9-FREE','Montagem livre: sem escala física, sem medida absoluta',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,4);await switchModule(page,'medir');await openRight(page,'ver','Medir');
  for(const id of ['distance','angle','latticeParameter','coordination'])assert.equal(await page.getAttribute('#silm-tool-'+id,'aria-disabled'),'true',id);
  assert.match(await page.locator('#silm-measure-status').textContent(),/montagem livre não tem escala física/i);await page.click('#silm-tool-distance',{force:true});
  assert.deepEqual(await measurements(page),[]);await closeRight(page);return {free:'sem medidas absolutas'};
 });

 await test('0.9-DIST','CFC (Cu): distância entre vizinhos = medida do modelo, com cota (não ligação)',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'distance');
  await unit(page,ids.corner);assert.match(await status(page),/Ponto A selecionado\. Selecione o ponto B\./);await unit(page,ids.nn[0]);
  const m=(await measurements(page))[0];assert.equal(m.type,'distance');assert.equal(m.unit,'Å');assert.equal(m.value,2.556);assert.equal(m.source.kind,'MODEL_MEASUREMENT');assert.equal(m.points.length,2);assert.ok(m.points.every(p=>p.site&&p.unitId));
  assert.match(await status(page),/Distância medida: 2,556 ångströms/);assert.equal(await page.locator('.silm-dimension-line').count(),1);
  assert.deepEqual(await page.locator('.silm-measure-marker text').allTextContents(),['A','B']);
  await openRight(page,'ver','Medir');assert.match(await page.locator('#silm-measure-result').textContent(),/Medida do modelo/);assert.ok(!/±/.test(await page.locator('#silm-measure-result').textContent()),'Sem ± (resolução ≠ incerteza)');
  await shot(page,'d01-distancia-cfc');await closeRight(page);return {value:m.value,unit:m.unit};
 });

 await test('0.9-ZOOM','Zoom e redimensionamento não alteram a dimensão científica',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);
  const px=async()=>page.evaluate(({a,b})=>{const r=id=>document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`).getBoundingClientRect();const A=r(a),B=r(b);return Math.hypot(A.x-B.x,A.y-B.y);},{a:ids.corner,b:ids.edge});
  await tool(page,'distance');await unit(page,ids.corner);await unit(page,ids.edge);const p1=await px();
  await page.setViewportSize({width:900,height:620});await page.evaluate(()=>SimCore.accessibility.set('fontScale',1.3));await page.waitForTimeout(400);
  await tool(page,'distance');await unit(page,ids.corner);await unit(page,ids.edge);const p2=await px(),list=await measurements(page);
  assert.ok(Math.abs(p1-p2)>5,'A escala da tela mudou: '+p1.toFixed(1)+' → '+p2.toFixed(1));assert.equal(list[0].value,list[1].value);assert.equal(list[0].value,3.615);
  return {screen:[+p1.toFixed(1),+p2.toFixed(1)],value:list[0].value};
 });

 await test('0.9-CCC','CCC (Fe): vizinhos e parâmetro de rede conforme o banco',async use=>{
  const page=await use();await crystal(page,'Fe',3);await toMedir(page);const ids=await pick(page);await tool(page,'distance');await unit(page,ids.corner);await unit(page,ids.nn[0]);
  await tool(page,'latticeParameter');await unit(page,ids.corner);await unit(page,ids.edge);const [d,a]=await measurements(page);
  assert.equal(d.value,2.482);assert.equal(a.value,2.865);assert.equal(a.parameter,'a');
  await openRight(page,'ver','Medir');assert.match(await page.locator('#silm-measure-result').textContent(),/Referência[\s\S]*Dado tabelado[\s\S]*2,8654/);await closeRight(page);return {nn:d.value,a:a.value};
 });

 await test('0.9-HC','HC (Mg): parâmetros a e c como ação de medição; aresta inválida recusada',async use=>{
  const page=await use();await crystal(page,'Mg',3);await toMedir(page);const ids=await pick(page);await tool(page,'latticeParameter');
  await unit(page,ids.corner);await unit(page,ids.edge);await unit(page,ids.corner);await unit(page,ids.up);const [a,c]=await measurements(page);
  assert.equal(a.parameter,'a');assert.equal(a.value,3.209);assert.equal(c.parameter,'c');assert.equal(c.value,5.21);
  await unit(page,ids.corner);await unit(page,ids.diagonal);assert.equal((await measurements(page)).length,2,'Pontos fora de uma aresta: sem registro');assert.match(await status(page),/aresta da célula/);
  await shot(page,'d02-parametro-c-hc');return {a:a.value,c:c.value};
 });

 await test('0.9-ANGLE','Ângulo das coordenadas científicas, não da projeção',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'angle');
  await unit(page,ids.nn[0]);await unit(page,ids.corner);assert.match(await status(page),/vértice B selecionado/i);await unit(page,ids.nn[1]);
  const m=(await measurements(page))[0],expected=await page.evaluate(({a,b,c})=>{const s=SILM.scientificState.structure,g=SILM.crystal.geometry(SILM.data.get(29)),site=id=>g.site(s.units.find(u=>u.id===id).site).cart;const A=site(a),B=site(b),C=site(c),u=A.map((v,i)=>v-B[i]),v=C.map((x,i)=>x-B[i]);return Math.acos(u.reduce((s,x,i)=>s+x*v[i],0)/(Math.hypot(...u)*Math.hypot(...v)))*180/Math.PI;},{a:ids.nn[0],b:ids.corner,c:ids.nn[1]});
  const screen=await page.evaluate(({a,b,c})=>{const r=id=>{const x=document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`).getBoundingClientRect();return [x.x+x.width/2,x.y+x.height/2];};const A=r(a),B=r(b),C=r(c),u=[A[0]-B[0],A[1]-B[1]],v=[C[0]-B[0],C[1]-B[1]];return Math.acos((u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))*180/Math.PI;},{a:ids.nn[0],b:ids.corner,c:ids.nn[1]});
  assert.equal(m.value,+expected.toFixed(1));assert.ok(Math.abs(screen-m.value)>2,'Ângulo aparente da tela difere: '+screen.toFixed(1));assert.equal(m.unit,'°');
  assert.equal(await page.locator('.silm-angle-arc').count(),1);await shot(page,'d03-angulo');return {value:m.value,screen:+screen.toFixed(1)};
 });

 await test('0.9-COORD','Vizinhança: contagem visual = número de coordenação do modelo',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'coordination');await unit(page,ids.corner);
  const m=(await measurements(page))[0],shown=await page.evaluate(()=>document.querySelectorAll('.silm-crystal-unit[data-neighbor]').length+document.querySelectorAll('.silm-neighbor-ghosts circle').length);
  assert.equal(m.value,12);assert.equal(shown,12);assert.equal(m.unit,'1');assert.equal(await page.locator('#silm-assembly-stage .silm-dimension-line').count(),0,'Sem linhas M—M');
  const fe=await use();await crystal(fe,'Fe',3);await toMedir(fe);const f=await pick(fe);await tool(fe,'coordination');await unit(fe,f.corner);assert.equal((await measurements(fe))[0].value,8);
  await shot(page,'d04-coordenacao');return {Cu:12,Fe:8};
 });

 await test('0.9-UNITS','Unidades Å, pm e nm: conversão exata; valor canônico em Å',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'distance');await unit(page,ids.corner);await unit(page,ids.nn[0]);
  await openRight(page,'ver','Medir');await page.click('#silm-unit-pm');assert.match(await page.locator('#silm-measure-result').textContent(),/255,6 pm/);
  await page.click('#silm-unit-nm');assert.match(await page.locator('#silm-measure-result').textContent(),/0,2556 nm/);assert.equal((await measurements(page))[0].value,2.556);
  await page.click('#silm-unit-A');await closeRight(page);return {A:2.556,pm:255.6,nm:0.2556};
 });

 await test('0.9-HIST','Painel Medições: rever, remover e limpar (sem limpar a estrutura)',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'distance');await unit(page,ids.corner);await unit(page,ids.nn[0]);await unit(page,ids.corner);await unit(page,ids.edge);
  await tool(page,'coordination');await unit(page,ids.corner);const list=await measurements(page);assert.equal(list.length,3);
  await openRight(page,'dados','Medições');assert.equal(await page.locator('#silm-measurements li').count(),3);await shot(page,'d05-painel-medicoes');
  await page.click('#silm-meas-review-'+list[1].id);await closeRight(page);assert.equal(await page.locator('.silm-dimension-line').count(),1,'Rever mostra a medição na cena');
  await openRight(page,'dados','Medições');await page.click('#silm-meas-remove-'+list[0].id);assert.equal((await measurements(page)).length,2);
  const structure=(await state(page)).structure;await page.click('#silm-measurements-clear');await answer(page,'Limpar medições');
  assert.deepEqual(await measurements(page),[]);assert.deepEqual((await state(page)).structure,structure,'Limpar medições não limpa a estrutura');await closeRight(page);return {cleared:true};
 });

 await test('0.9-CONTEXT','Medição de estado anterior da estrutura é identificada, não alterada',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'distance');await unit(page,ids.corner);await unit(page,ids.nn[0]);const before=(await measurements(page))[0];
  await switchModule(page,'explorar');await openLeft(page,'Estrutura');await page.click('#silm-panel-free');await closeLeft(page);await organize(page);
  const after=(await measurements(page))[0];assert.deepEqual(after,before,'Registro inalterado');await openRight(page,'dados','Medições');assert.match(await page.locator('#silm-measurements').textContent(),/Medição realizada em estado anterior da estrutura/);await closeRight(page);
  return {flagged:true};
 });

 await test('0.9-RELOAD','Reload: medições persistem; medição incompleta é cancelada',async use=>{
  const page=await use();await crystal(page,'Mg',3);await toMedir(page);const ids=await pick(page);await tool(page,'distance');await unit(page,ids.corner);await unit(page,ids.nn[0]);await tool(page,'angle');await unit(page,ids.corner);
  const before=await measurements(page);await reload(page);await page.waitForSelector('.silm-crystal');assert.deepEqual(await measurements(page),before);
  await openRight(page,'ver','Medir');assert.equal(await page.locator('#silm-measure-status').textContent().then(t=>/Ponto A selecionado/.test(t)),false,'Incompleta cancelada');assert.equal(await page.locator('.silm-measure-marker').count(),0);await closeRight(page);
  return {persisted:before.length};
 });

 await test('0.9-MODULE','Troca de módulo preserva as medições; troca de metal não as herda',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'coordination');await unit(page,ids.corner);const before=await measurements(page);
  await switchModule(page,'calcular');await switchModule(page,'explorar');await switchModule(page,'medir');assert.deepEqual(await measurements(page),before);
  await switchModule(page,'explorar');await openLeft(page,'Metal');await page.click('#silm-select-metal');await page.click('.silm-periodic .periodic-element[data-symbol="Ag"]');await page.click('.silm-periodic [id$="-investigate"]');await answer(page,'Iniciar nova investigação');
  await page.waitForSelector('#silm-start-assembly');assert.deepEqual(await measurements(page),[]);return {preserved:true,newMetal:'sem medições herdadas'};
 });

 await test('0.9-DEFORM','Com deformação ativa, os instrumentos aguardam a estrutura de referência',async use=>{
  const page=await use();await crystal(page,'Cu',4);await openLeft(page,'Propriedades');await page.click('#silm-prop-start-malleability');await page.click('#silm-prop-compress');await closeLeft(page);await toMedir(page);
  await openRight(page,'ver','Medir');assert.equal(await page.getAttribute('#silm-tool-distance','aria-disabled'),'true');assert.match(await page.locator('#silm-measure-status').textContent(),/Restaure a experiência de deformação/);await closeRight(page);
  return {blocked:true};
 });

 await test('0.9-KBD','Fluxo completo sem mouse, com anúncios',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await openRight(page,'ver','Medir');await page.focus('#silm-tool-distance');await page.keyboard.press('Enter');await closeRight(page);
  await page.focus(`.silm-crystal-unit[data-unit-id="${ids.corner}"]`).catch(async()=>{await page.evaluate(id=>{const n=document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`);n.tabIndex=0;n.focus();},ids.corner);});
  await page.evaluate(id=>document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`).focus(),ids.corner);await page.keyboard.press('Enter');
  await page.evaluate(id=>document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`).focus(),ids.nn[0]);await page.keyboard.press('Enter');
  assert.match(await status(page),/Distância medida: 2,556 ångströms/);assert.equal((await measurements(page)).length,1);return {keyboard:true};
 });

 await test('0.9-A11Y','Acessibilidade: marcadores com letra, resultado legível; axe-core',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'angle');
  await unit(page,ids.nn[0]);await unit(page,ids.corner);await unit(page,ids.nn[1]);assert.deepEqual(await page.locator('.silm-measure-marker text').allTextContents(),['A','B','C']);
  assert.match(await page.getAttribute('#silm-assembly-stage','aria-label'),/Ângulo medido/);await openRight(page,'ver','Medir');
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#workspace').analyze();
  const serious=scan.violations.filter(v=>['serious','critical'].includes(v.impact));assert.deepEqual(serious.map(v=>v.id+': '+v.nodes.map(n=>n.target.join(' ')).join(' | ')),[]);
  await page.evaluate(()=>{SimCore.accessibility.set('contrast',true);SimCore.accessibility.set('colorblind','protanopia');});await closeRight(page);await shot(page,'d06-alto-contraste');
  await page.evaluate(()=>SimCore.accessibility.set('colorblind','none'));return {violations:scan.violations.length};
 });

 await test('0.9-VALID','Registro adulterado é recusado na restauração',async use=>{
  const page=await use();await crystal(page,'Cu',4);await toMedir(page);const ids=await pick(page);await tool(page,'distance');await unit(page,ids.corner);await unit(page,ids.nn[0]);
  const bad=JSON.parse(JSON.stringify(await state(page)));bad.measurements[0].value=2.9;
  const other=await use({seed:bad});await go(other);await other.waitForTimeout(400);const s=await state(other);assert.equal(s.investigation,null,'Estado adulterado não é restaurado');
  return {rejected:'MEASUREMENT_VALUE_INVALID'};
 });

 for(const [w,h,label] of [[320,740,'320'],[360,760,'360'],[390,844,'390'],[844,390,'landscape'],[768,1024,'tablet']])await test('0.9-MOB-'+label,'Mobile/tablet '+label+': medir com toque e folha de instrumentos',async use=>{
  const page=await use({width:w,height:h,mobile:w<900});await crystal(page,'Cu',4);await switchModule(page,'medir');await page.waitForSelector('.silm-crystal');const ids=await pick(page);
  await openRight(page,'ver','Medir');await page.locator('#silm-tool-distance').scrollIntoViewIfNeeded();await page.locator('#silm-tool-distance').tap();await closeRight(page);
  await page.locator(`.silm-crystal-unit[data-unit-id="${ids.corner}"]`).tap();await page.locator(`.silm-crystal-unit[data-unit-id="${ids.nn[0]}"]`).tap();
  assert.equal((await measurements(page))[0]?.value,2.556);const m=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,stage:Math.round(document.getElementById('silm-assembly-stage').getBoundingClientRect().width)}));
  assert.ok(m.overflow<=0&&m.stage>=(label==='landscape'?150:200),JSON.stringify(m));await page.locator('#silm-assembly-stage').scrollIntoViewIfNeeded();await shot(page,'m-'+label+'-medir');return m;
 });
}};
