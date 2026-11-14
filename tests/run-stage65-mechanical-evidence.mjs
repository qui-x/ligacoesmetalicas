// Contratos E2E: dados Etapa65 ficam no painel nativo de Explorar, sem motor novo.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','stage65-mechanics',browserName);mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   const resp=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(resp?.ok(),'Oficina SILM nao carregou');
   await page.waitForFunction(()=>Boolean(SILM.stage65Evidence&&SILM.createPropertyControls));
   const found=await page.evaluate(()=>{
    const mount=(z,active)=>{
     const host=document.createElement('section');host.id='test-stage65-'+z;
     host.style.cssText='position:relative;max-width:710px;max-height:85vh;overflow:auto;margin:8px auto;'+
      'background:var(--surface,#fff);color:var(--text-primary,#222);padding:12px;';
     document.body.append(host);
     const metal=SILM.data.get(z);
     const state={metal,properties:{active,ductility:{elongation:0},malleability:{compression:0}},
      electrons:{representation:{visible:false}}};
     const info=()=>({state,eligibility:SILM.properties.eligibility(metal),editable:true,
      reduced:true,availability:()=>({ok:true}),deformation:null,thermal:null,drive:null,joule:null});
     const noop=()=>{},actions={start:noop,field:noop,heat:noop,advance:noop,compress:noop,
      stretch:noop,light:noop,restore:noop,end:noop};
     SILM.createPropertyControls(host,{scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix:'stage65-'+z});
     const panel=host.querySelector('.silm-research-multistage');
     return {visible:panel?.hidden===false,selected:panel?.querySelector('select')?.value,
      optionLabels:[...(panel?.querySelectorAll('select option')||[])].map(x=>x.textContent),
      context:panel?.querySelector('.silm-stage65-context')?.hidden,
      contextText:panel?.querySelector('.silm-stage65-context')?.textContent,
      pending:panel?.querySelector('.silm-stage65-pending')?.hidden,
      pendingText:panel?.querySelector('.silm-stage65-pending')?.textContent,
      distinct:!!host.querySelector('.silm-electrical-evidence')};
    };
    return {bi:mount(83,'ductility'),th:mount(90,'ductility'),lu:mount(71,'malleability'),
     co:mount(27,'ductility'),pu:mount(94,'ductility'),fe:mount(26,'ductility')};
   });
   assert.equal(found.bi.visible,true,'Bi primário não apareceu no painel de ductilidade');
   assert.ok(found.bi.optionLabels.some(x=>x.includes('etapa 60')));
   assert.equal(found.bi.context,false);
   assert.match(found.bi.contextText,/298 K/);
   assert.match(found.bi.contextText,/423 K/);
   assert.equal(found.th.pending,false);
   assert.match(found.th.pendingText,/9 transcrições secundárias/);
   assert.doesNotMatch(found.th.optionLabels.join('|'),/etapa 58/,
    'Transcrições Th sem confronto original não devem aparecer na lista validada');
   assert.equal(found.lu.visible,true);
   assert.ok(found.lu.optionLabels.some(x=>x.includes('etapa 64')));
   assert.ok(found.co.optionLabels.filter(x=>x.includes('etapa 60')).length===2);
   assert.equal(found.pu.context,false);
   assert.match(found.pu.contextText,/Limite estrito: alongamento <0,1%/);
   assert.equal(found.fe.visible,false,'Painel NIST de Fe duplicado por Etapa 65');
   const selectByStage=async(z,stage)=>{
    const picker=page.locator('#stage65-'+z+'-record');
    const entries=await picker.locator('option').allTextContents();
    const ix=entries.findIndex(label=>label.includes('etapa '+stage));
    assert.ok(ix>=0,z+' etapa '+stage+' não está disponível');
    await picker.selectOption(String(ix));
   };
   await selectByStage(83,60);
   let metrics=await page.locator('#test-stage65-83 .silm-research-metrics').innerText();
   assert.match(metrics,/0,7 %|15,4 %/);
   const biStatus=await page.locator('#test-stage65-83 .silm-stage65-status').innerText();
   assert.match(biStatus,/Fonte primária conferida/);
   const biTemp=await page.locator('#test-stage65-83 .silm-research-note').allTextContents();
   assert.match(biTemp.join(' '),/293 K/);
   await selectByStage(71,64);
   metrics=await page.locator('#test-stage65-71 .silm-research-metrics').innerText();
   assert.match(metrics,/12 %/);
   assert.doesNotMatch(metrics,/Alongamento até fratura/);
   await selectByStage(94,61);
   metrics=await page.locator('#test-stage65-94 .silm-research-metrics').innerText();
   assert.match(metrics,/Máximo de alongamento relatado/);
   assert.match(metrics,/680 %/);
   assert.doesNotMatch(metrics,/Alongamento até fratura\s+680/);
   const puStatus=await page.locator('#test-stage65-94 .silm-stage65-status').innerText();
   assert.match(puStatus,/apenas um MÁXIMO relatado/);
   await selectByStage(27,60);
   const coStatus=await page.locator('#test-stage65-27 .silm-stage65-status').innerText();
   assert.match(coStatus,/NÃO atribuir à fase HC automaticamente/);
   const gate=await page.evaluate(()=>({
    stage:SILM.stage65Evidence.stage,profiles:SILM.stage65Evidence.count,
    primary:SILM.stage65Evidence.primaryConfirmed,pending:SILM.stage65Evidence.pendingOriginalVerification,
    approved:SILM.stage65Evidence.exactCNTPApprovals,
    engine:SILM.stage65Evidence.engineEnabled,
    unchangedFe:SILM.researchEvidence.profiles.length
   }));
   assert.deepEqual(gate,{stage:65,profiles:19,primary:2,pending:9,approved:0,engine:false,unchangedFe:12});
   assert.deepEqual(errors,[],screen+': erros JavaScript');
   await page.locator('#test-stage65-83 .silm-research-multistage').screenshot({
    path:join(dir,'bi-condicional-'+screen+'.jpg'),type:'jpeg',quality:80,animations:'disabled'
   });
  }finally{await ctx.close();}
 }
}finally{await browser.close();}
