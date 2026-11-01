/* Cache por escopo, instalação e ativação adaptados da baseline 0.1.0. */
const VERSION='0.15.5';
const ROOT=new URL(self.registration.scope),PREFIX=`silm@${ROOT.href}::`,CACHE=PREFIX+VERSION,DOMAINS=CACHE+'::domains';
const FILES=[
  "./",
  "index.html",
  "completo.html",
  "manifest.webmanifest",
  "favicon-light.svg",
  "favicon-dark.svg",
  "assets/silm-icone.svg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-512.png",
  "assets/apple-touch-icon.png",
  "assets/core-icon.svg",
  "assets/silm-logo-vertical.svg",
  "assets/silm-simbolo.svg",
  "integracao/upstream/app.css",
  "integracao/upstream/workspace.css",
  "integracao/upstream/components.css",
  "integracao/upstream/extensions.css",
  "integracao/upstream/education.css",
  "integracao/upstream/records.css",
  "integracao/upstream/distribution.css",
  "integracao/upstream/inspection.css",
  "integracao/upstream/completion.css",
  "integracao/upstream/organization.css",
  "integracao/upstream/environment-organization.css",
  "integracao/upstream/menu-fidelity.css",
  "integracao/upstream/home-fidelity.css",
  "integracao/upstream/home-context.css",
  "integracao/upstream/menu-review.css",
  "integracao/upstream/mobile-contract.css",
  "domain/silm/assembly.css",
  "domain/silm/periodic-table.css",
  "integracao/integration.css",
  "integracao/silm-theme.css",
  "integracao/workspace-family.css",
  "integracao/base-core.js",
  "integracao/compat.js",
  "domain/silm/data/bundle.js",
  "domain/silm/data-api.js",
  "domain/silm/assembly.js",
  "domain/silm/crystal.js",
  "domain/silm/properties.js",
  "domain/silm/measurements.js",
  "domain/silm/calculations.js",
  "domain/silm/state.js",
  "domain/silm/representation.js",
  "domain/silm/renderer-2d.js",
  "domain/silm/assembly-view.js",
  "domain/silm/crystal-view.js",
  "domain/silm/electron-view.js",
  "domain/silm/property-view.js",
  "domain/silm/measure-view.js",
  "domain/silm/periodic-table.js",
  "integracao/metallic-experience.js",
  "integracao/scientific-tools.js",
  "domain/silm/routes.js",
  "domain/silm/missions.js",
  "domain/silm/ready-assemblies.js",
  "domain/silm/themes.js",
  "domain/silm/manual.js",
  "integracao/unified-ui.js",
  "domain/silm/route-session.js",
  "integracao/route-ui.js",
  "integracao/workspace-family.js",
  "integracao/durable-storage.js",
  "integracao/structure-comparison.js",
  "integracao/adapter.js",
  "domain/silm/abertura/silm-intro-v3.css",
  "domain/silm/abertura/silm-intro-v3.js",
  "integracao/pwa.js",
  "integracao/legacy-entry.js",
  "jazz-club/index.html",
  "jazz-club/src/dance.css",
  "jazz-club/src/dance.js",
  "jazz-club/src/dance-core.js",
  "jazz-club/src/dance-fallback.js",
  "jazz-club/src/builtin-track.js",
  "jazz-club/src/jukebox.css",
  "jazz-club/src/jukebox-core.js",
  "jazz-club/src/jukebox-library.js",
  "jazz-club/src/jukebox-scene.js",
  "jazz-club/audio/jazz e metais/catalogo.json"
];
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
