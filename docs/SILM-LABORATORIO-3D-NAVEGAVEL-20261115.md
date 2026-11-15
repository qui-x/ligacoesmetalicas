# SILM — laboratório 3D navegável (prova de conceito)

## Fluxo integrado
Com uma investigação iniciada e o ambiente aberto, a ação **Sala 3D**
surge na barra da cena, sem substituir Montagem/Ver/Dados ou salvar outro
ScientificState. O espaço usa **WebGL2 nativo** (sem CDN, funciona offline).
WASD/mouse e controles de toque deslocam a câmera com colisões simples
contra paredes e bancada. E aproxima a inspeção; Fechar restaura foco.
A bancada contém prensa, amostra, microscópio, fonte, aquecedor e luz.

A carga em tração/compressão lê **SILM.specimenJ2.active** da main, 
não reimplementa sua lei constitutiva. Se não convergir, preserva a
amostra e informa o motivo. Calor propaga-se por diferença finita
**normalizada** e a corrente tem marcadores visuais; nenhum valor é 
grandeza dimensional nem condutividade do metal. Microscópio e Rede
utilizam os comandos reais das escalas 2/3 da investigação em andamento.

## Fora do escopo desta prova de conceito
- A amostra é prismática procedural: não há ainda GLB/PBR de cada objeto,
  malha FEM deformável de alta resolução, pinça/contato físicos nem EBSD.
- Calor e eletricidade na sala são representações relativas, não motor
  acoplado cientificamente à temperatura e ao campo do painel Ver.
- As geometrias instrumentais não são réplicas reais; movimento na sala
  não é simulação de corpos rígidos nem a física da metalurgia.
- A ponte mecânica \`mechanics-scene-bridge\` será associada após
  homologação de ambas as branches.
- WebGL2 indisponível -> sala não abre, e a interface anterior permanece.

## Testes e critérios
\`node --test tests/silm-lab3d-core.test.cjs\`.
Validar na PR: abertura sem metal, escolha de metal, retorno de foco,
tabulação/escape, ponte objeto→grãos→rede, comportamento touch,
Chromium/Firefox/WebKit, DPR, redução de movimento, CI e PWA offline.
Manter PR #172 (CPFEM) e PR #178 (remodelação das docas) intactos.
Sem merge na main até homologação.
