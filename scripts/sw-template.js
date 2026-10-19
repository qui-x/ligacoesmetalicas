/* Cache por escopo, instalação e ativação adaptados da baseline 0.1.0. */
const VERSION='0.12.1';
const ROOT=new URL(self.registration.scope),PREFIX=`silm@${ROOT.href}::`,CACHE=PREFIX+VERSION,DOMAINS=CACHE+'::domains';
const FILES=/*__PRECACHE__*/;
const local=value=>{const url=new URL(value,ROOT);if(url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))throw new TypeError('Recurso fora do escopo');return url;};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(file=>new Request(local(file),{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&![CACHE,DOMAINS].includes(key)).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type!=='CACHE_DOMAIN')return;event.waitUntil((async()=>{try{
 const resources=event.data.resources;if(!Array.isArray(resources)||resources.length>100)throw new TypeError('Lista inválida');
 const urls=resources.map(local),cache=await caches.open(DOMAINS),structural=await caches.open(CACHE);
 // A distribuição já inclui o domínio no pré-cache. Reutilize os bytes locais nas recargas offline.
 // Não iniciar um cache.addAll de rede em toda montagem do domínio.
 for(const url of urls){
  if(await cache.match(url,{ignoreSearch:true}))continue;
  const stored=await structural.match(url,{ignoreSearch:true});
  if(stored){await cache.put(url,stored);continue;}
  if(self.navigator.onLine===false)throw new Error('Recurso ainda não disponível offline');
  const response=await fetch(new Request(url,{cache:'reload'}));
  if(!response.ok)throw new Error('Recurso indisponível');
  await cache.put(url,response);
 }
 event.ports[0]?.postMessage({ok:true});
 }catch(error){event.ports[0]?.postMessage({ok:false});}})());});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;const relative=url.pathname.slice(ROOT.pathname.length),navigation=event.request.mode==='navigate'&&['','index.html'].includes(relative);const structural=FILES.some(file=>local(file).pathname===url.pathname);const moduleResource=relative.startsWith('domain/');if(!navigation&&!structural&&!moduleResource)return;
 event.respondWith((async()=>{const cached=await(await caches.open(structural||navigation?CACHE:DOMAINS)).match(navigation?new URL('index.html',ROOT):event.request,{ignoreSearch:true});if(cached)return cached;try{return await fetch(event.request);}catch(error){if(navigation)return(await caches.open(CACHE)).match(new URL('index.html',ROOT));throw error;}})());
});
