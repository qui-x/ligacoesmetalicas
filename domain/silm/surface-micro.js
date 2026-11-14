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
  let tiles=[],paint=null;
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
   overlay.replaceChildren();tiles=[];
   const cols=24,rows=15;
   for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const tile=document.createElementNS(NS,'rect');
    tile.setAttribute('x',x*width/cols);tile.setAttribute('y',y*height/rows);
    tile.setAttribute('width',width/cols+.35);tile.setAttribute('height',height/rows+.35);
    tile.setAttribute('fill','#fff');tile.setAttribute('opacity','0');
    tile.setAttribute('pointer-events','none');
    overlay.append(tile);tiles.push(tile);
   }
   mechanicalField.append(overlay);
   refresh();
  }
  function refresh(){
   const st=model.state,surface=physics.current(st),focusing=focus(st),on=visible(st,surface),angle=drive?.angle??35,eye=drive?.observerAngle??35;
   controls.hidden=!on;section.dataset.surfaceOptical=on?'active':'inactive';
   section.dataset.surfaceCoobservation=on&&!focusing?'active':'inactive';
   tool.disabled=!focusing;
   apply.disabled=!focusing||tool.value==='observe'||!getSelectedPoint?.();
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
  return Object.freeze({rebuild,refresh,controls});
 }
 SILM.surfaceMicro=Object.freeze({attach});
})();
