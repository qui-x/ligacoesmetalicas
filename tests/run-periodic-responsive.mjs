// Regressão da Tabela Periódica no palco real da Oficina (Chromium/Firefox/WebKit).
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
const measure=page=>page.evaluate(()=>{
 const area=document.querySelector('#silm-object-entry');
 const root=area.querySelector('.silm-periodic');
 const scroll=area.querySelector('.periodic-scroll');
 const cell=area.querySelector('.periodic-element');
 const rect=n=>{const x=n.getBoundingClientRect();return {left:x.left,right:x.right,top:x.top,bottom:x.bottom,width:x.width,height:x.height}};
 const hint=area.querySelector('.periodic-scroll-hint');
 return {viewport:[innerWidth,innerHeight],area:rect(area),root:rect(root),
  scroller:rect(scroll),item:rect(cell),scrollWidth:scroll.scrollWidth,
  clientWidth:scroll.clientWidth,scrollHeight:scroll.scrollHeight,
  clientHeight:scroll.clientHeight,documentWidth:document.documentElement.scrollWidth,
  hintVisible:!hint.hidden};
});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'SILM não carregou');
 await page.waitForFunction(()=>window.SILMIntegration&&!!document.querySelector('#silm-object-entry'));
 const baseline=await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
 for(const [name,width,height] of sizes){
  await page.setViewportSize({width,height});
  await page.locator('[data-open-dock="montagem"]').click();
  await page.locator('[data-left-tab="preparo"]').click();
  await page.locator('#silm-open-periodic').click();
  await page.locator('#silm-object-entry .periodic-element[data-z="29"]').waitFor({state:'visible'});
  assert.equal(await page.locator('#silm-periodic-dialog').isVisible(),false,
   name+': a Tabela foi aberta como janela modal em vez de ocupar o palco');
  assert.equal(await page.locator('#si-dock-left').isVisible(),false,
   name+': Montagem precisa recolher para liberar a área das imagens');
  await page.waitForTimeout(90);
  const m=await measure(page);
  assert.ok(m.area.left>=-3&&m.area.right<=width+3,
   name+': Tabela fora do palco horizontal: '+JSON.stringify(m));
  assert.ok(m.scroller.width>100&&m.scroller.height>=50,
   name+': região rolável da Tabela desapareceu');
  assert.ok(m.item.width>=40&&m.item.height>=40,
   name+': células reduzidas demais '+JSON.stringify(m));
  assert.ok(m.root.width<=m.area.width+3,
   name+': componente periódico escapou da área central');
  assert.ok(m.documentWidth<=width+5,
   name+': a Tabela gerou rolagem global');
  if(width<=414)assert.ok(m.scrollWidth>m.clientWidth+100&&m.hintVisible,
   name+': falta rolagem horizontal e dica dos grupos 1–18');
  assert.equal(await page.locator('#silm-object-entry .periodic-element').count(),118,
   name+': Tabela não possui 118 elementos');
  assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),baseline,
   name+': abrir Tabela alterou estado científico');
 }
 await page.setViewportSize({width:390,height:844});
 const table=page.locator('#silm-object-entry');
 const search=table.locator('.periodic-search input');
 await search.fill('Au');
 assert.equal(await page.locator('#silm-objects-dialog').isVisible(),false,
  'Digitar na busca abriu o catálogo sem confirmação');
 assert.ok(await table.locator('[data-z="79"].is-match').count(),
  'Busca não destacou o ouro');
 await table.locator('.periodic-search button[type=submit]').click();
 await page.locator('#silm-objects-dialog').waitFor({state:'visible'});
 assert.ok(await page.locator('#silm-objects-dialog [data-reference-id="atlas-au"] img').count(),
  'Selecionar Au não abriu imagens do metal');
 assert.ok(await page.locator('#silm-objects-dialog [data-reference-id="atlas-au"]')
  .getByRole('button',{name:'Iniciar montagem'}).count(),
  'Modal de imagens não oferece Iniciar montagem');
 assert.equal(await page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot())),baseline,
  'Consultar imagem no modal alterou a investigação');
 await page.locator('#silm-objects-close').click();
 await page.locator('#silm-objects-dialog').waitFor({state:'hidden'});
 const gold=table.locator('.periodic-element[data-z="79"]');
 await gold.focus();await gold.press('Home');
 assert.equal(await table.locator('.periodic-element:focus').count(),1);
 assert.deepEqual(errors,[],'Erros JS: '+errors.join('; '));
 console.log('OK '+browserName+': 118 elementos, 7 viewports, Tabela no palco, imagens em modal e início de montagem');
 await ctx.close();
}finally{await browser.close();}
