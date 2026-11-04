# SILM — Especificação do acoplamento mecânico-óptico (M+O)

**Status:** especificação científica e operacional — não implementada  
**Branch:** study/silm-coupled-properties-transport-20261104  
**Documentos de base:**
- ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md
- MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md
- ESPECIFICACAO-ACOPLAMENTO-TERMOMECANICO.md
- ESPECIFICACAO-ACOPLAMENTO-ELETROMECANICO.md

---

## 1. Objetivo

Definir como a deformação de uma amostra metálica altera a geometria e a topografia de sua superfície e, por consequência, a distribuição angular da luz refletida.

A primeira versão de M+O deve tratar a relação:

**carregamento mecânico → mudança de forma/superfície → mudança das normais locais → mudança da direção e distribuição da reflexão.**

O modelo inicial não deve alterar automaticamente a cor nem a refletância intrínseca do metal. Esses resultados dependem da resposta óptica espectral do material e de sua superfície, dados que não estão homologados por elemento no SILM.

## 2. Mecanismos distintos

| Mecanismo | Efeito mecânico/óptico | Tratamento |
|---|---|---|
| Orientação/forma macroscópica | A superfície muda de inclinação; a reflexão especular muda de direção | Primeiro nível |
| Topografia por deformação plástica | Bandas de deslizamento que interceptam a superfície podem produzir degraus e rugosidade | Nível posterior, com topografia resolvida |
| Distribuição de microfacetas | Variação de normais locais espalha a reflexão em diferentes direções | Modelo BRDF simplificado/parametrizado |
| Alteração intrínseca das propriedades ópticas por deformação | A deformação pode alterar a resposta eletrônica e óptica espectral | Bloqueada até haver dados n(λ), k(λ) ou ε(ω, deformação) |
| Absorção da luz e aquecimento | Energia absorvida pode aquecer a amostra e alterar sua resposta mecânica | Não é M+O isolado; requer T+M+O |

A experiência deve mostrar qual desses mecanismos está habilitado. Não somar todos num único efeito chamado “brilho”.

## 3. Geometria da superfície deformada

### 3.1 Transformação geométrica

A superfície óptica deve acompanhar a geometria mecânica atualizada, e não continuar usando apenas a configuração de referência.

Se a deformação é representada por uma transformação `x = φ(X)`, cada ponto da superfície inicial X é levado à posição atual x. A orientação local da superfície deve ser calculada pela normal correspondente à geometria deformada.

Para uma superfície parametrizada por u e v:

```
n = normalize(∂x/∂u × ∂x/∂v)
```

A orientação normal é derivada das tangentes da superfície deformada. A normal deve ser recalculada quando o estado mecânico mudar.

### 3.2 Deformação elástica versus plástica
- **Elástica:** ao remover a carga, a geometria deve retornar ao estado de referência (dentro da tolerância do modelo).
- **Plástica:** a alteração geométrica permanente deve permanecer após descarregar.
- **Deslizamento em volume:** não cria automaticamente rugosidade de superfície visível; é necessário que o sistema de deslizamento intercepte a superfície livre e que o modelo represente o deslocamento resultante.
- **Degraus de deslizamento:** podem alterar a topografia local quando bandas/plenos de deslizamento emergem na superfície. Não inventar degraus só porque ocorreu um deslizamento interno.

A malha de superfície deve ser independente da lista de centros atômicos usada para desenhar a célula. Uma superfície geométrica de amostra pode receber orientação e topografia a partir do estado mecânico, mas não deve ser confundida com a própria rede cristalina.

### 3.3 Compressão e tração
- Tração pode alongar a amostra, reduzir a seção transversal e alterar a orientação de facetas.
- Compressão pode encurtar a amostra, expandir lateralmente e alterar as normais de sua superfície.
- A resposta depende de orientação, apoios e distribuição de deformação.
- Não presumir que toda tração torna a superfície opticamente mais rugosa nem que toda compressão a alisa; o sinal depende da topografia inicial, do material, da textura e do modo de ensaio.

## 4. Reflexão especular ideal

Para uma superfície lisa, a direção refletida depende da direção incidente e da normal local:

```
r = i − 2(i · n)n
```

Onde i é o vetor unitário apontando para a superfície, n é a normal unitária orientada corretamente e r é a direção refletida (ajustar a convenção de sinal conforme a direção usada pelo motor).

A lei `θr = θi` permanece válida quando os ângulos são medidos relativamente à normal local. Se a superfície gira ou se inclina por deformação, a direção refletida no referencial da cena também muda.

A primeira demonstração M+O deve permitir observar:
1. superfície na condição inicial;
2. superfície deformada elasticamente;
3. superfície após deslizamento plástico;
4. raio incidente, normal local e raio refletido;
5. retorno da reflexão à geometria inicial quando a deformação elástica é removida.

Nesta fase, não se calcula refletância espectral nem se altera a cor do material.

## 5. Superfícies rugosas e distribuição de reflexão

Uma superfície rugosa é composta por regiões com diferentes orientações locais. A reflexão não é descrita adequadamente por uma única normal global. Uma abordagem comum em óptica aplicada e renderização baseada em física é a função de distribuição bidirecional de refletância (BRDF).

Uma forma microfacetada do modelo Cook–Torrance pode ser escrita, em notação simplificada, como:

```
fr(ωi, ωo, λ) = F(ωi, h, λ) G(ωi, ωo, h) D(h)
                / [4 (n · ωi)(n · ωo)]
```

- F: termo de Fresnel; para metais exige resposta óptica complexa, geralmente descrita por índice de refração complexo n(λ) + i k(λ).
- G: mascaramento e sombreamento entre microfacetas.
- D: distribuição estatística das normais das microfacetas.
- ωi e ωo: direções incidente e de observação.
- h: vetor meia-direção.
- λ: comprimento de onda.

A expressão depende da convenção de BRDF e deve ser implementada com termos, domínios e normalizações consistentes. Não usar uma fórmula de renderização sem validar reciprocidade, positividade e conservação de energia.

A rugosidade redistribui a reflexão angularmente: pode alargar ou deslocar o pico especular e aumentar espalhamento fora da direção especular. Não afirmar que a refletância total sempre diminui simplesmente porque a rugosidade aumenta. A distribuição depende da escala da topografia, do comprimento de onda, dos ângulos e das propriedades ópticas do metal.

### 5.1 Parâmetros de superfície
Para um modo topográfico avançado, registrar, quando disponíveis:
- Sa: rugosidade média aritmética areal;
- Sq: rugosidade quadrática média;
- distribuição de alturas e inclinações;
- comprimento de correlação;
- anisotropia/direção predominante da textura;
- dimensões e orientação das bandas/estrias de deformação;
- escala e resolução da medição.

Esses valores dependem da área e da resolução de medição. Não preencher parâmetros de superfície por metal com valores típicos inventados.

### 5.2 Escala da topografia e limite da rede atômica

A rede cristalina exibida pelo SILM usa espaçamentos atômicos da ordem de angströms; a luz visível tem comprimentos de onda da ordem de centenas de nanômetros. Portanto, é incorreto tratar cada centro atômico desenhado como uma microfaceta independente de reflexão geométrica para luz visível.

A rede cristalina explica mecanismos de deslizamento e possíveis degraus na superfície; a óptica deve operar sobre uma superfície contínua/mesoscópica, com topografia numa escala compatível com o fenômeno óptico. Rugosidade muito menor que o comprimento de onda pode exigir tratamento efetivo ou ondulatório, enquanto uma aproximação de microfacetas pressupõe escalas e estatísticas adequadas.

A primeira versão deve usar uma superfície macroscópica simples e declarar sua escala esquemática.

## 6. Deformação e propriedades ópticas intrínsecas

A deformação também pode, em princípio, alterar a estrutura eletrônica, a anisotropia e a resposta óptica do material. Isso não deve ser confundido com a mudança geométrica da superfície.

Para calcular uma alteração intrínseca de cor ou refletância seriam necessários dados ópticos, tais como:
- índice de refração complexo n(λ) + i k(λ), ou função dielétrica complexa ε(ω);
- faixa espectral e temperatura;
- composição, fase e orientação cristalográfica;
- resposta óptica com estado de deformação/tensão, se a dependência for investigada;
- polarização e ângulo de incidência;
- método, incerteza e fonte.

A condutividade elétrica DC não substitui esses dados. Também não se deve assumir que a cor muda sempre que a amostra é deformada.

**Decisão:** alteração intrínseca da resposta óptica por deformação fica fora da primeira versão M+O. O primeiro modelo altera apenas geometria e distribuição angular.

## 7. Luz absorvida e acoplamento térmico

M+O, isoladamente, pode tratar direção e distribuição da reflexão. Quando a luz absorvida é convertida em calor, surge uma fonte térmica:

```
Qabs = energia absorvida por unidade de tempo e volume
```

A fração absorvida depende do material, comprimento de onda, espessura e condições da superfície. A energia incidente deve ser dividida de maneira consistente entre refletida, absorvida e transmitida (se aplicável).

Ao incluir aquecimento por luz, a experiência deixa de ser apenas M+O e passa a envolver T+M+O. A implementação exige dados de absorção e um balanço energético; a primeira M+O não deve aquecer a amostra por iluminação automaticamente.

## 8. Auditoria do SILM atual

### 8.1 Deformação
O motor de deformação:
- transforma coordenadas da estrutura cristalina;
- representa sistemas de deslizamento CFC, CCC e HC;
- diferencia tração/ductilidade de compressão/maleabilidade;
- mantém deslizamentos permanentes e remove a parcela elástica quando a carga é retirada;
- não possui malha de superfície macroscópica nem rugosidade física calibrada.

### 8.2 Brilho metálico
A vista cristalina:
- identifica os centros da camada superior na geometria de referência;
- posiciona a lanterna a partir do centro médio da face superior;
- usa um único ângulo em relação a uma normal global implícita;
- desenha o feixe incidente e refletido como sobreposição na cena;
- não calcula BRDF, Fresnel metálico, rugosidade ou refletância espectral.

O controlador de ângulo em `drive.js` limita o ângulo de iluminação e devolve a mesma magnitude para incidência/reflexão. Isso é coerente para a demonstração de plano ideal, mas não atualiza uma normal local por deformação.

### 8.3 Consequências
A vista atual demonstra a lei geométrica de reflexão para uma superfície de referência. Ainda não demonstra a mudança física da reflexão causada pela deformação. Para integrar M+O, será necessário criar/usar uma superfície óptica que receba a transformação mecânica e forneça normais atuais.

A seleção múltipla precisa representar a composição dos estados de mecânica e óptica. Não executar somente a opção de brilho e esquecer a deformação nem executar duas transformações independentes que sobrescrevam coordenadas umas das outras.

## 9. Experiência M+O proposta

### 9.1 Condições mecânicas
- Compressão OU tração na primeira versão.
- Controle por força/tensão OU deslocamento/deformação.
- Estado inicial, apoios e direção de carregamento.
- Deformação elástica ou deslizamento plástico didático.
- A superfície óptica acompanha a transformação mecânica.

### 9.2 Condições ópticas
- Luz incidente ligada/desligada.
- Direção/ângulo de incidência.
- Observador/câmera ou direção de observação.
- Normal local da superfície no ponto iluminado.
- Modo de superfície: ideal lisa na primeira versão; topografia parametrizada em fase posterior.

### 9.3 Resultados visíveis
- superfície na configuração inicial e atual;
- normal local no ponto de incidência;
- vetor incidente e refletido;
- ângulos incidentes/refletidos medidos pela normal local;
- orientação da reflexão no referencial da cena;
- modo de modelo: especular ideal, microfacetado didático ou BRDF quantitativa.

### 9.4 Painel único
O painel permanece único e mostra blocos de condição mecânica e óptica somente quando M+O for selecionado. O usuário não deve receber menu contextual separado por propriedade.

**Grupo mecânico:** modo (compressão/tração), controle, intensidade/valor válido, apoio.  
**Grupo óptico:** iluminação, ângulo, ponto/região de incidência e modo de superfície.  
**Resultados:** normal local e direção refletida, com aviso de que a primeira versão é geométrica.

## 10. Estado conceitual

    type MechanicalMode = "compression" | "tension";
    type OpticalSurfaceMode = "ideal-smooth" | "topography-parametric" | "brdf-measured";
    type MechanicalState = "elastic" | "plastic";

    interface MechOpticalExperiment {
      mechanical: {
        mode: MechanicalMode;
        state: MechanicalState;
        control: "force-stress" | "displacement-strain";
        constraint: "free" | "supported" | "restrained";
      };
      optics: {
        enabled: boolean;
        incidenceDirection: [number, number, number];
        observationDirection?: [number, number, number];
        surfaceMode: OpticalSurfaceMode;
        wavelengthNm?: number;
        polarization?: "s" | "p" | "unpolarized";
      };
      surface: {
        geometrySource: "deformed-macrosurface";
        localNormal?: [number, number, number];
        roughnessSa?: number;
        roughnessSq?: number;
        correlationLength?: number;
        textureDirection?: [number, number, number];
        dataStatus: "schematic" | "parameterized" | "measured";
      };
      materialOptics: {
        status: "not-modeled" | "parameterized" | "measured";
        n?: number;
        k?: number;
        sourceId?: string;
      };
      results: {
        reflectedDirection?: [number, number, number];
        angularDistribution?: unknown;
        spectralReflectance?: unknown;
      };
    }

Este é um contrato conceitual. Para BRDF quantitativa, n e k devem ser funções da frequência/comprimento de onda, não números únicos sem faixa. A geometria da superfície deve ser compartilhada pela física mecânica e pela óptica, mas os resultados ópticos devem ficar separados do estado de deformação.

## 11. Critérios de aceite e testes

### 11.1 Reflexão geométrica
- [ ] Sem deformação, o caso inicial reproduz a direção refletida atual.
- [ ] Plano ideal obedece θr = θi relativamente à normal local.
- [ ] Ao inclinar uma superfície, o raio refletido muda de direção no referencial da cena.
- [ ] A normal calculada é perpendicular às tangentes locais.
- [ ] A reflexão permanece consistente ao girar a câmera; câmera não altera a física.
- [ ] Normal e direção refletida são recalculadas após atualizar a deformação.

### 11.2 Elasticidade e plasticidade
- [ ] Remover carga elástica retorna a superfície e a reflexão ao estado inicial.
- [ ] Deslizamentos plásticos permanecem após descarregar e a superfície só muda onde o modelo de topografia justificar.
- [ ] Deslizamento interno sem interseção com a superfície não cria degrau visual artificial.
- [ ] Alterar a deformação não muda a cor nem a refletância intrínseca no modo geométrico.

### 11.3 Rugosidade e BRDF
- [ ] Distribuição de normais e escala da topografia são explicitadas.
- [ ] Aumentar a dispersão de normais alarga/redistribui o lobo especular de modo coerente com o modelo, sem forçar redução universal da refletância total.
- [ ] BRDF é não negativa e recíproca dentro da convenção implementada.
- [ ] A energia refletida integrada não excede a energia incidente disponível.
- [ ] Material metálico requer parâmetros de Fresnel espectrais para refletância quantitativa.
- [ ] Parâmetros medidos trazem escala, resolução, condições e fonte.

### 11.4 Interface
- [ ] M+O preserva simultaneamente o estado mecânico e o óptico.
- [ ] A normal local e os raios são visíveis como grandezas distintas.
- [ ] O modo geométrico não apresenta cor ou refletância material como resultado calculado.
- [ ] A superfície de rede atômica não é usada como microfacetagem literal para luz visível.
- [ ] O painel mostra apenas condições necessárias a M+O.
- [ ] Aplicar/cancelar/reiniciar não deixa transformações parciais.

## 12. Fases de implementação

**Fase A — reflexão sobre superfície deformada ideal**
- Criar uma superfície macroscópica esquemática com transformação mecânica.
- Calcular a normal atual.
- Atualizar a direção dos raios incidente/refletido.
- Preservar cor e intensidade aparente, sem atribuir nova refletância física.
- Validar reversibilidade elástica e permanência plástica.

**Fase B — topografia qualitativa**
- Representar degraus/estrias superficiais apenas quando relacionados a deslizamentos que interceptam a superfície.
- Calcular distribuição de normais da superfície.
- Mostrar redistribuição angular qualitativa.
- Marcar claramente a escala esquemática.

**Fase C — microfacetado parametrizado**
- Adotar BRDF adequada e validar geometria, Fresnel, mascaramento/sombreamento e conservação.
- Inserir parâmetros de rugosidade e anisotropia com escala.
- Separar visualização da simulação física de renderização.

**Fase D — óptica quantitativa dependente da deformação**
- Homologar n(λ), k(λ) ou ε(ω) e sua dependência de tensão/deformação quando relevante.
- Medir BRDF espectral em amostras deformadas com condições conhecidas.
- Validar a resposta com gonioreflectometria/espectrofotometria.
- Incluir absorção e aquecimento apenas ao integrar T+M+O.

## 13. Decisões que devem ser congeladas antes de implementar

1. A primeira versão M+O deve usar uma superfície macroscópica esquemática, não os centros atômicos como espelhos.
2. A primeira interação modifica apenas a geometria e a direção refletida.
3. A iluminação continuará usando a mesma lei especular, mas com normal local atualizada.
4. A deformação elástica será reversível; a topografia plástica só muda quando o mecanismo modelado justificar.
5. Rugosidade e distribuição angular entram em uma fase posterior, com uma escala física declarada.
6. Cor, refletância quantitativa e alteração intrínseca das constantes ópticas exigem dados espectrais por material.
7. Se a absorção luminosa passar a aquecer a amostra, classificar a atividade como T+M+O e calcular energia absorvida.

## 14. Referências consultadas

1. Clausen, P. et al. “Investigation and Simulation of Diffraction on Rough Surfaces”. *Computer Graphics Forum*, 42(1), 245–260, 2023. DOI: 10.1111/cgf.14717. https://onlinelibrary.wiley.com/doi/full/10.1111/cgf.14717 — medições de BRDF espectral e topografia em alumínio com diferentes rugosidades; mostra efeitos de espalhamento e deslocamentos espectrais que não podem ser reduzidos a uma única lei geométrica.
2. Zaiser, M.; Grasset, F. M.; Koutsos, V.; Aifantis, E. C. “Self-affine surface morphology of plastically deformed metals”. *Physical Review Letters*, 93, 195507, 2004. DOI: 10.1103/PhysRevLett.93.195507. https://pubmed.ncbi.nlm.nih.gov/15600851/ — morfologia de superfície e rugosidade produzidas por deformação plástica em várias escalas.
3. Prokhorov, A.; Hanssen, L. “Algorithmic Model of Microfacet BRDF for Monte Carlo Calculation of Optical Radiation Transfer”. NIST, 2003. https://www.nist.gov/publications/algorithmic-model-microfacet-brdf-monte-carlo-calculation-optical-radiation-transfer-0 — normais de microfacetas e distribuição de reflexão em superfícies rugosas.
4. “Study on the BRDF for the Surfaces of Typical Metal Materials”. *Coatings*, 15(3), 344, 2025. https://www.mdpi.com/2079-6412/15/3/344 — medidas de BRDF em metais e relações com microfacetas/superfícies processadas.
5. Kavoosighafi, M. et al. “Deep SVBRDF Acquisition and Modelling: A Survey”. *Computer Graphics Forum*, 2024. DOI: 10.1111/cgf.15199. https://onlinelibrary.wiley.com/doi/10.1111/cgf.15199 — parâmetros de superfície, normais, rugosidade e modelos de reflectância espacialmente variáveis.

**Decisão de segurança científica:** a primeira M+O demonstra a resposta direcional da reflexão à geometria deformada. Ela não pode inferir cor, intensidade refletida real, rugosidade medida ou alteração intrínseca da resposta óptica sem parâmetros e validação apropriados.
