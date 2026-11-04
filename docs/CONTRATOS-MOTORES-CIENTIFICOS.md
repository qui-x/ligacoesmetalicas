# Contratos dos motores científicos — F1

> **Status:** F1 homologada — F1.1, F1.2, F1.3 e F1.4 concluídas no CI; sem alteração das regras científicas ou do schema 8.  
> **Baseline de código:** branch especificacoes-atuais, commit 73040ddfce0491cee81c9c430abff67471f4fce8 (F0 aprovado na execução 41737430380).  
> **Escopo:** identidade, evidência, aplicabilidade, entradas, saídas, unidades, estado, ciclo de vida e testes dos componentes científicos do Explorar.  
> **Regra:** preservar as APIs atuais por adaptadores durante a primeira migração; não alterar equações nem comportamento nesta fase.

## 1. Objetivo

Formalizar contratos explícitos para os componentes de domínio que participam do Explorar, evitando:
- confundir motor científico, controlador de fonte, renderer e catálogo;
- criar relógio independente para cada motor;
- misturar parâmetros normalizados com grandezas físicas;
- permitir que a interface decida sozinha a elegibilidade;
- duplicar estado já pertencente ao serviço científico;
- atribuir versão de algoritmo inexistente com base apenas na versão do produto.

Este documento complementa MOTOR-CIENTIFICO.md e orienta F1 do PLANO-IMPLEMENTACAO-EXPLORAR.md.

## 2. Taxonomia dos componentes

Nem todo componente que participa da cena é um motor científico dinâmico.

| Classe | Componente atual | Responsabilidade |
|---|---|---|
| Núcleo puro/determinístico | domain/silm/crystal.js | Elegibilidade, geometria cristalográfica, sítios, vizinhança, projeções e organização geométrica. |
| Motor dinâmico qualitativo | domain/silm/thermal.js | Evolução da distribuição térmica normalizada em um grafo. |
| Motor geométrico/dinâmico qualitativo | domain/silm/deformation.js | Sistemas de deslizamento, transformação geométrica, carga/strain transitórios e sequência visual de deformação. |
| Controlador de estímulo | domain/silm/drive.js | Intensidade elétrica, ângulo luminoso e campo auxiliar na deformação; valores transitórios. |
| Renderer de modelo | domain/silm/electron-view.js | Distribuição e animação de marcadores eletrônicos; não resolve transporte físico. |
| Catálogo e política de elegibilidade | domain/silm/properties.js | IDs de propriedades, defaults, limites didáticos, condições, motivos, disponibilidade e narrativas. |
| Fonte de dados/proveniência | domain/silm/data-api.js | Acesso imutável a elementos e fontes do banco. |
| Serviço de medição | domain/silm/measurements.js | Medidas do modelo a partir de sítios científicos, instrumentos virtuais e validação. |
| Serviço de cálculo | domain/silm/calculations.js | Fórmulas, entradas, origens, constantes, dependências e validação. |
| Adaptador de experiência | integracao/metallic-experience.js | Liga controles e apresentação ao domínio, sem ser proprietário da física. |
| Orquestrador futuro | ainda não existe | Coordena ciclo de vida, relógio comum, acoplamentos e publicação de snapshots. |

A classe determina o contrato aplicável. Renderer não recebe obrigação de calcular uma grandeza física; catálogo não ganha um loop temporal; núcleo geométrico não precisa de requestAnimationFrame.

## 3. Identidade e versão

Todo componente que publique resultado científico deverá declarar:

| Campo | Contrato |
|---|---|
| id | Identificador estável, único no SILM. |
| name | Nome legível e inequívoco do modelo/fenômeno. |
| algorithmVersion | Versão do algoritmo ou da regra científica; muda quando a semântica do resultado muda. |
| implementationRevision | Commit/build que contém a implementação, quando conhecido. |
| evidenceClass | QUALITATIVE, GEOMETRIC, MODEL_MEASUREMENT, CALCULATED ou classe física quantitativa definida no catálogo. |
| status | experimental, available, deprecated ou unavailable conforme o registro. |
| applicability | Metais/dados, estruturas, fase, faixas de temperatura/pressão e demais condições. |
| sources | IDs das fontes e das entradas de dados efetivamente usadas. |

A versão do pacote SILM (atual 0.15.5 no package.json desta branch) não é versão de algoritmo. A versão do estado científico (schema 8) também não é versão de motor.

### 3.1 Versões atuais e lacunas

| Componente | Versão identificável na partida | Situação |
|---|---|---|
| Estado científico | schemaVersion 8 | Contrato já versionado, independente. |
| Estrutura cristalina | structure.modelVersion 2 | Versão do modelo de estrutura já persistida. |
| Modelo eletrônico no estado | electronModel.modelVersion 1 | Identifica modelo de estado/representação, não versão do renderer. |
| Propriedades | properties.modelVersion 1 | Versiona configuração/dados de propriedades no estado; não versiona cada algoritmo. |
| Geometria de crystal.js | não declarada como versão independente | F1 deve propor identificador e versão depois de fixtures de baseline. |
| thermal.js | D=.45, DT=1/120, SETTLE=.01; sem algorithmVersion isolada | Parâmetros de implementação não substituem versão formal. |
| deformation.js | sistemas FCC/BCC/HCP e constantes didáticas; sem algorithmVersion isolada | Declarar versão separada antes de mudar resultados. |
| drive.js | controlador com faixa de intensidade/ângulo; sem versão de modelo | Versão deve identificar semântica do controlador, não da física. |
| electron-view.js | limites e fatores qualitativos explícitos; sem rendererVersion isolada | Separar versão visual da versão de qualquer modelo eletrônico. |
| Medir | tipos e contratos fixos no serviço; registros com ID | Manter unidade e origem em cada registro. |
| Calcular | catálogo de fórmulas e constantes; registros com ID | Versão da fórmula/método deve ser recuperável para resultados arquivados. |

Não atribuir agora um número artificial a algoritmos existentes. Antes de implementar, F1 deve congelar a descrição de comportamento e criar testes de referência; depois escolher a primeira versão formal e registrá-la no descritor.

## 4. Contrato conceitual comum

O contrato comum cobre a semântica compartilhada, não exige que todas as classes tenham os mesmos métodos.

### 4.1 Metadados obrigatórios

Cada componente declara:
- identidade e versão;
- classe e nível de evidência;
- pré-condições e elegibilidade;
- entradas e respectivas origens;
- saídas e respectivas unidades/classificação;
- estado próprio e proprietário;
- dependências e relações causais;
- condições de validade;
- comportamento quando indisponível;
- testes de referência.

### 4.2 Capacidades opcionais

| Capacidade | Quando se aplica |
|---|---|
| validate(input, context) | Todos os serviços e motores. |
| initialize(input, context) | Motores com estado transitório. |
| step(dt, inputs, context) | Motores com evolução temporal comandada pelo orquestrador. |
| observe(context) | Motor que expõe leitura/snapshot científico ou didático. |
| reset(context) | Motor com estado mutável reinicializável. |
| dispose() | Recursos transitórios, listeners, buffers ou workers. |
| compute(input, context) | Núcleos puros e serviços de cálculo/medição. |
| render(snapshot, view) | Renderers, fora do contrato científico. |

A interface comum de domínio não deve ser implementada como uma classe-base que obrigue capacidades inúteis. O registro de capacidades e adaptadores tipados é preferível a métodos vazios.

### 4.3 Resposta e erro

As operações de domínio devem retornar resultados tipados, com sucesso ou motivo estruturado. Entrada inválida ou contexto não elegível não deve produzir estado parcialmente atualizado.

Um resultado numérico deve, quando aplicável, informar:
- value;
- unit;
- evidenceClass;
- origin;
- modelId e algorithmVersion;
- sourceIds;
- validity/conditions;
- tolerances ou incerteza, apenas se definidas pelo método.

Não usar texto formatado da interface como dado de entrada ou saída científica.

## 5. Contratos por componente

### 5.1 crystal.js — núcleo geométrico

**Tipo:** serviço puro/determinístico, sem ciclo temporal e sem acesso ao DOM.

**API observada:** SILM.crystal expõe models, eligibility(element), geometry(element), projector/layout, organize, expandSites, matchesBasis, key, label, layoutFor, layout3D e funções de projeção.

**Entrada canônica:** registro imutável de elemento e estrutura cristalográfica já validado no banco: tipo, grupo espacial, parâmetros de rede, sítios, operações de simetria e fonte.

**Saídas:** elegibilidade com motivo, modelo geométrico, vetores, sítios, vizinhança, coordenadas cartesianas e projeções.

**Unidades:** geometria cristalográfica de domínio utiliza Å nos comprimentos; coordenadas de tela normalizadas são representação e não podem entrar em medidas físicas.

**Proprietário:** serviço geométrico. O estado científico persiste referência/estrutura e unidades organizadas; renderer não recalcula nem redefine a fonte.

**Erros:** estrutura ausente, dados incompletos, conflito entre sistema/grupo/parâmetros, fase incompatível ou modelo não suportado.

**Testes de referência:** simetria, contagem da base, grupo espacial, distâncias, volume, origem, coordenadas, vizinhanças, estruturas gerais e invariância sob projeção/câmera.

### 5.2 thermal.js — motor térmico qualitativo atual

**Tipo:** motor dinâmico qualitativo com controlador próprio na implementação atual.

**API observada:** thermal.graph, step, spread, sum, level e controller(model). O controlador expõe subscribe, sync, setGraph, setPinned, setSource, reset, setHeating, temperature(s), reading e pinned.

**Entradas atuais:** grafo de vizinhos, posições de centros sob a fonte, ativação térmica ou aquecimento auxiliar durante experiência elétrica, geometria e passo nominal.

**Saídas atuais:** campo local normalizado, média, dispersão, fração aquecida, uniformidade, saturação e região fixada sob a fonte.

**Propriedade didática:** D=.45; DT=1/120 s; SETTLE=.01; estado de temperatura entre 0 e 1. A fonte atual fixa os centros selecionados em 1. Não existem perdas ambientais ou capacidade térmica por metal.

**Proprietário:** thermal.js é proprietário do campo de temperatura qualitativo. No futuro orquestrador, o campo será produzido uma vez por passo e publicado como snapshot.

**Não pode declarar:** °C, K, W, J, W/m·K ou difusividade real nesta versão.

**Testes de referência:** grafo simétrico, equilíbrio, conservação da soma no sistema fechado sem fonte, propagação, estabilidade, limite [0,1] e resposta antes/depois da fonte.

**Fora do F1:** mudar D, introduzir fonte física finita, capacidade térmica ou perda ambiental.

### 5.3 deformation.js — transformação mecânica qualitativa

**Tipo:** motor geométrico e transitório qualitativo; contém cálculo puro de sistemas/transformação e controlador de animação/carga.

**API observada:** SYSTEMS, system, transform, staticTransform, controller, describe, steps, cameraBasis, specimen, inSlab, block e trace. O controlador expõe subscribe, sync, setLoad, pulse, transform, reading e load.

**Entradas:** geometria cristalográfica, estrutura suportada, experiência de maleabilidade/ductilidade, carga normalizada e parâmetros da propriedade.

**Saídas:** sistema representativo, vetor de Burgers derivado da rede, deslocamentos, strain visual, orientação, contagem de eventos de deslizamento e regime qualitativo.

**Limites atuais:** LIMIT=4; YIELD=.5; EPS_YIELD=.06; sistema representativo por família estrutural. Esses valores não são newtons, Pa, módulo elástico, CRSS ou ductilidade medida.

**Proprietário:** deformation.js mantém o estado transitório de carga, strain, velocidade, progresso e orientação; state.js permanece proprietário do estado persistente da propriedade e da contagem consolidada.

**Testes de referência:** ortogonalidade plano/direção, vetor na rede, magnitude, fator de Schmid ideal, ausência de sobreposição, deformação de forma, retorno elástico e consistência entre transformação estática/dinâmica.

**Fora do F1:** adicionar fratura, encruamento, curva tensão-deformação, CRSS real ou dependência térmica.

### 5.4 drive.js — controlador de estímulos

**Tipo:** controlador de entradas/atuadores transitórios; não é motor físico independente.

**API observada:** controller(model), reflect(theta), limites de intensidade e ângulo. O controlador oferece subscribe, sync, getters, setIntensity, setAngle, setDeformField e reading.

**Entradas:** comando da UI autorizado pelo domínio, contexto da experiência e parâmetros normalizados escolhidos pela pessoa.

**Saídas:** intensidade do campo, ângulo da lanterna e sinalizador de campo auxiliar na deformação.

**Limites atuais:** intensidade 0.05–1, ângulo de 5°–80°. Intensidade não representa tensão, campo em V/m, corrente ou potência. O ângulo é geométrico em relação à normal.

**Proprietário:** drive.js mantém parâmetros transitórios da fonte/estímulo. O estado persistente registra ativação da propriedade quando aplicável; a execução experimental futura deve registrar os parâmetros efetivamente usados.

**Testes de referência:** clamp, valores-limite, persistência apenas onde especificada, reset de deformField em troca de experiência e mesma intensidade entregue a ambos os modos de estrutura.

### 5.5 electron-view.js — renderer eletrônico

**Tipo:** renderer de partículas/marcadores, não solver de transporte.

**API observada:** createElectronLayer(stage, options), update, incorporate, resize, setCamera, running e diagnóstico silmElectrons usado por testes.

**Entradas de apresentação:** centros normalizados da cena, espaçamento, conectividade, visibilidade, movimento, estado de campo, intensidade didática, temperatura normalizada e defeitos normalizados.

**Saída:** canvas com marcadores e movimento visual. Não retorna corrente, velocidade de deriva física, mobilidade, resistividade, densidade de portadores ou distribuição quântica.

**Parâmetros de representação:** limites atuais de 24–150 marcadores e funções de espalhamento/deriva qualitativas em SILM.electronTransport. São regras visuais comuns aos metais, sem escala dimensional.

**Proprietário:** renderer possui posições, ângulos, semeadura visual e ciclo de desenho. Não escreve em scientificState, não avança relógio científico e não é persistido como resultado da experiência.

**Testes de referência:** limites de marcadores, seed/reconstrução visual quando aplicável, movimento reduzido, ciclo de vida, dispose, resize, visibilidade, ausência de escrita científica e invariância de medidas/cálculos sob mudança de câmera.

### 5.6 properties.js — catálogo científico e elegibilidade

**Tipo:** catálogo/política de domínio, não motor temporal.

**API observada:** ids, defaults, limits, catalog, reasons, phase, data, eligibility, deformer, compress, elongate, heat, heatSources, heatWord, narrative e fresh.

**Responsabilidade:** declarar propriedade, requisitos, elegibilidade, limites de representação, parâmetros persistentes e explicação da evidência/limitação.

**Não deve conter:** loops de simulação, requestAnimationFrame, integração numérica ou propriedade de uma variável transitória de motor.

**Contrato de elegibilidade:** o domínio responde se a propriedade pode iniciar e por quê. A UI apenas apresenta a resposta; esconder ferramenta não substitui validação no domínio.

**Migração:** extrair algoritmos para serviços específicos de forma gradual e preservar os IDs atuais e a forma do estado schema 8 durante F1.

### 5.7 data-api.js — dados imutáveis e fontes

**Tipo:** camada de consulta/proveniência.

**API observada:** get, source, sourceIds, reason, label, categoryLabel, structure e search, com dados congelados em memória.

**Responsabilidade:** resolver valores e fontes; não aplicar fórmula, inferir dado ausente ou escolher modelo por heurística visual.

**Requisitos:** revisão do dataset, identificação da fonte, condição, unidade e status de validação devem ser recuperáveis. Mudanças de dados devem ser versionadas separadamente de algoritmo.

### 5.8 measurements.js — serviço de medição

**Tipo:** serviço puro de cálculo geométrico de instrumento virtual e validação de MeasurementRecord.

**API observada:** types, round, compute, context, current, validate, siteRef e fractional.

**Entradas:** estrutura cristalina, sítios científicos, tipo de instrumento e unidade.

**Saídas:** valor de medida do modelo, unidade, resolução do instrumento virtual, pontos científicos, contexto da estrutura e origem MODEL_MEASUREMENT.

**Fronteira:** não acessa DOM nem relógio. state.js registra/remove os resultados por comandos addMeasurement/removeMeasurement/clearMeasurements.

**Regra:** resolução do instrumento não é incerteza experimental. Medida do modelo não é dado tabelado nem resultado do motor de Explorar.

### 5.9 calculations.js — serviço de cálculo

**Tipo:** serviço puro de fórmulas e validação de CalculationRecord.

**API observada:** formulas, constants, calculation.origins, quantities, inputs, conversions, convert, applicable, effective, effectiveFormula, tabulated, compute, validate, format, percent, sig, context e current.

**Entradas:** fórmula aplicável, valores com unidade/origem/referência, constantes validadas e geometria do modelo quando necessária.

**Saídas:** resultado, unidade, entradas, constantes, fontes, dependências e proveniência CALCULATED.

**Fronteira:** permanece serviço independente; state.js valida e registra addCalculation/removeCalculation/clearCalculations.

### 5.10 metallic-experience.js — adaptador

**Tipo:** adaptador de integração e apresentação.

**Responsabilidade:** traduz ações de UI em comandos já autorizados pelo domínio, conecta listeners, atualiza controles e descarta recursos quando a cena muda.

**Não pode:** guardar segunda cópia de scientificState, recalcular resultado científico, decidir elegibilidade fora do domínio ou avançar motor sem autoridade do orquestrador.

## 6. Proposta de catálogo de capacidades

O desenho de F1 deve registrar capacidades em metadados, por exemplo:

| Componente | validate | compute | initialize | step | observe | reset | dispose | render |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| crystal | Sim | Sim | Não | Não | Resultado puro | Não | Não | Não |
| thermal | Sim | Não | Sim | Sim | Sim | Sim | Sim | Não |
| deformation | Sim | Sim | Sim | Sim | Sim | Sim | Sim | Não |
| drive | Sim | Não | Sim | Não | reading | sync/reset conforme projeto | Sim | Não |
| electron-view | Sim | Não | Sim | ciclo visual próprio atual; futuro controlado pelo renderer | Diagnóstico de apresentação | reconstrução visual | Sim | Sim |
| properties | Sim | Não | Não | Não | metadata/narrative | defaults | Não | Não |
| data-api | Sim | consulta | Não | Não | Dados/fontes | Não | Não | Não |
| measurements | Sim | Sim | Não | Não | Registro | não aplicável | Não | Não |
| calculations | Sim | Sim | Não | Não | Registro | não aplicável | Não | Não |

A tabela é uma matriz de capacidades, não determinação de que todo método deva ser adicionado literalmente a cada objeto atual. O desenho técnico de implementação deve adaptar nomes e assinaturas às APIs JavaScript existentes.

## 7. Fronteiras de dados e unidades

1. Coordenadas cristalográficas e comprimentos de rede permanecem em Å nos serviços existentes.
2. Coordenadas normalizadas de tela são exclusivamente apresentação.
3. Temperatura 0–1 do modelo térmico atual não é kelvin ou Celsius.
4. Intensidade 0.05–1 não é campo em V/m, tensão ou corrente.
5. Carga 0–1, YIELD=.5 e EPS_YIELD=.06 são parâmetros didáticos, não tensão/deformação de ensaio.
6. Valores de entrada de fórmulas precisam declarar origem e unidade.
7. Quando um motor quantitativo futuro usar SI, conversões ocorrerão em fronteiras explícitas; não migrar silenciosamente os dados geométricos históricos.
8. Nenhum componente substitui dados ausentes por valores típicos.

## 8. Ordem de migração em F1

### F1.1 — Congelar assinaturas e fixtures

- [x] Registrar exports e métodos públicos atuais em `tests/engine-contracts.cjs`.
- [x] Criar testes de contrato sem refatorar a lógica; aprovados no CI F0.
- [x] Validar as fixtures em `tests/fixtures/engine-baseline.json` no CI [41740686034](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41740686034), no commit `73e3067c35fe85e4817c910430e4ec7b4f20afd4`.
- [x] Congelar geometria Cu/Fe/Mg/Mn, passo térmico, sistemas FCC/BCC/HCP, estímulos, fatores eletrônicos qualitativos e defaults/limites do catálogo.
- [x] Registrar a razão de vizinhança do Mg pela geometria de referência com seu parâmetro c/a; não impor a distância de HCP ideal.

### F1.2 — Definir descritores sem mover algoritmos

- [x] Criar o catálogo declarativo `domain/silm/engine-catalog.json`, sem alterar a ordem de carregamento dos scripts do navegador.
- [x] Registrar dez componentes com ID estável, classe, evidência, aplicabilidade, entradas/saídas, unidades, dependências, proprietário de estado, ciclo temporal, capacidades e política de falha.
- [x] Formalizar a primeira versão interna `0.1.0` para geometria, modelo térmico qualitativo, transformação mecânica qualitativa, controlador de estímulos, renderer e catálogo de propriedades, todos vinculados às fixtures F1.1.
- [x] Manter explicitamente sem versão formal o dataset, Medir, Calcular e adaptador enquanto faltarem revisões/fixtures próprias; não substituir lacunas pela versão do pacote.
- [x] Separar versão do pacote (0.15.5), schema científico (8), versões persistidas de modelos (2/1/1) e versões de componente.
- [x] Validar no CI a correspondência do catálogo com exports reais e fronteiras de estado/tempo via `tests/engine-catalog.cjs` — [execução 41742138978](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41742138978), sucesso.
- Não mover algoritmos nem alterar os registros de `scientificState`.

### F1.3 — Criar adaptadores de compatibilidade

- [x] Criar `domain/silm/engine-adapters.js` como resolvedor de APIs declaradas, sem substituir os módulos.
- [x] Gerar `domain/silm/engine-catalog.js` a partir do JSON canônico por `scripts/build-engine-catalog.cjs`; manter defer/load order explícita na entrada integrada.
- [x] Adaptar `integracao/metallic-experience.js` para resolver propriedades, térmico, deformação, estímulos, dados e cálculo pelo registry.
- [x] Preservar APIs públicas originais e devolver referências diretas; chamadas só são permitidas quando declaradas no catálogo.
- [x] Tratar componente/raiz/API ausente com erro estruturado; não copiar estado, persistir uma segunda versão ou decidir elegibilidade.
- [x] Validar 10 componentes, resolução, invocação, falhas e ausência de escrita duplicada em `tests/engine-adapters.cjs`.
- [x] Build, regressão, backup, acessibilidade, paridade, comparação e navegação aprovados na execução [41744291802](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41744291802), commit `bbf85176f03e05c2900ed488530c42615c8cacd0`.
- [x] Atualizar o pré-cache offline para 89 recursos e BUILD `7dbb78476ddc` conforme artefato gerado pelo mesmo build.

### F1.4 — Homologar F1

- [x] Comparar resultados pelos fixtures F1.1 após os adaptadores; a suíte `engine-fixtures` permaneceu verde.
- [x] Executar build, testes científicos e integração; `npm test` passou no CI F1.3.
- [x] Verificar schema 8, importação, exportação e Caderno; testes de rotas, backup/restauração e browser passaram.
- [x] Rejeitar mudança não explicada de resultado, unidade ou proveniência; nenhum algoritmo científico foi modificado neste incremento.

**Homologação F1:** execução [41744291802](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41744291802) em `bbf85176f03e05c2900ed488530c42615c8cacd0`, `completed / success`.

## 9. Testes de contrato de F1

### 9.1 Identidade

- IDs de componentes são estáveis e únicos.
- Versão do motor é distinta da versão do pacote e do schema de estado.
- Mudança de semântica exige alteração de algorithmVersion.
- rendererVersion não altera algoritmo científico.

### 9.2 Capacidade e responsabilidade

- Núcleo geométrico não cria relógio.
- Motor estático não implementa step vazio por obrigação.
- Controlador de estímulo não calcula transporte físico.
- Renderer não grava estado científico.
- Catálogo não executa simulação.
- Serviço de medição/cálculo não depende de DOM ou de ciclo de renderização.

### 9.3 Entradas e saídas

- Valores normalizados têm classificação e unidade normalizada/didática explícitas.
- Grandeza física requer unidade, origem, condição e aplicabilidade.
- Falta de dado produz indisponibilidade estruturada.
- Saídas possuem IDs/fontes recuperáveis quando persistidas.

### 9.4 Regressão

- Fixtures cristalográficas permanecem iguais.
- Distribuição térmica qualitativa permanece igual.
- Transformações mecânicas qualitativas permanecem equivalentes.
- Intensidade e ângulo mantêm os limites da versão atual.
- Renderer não altera medidas e cálculos.
- Medir/Calcular continuam operando apenas sobre seus contratos.

## 10. Arquivos previstos e restrições

| Arquivo | Ação proposta em F1 |
|---|---|
| domain/silm/crystal.js | Documentar assinatura e criar fixtures; não alterar algoritmo. |
| domain/silm/thermal.js | Descrever estado/transientes e testar API; não trocar integração temporal. |
| domain/silm/deformation.js | Descrever transformação/controlador e fixtures; não mudar limiar. |
| domain/silm/drive.js | Descrever contrato de parâmetros e clamp; preservar comportamento. |
| domain/silm/electron-view.js | Formalizar renderer; manter diagnóstico não mutável para testes. |
| domain/silm/properties.js | Formalizar catálogo/elegibilidade; não migrar algoritmo ainda. |
| domain/silm/data-api.js | Formalizar origem/revisão dos dados; sem alteração de valores. |
| domain/silm/measurements.js | Preservar serviço canônico e validar fronteira. |
| domain/silm/calculations.js | Preservar fórmulas e proveniência. |
| integracao/metallic-experience.js | Preservar papel de adaptador; não assumir orquestração ainda. |
| testes existentes | Acrescentar testes de contrato e fixtures, sem reescrever testes de física. |

Possíveis arquivos novos: um manifesto de descritores e fixtures de contrato. A localização e formato definitivos devem ser escolhidos após verificar o carregamento dos scripts e o pipeline de geração. Não criar um novo arquivo de domínio que exija ordem manual de carregamento sem testar build e entrada HTML.

## 11. Critérios de conclusão de F1

- [x] Todas as classes de componente estão corretamente identificadas.
- [x] Cada componente tem ID, evidência, aplicabilidade e fronteiras documentadas.
- [x] Versão do motor, versão do produto e schema do estado estão separadas.
- [x] APIs atuais estão congeladas por testes de contrato.
- [x] As capacidades opcionais não forçam motores estáticos a criar loop.
- [x] Renderer eletrônico está explicitamente fora do solver físico.
- [x] Medir e Calcular continuam independentes.
- [x] Nenhum estado duplicado ou elegibilidade paralela foi introduzido.
- [x] Fixtures comprovam preservação dos resultados qualitativos.
- [x] Build e suíte aplicável passam antes de iniciar F2.

## 12. Limites e próximo passo

F0 está aprovado (execução [41737430380](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41737430380)); F1.1 e F1.2 estão aprovadas nas execuções [41740686034](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41740686034) e [41742138978](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41742138978). F1.3 e F1.4 foram homologadas na execução [41744291802](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41744291802), commit `bbf85176f03e05c2900ed488530c42615c8cacd0`. Os dez componentes têm descritores e resolução compatível; dataset, Medir, Calcular e adaptador seguem sem versão formal de algoritmo, por não haver ainda revisões/fixtures científicas específicas. O adapter de integração não recebe versionamento científico.

**F1 está concluída.** A próxima fase é F2 — desenho e implementação incremental do relógio comum/orquestrador. Ela não pode começar com mudanças de equação ou parâmetros; primeiro deve especificar ordem de execução, passo fixo, pause/resume, dispose, visibilidade, movimento reduzido e política de erro.
