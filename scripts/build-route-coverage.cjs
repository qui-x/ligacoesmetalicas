'use strict';
/* Matriz metal → roteiros (docs/COBERTURA-ROTEIROS.md), gerada do catálogo real (domain/silm/routes.js) e do banco
   científico. O compartilhamento conta como cobertura; metais sem estrutura visualizável ficam só com os roteiros
   que não dependem da geometria cristalina. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),root=path.resolve(__dirname,'..');
const S=require('./validate-scientific-state.cjs').load();const box=vm.createContext({SILM:S,Date,JSON,Object});
vm.runInContext(fs.readFileSync(path.join(root,'domain/silm/routes.js'),'utf8'),box);
const routes=S.routes.registry,coverage=S.routes.coverage(),full=coverage.filter(c=>c.routes.length===routes.length),partial=coverage.filter(c=>c.routes.length<routes.length);
const name=z=>{const e=S.data.get(z);return e.name+' ('+e.symbol+')';};
const lines=['# Cobertura dos roteiros','','> Gerado por `scripts/build-route-coverage.cjs` a partir do catálogo de roteiros e do banco científico. Não edite à mão.','',
 'Metais investigáveis: **'+coverage.length+'**. Roteiros: **'+routes.length+'**. Com todos os roteiros: **'+full.length+'** metais. Só com os roteiros que não dependem da geometria cristalina: **'+partial.length+'** metais.','',
 '## Roteiros','','| ID | Título | Módulo | Metais |','|---|---|---|---|',
 ...routes.map(r=>'| '+r.id+' | '+r.title+' | '+r.module+' | '+r.metalSelection.atomicNumbers.length+' |'),'',
 '## Metal → roteiros','','| Metal | Roteiros (IDs) |','|---|---|',...coverage.map(c=>'| '+name(c.atomicNumber)+' | '+c.routes.join(', ')+' |'),''];
if(partial.length)lines.push('## Metais com cobertura parcial','',
 'A estrutura de referência destes metais está registrada no banco, mas não é CCC, CFC nem HC (ou a referência não está completa). O SILM não a substitui por outra estrutura. Por isso eles participam só dos roteiros que não dependem da geometria cristalina, até que um modelo próprio seja construído e validado (ver `docs/AUDITORIA-ESTRUTURAS-METAIS-0.15.1.md`):','',
 ...partial.map(c=>'- '+name(c.atomicNumber)+': '+(S.data.structure(S.data.get(c.atomicNumber))?.label||'estrutura sem modelo próprio')+'.'),'');
fs.writeFileSync(path.join(root,'docs/COBERTURA-ROTEIROS.md'),lines.join('\n'));
console.log('Cobertura dos roteiros: '+coverage.length+' metais, '+routes.length+' roteiros.');
