# SILM — Especificação do acoplamento térmico-mecânico-óptico (T+M+O)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Escopo:** temperatura, deformação mecânica e resposta óptica da mesma amostra.  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`
- `ESPECIFICACAO-ACOPLAMENTO-TERMOMECANICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-TERMO-OPTICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-MECANICO-OPTICO.md`

---

## 1. Objetivo e decisão central

Definir como o campo de temperatura, a resposta mecânica e a resposta óptica se influenciam na mesma amostra metálica, com fontes, variáveis e balanços rastreáveis.

A combinação precisa representar quatro caminhos distintos:

1. **T → M:** temperatura causa expansão/contração térmica e pode alterar rigidez, escoamento e resposta plástica; restrições e gradientes térmicos podem gerar tensões e deformação.
2. **T → O:** temperatura pode alterar a resposta óptica intrínseca, como n(λ,T), κ(λ,T), ε̃(ω,T), refletância ou coeficiente de termorrefletância.
3. **T + M → O:** expansão térmica, tensões e deformação mecânica mudam a forma e as normais locais da superfície, alterando direção da reflexão e, se a topografia for resolvida, sua distribuição angular.
4. **O → T:** somente a parcela de potência óptica absorvida pela amostra pode ser convertida em fonte térmica; um feixe de prova deve ser distinguido de um feixe de bombeamento.

**Decisão central:** a resposta óptica observada pode mudar por pelo menos dois motivos diferentes:
- **geométrico:** a superfície se desloca, se inclina ou muda sua topografia;
- **intrínseco:** a temperatura altera as propriedades ópticas do material.

Essas contribuições devem ser calculadas e exibidas separadamente. Uma mudança do sinal refletido não deve ser atribuída automaticamente à temperatura se também houve alteração de inclinação, rugosidade, foco ou alinhamento.

A primeira experiência poderá começar com expansão e reflexão geométricas, mantendo a resposta mecânica e óptica intrínseca em modo qualitativo. A simulação quantitativa exige dados térmicos, mecânicos, ópticos e uma geometria de amostra calibrada.

## 2. Limites, hipóteses e variantes de experiência

### 2.1 Variantes de iluminação

A seleção T+M+O não significa que toda luz incidente precise aquecer a amostra. A interface deve distinguir:

**A. Luz de prova (probe)**
- A fonte térmica é externa ou vem de uma condição térmica definida.
- A iluminação óptica mede a resposta da superfície.
- A potência absorvida pela prova é desprezível, ou precisa ser contabilizada quando não for desprezível.
- A leitura de termorrefletância pode ser relacionada à temperatura por um coeficiente calibrado.

**B. Bomba óptica + prova óptica (pump–probe)**
- A bomba deposita energia e aquece a amostra pela absorção.
- A prova mede a alteração da refletância, sem ser tratada como fonte térmica relevante na hipótese adotada.
- Os dois feixes podem ter espectros, ângulos, polarizações e posições distintos.
- A energia da bomba e qualquer absorção relevante da prova entram no balanço térmico.

**C. Feixe único**
- A mesma iluminação aquece e fornece o sinal óptico observado.
- A potência absorvida precisa alimentar o campo térmico.
- A refletância e a absorção devem ser atualizadas de maneira consistente com temperatura, superfície e estado mecânico.
- Não interpretar o sinal refletido como leitura independente da fonte.

### 2.2 Fontes térmicas incluídas

A temperatura pode evoluir por:
- temperatura prescrita ou condição de contorno térmica;
- fluxo de calor ou aquecimento externo;
- absorção da bomba óptica;
- calor gerado por deformação plástica, somente em fase posterior e com parâmetro Taylor–Quinney validado.

A experiência não contém corrente DC nem aquecimento Joule. Esses mecanismos pertencem a combinações que incluem E.

### 2.3 Hipóteses iniciais e exclusões

- Sem mudança de fase, fusão, oxidação, recristalização, fluência ou dano na primeira versão.
- Sem eletroplasticidade, magneto-óptica ou mudança óptica induzida por campo elétrico.
- Mecânica quase estática na primeira versão; impactos e dinâmica estrutural exigem outro modelo.
- Temperatura e propriedades podem ser uniformes apenas se essa hipótese for declarada. Não substituir um campo espacial por uma média sem avaliar sua adequação.
- Deformação pequena e elasticidade linear são hipóteses de primeira etapa; grandes deformações exigem formulação consistente de deformação finita.
- O feixe de prova só pode ser considerado não aquecedor após verificar que sua potência absorvida é desprezível na escala do problema.

## 3. Uma única amostra e um único estado físico

Os domínios térmico, mecânico e óptico devem compartilhar:
- identidade da amostra, composição, fase e estado de tratamento;
- geometria de referência, geometria atual, orientação e textura;
- campo de temperatura e temperatura de referência;
- deformação total, elástica, plástica e térmica;
- apoios, contatos, interfaces e condições de contorno;
- superfície óptica, acabamento, rugosidade e camadas;
- parâmetros materiais, unidades, fontes e faixas de validade.

A temperatura que alimenta a mecânica e a óptica deve ser a mesma variável de estado, respeitando a resolução espacial necessária. Não usar uma temperatura para a expansão e outra, sem vínculo, para a refletância. A malha térmica, a malha mecânica e a superfície óptica podem ter discretizações diferentes, mas precisam compartilhar coordenadas, interpolação e estado temporal coerentes.

A superfície óptica não deve ser confundida com os centros atômicos da cena cristalina. A rede ajuda a explicar deslizamento; a óptica visível exige uma superfície contínua ou mesoscópica com escala e topografia definidas.

## 4. Caminho T → M: expansão, tensão e resposta mecânica

### 4.1 Deformação térmica

Para pequenas deformações e material isotrópico:

~~~text
εth = α(T) ΔT I
ΔT = T − Tref
~~~

Para α aproximadamente constante no intervalo:

~~~text
ΔL ≈ α L0 ΔT
~~~

Se α varia de modo relevante, calcular a deformação pela integral de α(T) no intervalo, em vez de extrapolar um valor único. Em materiais anisotrópicos, a expansão pode depender da direção cristalográfica; não assumir isotropia sem declarar.

### 4.2 Decomposição do estado de deformação

Na hipótese de pequenas deformações:

~~~text
ε = εe + εp + εth
σ = C(T) : εe
  = C(T) : (ε − εp − εth)
~~~

- ε: deformação total;
- εe: deformação elástica;
- εp: deformação plástica;
- εth: deformação térmica;
- C(T): tensor de rigidez, possivelmente dependente de temperatura;
- σ: tensor de tensão.

A tensão deve vir do equilíbrio mecânico e das condições de contorno, não de um fator visual associado ao nível de aquecimento.

### 4.3 Temperatura uniforme e restrições

Casos de referência:
- **Amostra livre + aquecimento uniforme:** expande; no ideal homogêneo, sem restrição, não surge tensão térmica apenas pela expansão.
- **Amostra totalmente restringida + aquecimento uniforme:** a expansão impedida gera tensão térmica.
- **Amostra livre + resfriamento uniforme:** contrai sem tensão térmica no caso ideal homogêneo.
- **Amostra restringida + resfriamento uniforme:** a contração impedida pode gerar tensão trativa.
- **Gradiente térmico:** regiões tentam expandir em quantidades diferentes; compatibilidade, geometria e apoios podem gerar tensões e curvatura mesmo sem uma trava externa simples.

Para uma barra uniaxial homogênea, com propriedades constantes e expansão axial totalmente impedida:

~~~text
σ = −E α ΔT
~~~

É um caso analítico de validação, não uma fórmula universal para restrições parciais ou corpos tridimensionais.

### 4.4 Resposta mecânica dependente de temperatura

Propriedades que podem depender de T:
- módulo e tensor de elasticidade C(T);
- coeficiente de expansão α(T);
- limite de escoamento σy(T);
- tensão crítica de deslizamento τc(T, taxa, microestrutura);
- encruamento e resposta plástica;
- condutividade térmica k(T), capacidade térmica cp(T) e densidade ρ(T), no domínio térmico.

A tendência geral de redução dos módulos elásticos com temperatura não é universal: revisões de cristais cúbicos registram também comportamentos anômalos em metais específicos. Os dados devem ser por material, fase, orientação e faixa. Não aplicar uma curva genérica a todos os metais. [Epishin e Lisovenko, publicado em 2025 e atualizado em 2026](https://doi.org/10.1134/S0025654425602721).

**Regra:** aumento de temperatura não significa automaticamente que a amostra amolece, escoa ou fica mais dúctil. O sinal e a magnitude dependem do material, da fase, da taxa, da microestrutura e do intervalo térmico.

### 4.5 Elástico, plástico e irreversibilidade

- Expansão térmica reversível deve desaparecer quando T retorna a Tref, se não houve transformação ou dano.
- Deformação elástica deve retornar quando carga e restrições são removidas, de acordo com o modelo.
- Deformação plástica permanece após descarregar.
- Mudança permanente por oxidação, recristalização, fluência ou fase fica fora do primeiro modelo e exige dados próprios.
- Não representar temperatura elevada como deslizamento automático: a tensão resolvida deve ser comparada a um critério material dependente de temperatura.

## 5. Caminho T → O: resposta óptica e termorrefletância

### 5.1 Resposta espectral dependente da temperatura

A resposta óptica do metal deve ser descrita por parâmetros adequados ao regime espectral, como:

~~~text
N(λ,T) = n(λ,T) + i κ(λ,T)
ε̃(ω,T)
σ̃(ω,T)
~~~

A refletância depende desses parâmetros e também da incidência, polarização, superfície, camadas e temperatura. Não usar a condutividade térmica ou a condutividade elétrica DC como substitutos das constantes ópticas.

### 5.2 Coeficiente de termorrefletância

Para pequenas variações em torno de uma temperatura de referência T0:

~~~text
CTR(λ,T0) = (1/R) (∂R/∂T)|λ,T0
ΔR/R ≈ CTR(λ,T0) ΔT
~~~

CTR tem unidade K⁻¹ e depende do material/amostra, comprimento de onda, temperatura de referência, preparação, superfície e configuração óptica. O sinal pode ser positivo ou negativo. A relação linear só deve ser usada dentro da faixa em que o coeficiente permaneça aproximadamente constante.

Para excursões térmicas maiores, use curvas R(λ,T), n(λ,T), κ(λ,T) ou ε̃(ω,T) validadas na faixa. Não acumular incrementos lineares fora de sua validade.

### 5.3 Evidência experimental e calibração

Wilson et al. mediram a dependência térmica da refletividade de 15 elementos metálicos em 1,03 μm e de filmes metálicos numa faixa espectral de 0,4 a 1,6 μm, demonstrando que a sensibilidade depende do material e do comprimento de onda. [Wilson et al., 2012](https://doi.org/10.1364/OE.20.028829).

Favaloro, Bahk e Shakouri mediram coeficientes de termorrefletância em ouro, platina e alumínio em temperaturas elevadas e analisaram o efeito de passivação. Isso reforça que composição da superfície e camadas alteram a calibração. [Favaloro et al., 2015](https://doi.org/10.1063/1.4907354).

Um guia instrumental de FDTR publicado em 2024 destaca que CTR depende do comprimento de onda, temperatura, processamento e rugosidade superficial. [Review of Scientific Instruments, 2024](https://pubs.aip.org/aip/rsi/article/95/10/103006/3316821/An-instrumentation-guide-to-measuring-thermal-conductivity-using-frequency-domain-thermoreflectance).

**Decisão:** CTR não é uma constante universal por elemento químico. O cadastro precisa identificar amostra, superfície, λ, T0, ângulo, polarização, método e incerteza.

## 6. Caminho T + M → O: geometria da superfície e reflexão

### 6.1 Uma transformação mecânica comum

A superfície óptica deve ser derivada da geometria que já inclui expansão térmica, deformação elástica e deformação plástica. Não executar uma transformação térmica na cena e outra independente na óptica, sobrescrevendo coordenadas.

Para uma transformação material x = φ(X), com gradiente F = ∂x/∂X, a normal da superfície pode ser atualizada por:

~~~text
n = normalize(F⁻ᵀ N)
~~~

N é a normal de referência e n é a normal atual. A normal deve ser recalculada no ponto de incidência. A relação deve ser usada com transformação regular e orientação consistente.

### 6.2 Reflexão especular

Com a convenção vetorial de incidência definida:

~~~text
r = i − 2(i · n)n
~~~

A lei dos ângulos iguais vale em relação à normal local atual. A expansão uniforme e isotrópica de uma placa plana livre aumenta suas dimensões, mas não precisa mudar a direção da normal. Gradientes, anisotropia, curvatura, apoios e carregamento mecânico podem inclinar ou deformar a superfície e alterar a direção refletida.

### 6.3 Separar geometria de termorrefletância

A leitura óptica pode conter:
- alteração geométrica do raio refletido;
- mudança da refletância intrínseca por temperatura;
- mudança da resposta intrínseca por tensão/deformação, somente quando dados elasto-ópticos estiverem disponíveis;
- espalhamento por rugosidade/topografia;
- efeitos instrumentais, como desalinhamento, foco e variação da área iluminada.

Uma mudança de intensidade detectada não pode ser convertida em ΔT apenas com CTR se a área iluminada, a normal, o ângulo, a polarização, a superfície ou o foco também mudaram sem correção.

### 6.4 Topografia e BRDF

Se a deformação gerar topografia, a óptica precisa de uma superfície contínua com alturas e normais locais em escala compatível com λ. Para uma superfície rugosa, a distribuição angular pode exigir BRDF ou modelo microfacetado. Não inferir rugosidade a partir de deslocamentos atômicos ou deslizamentos internos que não emergem na superfície livre.

A superfície inicial, topografia, direção das estrias, Sa/Sq e comprimento de correlação devem vir de medição, modelo ou hipótese didática claramente identificada. Não inventar dados por metal.

### 6.5 Validação em sistemas ópticos

A relação entre deformação térmica da superfície e desempenho óptico é observável: Languy et al. compararam deformações experimentais de um espelho sob gradientes térmicos, medidas por interferometria de speckle, com simulação multifísica e erros de frente de onda. O trabalho é um exemplo metodológico de validação conjunta da forma e do desempenho óptico, não um conjunto de parâmetros transferível ao SILM. [Languy et al., 2018](https://doi.org/10.1364/AO.57.006982).

## 7. Caminho O → T: absorção fototérmica

### 7.1 Balanço da potência óptica

A energia incidente deve ser separada em energia refletida, absorvida, transmitida e, quando necessário, espalhada fora da abertura de medição:

~~~text
Pinc = Pref + Pabs + Ptrans + Pscatter
~~~

A convenção adotada para cada parcela deve ser consistente. Quando R, A e Topt forem definidos como frações hemisféricas completas, a conservação usual é:

~~~text
R + A + Topt = 1
~~~

Para amostra metálica opaca, Topt pode ser desprezível apenas quando isso for sustentado pela amostra e pelo regime espectral.

### 7.2 Fonte de calor

A fonte fototérmica total pode ser obtida por:

~~~text
Pabs = A(λ,T,ε,u,surface) Pinc
~~~

Se houver perfil espacial de absorção, a energia deve ser distribuída no volume ou na camada correspondente, sem presumir absorção uniforme se houver profundidade de penetração relevante.

Há duas rotas equivalentes de contabilização:
- usar absorptância A multiplicada pela potência incidente e atribuir a distribuição espacial com modelo próprio;
- integrar a perda eletromagnética local do campo óptico.

**Não usar as duas rotas para contar duas vezes a mesma energia absorvida.**

### 7.3 Bomba e prova

- A bomba cria a fonte térmica.
- A prova mede a refletância alterada pela temperatura e pela superfície.
- A absorção da prova deve ser contabilizada se não for desprezível.
- Feixe único exige que a fonte e a leitura sejam modeladas no mesmo campo de energia, sem circularidade.
- A termorrefletância é uma técnica de leitura não invasiva em condições adequadas, mas exige calibração e interpretação compatíveis com a geometria e o modelo térmico. O método TDTR e suas variantes usam pump–probe para extrair propriedades térmicas. [Mohan et al., 2025](https://doi.org/10.1038/s43586-025-00425-8).

## 8. Caminho M → T: dissipação plástica como extensão opcional

A deformação plástica pode converter parte do trabalho mecânico em calor e armazenar outra parte em alterações microestruturais. Uma forma simplificada da fonte volumétrica é:

~~~text
q̇plastic = β σ : ε̇p
~~~

β é o coeficiente de Taylor–Quinney, e σ:ε̇p é a potência plástica por volume. A contribuição depende de material, deformação, taxa, modo de carregamento e microestrutura.

Uma revisão de 2025 destaca a variabilidade do coeficiente e os cuidados necessários para comparar medidas integrais e diferenciais. Não fixar β = 0,9 para todo metal ou condição. [Nassar, 2025](https://doi.org/10.1098/rspa.2024.0139).

**Decisão:** o calor de deformação plástica fica desligado na primeira implementação T+M+O. Só poderá ser ativado com β calibrado, intervalo de validade e balanço entre trabalho aplicado, calor dissipado e energia armazenada. O trabalho plástico disponível não pode ser contado simultaneamente como calor integral e energia armazenada.

## 9. Equações integradas e balanços

### 9.1 Equação térmica de referência

Para pequenas deformações, propriedades contínuas e sem mudança de fase, uma forma de balanço térmico é:

~~~text
ρ cp ∂T/∂t = ∇·(k ∇T)
              + q̇ext + q̇opt + q̇plastic
~~~

- q̇ext: fonte volumétrica externa, se houver;
- q̇opt: energia óptica absorvida por volume e tempo;
- q̇plastic: calor de deformação plástica, opcional;
- k, cp e ρ: propriedades térmicas com dependência de T quando necessário.

Fluxos, temperaturas prescritas, convecção e radiação devem entrar como condições de contorno, não ser somados de novo como fontes volumétricas. Em formulações termoelásticas completas, incluir de modo consistente o acoplamento reversível entre trabalho mecânico e energia térmica; não misturar essa parcela com q̇plastic.

### 9.2 Equilíbrio mecânico

Para a primeira versão quase estática:

~~~text
div σ + b = 0
ε = εe + εp + εth(T)
σ = C(T) : εe
~~~

A solução depende de geometria, apoios, carga, propriedades dependentes de temperatura e critérios constitutivos.

### 9.3 Domínio óptico

A resposta deve usar:
- a geometria e as normais atuais;
- n(λ,T), κ(λ,T) ou ε̃(ω,T);
- parâmetros de camada, substrato e superfície, quando aplicável;
- ângulo, polarização e espectro da fonte;
- topografia/BRDF quando for necessária.

A atualização da absorptância deve ser consistente com a refletância usada para alimentar q̇opt. Quando o estado mecânico ou térmico altera A, a nova fonte térmica deve refletir essa mudança no passo seguinte ou numa iteração convergida.

### 9.4 Fechamento dos balanços

A cada passo, verificar:
- **mecânico:** trabalho externo, energia elástica armazenada e dissipação plástica, sem duplicação;
- **óptico:** potência incidente e parcelas refletida, absorvida, transmitida/espalhada;
- **térmico:** energia interna armazenada, fontes, fluxos de saída e perdas de fronteira;
- **óptico-mecânico:** a mesma superfície atual alimenta raios, normais e área iluminada.

## 10. Sequência integrada de cálculo

Uma implementação futura deve seguir uma sequência temporal única:

1. Carregar amostra, fase, geometria, superfície, parâmetros e temperatura de referência.
2. Aplicar condições térmicas iniciais/de fronteira e identificar a origem do aquecimento.
3. Calcular a distribuição de temperatura Tⁿ.
4. Atualizar deformação térmica εth(Tⁿ) e propriedades mecânicas C(T), σy(T), α(T), somente se parametrizadas.
5. Resolver equilíbrio mecânico com apoios e carregamento.
6. Atualizar deformação total, elástica, plástica e geometria atual da amostra.
7. Atualizar a superfície óptica, suas normais, área iluminada e topografia.
8. Calcular refletância/absorptância óptica com parâmetros espectrais dependentes de T e condição superficial.
9. Atualizar a fonte térmica óptica q̇opt, se a iluminação estiver no modo bomba ou feixe único.
10. Atualizar q̇plastic somente se o modelo e β estiverem homologados.
11. Avançar o campo térmico, fechar balanços e repetir iterações quando o acoplamento entre A, T e geometria não puder ser tratado como fraco.
12. Apresentar os resultados com a separação entre parcela geométrica, térmica intrínseca, mecânica e fototérmica.

O primeiro modelo pode usar acoplamento sequencial fraco, mas precisa comparar com solução iterativa em condições de maior realimentação. O passo de tempo deve resolver a escala térmica e mecânica, não ser igualado à taxa de quadros da animação.

## 11. Contrato conceitual do estado T+M+O

~~~ts
type ThermalMode = "prescribed-temperature" | "temperature-gradient" | "external-source";
type MechanicalMode = "compression" | "tension";
type MechanicalControl = "force-stress" | "displacement-strain";
type ConstraintMode = "free" | "supported" | "restrained";
type OpticalMode = "probe" | "pump-probe" | "single-beam";
type EvidenceMode = "qualitative" | "parameterized" | "quantitative";

interface ThermoMechOpticalExperiment {
  sample: {
    materialId: string;
    phase: string;
    geometryId: string;
    surfaceModelId: string;
    temperatureReferenceK?: number;
  };
  thermal: {
    mode: ThermalMode;
    initialTemperatureK?: number;
    boundaryModelId?: string;
    sourceModelId?: string;
  };
  mechanical: {
    mode: MechanicalMode;
    control: MechanicalControl;
    constraint: ConstraintMode;
    value?: number;
    unit?: string;
    direction: [number, number, number];
  };
  optics: {
    mode: OpticalMode;
    wavelengthNm?: number;
    irradianceWm2?: number;
    incidenceDeg?: number;
    polarization?: "s" | "p" | "unpolarized";
    pumpSourceId?: string;
    probeSourceId?: string;
    opticalDatasetId?: string;
    thermoreflectanceDatasetId?: string;
  };
  plasticHeat: {
    enabled: false | true;
    beta?: number;
    calibrationSource?: string;
  };
  evidenceMode: EvidenceMode;
  results: {
    temperatureField?: string;
    thermalExpansion?: string;
    displacementField?: string;
    stressField?: string;
    reflectedDirection?: [number, number, number];
    reflectance?: number;
    absorptance?: number;
    absorbedPowerW?: number;
  };
}
~~~

Este é um contrato conceitual. Entradas, condições de contorno, variáveis de estado e resultados derivados devem permanecer separados. Cada número físico exige unidade, fonte, faixa e condição de validade. Se o modo for qualitativo, não apresentar valores em K, °C, MPa ou W sem calibração.

## 12. Auditoria da implementação atual do SILM

### 12.1 Motor térmico — `domain/silm/thermal.js`
- Propaga calor por grafo de vizinhos da estrutura cristalina.
- Usa coeficiente didático comum D = 0,45.
- O tempo é o tempo da animação, não tempo físico do metal.
- Não possui perdas para ambiente nem propriedades térmicas calibradas por metal.
- A temperatura é normalizada de 0 a 1.
- Não recebe fonte óptica absorvida nem perfil espacial de absorção.
- O controlador representa estados transitórios e não resolve uma amostra contínua macroscópica.

### 12.2 Motor mecânico — `domain/silm/deformation.js`
- Representa sistemas de deslizamento CFC, CCC e HC.
- Usa limiar YIELD = 0,5 e deformação elástica ilustrativa de até 6%.
- Limita a representação a quatro deslizamentos.
- Não usa C(T), α(T), curva tensão–deformação(T) ou critério de escoamento por metal.
- Modifica coordenadas da rede cristalina, sem corpo de prova macroscópico ou malha de superfície independente.

### 12.3 Motor óptico — `domain/silm/drive.js`
- Usa um ângulo de incidência transitório e retorna ângulos iguais para reflexão.
- A normal é global/implícita e não é atualizada com deformação ou expansão térmica.
- Não calcula R(λ,T), n(λ,T), κ(λ,T), Fresnel metálico, absorptância ou BRDF.
- Não separa feixe de bomba e feixe de prova.

### 12.4 Conclusão da auditoria

O SILM possui demonstrações didáticas isoladas de propagação térmica, deformação cristalina e reflexão geométrica. Ainda não possui os três domínios ligados à mesma amostra física, nem parâmetros para afirmar uma simulação quantitativa T+M+O.

A nova combinação deve permanecer como especificação e não pode ser habilitada apenas por selecionar três ícones.

## 13. Condições da experiência e resultados

### 13.1 Entradas

| Família | Condições mínimas |
|---|---|
| Amostra | metal/composição/fase, orientação, geometria, superfície, camadas e temperatura de referência |
| Térmica | temperatura inicial, fonte/fluxo/temperatura prescrita, propriedades térmicas e fronteiras |
| Mecânica | tração ou compressão; força/tensão ou deslocamento/deformação; apoios e direção |
| Óptica | λ/espectro, irradiância/potência, área do feixe, ângulo, polarização e modo probe/pump |
| Termorrefletância | CTR ou R(λ,T) calibrada para a amostra e a condição de leitura |
| Topografia | superfície, rugosidade, escala e distribuição de normais, quando modeladas |
| Calor plástico | β calibrado e estado plástico, desligado por padrão |

### 13.2 Resultados térmicos e mecânicos

- temperatura local, média e máxima;
- gradiente térmico;
- expansão/contração térmica;
- deslocamento e deformação total;
- parcelas térmica, elástica e plástica;
- tensão/reação de apoios, quando calculável;
- contribuição de calor por fonte externa, absorção e trabalho plástico, sem duplicação.

### 13.3 Resultados ópticos

- normal local e direção refletida;
- refletância espectral ou variação relativa ΔR/R;
- parcela geométrica da mudança do sinal;
- parcela intrínseca termorrefletiva;
- distribuição angular por topografia/BRDF, se houver dados;
- potência incidente, refletida, absorvida e transmitida;
- incerteza e faixa de validade.

### 13.4 Organização da interface

Manter o painel único de condições. Os ícones apenas selecionam fenômenos. Os campos são apresentados por família:
- **Térmica:** temperatura, gradiente, fonte e dissipação.
- **Mecânica:** modo, carga/controle, apoios e direção.
- **Óptica:** bomba/prova/feixe único, espectro, irradiância, ângulo e polarização.

Os resultados devem separar visualmente:
- forma/normal/reflexão;
- temperatura e resposta termorrefletiva;
- tensão e deformação;
- fontes e balanços de energia.

Não criar um submenu contextual independente para cada parâmetro metálico.

## 14. Critérios de aceite

### 14.1 Térmico-mecânicos
- [ ] ΔT = 0 não introduz expansão térmica adicional.
- [ ] Amostra homogênea livre sob aquecimento uniforme expande sem tensão térmica espúria.
- [ ] Restrição total produz o sinal correto de tensão térmica no caso analítico 1D.
- [ ] Gradiente térmico e apoios podem gerar curvatura/tensão compatíveis com a geometria.
- [ ] α(T) e C(T) só variam quando houver dados por material e faixa.
- [ ] A resposta mecânica não muda automaticamente só porque a cena está mais quente.
- [ ] Deformação elástica retorna; deformação plástica permanece.

### 14.2 Termo-ópticos
- [ ] Com ΔT = 0, CTR não produz alteração intrínseca de refletância.
- [ ] O sinal e a magnitude de CTR vêm de dados calibrados da amostra e da faixa.
- [ ] Aquecimento não aumenta nem reduz universalmente a refletância.
- [ ] Mudança geométrica de incidência/reflexão não é confundida com mudança intrínseca de R.
- [ ] CTR não é extrapolado fora da faixa calibrada.
- [ ] Superfície, polarização, ângulo e comprimento de onda permanecem identificados.

### 14.3 Geometria e reflexão
- [ ] A superfície óptica usa a mesma transformação mecânica da amostra.
- [ ] Para expansão isotrópica plana livre, a normal não gira artificialmente.
- [ ] Para gradiente ou restrição, as normais acompanham a deformação calculada.
- [ ] A reflexão usa a normal local atual.
- [ ] Rugosidade não é inventada a partir da rede atômica.

### 14.4 Energia e modos ópticos
- [ ] R + A + Topt = 1 quando essas parcelas representam o balanço óptico completo.
- [ ] Só absorção vira fonte térmica.
- [ ] Absorptância × potência e perda EM local não contam a mesma energia duas vezes.
- [ ] O feixe de prova só é desprezado no balanço após justificar absorção desprezível.
- [ ] Bomba e prova têm potência, posição e espectro identificados.
- [ ] Feixe único inclui sua absorção no próprio balanço.
- [ ] Calor plástico é zero quando não há taxa de deformação plástica.
- [ ] O trabalho plástico não é contado duas vezes como calor e energia armazenada.

### 14.5 Integração e interface
- [ ] A mesma amostra, estado temporal e geometria atual alimentam os três domínios.
- [ ] O passo físico não é igualado ao passo de renderização sem justificativa.
- [ ] Acoplamento forte itera até convergência ou reporta a limitação do acoplamento fraco.
- [ ] Os estados livre, apoiado e restringido têm resultados distintos.
- [ ] Seleção por clique, Ctrl/Cmd e toque preserva a mesma semântica.
- [ ] Nenhuma combinação quantitativa é liberada sem dados e testes de domínio.

## 15. Fases de implementação

**Fase A — demonstração geométrica T+M+O**
- Temperatura uniforme normalizada.
- Condição mecânica livre ou restringida.
- Superfície contínua esquemática atualizada pela expansão/deformação.
- Normal e raio refletido calculados com a geometria atual.
- Sem unidades físicas nem alteração intrínseca de cor/refletância.

**Fase B — termoelasticidade parametrizada**
- Homologar α(T), C(T), cp(T), k(T), ρ e fronteiras.
- Definir corpo de prova, apoios e campo de temperatura.
- Resolver deformação, deslocamento e tensão.
- Validar casos analíticos e medições.

**Fase C — termorrefletância**
- Homologar CTR(λ,T0) ou R(λ,T) para a amostra, superfície e configuração.
- Incluir calibração térmica e leitura óptica.
- Separar mudança de intensidade intrínseca de mudança geométrica.

**Fase D — bombeamento fototérmico**
- Definir espectro, potência, perfil espacial, R/A/Topt e profundidade de absorção.
- Distinguir bomba e prova ou modelar explicitamente o feixe único.
- Fechar balanço óptico e térmico.
- Atualizar a absorção quando T e geometria alterarem a resposta óptica.

**Fase E — termoplasticidade e dissipação plástica**
- Homologar curva mecânica dependente de T e critérios de plasticidade.
- Incluir calor plástico somente com β calibrado por material/estado/faixa.
- Separar energia armazenada de dissipação.

**Fase F — acoplamento integrado**
- Resolver T, M e O no mesmo estado espacial e temporal.
- Iterar realimentação entre absorção, temperatura e geometria quando necessário.
- Validar forma da superfície, frente de onda/reflexão, campo térmico e resposta mecânica em dados de referência.

## 16. Decisões congeladas

1. A combinação T+M+O usa uma única amostra e uma geometria atual compartilhada.
2. A temperatura pode atuar na mecânica por expansão, tensão térmica e leis constitutivas dependentes de T; não implica amolecimento universal.
3. A temperatura pode alterar a refletância intrínseca, mas CTR/R(λ,T) deve ser específico de material, amostra, superfície e λ.
4. A geometria térmica/mecânica e a termorrefletância são contribuições ópticas distintas.
5. A luz só gera calor na parcela absorvida; bomba e prova devem ser separadas.
6. O calor plástico é uma fonte futura opcional e exige coeficiente calibrado, sem valor universal.
7. A primeira etapa não implementa mudanças de fase, oxidação, fluência, dano nem recristalização.
8. A especificação não autoriza ativação quantitativa antes de homologar parâmetros, superfície, condições de contorno e balanços.

## 17. Referências

1. Wilson, R. B.; Apgar, B. A.; Martin, L. W.; Cahill, D. G. “Thermoreflectance of metal transducers for optical pump-probe studies of thermal properties”. *Optics Express*, 20(27), 28829–28838, 2012. [DOI 10.1364/OE.20.028829](https://doi.org/10.1364/OE.20.028829). Dependência espectral da termorrefletância em metais.
2. Favaloro, T.; Bahk, J.-H.; Shakouri, A. “Characterization of the temperature dependence of the thermoreflectance coefficient for conductive thin films”. *Review of Scientific Instruments*, 86, 024903, 2015. [DOI 10.1063/1.4907354](https://doi.org/10.1063/1.4907354). Calibração de CTR em ouro, platina e alumínio em temperaturas elevadas.
3. “An instrumentation guide to measuring thermal conductivity using frequency domain thermoreflectance (FDTR)”. *Review of Scientific Instruments*, 95, 103006, 2024. [AIP Publishing](https://pubs.aip.org/aip/rsi/article/95/10/103006/3316821/An-instrumentation-guide-to-measuring-thermal-conductivity-using-frequency-domain-thermoreflectance). Sensibilidade do CTR a λ, temperatura, processamento e rugosidade.
4. Mohan, R. et al. “Time-domain thermoreflectance”. *Nature Reviews Methods Primers*, 5, 55, 2025. [DOI 10.1038/s43586-025-00425-8](https://doi.org/10.1038/s43586-025-00425-8). Princípios e aplicações de pump–probe para propriedades térmicas.
5. Epishin, A. I.; Lisovenko, D. S. “Temperature Dependences of Elastic Properties of Cubic Crystals of Simple Substances. Review”. *Mechanics of Solids*, 60, 3367–3382, 2025. [DOI 10.1134/S0025654425602721](https://doi.org/10.1134/S0025654425602721). Dependência térmica e anomalias de propriedades elásticas em cristais cúbicos.
6. Languy, F. et al. “Space mirror deformation: from thermo-mechanical measurements by speckle interferometry to optical comparison with multiphysics simulation”. *Applied Optics*, 57(24), 6982–6989, 2018. [DOI 10.1364/AO.57.006982](https://doi.org/10.1364/AO.57.006982). Validação de superfície óptica deformada por gradiente térmico.
7. Nassar, O. “On the conversion of plastic work into heat in metals”. *Proceedings of the Royal Society A*, 481(2308), 20240139, 2025. [DOI 10.1098/rspa.2024.0139](https://doi.org/10.1098/rspa.2024.0139). Revisão da variabilidade e medição do coeficiente Taylor–Quinney.
8. “Progress in Plastic Work–Heat Conversion of Metallic Crystals”. *Crystals*, 15(2), 164, 2025. [DOI 10.3390/cryst15020164](https://doi.org/10.3390/cryst15020164). Revisão de conversão de trabalho plástico em calor.
9. SILM — [Especificação T+M](ESPECIFICACAO-ACOPLAMENTO-TERMOMECANICO.md), [Especificação T+O](ESPECIFICACAO-ACOPLAMENTO-TERMO-OPTICO.md) e [Especificação M+O](ESPECIFICACAO-ACOPLAMENTO-MECANICO-OPTICO.md). Regras internas de expansão, termorrefletância, absorção e geometria óptica.
