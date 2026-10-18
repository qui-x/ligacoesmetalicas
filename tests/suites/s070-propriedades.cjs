'use strict';
/* Série 0.7.x — propriedades metálicas (itens 140–173 do prompt 0.7.x). */
module.exports={series:'0.7',async run(kit,{screenshots=false}={}){
 const {assert,state,go,investigate,assemble,reload,answer,openLeft,closeLeft,openRight,closeRight,switchModule,crystal,organize}=kit;
 const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const props=async page=>(await state(page)).properties;
 const snap=page=>page.evaluate(()=>document.querySelector('.silm-electron-canvas')?.silmElectrons.snapshot()??null);
 // Uma experiência por vez: com outra ativa, o painel mostra só os controles dela; encerra-se antes de trocar.
 const start=async(page,id)=>{await openLeft(page,'Propriedades');if(await page.isVisible('#silm-prop-end'))await page.click('#silm-prop-end');await page.click('#silm-prop-start-'+id);await page.waitForFunction(id=>SILM.scientificState.properties.active===id,id);await closeLeft(page);};
 const act=async(page,name)=>{await page.click('#silm-stage-prop-'+name);await page.waitForTimeout(80);};
 // Posições na cena normalizadas pelo tamanho do palco (o palco pode variar alguns pixels com o rodapé).
 const centres=async page=>{await page.waitForFunction(()=>!document.getAnimations().some(x=>x.playState==='running'&&x.effect?.target?.classList?.contains('silm-crystal-unit')));return page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage').getBoundingClientRect();return [...document.querySelectorAll('.silm-crystal-unit')].map(n=>{const r=n.getBoundingClientRect();return {id:n.dataset.unitId,x:(r.left+r.width/2-st.left)/st.width*400,y:(r.top+r.height/2-st.top)/st.height*400};});});};
 const extent=list=>{const xs=list.map(p=>p.x),ys=list.map(p=>p.y);return {w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};};
 const drift=async(page,n=6)=>{let sum=0,back=0,count=0;for(let k=0;k<n;k++){const s=await snap(page);for(const p of s.particles){sum+=p.vx;if(p.vx>0)back++;count++;}await page.waitForTimeout(150);}return {meanVx:+(sum/count).toFixed(3),againstField:+(back/count).toFixed(3)};};

 await test('0.7-MIG','Migração da 0.6.x (schema 5) sem perda: investigação, metal, estrutura, cristalografia e elétrons',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.click('#silm-electrons-toggle');await page.waitForFunction(()=>!!SILM.scientificState.electrons);await page.click('#silm-crystal-view-lattice');
  const s6=await state(page),v060=JSON.parse(JSON.stringify(s6));v060.schemaVersion=5;delete v060.properties;   // estado real da 0.6.x: sem propriedades; medições vazias desde o schema 2
  const migrated=await use({seed:v060});await go(migrated);await migrated.waitForSelector('.silm-crystal');const s=await state(migrated);
  assert.equal(s.schemaVersion,s6.schemaVersion,'migra até o schema atual');assert.deepEqual(s.structure,s6.structure);assert.deepEqual(s.electrons,s6.electrons);assert.equal(s.investigation.id,s6.investigation.id);assert.equal(s.properties.active,null);
  assert.equal(await migrated.getAttribute('.silm-crystal','data-view'),'lattice');return {from:5,to:s.schemaVersion};
 });

 await test('0.7-ELIG','Elegibilidade por propriedade e contexto: livre só elétrica; cristalina todas; uma por vez',async use=>{
  const page=await use();await investigate(page);await assemble(page,3);await openLeft(page,'Propriedades');
  assert.equal(await page.getAttribute('#silm-prop-start-electrical','aria-disabled'),'false');
  for(const id of ['thermal','malleability','ductility','luster']){assert.equal(await page.getAttribute('#silm-prop-start-'+id,'aria-disabled'),'true');assert.match(await page.locator('#silm-prop-reason-'+id).textContent(),/Organize a estrutura cristalina/);}
  await closeLeft(page);await organize(page);await openLeft(page,'Propriedades');
  for(const id of ['electrical','thermal','malleability','ductility','luster'])assert.equal(await page.getAttribute('#silm-prop-start-'+id,'aria-disabled'),'false',id);
  await page.click('#silm-prop-start-thermal');assert.equal(await page.isVisible('#silm-prop-start-electrical'),false,'Somente os controles da propriedade ativa');
  assert.ok(await page.isVisible('#silm-prop-heat'));assert.equal(await page.isVisible('#silm-prop-compress'),false);await closeLeft(page);
  return {free:'só elétrica',crystalline:'cinco propriedades',controls:'somente a ativa'};
 });

 await test('0.7-140','Condutividade elétrica sem campo: movimento não direcionado',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'electrical');
  const e=await state(page);assert.equal(e.electrons.representation.visible,true,'A experiência mostra os elétrons');assert.equal(e.properties.electrical.field,false);
  const d=await drift(page);assert.ok(Math.abs(d.meanVx)<.25,JSON.stringify(d));assert.equal(await page.locator('.silm-field-arrow').count(),0);
  return d;
 });

 await test('0.7-141','Aplicar campo: resposta coletiva direcional (não uniforme)',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'electrical');const before=(await state(page)).structure;
  await act(page,'field');assert.equal((await props(page)).electrical.field,true);await page.waitForTimeout(600);
  const d=await drift(page),wraps=(await snap(page)).wraps;
  assert.ok(d.meanVx<-.3,'Deslocamento médio oposto ao campo: '+JSON.stringify(d));assert.ok(d.againstField>.03,'Não são todos em linha reta: '+JSON.stringify(d));assert.ok(wraps>0,'Fluxo contínuo pela estrutura');
  assert.equal(await page.locator('.silm-field-arrow').count(),1);assert.equal(await page.locator('.silm-drift-arrow').count(),1);
  assert.match(await page.locator('#silm-stage-prop-status').textContent(),/componente direcional/);assert.match(await page.getAttribute('#silm-assembly-stage','aria-label'),/Campo elétrico aplicado/);
  assert.deepEqual((await state(page)).structure,before,'Estrutura e cristalografia inalteradas');
  await shot(page,'p01-condutividade-eletrica');return {...d,wraps};
 });

 await test('0.7-142','Remover campo: retorno ao comportamento não direcionado',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'electrical');await act(page,'field');await page.waitForTimeout(400);await act(page,'field');
  assert.equal((await props(page)).electrical.field,false);await page.waitForTimeout(500);const d=await drift(page);assert.ok(Math.abs(d.meanVx)<.25,JSON.stringify(d));
  assert.equal(await page.locator('.silm-field-arrow').count(),0);return d;
 });

 await test('0.7-143','Movimento reduzido: condutividade compreensível sem animação',async use=>{
  const page=await use({reducedMotion:'reduce'});await crystal(page,'Cu',4);await start(page,'electrical');await act(page,'field');
  const s=await snap(page);assert.equal(s.running,false);assert.ok(s.visible);assert.equal(await page.locator('.silm-drift-arrow').count(),1);
  assert.match(await page.locator('#silm-stage-prop-status').textContent(),/seta inferior indica o deslocamento médio/);
  await shot(page,'p02-eletrica-movimento-reduzido');return {static:true};
 });

 await test('0.7-144','Nenhuma experiência altera a cristalografia',async use=>{
  const page=await use();await crystal(page,'Fe',3);const base=(await state(page)).structure;
  for(const [id,actions] of [['electrical',['field']],['thermal',['heat','advance']],['malleability',['compress','compress']],['ductility',['stretch']],['luster',['light']]]){
   await start(page,id);for(const a of actions)await act(page,a);assert.deepEqual((await state(page)).structure,base,id);}
  return {structure:'inalterada em cinco experiências'};
 });

 await test('0.7-145','Condutividade térmica: aquecer região e propagação qualitativa',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'thermal');await act(page,'heat');
  const levels=()=>page.evaluate(()=>[...document.querySelectorAll('.silm-crystal-unit')].map(n=>+n.dataset.heat));
  const first=await levels();assert.ok(first.some(l=>l===4)&&first.some(l=>l===0),'Fonte quente e restante frio: '+first.join(''));
  await page.waitForFunction(()=>SILM.scientificState.properties.thermal.stage===4,null,{timeout:8000});const last=await levels();
  assert.ok(last.reduce((a,b)=>a+b,0)>first.reduce((a,b)=>a+b,0),'Energia se espalha');assert.ok(last.filter(l=>l>0).length>first.filter(l=>l>0).length);
  assert.equal(await page.locator('.silm-heat-source rect').count(),1);assert.match(await page.locator('#silm-stage-prop-status').textContent(),/Etapa 4 de 4/);
  assert.match(await page.locator('.silm-crystal-unit').first().getAttribute('aria-label'),/energia térmica/);
  await shot(page,'p03-condutividade-termica');return {before:first.join(''),after:last.join('')};
 });

 await test('0.7-146','Térmica: Restaurar volta ao estado-base',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'thermal');await act(page,'heat');await act(page,'advance');await act(page,'restore');
  const p=await props(page);assert.deepEqual(p.thermal,{heating:false,stage:0});assert.equal(p.active,'thermal');assert.equal(await page.locator('.silm-crystal-unit[data-heat]').count(),0);
  assert.equal((await state(page)).metal.symbol,'Cu');return {restored:true};
 });

 await test('0.7-147','Térmica: repetição não gera fusão nem altera a estrutura',async use=>{
  const page=await use({reducedMotion:'reduce'});await crystal(page,'Cu',4);const base=(await state(page)).structure;await start(page,'thermal');await act(page,'heat');
  for(let i=0;i<8;i++)await page.click('#silm-stage-prop-advance',{force:true});const p=await props(page);assert.equal(p.thermal.stage,4,'Limite de etapas');
  assert.deepEqual((await state(page)).structure,base);assert.match(await page.locator('#silm-stage-prop-status').textContent(),/sem fusão nem mudança de fase/i);
  assert.ok(!/fus[aã]o.*ocorr|derret/i.test(await page.locator('#workspace').textContent()));return {stage:4,melting:false};
 });

 await test('0.7-148','Maleabilidade: compressão e deslocamento coletivo das camadas',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'malleability');const a=await centres(page);
  for(let i=0;i<3;i++)await act(page,'compress');await page.waitForTimeout(300);const b=await centres(page),ea=extent(a),eb=extent(b);
  assert.ok(eb.h/eb.w<ea.h/ea.w-.15,'Forma achatada (lâmina): '+JSON.stringify({ea,eb}));const moved=b.filter((p,i)=>Math.hypot(p.x-a[i].x,p.y-a[i].y)>3).length;assert.ok(moved>=10,'Deslocamento coletivo: '+moved);
  assert.equal(await page.locator('.silm-force-indicator line').count(),6);assert.match(await page.locator('.silm-force-indicator').textContent(),/compressão/);assert.equal(await page.getAttribute('#silm-stage-prop-compress','aria-disabled'),'true','Limite didático');
  assert.match(await page.locator('#silm-stage-prop-status').textContent(),/camadas da estrutura deslizam/);await shot(page,'p04-maleabilidade');return {ratioBefore:+(ea.h/ea.w).toFixed(2),ratioAfter:+(eb.h/eb.w).toFixed(2),moved};
 });

 await test('0.7-149','Maleabilidade: elétrons continuam associados à estrutura coletiva',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'malleability');await page.click('#silm-electrons-toggle');for(let i=0;i<3;i++)await act(page,'compress');
  /* 0.10.1: espera o fim das transições finitas em vez de um tempo fixo (o tempo fixo falhava com a máquina carregada). */
  await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getTiming?.().iterations)&&a.effect.getTiming().iterations<Infinity).map(a=>a.finished.catch(()=>{}))));await page.waitForTimeout(200);
  const s=await snap(page),units=await page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage').getBoundingClientRect();return [...document.querySelectorAll('.silm-crystal-unit')].map(n=>{const r=n.getBoundingClientRect();return {x:(r.left+r.width/2-st.left)/st.width,y:(r.top+r.height/2-st.top)/st.height};});});
  /* 0.11.x: centros dos elétrons ficam na cena; a câmera (que reenquadra a estrutura deformada) leva ao palco. */
  const cam=s.camera||{zoom:1,x:.5,y:.5},view=c=>({x:(c.x-cam.x)*cam.zoom+.5,y:(c.y-cam.y)*cam.zoom+.5});
  assert.ok(units.every((u,i)=>{const v=view(s.centerList[i]);return Math.hypot(u.x-v.x,u.y-v.y)<.01;}),'Região eletrônica acompanha os centros deformados');
  const near=s.particles.filter(p=>s.centerList.some(c=>Math.hypot(p.x-c.x,p.y-c.y)<=s.radius*1.05)).length/s.count;assert.ok(near>.7,'Distribuição sobre o conjunto: '+near);
  return {coverage:+near.toFixed(2)};
 });

 await test('0.7-150','Maleabilidade: Restaurar devolve a geometria original',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'malleability');const a=await centres(page);await act(page,'compress');await act(page,'compress');await act(page,'restore');await page.waitForTimeout(300);
  const b=await centres(page);assert.ok(b.every((p,i)=>Math.hypot(p.x-a[i].x,p.y-a[i].y)<1.5),'Geometria original');assert.equal((await props(page)).malleability.compression,0);return {restored:true};
 });

 await test('0.7-151','Ductilidade: alongamento distinguível da maleabilidade',async use=>{
  const page=await use();await crystal(page,'Cu',4);const a=extent(await centres(page));
  await start(page,'malleability');for(let i=0;i<3;i++)await act(page,'compress');await page.waitForTimeout(300);const m=extent(await centres(page));const mForce=await page.locator('.silm-force-indicator line').first().getAttribute('y1');
  await start(page,'ductility');assert.equal((await props(page)).malleability.compression,0,'Troca sem resíduo');for(let i=0;i<3;i++)await act(page,'stretch');await page.waitForTimeout(300);const d=extent(await centres(page));
  assert.ok(d.h/d.w>a.h/a.w*1.3,'Alonga e estreita (fio): '+JSON.stringify({a,d}));assert.ok(m.h/m.w<a.h/a.w,'Lâmina: larga e baixa');assert.ok(d.h/d.w>m.h/m.w*1.8,'Forma oposta à da lâmina: '+JSON.stringify({m,d}));
  const dForce=await page.locator('.silm-force-indicator line').first().getAttribute('y1');assert.notEqual(dForce,mForce,'Setas de força diferentes (tração × compressão)');
  assert.match(await page.locator('#silm-stage-prop-status').textContent(),/alonga e se estreita/);await shot(page,'p05-ductilidade');
  return {heightOverWidth:{base:+(a.h/a.w).toFixed(2),malleability:+(m.h/m.w).toFixed(2),ductility:+(d.h/d.w).toFixed(2)}};
 });

 await test('0.7-152','Ductilidade: Restaurar',async use=>{
  const page=await use();await crystal(page,'Mg',3);await start(page,'ductility');const a=await centres(page);await act(page,'stretch');await act(page,'restore');await page.waitForTimeout(300);
  const b=await centres(page);assert.ok(b.every((p,i)=>Math.hypot(p.x-a[i].x,p.y-a[i].y)<1.5));assert.equal((await props(page)).ductility.elongation,0);return {restored:true};
 });

 await test('0.7-153','Brilho metálico: incidir luz e resposta da superfície',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'luster');await act(page,'light');
  assert.equal(await page.locator('.silm-light-in').count(),1);assert.equal(await page.locator('.silm-light-out').count(),1);assert.equal(await page.locator('.silm-crystal-unit[data-lit]').count(),5,'Face superior da célula CFC (4 vértices + 1 face)');
  assert.match(await page.locator('#silm-stage-prop-status').textContent(),/reflete a maior parte da luz/);await shot(page,'p06-brilho-metalico');
  await act(page,'light');assert.equal(await page.locator('.silm-light-in').count(),0);return {lit:5};
 });

 await test('0.7-154','Brilho com movimento reduzido: informação permanece',async use=>{
  const page=await use({reducedMotion:'reduce'});await crystal(page,'Fe',3);await start(page,'luster');await act(page,'light');
  assert.ok(await page.locator('.silm-crystal-unit[data-lit]').count()>0);assert.match(await page.getAttribute('#silm-assembly-stage','aria-label'),/Brilho metálico: Luz incidente/);return {static:true};
 });

 await test('0.7-155','Metal sem propriedade homologada: indisponível com motivo (Mn)',async use=>{
  const page=await use();await investigate(page,'Mn');await assemble(page,3);await openLeft(page,'Propriedades');
  for(const id of ['thermal','malleability','ductility','luster']){assert.equal(await page.getAttribute('#silm-prop-start-'+id,'aria-disabled'),'true');assert.match(await page.locator('#silm-prop-reason-'+id).textContent(),/Indisponível: A experiência exige a estrutura cristalina organizada/);}
  await page.click('#silm-prop-start-malleability',{force:true});assert.equal((await props(page)).active,null);assert.equal(await page.getAttribute('#silm-prop-start-electrical','aria-disabled'),'false');
  await shot(page,'p07-propriedade-indisponivel');await closeLeft(page);
  await openRight(page,'ver');await page.waitForSelector('#silm-property-summary');assert.match(await page.locator('#silm-property-summary').textContent(),/Maleabilidade.*Indisponível/s);await closeRight(page);
  return {metal:'Mn',reason:'MODEL_NOT_APPLICABLE'};
 });

 await test('0.7-156','Hg: sem deformação de sólido sem fase sólida de referência; continua classificado como metal',async use=>{
  const page=await use();await go(page);const r=await page.evaluate(()=>{const e=SILM.data.get(80),p=SILM.properties.eligibility(e);return {metallic:e.classification.metallic,investigable:e.silmEligibility.status,m:p.malleability.reasonCode,d:p.ductility.reasonCode,t:p.thermal.reasonCode};});
  assert.equal(r.metallic,true,'Hg continua metal');assert.equal(r.investigable,'unavailable');assert.equal(r.m,'REFERENCE_PHASE_UNSUPPORTED');assert.equal(r.d,'REFERENCE_PHASE_UNSUPPORTED');
  const liquid=await page.evaluate(()=>{const e={...SILM.data.get(29),silmEligibility:{status:'unavailable',reasonCode:'STRUCTURE_NOT_HOMOLOGATED'},referenceStructure:null,structures:[],phaseAtReference:{value:'liquid',display:'Líquida'}};return SILM.properties.eligibility(e).malleability.reasonCode;});
  assert.equal(liquid,'LIQUID_AT_REFERENCE_CONDITION','Regra de fase líquida pronta para o dado homologado');return {...r,liquidRule:liquid};
 });

 await test('0.7-157','Troca de propriedade: nenhum estado residual',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'thermal');await act(page,'heat');await start(page,'luster');
  const p=await props(page);assert.deepEqual(p.thermal,{heating:false,stage:0});assert.equal(await page.locator('.silm-crystal-unit[data-heat]').count(),0);assert.equal(await page.locator('.silm-heat-source rect').count(),0);
  await openRight(page,'dados','Histórico');assert.match(await page.locator('#silm-history').textContent(),/Experiência iniciada: Brilho metálico/);await closeRight(page);return {residual:false};
 });

 await test('0.7-158','Troca de metal: nenhuma experiência antiga carregada',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,3);await start(page,'electrical');await act(page,'field');
  await openLeft(page,'Metal');await page.click('#silm-select-metal');await page.click('.silm-periodic .periodic-element[data-symbol="Al"]');await page.click('.silm-periodic [id$="-investigate"]');await answer(page,'Iniciar nova investigação');
  await page.waitForSelector('#silm-start-assembly');const p=await props(page);assert.equal(p.active,null);assert.equal(p.electrical.field,false);return {metal:'Al',active:null};
 });

 await test('0.7-159','Limpar estrutura limpa as propriedades dependentes',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'malleability');await act(page,'compress');await openLeft(page,'Estrutura');await page.click('#silm-panel-clear');await answer(page,'Limpar estrutura');
  const p=await props(page);assert.equal(p.active,null);assert.equal(p.malleability.compression,0);assert.equal((await state(page)).metal.symbol,'Cu');return {cleared:true};
 });

 await test('0.7-160','Resetar investigação limpa as propriedades',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'luster');await act(page,'light');await openLeft(page,'Metal');await page.click('#silm-panel-reset');await answer(page,'Resetar investigação');
  assert.equal((await props(page)).active,null);return {reset:true};
 });

 await test('0.7-161','Encerrar investigação: cleanup completo',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'thermal');await act(page,'heat');await openLeft(page,'Metal');await page.click('#silm-panel-close');await answer(page,'Encerrar investigação');
  const s=await state(page);assert.equal(s.investigation,null);assert.equal(s.properties.active,null);assert.equal(await page.locator('.silm-property-overlay').count(),0);return {closed:true};
 });

 await test('0.7-162','Reload: experiência restaurada em estado consistente',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'malleability');await act(page,'compress');await act(page,'compress');await page.waitForTimeout(300);const a=await centres(page),before=await props(page);
  await reload(page);await page.waitForSelector('.silm-crystal');assert.deepEqual(await props(page),before);await page.waitForTimeout(300);const b=await centres(page);
  const off=b.map((p,i)=>Math.hypot(p.x-a[i].x,p.y-a[i].y));assert.ok(off.every(x=>x<1.5),'Deformação retomada: '+off.map(x=>x.toFixed(1)).join(' '));assert.equal(await page.locator('.silm-force-indicator line').count(),6);return {resumed:'malleability 2/3'};
 });

 await test('0.7-163','Offline: experiências básicas funcionam sem rede',async use=>{
  const page=await use({serviceWorkers:'allow'});await go(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await kit.ready(page);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:20000});await page.context().setOffline(true);await reload(page);
  await page.click('.silm-periodic .periodic-element[data-symbol="Ag"]');await page.click('.silm-periodic [id$="-investigate"]');await page.waitForSelector('#silm-start-assembly');await assemble(page,3);await organize(page);
  for(const [id,a] of [['electrical','field'],['thermal','heat'],['malleability','compress'],['ductility','stretch'],['luster','light']]){await start(page,id);await act(page,a);}
  assert.equal((await props(page)).luster.light,true);assert.equal(await page.evaluate(()=>navigator.onLine),false);return {offline:true,experiences:5};
 });

 for(const [w,h,label] of [[320,740,'320'],[360,760,'360'],[390,844,'390'],[844,390,'landscape'],[768,1024,'tablet']])await test('0.7-164-'+label,'Mobile/tablet '+label+' com experiência ativa',async use=>{
  const page=await use({width:w,height:h,mobile:w<900});await crystal(page,'Cu',4);
  await openLeft(page,'Propriedades');await page.locator('#silm-prop-start-malleability').scrollIntoViewIfNeeded();await page.locator('#silm-prop-start-malleability').tap();
  await page.waitForFunction(()=>SILM.scientificState.properties.active==='malleability');await page.locator('#silm-prop-compress').scrollIntoViewIfNeeded();await page.locator('#silm-prop-compress').tap();
  assert.equal((await props(page)).malleability.compression,1);if(label==='390')await shot(page,'m-390-propriedades-sheet');await closeLeft(page);
  const m=await page.evaluate(()=>{const s=document.getElementById('silm-assembly-stage').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,stage:Math.round(s.width),units:[...document.querySelectorAll('.silm-crystal-unit')].every(n=>{const r=n.getBoundingClientRect(),c={x:r.left+r.width/2,y:r.top+r.height/2};return c.x>=s.left&&c.x<=s.right&&c.y>=s.top&&c.y<=s.bottom;})};});
  assert.ok(m.overflow<=0&&m.units,JSON.stringify(m));assert.ok(m.stage>=(label==='landscape'?150:200),JSON.stringify(m));
  await page.locator('#silm-assembly-stage').scrollIntoViewIfNeeded();await shot(page,'m-'+label+'-maleabilidade');return m;
 });

 await test('0.7-165','Acessibilidade: teclado, foco, 150%, alto contraste e visão de cores',async use=>{
  const page=await use();await crystal(page,'Cu',4);await openLeft(page,'Propriedades');await page.focus('#silm-prop-start-thermal');await page.keyboard.press('Enter');
  await page.waitForFunction(()=>SILM.scientificState.properties.active==='thermal');assert.equal(await page.evaluate(()=>document.activeElement?.isConnected),true,'Foco preservado');
  await page.focus('#silm-prop-heat');await page.keyboard.press('Space');assert.equal((await props(page)).thermal.heating,true);await page.focus('#silm-prop-advance');await page.keyboard.press('Enter');
  await closeLeft(page);await page.evaluate(()=>{SimCore.accessibility.set('fontScale',1.5);SimCore.accessibility.set('contrast',true);SimCore.accessibility.set('colorblind','acromatopsia');});await page.waitForTimeout(250);
  const rings=await page.evaluate(()=>[...new Set([...document.querySelectorAll('.silm-crystal-unit[data-heat]')].map(n=>n.dataset.heat+':'+getComputedStyle(n.querySelector('.silm-unit-core')).boxShadow.split('rgb').length))]);
  assert.ok(rings.length>=2,'Níveis distinguíveis pela quantidade de anéis: '+rings.join(' '));
  const m=await page.evaluate(()=>{const s=document.getElementById('silm-assembly-stage').getBoundingClientRect();return {stage:Math.round(s.width),overflow:document.documentElement.scrollWidth-innerWidth};});assert.ok(m.stage>=240&&m.overflow<=0,JSON.stringify(m));
  await shot(page,'p08-alto-contraste-visao-de-cores');await page.evaluate(()=>SimCore.accessibility.set('colorblind','none'));return {rings,stage:m.stage};
 });

 await test('0.7-166','Desempenho: propriedade + estrutura + elétrons simultâneos',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.click('#silm-crystal-view-lattice');await start(page,'electrical');await act(page,'field');await page.waitForTimeout(1500);
  const s=await snap(page),fps=await page.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();(function f(){n++;if(performance.now()-t0<1000)requestAnimationFrame(f);else r(n);})();}));
  assert.ok(s.cost<6,'Custo por quadro: '+s.cost.toFixed(2));assert.ok(fps>=30,'Quadros: '+fps);return {costMs:+s.cost.toFixed(2),fps,particles:s.count};
 });

 await test('0.7-MOD','Medir e Calcular: sem instrumentos; experiência operada em Explorar',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'luster');await act(page,'light');await switchModule(page,'medir');
  assert.equal((await props(page)).luster.light,true,'Trocar de módulo não apaga a experiência');await openLeft(page,'Propriedades');
  assert.equal(await page.getAttribute('#silm-prop-light','aria-disabled'),'true');assert.match(await page.locator('#silm-properties-note').textContent(),/operadas em Explorar/);await closeLeft(page);
  const text=await page.locator('#workspace').textContent();assert.ok(!/amperímetro|voltímetro|termômetro|Aplicar voltagem|resistividade em função/i.test(text),'Sem instrumentos nem dinâmica fora da série');
  return {medir:'somente acompanhamento'};
 });

 await test('0.7-VER','Ver, Dados, relatório e Manual: interpretação curta, dados com natureza e limitações',async use=>{
  const page=await use();await crystal(page,'Cu',4);await start(page,'electrical');await act(page,'field');await openRight(page,'ver');await page.waitForSelector('#silm-property-summary');
  const t=await page.locator('#silm-property-summary').textContent();
  for(const part of ['O que você alterou','O que aconteceu','Como interpretar','Qualitativa','Não homologado no banco do SILM','não corresponde diretamente à velocidade real dos portadores'])assert.ok(t.includes(part),part);
  assert.ok(!/condutividade alta|conduz mais|CFC conduz/i.test(t),'Sem ranking arbitrário');await shot(page,'p09-ver-propriedade');
  await openRight(page,'dados','Tabela');assert.match(await page.locator('#context-panel').textContent(),/Propriedades \(dados tabelados\)/);
  await openRight(page,'dados','Relatório');/* 0.10.1: Relatório no ponto de partida de Dados */await page.click('#dock-data-report-open');await page.waitForSelector('#report-document');assert.match(await page.locator('#report-document').textContent(),/Experiência de propriedade em estudo: Condutividade elétrica/);
  await page.goto(kit.base+'#/manual/propriedades-metalicas');await page.waitForTimeout(400);const manual=await page.locator('main').textContent();
  for(const part of ['Condutividade elétrica','Condutividade térmica','Maleabilidade','Ductilidade','Brilho metálico','Limitações'])assert.ok(manual.includes(part),part);
  return {ver:true,dados:true,report:true,manual:true};
 });

 await test('0.7-A11Y','Acessibilidade automatizada (axe-core) com experiência ativa',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await crystal(page,'Cu',4);await start(page,'thermal');await act(page,'heat');await openLeft(page,'Propriedades');
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#workspace').analyze();
  const serious=scan.violations.filter(v=>['serious','critical'].includes(v.impact));assert.deepEqual(serious.map(v=>v.id+': '+v.nodes.map(n=>n.target.join(' ')).join(' | ')),[]);
  return {violations:scan.violations.length,serious:serious.length};
 });
}};
