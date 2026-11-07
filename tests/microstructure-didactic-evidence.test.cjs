'use strict';
// SILM — contrato para 65 representações de grãos com embasamento didático D0.
// Este teste não promove fontes candidatas a evidência de micrografia real.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=JSON.parse(read('research/microstructure/coverage-65.json'));
const manifest=JSON.parse(read('research/microstructure/didactic-evidence-65.json'));
const atlas=read('domain/silm/metal-atlas.js');
const view=read('domain/silm/microstructure-view.js');

test('Cobertura D0 é exatamente a dos 65 elementos investigáveis sem títulos experimentais',()=>{
 assert.equal(manifest.schema,'silm.didactic-grain-evidence-65.v1');
 assert.equal(manifest.records.length,65);
 assert.deepEqual(manifest.records.map(x=>x.atomicNumber),
                  source.records.map(x=>x.atomicNumber));
 assert.deepEqual(manifest.records.map(x=>x.symbol),source.records.map(x=>x.symbol));
 assert.equal(new Set(manifest.records.map(x=>x.symbol)).size,65);
 assert.equal(manifest.totals.investigableElements,65);
 assert.equal(manifest.totals.experimentallyApprovedGrainRepresentations,0);
 assert.equal(manifest.records.filter(x=>x.grainRepresentation.specificIllustration!==null).length,20);
 assert.equal(manifest.records.filter(x=>x.candidateStudyIDs.length>0).length,65);
});

test('Cada elemento mantém fontes de cristalografia, aplicação e restrição de grãos reais',()=>{
 for(let i=0;i<65;i++){
  const rec=source.records[i],m=manifest.records[i];
  assert.equal(m.crystallographicReference.type,rec.referenceCrystal.type);
  assert.equal(m.crystallographicReference.spaceGroupNumber,rec.referenceCrystal.spaceGroupNumber);
  assert.equal(m.crystallographicReference.sourceURL,rec.referenceCrystal.sourceURL);
  assert.equal(m.crystallographicReference.temperatureK,rec.referenceCrystal.temperatureK);
  assert.match(m.crystallographicReference.sourceURL,/^https:\/\//);
  assert.equal(m.everydayContext.materialClass,rec.everydayAtlas.materialClass);
  assert.equal(m.everydayContext.materialCategory,rec.everydayAtlas.materialCategoryAsPublished);
  assert.equal(m.everydayContext.applicationCaveat,rec.everydayAtlas.caveat);
  assert.equal(m.everydayContext.illustration,rec.everydayAtlas.illustration);
  assert.equal(m.grainRepresentation.specificIllustration,
               rec.microstructure.specificSchematicImage);
  assert.deepEqual(m.candidateStudyIDs,rec.microstructure.experimentalCandidateLeadIDs);
  assert.equal(m.grainRepresentation.evidenceLevel,'D0-schematic-conceptual');
  assert.equal(m.grainRepresentation.generator,'silm-voronoi-v1');
  for(const key of ['grainMorphologyVerifiedForElement','grainMorphologyVerifiedForApplication',
                    'experimentalSampleIntegrated','quantitativeMeasurementsApproved','colourEncodesComposition']){
   assert.equal(m.grainRepresentation[key],false,m.symbol+' não pode afirmar '+key);
  }
  assert.ok(!Object.hasOwn(m.grainRepresentation,'grainDiameterMicrometers'));
  assert.ok(!Object.hasOwn(m.grainRepresentation,'compositionPercent'));
  assert.ok(!Object.hasOwn(m.grainRepresentation,'phaseFraction'));
  for(const k of Object.values(m.futureReview)) assert.equal(k,'pending');
 }
 assert.match(atlas,/const microEntries=/,'As 20 imagens específicas seguem separadas das referências experimentais.');
});

test('A interface explicita fonte e limitações no modal, mantendo o desenho livre',()=>{
 assert.match(view,/dataset\.didacticEvidenceLevel='D0-schematic-conceptual'/);
 assert.match(view,/className|silm-micro-didactic-evidence/);
 assert.match(view,/A geometria é ilustrativa:/);
 assert.match(view,/Fonte cristalográfica|fonte cristalográfica/);
 assert.match(view,/Contexto de aplicação no atlas/);
 assert.match(view,/Estudos candidatos não são parâmetros do gerador/);
 assert.match(view,/dataDialog\.append\(dataTitle,dataHelp,evidence,fileLabel/);
 assert.match(view,/dataset\.measurementStatus='unavailable'/);
 assert.match(view,/Grãos e tons ilustrativos; sem composição, fração de fase ou tamanho medidos/);
});

test('Não promover estudo candidato a D1/D2 apenas por DOI ou imagem gerada',()=>{
 assert.equal(source.coverage.experimentalMicrostructureDatasetsIntegrated,0);
 for(const r of manifest.records){
  assert.ok(r.candidateStudyIDs.every(id=>source.experimentalLeads.some(x=>x.id===id)));
  assert.equal(r.grainRepresentation.experimentalSampleIntegrated,false);
  assert.equal(r.grainRepresentation.quantitativeMeasurementsApproved,false);
 }
});
