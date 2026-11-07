# SILM — Política científica para métricas de microestruturas

**Situação:** correção implementada em branch; aguarda testes e revisão antes da integração à `main`.

## Diagnóstico da implementação anterior

O mapa `domain/silm/microstructure-view.js` constrói uma tesselação de Voronoi a partir de sementes pseudorrandômicas, limitada ao quadro visual. A indicação antiga `Grão N · área no desenho: X% (ilustrativa)` era calculada como área do polígono dividido pela área total do SVG. O valor é interno **ao desenho**, dependente de sua proporção, e não um resultado científico da amostra. Não autoriza inferir composição, fração de fase, volume ou tamanho físico de grão.

**Decisão:** não mostrar porcentagens numéricas em mapas esquemáticos. Manter seleção, destaque, zoom e navegação, com proveniência explícita `schematic` e `measurementStatus=unavailable`. A tonalidade distingue regiões visualmente e **não codifica concentração química** na ausência de dados.

## Conceitos que não podem ser confundidos

| Grandeza | O que representa | Fonte e procedimento necessários |
|---|---|---|
| Área de polígono no desenho | Só a fração geométrica da ilustração sintética | Não exibir como métrica de material |
| Tamanho médio de grão | Caracterização estatística de grãos reais em uma seção metalográfica | Micrografias representativas, escala física, método e amostragem, como ASTM E112 ou E1382 |
| Fração de uma fase/constituinte | Estimativa estatística de material identificável na microestrutura | Segmentação/contagem representativa e identificação de fase/constituinte; métodos como ASTM E562/E1245 conforme o caso |
| Concentração de elemento (por grão ou região) | Fração mássica/atômica estimada do elemento na região analisada | Análise composicional calibrada (por exemplo SEM-EDS/EPMA) com mapas ou medições apropriadas, método, controles e incertezas |
| Ocupação de um sítio atômico | Identidade/composição do sítio em um modelo estruturado | Dados explícitos de cristalografia, ocupação, fase ou modelo validado; **não** deduzir apenas da cor do grão |

A identificação de um grão por clique **não** significa conhecer sua composição. Para uma liga, "mais escuro = maior incidência de elemento" só pode ser utilizado como legenda de concentração qualitativa **quando existir um campo de composição fundamentado**; do contrário, tons são meramente decorativos.

## Contrato de proveniência antes de habilitar medições

- `sourceKind`: `schematic` / `literature-image` / `experimental-image` / `validated-model`.
- `material`: identificação do metal/da liga, composição e condição da amostra quando conhecidas.
- `micrograph`: referência verificável, modalidade (óptica/SEM/EBSD/EDS etc.), orientação, preparo, resolução, pixel/µm, campo e representatividade; registrar ausência de escala quando for o caso.
- `segmentation`: método utilizado, regiões/fases identificadas, critérios e revisão; registrar possível incerteza de segmentação.
- `measurements`: grandeza definida, valor, unidade, base (`area`/`volume`/`mass`/`atomic`), metodologia, amostragem, erro/intervalo de confiança conforme disponibilidade e fonte.
- `validation`: evidências de consistência, citações, versão do procedimento e aprovação científica.
- Valores desconhecidos são `null`/indisponíveis. Não preencher com porcentagens randômicas ou derivadas de cor.

## Regras da interface

1. **Esquema sem metrologia:** exibir `Grão N selecionado · modelo esquemático`, tamanho real indisponível e uma explicação breve de que tonalidades e formas não são dados de composição, fase ou tamanho.
2. **Imagem real sem calibração:** pode mostrar contornos e identificação visual, nunca tamanho físico ou percentuais atribuídos automaticamente.
3. **Dados validados:** oferecer `Medir` e `Calcular` apenas para a grandeza efetivamente disponível; distinguir de fonte bibliográfica e de medida realizada pelo usuário.
4. **Grãos da mesma fase:** diferenças visuais de cor ou tamanho **não** são automaticamente diferenças de concentração.
5. **Ligas e múltiplas fases:** legenda de fases e elementos separados; percentual de fase, teor de elemento e área do grão são grandezas distintas.
6. **Responsividade:** tamanho da janela, zoom ou recorte do desenho **não** alteram um valor medido válido.

## Testes e próximos passos

- Testes da Oficina devem reprovar qualquer porcentagem para a tesselação `schematic`.
- Verificar se o aviso e o estado de medições indisponíveis aparecem em desktop e mobile.
- Projetar um catálogo de microestruturas com dados de literatura rastreáveis, sem prometer quantificação geral para todos os 65 elementos.
- Para medir experimentalmente, admitir imagens calibradas e protocolo de análise; incorporar incerteza e limites do método.
- Exigir aprovação científica antes de converter qualquer imagem do atlas em fonte quantitativa.

## Fontes de orientação

- ASTM E112 — `https://store.astm.org/standards/e112`: tamanho médio de grão.
- ASTM E1382 — `https://store.astm.org/standards/e1382`: análise semiautomática/automática de tamanho de grão em micrografias.
- ASTM E562 — `https://store.astm.org/standards/e562`: fração volumétrica de constituintes identificáveis por contagem sistemática de pontos.
- ASTM E1245 — `https://store.astm.org/e1245-03r23.html`: análise de inclusões/segunda fase.
- National Physical Laboratory, MAT 135 (2026), `https://eprintspublications.npl.co.uk/10334/`: incertezas em composição química por SEM-EDS.
