# Fontes e proveniência no SILM

> Reconstruído na 0.7.0. O arquivo original da série 0.2.x não constava do pacote 0.3.0 recebido. O conteúdo descreve o banco vigente (`domain/silm/data/sources.json`, `elements.json`, `metadata.json`) e as regras de proveniência acumuladas até a 0.7.x.

## 1. Princípio

Toda informação científica exibida pelo SILM é de um destes tipos:

| Tipo | Significado | Exemplo |
|---|---|---|
| **Dado tabelado** (`TABULATED`) | valor ou registro de uma fonte identificada, com condição | parâmetros de rede, estrutura de referência, configuração eletrônica |
| **Calculado pelo SILM** (`CALCULATED`) | derivado de dados tabelados por uma relação explícita | razão c/a (HC); σ = 1/ρ quando houver resistividade |
| **Representação qualitativa** (`QUALITATIVE`) | modelo didático; não é medida | montagem, elétrons deslocalizados, experiências de propriedades |

O validador do banco percorre todos os campos `…sourceId` e recusa fontes inexistentes. Também recusa naturezas de evidência inválidas e estruturas sem condição de temperatura, pressão e fase.

## 2. Fontes registradas

`sources.json` registra instituição, autores, título, ano, URL, DOI, data de acesso, licença e notas. Grupos principais:

- **Identidade e periodicidade:** IUPAC (Tabela Periódica, 2022).
- **Pesos atômicos:** CIAAW (Standard Atomic Weights, 2024).
- **Configurações eletrônicas:** NIST Atomic Spectra Database (estados fundamentais de átomos neutros).
- **Valência:** IUPAC Gold Book (*valence*). É convenção **qualitativa**, sem contagem universal de elétrons livres.
- **Estruturas cristalinas:** registros do Crystallography Open Database (COD) e circulares NBS, com evidência local verificada por hash.
- **Convenções do SILM:** decisões do projeto (condição ambiente adotada, políticas de elegibilidade).
- **Fronteiras pedagógicas:** Royal Society of Chemistry (classificação; não é usada para valores numéricos).

## 3. Regras por série

| Série | Regra de proveniência |
|---|---|
| 0.2.x | 118 elementos; metal investigável só com estrutura de referência experimental, sólida e com condição registrada |
| 0.5.x | sítios cristalográficos expandidos pelas operações de simetria do banco e conferidos com o modelo; divergência → `DATA_CONFLICT` |
| 0.6.x | o modelo eletrônico registra as fontes da convenção de valência e da configuração eletrônica do metal (`electrons.source`) |
| **0.7.x** | valores de propriedades só com **valor, unidade, condições e fonte**; lacunas ficam indisponíveis (`PROPERTY_DATA_MISSING`) e **nunca** são preenchidas com "valor típico". Resistividade → σ = 1/ρ classificado como calculado. Fase sem estrutura (`phaseAtReference`) só com fonte |

## 4. Situação dos dados de propriedades (0.7.0)

O banco não contém, nesta versão, valores homologados de condutividade elétrica, resistividade ou condutividade térmica. A curadoria desses valores exige uma fonte de referência consultada e registrada (com data de acesso real), condição (temperatura), pureza e eventual anisotropia, e não pôde ser feita neste ambiente de desenvolvimento. O ambiente não tinha acesso às fontes primárias, e o SILM não registra dados de memória. O contrato e o validador já estão prontos para recebê-los (ver [`CONTRATO-PROPRIEDADES.md`](CONTRATO-PROPRIEDADES.md)). O mesmo vale para o dado de fase do mercúrio na condição ambiente.

## 5. Onde a proveniência aparece

- **Tabela Periódica e Fontes dos dados:** campo a campo (identidade, peso, configuração, valência, estrutura, condições).
- **Ver → Observar:** cada dado com a sua natureza (Dado tabelado, Calculado pelo SILM, Representação qualitativa).
- **Dados → Tabela:** dados tabelados do metal e a situação dos dados de propriedades.
- **Relatório:** fonte da estrutura de referência e as ressalvas dos modelos.
