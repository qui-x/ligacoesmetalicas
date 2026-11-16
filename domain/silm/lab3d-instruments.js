'use strict';
/*
 * Seleção 3D determinística dos instrumentos no palco WebGL.
 * A câmera e o raio são de visualização, sem tocar no ScientificState.
 */
window.SILM=window.SILM||{};
SILM.lab3dInstruments=(()=>{
 const finite=Number.isFinite,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
 const labels=Object.freeze({press:'Prensa de ensaio',heater:'Aquecedor',
  power:'Fonte elétrica',lamp:'Luminária',microscope:'Microscópio'});
 const targets=Object.freeze([
  Object.freeze({id:'press',center:Object.freeze([0,1.25,-1.35]),radius:.63}),
  Object.freeze({id:'heater',center:Object.freeze([-1.15,1.19,-1.39]),radius:.42}),
  Object.freeze({id:'power',center:Object.freeze([1.65,1.08,-1.5]),radius:.4}),
  Object.freeze({id:'lamp',center:Object.freeze([-1.63,1.35,-1.31]),radius:.35}),
  Object.freeze({id:'microscope',center:Object.freeze([1.07,1.36,-1.3]),radius:.4})
 ]);
 const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
 const norm=x=>{const l=Math.hypot(...x);if(!(l>0))throw new RangeError('Direção nula');return x.map(v=>v/l)};
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 function basis(yaw,pitch){
  if(!finite(yaw)||!finite(pitch)||Math.abs(pitch)>=Math.PI/2)
   throw new RangeError('Ângulo de câmera inválido');
  const forward=[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),
   -Math.cos(yaw)*Math.cos(pitch)];
  const right=norm(cross(forward,[0,1,0]));
  const up=norm(cross(right,forward));
  return {forward,right,up};
 }
 function rayAt(eye,yaw,pitch,x,y,width,height){
  if(!Array.isArray(eye)||eye.length!==3||!eye.every(finite)||
   ![x,y,width,height].every(finite)||width<=0||height<=0||
   x<0||x>width||y<0||y>height)throw new RangeError('Ponteiro fora da câmera');
  const {forward,right,up}=basis(yaw,pitch),aspect=width/height,t=Math.tan(Math.PI/5);
  const nx=(2*x/width-1)*aspect*t,ny=(1-2*y/height)*t;
  return norm(forward.map((v,i)=>v+nx*right[i]+ny*up[i]));
 }
 function pickRay(eye,direction,items=targets,maxDistance=4.6){
  if(!Array.isArray(eye)||eye.length!==3||!eye.every(finite)||
   !Array.isArray(direction)||direction.length!==3||!direction.every(finite)||
   !Array.isArray(items)||!finite(maxDistance)||maxDistance<=0)
   throw new RangeError('Raio inválido');
  const ray=norm(direction);let nearest=null;
  for(const item of items){
   if(!item||typeof item.id!=='string'||!Array.isArray(item.center)||
    item.center.length!==3||!item.center.every(finite)||
    !finite(item.radius)||item.radius<=0)continue;
   const to=item.center.map((v,i)=>v-eye[i]),projection=dot(ray,to);
   const off2=dot(to,to)-projection*projection;
   if(off2>item.radius*item.radius||projection+item.radius<0)continue;
   const distance=Math.max(0,projection-Math.sqrt(Math.max(0,item.radius*item.radius-off2)));
   if(distance>maxDistance)continue;
   if(!nearest||distance<nearest.distance)nearest={id:item.id,distance};
  }
  return nearest;
 }
 function pickAt(eye,yaw,pitch,x,y,width,height,items=targets){
  return pickRay(eye,rayAt(eye,yaw,pitch,x,y,width,height),items);
 }
 function project(eye,yaw,pitch,point,width,height){
  if(![width,height].every(finite)||width<=0||height<=0||
    !Array.isArray(point)||point.length!==3||!point.every(finite))
   throw new RangeError('Projeção inválida');
  const {forward,right,up}=basis(yaw,pitch);
  const v=point.map((x,i)=>x-eye[i]),depth=dot(v,forward),f=Math.tan(Math.PI/5);
  if(depth<=.01)return null;
  const nx=dot(v,right)/(depth*f*width/height),ny=dot(v,up)/(depth*f);
  return Object.freeze({x:clamp((1+nx)*width/2,-1e6,1e6),
   y:clamp((1-ny)*height/2,-1e6,1e6),depth,within:nx>=-1&&nx<=1&&ny>=-1&&ny<=1});
 }
 return Object.freeze({schema:'silm.lab3d.instrument-picking.v1',targets,labels,
  basis,rayAt,pickRay,pickAt,project});
})();