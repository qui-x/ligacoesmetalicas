// SILM Parte 6: auditoria contínua, sem mudanças automáticas na interface.
// Cada commit na main registra resultados por navegador, viewport e escala.
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','responsividade',browserName);
mkdirSync(dir,{recursive:true});
const sizes=[
 ['celular-compacto',320,568],
 ['celular-pequeno',360,640],
 ['celular-padrao',390,844],
 ['celular-grande',414,896],
 ['celular-paisagem',844,390],
 ['tablet-retrato',768,1024],
 ['tablet-paisagem',1024,768],
 ['notebook-compacto',1280,720],
 ['notebook',1366,768],
 ['desktop',1440,900],
 ['full-hd',1920,1080],
 ['qhd',2560,1440]
];
const results=[], scriptErrors=[];
let browser, page;

function add(phase,view,severity,code,detail,fix){
 results.push({browser:browserName,phase,viewport:view,severity,code,detail,fix});
}
function rect(node){
 if(!node)return null;
 const r=node.getBoundingClientRect();
 return {x:Math.round(r.x),y:Math.round(r.y),
  width:Math.round(r.width),height:Math.round(r.height),
  right:Math.round(r.right),bottom:Math.round(r.bottom)};
}
async function inspect(phase,name,width,height){
 const label=name+' ('+width+'x'+height+')';
 await page.setViewportSize({width,height});
 await page.waitForTimeout(150);
 const metrics=await page.evaluate(()=>{
  const visible=e=>!!e && !!e.getClientRects().length && getComputedStyle(e).visibility!=='hidden';
  const rc=e=>{
   if(!visible(e))return null;
   const b=e.getBoundingClientRect();
   return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};
  };
  const q=s=>document.querySelector(s);
  const controls=[...document.querySelectorAll(
   '#silm-scene-actionbar .silm-quick-icon,'+
   '#silm-scene-actionbar .silm-camera-btn,'+
   '#silm-scene-actionbar #si-expand-structure,'+
   '#silm-scene-actionbar .silm-lattice-nav button'
  )].filter(visible).map(e=>({id:e.id||e.getAttribute('aria-label')||e.className,box:rc(e)}));
  const selectors={
   work:'#si-workspace',nav:'.si-workspace-toolbar',
   scene:'#si-stage',action:'#silm-scene-actionbar',
   scales:'.silm-workshop-scales',reference:'.silm-workshop-reference',
   micro:'.silm-workshop-micro-viewport',
   toolbar:'.silm-workshop-micro-toolbar',
   image:'.silm-workshop-reference .silm-workshop-atlas-photo img'
  };
  const boxes={};
  for(const [k,v] of Object.entries(selectors))boxes[k]=rc(q(v));
  const img=q(selectors.image);
  return {innerWidth,innerHeight,documentWidth:document.documentElement.scrollWidth,
   boxes,controls,image:img&&visible(img)?{complete:img.complete,naturalWidth:img.naturalWidth,src:img.getAttribute('src')}:null,
   barOverflow:q(selectors.action)?getComputedStyle(q(selectors.action)).overflowX:null,
   barScrollWidth:q(selectors.action)?.scrollWidth||0,
   barClientWidth:q(selectors.action)?.clientWidth||0};
 });
 let count=0;
 function issue(code,detail,fix,severity='error'){
  add(phase,label,severity,code,detail,fix);if(severity==='error')count++;
 }
 if(metrics.documentWidth>width+4)
  issue('ROLAGEM_GLOBAL','Documento excede a largura: '+Math.ceil(metrics.documentWidth-width)+'px',
   'Identificar largura fixa, min-width ou conteúdo absoluto; limitar o contêiner e deixar rolagem apenas no componente.');
 for(const [key,b] of Object.entries(metrics.boxes)){
  if(!b)continue;
  if((b.x < -5 || b.right>width+5) && key!=='image')
   issue('FORA_DA_TELA',key+' ultrapassa o viewport: '+Math.round(b.x)+'…'+Math.round(b.right),
    'Rever grid, flex-basis, max-width e espaçamento do componente '+key+'.');
 }
 if(metrics.boxes.action){
  if(metrics.barScrollWidth>metrics.barClientWidth+4 && !['auto','scroll'].includes(metrics.barOverflow))
   issue('BARRA_CORTADA','Controles extrapolam a barra, sem rolagem horizontal habilitada.',
    'Aplicar overflow-x:auto e flex-wrap:nowrap à faixa, sem reduzir os botões.');
  if(metrics.boxes.action.height<40)
   issue('BARRA_ESTREITA','A faixa inferior tem somente '+Math.round(metrics.boxes.action.height)+'px de altura.',
    'Reservar altura suficiente para controles acionáveis e área de foco.');
 }
 if(width<=900){
  for(const c of metrics.controls){
   if(c.box.width<43 || c.box.height<43)
    issue('ALVO_TOQUE',String(c.id)+' mede '+Math.round(c.box.width)+'x'+Math.round(c.box.height)+'px.',
     'Preservar alvo de toque com ao menos 44x44px; rolar a faixa se necessário.');
  }
 }
 if(phase==='micro' && (!metrics.boxes.micro || metrics.boxes.micro.width<200 || metrics.boxes.micro.height<190))
  issue('MICROESTRUTURA_COMPRIMIDA','A área de grãos não possui espaço útil adequado.',
   'Priorizar o desenho, ajustar altura disponível ou permitir rolagem vertical interna.');
 if(phase==='macro' && metrics.image && metrics.image.complete && metrics.image.naturalWidth===0)
  issue('IMAGEM_NAO_CARREGADA','A ilustração da aplicação não carregou: '+metrics.image.src,
   'Conferir asset, caminho no atlas e cache da PWA.');
 const filename=phase+'--'+name+'--'+width+'x'+height+'.jpg';
 try{
  await page.screenshot({path:join(dir,filename),type:'jpeg',quality:68,animations:'disabled',timeout:15000});
 }catch(e){issue('CAPTURA','Não foi possível registrar imagem: '+e.message,
   'Rever a estabilidade da página ou o timeout da captura.','warning');}
 console.log((count?'FALHA':'OK')+' '+browserName+' '+phase+' '+label+' problemas='+count);
 return metrics;
}
async function periodic(width,height,label){
 await page.setViewportSize({width,height});
 await page.waitForTimeout(100);
 await page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'}).click();
 const dlg=page.locator('#silm-periodic-dialog');
 await dlg.waitFor({state:'visible'});
 const b=await dlg.evaluate(rect);
 if(b.x < -5 || b.right > width+5)
  add('tabela',label,'error','MODAL_LARGURA',
   'Tabela periódica fora da janela ('+b.x+'…'+b.right+')',
   'Usar largura limitada ao viewport e rolagem dentro do diálogo.');
 if(b.bottom>height+5 || b.y<-5)
  add('tabela',label,'error','MODAL_ALTURA',
   'Tabela periódica excede a altura da janela.',
   'Limitar max-height e manter área interna com overflow-y:auto.');
 try{
  await page.screenshot({path:join(dir,'tabela--'+label+'.jpg'),
   type:'jpeg',quality:68,animations:'disabled'});
 }catch(e){add('tabela',label,'warning','CAPTURA',e.message,'Verificar captura de diálogos.');}
 await page.locator('#silm-close-periodic').click();
}

try{
 const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 browser=await playwright[browserName].launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 page=await context.newPage();
 // Instrumentação de diagnóstico sem mascarar falhas de ResizeObserver.
 // Captura a origem dos observadores, alvos e callbacks que antecedem a falha.
 if(browserName==='webkit'&&process.env.SILM_RESIZE_TRACE==='1'){
  await page.addInitScript(()=>{
   const Native=window.ResizeObserver;
   if(typeof Native!=='function')return;
   const trace={created:[],events:[],errors:[],current:null};
   window.__silmResizeTrace=trace;
   let nextId=0;
   const describe=e=>{
    if(!e)return 'null';
    return (e.tagName||'')+'#'+(e.id||'')+'.'+String(e.className?.baseVal??e.className??'').slice(0,80);
   };
   window.ResizeObserver=class SILMDiagnosticResizeObserver extends Native{
    constructor(callback){
     const id=++nextId;
     const stack=(new Error('ResizeObserver origem')).stack?.slice(0,1100);
     trace.created.push({id,stack});
     super((entries,observer)=>{
      trace.current=id;
      const record={
       id,at:Math.round(performance.now()),width:innerWidth,height:innerHeight,
       hash:location.hash,targets:entries.map(e=>({
        node:describe(e.target),
        width:Math.round(e.contentRect.width),height:Math.round(e.contentRect.height)
       }))
      };
      trace.events.push(record);
      if(trace.events.length>80)trace.events.shift();
      try{callback(entries,observer);}
      finally{trace.current=null;}
     });
     this.__silmId=id;
    }
    observe(target,options){
     const item=trace.created.find(x=>x.id===this.__silmId);
     if(item){item.targets=item.targets||[];item.targets.push(describe(target));}
     return super.observe(target,options);
    }
   };
   window.addEventListener('error',e=>{
    if(/ResizeObserver/.test(e.message||'')){
     trace.errors.push({at:Math.round(performance.now()),message:e.message,phase:location.hash,
      last:trace.events.slice(-12)});
    }
   },true);
  });
 }
 page.on('pageerror',e=>scriptErrors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 if(!response?.ok())throw new Error('SILM não abriu: HTTP '+response?.status());
 await page.waitForFunction(()=>!!window.SILM?.workshop?.valid() &&
  !document.querySelector('#silm-workshop-context')?.hidden,undefined,{timeout:45000});

 // Regressão inicial: layout da Oficina em todos os perfis.
 for(const [name,w,h] of sizes)await inspect('entrada',name,w,h);
 for(const [name,w,h] of [
  ['celular-compacto',320,568],['celular-paisagem',844,390],
  ['tablet-retrato',768,1024],['desktop',1440,900]
 ])await periodic(w,h,name);

 // Investigar um metal do catálogo: as escalas exigem controles diferentes.
 await page.setViewportSize({width:390,height:844});
 await page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'}).click();
 await page.locator('#silm-periodic-dialog [data-z="29"]').click();
 await page.locator('#silm-periodic-dialog [id$="-explore"]').click();
 await page.locator('.silm-workshop-card[data-reference-id="atlas-cu"]')
  .getByRole('button',{name:'Investigar componente'}).click();
 await page.waitForFunction(()=>window.SILMIntegration?.snapshot?.()?.metal?.atomicNumber===29,
  undefined,{timeout:30000});
 for(const [name,w,h] of sizes)await inspect('macro',name,w,h);
 await page.locator('.silm-workshop-scale').nth(1).click();
 await page.locator('.silm-workshop-micro-viewer').waitFor({state:'visible'});
 for(const [name,w,h] of sizes)await inspect('micro',name,w,h);

 if(browserName==='webkit'&&process.env.SILM_RESIZE_TRACE==='1'){
  const trace=await page.evaluate(()=>window.__silmResizeTrace||null);
  if(trace){
   writeFileSync(join(dir,'resizeobserver-trace.json'),JSON.stringify(trace,null,2));
   console.log('DIAGNOSTICO_RESIZEOBSERVER '+JSON.stringify({
    created:trace.created,errors:trace.errors,lastCallbacks:trace.events.slice(-30)
   }));
  }
 }
 // Problemas do ResizeObserver também reprovam a auditoria: nunca escondê-los
 // como avisos, mesmo quando a interface ainda parece funcionar.
 for(const err of scriptErrors){
  const resizeLoop=/ResizeObserver loop completed with undelivered notifications/.test(err);
  add('javascript','todas','error',
   resizeLoop?'RESIZEOBSERVER':'JS_EXCEPTION',err,
   resizeLoop?'Desacoplar alterações de layout do callback de ResizeObserver e verificar redraws consecutivos.':
              'Investigar o erro JavaScript no console e no módulo correspondente.');
 }
 await context.close();
}catch(e){
 add('execucao','geral','error','FALHA_DE_NAVEGACAO',String(e?.stack||e),
  'Conferir abertura, seletores ou tempo de carregamento; rever primeira falha do log.');
}finally{
 if(browser)await browser.close().catch(()=>{});
 const failures=results.filter(r=>r.severity==='error');
 const warnings=results.filter(r=>r.severity==='warning');
 const lines=[
  '# Auditoria de responsividade — '+browserName,
  '',
  'Referência: '+(process.env.GITHUB_SHA||'execução local'),
  '',
  '**Resultado:** '+(failures.length?'FALHOU':'APROVADO')+
    ' · '+failures.length+' falha(s), '+warnings.length+' aviso(s)',
  '',
  'Telas inspecionadas: 12 dimensões × entrada, macro e micro; quatro verificações da Tabela Periódica.',
  '',
  '| Gravidade | Escala/tela | Problema | Ajuste recomendado |',
  '|---|---|---|---|'
 ];
 for(const x of results){
  const safe=s=>String(s).replace(/\|/g,'/').replace(/\s+/g,' ').slice(0,260);
  lines.push('| '+x.severity+' | '+safe(x.phase+' / '+x.viewport)+
   ' | '+safe(x.code+': '+x.detail)+' | '+safe(x.fix)+' |');
 }
 if(!results.length)lines.push('| info | Todas | Nenhum problema detectado por este conjunto de verificações | Inspeção visual complementar recomendada |');
 lines.push('','As imagens JPEG ficam na pasta deste relatório. Nenhuma alteração de código é realizada pelo teste.');
 writeFileSync(join(dir,'relatorio.md'),lines.join('\n')+'\n');
 writeFileSync(join(dir,'resultados.json'),JSON.stringify({
  browser:browserName,commit:process.env.GITHUB_SHA||null,
  resolutions:sizes,failures:failures.length,warnings:warnings.length,results
 },null,2)+'\n');
 console.log('RESUMO '+browserName+': '+failures.length+' falhas / '+warnings.length+' avisos.');
 if(failures.length)process.exitCode=1;
}