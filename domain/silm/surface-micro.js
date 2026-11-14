'use strict';
window.SILM=window.SILM||{};
/* Camada óptica integrada aos grãos existentes; sem segundo canvas.
   O acabamento é do estado da investigação, não dos polígonos Voronoi.
   Preparação, aquecimento e deformação são qualitativos até calibração.
*/
(()=>{
 const NS='http://www.w3.org/2000/svg',clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const n=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 function attach({section,svg,mechanicalField,toolbar,model,element,getSize,getSelectedPoint}){
  const physics=SILM.surfacePhysics,drive=SILM.drive?.controller(model);
  if(!physics||!model)return null;
  const overlay=document.createElementNS(NS,'g');
  overlay.setAttribute('class','silm-micro-surface-field');
  overlay.setAttribute('pointer-events','none');
  // Um único conjunto de gradientes SVG é suficiente para toda a amostra.
  // Os pontos de claro/escuro mostram a localização das intervenções:
  // não são topografia 3D medida nem sombras por traçado de raios.
  const shading=document.createElementNS(NS,'g');
  shading.setAttribute('class','silm-micro-deformation-shading');
  shading.setAttribute('pointer-events','none');
  const defs=document.createElementNS(NS,'defs');
  const prefix='silm-deform-light-'+Math.random().toString(36).slice(2);
  const svgEl=(tag,attrs)=>{
   const el=document.createElementNS(NS,tag);
   for(const [key,value]of Object.entries(attrs))el.setAttribute(key,String(value));
   return el;
  };
  const gradient=(id,color)=>{
   const g=svgEl('radialGradient',{id});
   for(const [offset,alpha]of [[0,1],[.35,.72],[.74,.22],[1,0]])
    g.append(svgEl('stop',{offset,'stop-color':color,'stop-opacity':alpha}));
   defs.append(g);
  };
  gradient(prefix+'-shadow','#000');
  gradient(prefix+'-highlight','#fff');
  shading.append(defs);
  const spots=[];
  for(let i=0;i<17;i++){
   const shadow=svgEl('ellipse',{class:'silm-micro-contact-shadow',
    fill:'url(#'+prefix+'-shadow)',opacity:0,'pointer-events':'none'});
   const highlight=svgEl('ellipse',{class:'silm-micro-contact-highlight',
    fill:'url(#'+prefix+'-highlight)',opacity:0,'pointer-events':'none'});
   shading.append(shadow,highlight);spots.push({shadow,highlight});
  }
  const controls=n('div','silm-micro-surface-tools');
  controls.hidden=true;controls.setAttribute('role','group');
  controls.setAttribute('aria-label','Preparar e iluminar a mesma superfície metálica');
  const tool=n('select','silm-micro-surface-select');
  tool.setAttribute('aria-label','Ferramenta superficial');
  for(const [v,label] of [['observe','Observar grãos'],['brush','Escova de aço'],['sand','Lixa fina'],['polish','Polir']]){
   const o=n('option','',label);o.value=v;tool.append(o);
  }
  const light=n('button','silm-workshop-micro-control','Incidir luz');
  light.type='button';light.setAttribute('aria-label','Alternar luz sobre a superfície');
  const apply=n('button','silm-workshop-micro-control silm-micro-surface-apply','Aplicar ao grão');
  apply.type='button';apply.setAttribute('aria-label','Aplicar ferramenta ao grão selecionado');
  const reset=n('button','silm-workshop-micro-control','Repor superfície');
  reset.type='button';reset.setAttribute('aria-label','Restaurar acabamento da superfície');
  const createAngle=(label,min,fn)=>{
   const wrap=n('label','silm-micro-surface-angle');
   const text=n('span','',label),input=n('input');
   input.type='range';input.min=String(min);input.max='80';input.step='1';
   input.setAttribute('aria-label',label+' em graus');
   input.addEventListener('input',()=>{fn(Number(input.value));refresh();});
   wrap.append(text,input);return{wrap,input};
  };
  const source=createAngle('Fonte',5,v=>drive?.setAngle(v));
  const observer=createAngle('Observador',0,v=>drive?.setObserverAngle(v));
  const reading=n('output','silm-micro-surface-reading');
  reading.setAttribute('role','status');reading.setAttribute('aria-live','polite');
  controls.append(tool,apply,light,source.wrap,observer.wrap,reset,reading);
  toolbar.append(controls);
  let tiles=[],tileBoxes=[],paint=null,localWarp=null,lightField=null;
  const focus=st=>st.module?.active==='explorar'&&st.properties?.active==='luster';
  const eligibleForCoobservation=st=>st.module?.active==='explorar'&&
   ['electrical','thermal','malleability','ductility'].includes(st.properties?.active);
  // A iluminação preparada permanece observável enquanto a mesma amostra
  // recebe calor, campo ou força. Ferramentas abrasivas ficam em Brilho.
  const visible=(st,surface)=>focus(st)||(eligibleForCoobservation(st)&&
   (surface.light||surface.strokes.length>0));
  const active=()=>focus(model.state);
  function coord(e){
   const matrix=mechanicalField.getScreenCTM()?.inverse(),size=getSize();
   if(!matrix)return null;
   const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix);
   return {x:clamp(p.x/size.width),y:clamp(p.y/size.height)};
  }
  const draft=()=>paint?{tool:paint.tool,x0:paint.first.x,y0:paint.first.y,x1:paint.last.x,y1:paint.last.y,radius:.053}:null;
  function rebuild(){
   const {width,height}=getSize();
   overlay.replaceChildren();tiles=[];tileBoxes=[];
   const cols=24,rows=15;
   for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const tile=document.createElementNS(NS,'rect');
    tile.setAttribute('x',x*width/cols);tile.setAttribute('y',y*height/rows);
    tile.setAttribute('width',width/cols+.35);tile.setAttribute('height',height/rows+.35);
    tile.setAttribute('fill','#fff');tile.setAttribute('opacity','0');
    tile.setAttribute('pointer-events','none');
    overlay.append(tile);tiles.push(tile);
    tileBoxes.push({x:x*width/cols,y:y*height/rows,w:width/cols+.35,h:height/rows+.35});
   }
   mechanicalField.append(overlay,shading);
   setWarp(localWarp);
   refresh();
  }
  // As marcas de acabamento seguem o mesmo campo de deslocamento local
  // dos grãos. Cada tile recebe uma aproximação afim do campo FEM; é apenas
  // a apresentação visual, não recalibração dos índices ópticos do metal.
  function setWarp(map){
   localWarp=typeof map==='function'?map:null;
   for(let i=0;i<tiles.length;i++){
    const tile=tiles[i],p=tileBoxes[i];
    if(!localWarp){tile.removeAttribute('transform');continue;}
    const a=localWarp(p.x,p.y),b=localWarp(p.x+p.w,p.y),c=localWarp(p.x,p.y+p.h);
    if(![a?.x,a?.y,b?.x,b?.y,c?.x,c?.y].every(Number.isFinite)){
     tile.removeAttribute('transform');continue;
    }
    const m00=(b.x-a.x)/p.w,m10=(b.y-a.y)/p.w;
    const m01=(c.x-a.x)/p.h,m11=(c.y-a.y)/p.h;
    const tx=a.x-m00*p.x-m01*p.y,ty=a.y-m10*p.x-m11*p.y;
    tile.setAttribute('transform','matrix('+[m00,m10,m01,m11,tx,ty].join(' ')+')');
   }
  }
  function setDeformationLight(value){
   lightField=value&&typeof value==='object'?value:null;
   renderDeformationLight();
  }
  function renderDeformationLight(){
   const st=model.state,visual=SILM.specimenVisualLight;
   if(!visual){shading.setAttribute('visibility','hidden');return;}
   const surface=physics.current(st),size=getSize();
   const marks=st.module?.active==='explorar'&&Array.isArray(st.metadata?.mechanicalImprints)?st.metadata.mechanicalImprints:[];
   const count=visual.projectAll({
    marks,activeContact:st.module?.active==='explorar'?lightField?.contact:null,
    mode:st.module?.active==='explorar'?lightField?.mode:null,
    load:lightField?.load||0,field:lightField?.field,
    amplitude:lightField?.amplitude||0,
    incidenceDeg:drive?.angle??35,illuminated:surface.light
   });
   shading.setAttribute('visibility',count.length?'visible':'hidden');
   section.dataset.mechanicalShadows=count.length?'active':'inactive';
   section.dataset.mechanicalShadowZones=String(count.length);
   for(let i=0;i<spots.length;i++){
    const pair=spots[i],spot=count[i];
    for(const [el,name] of [[pair.shadow,'shadow'],[pair.highlight,'highlight']]){
     const data=spot?.[name];
     if(!data){el.setAttribute('opacity','0');continue;}
     el.setAttribute('cx',String(data.x*size.width));
     el.setAttribute('cy',String(data.y*size.height));
     el.setAttribute('rx',String(data.rx*size.width));
     el.setAttribute('ry',String(data.ry*size.height));
     el.setAttribute('opacity',String(data.opacity));
    }
   }
  }
  function refresh(){
   const st=model.state,surface=physics.current(st),focusing=focus(st),on=visible(st,surface),angle=drive?.angle??35,eye=drive?.observerAngle??35;
   controls.hidden=!on;section.dataset.surfaceOptical=on?'active':'inactive';
   section.dataset.surfaceCoobservation=on&&!focusing?'active':'inactive';
   section.dataset.surfaceTool=focusing?tool.value:'observe';
   tool.disabled=!focusing;
   const selected=getSelectedPoint?.();
   apply.disabled=!focusing||tool.value==='observe'||!selected||
    !Number.isFinite(selected.x)||!Number.isFinite(selected.y);
   reset.disabled=!focusing||!surface.strokes.length;
   section.dataset.surfaceStrokes=String(surface.strokes.length);
   section.dataset.surfacePlasticSteps=String(surface.plasticSteps);
   light.textContent=surface.light?'Apagar luz':'Incidir luz';
   light.setAttribute('aria-pressed',String(surface.light));
   source.input.value=String(angle);observer.input.value=String(eye);
   const ref=SILM.materialEngine?.optical?.(element.atomicNumber,550,angle);
   const R=ref?.ok?ref.reflectance:null,preview=draft();
   for(let i=0;i<tiles.length;i++){
    const u=((i%24)+.5)/24,v=(Math.floor(i/24)+.5)/15;
    const q=physics.response(st,{u,v,incidence:angle,observer:eye,reflectance:R,preview});
    // Representação luminosa qualitativa, não refletância/localização física medida.
    const opacity=!on?0:surface.light?.12+.62*q.specularRelative:.035+.13*q.specularRelative;
    tiles[i].setAttribute('opacity',String(clamp(opacity,0,.78)));
   }
   renderDeformationLight();
   const suffix=R===null?'resposta óptica qualitativa':'Fresnel 550 nm de referência, sem CNTP confirmada';
   reading.textContent=surface.strokes.length+' traçado(s) · '+surface.plasticSteps+
    ' passo(s) plásticos · '+suffix+
    (on&&!focusing?' · Observação óptica mantida durante '+({
      malleability:'compressão',ductility:'tração',thermal:'aquecimento',electrical:'condução elétrica'
     }[st.properties.active]||'outra propriedade')+'.':'')+
    ' Aquecimento/eletricidade não implicam oxidação ou corrente local calculada.';
  }
  light.addEventListener('click',()=>{
   const st=model.state,surface=physics.current(st);
   if(!visible(st,surface))return;
   model.setSurfaceLight(!surface.light);refresh();
  });
  apply.addEventListener('click',()=>{
   if(!active()||tool.value==='observe')return;
   const p=getSelectedPoint?.();if(!p)return;
   // Ação equivalente ao arraste para quem utiliza teclado, toque
   // assistido ou controle por alternância.
   const stroke={tool:tool.value,x0:clamp(p.x-.035),y0:clamp(p.y),
    x1:clamp(p.x+.035),y1:clamp(p.y),radius:.053};
   model.applySurfaceTreatment(stroke);refresh();
  });
  reset.addEventListener('click',()=>{model.resetSurface();refresh();});
  tool.addEventListener('change',refresh);
  svg.addEventListener('pointerdown',e=>{
   if(!active()||tool.value==='observe'||e.button!==0)return;
   const p=coord(e);if(!p)return;
   e.preventDefault();e.stopImmediatePropagation();
   paint={id:e.pointerId,tool:tool.value,first:p,last:p};
   try{svg.setPointerCapture(e.pointerId);}catch{}
   refresh();
  },true);
  svg.addEventListener('pointermove',e=>{
   if(!paint||e.pointerId!==paint.id)return;
   const p=coord(e);if(!p)return;
   e.preventDefault();e.stopImmediatePropagation();paint.last=p;refresh();
  },true);
  function end(e,commit){
   if(!paint||e.pointerId!==paint.id)return;
   e.preventDefault();e.stopImmediatePropagation();
   const s=draft();paint=null;
   if(commit&&s)model.applySurfaceTreatment(s);
   if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
   refresh();
  }
  svg.addEventListener('pointerup',e=>end(e,true),true);
  svg.addEventListener('pointercancel',e=>end(e,false),true);
  svg.addEventListener('click',e=>{
   if(active()&&tool.value!=='observe'){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  if(drive){
   let attached=false;
   const off=drive.subscribe(()=>{
    if(section.isConnected){attached=true;refresh();}
    else if(attached)off();
   });
  }
  return Object.freeze({rebuild,refresh,setWarp,setDeformationLight,controls});
 }
 SILM.surfaceMicro=Object.freeze({attach});
})();
