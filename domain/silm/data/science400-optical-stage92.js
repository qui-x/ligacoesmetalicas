'use strict';
window.SILM=window.SILM||{};
/*
 * SILM etapa 92 — n,k -> R(550nm) via Fresnel, interface ideal ar/metal.
 * Fontes experimentais tabuladas (refractiveindex.info CC0), Fresnel DERIVADO.
 * Duas entradas para o In são amostras/estudos distintos, não uma média.
 * Hg é LIQUIDO; estes registros não autorizam rede cristalina sólida.
 */
SILM.scientificOpticalBatch=(()=>{
 const lambdaUm=0.55;
 const reflectance=(n,k)=>((n-1)*(n-1)+k*k)/((n+1)*(n+1)+k*k);
 const lerp=(a,b,v0,v1,x)=>v0+(v1-v0)*(x-a)/(b-a);
 const references=Object.freeze([
  {symbol:'In',z:49,temperatureK:295,phase:'solid',
   n:0.70,k:4.70,interpolation:false,
   sourceURL:'https://refractiveindex.info/?book=In&page=Golovashkin-295K&shelf=main',
   originalDOI:null,ref:'Golovashkin et al. (1967), Sov. Phys. JETP 24, 1093',
   yaml:'database/data/main/In/nk/Golovashkin-295K.yml'},
  {symbol:'In',z:49,temperatureK:298,phase:'solid',
   n:lerp(.53906,.55104,1.03008,1.05808,lambdaUm),
   k:lerp(.53906,.55104,4.85397,4.96181,lambdaUm),interpolation:true,
   sourceURL:'https://refractiveindex.info/?book=In&page=Mathewson-298K&shelf=main',
   originalDOI:'https://doi.org/10.1088/0031-8949/4/6/009',
   ref:'Mathewson e Myers (1971), Phys. Scr. 4, 291-292',
   yaml:'database/data/main/In/nk/Mathewson-298K.yml'},
  {symbol:'Hg',z:80,temperatureK:null,phase:'liquid',
   n:lerp(.51660,.56356,1.38332,1.62088,lambdaUm),
   k:lerp(.51660,.56356,4.40608,4.75050,lambdaUm),interpolation:true,
   sourceURL:'https://refractiveindex.info/?book=Hg&page=Inagaki&shelf=main',
   originalDOI:'https://doi.org/10.1103/PhysRevB.23.5246',
   ref:'Inagaki, Arakawa e Williams (1981), Phys. Rev. B 23, 5246',
   yaml:'database/data/main/Hg/nk/Inagaki.yml'}
 ]);
 const rows=Object.freeze(references.map((s,i)=>Object.freeze({
  id:'silm92-optical-'+s.symbol+'-'+i,atomicNumber:s.z,symbol:s.symbol,
  property:'luster',origin:'optical-fresnel-nk-stage92',status:'candidate',
  values:Object.freeze([
   Object.freeze({code:'R550',value:reflectance(s.n,s.k),
    unit:'fração',label:'Refletância calculada a 550 nm',meaning:'DERIVED_FROM_MEASURED_NK_NOT_DIRECT_REFLECTANCE'}),
   Object.freeze({code:'n',value:s.n,unit:'adimensional',
    label:'Índice de refração n',meaning:s.interpolation?'INTERPOLATED_ORIGINAL_NK':'TABULATED_EXPERIMENTAL_NK'}),
   Object.freeze({code:'k',value:s.k,unit:'adimensional',
    label:'Coeficiente de extinção k',meaning:s.interpolation?'INTERPOLATED_ORIGINAL_NK':'TABULATED_EXPERIMENTAL_NK'})
  ]),
  sourceURL:s.sourceURL,sourceName:s.ref,
  sample:s.phase==='liquid'?'Mercúrio líquido; amostra a temperatura ambiente':
   'Índio sólido da publicação, sem hipótese de amostra intercambiável',
  temperatureK:s.temperatureK,
  temperatureText:s.temperatureK===null?'Temperatura ambiente; valor exato não tabulado':'',
  phase:s.phase,
  qualifier:'Refletância em INCIDÊNCIA NORMAL para superfície ideal ar/metal, calculada por Fresnel de n,k '+(s.interpolation?'interpolados entre pontos tabelados':'tabelados exatamente em 0,55 µm')+'. Não é uma medição independente de R550; não representa brilho percebido, rugosidade ou oxidação.'+(s.phase==='liquid'?' Hg LIQUIDO: nenhuma habilitação estrutural sólida.':''),
  sourceStatus:'DATASET_NK_CC0_DERIVED_R550',
  datasetFile:s.yaml,originalDOI:s.originalDOI,
  wavelengthNm:550,incidence:'normal',interpolatedNK:s.interpolation,
  referenceOnly:true,engineRelease:false,calibrationApproved:false
 })));
 const byZ=new Map();
 for(const row of rows){const arr=byZ.get(row.atomicNumber)||[];arr.push(row);byZ.set(row.atomicNumber,arr)}
 return Object.freeze({schema:'silm.optical-stage92.v1',rows,lambdaNm:550,
  getFor:(z,property)=>property==='luster'?(byZ.get(Number(z))||[]):[],
  onlyDocumentary:true,engineRelease:false});
})();
