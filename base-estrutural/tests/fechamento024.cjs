'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),pw=require('./browser.cjs');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.TEST_OUTPUT||path.join(__dirname,'results','closing'));fs.mkdirSync(out,{recursive:true});
const report={version:'0.2.4',date:new Date().toISOString(),environment:{node:process.version},filter:process.env.TEST_FILTER||null,engines:[],tests:[],browserDiagnostics:[],limitations:[]};let url;
const server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/base\//,'/'),file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}try{const data=fs.readFileSync(file);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);}catch{res.writeHead(404);res.end();}});
async function test(name,fn){if(report.filter&&!new RegExp(report.filter).test(name))return;const start=Date.now();console.log('START',name);try{const detail=await fn();report.tests.push({name,status:'PASS',ms:Date.now()-start,...detail});console.log('PASS',name);}catch(error){report.tests.push({name,status:'FAIL',ms:Date.now()-start,error:String(error.stack)});console.error('FAIL',name,error.message);throw error;}}
async function ready(p){await p.waitForFunction(()=>window.SimCore?.experience.current?.modules.current);}
async function navigate(p,id,param=''){await p.evaluate(([i,v])=>SimCore.router.navigate(i,v),[id,param]);}
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:!name.includes('-mobile-')});}
async function axe(p,name){const Axe=require(process.env.AXE_MODULE||'@axe-core/playwright').default;const result=await new Axe({page:p}).analyze();fs.writeFileSync(path.join(out,name+'-axe.json'),JSON.stringify(result.violations,null,2));assert.deepEqual(result.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[]);return result.passes.length;}
async function fresh(b,opts={}){const c=await b.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',...opts}),p=await c.newPage(),errors=[],missing=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)missing.push(r.url());});await p.goto(url+'?demo=1');await ready(p);const close=c.close.bind(c);c.close=async()=>{await close();report.browserDiagnostics.push({errors:[...errors],httpFailures:[...missing]});assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);};return {c,p,errors,missing};}
async function closeDialog(p,label){if(label)await p.getByRole('dialog').getByRole('button',{name:label,exact:true}).click();else await p.keyboard.press('Escape');}
async function noOverflow(p){const value=await p.evaluate(()=>({page:document.documentElement.scrollWidth>innerWidth+1,header:document.querySelector('.app-header').scrollWidth>innerWidth+1,bottom:innerWidth<=900&&document.querySelector('#bottom-nav').scrollWidth>innerWidth+1}));assert.deepEqual(value,{page:false,header:false,bottom:false});}
async function trap(p,selector='dialog[open]'){for(let i=0;i<8;i++){await p.keyboard.press(i%3?'Tab':'Shift+Tab');assert.ok(await p.evaluate(s=>document.querySelector(s)?.contains(document.activeElement),selector));}}
async function startMission(p){await navigate(p,'missoes','registrar-e-concluir');await p.click('#activity-start');if(await p.locator('dialog.app-dialog[open]').count())await closeDialog(p,'Salvar e continuar');await p.waitForFunction(()=>SimCore.experience.current.activity.current.type==='mission');}
async function settle(p){await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
// Conta listeners acrescentados a raízes persistentes durante os ciclos; não mede heap.
async function watchRootListeners(p){await p.evaluate(()=>{const lists=[];for(const target of [window,document,SimCore.events,...['core-menu','app-drawer','main-nav','bottom-nav'].map(id=>document.getElementById(id))]){const records=[],add=target.addEventListener.bind(target),remove=target.removeEventListener.bind(target),capture=o=>typeof o==='boolean'?o:!!o?.capture;lists.push(records);target.addEventListener=(type,fn,options)=>{if(fn&&!options?.once&&!records.some(r=>r.type===type&&r.fn===fn&&r.capture===capture(options)))records.push({type,fn,capture:capture(options)});return add(type,fn,options);};target.removeEventListener=(type,fn,options)=>{const i=records.findIndex(r=>r.type===type&&r.fn===fn&&r.capture===capture(options));if(i>=0)records.splice(i,1);return remove(type,fn,options);};}window.rootListenerAudit=()=>lists.reduce((n,list)=>n+list.length,0);});}
async function chooseStartup(p,value){await p.locator('input[name="startup-destination"][value="'+value+'"]').check();await p.getByRole('dialog').getByRole('button',{name:'Salvar',exact:true}).click();await p.waitForSelector('#startup-settings',{state:'detached'});}
async function completeMission(p){
 await p.click('#demo-add');await navigate(p,'missoes','registrar-e-concluir');
 await p.fill('#mission-evidence','Uma ação registrada na sessão atual.');
 await p.fill('#mission-conclusion','O registro permite confirmar a ação.');
 await p.click('#mission-finish');await p.waitForSelector('#report-document');
}
async function exitActivity(p){
 await p.click('#core-menu');await p.click('#shell-activity-exit');await closeDialog(p,'Encerrar atividade');
 await p.waitForFunction(()=>SimCore.experience.current.activity.current.type==='free'&&SimCore.router.current.id==='inicio');
}
async function assertRestricted(p,session){
 const state=await p.evaluate(()=>({activity:SimCore.experience.current.activity.current,restricted:SimCore.experience.current.restricted}));
 assert.equal(state.activity.sessionId,session);assert.equal(state.activity.status,'completed');assert.equal(state.restricted,true);
 assert.equal(await p.locator('#main-nav').isVisible(),false);assert.equal(await p.locator('#bottom-nav').isVisible(),false);
 assert.equal(await p.locator('.brand').getAttribute('href'),'#/relatorios/'+session);
 await p.click('#core-menu');assert.equal(await p.locator('#drawer-title').textContent(),'Menu da atividade');
 assert.match(await p.locator('#drawer-activity').innerText(),/Atividade concluída/i);
 for(const id of ['drawer-now','drawer-navigation-section','drawer-professor','drawer-app','shell-startup'])assert.equal(await p.locator('#'+id).count(),0);
 for(const id of ['shell-activity-details','shell-activity-report','shell-activity-exit','shell-accessibility'])assert.equal(await p.locator('#'+id).count(),1);
 await p.keyboard.press('Escape');
}
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/base/';
 const b=await pw.chromium.launch({headless:true});report.engines.push({engine:'chromium',version:b.version(),status:'AVAILABLE'});
 try{
  await test('0.2.4 · concluir, guardar contexto, encerrar e refazer missão',async()=>{
   const {c,p}=await fresh(b);try{
    await startMission(p);const before=await p.evaluate(()=>SimCore.experience.current.activity.current);
    await completeMission(p);const after=await p.evaluate(()=>SimCore.experience.current.activity.current);
    for(const key of ['sessionId','title','module','id','type','navigationMode'])assert.deepEqual(after[key],before[key]);
    assert.deepEqual(after.identity,before.identity);await assertRestricted(p,before.sessionId);
    await shot(p,'correcao-1-relatorio-concluido-desktop');
    for(const id of ['inicio','aprender','manual','professor','caderno','roteiros']){await navigate(p,id);assert.equal(await p.evaluate(()=>SimCore.router.current.id),'relatorios');}
    await p.evaluate(()=>{location.hash='#/inicio';});await p.waitForFunction(id=>location.hash==='#/relatorios/'+id,before.sessionId);
    await p.click('#core-menu');await shot(p,'correcao-1-menu-concluido-desktop');
    await p.click('#shell-activity-details');assert.match(await p.locator('#activity-contextual-help').innerText(),/Registrar e explicar/);await p.keyboard.press('Escape');
    await exitActivity(p);assert.equal(await p.locator('#activity-banner').isVisible(),false);assert.equal(await p.locator('#main-nav').isVisible(),true);
    assert.equal(await p.locator('.brand').getAttribute('href'),'#/inicio');
    const saved=await p.evaluate(id=>({marker:SimCore.experience.current.activity.completed('registrar-e-concluir'),archived:SimCore.storage.domain('demo').get('experience.history',[]).find(x=>x.sessionId===id),fields:SimCore.experience.current.reports.fields(id)}),before.sessionId);
    assert.equal(saved.marker,true);assert.equal(saved.archived.status,'completed');assert.ok(saved.archived.closedAt);assert.match(saved.fields.conclusion,/confirmar/);
    await navigate(p,'missoes');assert.match(await p.locator('#mission-open-registrar-e-concluir').innerText(),/Concluído/);
    await p.click('#mission-open-registrar-e-concluir');assert.equal(await p.locator('#activity-start').textContent(),'Refazer missão');
    await p.click('#activity-start');await p.waitForFunction(()=>SimCore.experience.current.activity.current.type==='mission');
    const retry=await p.evaluate(()=>SimCore.experience.current.activity.current);
    assert.notEqual(retry.sessionId,before.sessionId);assert.equal(retry.status,'active');assert.equal(await p.evaluate(()=>SimCore.experience.current.restricted),true);
    assert.match(await p.locator('#demo-view output').innerText(),/0$/);
    await completeMission(p);await exitActivity(p);
    await p.reload();await ready(p);await closeDialog(p,'Retomar');
    assert.equal(await p.evaluate(()=>SimCore.experience.current.activity.completed('registrar-e-concluir')),true);
    return {completionPersisted:true,closedAt:saved.archived.closedAt,newSession:true,previousReportPreserved:true};
   }finally{await c.close();}
  });
  await test('0.2.4 · retomada da sessão concluída preserva relatório e restrição',async()=>{
   const {c,p}=await fresh(b);try{
    await startMission(p);await completeMission(p);const id=await p.evaluate(()=>SimCore.experience.current.activity.current.sessionId);
    await p.reload();await ready(p);await closeDialog(p,'Retomar');await p.waitForSelector('#report-document');
    await assertRestricted(p,id);assert.match(await p.inputValue('#report-conclusion'),/confirmar/);
    assert.equal(await p.evaluate(()=>SimCore.experience.current.modules.current),'medir');return {resumedCompletedSession:true};
   }finally{await c.close();}
  });
  await test('0.2.4 · marca normal, ativa e concluída com teclado e foco',async()=>{
   const {c,p}=await fresh(b);try{
    await navigate(p,'aprender');await p.focus('.brand');await p.keyboard.press('Enter');await p.waitForFunction(()=>SimCore.router.current.id==='inicio');
    await startMission(p);await p.click('#demo-add');const id=await p.evaluate(()=>SimCore.experience.current.activity.current.sessionId);
    await navigate(p,'missoes','registrar-e-concluir');await p.focus('.brand');assert.match(await p.locator('.brand').getAttribute('aria-label'),/Voltar à atividade/);
    await p.keyboard.press('Enter');await p.waitForFunction(()=>SimCore.router.current.id==='laboratorio'&&document.activeElement.id==='scientific-viewport');
    assert.equal(await p.evaluate(()=>SimCore.experience.current.activity.current.sessionId),id);assert.match(await p.locator('#demo-view output').innerText(),/1$/);
    await p.focus('.brand');assert.equal(await p.locator('.brand').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await shot(p,'correcao-3-marca-atividade');
    await p.keyboard.press('Enter');await p.waitForFunction(()=>document.activeElement.id==='scientific-viewport');
    await completeMission(p);await navigate(p,'missoes','registrar-e-concluir');await p.focus('.brand');await p.keyboard.press('Enter');
    await p.waitForSelector('#report-document');await p.waitForFunction(()=>document.activeElement.matches('#screens-host [data-screen-focus]'));
    assert.equal(await p.evaluate(()=>SimCore.experience.current.activity.current.sessionId),id);assert.match(await p.locator('.brand').getAttribute('aria-label'),/relatório/);
    await p.focus('.brand');await shot(p,'correcao-3-marca-concluida');await p.keyboard.press('Enter');await p.waitForFunction(()=>document.activeElement.matches('#screens-host [data-screen-focus]'));
    await exitActivity(p);await navigate(p,'aprender');await p.click('.brand');await p.waitForFunction(()=>SimCore.router.current.id==='inicio');
    return {keyboard:true,sameActivity:true,completedReturnsToReport:true};
   }finally{await c.close();}
  });
  await test('0.2.4 · modal única, três cancelamentos, Salvar, reload e storage único',async()=>{
   const {c,p}=await fresh(b);try{
    for(const method of ['Escape','Cancelar','Fechar Como deseja iniciar?']){
     await p.click('#home-startup');await p.locator('input[value=aprender]').check();
     if(method==='Escape')await p.keyboard.press(method);else await p.getByRole('dialog').getByRole('button',{name:method,exact:true}).click();
     await p.waitForSelector('#startup-settings',{state:'detached'});assert.equal(await p.evaluate(()=>SimCore.storage.core.get('startup',null)),null);
     assert.equal(await p.evaluate(()=>document.activeElement.id),'home-startup');
    }
    await p.click('#home-startup');assert.equal(await p.getByRole('dialog',{name:'Como deseja iniciar?'}).count(),1);
    assert.deepEqual(await p.locator('input[name=startup-destination]').evaluateAll(es=>es.map(e=>e.value)),['inicio','aprender','laboratorio']);
    await trap(p);await axe(p,'inicializacao-desktop');await shot(p,'correcao-2-modal-home');await chooseStartup(p,'aprender');
    await p.click('#core-menu');assert.equal(await p.locator('select#shell-startup').count(),0);await p.click('#shell-startup');
    assert.equal(await p.locator('dialog[open]').count(),1);assert.equal(await p.locator('#app-drawer').evaluate(e=>e.open),false);
    assert.equal(await p.locator('input[name=startup-destination]:checked').inputValue(),'aprender');await shot(p,'correcao-2-modal-menu');await chooseStartup(p,'laboratorio');
    assert.equal(await p.evaluate(()=>document.activeElement.id),'core-menu');await p.reload();await ready(p);assert.equal(await p.evaluate(()=>SimCore.router.current.id),'laboratorio');
    const keys=await p.evaluate(()=>Object.keys(localStorage).filter(k=>/startup|inicializacao/i.test(k)));assert.deepEqual(keys,['simcore_core_v1_startup']);
    await navigate(p,'inicio');await p.click('#home-startup');await chooseStartup(p,'inicio');await p.reload();await ready(p);assert.equal(await p.evaluate(()=>SimCore.router.current.id),'inicio');
    return {cancelMethods:3,startupKeys:keys,defaultRestored:true};
   }finally{await c.close();}
  });
  await test('0.2.4 · destinos registrados, removidos, ocultos, indisponíveis e fallback',async()=>{
   const {c,p}=await fresh(b);try{
    await p.evaluate(async()=>{
     window.startupEnabled=true;window.startupVisible=true;
     await SimCore.registerDomain({manifest:{id:'destinos',nome:'Destinos',nomeCurto:'Destinos',versao:'1',titulo:'Destinos',subtitulo:''},init(ctx){
      ctx.experience.configure({home:{primary:[]},modules:[{id:'um',title:'Um'}],shell:{startup:{destinations:[{id:'escolha',label:'Minha tela',enabled:()=>startupEnabled,visible:()=>startupVisible},{id:'bloqueada',label:'Bloqueada',enabled:false},{id:'oculta',label:'Oculta',visible:false},{id:'ausente',label:'Ausente'}]}},screens:[{id:'bloqueada',title:'Bloqueada'},{id:'oculta',title:'Oculta'}]});
      window.removeStartupScreen=ctx.experience.registerScreen({id:'escolha',title:'Minha tela',render(host){host.textContent='Tela elegível';}});
     }});
    });
    await navigate(p,'inicio');await p.click('#home-startup');assert.deepEqual(await p.locator('input[name=startup-destination]').evaluateAll(es=>es.map(e=>e.value)),['inicio','escolha']);await chooseStartup(p,'escolha');
    assert.equal(await p.evaluate(()=>SimCore.shell.resolveInitialHash('')),'escolha');
    await p.evaluate(()=>{startupEnabled=false;});assert.equal(await p.evaluate(()=>SimCore.shell.resolveInitialHash('')),'inicio');
    await p.evaluate(()=>{startupEnabled=true;startupVisible=false;});assert.equal(await p.evaluate(()=>SimCore.shell.resolveInitialHash('')),'inicio');
    await p.evaluate(()=>{startupVisible=true;removeStartupScreen();});assert.equal(await p.evaluate(()=>SimCore.shell.resolveInitialHash('')),'inicio');
    await p.evaluate(()=>SimCore.storage.core.set('startup','nao-existe'));await p.goto(url+'?demo=1');await ready(p);assert.equal(await p.evaluate(()=>SimCore.router.current.id),'inicio');
    await p.evaluate(()=>SimCore.shell.setStartup('aprender'));await p.goto(url+'?demo=1#/manual');await ready(p);assert.equal(await p.evaluate(()=>SimCore.router.current.id),'manual');
    return {onlyExplicitDestinationsPlusFallback:true,unavailable:true,removed:true,hidden:true,invalidReload:true,directLinkPreserved:true};
   }finally{await c.close();}
  });
  await test('0.2.4 · roteiro com conclusão formal mantém contexto até Encerrar',async()=>{
   const {c,p}=await fresh(b);try{
    await p.evaluate(async()=>SimCore.registerDomain({manifest:{id:'roteiro-formal',nome:'Roteiro',nomeCurto:'Roteiro',versao:'1',titulo:'Roteiro',subtitulo:''},init(ctx){ctx.experience.configure({home:{primary:[]},modules:[{id:'um',title:'Um'}],routes:[{id:'formal',title:'Roteiro com conclusão',module:'um',navigation:'restricted',validate:()=>true,help:{instructions:'Registre e conclua a atividade.'}}],report:{collect:()=>({sections:[{title:'Registros',text:'Dados da sessão.'}]})}});}}));
    await navigate(p,'roteiros','formal');await p.click('#activity-start');await p.waitForFunction(()=>SimCore.experience.current.activity.current.type==='route');
    const id=await p.evaluate(()=>SimCore.experience.current.activity.current.sessionId);await p.click('#core-menu');await p.click('#shell-activity-finish');await p.click('#route-finish');await p.waitForSelector('#report-document');
    await assertRestricted(p,id);await exitActivity(p);
    const archived=await p.evaluate(id=>SimCore.storage.domain('roteiro-formal').get('experience.history',[]).find(x=>x.sessionId===id),id);assert.equal(archived.status,'completed');assert.ok(archived.closedAt);
    return {formalRoute:true,closedCompletedHistory:true};
   }finally{await c.close();}
  });
  await test('0.2.4 · relatório opcional e encerramento sem conclusão',async()=>{
   const {c,p}=await fresh(b);try{
    await p.evaluate(async()=>SimCore.registerDomain({manifest:{id:'sem-relatorio',nome:'Atividade',nomeCurto:'Atividade',versao:'1',titulo:'Atividade',subtitulo:''},init(ctx){ctx.experience.configure({home:{primary:[]},modules:[{id:'um',title:'Um'}],missions:[{id:'m',title:'Missão',module:'um',navigation:'restricted',validate:()=>true}]});}}));
    await navigate(p,'missoes','m');await p.click('#activity-start');await p.waitForFunction(()=>SimCore.experience.current.activity.current.type==='mission');
    await navigate(p,'missoes','m');await p.click('#mission-finish');await p.waitForFunction(()=>SimCore.experience.current.activity.current.status==='completed');
    assert.equal(await p.evaluate(()=>SimCore.experience.current.restricted),true);await p.click('.brand');await p.waitForFunction(()=>SimCore.router.current.id==='laboratorio');
    await p.click('#core-menu');assert.equal(await p.locator('#shell-activity-report').count(),0);await p.keyboard.press('Escape');await exitActivity(p);
    await navigate(p,'missoes','m');await p.click('#activity-start');await p.waitForFunction(()=>SimCore.experience.current.activity.current.type==='mission');const id=await p.evaluate(()=>SimCore.experience.current.activity.current.sessionId);await exitActivity(p);
    assert.equal(await p.evaluate(id=>SimCore.storage.domain('sem-relatorio').get('experience.history',[]).find(x=>x.sessionId===id).status,id),'closed');
    return {withoutReport:true,closedWithoutCompletion:true};
   }finally{await c.close();}
  });
  await test('0.2.4 · quatro fluxos em mobile, tablet, landscape e fonte 150%',async()=>{
   const sizes=[[320,568],[360,740],[390,844],[844,390],[768,1024]],samples=[];
   for(const [width,height]of sizes){
    const {c,p}=await fresh(b,{viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});try{
     await p.evaluate(w=>{A11Y.definir('fontScale',1.5);A11Y.definir('theme',w===360||w===844?'light':'dark');A11Y.definir('contrast',w===390);},width);
     await p.tap('#home-startup');await trap(p);await noOverflow(p);const box=await p.getByRole('dialog',{name:'Como deseja iniciar?'}).boundingBox();assert.ok(box.x>=-1&&box.x+box.width<=width+1&&box.y>=-1&&box.y+box.height<=height+1,JSON.stringify(box));
     await axe(p,'inicializacao-mobile-'+width);await shot(p,'correcao-2-modal-mobile-'+width);await chooseStartup(p,'aprender');
     await p.tap('#core-menu');await p.tap('#shell-startup');assert.equal(await p.locator('input[name=startup-destination]:checked').inputValue(),'aprender');await p.keyboard.press('Escape');
     await startMission(p);await completeMission(p);const id=await p.evaluate(()=>SimCore.experience.current.activity.current.sessionId);await assertRestricted(p,id);await settle(p);
     assert.equal(await p.locator('#access-btn').isVisible(),true);assert.equal(await p.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bottom-h'))),0);
     await noOverflow(p);await axe(p,'relatorio-concluido-mobile-'+width);await shot(p,'correcao-1-relatorio-mobile-'+width);
     await navigate(p,'missoes','registrar-e-concluir');await p.tap('.brand');await p.waitForSelector('#report-document');assert.equal(await p.evaluate(()=>SimCore.experience.current.activity.current.sessionId),id);
     await p.tap('#access-btn');await trap(p);assert.equal(await p.locator('#shell-accessibility').getAttribute('aria-expanded'),'true');await axe(p,'menu-concluido-mobile-'+width);await shot(p,'correcao-1-menu-mobile-'+width);await p.keyboard.press('Escape');
     await exitActivity(p);await settle(p);assert.equal(await p.locator('#bottom-nav').isVisible(),true);assert.equal(await p.locator('.brand').getAttribute('href'),'#/inicio');assert.equal(await p.evaluate(()=>SimCore.experience.current.activity.completed('registrar-e-concluir')),true);
     samples.push({width,height,fontScale:1.5,completedRestriction:true,report:true,brand:true,startup:true,restoredNavigation:true});
    }finally{await c.close();}
   }return {samples};
  });
  await test('0.2.4 · modal, cancelamento e lifecycle em 20 ciclos',async()=>{
   const {c,p}=await fresh(b);try{
    await watchRootListeners(p);const before=await p.evaluate(()=>({...SimCore.scopeStats}));
    for(let i=0;i<20;i++){await p.click('#home-startup');await p.locator('input[value=aprender]').check();await p.keyboard.press('Escape');await p.waitForSelector('#startup-settings',{state:'detached'});}
    assert.deepEqual(await p.evaluate(()=>({...SimCore.scopeStats})),before);assert.equal(await p.evaluate(()=>rootListenerAudit()),0);assert.equal(await p.locator('dialog.app-dialog').count(),0);
    await p.click('#home-startup');await p.evaluate(()=>SimCore.registerDomain(null));assert.equal(await p.locator('dialog.app-dialog').count(),0);assert.deepEqual(await p.evaluate(()=>SimCore.scopeStats),{scopes:0,resources:0});
    return {cycles:20,addedRootListeners:0,scopesAfterUnload:0};
   }finally{await c.close();}
  });
 }finally{await b.close();}
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;}).finally(()=>{report.status=report.tests.some(t=>t.status==='FAIL')||process.exitCode?'FAIL':'PASS';fs.writeFileSync(path.join(out,'FECHAMENTO-BASE-0.2.4.json'),JSON.stringify(report,null,2)+'\n');server.close();});
