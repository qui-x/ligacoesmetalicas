'use strict';
window.SILM=window.SILM||{};
/*
 * Portão DOCUMENTAL para calibração mecânica do SILM (Etapa 81).
 * O índice da Etapa 80 contém observações sob diferentes condições.
 * Uma tensão de escoamento, por si só, NÃO determina E, nu ou o módulo
 * de encruamento; UTS e alongamento à ruptura também não determinam H.
 *
 * Esta auditoria é somente leitura: nenhum registro documental,
 * e nem campos de "aprovação" fornecidos externamente, libera
 * parâmetros para o motor J2. Sem um conjunto homologado da MESMA
 * amostra, temperatura, fase e protocolo, o J2 permanece normalizado.
 */
SILM.mechanicalQualification=(()=>{
 const STRESS_CODES=new Set(['yield_MPa','compression_yield_strength_MPa','yield']);
 const required=Object.freeze([
  Object.freeze({id:'E',label:'módulo de Young (E)'}),
  Object.freeze({id:'nu',label:'coeficiente de Poisson (ν)'}),
  Object.freeze({id:'yieldStress',label:'tensão de escoamento (σe)'}),
  Object.freeze({id:'hardening',label:'encruamento (H)'})
 ]);
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 function candidates(atomicNumber){
  const z=Number(atomicNumber),index=SILM.scienceEvidenceIndex;
  if(!Number.isInteger(z)||z<1||z>118||!index?.getFor)return [];
  const seen=new Set(),results=[];
  for(const property of ['ductility','malleability']){
   for(const row of index.getFor(z,property)||[]){
    if(row.engineRelease!==false||row.calibrationApproved!==false)continue;
    if(!['experimental-conditional','evaluated','compiled'].includes(row.status))continue;
    for(const measurement of row.values||[]){
     if(!STRESS_CODES.has(measurement.code)||measurement.unit!=='MPa'||
        !finite(measurement.value)||measurement.value<=0)continue;
     if(!row.sourceURL?.startsWith('https://'))continue;
     const key=row.id+'|'+measurement.code;
     if(seen.has(key))continue;
     seen.add(key);
     results.push(Object.freeze({
      id:key,property,code:measurement.code,value:measurement.value,unit:'MPa',
      sample:row.sample,temperatureK:finite(row.temperatureK)?row.temperatureK:null,
      temperatureText:row.temperatureText||null,
      sourceURL:row.sourceURL,sourceName:row.sourceName,
      status:row.status,origin:row.origin,
      calibratesEngine:false
     }));
    }
   }
  }
  return results;
 }
 function inspect(atomicNumber){
  const z=Number(atomicNumber),valid=Number.isInteger(z)&&z>=1&&z<=118;
  const known=valid?candidates(z):[];
  const available=known.length?['yieldStress']:[];
  const missing=required.filter(k=>!available.includes(k.id)).map(k=>k.label);
  return Object.freeze({
   atomicNumber:valid?z:null,status:'NOT_CALIBRATED',
   engineMode:'normalized-j2',sourceKind:'conditional-documents',
   yieldedSourceCount:known.length,hasConditionalYield:known.length>0,
   missing:Object.freeze(missing),candidates:Object.freeze(known),
   sameSpecimenBundle:false,validatedCalibration:false,canFeedEngine:false,
   grainOrientation:'NOT_MEASURED',
   message:known.length?
    'Há observações de escoamento de amostras específicas, mas nenhum conjunto E–ν–σe–H homologado para uma mesma condição.':
    'Não há observação de escoamento rastreável no índice para esta seleção; faltam também E, ν e H.'
  });
 }
 // Preparação NÃO é autorização para uma calibração. Rejeita materiais
 // importados ou documentos com aprovação autodeclarada.
 function assessBundle(record){
  if(!record||typeof record!=='object'||Array.isArray(record))
   return Object.freeze({ready:false,reason:'BUNDLE_ABSENT'});
  const keys=['E','nu','yieldStress','hardening'];
  const unit=['MPa','ratio','MPa','MPa'];
  for(let i=0;i<keys.length;i++){
   const part=record[keys[i]];
   if(!part||!finite(part.value)||part.unit!==unit[i]||
      !part.sampleId||!part.sourceURL?.startsWith('https://'))
    return Object.freeze({ready:false,reason:'BUNDLE_PARAMETER_MISSING',parameter:keys[i]});
  }
  const samples=keys.map(k=>record[k].sampleId);
  if(samples.some(id=>id!==samples[0]))
   return Object.freeze({ready:false,reason:'BUNDLE_SAMPLE_MISMATCH'});
  const temps=keys.map(k=>record[k].temperatureK);
  if(temps.some(t=>!finite(t)||t<=0||t!==temps[0]))
   return Object.freeze({ready:false,reason:'BUNDLE_TEMPERATURE_MISMATCH'});
  const p={E:record.E.value,nu:record.nu.value,
   yieldStress:record.yieldStress.value,hardening:record.hardening.value};
  if(p.E<=0||p.nu<0||p.nu>=.49||p.yieldStress<=0||p.hardening<0)
   return Object.freeze({ready:false,reason:'BUNDLE_VALUES_INVALID'});
  // Independente de flags autodeclaradas: falta ainda análise metodológica
  // externa, geometria experimental e registro de homologação no repositório.
  return Object.freeze({ready:false,reason:'BUNDLE_REQUIRES_INDEPENDENT_REVIEW',
   sampleId:samples[0],temperatureK:temps[0]});
 }
 return Object.freeze({schema:'silm.mechanics.calibration-readiness.v1',
  required,candidates,inspect,assessBundle,engineRelease:false});
})();
