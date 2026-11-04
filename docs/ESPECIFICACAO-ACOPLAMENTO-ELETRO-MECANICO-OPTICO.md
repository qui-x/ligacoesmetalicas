# SILM — Especificação do acoplamento eletro-mecânico-óptico (E+M+O)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Escopo:** deformação mecânica, transporte elétrico DC e resposta óptica da mesma amostra.  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETROMECANICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-MECANICO-OPTICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETRO-OPTICO.md`

---

## 1. Objetivo e decisão central

Definir como uma deformação aplicada a uma amostra metálica altera, de forma simultânea e rastreável:

1. a resposta elétrica DC, pela mudança da geometria e da microestrutura;
2. a resposta óptica, pela mudança da geometria/topografia da superfície;
3. opcionalmente, a resposta óptica intrínseca dependente de tensão/deformação, somente quando houver dados espectrais e elasto-ópticos específicos da amostra.

O encadeamento central é:

~~~text
                    ┌─ geometria L, A e contatos ──────┐
Mecânica (M) ────────┤                                  ├─ resposta elétrica DC (E)
                    └─ defeitos/microestrutura ─────────┘

                    ┌─ forma e normais da superfície ──┐
Mecânica (M) ────────┤                                  ├─ resposta óptica (O)
                    └─ resposta elasto-óptica ──────────┘
                       (opcional, com dados)

E DC e O são dois domínios de resposta distintos. A combinação não significa que a corrente contínua seja a fonte da luz, nem que a condutividade DC determine a refletância óptica.
~~~

**Decisão:** M é o elo comum. A mecânica modifica simultaneamente o caminho elétrico e a condição óptica da mesma amostra. Os efeitos geométricos devem ser separados dos efeitos intrínsecos do material.

A primeira demonstração pode ser geométrica e qualitativa. A simulação quantitativa exige geometria macroscópica calibrada, lei microestrutural para a resistividade, superfície óptica e dados espectrais válidos.

## 2. Escopo, hipóteses e exclusões

### 2.1 Incluído

- Tração **ou** compressão, selecionada como modo mecânico da experiência.
- Controle mecânico por força/tensão **ou** deslocamento/deformação.
- Controle elétrico por tensão **ou** corrente DC.
- Iluminação óptica independente, com comprimento de onda/espectro, ângulo e polarização definidos.
- Atualização coerente da geometria atual da amostra para o domínio elétrico e o óptico.
- Separação da contribuição geométrica e microestrutural à resistência.
- Mudança da direção especular pela normal local atualizada.
- Extensão elasto-óptica opcional quando houver coeficientes medidos/validados.

### 2.2 Hipótese térmica

A experiência E+M+O deve ser considerada **isotérmica controlada**. A temperatura precisa permanecer fixa, ser monitorada ou ter variação comprovadamente desprezível para a pergunta investigada.

A corrente elétrica dissipa potência (`P = V I`) e a luz pode ser absorvida. Esses efeitos não podem ser ignorados se alterarem a temperatura de modo relevante. Quando houver aquecimento Joule ou fototérmico significativo, a combinação correta passa a ser **E+T+M+O**, com balanço térmico e realimentação das propriedades.

### 2.3 Fora do escopo

- Eletroplasticidade ou alteração do limite de escoamento causada pela corrente.
- Aquecimento Joule como mecanismo da deformação.
- Aquecimento fototérmico, termorrefletância ou expansão térmica.
- Magnetorresistência e efeitos magneto-ópticos.
- Fratura, dano, fadiga ou mudança de fase sem modelos e dados próprios.
- Inferência de rugosidade a partir do número de deslizamentos visuais.
- Uso da condutividade DC para calcular constantes ópticas.
- Alteração automática da cor por simplesmente ativar deformação ou corrente.

## 3. A mesma amostra e o mesmo estado mecânico

Os três domínios precisam apontar para a **mesma amostra**, no mesmo instante e na mesma configuração deformada.

O contrato da amostra deve identificar:
- metal, composição, fase e estado de tratamento;
- estrutura cristalina, orientação e textura, quando relevantes;
- dimensões de referência, geometria atual e posição dos contatos;
- estado inicial e evolução da microestrutura;
- superfície óptica, orientação, acabamento e topografia;
- temperatura e condição de controle;
- fontes e faixas de validade de cada parâmetro.

Não é válido usar a geometria deformada para a reflexão e, ao mesmo tempo, manter uma geometria elétrica de referência sem declarar que se trata de uma aproximação. Resultados de amostras diferentes ou condições distintas não podem ser apresentados como um único acoplamento.

## 4. Campo mecânico e transformação da geometria

### 4.1 Condições de carregamento

A primeira versão escolhe uma condição por eixo:
- compressão ou tração;
- força/tensão prescrita ou deslocamento/deformação prescrita.

Não prescrever simultaneamente força e deslocamento independentes no mesmo grau de liberdade. A condição de apoio, a direção do carregamento, a orientação dos terminais e a orientação da superfície óptica precisam ser registradas.

Maleabilidade e ductilidade continuam sendo modos de solicitação, não propriedades de condução independentes. Um ensaio multiaxial combinado fica para uma etapa posterior.

### 4.2 Configuração de referência e configuração atual

Considere a transformação material:

~~~text
x = φ(X)
F = ∂x/∂X
J = det(F)
~~~

- X: posição na configuração de referência;
- x: posição atual;
- F: gradiente de deformação;
- J: razão local de volume.

A geometria elétrica e a superfície óptica devem usar a configuração atualizada por essa transformação. O campo de deformação não pode ser aplicado duas vezes por dois motores separados.

A malha macroscópica da amostra deve ser distinta da rede de átomos usada na visualização cristalina. A rede ajuda a explicar deslizamento e defeitos; ela não substitui a geometria de uma barra, lâmina ou corpo de prova.

### 4.3 Elástico e plástico

- **Elástico:** ao remover a carga, a geometria deve retornar ao estado de referência dentro da tolerância do modelo.
- **Plástico:** a alteração geométrica permanente deve permanecer após descarregar.
- O estado microestrutural pode ter recuperação parcial, mas só deve ser atualizado por uma lei material declarada.
- Um deslizamento no interior do cristal não cria automaticamente um degrau na superfície.

## 5. Caminho M → E: resistência geométrica e resistividade intrínseca

### 5.1 Resistência não é resistividade

Para uma barra uniforme, com seção transversal A e comprimento L na direção da corrente:

~~~text
R = ρe L / A
σe = 1 / ρe
~~~

A deformação pode aumentar R sem mudar a resistividade intrínseca: em tração, L tende a aumentar e A tende a diminuir; em compressão longitudinal, L tende a diminuir e a área transversal tende a aumentar. O resultado quantitativo depende do estado de deformação transversal, do volume, da geometria e da orientação dos terminais.

Para uma amostra unidimensional de seção variável, uma aproximação ao longo do caminho é:

~~~text
Rgeom = ∫ ρe(s) / A(s) ds
~~~

Essa expressão não substitui a solução de um domínio tridimensional quando o caminho de corrente, a seção ou a distribuição de tensão forem não uniformes.

### 5.2 Separação das contribuições

A resistência medida deve ser decomposta conceitualmente em:

1. **geometria:** mudança de L, A, forma e distribuição do caminho;
2. **resistividade do material:** mudança de ρe pela temperatura, composição, fase, deformação e microestrutura;
3. **contatos:** resistência de contato e alterações de contato causadas por pressão, alinhamento, deslizamento ou perda de área real de contato.

A resistência de contato não deve ser absorvida silenciosamente na resistividade volumétrica. Na primeira experiência, contatos ideais podem ser assumidos, mas essa hipótese precisa estar visível.

Para pequenas variações na aproximação uniaxial uniforme:

~~~text
ΔR/R ≈ Δρe/ρe + ΔL/L − ΔA/A
~~~

Esta expressão é uma decomposição linearizada, não uma lei constitutiva completa para qualquer deformação.

### 5.3 Microestrutura e espalhamento eletrônico

A deformação plástica pode criar ou reorganizar discordâncias, lacunas e outros defeitos que modificam o espalhamento eletrônico. Uma forma de organização conceitual, quando a aproximação de Matthiessen for válida, é:

~~~text
ρe ≈ ρrede(T) + ρsolutos + ρprecipitados
      + ρdiscordâncias + ρlacunas + ρcontornos
~~~

A soma é aproximada. As parcelas podem interagir e não são universalmente independentes.

Há evidência experimental recente de que essas contribuições precisam ser distinguidas: em ferro puro, uma medição *in situ* publicada em 2026 observou aumento da parcela associada a lacunas durante a deformação e crescimento acentuado da contribuição atribuída a discordâncias após o escoamento. O resultado é específico do material, do protocolo e das condições do estudo; não fornece uma função universal para todos os metais. [Ueda et al., 2026](https://doi.org/10.2355/isijinternational.ISIJINT-2026-053).

Também há trabalhos de medição de resistividade *in situ* em ligas metálicas durante deformação plástica que demonstram dependência do caminho e do histórico de deformação. [Saberi et al., 2021](https://doi.org/10.1016/j.measurement.2021.109547).

**Regra para o SILM:** quantidade de deslizamentos na cena não é densidade de discordâncias em m⁻². Sem variável interna calibrada e relação material ρe(S), o resultado deve ser qualitativo e não pode exibir uma mudança numérica de resistividade como se fosse medida.

### 5.4 Solução elétrica

O domínio elétrico deve resolver:

~~~text
J = σe E
E = −∇V
∇·J = 0
~~~

Para material anisotrópico, σe deve poder ser tensorial; não assumir isotropia se composição, textura ou orientação exigirem outro tratamento.

Condição de contorno:
- tensão/potencial prescrito **ou**
- corrente total prescrita.

A outra grandeza é resposta calculada. A densidade de corrente deve usar a geometria atual, e a continuidade de corrente precisa ser verificada.

### 5.5 O que a literatura autoriza afirmar

A deformação pode alterar resistência pela geometria e pela microestrutura. Isso não significa que o campo elétrico esteja facilitando a deformação. A hipótese de eletroplasticidade exige controles específicos e continua desligada nesta combinação.

## 6. Caminho M → O: geometria e reflexão na superfície atual

### 6.1 Normal local da superfície deformada

A superfície óptica deve acompanhar a transformação mecânica. Para uma normal N na configuração de referência, a normal na configuração atual é:

~~~text
n = normalize(F⁻ᵀ N)
~~~

A relação pressupõe uma transformação local regular e uma superfície material identificada. Para cálculo de área, a relação de Nanson pode ser escrita:

~~~text
n da = J F⁻ᵀ N dA
~~~

A normal deve ser atualizada após cada mudança do estado mecânico. Rotação rígida, alongamento, cisalhamento e deformação não uniforme precisam produzir normais coerentes.

### 6.2 Reflexão especular

Com vetores unitários e uma convenção consistente para o sentido do raio incidente:

~~~text
r = i − 2(i · n)n
~~~

A lei dos ângulos iguais continua válida em relação à **normal local atual**. Quando a superfície se inclina, a direção refletida no referencial da cena muda mesmo que o material mantenha as mesmas constantes ópticas.

A demonstração mínima deve mostrar:
1. superfície de referência;
2. estado deformado;
3. normal local;
4. raio incidente e raio refletido;
5. retorno geométrico ao remover uma deformação puramente elástica.

### 6.3 Rugosidade e distribuição angular

Uma superfície com normais locais diferentes pode redistribuir a luz entre o pico especular e componentes espalhadas. Para isso, o modelo precisa de topografia real ou estatística de superfície, escala, inclinações, comprimento de correlação e relação com o comprimento de onda.

Não inventar microfacetas ou degraus a partir de deslizamentos internos. O sistema de deslizamento precisa interceptar a superfície livre e o deslocamento emergente precisa estar representado numa malha/macrossuperfície.

A BRDF ou uma aproximação microfacetada só deve entrar depois que a distribuição de normais e os parâmetros ópticos forem definidos e testados. Modelos de espalhamento em superfícies metálicas rugosas têm regimes de validade dependentes da escala da rugosidade e do comprimento de onda. [Stover et al., 2011](https://pubmed.ncbi.nlm.nih.gov/21643239/).

## 7. Caminho M → O: alteração óptica intrínseca por tensão/deformação

A mudança geométrica da reflexão não é a única possibilidade. A deformação também pode modificar a simetria da rede, a resposta dielétrica e a anisotropia óptica.

Uma descrição quantitativa pode exigir:

~~~text
ε̃ = ε̃(ω, ε, σ, orientação, fase)
N(ω) = n(ω) + iκ(ω)
~~~

Para materiais anisotrópicos, a resposta deve ser tensorial e depender da orientação relativa entre tensão/deformação, eixos cristalinos, plano de incidência e polarização.

### 7.1 Evidência experimental

- Sun et al. mediram coeficientes elasto-ópticos de um filme de cobre de 400 nm depositado sobre poliimida, sob diferentes tensões, por elipsometria espectroscópica entre 380 e 1000 nm. Os coeficientes variaram de forma não linear com o comprimento de onda. Isso demonstra que o efeito pode ser medido em metal opaco, mas não autoriza transferir esses coeficientes para cobre maciço, outras espessuras, substratos, tratamentos ou faixas espectrais. [Sun et al., 2022](https://doi.org/10.1016/j.optlaseng.2022.107362).
- Sendra et al. demonstraram mapeamento de campos de deformação por anisotropia de refletância em diferentes materiais, incluindo metais, usando microscopia espectral sensível à resposta elasto-óptica. [Sendra et al., 2023](https://doi.org/10.1002/adfm.202302179).

### 7.2 Dados necessários para ativar esse caminho

- função dielétrica complexa ou n(λ), κ(λ) em estado de referência;
- coeficientes elasto-ópticos ou função medida ε̃(ω, tensão/deformação);
- faixa de deformação/tensão e linearidade validada;
- composição, fase, textura, orientação e temperatura;
- espessura, substrato, interfaces e filme, quando aplicável;
- comprimento de onda, ângulo e polarização;
- método de aquisição, incerteza e publicação/fonte;
- faixa experimental e condições de validade.

A resposta pode ser anisotrópica, variar com o comprimento de onda e depender da polarização. Não presumir que a cor sempre escurece, clareia ou muda de uma forma universal.

**Decisão:** a primeira experiência E+M+O usa somente a atualização geométrica da reflexão. A mudança intrínseca elasto-óptica é uma extensão parametrizada, bloqueada por padrão até haver dados específicos homologados.

## 8. Independência entre E DC e O

O domínio elétrico usa a resposta DC/baixa frequência, como σDC ou ρDC. O domínio óptico usa a resposta eletromagnética na frequência da luz, representada por ε̃(ω), σ̃(ω) ou n(λ)+iκ(λ).

A condutividade DC não pode ser usada como substituta de constantes ópticas. A iluminação não é o campo elétrico DC da amostra. A corrente não deve mudar a refletância por simples coexistência no painel.

Neste acoplamento, E e O compartilham o mesmo estado mecânico, mas permanecem dois ensaios independentes:
- estímulo elétrico: potencial ou corrente DC;
- estímulo óptico: espectro, irradiância, ângulo e polarização.

Uma modulação direta da resposta óptica pelo campo DC exige outra hipótese e outro modelo, não incluídos aqui.

## 9. Sequência de cálculo integrada

A ordem lógica de uma implementação futura deve ser:

1. **Estado de referência:** carregar composição, fase, geometria, orientação, contatos, microestrutura e parâmetros ópticos.
2. **Condição mecânica:** aplicar tração ou compressão com força/tensão ou deslocamento/deformação prescrita.
3. **Atualização geométrica:** calcular deslocamento, F, J e geometria atual da amostra.
4. **Atualização microestrutural:** atualizar variáveis internas conforme lei material validada; não converter passos visuais diretamente em densidade física.
5. **Domínio elétrico:** resolver potencial/corrente sobre a geometria atual; calcular R, V, I e J; separar parcelas geométrica, intrínseca e de contato.
6. **Superfície óptica:** atualizar posições e normais locais com a mesma transformação mecânica.
7. **Domínio óptico:** calcular a reflexão geométrica; se habilitado e parametrizado, atualizar ε̃(ω,ε) e resolver a resposta espectral/polarizada.
8. **Relatório:** apresentar as contribuições separadamente e registrar fonte, unidade, faixa e condição de cada parâmetro.
9. **Controle térmico:** confirmar que a hipótese isotérmica foi mantida. Se não, interromper a classificação E+M+O e exigir o modelo E+T+M+O.

Não executar o campo mecânico duas vezes, uma pela experiência elétrica e outra pela óptica. Os dois domínios devem consumir a mesma geometria atual.

## 10. Condições e resultados da experiência

### 10.1 Condições de entrada

| Família | Entradas mínimas |
|---|---|
| Amostra | metal/composição/fase, orientação, geometria inicial, temperatura e superfície |
| Mecânica | tração ou compressão; força/tensão ou deslocamento/deformação; direção, apoios e taxa |
| Elétrica | tensão ou corrente DC; posição/direção dos terminais; condição de contato |
| Óptica | comprimento de onda/espectro, irradiância, ângulo, polarização e direção de observação |
| Microestrutura | estado inicial e variável interna calibrada, se houver |
| Elasto-óptica | resposta espectral dependente de tensão/deformação, quando homologada |
| Controle térmico | temperatura fixa/monitorada e condição que mantém a hipótese isotérmica |

### 10.2 Resultados elétricos

- comprimento e seção atuais;
- resistência total;
- resistividade intrínseca, somente se parametrizada;
- corrente, tensão e densidade de corrente;
- parcelas geométrica, microestrutural e de contato;
- incerteza e fonte dos dados.

### 10.3 Resultados ópticos

- superfície e normal local atualizadas;
- direção incidente e refletida;
- distribuição angular, se houver topografia/BRDF;
- refletância espectral e resposta polarizada, somente se constantes ópticas forem fornecidas;
- parcela geométrica da mudança de reflexão;
- parcela intrínseca elasto-óptica, quando ativada;
- incerteza e fonte dos dados.

### 10.4 Apresentação na interface

Manter o painel único de condições do SILM. Os ícones selecionam os fenômenos; as condições são agrupadas por família dentro do mesmo painel. Não abrir menus contextuais separados por propriedade.

A interface deve deixar claras três camadas de resultado:
- **Geometria:** mudança de forma, seção, contatos e normais.
- **Material:** mudança de resistividade e/ou resposta elasto-óptica, quando houver dados.
- **Medição:** valores de resistência, corrente, refletância e direção da luz.

## 11. Contrato conceitual do estado E+M+O

~~~ts
type MechanicalMode = "tension" | "compression";
type MechanicalControl = "force-stress" | "displacement-strain";
type ElectricalControl = "voltage" | "current";
type OpticalMode = "geometric-reflection" | "parameterized-elasto-optic";
type EvidenceMode = "qualitative" | "parameterized" | "quantitative";

interface ElectroMechOpticalExperiment {
  sample: {
    materialId: string;
    phase: string;
    referenceGeometryId: string;
    surfaceModelId: string;
    temperatureK?: number;
    isothermalControl: "fixed" | "monitored";
  };
  mechanical: {
    mode: MechanicalMode;
    control: MechanicalControl;
    value?: number;
    unit?: string;
    direction: [number, number, number];
    supportModelId: string;
  };
  electrical: {
    control: ElectricalControl;
    value?: number;
    unit?: string;
    terminalsId: string;
    contactModel: "ideal" | "parameterized";
  };
  microstructure: {
    stateModel: "none" | "calibrated-internal-variable" | "didactic-only";
    source?: string;
  };
  optical: {
    mode: OpticalMode;
    wavelengthNm?: number;
    polarization?: "s" | "p" | "unpolarized";
    incidenceDeg?: number;
    surfaceModelId: string;
    elastoOpticDatasetId?: string;
  };
  evidenceMode: EvidenceMode;
  results: {
    resistanceOhm?: number;
    resistivityOhmM?: number;
    currentA?: number;
    voltageV?: number;
    currentDensityAm2?: number;
    reflectedDirection?: [number, number, number];
    reflectance?: number;
    geometricContribution?: number;
    intrinsicContribution?: number;
  };
}
~~~

O contrato é conceitual. Entradas, condições de contorno e resultados devem permanecer em campos separados. Campos numéricos opcionais só podem ser preenchidos quando unidade, fonte e faixa de validade estiverem disponíveis. O estado térmico é uma condição de controle, não uma variável que possa ser presumida sem monitoramento.

## 12. Auditoria da implementação atual no SILM

Arquivos auditados no branch de origem:

### 12.1 `domain/silm/deformation.js`
- Representa sistemas de deslizamento para CFC, CCC e HC.
- Transforma posições da rede e anima a deformação elástica/plástica.
- Usa limiar e amplitude elástica didáticos, até 6%, e no máximo quatro deslizamentos na representação.
- Não possui corpo de prova macroscópico com dimensões e seção elétrica calibradas.
- Não calcula campo de deformação contínuo de uma amostra nem uma malha de superfície óptica independente.

### 12.2 `domain/silm/drive.js`
- O controle elétrico da experiência é transitório e adimensional; não representa volts, ampères ou densidade de corrente.
- O brilho usa um ângulo de incidência e devolve ângulo de reflexão igual em relação a uma normal de referência.
- Não recalcula a normal local a partir da deformação.
- Não resolve domínio elétrico nem Fresnel/BRDF.

### 12.3 `integracao/metallic-experience.js`
- A combinação E+M ativa a demonstração qualitativa de campo e deformação.
- A contribuição dos defeitos ao espalhamento eletrônico é didática; não há densidade física de discordâncias ou solução de resistividade acoplada à geometria.
- Não existe, na combinação atual, atualização compartilhada da superfície óptica deformada.

### 12.4 Conclusão

O SILM já possui peças didáticas para deformação cristalina, transporte eletrônico qualitativo e reflexão especular. Ainda não possui os três domínios quantitativos integrados à mesma amostra. A nova combinação deve permanecer como especificação, não como funcionalidade habilitada.

## 13. Critérios de aceite

### 13.1 Geometria comum
- [ ] Com deformação nula, os domínios elétrico e óptico usam a geometria de referência.
- [ ] Uma única transformação mecânica atualiza a geometria usada pelos dois domínios.
- [ ] Para F identidade, a normal permanece igual à normal de referência.
- [ ] Para rotação rígida, a normal gira com a superfície.
- [ ] Tração, compressão e cisalhamento atualizam as normais conforme F.
- [ ] Deformação elástica retorna à geometria inicial após descarga.
- [ ] Deformação plástica permanece após descarga, conforme a lei mecânica.

### 13.2 Domínio elétrico
- [ ] Resistência geométrica segue R = ρe L/A no caso uniforme validado.
- [ ] Mudanças de L e A não são reportadas como mudança intrínseca de ρe.
- [ ] A contribuição microestrutural só muda segundo uma variável interna e relação material declaradas.
- [ ] A densidade de corrente usa a seção atual.
- [ ] Tensão e corrente são condições alternativas; a outra grandeza é resposta.
- [ ] Contatos são ideais ou parametrizados e explicitamente identificados.
- [ ] Sem dados homologados, não são apresentados valores físicos falsamente precisos.

### 13.3 Domínio óptico
- [ ] A reflexão especular usa a normal local atualizada.
- [ ] A lei da reflexão é testada em relação à normal local, não à normal global inicial.
- [ ] Rugosidade não é inventada a partir de deslizamentos que não interceptam a superfície.
- [ ] A geometria pode mudar a direção refletida sem modificar a cor intrínseca.
- [ ] A resposta elasto-óptica só ativa com dados válidos para o material, fase, orientação, faixa espectral e condição mecânica.
- [ ] Resposta anisotrópica preserva orientação e polarização.
- [ ] Refletância e absorção obedecem ao balanço óptico aplicável (R+A+Topt=1, quando as parcelas forem modeladas).

### 13.4 Isolamento e interface
- [ ] Corrente DC não é interpretada como onda óptica.
- [ ] Condutividade DC não é usada para inferir n(λ), κ(λ) ou ε̃(ω).
- [ ] Não há alteração mecânica atribuída a eletroplasticidade.
- [ ] A hipótese isotérmica é monitorada; aquecimento relevante bloqueia E+M+O.
- [ ] A aplicação de condições não cria dois estados mecânicos concorrentes.
- [ ] Seleção por clique, Ctrl/Cmd e toque mantém a mesma semântica.
- [ ] Resultados qualitativos e quantitativos são visualmente distinguidos.

## 14. Fases de implementação

**Fase A — contrato e geometria compartilhada**
- Criar um estado único da amostra e da transformação mecânica.
- Separar a geometria macroscópica da rede cristalina.
- Fornecer posições e normais atuais para os consumidores elétrico e óptico.
- Sem declarar resistência ou refletância quantitativa.

**Fase B — resistência geométrica**
- Definir corpo de prova, dimensões, terminais e condição elétrica.
- Calcular Rgeom com resistividade fixa.
- Validar corrente, tensão e densidade de corrente.

**Fase C — resistividade por microestrutura**
- Definir variável interna calibrada.
- Obter lei ρe(S, T, composição, fase), com faixa e fonte.
- Separar resistência geométrica, material e contatos.

**Fase D — reflexão geométrica**
- Criar superfície óptica independente da rede.
- Atualizar normais e raios a partir da geometria atual.
- Validar os casos de rotação, tração, compressão e deformação plástica.

**Fase E — óptica espectral e elasto-óptica**
- Homologar constantes ópticas por faixa espectral.
- Adicionar coeficientes ou dados ε̃(ω, deformação) apenas por amostra/condição.
- Incluir polarização e anisotropia quando necessárias.
- Validar com elipsometria, reflectância ou método equivalente.

**Fase F — integração E+M+O**
- Executar a mesma transformação mecânica antes de atualizar os domínios elétrico e óptico.
- Verificar consistência temporal e térmica.
- Comparar resultados com dados de referência e documentar incertezas.

## 15. Decisões congeladas

1. A mecânica é o elo comum entre transporte elétrico e resposta óptica.
2. Resistência geométrica, resistividade intrínseca e resistência de contato são contribuições distintas.
3. Mudança da normal local e mudança das constantes ópticas são efeitos ópticos diferentes.
4. A primeira experiência atualiza a reflexão geometricamente; alteração intrínseca elasto-óptica é opcional e exige dados.
5. E DC e O são domínios independentes; não usar condutividade DC para calcular resposta óptica.
6. Um único estado mecânico e uma única geometria atual alimentam os dois domínios.
7. A experiência é isotérmica controlada; aquecimento relevante exige E+T+M+O.
8. Eletroplasticidade, absorção fototérmica e mudança automática de cor ficam desabilitadas.
9. A especificação não autoriza implementação quantitativa enquanto geometria, parâmetros, contatos e validação não estiverem disponíveis.

## 16. Referências

1. Ueda, M.; Kosaka, N.; Fujita, K.; Ikeda, M. “In Situ Measurement of Electrical Resistivity during Tensile Deformation of Pure Fe”. *ISIJ International*, 66(8), 964–968, 2026. [DOI 10.2355/isijinternational.ISIJINT-2026-053](https://doi.org/10.2355/isijinternational.ISIJINT-2026-053). Medição *in situ* das contribuições de lacunas e discordâncias durante deformação de ferro puro.
2. Saberi, S. et al. “A new development of four-point method to measure the electrical resistivity in situ during plastic deformation”. *Measurement*, 180, 109547, 2021. [DOI 10.1016/j.measurement.2021.109547](https://doi.org/10.1016/j.measurement.2021.109547). Medição de resistividade em ligas durante deformação e dependência do caminho de deformação.
3. Sun, X. et al. “Measurement of stress-optic coefficients for metals in the visible to near-infrared spectrum with spectroscopic ellipsometry”. *Optics and Lasers in Engineering*, 2022. [DOI 10.1016/j.optlaseng.2022.107362](https://doi.org/10.1016/j.optlaseng.2022.107362). Coeficientes elasto-ópticos de filme de cobre em 380–1000 nm sob tensão.
4. Sendra, J. et al. “Multi-Material Strain Mapping with Scanning Reflectance Anisotropy Microscopy”. *Advanced Functional Materials*, 33, 2302179, 2023. [DOI 10.1002/adfm.202302179](https://doi.org/10.1002/adfm.202302179). Mapeamento de deformação pela anisotropia de refletância em materiais, incluindo metais.
5. Stover, J. C. et al. “Modeling of light scattering in different regimes of surface roughness”. 2011. [PubMed](https://pubmed.ncbi.nlm.nih.gov/21643239/). Modelos de espalhamento de superfícies metálicas rugosas e seus regimes de validade.
6. Frontiers in Advanced Optical Technologies. “Deflectometry for specular surfaces: an overview”, 2023. [DOI 10.3389/aot.2023.1237687](https://doi.org/10.3389/aot.2023.1237687). Relação entre qualidade da superfície, componente especular e espalhamento.
7. SILM — [Especificação M+O](ESPECIFICACAO-ACOPLAMENTO-MECANICO-OPTICO.md), [Especificação E+M](ESPECIFICACAO-ACOPLAMENTO-ELETROMECANICO.md) e [Especificação E+O](ESPECIFICACAO-ACOPLAMENTO-ELETRO-OPTICO.md). Regras internas de geometria, transporte, superfície e resposta espectral.

