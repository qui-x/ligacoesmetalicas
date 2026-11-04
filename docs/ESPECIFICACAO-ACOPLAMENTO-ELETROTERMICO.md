# SILM — Especificação do acoplamento eletrotérmico (E+T)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`

---

## 1. Objetivo

Definir o primeiro acoplamento físico do SILM: transporte elétrico e transporte térmico na mesma amostra, com retroalimentação entre temperatura e resposta elétrica.

O ciclo físico a representar é:

1. uma condição elétrica é imposta;
2. o motor calcula potencial, campo e corrente;
3. a dissipação elétrica gera calor Joule;
4. o motor térmico distribui a energia gerada e eventual calor externo;
5. a temperatura modifica a resistividade/condutividade do material;
6. o estado elétrico é recalculado no passo seguinte.

Não basta exibir elétrons em movimento ao mesmo tempo que uma animação de aquecimento. A fonte Joule deve ser derivada do estado elétrico calculado e a temperatura deve retroagir sobre a resposta elétrica por uma relação material declarada.

## 2. Escopo da primeira versão

### Incluído
- Condução elétrica DC quase-estática, sem resolver ondas eletromagnéticas.
- Material homogêneo e isotrópico inicialmente.
- Geração volumétrica de calor Joule.
- Condução térmica transitória.
- Condutividade elétrica dependente da temperatura, quando existir dado/curva homologada.
- Fronteiras térmicas simplificadas: isolada ou temperatura prescrita.
- Visualização separada dos campos elétrico, Joule e térmico.
- Modo didático qualitativo quando a geometria ou os parâmetros não estiverem calibrados.

### Fora do escopo inicial
- Efeitos Seebeck, Peltier e Thomson.
- Corrente alternada e efeitos de frequência.
- Eletromigração, eletroplasticidade e mudanças microestruturais diretas induzidas por corrente.
- Convecção, radiação e contatos térmicos complexos.
- Propriedades anisotrópicas, não lineares ou dependentes da composição sem dados.
- Comparações quantitativas entre metais enquanto o banco não possuir dados homologados.

Esses efeitos não são sinônimos de aquecimento Joule e não devem aparecer como se estivessem incluídos.

## 3. Modelo físico contínuo de referência

O modelo contínuo serve como referência mesmo que a primeira implementação opere sobre a rede de vizinhos do SILM.

### 3.1 Transporte elétrico

Para condução DC quase-estática, sem acumulação interna de carga no volume:

```
∇ · J = 0
E = −∇V
J = σe(T) E
∇ · [σe(T) ∇V] = 0
```

| Símbolo | Significado | Unidade SI |
|---|---|---|
| J | densidade de corrente elétrica | A/m² |
| E | campo elétrico | V/m |
| V | potencial elétrico | V |
| σe(T) | condutividade elétrica | S/m |
| ρe(T) = 1/σe(T) | resistividade elétrica | Ω·m |

Uma variável material deve ser armazenada como condutividade ou resistividade, nunca como ambas sem uma regra explícita de consistência. A temperatura entra na equação elétrica por σe(T).

### 3.2 Geração de calor Joule

A potência dissipada por unidade de volume é:

```
QJ = J · E = ρe(T) |J|² = |J|² / σe(T)
```

Unidade: W/m³. A potência total gerada é a integral de QJ no volume da amostra. Para o modelo DC com grandezas instantâneas, não aplicar indevidamente fator 1/2 de expressões de corrente alternada em valores de pico.

### 3.3 Transporte térmico

```
ρm cp ∂T/∂t = ∇ · [k(T) ∇T] + QJ + Qext
q = −k(T) ∇T
```

| Símbolo | Significado | Unidade SI |
|---|---|---|
| ρm | densidade de massa | kg/m³ |
| cp | calor específico | J/(kg·K) |
| T | temperatura absoluta | K |
| k(T) | condutividade térmica | W/(m·K) |
| q | fluxo de calor | W/m² |
| QJ | fonte volumétrica de Joule | W/m³ |
| Qext | fonte térmica externa volumétrica | W/m³ |

A forma inicial assume ausência de mudança de fase e não inclui trabalho mecânico. Qext deve ser zero quando nenhuma fonte externa estiver configurada e permanecer separado de QJ no estado interno, na interface e nos relatórios.

## 4. Tensão controlada e corrente controlada

A interface deve exigir a escolha de uma variável de controle. A outra grandeza será calculada pelo motor.

### 4.1 Tensão controlada
- Prescrever diferença de potencial nos terminais.
- Calcular corrente total e distribuição de J.
- Calcular QJ a partir do estado elétrico.

Para uma amostra ôhmica equivalente: P = V²/R. Se R aumenta com a temperatura, a potência tende a diminuir sob uma fonte ideal de tensão constante.

### 4.2 Corrente controlada
- Prescrever corrente total ou densidade de corrente na fronteira de entrada.
- Calcular potencial e campo elétrico.
- Calcular QJ a partir de J e E.

Para uma amostra ôhmica equivalente: P = I²R. Se R aumenta com a temperatura, a potência tende a aumentar sob uma fonte ideal de corrente constante.

### 4.3 Regra didática
A mesma amostra pode apresentar trajetórias térmicas diferentes conforme a fonte ideal de controle. A interface deve explicar qual variável é imposta e qual é resposta. Uma fonte real com resistência interna, limitação de corrente ou controle eletrônico exige modelar o circuito/controle externo; não presumir que toda fonte real é ideal.

Não permitir tensão e corrente como duas entradas livres da mesma experiência ideal. A intensidade adimensional usada atualmente pelo motor de visualização não deve ser rotulada como volts, ampères ou condutividade.

## 5. Condições de contorno

### 5.1 Elétricas
- Tensão controlada: potencial prescrito nos terminais; um terminal deve ser referência.
- Corrente controlada: corrente total ou densidade de corrente prescrita na entrada e retorno compatível na saída.
- Laterais isoladas: J · n = 0.
- Nós internos: conservação de corrente.
- Toda amostra precisa ter caminho de retorno elétrico. Não aceitar corrente líquida entrando sem saída.

### 5.2 Térmicas

| Condição | Significado | Estado |
|---|---|---|
| Isolada | Fluxo normal igual a zero | Primeira versão |
| Temperatura prescrita | Fronteira mantida em temperatura definida | Primeira versão |
| Convecção | Fluxo proporcional à diferença para ambiente | Futura |
| Radiação | Troca radiativa com ambiente | Futura |
| Contato térmico | Resistência térmica na interface | Futura |

A temperatura inicial da amostra deve ser definida. Pode começar uniforme; gradientes internos iniciais são uma etapa posterior.

**Atenção ao regime estacionário:** uma amostra termicamente isolada com geração Joule contínua positiva não possui estado estacionário térmico finito neste modelo. Sua energia interna e temperatura média continuam aumentando. Para apresentar um estado estacionário, deve existir uma condição de remoção de calor ou fronteira que permita a saída de energia. Não exibir “equilíbrio” artificial em fronteiras isoladas com fonte contínua.

### 5.3 Fontes separadas
- **Joule:** calculada a partir de J e E; automática quando o acoplamento E+T estiver ativo.
- **Aquecimento externo:** Qext ou região aquecida, independente da corrente.
- **Gradiente imposto:** temperaturas/fluxos prescritos nas fronteiras.

Podem coexistir, mas suas contribuições devem permanecer identificáveis. A implementação atual de “calor + corrente” corresponde a fonte térmica externa combinada com campo elétrico; não deve ser renomeada como Joule antes da implementação do balanço elétrico-térmico.

## 6. Implementação na rede de vizinhos do SILM

A primeira versão pode usar a rede de centros e conexões do arranjo cristalino, desde que as ligações representem condutâncias declaradas e o balanço de energia seja testável. Se área, distância ou volume efetivos não estiverem calibrados, o motor permanece adimensional/qualitativo.

### 6.1 Rede elétrica

Para cada ligação entre nós i e j:

```
Gij(T) = σe(T) Aij / Lij
Iij = Gij(T) (Vi − Vj)
Pij = Gij(T) (Vi − Vj)²
```

Gij é condutância (S), Aij área efetiva (m²), Lij comprimento efetivo (m), Iij corrente (A) e Pij potência dissipada (W).

Para cada nó interno i, resolver:

```
Σj Gij(T) (Vi − Vj) = 0
```

Usar uma referência de potencial para retirar a indeterminação aditiva. No controle por corrente, a fonte e o retorno precisam satisfazer conservação de corrente. A corrente líquida através de qualquer corte da rede deve coincidir com a corrente prescrita.

### 6.2 Distribuição discreta de Joule

A potência de cada ligação deve ser atribuída aos volumes de controle adjacentes. Uma regra simples para volumes equivalentes é atribuir metade a cada extremidade:

```
QJ,i = Σj (Pij / 2)
```

A soma das potências atribuídas aos nós deve coincidir com a soma de todas as potências das ligações, sem duplicação. Se os volumes de controle forem diferentes, distribuir proporcionalmente aos volumes ou usar uma regra conservativa equivalente.

### 6.3 Rede térmica

Para cada nó i:

```
Ci dTi/dt = Σj Kij (Tj − Ti) + QJ,i + Qext,i − Qloss,i
Ci = ρm cp Vi
Kij = k Aij / Lij
```

Ci é capacidade térmica (J/K), Kij condutância térmica (W/K), Vi volume de controle (m³), e QJ,i/Qext,i são potências em W atribuídas ao nó. Manter consistente a diferença entre fonte volumétrica (W/m³) e potência atribuída (W).

Qloss,i deve ser zero no modo isolado. Só pode ser ativado quando uma lei de fronteira explícita estiver configurada.

### 6.4 Passo de tempo e estabilidade

O passo físico não deve depender da taxa de quadros da renderização. Para atualização explícita, usar limite de estabilidade derivado da rede; um limite suficiente para preservar coeficientes não negativos no caso linear é:

```
Δt ≤ min_i [ Ci / Σj Kij ]
```

Aplicar fator de segurança e validar numericamente; o limite final também deve considerar as condições de fronteira e fontes. Alternativamente, avaliar método implícito para maior robustez. Não reutilizar automaticamente o passo atual do motor térmico sem nova análise de estabilidade.

## 7. Acoplamento temporal

Fluxo de referência por passo:

1. Ler Tⁿ.
2. Atualizar σe(Tⁿ) usando curva material validada ou modelo didático marcado.
3. Resolver potencial Vⁿ para a condição elétrica prescrita.
4. Calcular Eⁿ, Jⁿ, corrente total e potência Joule.
5. Distribuir a potência Joule pelos nós, sem perda nem duplicação.
6. Atualizar temperatura com Joule + fonte externa e condições térmicas.
7. Verificar faixa material, estabilidade e balanço energético.
8. Se a mudança de T dentro do passo for excessiva, reduzir Δt ou iterar o acoplamento até convergência.
9. Publicar os resultados para a visualização.

A primeira implementação pode usar uma atualização por passo se testes demonstrarem erro aceitável. O estado físico deve ser independente da animação: pausar a renderização não pode alterar a conservação nem avançar o tempo físico.

## 8. Dados necessários para modo quantitativo

| Dado | Unidade SI | Obrigatoriedade |
|---|---|---|
| σe(T) ou ρe(T) | S/m ou Ω·m | Obrigatório |
| k(T) | W/(m·K) | Obrigatório |
| ρm | kg/m³ | Obrigatório |
| cp(T) | J/(kg·K) | Obrigatório |
| Faixa de temperatura válida | K ou °C | Obrigatório |
| Fonte, método e condição experimental | metadados | Obrigatório |
| Incerteza | unidade/percentual | Sempre que disponível |
| Coeficiente linear α | K⁻¹ | Opcional e apenas se validado |

Cada valor deve trazer temperatura de referência, faixa de validade, fase/estado do material, pureza/composição quando relevante e fonte. Uma relação linear como ρe(T) = ρe,ref [1 + α(T − Tref)] só pode ser usada quando α e a faixa de temperatura estiverem documentados. Não extrapolar além dos dados.

**Estado dos dados no SILM:** os registros científicos consultados ainda não possuem valores numéricos homologados suficientes por elemento. Consequentemente:
- modo quantitativo por metal permanece bloqueado;
- modo didático pode usar coeficientes normalizados, marcados como ilustrativos;
- sem geometria calibrada, não exibir volts, ampères, watts ou unidades SI derivadas como se fossem medições;
- não converter coeficientes de animação em propriedades experimentais.

## 9. Painel único E+T

### Elétrica
- Controle: Tensão / Corrente.
- Valor e unidade compatíveis com o controle.
- Terminais e polaridade/sentido.
- Leitura da grandeza não imposta.

### Térmica
- Fonte Joule: derivada automaticamente do motor elétrico.
- Fonte externa: opcional, inicialmente desligada.
- Gradiente imposto: opcional, inicialmente desligado.
- Fronteira: Isolada / Temperatura prescrita.
- Temperatura inicial.

### Amostra e validade
- Metal/estrutura selecionado.
- Geometria calibrada ou rede didática.
- Estado dos dados: quantitativo validado / parametrizado / didático.
- Faixa de validade dos dados.

### Resultados
- Potencial e campo elétrico;
- corrente total e densidade de corrente;
- resistência equivalente;
- potência elétrica e potência Joule;
- temperatura média, máxima e distribuição;
- fluxo térmico;
- energia gerada, armazenada e removida.

Mostrar unidades somente quando o modelo tiver parâmetros e geometria compatíveis. Resultados de entrada devem ser visualmente distinguidos dos resultados calculados.

## 10. Visualização e comunicação científica

- **Elétrico:** sentido e intensidade relativa da corrente na rede, com legenda.
- **Joule:** mapa de geração interna de calor, diferente da fonte externa.
- **Térmico:** distribuição de temperatura e direção do fluxo de calor.
- **Acoplamento:** indicar quais variáveis foram impostas e quais foram calculadas.
- **Didático:** usar escala normalizada ou categorias baixo/intermediário/alto, explicitando que não se trata de medição.

A animação de elétrons pode apoiar a intuição de transporte, mas não representa trajetória microscópica quantitativa, velocidade real ou contagem real de elétrons.

## 11. Testes de aceitação

### Elétricos
- [ ] Diferença de potencial nula, sem fonte de corrente, resulta em corrente e Joule nulos.
- [ ] A corrente é conservada em cada nó interno.
- [ ] Inverter polaridade inverte o sentido de corrente, não tornando a potência dissipada negativa.
- [ ] Aumentar tensão numa amostra linear com T fixa aumenta a corrente de forma coerente.
- [ ] Sob corrente prescrita, o potencial calculado responde à resistência.
- [ ] A soma das correntes de entrada e saída fecha dentro da tolerância numérica.

### Térmicos
- [ ] Sem fonte e com fronteiras isoladas, energia total se conserva e a distribuição tende ao equilíbrio.
- [ ] Calor flui de regiões quentes para frias.
- [ ] Fronteira isolada não permite fluxo normal de calor.
- [ ] Fronteira de temperatura prescrita mantém o valor definido.
- [ ] Fonte constante com isolamento aumenta a energia média; não gera falso estado estacionário.
- [ ] O passo explícito respeita o limite de estabilidade.

### Acoplamento
- [ ] Corrente zero implica Joule zero.
- [ ] A potência Joule integrada é igual à potência elétrica dissipada pela rede.
- [ ] A energia interna aumenta pela potência Joule e demais fontes, descontadas as saídas térmicas.
- [ ] Aumentar R aumenta P sob corrente constante e reduz P sob tensão constante, em condições equivalentes.
- [ ] Temperatura altera σe somente pela relação material declarada.
- [ ] Fonte externa é contabilizada separadamente de Joule.
- [ ] Reduzir a resistência térmica/permitir saída de calor altera a temperatura sem criar energia.
- [ ] O balanço de energia fecha na tolerância definida.

### Interface e execução
- [ ] O painel não permite controlar tensão e corrente simultaneamente como entradas independentes.
- [ ] Modo quantitativo fica indisponível sem dados completos e geometria válida.
- [ ] Modo didático não exibe unidades SI falsas.
- [ ] Seleção, configuração, aplicação, pausa e cancelamento não deixam efeitos parciais.
- [ ] O resultado permanece idêntico dentro da tolerância ao variar a taxa de renderização.
- [ ] A interface diferencia campo/corrente, geração Joule e aquecimento externo.

## 12. Fases de implementação

**Fase A — preparação e validação**
- Formalizar unidades e geometria efetiva da rede.
- Especificar interfaces de condições elétricas e térmicas.
- Criar testes unitários de conservação da corrente, potência e energia.
- Manter quantitativo bloqueado.

**Fase B — protótipo qualitativo acoplado**
- Resolver a rede elétrica adimensional.
- Derivar QJ da potência dissipada.
- Alimentar o motor térmico com a potência calculada.
- Usar relação σe(T) normalizada e explicitamente didática.
- Comparar tensão controlada e corrente controlada sem apresentar grandezas SI.

**Fase C — parametrização material**
- Homologar fontes e dados por metal.
- Calibrar geometria e volumes da rede.
- Introduzir σe(T), k(T), cp(T) e densidade.
- Liberar unidades físicas somente após validação dos testes.

**Fase D — robustez e extensão**
- Melhorar solução iterativa/implícita e passo de tempo adaptativo.
- Avaliar convecção, radiação e outras fronteiras.
- Preparar a integração futura com o acoplamento térmico-mecânico (T+M).

## 13. Critério para iniciar implementação

A implementação da Fase B só deve começar quando estiverem definidos:
1. a regra de geometria/área/volume efetivos da rede;
2. o método de solução do potencial e as condições de terminal;
3. a regra de distribuição de Joule entre nós;
4. o passo de tempo e teste de estabilidade;
5. a relação didática σe(T) e sua comunicação na interface;
6. os critérios de conservação e as tolerâncias numéricas.

A implementação quantitativa fica condicionada à homologação dos dados materiais e da geometria física.

## 14. Referências de base

- Callister, W. D.; Rethwisch, D. G. *Materials Science and Engineering: An Introduction*, 9ª ed. — resistividade, temperatura, defeitos, transporte térmico e Wiedemann–Franz. Referência bibliográfica e consulta registradas no documento de estudo geral.
- Vaqueiro, P. “Synthesis and Property Measurements of Thermoelectric Materials”, Royal Society of Chemistry, 2021. DOI: 10.1039/9781788019590-00001 — decomposição da condutividade térmica em contribuições eletrônica e da rede.
- Dassault Systèmes, *Abaqus Analysis User’s Guide*, “Fully coupled thermal-electrical-structural analysis” — acoplamento de corrente, temperatura e dissipação Joule.
- As referências e links completos permanecem listados em `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`.

**Decisão de segurança científica:** E+T só deve ser apresentado como acoplamento físico quando o Joule for calculado a partir do estado elétrico, a temperatura retroagir sobre a resposta elétrica e os balanços forem testados. Antes disso, qualquer modo é apenas demonstrativo e precisa ser rotulado como didático.
