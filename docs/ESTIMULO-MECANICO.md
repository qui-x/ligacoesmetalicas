# Estímulo mecânico — contrato científico e funcional

> **Etapa:** 5 do aprofundamento de Explorar.  
> **Status:** especificação para desenvolvimento; não representa implementação concluída.  
> **Escopo:** resposta de uma estrutura cristalina idealizada de metal elementar a cargas de compressão e tração. A experiência atual é qualitativa e não é um ensaio mecânico normatizado.

## 1. Objetivo

O estímulo mecânico deve permitir aplicar uma carga à amostra virtual, observar a deformação elástica, ultrapassar um limiar didático e acompanhar a deformação plástica representada por deslizamento cristalográfico.

A experiência deve distinguir:

1. **Carga/força aplicada:** ação da prensa ou das garras.
2. **Tensão:** força por área que atua no material.
3. **Deformação:** mudança relativa de comprimento, forma ou ângulo.
4. **Regime elástico:** resposta reversível ao retirar a carga.
5. **Regime plástico:** deformação permanente após a retirada da carga.
6. **Sistema de deslizamento:** combinação de plano cristalográfico e direção de deslizamento.
7. **Discordâncias:** defeitos lineares cujo movimento permite o deslizamento do cristal.
8. **Limite de validade:** quais mecanismos o modelo mostra e quais não representa.

A finalidade em Explorar é visualizar a relação entre força, geometria cristalina, deslizamento e mudança permanente da forma. O módulo não deve afirmar que calcula a resistência mecânica real do metal enquanto não houver propriedades específicas e um modelo constitutivo validado.

## 2. Auditoria da implementação atual

### 2.1 O que já existe

O SILM já possui:

- experiência de maleabilidade por compressão;
- experiência de ductilidade por tração/alongamento;
- ferramenta de prensa ou garra arrastável na cena;
- controles alternativos por teclado e botões;
- controlador contínuo por passo fixo;
- deformação elástica animada com retorno após a retirada da carga;
- deslizamentos plásticos persistentes representados em passos;
- sistemas de deslizamento derivados da geometria cristalográfica do banco;
- cálculo do vetor de Burgers a partir dos vetores da rede;
- orientação de ensaio que maximiza o fator de Schmid no sistema representativo;
- suporte a CCC, CFC e HC;
- preservação da estrutura de referência no estado científico;
- retorno visual ao estado-base ao restaurar ou encerrar a experiência;
- combinação qualitativa deformação + campo elétrico.

### 2.2 Modelo e constantes atuais

O controlador de domain/silm/deformation.js utiliza:

| Parâmetro | Valor atual | Significado atual |
|---|---:|---|
| DT | 1/120 s | Passo de integração da animação |
| YIELD | 0,5 | Limiar normalizado e didático de carga |
| EPS_YIELD | 0,06 | Deformação elástica visual máxima de referência, 6 % |
| LIMIT | 4 | Máximo de eventos de deslizamento representados |
| W | 2π × 2,2 | Frequência angular do oscilador didático |
| ZETA | 0,22 | Amortecimento do retorno elástico |
| SLIDE | 0,45 s | Escala temporal de animação de cada deslizamento |
| TURN | 0,6 s | Escala temporal da orientação de ensaio |
| WORK | 0,6 s | Escala de acúmulo do trabalho didático para ativar um deslizamento |

Os valores acima controlam a representação. Não são módulo de Young, tensão de escoamento, tensão de cisalhamento crítica, velocidade de discordâncias, taxa de deformação ou tempo físico do metal.

O estado atual guarda o número de deslizamentos concluídos. A carga momentânea, o progresso da animação e a deformação elástica são transitórios.

### 2.3 O que a implementação realmente representa

O motor seleciona um sistema de deslizamento representativo e calcula um vetor de Burgers b compatível com a rede. A cada evento, a transformação desloca um bloco de sítios em relação ao outro por um passo b, ao longo do sistema escolhido.

Isso produz uma representação geométrica de cisalhamento cristalográfico e permite verificar que os sítios retornam a posições compatíveis com a mesma rede após o deslocamento.

**Limite essencial:** o motor não simula a nucleação, a linha, o núcleo, a propagação ou a interação de discordâncias individuais. O deslocamento de blocos é a representação do efeito macroscópico líquido de um evento de deslizamento, não uma animação atomística do movimento de um plano inteiro em simultâneo.

### 2.4 Limitações confirmadas

| Tema | Situação atual | Consequência |
|---|---|---|
| Força | Controle normalizado entre 0 e 1 | Não representa newtons. |
| Tensão | Não é calculada | Não há pascal, MPa ou tensão distribuída. |
| Área da seção | Não definida como geometria mecânica física | Não se pode derivar tensão a partir da carga visual. |
| Deformação | Exagerada para ser visível | Não representa uma curva experimental de tensão-deformação. |
| Escoamento | Limiar didático comum | Não representa o limite de escoamento de cada metal. |
| Sistemas de deslizamento | Um sistema representativo por estrutura | Não contempla todos os sistemas potencialmente ativos. |
| Discordâncias | Não desenhadas nem simuladas individualmente | Não há densidade, nucleação, aniquilação ou interação de discordâncias. |
| Encruamento | Não representado | A tensão necessária não cresce por acúmulo de discordâncias. |
| Fratura | Não representada | A experiência não mede alongamento até ruptura nem ductilidade quantitativa. |
| Temperatura | Não modifica o limiar ou a mobilidade mecânica | Não simula trabalho a quente ou transição dúctil-frágil. |
| Policristal | Sem grãos e contornos de grão | Não prevê textura nem compatibilidade entre grãos. |

## 3. Conceitos mecânicos fundamentais

### 3.1 Força, tensão e deformação

A força é uma interação mecânica aplicada à amostra. Para uma carga normal uniforme sobre uma seção inicial A₀, a tensão de engenharia é:

\[
\sigma=\frac{F}{A_0}
\]

onde F é a força normal e A₀ é a área inicial da seção transversal.

A deformação longitudinal de engenharia é:

\[
\varepsilon=\frac{L-L_0}{L_0}=\frac{\Delta L}{L_0}
\]

onde L₀ é o comprimento inicial e L é o comprimento sob carga.

Na compressão, a tensão e a deformação longitudinais usam o sinal convencional negativo; na tração, positivo. A interface poderá usar magnitudes e rótulos de compressão/tração, desde que não misture convenções de sinal.

A deformação de cisalhamento é outra grandeza. No sistema de deslizamento, ela descreve o deslocamento relativo ao longo do plano, e não deve ser confundida com a deformação longitudinal do corpo de prova.

No SILM atual, F e A₀ não são grandezas físicas modeladas. O controle de carga é apenas uma entrada normalizada. Portanto, a interface não deve mostrar Pa, MPa, N ou deformação experimental.

### 3.2 Regime elástico

No regime elástico, a estrutura retorna à configuração de referência quando a carga é retirada.

Na faixa linear de pequenas deformações, a resposta uniaxial pode ser aproximada pela lei de Hooke:

\[
\sigma=E_Y\varepsilon
\]

onde E_Y é o módulo de Young.

Para cisalhamento elástico:

\[
\tau=G\gamma
\]

onde G é o módulo de cisalhamento e γ é a deformação de cisalhamento.

A região elástica pode deixar de ser linear antes de deixar de ser reversível. Portanto, limite de proporcionalidade e limite elástico não são necessariamente o mesmo ponto.

A implementação atual usa um oscilador amortecido para produzir uma resposta elástica visível. Esse mecanismo é uma animação didática de retorno, não uma lei constitutiva com E_Y ou G reais.

### 3.3 Regime plástico

Quando a tensão alcança condições que permitem o movimento irreversível de discordâncias ou outros mecanismos plásticos, a estrutura não retorna completamente à configuração inicial após retirar a carga.

O SILM representa essa permanência por uma sequência limitada de deslocamentos de blocos em passos do vetor de Burgers.

O limiar atual YIELD = 0,5 é normalizado, igual para todos os metais elegíveis e independente do elemento, da temperatura e da orientação real de uma amostra. Ele só determina a transição da animação.

Não rotular esse limiar como limite de escoamento do metal.

### 3.4 Maleabilidade e ductilidade

**Maleabilidade** é a capacidade de um material suportar deformação plástica sob solicitações predominantemente compressivas, sem fraturar imediatamente. O SILM mostra uma representação de compressão e espalhamento lateral, como uma lâmina.

**Ductilidade** está associada à capacidade de sofrer deformação plástica, especialmente em tração, antes da fratura. O SILM mostra alongamento e estreitamento da amostra.

A experiência atual não contém fratura. Por isso, ela pode ensinar o mecanismo de alongamento por deslizamento, mas não medir a ductilidade real nem determinar o alongamento percentual até a ruptura.

O comportamento de maleabilidade e ductilidade depende do metal, da pureza, da microestrutura, da temperatura, da taxa de deformação, do estado de tensão e da preparação da amostra. A estrutura cristalina isolada não determina sozinha a resposta mecânica.

## 4. Deslizamento e discordâncias

### 4.1 O que é um sistema de deslizamento

Um sistema de deslizamento é composto por:

- um plano cristalográfico em que a discordância pode se mover;
- uma direção de deslizamento contida nesse plano;
- o vetor de Burgers b, paralelo à direção de deslizamento para o deslizamento cristalográfico considerado.

O vetor de Burgers descreve a magnitude e a direção do deslocamento de rede associado à discordância. Seu módulo é uma distância cristalográfica derivada da estrutura e dos parâmetros de rede.

A geometria e o módulo de b podem ser calculados pelo SILM a partir dos vetores da rede, desde que o sistema esteja homologado.

### 4.2 Movimento de discordâncias

A deformação plástica cristalina ocorre principalmente pelo movimento de discordâncias ao longo de sistemas de deslizamento.

Uma discordância se move pelo cristal e deixa atrás de si um deslocamento relativo da ordem do vetor de Burgers. O varrimento de uma área de deslizamento produz uma deformação macroscópica. Uma quantidade grande de deformação resulta do movimento e da interação de muitas discordâncias, não do deslocamento simultâneo de um plano atômico inteiro.

A primeira versão do SILM não representa explicitamente:

- discordância de aresta ou helicoidal;
- núcleo da discordância;
- linha de discordância e sua orientação;
- nucleação ou fontes de discordâncias;
- interação entre discordâncias;
- discordâncias parciais e falhas de empilhamento;
- pinning em impurezas ou contornos;
- aniquilação e multiplicação de discordâncias.

A explicação contextual deve apresentar o mecanismo real e declarar que a cena mostra uma aproximação geométrica do cisalhamento resultante.

### 4.3 Tensão de cisalhamento resolvida e lei de Schmid

Para um monocristal sob tensão uniaxial idealizada, a tensão de cisalhamento resolvida em um sistema de deslizamento é:

\[
\tau_R=\sigma\cos\phi\cos\lambda
\]

onde:

- φ é o ângulo entre o eixo de carga e a normal ao plano de deslizamento;
- λ é o ângulo entre o eixo de carga e a direção de deslizamento.

O fator de Schmid é:

\[
m=\cos\phi\cos\lambda
\]

e:

\[
\tau_R=m\sigma
\]

O deslizamento pode começar quando a tensão resolvida alcança a tensão crítica de cisalhamento resolvida (CRSS), sob as hipóteses aplicáveis ao sistema e material.

A condição geométrica de máxima resolução no modelo clássico ocorre quando φ e λ são ambos 45°, resultando em fator de Schmid máximo de 0,5.

**Implementação atual:** o SILM gira automaticamente o cristal para essa orientação de ensaio, para tornar o mecanismo visível. A orientação escolhida é didática. Não representa a orientação original de um corpo de prova nem uma textura medida.

A lei clássica de Schmid não deve ser considerada universal. Em particular, deslizamento em metais CCC pode apresentar dependência de temperatura e efeitos não-Schmid relacionados ao núcleo das discordâncias helicoidais.

## 5. Sistemas de deslizamento por estrutura

O SILM deve diferenciar a família cristalográfica de todos os sistemas que podem operar dentro dessa família.

### 5.1 CFC — cúbica de faces centradas

Sistema principal de referência:

\[
\{111\}\langle110\rangle
\]

A estrutura CFC possui 4 planos equivalentes da família {111}, e em cada plano existem 3 direções independentes da família <110>, totalizando 12 sistemas de deslizamento convencionais.

Esses planos e direções são compactos. O modelo atual seleciona um sistema representativo, plano (111) e direção compatível, para produzir uma experiência visual.

Isso não significa que os outros 11 sistemas não existam ou não possam operar. O motor atual não resolve competição entre sistemas.

### 5.2 CCC — cúbica de corpo centrado

Uma família de referência comum é:

\[
\{110\}\langle111\rangle
\]

A família {110} combinada com as direções <111> contém 12 sistemas convencionais. Porém, metais CCC também podem apresentar deslizamento em famílias {112} e {123}, além de dependência de temperatura, orientação, taxa de deformação e movimento de discordâncias helicoidais.

O plano {110} não deve ser descrito como plano compacto equivalente ao {111} de CFC. A física de mobilidade de discordâncias CCC é mais complexa, e a tensão de escoamento pode variar fortemente com temperatura.

O SILM atual usa apenas um sistema representativo {110}<111>. Ele não prevê a ativação competitiva de {112} ou {123}, nem a dependência térmica do movimento de discordâncias.

### 5.3 HC — hexagonal compacta

Sistema basal de referência:

\[
\{0001\}\langle11\bar{2}0\rangle
\]

A família basal contém três direções equivalentes de deslizamento no plano basal. O SILM atual usa apenas um sistema representativo dessa família.

Entretanto, metais HC podem também deformar por sistemas prismáticos e piramidais. Sistemas piramidais com componente <c+a> podem ser necessários para acomodar deformação ao longo do eixo c; maclação mecânica também pode participar.

Somente deslizamento basal não é suficiente para representar toda a compatibilidade de deformação tridimensional de um policristal HC. Portanto, a experiência atual não pode concluir que qualquer metal HC seja necessariamente pouco dúctil ou tenha baixa maleabilidade.

### 5.4 Tabela de escopo atual e limites

| Estrutura | Sistema usado pelo SILM | Sistemas adicionais importantes | Limite da versão atual |
|---|---|---|---|
| CFC | {111}<110> | Os 12 sistemas da família | Apenas um sistema representativo é animado |
| CCC | {110}<111> | {112}<111> e {123}<111>, conforme material/condição | Não modela sistemas alternativos nem a forte dependência térmica de mobilidade |
| HC | {0001}<11-20> | Prismático <a>, piramidal <a> e <c+a>, maclação | Somente deslizamento basal representativo |

A disponibilidade de um sistema depende da estrutura e geometria homologadas. Para estruturas complexas do modelo cristalográfico geral, a deformação permanece indisponível até que uma mecânica específica seja modelada e testada.

## 6. Compressão e tração na cena

### 6.1 Ferramenta de compressão

A prensa deve aplicar forças opostas que aproximam as faces do corpo de prova. O controle visual representa compressão axial e a deformação plástica é exibida como encurtamento e espalhamento lateral.

O modelo não deve insinuar que a amostra pode ser achatada indefinidamente ou que a seção transversal aumenta segundo uma lei quantitativa de conservação de volume, pois a transformação atual é didática.

### 6.2 Ferramenta de tração

As garras aplicam forças opostas ao longo do eixo de tração. A representação mostra alongamento e estreitamento, com deslizamentos permanentes.

A experiência não contém defeitos de superfície, pescoço, vazios, microtrincas ou ruptura. Não deve usar os termos "limite de resistência à tração" ou "alongamento na ruptura" como resultados calculados.

### 6.3 Força contínua

O usuário deve conseguir:

- aplicar carga por arraste da ferramenta;
- ajustar a carga por teclado;
- usar botões como alternativa ao arraste;
- observar a resposta elástica enquanto aplica carga;
- observar o início do deslizamento representado;
- retirar a carga e observar o retorno elástico;
- reconhecer o deslocamento plástico que permaneceu.

A interface atual já oferece prensa/garras, alça e controles alternativos. O novo contrato exige preservar essa continuidade.

## 7. Dados necessários para respostas específicas por metal

### 7.1 Propriedades mecânicas

Para evoluir de uma resposta igual para todos os metais a uma resposta dependente do elemento e da condição, serão necessários dados como:

| Grandeza | Símbolo | Unidade SI | Uso |
|---|---|---|---|
| Módulo de Young | E_Y | Pa | Rigidez elástica uniaxial |
| Módulo de cisalhamento | G | Pa | Resposta elástica ao cisalhamento |
| Limite de escoamento | σ_y | Pa | Início do escoamento sob convenção definida |
| CRSS | τ_c | Pa | Ativação de sistema de deslizamento |
| Resistência máxima à tração | σ_UTS | Pa | Pico da curva de engenharia |
| Alongamento na ruptura | A ou ε_f | % | Ductilidade em ensaio definido |
| Redução de área | RA | % | Estricção antes da fratura |
| Taxa de deformação | \dot ε | s⁻¹ | Dependência viscoplástica |
| Densidade de discordâncias | ρ_d | m⁻² | Evolução de endurecimento, se modelada |

Os dados devem preservar o tipo de ensaio, orientação, pureza, fase, temperatura, taxa de deformação, tamanho de grão e forma da amostra, quando disponíveis.

### 7.2 Dados de deslizamento

Um sistema cristalográfico genérico não fornece a CRSS de um metal específico. A adoção de um sistema de deslizamento precisa ser acompanhada de fonte que sustente:

- plano e direção ativos;
- vetor de Burgers;
- estrutura cristalina e fase;
- condição de temperatura;
- orientação ou textura;
- mecanismo predominante;
- fonte e incerteza.

A geometria do banco pode fornecer b, mas não fornece sozinha a mobilidade da discordância nem a tensão necessária para ativar o deslizamento.

### 7.3 Dependência de temperatura e taxa

A ativação de deslizamento depende de temperatura e taxa de deformação. Em metais CCC, o movimento de discordâncias helicoidais pode ser fortemente termicamente ativado. Em HC, a atividade relativa dos sistemas basal, prismático e piramidal pode mudar com temperatura e orientação.

Não extrapolar o limiar de escoamento de uma condição para outra sem curva e fonte.

### 7.4 Fontes e proveniência

A fonte atualmente registrada no banco como src-callister-rethwisch foi escolhida para sustentar os sistemas cristalográficos utilizados no motor. Entretanto, o registro ainda não contém edição, número da tabela ou página exatos. A URL é genérica da editora e a anotação do próprio banco mantém esses dados pendentes de conferência pelo autor.

Esse registro sustenta a decisão pedagógica já adotada, mas não substitui uma curadoria bibliográfica completa. Antes de importar novos sistemas ou números de propriedades mecânicas, a fonte deve ser completada ou complementada por fontes técnicas rastreáveis.

Cada conjunto de propriedade mecânica deverá guardar valor, unidade, tipo de ensaio, temperatura, fase, orientação, taxa de deformação, pureza, tamanho de grão quando informado, fonte, natureza da evidência e incerteza.

Não inserir um único limite de escoamento ou alongamento por elemento sem especificar a condição experimental.

## 8. Estado científico e registro da experiência

A estrutura cristalina de referência não deve ser sobrescrita pela deformação visual.

O estado científico deve guardar somente escolhas/resultados relevantes, como número de deslizamentos representados e tipo de experiência. A carga momentânea e a animação continuam transitórias.

A implementação atual preserva esse princípio: o estado registra o número de deslizamentos e a transformação visual é reconstruída da geometria de referência.

Um registro reproduzível de experiência, definido na Etapa 1, poderá futuramente guardar:

- metal e estrutura de referência;
- modo de carregamento (compressão ou tração);
- orientação de ensaio;
- sistema de deslizamento selecionado;
- quantidade de eventos de deslizamento;
- versão do modelo;
- condições e limitações.

Não guardar cada quadro de animação como dado científico. Uma sequência de ações pode ser registrada de forma compacta se for necessária para reproduzir a experiência.

## 9. Relações com outros estímulos

### 9.1 Deformação + campo elétrico

A combinação atual é uma experiência mecânica principal com campo elétrico auxiliar. Ela representa um aumento didático do espalhamento eletrônico associado aos defeitos introduzidos pela deformação.

Os defeitos não são desenhados nem contados como discordâncias reais. O fator de espalhamento é didático e não fornece resistividade quantitativa.

### 9.2 Deformação + calor

O aquecimento pode alterar a mobilidade de discordâncias e a tensão necessária para deformação. Contudo, essa resposta depende do metal, da temperatura, da taxa de deformação e da microestrutura.

A combinação não deve ser ativada automaticamente. Exige um modelo de plasticidade dependente de temperatura e parâmetros compatíveis. A fonte de calor não pode simplesmente reduzir o limiar de todos os metais por uma regra arbitrária.

### 9.3 Outras combinações

Luz + deformação e luz + calor não têm acoplamento mecânico definido nesta etapa. Não habilitar combinações adicionais sem explicar a relação física e os parâmetros necessários.

## 10. Regras de interface e acessibilidade

- A prensa e as garras devem mostrar claramente o sentido da carga.
- A ferramenta arrastável deve ter alvo de toque adequado.
- Teclado e botões devem reproduzir a mesma ação de carga.
- A interface deve identificar compressão e tração por texto e geometria, não apenas cor.
- O campo elástico deve ser visualmente distinto do deslocamento plástico persistente.
- O retorno elástico após soltar deve ser compreensível com movimento reduzido.
- Os planos usados no modelo devem ser identificáveis na cena, com rótulo curto.
- O sistema e o vetor b podem ser consultados como dados de referência; não devem parecer instrumentos de medição.
- O estado da investigação, metal e estrutura deve permanecer preservado ao encerrar a experiência.
- Não mostrar valores de força, tensão ou deformação real sem dados e unidades homologados.

## 11. Validação e critérios de teste

### 11.1 Invariantes geométricos já existentes

Os testes atuais conferem, para metais representativos CFC, CCC e HC:

- normal do plano perpendicular à direção de deslizamento;
- vetor b como vetor da própria rede;
- módulo de b compatível com a geometria cristalográfica utilizada;
- orientação de ensaio com fator de Schmid máximo no caso idealizado;
- ausência de sobreposição geométrica dos sítios após os deslizamentos;
- coerência entre forma estática e forma reconstruída do controlador;
- alongamento e estreitamento no modo de tração;
- encurtamento e espalhamento lateral no modo de compressão;
- retorno da deformação elástica sem deixar deslocamento plástico;
- ausência de sistema de deformação para estruturas gerais não homologadas.

### 11.2 Testes adicionais exigidos pelo contrato

- [ ] A interface identifica carga como normalizada e sem unidade física.
- [ ] A carga normalizada produz comportamento consistente por teclado, botão e arraste.
- [ ] O regime elástico retorna à referência após retirada da carga.
- [ ] O regime plástico mantém apenas os deslocamentos permanentes previstos.
- [ ] Desligar a carga não elimina os eventos de deslizamento já registrados.
- [ ] Restaurar elimina os deslocamentos da experiência, sem modificar a estrutura de referência.
- [ ] Encerrar e trocar de módulo deixam as ferramentas mecânicas inoperantes.
- [ ] A cena não descreve movimento simultâneo de um plano atômico inteiro como mecanismo real.
- [ ] A cena não apresenta os quatro eventos de deslizamento como quatro discordâncias.
- [ ] O rótulo de cada sistema corresponde ao plano e direção efetivamente usados pelo motor.
- [ ] CFC, CCC e HC não recebem afirmações universais de ductilidade ou resistência.
- [ ] Estruturas gerais permanecem indisponíveis até haver modelo específico.
- [ ] Não aparecem valores em N, Pa, MPa, módulo de Young ou alongamento até a ruptura sem dados.
- [ ] Combinação deformação + campo elétrico preserva sua natureza qualitativa.
- [ ] Calor + deformação continua indisponível enquanto não houver modelo e validação apropriados.

## 12. Plano de evolução

| Etapa | Desenvolvimento | Resultado esperado |
|---|---|---|
| M0 — Atual | Oscilador elástico didático e deslizamento geométrico em passos de b | Demonstração qualitativa já funcional |
| M1 — Clareza física | Ajustar textos, legendas e explicação da discordância; separar deslizamento líquido de movimento atomístico | O estudante entende o que a cena representa e o que omite |
| M2 — Orientação e sistemas | Permitir comparar orientação e sistemas de deslizamento, mantendo um sistema por experiência inicialmente | Evidenciar o papel da geometria e do fator de Schmid |
| M3 — Dados mecânicos | Curar E, G, CRSS, σ_y, curvas e condições por metal | Resposta específica apenas onde houver dados compatíveis |
| M4 — Evolução plástica | Modelar encruamento, interação de discordâncias e dependência de taxa/temperatura | Curva de resposta mais próxima do material real |
| M5 — Fratura e ductilidade | Introduzir critério de dano/ruptura com dados e modelos adequados | Diferenciar alongamento representado de ductilidade medida |
| M6 — Outros mecanismos | Avaliar maclação, sistemas alternativos CCC/HC e estruturas não cobertas | Ampliar a cobertura sem extrapolar o modelo atual |

A implementação deve continuar didática até que a cobertura de dados e modelos permita cada expansão.

## 13. Fora do escopo inicial

- previsão de resistência ou ductilidade real de cada elemento sem dados;
- curva completa de tensão-deformação;
- encruamento e recuperação/recristalização;
- nucleação, multiplicação e interação de discordâncias;
- fratura dúctil ou frágil;
- contornos de grão, textura e policristais;
- maclação mecânica;
- sistemas prismáticos e piramidais de HC;
- sistemas {112} e {123} de CCC;
- dependência de temperatura e taxa de deformação;
- fluência e fadiga;
- ensaios padronizados de tração, compressão ou dureza.

Esses fenômenos exigem modelos, dados e validações adicionais.

## 14. Referências

1. OPENSTAX. *University Physics Volume 1*, seção 12.3 — Stress, Strain, and Elastic Modulus. Definições de tensão, deformação e módulos elásticos. https://openstax.org/books/university-physics-volume-1/pages/12-3-stress-strain-and-elastic-modulus
2. OPENSTAX. *University Physics Volume 1*, seção 12.4 — Elasticity and Plasticity. Distinção entre deformação elástica, plástica, limite elástico e fratura. https://openstax.org/books/university-physics-volume-1/pages/12-4-elasticity-and-plasticity
3. NPTEL / IIT Madras. *Basics of Materials Engineering*. Curso com aulas específicas sobre sistemas de deslizamento, vetor de Burgers, movimento de discordâncias, tensão de cisalhamento resolvida e deformação plástica. https://nptel.ac.in/courses/112106293
4. INFLIBNET. *Motion of dislocations & dislocation density*. Explica o avanço de discordâncias pelo plano de deslizamento, a relação F = τb e a contribuição de muitas discordâncias para a deformação plástica. https://ebooks.inflibnet.ac.in/msp06/chapter/262/
5. WEISS, Jérôme et al. Contrasting the nature of plastic fluctuations in small-sized systems of BCC and FCC materials. *Journal of Materials Science: Materials Theory*, v. 8, art. 8, 2024. DOI: 10.1186/s41313-024-00061-x. Discute diferenças de mobilidade de discordâncias e dependência térmica em sistemas CCC e CFC. https://doi.org/10.1186/s41313-024-00061-x
6. ZHANG, Qinghui et al. A Review of the Mechanical Behavior of Magnesium Alloys in Compression: From Mechanistic Competition to Structural Regulation. *Materials*, v. 19, n. 10, 1966, 2026. DOI: 10.3390/ma19101966. Discute sistemas basais, prismáticos, piramidais e maclação em materiais HC, ressaltando a limitação do deslizamento basal isolado. https://doi.org/10.3390/ma19101966
7. XIAO, Dongyang et al. Research Progress on Plastic Deformation Induced by HCP to FCC Phase Transformation in Hexagonal Close-Packed Metals. *Advanced Engineering Materials*, 2025. DOI: 10.1002/adem.202402445. Revisão dos mecanismos de deformação em metais HC, incluindo deslizamento, maclação e transformação de fase. https://doi.org/10.1002/adem.202402445
8. CALLISTER, William D., Jr.; RETHWISCH, David G. *Materials Science and Engineering: An Introduction*. Fonte selecionada pelo autor no banco do SILM para os sistemas de deslizamento. Edição, tabela e página exatas ainda precisam ser conferidas no exemplar utilizado; o registro atual src-callister-rethwisch permanece incompleto para auditoria bibliográfica integral.

## 15. Próxima etapa

A Etapa 6 deve aprofundar as **combinações de estímulos**. O objetivo será construir uma matriz explícita de combinações permitidas, proibidas ou ainda não homologadas, definindo os acoplamentos físicos e computacionais, a ordem de aplicação, as variáveis compartilhadas e a prevenção de motores duplicados.
