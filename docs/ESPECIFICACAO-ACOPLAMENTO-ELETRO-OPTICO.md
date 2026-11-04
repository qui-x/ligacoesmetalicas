# SILM — Especificação do acoplamento eletro-óptico (E+O)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Famílias:** elétrica (E) + óptica (O)  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETROTERMICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-MECANICO-OPTICO.md`

---

## 1. Objetivo e decisão central

Definir como a resposta elétrica de um metal e sua resposta à luz podem ser estudadas em uma mesma experiência, sem confundir a condutividade elétrica em corrente contínua com a refletância óptica.

**Decisão central:** E e O têm origem eletrônica comum, mas são respostas medidas em regimes de frequência distintos. A condutividade DC, isoladamente, não determina a refletância no visível. Um acoplamento quantitativo precisa de uma descrição eletrodinâmica espectral — por exemplo, índice complexo `N(ω)=n(ω)+iκ(ω)`, função dielétrica complexa `ε̃(ω)` ou condutividade óptica complexa `σ̃(ω)` — associada à condição da amostra.

A primeira implementação não pode simplesmente ligar a corrente e aumentar o brilho. Isso transformaria duas animações em uma relação causal que o modelo não calculou.

O objetivo operacional é permitir que a experiência reúna:
1. transporte de carga sob uma condição elétrica DC ou de baixa frequência;
2. incidência de luz com comprimento de onda, ângulo e polarização definidos;
3. resposta espectral de reflexão/absorção calculada a partir de dados ou de um modelo validado;
4. comparação entre a resposta elétrica de baixa frequência e a resposta eletromagnética óptica, mantendo claras suas diferenças.

## 2. O que está fisicamente relacionado

### 2.1 Origem eletrônica compartilhada

Elétrons de condução participam do transporte de carga em baixa frequência e também respondem ao campo elétrico oscilante da luz. A ligação entre os fenômenos está na resposta eletromagnética dependente da frequência, não em uma identidade entre os valores de condutividade DC e brilho.

No regime DC, a forma local da lei constitutiva é:

```
J = σDC E
```

onde `J` é a densidade de corrente, `E` é o campo aplicado e `σDC` é a condutividade na condição de baixa frequência, temperatura e microestrutura declaradas.

Na interação com uma onda eletromagnética, o material responde à frequência angular `ω=2πf`. A resposta é complexa e dispersiva:

```
σ̃(ω) = σ1(ω) + i σ2(ω)
ε̃(ω) = ε1(ω) + i ε2(ω)
N(ω) = n(ω) + i κ(ω)
```

Para meios não magnéticos e uma convenção harmônica explicitada, as grandezas se relacionam por equações constitutivas. Os valores mudam com `ω`; portanto, não se deve substituir `σ̃(ω)` por `σDC` em uma fórmula óptica sem hipóteses e validação.

A dependência em frequência pode ser materialmente importante. A resposta DC e a resposta óptica não precisam ter a mesma dependência com temperatura ou frequência. A literatura de transporte em metais demonstra explicitamente essa distinção (Rosch, 2006).

### 2.2 Convenção e relações matemáticas

Para evitar ambiguidades de sinal, esta especificação adota campos harmônicos com dependência temporal `exp(-iωt)`, `N=n+iκ` e `ε̃=ε1+iε2`. Em unidades SI, para resposta linear, meio local e `μr≈1`:

```
ε̃(ω) = ε∞ + i σ̃(ω)/(ε0 ω)
ε1 = n² − κ²
ε2 = 2 n κ
```

`ε∞` representa contribuições de alta frequência fora do intervalo explicitamente modelado, quando a parametrização adotada exigir esse termo. Se outro formalismo/convenção for escolhido no código, os sinais devem ser revistos em conjunto e cobertos por testes; não misturar equações de convenções temporais diferentes.

### 2.3 Modelo de Drude e limitações

O modelo de Drude é uma aproximação inicial para a resposta intrabanda de elétrons livres:

```
σ̃D(ω) = ε0 ωp² / (γ − iω)
ε̃D(ω) = ε∞ − ωp² / (ω² + iγω)
σDC,D = ε0 ωp² / γ
```

`ωp` é a frequência de plasma e `γ` é a taxa de amortecimento/espalhamento. A expressão DC acima é o limite do modelo Drude simples; não deve ser usada como identidade universal entre resistividade de handbook e parâmetros de um ajuste óptico real.

O Drude isolado pode falhar ao representar transições interbanda, estruturas de banda, ressonâncias e efeitos de superfície. Para metais com transições relevantes na faixa analisada, pode ser necessário um modelo Drude–Lorentz ou, preferencialmente, dados espectrais experimentais diretamente homologados. Um ajuste deve ser validado no intervalo medido, não apenas parecer visualmente plausível.

**Regra:** o modelo de Drude é uma opção de parametrização a justificar por metal e faixa espectral, não um preenchimento automático para todos os 65 metais do SILM.

## 3. Da resposta óptica à reflexão

Para incidência normal de uma onda sobre uma interface plana entre um meio não absorvente de índice real `n0` e um metal homogêneo semi-infinito com `N=n+iκ`, a refletância de intensidade é:

```
R(ω) = |(N(ω) − n0)/(N(ω) + n0)|²
```

Para `n0=1`:

```
R = [(n − 1)² + κ²] / [(n + 1)² + κ²]
```

Essa equação torna explícito que o brilho quantitativo depende de `n` e `κ` na frequência da luz. Em incidência oblíqua, os coeficientes de Fresnel devem ser calculados separadamente para polarizações s e p, com o índice complexo e os ângulos adequados. A média não polarizada só deve ser usada quando a condição de iluminação justificar essa escolha.

Para uma camada fina sobre substrato, não basta aplicar a equação de uma interface semi-infinita: espessura, índices de cada camada, interfaces múltiplas, fase e interferência precisam entrar no cálculo (método de matriz de transferência ou formulação equivalente).

**Não inferir:** refletância universalmente alta para todo metal, em todo comprimento de onda e para qualquer estado de superfície. O valor depende do metal, da faixa espectral, da superfície e da pilha de materiais.

## 4. Mecanismos de acoplamento que devem ser separados

| Mecanismo | Relação E–O | Tratamento |
|---|---|---|
| Resposta espectral eletrônica comum | A mesma constituição eletrônica contribui para `σDC` e `σ̃(ω)`, mas em regimes distintos | Núcleo científico do acoplamento |
| Reflexão pela função dielétrica | `ε̃(ω)` ou `N(ω)` determina os coeficientes de Fresnel | Primeira versão quantitativa, quando houver dados |
| Campo DC alterando diretamente a resposta óptica | Pode ocorrer em condições específicas (eletro-refletância, não linearidade, alteração de ocupação eletrônica/superfície) | Bloqueado até haver modelo e evidência por material |
| Aquecimento Joule alterando a resposta óptica | Corrente dissipa energia, temperatura muda `σ̃(ω,T)` e a refletância | Isso é E+T+O, não E+O isolado |
| Oxidação, adsorção ou mudança química da superfície | A camada superficial altera a interface óptica e também pode afetar o contato elétrico | Exige camada e dados próprios; não simular automaticamente |
| Rugosidade e defeitos | Podem espalhar luz e alterar transporte, mas cada efeito tem escalas e modelos diferentes | Exige E+M+O ou superfície caracterizada; não deduzir rugosidade da condutividade |
| Plásmons de superfície | Dependem da resposta dielétrica complexa, da interface e da geometria | Fase avançada; não confundir com brilho metálico genérico |

O acoplamento mínimo é **constitutivo e comparativo**: o usuário observa o transporte DC e, separadamente, a resposta óptica espectral do mesmo estado material. Só haverá retroalimentação causal entre os dois domínios quando uma variável de estado (por exemplo, temperatura, deformação, composição ou campo intenso) tiver efeito parametrizado e validado sobre ambos.

### 4.1 Campo DC não é luz

O campo de condução aplicado no experimento elétrico é uma condição macroscópica, geralmente DC ou quase-estática. O campo da luz oscila em frequência óptica e tem polarização e direção de propagação próprias. A intensidade do campo DC não pode ser reaproveitada como amplitude da onda incidente.

Se houver uma diferença de potencial aplicada à amostra:
- a fonte elétrica e seus contatos devem ser definidos;
- a corrente e a potência elétrica devem ser calculadas pelo domínio elétrico;
- a luz incidente deve manter parâmetros próprios;
- uma mudança calculada em `R(λ)` só pode ocorrer se o modelo incluir o mecanismo que a causa.

Se a corrente alterar a temperatura, a experiência deve ser reclassificada como E+T+O e o termo térmico deve fechar o balanço de energia.

## 5. Condições mínimas da experiência

### 5.1 Domínio elétrico (baixa frequência)

| Campo | Requisito |
|---|---|
| Controle | Tensão prescrita OU corrente prescrita, nunca ambas como entradas independentes |
| Geometria | Comprimento entre contatos, seção transversal e orientação |
| Contatos | Tipo/condição dos contatos, resistência de contato se relevante |
| Regime | DC/quase-estático; frequência declarada se não for DC |
| Temperatura | Valor/condição da amostra e referência do dado |
| Respostas | Campo médio, densidade de corrente, corrente ou tensão resultante, resistência e potência quando calculáveis |

A condutividade elétrica deve ter unidade, temperatura, pureza/composição, fase, método e fonte. Um valor tabelado sem condições não autoriza comparação quantitativa rigorosa.

### 5.2 Domínio óptico

| Campo | Requisito |
|---|---|
| Espectro | Comprimento de onda `λ` ou intervalo explícito, com unidade |
| Incidência | Ângulo e meio de incidência |
| Polarização | s, p ou não polarizada, quando aplicável |
| Superfície | Metal maciço, filme, multicamada, óxido/camada superficial ou substrato |
| Geometria | Espessura, interfaces e orientação, quando aplicáveis |
| Estado superficial | Rugosidade, acabamento, contaminação/óxido e escala de medição, se conhecidos |
| Temperatura | Temperatura de medição ou parâmetro do dado |
| Respostas | `R_s(λ)`, `R_p(λ)`, refletância combinada, absorção e transmissão quando o sistema permitir |

A experiência óptica deve deixar claro se está usando uma interface ideal, amostra maciça ou filme. Não tratar uma amostra oxidada como metal limpo sem camada explícita.

## 6. Dados necessários por metal

### 6.1 Registro elétrico DC

- condutividade `σDC` ou resistividade `ρDC`, com unidade;
- temperatura e pressão, quando relevantes;
- pureza, composição, fase e condição metalúrgica;
- direção de medição/textura se houver anisotropia;
- método e incerteza;
- referência original e identificador de proveniência.

Se o banco tiver resistividade, `σ=1/ρ` pode ser calculado com unidade dimensional consistente e marcado como **calculado**. A operação não aumenta a qualidade da fonte nem cria dado espectral.

### 6.2 Registro óptico espectral

Cada série precisa conter:
- metal, fase, composição/pureza e identidade da amostra;
- `λ` ou frequência/`ω` por ponto e unidade;
- `n(λ)` e `κ(λ)` ou `ε1(ω)` e `ε2(ω)`, ou `σ1(ω)` e `σ2(ω)`;
- faixa medida, método, temperatura e incerteza;
- filme ou volume, espessura, substrato e camadas superficiais;
- orientação/polarização, quando pertinente;
- fonte original, DOI/URL, licença e forma de aquisição;
- indicação dos trechos medidos, interpolados, ajustados ou extrapolados.

Os pontos espectrais devem ser preservados; não reduzir toda a curva a uma cor média ou a um único índice constante. Não extrapolar para o visível uma curva registrada somente no infravermelho, ultravioleta ou raios X sem modelo e incerteza compatíveis.

### 6.3 Níveis de evidência

| Nível | Evidência | Uso permitido |
|---|---|---|
| A — medida rastreável | Medição publicada da amostra/fase/faixa, condições e incerteza disponíveis | Quantitativo dentro do domínio medido |
| B — compilação avaliada | Handbook/base curada com fonte original e condições rastreáveis | Quantitativo condicionado à rastreabilidade e revisão |
| C — modelo ajustado | Drude/Drude–Lorentz ou outro modelo ajustado a dados apropriados | Quantitativo apenas dentro da faixa e validação do ajuste |
| D — cálculo teórico | DFT ou outro método com protocolo e incerteza explicitados | Comparação teórica; não misturar silenciosamente com medida |
| E — estimativa/qualitativo | Valor estimado, regra genérica ou ilustração | Didático, sem alegação de dado real |
| F — ausente | Sem informação confiável na faixa/condição | Bloquear cálculo espectral |

A cobertura deve ser contabilizada por **metal × faixa espectral × fase/condição**, e não apenas por presença de uma pasta ou de um ponto em um arquivo. Um metal pode ter dado DC e não ter série óptica visível.

## 7. Fontes e estratégia de aquisição

A base [refractiveindex.info](https://refractiveindex.info/) é candidata prioritária para localizar séries de `n` e `κ`. O artigo descritivo de Polyanskiy (2024) explica que a base compila dados de artigos revisados por pares, livros e fichas técnicas, e que cada registro deve permitir rastrear a fonte. A licença declarada para o banco é CC0, mas a base alerta que não garante a exatidão de cada entrada: conferir a publicação original, condições, faixa e material antes da homologação.

A referência de Ordal et al. (1985) oferece parâmetros Drude e dados ópticos no infravermelho para 14 metais, além de comparação entre resistividade óptica calculada e resistividade DC de handbook. É uma boa fonte para validar a relação entre regimes no IR, mas **não** supre automaticamente dados visíveis para todos os elementos.

A aquisição deve priorizar:
1. dados espectrais experimentais da fase e condição relevantes;
2. compilações rastreáveis com checagem da publicação original;
3. ajustes físicos documentados;
4. cálculos teóricos claramente rotulados;
5. estimativas somente para comparação qualitativa, nunca para preencher lacunas sem marcação.

A fonte agregadora não substitui a citação da publicação original. Registre também versão/data de acesso da base usada.

## 8. Auditoria do SILM atual

### 8.1 Condutividade elétrica

Em `domain/silm/properties.js`, a experiência elétrica é descrita como qualitativa. Os dados DC podem ser lidos do banco quando há condutividade ou resistividade homologada, mas o estímulo visual não usa a magnitude tabelada. Em `domain/silm/drive.js`, a intensidade do campo vai de 5% a 100%, sem unidade, e controla uma deriva visual qualitativa.

Portanto, a animação elétrica atual não é uma solução de circuito com densidade de corrente quantitativa, nem fornece a resposta elétrica em frequência óptica.

### 8.2 Brilho metálico

O catálogo de propriedades identifica brilho como experiência qualitativa. A narrativa em `domain/silm/properties.js` descreve uma reflexão genérica e informa que a cor própria do metal não é representada. Em `domain/silm/drive.js`, o controle `reflect(θ)` devolve incidência e reflexão com a mesma magnitude angular, aplicando a lei geométrica da reflexão.

Esse recurso é uma demonstração de reflexão especular ideal. Não consulta `n(λ)`, `κ(λ)`, `ε̃(ω)`, `σ̃(ω)`, Fresnel, absorção ou transmitância.

### 8.3 Conclusão da auditoria

No estado atual:
- E não calcula uma resposta espectral;
- O não calcula refletância espectral;
- não existe ainda uma variável constitutiva compartilhada ligando as duas experiências;
- o valor DC de um metal não controla o brilho;
- não há base científica para uma combinação E+O executável.

**Decisão operacional:** manter E+O bloqueada no seletor de combinações até que a camada de resposta óptica espectral seja implementada e validada. A seleção dos dois ícones pode ser usada em estudo/prototipagem apenas se a interface declarar que são experiências independentes, sem acoplamento causal.

## 9. Contrato de estado conceitual

O modelo deve separar os dados materiais, os estímulos e os resultados. Esboço conceitual:

```ts
type EvidenceLevel = "measured" | "assessed" | "fitted" | "calculated" | "estimated" | "missing";

interface MaterialElectricalOpticalData {
  material: {
    atomicNumber: number;
    phase: string;
    composition?: string;
    purity?: string;
    temperatureK?: number;
    surfaceCondition?: string;
  };
  dc: {
    conductivitySPerM?: number;
    resistivityOhmM?: number;
    evidence: EvidenceLevel;
    sourceIds: string[];
    conditions: Record<string, unknown>;
  };
  optical: {
    wavelengthNm: number[];
    n?: number[];
    k?: number[];
    epsilon1?: number[];
    epsilon2?: number[];
    sigma1SPerM?: number[];
    sigma2SPerM?: number[];
    evidence: EvidenceLevel;
    sourceIds: string[];
    measuredRangeNm: [number, number];
    conditions: Record<string, unknown>;
  };
}

interface ElectroOpticalExperiment {
  electrical: {
    control: "voltage" | "current";
    value: number;
    unit: string;
    frequencyHz: number;
    geometry: {
      gaugeLengthM: number;
      crossSectionM2: number;
    };
  };
  optics: {
    enabled: boolean;
    wavelengthNm: number;
    incidenceAngleDeg: number;
    polarization: "s" | "p" | "unpolarized";
    stackId: string;
  };
  coupling: {
    mode: "shared-material-response" | "field-modulated" | "thermal-feedback";
    evidence: EvidenceLevel;
    modelId?: string;
  };
  results: {
    currentA?: number;
    voltageV?: number;
    resistanceOhm?: number;
    reflectanceS?: number;
    reflectanceP?: number;
    reflectance?: number;
    absorptance?: number;
    transmittance?: number;
  };
}
```

O tipo é um contrato conceitual, não um esquema pronto. A implementação deve validar comprimentos dos arrays, unidades, faixas, proveniência e compatibilidade das condições. `frequencyHz` DC é zero; quando se usar uma condição AC não nula, ela deve ser tratada como outra faixa do domínio elétrico.

Não guardar resultados derivados dentro dos campos de entrada. Não converter ausência de `n,k` em valores padrão. Um metal com dado DC mas sem dado óptico pode continuar habilitado para a experiência elétrica isolada, mas não para E+O quantitativo.

## 10. Painel único da experiência

A seleção E+O deve alimentar um único painel de condições, não dois menus contextuais independentes.

**Grupo elétrico**
- controle: tensão OU corrente;
- valor e unidade;
- geometria dos contatos/amostra;
- regime/frequência e temperatura da referência.

**Grupo óptico**
- comprimento de onda ou faixa;
- ângulo de incidência;
- polarização;
- superfície/interface ou pilha de camadas;
- opção de mostrar espectro completo ou ponto selecionado.

**Grupo de evidência**
- nível de evidência elétrica e óptica;
- temperatura/fase/condição da amostra;
- fonte(s) consultadas;
- aviso compacto quando os dois dados não representam a mesma amostra/condição.

**Resultados**
- grandezas elétricas de entrada e resposta;
- curva `R(λ)` e valor no comprimento de onda selecionado;
- `R_s` e `R_p`, se aplicáveis;
- absorção/transmissão quando modeladas;
- indicação clara de medido, ajustado ou calculado.

A seleção de E+O deve continuar mostrando dois ícones ativos. O destaque dos ícones informa seleção; não deve ser confundido com estado de fonte ligada, corrente diferente de zero ou luz incidente ligada.

## 11. Critérios de aceite

### 11.1 Coerência física e dimensional
- [ ] `σDC` não é usada como substituta direta de `σ̃(ω)` na faixa óptica.
- [ ] A convenção temporal e os sinais de `ε̃`/`σ̃` são únicos e documentados.
- [ ] Unidades SI são verificadas em cada transformação.
- [ ] A refletância de interface usa índices complexos e coeficientes de Fresnel.
- [ ] Em incidência normal, os coeficientes s e p convergem para o mesmo resultado.
- [ ] Para interface passiva, o resultado respeita `0 ≤ R ≤ 1`.
- [ ] Em filme/substrato, `R+A+T=1` dentro da tolerância do método e com a normalização correta.
- [ ] Dados e modelos não extrapolam silenciosamente além da faixa validada.

### 11.2 Consistência entre DC e óptica
- [ ] Quando usado um Drude simples, seu limite DC é confrontado com o valor DC da mesma condição dentro da incerteza declarada.
- [ ] Se o ajuste precisar de osciladores interbanda, eles ficam explícitos e não são ocultados como parâmetro Drude.
- [ ] Mudar o estímulo DC não altera `R(λ)` por conveniência visual.
- [ ] Uma dependência óptica com corrente só é ativada por mecanismo explicitamente modelado e homologado.
- [ ] Se a mudança ocorrer por aquecimento Joule, o caso passa a E+T+O e conserva o balanço energético.

### 11.3 Dados e interface
- [ ] Cada curva tem origem, método, faixa, fase, temperatura e evidência.
- [ ] Valores medidos, calculados e ajustados aparecem com rótulos diferentes.
- [ ] A interface informa quando não existe dado óptico suficiente.
- [ ] A ausência de dados não é preenchida com valores típicos.
- [ ] O painel único exibe somente os parâmetros necessários à seleção.
- [ ] Reiniciar/cancelar não mantém corrente, fonte, incidência ou resultados residuais.

## 12. Fases de implementação

**Fase A — contrato de dados e auditoria**
- Definir esquema versionado para `n,k` e/ou `ε1,ε2` e `σ1,σ2`.
- Importar um conjunto-piloto de metais com fonte original e faixa claramente registrada.
- Fazer testes de unidades, interpolação, extrapolação e proveniência.
- Manter E+O bloqueada na interface produtiva.

**Fase B — motor óptico espectral**
- Implementar Fresnel para interface plana e meio semi-infinito.
- Validar contra casos de referência publicados.
- Adicionar polarizações s/p e cálculo não polarizado.
- Exibir `R(λ)` sem depender do estímulo elétrico DC.

**Fase C — resposta compartilhada**
- Relacionar o modelo DC e o óptico por uma parametrização comum quando os dados justificarem.
- Ajustar/validar Drude ou Drude–Lorentz por material e intervalo.
- Comparar limite de baixa frequência com condutividade DC quando a aproximação for válida.
- Documentar divergências, anisotropia, temperatura e microestrutura.

**Fase D — efeitos de campo e superfície**
- Investigar eletro-refletância ou não linearidades apenas com dados específicos.
- Adicionar filmes, óxidos, rugosidade, textura e efeitos de interface.
- Manter aquecimento como E+T+O.
- Avaliar excitações coletivas/plásmons em módulo próprio e em condições definidas.

## 13. Decisões que devem ser congeladas antes da implementação

1. E e O compartilham origem eletrônica, mas são funções de frequência distintas.
2. Condutividade DC nunca será usada como atalho para brilho ou refletância visível.
3. A primeira versão quantitativa usará `n(λ), κ(λ)` ou `ε̃(ω)` rastreáveis e Fresnel, começando por uma interface plana.
4. O modo Drude será permitido somente quando o intervalo e o material forem compatíveis; transições interbanda exigem termos adicionais ou dados experimentais.
5. A cor exibida não será inferida apenas de uma refletância em um único comprimento de onda. Uma aparência colorida exige integração espectral com iluminante e observador/primárias declarados.
6. O campo DC não altera automaticamente a resposta óptica.
7. Qualquer efeito de Joule na resposta óptica reclassifica a experiência como E+T+O.
8. E+O permanece bloqueada no SILM até dados e testes do motor óptico serem homologados.

## 14. Referências

1. National Institute of Standards and Technology (NIST). [Calculation of optical constants and dielectric response](https://www.nist.gov/programs-projects/calculation-optical-constants-and-dielectric-response). Relações entre `n`, `k`, função dielétrica, absorção e refletância; dependência de frequência, vetor de onda e polarização.
2. National Institute of Standards and Technology (NIST). [Extreme ultraviolet optical constants](https://www.nist.gov/programs-projects/extreme-ultraviolet-optical-constants). Significado do índice complexo e da extinção/absorção.
3. Polyanskiy, M. N. “Refractiveindex.info database of optical constants”. *Scientific Data*, 11, 94 (2024). [DOI: 10.1038/s41597-023-02898-2](https://doi.org/10.1038/s41597-023-02898-2). Base agregadora de constantes ópticas e proveniência das séries.
4. Ordal, M. A.; Bell, R. J.; Alexander, R. W.; Long, L. L.; Querry, M. R. “Optical properties of fourteen metals in the infrared and far infrared”. *Applied Optics*, 24(24), 4493–4499 (1985). [DOI: 10.1364/AO.24.004493](https://doi.org/10.1364/AO.24.004493). Parâmetros Drude e dados ópticos de 14 metais no infravermelho; comparação entre resistividade óptica e DC.
5. Rosch, A. “Optical conductivity of clean metals”. *Annalen der Physik*, 518, 526–534 (2006). [DOI: 10.1002/andp.200651807-809](https://doi.org/10.1002/andp.200651807-809). Discussão da dependência distinta em frequência e temperatura da condutividade.
6. Stenzel, O.; Wilbrandt, S. “Some Basic Considerations on the Reflectance of Smooth Metal Surfaces: Fresnel’s Formula and More”. *Coatings*, 16(2), 236 (2026). [DOI: 10.3390/coatings16020236](https://doi.org/10.3390/coatings16020236). Revisão sobre refletância de superfícies metálicas, Fresnel e sistemas de filmes.
7. Polyanskiy, M. N. [RefractiveIndex.INFO — database and documentation](https://refractiveindex.info/about). Consultar cada registro, suas condições e a referência original; a licença CC0 do banco não significa garantia de exatidão de cada valor.

---

**Resultado do estudo:** E+O tem uma relação física legítima via resposta eletrônica espectral, mas não é uma interação em que corrente DC “produz brilho”. O modelo quantitativo exige constantes ópticas dependentes do comprimento de onda e uma geometria óptica definida. Até então, preservar as experiências independentes e bloquear a alegação de acoplamento.
