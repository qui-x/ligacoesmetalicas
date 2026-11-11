'use strict';
window.SILM=window.SILM||{};
/* Motor geral de aplicabilidade e resposta material, sem segundo estado científico.
   Os serviços existentes continuam calculando calor, eletricidade, deformação etc.
   Perfis opcionais acrescentam evidência metal-específica; ausência de perfil
   NUNCA autoriza usar os coeficientes do metal demonstrativo em outro metal.
   API: capability(atomicNumber,propertyId), optical(atomicNumber,lambdaNm,thetaDeg).
   Incidência sobre interface plana ar–metal com N=n+ik, sem película ou rugosidade.
*/
(()=>{
 const S=SILM;
 const PROPERTY_IDS=Object.freeze(['electrical','thermal','malleability','ductility','luster']);
 const missing=(reasonCode,extra={})=>Object.freeze({ok:false,reasonCode,...extra});
 const profile=atomicNumber=>S.materialProfiles?.get?.(atomicNumber)||null;
 const element=atomicNumber=>S.data?.get?.(atomicNumber)||null;
 const referenceId=()=>S.referenceConditions?.defaultId||null;
 const matchConditions=conditions=>S.referenceConditions?.compare(conditions)||missing('CONDITIONS_VALIDATOR_UNAVAILABLE');
 function capability(atomicNumber,propertyId){
  const el=element(atomicNumber);
  if(!PROPERTY_IDS.includes(propertyId))return missing('PROPERTY_UNKNOWN',{atomicNumber:Number(atomicNumber),property:propertyId});
  if(!el||el.silmEligibility?.status!=='available')return missing('METAL_UNAVAILABLE',{atomicNumber:Number(atomicNumber),property:propertyId});
  const available=S.properties?.eligibility?.(el)?.[propertyId];
  if(!available||available.status==='unavailable')
   return missing(available?.reasonCode||'PROPERTY_UNAVAILABLE',{atomicNumber:el.atomicNumber,property:propertyId});
  const spec=propertyId==='luster'?profile(el.atomicNumber)?.optical||null:null;
  const material=propertyId==='luster'&&spec?'TABULATED_NK':
   (available.data?.kind||null);
  return Object.freeze({ok:true,atomicNumber:el.atomicNumber,symbol:el.symbol,
   property:propertyId,mode:material?'reference-data':'qualitative',
   dataKind:material,source:spec?.source|| (available.data?{sourceId:available.data.sourceId}:null),
   conditions:spec?.conditions||available.data?.conditions||null,
   conditionMatch:spec?matchConditions(spec.conditions):null,
   requestedReference:referenceId(),
   reasonCode:material?null:'PROPERTY_DATA_MISSING'});
 }
 function spectralProfile(atomicNumber){
  const spec=profile(atomicNumber)?.optical;
  if(!spec||spec.evidence!=='TABULATED_NK'||!spec.source?.doi||!spec.conditions||
   !Array.isArray(spec.points)||spec.points.length<2)return null;
  const rows=spec.points;
  for(let i=0;i<rows.length;i++){
   const p=rows[i];if(!Array.isArray(p)||p.length!==3||p.some(v=>!Number.isFinite(v))||
    p[0]<=0||p[1]<0||p[2]<0||(p[1]===0&&p[2]===0)||
    (i&&p[0]<=rows[i-1][0]))return null;
  }
  return spec;
 }
 function interpolate(rows,lambdaNm){
  if(lambdaNm<rows[0][0]||lambdaNm>rows.at(-1)[0])return null;
  for(let i=1;i<rows.length;i++){
   if(lambdaNm>rows[i][0])continue;
   const a=rows[i-1],b=rows[i],weight=(lambdaNm-a[0])/(b[0]-a[0]);
   return {n:a[1]+weight*(b[1]-a[1]),k:a[2]+weight*(b[2]-a[2])};
  }
  return null;
 }
 const square=([x,y])=>x*x+y*y;
 const ratio=(a,b)=>square(a)/square(b);
 /* Fresnel não polarizado, n1=1, n2=n+i k.
    q=sqrt(N²-sin²(theta)); Rs=|(cos(theta)-q)/(cos(theta)+q)|²;
    Rp=|(N²cos(theta)-q)/(N²cos(theta)+q)|². */
 function fresnel(n,k,thetaDeg=0){
  if(![n,k,thetaDeg].every(Number.isFinite)||n<0||k<0||(n===0&&k===0)||
   thetaDeg<0||thetaDeg>85)return null;
  const t=thetaDeg*Math.PI/180,s=Math.sin(t),c=Math.cos(t);
  const ar=n*n-k*k-s*s,ai=2*n*k,m=Math.hypot(ar,ai);
  const qr=Math.sqrt(Math.max(0,(m+ar)/2));
  const qi=(ai<0?-1:1)*Math.sqrt(Math.max(0,(m-ar)/2));
  const rS=ratio([c-qr,-qi],[c+qr,qi]);
  const pR=(n*n-k*k)*c,pI=2*n*k*c;
  const rP=ratio([pR-qr,pI-qi],[pR+qr,pI+qi]);
  const result=(rS+rP)/2;
  return Number.isFinite(result)&&result>=0&&result<=1+1e-11?
   Math.max(0,Math.min(1,result)):null;
 }
 function optical(atomicNumber,lambdaNm,thetaDeg=0){
  const can=capability(atomicNumber,'luster');
  if(!can.ok)return can;
  const spec=spectralProfile(atomicNumber);
  if(!spec)return missing('OPTICAL_DATA_NOT_HOMOLOGATED',{
   atomicNumber:can.atomicNumber,symbol:can.symbol,property:'luster',mode:'qualitative'});
  if(!Number.isFinite(lambdaNm)||!Number.isFinite(thetaDeg)||thetaDeg<0||thetaDeg>85)
   return missing('INVALID_OPTICAL_INPUT',{atomicNumber:can.atomicNumber,property:'luster'});
  const sample=interpolate(spec.points,lambdaNm);
  if(!sample)return missing('SPECTRAL_OUT_OF_RANGE',{
   atomicNumber:can.atomicNumber,property:'luster',
   rangeNm:[spec.points[0][0],spec.points.at(-1)[0]]});
  const reflectance=fresnel(sample.n,sample.k,thetaDeg);
  if(reflectance===null)return missing('INVALID_OPTICAL_INPUT',{atomicNumber:can.atomicNumber,property:'luster'});
  return Object.freeze({ok:true,atomicNumber:can.atomicNumber,symbol:can.symbol,
   property:'luster',mode:'reference-data',evidence:'TABULATED_NK',
   wavelengthNm:lambdaNm,incidenceDeg:thetaDeg,n:sample.n,k:sample.k,
   reflectance,source:spec.source,conditions:spec.conditions,
   requestedReference:referenceId(),conditionMatch:matchConditions(spec.conditions),
   assumptions:Object.freeze(['interface ar–metal plana','superfície ideal lisa','sem filme de óxido',
    'luz não polarizada','Fresnel; interpolação linear de n,k']),
   limitation:'Não representa a aparência de uma peça real; superfície, filme, ângulo do observador e iluminante dependem de modelo adicional.'});
 }
 // Consulta estrita para os dados que o usuário pesquisa em CNTP.
 // Ela não corrige n,k por temperatura/pressão e não confunde Cu ambiente
 // com Cu a 273,15 K / 101325 Pa.
 function opticalForReference(atomicNumber,lambdaNm,thetaDeg=0,reference=referenceId()){
  const result=optical(atomicNumber,lambdaNm,thetaDeg);
  if(!result.ok)return result;
  const condition=S.referenceConditions?.compare(result.conditions,reference);
  if(!condition?.ok)return missing(condition?.reasonCode||'CONDITIONS_UNVERIFIED',{
   atomicNumber:result.atomicNumber,property:'luster',
   requestedReference:reference,sourceConditions:result.conditions,
   note:'É necessário dado medido na condição de referência ou transformação física validada'});
  return Object.freeze({...result,conditionMatch:condition,requestedReference:reference});
 }
 S.materialEngine=Object.freeze({propertyIds:PROPERTY_IDS,capability,optical,opticalForReference,
  opticalModel:Object.freeze({fresnel,interpolate})});
})();
