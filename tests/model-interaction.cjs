'use strict';
/* Interação do estudante com o modelo de estudo, no navegador:
   1. Construção: cada metal disponível é escolhido, iniciado e organizado pela interface; a estrutura gerada tem o tipo
      e o número de sítios do modelo, aparece em 2D e em 3D, sem erros de página.
   2. Fichas incompletas (DHC de La, Pr e Nd): "Organizar estrutura" fica indisponível COM o motivo junto do botão (cena e Preparo).
      As estruturas do modelo geral (α-Mn, β-Sn, Sm, Bi, Np, α-Pu, Am, Po, Pa) organizam e desenham como as canônicas.
   3. Medir: uma seleção que não serve ao instrumento é explicada em linguagem do estudante (sem códigos internos).
   4. Calcular: quando uma entrada depende de outro cálculo, a interface diz qual fórmula vem antes e leva até ela.
   5. Contagem de unidades com singular e plural corretos.
   6. Modelo geral (α-Mn): coordenação descrita por camadas de distância; Calcular só com as fórmulas exatas da célula. */
const assert=require('node:assert/strict');const {serve,launch}=require('./support.cjs');const nav=require('./integration-navigation.cjs');
(async()=>{const {server,url}=await serve(),browser=await launch();
 try{
  const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
  await ctx.addInitScript(()=>{try{localStorage.setItem('silm-base-integration:tour.seen','true');}catch{}});
  const p=await ctx.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url+'index.html#/ambiente');await p.waitForFunction(()=>window.SILMIntegration);
  const preparo=async()=>{if(await p.locator('#si-dock-left').isHidden())await p.locator('[data-open-dock="montagem"]').click();if(await p.locator('[data-left-tab="preparo"]').getAttribute('aria-pressed')!=='true')await p.locator('[data-left-tab="preparo"]').click();};
  const choose=async z=>{await preparo();await p.locator('#silm-metal').selectOption(String(z));await p.locator('#silm-start').click();
   if(await p.locator('#si-modal-confirm').isVisible().catch(()=>false))await p.locator('#si-modal-confirm').click();await p.waitForFunction(z=>SILMIntegration.snapshot().metal?.atomicNumber===z,z);await preparo();};
  const metals=await p.evaluate(()=>SILM.data.elements.filter(e=>e.silmEligibility.status==='available').map(e=>{const el=SILM.crystal.eligibility(e);return {z:e.atomicNumber,sym:e.symbol,name:e.name,type:el.structureType||null,sites:el.structureType?SILM.crystal.geometry(e).model.cellSites:null};}));
  assert.equal(metals.length,65);assert.deepEqual(metals.filter(m=>!m.type).map(m=>m.sym),['La','Pr','Nd']);
  /* 1 e 2. Construção de cada metal. */
  for(const m of metals){
   await choose(m.z);
   if(!m.type){
    assert.equal(await p.locator('#silm-organize').isDisabled(),true,m.sym+': Organizar indisponível');
    assert.match(await p.locator('#silm-organize-reason').innerText(),new RegExp('Organizar indisponível para '+m.name.toLowerCase()+'.*montagem livre continua disponível'),m.sym+': motivo no Preparo');
    await p.locator('#silm-add').click();await p.locator('[data-close-dock="left"]').click();
    const why=p.locator('#silm-assembly-crystal-reason');assert.equal(await why.isVisible(),true,m.sym+': motivo visível na cena');
    const near=await p.evaluate(()=>{const r=document.getElementById('silm-assembly-crystal-reason').getBoundingClientRect(),b=document.getElementById('silm-assembly-organize').getBoundingClientRect();return r.top-b.bottom;});
    assert.ok(near<80,m.sym+': motivo junto do botão ('+Math.round(near)+' px)');assert.equal(await why.locator('a[href="#/manual?topico=problemas"]').count(),1);
    continue;
   }
   assert.equal(await p.locator('#silm-organize-reason').isHidden(),true,m.sym+': sem motivo quando Organizar está disponível');
   await p.locator('#silm-add').click();await p.locator('#silm-organize').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline');
   const s=await p.evaluate(()=>{const x=SILMIntegration.snapshot().structure;return {type:x.crystallography.structureType,units:x.units.length};});
   assert.deepEqual(s,{type:m.type,units:m.sites},m.sym+': tipo e sítios da célula');
   await p.locator('[data-close-dock="left"]').click();
   assert.ok(await p.locator('#silm-integration-scene [data-unit-id]').count()>=m.sites,m.sym+': unidades desenhadas em 2D');
   await p.locator('#silm-crystal-projection').selectOption('3d');await p.waitForFunction(()=>document.querySelector('#silm-integration-scene canvas, #silm-integration-scene svg'));
   await p.locator('#silm-crystal-projection').selectOption('isometric');
   assert.deepEqual(errors,[],m.sym+': sem erros de página');
  }
  /* 3. Medir: seleção inválida explicada. */
  await choose(26);await p.locator('#silm-add').click();await p.locator('#silm-organize').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline');
  await nav.moduleChoice(p,'medir');await nav.viewer(p,'instrumentos');await p.locator('#silm-instrument').selectOption('latticeParameter');await p.locator('[data-close-dock="right"]').click();
  const units=await p.evaluate(()=>SILMIntegration.snapshot().structure.units.map(u=>({id:u.id,cell:u.site.cell.join(','),basis:u.site.basis})));
  await p.locator('[data-unit-id="'+units.find(u=>u.basis===0&&u.cell==='0,0,0').id+'"]').press('Enter');await p.locator('[data-unit-id="'+units.find(u=>u.basis===1).id+'"]').press('Enter');
  const told=await p.locator('#silm-announcement').textContent();
  assert.match(told,/escolha dois centros equivalentes ligados por uma aresta da célula/);assert.doesNotMatch(told,/[A-Z]{3,}_[A-Z_]+/,'Sem códigos internos');
  /* 4. Calcular: dependência entre fórmulas. */
  await nav.moduleChoice(p,'calcular');await nav.viewer(p,'calculos');await p.locator('#silm-formula').selectOption('theoretical-density');
  assert.match(await p.locator('#silm-dependency-V').innerText(),/Calcule antes “Volume da célula unitária”/);
  assert.equal(await p.locator('#silm-dependency-a').count(),0,'O parâmetro a tabelado não recebe a dica');
  await p.locator('#silm-dependency-go-V').click();assert.equal(await p.locator('#silm-formula').inputValue(),'cell-volume-cubic');
  await p.getByRole('button',{name:'Calcular',exact:true}).click();await p.waitForFunction(()=>SILMIntegration.snapshot().calculations.length===1);
  await p.locator('#silm-formula').selectOption('theoretical-density');assert.equal(await p.locator('#silm-dependency-V').count(),0,'Depois do volume, a dica some');
  await p.getByRole('button',{name:'Calcular',exact:true}).click();await p.waitForFunction(()=>SILMIntegration.snapshot().calculations.length===2);
  const rho=await p.evaluate(()=>SILMIntegration.snapshot().calculations[1].result.value);assert.ok(rho>7.8&&rho<8,'Densidade teórica do ferro a partir do volume calculado: '+rho);
  /* 5. Singular e plural. */
  await nav.moduleChoice(p,'explorar');await choose(29);await p.locator('#silm-add').click();assert.equal((await p.locator('#scene-count').textContent()).trim(),'1 unidade');
  await p.locator('#silm-add').click();assert.equal((await p.locator('#scene-count').textContent()).trim(),'2 unidades');
  /* 6. Modelo geral: α-Mn. */
  await nav.moduleChoice(p,'explorar');await choose(25);await p.locator('#silm-add').click();await p.locator('#silm-organize').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline');
  assert.match(await p.locator('#silm-assembly-meta').innerText(),/Cúbica complexa \(α-Mn\) · I -4 3 m/);
  await nav.moduleChoice(p,'medir');await nav.viewer(p,'instrumentos');await p.locator('#silm-instrument').selectOption('coordination');await p.locator('[data-close-dock="right"]').click();
  const corner=await p.evaluate(()=>SILMIntegration.snapshot().structure.units.find(u=>u.site.basis===0&&u.site.cell.join()==='0,0,0').id);
  await p.locator('[data-unit-id="'+corner+'"]').press('Enter');
  assert.match(await p.locator('#silm-announcement').textContent(),/Medida do modelo: \d+ vizinhos na primeira camada.*Camadas seguintes: .*o número de coordenação depende da distância considerada/);
  await nav.moduleChoice(p,'calcular');await nav.viewer(p,'calculos');
  assert.deepEqual(await p.locator('#silm-formula option').evaluateAll(o=>o.map(x=>x.value)),['effective-atoms-general','cell-volume-general','theoretical-density'],'Sem raio nem empacotamento no modelo geral');
  assert.equal(await p.locator('#silm-formula-detail').innerText(),'Nesta estrutura: n = 8 vértices × 1/8 + 57 internos × 1 = 58.');
  await p.locator('#silm-formula').selectOption('cell-volume-general');await p.getByRole('button',{name:'Calcular',exact:true}).click();
  await p.waitForFunction(()=>SILMIntegration.snapshot().calculations.some(c=>c.formulaId==='cell-volume-general'));
  const vMn=await p.evaluate(()=>SILMIntegration.snapshot().calculations.find(c=>c.formulaId==='cell-volume-general').result.value);assert.ok(Math.abs(vMn-707.94)<.01,'Volume do α-Mn: '+vMn);
  assert.deepEqual(errors,[]);await ctx.close();
  console.log('PASS model-interaction: 62 estruturas construídas pela interface (2D e 3D), 9 delas no modelo geral; 3 fichas incompletas bloqueadas com motivo junto do botão; medida inválida explicada; dependência entre fórmulas guiada; coordenação por camadas e fórmulas exatas no modelo geral; contagem de unidades correta.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
