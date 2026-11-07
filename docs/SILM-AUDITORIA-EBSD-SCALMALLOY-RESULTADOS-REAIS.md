# SILM — Dados experimentais preliminares: Scalmalloy (fase Aluminium)

**Data:** 07/11/2026. **Status:** arquivos originais com MD5 verificado, estatísticas calculadas por fase, mas **sem homologação científica final e sem integração ao motor do SILM**.

## Fonte

Niall Hughes e colaboradores, conjunto publicado pela Universidade de Manchester para *Effects of Volumetric Energy Density on the Microstructure of Additively Manufactured Scalmalloy*. Registro original: https://doi.org/10.5281/zenodo.17085695 .

O arquivo experimental contém dados EBSD de grãos para três condições de energia volumétrica de fabricação aditiva, além de dados de EDS, dureza e porosidade. **Scalmalloy é uma liga à base de Al e não uma amostra de alumínio puro.** Os resultados não descrevem latas, ligas de cabos ou estruturas metálicas de aplicações com composição/processo diferente.

## Verificações executadas

Workflow: https://github.com/qui-x/ligacoesmetalicas/actions/runs/42339535737 ; script reexecutável `research/microstructure/audit_scalmalloy_csv.py`.

O GitHub Actions baixou os **três arquivos CSV originais**, conferiu seus MD5 publicados, validou o cabeçalho e as unidades:

- `Equivalent Circle Diameter`: **µm**.
- `Area`: **µm²**.
- `Phase`: fase identificada na exportação, tratada como categoria distinta.
- `Pixel Count`, `Perimeter`, Feret e orientação constam no arquivo, mas não foram convertidos em concentração de elementos ou propriedades do material.

**Nenhum arquivo original de terceiros foi publicado no repositório do SILM.** Os resultados resumidos e a trilha de auditoria são os únicos itens versionados.

## Resultados da fase identificada como Aluminium

| Energia volumétrica | Registros da fase Aluminium | ECD mediana (µm) | ECD média (µm) | ECD P25–P75 (µm) |
|---|---:|---:|---:|---:|
| 57,1 J/mm³ | **44.512** | **0,900** | 1,232 | 0,73–1,28 |
| 116,7 J/mm³ | **46.998** | **0,940** | 1,133 | 0,77–1,21 |
| 160 J/mm³ | **66.106** | **0,960** | 1,128 | 0,78–1,23 |
| Total de registros dessa fase | **157.616** | — | — | — |

O arquivo de 160 J/mm³ apresenta ainda **10 registros da categoria `Zero Solution`**, deliberadamente separados e **não somados à fase Aluminium**. As três exportações têm, no total, 157.626 registros de grãos/regiões, considerando ambas as categorias.

| Arquivo original | Bytes verificados | MD5 obtido (igual ao publicado) |
|---|---:|---|
| `EBSD - 57.1Jmm-3 Grain Sizes.csv` | 5.001.800 | `64a02187e39d8ed1b765a3d599a7c5b9` |
| `EBSD - 116.7Jmm-3 Grain Sizes.csv` | 5.223.128 | `108dd6cb7d4089d6500e86e76a0d7089` |
| `EBSD - 160Jmm-3 Grain Sizes.csv` | 7.428.018 | `2f15e952a6efc71e450cff3c36fed185` |

## Restrições e decisão científica

1. **Não há coluna `Near_edge`**, logo não foi possível aplicar o filtro de borda equivalente ao das planilhas de Mg. Os valores podem sofrer influência de regiões de borda e do limiar de segmentação.
2. Os valores acima são distribuições ECD de **regiões identificadas na fase Aluminium da liga Scalmalloy**, não do elemento isolado Al. A exportação possui medição e unidades explícitas; **não é tamanho médio ASTM E112 automaticamente**, e tampouco uma distribuição espacial de contornos vetoriais reais.
3. A diferença entre as medianas das três condições não comprova, isoladamente, causalidade entre energia volumétrica e tamanho final do grão. Para interpretação causal, revisar planejamento experimental, processamento, amostragem e qualidade da segmentação.
4. **Licença de redistribuição do registro/arquivos ainda não auditada.** Não incorporar imagens, contornos, arquivo bruto ou derivados que reconstituam a planilha na PWA sem verificação apropriada.
5. A porcentagem que aparece como campo `Total Percentage of Area` do software EBSD **não é teor químico nem fração volumétrica de uma fase**. Não exibir como porcentagem de Al no SILM.

## Próxima decisão de implementação

Depois de revisar a metodologia e a representatividade, o SILM poderá oferecer perfis estatísticos **condicionados à liga Scalmalloy e à energia da fabricação**, sempre rotulados como *formações geométricas ajustadas a estatísticas EBSD*, jamais como micrografias reais.

A segunda etapa deve avançar também no mapa [Cu TrueEBSD](https://zenodo.org/records/16902083) para obter contornos espaciais reais, algo que as estatísticas 1D de ECD sozinhas não fornecem.

Dados estruturados da auditoria: `research/microstructure/scalmalloy-ebsd-preliminary-stats.json`.
