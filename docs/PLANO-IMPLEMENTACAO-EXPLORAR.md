# Plano operacional de implementação — Explorar

> **Status:** plano técnico de execução derivado das nove especificações do Explorar.  
> **Branch de referência:** especificacoes-atuais.  
> **Escopo desta entrega:** planejamento e rastreabilidade; nenhuma implementação é autorizada ou realizada por este documento.  
> **Regra de publicação:** desenvolver em branch de trabalho; não integrar em main sem homologação e autorização explícita.

## 1. Objetivo e resultado esperado

Transformar os contratos do Explorar em uma sequência incremental de implementação, com dependências explícitas, arquivos previstos, entregas verificáveis, testes e critérios para avançar.

O resultado final deve permitir que o Explorar:
- mantenha uma investigação científica única e consistente;
- execute experiências individuais e combinações aprovadas sem duplicar variáveis ou relógios;
- separe a evolução científica da animação e da apresentação;
- diferencie modelo qualitativo, modelo quantitativo, dado tabelado, medida do modelo e cálculo;
- registre execuções com condições, parâmetros, versões e proveniência;
- possa reconstruir ou reexecutar uma experiência até o grau realmente suportado;
- permaneça integrado a Medir e Calcular, sem transformá-los em partes do orquestrador;
- mantenha os dados antigos válidos por migração testada e reversível.

Este plano não cria um quarto módulo, submódulos nem novas famílias de estímulos. Os módulos permanecem Explorar, Medir e Calcular.

## 2. Decisões de execução

### 2.1 Desenvolvimento em incrementos homologáveis

Cada fase deve terminar em um estado funcional, testável e revisável. Não acumular a troca de schema, relógio, motores físicos, interface e exportação em um único conjunto de alterações.

### 2.2 Preservar o comportamento antes de alterar a física

A primeira integração do orquestrador deve coordenar os motores qualitativos atuais sem alterar suas regras científicas. Primeiro provar que os resultados existentes permanecem equivalentes; depois evoluir um fenômeno por vez.

### 2.3 Separar versão do produto, schema, motor e banco de dados

São identificadores diferentes:
- versão do produto SILM;
- versão do schema do estado científico;
- versão do formato de registro experimental;
- versão do algoritmo de cada motor;
- versão/revisão do banco de dados e das fontes.

Uma atualização de apresentação não precisa alterar o schema científico. Uma atualização de fórmula ou método numérico exige versão própria do motor e novos testes de referência.

### 2.4 Não promover modelo qualitativo por simples preenchimento do banco

Adicionar uma propriedade ao banco não torna um motor quantitativo. Um motor físico dimensional exige implementação própria, parâmetros homologados, faixa de validade, unidades, método numérico e validação independente.

### 2.5 Não migrar o schema científico sem necessidade demonstrada

O estado atual usa schema 8. O registro experimental deve começar em formato versionado separado, sem aumentar o schema do estado científico apenas para armazenar a linha do tempo. Uma futura referência de execução dentro do estado só justificará migração se a integração exigir essa relação persistida.

### 2.6 Uma variável, um proprietário

Cada variável física ou didática tem um único motor responsável. Outros motores recebem a saída pela interface do acoplamento. Não duplicar temperatura, carga, campo, energia ou avanço temporal.

### 2.7 Main é publicação, não ambiente de desenvolvimento

Todas as fases serão executadas em branch de trabalho. A integração final exige testes completos, revisão do diff, validação dos arquivos gerados e homologação. Este plano não autoriza merge, release ou alteração de main.

## 3. Diagnóstico de partida do repositório

A auditoria consultou a branch especificacoes-atuais no commit 956756b996ed971ea8e59c6f4bb99b26bd98cc43 e identificou:

| Área | Situação de partida | Consequência operacional |
|---|---|---|
| Estado científico | Schema 8, validação estrita, serviço de escrita único | Preservar o contrato existente; migração apenas com necessidade comprovada. |
| Dados | 118 elementos; 65 com elegibilidade SILM disponível; fontes versionadas | Elegibilidade não significa que existam parâmetros quantitativos para cada motor. |
| Propriedades | Catálogo, elegibilidade, parâmetros e narrativas coexistem em properties.js | Separar catálogo/descrição de algoritmo sem romper a API de domínio de uma só vez. |
| Térmico | thermal.js usa grafo e integração contínua própria, coeficiente didático | Adotar primeiro relógio comum; modelo físico depende de dados térmicos e condições. |
| Mecânico | deformation.js tem controlador e parâmetros de limiar normalizados | Preservar a representação atual; tensão, módulo e escoamento reais exigem dados por material. |
| Elétrico | drive.js controla estímulo; electron-view.js anima marcadores e aplica fatores qualitativos | Distinguir campo visual, transporte qualitativo e futuro transporte dimensional. |
| Luminoso | Reflexão geométrica; ângulo mínimo atual de 5° | Não declarar resposta espectral por metal antes de curadoria e homologação óptica. |
| Representação | representation.js e campos de visualização coexistem com parte do estado de domínio | Migrar visibilidade/câmera sem alterar o resultado científico. |
| Medir e Calcular | Serviços independentes, com validação, unidades e proveniência | Continuar independentes; execução apenas referencia seus registros. |
| Registro | Histórico, sessão, relatório, Caderno, checkpoint de roteiro e exportação da investigação têm papéis parciais | Criar registro de execução separado e integrá-lo progressivamente. |
| Testes | Há suites científicas, de integração, rotas, persistência, mobile e paridade | Ampliar a cobertura nos pontos de acoplamento e regressão determinística. |

A base quantitativa não deve ser presumida suficiente: a auditoria anterior encontrou 0 elementos com o conjunto de propriedades numéricas de SILM populado, apesar da disponibilidade de metais e de 91 fontes no catálogo consultado. A implementação quantitativa deve, portanto, ser condicionada à curadoria específica de cada propriedade e metal.

### 3.1 Ferramentas de build e teste disponíveis

O package.json fornece, entre outros:
- npm run build — valida dados e estado, gera artefatos e verifica versão;
- npm run test:scientific — dados, cobertura cristalina, estrutura, deformação, térmico, elétrico e estado;
- npm run test:routes — service worker, rotas, armazenamento durável e atividades;
- npm run test:learning — temas/aprendizagem;
- npm run test:integration — build de integração e testes de integração;
- npm run test:backup — backup do Caderno;
- npm run test:comparison — comparação, elétrons 3D, montagem e interação;
- npm run test:mobile-mechanics — mecânicas mobile;
- npm run test:a11y — acessibilidade do workspace;
- npm run test:parity — paridade visual/funcional.

Não foram executados testes durante a elaboração deste plano.

## 4. Dependências entre as fases

A ordem não é uma lista arbitrária de funcionalidades. As fases de fundação precisam preceder a instrumentação dos motores; dados e validação precisam preceder resultados quantitativos.

| Fase | Entrega central | Depende de |
|---|---|---|
| F0 | Baseline, inventário e contratos congelados | Nenhuma |
| F1 | Catálogo de motores, contratos e adaptadores | F0 |
| F2 | Relógio comum e orquestrador | F1 |
| F3 | Registro experimental versionado | F1; integra-se ao ciclo de vida de F2 |
| F4 | Acoplamentos atuais coordenados | F2 |
| F5 | Representação separada do estado científico | F0 e F1; pode avançar após F2 sem alterar física |
| F6 | Dados, validadores e elegibilidade quantitativa | F1; curadoria específica por fenômeno |
| F7 | Evolução térmica | F2, F4 e F6 |
| F8 | Evolução elétrica e acoplamento térmico | F2, F4, F6 e F7 |
| F9 | Evolução mecânica | F2, F4 e F6 |
| F10 | Resposta óptica espectral e colorimetria | F1 e F6 |
| F11 | Medir/Calcular, relatórios, Caderno e pacote de exportação integrados ao registro | F3 e serviços de F1; consolida as fases científicas |
| F12 | Homologação integral e integração | Todas as fases selecionadas e aprovadas |

A sequência de motores depois da infraestrutura pode ter trabalho paralelo de curadoria, mas a integração final de cada motor respeita suas dependências. O motor elétrico quantitativo depende do modelo térmico para o acoplamento de temperatura; a combinação não poderá ser habilitada antes de ambos os contratos e parâmetros estarem válidos.

## 5. Fases de implementação

### F0 — Baseline e proteção de regressão

**Objetivo:** medir o comportamento atual e congelar evidências antes de qualquer mudança.

**Arquivos e áreas:**
- package.json e scripts de validação;
- domain/silm/state.js;
- domain/silm/thermal.js, deformation.js, drive.js e electron-view.js;
- tests/thermal.cjs, tests/deformation.cjs, tests/drive.cjs;
- tests/suites/s080-explorar.cjs, s090-medir.cjs e s100-calcular.cjs;
- testes de armazenamento, backup, integração e navegação.

**Entregas:**
1. Registrar o commit-base e versões atuais de produto, schema, motores e dados.
2. Executar os testes existentes e guardar saídas de referência.
3. Registrar os fluxos manuais reproduzíveis de luz, calor, elétrica, mecânica e os dois pares atualmente acoplados.
4. Criar casos de regressão para montagem livre e estrutura cristalina.
5. Identificar resultados intencionalmente qualitativos para que não sejam comparados como grandezas físicas.

**Critério de saída:** baseline verde ou lista de falhas anteriores aprovada e separada das regressões novas. Nenhuma falha preexistente deve ser silenciosamente atribuída à fase seguinte.

### F1 — Contrato de motores e adaptadores

**Objetivo:** tornar explícita a identidade, a aplicabilidade e o ciclo de vida de cada motor sem ainda mudar a física.

**Arquivos previstos:**
- domain/silm/properties.js;
- domain/silm/thermal.js;
- domain/silm/deformation.js;
- domain/silm/drive.js;
- domain/silm/electron-view.js;
- domain/silm/crystal.js;
- domain/silm/data-api.js;
- testes específicos dos motores.

**Entregas:**
1. Criar catálogo/descritor de motores com ID estável, versão, evidência, aplicabilidade, entradas, saídas, unidades, condições, dependências e capacidades temporais.
2. Definir contrato comum compatível com motores dinâmicos e funções estáticas. Operações candidatas: validate, initialize, step, observe, reset, dispose.
3. Distinguir motor científico de camada de animação. electron-view permanece renderer de marcadores enquanto não existir solver eletrônico.
4. Manter properties.js como catálogo de propriedades, elegibilidade, parâmetros declarativos e narrativas; não concentrar algoritmos novos nele.
5. Criar adaptadores finos para preservar as interfaces existentes durante a migração.

**Critério de saída:** cada motor atual possui descritor verificável; funções puras não são forçadas a criar ciclo temporal; não há alteração intencional de resultados nesta fase.

### F2 — Relógio comum e orquestrador

**Objetivo:** coordenar os motores dinâmicos e as experiências acopladas com sequência temporal única.

**Arquivos previstos:**
- novo domain/silm/experiment-orchestrator.js ou equivalente (nome a confirmar no desenho técnico);
- domain/silm/thermal.js;
- domain/silm/deformation.js;
- domain/silm/drive.js;
- domain/silm/electron-view.js;
- integracao/metallic-experience.js;
- integracao/adapter.js;
- testes de motores e integração.

**Entregas:**
1. Um relógio de simulação único para motores científicos que evoluem juntos.
2. Passo fixo declarado para a simulação; renderização pode ter frequência diferente.
3. Ordem explícita: validar comandos, aplicar entradas, avançar motores uma vez, resolver acoplamentos, publicar observações/checkpoint.
4. Pausa, retoma, reset, dispose e suspensão ao sair de Explorar.
5. Respeitar movimento reduzido e aba em segundo plano sem fazer a física depender da taxa de quadros.
6. Controladores térmico e mecânico deixam de avançar independentemente a mesma experiência. A animação eletrônica conserva ciclo visual próprio, sem comandar o tempo científico.
7. Erros e indisponibilidade de motor devem falhar com estado seguro, sem congelar ou corromper a investigação.

**Critério de saída:** uma experiência acoplada avança cada motor científico uma vez por passo; mesma entrada e mesma sequência produzem a mesma saída dentro da precisão declarada; suspender a apresentação não altera o resultado científico.

### F3 — Registro experimental versionado

**Objetivo:** implementar o formato e o ciclo de vida do registro descritos em REGISTRO-EXPERIENCIAS.md.

**Arquivos previstos:**
- novo domain/silm/experiment-record.js ou serviço equivalente;
- novo schema/validador próprio do registro;
- integracao/metallic-experience.js;
- integracao/adapter.js;
- domain/silm/state.js apenas se uma referência persistente à execução for estritamente necessária;
- testes de persistência, recuperação e replay.

**Entregas:**
1. runId independente de investigation.id e sessionId.
2. Envelope versionado separado do schema científico 8.
3. Eventos semânticos, sequência monotônica, checkpoints e estados do ciclo de vida.
4. Captura dos parâmetros transitórios efetivamente usados, das versões de motores e das fontes.
5. Classificador R0/R1/R2 com lista explícita de requisitos ausentes.
6. Integridade transacional entre eventos, checkpoints e referências.
7. Recuperação após recarga e falha de armazenamento sem declarar sucesso falso.
8. Política de retenção e limites de tamanho documentados.

**Critério de saída:** uma execução pode ser criada, pausada, retomada, restaurada, encerrada, exportada e validada sem registrar frames e sem modificar o estado científico canônico por fora do serviço.

### F4 — Catálogo e coordenação dos acoplamentos existentes

**Objetivo:** migrar os dois pares atualmente aceitos para contratos explícitos de acoplamento.

**Arquivos previstos:**
- novo catálogo de combinações em domain/silm ou no orquestrador;
- domain/silm/properties.js;
- domain/silm/thermal.js;
- domain/silm/deformation.js;
- domain/silm/drive.js;
- domain/silm/electron-view.js;
- integracao/metallic-experience.js;
- tests/drive.cjs, tests/thermal.cjs, tests/deformation.cjs e tests/suites/s080-explorar.cjs.

**Combinações cobertas:**
- elétrica + calor: temperatura local afeta a resposta de transporte qualitativa existente;
- deformação + campo elétrico: defeitos didáticos afetam espalhamento/deriva qualitativos.

**Entregas:**
1. Declarar compatibilidade, pré-condições, proprietários das variáveis e ordem causal.
2. Corrigir a divergência de intensidade do campo entre montagem livre e vista cristalina.
3. Garantir que desligar o campo não apague instantaneamente a temperatura que já existe.
4. Garantir que o motor elétrico não aplique aquecimento Joule enquanto não houver grandezas dimensionadas.
5. Recusar explicitamente combinações não homologadas.
6. Impedir combinações triplas/quádruplas não especificadas.

**Critério de saída:** os pares existentes mantêm o comportamento didático previsto, sem atualização duplicada, e a matriz de combinações é aplicada pelo domínio/orquestrador, não por regras dispersas na UI.

### F5 — Separação de estado científico e representação

**Objetivo:** concluir a separação entre estado físico, estado transitório, preferências e apresentação, conforme CAMADAS-VISUALIZACAO.md.

**Arquivos previstos:**
- domain/silm/state.js;
- domain/silm/representation.js;
- domain/silm/crystal-view.js;
- domain/silm/property-view.js;
- domain/silm/electron-view.js;
- domain/silm/assembly-view.js, se aplicável;
- integracao/adapter.js;
- tests/suites/s080-explorar.cjs, s090-medir.cjs, s100-calcular.cjs e s110-representacao.cjs.

**Entregas:**
1. Definir armazenamento versionado da representação fora do estado físico.
2. Migrar visibilidade, câmera, projeção, zoom, seleção visual e movimento de marcadores sem perder preferências compatíveis.
3. Garantir que alternar camada, zoom ou projeção não altere medidas, cálculos, checkpoint científico ou identidade da execução.
4. Definir limpeza e restauração de preferências por investigação.
5. Não persistir câmera, foco e viewport no registro experimental como condição científica.

**Critério de saída:** testes provam invariância de estado e resultados para mudanças puramente visuais; migração antiga restaura com segurança e pode ser revertida.

### F6 — Dados e validadores para motores quantitativos

**Objetivo:** preparar conjuntos de dados próprios para cada fenômeno, antes de qualquer cálculo físico específico por metal.

**Arquivos previstos:**
- domain/silm/data-api.js;
- domain/silm/data/elements.json;
- domain/silm/data/sources.json;
- validadores e construtores em scripts/;
- futuros arquivos dedicados, se necessários:
  - thermal-properties.json;
  - electrical-transport.json;
  - mechanical-properties.json;
  - optical-constants.json;
- testes de dados científicos.

**Entregas:**
1. Definir schema e validadores de cada domínio de propriedades.
2. Capturar unidade, método, fonte, faixa, temperatura, pressão, fase, condição da amostra, incerteza e revisão quando disponibilizados pela fonte.
3. Separar valor medido, calculado, estimado, teórico e didático.
4. Impedir mistura de valores de amostras/condições incompatíveis.
5. Homologar a transcrição e documentar a licença/condição de uso.
6. Criar fixtures de teste independentes dos dados de produção.
7. Expor elegibilidade por modelo e faixa, não um simples disponível/indisponível por metal.

**Critério de saída:** cada valor carregado tem proveniência e condição suficiente para uso declarado; dados ausentes permanecem ausentes; o motor informa por que determinado metal/condição não pode usar o modelo.

### F7 — Motor térmico: primeira versão física controlada

**Objetivo:** substituir gradualmente a fonte ideal e o coeficiente comum do modelo atual por um balanço térmico com condições explícitas.

**Pré-requisitos:** F2, F4 e F6.

**Arquivos previstos:**
- domain/silm/thermal.js ou novo motor com versão distinta;
- domínio de dados térmicos;
- orquestrador;
- integracao/metallic-experience.js;
- tests/thermal.cjs e testes novos de integração.

**Entregas:**
1. Inicialização em T∞ ou em condição inicial declarada.
2. Fonte de energia finita e localizada, com entrada e unidade explícitas quando física.
3. Capacidade térmica por nó e condutância coerente com a geometria/discretização.
4. Troca ambiental convectiva simplificada na primeira versão dimensional.
5. Radiação como extensão posterior, somente com temperatura absoluta e parâmetros validados.
6. Um único campo de temperatura compartilhado com o motor elétrico.
7. Condições fora da faixa homologada desabilitam o modelo ou exigem versão alternativa.

**Testes mínimos:** equilíbrio em T∞ sem fonte; simetria da condução; conservação da energia em sistema fechado; balanço de entrada/armazenamento/perda ambiental; estabilidade temporal; convergência; fonte finita; resfriamento global correto; redistribuição local após desligamento.

**Critério de saída:** todos os invariantes e balanços passam dentro de tolerâncias justificadas; resultados são rotulados pela classe de evidência; nenhum coeficiente fictício é atribuído ao metal.

### F8 — Transporte elétrico por metal e acoplamento térmico

**Objetivo:** evoluir o campo visual e os marcadores para uma resposta de transporte com nível quantitativo explicitamente selecionado, sem confundir a animação com movimento microscópico resolvido.

**Pré-requisitos:** F2, F4, F6 e F7 para acoplamento térmico.

**Arquivos previstos:**
- domain/silm/drive.js;
- domain/silm/electron-view.js;
- novo domínio de transporte elétrico, se a separação justificar;
- domain/silm/properties.js;
- dados elétricos;
- orquestrador;
- tests/drive.cjs e testes novos.

**Entregas:**
1. Tornar a entrada de campo consistente entre montagem livre e cristalina.
2. Separar intensidade didática de campo em V/m, tensão em V, corrente em A e densidade de corrente em A/m².
3. Documentar direção do campo, deriva eletrônica e corrente convencional.
4. Implementar transporte dimensional somente quando n, τ ou mobilidade/resistividade/conductividade adequados, geometria e condições forem homologados.
5. Tratar temperatura por parâmetros T-dependentes aprovados.
6. Integrar Joule somente após J e E dimensionais compatíveis; inserir P=J·E uma única vez no balanço térmico.
7. Manter a camada de marcadores como representação, sem afirmar rastreamento de elétrons reais.

**Critério de saída:** verificação de sinais e unidades; limites de campo; regressão livre/cristalina; comparação independente com fonte; balanço de potência Joule sem duplicação; classes de evidência claramente apresentadas.

### F9 — Motor mecânico: deformação e deslizamento

**Objetivo:** evoluir a representação de deformação para um modelo com grandezas mecânicas e condições específicas somente após os dados necessários.

**Pré-requisitos:** F2, F4 e F6. A resposta termo-mecânica fica fora desta primeira integração até existir modelo constitutivo dependente de temperatura.

**Arquivos previstos:**
- domain/silm/deformation.js;
- domain/silm/crystal.js;
- catálogo de dados mecânicos;
- orquestrador;
- tests/deformation.cjs e testes novos de referência.

**Entregas:**
1. Preservar o motor atual como modelo qualitativo versionado enquanto não houver parâmetros por metal.
2. Separar força aplicada, tensão, deformação, módulo elástico, limite de escoamento, CRSS e movimento de discordâncias.
3. Definir convenção de carregamento e geometria de corpo de prova/área antes de exibir tensão em Pa.
4. Validar sistemas de deslizamento e dependência estrutural (CFC, CCC, HC), sem supor comportamento universal.
5. Tratar anisotropia, dependência de temperatura e condição de contorno.
6. Não inferir ductilidade por maleabilidade nem adicionar fratura/hardening sem modelo/dados próprios.

**Critério de saída:** testes de geometria cristalográfica, sinal, unidades, orientação, elasticidade, plasticidade, limites, reversibilidade e comparação com referência independente para cada caso homologado.

### F10 — Resposta óptica espectral e colorimetria

**Objetivo:** evoluir a reflexão geométrica atual para resposta óptica por metal quando houver curvas validadas.

**Pré-requisitos:** F1 e F6. Não depende do motor térmico/elétrico/mecânico.

**Arquivos previstos:**
- novo domain/silm/optics.js ou serviço equivalente;
- domain/silm/drive.js e camada de propriedade;
- optical-constants.json;
- validadores e testes ópticos/colorimétricos;
- renderer somente para apresentar a cor/resposta calculada.

**Entregas:**
1. Homologar n(λ) e k(λ), faixa espectral, método, amostra e condição.
2. Interpolação somente dentro da faixa disponível; nunca extrapolar silenciosamente.
3. Implementar Fresnel para incidência normal e oblíqua conforme escopo.
4. Integrar fonte branca de referência, D65 e CIE 1931 2° para a etapa colorimétrica.
5. Converter XYZ para sRGB com limites de gamut explícitos.
6. Não usar cor hexadecimal fixa como propriedade universal do elemento.
7. Preservar a reflexão geométrica atual como fallback identificado, não como espectro.

**Critério de saída:** testes com Fresnel e casos-limite, tabelas de referência, transformação colorimétrica, gamut e condição da superfície declarada.

### F11 — Registro, relatórios e vínculos entre módulos

**Objetivo:** completar a integração de experiência registrada com relatórios, Caderno, Medir e Calcular.

**Pré-requisitos:** F3; os serviços de Medir e Calcular permanecem independentes desde F1.

**Arquivos previstos:**
- domain/silm/experiment-record.js e schema do registro;
- domain/silm/measurements.js;
- domain/silm/calculations.js;
- integracao/route-ui.js;
- integracao/unified-ui.js;
- js/experience/history.js;
- js/experience/reports.js;
- testes de backup, medição, cálculo, relatório e reprodutibilidade.

**Entregas:**
1. Criar vínculos por IDs canônicos de medidas e cálculos.
2. Fazer cada relatório indicar experiência, motor, fontes, limitações e grau R0/R1/R2.
3. Registrar no Caderno resumo e referência do registro, sem copiar todos os eventos.
4. Exportar pacote autossuficiente ou declarar dependências externas.
5. Validar importação em área temporária e efetivar somente após validação completa.
6. Manter compatibilidade com os formatos atuais de investigação científica e backup do Caderno.
7. Preservar texto do estudante e separar autoria/origem de observações do motor.

**Critério de saída:** exportar/importar uma investigação com múltiplas execuções, notas, medidas e cálculos sem perder vínculos, identidade, unidades ou proveniência; importação inválida não modifica o armazenamento.

### F12 — Homologação integral e integração

**Objetivo:** provar a integração de todos os contratos aprovados e preparar eventual integração à main.

**Arquivos e sistemas:** aplicação inteira, build, service worker, testes científicos, integração, rotas, backup, mobile, acessibilidade e artefatos de publicação.

**Entregas:**
1. Executar build completo e todos os testes aplicáveis.
2. Executar testes de navegador em Chromium e Firefox; Safari/WebKit quando o ambiente de CI/disponibilidade permitir.
3. Validar instalação PWA, recarga, offline, restauração, importação/exportação e conflitos de armazenamento.
4. Verificar acessibilidade por teclado, leitor de tela, contraste e movimento reduzido.
5. Homologar conteúdo e proveniência de cada dado numérico visível.
6. Comparar os resultados com fixtures de referência e revisar limitações visíveis.
7. Auditar o diff para garantir que mudanças de Explorar não desloquem Medir, Calcular, Caderno, Manual, roteiros ou missões.
8. Produzir relatório de homologação, versão, commits e hash dos artefatos.
9. Integrar por revisão explícita, sem commit direto na main.

**Critério de saída:** todos os gates aprovados ou exceções documentadas; nenhuma regressão crítica aberta; plano de reversão disponível.

## 6. Matriz de arquivos por responsabilidade

| Responsabilidade | Arquivos de partida | Mudança esperada |
|---|---|---|
| Estado científico e validação | domain/silm/state.js, docs/SCIENTIFIC-STATE.md | Preservar como fonte única; migrar apenas se indispensável. |
| Catálogo de propriedades | domain/silm/properties.js | Retirar responsabilidades de algoritmo progressivamente. |
| Motores transitórios | thermal.js, deformation.js, drive.js | Adaptar ao contrato/orquestrador; versionar alterações científicas. |
| Representação eletrônica | electron-view.js | Isolar tempo visual dos resultados científicos. |
| Geometria e estrutura | crystal.js, data-api.js | Manter cálculo geométrico determinístico e dados de referência. |
| Representação visual | representation.js, crystal-view.js, property-view.js, assembly-view.js | Separar preferências de visualização do estado científico. |
| Experiência e integração | metallic-experience.js, adapter.js | Orquestrar motores, comandos e captura de registro. |
| Atividades orientadas | route-session.js, route-ui.js | Associar sessionId sem substituir runId. |
| Medir/Calcular | measurements.js, calculations.js | Manter serviços canônicos e referenciar seus IDs. |
| Registro e documentação | js/experience/history.js, reports.js, unified-ui.js | Integrar linha do tempo, relatório e Caderno por referências. |
| Dados e fontes | data/elements.json, data/sources.json e futuros arquivos temáticos | Validar por propriedade, metal e condição. |
| Testes | tests/* e scripts/* | Testes unitários, integração, regressão, replay e homologação. |

Os nomes de novos arquivos são candidatos, não decisão de implementação. Antes de criar cada serviço, verificar se a arquitetura atual já contém abstração equivalente para evitar duplicação.

## 7. Gates obrigatórios entre fases

Nenhuma fase pode seguir apenas porque o código compila.

| Gate | Evidência exigida |
|---|---|
| G1 — Contrato | Entradas, saídas, unidades, origem, estado e versão descritos e validados. |
| G2 — Regressão | Testes anteriores continuam passando; diferenças intencionais estão justificadas. |
| G3 — Física/numerical | Invariantes, estabilidade, conservação, convergência ou casos matemáticos aplicáveis passam. |
| G4 — Dados | Fonte, método, condição, faixa, licença/revisão e unidade homologados. |
| G5 — Acoplamento | Proprietário de cada variável e ordem causal demonstrados; nenhum termo duplicado. |
| G6 — Persistência | Salvar, restaurar, migrar, exportar e importar preservam integridade. |
| G7 — Interface | Evidência e limites são visíveis; controles inacessíveis são bloqueados também no domínio. |
| G8 — Publicação | Build, browser, PWA, acessibilidade, hash, revisão e rollback documentados. |

### 7.1 Gate quantitativo adicional

Um metal só poderá usar um modelo quantitativo se todos os requisitos do motor aplicável estiverem homologados. A elegibilidade precisa considerar:
- propriedade e grandeza requeridas;
- fase/estrutura e faixa de condições;
- unidade e método;
- amostra e fonte;
- parâmetros complementares;
- versão do modelo e limites de aplicação.

Se faltar algum requisito essencial, o sistema mantém o modelo qualitativo identificado ou declara o modelo quantitativo indisponível. Não interpolar através de lacunas nem substituir dado ausente por média de outros metais.

## 8. Estratégia de migração e compatibilidade

1. Preservar schema científico 8 na fundação, no orquestrador e no início do registro.
2. Versionar o formato do registro em separado.
3. Evitar armazenar histórico experimental dentro do snapshot científico.
4. Criar testes de leitura de backups antigos antes de qualquer mudança de persistência.
5. Quando a representação for separada, migrar preferências por versão própria, sem sobrescrever estado científico válido.
6. Caso uma migração do schema científico se torne inevitável, implementar leitura/migração/escrita com fixtures de todos os schemas suportados, testes de rollback e preservação do arquivo original.
7. Nunca tornar a importação de uma investigação equivalente à importação de um registro experimental ou de um backup do Caderno.
8. A importação de pacote composto deve validar referências cruzadas antes de efetivar uma transação.

## 9. Política de testes por fase

| Fase | Testes mínimos |
|---|---|
| F0 | npm run build; npm run test; registrar baseline de browser e PWA. |
| F1 | testes unitários de descritores, contratos, aplicabilidade e adaptadores; regressão dos testes atuais. |
| F2 | teste de relógio fixo, ordem de passo, pausa/retoma, dispose, aba oculta, animação reduzida e determinismo. |
| F3 | schema, sequência de eventos, ciclo de vida, checkpoint, gravação transacional, quota, corrupção, replay e R0/R1/R2. |
| F4 | pares térmico+elétrico e mecânico+elétrico, ausência de duplicação, recusa de pares não aprovados e consistência entre montagens. |
| F5 | invariância de medidas/cálculos/checkpoints sob zoom, projeção, câmera e visibilidade; migração de preferências. |
| F6 | schema de dados, unidades, origem, faixa, licença/revisão, lacunas e elegibilidade por condição. |
| F7 | energia, estabilidade, equilíbrio, simetria, fonte finita, perda ambiental e convergência. |
| F8 | sinais, unidades, ohmicidade, geometria, dependência térmica e balanço Joule único. |
| F9 | geometria de sistemas de deslizamento, Schmid, elasticidade, plasticidade, reversibilidade e referência por estrutura. |
| F10 | Fresnel, limites angulares, interpolação, espectro, CIE, XYZ/sRGB e gamut. |
| F11 | vínculo de IDs, backup composto, importação atômica, proveniência, relatório e Caderno. |
| F12 | suite integral, navegadores, PWA/offline, acessibilidade, mobile, exportação/importação e hash. |

### 9.1 Regra para testes novos

- Testar serviços sem DOM sempre que possível.
- Testar no navegador a integração, os controles e a acessibilidade.
- Fixtures numéricas com origem, unidade e condição explícitas.
- Comparar resultados com tolerância declarada, não igualdade textual de valores formatados.
- Repetir com sementes fixas quando o algoritmo usar aleatoriedade.
- Separar verificação do código, validação física e validação dos dados.
- Nenhum teste deve transformar comportamento didático em referência física.

## 10. Critério de conclusão por motor

| Motor | Não pode ser considerado concluído até |
|---|---|
| Luz | Curvas ópticas homologadas para metais suportados, Fresnel e colorimetria testados, faixa/condição visíveis. |
| Calor | Fonte finita, energia, condução e ambiente coerentes; parâmetros físicos ou classificação didática explícita. |
| Elétrico | Campo, deriva e corrente diferenciados; parâmetros por metal para resultados quantitativos; Joule integrado uma única vez. |
| Mecânico | Força, tensão e deformação distintas; dados mecânicos adequados; sistemas de deslizamento e limites validados. |
| Combinações | Catálogo de compatibilidade, variável única, relógio comum e testes de acoplamento. |
| Registro | Execução reconstituível com versões, eventos, checkpoints, fontes e grau R0/R1/R2 honesto. |

## 11. Sequência prática recomendada de pull requests

A divisão abaixo é uma proposta para manter cada revisão pequena. O número final de PRs pode mudar após F0.

1. **PR 1 — Contratos e baseline:** descritores dos motores, fixtures e inventário de versões; sem alterar regras físicas.
2. **PR 2 — Orquestrador:** relógio comum, ciclo de vida e adaptadores mínimos; preservação do comportamento atual.
3. **PR 3 — Registro experimental:** schema independente, eventos, checkpoints e persistência.
4. **PR 4 — Acoplamentos atuais:** catálogo dos dois pares existentes e correção da inconsistência de entrada de campo.
5. **PR 5 — Representação:** separação/migração de preferências visuais, com testes de invariância.
6. **PR 6 — Dados térmicos e motor térmico:** validador/dados homologados e primeira versão física controlada; se dados ainda faltarem, entregar apenas validador e manter o motor qualitativo.
7. **PR 7 — Dados elétricos e transporte:** versão quantitativa somente para metais/condições elegíveis; integrar Joule apenas após F7.
8. **PR 8 — Dados mecânicos e deformação:** versão física somente onde parâmetros e sistemas estiverem homologados.
9. **PR 9 — Dados ópticos e resposta espectral:** motor, colorimetria e dados dentro das faixas validadas.
10. **PR 10 — Relatórios e pacote composto:** integrar Caderno, Medir/Calcular e exportação/importação.
11. **PR 11 — Homologação:** correções finais, relatório de testes, versão e preparação de integração.

PRs 6–9 podem ter trilhas de curadoria paralelas, mas não devem introduzir resultados quantitativos antes do gate G4.

## 12. Condições que bloqueiam avanço

- Dados sem fonte, condição, unidade ou licença verificável.
- Resultado numérico sem classe de evidência e faixa de validade.
- Acoplamento sem proprietário único de variável.
- Motor dinâmico mantendo relógio independente ao participar de experimento acoplado.
- Parâmetro transitório não registrado enquanto o pacote alega reexecução R2.
- Migração que elimina, reinterpreta ou invalida backup antigo sem preservação.
- Importação parcial que deixa referências quebradas.
- Alteração visual que muda resultado, medida ou cálculo científico.
- Teste que só verifica o texto da interface e não o estado de domínio.
- Regressão crítica de Medir, Calcular, Caderno, roteiros, missões, mobile, PWA ou acessibilidade.
- Pressão de roadmap para habilitar modelo físico sem evidência suficiente.

## 13. Homologação, versionamento e publicação

A integração deve seguir este fluxo:

1. concluir uma fase na branch de trabalho;
2. revisar diff e escopo dos arquivos;
3. executar testes da fase e suíte de regressão;
4. executar build;
5. revisar artefatos gerados e manifest/service worker quando aplicável;
6. homologar navegadores, mobile, offline e acessibilidade;
7. atualizar documentos e changelog;
8. registrar commit, versão do produto, versões de motores/schemas/dados e hashes;
9. aprovar PR e só então integrar à main;
10. validar a publicação e manter o commit anterior disponível para rollback.

Mudanças de motor científico devem ser versionadas separadamente de alterações de layout. Uma mudança em dados deve carregar a revisão do dataset. Uma mudança de formato de registro deve migrar arquivos anteriores sem reescrever a história científica.

## 14. Primeiro pacote a executar

Quando a implementação for autorizada, o primeiro pacote deve conter somente F0 e F1:

- confirmar o commit-base e registrar a saída real de build/testes;
- revisar os descritores dos motores existentes;
- formalizar unidades, evidências, entradas e saídas;
- criar testes unitários dos contratos;
- propor adaptadores mínimos sem alterar resultados;
- atualizar a documentação com diferenças reais encontradas.

**Não incluir neste primeiro pacote:** novo modelo térmico, transporte elétrico quantitativo, deformação física, resposta óptica espectral, migração do schema 8 ou integração à main.

Essa restrição fornece uma base observável para que as mudanças científicas posteriores possam ser avaliadas com segurança.

## 15. Relação com as nove especificações

| Especificação concluída | Fases operacionais principais |
|---|---|
| Contrato operacional | F0, F1, F2, F4, F12 |
| Estímulo luminoso | F6, F10, F12 |
| Estímulo térmico | F2, F4, F6, F7, F8 |
| Estímulo elétrico | F2, F4, F6, F8 |
| Estímulo mecânico | F2, F4, F6, F9 |
| Combinações de estímulos | F2, F4, F7, F8, F9 |
| Camadas de visualização | F5, F12 |
| Motor científico | F1, F2, F4, F6–F10 |
| Registro de experiências | F3, F11, F12 |

## 16. Critérios de aceitação do plano

- [ ] A ordem de implementação respeita dependências técnicas e científicas.
- [ ] Cada fase possui escopo, arquivos candidatos, entregas e critérios de saída.
- [ ] A fundação preserva o comportamento qualitativo antes de evoluir a física.
- [ ] Relógio e orquestrador precedem os novos acoplamentos.
- [ ] Registro experimental possui formato próprio, separado do schema científico 8.
- [ ] Dados e validadores precedem qualquer habilitação quantitativa por metal.
- [ ] Medir e Calcular mantêm serviços e registros canônicos independentes.
- [ ] A migração da representação não altera resultados científicos.
- [ ] Testes incluem invariantes, proveniência, persistência, replay, integração e acessibilidade.
- [ ] Existe política explícita de bloqueio, homologação, versionamento e rollback.
- [ ] A primeira entrega de implementação está limitada a F0 e F1.
- [ ] A branch main permanece fora do fluxo de desenvolvimento até aprovação explícita.

## 17. Limites desta entrega

Este documento organiza o trabalho futuro. Não foram criados descritores de motor, orquestrador, schema, dados, migrações, interfaces, testes ou código executável. Nenhum teste foi executado nesta etapa documental. A branch main não foi alterada.
