'use strict';
window.SILM=window.SILM||{};
/* Etapa 92 — evidencias condicionadas de alongamento em tracão, SEM motor.
 * In 70%: relato historico de medicao original, nao amostra universal.
 * Cr >20% / >40%: limites inferiores de AMOSTRAS diferentes; nao valores exatos.
 */
SILM.scientificMechanicalBatch=(()=>{
 const specs=[
  {symbol:'In',z:49,value:70,meaning:'secondary-report-of-experimental-point',
   status:'compiled',sourceURL:'https://doi.org/10.1038/182862a0',
   sourceName:'Fullman (1958), Nature 182, 862; referencia Eppelsheimer/Reitsma (1958)',
   sample:'Indio >99,97% pureza; detalhes da geometria nao informados no resumo',
   temperatureText:'Temperatura do ensaio nao identificada numericamente',
   qualifier:'70% alongamento em tracao RELATADO POR FONTE CONTEMPORANEA sobre ensaio anterior. Nao extrapolar nem tratar como valor universal.'},
  {symbol:'Cr',z:24,value:20,meaning:'lower-bound-not-point',status:'experimental-conditional',
   sourceURL:'https://doi.org/10.2320/jinstmet1952.66.1_22',
   sourceName:'Kanamori et al. (2002), J. Japan Inst. Metals 66, 22-27',
   sample:'Cromo de alta pureza; laminação 973 K, recozimento e pré-deformação 2–5%',
   temperatureText:'Temperatura ambiente (sem numero exato no resumo)',
   qualifier:'ALONGAMENTO A RUPTURA >20%, NAO exatamente 20%. Amostras com processamento termomecanico especifico, nao material universal.'},
  {symbol:'Cr',z:24,value:40,meaning:'lower-bound-not-point',status:'experimental-conditional',
   sourceURL:'https://doi.org/10.2320/matertrans1960.1.49',
   sourceName:'Yoshida, Ohba e Nagata (1960), Trans. Japan Inst. Metals 1, 49-53',
   sample:'Cromo puro com 0,004% N; pré-deformação por laminação a 400–500 °C',
   temperatureText:'Temperatura ambiente (sem numero exato no resumo)',
   qualifier:'ALONGAMENTO EM TRACAO >40% em algumas amostras, NAO exatamente 40%; N e tratamento especificos. Nao misturar com Kanamori 2002.'}
 ];
 const rows=Object.freeze(specs.map((s,i)=>Object.freeze({
  id:'silm92-ductility-'+s.symbol+'-'+i,property:'ductility',origin:'tensile-stage92',atomicNumber:s.z,
  symbol:s.symbol,status:s.status,sourceURL:s.sourceURL,sourceName:s.sourceName,sample:s.sample,
  temperatureK:null,temperatureText:s.temperatureText,phase:'solid',qualifier:s.qualifier,
  values:Object.freeze([Object.freeze({code:s.meaning==='lower-bound-not-point'?'elongation-lower-bound':'elongation-reported',
   value:s.value,unit:'%',label:s.meaning==='lower-bound-not-point'?'Alongamento à ruptura: limite inferior':'Alongamento à ruptura relatado',meaning:s.meaning})]),
  sourceStatus:s.meaning==='lower-bound-not-point'?'PRIMARY_ABSTRACT_LOWER_BOUND':'CONTEMPORANEOUS_SECONDARY_REPORT',
  referenceOnly:true,engineRelease:false,calibrationApproved:false
 })));
 const byZ=new Map();
 for(const r of rows){const a=byZ.get(r.atomicNumber)||[];a.push(r);byZ.set(r.atomicNumber,a)}
 return Object.freeze({schema:'silm.mechanics-stage92.v1',rows,getFor:(z,p)=>p==='ductility'?(byZ.get(Number(z))||[]):[],engineRelease:false});
})();
