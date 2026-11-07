# SILM — Protocolo científico para o mapa espacial EBSD de cobre

**Data:** 07/11/2026. **Etapa:** conferência experimental de arquivo e desenho do pipeline de contornos. **Não homologado e não integrado à main.**

## Origem e identidade

- Tong, Grabner e Petersmann (2025), [Data for MTEX TrueEBSD example — grain boundary voids in a copper polycrystal](https://doi.org/10.5281/zenodo.16902083).
- Arquivo original `copper29.h5oina`, Oxford Instruments HDF5, 163,7 MB, MD5 publicado `ffe617d5cb3d2e4ed1a5e3b7d27d6e11`.
- Material efetivo: **cobre policristalino** da pesquisa sobre vazios intergranulares em metalização fina de dispositivos semicondutores de potência. Não representar automaticamente o estado metalúrgico de cabos de cobre, tubos ou peças trabalhadas.
- O estudo disponibiliza código-fonte reprodutível: [exemplo MATLAB/MTEX TrueEBSD](https://github.com/vtvivian/mtex-trueEbsd/blob/main/examples/example_copper.m).

## Dimensões previstas pela referência — confirmar no HDF5

A [documentação pública do MTEX](https://mtex-toolbox.github.io/example_copper_2.html) registra:

| Campo | Descrição do exemplo |
|---|---|
| Grade EBSD | 1.031 × 547 pontos |
| Pontos totais | 557.957 |
| Fases e indexação | 511.713 pontos Copper (~91%) e 52.244 sem indexação (~9,3%) |
| Área coberta | aproximadamente 103 × 55 µm |
| Estrutura do cobre | cúbica, grupo Laue m-3m |
| Conteúdo do HDF5 | mapa EBSD + imagens de microscopia SEM e metadados |

**Importante:** valores acima são da **documentação da fonte**, não um resultado calculado pela auditoria do SILM. Precisam coincidir com o HDF5 original antes da liberação de qualquer medida.

A [especificação Oxford h5oina](https://github.com/oinanoanalysis/h5oina/blob/master/H5OINAFile.md) descreve cabeçalhos `X Cells`, `Y Cells`, `X Step` e `Y Step`, com passos em micrômetros, canais `Phase` e `Euler` e metadados de fases. A rotação da amostra, a convenção de Euler e os eixos devem ser conferidos na reconstrução. O [guia MTEX](https://mtex-toolbox.github.io/EBSDImport.html) adverte que pode haver mapas de aquisição e pós-processados no mesmo arquivo.

## Etapa automatizada de inspeção (sem segmentar)

- Script: `research/microstructure/audit_copper_ebsd.py`.
- Workflow: `.github/workflows/silm-copper-ebsd-audit.yml`.
- Baixar `copper29.h5oina` em um runner efêmero, com limite de tamanho e conferência **byte a byte do MD5**.
- Extrair hierarquia, nomes de canais, formato, forma, unidades e valores dos **metadados pequenos**; examinar sem publicar matrizes do mapa, dados SEM ou imagens originais.
- Conferir dimensões físicas, número de células da grade e a contagem de índices de fase.
- Consultar licenciamento do registro sem presumir que `Open` autoriza redistribuição do arquivo/imagens ou de seus derivados.
- Publicar apenas `copper-h5oina-audit.json` e `copper-h5oina-audit.md` em artefato temporário para revisão, não na pasta pública de mídias do site.

## Resultado da conferência real do HDF5 — 07/11/2026

A auditoria [GitHub Actions #42340012964](https://github.com/qui-x/ligacoesmetalicas/actions/runs/42340012964) **passou** e examinou o arquivo original em runner efêmero, sem publicá-lo no site.

- **163.730.279 bytes** baixados, MD5 calculado e confirmado: `ffe617d5cb3d2e4ed1a5e3b7d27d6e11`.
- **Grade real:** 1031 × 547 = **563.957 pontos**. A documentação apresenta 511.713 pontos indexados em Copper e 52.244 sem indexação — a soma confirma o total real. O valor **557.957** citado numa resposta anterior estava incorreto.
- **Calibração do próprio cabeçalho:** `X Step = Y Step = 0,10000000149 µm`; campo entre posições extremas ~**103,0 × 54,6 µm**, antes de considerar eventuais transformações da imagem ou recortes.
- **Fases:** 511.713 pontos da fase **Copper** (ID 1), 52.244 pontos sem indexação (ID 0). Esses percentuais são frações de *pontos indexados*, não porcentagens químicas de cobre, de grãos ou de fases no volume.
- **Cristalografia da fase indexada:** estrutura Fm-3m, grupo espacial **225**, cela com `a ≈ 3,6144 Å`; grupo Laue 11. A matriz `/1/EBSD/Data/Euler` contém **563.957 × 3** orientações em `float32`; X/Y e Band Contrast também estão no arquivo.
- **Amostra identificada:** `P1700`, adquirida em 17/01/2023; notas de amostra mencionam **500 ciclos térmicos**. Esses detalhes são condições da fonte, não autorização para simular envelhecimento de qualquer cobre.
- **Direitos de reutilização:** a API de metadados consultada retornou `rights: []`, sem uma licença inequívoca. **Não há permissão presumida para redistribuir imagens, mapas ou derivados.**
- **Status:** metadados, identidade de arquivo, calibração e contagem de fases validados. **Contornos de grão, diâmetros equivalentes, dados de aplicação do cotidiano e direitos ainda não homologados.**

Resumo versionado em `research/microstructure/copper-ebsd-verified-metadata.json`. Inventário HDF5 original conferido está como artefato temporário do workflow, sem matrizes brutas.

## Etapa seguinte — segmentação experimental, somente após validação

O [exemplo original MATLAB](https://github.com/vtvivian/mtex-trueEbsd/blob/main/examples/example_copper.m) reconstrói grãos de cobre com `calcGrains(...,'angle',10*degree)`, mas **não usa somente esse limiar**: antes aplica TrueEBSD para alinhamento de imagens, corrige distorções, cria uma máscara para vazios a partir de BSE e preenche pontos sem indexação antes de calcular limites.

Para produzir uma derivação honesta, a implementação deverá:

1. Diferenciar mapa EBSD **bruto** versus corrigido e registrar qual versão é selecionada.
2. Confirmar que as orientações `Euler` obedecem à referência espacial e à simetria cúbica do cobre.
3. Reproduzir ou justificar explicitamente o método de contornos: `10°` + simetria + tratamento documentado dos pixels não indexados; citar diferenças contra o TrueEBSD original.
4. Medir um contorno **somente depois** de confirmar amostragem, calibração, máscara, filtros de borda e qualidade de indexação.
5. Exportar, após análise de licença, **recortes reduzidos** em JSON com metadados de origem, step-size, área, polígono ou máscara, algoritmo e precisão. Não atribuir um mapa de Cu do estudo a todos os objetos de Cu do atlas.
6. Fazer teste regressivo que impeça exibir a soma de áreas/cores de fases como porcentagem de elemento químico.

## Critérios de aceite

- [x] HDF5 original com MD5, X/Y Cells e X/Y Step verificados.
- [x] Fases e unidades cruzadas com o exemplo do MTEX.
- [ ] Licença dos dados e das imagens esclarecida e registrada.
- [ ] Transformação de orientações, limiar e algoritmo de segmentação conferidos.
- [ ] Estatísticas com diferenças em relação a MTEX avaliadas e documentadas.
- [ ] Contornos 2D com geometria, calibração e seleção validados.
- [ ] Reconstrução da imagem experimentaI liberada para uso didático, com atribuição e direitos apropriados.
- [ ] Integração ao módulo `Grãos` mantendo separado o gerador esquemático.

A auditoria de metadados do estágio atual **não atende automaticamente** aos critérios finais.
