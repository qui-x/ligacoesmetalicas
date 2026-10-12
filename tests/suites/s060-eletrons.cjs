'use strict';
/* Série 0.6.x — modelo eletrônico e elétrons deslocalizados (itens 109–137 do prompt 0.6.x). */
module.exports={series:'0.6',async run(kit,{screenshots=false}={}){
 const {assert,state,go,investigate,assemble,reload,answer,openLeft,closeLeft,openRight,closeRight,switchModule,crystal}=kit;
 const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const snap=page=>page.evaluate(()=>document.querySelector('.silm-electron-canvas')?.silmElectrons.snapshot()??null);
 const electrons=async page=>{await page.click('#silm-electrons-toggle');await page.waitForFunction(()=>SILM.scientificState.electrons?.representation.visible===true);await page.waitForTimeout(120);};
 const frames=async(page,ms=500)=>{const a=(await snap(page)).frames;await page.waitForTimeout(ms);return (await snap(page)).frames-a;};
 const nearestIndex=(p,centers)=>{let best=0,d=Infinity;centers.forEach((c,i)=>{const x=Math.hypot(p.x-c.x,p.y-c.y);if(x<d){d=x;best=i;}});return {i:best,d};};
 /* Distribuição coletiva: muitos centros com marcadores por perto e nenhum centro concentrando a nuvem. */
 const collective=s=>{const counts=new Array(s.centerList.length).fill(0);for(const p of s.particles)counts[nearestIndex(p,s.centerList).i]++;
  const covered=counts.filter(n=>n>0).length/counts.length,share=Math.max(...counts)/s.particles.length;return {covered:+covered.toFixed(2),maxShare:+share.toFixed(2),count:s.count};};

 await test('0.6-109','Migração da 0.5.x (schema 4) sem perda: estrutura, metal, investigação e representação',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.click('#silm-crystal-view-lattice');await page.click('#silm-crystal-neighbors');const s5=await state(page);
  const v050=JSON.parse(JSON.stringify(s5));v050.schemaVersion=4;
  const migrated=await use({seed:v050});await go(migrated);await migrated.waitForSelector('.silm-crystal');const s=await state(migrated);
  assert.equal(s.schemaVersion,await migrated.evaluate(()=>SILM.scientificSchemaVersion));assert.deepEqual(s.structure,s5.structure);assert.equal(s.electrons,null);assert.equal(s.investigation.id,s5.investigation.id);assert.equal(s.metal.symbol,'Cu');
  assert.equal(await migrated.getAttribute('.silm-crystal','data-view'),'lattice');assert.equal(await migrated.getAttribute('#silm-crystal-neighbors','aria-pressed'),'true');
  return {from:4,to:5,representation:'lattice + vizinhos preservados'};
 });

 await test('0.6-110','Estrutura existente → Mostrar elétrons → modelo ativo',async use=>{
  const page=await use();await investigate(page);await assemble(page,3);
  assert.equal(await page.getAttribute('#silm-electrons-toggle','aria-pressed'),'false');assert.equal((await state(page)).electrons,null);
  await electrons(page);const e=(await state(page)).electrons,db=await page.evaluate(()=>{const x=SILM.data.get(29);return {v:x.valenceModel.sourceId,c:x.electronConfiguration.sourceId};});
  assert.deepEqual({type:e.type,status:e.status,z:e.metalAtomicNumber,source:e.source,r:e.representation},{type:'delocalized-electron-model',status:'active',z:29,source:{model:'valence-electron-contribution',valenceSourceId:db.v,configurationSourceId:db.c},r:{visible:true,motion:true,densityMode:'qualitative',representationType:'qualitative'}});
  assert.ok(!('particles' in e)&&!('electronCountReal' in e));
  const s=await snap(page);assert.ok(s.visible&&s.running&&s.count>=24&&s.count<=150,JSON.stringify({count:s.count,running:s.running}));
  assert.equal(await page.getAttribute('#silm-electrons-toggle','aria-pressed'),'true');assert.match(await page.locator('#silm-electron-status').textContent(),/Elétrons visíveis · movimento visual ativo/);
  assert.match(await page.locator('#silm-assembly-feedback').textContent(),/Representação qualitativa de elétrons de valência deslocalizados/);
  assert.match(await page.locator('#silm-electron-legend').textContent(),/representação didática preliminar/);
  const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),kit.KEY);assert.deepEqual(stored.electrons,e);
  await openRight(page,'dados','Histórico');assert.match(await page.locator('#silm-history').textContent(),/Modelo eletrônico ativado/);await closeRight(page);
  await shot(page,'e01-livre-eletrons-visiveis');return {count:s.count,target:s.target,type:e.type};
 });

 await test('0.6-111','Ocultar e mostrar repetidamente: modelo preservado, sem recriação inconsistente',async use=>{
  const page=await use();await crystal(page,'Cu',4);await electrons(page);const created=(await state(page)).electrons;await page.click('#silm-electrons-motion');
  const before=await snap(page);
  for(let i=0;i<6;i++){await page.click('#silm-electrons-toggle');const s=await state(page);assert.equal(s.electrons.representation.visible,i%2===1);assert.equal(s.electrons.createdAt,created.createdAt);
   const v=await snap(page);if(i%2===0){assert.equal(v.visible,false);assert.equal(v.running,false);assert.equal(await page.isVisible('.silm-electron-canvas'),false);if(i===0)await shot(page,'e02-eletrons-ocultos');}}
  const after=await snap(page);
  assert.deepEqual(after.particles,before.particles,'Estático: mesmos marcadores após ocultar e mostrar');assert.equal((await state(page)).electrons.representation.visible,true);
  assert.match(await page.locator('#silm-electron-status').textContent(),/representação estática/);
  return {toggles:6,particles:after.count,recreated:false};
 });

 await test('0.6-112','Movimento: percorre a estrutura, sem órbita e sem direção predominante',async use=>{
  const page=await use();await crystal(page,'Fe',3);await electrons(page);
  const samples=[];for(let k=0;k<10;k++){samples.push(await snap(page));await page.waitForTimeout(400);}
  const centers=samples[0].centerList,n=Math.min(...samples.map(s=>s.particles.length));
  const visited=[];for(let i=0;i<n;i++){const set=new Set(samples.map(s=>nearestIndex(s.particles[i],centers).i));visited.push(set.size);}
  const mean=visited.reduce((a,b)=>a+b,0)/n,moved=samples[0].particles.slice(0,n).filter((p,i)=>Math.hypot(p.x-samples[9].particles[i].x,p.y-samples[9].particles[i].y)>.02).length/n;
  const drift=samples.map(s=>{const m=s.particles.reduce((a,p)=>({x:a.x+p.dx,y:a.y+p.dy}),{x:0,y:0});return Math.hypot(m.x,m.y)/s.particles.length;}),avgDrift=drift.reduce((a,b)=>a+b,0)/drift.length;
  assert.ok(mean>=2.3,'Marcadores visitam vários centros (média '+mean.toFixed(2)+')');assert.ok(moved>.8,'Marcadores se movem');assert.ok(avgDrift<.25,'Sem direção macroscópica (deriva média '+avgDrift.toFixed(3)+')');
  return {meanCentersVisited:+mean.toFixed(2),moved:+moved.toFixed(2),meanDrift:+avgDrift.toFixed(3),particles:n};
 });

 await test('0.6-113','Sem estrutura (ou com uma unidade): modelo eletrônico não pode ser ativado',async use=>{
  const page=await use();await investigate(page);assert.equal(await page.locator('#silm-electrons-toggle').count(),0,'Sem controles de elétrons sem estrutura');
  await openLeft(page,'Estrutura');assert.equal(await page.locator('#silm-panel-electrons').count(),0);await closeLeft(page);
  await assemble(page,1);assert.equal(await page.getAttribute('#silm-electrons-toggle','aria-disabled'),'true');
  await page.click('#silm-electrons-toggle',{force:true});assert.equal((await state(page)).electrons,null);assert.match(await page.locator('#silm-electron-status').textContent(),/ao menos duas unidades/);
  await openLeft(page,'Estrutura');assert.equal(await page.getAttribute('#silm-panel-electrons','aria-disabled'),'true');await closeLeft(page);
  await page.click('#silm-assembly-add');assert.equal(await page.getAttribute('#silm-electrons-toggle','aria-disabled'),'false');
  await electrons(page);await page.click('#silm-assembly-undo');await page.waitForFunction(()=>SILM.scientificState.electrons===null);
  assert.match(await page.locator('#silm-assembly-feedback').textContent(),/Modelo eletrônico desativado/);assert.equal(await page.isVisible('.silm-electron-canvas'),false);
  return {withoutStructure:'sem controles',oneUnit:'indisponível',undoBelowTwo:'modelo removido'};
 });

 await test('0.6-114','Montagem livre: distribuição preliminar associada às unidades',async use=>{
  const page=await use();await investigate(page);await assemble(page,6);await electrons(page);await page.click('#silm-electrons-motion');
  const s=await snap(page),inside=s.particles.filter(p=>nearestIndex(p,s.centerList).d<=s.radius*1.05).length/s.count,c=collective(s);
  assert.ok(inside>=.7,'Marcadores na região da montagem ('+inside.toFixed(2)+')');assert.ok(c.covered>=.8&&c.maxShare<=.4,JSON.stringify(c));
  return {...c,inside:+inside.toFixed(2),bridges:s.bridges};
 });

 for(const [id,symbol,code,file] of [['0.6-115','Fe','CCC','e03-ccc-eletrons'],['0.6-116','Cu','CFC','e04-cfc-eletrons'],['0.6-117','Mg','HC','e05-hc-eletrons']])
  await test(id,code+': distribuição coletiva sobre a estrutura',async use=>{
   const page=await use();await crystal(page,symbol,3);await electrons(page);await page.click('#silm-electrons-motion');
   const s=await snap(page),c=collective(s);assert.ok(c.covered>=.75,'Centros cobertos: '+c.covered);assert.ok(c.maxShare<=.3,'Nenhum centro concentra a nuvem: '+c.maxShare);
   assert.equal(await page.locator('#silm-assembly-stage line').count(),await page.locator('.silm-cell-edges line').count(),'Sem pares M—M');
   await page.click('#silm-electrons-motion');await shot(page,file);return c;
  });

 await test('0.6-118','Célula unitária: elétrons não ficam presos às bordas da célula',async use=>{
  const page=await use();await crystal(page,'Cu',4);await electrons(page);
  let outside=0;for(let k=0;k<4;k++){const s=await snap(page),xs=s.centerList.map(c=>c.x),ys=s.centerList.map(c=>c.y),box={x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};
   outside=Math.max(outside,s.particles.filter(p=>p.x<box.x0||p.x>box.x1||p.y<box.y0||p.y>box.y1).length);await page.waitForTimeout(300);}
  assert.ok(outside>=3,'Marcadores além do contorno da célula: '+outside);
  await page.click('#silm-crystal-neighbors');await page.click('#silm-electrons-toggle');await page.click('#silm-electrons-toggle');assert.equal((await state(page)).structure.crystallography.representation.neighbors,true);
  return {outsideCellBox:outside};
 });

 await test('0.6-119','Rede extensa: a distribuição continua além da célula',async use=>{
  const page=await use();await crystal(page,'Cu',4);await electrons(page);await page.click('#silm-crystal-view-lattice');await page.waitForTimeout(200);
  const s=await snap(page),xs=s.particles.map(p=>p.x),ys=s.particles.map(p=>p.y),spanX=Math.max(...xs)-Math.min(...xs),spanY=Math.max(...ys)-Math.min(...ys);
  assert.ok(s.centers>14,'Centros da rede incluídos: '+s.centers);assert.ok(spanX>=.8&&spanY>=.8,JSON.stringify({spanX,spanY}));
  await shot(page,'e06-rede-extensa-eletrons');return {centers:s.centers,particles:s.count,spanX:+spanX.toFixed(2),spanY:+spanY.toFixed(2)};
 });

 await test('0.6-120','Movimento reduzido: elétrons visíveis e estáticos, mesma informação',async use=>{
  const page=await use({reducedMotion:'reduce'});await crystal(page,'Cu',4);await electrons(page);
  const s=await snap(page);assert.ok(s.visible&&s.count>=24);assert.equal(s.running,false);assert.equal(await frames(page,400),0);
  assert.equal(await page.getAttribute('#silm-electrons-motion','aria-disabled'),'true');assert.equal(await page.getAttribute('#silm-electrons-motion','aria-pressed'),'false');assert.match(await page.locator('#silm-electron-status').textContent(),/movimento reduzido/);
  assert.match(await page.locator('#silm-electron-status').textContent(),/representação estática/);assert.match(await page.getAttribute('#silm-assembly-stage','aria-label'),/representação estática/);
  await shot(page,'e07-movimento-reduzido');
  // Preferência interna do SILM (Acessibilidade → Reduzir movimento) também prevalece.
  const other=await use();await crystal(other,'Fe',2);await electrons(other);assert.equal((await snap(other)).running,true);
  await other.evaluate(()=>SimCore.accessibility.set('motion',true));await other.waitForTimeout(200);assert.equal((await snap(other)).running,false);assert.equal(await frames(other,300),0);assert.ok((await snap(other)).visible);
  await other.evaluate(()=>SimCore.accessibility.set('motion',false));await other.waitForTimeout(200);assert.equal((await snap(other)).running,true);
  return {system:'estático',internal:'estático e retomado ao desligar'};
 });

 await test('0.6-121','Reload: configuração eletrônica restaurada',async use=>{
  const page=await use();await crystal(page,'Mg',2);await electrons(page);await page.click('#silm-electrons-motion');const before=(await state(page)).electrons;
  await reload(page);await page.waitForSelector('.silm-crystal');const after=(await state(page)).electrons;assert.deepEqual(after,before);
  const s=await snap(page);assert.ok(s.visible&&!s.running);assert.match(await page.locator('#silm-electron-status').textContent(),/representação estática/);
  await page.click('#silm-electrons-toggle');await reload(page);await page.waitForSelector('.silm-crystal');assert.equal((await state(page)).electrons.representation.visible,false);assert.equal(await page.isVisible('.silm-electron-canvas'),false);
  await page.click('#silm-electrons-toggle');await page.click('#silm-electrons-motion');assert.equal((await snap(page)).running,true,'Animação reiniciada de forma segura');
  return {restored:true};
 });

 await test('0.6-122','Limpar estrutura: structure = null, electrons = null, metal permanece',async use=>{
  const page=await use();await crystal(page,'Cu',4);await electrons(page);await openLeft(page,'Estrutura');await page.click('#silm-panel-clear');await answer(page,'Limpar estrutura');
  const s=await state(page);assert.equal(s.structure,null);assert.equal(s.electrons,null);assert.equal(s.metal.symbol,'Cu');assert.equal(await page.locator('.silm-electron-canvas').count(),0);
  return {structure:null,electrons:null,metal:'Cu'};
 });

 await test('0.6-123','Reset: sem partículas residuais',async use=>{
  const page=await use();await investigate(page);await assemble(page,4);await electrons(page);await openLeft(page,'Metal');await page.click('#silm-panel-reset');await answer(page,'Resetar investigação');
  const s=await state(page);assert.equal(s.electrons,null);assert.equal(s.structure,null);assert.equal(await page.locator('.silm-electron-canvas').count(),0);
  const raf=await page.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();(function f(){n++;if(performance.now()-t0<300)requestAnimationFrame(f);else r(n);})();}));
  return {electrons:null,canvas:0,metal:s.metal.symbol,rafProbe:raf};
 });

 await test('0.6-124','Troca de metal: o modelo eletrônico não migra para o novo metal',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,3);await electrons(page);
  await openLeft(page,'Metal');await page.click('#silm-select-metal');await page.click('.silm-periodic .periodic-element[data-symbol="Fe"]');await page.click('.silm-periodic [id$="-investigate"]');await answer(page,'Iniciar nova investigação');
  await page.waitForSelector('#silm-start-assembly');const s=await state(page);assert.equal(s.metal.symbol,'Fe');assert.equal(s.electrons,null);assert.equal(s.structure,null);
  await assemble(page,2);assert.equal(await page.getAttribute('#silm-electrons-toggle','aria-pressed'),'false');
  return {metal:'Fe',electrons:null};
 });

 await test('0.6-125','Aba oculta: animação pausada e retomada de forma limpa',async use=>{
  const page=await use();await crystal(page,'Cu',4);await electrons(page);assert.ok(await frames(page,300)>0);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal((await snap(page)).running,false);assert.equal(await frames(page,400),0,'Sem trabalho com a aba oculta');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal((await snap(page)).running,true);assert.ok(await frames(page,300)>0);return {paused:true,resumed:true};
 });

 for(const [w,h,label] of [[320,740,'320'],[360,760,'360'],[390,844,'390'],[844,390,'landscape'],[768,1024,'tablet']])await test('0.6-126-'+label,'Mobile/tablet '+label+' com elétrons',async use=>{
  const page=await use({width:w,height:h,mobile:w<900});await crystal(page,'Cu',4);await page.locator('#silm-electrons-toggle').scrollIntoViewIfNeeded();
  if(w<900)await page.locator('#silm-electrons-toggle').tap();else await page.click('#silm-electrons-toggle');await page.waitForFunction(()=>SILM.scientificState.electrons?.representation.visible===true);
  const m=await page.evaluate(()=>{const s=document.getElementById('silm-assembly-stage').getBoundingClientRect(),t=document.getElementById('silm-electrons-toggle').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,stage:Math.round(s.width),toggle:t.width>0&&t.right<=innerWidth};});
  const s=await snap(page);m.particles=s.count;
  assert.ok(m.overflow<=0&&m.toggle,JSON.stringify(m));assert.ok(m.stage>=(label==='landscape'?150:200),JSON.stringify(m));if(m.stage<360)assert.ok(s.count<=80,'Densidade reduzida em tela pequena: '+s.count);
  await page.locator('#silm-assembly-stage').scrollIntoViewIfNeeded();await shot(page,'m-'+label+'-eletrons');return m;
 });

 await test('0.6-127','Desempenho: estrutura de 48 unidades com elétrons ativos',async use=>{
  const page=await use();await investigate(page);await assemble(page,48);await electrons(page);await page.waitForTimeout(1500);
  const s=await snap(page);assert.ok(s.count<=150,'Marcadores limitados: '+s.count);assert.ok(s.cost<6,'Custo médio por quadro: '+s.cost.toFixed(2)+' ms');
  const fps=await frames(page,1000);assert.ok(fps>=30,'Quadros por segundo: '+fps);
  const dom=await page.evaluate(()=>document.querySelectorAll('#silm-assembly-stage *').length);
  return {units:48,particles:s.count,costMs:+s.cost.toFixed(2),framesPerSecond:fps,stageDomNodes:dom};
 });

 await test('0.6-128','Alto contraste: marcadores perceptíveis',async use=>{
  const page=await use();await crystal(page,'Fe',3);await electrons(page);await page.click('#silm-electrons-motion');await page.evaluate(()=>SimCore.accessibility.set('contrast',true));await page.waitForTimeout(250);
  const color=await page.evaluate(()=>{const c=document.querySelector('.silm-electron-canvas'),s=c.silmElectrons.snapshot(),p=s.particles[0],x=Math.round(p.x*c.width),y=Math.round(p.y*c.height),d=c.getContext('2d').getImageData(x,y,1,1).data;return [...d];});
  assert.ok(color[0]<60&&color[1]>200&&color[2]>200,'Ciano puro no alto contraste: '+color.join());await shot(page,'e08-alto-contraste');return {pixel:color.slice(0,3)};
 });

 await test('0.6-129','Visão de cores: informação identificável por forma, contorno e texto',async use=>{
  const page=await use();await crystal(page,'Cu',4);await electrons(page);await page.click('#silm-electrons-motion');
  for(const mode of ['protanopia','deuteranopia','tritanopia','acromatopsia']){await page.evaluate(m=>SimCore.accessibility.set('colorblind',m),mode);await page.waitForTimeout(120);
   const s=await snap(page);assert.ok(s.visible&&s.count>0);assert.match(await page.locator('#silm-electron-status').textContent(),/Elétrons visíveis/);}
  const edge=await page.evaluate(()=>getComputedStyle(document.getElementById('silm-assembly-stage')).getPropertyValue('--silm-electron-edge').trim());assert.ok(edge,'Contorno de contraste definido');
  await shot(page,'e09-visao-de-cores');await page.evaluate(()=>SimCore.accessibility.set('colorblind','none'));return {modes:4,edge};
 });

 await test('0.6-130','Texto em 150%: controles de elétrons utilizáveis',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.evaluate(()=>SimCore.accessibility.set('fontScale',1.5));await page.waitForTimeout(250);
  await page.click('#silm-electrons-toggle');await page.click('#silm-electrons-motion');const s=await state(page);assert.equal(s.electrons.representation.motion,false);
  const m=await page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage').getBoundingClientRect();return {stage:Math.round(st.width),overflow:document.documentElement.scrollWidth-innerWidth};});
  assert.ok(m.stage>=240&&m.overflow<=0,JSON.stringify(m));return m;
 });

 await test('0.6-131','Teclado: todos os controles de elétrons operáveis; marcadores fora da ordem de tabulação',async use=>{
  const page=await use();await crystal(page,'Cu',4);
  await page.focus('#silm-electrons-toggle');await page.keyboard.press('Enter');await page.waitForFunction(()=>SILM.scientificState.electrons?.representation.visible===true);
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'silm-electrons-motion');await page.keyboard.press('Space');assert.equal((await state(page)).electrons.representation.motion,false);
  await openLeft(page,'Estrutura');await page.focus('#silm-panel-electrons');await page.keyboard.press('Enter');assert.equal((await state(page)).electrons.representation.visible,false);
  await page.keyboard.press('Enter');assert.equal((await state(page)).electrons.representation.visible,true);await closeLeft(page);
  const focusable=await page.evaluate(()=>{const c=document.querySelector('.silm-electron-canvas');return c.tabIndex<0&&c.getAttribute('aria-hidden')==='true'&&!c.closest('[role=button]');});assert.ok(focusable);
  return {keyboard:true};
 });

 await test('0.6-MOD','Módulos: Medir e Calcular mostram sem medir ou calcular elétrons; ativação só em Explorar',async use=>{
  const page=await use();await crystal(page,'Cu',4);await switchModule(page,'medir');
  assert.equal(await page.getAttribute('#silm-electrons-toggle','aria-disabled'),'true');assert.match(await page.locator('#silm-electron-status').textContent(),/Ative os elétrons em Explorar/);
  await switchModule(page,'explorar');await electrons(page);await switchModule(page,'calcular');assert.ok((await snap(page)).visible,'Representação acompanha a troca de módulo');
  await page.click('#silm-electrons-toggle');assert.equal((await state(page)).electrons.representation.visible,false);
  const text=await page.locator('#workspace').textContent();// Fronteira que continua valendo após a 0.7.x (que introduz o campo elétrico qualitativo): sem voltagem, circuito ou instrumentos.
  assert.ok(!/voltagem|circuito|bateria|amperímetro|voltímetro/i.test(text),'Sem circuito nem instrumentos');
  return {medir:'ativação indisponível',calcular:'visibilidade alterável'};
 });

 await test('0.6-TRANS','Transição átomo isolado → estrutura ao adicionar unidade',async use=>{
  const page=await use();await investigate(page);await assemble(page,3);await electrons(page);await page.waitForTimeout(300);
  const before=(await snap(page)).count;await page.click('#silm-assembly-add');const just=await snap(page);
  const newUnit=(await state(page)).structure.units.at(-1).position,near=just.particles.filter(p=>Math.hypot(p.x-newUnit.x,p.y-newUnit.y)<just.radius*.5).length;
  assert.ok(near>=4,'Marcadores junto da nova unidade: '+near);
  await page.waitForTimeout(2200);const later=await snap(page);assert.ok(later.count<=later.target,'Densidade volta ao alvo: '+later.count+'/'+later.target);
  const reduced=await use({reducedMotion:'reduce'});await investigate(reduced);await assemble(reduced,3);await electrons(reduced);await reduced.click('#silm-assembly-add');const r=await snap(reduced);assert.ok(r.count<=r.target,'Sem transição com movimento reduzido');
  return {before,afterAdd:just.count,nearNewUnit:near,settled:later.count};
 });

 await test('0.6-VER','Ver → Observar: modelo eletrônico, origem conceitual, limites e Manual',async use=>{
  const page=await use();await crystal(page,'Cu',4);await electrons(page);await openRight(page,'ver');await page.waitForSelector('#silm-electron-summary');
  const text=await page.locator('#silm-electron-summary').textContent(),valence=await page.evaluate(()=>SILM.data.get(29).valenceModel.display);
  assert.match(text,/Centros metálicos positivos envolvidos por elétrons de valência deslocalizados/);assert.ok(text.includes(valence));assert.match(text,/não correspondem ao número real de elétrons/);
  assert.match(text,/Representação qualitativa/);assert.ok(!/mar de elétrons/i.test(text),'Sem “mar de elétrons” isolado');assert.ok(!/Cu\+|Cu2\+|M⁺/.test(text),'Sem carga formal');
  assert.match(await page.getAttribute('.silm-electron-diagram','aria-label'),/átomo isolado/);
  await page.click('#silm-electron-summary details summary');await shot(page,'e10-ver-modelo-eletronico');
  await page.click('#silm-electron-manual');await page.waitForFunction(()=>location.hash.includes('eletrons-deslocalizados'));
  const manual=await page.locator('main').textContent();for(const part of ['Ideia principal','Observe','O que significa','Limites da representação'])assert.ok(manual.includes(part),part);
  await page.goto(kit.base+'#/laboratorio');await page.waitForSelector('.silm-crystal');await openRight(page,'dados','Relatório');await page.click('#silm-report');await page.waitForSelector('#report-document');assert.match(await page.locator('#report-document').textContent(),/Modelo eletrônico ativo \(representação qualitativa\)/);
  return {section:true,manual:true,report:true};
 });

 await test('0.6-A11Y','Acessibilidade automatizada (axe-core) com elétrons visíveis',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await crystal(page,'Cu',4);await electrons(page);await openRight(page,'ver');await page.waitForSelector('#silm-electron-summary');
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#workspace').analyze();
  const serious=scan.violations.filter(v=>['serious','critical'].includes(v.impact));assert.deepEqual(serious.map(v=>v.id+': '+v.nodes.map(n=>n.target.join(' ')).join(' | ')),[]);
  return {violations:scan.violations.length,serious:serious.length};
 });
}};
