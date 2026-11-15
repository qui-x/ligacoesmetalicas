// SILM Etapa 81 — auditoria visual e funcional da matriz 92 / 79 disponíveis.
// Confere o painel Dados REAL e o índice compartilhado, sem ligar motores.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','stage81',browserName);mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
const metalCases=[['Ga',31],['Pm',61],['In',49],['U',92],['Fr',87],
 ['Ra',88],['Np',93],['Ac',89],['Pa',91],['Po',84],['Rf',104],['Cm',96],['Co',27]];
try{
 for(const [view,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'SILM não carregou');
   await page.waitForFunction(()=>Boolean(SILM.stage81Reconciliation?.audit.length===92 &&
    SILM.scienceEvidenceIndex?.rows.length===338 && SILM.renderIntegrationMetalData),undefined,{timeout:25000});
   const results=await page.evaluate(cases=>{
    const idx=SILM.scienceEvidenceIndex,A=SILM.stage81Reconciliation;
    const records=[];
    for(const [symbol,z] of cases){
     const metal=SILM.data.get(z),host=document.createElement('section');
     if(!metal||metal.symbol!==symbol)throw Error('Elemento indisponível '+symbol);
     host.dataset.stage81Audit=symbol;
     host.style.cssText='position:relative;max-width:min(620px,95vw);padding:12px;margin:10px auto;background:var(--panel-bg,#fff);color:var(--text-primary,#222);';
     document.body.append(host);
     SILM.renderIntegrationMetalData(host,metal,{structure:{units:[]}});
     const entries=[...host.querySelectorAll('.silm-unified-evidence-record')];
     const newEntries=entries.filter(x=>x.dataset.source==='stage81-matrix92');
     const direct=[...host.querySelectorAll('.silm-metal-data-property')].map(x=>x.textContent);
     const sourceLinks=newEntries.flatMap(x=>[...x.querySelectorAll('a[href^="https://"]')]);
     records.push({symbol,z,stage81A:A.getAudit(z)?.stage81Status,entries:entries.length,
      sourceCount:sourceLinks.length,newCount:newEntries.length,
      newText:newEntries.map(x=>x.textContent),
      directText:direct.join(' / '),
      estimated:newEntries.filter(x=>x.textContent.includes('ESTIMATIVA HISTÓRICA')).length,
      noEngine:newEntries.every(x=>x.dataset.engineRelease==='false'),
      hasUnofficialLink:sourceLinks.some(x=>x.hostname!=='srd.nist.gov'&&!x.href.startsWith('https://'))});
     if(symbol!=='Ga'&&symbol!=='Pm')host.remove();
    }
    const audit=A.audit;
    const blocked=audit.filter(x=>x.stage81Status==='blocked-structural');
    const noBlockedRows=blocked.every(x=>{
     const e=SILM.data.search(x.symbol).find(y=>y.symbol===x.symbol);
     return e&&!idx.keys.some(p=>idx.getFor(e.atomicNumber,p).length);
    });
    return {records,total:idx.rows.length,elements:idx.elementCount,
     matrix:A.universe.length,blocked:blocked.length,noBlockedRows,
     modelPredicted:idx.rows.filter(x=>x.evidenceIsModelEstimate).length};
   },metalCases);
   assert.equal(results.total,338);assert.equal(results.elements,79);
   assert.equal(results.matrix,92);assert.equal(results.blocked,13);
   assert.equal(results.modelPredicted,15);assert.equal(results.noBlockedRows,true);
   const find=s=>results.records.find(x=>x.symbol===s);
   for(const x of results.records){
    assert.ok(x.entries>=1,x.symbol+' não tem ficha');
    if(x.symbol==='Co'){
     assert.equal(x.newCount,0,'Co deve usar Etapas 78–80 sem fichas novas da 81');
     assert.ok(x.entries>=1,'Co perdeu registros já integrados');
    }else{
     assert.ok(x.newCount>=1,x.symbol+' não recebeu Etapa81');
     assert.ok(x.sourceCount>=1,x.symbol+' não mostra fonte');
    }
    assert.equal(x.noEngine,true,x.symbol+' indevidamente calibrado');
    assert.equal(x.hasUnofficialLink,false);
   }
   assert.equal(find('Ga').newCount,2);
   assert.match(find('Ga').newText.join(' '),/41 W\/\(m·K\)/);
   assert.match(find('Ga').newText.join(' '),/eixo a/);
   assert.equal(find('Pm').newCount,2);
   assert.match(find('Pm').newText.join(' '),/18 W\/\(m·K\)/);
   assert.match(find('Pm').newText.join(' '),/ESTIMATIVA HISTÓRICA/);
   assert.equal(find('U').newCount,2);
   assert.match(find('U').newText.join(' '),/22,5 W\/\(m·K\)/);
   assert.match(find('Fr').newText.join(' '),/15 W\/\(m·K\)/);
   assert.match(find('Fr').directText,/ESTIMATIVA por analogia/);
   for(const symbol of ['Fr','Ra','Np','Ac','Pa','Po','Rf','Cm'])
    assert.equal(find(symbol).estimated,1,symbol+' não identificado como estimativa');
   assert.equal(find('Co').newCount,0,'Co deve conservar fichas da Etapa78, não duplicar Etapa81');
   const liveZ=view==='desktop'?31:61;
   await page.locator('#silm-metal').evaluate((sel,z)=>{
     sel.value=String(z);sel.dispatchEvent(new Event('change',{bubbles:true}));
   },liveZ);
   await page.locator('#silm-start').evaluate(el=>el.click());
   await page.waitForFunction(z=>{
    const box=document.querySelector('#silm-data');
    return box?.querySelector('.silm-unified-evidence-record[data-source="stage81-matrix92"]')&&
      SILM.stage81Reconciliation.getFor(z,'thermal').length>0;
   },liveZ,{timeout:20000});
   const panel=page.locator('#silm-data');
   const text=await panel.innerText();
   assert.ok(text.includes('Fontes e condições'));
   assert.ok(text.includes(liveZ===31?'41 W/(m·K)':'18 W/(m·K)'));
   await page.locator('[data-stage81-audit="Ga"]').screenshot({path:join(dir,'Ga-'+view+'.png'),animations:'disabled'});
   await page.locator('[data-stage81-audit="Pm"]').screenshot({path:join(dir,'Pm-'+view+'.png'),animations:'disabled'});
   assert.deepEqual(errors,[],browserName+' '+view+' erros JS '+errors.join(' | '));
  }finally{await ctx.close();}
 }
 console.log(browserName+': Etapa81 validada (92/79/13, 338 fichas, 15 previsões, Ga e Pm no painel real).');
}finally{await browser.close();}
