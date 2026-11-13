# SILM — Fm, Md, No: estruturas previstas por modelo empírico-geométrico

**Data:** 13/11/2026 · **Escopo:** somente investigação de geometria cristalográfica.

## Natureza das evidências

A tabela IV do capítulo de Siegfried Hübener, **Actinide Elements**, em *Encyclopedia of Physical Science and Technology* (3ª ed., Elsevier, 2003), registra **estruturas CFC previstas** e os seguintes **raios metálicos estimados**, sem medir a célula dos metais:
- Fm, Z=100: CFC, r estimado = 2,000 Å
- Md, Z=101: CFC, r estimado = 1,985 Å
- No, Z=102: CFC, r estimado = 1,970 Å

Fonte editorial: <https://www.sciencedirect.com/topics/physics-and-astronomy/actinide-series>. A tabela apresenta campos de parâmetro de rede **sem valor** para Fm–Lr; os raios da última coluna **não são parâmetros medidos**.

### Transformação geométrica explícita

Para esferas tangentes em uma rede CFC ideal, a diagonal de face corresponde a quatro raios:
`a√2 = 4r ⇒ a = 2√2r`.

| Elemento | Raio da tabela (Å) | Célula CFC estimada a=b=c (Å) | Grupo espacial | Base convencional |
| --- | ---: | ---: | --- | --- |
| Fm | 2,000 | 5,657 | Fm-3m, nº 225 | quatro sítios 4a |
| Md | 1,985 | 5,614 | Fm-3m, nº 225 | quatro sítios 4a |
| No | 1,970 | 5,572 | Fm-3m, nº 225 | quatro sítios 4a |

**Importante:** estes parâmetros são **estimativas geométricas deduzidas de raios metálicos estimados**, não cálculos DFT de energia total e volume de equilíbrio, nem dados de difração. São um cenário quantitativo explícito do modelo de empacotamento. Podem variar se a estimativa de raio ou a fase postulada mudar. **Não se declara precisão experimental** ao mostrar três casas decimais; elas expressam somente o arredondamento do resultado do cálculo.

O capítulo 13 de Robert J. Silva (*Fermium, Mendelevium, Nobelium, and Lawrencium*, *The Chemistry of the Actinide and Transactinide Elements*) documenta estimativas independentes: Fm ≈1,98 Å, Md ≈1,94±0,10 Å e No ≈1,97 Å. Portanto, o valor de a não deve ser interpretado como predição única e consensual. Uma amostra metálica macroscópica de Fm/Md/No não foi caracterizada por difração. Texto de referência: <https://citeseerx.ist.psu.edu/document?doi=4ddddd5a865ea92fc3ea77b0eb9166a3bb4257bd&repid=rep1&type=pdf>.

Johansson e Rosengren (1975), [DOI 10.1103/PhysRevB.11.1367](https://doi.org/10.1103/PhysRevB.11.1367), fornecem uma previsão de caráter divalente para os actinídeos finais baseada em energias coesivas; não fornecem as três células como valores experimentalmente determinados.

### Regras do simulador

- As fichas recebem `scope='structure-only'`, `evidenceType='computed'`, `predictionMethod='empirical-geometric'` e `kind='CALCULATED'` nos parâmetros a,b,c.
- A interface diferencia **modelo empírico-geométrico** de **previsão DFT** e de **determinação experimental**. A ação inicial não deve chamar os parâmetros de experimentais.
- A base CFC 4a (0,0,0), (0,1/2,1/2), (1/2,0,1/2), (1/2,1/2,0) resulta da simetria do protótipo CFC, não de uma medida de posições de Fm/Md/No.
- Temperatura, pressão e pureza da hipotética amostra **não foram determinados**. Não atribuir CNTP, 0 K ou pressão ambiente por padrão.
- Nenhum dado de propriedades elétricas, térmicas, ópticas ou mecânicas foi inferido. Os módulos Medir e Calcular e roteiros exigindo esses dados continuam bloqueados.
- Testar reconstrução da célula, navegação de Rede e Centro e ausência de objetos cotidianos inventados em Chromium, Firefox e WebKit.

## Laurêncio (Lr, Z=103): ainda bloqueado

A tabela de Hübener (2003) lista uma **hipótese CCC** com raio metálico estimado de 1,66 Å. Entretanto, textos posteriores também discutem hipótese **HC**, enquanto o trabalho DFT de Atta-Fynn e Ray (2015) avaliou explicitamente os sólidos superpesados incluindo Lr: [DOI 10.1016/j.ssc.2014.10.025](https://doi.org/10.1016/j.ssc.2014.10.025). A síntese pública não permite recuperar de forma inequívoca **a simetria energética selecionada e o parâmetro otimizado para Lr no mesmo método**.

Não transformar a hipótese CCC de 2003 em fase confirmada ou escolher uma alternativa por conveniência. Prosseguir com a tabela numérica do estudo relativístico e eventuais trabalhos mais recentes.

## Próximos candidatos superpesados

A publicação *Density functional theory Studies of condensed Phases of 6d super heavy elements* inclui cálculos dos estados sólidos dos elementos Lr–Cn (Z=103–112) e aponta diferenças significativas para Cn. O trabalho [*Physical properties of the 6d-series elements from density functional theory*](https://doi.org/10.1103/PhysRevB.83.172101), de Gyanchandani e Sikka (2011), é uma segunda fonte de confronto para as fases e volumes previstos.

**Não** habilitar superpesados automaticamente sem identificar grupo espacial, volume/parâmetros de rede, base e método correspondente por elemento. Cn pode não exibir o comportamento metálico típico: isso exige revisão da própria elegibilidade de propriedades.

Estas fichas não representam validação de estabilidade termodinâmica nem medição de um sólido existente.

## Atualização posterior — Lr por cenário CCC empírico-geométrico (13/11/2026)

O Lr, antes mantido bloqueado por falta da célula **HC** DFT, passou a ter uma **representação alternativa CCC** independente, construída da Tabela IV de Hübener (CCC hipotética, raio estimado 1,66 Å, `a=4r/√3≈3,834 Å`). Essa alternativa **não invalida o mínimo HC** reportado por Östlin e Vitos e **não o substitui como previsão de fase fundamental**. É apenas cenário de geometria CCC explicitamente rotulado no SILM, sem propriedades específicas. Consultar `docs/AUDITORIA-LR-CCC-EMPIRICO-20261113.md`. Db, Sg e outros superpesados permanecem bloqueados.
