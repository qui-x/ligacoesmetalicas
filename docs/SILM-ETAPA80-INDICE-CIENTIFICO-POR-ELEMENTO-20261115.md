# SILM — Etapa 80: referências científicas unificadas por elemento

**15/11/2026**. Objetivo: integrar os catálogos científicos **já existentes na `main`** aos painéis **Dados → Dados do metal** e **Explorar → Propriedades**. Não importar fontes não versionadas, não substituir a fonte original, não certificar automaticamente parâmetros de motores.

## Diagnóstico da falha

O banco `domain/silm/data/bundle.js` tem 118 elementos e suas estruturas, mas **nenhum elemento possui `properties.electricalConductivity`, `properties.electricalResistivity` ou `properties.thermalConductivity` preenchidos** na versão auditada. Portanto, `SILM.properties.data(elemento,propriedade)` retorna `null` para os 118 elementos. Os números coletados vivem em catálogos independentes carregados em scripts.

O PR #158 conectou `SILM.sevenConditionResearch` ao painel `Dados`, apenas para Co/Er/Hf/Ta/Tc/Th/Zr. Os outros registros apareciam em painéis especializados de `Explorar` e não no painel `Dados`.

## Implementação sem novo motor

- `domain/silm/science-evidence-index.js`: normalizador **somente leitura** dos nove catálogos já existentes, com chave `(origem, ID original, categoria)`, fontes originais, condições da amostra e classificação de evidência.
- `domain/silm/science-evidence-view.js`: um componente de ficha de pesquisa, atualizado por `atomicNumber` e propriedade. Em **Dados**, organiza os registros por elétrica, térmica, maleabilidade, ductilidade e brilho; em **Explorar**, apresenta apenas a categoria atualmente ativa.
- `integracao/metallic-experience.js`: mantém os cinco registros de Co/Er/Hf/Ta/Tc/Th/Zr do PR #158, os dados tabelados existentes e acrescenta as fichas de **outros estudos e outras amostras**, com um primeiro valor observável quando a pesquisa o permite. Não usa dados como coeficientes de motores.
- `domain/silm/property-view.js`: conserva controles, cenas e painéis especializados, acrescentando um resumo facultativo com estudos indexados por elemento.
- `domain/silm/research-evidence.css`: mostra a fonte sem bloquear espaço do palco, com expansão para condições adicionais, mobile e desktop.
- `index.html` e `sw.js`: novo módulo carregado depois de todos os catálogos científicos, antes de `property-view.js` e `metallic-experience.js`; atualização de cache offline.

## Cobertura efetivamente versionada nesta etapa

O índice agrega **315 fichas por propriedade, em 62 elementos** do SILM. O número é maior que o número de registros físicos originais porque alguns perfis mecânicos têm grandezas em tração e compressão e são classificados **em categorias distintas**. A soma NÃO equivale a 315 propriedades validadas.

| Propriedade | Fichas no índice |
|---|---:|
| Elétrica | 40 |
| Térmica | 13 |
| Maleabilidade / processamento e compressão | 48 |
| Ductilidade / ensaios e compilações de tração | 148 |
| Brilho / R550 ideal e referências ópticas | 66 |
| **Total** | **315** |

Por natureza da evidência, há: 128 fichas experimentais condicionais, 36 referências avaliadas, 61 compilações, 76 candidatos e 14 fichas com fonte original pendente. A distribuição inclui duplicações de estudos em catálogos distintos, por isso não somar como 315 experimentos independentes.

Catálogos reunidos: mecânica Etapa 57 (138 registros de entrada → 143 fichas de categoria), complemento Etapa 65 (19), compressão Etapa 73 (8), Fe NIST (12), elétrica NBS/Matula/Chi (29), resistividade intrínseca PGM (4), térmica NIST a 295 K (6), óptica R550 candidata (59) e sete metais Etapas 78–79 (35).

## Interpretação didática e científica preservada

1. **Condições da fonte, não CNTP obrigatória:** temperatura declarada, fase, lote, material, tratamento, pressão quando conhecida. Não inventar 273,15 K ou 101325 Pa.
2. **Uma fonte não é uma propriedade universal:** fichas de Fe-K05, Fe-A11 etc. são independentes; no índice cada condição é preservada.
3. **Maleabilidade:** porcentagem de laminação e deformação aplicada/analisada em compressão não são limites de falha.
4. **Elétrica:** NBS/Matula/Chi fornecem resistividade **total** com `σ=1/ρ` **derivada**, sem criar um segundo ensaio. As curvas Ru/Rh/Os/Ir são de resistividade **intrínseca**: NÃO usar `1/ρintrínseca` como condutividade da peça.
5. **Brilho:** refletância da interface lisa ideal a 550 nm não é brilho percebido nem equivale a uma peça polida/oxidada.
6. **Estado científico:** evidência `candidate` ou `pending` permanece assim; 14 fichas com origem original pendente podem ser consultadas apenas no grupo expandido. Nenhuma fonte vira `engineRelease=true`.
7. **Sem duplicação de números:** o índice agrega e referencia registros de outros módulos; não transfere valores para `SILM.scientificData.elements[].properties`, nem altera motores, Joule, forma de deformação ou `Medir/Calcular`.

## Limitações explícitas

- A antiga matriz ampla de **92 metais da Etapa 72** ainda não está presente como arquivo consultável na `main`, então **não integra esta entrega**. Não afirmar que as 92 fichas completas estão na interface. A consolidação da Etapa 80 reúne o que está efetivamente versionado.
- Os PRs #147, #148 e #150 (pesquisa Eu/Pm/Y, dureza Eu/Lu e contrato de deformação) seguem fora da main na auditoria inicial. Não antecipar esses resultados.
- Há fontes documentais históricas e secundárias cujos dados só são candidatos/condicionados. A inclusão no painel não significa **homologação experimental completa**.
- Por conveniência e segurança, estudos adicionais aparecem em cartões resumidos por propriedade, com detalhe expandível para todas as outras amostras, inclusive pendentes.

## Testes

- `node --test tests/stage80-unified-evidence.test.cjs` valida cobertura, integridade, proveniência, filtros e ausência de calibração involuntária;
- Playwright `tests/run-stage80-unified-evidence.mjs` em Chromium/Firefox/WebKit, mobile/desktop; confere Fe, Cu, Al, Ru, Ti, Er, Th, Co, Hf, Tc em `Dados` e cinco exemplos em `Explorar`;
- As regressões existentes dos painéis de sete metais, microestrutura, roteiros, cache e responsividade permanecem como condições de integração.

**Resultado esperado**: ao selecionar Fe, Cu, Al e demais elementos com evidências documentais, `Dados do metal` mostra números das respectivas fontes; em `Explorar`, a categoria ativa mostra o mesmo registro; elementos sem evidência disponível continuam sem valor numérico e sem valor inventado.
