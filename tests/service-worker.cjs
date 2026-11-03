'use strict';
/* O sw.js publicado corresponde aos arquivos atuais: o BUILD é o SHA-256 da lista do cache offline. Se um arquivo mudou e
   o sw.js não foi gerado de novo (npm run build), quem já tem o SILM instalado não recebe a atualização. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const files=JSON.parse(sw.match(/const FILES=(\[[\s\S]*?\]);\nconst local/)[1]),build=(sw.match(/const BUILD='([0-9a-f]{12})';/)||[])[1];
assert.ok(build,'sw.js com BUILD de 12 dígitos');
assert.equal(build,require('../scripts/sw-build-id.cjs')(root,files),'sw.js gerado com os arquivos atuais (rode npm run build)');
assert.match(sw,/CACHE=PREFIX\+VERSION\+'\+'\+BUILD/,'O nome do cache inclui o BUILD');
console.log('PASS service-worker: BUILD '+build+' corresponde aos '+files.length+' arquivos do cache offline; o nome do cache muda a cada versão.');
