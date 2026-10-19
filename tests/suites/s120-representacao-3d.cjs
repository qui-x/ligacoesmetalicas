'use strict';
/* Série 0.12.x — representação 3D científica: a mesma estrutura (Å) vista por uma câmera de órbita, com perspectiva ou
   ortográfica e planos XY, XZ e YZ. Nada aqui cria estado científico: trocar 2D/3D, girar, aproximar e escolher a
   projeção não mudam metal, estrutura, elétrons, propriedade, medições nem cálculos. */
module.exports={series:'0.12',async run(kit,{screenshots=false}={}){
 const {assert,state,go,investigate,assemble,organize,crystal,openLeft,closeLeft,openRight,closeRight,switchModule,reload}=kit;const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const rep=page=>page.evaluate(()=>SILM.representationState);
 const snap=page=>page.evaluate(()=>document.getElementById('silm-assembly-stage').silmRenderer.snapshot());
 const to3d=async(page,value='3d')=>{await page.selectOption('#silm-crystal-projection',value);await page.waitForFunction(()=>document.querySelector('.silm-crystal')?.dataset.viewMode==='3d');await page.waitForTimeout(60);};
 const to2d=async(page,value='isometric')=>{await page.selectOption('#silm-crystal-projection',value);await page.waitForFunction(()=>document.querySelector('.silm-crystal')?.dataset.viewMode==='2d');await page.waitForTimeout(60);};
 const centres=page=>page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.silm-crystal-unit')].map(n=>{const r=n.getBoundingClientRect();return [n.dataset.unitId,{x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,role:n.dataset.role,layer:n.dataset.layer}];})));
 const drag=async(page,dx,dy,{shift=false}={})=>{const b=await page.locator('#silm-assembly-stage').boundingBox(),x=b.x+b.width*.12,y=b.y+b.height*.9;if(shift)await page.keyboard.down('Shift');
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:8});await page.mouse.up();if(shift)await page.keyboard.up('Shift');await page.waitForTimeout(120);};
 // Com 14 unidades há sobreposição na tela: a escolha é feita pelo próprio botão da unidade (o mesmo caminho do Enter).
 const pick=(page,id)=>page.evaluate(id=>document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`).click(),id);
 const measure=async(page,ids)=>{const n=(await state(page)).measurements.length+1;for(const id of ids)await pick(page,id);await page.waitForFunction(n=>SILM.scientificState.measurements.length===n,n);return (await state(page)).measurements.at(-1);};

 await test('0.12-01','2D ↔ 3D não muda o estado científico; seleção preservada; montagem livre fica em 2D',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,3);
  // Montagem livre: posições normalizadas em 2D, sem coordenadas em Å — não há vista 3D (o seletor de vista não existe).
  assert.equal(await page.locator('#silm-crystal-projection').count(),0);assert.equal((await rep(page)).viewMode,'2d');
  await organize(page);const u=(await state(page)).structure.units[2];await page.click(`.silm-crystal-unit[data-unit-id="${u.id}"]`);
  const before=JSON.stringify(await state(page));await to3d(page);
  assert.equal(JSON.stringify(await state(page)),before,'estado científico idêntico ao entrar no 3D');
  assert.equal(await page.getAttribute(`.silm-crystal-unit[data-unit-id="${u.id}"]`,'aria-pressed'),'true','seleção preservada');
  const r=await rep(page);assert.equal(r.viewMode,'3d');assert.equal(r.camera3D.projection,'perspective');assert.equal(r.version,2);
  await drag(page,90,30);await page.click('#silm-camera-in');await to2d(page,'front');
  assert.equal(JSON.stringify(await state(page)),before,'girar, aproximar e voltar ao 2D não escrevem no estado');
  assert.equal((await rep(page)).projection,'front');await shot(page,'t01-volta-2d');return {};
 });

 await test('0.12-02','CCC, CFC e HC em 3D: vértices, centro do corpo, centros das faces e hexágono nos planos XY, XZ, YZ',async use=>{
  const out={};
  for(const [sym,n] of [['Fe',9],['Cu',14],['Mg',17]]){
   const page=await use({reducedMotion:'reduce'});await crystal(page,sym,n);await to3d(page,'3d-xy');await page.click('#silm-camera-perspective');await page.waitForTimeout(80);   // XY ortográfico
   const c=Object.values(await centres(page)),s=await state(page);assert.equal(c.length,s.structure.units.length,'as mesmas unidades do 2D');
   const corners=c.filter(p=>p.role==='corner'||p.role==='base-vertex'),xs=corners.map(p=>p.x),ys=corners.map(p=>p.y),mid={x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2};
   if(sym==='Fe'){const body=c.find(p=>p.role==='body');assert.ok(Math.hypot(body.x-mid.x,body.y-mid.y)<1.5,'centro do corpo no centro do quadrado (XY)');
    const distinct=new Set(corners.map(p=>Math.round(p.x)+','+Math.round(p.y)));assert.equal(distinct.size,4,'em XY os 8 vértices coincidem dois a dois');}
   if(sym==='Cu'){const faces=c.filter(p=>p.role==='face');assert.equal(faces.length,6);assert.ok(faces.some(p=>Math.hypot(p.x-mid.x,p.y-mid.y)<1.5),'centros das faces z = 0 e z = a no centro (XY)');}
   if(sym==='Mg'){const base=c.filter(p=>p.role==='base-vertex'),centre=c.filter(p=>p.role==='base-center');const ring=new Set(base.map(p=>Math.round(p.x/2)+','+Math.round(p.y/2)));
    assert.equal(ring.size,6,'hexágono: 6 vértices distintos em XY');const r0=base.map(p=>Math.hypot(p.x-centre[0].x,p.y-centre[0].y));assert.ok(Math.max(...r0)-Math.min(...r0)<1.5,'vértices equidistantes do centro da base');
    await page.selectOption('#silm-crystal-projection','3d-xz');await page.waitForTimeout(80);const xz=Object.values(await centres(page)),levels=new Set(xz.map(p=>Math.round(p.y)));assert.ok(levels.size>=3,'XZ mostra o empilhamento em camadas: '+levels.size);}
   const lines=await page.evaluate(()=>({all:document.querySelectorAll('#silm-assembly-stage line').length,cell:document.querySelectorAll('.silm-cell-edges line').length}));assert.equal(lines.all,lines.cell,'sem barras M—M');
   if(sym==='Mg')await shot(page,'t02-hc-xz');out[sym]=c.length;
  }
  return out;
 });

 await test('0.12-03','Câmera 3D: órbita, Shift + arrastar desloca, zoom, enquadrar, restaurar; perspectiva × ortográfica',async use=>{
  const page=await use();await crystal(page,'Cu',14);await to3d(page);const o0=(await rep(page)).camera3D;
  await drag(page,100,0);const o1=(await rep(page)).camera3D;assert.ok(o1.yaw-o0.yaw>30,'arrastar para a direita gira: '+o0.yaw+' → '+o1.yaw);assert.equal(o1.preset,null);
  await drag(page,0,60);const o2=(await rep(page)).camera3D;assert.ok(o2.pitch>o1.pitch+15,'arrastar para baixo inclina: '+o1.pitch+' → '+o2.pitch);
  await drag(page,0,2000);assert.ok((await rep(page)).camera3D.pitch<=90,'inclinação limitada a 90°');
  const before=(await rep(page)).camera3D;await drag(page,80,40,{shift:true});const after=await rep(page);
  assert.equal(after.camera3D.yaw,before.yaw,'Shift + arrastar não gira');assert.equal(after.camera,'free');assert.ok(Math.abs(after.pan.x-.5)>.02,'Shift + arrastar desloca');
  await page.click('#silm-camera-in');assert.ok(Math.abs((await snap(page)).camera.zoom-1.25*(after.zoom))<1e-6||((await snap(page)).camera.zoom>after.zoom));
  await page.click('#silm-camera-fit');assert.equal((await snap(page)).camera.mode,'fit');
  await page.click('#silm-camera-reset');const reset=(await rep(page)).camera3D;assert.equal(reset.preset,'3d');assert.deepEqual([reset.yaw,reset.pitch],[o0.yaw,o0.pitch],'restaurar volta à orientação de referência');
  // Ortográfica: arestas paralelas do cubo têm o mesmo comprimento projetado; na perspectiva, a da frente é maior.
  const edges=()=>page.evaluate(()=>[...document.querySelectorAll('.silm-cell-edges line')].map(l=>Math.hypot(l.x2.baseVal.value-l.x1.baseVal.value,l.y2.baseVal.value-l.y1.baseVal.value)));
  const spread=list=>{const v=list.filter(x=>x>1).sort((a,b)=>a-b);return v.at(-1)/v[0];};
  await page.selectOption('#silm-crystal-projection','3d-xz');await page.waitForTimeout(80);const persp=spread(await edges());
  await page.click('#silm-camera-perspective');await page.waitForTimeout(80);assert.equal((await rep(page)).camera3D.projection,'orthographic');const ortho=spread(await edges());
  assert.ok(Math.abs(ortho-1)<.02,'ortográfica XZ: arestas visíveis iguais ('+ortho.toFixed(3)+')');assert.ok(persp>1.05,'perspectiva: a aresta da frente é maior ('+persp.toFixed(3)+')');
  return {o0,o1,o2,persp,ortho};
 });

 await test('0.12-04','Invariância: distância e ângulo iguais no 2D e no 3D (qualquer órbita e projeção); cálculos idênticos',async use=>{
  const page=await use();await crystal(page,'Cu',14);await switchModule(page,'medir');const units=(await state(page)).structure.units;
  const ids=await page.evaluate(()=>{const s=SILM.scientificState.structure,g=SILM.crystal.geometry(SILM.data.get(29)),u=s.units[0],keys=new Set(g.neighbors(u.site).list.map(n=>n.key));const near=s.units.filter(v=>keys.has(SILM.crystal.key(v.site)));return [u.id,near[0].id,near[1].id];});
  await openRight(page,'ver','Medir');await page.click('#silm-tool-distance');await closeRight(page);const d2=(await measure(page,ids.slice(0,2))).value;
  await openRight(page,'ver','Medir');await page.click('#silm-tool-angle');await closeRight(page);const a2=(await measure(page,[ids[1],ids[0],ids[2]])).value;
  await to3d(page);const out={d2,a2};
  for(const step of ['3d','orbit','3d-yz','ortho']){
   if(step==='orbit')await drag(page,70,25);else if(step==='ortho')await page.click('#silm-camera-perspective');else await page.selectOption('#silm-crystal-projection',step);await page.waitForTimeout(80);
   await openRight(page,'ver','Medir');await page.click('#silm-tool-distance');await closeRight(page);const d3=(await measure(page,ids.slice(0,2))).value;
   await openRight(page,'ver','Medir');await page.click('#silm-tool-angle');await closeRight(page);const a3=(await measure(page,[ids[1],ids[0],ids[2]])).value;
   assert.equal(d3,d2,'distância 2D = 3D ('+step+')');assert.equal(a3,a2,'ângulo 2D = 3D ('+step+')');out[step]={d3,a3};
  }
  assert.ok(Math.abs(d2-2.556)<.001);assert.equal(JSON.stringify((await state(page)).measurements.map(m=>m.kind)).includes('3d'),false,'sem measurements3D');
  const calc=async()=>{await openRight(page,'ver','Calcular');await page.click('#silm-calc-radius-from-a-fcc');await page.click('#silm-calc-run');await closeRight(page);return (await state(page)).calculations.at(-1).result;};
  await switchModule(page,'calcular');const c3=await calc();assert.equal(await page.locator('[data-layer=calculationOverlay] .silm-dimension-line').count(),1,'d = 2r destacado no 3D');
  await to2d(page);const c2=await calc();
  assert.deepEqual(c3,c2,'cálculo idêntico no 2D e no 3D');await shot(page,'t04-medida-3d');return out;
 });

 await test('0.12-05','Elétrons em 3D: distribuição coletiva, sem estado próprio; ocultos durante a órbita, estáticos com movimento reduzido',async use=>{
  const page=await use({reducedMotion:'reduce'});await crystal(page,'Cu',14);await openLeft(page,'Estrutura');await closeLeft(page);await page.click('#silm-electrons-toggle');await to3d(page);
  const el=()=>page.evaluate(()=>document.querySelector('.silm-electron-canvas').silmElectrons.snapshot());const a=await el();
  assert.ok(a.visible&&a.count>0,'marcadores visíveis no 3D');assert.equal(a.running,false,'movimento reduzido: estático');
  const b=await page.locator('#silm-assembly-stage').boundingBox();await page.mouse.move(b.x+20,b.y+b.height-20);await page.mouse.down();await page.mouse.move(b.x+60,b.y+b.height-30,{steps:4});
  assert.equal((await el()).visible,false,'ocultos durante a órbita');await page.mouse.up();await page.waitForTimeout(150);assert.equal((await el()).visible,true,'voltam ao soltar');
  const s=await state(page);assert.equal(Object.keys(s.electrons).includes('camera3D'),false);assert.equal(s.schemaVersion,8);return {markers:a.count};
 });

 await test('0.12-06','Propriedades em 3D: calor idêntico ao 2D (isométrica de referência); fontes marcadas; luz e forças',async use=>{
  const page=await use({reducedMotion:'reduce'});await crystal(page,'Cu',14);await openLeft(page,'Propriedades');await page.click('#silm-prop-start-thermal');await page.waitForFunction(()=>SILM.scientificState.properties.active==='thermal');
  await page.click('#silm-prop-heat');await page.click('#silm-prop-advance');await closeLeft(page);
  const heat=()=>page.evaluate(()=>[...document.querySelectorAll('.silm-crystal-unit')].map(n=>n.dataset.unitId+':'+n.dataset.heat+(n.hasAttribute('data-heat-source')?'*':'')).sort().join(','));
  const h2=await heat();await to3d(page);assert.equal(await heat(),h2,'níveis e fontes iguais no 3D');await drag(page,120,40);assert.equal(await heat(),h2,'e depois de girar');
  return {h2};
 });

 await test('0.12-07','Falha do 3D: volta ao 2D científico com aviso; nada se perde',async use=>{
  const page=await use();await crystal(page,'Cu',14);const before=JSON.stringify(await state(page));
  await page.evaluate(()=>{SILM.debug={fail3D:true};});await page.selectOption('#silm-crystal-projection','3d');
  await page.waitForFunction(()=>document.querySelector('.silm-crystal')?.dataset.viewMode==='2d'&&document.querySelectorAll('.silm-crystal-unit').length>0);await page.waitForTimeout(150);
  assert.equal((await rep(page)).viewMode,'2d');assert.equal(JSON.stringify(await state(page)),before,'estado intacto');
  const disabled=await page.evaluate(()=>[...document.querySelectorAll('#silm-crystal-projection option[value^="3d"]')].every(o=>o.disabled));assert.ok(disabled,'opções 3D desativadas nesta sessão');
  const toast=await page.evaluate(()=>document.body.innerText.includes('A vista 3D não está disponível'));assert.ok(toast,'aviso ao usuário');
  await page.evaluate(()=>{delete SILM.debug;});return {};
 });

 await test('0.12-08','Ciclo de vida: alternar 2D/3D e módulos várias vezes sem acumular recursos',async use=>{
  const page=await use();await crystal(page,'Cu',14);const base=await page.evaluate(()=>SimCore.scopeStats.resources);
  for(let k=0;k<3;k++){await to3d(page);await drag(page,40,10);await switchModule(page,'medir');await to2d(page);await switchModule(page,'explorar');}
  const end=await page.evaluate(()=>SimCore.scopeStats.resources);assert.ok(end<=base+2,'recursos: '+base+' → '+end);return {base,end};
 });

 await test('0.12-09','Celular: um dedo gira, dois dedos aproximam, toque seleciona; botões de girar com 44 px',async use=>{
  const page=await use({width:390,height:844,mobile:true});await crystal(page,'Cu',14);await to3d(page);const o0=(await rep(page)).camera3D.yaw;
  await page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage'),r=st.getBoundingClientRect(),y=r.y+r.height*.92,x=r.x+r.width*.1;
   const ev=(type,id,cx,cy)=>st.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:true,clientX:cx,clientY:cy,bubbles:true}));
   ev('pointerdown',1,x,y);for(let k=1;k<=8;k++)ev('pointermove',1,x+k*10,y);ev('pointerup',1,x+80,y);});
  await page.waitForTimeout(150);assert.ok((await rep(page)).camera3D.yaw-o0>20,'um dedo gira');
  const z0=(await snap(page)).camera.zoom;await page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage'),r=st.getBoundingClientRect(),cx=r.x+r.width/2,cy=r.y+r.height*.9;
   const ev=(type,id,x)=>st.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===1,clientX:x,clientY:cy,bubbles:true}));
   ev('pointerdown',1,cx-30);ev('pointerdown',2,cx+30);for(let k=1;k<=6;k++){ev('pointermove',1,cx-30-k*10);ev('pointermove',2,cx+30+k*10);}ev('pointerup',1,cx-90);ev('pointerup',2,cx+90);});
  assert.ok((await snap(page)).camera.zoom>z0*1.5,'dois dedos aproximam');
  const t=await page.evaluate(()=>{for(const n of document.querySelectorAll('.silm-crystal-unit')){const r=n.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(document.elementFromPoint(x,y)?.closest('.silm-crystal-unit')===n)return {id:n.dataset.unitId,x,y};}return null;});
  assert.ok(t,'há unidade à frente');await page.touchscreen.tap(t.x,t.y);await page.waitForTimeout(150);
  assert.equal((await state(page)).structure.crystallography.representation.selectedUnitId,t.id,'toque seleciona');
  await page.tap('#silm-camera-toggle');await page.waitForSelector('#silm-camera-yaw-left',{state:'visible'});
  const min=await page.evaluate(()=>Math.min(...['yaw-left','yaw-right','pitch-up','pitch-down','perspective'].map(id=>{const r=document.getElementById('silm-camera-'+id).getBoundingClientRect();return Math.min(r.width,r.height);})));
  assert.ok(min>=44,'alvos ≥ 44 px');const o1=(await rep(page)).camera3D.yaw;await page.tap('#silm-camera-yaw-right');await page.waitForTimeout(80);assert.ok((await rep(page)).camera3D.yaw>o1,'botão gira');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=0,'sem rolagem lateral');await shot(page,'t09-celular-3d');return {min};
 });

 await test('0.12-10','Teclado e acessibilidade: J L I K giram, P alterna a projeção, descrição da cena em 3D, axe sem violações, tab order enxuto',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await crystal(page,'Cu',14);await to3d(page);
  await page.evaluate(()=>{window.__ann=[];const a=document.getElementById('announcer');new MutationObserver(()=>{if(a.textContent)window.__ann.push(a.textContent);}).observe(a,{childList:true,characterData:true,subtree:true});});
  const u=(await state(page)).structure.units[0];await page.focus(`.silm-crystal-unit[data-unit-id="${u.id}"]`);const y0=(await rep(page)).camera3D.yaw;
  await page.keyboard.press('l');await page.waitForTimeout(120);assert.ok((await rep(page)).camera3D.yaw>y0,'L gira para a direita');
  const ann=await page.evaluate(()=>window.__ann);assert.ok(ann.some(t=>/Vista 3D girada/.test(t)),'anúncio da órbita: '+JSON.stringify(ann));await page.keyboard.press('k');const p1=(await rep(page)).camera3D.pitch;await page.keyboard.press('i');assert.ok((await rep(page)).camera3D.pitch<p1,'I inclina para cima');
  await page.keyboard.press('p');assert.equal((await rep(page)).camera3D.projection,'orthographic','P alterna para ortográfica');
  const desc=await page.evaluate(()=>document.getElementById('silm-scene-description').textContent);assert.match(desc,/Vista 3D ortográfica/);assert.match(desc,/referência visual, não é a rede/);assert.match(desc,/escala visual não é escala física/);
  const tabbable=await page.evaluate(()=>document.querySelectorAll('.silm-crystal-unit[tabindex="0"]').length);assert.equal(tabbable,1,'uma só unidade no tab order (tabindex itinerante)');
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#workspace').analyze();
  const violations=scan.violations.map(v=>({id:v.id,nodes:v.nodes.length}));assert.deepEqual(violations,[],JSON.stringify(violations));
  // Alto contraste e visão de cores: os eixos e as unidades continuam distinguíveis (não só por cor: traços e letras).
  const axes=await page.evaluate(()=>[...document.querySelectorAll('.silm-axis')].map(l=>l.getAttribute('stroke-dasharray')||''));assert.equal(new Set(axes).size,3,'eixos distinguíveis pelo traço');
  return {violations:0};
 });

 await test('0.12-11','representationState v2: migra a v1 sem perda; modo 3D e câmera voltam ao recarregar; investigação nova começa em 2D',async use=>{
  const page=await use();await crystal(page,'Cu',14);await page.waitForTimeout(400);const id=(await state(page)).investigation.id;   // gravação adiada já feita
  await page.evaluate(id=>localStorage.setItem('simcore_domain_silm_v1_representation.view',JSON.stringify({version:1,investigationId:id,projection:'top',cameras:{free:{mode:'fit',zoom:1,x:.5,y:.5},crystal:{mode:'free',zoom:1.5625,x:.45,y:.5}}})),id);
  await reload(page);await page.waitForSelector('.silm-crystal-unit');let r=await rep(page);assert.equal(r.version,2);assert.equal(r.viewMode,'2d');assert.equal(r.projection,'top');assert.ok(Math.abs(r.zoom-1.5625)<1e-9,'câmera da v1 preservada');
  await to3d(page,'3d-yz');await page.click('#silm-camera-perspective');await page.waitForTimeout(400);await reload(page);await page.waitForSelector('.silm-crystal-unit');
  r=await rep(page);assert.equal(r.viewMode,'3d');assert.equal(r.camera3D.preset,'yz');assert.equal(r.camera3D.projection,'orthographic');
  await go(page,'montagens');await page.click('#preset-apply-ferro-ccc');const d=kit.dialog(page);if(await d.count())await d.locator('.dialog-actions button.primary-btn').click();
  await page.waitForFunction(()=>SILM.scientificState.metal?.atomicNumber===26&&SILM.scientificState.structure?.mode==='crystalline');assert.equal((await rep(page)).viewMode,'2d','nova investigação em 2D');return {};
 });

 await test('0.12-12','Comparação em 3D usa a mesma orientação; vizinhos em 3D com a mesma coordenação do 2D',async use=>{
  const page=await use();await crystal(page,'Cu',14);await to3d(page,'3d-xz');
  await openRight(page,'ver','Comparar');await page.click('#silm-compare-cell-lattice');await page.click('#silm-compare-open');await page.waitForSelector('dialog.app-dialog[open] .silm-snapshot-stage');
  const panes=await page.evaluate(()=>[...document.querySelectorAll('dialog.app-dialog[open] .silm-snapshot-stage')].map(s=>s.querySelectorAll('.silm-snapshot-edge').length));assert.ok(panes.every(n=>n>0),'células desenhadas');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog.app-dialog[open]'));
  const u=(await state(page)).structure.units.find(x=>x.site.basis===0&&x.site.cell.join()==='0,0,0');await pick(page,u.id);await page.click('#silm-crystal-neighbors');
  const n3=await page.evaluate(()=>document.querySelectorAll('.silm-crystal-unit[data-neighbor]').length+document.querySelectorAll('.silm-neighbor-ghosts circle').length);
  await to2d(page);const n2=await page.evaluate(()=>document.querySelectorAll('.silm-crystal-unit[data-neighbor]').length+document.querySelectorAll('.silm-neighbor-ghosts circle').length);
  assert.equal(n3,12,'CFC: 12 vizinhos em 3D');assert.equal(n3,n2,'mesma coordenação no 2D');return {n3,n2};
 });

 await test('0.12-13','Rede extensa em 3D com limite finito; eixos são referência visual, sem grid confundível com a rede',async use=>{
  const page=await use();await crystal(page,'Fe',9);await to3d(page);await page.click('#silm-crystal-view-lattice');await page.waitForTimeout(300);
  const c=await page.locator('.silm-lattice circle').count();assert.ok(c>20&&c<=260,'rede 3D: '+c);
  await page.evaluate(()=>document.getElementById('silm-assembly-stage').silmRenderer.setCamera({zoom:.5,x:.5,y:.5}));await page.waitForTimeout(400);assert.ok(await page.locator('.silm-lattice circle').count()<=260);
  const axes=await page.evaluate(()=>{const a=document.querySelector('.silm-axes');return {hidden:a.getAttribute('aria-hidden'),inStage:!!a.closest('#silm-assembly-stage'),labels:[...a.querySelectorAll('text')].map(t=>t.textContent)};});
  assert.deepEqual(axes,{hidden:'true',inStage:false,labels:['x','y','z']});await shot(page,'t13-rede-3d');return {c};
 });
}};
