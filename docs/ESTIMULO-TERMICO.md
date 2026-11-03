# Estímulo térmico — contrato científico e funcional

> **Etapa:** 3 do aprofundamento de Explorar.  
> **Status:** especificação para desenvolvimento; não representa implementação concluída.  
> **Escopo:** aquecimento e troca de energia em uma amostra virtual de metal elementar, em fase sólida e sob condições declaradas.

## 1. Objetivo

O estímulo térmico deve permitir aplicar calor à amostra, escolher onde a fonte atua, acompanhar a propagação de energia pela estrutura, desligar a fonte e observar a evolução térmica até o equilíbrio com o ambiente.

A experiência precisa representar separadamente:

1. **Fornecimento de energia:** potência aplicada pela fonte e região de aplicação.
2. **Condução interna:** transferência de energia entre regiões do material.
3. **Armazenamento térmico:** energia necessária para alterar a temperatura da amostra.
4. **Troca com o ambiente:** energia que deixa ou entra no material pela superfície.
5. **Estado térmico:** campo de temperatura resultante ao longo do tempo.
6. **Representação:** vibração, níveis térmicos e indicações da cena.
7. **Evidência e limite:** quais dados sustentam o modelo e quais parâmetros continuam didáticos.

O objetivo é que o estudante compreenda a diferença entre aquecer, conduzir calor, atingir equilíbrio térmico e resfriar. O efeito visual não pode ser confundido com uma medição experimental de temperatura.

## 2. Auditoria da implementação atual

A implementação consultada em domain/silm/thermal.js já possui um motor contínuo e reaproveita a geometria cristalográfica da amostra.

### 2.1 O que já existe

- grafo de vizinhos construído a partir das posições dos centros da estrutura;
- propagação temporal por um passo explícito;
- fonte localizada por centros fixados na temperatura normalizada 1;
- distribuição térmica armazenada transitoriamente no controlador;
- consulta da temperatura por centro e leitura agregada do campo;
- suporte a movimento reduzido;
- reaproveitamento do mesmo controlador na combinação calor + corrente;
- reinício do campo térmico ao iniciar uma nova experiência.

### 2.2 Modelo numérico atual

O motor usa:

- D = 0,45, coeficiente didático;
- DT = 1/120 s, passo do integrador da animação;
- SETTLE = 0,01, tolerância para considerar a distribuição aproximadamente uniforme;
- temperatura normalizada entre 0 (ambiente) e 1 (fonte);
- grafo de vizinhos imediatos;
- fonte ideal: os centros sob a fonte ficam fixos em 1 enquanto ela está ligada.

O passo atual é equivalente a:

\[
T_i^{\,n+1}=T_i^{\,n}+D\,\Delta t\sum_{j\in N(i)}(T_j^{\,n}-T_i^{\,n})
\]

A atualização interna redistribui energia entre vizinhos. Sem fonte, o modelo converge para uma distribuição uniforme e conserva a soma das temperaturas normalizadas, pois não há termo de troca com o ambiente.

### 2.3 Limitações confirmadas

| Tema | Situação atual | Consequência |
|---|---|---|
| Fonte | Centros sob a fonte permanecem fixos em 1 | A fonte funciona como reservatório ideal, podendo fornecer energia continuamente sem balanço de potência. |
| Posição | A representação possui posição da fonte e seleção de centros | Falta padronizar a escolha da região de aplicação como operação clara do estudante. |
| Condução | Coeficiente didático único para todos os metais | Não permite comparar a resposta térmica específica de cada metal. |
| Capacidade térmica | Não há capacidade térmica por região | O modelo não distingue materiais que precisam de quantidades diferentes de energia para variar a temperatura. |
| Ambiente | Não existe termo de perda/ganho ambiental | Desligar a fonte não faz o material voltar à temperatura ambiente. |
| Tempo | Tempo de simulação é o da animação | Não pode ser interpretado como segundos reais do metal. |
| Fase | Não há fusão ou mudança de fase | A experiência representa somente aquecimento dentro do domínio sólido definido. |
| Estado | Fonte ligada é persistida; temperaturas e fonte espacial são transitórias | Não há reprodução completa das condições de uma execução. |

A próxima versão deve preservar o que já funciona — grafo estrutural, atualização contínua, leitura por centro e integração com a experiência elétrica —, mas substituir a fonte ideal e acrescentar o balanço ambiental.

## 3. Fundamento físico

### 3.1 Lei de Fourier

A condução térmica é descrita, no modelo contínuo, pela lei de Fourier:

\[
\vec q=-\kappa\nabla T
\]

onde:

- \(\vec q\) é o fluxo de calor por área;
- \(\kappa\) é a condutividade térmica;
- \(\nabla T\) é o gradiente de temperatura.

O sinal negativo indica que o calor flui espontaneamente das regiões mais quentes para as mais frias.

Para um meio homogêneo, sem mudança de fase e com propriedades aproximadamente constantes:

\[
\rho c_p\frac{\partial T}{\partial t}
=
\nabla\cdot(\kappa\nabla T)+\dot q'''
\]

em que \(\rho\) é a densidade, \(c_p\) é o calor específico e \(\dot q'''\) representa a geração de calor por unidade de volume.

A difusividade térmica é:

\[
\alpha=\frac{\kappa}{\rho c_p}
\]

Ela expressa a rapidez com que uma perturbação de temperatura se difunde em relação à capacidade do material de armazenar energia. A unidade SI é m²/s.

**Distinção importante:** condutividade térmica e difusividade térmica não são a mesma grandeza. A condutividade caracteriza a capacidade de transportar calor sob gradiente; a difusividade combina transporte e armazenamento térmico.

### 3.2 Rede térmica discreta do SILM

O SILM representa uma amostra por regiões visuais associadas aos sítios da estrutura. Essas regiões são nós de um modelo térmico reduzido, não átomos com temperatura individual medida.

A formulação de referência para cada nó i será:

\[
C_i\frac{dT_i}{dt}
=
\sum_{j\in N(i)}G_{ij}(T_j-T_i)
+P_i(t)
-H_i(T_i-T_\infty)
-Q_{\mathrm{rad},i}
\]

onde:

- \(C_i\): capacidade térmica efetiva da região (J/K);
- \(G_{ij}\): condutância térmica efetiva entre regiões i e j (W/K);
- \(P_i(t)\): potência térmica aplicada à região (W);
- \(H_i=h_iA_i\): condutância de troca convectiva com o ambiente (W/K);
- \(T_\infty\): temperatura do ambiente;
- \(Q_{\mathrm{rad},i}\): perda radiativa, quando o modelo a habilitar.

Para um nó interior, \(H_i\) e a área exposta são nulos. O termo ambiental atua nas regiões que representam a superfície externa da amostra.

A transferência entre dois nós usa condutância simétrica:

\[
G_{ij}=G_{ji}
\]

Assim, a energia que sai de um nó por condução entra no outro. O termo de condução interna conserva energia no sistema fechado; a fonte e a fronteira ambiental alteram a energia total.

### 3.3 Relação com a forma contínua

Quando houver geometria e dados suficientes, a condutância entre regiões vizinhas pode ser relacionada à condutividade e à geometria da ligação, de forma esquemática:

\[
G_{ij}\approx\frac{\kappa_{ij}A_{ij}}{\ell_{ij}}
\]

A aproximação deve declarar a área efetiva de contato Aij, a distância característica ℓij, a condutividade considerada e a orientação. Não basta inserir um coeficiente numérico sem unidade e chamá-lo de propriedade do metal.

O modelo reduzido poderá continuar usando coeficientes normalizados na versão didática. Nesse caso, não haverá escala física de potência, energia ou tempo.

## 4. Fonte de calor

### 4.1 Comportamento requerido

A fonte deve fornecer energia a uma região escolhida pelo estudante. A primeira versão deve privilegiar uma fonte de contato localizada, representada por um aquecedor ou ponta térmica junto à amostra.

O usuário deve poder:

- ativar e desativar a fonte;
- escolher o ponto ou região aquecida;
- definir a intensidade da fonte;
- visualizar a área de atuação;
- acompanhar o fornecimento de energia enquanto a fonte estiver ligada.

### 4.2 Entrada sem precisão de arraste

A localização deve funcionar por toque/clique em uma região da amostra. Arrastar a fonte pode ser uma alternativa no desktop, mas não deve ser a única forma de posicioná-la. A interface precisa oferecer teclado e controles alternativos.

A intensidade deve ser apresentada como nível de aplicação da fonte. Enquanto não houver calibração física, o controle deve ser explicitamente normalizado (por exemplo, baixo, médio e alto, ou percentual sem unidade). Não apresentar watts fictícios.

### 4.3 Fonte finita, não reservatório infinito

O padrão recomendado é uma fonte de potência finita:

\[
P_i(t)\geq 0
\]

A potência aplicada deve ser distribuída somente pelos nós dentro da região selecionada. Desligar a fonte faz P_i(t)=0, sem apagar o calor armazenado.

Uma fronteira de temperatura constante (condição de Dirichlet) só deve ser usada quando a experiência representar deliberadamente um reservatório térmico de temperatura controlada. Não deve ser o comportamento padrão de uma fonte portátil ou de contato.

O modelo atual fixa os nós sob a fonte em T=1. Essa abordagem deverá ser retirada do caminho padrão quando a entrada por potência finita estiver validada.

## 5. Condução, equilíbrio e resfriamento

São quatro situações diferentes e devem ser apresentadas separadamente.

### 5.1 Aquecimento

Enquanto a fonte está ligada, a potência fornecida eleva a energia térmica das regiões atingidas. O gradiente faz a energia se propagar para as regiões vizinhas.

A temperatura do nó sob a fonte não precisa aumentar indefinidamente: a evolução depende do balanço entre entrada, condução interna e perdas ambientais.

### 5.2 Condução interna

A energia se transfere entre regiões conectadas pelo grafo. Uma região mais quente fornece energia às regiões mais frias.

A visualização deve representar a propagação sobre a estrutura, sem sugerir que cada átomo recebeu um termômetro. A distribuição de temperatura é um campo macroscópico/coarse-grained associado às regiões visuais.

### 5.3 Equilíbrio térmico interno

Quando a fonte é desligada e não há troca com o ambiente, a energia pode se redistribuir até que a temperatura fique uniforme. Esse é o equilíbrio interno do sistema isolado, não necessariamente a temperatura ambiente.

Com fonte ligada, pode existir um estado estacionário em que a potência fornecida se equilibra com as perdas. Esse estado não é necessariamente uniforme.

### 5.4 Resfriamento para o ambiente

Ao desligar a fonte, a condução interna continua. Se a superfície troca energia com um ambiente de temperatura T∞, a energia excedente deixa o material e a temperatura média se aproxima de T∞.

A lei de resfriamento de Newton é:

\[
\dot Q_{\mathrm{conv}}=hA(T_s-T_\infty)
\]

onde h depende da geometria, fluido e condições do escoamento. Se o ambiente estiver mais quente que a superfície, o sinal se inverte e o material recebe energia.

É normal que alguns nós aumentem temporariamente de temperatura após desligar a fonte: eles podem receber energia de regiões ainda mais quentes. O requisito de resfriamento deve ser avaliado pela energia excedente total e pela aproximação do sistema ao ambiente, não pela obrigação de cada nó diminuir em todos os instantes.

## 6. Troca térmica com o ambiente

### 6.1 Convecção — primeira versão ambiental

A primeira implementação de resfriamento deve incluir uma fronteira convectiva simplificada, baseada na lei de resfriamento de Newton.

O SILM deverá declarar:

- ambiente de referência;
- temperatura ambiente;
- quais nós pertencem à superfície exposta;
- coeficiente de troca utilizado;
- se o coeficiente é didático ou vem de uma correlação/dado validado;
- hipótese de ar parado, convecção natural ou fluxo forçado.

O coeficiente convectivo depende da geometria e do movimento do fluido. Sem esses dados, o programa deve usar um parâmetro didático claramente identificado, não afirmar que simula o resfriamento real de uma amostra específica.

### 6.2 Radiação térmica — extensão posterior

A troca radiativa líquida pode ser representada por:

\[
Q_{\mathrm{rad}}=
\varepsilon\sigma A(T_s^4-T_{\mathrm{sur}}^4)
\]

em que as temperaturas devem estar em kelvin, ε é a emissividade e σ é a constante de Stefan–Boltzmann.

A radiação não deve ser ativada com um coeficiente arbitrário ou com uma temperatura normalizada entre 0 e 1. Exige temperatura absoluta, emissividade, área e temperatura radiativa do entorno. A emissividade depende da superfície, comprimento de onda e condições do material.

**Decisão de escopo:** a primeira versão do resfriamento implementa convecção simplificada. A radiação fica como extensão opcional, ativada somente com parâmetros e condições adequados.

## 7. Condições iniciais e ambiente de referência

A experiência começa com a amostra em equilíbrio com o ambiente de referência. Como convenção didática inicial, pode-se oferecer 25 °C (298,15 K) como cenário padrão. Esse número é uma condição escolhida para a experiência, não uma medição da temperatura da sala do estudante.

O estudante deve conseguir distinguir:

- temperatura inicial;
- temperatura do ambiente;
- temperatura da fonte, quando houver um reservatório de temperatura constante;
- intensidade/potência relativa da fonte;
- tempo decorrido na simulação.

A primeira versão pode trabalhar em temperatura relativa θ=T−T∞, desde que a interface informe que o campo é normalizado e a conversão para kelvin só ocorra com escala física completa.

Se a radiação for ativada, o motor deve trabalhar com temperaturas absolutas em kelvin. Não usar Celsius em termos de quarta potência.

## 8. Propriedades específicas do metal e proveniência

### 8.1 Dados necessários

Para passar de um modelo didático comum a uma resposta dependente do metal, serão necessários, conforme o nível de modelo:

| Propriedade | Símbolo | Unidade SI | Uso |
|---|---|---|---|
| Condutividade térmica | κ | W/(m·K) | Transporte de calor |
| Densidade | ρ | kg/m³ | Massa/volume e capacidade térmica volumétrica |
| Calor específico | cp | J/(kg·K) | Energia necessária para variar a temperatura |
| Difusividade térmica | α | m²/s | Resposta transiente combinada |
| Emissividade | ε | adimensional | Troca radiativa, se habilitada |

A difusividade pode ser derivada pelo SILM quando κ, ρ e cp forem compatíveis em temperatura, fase, orientação e condição. A origem deve ser classificada como calculada e deve preservar as fontes dos valores de entrada.

### 8.2 Dados com dependência de temperatura

A condutividade e o calor específico podem variar com a temperatura. O banco deve guardar a temperatura ou intervalo ao qual os valores se aplicam. Se existir apenas um valor pontual, o SILM não deve extrapolar uma curva até altas temperaturas.

Anisotropia, pureza e forma da amostra devem ser registradas quando informadas pela fonte. Uma medida de policristal não deve ser rotulada como resposta de monocristal orientado.

### 8.3 Transporte em metais

Nos metais, a condução térmica total pode incluir contribuições eletrônicas e da rede:

\[
\kappa=\kappa_e+\kappa_{\mathrm{rede}}
\]

A relação de Wiedemann–Franz pode estimar a contribuição eletrônica em condições apropriadas:

\[
\kappa_e=L\sigma T
\]

Ela não deve ser tratada como identidade universal para a condutividade térmica total. O número de Lorenz real pode variar e a contribuição da rede não desaparece. Não inferir κ de um valor elétrico sem declarar a hipótese e a incerteza.

### 8.4 Situação atual do banco

No banco consultado, elements[].properties está vazio para os 118 elementos. Portanto, não há atualmente dados numéricos homologados no SILM para condutividade térmica, calor específico ou emissividade por elemento.

A experiência deve continuar qualitativa e usar parâmetros didáticos até que os dados sejam curados. Não atribuir coeficientes de cobre a todos os metais nem preencher valores típicos sem fonte.

### 8.5 Organização de dados futura

A curadoria pode permanecer no banco principal quando os campos forem simples e compartilhados com outros motores, ou usar um arquivo versionado dedicado, como thermal-properties.json, quando houver múltiplas curvas e condições por elemento.

Cada conjunto deve conter:

- elemento e número atômico;
- fonte e DOI/URL;
- natureza da evidência (experimental, avaliada ou calculada);
- propriedade, valor, unidade e faixa de temperatura;
- fase e pressão;
- pureza e orientação, quando informadas;
- método e forma da amostra;
- incerteza publicada;
- observações e limitações.

Não misturar em um mesmo campo valores de condutividade, difusividade e coeficiente convectivo. O coeficiente convectivo pertence à fronteira/ambiente, não é uma propriedade intrínseca do metal.

## 9. Interface e camadas visuais

### 9.1 Ferramentas

| Controle | Ação |
|---|---|
| Fonte térmica | Ligar ou desligar a aplicação de energia |
| Região de aplicação | Escolher por toque/clique a posição da fonte |
| Intensidade | Escolher nível relativo de aquecimento |
| Ambiente | Consultar a condição de referência; futura opção de ambiente controlado |
| Estado da fonte | Mostrar claramente ligada/desligada |
| Tempo | Consultar o tempo de simulação, sem sugerir tempo físico real quando o motor for didático |
| Restaurar | Retornar à condição inicial da experiência |
| Encerrar | Finalizar a experiência e voltar ao estado-base |

As ações devem ficar disponíveis por teclado e toque. Não obrigar o estudante a arrastar com precisão a fonte até um pequeno ponto.

### 9.2 Visualização

A cena deve separar as seguintes informações:

- fonte e região diretamente aquecida;
- distribuição térmica pela estrutura;
- direção de propagação entre regiões;
- vibração da rede, quando representada;
- fronteira exposta ao ambiente;
- indicação de fonte ligada/desligada;
- condição de movimento reduzido.

Temperatura não pode ser indicada somente por cor. Usar também anéis, padrões, rótulos curtos ou níveis nomeados. A cor pode reforçar a leitura, mas não ser o único canal.

A vibração visual é uma representação da agitação térmica da rede. Não deve ser confundida com deslocamento permanente dos centros nem com velocidade real de elétrons. A condução térmica dos elétrons não pode ser interpretada como se o passeio visual das partículas fosse o fluxo de calor completo.

## 10. Relação com a experiência elétrica

O contrato operacional já reconhece calor + corrente como uma combinação válida. A atualização térmica deve manter um único subsistema de temperatura, compartilhado entre:

- experiência principal de condução térmica;
- fonte térmica auxiliar durante a experiência principal de condução elétrica.

Na combinação calor + corrente:

- a fonte térmica continua aplicando energia pelo mesmo motor;
- o campo elétrico continua sendo um estímulo auxiliar da experiência elétrica;
- a temperatura local pode modular qualitativamente o espalhamento eletrônico;
- o efeito sobre a deriva deve continuar identificado como didático enquanto não houver resistividade elétrica dependente da temperatura para aquele metal;
- os dois motores devem pausar quando Explorar deixar de estar ativo.

O calor não deve ser simulado duas vezes, em controladores separados, para a mesma investigação.

## 11. Ciclo da experiência térmica

1. **Preparar:** verificar metal, estrutura cristalina e elegibilidade.
2. **Iniciar:** selecionar a experiência térmica e definir o estado inicial em equilíbrio com o ambiente.
3. **Posicionar:** selecionar a região onde a fonte atuará.
4. **Aquecer:** ligar a fonte e fornecer energia com intensidade definida.
5. **Conduzir:** acompanhar a propagação por vizinhança.
6. **Desligar:** interromper a potência fornecida; não apagar a energia armazenada.
7. **Resfriar:** acompanhar condução interna e perda ambiental.
8. **Equilibrar:** identificar a aproximação ao ambiente ou o estado estacionário, conforme as condições.
9. **Restaurar ou encerrar:** restaurar retorna à condição inicial; encerrar termina a experiência.

O estudante deve poder religar a fonte durante uma experiência, desde que a sequência e as condições sejam claras. Alterar a posição da fonte durante o aquecimento deve atualizar a região de aplicação sem apagar a distribuição térmica já produzida.

## 12. Validação numérica e critérios de teste

A implementação deverá ser determinística, com passo de tempo fixo ou integrador cuja estabilidade tenha sido validada. A condição de estabilidade depende das capacidades térmicas, condutâncias entre nós, perdas de fronteira e do método de integração; não deve ser inferida apenas do número de vizinhos.

### 12.1 Invariantes físicos mínimos

- **Equilíbrio uniforme:** se todos os nós começarem em T∞, não deve haver fluxo térmico sem fonte.
- **Condução interna:** para pares simétricos, a energia transferida entre nós deve ser conservada no balanço do sistema fechado.
- **Fonte desligada e amostra isolada:** a energia total permanece constante; os gradientes diminuem até o equilíbrio interno.
- **Fonte ligada:** a energia fornecida deve aparecer no balanço energético; a fonte não pode aquecer sem limite por fixar nós indefinidamente.
- **Resfriamento ambiental:** sem fonte e com temperatura acima do ambiente, a energia excedente total deve diminuir; o sistema deve tender a T∞.
- **Redistribuição após desligar:** um nó individual pode aquecer por receber energia de um vizinho; o teste não deve exigir queda monotônica em todos os nós.
- **Estabilidade:** temperatura finita, sem oscilações numéricas ou valores fora dos limites físicos definidos.
- **Simetria:** em uma amostra e condições simétricas, resultados equivalentes devem respeitar a simetria da rede.
- **Movimento reduzido:** a experiência permanece compreensível sem animação contínua.
- **Pausa:** o tempo térmico não avança quando a rota está inativa, o módulo não é Explorar ou a página está suspensa.

### 12.2 Balanço global de energia

A forma de teste deve comparar:

\[
\Delta U =
E_{\mathrm{fonte}}
-
E_{\mathrm{perda\,ambiente}}
\]

em que a perda líquida para o ambiente é positiva quando a amostra perde energia e negativa quando o ambiente aquece a amostra. O teste compara essa diferença com a variação da energia armazenada, dentro da tolerância numérica definida pelo integrador. A tolerância e a escala só podem ser especificadas depois que o modelo de capacidade térmica e a unidade de cada termo estiverem fixados.

### 12.3 Critérios de aceitação

- [ ] O estudante consegue escolher a região aquecida sem arraste preciso.
- [ ] A fonte tem potência/entrada finita na primeira versão física.
- [ ] Desligar a fonte interrompe a entrada sem apagar o calor já armazenado.
- [ ] A energia continua se redistribuindo depois que a fonte é desligada.
- [ ] Existe troca de energia com o ambiente e retorno à condição ambiental.
- [ ] Aquecimento, condução, equilíbrio interno e resfriamento são distinguidos.
- [ ] O campo de temperatura é identificado como representação da amostra, não temperatura individual de cada átomo.
- [ ] Os coeficientes didáticos são identificados como didáticos.
- [ ] Não existem dados numéricos inventados para elementos sem fonte.
- [ ] A troca de módulo suspende a evolução térmica.
- [ ] Calor + corrente reutiliza o mesmo subsistema térmico.
- [ ] O histórico e os estados da investigação não são apagados ao desligar a fonte.
- [ ] Todos os testes de conservação, dissipação, estabilidade e simetria passam.

## 13. Plano de evolução

| Etapa | Desenvolvimento | Resultado |
|---|---|---|
| T0 — Atual | Difusão no grafo, fonte ideal fixada, sem perdas ambientais | Base funcional existente; qualitativa e com limitações declaradas |
| T1 — Fonte espacial e finita | Seleção por toque e entrada de potência distribuída na região | Aquecimento localizado sem reservatório infinito |
| T2 — Balanço térmico | Capacidade térmica efetiva e condutâncias entre regiões | Energia armazenada e transferida com coerência |
| T3 — Ambiente | Perda convectiva na superfície e temperatura ambiente | Desligamento seguido de resfriamento até o ambiente |
| T4 — Dados por metal | Condutividade, densidade e calor específico homologados | Resposta transiente específica quando as fontes permitirem |
| T5 — Radiação e refinamentos | Emissividade, radiação e dependência com temperatura, quando justificadas | Modelo de fronteira ampliado, sem simplificações indevidas |

O motor poderá continuar com uma versão normalizada didática antes de T4, mas deve identificar claramente o tempo e os coeficientes como não físicos. O uso de dados por metal não deve ser bloqueado pela arquitetura: deve ser possível introduzir fontes e condições específicas sem reescrever o contrato de experiência.

## 14. Fora do escopo inicial

- fusão, solidificação e calor latente;
- mudança de fase e transições alotrópicas;
- expansão térmica da rede;
- oxidação ou reação química durante aquecimento;
- combustão ou aquecimento até incandescência;
- transporte termoelétrico completo;
- comparação quantitativa de metais sem dados compatíveis;
- simulação atomística de dinâmica molecular;
- convecção fluida resolvida por CFD;
- radiação espectral completa.

Esses fenômenos exigem modelos e dados adicionais. A primeira versão deve manter a amostra no domínio sólido e evitar extrapolação para temperaturas fora das condições homologadas.

## 15. Referências

1. IUPAC. *Thermal diffusivity*. Compendium of Chemical Terminology (Gold Book), 5.ª ed., versão online 5.0.0, 2025. DOI: 10.1351/goldbook.08697. Define difusividade como condutividade térmica dividida pelo produto da densidade e calor específico. https://doi.org/10.1351/goldbook.08697
2. ASHRAE. *ASHRAE Handbook — Fundamentals*, capítulo 4: Heat Transfer. Discute condução, convecção, radiação e a lei de resfriamento de Newton. https://handbook.ashrae.org/Handbooks/F21/SI/f21_ch04/f21_ch04_si.aspx
3. Colorado State University, Department of Chemical and Biological Engineering. *Heat Transfer — Introduction to Chemical and Biological Engineering*. Lei de Fourier e fluxo de condução. https://www.engr.colostate.edu/CBE101/topics/heat_transfer.html
4. National Institute of Standards and Technology. *NIST Recommended Practice Guide: Data Evaluation Theory and Practice for Materials Properties*. NIST SP 960-11. Relação de consistência entre condutividade, calor específico, densidade e difusividade térmica. https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication960-11.pdf
5. Idaho National Laboratory. *TMAP8 — Heat Transfer Module*. Equação do calor e condições de contorno para transferência térmica. https://tmap8.inl.gov/modules/heat_transfer/index.html
6. *Thermoelectrics by Computational Design: Progress and Opportunities*. Annual Review of Materials Research, 2021. Discussão de contribuições eletrônica e de rede para a condutividade térmica e limites da relação de Wiedemann–Franz. https://doi.org/10.1146/annurev-matsci-100520-015716

## 16. Próxima etapa

A Etapa 4 deve aprofundar o **estímulo elétrico**: fonte/campo, geometria, resposta dos elétrons, corrente como fenômeno coletivo, acoplamento com temperatura e limites entre visualização qualitativa e grandezas elétricas mensuráveis.
