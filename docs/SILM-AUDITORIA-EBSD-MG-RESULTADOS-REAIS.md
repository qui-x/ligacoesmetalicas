# SILM — Primeira extração efetiva de microestrutura experimental: Mg–1Al e AZ31

**Data:** 07/11/2026. **Estado:** estatísticas preliminares calculadas de **planilhas experimentais originais**, com integridade verificada; **ainda não homologadas para aplicação automática no simulador**.

## O que foi realmente executado

O GitHub Actions [run 42339051465](https://github.com/qui-x/ligacoesmetalicas/actions/runs/42339051465) executou `research/microstructure/audit_magnesium.py` em Python 3.12, sem dependências externas. O fluxo baixou do [Zenodo 10225600](https://zenodo.org/records/10225600) as planilhas `AZ31_ML.xlsx` e `Mg1Al_ML.xlsx`, validou os checksums MD5 publicados pelos autores e percorreu os registros EBSD. **Ambos os MD5 e as contagens originais coincidiram**.

As duas tabelas fornecem a variável `Grain_size`, definida na publicação como **diâmetro de círculo equivalente (ECD) do grão antes da deformação**, em micrômetros. Foram excluídas entradas com `Near_edge=1`, conforme procedimento indicado pelos autores. Não foram encontrados valores inválidos adicionais na coluna de tamanho após a aplicação desse filtro.

## Resultado calculado

| Liga estudada | Grãos no arquivo | Excluídos por borda | Retidos | ECD mediana (µm) | ECD média (µm) | ECD P25–P75 (µm) |
|---|---:|---:|---:|---:|---:|---:|
| AZ31 | 2.640 | 339 | **2.301** | **6,269** | 7,967 | 4,105–9,648 |
| Mg–1Al | 1.496 | 221 | **1.275** | **17,321** | 18,431 | 10,452–23,737 |
| Total (não combinar distribuições das ligas) | **4.136** | **560** | **3.576** | — | — | — |

**Por condição identificada no arquivo:** AZ31, orientações de carregamento 0°/45°/90°, todas com `Strain_level=0.06`, contém respectivamente 290/593/1418 grãos após filtragem, com medianas ECD de **8,261/7,196/5,784 µm**. Mg–1Al, orientação 90°, níveis `Strain_level=0.06` e `0.10`, contém respectivamente 811/464 grãos retidos, medianas **18,209/16,034 µm**.

**Cuidado causal:** como a variável `Grain_size` é medida **antes** da deformação, comparar grupos de deformação final não demonstra que a diferença entre medianas tenha sido *causada* pelo valor `Strain_level`. O conjunto pode ter diferenças amostrais e de preparação; são distribuições empíricas condicionadas pelas amostras da publicação, não leis físicas universais.

## Integridade e proveniência

| Arquivo | Bytes obtidos | MD5 confirmado |
|---|---:|---|
| `AZ31_ML.xlsx` | 933.575 | `1e67111dc62f6ff47a8d8e535a70e5cd` |
| `Mg1Al_ML.xlsx` | 527.526 | `8e4bb43f636939ef4f39a74fb163bb51` |

**Fonte primária:** B. Yang, V. Vassilev-Galindo e J. Llorca, *Application of machine learning to assess the influence of microstructure on twin nucleation in Mg alloys*, **npj Computational Materials** 10, 26 (2024), https://doi.org/10.1038/s41524-024-01212-x . Dados: https://doi.org/10.5281/zenodo.10225600 .

**Licença:** o [índice institucional da Universidad Pública de Navarra](https://observatorio-investigacion.unavarra.es/documentos/697a4694ca008a305298631c) classifica o depósito como CC BY 4.0. Entretanto, o campo de direitos não foi retornado explicitamente na consulta automática de metadados do registro original; **a situação jurídica de redistribuição dos arquivos/figuras ainda exige conferência direta**. O GitHub guarda somente as *estatísticas derivadas e o relatório*, sem publicar as planilhas de terceiros.

**Reprodutibilidade:** script `research/microstructure/audit_magnesium.py`; resultado estruturado `research/microstructure/magnesium-ebsd-preliminary-stats.json`; [artefato integral de auditoria do GitHub Actions](https://github.com/qui-x/ligacoesmetalicas/actions/runs/42339051465/artifacts/13560741541), contendo o JSON bruto da execução, distribuição por grupo e relatório.

## O que os dados permitem e o que não permitem

**Podem fundamentar, após revisão:** um perfil de distribuição de ECD e vizinhança dos grãos, específico às amostras **AZ31** e **Mg–1Al**, segundo suas condições reportadas; controles de comparação de medianas/quantis e um ajuste estatístico que conserve esses parâmetros.

**Não permitem:** criar contornos espaciais reais, inferir textura/orientação cristalográfica de cada célula do gerador, quantificar teores químicos por grão, calcular frações volumétricas de fases ou afirmar microestrutura equivalente da carcaça de notebook do atlas. O ECD de uma seção EBSD 2D não é automaticamente tamanho médio de grão segundo ASTM E112.

**Próxima ação:** verificar licença diretamente no registro e no arquivo, comparar estatísticas por grupo com dados/metodologia do artigo, registrar processo/condições e testar o ajuste do gerador reprodutível a distribuições empíricas. Somente então propor um modo `Estatisticamente fundamentado: liga e condição`, mantendo separado o modo `Esquemático`. Para geometria experimental real, prosseguir com a fonte [Cu TrueEBSD](https://zenodo.org/records/16902083) e não inventar os contornos faltantes nas planilhas de Mg.
