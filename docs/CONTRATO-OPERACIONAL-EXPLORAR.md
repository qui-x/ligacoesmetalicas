# Contrato operacional do módulo Explorar

> **Status:** especificação funcional da Etapa 1 — base para desenvolvimento.  
> **Escopo:** investigação de um metal elementar por vez, usando a mesma investigação científica compartilhada pelos três módulos do SILM.  
> **Relação documental:** complementa a organização visual de [MODULO-EXPLORAR.md](MODULO-EXPLORAR.md) e a referência histórica de [CONTRATO-EXPLORACAO.md](CONTRATO-EXPLORACAO.md).

## 1. Finalidade e limites

**Explorar é o ambiente de experimentação qualitativa do SILM.** Nele, o estudante prepara o objeto de estudo, aplica estímulos físicos, modifica condições e observa as respostas representadas pelo modelo.

O módulo responde a três perguntas:

1. O que acontece quando determinado estímulo é aplicado ao metal?
2. Como a estrutura e os elétrons respondem?
3. O que muda quando as condições da experiência são modificadas?

Explorar não é um quarto eixo de navegação, não é uma coleção de submódulos e não substitui Medir ou Calcular. A estrutura permanente do SILM continua sendo:

- **Explorar:** preparar, estimular, interagir e observar;
- **Medir:** quantificar grandezas por instrumentos e procedimentos definidos;
- **Calcular:** aplicar relações matemáticas e modelos às entradas identificadas.

Os três módulos trabalham sobre a mesma investigação, o mesmo metal e a mesma estrutura. A troca de módulo não cria outra amostra nem outra investigação.

### 1.1 Fora do escopo desta etapa

Esta especificação não amplia o objeto atual para sistemas multicomponentes ou outras dimensões de análise. Também não define novos instrumentos de Medir nem novas fórmulas de Calcular. Esses assuntos pertencem às especificações próprias dos outros módulos.

## 2. Vocabulário operacional

| Termo | Definição no SILM |
|---|---|
| Investigação | Contexto científico persistente que identifica o metal elementar em estudo. |
| Amostra virtual | Representação montada do metal na cena: unidades livres ou estrutura cristalina de referência. |
| Experiência | Atividade delimitada em que uma propriedade é investigada sob determinadas condições. |
| Estímulo | Ação física aplicada ao objeto: luz, calor, campo elétrico ou carga mecânica. |
| Fonte | Componente que fornece o estímulo, como uma fonte luminosa, térmica ou elétrica. |
| Atuador | Componente que aplica uma ação mecânica, como compressão ou tração. |
| Resposta | Alteração produzida pelo modelo na estrutura, na distribuição eletrônica ou na representação da propriedade. |
| Camada visual | Elemento de apresentação que pode ser mostrado ou ocultado sem alterar o estado científico. |
| Estado transitório | Variável usada durante a simulação, como temperatura local ou quadro de animação, que não deve ser confundida com um dado tabelado. |
| Combinação validada | Associação explícita de dois estímulos cujo acoplamento físico e computacional foi definido. |

A expressão **família de ferramentas** identifica apenas uma categoria de controles dentro de Explorar. Não cria submódulos nem altera a navegação principal.

## 3. Pré-condições para iniciar uma experiência

Antes de habilitar uma experiência, o SILM deve verificar:

1. Existe uma investigação ativa e um metal selecionado.
2. A amostra contém a estrutura mínima exigida pela experiência.
3. A fase e a estrutura de referência são compatíveis com o fenômeno.
4. O metal está habilitado para a investigação correspondente.
5. O modelo eletrônico está disponível quando a experiência depende dele.
6. A experiência possui uma classificação de evidência e limitações que possam ser apresentadas ao estudante.

A elegibilidade não deve ser inferida apenas pela existência de um botão ou pela classificação geral do elemento.

### 3.1 Classificação de disponibilidade

| Estado | Comportamento |
|---|---|
| available | A experiência está habilitada e há dado numérico de referência homologado para a propriedade. Isso não transforma a experiência visual em medição. |
| qualitative | A experiência está habilitada, mas a resposta exibida é qualitativa ou didática; a limitação deve ficar visível. |
| unavailable | A experiência não pode ser executada naquele contexto. O SILM informa o motivo e não oferece uma ação que falhe silenciosamente. |

A classificação deve ser consultada por metal e propriedade a partir do banco e das regras de elegibilidade. Não se deve preencher lacunas com valores típicos sem fonte.

## 4. Famílias de estímulos e ferramentas

As quatro famílias abaixo compõem o escopo inicial de Explorar. São ferramentas do mesmo módulo, não áreas de navegação independentes.

| Família | Controle principal | Fenômeno observado | Estado atual da implementação |
|---|---|---|---|
| **Luminoso** | Fonte de luz e incidência | Reflexão especular e brilho | Luz e ângulo de reflexão representados qualitativamente; sem resposta espectral ou cor própria por elemento. |
| **Térmico** | Fonte de calor | Vibração/espalhamento representado e propagação de energia pela rede | Propagação contínua por vizinhança; coeficiente didático comum, sem perda para o ambiente. |
| **Elétrico** | Campo elétrico | Resposta direcional média dos elétrons deslocalizados | Campo e deriva qualitativa; intensidade visual não equivale à corrente ou à condutividade medida do metal. |
| **Mecânico** | Atuador de compressão ou tração | Deslizamento e deformação representativa da rede | Modelo didático de deformação; não reproduz a curva tensão–deformação específica de cada metal. |

### 4.1 Estímulo luminoso

A ferramenta deve permitir ligar e desligar a fonte e controlar a incidência quando o modelo disponibilizar esse controle. A cena deve identificar a direção da luz incidente e refletida.

**O que pode ser afirmado hoje:** a representação segue qualitativamente a lei da reflexão, com ângulo de reflexão igual ao ângulo de incidência para a superfície modelada.

**O que não pode ser afirmado hoje:** que a cor apresentada corresponde à cor espectral real daquele metal, que existe uma curva de refletância validada ou que a cena calcula a resposta óptica completa. O modelo atual não representa a cor própria de cada elemento.

### 4.2 Estímulo térmico

A ferramenta deve permitir ligar e desligar a fonte e acompanhar a propagação de energia pela estrutura. A representação deve distinguir a região diretamente aquecida das regiões que recebem energia por transferência entre vizinhos.

**Limites atuais:** o coeficiente de difusão é didático e comum aos metais; o tempo é o da animação; não há perdas para o ambiente, mudança de fase nem fusão. O campo de temperatura usado pelo motor é transitório. A ausência de uma curva de resfriamento ambiental deve ser informada, não mascarada por uma animação.

### 4.3 Estímulo elétrico

A ferramenta deve permitir aplicar e retirar o campo, indicar seu sentido e mostrar a resposta coletiva dos elétrons. Quando necessário, o SILM pode ativar a representação eletrônica automaticamente, informando que se trata do modelo qualitativo de elétrons deslocalizados.

**Limites atuais:** o deslocamento visual não é a velocidade física real dos portadores. A intensidade do campo controla a escala visual da deriva; não é derivada da condutividade elétrica tabelada do metal e não fornece corrente, resistência ou densidade de corrente.

### 4.4 Estímulo mecânico

A ferramenta deve permitir selecionar compressão ou tração e aplicar/remover a carga de forma controlada. A cena deve tornar perceptível o deslocamento representado dos planos, a alteração da forma e, quando aplicável, a resposta eletrônica associada aos defeitos.

**Limites atuais:** os limiares e a deformação representativa são didáticos e comuns aos metais elegíveis. A representação não afirma reproduzir módulo elástico, tensão de escoamento, encruamento, ductilidade quantitativa ou comportamento mecânico específico de cada elemento.

## 5. Ciclo de vida de uma experiência

O fluxo operacional de referência é:

1. **Preparar:** selecionar o metal, montar ou organizar a estrutura e verificar elegibilidade.
2. **Iniciar:** selecionar a propriedade a investigar. O SILM registra o estado-base da experiência e habilita apenas seus controles.
3. **Aplicar:** ligar/desligar a fonte ou acionar o atuador; definir os parâmetros suportados.
4. **Observar:** acompanhar a resposta e consultar a explicação contextual.
5. **Comparar:** quando disponível, confrontar o estado-base com o estado atual em uma visualização somente leitura.
6. **Restaurar ou encerrar:** restaurar volta ao estado-base mantendo a experiência selecionada; encerrar desativa a experiência e retorna ao estado-base.

### 5.1 Restaurar não é encerrar

- **Restaurar** desfaz os efeitos da experiência e retorna seus parâmetros ao padrão, mas mantém a propriedade selecionada para que outra tentativa possa começar.
- **Encerrar** remove a propriedade ativa e deixa a amostra no estado de referência da investigação.
- Desligar uma fonte não é, por si só, restaurar a estrutura ou apagar o efeito já produzido.
- Reiniciar a investigação é uma operação diferente e não deve ser oferecida como sinônimo de restaurar uma experiência.

Os rótulos e as consequências dessas ações devem ser consistentes em todos os controles de cena e de painel.

## 6. Regra de coexistência entre estímulos

A regra padrão é **uma experiência principal ativa por vez**. Isso mantém a propriedade sob investigação identificável e impede que efeitos incompatíveis sejam sobrepostos sem modelo.

Uma combinação só pode ser habilitada quando existir uma definição explícita que informe:

- experiência principal;
- estímulo acoplado;
- pré-condições de estrutura e elegibilidade;
- variáveis compartilhadas;
- resposta física representada;
- limitações e fatores didáticos;
- comportamento ao desligar cada estímulo;
- testes científicos e computacionais correspondentes.

### 6.1 Combinações já representadas

| Experiência principal | Estímulo acoplado | Interação atualmente representada |
|---|---|---|
| Condutividade elétrica | Calor | A fonte térmica transitória modifica a temperatura local; o modelo relaciona regiões quentes a maior espalhamento e menor deriva média. |
| Maleabilidade ou ductilidade | Campo elétrico | O campo transitório permite observar a deriva; a deformação representada acrescenta espalhamento qualitativo associado aos defeitos da rede. |

Essas combinações não significam que duas experiências principais estejam ativas. O estímulo acoplado é um controle auxiliar do contexto principal e deve ser identificado como tal.

Não habilitar automaticamente combinações como luz + calor + campo + deformação. Uma combinação nova exige definição e validação próprias.

## 7. Contrato de interação e autorização por módulo

A restrição precisa existir em três camadas complementares:

1. **Interface:** apresentar somente os controles pertinentes ao módulo ativo e desabilitar claramente os controles indisponíveis.
2. **Integração/adaptadores:** impedir que eventos, atalhos ou ações indiretas acionem ferramentas de outro módulo.
3. **Domínio e motores:** validar novamente a autorização antes de alterar o estado ou avançar uma simulação.

Ocultar um botão não constitui proteção suficiente. Uma chamada direta ao serviço científico também precisa respeitar o módulo ativo.

| Capacidade | Explorar | Medir | Calcular |
|---|---:|---:|---:|
| Montar e reorganizar a amostra | Sim | Não | Não |
| Ativar ou alterar fontes e atuadores | Sim | Não | Não |
| Iniciar, restaurar ou encerrar experiência | Sim | Não | Não |
| Alterar parâmetros da experiência | Sim | Não | Não |
| Observar estrutura e consultar dados já registrados | Sim | Sim | Sim |
| Operar instrumentos e criar medições | Não | Sim | Não |
| Selecionar fórmulas e registrar cálculos | Não | Não | Sim |

A consulta somente leitura à cena, à estrutura, às fontes e aos registros pode continuar disponível nos três módulos. A restrição recai sobre a operação que altera o objeto, executa uma medição ou registra um cálculo.

### 7.1 Troca de módulo durante uma experiência

Ao sair de Explorar:

- nenhuma fonte ou atuador pode continuar recebendo comandos;
- os controles de Explorar deixam de estar operacionais;
- o contexto da investigação, metal, estrutura e registros é preservado;
- a experiência não deve ser apagada silenciosamente;
- o motor deve suspender a evolução temporal enquanto Explorar não estiver ativo;
- ao retornar, a experiência deve ser apresentada em estado seguro, com as fontes desligadas, aguardando nova ação explícita.

A suspensão não deve transformar uma estrutura deformada em estrutura de referência. Enquanto a amostra permanecer deformada, Medir e Calcular devem continuar aplicando suas regras de indisponibilidade, até que o estudante restaure a experiência.

**Lacuna da implementação atual:** a troca de módulo altera o módulo ativo, mas isso não constitui, por si só, uma política central de desligamento e suspensão dos motores. Essa regra exige integração explícita entre a troca de módulo, os controladores transitórios e os serviços do domínio.

## 8. Estado científico, estado transitório e registros

O princípio continua sendo um único estado científico. A interface de Explorar não deve criar uma segunda cópia da amostra nem um estado científico paralelo.

### 8.1 Estado científico persistente

Devem permanecer associados à investigação:

- metal e identificação da investigação;
- montagem e estrutura cristalina;
- modelo eletrônico e suas configurações;
- propriedade principal ativa e parâmetros declarados;
- medições e cálculos já registrados pelos módulos correspondentes;
- contexto suficiente para identificar a condição em que uma experiência foi realizada.

### 8.2 Estado transitório

Não deve ser registrado a cada quadro de animação:

- posição do ponteiro e hover;
- quadro atual da animação;
- partículas ou marcadores puramente desenhados;
- atualizações intermediárias de temperatura;
- movimento visual contínuo que não represente uma observação independente.

Essas variáveis não podem ser apresentadas como medidas experimentais.

### 8.3 Registro de experiência — requisito para a próxima especificação de dados

O estado atual registra o início, a alteração, a restauração e o encerramento da propriedade por eventos de domínio e mantém os parâmetros correntes. Ainda não há um registro estruturado e completo de cada execução experimental que permita reproduzir, isoladamente, todas as condições utilizadas.

A próxima definição de dados deverá avaliar um registro com, no mínimo:

- identificador da execução;
- metal e contexto estrutural;
- propriedade principal e estímulos acoplados;
- parâmetros e sequência de ações relevantes;
- horário de início e encerramento;
- versão do modelo computacional;
- classificação da evidência (qualitativa, dado tabelado ou resultado calculado);
- fontes, condições e limitações aplicáveis.

O registro deve guardar mudanças relevantes, não amostras de todos os quadros. A inclusão de uma nova coleção persistente ou alteração do schema científico exige uma proposta própria, migração e testes; não está autorizada implicitamente por este documento.

## 9. Apresentação da resposta científica

Toda experiência deve separar explicitamente:

1. **Fenômeno físico:** o que ocorre no material.
2. **Modelo computacional:** como o SILM aproxima esse fenômeno.
3. **Representação visual:** como o fenômeno aparece na cena.
4. **Evidência:** dado tabelado, modelo qualitativo ou resultado calculado.
5. **Limitação:** o que a experiência não permite concluir.

A explicação contextual deve permanecer curta e responder:

- **Ação:** o que foi aplicado?
- **Observação:** o que mudou na cena?
- **Interpretação:** qual relação científica explica a resposta?
- **Limite:** o que não está sendo medido ou demonstrado?

Não usar a cor como único indicador de temperatura, direção, intensidade ou estado. As informações relevantes devem ter rótulos textuais ou outra codificação acessível. A experiência também deve respeitar a preferência de movimento reduzido.

## 10. Regras de segurança do modelo científico

- Não apresentar parâmetros didáticos como propriedades específicas do metal.
- Não inferir valores numéricos a partir da aparência da cena.
- Não tratar o movimento de marcadores como velocidade física real dos elétrons.
- Não tratar intensidade visual do campo como corrente ou condutividade.
- Não atribuir cor espectral intrínseca sem dados ópticos e condições de superfície apropriados.
- Não tratar aquecimento sem perda ambiental como resfriamento real.
- Não tratar deformação representativa como curva mecânica validada.
- Não executar uma experiência quando a fase, a estrutura ou os dados necessários forem incompatíveis.
- Quando o dado específico não existir, manter a experiência qualitativa ou indisponível conforme a regra de elegibilidade; nunca inventar um valor.

## 11. Critérios de aceitação da Etapa 1

A Etapa 1 será considerada especificada quando todos os critérios abaixo forem verificáveis:

- [ ] A navegação principal contém exatamente Explorar, Medir e Calcular.
- [ ] As quatro famílias de estímulos são tratadas como ferramentas internas de Explorar, não como novos módulos.
- [ ] Cada experiência declara pré-condições, evidência, resposta representada e limitações.
- [ ] O sistema diferencia experiência principal de estímulo acoplado.
- [ ] Apenas combinações explicitamente validadas podem coexistir.
- [ ] Restaurar e encerrar têm efeitos distintos e previsíveis.
- [ ] A mudança de módulo bloqueia comandos incompatíveis também na camada de domínio.
- [ ] Motores transitórios não continuam avançando fora de Explorar.
- [ ] A investigação e os registros são preservados na troca de módulo.
- [ ] A interface distingue claramente dado tabelado, modelo qualitativo e resultado calculado.
- [ ] O estado persistente não é poluído por quadros de animação ou ponteiros temporários.
- [ ] As limitações científicas são acessíveis sem depender apenas de cor ou animação.

## 12. Auditoria: implementação atual versus contrato

Esta seção evita confundir o que já existe com o que esta especificação exige.

| Tema | Situação identificada no código consultado | Trabalho necessário |
|---|---|---|
| Módulos principais | O catálogo de módulos declara Explorar, Medir e Calcular. | Preservar exatamente essa estrutura. |
| Experiência principal única | O estado da propriedade e a operação de início mantêm uma propriedade principal por vez. | Manter esse princípio e formalizar combinações permitidas. |
| Estímulos existentes | Luz, calor, campo elétrico, compressão e tração possuem controles. | Uniformizar ciclo de vida e autorização. |
| Combinações | Calor + corrente e deformação + corrente têm tratamentos específicos. | Registrar as combinações num catálogo explícito e testável. |
| Elegibilidade | O catálogo de propriedades diferencia experiências com dados, qualitativas e indisponíveis. | Fazer a interface e os motores respeitarem a classificação em todos os caminhos. |
| Restauração e encerramento | Existem operações distintas no modelo e nos controladores. | Testar todos os caminhos, inclusive troca de módulo e saída da rota. |
| Guarda da interface | A integração da experiência verifica se Explorar está ativo para várias ações. | Auditar menus, atalhos e chamadas indiretas. |
| Guarda no domínio | A troca de módulo altera o módulo; serviços de experiência não centralizam todos os bloqueios por módulo. | Centralizar autorização nos serviços e controladores. |
| Motores transitórios | Temperatura e carga mecânica possuem controladores próprios; parte do estado não é persistida. | Definir suspensão, retomada e persistência mínima. |
| Registro reproduzível | Parâmetros atuais e eventos de domínio existem, mas não há registro estruturado completo de cada execução. | Especificar o modelo de registro antes de alterar o schema. |

## 13. Etapas de aprofundamento

- [Etapa 1 — Contrato operacional do Explorar](CONTRATO-OPERACIONAL-EXPLORAR.md): documentada. Formaliza ciclo de vida, famílias de estímulos, combinações, autorização por módulo e estados persistentes/transitórios.
- [Etapa 2 — Estímulo luminoso](ESTIMULO-LUMINOSO.md): especificada. Define reflexão geométrica, resposta espectral, colorimetria, fontes de dados e critérios de homologação. A especificação não equivale a implementação da resposta espectral.
- [Etapa 3 — Estímulo térmico](ESTIMULO-TERMICO.md): especificada. Define fonte finita e localizada, condução, capacidade térmica, troca ambiental, resfriamento, proveniência de dados e testes de conservação de energia. A especificação não equivale à implementação do novo motor.

A Etapa 4 deve detalhar o **estímulo elétrico**: fonte/campo, geometria, resposta dos elétrons, corrente como fenômeno coletivo, acoplamento com temperatura e limites entre visualização qualitativa e grandezas elétricas mensuráveis.
