// Verifica os 36 pontos científicos no painel já existente Explorar > Elétrica.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','pgm-intrinsic',browserName);
mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [screen,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await context.newPage(),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina SILM não carregou');
   await page.waitForFunction(()=>Boolean(SILM.researchIntrinsicPGM?.get(44)&&SILM.createPropertyControls));
   const audit=await page.evaluate(()=>{
    function mount(z){
     const host=document.createElement('section');
     host.id='test-intrinsic-'+z;
     host.style.cssText='position:relative;max-width:680px;max-height:80vh;overflow:auto;margin:8px auto;'+
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
     SILM.createPropertyControls(host,{
      scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix:'intrinsic-'+z
     });
     const curve=host.querySelector('.silm-pgm-intrinsic');
     return {
      visible:curve?.hidden===false,reference:curve?.dataset.referenceStatus,
      kind:curve?.dataset.resistivityKind,
      temperatureCount:curve?.querySelectorAll('select option').length,
      line:curve?.querySelectorAll('svg polyline').length,
      points:curve?.querySelectorAll('svg circle').length,
      rows:curve?.querySelectorAll('tbody tr').length,
      selected:curve?.querySelector('.silm-pgm-intrinsic-result')?.textContent,
      direction:curve?.querySelectorAll('.silm-research-note')[1]?.textContent,
      link:curve?.querySelector('a')?.href,
      excludedOldTotal:host.querySelector('.silm-electrical-evidence')?.hidden,
      hasConductivity:curve?.textContent?.includes('MS/m')
     };
    }
    return {ru:mount(44),rh:mount(45),os:mount(76),ir:mount(77),cu:mount(29)};
   });
   for(const sym of ['ru','rh','os','ir']){
    const v=audit[sym];
    assert.equal(v.visible,true,sym+' não mostra curva');
    assert.equal(v.reference,'not-cntp-homologated');
    assert.equal(v.kind,'intrinsic-evaluated-not-total');
    assert.equal(v.temperatureCount,9);
    assert.equal(v.rows,9);
    assert.equal(v.line,1);
    assert.equal(v.points,9);
    assert.equal(v.excludedOldTotal,true,'Curva intrínseca misturada com tabela de ρtotal');
    assert.equal(v.hasConductivity,false,'Cálculo de σ universal seria incorreto');
    assert.match(v.link,/doi\.org\/10\.1595\/2056513/);
   }
   assert.match(audit.ru.selected,/6,16 µΩ·cm/);
   assert.match(audit.rh.selected,/4,35 µΩ·cm/);
   assert.match(audit.os.selected,/8,07 µΩ·cm/);
   assert.match(audit.ir.selected,/4,67 µΩ·cm/);
   assert.equal(audit.cu.visible,false,'Cobre não deve herdar curva Ru/Rh/Os/Ir');
   assert.equal(audit.cu.excludedOldTotal,false,'O painel antigo de Cu desapareceu');
   await page.locator('#intrinsic-76-intrinsic-temperature').selectOption('0');
   const osDir=await page.locator('#test-intrinsic-76 .silm-pgm-intrinsic .silm-research-note').allTextContents();
   assert.match(osDir.join(' '),/não publica separadamente as duas orientações/);
   assert.match(await page.locator('#test-intrinsic-76 .silm-pgm-intrinsic-result').innerText(),/6,57 µΩ·cm/);
   await page.locator('#intrinsic-44-intrinsic-temperature').selectOption('2');
   assert.match(await page.locator('#test-intrinsic-44 .silm-pgm-intrinsic-result').innerText(),/5,49 µΩ·cm/);
   const selectedRow=await page.locator('#test-intrinsic-44 .silm-pgm-active-row').innerText();
   assert.match(selectedRow,/250/);
   assert.match(selectedRow,/5,49/);
   assert.deepEqual(errors,[],screen+': erros JS');
   await page.locator('#test-intrinsic-44 .silm-pgm-intrinsic').screenshot({
    path:join(dir,'ru-curva-'+screen+'.jpg'),type:'jpeg',quality:80,animations:'disabled'
   });
  }finally{await context.close();}
 }
}finally{await browser.close();}
