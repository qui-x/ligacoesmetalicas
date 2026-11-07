// Regressão de responsividade da aplicação publicada do SILM.
// Usa o Playwright instalado pelo workflow da main, sem modificar o motor científico.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE);
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const matrix=[
 ['phone-320',320,568],['phone-360',360,640],
 ['phone-390',390,844],['phone-414',414,896],
 ['phone-landscape',844,390],['tablet-portrait',768,1024],
 ['tablet-landscape',1024,768],['notebook-short',1280,720],
 ['notebook',1366,768],['desktop',1440,900],
 ['full-hd',1920,1080],['qhd',2560,1440]
];
const browser=await playwright[browserName].launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const box=async locator=>locator.evaluate(node=>{
 const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};
});
async function checkSize(label,width,height){
 await page.setViewportSize({width,height});
 await page.waitForTimeout(100);
 const m=await page.evaluate(()=>{
  const visible=n=>n&&n.getClientRects().length>0&&getComputedStyle(n).visibility!=='hidden';
  const rect=n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
  const root=document.documentElement;
  const workspace=document.querySelector('#si-workspace');
  const scene=document.querySelector('#si-stage');
  const bar=document.querySelector('#silm-scene-actionbar');
  const toolbar=document.querySelector('.si-workspace-toolbar');
  const targets=[...document.querySelectorAll(
    '#silm-scene-actionbar .silm-quick-icon,'+
    '#silm-scene-actionbar .silm-camera-btn,'+
    '#silm-scene-actionbar #si-expand-structure,'+
    '#silm-scene-actionbar .silm-lattice-nav button'
  )].filter(n=>visible(n)).map(n=>({id:n.id||n.className,rect:rect(n)}));
  return {
   windowWidth:innerWidth,documentWidth:root.scrollWidth,
   workspace:visible(workspace)?rect(workspace):null,
   scene:visible(scene)?rect(scene):null,
   bar:visible(bar)?rect(bar):null,
   toolbar:visible(toolbar)?rect(toolbar):null,
   controls:targets
  };
 });
 assert.ok(m.workspace,label+': workspace indisponível');
 assert.ok(m.documentWidth<=m.windowWidth+4,label+': rolagem horizontal global ('+JSON.stringify(m)+')');
 assert.ok(m.workspace.width<=width+3,label+': workspace excedeu a janela');
 assert.ok(m.toolbar && m.toolbar.width<=width+3,label+': navegação excedeu a largura');
 if(m.scene)assert.ok(m.scene.width<=width+3,label+': palco excedeu a janela');
 if(m.bar){
  assert.ok(m.bar.height>=36,label+': faixa inferior colapsada');
  assert.ok(m.bar.width<=width+3,label+': barra inferior excedeu a janela');
 }
 if(width<=900&&m.controls.length){
  const narrow=m.controls.filter(c=>c.rect.width<40||c.rect.height<40);
  assert.equal(narrow.length,0,label+': alvo de toque menor que 40px: '+JSON.stringify(narrow));
 }
 console.log('VIEWPORT_OK',browserName,label,width+'x'+height,
  'root='+m.documentWidth,'controls='+m.controls.length,'scene='+Math.round(m.scene?.height||0));
}
async function checkPeriodic(label,width,height){
 await page.setViewportSize({width,height});
 await page.waitForTimeout(100);
 const table=page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'});
 await table.click();
 const dialog=page.locator('#silm-periodic-dialog');
 await dialog.waitFor({state:'visible'});
 const rect=await box(dialog);
 assert.ok(rect.x>=-3&&rect.right<=width+3,label+': tabela cortada horizontalmente '+JSON.stringify(rect));
 assert.ok(rect.height>100,label+': tabela sem área útil');
 await page.locator('#silm-close-periodic').click();
 console.log('DIALOG_OK',browserName,label,width+'x'+height);
}
try{
 const result=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(result?.ok(),'Página do SILM inacessível');
 await page.waitForFunction(()=>!!window.SILMIntegration&&
   !!window.SILM?.workshop?.valid()&&
   !document.querySelector('#silm-workshop-context')?.hidden,undefined,{timeout:45000});
 for(const [label,w,h] of matrix)await checkSize(label,w,h);
 for(const [label,w,h] of [
  ['periodic-phone',320,568],
  ['periodic-landscape',844,390],
  ['periodic-tablet',768,1024],
  ['periodic-desktop',1440,900]
 ])await checkPeriodic(label,w,h);
 // O crescimento do texto deve manter a tela dentro do viewport.
 await page.setViewportSize({width:390,height:844});
 const a11y=page.locator('#si-a11y-toggle');
 if(await a11y.isVisible()){
  await a11y.click();
  const plus=page.locator('#si-font-plus');
  if(await plus.isVisible()){
   await plus.click();await plus.click();
   await checkSize('phone-390-font-plus',390,844);
  }
 }
 assert.deepEqual(errors,[],'Exceções JavaScript durante a matriz: '+errors.join('; '));
}finally{
 await context.close();await browser.close();
}
