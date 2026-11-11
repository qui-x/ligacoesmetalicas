'use strict';
window.SILM=window.SILM||{};
/* Registro extensível de perfis materiais: os dados ficam fora do motor.
   O registro pertence à configuração científica carregada, não ao estado
   mutável da investigação. Cada arquivo futuro registra seu próprio metal.
   Nem lacunas nem duplicatas podem herdar o exemplo de Cu. */
(()=>{
 const profiles=new Map();
 const freeze=value=>{
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
   for(const child of Object.values(value))freeze(child);
   Object.freeze(value);
  }
  return value;
 };
 function register(record){
  if(!record||!Number.isInteger(record.atomicNumber)||record.atomicNumber<1||record.atomicNumber>118)
   throw new TypeError('Perfil sem número atômico válido');
  if(profiles.has(record.atomicNumber))
   throw new TypeError('Perfil duplicado para Z='+record.atomicNumber);
  if(!record.optical&&typeof record!=='object')
   throw new TypeError('Perfil científico inválido');
  if(record.optical){
   const p=record.optical;
   if(p.evidence!=='TABULATED_NK'||!Array.isArray(p.points)||p.points.length<2||
      !p.source?.doi||!p.conditions)
    throw new TypeError('Perfil óptico sem evidência, série ou fonte');
  }
  const saved=freeze(structuredClone(record));
  profiles.set(record.atomicNumber,saved);
  return saved;
 }
 const get=atomicNumber=>profiles.get(Number(atomicNumber))||null;
 const list=()=>Object.freeze([...profiles.keys()].sort((a,b)=>a-b));
 SILM.materialProfiles=Object.freeze({schemaVersion:1,register,get,list});
})();
