# SILM — Etapa 78: sete metais e cinco propriedades pelas condições reais das fontes

Data: 14/11/2026. Metais: **Co, Er, Hf, Ta, Tc, Th e Zr**.

## Decisão científica (atualizada)

**A CNTP não é requisito obrigatório para consultar nem registrar uma propriedade metálica.** Aceitamos resultados a 4,2 K, 273,15 K, 293 K, ou a "room temperature" quando esse for o relato experimental, **mantendo o valor exato de temperatura nulo quando ausente**. Não transportamos um valor de um ensaio para outra temperatura, fase, estrutura, pureza ou processamento sem modelo específico.

A norma de demonstração é **valor + unidade + condições reportadas + amostra + fonte + qualidade da evidência**. Cada uma das cinco categorias pode ter amostra e temperatura diferentes — isso não forma um conjunto autoconsistente para motor físico.

## Entrega no programa

- `domain/silm/data/research-seven-condition-profiles.js`: **35 referências documentais** (7 × elétrica, térmica, maleabilidade, ductilidade, óptica), selecionadas da matriz Etapa 72 e cotejadas com os levantamentos existentes. Os campos `temperatureK`, `pressurePa`, `sourceURL` permanecem `null` quando desconhecidos, em vez de serem preenchidos por suposição.
- `domain/silm/research-seven-conditions-panel.js`: detalhe da fonte no **mesmo painel Ver / Explorar** para a propriedade ativa e metal selecionado. Sem nova tela, modal ou estado persistido.
- `domain/silm/property-view.js`: integra a consulta a cada atualização; conserva os seletores anteriores de ensaios mecânicos, pesquisa óptica e elétrica.
- `index.html` e `sw.js`: carregamento ordenado e cache offline.
- `tests/stage78-seven-condition-profiles.test.cjs`: integridade da matriz, separação de processos, fontes, 4,2 K do Er e restrição de não calibração.
- `tests/run-seven-conditions-stage78.mjs`: integração dos controles em **Chromium, Firefox e WebKit**, viewport mobile e desktop.
- Workflow `silm-stage78-seven-conditions.yml`: testes científicos e 35 combinações de propriedades por viewport.

## Leitura correta de cada grupo

| Metal | Dados com maior qualidade identificada | Lacuna impeditiva para "cinco plenamente homologadas" |
|---|---|---|
| Co | Resistividade avaliada NBS a 273,15 K e compressão de amostras 99,9%, artigo de Knapek 2020 | Condutividade térmica ainda em triagem sem fonte individual; ductilidade histórica tem condições específicas |
| Er | Laminação com EBSD e dados ópticos criogênicos (4,2 K); elétrica/térmica compiladas | Não inferir maleabilidade máxima de uma redução de laminação; condições elétricas/térmicas da amostra não individualizadas |
| Hf | Laminação/tração em fonte primária; refletância experimental condicionada | Térmica e elétrica antigas não têm fonte experimental individual rastreada |
| Ta | Compressão e tração SLM relatadas, mas em amostras diferentes; dados ópticos condicionados | Deformação imposta não é ruptura; dados térmicos/elétricos antigos são triagem; discrepância 16%/18% na fonte de tração |
| Tc | Tração de tecnécio recozido e trabalhado a frio no BNWL-865; óptica baseada em n,k | Térmica/elétrica antigas ainda são triagem; condição da amostra de tração não se aplica automaticamente ao sólido de outra ficha |
| Th | Referências ópticas e números mecânicos reproduzidos de tabela histórica | Térmica/elétrica em triagem e transcrição mecânica de fonte secundária pendente: **não homologar como medição original** |
| Zr | Tração Zr702 com direção/taxa reportadas, preparação por laminação; resposta óptica de filme | **Zr702 é grau comercial**, não metal ultra-puro; térmica/elétrica em triagem sem fonte individual |

### Política de uso

1. **Exibição documental nas condições da fonte:** permitida para as 35 referências, com rótulos claros `compilação`, `ensaio primário`, `histórico de processamento`, `valor derivado`, `triagem` ou `transcrição pendente`.
2. **Homologação como medição confiável:** requer conferência da fonte e significado físico da grandeza; não exige CNTP nem iguais T/P entre estudos distintos, mas não aprova fonte secundária não confirmada como medição.
3. **Cálculo ou animação quantitativa metal-específica:** depende de parâmetros constitutivos e de limites do modelo, coerentes entre si. Continuam `engineRelease=false` e `calibrationApproved=false` para os 35 registros. Isso **não** é consequência de T≠273,15 K; é a ausência de calibração, amostras compatíveis e/ou evidência rastreável.
4. **Brilho:** R(550 nm) da interface lisa / Fresnel não é cor ou brilho observado em peça real. `luster` exibirá pesquisa com essa ressalva.
5. **Mecânica:** compressão aplicada, redução de laminação, limite inferior de tração e alongamento pontual não são medidas substituíveis da mesma propriedade.

**Estado:** sete metais com consulta experimental/compilada acessível em cinco categorias; **zero** metais com cinco motores quantitativos inteiramente calibrados. Não se deve anunciar "7 completos" ainda.

## Fontes principais já rastreadas

- Co: Fickett, NBS Technical Note 1053, tabela 1.1, p. 4 (resistividade); https://nvlpubs.nist.gov/nistpubs/Legacy/TN/nbstechnicalnote1053.pdf
- Co: Knapek et al. (2020), *The Effect of Different Thermal Treatment on the Allotropic fcc↔hcp Transformation and Compression Behavior of Polycrystalline Cobalt*. https://doi.org/10.3390/ma13245775
- Er: *Extractive Metallurgy of Rare Earths*, Gupta & Krishnamurthy (compilação); https://vector.umd.edu/images/links/Extractive_Metallurgy_of_Rare_Earths_Gupta.pdf
- Er: estudo de laminação a frio / EBSD, `Materials` (2022): https://pmc.ncbi.nlm.nih.gov/articles/PMC8880798/
- Tc: Nelson & O'Keefe (1968), BNWL-865, propriedades do tecnécio recozido e laminado: https://ntrs.nasa.gov/api/citations/19680026529/downloads/19680026529.pdf
- Ta: estudos DOI https://doi.org/10.1007/s11661-024-07459-9 e https://doi.org/10.3390/ma16083161
- Zr: Chen et al., ensaios de Zr702: https://doi.org/10.1002/adem.202001039
- Comparação térmica futuro: Ho, Powell e Liley (1974), *Thermal Conductivity of the Elements*, JPCRD 3, suplemento 1, https://srd.nist.gov/JPCRD/jpcrdS1Vol3.pdf. Este PDF é grande e **a auditoria de linhas individuais dos sete elementos não foi concluída** nesta etapa.

## Critério para etapa seguinte

Substituir **triagem sem fonte** por medidas/compilações avaliadas por metal (T do ensaio preservada), depois selecionar amostras e métodos com nível de certeza suficiente para calibração do motor elétrico/térmico e, posteriormente, o constitutivo. Uma matriz de cinco números não será confundida com cinco medições homologadas.
