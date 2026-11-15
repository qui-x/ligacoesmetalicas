'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const adapter=fs.readFileSync(path.join(root,'integracao/adapter.js'),'utf8');
const workshop=fs.readFileSync(path.join(root,'domain/silm/workshop.js'),'utf8');

test('Preparo apresenta tabela como ação principal e montagem livre como alternativa',()=>{
 assert.match(html,/<button id="silm-open-periodic"[^>]*class="button primary silm-preparo-table"[^>]*>Escolher objeto na Tabela Periódica<\/button>/);
 assert.match(html,/<button id="silm-start"[^>]*class="button outline"[^>]*>Iniciar montagem livre<\/button>/);
 assert.match(html,/<details id="silm-manual-start"[^>]*class="silm-preparo-secondary">/);
 assert.match(html,/<summary>Montagem livre \(opcional\)<\/summary>/);
 assert.ok(html.indexOf("id=\"silm-open-periodic\"")<html.indexOf("id=\"silm-manual-start\""));
 assert.match(html,/<label for="silm-metal">Metal da montagem livre<\/label><select id="silm-metal"><\/select>/);
 assert.match(adapter,/label=state\.metadata\?\.workshop\?\.referenceId\?'Nova montagem livre':'Iniciar montagem livre'/);
});
test('a escolha de objeto mantém fluxo existente no palco, modal e montagem automática',()=>{
 assert.match(adapter,/function openStagePeriodic\(/);
 assert.match(adapter,/showObjectEntry=true/);
 assert.match(adapter,/function renderObjectEntry\(/);
 assert.match(adapter,/onSelect:metal=>openObjectCatalog\(metal\)/);
 assert.match(adapter,/dialog\.showModal\(\)/);
 assert.match(adapter,/async function chooseObjectFromCatalog\(/);
 assert.match(adapter,/prepareObjectReference\(\)/);
 assert.match(workshop,/itemCard\(item,onInvestigate,'Iniciar montagem'/);
});
