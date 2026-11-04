# SILM — Especificação do acoplamento eletro-termo-óptico (E+T+O)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Famílias:** elétrica (E) + térmica (T) + óptica (O)  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETROTERMICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETRO-OPTICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-TERMO-OPTICO.md`

---

## 1. Objetivo e decisão central

Unificar, em uma mesma amostra e no mesmo avanço temporal, três fenômenos:

1. **E — transporte elétrico DC/quase-estático:** uma tensão ou corrente prescrita conduz carga e dissipa energia por efeito Joule;
2. **O — interação óptica:** uma fonte luminosa incide na amostra; parte da energia é refletida, parte transmitida e parte absorvida;
3. **T — transporte térmico:** as duas fontes de dissipação aquecem a amostra; a energia é conduzida e removida pelas fronteiras térmicas.

A temperatura retroage sobre os outros dois domínios:
- altera a condutividade/resistividade elétrica DC, mudando corrente, tensão e potência Joule;
- altera n(λ,T), κ(λ,T), ε̃(ω,T), R(λ,T) e A(λ,T), quando esses dados/modelos estiverem disponíveis.

O ciclo completo é:

**condição elétrica + iluminação → perdas elétricas Joule + absorção óptica → temperatura → atualização elétrica e óptica → novas fontes de calor.**

**Decisão central:** E+T+O só existe como acoplamento quando todas as relações de causa e efeito são calculadas, as fontes são contabilizadas separadamente e o balanço global de energia fecha. Não basta ligar três ícones ou sobrepor três animações.

A primeira versão deve ser tratada como um modelo multifísico de **corrente contínua + luz de frequência óptica + transferência de calor**. O campo elétrico DC e o campo eletromagnético da luz pertencem a regimes de frequência muito diferentes e não devem ser representados como o mesmo estímulo.

## 2. Fronteiras do modelo e regimes incluídos

### 2.1 Incluído no primeiro contrato

- Condução elétrica DC ou quase-estática, em regime ôhmico local.
- Controle ideal por tensão OU corrente, com a outra grandeza calculada.
- Geração de calor Joule a partir de J·E no domínio elétrico DC.
- Fonte óptica contínua, pulsada ou modulada, com espectro e irradiância declarados.
- Reflexão, absorção e transmissão calculadas por dados/modelo óptico espectral.
- Fonte térmica espacial derivada da energia óptica absorvida.
- Condução térmica transitória com ρ, cp, k e condições de contorno declaradas.
- Atualização de σDC(T) e da resposta óptica dependente de T.
- Modo de leitura termorrefletiva por feixe de prova, quando disponível.
- Saída didática adimensional quando os dados materiais/geometria não autorizarem unidades SI.

### 2.2 Fora do primeiro contrato

- Corrente alternada, RF e interação eletromagnética de baixa frequência resolvida no domínio de ondas.
- Campo DC modulando diretamente a refletância (eletro-refletância), efeitos Stark, não linearidade óptica ou mudança de ocupação eletrônica por viés, sem dados específicos.
- Eletroplasticidade, eletromigração, mudança microestrutural induzida pela corrente e efeitos magneto-ópticos.
- Seebeck, Peltier e Thomson; esses efeitos exigem coeficientes termoelétricos, junções/gradientes e equações próprias.
- Mudança de fase, fusão, ablação, evaporação ou reações químicas/oxidação.
- Modelo de tensão mecânica, expansão impedida e alteração óptica por deformação; isso exige acoplamento mecânico adicional.
- Não equilíbrio ultrarrápido elétron–rede, salvo no módulo avançado de duas temperaturas.
- Comparação quantitativa entre metais sem dados equivalentes e homologados.

As extensões não devem ser apresentadas como se fossem consequência automática de E+T+O.

## 3. Três domínios físicos, três escalas de frequência

### 3.1 Elétrica DC — transporte de carga

Para condução quase-estática em um material ôhmico:

~~~
∇ · JDC = 0
EDC = −∇V
JDC = σDC(T) EDC
∇ · [σDC(T) ∇V] = 0
~~~

- `V`: potencial elétrico DC (V);
- `EDC`: campo elétrico DC (V/m);
- `JDC`: densidade de corrente DC (A/m²);
- `σDC(T)`: condutividade elétrica de baixa frequência (S/m);
- `ρe(T)=1/σDC(T)`: resistividade elétrica (Ω·m).

O sistema precisa de terminais, geometria, contatos e um caminho de retorno. Para a mesma amostra, a distribuição de corrente e a geração Joule devem ser resolvidas novamente quando σDC mudar com T.

### 3.2 Óptica — resposta à onda incidente

A luz é descrita por uma frequência óptica `ω=2πc/λ`, um campo oscilante, direção de propagação e polarização. A resposta linear do metal é complexa e dispersiva:

~~~
N(λ,T) = n(λ,T) + i κ(λ,T)
ε̃(ω,T) = ε1(ω,T) + i ε2(ω,T)
σ̃opt(ω,T) = σ1(ω,T) + i σ2(ω,T)
~~~

A condutividade DC não substitui a condutividade óptica complexa. Os dados n, κ, ε̃ ou σ̃opt devem corresponder ao material, fase, faixa espectral e temperatura em uso.

Para uma amostra passiva, a energia óptica incidente distribui-se entre reflexão, absorção e transmissão:

~~~
Pinc = Pref + Pabs + Ptrans
R(λ,T) + A(λ,T) + Topt(λ,T) = 1
~~~

A igualdade de frações requer a mesma definição de fluxo de potência, área, banda, ângulo e polarização. Em filme ou multicamada, as interfaces, espessuras, substrato e interferência podem ser importantes.

### 3.3 Térmica — transporte e armazenamento de energia

Na aproximação de temperatura única, em meio contínuo sem mudança de fase:

~~~
ρm cp(T) ∂T/∂t =
  ∇ · [k(T) ∇T] + q'''J + q'''opt + q'''ext
~~~

- `ρm`: densidade de massa (kg/m³);
- `cp`: calor específico (J/(kg·K));
- `k`: condutividade térmica (W/(m·K));
- `q'''J`: fonte volumétrica por Joule DC (W/m³);
- `q'''opt`: fonte volumétrica por absorção óptica (W/m³);
- `q'''ext`: fonte térmica adicional explicitamente prescrita (W/m³), zero por padrão.

A mesma variável T é usada para alimentar σDC(T) e a resposta óptica dependente de T, desde que a aproximação de equilíbrio térmico local e de temperatura única seja válida.

## 4. Fontes térmicas: Joule e absorção óptica não são intercambiáveis

### 4.1 Joule no domínio DC

A potência dissipada por unidade de volume é:

~~~
q'''J = JDC · EDC = ρe(T)|JDC|² = |JDC|²/σDC(T)
~~~

A unidade é W/m³. A potência Joule total no volume é:

~~~
PJ,bulk = ∫volume q'''J dV
~~~

Para uma fonte DC ideal, não inserir fator 1/2 de fasores AC em valores DC. Perdas de contato podem ser incluídas somente se forem calculadas e distribuídas aos volumes/regiões em que realmente se dissipam. Não misturar calor de contato externo com a fonte Joule do volume da amostra.

Sob tensão ideal constante, uma resistência crescente tende a reduzir P=V²/R; sob corrente ideal constante, tende a elevar P=I²R. Essa tendência só vale para uma relação ôhmica e uma resposta R(T) correspondente. Não presumir um coeficiente térmico positivo igual para todos os metais.

### 4.2 Absorção óptica

A potência absorvida deve ser obtida do espectro e da geometria da fonte:

~~~
Pabs(t) = ∫área ∫λ A(λ,T,θ,pol,stack) Iinc(λ,x,y,t) dλ dA
~~~

A distribuição espacial deve ser convertida numa fonte volumétrica ou de superfície que respeite:

~~~
∫volume q'''opt dV + ∫superfície q''opt dA = Pabs
~~~

Para meio homogêneo com absorção de passagem única, sem interferência, uma aproximação é:

~~~
I(z) = I(0) exp(−αopt z)
q'''opt(z) = αopt I(z)
αopt = 4πκ/λ
δopt = 1/αopt
~~~

Essa forma não substitui o cálculo de campo em filmes finos, multicamadas, cavidades ou regiões com interferência/espalhamento relevante. Nesses casos, calcular dissipação local pelo campo eletromagnético e pelas propriedades complexas de cada domínio.

A potência refletida e transmitida não é calor depositado naquela amostra. Se o conjunto for opaco, Topt≈0 só pode ser adotado dentro da faixa espectral e espessura justificadas.

### 4.3 Duas formulações possíveis para qopt — escolher uma por domínio

**Formulação A — balanço medido/espectral:** usar A(λ,T) e uma distribuição de deposição validada para construir q'''opt. Adequada a um modelo reduzido ou quando a absorção foi medida.

**Formulação B — campo eletromagnético:** resolver o campo óptico e calcular a dissipação local. Para fasores de pico e convenção temporal e^{−iωt}, uma forma de perda média é:

~~~
q'''opt = (1/2) Re[Jopt · Eopt*]
~~~

Para condutividade óptica explícita:

~~~
q'''opt = (1/2) Re[σ̃opt(ω,T)] |Eopt|²
~~~

Quando a perda estiver incorporada à parte imaginária da função dielétrica, usar a expressão dielétrica equivalente consistente com a convenção escolhida. Não somar simultaneamente a perda de σ̃opt e a mesma perda de ε̃''; isso contaria duas vezes a dissipação óptica.

**Regra absoluta de não duplicação:** uma região não pode receber ao mesmo tempo q'''opt calculado a partir da absorptância total e q'''opt calculado pela dissipação local do campo que já representa essa mesma absorção. A fonte óptica precisa ter uma única representação contabilizada no balanço.

### 4.4 Separação entre frequências

- `q'''J` vem do campo/corrente de baixa frequência do circuito DC;
- `q'''opt` vem da onda óptica absorvida, com parâmetros em `ωopt`;
- os valores DC e ópticos são calculados em seus próprios domínios de frequência;
- o calor total é a soma das duas dissipações físicas, desde que ambas sejam fontes independentes e que cada perda tenha sido incluída uma só vez.

Não usar o campo EDC como campo da luz. Não substituir σ̃opt(ω) por σDC.

## 5. Conservação global de energia

### 5.1 Balanço elétrico

Em regime DC quase-estático, sem energia armazenada relevante no circuito interno da amostra:

~~~
Pel,term = Vterm Iterm
~~~

A potência que entra pelos terminais deve ser explicada pelas perdas Joule na amostra e nos contatos incluídos no domínio. Se houver resistência de contato, circuito externo ou região excluída, identificar onde essa energia é dissipada.

### 5.2 Balanço óptico

Para cada banda, ângulo e polarização:

~~~
Pinc,opt = Pref,opt + Ptrans,opt + Pabs,opt
~~~

O termo absorvido deve corresponder à integral de q'''opt e/ou do fluxo superficial, sem duplicação.

### 5.3 Balanço térmico

Para a amostra e interfaces abrangidas pelo modelo:

~~~
ΔU = ∫dt [PJ,amostra + Pabs,opt + Pext] − ∫dt Pout,thermal
~~~

`ΔU` é a variação de energia interna; `Pout,thermal` inclui apenas as saídas térmicas realmente modeladas (fluxo para fronteira fixa, substrato, convecção, radiação etc.). O balanço deve respeitar a região de controle: energia dissipada fora da amostra não pode aparecer como calor recebido por ela.

Em cada passo, calcular um residual:

~~~
εE = Ein − Eout − ΔU
~~~

A tolerância deve ser definida a partir do método, malha, passo temporal, convergência e incerteza dos dados. Não escolher uma tolerância que esconda perdas sistemáticas ou duplicação das fontes.

**Caso isolado:** se a amostra não tem saída térmica e as fontes permanecem positivas, a energia e a temperatura média continuam aumentando. Não existe estado estacionário térmico finito sem remoção de calor ou sem cessar as fontes.

## 6. Retroalimentação entre os três domínios

| Caminho | Dependência | Efeito calculado |
|---|---|---|
| E → T | JDC e EDC | q'''J gera calor |
| O → T | campo óptico, absorção e geometria | q'''opt gera calor |
| T → E | σDC(T) ou ρe(T) | altera corrente, potencial, resistência e q'''J |
| T → O | n(λ,T), κ(λ,T), ε̃(ω,T), R/A/Topt ou CTR | altera propagação, reflexão, absorção e q'''opt |
| O → O | campo óptico e interfaces | distribuição de campo e absorção se ajustam à pilha/estrutura |
| E → E | tensão/corrente prescrita e σDC(T) | resolve o novo estado elétrico em cada passo |

O acoplamento é potencialmente auto-reforçado:
- a corrente gera calor Joule;
- o aquecimento altera a resistência;
- a nova resistência muda a geração Joule de modo diferente sob controle de tensão ou corrente;
- a luz absorvida também aquece;
- a temperatura altera a absorção, refletância e o sinal de prova;
- a alteração da absorção pode aumentar ou reduzir a fonte óptica seguinte.

Não pressupor que a realimentação seja sempre positiva ou sempre negativa. A estabilidade depende das funções materiais, do tipo de fonte, da geometria e da dissipação térmica.

### 6.1 Regimes de acoplamento

**Fraco/sequencial:** calcular E e O na temperatura atual; obter q'''J e q'''opt; avançar T; atualizar propriedades no passo seguinte. Usar quando a variação durante o passo for pequena e a dependência das fontes com T for fraca.

**Iterativo/forte:** iterar E, O e T dentro do mesmo passo até convergência. Usar quando σDC(T), A(T) ou o campo óptico mudarem significativamente durante o passo, ou quando houver gradientes fortes e camadas.

**Critério de troca:** monitorar a alteração relativa de σDC, R, A, q'''J e q'''opt em cada iteração. Reduzir Δt ou usar método mais robusto quando o erro/correção exceder limites documentados. Não usar a taxa de quadros como passo físico.

## 7. Resposta elétrica e óptica dependente da temperatura

### 7.1 Elétrica

Exigir σDC(T) ou ρe(T) com:
- faixa de temperatura;
- fase, pureza/composição e condição metalúrgica;
- orientação, se anisotropia for relevante;
- método, fonte e incerteza.

Uma linearização local pode ser usada apenas na faixa validada. Não extrapolar uma curva de resistividade para fusão, transformação de fase ou temperatura fora da medição.

### 7.2 Óptica

Exigir uma das formas:
- n(λ,T) e κ(λ,T);
- ε1(ω,T) e ε2(ω,T);
- σ1,opt(ω,T) e σ2,opt(ω,T);
- R(λ,T), A(λ,T) e Topt(λ,T) medidos na mesma geometria;
- CTR(λ,T0) com sinal, incerteza e faixa linear explícita, para pequenas variações.

A resposta de temperatura pode ser positiva ou negativa para R. Não converter uma mudança de refletância em mudança de cor sem espectro, iluminante, função de observador e integração colorimétrica declarados. Um coeficiente CTR de uma amostra/filme não é automaticamente válido para o metal maciço.

### 7.3 Mesma amostra, fase e condições

A resposta DC e a resposta óptica precisam pertencer à mesma fase/material e a condições compatíveis de temperatura, composição e estado superficial. Uma curva elétrica de metal maciço não deve ser acoplada silenciosamente a constantes ópticas de um filme com substrato e óxido diferentes.

Quando as fontes vierem de amostras distintas, a interface deve marcar o acoplamento como comparativo/parametrizado, não como simulação de uma única amostra medida.

## 8. Tempo e não equilíbrio elétron–rede

A formulação de temperatura única é adequada somente quando elétrons e rede cristalina podem ser representados por uma temperatura comum na escala temporal estudada.

Para pulsos ópticos ultracurtos, a energia pode ser depositada primeiro nos elétrons e transferida à rede por acoplamento elétron–fônon. Nesse regime, um modelo de duas temperaturas pode ser necessário:

~~~
Ce(Te) ∂Te/∂t =
  ∇·[ke ∇Te] − G(Te − Tl) + q'''J,e + q'''opt,e

Cl(Tl) ∂Tl/∂t =
  ∇·[kl ∇Tl] + G(Te − Tl) + q'''J,l
~~~

- `Te`, `Tl`: temperaturas eletrônica e da rede;
- `Ce`, `Cl`: capacidades volumétricas;
- `G`: acoplamento elétron–rede (W/(m³·K));
- `ke`, `kl`: condutividades térmicas eletrônica e da rede.

A divisão exata de fontes e capacidades depende do modelo material. Não ativar duas temperaturas apenas porque o usuário escolheu um laser; verificar duração do pulso, escala de relaxação, regime de repetição e parâmetros do metal. A primeira versão deve usar temperatura única em regime contínuo/modulado suficientemente lento ou após o equilíbrio elétron–rede ser válido.

## 9. Condições de contorno e variáveis de controle

### 9.1 Elétricas
- tensão prescrita OU corrente total/densidade de corrente prescrita;
- terminais e potencial de referência;
- caminho de retorno e conservação de corrente;
- resistências de contato, se incluídas;
- temperatura de referência e curva σDC(T).

Não impor tensão e corrente como condições independentes de uma fonte ideal. Para fontes reais com resistência interna ou limitação de corrente, modelar o circuito externo.

### 9.2 Ópticas
- fonte: contínua, pulsada ou modulada;
- espectro ou λ, potência, irradiância, spot e perfil espacial;
- ângulo, polarização e direção;
- stack: superfície, filme, substrato e camadas;
- papel do feixe: bomba, prova ou feixe único;
- dados ópticos e temperatura de validade.

A prova não deve ser considerada termicamente desprezível sem comparação entre sua potência absorvida e o orçamento térmico total.

### 9.3 Térmicas
- temperatura inicial;
- ρ, cp(T), k(T) ou tensor;
- isolamento, temperatura fixa, substrato/interface, convecção ou radiação;
- fronteiras entre materiais e resistência de contato térmico;
- passo físico e duração.

Convecção, radiação e contato precisam ser declarados, não assumidos. Na primeira versão pode-se começar por isolamento e temperatura prescrita, mas uma fonte permanente em amostra isolada não deve receber resultado estacionário.

## 10. Auditoria do SILM atual

### 10.1 Elétrica
O motor `domain/silm/drive.js` oferece intensidade de campo visual normalizada, não resolve terminais, potencial, densidade de corrente ou potência elétrica. `domain/silm/properties.js` permite usar valores de condutividade/resistividade do banco quando homologados, mas a deriva mostrada não é calculada com uma geometria elétrica quantitativa.

### 10.2 Térmica
O motor `domain/silm/thermal.js` é uma difusão qualitativa normalizada sobre uma rede de vizinhos. O coeficiente não é específico de metal e não representa capacidade térmica, volume, condutividade com unidade ou tempo físico. A fonte e o resfriamento atuais não substituem um modelo térmico macroscópico com contorno e balanço energético completos.

### 10.3 Óptica
A experiência de brilho usa reflexão geométrica; não calcula espectro, absorptância, refletância quantitativa, transmissão, profundidade óptica nem n(λ,T)/κ(λ,T). A intensidade da lanterna não está calibrada em irradiância.

### 10.4 Seleção e aplicação
A seleção de ícones é uma ação de interface. O estado ativo dos ícones não deve ser interpretado como prova de que os campos físicos correspondentes foram resolvidos. Uma seleção E+T+O somente deve ser aplicada após a validação de todos os dados e condições obrigatórios.

### 10.5 Conclusão da auditoria

No estado atual, nenhum dos três domínios forma o acoplamento quantitativo completo:
- a fonte Joule DC não é resolvida;
- a absorção óptica não é calculada;
- o calor não tem escala SI/volume/capacidade para esse uso;
- σDC(T) não realimenta uma solução elétrica;
- R/A/Topt dependentes de T não realimentam o campo óptico;
- o balanço combinado não é contabilizado.

**Decisão operacional:** E+T+O permanece bloqueada no SILM produtivo como simulação quantitativa. Uma visualização futura pode mostrar fontes independentes com escala normalizada, desde que não seja identificada como previsão física nem como comparação real entre metais.

## 11. Contrato de estado conceitual

O estado precisa separar entradas, dados materiais, resultados, fontes e proveniência:

~~~ts
type EvidenceLevel =
  | "measured" | "assessed" | "fitted"
  | "calculated" | "qualitative" | "missing";

interface ElectroThermoOpticalMaterial {
  sample: {
    atomicNumber: number;
    phase: string;
    composition?: string;
    purity?: string;
    sampleType: "bulk" | "film" | "multilayer";
    thicknessM?: number;
    substrateId?: string;
    surfaceCondition?: string;
  };
  electrical: {
    sigmaDcTemperatureCurve?: Array<{ temperatureK: number; sigmaSPerM: number }>;
    evidence: EvidenceLevel;
    sourceIds: string[];
    conditions: Record<string, unknown>;
  };
  thermal: {
    densityKgM3?: number;
    heatCapacityCurve?: Array<{ temperatureK: number; cpJKgK: number }>;
    conductivityCurve?: Array<{ temperatureK: number; kWmK: number }>;
    interfaceConductances?: Record<string, number>;
    evidence: EvidenceLevel;
    sourceIds: string[];
  };
  optical: {
    wavelengthNm: number[];
    temperatureK: number[];
    n?: number[][];
    k?: number[][];
    reflectance?: number[][];
    absorptance?: number[][];
    transmittance?: number[][];
    thermoreflectance?: Array<{
      wavelengthNm: number;
      referenceTemperatureK: number;
      coefficientPerK: number;
      calibratedRangeK: [number, number];
    }>;
    evidence: EvidenceLevel;
    sourceIds: string[];
    conditions: Record<string, unknown>;
  };
}

interface ElectroThermoOpticalExperiment {
  electricalStimulus: {
    control: "voltage" | "current";
    value: number;
    unit: string;
    terminalGeometryId: string;
  };
  opticalStimulus: {
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
  };
  thermalBoundary: {
    initialTemperatureK: number;
    mode: "insulated" | "fixed-temperature" | "substrate" |
      "convection" | "radiation" | "combined";
    ambientTemperatureK?: number;
    timestepS: number;
  };
  coupling: {
    electricalMode: "dc-quasistatic";
    opticalMode: "spectral";
    thermalMode: "single-temperature" | "two-temperature";
    solver: "sequential" | "iterative";
    evidence: EvidenceLevel;
  };
  results: {
    currentA?: number;
    voltageV?: number;
    joulePowerW?: number;
    opticalIncidentPowerW?: number;
    opticalAbsorbedPowerW?: number;
    opticalReflectedPowerW?: number;
    opticalTransmittedPowerW?: number;
    temperatureFieldK?: number[];
    reflectance?: number;
    relativeDeltaReflectance?: number;
    electricalEnergyJ?: number;
    opticalEnergyAbsorbedJ?: number;
    thermalEnergyStoredJ?: number;
    thermalEnergyOutJ?: number;
    energyResidualJ?: number;
  };
}
~~~

Este é um contrato conceitual. A implementação exige validação dimensional, arrays espectrais/temporais coerentes, convenção óptica explícita, funções de interpolação com domínio válido, mesma identidade de amostra e rastreabilidade de cada fonte. Não inventar valores padrão nem completar lacunas com valores típicos.

Resultados derivados não devem ser gravados como condições de entrada. O estado da experiência precisa permitir retomar a simulação sem confundir resultado calculado com parâmetro prescrito.

## 12. Painel único E+T+O

A interface deve apresentar um único painel de experiência e mostrar os grupos necessários, sem três menus contextuais isolados.

**Grupo elétrico**
- controle: tensão OU corrente;
- valor, unidade, terminais e caminho de retorno;
- leitura da grandeza não imposta;
- estado da curva σDC(T) e faixa válida.

**Grupo óptico**
- λ/espectro, potência, irradiância, área e perfil;
- incidência, polarização, stack e condição superficial;
- modo feixe único ou bomba/prova;
- estado da absorção e dados n,k/R,A,Topt.

**Grupo térmico**
- temperatura inicial;
- k(T), cp(T), densidade e interfaces;
- fronteiras térmicas e dissipação;
- modo temperatura única ou duas temperaturas, se houver justificativa.

**Grupo de evidência/validade**
- origem e condição dos dados elétricos, térmicos e ópticos;
- intervalo comum de temperatura;
- fase, espessura, substrato e superfície;
- aviso curto quando fontes não corresponderem à mesma amostra.

**Resultados**
- corrente/tensão, resistência e potência Joule;
- potência óptica incidente, refletida, transmitida e absorvida;
- contribuição térmica Joule e fototérmica separadas;
- temperatura média/máxima/campo espacial;
- R inicial, R atual e ΔR/R;
- energia armazenada/removida e residual do balanço.

Os controles de fonte elétrica, fonte óptica e condições térmicas podem ser ligados/desligados independentemente, mas a simulação só é E+T+O enquanto os três domínios estiverem presentes e os acoplamentos correspondentes estiverem ativos. Desligar uma fonte elimina sua entrada futura; não apaga instantaneamente o calor já armazenado.

## 13. Critérios de aceite

### 13.1 Elétrica
- [ ] Corrente zero e diferença de potencial zero implicam Joule zero.
- [ ] Corrente é conservada nos nós e a fonte/retorno fecham.
- [ ] Potência Joule integrada confere com perdas elétricas internas/contactos definidos.
- [ ] A resposta em T usa σDC(T) válido, sem extrapolação oculta.

### 13.2 Óptica
- [ ] R+A+Topt=1 dentro da tolerância em cada banda e condição.
- [ ] A potência absorvida integra para q'''opt/fluxo de fronteira sem duplicação.
- [ ] Mudanças de λ, polarização, ângulo, stack e T atualizam a absorção de forma consistente.
- [ ] Prova com potência não desprezível entra no orçamento térmico.

### 13.3 Térmica
- [ ] q'''J e q'''opt são fontes diferentes e permanecem identificáveis.
- [ ] Sem fontes e com isolamento, energia total se conserva; com fronteiras dissipativas, energia sai conforme a lei definida.
- [ ] Fonte contínua em amostra isolada não produz falso estado estacionário.
- [ ] O passo físico respeita estabilidade/convergência e independe da taxa de renderização.

### 13.4 Acoplamento e energia
- [ ] Temperatura altera o campo/corrente DC somente pela relação material homologada.
- [ ] Temperatura altera resposta óptica somente por n,k/ε/R/A/CTR validado.
- [ ] A mudança de σDC altera q'''J conforme o modo de controle (tensão ou corrente).
- [ ] A mudança de A(T) realimenta q'''opt quando o acoplamento forte estiver ativado.
- [ ] A integral de potência elétrica, óptica e térmica fecha com a variação de energia interna e as saídas.
- [ ] Não se soma q'''opt de A·Pinc com a dissipação local do mesmo campo EM.
- [ ] Não se conta a mesma perda em σ̃opt e ε̃'' duas vezes.
- [ ] Os valores DC e ópticos pertencem a regimes de frequência distintos.
- [ ] O modelo de temperatura única não é usado em regime ultrarrápido sem justificativa.

### 13.5 Interface, dados e rastreabilidade
- [ ] A interface diferencia entradas, resultados, fontes e perdas.
- [ ] Ausência de um dos três conjuntos de dados bloqueia o modo quantitativo correspondente.
- [ ] Dados de filmes/substratos não são atribuídos automaticamente a metal maciço.
- [ ] O estado dos três domínios é mostrado sem sugerir que um ícone ativo comprova cálculo validado.
- [ ] Aplicar, pausar, desligar fontes, reiniciar e cancelar não deixam fontes ou energia fictícias.
- [ ] O resultado é independente da taxa de quadros dentro da tolerância.

## 14. Fases de implementação

**Fase A — contrato integrado**
- Congelar identidades de amostra, unidades, convenção óptica, geometrias e condições de contorno.
- Definir quais dados e fontes serão usados para o piloto.
- Criar balanços de energia de referência e casos analíticos.
- Manter E+T+O bloqueada no produto.

**Fase B — circuito DC e rede térmica**
- Resolver potencial/corrente e Joule a partir da rede elétrica calibrada.
- Atualizar a temperatura a partir de q'''J.
- Validar conservação de corrente, potência e energia.
- Isso reutiliza o núcleo conceitual de E+T sem misturar dados ópticos ainda.

**Fase C — absorção óptica e fonte fototérmica**
- Resolver refletância/transmitância/absorção ou usar dados medidos compatíveis.
- Construir perfil espacial de q'''opt.
- Validar a integral da absorção.
- Não habilitar realimentação óptica até validar o aquecimento por luz.

**Fase D — realimentação térmico-elétrica e termorrefletiva**
- Atualizar σDC(T), n(λ,T), κ(λ,T), ε(ω,T), R/A/Topt.
- Implementar CTR apenas na faixa linear calibrada.
- Iterar E, O e T quando o efeito cruzado for significativo.
- Verificar residual global de energia e estabilidade.

**Fase E — pump–probe e multicamadas**
- Diferenciar bomba e prova, incluindo a potência da prova quando relevante.
- Incluir substratos, camadas superficiais, condutância térmica de interface e perfis ópticos internos.
- Validar contra TDTR/FDTR ou dados experimentais equivalentes.

**Fase F — regimes avançados**
- Modelo de duas temperaturas para pulsos ultracurtos.
- Eletro-refletância, não linearidade, magneto-óptica e efeitos termoelétricos, somente como acoplamentos extras com equações/dados próprios.

## 15. Decisões que devem ser congeladas antes da implementação

1. A primeira versão é DC quase-estática + fonte óptica espectral + calor transitório.
2. Corrente/tensão e iluminação são estímulos independentes; ambos podem produzir calor, mas por mecanismos distintos.
3. q'''J deve vir de JDC·EDC; q'''opt deve vir da absorção óptica. Não criar um multiplicador visual arbitrário entre eles.
4. Os domínios DC e óptico usam propriedades dependentes da frequência próprias; σDC não substitui σ̃opt.
5. O estado térmico atualiza a condutividade DC e a resposta óptica apenas com curvas/dados validados.
6. As fontes devem ser integradas sem duplicação e o balanço global deve fechar.
7. A primeira fase usa temperatura única somente após equilíbrio elétron–rede ser válido; pulsos ultracurtos podem exigir duas temperaturas.
8. A mesma amostra, fase, espessura, substrato e superfície devem acompanhar as três propriedades; amostras incompatíveis devem ser identificadas como comparação, não como um único espécime.
9. E+T+O permanece bloqueada como simulação quantitativa até homologar dados e testes de todos os três domínios.

## 16. Referências

1. Ansys Optics. “HEAT solver introduction”. [Documentação](https://optics.ansys.com/hc/en-us/articles/360034917713-HEAT-solver-introduction). Apresenta solução auto-consistente das equações de transporte elétrico e térmico, com geração Joule e condições de contorno.
2. Qiang, D.; Charaklias, D.; Dorey, R.; Mohagheghian, I. “The Role of Network Topology on Electro-Thermal and Optical Characteristics of Transparent Thermal Heaters Based on Embedded Random Metallic Mesh”. *Advanced Theory and Simulations*, 2024. [DOI: 10.1002/adts.202301221](https://doi.org/10.1002/adts.202301221). Modelo eletrotérmico acoplado a modelo de onda eletromagnética para estudar distribuição térmica e desempenho óptico de redes metálicas embutidas.
3. Mohan, R. et al. “Time-domain thermoreflectance”. *Nature Reviews Methods Primers*, 5, 55 (2025). [DOI: 10.1038/s43586-025-00425-8](https://doi.org/10.1038/s43586-025-00425-8). Fundamentos ópticos/térmicos de pump–probe, difusão, filmes e interfaces.
4. Guo, X.; Yang, H.; Yao, Y. et al. “Light propagation and heat conduction across multilayered structures in pump-probe thermoreflectance”. *Materials Today Physics* (2026). [DOI: 10.1016/j.mtphys.2026.102018](https://doi.org/10.1016/j.mtphys.2026.102018). Formulação integrada de propagação/absorção óptica, geração e condução de calor e resposta termorrefletiva em multicamadas.
5. Braun, J. L.; Szwejkowski, C.; Giri, A.; Hopkins, P. E. “On the Steady-State Temperature Rise During Laser Heating of Multilayer Thin Films in Optical Pump–Probe Techniques”. *Journal of Heat Transfer*, 140(5) (2018). [DOI: 10.1115/1.4038713](https://doi.org/10.1115/1.4038713). Distribuição de temperatura em filmes multicamadas sob aquecimento a laser e importância da profundidade óptica de penetração.
6. Noh, H. Y.; Abe, K.; Lee, H.-J. “Metal-overlayer-assisted single-wavelength thermoreflectance imaging for microscale thermal characterization in semiconductor devices”. *Journal of Science: Advanced Materials and Devices*, 11(2), 101134 (2026). [DOI: 10.1016/j.jsamd.2026.101134](https://doi.org/10.1016/j.jsamd.2026.101134). Demonstra medição de aquecimento localizado e resposta transiente sob polarização elétrica por termorrefletância.
7. Yin, J.; Cao, Y.; Yan, Y. et al. “A coupled model of electromagnetic and heat on nanosecond-laser ablation of impurity-containing aluminum alloy”. *RSC Advances*, 10, 30944–30952 (2020). [DOI: 10.1039/D0RA04730A](https://doi.org/10.1039/D0RA04730A). Modelo acoplado de absorção eletromagnética e calor em regime intenso de laser; referência de regime avançado, não de operação didática comum.
8. Favaloro, T.; Bahk, J.-H.; Shakouri, A. “Characterization of the temperature dependence of the thermoreflectance coefficient for conductive thin films”. *Review of Scientific Instruments*, 86, 024903 (2015). [DOI: 10.1063/1.4907354](https://doi.org/10.1063/1.4907354). Dependência do coeficiente de termorrefletância com temperatura, comprimento de onda e condição do filme.

---

**Resultado do estudo:** E+T+O é um problema multifísico de três domínios com duas fontes térmicas independentes e duas retroalimentações materiais. A corrente DC produz Joule; a onda óptica produz aquecimento apenas na parcela absorvida; a temperatura atualiza a resposta elétrica e óptica. Sem dados e balanços homologados, a combinação permanece especificada, mas não liberada para simulação quantitativa.
