// SILM etapa 78: painel no mesmo controlador Explorar, 7 metais × 5 propriedades.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const require=createRequire(import.meta.url),PW=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const name=process.env.BROWSER_NAME||'chromium',url=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','seven-conditions',name);mkdirSync(dir,{recursive:true});
const browser=await PW[name].launch({headless:true});
const symbols=[['Co',27],['Er',68],['Hf',72],['Ta',73],['Tc',43],['Th',90],['Zr',40]];
const props=['electrical','thermal','malleability','ductility','luster'];
try{
 for(const [width,height,label] of [[390,844,'mobile'],[1366,768,'desktop']]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(url+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
  assert.ok(response?.ok(),'Página SILM não carregou');
  await page.waitForFunction(()=>Boolean(SILM.sevenConditionResearch?.records?.length===35&&SILM.createSevenConditionPanel&&SILM.createPropertyControls),undefined,{timeout:15000});
  const found=await page.evaluate(({symbols,props})=>{
   const rows=[];
   for(const [symbol,z] of symbols){
    for(const property of props){
     const metal=SILM.data.get(z),host=document.createElement('section');
     host.id='stage78-'+z+'-'+property;
     host.style.cssText='max-width:800px;min-width:0;overflow:auto;padding:12px;';
     document.body.append(host);
     const state={metal,properties:{active:property,electrical:{field:false},thermal:{heating:false,stage:0},
      malleability:{compression:0},ductility:{elongation:0},luster:{light:false}},
      electrons:{representation:{visible:true,motion:true}}};
     const info=()=>({state,eligibility:SILM.properties.eligibility(metal),editable:true,reduced:true,
      availability:()=>({ok:true}),deformation:null,thermal:null,drive:null,joule:null});
     const noop=()=>{},actions={start:noop,field:noop,heat:noop,advance:noop,
      compress:noop,stretch:noop,light:noop,restore:noop,end:noop};
     const panel=SILM.createPropertyControls(host,{scope:{listen:(el,event,fn)=>el.addEventListener(event,fn)},
      info,actions,prefix:'seven-'+z+'-'+property});
     const card=panel.root.querySelector('.silm-seven-condition-reference'),lookup=SILM.sevenConditionResearch.get(z,property);
     rows.push({symbol,property,found:!!card,visible:card?.hidden===false,
      text:card?.textContent||'',grade:card?.dataset.evidence,
      source:card?.querySelector('a')?.getAttribute('href')||null,
      expectedSource:lookup.sourceURL,expectedValue:lookup.value,quantity:lookup.quantity,
      badge:card?.dataset.engineRelease});
     if(symbol==='Tc'&&property==='ductility'||symbol==='Er'&&property==='luster'){
      card.style.width='min(95vw,620px)';
      card.scrollIntoView({block:'center'});
     }else host.remove();
    }
   }
   return rows;
  },{symbols,props});
  assert.equal(found.length,35);
  for(const row of found){
   assert.equal(row.found,true,row.symbol+' '+row.property+' painel ausente');
   assert.equal(row.visible,true,row.symbol+' '+row.property+' painel oculto');
   assert.equal(row.badge,'false','motor liberado incorretamente');
   assert.ok(row.text.includes(row.quantity),row.symbol+' '+row.property+' rótulo faltante');
   assert.match(row.text,/Temperatura:/);
   assert.match(row.text,/Pressão: não informada/);
   assert.ok(row.text.includes('Não')||row.text.includes('não')||row.text.includes('NÃO'));
   assert.equal(row.source,row.expectedSource||null);
  }
  const co=found.find(r=>r.symbol==='Co'&&r.property==='electrical');
  assert.match(co.text,/273,15 K/);
  const er=found.find(r=>r.symbol==='Er'&&r.property==='luster');
  assert.match(er.text,/4,2 K/);
  const tc=found.find(r=>r.symbol==='Tc'&&r.property==='ductility');
  assert.match(tc.text,/30 %/);
  const th=found.find(r=>r.symbol==='Th'&&r.property==='ductility');
  assert.match(th.text,/SECUNDÁRIA/);
  await page.screenshot({path:join(dir,label+'.png'),fullPage:false});
  assert.deepEqual(errors,[],name+' '+label+' erros JS: '+errors.join(' | '));
  await context.close();
 }
 console.log(name+': 70 estados de UI conferidos (35 x 2 viewports).');
}finally{await browser.close();}
