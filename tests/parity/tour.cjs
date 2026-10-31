'use strict';
/* TEST-TOUR — Etapa 10 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   Tour da oficina e ajuda contextual como no SIAB 1.0.0: aviso de primeira visita, coachmark em cinco passos sobre
   controles reais (Pular, Voltar, Próximo, Concluir, Escape, foco), entrada pelo Menu e pelo Manual, bloqueio durante
   atividade e o botão "?" das docas ligado ao tópico certo do Manual. */
const assert=require('node:assert/strict');
const nav=require('../integration-navigation.cjs');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const tourOpen=p=>p.waitForFunction(()=>document.getElementById('silm-tour').open&&document.activeElement?.id==='silm-tour-next','',{timeout:4000});
 const state=p=>p.evaluate(()=>{const d=document.getElementById('silm-tour'),ring=d.querySelector('.si-coach-ring'),card=d.querySelector('.si-coach-card').getBoundingClientRect(),r=ring.getBoundingClientRect();
  return {step:document.getElementById('silm-tour-step').textContent,title:document.getElementById('silm-tour-title').textContent,ring:!ring.hidden&&r.width>0&&r.height>0,
   inside:card.left>=0&&card.top>=0&&card.right<=innerWidth+1&&card.bottom<=innerHeight+1,back:!document.getElementById('silm-tour-back').hidden,next:document.getElementById('silm-tour-next').textContent,
   dots:[...document.querySelectorAll('#silm-tour-dots span')].map(s=>s.classList.contains('current'))};});
 /* 1. Primeira visita e tour completo nos cinco tamanhos. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/ambiente');await p.locator('.silm-welcome').waitFor();
   assert.match(await p.locator('.silm-welcome').innerText(),/Primeira vez na Oficina\?/);
   assert.deepEqual(await p.locator('.silm-welcome .button').allTextContents(),['Fazer o tour','Abrir o manual','Agora não']);
   for(const h of await p.locator('.silm-welcome .button').evaluateAll(b=>b.map(x=>x.getBoundingClientRect().height)))assert.ok(h>=43.5,'Botões do aviso com 44 px em '+where);
   await p.getByRole('button',{name:'Fazer o tour'}).click();await tourOpen(p);
   const titles=[];
   for(let i=0;i<5;i++){await p.waitForTimeout(80);const s=await state(p);titles.push(s.title);
    assert.equal(s.step,'PASSO '+(i+1)+' DE 5');assert.equal(s.ring,true,'Contorno sobre um controle real no passo '+(i+1)+' em '+where);assert.equal(s.inside,true,'Cartão dentro da tela no passo '+(i+1)+' em '+where);
    assert.equal(s.back,i>0);assert.equal(s.next,i===4?'Concluir':'Próximo');assert.deepEqual(s.dots,[0,1,2,3,4].map(k=>k===i));
    if(i<4)await p.locator('#silm-tour-next').click();}
   assert.deepEqual(titles,['Prepare a oficina','Escolha um módulo','Monte a estrutura','Observe','Investigue e consulte os dados']);
   await p.locator('#silm-tour-back').click();assert.equal((await state(p)).step,'PASSO 4 DE 5','Voltar');
   // O evento "close" do <dialog> chega depois de open=false: espera a limpeza (aviso e docas) terminar.
   await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.getElementById('silm-tour').open&&!document.querySelector('.silm-welcome')&&document.getElementById('si-dock-left').hidden&&document.getElementById('si-dock-right').hidden,'',{timeout:4000});
   const after=await p.evaluate(()=>({welcome:!!document.querySelector('.silm-welcome'),docks:['left','right'].map(s=>document.getElementById('si-dock-'+s).hidden),focus:document.activeElement!==document.body&&document.activeElement.getClientRects().length>0}));
   assert.equal(after.welcome,false,'O aviso sai depois do tour');assert.deepEqual(after.docks,[true,true],'O tour fecha as docas que abriu');assert.equal(after.focus,true,'Foco volta para um controle visível em '+where);
   await p.reload();await p.waitForFunction(()=>window.SILMIntegration);await p.locator('.si-empty-state').waitFor();assert.equal(await p.locator('.silm-welcome').count(),0,'O aviso não volta');
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'Sem rolagem lateral em '+where);
  }finally{await ctx.close();}
 }
 /* 2. Docas no computador, Pular, entrada pelo Menu e pelo Manual, "Agora não" e visita ao Manual. */
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/inicio');
  await p.locator('#nav-toggle').click();assert.deepEqual(await p.locator('#si-resources-title + .si-drawer-links .si-drawer-item').allTextContents(),['Tour da oficina']);
  await p.locator('#silm-tour-open').click();await p.waitForFunction(()=>location.hash==='#/ambiente');await tourOpen(p);
  const tab=t=>p.waitForFunction(t=>!document.getElementById('si-dock-left').hidden&&document.querySelector('[data-left-tab="'+t+'"]')?.getAttribute('aria-pressed')==='true',t,{timeout:4000});
  await tab('preparo');// Passo 1 abre Montagem → Preparo.
  await p.locator('#silm-tour-next').click();await tab('modulo');// Passo 2 mostra Montagem → Módulo.
  for(let i=0;i<3;i++)await p.locator('#silm-tour-next').click();await p.waitForFunction(()=>!document.getElementById('si-dock-right').hidden,'',{timeout:4000});// Passo 5 abre Ver.
  await p.locator('#silm-tour-skip').click();await p.waitForFunction(()=>!document.getElementById('silm-tour').open&&document.getElementById('si-dock-right').hidden);
  // Manual: "Iniciar tour da oficina".
  await p.evaluate(()=>{location.hash='#/manual';});await p.locator('#manual-tour').click();await p.waitForFunction(()=>location.hash==='#/ambiente');await tourOpen(p);await p.keyboard.press('Escape');
  await p.waitForFunction(()=>!document.getElementById('silm-tour').open&&document.getElementById('si-dock-left').hidden&&document.getElementById('si-dock-right').hidden,'',{timeout:4000});
  // Outro navegador: "Agora não" e visita ao Manual também encerram o aviso.
  const fresh=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
  try{const q=await open(fresh,'#/ambiente');await q.getByRole('button',{name:'Agora não'}).click();assert.equal(await q.locator('.silm-welcome').count(),0);
   assert.equal(await q.evaluate(()=>document.activeElement?.textContent),'Abrir Montagem','Foco vai para a primeira ação do estado vazio');
   await q.reload();await q.waitForFunction(()=>window.SILMIntegration);await q.locator('.si-empty-state').waitFor();assert.equal(await q.locator('.silm-welcome').count(),0);}finally{await fresh.close();}
  const fresh2=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
  try{const q=await open(fresh2,'#/manual');await q.locator('.silm-manual-card').first().waitFor();await q.evaluate(()=>{location.hash='#/ambiente';});await q.locator('.si-empty-state').waitFor();assert.equal(await q.locator('.silm-welcome').count(),0,'Visitar o Manual conta como já visto');}finally{await fresh2.close();}
  /* 3. Ajuda "?" das docas: tópico do que o painel mostra agora. */
  const help=async side=>{await p.locator('[data-dock-help="'+side+'"]').click();await p.waitForFunction(()=>document.getElementById('silm-help-dialog').open);
   const r={title:await p.locator('#silm-help-title').textContent(),href:await p.locator('#silm-help-manual').getAttribute('href')};await p.keyboard.press('Escape');
   await p.waitForFunction(s=>!document.getElementById('silm-help-dialog').open&&document.activeElement?.dataset.dockHelp===s,side,{timeout:4000});return r;};
  const topicTitle=id=>p.evaluate(id=>SILM.manual.topics.find(t=>t.id===id).title,id);
  await p.locator('[data-open-dock="montagem"]').click();
  for(const [tab,topic] of [['preparo','selecionar-metal'],['objetos','montagem'],['modulo','explorar'],['resumo','interface']]){await p.locator('[data-left-tab="'+tab+'"]').click();const r=await help('left');assert.deepEqual(r,{title:await topicTitle(topic),href:'#/manual?topico='+topic},'Ajuda da aba '+tab);}
  await nav.viewer(p,'eletrons');assert.deepEqual(await help('right'),{title:await topicTitle('eletrons-deslocalizados'),href:'#/manual?topico=eletrons-deslocalizados'});
  await nav.viewer(p,'propriedades');assert.deepEqual(await help('right'),{title:await topicTitle('propriedades-metalicas'),href:'#/manual?topico=propriedades-metalicas'});
  const propertiesTitle=await topicTitle('propriedades-metalicas');
  await p.locator('[data-dock-help="right"]').click();await p.locator('#silm-help-manual').click();await p.waitForFunction(t=>document.getElementById('manual-title')?.textContent===t,propertiesTitle);
 }finally{await ctx.close();}
 /* 4. Durante uma atividade, o tour não começa e o aviso de primeira visita não aparece. */
 const act=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(act,'#/roteiros?item=ordem-metal');await p.locator('#route-mount').waitFor();await p.locator('#route-metal').selectOption('29');await p.locator('#route-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  assert.equal(await p.locator('.silm-welcome').count(),0);
  await p.locator('#nav-toggle').click();await p.locator('#silm-tour-open').click();await p.waitForTimeout(300);
  assert.equal(await p.evaluate(()=>document.getElementById('silm-tour').open),false,'Tour só na oficina livre');
  assert.match(await p.locator('#si-notifications').innerText(),/O tour está disponível na oficina livre/);
 }finally{await act.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-TOUR: aviso de primeira visita e tour de 5 passos em 5 tamanhos, docas, Pular, Voltar, Escape, Menu e Manual, "Agora não", ajuda "?" por painel e bloqueio durante atividade.');
};
