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
 let layer=null,ring=null,toolbar=null,toggle=null,reset=null,advance=null,mark=null,status=null;
 let referenceId=null,notice='',selections={object:null,grain:null};
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
 // Guardamos o CENTRO como porcentagem da região, nunca como posição
 // absoluta em pixels. CSS limita o centro ao espaço útil, até quando
 // o WebKit troca a largura sem notificar o ResizeObserver.
 const place=()=>{
  if(!host||!ring||!layer?.isConnected||!settings.active)return;
  const [x,y]=currentPosition();
  ring.style.setProperty('--silm-lens-position-x',(x*100)+'%');
  ring.style.setProperty('--silm-lens-position-y',(y*100)+'%');
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

 // A seleção da lente é UI didática. Nenhuma das coordenadas abaixo é uma
 // coordenada metalográfica, cristalográfica ou uma medição em micrômetros.
 const currentReference=()=>root.SILMIntegration?.snapshot?.()?.metadata?.workshop?.referenceId||null;
 const lensCenter=()=>{
  if(!ring?.isConnected)return null;
  const rect=ring.getBoundingClientRect();
  return {x:rect.left+rect.width/2,y:rect.top+rect.height/2};
 };
 const resetSelectionIfReferenceChanged=()=>{
  const id=currentReference();
  if(id===referenceId)return;
  referenceId=id;notice='';selections={object:null,grain:null};
 };
 const objectRegionAt=(center)=>{
  if(!host||!center)return null;
  // object-fit:contain pode deixar faixas vazias. Não aceitar cliques
  // nessas faixas como observações sobre a peça.
  const img=host.querySelector('img');
  const visual=img||host.querySelector('svg');
  if(!visual)return null;
  const rect=visual.getBoundingClientRect();
  let width=rect.width,height=rect.height,left=rect.left,top=rect.top;
  if(img){
   if(!img.complete||!img.naturalWidth||!img.naturalHeight)return null;
   const fit=Math.min(width/img.naturalWidth,height/img.naturalHeight);
   width=img.naturalWidth*fit;height=img.naturalHeight*fit;
   left+=((rect.width-width)/2);top+=((rect.height-height)/2);
  }
  if(width<2||height<2||center.x<left||center.x>left+width
     ||center.y<top||center.y>top+height)return null;
  const x=clamp((center.x-left)/width,0,1),y=clamp((center.y-top)/height,0,1);
  const row=y<1/3?'superior':y<2/3?'central':'inferior';
  const column=x<1/3?'esquerda':x<2/3?'central':'direita';
  const region=row==='central'&&column==='central'?'central':
   row==='central'?column:column==='central'?row:row+' '+column;
  return {kind:'object',referenceId,x,y,label:'Região visual '+region};
 };
 const grainAt=(center)=>{
  const svg=host?.querySelector('svg.silm-workshop-micro-map');
  if(!svg||!center)return null;
  const grains=[...svg.querySelectorAll('.silm-micro-grain')];
  // A matriz de cada path inclui a câmera SVG, o zoom e o deslocamento da
  // microestrutura. A interseção é REAL com o contorno que o motor desenhou.
  for(const [i,path] of grains.entries()){
   try{
    const transform=path.getScreenCTM();
    if(!transform||typeof path.isPointInFill!=='function')continue;
    const local=new DOMPoint(center.x,center.y).matrixTransform(transform.inverse());
    if(!path.isPointInFill(local))continue;
    // Reutilizar o manipulador nativo choose(i) do próprio SILM: sem
    // selecionar o "grão mais próximo" e sem alterar a semente/contornos.
    path.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    const number=String(i+1);
    if(svg.dataset.selectedGrain!==number)return null;
    const section=svg.closest('.silm-workshop-micro-viewer');
    const source=section?.dataset.microstructureSource||'unknown';
    return {kind:'grain',referenceId,number,source,d:path.getAttribute('d'),
     label:source==='schematic'?'Grão ilustrativo '+number:
      'Grão de contorno importado '+number+' · não homologado'};
   }catch{/* Transformação SVG indisponível: não inventar o grão. */}
  }
  return null;
 };
 const selectedForScale=()=>{
  if(scale===1)return selections.object?.referenceId===referenceId?selections.object:null;
  if(scale===2){
   const s=selections.grain,svg=host?.querySelector('svg.silm-workshop-micro-map');
   const path=s&&svg?.querySelectorAll('.silm-micro-grain')?.[Number(s.number)-1];
   const section=svg?.closest('.silm-workshop-micro-viewer');
   if(s?.referenceId!==referenceId||svg?.dataset.selectedGrain!==s?.number
      ||path?.getAttribute('d')!==s?.d||section?.dataset.microstructureSource!==s?.source)return null;
   return s;
  }
  return null;
 };
 const updateSelectionStatus=()=>{
  if(!status)return;
  const result=selectedForScale();
  const message=notice||(result?result.label+(scale===1?
   ' · imagem ilustrativa, sem amostra medida':result.source==='schematic'?
   ' · modelo D0, sem medição experimental':' · proveniência declarada, sem homologação'):'');
  status.textContent=message;
  setHidden(status,!settings.active||scale>2||!message);
 };
 const markSelection=()=>{
  if(!settings.active||!host||(scale!==1&&scale!==2))return false;
  resetSelectionIfReferenceChanged();
  const center=lensCenter();
  let result=null;
  if(scale===1)result=objectRegionAt(center);
  if(scale===2)result=grainAt(center);
  if(result){
   selections[scale===1?'object':'grain']=result;
   notice='';
  }else notice=scale===1?'Posicione a lente sobre a ilustração.':
   'Nenhum contorno de grão sob o centro da lente.';
  updateSelectionStatus();
  return !!result;
 };

 const render=()=>{
  if(!layer)return;
  const active=settings.active;
  setHidden(ring,!active);
  setHidden(reset,!active);
  setHidden(advance,!active||scale>=4);
  setHidden(mark,!active||scale>2);
  toggle.setAttribute('aria-pressed',String(active));
  const name=active?'Ocultar':'Ativar';
  const label=name+' lente multiescala';
  toggle.setAttribute('aria-label',label);toggle.title=label;
  if(toggle.dataset.mode!==String(active)){
   toggle.dataset.mode=String(active);
   toggle.textContent=active?'◉':'◎';
  }
  if(ring)ring.setAttribute('aria-label','Lente na escala '+(labels[scale]||'')+
   '. Arraste ou use as setas para mover; Home centraliza; Enter marca a região visual ou grão.');
  if(advance)advance.setAttribute('aria-label','Aprofundar para '+(labels[scale+1]||'próxima escala'));
  if(mark){
   const label=scale===1?'Marcar região visual da ilustração':'Destacar grão sob a lente';
   mark.setAttribute('aria-label',label);mark.title=label;
  }
  if(active)place();
  updateSelectionStatus();
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
  const scaleChanged=scale!==nextScale;
  scale=nextScale;
  resetSelectionIfReferenceChanged();
  if(scaleChanged)notice='';
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
  ring.tabIndex=0;ring.setAttribute('role','button');
  const cross=document.createElement('span');cross.className='silm-lens-reticle';
  cross.setAttribute('aria-hidden','true');
  ring.append(cross);
  toolbar=document.createElement('div');toolbar.className='silm-lens-actions';
  toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Ferramentas da lente');
  toggle=makeButton('silm-lens-toggle','◎','Ativar lente multiescala');
  reset=makeButton('silm-lens-reset','⊙','Centralizar lente');
  advance=makeButton('silm-lens-advance','↓','Aprofundar para a próxima escala');
  mark=makeButton('silm-lens-mark','⌖','Marcar região visual da ilustração');
  status=document.createElement('output');status.className='silm-lens-selection';
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  status.setAttribute('aria-atomic','true');
  toolbar.append(toggle,reset,mark,advance);
  layer.append(ring,status,toolbar);
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
  mark.addEventListener('click',markSelection);
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
   }else if((e.key==='Enter'||e.key===' ')&&scale<=2){
    e.preventDefault();e.stopPropagation();markSelection();
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
   position:scale?[...currentPosition()]:null,
   selected:scale<=2&&selectedForScale()?Object.freeze({
    kind:selectedForScale().kind,label:selectedForScale().label,
    referenceId:selectedForScale().referenceId,
    ...(scale===2?{number:selectedForScale().number,source:selectedForScale().source}:{})
   }):null
  })
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(window);
