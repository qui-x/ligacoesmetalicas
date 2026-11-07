'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalogue=JSON.parse(read('research/microstructure/coverage-65.json'));
const sandbox={window:{}};
vm.runInNewContext(read('domain/silm/microstructure-study-context.js'),sandbox);
const ctx=sandbox.window.SILM.microstructureStudies;
const asJSON=o=>JSON.parse(JSON.stringify(o));

test('transposição leve mantém exatamente 67 fontes e 65 relações com elementos',()=>{
 assert.equal(ctx.schema,'silm.microstructure-candidate-context.v1');
 assert.equal(ctx.evidenceLevel,'D0-literature-context-only');
 assert.equal(ctx.studies.length,catalogue.experimentalLeads.length);
 assert.equal(ctx.studies.length,67);
 assert.equal(ctx.atomicNumbers.length,65);
 for(const rec of catalogue.records){
  const related=asJSON(ctx.forElement(rec.atomicNumber));
  assert.deepEqual(related.map(s=>s.id),rec.microstructure.experimentalCandidateLeadIDs);
  assert.ok(related.length>=1,rec.symbol);
  for(const candidate of related){
   const original=catalogue.experimentalLeads.find(s=>s.id===candidate.id);
   assert.ok(original,rec.symbol+' apresenta estudo inexistente');
   assert.equal(candidate.name,original.dataset);
   assert.equal(candidate.materialKind,original.specimenClass);
   assert.equal(candidate.technique,original.technique);
   assert.equal(candidate.url,original.url);
   assert.equal(candidate.caveat,original.comment);
   assert.equal(candidate.review,original.recordStatus);
   assert.deepEqual(candidate.topics,original.supports);
   assert.equal(candidate.scope,original.evidenceScope||null);
  }
 }
 assert.deepEqual(asJSON(ctx.forElement(1)),[]);
 assert.deepEqual(asJSON(ctx.forElement(999)),[]);
 assert.equal(new Set(ctx.studies.map(s=>s.id)).size,67);
});

test('material de liga, cerâmica, depósito e metal puro não se confundem',()=>{
 const mg=ctx.forElement(12).find(s=>s.id==='mg-grain-ebsd-az31');
 const cu=ctx.forElement(29).find(s=>s.id==='cu-polycrystal-ebsd');
 const fe=ctx.forElement(26).find(s=>s.id==='fe-316l-correlative');
 assert.ok(mg&&cu&&fe);
 assert.match(ctx.describe(mg),/Liga/);
 assert.match(ctx.describe(fe),/Liga/);
 assert.match(ctx.describe(cu),/elementar/);
 assert.match(ctx.caveat(cu),/não valida a geometria/);
 assert.ok(ctx.topicLabels(cu).includes('contornos de grão'));
 assert.ok(ctx.topicLabels(mg).includes('diâmetro equivalente de grão'));
 assert.ok(!ctx.topicLabels(cu).some(s=>/\d+\s*µm|%/.test(s)));
 const radioactive=catalogue.experimentalLeads.find(s=>s.id==='ra-in-barite-apt-2016');
 assert.ok(radioactive);
 const mapped=ctx.studies.find(x=>x.id===radioactive.id);
 assert.match(ctx.describe(mapped),/Material composto|Material relacionado/);
 assert.match(ctx.caveat(mapped),/não documenta grãos|não valida/);
});

test('metadados são somente contexto: sem morfologia, escala, concentração ou aprovação experimental',()=>{
 for(const e of ctx.studies){
  assert.match(e.url,/^https:\/\//);
  for(const bad of ['grainSizeMicrometers','phaseFraction','compositionPercent','grainPolygon',
                    'experimentalImage','approvedForMain','schematicProfile'])
   assert.ok(!Object.hasOwn(e,bad),'Estudo '+e.id+' contém valor não homologado: '+bad);
 }
 assert.ok(Object.isFrozen(ctx.studies));
 assert.equal(catalogue.coverage.experimentalMicrostructureDatasetsIntegrated,0);
 const view=read('domain/silm/microstructure-view.js');
 const generator=read('domain/silm/microstructure-synthetic.js');
 assert.match(view,/silm-micro-study-context/);
 assert.match(view,/Estudos sobre materiais que contêm o elemento/);
 assert.match(view,/Nenhum deles define os grãos deste desenho/);
 assert.ok(view.includes('SILM.microstructureStudies?.forElement?.('));
 assert.ok(!generator.includes('microstructureStudies'),
  'O gerador geométrico não pode adaptar a geometria à fonte não homologada');
});

test('aplicação e serviço offline carregam o catálogo com ordem de dependências',()=>{
 const html=read('index.html');
 const context='domain/silm/microstructure-study-context.js';
 const synthetic='domain/silm/microstructure-synthetic.js';
 const visual='domain/silm/microstructure-view.js';
 assert.ok(html.includes(context));
 assert.ok(html.indexOf(synthetic)<html.indexOf(context)&&html.indexOf(context)<html.indexOf(visual),
  'Carregar estudos antes da interface mas após o gerador');
 const sw=read('sw.js');
 assert.ok(sw.includes('"'+context+'"'),'Catálogo não pode desaparecer em uso offline');
});
