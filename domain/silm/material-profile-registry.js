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
  if(typeof record.element!=='string'||!record.element.trim())
   throw new TypeError('Perfil sem símbolo do metal');
  if(record.optical){
   const p=record.optical;
   if(p.evidence!=='TABULATED_NK'||!Array.isArray(p.points)||p.points.length<2||
      !p.source||!(p.source.doi||
       (typeof p.source.url==='string'&&p.source.url.startsWith('https://')&&p.source.table&&
        p.source.title&&p.source.authors&&Number.isInteger(p.source.year)))||!p.conditions)
    throw new TypeError('Perfil óptico sem evidência, série ou fonte');
   const valid=SILM.referenceConditions?.validate(p.conditions);
   if(!valid?.ok)throw new TypeError('Condições ópticas inválidas: '+(valid?.reasonCode||'VALIDATOR_UNAVAILABLE'));
  }
  // Perfis futuros de elétrica, térmica e mecânica também exigirão
  // condição de referência por grandeza. Não aceitar valores avulsos.
  if(record.properties!==undefined){
   if(!record.properties||typeof record.properties!=='object'||Array.isArray(record.properties))
    throw new TypeError('Mapa de propriedades inválido');
   const ids=new Set(['electrical','thermal','malleability','ductility','luster']);
   for(const [id,entry] of Object.entries(record.properties)){
    if(!ids.has(id)||!entry||typeof entry!=='object'||Array.isArray(entry))
     throw new TypeError('Propriedade desconhecida ou registro inválido: '+id);
    const valid=SILM.referenceConditions?.validate(entry.conditions);
    if(!valid?.ok)throw new TypeError('Condição da propriedade '+id+': '+(valid?.reasonCode||'VALIDATOR_UNAVAILABLE'));
    if(!entry.source||!entry.source.title||!['TABULATED','QUALITATIVE'].includes(entry.evidence))
     throw new TypeError('Falta fonte ou classe de evidência para '+id);
    if(entry.evidence==='TABULATED'&&(!Number.isFinite(entry.value)||typeof entry.unit!=='string'||!entry.unit.trim()))
     throw new TypeError('Valor ou unidade inválidos para '+id);
    if(entry.evidence==='QUALITATIVE'&&(!entry.description||typeof entry.description!=='string'))
     throw new TypeError('Descrição qualitativa ausente para '+id);
   }
  }
  const saved=freeze(structuredClone(record));
  profiles.set(record.atomicNumber,saved);
  return saved;
 }
 const get=atomicNumber=>profiles.get(Number(atomicNumber))||null;
 const list=()=>Object.freeze([...profiles.keys()].sort((a,b)=>a-b));
 SILM.materialProfiles=Object.freeze({schemaVersion:1,register,get,list});
})();
