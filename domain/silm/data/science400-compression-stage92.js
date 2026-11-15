'use strict';
window.SILM=window.SILM||{};
/* Etapa 92: recuperacao em lote da Tabela XIII de Savitskii et al. 1963,
 * revisao original, pagina impressa 136 (PDF index 13).
 * Os seis dados foram auditados na etapa76 mas NAO estavam no indice 400.
 * "Plasticity (%) under compression" nao e eps ate ruptura comprovada,
 * nem coeficiente de maleabilidade universal.
 */
SILM.scientificCompressionBatch=(()=>{
 const source='https://ufn.ru/ufn63/ufn63_1/ufn631f.pdf';
 const samples=[['Sc',21,26],['Sm',62,14],['Tb',65,16],['Dy',66,20],['Ho',67,20],['Tm',69,26]];
 const rows=Object.freeze(samples.map(([symbol,atomicNumber,value])=>Object.freeze({
  id:'silm92-savitskii-1963-'+symbol,atomicNumber,symbol,property:'malleability',
  origin:'historical-author-data-stage76-recovery',
  status:'experimental-conditional',sourceURL:source,
  sourceName:'Savitskii, Terekhova e Naumkin (1963), Sov. Phys. Usp. 6(1), Tabela XIII p. 136',
  sample:'Metal elementar fundido (cast). Artigo indica 98–99% de pureza geral, sem ensaio individual por amostra.',
  temperatureK:null,temperatureText:'Temperatura ambiente (valor em K nao especificado)',
  phase:'solid',
  values:Object.freeze([Object.freeze({
   code:'compression_plasticity_reported_pct',
   label:'Plasticidade (%) em compressão, como registrada na tabela',
   value,unit:'%',meaning:'reported-historical-compression-plasticity-NOT-verified-failure-strain'
  })]),
  qualifier:'Tabela XIII, coluna Plasticity (%) > compressive, Data of the authors. Estado fundido. Definicao do ponto final, geometria e taxa nao identificadas: nao afirmar deformacao ate ruptura e NAO calibrar motores.',
  sourceStatus:'PRIMARY_AUTHORS_HISTORICAL_COMPILED_TABLE',
  referenceOnly:true,engineRelease:false,calibrationApproved:false
 })));
 const byZ=new Map(rows.map(x=>[x.atomicNumber,Object.freeze([x])]));
 return Object.freeze({schema:'silm.compression-stage92.v1',rows,getFor:(z,p)=>p==='malleability'?(byZ.get(Number(z))||[]):[],engineRelease:false});
})();
