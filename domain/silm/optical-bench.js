'use strict';
window.SILM=window.SILM||{};
/*
 * Bancada de reflexão sobre uma amostra esquemática dentro do palco.
 * Uma única interface: a lanterna e o observador compartilham a superfície.
 * Não desenha reflexos por átomo, não estima cor/luminância nem rugosidade.
 */
(()=>{
 const svgNS='http://www.w3.org/2000/svg';
 const element=(tag,className,text)=>{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
 };
 const svg=(tag,attrs,parent)=>{
  const node=document.createElementNS(svgNS,tag);
  for(const [name,value] of Object.entries(attrs||{}))node.setAttribute(name,String(value));
  if(parent)parent.append(node);
  return node;
 };
 const pct=(v,total)=>v/total*100+'%';
 SILM.createOpticalBench=(stage,{scope,drive,elementSymbol,toggleLight})=>{
  const root=element('section','silm-optical-bench');root.hidden=true;
  root.setAttribute('role','group');root.setAttribute('aria-label','Experiência óptica sobre superfície metálica');
  const heading=element('strong','silm-optical-bench-title',
   'Brilho · '+elementSymbol+' · superfície ilustrativa');
  const area=element('div','silm-optical-bench-area');
  const graphic=svg('svg',{viewBox:'0 0 240 140','aria-hidden':'true',
   class:'silm-optical-bench-svg',preserveAspectRatio:'xMidYMid meet'},area);
  const normal=svg('line',{x1:120,y1:93,x2:120,y2:24,
   class:'silm-optical-bench-normal'},graphic);
  const incident=svg('line',{x1:92,y1:36,x2:120,y2:93,
   class:'silm-optical-bench-incident'},graphic);
  const reflected=svg('line',{x1:120,y1:93,x2:148,y2:36,
   class:'silm-optical-bench-reflected'},graphic);
  const surface=svg('rect',{x:40,y:91,width:160,height:18,rx:3,
   class:'silm-optical-bench-surface'},graphic);
  const shine=svg('ellipse',{cx:120,cy:92,rx:17,ry:4,
   class:'silm-optical-bench-shine'},graphic);
  const scatter=svg('g',{class:'silm-optical-bench-scatter'},graphic);
  for(const i of [-3,-2,-1,0,1,2,3])svg('line',{
   x1:120+i*15,y1:89,x2:120+i*15+8,y2:82-Math.abs(i)*2
  },scatter);
  const lamp=element('div','silm-optical-bench-lamp','🔦');
  const eye=element('div','silm-optical-bench-eye','◉');
  const handles=[lamp,eye];
  for(const h of handles){
   h.tabIndex=0;h.setAttribute('role','slider');h.setAttribute('aria-valuemin','0');
   h.setAttribute('aria-valuemax','80');area.append(h);
  }
  lamp.setAttribute('aria-valuemin','5');
  lamp.setAttribute('aria-label','Ângulo da lanterna em relação à normal');
  eye.setAttribute('aria-label','Ângulo do observador em relação à normal');
  const controls=element('div','silm-optical-bench-controls');
  const source=element('button','silm-optical-bench-source','Apagar luz');
  const finish=element('button','silm-optical-bench-finish','Polida');
  const rays=element('button','silm-optical-bench-rays','Mostrar raios');
  for(const button of [source,finish,rays])button.type='button';
  controls.append(source,finish,rays);
  const status=element('p','silm-optical-bench-status');
  status.setAttribute('aria-live','polite');
  const limitation=element('small','silm-optical-bench-limitation',
   'Destaque qualitativo: não representa cor nem refletância medida.');
  root.append(heading,area,controls,status,limitation);
  stage.append(root);
  scope.cleanup(()=>root.remove());
  const setAngle=(kind,angle)=>kind==='lamp'?
   drive?.setAngle(angle):drive?.setObserverAngle(angle);
  const currentAngle=kind=>kind==='lamp'?drive?.angle:drive?.observerAngle;
  const angleOf=(kind,event)=>{
   const box=area.getBoundingClientRect();
   const x=(event.clientX-box.left)/Math.max(1,box.width)*240;
   const y=(event.clientY-box.top)/Math.max(1,box.height)*140;
   return Math.atan2(Math.abs(x-120),Math.max(1,93-y))*180/Math.PI;
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
    if(pointer.moved)setAngle(kind,angleOf(kind,event));
   });
   const finishPointer=event=>{
    if(!pointer||event.pointerId!==pointer.id)return;
    event.preventDefault();event.stopPropagation();
    const moved=pointer.moved;pointer=null;
    if(!moved&&kind==='lamp'&&event.type==='pointerup')toggleLight?.();
   };
   for(const type of ['pointerup','pointercancel','lostpointercapture'])
    scope.listen(node,type,finishPointer);
   scope.listen(node,'keydown',event=>{
    const k=event.key,delta={ArrowLeft:-5,ArrowRight:5,ArrowUp:5,ArrowDown:-5,PageUp:10,PageDown:-10}[k];
    if(delta!==undefined){event.preventDefault();event.stopPropagation();
     setAngle(kind,(currentAngle(kind)||0)+delta);}
    else if(k==='Home'||k==='End'){event.preventDefault();event.stopPropagation();
     setAngle(kind,k==='End'?80:kind==='lamp'?5:0);}
    else if(k==='Enter'||k===' '){event.preventDefault();event.stopPropagation();
     if(kind==='lamp')toggleLight?.();
     else drive?.setObserverAngle(drive.angle);}
   });
  }
  scope.listen(source,'click',()=>toggleLight?.());
  scope.listen(finish,'click',()=>drive?.setFinish(drive.finish==='matte'?'polished':'matte'));
  scope.listen(rays,'click',()=>drive?.setRays(!drive.rays));
  function update({visible=false,illuminated=false}={}){
   root.hidden=!visible;
   if(!visible||!drive)return;
   const a=drive.angle,b=drive.observerAngle;
   const view=SILM.opticalObservation?.observe({
    illuminated,incidenceDeg:a,observerDeg:b,finish:drive.finish
   });
   if(!view)return;
   root.dataset.appearance=view.appearance;root.dataset.finish=drive.finish;
   root.dataset.light=illuminated?'on':'off';
   const lampR=58,eyeR=57,rad=Math.PI/180;
   const lampP={x:120-lampR*Math.sin(a*rad),y:93-lampR*Math.cos(a*rad)};
   const eyeP={x:120+eyeR*Math.sin(b*rad),y:93-eyeR*Math.cos(b*rad)};
   // Keep handles distinguishable when both angles are close to the normal.
   if(a<15&&b<15)eyeP.y+=17;
   lamp.style.left=pct(lampP.x,240);lamp.style.top=pct(lampP.y,140);
   eye.style.left=pct(eyeP.x,240);eye.style.top=pct(eyeP.y,140);
   for(const [node,value,label] of [[lamp,a,'Lanterna'],[eye,b,'Observador']]){
    node.setAttribute('aria-valuenow',String(value));
    node.setAttribute('aria-valuetext',label+' a '+value+' graus da normal');
    node.title=label+': '+value+'°. Arraste ou use setas; Enter '+(node===lamp?'alterna luz':'alinha ao reflexo');
   }
   const rayOn=drive.rays&&illuminated;
   normal.hidden=incident.hidden=reflected.hidden=!rayOn;
   incident.setAttribute('x1',lampP.x);incident.setAttribute('y1',lampP.y);
   const refl={x:120+lampR*Math.sin(a*rad),y:93-lampR*Math.cos(a*rad)};
   reflected.setAttribute('x2',refl.x);reflected.setAttribute('y2',refl.y);
   shine.hidden=!illuminated||!['aligned','near'].includes(view.appearance);
   scatter.hidden=!illuminated||view.appearance!=='diffuse';
   status.textContent=view.description;
   source.textContent=illuminated?'Apagar luz':'Ligar luz';
   source.setAttribute('aria-pressed',String(illuminated));
   finish.textContent='Acabamento: '+(drive.finish==='polished'?'polido':'fosco');
   finish.setAttribute('aria-pressed',String(drive.finish==='matte'));
   rays.textContent=drive.rays?'Ocultar raios':'Mostrar raios';
   rays.setAttribute('aria-pressed',String(drive.rays));
  }
  return Object.freeze({root,update,lamp,eye,status});
 };
})();
