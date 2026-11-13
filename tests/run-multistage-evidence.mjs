// E2E da interface original de propriedades; a biblioteca e somente consulta.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','multistage-evidence',browserName);
mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina SILM indisponivel');
   await page.waitForFunction(()=>Boolean(SILM.multistageResearch&&SILM.createMultistageResearchPanel));
   const inspect=await page.evaluate(()=>{
    const mount=(z,active,prefix)=>{
      const host=document.createElement('section');
      host.id='test-multi-'+prefix;
      host.style.cssText='position:relative;margin:10px;max-width:700px;max-height:75vh;overflow:auto;padding:10px;'+
        'background:var(--surface,#fff);color:var(--text-primary,#222)';
      document.body.append(host);
      const metal=SILM.data.get(z);
      const state={metal,properties:{active,ductility:{elongation:0},malleability:{compression:0}},
       electrons:{representation:{visible:false}}};
      const info=()=>({state,eligibility:SILM.properties.eligibility(metal),editable:true,
       availability:()=>({ok:true}),reduced:true,deformation:null,thermal:null,drive:null,joule:null});
      const noOp=()=>{};
      const actions={start:noOp,field:noOp,heat:noOp,advance:noOp,compress:noOp,
       stretch:noOp,light:noOp,restore:noOp,end:noOp};
      SILM.createPropertyControls(host,{scope:{listen:(node,event,fn)=>node.addEventListener(event,fn)},info,actions,prefix});
      const panel=host.querySelector('.silm-research-multistage');
      return {hidden:panel?.hidden,options:panel?.querySelectorAll('select option').length||0,
        text:panel?.textContent||'',fePanelHidden:host.querySelector('.silm-research-reference:not(.silm-research-multistage)')?.hidden};
    };
    return {
      ti:mount(22,'ductility','ti'),zr:mount(40,'ductility','zr'),
      co:mount(27,'malleability','co'),fe:mount(26,'ductility','fe')
    };
   });
   assert.equal(inspect.ti.hidden,false);
   assert.equal(inspect.ti.options,4);
   assert.match(inspect.ti.text,/318 MPa|318/);
   assert.ok(inspect.zr.options>=5,'Nao exibiu cinco Zr702 da etapa 57');
   assert.equal(inspect.co.options,19);
   assert.match(inspect.co.text,/compressão/i);
   assert.equal(inspect.fe.hidden,true,'Fe duplicado no catalogo multi-etapa');
   assert.equal(inspect.fe.fePanelHidden,false,'painel Fe NIST original sumiu');
   const tiSelect=page.locator('#ti-record');
   await tiSelect.selectOption('1');
   const tiMetrics=await page.locator('#test-multi-ti .silm-research-metrics').innerText();
   assert.match(tiMetrics,/998/);
   assert.match(tiMetrics,/1040/);
   assert.match(tiMetrics,/6 %/);
   const coText=await page.locator('#test-multi-co .silm-research-note').allTextContents();
   assert.match(coText.join(' '),/NÃO medem, por si só, a maleabilidade/);
   const gate=await page.evaluate(()=>({
    canSimulate:SILM.multistageResearch.engineEnabled,
    referenceValidated:SILM.multistageResearch.validatedAtReferenceCount,
    conditions:SILM.multistageResearch.records.every(x=>!x.CNTPhomologated&&!x.engineRelease),
    originalFe:SILM.researchEvidence.profiles.length
   }));
   assert.deepEqual(gate,{canSimulate:false,referenceValidated:0,conditions:true,originalFe:12});
   assert.deepEqual(errors,[],screen+' apresentou erros JS');
   await page.locator('#test-multi-ti').screenshot({
    path:join(dir,'ti-referencias-'+screen+'.jpg'),type:'jpeg',quality:80,animations:'disabled'
   });
  }finally{await context.close();}
 }
}finally{await browser.close();}
