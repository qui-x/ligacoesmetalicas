/* Cache por escopo, instalação e ativação adaptados da baseline 0.1.0. */
const VERSION='0.15.10';
// BUILD identifica esta revisão da distribuição e força a atualização do cache offline.
const BUILD='parte10-joule-dissipacao-calor-20261111-offline-revalidation-r1-professor-roteiros-r1-pr111-optics-v5-session-continuity-r1-optical-stage-integrated-r2-formative-r1-report-metal-icons-r1-report-modules-r1';
const ROOT=new URL(self.registration.scope),PREFIX=`silm@${ROOT.href}::`,CACHE=PREFIX+VERSION+'+'+BUILD,DOMAINS=CACHE+'::domains';
const FILES=[
  "assets/workshop/motor.webp",
  "assets/workshop/fitting.webp",
  "assets/workshop/screw.webp",
  "assets/workshop/transformer.webp",
  "assets/workshop/laptop.webp",
  "assets/workshop/wheel.webp",
  "assets/workshop/battery.webp",
  "assets/workshop/lighter.webp",
  "domain/silm/metal-atlas.js",
  "assets/metal-atlas/cotidiano/li-cotidiano.webp",
  "assets/metal-atlas/cotidiano/be-cotidiano.webp",
  "assets/metal-atlas/cotidiano/na-cotidiano.webp",
  "assets/metal-atlas/cotidiano/mg-cotidiano.webp",
  "assets/metal-atlas/cotidiano/al-cotidiano.webp",
  "assets/metal-atlas/cotidiano/k-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ca-cotidiano.webp",
  "assets/metal-atlas/cotidiano/sc-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ti-cotidiano.webp",
  "assets/metal-atlas/cotidiano/v-cotidiano.webp",
  "assets/metal-atlas/cotidiano/cr-cotidiano.webp",
  "assets/metal-atlas/cotidiano/mn-cotidiano.webp",
  "assets/metal-atlas/cotidiano/fe-cotidiano.webp",
  "assets/metal-atlas/cotidiano/co-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ni-cotidiano.webp",
  "assets/metal-atlas/cotidiano/cu-cotidiano.webp",
  "assets/metal-atlas/cotidiano/zn-cotidiano.webp",
  "assets/metal-atlas/cotidiano/rb-cotidiano.webp",
  "assets/metal-atlas/cotidiano/sr-cotidiano.webp",
  "assets/metal-atlas/cotidiano/y-cotidiano.webp",
  "assets/metal-atlas/cotidiano/zr-cotidiano.webp",
  "assets/metal-atlas/cotidiano/nb-cotidiano.webp",
  "assets/metal-atlas/cotidiano/mo-cotidiano.webp",
  "assets/metal-atlas/cotidiano/tc-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ru-cotidiano.webp",
  "assets/metal-atlas/cotidiano/rh-cotidiano.webp",
  "assets/metal-atlas/cotidiano/pd-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ag-cotidiano.webp",
  "assets/metal-atlas/cotidiano/cd-cotidiano.webp",
  "assets/metal-atlas/cotidiano/sn-cotidiano.webp",
  "assets/metal-atlas/cotidiano/cs-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ba-cotidiano.webp",
  "assets/metal-atlas/cotidiano/la-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ce-cotidiano.webp",
  "assets/metal-atlas/cotidiano/pr-cotidiano.webp",
  "assets/metal-atlas/cotidiano/nd-cotidiano.webp",
  "assets/metal-atlas/cotidiano/sm-cotidiano.webp",
  "assets/metal-atlas/cotidiano/eu-cotidiano.webp",
  "assets/metal-atlas/cotidiano/gd-cotidiano.webp",
  "assets/metal-atlas/cotidiano/tb-cotidiano.webp",
  "assets/metal-atlas/cotidiano/dy-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ho-cotidiano.webp",
  "assets/metal-atlas/cotidiano/er-cotidiano.webp",
  "assets/metal-atlas/cotidiano/tm-cotidiano.webp",
  "assets/metal-atlas/cotidiano/yb-cotidiano.webp",
  "assets/metal-atlas/cotidiano/lu-cotidiano.webp",
  "assets/metal-atlas/cotidiano/hf-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ta-cotidiano.webp",
  "assets/metal-atlas/cotidiano/w-cotidiano.webp",
  "assets/metal-atlas/cotidiano/re-cotidiano.webp",
  "assets/metal-atlas/cotidiano/os-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ir-cotidiano.webp",
  "assets/metal-atlas/cotidiano/pt-cotidiano.webp",
  "assets/metal-atlas/cotidiano/au-cotidiano.webp",
  "assets/metal-atlas/cotidiano/tl-cotidiano.webp",
  "assets/metal-atlas/cotidiano/pb-cotidiano.webp",
  "assets/metal-atlas/cotidiano/bi-cotidiano.webp",
  "assets/metal-atlas/cotidiano/po-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ra-cotidiano.webp",
  "assets/metal-atlas/cotidiano/ac-cotidiano.webp",
  "assets/metal-atlas/cotidiano/th-cotidiano.webp",
  "assets/metal-atlas/cotidiano/pa-cotidiano.webp",
  "assets/metal-atlas/cotidiano/np-cotidiano.webp",
  "assets/metal-atlas/cotidiano/pu-cotidiano.webp",
  "assets/metal-atlas/cotidiano/am-cotidiano.webp",
  "assets/metal-atlas/microestruturas/al-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/be-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/ca-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/co-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/cr-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/cu-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/fe-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/k-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/li-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/mg-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/mn-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/na-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/ni-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/rb-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/sc-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/sr-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/ti-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/v-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/y-microestrutura-esquematica.webp",
  "assets/metal-atlas/microestruturas/zn-microestrutura-esquematica.webp",

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
  "domain/silm/center-focus.css",
  "domain/silm/controls-simplified.css",
  "domain/silm/periodic-table.css",
  "integracao/integration.css",
  "integracao/silm-theme.css",
  "integracao/workspace-family.css",
  "integracao/action-icons.css",
  "integracao/base-core.js",
  "integracao/compat.js",
  "domain/silm/data/bundle.js",
  "domain/silm/data-api.js",
  "domain/silm/assembly.js",
  "domain/silm/crystal.js",
  "domain/silm/deformation.js",
  "domain/silm/thermal.js",
  "domain/silm/electrothermal.js",
  "domain/silm/drive.js",
  "domain/silm/optical-observation.js",
  "domain/silm/optical-bench.js",
  "domain/silm/optical-bench.css",
  "domain/silm/properties.js",
  "domain/silm/reference-conditions.js",
  "domain/silm/material-profile-registry.js",
  "domain/silm/data/material-profile-demo-cu.js",
  "domain/silm/material-engine.js",
  "domain/silm/measurements.js",
  "domain/silm/calculations.js",
  "domain/silm/state.js",
  "domain/silm/report-modules.js",
  "domain/silm/representation.js",
  "domain/silm/renderer-2d.js",
  "domain/silm/assembly-view.js",
  "domain/silm/crystal-view.js",
  "domain/silm/lattice-navigation.js",
  "domain/silm/microstructure-data.js",
  "domain/silm/microstructure-synthetic.js",
  "domain/silm/microstructure-study-context.js",
  "domain/silm/microstructure-appearance.js",
  "domain/silm/microstructure-view.js",
  "domain/silm/workshop.js",
  "domain/silm/workshop.css",
  "domain/silm/lens.css",
  "domain/silm/lens-controller.js",
  "domain/silm/electron-view.js",
  "domain/silm/property-view.js",
  "domain/silm/measure-view.js",
  "domain/silm/periodic-table.js",
  "integracao/metallic-experience.js",
  "domain/silm/engine-adapters.js",
  "domain/silm/engine-catalog.js",
  "integracao/scientific-tools.js",
  "domain/silm/routes.js",
  "domain/silm/missions.js",
  "domain/silm/ready-assemblies.js",
  "domain/silm/themes.js",
  "domain/silm/manual.js",
  "domain/silm/teacher-activities.js",
  "integracao/unified-ui.js",
  "integracao/teacher-ui.js",
  "domain/silm/route-session.js",
  "integracao/route-ui.js",
  "integracao/workspace-family.js",
  "integracao/durable-storage.js",
  "integracao/structure-comparison.js",
  "integracao/adapter.js",
  "integracao/action-icons.js",
  "integracao/toolbar-scroll.js",
  "integracao/dock-focus.js",
  "integracao/module-shortcuts.css",
  "integracao/direct-ver-tools.css",
  "integracao/mobile-icon-fit.css",
  "integracao/mobile-layout-unificado.css",
  "integracao/object-catalog.css",
  "integracao/mobile-notifications.css",
  "integracao/mobile-notifications.js",
  "integracao/module-shortcuts.js",
  "domain/silm/abertura/silm-intro-v3.css",
  "domain/silm/abertura/silm-intro-v3.js",
  "integracao/pwa.js",
  "integracao/legacy-entry.js"
];
const local=value=>{const url=new URL(value,ROOT);if(url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))throw new TypeError('Recurso fora do escopo');return url;};
/* Ativação resiliente: HTML/JS/CSS/dados necessários à execução são obrigatórios.
   Imagens opcionais ausentes não bloqueiam instalação nem impedem uso offline. */
const CORE=FILES.filter(file=>!/\.(?:webp|png|jpe?g|gif|svg|ico)$/i.test(file));
const BOOT=['index.html','integracao/unified-ui.js','integracao/route-ui.js','domain/silm/routes.js','domain/silm/data/bundle.js','domain/silm/data-api.js','integracao/integration.css','integracao/pwa.js','domain/silm/manual.js'];
if(BOOT.some(path=>!CORE.includes(path)))throw new Error('Pré-cache central incompleto');
const stage=(file,cache)=>fetch(new Request(local(file),{cache:'reload'})).then(async response=>{
 if(!response.ok)throw new Error('Falha de pré-cache: '+file+' ('+response.status+')');
 await cache.put(local(file),response);
});
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await Promise.all(CORE.map(file=>stage(file,cache)));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await self.clients.claim();
 const cache=await caches.open(CACHE);
 const pending=FILES.filter(file=>!CORE.includes(file));
 /* Limitar requisições paralelas para não saturar navegadores mobile. */
 let index=0;
 const worker=async()=>{while(index<pending.length){const file=pending[index++];try{
  if(!await cache.match(local(file)))await stage(file,cache);
 }catch(error){/* Recurso opcional pode ser obtido numa próxima visita online. */}
 }};
 await Promise.all(Array.from({length:6},worker));
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&![CACHE,DOMAINS].includes(key)).map(key=>caches.delete(key)));
})()));
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
/* HTML, scripts e estilos são revalidados online em vez de ficarem
   permanentemente presos à primeira resposta armazenada; offline usa cache. */
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 const relative=url.pathname.slice(ROOT.pathname.length);
 const navigation=req.mode==='navigate'&&['','index.html','completo.html'].includes(relative);
 const structural=FILES.some(file=>local(file).pathname===url.pathname);
 const moduleResource=relative.startsWith('domain/');
 if(!navigation&&!structural&&!moduleResource)return;
 event.respondWith((async()=>{
  const cache=await caches.open(structural||navigation?CACHE:DOMAINS);
  const key=navigation?new URL(relative==='completo.html'?'completo.html':'index.html',ROOT):req;
  const networkFirst=navigation||/\.(?:js|css|html|json|webmanifest)$/i.test(relative);
  if(networkFirst){
   try{
    const fresh=await fetch(new Request(req,{cache:'no-cache'}));
    if(fresh.ok){try{await cache.put(key,fresh.clone());}catch(error){/* Falha de quota não deve devolver JS antigo se a rede respondeu. */}return fresh;}
    const fallback=await cache.match(key,{ignoreSearch:true});
    return fallback||fresh;
   }catch(error){
    const fallback=await cache.match(key,{ignoreSearch:true});
    if(fallback)return fallback;
    throw error;
   }
  }
  const cached=await cache.match(key,{ignoreSearch:true});
  if(cached)return cached;
  const response=await fetch(req);
  if(response.ok)try{await cache.put(key,response.clone());}catch(error){/* Ainda entregar o recurso recebido online. */}
  return response;
 })());
});
