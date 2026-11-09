// Contratos estáticos para impedir a volta de falhas de CSS e cache PWA.
// As validações visuais reais são feitas por run-cross-regressions.mjs.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const load=path=>readFileSync(path,'utf8');

test('Foco e Visão geral têm uma regra de ocultação mais específica',()=>{
 const css=load('domain/silm/workshop.css');
 assert.match(css,/#si-workspace\s+#si-stage\s+#workspace-focus\[hidden\]\s*,/m);
 assert.match(css,/#si-workspace\s+#si-stage\s+#workspace-overview\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/);
 const blocks=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
 // Nunca voltar a aplicar display:flex!important no Foco sem verificar
 // se o atributo hidden está presente. Foi essa a regressão de 09/11.
 for(const [,selector,body] of blocks){
  if(!selector.includes('#si-stage')||!selector.includes('#workspace-focus'))continue;
  if(!/display\s*:\s*(?:flex|grid|block)\s*!important/.test(body))continue;
  assert.ok(selector.includes(':not([hidden])'),
   'Uma regra do palco força o Foco visível quando hidden: '+selector.trim());
 }
});
test('Roteadores não removem o estado hidden dos dois modos',()=>{
 const shell=load('integracao/base-core.js');
 assert.match(shell,/el\.hidden\s*=\s*workspaceState\.view\s*!==\s*view/);
 assert.match(shell,/root\.dataset\.viewMode\s*=\s*workspaceState\.view/);
});
test('PWA pré-cacheia CSS e JS que compõem Foco, escalas e gestão',()=>{
 const sw=load('sw.js');
 assert.match(sw,/const BUILD='[^']+';/);
 const required=[
  'index.html','integracao/integration.css',
  'domain/silm/workshop.css','integracao/workspace-family.css',
  'integracao/base-core.js','integracao/adapter.js',
  'integracao/structure-comparison.js'
 ];
 for(const file of required){
  assert.ok(existsSync(file),'Falta um arquivo essencial: '+file);
  assert.ok(sw.includes('"'+file+'"'),'Ausente do pré-cache offline: '+file);
 }
});
