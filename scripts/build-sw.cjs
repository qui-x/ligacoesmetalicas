'use strict';
/* Lista do cache offline: só o que a entrada usa — tudo o que index.html e completo.html carregam (src/href), o
   manifesto e seus ícones, os favicons, assets/ e a entrada do Jazz e Metais (lista fixa, sem os áudios). Fontes da
   Base (upstream/app.js, .ts), arquivos do núcleo antigo, scripts de domínio não carregados e evidências .cif ficam
   fora: nenhum deles é pedido em tempo de execução. A versão do cache é a do sw-template.js (conferida com VERSION). */
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const exists=p=>fs.existsSync(path.join(root,p))&&fs.statSync(path.join(root,p)).isFile();
const walk=dir=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
const html=['index.html','completo.html'].map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n');
const referenced=[...html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)].map(m=>m[1]).filter(p=>!p.includes(':')&&exists(p));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const icons=(manifest.icons||[]).map(i=>i.src.replace(/^\.\//,'')).filter(exists);
const jazz=['jazz-club/index.html','jazz-club/src/dance.css','jazz-club/src/dance.js','jazz-club/src/dance-core.js','jazz-club/src/dance-fallback.js','jazz-club/src/builtin-track.js','jazz-club/src/jukebox.css','jazz-club/src/jukebox-core.js','jazz-club/src/jukebox-library.js','jazz-club/src/jukebox-scene.js','jazz-club/audio/jazz e metais/catalogo.json'].filter(exists);
const files=[...new Set(['./','index.html','completo.html','manifest.webmanifest','favicon-light.svg','favicon-dark.svg',...icons,...walk('assets'),...referenced,...jazz])];
const template=fs.readFileSync(path.join(root,'scripts/sw-template.js'),'utf8');
fs.writeFileSync(path.join(root,'sw.js'),template.replace('/*__PRECACHE__*/',JSON.stringify(files,null,2)));
console.log('Service worker: '+files.length+' recursos no cache offline.');
