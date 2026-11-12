'use strict';
/* Service Worker: instalação resiliente, atualização online e fallback offline.
   Não acessa armazenamento de investigações/IndexedDB. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scope='https://example.org/ligacoesmetalicas/';
const normalized=k=>new URL(typeof k==='string'?k:k.url,scope).pathname;
class Cache{
 constructor(){this.entries=new Map();}
 async put(key,response){this.entries.set(normalized(key),response.clone());}
 async match(key){return this.entries.get(normalized(key))?.clone()||undefined;}
}
const db=new Map(),caches={
 async open(key){if(!db.has(key))db.set(key,new Cache());return db.get(key);},
 async keys(){return [...db.keys()]},
 async delete(key){return db.delete(key)}
};
const events={};let claimed=0,skipped=0,online=true;
const self={
 registration:{scope},clients:{claim:async()=>{claimed++}},
 skipWaiting:async()=>{skipped++},
 addEventListener:(name,fn)=>{events[name]=fn},
 navigator:{get onLine(){return online}}
};
const calls=[];
const fetch=async request=>{
 const path=normalized(request);
 calls.push(path);
 if(!online)throw new TypeError('Offline simulado');
 if(path.endsWith('/assets/workshop/motor.webp'))return new Response('Ausente',{status:404});
 return new Response('ATUAL:'+path,{status:200,headers:{'Content-Type':'text/plain'}});
};
const ctx=vm.createContext({self,caches,fetch,URL,Request,Response,Promise,Set,Map,Array,Object,Error,TypeError,Number,String});
vm.runInContext(fs.readFileSync('sw.js','utf8'),ctx,{filename:'sw.js'});
assert.ok(events.install&&events.activate&&events.fetch);
const mandatory=vm.runInContext('Array.from(CORE)',ctx);
assert.ok(mandatory.length>=90,'Núcleo offline deve manter os módulos e estilos');
for(const file of mandatory.filter(file=>file!=='./'))
 assert.ok(fs.existsSync(file),'Recurso obrigatório ausente: '+file);
const perform=async(name,request)=>{
 let pending;
 const evt=name==='fetch'?{request,respondWith(p){pending=p}}:{waitUntil(p){pending=p}};
 events[name](evt);return pending?await pending:null;
};
(async()=>{
 await perform('install');
 assert.equal(skipped,1,'Uma imagem opcional não deve impedir a instalação');
 await perform('activate');
 assert.equal(claimed,1,'O novo SW deve assumir os clientes');
 const active=[...db.keys()].find(x=>x.includes('offline-revalidation-r1')&&!x.includes('domains'));
 assert.ok(active,'Novo cache não foi criado');
 const cache=await caches.open(active);
 const script=new Request(scope+'domain/silm/routes.js');
 await cache.put(script,new Response('ANTIGO'));
 const result=await perform('fetch',script);
 assert.equal(await result.text(),'ATUAL:'+normalized(script),'Script deve ser renovado online');
 assert.equal(await (await cache.match(script)).text(),'ATUAL:'+normalized(script),'Atualização deve ficar cacheada');
 online=false;
 const fallback=await perform('fetch',script);
 assert.equal(await fallback.text(),'ATUAL:'+normalized(script),'Offline deve usar a revisão mais recente');
 online=true;
 const complete=new Request(scope+'completo.html');
 await cache.put(complete,new Response('STANDALONE ANTIGO'));
 const latestComplete=await perform('fetch',complete);
 assert.equal(await latestComplete.text(),'ATUAL:'+normalized(complete),'Standalone deve ser revalidado');
 online=false;
 assert.equal(await (await perform('fetch',complete)).text(),'ATUAL:'+normalized(complete),'Standalone deve funcionar offline');
 const nav=await perform('fetch',{url:scope,method:'GET',mode:'navigate'});
 assert.ok(await nav.text(),'A navegação offline deve recuperar a entrada');
 assert.ok(calls.length>=9,'Pré-cache essencial deve ter sido consultado');
 const sw=fs.readFileSync('sw.js','utf8'),pwa=fs.readFileSync('integracao/pwa.js','utf8');
 assert.ok(sw.includes("const CORE=")&&sw.includes("const networkFirst="));
 assert.ok(pwa.includes("updateViaCache:'none'")&&pwa.includes('reg.update()'));
 assert.ok(!sw.includes('indexedDB.deleteDatabase')&&!pwa.includes('localStorage.clear()'));
 console.log('OK: atualização segura; falha opcional não bloqueia instalação, JS é revalidado e offline usa cache.');
})().catch(err=>{console.error(err);process.exitCode=1});
