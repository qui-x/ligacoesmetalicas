'use strict';
/* Lente multiescala: CAMADA DE INTERFACE, não motor científico.
   Usa os visualizadores reais e os botões de escala já existentes.
   Não altera o snapshot, a geometria, as propriedades ou os grãos. */
((root)=>{
 const KEY='silm:ui:lente-multiescala:v1';
 const labels={1:'Objeto',2:'Grãos',3:'Rede',4:'Centro'};
 const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
 const initial=()=>{try{
  const value=JSON.parse(root.localStorage.getItem(KEY)||'null');
  if(value?.schema==='silm.lens-ui.v1'){
   const positions={};
   for(let n=1;n<=4;n++){
    const xy=value.positions?.[n];
    positions[n]=Array.isArray(xy)&&xy.length===2&&xy.every(Number.isFinite)
     ?xy.map(x=>clamp(x,0,1)):[.5,.5];
   }
   return {active:value.active===true,positions};
  }
 }catch{/* Preferências locais indisponíveis: usar configuração segura. */}
 return {active:false,positions:{1:[.5,.5],2:[.5,.5],3:[.5,.5],4:[.5,.5]}};
 };
 let settings=initial(),stage=null,host=null,scale=0,drag=null,raf=0;
 let layer=null,ring=null,toolbar=null,toggle=null,reset=null,advance=null;
 let observer=null,resizer=null;
 const save=()=>{try{root.localStorage.setItem(KEY,JSON.stringify({
  schema:'silm.lens-ui.v1',active:settings.active,positions:settings.positions
 }));}catch{/* O funcionamento não depende da persistência. */}};
 const makeButton=(cls,icon,label)=>{
  const b=document.createElement('button');b.type='button';b.className='silm-lens-tool '+cls;
  b.textContent=icon;b.setAttribute('aria-label',label);b.title=label;return b;
 };
 const setHidden=(node,yes)=>{if(node&&node.hidden!==yes)node.hidden=yes;};
 const currentPosition=()=>settings.positions[scale]||[.5,.5];
 const place=()=>{
  if(!host||!ring||!layer?.isConnected||!settings.active)return;
  const w=layer.clientWidth,h=layer.clientHeight;
  const size=ring.getBoundingClientRect();
  if(w<80||h<80||size.width===0||size.height===0)return;
  const gap=5;
  const left=clamp(w*currentPosition()[0]-size.width/2,gap,Math.max(gap,w-size.width-gap));
  const top=clamp(h*currentPosition()[1]-size.height/2,gap,Math.max(gap,h-size.height-gap));
  ring.style.left=left+'px';ring.style.top=top+'px';
 };
 const move=(dx,dy)=>{
  if(!host||!scale)return;
  const w=Math.max(1,layer.clientWidth),h=Math.max(1,layer.clientHeight);
  const [x,y]=currentPosition();
  settings.positions[scale]=[clamp(x+dx/w,0,1),clamp(y+dy/h,0,1)];
  place();save();
 };
 const center=()=>{
  if(!scale)return;
  settings.positions[scale]=[.5,.5];place();save();
 };
 const render=()=>{
  if(!layer)return;
  const active=settings.active;
  setHidden(ring,!active);
  setHidden(reset,!active);
  setHidden(advance,!active||scale>=4);
  toggle.setAttribute('aria-pressed',String(active));
  const name=active?'Ocultar':'Ativar';
  const label=name+' lente multiescala';
  toggle.setAttribute('aria-label',label);toggle.title=label;
  if(toggle.dataset.mode!==String(active)){
   toggle.dataset.mode=String(active);
   toggle.textContent=active?'◉':'◎';
  }
  if(ring)ring.setAttribute('aria-label','Lente na escala '+(labels[scale]||'')+
   '. Arraste ou use as setas para mover; tecla Home para centralizar.');
  if(advance)advance.setAttribute('aria-label','Aprofundar para '+(labels[scale+1]||'próxima escala'));
  if(active)place();
 };
 const targetFor=n=>{
  if(n===1)return stage.querySelector('#silm-workshop-context .silm-workshop-reference-art');
  if(n===2)return stage.querySelector('#silm-workshop-context .silm-workshop-micro-viewport');
  if(n===3||n===4)return stage.querySelector('#silm-integration-scene .silm-assembly-stage');
  return null;
 };
 const sync=()=>{
  raf=0;
  if(!stage||!layer)return;
  const nextScale=Number(stage.dataset.workshopScale);
  const focus=document.getElementById('workspace-focus');
  const overview=document.getElementById('workspace-overview');
  const isActiveRoute=document.body.dataset.silmRoute==='ambiente';
  const visible=isActiveRoute&&focus&&!focus.hidden&&overview?.hidden===true
    &&Number.isInteger(nextScale)&&nextScale>=1&&nextScale<=4;
  const nextHost=visible?targetFor(nextScale):null;
  if(!nextHost||nextHost.closest('[hidden]')||!nextHost.getClientRects().length){
   if(resizer&&host)resizer.unobserve(host);
   host=null;scale=0;
   if(layer.isConnected)layer.remove();
   return;
  }
  const changedHost=host!==nextHost;
  if(changedHost){
   if(resizer&&host)resizer.unobserve(host);
   host=nextHost;
   if(resizer)resizer.observe(host);
  }
  scale=nextScale;
  if(layer.parentNode!==host)host.append(layer);
  layer.dataset.scale=String(scale);
  render();
 };
 const schedule=()=>{
  if(raf)return;
  raf=root.requestAnimationFrame(sync);
 };
 const deeper=()=>{
  if(scale>=4)return;
  const step=stage?.querySelector('.silm-workshop-scale[data-scale="'+(scale+1)+'"]');
  // O click aciona setWorkshopScale e as verificações do próprio motor.
  if(step&&!step.disabled)step.click();
 };
 const init=()=>{
  stage=document.getElementById('si-stage');
  if(!stage||stage.dataset.lensController==='ready')return;
  stage.dataset.lensController='ready';
  layer=document.createElement('div');layer.className='silm-lens-layer';
  layer.setAttribute('data-testid','silm-lens-layer');
  ring=document.createElement('div');ring.className='silm-lens-circle';
  ring.tabIndex=0;ring.setAttribute('role','group');
  const cross=document.createElement('span');cross.className='silm-lens-reticle';
  cross.setAttribute('aria-hidden','true');
  ring.append(cross);
  toolbar=document.createElement('div');toolbar.className='silm-lens-actions';
  toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Ferramentas da lente');
  toggle=makeButton('silm-lens-toggle','◎','Ativar lente multiescala');
  reset=makeButton('silm-lens-reset','⊙','Centralizar lente');
  advance=makeButton('silm-lens-advance','↓','Aprofundar para a próxima escala');
  toolbar.append(toggle,reset,advance);
  layer.append(ring,toolbar);
  // A cena cristalina ouve eventos de ponteiro. Os controles da lente
  // devem ser isolados para não clicar/arrastar átomos ao mesmo tempo.
  for(const event of ['pointerdown','pointerup','click']){
   toolbar.addEventListener(event,e=>e.stopPropagation());
  }
  toggle.addEventListener('click',()=>{
   settings.active=!settings.active;save();render();
   if(settings.active)ring.focus({preventScroll:true});
  });
  reset.addEventListener('click',center);
  advance.addEventListener('click',deeper);
  ring.addEventListener('pointerdown',e=>{
   if(e.button!==0||!settings.active)return;
   drag={id:e.pointerId,x:e.clientX,y:e.clientY};
   ring.setPointerCapture(e.pointerId);
   e.preventDefault();e.stopPropagation();
  });
  ring.addEventListener('pointermove',e=>{
   if(!drag||drag.id!==e.pointerId)return;
   move(e.clientX-drag.x,e.clientY-drag.y);
   drag.x=e.clientX;drag.y=e.clientY;
   e.preventDefault();e.stopPropagation();
  });
  const release=e=>{
   if(!drag||drag.id!==e.pointerId)return;
   drag=null;
   if(ring.hasPointerCapture(e.pointerId))ring.releasePointerCapture(e.pointerId);
   e.stopPropagation();
  };
  ring.addEventListener('pointerup',release);
  ring.addEventListener('pointercancel',release);
  ring.addEventListener('click',e=>e.stopPropagation());
  ring.addEventListener('keydown',e=>{
   const arrows={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};
   if(arrows[e.key]){
    e.preventDefault();e.stopPropagation();
    const [dx,dy]=arrows[e.key];const step=e.shiftKey?3:1;
    move(dx*step,dy*step);
   }else if(e.key==='Home'){
    e.preventDefault();e.stopPropagation();center();
   }
  });
  // Os renderizadores substituem o conteúdo da cena ao trocar de escala.
  // Observar somente mudanças estruturais/de visibilidade permite manter
  // a MESMA lente sem usar pixels como coordenadas cristalográficas.
  observer=new MutationObserver(schedule);
  observer.observe(stage,{childList:true,subtree:true,attributes:true,
   attributeFilter:['hidden','data-workshop-scale']});
  if(typeof ResizeObserver!=='undefined')resizer=new ResizeObserver(schedule);
  root.addEventListener('resize',schedule,{passive:true});
  root.addEventListener('si-route-changed',schedule);
  schedule();
 };
 root.SILM=root.SILM||{};
 root.SILM.lensController=Object.freeze({
  schema:'silm.lens-ui.v1',
  sync:schedule,
  inspect:()=>Object.freeze({
   active:settings.active,scale,attached:!!layer?.isConnected,
   targetClass:host?.className||null,
   position:scale?[...currentPosition()]:null
  })
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(window);
