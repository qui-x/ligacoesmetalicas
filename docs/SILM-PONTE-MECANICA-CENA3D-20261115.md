# SILM — ponte entre mecânica e cena 3D (estudo isolado)

## Objetivo
Adaptador somente de leitura \`SILM.mechanicsSceneBridge\` para transportar
deslocamentos **normalizados** do motor J2 presente na main e, futuramente,
resultados CPFEM do PR #172 sem misturar modelos constitutivos.

- \`create(field, { source:'j2'|'cpfem', amplification:1 })\`: exige
  \`field.converged === true\` e \`field.sample(u,v)\`.
- \`point(u,v,z)\`: coordenadas de representação (seção 2D + espessura fictícia).
- \`sampleGrid(nx,ny)\`: malha triangular para renderização, sem resolver física.
- \`appearance(u,v,{temperature,current})\`: camada qualitativa visual;
  **não** escreve temperatura, condutividade, material ou estado científico.
- \`query(u,v)\`: lê deslocamento, plasticidade e, quando disponíveis, tensões.

## Guardas de precisão
A terceira dimensão é extrusão geométrica, não predição tridimensional.
\`dz=null\` explicita deslocamento fora do plano não resolvido. 
\`calibrated=false\`, \`units=relative\`, \`validAsMaterialPrediction=false\`.
Sem estricção, dano, grandes deformações, acoplamento termomecânico constitutivo,
medidas reais por metal ou parâmetros experimentais. Amplificação de 0,25 a 5
é exclusivamente apresentação, separada da física.

## Compatibilidade e governança
O PR #172 continua em rascunho e INTACTO. Este arquivo não registra
ações nas docas Montagem, Ver e Dados, não altera \`ScientificState\`,
não cria uma investigação paralela e NÃO está autorizado para merge à main.

Teste: \`node --test tests/silm-mechanics-scene-bridge.test.cjs\`.
A integração na sala 3D deve ocorrer por contrato de leitura e será objeto
de homologação conjunta de menu, fonte e acessibilidade.
