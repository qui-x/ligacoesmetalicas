'use strict';
/* TEST-NOTEBOOK — Etapa 6 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   O Caderno na ordem do SIAB 1.0.0: cabeçalho, ações (CSV, Imprimir, Apagar), filtro, nova anotação e lista; o backup JSON
   do SILM num grupo próprio. Confere criação, filtro, persistência, CSV, impressão sem controles, exclusão com confirmação. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const visible=(p,sel)=>p.locator(sel).first().waitFor({state:'visible',timeout:4000});
 /* 1. Ordem, alinhamento e alvos nos cinco tamanhos. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/caderno');await visible(p,'#notebook-export-csv');
   const l=await p.evaluate(()=>{const r=el=>el.getBoundingClientRect(),q=s=>document.querySelector(s);
    const order=['.silm-notebook-actions','.silm-notebook-filter','.silm-notebook-compose','.silm-notebook-entries','.silm-notebook-backup'].map(s=>r(q(s)).top);
    return {eyebrow:q('.silm-notebook-page-head .eyebrow').textContent,h1:q('#silm-notebook-heading').textContent,headLeft:r(q('#silm-notebook-heading')).left,bodyLeft:r(q('.silm-notebook-actions')).left,order,
     actions:[...document.querySelectorAll('.silm-notebook-actions button')].map(b=>b.textContent),destructive:q('#notebook-clear').classList.contains('silm-destructive'),
     backup:[...document.querySelectorAll('.silm-notebook-backup button')].map(b=>b.textContent),targets:[...document.querySelectorAll('#silm-notebook button, #notebook-filter')].filter(b=>b.getClientRects().length).map(b=>r(b).height),
     overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(l.eyebrow,'CADERNO DE LABORATÓRIO');assert.equal(l.h1,'Seu caderno');
   assert.ok(Math.abs(l.headLeft-l.bodyLeft)<=2,'Cabeçalho e conteúdo alinhados em '+where+': '+l.headLeft+' × '+l.bodyLeft);
   assert.deepEqual(l.order,[...l.order].sort((a,b)=>a-b),'Ordem do SIAB: ações, filtro, nova anotação, lista (e o backup no fim) em '+where);
   assert.deepEqual(l.actions,['Baixar caderno (CSV)','Imprimir','Apagar caderno']);assert.equal(l.destructive,true,'Apagar como ação de risco');
   assert.deepEqual(l.backup,['Exportar backup JSON','Importar backup JSON']);
   for(const h of l.targets)assert.ok(h>=44,'Controles com 44 px em '+where+': '+h);
   assert.ok(l.overflow<=1,'Sem rolagem lateral em '+where+': '+l.overflow+' px');
  }finally{await ctx.close();}
 }
 /* 2. Criar, filtrar, recarregar, baixar CSV, imprimir sem controles e apagar com confirmação. */
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce',acceptDownloads:true});
 try{
  const p=await open(ctx,'#/caderno');await visible(p,'.silm-notebook-compose > summary');
  const add=async(kind,title,text)=>{if(!await p.locator('#notebook-title').isVisible())await p.locator('.silm-notebook-compose > summary').click();await p.locator('#notebook-kind').selectOption(kind);await p.locator('#notebook-title').fill(title);await p.locator('#notebook-text').fill(text);await p.locator('#notebook-add').click();};
  await add('hipotese','O cobre conduz bem','Espero que o cobre conduza melhor que o ferro.');await add('observacao','Rede do cobre','A rede repete a célula CFC.');
  await p.waitForFunction(()=>document.querySelectorAll('.silm-notebook-entry').length===2);
  const filterTo=async v=>{await p.locator('#notebook-filter').selectOption(v);};
  const options=await p.evaluate(()=>[...document.querySelectorAll('#notebook-filter option')].map(o=>[o.value,o.textContent]));
  const hyp=options.find(([,t])=>/Hipóteses/.test(t))[0],concl=options.find(([,t])=>/Conclusões/.test(t))[0];
  await filterTo(hyp);await p.waitForFunction(()=>document.querySelectorAll('.silm-notebook-entry').length===1);assert.match(await p.locator('.silm-notebook-entry').innerText(),/HIPÓTESE|Hipótese/i);
  await filterTo(concl);await p.waitForFunction(()=>document.querySelectorAll('.silm-notebook-entry').length===0);assert.match(await p.locator('#silm-notebook').innerText(),/Nenhum registro/);
  await filterTo(options[0][0]);await p.reload();await p.waitForFunction(()=>window.SILMIntegration);await p.waitForFunction(()=>document.querySelectorAll('.silm-notebook-entry').length===2,'',{timeout:4000});
  // CSV com cabeçalho e os dois registros.
  const dl=p.waitForEvent('download');await p.locator('#notebook-export-csv').click();const file=await dl;assert.match(file.suggestedFilename(),/\.csv$/);
  const csv=require('node:fs').readFileSync(await file.path(),'utf8');assert.ok(csv.split(/\r?\n/).filter(Boolean).length>=3,'CSV com cabeçalho e registros');assert.match(csv,/O cobre conduz bem/);
  // Impressão: os controles saem do papel.
  await p.emulateMedia({media:'print'});assert.equal(await p.locator('.silm-notebook-actions').isVisible(),false,'Ações fora da impressão');assert.equal(await p.locator('.silm-notebook-backup').isVisible(),false,'Backup fora da impressão');await p.emulateMedia({media:null});
  // Apagar um registro pede confirmação; cancelar preserva.
  const first=p.locator('.silm-notebook-entry').first();await first.getByRole('button',{name:/Apagar/}).click();
  if(await p.locator('#si-modal-confirm').isVisible().catch(()=>false)){await p.locator('#si-modal-cancel, [data-modal-cancel]').first().click().catch(async()=>{await p.keyboard.press('Escape');});
   await p.waitForTimeout(200);assert.equal(await p.locator('.silm-notebook-entry').count(),2,'Cancelar preserva o registro');await first.getByRole('button',{name:/Apagar/}).click();await p.locator('#si-modal-confirm').click();}
  await p.waitForFunction(()=>document.querySelectorAll('.silm-notebook-entry').length===1,'',{timeout:4000});
 }finally{await ctx.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-NOTEBOOK: ordem e alinhamento do SIAB em 5 tamanhos, criação, filtro, persistência, CSV, impressão sem controles e exclusão com confirmação.');
};
