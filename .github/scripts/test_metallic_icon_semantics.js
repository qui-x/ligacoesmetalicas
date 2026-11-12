'use strict';
/* Regressão visual sem dependência gráfica: símbolos de centros e elétrons
   metálicos não podem retornar à iconografia molecular/orbital antiga. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const actions=fs.readFileSync('integracao/action-icons.js','utf8');
const viewer=fs.readFileSync('integracao/workspace-family.js','utf8');
const report=fs.readFileSync('integracao/route-ui.js','utf8');
const css=fs.readFileSync('integracao/integration.css','utf8');
function icon(source,id){
 const escaped=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp('\\b'+escaped+":'([^']+)'");
 const m=source.match(re);assert.ok(m,'Ícone ausente: '+id);
 return m[1];
}
for(const id of ['neighbors','centers','electrons','cell']){
 const path=icon(viewer,id);
 assert.ok(path.length>25,'Geometria incompleta: '+id);
 assert.ok(!/NaN|undefined|rotate\(/.test(path),'Geometria inválida: '+id);
}
for(const id of ['neighbors','centers','electrons']){
 const path=icon(viewer,id);
 assert.ok(!/[lLqQcC]/.test(path),
  'Iconografia de '+id+' não deve mostrar hastes ligando pares atômicos');
}
assert.match(icon(viewer,'centers'),/h6v6H9z/,'Centro da rede precisa de destaque');
assert.match(icon(viewer,'electrons'),/M12 2h/,'Mar de elétrons precisa de pontos intersticiais');
assert.match(actions,/electronSea:'<circle/);
assert.match(actions,/lattice:'<path/);
assert.doesNotMatch(actions,/\batom:'<circle/,'Órbitas tipo Bohr não representam elétrons metálicos');
assert.doesNotMatch(actions,/<ellipse/,'Não usar elipses orbitais do ícone antigo');
for(const [id,symbol]of [
 ['silm-electrons','electronSea'],['silm-organize','lattice'],['theme-investigate','lattice']
])assert.ok(actions.includes("'"+id+"':['"+symbol+"'"),
  id+' deve usar a representação metálica');
for(const selector of [
 '.silm-report-mast','.silm-report-hero','.silm-report-element','.silm-report-meta',
 '.silm-report-provenance','.silm-report-section','@media print'
])assert.ok(css.includes(selector),'Regra visual do relatório ausente: '+selector);
for(const marker of [
 "elementSymbol=N('strong',e.symbol)",
 "['Estrutura',crystalType]",
 "['Versão','SILM '+B.manifest.version]",
 "provenance.setAttribute('aria-label'",
 "sec.dataset.reportSection=name"
])assert.ok(report.includes(marker),'Contrato do relatório ausente: '+marker);
console.log('OK: ícones de rede, vizinhança, centros e elétrons não representam moléculas orgânicas; relatório científico preserva metadados.');
