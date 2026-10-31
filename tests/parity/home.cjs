'use strict';
/* TEST-HOME — Etapa 1 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   Confere a tela Início como o SIAB 1.0.0 a organiza: hero (sobretítulo, título com destaque, lema, símbolo), seção
   "Escolha seu próximo passo", um cartão em destaque e quatro secundários com contagens vivas, rodapé de apoio,
   retomada da atividade e resumo da investigação (extensões do SILM), foco, teclado e ausência de rolagem lateral. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
const PATHS=['#/ambiente','#/aprender','#/missoes','#/roteiros','#/caderno'];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 /* 1. Estrutura, ordem, alinhamento e sem rolagem lateral nos cinco tamanhos do plano. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height);
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/inicio');const where=width+'×'+height;
   const home=await p.evaluate(()=>{const v=document.querySelector('#conteudo > [data-view="inicio"]'),r=el=>el.getBoundingClientRect();
    const cards=[...v.querySelectorAll('.si-home-paths > a')].map(a=>{const c=r(a),arrow=a.querySelector('.si-path-arrow,.si-path-tag'),ar=arrow&&getComputedStyle(arrow).display!=='none'?r(arrow):null;
     return {href:a.getAttribute('href'),title:a.querySelector('strong').textContent.trim(),right:c.right,arrowRight:ar?.right??null,primary:a.classList.contains('si-home-path-primary'),
      iconSvg:!!a.querySelector('.si-path-icon svg'),iconText:a.querySelector('.si-path-icon')?.textContent.trim()||''};});
    return {hidden:v.hidden,eyebrow:v.querySelector('.si-home-hero .eyebrow').textContent.trim(),h1:v.querySelector('h1').textContent.trim(),accent:v.querySelector('h1 span')?.textContent.trim(),
     motto:v.querySelector('.si-home-motto').textContent.trim(),icon:v.querySelector('.si-home-hero-icon')?.getAttribute('alt'),iconInLink:!!v.querySelector('.si-home-hero-icon')?.closest('a'),
     heading:v.querySelector('.si-home-heading h2').textContent.trim(),phrase:v.querySelector('.si-home-heading p').textContent.trim(),cards,
     support:[...v.querySelectorAll('.si-home-support a')].map(a=>({text:a.textContent.trim(),href:a.getAttribute('href'),h:r(a).height})),
     jazz:v.querySelectorAll('a[href*="jazz" i]').length,overflow:document.documentElement.scrollWidth-innerWidth,h1Lines:Math.round(r(v.querySelector('h1')).height/parseFloat(getComputedStyle(v.querySelector('h1')).lineHeight))};});
   assert.equal(home.hidden,false,where);
   assert.equal(home.eyebrow,'SIMULADOR INTERATIVO DE LIGAÇÕES METÁLICAS',where);
   assert.equal(home.h1,'A arquitetura dos metais',where);assert.equal(home.accent,'dos metais',where);
   assert.ok(home.h1Lines<=2,'Título do hero em até duas linhas em '+where+' (SIAB: título curto)');
   assert.equal(home.motto,'Monte. Observe. Meça. Calcule.',where);
   assert.equal(home.icon,'','Símbolo institucional decorativo em '+where);assert.equal(home.iconInLink,false,'O símbolo não leva a outro lugar (plano §9) em '+where);
   assert.equal(home.heading,'Escolha seu próximo passo',where);assert.equal(home.phrase,'Da curiosidade à descoberta',where);
   assert.deepEqual(home.cards.map(c=>c.href),PATHS,'Ordem dos caminhos em '+where);
   assert.deepEqual(home.cards.map(c=>c.title),['Oficina dos Metais','Aprender','Missões','Roteiros Experimentais','Caderno'],where);
   assert.equal(home.cards[0].primary,true,'Cartão em destaque é a Oficina em '+where);
   for(const c of home.cards){assert.equal(c.iconSvg,true,'Ícone desenhado (não caractere) em '+c.title);assert.equal(c.iconText,'',c.title);
    if(c.arrowRight!==null)assert.ok(c.right-c.arrowRight<=30,'Seta/etiqueta alinhada à direita em '+c.title+' ('+where+'): '+(c.right-c.arrowRight).toFixed(1)+' px');}
   assert.deepEqual(home.support.map(s=>s.href),['#/manual','#/professor','#/configuracoes'],where);
   for(const s of home.support)assert.ok(s.h>=44,'Alvo de 44 px no rodapé: '+s.text+' em '+where);
   assert.equal(home.jazz,0,'Sem atalho para o Clube de Jazz no Início (plano §9) em '+where);
   assert.ok(home.overflow<=1,'Sem rolagem horizontal em '+where+': '+home.overflow+' px');
  }finally{await ctx.close();}
 }
 /* 2. Contagens vivas, concordância, Caderno com e sem registros, retomada e resumo; destinos de todos os links. */
 const ctx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/inicio');const text=sel=>p.locator(sel).innerText();
  /* A tela é refeita logo depois da troca de endereço: espera o texto esperado (até 3 s) e, se não vier, mostra o que apareceu. */
  const expectText=async(sel,expected,label)=>{try{await p.waitForFunction(([s,e])=>document.querySelector(s)?.textContent.trim()===e,[sel,expected],{timeout:3000});}catch{assert.equal(await text(sel),expected,label||sel);}};
  const n=await p.evaluate(()=>({themes:SILM.themes.registry.length,missions:SILM.missions.registry.length,routes:SILM.routes.registry.length}));
  const plural=(k,one,many)=>k+' '+(k===1?one:many);
  assert.equal(await text('#si-home-learning-meta'),plural(n.themes,'tema para explorar','temas para explorar'));
  assert.equal(await text('#si-home-missions-meta'),plural(n.missions,'desafio para resolver','desafios para resolver'));
  assert.equal(await text('#si-home-scripts-meta'),plural(n.routes,'investigação guiada','investigações guiadas'));
  assert.equal(await text('#si-home-notebook-meta'),'Pronto para seus registros','Caderno vazio');
  assert.equal(await p.locator('#si-home-resume').isHidden(),true,'Sem atividade, sem retomada');
  assert.equal(await p.locator('#si-home-scene-summary').isHidden(),true,'Sem investigação, sem resumo');
  const note=async title=>{await p.goto(base+'#/caderno');await p.locator('.silm-notebook-compose > summary').click();await p.locator('#notebook-title').fill(title);await p.locator('#notebook-text').fill('Registro do teste do Início.');await p.locator('#notebook-add').click();};
  await note('Primeira observação');await p.goto(base+'#/inicio');await expectText('#si-home-notebook-meta','1 registro salvo');
  await note('Segunda observação');await p.goto(base+'#/inicio');await expectText('#si-home-notebook-meta','2 registros salvos');
  // Resumo da investigação: um metal e uma unidade na Oficina.
  await p.goto(base+'#/ambiente');await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-start').click();await p.locator('#silm-add').click();
  const units=await p.evaluate(()=>SILMIntegration.snapshot().structure.units.length),metal=await p.evaluate(()=>SILM.data.get(SILMIntegration.snapshot().metal.atomicNumber).name);
  await p.goto(base+'#/inicio');await expectText('#si-home-scene-summary',metal+' · '+plural(units,'unidade salva','unidades salvas'));
  // Retomada: missão aberta e não encerrada aparece no Início, com o link de volta para ela.
  await p.goto(base+'#/missoes');const mission=await p.evaluate(()=>SILM.missions.registry[0]);await p.locator('#mission-card-'+mission.id).click();
  await p.locator('#mission-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await p.goto(base+'#/inicio');await p.locator('#si-home-resume').waitFor({state:'visible',timeout:3000});
  await expectText('#si-home-resume-title',mission.title);assert.equal(await p.locator('#si-home-resume-link').getAttribute('href'),'#/missoes?item='+mission.id);
  await p.locator('#si-home-resume-link').click();await p.waitForFunction(id=>location.hash==='#/missoes?item='+id,mission.id);
  await p.goto(base+'#/inicio');await p.locator('#si-home-resume-bench').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  // A marca leva ao Início também durante a atividade (como no SIAB); uma tela fora do contexto volta para a missão.
  await p.locator('.si-global-brand').click();await p.waitForFunction(()=>location.hash==='#/inicio');
  await p.locator('#conteudo > [data-view="inicio"] a[href="#/aprender"]').click();await p.waitForFunction(id=>location.hash==='#/missoes?item='+id,mission.id);
  // Encerrar a missão devolve a investigação livre e some a retomada.
  await p.goto(base+'#/ambiente');if(await p.locator('#si-dock-left').isHidden())await p.locator('[data-open-dock="montagem"]').click();
  if(await p.locator('[data-left-tab="missao"]').getAttribute('aria-pressed')!=='true')await p.locator('[data-left-tab="missao"]').click();
  await p.locator('#mission-close').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>!SILMIntegration.activity().current);
  await p.goto(base+'#/inicio');await p.waitForFunction(()=>document.getElementById('si-home-resume').hidden);
  // Cada caminho e cada atalho abre a tela anunciada, com título visível.
  for(const href of [...PATHS,'#/manual','#/professor','#/configuracoes']){await p.goto(base+'#/inicio');await p.locator('#conteudo > [data-view="inicio"] :is(.si-home-paths,.si-home-support) a[href="'+href+'"]').click();
   await p.waitForFunction(h=>{const v=document.querySelector('#conteudo > [data-view="'+h.slice(2)+'"]');return location.hash===h&&!!v&&!v.hidden&&!!v.querySelector('h1,h2');},href,{timeout:4000}).catch(()=>assert.fail('Destino '+href+' não abriu a tela anunciada'));}
  await p.goto(base+'#/aprender');await p.locator('.si-global-brand').click();await p.waitForFunction(()=>location.hash==='#/inicio');
 }finally{await ctx.close();}
 /* 3. Foco e teclado como no SIAB: na abertura o primeiro Tab é "Ir para o conteúdo"; ao trocar de tela, topo da página e foco no título. */
 const kctx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 try{
  const p=await open(kctx,'#/inicio');await p.waitForTimeout(150);
  assert.equal(await p.evaluate(()=>document.activeElement===document.body),true,'Na abertura o foco não salta para o conteúdo');
  await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.textContent.trim()),'Ir para o conteúdo');
  await p.goto(base+'#/aprender');await p.waitForFunction(()=>window.SILMIntegration);await p.evaluate(()=>scrollTo(0,400));
  await p.locator('a[href="#/inicio"][data-route="inicio"]:visible').first().click();await p.waitForFunction(()=>document.activeElement?.id==='home-title');
  assert.equal(await p.evaluate(()=>scrollY),0,'Troca de tela volta ao topo');
  await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('href')),'#/ambiente','Depois do título, o primeiro Tab é o cartão em destaque');
  await p.keyboard.press('Enter');await p.waitForFunction(()=>location.hash==='#/ambiente');
 }finally{await kctx.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-HOME: hero, cinco caminhos na ordem do SIAB, contagens e concordância, Caderno vazio/1/2, resumo, retomada, links, foco, teclado e 5 tamanhos sem rolagem lateral.');
};
