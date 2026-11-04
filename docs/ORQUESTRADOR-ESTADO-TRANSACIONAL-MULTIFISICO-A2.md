# A2 — Orquestrador e Estado Transacional Multifísico do SILM

**Etapa:** A2 — ciclo de vida e coordenação transacional  
**Status:** especificação técnica complementar; não implementada no runtime  
**Versão do contrato A2:** 1.0.0  
**Branch:** `study/silm-coupled-properties-transport-20261104`

## 1. Objetivo e relação com A0/A1

A2 define a máquina operacional que prepara, executa, aceita, rejeita, interrompe e retoma uma execução multifísica. Ela complementa, sem duplicar, os contratos já existentes:

- A0: `CONTRATO-DADOS-ESTADOS-MULTIFISICO.md`, schemas de experiência, runtime e resultado;
- A1: `GEOMETRIA-MACROSCOPICA-AMOSTRA-MULTIFISICA.md` e `multiphysics-geometry.schema.json`;
- arquitetura: `ARQUITETURA-OPERACIONAL-ACOPLAMENTO-MULTIFISICO.md`.

A2 não implementa equações, solvers, malhas ou operadores de transferência. Define como suas saídas candidatas são coordenadas e aceitas de modo consistente. Não altera o estado científico clássico schema 8 nem o envelope `silm-documents-v1`.

**Regra central:** cada passo é uma transação lógica indivisível. Ou todos os domínios e transferências requeridos pelo plano produzem um candidato completo, validado e persistido, ou nenhum deles avança o estado aceito.

## 2. Vocabulário normativo

- **Definição congelada:** revisão imutável da experiência usada pela execução.
- **Run:** execução identificada por `runId`, vinculada à definição congelada.
- **Passo:** avanço de uma coordenada física aceita (tempo, incremento de carga, frequência ou coordenada multiescala).
- **Tentativa:** cálculo provisório de um passo; pode haver mais de uma tentativa para o mesmo passo lógico.
- **Estado aceito:** último conjunto persistido de campos, geometrias, malhas, relatórios e coordenada coerentes.
- **Estado candidato:** resultado ainda não publicado, isolado do estado aceito.
- **Commit:** operação que torna o candidato o novo estado aceito.
- **Checkpoint:** pacote consistente suficiente para retomar a execução a partir de um estado aceito.
- **Snapshot:** resultado imutável derivado de um passo aceito, conforme schema A0.

Os termos “aceito”, “convergido” e “publicado” não são sinônimos: convergência numérica é pré-requisito, commit persistente é confirmação, publicação torna o snapshot visível.

## 3. Identidade e isolamento de execução

Cada execução mantém, no mínimo:

- `runId`, `experimentId` e `definitionRevision`;
- `runAttempt` crescente para reinícios explícitos da execução;
- `acceptedStep` e `acceptedCoordinate`;
- `lastAcceptedSnapshotId`, quando já existir;
- `referenceGeometryId` e `referenceRevision`;
- `currentGeometryRevision` aceita;
- versões fixadas de solver, lei, dataset, malha e operador;
- `storageRevision` usada para controle otimista de concorrência.

Cada passo de cálculo recebe `stepAttemptId` único e registra `baseAcceptedStep` e `baseSnapshotId`. Um candidato só pode ser confirmado se sua base ainda for o último estado aceito. Isso impede que uma tentativa atrasada ou paralela sobrescreva um estado mais recente.

A definição, seus datasets e versões de modelos são congelados em `prepare`. Alterações nesses recursos criam nova revisão e nova preparação; não são aplicadas no meio de uma execução. Preferências exclusivamente visuais não invalidam o estado físico.

## 4. Máquina de estados do run

A máquina preserva os estados A0:

| Estado atual | Comando/evento | Estado seguinte | Regra |
|---|---|---|---|
| inexistente | `prepare` válido | `prepared` | definição congelada, dependências verificadas e solvers inicializados |
| inexistente | `prepare` inválido | inexistente/erro de preparação | não cria runtime executável |
| `prepared` | `start` | `running` | abre primeira tentativa |
| `running` | passo aceito e não final | `running` | avança exatamente um passo aceito |
| `running` | passo final aceito | `converged` | fecha execução e publica snapshot final |
| `running` | `cancel` | `interrupted` | descarta candidato ativo; preserva último commit |
| `running` | falha recuperável/esgotamento de tentativas | `rejected` | registra motivo; preserva último commit |
| `interrupted` | `resume` válido | `prepared` | restaura checkpoint e revalida versões/recursos |
| `rejected` | corrigir definição | nova revisão em novo run `prepared` | não reescreve run anterior |
| `converged` | nova experiência | nova revisão em novo run `prepared` | resultado anterior imutável |

Não existe transição direta de `running` para `converged` sem a sequência completa de validação e commit. Um erro de preparação não deve criar run parcialmente preparado. Uma interrupção não é rejeição: cancelamento solicitado preserva a possibilidade de retomar, desde que o checkpoint seja válido.

### 4.1 Estado da tentativa

A tentativa do passo tem ciclo separado do status do run:

`created → solving → transferring → coupling-iteration → auditing → candidate-ready → committing → committed`

Saídas alternativas: `aborted`, `failed`, `stale`.

Esses estados são transitórios e não substituem `runtime.status`. Apenas `committed` altera o ponteiro do estado aceito. `candidate-ready` não é exibível como resultado científico final.

## 5. Preparação (prepare)

A preparação é uma operação sem avanço do relógio físico. Deve:

1. validar sintaxe e versão dos schemas A0/A1;
2. resolver `experimentId + revision` e congelar a definição;
3. resolver material, fase, datasets, fontes, leis, parâmetros e evidências;
4. resolver `geometryId + geometryRevision + geometrySchemaVersion`;
5. conferir todos os `regionIds`, papéis e topologias frente às condições de contorno;
6. validar grafo de acoplamento, domínios habilitados e dependências;
7. verificar compatibilidade de unidades, faixas, regimes e coordenadas;
8. resolver versões exatas de solvers, operadores, malhas e modelos requeridos;
9. verificar que o plano de solução suporta o regime temporal/espectral declarado;
10. inicializar estados dos solvers e preparar os recursos de malha;
11. gravar runtime `prepared` e evento de auditoria.

A preparação falha integralmente quando uma dependência obrigatória não pode ser resolvida. Não há fallback silencioso para versão mais recente de dataset ou solver. Dependência opcional não usada pelo grafo pode permanecer indisponível, desde que não seja anunciada como parte da execução.

A saída da preparação é um manifesto imutável de execução que registra todas as referências e versões resolvidas, os domínios ativos, a ordem/estratégia de acoplamento, tolerâncias e critério de parada.

## 6. Plano de passo e coordenação dos domínios

O orquestrador constrói o plano a partir do grafo A0. Ele não presume uma ordem universal E→T→M→O. A ordem é derivada das arestas e das dependências dos campos.

Cada domínio ativo recebe somente entradas declaradas no contrato e produz um resultado tipado. Transferências entre malhas são tarefas explícitas com versão, unidade, geometria de origem/destino e relatório de conservação/erro.

O plano distingue:

- **acoplamento fraco/sequencial:** domínios executam uma vez na ordem topológica; a iteração não é necessária apenas quando as hipóteses e critérios A0 autorizam;
- **acoplamento forte:** o conjunto conectado itera até satisfazer convergência de campos e grandezas transferidas;
- **múltiplas escalas:** o sincronizador usa envelopes/médias e mapas de escala explicitamente declarados; não força um passo único incompatível entre escalas;
- **óptica harmônica/espectral:** frequência e comprimento de onda são coordenadas próprias; não são segundos do relógio transiente.

Ciclos no grafo exigem estratégia iterativa declarada. Se não houver método de iteração suportado para o ciclo, `prepare` deve bloquear a execução.

## 7. Candidato e critério de aceitação conjunta

O passo candidato é criado a partir do último estado aceito, sem mutá-lo. Deve conter, para todos os domínios ativos/requeridos:

- saídas de solver e estado candidato de cada domínio;
- campos e referências de armazenamento ainda provisórias;
- malhas e mapeamentos correspondentes à revisão geométrica;
- relatórios de convergência/resíduos;
- relatórios de balanço e conservação;
- transferências realizadas e seus erros;
- coordenada física proposta;
- revisão de geometria proposta, incluindo mapeamento de regiões;
- proveniência e versões usadas.

O orquestrador só autoriza `candidate-ready` quando todas as condições abaixo forem verdadeiras:

1. cada solver requerido terminou sem erro fatal;
2. cada domínio requerido satisfaz seu critério local de convergência;
3. a iteração de acoplamento, quando necessária, convergiu;
4. todos os operadores de transferência passaram suas verificações;
5. todos os balanços obrigatórios foram calculados e estão dentro das tolerâncias declaradas;
6. nenhuma fonte/energia foi contada duas vezes;
7. todos os campos usam unidade, instante/coordenada, malha e geometria compatíveis;
8. todos os `regionIds` e referências topológicas continuam resolvidos;
9. a geometria corrente é única para todos os domínios que a consomem;
10. a coordenada proposta é válida e monotônica para o tipo de regime;
11. a proveniência está completa;
12. a base de estado aceito continua igual a `baseAcceptedStep + baseSnapshotId`.

Não usar uma tolerância universal inventada. Cada solver, transferência e balanço declara critério e unidade. Ausência de relatório obrigatório não equivale a aprovação.

### 7.1 Falha e rejeição

Se qualquer verificação falhar:

- candidato inteiro é rejeitado;
- ponteiro aceito, coordenada aceita e geometria aceita permanecem inalterados;
- nenhum domínio mantém campo do candidato como campo corrente;
- recursos temporários recebem estado de limpeza/expiração;
- o evento de falha registra domínio, etapa, categoria, mensagem técnica, tentativa e referências;
- a UI informa causa resumida e permite abrir detalhes.

Falha numérica, falha de transferência, falta de dado, divergência, cancelamento, conflito de persistência e falha de armazenamento são categorias distintas. Não ocultar erro técnico sob “não foi possível calcular”.

Uma estratégia de redução de passo ou repetição só pode ocorrer quando estiver configurada e limitada: registrar passo tentado, motivo, próximo passo proposto, número máximo de tentativas e critério de encerramento. Nunca alterar silenciosamente o passo inicial ou tolerâncias da definição.

## 8. Commit atômico e publicação

O cálculo ocorre fora da transação IndexedDB. A transação de commit deve ser curta e incluir os stores necessários para manter consistentes os blocos, snapshots, runtime, manifesto/ponteiro e auditoria.

Sequência normativa:

1. revalidar `storageRevision`, `baseAcceptedStep` e `baseSnapshotId`;
2. verificar integridade/checksum de todos os blocos candidatos;
3. abrir transação IndexedDB readwrite abrangendo os stores correlatos;
4. gravar blocos de campo, metadados de malha/mapeamento e snapshot;
5. gravar novo runtime, coordenada aceita e revisão geométrica aceita;
6. gravar evento `step-committed`;
7. atualizar ponteiro `lastAcceptedSnapshotId`/último passo;
8. confirmar a transação;
9. somente após confirmação sinalizar commit ao orquestrador;
10. publicar evento para renderer e interface.

A garantia de atomicidade vem da transação envolvendo todos os registros necessários no mesmo banco. Não simular atomicidade com várias gravações independentes. Quando recursos grandes precisarem ser preparados antes, ficam em área provisória e são referenciados apenas após validação; recursos não referenciados pelo commit nunca são aceitos.

Se a transação abortar, o ponteiro aceito não muda e o renderer não recebe o candidato. Se ocorrer queda depois do commit e antes da atualização visual, a restauração lê o runtime confirmado e reconstrói a cena a partir dele. A interface nunca é fonte de verdade.

### 8.1 Conflito e concorrência

Usar controle otimista de revisão/versão para impedir escrita perdida entre abas ou workers. Antes do commit, a base deve continuar sendo a mesma que iniciou a tentativa. Caso contrário, marcar tentativa `stale`, descartar candidato e exigir restauração/reconciliação; não sobrescrever o estado novo nem fazer merge de campos físicos.

No escopo da primeira implementação, permitir **um único escritor por run**. Workers podem calcular em paralelo, mas apenas o coordenador titular confirma. Leitura de snapshots aceitos pode ocorrer em paralelo.

## 9. Cancelamento, interrupção e retomada

### 9.1 Cancelamento cooperativo

`cancel` define um sinal cooperativo consultado entre tarefas e em pontos seguros dos solvers. O orquestrador:

1. impede o início de novas tarefas;
2. solicita cancelamento aos solvers/operadores;
3. aguarda ou termina tarefas conforme contrato de cancelamento;
4. descarta candidato e buffers provisórios;
5. preserva o último estado aceito;
6. confirma status `interrupted` e evento de auditoria.

Cancelamento não tenta reverter um commit já concluído. Se o commit venceu a corrida antes do cancelamento, o passo permanece aceito; a interrupção ocorre após ele.

### 9.2 Retomada determinística

`resume` nunca retoma uma iteração parcial de solver. Ela parte do último checkpoint confirmado:

1. carregar runtime e snapshot aceitos;
2. validar checksums e referências dos campos;
3. verificar compatibilidade da revisão da definição, geometria de referência/corrente e versões;
4. validar versões e disponibilidade de solvers, leis, datasets, malhas e operadores;
5. reconstituir estado dos domínios a partir de dados persistidos ou rotina de restauração determinística;
6. registrar evento `run-resumed`;
7. transitar para `prepared`, aguardando `start`.

Se a restauração exigir dado ausente, versão incompatível ou reconstrução não determinística, bloquear retomada e preservar a execução interrompida para inspeção/exportação. Não migrar automaticamente o estado numérico para uma versão de solver diferente.

## 10. Relógio e coordenadas

O orquestrador não usa relógio de parede ou renderer para avançar coordenadas físicas. O tipo da coordenada vem do regime A0:

- `time`: segundos físicos;
- `load-increment`: índice/fator de carga;
- `frequency`: hertz;
- `multiscale-time`: tempo físico e mapa de escalas.

Para tempo transiente, o candidato declara intervalo de origem/destino e o incremento proposto. Para carga, declara incremento e fator. Para frequência, cada ponto espectral é coordenada própria e só constitui uma série aceita conforme o plano espectral. Para múltiplas escalas, a relação entre escalas e sincronização integra o manifesto.

O renderer recebe snapshots aceitos e pode interpolar visualmente, mas não cria, altera ou confirma coordenadas físicas. Um frame visual perdido não perde um passo; uma animação suave não prova convergência.

## 11. Snapshots, checkpoints e auditoria

Snapshot de resultado permanece conforme schema A0 e é imutável. Cada snapshot corresponde a uma única coordenada aceita e inclui proveniência completa. O runtime aponta para o último snapshot aceito; não armazena campos provisórios.

Checkpoint é a unidade de retomada. Deve identificar:

- run/definição/revisão;
- passo e coordenada aceitos;
- snapshot associado;
- estado dos solvers restaurável;
- geometrias e malhas por revisão;
- campos e checksums;
- versões de solver/lei/dataset/operador;
- storageRevision e instante de confirmação.

Eventos mínimos de auditoria:

`run-prepared`, `run-started`, `step-attempted`, `domain-solved`, `transfer-completed`, `coupling-iteration`, `step-audited`, `step-committed`, `step-rejected`, `run-interrupted`, `run-resumed`, `run-converged`, `run-failed`.

Cada evento tem identificador único, sequência monotônica por run, timestamp UTC de auditoria, tipo, ator (usuário/orquestrador/domínio/storage), referências de tentativa/passo e dados mínimos para reconstruir a decisão. Timestamp de auditoria não é relógio físico.

## 12. Responsabilidades e contrato de interface

O orquestrador é o único componente autorizado a mudar o status do run, o ponteiro do último passo aceito e a publicar snapshots.

Solvers não gravam runtime compartilhado nem atualizam UI. Operadores de transferência não publicam campos como aceitos. Renderer lê snapshots/runtime e não escreve estado científico.

Interface conceitual:

```ts
interface MultiphysicsOrchestrator {
  prepare(experimentRef: ExperimentRef): Promise<PreparedRun>;
  start(runId: string): Promise<void>;
  cancel(runId: string, reason?: string): Promise<void>;
  resume(runId: string): Promise<PreparedRun>;
  getRuntime(runId: string): Promise<AcceptedRuntime>;
  subscribe(runId: string, listener: RuntimeEventListener): Unsubscribe;
}

interface StepTransaction {
  runId: string;
  stepAttemptId: string;
  baseAcceptedStep: number;
  baseSnapshotId?: string;
  proposedCoordinate: AcceptedCoordinate;
  candidate: CandidateState;
}

interface StepGate {
  validateSolvers(candidate: CandidateState): ValidationReport;
  validateTransfers(candidate: CandidateState): ValidationReport;
  validateBalances(candidate: CandidateState): ValidationReport;
  validateGeometry(candidate: CandidateState): ValidationReport;
  validateProvenance(candidate: CandidateState): ValidationReport;
  validateBaseRevision(transaction: StepTransaction): ValidationReport;
}
```

Os tipos ilustram fronteiras de responsabilidade; não prescrevem linguagem, biblioteca de solver ou implementação final.

## 13. Invariantes que nunca podem ser violadas

1. Runtime persistido aponta somente para o último estado aceito.
2. Snapshot aceito é imutável.
3. Um passo atualiza todos os domínios requeridos de forma indivisível.
4. Nenhum campo candidato é mostrado como aceito.
5. Todos os campos de um estado aceito identificam a mesma coordenada física compatível.
6. Domínios que compartilham geometria usam a mesma revisão corrente aceita.
7. Cada campo referencia malha existente e revisão geométrica consumida.
8. Transferência não altera silenciosamente unidade, conservação ou referencial.
9. Renderer não confirma física.
10. Falha ou cancelamento não remove nem modifica o último estado aceito.
11. Retomada não usa versões incompatíveis de solver/dataset/lei.
12. Um run possui um único escritor de commit.
13. Falha de persistência nunca aciona fallback silencioso para LocalStorage.
14. Estado científico legado e projetos clássicos permanecem isolados.
15. A execução qualitativa é identificada como qualitativa; não ganha status quantitativo por usar o orquestrador.

## 14. Cenários de validação A2

| ID | Cenário | Resultado obrigatório |
|---|---|---|
| A2-T01 | Preparar experiência com referência válida | runtime `prepared`, definição congelada |
| A2-T02 | Região/ID de dataset ausente | preparação bloqueada, nenhuma execução parcial |
| A2-T03 | Solver E falha após solver T calcular candidato | passo inteiro rejeitado, runtime aceito inalterado |
| A2-T04 | Transferência Joule→T viola conservação | rejeição de todos os domínios do passo |
| A2-T05 | Acoplamento forte não converge no limite | rejeição, registro de resíduos e tentativas |
| A2-T06 | Campo M propõe nova geometria, O falha | geometria corrente anterior preservada |
| A2-T07 | IndexedDB aborta na gravação de snapshot | nenhum ponteiro avança, renderer não atualiza |
| A2-T08 | Queda após commit antes de renderizar | restauração apresenta o snapshot confirmado |
| A2-T09 | Cancelamento durante cálculo | candidato descartado, último passo aceito preservado |
| A2-T10 | Cancelamento concorre com commit concluído | passo committed permanece aceito; run interrompido depois |
| A2-T11 | Retomar com checksums válidos e versões idênticas | retorno a `prepared`, pronto para novo start |
| A2-T12 | Retomar com bloco ausente/corrompido | retomada bloqueada, histórico preservado |
| A2-T13 | Duas abas tentam confirmar o mesmo run | apenas um commit; outra tentativa fica stale |
| A2-T14 | Renderer perde frames | coordenada física e snapshots não mudam |
| A2-T15 | Alteração apenas visual durante execução | estado físico não reinicializado |
| A2-T16 | Definição/material/geometria alterados | nova revisão e novo run; execução anterior imutável |
| A2-T17 | Falha de quota | passo não aceito, último estado íntegro |
| A2-T18 | Frequência tratada acidentalmente como segundo | validação de coordenada rejeita |
| A2-T19 | Domínio opcional não conectado ao grafo | não bloqueia nem aparece como executado |
| A2-T20 | Campo candidato tem geometryRevision diferente | validação de consistência rejeita |

## 15. Critérios de aceite A2

- [ ] A2 complementa A0/A1 sem duplicar contratos e sem alterar schemas clássicos.
- [ ] Run, tentativa, estado candidato, estado aceito e snapshot têm identidades distintas.
- [ ] Preparação congela definição, dados e versões exatas.
- [ ] Máquina de estados e transições ilegais estão explicitadas.
- [ ] Grafo determina ordem e estratégia de acoplamento.
- [ ] Acoplamento forte exige iteração e critério de convergência.
- [ ] Candidato inclui todos os domínios/transferências requeridos.
- [ ] Gate valida solver, transferência, balanço, geometria, proveniência e base concorrente.
- [ ] Commit é atômico nos stores relacionados.
- [ ] Falha de gravação mantém ponteiro e cena no último estado aceito.
- [ ] Cancelamento é cooperativo e preserva estado aceito.
- [ ] Retomada revalida integridade e versões sem prosseguir de estado provisório.
- [ ] Relógio físico independe do renderer.
- [ ] Auditoria distingue timestamp de parede de coordenada física.
- [ ] Testes A2-T01 a A2-T20 definidos e executáveis quando houver runtime.
- [ ] Nenhum solver físico ou caminho quantitativo é declarado implementado por esta especificação.

## 16. Decisões congeladas em A2

1. Um único orquestrador controla o ciclo de vida e o commit de cada run.
2. Cada passo é uma transação lógica global, não uma coleção de commits independentes por domínio.
3. Cálculo ocorre fora da transação IndexedDB; persistência do commit é curta e atômica.
4. Apenas estado confirmado pode mover o ponteiro aceito e atualizar a visualização.
5. Cada tentativa é isolada e vinculada à base aceita de que partiu.
6. Um escritor por run; concorrência de commit usa revisão otimista.
7. Cancelar interrompe em fronteira segura e não desfaz commit concluído.
8. Retomar parte de checkpoint aceito, nunca de iteração parcial.
9. Versões de dependência ficam congeladas por execução.
10. O tipo de coordenada física é explícito e não deriva do frame visual.
11. O orquestrador não contém equações constitutivas ou métodos numéricos específicos.
12. A2 é contrato de execução; sua aprovação não homologa solvers nem autoriza modo quantitativo.

## 17. Próxima etapa

Depois da revisão A2, a implementação deverá começar por um orquestrador sem solver real, usando solvers simulados de teste para demonstrar ciclo de vida, transação, rollback, cancelamento, retomada e concorrência. Somente após esses testes, integrar o primeiro par de solvers homologados em B — E+T.
