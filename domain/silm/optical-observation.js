'use strict';
window.SILM=window.SILM||{};
/*
 * Cena óptica qualitativa: geometria especular, observação e acabamento.
 * Este módulo NÃO calcula refletância de um metal, espectro, rugosidade,
 * intensidade fotométrica nem BRDF. Os limiares são apenas de apresentação.
 * Os valores científicos publicados de Cu permanecem em material-engine.js.
 */
(()=>{
 const finishes=Object.freeze(['polished','matte']);
 const clampAngle=v=>Math.min(80,Math.max(0,Math.round(v)));
 function observe({illuminated=false,incidenceDeg=35,observerDeg=35,finish='polished'}={}){
  if(![incidenceDeg,observerDeg].every(Number.isFinite)||incidenceDeg<0||
     incidenceDeg>80||observerDeg<0||observerDeg>80||!finishes.includes(finish))return null;
  const delta=Math.abs(incidenceDeg-observerDeg);
  let appearance='off',description='A amostra está sem iluminação.';
  if(illuminated&&finish==='matte'){
   appearance='diffuse';
   description='Superfície fosca: o espalhamento ilustrado distribui o destaque por mais direções, sem valores medidos.';
  }else if(illuminated&&delta<=8){
   appearance='aligned';
   description='Superfície polida: o observador está próximo da direção especular e vê o destaque concentrado.';
  }else if(illuminated&&delta<=18){
   appearance='near';
   description='O observador está próximo, mas fora do alinhamento principal do reflexo.';
  }else if(illuminated){
   appearance='away';
   description='A amostra continua iluminada, mas o observador está afastado da direção especular.';
  }
  return Object.freeze({
   appearance,description,illuminated,finish,
   incidenceDeg,reflectionDeg:incidenceDeg,observerDeg,
   // Distância de percepção sem significado físico ou espectral.
   differenceDeg:delta,
   limitation:'Destaque esquemático. Acabamento e ângulo de observação não são medições de refletância, cor ou rugosidade.'
  });
 }
 SILM.opticalObservation=Object.freeze({observe,finishes,clampAngle});
})();
