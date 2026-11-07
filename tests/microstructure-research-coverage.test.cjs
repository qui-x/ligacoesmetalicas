'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const coverage=JSON.parse(read('research/microstructure/coverage-65.json'));
const bundle=read('domain/silm/data/bundle.js');
const dataset=JSON.parse(bundle.slice(bundle.indexOf('SILM.scientificData=')+'SILM.scientificData='.length).trim().replace(/;$/,''));
const source=read('domain/silm/metal-atlas.js');
function arrayInSource(name){
 const pos=source.indexOf(' const '+name+'=');
 assert.ok(pos>=0,'Não encontrou '+name);
 const start=source.indexOf('[',pos);
 let depth=0,inString=false,escaped=false;
 for(let i=start;i<source.length;i++){
  const ch=source[i];
  if(inString){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')inString=false;continue;}
  if(ch==='"'){inString=true;continue;}
  if(ch==='[')depth++;
  if(ch===']'&&--depth===0)return JSON.parse(source.slice(start,i+1));
 }
 throw new Error('Matriz '+name+' ilegível.');
}
const atlas=arrayInSource('entries');
const micro=arrayInSource('microEntries');
test('Todos os 65 metais investigáveis aparecem uma vez e somente eles',()=>{
 const available=dataset.elements.filter(x=>x.silmEligibility.status==='available');
 assert.equal(available.length,65);
 assert.equal(coverage.schema,'silm.microstructure-research-coverage.v1');
 assert.equal(coverage.coverage.investigableElements,available.length);
 assert.equal(coverage.records.length,available.length);
 assert.equal(new Set(coverage.records.map(e=>e.symbol)).size,65);
 assert.equal(new Set(coverage.records.map(e=>e.atomicNumber)).size,65);
 assert.deepEqual(coverage.records.map(e=>e.atomicNumber),available.map(e=>e.atomicNumber));
});
test('Atlas e cristalografia cruzados por Z e fonte com método experimental',()=>{
 const byZ=new Map(atlas.map(e=>[e.atomicNumber,e]));
 const mBy=new Map(micro.map(e=>[e.atomicNumber,e]));
 const validSources=new Map(dataset.sources.map(s=>[s.id,s]));
 assert.equal(byZ.size,65);assert.equal(mBy.size,20);
 for(const record of coverage.records){
  const element=dataset.elements.find(e=>e.atomicNumber===record.atomicNumber);
  assert.equal(record.name,element.name);
  assert.equal(record.symbol,element.symbol);
  const ref=element.structures.find(s=>s.id===element.referenceStructure);
  assert.ok(ref,record.symbol+' sem estrutura');
  assert.equal(ref.evidenceType,'experimental');
  assert.equal(ref.type,record.referenceCrystal.type);
  assert.equal(ref.spaceGroupNumber,record.referenceCrystal.spaceGroupNumber);
  assert.equal(ref.sourceId,record.referenceCrystal.sourceId);
  assert.equal(validSources.get(ref.sourceId)?.url,record.referenceCrystal.sourceURL);
  const application=byZ.get(element.atomicNumber);
  assert.ok(application,record.symbol+' sem aplicação');
  assert.equal(record.everydayAtlas.application,application.application);
  assert.equal(record.everydayAtlas.materialCategoryAsPublished,application.materialCategory);
  assert.equal(record.everydayAtlas.illustration,application.path);
  assert.equal(record.everydayAtlas.caveat,application.caveat);
  assert.equal(record.microstructure.specificSchematicImage,mBy.get(element.atomicNumber)?.path??null);
  assert.ok(record.everydayAtlas.materialClass);
 }
});
test('Fontes candidatas não homologam micrografias nem porcentagens artificiais',()=>{
 const leads=new Map(coverage.experimentalLeads.map(e=>[e.id,e]));
 assert.equal(leads.size,coverage.experimentalLeads.length);
 assert.equal(coverage.coverage.experimentalMicrostructureDatasetsIntegrated,0);
 for(const lead of leads.values()){
  assert.match(lead.url,/^https:\/\//);
  assert.equal(lead.rawFilesAudited,false);
  assert.equal(lead.licenseAudited,false);
  assert.equal(lead.appSpecimenMatchVerified,false);
  assert.ok(lead.specimenClass&&lead.technique&&lead.comment);
  assert.ok(lead.elements.length>0);
 }
 for(const rec of coverage.records){
  const m=rec.microstructure;
  assert.equal(m.experimentalSampleIntegrated,false);
  assert.equal(m.segmentedExperimentalMicrographIntegrated,false);
  assert.equal(m.quantitativeGrainDataVerified,false);
  assert.equal(m.applicationMatchedSpecimenValidated,false);
  assert.equal(m.interactiveSyntheticModel,'silm-voronoi-v1');
  assert.ok(['identified-not-audited','search-needed'].includes(m.candidateReviewStatus));
  assert.equal(m.candidateReviewStatus,m.experimentalCandidateLeadIDs.length?'identified-not-audited':'search-needed');
  for(const id of m.experimentalCandidateLeadIDs){
   assert.ok(leads.has(id),'Fonte desconhecida '+id);
   assert.ok(leads.get(id).elements.includes(rec.symbol),'Fonte não corresponde ao elemento '+rec.symbol);
  }
  assert.ok(!Object.hasOwn(m,'elementPercent'));
  assert.ok(!Object.hasOwn(m,'phaseFraction'));
 }
 assert.equal(coverage.coverage.candidateStudyRecords,leads.size);
 assert.equal(coverage.coverage.elementsWithCandidateLeads,
  coverage.records.filter(x=>x.microstructure.experimentalCandidateLeadIDs.length>0).length);
 assert.equal(coverage.coverage.elementsPendingSpecificLead,
  coverage.records.filter(x=>!x.microstructure.experimentalCandidateLeadIDs.length).length);
});
test('Alcance bibliográfico 65/65 não implica micrografias homologadas',()=>{
 assert.equal(coverage.coverage.candidateStudyRecords,65);
 assert.equal(coverage.coverage.elementsWithCandidateLeads,65);
 assert.equal(coverage.coverage.elementsPendingSpecificLead,0);
 assert.equal(coverage.coverage.experimentalMicrostructureDatasetsIntegrated,0);
 assert.equal(coverage.coverage.elementalMetalGrainDatasetsValidatedAndIntegrated,0);
 for(const r of coverage.records)
  assert.ok(r.microstructure.experimentalCandidateLeadIDs.length>=1,r.symbol+' sem referência');
 const ra=coverage.experimentalLeads.find(x=>x.id==='ra-in-barite-apt-2016');
 const ac=coverage.experimentalLeads.find(x=>x.id==='ac-spion-theranostic-2025');
 const po=coverage.experimentalLeads.find(x=>x.id==='po-archival-film-photomicrograph-1946');
 assert.match(ra.evidenceScope,/no-metal-grain-map/);
 assert.match(ac.evidenceScope,/no-elemental-metal-grains/);
 assert.match(po.recordStatus,/not-independently-verified/);
});
test('Matriz legível e índice computável possuem a mesma cobertura e as mesmas fontes',()=>{
 const md=read('docs/SILM-MATRIZ-65-ELEMENTOS-APLICACAO-REDE-MICROESTRUTURA.md');
 const counts=[
  ['Registros de estudos/fontes candidatos para microestrutura',coverage.coverage.candidateStudyRecords],
  ['Elementos associados a pelo menos um estudo ou dataset candidato',coverage.coverage.elementsWithCandidateLeads],
  ['Elementos sem fonte específica candidata confirmada na triagem',coverage.coverage.elementsPendingSpecificLead]
 ];
 for(const [label,num] of counts)
  assert.ok(md.includes('| '+label+' | **'+num+'** |'),'Resumo da pesquisa desatualizado: '+label);
 for(const entry of coverage.experimentalLeads){
  assert.ok(md.includes('\\`'+entry.id+'\\`')||md.includes('`'+entry.id+'`'),'Referência ausente na tabela: '+entry.id);
  assert.ok(md.includes(entry.url),'URL da fonte ausente: '+entry.id);
 }
 for(const record of coverage.records){
  const row=md.split(String.fromCharCode(10)).find(line=>line.startsWith('| '+record.atomicNumber+' | **'+record.symbol+'**'));
  assert.ok(row,'Elemento sem linha: '+record.symbol);
  const expected=record.microstructure.experimentalCandidateLeadIDs;
  for(const id of expected)assert.ok(row.includes('['+id+']('),'Referência '+id+' não mapeada em '+record.symbol);
  if(!expected.length)assert.ok(row.includes('**Pendente**'),record.symbol+' sem indicação de lacuna.');
 }
});
test('Matéria documentada também engloba elementos sem fonte micrográfica específica',()=>{
 const md=read('docs/SILM-MATRIZ-65-ELEMENTOS-APLICACAO-REDE-MICROESTRUTURA.md');
 for(const el of coverage.records){
  assert.ok(md.includes('| '+el.atomicNumber+' | **'+el.symbol+'**'),el.symbol+' ausente da tabela documental');
 }
 assert.match(md,/sem micrografia homologada/);
});
