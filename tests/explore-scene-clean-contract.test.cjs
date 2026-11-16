'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=p=>fs.readFileSync(path.join(root,p),'utf8');
const lab=file('domain/silm/lab3d.js');
const css=file('domain/silm/lab3d.css');
const dock=file('integracao/workspace-family.js');
const micro=file('domain/silm/microstructure-view.js');
test('A cena 3D começa sem painéis técnicos expandidos',()=>{
 assert.match(lab,/const maps=make\('details','silm-lab3d-map-panel'\)/);
 assert.match(lab,/const quick=make\('details','silm-lab3d-quick'\)/);
 assert.doesNotMatch(lab,/quick\.open\s*=\s*true/);
 assert.doesNotMatch(lab,/maps\.open\s*=\s*true/);
 assert.match(css,/\.silm-lab3d-quick:not\(\[open\]\) \.silm-lab3d-quick-items\{display:none\}/);
});
test('Ações alternativas e leituras são mutuamente exclusivas com o instrumento',()=>{
 assert.match(lab,/quick\.addEventListener\('toggle'/);
 assert.match(lab,/maps\.addEventListener\('toggle'/);
 assert.match(lab,/this\.quickControls\.open=false/);
 assert.match(lab,/this\.mapPanel\.open=false/);
 assert.match(lab,/this\.instrumentPanel\.hidden=false/);
 assert.match(lab,/hideInstrument\(\{restoreFocus=true\}=\{\}\)/);
});
test('Instrumentos são gestos principais; alternativas mantêm os controles legados',()=>{
 assert.match(lab,/this\.button\(quickItems,'Diminuir carga','less'/);
 assert.match(lab,/this\.button\(quickItems,'Aumentar carga','more'/);
 assert.match(lab,/this\.button\(quickItems,'Alternar tração e compressão','mode'/);
 assert.match(lab,/this\.button\(quickItems,'Microscópio','micro'/);
 assert.match(lab,/showInstrument\(id\)/);
 assert.match(css,/\.silm-lab3d-quick-items button\{min-height:44px/);
});
test('Seleção de combinação é visível sem Ctrl e preserva regras físicas',()=>{
 assert.match(dock,/touchModeButton\.hidden=false/);
 assert.match(dock,/Combinar propriedades/);
 assert.match(dock,/const propertyCombinations=\{/);
 assert.match(dock,/combina[cç][aã]o n[aã]o homologada/i);
 assert.match(dock,/quickActions\?\.activateCombination/);
});
test('A microestrutura prioriza grãos, com estado curto e J2 sob demanda',()=>{
 assert.match(micro,/const contactDetails=node\('details','silm-micro-contact-details'\)/);
 assert.match(micro,/Ajustes e leituras do ensaio/);
 assert.match(micro,/modelo did[aá]tico, sem MPa/);
 assert.match(micro,/toolbar\.append\(mechanicalTools\)/);
 assert.match(micro,/section\.append\(viewport,toolbar,genDialog,dataDialog\)/);
});
test('Layout mantém cena e controles de toque sem overflow de interface',()=>{
 assert.match(css,/\.silm-lab3d-map-panel\[open\]/);
 assert.match(css,/max-height:min\(48%,350px\)/);
 assert.match(css,/\.silm-lab3d-controls\{bottom:66px\}/);
 assert.match(css,/\.silm-lab3d-quick-summary:focus-visible/);
 assert.match(css,/@media\(forced-colors:active\)/);
});
