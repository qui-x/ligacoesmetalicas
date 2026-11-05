'use strict';
window.SILM=window.SILM||{};
/* Escala 2: mapa vetorial didático de grãos, independente da rede cristalina.
   Não representa EBSD, metalografia medida, fases, textura ou tamanho de grão de um elemento específico. */
SILM.microstructure=(()=>{
 const NS='http://www.w3.org/2000/svg',W=1000,H=620,CX=W/2,CY=H/2;
 const svgNode=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
 const node=(tag,cls='',txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 // Recorta cada região pela mediatriz dos pares de sementes: tesselação de Voronoi esquemática.
 function bisect(poly,a,b){
  if(!poly.length)return poly;
  const dx=2*(b.x-a.x),dy=2*(b.y-a.y),limit=b.x*b.x+b.y*b.y-a.x*a.x-a.y*a.y;
  const side=p=>dx*p[0]+dy*p[1]-limit;
  const out=[];let before=poly[poly.length-1],db=side(before);
  for(const now of poly){const dn=side(now),inside=dn<=0,oldInside=db<=0;
   if(inside!==oldInside){const t=db/(db-dn);out.push([before[0]+t*(now[0]-before[0]),before[1]+t*(now[1]-before[1])]);}
   if(inside)out.push(now);before=now;db=dn;
  }
  return out;
 }
 const sites=(()=>{const pts=[];let seed=139712;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let row=0;row<6;row++)for(let col=0;col<9;col++)pts.push({x:(col+.5+(rnd()-.5)*.65)*W/9,y:(row+.5+(rnd()-.5)*.65)*H/6});
  return pts;
 })();
 const polygons=sites.map((s,i)=>{let poly=[[0,0],[W,0],[W,H],[0,H]];for(let j=0;j<sites.length;j++){if(i!==j)poly=bisect(poly,s,sites[j]);if(!poly.length)break;}return poly;});
 let serial=0;
 function create({element,item=null}={}){
  const section=node('section','silm-workshop-micro-viewer'),viewport=node('div','silm-workshop-micro-viewport');
  section.setAttribute('aria-label','Microestrutura ampliada: visualização didática de grãos');
  const svg=svgNode('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':'Policristal didático ampliado: grãos e seus contornos; não é micrografia experimental'});
  svg.classList.add('silm-workshop-micro-map');svg.setAttribute('data-zoom','1');
  const defs=svgNode('defs'),uid='silm-micro-'+(++serial);
  for(let p=0;p<4;p++){const pattern=svgNode('pattern',{id:uid+'-pattern-'+p,patternUnits:'userSpaceOnUse',width:22,height:22,patternTransform:'rotate('+(p*37+12)+')'});
   pattern.append(svgNode('path',{d:'M 0 0 V 22',stroke:'currentColor','stroke-opacity':'.13','stroke-width':1.35}));defs.append(pattern);}
  svg.append(defs);
  const plane=svgNode('g',{'class':'silm-micro-plane'});svg.append(plane);
  const paths=[];
  let chosen=-1,zoom=1,offsetX=0,offsetY=0,drag=null,suppressClick=false;
  const status=node('span','silm-workshop-micro-status','Nenhum grão destacado');
  status.setAttribute('aria-live','polite');
  const choose=i=>{chosen=i;paths.forEach((p,j)=>{p.classList.toggle('is-selected',j===i);p.setAttribute('aria-pressed',String(j===i));});
   status.textContent='Grão ilustrativo '+(i+1)+' destacado · sem dimensão ou fase medida';
   svg.setAttribute('data-selected-grain',String(i+1));
  };
  polygons.forEach((poly,i)=>{
   if(poly.length<3)return;
   const d='M'+poly.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+' Z';
   const g=svgNode('g',{'class':'silm-micro-cell'}),p=svgNode('path',{d,'class':'silm-micro-grain',tabindex:0,role:'button','aria-label':'Destacar grão ilustrativo '+(i+1),'aria-pressed':'false'});
   p.style.setProperty('--grain-tone',(16+(i*17)%30)+'%');p.addEventListener('click',()=>{if(!suppressClick)choose(i);});
   p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);}});
   const hatch=svgNode('path',{d,'class':'silm-micro-hatching',fill:'url(#'+uid+'-pattern-'+(i%4)+')','pointer-events':'none'});
   g.append(p,hatch);plane.append(g);paths[i]=p;
  });
  const toolbar=node('div','silm-workshop-micro-toolbar'),zoomLabel=node('output','silm-workshop-micro-zoom','100%');
  zoomLabel.setAttribute('aria-label','Ampliação da microestrutura');
  function update(){
   offsetX=clamp(offsetX,-(zoom-1)*CX,(zoom-1)*CX);
   offsetY=clamp(offsetY,-(zoom-1)*CY,(zoom-1)*CY);
   plane.setAttribute('transform','translate('+(offsetX+CX)+' '+(offsetY+CY)+') scale('+zoom+') translate('+(-CX)+' '+(-CY)+')');
   svg.setAttribute('data-zoom',String(zoom));zoomLabel.value=Math.round(zoom*100)+'%';
   viewport.classList.toggle('is-zoomed',zoom>1);
  }
  const setZoom=z=>{zoom=clamp(Math.round(z*4)/4,1,4);if(zoom===1){offsetX=0;offsetY=0;}update();};
  const button=(name,txt,action)=>{const b=node('button','silm-workshop-micro-control',txt);b.type='button';b.setAttribute('aria-label',name);b.addEventListener('click',action);return b;};
  toolbar.append(
   button('Reduzir microestrutura','−',()=>setZoom(zoom-.25)),
   zoomLabel,
   button('Ampliar microestrutura','+',()=>setZoom(zoom+.25)),
   button('Ajustar microestrutura ao quadro','Ajustar',()=>setZoom(1)),
   status
  );
  svg.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+(e.deltaY<0?.25:-.25));},{passive:false});
  svg.addEventListener('pointerdown',e=>{if(zoom<=1||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};suppressClick=false;svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;
   const r=svg.getBoundingClientRect(),factor=Math.min(r.width/W,r.height/H)||1;
   offsetX+=dx/factor;offsetY+=dy/factor;drag.x=e.clientX;drag.y=e.clientY;update();
  });
  const stop=e=>{if(!drag||e.pointerId!==drag.id)return;suppressClick=drag.moved;drag=null;
   if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
   if(suppressClick)queueMicrotask(()=>{suppressClick=false;});
  };
  svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
  viewport.append(svg);
  const note=node('p','silm-workshop-micro-caveat','Grãos e contornos ilustrativos · sem escala de medição, orientação cristalográfica ou metalografia específica');
  section.append(viewport,toolbar,note);
  update();return section;
 }
 return Object.freeze({create});
})();