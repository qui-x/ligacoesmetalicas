# Estímulo elétrico — contrato científico e funcional

> **Etapa:** 4 do aprofundamento de Explorar.  
> **Status:** especificação para desenvolvimento; não representa implementação concluída.  
> **Escopo:** resposta qualitativa de um metal elementar sólido à aplicação de um campo elétrico. Não constitui um simulador de circuito nem um instrumento virtual de medição elétrica.

## 1. Objetivo

O estímulo elétrico deve permitir aplicar um campo à amostra, inverter seu sentido, alterar sua intensidade e observar a resposta coletiva dos elétrons de condução.

A experiência precisa distinguir:

1. **Campo elétrico:** condição aplicada ao material e direção da força elétrica.
2. **Movimento microscópico:** movimento irregular dos portadores e eventos de espalhamento.
3. **Deriva eletrônica:** pequena componente média do movimento dos elétrons, oposta ao campo.
4. **Corrente convencional:** fluxo de carga positiva equivalente, no sentido do campo para um metal isotrópico em regime ôhmico.
5. **Resistência à condução:** resposta do material associada aos mecanismos de espalhamento.
6. **Aquecimento Joule:** transformação de energia elétrica em energia térmica.
7. **Evidência e limite:** distinção entre modelo didático, dado tabelado, grandeza calculada e medição.

O propósito em Explorar é tornar visível a relação entre campo, portadores e corrente, sem transformar a trajetória dos marcadores em uma medida de velocidade, corrente ou condutividade.

## 2. Auditoria da implementação atual

### 2.1 O que já existe

O SILM já contém:

- experiência de condutividade elétrica no catálogo de propriedades;
- campo aplicado e removido por controle;
- seta de campo elétrico com sentido visual;
- camada de elétrons deslocalizados com marcadores qualitativos;
- movimento aleatório com viés médio oposto ao campo;
- controle transitório de intensidade entre 5 % e 100 %;
- combinação de calor + corrente;
- modulação qualitativa da frequência de espalhamento e da deriva conforme a temperatura local;
- combinação de deformação + corrente, com espalhamento adicional associado aos defeitos;
- estado de movimento reduzido e representação estática.

### 2.2 Como funciona atualmente

Na implementação de visualização eletrônica:

- os marcadores são criados por uma distribuição visual determinística associada à geometria da estrutura;
- há entre 24 e 150 marcadores, conforme o tamanho da cena;
- cada marcador percorre um passeio aleatório;
- quando o campo está ligado, o motor soma uma tendência de deslocamento no sentido oposto ao campo;
- marcadores que saem por uma extremidade reaparecem na outra, mantendo a animação contínua;
- os marcadores não correspondem ao número real de elétrons nem a trajetórias físicas individuais.

O motor usa fatores qualitativos para temperatura e deformação:

- espalhamento térmico: 1 + 3t;
- fator de deriva térmica: 1/(1 + 2t);
- espalhamento associado à deformação: 1 + 1,2d;
- fator de deriva associado à deformação: 1/(1 + 0,6d).

Aqui t representa uma temperatura local normalizada de 0 a 1 e d representa a deformação normalizada. Esses fatores são didáticos, iguais para todos os metais e não derivam de resistividade, mobilidade ou tempo de relaxação medidos.

A intensidade do campo multiplica a deriva visual. O motor também reduz a escala do passeio aleatório para 75 % quando o campo está ligado. Esse fator é de representação: não corresponde a uma redução física medida da velocidade térmica dos elétrons.

### 2.3 Inconsistência entre montagem livre e estrutura cristalina

A auditoria encontrou uma diferença concreta:

- na visualização cristalina, a integração entrega a intensidade do controlador ao motor de elétrons;
- na montagem livre, a integração atualiza a camada eletrônica sem entregar esse parâmetro;
- nesse caminho, o motor usa sua intensidade padrão.

A política deve ser unificada para que o mesmo controle tenha o mesmo significado nos dois modos, sem atribuir escala física ao percentual.

### 2.4 O que ainda não existe

| Tema | Situação atual | Consequência |
|---|---|---|
| Campo | Direção e intensidade visual normalizada | Não representa V/m nem resolve o potencial no interior da amostra. |
| Portadores | Marcadores qualitativos | Não representam número, densidade ou velocidade real dos elétrons. |
| Deriva | Viés de movimento arbitrário | Não é calculada a partir da mobilidade ou do tempo de relaxação do metal. |
| Corrente | Direção implícita no movimento coletivo | Não há valor de corrente total em ampères nem densidade em A/m². |
| Condutividade | Não homologada para os elementos no banco atual | Não há resposta específica de cada metal. |
| Circuito | Não existe fonte, contatos e circuito externo resolvidos | Não afirmar que a cena calcula uma bateria, tensão terminal ou circuito fechado real. |
| Aquecimento Joule | Não é gerado automaticamente pelo campo elétrico | Calor + corrente depende de uma fonte térmica auxiliar explícita. |
| Temperatura | Fatores didáticos sobre campo local normalizado | Não representa uma curva experimental de resistividade em função da temperatura. |
| Anisotropia | Não modelada | A resposta visual é isotrópica e uniforme. |

## 3. Fundamento físico

### 3.1 Força elétrica sobre os elétrons

A força elétrica sobre uma carga é:

\[
\vec F=q\vec E
\]

Para o elétron, \(q=-e\), onde \(e\) é o módulo positivo da carga elementar. Portanto:

\[
\vec F_e=-e\vec E
\]

A força sobre os elétrons tem sentido oposto ao campo elétrico.

### 3.2 Movimento irregular e deriva média

Os elétrons de condução não percorrem linhas retas e organizadas pelo metal. O movimento microscópico é interrompido por mecanismos de espalhamento e apresenta uma componente média de deriva quando existe campo aplicado.

O modelo de Drude, como primeira aproximação, descreve o balanço entre força elétrica e relaxação de momento:

\[
m^\ast\frac{d\vec v_d}{dt}
=
-e\vec E-\frac{m^\ast}{\tau}\vec v_d
\]

onde:

- \(m^\ast\) é a massa efetiva adotada no modelo;
- \(\tau\) é o tempo de relaxação do momento;
- \(\vec v_d\) é a velocidade média de deriva;
- \(\vec E\) é o campo elétrico.

No regime estacionário e para campo uniforme:

\[
\vec v_d=-\frac{e\tau}{m^\ast}\vec E
\]

A mobilidade eletrônica, na aproximação Drude, é:

\[
\mu=\frac{e\tau}{m^\ast}
\]

e a deriva pode ser expressa como:

\[
\vec v_d=-\mu\vec E
\]

A velocidade de deriva é pequena em comparação com as velocidades microscópicas dos portadores. O movimento visual rápido de marcadores não pode ser interpretado como a velocidade real de transporte de carga.

### 3.3 Corrente convencional e densidade de corrente

Para portadores de densidade numérica \(n\):

\[
\vec J=nq\vec v_d
\]

Para elétrons em um metal:

\[
\vec J=-ne\vec v_d
\]

Como a deriva dos elétrons é oposta ao campo, a corrente convencional fica no sentido do campo em um condutor isotrópico e ôhmico.

Na aproximação Drude:

\[
\vec J=\sigma\vec E
\]

\[
\sigma=\frac{ne^2\tau}{m^\ast}
\]

A resistividade é:

\[
\rho_e=\frac{1}{\sigma}
\]

A letra \(\rho_e\) representa resistividade elétrica e não deve ser confundida com a densidade de massa usada no contrato térmico.

A corrente total em uma seção depende da densidade de corrente e da área:

\[
I=\iint_A\vec J\cdot d\vec A
\]

A representação atual não possui área de seção física nem densidade real de portadores. Portanto, não pode converter o número de partículas desenhadas em ampères.

### 3.4 Campo, sinal e deriva não são a mesma velocidade

O sinal elétrico se propaga pelo circuito por mudanças do campo e da distribuição de cargas. Esse processo é muito mais rápido do que a deriva média dos elétrons.

O SILM deve evitar a explicação de que cada elétron sai de uma extremidade e atravessa toda a amostra rapidamente quando o campo é ligado. A animação de partículas é uma representação de transporte coletivo e não uma reprodução cronológica da propagação de um sinal em um circuito real.

### 3.5 Lei de Ohm local

Em regime linear, isotrópico e estacionário:

\[
\vec J=\sigma\vec E
\]

A relação não deve ser apresentada como universal em qualquer condição. Materiais anisotrópicos podem exigir um tensor de condutividade; campos intensos, condições fora do equilíbrio, dimensões nanométricas e mudanças de fase podem sair do regime ôhmico adotado.

A primeira versão específica por metal deve limitar-se a condições em que a aproximação isotrópica e linear esteja justificada.

## 4. Fonte e aplicação do campo

### 4.1 Campo idealizado

A primeira versão deve tratar o campo como uma condição aplicada à amostra virtual, aproximadamente uniforme no volume representado. A interface deve indicar explicitamente que se trata de um campo aplicado idealizado.

O modelo atual não calcula:

- distribuição de potencial em cada ponto;
- carga superficial e redistribuição nos contatos;
- resistência do circuito externo;
- resposta de uma bateria ou fonte real;
- corrente em fios externos.

Não desenhar um circuito completo como se ele estivesse resolvido pelo motor atual.

### 4.2 Controles necessários

| Controle | Comportamento requerido | Situação |
|---|---|---|
| Aplicar/remover campo | Liga e desliga o estímulo | Já existe |
| Intensidade | Ajusta a intensidade relativa do campo | Já existe na visualização cristalina |
| Sentido/polaridade | Inverte o sentido do campo | Requisito de evolução |
| Seta E | Indica a direção do campo aplicado | Já existe |
| Deriva dos elétrons | Mostra tendência média oposta a E | Já existe, qualitativa |
| Corrente convencional | Indica o sentido da corrente equivalente, paralelo a E no modelo ôhmico | Novo indicador visual |
| Movimento aleatório | Permanece sem órbita e sem trajetória única privilegiada | Já existe |
| Texto contextual | Explica campo, movimento eletrônico e corrente | Parcial; exige revisão |

### 4.3 Intensidade

O controle atual representa 5 % a 100 % e não possui unidade. Essa faixa poderá ser mantida como intensidade didática normalizada até que exista uma escala física de campo com unidade V/m e dados suficientes para sustentá-la.

O percentual não deve aparecer como tensão, corrente ou potência. O mesmo percentual deve produzir a mesma alteração relativa do motor na montagem livre e na estrutura cristalina.

### 4.4 Polaridade

A inversão da polaridade deve inverter simultaneamente:

- a direção do campo;
- a direção média da deriva eletrônica;
- o sentido da corrente convencional.

O movimento irregular permanece em todas as condições. Desligar o campo elimina a componente macroscópica de deriva, mas não significa que os elétrons deixem de se mover.

A inversão não deve exigir reorganização ou recriação da estrutura cristalina.

## 5. Acoplamento com temperatura e deformação

### 5.1 Espalhamento eletrônico

A resistência à condução pode resultar de vários mecanismos de espalhamento, incluindo interação elétron-fônon, impurezas e defeitos cristalinos.

Uma aproximação comum em metais é a regra de Matthiessen:

\[
\rho_e(T)\approx
\rho_{\mathrm{fônon}}(T)+
\rho_{\mathrm{impurezas}}+
\rho_{\mathrm{defeitos}}
\]

Essa soma é uma aproximação empírica sob hipóteses de contribuições aproximadamente independentes. Não deve ser tratada como uma identidade exata para qualquer metal, temperatura, geometria ou escala.

### 5.2 Calor + corrente

A combinação já existente deve ser preservada:

- o motor térmico calcula a distribuição qualitativa de temperatura;
- a camada de elétrons consulta a temperatura local;
- regiões mais quentes recebem fator de espalhamento maior;
- a componente de deriva é atenuada nessas regiões.

Na versão atual, esses fatores são didáticos e iguais para todos os metais. Não calculam a curva de resistividade do elemento.

### 5.3 Deformação + corrente

A combinação existente também deve ser preservada:

- deformação cria uma variável didática de defeitos;
- os defeitos aumentam o espalhamento representado;
- a deriva média é reduzida qualitativamente.

As discordâncias não desenhadas não são contadas fisicamente. O fator atual não equivale a uma contribuição de resistividade medida para um metal específico.

### 5.4 Aquecimento Joule pela corrente

O campo realiza trabalho sobre os portadores; os mecanismos de espalhamento transferem energia ao material, o que pode elevar sua temperatura.

A densidade volumétrica de potência dissipada é:

\[
\dot q'''=\vec J\cdot\vec E
\]

Para um material isotrópico e ôhmico:

\[
\dot q'''=\sigma E^2
\]

A potência total em um volume é:

\[
P_J=\int_V\vec J\cdot\vec E\,dV
\]

Esse é o acoplamento físico correto entre transporte elétrico e motor térmico.

**Lacuna atual:** ligar o campo elétrico sozinho não gera automaticamente aquecimento Joule no motor térmico. A experiência combinada depende de uma fonte térmica auxiliar ativada explicitamente. A próxima implementação poderá gerar o termo de Joule, mas apenas quando houver uma escala física válida para E, J e o volume. Antes disso, o motor deve manter a distinção entre a fonte de calor didática e o aquecimento causado pela corrente.

Quando o termo de Joule for habilitado, ele deve ser injetado uma única vez no motor térmico compartilhado. Não somar uma fonte de calor manual equivalente e uma fonte Joule duplicada sem que a interface identifique ambas.

## 6. Dados necessários para uma resposta específica por metal

### 6.1 Dados elétricos

| Grandeza | Símbolo | Unidade SI | Utilização |
|---|---|---|---|
| Condutividade elétrica | \(\sigma\) | S/m | Relação entre campo e densidade de corrente |
| Resistividade elétrica | \(\rho_e\) | Ω·m | Resistência intrínseca do material |
| Densidade de portadores | \(n\) | m⁻³ | Relacionar corrente e velocidade de deriva |
| Mobilidade eletrônica | \(\mu\) | m²/(V·s) | Resposta média ao campo |
| Tempo de relaxação | \(\tau\) | s | Modelo de espalhamento e deriva |
| Massa efetiva | \(m^\ast\) | kg | Modelo de transporte Drude/Sommerfeld |
| Coeficiente de temperatura | — | dependente da convenção | Curva de resistividade/condutividade em função de T |

Nem todas as grandezas precisam ser armazenadas se outras forem fornecidas e a relação de derivação for válida. A proveniência deve indicar quais entradas foram medidas, tabeladas ou calculadas.

### 6.2 Geometria e condições da amostra

Para calcular corrente, densidade de corrente ou tensão, serão necessários:

- comprimento efetivo na direção do campo;
- seção transversal perpendicular à corrente;
- orientação cristalográfica, quando relevante;
- contatos e condições de contorno, se a geometria elétrica for simulada;
- temperatura;
- fase;
- pureza e defeitos, quando informados;
- pressão, quando relevante;
- fonte e método experimental.

Para derivar campo a partir de tensão:

\[
E\approx\frac{V}{L}
\]

Essa aproximação exige campo aproximadamente uniforme e comprimento efetivo definido. A representação atual não possui esses elementos físicos completos.

### 6.3 Configuração eletrônica não é densidade de portadores

A configuração eletrônica do átomo isolado não informa diretamente quantos elétrons participam da condução no sólido.

O modelo de valência do SILM é uma convenção qualitativa. Não usar a quantidade de elétrons de valência como densidade universal de portadores, especialmente em metais de transição e lantanídeos. Qualquer valor de n exige fonte ou modelo explicitamente justificado.

### 6.4 Curvas com temperatura

Quando houver dados, armazenar \(\sigma(T)\) ou \(\rho_e(T)\) com:

- faixa de temperatura medida;
- unidade e incerteza;
- fase;
- pureza;
- orientação e anisotropia, se informadas;
- fonte;
- método;
- forma da amostra.

Um único valor em temperatura ambiente não autoriza extrapolação para temperaturas altas.

### 6.5 Organização futura dos dados

A curadoria pode usar elements[].properties quando houver somente valores pontuais homogêneos, ou arquivo próprio, por exemplo electrical-transport.json, quando houver múltiplas curvas e condições.

Cada conjunto deve possuir identificador, número atômico, propriedade, unidade, temperatura ou intervalo, fase, pureza, orientação, método, natureza da evidência, fonte, incerteza e observações.

O validador deve recusar fonte inexistente, unidades incompatíveis, valores não finitos, curvas fora de ordem, temperaturas ausentes e extrapolação não declarada.

## 7. Interface e representação visual

### 7.1 Camadas visuais

A experiência deve separar:

- campo elétrico E;
- movimento irregular dos portadores;
- deriva média dos elétrons;
- corrente convencional;
- região da amostra e orientação do campo;
- resposta térmica, quando houver;
- status da fonte e intensidade relativa.

O sentido da corrente convencional deve ser mostrado com uma seta ou rótulo distinto do movimento dos elétrons. Não depender apenas da cor para distinguir os sentidos.

### 7.2 Densidade de marcadores

Os marcadores são uma amostragem visual da distribuição eletrônica. A quantidade exibida deve continuar identificada como qualitativa.

Não usar o número de círculos na cena para representar:

- número de elétrons do elemento;
- densidade eletrônica;
- carga que atravessa a seção;
- corrente em ampères.

### 7.3 Texto contextual

A explicação deve responder de forma curta:

- **Campo:** qual direção foi aplicada?
- **Elétrons:** para qual lado fica a deriva média?
- **Corrente:** qual é o sentido convencional?
- **Espalhamento:** o que muda quando a temperatura ou os defeitos aumentam?
- **Limite:** o que não está sendo medido?

A interface não deve exibir corrente, resistência, tensão ou velocidade numéricas sem modelo e dados compatíveis.

### 7.4 Acessibilidade

- Inversão de polaridade por controle acessível e não apenas arraste.
- Intensidade ajustável por teclado, toque e mouse.
- Alvos de interação adequados para toque.
- Texto e indicadores para movimento reduzido.
- Estado de campo desligado com deriva média nula, sem apagar o movimento aleatório.
- Indicação textual do sentido do campo, da deriva eletrônica e da corrente convencional.

## 8. Ciclo da experiência elétrica

1. **Preparar:** verificar metal, investigação, amostra e elegibilidade.
2. **Iniciar:** selecionar a experiência elétrica.
3. **Aplicar:** ligar o campo.
4. **Orientar:** escolher o sentido/polaridade.
5. **Ajustar:** selecionar intensidade relativa.
6. **Observar:** acompanhar o movimento irregular e a deriva média.
7. **Interpretar:** comparar o sentido da deriva eletrônica com o da corrente convencional.
8. **Acoplar calor:** quando permitido, ativar o estímulo térmico auxiliar e observar a alteração qualitativa do espalhamento.
9. **Desligar:** retirar o campo; a deriva média desaparece, mas o movimento irregular permanece.
10. **Restaurar ou encerrar:** retornar ao estado-base ou finalizar a experiência.

A mudança de módulo deve suspender as operações de Explorar sem apagar investigação, estrutura e registros. A troca não pode deixar o campo ou o motor de partículas recebendo comandos fora de Explorar.

## 9. Plano de evolução

| Etapa | Desenvolvimento | Resultado |
|---|---|---|
| E0 — Atual | Passeio aleatório, deriva qualitativa, intensidade no cristal e acoplamentos didáticos | Base visual existente; não quantitativa |
| E1 — Consistência da interface | Unificar intensidade nos modos livre e cristalino; permitir inversão de polaridade; separar visualmente deriva e corrente convencional | Mesmo significado operacional em toda a amostra |
| E2 — Motor estatístico | Formalizar parâmetros didáticos, reversão, deriva média e frequência de espalhamento | Comportamento determinístico e testável sem fingir escala física |
| E3 — Dados por metal | Curar condutividade/resistividade e dependência com temperatura, quando disponíveis | Resposta específica sob condições homologadas |
| E4 — Modelo de transporte | Introduzir mobilidade ou tempo de relaxação e densidade de portadores com proveniência | Deriva e corrente derivadas de parâmetros justificados |
| E5 — Aquecimento Joule | Integrar J·E ao motor térmico compartilhado | Acoplamento energético coerente, sem duplicação de fontes |

A sequência deve preservar o motor visual atual como uma aproximação qualitativa até que os dados permitam evoluir para um modelo material-específico. Não pular diretamente da animação atual para valores em ampères ou volts.

## 10. Critérios de aceitação

- [ ] A experiência permanece dentro do módulo Explorar.
- [ ] O campo elétrico tem direção e intensidade identificáveis.
- [ ] O controle de intensidade produz o mesmo efeito relativo em montagem livre e cristalina.
- [ ] A inversão de polaridade inverte campo, deriva e corrente convencional.
- [ ] Elétrons se deslocam em média no sentido oposto ao campo.
- [ ] Corrente convencional aponta no mesmo sentido do campo no modelo isotrópico ôhmico.
- [ ] Sem campo, não há deriva macroscópica, mas o movimento irregular pode permanecer.
- [ ] O número de marcadores não é apresentado como número real de elétrons.
- [ ] Não se apresentam velocidades físicas a partir da animação.
- [ ] Não se apresentam ampères, volts, ohms ou A/m² sem dados e geometria.
- [ ] O texto distingue sinal elétrico rápido de deriva lenta dos portadores.
- [ ] Temperatura e defeitos alteram o espalhamento apenas segundo o modelo declarado.
- [ ] Matthiessen é descrita como aproximação, não como lei universal exata.
- [ ] O aquecimento Joule não é duplicado no motor térmico.
- [ ] A troca de módulo suspende o campo e a evolução dos marcadores.
- [ ] Os testes verificam sentido, reversão, consistência de intensidade, ausência de deriva com campo desligado e acoplamento térmico.

## 11. Fora do escopo inicial

- efeito Hall e tensões transversais;
- campo magnético e força de Lorentz;
- magnetorresistência;
- supercondutividade;
- transporte balístico e regime nanométrico;
- condução não ôhmica em campos intensos;
- bandas eletrônicas calculadas por DFT;
- dinâmica quântica dos portadores;
- circuito externo e contatos resolvidos;
- corrente alternada e resposta em frequência;
- efeitos termoelétricos completos.

Esses fenômenos exigem modelos e fontes adicionais. O campo magnético não deve ser incluído como um controle do estímulo elétrico nesta etapa.

## 12. Referências

1. LING, Samuel J.; MOEBS, William; SANNY, Jeff. *University Physics Volume 2*. OpenStax, seção 9.2 — Model of Conduction in Metals. Define deriva, densidade de corrente, sentidos de corrente convencional e transferência de energia por espalhamento. https://openstax.org/books/university-physics-volume-2/pages/9-2-model-of-conduction-in-metals
2. TU DELFT, Open Solid State Notes. *Drude model*. Equação de movimento, mobilidade, condutividade e mecanismos de espalhamento. https://solidstate.quantumtinkerer.tudelft.nl/3_drude_model/
3. YUAN, Zhenkun. *Electrical conductivity from first principles*. Tese de doutorado, Humboldt-Universität zu Berlin, 2022. Discute o modelo de transporte e limites quantitativos de métodos de primeiros princípios. https://pure.mpg.de/rest/items/item_3405416_3/component/file_3405419/content?download=true
4. RSC. *Recent progress in alternative metals for advanced interconnects*. Journal of Materials Chemistry C, 2026. Discute contribuições de espalhamento para resistividade e limites de Matthiessen em dimensões reduzidas. DOI: 10.1039/D6TC00317F. https://doi.org/10.1039/D6TC00317F

## 13. Próxima etapa

A Etapa 5 deve aprofundar o **estímulo mecânico**: força aplicada, tensão e deformação, regime elástico, deslizamento de planos, deformação plástica, recuperação e limites do modelo para cada estrutura cristalina.
