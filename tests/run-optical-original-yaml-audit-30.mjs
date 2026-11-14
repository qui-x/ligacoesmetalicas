// E2E: dados científicos YAML conferidos aparecem dentro de Explorar -> Brilho,
// sem alteração de aparência, elegibilidade nem efeito em outras propriedades.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','optical-yaml-audit-30',browserName);mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina SILM não carregou');
   await page.waitForFunction(()=>Boolean(SILM.opticalSourceYAMLAudit?.count===30&&SILM.createPropertyControls));
   const rows=await page.evaluate(()=>{
    const mount=(z,active='luster')=>{
     const host=document.createElement('section');host.id='test-yaml-'+z;
     host.style.cssText='position:relative;max-width:730px;max-height:85vh;overflow:auto;margin:8px auto;'+
      'background:var(--surface,#fff);color:var(--text-primary,#222);padding:12px';
     document.body.append(host);
     const state={metal:SILM.data.get(z),properties:{
      active,luster:{light:false},ductility:{elongation:0},malleability:{compression:0}
     },electrons:{representation:{visible:false}}};
     const info=()=>({state,eligibility:SILM.properties.eligibility(state.metal),
      editable:true,reduced:true,availability:()=>({ok:true}),deformation:null,
      thermal:null,drive:{angle:0,finish:'polished'},joule:null});
     const noop=()=>{},actions={start:noop,field:noop,heat:noop,advance:noop,
      compress:noop,stretch:noop,light:noop,restore:noop,end:noop};
     SILM.createPropertyControls(host,{scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix:'yaml-'+z});
     const panel=host.querySelector('.silm-optical-candidate'),old=host.querySelector('.silm-optical-sample');
     return {visible:panel?.hidden===false,status:panel?.dataset.sourceAudit,
      evidence:panel?.dataset.evidence,text:panel?.textContent||'',
      doi:panel?.querySelector('a.silm-optical-yaml-doi')?.href,
      doiHidden:panel?.querySelector('a.silm-optical-yaml-doi')?.hidden,
      oldEvidence:old?.dataset.evidence,oldHidden:old?.hidden,
      r550:panel?.querySelector('.silm-optical-candidate-result')?.textContent
     };
    };
    return {Cu:mount(29),Li:mount(3),Mg:mount(12),Zr:mount(40),
     Be:mount(4),W:mount(74),Ta:mount(73),Ag:mount(47),
     Ca:mount(20),Pb:mount(82),Sc:mount(21),Hf:mount(72),Am:mount(95),
     Tc:mount(43),Pu:mount(94),FeDuctility:mount(26,'ductility')};
   });
   for(const s of ['Cu','Li','Mg','Zr','Be','W','Ta','Ag','Ca','Pb']){
    const row=rows[s];
    assert.equal(row.visible,true,s);
    assert.equal(row.status,'yaml-550nm-verified-paper-pending',s);
    assert.equal(row.evidence,'research-candidate-not-engine',s);
    assert.match(row.text,/ARQUIVO YAML CONFERIDO/);
    assert.match(row.text,/NÃO homologado na CNTP/);
    assert.match(row.text,/Artigo científico completo ainda NÃO auditado/);
    assert.match(row.doi,/doi\.org\/10\./);
    assert.equal(row.doiHidden,false);
   }
   for(const s of ['Sc','Hf','Am']){
    assert.equal(rows[s].visible,true);
    assert.equal(rows[s].status,'source-unreviewed',s);
    assert.match(rows[s].text,/Arquivo de dados original ainda NÃO confrontado/);
    assert.equal(rows[s].doiHidden,true);
   }
   assert.match(rows.Li.text,/298 K/);
   assert.match(rows.Mg.text,/25 nm thin film/);
   assert.match(rows.Zr.text,/200 nm thin film/);
   assert.match(rows.Be.text,/Lorentz–Drude/);
   assert.match(rows.W.text,/Lorentz–Drude/);
   assert.match(rows.Ta.text,/REELS/);
   assert.equal(rows.Cu.oldEvidence,'tabulated','motor físico do cobre não deve sofrer alteração');
   assert.equal(rows.Li.oldEvidence,'qualitative','Li não ganha motor óptico só porque YAML foi conferido');
   assert.equal(rows.Tc.visible,false,'Tc permanece em perfil primário separado');
   assert.equal(rows.Tc.oldEvidence,'tabulated');
   assert.equal(rows.Pu.visible,false,'Pu-Ga não pode ser tratado como Pu puro');
   assert.equal(rows.FeDuctility.visible,false);
   const audit=await page.evaluate(()=>({
    count:SILM.opticalSourceYAMLAudit.count,doi:SILM.opticalSourceYAMLAudit.sourceDOIs,
    unreviewed:SILM.opticalSourceYAMLAudit.notAuditedCandidateProfiles,
    fullPapers:SILM.opticalSourceYAMLAudit.literatureStudiesFullyChecked,
    approved:SILM.opticalSourceYAMLAudit.sourceCNTPCertifications,
    engine:SILM.opticalSourceYAMLAudit.engineEnabled
   }));
   assert.deepEqual(audit,{count:30,doi:26,unreviewed:29,fullPapers:0,approved:0,engine:false});
   assert.deepEqual(errors,[],screen+': erros JS');
   await page.locator('#test-yaml-12 .silm-optical-candidate').screenshot({
    path:join(dir,'mg-25nm-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'
   });
  }finally{await ctx.close();}
 }
}finally{await browser.close();}
