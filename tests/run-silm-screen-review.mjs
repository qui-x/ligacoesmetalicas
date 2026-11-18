// SILM #191 — inventário visual de rotas e estados REAIS da interface.
// Não altera a aplicação: apenas navega no Chromium e registra evidências para revisão humana.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const section=process.env.AUDIT_SECTION||'routes';
const root=join('reports','tela-a-tela',section);
mkdirSync(join(root,'images'),{recursive:true});
const browser=await pw.chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce',acceptDownloads:true});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const sizes=[
 ['celular-320',320,568],['celular-390',390,844],
 ['paisagem-844',844,390],['tablet-768',768,1024],
 ['notebook-1366',1366,768],['fullhd-1920',1920,1080]
];
const routes=['inicio','ambiente','roteiros','montagens','relatorios','aprender','missoes','manual','caderno','professor','atividade','configuracoes','sobre'];
const records=[],events=[],runtime=[];
page.on('pageerror',e=>runtime.push(String(e.message)));
page.on('requestfailed',r=>runtime.push('HTTP '+r.url().slice(-120)+' '+(r.failure()?.errorText||'')));
function note(id,reason,kind='not-reached'){events.push({id,kind,reason:String(reason).slice(0,280)});console.log('REVIEW_NOTE '+id+' '+reason);}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/-+/g,'-').slice(0,92);}
async function go(route,query=''){
 const hash='#/'+route+(query?'?'+query:'');
 await page.evaluate(h=>{location.hash=h;},hash);
 await page.waitForFunction(r=>{const n=document.querySelector('[data-view="'+r+'"]');return n&&!n.hidden;},route,{timeout:18000});
 await page.waitForTimeout(110);
}
async function setSize(v){await page.setViewportSize({width:v[1],height:v[2]});await page.waitForTimeout(75);}
async function tap(selector){const n=page.locator(selector).first();if(!await n.isVisible())throw Error('Controle não visível: '+selector);await n.click();}
async function dock(id){
 const b=page.locator('[data-open-dock="'+id+'"]');
 if(await b.getAttribute('aria-expanded')!=='true')await b.click();
 const target=id==='montagem'?'#si-dock-left':'#si-dock-right';
 await page.locator(target).waitFor({state:'visible'});
}
async function shut(id){
 const node=id==='montagem'?'#si-dock-left':'#si-dock-right';
 if(await page.locator(node).isVisible())await tap('[data-close-dock="'+(id==='montagem'?'left':'right')+'"]');
}
async function capture(id,v,info={}){
 const name=slug(id)+'--'+v[0]+'.jpg',file='images/'+name;
 const sample=await page.evaluate(()=>{
  const vis=x=>{const r=x.getBoundingClientRect(),s=getComputedStyle(x);return !!r.width&&!!r.height&&s.visibility!=='hidden'&&s.display!=='none';};
  const items=[...document.querySelectorAll('button,a[href],input,select,textarea,[role="button"]')].filter(vis);
  const narrow=items.filter(x=>{const r=x.getBoundingClientRect();return r.width<43.5||r.height<43.5;})
   .slice(0,12).map(x=>({tag:x.tagName,label:(x.getAttribute('aria-label')||x.textContent||x.getAttribute('title')||'').trim().slice(0,65),
    w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)}));
  const broken=[...document.images].filter(x=>vis(x)&&x.complete&&x.naturalWidth===0).map(x=>x.currentSrc.slice(-130)).slice(0,15);
  const selected=[...document.querySelectorAll('[aria-expanded="true"],[aria-pressed="true"],[aria-current]')]
   .filter(vis).map(x=>({label:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,45),
     state:x.getAttribute('aria-current')||x.getAttribute('aria-pressed')||x.getAttribute('aria-expanded')})).slice(0,22);
  const box=s=>{const e=document.querySelector(s);if(!e||!vis(e))return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};};
  return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,
   documentHeight:document.documentElement.scrollHeight,visibleControls:items.length,
   controlsUnder44:narrow,brokenImages:broken,expandedOrPressed:selected,
   scene:box('#si-stage'),dockLeft:box('#si-dock-left'),dockRight:box('#si-dock-right'),
   headings:[...document.querySelectorAll('h1,h2')].filter(vis).map(x=>x.textContent.trim().slice(0,75)).slice(0,6)};
 });
 let screenshotError=null;
 try{await page.screenshot({path:join(root,file),type:'jpeg',quality:72,animations:'disabled',timeout:20000,fullPage:false});}
 catch(e){screenshotError=String(e.message).slice(0,200);note(id,'Falha ao capturar '+v[0]+': '+screenshotError,'capture-error');}
 const row={id,viewport:v[0],route:info.route||null,phase:info.phase||null,file:screenshotError?null:file,
  ...sample,issues:[
  ...(sample.documentWidth>v[1]+6?['Rolagem horizontal global '+sample.documentWidth+'px para viewport '+v[1]+'px']:[]),
  ...(sample.brokenImages.length?['Imagem visível quebrada']:[])
  ],state:info.state||'captured'};
 records.push(row);
 console.log('SCREEN '+JSON.stringify({id,v:v[0],issues:row.issues.length,controls:row.visibleControls}));
}
async function optional(id,v,fn){try{await fn();await capture(id,v);}catch(e){note(id,e.message);}}
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
try{
 const response=await page.goto(base+'/index.html#/inicio',{waitUntil:'domcontentloaded',timeout:45000});
 if(!response?.ok())throw Error('Falha HTTP na aplicação: '+response?.status());
 await page.waitForFunction(()=>typeof window.SILMIntegration?.snapshot==='function'&&!!window.SILM?.workshop,undefined,{timeout:30000});
 if(section==='routes'){
  for(const v of sizes){
   await setSize(v);
   for(const route of routes)await optional('rota-'+route,v,async()=>{await go(route);});
   const ids=await page.evaluate(()=>({
    missao:SILM.missions?.registry?.[0]?.id,
    roteiro:SILM.routes?.registry?.[0]?.id,
    tema:SILM.themes?.registry?.[0]?.id
   }));
   for(const [id,route,key] of [['missao-detalhe','missoes','missao'],['roteiro-detalhe','roteiros','roteiro'],['tema-detalhe','aprender','tema']]){
    if(!ids[key]){note(id,'Nenhum ID no catálogo');continue;}
    await optional(id,v,async()=>{await go(route,(key==='tema'?'tema':'item')+'='+encodeURIComponent(ids[key]));});
   }
   await optional('painel-acessibilidade',v,async()=>{await go('inicio');await tap('#si-header-access');
    await page.locator('#si-a11y-panel').waitFor({state:'visible'});});
   if(await page.locator('#si-a11y-panel').isVisible())await page.keyboard.press('Escape');
   if(v[0]==='celular-390'||v[0]==='fullhd-1920'){
    for(const route of routes){
     try{
      await go(route);
      const name='rota-'+route+'--'+v[0]+'--pagina-inteira.jpg';
      await page.screenshot({path:join(root,'images',name),type:'jpeg',quality:63,fullPage:true,timeout:18000,animations:'disabled'});
      events.push({id:'rota-'+route+'-'+v[0],kind:'full-page',reason:'images/'+name});
     }catch(e){note('pagina-inteira-'+route,e.message);}
    }
   }
  }
  note('atividade-com-link','A rota atividade sem token foi fotografada; estudar fluxo real de link válido do Professor','human-review');
  note('temas-e-topicos','Os catálogos de 39 temas e 29 tópicos exigem segunda rodada de amostragem/manual; não confundir primeira amostra com todos os itens','human-review');
 }
 else if(section==='workshop'){
  await go('ambiente');
  // Primeiro fotografar o estado inicial sem mudar a cena entre viewports.
  for(const v of sizes){
   await setSize(v);
   await optional('oficina-entrada',v,async()=>{await go('ambiente');await shut('montagem');await shut('ver');});
  }
  for(const v of sizes){
   await setSize(v);
   await optional('montagem-preparo-inicial',v,async()=>{await dock('montagem');await tap('[data-left-tab="preparo"]');});
   await optional('tabela-no-palco',v,async()=>{await dock('montagem');await tap('[data-left-tab="preparo"]');await tap('#silm-open-periodic');
    await page.locator('#silm-object-entry .periodic-element[data-z="29"]').waitFor({state:'visible'});});
   await optional('catalogo-objetos-cobre',v,async()=>{await page.locator('#silm-object-entry .periodic-element[data-z="29"]').click();
    await page.locator('#silm-objects-dialog').waitFor({state:'visible'});});
   if(await page.locator('#silm-objects-dialog').isVisible())await tap('#silm-objects-close');
  }
  await setSize(sizes[4]);await dock('montagem');await tap('[data-left-tab="preparo"]');await tap('#silm-open-periodic');
  await tap('#silm-object-entry .periodic-element[data-z="29"]');
  await page.locator('#silm-objects-dialog [data-reference-id="atlas-cu"]').getByRole('button',{name:'Iniciar montagem'}).click();
  await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===29,undefined,{timeout:20000});
  for(const v of sizes){
   await setSize(v);
   for(const n of [1,2,3,4])await optional('escala-'+n+'-foco',v,async()=>{
    await tap('.silm-workshop-scale[data-scale="'+n+'"]');
    await page.waitForFunction(n=>document.querySelector('#si-stage')?.dataset.workshopScale===String(n),n);
    if(n===2)await page.waitForFunction(()=>document.querySelector('.silm-workshop-micro-map')?.dataset.mapReady==='true',undefined,{timeout:15000});
   });
   await optional('visao-geral',v,async()=>{await tap('[data-scene-view="overview"]');});
   if(await page.locator('[data-scene-view="focus"]').isVisible())await tap('[data-scene-view="focus"]');
   for(const tab of ['preparo','modulo','resumo'])await optional('montagem-'+tab,v,async()=>{
    await dock('montagem');await tap('[data-left-tab="'+tab+'"]');});
   await shut('montagem');
   await optional('ver-ferramentas',v,async()=>{await dock('ver');});
   await shut('ver');
   await optional('dados-inicio',v,async()=>{await dock('dados');});
   for(const tab of ['tabela','registros','arquivo'])await optional('dados-'+tab,v,async()=>{
    await dock('dados');if(!await page.locator('[data-silm-data-open="'+tab+'"]').isVisible())await tap('#silm-data-back');
    await tap('[data-silm-data-open="'+tab+'"]');});
   if(await page.locator('#silm-data-back').isVisible())await tap('#silm-data-back');
   await shut('dados');
   for(const module of ['explorar','medir','calcular'])await optional('modulo-'+module,v,async()=>{
    await dock('montagem');await tap('[data-left-tab="modulo"]');
    const b=page.locator('#silm-module-activate-'+module);
    if(!await b.isVisible()){
     const parent=b.locator('xpath=ancestor::details');
     if(await parent.count())await parent.locator(':scope > summary').click();
    }
    await b.click();
    await page.waitForFunction(m=>SILMIntegration.snapshot()?.module?.active===m,module,{timeout:14000});
    await shut('montagem');
   });
  }
  for(const v of [sizes[1],sizes[4]])await optional('laboratorio-3d',v,async()=>{
   await setSize(v);await tap('.silm-lab3d-entry');
   await page.locator('.silm-lab3d').waitFor({state:'visible',timeout:18000});
  });
  if(await page.locator('[data-lab-action="close"]').isVisible())await tap('[data-lab-action="close"]');
  note('missao-na-oficina','Painel Missão só é visível em sessão guiada. Não classificar como ausente sem iniciar atividade','human-review');
  note('propriedades-instrumentos','Cada fenômeno e instrumento precisa de ensaio funcional específico; capturas dos módulos comprovam layout, não calibração científica','human-review');
 }
 else throw Error('AUDIT_SECTION inválida: '+section);
}catch(e){note('execucao','Interrupção do percurso: '+String(e.stack||e),'critical');}
finally{
 const esc=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const issues=records.filter(x=>x.issues.length),missed=events.filter(x=>x.kind==='not-reached'||x.kind==='critical');
 const report={schema:'silm.screen-review.v1',section,sha:process.env.GITHUB_SHA||null,date:new Date().toISOString(),
  matrix:sizes.map(x=>({name:x[0],width:x[1],height:x[2]})),expectedRoutes:section==='routes'?routes:[],
  summary:{screensCaptured:records.filter(x=>x.file).length,states:records.length,possibleLayoutIssues:issues.length,notReached:missed.length,runtimeErrors:runtime.length},
  records,events,runtime};
 writeFileSync(join(root,'report.json'),JSON.stringify(report,null,2)+'\n');
 let md='# SILM — auditoria tela a tela: '+section+'\n\nCommit: '+(report.sha||'local')+
  '\n\n**Capturas:** '+report.summary.screensCaptured+' · **Anomalias mensuráveis:** '+issues.length+
  ' · **Estados não alcançados:** '+missed.length+' · **Erros observados:** '+runtime.length+
  '\n\n> Checklist humano: clareza, contraste, foco, alinhamento, volume de controles, hierarquia e utilidade. As métricas NÃO decidem sozinhas quais ações remover.\n\n';
 md+='| Tela | Viewport | Screenshot | Alertas | Controles pequenos (<44px) |\n|---|---|---|---|---|\n';
 for(const x of records)md+='| '+x.id+' | '+x.viewport+' | '+(x.file?'[abrir]('+x.file+')':'FALHOU')+' | '+(x.issues.join('; ')||'—')+' | '+x.controlsUnder44.length+' (até 12 exemplos) |\n';
 md+='\n## Estados não alcançados e pendências para revisão\n';
 for(const x of events)md+='- **'+x.id+'** ('+x.kind+'): '+x.reason+'\n';
 md+='\n## Erros de execução\n'+(runtime.map(x=>'- '+x).join('\n')||'Nenhum coletado')+'\n';
 writeFileSync(join(root,'report.md'),md);
 const cards=records.map(x=>'<article><img loading="lazy" src="'+esc(x.file||'')+'" alt="Captura '+esc(x.id)+'"><h3>'+esc(x.id)+'</h3>'+
  '<p>'+esc(x.viewport)+' · '+x.width+'×'+x.height+' · '+esc(x.issues.join('; ')||'Sem alerta geométrico')+
  '</p><small>'+esc(x.headings.join(' / '))+'</small></article>').join('');
 const html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>Auditoria visual SILM — '+esc(section)+'</title><style>'+
  'body{font:16px system-ui;margin:0 auto;max-width:1500px;padding:24px;background:#edf1f4;color:#18242e}'+
  'main{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:18px}'+
  'article{background:white;border:1px solid #bac6ce;border-radius:12px;padding:12px;overflow:hidden}'+
  'img{width:100%;height:250px;object-fit:contain;background:#dce2e6}h3{font-size:1rem;margin:10px 0 4px}'+
  'p,small{font-size:.85rem;overflow-wrap:anywhere}a{color:#07528e}</style>'+
  '<h1>Auditoria SILM: '+esc(section)+'</h1><p>'+records.length+' estados fotografados. Compare o mesmo ID nos seis viewports. Relatório detalhado em <a href="report.md">report.md</a>; métricas em <a href="report.json">report.json</a>.</p><main>'+
  cards+'</main></html>';
 writeFileSync(join(root,'galeria.html'),html);
 console.log('SCREEN_REVIEW_SUMMARY '+JSON.stringify(report.summary));
 await context.close();await browser.close();
 if(section==='routes'&&records.filter(x=>x.id.startsWith('rota-')&&x.file).length<routes.length*sizes.length)process.exitCode=1;
 if(events.some(x=>x.kind==='critical'))process.exitCode=1;
}
