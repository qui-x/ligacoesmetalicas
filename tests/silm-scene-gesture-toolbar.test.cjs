'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),camera=read('domain/silm/renderer-2d.js'),
 crystal=read('domain/silm/crystal-view.js'),menu=read('integracao/toolbar-scroll.js'),
 lab=read('domain/silm/lab3d.js'),micro=read('domain/silm/microstructure-view.js');
test('Barra inferior oferece câmera e ferramentas contextuais sem rolagem de botões',()=>{
 assert.match(html,/id="silm-scene-toolbox"/);
 assert.match(html,/id="silm-scene-toolbox-panel"/);
 assert.match(menu,/document\.body\.append\(panel\)/);
 assert.doesNotMatch(menu,/Mostrar próximas ferramentas|Mostrar ferramentas anteriores/);
 assert.match(camera,/silm-camera-advanced/);
 assert.match(crystal,/secondaryTools\.append\(navigator\.root\)/);
 assert.match(crystal,/sceneActionbar\.append\(jouleControls\)/);
});
test('Controle gestual e ajustes numéricos precisos permanecem disponíveis',()=>{
 assert.match(lab,/this\.pressLoad\.type='number'/);
 assert.match(lab,/this\.powerIntensity\.type='number'/);
 assert.match(lab,/this\.onInstrumentPointerMove/);
 assert.match(micro,/forceInput\.type='number'/);
 assert.match(micro,/angleInput\.type='number'/);
 assert.match(micro,/dragged\.axis==='width'/);
});
