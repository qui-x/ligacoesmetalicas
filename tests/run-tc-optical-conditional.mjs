// Ensaio E2E: o espectro Tc 500–600 nm convive com o Cu no painel Explorar.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','tc-optical-conditional',browserName);
mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina SILM não abriu');
   await page.waitForFunction(()=>Boolean(
    window.SILM?.materialProfiles?.get(43)?.optical &&
    window.SILM?.createPropertyControls
   ));
   const inspection=await page.evaluate(()=>{
    function mount(z,prefix){
     const host=document.createElement('section');
     host.id=prefix+'-optical-host';
     host.style.cssText='position:relative;z-index:3;width:94%;max-width:700px;max-height:82vh;overflow:auto;'+
      'padding:12px;background:var(--surface,#fff);color:var(--text-primary,#222);margin:8px auto';
     document.body.append(host);
     const metal=SILM.data.get(z);
     const state={metal,properties:{active:'luster',luster:{light:false}},
      electrons:{representation:{visible:false}}};
     const info=()=>({
      state,eligibility:SILM.properties.eligibility(metal),editable:true,reduced:true,
      availability:()=>({ok:true}),deformation:null,thermal:null,drive:{angle:0,finish:'polished'},joule:null
     });
     const noOp=()=>{};
     const actions={start:noOp,field:noOp,heat:noOp,advance:noOp,compress:noOp,
      stretch:noOp,light:noOp,restore:noOp,end:noOp};
     SILM.createPropertyControls(host,{scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix});
     const panel=host.querySelector('.silm-optical-sample');
     const rows=[...panel.querySelectorAll('.silm-optical-band')].map(row=>({
      label:row.querySelector('span')?.textContent||'',
      value:row.querySelector('output')?.textContent||'',
      meterHidden:row.querySelector('meter')?.hidden,
      meterValue:row.querySelector('meter')?.value
     }));
     const ref=SILM.materialEngine.opticalForReference(z,550,0);
     return {
      hidden:panel.hidden,
      evidence:panel.dataset.evidence,
      reference:panel.dataset.reference,
      note:panel.querySelector('.silm-optical-note').textContent,
      sourceText:panel.querySelector('.silm-optical-source').textContent,
      link:panel.querySelector('.silm-optical-source-link')?.href,
      rows,
      strictReason:ref.reasonCode,
      strictAvailable:ref.ok,
      sample:SILM.materialProfiles.get(z)?.optical?.sample
     };
    }
    return {tc:mount(43,'test-tc'),cu:mount(29,'test-cu')};
   });
   const tc=inspection.tc,cu=inspection.cu;
   assert.equal(tc.hidden,false);
   assert.equal(tc.evidence,'tabulated');
   assert.equal(tc.reference,'source-conditions-only');
   assert.equal(tc.strictAvailable,false);
   assert.equal(tc.strictReason,'CONDITIONS_UNVERIFIED');
   assert.match(tc.link,/jetp\.ras\.ru\/cgi-bin\/dn\/e_067_09_1842\.pdf/);
   assert.match(tc.sample,/Tc\(0001\)/);
   assert.match(tc.note,/sem extrapola/i);
   assert.match(tc.sourceText,/Temperatura|temperatura/);
   assert.equal(tc.rows.length,3);
   assert.match(tc.rows[0].value,/Sem medição/);
   assert.equal(tc.rows[0].meterHidden,true);
   assert.match(tc.rows[1].label,/550 nm/);
   assert.match(tc.rows[1].value,/63,4 %/);
   assert.equal(tc.rows[1].meterHidden,false);
   assert.match(tc.rows[2].value,/Sem medição/);
   assert.equal(tc.rows[2].meterHidden,true);
   assert.equal(cu.hidden,false);
   assert.equal(cu.reference,'source-conditions-only');
   assert.ok(cu.rows.every(row=>!row.meterHidden&&/%/.test(row.value)),
    'Cobre perdeu os três canais ópticos já validados como condicionais');
   assert.deepEqual(errors,[],screen+': erros JS');
   await page.locator('#test-tc-optical-host .silm-optical-sample').screenshot({
    path:join(dir,'tc-550nm-'+screen+'.jpg'),type:'jpeg',quality:83,animations:'disabled'
   });
  }finally{await context.close();}
 }
}finally{await browser.close();}
