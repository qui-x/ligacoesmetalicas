# Registro de experiências — Etapa 9 do Explorar

> **Status:** especificação de registro, rastreabilidade e reprodutibilidade.  
> **Escopo:** execuções no Explorar e sua ligação com investigação livre, roteiros, missões, Caderno, Medir e Calcular.  
> **Implementação:** auditoria e contrato-alvo; nenhum código, schema ou arquivo de dados foi alterado.

## 1. Objetivo

Definir como o SILM registra uma experiência para que seja possível compreender o que foi investigado, identificar as condições, reconstruir a sequência relevante de ações e avaliar até que ponto o resultado pode ser reproduzido.

O registro preserva informação científica útil, não cada detalhe de apresentação. Não deve salvar um documento a cada quadro de animação, movimento de partícula, redesenho, alteração de zoom ou evento de ponteiro.

O registro deve responder:
- Qual metal e qual estrutura foram investigados?
- Qual foi a experiência principal?
- Quais estímulos auxiliares foram aplicados e em quais condições?
- Quais parâmetros foram alterados e quais valores foram efetivamente usados?
- Qual versão dos motores e dos dados produziu a resposta?
- Quais observações, medidas e cálculos foram produzidos?
- Quais limitações afetam a possibilidade de reprodução?
- O que foi informado pela pessoa e o que foi produzido pelo modelo?

O registro é infraestrutura do domínio. Não cria módulo novo: Explorar, Medir e Calcular continuam sendo os únicos módulos científicos.

## 2. Auditoria do armazenamento atual

O SILM já possui mecanismos de persistência com finalidades distintas. Eles não são equivalentes a um registro completo de execução.

### 2.1 Estado científico

O serviço em domain/silm/state.js mantém o estado científico no schema 8. Ele persiste identidade da investigação e do metal, estrutura, modelo eletrônico, propriedade ativa e seus parâmetros, medições, cálculos, condições e observações em texto.

O serviço valida o estado antes de restaurá-lo. O snapshot atual representa a condição presente, não a sequência completa da experiência.

O schema inclui observations como uma lista de textos, mas o serviço de domínio auditado não expõe um comando dedicado para registrar observações estruturadas com autoria, horário, origem ou vínculo a um evento. Essa lacuna deve ser resolvida pelo contrato de registro, sem converter anotações livres em fatos calculados.

### 2.2 Histórico

js/experience/history.js registra eventos simples com horário, ação, detalhe textual e alvo opcional. Usa escopos, armazenamento próprio e limite padrão de 300 entradas.

É adequado para uma linha do tempo legível, mas não guarda necessariamente parâmetros completos, unidades, versões dos motores, estado anterior/posterior ou proveniência. O próprio contrato o distingue do relatório e do Desfazer.

O registro científico não deve depender do limite de 300 entradas do Histórico. Excluir ou limpar o Histórico não pode apagar uma execução arquivada.

### 2.3 Sessões, roteiros e missões

js/experience/activity.js mantém metadados de sessão, como identificador, tipo, módulo, horário, situação, objetivos e identidade opcional. A família de atividades arquiva até 30 sessões.

domain/silm/route-session.js guarda checkpoints do estado científico, contexto de atividade, evidências e campos de relatório para roteiros e missões. Permite retomar tentativas e restaurar a investigação livre ao encerrar.

Esse mecanismo é valioso, mas atende atividades orientadas. Não define, por si só, um registro detalhado e comum para cada execução de propriedade em Explorar.

### 2.4 Relatórios e Caderno

js/experience/reports.js guarda campos textuais e seções serializáveis do relatório. integracao/route-ui.js e integracao/unified-ui.js montam relatórios a partir de checkpoints, estado científico e textos.

O Caderno guarda anotações, hipóteses, conclusões e referências a relatórios/atividades. O backup silm-notebook-v2 inclui o documento do Caderno e arquivos de relatórios associados. A política atual limita o Caderno a 80 notas de até 1.200 caracteres.

Relatório e Caderno são espaços de documentação humana. Não devem ser a fonte canônica dos dados internos dos motores nem duplicar toda a linha do tempo.

### 2.5 Medir e Calcular

domain/silm/measurements.js e domain/silm/calculations.js já produzem registros validados.

- Medições guardam instrumento, valor, unidade, resolução, pontos, sítios, contexto estrutural e origem MODEL_MEASUREMENT.
- Cálculos guardam fórmula, entradas e origens, resultado, unidade, constantes, modelo, referências, dependências e contexto estrutural.

Esses serviços continuam sendo a fonte canônica de medidas e cálculos. A execução experimental deve referenciá-los por identificador, sem criar cópias concorrentes.

### 2.6 Exportação atual

A exportação da investigação livre em integracao/adapter.js usa o formato silm-scientific-investigation, versão 1, contendo o snapshot scientificState.

Ela transporta o estado científico atual, mas não inclui a linha do tempo de ações, as versões dos motores, parâmetros transitórios, sementes aleatórias ou checkpoints da execução. Importar esse arquivo restaura uma investigação, não reproduz a história da experiência.

## 3. Conceitos que devem permanecer distintos

| Conceito | Pergunta respondida | Conteúdo canônico |
|---|---|---|
| Investigação | Qual metal/amostra está sendo estudado? | Identidade, metal, estrutura e estado atual. |
| Execução experimental | O que aconteceu em uma experiência específica? | Experiência principal, estímulos, eventos, checkpoints e saídas. |
| Sessão de atividade | Em qual roteiro, missão ou atividade ocorreu o trabalho? | Contexto pedagógico, tentativa e progresso. |
| Histórico | Quais ações recentes ocorreram? | Linha do tempo resumida e legível. |
| Relatório | Como a investigação é descrita e interpretada? | Síntese, tabelas, texto e conclusão. |
| Caderno | Quais anotações devem ser preservadas? | Registros humanos e referências arquivadas. |
| Medição | Qual valor foi obtido pelo instrumento sobre o modelo? | Registro MODEL_MEASUREMENT validado. |
| Cálculo | Qual resultado foi derivado por uma fórmula? | Registro CALCULATED validado. |

Uma investigação pode conter várias execuções. Uma execução pode produzir observações, medidas, cálculos e anotações. Uma sessão de roteiro pode conter ações experimentais, mas seu identificador não substitui o identificador da execução.

## 4. Unidade de registro: execução experimental

A unidade proposta é a **execução experimental** (experiment run), identificada por runId, independente de investigation.id e sessionId.

- investigation.id identifica a investigação e o contexto geral da amostra.
- runId identifica uma execução de uma experiência principal.
- sessionId identifica a sessão/atividade pedagógica, quando existir.
- measurement.id e calculation.id identificam os resultados produzidos pelos serviços correspondentes.

Trocar a experiência principal encerra a execução anterior e pode iniciar outra, sem criar nova investigação nem trocar o metal. Aplicar ou desligar um estímulo auxiliar cria eventos na mesma execução, não uma execução independente.

### 4.1 Ciclo de vida

| Estado | Significado |
|---|---|
| draft | Contexto preparado, experiência ainda não iniciada. |
| active | Experiência em execução, aceitando comandos autorizados. |
| paused | Evolução temporal suspensa, com contexto preservado. |
| completed | Execução encerrada normalmente, com snapshot final. |
| restored | A experiência retornou ao estado-base por ação de restaurar. |
| interrupted | Execução encerrada por troca de contexto, recarga ou abandono sem conclusão normal. |
| invalidated | Contexto ou versão necessária não pode mais ser validado. |

Restaurar não apaga o registro. É um evento que indica retorno ao estado-base. A execução pode continuar ativa depois da restauração, se a ação significar apenas limpar a perturbação.

Encerrar a experiência é diferente de encerrar a investigação. Encerrar a investigação não deve apagar registros já arquivados.

## 5. Conteúdo mínimo do registro

O registro terá envelope versionado independente do schema científico.

### 5.1 Identificação e contexto

- formato: silm-experiment-record;
- formatVersion;
- recordId e runId;
- investigationId e sessionId opcional;
- createdAt, startedAt e endedAt;
- status;
- identificador e versão da aplicação;
- sourceRevision: commit/build, quando conhecido;
- scientificSchemaVersion;
- elemento: número atômico, símbolo e fonte da identidade;
- estrutura: modo, tipo, identificador da referência, fonte e condições;
- fase, temperatura, pressão e demais condições, com unidade e origem;
- experiência principal e estímulos auxiliares;
- contexto de atividade, quando houver.

### 5.2 Metadados dos motores

Cada motor participante registra:
- identificador e versão do algoritmo;
- classe de evidência: QUALITATIVE, modelo físico quantitativo ou algoritmo geométrico;
- parâmetros efetivamente usados;
- versão do conjunto de dados e fontes consultadas;
- faixa e condições de validade;
- indicação de determinismo;
- semente aleatória, quando aplicável;
- passo e método de integração, quando aplicáveis;
- unidades e interpretação dos parâmetros normalizados;
- commit/build do código, quando disponível.

A versão da aplicação não substitui a versão do motor. Uma aplicação pode conter vários motores com versões e limitações diferentes.

### 5.3 Linha do tempo sem quadros

A linha do tempo registra comandos científicos e eventos semânticos, não atualizações de tela.

Eventos candidatos:
- run.started;
- stimulus.applied e stimulus.released;
- parameter.changed;
- source.positioned;
- load.changed;
- engine.checkpoint;
- observation.added;
- measurement.linked;
- calculation.linked;
- run.paused e run.resumed;
- run.restored;
- run.completed e run.interrupted.

Cada evento contém, quando aplicável:
- sequência crescente seq e eventId;
- type;
- horário UTC em ISO 8601;
- stepIndex ou tempo de simulação;
- comando e alvo;
- parâmetro, valor, unidade, origem e classificação;
- motor responsável;
- resumo da saída ou referência ao checkpoint;
- resultado de validação ou motivo de recusa, quando relevante.

A ordem canônica é seq, não a ordenação lexical de horários. O relógio do dispositivo pode ser ajustado; a sequência do domínio deve continuar monotônica.

### 5.4 Parâmetros e checkpoints

Registrar estado inicial e final da execução, além de checkpoints semanticamente importantes:

1. início da experiência;
2. ativação ou alteração de estímulo auxiliar;
3. mudança de parâmetro relevante;
4. resultado de ação discreta, como deslizamento plástico;
5. pausa ou restauração;
6. encerramento.

Não criar checkpoint em cada quadro. Para uma variável manipulada continuamente, registrar o valor inicial, o valor final e mudanças significativas, com uma política de amostragem definida somente quando a trajetória completa for necessária.

O checkpoint contém os dados necessários para reconstruir o estado da execução. Na exportação autossuficiente, os dados necessários devem estar incluídos ou identificados por uma dependência inequívoca.

## 6. Esquema conceitual

A estrutura abaixo é apenas uma lista de campos do contrato, não um schema implementado:

| Grupo | Campos propostos |
|---|---|
| Envelope | format, formatVersion, recordId, runId, investigationId, sessionId |
| Datas/situação | createdAt, startedAt, endedAt, status |
| Aplicação | id, version, sourceRevision, scientificSchemaVersion |
| Contexto | element, structure, phase, temperature, pressure, sourceIds |
| Experiência | primary, auxiliary[], evidenceClass |
| Motores | id, version, deterministic, seed, parameters, sources, validity |
| Linha do tempo | seq, eventId, type, at, stepIndex, command, values, engineId |
| Checkpoints | checkpointId, reason, stateRef/stateSnapshot, seq |
| Resultados | observationRefs, measurementRefs, calculationRefs |
| Anotações | userNotes com origem, autoria opcional e vínculo |
| Reprodutibilidade | level e missing[] |

Campos desconhecidos não devem ser preenchidos por valores presumidos. Valor ausente deve permanecer ausente ou explicitamente não registrado.

## 7. Graus de reprodutibilidade

Não prometer reprodução exata quando dados ou parâmetros necessários não existem.

| Nível | Nome | O que permite |
|---|---|---|
| R0 | Arquivado | Consultar contexto, resultados preservados e limitações; sem reconstrução da execução. |
| R1 | Reconstruível | Recriar experiência, estrutura, parâmetros registrados e sequência semântica, mas sem garantia de resultados idênticos. |
| R2 | Reexecução determinística | Reexecutar com versões idênticas de motores, dados e código, mesmos parâmetros, condições, sequência e sementes, obtendo resultado comparável dentro da tolerância declarada. |

O nível é atribuído pelo conteúdo presente. Ausência de versão do motor, commit, semente, parâmetro transitório ou dados de referência reduz o nível e deve aparecer em reproducibility.missing.

R2 não significa validação física. Uma execução qualitativa pode ser determinística e continuar sendo uma representação didática.

### 7.1 Aleatoriedade e animação

- Registrar sementes e algoritmo pseudoaleatório quando afetarem resultados.
- Se o movimento dos marcadores for apenas apresentação, ele não rebaixa a reprodução do resultado científico independente.
- Se uma saída depender de amostragem estocástica, semente e parâmetros do gerador são essenciais para R2.
- Se o motor não suportar semente ou replay, declarar R1 ou R0.
- Posição de partícula visual não é observação experimental de um elétron individual.

## 8. Observações e autoria

O registro deve separar quatro origens:

1. Evento do sistema: ação aceita ou transição emitida pelo domínio.
2. Observação gerada pelo modelo: descrição de saída derivada do snapshot do motor.
3. Observação do estudante: texto livre explicitamente identificado como anotação humana.
4. Interpretação/conclusão: explicação escrita por estudante ou professor, não calculada pelo motor.

Cada observação estruturada deve ter identificador, horário, origem, conteúdo e vínculo opcional a evento/checkpoint. Não atribuir observações ao estudante automaticamente a partir de narrativas geradas pelo sistema.

A identidade pessoal em atividades orientadas permanece opcional e controlada pela camada de sessão. A investigação livre não deve coletar nome, e-mail, turma ou outro dado pessoal automaticamente.

## 9. Integração com os registros existentes

### 9.1 Histórico

O Histórico continua mostrando ações em linguagem curta. Pode apresentar resumo dos eventos da execução, mas não precisa armazenar os campos científicos completos. Limpar o Histórico não elimina execuções arquivadas.

### 9.2 Caderno

O Caderno recebe notas, hipóteses, conclusões e relatórios selecionados. Não duplica a linha do tempo nem todos os checkpoints. Uma ação futura de registrar execução pode criar nota com vínculo ao recordId e resumo humano. Excluir a nota não elimina o registro científico original.

### 9.3 Relatório

O relatório sintetiza contexto, objetivo, condições, estímulos, resultados, fontes, limitações, observações e conclusão. Deve ler o registro e as referências canônicas de Medir e Calcular. Texto do estudante não pode ser sobrescrito por síntese automática.

### 9.4 Medir e Calcular

O registro experimental guarda measurement.id e calculation.id. Os registros originais permanecem canônicos nos seus serviços.

Na exportação, as referências precisam ser resolvíveis. O pacote autossuficiente inclui os registros referenciados ou declara claramente as dependências externas.

A relação de dependência de cálculo continua usando identificadores de medidas e cálculos. Uma medida do modelo não vira observação manual; um cálculo não vira dado tabelado.

### 9.5 Roteiros e missões

A execução científica associa-se opcionalmente a sessionId e ao contexto da atividade. O checkpoint pedagógico continua verificando objetivos; o registro experimental cuida dos eventos e parâmetros científicos.

Retomar uma sessão não deve criar novo runId para a mesma execução sem um evento explícito de retomada. Arquivar uma tentativa preserva os registros relacionados.

## 10. Exportação, importação e integridade

### 10.1 Formatos distintos

Manter três artefatos com finalidades claras:

- Investigação científica: snapshot atual, no formato existente silm-scientific-investigation.
- Registro experimental: pacote de uma execução ou conjunto de execuções, no formato silm-experiment-record.
- Backup do Caderno: notas e relatórios, no formato existente silm-notebook-v2.

Não mudar o significado dos formatos existentes. Uma exportação composta poderá reunir investigação, execuções e referências, desde que tenha manifesto claro.

### 10.2 Pacote autossuficiente

Quando a pessoa escolher exportar para reprodução, incluir:
- registro(s) de execução;
- snapshot/checkpoint inicial e final conforme nível de reprodução;
- metadados e versões dos motores;
- referências e snapshots dos dados numéricos utilizados;
- medições e cálculos referenciados;
- observações e notas vinculadas;
- manifesto de arquivos, versões e integridade.

Se arquivo externo não for incluído, declarar a dependência e não alegar que o pacote é autossuficiente.

### 10.3 Integridade e validação

- Validar formato e versão antes de importar.
- Migrar versões explicitamente; não reinterpretar silenciosamente campos críticos.
- Conferir IDs e referências cruzadas.
- Validar metal, estrutura, fases, condições, fontes, unidades e aplicabilidade.
- Detectar eventos repetidos, sequências inválidas e tempos não monotônicos quando aplicáveis.
- Calcular hash do pacote/manifesto para detectar alteração acidental; hash não substitui validação ou assinatura de autoria.
- Importar primeiro para área temporária, validar tudo e só então efetivar a gravação transacional.
- Em falha, preservar os registros existentes.

Importar registro antigo deve abrir visualização arquivada ou cópia de trabalho. Não deve sobrescrever silenciosamente a investigação atual.

## 11. Persistência, desempenho e retenção

- Gravar eventos em ações semânticas aceitas pelo domínio, não em eventos de ponteiro ou quadros de renderização.
- Criar checkpoint no início, em mudanças relevantes e no encerramento.
- Agrupar atualizações contínuas em intervalos definidos e registrar valores aplicados, não dezenas de eventos por segundo.
- Usar escrita transacional ou mecanismo equivalente para manter evento, checkpoint e referência coerentes.
- Detectar falha de armazenamento e avisar antes de afirmar que o registro foi salvo.
- Não apagar registros antigos automaticamente sem política de retenção visível e backup.
- Permitir exportar e excluir registros explicitamente.
- Definir limites de tamanho e tratamento de quota antes de implementar.
- Não armazenar imagens de cada quadro; capturas de tela são anexos opcionais, não evidência física por si só.

O estado científico pode continuar sendo salvo automaticamente. A trilha experimental usa eventos e checkpoints, sem transformar cada frame em persistência.

## 12. Testes exigidos

### 12.1 Identidade e ciclo de vida

- Cada execução possui runId próprio, diferente de investigation.id e sessionId.
- Trocar a experiência principal encerra a execução anterior e cria outra sem duplicar a investigação.
- Aplicar/desligar estímulo auxiliar gera evento na execução atual.
- Restaurar registra a restauração sem apagar a linha do tempo.
- Encerrar a investigação não elimina registros arquivados.
- Retomar preserva identidade e sequência, ou declara nova execução se o contexto mudou.

### 12.2 Conteúdo e proveniência

- Cada valor numérico possui unidade, origem e condição quando aplicáveis.
- Parâmetro normalizado é identificado como didático/qualitativo.
- Motores, dados, fontes e commits são identificados pelas versões usadas.
- Referências a medidas e cálculos resolvem IDs e contextos compatíveis.
- Observações do estudante permanecem distintas das descrições geradas pelo modelo.
- Nenhuma informação ausente é preenchida por valor típico.

### 12.3 Reprodutibilidade

- R0/R1/R2 corresponde aos dados realmente presentes.
- R2 reproduz resultados determinísticos com mesmas versões, dados, sementes e parâmetros.
- Mudança de versão de motor ou fonte é detectada.
- Registro sem parâmetros transitórios não pode ser R2.
- Animação de apresentação não altera hash/estado científico do checkpoint.
- Replay não depende de zoom, projeção, janela ou visibilidade de camadas.

### 12.4 Integridade e recuperação

- Exportação inclui referências obrigatórias ou declara dependências externas.
- Importação inválida não altera os dados existentes.
- Hash divergente é sinalizado.
- Escrita interrompida não deixa evento sem checkpoint quando a transação exige ambos.
- Limite/quota não produz mensagem falsa de sucesso.
- Migrações preservam registros antigos e mantêm nível de reprodução honesto.

### 12.5 Privacidade e acessibilidade

- Nenhum dado pessoal é coletado automaticamente no laboratório livre.
- Identidade só é incluída quando fornecida no contexto da atividade.
- Exportação informa os dados pessoais que serão incluídos.
- Linha do tempo possui rótulos textuais e não depende só de cor ou animação.
- Consulta e exportação são operáveis por teclado e leitor de tela.

## 13. Ordem de implementação futura

1. Criar schema de registro independente do schema científico 8.
2. Definir comandos de domínio para iniciar, registrar evento, criar checkpoint, anexar observação e encerrar execução.
3. Conectar os dois acoplamentos existentes e as experiências individuais ao registro, sem instrumentar quadros.
4. Capturar metadados dos motores, parâmetros transitórios, dados de referência e versão do código.
5. Ligar resultados de Medir e Calcular por referências canônicas.
6. Integrar relatórios e Caderno por referências, sem duplicar conteúdo científico.
7. Criar exportação/importação de pacote validado, com integridade e migração.
8. Implementar testes de reexecução e classificador R0/R1/R2.

A instrumentação não deve alterar as equações nem o resultado dos motores. Primeiro registrar o que existe; depois, em ciclos próprios, evoluir motores e dados quantitativos.

## 14. Critérios de aceitação da Etapa 9

- [ ] Investigação, execução, sessão, histórico, relatório e Caderno possuem papéis distintos.
- [ ] Execução experimental tem identidade própria.
- [ ] Ciclo de vida da execução está definido.
- [ ] Linha do tempo registra ações semânticas, não quadros.
- [ ] Parâmetros transitórios necessários à reconstrução são capturados.
- [ ] Motores e conjuntos de dados são identificáveis por versão.
- [ ] Medidas e cálculos são vinculados sem duplicar registros canônicos.
- [ ] Observações geradas e anotações humanas são diferenciadas.
- [ ] Níveis de reprodutibilidade são honestos.
- [ ] Exportação, importação, integridade, privacidade e retenção possuem contratos.
- [ ] Testes de ciclo de vida, proveniência, replay e recuperação estão definidos.

## 15. Fechamento do aprofundamento do Explorar

Com a Etapa 9, conclui-se a sequência de especificação do Explorar:

1. Contrato operacional.
2. Estímulo luminoso.
3. Estímulo térmico.
4. Estímulo elétrico.
5. Estímulo mecânico.
6. Combinações de estímulos.
7. Camadas de visualização.
8. Motor científico.
9. Registro de experiências.

O aprofundamento está concluído em nível de documentação, não de implementação. As nove especificações formam requisitos verificáveis para uma futura fase de planejamento operacional e desenvolvimento.

O [Plano operacional de implementação do Explorar](PLANO-IMPLEMENTACAO-EXPLORAR.md) converte os nove contratos em fases priorizadas, com dependências entre estado, orquestração, motores, dados, interface, registro, exportação e testes.

## 16. Referências internas auditadas

- domain/silm/state.js — estado científico schema 8, validação, persistência, medidas e cálculos.
- domain/silm/measurements.js — medidas do modelo e proveniência.
- domain/silm/calculations.js — fórmulas, entradas, dependências e validação.
- js/experience/history.js — linha do tempo com limite e escopo.
- js/experience/activity.js — metadados e arquivo de sessões/atividades.
- js/experience/reports.js — campos de relatório e captura de seções serializáveis.
- domain/silm/route-session.js — checkpoints, evidências, tentativas e restauração de roteiros/missões.
- integracao/unified-ui.js — relatório livre, Caderno, referências e backup silm-notebook-v2.
- integracao/adapter.js — exportação/importação do snapshot silm-scientific-investigation.
- integracao/route-ui.js — relatórios e integração com atividades orientadas.
- domain/silm/thermal.js, deformation.js, drive.js e electron-view.js — estados transitórios e parâmetros dos motores atuais.

## 17. Limites desta entrega

Esta etapa conclui a especificação do registro de experiências. Não houve alteração de código, schema, migração, exportação, importação, interface, armazenamento ou testes. A branch main não será alterada nesta fase documental.
