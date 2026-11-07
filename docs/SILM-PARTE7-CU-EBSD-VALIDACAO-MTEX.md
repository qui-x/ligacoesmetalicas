# SILM — Parte 7 | Verificação metodológica de Cu EBSD versus MTEX/TrueEBSD

**Data da revisão:** 07/11/2026. **Natureza:** conferência documental e especificação de testes sintéticos; **não constitui homologação científica de contornos nem autorização de redistribuição.**

## Ponto de retomada

A pesquisa já deixou de ser apenas bibliográfica. O arquivo original `copper29.h5oina`, DOI [10.5281/zenodo.16902083](https://doi.org/10.5281/zenodo.16902083), foi obtido num runner efêmero e conferido por MD5 (`ffe617d5cb3d2e4ed1a5e3b7d27d6e11`). Não foi publicado na PWA. Há [auditoria HDF5](SILM-PROTOCOLO-CU-EBSD-CONTORNOS-2026-11.md) e [prévia orientacional](../research/microstructure/copper-ebsd-orientation-preview.json).

### O que efetivamente foi medido/inspecionado

| Estágio | Extensão | Identidade do dado | Interpretação permitida |
|---|---|---|---|
| EBSD original | 1031 × 547 = 563.957 pontos; passo 0,1 µm | 511.713 índices Cu; 52.244 não indexados | Grade, indexação e escala **da aquisição bruta**, não composição ou grãos homologados |
| Prévia SILM | 160 × 160 pixels centrais, 23.114 pontos Cu | 89 regiões candidatas com ≥5 pixels, excluídas as que tocam a borda; ECD mediano ≈0,798 µm | Conectividade orientacional exploratória **do recorte bruto**; não estimativa ASTM nem média da amostra |
| Exemplo MTEX publicado | Mapa **corrigido e reamostrado** após TrueEBSD; a documentação exibe 1082 × 2018 e 2.356 grãos Cu sob parâmetros próprios | Regiões reconstruídas após alinhamento, reclassificação de vazios e preenchimento/fechamento de rede | Resultado **de outro estágio de processamento**, não denominador válido para comparar diretamente com as 89 regiões do recorte |

**Erro a evitar:** os números 89 e 2.356 NÃO medem o mesmo objeto experimental ou campo. Não calcular razão, porcentagem de cobertura nem discrepância quantitativa a partir deles. O mapa MTEX corrigido tem dimensão e amostragem diferentes do HDF5 de aquisição.

## Sequência científica a reproduzir ou comparar

A documentação de referência [MTEX — TrueEBSD grain boundary voids in a copper polycrystal](https://mtex-toolbox.github.io/example_copper_2.html) e o [exemplo dos autores](https://github.com/vtvivian/mtex-trueEbsd/blob/main/examples/example_copper.m) demonstram as operações que faltam à prévia SILM:

1. Verificar a importação do Oxford `.h5oina`, incluindo se há conjuntos brutos e pós-processados e qual versão é usada.
2. Confirmar orientação Bunge/ZXZ, simetria própria cúbica e referência amostra/cristal, **não apenas** coincidência dos rótulos Euler.
3. Registrar/alinha EBSD, FSD e BSE/SEM na sequência TrueEBSD; quantificar transformações e possíveis mudanças na malha. **Não aplicar a mesma grade do arquivo bruto ao mapa corrigido sem revisão.**
4. Distinguir pixels sem indexação de vazios identificados na imagem BSE. A classe `voids` no exemplo é fundamentada pelo BSE, não por todos os zeros da fase EBSD.
5. Reconstruir grãos com `calcGrains` e limiar de 10°, identificando no procedimento o uso de `minPixel` e `alpha` para preservar ou fechar os vazios; aplicar regras coerentes de borda.
6. Só comparar distribuições ECD/área **em um mesmo campo e estágio**, com mesma escala, critérios de inclusão, referência espacial e tratamento de regiões parciais.

Na documentação MTEX consultada, os vazios são inicialmente preservados com `'alpha',0,'minPixel',5`; para fechar a rede de grãos sobre vazios usa-se `'alpha',6,'minPixel',5`. Isso não equivale ao grafo atual de quatro vizinhos com `Phase == 1`, mesmo quando ambos aplicam 10°.

## Sensibilidade espacial — etapa exploratória executável

O primeiro recorte no centro gerou 89 candidatos no EBSD bruto. Como esse resultado não demonstra a representatividade da amostra, a etapa seguinte [`audit_copper_spatial_sensitivity.py`](../research/microstructure/audit_copper_spatial_sensitivity.py) examina cinco janelas **disjuntas e pré-definidas de 160 × 160 pixels** (cantos e centro da aquisição). Elas não são uma amostra aleatória, não sustentam inferência populacional e não substituem uma segmentação MTEX corrigida.

- O script confere novamente o **MD5 do arquivo completo** e aborta diante de divergência; o script anterior continua a auditar o HDF5, fases e passos.
- Cada janela reconstrói regiões conectadas apenas entre pixels Cu com orientação indexada, usando as 24 rotações de simetria cúbica e limiares 5/10/15°.
- Compara **amplitudes descritivas entre janelas** (contagem de regiões e intervalo entre medianas ECD por janela). Não denominar essas amplitudes erro, incerteza padrão, intervalo de confiança ou representatividade.
- Faz regressão do recorte central contra o [resultado já versionado](../research/microstructure/copper-ebsd-orientation-preview.json), para não mudar silenciosamente contagem, escala ou método.
- Os pontos não indexados **não são convertidos automaticamente em vazios** e a interpretação de índice Cu não equivale a concentração química; tampouco o limiar de conexão substitui `calcGrains`.
- Os únicos artefatos produzidos pelo workflow são relatórios/JSON agregados em armazenamento temporário. **Não publicar** mapa, máscara de pixels, micrografia original, vetores de contorno, orientações de Euler ou derivados.

Este estudo permite localizar **heterogeneidade entre regiões escolhidas**, mas não fornece distribuição homologada de tamanho de grão nem comparação quantitativa direta com os 2.356 grãos do mapa alinhado MTEX.

### Resultados reais da primeira execução espacial

A execução [Actions #42342190496](https://github.com/qui-x/ligacoesmetalicas/actions/runs/42342190496) concluiu com sucesso. Ela confirmou o MD5 original e o recorte central previamente registrado. A tabela abaixo relaciona **somente resumos** para o critério de 10° (quatro vizinhos e exclusão de regiões menores que cinco pixels ou conectadas à borda do recorte):

| Janela na aquisição bruta | Posição inicial (x,y) em pixels | Pontos indexados Cu | Regiões candidatas | Mediana ECD das candidatas (µm) |
|---|---:|---:|---:|---:|
| Superior esquerda | (0, 0) | 22.772 | 103 | 0,930485 |
| Superior direita | (871, 0) | 23.654 | 91 | 0,704673 |
| Centro | (435, 193) | 23.114 | 89 | 0,797885 |
| Inferior esquerda | (0, 387) | 23.012 | 110 | 0,805824 |
| Inferior direita | (871, 387) | 23.065 | 152 | 0,789865 |

A contagem de regiões varia de **89 a 152** entre janelas deliberadamente escolhidas; as medianas ECD da janela variam de **0,704673 a 0,930485 µm** no limiar de 10°. Com 5° e 15°, as amplitudes das medianas são, respectivamente, 0,700126–0,913054 µm e 0,704673–0,944070 µm. Ao contrário da janela central, alguns outros recortes alteraram ligeiramente a contagem quando variou o limiar: por exemplo, superior esquerda **104 → 101** candidatos entre 5° e 15°. Assim, a insensibilidade de um recorte não se generaliza ao mapa.

Estes valores **não autorizam** estimar a distribuição completa de tamanhos dos grãos, fração de fase, porcentagem de Cu, média ASTM ou intervalo de confiança. A contagem de pontos indexados é dado instrumental de EBSD, não porcentagem química. Os arquivos brutos, micrografias e contornos experimentais continuam fora do repositório e da PWA. A reexecução com validação de Euler não indexado em [Actions #42342295716](https://github.com/qui-x/ligacoesmetalicas/actions/runs/42342295716) concluiu todas as etapas com sucesso.

### Controle da versão do procedimento MTEX

A [página técnica MTEX](https://mtex-toolbox.github.io/example_copper_2.html) mostra a cadeia **Band Contrast → FSD → BSE**, com `trueEbsd2`, reamostragem em aproximadamente 0,050355 µm e residual da correção. A página separa `voids` com limiar BSE `0.8` somente na área efetivamente coberta e usa `calcGrains(...,'angle',10*degree,'alpha',0,'minPixel',5)` e depois `'alpha',6` para fechar a rede de contornos. Já o `example_copper.m` publicado no repositório dos autores exemplifica um percurso que inclui preenchimento de posições sem indexação e reconstrução de limites. São **implementações/versionamentos a registrar separadamente**, não pressupor que produzem mapas idênticos.

As incertezas de alinhamento relatadas na página MTEX (residuais dos ajustes) são **do estudo corrigido**, não medidas do SILM. Qualquer comparação posterior terá de usar o mesmo quadro espacial após transformação, mesma máscara BSE, convenção de orientação, política de borda, método de `calcGrains` e referência de escala. O workflow espacial presente não executa essas etapas.

## Verificação independente e regressão

Um teste sintético pode verificar as regras matemáticas **sem usar nem redistribuir o material original**:

- identidade e simetria cúbica de orientações, bem como desorientação conhecida de 8°;
- numa grade artificial calibrada de 20 × 20 pixels, uma ilha interna orientada 8° em relação à matriz deve permanecer região independente em 5° e unir-se à matriz a partir de 10°;
- célula sem indexação na ilha não deve ser tratada como fase de cobre;
- a região matriz que toca a borda não entra na estimativa de ECD interno;
- filtros geométricos e ausência de homologação devem permanecer explícitos.

O teste não valida aquisição, registro TrueEBSD, polígonos reais, licença ou estatísticas de um espécime; confirma apenas invariantes básicos do algoritmo em um campo artificial controlado.

## Licenciamento e separação de estados

O registro do Zenodo indica acesso aberto, porém o campo de licença não estabelece uma permissão explícita suficiente para a publicação de imagens/derivados na versão da fonte inspecionada. A auditoria do SILM registrou `rights: []`; **não confundir acesso ao arquivo com licença de redistribuição**. Antes de qualquer mapa real distribuído, esclarecer e registrar autorização, atribuição e condições de derivados por fonte.

Até cumprir esses critérios, os dados reais permanecem em `research/` e o PR [#73](https://github.com/qui-x/ligacoesmetalicas/pull/73) permanece **draft**. A `main` só mantém o que já foi integrado e validado anteriormente; não ativar o conjunto experimental em `Grãos`, `Medir` ou `Calcular`.

## Próximos critérios de aceite verificáveis

- [x] MD5, número de pontos, fases, passo e identidade da amostra conferidos no HDF5.
- [x] Prévia de conectividade orientacional registrada com limitações explícitas.
- [x] Diferenças metodológicas entre aquisição bruta, recorte SILM e mapa TrueEBSD documentadas.
- [x] Executar testes sintéticos de limiares, simetria e borda em CI — etapa aprovada em [Actions #42341238547](https://github.com/qui-x/ligacoesmetalicas/actions/runs/42341238547); auditoria EBSD real prossegue separadamente.
- [ ] Selecionar recorte coincidente antes/depois de TrueEBSD e manter as transformações auditáveis.
- [x] Auditoria de cinco recortes e interpretação cautelosa: [Actions #42342295716](https://github.com/qui-x/ligacoesmetalicas/actions/runs/42342295716) (sucesso); resultados resumidos acima, sem homologação ou extrapolação.
- [ ] Confrontar segmentações e estatísticas com mesmo recorte, escala, máscara de vazios e parâmetros de grão.
- [ ] Documentar erro/uncerteza e política de grãos de borda, sem reinterpretar ECD individual como número ASTM.
- [ ] Confirmar a licença de reutilização de mapas/imagens/derivados, incluindo atribuição.
- [ ] Somente então considerar visualização experimental com proveniência visível.

**Fontes primárias:** [Zenodo](https://zenodo.org/records/16902083); [documentação MTEX](https://mtex-toolbox.github.io/example_copper_2.html); [código de exemplo TrueEBSD](https://github.com/vtvivian/mtex-trueEbsd/blob/main/examples/example_copper.m).
