'use strict';
/* Série 0.11.x — representação 2D científica: renderizador comum, câmera (pan, zoom, enquadrar, centralizar, restaurar),
   projeções, camadas, toque central, rede em janela, representationState separado e invariância das medidas.
   Nada aqui muda dado ou cálculo científico: a linha de base da 0.10.1 (pareamento do Organizar e calor) é conferida. */
const BASE={"Cu4":{"pairing":["0,0,0:2","0,1,0:2","0,0,0:3","1,0,0:1"],"heat":["44004040400000","44224242421211","44334343432322","44334343433333","44444444433333"]},"Fe4":{"pairing":["0,0,0:1","1,0,1:0","0,1,0:0","1,1,0:0"],"heat":["404000000","414211100","424222211","424322222","434333322"]},"Mg4":{"pairing":["0,0,0:1","0,-1,1:0","1,1,0:0","0,-1,0:1"],"heat":["40444000000000000","42444111211220010","43444222222221111","43444222333332222","43444333333332233"]},"Cu7":{"pairing":["0,0,1:3","0,1,0:2","1,0,1:0","1,0,0:1","1,1,0:0","0,0,0:3","0,0,0:2"]},"Mg9":{"pairing":["0,0,0:1","0,-1,1:0","-1,-1,0:1","0,-1,0:1","1,0,0:0","0,0,0:0","0,1,0:0","0,-1,0:0","1,1,0:0"]}};
const LAYERS=['background','lattice','unitCell','neighbors','electrons','properties','structure','measurementOverlay','calculationOverlay','labels','selection'];
module.exports={series:'0.11',async run(kit,{screenshots=false}={}){
 const {assert,state,go,investigate,assemble,organize,crystal,openLeft,closeLeft,openRight,closeRight,switchModule,reload,answer}=kit;const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const snap=page=>page.evaluate(()=>document.getElementById('silm-assembly-stage').silmRenderer.snapshot());
 const cam=(page,c)=>page.evaluate(c=>document.getElementById('silm-assembly-stage').silmRenderer.setCamera(c),c);
 const rep=page=>page.evaluate(()=>SILM.representationState);
 const key=s=>s.cell.join(',')+':'+s.basis;
 const heatString=page=>page.evaluate(()=>{const units=SILM.scientificState.structure.units,byId=new Map(units.map(u=>[u.id,u.site.cell.join(',')+':'+u.site.basis]));
  return [...document.querySelectorAll('.silm-crystal-unit')].map(n=>[byId.get(n.dataset.unitId),n.dataset.heat]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(x=>x[1]).join('');});
 const measureDistance=async(page,a,b)=>{const n=(await state(page)).measurements.length+1;for(const id of [a,b])await page.click(`.silm-crystal-unit[data-unit-id="${id}"]`);await page.waitForFunction(n=>SILM.scientificState.measurements.length===n,n);return (await state(page)).measurements.at(-1);};

 await test('0.11-01','Renderizador comum: mesma ordem central de camadas na montagem livre, no cristal e na comparação',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,3);const free=await snap(page);
  assert.equal(await page.getAttribute('#silm-assembly-stage','data-renderer'),'2d');
  const order=list=>list.map(l=>LAYERS.indexOf(l));const sorted=list=>order(list).every((v,i,a)=>i===0||a[i-1]<v);
  assert.ok(sorted(free.layers),'montagem: '+free.layers);await organize(page);const crys=await snap(page);assert.ok(sorted(crys.layers),'cristal: '+crys.layers);
  assert.deepEqual(crys.layers,LAYERS.filter(l=>l!=='background'));
  // z-index vem só da camada (CSS); nada de z-index espalhado fora da camada da estrutura
  const z=await page.evaluate(()=>[...document.querySelectorAll('#silm-assembly-stage>[data-layer]')].map(el=>({layer:el.dataset.layer,z:+getComputedStyle(el).zIndex,inline:el.style.zIndex})));
  assert.ok(z.every((v,i,a)=>i===0||a[i-1].z<v.z),JSON.stringify(z));assert.ok(z.every(v=>!v.inline));
  const bar=await page.evaluate(()=>{const b=document.querySelector('.silm-camera-bar');return {role:b.getAttribute('role'),label:b.getAttribute('aria-label'),buttons:[...b.querySelectorAll('button')].map(x=>x.getAttribute('aria-label')),zoom:b.querySelector('.silm-camera-zoom').textContent,zoomHidden:b.querySelector('.silm-camera-zoom').getAttribute('aria-hidden'),live:b.querySelectorAll('output,[aria-live]').length,inStage:!!b.closest('#silm-assembly-stage')};});
  assert.deepEqual(bar,{role:'toolbar',label:'Controles da vista',buttons:['Aproximar','Afastar','Enquadrar a estrutura','Centralizar','Restaurar vista'],zoom:'100 %',zoomHidden:'true',live:0,inStage:false});   // valor só visual: sem região viva falando a cada quadro
  await shot(page,'r01-cristal-controles');return {free:free.layers,crystal:crys.layers};
 });

 await test('0.11-02','Câmera padrão é a identidade; zoom, pan, enquadrar, centralizar, restaurar e projeção não tocam no estado científico',async use=>{
  const page=await use();await crystal(page,'Cu',4);const before=JSON.stringify(await state(page));
  assert.deepEqual((await snap(page)).camera,{mode:'fit',zoom:1,x:.5,y:.5});
  for(const id of ['in','in','out','center','fit','in','reset'])await page.click('#silm-camera-'+id);
  await page.keyboard.press('Tab');await page.selectOption('#silm-crystal-projection','top');await page.selectOption('#silm-crystal-projection','side');
  const box=await page.locator('#silm-assembly-stage').boundingBox();await page.mouse.move(box.x+20,box.y+box.height-20);await page.mouse.down();await page.mouse.move(box.x+90,box.y+box.height-60,{steps:5});await page.mouse.up();
  const after=JSON.stringify(await state(page));assert.equal(after,before,'scientificState idêntico');
  const r=await rep(page);assert.equal(r.projection,'side');assert.equal(r.camera,'free');assert.equal(r.version,1);await page.waitForTimeout(400);   // gravação adiada (250 ms)
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('simcore_domain_silm_v1_representation.view')));
  assert.equal(stored.version,1);assert.equal(stored.investigationId,(await state(page)).investigation.id);assert.equal(stored.projection,'side');
  assert.equal((await state(page)).schemaVersion,8,'schema científico inalterado');return {representation:r};
 });

 await test('0.11-03','Invariância obrigatória: a mesma medição a 50 %, 100 % e 200 % de zoom (e em outra projeção)',async use=>{
  const page=await use();await crystal(page,'Cu',4);await switchModule(page,'medir');
  const units=(await state(page)).structure.units,a=units[0],near=await page.evaluate(id=>{const s=SILM.scientificState.structure,g=SILM.crystal.geometry(SILM.data.get(29)),u=s.units.find(x=>x.id===id),keys=new Set(g.neighbors(u.site).list.map(n=>n.key));return s.units.find(v=>keys.has(SILM.crystal.key(v.site)))?.id;},a.id);
  assert.ok(near,'há vizinho imediato na célula');const out={};
  for(const zoom of [1,.5,2]){
   // Com 200 %, a vista centra no meio do par: o palco não rola (0.11.0), então as duas unidades precisam estar à vista.
   const p=await page.evaluate(ids=>{const c=ids.map(id=>{const n=document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`);return {x:parseFloat(n.style.left)/100,y:parseFloat(n.style.top)/100};});return {x:(c[0].x+c[1].x)/2,y:(c[0].y+c[1].y)/2};},[a.id,near]);
   await cam(page,{zoom,x:zoom>1?p.x:.5,y:zoom>1?p.y:.5});assert.ok(Math.abs((await snap(page)).camera.zoom-zoom)<1e-9);
   await openRight(page,'ver','Medir');await page.click('#silm-tool-distance');await closeRight(page);
   const m=await measureDistance(page,a.id,near);out[zoom*100+'%']=m.value;
  }
  await page.selectOption('#silm-crystal-projection','top');await openRight(page,'ver','Medir');await page.click('#silm-tool-distance');await closeRight(page);
  const pTop=await measureDistance(page,a.id,near);out.superior=pTop.value;
  const values=Object.values(out);assert.ok(values.every(v=>v===values[0]),JSON.stringify(out));assert.ok(Math.abs(values[0]-2.556)<.001,'2,556 Å do modelo');
  await shot(page,'r03-medida-zoom');return out;
 });

 await test('0.11-04','Coordenadas: inversa exata e destino tocado com zoom e pan; resize não muda as posições',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,3);
  const round=await page.evaluate(()=>{const R=SILM.renderer2d,cams=[{zoom:1,x:.5,y:.5},{zoom:2,x:.3,y:.7},{zoom:.5,x:.6,y:.4},{zoom:3.7,x:-.2,y:1.3}];let worst=0;
   for(const c of cams)for(const p of [{x:0,y:0},{x:.37,y:.81},{x:1,y:1}]){const q=R.toScene(c,R.toView(c,p));worst=Math.max(worst,Math.abs(q.x-p.x),Math.abs(q.y-p.y));}return worst;});
  assert.ok(round<1e-12,'ida e volta: '+round);
  const u=(await state(page)).structure.units[1];await page.click(`.silm-unit[data-unit-id="${u.id}"]`);
  await cam(page,{zoom:2,x:.4,y:.45});const target={x:.31,y:.62};const pt=await page.evaluate(t=>document.getElementById('silm-assembly-stage').silmRenderer.toClient(t),target);
  await page.mouse.click(pt.x,pt.y);await page.waitForTimeout(150);const moved=(await state(page)).structure.units.find(x=>x.id===u.id).position;
  assert.ok(Math.abs(moved.x-target.x)<.004&&Math.abs(moved.y-target.y)<.004,'destino com zoom 200 %: '+JSON.stringify(moved));
  const before=JSON.stringify((await state(page)).structure);await page.setViewportSize({width:820,height:700});await page.waitForTimeout(300);await page.setViewportSize({width:1366,height:800});await page.waitForTimeout(300);
  assert.equal(JSON.stringify((await state(page)).structure),before,'resize não move');
  return {roundTrip:round,moved};
 });

 await test('0.11-05','Gestos e teclado: arrastar o fundo desloca, Ctrl + roda aproxima no cursor, + − 0 F C e Shift + setas; câmera fora do Desfazer',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,4);const undoTitle=await page.getAttribute('#silm-assembly-undo','title');
  await page.evaluate(()=>{window.__ann=[];const a=document.getElementById('announcer');new MutationObserver(()=>{if(a.textContent)window.__ann.push(a.textContent);}).observe(a,{childList:true,characterData:true,subtree:true});});
  const box=await page.locator('#silm-assembly-stage').boundingBox();const corner={x:box.x+box.width-25,y:box.y+box.height-25};
  await page.mouse.move(corner.x,corner.y);await page.mouse.down();await page.mouse.move(corner.x-80,corner.y-40,{steps:6});await page.mouse.up();
  let c=(await snap(page)).camera;assert.equal(c.mode,'free');assert.ok(c.x>.5&&c.y>.5,'deslocou: '+JSON.stringify(c));
  await page.click('#silm-camera-reset');const anchor={x:box.x+box.width*.3,y:box.y+box.height*.3};const sBefore=await page.evaluate(a=>{const st=document.getElementById('silm-assembly-stage'),r=st.getBoundingClientRect();return st.silmRenderer.toScene({x:(a.x-r.left-st.clientLeft)/st.clientWidth,y:(a.y-r.top-st.clientTop)/st.clientHeight});},anchor);
  await page.mouse.move(anchor.x,anchor.y);await page.keyboard.down('Control');await page.mouse.wheel(0,-120);await page.keyboard.up('Control');await page.waitForTimeout(500);
  c=(await snap(page)).camera;assert.ok(c.zoom>1,'aproximou');const sAfter=await page.evaluate(a=>{const st=document.getElementById('silm-assembly-stage'),r=st.getBoundingClientRect();return st.silmRenderer.toScene({x:(a.x-r.left-st.clientLeft)/st.clientWidth,y:(a.y-r.top-st.clientTop)/st.clientHeight});},anchor);
  assert.ok(Math.abs(sAfter.x-sBefore.x)<.003&&Math.abs(sAfter.y-sBefore.y)<.003,'o ponto sob o cursor fica parado');
  await page.focus('#silm-camera-in');await page.keyboard.press('0');assert.deepEqual((await snap(page)).camera,{mode:'fit',zoom:1,x:.5,y:.5});
  await page.keyboard.press('+');assert.ok(Math.abs((await snap(page)).camera.zoom-1.25)<1e-9);await page.keyboard.press('-');assert.ok(Math.abs((await snap(page)).camera.zoom-1)<1e-9);
  await page.keyboard.press('Shift+ArrowLeft');await page.waitForTimeout(500);assert.ok((await snap(page)).camera.x<.5,'Shift + seta desloca');await page.keyboard.press('f');assert.equal((await snap(page)).camera.mode,'fit');
  // foco permanece na barra (tabindex itinerante) depois de clicar
  await page.click('#silm-camera-out');assert.equal(await page.evaluate(()=>document.activeElement.id),'silm-camera-out');await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>document.activeElement.id),'silm-camera-fit');
  assert.equal(await page.getAttribute('#silm-assembly-undo','title'),undoTitle,'câmera fora do Desfazer');
  const ann=await page.evaluate(()=>window.__ann);assert.ok(ann.some(t=>/^Vista/.test(t)),'anúncios: '+JSON.stringify(ann));assert.ok(ann.filter(t=>/Vista: zoom/.test(t)).length<=6,'um anúncio por gesto, não por quadro');return {camera:c,ann};
 });

 await test('0.11-06','Seleção sobrevive a zoom e pan; o anel de seleção fica na camada própria, sobre a unidade',async use=>{
  const page=await use();await crystal(page,'Fe',4);const u=(await state(page)).structure.units[2];await page.click(`.silm-crystal-unit[data-unit-id="${u.id}"]`);
  const ring=()=>page.evaluate(id=>{const n=document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`).getBoundingClientRect(),r=document.querySelector('[data-layer=selection] .silm-selection-ring')?.getBoundingClientRect();return r?Math.hypot(n.x+n.width/2-(r.x+r.width/2),n.y+n.height/2-(r.y+r.height/2)):null;},u.id);
  assert.ok((await ring())<2);await page.click('#silm-camera-in');await page.click('#silm-camera-center');await page.waitForTimeout(300);await cam(page,{zoom:1.6,x:.42,y:.55});
  assert.equal(await page.getAttribute(`.silm-crystal-unit[data-unit-id="${u.id}"]`,'aria-pressed'),'true');assert.equal((await state(page)).structure.crystallography.representation.selectedUnitId,u.id);
  assert.ok((await ring())<2,'anel acompanha a unidade');return {};
 });

 await test('0.11-07','Projeções: centros separados em todas as vistas; HC superior mostra o hexágono; Organizar e calor idênticos à 0.10.1',async use=>{
  const out={};
  for(const [sym,n] of [['Cu',4],['Fe',4],['Mg',4],['Cu',7],['Mg',9]]){
   const page=await use({reducedMotion:'reduce'});await crystal(page,sym,n);const s=await state(page),byId=new Map(s.structure.units.map(u=>[u.id,key(u.site)]));
   const free=s.structure.crystallography.freeUnits.map(u=>byId.get(u.id));assert.deepEqual(free,BASE[sym+n].pairing,'pareamento do Organizar ('+sym+n+')');
   const seps={};
   for(const p of ['isometric','front','top','side']){await page.selectOption('#silm-crystal-projection',p);await page.waitForTimeout(80);
    seps[p]=await page.evaluate(()=>{const c=[...document.querySelectorAll('.silm-crystal-unit')].map(n=>{const r=n.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,d:r.width};});let m=Infinity;for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++)m=Math.min(m,Math.hypot(c[i].x-c[j].x,c[i].y-c[j].y)/Math.max(c[i].d,c[j].d));return +m.toFixed(3);});}
   assert.ok(Object.values(seps).every(v=>v>.45),'nenhum centro escondido: '+JSON.stringify(seps));out[sym+n]={seps};
   if(BASE[sym+n].heat){await openLeft(page,'Propriedades');await page.click('#silm-prop-start-thermal');await page.waitForFunction(()=>SILM.scientificState.properties.active==='thermal');await page.click('#silm-prop-heat');
    for(let i=0;i<5;i++){await page.waitForFunction(i=>SILM.scientificState.properties.thermal.stage===i,i);
     for(const p of ['isometric','top','side']){await page.selectOption('#silm-crystal-projection',p);await page.waitForTimeout(60);assert.equal(await heatString(page),BASE[sym+n].heat[i],'calor '+sym+n+' etapa '+i+' na projeção '+p);}
     if(i<4)await page.click('#silm-prop-advance');}
    await closeLeft(page);}
   if(sym==='Mg'&&n===4){await page.selectOption('#silm-crystal-projection','top');await page.evaluate(()=>{});await shot(page,'r07-hc-superior');
    const inside=await page.evaluate(()=>{const pts=[...document.querySelectorAll('.silm-crystal-unit')].map(n=>({layer:n.dataset.layer,r:n.getBoundingClientRect()})),A=pts.filter(p=>p.layer==='A'),B=pts.filter(p=>p.layer==='B');
     const xs=A.map(p=>p.r.x+p.r.width/2),ys=A.map(p=>p.r.y+p.r.height/2);return B.every(p=>{const x=p.r.x+p.r.width/2,y=p.r.y+p.r.height/2;return x>Math.min(...xs)&&x<Math.max(...xs)&&y>Math.min(...ys)&&y<Math.max(...ys);});});
    assert.ok(inside,'camada B entre os centros da camada A na vista superior');}
  }
  return out;
 });

 await test('0.11-08','Rede extensa em janela: no máximo 260 sítios desenhados, também afastando; nenhuma linha além das arestas da célula',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.click('#silm-crystal-view-lattice');await page.waitForTimeout(300);
  const count=()=>page.locator('.silm-lattice circle').count();const c1=await count();await cam(page,{zoom:.5,x:.5,y:.5});await page.waitForTimeout(400);const c2=await count();
  assert.ok(c1>40&&c1<=260,'rede: '+c1);assert.ok(c2<=260,'afastado: '+c2);
  const lines=await page.evaluate(()=>({all:document.querySelectorAll('#silm-assembly-stage line').length,cell:document.querySelectorAll('.silm-cell-edges line').length}));assert.equal(lines.all,lines.cell,'sem pares M—M');
  const s=await snap(page);assert.ok(s.camera.zoom<=.5+1e-9);await shot(page,'r08-rede-afastada');return {c1,c2};
 });

 await test('0.11-09','Medir e Calcular: rótulos com tamanho de tela constante; Calcular não herda a medida em revisão',async use=>{
  const page=await use();await crystal(page,'Cu',4);await switchModule(page,'medir');await openRight(page,'ver','Medir');await page.click('#silm-tool-distance');await closeRight(page);
  const u=(await state(page)).structure.units;await page.click(`.silm-crystal-unit[data-unit-id="${u[0].id}"]`);await page.click(`.silm-crystal-unit[data-unit-id="${u[1].id}"]`);
  await page.waitForSelector('.silm-dimension-label text');const size=()=>page.evaluate(()=>document.querySelector('.silm-dimension-label text').getBoundingClientRect().height);const h1=await size();
  await cam(page,{zoom:2,x:.5,y:.5});await page.waitForTimeout(150);const h2=await size();assert.ok(Math.abs(h1-h2)<1.5,'rótulo não cresce com o zoom: '+h1+' → '+h2);
  await switchModule(page,'calcular');assert.equal(await page.locator('.silm-dimension-line').count(),0,'a medida não invade o Calcular');
  await openRight(page,'ver','Calcular');await page.click('#silm-calc-radius-from-a-fcc');await closeRight(page);
  assert.equal(await page.locator('[data-layer=calculationOverlay] .silm-dimension-line').count(),1,'d = 2r na camada do Calcular');return {h1,h2};
 });

 await test('0.11-10','Celular: barra com alvos de 44 px dentro da tela; toque perto da unidade seleciona; pinça aproxima',async use=>{
  const out={};
  for(const [w,h] of [[390,844],[320,740]]){
   const page=await use({width:w,height:h,mobile:true});await crystal(page,'Cu',4);
   // Celular: a barra começa recolhida atrás de "Vista" (a cena não fica coberta); o botão abre e fecha.
   assert.equal(await page.isVisible('#silm-camera-in'),false);assert.equal(await page.getAttribute('#silm-camera-toggle','aria-expanded'),'false');
   await page.tap('#silm-camera-toggle');assert.equal(await page.getAttribute('#silm-camera-toggle','aria-expanded'),'true');await page.waitForSelector('#silm-camera-in',{state:'visible'});
   const bar=await page.evaluate(()=>{const b=document.querySelector('.silm-camera-bar').getBoundingClientRect(),btn=[...document.querySelectorAll('.silm-camera-btn,.silm-camera-toggle')].map(x=>x.getBoundingClientRect());return {right:b.right,bottom:b.bottom,min:Math.min(...btn.map(r=>Math.min(r.width,r.height))),page:document.documentElement.scrollWidth-innerWidth};});
   await page.tap('#silm-camera-toggle');
   assert.ok(bar.min>=44,'alvo ≥ 44 px');assert.ok(bar.right<=w,'barra na tela');assert.ok(bar.page<=1,'sem rolagem lateral');
   // Unidade mais alta da metade esquerda (longe da barra); toque 10 px acima da borda da esfera.
   const t=await page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage').getBoundingClientRect();const c=[...document.querySelectorAll('.silm-crystal-unit')].map(n=>({id:n.dataset.unitId,r:n.getBoundingClientRect()})).filter(o=>o.r.x+o.r.width/2<st.x+st.width*.6).sort((a,b)=>a.r.y-b.r.y)[0];return {id:c.id,x:c.r.x+c.r.width/2,y:c.r.y-10};});
   await page.touchscreen.tap(t.x,t.y);await page.waitForTimeout(150);
   assert.equal((await state(page)).structure.crystallography.representation.selectedUnitId,t.id,'toque a 10 px da borda seleciona ('+w+')');
   out[w]=bar;
  }
  const page=await use({width:390,height:844,mobile:true});await crystal(page,'Cu',4);
  const z0=(await snap(page)).camera.zoom;await page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage'),r=st.getBoundingClientRect(),cx=r.x+r.width/2,cy=r.y+r.height*.85;
   const ev=(type,id,x)=>st.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===1,clientX:x,clientY:cy,bubbles:true}));
   ev('pointerdown',1,cx-30);ev('pointerdown',2,cx+30);for(let k=1;k<=6;k++){ev('pointermove',1,cx-30-k*10);ev('pointermove',2,cx+30+k*10);}ev('pointerup',1,cx-90);ev('pointerup',2,cx+90);});
  const z1=(await snap(page)).camera.zoom;assert.ok(z1>z0*1.8,'pinça: '+z0+' → '+z1);await shot(page,'r10-celular-pinca');
  return out;
 });

 await test('0.11-11','Acessibilidade: descrição da cena atualizada no lugar, axe sem violações, redução de movimento e Leitura simples',async use=>{
  const {AxeBuilder}=require('@axe-core/playwright');const page=await use();await crystal(page,'Cu',4);
  const desc=()=>page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage'),id=st.getAttribute('aria-describedby').split(' ').find(x=>x.endsWith('scene-description'));return document.getElementById(id).textContent;});
  assert.match(await desc(),/Projeção isométrica/);assert.match(await desc(),/Vista: zoom 100 %, enquadrada/);assert.match(await desc(),/escala visual não é escala física/);
  await page.click('#silm-camera-in');assert.match(await desc(),/zoom 125 %/);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).include('#workspace').analyze();
  const violations=scan.violations.map(v=>({id:v.id,nodes:v.nodes.length}));assert.deepEqual(violations,[],JSON.stringify(violations));
  // Leitura simples conta como redução de movimento (como no SIAB): elétrons sem laço contínuo.
  await openLeft(page,'Estrutura');await closeLeft(page);await page.click('#silm-electrons-toggle');
  await page.evaluate(()=>SimCore.accessibility.set?SimCore.accessibility.set('reading','on'):A11Y.definir('reading','on'));await page.waitForTimeout(300);
  const running=await page.evaluate(()=>document.querySelector('.silm-electron-canvas').silmElectrons.snapshot().running);assert.equal(running,false,'Leitura simples para o movimento');
  return {passes:scan.passes.length};
 });

 await test('0.11-12','Comparação com o mesmo renderizador: somente leitura, mesma projeção, planos do HC presentes',async use=>{
  const page=await use();await crystal(page,'Mg',4);await page.selectOption('#silm-crystal-projection','top');
  await openRight(page,'ver','Comparar');await page.click('#silm-compare-cell-lattice');await page.click('#silm-compare-open');await page.waitForSelector('dialog.app-dialog[open] .silm-snapshot-stage');
  const r=await page.evaluate(()=>[...document.querySelectorAll('dialog.app-dialog[open] .silm-snapshot-stage')].map(s=>({renderer:s.dataset.renderer,readonly:s.hasAttribute('data-readonly'),planes:s.querySelectorAll('.silm-snapshot-plane').length,ids:s.querySelectorAll('[id^="silm"]').length})));
  assert.deepEqual(r.map(x=>x.renderer),['2d','2d']);assert.ok(r.every(x=>x.readonly&&x.ids===0));assert.ok(r.every(x=>x.planes===2),'planos do HC: '+JSON.stringify(r));
  await shot(page,'r12-comparacao');return r;
 });

 await test('0.11-13','representationState versionado: volta ao recarregar; outra investigação começa do padrão',async use=>{
  const page=await use();await crystal(page,'Cu',4);await page.selectOption('#silm-crystal-projection','front');await page.click('#silm-camera-in');await page.waitForTimeout(400);
  const before=await rep(page);await reload(page);await page.waitForSelector('.silm-crystal-unit');const after=await rep(page);
  assert.equal(after.projection,'front');assert.ok(Math.abs(after.zoom-before.zoom)<1e-9&&after.camera==='free','câmera restaurada: '+JSON.stringify(after));
  await page.evaluate(()=>localStorage.setItem('simcore_domain_silm_v1_representation.view',JSON.stringify({version:99,projection:'top'})));await reload(page);await page.waitForSelector('.silm-crystal-unit');
  assert.equal((await rep(page)).projection,'isometric','versão desconhecida volta ao padrão');
  await go(page,'montagens');await page.click('#preset-apply-ferro-ccc');const d=kit.dialog(page);if(await d.count())await d.locator('.dialog-actions button.primary-btn').click();
  await page.waitForFunction(()=>SILM.scientificState.metal?.atomicNumber===26&&SILM.scientificState.structure?.mode==='crystalline');
  const fresh=await rep(page);assert.equal(fresh.projection,'isometric');assert.equal(fresh.camera,'fit');return {before,after,fresh};
 });

 await test('0.11-14','Limpeza: sem recursos acumulados ao trocar de módulo e de vista várias vezes',async use=>{
  const page=await use();await crystal(page,'Cu',4);const base=await page.evaluate(()=>SimCore.scopeStats.resources);
  for(let k=0;k<3;k++){await switchModule(page,'medir');await switchModule(page,'calcular');await switchModule(page,'explorar');await page.click('#silm-crystal-view-lattice');await page.click('#silm-crystal-view-cell');}
  const end=await page.evaluate(()=>SimCore.scopeStats.resources);assert.ok(end<=base+2,'recursos: '+base+' → '+end);return {base,end};
 });

 /* ---------- Regressões da revisão da 0.11.0 ---------- */
 const center=(page,id)=>page.evaluate(id=>{const r=document.querySelector(`.silm-unit[data-unit-id="${id}"]`).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,r:r.width/2};},id);
 await test('0.11-15','Foco fora da vista: o palco nunca rola; a câmera desloca até a unidade focada',async use=>{
  const page=await use();await crystal(page,'Cu',4);
  await cam(page,{zoom:4,x:.2,y:.2});await page.waitForTimeout(900);   // longe do último toque: o foco vem do teclado
  const far=await page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage').getBoundingClientRect();return [...document.querySelectorAll('.silm-crystal-unit')].map(n=>({id:n.dataset.unitId,r:n.getBoundingClientRect()})).find(o=>o.r.x+o.r.width/2>st.right||o.r.y+o.r.height/2>st.bottom)?.id||null;});
  assert.ok(far,'há unidade fora da vista');
  await page.evaluate(id=>document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`).focus(),far);await page.waitForTimeout(400);
  const after=await page.evaluate(id=>{const st=document.getElementById('silm-assembly-stage'),s=st.getBoundingClientRect(),r=document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`).getBoundingClientRect(),cx=r.x+r.width/2,cy=r.y+r.height/2;
   return {scroll:st.scrollLeft+st.scrollTop+st.parentElement.scrollLeft+st.parentElement.scrollTop,inside:cx>=s.x&&cx<=s.right&&cy>=s.y&&cy<=s.bottom};},far);
  assert.equal(after.scroll,0,'sem rolagem do palco nem da área');assert.ok(after.inside,'a unidade focada aparece na vista');
  // A inversa continua exata (nenhuma rolagem escondida): o centro calculado da unidade é o centro desenhado.
  const err=await page.evaluate(id=>{const n=document.querySelector(`.silm-crystal-unit[data-unit-id="${id}"]`),r=n.getBoundingClientRect(),st=document.getElementById('silm-assembly-stage'),p={x:parseFloat(n.style.left)/100,y:parseFloat(n.style.top)/100},c=st.silmRenderer.toClient(p);return Math.hypot(c.x-(r.x+r.width/2),c.y-(r.y+r.height/2));},far);
  assert.ok(err<1.5,'inversa sem desvio: '+err);return {err};
 });

 await test('0.11-16','Pinça que começa numa unidade não a move (o arrasto é desfeito sem escrita)',async use=>{
  const page=await use({width:390,height:844,mobile:true});await investigate(page,'Cu');await assemble(page,4);
  const before=JSON.stringify((await state(page)).structure.units),z0=(await snap(page)).camera.zoom;
  const r=await page.evaluate(()=>{const st=document.getElementById('silm-assembly-stage'),node=document.querySelector('.silm-unit[data-unit-id]'),b=node.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2,s=st.getBoundingClientRect();
   const ev=(el,type,id,cx,cy)=>el.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===1,clientX:cx,clientY:cy,bubbles:true,cancelable:true}));
   ev(node,'pointerdown',1,x,y);ev(node,'pointermove',1,x+12,y+6);ev(node,'pointermove',1,x+20,y+10);const dragged=node.hasAttribute('data-dragging');
   const x2=s.x+s.width*.85,y2=s.y+s.height*.85;ev(st,'pointerdown',2,x2,y2);
   for(let k=1;k<=6;k++){ev(node,'pointermove',1,x+20-k*10,y+10-k*10);ev(st,'pointermove',2,x2+k*6,y2+k*6);}
   ev(node,'pointerup',1,x-40,y-50);ev(st,'pointerup',2,x2+36,y2+36);return {dragged,after:node.hasAttribute('data-dragging')};});
  await page.waitForTimeout(250);
  assert.ok(r.dragged,'o arrasto tinha começado');assert.equal(r.after,false,'arrasto desfeito');
  assert.equal(JSON.stringify((await state(page)).structure.units),before,'nenhuma unidade movida');
  const z1=(await snap(page)).camera.zoom;assert.ok(z1>z0*1.2,'a pinça aproximou: '+z0+' → '+z1);return {z0,z1};
 });

 await test('0.11-17','Arrastar a partir de uma unidade desloca a vista (cristal e montagem somente leitura) sem selecionar; Enter e clique seguem valendo',async use=>{
  let page=await use();await crystal(page,'Cu',4);const sel=async()=>(await state(page)).structure.crystallography.representation.selectedUnitId;
  const u=(await state(page)).structure.units[0],p=await center(page,u.id),c0=(await snap(page)).camera;
  await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+70,p.y+30,{steps:6});await page.mouse.up();
  const c1=(await snap(page)).camera;assert.equal(c1.mode,'free');assert.ok(Math.abs(c1.x-c0.x)>.02,'deslocou a partir da unidade: '+JSON.stringify(c1));
  assert.equal(await sel(),null,'o fim do deslocamento não é clique');
  await page.focus(`.silm-crystal-unit[data-unit-id="${u.id}"]`);await page.keyboard.press('Enter');assert.equal(await sel(),u.id,'Enter logo depois do deslocamento seleciona');
  const q=await center(page,u.id);await page.mouse.click(q.x,q.y);assert.equal(await sel(),null,'clique simples continua alternando');
  // Montagem livre somente leitura (Medir): as unidades não são editáveis, mas arrastar a partir delas desloca a vista.
  page=await use();await investigate(page,'Cu');await assemble(page,3);await switchModule(page,'medir');await page.waitForSelector('.silm-unit[data-unit-id]');
  const v=(await state(page)).structure.units[0],pv=await center(page,v.id),before=JSON.stringify((await state(page)).structure.units);
  await page.mouse.move(pv.x,pv.y);await page.mouse.down();await page.mouse.move(pv.x-60,pv.y+40,{steps:6});await page.mouse.up();
  const c2=(await snap(page)).camera;assert.equal(c2.mode,'free');assert.ok(Math.abs(c2.x-.5)>.02,'montagem somente leitura deslocou: '+JSON.stringify(c2));
  assert.equal(JSON.stringify((await state(page)).structure.units),before,'nada movido');return {crystal:c1,readOnly:c2};
 });

 await test('0.11-18','Elétrons estáticos na rede: aproximar e deslocar não refazem a distribuição',async use=>{
  const page=await use({reducedMotion:'reduce'});await crystal(page,'Cu',4);await page.click('#silm-crystal-view-lattice');
  await openLeft(page,'Estrutura');await closeLeft(page);await page.click('#silm-electrons-toggle');await page.waitForTimeout(300);
  const parts=()=>page.evaluate(()=>{const s=document.querySelector('.silm-electron-canvas').silmElectrons.snapshot();return {n:s.particles.length,key:JSON.stringify([s.centers,s.particles.map(p=>[+p.x.toFixed(5),+p.y.toFixed(5)])])};});
  const a=await parts();assert.ok(a.n>0,'há marcadores');
  await cam(page,{zoom:2,x:.35,y:.4});await page.waitForTimeout(400);const b=await parts();await cam(page,{zoom:.6,x:.5,y:.5});await page.waitForTimeout(400);const c=await parts();
  assert.equal(b.key,a.key,'zoom e pan não refazem a distribuição');assert.equal(c.key,a.key,'afastar também não');return {markers:a.n};
 });

 await test('0.11-19','Calor em qualquer projeção: fontes marcadas (contorno tracejado) e faixa "calor" só junto delas',async use=>{
  const page=await use({reducedMotion:'reduce'});await crystal(page,'Cu',7);
  await openLeft(page,'Propriedades');await page.click('#silm-prop-start-thermal');await page.waitForFunction(()=>SILM.scientificState.properties.active==='thermal');await page.click('#silm-prop-heat');await closeLeft(page);
  const desc=()=>page.evaluate(()=>document.getElementById('silm-scene-description').textContent);const out={};let ids=null;
  for(const p of ['isometric','front','top','side']){await page.selectOption('#silm-crystal-projection',p);await page.waitForTimeout(100);
   const r=await page.evaluate(()=>{const nodes=[...document.querySelectorAll('.silm-crystal-unit')],src=nodes.filter(n=>n.hasAttribute('data-heat-source')),cx=n=>{const b=n.getBoundingClientRect();return b.x+b.width/2;};
    const band=document.querySelector('.silm-heat-band');return {ids:src.map(n=>n.dataset.unitId).sort(),band:band?band.getBoundingClientRect().right:null,srcMin:Math.min(...src.map(cx)),srcMax:Math.max(...src.map(cx)),allMin:Math.min(...nodes.map(cx)),allMax:Math.max(...nodes.map(cx)),outline:src.length?getComputedStyle(src[0],'::after').borderTopStyle:''};});
   assert.ok(r.ids.length>0,'fontes marcadas ('+p+')');assert.equal(r.outline,'dashed');if(ids)assert.deepEqual(r.ids,ids,'as mesmas fontes em toda projeção');ids=r.ids;
   if(r.band!==null){assert.ok(r.band<=r.srcMin+1,'faixa à esquerda das fontes ('+p+')');assert.ok((r.srcMax-r.allMin)<=.3*(r.allMax-r.allMin)+1,'fontes à esquerda quando a faixa aparece ('+p+')');}
   else assert.match(await desc(),/região aquecida \(contorno tracejado\) não fica à esquerda/,'descrição explica ('+p+')');
   out[p]={band:r.band!==null};
  }
  assert.ok(out.isometric.band,'na isométrica a faixa aparece');return out;
 });

 await test('0.11-20','Montagem livre: toque no fundo perto da selecionada a move; clique perto seleciona uma vez; Enter depois de arrastar funciona',async use=>{
  let page=await use({width:390,height:844,mobile:true});await investigate(page,'Cu');await assemble(page,3);
  const u=(await state(page)).structure.units[0],g=await center(page,u.id);await page.touchscreen.tap(g.x,g.y);await page.waitForTimeout(150);assert.equal((await rep(page)).selection,u.id);
  // Ponto a 12 px da borda da selecionada, longe das outras unidades.
  const t=await page.evaluate(({id,gap})=>{const st=document.getElementById('silm-assembly-stage').getBoundingClientRect(),all=[...document.querySelectorAll('.silm-unit[data-unit-id]')].map(n=>{const b=n.getBoundingClientRect();return {id:n.dataset.unitId,x:b.x+b.width/2,y:b.y+b.height/2,r:b.width/2};}),me=all.find(o=>o.id===id);
   for(let k=0;k<16;k++){const a=k*Math.PI/8,x=me.x+Math.cos(a)*(me.r+gap),y=me.y+Math.sin(a)*(me.r+gap);if(x<st.x+8||y<st.y+8||x>st.right-8||y>st.bottom-8)continue;if(all.every(o=>o.id===id||Math.hypot(o.x-x,o.y-y)>o.r+40))return {x,y};}return null;},{id:u.id,gap:12});
  assert.ok(t,'há ponto livre perto da unidade');const p0=(await state(page)).structure.units[0].position;
  await page.touchscreen.tap(t.x,t.y);await page.waitForTimeout(200);const p1=(await state(page)).structure.units[0].position;
  assert.ok(Math.hypot(p1.x-p0.x,p1.y-p0.y)>.005,'a selecionada foi levada ao destino: '+JSON.stringify([p0,p1]));assert.equal((await rep(page)).selection,u.id,'continua selecionada');
  // Mouse: clique 2 px fora da borda (dentro da tolerância) seleciona uma vez só (sem alternar duas vezes).
  page=await use();await investigate(page,'Cu');await assemble(page,3);const w=(await state(page)).structure.units[1];
  const m=await page.evaluate(({id})=>{const all=[...document.querySelectorAll('.silm-unit[data-unit-id]')].map(n=>{const b=n.getBoundingClientRect();return {id:n.dataset.unitId,x:b.x+b.width/2,y:b.y+b.height/2,r:b.width/2};}),me=all.find(o=>o.id===id);
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=me.x+dx*(me.r+2),y=me.y+dy*(me.r+2);if(all.every(o=>o.id===id||Math.hypot(o.x-x,o.y-y)>o.r+12))return {x,y};}return null;},{id:w.id});
  assert.ok(m);await page.mouse.click(m.x,m.y);await page.waitForTimeout(100);assert.equal((await rep(page)).selection,w.id,'clique perto seleciona (uma vez)');
  // Arrastar uma unidade e, logo depois, Enter em outra: o teclado nunca é engolido.
  const a=(await state(page)).structure.units[2],pa=await center(page,a.id);await page.mouse.move(pa.x,pa.y);await page.mouse.down();await page.mouse.move(pa.x+30,pa.y+25,{steps:4});await page.mouse.up();
  const other=(await state(page)).structure.units[0];await page.focus(`.silm-unit[data-unit-id="${other.id}"]`);await page.keyboard.press('Enter');
  assert.equal((await rep(page)).selection,other.id,'Enter seleciona logo depois do arrasto');return {moved:p1};
 });

 await test('0.11-21','Organizar anima a partir das posições livres (sem salto inicial)',async use=>{
  const page=await use();await investigate(page,'Cu');await assemble(page,4);
  // Em frações do palco (o palco do cristal fica um pouco mais abaixo, por causa das ferramentas do cabeçalho).
  const rects=sel=>`(()=>{const st=document.getElementById('silm-assembly-stage').getBoundingClientRect();return Object.fromEntries([...document.querySelectorAll('${sel}')].map(n=>{const r=n.getBoundingClientRect();return [n.dataset.unitId,{x:(r.x+r.width/2-st.x)/st.width*1000,y:(r.y+r.height/2-st.y)/st.height*1000}];}));})()`;
  const free=await page.evaluate(rects('.silm-unit[data-unit-id]'));await page.click('#silm-assembly-organize');
  const first=page.evaluate(code=>new Promise(res=>{const tick=()=>{if(document.querySelector('.silm-crystal-unit'))res((0,eval)(code));else requestAnimationFrame(tick);};tick();}),rects('.silm-crystal-unit'));
  await kit.answer(page,'Organizar estrutura');const f=await first;await page.waitForTimeout(900);const end=await page.evaluate(rects('.silm-crystal-unit'));
  const ids=Object.keys(free).filter(id=>f[id]&&end[id]),d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  assert.ok(ids.some(id=>d(free[id],end[id])>25),'há unidade que se desloca');   // milésimos do palco
  for(const id of ids)assert.ok(d(f[id],free[id])<8,'parte da posição livre ('+id+'): '+d(f[id],free[id]).toFixed(1)+' ‰ do palco');
  return {units:ids.length};
 });

 await test('0.11-22','Vista e vizinhos fora do Histórico; câmera gravada ao recarregar logo; Vista no cabeçalho em 320 px; barra junto do palco no tablet',async use=>{
  let page=await use();await crystal(page,'Cu',4);
  const hist=()=>page.evaluate(()=>(JSON.parse(localStorage.getItem('simcore_domain_silm_v1_investigation.history')||'null')?.entries||[]).length);
  const h0=await hist();await page.click('#silm-crystal-view-lattice');await page.click('#silm-crystal-neighbors');await page.click('#silm-crystal-neighbors');await page.click('#silm-crystal-view-cell');
  assert.equal(await hist(),h0,'representação fora do Histórico');
  await page.click('#silm-camera-in');await reload(page);await page.waitForSelector('.silm-crystal-unit');
  assert.ok(Math.abs((await rep(page)).zoom-1.25)<1e-9,'gravação pendente sai no pagehide');
  // Montagem livre: as unidades (grupo) são descritas pela cena.
  page=await use();await investigate(page,'Cu');await assemble(page,2);
  assert.equal(await page.getAttribute('.silm-assembly-units','aria-describedby'),'silm-scene-description');
  for(const [w,h,mobile] of [[320,740,true],[768,1024,false]]){
   page=await use({width:w,height:h,mobile});await crystal(page,'Cu',4);
   const r=await page.evaluate(()=>{const t=document.getElementById('silm-camera-toggle'),tb=t.getBoundingClientRect(),st=document.getElementById('silm-assembly-stage').getBoundingClientRect(),bar=document.querySelector('.silm-camera-bar').getBoundingClientRect();
    const hits=[...document.querySelectorAll('.silm-crystal-unit')].filter(n=>{const b=n.getBoundingClientRect();return tb.width&&b.x<tb.right&&tb.x<b.right&&b.y<tb.bottom&&tb.y<b.bottom;}).length;
    return {inHeader:!!t.closest('.silm-assembly-tools'),visible:tb.width>0,hits,barTop:bar.top,stageTop:st.top,barShown:bar.width>0};});
   assert.ok(r.inHeader,'Vista nas ferramentas do cabeçalho');assert.equal(r.hits,0,'Vista não cobre unidades ('+w+')');
   if(w===320)assert.ok(r.visible,'Vista visível no celular');
   else{assert.ok(r.barShown);assert.ok(r.barTop>=r.stageTop-1&&r.barTop-r.stageTop<=14,'barra junto do topo do palco: '+JSON.stringify(r));}
  }
  return {};
 });
}};
