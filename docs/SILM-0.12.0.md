# SILM 0.12.0 — Representação 3D científica

**Origem executável:** SILM 0.11.0 (`entregas/SILM-0.11.0.zip`, SHA-512 `7ed190455e94784ebfd3242e541c4909e21cecd44ddd4ee25f75c8500c1e1454320f58f0e9519c338a7a21c408a4e3232da132e8be15dccbc3ce62b1e7ae7b92`), sobre a Base Estrutural 0.3.1 sem alteração local.

**Série:** 0.12.x, a representação 3D (prompt `SILM_0.12.x_REPRESENTACAO_3D_CIENTIFICA.md`). Esta versão não cria ciência nova: nenhum dado e nenhum cálculo científico mudou, e o `scientificState` continua no schema 8.

## O que muda para quem usa

- **Vista 3D da estrutura cristalina.** No seletor **Projeção** do cabeçalho da cena (e em Ver → Observar → Camadas), o grupo **3D** traz:
  - **3D livre**, que parte da mesma vista de referência do 2D;
  - **Plano XY** (de cima), **Plano XZ** (de frente) e **Plano YZ** (de lado), vistas exatas ao longo dos eixos.
- **Girar:** arraste a cena (no celular, com um dedo). Pelo teclado, **J** e **L** giram na horizontal, **I** e **K** na vertical. Os mesmos comandos estão na barra Controles da vista.
- **Deslocar e aproximar** como no 2D: Shift + arrastar, dois dedos, Ctrl/⌘ + roda, + e −, F (enquadrar), C (centralizar) e 0 (restaurar a orientação de referência).
- **Perspectiva ou ortográfica:** botão na barra (ou tecla **P**). Na perspectiva, o que está mais perto parece maior. Na ortográfica, arestas paralelas continuam paralelas e com o mesmo tamanho.
- **Eixos x, y e z** no canto da cena, só como referência visual. Não são a rede nem uma régua.
- **A mesma ciência:**
  - a seleção, os vizinhos, as medições e os cálculos são os mesmos objetos do 2D;
  - a mesma distância e o mesmo ângulo dão o mesmo valor no 2D, no 3D, girando e em qualquer projeção;
  - a condução térmica é idêntica, porque continua calculada na projeção isométrica de referência.
- **Elétrons** ficam ocultos enquanto a vista gira e voltam ao soltar. Não há elétrons "3D" à parte.
- **Comparação** em 3D usa a mesma orientação da vista principal.
- **Se o 3D falhar**, o SILM avisa e volta para a vista 2D científica, sem perder nada. Nessa sessão, as opções 3D ficam desativadas.
- A vista escolhida (2D ou 3D, orientação e projeção) volta ao recarregar. Uma investigação nova começa em 2D.
- A **montagem livre continua em 2D**: as posições dela são normalizadas e não têm coordenadas em ångström.

## Decisões registradas

1. **Sem WebGL nem motor 3D externo.** A câmera de órbita (`SILM.crystal.layout3D`) projeta as coordenadas científicas em Å para o mesmo renderizador comum da 0.11.x. As unidades continuam botões acessíveis, e a célula, a rede e os vizinhos continuam camadas SVG. Motivos:
   - precisão: a mesma geometria, sem reconstrução a partir de pixels;
   - manutenção: um só renderizador para 2D e 3D, sem motor por módulo;
   - acessibilidade: o foco, os nomes e a seleção são os da 0.11.x;
   - compatibilidade e peso: nenhuma dependência nova.

   O custo é a falta de sombreamento por pixel. Ele não é necessário para ler a estrutura, e o prompt pede para não importar motor pesado sem necessidade. Por isso não há perda de contexto WebGL a tratar. A falha possível é a da projeção, que volta ao 2D (teste 0.12-07).
2. **Escala estável na órbita.** A cena 3D é normalizada pela esfera que envolve a célula e as unidades. Girar nunca muda a escala, e a estrutura não "respira".
3. **Zoom e pan sobre a projeção.** A câmera 3D guarda a orientação (guinada e inclinação) e a projeção. O zoom e o deslocamento são a câmera 2D da 0.11.x aplicada à cena projetada. O alvo é sempre o centro da célula.
4. **Planos exatos.** XY, XZ e YZ são vistas ao longo dos eixos, sem a pequena inclinação das projeções 2D. Centros alinhados ficam um atrás do outro. Para vê-los, gire a vista ou esmaeça os centros em Camadas. A unidade da frente vence o toque.
5. **Elétrons sem quadro a quadro.** Refazer a distribuição a cada quadro da órbita seria caro e enganoso. Os marcadores somem durante o gesto e são redistribuídos ao soltar, sobre os centros projetados.
6. **Organizar e calor continuam na isométrica de referência**, como na 0.11.x. A vista nunca muda a experiência.

Contratos e detalhes: `docs/CONTRATO-REPRESENTACAO-3D.md` e `docs/RENDERER-3D.md`.

## Navegadores

Os testes rodam no Chromium, o único navegador instalado neste ambiente. Gecko e WebKit não estão disponíveis aqui, o que fica registrado como pendência de homologação para a 0.16.x. A vista 3D não usa recurso específico de navegador: são as mesmas camadas DOM e SVG do 2D.

## Regra de parada

Termina na SILM 0.12.0. Os Roteiros Experimentais definitivos ficam para a 0.13.x.
