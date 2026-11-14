'use strict';
window.SILM=window.SILM||{};
/*
 * Corpo de prova: campo PLÁSTICO ilustrativo e relevo óptico qualitativo.
 *
 * A FEM disponível no SILM é elástica, bidimensional e normalizada.
 * Reutilizamos seu FORMATO espacial para representar visualmente a
 * permanência de deslocamentos após os passos didáticos de deformação.
 * Isto NÃO integra uma lei constitutiva elastoplástica, não prevê
 * profundidade, tensão, rugosidade Ra ou relevo 3D real para um metal.
 *
 * A altura h abaixo é uma pista perceptiva (emboss) com iluminação
 * direcional derivada de suas derivadas espaciais; nunca uma medida.
 * Armazenamos somente contatos da investigação, não topografia fictícia.
 */
(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const MAX=16;
 const validated=marks=>(Array.isArray(marks)?marks:[]).filter(m=>
  SILM.specimenVisualLight?.validMark(m)).slice(-MAX);
 function group(marks){
  const groups=new Map();
  for(const m of validated(marks)){
   const key=[m.mode,m.position,m.width].join('|'),p=groups.get(key);
   groups.set(key,{mode:m.mode,position:m.position,width:m.width,count:Math.min(8,(p?.count||0)+1)});
  }
  return [...groups.values()];
 }
 function residual(marks,u,v){
  let dx=0,dy=0;
  for(const mark of group(marks)){
   const solution=SILM.specimenLocal?.field({
    mode:mark.mode,position:mark.position,width:mark.width
   });
   if(!solution?.converged)continue;
   const q=solution.sample(u,v);
   // Campo geométrico IRREVERSÍVEL didático: não calcular plasticidade de
   // metais a partir do solver elástico.
   const weight=Math.min(.78,.52*Math.sqrt(mark.count));
   dx+=q.dx*weight;dy+=q.dy*weight;
  }
  return {dx:clamp(dx,-.10,.10),dy:clamp(dy,-.10,.10)};
 }
 function heightAndGradient(marks,active,u,v){
  let height=0,gx=0,gy=0;
  const a=group(marks);
  if(active&&['compression','tension'].includes(active.mode)&&
     SILM.specimenVisualLight?.validMark(active)&&active.load>1e-4)
   a.push({...active,count:0,load:clamp(active.load,0,1)});
  for(const m of a){
   const w=.09+.50*m.width,reach=m.mode==='compression'?.18:.24;
   const scaleY=m.mode==='compression'?.17:.23;
   const ox=(u-m.position)/w,oy=(v-reach)/scaleY;
   const gaussian=Math.exp(-.5*(ox*ox+oy*oy));
   const weight=m.load!==undefined?.9*m.load:.55*Math.sqrt(m.count);
   const h=(m.mode==='compression'?-1:1)*Math.min(.15,.12*weight)*gaussian;
   height+=h;gx+=-h*ox/w;gy+=-h*oy/scaleY;
  }
  return{height:clamp(height,-.24,.24),gx:clamp(gx,-2,2),gy:clamp(gy,-2,2)};
 }
 function shadeAt({marks=[],active=null,u=.5,v=.5,incidenceDeg=35,
                   illuminated=true,roughness=.43}={}){
  if(![u,v].every(Number.isFinite))return null;
  const q=heightAndGradient(marks,active,clamp(u,0,1),clamp(v,0,1));
  if(Math.abs(q.height)+Math.abs(q.gx)+Math.abs(q.gy)<1e-8)
   return{dark:0,light:0,relief:0,illustrative:true};
  const rad=clamp(Number.isFinite(incidenceDeg)?incidenceDeg:35,5,80)*Math.PI/180;
  const lx=Math.cos(rad)*.96,ly=-.12,lz=.20+Math.sin(rad)*.82;
  const lm=Math.hypot(lx,ly,lz),nl=Math.hypot(-q.gx,-q.gy,1);
  const cos=((-q.gx*lx-q.gy*ly+lz)/(nl*lm)),flat=lz/lm;
  const directional=(cos-flat)*2.15;
  const indentation=Math.max(0,-q.height)*.90;
  const ridge=Math.max(0,q.height)*.48;
  const shade=clamp(directional-indentation+ridge,-1,1);
  const lamp=illuminated?1:.68;
  const smooth=1-.32*clamp(Number.isFinite(roughness)?roughness:.43,0,1);
  return{
   dark:clamp(Math.max(0,-shade)*.94*lamp,0,.62),
   light:clamp(Math.max(0,shade)*1.18*lamp*smooth,0,.60),
   relief:Math.abs(q.height),illustrative:true
  };
 }
 SILM.specimenRelief=Object.freeze({group,residual,heightAndGradient,shadeAt});
})();
