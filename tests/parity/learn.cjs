'use strict';
/* TEST-LEARN — Etapa 2 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   Aprender como o SIAB 1.0.0 organiza: lista "Temas" com uma linha por tema (título, resumo, situação à direita) e o
   tema em coluna de leitura (sobretítulo, título, ideia principal, ações). O SILM acrescenta conteúdo relacionado,
   aprofundamento e fontes. Confere também retorno com foco, marcador "revisado" sem pontos e "Investigar na oficina",
   que prepara o metal sem iniciar nem substituir uma investigação. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const visible=(p,sel)=>p.locator(sel).first().waitFor({state:'visible',timeout:4000});
 /* 1. Lista e tema nos cinco tamanhos do plano. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/aprender');await visible(p,'#silm-themes .silm-content-row');
   const list=await p.evaluate(()=>{const v=document.querySelector('#conteudo > [data-view="aprender"]'),r=el=>el.getBoundingClientRect();
    return {h1:v.querySelector('#silm-themes-head h1').textContent.trim(),intro:v.querySelector('#silm-themes-head p').textContent.trim(),
     registry:SILM.themes.registry.map(t=>({id:t.id,title:t.title})),
     rows:[...v.querySelectorAll('.silm-content-row')].map(a=>{const s=a.querySelector('.silm-row-status');return {href:a.getAttribute('href'),id:a.id,title:a.querySelector('strong').textContent.trim(),
      summary:a.querySelector('small').textContent.trim(),status:s.textContent.trim(),h:r(a).height,statusRight:r(a).right-r(s).right,column:getComputedStyle(a).flexDirection==='column'};}),
     overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(list.h1,'Temas',where);assert.equal(list.intro,'Escolha um tema. Todos permanecem disponíveis para revisitar.',where);
   assert.deepEqual(list.rows.map(r=>r.href),list.registry.map(t=>'#/aprender?tema='+t.id),'Uma linha por tema, na ordem do catálogo, em '+where);
   for(const [i,row] of list.rows.entries()){assert.equal(row.title,list.registry[i].title);assert.equal(row.id,'theme-card-'+list.registry[i].id);assert.ok(row.summary.length>10,'Resumo curto em '+row.title);
    assert.equal(row.status,'Não revisado',row.title);assert.ok(row.h>=44,'Linha com alvo de 44 px em '+where);if(!row.column)assert.ok(row.statusRight<=24,'Situação à direita em '+row.title+' ('+where+')');}
   assert.ok(list.overflow<=1,'Lista sem rolagem lateral em '+where+': '+list.overflow+' px');
   await p.goto(base+'#/aprender?tema=ligacao-metalica');await visible(p,'#theme-title');
   const detail=await p.evaluate(()=>{const v=document.querySelector('#conteudo > [data-view="aprender"]'),t=SILM.themes.get('ligacao-metalica');
    return {headHidden:document.getElementById('silm-themes-head').hidden,eyebrow:v.querySelector('.silm-reading .eyebrow').textContent.trim(),h1:document.getElementById('theme-title').textContent.trim(),
     lead:v.querySelector('.silm-lead').textContent.trim(),idea:t.concepts.find(c=>c.title==='Ideia principal').text,title:t.title,
     actions:[...v.querySelectorAll('.silm-actions > *')].map(b=>b.textContent.trim()),targets:[...v.querySelectorAll('.silm-actions > *, .silm-related a, #theme-back')].map(b=>b.getBoundingClientRect().height),
     overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(detail.headHidden,true,'No tema, o cabeçalho da lista sai (como a tela de tema do SIAB) em '+where);
   assert.equal(detail.eyebrow,'APRENDER · TEMA');assert.equal(detail.h1,detail.title);assert.equal(detail.lead,detail.idea,'Ideia principal como linha de abertura');
   assert.deepEqual(detail.actions,['Investigar na oficina','Marcar como revisado'],where);
   for(const h of detail.targets)assert.ok(h>=44,'Ações e conexões com alvo de 44 px em '+where+': '+h);
   assert.ok(detail.overflow<=1,'Tema sem rolagem lateral em '+where+': '+detail.overflow+' px');
  }finally{await ctx.close();}
 }
 /* 2. Navegação, retorno, marcador, conexões e tema inexistente. */
 const ctx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/inicio');
  await p.locator('a[data-route="aprender"]:visible').first().click();await p.waitForFunction(()=>document.activeElement?.textContent.trim()==='Temas','',{timeout:4000});
  await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'theme-card-ligacao-metalica','Depois do título, o primeiro Tab é o primeiro tema');
  await p.keyboard.press('Enter');await p.waitForFunction(()=>document.activeElement?.id==='theme-title','',{timeout:4000});
  assert.equal(await p.evaluate(()=>location.hash),'#/aprender?tema=ligacao-metalica');assert.equal(await p.evaluate(()=>scrollY),0);
  // Conexões: todo link leva a uma missão ou roteiro do catálogo, com o título dele (sem links vazios).
  const links=await p.evaluate(()=>[...document.querySelectorAll('.silm-related a')].map(a=>({text:a.textContent.trim(),href:a.getAttribute('href')})));
  const t=await p.evaluate(()=>{const t=SILM.themes.get('ligacao-metalica');return {missions:t.relatedMissions.map(id=>({text:SILM.missions.get(id).title,href:'#/missoes?item='+id})),routes:t.relatedRoutes.map(id=>({text:SILM.routes.get(id).title,href:'#/roteiros?item='+id}))};});
  assert.deepEqual(links,[...t.missions,...t.routes]);
  // Marcar como revisado: não sai do botão, não cria pontos nem porcentagem, persiste e pode ser desfeito.
  await p.locator('#theme-complete').click();await p.waitForFunction(()=>document.getElementById('theme-complete')?.getAttribute('aria-pressed')==='true');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'theme-complete','O foco continua no botão');
  assert.equal(await p.locator('#theme-complete').innerText(),'Revisado · desmarcar');
  assert.ok(!/\d+\s*%|pontos|ranking|xp\b/i.test(await p.locator('#conteudo > [data-view="aprender"]').innerText()),'Sem pontos, ranking ou porcentagem');
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);await visible(p,'#theme-complete');assert.equal(await p.locator('#theme-complete').getAttribute('aria-pressed'),'true','Marcador persistido');
  // Retorno: "Todos os temas" e o Voltar do navegador devolvem a lista com o foco no tema aberto.
  await p.locator('#theme-back').click();await p.waitForFunction(()=>document.activeElement?.id==='theme-card-ligacao-metalica','',{timeout:4000});
  assert.equal(await p.locator('#theme-card-ligacao-metalica .silm-row-status').innerText(),'Revisado');
  await p.locator('#theme-card-estruturas-cristalinas').click();await p.waitForFunction(()=>document.activeElement?.id==='theme-title','',{timeout:4000});
  await p.goBack();await p.waitForFunction(()=>document.activeElement?.id==='theme-card-estruturas-cristalinas','',{timeout:4000});
  await p.goto(base+'#/aprender?tema=ligacao-metalica');await visible(p,'#theme-complete');await p.locator('#theme-complete').click();await p.waitForFunction(()=>document.getElementById('theme-complete')?.getAttribute('aria-pressed')==='false');
  // Tema inexistente: volta à lista, sem tela vazia.
  await p.goto(base+'#/aprender?tema=nao-existe');await visible(p,'#silm-themes .silm-content-row');assert.equal(await p.locator('#silm-themes-head').isVisible(),true);
 }finally{await ctx.close();}
 /* 3. Investigar na oficina prepara o metal representativo; a investigação só começa com Iniciar e nunca é substituída sem confirmação. */
 const ictx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 try{
  const p=await open(ictx,'#/aprender?tema=ligacao-metalica');await visible(p,'#theme-investigate');
  const z=await p.evaluate(()=>SILM.themes.get('ligacao-metalica').relatedMetals[0]);
  await p.locator('#theme-investigate').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await p.waitForFunction(()=>document.querySelector('[data-open-dock="montagem"]')?.getAttribute('aria-expanded')==='true','',{timeout:4000});
  assert.equal(await p.locator('#silm-metal').inputValue(),String(z),'Metal representativo preparado na Montagem');
  assert.equal(await p.evaluate(()=>SILMIntegration.snapshot().investigation),null,'Nenhuma investigação iniciada sem Iniciar');
  // Com uma investigação de outro metal em andamento, Investigar só prepara: nada é substituído e nenhum diálogo aparece.
  const other=z===26?29:26;await p.locator('#silm-metal').selectOption(String(other));await p.locator('#silm-start').click();
  await p.waitForFunction(o=>SILMIntegration.snapshot().metal?.atomicNumber===o,other);
  await p.goto(base+'#/aprender?tema=ligacao-metalica');await visible(p,'#theme-investigate');await p.locator('#theme-investigate').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await p.waitForFunction(v=>document.getElementById('silm-metal').value===v,String(z),{timeout:4000});
  assert.equal(await p.evaluate(()=>SILMIntegration.snapshot().metal.atomicNumber),other,'Investigação em andamento preservada');
  assert.equal(await p.locator('dialog[open]').count(),0,'Sem diálogo de substituição');
 }finally{await ictx.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-LEARN: lista e tema na arquitetura do SIAB em 5 tamanhos, teclado, retorno com foco, revisado persistente sem pontos, conexões válidas, tema inexistente e Investigar na oficina sem substituir investigação.');
};
