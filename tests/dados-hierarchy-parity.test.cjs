'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const workspace=fs.readFileSync(path.join(root,'integracao/workspace-family.js'),'utf8');
const data=fs.readFileSync(path.join(root,'integracao/metallic-experience.js'),'utf8');

test('Dados mantém destinos únicos para ficha, registros e arquivos',()=>{
 for(const id of ['tabela','registros','arquivo']){
  assert.equal((html.match(new RegExp('data-silm-data-open="'+id+'"','g'))||[]).length,1,id);
  assert.equal((html.match(new RegExp('data-silm-data-panel="'+id+'"','g'))||[]).length,1,id);
 }
 assert.match(html,/id="silm-data-back"/);
 assert.match(html,/id="silm-data-catalog"/);
 assert.match(html,/id="silm-data"/);
 assert.match(html,/id="silm-history"/);
 assert.match(html,/id="silm-export"/);
 assert.match(html,/id="silm-import"/);
 assert.match(html,/id="silm-report-link"/);
 assert.match(html,/href="#\/caderno"/);
});

test('Dados possui hierarquia científica e diferencia condições de motores',()=>{
 assert.match(data,/Identificação e estrutura/);
 assert.match(data,/Propriedades do metal/);
 assert.match(data,/Dados condicionais não calibram automaticamente as simulações/);
 assert.match(data,/S\.sevenConditionResearch/);
 assert.match(data,/S\.scienceEvidenceIndex/);
 assert.match(data,/r\.sourceURL/);
});

test('Navegação conserva estado e atualização do contador',()=>{
 assert.match(workspace,/function showData\(id,\{focus=true\}=\{\}\)/);
 assert.match(workspace,/dataPage=id/);
 assert.match(workspace,/document\.querySelectorAll\('\[data-silm-data-panel\]'\)/);
 assert.match(workspace,/function setupData\(\)/);
 assert.match(workspace,/silm-record-count/);
 assert.match(workspace,/Registros da investigação/);
 assert.match(workspace,/Importar e exportar/);
});
