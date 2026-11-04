# Arquitetura operacional do acoplamento multifísico do SILM

**Status:** especificação de arquitetura — não implementada  
**Escopo:** integração operacional das famílias elétrica (E), térmica (T), mecânica (M) e óptica (O).  
**Branch:** \`study/silm-coupled-properties-transport-20261104\`

> Esta especificação define contratos e responsabilidades para uma futura implementação. Ela não habilita novas combinações no simulador, não converte os motores didáticos atuais em solvers físicos e não declara resultados quantitativos.

## 1. Decisão arquitetural central

O SILM deverá evoluir para uma arquitetura com **uma experiência, uma amostra física de referência, uma geometria corrente e um relógio físico**, coordenados por um orquestrador. Cada domínio manterá seu próprio solver e poderá usar sua própria malha computacional. A troca entre domínios será explícita, versionada e validada.

A arquitetura terá cinco camadas:

1. **Interface de condições:** seleção de fenômenos e edição de entradas em um painel único.
2. **Definição da experiência:** amostra, material, geometria, dados, fontes e condições de contorno.
3. **Orquestração e acoplamentos:** grafo de dependências, ordem de solução, transferência de campos e convergência.
4. **Solvers por domínio:** E, T, M e O, cada um responsável pelas próprias equações e variáveis.
5. **Resultados e proveniência:** campos, observáveis, resíduos, limitações, dados usados e histórico de execução.

Nenhuma camada deve assumir responsabilidades da camada seguinte. A interface não calcula física; um controlador de animação não substitui um solver; o orquestrador não contém equações constitutivas; e o renderer não altera o estado físico aceito.

## 2. Diagnóstico do ponto de partida

A auditoria dos arquivos atuais indica a seguinte separação:

| Arquivo/API atual | Responsabilidade observada | Limite para o acoplamento físico |
|---|---|---|
| \`domain/silm/thermal.js\` | Difusão qualitativa em grafo de vizinhos, temperaturas normalizadas e fonte transitória | Não resolve condução macroscópica com unidades, propriedades térmicas por metal ou fronteiras experimentais |
| \`domain/silm/deformation.js\` | Orientação de ensaio, sistemas representativos de deslizamento e animação da deformação | Não resolve equilíbrio de corpo de prova, campos de tensão/deformação ou expansão térmica |
| \`domain/silm/drive.js\` | Intensidade elétrica e ângulo da lanterna como controles transitórios | Não resolve potencial, densidade de corrente, potência Joule ou óptica espectral |
| \`domain/silm/properties.js\` | Catálogo, elegibilidade, parâmetros didáticos e estado da propriedade ativa | O estado atual é centrado em uma propriedade ativa por vez e não é um estado multifísico comum |
| \`integracao/metallic-experience.js\` | Coordena ações e controladores existentes, inclusive combinações visuais | Não executa um solver acoplado, transferência entre malhas ou balanços físicos globais |

As APIs atualmente registradas incluem \`properties.eligibility-catalog\`, \`deformation.qualitative-slip\`, \`thermal.qualitative-diffusion\`, \`drive.stimulus-controller\` e \`data.reference-catalog\`. Elas devem continuar utilizáveis no modo didático durante a migração.

### 2.1 Consequência para a migração

O estado atual não deve ser substituído abruptamente. A implementação futura deverá introduzir um contrato de experiência multifísica ao lado dos contratos atuais e migrar os recursos gradualmente. Até que cada domínio tenha um solver e parâmetros homologados, a interface deverá identificar a execução como **qualitativa**.

### 2.2 Separação de escalas geométricas

A célula e a rede cristalina atuais representam a estrutura atômica em escala de ångströms. Elas não são, por si só, uma malha de corpo de prova macroscópico. A futura amostra física deverá possuir geometria e escala próprias; a estrutura cristalina poderá fornecer orientação, fase, simetria e informação microestrutural, sem que as posições ilustrativas da rede sejam tratadas como posições de um corpo de prova contínuo.

## 3. Modelo de dados: definição, execução e resultados

Três objetos independentes serão a fonte de verdade. Não misturar condições editáveis, estado transitório do solver e resultados aceitos.

### 3.1 Definição da experiência

Contém o que o usuário prescreveu e as referências necessárias para reproduzir a experiência:

- identificador e versão do schema;
- identidade da amostra, material, fase e orientação;
- geometria de referência e modelo de superfície;
- conjuntos de dados materiais e suas proveniências;
- controles e condições elétricas, térmicas, mecânicas e ópticas;
- fontes, contatos e condições de contorno;
- caminhos de acoplamento habilitados;
- regime temporal e nível de evidência solicitado.

A definição deve ser serializável, validável e independente do renderer. Alterar uma condição cria uma nova revisão da definição, mas não altera retroativamente um resultado já aceito.

### 3.2 Estado de execução

Contém o estado numérico atual da solução:

- tempo físico aceito e passo proposto;
- revisão da geometria e das malhas;
- campos de cada domínio;
- estado de cada solver;
- transferências realizadas;
- resíduos e métricas de convergência;
- estado da execução: preparada, em execução, convergida, rejeitada ou interrompida.

O estado transitório não deve ser salvo como se fosse uma condição inicial válida. Uma interrupção preserva o último passo aceito, não um passo parcialmente convergido.

### 3.3 Snapshot de resultados

Um snapshot é imutável e contém:

- revisão da definição e do estado de execução;
- instante e intervalo físico representados;
- observáveis derivados e seus campos de origem;
- unidades SI;
- balanços e resíduos por domínio;
- dados, versões de solver e parâmetros utilizados;
- nível de evidência e limitações;
- indicação explícita de convergência e aceitação.

Um resultado só é publicado como solução se o passo tiver sido aceito pelo orquestrador. Estados provisórios podem ser exibidos para depuração, mas não como resultados finais.

## 4. Contrato conceitual comum

O contrato abaixo é uma referência de desenho, não uma implementação pronta. Os nomes podem ser adaptados ao padrão real do repositório antes da codificação.

~~~ts
type DomainId = "electrical" | "thermal" | "mechanical" | "optical";
type EvidenceMode = "qualitative" | "parameterized" | "quantitative";
type RunStatus =
  | "draft"
  | "prepared"
  | "running"
  | "converged"
  | "rejected"
  | "interrupted";

interface DatasetRef {
  id: string;
  version: string;
  sourceId: string;
  status: "measured" | "calculated" | "fitted" | "didactic";
  validRange?: { min: number; max: number; unit: string };
  uncertainty?: { value: number; unit: string; method?: string };
}

interface SampleDefinition {
  id: string;
  materialId: string;
  phaseId: string;
  orientation?: [number, number, number];
  referenceTemperatureK: number;
  geometryId: string;
  surfaceModelId: string;
  microstructureModelId?: string;
}

interface ExperimentDefinition {
  schemaVersion: string;
  id: string;
  revision: number;
  sample: SampleDefinition;
  evidenceMode: EvidenceMode;
  electrical?: ElectricalConditions;
  thermal?: ThermalConditions;
  mechanical?: MechanicalConditions;
  optical?: OpticalConditions;
  boundaries: BoundaryConditions;
  contacts: ContactConditions[];
  coupling: CouplingPlan;
  time: TimeControl;
  datasets: Record<string, DatasetRef>;
}

interface GeometryRevision {
  id: string;
  parentId?: string;
  revision: number;
  coordinateUnit: "m";
  referenceGeometryId: string;
  currentGeometryId: string;
  surfaceGeometryId: string;
  displacementRevision?: string;
  topologyChanged: boolean;
}

interface DomainField {
  domain: DomainId;
  name: string;
  valuesRef: string;
  meshId: string;
  unit: string;
  time: number;
  geometryRevision: number;
  source: "solved" | "mapped" | "prescribed";
}

interface AcceptedRuntimeState {
  runId: string;
  status: RunStatus;
  timeAcceptedS: number;
  stepAccepted: number;
  geometry: GeometryRevision;
  fields: DomainField[];
  domainResiduals: Partial<Record<DomainId, ResidualReport>>;
  energyBalances: Partial<Record<DomainId, BalanceReport>>;
}

interface ResultSnapshot {
  id: string;
  definitionRevision: number;
  runId: string;
  timeS: number;
  accepted: true;
  converged: true;
  observables: ObservableResult[];
  fieldRefs: DomainField[];
  provenance: ResultProvenance;
  limitations: string[];
}
~~~

Os contratos de cada família são definidos nas seções seguintes. O tipo \`ResultSnapshot\` não deve aceitar \`accepted: true\` ou \`converged: true\` por simples configuração da interface: esses valores são produzidos pelo fluxo de validação do orquestrador.

## 5. Responsabilidade e propriedade dos dados por domínio

Cada domínio é o único responsável por produzir e validar seus campos primários. Outros domínios recebem os campos por contratos de leitura e transferência, nunca por acesso a variáveis internas de um controlador.

| Domínio | Entradas físicas principais | Campos/saídas de responsabilidade | Termos transferidos |
|---|---|---|---|
| E — elétrico DC | tensão ou corrente, terminais, contatos, \u03c3DC(T,\u03b5), geometria | potencial V, campo E, densidade J, corrente, potência terminal, q\u0307J | q\u0307J para T; dependência constitutiva em T e geometria atual |
| T — térmico | temperatura inicial, fontes Joule/óptica/externas, k, cp, \u03c1m, fronteiras | T, fluxo térmico, energia interna e potência de fronteira | T para E/M/O; energia e fluxo para balanços |
| M — mecânico | força/tensão ou deslocamento/deformação, apoios, C(T), \u03b1(T), leis de contato | u, \u03b5, \u03c3, reações, trabalho externo e dissipação | geometria atual para E/O; deformação para constituições dependentes |
| O — óptico | comprimento de onda/espectro, potência, ângulo, polarização, n e \u03ba ou \u03b5̃ | campo óptico ou solução espectral, R/A/Topt, potência absorvida e q\u0307opt | q\u0307opt para T; resposta espectral para resultados |

A temperatura, a deformação, a geometria e os contatos compartilhados devem ter uma única revisão de origem. Domínios não podem manter cópias independentes e conflitantes desses estados.

### 5.1 Entradas prescritas e resultados calculados

Uma tensão imposta não é o mesmo dado que uma tensão resultante de um circuito; força prescrita não é tensão mecânica resolvida; temperatura de fronteira não é temperatura interna; irradiância incidente não é potência absorvida. Cada variável deve indicar se é:

- condição prescrita;
- parâmetro constitutivo;
- variável de estado resolvida;
- observável derivado;
- dado de referência.

## 6. Contratos por solver

Cada solver implementará uma interface comum de ciclo de vida, mas manterá equações, malhas e variáveis próprias.

~~~ts
interface DomainSolver<TInput, TOutput> {
  readonly domain: DomainId;
  validate(input: TInput, context: SolverContext): ValidationReport;
  initialize(input: TInput, context: SolverContext): SolverState;
  solveStep(
    input: TInput,
    state: SolverState,
    context: SolverContext
  ): SolverStepResult<TOutput>;
  evaluateResidual(
    output: TOutput,
    context: SolverContext
  ): ResidualReport;
  commit(state: SolverState, step: SolverStepResult<TOutput>): SolverState;
  rollback(state: SolverState, lastAccepted: SolverState): SolverState;
}
~~~

Esse contrato estabelece responsabilidades mínimas. Não determina o método numérico: diferenças finitas, elementos finitos, volumes finitos, modelos de rede, óptica de filmes ou soluções harmônicas poderão ser usados conforme domínio e validação.

### 6.1 Solver elétrico

Deverá resolver o problema DC adotado, com escolha coerente entre controle de tensão/potencial e controle de corrente. Deve produzir J e potência Joule a partir da solução, além de contabilizar perdas de contato quando modeladas. A geometria e os terminais utilizados devem referenciar a mesma revisão geométrica.

### 6.2 Solver térmico

Deverá resolver condução e fontes com propriedades e condições homologadas. O modo de temperatura única é o padrão inicial. O TTM será outro regime explícito, com campos Te e Tl e acoplamento elétron-rede; não será um campo extra habilitado apenas por um checkbox.

### 6.3 Solver mecânico

Deverá resolver equilíbrio ou dinâmica conforme a experiência, com apoios e controle de carga declarados. A expansão térmica precisa ser distinguida da deformação mecânica prescrita. A saída deverá identificar deformação elástica, plástica, reações e trabalho, quando esses fenômenos forem habilitados.

### 6.4 Solver óptico

Deverá distinguir campo DC de campo óptico, modelar a resposta em frequência/comprimento de onda e utilizar parâmetros ópticos adequados à amostra. A primeira etapa poderá usar solução espectral simplificada ou modelo de filme validado; não se deve presumir necessidade imediata de um solver Maxwell 3D completo.

## 7. Grafo de acoplamentos e transferência de campos

O acoplamento não será inferido a partir de duas propriedades selecionadas. Será descrito por arestas explícitas entre produtores e consumidores de campos.

~~~ts
interface CouplingEdge {
  id: string;
  from: { domain: DomainId; field: string };
  to: { domain: DomainId; input: string };
  mechanismId: string;
  lawId: string;
  mappingId: string;
  requiredDatasets: string[];
  enabled: boolean;
  evidenceMode: EvidenceMode;
  validationId: string;
}

interface CouplingPlan {
  edges: CouplingEdge[];
  strategy: "staggered" | "iterative";
  convergenceProfileId: string;
  allowPartialResult: false;
}
~~~

Exemplos de arestas autorizáveis após validação:

| Origem → destino | Mecanismo | Transferência permitida |
|---|---|---|
| E → T | Aquecimento Joule | Distribuição volumétrica/superficial de potência, com unidade W/m³ ou W/m² |
| O → T | Absorção óptica | Perfil de potência absorvida, calculado sem duplicar perdas ópticas |
| T → E | Dependência elétrica com temperatura | Campo T ou Te/Tl para lei \u03c3DC(T,\u03b5) homologada |
| T → M | Expansão térmica e propriedades dependentes de T | Campo térmico para deformação térmica e constituição |
| M → E | Alteração de geometria/contato | Geometria e estado de contato revisados; não copiar deslocamentos sem atualizar a geometria de cálculo |
| M → O | Alteração da superfície | Superfície e normais locais; resposta intrínseca exige dados elasto-ópticos separados |
| T → O | Termorrefletância/índices dependentes de T | T para parâmetros ópticos validados em faixa declarada |

Uma aresta só será habilitada se lei, dados, faixa, unidades, operador de transferência e teste de validação existirem. O grafo deve rejeitar ciclos que não possuam estratégia iterativa e critérios de convergência.

### 7.1 Acoplamento fraco e forte

- **Sequencial (staggered):** adequado quando o erro causado pela troca em uma passagem for demonstravelmente pequeno. O fluxo resolve os domínios em ordem topológica e valida o erro de acoplamento.
- **Iterativo:** obrigatório quando a resposta de um domínio altera significativamente a condição de outro no mesmo passo. O orquestrador repete os domínios conectados, aplica relaxação quando necessária e verifica convergência.
- **Não convergido:** o passo é rejeitado. O estado aceito anterior permanece íntegro; não se exibe o último iterado como solução física.

## 8. Geometrias, malhas e operadores de transferência

**Uma geometria física não exige uma malha numérica única.** O domínio mecânico pode usar malha volumétrica; o térmico pode compartilhar essa malha ou usar outra; a corrente elétrica pode exigir refinamento em terminais/contatos; e a óptica pode exigir malha de superfície ou discretização espectral.

A arquitetura deverá manter:

1. geometria de referência imutável;
2. geometria corrente identificada por revisão;
3. malhas de domínio ligadas à geometria corrente;
4. operadores de transferência entre cada par de malhas;
5. registro da origem, destino, método e erro de transferência.

### 8.1 Tipos de transferência

- **Escalares intensivos** (por exemplo, temperatura): interpolar/projetar respeitando faixa, continuidade e balanço térmico associado.
- **Campos vetoriais/tensoriais** (deslocamento, fluxo, tensão): mapear componentes em bases e referenciais declarados; conferir orientação e unidades.
- **Fontes extensivas** (potência e energia): preservar a integral total entre malhas dentro de tolerância declarada.
- **Geometria/superfície:** transferir deslocamentos e atualizar posição, normal local, área e topologia quando aplicável.
- **Contatos:** preservar identificação das superfícies, estado de contato e leis de interface; a transferência não pode converter contato aberto em contato fechado sem cálculo.

Não existe um único interpolador universal. Cada operador deve declarar quais grandezas conserva, quais propriedades de regularidade mantém e qual erro admite.

### 8.2 Revisões geométricas

Um deslocamento aceito gera nova revisão geométrica. Todos os domínios que dependem da geometria devem declarar se:

- podem reutilizar a malha existente com atualização de coordenadas;
- precisam reconstruir ou remalhar;
- precisam recalcular terminais, contatos ou normais;
- ficam temporariamente indisponíveis por falta de suporte à mudança topológica.

Nenhum solver pode consumir silenciosamente uma geometria anterior depois que uma nova revisão foi aceita.

## 9. Relógio físico, escalas temporais e renderização

O relógio da simulação física não será derivado de \`requestAnimationFrame\`, da taxa de atualização do painel ou do tempo de renderização.

O controle temporal deverá distinguir:

- tempo físico da experiência;
- passo físico aceito;
- passo interno de cada solver;
- frequência ou domínio harmônico do solver óptico;
- janela/envelope do pulso, quando aplicável;
- tempo de atualização visual.

A visualização poderá interpolar entre snapshots aceitos. Redução de movimento deve alterar a animação, não a solução física ou o balanço de energia. Se o solver não conseguir acompanhar o renderer, a cena continua apresentando o último estado aceito.

Para regimes ultrarrápidos, o TTM e o acoplamento com óptica podem operar em escalas muito diferentes da mecânica quase-estática. O sincronizador deve transferir médias ou envelopes apenas quando a hipótese de escala separada for explicitada e validada.

## 10. Orquestrador: sequência de execução

O orquestrador será dono do ciclo de execução; não será dono das equações dos domínios.

1. **Preparar:** congelar uma revisão da definição e capturar referências de dados e parâmetros.
2. **Validar:** verificar elegibilidade, unidades, faixas, contatos, fronteiras e dados exigidos por cada aresta do grafo.
3. **Inicializar:** criar estados dos solvers, geometrias, malhas e operadores.
4. **Executar:** resolver os domínios na ordem definida; transferir somente os campos declarados.
5. **Iterar:** quando houver acoplamento forte, repetir o ciclo conectado até convergir.
6. **Auditar:** calcular resíduos e balanços independentes de E, T, M e O.
7. **Aceitar ou rejeitar:** só aceitar o passo se critérios locais, globais e de transferência forem satisfeitos.
8. **Publicar:** gerar snapshot imutável com proveniência completa.
9. **Renderizar:** atualizar cena e painel a partir dos resultados aceitos.

### 10.1 Transação e falha

Cada passo é transacional. Se um domínio falhar, se a transferência violar tolerância ou se a convergência não ocorrer, o orquestrador rejeita o passo inteiro. O estado anterior é restaurado e a interface apresenta qual condição falhou. Não deve haver estado híbrido com temperatura nova, geometria antiga e corrente parcialmente atualizada.

### 10.2 Cancelamento e reinício

Cancelar interrompe o cálculo e preserva o último passo aceito. Alterar material, fase, geometria de referência ou definição constitutiva invalida os estados derivados incompatíveis e exige nova preparação. Alterar apenas uma opção visual não reinicializa o estado físico.

## 11. Persistência, proveniência e reprodutibilidade

A definição pode ser salva como projeto. Resultados devem apontar para a revisão exata dessa definição e para os dados/solvers utilizados.

Metadados mínimos de cada execução:

- identificadores e versões de amostra, material, fase, geometria e microestrutura;
- revisão de cada conjunto de dados, fonte, condições, faixa e incerteza;
- versão do schema, solvers, leis constitutivas e operadores de transferência;
- método, tolerâncias, estratégia de acoplamento, passos e parâmetros numéricos;
- unidade e referência temporal de cada campo;
- resíduos, balanços, avisos e estado final;
- distinção entre medido, calculado, ajustado e didático.

Dados externos não serão copiados para uma propriedade sem proveniência. Uma lacuna de dados continua explícita e pode bloquear apenas o caminho que depende dela.

## 12. Interface operacional: painel único de condições

A arquitetura mantém um único painel para E, T, M e O. Os ícones representam seleção de fenômenos e visibilidade; não são comandos implícitos para executar um solver.

Fluxo:

1. usuário seleciona um ou mais fenômenos pelos ícones;
2. painel agrupa as condições por família e exibe somente os campos pertinentes;
3. sistema monta o grafo proposto e executa pré-validação;
4. painel identifica dados ausentes, hipóteses e limitações;
5. usuário aplica a configuração;
6. orquestrador prepara e executa;
7. resultados mostram campos e observáveis por família, além dos balanços.

Estados visuais necessários: disponível, selecionado, aguardando condições, bloqueado por dados, executando, convergido e rejeitado. A UI não deve depender de submenus contextuais repetidos para cada propriedade.

### 12.1 Regra de ativação

- Selecionar ícones não inicia cálculo.
- Aplicar condições sem completar requisitos não habilita o caminho.
- Uma combinação sem lei/dado/solver homologado fica marcada como indisponível, com motivo curto.
- O modo qualitativo pode continuar mostrando a experiência atual, mas não deve usar unidades nem rótulos de resultados físicos.
- O painel não pode apresentar uma combinação visual como acoplamento físico validado.

## 13. Compatibilidade e migração dos motores existentes

A migração será gradual e reversível.

### 13.1 Preservar o modo didático

Os controladores atuais permanecem como adaptadores qualitativos. Suas saídas devem ser marcadas como didáticas e não podem alimentar balanços físicos. A mudança de interface não deve quebrar as experiências já disponíveis.

### 13.2 Introduzir o novo contrato em paralelo

Adicionar o novo estado de experiência e o orquestrador sem remover inicialmente:

- \`model.state.properties.active\`;
- \`model.startProperty\`, \`model.setPropertyParams\` e \`model.restoreProperty\`;
- controladores de \`thermal.js\`, \`deformation.js\` e \`drive.js\`;
- APIs e adapters atuais do \`engineAdapters\`.

A camada de compatibilidade traduz ações de UI para uma definição qualitativa ou multifísica, sem permitir que um controller escreva diretamente em campos pertencentes a outro domínio.

### 13.3 Migração por domínio

1. encapsular a experiência atual como \`EvidenceMode = qualitative\`;
2. adicionar contratos de parâmetros, unidades e proveniência;
3. desenvolver solvers físicos isolados e testes de referência;
4. adicionar o grafo e os operadores de transferência;
5. migrar gradualmente o painel para seleção múltipla com validação;
6. remover duplicações somente após paridade funcional comprovada.

O novo schema precisa de versão e migração explícita. Projetos antigos devem continuar abrindo no modo didático, sem que seus controles adimensionais sejam reinterpretados como valores físicos.

## 14. Ordem recomendada de implementação

| Etapa | Entrega | Critério de saída |
|---|---|---|
| A0 — contrato | Schema, unidades SI, proveniência, estados e eventos | Testes de serialização, migração e validação |
| A1 — base geométrica | Amostra macroscópica, geometria de referência/corrente e revisão geométrica | Geometria consistente, sem confusão com a célula atômica |
| A2 — motor/orquestrador | Ciclo de vida, transação, relógio, estados aceitos e snapshots | Falha e rollback previsíveis |
| B — E+T | Solver DC, Joule, condução térmica e fronteiras | Balanços elétrico/térmico e caso de referência |
| C — T+M | Expansão, apoios e constituição dependente de T | Expansão livre e barra restrita verificadas |
| D — E+M | Geometria/contato atualizado e resposta elétrica | Resistência geométrica separada de resistividade intrínseca |
| E — M+O | Superfície deformada, normais e reflexão | Caso geométrico verificado; óptica intrínseca continua separada |
| F — O+T e E+T+M | Absorção, termorrefletância e realimentações | Balanços e dependências homologados |
| G — E+T+M+O | Solver integrado, iteração forte, múltiplas escalas/TTM conforme regime | Benchmarks independentes e convergência reproduzível |

A etapa B não começa antes do contrato A0/A1/A2 estar estável. Etapas posteriores podem compartilhar infraestrutura, mas não devem ser ativadas apenas porque os ícones e a interface já suportam seleção múltipla.

## 15. Critérios gerais de aceite da arquitetura

- [ ] A definição da experiência, o estado de execução e o snapshot de resultados são objetos separados.
- [ ] Cada campo tem unidade, domínio, malha, instante, revisão geométrica e origem.
- [ ] Cada dado material tem fonte, versão, condições, faixa e incerteza quando disponível.
- [ ] Uma única geometria física corrente é referenciada por todos os domínios.
- [ ] Cada domínio pode manter malha própria com operador explícito de transferência.
- [ ] Transferências de potência/energia preservam integrais dentro de tolerância.
- [ ] DC, óptica e seus respectivos campos não são confundidos.
- [ ] O relógio físico não depende do renderer.
- [ ] Passos não convergidos são rejeitados integralmente.
- [ ] O modo didático é preservado e claramente identificado.
- [ ] A seleção de ícones não executa automaticamente um modelo físico.
- [ ] Projetos existentes não são reinterpretados com unidades físicas inexistentes.
- [ ] Nenhum caminho quantitativo é liberado sem solver, dados, fronteiras e benchmark próprios.

## 16. Riscos e decisões que permanecem abertas

1. **Tecnologia dos solvers:** escolher métodos numéricos e bibliotecas por domínio após medir desempenho e requisitos; não fixar agora um único método para todos.
2. **Geometria macroscópica:** definir como o usuário cria ou escolhe o corpo de prova, seus terminais, superfície e apoios.
3. **Malhas:** decidir formatos e bibliotecas de malha depois da prova de conceito de E+T e T+M.
4. **Banco de materiais:** homologar propriedades físicas por composição, fase, temperatura, direção e incerteza.
5. **Escala temporal:** definir quais experimentos serão quase-estáticos, transientes ou ópticos harmônicos; não presumir que todos compartilham o mesmo passo.
6. **Persistência de campos:** decidir estratégia de armazenamento conforme tamanho dos resultados, sem confundir metadados do projeto com matrizes numéricas grandes.
7. **Validação experimental:** selecionar referências e geometria de amostra específicas para cada solver e combinação.

Nenhuma dessas decisões deve ser preenchida com valores “típicos” sem fonte e condição.

## 17. Decisões congeladas nesta etapa

1. O SILM terá uma definição de experiência comum, mas solvers especializados por domínio.
2. Uma única geometria física corrente será compartilhada; malhas numéricas podem ser diferentes.
3. Transferências entre malhas serão explícitas, versionadas e verificadas por grandeza.
4. Definição, execução transitória e snapshots aceitos permanecerão separados.
5. O relógio físico será independente da animação e do renderer.
6. O orquestrador coordenará execução, convergência, transação e publicação, mas não conterá equações físicas dos domínios.
7. O painel único agrupará condições; ícones selecionam fenômenos, não garantem acoplamento.
8. Os motores didáticos atuais serão mantidos durante a migração e nunca serão confundidos com solvers quantitativos.
9. A célula/rede cristalina não será usada como substituta automática de uma geometria macroscópica de corpo de prova.
10. O acoplamento completo E+T+M+O depende da homologação incremental de domínios, leis, dados e benchmarks.

## 18. Relação com os documentos científicos

Esta arquitetura operacionaliza, sem substituir, as especificações físicas:

- [Matriz operacional das interações](MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md)
- [Estudo geral das interações](ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md)
- [Acoplamento E+T+M+O](ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-MECANICO-OPTICO.md)
- [Acoplamento E+T+M](ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-MECANICO.md)
- [Acoplamento E+T+O](ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-OPTICO.md)
- [Acoplamento E+M+O](ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md)
- [Acoplamento T+M+O](ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md)

**Conclusão:** a próxima entrega de engenharia deverá ser A0 — contrato de dados e estados — e não a ativação simultânea dos quatro fenômenos na interface.