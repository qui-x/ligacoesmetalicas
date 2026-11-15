'use strict';
window.SILM=window.SILM||{};
/*
 * SILM — mapa documental 80 x 5: 400 campos, inclusive lacunas.
 * REF: IAEA, Thermophysical Properties of Materials for Nuclear Engineering (2008),
 * Tabela 1.2 p. 5; Hg LIQUIDO Tabela 3.17 p. 104 (linha 293 K).
 * NAO modifica SILM.data, elegibilidade, motores, propriedades nem inferencias.
 */
SILM.scientific400=(()=>{
 const S=SILM,labels=Object.freeze(['electrical','thermal','ductility','malleability','luster']);
 const list=S.batch80Research?.symbols||[],bySymbol=new Map(list.map(m=>[m.symbol,m.atomicNumber]));
 const SOURCE='https://www-pub.iaea.org/MTCD/Publications/PDF/IAEA-THPH_web.pdf';
 const th=[["Li",84.7,300],["Be",200,300],["Na",141,300],["Mg",156,300],["Al",237,300],["K",102,300],["Ti",21.9,300],["V",30.7,300],["Cr",93.7,300],["Mn",7.8,300],["Fe",80.2,300],["Co",71.6,300],["Ni",90.7,300],["Cu",401,300],["Zn",116,300],["Zr",21.2,300],["Nb",51.7,400],["Mo",138,300],["Ag",429,300],["Cd",96.8,300],["Sn",66.6,300],["Hf",23,300],["Ta",57.5,300],["W",174,300],["Pt",71.6,300],["Au",317,300],["Pb",35.3,300],["Bi",7.9,300],["Th",35.6,300],["U",22.6,300],["Pu",5.2,300]];
 const rows=[];
 function add(symbol,property,value,unit,T,phase,metric,table){
  const atomicNumber=bySymbol.get(symbol);
  if(!atomicNumber||!Number.isFinite(value))return;
  rows.push(Object.freeze({id:'silm400-iaea-'+symbol+'-'+property,atomicNumber,symbol,
   property,origin:'IAEA-2008-'+table,status:'compiled',
   values:Object.freeze([Object.freeze({code:metric,value,unit,label:metric==='k'?
     'Condutividade térmica de referência': 'Resistividade elétrica de referência',
    meaning:'evaluated-correlation-or-compilation-not-single-specimen'})]),
   sourceURL:SOURCE,sourceName:'IAEA (2008) · '+table,
   sample:phase==='liquid'?'Hg líquido em linha de saturação':'Metal sólido de referência (amostra individual não informada)',
   temperatureK:T,temperatureText:T+' K (tabela original)',
   phase,qualifier:phase==='liquid'?
    'MERCURIO LIQUIDO; não habilitar estrutura cristalina, deformação sólida ou motor calibrado.':
    'Compilação institucional na temperatura informada; não é medida direta da mesma amostra de outros estudos.',
   sourceStatus:'COMPILACAO_RASTREAVEL',
   evidenceIsModelEstimate:phase==='liquid',
   engineRelease:false,calibrationApproved:false,referenceOnly:true}));
 }
 for(const [symbol,k,T] of th)add(symbol,'thermal',k,'W/(m·K)',T,'solid','k','Tabela 1.2');
 add('Hg','thermal',8.45,'W/(m·K)',293,'liquid','k','Tabela 3.17');
 add('Hg','electrical',95.83e-8,'Ω·m',293,'liquid','rhoTotal','Tabela 3.17');
 const byKey=new Map(rows.map(r=>[r.atomicNumber+'|'+r.property,Object.freeze([r])]));
 const getIAEA=(z,p)=>byKey.get(Number(z)+'|'+p)||[];
 const sourceStatus=(z,p)=>{
  const original=S.scienceEvidenceIndex?.getFor?.(z,p)||[];
  const iaea=getIAEA(z,p);
  const batch=S.batch80Research?.getFor?.(z,p)||[];
  const available=[...original,...iaea,...batch];
  return Object.freeze({property:p,hasNumeric:available.some(x=>x.values?.some(v=>Number.isFinite(v.value))),
   hasSource:available.some(x=>x.sourceURL&&x.status!=='pending'),
   sourceCount:available.length,
   hasPrimarySource:original.some(x=>x.sourceURL&&x.status!=='pending'),
   isResearchOnly:true,calibrationApproved:false});
 };
 const slots=Object.freeze(list.flatMap(m=>labels.map(property=>Object.freeze({
  atomicNumber:m.atomicNumber,symbol:m.symbol,property,structurallyAvailable:!!m.structureAvailable,
  status:sourceStatus(m.atomicNumber,property),
  calibrationApproved:false
 }))));
 return Object.freeze({schema:'silm.400-investigation-slots.v1',labels,
   slots,getIAEA,sourceStatus,summaryFor:z=>labels.map(p=>sourceStatus(z,p)),
   rows:Object.freeze(rows),isResearchOnly:true,motorApprovedSlots:0});
})();
