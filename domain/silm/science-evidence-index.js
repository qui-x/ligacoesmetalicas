'use strict';
window.SILM=window.SILM||{};
/*
 * SILM — Etapa 80: índice DOCUMENTAL por elemento e propriedade.
 * Agrega SOMENTE os catálogos existentes, sem replicar números ou transformar
 * estudos diferentes em uma amostra universal. Não altera Properties.data(),
 * elegibilidade, referência estrutural, módulos Medir/Calcular ou motores.
 *
 * Status: 'experimental-conditional', 'evaluated', 'compiled',
 * 'candidate', 'pending'. "Homologado no motor" é sempre false.
 */
SILM.scienceEvidenceIndex=(()=>{
 const S=SILM,keys=Object.freeze(['electrical','thermal','malleability','ductility','luster']);
 const known=new Set(keys),rows=[],seen=new Set();
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const text=x=>typeof x==='string'?x.trim():'';
 const temperature=x=>finite(x)?x:null;
 const metricDefs=Object.freeze({
  elong_break_pct:['Alongamento à ruptura','%','observed'],
  elong_uniform_pct:['Alongamento uniforme','%','observed'],
  elong_break_reported_max_pct:['Máximo relatado de alongamento para uma amostra (não típico)','%','upper-observation'],
  reduction_area_pct:['Redução de área em tração','%','observed'],
  yield_MPa:['Tensão de escoamento relatada','MPa','observed'],
  UTS_MPa:['Resistência máxima à tração relatada','MPa','observed'],
  rolling_reduction_pct:['Redução de espessura aplicada na laminação','%','process-not-limit'],
  compression_strain_pct:['Deformação registrada em compressão','%','reported-not-limit'],
  compression_reported_epsilon_tested:['Deformação axial aplicada em compressão (ε)','adimensional','applied-not-failure'],
  compression_true_strain_tested:['Deformação verdadeira analisada na compressão (ε)','adimensional','applied-not-failure'],
  compression_yield_strength_MPa:['Tensão de escoamento relatada em compressão','MPa','observed'],
  compression_hardening_transition_strain_approx:['Transição aproximada do encruamento (ε)','adimensional','approximate'],
  compression_reported_strain_pct:['Deformação registrada em compressão','%','reported-not-limit'],
  compression_asymptotic_model_MPa:['Tensão assintótica de ajuste constitutivo','MPa','model-fit-not-yield']
 });
 const categoryFor=(key,study)=>{
  if(key==='rolling_reduction_pct'||key.startsWith('compression_'))return 'malleability';
  if((key==='yield_MPa'||key==='UTS_MPa')&&/compress/i.test(text(study.test)))return 'malleability';
  return 'ductility';
 };
 function add({id,atomicNumber,symbol,property,origin,values,status,sourceURL,sourceName,
  sample,temperatureK,temperatureText,pressurePa,qualifier,phase,test,sourceStatus}){
  if(!known.has(property)||!Number.isInteger(atomicNumber)||atomicNumber<1||atomicNumber>118)return;
  const available=(values||[]).filter(x=>finite(x.value)&&text(x.unit)&&text(x.label));
  if(!available.length)return;
  const key=origin+':'+id+':'+property;
  if(seen.has(key))return;
  seen.add(key);
  rows.push(Object.freeze({
   id:key,atomicNumber,symbol,property,origin,values:Object.freeze(available.map(x=>Object.freeze({...x}))),
   status:status||'compiled',sourceURL:typeof sourceURL==='string'&&/^https:\/\//.test(sourceURL)?sourceURL:null,
   sourceName:text(sourceName)||text(origin),
   sample:text(sample)||'Amostra não individualizada na fonte',
   temperatureK:temperature(temperatureK),
   temperatureText:text(temperatureText)||'Temperatura de ensaio não numericamente informada',
   pressurePa:finite(pressurePa)?pressurePa:null,
   qualifier:text(qualifier),phase:text(phase),test:text(test),sourceStatus:text(sourceStatus),
   engineRelease:false,calibrationApproved:false,referenceOnly:true
  }));
 }
 function mechanics(study,origin,stage){
  const z=S.data?.get?.(S.data?.search?.(study.symbol)?.[0]?.atomicNumber)?.atomicNumber
   ||S.data?.search?.(study.symbol)?.find(e=>e.symbol===study.symbol)?.atomicNumber;
  if(!z)return;
  const metrics=study.metrics||{},groups={};
  for(const [metric,value] of Object.entries(metrics)){
   const definition=metricDefs[metric];
   if(!definition||!finite(value))continue;
   const category=categoryFor(metric,study);
   (groups[category]??=[]).push({code:metric,value,label:definition[0],unit:definition[1],
    meaning:study.quantityKinds?.[metric]||definition[2]});
  }
  for(const [property,values] of Object.entries(groups)){
   const pending=study.verification==='original-pending'||study.sourceStatus==='original-source-pending';
   const primary=study.classification==='P1'||study.verification==='primary-confirmed';
   add({id:study.id,atomicNumber:z,symbol:study.symbol,property,origin,values,
    status:pending?'pending':primary?'experimental-conditional':
      study.classification==='P2'?'experimental-conditional':'compiled',
    sourceURL:study.sourceURL,sourceName:'Pesquisa mecânica · Etapa '+stage,
    sample:study.sample,temperatureK:study.testTemperatureK,
    temperatureText:study.testTemperatureDescription,pressurePa:study.pressurePa,
    qualifier:[study.qualifier,study.notes].filter(Boolean).join(' '),
    phase:study.phase,test:study.test,sourceStatus:study.reviewStatus||study.sourceStatus});
  }
 }
 for(const s of S.multistageResearch?.records||[])mechanics(s,'mechanical-stage57',s.studyStage||57);
 for(const s of S.stage65Evidence?.records||[])mechanics(s,'mechanical-stage65',s.studyStage||65);
 for(const s of S.compressionStage73?.records||[])mechanics(s,'compression-stage73',73);
 for(const p of S.researchEvidence?.profiles||[]){
  const source=S.researchEvidence.source,sp=S.researchEvidence.samples?.[p.sample];
  add({id:p.id,atomicNumber:p.atomicNumber,symbol:p.symbol,property:'ductility',origin:'fe-nist-tn1879',
   values:[
    {code:'elongation',value:p.elongationAtFracturePercent,label:'Alongamento à ruptura',unit:'%',meaning:'experimental-sample'},
    {code:'yield',value:p.yieldStrengthMPa,label:'Escoamento',unit:'MPa',meaning:'experimental-sample'},
    {code:'UTS',value:p.tensileStrengthMPa,label:'Resistência máxima à tração',unit:'MPa',meaning:'experimental-sample'},
    {code:'reductionArea',value:p.reductionOfAreaPercent,label:'Redução de área',unit:'%',meaning:'experimental-sample'}],
   status:'experimental-conditional',sourceURL:source?.url,sourceName:source?.title,
   sample:p.sample+' · '+(sp?.name||'Ferro')+' · taxa '+p.strainRatePerSecond+' s⁻¹',
   temperatureK:null,temperatureText:source?.temperatureLabel,
   qualifier:'Média da amostra BAM, não ductilidade universal do ferro.'});
 }
 for(const p of S.researchElectricalIcepoint?.records||[]){
  const src=S.researchElectricalIcepoint.sources?.[p.sourceId];
  add({id:p.id,atomicNumber:p.atomicNumber,symbol:p.symbol,property:'electrical',origin:'electrical-icepoint',
   values:[{code:'rhoTotal',value:p.resistivityMicroOhmCm,label:'Resistividade elétrica TOTAL',unit:'µΩ·cm',meaning:'total'},
    {code:'sigmaDerived',value:p.conductivitySM,label:'Condutividade derivada de ρ total',unit:'S/m',meaning:'derived-not-independent'}],
   status:p.reviewStatus==='needs-comparison'?'candidate':'evaluated',sourceURL:src?.url,
   sourceName:src?.title,sample:p.sample,temperatureK:p.temperatureK,
   temperatureText:p.temperatureBasis,pressurePa:p.pressurePa,
   qualifier:p.note,sourceStatus:p.reviewStatus});
 }
 for(const p of S.researchIntrinsicPGM?.profiles||[]){
  const src=S.researchIntrinsicPGM.sources?.[p.sourceId];
  add({id:p.symbol+'-intrinsic',atomicNumber:p.atomicNumber,symbol:p.symbol,property:'electrical',origin:'pgm-intrinsic',
   values:[{code:'rhoIntrinsic',value:p.icePoint?.rhoIntrinsicMicroOhmCm,
    label:'Resistividade INTRÍNSECA (não total)',unit:'µΩ·cm',meaning:'intrinsic-NOT-sample-conductivity'}],
   status:'evaluated',sourceURL:src?.url,sourceName:src?.title,sample:p.details,
   temperatureK:p.temperatureK,pressurePa:p.pressurePa,temperatureText:'Ponto tabulado a 273,15 K',
   qualifier:'Não aplicar σ=1/ρ como condutividade real da amostra: a resistividade residual é desconhecida.',
   phase:p.phase});
 }
 for(const p of S.researchThermalNIST?.records||[]){
  add({id:p.id,atomicNumber:p.atomicNumber,symbol:p.symbol,property:'thermal',origin:'nist-thermal295',
   values:[{code:'k',value:p.conductivity,label:'Condutividade térmica compilada',unit:p.unit,meaning:'compiled'}],
   status:'compiled',sourceURL:S.researchThermalNIST.source?.url,
   sourceName:S.researchThermalNIST.source?.title,sample:p.sample,
   temperatureK:p.temperatureK,pressurePa:p.pressurePa,
   qualifier:'Compilação institucional; pureza individual não identificada. Não parametriza motor de calor.'});
 }
 for(const p of S.opticalResearchCandidates?.records||[]){
  add({id:p.id,atomicNumber:p.atomicNumber,symbol:p.symbol,property:'luster',origin:'optical-r550',
   values:[{code:'R550',value:p.R,label:'Refletância de referência em 550 nm',unit:'fração',meaning:'ideal-surface-candidate'}],
   status:'candidate',sourceURL:p.sourceURL,sourceName:p.sourceDataset,
   sample:p.sample,temperatureK:p.temperatureK,temperatureText:p.sourceCondition,
   qualifier:[p.warning,'R(550 nm) não mede o brilho percebido nem representa peça oxidada/rugosa. Fonte original individual pendente quando indicada.'].filter(Boolean).join(' '),
   sourceStatus:p.sourceStatus,phase:''});
 }
 for(const p of S.sevenConditionResearch?.records||[]){
  const status=p.grade==='secondary-pending'?'pending':
   p.grade==='optical-derived'||p.grade==='primary-bound'||p.grade==='processing-only'||
    p.grade==='fit-derived'?'candidate':
   p.grade?.startsWith('primary-')||p.grade==='historical-specimen'?'experimental-conditional':
    p.grade?.startsWith('recommended-')||p.grade==='compilation-evaluated'?'evaluated':'compiled';
  const code=p.property==='electrical'?'rho':p.property==='thermal'?'k':
   p.property==='luster'?'R550':p.property==='malleability'?'malleability-study':'ductility-study';
  add({id:p.id,atomicNumber:p.atomicNumber,symbol:p.symbol,property:p.property,origin:'seven-stage78',
   values:[{code,value:p.value,label:p.quantity,unit:p.unit,
    meaning:p.grade==='primary-bound'?'lower-bound-not-point':
     p.grade==='processing-only'?'processing-not-intrinsic-limit':
     p.grade==='fit-derived'?'derived-not-measured':'conditional'}],
   status,sourceURL:p.sourceURL,sourceName:'Estudo dos sete metais · '+p.grade,
   sample:p.sample,temperatureK:p.temperatureK,temperatureText:p.temperatureText,
   pressurePa:p.pressurePa,qualifier:p.evidencePolicy,sourceStatus:p.grade});
 }
 const sortPriority=Object.freeze({'experimental-conditional':0,evaluated:1,compiled:2,candidate:3,pending:4});
 const byZ=new Map();
 for(const row of rows){
  if(!byZ.has(row.atomicNumber))byZ.set(row.atomicNumber,new Map());
  const map=byZ.get(row.atomicNumber);
  if(!map.has(row.property))map.set(row.property,[]);
  map.get(row.property).push(row);
 }
 for(const map of byZ.values())for(const [key,list] of map.entries()){
  list.sort((a,b)=>(sortPriority[a.status]??4)-(sortPriority[b.status]??4)||a.id.localeCompare(b.id));
  map.set(key,Object.freeze(list));
 }
 const getFor=(z,property,{includePending=true,excludeSeven=false}={})=>{
  const arr=byZ.get(Number(z))?.get(property)||[];
  return !includePending||excludeSeven?arr.filter(x=>(includePending||x.status!=='pending')&&
   (!excludeSeven||x.origin!=='seven-stage78')):arr;
 };
 const summary=z=>Object.freeze(Object.fromEntries(keys.map(key=>[key,Object.freeze({
  total:getFor(z,key).length,
  traceable:getFor(z,key,{includePending:false}).length,
  pending:getFor(z,key).filter(x=>x.status==='pending').length
 })])));
 const index=Object.freeze({
  schema:'silm.science.evidence-index.v1',keys,rows:Object.freeze(rows),
  getFor,summary,elementCount:byZ.size,sourceCatalogCount:9,
  evidenceIsNotMotorCalibration:true
 });
 return index;
})();
