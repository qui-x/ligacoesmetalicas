# Combinações de estímulos — Etapa 6 do Explorar

> **Status:** especificação científica, operacional e de interação.  
> **Escopo:** combinações entre luz, calor, campo elétrico e estímulo mecânico para uma amostra de metal elementar por vez.  
> **Implementação:** esta etapa documenta e audita o comportamento atual; não altera motores, interface, banco de dados ou testes.

## 1. Objetivo

Definir quando estímulos diferentes podem coexistir em uma experiência do Explorar, qual fenômeno a combinação representa, quais variáveis são compartilhadas e quais limites devem ser comunicados.

Uma combinação não é a simples sobreposição de controles. Ela precisa representar um acoplamento físico identificado e possuir um caminho computacional único, rastreável e testável.

A regra permanece:

- uma experiência principal ativa por vez;
- no máximo um estímulo auxiliar explicitamente autorizado nesta etapa;
- nenhuma combinação de três ou quatro estímulos está homologada;
- o estímulo auxiliar não inicia uma segunda experiência principal;
- nenhum acoplamento pode ser inferido apenas porque dois controles aparecem na mesma tela.

As quatro famílias continuam sendo ferramentas internas do único módulo Explorar. A navegação principal permanece Explorar, Medir e Calcular.

## 2. Vocabulário e classificação

| Termo | Significado nesta especificação |
|---|---|
| Experiência principal | Propriedade que determina o objetivo, o ciclo de vida e a interpretação da investigação. |
| Estímulo auxiliar | Entrada adicional que atua sobre uma variável compartilhada da experiência principal. |
| Acoplamento | Relação causal ou dependência explicitamente representada entre variáveis físicas. |
| Acoplamento unidirecional | Uma variável afeta outra, sem retorno modelado na direção inversa. |
| Coexistência visual | Dois efeitos aparecem simultaneamente, mas isso não demonstra, por si só, acoplamento físico. |
| Modelo qualitativo | Representação sem escala física homologada para o metal específico. |
| Combinação homologada | Associação que possui condições de uso, variáveis, limites, regras de desligamento e testes definidos. |

A documentação deve distinguir três estados:

1. **Implementada qualitativamente:** existe no código, com escopo e limitações explicitados.
2. **Fisicamente plausível, ainda não modelada:** há fenômeno reconhecido, mas faltam dados, equações, condições ou validação para implementá-lo.
3. **Não autorizada no escopo atual:** não há modelo genérico adequado para a amostra e as condições atuais. Isso não significa que o fenômeno seja impossível em qualquer configuração experimental.

## 3. Auditoria das combinações já existentes

### 3.1 Calor + campo elétrico

**Identificador:** COMBO-TE-01  
**Experiência principal:** condutividade elétrica.  
**Estímulo auxiliar:** fonte térmica.  
**Escopo efetivo atual:** estrutura cristalina.

O controlador térmico reconhece a condutividade elétrica como contexto combinado somente quando a estrutura está no modo cristalino. A integração aciona o mesmo controlador térmico utilizado pela experiência térmica; não cria uma segunda malha de temperatura.

A temperatura local é encaminhada à camada eletrônica. O modelo aumenta qualitativamente o espalhamento onde a rede está mais quente e reduz a deriva média sob o campo. Assim, o calor altera o transporte eletrônico representado.

**Direção modelada:** temperatura → espalhamento e deriva eletrônica.  
**Não modelado:** campo elétrico → aquecimento Joule.  
**Não calculado:** resistência, resistividade ou condutividade quantitativa em função da temperatura.

O coeficiente térmico e os fatores de espalhamento atuais são didáticos e comuns aos metais. A temperatura da simulação é normalizada e transitória, sem unidade física e sem equivalência a uma curva experimental de um elemento específico.

Ao desligar a fonte térmica, cessa o fornecimento na região da fonte. Isso não representa resfriamento para a temperatura ambiente: o motor atual não possui perdas ambientais e a distribuição de temperatura tende a se uniformizar. A restauração da experiência, por sua vez, retorna o campo térmico transitório ao estado-base.

### 3.2 Deformação + campo elétrico

**Identificador:** COMBO-ME-01  
**Experiência principal:** maleabilidade ou ductilidade.  
**Estímulo auxiliar:** campo elétrico transitório.  
**Escopo efetivo atual:** experiência mecânica na estrutura cristalina.

A integração permite ligar o campo durante a experiência mecânica. A deformação representada fornece um nível normalizado de defeitos/deslizamentos ao modelo eletrônico; esse nível aumenta o espalhamento qualitativo e reduz a deriva média. O campo, por sua vez, fornece o viés direcional para o movimento médio dos marcadores eletrônicos.

**Direções modeladas:**
- campo elétrico → deriva eletrônica qualitativa;
- deformação representada → espalhamento eletrônico qualitativo.

**Direção não modelada:** campo elétrico → tensão, movimento de discordâncias, escoamento ou deformação mecânica.

Portanto, esta combinação não representa eletroplasticidade. Ela permite observar simultaneamente o transporte sob campo e a influência qualitativa dos defeitos de deformação sobre esse transporte. Não calcula resistividade real nem força elétrica sobre discordâncias.

Quando o campo auxiliar é desligado, a deriva direcional cessa, mas o estado de deformação permanece até a restauração ou o encerramento da experiência mecânica. A restauração desliga o campo e retorna o modelo mecânico ao estado-base.

## 4. Matriz de compatibilidade das seis combinações em pares

| Par de estímulos | Classificação | Fenômeno e decisão |
|---|---|---|
| Luminoso + térmico | Fisicamente plausível; não modelado | Luz absorvida pode transferir energia à amostra, mas a fração absorvida depende do comprimento de onda, da superfície, da temperatura e da condição óptica. A lanterna atual é uma ferramenta geométrica de reflexão, não uma fonte térmica calibrada. |
| Luminoso + elétrico | Possível em configurações específicas; não homologado | Efeitos de eletroreflectância existem em configurações de eletrodo, interface e espectroscopia. Não se deve generalizar esse comportamento para qualquer bloco de metal elementar sob um campo uniforme. |
| Luminoso + mecânico | Possível como acoplamento geométrico; não modelado | Uma mudança real da orientação da superfície pode alterar a normal e a direção da reflexão especular. A cena atual não atualiza a superfície óptica e a reflexão a partir do estado mecânico deformado. |
| Térmico + elétrico | Implementado qualitativamente, com restrições | A temperatura local altera o espalhamento e a deriva eletrônica. Limitado ao contexto cristalino; não inclui aquecimento Joule nem transporte quantitativo. |
| Térmico + mecânico | Fisicamente plausível; não modelado | A temperatura influencia mobilidade de discordâncias, tensão de escoamento, recuperação e outros mecanismos de deformação. Não existe ainda lei constitutiva dependente de temperatura no motor mecânico. |
| Mecânico + elétrico | Implementado qualitativamente, com restrições | Campo e deformação coexistem; os defeitos representados alteram o transporte eletrônico. O modelo não representa eletroplasticidade nem efeito do campo sobre a deformação. |

### 4.1 Luminoso + térmico

A absorção óptica pode atuar como termo de entrada no balanço térmico, mas não se deve converter automaticamente toda luz incidente em calor. Uma futura implementação exigirá, no mínimo, espectro ou comprimento de onda, irradiância, área iluminada, duração, absortância/refletância nas condições relevantes e uma ligação explícita ao motor térmico.

A fonte luminosa não poderá criar uma segunda cópia do controlador térmico. A energia absorvida, quando validada, deverá entrar como termo de potência no mesmo balanço de energia usado pela experiência térmica.

### 4.2 Luminoso + elétrico

A eletroreflectância é um fenômeno experimental específico, que depende da configuração de campo, da interface e do arranjo espectroscópico. Não será tratada como uma alteração genérica de brilho provocada por qualquer campo aplicado. Uma futura implementação deverá definir a configuração experimental e os dados ópticos/eletrônicos correspondentes.

### 4.3 Luminoso + mecânico

O acoplamento geométrico mais simples seria atualizar a normal da superfície iluminada e recalcular a reflexão a partir da geometria deformada. Isso exige uma superfície identificável e uma transformação geométrica consistente; não autoriza inferir mudança de cor, refletância espectral ou resposta óptica intrínseca.

### 4.4 Térmico + mecânico

A temperatura altera mecanismos de deformação e ativação de discordâncias. Uma implementação exigirá parâmetros mecânicos dependentes de temperatura, fase e taxa de deformação, além de limites de validade. O motor atual não deve apenas reduzir o limiar visual de deslizamento para simular aquecimento.

### 4.5 Térmico + elétrico e mecânico + elétrico

Os dois acoplamentos estão descritos nas seções 3.1 e 3.2. São qualitativos, não quantitativos, e não devem ser descritos na interface como medidas da resistividade ou da condutividade do metal.

## 5. Combinações de três ou quatro estímulos

Nenhuma combinação tripla ou quádrupla está autorizada nesta etapa.

A presença de pares já representados não autoriza automaticamente combinações maiores. Por exemplo, calor + campo + deformação exigiria tratar simultaneamente a dependência térmica do transporte, a contribuição dos defeitos e a influência da temperatura na deformação, com um estado comum e uma sequência temporal validada.

Luz + calor + campo também não pode ser liberada pela soma de dois controles: a energia absorvida deve ser contabilizada uma única vez, e qualquer dependência óptica da temperatura precisaria de dados e modelo próprios.

Combinações maiores poderão ser propostas somente depois de:
- cada acoplamento individual estar definido e testado;
- as variáveis compartilhadas possuírem uma única fonte de verdade;
- a sequência de atualização e o balanço de energia estarem definidos;
- os efeitos cruzados e as condições de contorno estarem documentados;
- existirem testes de regressão e critérios de validação científica.

## 6. Estado compartilhado e fluxo causal

A combinação deve trabalhar sobre o mesmo estado da amostra. Não se admite criar uma segunda rede, outro controlador de temperatura ou outra camada eletrônica para representar o estímulo auxiliar.

### 6.1 Variáveis centrais

| Variável | Origem | Consumidores |
|---|---|---|
| Temperatura local | Controlador térmico único | Transporte eletrônico; futuramente, modelo mecânico e resposta óptica se houver dados. |
| Estado de deformação/defeitos | Motor mecânico único | Geometria da amostra; transporte eletrônico qualitativo. |
| Campo elétrico aplicado | Controlador de estímulo elétrico | Deriva eletrônica; futuramente, outros efeitos apenas se homologados. |
| Estado óptico/geometria de superfície | Modelo óptico e geometria da amostra | Direção e resposta de reflexão; futuramente, balanço de absorção. |
| Energia térmica | Balanço térmico único | Temperatura local e trocas de energia definidas no modelo. |

### 6.2 Regras contra motores duplicados

1. Deve existir um único controlador térmico por investigação/cena. A experiência térmica e o acoplamento calor + campo devem reutilizá-lo.
2. Deve existir uma única camada eletrônica por cena. Campo, temperatura e defeitos fornecem entradas ao mesmo modelo de transporte.
3. O estado mecânico pertence a um único motor de deformação. O estímulo elétrico auxiliar não pode criar outro motor mecânico.
4. Cada termo de potência deve entrar uma única vez no balanço térmico. Em um modelo futuro, absorção óptica e aquecimento Joule serão entradas distintas apenas quando ambos forem calculados e validados.
5. A interface não deve armazenar cópias próprias de temperatura, deformação ou campo. Deve consultar e comandar os controladores de domínio autorizados.

### 6.3 Sequência determinística de atualização

Quando uma combinação for autorizada, o modelo deverá manter uma ordem definida por passo de simulação:

1. validar a experiência principal e as condições de elegibilidade;
2. ler estímulos e parâmetros ativos;
3. atualizar as fontes de energia e os campos aplicados;
4. avançar uma única vez os estados de domínio que possuam dinâmica própria;
5. calcular as respostas acopladas a partir do estado atualizado;
6. atualizar a representação visual e os indicadores;
7. registrar somente eventos ou observações relevantes, não cada quadro.

A ordem exata deverá ser adequada às equações do acoplamento e documentada junto aos testes. Não se pode permitir que dois controladores escrevam independentemente a mesma variável física no mesmo passo.

### 6.4 Balanço térmico e efeitos contabilizados uma única vez

Em modelos físicos futuros, a geração de calor por absorção óptica e por efeito Joule deve entrar como termos de potência no mesmo balanço térmico. Em particular:

- potência óptica absorvida depende da radiação incidente e da absortância nas condições da superfície;
- potência Joule depende de grandezas elétricas físicas e da geometria do corpo;
- condução, convecção e radiação devem ser contabilizadas conforme as condições de contorno;
- desligar uma fonte interrompe sua entrada, mas não remove instantaneamente a energia já armazenada.

O modelo atual não deve ser descrito como se já realizasse esse balanço completo.

## 7. Proposta de interface: painel único de aplicação

A evolução da interface deverá reunir a seleção e aplicação das propriedades em **um único painel contextual dentro de Explorar**. O objetivo é substituir a fragmentação atual dos controles por família de estímulo, sem transformar o painel em um novo módulo ou criar uma quarta área de navegação.

### 7.1 Princípio de organização

O painel apresenta o catálogo de propriedades e experiências disponíveis para o metal e a estrutura atuais. O estudante escolhe uma experiência principal; o conteúdo do próprio painel passa a mostrar seus parâmetros e apenas as condições auxiliares compatíveis.

A interface distingue semanticamente:

- **Investigar:** propriedade/experiência principal selecionada.
- **Aplicar:** estímulo ou condição de ensaio que pode atuar sobre a experiência.
- **Observar:** resposta e limitações do modelo.

Essa distinção deve ser apresentada no mesmo fluxo visual, e não em painéis independentes para luz, calor, campo e deformação.

### 7.2 Comportamento esperado

1. Antes de iniciar, o painel apresenta as experiências elegíveis para a amostra atual.
2. Ao selecionar uma experiência, seus controles principais aparecem no próprio painel.
3. As combinações autorizadas aparecem como condições adicionais aplicáveis no mesmo contexto.
4. As combinações não homologadas não recebem um controle ativo. Quando relevante, a interface informa de forma breve que a condição ainda não é suportada.
5. O painel identifica qual é a experiência principal e qual é a condição auxiliar; o aluno não pode confundir os dois papéis.
6. Restaurar e encerrar permanecem ações distintas e visíveis.
7. A troca de experiência principal encerra ou exige restauração explícita da anterior; nunca deixa um estímulo auxiliar órfão.
8. A disponibilidade é determinada pelo domínio e pela elegibilidade, não por regras visuais independentes.

### 7.3 Exemplos do painel contextual

| Experiência escolhida | Condição auxiliar apresentada |
|---|---|
| Condutividade elétrica | Aplicar calor (qualitativo; apenas na estrutura cristalina). |
| Maleabilidade | Aplicar campo elétrico (qualitativo). |
| Ductilidade | Aplicar campo elétrico (qualitativo). |
| Brilho/reflexão | Nenhuma combinação auxiliar liberada nesta etapa. |
| Experiência térmica | Nenhuma combinação auxiliar liberada nesta etapa. |

O painel não deve oferecer calor como condição auxiliar na experiência mecânica, luz como condição térmica ou campo como modulador óptico até que essas combinações sejam especificadas e validadas.

### 7.4 Requisitos de interface e acessibilidade

- Não criar uma aba, módulo ou rota para cada família de estímulos.
- Não duplicar o mesmo controle em painel e cena sem sincronização por uma única ação de domínio.
- Mostrar apenas opções compatíveis com a experiência e a estrutura atuais.
- Distinguir visual e textualmente experiência principal e condição auxiliar.
- Usar ícones discretos e rótulos curtos; não depender apenas de cor.
- Preservar teclado, leitor de tela, foco visível e movimento reduzido.
- Em telas estreitas, manter o painel contextual utilizável sem exigir precisão de arrasto.
- Exibir a limitação científica junto à opção que a exige, sem longos blocos explicativos.

**Estado:** proposta especificada; a interface existente ainda não foi modificada.

## 8. Regras de ativação, desligamento e restauração

- A experiência principal deve ser iniciada antes da condição auxiliar.
- Um estímulo auxiliar só pode ser ativado se a combinação constar na matriz homologada e todas as pré-condições forem satisfeitas.
- Desligar o estímulo auxiliar interrompe sua entrada, mas não apaga variáveis persistentes que tenham sido alteradas por uma experiência.
- Restaurar retorna os estados da experiência e das condições auxiliares ao estado-base definido.
- Encerrar desativa a experiência principal e todos os seus estímulos auxiliares.
- Ao sair de Explorar, comandos de fontes e atuadores são bloqueados e os motores transitórios são suspensos conforme o contrato operacional.
- O retorno a Explorar exige nova ação explícita para reativar fontes e condições auxiliares.
- Nenhum estímulo continua funcionando como experiência independente depois que a experiência principal termina.

## 9. Testes exigidos antes de habilitar uma combinação

Cada combinação deverá ter testes de domínio e integração que confirmem:

- pré-condições de estrutura, fase e elegibilidade;
- experiência principal única;
- rejeição de combinações não homologadas;
- consistência entre controles do painel e da cena;
- existência de um único controlador por variável compartilhada;
- desligamento correto do estímulo auxiliar;
- restauração e encerramento completos;
- suspensão ao sair de Explorar;
- ausência de alteração científica por simples mostrar/ocultar de camadas;
- atualização determinística sem dupla integração;
- preservação das limitações e do rótulo de evidência;
- acessibilidade dos estados ligados, desligados e indisponíveis.

Testes específicos adicionais:

| Combinação | Verificação essencial |
|---|---|
| Calor + campo elétrico | Temperatura local afeta uma única camada eletrônica; nenhum aquecimento Joule fictício é introduzido; o escopo cristalino é respeitado. |
| Deformação + campo elétrico | Defeitos qualitativos afetam o transporte; o campo não modifica o motor mecânico; restaurar limpa ambos os estados transitórios. |
| Luz + calor | A energia absorvida é contabilizada uma única vez e depende de dados/condições ópticas validados. |
| Luz + elétrico | A alteração espectral depende de configuração experimental definida; não existe efeito genérico automático. |
| Luz + mecânico | A normal da superfície e a reflexão são recalculadas a partir da geometria deformada, sem inventar mudança de cor. |
| Calor + mecânico | O modelo mecânico usa parâmetros dependentes de temperatura e condições de validade documentadas. |

## 10. Critérios de aceitação da Etapa 6

- [ ] As seis combinações em pares estão classificadas.
- [ ] As duas combinações existentes foram auditadas no código e suas restrições estão explícitas.
- [ ] Não há combinação tripla ou quádrupla habilitada implicitamente.
- [ ] A experiência principal e o estímulo auxiliar possuem papéis distintos.
- [ ] Cada variável compartilhada possui uma única fonte de verdade.
- [ ] O mesmo controlador térmico é reutilizado; não há motores duplicados.
- [ ] Os efeitos elétricos, térmicos e mecânicos não são apresentados como grandezas físicas quando são didáticos.
- [ ] A interface-alvo usa um único painel contextual de aplicação, sem áreas separadas por família de estímulo.
- [ ] As opções auxiliares aparecem de acordo com a matriz e a elegibilidade.
- [ ] A ativação, desligamento, restauração e encerramento têm comportamento definido.
- [ ] Testes científicos e de integração estão especificados para cada acoplamento.

## 11. Referências científicas de apoio

- BHATIA, A. B.; GUPTA, O. P. **Electrical Resistivity due to Dislocations**. *Physical Review B*, 1, 4577 (1970). DOI: [10.1103/PhysRevB.1.4577](https://doi.org/10.1103/PhysRevB.1.4577).
- DEXTER, D. L. **Scattering of Electrons in Metals by Dislocations**. *Physical Review*, 86, 770 (1952). DOI: [10.1103/PhysRev.86.770](https://doi.org/10.1103/PhysRev.86.770).
- GAIGALAS, A.; WANG, L. **Stark Spectroscopy at Metal Surfaces**. NIST (2000). [NIST publication](https://www.nist.gov/publications/stark-spectroscopy-metal-surfaces).
- **Optical Characterization in Microelectronics Manufacturing**. *Micromachines* (2021). [PMC8345267](https://pmc.ncbi.nlm.nih.gov/articles/PMC8345267/).
- VOLPP, J. **Laser light absorption of high-temperature metal surfaces**. *Heliyon* (2023). DOI: [10.1016/j.heliyon.2023.e21021](https://doi.org/10.1016/j.heliyon.2023.e21021).
- **The Temperature Dependence of Deformation Behaviors in High-Entropy Alloys: A Review**. *Metals*, 11(12), 2005 (2021). [MDPI article](https://www.mdpi.com/2075-4701/11/12/2005).
- **Thermoelectrics — Resistivity of a Metal**. Northwestern University, Materials Science. [Reference page](https://thermoelectrics.matsci.northwestern.edu/thermoelectrics/).

As referências sustentam a plausibilidade física dos mecanismos, mas não fornecem automaticamente parâmetros válidos para cada metal, fase, superfície ou condição da amostra do SILM. A homologação de dados específicos continua sujeita às regras de proveniência dos documentos de estímulo.

## 12. Limites desta entrega

Esta etapa conclui a especificação das combinações e do painel contextual de aplicação. Não inclui alteração de código, novo controlador, interface implementada, mudança de schema, dados numéricos, testes executados ou publicação na branch `main`.

A próxima etapa do aprofundamento do Explorar é a **Etapa 7 — Camadas de visualização**, distinguindo camadas científicas, representações auxiliares, indicadores de estado e controles de visibilidade sem alterar o estado científico.
