const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const walk=dir=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
const files=[...new Set(['./','index.html','manifest.webmanifest','favicon-light.svg','favicon-dark.svg',...walk('assets'),...walk('domain'),...[...html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)].map(m=>m[1]).filter(p=>!p.includes(':')&&fs.existsSync(path.join(root,p)))])];
const template=fs.readFileSync(path.join(root,'scripts/sw-template.js'),'utf8');fs.writeFileSync(path.join(root,'sw.js'),template.replace('/*__PRECACHE__*/',JSON.stringify(files,null,2)));
