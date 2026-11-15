'use strict';
window.SILM=window.SILM||{};
/* Matemática determinística, sem WebGL, independente da camada de renderização.
 * Propagação térmica NORMALIZADA. Não representa k, cp ou tempo em segundos reais. */
SILM.lab3dCore=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function heatStep(values,{source=false,diffusivity=.18,cooling=.012}={}){
  if(!Array.isArray(values)||values.length<3||values.length>200||!values.every(x=>Number.isFinite(x)&&x>=0&&x<=1))
   throw new RangeError('Campo térmico relativo inválido');
  if(!Number.isFinite(diffusivity)||diffusivity<0||diffusivity>.25||
     !Number.isFinite(cooling)||cooling<0||cooling>1)throw new RangeError('Parâmetros térmicos instáveis');
  const out=values.map((v,i)=>{
   const left=values[i===0?0:i-1],right=values[i===values.length-1?i:i+1];
   return clamp(v+diffusivity*(left+right-2*v)-cooling*v,0,1);
  });
  if(source)out[0]=1;
  return out;
 }
 const initialHeat=(n=18)=>{
  if(!Number.isInteger(n)||n<3||n>200)throw new RangeError('Segmentos inválidos');
  return Array(n).fill(0);
 };
 function canWalk(x,z,radius=.22){
  if(![x,z,radius].every(Number.isFinite)||radius<0)return false;
  if(x<-3.65+radius||x>3.65-radius||z<-3.65+radius||z>3.65-radius)return false;
  const insideBench=(x>-1.78-radius&&x<1.78+radius&&z>-2.07-radius&&z<-.62+radius);
  return !insideBench;
 }
 function sampleField(field,u,v){
  if(!field||field.converged!==true||typeof field.sample!=='function')return null;
  const read=field.sample(u,v);
  return read&&Number.isFinite(read.dx)&&Number.isFinite(read.dy)?
   {dx:read.dx,dy:read.dy}:null;
 }
 function pickTarget(eye,yaw,pitch,targets,maxDistance=4.25){
  if(!Array.isArray(eye)||eye.length!==3||!eye.every(Number.isFinite)||
     ![yaw,pitch,maxDistance].every(Number.isFinite)||maxDistance<=0||
     !Array.isArray(targets))throw new RangeError('Raio de seleção inválido');
  const f=[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)];
  let best=null;
  for(const item of targets){
   if(!item||typeof item.id!=='string'||!Array.isArray(item.center)||
      item.center.length!==3||!item.center.every(Number.isFinite)||
      !Number.isFinite(item.radius)||item.radius<=0)continue;
   const d=item.center.map((x,i)=>x-eye[i]),along=d.reduce((a,x,i)=>a+x*f[i],0);
   if(along<=0||along>maxDistance)continue;
   const off2=Math.max(0,d.reduce((a,x)=>a+x*x,0)-along*along);
   if(off2>item.radius*item.radius)continue;
   if(!best||along<best.distance)best={id:item.id,distance:along};
  }
  return best;
 }
 return Object.freeze({schema:'silm.lab3d.visual-core.v1',initialHeat,heatStep,canWalk,sampleField,pickTarget,
  calibrated:false,thermalUnits:'normalized',collisionOnly:true});
})();