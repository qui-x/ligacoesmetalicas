// Regressão da Tabela Periódica em viewport real (Chromium/Firefox/WebKit).
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const browser=await pw[browserName].launch({headless:true});
const sizes=[
 ['celular-estreito',320,568],['celular-360',360,740],['celular-390',390,844],
 ['celular-414',414,896],['celular-horizontal',844,390],
 ['tablet',768,1024],['desktop',1440,900]
];
async function measure(page){
 return page.evaluate(()=>{
  const d=document.querySelector('#silm-periodic-dialog');
  const root=d.querySelector('.silm-periodic'),scroll=d.querySelector('.periodic-scroll');
  const cell=d.querySelector('.periodic-element');
  const rect=n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  const hint=d.querySelector('.periodic-scroll-hint');
  return {
   viewport:[innerWidth,innerHeight],dialog:rect(d),root:rect(root),scroller:rect(scroll),
   item:rect(cell),cellSize:parseFloat(root.style.getPropertyValue('--periodic-cell')),
   dialogScrollHeight:d.scrollHeight,dialogClientHeight:d.clientHeight,
   scrollWidth:scroll.scrollWidth,clientWidth:scroll.clientWidth,
   scrollHeight:scroll.scrollHeight,clientHeight:scroll.clientHeight,
   documentWidth:document.documentElement.scrollWidth,
   hintVisible:!hint.hidden,bodyScrollTop:document.scrollingElement.scrollTop
  };
 });
}
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await ctx.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'SILM não carregou');
 const open=page.locator('#silm-workshop-context').getByRole('button',{name:'Tabela Periódica'});
 await open.waitFor({state:'visible'});
 for(const [name,width,height] of sizes){
  await page.setViewportSize({width,height});
  await open.click();
  const dialog=page.locator('#silm-periodic-dialog');
  await dialog.waitFor({state:'visible'});
  await page.waitForFunction(()=>Number.isFinite(parseFloat(document.querySelector('#silm-periodic-dialog .silm-periodic')?.style.getPropertyValue('--periodic-cell'))));
  await page.waitForTimeout(90);
  let m=await measure(page);
  assert.ok(m.dialog.left>=-2&&m.dialog.right<=width+2,
   name+': diálogo ultrapassa horizontalmente a tela: '+JSON.stringify(m.dialog));
  assert.ok(m.dialog.top>=-2&&m.dialog.bottom<=height+2,
   name+': diálogo ultrapassa verticalmente a tela: '+JSON.stringify(m.dialog));
  assert.ok(m.scroller.width>100&&m.scroller.height>=50,
   name+': região rolável da tabela desapareceu');
  assert.ok(m.cellSize>=43.9&&m.item.width>=43.5&&m.item.height>=43.5,
   name+': células pequenas para toque '+JSON.stringify(m));
  assert.ok(m.dialogScrollHeight<=m.dialogClientHeight+5,
   name+': modal criou rolagem concorrente '+JSON.stringify(m));
  assert.ok(m.root.width<=m.dialog.width+2,
   name+': componente vazou do diálogo');
  assert.ok(m.documentWidth<=width+3,
   name+': tabela aumentou largura da página');
  if(width<=414)assert.ok(m.scrollWidth>m.clientWidth+100&&m.hintVisible,
   name+': dica de rolagem horizontal ausente');
  const cells=await dialog.locator('.periodic-element').count();
  assert.equal(cells,118,name+': tabela não tem 118 elementos');
  await page.locator('#silm-close-periodic').click();
  await dialog.waitFor({state:'hidden'});
 }
 // Na digitação, apenas destacar. Localizar faz seleção, sem rolar o modal.
 await page.setViewportSize({width:360,height:740});
 await open.click();
 const dialog=page.locator('#silm-periodic-dialog');
 const table=dialog.locator('.silm-periodic');
 const search=dialog.locator('.periodic-search input');
 const selected=()=>dialog.locator('.periodic-element[aria-pressed="true"]').getAttribute('data-z');
 assert.equal(await selected(),'29','Seleção inicial deveria ser cobre (Z=29)');
 await search.fill('Au');
 assert.equal(await selected(),'29','Digitar mudou o metal antes de Localizar');
 assert.ok(await dialog.locator('[data-z="79"].is-match').count(),
  'Busca não destacou ouro');
 await dialog.locator('.periodic-search button[type=submit]').click();
 assert.equal(await selected(),'79','Localizar não selecionou ouro');
 let m=await measure(page);
 assert.ok(m.dialogScrollHeight<=m.dialogClientHeight+5,'Busca rolou o modal externo');
 assert.ok(m.documentWidth<=360+3,'Busca rolou a página inteira');
 const gold=dialog.locator('.periodic-element[data-z="79"]');
 await gold.focus();
 await gold.press('Home');
 assert.equal(await dialog.locator('.periodic-element:focus').count(),1);
 await page.locator('#silm-close-periodic').click();
 await ctx.close();
 assert.deepEqual(errors,[],'Erros JavaScript: '+errors.join('; '));
 console.log('OK '+browserName+': 118 elementos, 7 viewports, rolagem confinada, alvo 44px e busca intencional');
}finally{await browser.close();}
