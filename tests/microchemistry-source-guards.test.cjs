'use strict';
// Validação independente dos dados de composição: node tests/microchemistry-source-guards.test.cjs
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {runInNewContext}=require('node:vm');
const {join}=require('node:path');
const root=join(__dirname,'..');
const window={SILM:{}};
const sandbox={window,SILM:window.SILM,document:{}};
runInNewContext(readFileSync(join(root,'domain/silm/workshop.js'),'utf8'),sandbox,{filename:'workshop.js'});
const refs=window.SILM.workshop.references;
const families=window.SILM.workshop.microChemistry;
assert.equal(refs.length,9,'Oito referências originais e a amostra publicada de Rb devem estar presentes.');
for(const ref of refs){
 const sample=families[ref.id];
 assert.ok(sample,'Falta catálogo para '+ref.id);
 assert.ok(['material','alloy-family','alloy-sample'].includes(sample.kind),'Classe do material inválida');
 assert.ok(sample.note&&sample.label&&Array.isArray(sample.constituents));
 assert.ok(sample.constituents.length>=1);
 const ids=new Set();
 for(const constituent of sample.constituents){
  assert.match(constituent.symbol,/^[A-Z][a-z]?$/);
  assert.ok(!ids.has(constituent.symbol),'Símbolo repetido em '+ref.id);
  ids.add(constituent.symbol);
  assert.ok(constituent.name&&constituent.role);
  assert.ok(['base','possible'].includes(constituent.certainty));
  assert.ok(!('wt_pct' in constituent||'at_pct' in constituent||'regionFraction' in constituent),
   'Composição local fictícia no catálogo');
 }
}
const research=JSON.parse(readFileSync(join(root,'docs/atlas-microestruturas-amostras-curadas.json'),'utf8'));
assert.equal(research.schemaVersion,1);
assert.ok(Array.isArray(research.samples)&&research.samples.length>=1);
for(const specimen of research.samples){
 assert.equal(specimen.display.enabled,false,'Fonte sem direitos/escala não pode aparecer como imagem experimental');
 assert.equal(specimen.microstructure.measuredGrainComposition,null);
 assert.equal(specimen.microstructure.calibratedImagePath,null);
 assert.equal(specimen.microstructure.mapping.aligned,false);
 assert.ok(specimen.source.doi);
}
console.log('OK — constituintes de 9 referências; prévia da fonte permitida, composição espacial sem calibração bloqueada.');
