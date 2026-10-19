'use strict';
// Snapshot upstream íntegro; a entrada do produto substitui somente o boot da demo.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../integracao'),lock=JSON.parse(fs.readFileSync(path.join(root,'base-lock.json'),'utf8'));
for(const [file,hash] of Object.entries(lock.files)){
 const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'upstream',file))).digest('hex');
 if(actual!==hash)throw new Error('Snapshot da base alterado: '+file);
}
const source=fs.readFileSync(path.join(root,'upstream/app.js'),'utf8');
const marker='var BaseDemoSI;\n(function (BaseDemoSI) {\n    function initialize() {';
const end=source.indexOf(marker);
if(end<0||source.indexOf(marker,end+1)!==-1)throw new Error('Entrada upstream desconhecida');
fs.writeFileSync(path.join(root,'base-core.js'),source.slice(0,end));
console.log('Base de integração: snapshot '+lock.commit+' verificado; núcleo gerado sem inicializar a demonstração.');
