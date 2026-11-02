'use strict';
/* TEST-PRESET — Etapa 9 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   Montagens prontas como no SIAB 1.0.0: lista de cartões (objetivo, o que vai para a oficina, passos, recursos e ação),
   entradas pelo Menu → Recursos, pela Oficina vazia e pelo Preparo; aplicar inicia a investigação, monta e organiza segundo
   a estrutura de referência do banco, com a mesma confirmação de "Iniciar investigação"; a investigação preparada persiste;
   em atividade a tela não abre; uma montagem cujo metal ou estrutura mudou fica indisponível com motivo. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const cards=p=>p.evaluate(()=>[...document.querySelectorAll('#silm-presets-list .silm-setup-card')].map(c=>({title:c.querySelector('h2').textContent,text:c.innerText,steps:c.querySelectorAll('ol li').length,
  button:(b=>b?{text:b.textContent,h:b.getBoundingClientRect().height,disabled:b.disabled}:null)(c.querySelector('button[data-ready-assembly]'))})));
 /* 1. Lista nos cinco tamanhos. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/montagens');await p.locator('#silm-presets-list .silm-setup-card').first().waitFor();
   assert.equal(await p.locator('[data-view="montagens"] h1').textContent(),'Montagens prontas');assert.equal(await p.title(),'Montagens prontas · SILM');
   const list=await cards(p);assert.deepEqual(list.map(c=>c.title),['Cobre · CFC','Ferro · CCC','Magnésio · HC'],where);
   for(const [i,c] of list.entries()){
    assert.match(c.text,/Explorar · Estrutura cristalina/i);assert.match(c.text,/Na oficina: .+, Z = \d+ · .+ · célula unitária completa com \d+ unidades/);
    assert.match(c.text,/Condição de referência: /);assert.match(c.text,/Fonte da estrutura: /);assert.match(c.text,/Investigue/);assert.match(c.text,/Recursos recomendados: /);
    assert.equal(c.steps,2);assert.deepEqual({text:c.button.text,disabled:c.button.disabled},{text:'Montar na oficina',disabled:false});assert.ok(c.button.h>=43.5,'Botão com 44 px em '+where+' ('+i+')');
   }
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'Sem rolagem lateral em '+where);
  }finally{await ctx.close();}
 }
 /* 2. Entradas, aplicação, confirmação e persistência. */
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/inicio');
  await p.locator('#nav-toggle').click();await p.locator('#silm-presets-open').click();await p.waitForFunction(()=>location.hash==='#/montagens');
  await p.waitForFunction(()=>document.getElementById('silm-presets-open').getAttribute('aria-current')==='page','',{timeout:4000});// Menu marca a tela atual.
  // Sem investigação: aplica direto, volta à Oficina com a estrutura organizada.
  const facts=await p.evaluate(()=>Object.fromEntries(SILM.readyAssemblies.list().map(x=>[x.id,{z:x.atomicNumber,type:x.expectedType,sites:x.cellSites}])));
  await p.locator('#preset-cobre-cfc button').click();await p.waitForFunction(()=>location.hash==='#/ambiente'&&SILMIntegration.snapshot().structure?.mode==='crystalline');
  let s=await p.evaluate(()=>{const x=SILMIntegration.snapshot();return {z:x.metal.atomicNumber,type:x.structure.crystallography.structureType,units:x.structure.units.length};});
  assert.deepEqual(s,{z:facts['cobre-cfc'].z,type:'FCC',units:facts['cobre-cfc'].sites});
  assert.match(await p.locator('#si-notifications').innerText(),/Montagem pronta: Cobre · CFC\. Célula unitária completa com 14 unidades\./);
  // Com investigação: a mesma confirmação de "Iniciar investigação"; Cancelar preserva, Iniciar substitui.
  await p.evaluate(()=>{location.hash='#/montagens';});await p.locator('#preset-ferro-ccc button').waitFor();
  await p.locator('#preset-ferro-ccc button').click();await p.locator('#si-modal-cancel').click();
  assert.equal(await p.evaluate(()=>SILMIntegration.snapshot().metal.atomicNumber),29,'Cancelar preserva a investigação');assert.equal(await p.evaluate(()=>location.hash),'#/montagens');
  await p.locator('#preset-ferro-ccc button').click();await p.locator('#si-modal-confirm').click();
  await p.waitForFunction(()=>location.hash==='#/ambiente'&&SILMIntegration.snapshot().metal?.atomicNumber===26&&SILMIntegration.snapshot().structure?.mode==='crystalline');
  s=await p.evaluate(()=>{const x=SILMIntegration.snapshot();return {type:x.structure.crystallography.structureType,units:x.structure.units.length};});assert.deepEqual(s,{type:'BCC',units:facts['ferro-ccc'].sites});
  // Persistência: a investigação preparada volta depois de recarregar.
  await p.reload();await p.waitForFunction(()=>window.SILMIntegration);
  s=await p.evaluate(()=>{const x=SILMIntegration.snapshot();return {z:x.metal?.atomicNumber,mode:x.structure?.mode,type:x.structure?.crystallography?.structureType};});
  assert.deepEqual(s,{z:26,mode:'crystalline',type:'BCC'},'Investigação preparada persiste');
  // Entradas pela Oficina: Preparo e (sem metal) estado vazio.
  await p.locator('[data-open-dock="montagem"]').click();await p.locator('[data-left-tab="preparo"]').click();await p.locator('#silm-open-presets').click();await p.waitForFunction(()=>location.hash==='#/montagens');
  const fresh=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
  try{const q=await open(fresh,'#/ambiente');await q.locator('.si-empty-state').waitFor();await q.getByRole('button',{name:'Montagens prontas',exact:true}).click();await q.waitForFunction(()=>location.hash==='#/montagens');
   // Magnésio pela Oficina vazia: HC com a célula do modelo.
   await q.locator('#preset-magnesio-hc button').click();await q.waitForFunction(()=>SILMIntegration.snapshot().structure?.crystallography?.structureType==='HCP');
   assert.equal(await q.evaluate(()=>SILMIntegration.snapshot().structure.units.length),facts['magnesio-hc'].sites);}finally{await fresh.close();}
  // Montagem cujo dado mudou: indisponível com motivo (nunca troca de metal nem de estrutura).
  const why=await p.evaluate(()=>{const R=SILM.readyAssemblies,item=R.get('cobre-cfc');return {changed:R.describe({...item,expectedType:'HCP'}),gone:R.describe({...item,atomicNumber:1})};});
  assert.deepEqual([why.changed.available,why.changed.reasonCode,why.gone.available,why.gone.reasonCode],[false,'STRUCTURE_CHANGED',false,'METAL_UNAVAILABLE']);
 }finally{await ctx.close();}
 /* 3. Numa missão (atividade restrita), a tela não abre (como no SIAB, a montagem pronta é da bancada livre). */
 const act=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(act,'#/missoes?item=vizinhos-metal');await p.locator('#mission-mount').waitFor();await p.locator('#mission-metal').selectOption('29');await p.locator('#mission-mount').click();await p.locator('#si-modal-confirm').click();await p.waitForFunction(()=>location.hash==='#/ambiente');
  await p.evaluate(()=>{location.hash='#/montagens';});await p.waitForFunction(()=>location.hash.startsWith('#/missoes'));
  assert.match(await p.locator('#si-notifications').innerText(),/Encerre a atividade para abrir outras telas/);
 }finally{await act.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-PRESET: três montagens prontas em 5 tamanhos, entradas pelo Menu, pela Oficina vazia e pelo Preparo, aplicação com a estrutura de referência do banco, confirmação ao substituir, persistência, bloqueio em atividade e indisponibilidade com motivo.');
};
