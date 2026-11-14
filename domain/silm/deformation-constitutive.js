'use strict';
window.SILM=window.SILM||{};
/*
 * SILM Etapa 77 — contrato constitutivo separado do controlador didático.
 * Proposta restrita: elasticidade 1D + plasticidade J2 uniaxial de pequenas
 * deformações com encruamento isotrópico linear. NÃO prevê falha, maclação,
 * anisotropia HC, temperatura, taxa, recristalização ou curva metal-específica
 * sem calibração. O motor visual anterior continua funcionando sem perfis.
 *
 * Referência algorítmica: Sandia LAMÉ J2 (retorno radial); a redução uniaxial
 * é resolvida em tensão e deformação axiais (não é FE 3D).
 * Nenhum metal do catálogo recebe curva quantitativa por este arquivo.
 */
(()=>{
 const S=window.SILM,MODES=Object.freeze(['malleability','ductility']);
 const fail=(reasonCode)=>Object.freeze({ok:false,mode:'qualitative',reasonCode,calibrationReleased:false});
 const finitePositive=x=>Number.isFinite(x)&&x>0;
 const validParameters=p=>!!p&&typeof p==='object'&&finitePositive(p.youngModulusPa)&&
  finitePositive(p.yieldStressPa)&&Number.isFinite(p.hardeningModulusPa)&&p.hardeningModulusPa>=0&&
  p.youngModulusPa>p.yieldStressPa&&p.hardeningModulusPa<p.youngModulusPa;
 const validState=state=>!!state&&typeof state==='object'&&
  ['totalStrain','plasticStrain','accumulatedPlasticStrain','stressPa'].every(k=>Number.isFinite(state[k]))&&
  state.accumulatedPlasticStrain>=0&&
  Math.abs(state.plasticStrain)<=state.accumulatedPlasticStrain+1e-10;
 const initialState=()=>Object.freeze({totalStrain:0,plasticStrain:0,accumulatedPlasticStrain:0,stressPa:0});
 /*
  * Return mapping 1D: sigmaTrial = E (eps_{n+1}-epsP_n);
  * f=|sigmaTrial|-[sigmaY + H alpha_n].
  * DeltaGamma=f/(E+H) if f>0.
  * Small strain only: abs(totalStrain) <= 0.10; this is a numerical
  * domain limit, NEVER material failure strain.
  */
 function solveUniaxial(params,prior,imposedStrain){
  if(!validParameters(params)||!validState(prior)||!Number.isFinite(imposedStrain)||
   Math.abs(imposedStrain)>0.10)return null;
  const trial=params.youngModulusPa*(imposedStrain-prior.plasticStrain),
   flow=params.yieldStressPa+params.hardeningModulusPa*prior.accumulatedPlasticStrain,
   f=Math.abs(trial)-flow;
  const dp=f>0?f/(params.youngModulusPa+params.hardeningModulusPa):0;
  const sign=trial>0?1:trial<0?-1:0;
  const plasticStrain=prior.plasticStrain+sign*dp,alpha=prior.accumulatedPlasticStrain+dp;
  const sigma=params.youngModulusPa*(imposedStrain-plasticStrain);
  if(![plasticStrain,alpha,sigma].every(Number.isFinite))return null;
  const result={totalStrain:imposedStrain,plasticStrain,accumulatedPlasticStrain:alpha,
   stressPa:sigma,regime:dp>0?'plastic':'elastic',incrementalPlasticStrain:dp,
   model:'uniaxial-bilinear-small-strain',failurePrediction:null};
  return Object.freeze(result);
 }
 const nonEmpty=v=>typeof v==='string'&&v.trim().length>0;
 function validSource(s){
  return !!s&&nonEmpty(s.title)&&nonEmpty(s.authors)&&Number.isInteger(s.year)&&
   s.year>=1900&&nonEmpty(s.sampleId)&&
   (nonEmpty(s.doi)||(nonEmpty(s.url)&&s.url.startsWith('https://')));
 }
 function validSpec(spec,atomicNumber,mode){
  if(!spec||spec.atomicNumber!==atomicNumber||spec.mode!==mode||
   spec.model!=='uniaxial-bilinear-small-strain'||spec.evidence!=='EXPERIMENTAL_CALIBRATED'||
   spec.engineRelease!==true||spec.calibrationApproved!==true||
   spec.sourceOriginalChecked!==true||spec.CNTPValidated!==true||
   !validSource(spec.source)||!validParameters(spec.parameters))return false;
  const sample=spec.specimen;
  return !!sample&&nonEmpty(sample.phase)&&nonEmpty(sample.form)&&
   nonEmpty(sample.purityDescription)&&nonEmpty(sample.processingHistory)&&
   nonEmpty(sample.orientation)&&nonEmpty(sample.batchId)&&
   Array.isArray(spec.verifiedModes)&&spec.verifiedModes.includes(mode)&&
   Array.isArray(spec.calibrationDataRefs)&&spec.calibrationDataRefs.length>0&&
   spec.calibrationDataRefs.every(nonEmpty);
 }
 /*
  * Read only from immutable materialProfiles. Source observations in the
  * 65/92 matrices, stage73 compression, stage75 and stage76 are NEVER used
  * as constitutive parameter sets without an explicitly approved profile.
  */
 function capability(atomicNumber,mode,reference='CNTP_BR_0C_1ATM'){
  if(!MODES.includes(mode))return fail('DEFORMATION_MODE_UNKNOWN');
  if(!Number.isInteger(Number(atomicNumber))||Number(atomicNumber)<1||Number(atomicNumber)>118)
   return fail('INVALID_METAL');
  const profile=S.materialProfiles?.get?.(Number(atomicNumber));
  const spec=profile?.mechanical?.[mode];
  if(!spec)return fail('NO_CALIBRATED_STRESS_STRAIN_CURVE');
  if(!validSpec(spec,Number(atomicNumber),mode))return fail('PROFILE_NOT_APPROVED');
  const check=S.referenceConditions?.compare?.(spec.conditions,reference);
  if(!check?.ok)return fail(check?.reasonCode||'REFERENCE_CONDITIONS_UNVERIFIED');
  return Object.freeze({ok:true,mode:'quantitative',reasonCode:null,
   calibrationReleased:true,model:spec.model,property:mode,atomicNumber:Number(atomicNumber),
   source:spec.source,conditions:spec.conditions,parameters:spec.parameters});
 }
 function calculate(atomicNumber,mode,strain,prior=initialState()){
  const c=capability(atomicNumber,mode);
  if(!c.ok)return c;
  const next=solveUniaxial(c.parameters,prior,strain);
  if(!next)return fail('INVALID_CONSTITUTIVE_INPUT');
  return Object.freeze({...next,ok:true,mode:'quantitative',calibrationReleased:true,
   atomicNumber:Number(atomicNumber),source:c.source});
 }
 /*
  * Geometric illustration: trace-free plastic strain in 3D,
  * Fp = diag(exp(-eps/2), exp(-eps/2), exp(eps)), det Fp=1.
  * Input is a step indicator, not a measured plastic deformation.
  */
 function visualEnvelope({mode,step=0,maxSteps=4,load=0}={}){
  if(!MODES.includes(mode)||!Number.isInteger(step)||!Number.isInteger(maxSteps)||
   maxSteps<=0||step<0||step>maxSteps||!Number.isFinite(load)||load<0||load>1)return null;
  const amplitude=.20*step/maxSteps+.025*load;
  const eps=mode==='malleability'?-amplitude:amplitude;
  const axial=Math.exp(eps),transverse=Math.exp(-eps/2);
  return Object.freeze({scaleX:transverse,scaleY:axial,scaleOutOfPlane:transverse,
   volumeRatio:axial*transverse*transverse,assumption:'isochoric-plastic-illustration',
   measuredStrain:false,metalSpecific:false});
 }
 S.mechanicalConstitutive=Object.freeze({
  MODES,validParameters,initialState,solveUniaxial,capability,calculate,visualEnvelope
 });
})();
