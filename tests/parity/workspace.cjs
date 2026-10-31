'use strict';
/* TEST-WORKSPACE — Etapa 5 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   5.1 Foco: a Oficina vazia segue a "Bancada vazia" do SIAB (ilustração, título, o que fazer e três ações que funcionam);
   a barra mostra o módulo ativo; adicionar, desfazer e trocar de módulo preservam a investigação. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const visible=(p,sel)=>p.locator(sel).first().waitFor({state:'visible',timeout:4000});
 /* 1. Estado vazio nos cinco tamanhos. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/ambiente');await visible(p,'.si-empty-state');
   const s=await p.evaluate(()=>{const box=document.querySelector('.si-empty-state'),r=el=>el.getBoundingClientRect(),scene=document.getElementById('silm-integration-scene');
    return {title:box.querySelector('h2').textContent.trim(),text:box.querySelector('p').textContent.trim(),art:!!box.querySelector('svg[aria-hidden="true"]'),
     actions:[...box.querySelectorAll('.si-empty-actions .button')].map(b=>({text:b.textContent.trim(),h:r(b).height,inside:r(b).right<=r(scene).right+1&&r(b).left>=r(scene).left-1})),
     tag:document.getElementById('si-module-tag')?.textContent.trim(),overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(s.title,'Oficina vazia',where);assert.match(s.text,/Montagem → Preparo/);assert.equal(s.art,true,'Ilustração decorativa');
   assert.deepEqual(s.actions.map(a=>a.text),['Abrir Montagem','Começar com o cobre','Tabela periódica'],where);
   for(const a of s.actions){assert.ok(a.h>=44,'Ação com alvo de 44 px em '+where);assert.ok(a.inside,'Ação dentro da cena em '+where);}
   assert.equal(s.tag,'Módulo · Explorar');assert.ok(s.overflow<=1,'Sem rolagem lateral em '+where+': '+s.overflow+' px');
  }finally{await ctx.close();}
 }
 /* 2. As ações do estado vazio funcionam; adicionar, desfazer e trocar de módulo preservam a investigação. */
 const ctx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/ambiente');await visible(p,'.si-empty-state');
  await p.getByRole('button',{name:'Abrir Montagem',exact:true}).click();
  await p.waitForFunction(()=>document.querySelector('[data-open-dock="montagem"]')?.getAttribute('aria-expanded')==='true'&&document.querySelector('[data-left-tab="preparo"]')?.getAttribute('aria-pressed')==='true','',{timeout:4000});
  await p.locator('[data-close-dock="left"]').click();
  await p.getByRole('button',{name:'Tabela periódica',exact:true}).click();await visible(p,'dialog[open]');await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('dialog[open]'));
  assert.equal(await p.evaluate(()=>SILMIntegration.snapshot().investigation),null,'Abrir a tabela não inicia investigação');
  await p.getByRole('button',{name:'Começar com o cobre',exact:true}).click();await p.waitForFunction(()=>SILMIntegration.snapshot().metal?.atomicNumber===29);
  assert.equal(await p.locator('.si-empty-state').count(),0,'Com metal, a cena mostra a montagem');
  await p.locator('[data-open-dock="montagem"]').click();await p.locator('#silm-add').click();await p.locator('#silm-add').click();
  await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.units.length===2);
  await p.getByRole('button',{name:/Desfazer/}).first().click();await p.waitForFunction(()=>SILMIntegration.snapshot().structure?.units.length===1);
  const before=await p.evaluate(()=>JSON.stringify({metal:SILMIntegration.snapshot().metal,units:SILMIntegration.snapshot().structure.units}));
  const tab=p.locator('[data-left-tab="modulo"]');if(await p.locator('#si-dock-left').isHidden())await p.locator('[data-open-dock="montagem"]').click();await tab.click();
  await p.locator('#silm-module').selectOption('medir');await p.waitForFunction(()=>SILMIntegration.snapshot().module.active==='medir');
  assert.equal(await p.evaluate(()=>JSON.stringify({metal:SILMIntegration.snapshot().metal,units:SILMIntegration.snapshot().structure.units})),before,'Trocar de módulo não apaga a investigação');
  await p.waitForFunction(()=>document.getElementById('si-module-tag')?.textContent.trim()==='Módulo · Medir','',{timeout:4000});
  assert.equal(await p.locator('#silm-add').isDisabled(),true,'Medir não edita a montagem');
  await p.locator('#silm-module').selectOption('explorar');await p.waitForFunction(()=>SILMIntegration.snapshot().module.active==='explorar');
 }finally{await ctx.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-WORKSPACE 5.1: Oficina vazia em 5 tamanhos com ações funcionais, etiqueta do módulo, adicionar/desfazer e troca de módulo sem perder a investigação.');
};
