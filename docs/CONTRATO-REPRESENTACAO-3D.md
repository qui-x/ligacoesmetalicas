# Contrato da representação 3D (SILM 0.12.x)

Este contrato vale para a vista 3D da estrutura cristalina, em Explorar, Medir e Calcular, e para a comparação. Ele estende o `docs/CONTRATO-REPRESENTACAO-2D.md`, que continua valendo.

## Cinco regras

```text
2D ≠ novo scientificState
3D ≠ novo scientificState
camera ≠ scientificState
renderer lighting ≠ propriedade óptica real
measurement overlay ≠ chemical bond
```

1. **1 estado científico, 1 estrutura, várias representações.**
   - A vista 3D desenha a mesma estrutura (`structure.units`, sítios cristalográficos) a partir das coordenadas em Å de `SILM.crystal.geometry`.
   - Nunca existe uma estrutura 3D própria, e nada é reconstruído a partir de pixels 2D.
2. **Trocar 2D ↔ 3D não muda nada científico:** metal, estrutura, elétrons, propriedade, medições, cálculos e seleção. Os testes 0.12-01 e 0.12-04 comparam o `scientificState` inteiro antes e depois.
3. **A câmera não é ciência.**
   - Orientação, projeção, zoom e deslocamento ficam no `representationState`. Não entram no Desfazer nem no Histórico.
   - O schema continua 8.
4. **A iluminação é recurso gráfico.**
   - O degradê das esferas e o esmaecimento por profundidade só ajudam a ler a profundidade.
   - O brilho metálico continua sendo o da experiência de propriedades da 0.7.x, que não depende da vista.
5. **A cota de medição não é ligação.**
   - Não há barras M—M em 3D: só as arestas geométricas da célula, tracejadas.
   - Os vizinhos são destacados por contorno, como no 2D (teste 0.12-12: 12 vizinhos no CFC, nos dois modos).

## Estado de representação v2

```text
{version: 2, investigationId, viewMode: '2d' | '3d', projection,
 camera3D: {preset: '3d' | 'xy' | 'xz' | 'yz' | null, yaw, pitch, projection: 'perspective' | 'orthographic'},
 cameras: {free, crystal, crystal3d}}
```

- **Câmera 3D**, no sentido do prompt:
  - `target`: centro da célula;
  - `position`: alvo mais a distância (3,2 raios da esfera envolvente) na direção da orientação;
  - `zoom`: `cameras.crystal3d.zoom`;
  - `projection`: perspectiva ou ortográfica;
  - `orientation`: guinada e inclinação.
- **Preset:** com `yaw` e `pitch` nulos, vale o preset. "3D livre" parte da vista de referência da estrutura, a mesma da isométrica do 2D.
- **Migração:** a versão 1 (0.11.x) migra sem perda. A projeção e as câmeras ficam, e o modo começa em 2D (teste 0.12-11). Versões desconhecidas, valores inválidos ou outra investigação voltam ao padrão.
- **Fachada `SILM.representationState`:** acrescenta `viewMode` e `camera3D` (com a orientação efetiva).

## O que é compartilhado entre 2D e 3D

| Compartilhado | Não compartilhado |
|---|---|
| Metal, estrutura, seleção, vizinhos, propriedade ativa, medição e cálculo selecionados, camadas científicas (célula, rede, rótulos, elétrons, centros, indicações) | Câmera: zoom, deslocamento e orientação. O 2D e o 3D têm câmeras próprias (`crystal` e `crystal3d`) |

## Medir e Calcular

- Há um só `measurements[]` e um só `calculations[]`. Não existe `measurements3D`.
- Os valores vêm da geometria em Å, nunca da tela. A identidade `distance2D(A, B) = distance3D(A, B)` vale para distâncias, ângulos e parâmetros, também depois de girar e na ortográfica (teste 0.12-04).
- O 3D só destaca a geometria usada na fórmula, por exemplo o contato d = 2r na camada do Calcular.

## Projeções

| Vista | Orientação (guinada, inclinação) | Leitura |
|---|---|---|
| 3D livre | a de referência da estrutura (CCC −20°/16°, CFC −11°/17°, HC −10°/16°) | igual à isométrica do 2D, com profundidade |
| Plano XY | 0°, 90° | de cima, ao longo de z: no HC, o hexágono da base |
| Plano XZ | 0°, 0° | de frente, ao longo de y: no HC, as camadas A e B empilhadas |
| Plano YZ | −90°, 0° | de lado, ao longo de x |

- Na ortográfica, arestas paralelas têm o mesmo comprimento projetado. Na perspectiva, a aresta da frente é maior (teste 0.12-03).
- Os planos são exatos: centros alinhados com a direção de visão ficam sobrepostos. Para revelá-los, há a órbita, o esmaecimento dos centros (Camadas → Centros, a transparência controlada) e a seleção, que sempre fica por cima.

## Eixos e grade

- Os eixos x, y e z no canto são **referência visual**: ficam fora do palco, são `aria-hidden` e não são a rede cristalina.
- A descrição da cena diz isso por escrito.
- Não há grade de chão: ela poderia ser confundida com a rede.

## Toque, teclado e acessibilidade

- **Gestos:** um dedo ou o mouse gira; dois dedos, Shift + arrastar e Ctrl/⌘ + roda deslocam e aproximam; o toque seleciona (vale a unidade da frente).
- **Controles alternativos para tudo o que é essencial:** botões de girar, Perspectiva, Aproximar, Afastar, Enquadrar, Centralizar e Restaurar, com 44 px; teclas J L I K P + − F C 0.
- **Camada semântica:** as unidades continuam botões com nome. Só uma está no tab order (tabindex itinerante), e as setas percorrem as demais. A descrição da cena informa o modo 3D, a projeção, a orientação, a seleção, os vizinhos e que a escala visual não é escala física.
- **Movimento reduzido e Leitura simples:** a câmera muda sem transição e os elétrons ficam estáticos.
- **Alto contraste, cores forçadas e visão de cores** seguem a Base. Os eixos se distinguem pelo traço e pela letra.

## Falha

- Se a projeção 3D falhar, a vista volta ao 2D científico na hora. O usuário recebe o aviso "A vista 3D não está disponível…", e as opções 3D ficam desativadas nessa sessão.
- O estado científico não muda (teste 0.12-07).
- Como não há WebGL, não há perda de contexto a tratar.
