'use strict';
window.SILM=window.SILM||{};
/**
 * Auditoria direta de 30 datasets YAML refractiveindex.info (14/11/2026).
 * Estágio de evidência: arquivo de banco conferido ≠ artigo experimental
 * conferido ≠ calibração da cena ≠ condições de CNTP comprovadas.
 *
 * Cada parte preserva blob-SHA, pontos vizinhos de lambda=0.550 um,
 * referências originais declaradas pelo YAML, tipo do dataset e proveniência.
 */
SILM.opticalSourceYAMLAudit=(()=>{
 const parts=SILM.opticalSourceAuditChunks||[];
 const research=SILM.opticalResearchCandidates;
 const all=parts.flat();
 const bySymbol=Object.freeze(Object.fromEntries(all.map(x=>[x.symbol,Object.freeze(x)])));
 const F=(n,k)=>((n-1)**2+k*k)/((n+1)**2+k*k);
 const rows=Object.freeze(all.map(row=>{
  const base=research?.bySymbol?.[row.symbol]?.find(p=>p.sourceDataset===row.dataset);
  if(!base)throw new Error('SILM audit: source record missing: '+row.symbol);
  if(row.format!=='tabulated nk')throw new Error('SILM audit: not nk: '+row.symbol);
  const a=row.bracketUm;
  if(!(a[0]<=.55&&.55<=a[1]&&a[1]>=a[0]))
   throw new Error('SILM audit: invalid optical interpolation: '+row.symbol);
  const [na,nb]=row.bracketNK;
  const t=(.55-a[0])/(a[1]-a[0]);
  const n=na[0]+(nb[0]-na[0])*t;
  const k=na[1]+(nb[1]-na[1])*t;
  const R=F(n,k);
  if(Math.abs(n-row.n550)>1e-8||Math.abs(k-row.k550)>1e-8||
   Math.abs(R-row.R550)>1e-9||Math.abs(R-base.R)>1e-9||
   Math.abs(n-base.n)>1e-8||Math.abs(k-base.k)>1e-8){
   throw new Error('SILM audit: numerical mismatch: '+row.symbol);
  }
  return Object.freeze({...row,databaseYAMLVerified:true,
   fullOriginalPaperReviewed:false,sourceExactTemperatureCNTPSupported:false,
   sourceExactPressureCNTPSupported:false,referenceOnly:true,engineRelease:false,
   sourceURL:base.sourceURL,
   wavelengthNm:550,
   conditionKind:/\b298 K\b/.test(row.comments||'')?'explicit-298K':
    /room temperature/i.test(row.comments||'')?'unquantified-room-temperature':
    'not-quantified-in-yaml'});
 }));
 const classified=Object.freeze({
  'tabulated-source-dataset':26,
  'fitted-optical-model':3,
  'electron-loss-derived':1
 });
 return Object.freeze({
  rows,bySymbol:Object.freeze(Object.fromEntries(rows.map(row=>[row.symbol,row]))),
  count:rows.length,verifiedMetals:rows.length,
  sourceGroups:parts.length,sourceDOIs:rows.filter(p=>p.doi).length,
  baselineCandidateProfiles:research?.count||59,
  notAuditedCandidateProfiles:(research?.count||59)-rows.length,
  literatureStudiesFullyChecked:0,sourceCNTPCertifications:0,
  engineEnabled:false,classificationCounts:classified,
  getForSymbol:symbol=>rows.find(p=>p.symbol===symbol)||null
 });
})();
