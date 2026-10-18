# SILM 0.11.0 — Representação 2D científica

**Origem executável:** SILM 0.10.1 (`entregas/SILM-0.10.1.zip`, SHA-512 `203a49c7bcb9eb486923626352eef6005ef0820e299754d4868796d947b55ea76d49e33506e00f9f1591e96206ed38e02bca53e5c8e8eac3a35e978a7f56e453`), sobre a Base Estrutural 0.3.1 sem alteração local.

**Série:** 0.11.x, a representação 2D (prompt `SILM_0.11.x_REPRESENTACAO_2D_CIENTIFICA.md`). Esta versão não cria ciência nova: nenhum dado e nenhum cálculo científico mudou, e o `scientificState` continua no schema 8.

## O que muda para quem usa

- **Um só jeito de desenhar a cena.** Montagem livre, estrutura cristalina e comparação usam o mesmo palco (renderizador comum), em Explorar, Medir e Calcular.
- **Controles da vista** no canto superior direito da cena:
  - Aproximar (+) e Afastar (−), com o valor do zoom;
  - Enquadrar a estrutura (F), Centralizar (C) e Restaurar vista (0).
  - Arraste o fundo para deslocar; no celular, use dois dedos para aproximar; no computador, Ctrl ou ⌘ + roda aproxima no cursor; Shift + setas também deslocam.
  - No celular e com a tela deitada, a barra fica recolhida atrás do botão "Vista", como "Doses" no SIAB, para não cobrir a cena.
- **Projeções** na estrutura cristalina: Isométrica, Frontal, Superior e Lateral. Ficam no cabeçalho da cena e em Ver → Observar → Camadas.
  - Na projeção Superior, o HC aparece como hexágono, com a camada B entre os centros da camada A; ele deixa de parecer um cubo deformado.
- **A vista nunca muda a ciência:**
  - a mesma medição dá o mesmo valor com 50 %, 100 % ou 200 % de zoom e em qualquer projeção;
  - o Organizar e a condução térmica são idênticos aos da 0.10.1.
- **Toque mais fácil:** um toque até cerca de 22 px da borda de uma unidade a seleciona. Antes, as unidades tinham de 20 a 35 px no celular e era preciso acertá-las.
- **Seleção sempre visível:** o anel tracejado fica numa camada própria, acima de todas as esferas. Antes, na estrutura cristalina, ele podia ficar atrás de outra esfera.
- **Rótulos e cotas com tamanho de tela constante:** não crescem nem encolhem com o zoom, e o valor da medição se afasta dos marcadores A, B e C.
- **Rede extensa em janela:** mostra a continuidade do sólido em torno da área visível, com até 260 sítios.
- **Comparação:** usa a mesma cena da vista principal, na mesma projeção, agora com os planos do HC.
- **Leitura simples reduz o movimento**, como no SIAB: câmera sem transição e elétrons estáticos.
- A vista escolhida (projeção e câmera) volta ao recarregar e começa do padrão numa investigação nova.

## Paridade com a família (SIAB)

O SIAB não tem câmera, então a família não tinha um precedente. O SILM criou os controles na gramática do SIAB:

- **Barra presa à representação**, no canto da cena, como a barra da lupa, com botões de 44 px.
- **Gestos com limiar entre toque e arrasto**, como o conta-gotas.
- **Câmera fora do Desfazer.**
- **Um anúncio por gesto**, no formato "Contexto: estado."
- **Esc e foco em camadas**, como já existiam.
- **Movimento reduzido também com Leitura simples.**

Tudo ficou no domínio: o núcleo da Base não foi alterado.

## Correções que vieram junto

- Na 0.10.1, depois de medir e trocar para Calcular, a cota antiga aparecia no lugar de "d = 2r". Agora a medida em revisão fica só em Medir.
- A conversão do toque para a cena descontava a borda do palco errado (cerca de 1 px). Agora passa pela inversa exata da câmera.

## Decisões registradas

1. **Isométrica congelada.** O Organizar e o calor usam sempre a projeção isométrica de referência; as outras vistas são só apresentação. Se a projeção mudasse o pareamento ou os níveis de calor, ela estaria mudando o estado científico.
2. **Representação herdada do schema 8.** Vista Célula/Rede, célula, vizinhos, rótulos, unidade selecionada e visibilidade dos elétrons continuam no `scientificState`. Tirá-los dali exige o schema 9 e uma migração. Isso fica como dívida da representação, sem efeito científico; o `representationState` novo (projeção e câmera) é separado e versionado.
3. **Ordem das camadas.** A estrutura fica acima dos elétrons e das propriedades, ao contrário do exemplo do prompt. É a legibilidade da 0.6.x: elétrons entre os centros.
4. **Vistas quase ortogonais.** As projeções Frontal, Superior e Lateral têm uma leve inclinação, entre 5° e 18° conforme a estrutura, para que nenhum centro fique escondido atrás de outro. Os ângulos vieram de uma busca numérica sobre Fe, Cu e Mg.

Contratos e detalhes: `docs/CONTRATO-REPRESENTACAO-2D.md` e `docs/RENDERER-2D.md`.

## Regra de parada

Termina na SILM 0.11.0. A 0.12.0 não foi iniciada e não há renderizador 3D definitivo.
