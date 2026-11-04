# SILM — Especificação do acoplamento eletro-termo-mecânico (E+T+M)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Escopo:** condução elétrica DC, transporte térmico e resposta mecânica da mesma amostra metálica.  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETROTERMICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETROMECANICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-TERMOMECANICO.md`

---

## 1. Objetivo e decisão central

Definir como potencial/corrente, temperatura e deslocamento/deformação interagem em uma mesma amostra metálica, com realimentação entre os três domínios.

O encadeamento físico é:

~~~text
E (potencial/corrente)
    │
    ├── J · E ──► calor Joule ────────────────┐
    │                                         │
    ▼                                         ▼
geometria, seção, contatos ──► resposta E   T (campo térmico)
    ▲                                         │
    │                                         ├──► σe(T), k(T), cp(T)
    │                                         ├──► α(T), C(T), σy(T), τc(T)
    │                                         ▼
    └──────── M (deslocamento/deformação) ◄───┘
                  │
                  ├──► geometria e contatos atualizados
                  ├──► microestrutura/defeitos
                  └──► trabalho plástico ──► calor (opcional, calibrado)
~~~

A combinação precisa representar, no mínimo, estes caminhos:

1. **E → T:** a corrente produz calor Joule no volume e nos contatos elétricos dissipativos.
2. **T → E:** a temperatura altera resistividade/condutividade; a geometria e os contatos também podem mudar.
3. **T → M:** expansão térmica e propriedades mecânicas dependentes de temperatura modificam deslocamento, tensão e resposta ao escoamento.
4. **M → E:** deformação muda comprimento, seção, caminho elétrico, contato e, se houver modelo interno, resistividade por microestrutura/piezorresistividade.
5. **M → T:** trabalho plástico e deslizamento/fricção em contatos podem gerar calor, se suas frações de conversão e leis estiverem calibradas.

**Decisão central:** a simulação quantitativa deve resolver ou iterar de forma convergida os campos elétrico, térmico e mecânico. A temperatura não pode ser calculada uma única vez se a deformação alterar de modo relevante geometria, contatos ou resistência; da mesma forma, a mecânica não pode ignorar a história térmica quando α, C, escoamento ou taxa dependem de T.

A primeira versão pode usar acoplamento sequencial fraco para um caso controlado e demonstrar qualitativamente os mecanismos. O acoplamento simultâneo quantitativo é etapa posterior, dependente de geometria, dados materiais, contatos e validação.

## 2. Escopo, hipóteses e exclusões

### 2.1 Incluído

- Condução elétrica DC quase-estática.
- Geração de calor Joule calculada a partir do campo elétrico/corrente.
- Condução e armazenamento térmico transitórios.
- Expansão térmica e tensões térmicas decorrentes de apoios/restrições.
- Resposta mecânica elástica e, em etapa parametrizada, plástica dependente de T.
- Atualização da geometria elétrica após deformação.
- Dependência de σe/ρe, k, cp, α, C e propriedades de escoamento com T, quando houver dados.
- Efeitos de contato elétrico/térmico e pressão, em fase avançada.
- Calor de deformação plástica e atrito como fontes adicionais opcionais, somente com parâmetros validados.
- Modo didático qualitativo quando a amostra, as unidades ou as leis materiais não estiverem calibradas.

### 2.2 Hipóteses iniciais

- Material homogêneo e isotrópico na primeira formulação quantitativa.
- Regime mecânico quase estático: inércia e ondas elásticas não são resolvidas inicialmente.
- Corrente DC ou solução elétrica quase-estática em cada passo térmico/mecânico.
- Pequenas deformações e termoelasticidade linear na primeira referência analítica.
- Uma temperatura inicial definida; fronteiras térmicas explícitas.
- Sem mudança de fase, fusão, oxidação, recristalização, fluência, dano ou fratura na primeira versão.
- Fontes Joule, externas, plásticas e de contato mantidas em parcelas separadas.

### 2.3 Fora do escopo inicial

- Eletroplasticidade não explicada por temperatura/Joule.
- Efeitos Seebeck, Peltier e Thomson.
- Corrente alternada, ondas eletromagnéticas, skin effect e capacitância.
- Magnetoplasticidade e forças de Lorentz, salvo estudo separado.
- Evolução microestrutural causada diretamente por corrente, sem mecanismo validado.
- Soldagem por resistência e mudança de fase associada, embora sejam aplicações de referência do tipo de acoplamento.
- Creep, viscoelasticidade, fadiga, dano, fratura e transformação de fase.
- Termoelasticidade dinâmica/inercial em altas frequências.
- Contatos elétricos/térmicos/fricção quantitativos sem geometria e dados de interface.

**Importante:** o aquecimento Joule pode alterar a resposta mecânica por temperatura. Isso não deve ser chamado automaticamente de eletroplasticidade. A eletroplasticidade exige demonstrar efeito adicional da corrente além da história térmica equivalente.

## 3. Uma única amostra e estado compartilhado

Os três domínios devem compartilhar a mesma amostra e o mesmo instante físico.

O estado deve identificar:
- material, composição, fase, pureza/tratamento e orientação;
- geometria de referência e configuração deformada atual;
- dimensões, volume, terminais, apoios e contatos;
- temperatura inicial, campo térmico atual e temperatura de referência;
- potencial, corrente, campo elétrico e densidade de corrente;
- deslocamento, deformação total, elástica, térmica e plástica;
- microestrutura/variáveis internas, quando parametrizadas;
- propriedades materiais e leis dependentes de T;
- condições de contorno, fontes, dissipação, unidades, incerteza e referências.

A geometria atualizada deve ser a mesma usada para:
- resolver o caminho de corrente e calcular a densidade de corrente;
- calcular o volume e a área de troca térmica;
- resolver deslocamentos, tensões e deformações.

A malha elétrica, térmica e mecânica pode ter discretizações distintas, mas a transferência entre elas precisa conservar potência, fluxo, força e estado. A rede cristalina mostrada na cena não substitui um corpo de prova macroscópico.

## 4. Campo elétrico e geração Joule

### 4.1 Condução elétrica

Para condução DC quase-estática, na configuração atual:

~~~text
∇ · J = 0
E = −∇V
J = σe(T, S, ε, p) E
~~~

- J: densidade de corrente (A/m²);
- E: campo elétrico (V/m);
- V: potencial (V);
- σe: condutividade elétrica (S/m);
- S: estado microestrutural;
- ε: estado de deformação, quando houver dependência intrínseca validada;
- p: estado de contato/pressão, se a condutância depender de contato.

A dependência de σe pode ser simplificada na primeira etapa para σe(T). Dependência de deformação, microestrutura, pressão ou piezoresistividade só pode ser adicionada quando houver dados e lei material específicos.

### 4.2 Fonte Joule

A potência volumétrica dissipada por condução elétrica é:

~~~text
q̇J = J · E = ρe(T, S, ε, p) |J|²
~~~

com unidade W/m³. Para uma amostra completa, a potência Joule de volume é a integral de q̇J sobre o volume atual.

A conservação elétrica deve fechar entre potência fornecida nos terminais, energia dissipada no volume e dissipação de contato. O modelo deve indicar qual fração da energia elétrica dissipada é convertida em calor e onde ela é depositada. Para um condutor ôhmico passivo ideal, a dissipação Joule é não negativa.

### 4.3 Controle por tensão ou corrente

A experiência deve escolher uma variável elétrica prescrita:

| Modo | Entrada prescrita | Resposta calculada |
|---|---|---|
| Tensão controlada | diferença de potencial nos terminais | corrente, campo e potência |
| Corrente controlada | corrente total ou densidade de corrente na fronteira | potencial, campo e potência |

Não prescrever tensão e corrente como duas entradas independentes no mesmo circuito ideal. Uma fonte real com resistência interna, controle eletrônico ou limitação de corrente exige um modelo de circuito externo.

### 4.4 Efeito da deformação no caminho elétrico

A geometria atualiza comprimento, área, caminho e distribuição de corrente. Para barra uniforme e isotrópica:

~~~text
R = ρe L / A
~~~

Para pequenas variações:

~~~text
ΔR/R ≈ Δρe/ρe + ΔL/L − ΔA/A
~~~

Separar:
1. contribuição geométrica de L e A;
2. contribuição intrínseca por T e microestrutura;
3. resistência de contato, quando presente.

A densidade de corrente usa a área deformada atual. Concentrações locais de corrente exigem resolver o domínio; não podem ser inferidas apenas a partir da intensidade visual dos elétrons.

## 5. Campo térmico e fontes de energia

### 5.1 Equação de calor de referência

Para pequenas deformações, propriedades contínuas e sem mudança de fase, uma forma de referência é:

~~~text
ρm cp(T) ∂T/∂t = ∇ · [k(T) ∇T]
                  + q̇J + q̇ext + q̇plastic + q̇contact
~~~

- ρm: densidade de massa (kg/m³);
- cp: calor específico (J/(kg·K));
- k: condutividade térmica (W/(m·K));
- q̇J: geração Joule volumétrica;
- q̇ext: fonte térmica externa;
- q̇plastic: calor por deformação plástica, opcional;
- q̇contact: calor por dissipações de contato/fricção, opcional.

A expressão é uma forma de referência para a primeira formulação. Em uma teoria termoelástica completa, incluir termos reversíveis de acoplamento termo-mecânico quando forem relevantes e compatíveis com a lei constitutiva. Não confundir esses termos com dissipação plástica.

### 5.2 Fontes não intercambiáveis

- **Joule:** calculada do campo elétrico e da densidade de corrente.
- **Externa:** calor aplicado por fonte, fluxo ou condição térmica prescrita.
- **Plástica:** fração do trabalho inelástico convertida em calor.
- **Contato/fricção:** dissipação em interfaces, quando há deslizamento ou contato elétrico dissipativo.

Cada fonte deve ter identidade, posição, distribuição, unidade e método de cálculo. Não renomear fonte externa como Joule nem usar a mesma dissipação simultaneamente como calor volumétrico e energia armazenada.

### 5.3 Condições de contorno térmicas

| Condição | Significado | Uso |
|---|---|---|
| Isolada | fluxo normal nulo | caso de validação/curto intervalo |
| Temperatura prescrita | fronteira mantida em temperatura definida | primeira etapa parametrizada |
| Convecção | transferência para fluido/ambiente | etapa posterior |
| Radiação térmica | troca radiativa para o ambiente | etapa posterior |
| Contato térmico | fluxo depende de pressão, separação e condutância de interface | etapa avançada |

A temperatura inicial deve ser declarada. Uma amostra termicamente isolada com geração Joule contínua positiva não possui estado estacionário térmico finito no modelo sem perdas. Não apresentar equilíbrio estacionário artificial.

## 6. Campo mecânico e resposta dependente de temperatura

### 6.1 Condições de carregamento

A condição mecânica deve escolher:
- compressão OU tração na primeira versão;
- força/tensão prescrita OU deslocamento/deformação prescrita;
- apoio livre, apoiado ou restringido;
- direção e região de aplicação.

Não prescrever simultaneamente força e deslocamento independentes no mesmo grau de liberdade. Combinar compressão e tração em eixos distintos exige ensaio multiaxial, não duas animações sobrepostas.

### 6.2 Deformação térmica e mecânica

Para pequenas deformações e material isotrópico:

~~~text
ε = εe + εp + εth
εth = α(T) ΔT I
σ = C(T) : [ε − εp − εth]
~~~

O equilíbrio quase estático é:

~~~text
∇ · σ + b = 0
~~~

- ε: deformação total;
- εe: deformação elástica;
- εp: deformação plástica;
- εth: deformação térmica;
- α(T): coeficiente de expansão térmica;
- C(T): tensor de rigidez;
- σ: tensor de tensão;
- b: força de corpo por unidade de volume.

Para barra uniaxial, homogênea, com propriedades constantes e expansão axial totalmente restringida:

~~~text
σ = −E α ΔT
~~~

É um teste analítico 1D, não uma fórmula universal para corpos 3D, restrições parciais ou gradientes.

### 6.3 Resposta constitutiva dependente de T

Propriedades que podem depender da temperatura:
- α(T): expansão térmica;
- C(T) ou E(T), ν(T): rigidez elástica;
- σy(T): limite de escoamento;
- τc(T, taxa, S): tensão crítica de deslizamento;
- parâmetros de encruamento e recuperação;
- σe(T), ρe(T), k(T), cp(T): propriedades de transporte.

A temperatura não implica amolecimento universal nem deslizamento automático. A resposta só muda segundo curvas ou leis materiais calibradas para o material, a fase, a taxa de deformação e a faixa térmica.

### 6.4 Geometria e microestrutura

A deformação pode alterar:
- L, A, volume e orientação dos terminais;
- distribuição local de corrente;
- resistência de contato por pressão, abertura/deslizamento e área real de contato;
- densidade/configuração de defeitos e resistividade intrínseca.

A variável interna microestrutural não pode ser substituída pelo número de deslizamentos visuais. A regra de Matthiessen é uma aproximação e não deve ser tratada como soma universal exata.

## 7. Acoplamento reverso M → T: dissipação plástica e contatos

### 7.1 Calor por trabalho plástico

Uma forma de referência para a fonte volumétrica é:

~~~text
q̇plastic = β σ : ε̇p
~~~

β é a fração do trabalho plástico convertida em calor; σ:ε̇p é a potência plástica por volume. A expressão e o valor de β dependem da convenção constitutiva, do material, da deformação, taxa, modo de carregamento e microestrutura.

Não fixar β = 0,9 como propriedade universal do metal. O valor padrão usado por determinado software comercial não é evidência para atribuir o mesmo coeficiente a todas as amostras. Revisões e medições experimentais discutem variações e dificuldades na determinação do coeficiente Taylor–Quinney. [Nassar, 2025](https://doi.org/10.1098/rspa.2024.0139); [Cordasco et al., relatório técnico FAA](https://rosap.ntl.bts.gov/view/dot/89370).

A primeira versão deve manter q̇plastic desligado até haver calibração. Sem isso, a simulação ainda pode modelar T→M, mas não deve alegar o retorno quantitativo de toda dissipação mecânica ao campo térmico.

### 7.2 Contatos elétricos, térmicos e mecânicos

Em uma interface, pressão e separação podem afetar ao mesmo tempo:
- condutância elétrica de contato;
- condutância térmica de contato;
- área real de contato;
- geração Joule localizada na interface;
- atrito e calor por deslizamento.

Isso pode criar realimentação forte: carga mecânica altera contato, contato altera corrente/temperatura e temperatura/deformação alteram a pressão e a área de contato. Análises multifísicas de referência incluem dependência da condutância elétrica e térmica com pressão/separação e geração de calor por fricção ou corrente de contato. [Abaqus — fully coupled thermal-electrical-structural analysis](https://docs.software.vt.edu/abaqusv2025/English/SIMACAEANLRefMap/simaanl-c-coupthermalelecstruct.htm).

**Decisão:** contatos são ideais na demonstração inicial. Modelagem quantitativa de contato elétrico/térmico e calor por fricção é uma extensão separada, com leis de interface e dados.

## 8. Eletroplasticidade: fenômeno separado

O acoplamento E+T+M já captura a influência térmica da corrente:
- corrente → dissipação Joule → temperatura;
- temperatura → expansão, propriedades mecânicas e resistência ao deslizamento;
- mecânica → geometria/microestrutura → resposta elétrica.

Isso não demonstra eletroplasticidade atérmica.

Eletroplasticidade é a alteração da deformação plástica associada à corrente que não pode ser explicada apenas pelo histórico térmico. A literatura discute interações elétron–discordância, forças de vento de elétrons, redistribuição de carga e mecanismos magnetoplásticos, com importância variável entre materiais e protocolos. [Dash et al., 2025](https://doi.org/10.1146/annurev-matsci-081720-111526); [Yang et al., 2026](https://doi.org/10.1016/j.revmat.2026.100187).

Para investigar essa hipótese, exigir:
- ensaios com e sem corrente e histórico espacial/temporal de temperatura equivalente;
- mesma geometria, taxa, apoio, condição inicial e microestrutura;
- densidade de corrente, forma de onda, duração, frequência e duty cycle;
- condição com resfriamento forçado/controle térmico quando necessário;
- evidência microestrutural, repetição, incerteza e fonte;
- separação de Joule macroscópico e aquecimento local em defeitos.

Não reduzir o limiar de escoamento nem acelerar deslizamento apenas porque a corrente foi ativada. O efeito eletroplástico permanece bloqueado como modelo, mas pode ser apresentado como pergunta de investigação experimental separada.

## 9. Sequência de cálculo e estratégia de acoplamento

### 9.1 Estado desconhecido

O estado multifísico básico é:

~~~text
y = {u, V, T}
~~~

- u: deslocamento;
- V: potencial elétrico;
- T: temperatura.

As equações dependem umas das outras por σe(T,S,ε,p), q̇J(J,E), propriedades mecânicas C(T), α(T), σy(T), geometria atual e, opcionalmente, fontes de dissipação inelástica/contato.

### 9.2 Acoplamento sequencial fraco

Uma primeira implementação pode iterar por passo físico:

1. Ler o estado atual da amostra e Tⁿ.
2. Atualizar propriedades elétricas e mecânicas usando dados/leis válidos.
3. Resolver V e J na geometria atual para tensão ou corrente prescrita.
4. Calcular q̇J e dissipação de contato; verificar a potência elétrica.
5. Atualizar o campo térmico usando q̇J, fontes externas e fronteiras térmicas.
6. Calcular εth(T), resolver deslocamento/tensão com apoios e carregamento.
7. Atualizar geometria, volume, contatos e variáveis microestruturais.
8. Atualizar σe e condutâncias de contato a partir da nova geometria/estado.
9. Repetir os passos 3–8 até as diferenças de T, u, V, potência e contato convergirem, quando o acoplamento não puder ser tratado como fraco.
10. Somente então avançar o tempo físico e publicar o estado.

### 9.3 Acoplamento simultâneo forte

Quando realimentação for forte — por exemplo, forte dependência de σe(T), contato pressionado, grande deformação, concentração localizada de corrente ou aquecimento intenso — resolver simultaneamente ou iterar todas as equações até convergência do residual acoplado.

Métodos multifísicos de referência tratam os três campos com graus de liberdade de deslocamento, potencial e temperatura e sistema acoplado não simétrico. O uso desse tipo de método ilustra a complexidade da solução completa, não significa que o SILM já possua essa capacidade. [Abaqus, fully coupled T-E-structural](https://docs.software.vt.edu/abaqusv2025/English/SIMACAEANLRefMap/simaanl-c-coupthermalelecstruct.htm).

### 9.4 Tempo físico e estabilidade

- O tempo físico deve ser independente de FPS, taxa de quadros e movimento reduzido.
- O passo deve respeitar estabilidade/precisão térmica, variações máximas de temperatura, evolução de deformação e não linearidade elétrica.
- Reduzir ou adaptar o passo quando a mudança de T, deformação, resistência ou contato entre incrementos for excessiva.
- Pausar a renderização não deve pausar a conservação matemática do passo já concluído nem avançar o tempo fora do controle da simulação.
- A primeira hipótese mecânica é quase estática; inércia só entra com modelo dinâmico próprio.

## 10. Balanços de energia e conservação

### 10.1 Balanço elétrico

A potência elétrica fornecida pelos terminais deve coincidir com:
- dissipação Joule no volume;
- dissipação nos contatos elétricos;
- variação de energia elétrica armazenada, quando efeitos capacitivos estiverem incluídos (fora do escopo inicial).

Para DC quase-estática sem armazenamento capacitivo significativo:

~~~text
Pterminal ≈ ∫Ω (J · E) dV + Pcontact
~~~

### 10.2 Balanço térmico

A variação de energia interna deve corresponder a:
- Joule de volume e contato;
- fonte térmica externa;
- fração de trabalho plástico convertida em calor;
- calor por fricção/contacto, se habilitado;
- fluxo de calor que sai pelas fronteiras.

Manter as fontes separadas nos relatórios e verificar resíduo global de energia por passo.

### 10.3 Balanço mecânico

O trabalho mecânico externo deve ser distribuído entre:
- energia elástica armazenada;
- trabalho plástico e evolução microestrutural;
- energia cinética, se o modelo dinâmico for ativado;
- dissipação por contato/fricção, se presente.

A fração de trabalho plástico transformada em calor não pode também permanecer contabilizada como energia armazenada sem ajuste coerente. Não contar duas vezes a mesma dissipação entre q̇plastic e a variável de energia interna.

### 10.4 Condição de parada e estado estacionário

- Corrente zero deve resultar em q̇J = 0 no volume, exceto fontes de contato/externas explicitamente independentes.
- Amostra isolada com fonte Joule contínua não deve apresentar equilíbrio térmico estacionário finito.
- Em fonte ideal de tensão, o aumento de R pode reduzir potência P = V²/R; em fonte ideal de corrente, o aumento de R pode elevar P = I²R. A realimentação térmica depende do circuito/controle.
- Não afirmar que o aquecimento sempre aumenta ou reduz a corrente, a deformação ou a resistência: o resultado depende da fonte, da curva material, das fronteiras e dos apoios.

## 11. Dados e condições necessários

### 11.1 Dados elétricos
- σe(T) ou ρe(T), faixa de validade e temperatura de referência;
- geometria, terminais, condutância de contato e resistividade de contato, se aplicável;
- fonte/controlador elétrico: tensão ou corrente, resistência interna e limites quando relevantes;
- dependência piezoresistiva/microestrutural, somente se medida/modelada.

### 11.2 Dados térmicos
- k(T), densidade ρm, cp(T);
- temperatura inicial e referência;
- fronteiras térmicas e contato térmico;
- fração da potência elétrica convertida em calor, se diferente da hipótese ôhmica padrão;
- fontes externas identificadas.

### 11.3 Dados mecânicos
- geometria, apoios, modo e controle de carregamento;
- α(T), E(T) ou C(T), ν(T);
- curvas tensão–deformação por temperatura, taxa, fase e tratamento;
- σy(T), τc(T), encruamento e modelo de evolução microestrutural, quando habilitados;
- coeficiente Taylor–Quinney β, quando calor plástico estiver ativo;
- condições de contato e atrito, se forem simuladas.

### 11.4 Metadados e validade

Cada parâmetro deve incluir:
- unidade SI;
- material, composição, fase e tratamento;
- temperatura e faixa de validade;
- método, fonte e data;
- incerteza, quando disponível;
- natureza: medido, calculado, ajustado ou didático.

Não completar propriedades ausentes com valores típicos sem registrar fonte e condição. A regra de ativação quantitativa exige que todos os parâmetros necessários ao caminho escolhido estejam homologados.

## 12. Experiência na interface

Manter o painel único de condições: seleção dos ícones define os fenômenos; o painel apresenta campos por família, sem menu contextual separado para cada propriedade.

### 12.1 Condições elétricas
- tensão OU corrente;
- terminais/direção de corrente;
- material e função σe(T), se disponível;
- modelo de contato elétrico (ideal na primeira versão).

### 12.2 Condições térmicas
- temperatura inicial/referência;
- fonte Joule calculada automaticamente a partir de E;
- fonte externa e gradiente/fronteiras, claramente separados;
- perda térmica/contato quando habilitados.

### 12.3 Condições mecânicas
- compressão OU tração;
- força/tensão OU deslocamento/deformação;
- apoio livre, apoiado ou restringido;
- direção, região e taxa de aplicação;
- lei mecânica dependente de T quando disponível.

### 12.4 Resultados
- potencial, corrente, tensão e densidade de corrente;
- potência Joule total e distribuição de q̇J;
- temperatura local, média e máxima;
- comprimento, área/volume e geometria atuais;
- expansão térmica, deslocamento, tensão e deformação;
- parcelas elástica/plástica e variável microestrutural;
- resistência geométrica, resistividade intrínseca e contato separados;
- potência elétrica, energia térmica e trabalho mecânico;
- nível de evidência (qualitativo, parametrizado ou quantitativo).

A interface deve indicar quais campos são entradas, quais são calculados e quais leis/dados sustentam cada resultado.

## 13. Contrato conceitual do estado E+T+M

~~~ts
type ElectricalControl = "voltage" | "current";
type ThermalBoundary = "insulated" | "prescribed-temperature" | "convection" | "radiation";
type MechanicalMode = "compression" | "tension";
type MechanicalControl = "force-stress" | "displacement-strain";
type ConstraintMode = "free" | "supported" | "restrained";
type EvidenceMode = "qualitative" | "parameterized" | "quantitative";

interface ElectroThermoMechanicalExperiment {
  sample: {
    materialId: string;
    phase: string;
    geometryId: string;
    microstructureModelId?: string;
    temperatureReferenceK: number;
  };
  electrical: {
    control: ElectricalControl;
    value?: number;
    unit?: string;
    terminalsId: string;
    contactModel: "ideal" | "parameterized";
  };
  thermal: {
    initialTemperatureK: number;
    boundary: ThermalBoundary;
    boundaryModelId?: string;
    externalSourceId?: string;
  };
  mechanical: {
    mode: MechanicalMode;
    control: MechanicalControl;
    constraint: ConstraintMode;
    value?: number;
    unit?: string;
    direction: [number, number, number];
    supportModelId?: string;
  };
  material: {
    electricalDatasetId?: string;
    thermalDatasetId?: string;
    mechanicalDatasetId?: string;
    microstructureDatasetId?: string;
    plasticHeatDatasetId?: string;
  };
  coupling: {
    jouleHeating: true;
    thermalExpansion: boolean;
    temperatureDependentMechanics: boolean;
    deformationDependentResistance: boolean;
    plasticHeat: false | true;
    electroplasticity: false;
  };
  evidenceMode: EvidenceMode;
  results: {
    voltageV?: number;
    currentA?: number;
    currentDensityAm2?: number;
    joulePowerW?: number;
    temperatureFieldId?: string;
    displacementFieldId?: string;
    stressFieldId?: string;
    resistanceOhm?: number;
    resistivityOhmM?: number;
    energyResidual?: number;
  };
}
~~~

O contrato é conceitual, não um schema pronto. Entradas, condições de contorno, variáveis de estado e resultados devem permanecer separados. Campos físicos opcionais não podem ser exibidos como valores medidos sem unidade, fonte e faixa de validade.

## 14. Auditoria do SILM atual

Arquivos de código da `main` auditados para esta especificação:

### 14.1 `domain/silm/thermal.js`
- Propagação de calor por grafo de vizinhos imediatos da rede cristalina.
- Coeficiente didático comum D = 0,45.
- Escala temporal ligada à animação; sem perda para o ambiente.
- Temperatura normalizada entre 0 e 1; não representa K ou °C.
- Fonte local presa em nível máximo; não calcula q̇J a partir de potencial/corrente.
- Não possui k(T), ρm ou cp(T) homologados por metal.

### 14.2 `domain/silm/deformation.js`
- Sistemas representativos de deslizamento CFC, CCC e HC.
- Orientação de ensaio didática; limiar normalizado YIELD = 0,5.
- Deformação elástica ilustrativa até 6%; máximo de quatro deslizamentos.
- Não implementa C(T), α(T), σy(T), curva tensão–deformação por metal ou dissipação plástica calibrada.
- Transforma coordenadas da rede cristalina, mas não resolve um corpo de prova macroscópico com terminais, apoios e seção física.

### 14.3 `domain/silm/drive.js`
- Intensidade de campo adimensional e transitória; não são volts, ampères ou densidade de corrente.
- Não resolve potencial/corrente e não calcula potência Joule.
- O controlador de ângulo da lanterna é independente da temperatura e deformação.

### 14.4 `integracao/metallic-experience.js`
- A combinação atual `heatElectrical` usa uma fonte térmica externa transitória junto do campo elétrico visual.
- As combinações `malleabilityElectrical` e `ductilityElectrical` associam deformação e campo elétrico transitório.
- Não existe solução simultânea de V, T e u; não há balanço Joule nem retorno quantitativo de T à mecânica.
- O efeito de defeitos sobre espalhamento elétrico é qualitativo; não existe densidade física de discordâncias, resistividade dependente de defeitos ou geometria elétrica deformada.

### 14.5 Conclusão da auditoria

O SILM possui demonstrações qualitativas isoladas e combinações visuais de calor/corrente e deformação/corrente. Ainda não possui o acoplamento eletro-termo-mecânico quantitativo. A seleção de três ícones não deve ativar uma simulação multifísica sem os campos, as equações, as condições de contorno, os dados e os testes definidos.

## 15. Critérios de aceite

### 15.1 Elétricos
- [ ] Sem diferença de potencial/corrente prescrita, q̇J é zero.
- [ ] Sob tensão controlada, alterações em R atualizam a corrente de modo coerente.
- [ ] Sob corrente controlada, alterações em R atualizam a tensão e a potência de modo coerente.
- [ ] A geometria deformada é usada para o caminho elétrico e J.
- [ ] A continuidade de corrente fecha em todos os cortes/terminais.
- [ ] Resistência geométrica, resistividade intrínseca e resistência de contato são separadas.

### 15.2 Térmicos
- [ ] A soma de potência Joule alocada aos volumes coincide com a potência elétrica dissipada.
- [ ] A fonte externa não é contada como Joule.
- [ ] Fonte contínua em amostra isolada não produz estado estacionário falso.
- [ ] Fluxo de calor, energia interna e fontes fecham o balanço.
- [ ] Propriedades k(T), cp(T) e σe(T) não extrapolam suas faixas.

### 15.3 Mecânicos
- [ ] Com ΔT = 0 e carga nula, não há expansão ou tensão indevida.
- [ ] A expansão livre e uniforme não cria tensão térmica espúria.
- [ ] A expansão restringida produz sinal correto de tensão no caso analítico.
- [ ] A deformação elástica retorna após descarga.
- [ ] A deformação plástica permanece conforme a lei constitutiva.
- [ ] A resposta ao escoamento só muda com T quando existe dado/modelo homologado.
- [ ] O calor plástico é zero quando não há potência plástica ou quando a função está desligada.

### 15.4 Acoplamento e conservação
- [ ] E, T e M compartilham a mesma amostra, geometria e estado temporal.
- [ ] Alterar T modifica σe e C/α/escoamento somente segundo funções materiais declaradas.
- [ ] Alterar a geometria atualiza R, J e contatos.
- [ ] A potência terminal fecha com Joule de volume e contatos.
- [ ] Trabalho mecânico fecha com energia elástica, dissipação plástica e outras parcelas incluídas.
- [ ] Energia plástica convertida em calor não é contada duas vezes.
- [ ] Contato elétrico/térmico não é considerado sem lei e parâmetro de interface.
- [ ] A eletroplasticidade atérmica permanece desativada.
- [ ] O passo físico é independente da renderização e mantém estabilidade/convergência.

### 15.5 Interface
- [ ] Tensão/corrente são controles alternativos.
- [ ] Força/tensão mecânica e deslocamento/deformação são controles alternativos.
- [ ] Apoios e fronteiras térmicas são explícitos.
- [ ] Clique, Ctrl/Cmd e toque preservam a seleção lógica.
- [ ] O painel é único, com blocos de campos por família.
- [ ] Resultados qualitativos não recebem unidades físicas falsas.
- [ ] Aplicar/cancelar/reiniciar não deixa efeitos transitórios ativos ou estados parciais.

## 16. Fases de implementação

**Fase A — demonstração qualitativa integrada**
- Mostrar corrente/campo, temperatura e deformação como variáveis didáticas.
- Distinguir claramente a fonte térmica externa do Joule ainda não calculado.
- Manter os valores adimensionais e declarar a ausência de balanço físico.
- Sem alterar o limiar mecânico por corrente.

**Fase B — E+T quantitativo em geometria fixa**
- Implementar potencial/corrente, condutividade e q̇J.
- Implementar propriedades térmicas e fronteiras.
- Validar potência elétrica, distribuição de Joule e energia interna.
- Sem deslocamento/deformação acoplados.

**Fase C — termoelasticidade**
- Implementar geometria macroscópica, apoios e expansão térmica.
- Homologar α(T), C(T), cp(T), k(T), ρm e fronteiras.
- Resolver deslocamento/tensão sob T e validar casos analíticos.
- Ainda sem alterar o caminho elétrico com a deformação.

**Fase D — retorno mecânico ao elétrico**
- Atualizar L, A, volumes, terminais e contatos na configuração atual.
- Recalcular corrente e potência Joule.
- Separar mudança geométrica de resistividade intrínseca e contato.
- Validar controles por tensão e corrente.

**Fase E — plasticidade e dissipação**
- Homologar curvas tensão–deformação(T), taxa, encruamento e evolução de microestrutura.
- Adicionar q̇plastic somente com β calibrado.
- Separar energia armazenada, calor e dissipaçāo de contato/fricção.

**Fase F — acoplamento forte e interfaces**
- Implementar contatos elétricos e térmicos dependentes de pressão/separação, se necessários.
- Resolver/iterar {u,V,T} até convergência.
- Validar balanços e casos de referência independentes.
- Incluir não linearidade geométrica somente quando a deformação exigir.

## 17. Decisões congeladas

1. E+T+M é o primeiro acoplamento de três campos sem óptica e usa uma única amostra.
2. Joule é calculado a partir do campo elétrico; fonte externa permanece independente.
3. Temperatura influencia transporte e mecânica apenas por funções materiais declaradas.
4. Deformação atualiza geometria, seção, terminais e contatos elétricos.
5. Resistência geométrica, resistividade intrínseca, piezoresistividade e resistência de contato são parcelas distintas.
6. Calor plástico e calor de fricção são extensões opcionais, com calibração e balanços separados.
7. Eletroplasticidade além de efeitos térmicos não é presumida nem habilitada.
8. A primeira demonstração pode ser qualitativa; valores físicos dependem de geometria, propriedades e fronteiras homologadas.
9. Acoplamento simultâneo quantitativo exige convergência do estado {u,V,T} e fechamento de energia.
10. A especificação não autoriza ativar a combinação no simulador sem implementar e validar os três campos.

## 18. Referências

1. Dassault Systèmes. *Abaqus 2025 Documentation*, “Fully Coupled Thermal-Electrical-Structural Analysis”. [Documentação](https://docs.software.vt.edu/abaqusv2025/English/SIMACAEANLRefMap/simaanl-c-coupthermalelecstruct.htm). Acoplamento simultâneo de deslocamento, potencial e temperatura; condutividade dependente de T, Joule, expansão térmica, geração por deformação inelástica, contato e piezoresistividade.
2. Dassault Systèmes. *Abaqus 2025 Documentation*, “Configuring a fully coupled, simultaneous heat transfer, electrical, and structural procedure”. [Documentação](https://docs.software.vt.edu/abaqusv2025/English/SIMACAECAERefMap/simacae-t-simconfigurecoupledheatelectricstruct.htm). Configuração de análises termo-eletro-estruturais transitórias/estacionárias.
3. Dassault Systèmes. *Abaqus 2025 Documentation*, “Coupled Thermal-Electrical Analysis”. [Documentação](https://docs.software.vt.edu/abaqusv2025/English/SIMACAEANLRefMap/simaanl-c-jouleheating.htm). Conservação de corrente, geração Joule, dependência da condutividade com T e balanço térmico.
4. Dash, A. et al. “Electroplasticity of Metals and Ceramics: Current Status”. *Annual Review of Materials Research*, 55, 151–174, 2025. [DOI 10.1146/annurev-matsci-081720-111526](https://doi.org/10.1146/annurev-matsci-081720-111526). Mecanismos de eletroplasticidade além do aquecimento Joule.
5. Yang, Y. et al. “Electric-current-assisted processing of metals: Mechanisms, microstructural control, and plasticity enhancement”. *Review of Materials Research*, 2(3), 100187, março de 2026. [DOI 10.1016/j.revmat.2026.100187](https://doi.org/10.1016/j.revmat.2026.100187). Revisão recente que separa aquecimento Joule de efeitos atérmicos, pulsos e evolução microestrutural.
6. Li, X. et al. “Electrically Assisted Processing of Metallic Materials: Coupled Mechanisms, Microstructure Evolution, and Service Performance”. *Metals*, 16(6), 578, 25 maio 2026. [DOI 10.3390/met16060578](https://doi.org/10.3390/met16060578). Revisão de processamento metálico sob campos elétrico, térmico e mecânico.
7. Qinxiang, X.; Can, C.; Gangfeng, X.; Zhangxiong, X. “Current status of research on electroplasticity effect for difficult-to-deform metals under electro-thermo-mechanical coupling”. *Forging & Stamping Technology*, 46(9), 124–131, 2021. [DOI 10.13330/j.issn.1000-3940.2021.09.015](https://doi.org/10.13330/j.issn.1000-3940.2021.09.015). Métodos experimentais para separar efeitos térmicos e eletroplásticos em ensaios de tração assistidos por corrente.
8. Nassar, O. “On the conversion of plastic work into heat in metals”. *Proceedings of the Royal Society A*, 481(2308), 20240139, 2025. [DOI 10.1098/rspa.2024.0139](https://doi.org/10.1098/rspa.2024.0139). Variabilidade do coeficiente Taylor–Quinney.
9. Cordasco, D. et al. *Full-Field Measurement of the Taylor-Quinney Coefficient in Tension Tests of Ti-6Al-4V, Aluminum 2024-T351, and Inconel 718 at Various Strain Rates*. FAA Technical Report DOT/FAA/TCTT-20/40. [Relatório](https://rosap.ntl.bts.gov/view/dot/89370). Medição do calor associado ao trabalho plástico em ligas e taxas diferentes.
10. SILM — [Especificação E+T](ESPECIFICACAO-ACOPLAMENTO-ELETROTERMICO.md), [E+M](ESPECIFICACAO-ACOPLAMENTO-ELETROMECANICO.md) e [T+M](ESPECIFICACAO-ACOPLAMENTO-TERMOMECANICO.md). Contratos internos de transporte, Joule, geometria, expansão e resposta mecânica dependente de T.

**Decisão de segurança científica:** E+T+M deve permanecer como especificação. A demonstração atual de calor + corrente não calcula Joule; a demonstração deformação + corrente não simula eletroplasticidade; e o motor térmico não fornece temperatura física. A ativação quantitativa exige um domínio macroscópico comum, propriedades homologadas, condições de contorno e balanços validados.
