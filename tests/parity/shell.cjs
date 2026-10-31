'use strict';
/* TEST-SHELL — Etapa 12 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   Menu, preferências e aplicativo como no SIAB 1.0.0: cabeçalho, Menu (contexto "Agora", Professor, Preferências,
   Aplicativo), acessibilidade direta, animação de abertura, tela inicial na primeira visita, Sobre, modo projetor,
   instalação e o item Relatório no menu da atividade. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash='')=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const menu=async p=>{await p.locator('#nav-toggle').click();await p.waitForFunction(()=>document.activeElement?.id==='si-nav-close','',{timeout:4000});};
 /* 1. Cabeçalho, barra inferior e Menu nos cinco tamanhos. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/inicio');
   const head=await p.evaluate(()=>({h:document.querySelector('.topbar').getBoundingClientRect().height,pill:!!document.querySelector('.topbar .version-pill'),
    bottom:[...document.querySelectorAll('.si-mobile-bottom-nav a')].filter(a=>a.getClientRects().length).map(a=>!!a.querySelector('svg')&&!/[⌂▤▣▧]/.test(a.textContent))}));
   assert.ok(head.h<=(width<=760?56.5:57.5)&&head.h>=55,'Cabeçalho na altura do SIAB em '+where+': '+head.h);
   assert.equal(head.pill,false,'Versão fora do cabeçalho (fica no Menu e no Sobre)');
   assert.ok(head.bottom.every(Boolean),'Barra inferior com ícones de linha em '+where);
   await menu(p);
   const d=await p.evaluate(()=>{const dr=document.getElementById('sidebar'),r=el=>el.getBoundingClientRect();const vis=el=>el.getClientRects().length&&!el.closest('[hidden]');
    return {sections:[...dr.querySelectorAll('section')].filter(vis).map(s=>s.querySelector('h3')?.textContent.trim()||s.getAttribute('aria-label')),
     professor:[...document.querySelectorAll('#si-teacher-title ~ .si-drawer-links .si-drawer-item')].map(a=>[a.textContent.trim(),a.getAttribute('href')]),
     startup:vis(document.getElementById('si-startup-open')),about:document.getElementById('si-about-open').tagName,
     present:[...dr.querySelectorAll('a')].find(a=>/Como apresentar/.test(a.textContent))?.getAttribute('href'),
     oficinaIcon:dr.querySelector('a[data-route="ambiente"] path')?.getAttribute('d'),
     targets:[...dr.querySelectorAll('a,button,select')].filter(vis).map(x=>r(x).height),width:r(dr).width,overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.deepEqual(d.sections,['Agora','Seções principais','Professor','Preferências','Aplicativo'],'Ordem do Menu em '+where);
   assert.deepEqual(d.professor,[['Área do Professor','#/professor'],['Apoio pedagógico','#/manual?topico=professor'],['Ideias para uma aula acessível',null]]);
   assert.equal(d.startup,true,'"Tela inicial" no Menu');assert.equal(d.about,'BUTTON','"Sobre o SILM" abre a janela Sobre');
   assert.equal(d.present,'#/manual?topico=professor','"Como apresentar à turma" leva ao tópico do Manual');
   assert.match(d.oficinaIcon,/^M12 2\.8/,'Oficina com o ícone do cubo, como no Início');
   for(const t of d.targets)assert.ok(t>=43.5,'Alvos do Menu com 44 px em '+where+': '+t);
   assert.ok(d.width<=360.5&&d.overflow<=1,'Menu com até 360 px e sem rolagem lateral em '+where);
   await p.keyboard.press('Escape');await p.waitForFunction(()=>document.activeElement?.id==='nav-toggle'&&!document.body.classList.contains('nav-open'),'',{timeout:4000});
  }finally{await ctx.close();}
 }
 /* 2. Acessibilidade direta, animação de abertura, "Agora", Sobre, projetor e instalação. */
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/inicio');
  await p.locator('#si-header-access').click();await p.waitForFunction(()=>document.activeElement?.id==='si-a11y-toggle','',{timeout:4000});
  assert.equal(await p.locator('#si-a11y-panel').isVisible(),true,'Grupo de acessibilidade aberto');
  assert.equal(await p.locator('#si-intro').isChecked(),true,'Animação de abertura ligada por padrão');
  await p.locator('label:has(#si-intro)').click();assert.equal(await p.locator('#si-intro').isChecked(),false);
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);
  assert.equal(await p.evaluate(()=>document.documentElement.dataset.opening),'off','Abertura desligada na próxima visita');
  await p.evaluate(()=>{const k='silm-base-integration:family-menu-v1',v=JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify({...v,intro:true,motion:true}));});
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);
  assert.equal(await p.evaluate(()=>document.documentElement.dataset.opening),'off','"Reduzir animações" também omite a abertura');
  await p.evaluate(()=>localStorage.removeItem('silm-base-integration:family-menu-v1'));
  // "Agora" com o contexto da tela.
  await p.goto(base+'#/ambiente');await p.waitForFunction(()=>window.SILMIntegration);await menu(p);
  assert.equal(await p.locator('#si-now-description').textContent(),'Oficina livre · Explorar');assert.equal(await p.locator('#si-nav-continue').textContent(),'Continuar na oficina');
  await p.locator('#si-nav-continue').click();await p.waitForFunction(()=>!document.body.classList.contains('nav-open'));
  await p.evaluate(()=>{location.hash='#/manual?topico=medir';});await p.waitForFunction(()=>document.getElementById('manual-title')?.textContent.startsWith('Medir'));await menu(p);
  assert.equal(await p.locator('#si-now-description').textContent(),'Investigue › Medir: instrumentos e medições do modelo');
  // Sobre: janela com versão e atalhos; Escape devolve o foco ao Menu; a página #/sobre mostra o mesmo conteúdo.
  await p.locator('#si-about-open').click();await p.waitForFunction(()=>document.getElementById('silm-about-dialog').open);
  const about=await p.locator('#silm-about-dialog').innerText();assert.match(about,/Versão 0\.15\.5/);assert.match(about,/GNU GPL v3/);
  assert.deepEqual(await p.locator('#silm-about-dialog .silm-about-links a').evaluateAll(a=>a.map(x=>x.getAttribute('href'))),['#/manual','#/manual?topico=sobre-silm']);
  await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.getElementById('silm-about-dialog').open&&document.activeElement?.id==='nav-toggle','',{timeout:4000});
  await p.evaluate(()=>{location.hash='#/sobre';});await p.waitForFunction(()=>/Versão 0\.15\.5/.test(document.getElementById('silm-about-page')?.textContent||''));
  // Modo projetor: texto maior (19 px, como no SIAB), cabeçalho só com o essencial; desligar volta ao normal.
  await p.evaluate(()=>{location.hash='#/inicio';});await menu(p);await p.locator('#si-projector').check();
  assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).fontSize),'19px','Projetor amplia o texto');
  assert.equal(await p.locator('.si-global-nav').isVisible(),false,'Projetor deixa o cabeçalho só com o essencial');
  await p.locator('#si-projector').uncheck();assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).fontSize),'16px');
  // Instalar aplicativo: visível na entrada publicável; sem pedido do navegador, abre as instruções do Manual.
  assert.equal(await p.locator('#si-drawer-install').isVisible(),true,'"Instalar aplicativo" no Menu');
  await p.locator('#si-drawer-install').click();await p.waitForFunction(()=>location.hash==='#/manual?topico=offline');
 }finally{await ctx.close();}
 /* 3. Tela inicial: convite na primeira visita sem destino, escolha salva, redefinir e entrada com destino. */
 const fresh=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 try{
  const p=await open(fresh);
  await p.waitForFunction(()=>document.getElementById('silm-startup-dialog').open&&document.activeElement?.id==='silm-startup-title','',{timeout:4000});
  assert.equal(await p.evaluate(()=>location.hash),'#/inicio');
  await p.locator('#silm-startup-dialog [data-startup="ambiente"]').click();await p.waitForFunction(()=>location.hash==='#/ambiente'&&!document.getElementById('silm-startup-dialog').open);
  await p.goto(base);await p.waitForFunction(()=>window.SILMIntegration);await p.waitForTimeout(500);
  assert.equal(await p.evaluate(()=>location.hash),'#/ambiente','A escolha vale ao abrir sem destino');
  assert.equal(await p.evaluate(()=>document.getElementById('silm-startup-dialog').open),false,'Sem convite depois da escolha');
  await p.goto(base+'#/caderno');await p.waitForFunction(()=>window.SILMIntegration);await p.waitForTimeout(400);
  assert.equal(await p.evaluate(()=>location.hash),'#/caderno','Entrada com destino não é redirecionada');
  await menu(p);await p.locator('#si-startup-open').click();await p.waitForFunction(()=>document.getElementById('silm-startup-dialog').open);
  assert.equal(await p.locator('[data-startup="ambiente"]').getAttribute('aria-pressed'),'true','Escolha atual marcada');
  await p.locator('[data-startup="reset"]').click();assert.equal(await p.locator('[data-startup="ambiente"]').getAttribute('aria-pressed'),'false');
  await p.getByRole('button',{name:'Agora não'}).click();await p.waitForFunction(()=>!document.getElementById('silm-startup-dialog').open);
  await p.goto(base);await p.waitForFunction(()=>window.SILMIntegration);
  await p.waitForFunction(()=>document.getElementById('silm-startup-dialog').open,'',{timeout:4000});assert.equal(await p.evaluate(()=>location.hash),'#/inicio','Depois de redefinir, volta a perguntar');
  await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.getElementById('silm-startup-dialog').open);
  // O rodapé do Início abre as mesmas configurações.
  await p.locator('.si-home-support [data-startup-settings]').click();await p.waitForFunction(()=>document.getElementById('silm-startup-dialog').open);
  await p.locator('#silm-startup-dialog [data-startup="inicio"]').click();await p.waitForFunction(()=>location.hash==='#/inicio'&&!document.getElementById('silm-startup-dialog').open);
 }finally{await fresh.close();}
 /* 4. Menu da atividade: Ajuda leva ao tópico das atividades e Relatório abre o relatório da atividade. */
 const act=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(act,'#/roteiros?item=ordem-metal');await p.locator('#route-mount').waitFor();
  await p.locator('#route-metal').selectOption('29');await p.locator('#route-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await menu(p);assert.equal(await p.locator('#si-activity-menu').isVisible(),true,'Menu da atividade visível');
  assert.deepEqual(await p.locator('#si-activity-menu .si-drawer-item').evaluateAll(x=>x.map(i=>i.textContent.trim())),['Sobre esta atividade','Ajuda','Relatório','Concluir roteiro','Encerrar atividade']);
  assert.equal(await p.locator('#si-activity-menu a', {hasText:'Ajuda'}).getAttribute('href'),'#/manual?topico=atividades');
  await p.locator('#si-activity-report').click();await p.waitForFunction(()=>location.hash==='#/relatorios');await p.locator('#report-name').waitFor();
 }finally{await act.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-SHELL: cabeçalho e Menu em 5 tamanhos, acessibilidade direta, animação de abertura, "Agora", Sobre, projetor, instalação, tela inicial e Relatório no menu da atividade.');
};
