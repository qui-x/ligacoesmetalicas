# Renderizador 2D comum (SILM 0.11.x)

`domain/silm/renderer-2d.js` (`SILM.renderer2d`) é o palco único das cenas 2D. O núcleo da Base (`js/`) não foi alterado: tudo fica no domínio.

## Quem usa

| Cena | Arquivo | Modo |
|---|---|---|
| Montagem livre | `domain/silm/assembly-view.js` | interativo, câmera `free` |
| Estrutura cristalina | `domain/silm/crystal-view.js` | interativo, câmera `crystal`, projeções |
| Comparação (A e B) | `domain/silm/exploration.js` (`SILM.renderSnapshot`) | somente leitura (`readOnly`), sem ids, sem gestos |

As três desenham sobre o mesmo palco, com a mesma ordem de camadas e a mesma câmera. O que muda é o que se põe nas camadas e os controles.

## API

**Funções puras** (sem DOM):
- `toView(cam, p)`, `toScene(cam, v)`;
- `fit(bounds, margin)`, `zoomAt(cam, fator, âncora)`, `panBy(cam, dx, dy)`, `limit(cam, bounds)`;
- `boundsOf(pontos)`, `hit(itens, ponto, tolerância)`;
- a constante `LAYERS`.

**`createStage(stage, opções)`** devolve:

| Membro | Para quê |
|---|---|
| `layer(nome, elemento, {camera})` | Põe o elemento na posição da camada e, se for do mundo, aplica a câmera |
| `setInterest(caixa, {margin})` | Caixa de interesse (enquadrar acompanha em modo `fit`) |
| `setCamera`, `fit`, `zoomBy`, `center`, `reset` | Câmera (mesmo caminho dos botões) |
| `toView`, `toScene`, `clientToScene`, `sceneToClient`, `visible()` | Transformações e janela visível em coordenadas da cena |
| `selectionLayer()`, `labelsLayer()` | Anel de seleção e rótulos com tamanho de tela constante e sem colisão |
| `onCamera(fn)`, `onResize(fn)`, `describe()` | Repintar sobreposições, ajustar ao tamanho, atualizar a descrição |

**Opções de `createStage`:**
- `area`: onde fica a barra de câmera e de onde vem o tamanho do palco quadrado;
- `camera`: câmera inicial (`representationState`);
- `onCamera`: gravar ao fim do gesto;
- `items`: itens para o toque central;
- `onUnitTap`/`onUnitPress`: toque perto de uma unidade;
- `onBackgroundTap`: destino;
- `focusPoint`: Centralizar;
- `onReset`: Restaurar vista volta à projeção isométrica;
- `describe`: texto da cena para a camada semântica;
- `readOnly`: comparação.

**Diagnóstico para os testes:** `stage.silmRenderer`. Expõe `snapshot()`, `toClient`, `toScene`, `toView` e `setCamera`. O `setCamera` mexe só na representação, pelo mesmo caminho e com os mesmos limites dos botões.

## Como cada cena usa

**Estrutura cristalina**
- Recalcula a cena só quando o estado muda: layout estável, unidades, célula, vizinhos e caixa de interesse.
- A câmera repinta apenas as sobreposições do palco:
  - propriedades, medição, cálculo, rótulos e seleção;
  - o desenho dos elétrons.
- Ao fim do gesto (140 ms), refaz a janela da rede e os centros dos elétrons.

**Montagem livre**
- A posição científica é a cena.
- O arrasto, o destino e as teclas passam pela inversa da câmera.
- Enquadrar mostra a área de montagem inteira.

**Comparação**
- Usa a mesma cena da vista principal, na mesma projeção, com os planos do HC, a rede em janela, as propriedades e os elétrons estáticos.
- A câmera enquadra a cena, e não há laço de animação extra.

## Desempenho

- `model.state` é lido uma vez por desenho.
- A câmera muda só o `transform` das camadas do mundo e repinta as sobreposições, sem refazer a estrutura.
- A rede é limitada a 260 sítios e refeita ao fim do gesto.
- A densidade dos elétrons é a da 0.6.x, com laço só quando visível e animado, pausado com a aba oculta.
- O teste 0.11-14 confere que trocar de módulo e de vista várias vezes não acumula recursos (`SimCore.scopeStats`).
- Nenhuma otimização muda resultado científico.
