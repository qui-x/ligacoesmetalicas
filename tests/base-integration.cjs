'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
async function main(){
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
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
  const url='http://127.0.0.1:'+server.address().port+'/integracao/index.html#/ambiente';
  await page.goto(url);await page.waitForFunction(()=>window.SILMIntegration);
  const state=()=>page.evaluate(()=>SILMIntegration.snapshot());
  await page.evaluate(()=>localStorage.setItem('silm:legacy-sentinel','preservar'));
  await page.locator('[data-open-dock="montagem"]').click();
  await page.locator('#silm-start').click();
  await page.waitForFunction(()=>window.SILMIntegration.snapshot().structure!==null);
  for(let i=0;i<3;i++)await page.locator('#silm-add').click();
  assert.equal((await state()).structure.units.length,3);
  await page.locator('[data-close-dock="left"]').click();
  await page.locator('#scene-undo').click();assert.equal((await state()).structure.units.length,2);
  const original=(await state()).structure.units[0].position;
  const direction=await page.evaluate(()=>{const units=SILMIntegration.snapshot().structure.units,u=units[0];return Object.entries({ArrowLeft:[-.02,0],ArrowRight:[.02,0],ArrowUp:[0,-.02],ArrowDown:[0,.02]}).find(([,d])=>SILM.assembly.isFree(units,{x:u.position.x+d[0],y:u.position.y+d[1]},u.id))[0];});
  const unit=page.locator('.silm-unit').first();await unit.press('Enter');await unit.press(direction);
  await page.waitForFunction(original=>JSON.stringify(SILMIntegration.snapshot().structure.units[0].position)!==JSON.stringify(original),original);
  await page.locator('#scene-undo').click();assert.deepEqual((await state()).structure.units[0].position,original);
  await page.locator('#silm-assembly-organize').click();
  await page.waitForSelector('.silm-crystal');const crystal=await state();assert.equal(crystal.structure.crystallography.structureType,'FCC');
  await page.locator('#silm-crystal-projection').selectOption('top');assert.deepEqual(await state(),crystal,'Projeção não altera a ciência');
  await page.evaluate(()=>document.getElementById('silm-assembly-stage').silmRenderer.setCamera({zoom:1.5625,x:.45,y:.5}));
  const camera2D=await page.evaluate(()=>JSON.parse(localStorage.getItem('silm-base-integration:representation.view')).cameras.crystal);
  await page.locator('#silm-crystal-projection').selectOption('3d');await page.waitForSelector('.silm-crystal[data-view-mode="3d"]');
  await page.evaluate(()=>document.getElementById('silm-assembly-stage').silmRenderer.setCamera({zoom:2,x:.6,y:.5}));
  await page.locator('#silm-crystal-projection').selectOption('3d-xy');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('silm-base-integration:representation.view')).cameras.crystal),camera2D,'Reenquadrar plano 3D não sobrescreve câmera 2D');
  await page.locator('.silm-crystal-unit').first().focus();await page.keyboard.press('l');
  assert.deepEqual(await state(),crystal,'Órbita 3D não altera a ciência');
  await page.locator('#silm-crystal-projection').selectOption('top');await page.waitForSelector('.silm-crystal[data-view-mode="2d"]');
  assert.deepEqual(await state(),crystal,'Retorno ao 2D preserva a ciência');
  await page.locator('[data-open-dock="ver"]').click();await page.locator('#silm-electrons').click();
  await page.waitForFunction(()=>window.SILMIntegration.snapshot().electrons?.representation.visible===true);
  await page.locator('[data-close-dock="right"]').click();
  const saved=await state();await page.reload();await page.waitForFunction(()=>window.SILMIntegration);
  assert.deepEqual(await state(),saved,'Reload preserva investigação');assert.equal(await page.locator('#silm-crystal-projection').inputValue(),'top');
  assert.equal(await page.evaluate(()=>localStorage.getItem('silm:legacy-sentinel')),'preservar');
  await page.locator('[data-open-dock="dados"]').click();
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
   const before=await page.locator('#silm-assembly-stage').boundingBox();
   await page.locator('[data-open-dock="dados"]').click();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
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
  assert.deepEqual(errors,[],'Console sem exceções');assert.deepEqual(failed,[],'Recursos locais disponíveis');
  console.log('PASS: base 0.9.8 + SILM — montagem, Desfazer, cristal FCC/HCP, projeção, elétrons, reload, exportação, importação >8 KB, rejeição inválida, isolamento, cancelamento, menu e docas em 320/390/768/1440 px.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
