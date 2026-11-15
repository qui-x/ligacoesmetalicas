'use strict';
window.SILM=window.SILM||{};
/*
 * SILM Etapa 94 — Li/Na/Ca/V/Pt/Hf. Pesquisa documental e não parâmetros motores.
 * Tensão de fluxo, tensão de escoamento, deformação aplicada e microdureza
 * são métricas DISTINTAS; não implicam maleabilidade até ruptura.
 * Preservar condições originais; CNTP NÃO é filtro.
 */
SILM.scientificMechanicalStage94=(()=>{
 const sources={
  Li:['Darnbrough & Armstrong (2024) · Batteries 10, 20','https://doi.org/10.3390/batteries10010020'],
  Na:['Fincher et al. (2020) · ACS Applied Energy Materials 3, 1759–1767','https://doi.org/10.1021/acsaem.9b02225'],
  Ca:['Shin, Fincher & Pharr (2023) · Extreme Mechanics Letters 64, 102081','https://doi.org/10.1016/j.eml.2023.102081'],
  V:['Behera, Kapoor & Sarkar (2024) · IJRMHM 122, 106711','https://doi.org/10.1016/j.ijrmhm.2024.106711'],
  Pt:['Tang et al. (2025) · Materials 18, 783','https://doi.org/10.3390/ma18040783'],
  Hf:['Yu, Luo, Ni & Song (2020) · Materials Characterization 169, 110639','https://doi.org/10.1016/j.matchar.2020.110639']
 };
 const specs=[
  ['Li',3,'flow-3e-4',0.75,'MPa','Tensão de fluxo em compressão, corrigida pela geometria','stress-flow-not-failure','99,9% Li; bloco 2:1; Ar seco; ~25°C; ~3×10⁻⁴/s','Não equivale a deformação limite.'],
  ['Li',3,'flow-6e-4',1.0,'MPa','Tensão de fluxo em compressão, corrigida pela geometria','stress-flow-not-failure','99,9% Li; bloco 2:1; Ar seco; ~25°C; ~6–8×10⁻⁴/s','Fonte diverge entre ~6×10⁻⁴/s e ~8×10⁻⁴/s na descrição da taxa superior.'],
  ['Na',11,'strain08',0.08,'adimensional','Deformação de referência da compressão','applied-not-failure','Na sólido; ambiente; taxas 10⁻⁴–10⁻²/s','ε=0,08 é ponto de referência para fluxo, não limite de fratura.'],
  ['Na',11,'stress-lower',102,'kPa','Tensão de fluxo inferior em ε=0,08','range-lower-not-single-rate','Na sólido; ambiente; taxas 10⁻⁴–10⁻²/s','Extremo do intervalo; taxa exata não individualizada no resumo.'],
  ['Na',11,'stress-upper',254,'kPa','Tensão de fluxo superior em ε=0,08','range-upper-not-single-rate','Na sólido; ambiente; taxas 10⁻⁴–10⁻²/s','Extremo do intervalo; taxa exata não individualizada no resumo.'],
  ['Ca',20,'strain30',0.30,'adimensional','Deformação de engenharia aplicada (~30%)','applied-not-failure','Ca 99%; grão 10–40 µm; ambiente; compressão macroscópica','Conflito interno: método cita 0,1/0,01/0,001/s, Figura 4 cita 0,01/0,001/0,0001/s.'],
  ['Ca',20,'flow-1e-2',112.0,'MPa','Tensão engenharia em ε=0,08','stress-at-strain-not-failure','Ca 99%; ambiente; taxa 10⁻²/s conforme Figura 4','Método e Figura 4 divergem nas taxas. Não usar para calibrar sem conciliação.'],
  ['Ca',20,'flow-1e-3',103.1,'MPa','Tensão engenharia em ε=0,08','stress-at-strain-not-failure','Ca 99%; ambiente; taxa 10⁻³/s conforme Figura 4','Método e Figura 4 divergem nas taxas. Não usar para calibrar sem conciliação.'],
  ['Ca',20,'flow-1e-4',106.1,'MPa','Tensão engenharia em ε=0,08','stress-at-strain-not-failure','Ca 99%; ambiente; taxa 10⁻⁴/s conforme Figura 4','Método e Figura 4 divergem nas taxas. Não usar para calibrar sem conciliação.'],
  ['V',23,'strain06',0.6,'adimensional','Deformação verdadeira aplicada em compressão','applied-not-failure','V 99,94%; vácuo; 800–1400 °C; 0,003–10/s; Ø5×10 mm','Deformação experimental aplicada NÃO representa falha.'],
  ['V',23,'activation-energy',244,'kJ/mol','Energia de ativação aparente de ajuste','constitutive-model-fit-not-measurement','V 99,94%; 800–1400°C; regressão constitutiva','Parâmetro ajustado, não medição de tensão/strain nem constante universal.'],
  ['Pt',78,'strain09',0.9,'adimensional','Deformação verdadeira alvo de compressão','applied-not-failure','Pt ≥99,9%; 500–700°C; 0,01/s; redução de altura 60%; Ø8×10mm','60% de altura não equivale a 60% de deformação verdadeira nem a ruptura.'],
  ['Pt',78,'grain-700',43.4,'µm','Grão médio pós-compressão a 700°C (EBSD)','microstructure-not-malleability','Pt ≥99,9%; 700°C; 0,01/s; grão inicial 121,9 µm','É resultado microestrutural, não limite de plasticidade.'],
  ['Hf',72,'yield-300',500,'MPa','Escoamento dinâmico aproximado em compressão','yield-stress-not-failure','Hf; ~300/s; condições térmicas e pureza não completas no resumo','Não concatenar com referência quase-estática de ~400 MPa de outra amostra.'],
  ['Hf',72,'hardness-2800',334.6,'HV','Microdureza após compressão dinâmica','microhardness-not-yield','Hf; ~2800/s; maclação, transformação cristalográfica e DRX','HV não é MPa nem deformação; não converter automaticamente.']
 ];
 const primary=new Set(['Li-flow-3e-4','Na-strain08','Ca-strain30','V-strain06','Pt-strain09','Hf-yield-300']);
 const rows=Object.freeze(specs.map(([symbol,atomicNumber,key,value,unit,label,meaning,condition,qualifier])=>{
  const m={id:'silm94-'+symbol+'-'+key,atomicNumber,symbol,property:'malleability',
   origin:'stage94-conditional-compression',status:meaning==='constitutive-model-fit-not-measurement'?'candidate':'experimental-conditional',
   sourceName:sources[symbol][0],sourceURL:sources[symbol][1],sample:condition,
   temperatureK:null,temperatureText:condition,phase:'solid',
   values:Object.freeze([Object.freeze({code:key,label,value,unit,meaning})]),
   qualifier,sourceStatus:meaning,primaryFor400:primary.has(symbol+'-'+key),
   referenceOnly:true,engineRelease:false,calibrationApproved:false};
  return Object.freeze(m);
 }));
 const byZ=new Map();
 for(const r of rows){const a=byZ.get(r.atomicNumber)||[];byZ.set(r.atomicNumber,[...a,r])}
 for(const [z,a] of byZ.entries())byZ.set(z,Object.freeze(a));
 return Object.freeze({schema:'silm.stage94.conditional-compression.v1',
  rows,getFor:(z,p)=>p==='malleability'?(byZ.get(Number(z))||[]):[],
  newNumericSlots:Object.freeze(['Li-malleability','Na-malleability','Ca-malleability','V-malleability','Hf-malleability','Pt-malleability']),
  primaryEvidenceLinks:6,engineRelease:false});
})();
