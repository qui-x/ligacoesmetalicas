'use strict';
/*
 * Prévia óptica/mecânica da sala: projeções analíticas de sombras de contato.
 * NÃO é shadow mapping, ray tracing ou previsão radiométrica do metal.
 * O plano de recepção é somente o tampo da bancada, y = 0,91.
 */
window.SILM=window.SILM||{};
SILM.lab3dVisuals=(()=>{
 const finite=Number.isFinite;
 const LIGHT=Object.freeze([1.2,3.7,1.4]),PLANE=.91;
 function footprint({point,light=LIGHT,planeY=PLANE,radiusX=.2,radiusZ=.2}={}){
  if(!Array.isArray(point)||point.length!==3||!point.every(finite)||
   !Array.isArray(light)||light.length!==3||!light.every(finite)||
   ![planeY,radiusX,radiusZ].every(finite)||radiusX<=0||radiusZ<=0||
   point[1]<planeY||point[1]>=light[1]||light[1]<=planeY)
   throw new RangeError('Objeto, fonte ou plano de sombra inválidos');
  const t=(light[1]-planeY)/(light[1]-point[1]);
  const x=light[0]+t*(point[0]-light[0]),
   z=light[2]+t*(point[2]-light[2]);
  return Object.freeze({x,z,radiusX:radiusX*t,radiusZ:radiusZ*t,
   lightHeight:light[1],receiverY:planeY,
   source:'analytic-contact-preview',calibrated:false});
 }
 function shadows({upperY=1.25,probe=[.26,1.195,-1.23],light=LIGHT}={}){
  if(!finite(upperY)||upperY<PLANE||upperY>=light[1])
   throw new RangeError('Altura da prensa fora do intervalo');
  if(!Array.isArray(probe)||probe.length!==3||!probe.every(finite)||
   probe[1]<PLANE||probe[1]>=light[1])
   throw new RangeError('Amostra deformada fora do plano de sombra');
  const nodes=[
   {point:[0,upperY+.04,-1.35],radiusX:.33,radiusZ:.24},
   {point:[1.07,1.35,-1.25],radiusX:.22,radiusZ:.20},
   {point:[-1.15,1.19,-1.39],radiusX:.27,radiusZ:.22},
   {point:[1.65,1.08,-1.5],radiusX:.22,radiusZ:.20},
   {point:probe,radiusX:.21,radiusZ:.12} // região local obtida da malha J2, não deslocamento fictício do cabeçote
  ];
  return Object.freeze(nodes.map(n=>{
   const f=footprint({...n,light});
   return Object.freeze([f.x,f.z,f.radiusX,f.radiusZ]);
  }));
 }
 // Modelo de brilho limitado; roughness é um CONTROLE visual, não Ra ou GGX medido.
 function appearance({metalness=.8,roughness=.3,selected=false}={}){
  if(!finite(metalness)||!finite(roughness)||
    metalness<0||metalness>1||roughness<.05||roughness>1||
    typeof selected!=='boolean')throw new RangeError('Material de prévia inválido');
  return Object.freeze({metalness,
   // Expoente Blinn–Phong para a prévia, não parâmetro constitutivo.
   shininess:6+110*Math.pow(1-roughness,2),
   selected,calibrated:false,source:'artist-defined-appearance'});
 }
 return Object.freeze({schema:'silm.lab3d.visuals.v1',footprint,shadows,appearance,
  defaultLight:LIGHT,benchY:PLANE,calibrated:false});
})();
