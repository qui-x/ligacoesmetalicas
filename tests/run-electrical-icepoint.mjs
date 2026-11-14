// Integração da resistividade avaliada ao controle existente Elétrica (não ao Joule).
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','electrical-icepoint',browserName);
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
   await page.waitForFunction(()=>Boolean(SILM.researchElectricalIcepoint&&SILM.createElectricalEvidencePanel&&SILM.createPropertyControls));
   const found=await page.evaluate(()=>{
    function mount(z){
     const host=document.createElement('section');
     host.id='test-electrical-'+z;
     host.style.cssText='max-width:680px;max-height:80vh;overflow:auto;margin:8px auto;'+
      'background:var(--surface,#fff);color:var(--text-primary,#222);padding:12px;';
     document.body.append(host);
     const metal=SILM.data.get(z);
     const state={metal,properties:{active:'electrical',electrical:{field:false}},
      electrons:{representation:{visible:false}}};
     const info=()=>({state,eligibility:SILM.properties.eligibility(metal),
      editable:true,reduced:true,availability:()=>({ok:true}),deformation:null,
      thermal:null,drive:null,joule:null});
     const noop=()=>{};
     const actions={start:noop,field:noop,heat:noop,advance:noop,compress:noop,
      stretch:noop,light:noop,restore:noop,end:noop};
     SILM.createPropertyControls(host,{scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix:'test-electrical-'+z});
     const panel=host.querySelector('.silm-electrical-evidence');
     return {hidden:panel?.hidden,plain:panel?.textContent||'',
      count:panel?.querySelectorAll('select option').length||0,
      evidence:panel?.dataset.scientificStatus,
      link:panel?.querySelector('a')?.href,
      contents:panel?.querySelector('.silm-research-metrics')?.textContent||''};
    }
    return {cu:mount(29),be:mount(4),ca:mount(20),pd:mount(46),
     fe:mount(26),sn:mount(50),ra:mount(88),mn:mount(25)};
   });
   for(const symbol of ['cu','be','ca','pd','fe','mn']){
    assert.equal(found[symbol].hidden,false,symbol);
    assert.match(found[symbol].plain,/273,15 K/);
    assert.match(found[symbol].plain,/NÃO homologados na CNTP/);
    assert.match(found[symbol].plain,/NÃO calibram a corrente nem o efeito Joule/);
    assert.match(found[symbol].contents,/σ = 1\/ρ/);
    assert.equal(found[symbol].evidence,'source-temperature-only');
   }
   assert.equal(found.cu.count,2);
   assert.equal(found.be.count,2);
   assert.equal(found.ca.count,1);
   assert.equal(found.pd.count,1);
   assert.equal(found.fe.count,1);
   assert.equal(found.sn.hidden,true,'estanho beta nao foi qualificado para fase de 0C');
   assert.equal(found.ra.hidden,true,'Ra intrinsic provisoria nao e rho total');
   assert.match(found.cu.contents,/1,543 µΩ·cm/);
   assert.match(found.cu.contents,/64,809 MS\/m/);
   assert.match(found.cu.link,/jpcrd155\.pdf/);
   assert.match(found.ca.contents,/3,11 µΩ·cm/);
   assert.match(found.mn.plain,/APENAS fase alfa/);
   // Alternar a fonte do Cu nao altera o motor nem faz media.
   await page.locator('#test-electrical-29-source').selectOption('1');
   const other=await page.locator('#test-electrical-29 .silm-research-metrics').innerText();
   assert.match(other,/1,553 µΩ·cm/);
   assert.match(await page.locator('#test-electrical-29 .silm-electrical-evidence a').getAttribute('href'),/nbstechnicalnote1053\.pdf/);
   const audit=await page.evaluate(()=>({
    count:SILM.researchElectricalIcepoint.count,
    metals:SILM.researchElectricalIcepoint.metalCount,
    approved:SILM.researchElectricalIcepoint.completeCNTPApproved,
    engine:SILM.researchElectricalIcepoint.engineEnabled,
    sourceTemperature:SILM.researchElectricalIcepoint.referenceTemperatureK
   }));
   assert.deepEqual(audit,{count:29,metals:24,approved:0,engine:false,sourceTemperature:273.15});
   assert.deepEqual(errors,[],screen+': erros JavaScript');
   await page.locator('#test-electrical-29 .silm-electrical-evidence').screenshot({
    path:join(dir,'cu-duas-fontes-'+screen+'.jpg'),type:'jpeg',quality:82,animations:'disabled'
   });
  }finally{await context.close();}
 }
}finally{await browser.close();}
