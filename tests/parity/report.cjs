'use strict';
/* TEST-REPORT — Etapa 8 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   O Relatório como o SIAB 1.0.0 organiza: ações no topo, "Preparar relatório" com os modos (completo, para preencher à
   mão e atividade de análise do Professor) e o documento em seções numeradas, separando dado tabelado, medida do
   modelo, cálculo do SILM e texto do estudante. Confere edição, persistência, atualização, impressão, arquivo e atividade. */
const assert=require('node:assert/strict');
const nav=require('../integration-navigation.cjs');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
const SECTIONS=['1. Identificação','2. Proposta da investigação','3. Condições de referência','4. Medições do modelo','5. Cálculos do SILM','6. Estado da investigação','7. Observações','8. Análise / interpretação','9. Resposta à investigação','10. Conclusão','Fontes','Nota sobre o modelo'];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>{window.print=()=>{window.__printed=(window.__printed||0)+1;};});await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const start=async p=>{await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-start').click();await p.waitForFunction(()=>SILMIntegration.snapshot().investigation);};
 const toReport=async p=>{await p.evaluate(()=>{location.hash='#/relatorios';});await p.locator('.silm-report-doc').waitFor();};
 const sections=p=>p.locator('.silm-report-doc h2').allTextContents();
 const buttons=p=>p.locator('.silm-report-actions button').allTextContents();
 /* 1. Estrutura nos cinco tamanhos: ações, preparação, seções, alvos de 44 px, sem rolagem lateral, impressão sem controles. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/ambiente');await start(p);await toReport(p);
   assert.deepEqual(await buttons(p),['Atualizar dados da investigação','Registrar no Caderno','Imprimir / salvar em PDF','Imprimir para preencher à mão','Voltar à oficina']);
   assert.deepEqual(await p.locator('#report-mode option').allTextContents(),['Relatório completo','Para preencher à mão','Atividade de análise · Professor']);
   assert.deepEqual(await sections(p),SECTIONS,'Seções numeradas como no SIAB em '+where);
   const order=await p.evaluate(()=>['.silm-report-actions','.silm-report-settings','.silm-report-doc'].map(s=>document.querySelector(s).getBoundingClientRect().top));
   assert.deepEqual(order,[...order].sort((a,b)=>a-b),'Ações, preparação e documento nessa ordem em '+where);
   const m=await p.evaluate(()=>({targets:[...document.querySelectorAll('#silm-route-report button,#silm-route-report select,#silm-route-report input:not([type=checkbox])')].filter(x=>x.getClientRects().length).map(x=>x.getBoundingClientRect().height),overflow:document.documentElement.scrollWidth-innerWidth}));
   for(const t of m.targets)assert.ok(t>=43.5,'Alvos com 44 px em '+where+': '+t);
   assert.ok(m.overflow<=1,'Sem rolagem lateral em '+where+': '+m.overflow+' px');
   await p.emulateMedia({media:'print'});
   assert.equal(await p.locator('.silm-report-actions').isVisible(),false);assert.equal(await p.locator('.silm-report-settings').isVisible(),false);assert.equal(await p.locator('.silm-report-doc').isVisible(),true);
   await p.emulateMedia({media:null});
  }finally{await ctx.close();}
 }
 /* 2. Investigação livre: origem dos dados, edição e persistência, atualização, modos, análise, impressão e arquivo. */
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/ambiente');await start(p);await toReport(p);
  const conditions=await p.locator('[data-report-section="condicoes"]').innerText();
  assert.match(conditions,/Cobre \(Cu\), Z = 29\s+Dado tabelado/);assert.match(conditions,/Montagem livre, sem organização cristalina\s+Representação didática/);assert.match(conditions,/Condição de referência/);
  assert.match(await p.locator('.silm-report-model-note').innerText(),/medidas do modelo[\s\S]*não medidas de uma amostra real[\s\S]*não são resultados experimentais/);
  // Edição e persistência dos campos autorais (incluindo Análise e Resposta, novos como no SIAB).
  for(const [k,v] of [['name','Ana Souza'],['observations','A rede repete a célula.'],['analysis','Cada vértice é compartilhado.'],['answer','A estrutura é cúbica.'],['conclusion','O cobre organiza-se em CFC.']])await p.locator('#report-'+k).fill(v);
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);await p.locator('.silm-report-doc').waitFor();
  assert.equal(await p.locator('#report-analysis').inputValue(),'Cada vértice é compartilhado.');assert.equal(await p.locator('#report-answer').inputValue(),'A estrutura é cúbica.');
  // Atualizar dados: a organização feita na Oficina aparece no relatório (dado tabelado da estrutura de referência).
  await p.evaluate(()=>{location.hash='#/ambiente';});await p.locator('[data-open-dock="montagem"]').waitFor();
  if(await p.locator('#si-dock-left').isHidden())await p.locator('[data-open-dock="montagem"]').click();
  for(let i=0;i<3;i++)await p.locator('#silm-add').click();await p.locator('#silm-organize').click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.mode==='crystalline');
  await toReport(p);await p.locator('#route-report-refresh').click();await p.waitForFunction(()=>document.activeElement?.id==='route-report-refresh');
  assert.match(await p.locator('[data-report-section="condicoes"]').innerText(),/CFC[^\n]*\s+Dado tabelado/);
  // Para preencher à mão: identificação e respostas em linhas; os dados científicos continuam na folha.
  await p.locator('#report-mode').selectOption('mao');await p.waitForFunction(()=>document.activeElement?.id==='report-mode');
  assert.equal(await p.locator('.silm-report-doc').getAttribute('data-report-mode'),'mao');assert.equal(await p.locator('#report-name').count(),0,'Identificação em linhas');
  assert.equal(await p.locator('.silm-writing').count(),5);assert.equal(await p.locator('.silm-writing-line').count(),50);
  await p.locator('#report-lines').selectOption('5');assert.equal(await p.locator('.silm-writing-line').count(),25);
  assert.match(await p.locator('[data-report-section="condicoes"]').innerText(),/Dado tabelado/,'Dados científicos permanecem na folha');
  // Atividade de análise: dados escolhidos, respostas em branco escolhidas, proposta e questão.
  await p.locator('#report-mode').selectOption('analise');await p.locator('#report-include-measurements').uncheck();await p.locator('#report-blank-conclusion').uncheck();
  await p.locator('#report-proposal').fill('Compare a célula do cobre com a do ferro.');await p.locator('#report-proposal').blur();
  await p.locator('#report-question').fill('Quantos átomos há na célula?');await p.locator('#report-question').blur();
  await p.waitForFunction(()=>document.querySelector('[data-report-section="proposta"]')?.textContent.includes('Quantos átomos'));
  assert.ok(!(await sections(p)).includes('4. Medições do modelo'),'Seção excluída fica fora da folha');
  assert.equal(await p.locator('[data-author-field="conclusion"] .silm-writing').count(),0);assert.match(await p.locator('[data-author-field="conclusion"]').innerText(),/O cobre organiza-se em CFC/);
  assert.equal(await p.locator('[data-author-field="observations"] .silm-writing').count(),1);
  assert.match(await p.locator('[data-report-section="proposta"]').innerText(),/Compare a célula do cobre com a do ferro\.[\s\S]*Questão para investigar[\s\S]*Quantos átomos/);
  // Imprimir para preencher à mão muda o modo e abre a impressão; volta ao completo.
  await p.locator('#route-print-blank').click();assert.equal(await p.evaluate(()=>window.__printed),1);assert.equal(await p.locator('.silm-report-doc').getAttribute('data-report-mode'),'mao');
  await p.locator('#report-mode').selectOption('completo');assert.equal(await p.locator('#report-name').inputValue(),'Ana Souza');
  // Arquivo: registrar no Caderno e reabrir; só leitura, sem atualizar nem análise, com "Voltar ao Caderno".
  await p.locator('#route-report-notebook').click();await p.evaluate(()=>{location.hash='#/caderno';});await p.locator('.silm-notebook-entry a[href^="#/relatorios?arquivo="]').click();
  await p.waitForFunction(()=>document.getElementById('report-observations')?.readOnly===true);
  assert.deepEqual(await buttons(p),['Imprimir / salvar em PDF','Imprimir para preencher à mão','Voltar ao Caderno']);
  assert.deepEqual(await p.locator('#report-mode option').allTextContents(),['Relatório completo','Para preencher à mão']);
  assert.equal(await p.locator('#report-analysis').inputValue(),'Cada vértice é compartilhado.');
  await p.locator('#route-report-back').click();await p.waitForFunction(()=>location.hash==='#/caderno');
 }finally{await ctx.close();}
 /* 3. Missão (atividade restrita): medida do modelo identificada, sem modo de análise e Encerrar atividade no relatório.
    Roteiro (oficina livre, como no SIAB): cálculo do SILM com fórmula, entradas e origem, e o título do roteiro. */
 const act=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(act,'#/missoes?item=medida-rede');await p.locator('#mission-mount').waitFor();
  await p.locator('#mission-metal').selectOption('12');await p.locator('#mission-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await nav.viewer(p,'instrumentos');await p.locator('#silm-instrument').selectOption('latticeParameter');await p.locator('[data-close-dock="right"]').click();
  const pair=await p.evaluate(()=>{const s=SILMIntegration.snapshot(),g=SILM.crystal.geometry(SILM.data.get(s.metal.atomicNumber));for(const a of s.structure.units)for(const b of s.structure.units){const m=SILM.measurement.compute('latticeParameter',g,[a.site,b.site]);if(m.ok&&m.parameter==='a')return[a.id,b.id];}});
  for(const id of pair)await p.locator('[data-unit-id="'+id+'"]').press('Enter');await p.waitForFunction(()=>SILMIntegration.snapshot().measurements.length===1);
  await toReport(p);
  assert.deepEqual(await buttons(p),['Atualizar dados da investigação','Registrar no Caderno','Imprimir / salvar em PDF','Imprimir para preencher à mão','Voltar à oficina','Encerrar atividade']);
  assert.deepEqual(await p.locator('#report-mode option').allTextContents(),['Relatório completo','Para preencher à mão'],'Análise é preparação do Professor, fora da atividade');
  assert.match(await p.locator('[data-report-section="medicoes"]').innerText(),/Parâmetro de rede a[\s\S]*Medida do modelo/);
  await p.locator('#route-report-close').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>!SILMIntegration.activity().current&&location.hash.startsWith('#/missoes'));
  // Roteiro na oficina livre: cálculo do SILM com fórmula, entradas e origem (sem investigação livre restaurada, monta direto).
  await p.goto(base+'#/roteiros?item=volume-celula');await p.locator('#route-mount').waitFor();await p.locator('#route-metal').selectOption('26');await p.locator('#route-mount').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await nav.viewer(p,'calculos');await p.locator('#silm-formula').selectOption('cell-volume-cubic');await p.getByRole('button',{name:'Calcular',exact:true}).click();await p.locator('[data-close-dock="right"]').click();
  await toReport(p);const calc=await p.locator('[data-report-section="calculos"]').innerText();
  assert.match(calc,/Calculado pelo SILM/);assert.match(calc,/Entrada\s+Valor\s+Origem/);
  assert.equal(await p.locator('#silm-route-report h1').innerText(),'Relatório — '+await p.evaluate(()=>SILM.routes.get('volume-celula').title),'Relatório com o título do roteiro');
  assert.equal(await p.locator('#route-report-close').count(),0,'Roteiro sem Encerrar atividade');
 }finally{await act.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-REPORT: ações, preparação e 10 seções em 5 tamanhos, origem dos dados, edição e persistência, atualizar, à mão, análise, impressão, arquivo, medida do modelo, cálculo do SILM e encerrar atividade.');
};
