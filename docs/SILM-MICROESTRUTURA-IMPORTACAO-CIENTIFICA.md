# SILM — Importação de microestrutura com rastreabilidade (etapa operacional 1)

**Escopo:** funcionalidade experimental no PR #73, sem alteração da `main`.

## Para que serve

O mapa vetorial da escala **Grãos** é didático, não um documento de uma amostra. Agora o usuário pode abrir **Dados** e importar um mapa de **contornos segmentados** com imagem de referência declarada, método de aquisição, identificação do material e, opcionalmente, calibração em µm/pixel.

O SILM só calcula grandezas geométricas da **segmentação fornecida**:
- área bidimensional da região em pixels²;
- área em µm² **se e somente se** o arquivo informar uma escala válida com referência;
- diâmetro de círculo de área equivalente (ECD, calculado no módulo para testes/futuro Medir, não confundido com tamanho médio de grão ASTM).

A importação **não** verifica se a bibliografia, contornos, imagens ou calibração informados são autênticos. Os dados aparecem como **não homologados** até revisão científica. Não exibe automaticamente teor elementar, composição, área percentual, fração de fase, número ASTM de tamanho de grão nem micrografia.

## Formato: `silm.microstructure-map.v1`

O arquivo é JSON, UTF-8, tamanho máximo de 1 MiB. Exemplo **fictício, exclusivamente para entender o formato** (os valores NÃO representam uma microestrutura real):

```json
{
  "schema": "silm.microstructure-map.v1",
  "id": "exemplo-sintetico-cu",
  "title": "Demonstração matemática sem material real",
  "materialAtomicNumber": 29,
  "material": "Cobre fictício (apenas exemplo)",
  "sourceKind": "literature-image",
  "source": {
    "citation": "Exemplo sintético didático; não é referência experimental",
    "url": "https://example.org/exemplo-ficticio",
    "acquisitionMethod": "Contornos fictícios para demonstração"
  },
  "image": {
    "widthPx": 100,
    "heightPx": 80,
    "micrometersPerPixel": 0.5,
    "calibrationReference": "Valor arbitrário para teste — não usar cientificamente"
  },
  "segmentation": {
    "method": "Traçado fictício em coordenadas de pixel"
  },
  "grains": [
    {
      "id": "g1",
      "vertices": [[10,10],[30,10],[30,20],[10,20]]
    }
  ]
}
```

**Resultado matemático do exemplo:** polígono retangular de 20×10 pixels = 200 px²; escala fictícia de 0,5 µm/pixel → 50 µm². A demonstração valida o cálculo, **não** a correspondência com um metal real.

### Regras para amostras reais

1. Selecionar no SILM o elemento de referência do conjunto (o `materialAtomicNumber` deve coincidir).
2. Inserir referência bibliográfica confiável, URL HTTPS e método (microscopia óptica, SEM, EBSD etc.).
3. Fornecer largura e altura da imagem **original**, não dimensões da tela. Os vértices dos contornos estão em coordenadas de pixel dessa imagem.
4. Registrar `micrometersPerPixel` apenas quando houver calibração documentada e método rastreável; caso contrário, omitir a propriedade e deixar a dimensão indisponível.
5. Informar metodologia de segmentação (manual/automatizada, parâmetro/critério, versão). Não afirmar precisão sem estimar erros.
6. Para um grão cortado pela borda do campo, sua área no quadro é apenas uma área **parcial**. A análise de tamanho médio necessita protocolo amostral próprio.
7. Não usar a cor de grão para atribuir composição ou fases sem dados independentes. Essa versão do contrato deliberadamente **não aceita campos de composição como medida automaticamente exibível**.

### Limites e trabalhos futuros

- O visualizador mostra **contornos vetoriais importados**, não a micrografia original, portanto o mapa ainda não substitui confronto com imagem microscópica calibrada.
- Não existe validação automática de contornos sobrepostos, auto-intersecções complexas, representatividade da amostra ou autenticidade da URL; o revisor científico deve fazê-lo.
- A primeira versão não tem arquivos de micrografia experimental incorporados ao SILM. A obtenção, os termos de licença, as fontes e as máscaras serão examinados antes de publicar exemplares reais.
- A operação mantém o mesmo estado experimental do SILM, não altera a rede, os ensaios ou as propriedades.

## Fontes científicas e metodológicas verificadas

1. ASTM E112-25e1, *Determining Average Grain Size*, https://store.astm.org/standards/e112 — determina tamanho **médio** por comparação, planimetria ou interceptos; não é equivalente ao tamanho individual de um contorno.
2. ASTM E1382-97(2023), *Determining Average Grain Size Using Semiautomatic and Automatic Image Analysis*, https://store.astm.org/standards/e1382 — exige atenção à calibração e representatividade; permite mensuração de áreas individuais sob procedimentos apropriados.
3. ASTM E562-19e1, *Determining Volume Fraction by Systematic Manual Point Count*, https://store.astm.org/standards/e562 — estimativa de **fração volumétrica** por amostragem de pontos; não mede teor de elementos.
4. Newbury & Ritchie (2019), *Electron-excited X-ray Microanalysis by Energy Dispersive Spectrometry at 50*, NIST, https://www.nist.gov/publications/electron-excited-x-ray-microanalysis-energy-dispersive-spectrometry-50-analytical — mapas quantitativos de composição por EDS, não inferidos por tons de metalografia.
5. Taufique et al. (2025), *Generalizable image segmentation for microstructure characterization through integrated SEM and EBSD analysis*, https://www.nature.com/articles/s41524-025-01801-4 — segmentação de grãos e estimativa de diâmetro equivalente com correlação SEM–EBSD.

## Fontes candidatas para amostras reais (integração NÃO aprovada)

- **Fraunhofer — Grain size classification round-robin dataset (2023):** https://fordatis.fraunhofer.de/handle/fordatis/321?locale=en — micrografias de aço avaliadas por especialistas; verificar unidade de escala, direitos de cada arquivo e contornos disponíveis.
- **Bachmann et al. (2026), Scientific Reports:** https://www.nature.com/articles/s41598-026-73141-2 e conjunto https://zenodo.org/records/19851246 — 5.327 recortes anotados de bainita e martensita; excelente para estudar classificações, **não implica** fronteiras de grãos calibradas nem teores de cada elemento.
- **Chaurasia et al. (2026), Data in Brief:** https://www.sciencedirect.com/science/article/pii/S2352340926003367 — 14.999 pares **sintéticos** de imagens para avaliação de algoritmos de detecção/reconstrução de contornos; adequados para teste de processamento de imagem, **não são medições reais de grãos**.

### Aceite da etapa atual

- [x] Rejeitar mapas com versões, polígonos, referências e escalas inválidas.
- [x] Área calculada a partir dos vértices, sem porcentagem de composição.
- [x] Falar explicitamente `dados importados não homologados`.
- [x] Restaurar esquema didático sem modificar estado científico.
- [ ] Validar visualmente nos três navegadores e nas resoluções de referência.
- [ ] Adicionar imagem experimental local e sobreposição controlada com contornos.
- [ ] Homologar ao menos um conjunto experimental com licença, fonte e segmentação verificada.
- [ ] Projetar contagem sistemática de pontos e tratamento de incertezas para fases identificadas.
- [ ] Integrar as ferramentas `Medir` e `Calcular` apenas quando as amostras estiverem qualificadas.
