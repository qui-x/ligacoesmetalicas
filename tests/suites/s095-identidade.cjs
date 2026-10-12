'use strict';
/* Identidade oficial (logo e abertura do pacote "SILM — Identidade e animação oficial") e correção de origem da
   rota inicial. Série 0.9: as verificações valem como regressão nas séries seguintes. */
module.exports={series:'0.9',async run(kit,{screenshots=false}={}){
 const {assert,go}=kit;const shot=screenshots?kit.shot:async()=>{},test=kit.test;
 const opening=page=>page.evaluate(()=>{const n=document.getElementById('silm-opening');return {node:!!n,state:document.documentElement.dataset.silmOpening,aria:n?.getAttribute('aria-hidden')||null};});
 const visibleToasts=page=>page.evaluate(()=>[...document.querySelectorAll('.toast:not([hidden])')].map(t=>t.innerText.split('\n')[0]));

 await test('0.9-ID1','Abertura oficial: monta antes do primeiro desenho, decorativa e sem artefatos',async use=>{
  const page=await use({opening:true});await page.goto(kit.base+'#/inicio');await page.waitForSelector('#silm-opening.is-running');
  const info=await page.evaluate(()=>{const n=document.getElementById('silm-opening'),skip=n.querySelector('[data-silm-skip]');
   return {first:document.body.firstElementChild===n||document.body.querySelector(':scope > #silm-opening')===n,aria:n.getAttribute('aria-hidden'),mark:n.querySelector('.silm-opening__brand-mark').textContent,
    name:n.querySelector('.silm-opening__brand-name').textContent,theme:n.querySelector('.silm-opening__brand-theme').textContent,skip:skip.textContent,skipTab:skip.tabIndex,
    nodes:n.querySelectorAll('.node').length,thermalGroupFilter:getComputedStyle(n.querySelector('g[filter*=silmThermalGlow]')).filter,auraFilter:getComputedStyle(n.querySelector('.thermal-aura')).filter};});
  assert.equal(info.aria,'true');assert.equal(info.mark,'SILM');assert.equal(info.name,'Simulador Interativo de Ligações Metálicas');assert.equal(info.theme,'A Arquitetura dos Metais');
  assert.equal(info.skip,'Pular abertura');assert.equal(info.skipTab,-1,'Botão fora da ordem de Tab (a camada é aria-hidden; qualquer tecla pula)');assert.equal(info.nodes,9,'8 vértices + 1 centro, como o símbolo mestre');
  assert.equal(info.thermalGroupFilter,'none','Correção do quadrado preto: filtro fora do grupo');assert.match(info.auraFilter,/silmThermalGlow/);
  await page.waitForTimeout(4600);await shot(page,'id-01-abertura-marca');return info;
 });

 await test('0.9-ID2','Abertura: pula com tecla (foco no conteúdo), botão e toque; termina sozinha',async use=>{
  const page=await use({opening:true});await page.goto(kit.base+'#/laboratorio');await page.waitForSelector('#silm-opening.is-running');await kit.ready(page);
  await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.getElementById('silm-opening'));
  const key=await page.evaluate(()=>({state:document.documentElement.dataset.silmOpening,focus:document.activeElement?.id}));assert.deepEqual(key,{state:'done',focus:'scientific-viewport'});
  const b=await use({opening:true});await b.goto(kit.base+'#/inicio');await b.waitForSelector('#silm-opening.is-running');await kit.ready(b);await b.click('[data-silm-skip]');await b.waitForFunction(()=>!document.getElementById('silm-opening'));
  const m=await use({opening:true,mobile:true,width:390,height:844});await m.goto(kit.base+'#/inicio');await m.waitForSelector('#silm-opening.is-running');await kit.ready(m);await m.locator('#silm-opening').tap();await m.waitForFunction(()=>!document.getElementById('silm-opening'));
  const t=await use({opening:true});const start=Date.now();await t.goto(kit.base+'#/inicio');await t.waitForSelector('#silm-opening.is-running');await t.waitForFunction(()=>!document.getElementById('silm-opening'),null,{timeout:9000});
  const elapsed=Date.now()-start;assert.ok(elapsed>=5500&&elapsed<=7600,'duração oficial ≈ 6,1 s: '+elapsed);assert.equal((await opening(t)).state,'done');
  return {key,elapsedMs:elapsed};
 });

 await test('0.9-ID3','Abertura omitida com movimento reduzido ou preferência desligada',async use=>{
  const r=await use({opening:true,reducedMotion:'reduce'});await go(r,'inicio');assert.deepEqual(await opening(r),{node:false,state:'done',aria:null});
  const o=await use();await go(o,'inicio');assert.deepEqual(await opening(o),{node:false,state:'done',aria:null});
  const a=await use({opening:true,storage:{simcore_a11y_v1:{motion:true}}});await go(a,'inicio');const s=await opening(a);assert.equal(s.node,false);return {reduced:'omitida',off:'omitida'};
 });

 await test('0.9-ID4','Marca: símbolo mestre no cabeçalho e no Sobre; ícone de aplicação no favicon e no PWA',async use=>{
  const page=await use();await go(page,'inicio');
  const brand=await page.evaluate(()=>({src:document.getElementById('brand-icon').getAttribute('src'),fit:getComputedStyle(document.getElementById('brand-icon')).objectFit,favicon:document.querySelector('link[rel=icon]').getAttribute('href')}));
  assert.ok(brand.src.endsWith('assets/silm-simbolo.svg'),brand.src);assert.equal(brand.fit,'contain');assert.match(brand.favicon,/^favicon-(dark|light)\.svg$/);
  const files=await page.evaluate(async()=>{const text=async u=>(await fetch(u)).text();const size=u=>new Promise(r=>{const i=new Image();i.onload=()=>r([i.naturalWidth,i.naturalHeight]);i.onerror=()=>r(null);i.src=u;});
   const manifest=await (await fetch('manifest.webmanifest')).json();
   return {symbol:/Símbolo oficial SILM/.test(await text('assets/silm-simbolo.svg')),app:/Ícone oficial SILM/.test(await text('assets/silm-icone.svg')),fav:/Ícone oficial SILM/.test(await text('favicon-dark.svg'))&&/Ícone oficial SILM/.test(await text('favicon-light.svg')),
    icons:await Promise.all(manifest.icons.map(async i=>({src:i.src,purpose:i.purpose,size:i.type==='image/png'?await size(i.src):'svg'}))),apple:await size('assets/apple-touch-icon.png')};});
  assert.ok(files.symbol&&files.app&&files.fav,JSON.stringify(files));assert.deepEqual(files.apple,[180,180]);
  for(const i of files.icons)if(i.size!=='svg'){const n=+i.src.match(/(\d+)\.png$/)[1];assert.deepEqual(i.size,[n,n],i.src);}
  assert.ok(files.icons.some(i=>i.purpose==='maskable'));
  await page.click('#core-menu');await page.locator('#app-drawer button',{hasText:'Sobre'}).first().click();const about=await page.locator('dialog.app-dialog[open] .about-brand img').getAttribute('src');assert.ok(about.endsWith('assets/silm-simbolo.svg'),about);
  await shot(page,'id-02-sobre');return {brand,about,icons:files.icons.length};
 });

 await test('0.9-ID5','Correção de origem: endereço inicial direto sem aviso "Tela não encontrada"',async use=>{
  const out={};
  for(const route of ['inicio','aprender','missoes','manual/abertura']){const page=await use();await page.goto(kit.base+'#/'+route);await kit.ready(page);await page.waitForTimeout(500);
   out[route]={hash:await page.evaluate(()=>location.hash),toasts:await visibleToasts(page)};assert.deepEqual(out[route].toasts,[],route);assert.equal(out[route].hash,'#/'+route,route);}
  const page=await use();await go(page,'inicio');await page.evaluate(()=>{location.hash='#/rota-inexistente';});await page.waitForFunction(()=>location.hash!=='#/rota-inexistente');
  assert.deepEqual(await visibleToasts(page),['Tela não encontrada. A navegação foi recuperada.'],'Rota inexistente durante o uso continua avisando');
  return out;
 });
}};
