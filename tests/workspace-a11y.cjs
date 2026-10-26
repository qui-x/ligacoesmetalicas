'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const AxeBuilder=require('@axe-core/playwright').default,{serve,launch,root}=require('./support.cjs'),nav=require('./integration-navigation.cjs');
async function main(){
 const {server,url}=await serve();let browser;const scenarios=[];
 try{
  browser=await launch();
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
  await page.goto(url+'index.html#/ambiente');await page.waitForFunction(()=>window.SILMIntegration);
  await page.locator('[data-open-dock="montagem"]').click();await page.locator('#silm-start').click();await page.locator('#silm-add').click();await page.locator('#silm-organize').click();await page.locator('[data-close-dock="left"]').click();
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});
   for(const theme of ['claro','escuro','contraste']){
    await page.evaluate(theme=>{BaseDemoSI.applyTheme(theme==='claro'?'claro':'escuro');document.documentElement.classList.toggle('si-highcontrast',theme==='contraste');},theme);
    const checks=[
     ['modulo','#si-dock-left',async()=>{await nav.moduleChoice(page,'explorar');await page.locator('[data-open-dock="montagem"]').click();await page.locator('[data-left-tab="modulo"]').click();}],
     ['ver','#si-dock-right',()=>nav.viewer(page,'eletrons')],
     ['dados','#si-dock-right',()=>nav.data(page,'tabela')]
    ];
    for(const [scenario,scope,open]of checks){
     await open();
     const result=await new AxeBuilder({page}).include(scope).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
     scenarios.push({width,theme,scenario,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
     await page.locator('[data-close-dock="'+(scope.endsWith('left')?'left':'right')+'"]').click();
    }
   }
  }
  if(process.env.SILM_A11Y_EVIDENCE){const output=path.resolve(root,process.env.SILM_A11Y_EVIDENCE);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({browser:browser.version(),engine:'axe-core',scenarios},null,2)+'\n');}
  assert.deepEqual(scenarios.filter(r=>r.violations.length),[],'Violações automáticas nas docas analisadas.');
  console.log('PASS: axe-core — '+scenarios.length+' cenários nas docas, em claro/escuro/alto contraste e 390/1440 px; zero violações.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
