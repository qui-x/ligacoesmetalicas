const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const AxeBuilder=require(process.env.AXE_MODULE||'@axe-core/playwright').default;
const output=path.resolve(process.env.TEST_OUTPUT||'tests/results');
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const service=await require('./server.cjs').start(),results=[];
 try{for(const engine of ['chromium','firefox','webkit']){
  let browser;const options={headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}};
  if(engine==='chromium'&&process.env.CHROMIUM_EXECUTABLE){options.executablePath=process.env.CHROMIUM_EXECUTABLE;options.args=['--no-sandbox','--disable-dev-shm-usage'];options.env.LD_LIBRARY_PATH=process.env.CHROMIUM_LIBS||'/tmp';}
  try{browser=await pw[engine].launch(options);}catch(error){results.push({engine,status:'UNAVAILABLE',reason:String(error).slice(0,5000)});if(engine!=='webkit')throw error;continue;}
  try{for(const mobile of [false,true]){
   const label=engine+(mobile?'-mobile':'-desktop'),ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:900},hasTouch:mobile,...(engine==='firefox'?{}:{isMobile:mobile})});
   const p=await ctx.newPage(),errors=[],checks=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
   const ready=()=>p.waitForFunction(()=>window.SimCore?.ready);
   const fit=async()=>assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow '+label);
   await p.goto(service.url);await ready();assert.equal(await p.locator('#viewport-empty').isVisible(),true);assert.equal(await p.evaluate(()=>SimCore.domain.current),null);checks.push('base vazia');
   await p.locator('#workspace-left')[mobile?'tap':'click']();assert.equal(await p.locator('#controls').isVisible(),true);await p.click('#close-left');
   await p.click('#access-btn');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('dialog')),true);await p.keyboard.press('Escape');assert.equal(await p.locator('#access-btn').evaluate(n=>n===document.activeElement),true);checks.push('painel, teclado, trap e retorno de foco');
   await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>SimCore.accessibility.state.reducedMotion);await p.emulateMedia({reducedMotion:'no-preference'});
   await p.goto(service.url+'/?demo=1');await p.waitForFunction(()=>window.SimCore?.domain.current?.id==='demo');
   await p.locator('#action-demo-add')[mobile?'tap':'click']();await p.locator('#scientific-viewport').focus();await p.keyboard.press('Enter');assert.match(await p.locator('#demo-view output').innerText(),/2/);checks.push('demo, mouse/touch e teclado');
   await p.click('#action-demo-modal');await p.keyboard.press('Escape');await p.click('#action-demo-notify');assert.equal(await p.locator('#toast').isVisible(),true);await p.click('#toast-close');
   await p.click('#manual-open');await p.fill('#manual-busca','ACOES');await p.locator('#manual-conteudo a[href="#/manual/primeiros-passos"]').click();await p.locator('[data-manual-expand]').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('[data-manual-expand]').getAttribute('aria-expanded'),'true');await p.screenshot({path:path.join(output,label+'-manual.png'),fullPage:true});await p.click('#manual-close');checks.push('manual, busca sem acento, acordeão, modal e notificação');
   const layouts=[];
   for(const scale of [.75,1.5,2])for(const size of mobile?[[320,640],[360,740],[390,844],[844,390]]:[[768,1024],[1024,768],[1440,900]]){
    await p.setViewportSize({width:size[0],height:size[1]});await p.evaluate(s=>A11Y.definir('fontScale',s),scale);await p.waitForTimeout(80);await fit();
    await p.click('#workspace-left');assert.equal(await p.locator('#controls').isVisible(),true);const box=await p.locator('#controls').boundingBox();assert.ok(box.y>=-1&&box.y+box.height<=size[1]+1,'panel fits '+JSON.stringify({size,scale,box}));await p.click('#close-left');layouts.push({width:size[0],height:size[1],fontScale:scale});
   }
   await p.setViewportSize(mobile?{width:390,height:844}:{width:1366,height:900});await p.evaluate(()=>{A11Y.definir('fontScale',1);A11Y.definir('theme','light');});await fit();
   const axe=[];for(const theme of ['light','dark']){await p.evaluate(t=>A11Y.definir('theme',t),theme);const scan=await new AxeBuilder({page:p}).analyze();axe.push({theme,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)}))});}
   await p.screenshot({path:path.join(output,label+'.png'),fullPage:true});assert.deepEqual(axe.flatMap(a=>a.violations),[],'axe violations '+JSON.stringify(axe));checks.push('layouts, escalas 75/150/200%, movimento do sistema, axe claro/escuro');
   await p.evaluate(()=>{A11Y.definir('contrast',true);A11Y.definir('spacing',true);A11Y.definir('colorblind','deuteranopia');});await fit();await p.evaluate(()=>{A11Y.definir('contrast',false);A11Y.definir('spacing',false);A11Y.definir('colorblind','none');SimCore.resetStructure();});assert.match(await p.locator('#demo-view output').innerText(),/2/);
   await p.reload();await p.waitForFunction(()=>window.SimCore?.domain.current?.id==='demo');assert.match(await p.locator('#demo-view output').innerText(),/2/);await p.click('#action-demo-reset');assert.match(await p.locator('#demo-view output').innerText(),/0/);checks.push('persistência, reset estrutural e reset do domínio');
   const ticks=await p.evaluate(async()=>{await SimCore.domain.unload();let count=0;await SimCore.registerDomain({manifest:{id:'second',nome:'Segundo',nomeCurto:'Segundo',versao:'1',titulo:'Segundo',subtitulo:''},mount(c){const canvas=document.createElement('canvas');c.viewport.host.append(canvas);c.scope.interval(()=>count++,10);c.scope.animation(()=>count++);c.storage.set('teste',9);c.scope.listen(window,'second-event',()=>count++);}});await new Promise(r=>setTimeout(r,80));await SimCore.registerDomain(null);const atDestroy=count;window.dispatchEvent(new Event('second-event'));await new Promise(r=>setTimeout(r,80));return {atDestroy,after:count,scopes:SimCore.scopeStats,canvases:document.querySelectorAll('canvas').length,second:SimCore.storage.domain('second').get('teste'),demo:SimCore.storage.domain('demo').get('count')};});assert.ok(ticks.atDestroy>0);assert.equal(ticks.after,ticks.atDestroy);assert.deepEqual(ticks.scopes,{scopes:0,resources:0});assert.equal(ticks.canvases,0);assert.equal(ticks.second,9);assert.equal(ticks.demo,0);checks.push('segundo domínio, canvas, namespaces, cancelamento real de interval/RAF/eventos');
   assert.deepEqual(errors,[]);results.push({engine,version:browser.version(),mode:mobile?(engine==='firefox'?'viewport móvel + touch (sem isMobile)':'emulação móvel + touch'):'desktop',status:'PASS',checks,layouts,axe,ticks,errors});console.log(label,'PASS');await ctx.close();
  }}finally{await browser.close();}
 }
 }finally{service.server.close();fs.writeFileSync(path.join(output,'COMPATIBILIDADE.json'),JSON.stringify({date:new Date().toISOString(),results},null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
