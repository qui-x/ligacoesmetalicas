// SILM Etapa80 — dados e controles Explorar compartilham catálogo 62 elementos.
// Testa estados nas mesmas páginas e nos mesmos componentes existentes.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url),playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8765';
const outDir=join('reports','stage80',browserName);mkdirSync(outDir,{recursive:true});
const browser=await playwright[browserName].launch({headless:true});
try{
 for(const [view,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const resp=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(resp?.ok());
   await page.waitForFunction(()=>Boolean(SILM.scienceEvidenceIndex?.rows?.length>=315&&SILM.createUnifiedElementEvidencePanel&&SILM.renderIntegrationMetalData),undefined,{timeout:20000});
   const data=await page.evaluate(()=>{
    const Z=[26,29,13,44,22,68,90,27,72,43],results=[];
    for(const z of Z){
     const metal=SILM.data.get(z),host=document.createElement('div');
     host.style.cssText='position:relative;margin:8px;padding:12px;max-width:min(560px,95vw);background:var(--surface,#fff);color:var(--text,#222);';
     host.dataset.stage80Audit=metal.symbol;document.body.append(host);
     SILM.renderIntegrationMetalData(host,metal,{structure:{units:[]}});
     const extra=host.querySelector('.silm-unified-evidence');
     const records=[...host.querySelectorAll('.silm-unified-evidence-record')];
     const old=[...host.querySelectorAll('.silm-metal-data-observation')];
     const props=[...host.querySelectorAll('.silm-metal-data-property')];
     results.push({z,symbol:metal.symbol,
      extraExists:!!extra,extraVisible:extra?.hidden===false,
      entries:records.length,
      originalSeven:old.length,
      sourceLinks:records.filter(e=>e.querySelector('a[href^="https://"]')).length,
      hasPending:records.some(e=>e.dataset.status==='pending'),
      engine:records.every(e=>e.dataset.engineRelease==='false'),
      properties:props.map(e=>e.dataset.property),
      hasScientificValue:host.textContent.includes('referência da amostra'),
      dataText:host.textContent.slice(0,1800),
      noUnexpectedPlaceholder:metal.symbol!=='Cu'?true:!!extra
     });
     if(metal.symbol!=='Fe'&&metal.symbol!=='Co')host.remove();
    }
    return results;
   });
   const lookup=z=>data.find(x=>x.z===z);
   for(const z of [26,29,13,44,22,68,90,27,72,43]){
    const row=lookup(z);
    assert.equal(row.extraExists,true,row.symbol+' sem índice em Dados');
    assert.equal(row.extraVisible,true,row.symbol+' sem estudos visíveis');
    assert.ok(row.entries>=1,row.symbol+' sem estudos na nova ficha');
    assert.ok(row.sourceLinks>=1,row.symbol+' fontes não clicáveis');
    assert.equal(row.engine,true,'motor liberado indevidamente');
   }
   assert.equal(lookup(26).hasPending,false,'Fe NIST não deve ser tratado como pendente');
   assert.ok(lookup(29).hasScientificValue,'Cu ainda mostra apenas lacuna');
   assert.equal(lookup(27).originalSeven,5,'Co deve preservar os cinco números do PR158');
   assert.equal(lookup(43).originalSeven,5,'Tc deve preservar os cinco números do PR158');
   const explore=await page.evaluate(()=>{
    const view=SILM.createUnifiedElementEvidencePanel({mode:'explore'});
    document.body.append(view.root);
    const result=[];
    for(const [z,active]of [[26,'ductility'],[29,'thermal'],[44,'electrical'],[13,'luster'],[90,'malleability']]){
     view.update({atomicNumber:z,active});
     result.push({z,active,visible:view.root.hidden===false,
      dataCount:view.root.querySelectorAll('.silm-unified-evidence-record').length,
      otherProps:[...view.root.querySelectorAll('.silm-unified-evidence-group')].some(x=>x.dataset.property!==active),
      summary:view.root.textContent.slice(0,250)});
    }
    return result;
   });
   assert.ok(explore.every(x=>x.visible&&x.dataCount>=1&&!x.otherProps));
   assert.deepEqual(errors,[],'Erros JS no '+browserName+' '+view+': '+errors.join(' / '));
   await page.locator('[data-stage80-audit="Fe"]').screenshot({path:join(outDir,'Fe-Dados-'+view+'.png'),animations:'disabled'});
   await page.locator('[data-stage80-audit="Co"]').screenshot({path:join(outDir,'Co-Dados-'+view+'.png'),animations:'disabled'});
  }finally{await context.close();}
 }
 console.log(browserName+': Etapa80 — 10 metais em Dados, 5 propriedades em Explorar, mobile/desktop.');
}finally{await browser.close();}
