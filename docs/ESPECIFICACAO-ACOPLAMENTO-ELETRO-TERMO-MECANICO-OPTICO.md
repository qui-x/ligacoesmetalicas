# SILM — Especificação do acoplamento eletro-termo-mecânico-óptico (E+T+M+O)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Escopo:** condução elétrica DC, transporte térmico, resposta mecânica e resposta óptica da mesma amostra metálica.  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-MECANICO.md` (E+T+M)
- `ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-OPTICO.md` (E+T+O)
- `ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md` (E+M+O)
- `ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md` (T+M+O)

---

## 1. Objetivo e decisão central

Definir o modelo completo em que os quatro domínios físicos compartilham a mesma amostra, a mesma geometria atual e o mesmo estado temporal:

- **E — Elétrico:** potencial, corrente, densidade de corrente, condutividade/resistividade e dissipação Joule.
- **T — Térmico:** temperatura, capacidade térmica, condução, fontes, armazenamento e fluxos de calor.
- **M — Mecânico:** deslocamento, deformação, tensão, expansão térmica, plasticidade, microestrutura e contatos.
- **O — Óptico:** campo/luz incidente, absorção, reflexão, transmissão, espalhamento, propriedades espectrais e geometria da superfície.

A arquitetura do acoplamento é:

~~~text
                 ┌──────────── E: potencial / corrente DC ────────────┐
                 │                         │                          │
                 │                    J · E (Joule)                    │
                 │                         ▼                          │
                 │                  ┌─────────────┐                    │
                 │                  │             │                    │
                 ▼                  ▼             │                    │
       geometria / contatos ───────► T: temperatura ◄────── O: luz absorvida
                 ▲                  │             ▲                    ▲
                 │                  │             │                    │
                 │                  ▼             │                    │
                 └────────────── M: mecânica ─────┘                    │
                        │             │                                │
                        │             ├── geometria / normais ─────────► O
                        │             ├── microestrutura ──────────────► E
                        │             └── dissipação plástica ─────────► T
                        │
                        └──── propriedades ópticas sob tensão/deformação (opcional)
~~~

A combinação não deve ser construída como quatro animações independentes. É um problema multifísico com retroalimentação: a corrente gera calor; a temperatura altera transporte e constituição mecânica; a deformação modifica geometria, contatos e microestrutura; a geometria e o estado material alteram a resposta óptica; e a absorção óptica pode gerar mais calor.

**Decisão central:** o modelo quantitativo deve resolver ou iterar um estado comum `{u, V, T, campo óptico}`, com os campos transferidos de forma conservativa entre malhas e passos temporais. O campo óptico é tratado na frequência da luz; a condução elétrica DC é outro problema e não pode ser substituída por ela.

A especificação admite dois regimes térmicos distintos:
1. **Equilíbrio térmico local:** uma única temperatura material é suficiente, quando elétrons e rede já estão em equilíbrio na escala de tempo resolvida.
2. **Não equilíbrio ultrarrápido:** pulsos ultracurtos podem exigir temperaturas separadas de elétrons e rede (`Te` e `Tl`), com acoplamento elétron-fônon.

O SILM atual não possui os domínios macroscópicos, dados e solucionadores necessários para afirmar uma simulação quantitativa das quatro famílias. Este documento define os requisitos e a ordem de evolução.

## 2. Escopo, hipóteses e exclusões

### 2.1 Incluído no modelo completo

- Condução elétrica DC ou quase-estática, com tensão OU corrente prescrita.
- Geração volumétrica e em contatos por dissipação elétrica, calculada a partir de potencial/corrente.
- Transporte térmico transitório e condições de contorno explícitas.
- Expansão térmica, tensão térmica e constituição mecânica dependente de temperatura.
- Deformação elástica/plástica e atualização da geometria atual.
- Condutividade/resistividade dependente de temperatura, deformação ou microestrutura somente quando parametrizada.
- Resposta óptica espectral calculada com constantes ópticas complexas ou solver eletromagnético.
- Absorção óptica como fonte térmica quando a fonte de luz estiver no modo de bombeamento ou feixe único.
- Reflexão geométrica com normais locais atualizadas e resposta espectral de Fresnel/estrutura de camadas quando houver dados.
- Dependência óptica de temperatura e deformação, quando existirem dados medidos/modelados para a amostra.
- Contatos elétricos, térmicos e mecânicos, em fase avançada, quando houver leis de interface e parâmetros.
- Calor de trabalho plástico, com coeficiente calibrado e sem dupla contagem.
- Acoplamento iterativo forte quando as realimentações forem relevantes.

### 2.2 Hipóteses da primeira formulação quantitativa

- Material inicialmente homogêneo, isotrópico e em uma fase estável.
- Corrente DC quase-estática; sem ondas eletromagnéticas no circuito de baixa frequência.
- Termoelasticidade e pequenas deformações na primeira referência analítica.
- Mecânica quase-estática; inércia e propagação de ondas elásticas ficam para um modelo dinâmico.
- Propriedades materiais são funções de T e, se suportado por dados, de deformação/estado interno.
- Fronteiras elétricas, térmicas e mecânicas são definidas explicitamente.
- Óptica inicialmente linear, passiva e sem geração de portadores persistentes; não linearidades intensas exigem modelo separado.

### 2.3 Exclusões da primeira versão

- Mudança de fase, fusão, vaporização, ablação, oxidação, recristalização e dano.
- Fratura, fadiga, fluência, delaminação e contato com evolução de dano.
- Eletroplasticidade atérmica, magnetoplasticidade e força de vento de elétrons como mecanismos habilitados.
- Efeitos Seebeck, Peltier e Thomson.
- Corrente alternada/indução, skin effect, forças magnéticas e acoplamento de Maxwell do circuito DC, salvo especificação própria.
- Pressão de radiação, forças optomecânicas e fotostricção, a menos que a escala/intensidade torne esses efeitos relevantes e exista modelo próprio.
- Propriedades ópticas não lineares, geração de harmônicos e ionização.
- Modelo de duas temperaturas fora de experiências de não equilíbrio ultrarrápido que o exijam.

Não tratar toda interação possível como automaticamente ativa. A escolha da variante experimental deve determinar quais mecanismos e fontes entram no cálculo.

## 3. Uma amostra, geometria e relógio compartilhados

### 3.1 Identidade física

Os quatro domínios devem apontar para a mesma amostra, com:
- metal, composição, pureza, fase, tratamento e orientação;
- geometria de referência e configuração atual;
- dimensões, volume, terminais, apoios, contatos e interfaces;
- superfície, camadas, substrato, acabamento e rugosidade;
- campo de temperatura e referência térmica;
- deformação total, elástica, plástica e térmica;
- microestrutura e variáveis internas, quando modeladas;
- propriedades elétricas, térmicas, mecânicas e ópticas com unidades, faixas, fontes e incertezas.

### 3.2 Geometria e campos mapeados

O domínio mecânico define o deslocamento `u` e a geometria atual. Os domínios elétrico e óptico devem consumir essa geometria, sem recalcular uma deformação paralela.

As malhas elétrica, térmica, mecânica e eletromagnética podem ter resolução diferente. A transferência de:
- fonte Joule e fonte óptica para a malha térmica;
- temperatura para condutividade, rigidez e constantes ópticas;
- tensão/deformação para propriedades elétricas e ópticas;
- deslocamento para terminais, contatos e superfície;
precisa preservar potência/energia e respeitar a posição espacial e o mesmo instante físico.

A rede atômica do SILM é uma representação cristalográfica. Ela não substitui o corpo de prova macroscópico, a malha contínua ou a superfície óptica na escala da luz.

### 3.3 Tempo físico

Todos os domínios compartilham um mesmo relógio físico, com subpassos quando escalas forem muito diferentes. O passo de animação não é passo físico. O solver pode avançar a óptica em regime harmônico ou resolver pulsos no tempo, enquanto E/T/M avançam com seus passos adequados, desde que as variáveis trocadas correspondam ao mesmo tempo físico.

## 4. Domínio E: transporte elétrico DC e Joule

Para condução elétrica DC quase-estática:

~~~text
∇ · JDC = 0
EDC = −∇V
JDC = σDC(T, ε, S, p) EDC
q̇J = JDC · EDC
~~~

- `V`: potencial elétrico (V);
- `EDC`: campo elétrico DC (V/m);
- `JDC`: densidade de corrente (A/m²);
- `σDC`: condutividade elétrica (S/m);
- `S`: estado microestrutural;
- `p`: estado/pressão de contato;
- `q̇J`: fonte volumétrica Joule (W/m³).

A dependência mínima, na primeira etapa, pode ser `σDC(T)`. Dependência adicional de deformação, microestrutura, anisotropia ou pressão exige dados e uma lei material específica.

### 4.1 Controle elétrico

A experiência escolhe uma condição:
- **Tensão controlada:** prescrever diferença de potencial e calcular corrente.
- **Corrente controlada:** prescrever corrente total ou densidade de corrente e calcular potencial.

Não prescrever tensão e corrente independentes simultaneamente em um circuito ideal. Fontes reais, resistência interna, limitação ou controle eletrônico exigem modelo do circuito externo.

### 4.2 Geometria deformada e contatos

A resistência equivalente para uma barra uniforme é:

~~~text
R = ρe L/A
~~~

A deformação atualiza comprimento, seção, volume, terminais e distribuição de corrente. Separar:
- mudança geométrica de `L/A`;
- mudança intrínseca de `ρe` por temperatura/deformação/microestrutura;
- resistência de contato.

Não transformar deslocamentos visuais em concentração de corrente ou densidade de defeitos reais.

### 4.3 Dissipação

A potência elétrica terminal deve fechar com a dissipação Joule volumétrica e as perdas nos contatos resistivos, sem dupla contagem. A dissipação de contato deve ser localizada em uma interface ou alocada aos volumes adjacentes por regra conservativa.

## 5. Domínio O: campo óptico e resposta espectral

### 5.1 Separação da resposta DC

A luz é um campo eletromagnético na frequência óptica. Sua resposta deve usar:
- função dielétrica complexa `ε̃(ω,T,ε,S)`;
- ou índice complexo `N(λ,T,ε,S)=n+iκ`;
- ou condutividade complexa `σ̃(ω,T,ε,S)`.

A condutividade DC não substitui essas constantes. O campo elétrico DC aplicado nos terminais não é o campo da onda luminosa.

### 5.2 Resposta eletromagnética

A resposta pode ser obtida por Fresnel para uma interface simples, matriz de transferência para filmes/camadas ou solver Maxwell para geometrias mais gerais. A escolha depende da espessura, estrutura, incidência, polarização e escala da superfície.

A refletância/absorptância deve considerar:
- comprimento de onda ou espectro;
- ângulo e polarização;
- material, fase e temperatura;
- tensão/deformação, se houver dados elasto-ópticos;
- rugosidade, topografia, camadas e substrato;
- posição, forma e distribuição espacial do feixe.

### 5.3 Geometria atual

A superfície óptica deve usar a geometria atualizada pelo domínio mecânico. A normal de referência `N` transforma-se, para deformação contínua regular, por:

~~~text
n = normalize(F⁻ᵀ N)
F = I + ∇u
~~~

A reflexão especular é calculada a partir da normal local atual. Para superfícies rugosas, usar topografia medida ou parametrizada e, quando necessário, BRDF/solver de espalhamento. Não inferir rugosidade óptica da rede atômica visual.

### 5.4 Resposta intrínseca

Temperatura e tensão/deformação podem alterar as propriedades ópticas intrínsecas. Para habilitar esse efeito, exigir `n(λ,T,ε)`, `κ(λ,T,ε)`, `ε̃(ω,T,ε)` ou coeficientes espectrais equivalentes medidos/modelados no mesmo material, fase, orientação e faixa. Sem dados, a óptica pode demonstrar somente geometria e lei de reflexão, sem mudança arbitrária de cor ou brilho.

## 6. Fontes de energia óptica e modos de medição

### 6.1 Balanço óptico

A energia incidente deve ser contabilizada em parcelas não sobrepostas:

~~~text
Pinc = Pref + Ptrans + Pabs + Pother
~~~

`Pother` inclui perdas/espalhamento que não estejam já incluídos na definição hemisférica de reflexão/transmissão. Se R, A e Topt forem definidos como frações totais compatíveis:

~~~text
R + A + Topt = 1
~~~

Não somar espalhamento duas vezes se já estiver incluído nas potências hemisféricas refletida/transmitida.

### 6.2 Fonte fototérmica

Somente a potência absorvida pode ser convertida em calor:

~~~text
Pabs = A(λ,T,ε,surface) Pinc
~~~

O perfil espacial deve refletir profundidade de penetração, camadas, interfaces e absorção local. Há duas abordagens para calcular a fonte:
1. absorptância total multiplicada pela potência incidente, com um modelo de distribuição espacial;
2. integração da perda eletromagnética local do solver.

Escolher uma rota consistente. Não contar a mesma absorção uma vez por `A·Pinc` e outra pela perda local do campo.

### 6.3 Modos de experiência

**Probe (leitura):**
- a fonte térmica é externa ou elétrica;
- a luz mede resposta;
- a absorção pelo probe é desprezível ou contabilizada quando não for.

**Pump–probe:**
- a bomba deposita energia e aquece a amostra;
- o probe mede a resposta óptica;
- os dois feixes têm posição, espectro, potência, tempo e polarização próprios;
- a absorção do probe entra no balanço se relevante.

**Feixe único:**
- a mesma luz aquece e é refletida/medida;
- sua absorção entra na fonte térmica;
- a leitura não é independente da fonte.

A bomba não é sinônimo de reflexão, nem o probe deve ser presumido sem aquecimento sem verificar sua potência absorvida.

## 7. Domínio T: regime térmico de uma ou duas temperaturas

### 7.1 Regime de temperatura única

Quando elétrons e rede estão em equilíbrio na escala resolvida, usar uma temperatura `T`:

~~~text
ρm cp(T) ∂T/∂t = ∇ · [k(T) ∇T]
                  + q̇J + q̇opt + q̇ext
                  + q̇plastic + q̇contact
~~~

As fontes são distintas:
- `q̇J`: dissipação elétrica DC;
- `q̇opt`: absorção óptica;
- `q̇ext`: fonte térmica externa;
- `q̇plastic`: fração calibrada do trabalho plástico;
- `q̇contact`: calor de contato/fricção, se validado.

A forma acima é uma equação de referência. Uma teoria termo-mecânica completa deve incluir os termos reversíveis de acoplamento de acordo com a energia livre e a convenção constitutiva adotada. Não inserir trabalho reversível e dissipação em duplicidade.

### 7.2 Regime de duas temperaturas (TTM)

Para pulsos ultracurtos, quando o subsistema eletrônico ainda não está em equilíbrio térmico com a rede, usar `Te` (elétrons) e `Tl` (rede):

~~~text
Ce(Te) ∂Te/∂t = ∇·[ke ∇Te] − G(Te − Tl)
                 + Sopt,e + q̇J,e

Cl(Tl) ∂Tl/∂t = ∇·[kl ∇Tl] + G(Te − Tl)
                 + q̇plastic + q̇contact,l
~~~

- `Ce`, `Cl`: capacidades térmicas volumétricas;
- `ke`, `kl`: condutividades eletrônica e da rede;
- `G`: acoplamento elétron-fônon;
- `Sopt,e`: energia óptica depositada inicialmente no subsistema eletrônico;
- `q̇J,e`: Joule no canal de energia eletrônico, conforme o modelo;
- `q̇plastic`: dissipação mecânica que alimenta a rede, se habilitada.

A distribuição exata das fontes entre subsistemas depende do modelo e do regime. Não somar `Te` e `Tl` como se fossem duas fontes independentes; o termo `G(Te−Tl)` transfere energia internamente e deve cancelar no balanço total. A mecânica deve responder à rede/lattice no regime de equilíbrio apropriado; efeitos não térmicos eletrônicos exigem constituição própria.

Revisões de modelos TTM e estudos recentes de metais irradiados por laser mostram que a distinção elétrons/rede é essencial em regimes ultrarrápidos, e que a troca entre subsistemas governa a evolução térmica e mecânica. [Song et al., 2023](https://doi.org/10.1016/j.optlastec.2022.109001); [Aeaby & Ray, 2025](https://doi.org/10.1039/D4CP01905A); [modelo termoplástico TTM, 2026](https://doi.org/10.1016/j.ijmecsci.2026.111601).

### 7.3 Escolha do regime

- Temperatura única: excitação contínua ou suficientemente lenta após equilíbrio elétron–rede, com hipótese validada.
- TTM: excitação ultrarrápida com não equilíbrio significativo.
- Modelos com população eletrônica não térmica, transferência balística, fusão ou ablação ficam fora do primeiro TTM do SILM.

Não selecionar o regime apenas pela aparência da animação ou por uma frequência padrão. A escolha deve vir da duração do pulso, propriedades do material e escala temporal estudada.

## 8. Domínio M: equilíbrio, deformação e realimentação

### 8.1 Modelo mecânico de referência

Para pequenas deformações:

~~~text
ε = sym(∇u) = εe + εp + εth
εth = α(T) ΔT I
σ = C(T) : [ε − εp − εth]
∇·σ + b = 0
~~~

A formulação inicial pode ser isotrópica/linear; anisotropia, grandes deformações, plasticidade cristalina completa e dependência microestrutural exigem modelos específicos.

### 8.2 Controles mecânicos

Escolher:
- compressão OU tração na primeira experiência;
- força/tensão OU deslocamento/deformação prescrita;
- apoio livre, apoiado ou restringido;
- direção e região de aplicação.

Não impor força e deslocamento independentes no mesmo grau de liberdade. Um estado multiaxial exige um campo de tensões/deformações compatível, não duas animações independentes.

### 8.3 Dependência térmica e microestrutural

O estado mecânico pode depender de:
- `α(T)`, `C(T)`, `σy(T)`, `τc(T)`;
- taxa de deformação e encruamento;
- textura, orientação, composição e fase;
- evolução de discordâncias/defeitos, quando modelada;
- pressão, separação e atrito nos contatos.

Temperatura não implica amolecimento universal nem deslizamento automático. O modelo deve usar leis materiais calibradas.

### 8.4 Atualização da geometria

Após resolver `u`, atualizar:
- volume, dimensões, seção elétrica e posição dos terminais;
- contatos e condições de fronteira;
- superfície óptica, normais, área iluminada e ângulo local;
- distribuição espacial das fontes e propriedades quando necessário.

A malha deve ser atualizada ou a formulação de grandes deformações deve acomodar a configuração atual. Para problemas com instabilidade geométrica, buckling ou grandes deformações, usar passo de carga adaptativo e estratégia de convergência adequada.

## 9. Mecanismos de acoplamento e direção da realimentação

| Caminho | Mecanismo | Regra |
|---|---|---|
| E → T | dissipação Joule | calcular de J·E; não substituir por fonte externa |
| T → E | `σDC(T)`, resistividade e contatos | usar funções materiais e circuito especificados |
| M → E | L/A, volume, terminais, contatos e microestrutura | usar geometria atual; separar termos geométrico, intrínseco e de contato |
| E → M | Joule altera T; T altera a resposta mecânica | não chamar de eletroplasticidade atérmica |
| T → M | expansão, tensão térmica e constituição C(T), σy(T), τc(T) | considerar restrições e gradientes |
| M → T | dissipação plástica/fricção | somente com β e lei de contato calibrados |
| O → T | absorção óptica | somente potência absorvida; fonte e profundidade corretas |
| T → O | termorrefletância e constantes ópticas dependentes de T | dados espectrais e temperatura da mesma amostra |
| M → O | geometria, normais, rugosidade e elasto-óptica | separar efeito geométrico e intrínseco |
| T + M → O | forma/normal atual e óptica termodependente | uma superfície e um estado atual compartilhados |
| O → E | nenhuma ligação automática entre brilho e condutividade DC | não inferir σDC de Ropt nem o contrário |

A deformação pode alterar a óptica geométrica sem alterar `n` ou `κ`; temperatura pode alterar `n`/`κ` sem necessariamente alterar a normal; os dois efeitos podem coexistir. A interface e os resultados precisam manter essa decomposição.

A corrente DC e a luz permanecem excitações distintas. A resposta óptica não deve ser derivada da condutividade DC, e a corrente não é um campo de bombeamento óptico.

## 10. Estratégia numérica: sequencial, iterativa ou simultânea

### 10.1 Acoplamento fraco/sequencial

Pode ser usado como primeira aproximação quando os efeitos de deslocamento sobre contatos/caminho elétrico e de temperatura sobre material forem pequenos e monitorados:

1. resolver `V/J` na geometria atual;
2. calcular Joule e dissipações de contato;
3. resolver `T` ou `Te/Tl` com fontes;
4. resolver `u/σ/ε` sob condições térmicas/mecânicas;
5. atualizar geometria, contatos e propriedades;
6. recalcular óptica, absorção e propriedades térmicas/ópticas;
7. repetir as etapas acopladas até convergência ou demonstrar erro de acoplamento aceitável.

Uma única passagem sequencial não é suficiente quando propriedades ou contatos dependem significativamente dos deslocamentos.

### 10.2 Acoplamento forte/iterativo

Usar quando houver:
- dependência relevante de σDC com T ou deformação;
- deformação que altera caminho elétrico/contatos;
- contatos cuja condutância depende de pressão, separação ou temperatura;
- absorção óptica que muda com a temperatura ou superfície;
- buckling, instabilidade, grandes deformações ou gradientes localizados;
- fonte Joule/óptica que altera o estado no mesmo passo.

Em cada passo, iterar `{V, J, T/Te/Tl, u, ε, σ, optical fields}` até critérios de convergência definidos. Usar relaxation, passo de tempo/carga adaptativo, atualização de malha e precondicionamento conforme necessário. Se não convergir, não publicar um resultado quantitativo como se fosse solução estável.

### 10.3 Escalas temporais múltiplas

O domínio óptico harmônico pode ser resolvido por frequência e acoplado à evolução térmica/mecânica por absorção média; pulsos podem exigir resolver o envelope temporal e TTM. O circuito DC pode ser quase-estático em cada passo térmico. A mecânica pode ser quase-estática ou dinâmica conforme a frequência/carga. Trocas entre escalas precisam preservar energia e instante físico.

## 11. Conservação e balanços globais

### 11.1 Balanço elétrico

Para DC quase-estático:

~~~text
Pterminal ≈ ∫Ω q̇J dV + Pcontact,e
~~~

A diferença deve corresponder a erro numérico dentro da tolerância; se houver armazenamento elétrico/capacitivo ou elementos externos, incluí-los explicitamente.

### 11.2 Balanço óptico

~~~text
Pinc = Pref + Ptrans + Pabs + Pother
∫Ω q̇opt dV = Pabs
~~~

A segunda igualdade aplica-se quando a fonte térmica óptica representa toda a energia absorvida pelo volume/camadas modelados. Não duplicar perdas ou contar espalhamento duas vezes.

### 11.3 Balanço térmico

A variação da energia interna deve fechar com:
- Joule de volume e contato;
- potência óptica absorvida;
- fontes térmicas externas;
- parcela calibrada de trabalho plástico/fricção;
- energia transferida para fora pelas fronteiras.

No TTM, o termo `G(Te−Tl)` transfere energia entre subsistemas e cancela no balanço global de elétrons + rede.

### 11.4 Balanço mecânico

O trabalho externo mecânico deve ser distribuído entre:
- energia elástica armazenada;
- energia armazenada na microestrutura;
- trabalho plástico/dissipação;
- calor gerado por fração calibrada;
- energia cinética, se dinâmica;
- dissipação de contato/fricção, se modelada.

Não contabilizar a mesma parcela do trabalho plástico simultaneamente como energia armazenada integral e calor gerado integralmente.

### 11.5 Residual global

O estado só pode ser aceito quando os resíduos elétrico, óptico, térmico e mecânico estiverem abaixo de tolerâncias declaradas, com tolerância e método de cálculo documentados. Não criar um único “percentual de conservação” misturando grandezas sem unidades.

## 12. Condições experimentais e dados necessários

### 12.1 Elétricas
- tensão ou corrente, controle, terminais, retorno e resistência interna da fonte;
- σDC(T) ou ρDC(T), faixa, fase, composição e incerteza;
- geometria elétrica atual e contato elétrico;
- dependência de deformação/microestrutura se habilitada.

### 12.2 Térmicas
- temperatura inicial e referência;
- k(T), ρm, cp(T) ou Ce/Cl, ke/kl e G para TTM;
- fronteiras isolada, temperatura prescrita, convecção/radiação e contatos térmicos;
- perfil e origem de cada fonte.

### 12.3 Mecânicas
- geometria, apoios, tração/compressão, controle e taxa;
- α(T), C(T) ou E(T)/ν(T);
- curvas tensão–deformação, σy(T), τc(T), encruamento e microestrutura se necessários;
- β para calor plástico e leis de contato/fricção quando habilitados.

### 12.4 Ópticas
- n(λ,T,ε), κ(λ,T,ε) ou ε̃(ω,T,ε);
- R/A/Topt e perfil de absorção ou dados do campo óptico;
- espectro, potência/irradiância, área, perfil temporal, ângulo e polarização;
- pump/probe/feixe único;
- espessura, substrato, camadas, interfaces e topografia;
- CTR ou R(λ,T) medidos para a amostra, se a termorrefletância for usada.

### 12.5 Metadados obrigatórios

Cada dado deve incluir:
- unidade SI;
- material/composição/fase/tratamento;
- temperatura, faixa e condição;
- direção/orientação e polarização, quando aplicável;
- método experimental/modelo;
- fonte, versão/data e incerteza;
- classificação: medido, calculado, ajustado ou didático.

O modo quantitativo permanece bloqueado se qualquer parâmetro requerido pelo caminho escolhido estiver ausente ou fora da faixa.

## 13. Contrato conceitual do estado E+T+M+O

~~~ts
type ElectricalControl = "voltage" | "current";
type ThermalRegime = "single-temperature" | "two-temperature";
type MechanicalMode = "compression" | "tension";
type MechanicalControl = "force-stress" | "displacement-strain";
type ConstraintMode = "free" | "supported" | "restrained";
type OpticalMode = "probe" | "pump-probe" | "single-beam";
type EvidenceMode = "qualitative" | "parameterized" | "quantitative";

interface ElectroThermoMechOpticalExperiment {
  sample: {
    materialId: string;
    phase: string;
    geometryId: string;
    surfaceModelId: string;
    microstructureModelId?: string;
    referenceTemperatureK: number;
  };
  electrical: {
    control: ElectricalControl;
    value?: number;
    unit?: string;
    terminalsId: string;
    dcDatasetId?: string;
    contactModel: "ideal" | "parameterized";
  };
  thermal: {
    regime: ThermalRegime;
    initialTemperatureK?: number;
    electronTemperatureK?: number;
    latticeTemperatureK?: number;
    thermalDatasetId?: string;
    boundaryModelId: string;
  };
  mechanical: {
    mode: MechanicalMode;
    control: MechanicalControl;
    constraint: ConstraintMode;
    value?: number;
    unit?: string;
    direction: [number, number, number];
    constitutiveDatasetId?: string;
  };
  optical: {
    mode: OpticalMode;
    wavelengthNm?: number;
    spectrumId?: string;
    irradianceWm2?: number;
    pulseDurationS?: number;
    incidenceDeg?: number;
    polarization?: "s" | "p" | "unpolarized";
    pumpSourceId?: string;
    probeSourceId?: string;
    opticalDatasetId?: string;
    thermoreflectanceDatasetId?: string;
  };
  coupling: {
    jouleHeating: true;
    opticalAbsorptionHeating: boolean;
    thermalExpansion: boolean;
    temperatureDependentMechanics: boolean;
    deformationDependentElectrical: boolean;
    thermoOpticResponse: boolean;
    elastoOpticResponse: boolean;
    plasticHeat: boolean;
    electroplasticity: false;
  };
  evidenceMode: EvidenceMode;
  results: {
    currentA?: number;
    voltageV?: number;
    joulePowerW?: number;
    absorbedOpticalPowerW?: number;
    temperatureFieldId?: string;
    electronTemperatureFieldId?: string;
    latticeTemperatureFieldId?: string;
    displacementFieldId?: string;
    stressFieldId?: string;
    reflectanceSpectrumId?: string;
    energyResiduals?: {
      electrical?: number;
      optical?: number;
      thermal?: number;
      mechanical?: number;
    };
  };
}
~~~

Este é um contrato conceitual, não um schema pronto. Condições prescritas, variáveis internas e resultados derivados devem permanecer separados. Valores físicos exigem fonte, unidade, faixa e incerteza. Propriedades opcionais só são habilitadas conforme os dados e o modo físico selecionado.

## 14. Auditoria do SILM atual

Arquivos e contratos atuais auditados no repositório:

### 14.1 Elétrico — `domain/silm/drive.js`, `domain/silm/electron-view.js`
- Intensidade de campo transitória e adimensional.
- Deriva eletrônica qualitativa, não corrente/velocidade física.
- Não resolve potencial, densidade de corrente ou potência terminal.
- Não gera q̇J a partir de J·E.

### 14.2 Térmico — `domain/silm/thermal.js`
- Difusão por grafo de vizinhos da estrutura cristalina.
- Coeficiente didático comum, temperatura normalizada 0–1.
- Sem k(T), cp(T), ρm e fronteiras reais por amostra.
- Fonte externa transitória; não integra calor óptico ou Joule calculado.
- Não implementa TTM.

### 14.3 Mecânico — `domain/silm/deformation.js`
- Representação de sistemas de deslizamento CFC, CCC e HC.
- Limiar normalizado e deformação elástica didática; até quatro deslizamentos.
- Não resolve corpo de prova macroscópico, tensão, expansão térmica ou constituição T-dependente.
- Não atualiza terminais, contatos ou malha contínua.

### 14.4 Óptico — `domain/silm/drive.js` e vista cristalina
- Reflexão especular simplificada por ângulo igual de incidência/reflexão.
- Normal de referência; não atualiza a superfície com temperatura/deformação.
- Sem n(λ,T,ε), κ, Fresnel espectral, absorção, BRDF ou solver Maxwell.
- Não distingue pump, probe e feixe único.

### 14.5 Integração — `integracao/metallic-experience.js`
- `heatElectrical` associa fonte térmica externa transitória e campo elétrico visual.
- `malleabilityElectrical`/`ductilityElectrical` ligam deformação e campo transitório.
- Não há solução comum {u,V,T,campo óptico}, nem balanços fechados.
- A paridade entre ícones ativos não representa solução física acoplada.

### 14.6 Conclusão

O SILM tem recursos didáticos para cada família e algumas combinações visuais. Ainda não possui uma amostra macroscópica, dados e solvers que integrem simultaneamente as quatro famílias. O modo E+T+M+O deve continuar bloqueado como experiência quantitativa e não deve ser ativado por simples seleção dos quatro ícones.

## 15. Critérios de aceite

### 15.1 Identidade e consistência
- [ ] Os quatro domínios usam a mesma amostra, geometria e instante físico.
- [ ] Nenhuma transformação mecânica é aplicada duas vezes em malhas diferentes.
- [ ] Transferência entre malhas conserva energia e respeita a posição.
- [ ] O passo de renderização não determina o passo físico.

### 15.2 Elétrico e térmico
- [ ] Com corrente zero, q̇J = 0, salvo dissipação explícita de outra fonte.
- [ ] Potência terminal fecha com Joule volumétrico e contato.
- [ ] Fontes Joule, externa, óptica e plástica são rastreáveis e distintas.
- [ ] A amostra isolada sob geração contínua não apresenta estado estacionário térmico falso.
- [ ] σDC(T,ε,S) só muda por funções materiais homologadas.
- [ ] No TTM, energia transferida entre Te/Tl cancela no balanço total.

### 15.3 Mecânica
- [ ] Expansão livre uniforme não cria tensão térmica espúria.
- [ ] Restrição produz sinal de tensão compatível com casos analíticos.
- [ ] A deformação elástica retorna conforme o modelo; a plástica permanece.
- [ ] Geometria e contatos atualizados alimentam os domínios E e O.
- [ ] Dissipação plástica só gera calor com β validado; não há dupla contagem.

### 15.4 Óptica
- [ ] DC e campo óptico são variáveis distintas.
- [ ] A resposta óptica usa n, κ ou ε̃ espectrais, não σDC.
- [ ] A reflexão geométrica usa normal local atualizada.
- [ ] Mudança intrínseca termorrefletiva/elasto-óptica só usa dados da amostra.
- [ ] Somente potência absorvida vira q̇opt.
- [ ] Pump, probe e feixe único têm fontes e potências identificadas.
- [ ] R/A/Topt e potência absorvida fecham sem dupla contagem.
- [ ] Rugosidade/BRDF usa topografia em escala óptica, não posições atômicas ilustrativas.

### 15.5 Acoplamento e convergência
- [ ] O acoplamento sequencial é usado somente após demonstrar erro aceitável.
- [ ] Quando deslocamento/contactos alterarem E/T, as equações são iteradas até convergência.
- [ ] Resíduos elétrico, óptico, térmico e mecânico são calculados separadamente.
- [ ] Relaxation/passo adaptativo resolve instabilidades sem ocultar divergência.
- [ ] A solução não é publicada como quantitativa se não convergir.
- [ ] Eletroplasticidade atérmica e mudanças de fase permanecem desligadas na primeira versão.

### 15.6 Interface
- [ ] O painel único agrupa condições por E, T, M e O.
- [ ] Os ícones selecionam fenômenos, mas não executam modelos incompatíveis.
- [ ] Os campos obrigatórios mudam conforme pump/probe, TTM e controle elétrico/mecânico.
- [ ] Entradas, resultados e limites do modelo ficam identificados.
- [ ] Clique, Ctrl/Cmd e toque mantêm a mesma semântica.
- [ ] Modo qualitativo não exibe unidades físicas fictícias.

## 16. Fases de implementação

**Fase A — contrato e estados comuns**
- Definir a amostra macroscópica, geometria de referência, contatos e transferência de malhas.
- Criar estado físico único e relógio independente da renderização.
- Sem alegação de simulação quantitativa.

**Fase B — E+T validado**
- Resolver V/J, calcular Joule, condução térmica e fronteiras.
- Homologar σDC(T), k(T), cp(T), ρm.
- Fechar balanços elétrico e térmico.

**Fase C — termoelasticidade e geometria atual**
- Integrar u, εth(T), C(T), apoios e deslocamentos.
- Validar expansão livre/restrita.
- Atualizar geometria usada por E e O.

**Fase D — resposta elétrica sob deformação**
- Recalcular caminho, seção, terminais e contatos.
- Separar geometria, resistividade intrínseca, microestrutura e interface.
- Validar corrente/tensão sob geometria atual.

**Fase E — óptica espectral e termorrefletância**
- Homologar n(λ,T), κ(λ,T), absorptância e CTR/R(λ,T).
- Implementar superfície/normais e reflexão.
- Distinguir probe, pump–probe e feixe único.

**Fase F — óptica como fonte térmica**
- Calcular absorção e perfil espacial.
- Integrar q̇opt sem duplicação.
- Atualizar R/A/Topt conforme T e superfície.
- Fechar balanço óptico/térmico.

**Fase G — acoplamento forte, plasticidade e TTM**
- Iterar {u,V,T,campo óptico} quando houver realimentação forte.
- Adicionar β, contatos e calor plástico somente calibrados.
- Ativar TTM em regime ultrarrápido quando necessário.
- Validar benchmark e ensaio experimental comparável para os quatro domínios.

## 17. Referências e evidências científicas

A literatura consultada mostra exemplos robustos dos subproblemas e de acoplamentos parciais. Não foi identificada, nesta auditoria, uma referência única que valide exatamente a combinação geral E+T+M+O pretendida para o SILM; a especificação combina mecanismos de estudos diferentes e exige validação própria.

1. Filkin, V.; Vetyukov, Y.; Toth, F. “Fully Coupled Electromagnetic-Thermal-Mechanical Model for Induction Heating of Thin Steel Sheets With the Presence of Thermal Buckling”. *International Journal for Numerical Methods in Engineering*, 127(16), e70410, 2026. [DOI 10.1002/nme.70410](https://doi.org/10.1002/nme.70410). Modelo iterativo com malha atualizada, efeitos de buckling e realimentação eletromagnética-térmica-mecânica.
2. “Multiscale modeling and analysis of coupled thermo-electro-structural behavior in heterogeneous materials and structures with direct FE² method”. *International Journal of Solids and Structures*, 331, 113895, publicado em 1 maio 2026. [DOI 10.1016/j.ijsolstr.2026.113895](https://doi.org/10.1016/j.ijsolstr.2026.113895). Conservação de energia, carga e balanço de momento com variáveis de temperatura, potencial e deslocamento em abordagem multiescala.
3. COMSOL. *Thermal–Electric–Structural Interaction*, documentação 6.3. [Documentação](https://doc.comsol.com/6.3/doc/com.comsol.help.sme/sme_ug_modeling.05.162.html). Exemplo de acoplamento Joule/temperatura com expansão e solver sequencial; observa que dependência de propriedades/deslocamentos pode exigir iteração.
4. Ye, M. et al. “Ultrafast Dynamics Reconstruction of Invar Alloy Based on Molecular Dynamics Coupled with the Two-Temperature Model and Multilayer Film Optics”. *ACS Photonics*, 13(16), 4847–4858, 1 julho 2026. [DOI 10.1021/acsphotonics.6c01256](https://doi.org/10.1021/acsphotonics.6c01256). Integra dinâmica atômica, modelo de duas temperaturas e óptica de filmes multicamadas em liga Invar.
5. “The two-temperature thermoplastic dual-horizon peridynamic model for ultrafast laser irradiation”. *International Journal of Mechanical Sciences*, 319, 111601, 1 junho 2026. [DOI 10.1016/j.ijmecsci.2026.111601](https://doi.org/10.1016/j.ijmecsci.2026.111601). Modelo de duas temperaturas e resposta termomecânica/plástica sob laser ultrarrápido.
6. Song, S. et al. “A critical review on the simulation of ultra-short pulse laser-metal interactions based on a two-temperature model (TTM)”. *Optics & Laser Technology*, 159, 109001, abril 2023. [DOI 10.1016/j.optlastec.2022.109001](https://doi.org/10.1016/j.optlastec.2022.109001). Revisão do TTM e interação entre pulsos ultracurtos e metais.
7. Aeaby, C. D.; Ray, A. “Enhanced two-temperature model and its application in comprehensive analysis of femtosecond laser melting of gold, copper and their alloys”. *Physical Chemistry Chemical Physics*, 27, 2662–2679, 2025. [DOI 10.1039/D4CP01905A](https://doi.org/10.1039/D4CP01905A). Modelo com propriedades ópticas dependentes de temperatura e transporte eletrônico balístico.
8. Dassault Systèmes. *Abaqus 2025 Documentation*, “Fully Coupled Thermal-Electrical-Structural Analysis”. [Documentação](https://docs.software.vt.edu/abaqusv2025/English/SIMACAEANLRefMap/simaanl-c-coupthermalelecstruct.htm). Acoplamento de deslocamento, potencial, temperatura, Joule, expansão e contatos.
9. SILM — especificações dos quatro trios: [E+T+M](ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-MECANICO.md), [E+T+O](ESPECIFICACAO-ACOPLAMENTO-ELETRO-TERMO-OPTICO.md), [E+M+O](ESPECIFICACAO-ACOPLAMENTO-ELETRO-MECANICO-OPTICO.md) e [T+M+O](ESPECIFICACAO-ACOPLAMENTO-TERMO-MECANICO-OPTICO.md). Contratos internos dos caminhos parciais que compõem a especificação integral.

## 18. Decisões congeladas

1. E+T+M+O é um único problema multifísico, não quatro animações independentes.
2. Uma amostra, geometria atual, estado temporal e convenção de conservação são compartilhados pelos quatro domínios.
3. E DC e O óptico são frequências/solvers distintos; σDC nunca substitui n, κ ou ε̃ ópticos.
4. Joule e absorção óptica são fontes diferentes; apenas a potência absorvida é fonte fototérmica.
5. Temperatura única e TTM são regimes alternativos, escolhidos pela escala de tempo e evidência de não equilíbrio.
6. A deformação atualiza geometria elétrica e superfície óptica; propriedades intrínsecas dependem de dados próprios.
7. Calor plástico, fricção, efeitos de contato e respostas elasto-ópticas só são habilitados com parâmetros validados.
8. Acoplamento sequencial só é aceito quando seu erro é demonstrado; realimentação forte exige iteração/convergência.
9. Os balanços elétrico, óptico, térmico e mecânico permanecem separados e também fecham globalmente.
10. Eletroplasticidade atérmica, transições de fase, dano e ablação permanecem fora da primeira versão.
11. A implementação quantitativa só será liberada após homologar parâmetros, geometrias, fronteiras, solvers e benchmarks dos quatro domínios.
12. Este documento especifica a arquitetura e não autoriza ativação imediata no simulador.

**Decisão final de segurança científica:** a combinação E+T+M+O é fisicamente possível, mas extremamente dependente da amostra, regime temporal, espectro, contatos, dados e condições de contorno. A primeira demonstração do SILM deve limitar-se a uma sequência didática qualitativa com mecanismos separados; resultados quantitativos e realimentação integral permanecem bloqueados até validação independente.
