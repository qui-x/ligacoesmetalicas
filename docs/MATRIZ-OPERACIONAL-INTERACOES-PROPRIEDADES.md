# SILM — Matriz operacional das interações entre propriedades metálicas

**Status:** especificação de estudo — não implementada  
**Branch:** study/silm-coupled-properties-transport-20261104  
**Documento de referência:** ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md

---

## 1. Objetivo

Converter o estudo físico das interações em uma especificação operacional para a interface, os estados da experiência, as condições de contorno, as variáveis do modelo e os critérios de validação.

Esta matriz não autoriza, por si só, a implementação de todos os acoplamentos. Cada combinação precisa passar por três verificações:

1. Existe um mecanismo físico identificável.
2. As condições necessárias e os parâmetros estão disponíveis.
3. O motor consegue calcular o efeito sem apresentar uma animação independente como se fosse um acoplamento físico.

Enquanto não houver dados por metal homologados, os resultados quantitativos permanecem bloqueados ou são explicitamente apresentados como qualitativos/didáticos.

## 2. Vocabulário e unidades de seleção

O simulador deve organizar os fenômenos em quatro famílias:

| Família | Fenômenos selecionáveis | O que representa |
|---|---|---|
| Elétrica (E) | Condutividade elétrica | Transporte de carga sob diferença de potencial/campo ou corrente imposta |
| Térmica (T) | Condutividade térmica | Transporte de energia térmica sob gradiente ou fluxo de calor |
| Mecânica (M) | Maleabilidade e ductilidade | Resposta à compressão, tração e, futuramente, cisalhamento |
| Óptica (O) | Brilho metálico | Interação da luz com a superfície e a estrutura eletrônica |

**Regra importante:** maleabilidade e ductilidade são modos direcionais de resposta da família mecânica, não duas famílias de transporte. Selecionar ambas deve significar um estado de carregamento multiaxial, que só poderá ser calculado quando o motor tiver um modelo de tensões/deformações multiaxiais. Até lá, a interface deve pedir que se escolha compressão ou tração, ou informar que a combinação simultânea ainda não está disponível.

Não usar “condutividade mecânica”. Usar **resposta mecânica**, **carregamento** ou **deformação**.

## 3. Separação entre fenômeno e condição física

A seleção de ícones identifica o que será observado. As condições são configuradas em seguida, em um único painel de experiência, com campos que aparecem conforme as famílias selecionadas.

### 3.1 Elétrica — E

| Campo | Regra operacional |
|---|---|
| Variável de controle | Escolher **tensão/diferença de potencial** OU **corrente imposta** |
| Geometria | Terminais, distância entre terminais e seção da amostra |
| Direção | Polaridade/sentido do campo |
| Regime | Contínuo ou pulsado, quando o motor suportar |
| Estado material | Temperatura e estado microestrutural, quando acoplados |
| Respostas | Campo elétrico, densidade de corrente e potência dissipada |

Não impor tensão e corrente como duas entradas independentes para o mesmo circuito. Uma é a condição prescrita; a outra é resposta do modelo. A intensidade visual atual (adimensional) não deve ser rotulada como condutividade elétrica nem como valor em ampères/volts.

### 3.2 Térmica — T

O painel deve oferecer modos mutuamente identificáveis:

| Modo | Condição prescrita | O que o motor deve responder |
|---|---|---|
| Fonte externa | Região/fonte aquecida e intensidade ou potência definida | Evolução de temperatura e fluxo |
| Gradiente quente-frio | Temperaturas impostas nas fronteiras quente e fria | Fluxo de calor |
| Fluxo de calor | Fluxo imposto em uma fronteira | Distribuição de temperatura |
| Aquecimento Joule | Fonte volumétrica obtida de E e J | Aumento de temperatura resultante da dissipação elétrica |

A condição térmica também precisa declarar o tratamento das fronteiras: isolada, temperatura prescrita ou troca com o ambiente. Convecção e radiação podem ficar para uma etapa posterior; não devem ser simuladas implicitamente.

A fonte externa atualmente usada no SILM deve continuar identificada como **aquecimento externo**. Ela não pode ser chamada de Joule.

### 3.3 Mecânica — M

| Campo | Regra operacional |
|---|---|
| Modo de carregamento | Compressão, tração ou cisalhamento (quando implementado) |
| Controle | Força/tensão prescrita OU deslocamento/deformação prescrita |
| Geometria | Região de aplicação, dimensões e orientação do cristal |
| Apoios | Livre, apoiado ou restringido |
| Taxa | Estática/quase-estática ou dinâmica, se suportada |
| Estado térmico | Temperatura da amostra, se T também estiver selecionada |
| Respostas | Deslocamento, deformação, tensão e evolução de defeitos/deslizamentos |

A experiência atual de deslizamento cristalino é qualitativa. Seu limiar fixo não deve ser apresentado como limite de escoamento real de um metal específico.

### 3.4 Óptica — O

| Campo | Regra operacional |
|---|---|
| Luz incidente | Comprimento de onda ou faixa espectral |
| Geometria | Ângulo de incidência e orientação da superfície |
| Polarização | Campo elétrico da luz, quando o modelo exigir |
| Superfície | Lisa ou com rugosidade/defeitos modelados |
| Respostas | Direção refletida e, se houver dados, refletância e absorção |

A relação geométrica da reflexão especular pode ser demonstrada sem dados por metal. A intensidade refletida, a cor e a dependência espectral exigem parâmetros ópticos adequados; condutividade elétrica em corrente contínua não substitui esses parâmetros.

## 4. Matriz das seis interações em pares

| Combinação | Condições mínimas | Relação que deve ser calculada | Estado no SILM |
|---|---|---|---|
| E + T | Tensão OU corrente; condição térmica; fronteiras térmicas | Dissipação Joule aquece a amostra; temperatura altera a resistividade/condutividade; transporte térmico remove/distribui calor | Prioridade 1, com balanço energético |
| E + M | Condição elétrica; tração ou compressão; geometria e apoios | Deformação muda geometria e pode criar defeitos/dislocações que alteram a resistividade | Prioridade 2; primeiro qualitativo e separado de eletroplasticidade |
| E + O | Condição elétrica DC; espectro, incidência e polarização da luz; função dielétrica/resposta óptica espectral | Origem eletrônica compartilhada, mas respostas em frequências distintas; refletância via Fresnel a partir de n(λ), κ(λ) ou ε̃(ω) | Especificada em ESPECIFICACAO-ACOPLAMENTO-ELETRO-OPTICO.md; implementação bloqueada até dados espectrais homologados |
| T + M | Gradiente/fonte térmica; carregamento mecânico; apoios | Expansão térmica e variação da resposta mecânica com temperatura; restrição pode gerar tensão térmica | Prioridade 1 |
| T + O | Luz e absorção espectral; condição térmica e fronteiras | Luz absorvida atua como fonte de calor; temperatura pode alterar resposta óptica | Prioridade 2, depende de absorção/óptica espectral |
| M + O | Carregamento mecânico; superfície; iluminação | Deformação altera orientação, forma e rugosidade da superfície, mudando a reflexão geométrica | Prioridade 1 simplificada |

### 4.1 Regras específicas por par

**E + T**
- Exibir separadamente a corrente/campo aplicado, a potência Joule e a temperatura.
- Se a corrente for zero, não pode haver aquecimento Joule.
- O gradiente térmico aplicado não deve ser confundido com o calor gerado internamente.
- Se a temperatura variar, a atualização da resposta elétrica deve usar uma relação material válida ou assumir explicitamente um modelo didático.
- A lei de Wiedemann–Franz só relaciona a parcela eletrônica da condutividade térmica, não a condutividade térmica total sem considerar a contribuição da rede.

**E + M**
- Distinguir mudança geométrica da amostra e aumento de espalhamento por defeitos.
- Desligar o campo elétrico não deve desfazer uma deformação plástica já produzida.
- Não declarar eletroplasticidade: o acoplamento atual entre campo e deformação não comprova facilitação eletromecânica além do aquecimento Joule.

**T + M**
- Uma amostra livre pode expandir sem produzir, por isso só, tensão térmica.
- A expansão impedida por apoios/restrições pode gerar tensão.
- A temperatura pode alterar módulo, escoamento e ductilidade; a direção e magnitude dependem do material e dos dados/modelo.
- Separar expansão térmica reversível de deformação plástica permanente.

**M + O**
- A reflexão muda pela orientação da normal local e, se modelada, pela rugosidade.
- Não alterar automaticamente a cor real ou a refletância espectral sem parâmetros ópticos.
- O modo inicial pode mostrar apenas a mudança geométrica do raio refletido.

**E + O**
- Não calcular resposta óptica com a condutividade DC nem converter intensidade do campo didático em amplitude da onda luminosa.
- Tratar a resposta elétrica DC e a resposta óptica espectral como regimes distintos da resposta eletrônica do material.
- Exigir n(λ) + iκ(λ), ε̃(ω) ou σ̃(ω), com faixa, fase, temperatura, superfície, método e fonte.
- Calcular refletância por Fresnel; para filme/substrato, incluir espessuras e interfaces.
- Não alterar a refletância só porque a corrente foi ligada. Campo DC modulando a resposta óptica exige modelo específico e evidência.
- Se a alteração óptica vier do aquecimento Joule, classificar a experiência como E + T + O e fechar o balanço de energia.
- Manter E+O bloqueada até os dados espectrais e os testes do motor óptico serem homologados.

**T + O**
- Só converter iluminação em calor quando a absorção estiver definida.
- Não assumir que toda luz incidente é absorvida.
- Separar energia incidente, refletida, transmitida e absorvida quando o modelo de balanço estiver disponível.

## 5. Combinações de três e quatro famílias

| Combinação | Encadeamento físico necessário | Liberação |
|---|---|---|
| E + T + M | Corrente → Joule → temperatura; temperatura e defeitos afetam resposta elétrica; temperatura e carregamento afetam deformação; deformação retorna ao estado elétrico | Objetivo principal da evolução multifísica, após validação dos pares |
| E + T + O | Campo/corrente aquece; luz pode ser absorvida e aquecer; temperatura modifica resposta óptica e elétrica | Depende de dados térmicos, elétricos e ópticos |
| E + M + O | Deformação altera geometria/superfície e microestrutura; isso afeta resposta elétrica e reflexão | Depende de modelo microestrutural e óptico |
| T + M + O | Temperatura altera dimensões e resposta mecânica; expansão/deformação altera superfície e reflexão | Parcialmente possível por geometria; resposta óptica quantitativa depende de dados |
| E + T + M + O | Acoplamento de todos os campos e balanços, com retroalimentação temporal | Etapa avançada; não habilitar por simples soma de animações |

A prioridade de desenvolvimento é **E + T + M**. A óptica pode participar da experiência por geometria de reflexão, mas o acoplamento espectral quantitativo exige uma camada científica própria.

## 6. Contrato do painel único de condições

A interface deve manter um único painel de configuração para a seleção aplicada, em vez de abrir um menu contextual separado para cada ícone.

Estrutura sugerida:

1. **Fenômenos:** resumo das propriedades selecionadas.
2. **Condições:** campos agrupados por família presente na seleção.
3. **Amostra:** metal/estrutura, dimensões e dados disponíveis.
4. **Limites do modelo:** aviso curto quando um parâmetro real não estiver cadastrado.
5. **Aplicar:** só habilitado quando as condições obrigatórias forem válidas.
6. **Resultados:** grandezas de entrada e resposta, com unidades e rótulos de modelo.

Os campos não aplicáveis devem ficar ocultos. Campos obrigatórios ausentes devem ser mostrados no próprio grupo, sem abrir menus adicionais. A seleção múltipla deve preservar o comportamento já previsto: clique simples seleciona uma propriedade; Ctrl/Cmd adiciona ou remove; no toque, ações explícitas de selecionar várias, aplicar e cancelar.

### 6.1 Validação antes de iniciar

A aplicação só pode iniciar quando:

- cada família tiver condição de contorno coerente;
- não houver duas variáveis de controle incompatíveis para o mesmo domínio;
- cada acoplamento tiver equações/relacionamentos definidos;
- dados necessários estiverem disponíveis ou a experiência estiver marcada como qualitativa;
- a combinação não estiver bloqueada por limitação do motor.

Se a combinação não for suportada, preservar a seleção e informar a razão; não substituir silenciosamente por duas animações independentes.

## 7. Estado de simulação recomendado

O estado da experiência deve guardar a seleção, as condições de contorno e as respostas separadamente:

    type Family = "electrical" | "thermal" | "mechanical" | "optical";

    type ModelMode = "qualitative" | "parameterized" | "quantitative";

    interface ExperimentState {
      selectedFamilies: Family[];
      mechanicalMode?: "compression" | "tension" | "shear" | "multiaxial";
      controls: {
        electrical?: {
          control: "voltage" | "current";
          value: number;
          unit: string;
        };
        thermal?: {
          mode: "external-source" | "temperature-gradient" | "heat-flux" | "joule";
          boundaryMode: "insulated" | "fixed-temperature" | "ambient-exchange";
        };
        mechanical?: {
          control: "force-stress" | "displacement-strain";
          value: number;
          unit: string;
          constraint: "free" | "supported" | "restricted";
        };
        optical?: {
          wavelengthNm?: number;
          incidenceAngleDeg: number;
          polarization?: "s" | "p" | "unpolarized";
          surface: "ideal-smooth" | "roughness-modeled";
        };
      };
      modelMode: ModelMode;
      materialDataStatus: "verified" | "incomplete" | "didactic";
    }

O trecho é um contrato conceitual, não um tipo pronto para ser incorporado sem revisão. As unidades, intervalos e valores padrão precisam vir de campos validados do banco e das condições de cada modelo; não criar números padrão que pareçam medições reais.

O motor deve manter os campos derivados em estado de resultado, não misturá-los com entradas. Exemplos: densidade de corrente, potência Joule, temperatura resultante, fluxo térmico, tensão, deformação e refletância.

## 8. Mapeamento para o comportamento atual do SILM

| Recurso atual | Tratamento recomendado |
|---|---|
| Seleção Ctrl/Cmd e toque | Preservar; passa a selecionar fenômenos antes de configurar condições |
| Combinação calor + corrente | Renomear/explicitar como fonte térmica externa + campo/corrente até existir Joule calculado |
| Campo elétrico atual | Continuar didático e adimensional enquanto não houver parâmetros por metal |
| Motor térmico por vizinhança | Continuar como demonstração qualitativa; documentar ausência de perda/condição de fronteira física quando aplicável |
| Maleabilidade/ductilidade por deslizamento | Tratar como resposta mecânica qualitativa; não atribuir limites de escoamento reais |
| Brilho metálico por reflexão | Manter como reflexão geométrica; não atribuir espectro/cor material sem dados |
| Dados por elemento | Só liberar modo quantitativo após valor, unidade, condição experimental, temperatura e fonte estarem homologados |

O comportamento atual de heatElectrical precisa ser revisado antes de qualquer rótulo “aquecimento Joule”: a implementação documentada combina aquecimento externo e campo elétrico. As combinações antigas de campo com deformação também não devem ganhar rótulo de eletroplasticidade.

## 9. Critérios de aceite

### 9.1 Científicos
- [ ] Entrada prescrita e grandeza calculada são claramente diferenciadas.
- [ ] As fronteiras térmicas e mecânicas são explícitas.
- [ ] E + T fecha o balanço de energia dentro da tolerância numérica definida.
- [ ] Joule desaparece quando a corrente/densidade de corrente é zero.
- [ ] Temperatura afeta a resposta elétrica apenas por relação documentada.
- [ ] Expansão livre não gera tensão térmica espúria.
- [ ] Restrição térmica produz resposta compatível com o modelo.
- [ ] Mudança de forma/superfície afeta a reflexão geométrica sem inventar cor.
- [ ] Resultados qualitativos não são apresentados como medições.

### 9.2 Interface e estado
- [ ] Clique simples, Ctrl/Cmd e toque produzem a mesma seleção lógica.
- [ ] A seleção múltipla não inicia uma combinação não suportada.
- [ ] Aplicar e cancelar não deixam campos ou efeitos parcialmente ativos.
- [ ] O painel único mostra apenas os parâmetros relevantes.
- [ ] A experiência informa quais dados são medidos, parametrizados ou didáticos.
- [ ] O estado da seleção é independente do estado de execução/pausa da experiência.

## 10. Sequência de implementação sugerida

1. **Congelar o contrato de condições:** entradas elétricas, térmicas e mecânicas; revisar rótulos atuais.
2. **E + T:** construir o primeiro acoplamento físico com Joule, temperatura e resistividade, separando fonte externa e gradiente.
3. **T + M:** incluir expansão e restrição térmica, sem inventar propriedades por metal.
4. **M + O:** refletir mudanças geométricas da superfície.
5. **E + M:** separar contribuição geométrica e microestrutural para resistividade; manter eletroplasticidade bloqueada.
6. **O quantitativa e demais combinações:** somente após cadastro e validação dos parâmetros necessários.
7. **E + T + M:** integrar os três campos com avanço temporal e testes de conservação/estabilidade.

## 11. Decisões que ainda precisam ser aprovadas

- Se o primeiro modo E + T será tensão controlada ou corrente controlada (a arquitetura deve permitir os dois, mas a primeira experiência pode começar com um).
- Quais fronteiras térmicas estarão disponíveis na primeira versão: isolada e temperatura fixa, deixando troca com o ambiente para depois.
- Se o primeiro modo T + M demonstrará apenas expansão livre/restrita ou também mudança qualitativa da resistência ao deslizamento.
- Se a experiência de seleção múltipla manterá a aplicação imediata quando a combinação for reconhecida ou exigirá sempre o painel de condições antes de iniciar.
- Qual convenção de unidade e qual referência experimental serão adotadas quando o banco passar a conter valores por metal.

**Decisão de segurança científica:** enquanto essas escolhas não estiverem fechadas e os parâmetros não estiverem homologados, esta matriz deve permanecer como especificação de estudo e não habilitar novas combinações no simulador.
