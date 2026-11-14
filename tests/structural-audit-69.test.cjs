'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const audit=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/science/silm-etapa69-cobertura-92-metais.json'),'utf8'));
const src=fs.readFileSync(path.join(ROOT,'domain/silm/data/bundle.js'),'utf8');
const key='SILM.scientificData=';
const idx=src.indexOf(key);
assert.ok(idx>=0,'scientific bundle not found');
const scientific=JSON.parse(src.slice(idx+key.length).trim().replace(/;\s*$/,''));
const current=scientific.elements.filter(e=>e.classification?.metallic);
const gapSymbols=['Hg','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv'];
test('auditoria cruza os mesmos 92 metais presentes na main',()=>{
 assert.equal(scientific.elements.length,118);
 assert.equal(current.length,92);
 assert.equal(audit.baselineMetals.length,92);
 assert.deepEqual(audit.baselineMetals.map(e=>e.symbol),current.map(e=>e.symbol));
 assert.equal(audit.counts.availableMetals,79);
 assert.equal(audit.counts.blockedMetals,13);
 assert.deepEqual(audit.blockedAudit.map(x=>x.symbol),gapSymbols);
});
test('candidatos nunca sobrescrevem elegibilidade e fases do motor',()=>{
 for(const el of current){
  const row=audit.baselineMetals.find(x=>x.symbol===el.symbol);
  assert.equal(row.eligibility,el.silmEligibility.status,el.symbol);
  assert.equal(row.reasonCode,el.silmEligibility.reasonCode,el.symbol);
  const reference=el.structures?.find(s=>s.id===el.referenceStructure);
  assert.equal(row.hasReferenceStructure,!!reference,el.symbol);
 }
 assert.equal(audit.release.engineActivationAllowed,false);
 assert.equal(audit.release.eligibilityUnchanged,true);
 assert.equal(audit.release.newCNTPStructuresHomologated,0);
});
test('a fase α do Hg não é confundida com CNTP e Cn tem conflito teórico',()=>{
 const hg=audit.blockedAudit.find(x=>x.symbol==='Hg');
 assert.equal(hg.review,'FASE_EXPERIMENTAL_FRIA_NAO_CNTP');
 assert.equal(hg.candidatePhases[0].referencePhaseAt273K,false);
 assert.equal(hg.candidatePhases[0].primitiveA_Angstrom,3.005);
 const cn=audit.blockedAudit.find(x=>x.symbol==='Cn');
 assert.equal(cn.review,'CONFLICTING_PREDICTED_PHASES');
 assert.deepEqual(cn.candidatePhases.map(x=>x.structure),['HC','CCC']);
 for(const row of audit.blockedAudit){
  assert.equal(row.enableForCrystalStudy,false,row.symbol);
  assert.equal(row.homologatedAtCNTP,false,row.symbol);
 }
});
test('13 metais habilitados não pertenciam à pesquisa de 65 nem às terras-raras',()=>{
 const missing=audit.baselineMetals.filter(x=>x.eligibility==='available'&&!x.hasMechanicalResearchMatrix65&&!x.hasRareEarthCompendium66);
 assert.deepEqual(missing.map(x=>x.symbol),['Ga','In','Fr','U','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf']);
 assert.equal(audit.counts.uniqueMetalsInResearchMatrixAndRareEarthCatalog,66);
});
