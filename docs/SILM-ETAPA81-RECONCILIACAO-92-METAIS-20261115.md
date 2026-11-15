# SILM — Etapa 81 · Reconciliação dos 92 metais da pesquisa

**Data:** 15/11/2026 · **Matriz de origem:** `SILM_matriz_cientifica_92_metais_etapa72_reconciliada.json` (14/11/2026) · **SHA-256 da matriz consultada:** `50d30a0e42639809bb06661594ca3c4d90eb8ec52afe82fd042625322de35fcf`.

## Objetivo e princípio de governança

Comparar os **92 metais** do inventário da Etapa 72 ao índice **Etapa 80**, já publicado e composto por 315 fichas documentais de **62 elementos**, sem importar triagens V08/V30 nem inventar valores científicos para motores. A regra deixa de exigir CNTP como única condição: cada fonte mantém sua temperatura, pressão quando conhecida, composição, preparo, direção cristalográfica e nível de evidência.

A matriz original tem 79 metais estruturalmente disponíveis e 13 indisponíveis. O índice resultante disponibiliza ao menos uma **referência documental (incluindo estimativas claramente marcadas)** para cada um dos 79; isto **NÃO** significa 79 metais com propriedades experimentais homologadas ou cinco motores físicos calibrados.

## Resultado da integração

| Indicador | Etapa 80 | Etapa 81 |
|---|---:|---:|
| Metais com ao menos uma ficha | 62 | 79 |
| Registros por elemento e propriedade | 315 | 338 |
| Catálogos normalizados | 9 | 10 |
| Universo científico auditado | — | 92 |
| Estruturalmente disponíveis | — | 79 |
| Bloqueados (sem habilitação nova) | — | 13 |
| Fichas novas da Etapa 81 | — | 23 |
| Novos metais com fontes condicionais | — | 2 (Ga e Pm) |
| Metais cobertos somente por novas estimativas/provisórios | — | 15 |

**A estrutura dos motores do SILM, Medir, Calcular, deformação, calor, elétrons e brilho não foi alterada.** `calibrationApproved=false` e `engineRelease=false` para todos os registros novos.

## Fontes e valores individuais acrescentados

### Resultados condicionais para Ga, Pm, In, U (8 fichas)

| Metal | Propriedade | Valor e condição | Evidência / ressalva |
|---|---|---|---|
| Ga | térmica | 41 W/(m·K), 273,2 K | Ga-α, **apenas eixo cristalográfico a**; não isotrópico; compilação NBS Ho/Powell/Liley 1974, tabela 59 |
| Ga | elétrica | 17,4 µΩ·cm, 293,15 K | ficha de fornecedor; orientação de amostra, pureza e ensaio não individualizados; σ derivada de ρ não é segundo experimento |
| Pm | térmica | 18 ± 2 W/(m·K), 300,15 K | transcrição de 0,18 ± 0,02 W/(cm·°C) do relatório **BNWL-1309**, p. 22, item i; condições individuais de amostra desconhecidas |
| Pm | elétrica | **75 µΩ·cm, temperatura não informada** | **ESTIMATIVA** em parênteses na compilação de Gupta; não é medida direta |
| In | térmica | 83,7 W/(m·K), 273,15 K | constante da ficha Indium Corporation; não substituir o NIST 295 K (87 W/(m·K)) |
| In | elétrica | 84 nΩ·m, 293,15 K | ficha Indium Corporation; σ derivada matematicamente; preservar Matula/Chi 273,15 K independentemente |
| U | térmica | **22,5 W/(m·K), 293 K** | **correlação α-U**, IAEA-THPH tabela 2.7/equação 2.4; ±10% citado; não medição independente dessa mesma amostra |
| U | elétrica | 21,8 × 10⁻⁸ Ω·m, **298 K e 0,1 MPa** | compilação IAEA-THPH tabela 2.4; σ derivada, não medição independente; não atribuir à amostra α-U térmica |

Referências:
- Ho/Powell/Liley (1974): https://srd.nist.gov/JPCRD/jpcrdS1Vol3.pdf
- ESPI Metals, Ga: https://www.espimetals.com/index.php/component/content/article/356-online-catalog/gallium-ga/365-gallium-ga?Itemid=135
- BNWL-1309 Pm: https://www.osti.gov/servlets/purl/4136914
- Gupta/Krishnamurthy rare-earths: https://vector.umd.edu/images/links/Extractive_Metallurgy_of_Rare_Earths_Gupta.pdf
- Indium Corporation: https://www.indium.com/wp-content/uploads/2025/03/Physical-Constants-of-Pure-Indium-APPNOTE-97532-A4-R7-1.pdf
- IAEA-THPH, tabela 2.4 e 2.7: https://www-pub.iaea.org/MTCD/Publications/PDF/IAEA-THPH_web.pdf

### Estimativas históricas e provisórios de 1972 (15 fichas)

Origem: C. Y. Ho, R. W. Powell, P. E. Liley, NBS/J. Phys. Chem. Ref. Data (1972): https://srd.nist.gov/jpcrdreprint/1.3253100.pdf. As páginas 369, 384 e 418 foram verificadas visualmente. **Valores são cálculos estimados por analogia, extrapolação ou referências provisórias antigas; não foram medidos como propriedade dos metais citados individualmente.** Margem de incerteza possivelmente ±50% (Np assinalado em ~±20%). Onde não há amostra, a condição de amostra não foi inventada.

| Elemento | k [W/(m·K)] | Temperatura | Restrição |
|---|---:|---:|---|
| Ac | 12 | 300 K | estimativa ±50% |
| Np | 6,3 | 300 K | referência provisória marcada como estimada ~±20% |
| Pa | 47 | 300 K | estimativa ±50% |
| Po | 20 | 300 K | estimativa ±50% |
| Ra | 18,6 | 293,2 K | valor provisório, incerteza até ±50% |
| Fr | **15** | 300 K | extrapolação grupo IA, ±50%; matriz antiga indicava **14,5**, diferença registrada |
| Cm, Bk, Cf, Es, Fm, Md, No, Lr | **10 cada** | 300 K | mesma estimativa por analogia de família, **não oito experimentos independentes** |
| Rf | 23 | 300 K | previsão histórica do chamado “elemento 104”; não medição de Rf |

Os números dos 15 aparecem em Dados com a frase **“ESTIMATIVA HISTÓRICA / NÃO medida / precisão baixa”** ou **“ESTIMATIVA por analogia; não medido nem homologado”**, além do link à fonte. **Nenhum alimenta o motor térmico**.

## Metais bloqueados continuam bloqueados

`Hg, Db, Sg, Bh, Hs, Mt, Ds, Rg, Cn, Nh, Fl, Mc, Lv` (13): nenhuma habilitação estrutural ou extrapolação para a animação foi criada. O mercúrio sólido exige T/fase apropriada, e o conjunto de superpesados tem lacunas experimentais significativas.

**Matriz inteira:** 92 auditados = 62 já indexados + 2 novos com referências condicionais + 15 novos somente por estimativas + 13 ainda bloqueados.

## Triagens antigas NÃO promovidas

A matriz contém valores históricos de resistividade/térmica de 65 metais e respectivas contas de σ, mas diversos **não têm fonte individual rastreável ou condições de amostra suficientes**. Esses números **não foram copiados para a interface** como propriedades validadas. O catálogo original das 315 fichas continua intacto. Para entrar no motor, é preciso validar material/temperatura/amostra/método e contratar curvas físicas com limites; não basta uma constante isolada.

## Arquivos e testes

- `domain/silm/data/research-stage81-matrix92.js`: inventário canônico 92, status de 79/13, 23 fichas novas e porta de consulta por elemento.
- `domain/silm/science-evidence-index.js`: fonte adicional na mesma API documental já utilizada por Dados e Explorar.
- `domain/silm/science-evidence-view.js`: destaque explícito do caráter estimado (não medido).
- `integracao/metallic-experience.js`: evita apresentação de uma estimativa no resumo de Dados como uma “referência da amostra” homologada.
- `index.html`, `sw.js`: ordem dos scripts, invalidação do cache offline.
- `tests/stage81-matrix92-reconciliation.test.cjs`: contratos da matriz, fontes, estados, 79 disponíveis, 13 bloqueados, Ga anisotrópico, Pm, In, U, Fr e 15 previsões.
- `tests/stage80-unified-evidence.test.cjs`: Etapa80 preservada (315 linhas anteriores) e testes adaptados à camada 81.
- `tests/run-stage81-matrix92.mjs`: investigação real, mobile e desktop, em Chromium/Firefox/WebKit, incluindo capturas de Ga e Pm.
- `.github/workflows/silm-stage81-matrix92.yml`: unitários e regressões E2E específicas. Os workflows permanentes da main continuam atuando.

**Limite científico:** o índice agora abrange os 79 metais estruturalmente disponíveis, MAS cobrir com uma estimativa antiga não significa comprovar propriedades dos 79 nem liberar cinco motores. A Etapa 82 deve continuar a auditoria das lacunas de maleabilidade e buscar dados rastreáveis onde hoje só existem estimativas.
