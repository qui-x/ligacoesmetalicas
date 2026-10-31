'use strict';
/* TEST-MISSION — Etapa 3 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   Missões como o SIAB 1.0.0 organiza: lista de linhas com situação ("Não realizado"/"Concluído"), especificação em coluna
   de leitura e, na Oficina, o painel da missão (problema, objetivo e regras, evidência acompanhada, conclusão escrita,
   retorno). Confere sessão, retomada após recarregar, evidência ao vivo, conclusão no Caderno, repetição e restrição. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const visible=(p,sel)=>p.locator(sel).first().waitFor({state:'visible',timeout:4000});
 /* 1. Lista e especificação nos cinco tamanhos do plano. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/missoes');await visible(p,'#silm-mission-catalog .silm-content-row');
   const list=await p.evaluate(()=>{const v=document.querySelector('#conteudo > [data-view="missoes"]'),r=el=>el.getBoundingClientRect();
    return {h1:v.querySelector('#silm-missions-head h1').textContent.trim(),registry:SILM.missions.registry.map(m=>({id:m.id,title:m.title})),
     rows:[...v.querySelectorAll('.silm-content-row')].map(a=>({href:a.getAttribute('href'),id:a.id,title:a.querySelector('strong').textContent.trim(),status:a.querySelector('.silm-row-status').textContent.trim(),h:r(a).height})),
     overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(list.h1,'Missões',where);
   assert.deepEqual(list.rows.map(r=>r.href),list.registry.map(m=>'#/missoes?item='+m.id),'Uma linha por missão, na ordem do catálogo, em '+where);
   for(const [i,row] of list.rows.entries()){assert.equal(row.title,list.registry[i].title);assert.equal(row.id,'mission-card-'+list.registry[i].id);assert.equal(row.status,'Não realizado');assert.ok(row.h>=44,'Alvo de 44 px em '+where);}
   assert.ok(list.overflow<=1,'Lista sem rolagem lateral em '+where+': '+list.overflow+' px');
   await p.goto(base+'#/missoes?item=montagem-ordem');await visible(p,'#mission-title');
   const d=await p.evaluate(()=>{const v=document.querySelector('#conteudo > [data-view="missoes"]');return {headHidden:document.getElementById('silm-missions-head').hidden,eyebrow:v.querySelector('.silm-reading .eyebrow').textContent.trim(),
    h2:[...v.querySelectorAll('.silm-reading h2')].map(h=>h.textContent.trim()),start:document.getElementById('mission-mount')?.textContent.trim(),select:!!document.querySelector('label[for="mission-metal"]'),
    targets:[...v.querySelectorAll('.silm-actions .button,.silm-related a,#mission-back,#mission-metal')].map(b=>b.getBoundingClientRect().height),overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(d.headHidden,true,where);assert.equal(d.eyebrow,'MISSÃO · Não realizado');assert.deepEqual(d.h2.slice(0,2),['O problema','Objetivo e regras'],where);
   assert.equal(d.start,'Iniciar missão');assert.equal(d.select,true,'Metal da investigação rotulado');
   for(const h of d.targets)assert.ok(h>=44,'Ações com alvo de 44 px em '+where+': '+h);
   assert.ok(d.overflow<=1,'Especificação sem rolagem lateral em '+where+': '+d.overflow+' px');
  }finally{await ctx.close();}
 }
 /* 2. Ciclo completo: abrir, iniciar, evidência ao vivo, conclusão guardada, recarregar, concluir, Caderno, refazer e restrição. */
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/missoes');await visible(p,'#mission-card-vizinhos-metal');
  await p.locator('#mission-card-vizinhos-metal').click();await p.waitForFunction(()=>document.activeElement?.id==='mission-title','',{timeout:4000});
  await p.goto(base+'#/missoes?item=nao-existe');await visible(p,'#silm-mission-catalog .silm-content-row');assert.equal(await p.locator('#silm-missions-head').isVisible(),true,'Missão inexistente volta à lista');
  await p.goto(base+'#/missoes?item=vizinhos-metal');await visible(p,'#mission-mount');await p.locator('#mission-metal').selectOption('29');
  await p.locator('#mission-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  const panel=async()=>{if(await p.locator('#si-dock-left').isHidden())await p.locator('[data-open-dock="montagem"]').click();const tab=p.locator('[data-left-tab="missao"]');if(await tab.getAttribute('aria-pressed')!=='true')await tab.click();await visible(p,'#mission-conclusion');};
  await panel();
  assert.equal(await p.locator('[data-left-tab="missao"]').innerText(),'Missão','A aba diz Missão durante uma missão');
  assert.match(await p.locator('#silm-route-guidance .eyebrow').innerText(),/MISSÃO · EM ANDAMENTO/i);
  assert.equal(await p.locator('#silm-route-guidance .silm-evidence li strong').innerText(),'Pendente');assert.equal(await p.locator('#mission-complete').isDisabled(),true);
  // Restrição: fora do contexto, outra tela volta para a missão.
  await p.evaluate(()=>{location.hash='#/aprender';});await p.waitForFunction(()=>location.hash==='#/missoes?item=vizinhos-metal');await p.goto(base+'#/ambiente');await panel();
  // Conclusão: guardada na sessão a cada digitação e preservada depois de recarregar.
  const text='Cada centro do CFC tem 12 vizinhos imediatos no modelo.';await p.locator('#mission-conclusion').fill(text);
  await p.waitForFunction(t=>SILMIntegration.activity().current?.report?.conclusion===t,text);
  // Depois de recarregar, o SILM abre a especificação da missão com "Retomar na oficina" (mesmo ciclo dos roteiros).
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);await visible(p,'#mission-resume');assert.equal(await p.locator('#mission-resume').innerText(),'Retomar na oficina');
  assert.match(await p.locator('.silm-reading .eyebrow').innerText(),/Em andamento/i);await p.locator('#mission-resume').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await panel();assert.equal(await p.locator('#mission-conclusion').inputValue(),text,'Conclusão retomada depois de recarregar');
  // Evidência ao vivo: selecionar um centro e mostrar a vizinhança atende o critério; o campo de conclusão não perde o foco nos redesenhos.
  for(let k=0;k<3;k++){await p.locator('.silm-crystal-unit').first().press('Enter');try{await p.waitForFunction(()=>!!SILMIntegration.snapshot().structure?.crystallography?.representation.selectedUnitId,null,{timeout:2000});break;}catch{}}
  await p.locator('#silm-crystal-neighbors').click();await panel();
  await p.waitForFunction(()=>document.querySelector('#silm-route-guidance .silm-evidence li')?.dataset.met==='true','',{timeout:4000});
  assert.equal(await p.locator('#silm-route-guidance .silm-evidence li strong').innerText(),'Atendida');assert.equal(await p.locator('#mission-complete').isEnabled(),true);
  await p.locator('#mission-conclusion').focus();await p.keyboard.type(' Ok.');await p.waitForTimeout(300);
  assert.equal(await p.evaluate(()=>document.activeElement?.id),'mission-conclusion','O campo de conclusão mantém o foco');
  await p.locator('#mission-complete').click();await p.waitForFunction(()=>SILMIntegration.activity().current?.activityContext.status==='completed');
  await visible(p,'#mission-feedback');assert.match(await p.locator('#mission-feedback').innerText(),/Concluído/);assert.equal(await p.locator('#mission-conclusion').isDisabled(),true);
  await p.locator('#mission-close').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>!SILMIntegration.activity().current);
  // Caderno: o registro da missão concluída leva a conclusão do estudante.
  await p.goto(base+'#/caderno');await p.waitForFunction(t=>document.getElementById('silm-notebook')?.innerText.includes(t),'Conclusão do estudante: '+text+' Ok.',{timeout:4000});
  // Lista e especificação mostram a conclusão e permitem refazer.
  await p.goto(base+'#/missoes');await visible(p,'#mission-card-vizinhos-metal');assert.equal(await p.locator('#mission-card-vizinhos-metal .silm-row-status').innerText(),'Concluído');
  await p.locator('#mission-card-vizinhos-metal').click();await visible(p,'#mission-mount');assert.equal(await p.locator('#mission-mount').innerText(),'Refazer missão');
  await p.locator('#mission-back').click();await p.waitForFunction(()=>document.activeElement?.id==='mission-card-vizinhos-metal','',{timeout:4000});
 }finally{await ctx.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-MISSION: lista e especificação em 5 tamanhos, foco, missão inexistente, painel com evidência ao vivo, conclusão guardada e retomada, conclusão no Caderno, refazer e restrição.');
};
