'use strict';
window.SILM=window.SILM||{};
/*
 * Investigação óptica DIRETAMENTE sobre a estrutura já projetada pelo SILM.
 * Não cria amostra, minipalco, janela ou geometria científica independentes.
 * A âncora é a região superficial esquemática da amostra, entregue pela cena.
 * O controlador transitório SILM.drive continua sendo a única fonte de estado.
 */
(()=>{
 const make=(tag,cls,label)=>{
  const node=document.createElement(tag);
  node.className=cls;
  if(label!==undefined)node.textContent=label;
  return node;
 };
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 SILM.createOpticalBench=(stage,{scope,drive,toggleLight,toolbarHost}={})=>{
  const root=make('div','silm-optical-interaction');
  root.hidden=true;
  root.setAttribute('role','group');
  root.setAttribute('aria-label','Investigação da reflexão na região da estrutura');
  // As duas alças ficam NO palco: sua posição é recalculada pela mesma
  // projeção e câmera da rede. Nenhum cartão cobre a investigação.
  const lamp=make('button','silm-optical-handle silm-optical-lamp','🔦');
  const eye=make('button','silm-optical-handle silm-optical-eye','◉');
  for(const [node,name,min] of [[lamp,'Lanterna',5],[eye,'Observador',0]]){
   node.type='button';node.setAttribute('role','slider');
   node.setAttribute('aria-label','Ângulo de '+name.toLowerCase()+' em relação à normal');
   node.setAttribute('aria-valuemin',String(min));node.setAttribute('aria-valuemax','80');
   root.append(node);
  }
  const status=make('p','sr-only silm-optical-status');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  root.append(status);
  stage.append(root);
  scope.cleanup(()=>root.remove());

  // Opções no MESMO conjunto de controles inferiores da rede, sem outro menu.
  const actions=make('div','silm-optical-inline-actions');
  actions.hidden=true;actions.setAttribute('role','group');
  actions.setAttribute('aria-label','Opções de reflexão');
  const finish=make('button','silm-optical-finish','◐ Fosco');
  const rays=make('button','silm-optical-rays','↗ Raios');
  for(const button of [finish,rays]){button.type='button';actions.append(button);}
  toolbarHost?.append(actions);
  scope.cleanup(()=>actions.remove());

  let last={visible:false,illuminated:false,point:null};
  const setAngle=(kind,number)=>{
   if(!drive)return;
   if(kind==='lamp')drive.setAngle(number);
   else drive.setObserverAngle(number);
  };
  const current=kind=>kind==='lamp'?drive?.angle:drive?.observerAngle;
  const eventAngle=(event)=>{
   const rect=stage.getBoundingClientRect(),x=(event.clientX-rect.left)/Math.max(1,rect.width)*100,
    y=(event.clientY-rect.top)/Math.max(1,rect.height)*100,P=last.point;
   if(!P)return 35;
   return Math.round(Math.atan2(Math.abs(x-P.x),Math.max(1,P.y-y))*180/Math.PI);
  };
  for(const [node,kind] of [[lamp,'lamp'],[eye,'eye']]){
   let pointer=null;
   scope.listen(node,'pointerdown',event=>{
    if(!drive||event.button>0)return;
    event.preventDefault();event.stopPropagation();
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
    try{node.setPointerCapture(event.pointerId);}catch{}
   });
   scope.listen(node,'pointermove',event=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    event.preventDefault();event.stopPropagation();
    if(Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>4)pointer.moved=true;
    if(pointer.moved)setAngle(kind,eventAngle(event));
   });
   const release=event=>{
    if(!pointer||event.pointerId!==pointer.id)return;
    event.preventDefault();event.stopPropagation();
    const moved=pointer.moved;pointer=null;
    if(!moved&&kind==='lamp'&&event.type==='pointerup')toggleLight?.();
   };
   for(const type of ['pointerup','pointercancel','lostpointercapture'])scope.listen(node,type,release);
   scope.listen(node,'keydown',event=>{
    const k=event.key;
    const step={ArrowLeft:-5,ArrowDown:-5,ArrowRight:5,ArrowUp:5,PageDown:-10,PageUp:10}[k];
    if(step!==undefined){event.preventDefault();event.stopPropagation();setAngle(kind,(current(kind)||0)+step);}
    else if(k==='Home'||k==='End'){event.preventDefault();event.stopPropagation();setAngle(kind,k==='End'?80:kind==='lamp'?5:0);}
    else if(k==='Enter'||k===' '){event.preventDefault();event.stopPropagation();
     if(kind==='lamp')toggleLight?.();
     else setAngle('eye',drive?.angle||35);
    }
   });
  }
  scope.listen(finish,'click',()=>{if(drive)drive.setFinish(drive.finish==='matte'?'polished':'matte');});
  scope.listen(rays,'click',()=>{if(drive)drive.setRays(!drive.rays);});

  function update({visible=false,illuminated=false,point=null}={}){
   last={visible,illuminated,point};
   root.hidden=!visible||!point;actions.hidden=!visible;
   if(!visible||!drive||!point)return null;
   const a=drive.angle,b=drive.observerAngle,P={x:clamp(point.x,3,97),y:clamp(point.y,3,97)};
   const result=SILM.opticalObservation?.observe({
    illuminated,incidenceDeg:a,observerDeg:b,finish:drive.finish
   });
   if(!result)return null;
   root.dataset.appearance=result.appearance;
   root.dataset.finish=drive.finish;
   root.dataset.light=illuminated?'on':'off';
   // O raio é uma construção didática relativa à superfície local; não
   // representa luz emitida pelos centros, rugosidade medida ou BRDF.
   const radius=clamp(Math.min(23,P.y-7,P.x-7,93-P.x),9,23),rad=Math.PI/180;
   const L={x:P.x-radius*Math.sin(a*rad),y:P.y-radius*Math.cos(a*rad)};
   const O={x:P.x+radius*Math.sin(b*rad),y:P.y-radius*Math.cos(b*rad)};
   const E={x:P.x+radius*Math.sin(a*rad),y:P.y-radius*Math.cos(a*rad)};
   if(a<12&&b<12)O.y+=6; // Alças distinguíveis próximas da normal.
   for(const [node,pos,value,name] of [[lamp,L,a,'Lanterna'],[eye,O,b,'Observador']]){
    node.style.left=clamp(pos.x,3,97)+'%';
    node.style.top=clamp(pos.y,3,97)+'%';
    node.setAttribute('aria-valuenow',String(value));
    node.setAttribute('aria-valuetext',name+' a '+value+' graus');
    node.title=name+' · '+value+'°. Arraste ou use as setas.';
   }
   lamp.setAttribute('aria-description','Toque para ligar ou desligar a luz; arraste para ajustar a incidência.');
   eye.setAttribute('aria-description','Arraste para observar outro ângulo; Enter alinha ao reflexo.');
   finish.textContent=drive.finish==='polished'?'◐ Polido':'◑ Fosco';
   finish.setAttribute('aria-label','Alternar acabamento, atual: '+(drive.finish==='polished'?'polido':'fosco'));
   finish.setAttribute('aria-pressed',String(drive.finish==='matte'));
   rays.setAttribute('aria-pressed',String(drive.rays));
   rays.textContent=drive.rays?'↗ Ocultar':'↗ Raios';
   rays.setAttribute('aria-label',drive.rays?'Ocultar raios':'Mostrar raios');
   status.textContent=result.description+' Esquema acoplado à estrutura; não constitui medição óptica.';
   return {point:P,lantern:L,end:E,observer:O,angle:a,on:illuminated,
    appearance:result.appearance,finish:drive.finish,rays:drive.rays};
  }
  return Object.freeze({root,update,lamp,eye,actions,finish,rays,status});
 };
})();
