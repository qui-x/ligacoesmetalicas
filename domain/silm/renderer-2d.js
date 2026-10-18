'use strict';
window.SILM=window.SILM||{};
/* Renderizador 2D científico comum (0.11.x): o mesmo palco para a montagem livre, a estrutura cristalina e a
   comparação, em Explorar, Medir e Calcular. Muda só o que se desenha por cima (camadas, sobreposições, controles).
   - Coordenadas: científicas (montagem livre: posição normalizada; cristal: Å) → cena (0..1, estável, sem depender
     da tela) → palco (frações do palco quadrado) → px. A inversa (px → cena) serve ao toque, ao arrasto e ao destino.
     Medições e cálculos usam só as coordenadas científicas: zoom, pan, projeção e tamanho da tela nunca entram neles.
   - Câmera = representação (SILM.representation): pan e zoom em unidades da cena, aplicados por um único transform às
     camadas do mundo. Redimensionar a tela ou abrir o teclado virtual não move a estrutura.
   - Camadas numa ordem central (LAYERS, data-layer e --z no CSS), sem z-index espalhado.
   - Toque central: item mais próximo dentro do raio mais uma tolerância (maior no toque), à frente vence o empate.
   - Gestos: toque seleciona; arrastar o fundo desloca; pinça (ou Ctrl/⌘ + roda) aproxima em torno do ponto.
     Teclado na área da cena: + − 0 F C e Shift + setas (deslocar). Câmera fora do Desfazer; um anúncio por gesto.
   - Medida de medição ≠ ligação química; escala visual ≠ escala física (texto da camada semântica). */
SILM.renderer2d=(()=>{
 const R=SILM.representation,Z=R.ZOOM,NS='http://www.w3.org/2000/svg';
 const LAYERS=Object.freeze(['background','lattice','unitCell','neighbors','electrons','properties','structure','measurementOverlay','calculationOverlay','labels','selection']);
 const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
 const toView=(cam,p)=>({x:(p.x-cam.x)*cam.zoom+.5,y:(p.y-cam.y)*cam.zoom+.5});
 const toScene=(cam,v)=>({x:(v.x-.5)/cam.zoom+cam.x,y:(v.y-.5)/cam.zoom+cam.y});
 function boundsOf(points,pad=0){
  if(!points.length)return {x0:0,y0:0,x1:1,y1:1};const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  return {x0:Math.min(...xs)-pad,y0:Math.min(...ys)-pad,x1:Math.max(...xs)+pad,y1:Math.max(...ys)+pad};
 }
 /* Enquadrar: a caixa de interesse ocupa o palco com a margem dada (a mesma regra do layout da cena). */
 const tidy=v=>Math.round(v*1e10)/1e10;   // sem resíduo de ponto flutuante: a vista enquadrada da cena é exatamente a identidade
 function fit(b,margin=.12){const w=Math.max(b.x1-b.x0,1e-6),h=Math.max(b.y1-b.y0,1e-6);return {mode:'fit',zoom:tidy(clamp((1-2*margin)/Math.max(w,h),Z.min,Z.max)),x:tidy((b.x0+b.x1)/2),y:tidy((b.y0+b.y1)/2)};}
 function zoomAt(cam,factor,anchor={x:.5,y:.5}){const zoom=clamp(cam.zoom*factor,Z.min,Z.max),s=toScene(cam,anchor);return {mode:'free',zoom,x:s.x-(anchor.x-.5)/zoom,y:s.y-(anchor.y-.5)/zoom};}
 function panBy(cam,dx,dy){return {mode:'free',zoom:cam.zoom,x:cam.x-dx/cam.zoom,y:cam.y-dy/cam.zoom};}
 /* O pan não deixa a estrutura sair do palco: o centro da vista fica na caixa de interesse, alargada pela vista. */
 function limit(cam,b){const m=.45/cam.zoom;return {...cam,x:clamp(cam.x,b.x0-m,b.x1+m),y:clamp(cam.y,b.y0-m,b.y1+m)};}
 const same=(a,b)=>a.mode===b.mode&&Math.abs(a.zoom-b.zoom)<1e-7&&Math.abs(a.x-b.x)<1e-7&&Math.abs(a.y-b.y)<1e-7;
 /* items: [{id, x, y, r (frações do palco), depth, priority}]; v em frações; tolerance em frações. */
 function hit(items,v,tolerance=0){
  let best=null;
  for(const it of items){const d=Math.max(0,Math.hypot(it.x-v.x,it.y-v.y)-it.r);if(d>tolerance)continue;
   const better=!best||d<best.d-1e-9||(Math.abs(d-best.d)<1e-9&&((it.priority||0)>best.priority||((it.priority||0)===best.priority&&(it.depth??.5)<best.depth)));
   if(better)best={id:it.id,d,priority:it.priority||0,depth:it.depth??.5};}
  return best?.id??null;
 }
 const svgRoot=cls=>{const s=document.createElementNS(NS,'svg');s.setAttribute('aria-hidden','true');s.setAttribute('class',cls);return s;};
 const svgEl=(parent,tag,attrs,text=null)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==null)n.textContent=text;parent.append(n);return n;};

 function createStage(stage,{scope,area=null,readOnly=false,idPrefix='silm',camera:initial=null,reducedMotion=()=>false,announce=()=>{},describe=null,
  onCamera=null,onBackgroundTap=null,onUnitTap=null,onUnitPress=null,items=()=>[],focusPoint=null,canArrowPan=()=>true,onReset=null,toolbar=!readOnly,
  ownsUnitDrag=false,onGestureStart=null,toggleHost=null}={}){
  const U=SimCore.ExperienceUI;
  let cam=R.sanitizeCamera(initial||R.camera()),interest={x0:0,y0:0,x1:1,y1:1},margin=0,size=0;
  stage.classList.add('silm-stage');stage.dataset.renderer='2d';if(readOnly)stage.dataset.readonly='';
  const order=[],listeners={camera:new Set(),resize:new Set()};
  const zoomText=()=>Math.round(cam.zoom*100)+' %';
  /* Camadas: cada elemento entra no palco na posição da ordem central; as do mundo recebem a câmera. */
  function layer(name,element,{camera=false}={}){
   const k=LAYERS.indexOf(name);if(k<0)throw new Error('Camada desconhecida: '+name);
   element.dataset.layer=name;element.classList.add('silm-stage-layer');if(camera)element.dataset.camera='';
   const next=[...stage.children].find(el=>el.dataset?.layer&&LAYERS.indexOf(el.dataset.layer)>k);stage.insertBefore(element,next||description||null);
   order.push(name);if(camera)element.style.transform=transform();return element;
  }
  const transform=()=>`translate(${((.5-cam.x*cam.zoom)*100).toFixed(4)}%,${((.5-cam.y*cam.zoom)*100).toFixed(4)}%) scale(${cam.zoom.toFixed(5)})`;
  /* ---------- camada semântica ---------- */
  let description=null;
  if(!readOnly){description=U.element('p','','sr-only silm-scene-description');description.id=idPrefix+'-scene-description';stage.append(description);
   const ids=(stage.getAttribute('aria-describedby')||'').split(' ').filter(Boolean);if(!ids.includes(description.id))stage.setAttribute('aria-describedby',[...ids,description.id].join(' '));}
  const cameraText=()=>'Vista: zoom '+zoomText()+(cam.mode==='fit'?', enquadrada':'')+'. O zoom muda só a apresentação; as medidas e o estado científico não mudam (escala visual não é escala física).';
  function describeNow(){if(description)description.textContent=[describe?.(),cameraText()].filter(Boolean).join(' ');}
  /* ---------- barra de câmera (fora do palco, sobre o canto da cena; gramática de controles da família) ---------- */
  let bar=null,zoomLabel=null,inButton=null,outButton=null,dock=null;
  if(toolbar&&area){
   /* No celular e na paisagem curta, a barra fica recolhida atrás de "Vista" (como "Doses" no SIAB): a cena não fica coberta. */
   dock=U.element('div',null,'silm-camera');const toggle=U.element('button',null,'secondary-btn silm-camera-toggle');toggle.type='button';toggle.id=idPrefix+'-camera-toggle';
   toggle.append(U.element('span','Vista'));toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',idPrefix+'-camera-bar');toggle.title='Mostrar ou ocultar os controles da vista';
   bar=U.element('div',null,'silm-camera-bar');bar.id=idPrefix+'-camera-bar';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Controles da vista');
   scope.listen(toggle,'click',()=>{const open=dock.dataset.open===undefined;if(open)dock.dataset.open='';else delete dock.dataset.open;toggle.setAttribute('aria-expanded',String(open));if(open)(bar.querySelector('button[tabindex="0"]')||bar.querySelector('button'))?.focus();});
   scope.listen(dock,'keydown',e=>{if(e.key==='Escape'&&dock.dataset.open!==undefined&&getComputedStyle(toggle).display!=='none'){e.preventDefault();e.stopPropagation();delete dock.dataset.open;toggle.setAttribute('aria-expanded','false');toggle.focus();}});
   // toggleHost: o botão "Vista" fica nas ferramentas do cabeçalho da cena (não cobre unidades em 320 px).
   if(toggleHost){toggleHost.append(toggle);dock.append(bar);}else dock.append(toggle,bar);
   const button=(id,glyph,label,key,run)=>{const b=U.element('button',null,'secondary-btn silm-camera-btn');b.type='button';b.id=idPrefix+'-camera-'+id;b.setAttribute('aria-label',label);b.title=label+' (tecla '+key+')';b.tabIndex=-1;
    const g=U.element('span',glyph,'silm-camera-glyph');g.setAttribute('aria-hidden','true');b.append(g);scope.listen(b,'click',()=>{if(b.getAttribute('aria-disabled')!=='true')run();});return b;};
   inButton=button('in','+','Aproximar','+',()=>zoomStep(Z.step));outButton=button('out','−','Afastar','−',()=>zoomStep(1/Z.step));
   const fitButton=button('fit','⤢','Enquadrar a estrutura','F',()=>fitNow()),centerButton=button('center','⌖','Centralizar','C',()=>centerNow()),resetButton=button('reset','↺','Restaurar vista','0',()=>resetNow());
   // Valor do zoom só visual: <output> seria região viva e falaria a cada quadro do gesto; o anúncio é um por gesto.
   zoomLabel=U.element('span',zoomText(),'silm-camera-zoom');zoomLabel.id=idPrefix+'-camera-zoom';zoomLabel.setAttribute('aria-hidden','true');
   bar.append(inButton,zoomLabel,outButton,fitButton,centerButton,resetButton);inButton.tabIndex=0;area.append(dock);
   const buttons=[inButton,outButton,fitButton,centerButton,resetButton];
   scope.listen(bar,'keydown',e=>{const k=buttons.indexOf(document.activeElement);if(k<0)return;const next={ArrowDown:k+1,ArrowRight:k+1,ArrowUp:k-1,ArrowLeft:k-1,Home:0,End:buttons.length-1}[e.key];
    if(next==null||e.shiftKey)return;e.preventDefault();e.stopPropagation();const t=buttons[(next+buttons.length)%buttons.length];for(const b of buttons)b.tabIndex=b===t?0:-1;t.focus();});
  }
  function apply(){
   const t=transform();for(const el of stage.querySelectorAll(':scope>[data-camera]'))el.style.transform=t;
   stage.style.setProperty('--camera-zoom',cam.zoom.toFixed(4));stage.dataset.cameraMode=cam.mode;
   if(zoomLabel)zoomLabel.textContent=zoomText();inButton?.setAttribute('aria-disabled',String(cam.zoom>=Z.max-1e-6));outButton?.setAttribute('aria-disabled',String(cam.zoom<=Z.min+1e-6));
   for(const fn of listeners.camera)fn(cam);
  }
  let settleTimer=0;
  function settle(say=null){if(settleTimer){clearTimeout(settleTimer);settleTimer=0;}describeNow();onCamera?.({...cam});if(say)announce(say);}
  function scheduleSettle(say){if(settleTimer)clearTimeout(settleTimer);settleTimer=setTimeout(()=>{settleTimer=0;settle(say?.());},420);}
  scope.cleanup(()=>{if(settleTimer)clearTimeout(settleTimer);settleTimer=0;});
  function setCamera(next,{animate=false,say=null,settled=true}={}){
   next=limit(R.sanitizeCamera(next),interest);const changed=!same(next,cam);cam=next;
   if(changed){if(animate&&!reducedMotion()){stage.dataset.cameraAnimate='';scope.timeout(()=>{delete stage.dataset.cameraAnimate;},240);}apply();}
   if(settled)settle(say);
   return changed;
  }
  /* Caixa de interesse (estrutura desenhada): em modo 'fit', a câmera a acompanha. */
  function setInterest(b,{margin:m=.12}={}){interest=b;margin=m;if(cam.mode==='fit')setCamera(fit(b,m),{settled:false});else{const c=limit(cam,b);if(!same(c,cam)){cam=c;apply();}}describeNow();}
  const zoomStep=f=>{const z=Math.round(clamp(cam.zoom*f,Z.min,Z.max)*100);setCamera(zoomAt(cam,f),{animate:true,say:'Vista: zoom '+z+' %.'});};
  function fitNow(){setCamera(fit(interest,margin),{animate:true,say:'Vista enquadrada: zoom '+Math.round(fit(interest,margin).zoom*100)+' %.'});}
  function centerNow(){const p=focusPoint?.()||{x:(interest.x0+interest.x1)/2,y:(interest.y0+interest.y1)/2};setCamera({mode:'free',zoom:cam.zoom,x:p.x,y:p.y},{animate:true,say:'Vista centralizada.'});}
  function resetNow(){onReset?.();setCamera(fit(interest,margin),{animate:true,say:'Vista restaurada.'});}
  /* Foco fora da vista (Tab, setas, leitor de tela): a câmera desloca o mínimo para mostrar o item; o palco nunca rola. */
  function ensureVisible(p){
   if(!p)return false;const v=toView(cam,p),m=Math.min(.4,.06+(p.r||0)*cam.zoom);let dx=0,dy=0;
   if(v.x<m)dx=m-v.x;else if(v.x>1-m)dx=1-m-v.x;if(v.y<m)dy=m-v.y;else if(v.y>1-m)dy=1-m-v.y;
   return dx||dy?setCamera(panBy(cam,dx,dy),{animate:true}):false;
  }
  // Foco por Tab ou leitor de tela rola o palco (overflow hidden): volta a zero, porque a inversa da câmera não conta rolagem.
  scope.listen(stage,'scroll',()=>{if(stage.scrollLeft||stage.scrollTop){stage.scrollLeft=0;stage.scrollTop=0;}});
  /* ---------- palco quadrado: posições normalizadas independem do tamanho da tela ---------- */
  let frame=0;
  function measure(){frame=0;const host=area||stage.parentElement;if(!host)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;   // oculto (outra rota, tela cheia): ignora 0×0
   const next=Math.max(160,Math.floor(Math.min(w,h))-2);if(next===size)return;size=next;stage.style.setProperty('--stage',size+'px');area?.style.setProperty('--stage',size+'px');for(const fn of listeners.resize)fn(size);}
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  if(area||stage.parentElement){if(window.ResizeObserver)scope.observe(new ResizeObserver(schedule),area||stage.parentElement);else scope.listen(window,'resize',schedule);}
  scope.cleanup(()=>{if(frame)cancelAnimationFrame(frame);frame=0;});
  /* ---------- entrada ---------- */
  const viewPoint=e=>{const r=stage.getBoundingClientRect(),w=stage.clientWidth||r.width,h=stage.clientHeight||r.height;return {x:(e.clientX-r.left-stage.clientLeft)/w,y:(e.clientY-r.top-stage.clientTop)/h};};
  const clientToScene=e=>toScene(cam,viewPoint(e));
  function sceneToClient(p){const r=stage.getBoundingClientRect(),w=stage.clientWidth||r.width,h=stage.clientHeight||r.height,v=toView(cam,p);return {x:r.left+stage.clientLeft+v.x*w,y:r.top+stage.clientTop+v.y*h};}
  const tolerance=type=>{const px=type==='mouse'?4:22;return size?px/size:.05;};
  function viewItems(){return items().filter(it=>it.hit!==false).map(it=>{const v=toView(cam,it);return {id:it.id,x:v.x,y:v.y,r:(it.r||0)*cam.zoom,depth:it.depth,priority:it.priority};});}
  const gesture={pinching:()=>false};
  if(!readOnly){
   const pointers=new Map();let pan=null,pinch=null,press=null,swallowUntil=0,pointerAt=0;
   const ignore=e=>e.target.closest?.('.silm-camera')||e.button>0;
   const capture=id=>{try{stage.setPointerCapture(id);}catch(_){}};
   scope.listen(stage,'pointerdown',e=>{
    pointerAt=performance.now();swallowUntil=0;   // um novo toque nunca é engolido
    if(ignore(e))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
    // Segundo dedo: pinça. A vista cancela o arrasto da unidade que o primeiro dedo tenha começado (nada se move).
    if(pointers.size===2){const [a,b]=[...pointers.values()];pan=null;press=null;pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,cam:{...cam},mid:viewPoint({clientX:(a.x+b.x)/2,clientY:(a.y+b.y)/2})};onGestureStart?.('pinch');for(const id of pointers.keys())capture(id);return;}
    if(pointers.size>1)return;
    const unit=e.target.closest('.silm-unit[data-unit-id]');
    if(unit&&ownsUnitDrag)return;   // montagem livre editável: arrastar a unidade a move (a própria vista trata)
    const id=unit?null:hit(viewItems(),viewPoint(e),tolerance(e.pointerType));
    if(id&&onUnitPress){onUnitPress(id,e);return;}
    if(id&&onUnitTap){press={id,pointerId:e.pointerId,x:e.clientX,y:e.clientY,threshold:e.pointerType==='mouse'?4:8};}
    // Sobre uma unidade, o deslocamento só captura o ponteiro depois do limiar: um toque continua sendo o clique dela.
    pan={pointerId:e.pointerId,x:e.clientX,y:e.clientY,cam:{...cam},moved:false,captured:!unit,threshold:e.pointerType==='mouse'?4:8};
    if(!unit)capture(e.pointerId);
   });
   // O clique que o navegador gera ao fim de um deslocamento não seleciona nada (Enter e Espaço têm detail 0 e passam).
   scope.listen(stage,'click',e=>{if(e.detail>0&&performance.now()<swallowUntil){swallowUntil=0;e.stopPropagation();e.preventDefault();}},{capture:true});
   scope.listen(stage,'focusin',e=>{const node=e.target.closest?.('[data-unit-id]');if(!node||performance.now()-pointerAt<800)return;const it=items().find(i=>i.id===node.dataset.unitId);if(it)ensureVisible(it);});
   scope.listen(stage,'pointermove',e=>{
    const p=pointers.get(e.pointerId);if(p){p.x=e.clientX;p.y=e.clientY;}
    if(pinch&&pointers.size>=2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1,mid=viewPoint({clientX:(a.x+b.x)/2,clientY:(a.y+b.y)/2});
     let next=zoomAt(pinch.cam,d/pinch.d,pinch.mid);next=panBy(next,mid.x-pinch.mid.x,mid.y-pinch.mid.y);setCamera(next,{settled:false});return;}
    if(!pan||e.pointerId!==pan.pointerId)return;
    if(!pan.moved&&Math.hypot(e.clientX-pan.x,e.clientY-pan.y)<pan.threshold)return;
    if(!pan.captured){pan.captured=true;capture(pan.pointerId);}
    pan.moved=true;press=null;stage.dataset.panning='';const w=stage.clientWidth||1;setCamera(panBy(pan.cam,(e.clientX-pan.x)/w,(e.clientY-pan.y)/w),{settled:false});
   });
   const end=(e,commit)=>{
    if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);
    if(pinch){if(pointers.size<2){pinch=null;pan=null;press=null;settle('Vista: zoom '+zoomText()+'.');}return;}
    const wasPress=press&&press.pointerId===e.pointerId?press:null;press=null;
    if(pan&&e.pointerId===pan.pointerId){const moved=pan.moved;pan=null;delete stage.dataset.panning;try{stage.releasePointerCapture(e.pointerId);}catch(_){}
     if(moved){swallowUntil=performance.now()+400;settle('Vista deslocada.');return;}
     if(!commit)return;
     if(wasPress){onUnitTap?.(wasPress.id);return;}
     onBackgroundTap?.(clientToScene(e),e);}
   };
   gesture.pinching=()=>!!pinch;
   scope.listen(stage,'pointerup',e=>end(e,true));scope.listen(stage,'pointercancel',e=>end(e,false));scope.listen(stage,'lostpointercapture',e=>{if(pan&&e.pointerId===pan.pointerId)end(e,false);});
   scope.listen(stage,'contextmenu',e=>{if(pan||pinch)e.preventDefault();});
   scope.listen(stage,'wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();setCamera(zoomAt(cam,Math.exp(-clamp(e.deltaY,-60,60)*.006),viewPoint(e)),{settled:false});scheduleSettle(()=>'Vista: zoom '+zoomText()+'.');},{passive:false});
   const keyHost=area||stage;
   scope.listen(keyHost,'keydown',e=>{
    if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;const k=e.key;let done=true;
    if(k==='+'||k==='='||k==='Add')zoomStep(Z.step);else if(k==='-'||k==='−'||k==='_'||k==='Subtract')zoomStep(1/Z.step);else if(k==='0')resetNow();
    else if(k==='f'||k==='F')fitNow();else if(k==='c'||k==='C')centerNow();
    else if(e.shiftKey&&k.startsWith('Arrow')&&canArrowPan(e)){const d=.08,[dx,dy]={ArrowLeft:[d,0],ArrowRight:[-d,0],ArrowUp:[0,d],ArrowDown:[0,-d]}[k]||[0,0];setCamera(panBy(cam,dx,dy),{settled:false});scheduleSettle(()=>'Vista deslocada.');}
    else done=false;
    if(done){e.preventDefault();e.stopPropagation();}
   });
  }
  /* ---------- camadas de apresentação no palco (fora do mundo: tamanho de tela constante) ---------- */
  function selectionLayer(){
   const svg=svgRoot('silm-selection-layer');layer('selection',svg);
   return Object.freeze({root:svg,update(list=[]){svg.replaceChildren();if(!size)return;svg.setAttribute('viewBox','0 0 '+size+' '+size);
    for(const it of list){const v=toView(cam,it);svgEl(svg,'circle',{cx:v.x*size,cy:v.y*size,r:Math.max(10,it.r*cam.zoom*size*1.18+3),class:'silm-selection-ring'});}}});
  }
  /* Rótulos com tamanho de tela constante e sem colisão: um rótulo que encostaria em outro já posto não aparece. */
  function labelsLayer(){
   const box=U.element('div',null,'silm-labels-layer');box.setAttribute('aria-hidden','true');layer('labels',box);
   return Object.freeze({root:box,update(list=[]){box.replaceChildren();if(!size)return;const placed=[];
    for(const it of list){if(!it.text)continue;const v=toView(cam,it),rr=(it.r||0)*cam.zoom*size,x=v.x*size+rr*.55,y=v.y*size+rr*.55,w=String(it.text).length*7+10,h=17;
     if(x<0||y<0||x+w>size||y+h>size)continue;if(placed.some(p=>x<p.x+p.w&&p.x<x+w&&y<p.y+p.h&&p.y<y+h))continue;placed.push({x,y,w,h});
     const tag=U.element('span',String(it.text),'silm-scene-label'+(it.className?' '+it.className:''));tag.style.left=x+'px';tag.style.top=y+'px';if(it.key)tag.dataset.key=it.key;box.append(tag);}}});
  }
  /* Diagnóstico (testes): câmera, caixa de interesse, camadas e transformações. setCamera é só representação (o mesmo
     caminho dos botões, com limites); nada aqui lê ou escreve o estado científico. */
  Object.defineProperty(stage,'silmRenderer',{configurable:true,value:Object.freeze({snapshot:()=>({camera:{...cam},interest:{...interest},margin,size,layers:[...stage.children].map(el=>el.dataset?.layer).filter(Boolean)}),
   toClient:p=>sceneToClient(p),toScene:v=>toScene(cam,v),toView:p=>toView(cam,p),setCamera:c=>setCamera({...cam,mode:'free',...c})})});
  measure();apply();describeNow();
  return Object.freeze({stage,layer,selectionLayer,labelsLayer,get camera(){return {...cam};},setCamera,setInterest,fit:fitNow,zoomBy:zoomStep,center:centerNow,reset:resetNow,ensureVisible,
   get pinching(){return gesture.pinching();},descriptionId:description?.id||null,
   toView:p=>toView(cam,p),toScene:v=>toScene(cam,v),clientToScene,sceneToClient,get size(){return size;},describe:describeNow,
   visible:()=>{const a=toScene(cam,{x:0,y:0}),b=toScene(cam,{x:1,y:1});return {x0:a.x,y0:a.y,x1:b.x,y1:b.y};},
   onCamera:fn=>{listeners.camera.add(fn);return()=>listeners.camera.delete(fn);},onResize:fn=>{listeners.resize.add(fn);return()=>listeners.resize.delete(fn);}});
 }
 return Object.freeze({LAYERS,toView,toScene,boundsOf,fit,zoomAt,panBy,limit,hit,createStage,svgEl,svgRoot});
})();
