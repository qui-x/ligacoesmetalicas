'use strict';
/* Série 0.10.x — módulo Calcular: relações cristalográficas, grandezas derivadas e proveniência (§24 do prompt 0.10.x). */
module.exports={series:'0.10',async run(kit,{screenshots=false}={}){
 const {assert,state,go,investigate,assemble,reload,openRight,closeRight,switchModule,crystal}=kit;
 const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const calcs=async page=>(await state(page)).calculations;
 const toCalc=async(page,symbol='Cu',n=4)=>{await crystal(page,symbol,n);await switchModule(page,'calcular');await page.waitForSelector('.silm-crystal');await openRight(page,'ver','Calcular');};
 const run=async(page,id)=>{await page.click('#silm-calc-'+id);await page.click('#silm-calc-run');return (await calcs(page)).at(-1);};
 const num=text=>+String(text).match(/[0-9]+(,[0-9]+)?/)[0].replace(',','.');

 await test('0.10-MIG','Migração da 0.9.x (schema 7) sem perda',async use=>{
  const page=await use();await crystal(page,'Cu',4);const s=await state(page),v=JSON.parse(JSON.stringify(s));v.schemaVersion=7;
  const m=await use({seed:v});await go(m);await m.waitForSelector('.silm-crystal');const t=await state(m);
  assert.equal(t.schemaVersion,8);assert.deepEqual(t.structure,s.structure);assert.deepEqual(t.measurements,s.measurements);assert.deepEqual(t.calculations,[]);return {from:7,to:8};
 });

 await test('0.10-FREE','Sem estrutura cristalina não há cálculo absoluto; fora do módulo, convite a ativar Calcular',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,3);await openRight(page,'ver','Calcular');
  assert.equal(await page.locator('#silm-calc-module').isVisible(),true);assert.match(await page.locator('#silm-calc-status').textContent(),/funcionam no módulo Calcular/);await closeRight(page);
  await switchModule(page,'calcular');await openRight(page,'ver','Calcular');assert.match(await page.locator('#silm-calc-status').textContent(),/montagem livre não tem escala física/);
  assert.equal(await page.locator('button[id^="silm-calc-effective"]').isVisible(),false);return {free:'sem cálculo absoluto'};
 });

 await test('0.10-CFC','CFC (Cu): n, V, r, FE e ρ calculados pelo catálogo, com decomposição e intermediários',async use=>{
  const page=await use();await toCalc(page,'Cu');
  const list=await page.locator('.silm-layer-list button[id^="silm-calc-"]').allTextContents();assert.deepEqual(list,['Número efetivo','Volume da célula','Raio (a → r)','Parâmetro (r → a)','Fator de empacotamento','Densidade teórica'],'só cálculos compatíveis');
  await page.click('#silm-calc-effective-atoms-fcc');assert.equal(await page.getAttribute('.silm-crystal','data-calc'),'fractions');
  assert.deepEqual([...new Set(await page.locator('.silm-crystal-unit .silm-site-label').allTextContents())].sort(),['1/2','1/8']);await shot(page,'k01-numero-efetivo');
  const n=await run(page,'effective-atoms-fcc');assert.equal(n.result.value,4);assert.match(await page.locator('#silm-calc-result').innerText(),/n = 4[\s\S]*Calculado pelo SILM[\s\S]*8 × 1\/8 \+ 6 × 1\/2/);
  const V=await run(page,'cell-volume-cubic');assert.equal(V.inputs[0].origin,'TABULATED');assert.equal(V.inputs[0].value,3.615);assert.ok(Math.abs(V.result.value-3.615**3)<1e-9);
  assert.match(await page.locator('#silm-calc-result').innerText(),/V = 47,24 Å³[\s\S]*0,04724 nm³[\s\S]*4,724 × 10⁻²³ cm³/);
  const r=await run(page,'radius-from-a-fcc');assert.ok(Math.abs(r.result.value-Math.SQRT2*3.615/4)<1e-12);assert.equal(await page.getAttribute('.silm-crystal','data-calc'),'contact');assert.equal(await page.locator('.silm-dimension-line').count(),1);
  const fe=await run(page,'packing-factor');assert.deepEqual(fe.inputs.filter(x=>x.key!=='n').map(x=>x.origin),['CALCULATED','CALCULATED']);assert.ok(Math.abs(fe.result.value-Math.PI/(3*Math.SQRT2))<1e-12,'FE = π/(3√2) no CFC');
  assert.match(await page.locator('#silm-calc-result').innerText(),/0,7405 \(74,0 %\)[\s\S]*esferas rígidas/);
  const rho=await run(page,'theoretical-density');assert.equal(num((await page.locator('#silm-calc-result dd').first().innerText()).split('= ')[1]),8.935);
  assert.ok(rho.inputs.some(x=>x.key==='NA'&&x.origin==='CONSTANT'&&x.value===6.02214076e23));assert.ok(rho.inputs.some(x=>x.key==='M'&&x.origin==='TABULATED'&&x.value===63.546));
  assert.ok(rho.provenance.dependsOn.includes(V.id));assert.match(await page.locator('#silm-calc-result').innerText(),/8935 kg\/m³[\s\S]*massa da célula/);await shot(page,'k02-densidade');
  // r → a com o r calculado volta ao a tabelado; a referência aparece lado a lado (§12), sem 'erro experimental'.
  const a=await run(page,'a-from-radius-fcc');assert.equal(a.inputs[0].origin,'CALCULATED');assert.ok(Math.abs(a.result.value-3.615)<1e-12);
  const txt=await page.locator('#silm-calc-result').innerText();assert.match(txt,/Referência[\s\S]*3,6150 Å[\s\S]*Dado tabelado/);assert.match(txt,/não é erro experimental/);assert.match(txt,/361,5 pm · 0,3615 nm/);
  return {n:4,V:'47,24 Å³',r:'1,278 Å',FE:'0,7405',rho:'8,935 g/cm³',a:'3,615 Å (referência 3,6150 Å)'};
 });

 await test('0.10-CCC','CCC (Fe): n = 2, r = √3·a/4 e FE = π√3/8',async use=>{
  const page=await use();await toCalc(page,'Fe',3);
  assert.equal((await run(page,'effective-atoms-bcc')).result.value,2);const a=2.8654;
  const r=await run(page,'radius-from-a-bcc');assert.ok(Math.abs(r.result.value-Math.sqrt(3)*a/4)<1e-12);await run(page,'cell-volume-cubic');
  const fe=await run(page,'packing-factor');assert.ok(Math.abs(fe.result.value-Math.PI*Math.sqrt(3)/8)<1e-12);
  const back=await (async()=>{await page.click('#silm-calc-a-from-radius-bcc');await page.click('#silm-calc-run');return (await calcs(page)).at(-1);})();
  assert.equal(back.inputs[0].origin,'CALCULATED');assert.ok(Math.abs(back.result.value-a)<1e-12,'r → a recupera a');return {FE:fe.result.value};
 });

 await test('0.10-HC','HC (Mg): prisma hexagonal (n = 6), V = (3√3/2)a²c, c/a ≠ ideal e densidade com peso atômico em intervalo',async use=>{
  const page=await use();await toCalc(page,'Mg',3);
  const list=await page.locator('.silm-layer-list button[id^="silm-calc-"]').allTextContents();assert.ok(list.includes('Razão c/a')&&list.includes('Raio (a, c → r)')&&!list.includes('Parâmetro (r → a)'),'sem fórmula cúbica nem r → a no HC: '+list);
  assert.equal((await run(page,'effective-atoms-hcp')).result.value,6);const V=await run(page,'cell-volume-hcp');assert.ok(Math.abs(V.result.value-3*Math.sqrt(3)/2*3.2093**2*5.2103)<1e-9);
  const r=await run(page,'radius-from-ac-hcp');assert.ok(Math.abs(r.result.value-Math.sqrt(3.2093**2/3+5.2103**2/4)/2)<1e-12,'contato entre camadas (c/a < ideal)');
  const ca=await run(page,'ca-ratio-hcp');assert.ok(Math.abs(ca.result.value-5.2103/3.2093)<1e-12);assert.match(await page.locator('#silm-calc-result').innerText(),/√\(8\/3\) ≈ 1,633[\s\S]*não é dado do metal/);
  const rho=await run(page,'theoretical-density');assert.ok(Array.isArray(rho.result.interval)&&rho.result.value===null,'peso atômico em intervalo → densidade em intervalo');
  await shot(page,'k03-hc-razao');return {ca:ca.result.value,rho:rho.result.interval};
 });

 await test('0.10-ORIGIN','Medida do modelo × referência: escolha explícita, nunca substituição silenciosa',async use=>{
  const page=await use();await crystal(page,'Cu',4);await switchModule(page,'medir');
  const ids=await page.evaluate(()=>{const s=SILM.scientificState.structure,g=SILM.crystal.geometry(SILM.data.get(29)),K=SILM.crystal.key,by=new Map(s.units.map(u=>[K(u.site),u.id])),c=g.cell.find(x=>x.frac.every(v=>Math.abs(v)<1e-9));
   const e=g.cell.filter(x=>x.basis===c.basis&&x.key!==c.key).map(x=>({x,d:Math.hypot(...x.cart.map((v,i)=>v-c.cart[i]))})).sort((a,b)=>a.d-b.d)[0].x;return [by.get(c.key),by.get(e.key)];});
  await openRight(page,'ver','Medir');await page.click('#silm-tool-latticeParameter');await closeRight(page);for(const id of ids)await page.click(`.silm-crystal-unit[data-unit-id="${id}"]`);
  const meas=(await state(page)).measurements.at(-1);assert.equal(meas.value,3.615);
  await switchModule(page,'calcular');await openRight(page,'ver','Calcular');await page.click('#silm-calc-cell-volume-cubic');
  const labels=await page.locator('#silm-calc-in-a label').allInnerTexts();assert.ok(labels[0].startsWith('Dado tabelado')&&labels.some(l=>l.startsWith('Medida do modelo'))&&labels.some(l=>l.startsWith('Valor informado')),JSON.stringify(labels));
  await page.click('#silm-calc-a-meas-'+meas.id.replace(/[^a-zA-Z0-9-]/g,''));await page.click('#silm-calc-run');const c=(await calcs(page)).at(-1);
  assert.equal(c.inputs[0].origin,'MODEL_MEASUREMENT');assert.equal(c.inputs[0].ref.measurementId,meas.id);assert.ok(c.provenance.dependsOn.includes(meas.id));
  await page.click('#silm-calc-a-tab');await page.click('#silm-calc-run');const t=(await calcs(page)).at(-1);assert.equal(t.inputs[0].origin,'TABULATED');assert.notEqual(t.id,c.id,'mudar a entrada gera novo registro');
  return {measured:c.result.value,tabulated:t.result.value};
 });

 await test('0.10-INPUT','Valor informado: número com vírgula aceito; inválido recusado com erro associado ao campo',async use=>{
  const page=await use();await toCalc(page,'Cu');await page.click('#silm-calc-cell-volume-cubic');await page.click('#silm-calc-a-user');
  for(const bad of ['abc','-1','0','1e999','']){await page.fill('#silm-calc-a-value',bad);await page.click('#silm-calc-run');assert.equal(await page.getAttribute('#silm-calc-a-value','aria-invalid'),'true',bad);assert.match(await page.locator('#silm-calc-error-a').textContent(),/número positivo e finito/);}
  assert.equal((await calcs(page)).length,0);await page.fill('#silm-calc-a-value','3,6');await page.click('#silm-calc-run');const c=(await calcs(page)).at(-1);
  assert.equal(c.inputs[0].origin,'USER');assert.equal(c.inputs[0].value,3.6);assert.equal(c.inputs[0].ref,null);
  await page.click('#silm-calc-packing-factor');await page.click('#silm-calc-r-user');await page.fill('#silm-calc-r-value','2');await page.click('#silm-calc-run');
  assert.match(await page.locator('#silm-assembly-feedback').textContent(),/fisicamente impossíveis/);return {user:3.6};
 });

 await test('0.10-HIST','Dados → Cálculos: reabrir com fórmula, entradas e origens; remover e limpar (estrutura e medições intactas)',async use=>{
  const page=await use();await toCalc(page,'Cu');await run(page,'effective-atoms-fcc');await run(page,'cell-volume-cubic');await closeRight(page);
  await openRight(page,'dados','Cálculos');const items=page.locator('#silm-calculations > li');assert.equal(await items.count(),2);
  const id=(await calcs(page))[1].id;await page.click('#silm-calc-record-'+id+' > summary');
  assert.match(await page.locator('#silm-calc-record-'+id).innerText(),/Fórmula[\s\S]*V = a³[\s\S]*Entradas[\s\S]*a = 3,615 Å · Dado tabelado[\s\S]*Fontes/);await shot(page,'k04-calculos');
  await page.click('#silm-calc-remove-'+id);assert.equal((await calcs(page)).length,1);
  const before=await state(page);await page.click('#silm-calculations-clear');await kit.answer(page,'Limpar cálculos');const after=await state(page);
  assert.deepEqual(after.calculations,[]);assert.deepEqual(after.structure,before.structure);assert.deepEqual(after.measurements,before.measurements);return {cleared:true};
 });

 await test('0.10-RELOAD','Reload: cálculos persistem com proveniência; registro de estado anterior é identificado, não recalculado',async use=>{
  const page=await use();await toCalc(page,'Cu');await run(page,'cell-volume-cubic');const saved=await calcs(page);await kit.reload(page);
  assert.deepEqual(await calcs(page),saved);
  await switchModule(page,'explorar');await kit.openLeft(page,'Estrutura');await page.click('#silm-panel-free');await kit.closeLeft(page);await kit.organize(page);
  assert.deepEqual(await calcs(page),saved,'registro inalterado');await openRight(page,'dados','Cálculos');assert.match(await page.locator('#silm-calculations').textContent(),/Cálculo realizado em estado anterior da estrutura/);
  return {persisted:saved.length,flagged:true};
 });

 await test('0.10-METAL','Troca de módulo preserva os cálculos; nova investigação (outro metal) não os herda',async use=>{
  const page=await use();await toCalc(page,'Cu');await run(page,'effective-atoms-fcc');const before=await calcs(page);await closeRight(page);
  await switchModule(page,'medir');await switchModule(page,'explorar');assert.deepEqual(await calcs(page),before);
  await kit.openLeft(page,'Metal');await page.click('#silm-select-metal');await page.click('.silm-periodic .periodic-element[data-symbol="Ag"]');await page.click('.silm-periodic [id$="-investigate"]');await kit.answer(page,'Iniciar nova investigação');
  await page.waitForSelector('#silm-start-assembly');assert.deepEqual(await calcs(page),[]);return {preserved:true,newMetal:'sem cálculos herdados'};
 });

 await test('0.10-KBD','Fluxo completo sem mouse, com anúncio do resultado',async use=>{
  const page=await use();await toCalc(page,'Cu');const button=page.locator('#silm-calc-cell-volume-cubic');await button.focus();await page.keyboard.press('Enter');
  await page.locator('#silm-calc-run').focus();await page.keyboard.press('Enter');
  assert.match(await page.locator('#silm-assembly-feedback').textContent(),/Volume da célula unitária: V = 47,24 ångströms cúbicos\. Calculado pelo SILM\./);return {keyboard:true};
 });

 await test('0.10-A11Y','Acessibilidade: fórmulas com equivalente textual, campos rotulados; axe-core',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await toCalc(page,'Cu');await page.click('#silm-calc-theoretical-density');await page.click('#silm-calc-run');
  assert.match(await page.locator('#silm-calc-form .silm-formula-line .sr-only').textContent(),/rô é igual a n vezes a massa molar/);
  assert.equal(await page.locator('#silm-calc-form fieldset legend').count(),3);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#context-panel').analyze();
  const violations=scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}));assert.deepEqual(violations,[],JSON.stringify(violations));return {violations:0};
 });

 for(const [w,h,label] of [[360,760,'360'],[390,844,'390'],[844,390,'landscape']])await test('0.10-MOB-'+label,'Mobile '+label+': calcular na folha inferior com teclado numérico',async use=>{
  const page=await use({width:w,height:h,mobile:true});await toCalc(page,'Cu');await page.click('#silm-calc-cell-volume-cubic');
  assert.equal(await page.getAttribute('#silm-calc-a-value','inputmode'),'decimal');await page.click('#silm-calc-run');assert.equal((await calcs(page)).length,1);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=0);await shot(page,'m-'+label+'-calcular');return {overflow};
 });
}};
