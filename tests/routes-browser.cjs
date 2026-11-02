'use strict';
/* Roteiros Experimentais como no SIAB: "Montar na oficina" prepara a oficina LIVRE com o metal, a estrutura inicial e o módulo
   do roteiro, sem trava, sem "Concluir roteiro" e sem "Encerrar atividade". O estudante usa todos os painéis e termina no
   relatório (Dados → Relatório), que traz o título e a proposta do roteiro. As restrições ficam nas Missões e nas atividades
   do professor (testes de missão e de professor). */
const nav=require('./integration-navigation.cjs');
const assert=require('node:assert/strict');
module.exports=async(browser,url)=>{
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await ctx.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const base=url.split('#')[0];
 const science=()=>p.evaluate(()=>SILMIntegration.snapshot()),activity=()=>p.evaluate(()=>SILMIntegration.activity());
 const title=id=>p.evaluate(id=>SILM.routes.get(id).title,id);
 const go=async id=>{await p.goto(base+'#/roteiros');await p.waitForFunction(()=>window.SILMIntegration);await p.locator('#route-card-'+id).click();await p.locator('#route-mount').waitFor();};
 // Com investigação na oficina, a mesma confirmação de "Iniciar outra investigação" (como nas Montagens prontas).
 const mount=async(id,z='29',{confirm=true}={})=>{await go(id);await p.locator('#route-metal').selectOption(z);await p.locator('#route-mount').click();if(confirm)await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');};
 const report=async()=>{await p.evaluate(()=>{location.hash='#/relatorios';});await p.locator('#silm-route-report h1').waitFor();return p.locator('#silm-route-report h1').innerText();};
 try{
  await p.goto(url);await p.waitForFunction(()=>window.SILMIntegration);await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-start').click();await p.locator('#silm-add').click();await p.locator('#silm-add').click();
  /* 1. Página do roteiro: proposta, oficina indicada, evidência esperada e uma só ação, Montar na oficina. */
  await go('ordem-metal');
  const page=await p.locator('#silm-route-catalog').innerText();
  for(const t of ['O problema','Objetivo','O que você vai fazer','Na oficina','O que observar','Evidência esperada','Módulo inicial: Explorar','Recursos indicados:','Dados → Relatório'])assert.ok(page.includes(t),'Página do roteiro: '+t);
  for(const t of ['Critério de conclusão','Módulo único','Recursos liberados'])assert.ok(!page.includes(t),'Sem linguagem de atividade restrita: '+t);
  assert.equal(await p.locator('#route-resume').count(),0,'Sem retomada de tentativa');
  /* 2. Montar: oficina livre com metal, estrutura e módulo do roteiro; nenhuma sessão restrita. */
  await p.locator('#route-id-name').fill('Estudante de Química');await p.locator('#route-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  let s=await science();assert.deepEqual({z:s.metal.atomicNumber,mode:s.structure.mode,module:s.module.active},{z:29,mode:'crystalline',module:'explorar'});
  assert.equal((await activity()).current,null,'O roteiro não abre atividade restrita');assert.equal(await p.locator('#scene-clear').isDisabled(),false,'Oficina livre');
  assert.match(await p.locator('#si-notifications').innerText(),new RegExp('Roteiro montado na oficina: '+(await title('ordem-metal')).replace(/[.?]/g,'\\$&')));
  await p.locator('[data-open-dock="montagem"]').click();await p.locator('[data-left-tab="resumo"]').click();
  assert.match(await p.locator('#silm-summary-list').innerText(),new RegExp('Roteiro\\s+'+(await title('ordem-metal'))),'Resumo mostra o roteiro montado');await p.locator('[data-close-dock="left"]').click();
  await p.locator('#nav-toggle').click();assert.equal(await p.locator('#si-now-description').innerText(),'Roteiro Experimental · Explorar','Menu "Agora" como no SIAB');await p.keyboard.press('Escape');
  // Navegação livre: outras telas abrem normalmente.
  await p.evaluate(()=>{location.hash='#/aprender';});await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>location.hash),'#/aprender','Sem navegação restrita');
  /* 3. Relatório com o título e a proposta do roteiro, identificação copiada e sem "Encerrar atividade". */
  assert.equal(await report(),'Relatório — '+await title('ordem-metal'));
  assert.equal(await p.locator('#report-name').inputValue(),'Estudante de Química','Identificação do roteiro vai para o relatório');
  assert.equal(await p.locator('#route-report-close').count(),0,'Sem Encerrar atividade');
  const objectives=await p.evaluate(()=>SILM.routes.get('ordem-metal').objectives.join(' '));assert.ok((await p.locator('#silm-route-report').innerText()).includes(objectives.slice(0,40)),'Objetivos do roteiro no relatório');
  await p.locator('#report-observations').fill('Observei a repetição da célula na rede.');
  assert.ok(/CFC|FCC/.test(await p.locator('#silm-route-report').innerText()));
  await p.emulateMedia({media:'print'});assert.equal(await p.locator('#route-print').isVisible(),false);assert.ok((await p.locator('#silm-route-report').innerText()).includes('Estudante de Química'));await p.emulateMedia({media:null});
  // Recarregar: a investigação, o roteiro montado e os textos do relatório continuam.
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);assert.equal(await report(),'Relatório — '+await title('ordem-metal'));assert.equal(await p.locator('#report-observations').inputValue(),'Observei a repetição da célula na rede.');
  await p.getByRole('button',{name:'Voltar à oficina',exact:true}).click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  /* 4. Medir: módulo inicial Medir, mas todos os instrumentos e o seletor de módulo continuam livres. */
  await mount('medindo-ordem','12');s=await science();assert.deepEqual({z:s.metal.atomicNumber,module:s.module.active},{z:12,module:'medir'});
  await nav.viewer(p,'instrumentos');assert.equal(await p.locator('#silm-module').isDisabled(),false);assert.equal(await p.locator('#silm-instrument option[value="angle"]').count(),1,'Todos os instrumentos');
  await p.locator('#silm-instrument').selectOption('latticeParameter');await p.locator('[data-close-dock="right"]').click();
  const pair=await p.evaluate(()=>{const s=SILMIntegration.snapshot(),g=SILM.crystal.geometry(SILM.data.get(s.metal.atomicNumber));for(const a of s.structure.units)for(const b of s.structure.units){const m=SILM.measurement.compute('latticeParameter',g,[a.site,b.site]);if(m.ok&&m.parameter==='a')return[a.id,b.id];}});
  for(const id of pair)await p.locator('[data-unit-id="'+id+'"]').press('Enter');await p.waitForFunction(()=>SILMIntegration.snapshot().measurements.length===1);
  assert.equal(await report(),'Relatório — '+await title('medindo-ordem'));assert.equal(await p.locator('#report-observations').inputValue(),'','Nova investigação, relatório novo');
  assert.match(await p.locator('#silm-route-report').innerText(),/Parâmetro de rede/);
  /* 5. Cancelar a substituição preserva a investigação; confirmar monta o próximo roteiro. */
  await go('volume-celula');await p.locator('#route-metal').selectOption('26');await p.locator('#route-mount').click();await p.locator('#si-modal-cancel').click();
  assert.equal((await science()).metal.atomicNumber,12,'Cancelar preserva a investigação');assert.ok((await p.evaluate(()=>location.hash)).startsWith('#/roteiros'));
  await p.locator('#route-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await nav.viewer(p,'calculos');await p.locator('#silm-formula').selectOption('cell-volume-cubic');assert.equal(await p.locator('#silm-formula option[value="theoretical-density"]').count(),1,'Todos os cálculos');
  await p.getByRole('button',{name:'Calcular',exact:true}).click();await p.waitForFunction(()=>SILMIntegration.snapshot().calculations.length===1);await p.locator('[data-close-dock="right"]').click();
  /* 6. Montagem livre (elétrons) e propriedades (deformação). */
  await mount('eletrons-metal');s=await science();assert.deepEqual({mode:s.structure.mode,units:s.structure.units.length},{mode:'free',units:4});
  await mount('deformacao-metal');await nav.viewer(p,'propriedades');await p.locator('#silm-panel-property-start-malleability').click();await p.locator('#silm-panel-property-compress').click();await p.locator('#silm-panel-property-restore').click();await p.locator('[data-close-dock="right"]').click();
  assert.equal(Object.keys((await activity()).completed).length,0,'Roteiro não gera "concluído"');
  /* 7. Responsivo e offline. */
  for(const width of [320,360,390]){await p.setViewportSize({width,height:844});await go('medindo-ordem');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Página do roteiro em '+width);}
  await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>navigator.serviceWorker.controller?null:new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}))));
  await ctx.setOffline(true);await p.reload();await p.waitForFunction(()=>window.SILMIntegration);
  await p.locator('#route-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');assert.equal((await science()).module.active,'medir','Montagem offline');await ctx.setOffline(false);
  assert.deepEqual(errors,[]);
  console.log('PASS: roteiros como no SIAB — página com proposta e uma ação, montagem na oficina livre (metal, estrutura, módulo), confirmação ao substituir, Resumo e "Agora", navegação livre, relatório com o roteiro e a identificação, recarga, três módulos sem restrição, celular e offline.');
 }catch(e){console.error('Falha de roteiro:',await p.evaluate(()=>location.hash).catch(()=>''));throw e;}finally{await ctx.close();}
};
