// Teste funcional do painel existente Explorar > Ductilidade com dados NIST.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','fe-nist-evidence',browserName);
mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina nao carregou');
   await page.waitForFunction(()=>Boolean(window.SILM?.researchEvidence&&window.SILM?.createPropertyControls));
   const result=await page.evaluate(()=>{
    // Monta uma instancia real do controle existente, usando estado de Fe,
    // sem acrescentar rota, modal ou calcular resposta mecanica.
    const host=document.createElement('div');
    host.style.cssText='position:relative;z-index:1;max-width:680px;max-height:90vh;overflow:auto;'+
      'background:var(--surface,#fff);color:var(--text-primary,#222);padding:14px;margin:12px';
    host.id='test-fe-evidence-host';
    document.body.append(host);
    const metal=SILM.data.get(26);
    const state={metal,properties:{active:'ductility',ductility:{elongation:0}},
      electrons:{representation:{visible:false}}};
    const info=()=>({
      state,eligibility:SILM.properties.eligibility(metal),editable:true,reduced:true,
      availability:()=>({ok:true}),deformation:null,thermal:null,drive:null,joule:null
    });
    const scope={listen:(node,event,fn)=>node.addEventListener(event,fn)};
    const noOp=()=>{};
    const actions={start:noOp,field:noOp,heat:noOp,advance:noOp,compress:noOp,
      stretch:noOp,light:noOp,restore:noOp,end:noOp};
    const controls=SILM.createPropertyControls(host,{scope,info,actions,prefix:'test-fe'});
    const section=host.querySelector('.silm-research-reference');
    return {
      sectionPresent:!!section,
      hidden:section?.hidden,
      rows:section?.querySelectorAll('tbody tr').length,
      samples:host.querySelectorAll('#test-fe-research-sample option').length,
      sourcePresent:!!section?.querySelector('a[href*="NIST.TN.1879"]'),
      status:section?.querySelector('.silm-research-note')?.textContent,
      controlsPresent:!!controls
    };
   });
   assert.equal(result.controlsPresent,true);
   assert.equal(result.sectionPresent,true,'Referencia nao esta no painel existente');
   assert.equal(result.hidden,false);
   assert.equal(result.rows,3);
   assert.equal(result.samples,4);
   assert.equal(result.sourcePresent,true);
   assert.match(result.status,/NÃO homologados na CNTP/);
   const picker=page.locator('#test-fe-research-sample');
   await picker.selectOption('A11');
   assert.match(await page.locator('#test-fe-evidence-host .silm-research-purity').innerText(),/99,999988/);
   const rows=page.locator('#test-fe-evidence-host .silm-research-table tbody tr');
   assert.equal(await rows.count(),3);
   assert.equal((await rows.nth(0).locator('td').allTextContents()).join('|'),'10⁻³|68|201|71|95');
   assert.equal((await rows.nth(2).locator('td').allTextContents()).join('|'),'10⁻⁵|28|178|58|95');
   // Painel documental nao autoriza liberacao numerica em CNTP ou calibragem.
   const scientific=await page.evaluate(()=>({
     eligible:SILM.properties.eligibility(SILM.data.get(26)).ductility.status,
     sourceCNTP:SILM.researchEvidence.source.referenceCNTPVerified,
     engineReleases:SILM.researchEvidence.profiles.filter(x=>x.engineRelease).length
   }));
   assert.equal(scientific.sourceCNTP,false);
   assert.equal(scientific.engineReleases,0);
   assert.deepEqual(errors,[],screen+' teve erro de pagina');
   await page.locator('#test-fe-evidence-host').screenshot({
    path:join(dir,'ferro-dados-documentais-'+screen+'.jpg'),
    type:'jpeg',quality:80,animations:'disabled'
   });
  }finally{await context.close();}
 }
}finally{await browser.close();}
