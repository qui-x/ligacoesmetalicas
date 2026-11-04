'use strict';
/* Gera o catálogo de componentes para o runtime clássico do navegador.
   A fonte canônica permanece engine-catalog.json; este arquivo é um artefato de build. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'domain/silm/engine-catalog.json'),'utf8'));
if(catalog.schemaVersion!==1||catalog.catalogId!=='silm.explorar.component-catalog'||!Array.isArray(catalog.entries))throw new Error('Catálogo SILM inválido.');
const ids=catalog.entries.map(entry=>entry.id);
if(ids.some((id,index)=>!id||ids.indexOf(id)!==index))throw new Error('IDs de componente ausentes ou duplicados.');
const serialized=JSON.stringify(catalog);
const output="'use strict';\nwindow.SILM=window.SILM||{};\n(()=>{const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;};window.SILM.engineCatalog=freeze("+serialized+");})();\n";
fs.writeFileSync(path.join(root,'domain/silm/engine-catalog.js'),output);
console.log('Catálogo de motores gerado: '+catalog.entries.length+' componentes; versão '+catalog.catalogVersion+'.');
