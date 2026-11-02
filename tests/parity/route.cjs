'use strict';
/* TEST-ROUTE — Etapa 4 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   Roteiros como o SIAB 1.0.0 organiza: lista com o módulo à direita; roteiro em coluna de leitura (problema, objetivo,
   o que você vai fazer, na oficina/bancada, o que observar) com identificação antes de montar. Montar prepara a oficina
   livre, sem trava, e o estudante termina no relatório, que traz o roteiro e a identificação. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
const SECTIONS=['O problema','Objetivo','O que você vai fazer','Na oficina','O que observar','Evidência esperada'];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const visible=(p,sel)=>p.locator(sel).first().waitFor({state:'visible',timeout:4000});
 /* 1. Lista e roteiro nos cinco tamanhos do plano. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/roteiros');await visible(p,'#silm-route-catalog .silm-content-row');
   const list=await p.evaluate(()=>{const v=document.querySelector('#conteudo > [data-view="roteiros"]'),r=el=>el.getBoundingClientRect(),names={explorar:'Explorar',medir:'Medir',calcular:'Calcular'};
    return {h1:v.querySelector('#silm-routes-head h1').textContent.trim(),registry:SILM.routes.registry.map(x=>({id:x.id,title:x.title,module:names[x.module]})),
     rows:[...v.querySelectorAll('.silm-content-row')].map(a=>({href:a.getAttribute('href'),id:a.id,title:a.querySelector('strong').textContent.trim(),status:a.querySelector('.silm-row-status').textContent.trim(),h:r(a).height})),
     overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(list.h1,'Roteiros Experimentais',where);
   assert.deepEqual(list.rows.map(r=>r.href),list.registry.map(x=>'#/roteiros?item='+x.id),'Uma linha por roteiro, na ordem do catálogo, em '+where);
   for(const [i,row] of list.rows.entries()){assert.equal(row.title,list.registry[i].title);assert.equal(row.id,'route-card-'+list.registry[i].id);assert.equal(row.status,list.registry[i].module,'Módulo à direita, como no SIAB');assert.ok(row.h>=44,'Alvo de 44 px em '+where);}
   assert.ok(list.overflow<=1,'Lista sem rolagem lateral em '+where+': '+list.overflow+' px');
   await p.goto(base+'#/roteiros?item=ordem-metal');await visible(p,'#route-title');
   const d=await p.evaluate(()=>{const v=document.querySelector('#conteudo > [data-view="roteiros"]');return {headHidden:document.getElementById('silm-routes-head').hidden,
    h2:[...v.querySelectorAll('.silm-reading section > h2')].map(h=>h.textContent.trim()),legend:v.querySelector('.silm-identity legend')?.textContent.trim(),
    fields:[...v.querySelectorAll('.silm-identity label')].map(l=>({text:l.textContent.trim(),ok:!!document.getElementById(l.htmlFor)})),metal:!!v.querySelector('label[for="route-metal"]'),
    mount:document.getElementById('route-mount')?.textContent.trim(),targets:[...v.querySelectorAll('.silm-identity input,#route-metal,.silm-actions .button,#route-back')].map(b=>b.getBoundingClientRect().height),
    overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(d.headHidden,true,where);assert.deepEqual(d.h2.slice(0,SECTIONS.length),SECTIONS,'Seções do roteiro na ordem do SIAB em '+where);
   assert.equal(d.legend,'Identificação');assert.deepEqual(d.fields.map(f=>f.text),['Nome','Turma','Data','Professor','Grupo']);assert.ok(d.fields.every(f=>f.ok),'Campos rotulados');
   assert.equal(d.metal,true);assert.equal(d.mount,'Montar na oficina');
   for(const h of d.targets)assert.ok(h>=44,'Campos e ações com alvo de 44 px em '+where+': '+h);
   assert.ok(d.overflow<=1,'Roteiro sem rolagem lateral em '+where+': '+d.overflow+' px');
  }finally{await ctx.close();}
 }
 /* 2. Como no SIAB: montar prepara a oficina livre (módulo inicial do roteiro, sem trava), a identificação vai para o relatório e a lista mostra o roteiro montado. */
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/roteiros');
  assert.ok(await p.evaluate(()=>SILM.routes.registry.every(r=>['explorar','medir','calcular'].includes(r.module)&&r.secondaryModule===undefined)),'Cada roteiro indica exatamente um módulo inicial');
  await p.locator('#route-card-ordem-metal').click();await p.waitForFunction(()=>document.activeElement?.id==='route-title','',{timeout:4000});
  await p.goto(base+'#/roteiros?item=nao-existe');await visible(p,'#silm-route-catalog .silm-content-row');assert.equal(await p.locator('#silm-routes-head').isVisible(),true,'Roteiro inexistente volta à lista');
  await p.goto(base+'#/roteiros?item=ordem-metal');await visible(p,'#route-mount');
  const id={name:'Ana Souza',className:'2º A',teacher:'Prof. Lima',group:'3'};
  for(const [k,v] of Object.entries(id))await p.locator('#route-id-'+k).fill(v);await p.locator('#route-id-date').fill('2026-10-31');await p.locator('#route-metal').selectOption('29');
  await p.locator('#route-mount').click();await p.waitForFunction(()=>location.hash==='#/ambiente');// Sem investigação: monta direto.
  assert.equal(await p.evaluate(()=>SILMIntegration.activity().current),null,'Sem atividade restrita');assert.equal(await p.evaluate(()=>SILMIntegration.snapshot().module.active),'explorar','Módulo inicial do roteiro');
  // Sem painel de atividade nem trava: a aba da atividade não aparece e as outras telas abrem.
  assert.equal(await p.locator('[data-left-tab="missao"]').isVisible(),false,'Sem painel de atividade');
  await p.evaluate(()=>{location.hash='#/missoes';});await visible(p,'#silm-mission-catalog .silm-content-row');assert.equal(await p.evaluate(()=>location.hash),'#/missoes');
  // Relatório: a identificação e o título do roteiro.
  await p.evaluate(()=>{location.hash='#/relatorios';});await visible(p,'#report-name');
  assert.equal(await p.locator('#silm-route-report h1').innerText(),'Relatório — '+await p.evaluate(()=>SILM.routes.get('ordem-metal').title));
  assert.equal(await p.locator('#report-name').inputValue(),id.name);assert.equal(await p.locator('#report-className').inputValue(),id.className);assert.equal(await p.locator('#report-teacher').inputValue(),id.teacher);assert.equal(await p.locator('#report-group').inputValue(),id.group);assert.equal(await p.locator('#report-date').inputValue(),'31/10/2026','Data no formato do relatório');
  assert.equal(await p.locator('#silm-route-report .silm-identity legend').textContent(),'Identificação','Relatório com o bloco de identificação');
  // A lista mostra o roteiro montado; a identificação fica guardada para a próxima montagem.
  await p.goto(base+'#/roteiros');await visible(p,'#route-card-ordem-metal');assert.equal(await p.locator('#route-card-ordem-metal .silm-row-status').innerText(),'Explorar · Montado na oficina');
  await p.goto(base+'#/roteiros?item=volume-celula');await visible(p,'#route-id-name');assert.equal(await p.locator('#route-id-name').inputValue(),id.name);assert.equal(await p.locator('#route-id-date').inputValue(),'2026-10-31');
  await p.locator('#route-back').click();await p.waitForFunction(()=>document.activeElement?.id==='route-card-volume-celula','',{timeout:4000});
 }finally{await ctx.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-ROUTE: lista e roteiro em 5 tamanhos, módulo inicial, montagem na oficina livre sem trava, identificação e título do roteiro no relatório, roteiro montado na lista e retorno com foco.');
};
