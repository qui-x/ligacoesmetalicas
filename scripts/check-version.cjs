'use strict';
/* Versão única do produto: VERSION é a fonte; pacote, lock, BUILD-INFO, manifesto da Base, rótulos da página e
   cache do service worker precisam concordar com ela. Roda no build e nos testes científicos. */
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const version=read('VERSION').trim(),problems=[];
const expect=(label,value)=>{if(value!==version)problems.push(label+': '+JSON.stringify(value));};
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),info=JSON.parse(read('BUILD-INFO.json'));
expect('package.json',pkg.version);expect('package-lock.json',lock.version);expect('package-lock.json (raiz)',lock.packages?.['']?.version);expect('BUILD-INFO.json',info.versao);
expect('integracao/adapter.js (manifesto)',(read('integracao/adapter.js').match(/version:'([^']+)'/)||[])[1]);
for(const file of ['integracao/index.html','index.html']){const found=[...read(file).matchAll(/data-app-version="([^"]+)">([^<]+)</g)];if(!found.length)problems.push(file+': sem rótulo de versão');for(const m of found){expect(file+' (data-app-version)',m[1]);expect(file+' (texto)',m[2]);}}
for(const file of ['scripts/sw-template.js','sw.js']){const v=(read(file).match(/const VERSION='([^']+)'/)||[])[1]||'';if(v!==version&&!v.startsWith(version+'-'))problems.push(file+' (cache): '+JSON.stringify(v));}
if(problems.length){console.error('Versão divergente de VERSION ('+version+'):\n - '+problems.join('\n - '));process.exit(1);}
console.log('Versão única conferida: '+version);
