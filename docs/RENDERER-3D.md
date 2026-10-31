# Renderizador 3D (SILM 0.12.x)

A vista 3D não é um segundo motor. É o renderizador 2D comum (`domain/silm/renderer-2d.js`) alimentado por outra projeção das mesmas coordenadas científicas. O núcleo da Base (`js/`) não foi alterado.

```text
coordenadas científicas (Å, SILM.crystal.geometry)
        ↓ câmera 3D: orientação (guinada, inclinação) em torno do centro da célula
        ↓ projeção: perspectiva (distância 3,2 raios) ou ortográfica
coordenadas da cena (0..1, escala estável pela esfera envolvente)
        ↓ câmera 2D da 0.11.x: zoom e deslocamento
palco → tela (px)
```

## Peças

| Peça | Arquivo | Papel |
|---|---|---|
| `SILM.crystal.layout3D(g, pontos, camera3D)` | `domain/silm/crystal.js` | Projeta Å na cena. Devolve `project(p) → {x, y, depth, size}`, `scale`, `radius`, `perspective` e `orientation` |
| `SILM.crystal.orientation3D(modelo, camera3D)` | idem | Orientação efetiva: ângulos da órbita, o preset XY/XZ/YZ ou a vista de referência da estrutura |
| `SILM.crystal.presets3D` | idem | XY = [0°, 90°], XZ = [0°, 0°], YZ = [−90°, 0°] |
| `createStage(…, {onOrbit, extraButtons})`, `setDragMode('orbit')` | `domain/silm/renderer-2d.js` | Arrastar gira; Shift + arrastar e dois dedos deslocam e aproximam; J L I K e os botões de girar |
| Vista cristalina em 3D | `domain/silm/crystal-view.js` | As mesmas unidades, a mesma célula, a mesma rede, os mesmos vizinhos e as mesmas sobreposições, com `layout3D` no lugar de `layoutFor` |
| Comparação | `domain/silm/exploration.js` (`renderSnapshot`, opção `camera3D`) | As duas cenas na orientação da vista principal |
| Estado de representação v2 | `domain/silm/representation.js` | `viewMode`, `camera3D` e a câmera `crystal3d` |

## Desenho

- **Unidades:** botões com posição, profundidade e escala da perspectiva (`--depth-scale` = fator da projeção, entre 0,5 e 1,7). A ordem de profundidade é dada por `z-index`, e a unidade selecionada fica por cima.
- **Célula, planos do HC, vizinhos e rede:** SVG do mundo. A rede extensa continua em janela, com no máximo 260 sítios (o "instancing" deste renderizador: um só elemento por sítio visível, reaproveitando a mesma folha de estilo).
- **Sobreposições** de medição, cálculo, rótulos, seleção e propriedades: as mesmas da 0.11.x, com os pontos projetados pela câmera 3D.
- **Eixos:** um SVG pequeno fora do palco, no canto inferior esquerdo da área da cena, `aria-hidden`. Os traços são diferentes (contínuo, tracejado e pontilhado) e há as letras x, y e z, para não depender de cor.

## Órbita

- 0,4° por pixel de arrasto. Arrastar para a direita traz a frente para a direita; para baixo, mostra mais o topo.
- A inclinação fica entre −90° e 90°. A guinada é guardada entre −180° e 180°.
- Durante o gesto, cada quadro só redesenha (via `requestAnimationFrame`), sem gravar. Desde a 0.15.4, os elétrons continuam visíveis e animados durante a órbita, acompanhando os centros projetados (na 0.12.0 eles ficavam ocultos). Ao soltar, a orientação é gravada e há um anúncio: "Vista 3D girada: 25° na horizontal, 20° na vertical."
- Teclas e botões dão passos de 24 px (9,6°), com gravação e anúncio a cada passo.
- O clique que o navegador gera ao fim do giro é descartado, como no deslocamento da 0.11.x.

## Escala e enquadramento

- A escala vem da esfera que envolve a célula e as unidades, com margem de 0,05. Na perspectiva, ela já considera o ponto mais próximo da câmera.
- A caixa de interesse da câmera 2D é fixa (0,08 a 0,92). Por isso Enquadrar devolve o zoom 100 % e girar nunca reenquadra.
- Trocar o preset (3D livre, XY, XZ, YZ) ou a vista Célula/Rede reenquadra.

## Desempenho e ciclo de vida

- A estrutura é recalculada só no gesto, a cada quadro do `requestAnimationFrame`, com no máximo um quadro pendente. Uma célula de 14 a 17 unidades com rede de até 260 sítios é redesenhada sem recriar elementos das unidades.
- Nada novo fica vivo fora do escopo da vista: o quadro pendente da órbita é cancelado na limpeza, e trocar 2D/3D refaz a vista no escopo dela. O teste 0.12-08 confere que alternar várias vezes não acumula recursos (`SimCore.scopeStats`).
- Celular: nenhuma sombra ou partícula extra. A rede, a densidade de elétrons e o laço de animação são os da 0.11.x, pausados com a aba oculta.

## Diagnóstico

- `SILM.representationState.camera3D` dá `{preset, projection, yaw, pitch, target}`.
- `SILM.debug = {fail3D: true}` força a falha da projeção 3D e serve só para o teste da volta ao 2D (0.12-07).
