'use strict';
const nav=require('./integration-navigation.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
async function main(){
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]).replace(/\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const types={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.html':'text/html'};
  try{res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  const launch={headless:true};if(process.env.SILM_CHROMIUM)launch.executablePath=process.env.SILM_CHROMIUM;
  if(process.env.SILM_CHROMIUM_ARGS)launch.args=JSON.parse(process.env.SILM_CHROMIUM_ARGS);
  browser=await chromium.launch(launch);
  const errors=[],failed=[];
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror',e=>{errors.push(e.stack);console.error(e.stack);});page.on('response',r=>{if(r.status()>=400)failed.push(r.url()+':'+r.status());});
  const url='http://127.0.0.1:'+server.address().port+(process.env.SILM_TEST_INTEGRATION_ENTRY?'/integracao/index.html#/ambiente':'/index.html#/ambiente');
  await page.goto(url);await page.waitForFunction(()=>window.SILMIntegration);
  const state=()=>page.evaluate(()=>SILMIntegration.snapshot());
  await page.evaluate(()=>localStorage.setItem('silm:legacy-sentinel','preservar'));
  await page.locator('[data-open-dock="montagem"]').click();
  await page.locator('#silm-start').click();
  await page.waitForFunction(()=>window.SILMIntegration.snapshot().structure!==null);
  for(let i=0;i<3;i++)await page.locator('#silm-add').click();
  assert.equal((await state()).structure.units.length,3);
  assert.equal(await page.locator('#si-expand-structure').isDisabled(),true,'A expansão só é habilitada para estrutura cristalina organizada.');
  await page.locator('[data-close-dock="left"]').click();
  await page.locator('#scene-undo').click();assert.equal((await state()).structure.units.length,2);
  const original=(await state()).structure.units[0].position;
  const direction=await page.evaluate(()=>{const units=SILMIntegration.snapshot().structure.units,u=units[0];return Object.entries({ArrowLeft:[-.02,0],ArrowRight:[.02,0],ArrowUp:[0,-.02],ArrowDown:[0,.02]}).find(([,d])=>SILM.assembly.isFree(units,{x:u.position.x+d[0],y:u.position.y+d[1]},u.id))[0];});
  const unit=page.locator('.silm-unit').first();await unit.press('Enter');await unit.press(direction);
  await page.waitForFunction(original=>JSON.stringify(SILMIntegration.snapshot().structure.units[0].position)!==JSON.stringify(original),original);
  await page.locator('#scene-undo').click();assert.deepEqual((await state()).structure.units[0].position,original);
  // Regressão mecânica: ao começar uma pinça sobre uma unidade, cancelar o arrasto
  // deve restaurar a posição, preservar o modelo e suprimir o clique residual.
  await page.evaluate(()=>{const node=document.querySelector('#silm-assembly-stage .silm-unit[data-unit-id]');if(node?.getAttribute('aria-pressed')!=='true')node.click();});
  const beforePinch=await state();
  const pinch=await page.evaluate(()=>{
   const stage=document.getElementById('silm-assembly-stage'),node=stage.querySelector('.silm-unit[data-unit-id]');
   const selectedBefore=node.getAttribute('aria-pressed'),before={left:node.style.left,top:node.style.top};
   const b=node.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2,s=stage.getBoundingClientRect(),x2=s.x+s.width*.85,y2=s.y+s.height*.85;
   const ev=(el,type,id,cx,cy)=>el.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===1,clientX:cx,clientY:cy,bubbles:true,cancelable:true,button:0,buttons:type==='pointerup'?0:1}));
   ev(node,'pointerdown',1,x,y);ev(node,'pointermove',1,x+12,y+6);ev(node,'pointermove',1,x+20,y+10);
   const began=node.hasAttribute('data-dragging');
   ev(stage,'pointerdown',2,x2,y2);
   const canceled=!node.hasAttribute('data-dragging');
   for(let k=1;k<=4;k++){ev(node,'pointermove',1,x+20-k*5,y+10-k*3);ev(stage,'pointermove',2,x2+k*8,y2+k*8);}
   ev(node,'pointerup',1,x,y);ev(stage,'pointerup',2,x2+32,y2+32);
   node.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));
   return {began,canceled,selectedBefore,selectedAfter:node.getAttribute('aria-pressed'),before,left:node.style.left,top:node.style.top,unitId:node.dataset.unitId};
  });
  assert.ok(pinch.began,'o arrasto inicial da unidade começou');
  assert.ok(pinch.canceled,'início da pinça cancela o arrasto');
  assert.equal(pinch.selectedBefore,'true','unidade selecionada antes da pinça');
  assert.equal(pinch.selectedAfter,pinch.selectedBefore,'clique residual da pinça não alterna a seleção');
  assert.equal(pinch.left,pinch.before.left,'cancelamento restaura left sem posição intermediária');
  assert.equal(pinch.top,pinch.before.top,'cancelamento restaura top sem posição intermediária');
  assert.deepEqual(await state(),beforePinch,'pinça cancelada não altera o estado científico');

  // Arrasto real de mouse: uma operação é gravada e um único Desfazer restaura o snapshot.
  const beforeMouse=await state(),withoutUpdatedAt=value=>JSON.parse(JSON.stringify(value,(key,val)=>key==='updatedAt'?undefined:val));
  const drag=await page.evaluate(()=>{
   const stage=document.getElementById('silm-assembly-stage'),units=SILMIntegration.snapshot().structure.units,moving=units[0];
   const deltas=[{x:.18,y:0},{x:-.18,y:0},{x:0,y:.18},{x:0,y:-.18},{x:.18,y:.12},{x:-.18,y:-.12}];
   const target=deltas.map(d=>({x:moving.position.x+d.x,y:moving.position.y+d.y}))
    .find(p=>p.x>.05&&p.x<.95&&p.y>.05&&p.y<.95&&SILM.assembly.isFree(units,p,moving.id));
   if(!target)throw new Error('Não foi encontrado destino livre para o teste de arrasto.');
   return {id:moving.id,original:moving.position,from:stage.silmRenderer.toClient(moving.position),to:stage.silmRenderer.toClient(target)};
  });
  await page.mouse.move(drag.from.x,drag.from.y);await page.mouse.down();
  await page.mouse.move((drag.from.x+drag.to.x)/2,(drag.from.y+drag.to.y)/2,{steps:5});
  await page.mouse.move(drag.to.x,drag.to.y,{steps:6});await page.mouse.up();
  await page.waitForFunction(({id,original})=>{const u=SILMIntegration.snapshot().structure.units.find(x=>x.id===id);return u&&(Math.abs(u.position.x-original.x)>1e-4||Math.abs(u.position.y-original.y)>1e-4);},{id:drag.id,original:drag.original});
  const afterMouse=await state();
  assert.notDeepEqual(afterMouse.structure.units.find(x=>x.id===drag.id).position,drag.original,'arrasto de mouse altera a posição científica por ação explícita');
  await page.locator('#scene-undo').click();
  await page.waitForFunction(({id,original})=>{const u=SILMIntegration.snapshot().structure.units.find(x=>x.id===id);return u&&Math.abs(u.position.x-original.x)<1e-8&&Math.abs(u.position.y-original.y)<1e-8;},{id:drag.id,original:drag.original});
  assert.deepEqual(withoutUpdatedAt(await state()),withoutUpdatedAt(beforeMouse),'um único Desfazer reverte todo o arrasto; somente updatedAt é atualizado');

  // Com a assistência habilitada por padrão, um destino ocupado deve ajustar a posição
  // e identificá-la como assistida; o posicionamento continua sendo reversível.
  const occupied=await page.evaluate(()=>{
   const stage=document.getElementById('silm-assembly-stage'),units=SILMIntegration.snapshot().structure.units,moving=units[0],other=units[1];
   return {id:moving.id,original:{...moving.position},from:stage.silmRenderer.toClient(moving.position),to:stage.silmRenderer.toClient(other.position)};
  });
  await page.mouse.move(occupied.from.x,occupied.from.y);await page.mouse.down();
  await page.mouse.move((occupied.from.x+occupied.to.x)/2,(occupied.from.y+occupied.to.y)/2,{steps:5});
  await page.mouse.move(occupied.to.x,occupied.to.y,{steps:6});await page.mouse.up();
  await page.waitForFunction(()=>document.getElementById('silm-assembly-feedback')?.textContent.includes('Posição ajustada para evitar sobreposição'));
  const assistedState=await state(),assistedUnit=assistedState.structure.units.find(x=>x.id===occupied.id);
  assert.notDeepEqual(assistedUnit.position,occupied.original,'a assistência busca uma posição livre');
  assert.equal(assistedUnit.placement,'assisted','o tipo de posicionamento identifica a assistência');
  assert.ok(await page.evaluate(id=>{const units=SILMIntegration.snapshot().structure.units,u=units.find(x=>x.id===id);return SILM.assembly.isFree(units,u.position,id);},occupied.id),'a posição ajustada não sobrepõe outra unidade');
  await page.locator('#scene-undo').click();
  await page.waitForFunction(({id,original})=>{const u=SILMIntegration.snapshot().structure.units.find(x=>x.id===id);return u&&Math.abs(u.position.x-original.x)<1e-8&&Math.abs(u.position.y-original.y)<1e-8;},{id:occupied.id,original:occupied.original});
  assert.deepEqual(withoutUpdatedAt(await state()),withoutUpdatedAt(beforeMouse),'um único Desfazer restaura o estado da investigação (os carimbos updatedAt avançam) após posicionamento assistido');
  await page.locator('#silm-assembly-organize').click();
  await page.waitForSelector('.silm-crystal');const crystal=await state();assert.equal(crystal.structure.crystallography.structureType,'FCC');
  assert.equal(await page.locator('#si-expand-structure').isDisabled(),false,'A estrutura configurada deve permitir expansão.');
  assert.equal(await page.locator('#si-expand-structure').evaluate(b=>b.closest('#silm-camera-bar')!==null),true,'O botão fica junto aos controles centrais.');
  const beforeExpand=await state(),normalBounds=await page.locator('#si-stage').boundingBox(),normalCanvas=await page.locator('#silm-assembly-stage').boundingBox(),viewport=page.viewportSize();
  await page.locator('#si-expand-structure').click();
  await page.waitForFunction(()=>document.querySelector('#si-stage').classList.contains('si-scene-expanded'));
  assert.equal(await page.locator('#si-expand-structure').getAttribute('aria-pressed'),'true','O mesmo botão indica a expansão.');
  assert.ok((await page.locator('#si-expand-structure').getAttribute('aria-label')).startsWith('Recolher'),'O mesmo botão recolhe a cena.');
  assert.ok(await page.locator('#silm-camera-bar').isVisible(),'Os controles centrais continuam visíveis.');
  assert.ok(await page.locator('#silm-camera-in').isVisible(),'O controle de zoom continua disponível.');
  assert.equal(await page.locator('.si-global-header').isVisible(),false,'A barra global é retirada da área expandida.');
  assert.ok(await page.locator('.si-workspace-toolbar').isVisible(),'A barra contextual da oficina continua visível.');
  assert.ok(await page.locator('[data-open-dock="montagem"]').isVisible(),'O menu de contexto Montagem permanece disponível.');
  await page.waitForFunction(({width,height})=>{const stage=document.querySelector('#silm-assembly-stage');if(!stage)return false;const r=stage.getBoundingClientRect();return r.width>width+40&&r.height>height+40;},{width:normalCanvas.width,height:normalCanvas.height},{timeout:4000});
  const workspaceBounds=await page.locator('#si-workspace').boundingBox(),expandedBounds=await page.locator('#si-stage').boundingBox(),expandedCanvas=await page.locator('#silm-assembly-stage').boundingBox(),toolbarBounds=await page.locator('.si-workspace-toolbar').boundingBox();
  assert.ok(expandedCanvas.width>normalCanvas.width+40&&expandedCanvas.height>normalCanvas.height+40,'O palco cristalino cresce na tela expandida.');
  assert.ok(workspaceBounds.x<=1&&workspaceBounds.y<=1&&workspaceBounds.width>=viewport.width-2&&workspaceBounds.height>=viewport.height-2,'A oficina ocupa o viewport: '+JSON.stringify(workspaceBounds));
  assert.ok(expandedBounds.y>=toolbarBounds.y+toolbarBounds.height-1,'A estrutura não cobre a barra contextual.');
  assert.deepEqual(await state(),beforeExpand,'Expandir não altera o estado científico');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#si-stage').classList.contains('si-scene-expanded'));
  assert.equal(await page.locator('#si-expand-structure').getAttribute('aria-pressed'),'false','O botão retorna ao estado recolhido.');
  assert.deepEqual(await state(),beforeExpand,'Sair da expansão preserva o estado científico');
  assert.ok(normalBounds.width<workspaceBounds.width||normalBounds.height<workspaceBounds.height,'A oficina expandida deve superar a área normal da cena.');
  await page.locator('#silm-crystal-projection').selectOption('top');assert.deepEqual(await state(),crystal,'Projeção não altera a ciência');
  await page.evaluate(()=>document.getElementById('silm-assembly-stage').silmRenderer.setCamera({zoom:1.5625,x:.45,y:.5}));
  const camera2D=await page.evaluate(()=>JSON.parse(BaseDemoSI.storage.read('representation.view')).cameras.crystal);
  await page.locator('#silm-crystal-projection').selectOption('3d');await page.waitForSelector('.silm-crystal[data-view-mode="3d"]');
  await page.evaluate(()=>document.getElementById('silm-assembly-stage').silmRenderer.setCamera({zoom:2,x:.6,y:.5}));
  await page.locator('#silm-crystal-projection').selectOption('3d-xy');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(BaseDemoSI.storage.read('representation.view')).cameras.crystal),camera2D,'Reenquadrar plano 3D não sobrescreve câmera 2D');
  await page.locator('.silm-crystal-unit').first().focus();await page.keyboard.press('l');
  assert.deepEqual(await state(),crystal,'Órbita 3D não altera a ciência');
  await page.locator('#silm-crystal-projection').selectOption('top');await page.waitForSelector('.silm-crystal[data-view-mode="2d"]');
  assert.deepEqual(await state(),crystal,'Retorno ao 2D preserva a ciência');
  await nav.viewer(page,'eletrons');await page.locator('#silm-electrons').click();
  await page.waitForFunction(()=>window.SILMIntegration.snapshot().electrons?.representation.visible===true);
  await page.locator('[data-close-dock="right"]').click();
  const saved=await state();await page.reload();await page.waitForFunction(()=>window.SILMIntegration);
  assert.deepEqual(await state(),saved,'Reload preserva investigação');assert.equal(await page.locator('#silm-crystal-projection').inputValue(),'top');
  assert.equal(await page.evaluate(()=>localStorage.getItem('silm:legacy-sentinel')),'preservar');
  await nav.data(page,'arquivo');
  const downloadPromise=page.waitForEvent('download');await page.locator('#silm-export').click();const download=await downloadPromise;
  const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.deepEqual(exported.scientificState,saved);
  await page.locator('#silm-import').setInputFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":8}')});
  assert.deepEqual(await state(),saved,'Importação inválida preserva sessão');
  // Estado real acima do limite da extensão genérica: não truncar o histórico científico.
  const S=require('../scripts/validate-scientific-state.cjs').load(),m=S.createScientificState();m.begin(12);m.beginAssembly();m.addUnit();m.organize();
  for(let i=0;i<20;i++)assert.equal(m.addCalculation('effective-atoms-hcp',[]).ok,true);
  const full=JSON.parse(JSON.stringify(m.snapshot())),buffer=Buffer.from(JSON.stringify(full));assert.ok(buffer.length>8192);
  await page.locator('#silm-import').setInputFiles({name:'investigacao.json',mimeType:'application/json',buffer});
  await page.locator('#si-modal-confirm').click();
  await page.waitForFunction(()=>window.SILMIntegration.snapshot().metal?.symbol==='Mg');
  assert.deepEqual(await state(),full);await page.reload();await page.waitForFunction(()=>window.SILMIntegration);assert.deepEqual(await state(),full);
  await page.locator('[data-open-dock="montagem"]').click();await page.locator('#silm-start').click();await page.locator('#si-modal-cancel').click();assert.deepEqual(await state(),full);
  await page.locator('[data-close-dock="left"]').click();
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   if(width<=390){
    const beforeExpand=await state();
    await page.locator('#si-expand-structure').click();
    await page.waitForFunction(()=>document.querySelector('#si-stage').classList.contains('si-scene-expanded'));
    const expanded=await page.locator('#si-workspace').boundingBox(),expandedScene=await page.locator('#si-stage').boundingBox();
     assert.ok(await page.locator('#silm-camera-in').isVisible(),'Zoom continua visível durante a expansão móvel.');
    assert.ok(expanded.width>=width-2&&expanded.height>=898,'Expansão mobile deve preencher o viewport em '+width+' px.');
     assert.ok(expandedScene.y>expanded.y,'O conteúdo móvel começa dentro da oficina, sem cobrir a barra contextual.');
     assert.equal(await page.locator('.si-global-header').isVisible(),false,'A barra global não cobre os controles móveis.');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Sem overflow durante a expansão em '+width+' px.');
    assert.deepEqual(await state(),beforeExpand,'A expansão mobile não altera a ciência.');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#si-stage').classList.contains('si-scene-expanded'));
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    assert.deepEqual(await state(),beforeExpand,'Fechar a expansão mobile preserva a ciência.');
   }
   const before=await page.locator('#silm-assembly-stage').boundingBox();
   await page.locator('[data-open-dock="dados"]').click();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   if(width<=768){
    const covered=await page.locator('#silm-assembly-stage').evaluate(stage=>{
     const r=stage.getBoundingClientRect(),dock=document.querySelector('.si-dock-right');
     const d=dock.getBoundingClientRect();let checked=0;
     for(const atom of stage.querySelectorAll('.silm-unit')){
      const a=atom.getBoundingClientRect(),x=a.x+a.width/2,y=a.y+a.height/2;
      if(x>d.left&&x<d.right&&y>d.top&&y<d.bottom){
       checked++;if(!dock.contains(document.elementFromPoint(x,y)))return false;
      }
     }
     return checked>0;
    });
    assert.ok(covered,'Painel Dados cobre os átomos e recebe o toque em '+width);
   }
   const after=await page.locator('#silm-assembly-stage').boundingBox();
   assert.ok(Math.abs(before.width-after.width)<=2,'Cena estável ao abrir doca em '+width+': '+before.width+' → '+after.width);
   await page.locator('[data-close-dock="right"]').click();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Sem overflow em '+width);
  }
  await page.locator('#nav-toggle').click();await page.keyboard.press('Escape');
  assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'false');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#scene-menu-toggle').click();await page.locator('#si-compact-clear').click();await page.locator('#si-modal-cancel').click();assert.deepEqual(await state(),full,'Cancelar limpeza no celular preserva investigação');
  await page.setViewportSize({width:844,height:390});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Sem overflow em paisagem');
  const evidence=process.env.SILM_INTEGRATION_EVIDENCE;
  if(evidence){fs.mkdirSync(evidence,{recursive:true});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(evidence,'desktop.png')});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(evidence,'mobile.png')});}
  await require('./workspace-family.cjs')(browser,url);
  await require('./integration-tools.cjs')(browser,url);
  await require('./routes-browser.cjs')(browser,url);
  await require('./learning-browser.cjs')(browser,url);
  await require('./responsive-probe.cjs')(browser,url);
  assert.deepEqual(errors,[],'Console sem exceções');assert.deepEqual(failed,[],'Recursos locais disponíveis');
  console.log('PASS: base 0.9.17 + SILM — montagem, Desfazer, cristal FCC/HCP, projeção, elétrons, reload, exportação, importação >8 KB, rejeição inválida, isolamento, cancelamento, menu e docas em 320/390/768/1440 px.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
