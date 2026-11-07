'use strict';
/*
 * SILM — contrato de mapas microestruturais segmentados (v1).
 * A geometria pode ser processada, mas a fonte declarada pelo usuário NÃO é
 * homologada automaticamente. Não calcular porcentagens de fase/composição.
 * Não deduzir grandeza física a partir de campos sem calibração rastreável.
 */
((root)=>{
 const MAX_GRAINS=160, MAX_POINTS=400;
 const fail=(message)=>({ok:false,error:message});
 const finite=(v)=>typeof v==='number'&&Number.isFinite(v);
 const txt=(v,max=160)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max;
 const link=(v)=>typeof v==='string'&&/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(v)&&v.length<=1500;
 const num=(n)=>Number(n.toFixed(6));
 const grainArea=(vertices)=>{
  if(!Array.isArray(vertices)||vertices.length<3)return 0;
  let sum=0;
  for(let i=0;i<vertices.length;i++){
   const a=vertices[i],b=vertices[(i+1)%vertices.length];
   sum+=a[0]*b[1]-b[0]*a[1];
  }
  return Math.abs(sum)/2;
 };
 const eqCircleDiameter=(area)=>area>0?2*Math.sqrt(area/Math.PI):0;
 // Retorna a primeira inconsistência. O registro de procedência não equivale a certificação.
 function validate(raw,expectedAtomicNumber=null){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))
   return fail('O conjunto precisa ser um objeto JSON.');
  if(raw.schema!=='silm.microstructure-map.v1')
   return fail('Versão de dados incompatível: esperado silm.microstructure-map.v1.');
  if(!txt(raw.id,90)||!/^[a-z0-9][a-z0-9._-]*$/i.test(raw.id)||!txt(raw.title,150))
   return fail('Identificador ou título do mapa inválido.');
  if(!Number.isInteger(raw.materialAtomicNumber)||raw.materialAtomicNumber<1||raw.materialAtomicNumber>118)
   return fail('Número atômico de referência inválido.');
  if(expectedAtomicNumber!==null&&Number(raw.materialAtomicNumber)!==expectedAtomicNumber)
   return fail('O mapa pertence a outro elemento de referência; selecione o metal correspondente.');
  if(!txt(raw.material,180))return fail('Identifique o material ou a liga analisada.');
  if(!['experimental-image','literature-image'].includes(raw.sourceKind))
   return fail('A origem precisa ser experimental-image ou literature-image.');
  const source=raw.source;
  if(!source||!txt(source.citation,500)||!link(source.url)||!txt(source.acquisitionMethod,80))
   return fail('Informe referência bibliográfica verificável, URL HTTPS e método de aquisição.');
  const image=raw.image;
  if(!image||!Number.isInteger(image.widthPx)||!Number.isInteger(image.heightPx)||
     image.widthPx<16||image.widthPx>20000||image.heightPx<16||image.heightPx>20000)
   return fail('Dimensões em pixels inválidas (16 a 20000).');
  const calibration=image.micrometersPerPixel;
  if(calibration!==undefined&&calibration!==null&&(!finite(calibration)||calibration<=0||calibration>1000))
   return fail('Calibração em µm/pixel inválida.');
  const calibrated=finite(calibration)&&calibration>0;
  if(calibrated&&!txt(image.calibrationReference,250))
   return fail('Uma escala em µm/pixel exige a origem da calibração.');
  if(!raw.segmentation||!txt(raw.segmentation.method,150))
   return fail('Informe como os contornos de grão foram segmentados.');
  if(!Array.isArray(raw.grains)||raw.grains.length===0||raw.grains.length>MAX_GRAINS)
   return fail('O mapa deve conter de 1 a 160 grãos identificados.');
  const used=new Set(),grains=[];
  for(const grain of raw.grains){
   if(!grain||!txt(grain.id,50)||!/^[a-z0-9][a-z0-9._-]*$/i.test(grain.id)||used.has(grain.id))
    return fail('Cada grão precisa ter identificador único e válido.');
   used.add(grain.id);
   if(!Array.isArray(grain.vertices)||grain.vertices.length<3||grain.vertices.length>MAX_POINTS)
    return fail('O grão '+grain.id+' precisa ter de 3 a 400 vértices.');
   const vertices=[];
   for(const p of grain.vertices){
    if(!Array.isArray(p)||p.length!==2||!finite(p[0])||!finite(p[1])||
       p[0]<0||p[0]>image.widthPx||p[1]<0||p[1]>image.heightPx)
     return fail('Coordenadas fora da imagem no grão '+grain.id+'.');
    vertices.push([p[0],p[1]]);
   }
   const area=grainArea(vertices);
   if(area<=0.0001||area>image.widthPx*image.heightPx+0.1)
    return fail('Área degenerada ou inválida no grão '+grain.id+'.');
   // Cada área é de uma região SEGMENTADA informada. Não é tamanho médio ASTM.
   const areaMicrometers2=calibrated?area*calibration*calibration:null;
   grains.push(Object.freeze({
    id:grain.id,label:txt(grain.label,100)?grain.label:null,
    vertices:Object.freeze(vertices.map(p=>Object.freeze(p))),
    areaPixels2:num(area),
    areaMicrometers2:areaMicrometers2===null?null:num(areaMicrometers2),
    equivalentCircleDiameterMicrometers:areaMicrometers2===null?null:num(eqCircleDiameter(areaMicrometers2))
   }));
  }
  const data=Object.freeze({
   schema:raw.schema,id:raw.id,title:raw.title,material:raw.material,
   materialAtomicNumber:raw.materialAtomicNumber,sourceKind:raw.sourceKind,
   source:Object.freeze({citation:source.citation,url:source.url,acquisitionMethod:source.acquisitionMethod}),
   image:Object.freeze({widthPx:image.widthPx,heightPx:image.heightPx,
    micrometersPerPixel:calibrated?calibration:null,
    calibrationReference:calibrated?image.calibrationReference:null}),
   segmentation:Object.freeze({method:raw.segmentation.method}),
   grains:Object.freeze(grains),
   // A procedência só foi declarada no arquivo importado, não validada pelo SILM.
   validationStatus:'unverified-import'
  });
  return {ok:true,data};
 }
 const api=Object.freeze({schema:'silm.microstructure-map.v1',grainArea,
  eqCircleDiameter,validate});
 root.SILM=root.SILM||{};root.SILM.microstructureData=api;
})(typeof window!=='undefined'?window:globalThis);
