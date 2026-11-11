// Parte 9: Tabela na escala Objeto -> catálogo modal -> investigação real.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

const require=createRequire(import.meta.url);
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browserName=process.env.BROWSER_NAME||'chromium';
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
const dir=join('reports','catalogo-objetos',browserName);
mkdirSync(dir,{recursive:true});
const reports=[];
const browser=await playwright[browserName].launch({headless:true});
const errors=[];
let page;
const snap=()=>page.evaluate(()=>JSON.stringify(SILMIntegration.snapshot()));
const note=(tag,value)=>reports.push({tag,...value});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/index.html#/ambiente',{waitUntil:'load',timeout:45000});
 assert.ok(response?.ok(),'SILM não carregou');
 await page.waitForFunction(()=>window.SILM?.workshop?.valid()&&!document.querySelector('#silm-workshop-context')?.hidden);
 assert.equal(await page.locator('#silm-object-entry .periodic-element').count(),118,
  'A escala Objeto não começa com a Tabela Periódica de 118 elementos');
 assert.equal(await page.locator('#silm-object-entry .silm-workshop-card').count(),0,
  'Objetos foram exibidos antes de escolher um metal');
 const initially=await snap();
 const pickMetal=async z=>{
  // Mesmo componente periódico em todas as telas; o click faz
  // rolagem interna se a célula estiver à direita do viewport.
  await page.locator('#silm-object-entry .periodic-element[data-z="'+z+'"]').click();
 };
 for(const [label,width,height] of [['mobile-320',320,568],['mobile-390',390,844],['tablet-1024',1024,768],['short-desktop',1440,650],['desktop',1366,768],['desktop-wide',1649,927]]){
  await page.setViewportSize({width,height});
  await page.waitForTimeout(90);
  const dims=await page.locator('#silm-object-entry').evaluate(n=>{
   const frame=n.getBoundingClientRect(),grid=n.querySelector('.periodic-scroll');
   const r=grid.getBoundingClientRect();
   return {width:frame.width,left:frame.left,right:frame.right,scrollWidth:grid.scrollWidth,
    scrollClient:grid.clientWidth,scrollHeight:grid.scrollHeight,
    gridClient:grid.clientHeight,pageWidth:document.documentElement.scrollWidth};
  });
  assert.ok(dims.left>=-4&&dims.right<=width+4,label+': a Tabela extrapola a janela');
  assert.ok(dims.pageWidth<=width+6,label+': rolagem horizontal global');
  if(width<=1100||height<=700){
   assert.equal(await page.locator('#silm-object-entry .silm-periodic-family').count(),0,
    label+': modo alternativo por famílias ainda montado');
   const geometry=await page.locator('#silm-object-entry .periodic-scroll').evaluate(node=>{
    const css=getComputedStyle(node);
    const grid=node.querySelector('.periodic-grid');
    const h=grid.querySelector('.periodic-element[data-z="1"]').getBoundingClientRect();
    const og=grid.querySelector('.periodic-element[data-z="118"]').getBoundingClientRect();
    const cu=grid.querySelector('.periodic-element[data-z="29"]');
    const element=cu.getBoundingClientRect();
    const names=getComputedStyle(cu.querySelector('.element-name'));
    const initial=node.scrollLeft;
    node.scrollLeft=node.scrollWidth;
    const end=node.scrollLeft;
    node.scrollLeft=0;
    return {display:css.display,overflowX:css.overflowX,overflowY:css.overflowY,
     touchAction:css.touchAction,clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,
     initial,end,pageWidth:document.documentElement.scrollWidth,
     cellWidth:element.width,cellHeight:element.height,numberHeight:h.height,
     farGroup:og.left>h.left,gridCols:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
     nameDisplay:names.display,nameSize:parseFloat(names.fontSize),gridHeight:grid.getBoundingClientRect().height};
   });
   assert.equal(geometry.overflowX,'auto',label+': falta rolagem horizontal da Tabela');
   assert.equal(geometry.overflowY,'hidden',label+': a Tabela gerou rolagem vertical própria');
   assert.ok(geometry.farGroup&&geometry.gridCols===19,
    label+': estrutura dos 18 grupos perdida '+JSON.stringify(geometry));
   assert.ok(geometry.gridHeight>400,
    label+': períodos e séries foram comprimidos '+JSON.stringify(geometry));
   assert.ok(geometry.cellWidth>=55&&geometry.cellHeight>=48.5,
    label+': células pequenas demais para toque e leitura '+JSON.stringify(geometry));
   assert.ok(geometry.nameDisplay!=='none'&&geometry.nameSize>=9,
    label+': nomes não aparecem nas células '+JSON.stringify(geometry));
   if(width<=1100){
    assert.ok(geometry.scrollWidth>geometry.clientWidth+100,
     label+': rolagem horizontal sem conteúdo adicional '+JSON.stringify(geometry));
    assert.ok(geometry.end>100,label+': o gesto de rolar não alcança outros grupos');
   }
   assert.ok(geometry.pageWidth<=width+6,
    label+': rolagem horizontal vazou para toda a página '+JSON.stringify(geometry));
   // A busca encontra uma célula distante sem alterar a investigação.
   if(width===390){
    const search=page.locator('#silm-object-entry .silm-object-entry-head input[type="search"]');
    await search.fill('118');
    await page.waitForFunction(()=>{
     const s=document.querySelector('#silm-object-entry .periodic-scroll');
     return s&&s.scrollLeft>150;
    });
    assert.equal(await snap(),initially,label+': busca mudou o estado científico');
    await page.screenshot({path:join(dir,'mobile-390-rolagem-final.jpg'),
     type:'jpeg',quality:72,animations:'disabled'});
    await search.fill('');
    await page.locator('#silm-object-entry .periodic-scroll').evaluate(n=>n.scrollLeft=0);
   }
   note('horizontal-'+label,geometry);
  }else{
   const panorama=await page.locator('#silm-object-entry .periodic-scroll').evaluate(node=>{
    const view=node.getBoundingClientRect();
    const z=[1,2,29,57,71,89,103,118].map(n=>{
     const e=node.querySelector('.periodic-element[data-z="'+n+'"]').getBoundingClientRect();
     return {z:n,inside:e.left>=view.left-2&&e.right<=view.right+2&&
      e.top>=view.top-2&&e.bottom<=view.bottom+2,
      width:e.width,height:e.height};
    });
    return {visible:getComputedStyle(node).display!=='none',
     overflowX:getComputedStyle(node).overflowX,overflowY:getComputedStyle(node).overflowY,
     scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,
     scrollHeight:node.scrollHeight,clientHeight:node.clientHeight,
     elements:z};
   });
   assert.ok(panorama.visible,label+': a Tabela completa não aparece no desktop');
   assert.equal(panorama.overflowX,'hidden',label+': rolagem horizontal ainda ativa');
   assert.equal(panorama.overflowY,'hidden',label+': rolagem vertical ainda ativa');
   assert.ok(panorama.scrollWidth<=panorama.clientWidth+3,
    label+': matriz extrapola a largura do desktop '+JSON.stringify(panorama));
   assert.ok(panorama.scrollHeight<=panorama.clientHeight+3,
    label+': matriz extrapola a altura do desktop '+JSON.stringify(panorama));
   assert.ok(panorama.elements.every(e=>e.inside&&e.width>10&&e.height>12),
    label+': alguns períodos/séries não cabem integralmente '+JSON.stringify(panorama));
   note('panorama-'+label,panorama);
   const readability=await page.locator('#silm-object-entry').evaluate(root=>{
    const q=el=>{const r=el.getBoundingClientRect(),c=getComputedStyle(el);
     return {height:r.height,width:r.width,top:r.top,bottom:r.bottom,
      fontSize:parseFloat(c.fontSize),display:c.display,visibility:c.visibility};};
    const scroll=root.querySelector('.periodic-scroll');
    const cu=root.querySelector('.periodic-element[data-z="29"]');
    const gd=root.querySelector('.periodic-element[data-z="64"]');
    return {searchHoisted:!!root.querySelector('.silm-object-entry-head .periodic-search'),
     header:q(root.querySelector('.silm-object-entry-head')),
     grid:q(scroll),cu:q(cu),gd:q(gd),
     number:q(cu.querySelector('.element-z')),
     symbol:q(cu.querySelector('.element-symbol')),
     name:q(cu.querySelector('.element-name')),
     footer:q(root.querySelector('.periodic-footer')),
     area:q(root)};
   });
   assert.ok(readability.searchHoisted,label+': busca ainda está em uma linha separada');
   assert.ok(readability.name.display!=='none'&&readability.name.height>=9,
    label+': o nome do elemento continua oculto '+JSON.stringify(readability));
   assert.ok(readability.name.fontSize>=9,
    label+': fonte do nome ainda ilegível '+JSON.stringify(readability));
   assert.ok(readability.number.fontSize>=9,
    label+': número atômico ilegível '+JSON.stringify(readability));
   assert.ok(readability.symbol.fontSize>=16,
    label+': símbolo ilegível '+JSON.stringify(readability));
   assert.ok(readability.number.bottom<=readability.symbol.top+3,
    label+': número atômico sobreposto ao símbolo '+JSON.stringify(readability));
   assert.ok(readability.symbol.bottom<=readability.name.top+3,
    label+': símbolo sobreposto ao nome '+JSON.stringify(readability));
   assert.ok(readability.cu.height>=37,
    label+': células compactadas demais '+JSON.stringify(readability));
   if(width>=1600){
    assert.ok(readability.cu.height>=45,
     label+': em desktop grande a Tabela não aproveitou a altura '+JSON.stringify(readability));
    assert.ok(readability.footer.height<=75,
     label+': rodapé consome a área de leitura '+JSON.stringify(readability));
   }
   note('legibilidade-'+label,readability);
  }
  note('table-'+label,dims);
  await page.screenshot({path:join(dir,label+'-tabela-inicial.jpg'),type:'jpeg',quality:72,animations:'disabled'});
 }
 // Um metal com objeto único não pode renderizar uma foto de 230px
 // flutuando no centro de um cartão quase vazio (regressão Parte 9).
 await page.setViewportSize({width:1366,height:768});
 await pickMetal(64,'lanthanides');
 const gdDialog=page.locator('#silm-objects-dialog');
 await gdDialog.waitFor({state:'visible'});
 assert.equal(await gdDialog.locator('.silm-workshop-card').count(),1,
  'Gadolínio deve apresentar uma aplicação no catálogo');
 await page.waitForFunction(()=>document.querySelector('#silm-objects-dialog .silm-workshop-card img')?.naturalWidth>0);
 const singleDesktop=await gdDialog.evaluate(dialog=>{
  const card=dialog.querySelector('.silm-workshop-card');
  const art=card.querySelector('.silm-workshop-art');
  const body=card.querySelector('.silm-workshop-card-body');
  const img=art.querySelector('img');
  const r=n=>{const a=n.getBoundingClientRect();return{
   left:a.left,right:a.right,top:a.top,bottom:a.bottom,width:a.width,height:a.height}};
  return {card:r(card),art:r(art),body:r(body),img:r(img),
   pageWidth:document.documentElement.scrollWidth,viewport:innerWidth};
 });
 assert.ok(singleDesktop.art.width>=singleDesktop.card.width*.55,
  'Desktop: a foto única não ocupa a maior área do cartão '+JSON.stringify(singleDesktop));
 assert.ok(singleDesktop.art.right<=singleDesktop.body.left+5,
  'Desktop: imagem e informações não ficaram lado a lado');
 assert.ok(singleDesktop.img.height>=320,
  'Desktop: imagem única voltou a ser uma miniatura');
 assert.ok(singleDesktop.pageWidth<=singleDesktop.viewport+5,
  'Desktop: catálogo provocou rolagem horizontal');
 note('gd-desktop',singleDesktop);
 await page.screenshot({path:join(dir,'gd-objeto-unico-desktop.jpg'),type:'jpeg',quality:74,animations:'disabled'});
 await page.setViewportSize({width:390,height:844});
 const singleMobile=await gdDialog.evaluate(dialog=>{
  const card=dialog.querySelector('.silm-workshop-card');
  const art=card.querySelector('.silm-workshop-art').getBoundingClientRect();
  const body=card.querySelector('.silm-workshop-card-body').getBoundingClientRect();
  const img=card.querySelector('img').getBoundingClientRect();
  const button=card.querySelector('button').getBoundingClientRect();
  return {artWidth:art.width,artBottom:art.bottom,bodyTop:body.top,
   imageHeight:img.height,buttonHeight:button.height,pageWidth:document.documentElement.scrollWidth};
 });
 assert.ok(singleMobile.imageHeight>=210,
  'Celular: imagem do objeto ficou pequena demais');
 assert.ok(singleMobile.artBottom<=singleMobile.bodyTop+5,
  'Celular: as informações precisam ficar abaixo da imagem');
 assert.ok(singleMobile.pageWidth<=395,
  'Celular: modal criou rolagem horizontal global');
 assert.ok(singleMobile.buttonHeight>=43.5,'Botão do objeto menor que 44px');
 note('gd-mobile',singleMobile);
 await page.screenshot({path:join(dir,'gd-objeto-unico-mobile.jpg'),type:'jpeg',quality:74,animations:'disabled'});
 await page.keyboard.press('Escape');
 await gdDialog.waitFor({state:'hidden'});
 assert.equal(await snap(),initially,'Consultar o objeto de Gd alterou a investigação');
 await pickMetal(29,11);
 const modal=page.locator('#silm-objects-dialog');
 await modal.waitFor({state:'visible'});
 assert.equal(await modal.locator('.silm-workshop-card').count(),3,
  'Cobre deveria oferecer as referências do atlas, motor e latão');
 assert.equal(await modal.locator('.silm-workshop-card[data-reference-id="atlas-cu"]').count(),1);
 const multiImageHeight=await modal.locator('.silm-workshop-card[data-reference-id="atlas-cu"] img').evaluate(n=>n.getBoundingClientRect().height);
 assert.ok(multiImageHeight>=210,'Catálogo com múltiplas aplicações voltou a usar miniaturas pequenas');
 assert.equal(await snap(),initially,'Abrir objetos alterou investigação');
 const bounds=await modal.evaluate(n=>{
  const b=n.getBoundingClientRect();return{
   width:b.width,height:b.height,viewport:innerWidth,
   scrollWidth:document.documentElement.scrollWidth,
   cardCount:n.querySelectorAll('.silm-workshop-card').length};
 });
 assert.ok(bounds.width<=390+2&&bounds.height<=844+2,'Modal não é responsivo');
 await page.screenshot({path:join(dir,'cobre-catalogo-modal.jpg'),type:'jpeg',quality:72,animations:'disabled'});
 await page.keyboard.press('Escape');
 await modal.waitFor({state:'hidden'});
 assert.equal(await snap(),initially,'Cancelar catálogo alterou estado científico');
 await pickMetal(29,11);
 await modal.waitFor({state:'visible'});
 await modal.locator('[data-reference-id="atlas-cu"]').getByRole('button',{name:'Investigar objeto'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===29);
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId==='atlas-cu');
 assert.equal(await page.locator('#si-stage').getAttribute('data-workshop-scale'),'1');
 const scientificBefore=await page.evaluate(()=>{
  const st=SILMIntegration.snapshot();return JSON.stringify({
   atomicNumber:st.metal.atomicNumber,investigation:st.investigation.id,structure:st.structure,
   properties:st.properties,measurements:st.measurements,calculations:st.calculations
  });
 });
 await page.locator('.silm-workshop-browse-objects').click();
 await modal.waitFor({state:'visible'});
 await modal.locator('[data-reference-id="cobre-latao"]').getByRole('button',{name:'Investigar objeto'}).click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId==='cobre-latao');
 const scientificAfter=await page.evaluate(()=>{
  const st=SILMIntegration.snapshot();return JSON.stringify({
   atomicNumber:st.metal.atomicNumber,investigation:st.investigation.id,structure:st.structure,
   properties:st.properties,measurements:st.measurements,calculations:st.calculations
  });
 });
 assert.equal(scientificAfter,scientificBefore,'Trocar aplicação do mesmo metal mudou a ciência');
 // Abrir novamente a Tabela no palco NÃO substitui a investigação.
 const prior=await snap();
 await page.locator('.silm-workshop-reference-summary').getByRole('button',{name:'Tabela Periódica'}).click();
 await page.locator('#silm-object-entry .periodic-scroll').waitFor({state:'visible'});
 assert.equal(await snap(),prior,'Consultar Tabela substituiu a investigação');
 await pickMetal(26,8);
 await modal.waitFor({state:'visible'});
 assert.ok(await modal.locator('[data-reference-id="atlas-fe"]').count()===1,
  'Ferro não oferece o objeto do atlas');
 assert.equal(await snap(),prior,'Inspecionar objetos de outro metal mudou a investigação');
 await modal.locator('[data-reference-id="atlas-fe"]').getByRole('button',{name:'Investigar objeto'}).click();
 await page.locator('#si-modal-confirm').waitFor({state:'visible'});
 await page.locator('#si-modal-cancel').click();
 await modal.waitFor({state:'visible'});
 assert.equal(await snap(),prior,'Cancelar troca de metal alterou a investigação');
 await modal.locator('[data-reference-id="atlas-fe"]').getByRole('button',{name:'Investigar objeto'}).click();
 await page.locator('#si-modal-confirm').click();
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metal?.atomicNumber===26);
 await page.waitForFunction(()=>SILMIntegration.snapshot()?.metadata?.workshop?.referenceId==='atlas-fe');
 await modal.waitFor({state:'hidden'});
 assert.equal(await page.locator('#si-stage').getAttribute('data-workshop-scale'),'1');
 // As quatro escalas seguem disponíveis sem tabela/modal duplicados.
 assert.equal(await page.locator('.silm-workshop-scale').count(),4);
 assert.equal(await page.locator('#silm-objects-dialog').count(),1);
 assert.deepEqual(errors,[],'Erros de console: '+JSON.stringify(errors));
 note('end',{metal:26,reference:'atlas-fe',noErrors:true});
 await ctx.close();
}catch(e){
 reports.push({error:String(e),stack:e.stack});
 throw e;
}finally{
 writeFileSync(join(dir,'metricas.json'),JSON.stringify(reports,null,2));
 await browser.close();
}
