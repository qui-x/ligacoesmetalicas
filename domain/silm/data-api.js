'use strict';
window.SILM=window.SILM||{};
(()=>{
 const data=SILM.scientificData;
 const deepFreeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(deepFreeze);Object.freeze(o);}return o;};deepFreeze(data);
 const map=new Map(data.elements.map(e=>[e.atomicNumber,e])),sourceMap=new Map(data.sources.map(s=>[s.id,s]));
 const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 const reasonMessages={NOT_METALLIC:'Este elemento não está disponível para investigação no SILM, que é dedicado ao estudo de estruturas e ligações metálicas.',INSUFFICIENT_VALIDATED_DATA:'Metal indisponível: faltam dados de referência validados.',SUPERHEAVY_LIMITATION:'Elemento superpesado: indisponível para investigação estrutural nesta versão.',STRUCTURE_NOT_HOMOLOGATED:'Metal indisponível: estrutura de referência não homologada.',DATA_CONFLICT:'Metal indisponível: há dados que precisam de revisão.'};
 const categories={'alkali':'Metal alcalino','alkaline-earth':'Metal alcalinoterroso','d-metal':'Metal do bloco d','p-metal':'Metal do bloco p','lanthanide':'Lantanídeo · metal','actinide':'Actinídeo · metal','metalloid':'Metaloide · fora do escopo','nonmetal':'Não metal','halogen':'Halogênio','noble-gas':'Gás nobre'};
 const get=z=>map.get(Number(z))||null;
 const reason=e=>reasonMessages[e.silmEligibility.reasonCode]||'Disponível para investigação';
 const label=e=>`${e.name}, ${e.symbol}, número atômico ${e.atomicNumber}, ${e.silmEligibility.status==='available'?'disponível para investigação':e.classification.metallic?'metal indisponível para investigação':'fora do escopo de investigação metálica'}.`;
 const sourceIds=e=>{const ids=new Set();const scan=o=>{if(!o||typeof o!=='object')return;Object.entries(o).forEach(([k,v])=>{if(/sourceId$/i.test(k))ids.add(v);else if(typeof v==='object')scan(v);});};scan(e);return [...ids];};
 SILM.data=Object.freeze({...data,get,source:id=>sourceMap.get(id),sourceIds,reason,label,categoryLabel:e=>categories[e.classification.category],structure:e=>e.structures.find(s=>s.id===e.referenceStructure)||null,search(query){const q=normalize(query);if(!q)return data.elements;const exact=data.elements.filter(e=>normalize(e.symbol)===q||String(e.atomicNumber)===q||normalize(e.name)===q);return exact.length?exact:data.elements.filter(e=>normalize(e.name).includes(q)||normalize(e.symbol).includes(q));}});
})();
