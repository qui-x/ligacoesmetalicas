'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
function run(rel,ctx){vm.runInNewContext(fs.readFileSync(path.join(ROOT,rel),'utf8'),ctx,{filename:rel});}
const window={SILM:{}},ctx={window,SILM:window.SILM,document:{}};
run('domain/silm/metal-atlas.js',ctx);
run('domain/silm/workshop.js',ctx);
const catalog=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/metal-atlas/manifest.json'),'utf8'));
const app=window.SILM.metalAtlas,workshop=window.SILM.workshop;
test('Atlas oferece uma aplicação distinta para cada um dos 65 metais habilitados',()=>{
 assert.equal(app.validate(),true);
 assert.equal(app.entries.length,65);
 assert.equal(workshop.atlasReferences.length,65);
 assert.equal(workshop.originalReferences.length,8);
 assert.equal(workshop.references.length,73);
 assert.equal(workshop.valid(),true);
 assert.equal(new Set(app.entries.map(x=>x.atomicNumber)).size,65);
 for(const metal of app.entries){
  const refs=workshop.list(metal.atomicNumber);
  assert.equal(refs.filter(x=>x.atlasPath).length,1,metal.symbol);
  assert.equal(workshop.get('atlas-'+metal.symbol.toLowerCase()).atomicNumber,metal.atomicNumber);
  assert.equal(refs.find(x=>x.atlasPath)?.atlasPath,metal.path);
  assert.ok(fs.existsSync(path.join(ROOT,metal.path)),metal.path);
  assert.match(metal.sourceType,/AI_GENERATED/);
  assert.ok(metal.caveat&&metal.application&&metal.referenceURL);
 }
 assert.equal(workshop.list(26).filter(x=>!x.atlasPath).length,2,'Preservar estudos do ferro');
 assert.equal(workshop.list(79).length,1,'Ouro não deve ficar sem aplicação');
 assert.equal(workshop.list(95).length,1,'Amerício não deve ficar sem aplicação');
});
test('Imagens da aplicação correspondem aos bytes publicados no manifesto',()=>{
 assert.equal(catalog.metalImages.length,65);
 for(const item of catalog.metalImages){
  const data=fs.readFileSync(path.join(ROOT,item.path));
  assert.equal(data.length,item.imageBytes,item.path);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),item.imageSHA256,item.path);
 }
});
test('Vinte modelos de grãos ficam separados de micrografias experimentais',()=>{
 assert.equal(app.microEntries.length,20);
 assert.equal(catalog.microstructures.length,20);
 for(const record of app.microEntries){
  assert.ok(fs.existsSync(path.join(ROOT,record.path)),record.path);
  const source=catalog.microstructures.find(x=>x.atomicNumber===record.atomicNumber);
  assert.equal(source?.isMeasuredMicrograph,false);
  assert.equal(source?.hasChemicalMap,false);
  assert.equal(source?.physicalScale,null);
 }
 assert.equal(app.micro(79),null,'Não inventar microestrutura experimental do ouro');
});
