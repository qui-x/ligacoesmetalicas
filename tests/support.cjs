'use strict';
/* Suporte dos testes de navegador: servidor estático local (sem rede externa) e Chromium do Playwright. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.cif':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.md':'text/markdown; charset=utf-8'};
function serve(){
 const server=http.createServer((req,res)=>{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';
  const file=path.normalize(path.join(root,pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
 });
 return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve({server,url:'http://127.0.0.1:'+server.address().port+'/'})));
}
async function launch(){
 const {chromium}=require('playwright');
 try{return await chromium.launch();}
 catch(error){
  const candidates=['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',process.env.SILM_CHROMIUM].filter(Boolean);
  for(const executablePath of candidates)if(fs.existsSync(executablePath)){
   const args=process.env.SILM_CHROMIUM_ARGS?JSON.parse(process.env.SILM_CHROMIUM_ARGS):undefined;
   if(args!==undefined&&(!Array.isArray(args)||!args.every(value=>typeof value==='string')))throw new Error('SILM_CHROMIUM_ARGS deve ser uma lista JSON de argumentos.');
   return chromium.launch({executablePath,args});
  }
  throw error;
 }
}
module.exports={root,serve,launch};
