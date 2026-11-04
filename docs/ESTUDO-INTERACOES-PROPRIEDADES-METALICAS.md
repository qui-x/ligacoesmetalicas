# Estudo de acoplamento entre propriedades metálicas

**Status:** estudo científico e de arquitetura em elaboração.  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Escopo:** propriedades já representadas no SILM: condutividade elétrica, condutividade térmica, maleabilidade, ductilidade e brilho metálico.

Este documento amplia a seção 9 — P7 — do plano `docs/PLANO-PROPRIEDADES-METALICAS.md`, que já registra calor + corrente e deformação + corrente. Não altera, por si só, o motor científico nem autoriza combinações ainda não validadas.

---

## 1. Correção de vocabulário e modelo mental

O SILM deve separar **estímulos aplicados**, **mecanismos de transporte** e **respostas do material**.

- **Condutividade elétrica**: transporte de carga sob campo elétrico ou diferença de potencial.
- **Condutividade térmica**: transporte de energia térmica sob gradiente de temperatura ou fluxo de calor.
- **Resposta mecânica**: comportamento sob força, tensão e deformação. Maleabilidade e ductilidade são propriedades mecânicas, não formas de “condutividade mecânica”.
- **Brilho metálico**: resposta óptica da superfície à radiação incidente.

Maleabilidade e ductilidade pertencem à mesma família de estímulo mecânico, mas representam modos de ensaio diferentes: **compressão** (formação de lâmina) e **tração** (formação de fio). Não são dois transportes independentes que devam ser somados como se fossem calor e corrente. Podem coexistir em um estado de tensão multiaxial, mas isso exige um tensor de tensões e uma geometria de ensaio próprios.

A interface pode continuar permitindo selecionar propriedades; o motor, porém, deve converter essa seleção em condições físicas explícitas. Selecionar dois ícones não significa simplesmente ligar dois efeitos visuais.

## 2. Condições de aplicação: cada fenômeno tem seu próprio controle

### 2.1 Elétrica — campo, potencial e corrente

**Estímulo físico:** diferença de potencial entre terminais ou campo elétrico aplicado ao longo do corpo.

**Grandezas e resposta:**
- campo elétrico `E` (V/m);
- densidade de corrente `J` (A/m²);
- condutividade `σ` (S/m) ou resistividade `ρₑ = 1/σ` (Ω·m);
- regime ôhmico simplificado: `J = σE`.

**Condições que precisam ser definidas:**
1. modo de controle: potencial/tensão prescrita ou corrente prescrita;
2. direção do campo e posição dos terminais/eletrodos;
3. intensidade e duração do estímulo;
4. temperatura inicial e dependência de `σ` com a temperatura;
5. contatos elétricos e resistência de contato, quando relevantes.

Não se deve prescrever tensão e corrente como controles independentes incompatíveis. Em uma fonte de tensão, a corrente é resposta; em uma fonte de corrente, o potencial necessário é resposta. O deslocamento médio dos elétrons tem sentido oposto ao campo elétrico convencional.

**Como está no SILM:** a intensidade do campo é didática e normalizada (5–100%, sem unidade); a deriva visual cresce proporcionalmente à intensidade. O motor atual não calcula a condutividade elétrica real de cada metal nem resolve os potenciais nos terminais.

### 2.2 Térmica — gradiente, fluxo e fonte de calor

**Estímulo físico de condução:** diferença de temperatura entre regiões ou fluxo de calor imposto.

**Grandezas e resposta:**
- temperatura `T` (K);
- gradiente `∇T` (K/m);
- fluxo térmico `q = −κ∇T` (W/m²);
- condutividade térmica `κ` (W/(m·K));
- difusividade térmica `α = κ/(ρₘ cₚ)` (m²/s), que controla a rapidez de equalização e não é a mesma grandeza que `κ`.

**Condições que precisam ser definidas:**
1. temperatura inicial;
2. fonte quente e região fria, ou fluxo térmico imposto;
3. superfícies isoladas, temperatura prescrita, convecção ou radiação;
4. duração/regime transitório ou estacionário;
5. capacidade térmica `cₚ`, densidade e dependência de `κ` com a temperatura.

É essencial diferenciar **condução térmica** de **geração de calor**. Uma fonte colocada em um ponto demonstra propagação/difusão; por si só, não mede a condutividade térmica do metal. Para demonstrar `κ`, é preciso relacionar fluxo e gradiente de temperatura. Para demonstrar difusividade `α`, também é necessário conhecer capacidade térmica e densidade.

**Como está no SILM:** `thermal.js` resolve uma equação do calor discreta sobre o grafo de vizinhos. O coeficiente `D = 0,45 s⁻¹` é didático, único para todos os metais, e o modelo não perde calor para o ambiente. A temperatura visual vai de 0 (ambiente) a 1 (fonte). O estado de temperatura e a posição da fonte são transitórios. Portanto, a experiência atual é uma demonstração qualitativa de propagação, não uma medição numérica de `κ`.

### 2.3 Mecânica — solicitação, tensão e deformação

**Estímulo físico:** força/carga aplicada ou deslocamento imposto.

**Grandezas e resposta:**
- tensão mecânica `σₘ = F/A` (Pa);
- deformação `ε = ΔL/L₀` (adimensional);
- modo de carga: compressão, tração, cisalhamento, flexão ou combinação;
- taxa de deformação, orientação cristalográfica e temperatura.

**Condições que precisam ser definidas:**
1. controle por força/tensão ou por deslocamento/deformação;
2. direção e distribuição da carga;
3. geometria, área/seção e apoios/garras;
4. temperatura e taxa de deformação;
5. limite elástico/escoamento, encruamento e critério de falha, quando houver dados homologados.

**Maleabilidade:** resposta a carregamento predominantemente compressivo.  
**Ductilidade:** capacidade de deformar plasticamente sob tração antes da ruptura.

A deformação elástica é reversível quando a carga é retirada; a plástica deixa mudança permanente. O deslizamento de planos e a geração/movimentação de discordâncias explicam a deformação plástica cristalina.

**Como está no SILM:** `deformation.js` usa sistemas representativos para CFC, CCC e HC, quatro passos de deslizamento no máximo, limiar e deformação elástica didáticos e iguais para todos os metais. Não calcula curvas tensão–deformação ou limites de escoamento específicos por metal. A experiência deve ser identificada como mecanismo qualitativo, não como ensaio mecânico numérico.

### 2.4 Óptica — incidência, espectro e superfície

**Estímulo físico:** radiação incidente sobre uma superfície.

**Condições que precisam ser definidas:**
1. comprimento de onda/espectro;
2. intensidade/irradiância;
3. ângulo de incidência medido a partir da normal;
4. polarização;
5. estado da superfície: rugosidade, oxidação e orientação.

A refletividade real depende das constantes ópticas complexas (índice de refração e coeficiente de extinção), do comprimento de onda e do ângulo. A lei `θᵣ = θᵢ` define a direção da reflexão especular ideal, mas não determina, sozinha, quanto da energia é refletida ou absorvida.

**Como está no SILM:** `luster` mostra uma lanterna e a lei da reflexão; o ângulo é didático. Não há espectro, constantes ópticas `n,k`, cálculo de refletância ou fração absorvida. Assim, o efeito visual atual não permite ainda aquecimento por absorção luminosa nem comparação de cores reais dos metais.

---

## 3. Mecanismos que conectam os fenômenos

### 3.1 Elétrica ↔ térmica

Esta é uma conexão física forte, mas possui mecanismos diferentes que não devem ser confundidos.

1. **Transporte eletrônico de calor:** os elétrons transportam carga e também energia. Para muitos metais, a contribuição eletrônica da condutividade térmica se relaciona à condutividade elétrica pela lei de Wiedemann–Franz:
   `κₑ ≈ LσT`.
2. **Contribuição da rede:** a condutividade térmica total também contém contribuição dos fônons/vibrações da rede: `κ = κₑ + κL`. A lei de Wiedemann–Franz não autoriza substituir a condutividade térmica total por `LσT` sem separar as contribuições.
3. **Efeito Joule:** a passagem de corrente gera calor volumétrico: `q̇J = J·E`. Esse termo é uma fonte na equação térmica, não é a própria condutividade térmica.
4. **Temperatura sobre a elétrica:** a temperatura modifica o espalhamento dos elétrons e a resistividade.
5. **Efeitos termoelétricos:** gradiente térmico pode produzir tensão (Seebeck); corrente pode absorver/liberar calor em junções de materiais diferentes (Peltier); corrente junto a gradiente térmico pode produzir aquecimento/resfriamento reversível ao longo de um condutor (Thomson). Esses efeitos exigem coeficiente de Seebeck/Peltier/Thomson e condições específicas; não estão implementados no motor atual.

**Duas experiências que a interface deve distinguir:**
- **Corrente + aquecimento externo:** há campo elétrico e uma fonte térmica independente. É o cenário qualitativo que o P7 do SILM começou a demonstrar.
- **Corrente + aquecimento Joule:** a própria corrente gera calor; a fonte térmica externa não é necessária. Este é o acoplamento eletrotérmico propriamente dito.

Uma terceira experiência futura seria **gradiente térmico + resposta elétrica** (Seebeck), que não é equivalente a “ligar calor e corrente”.

### 3.2 Elétrica ↔ mecânica

A deformação plástica introduz defeitos e discordâncias que aumentam o espalhamento dos elétrons e, em geral, a resistividade. Também muda comprimento, seção e contatos do corpo, alterando a resistência medida. A pressão sobre contatos pode alterar a condutância de contato.

O SILM P7 atual representa qualitativamente o efeito dos defeitos no transporte eletrônico. Isso não significa que o campo elétrico esteja, por si só, facilitando a deformação mecânica.

**Eletroplasticidade** é outro fenômeno: carregamento elétrico pode influenciar a deformação plástica por mecanismos que vão além do aquecimento Joule. Para demonstrá-la, seria necessário separar cuidadosamente aquecimento e efeitos eletromecânicos, controlar corrente/pulsos, temperatura, carga e microestrutura. Não deve ser inferida apenas por acionar simultaneamente campo e prensa.

### 3.3 Térmica ↔ mecânica

A temperatura altera o comportamento mecânico: em geral, resistência ao escoamento e módulo podem diminuir, enquanto a ductilidade pode aumentar, dependendo do metal e da faixa de temperatura. A expansão térmica produz deformação `εth = αT ΔT`. Se o corpo estiver impedido de expandir, surgem tensões térmicas. Deformação plástica também pode converter parte do trabalho mecânico em calor.

Para uma combinação térmica-mecânica consistente são necessários: `αT`, módulo, propriedades mecânicas dependentes da temperatura, capacidade térmica, condições de contorno e uma descrição do trabalho/dissipação plástica. Não basta aquecer uma cena e mudar visualmente o tamanho da célula.

### 3.4 Óptica ↔ térmica

A relação é bidirecional e exige dois modelos acoplados:

1. **Fototérmica (O → T):** a parcela absorvida da potência óptica é convertida em fonte térmica espacial, não a parcela refletida/transmitida. Exige irradiância/espectro, R/A/Topt, profundidade e perfil de absorção, geometria da amostra, ρ, cp, k e fronteiras térmicas.
2. **Termorrefletância (T → O):** a temperatura altera n(λ,T), κ(λ,T), R(λ,T) ou o coeficiente CTR. O sinal pode ser positivo ou negativo e depende de metal, comprimento de onda, temperatura, amostra, superfície e polarização; aquecer não implica sempre aumentar o brilho.

Pump–probe separa a bomba que aquece da prova que lê a mudança de refletância. Para mudanças pequenas pode-se usar ΔR/R ≈ CTR·ΔT dentro da faixa calibrada; para variações grandes são necessárias curvas R(λ,T) ou constantes ópticas dependentes de T. A energia absorvida e a energia que sai pelas fronteiras devem fechar o balanço térmico.

O motor atual de brilho não calcula absorção/refletância espectral e o motor térmico é qualitativo, sem escala física para energia/temperatura. Portanto, T+O permanece não implementada e quantitativamente bloqueada. Especificação completa: `docs/ESPECIFICACAO-ACOPLAMENTO-TERMO-OPTICO.md`.

### 3.5 Óptica ↔ elétrica

A resposta óptica e a elétrica têm origem relacionada na dinâmica dos elétrons, mas ocorrem em frequências muito diferentes. A condutividade DC do modelo atual não determina o espectro de refletividade. A conexão requer resposta óptica complexa `ε(ω)` ou constantes `n(λ), k(λ)` por comprimento de onda e, quando pertinente, modelo de Drude ou dados experimentais. Não se deve inferir a cor do metal a partir da condutividade DC.

### 3.6 Óptica ↔ mecânica

A deformação pode mudar a orientação da superfície, a normal local, a rugosidade e a distribuição de luz refletida. Uma demonstração geométrica pode, em uma primeira etapa, atualizar o ângulo de reflexão conforme a superfície se deforma. Alterações de refletividade, cor ou resposta eletrônica exigem dados e modelos ópticos adicionais.

---

## 4. Matriz das combinações possíveis

A matriz considera quatro famílias físicas: elétrica (E), térmica (T), mecânica (M) e óptica (O). M possui dois modos de ensaio: compressão/maleabilidade e tração/ductilidade.

| Combinação | Interação que pode ser demonstrada | Condições complementares | Situação no SILM |
|---|---|---|---|
| E + T | transporte de carga e calor; espalhamento térmico; Joule | distinguir aquecimento externo, Joule e gradiente imposto; incluir κₑ e κL | P7 parcial: corrente + fonte térmica externa |
| E + M (compressão) | defeitos de deformação afetam espalhamento elétrico | campo/terminais, compressão, taxa, temperatura e deformação | P7 qualitativa existente |
| E + M (tração) | defeitos de deformação afetam espalhamento elétrico | campo/terminais, tração, taxa, temperatura e deformação | P7 qualitativa existente |
| E + O | resposta eletrônica comum em frequências distintas; refletância calculada a partir da resposta óptica espectral | n(λ), κ(λ) ou ε̃(ω), espectro, polarização, ângulo, superfície e fase | especificada em ESPECIFICACAO-ACOPLAMENTO-ELETRO-OPTICO.md; não implementada |
| T + M (compressão) | temperatura altera escoamento/ductilidade; expansão e tensão térmica | fonte/gradiente, apoios, αT, E(T), escoamento(T), taxa | não implementada |
| T + M (tração) | temperatura altera resistência/ductilidade durante tração | fonte/gradiente, apoios, αT, E(T), curva tensão–deformação(T) | não implementada |
| T + O | absorção óptica gera calor; temperatura altera refletância/absorção | R/A/Topt, perfil de absorção, ρ, cp, k, fronteiras, R(λ,T) ou CTR | especificada em ESPECIFICACAO-ACOPLAMENTO-TERMO-OPTICO.md; não implementada |
| M + O (compressão) | forma e orientação da superfície alteram reflexão | geometria da superfície, normal local, rugosidade | não implementada |
| M + O (tração) | alongamento/alinhamento altera geometria e reflexão | geometria da superfície, normal local, rugosidade | não implementada |

**M + M (maleabilidade + ductilidade):** não deve ser oferecida como par comum de propriedades. São modos de solicitação diferentes. Uma combinação de compressão e tração em eixos diferentes é fisicamente possível, mas exige um ensaio multiaxial, não dois botões de propriedade independentes.

### Combinações de três famílias

| Combinação | Fenômeno principal | Complexidade / requisito |
|---|---|---|
| E + T + M | acoplamento eletrotérmico e termomecânico, com deformação alterando transporte | alta: resolver potencial/corrente, temperatura e deslocamento/deformação de modo acoplado |
| E + T + O | corrente DC gera Joule; iluminação gera calor pela absorção; T altera resposta DC e óptica | muito alta: dois domínios de excitação, três fontes/saídas energéticas, realimentação σDC(T) e R/A/Topt(λ,T); balanço global |
| E + M + O | uma deformação comum altera geometria/resistência, microestrutura e superfície/reflexão; a resposta óptica intrínseca pode ser sensível à tensão | muito alta: geometria compartilhada, resistividade microestrutural, contatos e óptica espectral; ver [especificação E+M+O](ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md) |
| T + M + O | aquecimento altera resposta mecânica e geometria/óptica | alta: expansão, tensão térmica, superfície e balanço óptico-térmico |

**Quatro famílias E + T + M + O:** fisicamente possível em um problema multifísico específico, mas não deve ser um “modo geral” do SILM sem dados, equações, condições de contorno e validação dos quatro campos.

**Especificação E + M + O:** [ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md](ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md). A primeira etapa usa reflexão geométrica e resistência geométrica; as extensões microestrutural e elasto-óptica exigem parâmetros próprios.

---

## 5. Arquitetura recomendada: selecionar propriedades, aplicar condições físicas

A seleção múltipla da paleta deve indicar quais fenômenos o aluno deseja observar. Em seguida, a interface deve abrir/apresentar apenas os parâmetros de aplicação necessários, sem criar uma página ou menu separado para cada propriedade.

Cada família terá um objeto de estímulo:

- `electrical`: modo (potencial ou corrente), direção, intensidade, terminais e duração;
- `thermal`: modo (temperatura/gradiente, fluxo ou fonte), posição, potência/temperatura, dissipação e duração;
- `mechanical`: modo (compressão, tração, cisalhamento), força ou deslocamento, direção, apoios e taxa;
- `optical`: comprimento de onda, intensidade, ângulo, polarização e condição da superfície.

O motor combina os estímulos por relações explícitas, em vez de sobrepor animações. Exemplos:
- E → gera `q̇J` quando a condição de Joule está habilitada;
- T → muda `σ(T)`, `κ(T)` e propriedades mecânicas dependentes de temperatura, somente se houver funções/dados definidos;
- M → atualiza geometria, deformação plástica e densidade de defeitos; os defeitos podem alterar espalhamento e resistência;
- O → calcula reflexão e parcela absorvida; só a energia absorvida entra como fonte térmica.

## 6. Política de validação e prioridade

### Nível 0 — já disponível, qualitativo
- E isolada, T isolada, M isolada (compressão ou tração), O isolada.
- E + T, com aquecimento externo separado da corrente.
- E + M, distinguindo compressão e tração e mantendo o campo transitório.

Os coeficientes didáticos atuais não devem ser apresentados como propriedades medidas do metal.

### Nível 1 — próxima evolução recomendada
1. Separar claramente no seletor térmico **fonte externa**, **gradiente quente-frio** e **aquecimento Joule**.
2. Implementar E + T com balanço de energia explícito: corrente → Joule → temperatura → resistividade; manter separada a contribuição `κₑ` e `κL`.
3. Implementar T + M: expansão térmica, restrição de movimento, tensões térmicas e mudança qualitativa da resposta mecânica com a temperatura.
4. Implementar M + O apenas como mudança geométrica da reflexão, sem alegar mudança de cor/reflectividade real.

### Nível 2 — depende de dados e estudo adicional
- Seebeck, Peltier e Thomson (exigem coeficientes termoelétricos e condições de junção/gradiente).
- E + O por constantes ópticas e resposta espectral; a condutividade DC não substitui σ̃(ω), e efeitos de aquecimento exigem E + T + O. Ver `docs/ESPECIFICACAO-ACOPLAMENTO-ELETRO-OPTICO.md`.
- E + T + O integra corrente DC, Joule, absorção luminosa e termorrefletância, com fontes sem duplicação e balanço energético global. Ver `docs/ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-OPTICO.md`.
- T + O por absorção fototérmica e termorrefletância; exige R/A/Topt, transferência de calor e resposta óptica dependente de T. A variação de refletância pode ter qualquer sinal. Ver `docs/ESPECIFICACAO-ACOPLAMENTO-TERMO-OPTICO.md`.
- Eletroplasticidade além de Joule (campo/corrente, pulsos, temperatura controlada, mecanismo microestrutural e fonte).
- Comparação entre metais (condutividades, resistividade, capacidade térmica, expansão, propriedades mecânicas, dados ópticos), sempre com valor, unidade, condição e fonte.

### Nível 3 — multifísica avançada
- E + T + M acoplados no mesmo passo de tempo.
- E + T + O com fontes Joule e fototérmica integradas e resposta espectral dependente de temperatura.
- Combinações com O em escala espectral e de superfície, após validação dos pares e trios.
- Estado multiaxial combinando compressão, tração e cisalhamento.

## 7. Limites do banco e salvaguardas

O plano de propriedades existente registra que o banco não tinha valores numéricos homologados para as experiências; os campos de `properties` do pacote científico atual também estão vazios nos registros consultados. A camada de dados já prevê condutividade elétrica, resistividade e condutividade térmica com unidade, condições e fonte, mas só deve usar valores quando estiverem completos e homologados.

Regras:
1. Não inventar valores “típicos” por metal.
2. Não converter coeficiente didático do motor em dado experimental.
3. Não usar a lei de Wiedemann–Franz para igualar `κ` total a `LσT`; relacionar apenas `κₑ`, reconhecendo `κL`.
4. Não chamar a fonte térmica externa de aquecimento Joule.
5. Não chamar o efeito atual de campo + deformação de eletroplasticidade.
6. Não usar cor/reflectividade por metal sem dados ópticos espectrais.
7. Não tratar maleabilidade e ductilidade como dois vetores de condução.
8. Não ativar combinações que não tenham mecanismo, variáveis, limites, mensagem científica e testes definidos.

## 8. Testes de física e interface exigidos

| Família / acoplamento | Invariantes e testes |
|---|---|
| E | sem campo, deriva média nula; deriva com sentido oposto a E e cresce com intensidade |
| T | conservação/ balanço de energia conforme as fronteiras; calor vai de quente para frio; equilíbrio; estabilidade e limites de T |
| M | deformação elástica volta após descarregar; deslizamentos plásticos ficam; geometria segue sistema de deslizamento |
| O | reflexão especular respeita θᵣ = θᵢ; energia refletida + absorvida fecha o balanço, se absorção for modelada |
| E + T | Joule não aparece com corrente zero; fonte externa e Joule são distinguíveis; temperatura influencia σ; energia fecha |
| E + M | deformação muda resistividade por defeitos/geométrica; desligar campo não apaga deformação plástica; sem alegar eletroplasticidade |
| T + M | expansão livre não cria tensão térmica indevida; restrição cria tensão; efeito da temperatura é compatível com dados/modelo |
| E + T + M | conservação de energia, consistência dos campos e estabilidade do passo de tempo |
| Touch/desktop | seleção múltipla, aplicação/cancelamento, mesma semântica por teclado/toque, foco, movimento reduzido e sem ativação parcial |

---

## 9. Fontes consultadas

1. Callister, W. D.; Rethwisch, D. G. *Materials Science and Engineering: An Introduction*, 9ª ed. — propriedades elétricas, regra de Matthiessen, transporte térmico, lei de Wiedemann–Franz e resposta mecânica. [Cópia de consulta acadêmica](https://edisciplinas.usp.br/pluginfile.php/8800473/mod_resource/content/0/Callister%20-%20Materials%20Science%20and%20Engineering%20An%20Introduction%209th%20c2014%20txtbk.pdf). A edição/tabela/página da edição brasileira ainda precisa ser conferida pelo autor, como já registrado no SILM.
2. Vaqueiro, P. “Synthesis and Property Measurements of Thermoelectric Materials”, Royal Society of Chemistry, 2021. [DOI 10.1039/9781788019590-00001](https://doi.org/10.1039/9781788019590-00001). Decomposição `κ = κL + κe`, relação Wiedemann–Franz e limites do número de Lorenz.
3. Dash, A. et al. “Electroplasticity of Metals and Ceramics: Current Status”, *Annual Review of Materials Research*, 55, 151–174, 2025. [DOI 10.1146/annurev-matsci-081720-111526](https://doi.org/10.1146/annurev-matsci-081720-111526). Distingue efeitos além do aquecimento Joule na eletroplasticidade.
4. Dassault Systèmes, *Abaqus Analysis User’s Guide*, “Fully coupled thermal-electrical-structural analysis”. [Documentação](https://ceae-server.colorado.edu/v2016/books/usb/pt03ch06s07at23.html). Acoplamentos entre temperatura, potencial elétrico, deslocamento, Joule, expansão e contato.
5. Abaqus, “Thermal Expansion”. [Documentação](https://docs.software.vt.edu/abaqusv2025/English/SIMACAEMATRefMap/simamat-c-thermalexpan.htm). Deformação térmica e tensões quando a expansão é restringida.
6. European Thermoelectric Society, “Thermoelectric Effects”. [Página de referência](https://thermoelectricity.eu/thermoelectrics/thermoelectric-effects/). Efeitos Seebeck, Peltier e Thomson.
7. Springer Nature, “An estimation of the reflectivity of some monophasic binary gold alloys”, *Gold Bulletin*, 2014. [DOI 10.1007/s13404-013-0124-7](https://doi.org/10.1007/s13404-013-0124-7). Constantes ópticas complexas, comprimento de onda e refletividade.
8. U.S. Department of Energy, *DOE Fundamentals Handbook — Material Science*, DOE-HDBK-1017/1-93. [Arquivo de consulta](https://archives.standards.doxcelerate.com/documents/doe-hdbk-1017-1-93-doe-fundamentals-handbook-material-science-volume-1-of-2). Distinção entre maleabilidade (compressão) e ductilidade (tração).

---

## 10. Decisões que devem ser congeladas antes da implementação

- A paleta seleciona fenômenos; a experiência deve solicitar condições físicas coerentes para cada família.
- O modo elétrico deve permitir escolher tensão/potencial ou corrente, e não confundir intensidade adimensional com condutividade do metal.
- O modo térmico deve distinguir aquecimento externo, gradiente térmico e calor Joule.
- O modo mecânico deve distinguir compressão, tração e futuramente cisalhamento; não usar “condutividade mecânica”.
- As combinações E+T, E+M e T+M precisam ser tratadas como relações físicas, e não como duas animações independentes.
- E+T+M deve ser o objetivo central de acoplamento multifísico; óptica entra por modelos próprios quando os dados espectrais e de superfície estiverem disponíveis.
- Até que valores por metal sejam homologados, os resultados permanecem qualitativos e devem ser identificados como tais.
