// Testa Etapa 73 no mesmo painel nativo Explorar -> Maleabilidade.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','compression-stage73',browserName);
mkdirSync(dir,{recursive:true});
const browser=await pw[browserName].launch({headless:true});
try{
 for(const [mode,width,height] of [['mobile',390,844],['desktop',1366,768]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
   assert.ok(response?.ok(),'Oficina SILM não carregou');
   await page.waitForFunction(()=>Boolean(SILM.compressionStage73?.count===8&&SILM.createPropertyControls));
   const r=await page.evaluate(()=>{
    function mount(z,active='malleability'){
     const host=document.createElement('section');host.id='test-compression-'+z+'-'+active;
     host.style.cssText='position:relative;max-width:740px;max-height:82vh;overflow:auto;'+
      'background:var(--surface,#fff);color:var(--text-primary,#222);padding:12px;margin:8px auto;';
     document.body.append(host);
     const metal=SILM.data.get(z);
     const state={metal,properties:{active,ductility:{elongation:0},malleability:{compression:0}},
      electrons:{representation:{visible:false}}};
     const info=()=>({state,eligibility:SILM.properties.eligibility(metal),editable:true,reduced:true,
      availability:()=>({ok:true}),deformation:null,thermal:null,drive:null,joule:null});
     const noop=()=>{},actions={start:noop,field:noop,heat:noop,advance:noop,
      compress:noop,stretch:noop,light:noop,restore:noop,end:noop};
     SILM.createPropertyControls(host,{scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix:'compression-'+z+'-'+active});
     const panel=host.querySelector('.silm-research-multistage');
     return {visible:panel?.hidden===false,options:[...(panel?.querySelectorAll('select option')||[])].map(o=>o.textContent),
      warning:panel?.querySelector('.silm-stage65-status')?.textContent,
      all:panel?.textContent,metrics:panel?.querySelector('.silm-research-metrics')?.textContent};
    }
    return {Ti:mount(22),Ni:mount(28),Cu:mount(29),Fe:mount(26),Hf:mount(72),
     Zr:mount(40),U:mount(92),Tl:mount(81),TiDuctility:mount(22,'ductility'),
     CuDuctility:mount(29,'ductility')};
   });
   for(const sym of ['Ti','Ni','Cu','Fe','Hf','Zr','U']){
    const p=r[sym];
    assert.equal(p.visible,true,sym+' não mostra experimento de compressão');
    assert.ok(p.options.some(x=>x.includes('etapa 73')),sym+' sem fonte nova');
    if(p.options.length===1)assert.match(p.warning,/Fonte primária/);
    assert.match(p.all,/Pressão de ensaio não homologada/);
   }
   assert.equal(r.Tl.visible,false,'não inventar compressão de Tl');
   assert.ok(!r.TiDuctility.options.some(x=>x.includes('etapa 73')),
     'compressão vazou para Ductilidade');
   assert.ok(!r.CuDuctility.options.some(x=>x.includes('etapa 73')));
   const selectStage73=async(z,idx=0)=>{
    const picker=page.locator('#compression-'+z+'-malleability-record');
    const opts=await picker.locator('option').allTextContents();
    const matches=opts.map((label,i)=>({label,i})).filter(x=>x.label.includes('etapa 73'));
    assert.ok(matches.length>idx,'Etapa 73 indisponível para Z='+z);
    await picker.selectOption(String(matches[idx].i));
   };
   for(const [z,val] of [[22,'0,4'],[28,'0,2'],[29,'0,1'],[26,'0,7']]){
    await selectStage73(z);
    const metric=await page.locator('#test-compression-'+z+'-malleability .silm-research-metrics').innerText();
    assert.match(metric,new RegExp(val.replace(',','[,]')));
    assert.match(metric,/não limite/);
   }
   await selectStage73(72,0);
   let metric=await page.locator('#test-compression-72-malleability .silm-research-metrics').innerText();
   assert.match(metric,/500 MPa/);
   assert.match(metric,/Escoamento em compressão/);
   await selectStage73(72,1);
   metric=await page.locator('#test-compression-72-malleability .silm-research-metrics').innerText();
   assert.match(metric,/0,25/);
   assert.match(metric,/encruamento/);
   await selectStage73(40);
   metric=await page.locator('#test-compression-40-malleability .silm-research-metrics').innerText();
   assert.match(metric,/10 %/);
   const zrDetails=await page.locator('#test-compression-40-malleability .silm-research-condition').innerText();
   assert.match(zrDetails,/Zr702/);
   await selectStage73(92);
   metric=await page.locator('#test-compression-92-malleability .silm-research-metrics').innerText();
   assert.match(metric,/2\.900 MPa|2.900 MPa|2900 MPa/);
   assert.match(metric,/ASSINTÓTICA|assintótica|assintótica AJUSTADA|Tensão assintótica AJUSTADA/i);
   const gate=await page.evaluate(()=>({count:SILM.compressionStage73.count,
    metals:SILM.compressionStage73.metals,approved:SILM.compressionStage73.exactCNTPApproved,
    engine:SILM.compressionStage73.engineEnabled,oldStage:SILM.stage65Evidence.stage}));
   assert.deepEqual(gate,{count:8,metals:7,approved:0,engine:false,oldStage:65});
   assert.deepEqual(errors,[],mode+': erro JS');
   await page.locator('#test-compression-22-malleability .silm-research-multistage').screenshot({
    path:join(dir,'ti-pure-296k-'+mode+'.jpg'),type:'jpeg',quality:80,animations:'disabled'
   });
  }finally{await ctx.close();}
 }
}finally{await browser.close();}
