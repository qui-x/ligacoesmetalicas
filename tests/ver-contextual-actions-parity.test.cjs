'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'integracao/workspace-family.js'),'utf8');

test('Ver consulta a escala atual antes de construir ações contextuais',()=>{
 assert.match(source,/const stageScale=Number\(document\.getElementById\('si-stage'\)\?\.dataset\.workshopScale\|\|0\)/);
 assert.match(source,/const showCenterControls=stageScale===0\|\|stageScale===3/);
 assert.match(source,/const showCrystalControls=stageScale===3/);
 assert.match(source,/if\(showCenterControls\)\{\s*const structureActions=actionGroup\(root,'Centros metálicos'\)/);
 assert.match(source,/if\(showCrystalControls\)\{\s*const crystalActions=actionGroup\(root,'Célula e rede cristalina'\)/);
 assert.match(source,/if\(stageScale===0\|\|stageScale>=3\)\{\s*const interactionActions=actionGroup\(root,'Interação metálica'\)/);
});

test('Propriedades permanecem disponíveis no Explorar e não mudam motores',()=>{
 assert.match(source,/const propertyActions=actionGroup\(root,'Propriedades metálicas'\)/);
 for(const key of ['electrical','thermal','malleability','ductility','luster'])assert.ok(source.includes("['"+key+"'"),key);
 assert.match(source,/quickActions\?\.toggleProperty\?\.\(id\)/);
 assert.match(source,/propertyCombinations/);
 assert.match(source,/const firstFamily=\{explorar:'observar',medir:'medir',calcular:'calcular'\}/);
});
