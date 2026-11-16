# SILM · Etapa 86 — sala 3D, Joule + calor e iluminação observável

**Situação:** protótipo em PR #181, dependente da sala (#179) e da ponte mecânica (#180); sem integração à `main`. PR #172 (CPFEM) permanece intacto.

## Reuso científico sem dados inventados

A sala usa o **mesmo resolvedor discreto** `SILM.electrothermal.createRun` já presente no SILM. A entrada vem de `lab3d-electrothermal.js`, que cria um grafo **equivalente 1D** com 18 segmentos para um corpo de prova contínuo. Não é a rede cristalina medida ou o FEM térmico do objeto.

- Terminais com diferença de potencial relativa, `mode: 'voltage'`, nível 0–0,6. Corrente e potência Joule são calculadas pelo resolvedor; nenhuma é uma medida em A, V, Ω ou W.
- `external: true` acrescenta calor externo ao nó vizinho à extremidade esquerda. Corrente ligada causa dissipação Joule (mesmo sem aquecedor externo); ambas podem atuar simultaneamente na **mesma** equação de transporte discreto.
- `boundary: 'ambient'`: terminais mantidos na temperatura adimensional de referência; transporte e saída de energia são contabilizados separadamente.
- As saídas `potential`, `dissipation` e `temperature` do resolvedor são projetadas nas faixas da superfície J2. A conversão de temperatura para cor usa apenas amplificação visual monotônica `T/(0,08+T)`.
- A superfície deformada continua pertencendo ao motor J2 de pequenas deformações 2D. Não existe acoplamento FEM bidirecional entre essa deformação e o grafo 1D.
- O tempo relativo, potência Joule, calor armazenado, calor externo e calor removido aparecem em um `output` acessível. A cena não escreve nos registros do elemento nem no `ScientificState`.

### Condições da pesquisa

Os valores relativos da sala não substituem nem modificam as observações científicas do painel Dados. O programa mantém na pesquisa a temperatura, pressão, composição, pureza, fase, microestrutura e tipo de ensaio de **cada fonte original**. Não há conversão automática à CNTP nem atribuição dos coeficientes de cobre a outros metais.

### Aparência e iluminação

- A luminária local altera o termo de iluminação difusa e o destaque especular no shader WebGL. O material continua apenas *aproximado*, não uma BRDF/GGX espectral de metal real.
- Foram adicionados fuso, guias, cabeçote e pequenos detalhes instrumentais à prensa; ocular e objetiva ao microscópio; contatos à fonte.
- Sombras de contato são superfícies escuras fixas **ilustrativas**, não shadow mapping ou ray tracing. A geometria final PBR/GLB autoral continua pendente.
- O efeito visual de potencial e Joule é derivado da solução numérica, não um marcador piscante aleatório.

## Continuidade e segurança

Em `Microscópio → Microestrutura → Voltar à sala 3D`, a instância numérica pode permanecer apenas na memória da sessão para recuperar calor acumulado, energia Joule, carga J2, mapa e câmera. Mudar metal/investigação deve invalidar essa continuidade. Sair normalmente descarta a instância. Não é um registro experimental.

Se WebGL1/2 estiver indisponível, a sala não é criada, e o fluxo 2D original permanece disponível.

## Verificações

- `node --test tests/silm-lab3d-electrothermal.test.cjs`: rede 1D, Kirchhoff/potência, calor externo separado, Joule, desenergização, entrada inválida e ausência de dados materiais.
- `node tests/run-silm-lab3d-browser.mjs` com Playwright em Chromium, Firefox e WebKit: fontes, mapa, ida e retorno pelo microscópio, dados relativos, continuidade e inalterabilidade de estado científico.
- Acesso via CI `.github/workflows/silm-lab3d-preview.yml`. Homologação humana de aparência, responsividade e acessibilidade ainda requerida.

**Não mesclar na main enquanto #179/#180 e o fluxo Montagem/Ver/Dados não forem homologados.**
