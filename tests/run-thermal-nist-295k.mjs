// E2E da tabela NIST a 295 K no controle nativo de Condutividade Termica.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','thermal-nist-295k',browserName);
mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina SILM nao abriu');
   await page.waitForFunction(()=>Boolean(SILM.researchThermalNIST&&SILM.createPropertyControls));
   const found=await page.evaluate(()=>{
    function mount(z){
     const host=document.createElement('div');host.id='test-thermal-'+z;
     host.style.cssText='max-width:680px;max-height:80vh;overflow:auto;margin:8px auto;'+
      'background:var(--surface,#fff);color:var(--text-primary,#222);padding:12px;';
     document.body.append(host);
     const metal=SILM.data.get(z);
     const state={metal,properties:{active:'thermal',thermal:{heating:false,stage:0}},
      electrons:{representation:{visible:false}}};
     const info=()=>({state,eligibility:SILM.properties.eligibility(metal),
      editable:true,reduced:true,availability:()=>({ok:true}),deformation:null,
      thermal:null,drive:null,joule:null});
     const noop=()=>{};
     const actions={start:noop,field:noop,heat:noop,advance:noop,compress:noop,
      stretch:noop,light:noop,restore:noop,end:noop};
     SILM.createPropertyControls(host,{scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix:'test-thermal-'+z});
     const section=host.querySelector('.silm-thermal-nist-reference');
     return {hidden:section?.hidden,plain:section?.textContent||'',
      value:section?.querySelector('.silm-thermal-nist-value')?.textContent,
      evidence:section?.dataset.evidence,
      source:section?.querySelector('a')?.href};
    }
    return [mount(13),mount(29),mount(82),mount(26)];
   });
   for(let i=0;i<3;i++){
    assert.equal(found[i].hidden,false);
    assert.match(found[i].plain,/295 K/);
    assert.match(found[i].plain,/NÃO é condutividade homologada na CNTP/);
    assert.match(found[i].plain,/NÃO calibra a animação de calor/);
    assert.equal(found[i].evidence,'compiled-source-conditions-only');
    assert.match(found[i].source,/nist\.gov\/ncnr/);
   }
   assert.match(found[0].value,/235 W\/\(m·K\)/);
   assert.match(found[1].value,/400 W\/\(m·K\)/);
   assert.match(found[2].value,/35 W\/\(m·K\)/);
   assert.equal(found[3].hidden,true,'Fe não está na tabela NIST desta pesquisa');
   const gate=await page.evaluate(()=>({
    approved:SILM.researchThermalNIST.approvedCNTPCases,
    engineChanged:SILM.researchThermalNIST.simulationEngineChanged,
    sourceTemperature:SILM.researchThermalNIST.source.temperatureK
   }));
   assert.deepEqual(gate,{approved:0,engineChanged:false,sourceTemperature:295});
   assert.deepEqual(errors,[],screen+': erro JS');
   await page.locator('#test-thermal-13 .silm-thermal-nist-reference').screenshot({
    path:join(dir,'al-295k-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'
   });
  }finally{await context.close();}
 }
}finally{await browser.close();}
