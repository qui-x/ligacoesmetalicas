'use strict';
/* Evidências do plano de paridade SIAB × SILM: captura a mesma tela nos dois programas, no mesmo tamanho.
   Uso: node scripts/parity-capture.cjs <ID> <rota-SIAB> <rota-SILM> --siab <pasta do SIAB 1.0.0 (acidosebases1.0.0@73848f0)>
   Exemplo: node scripts/parity-capture.cjs HOME '#/inicio' '#/inicio' --siab ../acidobase
   Saída: docs/evidence-parity/<ID>/{siab,silm}-<largura>x<altura>.jpg e capturas.json (rolagem lateral e erros de página).
   Tamanhos do critério comum de aceite: 1366×768, 1024×768, 390×844, 320×640 e 844×390. Movimento reduzido e abertura
   desligada nos dois programas; o SIAB recebe a tela inicial já escolhida para não abrir o convite de inicialização. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {launch,root}=require('../tests/support.cjs');
const args=process.argv.slice(2),flag=args.indexOf('--siab');
const siab=flag>=0?path.resolve(args.splice(flag,2)[1]):process.env.SIAB_REF&&path.resolve(process.env.SIAB_REF);
const [id,siabHash='#/inicio',silmHash=siabHash]=args;
if(!id||!/^[A-Z0-9.-]+$/.test(id)||!siab||!fs.existsSync(path.join(siab,'index.html'))){console.error('Uso: node scripts/parity-capture.cjs <ID> <rota-SIAB> <rota-SILM> --siab <pasta do SIAB>');process.exit(2);}
const SIZES=[[1366,768],[1024,768],[390,844],[320,640],[844,390]];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const serve=dir=>new Promise(resolve=>{const server=http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';const f=path.normalize(path.join(dir,p));
 if(!f.startsWith(dir+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res);}).listen(0,'127.0.0.1',()=>resolve(server));});
(async()=>{
 const out=path.join(root,'docs/evidence-parity',id);fs.mkdirSync(out,{recursive:true});
 const servers={siab:await serve(siab),silm:await serve(root)},hashes={siab:siabHash,silm:silmHash},browser=await launch(),report=[];
 try{for(const [width,height] of SIZES)for(const app of ['siab','silm']){
  const mobile=width<500||(width<900&&width<height);
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',serviceWorkers:'block',locale:'pt-BR'});
  await ctx.addInitScript(()=>{try{localStorage.setItem('siab_inicializacao',JSON.stringify('inicio'));localStorage.setItem('siab_abertura',JSON.stringify(false));}catch{}});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+servers[app].address().port+'/index.html'+hashes[app]);await page.waitForTimeout(1200);
  await page.screenshot({path:path.join(out,`${app}-${width}x${height}.jpg`),type:'jpeg',quality:80});
  report.push({app,viewport:width+'x'+height,route:hashes[app],horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),errors});await ctx.close();}}
 finally{await browser.close();for(const s of Object.values(servers))s.close();}
 fs.writeFileSync(path.join(out,'capturas.json'),JSON.stringify({id,siab:'qui-x/acidobase acidosebases1.0.0@73848f0',captures:report},null,1)+'\n');
 console.log(report.map(r=>`${r.app} ${r.viewport}: rolagem lateral ${r.horizontalOverflow}px, erros ${r.errors.length}`).join('\n'));
})();
