# SILM — Etapa 85A: grandes alongamentos axiais e início idealizado da estricção

**Estado:** motor numérico de estudo isolado (não integrado às docas).
**Dependências:** nenhuma; não modifica PR #172 CPFEM, nem \`ScientificState\`.

## Regime descrito
Lei de Swift para trecho plástico homogêneo de tração:
\`sigma_true = K (epsilon0 + epsilon_p)^n\`. Incompressibilidade plástica
na amostra homogênea: \`A/A0 = exp(-epsilon_p)\`,
\`L/L0 = exp(epsilon_p)\` e \`epsilon_eng = exp(epsilon_p)-1\`.
Critério de Considère no regime idealizado:
\`d(sigma_true)/d(epsilon_p) = sigma_true\`
-> \`epsilon_p,onset ~ n - epsilon0\`.

Esta é uma **aproximação uniaxial pré-estricção**, omitindo elasticidade
na conversão de deformações, anisotropia, dano, gradiente de deformação e
heterogeneidade de grãos. No instante em que a instabilidade é
ultrapassada, \`evaluate\` retorna \`POST_NECKING_UNRESOLVED\`
sem inventar carga, seção local ou ruptura.

## Contrato
- \`SILM.mechanicsSwiftTension.setup({K,n,epsilon0,stressUnit,conditions,provenance})\`;
- \`evaluate(epsilonPlastic)\`, \`curve(points)\` com limites físicos e diagnósticos.
- \`fit({samples,epsilon0,conditions,sourceId,origin,stressUnit})\` realiza
  ajuste log-linear **somente do trecho homogêneo selecionado pela fonte**.
- Retorna \`FIT_ONLY_UNVALIDATED\`, \`r2\` e \`logRmse\`; um ajuste algébrico
  NÃO comprova o valor de K,n de um metal nem certifica o modelo.
- As condições originais (temperatura, fase, processo, composição e ensaio
  quando presentes) são preservadas sem conversão à CNTP.

## Próximos portões
Validação com referências independentes e curvas de materiais específicos;
conexão transparente com o J2 e CPFEM **sem igualar parâmetros**;
estudo de deformação finita multiaxial e zona de estricção;
danos/ruptura só com lei e dados próprios; testes nas docas por módulo
Explorar/Medir/Calcular após definição do novo fluxo.
