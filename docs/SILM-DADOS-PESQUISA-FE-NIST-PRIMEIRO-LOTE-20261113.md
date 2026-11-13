# SILM — Aplicacao 01 dos resultados pesquisados: Fe / NIST TN 1879

**Data:** 13/11/2026. **Origem da matriz:** pesquisa de propriedades metalicas, etapa 57; 211 perfis documentais, dos quais zero homologados especificamente na CNTP SILM.

## Primeira entrada em uso: referencia experimental, nao simulacao

Os 12 perfis do ferro (Fe) sao as medias dos ensaios da BAM publicadas no NIST Technical Note 1879 (2015), **Tabela 6**. A Tabela 2 fornece grau de pureza; secao 1 indica ensaios em **21 ± 3 °C** com norma ASTM E8/E8M-13a. Pressao efetiva do ensaio **nao indicada**. Fonte: <https://doi.org/10.6028/NIST.TN.1879>, PDF <https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.1879.pdf>.

| Amostra | Tipo de ferro | Pureza calculada (%) | Taxas de deformacao (s^-1) |
|---|---|---:|---|
| K05 | comercialmente puro | 99,98396 | 10^-3, 10^-4, 10^-5 |
| K02 | alta pureza | 99,9916 | 10^-3, 10^-4, 10^-5 |
| S11 | alta pureza | 99,99118 | 10^-3, 10^-4, 10^-5 |
| A11 | ultralta pureza | 99,9999878 | 10^-3, 10^-4, 10^-5 |

Para cada uma das 12 linhas: tensao de escoamento (MPa), resistencia maxima a tracao (MPa), alongamento ate fratura (%) e reducao de area (%). Todos os numeros preservam as medias tabuladas, com identificadores anteriores da matriz (v17 e etapas 31/36/57). A faixa nominal **291,15–297,15 K** nao pode ser substituida por um valor exato de 294,15 K na interface.

## Integracao com a experiencia

- Os dados sao carregados por \`domain/silm/data/research-evidence-fe-nist.js\`, registro imutavel.
- O painel original \`domain/silm/property-view.js\` mostra uma tabela de tres taxas e escolha entre quatro amostras **somente quando Fe e Ductilidade estao ativos**.
- Nao foi adicionada nova pagina, aba de aplicacoes, modal ou motor separado.
- Sem alteracao em \`material-engine.js\`, \`data/bundle.js\`, equacoes de deformacao, propriedades habilitadas ou relatorios numericos.
- As amostras nao representam todos os metais, nem ferro em todas as microestruturas. Comparar significa discutir condicoes experimentais, **nao calibrar deformacao ou prever ruptura no objeto 3D**.
- As linhas sao evidencias *primarias condicionais*, nao calibracao em CNTP nem fonte de valores universais. \`CNTPVerified=false\`, \`engineRelease=false\`, \`referenceOnly=true\`.
- A fonte e aberta em link externo no proprio controle, nao gerada por IA nem inferida por analogia.
- A atualizacao offline inclui CSS e JS com a nova chave de cache.

## Testes

1. \`node --test tests/fe-nist-primary-evidence.test.mjs\`: confere todas as 12 medias, IDs, tipos, purezas, condicoes e impedimento de CNTP, alem da ligacao ao modulo.
2. \`tests/run-fe-nist-evidence.mjs\`: valida controle Ductilidade e troca de amostra em desktop/mobile em Chromium, Firefox e WebKit.
3. Os demais contratos cientificos, regressao de quatro escalas e cache nao devem sofrer alteracoes.

**Proximo lote:** identificar dados condicionais de outros metais da matriz etapa 57 por classe e tipo de ensaio, e promover gradualmente somente os valores numericos ligados a fonte primaria, amostra e condicoes suficientes. Nao promover indiscriminadamente os 211 perfis ao motor de simulacao.
