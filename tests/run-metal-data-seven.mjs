// E2E do painel de dados REAL do SILM, diferente do painel Explorar.
// Inspeciona os sete metais em mobile/desktop e inicia uma investigação Co.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','metal-data-seven',browserName);mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
const metals=[['Co',27],['Er',68],['Hf',72],['Ta',73],['Tc',43],['Th',90],['Zr',40]];
try{
 for(const [view,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Aplicativo não carregou');
   await page.waitForFunction(()=>Boolean(SILM.renderIntegrationMetalData&&SILM.sevenConditionResearch?.records?.length===35&&SILM.data?.get));
   const details=await page.evaluate(metals=>{
    const out=[];
    for(const [symbol,z]of metals){
     const e=SILM.data.get(z);
     const host=document.createElement('section');
     host.id='audit-metal-data-'+symbol;
     host.style.cssText='position:relative;background:var(--panel-bg,#fff);color:var(--text-primary,#222);padding:12px;max-width:min(620px,95vw);margin:10px auto;';
     document.body.append(host);
     SILM.renderIntegrationMetalData(host,e,{structure:{units:[]}});
     const rows=[...host.querySelectorAll('.silm-metal-data-observation')];
     const links=[...host.querySelectorAll('.silm-metal-data-source a')];
     out.push({symbol,z,count:rows.length,links:links.length,
      properties:rows.map(r=>r.dataset.property),
      values:rows.map(r=>r.textContent),engine:rows.map(r=>r.dataset.engineRelease),
      hasLegacyMissing:host.textContent.includes('Sem valor numérico homologado'),
      matchesSource:links.every((a,i)=>a.href===SILM.sevenConditionResearch.get(z,rows[i].dataset.property).sourceURL)});
     if(symbol!=='Co'&&symbol!=='Er')host.remove();
    }
    return out;
   },metals);
   assert.equal(details.length,7);
   for(const d of details){
    assert.equal(d.count,5,d.symbol+' não tem todas as cinco fichas');
    assert.equal(d.links,5,d.symbol+' perdeu fontes originais');
    assert.deepEqual(d.properties,['electrical','thermal','malleability','ductility','luster']);
    assert.equal(d.hasLegacyMissing,false,d.symbol+' continua exibindo ausência apesar de haver referência');
    assert.ok(d.values.every(x=>x.includes('Condição:')&&x.includes('sem calibração')),d.symbol);
    assert.ok(d.engine.every(x=>x==='false'));
    assert.ok(d.matchesSource,d.symbol+' link incorreto');
   }
   assert.match(details.find(x=>x.symbol==='Co').values[0],/σ = 1\/ρ/);
   assert.match(details.find(x=>x.symbol==='Er').values[4],/4,2 K/);
   // O mesmo método é chamado pelo refresh real do Adaptador para #silm-data.
   await page.locator('#silm-metal').evaluate(sel=>{
    sel.value='27';sel.dispatchEvent(new Event('change',{bubbles:true}));
   });
   await page.locator('#silm-start').evaluate(button=>button.click());
   await page.waitForFunction(()=>document.querySelector('#silm-data')?.querySelectorAll('.silm-metal-data-observation').length===5,undefined,{timeout:20000});
   const live=await page.locator('#silm-data .silm-metal-data-observation').allTextContents();
   assert.equal(live.length,5,'Investigação real de Co não exibe fichas em Dados');
   assert.match(live[0],/Condutividade derivada:/);
   assert.match(live[1],/100 W\/\(m·K\)/);
   assert.deepEqual(errors,[],'Falhas JavaScript em '+browserName+' '+view);
   await page.locator('#audit-metal-data-Co').screenshot({
    path:join(dir,'dados-metal-Co-'+view+'.png'),animations:'disabled'
   });
  }finally{await context.close();}
 }
 console.log(browserName+': 35 dados + investigação real de Co validados em mobile e desktop.');
}finally{await browser.close();}
