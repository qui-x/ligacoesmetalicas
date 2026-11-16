'use strict';
/*
 * Geometrias 3D autorais, procedurais: cilindro e volante toroidal.
 * Posição XYZ + normal XYZ por vértice; nenhuma imagem externa/CDN.
 */
window.SILM=window.SILM||{};
SILM.lab3dGeometry=(()=>{
 const finite=Number.isFinite;
 const vertex=(a,p,n)=>a.push(...p,...n);
 const tri=(a,p,q,r,n)=>{vertex(a,p,n);vertex(a,q,n);vertex(a,r,n)};
 function cylinder({segments=20}={}){
  if(!Number.isInteger(segments)||segments<8||segments>96)
   throw new RangeError('Cilindro: segmentos 8–96');
  const a=[];
  for(let i=0;i<segments;i++){
   const t=2*Math.PI*i/segments,u=2*Math.PI*(i+1)/segments;
   const p=[Math.cos(t)*.5,0,Math.sin(t)*.5],
    q=[Math.cos(u)*.5,0,Math.sin(u)*.5],
    np=[Math.cos(t),0,Math.sin(t)],nq=[Math.cos(u),0,Math.sin(u)];
   const p0=[p[0],-.5,p[2]],p1=[p[0],.5,p[2]],
    q0=[q[0],-.5,q[2]],q1=[q[0],.5,q[2]];
   for(const [xyz,n] of [[p0,np],[q1,nq],[q0,nq],[p0,np],[p1,np],[q1,nq]])
    vertex(a,xyz,n);
   tri(a,[0,.5,0],p1,q1,[0,1,0]);
   tri(a,[0,-.5,0],q0,p0,[0,-1,0]);
  }
  return new Float32Array(a);
 }
 function torus({major=0.35,minor=0.1,segments=24,tube=10}={}){
  if(![major,minor].every(finite)||major<=minor||minor<=0||
    !Number.isInteger(segments)||segments<8||segments>96||
    !Number.isInteger(tube)||tube<6||tube>40)
   throw new RangeError('Volante: raios ou subdivisões inválidos');
  const a=[];
  const point=(i,j)=>{
   const t=2*Math.PI*i/segments,p=2*Math.PI*j/tube;
   const x=Math.cos(t),z=Math.sin(t),cp=Math.cos(p),sp=Math.sin(p);
   return [[(major+minor*cp)*x,minor*sp,(major+minor*cp)*z],
    [cp*x,sp,cp*z]];
  };
  for(let i=0;i<segments;i++)for(let j=0;j<tube;j++){
   const p00=point(i,j),p10=point(i+1,j),p11=point(i+1,j+1),p01=point(i,j+1);
   for(const [p,q,r] of [[p00,p10,p11],[p00,p11,p01]]){
    vertex(a,...p);vertex(a,...q);vertex(a,...r);
   }
  }
  return new Float32Array(a);
 }
 const round=cylinder(),ring=torus();
 return Object.freeze({schema:'silm.lab3d.geometry.v1',cylinder,torus,round,ring,
  source:'procedural-original',units:'scene-relative',calibrated:false});
})();