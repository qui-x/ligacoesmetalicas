'use strict';
const assert=require('node:assert/strict');
const {serve,launch}=require('./support.cjs');
const nav=require('./integration-navigation.cjs');

(async()=>{
 const {server,url}=await serve();
 let browser;
 const viewports=[
  {width:320,height:640,label:'celular compacto'},
  {width:390,height:844,label:'celular alto'},
  {width:844,height:390,label:'celular em paisagem'}
 ];
 try{
  browser=await launch();
  for(const v of viewports){
   const context=await browser.newContext({
    viewport:{width:v.width,height:v.height},isMobile:true,hasTouch:true,
    deviceScaleFactor:1,reducedMotion:'reduce',locale:'pt-BR'
   });
   const page=await context.newPage(),errors=[];
   page.setDefaultTimeout(12000);
   page.on('pageerror',error=>errors.push(error.message));
   try{
    await page.goto(url+'#/ambiente');
    await page.waitForFunction(()=>window.SILMIntegration);

    // Toda a sequência de montagem usa toque real emulado, não click() de desktop.
    await page.locator('[data-open-dock="montagem"]').tap();
    await page.locator('#silm-start').tap();
    for(let i=0;i<3;i++)await page.locator('#silm-add').tap();
    await page.locator('#silm-organize').tap();
    await page.waitForFunction(()=>document.querySelector('.silm-crystal'));
    await page.locator('[data-close-dock="left"]').tap();

    const first=page.locator('.silm-crystal-unit').first();
    await first.tap();
    assert.equal(await first.getAttribute('aria-pressed'),'true',
     v.label+': o toque seleciona uma unidade cristalográfica');
    // selectedUnitId pertence à representação; a referência científica começa depois da seleção.
    const before=await page.evaluate(()=>SILMIntegration.snapshot());

    // Alternar a projeção para 3D é apenas representação: não muda o estado científico.
    await page.locator('#silm-crystal-projection').selectOption('3d');
    await page.waitForFunction(()=>document.querySelector('.silm-crystal')?.dataset.viewMode==='3d');
    assert.deepEqual(await page.evaluate(()=>SILMIntegration.snapshot()),before,
     v.label+': a projeção 3D preserva o estado científico');
    await page.locator('#silm-crystal-projection').selectOption('isometric');
    await page.waitForFunction(()=>document.querySelector('.silm-crystal')?.dataset.viewMode==='2d');
    assert.deepEqual(await page.evaluate(()=>SILMIntegration.snapshot()),before,
     v.label+': o retorno a 2D preserva o estado científico');

    const geometry=await page.evaluate(()=>({
     width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
     stage:(()=>{const r=document.querySelector('#silm-assembly-stage').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};})()
    }));
    assert.ok(geometry.scrollWidth<=geometry.width+1,
     v.label+': a oficina não deve transbordar horizontalmente: '+JSON.stringify(geometry));
    assert.ok(geometry.stage.width>=160&&geometry.stage.height>=160,
     v.label+': palco utilizável: '+JSON.stringify(geometry.stage));
    assert.ok(geometry.stage.right<=geometry.width+1,
     v.label+': o palco permanece dentro da largura visível: '+JSON.stringify(geometry.stage));

    // Medição pelo fluxo visível da interface.
    const ids=await page.evaluate(()=>{
     const nodes=[...document.querySelectorAll('.silm-crystal-unit')].map(node=>{
      const r=node.getBoundingClientRect();return {id:node.dataset.unitId,x:r.x+r.width/2,y:r.y+r.height/2};
     }).filter(u=>u.id);
     let best=null,bestDistance=-1;
     for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
      const distance=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
      if(distance>bestDistance){bestDistance=distance;best=[nodes[i].id,nodes[j].id];}
     }
     return best;
    });
    assert.equal(ids.length,2,v.label+': há dois alvos distintos para medir distância');
    await nav.moduleChoice(page,'medir');
    await nav.viewer(page,'instrumentos');
    await page.locator('#silm-instrument').selectOption('distance');
    await page.locator('[data-close-dock="right"]').tap();
    for(const id of ids)await page.locator('.silm-crystal-unit[data-unit-id="'+id+'"]').tap();
    await page.waitForFunction(()=>SILMIntegration.snapshot().measurements.length===1);
    const measurement=await page.evaluate(()=>SILMIntegration.snapshot().measurements[0]);
    assert.equal(measurement.type,'distance',v.label+': medição de distância registrada');
    assert.equal(measurement.points.length,2,v.label+': medição preserva os dois pontos');

    // Cálculo cristalográfico pelo mesmo estado, sem reconstruir a investigação.
    await nav.moduleChoice(page,'calcular');
    await nav.viewer(page,'calculos');
    await page.locator('#silm-formula').selectOption('cell-volume-cubic');
    await page.getByRole('button',{name:'Calcular',exact:true}).tap();
    await page.waitForFunction(()=>SILMIntegration.snapshot().calculations.length===1);
    const calc=await page.evaluate(()=>SILMIntegration.snapshot().calculations[0]);
    assert.equal(calc.formulaId,'cell-volume-cubic',v.label+': volume da célula calculado');
    assert.deepEqual(errors,[],v.label+': sem exceções JavaScript');
    console.log('PASS '+v.width+'×'+v.height+' ('+v.label+'): toque, 2D/3D, medição, cálculo e layout.');
   }finally{await context.close();}
  }
 }finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
