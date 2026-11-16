'use strict';
/*
 * Cinemática de apresentação da prensa. A garra móvel acompanha a borda
 * v=0 carregada no J2, o apoio acompanha v=1. Estados intermediários
 * interpolados NÃO são novas soluções FEM nem uma lei de contato.
 */
window.SILM=window.SILM||{};
SILM.lab3dPress=(()=>{
 const finite=Number.isFinite,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const vector=v=>Array.isArray(v)&&v.length===3&&v.every(finite);
 function pose(surface){
  if(!surface?.ok||typeof surface.position!=='function')
   return Object.freeze({ok:false,reason:'J2_SURFACE_UNAVAILABLE',calibrated:false});
  const loaded=surface.position(.5,0,1),supported=surface.position(.5,1,1);
  if(!vector(loaded)||!vector(supported)||loaded[1]<=.93||
    supported[1]<=loaded[1]||supported[1]>1.7)
   return Object.freeze({ok:false,reason:'J2_GRIP_GEOMETRY_INVALID',calibrated:false});
  const loadedY=loaded[1],supportedY=supported[1];
  return Object.freeze({ok:true,loadedY,supportedY,
   movingGripY:loadedY-.038,fixedGripY:supportedY+.038,
   gap:supportedY-loadedY,loadedPoint:Object.freeze(loaded.slice()),
   supportedPoint:Object.freeze(supported.slice()),
   source:'j2-plane-strain-surface',calibrated:false,
   units:'scene-relative',movement:'displacement-controlled'});
 }
 function ease(progress){
  if(!finite(progress))throw new RangeError('Progresso visual inválido');
  const t=clamp(progress,0,1);return t*t*(3-2*t);
 }
 function blendPose(from,to,alpha){
  if(!from?.ok||!to?.ok||!finite(alpha)||alpha<0||alpha>1)
   throw new RangeError('Poses inválidas para a animação');
  const sample=k=>from[k]+(to[k]-from[k])*alpha;
  return Object.freeze({ok:true,
   loadedY:sample('loadedY'),supportedY:sample('supportedY'),
   movingGripY:sample('movingGripY'),fixedGripY:sample('fixedGripY'),
   gap:sample('gap'),calibrated:false,interpolated:true,
   source:'visual-transition-of-converged-j2-poses'});
 }
 // Entradas são triângulos XYZ+normal XYZ. Renormaliza cada normal
 // interpolada; não introduz deformação z calculada nem fibras novas.
 function blendMesh(from,to,alpha){
  if(!ArrayBuffer.isView(from)||!ArrayBuffer.isView(to)||
    from.length!==to.length||from.length===0||from.length%6!==0||
    !finite(alpha)||alpha<0||alpha>1)
   throw new RangeError('Malhas não correspondentes ou progresso inválido');
  if(alpha===0)return from;
  if(alpha===1)return to;
  const out=new Float32Array(from.length),b=1-alpha;
  for(let i=0;i<from.length;i+=6){
   for(let j=0;j<3;j++){
    const v=b*from[i+j]+alpha*to[i+j];
    if(!finite(v))throw new RangeError('Coordenada interpolada não finita');
    out[i+j]=v;
   }
   const n=[0,1,2].map(j=>b*from[i+3+j]+alpha*to[i+3+j]);
   const mag=Math.hypot(...n);
   if(!(mag>1e-9)||!finite(mag))throw new RangeError('Normal interpolada degenerada');
   for(let j=0;j<3;j++)out[i+3+j]=n[j]/mag;
  }
  return out;
 }
 function blendShadows(from,to,alpha){
  if(!Array.isArray(from)||!Array.isArray(to)||from.length!==to.length||
    !finite(alpha)||alpha<0||alpha>1)
   throw new RangeError('Sombras incompatíveis');
  return from.map((r,i)=>{
   const dest=to[i];
   if(!Array.isArray(r)||!Array.isArray(dest)||r.length!==4||dest.length!==4||
      !r.every(finite)||!dest.every(finite))
    throw new RangeError('Projeção de sombra inválida');
   return r.map((v,k)=>v+(dest[k]-v)*alpha);
  });
 }
 return Object.freeze({schema:'silm.lab3d.press-kinematics.v1',
  pose,ease,blendPose,blendMesh,blendShadows,
  calibrated:false,constitutive:false,transitionsAreEquilibriumSolutions:false});
})();
