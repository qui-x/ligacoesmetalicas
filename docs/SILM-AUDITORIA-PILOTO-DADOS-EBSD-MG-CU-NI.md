# SILM — Pré-auditoria de arquivos para o piloto Mg → Cu → Ni

**Data inicial:** 07/11/2026. **Situação atualizada:** a pré-auditoria bibliográfica foi sucedida por uma auditoria efetiva das planilhas **AZ31_ML.xlsx** e **Mg1Al_ML.xlsx**, que confirmou hashes MD5 e estatísticas de 3.576 grãos após exclusões de borda. Ver [resultado real de Mg](SILM-AUDITORIA-EBSD-MG-RESULTADOS-REAIS.md) e [resultado real da fase Aluminium de Scalmalloy](SILM-AUDITORIA-EBSD-SCALMALLOY-RESULTADOS-REAIS.md). Os arquivos **Cu e Ni ainda não foram integralmente processados**. Licenças e homologação científica das fontes permanecem pendentes.

Apenas a cristalografia dos elementos e a existência de amostras de literatura foram confirmadas na pesquisa precedente. Esta pré-auditoria apresenta um caminho **concreto** para construir perfis microestruturais fundamentados sem afirmar que a imagem de aplicação do atlas corresponde à amostra experimental.

## 1. Mg — piloto de distribuição estatística (preferencial)

**Fonte:** Yang, Vassilev-Galindo e Llorca, *Application of machine learning to assess the influence of microstructure on twin nucleation in Mg alloys*, npj Computational Materials 10, 26 (2024).

- Registro: https://zenodo.org/records/10225600, DOI `10.5281/zenodo.10225600`.
- Material: duas ligas distintas: **AZ31** e **Mg–1Al (at.%)**, em condições de deformação reportadas.
- `AZ31_ML.xlsx` — 933,6 kB, MD5 declarado `1e67111dc62f6ff47a8d8e535a70e5cd`; **2.640 grãos**, três orientações de carregamento (`S0`, `S45`, `S90`).
- `Mg1Al_ML.xlsx` — 527,5 kB, MD5 declarado `8e4bb43f636939ef4f39a74fb163bb51`; **1.496 grãos**, dois níveis aproximados de deformação (~6% e ~10%).
- `Descriptions.txt` — 7,1 kB, MD5 declarado `0729530b9d5f57d98ea9112cdadbbaa8`.
- **31 características** por grão: `Grain_size` (diâmetro do círculo de área equivalente, µm), `Neighbor_grain_n`, `Near_edge` (indicador de borda), `Twinned`, desorientação e fatores de Schmid, entre outras.
- O próprio documento indica que o treinamento excluiu grãos com `Near_edge=1`. **Reproduzir a filtragem antes de calcular as estatísticas para o perfil do SILM**.
- **Não deduzir coordenadas de polígono** a partir das linhas tabulares. O arquivo registra parâmetros por grão, não necessariamente o contorno espacial original de cada grão.
- O resultado apto ao SILM deve conservar **liga, orientação de carregamento, deformação e amostragem**, com `quantiles`, população, área de validade e parâmetros de geração claramente rotulados `ajuste estatístico`.

### Pipeline verificável proposto

1. Baixar apenas os três arquivos acima mediante licença conferida e verificar os MD5 reportados **contra os bytes locais**.
2. Ler planilhas, validar tipos/unidades, valores vazios e categorias; recusar resultados de amostras diferentes sem identificação.
3. Dividir por liga, orientação e nível de deformação; excluir bordas quando o método pedir; registrar contagens antes/depois.
4. Produzir distribuições `Grain_size` e `Neighbor_grain_n`, com quantis, variância, número de observações e critérios de qualidade. **Não inferir textura/forma/orientação espacial não observadas**.
5. Executar teste reproduzível no GitHub Actions com script versionado. Publicar inicialmente apenas relatório de auditoria e JSON resumido como **artefato para revisão**, sem integrar valores não homologados na `main`.

## 2. Cu — primeiro mapa EBSD real para contornos vetoriais

**Fonte:** Tong, Grabner e Petersmann, *Data for MTEX TrueEBSD example — grain boundary voids in a copper polycrystal*.

- Registro: https://zenodo.org/records/16902083, DOI `10.5281/zenodo.16902083`.
- `copper29.h5oina` — EBSD, imagens e metadados em arquivo Oxford Instruments HDF5, **163,7 MB**, MD5 declarado `ffe617d5cb3d2e4ed1a5e3b7d27d6e11`.
- `example_copper.m` — MATLAB/MTEX, **23,9 kB**, MD5 declarado `d6ddfa176463c989ee9721ea1f2ec8b4`.
- `example_copper_out.mat` — saída MATLAB, **1,5 GB**; não baixar automaticamente na etapa exploratória.
- Scripts originais: https://github.com/vtvivian/mtex-trueEbsd
- Após verificação de licença, identificar pixel/µm, unidades, referência de fase, limites de imagem, orientação, confiança de indexação e algoritmo de segmentação EBSD.
- Produzir máscaras vetoriais/rasters com recortes reproduzíveis, amostras identificadas, áreas e incerteza de segmentação.
- Atenção: EBSD de cobre policristalino **não equivale automaticamente** ao estado de trabalho/encruamento de cabos ou enrolamentos elétricos ilustrados no atlas.

## 3. Ni — comparação independente após Cu

**Fonte:** Berners et al., *EBSD maps for pure Nickel obtained with the Clarity Timepix 2 detector applying energy filtering*.

- Registro: https://zenodo.org/records/21870683, DOI `10.5281/zenodo.21870683`.
- Material: **Ni puro**. Quatro aquisições EBSD, com 10/20 kV e filtros distintos; não interpretar os quatro arquivos como quatro composições metálicas.
- `material_metadata.yaml` — 599 bytes, MD5 `2b5006931f77d59784de7fb661a29d21`.
- `Ni_10kv.oh5` — 1,6 GB, MD5 `7a903af9fe5d846aee55dfc29b662c11`.
- `Ni_10kv_THL360.oh5` — 1,6 GB, MD5 `008318f0092ab486c70da73d1b9edf0d`.
- `Ni_20kv.oh5` — 5,6 GB, MD5 `15c1339bcd6fdf07f43d128f25a20d6f`.
- `Ni_20kv_THL217.oh5` — 1,6 GB, MD5 `4a23e603d84b130c9d46ae6f13af89f1`.
- `preview.jpg` — 66,9 kB, arquivo de referência visual, **não substitui** o mapa calibrado.
- **Plano:** inspecionar metadados/YAML e prévia primeiro, depois escolher **uma** aquisição de 1,6 GB. Não colocar GB de EBSD na PWA, no `main` ou em workflow obrigatório a cada commit.
- Reutilização de imagens e máscaras depende de licença exata confirmada e compatibilidade com as condições de redistribuição do projeto.

## 4. Controle científico e jurídico

- Os MD5 acima foram transcritos da página do repositório, **não recalculados pelo SILM**.
- Indicação `Open` no Zenodo assegura acesso ao registro, mas **não substitui** auditoria do campo de licença por arquivo/registro. O rodapé web consultado não exibiu uma licença textual inequívoca, portanto o uso no projeto permanece **pendente**.
- Os pesquisadores originais forneceram dados de condições específicas, **não um atlas universal de microestruturas dos elementos**.
- A leitura de grãos via EBSD mede orientações e regiões em mapa; EDS composicional, fração de fase e propriedades físicas exigem fundamentos e medição adicionais.
- Nunca transformar um diâmetro equivalente em `% de um elemento` ou usar contraste de imagem para atribuir teor químico.
- Em PWA, publicar somente pequenos arquivos derivados com procedência, dimensões, unidades, licença e autorização confirmadas; oferecer link para dados originais.

## 5. Critérios de saída desta fase

A passagem para o gerador `estatisticamente fundamentado` só ocorrerá depois de:
- registros de amostra, lote/condição e classificação de fase/metal completos;
- dados de 1–2 amostras com MD5, licenças e unidades realmente verificados;
- extração reexecutável de quantis e distribuições com política de borda;
- comparação da estatística com texto/metodologia da publicação;
- erro, incerteza, amostragem e limites de validade explicitados;
- submissão de artefato para revisão e testes de regressão científica;
- nenhuma reivindicação de correspondência com todos os itens do atlas sem evidência amostral.

**Próximo produto:** relatório de auditoria de `AZ31_ML.xlsx` e `Mg1Al_ML.xlsx`; só após os dados reais serem lidos, calcular estatísticas do SILM.
