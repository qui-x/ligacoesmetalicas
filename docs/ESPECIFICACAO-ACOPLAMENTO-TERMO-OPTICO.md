# SILM — Especificação do acoplamento termo-óptico (T+O)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Famílias:** térmica (T) + óptica (O)  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETRO-OPTICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-MECANICO-OPTICO.md`

---

## 1. Objetivo e decisão central

Definir como a luz incidente pode aquecer uma amostra metálica por absorção e como a temperatura resultante modifica a resposta óptica da mesma amostra.

O acoplamento contém dois sentidos causais:

1. **Óptica → térmica:** uma fração da energia luminosa é absorvida; essa energia é convertida em fonte térmica distribuída na região de absorção.
2. **Térmica → óptica:** a temperatura altera os parâmetros ópticos do material; a refletância, absorção e, em certos casos, transmissão podem mudar.

A primeira versão deve separar rigorosamente:
- energia incidente;
- energia refletida;
- energia transmitida;
- energia absorvida;
- potência convertida em calor;
- energia que se acumula ou sai da amostra;
- mudança de refletância causada pela temperatura.

**Decisão central:** não ligar uma lanterna e aumentar a temperatura por um fator visual arbitrário. O calor só pode ser calculado a partir da energia absorvida; a mudança óptica só pode ser calculada a partir de parâmetros dependentes da temperatura ou de um coeficiente de termorrefletância medido nas condições correspondentes.

A experiência deve ser identificada como **fototérmica** quando a luz funciona como fonte de aquecimento. Deve ser identificada como **termorrefletância** quando a mudança da refletância é usada para observar/medir a temperatura. Uma experiência pode ter ambos os modos, mas eles não são a mesma grandeza nem devem ser confundidos.

## 2. Mecanismo físico do acoplamento

### 2.1 Balanço de energia óptica

Para uma amostra passiva, em regime estacionário e com as mesmas convenções de potência e área, a energia incidente se distribui entre reflexão, absorção e transmissão:

```
Pinc = Pref + Pabs + Ptrans
R + A + Topt = 1
```

- `R`: refletância de potência;
- `A`: absorptância;
- `Topt`: transmitância óptica (não confundir com temperatura);
- em amostra opaca, `Topt` pode ser desprezível, mas só quando a espessura e o espectro justificarem essa aproximação.

É útil explicitar a potência absorvida:

```
Pabs = A(λ,T,θ,pol,stack) · Pinc
Qabs = ∫ Pabs(t) dt
```

Para uma fonte de banda larga, a potência absorvida deve ser integrada sobre o espectro e a área iluminada (com a distribuição espacial/temporal da fonte):

```text
Pabs(t) = ∫área ∫λ A(λ,T,θ,pol,stack) Iinc(λ,x,y,t) dλ dA
```

A fração espectral não deve ser substituída por um único valor médio sem ponderação pela fonte. Em todos os casos, o perfil volumétrico deve satisfazer `∫volume q'''opt dV = Pabs`.

A absorptância depende do comprimento de onda, temperatura, ângulo, polarização, composição, fase, espessura, substrato, camadas superficiais e rugosidade. Em uma amostra de várias camadas, não se deve usar automaticamente `A=1−R`: a transmissão e as reflexões internas podem ser relevantes.

A refletância e a absorptância também podem mudar durante o aquecimento. Se `A` for atualizada com a temperatura, a fonte térmica precisa usar o valor atualizado no mesmo passo de acoplamento, respeitando o balanço de energia.

### 2.2 Da absorção para a fonte térmica

O calor é inicialmente gerado na região em que a energia eletromagnética é absorvida. Em uma aproximação de absorção exponencial de passagem única, para meio homogêneo, sem interferência e com coeficiente de absorção de intensidade `α`:

```
I(z) = I(0) exp(−αz)
q'''opt(z) = α I(z)
α = 4πκ/λ
```

`q'''opt` tem unidade W/m³ quando `I` é irradiância em W/m² e `z` está em metros. Para uma interface, `I(0)` dentro do material precisa considerar a fração transmitida pela interface, e não deve ser igualada à irradiância incidente no ar.

Essa aproximação só é válida quando a geometria pode ser tratada como meio homogêneo e a propagação por passagem única é apropriada. Para filmes finos, multicamadas, cavidades ou absorção com interferência, a distribuição da energia deve ser calculada a partir do campo eletromagnético local (por exemplo, matriz de transferência óptica e dissipação local), e não por uma exponencial simples.

A profundidade característica de penetração da intensidade, nesse modelo simples, é:

```
δopt = 1/α = λ/(4πκ)
```

Ela depende de `λ` e de `κ(λ,T)`. Não assumir que todo metal é opticamente opaco para qualquer espessura e comprimento de onda.

### 2.3 Evolução térmica

A temperatura deve resultar de uma equação de conservação de energia. Para um sólido contínuo, sem movimento macroscópico e com propriedades térmicas isotrópicas:

```
ρ cp(T) ∂T/∂t = ∇·[k(T) ∇T] + q'''opt + q'''other
```

- `ρ`: densidade de massa (kg/m³);
- `cp`: capacidade térmica específica (J/(kg·K));
- `k`: condutividade térmica (W/(m·K));
- `q'''opt`: fonte volumétrica absorvida (W/m³);
- `q'''other`: outras fontes explicitamente selecionadas, se houver.

Para materiais anisotrópicos, substituir `k∇T` pelo tensor de condutividade térmica. O modelo também pode exigir propriedades variáveis com temperatura, interfaces, calor latente e mudança de fase. Esses fenômenos não devem surgir implicitamente.

Em um modelo concentrado (lumped), o balanço pode ser aproximado por:

```
m cp dT/dt = Pabs − Pout
```

Esse modelo só é aceitável quando as diferenças internas de temperatura forem desprezíveis na escala de interesse. Não o usar para afirmar gradientes espaciais, profundidade de absorção ou resposta de filmes multicamadas.

### 2.4 Condições de contorno e saída de calor

A amostra não esfria porque a luz foi desligada por si só; ela esfria se houver mecanismos e condições de contorno capazes de remover a energia armazenada.

A primeira especificação deve permitir declarar:
- fronteira isolada: fluxo normal nulo;
- temperatura prescrita: contato ideal com reservatório térmico;
- contato com substrato/camada: condutância térmica de interface;
- convecção: fluxo proporcional à diferença de temperatura e coeficiente declarado;
- radiação térmica: emissão/absorção térmica com emissividade e temperatura do entorno, quando habilitada.

Para uma interface entre duas camadas com condutância térmica de contato `G`:

```
q''int = G (T1 − T2)
q''conv = h (Ts − Tamb)
q''rad = ε σSB (Ts⁴ − Tsur⁴)
```

As expressões de convecção e radiação são aproximações de superfície; `ε` e `σSB` devem ser definidos com unidades e condições adequadas, e as temperaturas radiativas são absolutas (K). Para radiação espectral/seletiva, usar emissividade espectral e angular compatível, não um valor total genérico.

Não supor contato térmico perfeito entre filme e substrato se a resistência de interface for relevante. Não aplicar convecção ou radiação por padrão sem declarar os coeficientes/condições.

**Distinção importante:** a fonte fototérmica é uma entrada de energia; a condição de resfriamento é um caminho de saída. Desligar a iluminação elimina ou reduz a fonte óptica, mas não remove instantaneamente o calor acumulado.

## 3. Temperatura e resposta óptica

### 3.1 Constantes ópticas dependentes de temperatura

O índice de refração complexo pode ser representado por:

```
N(λ,T) = n(λ,T) + i κ(λ,T)
```

A função dielétrica complexa também depende de frequência e temperatura. A refletância calculada por Fresnel muda quando os parâmetros ópticos mudam:

```
R = R[n(λ,T), κ(λ,T), θ, pol, stack]
```

A mudança de refletância pode ser positiva ou negativa, dependendo do metal, comprimento de onda, temperatura, polarização, amostra e superfície. Não assumir que aquecer sempre aumenta ou sempre reduz o brilho. Tampouco assumir que todos os metais têm a mesma resposta térmico-óptica.

A resposta óptica pode mudar por diferentes mecanismos: alargamento por espalhamento elétron-fônon, alteração da estrutura eletrônica, expansão térmica, transições de fase, mudança de magnetização, oxidação ou alteração da superfície. A especificação inicial não deve misturar mecanismos se o conjunto de dados não os separar.

### 3.2 Coeficiente de termorrefletância

Para pequenas variações de temperatura em torno de uma condição de referência `T0`, pode-se usar:

```
CTR(λ,T0) = (1/R) (∂R/∂T)|λ,T0
ΔR/R ≈ CTR(λ,T0) ΔT
```

A aproximação linear só vale dentro de uma faixa em que `CTR` permaneça aproximadamente constante. O coeficiente tem unidade K⁻¹ e depende, no mínimo, de material/amostra, comprimento de onda, temperatura de referência, ângulo, polarização, preparação e estado da superfície. O valor e até o sinal não podem ser generalizados para todos os metais.

Para grandes excursões de temperatura, mudanças de fase, oxidação ou alterações permanentes, usar curvas `R(λ,T)` ou `n(λ,T), κ(λ,T)` medidas/modeladas na faixa, em vez de extrapolar linearmente.

O sinal de termorrefletância é frequentemente pequeno. A expressão `ΔR/R` descreve uma variação relativa; não é uma nova refletância absoluta nem deve ser somada diretamente a `R` sem uma atualização consistente.

### 3.3 Termorrefletância: bomba e prova

Em uma configuração de pump–probe:
- **bomba (pump):** feixe que deposita energia e produz uma variação de temperatura;
- **prova (probe):** feixe de leitura, normalmente de potência suficientemente baixa para que seu aquecimento seja desprezível na aproximação adotada;
- **sinal:** variação da intensidade refletida pela prova, relacionada à temperatura superficial ou à distribuição térmica ponderada pela região óptica de leitura.

A leitura é não invasiva e pode ser usada para acompanhar temperatura e, em técnicas específicas, extrair propriedades térmicas. A interpretação exige modelo de difusão térmica, geometria dos feixes, modulação, resposta do detector e propriedades das camadas/interfaces.

No SILM, essa separação é recomendada para evitar circularidade: a bomba gera calor; a prova mede a alteração óptica. O usuário pode também selecionar um modo de feixe único, no qual o próprio feixe aquece e a reflexão é recalculada, mas a interface deve informar que o sinal de leitura inclui a iluminação que também fornece energia.

## 4. Distinções que não podem ser confundidas

| Conceito | Definição | Regra para o SILM |
|---|---|---|
| Refletância óptica `R` | Fração da potência incidente que retorna como luz refletida, para banda/ângulo/polarização definidos | Resposta óptica; depende de λ e T |
| Absorptância `A` | Fração da potência incidente absorvida pela amostra/stack | É a fração que pode alimentar a fonte fototérmica |
| Transmitância `Topt` | Fração que atravessa o conjunto | Não confundir com temperatura; pode ser desprezível apenas em amostra opaca |
| Emissividade térmica | Propriedade de emissão/absorção de radiação térmica, espectral e direcional | Não igualar à refletância visível sem condições; em equilíbrio e condições apropriadas, a relação de Kirchhoff usa a mesma λ, direção e polarização |
| Condutividade térmica `k` | Relação entre fluxo térmico e gradiente de temperatura | Não é a capacidade térmica nem a velocidade visual da difusão |
| Difusividade `αth=k/(ρcp)` | Mede a escala de difusão temporal da temperatura | Não confundir com coeficiente óptico de absorção `αopt` |
| Coeficiente `CTR` | Derivada relativa da refletância em relação à temperatura | Sensibilidade óptica à temperatura; não é `k`, `cp` ou absorptividade |

**Atenção às letras:** a literatura usa frequentemente `α` para difusividade térmica e para coeficiente óptico de absorção. No código SILM, nomear explicitamente como `thermalDiffusivity` e `opticalAbsorptionCoefficient`.

## 5. Condições mínimas da experiência

### 5.1 Grupo óptico — iluminação que pode aquecer

| Campo | Requisito |
|---|---|
| Fonte | contínua, pulsada ou modulada |
| Espectro | comprimento de onda ou distribuição espectral de potência |
| Potência | potência óptica incidente e área/raio do feixe |
| Geometria | incidência, orientação, área iluminada e perfil espacial |
| Polarização | s, p ou não polarizada, quando aplicável |
| Amostra | metal maciço, filme, multicamada e substrato |
| Energia | R, A e Topt compatíveis com o material/stack e a banda |
| Penetração | perfil de absorção ou hipótese validada de absorção superficial |

A irradiância é potência por área, W/m². Se a fonte for pulsada/modulada, registrar forma temporal, largura, repetição e ciclo de trabalho; não converter potência de pico em potência média sem esse dado.

### 5.2 Grupo térmico — resposta da amostra

| Campo | Requisito |
|---|---|
| Temperatura inicial | valor e unidade K (ou conversão explícita de °C) |
| Capacidade térmica | cp(T) e densidade ρ, ou parâmetro concentrado validado |
| Transporte | k(T), tensor se anisotrópico |
| Geometria | espessura, dimensões e resolução térmica |
| Interfaces | substrato, camadas e condutância térmica de contato |
| Fronteiras | isolada, temperatura prescrita, convecção e/ou radiação |
| Fontes adicionais | desligadas por padrão; cada fonte precisa de identificação própria |
| Mudança de fase | só quando houver entalpia/calor latente e critérios homologados |

### 5.3 Grupo de leitura óptica

| Campo | Requisito |
|---|---|
| Modo | feixe único ou pump–probe |
| Probe | comprimento de onda, potência, incidência e polarização |
| Resposta | R(λ,T) ou CTR(λ,T0) |
| Área de leitura | spot, perfil e região de integração |
| Sinal | R absoluta, ΔR, ΔR/R ou fase/amplitude demodulada |
| Calibração | T0, intervalo calibrado, linearidade e incerteza |

O modo pump–probe deve permitir que a prova tenha potência desprezível no orçamento térmico ou incluir sua absorção no balanço quando isso não for verdadeiro.

## 6. Dados necessários por metal e por amostra

### 6.1 Dados ópticos e de absorção

- série espectral `n(λ,T)` e `κ(λ,T)`, ou `R(λ,T)` e, quando necessário, `A(λ,T)` e `Topt(λ,T)`;
- temperatura de cada série, faixa medida e incerteza;
- fase, composição/pureza, orientação e condição superficial;
- tipo de amostra (bulk, filme, multicamada), espessura, substrato, óxido/passivação e rugosidade;
- ângulo, polarização e convenção experimental;
- distribuição espacial da absorção ou dados suficientes para calculá-la;
- fonte, método (por exemplo, elipsometria espectroscópica), referência original e proveniência.

Uma curva obtida para filme de ouro sobre substrato não deve ser aplicada ao ouro maciço sem considerar o modelo óptico das camadas. Uma curva em 1,03 μm não autoriza interpolação para todo o visível.

### 6.2 Dados de termorrefletância

Cada valor de `CTR` precisa conter:
- metal e identificação da amostra;
- λ, ângulo e polarização;
- temperatura de referência e intervalo de calibração;
- valor com sinal, unidade K⁻¹ e incerteza;
- acabamento, espessura, passivação/óxido, substrato e deposição;
- método de aquecimento e calibração térmica;
- fonte original.

Se somente `|CTR|` for publicado e o sinal não estiver disponível, não usar como coeficiente assinado para atualizar `R`. Pode ser mostrado como magnitude de sensibilidade, com limitação clara.

### 6.3 Dados térmicos

- condutividade térmica k(T), cp(T), densidade ρ e expansão, se a geometria variar;
- condutância térmica de interface/substrato;
- espessura e área efetiva;
- condições ambientais e de contato;
- domínio de temperatura e fase válida;
- incerteza, método e fonte.

Dados de amostras maciças não substituem automaticamente dados de filmes finos. Condutância térmica de interface e espalhamento de fônons podem dominar a resposta em escalas pequenas.

### 6.4 Níveis de evidência

| Nível | Evidência | Uso permitido |
|---|---|---|
| A — medida rastreável | Medida de absorção/reflectância ou CTR da amostra/condição, faixa e incerteza documentadas | Quantitativo no domínio medido |
| B — compilação avaliada | Dados com publicação original e condições rastreáveis | Quantitativo após revisão |
| C — modelo ajustado | Modelo térmico-óptico ajustado a dados com faixa e incerteza | Quantitativo dentro do domínio validado |
| D — cálculo teórico | Protocolo óptico/térmico reproduzível | Comparação teórica identificada |
| E — qualitativo | Demonstração de energia e resposta com parâmetros adimensionais | Didático; não comparar metais |
| F — ausente | Sem dados suficientes | Bloquear cálculo quantitativo |

A cobertura deve ser registrada por **metal × fase × λ × temperatura × tipo de amostra/superfície**. Um valor isolado de CTR não constitui uma curva completa de termorrefletância.

## 7. Modelo de acoplamento e avanço temporal

### 7.1 Fluxo computacional recomendado

1. Ler estado da amostra, propriedades e condições de contorno.
2. Calcular propagação óptica, `R`, `A`, `Topt` e distribuição espacial de absorção para `T` atual.
3. Converter absorção em `q'''opt` ou fluxo térmico de fronteira conforme a resolução física.
4. Avançar equação térmica e obter `T(x,t+Δt)`.
5. Atualizar `n(λ,T)`, `κ(λ,T)`, `R(λ,T)` ou usar `CTR` no domínio linear.
6. Atualizar a emissão/reflexão de leitura e a apresentação de temperatura.
7. Se a alteração térmica for grande o suficiente para alterar absorção, repetir o acoplamento iterativamente até convergência ou avançar com passo temporal estável.

O motor deve manter separados os campos ópticos e térmicos. A temperatura é um campo calculado; a iluminação é uma entrada. A refletância e a absorção são respostas e podem ser recalculadas quando a temperatura muda.

### 7.2 Acoplamento fraco e forte

- **Acoplamento fraco:** a absorção é calculada com os parâmetros ópticos em T0; a fonte térmica é aplicada; a mudança de refletância é calculada ao final pelo CTR ou R(T). É adequado quando a variação térmica é pequena e a alteração da absorção não realimenta significativamente o aquecimento.
- **Acoplamento iterativo/forte:** recalcular absorção com n(λ,T), κ(λ,T), interfaces e campo óptico à medida que T evolui. Necessário quando a mudança óptica altera materialmente a fonte térmica, há filme/multicamadas, interferência, gradientes grandes ou não linearidade.

A primeira implementação deve começar pelo acoplamento fraco apenas com critérios de validade explícitos. O modo forte fica para a fase posterior.

### 7.3 Passo temporal e estabilidade

O passo de tempo deve respeitar a estabilidade do método de integração térmica e a menor escala temporal relevante. Não usar a taxa de quadros da animação como se fosse o passo físico do material. Se o motor for explícito, a condição de estabilidade depende da malha, difusividade e dimensionalidade; se for implícito, a solução ainda precisa de convergência e controle de erro.

A simulação deve permitir pausa, reinício e desligar a bomba. Após desligar a bomba, a temperatura retorna ao equilíbrio definido pelas condições de contorno; não pode permanecer acima do ambiente indefinidamente se houver caminhos de dissipação ativos.

Para excitação periódica com frequência angular `Ω`, a escala de penetração térmica aproximada em meio homogêneo é `μth = √(2 ath/Ω)`, com `ath = k/(ρ cp)`. Ela ajuda a escolher espessura, frequência e domínio térmico, mas não substitui a solução para uma geometria multicamada.

## 8. Auditoria do SILM atual

### 8.1 Térmica

O motor térmico atual é uma propagação discreta e qualitativa entre vizinhos da rede exibida. O catálogo em `domain/silm/properties.js` informa que o coeficiente é didático, comum a todos os metais, sem calor específico tabelado, sem escala de tempo física e sem comparação de condutividade entre metais. O controlador `domain/silm/thermal.js` propaga valores normalizados entre vizinhos da estrutura exibida. A experiência não resolve a equação térmica contínua com geometria macroscópica, profundidade de absorção, interface ou condições completas de troca térmica.

O motor térmico não pode receber uma energia luminosa como potência física sem antes adicionar escala, capacidade térmica, dissipação e balanço dimensional. Um valor normalizado atual não é joule nem kelvin.

### 8.2 Óptica

A experiência de brilho usa a lanterna geométrica e o controlador angular de `domain/silm/drive.js`, além da narrativa em `domain/silm/properties.js`, para demonstrar a lei de reflexão especular. Não consulta dados espectrais de absorptância, refletância, transmitância, n(λ,T), κ(λ,T) ou CTR. A intensidade de iluminação atual não está calibrada em W/m².

Portanto, o brilho visual atual não pode gerar aquecimento fototérmico quantitativo nem revelar a mudança de refletância do metal com a temperatura.

### 8.3 Conclusão da auditoria

No estado atual:
- não há balanço de potência luminosa;
- não há fonte térmica derivada da absorção;
- não há propriedades térmicas com unidade/condição para resolver aquecimento fototérmico;
- não há função de resposta óptica com temperatura nem CTR;
- não há amostra macroscópica com profundidade de absorção e stack óptico/térmico;
- os dois fenômenos isolados são didáticos e não constituem acoplamento T+O.

**Decisão operacional:** manter T+O bloqueada como acoplamento físico quantitativo até que os dados e motores necessários sejam homologados. Uma demonstração esquemática pode ser prototipada, desde que mostre explicitamente que a energia e o coeficiente são didáticos e não compara metais.

## 9. Contrato de estado conceitual

O estado deve manter estímulos, dados materiais, resultados e proveniência separados:

```ts
type EvidenceLevel =
  | "measured" | "assessed" | "fitted"
  | "calculated" | "qualitative" | "missing";

interface ThermoOpticalMaterialData {
  sample: {
    atomicNumber: number;
    phase: string;
    composition?: string;
    sampleType: "bulk" | "film" | "multilayer";
    thicknessM?: number;
    substrateId?: string;
    surfaceCondition?: string;
  };
  optical: {
    wavelengthNm: number[];
    temperatureK: number[];
    n?: number[][];
    k?: number[][];
    reflectance?: number[][];
    absorptance?: number[][];
    transmittance?: number[][];
    evidence: EvidenceLevel;
    sourceIds: string[];
    conditions: Record<string, unknown>;
  };
  thermoreflectance?: {
    wavelengthNm: number;
    referenceTemperatureK: number;
    coefficientPerK: number;
    calibratedRangeK: [number, number];
    uncertainty?: number;
    evidence: EvidenceLevel;
    sourceIds: string[];
  };
  thermal: {
    densityKgM3?: number;
    heatCapacityJKgK?: number;
    conductivityWmK?: number;
    interfaceConductanceWm2K?: number;
    evidence: EvidenceLevel;
    sourceIds: string[];
    conditions: Record<string, unknown>;
  };
}

interface ThermoOpticalExperiment {
  illumination: {
    mode: "continuous" | "pulsed" | "modulated";
    wavelengthNm: number;
    incidentPowerW: number;
    beamAreaM2: number;
    incidenceAngleDeg: number;
    polarization: "s" | "p" | "unpolarized";
    role: "single-beam" | "pump";
  };
  probe?: {
    wavelengthNm: number;
    powerW: number;
    incidenceAngleDeg: number;
    polarization: "s" | "p" | "unpolarized";
    role: "probe";
  };
  thermal: {
    initialTemperatureK: number;
    boundary: "insulated" | "fixed-temperature" | "substrate" |
      "convection" | "radiation" | "combined";
    ambientTemperatureK?: number;
    heatTransferCoefficientWm2K?: number;
    emissivity?: number;
    timestepS: number;
  };
  coupling: {
    mode: "weak" | "iterative";
    opticalAbsorptionModel: "single-pass" | "transfer-matrix" | "measured";
    thermoreflectanceModel: "CTR-linear" | "R-lambda-T" | "n-k-lambda-T";
    evidence: EvidenceLevel;
  };
  results: {
    absorbedPowerW?: number;
    temperatureFieldK?: number[];
    reflectance?: number;
    deltaReflectance?: number;
    relativeDeltaReflectance?: number;
    heatOutW?: number;
    energyResidualJ?: number;
  };
}
```

Este contrato é conceitual, não um esquema pronto. Os arrays devem ter dimensões, ordenação e unidades validadas. A interpolação só pode ocorrer dentro das faixas registradas, com método e incerteza. Não usar valores padrão para n, κ, CTR, k, cp ou emissividade.

## 10. Painel único da experiência

T+O deve manter um painel integrado, com grupos que aparecem conforme o modo selecionado.

**Grupo óptico — fonte**
- tipo de iluminação (contínua/pulsada/modulada);
- λ ou espectro;
- potência e área/spot;
- incidência e polarização;
- modo de amostra/stack;
- modo de leitura (feixe único ou pump–probe).

**Grupo térmico — amostra**
- temperatura inicial;
- geometria/espessura;
- propriedades térmicas disponíveis;
- substrato/interface;
- fronteiras e dissipação;
- duração e passo de integração.

**Grupo de resposta óptica**
- n(λ,T)/κ(λ,T), R(λ,T) ou CTR;
- λ da prova;
- R inicial, R atual e ΔR/R;
- intervalo de validade e incerteza.

**Resultados**
- potência incidente, refletida, transmitida e absorvida;
- fonte térmica espacial ou fluxo de superfície;
- temperatura máxima/média e mapa temporal;
- potência de saída por cada fronteira ativa;
- curva/variação de refletância;
- energia residual do balanço.

Não exibir todos esses campos sempre. Ocultar parâmetros não aplicáveis, mas nunca ocultar uma condição obrigatória que esteja ausente. Não abrir menus contextuais individuais por propriedade.

## 11. Critérios de aceite

### 11.1 Balanço óptico
- [ ] Para amostra passiva, `R+A+Topt=1` dentro da tolerância.
- [ ] Para amostra opaca, `Topt≈0` só quando a condição estiver justificada.
- [ ] `Pabs=A·Pinc` respeita unidade e geometria.
- [ ] Perfil `q'''opt` integra para a potência absorvida, sem duplicação: `∫volume q'''opt dV = Pabs`.
- [ ] Para espectro de banda larga, R, A e Topt são ponderadas pela distribuição espectral e espacial da fonte.
- [ ] Para filmes/multicamadas, interferência e absorção por camada são consideradas quando relevantes.
- [ ] Alterar λ, polarização, ângulo, temperatura ou stack atualiza a absorção de acordo com os dados/modelo.

### 11.2 Balanço térmico
- [ ] Sem iluminação e sem outra fonte, não há geração fototérmica.
- [ ] Com `A=0`, a fonte fototérmica é zero.
- [ ] Desligar a bomba interrompe a entrada óptica, mas não zera instantaneamente a temperatura.
- [ ] Com fronteiras dissipativas, a amostra retorna ao equilíbrio definido.
- [ ] Fluxos de interface, convecção e radiação têm sinais, unidades e temperaturas consistentes.
- [ ] Com fronteira isolada, energia acumulada é conservada após a fonte desligada (salvo outros termos explicitados).
- [ ] A fonte integra para a energia absorvida.
- [ ] Energia residual `Ein−Eout−ΔU` fica dentro da tolerância numérica.
- [ ] O resultado não depende arbitrariamente da taxa de quadros.

### 11.3 Resposta termorrefletiva
- [ ] Para ΔT pequeno e CTR válido, `ΔR/R≈CTR·ΔT`.
- [ ] O sinal de CTR é preservado; não presumir aumento de R.
- [ ] Alterar λ ou temperatura usa o coeficiente/série correspondente.
- [ ] Fora da faixa calibrada, o modo quantitativo é bloqueado ou explicitamente marcado como extrapolação não validada.
- [ ] Para grandes variações, o modelo troca CTR linear por R(λ,T) ou n,k(λ,T).
- [ ] Probe não aquece significativamente, ou sua contribuição é incluída no balanço.

### 11.4 Dados e interface
- [ ] Medida, ajuste, cálculo e modo qualitativo são rotulados.
- [ ] Material, fase, temperatura, espessura, superfície, substrato e fonte ficam associados ao dado.
- [ ] Uma série de filme não é aplicada automaticamente ao metal maciço.
- [ ] A ausência de dado não é preenchida com valor típico.
- [ ] Seleção, aplicação, pausa, desligamento e reinício não deixam energia/resposta residual indevida.
- [ ] A interface distingue temperatura, potência, energia, refletância, absorptância e transmitância.

## 12. Fases de implementação

**Fase A — contrato de energia**
- Definir amostra, stack, iluminação e condições de contorno.
- Implementar balanço `R+A+Topt=1` com dados medidos ou parâmetros do piloto.
- Manter o aquecimento desabilitado no SILM produtivo enquanto não houver escala material.

**Fase B — fonte fototérmica e condução**
- Começar com um sólido macroscópico homogêneo e uma geometria simples.
- Calcular fonte de absorção a partir de um perfil validado.
- Resolver calor com densidade, cp, k e fronteiras explícitas.
- Verificar energia e convergência temporal.

**Fase C — leitura de termorrefletância**
- Implementar modo pump–probe.
- Calibrar CTR(λ,T0) ou curvas R(λ,T).
- Validar com medidas publicadas e amostras de referência.
- Exibir ΔR/R junto da temperatura sem tratar a variação relativa como refletância absoluta.

**Fase D — realimentação térmico-óptica**
- Atualizar n, κ, R e A em função de T.
- Resolver iterativamente quando a absorção mudar de maneira relevante.
- Suportar filmes, substratos e interfaces térmicas.
- Incorporar incerteza e análise de sensibilidade.

**Fase E — regimes avançados**
- Pulsos curtos, não equilíbrio elétron–rede, escalas ultrarrápidas e modelos de duas temperaturas quando exigidos.
- Mudança de fase, oxidação, transformação de superfície, tensão termomecânica e retroalimentação com outros campos.
- Comparação entre metais somente com dados equivalentes e rastreáveis.

## 13. Decisões que devem ser congeladas antes da implementação

1. Luz absorvida é fonte térmica; luz refletida e transmitida não são calor depositado na amostra.
2. A fonte térmica deve ser espacialmente consistente com a absorção óptica.
3. O primeiro piloto deve usar amostra macroscópica simples e condições explícitas, sem tomar a rede atômica como malha térmica real.
4. O primeiro acoplamento deve ser fraco e de pequenas variações, apenas dentro do intervalo válido.
5. CTR é específico de λ, T, superfície, amostra e geometria; seu sinal deve ser preservado.
6. Aumento de temperatura não implica aumento universal de brilho.
7. Pump–probe é preferido para separar aquecimento de leitura; a potência do probe entra no balanço se não for desprezível.
8. Desligar a fonte não resfria instantaneamente; as condições térmicas determinam a regressão.
9. T+O permanece bloqueada como interação quantitativa até homologar dados e validar balanços óptico e térmico.

## 14. Referências

1. Favaloro, T.; Bahk, J.-H.; Shakouri, A. “Characterization of the temperature dependence of the thermoreflectance coefficient for conductive thin films”. *Review of Scientific Instruments*, 86, 024903 (2015). [DOI: 10.1063/1.4907354](https://doi.org/10.1063/1.4907354). Mede coeficientes em ouro, platina e alumínio e demonstra dependência com temperatura, comprimento de onda e passivação.
2. Wilson, R. B.; Apgar, B. A.; Martin, L. W.; Cahill, D. G. “Thermoreflectance of metal transducers for optical pump-probe studies of thermal properties”. *Optics Express*, 20(27), 28829–28838 (2012). [DOI: 10.1364/OE.20.028829](https://doi.org/10.1364/OE.20.028829). Medições de dR/dT em quinze elementos a 1,03 μm e séries espectrais de filmes.
3. Zollner, S.; Abadizaman, F.; Emminger, C.; Samarasingha, N. “Spectroscopic ellipsometry from 10 to 700 K”. *Advanced Optical Technologies*, 11(3–4), 117–135 (2022). [DOI: 10.1515/aot-2022-0016](https://doi.org/10.1515/aot-2022-0016). Revisão da determinação de constantes ópticas em função da temperatura e da faixa espectral.
4. Mohan, R.; Khan, S.; Wilson, R. B. et al. “Time-domain thermoreflectance”. *Nature Reviews Methods Primers*, 5, 55 (2025). [DOI: 10.1038/s43586-025-00425-8](https://doi.org/10.1038/s43586-025-00425-8). Fundamentos ópticos e térmicos de TDTR e aplicações em filmes, interfaces e materiais maciços.
5. Kirsch, D.; Martin, J. B.; Warzoha, R.; McLean, M.; Windover, D.; Takeuchi, I. “An Instrumentation Guide to Measuring Thermal Conductivity Using Frequency Domain Thermoreflectance (FDTR)”. *Review of Scientific Instruments*, 95, 103006 (2024). [DOI: 10.1063/5.0213738](https://doi.org/10.1063/5.0213738). Modelos térmicos difusivos multicamadas, ajuste de fase e incerteza.
6. Guo, X.; Yang, H.; Yao, Y. et al. “Light propagation and heat conduction across multilayered structures in pump-probe thermoreflectance”. *Materials Today Physics* (2026). [DOI: 10.1016/j.mtphys.2026.102018](https://doi.org/10.1016/j.mtphys.2026.102018). Acopla propagação/absorção óptica, fonte térmica, condução e termorrefletância em multicamadas; mostra os limites de simplificações como fonte exclusivamente superficial.
7. Braun, J. L.; Szwejkowski, C.; Giri, A.; Hopkins, P. E. “On the Steady-State Temperature Rise During Laser Heating of Multilayer Thin Films in Optical Pump–Probe Techniques”. *Journal of Heat Transfer*, 140(5) (2018). [DOI: 10.1115/1.4038713](https://doi.org/10.1115/1.4038713). Aquecimento estacionário e transiente em filmes multicamadas e influência da profundidade óptica de penetração.
8. National Institute of Standards and Technology (NIST). “An Instrumentation Guide to Measuring Thermal Conductivity Using Frequency Domain Thermoreflectance (FDTR)”. [Publicação NIST](https://www.nist.gov/publications/instrumentation-guide-measuring-thermal-conductivity-using-frequency-domain). Procedimentos instrumentais, modelo difusivo multicamadas e análise de incerteza.

---

**Resultado do estudo:** T+O é um acoplamento bidirecional entre absorção óptica, geração/difusão de calor e mudança térmica da resposta óptica. Não é simplesmente “luz que aquece” nem “calor que muda a cor”: é necessário fechar o balanço de energia, conhecer a absorção e usar uma resposta óptica dependente da temperatura. Até a homologação desses dados e motores, T+O permanece bloqueada como simulação quantitativa.
