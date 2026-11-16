'use strict';
/*
 * SILM — campos mecânicos no corpo de prova da sala 3D.
 * Somente leitura do adaptador J2/CPFEM e do mesh da sala.
 * A escala de cor é LOCAL ao ensaio; NÃO equivale a MPa nem
 * altera a resposta constitutiva, o estado científico ou o metal.
 */
window.SILM=window.SILM||{};
SILM.lab3dFieldOverlay=(()=>{
 const kinds=Object.freeze(['appearance','vonMises','hydrostaticMean','plasticIndicator']);
 const labels=Object.freeze({
  appearance:'Aparência metálica',
  vonMises:'Tensão equivalente · J2 relativo',
  hydrostaticMean:'Tensão média · J2 relativo (sinal)',
  plasticIndicator:'Plasticidade acumulada · J2 relativo'
 });
 const finite=Number.isFinite;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const lerp=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
 const BLUE=Object.freeze([.16,.35,.77]),PALE=Object.freeze([.88,.91,.96]),
  RED=Object.freeze([.9,.25,.18]),AMBER=Object.freeze([.96,.74,.24]),
  MISSING=Object.freeze([.43,.46,.5]);
 function color(value,kind,min,max){
  if(value===null||!finite(value))return Object.freeze([...MISSING]);
  if(!finite(min)||!finite(max))throw new RangeError('Mapa sem escala numérica');
  if(kind==='hydrostaticMean'){
   const scale=Math.max(Math.abs(min),Math.abs(max),1e-12);
   const s=clamp(value/scale,-1,1);
   return Object.freeze(s<0?lerp(PALE,BLUE,-s):lerp(PALE,RED,s));
  }
  const t=clamp((value-min)/Math.max(max-min,1e-12),0,1);
  return Object.freeze(t<.5?lerp(BLUE,AMBER,t*2):lerp(AMBER,RED,(t-.5)*2));
 }
 function create(bridge,surface,{kind='vonMises'}={}){
  if(!kinds.includes(kind)||kind==='appearance')
   throw new RangeError('Tipo de mapa numérico indisponível');
  if(!bridge?.ok||typeof bridge.query!=='function'||
    typeof bridge.scalarMap!=='function'||!surface?.ok||
    !Array.isArray(surface.segments)||!Number.isInteger(surface.rows)||
    !Number.isInteger(surface.segmentCount))
   return Object.freeze({ok:false,reason:'FIELD_OR_SURFACE_UNAVAILABLE',calibrated:false});
  const segments=surface.segmentCount,rows=surface.rows;
  // Os valores e a escala pertencem ao adaptador científico, não ao render.
  const sourceMap=bridge.scalarMap({kind,nx:segments+1,ny:rows+1});
  const patchValues=[],available=[];
  for(let i=0;i<segments;i++)for(let j=0;j<rows;j++){
   const u=(i+.5)/segments,v=(j+.5)/rows,r=bridge.query(u,v);
   const candidate=kind==='plasticIndicator'?r.plasticIndicator:r.stressInvariants?.[kind];
   const value=finite(candidate)?candidate:null;
   patchValues.push(value);
   if(value!==null)available.push(value);
  }
  const range=available.length?[
   Math.min(...available,sourceMap.min===null?Infinity:sourceMap.min),
   Math.max(...available,sourceMap.max===null?-Infinity:sourceMap.max)
  ]:[null,null];
  const patches=[];
  for(let i=0;i<segments;i++){
   const seg=surface.segments[i],all=seg.vertices;
   // A malha original armazena 2 quads por faixa v, cada quad = 6 vértices
   // com xyz+normal -> 2 * 6 * 6 = 72 floats por patch.
   const required=rows*72;
   if(!Array.isArray(all)||all.length<required)
    throw new TypeError('Malha 3D incompatível com o mapa');
   for(let j=0;j<rows;j++){
    const value=patchValues[i*rows+j];
    patches.push(Object.freeze({index:i,row:j,value,
     vertices:new Float32Array(all.slice(j*72,(j+1)*72)),
     color:color(value,kind,...range)}));
   }
   // Reutiliza tampas e superfícies de topo/base como metal neutro,
   // para não colorir de modo enganoso regiões não amostradas.
   const trailing=all.slice(required);
   if(trailing.length){
    patches.push(Object.freeze({index:i,row:null,value:null,
     vertices:new Float32Array(trailing),color:Object.freeze([.48,.52,.59]),neutral:true}));
   }
  }
  return Object.freeze({
   ok:true,kind,label:labels[kind],source:'j2-plane-strain',
   patches:Object.freeze(patches),min:range[0],max:range[1],
   available:available.length,missing:patchValues.length-available.length,
   nodesAvailable:sourceMap.available,nodesMissing:sourceMap.missing,
   calibrated:false,units:'relative',normalization:'field-local',
   validAsMeasuredStress:false,validAsPhysical3D:false,
   signed:kind==='hydrostaticMean',
   interpretation:'Escala local ao ensaio; cores não representam MPa, propriedades do metal nem tensão 3D experimental.'
  });
 }
 return Object.freeze({schema:'silm.lab3d.field-overlay.v1',kinds,labels,color,create});
})();