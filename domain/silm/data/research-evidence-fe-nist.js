'use strict';
window.SILM=window.SILM||{};
/**
 * NIST TN 1879 (Lucon et al., 2015), Table 6: BAM means for four iron samples.
 * Documentary reference for "Explorar > Ductilidade"; NOT input to a material
 * simulation, NOT a curve or value validated at SILM's 273.15 K / 101325 Pa.
 * Source: https://doi.org/10.6028/NIST.TN.1879
 */
SILM.researchEvidence=(()=>{
 const source=Object.freeze({
  id:'nist-tn1879-bam-table6',
  url:'https://doi.org/10.6028/NIST.TN.1879',
  title:'Lucon et al. (2015), NIST Technical Note 1879, Tabela 6',
  temperatureLabel:'21 ± 3 °C (291,15–297,15 K)',
  temperatureRangeK:Object.freeze([291.15,297.15]),
  pressurePa:null,
  referenceCNTPVerified:false,
  evidenceType:'measured-condition-specific'
 });
 const samples=Object.freeze({
  K05:Object.freeze({code:'K05',name:'Ferro comercialmente puro',purityPercent:99.98396}),
  K02:Object.freeze({code:'K02',name:'Ferro de alta pureza',purityPercent:99.9916}),
  S11:Object.freeze({code:'S11',name:'Ferro de alta pureza',purityPercent:99.99118}),
  A11:Object.freeze({code:'A11',name:'Ferro de ultralta pureza',purityPercent:99.9999878})
 });
 // id, sample, strain rate s^-1, yield strength MPa, ultimate tensile strength
 // MPa, elongation at fracture %, reduction in area %. BAM Table 6, means.
 const table=Object.freeze([
  ['Fe-K05-BAM-0.001','K05',1e-3,231,283,47,95],
  ['Fe-K05-BAM-0.0001','K05',1e-4,204,262,51,95],
  ['Fe-K05-BAM-1e-05','K05',1e-5,176,250,50,95],
  ['Fe-K02-BAM-0.001','K02',1e-3,195,245,46,88],
  ['Fe-K02-BAM-0.0001','K02',1e-4,169,237,47,89],
  ['Fe-K02-BAM-1e-05','K02',1e-5,163,232,43,91],
  ['Fe-S11-BAM-0.001','S11',1e-3,105,206,73,96],
  ['Fe-S11-BAM-0.0001','S11',1e-4,88,201,73,96],
  ['Fe-S11-BAM-1e-05','S11',1e-5,66,189,66,96],
  ['Fe-A11-BAM-0.001','A11',1e-3,68,201,71,95],
  ['Fe-A11-BAM-0.0001','A11',1e-4,44,188,67,95],
  ['Fe-A11-BAM-1e-05','A11',1e-5,28,178,58,95]
 ]);
 const profiles=Object.freeze(table.map(([id,sample,strainRatePerSecond,yieldStrengthMPa,tensileStrengthMPa,elongationAtFracturePercent,reductionOfAreaPercent])=>Object.freeze({
  id,atomicNumber:26,symbol:'Fe',property:'ductility',sample,
  strainRatePerSecond,yieldStrengthMPa,tensileStrengthMPa,
  elongationAtFracturePercent,reductionOfAreaPercent,
  sourceId:source.id,conditionSpecific:true,CNTPVerified:false,
  engineRelease:false,referenceOnly:true
 })));
 const byAtomicNumber=atomicNumber=>Number(atomicNumber)===26?profiles:[];
 const bySample=(atomicNumber,sample)=>byAtomicNumber(atomicNumber).filter(p=>p.sample===sample);
 return Object.freeze({source,samples,profiles,byAtomicNumber,bySample});
})();
