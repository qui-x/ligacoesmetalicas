'use strict';
/* Gera docs/COBERTURA-METAIS.md a partir do banco científico e do modelo cristalográfico (sem edição manual). */
const fs=require('node:fs'),path=require('node:path');const {load}=require('./validate-scientific-state.cjs');
const S=load(),D=S.data,X=S.crystal,P=S.properties,root=path.resolve(__dirname,'..');
const reasons={NOT_METALLIC:'não metálico',INSUFFICIENT_VALIDATED_DATA:'dados insuficientes',SUPERHEAVY_LIMITATION:'superpesado',STRUCTURE_NOT_HOMOLOGATED:'estrutura não homologada',DATA_CONFLICT:'conflito de dados'};
const rows=[],count={investigation:0,crystal:{BCC:0,FCC:0,HCP:0},unsupported:0},byProperty=Object.fromEntries(P.ids.map(id=>[id,{available:0,qualitative:0,unavailable:0}]));
const short={available:'dado + experiência',qualitative:'qualitativa'},code={MODEL_NOT_APPLICABLE:'sem visualização cristalina',REFERENCE_PHASE_UNSUPPORTED:'sem fase sólida de referência',LIQUID_AT_REFERENCE_CONDITION:'líquido na condição',METAL_NOT_INVESTIGABLE:'não investigável'};
for(const e of D.elements.filter(x=>x.classification.metallic)){
 const available=e.silmEligibility.status==='available',ref=D.structure(e);
 let crystal='—',type='—';
 if(available){const el=X.eligibility(e);if(el.status==='available'){crystal='disponível';type=X.models[el.structureType].code+' ('+el.structureType+')';count.crystal[el.structureType]++;}else{crystal='indisponível · '+el.reasonCode;count.unsupported++;}count.investigation++;}
 const pe=P.eligibility(e),cells=P.ids.map(id=>{const x=pe[id];byProperty[id][x.status]++;return x.status==='unavailable'?'— '+code[x.reasonCode]:short[x.status];});
 const condition=ref?ref.conditions.temperature.display+' · '+ref.conditions.phase.display.toLowerCase():'—';
 rows.push(`| ${e.atomicNumber} | ${e.symbol} | ${e.name} | ${available?'disponível':'indisponível · '+(reasons[e.silmEligibility.reasonCode]||e.silmEligibility.reasonCode)} | ${crystal} | ${type} | ${ref?ref.label:'—'} | ${available?condition:'—'} | ${cells.join(' | ')} |`);
}
const doc=`# Cobertura dos metais

> Gerado automaticamente por \`scripts/build-coverage.cjs\` a partir de \`domain/silm/data/\` e \`domain/silm/crystal.js\`. Não editar à mão.

**Investigação disponível:** ${count.investigation} metais. **Cristalografia disponível:** ${count.crystal.BCC+count.crystal.FCC+count.crystal.HCP} (CCC ${count.crystal.BCC}, CFC ${count.crystal.FCC}, HC ${count.crystal.HCP}). **Investigáveis sem visualização cristalográfica:** ${count.unsupported}.

A elegibilidade de investigação (\`silmEligibility\`) e a elegibilidade cristalográfica (\`SILM.crystal.eligibility\`) são distintas: um metal pode ser investigado e montado livremente sem ter visualização cristalográfica. Estruturas fora de CCC, CFC e HC nunca são substituídas por uma das três.

| Z | Símbolo | Nome | Investigação | Cristalografia | Estrutura suportada | Estrutura de referência (banco) | Condição de referência | Cond. elétrica | Cond. térmica | Maleabilidade | Ductilidade | Brilho |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}

## Propriedades (0.7.x)

Elegibilidade por propriedade (\`SILM.properties.eligibility\`), calculada do banco: **qualitativa** = experiência qualitativa disponível, sem valor tabelado homologado; **dado + experiência** = valor tabelado com valor, unidade, condição e fonte; **—** = indisponível, com motivo. As experiências de rede (térmica, maleabilidade, ductilidade e brilho) exigem a estrutura cristalina organizada; a condutividade elétrica também funciona na montagem livre. Nenhum valor típico preenche lacunas.

| Propriedade | Dado + experiência | Qualitativa | Indisponível |
|---|---|---|---|
${P.ids.map(id=>`| ${P.catalog[id].title} | ${byProperty[id].available} | ${byProperty[id].qualitative} | ${byProperty[id].unavailable} |`).join('\n')}

Nesta versão o banco não traz valores homologados de condutividade elétrica, resistividade ou condutividade térmica (\`PROPERTY_DATA_MISSING\`). Para o mercúrio, sem fase sólida de referência registrada, deformação de sólido, condução pela rede e superfície sólida ficam indisponíveis (\`REFERENCE_PHASE_UNSUPPORTED\`); o metal continua classificado como metal.
`;
fs.writeFileSync(path.join(root,'docs/COBERTURA-METAIS.md'),doc);
console.log('Cobertura gerada: '+rows.length+' metais; '+count.investigation+' investigáveis; cristalografia '+JSON.stringify(count.crystal)+'; sem visualização '+count.unsupported+'; propriedades '+JSON.stringify(Object.fromEntries(P.ids.map(id=>[id,byProperty[id].qualitative+byProperty[id].available])))+'.');
