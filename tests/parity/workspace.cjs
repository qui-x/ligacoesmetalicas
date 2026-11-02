'use strict';
/* TEST-WORKSPACE — Etapa 5 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   5.2 Montagem: doca com "Fechar", grupos na aba Preparo, resumo em pares e indisponibilidade científica explícita.
   5.1 Foco: a Oficina vazia segue a "Bancada vazia" do SIAB (ilustração, título, o que fazer e ações que funcionam, com
   "Montagens prontas" desde a Etapa 9);
   a barra mostra o módulo ativo; adicionar, desfazer e trocar de módulo preservam a investigação. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const visible=(p,sel)=>p.locator(sel).first().waitFor({state:'visible',timeout:4000});
 /* 1. Estado vazio nos cinco tamanhos. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/ambiente');await visible(p,'.si-empty-state');
   const s=await p.evaluate(()=>{const box=document.querySelector('.si-empty-state'),r=el=>el.getBoundingClientRect(),scene=document.getElementById('silm-integration-scene');
    return {title:box.querySelector('h2').textContent.trim(),text:box.querySelector('p').textContent.trim(),art:!!box.querySelector('svg[aria-hidden="true"]'),
     actions:[...box.querySelectorAll('.si-empty-actions .button')].map(b=>({text:b.textContent.trim(),h:r(b).height,inside:r(b).right<=r(scene).right+1&&r(b).left>=r(scene).left-1})),
     tag:document.getElementById('si-module-tag')?.textContent.trim(),overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(s.title,'Oficina vazia',where);assert.match(s.text,/Montagem → Preparo/);assert.equal(s.art,true,'Ilustração decorativa');
   assert.deepEqual(s.actions.map(a=>a.text),['Abrir Montagem','Começar com o cobre','Montagens prontas','Tabela periódica'],where);
   for(const a of s.actions){assert.ok(a.h>=44,'Ação com alvo de 44 px em '+where);assert.ok(a.inside,'Ação dentro da cena em '+where);}
   assert.equal(s.tag,'Módulo · Explorar');assert.ok(s.overflow<=1,'Sem rolagem lateral em '+where+': '+s.overflow+' px');
  }finally{await ctx.close();}
 }
 /* 2. As ações do estado vazio funcionam; adicionar, desfazer e trocar de módulo preservam a investigação. */
 const ctx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/ambiente');await visible(p,'.si-empty-state');
  await p.getByRole('button',{name:'Abrir Montagem',exact:true}).click();
  await p.waitForFunction(()=>document.querySelector('[data-open-dock="montagem"]')?.getAttribute('aria-expanded')==='true'&&document.querySelector('[data-left-tab="preparo"]')?.getAttribute('aria-pressed')==='true','',{timeout:4000});
  await p.locator('[data-close-dock="left"]').click();
  await p.getByRole('button',{name:'Tabela periódica',exact:true}).click();await visible(p,'dialog[open]');await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('dialog[open]'));
  assert.equal(await p.evaluate(()=>SILMIntegration.snapshot().investigation),null,'Abrir a tabela não inicia investigação');
  await p.getByRole('button',{name:'Começar com o cobre',exact:true}).click();await p.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===29);
  assert.equal(await p.locator('.si-empty-state').count(),0,'Com metal, a cena mostra a montagem');
  await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-add').click();await p.locator('#silm-add').click();
  await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.units.length===2);
  await p.getByRole('button',{name:/Desfazer/}).first().click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.units.length===1);
  const before=await p.evaluate(()=>JSON.stringify({metal:SILMIntegration.snapshot().metal,units:SILMIntegration.snapshot().structure.units}));
  const tab=p.locator('[data-left-tab="modulo"]');if(await p.locator('#si-dock-left').isHidden())await p.locator('[data-open-dock="montagem"]').click();await tab.click();
  await p.locator('#silm-module').selectOption('medir');await p.waitForFunction(()=>SILMIntegration.snapshot().module.active==='medir');
  assert.equal(await p.evaluate(()=>JSON.stringify({metal:SILMIntegration.snapshot().metal,units:SILMIntegration.snapshot().structure.units})),before,'Trocar de módulo não apaga a investigação');
  await p.waitForFunction(()=>document.getElementById('si-module-tag')?.textContent.trim()==='Módulo · Medir','',{timeout:4000});
  assert.equal(await p.locator('#silm-add').isDisabled(),true,'Medir não edita a montagem');
  await p.locator('#silm-module').selectOption('explorar');await p.waitForFunction(()=>SILMIntegration.snapshot().module.active==='explorar');
 }finally{await ctx.close();}
 /* 3. 5.2 Montagem: cabeçalho com "Fechar", grupos da aba Preparo, ação principal, resumo em pares, retorno do foco e
    indisponibilidade científica explícita (metal sem geometria validada nunca vira CCC/CFC/HC). */
 const mctx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 try{
  const p=await open(mctx,'#/ambiente');await p.locator('[data-open-dock="montagem"]').click();await visible(p,'#si-dock-left');
  const dock=await p.evaluate(()=>{const close=document.querySelector('[data-close-dock="left"]'),start=document.getElementById('silm-start');
   return {close:close.textContent.trim(),label:close.getAttribute('aria-label'),tabs:[...document.querySelectorAll('[data-left-tab]:not([hidden])')].map(t=>t.textContent.trim()),
    groups:[...document.querySelectorAll('[data-left-panel="preparo"] .silm-dock-group h3')].map(h=>h.textContent.trim()),primary:start.classList.contains('primary'),bg:getComputedStyle(start).backgroundColor,
    sizes:[...document.querySelectorAll('[data-left-panel="preparo"] .button, #silm-metal, [data-close-dock="left"]')].filter(b=>b.getClientRects().length).map(b=>b.getBoundingClientRect().height)};});
  assert.equal(dock.close,'Fechar');assert.equal(dock.label,'Fechar Montagem');assert.deepEqual(dock.tabs,['Resumo','Preparo','Unidades','Módulo']);
  assert.deepEqual(dock.groups,['Metal da investigação','Estrutura'],'Grupos rotulados na aba Preparo');
  assert.equal(dock.primary,true,'Iniciar investigação é a ação principal');assert.notEqual(dock.bg,'rgb(107, 107, 107)','Sem o cinza padrão do navegador');
  for(const h of dock.sizes)assert.ok(h>=44,'Controles da Montagem com 44 px: '+h);
  await p.locator('[data-close-dock="left"]').click();await p.waitForFunction(()=>document.activeElement?.matches('[data-open-dock="montagem"]'),'',{timeout:4000});
  // Resumo em pares, atualizado pelo estado.
  await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-metal').selectOption('29');await p.locator('#silm-start').click();await p.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===29);
  await p.locator('#silm-add').click();await p.locator('#silm-add').click();await p.locator('[data-left-tab="resumo"]').click();
  const pairs=async()=>p.evaluate(()=>{const d=[...document.querySelectorAll('#silm-summary-list dt')];return Object.fromEntries(d.map(dt=>[dt.textContent,dt.nextElementSibling.textContent]));});
  await p.waitForFunction(()=>document.querySelectorAll('#silm-summary-list dt').length>=6);
  assert.deepEqual(await pairs(),{Metal:'Cobre (Cu)',Estrutura:'Montagem livre',Unidades:'2',Módulo:'Explorar',Medições:'0',Cálculos:'0'});
  await p.locator('[data-left-tab="preparo"]').click();await p.locator('#silm-organize').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline');
  await p.locator('[data-left-tab="resumo"]').click();await p.waitForFunction(()=>/CFC/.test([...document.querySelectorAll('#silm-summary-list dd')][1]?.textContent||''),'',{timeout:4000});
  // Metal sem geometria validada (lantânio: ficha da dupla hexagonal incompleta): organizar fica bloqueado, com o motivo escrito, e a estrutura nunca vira cristalina.
  await p.locator('[data-left-tab="preparo"]').click();await p.locator('#silm-metal').selectOption('57');await p.locator('#silm-start').click();
  if(await p.locator('#si-modal-confirm').isVisible().catch(()=>false))await p.locator('#si-modal-confirm').click();
  await p.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===57);await p.locator('#silm-add').click();await p.locator('#silm-add').click();
  assert.equal(await p.locator('#silm-organize').isDisabled(),true,'Organizar bloqueado sem geometria validada');
  assert.match(await p.locator('#silm-assembly-crystal-reason').innerText(),/não descreve a estrutura completa.*visualização fica bloqueada/);
  assert.notEqual(await p.evaluate(()=>SILMIntegration.snapshot().structure.mode),'crystalline');
 }finally{await mctx.close();}
 /* 4. 5.3 Ver e 5.4 Dados: títulos do SIAB, famílias do módulo, camadas sem efeito científico, origem das entradas,
    registros rotulados ("Medida do modelo", "Calculado pelo SILM") e seção Relatório. */
 const nav=require('../integration-navigation.cjs');
 const vctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(vctx,'#/ambiente');await p.getByRole('button',{name:'Começar com o cobre',exact:true}).click();await p.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===29);
  await p.locator('[data-open-dock="montagem"]').click();for(let i=0;i<4;i++)await p.locator('#silm-add').click();await p.locator('#silm-organize').click();
  await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline');await p.locator('[data-close-dock="left"]').click();
  const families=async()=>{await p.waitForFunction(()=>[...document.querySelectorAll('#si-viewer-families [role="tab"]')].some(t=>t.getClientRects().length),'',{timeout:4000});return p.evaluate(()=>[...document.querySelectorAll('#si-viewer-families [role="tab"]')].filter(t=>t.getClientRects().length).map(t=>t.textContent.trim()));};
  await p.locator('[data-open-dock="ver"]').click();await p.waitForFunction(()=>document.getElementById('si-right-title')?.textContent==='Investigar','',{timeout:4000});
  assert.equal(await p.locator('#si-viewer-catalog h3').count(),0,'Sem título repetido dentro do painel');
  assert.deepEqual(await families(),['Observar'],'Explorar mostra só a família Observar');
  await nav.viewer(p,'eletrons');await p.waitForFunction(()=>document.getElementById('si-right-title')?.textContent==='Elétrons deslocalizados','',{timeout:4000});
  const science=()=>p.evaluate(()=>{const s=SILMIntegration.snapshot();return JSON.stringify({metal:s.metal,units:s.structure.units,measurements:s.measurements,calculations:s.calculations,mode:s.structure.mode});});
  const before=await science();await p.locator('#silm-electrons').click();await p.waitForTimeout(200);assert.equal(await science(),before,'Mostrar elétrons não altera o estado científico');
  await p.locator('#si-dock-viewer-back').click();await p.waitForFunction(()=>document.getElementById('si-right-title')?.textContent==='Investigar','',{timeout:4000});
  await p.locator('[data-close-dock="right"]').click();
  // Medir: família Medir, uma medida válida de a.
  await nav.moduleChoice(p,'medir');await p.locator('[data-open-dock="ver"]').click();assert.deepEqual(await families(),['Observar','Medir'],'Medir acrescenta a família Medir');await nav.viewer(p,'instrumentos');
  await p.locator('#silm-instrument').selectOption('latticeParameter');await p.locator('[data-close-dock="right"]').click();
  const pair=await p.evaluate(()=>{const s=SILMIntegration.snapshot(),g=SILM.crystal.geometry(SILM.data.get(s.metal.atomicNumber));for(const a of s.structure.units)for(const b of s.structure.units){const m=SILM.measurement.compute('latticeParameter',g,[a.site,b.site]);if(m.ok&&m.parameter==='a')return[a.id,b.id];}});
  for(const id of pair)await p.locator('[data-unit-id="'+id+'"]').press('Enter');await p.waitForFunction(()=>SILMIntegration.snapshot().measurements.length===1);
  // Calcular: família Analisar; a entrada a mostra as origens possíveis, inclusive a medida do modelo.
  await nav.moduleChoice(p,'calcular');await p.locator('[data-open-dock="ver"]').click();assert.deepEqual(await families(),['Observar','Analisar'],'Calcular acrescenta a família Analisar');await nav.viewer(p,'calculos');
  await p.locator('#silm-formula').selectOption('cell-volume-cubic');const panel=await p.locator('#si-dock-right').innerText();
  assert.match(panel,/Dado tabelado/);assert.match(panel,/Medida do modelo/);
  await p.getByRole('button',{name:'Calcular',exact:true}).click();await p.waitForFunction(()=>SILMIntegration.snapshot().calculations.length===1);await p.locator('[data-close-dock="right"]').click();
  // Dados: título do SIAB, três consultas, registros rotulados e seção Relatório.
  await p.locator('[data-open-dock="dados"]').click();await p.waitForFunction(()=>document.getElementById('si-right-title')?.textContent==='Dados da investigação','',{timeout:4000});
  assert.deepEqual(await p.evaluate(()=>[...document.querySelectorAll('[data-silm-data-open] strong')].map(x=>x.textContent)),['Dados do metal','Medições e cálculos','Arquivos da investigação']);
  assert.equal(await p.locator('#silm-record-count').innerText(),'1 medição · 1 cálculo');
  const docs=await p.evaluate(()=>{const box=document.querySelector('#silm-data-catalog .silm-data-documents');return {title:box.querySelector('h3').textContent,links:[...box.querySelectorAll('a')].map(a=>({text:a.textContent,href:a.getAttribute('href'),h:a.getBoundingClientRect().height,w:a.getBoundingClientRect().width,box:box.getBoundingClientRect().width}))};});
  assert.equal(docs.title,'Relatório');assert.deepEqual(docs.links.map(l=>[l.text,l.href]),[['Abrir relatório','#/relatorios'],['Abrir Caderno','#/caderno']]);
  for(const l of docs.links){assert.ok(l.h>=44,'Ação de documento com 44 px');assert.ok(l.w>=l.box-2,'Ação de documento em largura total, como no SIAB');}
  await nav.data(p,'registros');const records=await p.locator('#silm-history').innerText();
  assert.match(records,/Calculado pelo SILM/);assert.match(records,/Parâmetro de rede/);
  await p.locator('#silm-data-back').click();await p.waitForFunction(()=>document.activeElement?.matches('[data-silm-data-open="registros"]'),'',{timeout:4000});
 }finally{await vctx.close();}
 /* 5. 5.5 Visão geral: barra de controles em largura total (como as ações de "Sua bancada"), cartões com largura útil,
    nada cortado no celular, propriedade aplicada por cartão com estado qualitativo ou motivo, e Restaurar. */
 for(const [width,height] of [[1366,768],[390,844],[844,390]]){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const octx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(octx,'#/ambiente');
   for(const z of ['29','26']){await p.locator('[data-open-dock="montagem"]').click();await p.locator('[data-left-tab="preparo"]').click();await p.locator('#silm-metal').selectOption(z);await p.locator('#silm-start').click();
    if(await p.locator('#si-modal-confirm').isVisible().catch(()=>false))await p.locator('#si-modal-confirm').click();await p.waitForFunction(z=>SILMIntegration.snapshot().metal?.atomicNumber===Number(z),z);
    for(let i=0;i<3;i++)await p.locator('#silm-add').click();await p.locator('#silm-organize').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline');await p.locator('[data-close-dock="left"]').click();}
   await p.locator('[data-scene-view="overview"]').click();await visible(p,'.silm-comparison-cards article');
   const o=await p.evaluate(()=>{const host=document.getElementById('silm-comparison-items'),r=el=>el.getBoundingClientRect(),controls=host.querySelector('.silm-comparison-controls');
    return {host:r(host).width,controls:r(controls).width,cards:[...host.querySelectorAll('.silm-comparison-cards article')].map(a=>r(a).width),
     clipped:[...host.querySelectorAll('.silm-comparison-actions button, .silm-comparison-select')].filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.textContent.trim()||b.id),
     targets:[...host.querySelectorAll('.silm-comparison-actions button')].map(b=>r(b).height),overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.ok(o.controls>=o.host*0.95,'Barra de controles em largura total em '+where+': '+o.controls+' de '+o.host);
   assert.equal(o.cards.length,2,where);for(const w of o.cards)assert.ok(w>=Math.min(250,o.host-4),'Cartão com largura útil em '+where+': '+w);
   assert.deepEqual(o.clipped,[],'Nenhum controle cortado em '+where);for(const h of o.targets)assert.ok(h>=44,'Ação com 44 px em '+where);
   assert.ok(o.overflow<=1,'Sem rolagem lateral em '+where+': '+o.overflow+' px');
   if(width===1366){
    await p.locator('#silm-comparison-property').selectOption('electrical');await p.locator('[data-comparison-level="2"]').click();
    await p.waitForFunction(()=>[...document.querySelectorAll('.silm-comparison-card-state')].length===2,'',{timeout:4000});
    for(const t of await p.locator('.silm-comparison-card-state').allInnerTexts())assert.ok(/Qualitativa · 2\/3/.test(t)||t.length>10,'Cada cartão mostra o estado qualitativo ou o motivo: '+t);
    await p.getByRole('button',{name:'Restaurar',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.silm-comparison-level')?.textContent==='0/3','',{timeout:4000});
   }
  }finally{await octx.close();}
 }
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-WORKSPACE 5.1–5.5: Oficina vazia em 5 tamanhos com ações funcionais, etiqueta do módulo, adicionar/desfazer, troca de módulo sem perder a investigação; Montagem com Fechar, grupos, ação principal, resumo em pares, retorno do foco e indisponibilidade explícita; Investigar e Dados da investigação com famílias do módulo, camadas sem efeito científico, origens, registros rotulados e seção Relatório; Visão geral com controles em largura total, cartões úteis, nada cortado, propriedade e Restaurar.');
};
