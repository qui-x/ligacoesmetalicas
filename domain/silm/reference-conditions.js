'use strict';
window.SILM=window.SILM||{};
/* Referência para novos dados de propriedades metálicas.
   CNTP usada neste projeto: 273,15 K e 101325 Pa (convenção didática BR).
   Não confundir com STP IUPAC de 273,15 K e 100000 Pa.
   Validar T,P não equivale a validar fase, pureza, acabamento ou transformação
   termodinâmica; tais restrições pertencem ao perfil experimental. */
(()=>{
 const refs=Object.freeze({
  CNTP_BR_0C_1ATM:Object.freeze({id:'CNTP_BR_0C_1ATM',temperatureK:273.15,pressurePa:101325,
   label:'CNTP (Brasil) · 0 °C · 1 atm (101.325 Pa)'}),
  STP_IUPAC_0C_1BAR:Object.freeze({id:'STP_IUPAC_0C_1BAR',temperatureK:273.15,pressurePa:100000,
   label:'STP IUPAC · 0 °C · 1 bar (100.000 Pa)'})
 });
 const fail=(reasonCode,detail=null)=>Object.freeze({ok:false,reasonCode,detail});
 function validate(conditions){
  if(!conditions||typeof conditions!=='object'||Array.isArray(conditions))
   return fail('CONDITIONS_UNSTRUCTURED');
  const {basis,temperatureK,pressurePa}=conditions;
  if(!['SOURCE_REPORTED',...Object.keys(refs)].includes(basis))
   return fail('CONDITIONS_BASIS_UNKNOWN');
  for(const [key,value] of [['temperatureK',temperatureK],['pressurePa',pressurePa]]){
   if(value!==null&&(!Number.isFinite(value)||value<=0))return fail('CONDITIONS_INVALID_VALUE',key);
  }
  if(temperatureK===undefined||pressurePa===undefined)
   return fail('CONDITIONS_VALUE_MISSING');
  if(basis!=='SOURCE_REPORTED'){
   const ref=refs[basis];
   if(temperatureK!==ref.temperatureK||pressurePa!==ref.pressurePa)
    return fail('CONDITIONS_STANDARD_MISMATCH',basis);
  }
  if(basis==='SOURCE_REPORTED'&&typeof conditions.description!=='string')
   return fail('CONDITIONS_SOURCE_DESCRIPTION_MISSING');
  return Object.freeze({ok:true,basis});
 }
 function compare(conditions,targetId='CNTP_BR_0C_1ATM'){
  const target=refs[targetId];
  if(!target)return fail('CONDITIONS_TARGET_UNKNOWN',targetId);
  const check=validate(conditions);
  if(!check.ok)return fail(check.reasonCode,check.detail);
  if(conditions.temperatureK===null||conditions.pressurePa===null)
   return fail('CONDITIONS_UNVERIFIED','Temperatura e/ou pressão não informadas numericamente pela fonte');
  if(conditions.temperatureK!==target.temperatureK||conditions.pressurePa!==target.pressurePa)
   return fail('CONDITIONS_MISMATCH','T e/ou P diferem da condição de referência');
  return Object.freeze({ok:true,targetId,
   note:'Compatibilidade apenas de T e P: fase, superfície e pureza exigem avaliação separada'});
 }
 SILM.referenceConditions=Object.freeze({defaultId:'CNTP_BR_0C_1ATM',standards:refs,validate,compare});
})();
