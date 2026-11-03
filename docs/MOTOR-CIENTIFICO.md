# Motor científico — Etapa 8 do Explorar

> **Status:** especificação de arquitetura, contratos de execução e validação.  
> **Escopo:** motores qualitativos atuais do Explorar e sua relação com os serviços de Medir e Calcular.  
> **Implementação:** esta etapa audita a arquitetura existente e define a arquitetura-alvo; não altera código, banco, schema ou testes.

## 1. Objetivo

Definir como o SILM transforma dados de referência, geometria, condições e ações do estudante em respostas científicas reproduzíveis, verificáveis e corretamente classificadas.

O **Motor Científico** não deve ser um único solver monolítico. Deve ser uma arquitetura de serviços e motores especializados, coordenados por contratos comuns. Cada motor conserva o domínio físico que lhe pertence; o orquestrador controla o ciclo de vida, as entradas compartilhadas, a ordem de atualização e a publicação de resultados.

A arquitetura precisa responder:

1. Qual dado e qual condição fundamentam a simulação?
2. Qual motor calcula ou representa a resposta?
3. Quais entradas, unidades, parâmetros e hipóteses são utilizadas?
4. Qual estado é persistente e qual é transitório?
5. Como os acoplamentos reutilizam variáveis sem duplicar cálculos?
6. Como o resultado é classificado e validado?
7. Como o estudante distingue dado tabelado, modelo qualitativo, medida do modelo e resultado calculado?

A navegação principal permanece **Explorar, Medir e Calcular**. O motor científico é infraestrutura compartilhada; não é um quarto módulo nem uma área de navegação.

## 2. Auditoria da arquitetura atual

A implementação consultada já possui serviços especializados e uma fonte central de estado. Ela não possui, porém, um orquestrador único que coordene todos os motores com um relógio comum e um contrato uniforme de entradas e saídas.

### 2.1 Componentes e responsabilidades atuais

| Componente | Responsabilidade atual | Situação e limite |
|---|---|---|
| `domain/silm/data-api.js` e `domain/silm/data/elements.json` | Dados imutáveis, elementos, estruturas e resolução de fontes | Dados são congelados em runtime; valores precisam de proveniência. |
| `domain/silm/crystal.js` | Geometria cristalográfica, sítios, vizinhos e coordenadas | Núcleo determinístico reutilizado pelas vistas, medições e cálculos. |
| `domain/silm/state.js` | Estado científico, validação, comandos, persistência e eventos | Serviço central de escrita; consumidores recebem cópias. Schema científico atual: 8. |
| `domain/silm/properties.js` | Catálogo de experiências, elegibilidade, narrativas, dados e transformações | Mistura catálogo, regra de elegibilidade e algumas aproximações visuais; precisa continuar separando política de execução e algoritmo. |
| `domain/silm/thermal.js` | Grafo térmico, integração discreta e controlador transitório | Motor contínuo próprio; coeficiente e escala de temperatura são didáticos. |
| `domain/silm/deformation.js` | Sistemas de deslizamento, transformação geométrica e controlador mecânico | Motor contínuo próprio; usa parâmetros normalizados e um sistema representativo por estrutura. |
| `domain/silm/drive.js` | Intensidade elétrica, ângulo da lanterna e campo auxiliar na deformação | Controlador transitório de entradas; os parâmetros não são persistidos. |
| `domain/silm/electron-view.js` | Marcadores, passeio aleatório, deriva e fatores de espalhamento qualitativos | É sobretudo uma representação animada; as partículas não são portadores físicos resolvidos nem estado científico. |
| `domain/silm/measurements.js` | Instrumentos e medidas derivadas das coordenadas da estrutura | Serviço distinto de Medir; registra explicitamente `MODEL_MEASUREMENT`. |
| `domain/silm/calculations.js` | Catálogo de fórmulas, constantes, conversões, cálculo e validação | Serviço distinto de Calcular; valida entradas, origem, aplicabilidade e proveniência. |
| `integracao/metallic-experience.js` e `integracao/scientific-tools.js` | Ligação entre domínio, ações e interface | Adaptadores não devem conter fórmulas ou se tornar fontes alternativas de estado. |
| `domain/silm/renderer-2d.js`, `crystal-view.js` e `assembly-view.js` | Desenho, interação e composição da cena | Apresentam resultados; não devem calcular propriedades físicas nem escrever estados científicos diretamente. |

### 2.2 O que já está bem estabelecido

- Um único serviço de estado científico valida e persiste a investigação.
- Dados e fontes são consultados por identificadores; a base é imutável no runtime.
- Geometria cristalográfica é reutilizada em vez de reconstruída a partir de pixels.
- Experiências de propriedade preservam a estrutura científica de referência.
- Medir e Calcular são serviços separados do renderizador e da interface.
- Cálculos guardam entradas com origem, referências e dependências.
- Medidas guardam coordenadas/sites científicos, unidade, resolução e contexto da estrutura.
- Testes já verificam invariantes de grafo térmico, deslizamento cristalográfico, proveniência e independência em relação ao zoom.

### 2.3 Lacunas arquiteturais confirmadas

1. **Relógios separados:** controladores térmico e mecânico mantêm seus próprios laços de animação e passos fixos. A camada eletrônica também possui seu ciclo visual. Falta um contrato central de coordenação temporal para experiências acopladas.
2. **Entradas em locais distintos:** intensidade, ângulo e campo auxiliar da deformação vivem em `drive.js`; parâmetros da experiência principal vivem no estado científico; temperaturas locais e carga mecânica vivem nos controladores.
3. **Estados transitórios sem registro reprodutível completo:** temperatura local, fonte espacial, carga, progresso e algumas entradas auxiliares não são todos persistidos nem reunidos em um manifesto de execução.
4. **Responsabilidade sobreposta:** `properties.js` contém regras de catálogo e também transformações/representações térmicas por etapas; os motores contínuos oferecem outra forma de evolução. A separação entre modelo, apresentação estática e fallback precisa ser explícita.
5. **Acoplamentos implícitos na integração:** calor + campo e deformação + campo são acionados por caminhos específicos da integração, sem catálogo executável geral de acoplamentos.
6. **Ausência de unidades físicas em parte dos motores:** temperatura, intensidade elétrica, carga e deformação são normalizadas ou didáticas; não podem ser interpretadas como grandezas medidas.
7. **Dados de propriedades ausentes:** o banco consultado tem 118 elementos, 65 elegíveis para investigação e 91 fontes; nenhum dos 118 contém propriedades numéricas preenchidas em `properties`. Não há base para resposta quantitativa específica de condutividade elétrica, térmica ou comportamento mecânico.
8. **Ausência de um contrato uniforme de motor:** cada serviço expõe métodos próprios. Ainda não há um contrato comum para pré-condições, entradas, versão do modelo, unidade, passo, resultado, validação, limitação e ciclo de vida.

## 3. Taxonomia de evidência e resultados

A classificação da evidência deve ser parte explícita de cada resultado. Não deve ser inferida pela aparência ou pelo fato de um número surgir na tela.

| Código/termo | Significado no SILM | Exemplo |
|---|---|---|
| `TABULATED` | Valor numérico publicado e incorporado ao banco com condição e fonte | Parâmetro de rede, massa molar ou propriedade física, quando homologados. |
| `QUALITATIVE` | Representação de mecanismo ou tendência sem escala física específica homologada | Maior espalhamento eletrônico em região mais quente no modelo atual. |
| `MODEL_MEASUREMENT` | Valor obtido por instrumento sobre a geometria científica do modelo | Distância em Å entre sítios cristalográficos. Deve ser chamado "Medida do modelo". |
| `CALCULATED` | Resultado produzido por uma fórmula declarada a partir de entradas rastreáveis | Volume de célula, raio de esfera rígida, densidade teórica. |
| `USER` | Valor informado pelo estudante para uma entrada | Parâmetro introduzido manualmente em um cálculo. |
| `CONSTANT` | Constante definida ou exata, com natureza e origem identificadas | Constante de Avogadro. |

Regras:

- Uma medida do modelo não é uma medição laboratorial.
- A resolução do instrumento virtual não é uma incerteza experimental.
- Um resultado calculado não vira dado tabelado apenas porque coincide com um valor publicado.
- Um modelo qualitativo não produz uma propriedade física específica do metal.
- Um valor informado pelo usuário permanece identificado como tal, mesmo quando é utilizado em uma fórmula.
- Constantes definidoras exatas devem ser distinguidas de parâmetros ajustados ou aproximados.
- A classificação deve acompanhar o dado até a tela, o registro e a exportação.

## 4. Arquitetura-alvo por responsabilidades

A arquitetura proposta possui sete responsabilidades. Elas podem continuar distribuídas em arquivos e serviços especializados; não exigem a criação de um único arquivo central gigante.

### 4.1 Camada A — Dados científicos e proveniência

Responsável por dados de elementos, estruturas, parâmetros cristalográficos, propriedades, condições e fontes.

Contrato:
- leitura imutável;
- identificador de fonte válido;
- valor finito, unidade e condição explícita;
- fase, temperatura, pressão, orientação e outras condições pertinentes;
- incerteza somente quando a fonte a informar;
- registro de método, estado do material e faixa de validade quando disponíveis;
- proibição de valores típicos não rastreados.

A ausência de dado deve resultar em experiência qualitativa ou indisponibilidade, segundo a elegibilidade. Nunca deve gerar substituição silenciosa por um valor aproximado.

### 4.2 Camada B — Núcleo geométrico e matemático

Responsável por operações determinísticas e independentes da interface:

- geometria cristalográfica;
- coordenadas e sítios;
- vizinhança;
- transformações geométricas derivadas;
- relações matemáticas puras;
- conversões de unidades claramente definidas.

Este núcleo não lê pixels, zoom, dimensões da janela, CSS ou posição de controles. A câmera só transforma a apresentação.

### 4.3 Camada C — Estado científico e comandos de domínio

O serviço `createScientificState` continua sendo a fonte única de verdade persistente.

Responsabilidades:
- validar e transicionar investigação, metal e estrutura;
- iniciar, alterar, restaurar e encerrar experiências;
- verificar autorização por módulo e elegibilidade;
- validar medidas e cálculos antes de registrar;
- persistir apenas informação necessária à investigação;
- publicar eventos de domínio com contexto suficiente.

A interface e os controladores não devem escrever diretamente em objetos internos do estado. Devem enviar comandos ao serviço de domínio e receber confirmação ou motivo de recusa.

### 4.4 Camada D — Motores especializados

Cada fenômeno tem um motor próprio. O motor implementa o algoritmo físico ou a aproximação qualitativa, não a interface.

| Motor | Entradas principais | Estado/resposta | Classificação atual |
|---|---|---|---|
| Térmico | Geometria, fonte, condição inicial, passo de tempo | Campo local de temperatura normalizada | Qualitativo; sem potência finita nem perda ambiental. |
| Mecânico | Geometria, sistema de deslizamento, sinal e intensidade normalizados da carga | Deformação elástica transitória e passos plásticos representados | Qualitativo; sem tensão real, lei constitutiva específica ou fratura. |
| Transporte eletrônico visual | Campo, intensidade normalizada, temperatura local e nível didático de defeitos | Passeio aleatório, deriva e espalhamento dos marcadores | Qualitativo e visual; não é solver eletrônico nem medidor de corrente. |
| Óptico | Ângulo da fonte e normal da superfície | Feixe incidente e refletido | Geométrico qualitativo; sem constantes ópticas ou refletância espectral por metal. |
| Geométrico/cristalográfico | Geometria e parâmetros de rede de referência | Sítios, distâncias, ângulos, vizinhos e transformações | Determinístico, derivado de dados de referência. |

O motor eletrônico visual não deve ser apresentado como se resolvesse o transporte de Boltzmann ou a dinâmica microscópica de elétrons. Sua função atual é ilustrar tendência e direção na cena.

### 4.5 Camada E — Orquestrador de experiências

É a lacuna central desta etapa. O orquestrador deverá coordenar motores, sem substituir suas responsabilidades científicas.

Responsabilidades:
- validar a experiência principal e os acoplamentos permitidos;
- montar um contexto imutável da execução;
- entregar entradas aos motores especializados;
- manter um único relógio/passo de simulação para estados acoplados;
- avançar cada estado dinâmico uma única vez por passo;
- executar os acoplamentos na ordem definida;
- emitir um snapshot de saída coerente para a interface;
- suspender ou encerrar os motores conforme o ciclo de vida de Explorar.

O orquestrador não deverá:
- conter fórmulas específicas de todos os fenômenos;
- manter uma cópia paralela do estado científico;
- permitir que dois motores escrevam a mesma variável;
- recalcular um efeito já produzido por outro motor;
- gravar todos os quadros da animação no histórico;
- permitir experiência quando o módulo ativo não for Explorar.

### 4.6 Camada F — Serviços de Medir e Calcular

Medir e Calcular continuam independentes do orquestrador de experiências.

**Medir** obtém valores de instrumentos sobre o modelo e registra origem `MODEL_MEASUREMENT`, unidade, resolução, pontos e contexto estrutural.

**Calcular** seleciona fórmulas do catálogo central, valida entradas e unidades, recalcula o resultado no domínio e guarda proveniência, fontes e dependências.

Os dois serviços podem consumir dados do núcleo e do estado científico, mas não devem modificar a experiência de Explorar nem aproveitar valores apresentados apenas como efeito visual.

### 4.7 Camada G — Adaptadores e apresentação

Adaptadores convertem controles em comandos do domínio. Renderizadores recebem snapshots e desenham a cena.

A camada de interface:
- não contém equações próprias;
- não calcula resultados científicos;
- não inventa defaults físicos;
- não duplica controladores;
- não persiste estado experimental em paralelo;
- não decide elegibilidade com uma regra visual independente do domínio.

A cena pode manter animações puramente visuais, mas elas não podem ser fonte de verdade para grandezas físicas.

## 5. Contrato comum de um motor

Todo motor científico deverá documentar e implementar, de acordo com a sua natureza, os seguintes elementos:

| Elemento | Contrato exigido |
|---|---|
| Identidade | ID estável, nome, versão do algoritmo e fenômeno representado. |
| Evidência | `QUALITATIVE`, modelo físico quantitativo ou outro tipo declarado. |
| Aplicabilidade | Materiais, estruturas, fase e condições em que o motor pode ser utilizado. |
| Entradas | Variáveis tipadas, unidades, faixa válida, origem e condições. |
| Estado interno | Variáveis persistentes do modelo ou transitórias de integração, explicitamente separadas. |
| Inicialização | Estado-base e condições iniciais determinísticas. |
| Atualização | Regra de evolução e unidade do passo de tempo, quando aplicável. |
| Saída | Snapshot imutável com valores, unidades, interpretação, classificação e limitações. |
| Validação | Pré-condições, invariantes, domínio numérico e limites de validade. |
| Ciclo de vida | Criar, iniciar, avançar, pausar, restaurar, encerrar e descartar. |
| Proveniência | Fontes dos dados e parâmetros, convenções e referências utilizadas. |
| Testes | Casos de referência, propriedades invariantes, estabilidade e regressão. |

Contrato conceitual de interface:

```text
Motor
  metadata()
  validate(context, inputs)
  initialize(context, inputs) -> engineState
  step(engineState, inputs, dt, context) -> nextEngineState
  observe(engineState, context) -> immutableSnapshot
  reset(engineState, context) -> baseState
  dispose(engineState)
```

Nem todo motor precisa de evolução temporal: um cálculo geométrico puro pode expor apenas validação, cálculo e resultado. O contrato não deve obrigar um algoritmo estático a criar um laço de animação.

Nenhum motor poderá omitir a classificação de evidência ou retornar um número sem unidade e origem quando esses atributos forem aplicáveis.

## 6. Orquestração temporal e determinismo

### 6.1 Relógio comum

Para experiências acopladas, o orquestrador deverá usar um único relógio de simulação e um passo fixo declarado. Os motores não devem manter laços independentes que avancem a mesma variável ou produzam resultados dependentes da ordem em que os callbacks de animação forem executados.

O passo atual de 1/120 s existe nos motores térmico e mecânico, mas ainda não configura um relógio compartilhado. A camada eletrônica possui ciclo de desenho próprio e usa o tempo entre quadros para atualizar marcadores visuais.

A migração deverá distinguir:
- **tempo de simulação:** avança estados dinâmicos de domínio;
- **tempo de apresentação:** atualiza interpolação, partículas e desenho;
- **tempo de registro:** marca eventos e observações relevantes.

A frequência de desenho não pode alterar a quantidade de fenômeno calculado.

### 6.2 Sequência de um passo acoplado

A sequência-alvo é:

1. confirmar que Explorar está ativo e que a experiência principal permanece válida;
2. validar os estímulos e suas faixas de entrada;
3. construir o conjunto de entradas do passo;
4. avançar uma única vez cada motor dinâmico;
5. calcular os acoplamentos a partir dos estados resultantes, conforme a dependência causal documentada;
6. validar limites, unidades e invariantes;
7. publicar um snapshot consistente para a cena;
8. registrar somente eventos significativos, não quadros individuais.

A ordem deve ser definida para cada acoplamento. Um acoplamento com dependência recíproca pode exigir solução iterativa ou integração própria; não deve ser resolvido pela ordem acidental de duas chamadas.

### 6.3 Pausa, saída de módulo e movimento reduzido

- A troca para Medir ou Calcular suspende o avanço temporal de Explorar e bloqueia novas ações de fonte/atuador.
- O modelo e a amostra persistentes são preservados.
- Ao retornar, a simulação não deve avançar o tempo acumulado enquanto a aba ou o módulo esteve inativo.
- Movimento reduzido deve apresentar uma resposta estática ou saltar para um estado calculado de forma declarada. Não deve substituir o algoritmo físico por outro resultado silencioso.
- Ocultar uma camada visual não deve suspender uma fonte ou motor científico ativo.

## 7. Estado e persistência

O estado científico persistente, os estados transitórios dos motores e as preferências de representação são categorias diferentes.

| Categoria | Exemplos | Política |
|---|---|---|
| Identidade e contexto | Investigação, metal, fase e estrutura de referência | Persistir no estado científico. |
| Estado de experiência | Propriedade ativa e parâmetros que definem a condição investigada | Persistir quando necessário para continuidade e validação. |
| Resultado de modelo | Quantidade de deslizamentos permanentes ou observação final explicitamente registrada | Persistir como resultado com classificação e contexto. |
| Estado transitório de motor | Campo de temperatura local, carga instantânea, velocidade elástica, progresso da integração | Manter no runtime; não gravar por quadro. |
| Entradas transitórias de ferramenta | Posição da fonte, intensidade/ângulo não registrados, alça do atuador | Persistir somente se forem necessários para reproduzir a execução ou forem escolhidos como parâmetros da experiência. |
| Representação | Visibilidade, câmera, zoom, rótulos, partículas e foco | Persistir à parte do estado científico, conforme a Etapa 7. |
| Registros | Medições e cálculos concluídos, com entradas e proveniência | Persistir como registros imutáveis; remover por ação explícita. |

O estado atual já guarda a propriedade ativa, parâmetros e resultados plásticos representados. O motor mecânico mantém carga e deformação elástica transitórias; o motor térmico mantém temperaturas e posição da fonte transitórias; `drive.js` mantém intensidade, ângulo e campo auxiliar sem persistência; a camada eletrônica mantém marcadores somente em runtime.

A política futura de registro reproduzível será aprofundada na Etapa 9. Até lá, não introduzir novas coleções ou mudanças de schema implicitamente.

## 8. Contrato de dados, unidades e condições

Um dado quantitativo só pode entrar no motor se tiver metadados suficientes para interpretar seu significado.

Campos mínimos quando aplicáveis:

- quantidade e símbolo;
- valor finito ou intervalo;
- unidade explícita;
- material/elemento e fase;
- temperatura e pressão;
- estado físico, orientação e condição de amostra;
- método de determinação ou fonte;
- identificador de proveniência;
- incerteza, resolução ou faixa de validade quando publicadas;
- versão da transcrição e revisão de homologação.

O banco e os motores devem evitar misturar:
- valor medido em temperatura ambiente com valor de alta temperatura;
- dado de monocristal com policristal sem indicação;
- superfície limpa com superfície oxidada;
- valor de material puro com valor de liga;
- parâmetro de animação com parâmetro físico.

### 8.1 Unidades

- Motores quantitativos novos devem declarar seu sistema de unidades e preferir unidades coerentes do SI para grandezas físicas.
- Geometria cristalográfica existente mantém seus dados canônicos em ångström quando o contrato atual assim define.
- Conversões devem ocorrer em fronteiras explícitas, com funções centrais e testes; não usar valores de tela ou texto formatado como entrada.
- Percentuais, fatores normalizados e coeficientes didáticos devem trazer a classificação qualitativa e não podem ser convertidos em W, A, Pa, K ou m/s sem uma relação física validada.

Não se exige migrar todos os dados geométricos atuais para metros nesta etapa. Exige-se impedir mistura silenciosa entre ångström, metro, valores normalizados e pixels.

## 9. Acoplamentos e fonte única de verdade

A Etapa 6 definiu a matriz de combinações. O motor deverá implementar cada acoplamento como relação explícita entre saídas e entradas dos motores envolvidos.

| Acoplamento | Estado/variável compartilhada | Direção atual |
|---|---|---|
| Calor + campo elétrico | Temperatura local da rede | Temperatura altera espalhamento e deriva qualitativos. Não há termo Joule. |
| Deformação + campo elétrico | Número normalizado de deslizamentos/defeitos | Defeitos alteram espalhamento e deriva qualitativos. O campo não altera o motor mecânico. |
| Luz + calor | Potência óptica absorvida e balanço térmico | Não implementado; exige absorptância e condição de superfície. |
| Luz + campo elétrico | Resposta óptica sob configuração eletro-óptica definida | Não implementado; não generalizar eletroreflectância. |
| Luz + mecânica | Geometria e normal da superfície | Não implementado; possível atualização geométrica da reflexão. |
| Calor + mecânica | Temperatura e parâmetros constitutivos dependentes de temperatura | Não implementado; não ajustar limiar visual arbitrariamente. |

Regras invariantes:
1. Uma variável física possui um único proprietário.
2. O consumidor recebe a variável por contrato, não a recalcula em paralelo.
3. O mesmo campo de temperatura alimenta todos os modelos que dependem dele.
4. Cada termo de potência entra uma única vez no balanço energético.
5. Uma camada visual não gera uma variável física.
6. Cada combinação possui pré-condições, ordem causal e testes.
7. Combinações triplas ou quádruplas permanecem indisponíveis até validação própria.

### 9.1 Limite importante: aquecimento Joule

O motor elétrico visual atual não resolve tensão, corrente, densidade de corrente ou campo com escala física. Portanto, não pode calcular potência Joule real.

Uma futura versão quantitativa só poderá introduzir:

[
q'''=ec Jcdotec E
]

ou uma expressão equivalente quando (ec J) e (ec E) forem grandezas físicas dimensionadas e compatíveis com a geometria e as condições do material. A potência deve ser adicionada uma única vez ao motor térmico. O botão de calor existente é uma fonte auxiliar explícita e não deve ser confundido com calor gerado automaticamente pela corrente.

## 10. Modelo qualitativo e caminho quantitativo

O motor não deve misturar o estado qualitativo atual com um futuro modelo físico dimensional como se fossem níveis de precisão da mesma variável.

### 10.1 Caminho qualitativo atual

- mantém coeficientes normalizados e didáticos;
- utiliza tendências e mecanismos documentados;
- explicita que os parâmetros são iguais para os metais elegíveis quando não existem dados específicos;
- não apresenta valores de propriedades físicas por metal;
- pode produzir observações narrativas e representações visuais;
- não pode fornecer medições em unidades físicas para variáveis que não foram dimensionadas.

### 10.2 Caminho quantitativo futuro

Cada modelo quantitativo deverá ter identidade e versão próprias, parâmetros de material homologados e faixa de validade.

Exigências:
- dados numéricos específicos com unidade, fonte e condição;
- equações dimensionais e verificação de consistência de unidades;
- condições iniciais e de contorno;
- geometria física necessária;
- método numérico e tolerância;
- avaliação de estabilidade e convergência;
- comparação com referência independente ou experimento publicado;
- incerteza e sensibilidade quando houver dados para isso;
- política explícita de extrapolação (padrão: não extrapolar além da faixa validada).

Não converter automaticamente um modelo qualitativo em quantitativo só porque um dado foi adicionado ao banco. O modelo físico deve ser implementado, testado e homologado de forma independente.

### 10.3 Estado atual da cobertura

A auditoria da branch consultada encontrou:
- 118 elementos;
- 65 elementos com elegibilidade para investigação;
- 91 fontes registradas;
- zero elementos com propriedades numéricas preenchidas em `properties`.

Portanto, a implementação atual pode realizar:
- geometria cristalográfica derivada de referências;
- medidas do modelo na escala da geometria cristalográfica;
- fórmulas cristalográficas e grandezas derivadas;
- experiências qualitativas de luz, calor, transporte eletrônico visual e deformação representativa.

Ela não pode afirmar que calcula:
- condutividade elétrica específica por metal;
- condutividade térmica específica por metal;
- resistividade em função da temperatura;
- tensão de escoamento, módulo elástico ou curva tensão–deformação específica;
- temperatura física por região ou potência térmica em watts;
- corrente, densidade de corrente ou velocidade física de deriva.

## 11. Verificação, validação e testes

A validação deve separar três perguntas:

1. **Verificação do código:** o algoritmo implementa corretamente a regra matemática/numerical declarada?
2. **Validação do modelo:** a regra representa adequadamente o fenômeno no domínio de aplicação?
3. **Validação dos dados:** os parâmetros e fontes correspondem ao metal, fase e condição em uso?

Um motor pode passar nos testes de código sem ser quantitativamente validado para um metal específico. Essa distinção deve ser visível na classificação de evidência.

### 11.1 Invariantes já cobertos

| Motor/serviço | Verificações existentes identificadas |
|---|---|
| Térmico | Grafo simétrico de vizinhos; propagação limitada; conservação da soma normalizada sem fonte; tendência ao equilíbrio; fonte aquece primeiro a região vizinha. |
| Mecânico | Direção de deslizamento no plano; vetor de Burgers compatível com a rede; orientação de ensaio; ausência de sobreposição; tração alonga e compressão encurta; transformação estática consistente. |
| Transporte eletrônico | Fatores de espalhamento e deriva monotônicos com temperatura e defeitos; intensidade proporcional à deriva visual. |
| Medir | Medidas derivadas de sítios científicos; independência de zoom e projeção; unidade e resolução; validação de contexto e recusa de medidas sem escala. |
| Calcular | Aplicabilidade de fórmulas; entradas com origem; constantes; intermediários; dependências; validação por recálculo e proveniência. |
| Estado | Validação estrita de schema, estrutura, modelos eletrônicos, propriedades, medidas e cálculos; migrações versionadas. |

### 11.2 Testes adicionais exigidos para a arquitetura-alvo

**Orquestração e tempo**
- Um passo da execução avança cada motor uma única vez.
- Ordem de chamada de renderizadores não muda o resultado.
- A taxa de quadros não muda o estado científico final.
- Aba oculta e troca de módulo não acumulam tempo de simulação.
- Movimento reduzido conserva o mesmo estado final definido pela regra.

**Acoplamentos**
- Um único campo de temperatura é consumido pelos modelos dependentes.
- O campo elétrico auxiliar não atualiza o motor mecânico.
- O mesmo defeito não é contabilizado duas vezes.
- Calor Joule não é calculado enquanto não houver escala elétrica física.
- Fonte auxiliar desligada interrompe só sua entrada e não apaga energia armazenada.
- Não existe execução de combinações não homologadas.

**Contratos e unidades**
- Entradas fora da faixa ou sem unidade são recusadas.
- Grandezas incompatíveis dimensionalmente não são combinadas.
- Toda saída numérica declara unidade, origem e classificação.
- Dados fora da condição validada são indisponíveis ou exigem outra versão do modelo.
- Nenhum valor típico é introduzido implicitamente.

**Estado e proveniência**
- Nenhum motor escreve diretamente no objeto de estado.
- Estado retornado ao consumidor é imutável/cópia.
- Resultado registrado guarda versão do modelo, parâmetros relevantes e fontes.
- Restauração e recarga não inventam quadros intermediários nem resultados.
- Medidas e cálculos preservam sua origem independente dos motores de Explorar.

**Robustez numérica**
- Valores finitos e limites físicos do domínio.
- Estabilidade sob passo declarado.
- Convergência sob refinamento de passo quando aplicável.
- Conservação de energia ou massa quando prevista pelo modelo.
- Simetria, isotropia ou anisotropia conforme as hipóteses declaradas.
- Testes de regressão com estruturas e dados de referência homologados.

## 12. Ordem de implementação futura

A implementação deve ser incremental, sem refazer os motores já testados em bloco:

1. **Inventário e contrato:** formalizar entradas, saídas, versão e evidência de cada motor.
2. **Orquestrador:** coordenar início, passo, suspensão, restauração e encerramento; manter um único relógio de simulação para motores acoplados.
3. **Integração atual:** migrar calor + campo e deformação + campo para o catálogo de acoplamentos, preservando os resultados qualitativos atuais.
4. **Separação de catálogo e algoritmo:** reduzir responsabilidades de execução em `properties.js`; manter nele metadados, elegibilidade e narrativas, enquanto os motores implementam os algoritmos.
5. **Snapshots e proveniência:** publicar saídas imutáveis e registrar versão/entradas relevantes sem guardar quadros.
6. **Validação de referência:** ampliar testes de invariantes, condições, regressão e acoplamentos.
7. **Dados quantitativos:** só depois de curadoria e homologação de propriedades e implementação dos modelos físicos dimensionais.

Nenhuma etapa posterior autoriza introduzir ligas, minerais, sistemas multicomponentes ou outros objetos fora do escopo atual de metal elementar.

## 13. Critérios de aceitação da Etapa 8

- [ ] As responsabilidades de dados, geometria, estado, motores, orquestração, Medir/Calcular e apresentação estão separadas.
- [ ] Existe um contrato comum para identidade, versão, entradas, saídas, ciclo de vida, evidência e testes.
- [ ] O estado científico permanece com um único serviço de escrita e validação.
- [ ] Os motores não duplicam variáveis ou integração temporal.
- [ ] Experiências acopladas avançam com sequência e relógio definidos.
- [ ] A camada eletrônica é classificada corretamente como representação qualitativa, não solver físico.
- [ ] Medir e Calcular permanecem serviços independentes e rastreáveis.
- [ ] Unidades normalizadas e unidades físicas não se misturam.
- [ ] Dados faltantes não são substituídos por valores típicos.
- [ ] Resultados carregam classificação e proveniência.
- [ ] Testes de verificação, validação e dados são distinguidos.
- [ ] A limitação quantitativa do banco atual é explícita.

## 14. Referências internas

- [Contrato operacional do Explorar](CONTRATO-OPERACIONAL-EXPLORAR.md) — ciclo de vida, autorização e estado.
- [Estímulo luminoso](ESTIMULO-LUMINOSO.md) — resposta geométrica, dados ópticos e homologação futura.
- [Estímulo térmico](ESTIMULO-TERMICO.md) — balanço de energia, condução, condições ambientais e limitações do motor atual.
- [Estímulo elétrico](ESTIMULO-ELETRICO.md) — campo, deriva, corrente, espalhamento, aquecimento Joule e dados exigidos.
- [Estímulo mecânico](ESTIMULO-MECANICO.md) — força, tensão, deformação, sistemas de deslizamento e limites atuais.
- [Combinações de estímulos](COMBINACOES-ESTIMULOS.md) — matriz de compatibilidade e acoplamentos aceitos.
- [Camadas de visualização](CAMADAS-VISUALIZACAO.md) — separação entre estado científico e representação.
- `domain/silm/state.js`, `properties.js`, `thermal.js`, `deformation.js`, `drive.js`, `electron-view.js`, `measurements.js`, `calculations.js`.
- `tests/thermal.cjs`, `tests/deformation.cjs`, `tests/drive.cjs`, `tests/suites/s080-explorar.cjs`, `suites/s090-medir.cjs` e `suites/s100-calcular.cjs`.

## 15. Limites desta entrega

A Etapa 8 conclui a especificação da arquitetura do motor científico e de seus contratos. Não houve alteração dos motores, criação de orquestrador, migração de estado, inclusão de dados numéricos, execução de testes ou publicação na branch `main`.

A Etapa 9 — [Registro de experiências](REGISTRO-EXPERIENCIAS.md) — está especificada. Com ela, conclui-se a sequência documental de nove etapas do Explorar. A implementação deve seguir o [Plano operacional de implementação](PLANO-IMPLEMENTACAO-EXPLORAR.md), sem abrir uma nova etapa conceitual.
