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
  for(const {width,height} of [
   {width:320,height:640},
   {width:360,height:800},
   {width:390,height:844},
   {width:768,height:1024},
   {width:844,height:390},
   {width:1024,height:768},
   {width:1440,height:1000}
  ]){
   await page.setViewportSize({width,height});
   for(const theme of ['claro','escuro','contraste']){
    await page.evaluate(theme=>{BaseDemoSI.applyTheme(theme==='claro'?'claro':'escuro');document.documentElement.classList.toggle('si-highcontrast',theme==='contraste');},theme);
    const checks=[
     ['modulo','#si-dock-left',async()=>{await nav.moduleChoice(page,'explorar');await page.locator('[data-open-dock="montagem"]').click();await page.locator('[data-left-tab="modulo"]').click();}],
     ['ver','#si-dock-right',()=>nav.viewer(page,'eletrons')],
     ['dados','#si-dock-right',()=>nav.data(page,'tabela')],
     ['palco-cientifico','#si-stage',async()=>{}]
    ];
    for(const [scenario,scope,open]of checks){
     await open();
     const result=await new AxeBuilder({page}).include(scope).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
     const smallTargets=await page.locator(scope).evaluate(root=>[...root.querySelectorAll('button,input,select,textarea,[role="button"],[role="tab"]')].filter(node=>{
      if(!node.getClientRects().length||node.closest('[hidden],[aria-hidden="true"]'))return false;
      const r=node.getBoundingClientRect();return r.width<24||r.height<24;
     }).map(node=>({tag:node.tagName.toLowerCase(),id:node.id||null,role:node.getAttribute('role'),label:(node.getAttribute('aria-label')||node.textContent||'').trim().slice(0,60),width:Math.round(node.getBoundingClientRect().width),height:Math.round(node.getBoundingClientRect().height)})));
     const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
     assert.ok(layout.scrollWidth<=layout.width+1,scenario+' — transbordamento horizontal em '+width+'×'+height+': '+JSON.stringify(layout));
     scenarios.push({width,height,theme,scenario,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),smallTargets});
     const closeSide=scope==='#si-dock-left'?'left':scope==='#si-dock-right'?'right':null;
     if(closeSide)await page.locator('[data-close-dock="'+closeSide+'"]').click();
    }
   }
  }
  if(process.env.SILM_A11Y_EVIDENCE){const output=path.resolve(root,process.env.SILM_A11Y_EVIDENCE);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({browser:browser.version(),engine:'axe-core',scenarios},null,2)+'\n');}
  assert.deepEqual(scenarios.filter(r=>r.violations.length||r.smallTargets.length),[],'Violações WCAG ou alvos menores que 24×24 px nas docas ou no palco científico.');
  console.log('PASS: axe-core WCAG 2.0/2.1/2.2 AA — '+scenarios.length+' cenários nas docas e no palco científico, em sete viewports e três temas, sem overflow e sem alvos menores que 24×24 px.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
