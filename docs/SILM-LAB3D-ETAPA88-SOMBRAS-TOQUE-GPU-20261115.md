# SILM · Etapa 88 — sombras de bancada, GPU e interação por toque

**Estado:** desenvolvimento experimental no PR #181, dependente da sala 3D (#179) e ponte mecânica (#180). O CPFEM #172 e a `main` permanecem fora do escopo.

## 1. Sombras de contato projetadas na bancada

Os anteriores paralelepípedos cinza-escuros de sombra foram substituídos por escurecimento suave **no fragment shader**, aplicado exclusivamente à face superior do tampo da bancada. Cinco focos analíticos representam, sem pretensão de ray tracing, a sombra da prensa, do microscópio, do aquecedor, da fonte elétrica e uma região local do corpo de prova deformado.

O módulo autoral `lab3d-visuals.js` projeta um ponto (x,y,z) até o plano `y=0.91` na reta entre a fonte de luz e o objeto. O tamanho aparente cresce com a altura. A sombra do cabeçote depende de sua altura real no cenário; **se a borda superior ficar fixa, a sombra do cabeçote deve permanecer fixa**. Uma quinta sombra localizada lê `surface.position(.75,.75,1)` do campo J2 e acompanha o deslocamento efetivamente calculado nessa região, sem criar deformação fictícia em z.

As sombras são funções gaussianas elípticas no plano xz, com intensidades estilizadas, sem oclusão geométrica real, autocontato, transparências ou material BRDF medido. Portanto, **não representam previsão fotométrica nem geometria de fissuras/deformação 3D**.

## 2. Malhas em cache na GPU

As superfícies 3D são `Float32Array` imutáveis por versão do campo, incluindo cilindros/volantes procedurais e patches J2.

- Antes, cada frame enviava `gl.bufferData` de todas as malhas, incluindo peças que não mudavam.
- Agora, o render usa `WeakMap<mesh,WebGLBuffer>` e cria cada buffer **uma única vez** por versão. O render só reenvia quando se altera a geometria/campo ou quando o cache é invalidado.
- Após alteração de carga, modo J2 ou mapa, `resetMeshes()` libera as alocações anteriores; no encerramento da sala, todos os buffers gráficos são descartados.
- Contador de uploads disponível na prévia como `data-mesh-uploads`, sem integração ao estado científico, para detectar uploads contínuos em teste E2E.

Não há estimativa de FPS garantida nem homologação de rendimento em dispositivos de baixo desempenho; WebGL1/2 continua com fallback seguro para a experiência 2D.

## 3. Touch emulado

O novo `tests/run-silm-lab3d-touch.mjs` usa Chromium emulado com `hasTouch=true`, viewport **390×844** e movimento reduzido. Ele percorre a investigação real de Cu, entra na sala 3D, toca diretamente na prensa, ajusta a carga, toca no aquecedor, ativa o calor e verifica um gesto de arrastar a câmera por eventos reais de toque do Chrome DevTools Protocol. O arrasto não deve abrir um instrumento indevidamente. O estado científico é comparado ao da entrada.

O teste não comprova desempenho em **Android físico, iPhone/iPad, Safari iOS**, diferentes gestos do sistema operacional, VoiceOver ou TalkBack, e tampouco permite declarar homologação de mobile.

## 4. Evidência e limites científicos

Não há novos dados materiais introduzidos nesta etapa. A deformação permanece no solver J2 de seção 2D; a eletricidade/calor continuam no resolvedor já existente aplicado à rede equivalente **1D relativa e didática** da amostra. A iluminação e a projeção das sombras são exclusivamente representações gráficas.

Dados científicos por metal devem permanecer ligados à condição **original** de medição, cálculo ou previsão (fase, T, P, composição, pureza, microestrutura e ensaio). A visualização não deve atribuir valores de um elemento a outro nem converter automaticamente para CNTP.

## 5. Portões da revisão

- Testes determinísticos `tests/silm-lab3d-visuals.test.cjs` e demais módulos de laboratório.
- Playwright em Chromium/WebGL2, WebKit/WebGL2 e fallback do Firefox sem WebGL.
- Teste exclusivo em Chromium móvel **emulado**; capturas no artefato `silm-lab3d-chromium`.
- Verificação do contador de uploads entre quadros estáveis; sem recarga contínua de malhas.
- Inspeção visual humana pendente, especialmente em telas menores e com alto contraste.

**PR #181 segue draft, sem merge na main.**
