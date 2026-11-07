'use strict';
/* SILM — gerador geométrico de grãos ESQUEMÁTICOS, não amostras medidas.
 * A mesma semente e o mesmo perfil produzem o mesmo campo em qualquer
 * viewport. A câmera pode mudar sem alterar os polígonos ou a procedência.
 */
((root)=>{
 const WIDTH=1000,HEIGHT=620,DEFAULT_SEED=139712;
 const PROFILES=Object.freeze({
  equiaxial:Object.freeze({label:'Equiaxial (esquemático)',rows:8,cols:12,jitter:.46}),
  elongated:Object.freeze({label:'Alongado (esquemático)',rows:12,cols:8,jitter:.32})
 });
 const validSeed=value=>Number.isInteger(value)&&value>=0&&value<=4294967295;
 const validProfile=profile=>Object.hasOwn(PROFILES,profile);
 const nextSeed=seed=>(Math.imul(seed>>>0,1664525)+1013904223)>>>0;
 // Interseção sucessiva por mediatrizes: tesselação Voronoi limitada ao campo.
 const bisect=(poly,a,b)=>{
  if(!poly.length)return poly;
  const dx=2*(b.x-a.x),dy=2*(b.y-a.y),limit=b.x*b.x+b.y*b.y-a.x*a.x-a.y*a.y;
  const side=p=>dx*p[0]+dy*p[1]-limit;
  const out=[];let before=poly[poly.length-1],prev=side(before);
  for(const now of poly){
   const current=side(now),inside=current<=0,oldInside=prev<=0;
   if(inside!==oldInside){
    const t=prev/(prev-current);
    out.push([before[0]+t*(now[0]-before[0]),before[1]+t*(now[1]-before[1])]);
   }
   if(inside)out.push(now);before=now;prev=current;
  }
  return out;
 };
 function generate({seed=DEFAULT_SEED,profile='equiaxial'}={}){
  if(!validSeed(seed))throw new RangeError('Semente deve ser inteira entre 0 e 4294967295.');
  if(!validProfile(profile))throw new RangeError('Perfil geométrico indisponível.');
  const settings=PROFILES[profile];let state=seed>>>0;
  const rnd=()=>{state=nextSeed(state);return state/4294967296;};
  const sites=[];
  const jitter=settings.jitter;
  for(let row=0;row<settings.rows;row++){
   for(let col=0;col<settings.cols;col++){
    sites.push({
     x:(col+.5+(rnd()-.5)*jitter)*WIDTH/settings.cols,
     y:(row+.5+(rnd()-.5)*jitter)*HEIGHT/settings.rows
    });
   }
  }
  const polygons=sites.map((site,i)=>{
   let poly=[[0,0],[WIDTH,0],[WIDTH,HEIGHT],[0,HEIGHT]];
   for(let j=0;j<sites.length;j++){
    if(i!==j)poly=bisect(poly,site,sites[j]);
    if(!poly.length)break;
   }
   return Object.freeze(poly.map(p=>Object.freeze(p)));
  });
  return Object.freeze({
   kind:'schematic',generator:'silm-voronoi-v1',
   seed,profile,width:WIDTH,height:HEIGHT,
   polygons:Object.freeze(polygons)
  });
 }
 const api=Object.freeze({DEFAULT_SEED,PROFILES,validSeed,validProfile,nextSeed,generate});
 root.SILM=root.SILM||{};root.SILM.microstructureSynthetic=api;
})(typeof window!=='undefined'?window:globalThis);
