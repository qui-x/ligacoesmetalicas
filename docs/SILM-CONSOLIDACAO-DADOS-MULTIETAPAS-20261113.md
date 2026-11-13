# SILM — Consolidação multi-etapas de dados mecânicos de pesquisa

**Data:** 13/11/2026. **Fonte de controle:** SILM_matriz_cientifica_etapa57_pesquisa.json da biblioteca de pesquisa (65 elementos, 211 perfis). **Referência SILM:** 273,15 K / 101325 Pa. **Perfis mecânicos homologados exatamente na CNTP:** 0.

## Inventário integrado à interface

- 12 ensaios **Fe** da Tabela 6 do NIST TN 1879: já integrados no PR #134; mantidos **sem duplicação** em research-evidence-fe-nist.js.
- 138 perfis **adicionais de pesquisa** com fonte identificada, evidência numérica mecânica e classificação P1/P2/S, correspondentes a **46 metais** e **18 etapas de pesquisa (10, 12, 17, 18, 19, 21, 23, 24, 25–29, 37, 38, 52, 53 e 57)**.
- Total: **150 referências numéricas de 47 elementos**; não equivale a 150 valores homologados em CNTP.
- A matriz completa de pesquisa contém **211 perfis**; 61 não foram promovidos a esta interface por ausência de grandeza mecânica numérica em campos auditados, por categoria contextual Q/teórica T ou por falta de condições suficientes. Não confundir dados não promovidos com dados inexistentes.
- Nenhuma linha da matriz foi reclassificada como medida de metal puro a 273,15 K. Dados P1 (ensaio em outra temperatura), P2 (experimental condicionado) e S (compilação/ficha) têm aviso visível; documentos marcados CANDIDATO preservam seu status, sem anúncio de confirmação que não ocorreu.

## Experiência integrada

O script research-evidence-multistage.js inclui registro imutável por ID, elemento, etapa de pesquisa, amostra e fase, ensaio, temperatura quando registrada, informações de composição, fonte, qualificador, notas e valores numéricos originais. Não inventa pontos de curva.

O componente research-evidence-panel.js é parte do painel existente da propriedade:
- **Ductilidade**: mostra somente ensaios de tração e alongamentos documentados para o metal corrente.
- **Maleabilidade**: mostra dados de **compressão como ensaio contextual**, com aviso de que compressão não quantifica automaticamente maleabilidade.
- Seleção apenas altera a referência exibida, **não a simulação**, a deformação dos grãos ou a rede.
- Não há rota nova, janela de resultados paralela ou exportação de dados "do motor".
- Fe continua no próprio bloco NIST e não é duplicado pelo novo registro.

### Casos exemplares da matriz

- **Zn, etapa 17:** amostra metálica e valor documentado de tração em fonte primária (115 MPa, ruptura 10%).
- **Li, etapa 19:** tração de Li puro, 0,4 MPa de escoamento e 28% à ruptura; RT não quantificada.
- **Ti, etapa 52:** Ti Grau 2, quatro tratamentos, de 318/440/28% (CG) a 998/1040/6% (RS), mantendo contradição 998 vs. 989 MPa entre Tabelas 1/2 do artigo e identificando o registro transcrito como candidato.
- **Co, etapa 53:** 19 ensaios de compressão de Co predominantemente HC, 99,9%; nunca convertidos para tração nem utilizados como medida universal de maleabilidade.
- **Zr, etapa 57:** cinco condições de Zr702, inclusive laminação e pré-resfriamento LNT; processamento não equivale a temperatura de ensaio.
- **Ta, etapa 57:** quatro perfis SLM de Ta 99,9%, sem confundir recozimento 1200/1600 °C com temperatura de ensaio; conflito de 16% / 18% preservado nas notas.
- **Pb, etapa 57:** três réplicas de chumbo fundido distintas da compilação técnica ≥99,999% Pb; média não criada como quarto ensaio.

## Portões

- Fe e 138 perfis adicionais: referenceOnly=true, engineRelease=false, CNTPhomologated=false.
- Sem alteração em material-engine.js, material-profile-registry.js, data/bundle.js, representação de deformação ou modelos calor/elétrico/óptico.
- **Não liberar** equações numéricas de ductilidade, maleabilidade e curvas tensão-deformação a partir dessa matriz.
- **Não extrapolar** resultados RT (não especificada) para 273,15 K, nem modelar liga/metal comercial como sólido ideal puro.
- Não utilizar módulos elásticos B/E/G como alongamento à fratura.
- Candidatos ópticos R550 em 59 metais e dados térmicos/elétricos pesquisados continuam com triagem por amostra/temperatura; nenhum R550 foi homologado em CNTP por esta integração.

## Testes

node --test tests/multistage-research-evidence.test.mjs confere IDs, contagens, 18 etapas, tipos e valores, seleção específica de amostras, notas e portões CNTP. tests/run-multistage-evidence.mjs usa o controle real de propriedades com Fe/Ti/Zr/Co em desktop e mobile, nos navegadores Chromium/Firefox/WebKit. Os workflows existentes asseguram regressão de microestrutura, roteiros, offline e escalas.

**Próximo bloco:** consolidar quantitativos elétricos, térmicos e ópticos por fontes e condições, sem importar as 59 refletâncias candidatas como comportamento nativo homologado na CNTP.
