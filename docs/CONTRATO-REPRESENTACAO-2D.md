# Contrato da representação 2D (SILM 0.11.x)

Este contrato vale para toda cena 2D do SILM: montagem livre, estrutura cristalina e comparação, em Explorar, Medir e Calcular.

## Quatro regras

```text
scientificState ≠ representationState
viewport scale ≠ physical scale
measurement overlay ≠ chemical bond
projection ≠ new scientific state
```

1. **Estado científico ≠ estado de representação.**
   - São representação: zoom, deslocamento (pan), projeção, modo de enquadramento, camadas visuais, seleção visual e sobreposições.
   - Mudar a representação nunca escreve no `scientificState`, não entra no Desfazer nem no Histórico da investigação e não muda o schema (continua 8).
2. **A escala da tela não é escala física.**
   - Aproximar ou afastar muda só a apresentação.
   - Medir e Calcular usam apenas as coordenadas científicas: Å na estrutura cristalina; posição normalizada na montagem livre, que não tem escala física e por isso não admite medida nem cálculo absolutos.
   - A mesma medição dá o mesmo valor com 50 %, 100 % e 200 % de zoom e em qualquer projeção. O teste 0.11-03 confere isso.
3. **A cota de medição não é ligação química.**
   - A linha de cota é tracejada e tem traços nas extremidades: é um instrumento.
   - A cena não tem nenhuma linha entre centros fora do contorno geométrico da célula (auditoria e testes 0.5-122, 0.6-x e 0.11-08).
4. **Projeção não é estado científico novo.**
   - Isométrica, Frontal, Superior e Lateral são vistas da mesma estrutura.
   - O Organizar (qual unidade vai para qual sítio) e a experiência de condução térmica usam sempre a projeção isométrica de referência, congelada desde a 0.5.x.
   - Trocar de vista nunca muda o estado nem a experiência. O teste 0.11-07 compara com a linha de base da 0.10.1.

## Coordenadas

```text
coordenadas científicas  (cristal: Å; montagem livre: posição normalizada 0..1)
        ↓ projeção (cristal) — X.layoutFor(g, célula + unidades, {margin: 0,12, projection})
coordenadas da cena      (0..1, estáveis: não dependem da tela, do zoom nem dos vizinhos)
        ↓ câmera {zoom, x, y} — v = (p − c) · zoom + 0,5
coordenadas do palco     (frações do palco quadrado)
        ↓ × lado do palco em px
coordenadas da tela (px)
```

- **Inversa:** p = (v − 0,5) / zoom + c. É usada no toque, no arrasto e no destino (`clientToScene`). O cálculo desconta a borda do palco (`clientLeft`/`clientTop`), o que corrige o erro de cerca de 1 px da 0.10.1.
- **Montagem livre:** a posição científica é a própria cena. Com a câmera padrão (identidade), nada muda em relação à 0.10.1.
- **Estrutura cristalina:** a cena é a célula mais as unidades, na projeção escolhida, com margem 0,12. Ligar os vizinhos, passar para a rede ou deformar a estrutura numa propriedade não muda a cena: quem enquadra é a câmera.

## Câmera

- `camera = {mode: 'fit' | 'free', zoom, x, y}`:
  - (x, y) é o ponto da cena no centro do palco;
  - zoom vai de 0,5 a 4.
- **Enquadrada** (`fit`): acompanha a caixa de interesse, com margem 0,12, ou 0,3 na rede. A caixa de interesse é:
  - no cristal: célula, unidades e vizinhos visíveis, com a deformação;
  - na montagem livre: a área de montagem inteira.
- **Livre** (`free`): depois de um gesto, botão ou tecla de zoom ou de pan.
- **O que reenquadra e o que não:**
  - trocar a projeção ou a vista Célula/Rede reenquadra;
  - mostrar vizinhos ou deformar mantém a câmera livre;
  - redimensionar a tela ou abrir o teclado virtual não move nada, porque a câmera está em unidades da cena.
- O pan é limitado: o centro da vista fica dentro da caixa de interesse, alargada pela vista.
- **Controles da vista:**
  - barra `role=toolbar` com os botões Aproximar, Afastar, Enquadrar a estrutura, Centralizar e Restaurar vista, e a saída do zoom;
  - botões de 44 px; a barra fica fora do palco no DOM, sobre o canto superior direito da cena;
  - teclas na área da cena: + − F C 0 e Shift + setas;
  - gestos: arrastar o fundo, pinça e Ctrl/⌘ + roda.
- **Anúncios:** um por gesto ou botão ("Vista: zoom 125 %.", "Vista enquadrada…", "Vista restaurada.", "Vista deslocada."), nunca um por quadro.

## Estado de representação (`representationState`)

- **Guardado em** `ctx.storage` com a chave `representation.view`:

  ```text
  {version: 1, investigationId, projection, cameras: {free, crystal}}
  ```

  O formato tem versão própria. Valores inválidos, de outra versão ou de outra investigação voltam ao padrão.
- **Volta ao padrão:** ao iniciar uma investigação ou uma montagem pronta. Ao encerrar a investigação, é apagado. Ao organizar, a câmera do cristal volta a "enquadrada".
- **Fachada de leitura `SILM.representationState`**, para testes e depuração:

  ```text
  {version, view, zoom, pan, camera, projection, layers, selection, overlays}
  ```

  Ela compõe o novo estado com a representação herdada do schema 8.
- **Herança do schema 8, que fica onde está nesta série:**
  - `structure.crystallography.representation`: vista, célula, vizinhos, rótulos e unidade selecionada;
  - `electrons.representation`: visibilidade e movimento.

  Tirá-los do estado científico exigiria o schema 9 e uma migração. Isso fica registrado como dívida da representação, sem efeito científico.

## Camadas

A ordem é central e fica em `SILM.renderer2d.LAYERS`. No CSS, cada camada tem um `z-index` próprio, de 1 a 11, sem `z-index` espalhado:

```text
background → lattice → unitCell → neighbors → electrons → properties → structure →
measurementOverlay → calculationOverlay → labels → selection
```

- **Diferença em relação ao exemplo do prompt:** a estrutura (centros) fica acima dos elétrons e das propriedades. Assim os centros continuam legíveis e os elétrons aparecem entre eles, como na 0.6.x.
- **Ordem dentro da camada da estrutura:** a profundidade decide, e a unidade selecionada sobe.
- **Seleção:** o anel tracejado fica na camada própria. A unidade selecionada nunca fica atrás de outra, defeito que existia na 0.10.1.

## Toque e seleção

- **Teste central** (`SILM.renderer2d.hit`): vale o item mais próximo dentro do próprio raio mais uma tolerância (4 px no mouse, 22 px no toque).
  - Desempate pela prioridade (a selecionada) e depois pela frente (menor profundidade).
  - Os botões das unidades continuam sendo a camada semântica e de foco.
- **Gestos:**
  - toque seleciona;
  - arrastar uma unidade a move (só na montagem livre, em Explorar);
  - arrastar o fundo desloca;
  - um toque no fundo, com uma unidade selecionada na montagem livre, leva a unidade até lá.

## Rede extensa, elétrons e propriedades

- **Rede:** é uma janela em torno da área visível, com esmaecimento a partir do centro da vista e no máximo 260 sítios. É refeita ao fim de cada gesto, não a cada quadro.
- **Elétrons:** os centros e os marcadores ficam em coordenadas da cena, e a câmera entra só no desenho. Aproximar ou deslocar não refaz a distribuição. Os limites acompanham a estrutura, incluindo a rede além da cena.
- **Propriedades:**
  - as setas de campo e de força ficam presas ao palco;
  - a faixa de calor e o alvo do feixe de luz acompanham a estrutura;
  - não há motor paralelo: os contratos da 0.7.x valem como antes.

## Acessibilidade

- O palco tem `aria-describedby` para uma descrição atualizada no lugar. Ela informa a projeção, a vista, a seleção, o zoom e que a escala visual não é escala física.
- Movimento reduzido vale também com Leitura simples, como no SIAB (`semMovimento`). Nesse caso a câmera muda sem transição e os elétrons ficam estáticos.
- Alto contraste e cores forçadas têm anel de seleção amarelo ou Highlight. Visão de cores segue o filtro global da Base.
