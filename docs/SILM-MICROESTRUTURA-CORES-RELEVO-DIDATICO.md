# SILM — visualização didática: cor, relevo e fundamento

**Publicação da experiência visual:** pacote isolado da pesquisa experimental, destinado à `main`.

## Experiência do estudante
A escala **Grãos** mantém a superfície de desenho em destaque, com gradientes suaves de claro/escuro e contornos realçados. A cor depende do elemento escolhido, mas **não é uma informação química medida**. Grãos continuam gerados geometricamente por Voronoi com semente reproduzível; não representam orientação, tamanho, composição ou frações de fase reais.

No painel **Dados**, o elemento exibe referência cristalográfica e estudos relacionados catalogados (67 entradas ligadas aos 65 elementos). A fonte é apresentada como contexto de investigação, não como parâmetro da tesselação. Arquivos segmentados importados seguem não homologados.

A linguagem de interface permanece deliberadamente objetiva: **“Grãos e tons ilustrativos; sem composição, fração de fase ou tamanho medidos.”** Qualquer metáfora usada na discussão criativa, inclusive a formulação “não é bem assim, mas é como podemos nos aproximar”, **não integra o produto**, por decisão de direção editorial.

## Política de cor para os 65

- **Cu, Ag e Au:** referência à aparência conhecida da forma metálica nativa, com link para ficha do elemento da Royal Society of Chemistry. Mesmo nesses casos, o metal pode apresentar alteração superficial e não abrange seus minerais e ligas.
- **Fe:** paleta terrosa **inspirada em minerais de ferro**, explicitamente **não** uma indicação da cor do ferro metálico ou presença de óxido na representação.
- **Demais elementos:** agrupamentos cromáticos **simbólicos** com ressalva visível na interface, não caracterização empírica das 61 aparências naturais, nem indicação de um mineral específico.
- A paleta **não codifica composição local por intensidade**, e suas variações entre polígonos servem exclusivamente à leitura da ilustração.
- Acessibilidade: contornos selecionados continuam identificáveis por traçado; alto contraste e cores forçadas suprimem os efeitos de relevo, preservando contrastes e foco.

A referência sobre a aparência metálica está na [RSC Periodic Table](https://periodic-table.rsc.org/) e sobre a diversidade das aparências minerais na [Utah Geological Survey — Mineral Identification](https://geology.utah.gov/map-pub/survey-notes/glad-you-asked/how-do-geologists-identify-minerals/). Nenhuma fonte única sustenta “cor padrão natural” invariável para cada elemento.

## Critérios de aceite

1. UI sem frases metafóricas de conversa ou promessas de reprodução da natureza.
2. Selecionar elemento altera apenas a paleta visual, sem interferir na estrutura cristalográfica ou propriedades.
3. Índices de 65/65 elementos com aparência identificada como nativa documentada, simbólica mineral ou simbólica neutra.
4. O desenho não calcula porcentagens de composição, tamanho ASTM ou parâmetros metalográficos a partir da paleta.
5. Painel mantém classificação D0 ou importado não homologado, com referências e advertências.
6. Desktop/celular, Chromium/Firefox/WebKit, temas e acessibilidade preservados.
7. `main` não recebe pesquisas experimentais de Cu/Mg/Al ou workflows de processamento TrueEBSD do PR de pesquisa #73; mantém separados os estágios de homologação.

O arquivo `domain/silm/microstructure-appearance.js` contém somente dados de exibição e fontes. Testes em `tests/microstructure-appearance.test.cjs` exigem rastreabilidade e ausência da frase de contexto na UI. A PWA utiliza `sw.js` com nova chave de cache.
