'use strict';
/* TEST-MANUAL — Etapa 7 do plano de paridade SIAB × SILM (docs/PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md).
   O Manual como o SIAB 1.0.0 organiza: barra com busca, "Voltar" e impressão; início com apresentação, "Quero saber" e
   grupos; tópico com caminho, artigo, "Veja também" e retorno; resultados de busca e vazio; aliases e endereços antigos. */
const assert=require('node:assert/strict');
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
module.exports=async(browser,url)=>{
 const base=url.split('#')[0]+'index.html';const errors=[];
 const open=async(ctx,hash)=>{const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base+hash);await p.waitForFunction(()=>window.SILMIntegration);return p;};
 const visible=(p,sel)=>p.locator(sel).first().waitFor({state:'visible',timeout:4000});
 /* 1. Início do Manual nos cinco tamanhos. */
 for(const [width,height] of SIZES){
  const mobile=width<500||(width<900&&width<height),where=width+'×'+height;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  try{
   const p=await open(ctx,'#/manual');await visible(p,'.silm-manual-card');
   const h=await p.evaluate(()=>{const v=document.getElementById('silm-manual'),r=el=>el.getBoundingClientRect();const ids=new Set(SILM.manual.topics.map(t=>t.id));
    return {h1:v.querySelector('.silm-manual-hero h1').textContent,search:!!v.querySelector('label[for="manual-search"]'),buttonRight:r(v.querySelector('.silm-manual-search button')).right,
     quick:[...v.querySelectorAll('.silm-manual-quick a')].map(a=>a.getAttribute('href')),groups:[...v.querySelectorAll('.silm-manual-group h2')].map(x=>x.textContent),
     cards:[...v.querySelectorAll('.silm-manual-card')].map(a=>decodeURIComponent(a.getAttribute('href').split('topico=')[1]||'')),topics:[...ids],
     targets:[...v.querySelectorAll('.silm-manual-bar .button, .silm-manual-bar input, .silm-manual-hero .button, .silm-manual-quick a, .silm-manual-card')].map(x=>r(x).height),overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.equal(h.h1,'Encontre seu próximo passo.');assert.equal(h.search,true,'Busca rotulada');assert.ok(h.buttonRight<=width+1,'Botão Buscar visível em '+where);
   assert.equal(h.quick.length,3,'Três atalhos "Quero saber"');assert.deepEqual(h.groups,['Investigue','Prepare e registre','Orientação','Para ensinar']);
   assert.deepEqual([...h.cards].sort(),[...h.topics].sort(),'Todo tópico aparece uma vez nos grupos, com destino válido');
   for(const t of h.targets)assert.ok(t>=44,'Alvos com 44 px em '+where+': '+t);
   assert.ok(h.overflow<=1,'Sem rolagem lateral em '+where+': '+h.overflow+' px');
  }finally{await ctx.close();}
 }
 /* 2. Tópico, retorno, busca, vazio, alias, endereço antigo, tópico inexistente, ajuda contextual e impressão. */
 const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 try{
  const p=await open(ctx,'#/manual');await visible(p,'.silm-manual-card');
  await p.locator('.silm-manual-card[href$="topico=medir"]').click();await p.waitForFunction(()=>document.activeElement?.id==='manual-title','',{timeout:4000});
  assert.equal((await p.locator('.silm-manual-breadcrumb').textContent()).replace(/\s*\/\s*/g,' / ').trim(),'Manual / Investigue / Medir: instrumentos e medições do modelo');
  assert.equal(await p.locator('#manual-print').innerText(),'Imprimir tópico');
  const related=await p.evaluate(()=>{const ids=new Set(SILM.manual.topics.map(t=>t.id));return [...document.querySelectorAll('.silm-manual-related a')].map(a=>ids.has(decodeURIComponent(a.getAttribute('href').split('topico=')[1])));});
  assert.ok(related.length>0&&related.every(Boolean),'"Veja também" só com tópicos existentes');
  await p.emulateMedia({media:'print'});assert.equal(await p.locator('.silm-manual-bar').isVisible(),false,'Barra fora da impressão');await p.emulateMedia({media:null});
  await p.locator('#manual-back').click();await p.waitForFunction(()=>location.hash==='#/manual'&&document.querySelector('.silm-manual-hero'));
  await p.goBack();await p.waitForFunction(()=>new URLSearchParams(location.hash.split('?')[1]||'').get('topico')==='medir');await visible(p,'.silm-manual-article');
  // Busca com resultado, sem resultado e limpar.
  await p.locator('#manual-search').fill('caderno');await p.locator('#manual-search').press('Enter');await p.waitForFunction(()=>location.hash.includes('busca=caderno'));
  await visible(p,'.silm-manual-results');assert.match(await p.locator('#manual-title').innerText(),/Resultados para “caderno”/);assert.match(await p.locator('.silm-manual-results').innerText(),/Usar o Caderno/);
  await p.locator('#manual-search').fill('xyzzy');await p.getByRole('button',{name:'Buscar',exact:true}).click();await p.waitForFunction(()=>/Nenhum resultado/.test(document.getElementById('manual-title')?.textContent||''),'',{timeout:4000});
  await p.getByRole('link',{name:'Limpar busca'}).click();await p.waitForFunction(()=>location.hash==='#/manual');
  // Alias, endereço antigo e tópico inexistente.
  await p.goto(base+'#/manual?topico=zoom');await p.waitForFunction(()=>/Mover a vista/.test(document.getElementById('manual-title')?.textContent||''),'',{timeout:4000});
  await p.goto(base+'#/manual/calcular');await p.waitForFunction(()=>/Calcular/.test(document.getElementById('manual-title')?.textContent||''),'',{timeout:4000});
  await p.goto(base+'#/manual?topico=nao-existe');await p.waitForFunction(()=>document.getElementById('manual-title')?.textContent==='Tópico não encontrado','',{timeout:4000});
  // Ajuda contextual: o painel Estrutura e representação leva ao tópico da vista.
  assert.ok(await p.evaluate(()=>!!document.querySelector('a[href="#/manual?topico=vista"]')),'Ajuda contextual aponta para um tópico do Manual');
 }finally{await ctx.close();}
 assert.deepEqual(errors,[]);
 console.log('PASS TEST-MANUAL: início, grupos e atalhos em 5 tamanhos, tópico com caminho e "Veja também", retorno, busca e vazio, alias, endereço antigo, tópico inexistente e impressão.');
};
