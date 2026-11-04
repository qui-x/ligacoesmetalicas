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
| T + M | Temperatura inicial/gradiente/fonte; carregamento mecânico; apoios e propriedades dependentes de T | Expansão, tensão térmica e resposta mecânica dependente da temperatura | Especificada em ESPECIFICACAO-ACOPLAMENTO-TERMOMECANICO.md; quantitativo bloqueado sem dados e validação |
| T + O | Espectro/irradiância, R+A+Topt, perfil de absorção, propriedades térmicas, fronteiras e R(λ,T) ou CTR | Absorção óptica gera fonte térmica; difusão muda T; temperatura realimenta refletância/absorção | Especificada em ESPECIFICACAO-ACOPLAMENTO-TERMO-OPTICO.md; bloqueada até homologar dados e balanços |
| M + O | Carregamento mecânico; superfície; iluminação | Atualização geométrica das normais; alteração intrínseca elasto-óptica apenas com dados de tensão/deformação | Especificada; geometria primeiro, extensão intrínseca parametrizada e bloqueada sem dados |

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
- Atualizar a normal local a partir da geometria deformada; a reflexão especular usa a normal atual, não a normal global de referência.
- Rugosidade/BRDF exige topografia ou estatística de superfície na escala óptica; não inferir rugosidade de deslizamentos internos que não emergem na superfície.
- Não alterar automaticamente cor ou refletância intrínseca. Uma extensão elasto-óptica exige ε̃(ω, tensão/deformação) ou coeficientes medidos para a mesma amostra, faixa espectral e polarização.

**E + O**
- Não calcular resposta óptica com a condutividade DC nem converter intensidade do campo didático em amplitude da onda luminosa.
- Tratar a resposta elétrica DC e a resposta óptica espectral como regimes distintos da resposta eletrônica do material.
- Exigir n(λ) + iκ(λ), ε̃(ω) ou σ̃(ω), com faixa, fase, temperatura, superfície, método e fonte.
- Calcular refletância por Fresnel; para filme/substrato, incluir espessuras e interfaces.
- Não alterar a refletância só porque a corrente foi ligada. Campo DC modulando a resposta óptica exige modelo específico e evidência.
- Se a alteração óptica vier do aquecimento Joule, classificar a experiência como E + T + O e fechar o balanço de energia.
- Manter E+O bloqueada até os dados espectrais e os testes do motor óptico serem homologados.

**E + M + O**
- O estado mecânico e a geometria atual da amostra são compartilhados pelos domínios elétrico e óptico.
- Separar a mudança geométrica de resistência (L/A), a mudança de resistividade por microestrutura e a resistência de contato.
- Atualizar a normal óptica por F⁻ᵀN e refletir pela normal local; a mudança intrínseca da resposta óptica depende de coeficientes elasto-ópticos específicos.
- Manter corrente DC e iluminação como estímulos distintos; não inferir óptica a partir de σDC.
- Manter a condição isotérmica controlada. Aquecimento Joule/fototérmico significativo exige E+T+M+O.
- Manter eletroplasticidade desligada e não converter deslizamentos visuais em densidade de discordâncias.
- Especificação completa: [ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md](ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md).

**T + O**
- Separar potência incidente, refletida, absorvida e transmitida; não assumir que toda luz incidente vira calor.
- Converter apenas a parcela absorvida em fonte térmica, com perfil espacial compatível com profundidade de absorção e camadas.
- Resolver difusão térmica com ρ, cp, k e condições de contorno explícitas; não usar taxa de quadros como tempo físico nem malha atômica como amostra macroscópica.
- Atualizar R(λ,T), n(λ,T), κ(λ,T) ou CTR(λ,T0) somente com dados/modelo validados na faixa da amostra.
- Preservar o sinal de CTR: aquecer não significa necessariamente aumentar o brilho.
- Diferenciar feixe de bomba (aquece) e prova (mede) no modo pump–probe; incluir a potência da prova no balanço se seu aquecimento não for desprezível.
- Ao desligar a bomba, interromper a fonte óptica, mas manter a evolução térmica até o equilíbrio imposto pelas fronteiras.
- Não confundir refletância visível com emissividade térmica; a relação de Kirchhoff exige mesma faixa espectral e condições direcionais/polarização.
- Manter T+O bloqueada como interação quantitativa até homologar absorção, propriedades térmicas, resposta óptica dependente de T e testes de conservação.

**T + M + O**
- Compartilhar um único campo de temperatura e uma única geometria deformada entre os domínios térmico, mecânico e óptico.
- Separar a mudança geométrica da reflexão (forma, normais e topografia) da mudança intrínseca por termorrefletância (CTR ou R(λ,T)).
- Distinguir luz de prova, bomba + prova e feixe único; somente a potência absorvida é fonte térmica.
- Atualizar a refletância/absorptância conforme T e a superfície, sem contar duas vezes a mesma perda óptica.
- A expansão uniforme e livre de uma superfície plana não deve produzir rotação artificial da normal; gradientes e restrições podem deformar a superfície.
- Calor plástico fica desligado até homologar o coeficiente Taylor–Quinney para material, taxa e estado; não usar β universal.
- Manter a mudança de fase, oxidação, fluência e dano fora da primeira versão.
- Especificação completa: [ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md](ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md).

**E + T + O**
- Manter dois estímulos independentes: tensão/corrente DC e iluminação espectral. Não tratar o campo DC como campo da onda óptica.
- Calcular Joule com JDC·EDC e absorção óptica com A·Pinc ou dissipação local do campo óptico; não duplicar a mesma perda entre absorptância, σ̃opt e ε̃''.
- Somar q'''J e q'''opt na equação térmica, preservando a proveniência de cada fonte e a distribuição espacial.
- Atualizar σDC(T) e a resposta óptica (n, κ, ε̃, R/A/Topt ou CTR) somente com funções/dados validados na mesma fase, amostra e faixa de temperatura.
- Recalcular a geração Joule conforme controle por tensão ou corrente; a realimentação pode ter sinal diferente conforme o circuito e a função material.
- Fechar separadamente o balanço elétrico de terminais, o balanço óptico R+A+Topt e o balanço térmico de energia armazenada/saída.
- Usar temperatura única somente após equilíbrio elétron–rede válido; pulsos ultracurtos podem exigir modelo de duas temperaturas.
- Manter E+T+O bloqueada como simulação quantitativa até homologar os três domínios e o residual global de energia.

## 5. Combinações de três e quatro famílias

| Combinação | Encadeamento físico necessário | Liberação |
|---|---|---|
| E + T + M | Corrente → Joule → temperatura; temperatura e defeitos afetam resposta elétrica; temperatura e carregamento afetam deformação; deformação retorna ao estado elétrico | Objetivo principal da evolução multifísica, após validação dos pares |
| E + T + O | Corrente DC gera Joule; luz gera calor apenas pela absorção; temperatura retroage em σDC(T) e R/A/Topt(λ,T) | Especificada em ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-OPTICO.md; bloqueada até fechar os balanços elétrico, óptico e térmico |
| E + M + O | Deformação compartilhada altera geometria elétrica, microestrutura e superfície; pode alterar a resposta óptica intrínseca com coeficientes específicos | Especificada em [ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md](ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md); bloqueada quantitativamente até validar geometria, resistividade e óptica |
| T + M + O | Um único campo térmico altera dimensões e propriedades mecânicas; geometria atual modifica reflexão e temperatura altera R(λ,T)/CTR; luz absorvida pode realimentar T | Especificada em [ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md](ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md); bloqueada quantitativamente até homologar mecânica, óptica, absorção e balanços |
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
6. **E + M + O:** compartilhar uma única geometria deformada; validar resistência geométrica/microestrutural e reflexão local. Ver [ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md](ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md).
7. **T + M + O:** integrar campo térmico, resposta mecânica, superfície deformada e termorrefletância; distinguir probe, pump–probe e feixe único, fechar balanços e validar o caminho fototérmico. Ver [ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md](ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md).
7. **E + T + M:** integrar os três campos com avanço temporal e testes de conservação/estabilidade.

## 11. Decisões que ainda precisam ser aprovadas

- Se o primeiro modo E + T será tensão controlada ou corrente controlada (a arquitetura deve permitir os dois, mas a primeira experiência pode começar com um).
- Quais fronteiras térmicas estarão disponíveis na primeira versão: isolada e temperatura fixa, deixando troca com o ambiente para depois.
- Se o primeiro modo T + M demonstrará apenas expansão livre/restrita ou também mudança qualitativa da resistência ao deslizamento.
- Se a experiência de seleção múltipla manterá a aplicação imediata quando a combinação for reconhecida ou exigirá sempre o painel de condições antes de iniciar.
- Qual convenção de unidade e qual referência experimental serão adotadas quando o banco passar a conter valores por metal.

**Decisão de segurança científica:** enquanto essas escolhas não estiverem fechadas e os parâmetros não estiverem homologados, esta matriz deve permanecer como especificação de estudo e não habilitar novas combinações no simulador.
