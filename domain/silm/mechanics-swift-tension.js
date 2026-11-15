'use strict';
window.SILM=window.SILM||{};
/*
 * SILM Etapa 85A — ensaio axial homogêneo de Swift + Considère.
 * Independente do CPFEM (#172), sem publicar números de metais.
 * σtrue = K (ε0 + εp)^n; aproxima εtrue ≈ εp na região plástica.
 * Incompressibilidade plástica: A/A0 = exp(-εtrue).
 * dσ/dε = σ -> εp,onset ≈ n - ε0 (instabilidade difusa idealizada).
 * Não se deve extrapolar a lei homogênea após a estricção.
 */
SILM.mechanicsSwiftTension=(()=>{
 const finite=Number.isFinite;
 const frozen=a=>Object.freeze([...a]);
 function setup({K,n,epsilon0=0,stressUnit='relative',conditions=null,provenance='hypothetical'}={}){
  if(!finite(K)||K<=0||!finite(n)||n<=0||n>1||
    !finite(epsilon0)||epsilon0<0||epsilon0>=n)
   throw new RangeError('Parâmetros de Swift fisicamente inválidos');
  if(!['relative','MPa','Pa'].includes(stressUnit))
   throw new RangeError('Unidade de tensão desconhecida');
  if(!['hypothetical','fit-experimental','fit-digitized','fit-computational'].includes(provenance))
   throw new RangeError('Procedência não identificada');
  if(stressUnit!=='relative'&&(!conditions||typeof conditions!=='object'||Array.isArray(conditions)||
     Object.keys(conditions).length===0))throw new TypeError('Condições originais obrigatórias para tensão dimensional');
  // Não converte para CNTP nem infere fase/pureza.
  const conditionsCopy=conditions?JSON.parse(JSON.stringify(conditions)):null;
  const onset=n-epsilon0;
  function evaluate(strain){
   if(!finite(strain)||strain<0||strain>2)throw new RangeError('Deformação verdadeira fora de 0–2');
   if(strain>onset+1e-12)return Object.freeze({ok:false,status:'POST_NECKING_UNRESOLVED',
    epsilonPlastic:strain,onset,calibrated:false,
    limitation:'A instabilidade foi ultrapassada; campo local e carga pós-estricção não são calculados.'});
   const eps=Math.min(strain,onset),base=epsilon0+eps;
   // Quando eps0=0 no início, a inclinação é singular: limite matemático, não infinito medido.
   const trueStress=K*Math.pow(base,n);
   const hardeningSlope=base===0?null:K*n*Math.pow(base,n-1);
   const lengthRatio=Math.exp(eps),areaRatio=1/lengthRatio;
   const engineeringStrain=lengthRatio-1,engineeringStress=trueStress*areaRatio;
   return Object.freeze({ok:true,status:eps>=onset-1e-12?'NECKING_ONSET_IDEALIZED':'UNIFORM_APPROXIMATION',
    epsilonPlastic:eps,epsilonTrueApprox:eps,engineeringStrain,
    trueStress,engineeringStress,hardeningSlope,
    areaRatio,lengthRatio,neckingCriterion:hardeningSlope===null?null:hardeningSlope-trueStress,
    onset,stressUnit,calibrated:false});
  }
  function curve(points=41){
   if(!Number.isInteger(points)||points<2||points>500)
    throw new RangeError('Quantidade de pontos inválida');
   return frozen(Array.from({length:points},(_,i)=>evaluate(onset*i/(points-1))));
  }
  return Object.freeze({schema:'silm.mechanics-swift-uniform.v1',law:'Swift',K,n,epsilon0,
   onset,stressUnit,conditions:conditionsCopy,provenance,
   evaluate,curve,calibrated:false,modelValidated:false,postNecking:false,
   limitations:frozen([
    'Hipótese de tração uniaxial homogênea com incompressibilidade plástica.',
    'Aproxima deformação verdadeira total por deformação plástica; elasticidade omitida.',
    'Considère idealizado não prevê geometria de estricção, dano ou ruptura.',
    'Parâmetros medidos não tornam o ajuste automaticamente validado para outro ensaio.'
   ])});
 }
 // Ajusta n e K por mínimos quadrados dos logaritmos, com ε0 FIXO e informado.
 // As amostras devem vir do trecho homogêneo de tração já selecionado.
 function fit({samples,epsilon0=0,conditions,sourceId,origin='experimental',stressUnit='MPa'}={}){
  if(!['experimental','digitized','computational'].includes(origin)||
     typeof sourceId!=='string'||!sourceId.trim()||
     !conditions||typeof conditions!=='object'||Array.isArray(conditions)||
     !Object.keys(conditions).length)
   throw new TypeError('Fonte e condições experimentais/computacionais obrigatórias');
  if(!finite(epsilon0)||epsilon0<0||epsilon0>1||
     !Array.isArray(samples)||samples.length<4||samples.length>500)
   throw new RangeError('Amostragem ou pré-deformação inválida');
  let previous=-1;
  const pairs=samples.map(record=>{
   const ep=record?.epsilonPlastic,sigma=record?.sigmaTrue;
   if(!finite(ep)||!finite(sigma)||ep<=previous||ep<0||ep>1||
      sigma<=0||ep+epsilon0<=0)throw new RangeError('Pontos de tração não ordenados, positivos e finitos obrigatórios');
   previous=ep;return [Math.log(ep+epsilon0),Math.log(sigma)];
  });
  const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
  const mx=avg(pairs.map(x=>x[0])),my=avg(pairs.map(x=>x[1]));
  const sxx=pairs.reduce((s,p)=>s+(p[0]-mx)**2,0);
  const sxy=pairs.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0);
  if(sxx<1e-12)throw new RangeError('Intervalo de deformação insuficiente');
  const n=sxy/sxx,K=Math.exp(my-n*mx);
  if(!finite(K)||!finite(n)||K<=0||n<=0||n>1||epsilon0>=n)
   return Object.freeze({ok:false,status:'OUTSIDE_SWIFT_DOMAIN',
     reason:'Dados não produzem parâmetros admissíveis para este modelo; ajuste não publicado.',
     calibrated:false,sourceId});
  const deviations=pairs.map(([x,y])=>y-(Math.log(K)+n*x));
  const sse=deviations.reduce((s,x)=>s+x*x,0);
  const sst=pairs.reduce((s,p)=>s+(p[1]-my)**2,0);
  const r2=sst>0?Math.max(-Infinity,1-sse/sst):0;
  const model=setup({K,n,epsilon0,stressUnit,conditions,
   provenance:'fit-'+origin});
  return Object.freeze({ok:true,status:'FIT_ONLY_UNVALIDATED',K,n,epsilon0,
   r2,logRmse:Math.sqrt(sse/pairs.length),points:pairs.length,
   sourceId,origin,stressUnit,originalConditions:JSON.parse(JSON.stringify(conditions)),
   model,calibrated:false,modelValidated:false,
   disclaimer:'Ajuste não é validação experimental independente; use apenas no trecho homogêneo, com as condições da fonte.'});
 }
 return Object.freeze({schema:'silm.mechanics-swift-uniform.v1',setup,fit,
  scientificScope:'uniaxial-pre-necking-idealization',
  canPredictRupture:false,canReplaceCPFEM:false,calibrated:false});
})();