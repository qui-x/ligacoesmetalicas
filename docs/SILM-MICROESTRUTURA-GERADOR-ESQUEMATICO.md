# SILM — Gerador esquemático reprodutível (etapa 1)

**Status:** implementação em `design/silm-rede-ambiente-atomico-parte6`, PR #73. Não integrada à `main` antes da homologação.

## Finalidade

Permitir que estudantes e docentes comparem **configurações geométricas ilustrativas de grãos** sem que o SILM sugira resultados experimentais inexistentes. Esta etapa **não usa parâmetros físicos específicos** do metal selecionado. É uma ferramenta didática, não um gerador de metalografias reais.

## Interação

Na escala **Grãos**, usar o botão **Formações** da barra inferior. No diálogo:

- **Forma dos grãos:** `Equiaxial (esquemático)` ou `Alongado (esquemático)`.
- **Semente reproduzível:** inteiro de `0` a `4294967295`, inicialmente `139712`.
- **Gerar:** aplica exatamente a semente e o perfil informados.
- **Nova variação:** produz deterministicamente uma nova semente e a apresenta, para ser reproduzida posteriormente.
- **Padrão:** restaura o perfil equiaxial e a semente `139712`.
- **Fechar:** retorna à cena sem alterar a formação.

A mesma dupla **semente + perfil** produz os mesmos contornos (`silm-voronoi-v1`). O navegador guarda apenas essa preferência de visualização por elemento de referência no `localStorage`. Essa preferência não altera as propriedades, a investigação ou o banco científico.

## Como funciona

O gerador usa a tesselação de Voronoi com centros distribuídos numa malha com desvio pseudorrandômico controlado pela semente:

- `equiaxial`: 12 colunas × 8 linhas, com desvio limitado;
- `elongated`: 8 colunas × 12 linhas, produzindo células geometricamente mais alongadas na direção horizontal;
- área virtual fixa de `1000 × 620` unidades **sem dimensão física**;
- polígonos limitados às bordas da área virtual;
- a câmera adapta o **recorte central** ao viewport. Ela **não altera, não reamostra e não regenera** os polígonos por redimensionamento;
- zoom e deslocamento são operações puramente visuais;
- gerador e leitor de mapas externos usam a mesma cena, mas **não misturam os dados**.

A imagem pode ser parcialmente recortada em telas estreitas; isso não muda a geometria. Uma seleção que saia do campo visível continua pertencendo à mesma formação. O algoritmo geométrico não representa orientação cristalográfica, textura, fases, composição local, forma de solidificação, tamanho médio de grão, nem crescimento de grão.

## Distinção dos modos

| Característica | Formações esquemáticas | Mapa externo segmentado |
|---|---|---|
| Origem | `schematic`, `silm-voronoi-v1` | `experimental-image` ou `literature-image` **declarada** |
| Variações | Semente + perfil, reprodutíveis | Contornos do JSON importado |
| Tamanho físico | Indisponível | Só se houver escala informada, ainda não homologada |
| Porcentagem de fase/elemento | Indisponível | Indisponível na versão 1 |
| Zoom/redimensionamento | Não gera nova geometria | Não altera a segmentação |
| Propriedades do metal | Não inferidas | Não inferidas automaticamente |
| Ferramenta `Formações` | Disponível | Desabilitada; retornar ao esquema em `Dados` para utilizar |

## Testes de aceite

1. Repetir semente + perfil gera exatamente os mesmos contornos, inclusive depois de outras gerações.
2. Perfis mostram morfologias geometricamente distintas e mantêm cobertura do domínio, sem áreas degeneradas.
3. Nova semente gera variação observável; parâmetros inválidos são recusados.
4. Alterar dimensões da janela, zoom ou tema **não altera a formação** nem o estado científico.
5. Ao importar mapa segmentado, ferramentas de geração esquemática ficam indisponíveis; restaurar devolve a formação e a preferência anteriores.
6. Sem dados experimentais, não exibir percentuais, micrômetros ou alegações de concentração/fração de fase.
7. Controles acessíveis e visualização com proporções preservadas em desktop e mobile.
8. Homologação de Chromium, Firefox e WebKit via GitHub Actions; o aviso `ResizeObserver` já conhecido no WebKit deve ser registrado separadamente e não ser ignorado.

## Próxima etapa — dados científicos (não realizada aqui)

Realizar pesquisa aprofundada em bases de materiais e publicações experimentais. Selecionar amostras de diferentes metais, ligas, fases e rotas de fabricação, **após verificar** material, tratamento, escala, técnica de aquisição, licença e segmentação. Ajustar os perfis de geração somente quando houver distribuições estatísticas sustentadas por essas fontes; manter `esquemático` separado de `estatisticamente fundamentado`.

A integração de condições termo-mecânicas e evolução física da microestrutura exigirá modelos próprios, validação e critérios de aceitação adicionais.
