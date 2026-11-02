'use strict';
/* TEST-TEACHER — Etapa 11 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   Área do Professor como no SIAB 1.0.0: preparação em três etapas (atividade e identificação, recursos do aluno, gerar e
   conferir), recursos necessários travados, link que abre a tela "Atividade" do aluno, atividade restrita com os recursos
   e o metal escolhidos, biblioteca (abrir, copiar, exportar, editar, duplicar, excluir), importação JSON tudo ou nada,
   guia do professor composto com o conteúdo do SILM e imprimível, modo projetor e item no Menu. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const context=async(viewport={width:1366,height:900})=>{const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});await ctx.addInitScript(()=>{try{localStorage.setItem('silm-base-integration:tour.seen','true');}catch{}});return ctx;};
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(hash.startsWith('http')?hash:base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 /* 1. Tela nos cinco tamanhos: etapas, formulário, material e tabela de elementos. */
 for(const [width,height] of SIZES){
  const where=width+'×'+height,mobile=width<500||(width<900&&width<height);
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/professor');await p.locator('#teacher-submit').waitFor();
   const s=await p.evaluate(()=>({eyebrow:document.querySelector('[data-view="professor"] .silm-screen-head .eyebrow').textContent,title:document.getElementById('teacher-page-title').textContent,
    steps:[...document.querySelectorAll('.silm-teacher-steps li')].map(li=>li.textContent.trim()),sections:[...document.querySelectorAll('#silm-teacher-form h2')].map(h=>h.textContent),
    types:[...document.querySelectorAll('#teacher-type option')].map(o=>o.textContent),table:document.querySelectorAll('#silm-professor-table .periodic-element').length,overflow:document.documentElement.scrollWidth-innerWidth,
    small:[...document.querySelectorAll('#silm-teacher button:not([hidden]),#silm-teacher select,#silm-teacher input:not([type=checkbox]):not([type=file])')].filter(b=>b.getClientRects().length&&b.getBoundingClientRect().height<43.5).map(b=>b.id||b.textContent)}));
   assert.deepEqual({eyebrow:s.eyebrow,title:s.title},{eyebrow:'ÁREA DO PROFESSOR',title:'Preparar atividade'});
   assert.deepEqual(s.steps,['1 Escolha a atividade','2 Defina os recursos','3 Gere e confira como aluno']);
   assert.deepEqual(s.sections,['1. Atividade e identificação','2. Recursos do aluno']);assert.deepEqual(s.types,['Roteiro Experimental','Missão','Montagem pronta']);
   assert.equal(s.table,118,'Tabela de elementos com fontes');assert.deepEqual(s.small,[],'Controles com 44 px em '+where);assert.ok(s.overflow<=1,'Sem rolagem lateral em '+where+': '+s.overflow);
   // A tabela ajusta a célula depois de medir o espaço: mesmo com a célula grande (antes do ajuste), a página não alarga.
   const forced=await p.evaluate(()=>{const t=document.querySelector('#silm-professor-table .silm-periodic');t.style.setProperty('--periodic-cell','60px');const o=document.documentElement.scrollWidth-innerWidth;t.style.removeProperty('--periodic-cell');return o;});
   assert.ok(forced<=1,'Tabela antes do ajuste não alarga a página em '+where+': '+forced);
  }finally{await ctx.close();}
 }
 /* 2. Preparar, gerar, abrir como aluno (outro navegador) e conferir as restrições. */
 const teacherCtx=await context();let link;
 try{
  const p=await open(teacherCtx,'#/inicio');
  await p.locator('#nav-toggle').click();await p.locator('#si-teacher-title ~ .si-drawer-links a[href="#/professor"]').click();await p.waitForFunction(()=>location.hash==='#/professor');await p.locator('#teacher-submit').waitFor();
  // Recursos necessários ao critério ficam marcados e travados.
  await p.locator('#teacher-item').selectOption('medindo-ordem');
  assert.match(await p.locator('#teacher-requirements').innerText(),/Módulo: Medir \(fixo durante a atividade\)\.[\s\S]*metais elegíveis[\s\S]*Recursos necessários ao critério: Parâmetro de rede\./);
  assert.deepEqual(await p.locator('#teacher-tools input').evaluateAll(i=>i.map(x=>[x.value,x.checked,x.disabled])),[['distance',true,false],['latticeParameter',true,true],['coordination',true,false]]);
  await p.locator('#teacher-title-input').fill('Medida de a — 2º A');await p.locator('#teacher-metal-mode').selectOption('fixed');await p.locator('#teacher-metal').selectOption('29');
  await p.locator('#teacher-tool-coordination').uncheck();await p.locator('#teacher-id-className').fill('2º A');await p.locator('#teacher-id-teacher').fill('Ana');
  await p.locator('#teacher-submit').click();await p.locator('#teacher-result:not([hidden])').waitFor();
  assert.equal(await p.locator('#teacher-summary').textContent(),'Medida de a — 2º A · Roteiro Experimental (Medindo a Ordem) · Módulo Medir · Metal: Cobre (Cu) · Recursos: Distância, Parâmetro de rede · Navegação: Restrita à atividade');
  link=await p.locator('#teacher-link').inputValue();assert.match(link,/#\/atividade\?c=v1\.[A-Za-z0-9_-]+$/);assert.equal(await p.locator('#teacher-open').getAttribute('href'),link);
  assert.deepEqual(await p.locator('.silm-teacher-entry strong').allTextContents(),['Medida de a — 2º A']);
  // Guia do professor: seções compostas com o conteúdo do SILM, sem resposta inventada.
  await p.locator('#teacher-material-open').click();await p.waitForFunction(()=>document.getElementById('silm-teacher-guide-dialog').open);
  assert.deepEqual(await p.locator('#silm-teacher-guide-body h2').allTextContents(),['Objetivo pedagógico','O problema','Conceitos (temas do Aprender)','Preparação','Desenvolvimento','Critério de conclusão','Como interpretar (temas relacionados)','Limites do modelo','Fontes','Observação']);
  assert.match(await p.locator('#silm-teacher-guide-body').innerText(),/Registrar uma medida válida do parâmetro a\./);
  await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.getElementById('silm-teacher-guide-dialog').open);
  // Impressão: só o guia vai para o papel.
  await p.evaluate(()=>{window.__printed=null;window.print=()=>{window.__printed={printing:document.body.classList.contains('silm-printing-guide'),title:document.querySelector('#silm-guide-print h1')?.textContent};};});
  await p.locator('#teacher-print').click();assert.deepEqual(await p.evaluate(()=>window.__printed),{printing:true,title:'Medida de a — 2º A'},'O guia impresso é o da atividade do formulário');
  // Depois da impressão, a folha é limpa (assíncrono): espera a limpeza antes de conferir o layout de impressão.
  await p.waitForFunction(()=>!document.body.classList.contains('silm-printing-guide')&&!document.getElementById('silm-guide-print').childElementCount);
  await p.evaluate(()=>{document.body.classList.add('silm-printing-guide');document.getElementById('silm-guide-print').replaceChildren(Object.assign(document.createElement('h1'),{textContent:'Guia'}));});await p.emulateMedia({media:'print'});
  assert.deepEqual(await p.evaluate(()=>({sheet:getComputedStyle(document.getElementById('silm-guide-print')).display,app:getComputedStyle(document.querySelector('.app-shell')||document.body.firstElementChild).display})),{sheet:'block',app:'none'});
  await p.emulateMedia({media:'screen'});await p.evaluate(()=>{document.body.classList.remove('silm-printing-guide');document.getElementById('silm-guide-print').replaceChildren();});
  // Modo projetor espelha a preferência do Menu.
  await p.locator('#silm-teacher-projector').check();assert.equal(await p.evaluate(()=>document.getElementById('si-projector').checked),true);await p.locator('#silm-teacher-projector').uncheck();
  assert.equal(await p.evaluate(()=>document.getElementById('si-projector').checked),false);
 }finally{await teacherCtx.close();}
 const student=await context();
 try{
  const q=await open(student,link);await q.locator('#student-start').waitFor();
  const text=await q.locator('#silm-student-activity').innerText();
  assert.match(text,/ATIVIDADE PREPARADA PELO PROFESSOR/i);assert.match(text,/Medida de a — 2º A/);assert.match(text,/Metal: Cobre \(Cu\)\.[\s\S]*Recursos: Distância, Parâmetro de rede\.[\s\S]*Navegação: Restrita à atividade\.[\s\S]*Turma 2º A · Professor Ana/);
  assert.equal(await q.locator('#student-metal').count(),0,'Metal definido pelo professor: sem escolha');
  await q.locator('#student-start').click();await q.waitForFunction(()=>location.hash==='#/ambiente'&&SILMIntegration.snapshot().metal?.atomicNumber===29);
  assert.equal(await q.evaluate(()=>SILMIntegration.snapshot().module.active),'medir','Módulo fixo da atividade');
  assert.deepEqual(await q.evaluate(()=>[...document.querySelectorAll('#silm-instrument option')].map(o=>o.value).filter(Boolean)),['distance','latticeParameter'],'Só os recursos liberados');
  assert.match(await q.locator('#si-notifications').innerText(),/Atividade do professor: Medida de a — 2º A\./);
  // Navegação restrita: outra tela volta para a atividade.
  await q.evaluate(()=>{location.hash='#/caderno';});await q.waitForFunction(()=>location.hash.startsWith('#/roteiros'));
  // Identificação do professor no relatório do aluno.
  await q.evaluate(()=>{location.hash='#/relatorios';});await q.locator('.silm-report-doc').waitFor();assert.match(await q.locator('.silm-report-doc h1').textContent(),/Relatório — Medida de a — 2º A/);
  assert.deepEqual(await q.evaluate(()=>['className','teacher'].map(k=>document.getElementById('report-'+k).value)),['2º A','Ana'],'Identificação do professor no relatório');
  // Link alterado: mensagem clara, nada é iniciado.
  const r=await open(await context(),base+'#/atividade?c=v1.alterado');await r.locator('#student-activity-title').waitFor();
  assert.equal(await r.locator('#student-activity-title').textContent(),'Não foi possível abrir a atividade');assert.equal(await r.evaluate(()=>SILMIntegration.snapshot().investigation),null);await r.context().close();
 }finally{await student.close();}
 /* 3. Biblioteca: editar, duplicar, excluir, exportar e importar (tudo ou nada); escolha do metal pelo aluno; montagem pronta. */
 const lib=await context();
 try{
  const p=await open(lib,'#/professor');await p.locator('#teacher-submit').waitFor();
  await p.locator('#teacher-type').selectOption('mission');await p.locator('#teacher-item').selectOption('espaco-ocupado');
  assert.deepEqual(await p.locator('#teacher-tools input:disabled').evaluateAll(i=>i.map(x=>x.value)),['cellVolume','radius','packingFactor']);
  await p.locator('#teacher-submit').click();await p.locator('#teacher-result:not([hidden])').waitFor();const missionLink=await p.locator('#teacher-link').inputValue();
  await p.locator('#teacher-type').selectOption('preset');await p.locator('#teacher-item').selectOption('magnesio-hc');
  assert.equal(await p.locator('#teacher-tools').isHidden(),true,'Montagem pronta: sem recursos a restringir');await p.locator('#teacher-submit').click();await p.locator('#teacher-result:not([hidden])').waitFor();
  const presetLink=await p.locator('#teacher-link').inputValue();
  assert.deepEqual(await p.locator('.silm-teacher-entry strong').allTextContents(),['Magnésio · HC','Quanto Espaço Está Ocupado?']);
  // Editar: o formulário volta com a configuração; salvar mantém o identificador.
  await p.locator('.silm-teacher-entry').nth(1).getByRole('button',{name:'Editar'}).click();assert.equal(await p.locator('#teacher-submit').textContent(),'Salvar alterações');
  assert.equal(await p.locator('#teacher-item').inputValue(),'espaco-ocupado');await p.locator('#teacher-title-input').fill('Empacotamento — revisão');await p.locator('#teacher-submit').click();
  await p.waitForFunction(()=>[...document.querySelectorAll('.silm-teacher-entry strong')].map(s=>s.textContent).join('|')==='Magnésio · HC|Empacotamento — revisão');
  // Duplicar e excluir (com confirmação).
  await p.locator('.silm-teacher-entry').nth(1).getByRole('button',{name:'Duplicar'}).click();await p.waitForFunction(()=>document.querySelectorAll('.silm-teacher-entry').length===3);
  assert.equal(await p.locator('.silm-teacher-entry strong').first().textContent(),'Cópia de Empacotamento — revisão');
  await p.locator('.silm-teacher-entry').first().getByRole('button',{name:'Excluir'}).click();await p.locator('#si-modal-cancel').click();assert.equal(await p.locator('.silm-teacher-entry').count(),3,'Cancelar não exclui');
  await p.locator('.silm-teacher-entry').first().getByRole('button',{name:'Excluir'}).click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>document.querySelectorAll('.silm-teacher-entry').length===2);
  // Exportar todas → importar o mesmo arquivo: duas atividades novas; arquivo inválido não altera nada.
  const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#teacher-export-all').click()]);const exported=JSON.parse(require('node:fs').readFileSync(await download.path(),'utf8'));
  assert.equal(exported.format,'silm-teacher-activities');assert.equal(exported.activities.length,2);
  await p.locator('#teacher-import').setInputFiles({name:'atividades.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await p.waitForFunction(()=>document.querySelectorAll('.silm-teacher-entry').length===4);
  const broken={...exported,activities:[exported.activities[0],{...exported.activities[1],tools:[]}]};
  await p.locator('#teacher-import').setInputFiles({name:'ruim.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(broken))});
  await p.waitForFunction(()=>/Importação recusada: Atividade 2 do arquivo: Faltam recursos necessários/.test(document.getElementById('si-notifications').innerText));assert.equal(await p.locator('.silm-teacher-entry').count(),4,'Arquivo inválido não altera a biblioteca');
  await p.locator('#teacher-import').setInputFiles({name:'texto.json',mimeType:'application/json',buffer:Buffer.from('não é json')});
  await p.waitForFunction(()=>/O arquivo não é um JSON válido/.test(document.getElementById('si-notifications').innerText));assert.equal(await p.locator('.silm-teacher-entry').count(),4);
  // Persistência: a biblioteca volta depois de recarregar.
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);await p.locator('.silm-teacher-entry').first().waitFor();assert.equal(await p.locator('.silm-teacher-entry').count(),4);
  // Aluno escolhe o metal (missão com todos os metais elegíveis).
  const s=await context();try{const q=await open(s,missionLink);await q.locator('#student-metal').waitFor();assert.equal(await q.locator('#student-metal option').count(),53);
   await q.locator('#student-metal').selectOption('26');await q.locator('#student-start').click();await q.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===26&&location.hash==='#/ambiente');}finally{await s.close();}
  // Montagem pronta pelo link.
  const m=await context();try{const q=await open(m,presetLink);await q.locator('#student-start').click();await q.waitForFunction(()=>SILMIntegration.snapshot().structure?.crystallography?.structureType==='HCP');}finally{await m.close();}
 }finally{await lib.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-TEACHER: Área do Professor em 5 tamanhos, recursos necessários travados, link e tela do aluno, atividade restrita (metal, módulo, recursos, navegação, identificação), link alterado, guia composto e impresso, projetor, Menu, biblioteca (editar, duplicar, excluir, exportar, importar tudo ou nada, persistência), escolha de metal e montagem pronta.');
};
