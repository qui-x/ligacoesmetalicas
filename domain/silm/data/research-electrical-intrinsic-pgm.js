'use strict';
window.SILM=window.SILM||{};
/**
 * Avaliações da RESISTIVIDADE INTRÍNSECA (rho_i, não rho total) nos sólidos
 * Ru, Rh, Os e Ir por J. W. Arblaster, Johnson Matthey Technology Review 2016.
 * Tabelas da literatura, não medição nova e não um modelo do SILM.
 * Mais importantes: ambas as fases hexagonais Ru e Os exibem anisotropia;
 * rho_i,avg=(2*rho_i,perp + rho_i,parallel)/3 no intervalo publicado.
 *
 * Ao contrário de ρtotal=ρresidual+ρintrínseca, a componente residual depende
 * de defeitos e impurezas. Não calcular σ da AMOSTRA como 1/ρintrínseca!
 * Pressão/pureza/processamento de uma amostra SILM não estabelecidos:
 * nenhum dos dados é homologado para usar no motor ou Joule (CNTP).
 *
 * Tabelas explicitamente transcritas: não interpolar entre pontos publicados,
 * não estender a fase sólida além do intervalo, não supor anisotropia não tabulada.
 */
SILM.researchIntrinsicPGM=(()=>{
 const sources=Object.freeze({
  'arblaster-II':Object.freeze({
   id:'arblaster-II',author:'J. W. Arblaster',year:2016,
   title:'Selected Electrical Resistivity Values for the Platinum Group of Metals, Part II: Rhodium and Iridium',
   journal:'Johnson Matthey Technology Review 60(1), 4–11',
   doi:'10.1595/205651316X689855',
   url:'https://doi.org/10.1595/205651316X689855',
   referenceType:'literature-evaluation-of-intrinsic-resistivity'
  }),
  'arblaster-III':Object.freeze({
   id:'arblaster-III',author:'J. W. Arblaster',year:2016,
   title:'Selected Electrical Resistivity Values for the Platinum Group of Metals, Part III: Ruthenium and Osmium',
   journal:'Johnson Matthey Technology Review 60(3), 179–185',
   doi:'10.1595/205651316X691618',
   url:'https://doi.org/10.1595/205651316X691618',
   referenceType:'literature-evaluation-of-intrinsic-resistivity'
  })
 });
 // [temperature K, rho_i average micro-ohm cm, rho_i perpendicular, rho_i parallel]
 // null on missing axes: never infer them from the average.
 const data=[
  {atomicNumber:44,symbol:'Ru',name:'Rutênio',phase:'HC (hcp)',sourceId:'arblaster-III',
   sourceTable:'Tabelas I e II, pp. 180–181',sourceSelected:'Tabela I, p. 180',
   selectedUncertaintyMicroOhmCm:0.05,selectedOrientation:'polycrystalline-average-evaluation',
   curve:[
    [230,4.91,5.30,4.12],[240,5.20,5.62,4.36],[250,5.49,5.94,4.60],
    [260,5.78,6.25,4.83],[270,6.07,6.57,5.07],
    [273.15,6.16,6.67,5.14],[280,6.37,6.91,5.28],
    [290,6.67,7.26,5.48],[300,6.96,7.61,5.68]
   ],
   details:'Fonte avalia resistividade intrínseca de monocristais HC para as direções perpendicular/paralela ao eixo c; média convencional (2ρ⊥+ρ∥)/3. ±0,05 µΩ·cm na seleção a 273,15 K.'
  },
  {atomicNumber:45,symbol:'Rh',name:'Ródio',phase:'CFC (fcc)',sourceId:'arblaster-II',
   sourceTable:'Tabelas I e II, pp. 5–6',sourceSelected:'Tabela I, p. 5',
   selectedUncertaintyMicroOhmCm:0.04,selectedOrientation:'isotropic-fcc',
   curve:[
    [230,3.51,null,null],[240,3.71,null,null],[250,3.90,null,null],
    [260,4.10,null,null],[270,4.29,null,null],
    [273.15,4.35,null,null],[280,4.48,null,null],
    [290,4.68,null,null],[300,4.87,null,null]
   ],
   details:'Resistividade intrínseca avaliada de Rh metálico CFC; o desvio residual específico das amostras não está contido no valor selecionado. ±0,04 µΩ·cm a 273,15 K.'
  },
  {atomicNumber:76,symbol:'Os',name:'Ósmio',phase:'HC (hcp)',sourceId:'arblaster-III',
   sourceTable:'Tabelas IV e V, pp. 182–183',sourceSelected:'Tabela IV, p. 182',
   selectedUncertaintyMicroOhmCm:null,selectedOrientation:'polycrystalline-average-evaluation',
   curve:[
    [230,6.57,null,null],[240,6.92,null,null],[250,7.26,null,null],
    [260,7.61,null,null],[270,7.76,null,null],
    [273.15,8.07,9.35,5.53],[280,8.38,9.70,5.73],
    [290,8.82,10.2,6.03],[300,9.25,10.7,6.32]
   ],
   details:'Para Os, a tabela não fornece ρ⊥ e ρ∥ abaixo de 273,15 K. A orientação só pode ser comparada a partir de 273,15 K. A média tabulada é selecionada, não extrapolada a partir de um valor total de amostra.'
  },
  {atomicNumber:77,symbol:'Ir',name:'Irídio',phase:'CFC (fcc)',sourceId:'arblaster-II',
   sourceTable:'Tabelas IV e V, pp. 7–8',sourceSelected:'Tabela IV, p. 7',
   selectedUncertaintyMicroOhmCm:0.05,selectedOrientation:'isotropic-fcc',
   curve:[
    [230,3.82,null,null],[240,4.02,null,null],[250,4.21,null,null],
    [260,4.41,null,null],[270,4.61,null,null],
    [273.15,4.67,null,null],[280,4.80,null,null],
    [290,5.00,null,null],[300,5.20,null,null]
   ],
   details:'Resistividade intrínseca avaliada para Ir sólido CFC. ±0,05 µΩ·cm no valor selecionado a 273,15 K; valores de ρtotal de amostras podem diferir.'
  }
 ];
 const profiles=Object.freeze(data.map(entry=>{
  const curve=Object.freeze(entry.curve.map(([temperatureK,rhoIntrinsicMicroOhmCm,
    rhoPerpendicularMicroOhmCm,rhoParallelMicroOhmCm])=>Object.freeze({
    temperatureK,rhoIntrinsicMicroOhmCm,rhoPerpendicularMicroOhmCm,rhoParallelMicroOhmCm
  })));
  const row=curve.find(x=>x.temperatureK===273.15);
  return Object.freeze({
   atomicNumber:entry.atomicNumber,symbol:entry.symbol,name:entry.name,
   phase:entry.phase,sourceId:entry.sourceId,sourceTable:entry.sourceTable,
   sourceSelected:entry.sourceSelected,selectedUncertaintyMicroOhmCm:entry.selectedUncertaintyMicroOhmCm,
   selectedOrientation:entry.selectedOrientation,details:entry.details,
   quantity:'intrinsic-electrical-resistivity',unit:'µΩ·cm',
   temperatureK:273.15,pressurePa:null,
   icePoint:row,curve,
   curveKind:'evaluated-published-table-points',curveInterpolated:false,
   residualResistivityIncluded:false,totalResistivityKnown:false,
   CNTPhomologated:false,engineRelease:false,referenceOnly:true
  });
 }));
 const byAtomicNumber=new Map(profiles.map(x=>[x.atomicNumber,x]));
 return Object.freeze({sources,profiles,metals:profiles.length,
  get:z=>byAtomicNumber.get(Number(z))||null,
  allowedTemperatureMinK:230,allowedTemperatureMaxK:300,
  selectedTemperatureK:273.15,fullCNTPApprovalCount:0,
  inputToElectricalEngine:false,inputToJouleEngine:false
 });
})();
