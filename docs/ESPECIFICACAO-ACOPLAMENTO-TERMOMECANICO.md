# SILM — Especificação do acoplamento térmico-mecânico (T+M)

**Status:** especificação científica e operacional — não implementada  
**Branch:** study/silm-coupled-properties-transport-20261104  
**Documentos de base:**
- ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md
- MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md
- ESPECIFICACAO-ACOPLAMENTO-ELETROTERMICO.md

---

## 1. Objetivo

Definir como a temperatura afeta a geometria, as tensões e a resposta à deformação de uma amostra metálica. O acoplamento T+M deve relacionar o campo de temperatura à deformação térmica e à resposta mecânica, com condições de contorno explícitas.

O modelo deve distinguir três fenômenos:

1. **Expansão térmica:** mudança dimensional causada pela temperatura.
2. **Tensão térmica:** tensão interna que aparece quando a expansão ou contração é restringida, total ou parcialmente, ou quando existem gradientes térmicos incompatíveis com a geometria e os apoios.
3. **Resposta mecânica dependente da temperatura:** mudança das propriedades elásticas e plásticas, incluindo resistência ao escoamento e ao deslizamento, quando houver dados específicos.

A primeira experiência T+M deve começar com expansão térmica livre e restringida. A dependência da plasticidade com a temperatura será um segundo nível. O aquecimento gerado pelo próprio trabalho plástico é um terceiro nível de acoplamento reverso, não deve ser presumido como incluído.

## 2. O que o acoplamento deve demonstrar

O comportamento básico pode ser organizado em quatro casos:

| Temperatura | Condição mecânica | Resultado esperado |
|---|---|---|
| Uniforme aumenta | Amostra livre | Dimensões aumentam; tensão térmica idealmente nula |
| Uniforme aumenta | Expansão totalmente impedida | Tensão térmica compressiva |
| Uniforme diminui | Amostra livre | Dimensões diminuem; tensão térmica idealmente nula |
| Uniforme diminui | Contração totalmente impedida | Tensão térmica trativa |

Com gradiente de temperatura, diferentes regiões tentam expandir ou contrair em quantidades diferentes. A compatibilidade entre regiões pode produzir tensões internas mesmo quando não há uma trava externa evidente. A geometria, os apoios e a distribuição de temperatura são determinantes.

**Não representar aquecimento como “amolecimento automático” da rede.** Expansão, tensão térmica e mudança da resistência à deformação são efeitos diferentes, que precisam aparecer como resultados distintos.

## 3. Modelo termoelástico de referência

### 3.1 Deformação térmica

Para material isotrópico e expansão linear pequena:

```
εth = α ΔT I
ΔT = T − Tref
```

- εth: tensor de deformação térmica, adimensional.
- α: coeficiente linear de expansão térmica, K⁻¹.
- Tref: temperatura de referência na qual o estado inicial é considerado sem tensão.
- I: tensor identidade.

Para temperatura uniforme e α constante, uma dimensão L varia aproximadamente por:

```
ΔL = α L ΔT
```

Se α depender significativamente da temperatura, não usar uma constante fora da faixa validada; a deformação deve ser calculada pela integração da expansão incremental:

```
εth(T) = integral de Tref até T de α(θ) dθ
```

Em materiais anisotrópicos, a expansão pode ter coeficientes diferentes por direção. A primeira versão deve declarar a hipótese isotrópica em vez de fingir representar anisotropia cristalográfica.

### 3.2 Decomposição da deformação

O modelo deve separar deformação total, elástica, plástica e térmica:

```
ε = εe + εp + εth
```

Na hipótese de pequenas deformações, elasticidade linear:

```
σ = C(T) : (ε − εp − εth)
```

C(T) é o tensor de rigidez dependente da temperatura. A equação mostra que a tensão depende da parcela de deformação que não é acomodada pela expansão térmica nem pela deformação plástica.

### 3.3 Equilíbrio mecânico

Em condição quase estática:

```
div σ + b = 0
```

b representa força de corpo por unidade de volume. A implementação inicial pode assumir b = 0 e resolver a compatibilidade e o equilíbrio definidos pelas condições de contorno.

### 3.4 Exemplo de barra totalmente restringida

Para uma barra uniaxial, homogênea, com propriedades constantes e deslocamento axial impedido nas duas extremidades:

```
εtotal = 0
σ = −E α ΔT
```

Com aquecimento (ΔT positivo), o resultado é compressivo. Com resfriamento (ΔT negativo), é trativo. Esta expressão é um teste de referência unidimensional, não uma fórmula universal para geometrias tridimensionais ou restrições parciais.

Em um sólido isotrópico 3D totalmente impedido, o estado de tensão depende das constantes elásticas e da condição de restrição tridimensional; não reaproveitar a expressão uniaxial sem derivação.

## 4. Condições de contorno mecânicas

A interface deve escolher um modo de controle por experiência: força/tensão OU deslocamento/deformação prescrita. Não tratar ambos como entradas independentes no mesmo grau de liberdade.

| Condição | Significado | Resultado observado |
|---|---|---|
| Livre | Sem restrição de movimento relevante | Expansão/contração térmica sem tensão apenas no caso ideal uniforme e livre |
| Apoiada | Movimento limitado em direções/pontos definidos | Tensões dependem da geometria e das restrições |
| Totalmente restringida | Expansão/contração impedida | Tensões térmicas máximas para a idealização adotada |
| Força/tensão prescrita | Carga mecânica imposta | Deslocamento e deformação como resposta |
| Deslocamento/deformação prescrita | Cinemática imposta | Força/reação e tensão como resposta |

A interface deve permitir definir onde os apoios atuam e quais componentes do movimento são restringidas. Um simples estado “fixo” para todos os centros pode criar sobre-restrição e tensões artificiais; a definição de apoios precisa ser geometricamente coerente.

A temperatura também precisa de condição de contorno térmica e temperatura inicial. Na primeira versão T+M, o campo térmico pode vir do módulo térmico existente ou de uma temperatura uniforme didática, mas a origem deve ser identificada.

## 5. Resposta plástica e deslizamento cristalino dependentes da temperatura

A expansão térmica pode ser modelada antes da plasticidade. Para afirmar que a temperatura altera o início ou a progressão do deslizamento, é necessário um modelo constitutivo dependente da temperatura e dos dados do material.

### 5.1 Nível cristalográfico

Em um sistema de deslizamento com direção unitária s e normal unitária n, a tensão resolvida de cisalhamento pode ser expressa por:

```
τRSS = s · σ · n
```

A ativação do deslizamento depende da tensão resolvida crítica do sistema:

```
|τRSS| ≥ τc(T, taxa de deformação, estado microestrutural)
```

τc não é um número universal. Para cada metal e fase cristalina, depende da temperatura, estrutura, composição, taxa de deformação e estado microestrutural. A orientação cristalográfica também determina quanto da tensão aplicada é resolvida no plano/direção de deslizamento.

O SILM pode continuar usando seus sistemas representativos:
- CFC: família {111}⟨110⟩;
- CCC: família {110}⟨111⟩;
- HC: deslizamento basal {0001}⟨11-20⟩.

Mas a experiência atual escolhe um sistema representativo e uma orientação de ensaio didática; não representa a competição completa entre todos os sistemas ativos de uma amostra real.

### 5.2 Propriedades que podem depender da temperatura

| Parâmetro | Efeito a modelar | Exigência |
|---|---|---|
| Módulo de elasticidade E(T) | Rigidez elástica e retorno após descarregar | Curva/dados por material e faixa |
| Limite de escoamento σy(T) | Início da deformação plástica | Curva ou modelo constitutivo validado |
| Tensão crítica de deslizamento τc(T) | Ativação dos sistemas cristalográficos | Dados/modelo por estrutura e material |
| Encruamento | Evolução da resistência após deformação | Dados de tensão–deformação e estado microestrutural |
| Ductilidade/alongamento | Capacidade de deformar antes da fratura | Ensaio e condição; não deduzir só da temperatura |
| Coeficiente de expansão α(T) | Expansão e tensões térmicas | Dado por faixa e direção |

A literatura mostra tendências de redução de módulo e resistência em várias ligas metálicas ao elevar a temperatura, mas a magnitude depende da liga, do processamento, do ensaio e da faixa térmica. Não aplicar fatores de redução de aço estrutural a todos os elementos. A base de dados deve trazer condições e fonte para cada material.

### 5.3 Regras para deformação reversível e permanente

- A expansão térmica deve ser removida quando a temperatura retorna a Tref, salvo deformação permanente gerada por plasticidade ou mudança de fase.
- A parte elástica deve retornar quando a carga/ restrição for removida, de acordo com o modelo.
- O deslizamento plástico permanece após descarregar.
- Aumentar a temperatura não deve automaticamente gerar deslizamento; a tensão resolvida e a resistência crítica devem ser comparadas.
- Não modelar fratura, fluência, recristalização ou transformação de fase sem modelos e dados próprios.

## 6. Acoplamento reverso: trabalho plástico convertido em calor

Quando ocorre deformação plástica, parte do trabalho plástico pode ser convertida em calor e parte fica armazenada na microestrutura, por exemplo em defeitos cristalinos. O efeito é conhecido por meio do coeficiente de Taylor–Quinney.

Uma forma simplificada é:

```
Qp = β σ : ε̇p
```

Qp é a taxa volumétrica de geração de calor por deformação plástica (W/m³), β representa a fração do trabalho plástico convertida em calor, σ:ε̇p é a potência plástica por volume.

**Não fixar β em 0,9 para todos os metais.** Revisão publicada em 2025 relata variações do coeficiente com deformação, taxa de deformação, modo de carregamento e microestrutura, e ressalta diferenças entre definições integral e diferencial. Para a primeira versão T+M, o calor plástico fica fora do escopo. Ele só será adicionado quando houver parâmetros calibrados e ensaios de referência.

O aquecimento Joule pertence ao acoplamento E+T. O calor de deformação plástica pertence ao retorno M→T. São fontes diferentes e devem ter campos de balanço separados.

## 7. Mapeamento para o SILM atual

A revisão do código de referência na main identificou:

### 7.1 Motor térmico atual
- Resolve propagação por grafo de vizinhos imediatos.
- Usa coeficiente didático D = 0,45 s⁻¹, igual para todos os metais.
- Usa passo de animação DT = 1/120 s.
- Não possui perdas para o ambiente.
- Temperatura é normalizada de 0 (ambiente) a 1 (fonte).
- A fonte mantém centros sob ela em nível máximo.
- Não há condutividade térmica, densidade e calor específico homologados por metal.

### 7.2 Motor mecânico atual
- Usa sistema de deslizamento representativo por estrutura.
- CFC: {111}⟨110⟩; CCC: {110}⟨111⟩; HC: {0001}⟨11-20⟩.
- Orienta a amostra para uma configuração didática favorável ao deslizamento.
- Tem limiar normalizado único YIELD = 0,5.
- Deformação elástica máxima ilustrativa EPS_YIELD = 0,06 (6%).
- Limita a representação a quatro deslizamentos.
- Não implementa encruamento, evolução de discordâncias individuais, fratura ou propriedades mecânicas específicas de cada metal.
- A carga é normalizada entre 0 e 1.

### 7.3 Consequência para T+M
Os dois motores atuais podem fornecer uma demonstração qualitativa coordenada, mas não têm parâmetros suficientes para calcular tensões térmicas em Pa, expansão em metros ou variação quantitativa do limite de escoamento por temperatura.

A primeira integração precisa preservar esses limites. D e YIELD atuais não podem ser reinterpretados como difusividade térmica ou tensão crítica real.

## 8. Experiência proposta na interface

A seleção de T + M deve abrir o painel único de condições, sem menus contextuais independentes por propriedade.

### 8.1 Condições térmicas
- Estado inicial e referência térmica.
- Temperatura uniforme OU gradiente térmico (não assumir os dois sem uma especificação de fronteira).
- Fonte: aquecimento externo ou campo térmico proveniente de outra experiência.
- Se o motor estiver no modo didático, usar escala normalizada, sem °C ou K aparentes.

### 8.2 Condições mecânicas
- Modo: compressão (maleabilidade) ou tração (ductilidade).
- Controle: força/tensão ou deslocamento/deformação.
- Restrição: livre, apoiada ou impedida.
- Direção e local de aplicação.
- Sistema cristalográfico ativo, quando aplicável.

Selecionar maleabilidade e ductilidade ao mesmo tempo não deve ser interpretado como duas animações de deformação sobrepostas. Isso exigiria um ensaio multiaxial com tensões, deformações e compatibilidade resolvidas conjuntamente; manter indisponível até esse modelo existir.

### 8.3 Resultados a mostrar
- Temperatura inicial, média e máxima (com unidades apenas se calibrado).
- Expansão térmica estimada.
- Deslocamento e deformação total.
- Parcela térmica, elástica e plástica, separadas.
- Tensão ou reação nos apoios, quando calculável.
- Estado de deslizamento cristalino.
- Identificação clara entre resposta qualitativa e quantitativa.

A visualização deve evidenciar separadamente:
1. mudança dimensional reversível por temperatura;
2. tensão/força de reação causada por restrição;
3. deformação mecânica elástica;
4. deslizamento plástico permanente.

## 9. Arquitetura e sequência de cálculo

O campo de temperatura e o estado mecânico devem ser independentes da renderização. Um ciclo conceitual para cada passo físico é:

1. Obter o campo Tⁿ e sua origem (inicial, fronteira ou fonte).
2. Calcular deformação térmica εth(Tⁿ) em relação a Tref.
3. Aplicar as condições de movimento/apoio e o carregamento prescrito.
4. Resolver equilíbrio/compatibilidade para deslocamento e tensão.
5. Verificar critério de escoamento/deslizamento, apenas se o modelo plástico estiver liberado.
6. Atualizar εp e variáveis internas se houver plasticidade.
7. Se calor plástico estiver habilitado em fase futura, calcular Qp e transferir a fonte para o motor térmico.
8. Verificar limites, estabilidade e balanços.
9. Atualizar visualização e leituras.

O acoplamento inicial pode ser sequencial unidirecional T→M: temperatura gera deformação térmica e altera os parâmetros mecânicos parametrizados. O retorno M→T fica desligado. A integração bidirecional só deve ocorrer depois de validar o calor plástico e seu balanço.

## 10. Estado conceitual da experiência

O contrato lógico deve distinguir as entradas, resultados e modelo:

    type ThermalBoundary = "uniform-temperature" | "temperature-gradient" | "external-source";
    type MechanicalMode = "compression" | "tension";
    type MechanicalControl = "force-stress" | "displacement-strain";
    type ConstraintMode = "free" | "supported" | "restrained";
    type MaterialMode = "qualitative" | "parameterized" | "quantitative";

    interface ThermoMechanicalExperiment {
      thermal: {
        boundary: ThermalBoundary;
        referenceTemperature?: number;
        initialTemperature?: number;
        unit?: "K" | "degC" | "normalized";
      };
      mechanical: {
        mode: MechanicalMode;
        control: MechanicalControl;
        constraint: ConstraintMode;
        value?: number;
        unit?: string;
        direction?: [number, number, number];
      };
      materialMode: MaterialMode;
      materialDataStatus: "verified" | "incomplete" | "didactic";
      results: {
        thermalStrain?: unknown;
        displacement?: unknown;
        stress?: unknown;
        elasticStrain?: unknown;
        plasticStrain?: unknown;
      };
    }

Este é um contrato conceitual, não uma interface de código pronta. Os campos, unidades e estados devem ser revisados com o esquema científico existente antes de implementação. Resultados derivados não devem ser armazenados como entradas do usuário.

## 11. Testes e critérios de aceitação

### 11.1 Expansão e tensão térmica
- [ ] Com ΔT = 0, não existe deformação térmica adicional.
- [ ] Expansão uniforme livre altera dimensões e não cria tensão térmica espúria.
- [ ] Barra totalmente restringida sob aquecimento uniforme gera tensão compressiva.
- [ ] Barra totalmente restringida sob resfriamento uniforme gera tensão trativa.
- [ ] O resultado da barra 1D coincide com σ = −E α ΔT para propriedades constantes.
- [ ] Um gradiente térmico pode produzir tensões internas compatíveis com geometria e apoios.
- [ ] Remover a restrição em regime elástico permite retorno da expansão impedida sem plasticidade residual.

### 11.2 Resposta mecânica dependente de T
- [ ] E(T) só muda quando há relação material definida.
- [ ] O limiar de escoamento/deslizamento só muda quando há dados/modelo para aquele metal e faixa.
- [ ] A orientação e o sistema de deslizamento são respeitados.
- [ ] A deformação elástica retorna ao retirar a carga.
- [ ] A deformação plástica permanece ao descarregar.
- [ ] O aquecimento, sozinho, não cria automaticamente deslizamento plástico.
- [ ] Não há extrapolação fora da faixa experimental.

### 11.3 Interface e estado
- [ ] Controle por força/tensão e por deslocamento/deformação são mutuamente exclusivos.
- [ ] Restrição livre, apoiada e total produzem condições distintas e identificáveis.
- [ ] Maleabilidade + ductilidade não executam duas deformações independentes sobrepostas.
- [ ] O painel mostra apenas condições relevantes à seleção.
- [ ] Modo qualitativo não usa unidades físicas não calibradas.
- [ ] Dados ausentes mantêm a propriedade como didática ou bloqueiam o cálculo quantitativo.
- [ ] Pausar animação não pausa ou avança indevidamente o tempo físico.
- [ ] Cancelar/reiniciar restaura entradas, deslocamentos e variáveis internas sem estado parcial.

### 11.4 Acoplamento reverso futuro
- [ ] Qp = β σ:ε̇p é zero quando não há potência plástica.
- [ ] O calor gerado é limitado pela energia plástica disponível.
- [ ] Energia armazenada e energia dissipada não são contadas duas vezes.
- [ ] β só é usado quando validado para material, faixa de deformação e taxa.
- [ ] O balanço de energia fecha com o fluxo térmico e as fontes existentes.

## 12. Fases de implementação

**Fase A — demonstração termoelástica qualitativa**
- Usar aquecimento uniforme normalizado.
- Alternar condição livre e restringida.
- Mostrar expansão e tensão apenas como indicação qualitativa.
- Não apresentar deslocamento em mm, temperatura em °C ou tensão em MPa.
- Validar o sinal físico e os estados de retorno.

**Fase B — termoelasticidade parametrizada**
- Homologar α(T), E(T), ν(T) e propriedades necessárias.
- Definir geometria e apoios calibrados.
- Resolver deslocamento, deformação e tensão com unidades físicas.
- Validar com casos analíticos de referência.

**Fase C — plasticidade dependente da temperatura**
- Homologar curvas tensão–deformação para material, fase, taxa e temperatura.
- Definir evolução do escoamento e encruamento.
- Relacionar temperatura a tensão crítica de deslizamento quando houver dados.
- Validar tração e compressão em condições equivalentes.

**Fase D — retorno mecânico para térmico**
- Medir/calibrar a fração de trabalho plástico convertida em calor.
- Implementar Qp sem duplicar fontes Joule ou externas.
- Validar casos quase-isotérmicos e quase-adiabáticos conforme taxa de deformação.

## 13. Decisões que precisam ser congeladas antes da implementação

1. A primeira demonstração T+M deve mostrar expansão livre versus expansão restringida, antes de ativar mudança de resistência ao deslizamento.
2. O campo de temperatura inicial será uniforme na primeira fase; gradiente espacial pode vir na etapa seguinte.
3. A primeira condição mecânica deve permitir selecionar explicitamente livre/restrita e um modo compressão OU tração.
4. O controle mecânico inicial deve escolher força/tensão ou deslocamento/deformação, não ambos.
5. A dependência do escoamento em temperatura só será habilitada por dados materiais homologados.
6. O acoplamento reverso de calor plástico fica fora da primeira versão e depende de dados de Taylor–Quinney.
7. A condição qualitativa do motor atual deve ser rotulada e não convertida em unidades físicas.

## 14. Referências consultadas

1. Callister, W. D.; Rethwisch, D. G. *Materials Science and Engineering: An Introduction*, 9ª ed., capítulo 19 — expansão térmica livre, expansão restringida e tensões térmicas. Consulta acadêmica: https://edisciplinas.usp.br/pluginfile.php/8800473/mod_resource/content/0/Callister%20-%20Materials%20Science%20and%20Engineering%20An%20Introduction%209th%20c2014%20txtbk.pdf
2. Dassault Systèmes, *Abaqus 2026 Documentation*, “Thermal Expansion” — deformação térmica e tensão em elementos restringidos: https://docs.software.vt.edu/abaqusv2026/English/SIMACAEMATRefMap/simamat-c-thermalexpan.htm
3. MIT, *Constitutive Equations*, módulo 3 — forma termoelástica σ = C:(ε − αΔθI): https://web.mit.edu/16.20/homepage/3_Constitutive/Constitutive_files/module_3_with_solutions.pdf
4. Nassar, O. “On the conversion of plastic work into heat in metals”, *Proceedings of the Royal Society A*, 481 (2308), 2025. DOI: 10.1098/rspa.2024.0139 — revisão do coeficiente Taylor–Quinney e sua dependência de deformação, taxa, carregamento e microestrutura.
5. Cordasco, D. et al. *Full-Field Measurement of the Taylor-Quinney Coefficient in Tension Tests of Ti-6Al-4V, Aluminum 2024-T351, and Inconel 718 at Various Strain Rates*, FAA Technical Report DOT/FAA/TCTT-20/40: https://rosap.ntl.bts.gov/view/dot/89370
6. “Mechanical properties of hot-rolled structural steels at elevated temperatures: A review”, *Fire Safety Journal*, 2020, DOI: 10.1016/j.firesaf.2020.103237 — dependência de propriedades mecânicas com temperatura e limites de generalização entre classes de aço.

**Decisão de segurança científica:** a primeira experiência T+M pode demonstrar expansão e restrição qualitativamente. Tensão quantitativa e alteração de escoamento só serão liberadas com parâmetros de material, geometria, condições de contorno e validação apropriados. O calor plástico permanece como extensão independente.
