// E2E: referências R550 permanecem consulta documental no Brilho da Oficina.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','optical-candidates-stage65',browserName);mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const res=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(res?.ok(),'Oficina SILM não carregou');
   await page.waitForFunction(()=>Boolean(SILM.opticalResearchCandidates?.count&&SILM.createPropertyControls));
   const o=await page.evaluate(()=>{
    const mount=(z,active='luster')=>{
     const host=document.createElement('section');
     host.id='test-optical-'+z;
     host.style.cssText='max-width:700px;max-height:80vh;overflow:auto;padding:12px;margin:8px auto;'+
      'background:var(--surface,#fff);color:var(--text-primary,#222)';
     document.body.append(host);
     const state={metal:SILM.data.get(z),properties:{active,luster:{light:false},ductility:{elongation:0},malleability:{compression:0}},
      electrons:{representation:{visible:false}}};
     const info=()=>({state,eligibility:SILM.properties.eligibility(state.metal),
      editable:true,reduced:true,availability:()=>({ok:true}),deformation:null,
      thermal:null,drive:{angle:0,finish:'polished'},joule:null});
     const noop=()=>{};
     const actions={start:noop,field:noop,heat:noop,advance:noop,compress:noop,
      stretch:noop,light:noop,restore:noop,end:noop};
     SILM.createPropertyControls(host,{scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix:'optical-'+z});
     const panel=host.querySelector('.silm-optical-candidate');
     const baseline=host.querySelector('.silm-optical-sample');
     return {visible:!panel.hidden,category:panel.dataset.evidence,
      text:panel.textContent,source:panel.querySelector('a').href,
      title:panel.querySelector('.silm-optical-candidate-result').textContent,
      count:panel.querySelectorAll('select option').length,engine:baseline?.dataset.evidence};
    };
    return {li:mount(3),cu:mount(29),pr:mount(59),am:mount(95),
     hf:mount(72),sn:mount(50),tc:mount(43),pu:mount(94),ac:mount(89),
     ironDuctility:mount(26,'ductility')};
   });
   for(const key of ['li','cu','pr','am','hf','sn']){
    const r=o[key];
    assert.equal(r.visible,true,key);
    assert.equal(r.category,'research-candidate-not-engine');
    assert.match(r.text,/REFERÊNCIA CANDIDATA, NÃO HOMOLOGADA/);
    assert.match(r.text,/NÃO controlam a iluminação/);
    assert.ok(r.source.startsWith('https://'));
   }
   assert.match(o.li.title,/92,89 %/);
   assert.equal(o.li.engine,'qualitative','Li recebeu indevidamente perfil óptico do motor');
   assert.equal(o.cu.engine,'tabulated','motor óptico do cobre foi modificado');
   assert.equal(o.am.count,2);
   assert.match(o.pr.text,/Leitura APROXIMADA de gráfico/);
   assert.match(o.hf.text,/4,2 K/);
   assert.match(o.sn.text,/Compilação secundária de refletância/);
   assert.equal(o.tc.visible,false,'Tc já possui perfil primário, não duplicar');
   assert.equal(o.tc.engine,'tabulated');
   assert.equal(o.pu.visible,false,'Pu-Ga não é puro Pu');
   assert.equal(o.ac.visible,false,'Ac não possui R550 confirmado');
   assert.equal(o.ironDuctility.visible,false,'referência óptica não deve aparecer em Ductilidade');
   await page.locator('#optical-95-profile').selectOption('1');
   const am=await page.locator('#test-optical-95 .silm-optical-candidate').innerText();
   assert.match(am,/36 %/);
   assert.match(am,/SiO2/);
   const gate=await page.evaluate(()=>({
    metals:SILM.opticalResearchCandidates.metals,records:SILM.opticalResearchCandidates.count,
    approved:SILM.opticalResearchCandidates.fullCNTPApproved,
    engine:SILM.opticalResearchCandidates.engineRelease
   }));
   assert.deepEqual(gate,{metals:58,records:59,approved:0,engine:false});
   assert.deepEqual(errors,[],screen+': erros JS');
   await page.locator('#test-optical-95 .silm-optical-candidate').screenshot({
    path:join(dir,'americio-amostras-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'
   });
  }finally{await ctx.close();}
 }
}finally{await browser.close();}
