'use strict';
window.SILM=window.SILM||{};
/* SILM: superfície óptica e histórico de preparo didático da mesma investigação.
 * A rugosidade é ADIMENSIONAL; não é Ra, nem refletância experimental.
 * GGX/Smith representa a distribuição relativa do destaque especular, não
 * fornece luminância ou taxa de desgaste sem iluminação/medidas calibradas.
 * Metal sem n,k: nenhuma refletância numérica é atribuída.
 */
(()=>{
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const TOOLS=Object.freeze(['brush','sand','polish']);
 const BASE=Object.freeze({version:1,light:false,strokes:[],plasticSteps:0,compressionSteps:0,tensionSteps:0,heatEvents:0,electricEvents:0});
 const copy=v=>JSON.parse(JSON.stringify(v));
 const base=()=>copy(BASE);
 function validStroke(s){
  return !!s&&typeof s==='object'&&TOOLS.includes(s.tool)&&
   [s.x0,s.y0,s.x1,s.y1].every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&
   Number.isFinite(s.radius)&&s.radius>=.005&&s.radius<=.16;
 }
 function validState(value){
  return !!value&&value.version===1&&typeof value.light==='boolean'&&
   Array.isArray(value.strokes)&&value.strokes.length<=160&&value.strokes.every(validStroke)&&
   ['plasticSteps','heatEvents','electricEvents'].every(k=>Number.isInteger(value[k])&&value[k]>=0&&value[k]<=10000)&&
   ['compressionSteps','tensionSteps'].every(k=>value[k]===undefined||
    (Number.isInteger(value[k])&&value[k]>=0&&value[k]<=10000));
 }
 const current=state=>validState(state?.metadata?.surface)?state.metadata.surface:base();
 function applyStroke(data,s){
  if(!validStroke(s))throw new TypeError('Traçado superficial inválido');
  if(!validState(data))throw new TypeError('Estado superficial inválido');
  const next=copy(data);
  if(next.strokes.length>=160)return null;
  next.strokes.push({tool:s.tool,x0:s.x0,y0:s.y0,x1:s.x1,y1:s.y1,radius:s.radius});
  return next;
 }
 function sample(data,u,v,preview=null){
  if(!validState(data))throw new TypeError('Estado superficial inválido');
  let roughness=.43,anisotropy=0,angle=0;
  const strokes=preview&&validStroke(preview)?[...data.strokes,preview]:data.strokes;
  for(const s of strokes){
   const dx=s.x1-s.x0,dy=s.y1-s.y0,q=dx*dx+dy*dy;
   const t=q>1e-10?clamp(((u-s.x0)*dx+(v-s.y0)*dy)/q):0;
   const dist2=(u-s.x0-t*dx)**2+(v-s.y0-t*dy)**2;
   if(dist2>s.radius*s.radius)continue;
   const w=.64*Math.exp(-2.2*dist2/(s.radius*s.radius));
   const r=s.tool==='brush'?.67:s.tool==='sand'?.28:.065;
   const a=s.tool==='brush'?.82:s.tool==='sand'?.24:0;
   roughness+=(r-roughness)*w;
   anisotropy+=(a-anisotropy)*w;
   if(q>1e-10)angle=Math.atan2(dy,dx);
  }
  // Deformação plástica simulada: contribuição qualitativa global,
  // nunca taxa real metal-específica nem tamanho de grão medido.
  roughness=clamp(roughness+.018*Math.min(8,data.plasticSteps),.03,.96);
  return {roughness,anisotropy,direction:angle,plasticSteps:data.plasticSteps};
 }
 // Fresnel normal usando constantes n,k reais; opticamente lisa ar/metal.
 function fresnelNormal(n,k){
  if(![n,k].every(Number.isFinite)||n<0||k<0||(!n&&!k))return null;
  return clamp(((n-1)**2+k*k)/((n+1)**2+k*k));
 }
 function ggx({roughness=.4,anisotropy=0,direction=0,incidence=35,observer=35,reflectance=.65}={}){
  const radians=Math.PI/180,ai=incidence*radians,av=observer*radians;
  if(![roughness,anisotropy,direction,incidence,observer,reflectance].every(Number.isFinite))return null;
  if(incidence<0||incidence>85||observer<0||observer>85)return null;
  const L=[-Math.sin(ai),0,Math.cos(ai)],V=[Math.sin(av),0,Math.cos(av)];
  const H=[L[0]+V[0],0,L[2]+V[2]],m=Math.hypot(...H);
  const h=H.map(t=>t/(m||1)),a=Math.max(.018,clamp(roughness,.025,1)**2);
  const aspect=Math.sqrt(Math.max(.1,1-.85*clamp(anisotropy,0,.99)));
  const ax=a/aspect,ay=a*aspect,c=Math.cos(direction),s=Math.sin(direction);
  const xy=w=>[c*w[0]+s*w[1],-s*w[0]+c*w[1]];
  const [hx,hy]=xy(h),den=(hx/ax)**2+(hy/ay)**2+h[2]*h[2];
  const D=1/(Math.PI*ax*ay*Math.max(1e-9,den*den));
  const lambda=w=>{const [x,y]=xy(w);return (Math.sqrt(1+(ax*ax*x*x+ay*ay*y*y)/(w[2]*w[2]))-1)/2;};
  const G=1/(1+lambda(L)+lambda(V));
  const cosLH=clamp(L[0]*h[0]+L[2]*h[2]),F=clamp(reflectance)+(1-clamp(reflectance))*(1-cosLH)**5;
  return Math.max(0,F*D*G/(4*Math.max(1e-9,L[2]*V[2])));
 }
 function response(state,{u=.5,v=.5,incidence=35,observer=35,preview=null,reflectance=null}={}){
  const p=sample(current(state),u,v,preview);
  const value=ggx({...p,incidence,observer,reflectance:Number.isFinite(reflectance)?reflectance:.65});
  // Exposição apenas perceptiva, NÃO intensidade fotométrica.
  const appearance=value===null?0:clamp(1-Math.exp(-.75*value));
  return {...p,specularRelative:appearance,calibration:Number.isFinite(reflectance)?'reference-Fresnel':'qualitative'};
 }
 SILM.surfacePhysics=Object.freeze({TOOLS,base,current,validStroke,validState,applyStroke,sample,fresnelNormal,ggx,response});
})();
