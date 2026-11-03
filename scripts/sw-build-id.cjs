'use strict';
/* Identificador do build do service worker: SHA-256 (12 primeiros dígitos) do caminho e do conteúdo de cada arquivo do
   cache offline. Qualquer mudança num desses arquivos muda o sw.js, e o navegador instala a versão nova (e o SILM mostra
   "Nova versão do SILM instalada" com Recarregar). Antes, o sw.js só mudava quando a lista de arquivos mudava, e uma
   correção num arquivo já existente não chegava a quem já tinha o SILM no cache. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=(root,files)=>{const hash=crypto.createHash('sha256');
 for(const file of [...files].filter(f=>f!=='./').sort()){hash.update(file+'\0');hash.update(fs.readFileSync(path.join(root,file)));hash.update('\0');}
 return hash.digest('hex').slice(0,12);};
