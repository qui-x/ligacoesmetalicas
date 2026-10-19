const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'integracao/index.html'),'utf8');
html=html.replace(/((?:src|href)=")([^"]+)(")/g,(_,a,url,b)=>a+(url.startsWith('../')?url.slice(3):url.includes(':')||url.startsWith('#')?url:'integracao/'+url)+b);
html=html.replace('</head>','<link rel="manifest" href="manifest.webmanifest"><script src="integracao/pwa.js" defer></script></head>');
fs.writeFileSync(path.join(root,'index.html'),html);
