'use strict';
window.SILM=window.SILM||{};
/** Pesquisa SILM: resistividade elétrica de referência no ponto de gelo.
 * Fontes avaliadas: Fickett, NBS TN 1053 (1982), tabela 1.1, p. 4;
 * Matula, JPCRD 8 (1979), tabelas 2/5/8/11; Chi, JPCRD 8 (1979), tabela 19.
 *
 * ATENÇÃO:
 * - Refs NBS = compilações de amostras de metais puros; não amostra universal.
 * - Matula e Chi = valores TOTAIS recomendados/evaluados; não confundir com
 *   resistividade INTRÍNSECA, particularmente Ra (excluído).
 * - A tabela declara "ice point"/273,15 K; pressão individual em Pa não
 *   estabelecida; portanto nenhuma ficha certificada na CNTP 1 atm.
 * - ρ exibida em µΩ·cm (1 µΩ·cm = 1e-8 Ω·m);
 *   σ = 1/ρ derivada matematicamente, NÃO ensaio de σ separado.
 * - Não alimenta o motor eletrotérmico (Joule), nem seus pesos relativos.
 * - Sn excluído: alteração alotrópica ~13,2°C exige qualificar fase beta
 *   reportada para a leitura de 0°C antes de conectar ao sólido de referência.
 * - Mn: somente fase alfa, não copiar valores das fases beta/gama.
 */
SILM.researchElectricalIcepoint=(()=>{
 const sources=Object.freeze({
  'nbs-tn1053':Object.freeze({
   id:'nbs-tn1053',title:'Fickett, NBS Technical Note 1053 (1982), Tabela 1.1, p. 4',
   authors:'F. R. Fickett',year:1982,
   url:'https://nvlpubs.nist.gov/nistpubs/Legacy/TN/nbstechnicalnote1053.pdf',
   sourceType:'evaluated-secondary-compilation',temperatureK:273.15,pressurePa:null
  }),
  'matula-1979':Object.freeze({
   id:'matula-1979',title:'Matula (1979), Electrical Resistivity of Copper, Gold, Palladium and Silver',
   authors:'R. A. Matula',year:1979,
   url:'https://srd.nist.gov/JPCRD/jpcrd155.pdf',
   sourceType:'critically-evaluated-reference',temperatureK:273.15,pressurePa:null
  }),
  'chi-1979':Object.freeze({
   id:'chi-1979',title:'Chi (1979), Electrical Resistivity of Alkaline Earth Elements',
   authors:'T. C. Chi',year:1979,
   url:'https://srd.nist.gov/JPCRD/jpcrd139.pdf',
   sourceType:'critically-evaluated-reference',temperatureK:273.15,pressurePa:null
  })
 });
 // atomicNumber, symbol, rho in microOhm.cm, page/table, note, condition marker.
 // 20 rows NBS pure-metal ice-point table (no Sn), 4 Matula, 5 Chi.
 const nbs=[
  [13,'Al',2.428],[4,'Be',2.70,'policristalino / anisotropia em monocristais'],
  [27,'Co',5.24],[29,'Cu',1.553],[24,'Cr',12.155],
  [79,'Au',2.058,'interpolação da fonte original'],
  [49,'In',8],[26,'Fe',9.07,'interpolação da fonte original'],
  [82,'Pb',19.2],[12,'Mg',4.12,'policristalino / anisotropia em monocristais'],
  [25,'Mn',143.5,'APENAS fase alfa (α-Mn); não usar beta/gama'],
  [42,'Mo',5],[28,'Ni',6.23,'interpolação da fonte original'],
  [41,'Nb',13.96],[78,'Pt',9.60],[11,'Na',4.337],
  [47,'Ag',1.48],[22,'Ti',39.4,'policristalino / anisotropia em monocristais'],
  [74,'W',4.94],[30,'Zn',5.45,'policristalino / anisotropia em monocristais']
 ];
 const matula=[
  [29,'Cu',1.543,'Tabela 2, p. 1161','metal maciço recozido, pureza ≥99,999%'],
  [79,'Au',2.051,'Tabela 5, p. 1209','metal maciço recozido, pureza ≥99,999%'],
  [46,'Pd',9.78,'Tabela 8, p. 1239','metal maciço recozido, pureza ≥99,99%'],
  [47,'Ag',1.467,'Tabela 11, p. 1260','metal maciço recozido, pureza ≥99,999%']
 ];
 const chi=[
  [4,'Be',3.02,'valor provisório avaliado; diferença de fontes/espécimes'],
  [12,'Mg',4.05,'valor recomendado, conferir condições de amostra'],
  [20,'Ca',3.11,'valor recomendado; fontes compiladas mostram dispersão'],
  [38,'Sr',12.3,'valor recomendado; grande divergência entre compilações'],
  [56,'Ba',30.2,'valor recomendado; grande divergência entre compilações']
 ];
 const all=[
  ...matula.map(([z,sym,rho,table,sample])=>({z,sym,rho,sourceId:'matula-1979',table,
   sample,note:'Valor de resistividade TOTAL recomendado, não resistividade intrínseca.',
   evidence:'evaluated-total',status:'condition-specific'})),
  ...chi.map(([z,sym,rho,note])=>({z,sym,rho,sourceId:'chi-1979',
   table:'Tabela 19, p. 493',sample:'metal elementar de alta pureza; amostra de referência avaliada',
   note,evidence:'evaluated-total',status:z===4||z===38||z===56?'needs-comparison':'condition-specific'})),
  ...nbs.map(([z,sym,rho,note])=>({z,sym,rho,sourceId:'nbs-tn1053',
   table:'Tabela 1.1, p. 4',sample:'metal puro da compilação (sem amostra única universal)',
   note:note||'Compilação institucional; detalhes da amostra no estudo de origem.',
   evidence:'compiled-total',status:'condition-specific'}))
 ];
 const records=Object.freeze(all.map((r,i)=>{
  const rhoSI=r.rho*1e-8;
  return Object.freeze({
   id:r.sourceId+'-'+r.sym.toLowerCase()+'-27315k-'+i,
   atomicNumber:r.z,symbol:r.sym,property:'electrical',
   sourceId:r.sourceId,sourceTable:r.table,sourceType:r.evidence,
   sample:r.sample,note:r.note,reviewStatus:r.status,
   resistivityMicroOhmCm:r.rho,resistivityOhmM:rhoSI,
   conductivitySM:1/rhoSI,conductivityDerived:true,
   temperatureK:273.15,temperatureBasis:'ice-point-or-explicit-273.15K',
   pressurePa:null,
   sourceTemperatureVerified:true,
   CNTPhomologated:false,engineRelease:false,referenceOnly:true
  });
 }));
 const bySymbol=Object.freeze(Object.fromEntries([...new Set(records.map(x=>x.symbol))].sort().map(symbol=>[
  symbol,Object.freeze(records.filter(x=>x.symbol===symbol))
 ])));
 const byAtomicNumber=z=>{
  const symbol=SILM.data?.get?.(z)?.symbol;
  return symbol?bySymbol[symbol]||[]:[];
 };
 return Object.freeze({
  sources,records,bySymbol,byAtomicNumber,
  count:records.length,metalCount:Object.keys(bySymbol).length,
  referenceTemperatureK:273.15,referencePressurePa:101325,
  measurementsAtReferenceTemperature:records.length,
  completeCNTPApproved:0,engineEnabled:false,
  exclusions:Object.freeze(['Sn: fase β/α não reconciliada para 0 °C',
   'Mn β/γ: não são dados de α-Mn a 273,15 K',
   'Ra: Chi tabela 19 informa apenas ρ intrínseca provisória, não ρ total'])
 });
})();
