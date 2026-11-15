'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'domain/silm/mechanics-action-contract.js'),'utf8');
const get=()=>{const x={window:{SILM:{}}};x.SILM=x.window.SILM;vm.runInNewContext(source,x);return x.SILM.mechanicsActionContract;};
test('contrato nao redistribui menus existentes sem homologacao explicita',()=>{
 const c=get();assert.equal(c.willChangeExistingMenus,false);
 assert.equal(c.canPublishCPFEM,false);assert.equal(c.status,'AWAITING_MENU_REVIEW');
 assert.equal(c.actions.length,8);
 assert.equal(c.statusFor('mechanics.crystal.preview').enabled,false);
 assert.equal(c.statusFor('mechanics.field.inspect').status,'AWAITING_MENU_REVIEW');
});
test('acoes cientificas tem unica proposta de propriedade e requisitos',()=>{
 const c=get(),ids=new Set();
 for(const a of c.actions){
  assert.ok(!ids.has(a.id));ids.add(a.id);
  assert.ok(['montagem','ver','dados'].includes(a.proposedMenu));
  assert.ok(a.priorityCandidate>0&&Number.isInteger(a.priorityCandidate));
  assert.ok(Array.isArray(a.requires)&&a.output);
  assert.equal(c.byId[a.id].label,a.label);
  assert.equal(c.owns(a.id,a.proposedMenu),true);
 }
 assert.equal(c.owns('mechanics.crystal.preview','dados'),false);
 assert.equal(c.statusFor('some-unknown').enabled,false);
});
test('cache e carregamento do contrato estao previstos, mas nenhuma alteracao funcional dos menus',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const p='domain/silm/mechanics-action-contract.js';
 assert.ok(html.includes(p)&&sw.includes('"'+p+'"'));
 assert.ok(html.indexOf('domain/silm/polycrystal-cpfem.js')<html.indexOf(p));
 assert.ok(html.indexOf(p)<html.indexOf('domain/silm/microstructure-view.js'));
});
