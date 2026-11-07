# SILM — Contrato de responsividade das quatro escalas de investigação

Data de revisão: 07/11/2026. Referência: **Objeto → Grãos → Rede → Centro metálico**.

## Objetivo

Maximizar a área visual útil de cada etapa sem ocultar o material didático, prejudicar o acesso por teclado/toque ou quebrar o encadeamento de uma mesma investigação. O palco deve permanecer responsivo à largura real da janela, não apenas à proporção nominal do desenho.

## Regras de navegação

- **Quatro botões na mesma faixa superior em todas as escalas.** Nas larguras menores, usar rótulos curtos ("Objeto", "Grãos", "Rede", "Centro") sem esconder opções. Cada botão tem altura mínima de 44 px.
- **Identificar a escala por número (1, 2, 3 ou 4)** no palco. Não atribuir uma mesma chave genérica "context" a Objeto e Grãos: isso impedira o CSS de diferenciá-los.
- Mudar de escala não muda o elemento, o ensaio ativo ou o motor científico. Os controls do palco e das propriedades permanecem independentes.
- Em acessibilidade, manter nomes completos, estado `aria-pressed`, foco visível e contraste independente da paleta. Não depender de rolagem horizontal nos botões de escala.

## Ocupação visual por etapa

| Etapa | Área de observação | Controles e informações |
|---|---|---|
| **Objeto** | O objeto ilustrado cresce verticalmente para preencher o espaço disponível. Em telas largas, a área da figura ocupa a maior parte da largura do card; em retrato, figura acima das informações. | Dados, composição e fontes permanecem no contexto, acessíveis nos detalhes. No celular, reduzir textos repetidos, não a imagem. |
| **Grãos** | A grade vetorial responde à altura do palco; tamanho mínimo de segurança impede que a barra de ferramentas comprima a imagem a poucos pixels. Em janelas baixas, o conteúdo rola internamente. | Ferramentas na região inferior, com rolagem horizontal *apenas dentro* do grupo de botões se necessário; nunca reduzir alvos abaixo de 44 px. |
| **Rede** | Metadados passam a faixa superior compacta, com canvas científico ocupando o restante da cena. | Observação e navegação de células permanecem na faixa instrumental já estabelecida. |
| **Centro metálico** | A mesma área central da Rede permite o aprofundamento, sem um painel textual adicional consumindo a imagem. | Ferramentas de movimento do centro e propriedades permanecem vinculadas à mesma investigação. |

Em telas pequenas na horizontal, não é possível mostrar simultaneamente toda a imagem, todas as ações e todos os textos sem reduzir demais o desenho. Nessa situação, o conteúdo da etapa pode rolar dentro da própria área central, preservando a legibilidade e a interação.

## Cobertura automatizada

`tests/run-four-scales-responsive.mjs` testa **9 viewports × 4 escalas = 36 passagens por navegador**, para Chromium, Firefox e WebKit:

- 320×568, 390×844, 414×896, 844×390, 768×1024, 1024×768, 1366×768, 1440×900 e 1920×1080;
- largura global sem overflow; quatro botões e todos na mesma linha;
- altura dos botões ≥ 44 px; imagem macro identificada e carregada;
- mapa de grãos com dimensões mínimas e controles inferiores;
- visualização científica presente nas escalas Rede e Centro;
- continuidade do elemento selecionado (Cu no caso de regressão);
- captura das métricas reais e imagens de conferência por navegador como artefatos da execução.

Testes existentes de microestrutura e responsividade permanecem exigidos. As verificações de regressão não provam equivalência experimental dos grãos; medem apenas navegação e interface.

## Política de integração

Desenvolvimento isolado no PR #76. Só incorporar à `main` se os três navegadores passarem no novo contrato e as suítes existentes não apresentarem regressão. Depois, confirmar o deployment no GitHub Pages pelo hash do commit de publicação.
