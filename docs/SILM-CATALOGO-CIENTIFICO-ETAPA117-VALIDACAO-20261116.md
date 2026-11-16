# SILM — catálogo científico 80 metais × 5 propriedades (Etapa 117)

**Integração documental controlada, 16/11/2026.** Fonte: matriz de pesquisa Etapa 117, SHA-256 do JSON de origem `a2a16cc6669d1b34e516a210fe944d019154232a1f70b1ce4e139177053fea63`.

## Auditoria executada
- Universo: 80 elementos; 400 pares únicos `símbolo × categoria`; cinco categorias por metal.
- **327** pares com valor escalar numérico finito — o resumo da pesquisa citava 328.
- **321** com valor escalar finito **e URL associada** no perfil principal; URL é rastreabilidade, **não comprovação automática de leitura integral da fonte primária**.
- **6** pares com número, mas sem URL de fonte, permanecem na base, **sem exibição como rastreáveis**: Al-malleability, Cu-malleability, Tc-electrical, Tc-malleability, W-malleability, Th-malleability.
- **1** par indevidamente contabilizado como numérico: Pm-malleability (`value=null`), embora `value_min=50` e `value_max=75` µm sejam uma faixa histórica de fabricação. **Não é coeficiente constitutivo**, percentual de deformação nem número escalar principal validado.
- **438** registros de condições alternativas preservados; somente os com valor finito e URL aparecem em expansão como **fontes candidatas, não homologadas**.
- Condições originais, fase, preparação da amostra, método, dados sobre incerteza, limites e notas são preservados. **CNTP não é critério de exclusão.**

## Política científica e operacional
- Registro com fonte rastreável ≠ ensaio primário homologado ≠ parâmetro do motor.
- Campo `displayEligible=true` significa apenas **número finito com URL associada**. Status `CANDIDATO_OPTICO`, `ESTIMATIVA_HISTORICA`, `PREVISAO_COMPUTACIONAL_CONDICIONADA`, `PROJECAO_OPTICA_LOCAL_CONDICIONADA` e resultados de laminação continuam condicionais.
- Nem módulo elástico nem deformação aplicada em um experimento convertem-se em ruptura ou maleabilidade universal.
- Resultados obtidos em ligas, filmes, amostras processadas ou geometrias específicas **não são constantes do metal maciço puro**.
- Os 400 registros **não** significam que 400 grandezas foram medidas. Lacunas e casos sem fonte permanecem explícitos.
- **Nenhuma calibração de motores foi liberada** (`calibrationApproved=false`, `engineRelease=false`), sem mudanças na rede, propriedades do estado científico, elegibilidade estrutural, Medir ou Calcular.
- O painel unificado existente Dados/Explorar ganha um bloco de referências documentais recolhível, dentro da própria experiência. Sem novos fluxos paralelos.
- Aplicações offline e scripts deferidos usam o catálogo congelado da Etapa 117; novas etapas devem atualizar o arquivo com nova auditoria, sem substituir a procedência dos estudos antigos.

## Validações automatizadas
`node --test tests/science400-reference-stage117.test.cjs tests/stage80-unified-evidence.test.cjs`

Testa 80 metais, 400 campos únicos, 438 alternativas, 327 valores finitos, 321 valores com fonte, bloqueio do Pm-null e seis registros sem URL, isolamento de motores, apresentação no painel existente, ordem de scripts e atualização de cache PWA.

## Fora do escopo
PR #171 de pesquisa contínua e PR #172 do motor CPFEM permanecem intocados; esta integração é um snapshot documental curado da Etapa 117. Dados ainda não auditados individualmente por fonte primária deverão continuar destacados.
