# Contrato de Dados e Estados Multifísicos do SILM

**Etapa:** A0 — contrato técnico  
**Status:** especificação versionada; ainda não integrada ao runtime  
**Versão do contrato:** 1.0.0  
**Branch de estudo:** \`study/silm-coupled-properties-transport-20261104\`

## 1. Objetivo e limites

Este documento transforma a arquitetura multifísica em um contrato verificável de dados, estados, unidades, proveniência, validação e persistência.

O contrato cobre três documentos lógicos independentes:

1. **Definição da experiência:** o que foi configurado antes da execução.
2. **Estado de execução:** o último estado numérico aceito e o ciclo de vida do cálculo.
3. **Snapshot de resultado:** a saída imutável de um instante físico aceito.

Os schemas JSON correspondentes estão em:

- [Definição da experiência](schemas/multiphysics-experiment.schema.json)
- [Estado de execução](schemas/multiphysics-runtime.schema.json)
- [Snapshot de resultado](schemas/multiphysics-result.schema.json)

A etapa A0 não cria solver, não altera a investigação clássica, não migra o armazenamento atual e não habilita acoplamentos na interface. Ela congela a forma como dados futuros deverão ser representados.

## 2. Compatibilidade com os schemas atuais do SILM

A auditoria do código confirma três contratos atuais distintos:

| Camada existente | Identificador atual | Responsabilidade |
|---|---|---|
| Estado científico | \`SILM.scientificSchemaVersion = 8\` | Investigação, metal, estrutura, elétrons, propriedades, medições e cálculos |
| Documento durável | \`format: "silm-documents-v1"\` | Agrupamento de documentos críticos, revisão global e gravação transacional |
| Documento científico persistido | chave lógica \`scientific.state\` | Snapshot validado do estado científico clássico |

O estado científico clássico é validado por \`SILM.validateScientificState\`. As migrações existentes cobrem schemas legados 1 a 7 e chegam ao schema 8. O contrato multifísico **não reutiliza o número 8**.

Regras congeladas:

- \`scientificSchemaVersion = 8\` continua descrevendo o estado clássico.
- \`silm-documents-v1\` continua descrevendo o envelope atual de armazenamento.
- \`multiphysics-experiment 1.0.0\`, \`multiphysics-runtime 1.0.0\` e \`multiphysics-result 1.0.0\` são contratos independentes.
- Não adicionar campos multifísicos dentro de \`properties\` nem reinterpretar os controles transitórios de \`thermal.js\`, \`deformation.js\` e \`drive.js\` como condições com unidades.
- A versão de schema e a versão do modelo científico/material são metadados diferentes. Uma mudança de dado de cobre não exige, por si só, alterar a versão do schema.

## 3. Identidade e versionamento

### 3.1 Identificadores

IDs são estáveis dentro do documento e nunca dependem de nomes apresentados na interface.

| Objeto | Padrão recomendado | Regra |
|---|---|---|
| Experiência | \`exp-<uuid>\` | Identifica a definição lógica |
| Revisão da experiência | \`experimentId + revision\` | Imutável depois de aplicada |
| Amostra | \`sample-<uuid>\` ou ID de catálogo | Não confundir amostra com elemento químico |
| Geometria | \`geo-<uuid>\` | Identifica geometria de referência ou revisão |
| Dataset | ID + versão | Referência imutável à fonte de parâmetros |
| Lei constitutiva | ID + versão | Equação e domínio de validade |
| Operador de transferência | ID + versão | Mapeamento entre malhas |
| Execução | \`run-<uuid>\` | Uma tentativa controlada de cálculo |
| Snapshot | \`result-<uuid>\` | Resultado imutável aceito |
| Campo | \`field-<uuid>\` | Campo armazenado fora do documento JSON |

Um ID nunca deve ser usado para inferir material, propriedade ou unidade. Esses dados permanecem explícitos.

### 3.2 Versão do schema

Os três documentos usam versão semântica em string:

- **major:** quebra de estrutura ou significado;
- **minor:** campo opcional ou capacidade compatível;
- **patch:** correção editorial/restrição que não muda o significado dos dados válidos.

A versão deve estar presente tanto em \`schemaVersion\` quanto no identificador do schema. Não usar uma única versão global para o estado científico legado, os dados de material e os resultados.

### 3.3 Revisões e imutabilidade

- A definição nasce com \`revision: 1\`.
- Cada alteração em condições físicas cria nova revisão.
- Uma execução fixa a revisão de definição no início e não a altera durante o cálculo.
- Resultados apontam para a revisão exata que os originou.
- Correções de dados de material geram nova versão de dataset; resultados anteriores mantêm a referência original.
- Snapshots aceitos não são sobrescritos. Uma nova execução cria novo \`runId\` e novos snapshots.

## 4. Política de unidades

**Todas as grandezas físicas persistidas serão armazenadas em unidades SI.** A interface poderá converter para unidades de leitura, mas a conversão deverá ocorrer na borda de entrada/saída.

Não armazenar valor físico como número sem unidade definida pelo contrato. Para grandezas com unidade fixa, a unidade está no nome do campo:

| Grandeza | Campo SI | Unidade |
|---|---|---|
| Comprimento | \`lengthM\`, \`displacementM\`, \`wavelengthM\` | m |
| Área | \`areaM2\` | m² |
| Volume | \`volumeM3\` | m³ |
| Tempo | \`timeS\`, \`pulseDurationS\`, \`timeStepS\` | s |
| Frequência | \`frequencyHz\`, \`repetitionRateHz\` | Hz |
| Temperatura | \`temperatureK\`, \`referenceTemperatureK\` | K |
| Diferença de temperatura | \`temperatureDifferenceK\` | K |
| Potencial/tensão | \`voltageV\`, \`potentialV\` | V |
| Corrente | \`currentA\` | A |
| Campo elétrico | \`electricFieldVPerM\` | V/m |
| Densidade de corrente | \`currentDensityAPerM2\` | A/m² |
| Condutividade elétrica | \`electricalConductivitySPerM\` | S/m |
| Resistividade elétrica | \`electricalResistivityOhmM\` | Ω·m |
| Potência | \`powerW\` | W |
| Densidade volumétrica de potência | \`powerDensityWPerM3\` | W/m³ |
| Fluxo de potência por área | \`powerFluxWPerM2\` | W/m² |
| Energia | \`energyJ\` | J |
| Condutividade térmica | \`thermalConductivityWPerMK\` | W/(m·K) |
| Calor específico | \`specificHeatJPerKgK\` | J/(kg·K) |
| Densidade de massa | \`massDensityKgPerM3\` | kg/m³ |
| Coeficiente de expansão | \`thermalExpansionPerK\` | K⁻¹ |
| Força | \`forceN\` | N |
| Tensão mecânica | \`stressPa\` | Pa |
| Módulo elástico | \`elasticModulusPa\` | Pa |
| Deformação | \`strain\` | adimensional |
| Ângulo | \`angleRad\`, \`incidenceAngleRad\` | rad |
| Irradiância | \`irradianceWPerM2\` | W/m² |
| Refletância/transmitância/absortância | \`reflectance\`, \`transmittance\`, \`absorptance\` | fração 0–1 |

Regras adicionais:

- Temperatura absoluta é kelvin, nunca Celsius no documento persistido.
- Ângulos são radianos, nunca graus.
- Frações são armazenadas entre 0 e 1; não armazenar porcentagem.
- Deformação é adimensional e não recebe unidade artificial.
- Não usar \`value\` e \`unit\` livres para campos físicos cujo significado já é fixo.
- Conservar \`unit\` explícita somente em registros genéricos de dataset/observável, e validar a unidade permitida para a propriedade.
- Valores derivados devem carregar a unidade canônica, não a unidade que o usuário escolheu na tela.

## 5. Estrutura da definição da experiência

O contrato de definição tem os seguintes grupos.

| Grupo | Obrigatoriedade | Conteúdo |
|---|---|---|
| Identidade | Obrigatório | schema, ID, revisão e datas |
| Amostra | Obrigatório | material/fase, temperatura de referência e geometria macroscópica |
| Domínios | Pelo menos um | condições elétricas, térmicas, mecânicas e/ou ópticas |
| Acoplamentos | Pode ser vazio | arestas explícitas entre campos e entradas |
| Fronteiras | Obrigatório | referências aos modelos de condições de contorno |
| Contatos | Opcional | interfaces físicas e leis de contato |
| Controle temporal | Obrigatório | regime e horizonte físico |
| Solução numérica | Obrigatório | estratégia, tolerâncias e limites de iteração |
| Datasets | Lista | proveniência das propriedades e condições |
| Observações | Opcional | notas não autoritativas |

### 5.1 Amostra e geometria

A amostra é uma entidade própria, não somente um número atômico.

Campos obrigatórios:

- \`sample.id\`;
- \`sample.materialId\`;
- \`sample.phaseId\`;
- \`sample.referenceTemperatureK\`;
- \`sample.geometry.geometryId\`;
- \`sample.geometry.scale = "macroscopic"\`;
- \`sample.geometry.coordinateUnit = "m"\`;
- \`sample.geometry.coordinateSystem = "cartesian-right-handed"\`;
- \`sample.geometry.surfaceModelId\`.

O número atômico e o símbolo podem identificar metais elementares; não substituem \`materialId\` quando a amostra for liga, filme, multicamada ou material com composição definida.

A geometria cristalina da cena atual é uma representação atômica e não preenche automaticamente \`sample.geometry\`. A geometria de referência deve definir o corpo de prova macroscópico, terminais, superfícies e regiões que receberão fronteiras e contatos.

### 5.2 Domínio elétrico

- \`control\`: controle por tensão (\`voltage\`) ou corrente (\`current\`).
- Controle por tensão exige \`voltageV\`; controle por corrente exige \`currentA\`.
- \`terminalModelId\`: identificação dos terminais e do caminho de alimentação.
- \`contactModelId\`: lei de contato elétrico, quando existente.
- \`conductivityDatasetId\`: dado constitutivo de σDC ou ρDC, com dependências declaradas.
- O campo DC não representa o campo óptico.

O schema rejeita a presença simultânea de \`voltageV\` e \`currentA\` como duas entradas impostas do mesmo controle.

### 5.3 Domínio térmico

- \`regime = "single-temperature"\`: exige \`initialTemperatureK\` e \`thermalDatasetId\`.
- \`regime = "two-temperature"\`: exige \`initialElectronTemperatureK\`, \`initialLatticeTemperatureK\` e \`twoTemperatureDatasetId\`.
- \`boundaryModelId\`: referência às fronteiras térmicas.
- Fontes Joule, ópticas e externas entram por fontes distintas e rastreáveis; não são confundidas com a condição inicial.

Não ativar TTM por conveniência de interface. O regime deve corresponder à escala temporal e às evidências físicas da experiência.

### 5.4 Domínio mecânico

- \`mode\`: \`tension\`, \`compression\` ou \`shear\`.
- \`control\`: \`force\`, \`stress\`, \`displacement\` ou \`strain\`.
- O campo correspondente é obrigatório e usa N, Pa, m ou valor adimensional, respectivamente.
- \`constraint\`: \`free\`, \`supported\` ou \`restrained\`.
- \`direction\`: vetor em referencial cartesiano declarado.
- \`constitutiveDatasetId\` e \`boundaryModelId\` são obrigatórios.

A interface não deve tratar maleabilidade/ductilidade como “condutividades”. Maleabilidade e ductilidade são mecanismos/modos de resposta mecânica, enquanto controle de força, tensão, deslocamento ou deformação define a condição do ensaio.

### 5.5 Domínio óptico

- \`mode\`: \`probe\`, \`pump-probe\` ou \`single-beam\`.
- \`wavelengthM\`: comprimento de onda em metros.
- \`incidenceAngleRad\`: ângulo medido da normal local.
- \`polarization\`: \`s\`, \`p\` ou \`unpolarized\`.
- \`opticalDatasetId\`: referência aos parâmetros n(λ), κ(λ) ou permissividade complexa.
- \`probe\`, \`pump\` e \`singleBeam\` são fontes com papel inequívoco.

O modo \`probe\` registra leitura óptica; o modo \`pump-probe\` mantém fontes distintas; o modo \`single-beam\` permite que a mesma fonte aqueça e leia, exigindo contabilização da absorção. Não usar σDC para preencher parâmetros ópticos.

## 6. Datasets e proveniência

Toda propriedade numérica usada por um solver deve apontar para um dataset imutável.

Campos mínimos de referência:

- \`datasetId\` e \`datasetVersion\`;
- \`propertyId\`;
- \`materialId\` e \`phaseId\`;
- \`sourceId\`;
- \`evidence\`: \`measured\`, \`calculated\` ou \`fitted\`;
- \`unit\`;
- faixa válida de temperatura e demais condições quando aplicável;
- incerteza e método de obtenção, quando disponíveis.

O próprio documento de definição contém referências, não cópias de tabelas inteiras. O catálogo de dados é responsável por entregar valores, curvas e interpolações dentro da faixa homologada.

Um dataset didático não pode satisfazer requisito quantitativo. Um dado fora da faixa não pode ser extrapolado silenciosamente. A ausência de fonte, fase, condição ou unidade bloqueia o caminho dependente.

## 7. Acoplamentos e referências cruzadas

Cada aresta de acoplamento declara:

- domínio e campo de origem;
- domínio e entrada de destino;
- mecanismo físico;
- lei/modelo que converte a origem na entrada;
- operador de transferência entre malhas;
- referências de datasets necessárias;
- indicador de habilitação.

A lista de mecanismos admitidos na versão 1 inclui:

| Mecanismo | Origem → destino | Verificação mínima |
|---|---|---|
| \`joule-heating\` | E → T | \`q̇J = J·E\`, unidade W/m³ e balanço elétrico/térmico |
| \`optical-absorption\` | O → T | energia absorvida consistente com R/A/T e distribuição de absorção |
| \`thermoelectric-conductivity\` | T → E | σDC(T) ou ρDC(T) com faixa válida |
| \`thermal-expansion\` | T → M | α(T), C(T), restrições e caso livre/restrito |
| \`deformed-geometry\` | M → E/O | geometria, área, contatos e normais revisados |
| \`thermo-optic-response\` | T → O | n(λ,T), κ(λ,T) ou dados equivalentes |
| \`elasto-optic-response\` | M → O | lei e parâmetros elasto-ópticos validados |

O schema verifica a forma de cada referência. A validação semântica deverá ainda confirmar que:

1. os domínios de origem e destino estão presentes;
2. o campo produzido existe no solver de origem;
3. a entrada consumidora aceita aquele campo;
4. lei, dataset e operador estão registrados e compatíveis;
5. a versão das geometrias/malhas corresponde;
6. ciclos de dependência usam estratégia iterativa;
7. não há dupla contagem de energia ou fontes incompatíveis.

## 8. Estado de execução e resultado

### 8.1 Estado de execução

O runtime guarda o último passo aceito. Inclui:

- \`runId\`, \`experimentId\` e revisão da definição;
- \`status\`: \`prepared\`, \`running\`, \`converged\`, \`rejected\` ou \`interrupted\`;
- \`acceptedTimeS\` e \`acceptedStep\`;
- revisão da geometria corrente;
- identificadores de malhas;
- referências de campos já persistidos;
- resíduos e relatórios de balanço;
- instante da atualização.

Iterações provisórias ficam na memória ou em área temporária. Não sobrescrevem o estado aceito.

A coordenada aceita não é sempre tempo: o runtime usa `acceptedCoordinate` com um discriminador `kind`. Os tipos são `time` (transiente, com `timeS` físico), `load-increment` (quase-estático, com índice, total e fator de carga), `frequency` (harmônico, com `frequencyHz`) e `multiscale-time` (tempo físico associado a `scaleMapId`). Não usar pseudotempo de carga como se fosse segundo.

### 8.2 Snapshot de resultado

Um snapshot publicado exige:

- \`accepted = true\`;
- \`converged = true\`;
- \`definitionRevision\` fixa;
- \`timeS\` e, se aplicável, intervalo físico;
- observáveis com unidade e campos de origem;
- referências dos campos e malhas;
- versões de solver, lei, dataset e operador;
- resíduos e balanços independentes;
- limitações e avisos.

Snapshots não podem apontar para campos temporários, referências órfãs ou malhas que não existam.

## 9. Política de estados e transições

O estado de execução usa estas transições:

| Estado atual | Evento | Próximo estado | Efeito |
|---|---|---|---|
| inexistente | preparar | \`prepared\` | validação completa, inicialização e congelamento da definição |
| \`prepared\` | iniciar | \`running\` | primeira tentativa de passo |
| \`running\` | passo aceito | \`running\` ou \`converged\` | commit atômico do novo estado aceito |
| \`running\` | erro de solver/transferência | \`rejected\` | descartar passo candidato e manter último estado aceito |
| \`running\` | cancelar | \`interrupted\` | manter último passo aceito |
| \`interrupted\` | retomar | \`prepared\` | revalidar definições, dados e versões antes de iniciar novo ciclo |
| \`rejected\` | corrigir configuração | nova revisão + \`prepared\` | criar nova tentativa sem sobrescrever histórico |
| \`converged\` | nova condição | nova revisão + \`prepared\` | execução anterior continua imutável |

Nenhum estado transita diretamente de \`running\` para resultado aceito sem auditar convergência e balanços.

## 10. Validação: schema e regras semânticas

A validação ocorre em quatro níveis.

### 10.1 Sintaxe JSON

- JSON válido em UTF-8.
- Sem NaN, Infinity, funções, referências circulares ou valores indefinidos.
- Chaves desconhecidas são rejeitadas nas estruturas de schema fechadas.
- Arrays ordenados somente quando a ordem tem significado declarado.

### 10.2 JSON Schema

Os três arquivos em \`docs/schemas/\` definem campos, tipos, enums, limites locais e requisitos condicionais.

### 10.3 Consistência entre documentos

Verificar referências a experiência/revisão, run, geometria, malha, campos, datasets, leis e operadores. IDs devem existir e ser compatíveis com as versões indicadas.

### 10.4 Validação física

Verificar dimensionalidade, faixas dos materiais, condições de fronteira, balanços, critérios de estabilidade, convergência e adequação do modelo. Passar no JSON Schema não significa que a experiência seja fisicamente válida.

Verificações semânticas complementares obrigatórias: `minimumStepS ≤ initialStepS ≤ maximumStepS`; `finalTimeS > initialTimeS`; extremos das faixas de datasets em ordem; direção mecânica normalizada no referencial declarado; regiões de contato distintas; domínios de origem/destino presentes; campo/entrada existentes; fronteira pertencente ao domínio indicado; IDs referenciados resolvidos com versão compatível; índices de carga não excedem o total; e intervalo temporal tem início menor que o fim.

#### Regras semânticas obrigatórias

- Somente uma entrada primária de controle elétrico: tensão ou corrente.
- O domínio óptico nunca herda o campo DC.
- Campo de temperatura só alimenta propriedade constitutiva com dependência declarada.
- Potência óptica absorvida e perdas ópticas não podem ser contabilizadas duas vezes.
- Potência Joule é derivada da solução elétrica; não é input livre no caminho E → T.
- A mesma fonte não pode ser ao mesmo tempo pump e probe sem distinção de papel e balanço.
- Geometria atual de E e O deve corresponder à revisão mecânica aceita.
- Grandeza intensiva e extensiva devem usar operador de transferência compatível.
- TTM requer os parâmetros de dois subsistemas e o termo de troca correspondente.
- Calor plástico requer fração calibrada e balanço de trabalho; não usar β universal.
- Nenhuma extrapolação de dataset é permitida sem política e evidência explícitas.

## 11. Persistência e armazenamento

### 11.1 Compatibilidade imediata

O armazenamento atual permanece intacto:

- \`localStorage\` e \`silm-documents-v1\` continuam responsáveis pelos documentos críticos atuais;
- \`scientific.state\` mantém schema 8;
- o documento durável conserva revisão global, transação e bloqueio por conflito entre abas;
- preferências visuais permanecem separadas dos dados científicos.

Não incluir matrizes numéricas ou malhas em \`scientific.state\` nem ampliar o envelope atual por conveniência.

### 11.2 Armazenamento futuro da experiência multifísica

A proposta para a implementação A1/A2 é um banco IndexedDB isolado, por exemplo \`silm-multiphysics-v1\`, com stores lógicos:

| Store | Conteúdo | Chave/indexação |
|---|---|---|
| \`definitions\` | definição da experiência e revisões imutáveis | experimentId + revision |
| \`runs\` | metadados e ciclo de vida de cada execução | runId, experimentId |
| \`snapshots\` | snapshots aceitos e observáveis | snapshotId, runId, timeS |
| \`fieldBlocks\` | blocos numéricos de campos (ArrayBuffer/TypedArray) | fieldId, snapshotId |
| \`meshes\` | nós, elementos, regiões e versão da geometria | meshId, geometryRevision |
| \`transferMaps\` | operadores e metadados de transferência | mappingId + version |
| \`auditEvents\` | criação, execução, aceitação, rejeição e exportação | eventId, runId, time |

Os dados numéricos devem ser armazenados em blocos binários, com unidade, tipo numérico, formato, dimensões, ordem e checksum descritos nos metadados. Não serializar campos densos como arrays JSON gigantes.

### 11.3 Commit de passo

O solver calcula fora da transação IndexedDB. Quando o passo candidato estiver validado:

1. abrir transação curta cobrindo os blocos de campos, snapshot e metadados do run;
2. gravar os blocos e referências;
3. atualizar o ponteiro do último passo aceito;
4. confirmar a transação;
5. somente então atualizar a cena e a interface.

Se a transação falhar, o passo não avança. Blocos órfãos de tentativas incompletas podem ser removidos por limpeza posterior, mas nunca interpretados como resultado.

### 11.4 Quota, conflito e recuperação

- Falha de quota impede o commit do passo e mantém o último passo aceito.
- Falha/indisponibilidade de IndexedDB não autoriza fallback silencioso para JSON no localStorage.
- Não sobrescrever execução de outra aba: detectar versão/revisão concorrente e bloquear escrita conflitante.
- Ao restaurar, validar manifesto e referências de todos os blocos; se faltar bloco, marcar snapshot como incompleto e não apresentá-lo como solução.
- Exportação deve gerar pacote autocontido com schema, definição, resultados, dados referenciados/licenciados quando permitido e checksums.

### 11.5 Política de retenção

Definições, histórico de auditoria e snapshots publicados são preservados. Resultados intermediários rejeitados podem ter blocos temporários removidos após retenção curta. O usuário deve poder exportar e excluir execuções próprias sem apagar a investigação clássica.

A estratégia final de quota, compressão e chunk size só será fixada após benchmark com o solver e volumes reais.

## 12. Compatibilidade, importação e migração

A versão 1 do contrato multifísico não é uma migração da versão 8 do estado científico.

- Projetos clássicos continuam sendo importados pelo validador/migrador atual.
- Ao criar uma experiência multifísica, referenciar a investigação clássica por \`legacyInvestigationId\` opcional, sem incorporar ou alterar o snapshot legado.
- Não converter controles adimensionais do campo elétrico, ângulo de lanterna, calor transitório ou deslizamento em valores SI.
- Um projeto legado aberto permanece em modo qualitativo.
- Exportação nova inclui \`schemaId\`, \`schemaVersion\` e referências completas.
- Schema major desconhecido: recusar edição e oferecer exportação/inspeção somente leitura, quando possível.
- Schema minor compatível: manter campos desconhecidos somente se a política da versão autorizar; na versão 1, não aceitar chaves inesperadas em estruturas fechadas.
- Nunca descartar campos desconhecidos silenciosamente.

## 13. Exemplo mínimo de definição

O exemplo abaixo é estrutural e ilustrativo. Os IDs de dados, geometria, modelos e fontes são referências fictícias; não representam parâmetros homologados para um metal real e não habilitam execução.

~~~json
{
  "schemaId": "silm.multiphysics.experiment-definition",
  "schemaVersion": "1.0.0",
  "id": "exp-8f2a4c1d-8b5e-4c11-9b20-1d18b77f0101",
  "revision": 1,
  "createdAt": "2026-11-04T12:00:00Z",
  "updatedAt": "2026-11-04T12:00:00Z",
  "evidenceMode": "parameterized",
  "sample": {
    "id": "sample-demo-001",
    "materialId": "material-demo-copper",
    "phaseId": "solid-reference",
    "referenceTemperatureK": 293.15,
    "geometry": {
      "geometryId": "geo-demo-001",
      "scale": "macroscopic",
      "coordinateUnit": "m",
      "coordinateSystem": "cartesian-right-handed",
      "surfaceModelId": "surface-demo-001"
    }
  },
  "domains": {
    "electrical": {
      "control": "voltage",
      "voltageV": 1.0,
      "terminalModelId": "terminals-demo-001",
      "contactModelId": "contacts-demo-ideal",
      "conductivityDatasetId": "dataset-demo-sigma"
    },
    "thermal": {
      "regime": "single-temperature",
      "initialTemperatureK": 293.15,
      "boundaryModelId": "thermal-boundary-demo-001",
      "thermalDatasetId": "dataset-demo-thermal"
    }
  },
  "couplings": [
    {
      "id": "edge-joule-demo",
      "from": { "domain": "electrical", "field": "joulePowerDensity" },
      "to": { "domain": "thermal", "input": "volumetricHeatSource" },
      "mechanism": "joule-heating",
      "lawId": "law-joule-demo",
      "mappingId": "map-E-to-T-demo",
      "datasetRefs": ["dataset-demo-sigma"]
    }
  ],
  "boundaries": [
    {
      "id": "bc-electrical-demo",
      "domain": "electrical",
      "kind": "electrical-terminal-potential",
      "modelId": "terminals-demo-001"
    },
    {
      "id": "bc-thermal-demo",
      "domain": "thermal",
      "kind": "thermal-temperature",
      "modelId": "thermal-boundary-demo-001"
    }
  ],
  "contacts": [],
  "timeControl": {
    "regime": "transient",
    "initialTimeS": 0,
    "finalTimeS": 1,
    "initialStepS": 0.001,
    "minimumStepS": 0.000001,
    "maximumStepS": 0.01
  },
  "solver": {
    "couplingStrategy": "iterative",
    "maximumCouplingIterations": 20,
    "relativeTolerance": 0.00001,
    "relaxationFactor": 0.7
  },
  "datasetRefs": [
    {
      "datasetId": "dataset-demo-sigma",
      "datasetVersion": "0.1.0",
      "propertyId": "electrical-conductivity",
      "materialId": "material-demo-copper",
      "phaseId": "solid-reference",
      "sourceId": "source-demo-001",
      "evidence": "measured",
      "unit": "S/m"
    },
    {
      "datasetId": "dataset-demo-thermal",
      "datasetVersion": "0.1.0",
      "propertyId": "thermal-conductivity",
      "materialId": "material-demo-copper",
      "phaseId": "solid-reference",
      "sourceId": "source-demo-002",
      "evidence": "measured",
      "unit": "W/(m K)"
    }
  ]
}
~~~

Os dados de demonstração são apenas valores de forma para conferir a estrutura do JSON. Antes de qualquer execução, todos os IDs deverão resolver para catálogos/modelos reais e as grandezas precisarão ser validadas em faixa e condição.

## 14. Critérios de aceite A0

- [ ] Três schemas independentes com \`schemaId\` e \`schemaVersion\`.
- [ ] Campos desconhecidos são rejeitados em objetos fechados.
- [ ] Unidades SI estão explícitas nos nomes dos campos ou nos metadados controlados.
- [ ] Entradas prescritas não se confundem com resultados derivados.
- [ ] Controle elétrico é exclusivamente por tensão ou corrente.
- [ ] TTM exige Te, Tl e dataset específico.
- [ ] Condições mecânicas declaram modo, controle, vínculo e direção.
- [ ] Óptica declara modo, fonte, comprimento de onda, ângulo e polarização.
- [ ] Datasets exigem versão, fonte, material, fase, evidência e unidade.
- [ ] Arestas de acoplamento declaram mecanismo, lei e mapeamento.
- [ ] Runtime aponta apenas para estado aceito.
- [ ] Coordenadas de tempo, carga e frequência não são confundidas.
- [ ] Resultados são imutáveis e ligados à revisão da definição.
- [ ] A versão 8 atual permanece inalterada.
- [ ] O envelope \`silm-documents-v1\` permanece inalterado.
- [ ] Projetos legados mantêm o modo qualitativo.
- [ ] Persistência de matrizes grandes usa armazenamento binário e transações.
- [ ] Falhas de quota/conflito impedem avanço do estado aceito.

## 15. Decisões congeladas em A0

1. A definição, o runtime e os resultados são três contratos independentes.
2. O contrato novo usa versão semântica 1.0.0 e IDs estáveis.
3. Grandezas físicas persistidas usam SI e nomes de campo com sufixo de unidade sempre que aplicável.
4. Dados materiais são referenciados por versão e proveniência, não copiados sem contexto.
5. O estado clássico schema 8 e o envelope \`silm-documents-v1\` não serão alterados por A0.
6. A nova persistência multifísica será isolada em IndexedDB, sujeita a benchmark e implementação posterior.
7. Campos numéricos densos não serão gravados como JSON textual.
8. Um passo só se torna aceito após validação, convergência, balanços e commit persistente.
9. A migração dos projetos clássicos será de leitura/compatibilidade, sem converter controles didáticos em grandezas físicas.
10. O contrato A0 não autoriza solver nem ativação de combinação multifísica.

## 16. Referências da implementação atual auditada

- \`domain/silm/state.js\`: schema científico 8, estado vazio, validação, migração 1–7 e persistência da chave lógica \`scientific.state\`.
- \`integracao/durable-storage.js\`: envelope \`silm-documents-v1\`, revisão, gravação transacional, proteção de conflito e rollback.
- \`integracao/adapter.js\`: backend LocalStorage, criação do modelo científico, proteção de gravação e restauração de snapshots.
- \`domain/silm/thermal.js\`, \`deformation.js\` e \`drive.js\`: controladores didáticos e estados transitórios.
- \`integracao/metallic-experience.js\`: coordenação das APIs qualitativas atuais.

**Próxima etapa depois de A0:** A1 — especificação da geometria macroscópica, regiões, terminais, superfícies e referencial de coordenadas da amostra.
