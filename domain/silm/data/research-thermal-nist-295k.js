'use strict';
window.SILM=window.SILM||{};
/**
 * Condutividade termica elementar a 295 K, TABELA compilada no portal do NIST.
 * Fonte: https://www.nist.gov/ncnr/neutron-instruments/sample-environment/sample-mounting/reference-tables
 * "Physical properties of selected metals at 295K", seção de condutividade Wm^-1 K^-1.
 * Referencias citadas pela pagina: Guy K. White (1979); CRC Handbook, ed. Weast (1975).
 * Nao ha amostra/pureza/fase/pressao individual verificada; nao CNTP 273.15K.
 * Apenas leitura em Explorar > Conducao termica: NUNCA calibra o motor de calor.
 */
SILM.researchThermalNIST=(()=>{
 const source=Object.freeze({
  id:'nist-ncnr-thermal-295k-selected-metals',
  title:'NIST NCNR, Reference Tables — Physical properties of selected metals at 295K',
  url:'https://www.nist.gov/ncnr/neutron-instruments/sample-environment/sample-mounting/reference-tables',
  compilationSources:Object.freeze([
   'G. K. White, Experimental Techniques in Low-Temperature Physics, 3rd ed., 1979',
   'CRC Handbook of Chemistry and Physics, 56th ed., R. C. Weast, 1975'
  ]),
  classification:'institutional-reference-compilation',
  temperatureK:295,
  pressurePa:null,
  purity:null,
  samplePreparation:null,
  conditionMatchCNTP:false,
  unit:'W/(m·K)'
 });
 const tuples=[
  [13,'Al','Alumínio',235],
  [48,'Cd','Cádmio',97],
  [29,'Cu','Cobre',400],
  [79,'Au','Ouro',317],
  [49,'In','Índio',87],
  [82,'Pb','Chumbo',35]
 ];
 const records=Object.freeze(tuples.map(([atomicNumber,symbol,name,value])=>
  Object.freeze({
   id:'nist-ncnr-295k-'+symbol.toLowerCase(),atomicNumber,symbol,name,
   property:'thermal',conductivity:value,unit:source.unit,
   temperatureK:source.temperatureK,pressurePa:null,
   sourceId:source.id,sample:'Metal listado no resumo do NIST; pureza/estado individual nao especificados',
   evidenceType:'compiled-reference',CNTPhomologated:false,referenceOnly:true,engineRelease:false
  })
 ));
 const byAtomicNumber=new Map(records.map(x=>[x.atomicNumber,x]));
 return Object.freeze({source,records,get:z=>byAtomicNumber.get(Number(z))||null,
  approvedCNTPCases:0,simulationEngineChanged:false});
})();
